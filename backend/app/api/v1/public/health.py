from __future__ import annotations

import structlog
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import get_settings
from app.db.session import get_engine

router = APIRouter(tags=["health"])
log = structlog.get_logger("health")


@router.get("/healthz")
async def healthz() -> JSONResponse:
    settings = get_settings()
    db = "ok"
    try:
        async with get_engine().connect() as conn:
            await conn.execute(text("select 1"))
    except Exception as exc:  # noqa: BLE001 - health must never raise
        db = "error"
        log.warning("healthz_db_error", error=type(exc).__name__)
    ok = db == "ok"
    return JSONResponse(
        status_code=200 if ok else 503,
        content={
            "status": "ok" if ok else "degraded",
            "db": db,
            "scheduler": "disabled",  # M3 reports the real state
            "version": settings.app_version,
            "env": settings.app_env,
        },
    )
