"""Which address made this request.

Behind a reverse proxy the socket peer is the proxy, and `X-Forwarded-For`
holds the chain `client, proxy1, proxy2`. Only the entries appended by proxies
we run behind can be trusted; anything to their left was written by the
client and can be forged. So the client is the entry `TRUSTED_PROXY_HOPS`
from the right, never the leftmost one. Render is *assumed* to append exactly
one entry (TRUSTED_PROXY_HOPS=1); that is verified after the first deploy (M6) by
comparing requests from two different networks.

The address is only ever used as input to a salted, daily-rotating hash for
rate limiting; it is never logged or stored.
"""

from __future__ import annotations

from starlette.requests import Request


def client_ip(request: Request, trusted_hops: int) -> str:
    peer = request.client.host if request.client else "unknown"
    if trusted_hops <= 0:
        return peer
    header = request.headers.get("x-forwarded-for", "")
    hops = [h.strip() for h in header.split(",") if h.strip()]
    if len(hops) < trusted_hops:
        return peer
    return hops[-trusted_hops]
