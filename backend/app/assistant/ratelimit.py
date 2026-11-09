"""In-memory limiters for a single-instance deployment. The daily LLM budget
is enforced from the database elsewhere; these only shape request bursts."""

from __future__ import annotations

import hashlib
import time
from collections import defaultdict, deque
from datetime import UTC, datetime


def hash_key(value: str, salt: str) -> str:
    """Daily-rotating hash so an address is never stored or logged in the clear."""
    day = datetime.now(UTC).strftime("%Y-%m-%d")
    return hashlib.sha256(f"{salt}:{day}:{value}".encode()).hexdigest()[:32]


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = max(1, limit)
        self.window = max(1, window_seconds)
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, now: float | None = None) -> tuple[bool, int]:
        """(allowed, retry_after_seconds). Records the hit when allowed."""
        now = time.monotonic() if now is None else now
        q = self._hits[key]
        cutoff = now - self.window
        while q and q[0] <= cutoff:
            q.popleft()
        if len(q) >= self.limit:
            return False, max(1, int(q[0] + self.window - now) + 1)
        q.append(now)
        if len(self._hits) > 10_000:  # keep memory bounded under abuse
            for k in [k for k, v in self._hits.items() if not v or v[-1] <= cutoff][:5000]:
                self._hits.pop(k, None)
        return True, 0


class DailyCounter:
    def __init__(self, limit: int) -> None:
        self.limit = max(1, limit)
        self._counts: dict[tuple[str, str], int] = {}

    def check(self, key: str) -> bool:
        day = datetime.now(UTC).strftime("%Y-%m-%d")
        if len(self._counts) > 20_000:
            self._counts = {k: v for k, v in self._counts.items() if k[1] == day}
        k = (key, day)
        n = self._counts.get(k, 0)
        if n >= self.limit:
            return False
        self._counts[k] = n + 1
        return True
