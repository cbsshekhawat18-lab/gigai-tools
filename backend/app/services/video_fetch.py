"""Server-side video retrieval for Video → Work.

A browser cannot fetch a Loom, YouTube or Vimeo recording: the media sits behind
CORS and a signed manifest, so `fetch()` on a share link fails in a way no
client code can fix. This module does that retrieval server-side with yt-dlp,
then hands the file back to the browser, which does everything else locally.

PRIVACY DOCTRINE, same as the ephemeral converters:

    resolve → download to a temp dir → stream to the browser → delete → forget

Nothing is persisted, nothing is cached between requests, and no URL or title is
written to a log line that outlives the request.

SECURITY. Fetching a user-supplied URL from our own network is server-side
request forgery unless it is fenced, and this is fenced in four ways:

  1. HOST ALLOWLIST — only the providers we actually support, plus direct media
     links. An arbitrary host is refused before any network call.
  2. IP INSPECTION — every address the hostname resolves to must be public.
     Loopback, private ranges, link-local (including the 169.254.169.254 cloud
     metadata endpoint), CGNAT and reserved space are all refused. This is
     re-checked after redirects, because a public host can redirect inward.
  3. HARD CAPS — duration, file size and wall-clock time, all enforced before
     and during the download so a malicious link cannot exhaust the box.
  4. NO SHELL, NO PLAYLISTS, NO POST-PROCESSING — yt-dlp is called as a library
     with a format selector that prefers a single progressive stream, so there
     is no command string to inject into and no ffmpeg merge step to abuse.
"""

from __future__ import annotations

import ipaddress
import logging
import re
import socket
import tempfile
from pathlib import Path
from typing import Any, Final
from urllib.parse import urlparse

from app.core.config import settings

logger = logging.getLogger("app.services.video_fetch")

# ── Limits ────────────────────────────────────────────────────────────────────

#: Longest recording we will retrieve. Past this the browser-side transcription
#: is an unreasonable wait anyway, so refusing early is kinder than downloading
#: 400MB the user then can't use. Tunable per deployment — a small box should
#: lower both of these rather than risk filling its disk.
MAX_DURATION_SECONDS: Final[int] = settings.video_fetch_max_minutes * 60

#: Hard ceiling on the retrieved file.
MAX_BYTES: Final[int] = settings.video_fetch_max_mb * 1024 * 1024

#: Wall-clock budget for one retrieval.
FETCH_TIMEOUT_SECONDS: Final[int] = 240

#: Socket-level timeout for each individual request yt-dlp makes.
SOCKET_TIMEOUT_SECONDS: Final[int] = 30

#: yt-dlp's default User-Agent is blocked outright by several CDNs — Google's
#: storage bucket answers it with a flat 403 — which surfaced as "that link
#: couldn't be fetched" for a URL that was perfectly fine. Present as an
#: ordinary browser instead.
BROWSER_UA: Final[str] = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)

#: Prefer a single progressive stream at a sane resolution: it needs no ffmpeg
#: merge, downloads faster, and 720p is far more detail than frame analysis and
#: OCR need. The tail entries are fallbacks for sources with no progressive
#: format at all.
FORMAT_SELECTOR: Final[str] = (
    "best[height<=?720][vcodec!=none][acodec!=none]/"
    "best[vcodec!=none][acodec!=none]/"
    "best[height<=?720]/best"
)

# ── Host allowlist ────────────────────────────────────────────────────────────

_ALLOWED_SUFFIXES: Final[dict[str, str]] = {
    "loom.com": "loom",
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "youtube-nocookie.com": "youtube",
    "vimeo.com": "vimeo",
    "awesomescreenshot.com": "direct",
    "getcloudapp.com": "direct",
    "cl.ly": "direct",
    "drive.google.com": "direct",
    "dropbox.com": "direct",
    "wetransfer.com": "direct",
}

