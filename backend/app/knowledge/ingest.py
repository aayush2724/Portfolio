"""README ingestion: turn a repository's README at a specific commit into
addressable evidence (one source per section, with a permalink) and typed
facts, promote the portfolio's `claimed` facts that the README confirms,
and demote README-derived facts the README no longer states.

No model is involved. Everything the README says is recorded as what the
README says, with a link to the exact section at the exact SHA.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import UTC, datetime

import structlog
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    FactStatus,
    FactType,
    ProducedBy,
    Project,
    ProjectKnowledge,
    ProjectSource,
    SkillStrength,
    SourceKind,
)
from app.github.client import GitHubClient, NotFound
from app.knowledge import readme as rd
from app.knowledge.facts import evidence_item, upsert_fact
from app.knowledge.seed import ensure_skill

log = structlog.get_logger("ingest")

README_KINDS = ("readme",)


@dataclass(slots=True)
class IngestReport:
    slug: str
    skipped: bool = False
    reason: str | None = None
    sha: str | None = None
    sections: int = 0
    facts_changed: int = 0
    promoted: int = 0
    demoted: int = 0
    technologies: list[str] = field(default_factory=list)


def _permalink(repo: str, sha: str, anchor: str) -> str:
    base = f"https://github.com/{repo}/blob/{sha}/README.md"
    return f"{base}#{anchor}" if anchor and anchor != "preamble" else base


async def ingest_readme(
    session: AsyncSession,
    project: Project,
    gh: GitHubClient,
    *,
    force: bool = False,
    include_private: bool | None = None,
) -> IngestReport:
    if include_private is None:
        from app.config import get_settings

        include_private = get_settings().include_private_repos
    report = IngestReport(slug=project.slug)
    if not project.repo_full_name:
        report.skipped, report.reason = True, "no repository"
        return report
    owner, name = project.repo_full_name.split("/", 1)

    try:
        info = await gh.get_repo(owner, name)
    except NotFound:
        report.skipped, report.reason = True, "repository not found"
        return report
    if info.private and not include_private:
        # Public repositories only (owner decision 2026-11-09): nothing from a private repo is stored.
        report.skipped, report.reason = True, "private repository (excluded)"
        return report
    project.repo_is_private = info.private
    project.repo_default_branch = info.default_branch
    project.repo_description = info.description
    project.repo_url = info.html_url
    if info.homepage and not project.demo_url:
        project.demo_url = info.homepage

    head = await gh.get_branch_head(owner, name, info.default_branch)
    report.sha = head
    now = datetime.now(UTC)

    # Conditional request on the branch's README: a 304, or an unchanged blob
    # SHA, means nothing to do — commits that leave the README alone must not
    # rewrite every README-backed fact with new permalinks.
    try:
        readme = await gh.get_readme(owner, name, ref=info.default_branch, etag=None if force else project.readme_etag)
    except NotFound:
        report.skipped, report.reason = True, "no README"
        project.readme_sha, project.readme_blob_sha, project.readme_etag = head, None, None
        project.last_ingested_at = now
        return report
    if readme is None or (not force and readme.sha == project.readme_blob_sha):
        report.skipped, report.reason = True, "unchanged"
        project.last_ingested_at = now
        if readme is not None:
            project.readme_etag = readme.etag
        return report

    sections = rd.split_sections(readme.content)
    report.sections = len(sections)
    repo = project.repo_full_name
    asserted: set[tuple[FactType, str]] = set()

    # Replace README evidence for this project: older SHAs' sections go; the
    # evidence JSON on each version keeps its URL, so history stays readable.
    await session.execute(
        delete(ProjectSource).where(ProjectSource.project_id == project.id, ProjectSource.kind == SourceKind.readme)
    )
    anchors_to_source: dict[str, ProjectSource] = {}
    for s in sections:
        anchor = s.anchor or "preamble"
        src = ProjectSource(
            project_id=project.id,
            kind=SourceKind.readme,
            repo_full_name=repo,
            path="README.md",
            ref_sha=head,
            locator=anchor,
            url=_permalink(repo, head, anchor),
            title=s.title or "README",
            content=s.body[:16000],
            content_hash=hashlib.sha256(s.body.encode()).hexdigest(),
            etag=readme.etag,
            fetched_at=now,
        )
        session.add(src)
        anchors_to_source[anchor] = src
    await session.flush()

    def ev(anchor: str, excerpt: str | None = None) -> list[dict]:
        src = anchors_to_source.get(anchor) or anchors_to_source.get("preamble")
        if src is None:
            return []
        return [evidence_item(src.url, title=src.title, excerpt=excerpt, kind="readme")]

    async def fact(
        fact_type: FactType,
        key: str,
        value: dict,
        status: FactStatus,
        anchor: str,
        excerpt: str | None,
        confidence: float,
    ) -> None:
        asserted.add((fact_type, key[:160]))
        _, changed = await upsert_fact(
            session,
            project,
            fact_type,
            key,
            value,
            status=status,
            confidence=confidence,
            evidence=ev(anchor, excerpt),
            produced_by=ProducedBy.readme_ingest,
            replace_evidence_kinds=README_KINDS,
        )
        if changed:
            report.facts_changed += 1

    overview = rd.extract_overview(sections)
    if overview:
        text, anchor = overview
        await fact(FactType.description, "readme.overview", {"text": text}, FactStatus.implemented, anchor, text, 0.9)
        project.summary = text[:1000]  # the README is the description the owner actually maintains

    techs = rd.extract_technologies(readme.content, sections)
    report.technologies = sorted(t for t, h in techs.items() if h.status == "implemented")
    for tech, hit in techs.items():
        anchor = hit.anchors[0]
        status = FactStatus.implemented if hit.status == "implemented" else FactStatus.planned
        await fact(
            FactType.technology,
            rd.slug_key(tech),
            {"name": tech, "mentions": hit.anchors[:6], "explicit": hit.explicit},
            status,
            anchor,
            tech,
            hit.confidence,
        )
        if status == FactStatus.implemented:
            strength = SkillStrength.medium if hit.confidence >= 0.7 else SkillStrength.weak
            await ensure_skill(session, project, tech, strength, ev(anchor, tech))

    for text, anchor in rd.extract_features(sections):
        await fact(FactType.feature, rd.slug_key(text), {"text": text}, FactStatus.implemented, anchor, text, 0.8)

    for text, anchor in rd.extract_planned(sections):
        await fact(
            FactType.feature, "planned." + rd.slug_key(text, 70), {"text": text}, FactStatus.planned, anchor, text, 0.8
        )

    for s in sections:
        if not s.body.strip():
            continue
        if s.kind == "architecture":
            await fact(
                FactType.architecture,
                "readme." + (s.anchor or "architecture"),
                {"title": s.title, "text": rd.section_text(s)},
                FactStatus.implemented,
                s.anchor,
                s.title,
                0.85,
            )
        elif s.kind == "api":
            await fact(
                FactType.api,
                "readme." + (s.anchor or "api"),
                {"title": s.title, "text": rd.section_text(s)},
                FactStatus.implemented,
                s.anchor,
                s.title,
                0.85,
            )
        elif s.kind == "testing":
            await fact(
                FactType.metric,
                "readme." + (s.anchor or "testing"),
                {"title": s.title, "text": rd.section_text(s, 1500)},
                FactStatus.implemented,
                s.anchor,
                s.title,
                0.8,
            )

    implemented_techs = {t: h for t, h in techs.items() if h.status == "implemented"}
    report.promoted = await promote_claims(
        session, project, implemented_techs, [t for t, _ in rd.extract_features(sections)], anchors_to_source
    )
    report.demoted = await demote_unstated(session, project, asserted, head)

    project.readme_sha = head
    project.readme_blob_sha = readme.sha
    project.readme_etag = readme.etag
    project.last_ingested_at = now
    log.info(
        "ingested",
        slug=project.slug,
        sha=head[:7],
        sections=report.sections,
        facts_changed=report.facts_changed,
        promoted=report.promoted,
        demoted=report.demoted,
    )
    return report


async def promote_claims(
    session: AsyncSession,
    project: Project,
    techs: dict[str, rd.TechHit],
    features: list[str],
    sources: dict[str, ProjectSource],
) -> int:
    """Portfolio claims the README confirms become `implemented`, keeping
    their own text but gaining README evidence."""
    result = await session.execute(
        select(ProjectKnowledge).where(
            ProjectKnowledge.project_id == project.id, ProjectKnowledge.status == FactStatus.claimed
        )
    )
    promoted = 0
    tech_keys = {rd.slug_key(t): (t, hit.anchors[0]) for t, hit in techs.items()}
    for claim in result.scalars().all():
        match: tuple[str, str] | None = None
        if claim.fact_type == FactType.technology:
            hit = tech_keys.get(claim.key)
            if hit is None:
                name = (claim.value or {}).get("name", "")
                canon = rd.canonical_tech(name)
                if canon and canon in techs:
                    hit = (canon, techs[canon].anchors[0])
            if hit:
                match = hit
        elif claim.fact_type == FactType.feature:
            text = (claim.value or {}).get("text", "")
            best = max(((rd.token_overlap(text, f), f) for f in features), default=(0.0, ""))
            if best[0] >= 0.5:
                anchor = next(
                    (s.locator for s in sources.values() if best[1] and best[1][:40] in (s.content or "")),
                    "preamble",
                )
                match = (best[1], anchor)
        if match is None:
            continue
        excerpt, anchor = match
        src = sources.get(anchor) or sources.get("preamble")
        evidence = [evidence_item(src.url, title=src.title, excerpt=excerpt, kind="readme")] if src else []
        _, changed = await upsert_fact(
            session,
            project,
            claim.fact_type,
            claim.key,
            claim.value,
            status=FactStatus.implemented,
            confidence=0.8,
            evidence=evidence,
            produced_by=ProducedBy.readme_ingest,
            note="promoted: README confirms the portfolio claim",
            replace_evidence_kinds=README_KINDS,
        )
        if changed:
            promoted += 1
    return promoted


async def demote_unstated(
    session: AsyncSession, project: Project, asserted: set[tuple[FactType, str]], head: str
) -> int:
    """README-derived facts the current README no longer states fall back to
    `claimed`: the evidence that made them `implemented` is gone. Their history
    keeps the old permalinks."""
    result = await session.execute(
        select(ProjectKnowledge).where(
            ProjectKnowledge.project_id == project.id,
            ProjectKnowledge.status.in_([FactStatus.implemented, FactStatus.planned, FactStatus.partial]),
        )
    )
    demoted = 0
    for fact in result.scalars().all():
        if (fact.fact_type, fact.key) in asserted:
            continue
        kinds = {e.get("kind") for e in (fact.evidence or [])}
        readme_only = bool(kinds) and kinds <= {"readme"}
        derived_key = fact.key.startswith(("readme.", "planned."))
        if not (readme_only or derived_key):
            continue
        _, changed = await upsert_fact(
            session,
            project,
            fact.fact_type,
            fact.key,
            fact.value,
            status=FactStatus.claimed,
            confidence=0.3,
            evidence=[],
            produced_by=ProducedBy.readme_ingest,
            note=f"not stated in README at {head[:7]}",
            allow_downgrade=True,
            replace_evidence_kinds=README_KINDS,
        )
        if changed:
            demoted += 1
    return demoted
