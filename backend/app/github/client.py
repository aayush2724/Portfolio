"""Thin, well-behaved GitHub REST client.

- Conditional requests (`If-None-Match`) so unchanged resources cost no
  rate-limit budget; a 304 is returned to the caller as `None`.
- Bounded retries with backoff on 5xx / connection errors; rate limits
  surface as `RateLimited` with the reset time instead of being retried.
- Size caps: file contents above `max_file_bytes` are not fetched.
- Repository content is data. Nothing here interprets it.
"""

from __future__ import annotations

import asyncio
import base64
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

import httpx
import structlog

log = structlog.get_logger("github")

API_VERSION = "2022-11-28"
RETRYABLE = {500, 502, 503, 504}


class GitHubError(Exception):
    pass


class NotFound(GitHubError):
    pass


class RateLimited(GitHubError):
    def __init__(self, reset_at: datetime | None):
        super().__init__(f"GitHub rate limit exceeded; resets at {reset_at}")
        self.reset_at = reset_at


class FileTooLarge(GitHubError):
    pass


@dataclass(slots=True)
class RepoInfo:
    full_name: str
    default_branch: str
    private: bool
    description: str | None
    html_url: str
    homepage: str | None
    pushed_at: datetime | None
    topics: list[str] = field(default_factory=list)
    language: str | None = None
    fork: bool = False


@dataclass(slots=True)
class ContentFile:
    path: str
    sha: str  # blob sha
    size: int
    content: str
    html_url: str
    etag: str | None


@dataclass(slots=True)
class Response:
    status: int
    json: Any
    etag: str | None
    not_modified: bool


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


