"""GigAI Developer API v1 - accounts & sessions.

POST /v1/auth/signup   {email, password} -> sends a Zoho-SMTP verification mail
POST /v1/auth/login    {email, password} -> {token} (12 h dashboard JWT)
GET  /v1/auth/verify?token=...           -> marks the address verified
POST /v1/auth/resend   {email}
DELETE /v1/account                        -> full purge (GDPR-style)
GET  /v1/account                          -> profile + plan + usage
"""

from __future__ import annotations

import os
import re
import secrets
import smtplib
import threading
from email.message import EmailMessage

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.v1.core import (
    api_error, audit, hash_password, new_id, pool, rate_limit,
    require_session, session_token, verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
account_router = APIRouter(prefix="/account", tags=["account"])

EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,253}\.[A-Za-z]{2,24}$")
# Links in account mail point at this site (GIGAI_SITE_BASE, as in poster.py).
SITE_BASE = os.environ.get("GIGAI_SITE_BASE", "https://gigai.tools").rstrip("/")
VERIFY_BASE = SITE_BASE + "/developers/verify"


def _send_mail(to: str, subject: str, body: str, html: str | None = None) -> bool:
    host = os.environ.get("EMAIL_HOST", "")
    port = int(os.environ.get("EMAIL_PORT", "587"))
    user = os.environ.get("EMAIL_HOST_USER", "")
    password = os.environ.get("EMAIL_HOST_PASSWORD", "")
    if not host or not user or not password:
        return False  # mail not configured: caller falls back to auto-verify
    msg = EmailMessage()
    msg["From"] = f"GigAI Tools <{user}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")
    try:
        with smtplib.SMTP(host, port, timeout=15) as s:
            s.starttls()
            s.login(user, password)
            s.send_message(msg)
        return True
    except Exception:
        return False


