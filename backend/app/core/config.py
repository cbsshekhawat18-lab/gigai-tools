"""Application settings.

All configuration is read from the environment (12-factor style) with sensible
local-dev defaults so the API boots with zero setup. In production these are
supplied by ``docker-compose.yml`` / the platform's secret store.

The variable names match the shared ``.env.example`` at the repo root.
"""

from __future__ import annotations

import re
from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# A Chrome extension ID is the first 128 bits of the SHA-256 of the packed
# public key, hex-encoded and then mapped 0-f → a-p. So it is always exactly 32
# characters, and never contains a digit or a letter past 'p'.
_CHROME_ID_RE = re.compile(r"[a-p]{32}")
_UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)

# Origins belonging to nobody, in same-scheme PAIRS. A pin names one origin and
# so can match at most one of these — and only by the coincidence of a real ID
# equalling a decoy. A wildcard cannot tell the pair apart and matches both.
# That difference is the whole test; see `assert_cors_is_pinned`.
_DECOY_PAIRS = (
    (
        "chrome-extension://abcdefghijklmnopabcdefghijklmnop",
        "chrome-extension://ponmlkjihgfedcbaponmlkjihgfedcba",
    ),
    (
        "moz-extension://00000000-1111-2222-3333-444444444444",
        "moz-extension://ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb",
    ),
    (
        "https://evil.example",
        "https://attacker.invalid",
    ),
)

# The opaque origin. A sandboxed iframe, a file:// page and a redirect chain can
# all present it, and it belongs to no site — so matching it is never a pin.
_OPAQUE_ORIGIN = "null"


