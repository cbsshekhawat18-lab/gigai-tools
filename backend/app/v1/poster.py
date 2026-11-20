"""GigAI Tools - Supporter Poster Pages (Phase 1).

An account owner publishes a page at {SITE}/p/{slug}: header details, up to
MAX_BANNERS finished banner designs (their designer's artwork, uploaded as
images) and, per banner, where the SUPPORTER's photo and name go. Visitors
render their own poster entirely in the browser - the supporter's photo,
name and area never reach this server; only counters do (/events).

Storage is the box disk (GIGAI_POSTER_DIR), guarded twice: the same 400 MB
free-disk floor the jobs API uses, plus a budget for this feature alone
(GIGAI_POSTER_MAX_TOTAL_MB) so posters can never crowd out the rest of the
server. Banner ids are unguessable and immutable per upload, so image
responses cache for a year; draft pages are unlisted, not secret.

Routing: nginx maps /p/{slug} -> /v1/poster/html/{slug}, which returns the
static Next shell (TOOLS_ROOT/p.html) with this page's title/OG tags
injected. The shell then loads /v1/poster/pages/{slug} client-side.
"""

from __future__ import annotations

import hashlib
import html as html_mod
import io
import os
import re
import shutil
import threading
from typing import Any

from fastapi import APIRouter, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from PIL import Image, ImageOps
from psycopg.types.json import Json

from app.v1.admin import is_admin_account
from app.v1.core import api_error, audit, new_id, pool, rate_limit, require_session

poster_router = APIRouter(prefix="/poster", tags=["poster"])

POSTER_DIR = os.environ.get("GIGAI_POSTER_DIR", "data/poster")
# The static site export (Next.js out/), where the poster HTML shell lives.
TOOLS_ROOT = os.environ.get("GIGAI_TOOLS_ROOT", "../out")
SITE_BASE = os.environ.get("GIGAI_SITE_BASE", "https://gigai.tools").rstrip("/")
MAX_PAGES = int(os.environ.get("GIGAI_POSTER_MAX_PAGES", "3"))
MAX_TOTAL_BYTES = int(os.environ.get("GIGAI_POSTER_MAX_TOTAL_MB", "400")) * 1024 * 1024
MAX_BANNERS = 4
REDIRECT_DAYS = 30
MAX_BANNER_UPLOAD = 8 * 1024 * 1024
MAX_LOGO_UPLOAD = 2 * 1024 * 1024
MIN_FREE_DISK = 400 * 1024 * 1024
HD_BOX, PREVIEW_BOX, LOGO_BOX = (2160, 2700), (1080, 1350), (512, 512)

SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$")
RESERVED = {"api", "v1", "admin", "create", "dashboard", "developers", "p", "www", "tools",
            "static", "_next", "og", "assets", "login", "signup", "me", "new", "edit"}
STATUSES = {"draft", "live", "paused"}
EVENT_TYPES = ("visit", "download", "share", "copy")
LANGS = {"hi", "en"}
COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
TEXT_LIMITS = {"display_name": 60, "designation": 80, "area": 80, "tagline": 160, "org_name": 100}
DEFAULT_LIMITS = {"supporter_label": 40, "supporter_area": 80, "announcement": 200, "whatsapp_text": 300}

PAGE_COLS = ("id", "account_id", "slug", "display_name", "designation", "area", "tagline", "org_name",
             "theme", "defaults", "lang", "logo_bytes", "status", "created_at", "updated_at")
BANNER_COLS = ("id", "sort_order", "width", "height", "zones", "bytes_total")

Image.MAX_IMAGE_PIXELS = 40_000_000
_decode_lock = threading.Semaphore(1)  # one decode at a time: this box has ~900 MB total


# --------------------------------------------------------------------------- validation

def _text(value: Any, limit: int) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()[:limit]


def _slug(value: Any) -> str:
    slug = str(value or "").strip().lower()
    if not SLUG_RE.match(slug):
        raise api_error(400, "invalid_slug",
                        "Use 3-40 lowercase letters, digits or hyphens (no leading/trailing hyphen).", "slug")
    if slug in RESERVED:
        raise api_error(400, "invalid_slug", "That address is reserved. Pick another.", "slug")
    return slug


