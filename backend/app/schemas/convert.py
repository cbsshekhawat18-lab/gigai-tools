"""Schemas for the ephemeral document-conversion endpoints.

Successful conversions stream a binary file back (a ``FileResponse``), so the
only JSON these endpoints emit is the error envelope below — documented here so
it shows up correctly in the OpenAPI schema / Swagger UI.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ConvertErrorResponse(BaseModel):
    """Standard error body for a failed conversion.

    Deliberately content-free: ``detail`` is a safe, user-facing sentence and
    never echoes the uploaded file's name or bytes.
    """

    model_config = ConfigDict(extra="forbid")

    detail: str = Field(
        ...,
        description="Human-readable, content-free explanation of the failure.",
        examples=[
            "This file could not be converted. It may be corrupted, "
            "password-protected, or in an unsupported format."
        ],
    )
