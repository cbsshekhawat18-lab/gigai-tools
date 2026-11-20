"""GigAI Developer API v1 - files.

Downloads are HMAC-signed URLs (no Authorization header needed - curl and
browsers both work), which is also exactly the shape R2 presigned URLs take
later. retention=0 files die on first successful download.
"""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import Response

import app.v1.storage as storage
from app.v1.core import api_error, audit, pool, require_api_key

files_router = APIRouter()


@files_router.get("/files/{file_id}")
def file_meta(file_id: str, request: Request) -> dict[str, Any]:
    key = require_api_key(request, "jobs:read")
    with pool().connection() as conn:
        row = conn.execute(
            """SELECT filename, size, mime, expires_at, deleted_at, job_id FROM files
               WHERE id = %s AND account_id = %s""", (file_id, key["account_id"])).fetchone()
    if not row:
        raise api_error(404, "not_found", "No such file on this account.", "id")
    filename, size, mime, expires_at, deleted_at, job_id = row
    out: dict[str, Any] = {"id": file_id, "filename": filename, "size": size, "mime": mime,
                           "job_id": job_id, "expires_at": expires_at.isoformat(),
                           "deleted": deleted_at is not None}
    if deleted_at is None:
        out["url"] = storage.sign_download(file_id, min(int(time.time()) + 3600, int(expires_at.timestamp())))
    return out


@files_router.delete("/files/{file_id}", status_code=200)
def delete_file(file_id: str, request: Request) -> dict[str, Any]:
    """Immediate, verified deletion - does not wait for retention."""
    key = require_api_key(request, "jobs:write")
    with pool().connection() as conn:
        row = conn.execute(
            "SELECT deleted_at FROM files WHERE id = %s AND account_id = %s",
            (file_id, key["account_id"])).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such file on this account.", "id")
        ok = storage.delete(file_id)
        conn.execute(
            "UPDATE files SET deleted_at = COALESCE(deleted_at, now()), "
            "delete_verified_at = CASE WHEN %s THEN now() ELSE delete_verified_at END WHERE id = %s",
            (ok, file_id))
        audit(key["account_id"], f"key:{key['id']}", "file.deleted", file_id, {"verified": ok, "by": "request"})
    return {"id": file_id, "deleted": True, "verified": ok}


@files_router.get("/files/{file_id}/download")
def download(file_id: str, e: int, s: str) -> Response:
    """Signed download - the ONLY unauthenticated data path, gated by HMAC."""
    if not storage.check_signature(file_id, e, s):
        raise api_error(403, "bad_signature", "This download link is invalid or has expired.")
    with pool().connection() as conn:
        row = conn.execute(
            "SELECT filename, mime, deleted_at FROM files WHERE id = %s", (file_id,)).fetchone()
        if not row or row[2] is not None:
            raise api_error(404, "not_found", "This file has been deleted.")
        data = storage.read(file_id)
        if data is None:
            raise api_error(404, "not_found", "This file has been deleted.")
        # retention=0 contract: first successful download burns the file.
        conn.execute(
            """UPDATE files f SET downloaded_at = COALESCE(downloaded_at, now()),
                 expires_at = CASE WHEN j.retention_s = 0 THEN now() ELSE f.expires_at END
               FROM jobs j WHERE f.id = %s AND j.id = f.job_id""", (file_id,))
    filename = (row[0] or "download").replace('"', "")
    return Response(content=data, media_type=row[1] or "application/octet-stream",
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})
