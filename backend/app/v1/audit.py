"""GigAI Developer API v1 - Site Audit endpoints.

POST /v1/audit queues an audit of a public URL; the Node worker runs it
(concurrency 2) and GET /v1/audit/{id} follows progress to the result.

Privacy posture: the only requester identity ever stored is an account id
(keyed callers) or sha256(ip) (anonymous) - never a raw IP. Results hold
findings and evidence snippets, never crawled HTML, and expire in 30 days.
Rate counters live in Postgres, not process memory, so restarts and
multiple workers cannot reset them.
"""

from __future__ import annotations

import hashlib
import re
from typing import Any

from fastapi import APIRouter, Request

from app.v1.core import api_error, audit, hash_token, new_id, pool, rate_limit

audit_router = APIRouter(prefix="/audit", tags=["site-audit"])

ANON_PER_DAY = 3
KEYED_PER_DAY = 10
MAX_QUEUE = 10
URL_RE = re.compile(r"^https?://[^\s]{4,300}$")


def _subject(request: Request) -> tuple[str, int]:
    """(rate subject, daily allowance). Keyed callers get the higher tier."""
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer gk_"):
        with pool().connection() as conn:
            row = conn.execute(
                "SELECT account_id FROM api_keys WHERE token_hash = %s AND revoked_at IS NULL",
                (hash_token(auth[7:]),),
            ).fetchone()
        if row:
            return row[0], KEYED_PER_DAY
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    return "ip:" + hashlib.sha256(ip.encode()).hexdigest(), ANON_PER_DAY


@audit_router.post("", status_code=202)
def create_audit(body: dict[str, Any], request: Request) -> dict[str, Any]:
    subject, allowance = _subject(request)
    rate_limit(request, f"audit-req:{subject}", 10)  # burst guard on the endpoint itself

    url = str(body.get("url", "")).strip()
    if not URL_RE.match(url):
        raise api_error(400, "invalid_request", "Give a public http(s) URL to audit.", "url")

    with pool().connection() as conn:
        queued = conn.execute("SELECT count(*) FROM audits WHERE status IN ('queued','running')").fetchone()[0]
        if queued >= MAX_QUEUE:
            raise api_error(503, "audit_busy",
                            "The audit queue is full right now. Retry in about 60 seconds.")
        used = conn.execute(
            """INSERT INTO audit_ratelimit (subject, day, count) VALUES (%s, current_date, 1)
               ON CONFLICT (subject, day) DO UPDATE SET count = audit_ratelimit.count + 1
               RETURNING count""",
            (subject,),
        ).fetchone()[0]
        if used > allowance:
            raise api_error(429, "audit_quota",
                            f"Daily audit limit reached ({allowance}/day"
                            f"{' anonymously - a free API key raises it to ' + str(KEYED_PER_DAY) if allowance == ANON_PER_DAY else ''}). Resets at midnight UTC.")
        audit_id = new_id("aud")
        conn.execute(
            "INSERT INTO audits (id, url, subject) VALUES (%s, %s, %s)",
            (audit_id, url, subject),
        )
    audit(None, "site-audit", "audit.created", audit_id, {"url": url[:200]})
    return {"id": audit_id, "status": "queued",
            "status_url": f"https://api.gigai.tools/v1/audit/{audit_id}"}


@audit_router.get("/{audit_id}")
def get_audit(audit_id: str, request: Request) -> dict[str, Any]:
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, f"audit-poll:{hashlib.sha256(ip.encode()).hexdigest()[:16]}", 60)
    with pool().connection() as conn:
        row = conn.execute(
            """SELECT url, status, progress, result, error, created_at, finished_at, expires_at
               FROM audits WHERE id = %s AND (expires_at IS NULL OR expires_at > now())""",
            (audit_id,),
        ).fetchone()
    if not row:
        raise api_error(404, "not_found", "No such audit, or its 30-day share window ended.", "id")
    out: dict[str, Any] = {
        "id": audit_id, "url": row[0], "status": row[1],
        "created_at": row[5].isoformat(),
        "finished_at": row[6].isoformat() if row[6] else None,
        "expires_at": row[7].isoformat() if row[7] else None,
    }
    if row[1] == "running" and row[2]:
        out["progress"] = row[2]
    if row[1] == "done":
        out["result"] = row[3]
    if row[1] == "error":
        out["error"] = row[4]
    return out
