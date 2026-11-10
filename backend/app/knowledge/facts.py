"""Versioned fact writes. Every change to a fact appends a KnowledgeVersion;
the fact row always mirrors the newest version."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import FactStatus, FactType, KnowledgeVersion, ProducedBy, Project, ProjectKnowledge

STATUS_RANK = {FactStatus.claimed: 0, FactStatus.planned: 1, FactStatus.partial: 2, FactStatus.implemented: 3}


def evidence_item(
    url: str, *, title: str | None = None, excerpt: str | None = None, kind: str | None = None
) -> dict[str, Any]:
    item: dict[str, Any] = {"url": url}
    if title:
        item["title"] = title
    if excerpt:
        item["excerpt"] = excerpt[:400]
    if kind:
        item["kind"] = kind
    return item


def merge_evidence(
    existing: list[dict[str, Any]],
    new: list[dict[str, Any]],
    *,
    limit: int = 12,
    replace_kinds: Iterable[str] = (),
) -> list[dict[str, Any]]:
    """Union by URL. Evidence of a `replace_kinds` kind is replaced rather
    than accumulated, so a re-read README (new SHA, new permalinks) does not
    pile up one entry per commit."""
    drop = set(replace_kinds)
    kept = [e for e in existing if e.get("kind") not in drop] if drop else list(existing)
    seen = {e.get("url") for e in kept}
    for e in new:
        if e.get("url") not in seen:
            kept.append(e)
            seen.add(e.get("url"))
    return kept[-limit:]


async def upsert_fact(
    session: AsyncSession,
    project: Project,
    fact_type: FactType,
    key: str,
    value: dict[str, Any],
    *,
    status: FactStatus,
    confidence: float,
    evidence: list[dict[str, Any]],
    produced_by: ProducedBy,
    note: str | None = None,
    allow_downgrade: bool = False,
    replace_evidence_kinds: Iterable[str] = (),
) -> tuple[ProjectKnowledge, bool]:
    """Create or update a fact. Returns (fact, changed).

    A new version is appended only when value, status or evidence actually
    change. Unless `allow_downgrade`, a fact never moves to a weaker status
    (implemented → claimed) — stale portfolio copy must not undo evidence.
    """
    key = key[:160]
    result = await session.execute(
        select(ProjectKnowledge).where(
            ProjectKnowledge.project_id == project.id,
            ProjectKnowledge.fact_type == fact_type,
            ProjectKnowledge.key == key,
        )
    )
    fact = result.scalar_one_or_none()

    if fact is None:
        fact = ProjectKnowledge(
            project_id=project.id,
            fact_type=fact_type,
            key=key,
            value=value,
            status=status,
            confidence=confidence,
            evidence=evidence,
            current_version=1,
        )
        session.add(fact)
        await session.flush()
        session.add(
            KnowledgeVersion(
                knowledge_id=fact.id,
                version=1,
                value=value,
                status=status,
                confidence=confidence,
                evidence=evidence,
                produced_by=produced_by,
                note=note,
            )
        )
        return fact, True

    if not allow_downgrade and STATUS_RANK[status] < STATUS_RANK[fact.status]:
        # Keep the stronger status; still record new evidence if it is new.
        status = fact.status
        value = fact.value if fact.status != FactStatus.claimed else value
        confidence = max(float(fact.confidence), confidence)

    merged_evidence = merge_evidence(list(fact.evidence or []), evidence, replace_kinds=replace_evidence_kinds)
    unchanged = fact.value == value and fact.status == status and merged_evidence == list(fact.evidence or [])
    if unchanged:
        return fact, False

    previous = await session.execute(
        select(KnowledgeVersion)
        .where(KnowledgeVersion.knowledge_id == fact.id)
        .order_by(KnowledgeVersion.version.desc())
        .limit(1)
    )
    prev = previous.scalar_one_or_none()
    next_version = (prev.version if prev else fact.current_version) + 1
    session.add(
        KnowledgeVersion(
            knowledge_id=fact.id,
            version=next_version,
            value=value,
            status=status,
            confidence=confidence,
            evidence=merged_evidence,
            produced_by=produced_by,
            supersedes_version_id=prev.id if prev else None,
            note=note,
        )
    )
    fact.value = value
    fact.status = status
    fact.confidence = confidence
    fact.evidence = merged_evidence
    fact.current_version = next_version
    return fact, True