def _num(value: Any, lo: float, hi: float, name: str) -> float:
    try:
        f = float(value)
    except (TypeError, ValueError):
        raise api_error(400, "invalid_request", f"{name} must be a number.", name) from None
    if not (lo <= f <= hi):
        raise api_error(400, "invalid_request", f"{name} must be between {lo} and {hi}.", name)
    return round(f, 4)


def _validate_zones(z: Any) -> dict[str, Any]:
    """Zones are fractions of the banner (x/w/r/size by width, y/h by height)."""
    if not isinstance(z, dict):
        raise api_error(400, "invalid_request", "zones must be an object.", "zones")
    photos_in = z.get("photos", [])
    if not isinstance(photos_in, list) or len(photos_in) > 3:
        raise api_error(400, "invalid_request", "photos must be a list of at most 3 slots.", "zones")
    photos = []
    for p in photos_in:
        shape = p.get("shape") if isinstance(p, dict) else None
        slot: dict[str, Any] = {"shape": shape, "cx": _num(p.get("cx"), 0, 1, "cx"), "cy": _num(p.get("cy"), 0, 1, "cy")}
        if shape == "circle":
            slot["r"] = _num(p.get("r"), 0.02, 0.5, "r")
        elif shape == "box":
            slot["w"] = _num(p.get("w"), 0.04, 1, "w")
            slot["h"] = _num(p.get("h"), 0.04, 1, "h")
            slot["radius"] = _num(p.get("radius", 0.02), 0, 0.5, "radius")
        else:
            raise api_error(400, "invalid_request", "Each photo slot is a circle or a box.", "zones")
        photos.append(slot)
    name_in = z.get("name")
    name = None
    if name_in:
        if not isinstance(name_in, dict) or name_in.get("style") not in ("badge", "text"):
            raise api_error(400, "invalid_request", "name.style must be badge or text.", "zones")
        name = {"style": name_in["style"], "cx": _num(name_in.get("cx"), 0, 1, "cx"),
                "cy": _num(name_in.get("cy"), 0, 1, "cy"), "size": _num(name_in.get("size", 0.024), 0.005, 0.1, "size")}
    return {"photos": photos, "name": name}


def _validated_updates(body: dict[str, Any]) -> dict[str, Any]:
    """Whitelist + clean every editable page column present in body."""
    out: dict[str, Any] = {}
    for key, limit in TEXT_LIMITS.items():
        if key in body:
            out[key] = _text(body[key], limit)
    if "theme" in body:
        t = body["theme"] if isinstance(body["theme"], dict) else {}
        theme = {}
        for k in ("primary", "secondary"):
            v = str(t.get(k, "")).strip()
            if v and not COLOR_RE.match(v):
                raise api_error(400, "invalid_request", f"theme.{k} must be a hex colour like #FF671F.", "theme")
            if v:
                theme[k] = v.upper()
        out["theme"] = Json(theme)
    if "defaults" in body:
        d = body["defaults"] if isinstance(body["defaults"], dict) else {}
        defaults: dict[str, Any] = {k: _text(d.get(k), lim) for k, lim in DEFAULT_LIMITS.items() if d.get(k)}
        slogans = d.get("slogans")
        if isinstance(slogans, list):
            defaults["slogans"] = [_text(s, 60) for s in slogans[:2] if _text(s, 60)]
        out["defaults"] = Json(defaults)
    if "lang" in body:
        if body["lang"] not in LANGS:
            raise api_error(400, "invalid_request", "Unsupported language.", "lang")
        out["lang"] = body["lang"]
    return out


# --------------------------------------------------------------------------- db helpers

def _page_by(conn: Any, where: str, params: tuple[Any, ...]) -> dict[str, Any] | None:
    row = conn.execute(
        f"SELECT {', '.join(PAGE_COLS)} FROM poster_pages WHERE {where} AND deleted_at IS NULL", params
    ).fetchone()
    return dict(zip(PAGE_COLS, row)) if row else None


def _resolve_slug(conn: Any, slug: str) -> tuple[dict[str, Any] | None, bool]:
    """Page for a slug, following an unexpired redirect from a rename. -> (page, moved)."""
    page = _page_by(conn, "slug = %s", (slug,))
    if page:
        return page, False
    row = conn.execute(
        "SELECT page_id FROM poster_slug_redirects WHERE old_slug = %s AND expires_at > now()", (slug,)).fetchone()
    return (_page_by(conn, "id = %s", (row[0],)), True) if row else (None, False)


