"""Public assistant endpoints. Rate limits and the budget are checked before
the stream opens so the HTTP status is truthful; the stream itself always ends
with a typed `done` or `error` event."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.errors import ApiError
from app.assistant.clientip import client_ip
from app.assistant.schemas import AssistantStatus, ChatRequest, FeedbackRequest
from app.assistant.service import AssistantService
from app.db.session import get_session, get_sessionmaker

router = APIRouter(prefix="/assistant", tags=["assistant"])

SSE_HEADERS = {"Cache-Control": "no-store", "X-Accel-Buffering": "no", "Connection": "keep-alive"}


def get_assistant(request: Request) -> AssistantService:
    return request.app.state.assistant


@router.get("/status", response_model=AssistantStatus)
async def status(
    session: AsyncSession = Depends(get_session), svc: AssistantService = Depends(get_assistant)
) -> AssistantStatus:
    return await svc.status(session)


@router.post("/chat")
async def chat(
    body: ChatRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
    svc: AssistantService = Depends(get_assistant),
) -> StreamingResponse:
    prepared = await svc.prepare(body, client_ip(request, svc.settings.trusted_proxy_hops), session)
    return StreamingResponse(
        svc.stream(prepared, get_sessionmaker(), request.is_disconnected),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


@router.post("/feedback", status_code=204)
async def feedback(
    body: FeedbackRequest,
    session: AsyncSession = Depends(get_session),
    svc: AssistantService = Depends(get_assistant),
) -> Response:
    ok = await svc.feedback(session, session_id=body.session_id, message_id=body.message_id, rating=body.rating)
    if not ok:
        raise ApiError(404, "not_found", "No such message in this session")
    return Response(status_code=204)
