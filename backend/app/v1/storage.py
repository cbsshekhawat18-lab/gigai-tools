"""GigAI Developer API v1 - file storage.

Files live on local disk at $GIGAI_API_FILES_DIR/<file_id> (default
data/apifiles). An object-storage driver (S3 API) is planned, not built.

Signed download URLs: HMAC-SHA256(file_id + expiry) with the API secret.
Downloads always route through /v1/files/{id}/download, so the URL shape
stays stable for clients whatever the storage behind it.

The sweeper thread enforces retention: every 60 s it deletes due files,
verifies deletion, and writes an audit row. retention=0 files die on first
download or after 60 s, whichever comes first.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import threading
import time

from app.v1.core import JWT_SECRET, audit, pool

DATA_DIR = os.environ.get("GIGAI_API_FILES_DIR", "data/apifiles")
PUBLIC_BASE = os.environ.get("GIGAI_API_PUBLIC_BASE", "https://gigai.tools")


def _path(file_id: str) -> str:
    safe = file_id.replace("/", "")
    return os.path.join(DATA_DIR, safe)


def save(file_id: str, data: bytes) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(_path(file_id), "wb") as fh:
        fh.write(data)


def read(file_id: str) -> bytes | None:
    try:
        with open(_path(file_id), "rb") as fh:
            return fh.read()
    except FileNotFoundError:
        return None


def delete(file_id: str) -> bool:
    """Delete and VERIFY. True only when the bytes are provably gone."""
    try:
        os.unlink(_path(file_id))
    except FileNotFoundError:
        pass
    return not os.path.exists(_path(file_id))


def sign_download(file_id: str, expires_epoch: int) -> str:
    mac = hmac.new(JWT_SECRET.encode(), f"{file_id}.{expires_epoch}".encode(), hashlib.sha256).hexdigest()
    return f"{PUBLIC_BASE}/v1/files/{file_id}/download?e={expires_epoch}&s={mac}"


def check_signature(file_id: str, expires_epoch: int, sig: str) -> bool:
    if expires_epoch < time.time():
        return False
    good = hmac.new(JWT_SECRET.encode(), f"{file_id}.{expires_epoch}".encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(good, sig)


def _sweep_once() -> None:
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT id, account_id FROM files
               WHERE deleted_at IS NULL AND expires_at <= now()
               LIMIT 200"""
        ).fetchall()
        # Expired audits ride the same tick - shared reports live 30 days.
        conn.execute("DELETE FROM audits WHERE expires_at IS NOT NULL AND expires_at < now()")
        for fid, acc in rows:
            ok = delete(fid)
            conn.execute(
                "UPDATE files SET deleted_at = now(), delete_verified_at = CASE WHEN %s THEN now() END WHERE id = %s",
                (ok, fid),
            )
            audit(acc, "system", "file.deleted", fid, {"verified": ok})


def start_sweeper() -> None:
    def loop() -> None:
        while True:
            try:
                _sweep_once()
            except Exception:
                pass  # metadata-only territory; next tick retries
            time.sleep(60)

    threading.Thread(target=loop, daemon=True, name="file-sweeper").start()
