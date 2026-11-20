"""CORS policy gates.

The API holds the platform's only hosted-model credential. Its CORS policy is
therefore an authorisation boundary, not a browser nicety: an origin that gets
past it can spend the Anthropic budget from any user's browser.

These tests pin the boundary. The first one reproduces the hole that shipped in
the original configuration, so a future "just make the extension work again"
patch cannot quietly reopen it.
"""

from __future__ import annotations

import pytest

from app.core.config import CorsConfigurationError, Settings, assert_cors_is_pinned

PROD = {"env": "production", "cors_origins": ["https://gigai.tools"]}
OURS = "bfnhmjkldpaocgiebfnhmjkldpaocgie"
THEIRS = "kdpjmnaboclgehifkdpjmnaboclgehif"


def test_the_original_wildcard_cannot_boot_in_production() -> None:
    """THE BUG: `^(?:chrome|moz)-extension://[a-z0-9]{32}$` matched everyone.

    It reads like a pin — it names the scheme and the exact ID length — but the
    character class matches any ID, so every extension on the internet was an
    allowed origin.
    """
    config = Settings(**PROD, cors_origin_regex=r"^(?:chrome|moz)-extension://[a-z0-9]{32}$")

    with pytest.raises(CorsConfigurationError) as raised:
        assert_cors_is_pinned(config)

    assert "wildcard, not a pin" in str(raised.value)
    assert "VERIFY_EXTENSION_IDS" in str(raised.value)


@pytest.mark.parametrize(
    "pattern",
    [
        r"^chrome-extension://.*$",  # the lazy fix
        r"^.*$",  # the very lazy fix
        r"chrome-extension://[a-p]{32}",  # correct alphabet, still every ID
        r"^chrome-extension://[a-p]{32}",  # unanchored tail
        r"^(?:chrome-extension://[a-p]{32}|https://gigai\.tools)$",  # buried in an alternation
    ],
)
def test_wildcard_variants_are_all_rejected(pattern: str) -> None:
    """The check is behavioural, so restating the wildcard does not evade it."""
    with pytest.raises(CorsConfigurationError):
        assert_cors_is_pinned(Settings(**PROD, cors_origin_regex=pattern))


def test_the_opaque_origin_is_never_a_pin() -> None:
    """'null' is what a sandboxed iframe or file:// page presents. It is not a site."""
    with pytest.raises(CorsConfigurationError):
        assert_cors_is_pinned(Settings(**PROD, cors_origin_regex=r"^(?:null)$"))


def test_a_genuine_pin_is_allowed() -> None:
    config = Settings(**PROD, cors_origin_regex=rf"^chrome-extension://{OURS}$")
    assert_cors_is_pinned(config)  # does not raise


def test_pinning_two_ids_by_regex_is_allowed() -> None:
    """Chrome + Firefox builds are a legitimate two-origin pin, not a wildcard."""
    assert_cors_is_pinned(
        Settings(
            **PROD,
            cors_origin_regex=(
                rf"^(?:chrome-extension://{OURS}"
                r"|moz-extension://12345678-90ab-cdef-1234-567890abcdef)$"
            ),
        )
    )


def test_a_pin_that_happens_to_equal_one_decoy_still_boots() -> None:
    """The decoys are arbitrary strings; one could in principle be a real ID.

    Matching a single decoy therefore proves nothing. Only matching both halves
    of a pair — origins that differ solely in their ID — proves the pattern
    cannot distinguish extensions from one another.
    """
    assert_cors_is_pinned(
        Settings(
            **PROD,
            cors_origin_regex=r"^chrome-extension://abcdefghijklmnopabcdefghijklmnop$",
        )
    )


def test_the_closed_default_boots() -> None:
    """No regex at all is the intended production state."""
    assert Settings().cors_origin_regex == ""
    assert_cors_is_pinned(Settings(**PROD))


def test_development_is_exempt() -> None:
    """`uvicorn --reload` against an unpacked build must keep working."""
    assert_cors_is_pinned(
        Settings(env="development", cors_origin_regex=r"^chrome-extension://[a-p]{32}$")
    )


# ── the supported route in: exact origins ────────────────────────────────────


def test_ids_become_exact_origins() -> None:
    config = Settings(verify_extension_ids=f"{OURS}, moz-extension://{'a' * 8}-1111-2222-3333-444444444444")
    assert config.extension_origins == [
        f"chrome-extension://{OURS}",
        f"moz-extension://{'a' * 8}-1111-2222-3333-444444444444",
    ]


def test_an_id_list_does_not_admit_a_neighbour() -> None:
    """Naming one extension must not name another."""
    config = Settings(**PROD, verify_extension_ids=OURS)
    assert f"chrome-extension://{THEIRS}" not in config.extension_origins
    assert_cors_is_pinned(config)


@pytest.mark.parametrize(
    "bad",
    [
        "too-short",
        "z" * 32,  # 'z' is outside the a-p alphabet a real ID uses
        "abcdefghijklmnopabcdefghijklmno",  # 31 chars
        "abcdefghijklmnopabcdefghijklmnopq",  # 33 chars
        "https://gigai.tools",  # wrong scheme — belongs in CORS_ORIGINS
        "chrome-extension://not-a-real-id",
    ],
)
def test_malformed_ids_fail_loudly(bad: str) -> None:
    """A typo must not fail open into 'the extension is mysteriously blocked'.

    That failure mode is what tempts an operator into widening the regex.
    """
    with pytest.raises(ValueError):
        Settings(verify_extension_ids=bad)


def test_ids_are_normalised_and_deduplicated() -> None:
    config = Settings(verify_extension_ids=f"{OURS.upper()},chrome-extension://{OURS}/")
    assert config.extension_origins == [f"chrome-extension://{OURS}"]


# ── the wired-up app ─────────────────────────────────────────────────────────


def test_the_app_sends_the_extension_origin_back(monkeypatch: pytest.MonkeyPatch) -> None:
    """End to end: a named extension gets an ACAO header, an unnamed one does not."""
    from fastapi.testclient import TestClient

    import app.main as main

    monkeypatch.setattr(main, "settings", Settings(**PROD, verify_extension_ids=OURS))
    client = TestClient(main.create_app())

    allowed = client.get("/api/health", headers={"Origin": f"chrome-extension://{OURS}"})
    assert allowed.headers.get("access-control-allow-origin") == f"chrome-extension://{OURS}"

    denied = client.get("/api/health", headers={"Origin": f"chrome-extension://{THEIRS}"})
    assert "access-control-allow-origin" not in denied.headers
