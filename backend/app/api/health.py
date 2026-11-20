"""Liveness / readiness endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.tool import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Service health")
def health() -> HealthResponse:
    """Report that the API is up. Used by load balancers and Docker health checks."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.version,
    )
