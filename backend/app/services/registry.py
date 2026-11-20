"""In-memory placeholder tool registry.

This is a deliberate stand-in. The frontend's source of truth is
``config/tools.ts`` + ``config/categories.ts``; a future revision will replace
this module with a database (SQLAlchemy) or a shared, generated dataset so both
sides read the same registry. The API surface (``app/api/tools.py``) stays the
same when that happens.

Everything here is metadata-only — no tool logic lives in the backend.
"""

from __future__ import annotations

from app.schemas.tool import CategorySchema, FaqItem, ToolSchema

# ── Categories ────────────────────────────────────────────────────────────────
_CATEGORIES: list[CategorySchema] = [
    CategorySchema(
        slug="image-tools",
        name="Image Tools",
        description=(
            "Compress, convert, resize, crop and edit images right in your "
            "browser — no uploads to worry about."
        ),
        icon="Image",
        accent="sky",
        featured=True,
    ),
    CategorySchema(
        slug="pdf-tools",
        name="PDF Tools",
        description=(
            "Merge, split, compress, convert and organise PDFs in seconds — "
            "everything your documents need."
        ),
        icon="FileText",
        accent="rose",
        featured=True,
    ),
    CategorySchema(
        slug="developer-tools",
        name="Developer Tools",
        description=(
            "Formatters, validators, encoders and generators for everyday "
            "development work."
        ),
        icon="Code2",
        accent="violet",
        featured=True,
    ),
]

# ── Tools (a representative, coming-soon sample) ─────────────────────────────
_TOOLS: list[ToolSchema] = [
    ToolSchema(
        slug="image-compressor",
        title="Image Compressor",
        description="Shrink JPG, PNG and WebP files without visible quality loss.",
        category="image-tools",
        icon="Minimize2",
        keywords=["compress image", "reduce image size", "optimize image"],
        featured=True,
        popular=True,
        status="coming-soon",
        created_at="2026-06-28",
        faq=[
            FaqItem(
                question="Will compressing reduce image quality?",
                answer=(
                    "You control the trade-off. The default keeps images "
                    "visually identical while cutting file size significantly."
                ),
            )
        ],
    ),
    ToolSchema(
        slug="merge-pdf",
        title="Merge PDF",
        description="Combine multiple PDFs into one ordered document.",
        category="pdf-tools",
        icon="Combine",
        keywords=["merge pdf", "combine pdf", "join pdf"],
        featured=True,
        popular=True,
        status="coming-soon",
        created_at="2026-06-18",
    ),
    ToolSchema(
        slug="json-formatter",
        title="JSON Formatter",
        description="Format, validate and minify JSON with instant feedback.",
        category="developer-tools",
        icon="Braces",
        keywords=["json formatter", "json validator", "prettify json"],
        featured=True,
        popular=True,
        is_new=True,
        status="coming-soon",
        created_at="2026-07-01",
    ),
]

# Fast lookups.
_TOOLS_BY_SLUG: dict[str, ToolSchema] = {tool.slug: tool for tool in _TOOLS}
_CATEGORIES_BY_SLUG: dict[str, CategorySchema] = {
    category.slug: category for category in _CATEGORIES
}


def get_all_categories() -> list[CategorySchema]:
    """Return every category."""
    return list(_CATEGORIES)


def get_category_by_slug(slug: str) -> CategorySchema | None:
    """Return a category by slug, or ``None`` if it does not exist."""
    return _CATEGORIES_BY_SLUG.get(slug)


def get_all_tools(category: str | None = None) -> list[ToolSchema]:
    """Return all tools, optionally filtered to a single category slug."""
    if category is None:
        return list(_TOOLS)
    return [tool for tool in _TOOLS if tool.category == category]


def get_tool_by_slug(slug: str) -> ToolSchema | None:
    """Return a tool by slug, or ``None`` if it does not exist."""
    return _TOOLS_BY_SLUG.get(slug)


def category_exists(slug: str) -> bool:
    """Whether a category slug is known to the registry."""
    return slug in _CATEGORIES_BY_SLUG