class GitHubClient:
    def __init__(
        self,
        token: str | None,
        *,
        base_url: str = "https://api.github.com",
        timeout: float = 20.0,
        max_file_bytes: int = 40_000,
        max_total_bytes: int = 400_000,
        max_retries: int = 3,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.max_file_bytes = max_file_bytes
        self.max_total_bytes = max_total_bytes
        self.max_retries = max_retries
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": API_VERSION,
            "User-Agent": "portfolio-intelligence-agent",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        self._client = client or httpx.AsyncClient(base_url=self.base_url, headers=headers, timeout=timeout)
        self._owns_client = client is None
        if client is not None:
            client.headers.update(headers)
        self.calls = 0

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    # ── low level ────────────────────────────────────────────────────────
    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        etag: str | None = None,
        accept: str | None = None,
    ) -> Response:
        headers: dict[str, str] = {}
        if etag:
            headers["If-None-Match"] = etag
        if accept:
            headers["Accept"] = accept
        url = path if path.startswith("http") else f"{self.base_url}{path}"
        attempt = 0
        while True:
            attempt += 1
            self.calls += 1
            try:
                resp = await self._client.request(method, url, params=params, headers=headers)
            except (httpx.TransportError, httpx.TimeoutException) as exc:
                if attempt > self.max_retries:
                    raise GitHubError(f"GitHub request failed: {exc}") from exc
                await asyncio.sleep(min(2 ** (attempt - 1) * 0.5, 8))
                continue

            if resp.status_code == 304:
                return Response(304, None, resp.headers.get("ETag"), True)
            if resp.status_code == 404:
                raise NotFound(path)
            if resp.status_code in (403, 429) and resp.headers.get("X-RateLimit-Remaining") == "0":
                reset = resp.headers.get("X-RateLimit-Reset")
                reset_at = datetime.fromtimestamp(int(reset), tz=UTC) if reset and reset.isdigit() else None
                raise RateLimited(reset_at)
            if resp.status_code in RETRYABLE and attempt <= self.max_retries:
                await asyncio.sleep(min(2 ** (attempt - 1) * 0.5, 8))
                continue
            if resp.status_code >= 400:
                raise GitHubError(f"GitHub {resp.status_code} for {path}: {resp.text[:200]}")
            payload: Any
            if accept and "raw" in accept:
                payload = resp.text
            else:
                payload = resp.json() if resp.content else None
            return Response(resp.status_code, payload, resp.headers.get("ETag"), False)

    # ── repositories ─────────────────────────────────────────────────────
    async def get_repo(self, owner: str, name: str) -> RepoInfo:
        r = await self._request("GET", f"/repos/{owner}/{name}")
        d = r.json
        return RepoInfo(
            full_name=d["full_name"],
            default_branch=d.get("default_branch") or "main",
            private=bool(d.get("private")),
            description=d.get("description"),
            html_url=d.get("html_url") or f"https://github.com/{owner}/{name}",
            homepage=d.get("homepage") or None,
            pushed_at=_parse_dt(d.get("pushed_at")),
            topics=list(d.get("topics") or []),
            language=d.get("language"),
            fork=bool(d.get("fork")),
        )

    async def get_branch_head(self, owner: str, name: str, branch: str) -> str:
        r = await self._request("GET", f"/repos/{owner}/{name}/commits/{branch}")
        return r.json["sha"]

    async def get_readme(
        self, owner: str, name: str, *, ref: str | None = None, etag: str | None = None
    ) -> ContentFile | None:
        """The repository README at `ref` (default branch when None). `None` on 304."""
        params = {"ref": ref} if ref else None
        r = await self._request("GET", f"/repos/{owner}/{name}/readme", params=params, etag=etag)
        if r.not_modified:
            return None
        return self._content_file(r)

    async def get_file(self, owner: str, name: str, path: str, *, ref: str) -> ContentFile:
        r = await self._request("GET", f"/repos/{owner}/{name}/contents/{path}", params={"ref": ref})
        d = r.json
        if isinstance(d, list):
            raise GitHubError(f"{path} is a directory")
        size = int(d.get("size") or 0)
        if size > self.max_file_bytes:
            raise FileTooLarge(f"{path} is {size} bytes (cap {self.max_file_bytes})")
        return self._content_file(r)

    def _content_file(self, r: Response) -> ContentFile:
        d = r.json
        raw = d.get("content") or ""
        if d.get("encoding") == "base64":
            text = base64.b64decode(raw).decode("utf-8", "replace")
        else:
            text = raw
        return ContentFile(
            path=d.get("path") or d.get("name") or "",
            sha=d.get("sha") or "",
            size=int(d.get("size") or len(text)),
            content=text,
            html_url=d.get("html_url") or "",
            etag=r.etag,
        )

    # ── activity (used from M3) ──────────────────────────────────────────
    async def list_commits(
        self,
        owner: str,
        name: str,
        *,
        sha: str | None = None,
        since: datetime | None = None,
        per_page: int = 50,
        etag: str | None = None,
    ) -> tuple[list[dict[str, Any]], str | None] | None:
        params: dict[str, Any] = {"per_page": per_page}
        if sha:
            params["sha"] = sha
        if since:
            params["since"] = since.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        r = await self._request("GET", f"/repos/{owner}/{name}/commits", params=params, etag=etag)
        if r.not_modified:
            return None
        return list(r.json or []), r.etag

    async def compare(self, owner: str, name: str, base: str, head: str) -> dict[str, Any]:
        r = await self._request("GET", f"/repos/{owner}/{name}/compare/{base}...{head}")
        return r.json

    async def list_releases(self, owner: str, name: str, *, etag: str | None = None, per_page: int = 20):
        r = await self._request("GET", f"/repos/{owner}/{name}/releases", params={"per_page": per_page}, etag=etag)
        if r.not_modified:
            return None
        return list(r.json or []), r.etag

    async def list_recent_closed_pulls(self, owner: str, name: str, *, per_page: int = 30) -> list[dict[str, Any]]:
        r = await self._request(
            "GET",
            f"/repos/{owner}/{name}/pulls",
            params={"state": "closed", "sort": "updated", "direction": "desc", "per_page": per_page},
        )
        return [p for p in (r.json or []) if p.get("merged_at")]
