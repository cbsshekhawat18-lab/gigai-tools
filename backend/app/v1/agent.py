"""GigAI Developer API v1 - Ask GigAI agent endpoints.

POST /v1/agent/plan turns a goal sentence plus file METADATA into a tool
pipeline via the free-tier model chain (Groq -> Gemini -> OpenRouter, the
same $0 posture as the audit LLM layer: shared llm_quota hard stop, and a
dormant chain when no keys are configured - callers then fall back to
their local heuristic planner, which the /ask page and MCP client both
have). Strictly text-only: goals and names are size-capped and file
contents are never accepted. The caller validates the returned plan
against the live tool catalogue - a model can propose, only the registry
disposes.

POST /v1/agent/learn stores an opt-in learning record (goal, plan,
outcomes, whether the user edited the plan) - never file contents. The
/ask UI shows the exact JSON before sending and defaults to off.
"""

from __future__ import annotations

import json
import os
from typing import Any

import httpx
from fastapi import APIRouter, Request

from app.v1.core import api_error, audit, new_id, pool, require_api_key

agent_router = APIRouter(prefix="/agent", tags=["agent"])

PLANS_PER_DAY = 10
MAX_GOAL = 500
MAX_FILES = 10
MAX_CATALOGUE = 40_000  # chars of catalogue JSON accepted from the caller
DAILY_FREE_CAP = 200    # per-provider hard stop shared via llm_quota

PROVIDERS = [
    {
        "name": "groq",
        "env": ("GIGAI_AGENT_GROQ_KEY", "GIGAI_AUDIT_GROQ_KEY"),
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "openai/gpt-oss-20b",
        # gpt-oss is a reasoning model: keep thinking short so the token
        # budget goes to the JSON answer.
        "extra": {"reasoning_effort": "low"},
    },
    {
        "name": "gemini",
        "env": ("GIGAI_AGENT_GEMINI_KEY", "GIGAI_AUDIT_GEMINI_KEY"),
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
        "model": "gemini-3.6-flash",
    },
    {
        "name": "openrouter",
        "env": ("GIGAI_AGENT_OPENROUTER_KEY", "GIGAI_AUDIT_OPENROUTER_KEY"),
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "model": "meta-llama/llama-3.1-8b-instruct:free",
    },
]


def _key_for(provider: dict[str, Any]) -> str | None:
    for name in provider["env"]:
        if os.environ.get(name):
            return os.environ[name]
    return None


def _reserve_quota(conn: Any, provider: str) -> bool:
    used = conn.execute(
        """INSERT INTO llm_quota (provider, day, requests) VALUES (%s, current_date, 1)
           ON CONFLICT (provider, day) DO UPDATE SET requests = llm_quota.requests + 1
           RETURNING requests""",
        (provider,),
    ).fetchone()[0]
    return used <= DAILY_FREE_CAP


def _prompt(goal: str, files: list[dict[str, Any]], catalogue: str) -> str:
    return (
        "You plan file-processing pipelines using ONLY the tools listed. "
        'Answer with pure JSON, no prose:\n{"steps":[{"toolId":"...","input":{...},"why":"one sentence"}]}\n'
        "Rules: at most 6 steps; every toolId and every input option must exist in the "
        "catalogue exactly as listed; steps run in order, each consuming the previous output.\n\n"
        f"Goal: {goal}\nFiles (metadata only): {json.dumps(files)}\nCatalogue: {catalogue}"
    )


def _extract_json(text: str) -> dict[str, Any] | None:
    cleaned = text.replace("```json", "").replace("```", "")
    start = cleaned.find("{")
    if start == -1:
        return None
    for end in range(len(cleaned), start, -1):
        try:
            out = json.loads(cleaned[start:end])
            return out if isinstance(out, dict) else None
        except (json.JSONDecodeError, ValueError):
            continue
    return None


