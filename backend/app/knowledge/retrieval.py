"""Structured retrieval over the knowledge base: SQL and PostgreSQL full-text
search, deterministic ordering, evidence on every fact. These are the only
functions the visitor assistant's tools call.

Visibility (`public=True`, the default): candidate projects — on GitHub but
not published on the site — are invisible, and projects whose repository is
private expose only descriptions and technology names, never README section
text or permalinks into the private repository. Admin callers pass
`public=False` for the full view.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import FactStatus, FactType, Project, ProjectKnowledge, ProjectSkill, ProjectStatus
from app.knowledge.schemas import (
    Comparison,
    Evidence,
    Fact,
    FactList,
    ProjectDetail,
    ProjectSummary,
    SearchHit,
    SkillEvidenceHit,
)

FACT_LIMIT_PER_TYPE = 40
COMPARE_DIMENSIONS = ["description", "architecture", "technology", "feature", "api", "challenge", "metric", "role"]

# What a private repository's project may show publicly.
PRIVATE_PUBLIC_FACT_TYPES = {FactType.description, FactType.technology}
PRIVATE_PUBLIC_EVIDENCE_KINDS = {"portfolio_copy", "manual"}


def _redact(project: Project, public: bool) -> bool:
    return public and project.repo_is_private


def _fact_visible(row: ProjectKnowledge, redact: bool) -> bool:
    return not redact or row.fact_type in PRIVATE_PUBLIC_FACT_TYPES


def _evidence(items: list[dict[str, Any]] | None, redact: bool) -> list[Evidence]:
    out = []
    for e in items or []:
        if not isinstance(e, dict) or not e.get("url"):
            continue
        if redact and e.get("kind") not in PRIVATE_PUBLIC_EVIDENCE_KINDS:
            continue
        out.append(Evidence(**e))
    return out


def _fact(row: ProjectKnowledge, *, redact: bool = False) -> Fact:
    value = row.value
    if redact and row.fact_type == FactType.technology:
        value = {"name": (row.value or {}).get("name")}
    return Fact(
        type=row.fact_type,
        key=row.key,
        value=value,
        status=row.status,
        confidence=float(row.confidence),
        version=row.current_version,
        evidence=_evidence(row.evidence, redact),
    )


def _summary(project: Project, technologies: list[str]) -> ProjectSummary:
    return ProjectSummary(
        slug=project.slug,
        name=project.name,
        tagline=project.tagline,
        status=project.status,
        attribution=project.attribution,
        is_featured=project.is_featured,
        repo_full_name=project.repo_full_name,
        repo_url=project.repo_url,
        repo_is_private=project.repo_is_private,
        demo_url=project.demo_url,
        technologies=technologies,
        last_ingested_at=project.last_ingested_at,
    )


def _visible(stmt, public: bool):
    return stmt.where(Project.status != ProjectStatus.candidate) if public else stmt


async def _technologies(session: AsyncSession, project_ids: list) -> dict:
    if not project_ids:
        return {}
    rows = await session.execute(
        select(ProjectKnowledge.project_id, ProjectKnowledge.value, ProjectKnowledge.status)
        .where(ProjectKnowledge.project_id.in_(project_ids), ProjectKnowledge.fact_type == FactType.technology)
        .order_by(ProjectKnowledge.status, ProjectKnowledge.key)
    )
    out: dict = defaultdict(list)
    for pid, value, _status in rows.all():
        name = (value or {}).get("name")
        if name and name not in out[pid]:
            out[pid].append(name)
    return out


async def list_projects(session: AsyncSession, *, public: bool = True) -> list[ProjectSummary]:
    stmt = _visible(select(Project).order_by(Project.sort_order, Project.name), public)
    projects = (await session.execute(stmt)).scalars().all()
    techs = await _technologies(session, [p.id for p in projects])
    return [_summary(p, techs.get(p.id, [])) for p in projects]


async def _project_by_slug(session: AsyncSession, slug: str, public: bool) -> Project | None:
    stmt = _visible(select(Project).where(Project.slug == slug), public)
    return (await session.execute(stmt)).scalar_one_or_none()


async def get_project(session: AsyncSession, slug: str, *, public: bool = True) -> ProjectDetail | None:
    project = await _project_by_slug(session, slug, public)
    if project is None:
        return None
    redact = _redact(project, public)
    rows = (
        (
            await session.execute(
                select(ProjectKnowledge)
                .where(ProjectKnowledge.project_id == project.id)
                .order_by(ProjectKnowledge.fact_type, ProjectKnowledge.status, ProjectKnowledge.key)
            )
        )
        .scalars()
        .all()
    )
    grouped: dict[str, list[Fact]] = defaultdict(list)
    technologies: list[str] = []
    for row in rows:
        if row.fact_type == FactType.technology:
            name = (row.value or {}).get("name")
            if name and name not in technologies:
                technologies.append(name)
        if not _fact_visible(row, redact):
            continue
        if len(grouped[row.fact_type.value]) < FACT_LIMIT_PER_TYPE:
            grouped[row.fact_type.value].append(_fact(row, redact=redact))
    summary = _summary(project, technologies)
    return ProjectDetail(
        **summary.model_dump(),
        summary=project.summary,
        repo_description=project.repo_description,
        facts=dict(grouped),
    )


async def get_facts(
    session: AsyncSession,
    slug: str,
    *,
    fact_type: FactType | None = None,
    status: FactStatus | None = None,
    public: bool = True,
) -> FactList | None:
    project = await _project_by_slug(session, slug, public)
    if project is None:
        return None
    redact = _redact(project, public)
    stmt = select(ProjectKnowledge).where(ProjectKnowledge.project_id == project.id)
    if fact_type is not None:
        stmt = stmt.where(ProjectKnowledge.fact_type == fact_type)
    if status is not None:
        stmt = stmt.where(ProjectKnowledge.status == status)
    stmt = stmt.order_by(ProjectKnowledge.fact_type, ProjectKnowledge.status, ProjectKnowledge.key).limit(400)
    rows = (await session.execute(stmt)).scalars().all()
    facts = [_fact(r, redact=redact) for r in rows if _fact_visible(r, redact)]
    return FactList(slug=slug, count=len(facts), facts=facts)


async def search_projects(session: AsyncSession, query: str, *, limit: int = 5, public: bool = True) -> list[SearchHit]:
    """Full-text search over facts plus a name/tagline match; grouped by project,
    best first. The query string only ever reaches PostgreSQL as a bound parameter."""
    q = query.strip()[:200]
    if not q:
        return []
    tsq = func.plainto_tsquery("english", q)
    rank = func.ts_rank(ProjectKnowledge.search, tsq)
    fact_stmt = (
        select(ProjectKnowledge, rank.label("rank"), Project)
        .join(Project, Project.id == ProjectKnowledge.project_id)
        .where(ProjectKnowledge.search.op("@@")(tsq))
        .order_by(rank.desc())
        .limit(80)
    )
    fact_rows = (await session.execute(_visible(fact_stmt, public))).all()
    like = f"%{q}%"
    name_stmt = select(Project).where(or_(Project.name.ilike(like), Project.tagline.ilike(like)))
    name_rows = (await session.execute(_visible(name_stmt, public))).scalars().all()

    scores: dict = defaultdict(float)
    matched: dict = defaultdict(list)
    projects: dict = {}
    for fact, r, project in fact_rows:
        projects[project.id] = project
        redact = _redact(project, public)
        if not _fact_visible(fact, redact):
            continue
        scores[fact.project_id] += float(r) * (1.5 if fact.status == FactStatus.implemented else 1.0)
        if len(matched[fact.project_id]) < 6:
            matched[fact.project_id].append(_fact(fact, redact=redact))
    for p in name_rows:
        projects[p.id] = p
        scores[p.id] += 1.0
    if not scores:
        return []
    techs = await _technologies(session, list(scores))
    hits = [
        SearchHit(
            project=_summary(projects[pid], techs.get(pid, [])), score=round(score, 4), matched=matched.get(pid, [])
        )
        for pid, score in scores.items()
    ]
    hits.sort(key=lambda h: (-h.score, h.project.name))
    return hits[:limit]


async def search_skill_evidence(
    session: AsyncSession, skill: str, *, limit: int = 8, public: bool = True
) -> list[SkillEvidenceHit]:
    s = skill.strip()[:80]
    if not s:
        return []
    stmt = (
        select(ProjectSkill)
        .join(Project, Project.id == ProjectSkill.project_id)
        .options(selectinload(ProjectSkill.project))
        .where(ProjectSkill.skill.ilike(f"%{s}%"))
        .order_by(ProjectSkill.strength.desc(), ProjectSkill.skill)
        .limit(limit * 3)
    )
    rows = (await session.execute(_visible(stmt, public))).scalars().all()
    techs = await _technologies(session, [r.project_id for r in rows])
    hits: list[SkillEvidenceHit] = []
    seen: set = set()
    order = {"strong": 0, "medium": 1, "weak": 2}
    for row in sorted(rows, key=lambda r: (order[r.strength.value], r.project.sort_order)):
        if row.project_id in seen:
            continue
        seen.add(row.project_id)
        redact = _redact(row.project, public)
        hits.append(
            SkillEvidenceHit(
                project=_summary(row.project, techs.get(row.project_id, [])),
                skill=row.skill,
                strength=row.strength,
                evidence=_evidence(row.evidence, redact),
            )
        )
        if len(hits) >= limit:
            break
    return hits


async def compare_projects(
    session: AsyncSession, slug_a: str, slug_b: str, *, public: bool = True
) -> Comparison | None:
    a = await get_project(session, slug_a, public=public)
    b = await get_project(session, slug_b, public=public)
    if a is None or b is None:
        return None
    return Comparison(a=a, b=b, dimensions=COMPARE_DIMENSIONS)
