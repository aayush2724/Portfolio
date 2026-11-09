"""Repositories the owner has chosen to monitor. Schema lands in M1 so the
knowledge base can reference it; sync logic arrives in M3."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Computed, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MonitoredRepository(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "monitored_repositories"
    __table_args__ = (UniqueConstraint("owner", "name"),)

    owner: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(100))
    full_name: Mapped[str] = mapped_column(String(201), Computed("owner || '/' || name", persisted=True))
    default_branch: Mapped[str] = mapped_column(String(100), default="main", server_default="main")
    is_private: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    project_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("projects.id", ondelete="SET NULL"))
    poll_cursor_sha: Mapped[str | None] = mapped_column(String(64))
    poll_cursor_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    etag_commits: Mapped[str | None] = mapped_column(String(200))
    etag_releases: Mapped[str | None] = mapped_column(String(200))
    last_sync_run_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True))
    added_by: Mapped[str | None] = mapped_column(String(80))
