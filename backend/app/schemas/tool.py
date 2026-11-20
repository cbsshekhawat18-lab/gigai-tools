"""Pydantic schemas mirroring the TypeScript domain types.

Kept intentionally metadata-only — they describe tools and categories, not tool
*logic*. Field names and shapes track ``types/index.ts`` (``Tool``, ``Category``,
``FaqItem``) so the API response is drop-in compatible with the frontend types.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ToolStatus = Literal["live", "beta", "coming-soon"]
"""Mirror of the TS ``ToolStatus`` union."""

AccentKey = Literal[
    "sky",
    "violet",
    "emerald",
    "amber",
    "rose",
    "cyan",
    "indigo",
    "orange",
]
"""Mirror of the TS ``AccentKey`` union."""


class FaqItem(BaseModel):
    """A single question/answer pair (mirrors TS ``FaqItem``)."""

    model_config = ConfigDict(extra="forbid")

    question: str
    answer: str


class CategorySchema(BaseModel):
    """Tool category metadata (mirrors TS ``Category``)."""

    model_config = ConfigDict(extra="forbid")

    slug: str = Field(..., description="URL slug, e.g. 'pdf-tools'.")
    name: str
    description: str
    icon: str = Field(..., description="lucide-react icon name.")
    accent: AccentKey
    featured: bool = False


class ToolSchema(BaseModel):
    """Tool registry entry — metadata only (mirrors TS ``Tool``)."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    slug: str
    title: str
    description: str
    category: str = Field(..., description="Slug of the owning category.")
    icon: str = Field(..., description="lucide-react icon name.")
    keywords: list[str] = Field(default_factory=list)
    faq: list[FaqItem] = Field(default_factory=list)
    related_tools: list[str] = Field(
        default_factory=list,
        alias="relatedTools",
        description="Slugs of related tools; empty means 'use category siblings'.",
    )
    featured: bool = False
    popular: bool = False
    is_new: bool = Field(default=False, alias="isNew")
    status: ToolStatus = "coming-soon"
    created_at: str | None = Field(
        default=None,
        alias="createdAt",
        description="ISO date powering 'Recently Added'.",
    )


class HealthResponse(BaseModel):
    """Payload returned by the health endpoint."""

    status: Literal["ok"] = "ok"
    service: str
    version: str
