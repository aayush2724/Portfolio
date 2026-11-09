"""Visitor sessions and per-message metrics. Message text is stored only when
`STORE_CONVERSATIONS=true`; by default these rows carry numbers, not words."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class VisitorSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "visitor_sessions"

    session_key: Mapped[str] = mapped_column(String(64), unique=True)  # sha256 of the client id
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    message_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    project_context_slug: Mapped[str | None] = mapped_column(String(64))


class ConversationMessage(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "conversation_messages"
    __table_args__ = (Index("ix_conversation_messages_session_created", "session_id", "created_at"),)

    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("visitor_sessions.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(16))  # user | assistant
    intent: Mapped[str | None] = mapped_column(String(40))
    project_slug: Mapped[str | None] = mapped_column(String(64))
    tools_used: Mapped[list[str]] = mapped_column(ARRAY(String(40)), default=list, server_default="{}")
    tokens_in: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    tokens_out: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    latency_ms: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    grounding_dropped: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    outcome: Mapped[str] = mapped_column(String(24), default="ok", server_default="ok")  # ok | limited | error | canned
    content: Mapped[str | None] = mapped_column(Text)  # only when STORE_CONVERSATIONS=true
    rating: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