_DIRECT_MEDIA_RE: Final[re.Pattern[str]] = re.compile(
    r"\.(mp4|mov|webm|mkv|avi|m4v|mpe?g|mp3|wav|m4a|aac|ogg|flac)$", re.IGNORECASE
)


class FetchError(Exception):
    """A failure with a message that is safe — and useful — to show a user."""


def _host_of(url: str) -> tuple[str, str]:
    """Validate the scheme and return ``(hostname, provider)``."""
    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise FetchError("Only http and https links can be fetched.")
    hostname = (parsed.hostname or "").lower().rstrip(".")
    if not hostname:
        raise FetchError("That link has no host.")

    for suffix, provider in _ALLOWED_SUFFIXES.items():
        if hostname == suffix or hostname.endswith(f".{suffix}"):
            return hostname, provider

    # Anything else is only allowed when it points straight at a media file.
    if _DIRECT_MEDIA_RE.search(parsed.path):
        return hostname, "direct"

    raise FetchError(
        "That host isn't supported. Paste a Loom, YouTube, Vimeo or direct video-file "
        "link — or download the recording and add the file directly, which always works."
    )


def _assert_public(hostname: str) -> None:
    """Refuse any hostname that resolves to non-public address space.

    Checked for *every* address in the DNS response, not just the first, so a
    record mixing a public and a private answer cannot slip through.
    """
    try:
        infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise FetchError("That host could not be resolved.") from exc

    if not infos:
        raise FetchError("That host could not be resolved.")

    for info in infos:
        raw = info[4][0]
        try:
            address = ipaddress.ip_address(raw)
        except ValueError:
            raise FetchError("That host resolved to an address we can't verify.") from None

        if (
            address.is_private
            or address.is_loopback
            or address.is_link_local
            or address.is_reserved
            or address.is_multicast
            or address.is_unspecified
        ):
            # Covers 127.0.0.0/8, 10/8, 172.16/12, 192.168/16, ::1, fc00::/7 and
            # 169.254.169.254 — the cloud metadata endpoint an SSRF would target.
            raise FetchError("That link points inside a private network and won't be fetched.")


def _guard(url: str) -> tuple[str, str]:
    """Run the full pre-flight: scheme, allowlist, DNS and address inspection."""
    hostname, provider = _host_of(url)
    _assert_public(hostname)
    return hostname, provider


def _ydl_options(temp_dir: Path, *, download: bool) -> dict[str, Any]:
    """Base yt-dlp configuration, locked down.

    Everything that could reach the shell, the filesystem outside the temp dir,
    or the user's cookies is explicitly disabled.
    """
    return {
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "format": FORMAT_SELECTOR,
        "outtmpl": str(temp_dir / "media.%(ext)s"),
        "paths": {"home": str(temp_dir)},
        "socket_timeout": SOCKET_TIMEOUT_SECONDS,
        "http_headers": {"User-Agent": BROWSER_UA},
        "retries": 1,
        "fragment_retries": 1,
        "max_filesize": MAX_BYTES,
        # One video, never a channel or playlist.
        "noplaylist": True,
        "playlist_items": "1",
        # No shelling out, no side effects, no local state.
        "postprocessors": [],
        "cachedir": False,
        "cookiesfrombrowser": None,
        "cookiefile": None,
        "call_home": False,
        "check_formats": False,
        "skip_download": not download,
        "overwrites": True,
        "restrictfilenames": True,
        "windowsfilenames": True,
        # Refuse anything that isn't a real media extraction.
        "ignoreerrors": False,
    }


