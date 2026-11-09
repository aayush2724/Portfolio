"""The visitor assistant: validate → limit → route → tools → evidence →
generate (streamed) → ground → persist metrics. One class, no agent loop;
the only model calls are an optional planning call for ambiguous questions
and the answer itself."""

from __future__ import annotations

import asyncio
import contextlib
import hashlib
import json
import time
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable
from dataclasses import dataclass, field
from datetime import UTC, datetime

import structlog
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.api.errors import ApiError
from app.assistant import prompts
from app.assistant.evidence import EvidencePack, build_pack
from app.assistant.grounding import ground
from app.assistant.ratelimit import DailyCounter, SlidingWindowLimiter, hash_key
from app.assistant.retention import purge_expired
from app.assistant.router import IntentRouter
from app.assistant.schemas import AssistantStatus, ChatRequest, Intent, LlmPlan, Plan, ToolCall, ToolName
from app.assistant.sse import HEARTBEAT, sse
from app.assistant.tools import ToolArgError, ToolResult, run_tool
from app.config import Settings
from app.db.models import ConversationMessage, VisitorSession
from app.knowledge import retrieval
from app.knowledge.schemas import ProjectSummary
from app.llm.budget import calls_today, load_prices, record_call, spent_today
from app.llm.provider import (
    ChatProvider,
    Completion,
    LLMBadResponse,
    LLMError,
    LLMRateLimited,
    LLMTimeout,
    StreamDelta,
    Usage,
)

log = structlog.get_logger("assistant")

PROJECTS_CACHE_SECONDS = 120


async def _cancel(task: asyncio.Future) -> None:
    """Cancel a pending stream read and wait for it to unwind. Without the wait, closing the
    generator afterwards blocks until the upstream response finishes on its own (seen: 113 s)."""
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError, StopAsyncIteration, Exception):
        await task


@dataclass(slots=True)
class Prepared:
    request: ChatRequest
    session_key: str
    ip_key: str
    projects: list[ProjectSummary]
    context: ProjectSummary | None
    started: float = field(default_factory=time.perf_counter)