def _slug_taken(conn: Any, slug: str, for_page: str | None = None) -> bool:
    """A slug is taken while a live page uses it OR a redirect still holds it
    (unless that redirect points at for_page, which may reclaim its own old name)."""
    if conn.execute("SELECT 1 FROM poster_pages WHERE slug = %s AND deleted_at IS NULL", (slug,)).fetchone():
        return True
    row = conn.execute(
        "SELECT page_id FROM poster_slug_redirects WHERE old_slug = %s AND expires_at > now()", (slug,)).fetchone()
    return bool(row) and row[0] != for_page


def _banners(conn: Any, page_id: str) -> list[dict[str, Any]]:
    rows = conn.execute(
        f"SELECT {', '.join(BANNER_COLS)} FROM poster_banners WHERE page_id = %s ORDER BY sort_order, created_at",
        (page_id,)).fetchall()
    return [dict(zip(BANNER_COLS, r)) for r in rows]


def _banner_json(b: dict[str, Any]) -> dict[str, Any]:
    return {**{k: b[k] for k in BANNER_COLS},
            "preview_url": f"/v1/poster/b/{b['id']}/preview", "hd_url": f"/v1/poster/b/{b['id']}/hd"}


def _page_json(conn: Any, page: dict[str, Any]) -> dict[str, Any]:
    v = int(page["updated_at"].timestamp())
    return {
        **{k: page[k] for k in PAGE_COLS if k not in ("account_id", "logo_bytes", "created_at", "updated_at")},
        "url": f"{SITE_BASE}/p/{page['slug']}",
        "logo_url": f"/v1/poster/l/{page['id']}?v={v}" if page["logo_bytes"] else None,
        "banners": [_banner_json(b) for b in _banners(conn, page["id"])],
        "created_at": page["created_at"].isoformat(), "updated_at": page["updated_at"].isoformat(),
    }


def _session_or_none(request: Request) -> str | None:
    try:
        return require_session(request)
    except HTTPException:
        return None


def _can_view(conn: Any, request: Request, page: dict[str, Any]) -> bool:
    acc = _session_or_none(request)
    return bool(acc) and (acc == page["account_id"] or is_admin_account(conn, acc))


def _owned(conn: Any, request: Request, page_id: str) -> tuple[dict[str, Any], str]:
    acc = require_session(request)
    page = _page_by(conn, "id = %s", (page_id,))
    if not page or (page["account_id"] != acc and not is_admin_account(conn, acc)):
        raise api_error(404, "not_found", "No such page on this account.", "id")
    return page, acc


def _touch(conn: Any, page_id: str) -> None:
    conn.execute("UPDATE poster_pages SET updated_at = now() WHERE id = %s", (page_id,))


# --------------------------------------------------------------------------- files

def _dir(page_id: str) -> str:
    return os.path.join(POSTER_DIR, page_id.replace("/", "").replace("..", ""))


def _write(page_id: str, name: str, data: bytes) -> None:
    os.makedirs(_dir(page_id), exist_ok=True)
    path = os.path.join(_dir(page_id), name)
    with open(path + ".tmp", "wb") as fh:
        fh.write(data)
    os.replace(path + ".tmp", path)


def _unlink(page_id: str, name: str) -> None:
    try:
        os.unlink(os.path.join(_dir(page_id), name))
    except FileNotFoundError:
        pass


def _remove_tree(page_id: str) -> bool:
    shutil.rmtree(_dir(page_id), ignore_errors=True)
    return not os.path.exists(_dir(page_id))


def _guard(conn: Any, extra: int) -> None:
    if shutil.disk_usage("/").free - extra < MIN_FREE_DISK:
        raise api_error(503, "storage_full", "The server is low on disk. Try again later.")
    used = conn.execute(
        """SELECT coalesce(sum(b.bytes_total), 0) + coalesce((SELECT sum(logo_bytes) FROM poster_pages WHERE deleted_at IS NULL), 0)
           FROM poster_banners b JOIN poster_pages p ON p.id = b.page_id WHERE p.deleted_at IS NULL"""
    ).fetchone()[0]
    if int(used) + extra > MAX_TOTAL_BYTES:
        raise api_error(507, "poster_storage_full",
                        "Poster storage on this server is full. Contact us to raise the limit.")


def _read_upload(file: UploadFile, cap: int) -> bytes:
    data = file.file.read(cap + 1)
    if len(data) > cap:
        raise api_error(413, "file_too_large", f"Keep the image under {cap // (1024 * 1024)} MB.", "file")
    if not data:
        raise api_error(400, "invalid_image", "The upload was empty.", "file")
    return data


