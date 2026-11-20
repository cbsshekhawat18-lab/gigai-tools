"""GigAI Verify — the verification engine endpoints (v1 API, engine v2).

    POST /api/v1/verify          content  →  classification, signals, coverage
    POST /api/v1/verify/ask      question + signals  →  grounded answer
    GET  /api/v1/verify/status   is the engine configured?

Two consumers, one endpoint:

* The **browser extension** runs a full local analysis first and uses only the
  ``signals`` from the response, re-fusing them with its own local evidence. The
  server's classification is not authoritative for it — which is deliberate:
  there is no path by which a server response sets a verdict in the client.
* The **web tool** at gigai.tools/gigai-verify renders the whole response.

Privacy contract, identical to the ephemeral converters:

    receive → analyse → respond → forget

Submitted text, URLs and image bytes are held in memory for one request and
discarded with the response. Nothing is persisted, and no submitted content is
written to the logs — including in error paths.

The legacy ``/api/verify/*`` paths are kept as aliases so an already-installed
extension keeps working after this deploys.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Final

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.verify import (
    AnalyzeRequest,
    AnalyzeResponse,
    AskRequest,
    AskResponse,
    VerifyErrorResponse,
    VerifyStatusResponse,
)
from app.services import verify as service
from app.services.verify import llm

logger = logging.getLogger("app.api.verify")

router = APIRouter(prefix="/v1/verify", tags=["verify"])

#: Legacy mount point. Same handlers, older path — see the module docstring.
legacy_router = APIRouter(prefix="/verify", tags=["verify"], include_in_schema=False)

#: Concurrent analyses. Each may make a model call and fetch an image, so this
#: box is protected from a burst rather than queueing indefinitely.
_SLOTS: Final[asyncio.Semaphore] = asyncio.Semaphore(settings.verify_concurrency)

#: How long a caller waits for a slot before being told to retry.
_SLOT_WAIT_SECONDS: Final[float] = 15.0

#: Whole-request ceiling, so a slow upstream cannot pin a slot open.
_ANALYSIS_TIMEOUT_SECONDS: Final[float] = 90.0

_HTTP_413_TOO_LARGE: Final[int] = 413
_HTTP_422_UNPROCESSABLE: Final[int] = 422


async def _status() -> VerifyStatusResponse:
    """Cheap capability probe — no model call, no credentials revealed.

    ``configured`` is True even without a model key: the heuristic and
    provenance layers are the engine's floor, not an optional extra, and they
    work on their own.
    """
    provider = llm.active_provider()
    return VerifyStatusResponse(
        configured=True,
        provider=provider,
        model=llm.active_model(),
        max_text_chars=service.status_max_chars(),
        engine_version=service.ENGINE_VERSION,
        knowledge_version=service.knowledge_version(),
        supports_deep=bool(provider),
    )


async def _analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    if not request.text.strip() and not request.image_url and not (request.transcript or "").strip():
        raise HTTPException(
            status_code=_HTTP_422_UNPROCESSABLE,
            detail="Nothing to analyse — no text, transcript or image was provided.",
        )

    if len(request.text) > settings.verify_max_text_chars:
        raise HTTPException(
            status_code=_HTTP_413_TOO_LARGE,
            detail="That content is too long to analyse in one pass.",
        )

    try:
        await asyncio.wait_for(_SLOTS.acquire(), timeout=_SLOT_WAIT_SECONDS)
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The engine is busy with other checks. Try again in a moment.",
        ) from exc

    try:
        return await asyncio.wait_for(service.analyze(request), timeout=_ANALYSIS_TIMEOUT_SECONDS)
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="That check took too long. Your browser's local analysis still applies.",
        ) from exc
    except Exception as exc:  # noqa: BLE001 - never leak a trace or the content
        logger.exception("verify: unexpected analysis failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The analysis could not be completed. Please try again.",
        ) from exc
    finally:
        _SLOTS.release()


async def _ask(request: AskRequest) -> AskResponse:
    """Answer strictly from the signals supplied by the caller.

    Stateless by design: the signals travel with the question because the
    analysis endpoint stores nothing. The answer is constrained to those signals
    and will not fetch, infer or invent new evidence.
    """
    try:
        return await asyncio.to_thread(
            service.ask, request.question, request.signals, request.classification
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("verify: unexpected ask failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="That question could not be answered. Please try again.",
        ) from exc


# ── Routes ────────────────────────────────────────────────────────────────────

_ANALYZE_RESPONSES = {
    413: {"model": VerifyErrorResponse},
    422: {"model": VerifyErrorResponse},
    429: {"model": VerifyErrorResponse},
    500: {"model": VerifyErrorResponse},
}


@router.get("/status", response_model=VerifyStatusResponse, summary="Engine capability probe")
async def verify_status() -> VerifyStatusResponse:
    return await _status()


@router.post(
    "",
    response_model=AnalyzeResponse,
    response_model_by_alias=True,
    summary="Analyse content for AI-origin signals",
    responses=_ANALYZE_RESPONSES,
)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    return await _analyze(request)


@router.post(
    "/ask",
    response_model=AskResponse,
    response_model_by_alias=True,
    summary="Answer a follow-up question about an existing result",
    responses={422: {"model": VerifyErrorResponse}, 500: {"model": VerifyErrorResponse}},
)
async def ask(request: AskRequest) -> AskResponse:
    return await _ask(request)


# ── Legacy aliases ────────────────────────────────────────────────────────────


@legacy_router.get("/status", response_model=VerifyStatusResponse)
async def legacy_status() -> VerifyStatusResponse:
    return await _status()


@legacy_router.post("/analyze", response_model=AnalyzeResponse, response_model_by_alias=True)
async def legacy_analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    return await _analyze(request)


@legacy_router.post("/ask", response_model=AskResponse, response_model_by_alias=True)
async def legacy_ask(request: AskRequest) -> AskResponse:
    return await _ask(request)
