"""GigAI Developer API v1 - jobs and tasks.

A job is a small graph of named tasks. The API validates the graph, stores it,
and handles import/base64 inline; the Node worker claims everything else
(import/url, engine runs, export/url) from the tasks table via SKIP LOCKED.

Quota rules: engine tasks count against tasks_per_month; sandbox keys
(gk_test_) never count and get tighter file/retention caps. Metadata only in
this module - file BYTES pass through import decode straight to storage and
are never logged.
"""

from __future__ import annotations

import base64
import time
from typing import Any

import psycopg
from fastapi import APIRouter, Request, Response

import app.v1.storage as storage
from app.v1.core import api_error, audit, new_id, plan_limits, pool, require_api_key
from app.v1.tools import ENGINES

jobs_router = APIRouter()

IMPORT_OPS = {"import/url", "import/base64"}
EXPORT_OPS = {"export/url"}
MAX_TASKS = 20
SANDBOX_MAX_BYTES = 10 * 1024 * 1024
SANDBOX_MAX_RETENTION_S = 900
IMPORT_URL_MAX = 2048
# Inline uploads are decoded in the gateway process on a small box; bigger
# files go through import/url, which the worker streams one at a time.
# nginx caps the request body at 32 MB anyway - this check just answers in
# our error shape with advice instead of a bare 413.
B64_INLINE_MAX = 24 * 1024 * 1024


def _check_options(schema: dict[str, Any], opts: dict[str, Any], task: str) -> None:
    """Tiny JSON-Schema subset validator - enough for our flat option objects.

    Supports: type, properties, additionalProperties, enum, minimum, maximum,
    required. Deliberately not a full validator; the schemas in engines.json
    stay inside this subset by construction.
    """
    props = schema.get("properties", {})
    if schema.get("additionalProperties") is False:
        for k in opts:
            if k not in props:
                raise api_error(400, "invalid_option", f"Task '{task}': unknown option '{k}'.", k)
    types = {"string": str, "boolean": bool, "integer": int, "number": (int, float), "object": dict, "array": list}
    for k, sub in props.items():
        if k not in opts:
            if k in schema.get("required", []):
                raise api_error(400, "invalid_option", f"Task '{task}': option '{k}' is required.", k)
            continue
        v = opts[k]
        want = sub.get("type")
        if want and not isinstance(v, types[want]):
            raise api_error(400, "invalid_option", f"Task '{task}': option '{k}' must be a {want}.", k)
        if want == "integer" and isinstance(v, bool):
            raise api_error(400, "invalid_option", f"Task '{task}': option '{k}' must be an integer.", k)
        if "enum" in sub and v not in sub["enum"]:
            raise api_error(400, "invalid_option",
                            f"Task '{task}': option '{k}' must be one of {sub['enum']}.", k)
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            if "minimum" in sub and v < sub["minimum"]:
                raise api_error(400, "invalid_option", f"Task '{task}': '{k}' is below {sub['minimum']}.", k)
            if "maximum" in sub and v > sub["maximum"]:
                raise api_error(400, "invalid_option", f"Task '{task}': '{k}' is above {sub['maximum']}.", k)


