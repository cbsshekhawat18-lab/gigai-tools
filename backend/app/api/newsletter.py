"""Newsletter signup endpoints - a consent-first, self-owned mailing list.

POST /newsletter/subscribe    {email, source?, website?}  -> {ok}
POST /newsletter/unsubscribe  {email}                     -> {ok}
GET  /newsletter/status       -> {enabled}

Design decisions, in the open:
 - The list is stored on OUR server only (append-only JSONL, owner-read),
   never a third party, and the privacy policy discloses it. This is a
   subscription list the visitor asked to join - the ephemeral-processing
   rule for uploaded files does not apply, disclosure does.
 - `website` is a honeypot: humans never see the field, bots fill it.
 - No confirmation email is sent yet because no sending infrastructure
   exists. Before the FIRST newsletter ever goes out, the sender must run
   a confirmed double opt-in pass over pending addresses. Do not skip that.
 - Rate limit per IP so the endpoint can't be used to bloat the disk.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

DATA_DIR = os.environ.get("GIGAI_NEWSLETTER_DIR", "data")
LIST_PATH = os.path.join(DATA_DIR, "newsletter.jsonl")
EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,253}\.[A-Za-z]{2,24}$")
MAX_PER_IP_PER_HOUR = 5

_lock = threading.Lock()
_ip_hits: dict[str, list[float]] = {}


class SubscribeBody(BaseModel):
    email: str
    source: str = ""
    website: str = ""  # honeypot - must stay empty


class UnsubscribeBody(BaseModel):
    email: str


def _rate_limited(ip: str) -> bool:
    now = time.time()
    with _lock:
        hits = [t for t in _ip_hits.get(ip, []) if now - t < 3600]
        if len(hits) >= MAX_PER_IP_PER_HOUR:
            _ip_hits[ip] = hits
            return True
        hits.append(now)
        _ip_hits[ip] = hits
        return False


def _append(record: dict) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with _lock:
        with open(LIST_PATH, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    try:
        os.chmod(LIST_PATH, 0o600)
    except OSError:
        pass


def _already_subscribed(email: str) -> bool:
    try:
        state = False
        with open(LIST_PATH, encoding="utf-8") as fh:
            for line in fh:
                try:
                    rec = json.loads(line)
                except ValueError:
                    continue
                if rec.get("email") == email:
                    state = rec.get("action") != "unsubscribe"
        return state
    except FileNotFoundError:
        return False


@router.get("/status")
async def status() -> dict[str, bool]:
    return {"enabled": True}


@router.post("/subscribe")
async def subscribe(body: SubscribeBody, request: Request) -> dict[str, bool]:
    if body.website.strip():
        # Honeypot tripped: answer success so the bot learns nothing.
        return {"ok": True}
    email = body.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(400, "That doesn't look like an email address.")
    ip = request.client.host if request.client else "unknown"
    if _rate_limited(ip):
        raise HTTPException(429, "Too many signups from this connection. Try again later.")
    if not _already_subscribed(email):
        _append(
            {
                "email": email,
                "source": body.source.strip()[:80],
                "ts": int(time.time()),
                "action": "subscribe",
                "status": "pending",  # double opt-in happens before any send
            }
        )
    return {"ok": True}


@router.post("/unsubscribe")
async def unsubscribe(body: UnsubscribeBody) -> dict[str, bool]:
    email = body.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(400, "That doesn't look like an email address.")
    if _already_subscribed(email):
        _append({"email": email, "ts": int(time.time()), "action": "unsubscribe"})
    return {"ok": True}