def _open(data: bytes) -> Image.Image:
    try:
        im = Image.open(io.BytesIO(data))
        im.draft("RGB", (HD_BOX[0] * 2, HD_BOX[1] * 2))  # JPEG-only: decode smaller, cheaper
        im.load()
    except Exception:
        raise api_error(400, "invalid_image", "That file is not an image we can read (use JPG, PNG or WebP).", "file") from None
    return ImageOps.exif_transpose(im) or im


def _webp(im: Image.Image, quality: int) -> bytes:
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=4)
    return buf.getvalue()


def _process_banner(data: bytes) -> tuple[bytes, bytes, int, int]:
    """-> (hd_webp, preview_webp, hd_w, hd_h). Never upscales; alpha flattens to white."""
    with _decode_lock:
        im = _open(data)
        if im.mode != "RGB":
            rgba = im.convert("RGBA")
            flat = Image.new("RGB", rgba.size, "white")
            flat.paste(rgba, mask=rgba.split()[3])
            im = flat
        if im.width < 600 or im.height < 600:
            raise api_error(400, "image_too_small", "Banners need to be at least 600 x 600 px.", "file")
        im.thumbnail(HD_BOX, Image.LANCZOS)
        preview = im.copy()
        preview.thumbnail(PREVIEW_BOX, Image.LANCZOS)
        return _webp(im, 86), _webp(preview, 82), im.width, im.height


def _process_logo(data: bytes) -> bytes:
    with _decode_lock:
        im = _open(data).convert("RGBA")
        im.thumbnail(LOGO_BOX, Image.LANCZOS)
        return _webp(im, 90)


# --------------------------------------------------------------------------- shell + meta injection

_shell_cache: tuple[float, str] | None = None


def _shell() -> str | None:
    global _shell_cache
    path = os.path.join(TOOLS_ROOT, "p.html")
    try:
        mtime = os.stat(path).st_mtime
    except OSError:
        return None
    if _shell_cache and _shell_cache[0] == mtime:
        return _shell_cache[1]
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    _shell_cache = (mtime, text)
    return text


def _esc(s: str) -> str:
    return html_mod.escape(s, quote=True)


def _meta(attr: str, key: str, value: str) -> str:
    return f'<meta {attr}="{key}" content="{_esc(value)}"/>'


def _set_tag(doc: str, pattern: str, replacement: str) -> str:
    new, n = re.subn(pattern, lambda _m: replacement, doc, count=1, flags=re.S | re.I)
    return new if n else doc.replace("</head>", replacement + "</head>", 1)


def _meta_pat(attr: str, key: str) -> str:
    return rf'<meta(?=[^>]*\b{attr}="{re.escape(key)}")[^>]*>'


def inject_meta(shell: str, page: dict[str, Any] | None, banners: list[dict[str, Any]], live: bool) -> str:
    """Rewrite the static shell's head for one page. Pure: tested without a server."""
    if page:
        title = f"{page['display_name']} - समर्थक पोस्टर | {page['area'] or page['org_name'] or 'GigAI Tools'}"
        desc = page["defaults"].get("announcement") or page["tagline"] or f"Make your supporter poster for {page['display_name']}."
        url = f"{SITE_BASE}/p/{page['slug']}"
        lang = page["lang"]
    else:
        title, desc, url, lang = "Page not found", "This supporter page does not exist.", f"{SITE_BASE}/p", "en"
    robots = "index, follow" if live else "noindex, nofollow"

    doc = re.sub(r"<title>.*?</title>", f"<title>{_esc(title)}</title>", shell, count=1, flags=re.S)
    doc = re.sub(r'(<html\b[^>]*?)\slang="[^"]*"', rf'\1 lang="{lang}"', doc, count=1)
    doc = _set_tag(doc, _meta_pat("name", "description"), _meta("name", "description", desc))
    doc = _set_tag(doc, r'<link(?=[^>]*\brel="canonical")[^>]*>', f'<link rel="canonical" href="{_esc(url)}"/>')
    for bot in ("robots", "googlebot"):
        doc = _set_tag(doc, _meta_pat("name", bot), _meta("name", bot, robots))
    for prop, val in (("og:title", title), ("og:description", desc), ("og:url", url), ("og:type", "website")):
        doc = _set_tag(doc, _meta_pat("property", prop), _meta("property", prop, val))
    for name, val in (("twitter:title", title), ("twitter:description", desc), ("twitter:card", "summary_large_image")):
        doc = _set_tag(doc, _meta_pat("name", name), _meta("name", name, val))
    # Replace every site-default image tag with the page's first banner.
    doc = re.sub(r'<meta(?=[^>]*\b(?:property="og:image|name="twitter:image))[^>]*>', "", doc, flags=re.I)
    if banners:
        b = banners[0]
        scale = min(PREVIEW_BOX[0] / b["width"], PREVIEW_BOX[1] / b["height"], 1.0)
        image = f"{SITE_BASE}/v1/poster/b/{b['id']}/preview"
        tags = (_meta("property", "og:image", image)
                + _meta("property", "og:image:width", str(round(b["width"] * scale)))
                + _meta("property", "og:image:height", str(round(b["height"] * scale)))
                + _meta("property", "og:image:alt", title)
                + _meta("name", "twitter:image", image))
        doc = doc.replace("</head>", tags + "</head>", 1)
    return doc


