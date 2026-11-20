"""GigAI IconLab composition endpoint.

    POST /api/iconlab/compose   concept name  →  primitive composition
    GET  /api/iconlab/status    is a composer configured?

Privacy contract: the request body is an icon's concept name and an optional
one-line description. No files, no family data, no existing icons ever arrive
here, and nothing is stored or logged beyond an HTTP status on failure.

Rate limiting is deliberately simple: a per-IP sliding window held in process
memory. The service runs as a single worker behind nginx, so in-process state
is accurate, and losing the window on restart is harmless — it only ever
errs briefly towards generosity.
"""

from __future__ import annotations

import asyncio
import time
from collections import defaultdict, deque
from typing import Final

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.services import iconlab as service

router = APIRouter(prefix="/iconlab", tags=["iconlab"])

#: Per-IP budget. Compositions are only requested on a vocabulary miss, so a
#: human clicking normally stays far below this; a loop hits the wall fast.
RATE_LIMIT: Final[int] = 10
RATE_WINDOW_SECONDS: Final[float] = 60.0

_hits: dict[str, deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    """The client IP for rate limiting.

    X-Real-IP is only honoured when the request actually came through the local
    nginx proxy (peer 127.0.0.1). Anyone who reaches the service directly could
    otherwise rotate the header every request and never accumulate hits under
    one key — the review that caught this demonstrated a full limit bypass plus
    a thread-pool exhaustion path built on it. The key is also clipped so a
    hostile header can't grow the table with multi-kilobyte strings.
    """
    peer = request.client.host if request.client else "unknown"
    if peer in ("127.0.0.1", "::1"):
        forwarded = request.headers.get("x-real-ip", "")
        if forwarded:
            return forwarded.strip()[:45]  # max textual IPv6 length
    return peer


def _rate_limited(ip: str) -> bool:
    now = time.monotonic()
    window = _hits[ip]
    while window and now - window[0] > RATE_WINDOW_SECONDS:
        window.popleft()
    if len(window) >= RATE_LIMIT:
        return True
    window.append(now)
    # Bound the table by evicting STALE windows only. The first version called
    # `_hits.clear()` here, which handed any client a self-service reset: blow
    # past 10k keys with rotating fake IPs and every throttled window — yours
    # included — was wiped. Dropping only entries whose newest hit has aged out
    # of the window keeps active throttles intact no matter what the table sees.
    if len(_hits) > 10_000:
        stale = [key for key, dq in _hits.items() if not dq or now - dq[-1] > RATE_WINDOW_SECONDS]
        for key in stale:
            del _hits[key]
    return False


class ComposeRequest(BaseModel):
    concept: str = Field(min_length=1, max_length=60)
    description: str = Field(default="", max_length=200)


class ComposeResponse(BaseModel):
    primitives: list[dict]
    provider: str


class StatusResponse(BaseModel):
    configured: bool


@router.get("/status", response_model=StatusResponse)
async def compose_status() -> StatusResponse:
    return StatusResponse(configured=service.configured())


@router.post("/compose", response_model=ComposeResponse)
async def compose(payload: ComposeRequest, request: Request) -> ComposeResponse:
    if not service.configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI composition isn't configured on this server.",
        )
    if _rate_limited(_client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many composition requests — wait a minute and try again.",
        )

    try:
        # The service is synchronous httpx; run it off the event loop so one
        # slow upstream call doesn't stall every other request on this worker.
        primitives = await asyncio.to_thread(service.compose, payload.concept, payload.description)
    except service.ComposeError as err:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(err)) from err

    return ComposeResponse(primitives=primitives, provider="groq")
