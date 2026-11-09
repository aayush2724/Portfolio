"""Read models returned by the public API and used by the assistant."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.db.models import Attribution, FactStatus, FactType, ProjectStatus, SkillStrength


class Evidence(BaseModel):
    url: str
    title: str | None = None
    excerpt: str | None = None
    kind: str | None = None


class Fact(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    type: FactType
    key: str
    value: Any
    status: FactStatus
    confidence: float
    version: int
    evidence: list[Evidence] = []


class ProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    tagline: str | None
    status: ProjectStatus
    attribution: Attribution | None
    is_featured: bool
    repo_full_name: str | None
    repo_url: str | None
    repo_is_private: bool
    demo_url: str | None
    technologies: list[str] = []
    last_ingested_at: datetime | None = None


class ProjectDetail(ProjectSummary):
    summary: str | None = None
    repo_description: str | None = None
    facts: dict[str, list[Fact]] = {}


class FactList(BaseModel):
    slug: str
    count: int
    facts: list[Fact]


class SearchHit(BaseModel):
    project: ProjectSummary
    score: float
    matched: list[Fact]


class SkillEvidenceHit(BaseModel):
    project: ProjectSummary
    skill: str
    strength: SkillStrength
    evidence: list[Evidence]


class Comparison(BaseModel):
    a: ProjectDetail
    b: ProjectDetail
    dimensions: list[str]
