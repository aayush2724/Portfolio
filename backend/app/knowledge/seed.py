"""Seed the knowledge base from the portfolio's own copy.

`backend/seeds/projects.seed.json` is produced by `node scripts/export-seed.mjs`
at the repository root. Every statement in it is portfolio copy, so it is
stored as a `claimed` fact citing the data file it came from. README and
source ingestion later promote the claims that evidence confirms; the rest
stay `claimed` and surface in the admin claims review.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Attribution,
    FactStatus,
    FactType,
    ProducedBy,
    Project,
    ProjectSkill,
    ProjectSource,
    ProjectStatus,
    SkillStrength,
    SourceKind,
)
from app.knowledge.facts import evidence_item, upsert_fact
from app.knowledge.readme import slug_key

log = structlog.get_logger("seed")

TECH_CATEGORY_KEYS = ("frontend", "backend", "database", "infrastructure", "tools")


def load_seed(path: str | Path) -> dict[str, Any]:
    with Path(path).open(encoding="utf-8") as fh:
        return json.load(fh)


def _source_url(seed: dict[str, Any], relpath: str) -> str:
    return f"https://github.com/{seed['sourceRepo']}/blob/{seed['sourceRef']}/{relpath}"


async def _ensure_source(
    session: AsyncSession, project: Project, seed: dict[str, Any], relpath: str, slug: str
) -> ProjectSource:
    url = _source_url(seed, relpath)
    result = await session.execute(
        select(ProjectSource).where(
            ProjectSource.project_id == project.id,
            ProjectSource.kind == SourceKind.portfolio_copy,
            ProjectSource.path == relpath,
            ProjectSource.locator == slug,
        )
    )
    source = result.scalar_one_or_none()
    if source is None:
        source = ProjectSource(
            project_id=project.id,
            kind=SourceKind.portfolio_copy,
            repo_full_name=seed["sourceRepo"],
            path=relpath,
            ref_sha=seed["sourceRef"],
            locator=slug,
            url=url,
            title=f"Portfolio copy — {relpath}",
        )
        session.add(source)
        await session.flush()
    return source


async def seed_project(session: AsyncSession, seed: dict[str, Any], record: dict[str, Any]) -> dict[str, int]:
    """Create/refresh one project and its claimed facts. Idempotent."""
    counts = {"facts_created": 0, "facts_changed": 0}
    slug = record["slug"]
    result = await session.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    cs = record.get("caseStudy") or {}
    pj = record.get("project") or {}
    ft = record.get("featured") or {}

    tagline = record.get("tagline") or cs.get("tagline") or pj.get("desc") or ft.get("description")
    if project is None:
        project = Project(slug=slug, name=record["name"])
        session.add(project)
    project.name = record["name"]
    project.tagline = (tagline or "")[:200] or None
    project.status = ProjectStatus(record.get("status") or "active")
    project.is_featured = bool(record.get("isFeatured"))
    project.attribution = Attribution(record["attribution"]) if record.get("attribution") else None
    project.sort_order = int(record.get("sortOrder") or 0)
    project.repo_full_name = record.get("repo")
    project.repo_url = record.get("repoUrl")
    project.demo_url = record.get("demoUrl")
    if not project.summary:
        project.summary = pj.get("desc") or ft.get("description") or (cs.get("approach") or {}).get("description")
    await session.flush()

    async def claim(
        fact_type: FactType,
        key: str,
        value: dict[str, Any],
        relpath: str,
        excerpt: str | None = None,
        confidence: float = 0.4,
    ) -> None:
        source = await _ensure_source(session, project, seed, relpath, slug)
        ev = [evidence_item(source.url, title=source.title, excerpt=excerpt, kind="portfolio_copy")]
        _, changed = await upsert_fact(
            session,
            project,
            fact_type,
            key,
            value,
            status=FactStatus.claimed,
            confidence=confidence,
            evidence=ev,
            produced_by=ProducedBy.seed,
        )
        if changed:
            counts["facts_changed"] += 1

    tech: dict[str, str] = {}

    if cs:
        rel = "src/data/caseStudies.js"
        if cs.get("tagline"):
            await claim(FactType.description, "portfolio.tagline", {"text": cs["tagline"]}, rel, cs["tagline"])
        problem = cs.get("problem") or {}
        if problem.get("description"):
            await claim(
                FactType.description,
                "portfolio.problem",
                {
                    "title": problem.get("title"),
                    "text": problem["description"],
                    "pain_points": problem.get("painPoints") or [],
                },
                rel,
                problem["description"],
            )
        approach = cs.get("approach") or {}
        if approach.get("description"):
            await claim(
                FactType.architecture,
                "portfolio.approach",
                {"text": approach["description"]},
                rel,
                approach["description"],
            )
        for item in approach.get("keyFeatures") or []:
            await claim(FactType.feature, slug_key(item), {"text": item}, rel, item)
        for category in TECH_CATEGORY_KEYS:
            for name in (cs.get("stack") or {}).get(category) or []:
                tech.setdefault(name, category)
        for ch in cs.get("challenges") or []:
            if ch.get("challenge"):
                await claim(
                    FactType.challenge,
                    slug_key(ch["challenge"]),
                    {"challenge": ch["challenge"], "solution": ch.get("solution")},
                    rel,
                    ch["challenge"],
                )
        role = cs.get("role") or {}
        if role:
            await claim(
                FactType.role,
                "role",
                {
                    "title": role.get("title"),
                    "responsibilities": role.get("responsibilities") or [],
                    "team_size": role.get("teamSize"),
                    "duration": role.get("duration"),
                },
                rel,
                role.get("title"),
            )
        outcomes = cs.get("outcomes") or {}
        for m in outcomes.get("metrics") or []:
            if m.get("label"):
                await claim(
                    FactType.metric,
                    slug_key(m["label"]),
                    {"label": m["label"], "value": m.get("value"), "description": m.get("description")},
                    rel,
                    f"{m['label']}: {m.get('value')}",
                )
        if outcomes.get("impact"):
            await claim(FactType.description, "portfolio.impact", {"text": outcomes["impact"]}, rel, outcomes["impact"])
        if cs.get("badge"):
            await claim(FactType.milestone, "badge", {"text": cs["badge"]}, rel, cs["badge"])
        for t in cs.get("tags") or []:
            tech.setdefault(t, "tag")

    if pj:
        rel = "src/data/projects.js"
        if pj.get("desc"):
            await claim(FactType.description, "portfolio.summary", {"text": pj["desc"]}, rel, pj["desc"])
        if pj.get("highlight"):
            await claim(FactType.metric, "highlight", {"text": pj["highlight"]}, rel, pj["highlight"])
        for t in pj.get("tags") or []:
            tech.setdefault(t, "tag")

    if ft:
        rel = "src/data/featuredProjects.js"
        if ft.get("description"):
            await claim(FactType.description, "portfolio.deck", {"text": ft["description"]}, rel, ft["description"])
        for t in ft.get("tags") or []:
            tech.setdefault(t, "tag")

    for name, category in tech.items():
        rel = "src/data/caseStudies.js" if cs else ("src/data/projects.js" if pj else "src/data/featuredProjects.js")
        await claim(
            FactType.technology, slug_key(name), {"name": name, "category": category}, rel, name, confidence=0.5
        )
        await ensure_skill(session, project, name, SkillStrength.weak, [])

    return counts


async def ensure_skill(
    session: AsyncSession, project: Project, skill: str, strength: SkillStrength, evidence: list[dict[str, Any]]
) -> None:
    result = await session.execute(
        select(ProjectSkill).where(ProjectSkill.project_id == project.id, ProjectSkill.skill == skill[:80])
    )
    row = result.scalar_one_or_none()
    if row is None:
        session.add(ProjectSkill(project_id=project.id, skill=skill[:80], strength=strength, evidence=evidence))
    else:
        order = [SkillStrength.weak, SkillStrength.medium, SkillStrength.strong]
        if order.index(strength) > order.index(row.strength):
            row.strength = strength
        if evidence:
            urls = {e.get("url") for e in row.evidence or []}
            row.evidence = [*(row.evidence or []), *[e for e in evidence if e.get("url") not in urls]][-12:]


async def seed_all(session: AsyncSession, seed: dict[str, Any]) -> dict[str, int]:
    totals = {"projects": 0, "facts_changed": 0}
    for record in seed["projects"]:
        counts = await seed_project(session, seed, record)
        totals["projects"] += 1
        totals["facts_changed"] += counts["facts_changed"]
    await session.commit()
    log.info("seed_complete", **totals)
    return totals
