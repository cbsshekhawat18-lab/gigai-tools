"""GigAI Developer API v1 - dashboard data (session-authenticated).

Everything the account dashboard shows that an API key should not be needed
for: the user's jobs, daily and per-tool usage, webhook management, and
settings. Same handlers-shape as the keyed endpoints, gated by the session
JWT instead. Plus the one anonymous endpoint here: docs feedback.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

import app.v1.storage as storage
from app.v1.core import (
    api_error, audit, hash_password, new_id, plan_limits, pool, rate_limit,
    require_session, verify_password,
)
from app.v1.jobs import _job_json
from app.v1.tools import ENGINES
from app.v1.webhooks import ALLOWED_EVENTS, _host_is_public

dash_router = APIRouter(prefix="/account", tags=["dashboard"])
feedback_router = APIRouter()


@dash_router.get("/jobs")
def my_jobs(request: Request, status: str | None = None, limit: int = 20) -> dict[str, Any]:
    acc = require_session(request)
    limit = max(1, min(50, limit))
    with pool().connection() as conn:
        if status:
            rows = conn.execute(
                "SELECT id FROM jobs WHERE account_id = %s AND status = %s ORDER BY created_at DESC LIMIT %s",
                (acc, status, limit)).fetchall()
        else:
            rows = conn.execute(
                "SELECT id FROM jobs WHERE account_id = %s ORDER BY created_at DESC LIMIT %s",
                (acc, limit)).fetchall()
        return {"jobs": [_job_json(conn, r[0]) for r in rows]}


@dash_router.get("/jobs/{job_id}")
def my_job(job_id: str, request: Request) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        row = conn.execute("SELECT 1 FROM jobs WHERE id = %s AND account_id = %s", (job_id, acc)).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such job on this account.", "id")
        return _job_json(conn, job_id)


@dash_router.delete("/jobs/{job_id}")
def cancel_my_job(job_id: str, request: Request) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        row = conn.execute("SELECT 1 FROM jobs WHERE id = %s AND account_id = %s", (job_id, acc)).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such job on this account.", "id")
        conn.execute(
            "UPDATE tasks SET status = 'cancelled' WHERE job_id = %s AND status IN ('waiting','processing')",
            (job_id,))
        conn.execute(
            "UPDATE jobs SET status = 'cancelled', finished_at = now() WHERE id = %s AND finished_at IS NULL",
            (job_id,))
        files = conn.execute(
            "SELECT id FROM files WHERE job_id = %s AND deleted_at IS NULL", (job_id,)).fetchall()
        for (fid,) in files:
            ok = storage.delete(fid)
            conn.execute(
                "UPDATE files SET deleted_at = now(), delete_verified_at = CASE WHEN %s THEN now() END WHERE id = %s",
                (ok, fid))
        audit(acc, "user", "job.cancelled", job_id, {"files_purged": len(files), "via": "dashboard"})
        return _job_json(conn, job_id)


@dash_router.get("/usage/daily")
def usage_daily(request: Request, days: int = 30) -> dict[str, Any]:
    acc = require_session(request)
    days = max(1, min(90, days))
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT to_char(date_trunc('day', j.created_at), 'YYYY-MM-DD') AS day,
                      count(*) FILTER (WHERE t.operation = ANY(%s)) AS tasks,
                      count(*) FILTER (WHERE t.status = 'error') AS errors
               FROM tasks t JOIN jobs j ON j.id = t.job_id
               WHERE j.account_id = %s AND j.created_at > now() - %s * interval '1 day'
               GROUP BY 1 ORDER BY 1""",
            (list(ENGINES.keys()), acc, days)).fetchall()
    return {"days": [{"day": r[0], "tasks": r[1], "errors": r[2]} for r in rows]}