def _validate_graph(tasks: dict[str, Any]) -> None:
    if not isinstance(tasks, dict) or not tasks:
        raise api_error(400, "invalid_request", "Provide a 'tasks' object with at least one named task.", "tasks")
    if len(tasks) > MAX_TASKS:
        raise api_error(400, "invalid_request", f"A job can hold at most {MAX_TASKS} tasks.", "tasks")
    for name, spec in tasks.items():
        if not isinstance(spec, dict) or "operation" not in spec:
            raise api_error(400, "invalid_request", f"Task '{name}' needs an 'operation'.", name)
        op = spec["operation"]
        inputs = spec.get("input", [])
        inputs = [inputs] if isinstance(inputs, str) else inputs
        if op in IMPORT_OPS:
            if inputs:
                raise api_error(400, "invalid_request", f"Import task '{name}' cannot have inputs.", name)
            if op == "import/url":
                url = spec.get("url", "")
                if not isinstance(url, str) or not url.startswith(("http://", "https://")) or len(url) > IMPORT_URL_MAX:
                    raise api_error(400, "invalid_request", f"Task '{name}': 'url' must be an http(s) URL.", "url")
            else:
                if not isinstance(spec.get("file"), str) or not spec.get("filename"):
                    raise api_error(400, "invalid_request",
                                    f"Task '{name}': import/base64 needs 'file' (base64) and 'filename'.", name)
        elif op in EXPORT_OPS or op in ENGINES:
            if op in ENGINES and ENGINES[op].get("no_input"):
                if inputs:
                    raise api_error(400, "invalid_request",
                                    f"Task '{name}': '{op}' takes no input files.", name)
                opts = {k: v for k, v in spec.items() if k not in ("operation", "input")}
                _check_options(ENGINES[op]["options_schema"], opts, name)
                continue
            if not inputs:
                raise api_error(400, "invalid_request", f"Task '{name}' needs 'input' naming earlier tasks.", name)
            for ref in inputs:
                if ref not in tasks:
                    raise api_error(400, "invalid_request", f"Task '{name}' references unknown task '{ref}'.", name)
                if ref == name:
                    raise api_error(400, "invalid_request", f"Task '{name}' cannot input itself.", name)
            if op in ENGINES:
                eng = ENGINES[op]
                if len(inputs) > 1 and not eng.get("multi_input"):
                    raise api_error(400, "invalid_request", f"'{op}' takes a single input.", name)
                opts = {k: v for k, v in spec.items() if k not in ("operation", "input")}
                _check_options(eng["options_schema"], opts, name)
        else:
            raise api_error(400, "invalid_request",
                            f"Task '{name}': unknown operation '{op}'. GET /v1/tools lists engines.", name)
    # Cycle check: repeatedly peel tasks whose inputs are all peeled.
    resolved: set[str] = set()
    pending = dict(tasks)
    while pending:
        progress = [n for n, s in pending.items()
                    if all(r in resolved for r in
                           ([s.get("input")] if isinstance(s.get("input"), str) else s.get("input", [])))]
        if not progress:
            raise api_error(400, "invalid_request", "The task graph contains a cycle.", "tasks")
        for n in progress:
            resolved.add(n)
            del pending[n]


def _job_json(conn: Any, job_id: str) -> dict[str, Any]:
    j = conn.execute(
        """SELECT id, tag, status, retention_s, sandbox, created_at, finished_at
           FROM jobs WHERE id = %s""", (job_id,)).fetchone()
    trows = conn.execute(
        """SELECT id, name, operation, options, input_names, status,
                  error_code, error_message, duration_ms
           FROM tasks WHERE job_id = %s ORDER BY id""", (job_id,)).fetchall()
    by_name = {t[1]: t[0] for t in trows}
    tasks = []
    for tid, name, op, options, input_names, status, ecode, emsg, dur in trows:
        t: dict[str, Any] = {"id": tid, "name": name, "operation": op, "status": status}
        if input_names:
            t["input"] = list(input_names)
        if dur is not None:
            t["duration_ms"] = dur
        if ecode:
            t["error"] = {"code": ecode, "message": emsg}
        if op in EXPORT_OPS and status == "finished":
            src_ids = [by_name[n] for n in input_names if n in by_name]
            frows = conn.execute(
                """SELECT id, filename, size, expires_at FROM files
                   WHERE task_id = ANY(%s) AND deleted_at IS NULL""", (src_ids,)).fetchall()
            t["result"] = {"files": [
                {"id": fid, "filename": fn, "size": sz,
                 "url": storage.sign_download(fid, min(int(time.time()) + 3600, int(exp.timestamp())))}
                for fid, fn, sz, exp in frows]}
        tasks.append(t)
    return {"id": j[0], "tag": j[1], "status": j[2], "retention_s": j[3], "sandbox": j[4],
            "created_at": j[5].isoformat(), "finished_at": j[6].isoformat() if j[6] else None,
            "tasks": tasks}


