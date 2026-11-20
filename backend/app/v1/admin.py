"""GigAI Developer API v1 - admin endpoints.

Gated twice: a valid dashboard session AND the account's email listed in
GIGAI_ADMIN_EMAILS (comma-separated, set in the server env - roles never
live in client code). Every mutating action writes an audit row with the
admin's email as actor. Read endpoints return metadata and aggregates only,
never file contents - same rule as everywhere else.
"""

from __future__ import annotations

import os
from typing import Any

import psycopg
from fastapi import APIRouter, Request

from app.v1.core import api_error, audit, pool, require_session
from app.v1.tools import ENGINES

admin_router = APIRouter(prefix="/admin", tags=["admin"])

OVERRIDABLE = {"tasks_per_month", "max_file_bytes", "rpm", "concurrent_jobs", "webhook_endpoints"}


def admin_email(conn, account_id: str) -> str | None:
    """The account's email if it is on the GIGAI_ADMIN_EMAILS list, else None."""
    allowed = {e.strip().lower() for e in os.environ.get("GIGAI_ADMIN_EMAILS", "").split(",") if e.strip()}
    row = conn.execute("SELECT email FROM accounts WHERE id = %s AND deleted_at IS NULL", (account_id,)).fetchone()
    return row[0] if row and row[0].lower() in allowed else None


def is_admin_account(conn, account_id: str) -> bool:
    return admin_email(conn, account_id) is not None


def _require_admin(request: Request) -> tuple[str, str]:
    acc = require_session(request)
    with pool().connection() as conn:
        email = admin_email(conn, acc)
    if not email:
        raise api_error(404, "not_found", "Not found.")  # admin surface stays invisible
    return acc, email


@admin_router.get("/stats")
def stats(request: Request) -> dict[str, Any]:
    _require_admin(request)
    with pool().connection() as conn:
        def one(sql: str, *args: Any) -> Any:
            return conn.execute(sql, args or None).fetchone()[0]
        out = {
            "users_total": one("SELECT count(*) FROM accounts WHERE deleted_at IS NULL"),
            "users_new_7d": one("SELECT count(*) FROM accounts WHERE created_at > now() - interval '7 days'"),
            "users_active_30d": one(
                "SELECT count(DISTINCT account_id) FROM jobs WHERE created_at > now() - interval '30 days'"),
            "tasks_1d": one("""SELECT count(*) FROM tasks t JOIN jobs j ON j.id = t.job_id
                               WHERE j.created_at > now() - interval '1 day' AND t.operation = ANY(%s)""",
                            list(ENGINES.keys())),
            "tasks_30d": one("""SELECT count(*) FROM tasks t JOIN jobs j ON j.id = t.job_id
                                WHERE j.created_at > now() - interval '30 days' AND t.operation = ANY(%s)""",
                             list(ENGINES.keys())),
            "error_rate_7d": one(
                """SELECT round(100.0 * count(*) FILTER (WHERE t.status = 'error')
                          / greatest(count(*), 1), 1)
                   FROM tasks t JOIN jobs j ON j.id = t.job_id
                   WHERE j.created_at > now() - interval '7 days'"""),
            "queue_depth": one("SELECT count(*) FROM tasks WHERE status = 'waiting'"),
            "files_in_retention": one("SELECT count(*) FROM files WHERE deleted_at IS NULL"),
            "bytes_in_retention": one(
                "SELECT coalesce(sum(size), 0) FROM files WHERE deleted_at IS NULL"),
            "unverified_deletions": one(
                "SELECT count(*) FROM files WHERE deleted_at IS NOT NULL AND delete_verified_at IS NULL"),
            "failing_webhooks": one(
                """SELECT count(*) FROM webhook_deliveries
                   WHERE delivered_at IS NULL AND attempt >= 3"""),
        }
    return out