@dash_router.get("/usage/tools")
def usage_tools(request: Request) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT t.operation,
                      count(*) AS tasks,
                      count(*) FILTER (WHERE t.status = 'finished') AS ok,
                      count(*) FILTER (WHERE t.status = 'error') AS errors,
                      coalesce(avg(t.duration_ms) FILTER (WHERE t.duration_ms IS NOT NULL), 0)::int AS avg_ms,
                      max(t.finished_at) AS last_used
               FROM tasks t JOIN jobs j ON j.id = t.job_id
               WHERE j.account_id = %s AND t.operation = ANY(%s)
               GROUP BY 1 ORDER BY 2 DESC""",
            (acc, list(ENGINES.keys()))).fetchall()
    return {"tools": [
        {"operation": r[0], "tasks": r[1], "ok": r[2], "errors": r[3], "avg_ms": r[4],
         "last_used": r[5].isoformat() if r[5] else None} for r in rows]}


@dash_router.patch("")
def update_account(body: dict[str, Any], request: Request) -> dict[str, Any]:
    acc = require_session(request)
    changed = []
    with pool().connection() as conn:
        if "retention_default_s" in body:
            val = body["retention_default_s"]
            if not isinstance(val, int) or not (0 <= val <= 86400):
                raise api_error(400, "invalid_request", "retention_default_s must be 0..86400.", "retention_default_s")
            conn.execute("UPDATE accounts SET retention_default_s = %s WHERE id = %s", (val, acc))
            changed.append("retention_default_s")
        if "password" in body:
            pw = body["password"]
            if not isinstance(pw, dict) or not pw.get("current") or not pw.get("new"):
                raise api_error(400, "invalid_request", "password needs {current, new}.", "password")
            if len(pw["new"]) < 10:
                raise api_error(422, "weak_password", "Passwords need at least 10 characters.", "password")
            row = conn.execute("SELECT password_hash FROM accounts WHERE id = %s", (acc,)).fetchone()
            if not verify_password(pw["current"], row[0]):
                raise api_error(401, "bad_credentials", "Current password is wrong.", "password")
            conn.execute("UPDATE accounts SET password_hash = %s WHERE id = %s", (hash_password(pw["new"]), acc))
            changed.append("password")
    if changed:
        audit(acc, "user", "account.updated", acc, {"fields": changed})
    return {"updated": changed}


# ---------------------------------------------------------------- webhooks

@dash_router.get("/webhooks")
def my_webhooks(request: Request) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT w.id, w.url, w.events, w.created_at, w.disabled_at,
                      count(d.id) FILTER (WHERE d.delivered_at IS NOT NULL) AS ok7,
                      count(d.id) FILTER (WHERE d.delivered_at IS NULL AND d.attempt > 0) AS fail7
               FROM webhooks w
               LEFT JOIN webhook_deliveries d ON d.webhook_id = w.id
                    AND d.id IN (SELECT id FROM webhook_deliveries WHERE webhook_id = w.id
                                 ORDER BY id DESC LIMIT 200)
               WHERE w.account_id = %s
               GROUP BY w.id ORDER BY w.created_at""", (acc,)).fetchall()
    return {"webhooks": [
        {"id": r[0], "url": r[1], "events": list(r[2]), "created_at": r[3].isoformat(),
         "disabled": r[4] is not None, "delivered": r[5], "failing": r[6]} for r in rows]}


@dash_router.post("/webhooks", status_code=201)
def create_my_webhook(body: dict[str, Any], request: Request) -> dict[str, Any]:
    acc = require_session(request)
    url = body.get("url", "")
    if not isinstance(url, str) or not url.startswith("https://") or len(url) > 2048:
        raise api_error(400, "invalid_request", "Webhook url must be https.", "url")
    if not _host_is_public(url):
        raise api_error(400, "invalid_request", "Webhook url must resolve to a public address.", "url")
    events = body.get("events", ["job.finished", "job.failed"])
    if not isinstance(events, list) or not events or not set(events) <= ALLOWED_EVENTS:
        raise api_error(400, "invalid_request", f"events must be a subset of {sorted(ALLOWED_EVENTS)}.", "events")
    import hashlib
    import secrets as pysecrets
    with pool().connection() as conn:
        plan = conn.execute("SELECT plan FROM accounts WHERE id = %s", (acc,)).fetchone()[0]
        cap = plan_limits(plan)["webhook_endpoints"]
        n = conn.execute("SELECT count(*) FROM webhooks WHERE account_id = %s AND disabled_at IS NULL",
                         (acc,)).fetchone()[0]
        if n >= cap:
            raise api_error(409, "webhook_limit", f"This plan allows {cap} webhook endpoints.")
        wh_id = new_id("wh")
        secret = "whsec_" + pysecrets.token_urlsafe(24)
        conn.execute(
            "INSERT INTO webhooks (id, account_id, url, secret, secret_hash, events) VALUES (%s,%s,%s,%s,%s,%s)",
            (wh_id, acc, url, secret, hashlib.sha256(secret.encode()).hexdigest(), events))
        audit(acc, "user", "webhook.created", wh_id, {"via": "dashboard"})
    return {"id": wh_id, "url": url, "events": events, "secret": secret,
            "note": "Save this signing secret now. It is never shown again."}


