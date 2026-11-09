"""Deterministic README processing: split into addressable sections, build
GitHub-style anchors, and pull out technologies, features, planned items
and architecture text without a model call.

Everything here treats the README as data. It never executes or follows
instructions found in it.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from urllib.parse import unquote

HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
FENCE = re.compile(r"^\s*(```|~~~)")
LIST_ITEM = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+(.+)$")
IMAGE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)[^)]*\)")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)[^)]*\)")
HTML_TAG = re.compile(r"<[^>]+>")
TAGLINE = re.compile(r"^(\*\*|__|\*|_)[^*_].*\1$")
BADGE_URL = re.compile(r"img\.shields\.io/badge/([^-/?]+(?:--[^-/?]+)*)-", re.I)

SECTION_KINDS: dict[str, tuple[str, ...]] = {
    "features": ("feature", "what it does", "highlights", "capabilities", "what this is", "key points"),
    "planned": (
        "roadmap",
        "todo",
        "to do",
        "planned",
        "future",
        "coming soon",
        "not implemented",
        "limitations",
        "known issues",
        "out of scope",
    ),
    "architecture": ("architecture", "how it works", "design", "system", "pipeline", "workflow", "structure"),
    "api": ("api", "endpoint", "routes"),
    "stack": ("tech stack", "stack", "built with", "technolog", "tools used", "dependencies"),
    "overview": ("overview", "about", "introduction", "what is", "description", "summary"),
    "setup": (
        "install",
        "setup",
        "getting started",
        "quick start",
        "quickstart",
        "usage",
        "running",
        "deploy",
        "configuration",
        "environment",
    ),
    "testing": ("test", "evaluation", "benchmark", "results"),
}

# Words that appear as badge labels but are not technologies.
BADGE_STOPLIST = {
    "license",
    "build",
    "tests",
    "test",
    "status",
    "coverage",
    "ci",
    "mit",
    "live",
    "demo",
    "version",
    "release",
    "prs",
    "pr",
    "welcome",
    "contributions",
    "stars",
    "forks",
    "issues",
    "docs",
    "documentation",
    "made with",
    "maintained",
    "passing",
    "deploy",
    "deployed",
    "online",
    "offline",
    "python version",
    "code style",
}

# Canonical technology → pattern.
TECH_PATTERNS: dict[str, str] = {
    "Python": r"\bpython\b",
    "FastAPI": r"\bfastapi\b",
    "Django": r"\bdjango\b",
    "Flask": r"\bflask\b",
    "Node.js": r"\bnode(?:\.js|js)\b",
    "Express": r"\bexpress(?:\.js|js)?\b",
    "React": r"\breact(?:\.js|js)?\b",
    "Next.js": r"\bnext(?:\.js|js)\b",
    "Vue": r"\bvue(?:\.js|js)?\b",
    "TypeScript": r"\btypescript\b",
    "JavaScript": r"\bjavascript\b",
    "Tailwind CSS": r"\btailwind(?:\s?css)?\b",
    "Vite": r"\bvite\b",
    "PostgreSQL": r"\bpostgres(?:ql)?\b",
    "MySQL": r"\bmysql\b",
    "MongoDB": r"\bmongo(?:db)?\b",
    "Redis": r"\bredis\b",
    "SQLite": r"\bsqlite\b",
    "Prisma": r"\bprisma\b",
    "SQLAlchemy": r"\bsqlalchemy\b",
    "Mongoose": r"\bmongoose\b",
    "Docker": r"\bdocker\b",
    "Kubernetes": r"\bkubernetes\b|\bk8s\b",
    "GitHub Actions": r"\bgithub actions\b",
    "Vercel": r"\bvercel\b",
    "Render": r"\brender\b",
    "Railway": r"\brailway\b",
    "Firebase": r"\bfirebase\b",
    "Supabase": r"\bsupabase\b",
    "Neon": r"\bneon\b",
    "Upstash": r"\bupstash\b",
    "LangChain": r"\blangchain\b",
    "LangGraph": r"\blanggraph\b",
    "OpenAI": r"\bopenai\b",
    "Gemini": r"\bgemini\b",
    "Groq": r"\bgroq\b",
    "Ollama": r"\bollama\b",
    "OpenRouter": r"\bopenrouter\b",
    "Hugging Face": r"\bhugging\s?face\b",
    "Transformers": r"\btransformers\b",
    "PyTorch": r"\bpytorch\b|\btorch\b",
    "TensorFlow": r"\btensorflow\b",
    "scikit-learn": r"\bscikit-learn\b|\bsklearn\b",
    "NumPy": r"\bnumpy\b",
    "pandas": r"\bpandas\b",
    "FAISS": r"\bfaiss\b",
    "pgvector": r"\bpgvector\b",
    "WebSockets": r"\bwebsockets?\b",
    "Socket.io": r"\bsocket\.io\b",
    "Server-Sent Events": r"\bserver-sent events\b|\bSSE\b",
    "JWT": r"\bjwt\b",
    "OAuth": r"\boauth\b",
    "Prometheus": r"\bprometheus\b",
    "Grafana": r"\bgrafana\b",
    "Playwright": r"\bplaywright\b",
    "pytest": r"\bpytest\b",
    "Vitest": r"\bvitest\b",
    "Jest": r"\bjest\b",
    "Three.js": r"\bthree(?:\.js|js)\b",
    "GSAP": r"\bgsap\b",
    "Framer Motion": r"\bframer motion\b",
    "Pyodide": r"\bpyodide\b",
    "Leaflet": r"\bleaflet\b",
    "Twilio": r"\btwilio\b",
    "Cloudinary": r"\bcloudinary\b",
    "ACRCloud": r"\bacrcloud\b",
    "MQTT": r"\bmqtt\b",
    "Celery": r"\bcelery\b",
    "RQ": r"\bRQ\b",
    "Alembic": r"\balembic\b",
    "Pydantic": r"\bpydantic\b",
    "C++": r"\bC\+\+",
    "Java": r"\bjava\b(?!script)",
    "Go": r"\bGolang\b",
    "Rust": r"\brust\b",
    "PHP": r"\bphp\b",
    "HTML": r"\bhtml5?\b",
    "CSS": r"\bcss3?\b",
    "Bootstrap": r"\bbootstrap\b",
    "Chart.js": r"\bchart\.js\b",
    "D3": r"\bd3(?:\.js)?\b",
    "Stripe": r"\bstripe\b",
    "Razorpay": r"\brazorpay\b",
    "Web Audio API": r"\bweb audio\b",
    "IndexedDB": r"\bindexeddb\b",
    "Streamlit": r"\bstreamlit\b",
    "Uvicorn": r"\buvicorn\b",
    "Nginx": r"\bnginx\b",
    "RabbitMQ": r"\brabbitmq\b",
    "Kafka": r"\bkafka\b",
    "GraphQL": r"\bgraphql\b",
    "REST": r"\bREST(?:ful)?\b",
    "Electron": r"\belectron\b",
    "Flutter": r"\bflutter\b",
    "Android": r"\bandroid\b",
    "Whisper": r"\bwhisper\b",
    "librosa": r"\blibrosa\b",
    "OpenCV": r"\bopencv\b",
    "Arduino": r"\barduino\b",
    "Raspberry Pi": r"\braspberry pi\b",
    "ESP32": r"\besp32\b",
    "TensorFlow Lite": r"\btflite\b|\btensorflow lite\b",
}

# Names that are also ordinary English (or too short to be safe). They count
# only where a README *lists* technologies: badges and stack sections. In
# prose, "render the page", "express the idea", "neon colours" or "a stripe"
# must not become implemented technologies.
AMBIGUOUS = {
    "Express",
    "Render",
    "Railway",
    "Neon",
    "Transformers",
    "Whisper",
    "Electron",
    "Stripe",
    "Java",
    "REST",
    "Go",
    "C++",
    "RQ",
    "Rust",
    "HTML",
    "CSS",
    "PHP",
    "Android",
    "D3",
    "Bootstrap",
    "Leaflet",
    "Mongoose",
    "pandas",
    "Celery",
    "Gemini",
    "Flutter",
    "Kafka",
    "Jest",
    "Vite",
    "Vue",
}
# Short, ambiguous names stay case-sensitive so "go to", "rest of" and "rq" in prose do not match.
CASE_SENSITIVE = {"RQ", "C++", "Go", "REST"}
# Labels seen in badges / stack lists that name a technology by another spelling.
ALIASES = {
    "node": "Node.js",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "postgres": "PostgreSQL",
    "mongo": "MongoDB",
    "k8s": "Kubernetes",
    "sklearn": "scikit-learn",
    "torch": "PyTorch",
    "tailwind": "Tailwind CSS",
    "nextjs": "Next.js",
    "reactjs": "React",
    "golang": "Go",
    "tflite": "TensorFlow Lite",
    "sse": "Server-Sent Events",
    "huggingface": "Hugging Face",
    "websocket": "WebSockets",
    "socketio": "Socket.io",
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
}
_TECH_RE = {name: re.compile(pat, 0 if name in CASE_SENSITIVE else re.I) for name, pat in TECH_PATTERNS.items()}
_TECH_CANON = {name.lower(): name for name in _TECH_RE}

# How much a mention is worth, by where it appears.
CONFIDENCE_BY_CONTEXT = {
    "badges": 0.9,
    "stack": 0.9,
    "architecture": 0.8,
    "api": 0.8,
    "overview": 0.8,
    "preamble": 0.8,
    "features": 0.7,
    "setup": 0.7,
    "testing": 0.65,
    "other": 0.6,
}
EXPLICIT_CONTEXTS = {"badges", "stack"}


@dataclass(slots=True)
class Section:
    level: int
    title: str
    anchor: str
    body: str
    order: int
    kind: str = "other"
    items: list[str] = field(default_factory=list)


@dataclass(slots=True)
class TechHit:
    """One technology the README names, with how strongly it says so."""

    name: str
    status: str  # "implemented" | "planned"
    confidence: float
    anchors: list[str] = field(default_factory=list)
    explicit: bool = False  # listed in a badge or a stack section


def strip_markdown(text: str) -> str:
    """Plain text for a line or short paragraph: no images, badges, links or tags."""
    text = IMAGE.sub("", text)
    text = LINK.sub(lambda m: m.group(1), text)
    text = HTML_TAG.sub("", text)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)
    text = re.sub(r"(\*|_)(.*?)\1", r"\2", text)
    text = re.sub(r"~~(.*?)~~", r"\1", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def github_anchor(title: str) -> str:
    """GitHub's heading anchor: lowercase, keep word chars/spaces/hyphens, spaces → hyphens."""
    plain = strip_markdown(title).lower()
    plain = re.sub(r"[^\w\- ]", "", plain)
    return plain.strip().replace(" ", "-")


