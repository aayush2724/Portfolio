"""Structured logging and per-request context.

JSON lines to stdout in staging/production (the host captures them), a
readable console renderer in development. Every request gets an
`X-Request-Id` (honouring a well-formed incoming one) that is bound into the
log context so each line of a request can be correlated. Nothing here logs
headers or bodies: tokens and visitor text never reach the log.
"""

from __future__ import annotations

import logging
import re
import sys
import time
import uuid

import structlog
from starlette.types import ASGIApp, Message, Receive, Scope, Send

_REQUEST_ID = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


def configure_logging(level: str = "INFO", *, json_logs: bool = True) -> None:
    level_no = logging.getLevelNamesMapping().get(level.upper(), logging.INFO)
    logging.basicConfig(level=level_no, format="%(message)s", stream=sys.stdout, force=True)
    renderer = structlog.processors.JSONRenderer() if json_logs else structlog.dev.ConsoleRenderer()
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level_no),
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        cache_logger_on_first_use=False,
    )


log = structlog.get_logger("http")


class RequestContextMiddleware:
    """Pure ASGI middleware: request id, access log, no-store on the API."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        incoming = ""
        for key, value in scope.get("headers", []):
            if key == b"x-request-id":
                incoming = value.decode("latin-1", "ignore")
                break
        request_id = incoming if _REQUEST_ID.match(incoming) else uuid.uuid4().hex
        scope.setdefault("state", {})["request_id"] = request_id

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        started = time.perf_counter()
        status = {"code": 500}
        path = scope.get("path", "")

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                status["code"] = message["status"]
                headers = list(message.get("headers", []))
                headers.append((b"x-request-id", request_id.encode()))
                if path.startswith("/api/"):
                    headers.append((b"cache-control", b"no-store"))
                message = {**message, "headers": headers}
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            log.info(
                "http_request",
                method=scope.get("method"),
                path=path,
                status=status["code"],
                duration_ms=round((time.perf_counter() - started) * 1000, 1),
            )
            structlog.contextvars.clear_contextvars()
