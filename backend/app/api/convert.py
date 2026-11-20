"""Ephemeral document-conversion endpoints (PDF ↔ Word).

These are the platform's only *server-side* tool endpoints. Everything else runs
in the user's browser; conversion is server-side only because it needs
LibreOffice. The privacy contract is strict and matches the rest of Gigai Tools:

    upload → temp dir → convert → stream back → delete → forget

Concretely:

- The upload is size-guarded (``settings.max_upload_mb``) and content-type /
  magic-byte checked before any work happens.
- Conversion happens inside a per-request ``tempfile`` directory (see
  ``app.services.convert``).
- The converted file is returned via ``FileResponse``; a Starlette
  ``BackgroundTask`` deletes the temp directory the instant streaming finishes.
- Nothing is persisted (no DB, no object storage) and no file **content** —
  bytes or filenames — is ever logged.

Routes (mounted under ``/api``):

    POST /api/convert/pdf-to-word
    POST /api/convert/word-to-pdf
"""

from __future__ import annotations

import logging
from typing import Final

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from starlette.background import BackgroundTask
from starlette.responses import FileResponse

from app.core.config import settings
from app.schemas.convert import ConvertErrorResponse
from app.services import convert as convert_service

logger = logging.getLogger("app.api.convert")

router = APIRouter(prefix="/convert", tags=["convert"])

# ── Accepted inputs ───────────────────────────────────────────────────────────

# Content-types a browser / curl realistically sends for these formats. We treat
# the header as a *hint* only and additionally sniff magic bytes below.
_PDF_CONTENT_TYPES: Final[frozenset[str]] = frozenset(
    {"application/pdf", "application/x-pdf", "application/acrobat"}
)
_WORD_CONTENT_TYPES: Final[frozenset[str]] = frozenset(
    {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/octet-stream",  # some clients send this for .docx
    }
)

# Magic-byte signatures. PDFs start with ``%PDF``; modern ``.docx`` files are ZIP
# containers (``PK\x03\x04``); legacy ``.doc`` uses the OLE compound header.
_PDF_MAGIC: Final[bytes] = b"%PDF"
_ZIP_MAGIC: Final[bytes] = b"PK\x03\x04"
_OLE_MAGIC: Final[bytes] = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"

# Status codes whose ``status.*`` aliases were renamed across the supported
# Starlette range (413/422). Use the raw integers so the module stays
# warning-free and stable regardless of the installed FastAPI version.
_HTTP_413_TOO_LARGE: Final[int] = 413  # Content Too Large
_HTTP_422_UNPROCESSABLE: Final[int] = 422  # Unprocessable Content

# OpenAPI responses shared by both endpoints.
_ERROR_RESPONSES: Final[dict] = {
    status.HTTP_400_BAD_REQUEST: {"model": ConvertErrorResponse},
    _HTTP_413_TOO_LARGE: {"model": ConvertErrorResponse},
    status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: {"model": ConvertErrorResponse},
    _HTTP_422_UNPROCESSABLE: {"model": ConvertErrorResponse},
    status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ConvertErrorResponse},
    status.HTTP_504_GATEWAY_TIMEOUT: {"model": ConvertErrorResponse},
}


@router.post(
    "/pdf-to-word",
    summary="Convert a PDF to an editable Word (.docx) document",
    response_class=FileResponse,
    responses=_ERROR_RESPONSES,
)
async def pdf_to_word(file: UploadFile = File(...)) -> FileResponse:  # noqa: B008
    """Accept a PDF upload, convert it to ``.docx``, and stream it back.

    The uploaded PDF and the generated document live only in a temporary
    directory that is deleted the moment the response finishes streaming.
    """
    data, original_name = await _read_validated_upload(
        file,
        allowed_content_types=_PDF_CONTENT_TYPES,
        allowed_magic=(_PDF_MAGIC,),
        friendly_input="PDF",
    )
    result = await convert_service.convert_pdf_to_word(
        data=data, original_name=original_name
    )
    _log_success("pdf-to-word", result)
    return _file_response(result)