@jobs_router.post("/jobs", status_code=201)
def create_job(body: dict[str, Any], request: Request, response: Response) -> dict[str, Any]:
    key = require_api_key(request, "jobs:write")
    # Files live on the box's own disk (no R2 yet). Refuse new work before
    # low disk can hurt the rest of the server - retention frees space soon.
    import shutil
    if shutil.disk_usage("/").free < 400 * 1024 * 1024:
        raise api_error(503, "storage_full",
                        "Server storage is momentarily full. Files self-delete on their "
                        "retention schedule - retry in a few minutes.")
    limits = key["limits"]  # plan defaults merged with per-account overrides
    tasks_pm, max_bytes, max_conc = (
        limits["tasks_per_month"], limits["max_file_bytes"], limits["concurrent_jobs"])
    for h, v in getattr(request.state, "rate_headers", {}).items():
        response.headers[h] = v
    if key["sandbox"]:
        max_bytes = min(max_bytes, SANDBOX_MAX_BYTES)

    tasks_spec = body.get("tasks")
    _validate_graph(tasks_spec)
    engine_count = sum(1 for s in tasks_spec.values() if s["operation"] in ENGINES)
    retention = body.get("retention_s", 3600)
    if not isinstance(retention, int) or not (0 <= retention <= 86400):
        raise api_error(400, "invalid_request", "retention_s must be 0..86400 seconds.", "retention_s")
    if key["sandbox"]:
        retention = min(retention, SANDBOX_MAX_RETENTION_S)
    tag = body.get("tag")
    if tag is not None and (not isinstance(tag, str) or len(tag) > 128):
        raise api_error(400, "invalid_request", "tag must be a string up to 128 chars.", "tag")
    idem = request.headers.get("idempotency-key")
    if idem and len(idem) > 200:
        raise api_error(400, "invalid_request", "Idempotency-Key is too long (200 max).")

    period = time.strftime("%Y-%m")
    try:
        return _create_job_tx(key, tasks_spec, engine_count, retention, tag, idem,
                              period, max_bytes, max_conc, tasks_pm, response)
    except psycopg.errors.UniqueViolation:
        # Idempotency race: a concurrent request with the same key won. Serve
        # the job it made (a fresh connection - ours just rolled back).
        with pool().connection() as conn:
            row = conn.execute(
                "SELECT id FROM jobs WHERE account_id = %s AND idempotency_key = %s",
                (key["account_id"], idem)).fetchone()
            if not row:
                raise
            response.status_code = 200
            return _job_json(conn, row[0])


def _create_job_tx(key: dict[str, Any], tasks_spec: dict[str, Any], engine_count: int,
                   retention: int, tag: str | None, idem: str | None, period: str,
                   max_bytes: int, max_conc: int, tasks_pm: int, response: Response) -> dict[str, Any]:
    with pool().connection() as conn, conn.transaction():
        # Idempotency: same key -> return the job already made, don't redo work.
        if idem:
            row = conn.execute(
                "SELECT id FROM jobs WHERE account_id = %s AND idempotency_key = %s",
                (key["account_id"], idem)).fetchone()
            if row:
                response.status_code = 200
                return _job_json(conn, row[0])
        conc = conn.execute(
            "SELECT count(*) FROM jobs WHERE account_id = %s AND status IN ('waiting','processing')",
            (key["account_id"],)).fetchone()[0]
        if conc >= max_conc:
            raise api_error(409, "concurrent_limit",
                            f"You already have {conc} jobs running. Wait for one to finish (limit {max_conc}).")
        if not key["sandbox"] and engine_count:
            used = conn.execute(
                "SELECT tasks_run FROM usage_counters WHERE account_id = %s AND period = %s",
                (key["account_id"], period)).fetchone()
            if (used[0] if used else 0) + engine_count > tasks_pm:
                raise api_error(429, "quota_exceeded",
                                f"This job needs {engine_count} tasks but the monthly free quota is {tasks_pm}.")

        job_id = new_id("job")
        conn.execute(
            """INSERT INTO jobs (id, account_id, tag, retention_s, idempotency_key, sandbox)
               VALUES (%s,%s,%s,%s,%s,%s)""",
            (job_id, key["account_id"], tag, retention, idem, key["sandbox"]))

        for name, spec in tasks_spec.items():
            inputs = spec.get("input", [])
            inputs = [inputs] if isinstance(inputs, str) else list(inputs)
            op = spec["operation"]
            options = {k: v for k, v in spec.items() if k not in ("operation", "input", "file")}
            task_id = new_id("task")
            if op == "import/base64":
                try:
                    # Tolerate wrapped/whitespaced base64 - every mail and
                    # openssl pipeline emits it with line breaks.
                    data = base64.b64decode("".join(spec["file"].split()), validate=True)
                except Exception:
                    raise api_error(400, "invalid_request", f"Task '{name}': 'file' is not valid base64.", name) from None
                if len(data) > min(max_bytes, B64_INLINE_MAX):
                    raise api_error(413, "file_too_large",
                                    f"Task '{name}': {len(data)} bytes exceeds the inline import limit "
                                    f"({min(max_bytes, B64_INLINE_MAX)} bytes). Use import/url for larger files.", name)
                # Bytes to disk first, then task row, then the file row that
                # references it (FK order). A rollback can only orphan disk
                # bytes, never leave a row pointing at nothing.
                file_id = new_id("file")
                storage.save(file_id, data)
                conn.execute(
                    """INSERT INTO tasks (id, job_id, name, operation, options, input_names, status, finished_at)
                       VALUES (%s,%s,%s,%s,'{}','{}','finished', now())""",
                    (task_id, job_id, name, op))
                conn.execute(
                    """INSERT INTO files (id, account_id, task_id, job_id, r2_key, filename, size, kind, expires_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,'import', now() + interval '24 hours')""",
                    (file_id, key["account_id"], task_id, job_id, file_id, spec["filename"][:255], len(data)))
            else:
                conn.execute(
                    """INSERT INTO tasks (id, job_id, name, operation, options, input_names)
                       VALUES (%s,%s,%s,%s,%s,%s)""",
                    (task_id, job_id, name, op, psycopg.types.json.Json(options), inputs))

        if not key["sandbox"] and engine_count:
            conn.execute(
                """INSERT INTO usage_counters (account_id, period, tasks_run) VALUES (%s,%s,%s)
                   ON CONFLICT (account_id, period) DO UPDATE
                   SET tasks_run = usage_counters.tasks_run + EXCLUDED.tasks_run""",
                (key["account_id"], period, engine_count))
        audit(key["account_id"], f"key:{key['id']}", "job.created", job_id,
              {"tasks": engine_count, "sandbox": key["sandbox"]})
        return _job_json(conn, job_id)