# --------------------------------------------------------------------------- public routes
# Public GETs also accept HEAD: FastAPI does not add HEAD to @get routes, and link
# scrapers / uptime checks HEAD a URL before fetching it (405 = no preview).

@poster_router.api_route("/html/{slug}", methods=["GET", "HEAD"], response_class=HTMLResponse)
def page_html(slug: str, request: Request) -> Response:
    shell = _shell()
    if shell is None:
        return HTMLResponse("<!doctype html><title>Temporarily unavailable</title>", status_code=503)
    page, banners = None, []
    if SLUG_RE.match(slug):
        with pool().connection() as conn:
            page, moved = _resolve_slug(conn, slug)
            if page and moved:
                return RedirectResponse(f"/p/{page['slug']}", status_code=301)
            if page:
                banners = _banners(conn, page["id"])
    live = bool(page) and page["status"] == "live"
    return HTMLResponse(inject_meta(shell, page, banners, live), status_code=200 if live else 404,
                        headers={"Cache-Control": "public, max-age=0, must-revalidate, s-maxage=300"})


@poster_router.api_route("/pages/{slug}", methods=["GET", "HEAD"])
def public_page(slug: str, request: Request) -> dict[str, Any]:
    if not SLUG_RE.match(slug):
        raise api_error(404, "not_found", "No such page.")
    with pool().connection() as conn:
        page, _moved = _resolve_slug(conn, slug)
        if not page or (page["status"] != "live" and not _can_view(conn, request, page)):
            raise api_error(404, "not_found", "No such page.")
        return _page_json(conn, page)


def _image_response(path: str, max_age: int) -> FileResponse:
    if not os.path.isfile(path):
        raise api_error(404, "not_found", "No such image.")
    return FileResponse(path, media_type="image/webp",
                        headers={"Cache-Control": f"public, max-age={max_age}" + (", immutable" if max_age > 86400 else "")})


@poster_router.api_route("/b/{banner_id}/{variant}", methods=["GET", "HEAD"])
def banner_image(banner_id: str, variant: str) -> FileResponse:
    if variant not in ("preview", "hd"):
        raise api_error(404, "not_found", "No such image.")
    with pool().connection() as conn:
        row = conn.execute(
            """SELECT b.page_id FROM poster_banners b JOIN poster_pages p ON p.id = b.page_id
               WHERE b.id = %s AND p.deleted_at IS NULL""", (banner_id,)).fetchone()
    if not row:
        raise api_error(404, "not_found", "No such image.")
    return _image_response(os.path.join(_dir(row[0]), f"{banner_id}.{variant}.webp"), 365 * 86400)


@poster_router.api_route("/l/{page_id}", methods=["GET", "HEAD"])
def logo_image(page_id: str) -> FileResponse:
    with pool().connection() as conn:
        page = _page_by(conn, "id = %s", (page_id,))
    if not page or not page["logo_bytes"]:
        raise api_error(404, "not_found", "No such image.")
    return _image_response(os.path.join(_dir(page_id), "logo.webp"), 86400)


