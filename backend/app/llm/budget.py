"""Spend accounting: every model call lands in `llm_calls`; the daily budget
is enforced from the database so a process restart (Render free tier) does
not reset it."""

from __future__ import annotations

import json
from datetime import UTC, datetime, time

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import LlmCall
from app.llm.provider import Usage

# USD per million tokens (input, output). OpenRouter list prices, 2026-11-08.
DEFAULT_PRICES: dict[str, tuple[float, float]] = {
    "nvidia/nemotron-3.5-super-vl:free": (0.0, 0.0),
    "recursive/flint-v1.0:free": (0.0, 0.0),
    "nvidia/nemotron-3-ultra-550b-a55b:free": (0.0, 0.0),
    "google/gemma-4-31b-it:free": (0.0, 0.0),
    "google/gemma-4-26b-a4b-it:free": (0.0, 0.0),
    "anthropic/claude-haiku-5.5": (0.10, 0.50),
    "anthropic/claude-sonnet-5.5": (2.00, 10.00),
    "anthropic/claude-sonnet-5": (2.00, 10.00),
    "anthropic/claude-haiku-4.5": (1.00, 5.00),
    "google/gemini-3.5-flash-lite": (0.30, 2.50),
    "openai/gpt-5.4-mini": (0.75, 4.50),
}


def load_prices(overrides_json: str | None) -> dict[str, tuple[float, float]]:
    prices = dict(DEFAULT_PRICES)
    if overrides_json:
        try:
            for model, pair in json.loads(overrides_json).items():
                prices[model] = (float(pair[0]), float(pair[1]))
        except (ValueError, TypeError, IndexError, AttributeError):
            pass
    return prices


def estimate_cost(model: str, usage: Usage, prices: dict[str, tuple[float, float]]) -> float:
    if usage.cost_usd is not None:
        return float(usage.cost_usd)
    pin, pout = prices.get(model, (0.0, 0.0))
    return round((usage.prompt_tokens * pin + usage.completion_tokens * pout) / 1_000_000, 6)


def _today_start() -> datetime:
    return datetime.combine(datetime.now(UTC).date(), time.min, tzinfo=UTC)


async def calls_today(session: AsyncSession) -> int:
    """Model requests made since midnight UTC (all workflows), for the free-quota cap."""
    return int(
        (
            await session.execute(select(func.count()).select_from(LlmCall).where(LlmCall.created_at >= _today_start()))
        ).scalar_one()
    )


async def spent_today(session: AsyncSession) -> float:
    start = datetime.combine(datetime.now(UTC).date(), time.min, tzinfo=UTC)
    total = (
        await session.execute(select(func.coalesce(func.sum(LlmCall.cost_usd), 0)).where(LlmCall.created_at >= start))
    ).scalar_one()
    return float(total)


async def record_call(
    session: AsyncSession,
    *,
    workflow: str,
    provider: str,
    model: str,
    usage: Usage,
    latency_ms: int,
    outcome: str = "ok",
    ref_id: str | None = None,
    prices: dict[str, tuple[float, float]] | None = None,
) -> LlmCall:
    row = LlmCall(
        workflow=workflow,
        provider=provider,
        model=model,
        tokens_in=usage.prompt_tokens,
        tokens_out=usage.completion_tokens,
        cached_tokens=usage.cached_tokens,
        cost_usd=estimate_cost(model, usage, prices or DEFAULT_PRICES),
        latency_ms=latency_ms,
        outcome=outcome,
        ref_id=ref_id,
    )
    session.add(row)
    return row