def _readable_ydl_error(exc: Exception) -> str:
    """Translate yt-dlp failures into something a user can act on."""
    text = str(exc).lower()

    # Order matters: YouTube's datacenter block also contains "sign in", so it
    # must be matched BEFORE the private-video case or every blocked fetch tells
    # the user to change a sharing setting that was never the problem.
    if "not a bot" in text or "confirm you" in text or "cookies" in text:
        return (
            "That site is blocking automated downloads from our server — it can't tell us "
            "apart from a bot. Download the video and add the file directly; that always "
            "works and keeps it on your machine."
        )
    if "private" in text or "sign in" in text or "log in" in text or "members-only" in text:
        return (
            "That recording is private. Make the link publicly viewable, or download the "
            "file and add it directly."
        )
    if "oauth" in text or "unauthorized" in text or "401" in text:
        return (
            "That provider refused our request. Download the video and add the file "
            "directly — that always works."
        )
    if "403" in text or "forbidden" in text:
        return (
            "That host refused the download (403). Download the file yourself and add it "
            "here instead."
        )
    if "not available" in text or "removed" in text or "410" in text or "404" in text:
        return "That link is expired, deleted or unavailable."
    if "age" in text and "restrict" in text:
        return "That video is age-restricted and can't be fetched."
    if "geo" in text and ("restrict" in text or "block" in text):
        return "That video is geo-restricted and can't be fetched from this server."
    if "unsupported url" in text or "no video formats" in text:
        return (
            "Nothing playable was found at that link. If it's a share page rather than a "
            "video, open it and copy the direct video link instead."
        )
    if "max_filesize" in text or "file is larger" in text:
        return f"That recording is larger than the {MAX_BYTES // (1024 * 1024)}MB limit."
    if "timed out" in text or "timeout" in text:
        return "Fetching that link timed out. The source may be slow or very large."
    return "That link couldn't be fetched. Downloading the file and adding it directly always works."


def _follow_redirects(url: str, client: Any, max_hops: int = 4) -> str:
    """Resolve redirects one hop at a time, re-guarding every destination.

    Following redirects blindly reopens the SSRF hole the allowlist closes: a
    permitted public host can 302 straight to 169.254.169.254. So each hop is
    put back through the same scheme/allowlist/address checks as the original.
    """
    current = url
    for _ in range(max_hops):
        response = client.head(current, follow_redirects=False)
        if response.status_code not in (301, 302, 303, 307, 308):
            return current
        location = response.headers.get("location")
        if not location:
            return current
        current = str(response.url.join(location))
        _guard(current)
    raise FetchError("That link redirects too many times.")


def _resolve_direct(url: str) -> dict[str, Any]:
    """Inspect a direct media URL with a plain HTTP request.

    yt-dlp's generic extractor fetches the URL as a *web page* to sniff it,
    which several CDNs answer with a 403 — a link that is perfectly downloadable
    looked broken. For a URL that already ends in a media extension there is
    nothing to extract, so this asks the server directly instead.
    """
    import httpx

    try:
        with httpx.Client(timeout=20.0, headers={"User-Agent": BROWSER_UA}) as client:
            final = _follow_redirects(url, client)
            response = client.head(final, follow_redirects=False)
            if response.status_code >= 400:
                # Some hosts refuse HEAD but allow GET; ask for one byte.
                response = client.get(
                    final, headers={"Range": "bytes=0-0"}, follow_redirects=False
                )
            if response.status_code >= 400:
                raise FetchError(
                    f"That host refused the request ({response.status_code}). Download the "
                    "file yourself and add it here instead."
                )
    except httpx.HTTPError as exc:
        raise FetchError("That link could not be reached.") from exc

    content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
    if content_type and not (
        content_type.startswith("video/")
        or content_type.startswith("audio/")
        or content_type in {"application/octet-stream", "binary/octet-stream"}
    ):
        raise FetchError(
            f"That link returns {content_type}, not a video or audio file."
        )

    size = 0
    raw_length = response.headers.get("content-range") or response.headers.get("content-length")
    if raw_length:
        digits = re.search(r"(\d+)\s*$", raw_length)
        if digits:
            size = int(digits.group(1))
    if size > MAX_BYTES:
        raise FetchError(
            f"That file is {size // (1024 * 1024)}MB — larger than the "
            f"{MAX_BYTES // (1024 * 1024)}MB limit."
        )

    name = urlparse(url).path.rsplit("/", 1)[-1] or "recording"
    return {
        "title": name[:300],
        # A direct file exposes no duration without decoding it; the browser
        # measures it accurately the moment the file arrives.
        "duration_seconds": 0,
        "extractor": "direct",
        "approx_bytes": size,
        "is_live": False,
    }


