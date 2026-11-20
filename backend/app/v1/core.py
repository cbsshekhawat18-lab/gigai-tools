"""GigAI Developer API v1 - core: db pool, ids, auth, rate limiting, errors.

Everything here is metadata-only
territory: NOTHING in this module may ever log or store file contents.
"""

from __future__ import annotations

import hashlib
import os
import secrets
import threading
import time
from typing import Any

import jwt
import psycopg
from argon2 import PasswordHasher
from fastapi import HTTPException, Request
from psycopg_pool import ConnectionPool

DSN = os.environ.get("GIGAI_API_DSN", "dbname=gigai_api user=gigai_api host=/var/run/postgresql")
JWT_SECRET = os.environ["GIGAI_API_JWT_SECRET"]  # set in the backend .env; no default on purpose
JWT_TTL_S = 12 * 3600

_pool: ConnectionPool | None = None
_ph = PasswordHasher()  # argon2id defaults


def pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(DSN, min_size=1, max_size=4, kwargs={"autocommit": True})
    return _pool


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(12)}"


def hash_password(pw: str) -> str:
    return _ph.hash(pw)


def verify_password(pw: str, ref: str) -> bool:
    try:
        return _ph.verify(ref, pw)
    except Exception:
        return False


def hash_token(token: str) -> str:
    # API keys are 256-bit random secrets; sha256 is the industry-standard
    # lookup hash for high-entropy tokens (a KDF buys nothing against 2^256).
    return hashlib.sha256(token.encode()).hexdigest()


def api_error(status: int, code: str, message: str, param: str | None = None) -> HTTPException:
    body: dict[str, Any] = {
        "code": code,
        "message": message,
        "doc_url": f"https://gigai.tools/developers/errors#{code}",
    }
    if param:
        body["param"] = param
    return HTTPException(status, {"error": body})


def session_token(account_id: str) -> str:
    now = int(time.time())
    return jwt.encode({"sub": account_id, "iat": now, "exp": now + JWT_TTL_S, "aud": "dash"},
                      JWT_SECRET, algorithm="HS256")


def require_session(request: Request) -> str:
    """Dashboard auth: Bearer JWT -> account id."""
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise api_error(401, "unauthorized", "Missing bearer token.")
    try:
        payload = jwt.decode(auth[7:], JWT_SECRET, algorithms=["HS256"], audience="dash")
    except jwt.PyJWTError:
        raise api_error(401, "unauthorized", "Invalid or expired session.") from None
    return str(payload["sub"])


# Plan rows are config that changes ~never; a tiny TTL cache keeps the
# per-request cost at zero without making changes invisible for long.
_plan_cache: dict[str, tuple[dict[str, Any], float]] = {}


def plan_limits(plan: str) -> dict[str, Any]:
    hit = _plan_cache.get(plan)
    if hit and time.time() - hit[1] < 60:
        return hit[0]
    with pool().connection() as conn:
        row = conn.execute(
            """SELECT tasks_per_month, max_file_bytes, rpm, concurrent_jobs, webhook_endpoints
               FROM plan_limits WHERE plan = %s""", (plan,)).fetchone()
    limits = {"tasks_per_month": row[0], "max_file_bytes": row[1], "rpm": row[2],
              "concurrent_jobs": row[3], "webhook_endpoints": row[4]}
    _plan_cache[plan] = (limits, time.time())
    return limits


def require_api_key(request: Request, scope: str | None = None) -> dict[str, Any]:
    """Programmatic auth: gk_live_/gk_test_ token -> key row (updates last_used).

    Also the single rate-limit chokepoint: every keyed request spends one
    token from the key's bucket. The headers land on request.state so
    endpoints that have a Response handy can echo them.
    """
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer gk_"):
        raise api_error(401, "unauthorized", "Provide an API key: Authorization: Bearer gk_...")
    token = auth[7:]
    with pool().connection() as conn:
        row = conn.execute(
            """SELECT k.id, k.account_id, k.scopes, k.sandbox, k.ip_allowlist, a.plan,
                      a.suspended_at, a.limits_override
               FROM api_keys k JOIN accounts a ON a.id = k.account_id
               WHERE k.token_hash = %s AND k.revoked_at IS NULL AND a.deleted_at IS NULL""",
            (hash_token(token),),
        ).fetchone()
        if not row:
            raise api_error(401, "unauthorized", "Unknown or revoked API key.")
        if row[6] is not None:
            raise api_error(403, "account_suspended", "This account is suspended. Contact support.")
        key = {"id": row[0], "account_id": row[1], "scopes": row[2], "sandbox": row[3],
               "ip_allowlist": row[4], "plan": row[5],
               "limits": {**plan_limits(row[5]), **{k: v for k, v in (row[7] or {}).items()
                                                    if k in plan_limits(row[5])}}}
        if key["ip_allowlist"]:
            client_ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "")
            if client_ip not in key["ip_allowlist"]:
                raise api_error(403, "ip_not_allowed", "This key is restricted to an IP allowlist.")
        if scope and scope not in key["scopes"]:
            raise api_error(403, "missing_scope", f"This key lacks the {scope} scope.", "scope")
        conn.execute("UPDATE api_keys SET last_used_at = now() WHERE id = %s", (key["id"],))
    request.state.rate_headers = rate_limit(request, f"key:{key['id']}", key["limits"]["rpm"])
    return key


# Process-local token bucket. Honest limitation: per-process, resets on
# restart - correct enough for one box; swap for a shared store when the
# gateway scales out.
_buckets: dict[str, tuple[float, float]] = {}
_block = threading.Lock()


def rate_limit(request: Request, subject: str, rpm: int) -> dict[str, str]:
    now = time.time()
    with _block:
        tokens, ts = _buckets.get(subject, (float(rpm), now))
        tokens = min(float(rpm), tokens + (now - ts) * (rpm / 60.0))
        if tokens < 1.0:
            reset = int(now + (1.0 - tokens) / (rpm / 60.0))
            raise HTTPException(429, {"error": {
                "code": "rate_limited",
                "message": "Too many requests. Slow down and retry.",
                "doc_url": "https://gigai.tools/developers/rate-limits",
            }}, headers={"X-RateLimit-Limit": str(rpm), "X-RateLimit-Remaining": "0",
                         "X-RateLimit-Reset": str(reset), "Retry-After": str(max(1, reset - int(now)))})
        _buckets[subject] = (tokens - 1.0, now)
        return {"X-RateLimit-Limit": str(rpm),
                "X-RateLimit-Remaining": str(int(tokens - 1.0)),
                "X-RateLimit-Reset": str(int(now + 60))}


def audit(account_id: str | None, actor: str, action: str, subject_id: str | None = None,
          metadata: dict[str, Any] | None = None) -> None:
    with pool().connection() as conn:
        conn.execute(
            "INSERT INTO audit_log (account_id, actor, action, subject_id, metadata) VALUES (%s,%s,%s,%s,%s)",
            (account_id, actor, action, subject_id, psycopg.types.json.Json(metadata or {})),
        )
