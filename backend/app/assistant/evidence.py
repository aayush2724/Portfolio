"""The evidence pack: what the model is allowed to know for one answer.
Deterministic ordering, de-duplicated, size-capped, every item numbered
[S1], [S2], … so the answer can cite it and the grounding filter can check."""

from __future__ import annotations

from dataclasses import dataclass, field
from urllib.parse import urlparse

from app.assistant.profile import SITE_URL
from app.assistant.schemas import SourceOut
from app.assistant.tools import EvidenceItem, ToolResult

ALWAYS_ALLOWED_HOSTS = {"github.com", urlparse(SITE_URL).hostname or ""}


@dataclass(slots=True)
class PackedItem:
    id: str
    item: EvidenceItem


@dataclass(slots=True)
class EvidencePack:
    items: list[PackedItem] = field(default_factory=list)
    truncated: bool = False

    @property
    def urls(self) -> set[str]:
        return {p.item.url for p in self.items}

    @property
    def ids(self) -> set[str]:
        return {p.id for p in self.items}

    def link_hosts(self) -> list[str]:
        hosts = set(ALWAYS_ALLOWED_HOSTS)
        for p in self.items:
            host = urlparse(p.item.url).hostname
            if host:
                hosts.add(host)
        return sorted(h for h in hosts if h)

    def by_id(self, sid: str) -> PackedItem | None:
        return next((p for p in self.items if p.id == sid), None)

    def sources(self, ids: list[str] | None = None, limit: int = 6) -> list[SourceOut]:
        """Every cited id is listed, even when two ids share a URL (two facts from one README
        section), so each [Sn] in the answer has a matching entry. Uncited items fill the list up
        to `limit`, skipping URLs already shown."""

        def out_of(p: PackedItem) -> SourceOut:
            return SourceOut(id=p.id, title=p.item.title, url=p.item.url, kind=p.item.kind, project=p.item.project_name)

        out: list[SourceOut] = []
        seen_ids: set[str] = set()
        for sid in ids or []:
            p = self.by_id(sid)
            if p is not None and sid not in seen_ids:
                out.append(out_of(p))
                seen_ids.add(sid)
        seen_urls = {o.url for o in out}
        for p in self.items:
            if len(out) >= max(limit, len(seen_ids)):
                break
            if p.id in seen_ids or p.item.url in seen_urls:
                continue
            out.append(out_of(p))
            seen_urls.add(p.item.url)
        return out

    def render(self) -> str:
        if not self.items:
            return "<evidence>(none)</evidence>"
        lines = ["<evidence>"]
        current: str | None = None
        for p in self.items:
            proj = p.item.project_name or "Profile"
            if proj != current:
                if current is not None:
                    lines.append("</project>")
                lines.append(f'<project name="{proj}">')
                current = proj
            status = f" · {p.item.status}" if p.item.status else ""
            kind = p.item.kind or "source"
            title = p.item.title or p.item.fact_type or ""
            lines.append(f"[{p.id}] ({kind}{status}) {title}: {p.item.text}")
            lines.append(f"    url: {p.item.url}")
        lines.append("</project>")
        lines.append("</evidence>")
        return "\n".join(lines)


def build_pack(results: list[ToolResult], *, max_chars: int = 18_000, max_items: int = 48) -> EvidencePack:
    pack = EvidencePack()
    seen: set[tuple[str, str]] = set()
    used = 0
    n = 0
    for result in results:
        for item in result.items:
            key = (item.url, item.text[:120])
            if key in seen or not item.text.strip():
                continue
            seen.add(key)
            cost = len(item.text) + len(item.url) + 40
            if used + cost > max_chars or n >= max_items:
                pack.truncated = True
                return pack
            n += 1
            used += cost
            pack.items.append(PackedItem(f"S{n}", item))
    return pack