@poster_router.post("/events", status_code=204)
def track_event(body: dict[str, Any], request: Request) -> Response:
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "?")
    rate_limit(request, "poster-ev:" + hashlib.sha256(ip.encode()).hexdigest()[:16], 60)
    typ = body.get("type")
    if typ not in EVENT_TYPES:
        raise api_error(400, "invalid_request", "Unknown event type.", "type")
    page_id, banner_id = str(body.get("page_id", ""))[:40], body.get("banner_id")
    with pool().connection() as conn:
        # Only LIVE pages count, so the owner's own test runs never pollute stats.
        live = conn.execute("SELECT 1 FROM poster_pages WHERE id = %s AND status = 'live' AND deleted_at IS NULL",
                            (page_id,)).fetchone()
        if live:
            conn.execute("INSERT INTO poster_events (page_id, banner_id, type) VALUES (%s, %s, %s)",
                         (page_id, str(banner_id)[:40] if banner_id else None, typ))
    return Response(status_code=204)


# --------------------------------------------------------------------------- owner routes (session JWT)

@poster_router.get("/me/pages")
def my_pages(request: Request) -> dict[str, Any]:
    acc = require_session(request)
    with pool().connection() as conn:
        rows = conn.execute(
            f"SELECT {', '.join(PAGE_COLS)} FROM poster_pages WHERE account_id = %s AND deleted_at IS NULL ORDER BY created_at",
            (acc,)).fetchall()
        override = conn.execute("SELECT limits_override FROM accounts WHERE id = %s", (acc,)).fetchone()
        limit = int(((override and override[0]) or {}).get("poster_pages", MAX_PAGES))
        return {"pages": [_page_json(conn, dict(zip(PAGE_COLS, r))) for r in rows], "limit": limit,
                "max_banners": MAX_BANNERS}


@poster_router.get("/slug-check")
def slug_check(slug: str, request: Request) -> dict[str, Any]:
    require_session(request)
    rate_limit(request, "poster-slug:" + (request.client.host if request.client else "?"), 30)
    try:
        clean = _slug(slug)
    except HTTPException as exc:
        return {"slug": slug, "available": False, "reason": exc.detail["error"]["message"]}
    with pool().connection() as conn:
        taken = _slug_taken(conn, clean)
    return {"slug": clean, "available": not taken, "reason": "Already taken." if taken else None}


@poster_router.post("/pages", status_code=201)
def create_page(body: dict[str, Any], request: Request) -> dict[str, Any]:
    acc = require_session(request)
    rate_limit(request, f"poster-create:{acc}", 5)
    slug = _slug(body.get("slug"))
    fields = _validated_updates(body)
    if not fields.get("display_name"):
        raise api_error(400, "invalid_request", "display_name is required.", "display_name")
    with pool().connection() as conn:
        override = conn.execute("SELECT limits_override FROM accounts WHERE id = %s", (acc,)).fetchone()
        limit = int(((override and override[0]) or {}).get("poster_pages", MAX_PAGES))
        count = conn.execute("SELECT count(*) FROM poster_pages WHERE account_id = %s AND deleted_at IS NULL",
                             (acc,)).fetchone()[0]
        if count >= limit:
            raise api_error(403, "page_limit", f"This account can have {limit} pages. Delete one to add another.")
        if _slug_taken(conn, slug):
            raise api_error(409, "slug_taken", "That address is already taken.", "slug")
        pid = new_id("pg")
        cols = ["id", "account_id", "slug", *fields]
        conn.execute(
            f"INSERT INTO poster_pages ({', '.join(cols)}) VALUES ({', '.join(['%s'] * len(cols))})",
            (pid, acc, slug, *fields.values()))
        audit(acc, "user", "poster.page.created", pid, {"slug": slug})
        return _page_json(conn, _page_by(conn, "id = %s", (pid,)) or {})


@poster_router.patch("/pages/{page_id}")
def update_page(page_id: str, body: dict[str, Any], request: Request) -> dict[str, Any]:
    with pool().connection() as conn:
        page, _acc = _owned(conn, request, page_id)
        fields = _validated_updates(body)
        if "display_name" in fields and not fields["display_name"]:
            raise api_error(400, "invalid_request", "display_name cannot be empty.", "display_name")
        if fields:
            sets = ", ".join(f"{k} = %s" for k in fields)
            conn.execute(f"UPDATE poster_pages SET {sets}, updated_at = now() WHERE id = %s", (*fields.values(), page_id))
        return _page_json(conn, _page_by(conn, "id = %s", (page_id,)) or page)


