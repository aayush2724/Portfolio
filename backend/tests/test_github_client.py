import httpx
import pytest

from app.github.client import FileTooLarge, GitHubError, NotFound, RateLimited
from tests.conftest import readme_payload


async def test_get_repo_and_head(github_mock, gh):
    github_mock.get("/repos/aayush2724/Auralis").mock(
        return_value=httpx.Response(
            200,
            json={
                "full_name": "aayush2724/Auralis",
                "default_branch": "main",
                "private": False,
                "description": "d",
                "html_url": "https://github.com/aayush2724/Auralis",
                "pushed_at": "2026-11-01T10:00:00Z",
                "topics": ["a"],
                "language": "Python",
            },
        )
    )
    github_mock.get("/repos/aayush2724/Auralis/commits/main").mock(
        return_value=httpx.Response(200, json={"sha": "abc123"})
    )
    info = await gh.get_repo("aayush2724", "Auralis")
    assert info.default_branch == "main" and info.pushed_at is not None and info.topics == ["a"]
    assert await gh.get_branch_head("aayush2724", "Auralis", "main") == "abc123"
    sent = github_mock.calls.last.request
    assert sent.headers["Authorization"] == "Bearer test-token"
    assert sent.headers["X-GitHub-Api-Version"] == "2022-11-28"


async def test_readme_decodes_base64_and_honours_etag(github_mock, gh):
    route = github_mock.get("/repos/o/r/readme").mock(
        side_effect=[
            httpx.Response(200, json=readme_payload("# Hi\n\nHello"), headers={"ETag": '"v1"'}),
            httpx.Response(304),
        ]
    )
    first = await gh.get_readme("o", "r", ref="deadbeef")
    assert first is not None and first.content.startswith("# Hi") and first.etag == '"v1"'
    assert route.calls[0].request.url.params["ref"] == "deadbeef"
    second = await gh.get_readme("o", "r", ref="deadbeef", etag='"v1"')
    assert second is None
    assert route.calls[1].request.headers["If-None-Match"] == '"v1"'


async def test_not_found_and_rate_limit(github_mock, gh):
    github_mock.get("/repos/o/missing/readme").mock(return_value=httpx.Response(404, json={"message": "Not Found"}))
    with pytest.raises(NotFound):
        await gh.get_readme("o", "missing")
    github_mock.get("/repos/o/r").mock(
        return_value=httpx.Response(
            403, json={"message": "rate"}, headers={"X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1800000000"}
        )
    )
    with pytest.raises(RateLimited) as exc:
        await gh.get_repo("o", "r")
    assert exc.value.reset_at is not None


async def test_retries_server_errors_then_succeeds(github_mock, gh):
    route = github_mock.get("/repos/o/r/commits/main").mock(
        side_effect=[httpx.Response(502), httpx.Response(200, json={"sha": "ok"})]
    )
    assert await gh.get_branch_head("o", "r", "main") == "ok"
    assert route.call_count == 2


async def test_gives_up_after_max_retries(github_mock, gh):
    github_mock.get("/repos/o/r/commits/main").mock(return_value=httpx.Response(503))
    with pytest.raises(GitHubError):
        await gh.get_branch_head("o", "r", "main")


async def test_file_size_cap(github_mock, gh):
    github_mock.get("/repos/o/r/contents/big.py").mock(
        return_value=httpx.Response(
            200, json={"path": "big.py", "sha": "s", "size": 1_000_000, "encoding": "base64", "content": ""}
        )
    )
    with pytest.raises(FileTooLarge):
        await gh.get_file("o", "r", "big.py", ref="main")
