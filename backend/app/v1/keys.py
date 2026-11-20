"""GigAI Developer API v1 - API keys. Secrets are shown exactly once."""

from __future__ import annotations

import secrets

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.v1.core import api_error, audit, hash_token, new_id, pool, require_session

router = APIRouter(prefix="/keys", tags=["keys"])

ALL_SCOPES = ["tools:run", "jobs:read", "jobs:write", "webhooks:manage"]


class NewKey(BaseModel):
    name: str
    scopes: list[str] | None = None
    sandbox: bool = False
    ip_allowlist: list[str] | None = None


@router.get("")
def list_keys(request: Request):
    acc = require_session(request)
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT id, name, prefix, last4, scopes, sandbox, last_used_at, revoked_at, created_at
               FROM api_keys WHERE account_id = %s ORDER BY created_at DESC""",
            (acc,),
        ).fetchall()
    return {"data": [
        {"id": r[0], "name": r[1], "masked": f"{r[2]}…{r[3]}", "scopes": r[4], "sandbox": r[5],
         "last_used_at": r[6].isoformat() if r[6] else None,
         "revoked": r[7] is not None, "created_at": r[8].isoformat()}
        for r in rows
    ]}


@router.post("", status_code=201)
def create_key(body: NewKey, request: Request):
    acc = require_session(request)
    name = body.name.strip()[:80] or "Unnamed key"
    scopes = [s for s in (body.scopes or ALL_SCOPES) if s in ALL_SCOPES] or ALL_SCOPES
    prefix = "gk_test_" if body.sandbox else "gk_live_"
    secret = prefix + secrets.token_urlsafe(32)
    key_id = new_id("key")
    with pool().connection() as conn:
        n = conn.execute(
            "SELECT count(*) FROM api_keys WHERE account_id = %s AND revoked_at IS NULL", (acc,)
        ).fetchone()[0]
        if n >= 20:
            raise api_error(409, "too_many_keys", "You have 20 active keys - revoke one first.")
        conn.execute(
            """INSERT INTO api_keys (id, account_id, name, prefix, token_hash, last4, scopes, sandbox, ip_allowlist)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (key_id, acc, name, prefix, hash_token(secret), secret[-4:], scopes, body.sandbox,
             body.ip_allowlist),
        )
    audit(acc, "user", "key.created", key_id, {"name": name, "sandbox": body.sandbox})
    # The ONLY time the secret ever leaves the server.
    return {"id": key_id, "name": name, "secret": secret, "scopes": scopes, "sandbox": body.sandbox,
            "note": "Store this secret now - it is never shown again."}


@router.delete("/{key_id}", status_code=204)
def revoke_key(key_id: str, request: Request):
    acc = require_session(request)
    with pool().connection() as conn:
        row = conn.execute(
            "UPDATE api_keys SET revoked_at = now() WHERE id = %s AND account_id = %s AND revoked_at IS NULL RETURNING id",
            (key_id, acc),
        ).fetchone()
    if not row:
        raise api_error(404, "not_found", "No active key with that id.")
    audit(acc, "user", "key.revoked", key_id)
    return None