@admin_router.get("/health")
def server_health(request: Request) -> dict[str, Any]:
    """Box pressure at a glance - the numbers the OOM killer sees first."""
    _require_admin(request)
    import shutil
    mem: dict[str, int] = {}
    with open("/proc/meminfo") as fh:
        for line in fh:
            parts = line.split()
            if parts[0].rstrip(":") in ("MemTotal", "MemAvailable", "SwapTotal", "SwapFree"):
                mem[parts[0].rstrip(":")] = int(parts[1])  # kB
    disk = shutil.disk_usage("/")
    with open("/proc/loadavg") as fh:
        load = fh.read().split()[:3]
    # CPU credit balance lives in CloudWatch, not IMDS - report honestly.
    return {
        "disk": {"free_mb": disk.free // 1048576, "total_mb": disk.total // 1048576,
                 "used_percent": round(100 * (disk.total - disk.free) / disk.total)},
        "memory": {"available_mb": mem.get("MemAvailable", 0) // 1024,
                   "total_mb": mem.get("MemTotal", 0) // 1024,
                   "swap_used_mb": (mem.get("SwapTotal", 0) - mem.get("SwapFree", 0)) // 1024,
                   "swap_total_mb": mem.get("SwapTotal", 0) // 1024},
        "load": load,
        "cpu_credits": None,
        "cpu_credits_note": "Burstable cloud instances report CPU credits only through the provider's monitoring console; the server cannot read them locally.",
        "warn": {"disk": disk.free // 1048576 < 800, "memory": mem.get("MemAvailable", 0) // 1024 < 200},
    }


@admin_router.get("/users")
def users(request: Request, q: str | None = None, limit: int = 50, offset: int = 0) -> dict[str, Any]:
    _require_admin(request)
    limit = max(1, min(200, limit))
    where = "a.deleted_at IS NULL"
    args: list[Any] = []
    if q:
        where += " AND (a.email ILIKE %s OR a.id = %s)"
        args += [f"%{q}%", q]
    with pool().connection() as conn:
        rows = conn.execute(
            f"""SELECT a.id, a.email, a.plan, a.role, a.suspended_at IS NOT NULL,
                       a.created_at,
                       (SELECT count(*) FROM api_keys k WHERE k.account_id = a.id AND k.revoked_at IS NULL),
                       (SELECT count(*) FROM tasks t JOIN jobs j ON j.id = t.job_id
                        WHERE j.account_id = a.id AND j.created_at > now() - interval '30 days'
                          AND t.operation = ANY(%s)),
                       (SELECT max(created_at) FROM jobs j WHERE j.account_id = a.id),
                       a.limits_override != '{{}}'::jsonb
                FROM accounts a WHERE {where}
                ORDER BY a.created_at DESC LIMIT %s OFFSET %s""",
            [list(ENGINES.keys())] + args + [limit, max(0, offset)]).fetchall()
        total = conn.execute(f"SELECT count(*) FROM accounts a WHERE {where}", args or None).fetchone()[0]
    return {"total": total, "users": [
        {"id": r[0], "email": r[1], "plan": r[2], "role": r[3], "suspended": r[4],
         "created_at": r[5].isoformat(), "keys": r[6], "tasks_30d": r[7],
         "last_job_at": r[8].isoformat() if r[8] else None, "has_overrides": r[9]} for r in rows]}


@admin_router.get("/users/{account_id}")
def user_detail(account_id: str, request: Request) -> dict[str, Any]:
    _require_admin(request)
    with pool().connection() as conn:
        a = conn.execute(
            """SELECT email, plan, role, suspended_at, created_at, retention_default_s, limits_override
               FROM accounts WHERE id = %s AND deleted_at IS NULL""", (account_id,)).fetchone()
        if not a:
            raise api_error(404, "not_found", "No such account.", "id")
        tools = conn.execute(
            """SELECT t.operation,
                      count(*) FILTER (WHERE j.created_at > now() - interval '30 days') AS t30,
                      count(*) AS t_all,
                      count(*) FILTER (WHERE t.status = 'finished') AS ok,
                      count(*) FILTER (WHERE t.status = 'error') AS errors,
                      coalesce(avg(t.duration_ms) FILTER (WHERE t.duration_ms IS NOT NULL), 0)::int AS avg_ms,
                      min(j.created_at) AS first_used, max(j.created_at) AS last_used
               FROM tasks t JOIN jobs j ON j.id = t.job_id
               WHERE j.account_id = %s AND t.operation = ANY(%s)
               GROUP BY 1 ORDER BY 3 DESC""",
            (account_id, list(ENGINES.keys()))).fetchall()
        keys = conn.execute(
            """SELECT id, name, prefix, last4, scopes, sandbox, last_used_at, created_at, revoked_at
               FROM api_keys WHERE account_id = %s ORDER BY created_at""", (account_id,)).fetchall()
        jobs = conn.execute(
            """SELECT id, tag, status, sandbox, created_at, finished_at
               FROM jobs WHERE account_id = %s ORDER BY created_at DESC LIMIT 15""",
            (account_id,)).fetchall()
        hooks = conn.execute(
            "SELECT id, url, events, disabled_at IS NOT NULL FROM webhooks WHERE account_id = %s",
            (account_id,)).fetchall()
        log = conn.execute(
            """SELECT actor, action, subject_id, metadata, created_at FROM audit_log
               WHERE account_id = %s ORDER BY id DESC LIMIT 30""", (account_id,)).fetchall()
        plan_row = conn.execute(
            "SELECT tasks_per_month, max_file_bytes, rpm, concurrent_jobs, webhook_endpoints FROM plan_limits WHERE plan = %s",
            (a[1],)).fetchone()
        usage = conn.execute(
            """SELECT to_char(date_trunc('day', j.created_at), 'YYYY-MM-DD'), count(*)
               FROM tasks t JOIN jobs j ON j.id = t.job_id
               WHERE j.account_id = %s AND j.created_at > now() - interval '30 days'
                 AND t.operation = ANY(%s)
               GROUP BY 1 ORDER BY 1""", (account_id, list(ENGINES.keys()))).fetchall()
    defaults = {"tasks_per_month": plan_row[0], "max_file_bytes": plan_row[1], "rpm": plan_row[2],
                "concurrent_jobs": plan_row[3], "webhook_endpoints": plan_row[4]}
    overrides = a[6] or {}
    return {
        "id": account_id, "email": a[0], "plan": a[1], "role": a[2],
        "suspended": a[3].isoformat() if a[3] else None,
        "created_at": a[4].isoformat(), "retention_default_s": a[5],
        "limits": {"defaults": defaults, "overrides": overrides,
                   "effective": {**defaults, **{k: v for k, v in overrides.items() if k in defaults}}},
        "tools_used": [
            {"operation": r[0], "tasks_30d": r[1], "tasks_all": r[2], "ok": r[3], "errors": r[4],
             "avg_ms": r[5], "first_used": r[6].isoformat(), "last_used": r[7].isoformat()} for r in tools],
        "keys": [
            {"id": r[0], "name": r[1], "masked": f"{r[2]}...{r[3]}", "scopes": list(r[4]),
             "sandbox": r[5], "last_used_at": r[6].isoformat() if r[6] else None,
             "created_at": r[7].isoformat(), "revoked": r[8] is not None} for r in keys],
        "jobs": [
            {"id": r[0], "tag": r[1], "status": r[2], "sandbox": r[3],
             "created_at": r[4].isoformat(), "finished_at": r[5].isoformat() if r[5] else None}
            for r in jobs],
        "webhooks": [{"id": r[0], "url": r[1], "events": list(r[2]), "disabled": r[3]} for r in hooks],
        "usage_daily": [{"day": r[0], "tasks": r[1]} for r in usage],
        "audit": [
            {"actor": r[0], "action": r[1], "subject": r[2], "metadata": r[3],
             "at": r[4].isoformat()} for r in log],
    }


@admin_router.patch("/users/{account_id}/limits")
def set_limits(account_id: str, body: dict[str, Any], request: Request) -> dict[str, Any]:
    _, admin_email = _require_admin(request)
    overrides = body.get("overrides")
    if not isinstance(overrides, dict) or not set(overrides) <= OVERRIDABLE:
        raise api_error(400, "invalid_request", f"overrides keys must be within {sorted(OVERRIDABLE)}.")
    for k, v in overrides.items():
        if not isinstance(v, int) or v < 0:
            raise api_error(400, "invalid_request", f"'{k}' must be a non-negative integer.", k)
    with pool().connection() as conn:
        before = conn.execute("SELECT limits_override FROM accounts WHERE id = %s AND deleted_at IS NULL",
                              (account_id,)).fetchone()
        if not before:
            raise api_error(404, "not_found", "No such account.", "id")
        conn.execute("UPDATE accounts SET limits_override = %s WHERE id = %s",
                     (psycopg.types.json.Json(overrides), account_id))
    audit(account_id, f"admin:{admin_email}", "admin.limits_changed", account_id,
          {"before": before[0], "after": overrides})
    return {"overrides": overrides}


@admin_router.post("/users/{account_id}/suspend")
def suspend(account_id: str, request: Request) -> dict[str, Any]:
    _, admin_email = _require_admin(request)
    with pool().connection() as conn:
        row = conn.execute(
            "UPDATE accounts SET suspended_at = now() WHERE id = %s AND deleted_at IS NULL RETURNING id",
            (account_id,)).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such account.", "id")
    audit(account_id, f"admin:{admin_email}", "admin.suspended", account_id)
    return {"suspended": True}


@admin_router.post("/users/{account_id}/unsuspend")
def unsuspend(account_id: str, request: Request) -> dict[str, Any]:
    _, admin_email = _require_admin(request)
    with pool().connection() as conn:
        row = conn.execute(
            "UPDATE accounts SET suspended_at = NULL WHERE id = %s AND deleted_at IS NULL RETURNING id",
            (account_id,)).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such account.", "id")
    audit(account_id, f"admin:{admin_email}", "admin.unsuspended", account_id)
    return {"suspended": False}


@admin_router.get("/tools")
def tools_analytics(request: Request) -> dict[str, Any]:
    _require_admin(request)
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT t.operation,
                      count(*) FILTER (WHERE j.created_at > now() - interval '30 days') AS t30,
                      count(*) FILTER (WHERE j.created_at > now() - interval '60 days'
                                        AND j.created_at <= now() - interval '30 days') AS t_prev,
                      count(DISTINCT j.account_id) FILTER (WHERE j.created_at > now() - interval '30 days') AS users30,
                      count(*) FILTER (WHERE t.status = 'error'
                                        AND j.created_at > now() - interval '30 days') AS err30,
                      coalesce(avg(t.duration_ms) FILTER (WHERE t.duration_ms IS NOT NULL
                                        AND j.created_at > now() - interval '30 days'), 0)::int AS avg_ms
               FROM tasks t JOIN jobs j ON j.id = t.job_id
               WHERE t.operation = ANY(%s)
               GROUP BY 1 ORDER BY 2 DESC""", (list(ENGINES.keys()),)).fetchall()
    return {"tools": [
        {"operation": r[0], "tasks_30d": r[1], "tasks_prev_30d": r[2], "users_30d": r[3],
         "errors_30d": r[4], "avg_ms": r[5]} for r in rows]}


@admin_router.get("/feedback")
def feedback_list(request: Request, limit: int = 100) -> dict[str, Any]:
    _require_admin(request)
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT page, helpful, comment, created_at FROM docs_feedback
               ORDER BY id DESC LIMIT %s""", (max(1, min(500, limit)),)).fetchall()
        summary = conn.execute(
            """SELECT page, count(*) FILTER (WHERE helpful), count(*) FILTER (WHERE NOT helpful)
               FROM docs_feedback GROUP BY 1 ORDER BY 3 DESC, 2 DESC LIMIT 50""").fetchall()
    return {
        "by_page": [{"page": r[0], "yes": r[1], "no": r[2]} for r in summary],
        "recent": [{"page": r[0], "helpful": r[1], "comment": r[2], "at": r[3].isoformat()} for r in rows],
    }


@admin_router.get("/audit")
def audit_list(request: Request, limit: int = 100, account_id: str | None = None) -> dict[str, Any]:
    _require_admin(request)
    with pool().connection() as conn:
        if account_id:
            rows = conn.execute(
                """SELECT account_id, actor, action, subject_id, metadata, created_at FROM audit_log
                   WHERE account_id = %s ORDER BY id DESC LIMIT %s""",
                (account_id, max(1, min(500, limit)))).fetchall()
        else:
            rows = conn.execute(
                """SELECT account_id, actor, action, subject_id, metadata, created_at FROM audit_log
                   ORDER BY id DESC LIMIT %s""", (max(1, min(500, limit)),)).fetchall()
    return {"audit": [
        {"account_id": r[0], "actor": r[1], "action": r[2], "subject": r[3],
         "metadata": r[4], "at": r[5].isoformat()} for r in rows]}


@admin_router.patch("/plans/{plan}")
def update_plan(plan: str, body: dict[str, Any], request: Request) -> dict[str, Any]:
    _, admin_email = _require_admin(request)
    fields = {k: v for k, v in body.items() if k in OVERRIDABLE}
    if not fields or any(not isinstance(v, int) or v < 0 for v in fields.values()):
        raise api_error(400, "invalid_request", f"Give non-negative integers for {sorted(OVERRIDABLE)}.")
    sets = ", ".join(f"{k} = %s" for k in fields)
    with pool().connection() as conn:
        row = conn.execute(
            f"UPDATE plan_limits SET {sets} WHERE plan = %s RETURNING plan",
            [*fields.values(), plan]).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such plan.", "plan")
    audit(None, f"admin:{admin_email}", "admin.plan_changed", plan, fields)
    return {"plan": plan, "updated": fields}