def _call_provider(provider: dict[str, Any], key: str, prompt: str) -> str | None:
    try:
        with httpx.Client(timeout=20) as client:
            if provider["name"] == "gemini":
                r = client.post(
                    provider["url"], params={"key": key},
                    json={"contents": [{"parts": [{"text": prompt}]}],
                          "generationConfig": {"maxOutputTokens": 500}},
                )
                if r.status_code != 200:
                    return None
                return r.json()["candidates"][0]["content"]["parts"][0]["text"]
            r = client.post(
                provider["url"],
                headers={"authorization": f"Bearer {key}"},
                json={"model": provider["model"], "max_tokens": 1200,
                      "messages": [{"role": "user", "content": prompt}],
                      **provider.get("extra", {})},
            )
            if r.status_code != 200:
                return None
            return r.json()["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        return None


def _default_catalogue() -> str:
    from app.v1.tools import ENGINES
    compact = [
        {"id": slug, "desc": spec.get("description", ""), "inputs": spec.get("options_schema", {})}
        for slug, spec in sorted(ENGINES.items())
    ]
    return json.dumps(compact)


@agent_router.post("/plan")
def plan(body: dict[str, Any], request: Request) -> dict[str, Any]:
    key = require_api_key(request)

    goal = str(body.get("goal", "")).strip()
    if not goal or len(goal) > MAX_GOAL:
        raise api_error(400, "invalid_request", f"Give a goal sentence (1-{MAX_GOAL} chars).", "goal")
    files_raw = body.get("files", [])
    if not isinstance(files_raw, list) or len(files_raw) > MAX_FILES:
        raise api_error(400, "invalid_request", f"files must be a list of at most {MAX_FILES} entries.", "files")
    files = []
    for f in files_raw:
        if not isinstance(f, dict):
            raise api_error(400, "invalid_request", "Each file entry must be an object.", "files")
        entry: dict[str, Any] = {
            "name": str(f.get("name", ""))[:120],
            "type": str(f.get("type", ""))[:80],
            "size": int(f.get("size", 0)),
        }
        for dim in ("width", "height"):
            if isinstance(f.get(dim), int):
                entry[dim] = f[dim]
        files.append(entry)

    catalogue = body.get("catalogue")
    if catalogue is not None:
        catalogue = json.dumps(catalogue) if not isinstance(catalogue, str) else catalogue
        if len(catalogue) > MAX_CATALOGUE:
            raise api_error(400, "invalid_request",
                            f"catalogue exceeds {MAX_CATALOGUE} characters.", "catalogue")
    else:
        catalogue = _default_catalogue()

    with pool().connection() as conn:
        used = conn.execute(
            """INSERT INTO agent_ratelimit (subject, day, count) VALUES (%s, current_date, 1)
               ON CONFLICT (subject, day) DO UPDATE SET count = agent_ratelimit.count + 1
               RETURNING count""",
            (key["account_id"],),
        ).fetchone()[0]
        if used > PLANS_PER_DAY:
            raise api_error(429, "agent_quota",
                            f"Daily planning limit reached ({PLANS_PER_DAY}/day). "
                            "Resets at midnight UTC. The on-device planner keeps working.")

        prompt = _prompt(goal, files, catalogue)
        for provider in PROVIDERS:
            provider_key = _key_for(provider)
            if not provider_key:
                continue
            if not _reserve_quota(conn, provider["name"]):
                continue
            text = _call_provider(provider, provider_key, prompt)
            if not text:
                continue
            parsed = _extract_json(text)
            if parsed and isinstance(parsed.get("steps"), list) and parsed["steps"]:
                audit(key["account_id"], "agent", "agent.planned", None,
                      {"provider": provider["name"], "steps": len(parsed["steps"])})
                return {"plan": {"steps": parsed["steps"][:6]}, "provider": provider["name"],
                        "note": "Validate this plan against the live tool catalogue before running it."}

    raise api_error(503, "planning_unavailable",
                    "Free-tier planning is not available right now (no provider capacity). "
                    "Use the on-device planner - it needs no server.")


@agent_router.post("/learn", status_code=201)
def learn(body: dict[str, Any], request: Request) -> dict[str, Any]:
    key = require_api_key(request)
    if body.get("opt_in") is not True:
        raise api_error(400, "invalid_request",
                        "Learning records are stored only with explicit opt_in: true.", "opt_in")
    goal = str(body.get("goal", ""))[:MAX_GOAL]
    plan_json = body.get("plan")
    outcomes = body.get("outcomes", [])
    if not goal or not isinstance(plan_json, dict) or not isinstance(outcomes, list):
        raise api_error(400, "invalid_request", "Send goal, plan and outcomes.", "plan")
    # Text-only fence: the whole record must stay small - anything file-sized is refused.
    record = json.dumps({"plan": plan_json, "outcomes": outcomes})
    if len(record) > 20_000:
        raise api_error(400, "invalid_request",
                        "Learning records are metadata-sized. File contents are never accepted.", "plan")
    learn_id = new_id("lrn")
    with pool().connection() as conn:
        conn.execute(
            """INSERT INTO agent_learning (id, account_id, goal, plan, outcomes, edited)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (learn_id, key["account_id"], goal, json.dumps(plan_json),
             json.dumps(outcomes), bool(body.get("edited", False))),
        )
    audit(key["account_id"], "agent", "agent.learned", learn_id, {"edited": bool(body.get("edited", False))})
    return {"id": learn_id, "stored": {"goal": goal, "plan": plan_json,
                                       "outcomes": outcomes, "edited": bool(body.get("edited", False))}}
