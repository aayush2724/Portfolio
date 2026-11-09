"""Server-sent events framing."""

from __future__ import annotations

import json
from typing import Any

HEARTBEAT = b": keep-alive\n\n"


def sse(event: str, data: Any) -> bytes:
    payload = json.dumps(data, ensure_ascii=False, default=str)
    return f"event: {event}\ndata: {payload}\n\n".encode()