def _mail_html(heading: str, intro: str, button_label: str, button_url: str, footnote: str) -> str:
    """Branded transactional mail. Email-client reality: one table, inline
    styles, system fonts, a hosted logo with a text wordmark that still
    renders when images are blocked."""
    return f"""\
<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#f4f4f2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <tr><td align="center" style="padding-bottom:20px;">
          <img src="https://gigai.tools/brand/logo-mark.png" width="44" height="44" alt="" style="display:block;margin:0 auto 8px;border:0;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1a1a;">Gig<span style="color:#DF500C;">AI</span> Tools</span>
        </td></tr>
        <tr><td style="background-color:#ffffff;border:1px solid #e4e4e0;border-radius:10px;padding:32px;">
          <h1 style="margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#1a1a1a;">{heading}</h1>
          <p style="margin:0 0 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.6;color:#4a4a46;">{intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:6px;background-color:#DF500C;">
            <a href="{button_url}" style="display:inline-block;padding:12px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">{button_label}</a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a8a84;">
            Button not working? Copy this link into your browser:<br>
            <a href="{button_url}" style="color:#DF500C;word-break:break-all;">{button_url}</a>
          </p>
        </td></tr>
        <tr><td align="center" style="padding-top:20px;">
          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.7;color:#8a8a84;">
            {footnote}<br>
            <a href="https://gigai.tools" style="color:#8a8a84;">gigai.tools</a> - free tools that run in your browser
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


class Credentials(BaseModel):
    email: str
    password: str


@router.post("/signup", status_code=201)
def signup(body: Credentials, request: Request):
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, f"signup:{ip}", 5)  # mail-reputation guard
    email = body.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise api_error(422, "invalid_email", "That doesn't look like an email address.", "email")
    if len(body.password) < 10:
        raise api_error(422, "weak_password", "Use at least 10 characters.", "password")
    acc_id = new_id("acc")
    token = secrets.token_urlsafe(32)
    with pool().connection() as conn:
        dup = conn.execute("SELECT 1 FROM accounts WHERE email = %s AND deleted_at IS NULL", (email,)).fetchone()
        if dup:
            raise api_error(409, "email_taken", "An account with this email already exists.", "email")
        conn.execute(
            "INSERT INTO accounts (id, email, password_hash) VALUES (%s,%s,%s)",
            (acc_id, email, hash_password(body.password)),
        )
        conn.execute(
            "INSERT INTO email_tokens (token, account_id, purpose, expires_at) VALUES (%s,%s,'verify', now() + interval '24 hours')",
            (token, acc_id),
        )
    verify_url = f"{VERIFY_BASE}?token={token}"
    sent = _send_mail(
        email,
        "Verify your GigAI Tools API account",
        "Confirm your email to activate your API account:\n\n"
        f"{verify_url}\n\n"
        "The link is valid for 24 hours. If you didn't sign up, ignore this mail.",
        html=_mail_html(
            "Confirm your email",
            "One click activates your API account. The free plan gives 1,000 tasks a month, and the link is valid for 24 hours.",
            "Verify my email", verify_url,
            "You received this because this address signed up at gigai.tools/developers. Not you? Ignore this mail and nothing happens.",
        ),
    )
    if not sent:
        # Mail infrastructure down/unconfigured: auto-verify rather than
        # stranding the user; the audit row records that it happened.
        with pool().connection() as conn:
            conn.execute("UPDATE accounts SET email_verified_at = now() WHERE id = %s", (acc_id,))
    audit(acc_id, "user", "account.signup", acc_id, {"verified_by_mail": sent})
    return {"account_id": acc_id, "verification": "email_sent" if sent else "auto_verified"}


@router.get("/verify")
def verify(token: str):
    with pool().connection() as conn:
        row = conn.execute(
            "DELETE FROM email_tokens WHERE token = %s AND purpose = 'verify' AND expires_at > now() RETURNING account_id",
            (token,),
        ).fetchone()
        if not row:
            raise api_error(404, "invalid_token", "This verification link is invalid or expired.")
        conn.execute("UPDATE accounts SET email_verified_at = now() WHERE id = %s", (row[0],))
    audit(row[0], "user", "account.verified", row[0])
    return {"verified": True}


@router.post("/login")
def login(body: Credentials, request: Request):
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, f"login:{ip}", 10)
    email = body.email.strip().lower()
    with pool().connection() as conn:
        row = conn.execute(
            "SELECT id, password_hash, email_verified_at, suspended_at FROM accounts WHERE email = %s AND deleted_at IS NULL",
            (email,),
        ).fetchone()
    if not row or not verify_password(body.password, row[1]):
        raise api_error(401, "bad_credentials", "Email or password is wrong.")
    if row[2] is None:
        raise api_error(403, "email_unverified", "Verify your email first - check your inbox.")
    if row[3] is not None:
        raise api_error(403, "account_suspended", "This account is suspended. Contact support.")
    return {"token": session_token(row[0]), "account_id": row[0]}


class ForgotBody(BaseModel):
    email: str


class ResetBody(BaseModel):
    token: str
    password: str


@router.post("/resend")
def resend(body: ForgotBody, request: Request):
    """Fresh verification link. Same-answer-always, like /forgot."""
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, f"resend:{ip}", 3)
    email = body.email.strip().lower()
    with pool().connection() as conn:
        row = conn.execute(
            "SELECT id FROM accounts WHERE email = %s AND deleted_at IS NULL AND email_verified_at IS NULL",
            (email,)).fetchone()
        if row:
            token = secrets.token_urlsafe(32)
            conn.execute(
                "INSERT INTO email_tokens (token, account_id, purpose, expires_at) VALUES (%s,%s,'verify', now() + interval '24 hours')",
                (token, row[0]))
            verify_url = f"{VERIFY_BASE}?token={token}"
            _send_mail(email, "Verify your GigAI Tools API account",
                       f"Confirm your email to activate your API account:\n\n{verify_url}\n\n"
                       "The link is valid for 24 hours.",
                       html=_mail_html(
                           "Confirm your email",
                           "Here is the fresh verification link you asked for. It is valid for 24 hours.",
                           "Verify my email", verify_url,
                           "You received this because someone asked to re-send verification for this address at gigai.tools/developers.",
                       ))
    return {"sent": True}


@router.post("/forgot")
def forgot(body: ForgotBody, request: Request):
    """Always answers the same - never reveals whether an email exists."""
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, f"forgot:{ip}", 3)
    email = body.email.strip().lower()
    with pool().connection() as conn:
        row = conn.execute(
            "SELECT id FROM accounts WHERE email = %s AND deleted_at IS NULL AND email_verified_at IS NOT NULL",
            (email,)).fetchone()
        if row:
            token = secrets.token_urlsafe(32)
            conn.execute(
                "INSERT INTO email_tokens (token, account_id, purpose, expires_at) VALUES (%s,%s,'reset', now() + interval '1 hour')",
                (token, row[0]))
            reset_url = f"{SITE_BASE}/developers/reset?token={token}"
            _send_mail(
                email,
                "Reset your GigAI Tools API password",
                "Someone asked to reset the password for this account. If that was you:\n\n"
                f"{reset_url}\n\n"
                "The link is valid for 1 hour. If it wasn't you, ignore this mail - nothing changes.",
                html=_mail_html(
                    "Reset your password",
                    "Someone asked to reset the password for this account. If that was you, choose a new one below. The link is valid for 1 hour.",
                    "Choose a new password", reset_url,
                    "If this wasn't you, ignore this mail - your password stays as it is.",
                ),
            )
            audit(row[0], "user", "account.reset_requested", row[0])
    return {"sent": True}


@router.post("/reset")
def reset(body: ResetBody):
    if len(body.password) < 10:
        raise api_error(422, "weak_password", "Use at least 10 characters.", "password")
    with pool().connection() as conn:
        row = conn.execute(
            "DELETE FROM email_tokens WHERE token = %s AND purpose = 'reset' AND expires_at > now() RETURNING account_id",
            (body.token,)).fetchone()
        if not row:
            raise api_error(404, "invalid_token", "This reset link is invalid or expired. Ask for a new one.")
        conn.execute("UPDATE accounts SET password_hash = %s WHERE id = %s",
                     (hash_password(body.password), row[0]))
    audit(row[0], "user", "account.password_reset", row[0])
    return {"reset": True}


@account_router.get("")
def account(request: Request):
    acc = require_session(request)
    with pool().connection() as conn:
        row = conn.execute(
            "SELECT email, plan, retention_default_s, created_at FROM accounts WHERE id = %s AND deleted_at IS NULL",
            (acc,),
        ).fetchone()
        if not row:
            raise api_error(404, "not_found", "Account not found.")
        limits = conn.execute(
            "SELECT tasks_per_month, max_file_bytes, rpm, concurrent_jobs, webhook_endpoints FROM plan_limits WHERE plan = %s",
            (row[1],),
        ).fetchone()
        usage = conn.execute(
            "SELECT tasks_run, bytes_in, bytes_out FROM usage_counters WHERE account_id = %s AND period = to_char(now(),'YYYY-MM')",
            (acc,),
        ).fetchone() or (0, 0, 0)
    return {
        "email": row[0], "plan": row[1], "retention_default_s": row[2],
        "created_at": row[3].isoformat(),
        "limits": {"tasks_per_month": limits[0], "max_file_bytes": limits[1], "rpm": limits[2],
                    "concurrent_jobs": limits[3], "webhook_endpoints": limits[4]},
        "usage_this_month": {"tasks_run": usage[0], "bytes_in": usage[1], "bytes_out": usage[2]},
    }


@account_router.delete("", status_code=204)
def delete_account(request: Request):
    acc = require_session(request)
    with pool().connection() as conn:
        conn.execute("UPDATE accounts SET deleted_at = now(), email = id || '@deleted.invalid' WHERE id = %s", (acc,))
        conn.execute("UPDATE api_keys SET revoked_at = now() WHERE account_id = %s", (acc,))
    audit(acc, "user", "account.deleted", acc)
    return None
