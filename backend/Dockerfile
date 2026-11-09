# Render (Docker runtime). Migrations run at start so a deploy is self-contained.
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /srv
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev --no-install-project
COPY . .
EXPOSE 8000
# Render supplies $PORT. No uvicorn access log: it prints client addresses, and the app's own
# request log records method, path, status and latency only. X-Forwarded-For is read by the
# app with TRUSTED_PROXY_HOPS (assumed 1 on Render; verified in M6), never trusted wholesale.
CMD ["sh", "-c", "uv run --no-sync alembic upgrade head && uv run --no-sync uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --no-access-log"]