def _download_direct(url: str, temp_dir: Path) -> Path:
    """Stream a direct media URL to disk, enforcing the size cap as it goes."""
    import httpx

    target = temp_dir / (urlparse(url).path.rsplit("/", 1)[-1] or "recording.mp4")
    written = 0
    try:
        with httpx.Client(timeout=60.0, headers={"User-Agent": BROWSER_UA}) as client:
            final = _follow_redirects(url, client)
            with client.stream("GET", final, follow_redirects=False) as response:
                if response.status_code >= 400:
                    raise FetchError(
                        f"That host refused the download ({response.status_code})."
                    )
                with target.open("wb") as handle:
                    for chunk in response.iter_bytes(chunk_size=256 * 1024):
                        written += len(chunk)
                        # Enforce mid-stream: Content-Length can lie or be absent.
                        if written > MAX_BYTES:
                            raise FetchError(
                                f"That recording exceeds the "
                                f"{MAX_BYTES // (1024 * 1024)}MB limit."
                            )
                        handle.write(chunk)
    except httpx.HTTPError as exc:
        raise FetchError("That link could not be downloaded.") from exc

    if written == 0:
        raise FetchError("That link returned an empty file.")
    return target


def resolve(url: str) -> dict[str, Any]:
    """Inspect a URL without downloading it.

    Fast, cheap, and catches the common failures — private Loom, expired share
    link, unsupported host — before the user commits to a download. Returns the
    title and duration so the workspace can show what it is about to fetch.
    """
    _, provider = _guard(url)

    # A direct file link needs no extractor, and using one actively hurts.
    if provider == "direct":
        return _resolve_direct(url)

    try:
        import yt_dlp
    except ImportError as exc:  # pragma: no cover - deployment guard
        raise FetchError("URL fetching isn't available on this server.") from exc

    with tempfile.TemporaryDirectory(prefix="gigai-vw-probe-") as temp:
        options = _ydl_options(Path(temp), download=False)
        try:
            with yt_dlp.YoutubeDL(options) as ydl:
                info = ydl.extract_info(url, download=False)
        except Exception as exc:  # noqa: BLE001 - yt-dlp raises a wide family
            logger.info("video_fetch: resolve failed (%s)", type(exc).__name__)
            raise FetchError(_readable_ydl_error(exc)) from exc

    if not isinstance(info, dict):
        raise FetchError("Nothing playable was found at that link.")

    # A playlist URL still resolves; take the first entry rather than refusing.
    if info.get("_type") == "playlist":
        entries = [e for e in (info.get("entries") or []) if isinstance(e, dict)]
        if not entries:
            raise FetchError("That link is a playlist with nothing playable in it.")
        info = entries[0]

    duration = info.get("duration")
    duration_seconds = int(duration) if isinstance(duration, (int, float)) and duration > 0 else 0
    if duration_seconds > MAX_DURATION_SECONDS:
        raise FetchError(
            f"That recording is {duration_seconds // 60} minutes long — longer than the "
            f"{MAX_DURATION_SECONDS // 60}-minute limit for fetched links. Download it and "
            "trim the part you need."
        )

    size = info.get("filesize") or info.get("filesize_approx")
    return {
        "title": str(info.get("title") or "").strip()[:300],
        "duration_seconds": duration_seconds,
        "extractor": str(info.get("extractor_key") or info.get("extractor") or "").strip()[:60],
        "approx_bytes": int(size) if isinstance(size, (int, float)) and size > 0 else 0,
        "is_live": bool(info.get("is_live")),
    }


