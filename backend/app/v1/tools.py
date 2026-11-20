"""GigAI Developer API v1 - tool catalog.

The manifest (engines.json, deployed beside this module) is the single source
of truth: the API validates against it, the worker dispatches from it, and the
OpenAPI spec is generated from it. A tool appears here only when the worker
can actually run it - the docs never promise an engine that doesn't exist.
"""

from __future__ import annotations

import json
import os
from typing import Any

from fastapi import APIRouter

from app.v1.core import api_error

with open(os.path.join(os.path.dirname(__file__), "engines.json")) as _fh:
    ENGINES: dict[str, Any] = json.load(_fh)

tools_router = APIRouter()


def _public(slug: str, spec: dict[str, Any]) -> dict[str, Any]:
    return {
        "slug": slug,
        "name": spec["name"],
        "category": spec["category"],
        "description": spec["description"],
        "input_formats": spec["input_formats"],
        "output_formats": spec["output_formats"],
        "multi_input": spec.get("multi_input", False),
        "no_input": spec.get("no_input", False),
        "max_input_bytes": spec["max_input_bytes"],
        "options_schema": spec["options_schema"],
    }


@tools_router.get("/tools")
def list_tools() -> dict[str, Any]:
    return {"tools": [_public(slug, spec) for slug, spec in sorted(ENGINES.items())]}


@tools_router.get("/tools/{slug}")
def get_tool(slug: str) -> dict[str, Any]:
    if slug not in ENGINES:
        raise api_error(404, "not_found", f"No tool named '{slug}'. GET /v1/tools lists what exists.", "slug")
    return _public(slug, ENGINES[slug])
