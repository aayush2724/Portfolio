"""Request/response models for the visitor assistant."""

from __future__ import annotations

from enum import Enum
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

SLUG_RE = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
MAX_MESSAGE_CHARS = 800


class HistoryTurn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: UUID
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)
    project_slug: str | None = Field(default=None, pattern=SLUG_RE, max_length=64)
    history: list[HistoryTurn] = Field(default_factory=list, max_length=12)


class FeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: UUID
    message_id: UUID
    rating: Literal[-1, 1]


class Intent(str, Enum):
    project_explanation = "project_explanation"
    architecture_explanation = "architecture_explanation"
    implementation_question = "implementation_question"
    technology_question = "technology_question"
    project_comparison = "project_comparison"
    skill_evidence = "skill_evidence"
    repository_link = "repository_link"
    profile_question = "profile_question"
    smalltalk = "smalltalk"
    off_topic = "off_topic"
    ambiguous = "ambiguous"


class ToolName(str, Enum):
    search_projects = "search_projects"
    get_project_details = "get_project_details"
    get_project_architecture = "get_project_architecture"
    get_implementation_details = "get_implementation_details"
    compare_projects = "compare_projects"
    search_skill_evidence = "search_skill_evidence"
    get_repository_url = "get_repository_url"
    list_projects = "list_projects"
    get_profile = "get_profile"


class ToolCall(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: ToolName
    args: dict[str, Any] = Field(default_factory=dict)


class Plan(BaseModel):
    intent: Intent
    project_slugs: list[str] = Field(default_factory=list)
    tools: list[ToolCall] = Field(default_factory=list, max_length=3)
    source: Literal["rules", "llm", "fallback"] = "rules"


class LlmPlan(BaseModel):
    """What the planning call must return (validated, never trusted blindly)."""

    model_config = ConfigDict(extra="forbid")
    intent: Intent
    tools: list[ToolCall] = Field(default_factory=list, max_length=3)


class SourceOut(BaseModel):
    id: str
    title: str | None = None
    url: str
    kind: str | None = None
    project: str | None = None


class AssistantStatus(BaseModel):
    live: bool
    reason: str | None = None
    provider: str | None = None
    model: str | None = None
