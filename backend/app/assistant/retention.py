"""Removes visitor records older than the retention window (privacy.html
promises 30 days). Runs opportunistically from the request path and from
`python -m app.cli purge`, so it does not depend on a scheduler that the
Render free tier cannot keep alive."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ConversationMessage, VisitorSession


async def purge_expired(session: AsyncSession, days: int, *, now: datetime | None = None) -> dict[str, int]:
    cutoff = (now or datetime.now(UTC)) - timedelta(days=days)
    messages = await session.execute(delete(ConversationMessage).where(ConversationMessage.created_at < cutoff))
    sessions = await session.execute(delete(VisitorSession).where(VisitorSession.last_seen_at < cutoff))
    await session.commit()
    return {"messages": messages.rowcount or 0, "sessions": sessions.rowcount or 0}
