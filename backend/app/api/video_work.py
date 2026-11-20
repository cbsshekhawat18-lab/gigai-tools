"""Ephemeral Video → Work analysis endpoint.

    POST /api/video-work/analyze    transcript + frames  →  findings
    GET  /api/video-work/status     is analysis configured?

Privacy contract, identical in spirit to the document converters:

    receive → analyse → respond → forget

The video is never uploaded — it is decoded, transcribed and sampled in the
user's browser. What arrives here is the transcript plus a handful of frames,
held in memory for one request and discarded with the response. Nothing is
written to a database, object storage or disk, and no transcript or frame
content is ever logged.

The `status` route exists so the workspace can tell the user up front that
analysis isn't available, rather than letting them sit through a local
transcription and fail at the last step.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Final

from fastapi import APIRouter, HTTPException, status
from starlette.background import BackgroundTask
from starlette.responses import FileResponse

from app.core.config import settings
from app.schemas.video_work import (
    AnalyzeErrorResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    AnalyzeStatusResponse,
    ResolveResponse,
    UrlRequest,
)
from app.services import video_fetch, video_work as service

logger = logging.getLogger("app.api.video_work")

router = APIRouter(prefix="/video-work", tags=["video-work"])

#: yt-dlp downloads are network- and disk-heavy, and this box also serves the
#: site. Two at a time keeps a burst of pasted links from starving everything
#: else; the third caller is told to wait rather than queued indefinitely.
_FETCH_SLOTS: Final[asyncio.Semaphore] = asyncio.Semaphore(settings.video_fetch_concurrency)

#: How long a caller waits for a fetch slot before being told to retry.
_SLOT_WAIT_SECONDS: Final[float] = 20.0

_HTTP_413_TOO_LARGE: Final[int] = 413
_HTTP_422_UNPROCESSABLE: Final[int] = 422

#: Guard against a client sending an implausible payload. The browser caps both
#: itself; these are the server's own floor, not a UI-mirrored limit.
_MAX_SEGMENTS: Final[int] = 20_000
_MAX_FRAMES: Final[int] = 40
_MAX_PRIOR_FINDINGS: Final[int] = 400


@router.get(
    "/status",
    response_model=AnalyzeStatusResponse,
    summary="Report whether server-side analysis is available",
)
async def analysis_status() -> AnalyzeStatusResponse:
    """Cheap capability probe — no model call, no credentials revealed."""
    provider = service.active_provider()
    return AnalyzeStatusResponse(
        configured=bool(provider),
        provider=provider,
        free_tier=provider == "groq",
        model=settings.groq_model if provider == "groq" else settings.video_work_model,
        max_frames=service.max_frames_for(provider),
        max_frame_px=service.max_frame_px_for(provider),
        max_transcript_chars=service.MAX_TRANSCRIPT_CHARS,
        fetch_enabled=video_fetch.fetching_available(),
        max_fetch_minutes=video_fetch.MAX_DURATION_SECONDS // 60,
        max_fetch_mb=video_fetch.MAX_BYTES // (1024 * 1024),
    )


# ── URL ingestion ─────────────────────────────────────────────────────────────


@router.post(
    "/resolve",
    response_model=ResolveResponse,
    summary="Inspect a share link without downloading it",
    responses={400: {"model": AnalyzeErrorResponse}, 503: {"model": AnalyzeErrorResponse}},
)
async def resolve_url(request: UrlRequest) -> ResolveResponse:
    """Report what a link is before committing to a download.

    Cheap enough to run as the user types-and-pastes, and it is where private
    Looms, expired links, live streams and over-long recordings are caught.
    """
    _require_fetching()
    try:
        # yt-dlp is blocking; keep it off the event loop.
        info = await asyncio.to_thread(video_fetch.resolve, request.url)
    except video_fetch.FetchError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("video_work: unexpected resolve failure")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="That link couldn't be inspected. Please try again.",
        ) from exc

    return ResolveResponse(**info)


@router.post(
    "/fetch",
    summary="Retrieve a recording from a share link and stream it back",
    response_class=FileResponse,
    responses={
        400: {"model": AnalyzeErrorResponse},
        429: {"model": AnalyzeErrorResponse},
        503: {"model": AnalyzeErrorResponse},
    },
)
async def fetch_url(request: UrlRequest) -> FileResponse:
    """Download the media server-side and stream it to the browser.

    The file lives in a per-request temp directory that a BackgroundTask deletes
    the instant streaming finishes — the same lifecycle as the document
    converters. From here on the browser owns the file: transcription, frame
    selection and playback are all local.
    """
    _require_fetching()

    # Wait briefly for a slot rather than queueing forever behind a slow fetch;
    # a caller who can't get one is told to retry instead of hanging.
    try:
        await asyncio.wait_for(_FETCH_SLOTS.acquire(), timeout=_SLOT_WAIT_SECONDS)
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The server is already fetching other recordings. Try again in a moment.",
        ) from exc

    try:
        media, handle, filename = await asyncio.wait_for(
            asyncio.to_thread(video_fetch.download, request.url),
            timeout=video_fetch.FETCH_TIMEOUT_SECONDS,
        )
    except video_fetch.FetchError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=(
                "Fetching that recording took too long. Download it and add the file "
                "directly instead."
            ),
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("video_work: unexpected fetch failure")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="That recording couldn't be fetched. Please try again.",
        ) from exc
    finally:
        # Released here, not after streaming: the bytes are on local disk by now,
        # so the expensive part (network + yt-dlp) is over and the next caller
        # shouldn't wait on this response draining to a slow client.
        _FETCH_SLOTS.release()

    return FileResponse(
        path=media,
        media_type="application/octet-stream",
        filename=filename,
        # Delete the temp directory the moment the response finishes streaming.
        background=BackgroundTask(handle.cleanup),
    )


def _require_fetching() -> None:
    if not video_fetch.fetching_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Fetching links isn't available on this server. Download the recording "
                "and add the file directly — that always works."
            ),
        )


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Turn a transcript and selected frames into developer-ready findings",
    responses={
        400: {"model": AnalyzeErrorResponse},
        413: {"model": AnalyzeErrorResponse},
        422: {"model": AnalyzeErrorResponse},
        503: {"model": AnalyzeErrorResponse},
    },
)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    if not service.analysis_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Video analysis is not configured on this server. Your transcript and "
                "screenshots were produced in your browser and are still exportable."
            ),
        )

    if not request.segments and not request.frames:
        raise HTTPException(
            status_code=_HTTP_422_UNPROCESSABLE,
            detail="Nothing to analyse — no transcript and no screenshots were provided.",
        )

    if len(request.segments) > _MAX_SEGMENTS:
        raise HTTPException(
            status_code=_HTTP_413_TOO_LARGE,
            detail="That transcript is too long to analyse in one pass. Trim the video first.",
        )
    if len(request.frames) > _MAX_FRAMES:
        raise HTTPException(
            status_code=_HTTP_413_TOO_LARGE,
            detail=f"Too many screenshots — send at most {_MAX_FRAMES}.",
        )
    if len(request.prior_findings) > _MAX_PRIOR_FINDINGS:
        raise HTTPException(
            status_code=_HTTP_413_TOO_LARGE,
            detail="This project has accumulated too many findings to cross-reference.",
        )

    try:
        result = service.analyze(request)
    except RuntimeError as exc:
        # service.analyze raises only messages that are safe to surface.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except Exception as exc:  # noqa: BLE001 - never leak an internal trace to a client
        logger.exception("video_work: unexpected analysis failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The analysis could not be completed. Please try again.",
        ) from exc

    return AnalyzeResponse.model_validate(result)
