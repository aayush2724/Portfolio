"""Regression tests for the pre-handoff review: spend on aborted streams,
trusted-hop client addresses, and the 30-day retention promise."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from starlette.requests import Request

from app.assistant.clientip import client_ip
from app.assistant.retention import purge_expired
from app.assistant.schemas import ChatRequest
from app.assistant.service import AssistantService
from app.config import get_settings
from app.db.models import ConversationMessage, LlmCall, VisitorSession
from app.db.session import get_sessionmaker
from app.knowledge.seed import seed_all
from app.llm.fake import FakeProvider
from app.llm.provider import Usage
from tests.test_assistant_api import install


async def test_spend_is_recorded_when_the_visitor_disconnects_mid_stream(db, seed_data):
    await seed_all(db, seed_data)
    svc = AssistantService(get_settings(), FakeProvider(usage=Usage()))  # no usage chunk, like an aborted stream
    prepared = await svc.prepare(ChatRequest(session_id=uuid.uuid4(), message="Explain Auralis"), "203.0.113.9", db)
    seen = {"deltas": 0}

    async def disconnected() -> bool:
        return seen["deltas"] >= 1

    async for chunk in svc.stream(prepared, get_sessionmaker(), disconnected):
        if chunk.startswith(b"event: delta"):
            seen["deltas"] += 1
    calls = (await db.execute(select(LlmCall))).scalars().all()
    assert len(calls) == 1 and calls[0].outcome == "disconnected" and calls[0].tokens_in > 0


def _req(xff: str) -> Request:
    headers = [(b"x-forwarded-for", xff.encode())] if xff else []
    return Request({"type": "http", "headers": headers, "client": ("10.0.0.5", 1234)})


def test_client_ip_uses_the_trusted_hop_not_the_forgeable_leftmost_entry():
    assert client_ip(_req("1.1.1.1, 198.51.100.7"), 1) == "198.51.100.7"  # visitor forged 1.1.1.1
    assert client_ip(_req("198.51.100.7"), 1) == "198.51.100.7"
    assert client_ip(_req("1.1.1.1, 198.51.100.7"), 0) == "10.0.0.5"
    assert client_ip(_req(""), 1) == "10.0.0.5"


async def test_rotating_a_forged_left_entry_does_not_escape_the_ip_limit(client, db, seed_data):
    from app.main import app

    await seed_all(db, seed_data)
    install(app, FakeProvider(), rate_limit_per_ip=2, trusted_proxy_hops=1)
    sid = str(uuid.uuid4())
    codes = []
    for i in range(3):
        r = await client.post(
            "/api/v1/assistant/chat",
            json={"session_id": sid, "message": "hi"},
            headers={"X-Forwarded-For": f"9.9.9.{i}, 198.51.100.7"},
        )
        codes.append(r.status_code)
    assert codes == [200, 200, 429]


async def test_purge_removes_only_expired_visitor_records(db):
    old = datetime.now(UTC) - timedelta(days=45)
    stale = VisitorSession(session_key="a" * 64, first_seen_at=old, last_seen_at=old, message_count=1)
    fresh = VisitorSession(session_key="b" * 64, message_count=1)
    db.add_all([stale, fresh])
    await db.flush()
    db.add_all(
        [
            ConversationMessage(session_id=stale.id, role="user", created_at=old),
            ConversationMessage(session_id=fresh.id, role="user"),
        ]
    )
    await db.commit()
    counts = await purge_expired(db, 30)
    assert counts == {"messages": 1, "sessions": 1}
    remaining = (await db.execute(select(VisitorSession))).scalars().all()
    assert [s.session_key for s in remaining] == ["b" * 64]


async def test_the_answer_deadline_ends_the_stream_promptly(db, seed_data):
    import asyncio
    import time

    from app.llm.provider import StreamDelta

    class Slow(FakeProvider):
        async def stream(self, *, model, messages, max_tokens, temperature=0.3):
            await asyncio.sleep(30)  # a reasoning model thinking with nothing to show
            yield StreamDelta("late")

    await seed_all(db, seed_data)
    svc = AssistantService(get_settings().model_copy(update={"assistant_timeout_seconds": 1.0}), Slow())
    prepared = await svc.prepare(ChatRequest(session_id=uuid.uuid4(), message="Explain Auralis"), "203.0.113.9", db)

    async def connected() -> bool:
        return False

    started = time.monotonic()
    chunks = [c async for c in svc.stream(prepared, get_sessionmaker(), connected)]
    assert time.monotonic() - started < 5
    assert any(b"llm_timeout" in c for c in chunks)


async def test_the_daily_request_cap_protects_the_free_quota(client, db, seed_data):
    from app.llm.budget import record_call
    from app.main import app

    await seed_all(db, seed_data)
    for _ in range(3):
        await record_call(
            db,
            workflow="assistant_answer",
            provider="fake",
            model="x:free",
            usage=Usage(prompt_tokens=10, completion_tokens=10, cost_usd=0.0),
            latency_ms=1,
        )
    await db.commit()
    install(app, FakeProvider(), llm_daily_request_cap=3)
    status = (await client.get("/api/v1/assistant/status")).json()
    assert status["live"] is False and status["reason"] == "daily_request_cap"
    r = await client.post(
        "/api/v1/assistant/chat", json={"session_id": str(uuid.uuid4()), "message": "Explain Auralis"}
    )
    assert r.status_code == 503 and r.json()["error"]["code"] == "budget_exhausted"