@poster_router.post("/pages/{page_id}/status")
def set_status(page_id: str, body: dict[str, Any], request: Request) -> dict[str, Any]:
    status = body.get("status")
    if status not in STATUSES:
        raise api_error(400, "invalid_request", "status must be draft, live or paused.", "status")
    with pool().connection() as conn:
        page, acc = _owned(conn, request, page_id)
        if status == "live":
            ready = [b for b in _banners(conn, page_id) if b["zones"].get("photos")]
            if not ready:
                raise api_error(400, "not_ready",
                                "Add at least one banner with a photo slot before going live.", "banners")
        conn.execute("UPDATE poster_pages SET status = %s, updated_at = now() WHERE id = %s", (status, page_id))
        audit(acc, "user", f"poster.page.{status}", page_id)
        return _page_json(conn, _page_by(conn, "id = %s", (page_id,)) or page)


@poster_router.post("/pages/{page_id}/slug")
def change_slug(page_id: str, body: dict[str, Any], request: Request) -> dict[str, Any]:
    """Rename the address; the old one 301s to the new one for REDIRECT_DAYS."""
    new = _slug(body.get("slug"))
    with pool().connection() as conn:
        page, acc = _owned(conn, request, page_id)
        if new == page["slug"]:
            return _page_json(conn, page)
        rate_limit(request, f"poster-rename:{acc}", 3)
        if _slug_taken(conn, new, for_page=page_id):
            raise api_error(409, "slug_taken", "That address is already taken.", "slug")
        conn.execute("DELETE FROM poster_slug_redirects WHERE old_slug = %s OR expires_at <= now()", (new,))
        conn.execute(
            """INSERT INTO poster_slug_redirects (old_slug, page_id, expires_at)
               VALUES (%s, %s, now() + make_interval(days => %s))
               ON CONFLICT (old_slug) DO UPDATE SET page_id = EXCLUDED.page_id, expires_at = EXCLUDED.expires_at""",
            (page["slug"], page_id, REDIRECT_DAYS))
        conn.execute("UPDATE poster_pages SET slug = %s, updated_at = now() WHERE id = %s", (new, page_id))
        audit(acc, "user", "poster.page.renamed", page_id, {"from": page["slug"], "to": new})
        return _page_json(conn, _page_by(conn, "id = %s", (page_id,)) or page)


@poster_router.delete("/pages/{page_id}", status_code=204)
def delete_page(page_id: str, request: Request) -> Response:
    with pool().connection() as conn:
        _page, acc = _owned(conn, request, page_id)
        removed = _remove_tree(page_id)
        conn.execute("DELETE FROM poster_slug_redirects WHERE page_id = %s", (page_id,))
        conn.execute("UPDATE poster_pages SET deleted_at = now(), status = 'draft', logo_bytes = 0 WHERE id = %s", (page_id,))
        conn.execute("DELETE FROM poster_banners WHERE page_id = %s", (page_id,))
        audit(acc, "user", "poster.page.deleted", page_id, {"files_removed": removed})
    return Response(status_code=204)


@poster_router.get("/pages/{page_id}/stats")
def page_stats(page_id: str, request: Request, range: str = "7") -> dict[str, Any]:
    days = {"7": 7, "30": 30, "all": 36500}.get(range, 7)
    with pool().connection() as conn:
        _owned(conn, request, page_id)
        totals = dict(conn.execute(
            "SELECT type, count(*) FROM poster_events WHERE page_id = %s AND day > current_date - %s GROUP BY type",
            (page_id, days)).fetchall())
        by_day = conn.execute(
            """SELECT day, count(*) FILTER (WHERE type='visit'), count(*) FILTER (WHERE type='download'),
                      count(*) FILTER (WHERE type='share'), count(*) FILTER (WHERE type='copy')
               FROM poster_events WHERE page_id = %s AND day > current_date - %s GROUP BY day ORDER BY day""",
            (page_id, days)).fetchall()
        by_banner = conn.execute(
            """SELECT banner_id, count(*) FILTER (WHERE type='download'), count(*) FILTER (WHERE type='share')
               FROM poster_events WHERE page_id = %s AND day > current_date - %s AND banner_id IS NOT NULL
               GROUP BY banner_id ORDER BY 2 DESC""", (page_id, days)).fetchall()
    return {"range": range if range in ("7", "30", "all") else "7",
            "totals": {t: int(totals.get(t, 0)) for t in EVENT_TYPES},
            "by_day": [{"day": d.isoformat(), "visits": v, "downloads": dl, "shares": s, "copies": c}
                       for d, v, dl, s, c in by_day],
            "by_banner": [{"banner_id": b, "downloads": dl, "shares": s} for b, dl, s in by_banner]}