class Settings(BaseSettings):
    """Typed, validated application configuration."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── Service identity ──────────────────────────────────────────────────────
    app_name: str = "Gigai Tools API"
    version: str = "0.1.0"
    env: str = Field(default="development", description="development | staging | production")

    # ── Ephemeral document conversion (LibreOffice) ──────────────────────────
    max_upload_mb: int = Field(
        default=25,
        ge=1,
        le=100,
        description=(
            "Hard ceiling (MB) for a single upload to the ephemeral converter. "
            "Files are processed in a temp dir and deleted immediately; nothing "
            "is stored."
        ),
    )

    @property
    def max_upload_bytes(self) -> int:
        """Upload ceiling expressed in bytes."""
        return self.max_upload_mb * 1024 * 1024

    # ── Video → Work analysis (the platform's only hosted-model call) ─────────
    anthropic_api_key: str = Field(
        default="",
        description=(
            "API key for the Video → Work analysis step. Leave empty to disable "
            "analysis entirely — the tool then reports that honestly and still "
            "produces transcripts and screenshots in the browser."
        ),
    )
    video_work_model: str = Field(
        default="claude-opus-5",
        description="Model used to turn a transcript plus frames into findings.",
    )
    groq_api_key: str = Field(
        default="",
        description=(
            "Optional free-tier fallback for Video → Work analysis. Used only when "
            "no Anthropic key is set. Groq does not train on inputs, but its free "
            "limits are ORGANISATION-wide (~30 RPM / 6k TPM), so every visitor "
            "shares this one key — it is a trial path, not a scalable one."
        ),
    )
    groq_model: str = Field(
        default="openai/gpt-oss-120b",
        # SWITCHED 2026-08-21: qwen3.6-27b failed json_object mode on real
        # transcripts (json_validate_failed, EMPTY failed_generation, even
        # text-only with a 4.6k output budget) - its visible reasoning starves
        # the JSON. gpt-oss-120b is the strongest structured-output model on
        # this key. TEXT-ONLY: analysis quality lives in the transcript, and
        # every live failure since launch traced to the one attached frame.
        description="Groq analysis model. Text-only; frames are not sent.",
    )
    video_fetch_max_mb: int = Field(
        default=600,
        ge=10,
        le=4000,
        description=(
            "Largest recording the server will retrieve. Lower this on small "
            "boxes — a fetch holds the whole file in a temp dir before streaming."
        ),
    )
    video_fetch_max_minutes: int = Field(
        default=90, ge=1, le=600, description="Longest recording the server will retrieve."
    )
    video_fetch_concurrency: int = Field(
        default=2,
        ge=1,
        le=8,
        description=(
            "Simultaneous retrievals. Each one can occupy video_fetch_max_mb of "
            "disk, so keep concurrency x size well inside free space."
        ),
    )
    pdf_repair_enabled: bool = Field(
        default=False,
        description=(
            "Mount /api/pdf-repair (app/pdf_repair, AGPL-3.0, needs PyMuPDF and "
            "tesseract; see requirements-pdf-repair.txt). Off by default."
        ),
    )
    video_fetch_enabled: bool = Field(
        default=True,
        description=(
            "Allow server-side retrieval of Loom/YouTube/Vimeo links via yt-dlp. "
            "Set false to disable the URL field entirely (uploads keep working); "
            "the tool then says so rather than accepting links it can't fetch."
        ),
    )

    # ── GigAI Verify (AI-or-human analysis for the browser extension) ────────
    verify_model: str = Field(
        default="claude-opus-5",
        description=(
            "Model used for the assisted reading step. It never decides a verdict — it "
            "reports quoted observations that are fed through the same deterministic "
            "fusion as the heuristics. Leave anthropic_api_key empty to run on "
            "heuristics and provenance alone; the endpoint stays fully functional."
        ),
    )
    verify_max_text_chars: int = Field(
        default=200_000,
        ge=1_000,
        le=1_000_000,
        description="Largest single submission the engine will accept.",
    )
    verify_concurrency: int = Field(
        default=4,
        ge=1,
        le=32,
        description=(
            "Simultaneous analyses. Each may make a model call and fetch an image, so "
            "keep this well inside the box's outbound capacity."
        ),
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # NoDecode is load-bearing: without it pydantic-settings JSON-parses complex
    # fields inside the dotenv source, BEFORE any validator runs — so the
    # comma-separated form documented in .env.example raised
    # "error parsing value for field cors_origins" instead of reaching
    # `_split_cors_origins`. Found deploying to production. With NoDecode the
    # raw string reaches the validator, and both forms work.
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "https://gigai.tools",
        ],
        description="Origins allowed to call the API from a browser.",
    )

    # The GigAI Verify extension calls this API from origin
    # chrome-extension://<id>, which cannot be known before the Web Store item
    # exists. The obvious workaround — a regex matching any extension ID — is a
    # trap: it authorises EVERY extension on the internet to spend this
    # deployment's Anthropic budget. So the default here is CLOSED, and the
    # supported way in is to name the IDs.
    verify_extension_ids: Annotated[list[str], NoDecode] = Field(
        default_factory=list,
        description=(
            "Browser-extension IDs allowed to call the API, comma-separated. Each "
            "becomes one exact allowed origin. Accepts a bare ID "
            "('abcdefghijklmnopabcdefghijklmnop' — assumed Chrome) or a full origin "
            "('moz-extension://<uuid>'). Find the Chrome ID in the Web Store "
            "developer dashboard as soon as the draft item is created — you do not "
            "have to publish first. For an unpacked local build it is shown on "
            "chrome://extensions with Developer mode on."
        ),
    )

    cors_origin_regex: str = Field(
        default="",
        description=(
            "Escape hatch for origins that cannot be listed literally. Empty means "
            "no pattern matching, which is the intended production state — prefer "
            "VERIFY_EXTENSION_IDS, which produces exact origins. A pattern that "
            "matches extension IDs it was not given is rejected at startup when "
            "ENV=production; see `assert_cors_is_pinned`."
        ),
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: object) -> object:
        """Accept a comma-separated string (from .env), a JSON array, or a list."""
        if isinstance(value, str):
            text = value.strip()
            if text.startswith("["):
                import json

                try:
                    return json.loads(text)
                except ValueError:
                    pass
            return [origin.strip() for origin in text.split(",") if origin.strip()]
        return value

    @field_validator("verify_extension_ids", mode="before")
    @classmethod
    def _split_extension_ids(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("verify_extension_ids", mode="after")
    @classmethod
    def _validate_extension_ids(cls, value: list[str]) -> list[str]:
        """Reject anything that is not a well-formed extension ID or origin.

        A typo here fails open in the worst way — the extension is silently
        blocked by CORS, and the temptation is then to "fix" it by widening the
        regex. Failing loudly at boot is the cheaper error.
        """
        normalised: list[str] = []
        for raw in value:
            entry = raw.strip().rstrip("/")
            scheme, _, ident = entry.rpartition("://")
            # Origins are case-insensitive in scheme and host, and a dashboard
            # copy-paste can carry either case. Normalise BEFORE validating, so
            # a correct ID in the wrong case is accepted rather than rejected.
            scheme = (scheme or "chrome-extension").lower()
            ident = ident.lower()

            if scheme not in {"chrome-extension", "moz-extension"}:
                raise ValueError(
                    f"VERIFY_EXTENSION_IDS: {raw!r} has scheme {scheme!r}; expected "
                    "chrome-extension or moz-extension."
                )
            if not _CHROME_ID_RE.fullmatch(ident) and not _UUID_RE.fullmatch(ident):
                raise ValueError(
                    f"VERIFY_EXTENSION_IDS: {ident!r} is not a valid extension ID. "
                    "Chrome IDs are exactly 32 characters from a-p; Firefox IDs are "
                    "UUIDs."
                )
            origin = f"{scheme}://{ident}"
            if origin not in normalised:
                normalised.append(origin)
        return normalised

    @property
    def extension_origins(self) -> list[str]:
        """Exact browser-extension origins allowed to call the API."""
        return list(self.verify_extension_ids)

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"


class CorsConfigurationError(RuntimeError):
    """Raised at startup when the CORS policy would admit unknown callers."""


def assert_cors_is_pinned(config: Settings) -> None:
    """Refuse to start a production API whose CORS policy is a wildcard.

    The check is behavioural rather than syntactic: rather than pattern-matching
    the pattern — which any sufficiently creative regex defeats — it asks the
    configured regex to distinguish two origins that differ only in their ID. A
    pin can tell them apart. A wildcard, by definition, cannot.

    Matching one decoy is tolerated, because a pinned real ID could in principle
    equal a decoy; matching BOTH halves of a pair cannot happen by coincidence.

    Deliberately *not* a warning. A log line saying "your API is open" is read
    once, at 2am, by nobody. Development is exempt so `uvicorn --reload` keeps
    working against an unpacked build.
    """
    if not config.is_production or not config.cors_origin_regex:
        return

    try:
        pattern = re.compile(config.cors_origin_regex)
    except re.error as exc:  # pragma: no cover - configuration typo
        raise CorsConfigurationError(
            f"CORS_ORIGIN_REGEX is not a valid regular expression: {exc}"
        ) from exc

    leak: tuple[str, str] | None = None
    for left, right in _DECOY_PAIRS:
        if pattern.match(left) and pattern.match(right):
            leak = (left, right)
            break

    if leak is None and pattern.match(_OPAQUE_ORIGIN):
        leak = (_OPAQUE_ORIGIN, _OPAQUE_ORIGIN)

    if leak is not None:
        raise CorsConfigurationError(
            "CORS_ORIGIN_REGEX is a wildcard, not a pin: it admits both "
            f"{leak[0]} and {leak[1]}, origins that belong to nobody. Any "
            "caller matching it could spend this deployment's model budget "
            "from a user's browser.\n"
            "Fix: unset CORS_ORIGIN_REGEX and set VERIFY_EXTENSION_IDS to the "
            "GigAI Verify extension ID from the Chrome Web Store dashboard "
            "(available as soon as the draft item exists — publishing is not "
            "required)."
        )


@lru_cache
def get_settings() -> Settings:
    """Return a cached ``Settings`` instance (read the environment once)."""
    return Settings()


settings: Settings = get_settings()
