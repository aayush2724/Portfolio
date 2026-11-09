"""A scripted provider for tests and for local development without a key.

`answer` and `plan` are callables from the message list to text; defaults
produce a grounded-looking answer that cites the first evidence id it can
see, so end-to-end tests exercise the citation and grounding paths."""

from __future__ import annotations

import re
from collections.abc import AsyncIterator, Callable

from app.llm.provider import Completion, LLMError, Message, StreamDelta, Usage

_CITE = re.compile(r"\[(S\d+)\]")


def default_answer(messages: list[Message]) -> str:
    evidence = next((m["content"] for m in messages if m["role"] == "user" and "<evidence>" in m["content"]), "")
    ids = _CITE.findall(evidence)
    first = f" [{ids[0]}]" if ids else ""
    return (
        "## What the evidence says\n\n"
        f"Here is a grounded answer based on the retrieved sources{first}.\n\n"
        "- It only repeats what the README and portfolio copy state.\n"
        "- Anything marked *claimed* is portfolio copy that is not yet verified from the code.\n"
    )


def default_plan(messages: list[Message]) -> str:
    return '{"intent": "off_topic", "tools": []}'


class FakeProvider:
    name = "fake"

    def __init__(
        self,
        *,
        answer: Callable[[list[Message]], str] | None = None,
        plan: Callable[[list[Message]], str] | None = None,
        chunk_size: int = 24,
        fail_with: Exception | None = None,
        model: str = "fake/model",
        usage: Usage | None = None,
    ) -> None:
        self._answer = answer or default_answer
        self._plan = plan or default_plan
        self.chunk_size = chunk_size
        self.fail_with = fail_with
        self.model = model
        self.usage = usage or Usage(prompt_tokens=900, completion_tokens=120, cost_usd=0.0004)
        self.calls: list[dict] = []

    async def complete(self, *, model, messages, max_tokens, temperature=0.2, json_mode=False) -> Completion:
        self.calls.append({"kind": "complete", "model": model, "json_mode": json_mode, "messages": messages})
        if self.fail_with:
            raise self.fail_with
        text = self._plan(messages) if json_mode else self._answer(messages)
        return Completion(text=text, model=self.model, usage=self.usage, finish_reason="stop", latency_ms=5)

    async def stream(self, *, model, messages, max_tokens, temperature=0.3) -> AsyncIterator[StreamDelta | Completion]:
        self.calls.append({"kind": "stream", "model": model, "messages": messages})
        if self.fail_with:
            raise self.fail_with
        text = self._answer(messages)
        for i in range(0, len(text), self.chunk_size):
            yield StreamDelta(text[i : i + self.chunk_size])
        yield Completion(text=text, model=self.model, usage=self.usage, finish_reason="stop", latency_ms=12)

    async def aclose(self) -> None:
        return None


__all__ = ["FakeProvider", "LLMError", "default_answer", "default_plan"]