@router.post(
    "/word-to-pdf",
    summary="Convert a Word (.doc/.docx) document to PDF",
    response_class=FileResponse,
    responses=_ERROR_RESPONSES,
)
async def word_to_pdf(file: UploadFile = File(...)) -> FileResponse:  # noqa: B008
    """Accept a Word upload, convert it to PDF, and stream it back.

    The uploaded document and the generated PDF live only in a temporary
    directory that is deleted the moment the response finishes streaming.
    """
    data, original_name = await _read_validated_upload(
        file,
        allowed_content_types=_WORD_CONTENT_TYPES,
        allowed_magic=(_ZIP_MAGIC, _OLE_MAGIC),
        friendly_input="Word document",
    )
    result = await convert_service.convert_word_to_pdf(
        data=data, original_name=original_name
    )
    _log_success("word-to-pdf", result)
    return _file_response(result)


# ── request handling helpers ──────────────────────────────────────────────────


async def _read_validated_upload(
    file: UploadFile,
    *,
    allowed_content_types: frozenset[str],
    allowed_magic: tuple[bytes, ...],
    friendly_input: str,
) -> tuple[bytes, str]:
    """Validate and read an ``UploadFile`` fully into memory.

    Guards: a filename must be present, the declared content-type must be in the
    allow-list, the payload must be non-empty and within the size ceiling, and
    the leading bytes must match an expected magic signature. Returns the raw
    bytes plus the (untrusted, sanitised-downstream) original filename.

    Reads incrementally so an oversized upload is rejected *before* it is fully
    buffered, capping memory at roughly ``max_upload_bytes``.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was provided.",
        )

    content_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if content_type and content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Please upload a {friendly_input}.",
        )

    max_bytes = settings.max_upload_bytes
    chunks: list[bytes] = []
    total = 0
    chunk_size = 1024 * 1024  # 1 MiB
    try:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total += len(chunk)
            if total > max_bytes:
                raise HTTPException(
                    status_code=_HTTP_413_TOO_LARGE,
                    detail=(
                        f"File is too large. The maximum size is "
                        f"{settings.max_upload_mb} MB."
                    ),
                )
            chunks.append(chunk)
    finally:
        await file.close()

    if total == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    data = b"".join(chunks)

    if not any(data.startswith(magic) for magic in allowed_magic):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"This does not look like a valid {friendly_input}. "
                "Please check the file and try again."
            ),
        )

    return data, file.filename


def _file_response(result: convert_service.ConversionResult) -> FileResponse:
    """Build a ``FileResponse`` that self-destructs its temp dir after sending.

    The ``BackgroundTask`` runs *after* the body has been fully streamed to the
    client, guaranteeing the converted file exists for the duration of the
    download and is removed immediately afterwards.
    """
    cleanup = BackgroundTask(convert_service.cleanup_dir, result.path.parent)
    return FileResponse(
        path=result.path,
        media_type=result.media_type,
        filename=result.filename,
        background=cleanup,
        headers={
            # Advertise the exact download name; ASCII-only, path-stripped.
            "Content-Disposition": f'attachment; filename="{result.filename}"',
            "Cache-Control": "no-store",
        },
    )


def _log_success(route: str, result: convert_service.ConversionResult) -> None:
    """Emit coarse, content-free success telemetry.

    Records only sizes and duration — never the filename or any bytes — so the
    logs stay useful for capacity planning without ever leaking user content.
    """
    logger.info(
        "convert.%s ok in=%dB out=%dB %.3fs",
        route,
        result.input_bytes,
        result.output_bytes,
        result.duration_seconds,
    )


@router.get("/health", include_in_schema=False)
async def convert_health() -> dict[str, object]:
    """Report whether the LibreOffice conversion engine is available.

    Handy for readiness checks in environments where the image may or may not
    ship LibreOffice. Returns ``{"available": bool, "max_upload_mb": int}``.
    """
    return {
        "available": convert_service.soffice_binary() is not None,
        "max_upload_mb": settings.max_upload_mb,
    }
