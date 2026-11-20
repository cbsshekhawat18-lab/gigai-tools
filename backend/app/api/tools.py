"""Tool and category metadata endpoints.

Read-only for now — they surface the placeholder registry so the frontend (and
any future integrations) can consume tool metadata over HTTP. Tool *processing*
endpoints will be added per tool as those are built.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.tool import CategorySchema, ToolSchema
from app.services import registry

router = APIRouter(tags=["tools"])


@router.get(
    "/tools",
    response_model=list[ToolSchema],
    summary="List tools",
)
def list_tools(
    category: str | None = Query(
        default=None,
        description="Filter to a single category slug, e.g. 'pdf-tools'.",
    ),
) -> list[ToolSchema]:
    """Return all tools, optionally filtered by ``category``.

    A 404 is returned if a non-existent category slug is requested, which is
    friendlier than silently returning an empty list.
    """
    if category is not None and not registry.category_exists(category):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category}' not found.",
        )
    return registry.get_all_tools(category=category)


@router.get(
    "/tools/{slug}",
    response_model=ToolSchema,
    summary="Get a tool by slug",
)
def get_tool(slug: str) -> ToolSchema:
    """Return a single tool by its slug, or 404 if unknown."""
    tool = registry.get_tool_by_slug(slug)
    if tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool '{slug}' not found.",
        )
    return tool


@router.get(
    "/categories",
    response_model=list[CategorySchema],
    summary="List categories",
)
def list_categories() -> list[CategorySchema]:
    """Return every tool category."""
    return registry.get_all_categories()
