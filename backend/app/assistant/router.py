"""Deterministic intent routing. Rules first; the model is consulted only
when the rules cannot tell what the visitor wants, and even then it may
only pick from the fixed tool set with validated arguments."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.assistant.schemas import Intent, Plan, ToolCall, ToolName
from app.knowledge.schemas import ProjectSummary

GREETING = re.compile(
    r"^\s*(hi|hello|hey|yo|hii+|heyy+|howdy|good\s*(morning|afternoon|evening)|sup|what'?s up)"
    r"(\s+(there|you|bot|aayush|assistant|everyone))?\b[\s!.?]*$",
    re.I,
)
THANKS = re.compile(r"^\s*(thanks?|thank you|cheers|great|cool|nice|ok(ay)?|got it)\b[\s!.]*$", re.I)
COMPARE = re.compile(r"\b(compare|comparison|versus|vs\.?|difference(s)? between|differ)\b", re.I)
REPO = re.compile(
    r"\b(github|repo(sitory)?|source( code)?|code link|link to|where is the code|live demo|demo link)\b", re.I
)
ARCH = re.compile(
    r"\b(architecture|architected|how (does|do|is|was) .{0,40}(work|built|structured|designed)|how it works|design(ed)?\b|pipeline|components?|data flow|system design|under the hood|internals)\b",
    re.I,
)
IMPL = re.compile(
    r"\b(implement(ed|ation)?|how (do|does|did) .{0,40}(handle|process|store|validate|authenticate|deploy|test|scale|cache|stream)|auth(entication)?|database|schema|retriev|rag|embedding|vector|queue|websocket|caching|testing|tests?|deploy(ment)?|ci\b|docker|challenge|hardest|improve|trade-?off)\b",
    re.I,
)
SKILL = re.compile(
    r"\b(which|what) projects?\b.*\b(use|used|using|demonstrat|show|involv|built with|written in|with)\b|\bexperience (with|in)\b|\bevidence of\b|\bhave you (used|worked with|built with)\b|\bskills? in\b|\bprojects? (that|which) (use|show)\b|\bexplore (my|his|the) .*(projects|work)\b",
    re.I,
)
TECH = re.compile(
    r"\b(tech(nolog(y|ies))?|stack|languages?|frameworks?|tools?|libraries|worked with|what (do|does) (you|he) use)\b",
    re.I,
)
PROFILE = re.compile(
    r"\b(who (are|is) (you|aayush|he)|about (you|aayush|him|yourself)|background|contact|email|hire|hiring|resume|cv|linkedin|hackathon|owasp|college|university|student|degree|education|leetcode|guitar|intern(ship)?|experience\b(?! with)|where (is|does) (he|aayush))\b",
    re.I,
)
EXPLORE = re.compile(
    r"\b(explore|show me|list|what (projects|have you built|has he built)|all projects|your projects|his projects|github repositories|repositories)\b",
    re.I,
)
SKILL_AFTER = re.compile(
    r"\b(?:with|in|using|use|used|uses|of|show|demonstrate|involve|involving|built with|written in)\s+(?:my |his |the |a |an |your )?([A-Za-z][A-Za-z0-9+.#/\- ]{1,40}?)(?:\s+(?:projects?|work|skills?|experience|engineering))?\s*[?.!]*$",
    re.I,
)

# Translog is private and not in the knowledge base (owner decision 2026-11-09); questions about it are
# answered from the site's own public description via the profile tool.
TRANSLOG = re.compile(r"\b(translog|hsh( technologies)?|air[- ]freight|quotation desk|internship|intern)\b", re.I)

CATEGORY_SKILLS = {
    "ai": "LangGraph",
    "ml": "scikit-learn",
    "machine learning": "scikit-learn",
    "llm": "LangChain",
    "genai": "LangChain",
    "rag": "FAISS",
    "backend": "FastAPI",
    "frontend": "React",
    "full-stack": "React",
    "fullstack": "React",
    "database": "PostgreSQL",
    "databases": "PostgreSQL",
    "devops": "Docker",
    "infra": "Docker",
    "security": "JWT",
    "real-time": "WebSockets",
    "realtime": "WebSockets",
    "audio": "Web Audio API",
    "music": "Web Audio API",
    "mobile": "Android",
    "data": "pandas",
    "cloud": "Docker",
}


@dataclass(slots=True)
class Alias:
    slug: str
    name: str


class IntentRouter:
    def __init__(self, projects: list[ProjectSummary]) -> None:
        self.slugs = {p.slug for p in projects}
        self.names = {p.slug: p.name for p in projects}
        aliases: dict[str, str] = {}
        for p in projects:
            aliases[p.slug] = p.slug
            aliases[p.name.lower()] = p.slug
            aliases[p.slug.replace("-", " ")] = p.slug
            aliases[p.name.lower().replace(" ", "")] = p.slug
            first = p.name.lower().split()[0] if p.name else ""
            if len(first) >= 5 and first not in {"visitor", "citizen", "disaster", "chord", "job"}:
                aliases.setdefault(first, p.slug)
        self._aliases = sorted(aliases.items(), key=lambda kv: -len(kv[0]))

    def mentions(self, text: str) -> list[str]:
        low = text.lower()
        found: list[tuple[int, str]] = []
        for alias, slug in self._aliases:
            idx = low.find(alias)
            if idx >= 0 and re.search(rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])", low):
                if slug not in [s for _, s in found]:
                    found.append((idx, slug))
        return [s for _, s in sorted(found)]

    @staticmethod
    def _skill_from(text: str) -> str | None:
        low = text.lower()
        for word, skill in CATEGORY_SKILLS.items():
            if re.search(rf"\b{re.escape(word)}\b", low):
                return skill
        m = SKILL_AFTER.search(text.strip())
        if m:
            cand = m.group(1).strip(" ?.!")
            if 1 < len(cand) <= 40 and cand.lower() not in {"project", "projects", "that", "this"}:
                return cand
        return None

    def route(self, message: str, context_slug: str | None = None) -> Plan:
        text = message.strip()
        if GREETING.match(text) or THANKS.match(text):
            return Plan(intent=Intent.smalltalk, tools=[], source="rules")

        mentioned = self.mentions(text)
        if TRANSLOG.search(text):
            others = [slug for slug in mentioned if slug in self.slugs][:2]
            calls = [ToolCall(name=ToolName.get_profile, args={})]
            calls += [ToolCall(name=ToolName.get_project_details, args={"project_slug": slug}) for slug in others]
            intent = Intent.project_comparison if COMPARE.search(text) and others else Intent.profile_question
            return Plan(intent=intent, project_slugs=others, tools=calls[:3])
        ctx = context_slug if context_slug in self.slugs else None
        subjects = mentioned or ([ctx] if ctx else [])
        tools: list[ToolCall] = []

        if COMPARE.search(text) and len(set(mentioned + ([ctx] if ctx else []))) >= 2:
            pair = (mentioned + [ctx] if ctx and ctx not in mentioned else mentioned)[:2]
            tools.append(ToolCall(name=ToolName.compare_projects, args={"project_a": pair[0], "project_b": pair[1]}))
            return Plan(intent=Intent.project_comparison, project_slugs=pair, tools=tools)

        if REPO.search(text) and subjects:
            tools.append(ToolCall(name=ToolName.get_repository_url, args={"project_slug": subjects[0]}))
            return Plan(intent=Intent.repository_link, project_slugs=subjects[:1], tools=tools)

        if subjects and ARCH.search(text):
            tools.append(ToolCall(name=ToolName.get_project_architecture, args={"project_slug": subjects[0]}))
            if len(subjects) > 1:
                tools.append(ToolCall(name=ToolName.get_project_architecture, args={"project_slug": subjects[1]}))
            return Plan(intent=Intent.architecture_explanation, project_slugs=subjects[:2], tools=tools)

        if subjects and IMPL.search(text):
            tools.append(
                ToolCall(
                    name=ToolName.get_implementation_details, args={"project_slug": subjects[0], "topic": text[:160]}
                )
            )
            tools.append(ToolCall(name=ToolName.get_project_details, args={"project_slug": subjects[0]}))
            return Plan(intent=Intent.implementation_question, project_slugs=subjects[:1], tools=tools)

        if subjects:
            for slug in subjects[:2]:
                tools.append(ToolCall(name=ToolName.get_project_details, args={"project_slug": slug}))
            return Plan(intent=Intent.project_explanation, project_slugs=subjects[:2], tools=tools)

        skill = self._skill_from(text)
        category_hit = any(re.search(rf"\b{re.escape(w)}\b", text.lower()) for w in CATEGORY_SKILLS)
        if SKILL.search(text) or (skill and (category_hit or EXPLORE.search(text) or TECH.search(text))):
            if skill:
                tools.append(ToolCall(name=ToolName.search_skill_evidence, args={"skill": skill}))
            tools.append(ToolCall(name=ToolName.search_projects, args={"query": text[:200]}))
            return Plan(intent=Intent.skill_evidence, tools=tools[:3])

        if TECH.search(text):
            tools.append(ToolCall(name=ToolName.list_projects, args={}))
            return Plan(intent=Intent.technology_question, tools=tools)

        if EXPLORE.search(text):
            tools.append(ToolCall(name=ToolName.list_projects, args={}))
            return Plan(intent=Intent.technology_question, tools=tools)

        if PROFILE.search(text):
            tools.append(ToolCall(name=ToolName.get_profile, args={}))
            return Plan(intent=Intent.profile_question, tools=tools)

        return Plan(
            intent=Intent.ambiguous,
            tools=[ToolCall(name=ToolName.search_projects, args={"query": text[:200]})],
            source="fallback",
        )
