"""Gigai Tools API — FastAPI application entrypoint.

Boots the app, wires CORS from settings, and mounts the aggregated API router
under ``/api``. Run locally with:

    uvicorn app.main:app --reload

or via the module (``python -m app.main``) which starts uvicorn programmatically.
"""

from __future__ import annotations

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import assert_cors_is_pinned, settings
from app.services.convert import ConversionError


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description=(
            "Metadata API for the Gigai Tools platform by Gigai Kripa Services. "
            "Serves tool and category registries; tool processing endpoints are "
            "added per tool as they ship."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # The GigAI Verify extension calls from chrome-extension://<id>. That origin
    # is added as an EXACT entry from VERIFY_EXTENSION_IDS rather than matched by
    # pattern, because a pattern loose enough to match an unknown ID is loose
    # enough to match every other extension's too. `assert_cors_is_pinned` stops
    # a production boot that still relies on such a pattern.
    assert_cors_is_pinned(settings)

    cors_kwargs: dict[str, object] = {
        "allow_origins": [*settings.cors_origins, *settings.extension_origins],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if settings.cors_origin_regex:
        cors_kwargs["allow_origin_regex"] = settings.cors_origin_regex

    app.add_middleware(CORSMiddleware, **cors_kwargs)

    app.include_router(api_router, prefix="/api")

    # The developer API (/v1) needs Postgres and GIGAI_API_JWT_SECRET. Without
    # the secret the backend still serves every /api tool endpoint.
    if os.environ.get("GIGAI_API_JWT_SECRET"):
        from app.v1.router import v1_router

        app.include_router(v1_router, prefix="/v1")

    @app.exception_handler(ConversionError)
    async def _handle_conversion_error(
        _request: Request, exc: ConversionError
    ) -> JSONResponse:
        """Map a service-level ``ConversionError`` to a safe JSON response.

        Keeps the ephemeral converters' route handlers clean: they simply call
        the service, which raises this with an HTTP-ish ``status_code`` and a
        content-free ``detail`` when a file cannot be converted.
        """
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.get("/", tags=["meta"], summary="API root")
    def root() -> dict[str, str]:
        """Human-friendly landing payload with pointers to the docs."""
        return {
            "service": settings.app_name,
            "version": settings.version,
            "docs": "/docs",
            "health": "/api/health",
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=not settings.is_production,
    )