def classify_section(title: str) -> str:
    t = strip_markdown(title).lower()
    for kind, needles in SECTION_KINDS.items():
        if any(n in t for n in needles):
            return kind
    return "other"


def split_sections(markdown: str) -> list[Section]:
    """Heading-delimited sections; the text before the first heading is the
    preamble (level 0, anchor ''). Fenced code is never mistaken for headings.
    Duplicate anchors get GitHub's -1, -2 suffixes."""
    sections: list[Section] = []
    current = Section(0, "", "", "", 0)
    lines: list[str] = []
    in_fence = False
    seen: dict[str, int] = {}

    def flush() -> None:
        current.body = "\n".join(lines).strip("\n")
        sections.append(current)

    for raw in markdown.splitlines():
        if FENCE.match(raw):
            in_fence = not in_fence
            lines.append(raw)
            continue
        m = None if in_fence else HEADING.match(raw)
        if not m:
            lines.append(raw)
            continue
        flush()
        title = m.group(2).strip()
        anchor = github_anchor(title)
        if anchor in seen:
            seen[anchor] += 1
            anchor = f"{anchor}-{seen[anchor]}"
        else:
            seen[anchor] = 0
        current = Section(len(m.group(1)), strip_markdown(title), anchor, "", len(sections))
        current.kind = classify_section(title)
        lines = []
    flush()
    for s in sections:
        s.items = list_items(s.body)
    return sections


