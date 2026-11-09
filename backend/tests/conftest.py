"""Test harness: a real PostgreSQL database (migrated with Alembic), one event
loop for the whole session, a truncate between tests, and a mocked GitHub."""

from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
from pathlib import Path

import httpx
import pytest
import respx

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "postgresql+asyncpg://pia:pia@127.0.0.1:5434/pia_test")


def _assert_safe_test_database(url: str) -> None:
    """The suite drops the public schema. Refuse anything that is not an
    obviously disposable, local (or CI) database whose name ends in `_test`."""
    from urllib.parse import urlparse

    parsed = urlparse(url.replace("postgresql+asyncpg://", "postgresql://"))
    name = (parsed.path or "/").lstrip("/")
    host = parsed.hostname or ""
    local = host in {"localhost", "127.0.0.1", "::1"} or os.environ.get("CI") == "true"
    if not name.endswith("_test") or not local:
        raise RuntimeError(
            f"Refusing to run tests against {host}/{name}: TEST_DATABASE_URL must name a local database ending in _test"
        )


_assert_safe_test_database(TEST_DATABASE_URL)

# Settings are cached on first use, so the test database must win before
# anything imports the app. Never point tests at the developer database.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["DATABASE_URL_DIRECT"] = TEST_DATABASE_URL
os.environ["APP_ENV"] = "test"
os.environ["GITHUB_TOKEN"] = "test-token"  # noqa: S105 - fake, for header assertions only

from app.db.base import Base  # noqa: E402
from app.db.session import dispose_engine, get_engine, get_sessionmaker  # noqa: E402
from app.github.client import GitHubClient  # noqa: E402


def _reset_schema() -> None:
    script = (
        "import asyncio, asyncpg\n"
        f"url = {TEST_DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://')!r}\n"
        "async def main():\n"
        "    conn = await asyncpg.connect(url)\n"
        "    await conn.execute('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')\n"
        "    await conn.close()\n"
        "asyncio.run(main())\n"
    )
    subprocess.run([sys.executable, "-c", script], check=True, cwd=ROOT)


@pytest.fixture(scope="session", autouse=True)
def migrated_database() -> None:
    _reset_schema()
    env = {**os.environ, "DATABASE_URL": TEST_DATABASE_URL, "DATABASE_URL_DIRECT": TEST_DATABASE_URL}
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True, cwd=ROOT, env=env)


@pytest.fixture
async def db():
    """A session per test; every table is truncated afterwards."""
    async with get_sessionmaker()() as session:
        yield session
    tables = ", ".join(f'"{t.name}"' for t in reversed(Base.metadata.sorted_tables))
    async with get_engine().begin() as conn:
        from sqlalchemy import text

        await conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture(scope="session", autouse=True)
async def _dispose_engine_at_end():
    yield
    await dispose_engine()


@pytest.fixture
async def client():
    from app.main import app

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.fixture
def seed_data() -> dict:
    with (ROOT / "seeds" / "projects.seed.json").open(encoding="utf-8") as fh:
        return json.load(fh)


@pytest.fixture
def auralis_readme() -> str:
    return (FIXTURES / "auralis_README.md").read_text(encoding="utf-8")


@pytest.fixture
def sample_readme() -> str:
    return (FIXTURES / "sample_README.md").read_text(encoding="utf-8")


def readme_payload(markdown: str, *, sha: str = "blob0000", path: str = "README.md") -> dict:
    return {
        "name": path,
        "path": path,
        "sha": sha,
        "size": len(markdown.encode()),
        "encoding": "base64",
        "content": base64.b64encode(markdown.encode()).decode(),
        "html_url": f"https://github.com/aayush2724/Auralis/blob/main/{path}",
    }


@pytest.fixture
def github_mock():
    with respx.mock(base_url="https://api.github.com", assert_all_called=False) as mock:
        yield mock


@pytest.fixture
async def gh() -> GitHubClient:
    client = GitHubClient("test-token", max_retries=2)
    yield client
    await client.aclose()


def mock_repo(
    mock: respx.MockRouter,
    full_name: str,
    *,
    head_sha: str,
    readme: str,
    default_branch: str = "main",
    private: bool = False,
) -> None:
    owner, name = full_name.split("/")
    mock.get(f"/repos/{owner}/{name}").mock(
        return_value=httpx.Response(
            200,
            json={
                "full_name": full_name,
                "default_branch": default_branch,
                "private": private,
                "description": f"{name} description from GitHub",
                "html_url": f"https://github.com/{full_name}",
                "homepage": None,
                "pushed_at": "2026-11-01T10:00:00Z",
                "topics": ["fastapi"],
                "language": "Python",
                "fork": False,
            },
        )
    )
    mock.get(f"/repos/{owner}/{name}/commits/{default_branch}").mock(
        return_value=httpx.Response(200, json={"sha": head_sha})
    )
    etag = f'"{head_sha[:8]}"'
    payload = readme_payload(readme, sha=f"blob-{head_sha[:8]}")

    def readme_route(request: httpx.Request) -> httpx.Response:
        # Conditional request support, like GitHub: same ETag → 304 with no body.
        if request.headers.get("If-None-Match") == etag:
            return httpx.Response(304, headers={"ETag": etag})
        return httpx.Response(200, json=payload, headers={"ETag": etag})

    mock.get(f"/repos/{owner}/{name}/readme").mock(side_effect=readme_route)
