"""GigAI Developer API v1 - webhooks.

Endpoints are registered with a per-endpoint signing secret (shown once).
Deliveries carry `GigAI-Signature: t=<epoch>,v1=<hex>` where
v1 = HMAC-SHA256(secret, "<t>.<body>") - verify by recomputing, reject stale t.
The dispatcher thread retries failures on a backoff up to 5 times. Payloads
are job metadata only, never file contents.
"""

from __future__ import annotations

import hashlib
import hmac
import ipaddress
import json
import os
import secrets as pysecrets
import socket
import threading
import time
import urllib.parse
import urllib.request
from typing import Any

import psycopg
from fastapi import APIRouter, Request

from app.v1.core import api_error, audit, new_id, pool, require_api_key

webhooks_router = APIRouter()

RETRY_BACKOFF_S = [60, 300, 1800, 7200, 21600]
ALLOWED_EVENTS = {"job.finished", "job.failed"}

# SSRF fence: webhook posts originate beside Postgres, the API itself, and
# the cloud metadata endpoint. Every delivery target must resolve to public
# addresses only. The loopback escape hatch exists for on-box smoke tests
# and stays OFF in production (env unset).
_ALLOW_LOOPBACK = os.environ.get("GIGAI_ALLOW_LOOPBACK_WEBHOOKS") == "1"


def _host_is_public(url: str) -> bool:
    try:
        host = urllib.parse.urlsplit(url).hostname
        if not host:
            return False
        infos = socket.getaddrinfo(host, None)
        addrs = [ipaddress.ip_address(i[4][0]) for i in infos]
    except Exception:
        return False
    if not addrs:
        return False
    for addr in addrs:
        if addr.is_loopback and _ALLOW_LOOPBACK:
            continue
        if (addr.is_private or addr.is_loopback or addr.is_link_local
                or addr.is_multicast or addr.is_reserved or addr.is_unspecified):
            return False
    return True


@webhooks_router.get("/webhooks")
def list_webhooks(request: Request) -> dict[str, Any]:
    key = require_api_key(request, "webhooks:manage")
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT id, url, events, created_at, disabled_at FROM webhooks
               WHERE account_id = %s ORDER BY created_at""", (key["account_id"],)).fetchall()
    return {"webhooks": [
        {"id": r[0], "url": r[1], "events": list(r[2]), "created_at": r[3].isoformat(),
         "disabled": r[4] is not None} for r in rows]}


@webhooks_router.post("/webhooks", status_code=201)
def create_webhook(body: dict[str, Any], request: Request) -> dict[str, Any]:
    key = require_api_key(request, "webhooks:manage")
    url = body.get("url", "")
    # https everywhere; plain http only to loopback, and only while the
    # smoke-test escape hatch is on - never in production.
    local_dev = _ALLOW_LOOPBACK and url.startswith(("http://127.0.0.1", "http://localhost"))
    if not isinstance(url, str) or len(url) > 2048 or not (url.startswith("https://") or local_dev):
        raise api_error(400, "invalid_request", "Webhook url must be https.", "url")
    if not _host_is_public(url):
        raise api_error(400, "invalid_request",
                        "Webhook url must resolve to a public address.", "url")
    events = body.get("events", ["job.finished", "job.failed"])
    if not isinstance(events, list) or not events or not set(events) <= ALLOWED_EVENTS:
        raise api_error(400, "invalid_request", f"events must be a subset of {sorted(ALLOWED_EVENTS)}.", "events")
    with pool().connection() as conn:
        limit = conn.execute("SELECT webhook_endpoints FROM plan_limits WHERE plan = %s",
                             (key["plan"],)).fetchone()[0]
        n = conn.execute("SELECT count(*) FROM webhooks WHERE account_id = %s AND disabled_at IS NULL",
                         (key["account_id"],)).fetchone()[0]
        if n >= limit:
            raise api_error(409, "webhook_limit", f"This plan allows {limit} webhook endpoints.")
        wh_id = new_id("wh")
        secret = "whsec_" + pysecrets.token_urlsafe(24)
        conn.execute(
            """INSERT INTO webhooks (id, account_id, url, secret, secret_hash, events)
               VALUES (%s,%s,%s,%s,%s,%s)""",
            (wh_id, key["account_id"], url, secret,
             hashlib.sha256(secret.encode()).hexdigest(), events))
        audit(key["account_id"], f"key:{key['id']}", "webhook.created", wh_id, {"events": events})
    return {"id": wh_id, "url": url, "events": events, "secret": secret,
            "note": "Save this signing secret now. It is never shown again."}


@webhooks_router.delete("/webhooks/{wh_id}")
def delete_webhook(wh_id: str, request: Request) -> dict[str, Any]:
    key = require_api_key(request, "webhooks:manage")
    with pool().connection() as conn:
        row = conn.execute(
            "UPDATE webhooks SET disabled_at = now() WHERE id = %s AND account_id = %s RETURNING id",
            (wh_id, key["account_id"])).fetchone()
        if not row:
            raise api_error(404, "not_found", "No such webhook on this account.", "id")
        audit(key["account_id"], f"key:{key['id']}", "webhook.deleted", wh_id)
    return {"id": wh_id, "deleted": True}


def _sign(secret: str, t: int, body: bytes) -> str:
    mac = hmac.new(secret.encode(), f"{t}.".encode() + body, hashlib.sha256).hexdigest()
    return f"t={t},v1={mac}"


def _deliver_once() -> None:
    with pool().connection() as conn:
        rows = conn.execute(
            """SELECT d.id, d.event, d.payload, d.attempt, w.url, w.secret
               FROM webhook_deliveries d JOIN webhooks w ON w.id = d.webhook_id
               WHERE d.delivered_at IS NULL AND d.attempt < %s
                 AND (d.next_retry_at IS NULL OR d.next_retry_at <= now())
                 AND w.disabled_at IS NULL
               LIMIT 20""", (len(RETRY_BACKOFF_S),)).fetchall()
        for did, event, payload, attempt, url, secret in rows:
            # Re-check at send time: DNS may have changed since registration.
            if not _host_is_public(url):
                conn.execute(
                    "UPDATE webhook_deliveries SET attempt = %s, next_retry_at = now() + interval '6 hours' WHERE id = %s",
                    (attempt + 1, did))
                continue
            body = json.dumps({"event": event, **payload}).encode()
            t = int(time.time())
            req = urllib.request.Request(url, data=body, method="POST", headers={
                "Content-Type": "application/json",
                "User-Agent": "GigAI-Webhooks/1.0",
                "GigAI-Signature": _sign(secret or "", t, body),
            })
            code = 0
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    code = resp.status
            except urllib.error.HTTPError as exc:
                code = exc.code
            except Exception:
                code = 0
            if 200 <= code < 300:
                conn.execute(
                    "UPDATE webhook_deliveries SET attempt = %s, status_code = %s, delivered_at = now() WHERE id = %s",
                    (attempt + 1, code, did))
            else:
                delay = RETRY_BACKOFF_S[min(attempt, len(RETRY_BACKOFF_S) - 1)]
                conn.execute(
                    """UPDATE webhook_deliveries SET attempt = %s, status_code = %s,
                       next_retry_at = now() + %s * interval '1 second' WHERE id = %s""",
                    (attempt + 1, code or None, delay, did))


def start_dispatcher() -> None:
    def loop() -> None:
        while True:
            try:
                _deliver_once()
            except Exception:
                pass
            time.sleep(20)

    threading.Thread(target=loop, daemon=True, name="webhook-dispatcher").start()