def list_items(body: str) -> list[str]:
    items: list[str] = []
    in_fence = False
    for raw in body.splitlines():
        if FENCE.match(raw):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = LIST_ITEM.match(raw)
        if m:
            text = strip_markdown(m.group(1))
            if text and len(text) <= 300:
                items.append(text)
    return items


def first_paragraph(body: str) -> str | None:
    """First prose paragraph: skips badges, images, HTML blocks, headings, lists, quotes and taglines."""
    para: list[str] = []
    in_fence = False
    for raw in body.splitlines():
        if FENCE.match(raw):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        line = raw.strip()
        if not line:
            if para:
                break
            continue
        if line.startswith(("#", ">", "|", "<", "![", "[![", "---", "- ", "* ", "+ ")) or LIST_ITEM.match(line):
            if para:
                break
            continue
        # A lone emphasised line under the title is a tagline, not the description.
        if not para and TAGLINE.match(line):
            continue
        plain = strip_markdown(line)
        if plain:
            para.append(plain)
    text = " ".join(para).strip()
    return text or None


def canonical_tech(label: str) -> str | None:
    """Map a badge label or stack-list entry to a canonical technology name."""
    key = re.sub(r"\s+", " ", label.strip().lower().strip(" -–—:"))
    if not key:
        return None
    if key in ALIASES:
        return ALIASES[key]
    if key in _TECH_CANON:
        return _TECH_CANON[key]
    for canon, rx in _TECH_RE.items():
        if rx.fullmatch(key if canon not in CASE_SENSITIVE else label.strip()):
            return canon
    return None


