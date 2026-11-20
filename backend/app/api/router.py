"""Top-level API router.

Aggregates every domain router. ``main.py`` mounts this under ``/api``, so a
route declared here as ``/health`` is served at ``/api/health``.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api import convert, health, iconlab, newsletter, tools, verify, video_work
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(tools.router)
api_router.include_router(convert.router)
api_router.include_router(video_work.router)
api_router.include_router(iconlab.router)
api_router.include_router(newsletter.router)
# GigAI Verify: the v1 path plus the legacy alias, so an already-installed
# extension keeps working across this deploy.
api_router.include_router(verify.router)
api_router.include_router(verify.legacy_router)

# PDF repair is AGPL-3.0 because it uses PyMuPDF (app/pdf_repair/LICENSE). It is
# mounted only when enabled, so the backend otherwise runs under Apache-2.0 alone.
if settings.pdf_repair_enabled:
    from app.pdf_repair.api import router as pdf_repair_router

    api_router.include_router(pdf_repair_router)