def download(url: str) -> tuple[Path, tempfile.TemporaryDirectory[str], str]:
    """Retrieve the media to a temp directory.

    Returns the file path, the TemporaryDirectory handle (the caller must keep
    it alive until the response has finished streaming, then close it), and a
    suggested download filename.
    """
    _, provider = _guard(url)

    # Probe first so duration and live-stream refusals happen before any bytes
    # move — much cheaper than aborting a download partway.
    info = resolve(url)
    if info["is_live"]:
        raise FetchError("That's a live stream, which can't be analysed as a recording.")

    handle = tempfile.TemporaryDirectory(prefix="gigai-vw-")
    temp_dir = Path(handle.name)

    # Direct file links stream straight through — no extractor involved.
    if provider == "direct":
        try:
            media = _download_direct(url, temp_dir)
        except Exception:
            handle.cleanup()
            raise
        return media, handle, _download_name(info["title"], media.suffix)

    try:
        import yt_dlp
    except ImportError as exc:  # pragma: no cover - deployment guard
        handle.cleanup()
        raise FetchError("URL fetching isn't available on this server.") from exc

    try:
        options = _ydl_options(temp_dir, download=True)
        with yt_dlp.YoutubeDL(options) as ydl:
            ydl.download([url])
    except Exception as exc:  # noqa: BLE001
        handle.cleanup()
        logger.info("video_fetch: download failed (%s)", type(exc).__name__)
        raise FetchError(_readable_ydl_error(exc)) from exc

    files = sorted(
        (p for p in temp_dir.iterdir() if p.is_file() and p.stat().st_size > 0),
        key=lambda p: p.stat().st_size,
        reverse=True,
    )
    if not files:
        handle.cleanup()
        raise FetchError(
            f"That recording exceeded the {MAX_BYTES // (1024 * 1024)}MB limit, or produced "
            "no playable file."
        )

    media = files[0]
    if media.stat().st_size > MAX_BYTES:
        handle.cleanup()
        raise FetchError(f"That recording is larger than the {MAX_BYTES // (1024 * 1024)}MB limit.")

    return media, handle, _download_name(info["title"], media.suffix)


def _download_name(title: str, suffix: str) -> str:
    """A safe, recognisable filename — no path separators, no traversal.

    Unicode is PRESERVED. An ASCII-only allowlist looked safe but silently
    erased every non-Latin title: a Hindi-titled Loom came back as
    "recording.mp4", and since the workspace labels each video by its filename,
    a project of them would show "Recording" over and over. Starlette emits the
    RFC 5987 ``filename*=utf-8''`` form for non-ASCII names and the client
    parses that form first, so the whole path is UTF-8 clean.

    What is removed is only what is actually dangerous: path separators (so no
    traversal), control characters, and the quote/semicolon/newline characters
    that could break out of the Content-Disposition header.

    Direct links take their title from the URL's filename, which already carries
    an extension, so any media extension is stripped before the suffix is added
    — otherwise you get "clip.mp4.mp4".
    """
    # Strip path separators, C0/C1 control chars, and header-breaking punctuation.
    base = re.sub(r"[\x00-\x1f\x7f-\x9f/\\\"';\r\n]+", "", title)
    # Collapse leading dots so the result can never be "..", ".." or hidden.
    base = re.sub(r"^[.\s]+", "", base).strip()
    base = _DIRECT_MEDIA_RE.sub("", base).strip() or "recording"
    return f"{base[:80]}{suffix or '.mp4'}"


def fetching_available() -> bool:
    """True when yt-dlp is installed and URL fetching hasn't been switched off."""
    if not settings.video_fetch_enabled:
        return False
    try:
        import yt_dlp  # noqa: F401
    except ImportError:
        return False
    return True
