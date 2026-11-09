"""The project knowledge base: projects, their evidence sources, typed facts
with a truth status, and the append-only version history of every fact."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    Computed,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


def _enum(cls: type[enum.Enum], name: str) -> SAEnum:
    return SAEnum(cls, name=name, values_callable=lambda e: [m.value for m in e])


class ProjectStatus(str, enum.Enum):
    active = "active"
    archived = "archived"
    candidate = "candidate"  # on GitHub, not yet published on the site


class Attribution(str, enum.Enum):
    sole = "sole"
    co_built = "co_built"
    contributor = "contributor"


class SourceKind(str, enum.Enum):
    readme = "readme"
    file = "file"
    commit = "commit"
    pr = "pr"
    release = "release"
    portfolio_copy = "portfolio_copy"
    manual = "manual"


class FactType(str, enum.Enum):
    description = "description"
    architecture = "architecture"
    component = "component"
    feature = "feature"
    technology = "technology"
    decision = "decision"
    api = "api"
    data_flow = "data_flow"
    challenge = "challenge"
    milestone = "milestone"
    metric = "metric"
    role = "role"


class FactStatus(str, enum.Enum):
    implemented = "implemented"  # backed by README / source / commits we have seen
    partial = "partial"
    planned = "planned"
    claimed = "claimed"  # portfolio copy with no repository evidence yet


class ProducedBy(str, enum.Enum):
    seed = "seed"
    readme_ingest = "readme_ingest"
    analysis = "analysis"
    admin = "admin"


class SkillStrength(str, enum.Enum):
    weak = "weak"
    medium = "medium"
    strong = "strong"


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    tagline: Mapped[str | None] = mapped_column(String(200))
    summary: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ProjectStatus] = mapped_column(_enum(ProjectStatus, "project_status"), default=ProjectStatus.active)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    attribution: Mapped[Attribution | None] = mapped_column(_enum(Attribution, "attribution"))
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    repo_full_name: Mapped[str | None] = mapped_column(String(200), index=True)
    repo_url: Mapped[str | None] = mapped_column(String(300))
    repo_is_private: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    repo_default_branch: Mapped[str | None] = mapped_column(String(100))
    repo_description: Mapped[str | None] = mapped_column(Text)
    demo_url: Mapped[str | None] = mapped_column(String(300))

    readme_sha: Mapped[str | None] = mapped_column(String(64))  # commit SHA the README was last read at
    readme_blob_sha: Mapped[str | None] = mapped_column(String(64))  # blob SHA of that README
    readme_etag: Mapped[str | None] = mapped_column(String(200))
    last_ingested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    sources: Mapped[list[ProjectSource]] = relationship(back_populates="project", cascade="all, delete-orphan")
    facts: Mapped[list[ProjectKnowledge]] = relationship(back_populates="project", cascade="all, delete-orphan")
    skills: Mapped[list[ProjectSkill]] = relationship(back_populates="project", cascade="all, delete-orphan")


class ProjectSource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A piece of evidence: a README section at a SHA, a file, a commit, a PR,
    a release, or the portfolio's own copy. Facts cite these by URL."""

    __tablename__ = "project_sources"
    __table_args__ = (
        UniqueConstraint("project_id", "kind", "repo_full_name", "path", "ref_sha", "locator"),
        Index("ix_project_sources_project_kind", "project_id", "kind"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    kind: Mapped[SourceKind] = mapped_column(_enum(SourceKind, "source_kind"))
    repo_full_name: Mapped[str] = mapped_column(String(200), default="", server_default="")
    path: Mapped[str] = mapped_column(String(500), default="", server_default="")
    ref_sha: Mapped[str] = mapped_column(String(64), default="", server_default="")
    locator: Mapped[str] = mapped_column(String(200), default="", server_default="")  # heading anchor, line range…
    url: Mapped[str] = mapped_column(String(1000))
    title: Mapped[str | None] = mapped_column(String(300))
    content: Mapped[str | None] = mapped_column(Text)
    content_hash: Mapped[str | None] = mapped_column(String(64))
    etag: Mapped[str | None] = mapped_column(String(200))
    fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    project: Mapped[Project] = relationship(back_populates="sources")


class ProjectKnowledge(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """The current value of one typed fact about a project. History lives in
    `knowledge_versions`; `evidence` mirrors the current version's evidence so
    retrieval needs no join."""

    __tablename__ = "project_knowledge"
    __table_args__ = (
        UniqueConstraint("project_id", "fact_type", "key"),
        Index("ix_project_knowledge_project_status", "project_id", "status"),
        Index("ix_project_knowledge_search", "search", postgresql_using="gin"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    fact_type: Mapped[FactType] = mapped_column(_enum(FactType, "fact_type"))
    key: Mapped[str] = mapped_column(String(160))
    value: Mapped[dict[str, Any]] = mapped_column(JSONB)
    status: Mapped[FactStatus] = mapped_column(_enum(FactStatus, "fact_status"))
    confidence: Mapped[float] = mapped_column(Numeric(3, 2), default=0.5, server_default="0.5")
    evidence: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list, server_default="[]")
    current_version: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    search: Mapped[str | None] = mapped_column(
        TSVECTOR,
        Computed(
            "to_tsvector('english'::regconfig, coalesce(key, '') || ' ' || coalesce(value::text, ''))",
            persisted=True,
        ),
        nullable=True,
    )

    project: Mapped[Project] = relationship(back_populates="facts")
    versions: Mapped[list[KnowledgeVersion]] = relationship(
        back_populates="fact", cascade="all, delete-orphan", order_by="KnowledgeVersion.version"
    )


class KnowledgeVersion(UUIDPrimaryKeyMixin, Base):
    """Append-only history of a fact. Never updated, never deleted."""

    __tablename__ = "knowledge_versions"
    __table_args__ = (UniqueConstraint("knowledge_id", "version"),)

    knowledge_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("project_knowledge.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer)
    value: Mapped[dict[str, Any]] = mapped_column(JSONB)
    status: Mapped[FactStatus] = mapped_column(_enum(FactStatus, "fact_status"))
    confidence: Mapped[float] = mapped_column(Numeric(3, 2))
    evidence: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list, server_default="[]")
    produced_by: Mapped[ProducedBy] = mapped_column(_enum(ProducedBy, "produced_by"))
    analysed_change_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True))
    supersedes_version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("knowledge_versions.id", ondelete="SET NULL")
    )
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", nullable=False)

    fact: Mapped[ProjectKnowledge] = relationship(back_populates="versions")


class ProjectSkill(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Which skills a project demonstrates, and how strongly the evidence says so."""

    __tablename__ = "project_skills"
    __table_args__ = (UniqueConstraint("project_id", "skill"), Index("ix_project_skills_skill", "skill"))

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    skill: Mapped[str] = mapped_column(String(80))
    strength: Mapped[SkillStrength] = mapped_column(_enum(SkillStrength, "skill_strength"))
    evidence: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list, server_default="[]")

    project: Mapped[Project] = relationship(back_populates="skills")
