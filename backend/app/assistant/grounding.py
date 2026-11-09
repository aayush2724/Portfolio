"""Post-generation grounding: strip images, drop links and citations that do
not point at the evidence, and count what was removed as a quality signal."""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urlparse

from app.assistant.evidence import EvidencePack

MD_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
BARE_URL = re.compile(r"(?<![(\[])\bhttps?://[^\s)\]>]+")
CITATION = re.compile(r"\[(S\d+)\]")
CITATION_GROUP = re.compile(r"\[\s*(S\d+(?:\s*[,;]\s*S\d+)+)\s*\]")
HTML_TAG = re.compile(r"</?(?:script|iframe|img|style|object|embed|link|meta)[^>]*>", re.I)


@dataclass(slots=True)
class Grounded:
    text: str
    dropped: int
    cited: list[str]


def _allowed(url: str, pack: EvidencePack, hosts: set[str]) -> bool:
    if url in pack.urls:
        return True
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    return parsed.scheme in {"http", "https"} and (parsed.hostname or "") in hosts


def ground(text: str, pack: EvidencePack) -> Grounded:
    dropped = 0
    hosts = set(pack.link_hosts())
    # Models often group citations: "[S4, S6, S7]" becomes "[S4][S6][S7]" so each one is checked.
    text = CITATION_GROUP.sub(lambda m: "".join(f"[{c.strip()}]" for c in re.split(r"[,;]", m.group(1))), text)

    text, n = MD_IMAGE.subn("", text)
    dropped += n
    text, n = HTML_TAG.subn("", text)
    dropped += n

    def link(m: re.Match[str]) -> str:
        nonlocal dropped
        label, url = m.group(1), m.group(2)
        if CITATION.fullmatch(f"[{label}]"):
            return m.group(0)
        if _allowed(url, pack, hosts):
            return m.group(0)
        dropped += 1
        return label

    text = MD_LINK.sub(link, text)

    def bare(m: re.Match[str]) -> str:
        nonlocal dropped
        url = m.group(0).rstrip(".,;")
        if _allowed(url, pack, hosts):
            return m.group(0)
        dropped += 1
        return ""

    text = BARE_URL.sub(bare, text)

    cited: list[str] = []
    valid = pack.ids

    def cite(m: re.Match[str]) -> str:
        nonlocal dropped
        sid = m.group(1)
        if sid in valid:
            if sid not in cited:
                cited.append(sid)
            return m.group(0)
        dropped += 1
        return ""

    text = CITATION.sub(cite, text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return Grounded(text=text, dropped=dropped, cited=cited)
