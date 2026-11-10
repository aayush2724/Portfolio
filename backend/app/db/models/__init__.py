"""Import every model so `Base.metadata` is complete for Alembic and tests."""

from app.db.models.github import MonitoredRepository
from app.db.models.knowledge import (
    Attribution,
    FactStatus,
    FactType,
    KnowledgeVersion,
    ProducedBy,
    Project,
    ProjectKnowledge,
    ProjectSkill,
    ProjectSource,
    ProjectStatus,
    SkillStrength,
    SourceKind,
)
from app.db.models.ops import AuditLog, LlmCall
from app.db.models.visitor import ConversationMessage, VisitorSession

__all__ = [
    "Attribution",
    "AuditLog",
    "ConversationMessage",
    "FactStatus",
    "FactType",
    "KnowledgeVersion",
    "LlmCall",
    "MonitoredRepository",
    "ProducedBy",
    "Project",
    "ProjectKnowledge",
    "ProjectSkill",
    "ProjectSource",
    "ProjectStatus",
    "SkillStrength",
    "SourceKind",
    "VisitorSession",
]
