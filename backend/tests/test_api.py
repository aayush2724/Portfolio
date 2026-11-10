from app.knowledge.seed import seed_all


async def test_healthz(client):
    r = await client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["db"] == "ok" and r.json()["env"] == "test"
    assert r.headers["x-request-id"]


async def test_projects_endpoints(client, db, seed_data):
    await seed_all(db, seed_data)
    r = await client.get("/api/v1/projects", headers={"X-Request-Id": "req-123"})
    assert r.status_code == 200 and r.headers["x-request-id"] == "req-123"
    assert r.headers["cache-control"] == "no-store"
    slugs = [p["slug"] for p in r.json()]
    assert "auralis" in slugs
    # Candidates (on GitHub, not published on the site) never appear publicly.
    assert "vetra" not in slugs and "urjasetu" not in slugs
    for hidden in ("vetra", "urjasetu"):
        assert (await client.get(f"/api/v1/projects/{hidden}")).status_code == 404
        assert (await client.get(f"/api/v1/projects/{hidden}/knowledge")).status_code == 404

    r = await client.get("/api/v1/projects/auralis")
    body = r.json()
    assert r.status_code == 200 and body["repo_url"] == "https://github.com/aayush2724/Auralis"
    assert body["attribution"] == "co_built" and "technology" in body["facts"]
    fact = body["facts"]["technology"][0]
    assert {"type", "key", "value", "status", "confidence", "version", "evidence"} <= set(fact)

    r = await client.get("/api/v1/projects/auralis/knowledge?type=challenge&status=claimed")
    assert r.status_code == 200 and r.json()["count"] >= 1
    assert all(f["type"] == "challenge" for f in r.json()["facts"])


async def test_error_envelope(client):
    r = await client.get("/api/v1/projects/does-not-exist")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "not_found" and r.json()["error"]["request_id"]
    r = await client.get("/api/v1/projects/Not%20A%20Slug")
    assert r.status_code == 422 and r.json()["error"]["code"] == "invalid_request"
    r = await client.get("/api/v1/projects/auralis/knowledge?type=bogus")
    assert r.status_code == 422


async def test_cors_is_pinned(client):
    r = await client.options(
        "/api/v1/projects",
        headers={"Origin": "https://aayush-2724.vercel.app", "Access-Control-Request-Method": "GET"},
    )
    assert r.headers.get("access-control-allow-origin") == "https://aayush-2724.vercel.app"
    r = await client.options(
        "/api/v1/projects",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in r.headers