def badge_labels(markdown: str) -> list[str]:
    labels: list[str] = []
    for alt, url in IMAGE.findall(markdown):
        label = alt.strip()
        m = BADGE_URL.search(url)
        if m and not label:
            label = unquote(m.group(1)).replace("--", "\u0000").replace("_", " ").replace("\u0000", "-").strip()
        if label and label.lower() not in BADGE_STOPLIST and len(label) <= 32:
            labels.append(label)
    return labels


def _context(section: Section) -> str:
    if section.level == 0:
        return "preamble"
    return section.kind if section.kind in CONFIDENCE_BY_CONTEXT else "other"


def extract_technologies(markdown: str, sections: list[Section]) -> dict[str, TechHit]:
    """Canonical technology → TechHit.

    Badges and stack sections are explicit lists and count for every name.
    Prose counts only for distinctive names (never for `AMBIGUOUS` ones).
    A name that appears only in roadmap / limitation sections is `planned`.
    """
    hits: dict[str, TechHit] = {}

    def add(name: str, anchor: str, context: str, *, planned: bool = False) -> None:
        hit = hits.get(name)
        status = "planned" if planned else "implemented"
        confidence = 0.6 if planned else CONFIDENCE_BY_CONTEXT[context]
        if hit is None:
            hits[name] = TechHit(name, status, confidence, [anchor], context in EXPLICIT_CONTEXTS)
            return
        if anchor not in hit.anchors:
            hit.anchors.append(anchor)
        if hit.status == "planned" and not planned:
            hit.status, hit.confidence = "implemented", confidence
        elif not planned:
            hit.confidence = max(hit.confidence, confidence)
        hit.explicit = hit.explicit or context in EXPLICIT_CONTEXTS

    for label in badge_labels(markdown):
        canon = canonical_tech(label)
        if canon:
            add(canon, "badges", "badges")

    for s in sections:
        anchor = s.anchor or "preamble"
        if s.kind == "stack":
            for item in s.items:
                # "**Backend:** FastAPI, Redis" → check each comma/slash part after the label
                payload = item.split(":", 1)[1] if ":" in item else item
                for part in re.split(r"[,/•|()]| and | with ", payload):
                    canon = canonical_tech(part)
                    if canon:
                        add(canon, anchor, "stack")
            for canon, rx in _TECH_RE.items():
                if rx.search(s.body):
                    add(canon, anchor, "stack")
            continue
        context = _context(s)
        for canon, rx in _TECH_RE.items():
            if canon in AMBIGUOUS or not rx.search(s.body):
                continue
            add(canon, anchor, "other" if s.kind == "planned" else context, planned=s.kind == "planned")

    return dict(sorted(hits.items()))


def extract_features(sections: list[Section]) -> list[tuple[str, str]]:
    """(feature text, anchor) from feature-like sections."""
    out: list[tuple[str, str]] = []
    seen: set[str] = set()
    for s in sections:
        if s.kind != "features":
            continue
        for item in s.items:
            key = item.lower()
            if key not in seen:
                seen.add(key)
                out.append((item, s.anchor))
    return out[:40]


def extract_planned(sections: list[Section]) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for s in sections:
        if s.kind != "planned":
            continue
        for item in s.items:
            out.append((item, s.anchor))
        if not s.items:
            para = first_paragraph(s.body)
            if para:
                out.append((para, s.anchor))
    return out[:40]


def extract_overview(sections: list[Section]) -> tuple[str, str] | None:
    """The README's own one-paragraph description and where it came from."""
    for s in sections:
        if s.level == 0:
            para = first_paragraph(s.body)
            if para and len(para) > 40:
                return para, "preamble"
    for s in sections:
        if s.kind == "overview":
            para = first_paragraph(s.body)
            if para:
                return para, s.anchor
    for s in sections:
        para = first_paragraph(s.body)
        if para and len(para) > 40:
            return para, s.anchor or "preamble"
    return None


def section_text(section: Section, limit: int = 3000) -> str:
    text = re.sub(r"\n{3,}", "\n\n", section.body).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def slug_key(text: str, limit: int = 80) -> str:
    key = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return key[:limit].rstrip("-") or "item"


def token_overlap(a: str, b: str) -> float:
    ta = {t for t in re.findall(r"[a-z0-9]+", a.lower()) if len(t) > 2}
    tb = {t for t in re.findall(r"[a-z0-9]+", b.lower()) if len(t) > 2}
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)