@dash_router.delete("/webhooks/{wh_id}")
def delete_my_webhook(wh_id: str, request: Request) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        row = conn.execute(
            "UPDATE webhooks SET disabled_at = now() WHERE id = %s AND account_id = %s RETURNING id",
            (wh_id, acc)).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such webhook on this account.", "id")
        audit(acc, "user", "webhook.deleted", wh_id, {"via": "dashboard"})
    return {"id": wh_id, "deleted": True}


@dash_router.get("/webhooks/{wh_id}/deliveries")
def webhook_deliveries(wh_id: str, request: Request, limit: int = 25) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        own = conn.execute("SELECT 1 FROM webhooks WHERE id = %s AND account_id = %s", (wh_id, acc)).fetchone()
        if not own:
            raise api_error(404, "not_found", "No such webhook on this account.", "id")
        rows = conn.execute(
            """SELECT id, event, job_id, attempt, status_code, delivered_at, next_retry_at
               FROM webhook_deliveries WHERE webhook_id = %s ORDER BY id DESC LIMIT %s""",
            (wh_id, max(1, min(100, limit)))).fetchall()
    return {"deliveries": [
        {"id": r[0], "event": r[1], "job_id": r[2], "attempt": r[3], "status_code": r[4],
         "delivered_at": r[5].isoformat() if r[5] else None,
         "next_retry_at": r[6].isoformat() if r[6] else None} for r in rows]}


@dash_router.post("/webhooks/{wh_id}/test")
def test_webhook(wh_id: str, request: Request) -> dict[str, Any]:
    """Queue a test event - the dispatcher signs and sends it within ~20 s."""
    acc = require_session(request)
    with pool().connection() as conn:
        own = conn.execute(
            "SELECT 1 FROM webhooks WHERE id = %s AND account_id = %s AND disabled_at IS NULL",
            (wh_id, acc)).fetchone()
        if not own:
            raise api_error(404, "not_found", "No such webhook on this account.", "id")
        import psycopg
        conn.execute(
            "INSERT INTO webhook_deliveries (webhook_id, event, job_id, payload) VALUES (%s,'job.finished',%s,%s)",
            (wh_id, "job_test", psycopg.types.json.Json({
                "job": {"id": "job_test", "tag": "webhook-test", "status": "finished",
                        "sandbox": True, "test": True}})))
        audit(acc, "user", "webhook.test_sent", wh_id)
    return {"queued": True, "note": "The dispatcher sends within about 20 seconds."}


# ---------------------------------------------------------------- feedback

@feedback_router.post("/feedback", status_code=201)
def docs_feedback(body: dict[str, Any], request: Request) -> dict[str, Any]:
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, f"feedback:{ip}", 5)
    page = body.get("page", "")
    helpful = body.get("helpful")
    comment = body.get("comment")
    if not isinstance(page, str) or not page.startswith("/") or len(page) > 200 or not isinstance(helpful, bool):
        raise api_error(400, "invalid_request", "Feedback needs {page: '/...', helpful: bool}.")
    if comment is not None and (not isinstance(comment, str) or len(comment) > 2000):
        raise api_error(400, "invalid_request", "comment must be a string up to 2000 chars.", "comment")
    with pool().connection() as conn:
        conn.execute("INSERT INTO docs_feedback (page, helpful, comment) VALUES (%s,%s,%s)",
                     (page, helpful, comment))
    return {"thanks": True}
