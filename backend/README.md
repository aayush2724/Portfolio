# Portfolio Intelligence Agent — backend

FastAPI service behind the portfolio's AI assistant and GitHub intelligence. Design and roadmap live in `../docs/` (`ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `SECURITY.md`). This README is the operator's guide.

## What exists after Milestone 1

- A PostgreSQL **knowledge base**: projects, evidence sources, typed facts with a truth status (`implemented` / `partial` / `planned` / `claimed`), append-only fact versions, per-project skills.
- **Seeding** from the site's own project copy (`node scripts/export-seed.mjs` at the repo root → `seeds/projects.seed.json`); every statement is stored as `claimed` with a link to the data file it came from.
- **README ingestion** from GitHub: one evidence source per README section with a permalink at the exact commit, deterministic extraction of technologies / features / planned items / architecture text, and promotion of portfolio claims the README confirms.
- Read-only public API: `GET /healthz`, `GET /api/v1/projects`, `GET /api/v1/projects/{slug}`, `GET /api/v1/projects/{slug}/knowledge?type=&status=`.

No model is called in Milestone 1. Nothing here writes to GitHub.

## What exists after Milestone 2

- The **visitor assistant** (`app/assistant/`): deterministic intent router → read-only tools over the knowledge base → evidence pack → one streamed model call → grounding filter. SSE endpoint `POST /api/v1/assistant/chat`, `GET /api/v1/assistant/status`, `POST /api/v1/assistant/feedback`.
- An **LLM provider** for OpenAI-compatible endpoints (OpenRouter by default) with typed errors and cost accounting (`app/llm/`), a `fake` provider for development, and a daily budget enforced from `llm_calls`.
- Rate limits (per hashed IP and per session), metrics-only conversation records, and the privacy disclosure on the site.

Run without a key: `LLM_PROVIDER=fake uv run uvicorn app.main:app --port 8010` answers with scripted text through the real streaming path. With a key: put `LLM_API_KEY=<openrouter key>` in `backend/.env`.

## Local development

Requirements: Python 3.12 via [uv](https://docs.astral.sh/uv/) (`uv` downloads it), Docker (for PostgreSQL), Node 20 (for the seed exporter).

```bash
# 1. PostgreSQL for dev + tests (any 16+ works; this keeps it isolated on port 5434)
docker run -d --name pia-postgres -e POSTGRES_USER=pia -e POSTGRES_PASSWORD=pia \
  -e POSTGRES_DB=pia_dev -p 127.0.0.1:5434:5432 postgres:16-alpine
docker exec pia-postgres psql -U pia -d pia_dev -c "CREATE DATABASE pia_test"

# 2. Dependencies
cd backend && uv sync --all-groups

# 3. Configuration — copy the backend section of ../.env.example to backend/.env
#    (DATABASE_URL defaults to the container above; GITHUB_TOKEN raises the
#    rate limit and is required for the private Translog repository)

# 4. Schema
uv run alembic upgrade head

# 5. Knowledge
(cd .. && node scripts/export-seed.mjs)   # portfolio copy → seeds/projects.seed.json
uv run python -m app.cli seed             # claimed facts
GITHUB_TOKEN="$(gh auth token)" uv run python -m app.cli ingest --all   # README evidence

# 6. Run
uv run uvicorn app.main:app --reload --port 8000
curl -s localhost:8000/api/v1/projects/auralis/knowledge?type=technology | jq '.facts[0]'
```

`uv run python -m app.cli list` shows each project with the README SHA it was last read at; `ingest --slug <slug> --force` re-reads one repository even if its head commit has not moved.

## Tests

```bash
uv run pytest            # needs the pia_test database; the suite migrates it from scratch
uv run ruff check app tests alembic && uv run ruff format --check app tests alembic
```

The suite runs against a real PostgreSQL (`TEST_DATABASE_URL`, default `…/pia_test`), mocks GitHub with `respx` using the recorded Auralis README under `tests/fixtures/`, and truncates every table between tests. It never touches `DATABASE_URL`.

## Migrations

Alembic, async engine, URL from `DATABASE_URL_DIRECT` (falls back to `DATABASE_URL`). Tables are never created at application start.

```bash
uv run alembic revision --autogenerate -m "describe change"   # review the file before committing
uv run alembic upgrade head
uv run alembic downgrade -1
```

## Layout

```
app/
  main.py             FastAPI factory, CORS, middleware, routers
  config.py           pydantic-settings (see ../.env.example)
  cli.py              seed / ingest / list / hash-password
  api/                errors (one envelope), v1/public/{health,projects,assistant}
  assistant/          router (intents), tools, evidence pack, prompts, grounding, ratelimit, sse, service
  llm/                provider (OpenAI-compatible httpx client), fake, budget
  db/                 base, session, models/{knowledge,github,ops,visitor}
  github/client.py    httpx client: ETags, retries, size caps, rate-limit awareness
  knowledge/
    readme.py         deterministic README processing (sections, anchors, technologies…)
    facts.py          versioned fact upsert
    seed.py           portfolio copy → claimed facts
    ingest.py         README → evidence + facts, claim promotion
    retrieval.py      SQL + full-text retrieval used by the API and (later) the assistant
    schemas.py        read models
  observability/      structlog + request-id middleware
alembic/              migrations
seeds/                generated seed file (committed; regenerate when the site's copy changes)
tests/                pytest, real PostgreSQL, mocked GitHub
```

## Deployment (Render)

The `Dockerfile` runs `alembic upgrade head` and then uvicorn with proxy headers on `$PORT`. Full deployment steps, environment variables and the external sync trigger for the free instance are documented in `../docs/IMPLEMENTATION_PLAN.md` (M6) and `../.env.example`.