def _owned_job(conn: Any, job_id: str, account_id: str) -> None:
    row = conn.execute("SELECT 1 FROM jobs WHERE id = %s AND account_id = %s",
                       (job_id, account_id)).fetchone()
    if not row:
        raise api_error(404, "not_found", "No such job on this account.", "id")


@jobs_router.get("/jobs/{job_id}")
def get_job(job_id: str, request: Request) -> dict[str, Any]:
    key = require_api_key(request, "jobs:read")
    with pool().connection() as conn:
        _owned_job(conn, job_id, key["account_id"])
        return _job_json(conn, job_id)


@jobs_router.get("/jobs/{job_id}/wait")
def wait_job(job_id: str, request: Request) -> dict[str, Any]:
    """Long poll: returns as soon as the job reaches a final state, or ~55 s."""
    key = require_api_key(request, "jobs:read")
    deadline = time.time() + 55
    while True:
        with pool().connection() as conn:
            _owned_job(conn, job_id, key["account_id"])
            status = conn.execute("SELECT status FROM jobs WHERE id = %s", (job_id,)).fetchone()[0]
            if status in ("finished", "error", "cancelled") or time.time() > deadline:
                return _job_json(conn, job_id)
        time.sleep(1.5)


@jobs_router.get("/jobs")
def list_jobs(request: Request, status: str | None = None, limit: int = 20) -> dict[str, Any]:
    key = require_api_key(request, "jobs:read")
    limit = max(1, min(50, limit))
    with pool().connection() as conn:
        if status:
            rows = conn.execute(
                """SELECT id FROM jobs WHERE account_id = %s AND status = %s
                   ORDER BY created_at DESC LIMIT %s""", (key["account_id"], status, limit)).fetchall()
        else:
            rows = conn.execute(
                """SELECT id FROM jobs WHERE account_id = %s
                   ORDER BY created_at DESC LIMIT %s""", (key["account_id"], limit)).fetchall()
        return {"jobs": [_job_json(conn, r[0]) for r in rows]}


@jobs_router.delete("/jobs/{job_id}")
def cancel_job(job_id: str, request: Request) -> dict[str, Any]:
    """Cancel outstanding work and purge the job's files immediately."""
    key = require_api_key(request, "jobs:write")
    with pool().connection() as conn:
        _owned_job(conn, job_id, key["account_id"])
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
        audit(key["account_id"], f"key:{key['id']}", "job.cancelled", job_id, {"files_purged": len(files)})
        return _job_json(conn, job_id)


@jobs_router.get("/tasks/{task_id}")
def get_task(task_id: str, request: Request) -> dict[str, Any]:
    key = require_api_key(request, "jobs:read")
    with pool().connection() as conn:
        row = conn.execute(
            """SELECT t.job_id FROM tasks t JOIN jobs j ON j.id = t.job_id
               WHERE t.id = %s AND j.account_id = %s""", (task_id, key["account_id"])).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such task on this account.", "id")
        job = _job_json(conn, row[0])
        return next(t for t in job["tasks"] if t["id"] == task_id)
