"""The assistant's tools. Every tool is read-only, takes validated arguments,
calls `knowledge.retrieval` with the public visibility gate, and returns
evidence items (text + the URL it came from). The language model never
builds a query: it only ever sees the evidence these functions return."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.assistant.profile import PROFILE_ITEMS, SITE_URL
from app.assistant.schemas import SLUG_RE, ToolCall, ToolName
from app.knowledge import retrieval
from app.knowledge.readme import token_overlap
from app.knowledge.schemas import Fact, ProjectDetail, ProjectSummary


@dataclass(slots=True)
class EvidenceItem:
    url: str
    text: str
    title: str | None = None
    kind: str | None = None
    project_slug: str | None = None
    project_name: str | None = None
    status: str | None = None
    fact_type: str | None = None


@dataclass(slots=True)
class ToolResult:
    name: str
    args: dict[str, Any]
    items: list[EvidenceItem] = field(default_factory=list)
    projects: list[ProjectSummary] = field(default_factory=list)
    note: str = ""


class ToolArgError(ValueError):
    pass


class SearchArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=1, max_length=200)


class SlugArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    project_slug: str = Field(pattern=SLUG_RE, max_length=64)


class TopicArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    project_slug: str = Field(pattern=SLUG_RE, max_length=64)
    topic: str = Field(min_length=1, max_length=160)


class CompareArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    project_a: str = Field(pattern=SLUG_RE, max_length=64)
    project_b: str = Field(pattern=SLUG_RE, max_length=64)


class SkillArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    skill: str = Field(min_length=1, max_length=60)


class NoArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")


ARG_MODELS: dict[ToolName, type[BaseModel]] = {
    ToolName.search_projects: SearchArgs,
    ToolName.get_project_details: SlugArgs,
    ToolName.get_project_architecture: SlugArgs,
    ToolName.get_implementation_details: TopicArgs,
    ToolName.compare_projects: CompareArgs,
    ToolName.search_skill_evidence: SkillArgs,
    ToolName.get_repository_url: SlugArgs,
    ToolName.list_projects: NoArgs,
    ToolName.get_profile: NoArgs,
}

STATUS_LABEL = {
    "implemented": "implemented",
    "partial": "partially implemented",
    "planned": "planned, not built",
    "claimed": "portfolio claim, not verified from the repository",
}


def _fact_text(fact: Fact) -> str:
    v = fact.value if isinstance(fact.value, dict) else {}
    t = fact.type.value if hasattr(fact.type, "value") else str(fact.type)
    if t == "technology":
        return v.get("name") or fact.key
    if t == "challenge":
        return f"Challenge: {v.get('challenge', '')} Solution: {v.get('solution', '')}".strip()
    if t == "role":
        parts = [v.get("title"), v.get("team_size"), v.get("duration")]
        resp = v.get("responsibilities") or []
        return "; ".join(p for p in parts if p) + (" — " + " · ".join(resp[:4]) if resp else "")
    if t == "metric" and "label" in v:
        return f"{v.get('label')}: {v.get('value')} — {v.get('description') or ''}".strip(" —")
    if "text" in v:
        title = v.get("title")
        text = str(v["text"])
        return f"{title}: {text}" if title and not text.startswith(str(title)) else text
    if "pain_points" in v:
        return (
            f"{v.get('title') or ''} {v.get('text') or ''} Pain points: {'; '.join(v.get('pain_points') or [])}".strip()
        )
    return fact.key


def _fact_item(project: ProjectSummary, fact: Fact) -> EvidenceItem:
    ev = fact.evidence[0] if fact.evidence else None
    url = ev.url if ev else (project.repo_url or f"{SITE_URL}/#/work/{project.slug}")
    t = fact.type.value if hasattr(fact.type, "value") else str(fact.type)
    s = fact.status.value if hasattr(fact.status, "value") else str(fact.status)
    return EvidenceItem(
        url=url,
        text=_fact_text(fact)[:1400],
        title=(ev.title if ev and ev.title else fact.key),
        kind=(ev.kind if ev else "knowledge"),
        project_slug=project.slug,
        project_name=project.name,
        status=STATUS_LABEL.get(s, s),
        fact_type=t,
    )


def _project_item(p: ProjectSummary) -> EvidenceItem:
    attribution = {"sole": "solo project", "co_built": "co-built with a teammate", "contributor": "contributor"}.get(
        p.attribution.value if p.attribution else "", "authorship not stated"
    )
    techs = ", ".join(p.technologies[:14]) or "not recorded"
    private = " The repository is private; only its README-level description is available." if p.repo_is_private else ""
    text = (
        f"{p.name}: {p.tagline or 'no tagline'}. {attribution}. Technologies on record: {techs}."
        f" Repository: {p.repo_url or 'none'}. Live demo: {p.demo_url or 'none'}.{private}"
    )
    return EvidenceItem(
        url=p.repo_url or f"{SITE_URL}/#/work/{p.slug}",
        text=text,
        title=f"{p.name} — project record",
        kind="project",
        project_slug=p.slug,
        project_name=p.name,
        fact_type="project",
    )


def _detail_items(detail: ProjectDetail, types: list[str] | None = None, limit: int = 24) -> list[EvidenceItem]:
    order = types or [
        "description",
        "architecture",
        "component",
        "api",
        "data_flow",
        "feature",
        "technology",
        "decision",
        "challenge",
        "metric",
        "milestone",
        "role",
    ]
    items: list[EvidenceItem] = [_project_item(detail)]
    if detail.summary:
        items.append(
            EvidenceItem(
                url=detail.repo_url or f"{SITE_URL}/#/work/{detail.slug}",
                text=detail.summary[:1200],
                title=f"{detail.name} — summary",
                kind="readme" if detail.last_ingested_at else "portfolio_copy",
                project_slug=detail.slug,
                project_name=detail.name,
                status="implemented" if detail.last_ingested_at else STATUS_LABEL["claimed"],
                fact_type="description",
            )
        )
    for t in order:
        for fact in detail.facts.get(t, []):
            if t == "technology":
                continue  # the project record already lists them
            items.append(_fact_item(detail, fact))
            if len(items) >= limit:
                return items
    return items


async def tool_search_projects(session: AsyncSession, args: SearchArgs) -> ToolResult:
    hits = await retrieval.search_projects(session, args.query, limit=4)
    items: list[EvidenceItem] = []
    for hit in hits:
        items.append(_project_item(hit.project))
        for fact in hit.matched[:3]:
            if (fact.type.value if hasattr(fact.type, "value") else fact.type) != "technology":
                items.append(_fact_item(hit.project, fact))
    return ToolResult(
        "search_projects", args.model_dump(), items, [h.project for h in hits], f"{len(hits)} project(s) matched"
    )


async def tool_get_project_details(session: AsyncSession, args: SlugArgs) -> ToolResult:
    detail = await retrieval.get_project(session, args.project_slug)
    if detail is None:
        return ToolResult("get_project_details", args.model_dump(), [], [], "no such project")
    return ToolResult("get_project_details", args.model_dump(), _detail_items(detail), [detail], detail.name)


async def tool_get_project_architecture(session: AsyncSession, args: SlugArgs) -> ToolResult:
    detail = await retrieval.get_project(session, args.project_slug)
    if detail is None:
        return ToolResult("get_project_architecture", args.model_dump(), [], [], "no such project")
    items = _detail_items(
        detail,
        ["architecture", "component", "api", "data_flow", "description", "decision", "challenge", "feature"],
        limit=28,
    )
    return ToolResult("get_project_architecture", args.model_dump(), items, [detail], detail.name)


async def tool_get_implementation_details(session: AsyncSession, args: TopicArgs) -> ToolResult:
    detail = await retrieval.get_project(session, args.project_slug)
    if detail is None:
        return ToolResult("get_implementation_details", args.model_dump(), [], [], "no such project")
    scored: list[tuple[float, Fact]] = []
    for facts in detail.facts.values():
        for fact in facts:
            score = token_overlap(args.topic, f"{fact.key} {_fact_text(fact)}")
            if score > 0:
                scored.append((score, fact))
    scored.sort(key=lambda s: -s[0])
    items = [_project_item(detail)] + [_fact_item(detail, f) for _, f in scored[:10]]
    return ToolResult(
        "get_implementation_details", args.model_dump(), items, [detail], f"{len(scored)} facts touch '{args.topic}'"
    )


async def tool_compare_projects(session: AsyncSession, args: CompareArgs) -> ToolResult:
    cmp = await retrieval.compare_projects(session, args.project_a, args.project_b)
    if cmp is None:
        return ToolResult("compare_projects", args.model_dump(), [], [], "one of the projects is unknown")
    items = _detail_items(cmp.a, limit=16) + _detail_items(cmp.b, limit=16)
    return ToolResult("compare_projects", args.model_dump(), items, [cmp.a, cmp.b], f"{cmp.a.name} vs {cmp.b.name}")


async def tool_search_skill_evidence(session: AsyncSession, args: SkillArgs) -> ToolResult:
    hits = await retrieval.search_skill_evidence(session, args.skill, limit=6)
    items: list[EvidenceItem] = []
    for hit in hits:
        items.append(_project_item(hit.project))
        for ev in hit.evidence[:2]:
            items.append(
                EvidenceItem(
                    url=ev.url,
                    text=(
                        f"{hit.project.name} uses {hit.skill} ({hit.strength.value} evidence): "
                        f"{ev.excerpt or ev.title or ''}"
                    ).strip(),
                    title=ev.title or f"{hit.project.name} · {hit.skill}",
                    kind=ev.kind,
                    project_slug=hit.project.slug,
                    project_name=hit.project.name,
                    status="implemented" if hit.strength.value != "weak" else STATUS_LABEL["claimed"],
                    fact_type="skill",
                )
            )
    return ToolResult(
        "search_skill_evidence",
        args.model_dump(),
        items,
        [h.project for h in hits],
        f"{len(hits)} project(s) show {args.skill}",
    )


async def tool_get_repository_url(session: AsyncSession, args: SlugArgs) -> ToolResult:
    detail = await retrieval.get_project(session, args.project_slug)
    if detail is None:
        return ToolResult("get_repository_url", args.model_dump(), [], [], "no such project")
    text = f"{detail.name} repository: {detail.repo_url or 'not published'}" + (
        f"; live demo: {detail.demo_url}" if detail.demo_url else ""
    )
    item = EvidenceItem(
        url=detail.repo_url or f"{SITE_URL}/#/work/{detail.slug}",
        text=text,
        title=f"{detail.name} — repository",
        kind="project",
        project_slug=detail.slug,
        project_name=detail.name,
        fact_type="link",
    )
    return ToolResult("get_repository_url", args.model_dump(), [item], [detail], detail.name)


async def tool_list_projects(session: AsyncSession, _: NoArgs) -> ToolResult:
    projects = await retrieval.list_projects(session)
    return ToolResult("list_projects", {}, [_project_item(p) for p in projects], projects, f"{len(projects)} projects")


async def tool_get_profile(_: AsyncSession, __: NoArgs) -> ToolResult:
    items = [
        EvidenceItem(url=i["url"], text=i["text"], title=i["title"], kind="portfolio", fact_type="profile")
        for i in PROFILE_ITEMS
    ]
    return ToolResult("get_profile", {}, items, [], "profile")


TOOLS = {
    ToolName.search_projects: tool_search_projects,
    ToolName.get_project_details: tool_get_project_details,
    ToolName.get_project_architecture: tool_get_project_architecture,
    ToolName.get_implementation_details: tool_get_implementation_details,
    ToolName.compare_projects: tool_compare_projects,
    ToolName.search_skill_evidence: tool_search_skill_evidence,
    ToolName.get_repository_url: tool_get_repository_url,
    ToolName.list_projects: tool_list_projects,
    ToolName.get_profile: tool_get_profile,
}


def validate_call(call: ToolCall) -> BaseModel:
    model = ARG_MODELS[call.name]
    try:
        return model.model_validate(call.args)
    except ValidationError as exc:
        raise ToolArgError(f"{call.name.value}: {exc.errors()[0].get('msg', 'invalid arguments')}") from exc


async def run_tool(session: AsyncSession, call: ToolCall) -> ToolResult:
    args = validate_call(call)
    return await TOOLS[call.name](session, args)