class AssistantService:
    def __init__(self, settings: Settings, provider: ChatProvider | None) -> None:
        self.settings = settings
        self.provider = provider
        self.prices = load_prices(settings.llm_prices_json)
        self.ip_limiter = SlidingWindowLimiter(settings.rate_limit_per_ip, settings.rate_limit_window_seconds)
        self.session_counter = DailyCounter(settings.rate_limit_per_session_daily)
        self._projects: tuple[float, list[ProjectSummary]] | None = None
        # Purge expired visitor records on the first write after start and then at most daily.
        # On Render's free tier every wake is a fresh process, so the first question after a nap purges.
        self.purge_interval_seconds = 24 * 3600
        self._last_purge: float | None = None

    # ── status ────────────────────────────────────────────────────────────
    async def status(self, session: AsyncSession) -> AssistantStatus:
        if self.provider is None:
            return AssistantStatus(live=False, reason="not_configured")
        if await spent_today(session) >= self.settings.llm_daily_budget_usd:
            return AssistantStatus(
                live=False, reason="budget_exhausted", provider=self.provider.name, model=self.settings.llm_chat_model
            )
        if await calls_today(session) >= self.settings.llm_daily_request_cap:
            return AssistantStatus(
                live=False, reason="daily_request_cap", provider=self.provider.name, model=self.settings.llm_chat_model
            )
        return AssistantStatus(live=True, provider=self.provider.name, model=self.settings.llm_chat_model)

    async def projects(self, session: AsyncSession) -> list[ProjectSummary]:
        now = time.monotonic()
        if self._projects and now - self._projects[0] < PROJECTS_CACHE_SECONDS:
            return self._projects[1]
        projects = await retrieval.list_projects(session, public=True)
        self._projects = (now, projects)
        return projects

    # ── request gate (runs before the stream starts so the status code is honest) ──
    async def prepare(self, request: ChatRequest, client_ip: str, session: AsyncSession) -> Prepared:
        if self.provider is None:
            raise ApiError(503, "assistant_offline", "The assistant is not configured on this deployment")
        ip_key = hash_key(client_ip or "unknown", self.settings.rate_limit_salt)
        allowed, retry_after = self.ip_limiter.check(ip_key)
        if not allowed:
            raise ApiError(
                429,
                "rate_limited",
                "Too many questions from this network; try again shortly",
                headers={"Retry-After": str(retry_after)},
            )
        session_key = hashlib.sha256(str(request.session_id).encode()).hexdigest()
        if not self.session_counter.check(session_key):
            raise ApiError(
                429,
                "session_limited",
                "This session has reached today's question limit",
                headers={"Retry-After": "3600"},
            )
        if await spent_today(session) >= self.settings.llm_daily_budget_usd:
            raise ApiError(
                503, "budget_exhausted", "The assistant is resting for today; the scripted guide still works"
            )
        if await calls_today(session) >= self.settings.llm_daily_request_cap:
            # Same client behaviour as the dollar budget: the scripted guide answers for the rest of the day.
            raise ApiError(
                503, "budget_exhausted", "The assistant is resting for today; the scripted guide still works"
            )
        projects = await self.projects(session)
        context = next((p for p in projects if p.slug == request.project_slug), None) if request.project_slug else None
        return Prepared(request=request, session_key=session_key, ip_key=ip_key, projects=projects, context=context)

    # ── planning ─────────────────────────────────────────────────────────
    async def plan(self, prepared: Prepared, session: AsyncSession) -> Plan:
        router = IntentRouter(prepared.projects)
        plan = router.route(prepared.request.message, prepared.context.slug if prepared.context else None)
        if plan.intent != Intent.ambiguous or self.provider is None:
            return plan
        try:
            completion = await asyncio.wait_for(
                self.provider.complete(
                    model=self.settings.llm_chat_model,
                    messages=prompts.build_plan_messages(
                        prepared.request.message,
                        sorted(router.slugs),
                        prepared.context.slug if prepared.context else None,
                    ),
                    max_tokens=300,
                    temperature=0.0,
                    json_mode=True,
                ),
                timeout=self.settings.llm_timeout_seconds,
            )
            await record_call(
                session,
                workflow="assistant_plan",
                provider=self.provider.name,
                model=completion.model,
                usage=completion.usage,
                latency_ms=completion.latency_ms,
                prices=self.prices,
            )
            raw = completion.text.strip()
            if raw.startswith("```"):
                raw = raw.strip("`").split("\n", 1)[-1]
            parsed = LlmPlan.model_validate(json.loads(raw))
            if parsed.intent in (Intent.smalltalk, Intent.off_topic) and not parsed.tools:
                return Plan(intent=parsed.intent, tools=[], source="llm")
            tools = [t for t in parsed.tools if self._args_reference_known_slugs(t, router.slugs)][
                : self.settings.assistant_max_tools
            ]
            if not tools:
                raise ValueError("planner returned no usable tools")
            return Plan(intent=parsed.intent, tools=tools, source="llm")
        except (TimeoutError, LLMError, ValidationError, ValueError, TypeError) as exc:
            log.info("plan_fallback", reason=type(exc).__name__)
            return plan

    @staticmethod
    def _args_reference_known_slugs(call: ToolCall, slugs: set[str]) -> bool:
        for key in ("project_slug", "project_a", "project_b"):
            value = call.args.get(key)
            if value is not None and value not in slugs:
                return False
        return True

    async def run_tools(self, plan: Plan, session: AsyncSession) -> list[ToolResult]:
        results: list[ToolResult] = []
        for call in plan.tools[: self.settings.assistant_max_tools]:
            try:
                results.append(await asyncio.wait_for(run_tool(session, call), timeout=10))
            except ToolArgError as exc:
                log.info("tool_args_rejected", tool=call.name.value, reason=str(exc))
            except TimeoutError:
                log.warning("tool_timeout", tool=call.name.value)
        # A skill question ("explain the RAG pipeline in one of your projects") finds the project via
        # technology mentions, which carry little explanation. Add the strongest match's architecture.
        if plan.intent == Intent.skill_evidence and len(results) < self.settings.assistant_max_tools:
            top = next((p for r in results for p in r.projects), None)
            if top is not None:
                try:
                    call = ToolCall(name=ToolName.get_project_architecture, args={"project_slug": top.slug})
                    results.append(await asyncio.wait_for(run_tool(session, call), timeout=10))
                except (ToolArgError, TimeoutError):
                    pass
        return results

    # ── the stream ──────────────────────────────────────────────────────
    async def stream(
        self,
        prepared: Prepared,
        session_factory: async_sessionmaker[AsyncSession],
        is_disconnected: Callable[[], Awaitable[bool]],
    ) -> AsyncIterator[bytes]:
        req = prepared.request
        outcome = "ok"
        intent = Intent.ambiguous
        tools_used: list[str] = []
        usage = Usage()
        model = self.settings.llm_chat_model
        final_text = ""
        dropped = 0
        pack = EvidencePack()
        answer_started = False
        prompt_chars = 0
        try:
            async with session_factory() as session:
                plan = await self.plan(prepared, session)
                intent = plan.intent
                tools_used = [t.name.value for t in plan.tools]
                results = await self.run_tools(plan, session) if plan.tools else []
                await session.commit()
            pack = build_pack(results, max_chars=self.settings.assistant_evidence_max_chars)
            yield sse(
                "meta",
                {
                    "intent": intent.value,
                    "project_slug": prepared.context.slug if prepared.context else None,
                    "tools": tools_used,
                    "evidence_count": len(pack.items),
                    "link_hosts": pack.link_hosts(),
                    "plan_source": plan.source,
                },
            )

            if intent == Intent.smalltalk:
                final_text = prompts.CANNED["greeting"]
                outcome = "canned"
            elif not pack.items:
                final_text = (
                    prompts.CANNED["off_topic"] if intent == Intent.off_topic else prompts.CANNED["no_evidence"]
                )
                outcome = "canned"
            else:
                messages = prompts.build_answer_messages(
                    pack=pack, history=req.history, message=req.message, intent=intent, context=prepared.context
                )
                completion: Completion | None = None
                answer_started = True
                prompt_chars = sum(len(m["content"]) for m in messages)
                deadline = time.monotonic() + self.settings.assistant_timeout_seconds
                agen = self.provider.stream(
                    model=self.settings.llm_chat_model,
                    messages=messages,
                    max_tokens=self.settings.assistant_max_output_tokens,
                )
                try:
                    pending = asyncio.ensure_future(agen.__anext__())
                    while True:
                        remaining = deadline - time.monotonic()
                        if remaining <= 0:
                            await _cancel(pending)
                            raise LLMTimeout("answer took too long")
                        done, _ = await asyncio.wait({pending}, timeout=min(10.0, remaining))
                        if not done:
                            if await is_disconnected():
                                await _cancel(pending)
                                outcome = "disconnected"
                                return
                            yield HEARTBEAT
                            continue
                        try:
                            event = pending.result()
                        except StopAsyncIteration:
                            break
                        if isinstance(event, StreamDelta):
                            final_text += event.text
                            yield sse("delta", {"text": event.text})
                            if await is_disconnected():
                                outcome = "disconnected"
                                return
                        else:
                            completion = event
                        pending = asyncio.ensure_future(agen.__anext__())
                finally:
                    await agen.aclose()
                if completion is not None:
                    usage, model = completion.usage, completion.model
                    final_text = completion.text or final_text
                if completion is not None and completion.finish_reason == "length" and final_text.strip():
                    final_text = (
                        final_text.rstrip()
                        + "\n\n_This answer was cut short. Ask about one part of it for more detail._"
                    )
                if not final_text.strip():
                    # A reasoning model can spend its whole budget thinking; an empty answer is a
                    # failure, so the visitor gets the scripted guide instead of a blank bubble.
                    raise LLMBadResponse("model returned no answer text")
                grounded = ground(final_text, pack)
                final_text, dropped = grounded.text, grounded.dropped
                yield sse("final", {"text": final_text, "grounding_dropped": dropped})
                yield sse("sources", [s.model_dump() for s in pack.sources(grounded.cited)])
            if outcome == "canned":
                yield sse("final", {"text": final_text, "grounding_dropped": 0})
                yield sse("sources", [])
        except LLMRateLimited:
            outcome = "error"
            yield sse(
                "error",
                {"code": "llm_rate_limited", "message": "The model provider is busy; please try again in a moment."},
            )
        except LLMTimeout:
            outcome = "error"
            yield sse(
                "error", {"code": "llm_timeout", "message": "The answer took too long; please try a shorter question."}
            )
        except LLMError as exc:
            outcome = "error"
            log.warning("llm_error", error=str(exc), status=exc.status)
            # 402: no credits / free quota used up; 404: the (free) model was withdrawn. Both mean
            # "unavailable until someone changes configuration", so the client falls back for good.
            code = "llm_unavailable" if exc.status in (402, 404) else "llm_error"
            yield sse("error", {"code": code, "message": "The model provider returned an error; please try again."})
        except Exception:  # noqa: BLE001 - the stream must end with a typed event, never a stack trace
            outcome = "error"
            log.exception("assistant_stream_failed")
            yield sse("error", {"code": "internal", "message": "Something went wrong on our side."})
        finally:
            latency_ms = int((time.perf_counter() - prepared.started) * 1000)
            message_id = await self._persist(
                session_factory,
                prepared,
                intent,
                tools_used,
                usage,
                model,
                latency_ms,
                dropped,
                outcome,
                final_text,
                answer_started=answer_started,
                prompt_chars=prompt_chars,
            )
            if outcome != "disconnected":
                yield sse(
                    "done",
                    {
                        "message_id": str(message_id) if message_id else None,
                        "tokens_in": usage.prompt_tokens,
                        "tokens_out": usage.completion_tokens,
                        "latency_ms": latency_ms,
                        "model": model if outcome == "ok" else None,
                        "outcome": outcome,
                    },
                )

    async def _persist(
        self,
        session_factory,
        prepared: Prepared,
        intent: Intent,
        tools_used: list[str],
        usage: Usage,
        model: str,
        latency_ms: int,
        dropped: int,
        outcome: str,
        final_text: str,
        *,
        answer_started: bool = False,
        prompt_chars: int = 0,
    ) -> uuid.UUID | None:
        try:
            async with session_factory() as session:
                now = datetime.now(UTC)
                visitor = (
                    await session.execute(
                        select(VisitorSession).where(VisitorSession.session_key == prepared.session_key)
                    )
                ).scalar_one_or_none()
                if visitor is None:
                    visitor = VisitorSession(
                        session_key=prepared.session_key, first_seen_at=now, last_seen_at=now, message_count=0
                    )
                    session.add(visitor)
                    await session.flush()
                visitor.last_seen_at = now
                visitor.message_count += 1
                visitor.project_context_slug = (
                    prepared.context.slug if prepared.context else visitor.project_context_slug
                )
                store = self.settings.store_conversations
                session.add(
                    ConversationMessage(
                        session_id=visitor.id,
                        role="user",
                        intent=intent.value,
                        project_slug=prepared.context.slug if prepared.context else None,
                        content=prepared.request.message if store else None,
                    )
                )
                reply = ConversationMessage(
                    session_id=visitor.id,
                    role="assistant",
                    intent=intent.value,
                    project_slug=prepared.context.slug if prepared.context else None,
                    tools_used=tools_used,
                    tokens_in=usage.prompt_tokens,
                    tokens_out=usage.completion_tokens,
                    latency_ms=latency_ms,
                    grounding_dropped=dropped,
                    outcome=outcome,
                    content=final_text if store else None,
                )
                session.add(reply)
                if answer_started and self.provider is not None:
                    # Spend is recorded for every outcome once the answer model ran: a visitor who
                    # disconnects mid-stream was still billed for the prompt. Without a usage chunk
                    # (aborted or failed stream) tokens are estimated at four characters per token.
                    if not (usage.prompt_tokens or usage.completion_tokens):
                        usage = Usage(prompt_tokens=prompt_chars // 4 + 1, completion_tokens=len(final_text) // 4)
                    await record_call(
                        session,
                        workflow="assistant_answer",
                        provider=self.provider.name,
                        model=model,
                        usage=usage,
                        latency_ms=latency_ms,
                        outcome=outcome,
                        prices=self.prices,
                    )
                await session.commit()
                now_mono = time.monotonic()
                if self._last_purge is None or now_mono - self._last_purge >= self.purge_interval_seconds:
                    self._last_purge = now_mono
                    await purge_expired(session, self.settings.conversation_retention_days)
                return reply.id
        except Exception:  # noqa: BLE001
            log.exception("assistant_persist_failed")
            return None

    async def feedback(
        self, session: AsyncSession, *, session_id: uuid.UUID, message_id: uuid.UUID, rating: int
    ) -> bool:
        key = hashlib.sha256(str(session_id).encode()).hexdigest()
        row = (
            await session.execute(
                select(ConversationMessage)
                .join(VisitorSession, VisitorSession.id == ConversationMessage.session_id)
                .where(ConversationMessage.id == message_id, VisitorSession.session_key == key)
            )
        ).scalar_one_or_none()
        if row is None:
            return False
        row.rating = rating
        await session.commit()
        return True
