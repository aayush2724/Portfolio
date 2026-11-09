"""Chat-completion provider over any OpenAI-compatible endpoint (OpenRouter by
default). Deliberately small: two calls (complete, stream), typed usage, and
errors that tell the caller whether retrying makes sense. No framework.

Repository content and visitor text travel inside `messages` as data; this
module never inspects or acts on them.
"""

from __future__ import annotations

import json
import time
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any, Protocol

import httpx
import structlog

log = structlog.get_logger("llm")

Message = dict[str, str]  # {"role": "system" | "user" | "assistant", "content": str}


class LLMError(Exception):
    def __init__(self, message: str, *, status: int | None = None, retryable: bool = False):
        super().__init__(message)
        self.status = status
        self.retryable = retryable


class LLMTimeout(LLMError):
    def __init__(self, message: str = "model call timed out"):
        super().__init__(message, retryable=True)


class LLMRateLimited(LLMError):
    def __init__(self, message: str = "model provider rate limit"):
        super().__init__(message, status=429, retryable=True)


class LLMBadResponse(LLMError):
    pass


@dataclass(slots=True)
class Usage:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cached_tokens: int = 0
    cost_usd: float | None = None  # provider-reported when available (OpenRouter `usage.cost`)


@dataclass(slots=True)
class Completion:
    text: str
    model: str
    usage: Usage
    finish_reason: str | None = None
    latency_ms: int = 0


@dataclass(slots=True)
class StreamDelta:
    text: str


class ChatProvider(Protocol):
    name: str

    async def complete(
        self,
        *,
        model: str,
        messages: list[Message],
        max_tokens: int,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> Completion: ...

    def stream(
        self,
        *,
        model: str,
        messages: list[Message],
        max_tokens: int,
        temperature: float = 0.3,
    ) -> AsyncIterator[StreamDelta | Completion]: ...

    async def aclose(self) -> None: ...


def _usage_from(d: dict[str, Any] | None) -> Usage:
    d = d or {}
    details = d.get("prompt_tokens_details") or {}
    cost = d.get("cost")
    try:
        cost_f = float(cost) if cost is not None else None
    except (TypeError, ValueError):
        cost_f = None
    return Usage(
        prompt_tokens=int(d.get("prompt_tokens") or 0),
        completion_tokens=int(d.get("completion_tokens") or 0),
        cached_tokens=int(details.get("cached_tokens") or 0),
        cost_usd=cost_f,
    )


def _text_of(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):  # some providers return content parts
        return "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return ""


class OpenAICompatibleProvider:
    """`POST {base_url}/chat/completions`, JSON or SSE, OpenAI wire format."""

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = "https://openrouter.ai/api/v1",
        timeout: float = 25.0,
        app_url: str | None = None,
        app_name: str | None = None,
        name: str = "openrouter",
        fallback_models: list[str] | None = None,
        reasoning_effort: str | None = None,
    ) -> None:
        self.name = name
        self.fallback_models = list(fallback_models or [])
        self.reasoning_effort = reasoning_effort or None
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        if app_url:
            headers["HTTP-Referer"] = app_url
        if app_name:
            headers["X-Title"] = app_name
        self._client = httpx.AsyncClient(
            base_url=base_url.rstrip("/"), headers=headers, timeout=httpx.Timeout(timeout, connect=10.0)
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    def _body(
        self, model: str, messages: list[Message], max_tokens: int, temperature: float, *, stream: bool, json_mode: bool
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": stream,
            "usage": {"include": True},  # OpenRouter: report tokens and cost
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}
        if self.reasoning_effort:
            # OpenRouter's unified reasoning control; models without reasoning ignore it.
            body["reasoning"] = {"effort": self.reasoning_effort, "exclude": True}
        fallbacks = [m for m in self.fallback_models if m != model]
        if fallbacks:
            # OpenRouter model routing: try `model`, then each fallback in order when one is busy
            # or unavailable. The response's `model` field names the one that answered.
            body["models"] = [model, *fallbacks]
        return body

    @staticmethod
    def _raise_for_status(resp: httpx.Response) -> None:
        if resp.status_code < 400:
            return
        snippet = resp.text[:200].replace("\n", " ")
        if resp.status_code in (401, 403):
            raise LLMError(f"model provider rejected the credentials ({resp.status_code})", status=resp.status_code)
        if resp.status_code == 402:
            raise LLMError("model provider reports no credits left", status=402)
        if resp.status_code == 429:
            raise LLMRateLimited()
        if resp.status_code >= 500:
            raise LLMError(
                f"model provider error {resp.status_code}: {snippet}", status=resp.status_code, retryable=True
            )
        raise LLMError(f"model provider error {resp.status_code}: {snippet}", status=resp.status_code)

    async def complete(
        self,
        *,
        model: str,
        messages: list[Message],
        max_tokens: int,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> Completion:
        started = time.perf_counter()
        body = self._body(model, messages, max_tokens, temperature, stream=False, json_mode=json_mode)
        try:
            resp = await self._client.post("/chat/completions", json=body)
        except httpx.TimeoutException as exc:
            raise LLMTimeout() from exc
        except httpx.TransportError as exc:
            raise LLMError(f"model provider unreachable: {type(exc).__name__}", retryable=True) from exc
        self._raise_for_status(resp)
        try:
            data = resp.json()
        except ValueError as exc:
            raise LLMBadResponse("model provider returned non-JSON") from exc
        choices = data.get("choices") or []
        if not choices:
            raise LLMBadResponse("model provider returned no choices")
        choice = choices[0]
        text = _text_of((choice.get("message") or {}).get("content"))
        return Completion(
            text=text,
            model=data.get("model") or model,
            usage=_usage_from(data.get("usage")),
            finish_reason=choice.get("finish_reason"),
            latency_ms=int((time.perf_counter() - started) * 1000),
        )

    async def stream(
        self,
        *,
        model: str,
        messages: list[Message],
        max_tokens: int,
        temperature: float = 0.3,
    ) -> AsyncIterator[StreamDelta | Completion]:
        started = time.perf_counter()
        body = self._body(model, messages, max_tokens, temperature, stream=True, json_mode=False)
        parts: list[str] = []
        usage = Usage()
        finish: str | None = None
        model_out = model
        try:
            async with self._client.stream("POST", "/chat/completions", json=body) as resp:
                if resp.status_code >= 400:
                    await resp.aread()
                    self._raise_for_status(resp)
                async for line in resp.aiter_lines():
                    if not line or line.startswith(":"):  # OpenRouter sends ": OPENROUTER PROCESSING" comments
                        continue
                    if not line.startswith("data:"):
                        continue
                    payload = line[5:].strip()
                    if payload == "[DONE]":
                        break
                    try:
                        chunk = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    if chunk.get("error"):
                        err = chunk["error"]
                        message = err.get("message") if isinstance(err, dict) else str(err)
                        raise LLMError(f"model provider error: {message}")
                    if chunk.get("usage"):
                        usage = _usage_from(chunk["usage"])
                    model_out = chunk.get("model") or model_out
                    for ch in chunk.get("choices") or []:
                        delta = _text_of((ch.get("delta") or {}).get("content"))
                        if delta:
                            parts.append(delta)
                            yield StreamDelta(delta)
                        if ch.get("finish_reason"):
                            finish = ch["finish_reason"]
        except httpx.TimeoutException as exc:
            raise LLMTimeout() from exc
        except httpx.TransportError as exc:
            raise LLMError(f"model provider unreachable: {type(exc).__name__}", retryable=True) from exc
        yield Completion(
            text="".join(parts),
            model=model_out,
            usage=usage,
            finish_reason=finish,
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
