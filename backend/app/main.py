"""FastAPI application factory for the Portfolio Intelligence Agent backend."""

from __future__ import annotations

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import register_error_handlers
from app.api.v1.public import assistant, health, projects
from app.assistant.service import AssistantService
from app.config import get_settings
from app.db.session import dispose_engine
from app.llm.provider import OpenAICompatibleProvider
from app.observability.logging import RequestContextMiddleware, configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings.log_level, json_logs=settings.app_env not in {"development", "test"})
    if settings.is_production and settings.trusted_proxy_hops <= 0:
        # Behind Render's proxy the socket peer is the proxy, so every visitor would share one
        # per-IP rate-limit bucket. Set TRUSTED_PROXY_HOPS (1 is the documented assumption).
        structlog.get_logger("app").warning("trusted_proxy_hops_unset", effect="per-IP limit is shared by all visitors")
    structlog.get_logger("app").info(
        "startup",
        env=settings.app_env,
        version=settings.app_version,
        assistant="live" if settings.llm_configured else "offline",
    )
    yield
    provider = getattr(app.state.assistant, "provider", None)
    if provider is not None:
        await provider.aclose()
    await dispose_engine()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Portfolio Intelligence Agent",
        version=settings.app_version,
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/api/v1/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/api/v1/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-Id", "X-Session-Id"],
        expose_headers=["X-Request-Id", "Retry-After"],
        max_age=600,
    )
    app.add_middleware(RequestContextMiddleware)

    if settings.llm_provider == "fake" and not settings.is_production:
        # Local development without a key: scripted answers, real streaming path.
        from app.llm.fake import FakeProvider

        provider = FakeProvider()
        structlog.get_logger("app").warning("assistant_provider_fake", note="development only; answers are scripted")
    elif settings.llm_configured:
        provider = OpenAICompatibleProvider(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
            timeout=settings.llm_timeout_seconds,
            app_url=settings.llm_app_url,
            app_name=settings.llm_app_name,
            name=settings.llm_provider,
            fallback_models=settings.llm_fallbacks,
            reasoning_effort=settings.llm_reasoning_effort,
        )
    else:
        provider = None
    app.state.assistant = AssistantService(settings, provider)

    app.include_router(health.router)
    app.include_router(projects.router, prefix="/api/v1")
    app.include_router(assistant.router, prefix="/api/v1")
    register_error_handlers(app)
    return app


app = create_app()