# --------------------------------------------------------------------------- images (owner)

@poster_router.post("/pages/{page_id}/logo")
def upload_logo(page_id: str, request: Request, file: UploadFile = File(...)) -> dict[str, Any]:
    with pool().connection() as conn:
        page, acc = _owned(conn, request, page_id)
        rate_limit(request, f"poster-upload:{acc}", 20)
        data = _process_logo(_read_upload(file, MAX_LOGO_UPLOAD))
        _guard(conn, len(data) - page["logo_bytes"])
        _write(page_id, "logo.webp", data)
        conn.execute("UPDATE poster_pages SET logo_bytes = %s, updated_at = now() WHERE id = %s", (len(data), page_id))
        return _page_json(conn, _page_by(conn, "id = %s", (page_id,)) or page)


@poster_router.delete("/pages/{page_id}/logo")
def delete_logo(page_id: str, request: Request) -> dict[str, Any]:
    with pool().connection() as conn:
        page, _acc = _owned(conn, request, page_id)
        _unlink(page_id, "logo.webp")
        conn.execute("UPDATE poster_pages SET logo_bytes = 0, updated_at = now() WHERE id = %s", (page_id,))
        return _page_json(conn, _page_by(conn, "id = %s", (page_id,)) or page)


@poster_router.post("/pages/{page_id}/banners", status_code=201)
def upload_banner(page_id: str, request: Request, file: UploadFile = File(...)) -> dict[str, Any]:
    with pool().connection() as conn:
        _page, acc = _owned(conn, request, page_id)
        rate_limit(request, f"poster-upload:{acc}", 20)
        existing = _banners(conn, page_id)
        if len(existing) >= MAX_BANNERS:
            raise api_error(400, "banner_limit", f"A page can have {MAX_BANNERS} banners. Remove one first.", "file")
        hd, preview, w, h = _process_banner(_read_upload(file, MAX_BANNER_UPLOAD))
        total = len(hd) + len(preview)
        _guard(conn, total)
        bid = new_id("bn")
        _write(page_id, f"{bid}.hd.webp", hd)
        _write(page_id, f"{bid}.preview.webp", preview)
        conn.execute(
            "INSERT INTO poster_banners (id, page_id, sort_order, width, height, bytes_total) VALUES (%s,%s,%s,%s,%s,%s)",
            (bid, page_id, len(existing), w, h, total))
        _touch(conn, page_id)
        audit(acc, "user", "poster.banner.added", bid, {"page_id": page_id, "bytes": total})
        return _banner_json(next(b for b in _banners(conn, page_id) if b["id"] == bid))


@poster_router.patch("/pages/{page_id}/banners/{banner_id}")
def update_banner(page_id: str, banner_id: str, body: dict[str, Any], request: Request) -> dict[str, Any]:
    with pool().connection() as conn:
        _owned(conn, request, page_id)
        if not any(b["id"] == banner_id for b in _banners(conn, page_id)):
            raise api_error(404, "not_found", "No such banner on this page.", "banner_id")
        if "zones" in body:
            conn.execute("UPDATE poster_banners SET zones = %s WHERE id = %s", (Json(_validate_zones(body["zones"])), banner_id))
        if "sort_order" in body:
            conn.execute("UPDATE poster_banners SET sort_order = %s WHERE id = %s",
                         (int(_num(body["sort_order"], 0, 99, "sort_order")), banner_id))
        _touch(conn, page_id)
        return _banner_json(next(b for b in _banners(conn, page_id) if b["id"] == banner_id))


@poster_router.delete("/pages/{page_id}/banners/{banner_id}", status_code=204)
def delete_banner(page_id: str, banner_id: str, request: Request) -> Response:
    with pool().connection() as conn:
        _page, acc = _owned(conn, request, page_id)
        for variant in ("hd", "preview"):
            _unlink(page_id, f"{banner_id}.{variant}.webp")
        conn.execute("DELETE FROM poster_banners WHERE id = %s AND page_id = %s", (banner_id, page_id))
        _touch(conn, page_id)
        audit(acc, "user", "poster.banner.removed", banner_id, {"page_id": page_id})
    return Response(status_code=204)
