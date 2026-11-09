import httpx
import pytest
import respx

from app.llm.provider import LLMError, LLMRateLimited, OpenAICompatibleProvider, StreamDelta

URL = "https://openrouter.ai/api/v1/chat/completions"


@pytest.fixture
async def provider():
    p = OpenAICompatibleProvider(api_key="sk-test", app_url="https://example.test", app_name="Test")  # noqa: S106
    yield p
    await p.aclose()


async def test_complete_parses_text_and_cost(provider):
    with respx.mock(assert_all_called=True) as mock:
        route = mock.post(URL).mock(
            return_value=httpx.Response(
                200,
                json={
                    "model": "anthropic/claude-haiku-5.5",
                    "choices": [{"message": {"content": '{"intent":"smalltalk","tools":[]}'}, "finish_reason": "stop"}],
                    "usage": {"prompt_tokens": 120, "completion_tokens": 20, "cost": 0.000031},
                },
            )
        )
        c = await provider.complete(
            model="anthropic/claude-haiku-5.5",
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=50,
            json_mode=True,
        )
    assert c.text.startswith("{") and c.usage.prompt_tokens == 120 and c.usage.cost_usd == pytest.approx(0.000031)
    sent = route.calls.last.request
    assert sent.headers["Authorization"] == "Bearer sk-test" and sent.headers["HTTP-Referer"] == "https://example.test"
    import json

    body = json.loads(sent.content)
    assert (
        body["response_format"] == {"type": "json_object"}
        and body["usage"] == {"include": True}
        and body["stream"] is False
    )


async def test_stream_parses_sse_with_comments_and_usage(provider):
    sse = (
        ": OPENROUTER PROCESSING\n\n"
        'data: {"id":"1","model":"m","choices":[{"delta":{"content":"Hel"}}]}\n\n'
        'data: {"id":"1","choices":[{"delta":{"content":"lo"},"finish_reason":null}]}\n\n'
        'data: {"id":"1","choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":2,"cost":0.00001}}\n\n'
        "data: [DONE]\n\n"
    )
    with respx.mock(assert_all_called=True) as mock:
        mock.post(URL).mock(
            return_value=httpx.Response(200, headers={"content-type": "text/event-stream"}, content=sse.encode())
        )
        events = [
            e async for e in provider.stream(model="m", messages=[{"role": "user", "content": "x"}], max_tokens=20)
        ]
    deltas = [e.text for e in events if isinstance(e, StreamDelta)]
    final = events[-1]
    assert deltas == ["Hel", "lo"] and final.text == "Hello" and final.finish_reason == "stop"
    assert final.usage.completion_tokens == 2 and final.usage.cost_usd == pytest.approx(0.00001)


async def test_error_mapping(provider):
    with respx.mock() as mock:
        mock.post(URL).mock(return_value=httpx.Response(429, json={"error": {"message": "slow down"}}))
        with pytest.raises(LLMRateLimited):
            await provider.complete(model="m", messages=[], max_tokens=5)
        mock.post(URL).mock(return_value=httpx.Response(401, json={"error": {"message": "bad key"}}))
        with pytest.raises(LLMError) as exc:
            await provider.complete(model="m", messages=[], max_tokens=5)
        assert exc.value.status == 401 and "bad key" not in str(exc.value)  # no provider body in the message


async def test_fallback_models_are_sent_as_an_openrouter_route():
    import json

    p = OpenAICompatibleProvider(api_key="sk-test", fallback_models=["b/free", "a/free"], reasoning_effort="low")  # noqa: S106
    try:
        with respx.mock(assert_all_called=True) as mock:
            route = mock.post(URL).mock(
                return_value=httpx.Response(
                    200,
                    json={
                        "model": "b/free",
                        "choices": [{"message": {"content": "ok"}, "finish_reason": "stop"}],
                        "usage": {},
                    },
                )
            )
            c = await p.complete(model="a/free", messages=[{"role": "user", "content": "x"}], max_tokens=5)
        body = json.loads(route.calls.last.request.content)
        assert body["model"] == "a/free" and body["models"] == ["a/free", "b/free"]  # primary first, no duplicate
        assert c.model == "b/free"  # the model that actually answered is reported
        assert body["reasoning"] == {"effort": "low", "exclude": True}
    finally:
        await p.aclose()
