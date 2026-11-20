"""Security tests for the Video → Work endpoints.

Run from ``backend/``:  python3 tests/test_video_work_guards.py

Dependency-free by design (no pytest, matching the repo's frontend harness) and
it stubs only ``app.core.config`` so it runs without the full dependency tree —
the guard code under test is exactly what ships.

The focus is the two places untrusted input reaches the server: a user-supplied
URL that we then fetch from our own network (SSRF), and browser-supplied frame
bytes. Both are fenced, and these assertions are what keeps them fenced.
"""
import sys, types, pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

# Stub app.core.config so the modules import without pydantic-settings.
fake_settings = types.SimpleNamespace(
    anthropic_api_key="",
    video_work_model="claude-opus-5",
    video_fetch_enabled=True,
    groq_api_key="",
    groq_model="qwen/qwen3.6-27b",
    video_fetch_max_mb=600,
    video_fetch_max_minutes=90,
    video_fetch_concurrency=2,
)
# Import the REAL app package, then shadow only the settings module so the
# guard code under test is exactly what ships.
import app, app.core  # noqa: E402
core = types.ModuleType("app.core.config"); core.settings = fake_settings
sys.modules["app.core.config"] = core

from app.services import video_fetch as vf

ok = fails = 0
def check(name, cond, detail=""):
    global ok, fails
    if cond: ok += 1; print(f"  PASS  {name}")
    else: fails += 1; print(f"  FAIL  {name}{' — ' + detail if detail else ''}")

def refused(url):
    try:
        vf._host_of(url); return False
    except vf.FetchError:
        return True

print("\nhost allowlist")
check("allows loom", vf._host_of("https://www.loom.com/share/x")[1] == "loom")
check("allows youtube", vf._host_of("https://youtu.be/x")[1] == "youtube")
check("allows vimeo", vf._host_of("https://vimeo.com/1")[1] == "vimeo")
check("allows a direct media path", vf._host_of("https://cdn.example.com/a.mp4")[1] == "direct")
check("refuses an arbitrary host", refused("https://evil.example.com/page"))
check("refuses file://", refused("file:///etc/passwd"))
check("refuses gopher://", refused("gopher://x/1"))
check("refuses a hostless URL", refused("https:///a.mp4"))
check("is not fooled by a suffix lookalike", refused("https://notloom.com/share/x"))
check("allows a real loom subdomain", vf._host_of("https://cdn.loom.com/x.mp4")[1] == "loom")

print("\nprivate-address refusal")
def private_refused(host):
    try:
        vf._assert_public(host); return False
    except vf.FetchError:
        return True

check("refuses localhost", private_refused("localhost"))
check("refuses 127.0.0.1", private_refused("127.0.0.1"))
check("refuses 10.x private space", private_refused("10.0.0.1"))
check("refuses 192.168.x", private_refused("192.168.1.1"))
check("refuses 172.16.x", private_refused("172.16.0.1"))
check("refuses the cloud metadata endpoint", private_refused("169.254.169.254"))
check("refuses IPv6 loopback", private_refused("::1"))
check("refuses 0.0.0.0", private_refused("0.0.0.0"))

print("\nfilename safety")
check("strips path separators", "/" not in vf._download_name("../../etc/passwd", ".mp4"))
check("keeps an extension", vf._download_name("clip", ".mp4").endswith(".mp4"))
check("defaults an empty extension", vf._download_name("clip", "").endswith(".mp4"))
check("falls back for an empty title", vf._download_name("", ".mp4") == "recording.mp4")
check("drops quotes and semicolons", vf._download_name('a";x', ".mp4") == "ax.mp4", vf._download_name('a";x', ".mp4"))
# A real Loom test surfaced this: an ASCII-only allowlist erased non-Latin
# titles entirely, so every Hindi-titled recording came back as "recording.mp4"
# and the workspace labelled them all "Recording".
_hindi = "वेबसाइट अपडेट्स, टैग्स और मैप इश्यूज"
check("preserves non-Latin titles", vf._download_name(_hindi, ".mp4").startswith("वेबसाइट"),
      vf._download_name(_hindi, ".mp4"))
check("still blocks traversal in unicode titles",
      "/" not in vf._download_name("../../etc/" + _hindi, ".mp4") and
      not vf._download_name("../../etc/" + _hindi, ".mp4").startswith("."))
check("strips CR/LF header injection", "\n" not in vf._download_name("a\r\nX-Evil: 1", ".mp4"))
check("a title of only punctuation still yields a name",
      vf._download_name('"";;', ".mp4") == "recording.mp4", vf._download_name('"";;', ".mp4"))

print("\nyt-dlp options are locked down")
opts = vf._ydl_options(pathlib.Path("/tmp/x"), download=True)
check("no playlists", opts["noplaylist"] is True)
check("no post-processors", opts["postprocessors"] == [])
check("no browser cookies", opts["cookiesfrombrowser"] is None)
check("no cache dir", opts["cachedir"] is False)
check("size cap applied", opts["max_filesize"] == vf.MAX_BYTES)
check("errors are not ignored", opts["ignoreerrors"] is False)

print("\nprovider selection")
from app.services import video_work as vw

check("no provider when neither key is set", vw.active_provider() == "")
check("analysis reports unavailable with no key", vw.analysis_available() is False)

fake_settings.groq_api_key = "gsk_test"
check("groq is used when it is the only key", vw.active_provider() == "groq")
check("groq counts as available", vw.analysis_available() is True)

fake_settings.anthropic_api_key = "sk-ant-test"
# Paid capacity must win — a deployment that bought Anthropic should never
# silently drop to a shared free tier.
check("anthropic wins when both are set", vw.active_provider() == "anthropic")

# Groq hard-caps at 5 images per request and meters tokens per minute.
check("groq frame budget respects the API cap", vw.GROQ_MAX_FRAMES < 5)
check("groq sends fewer frames than anthropic", vw.max_frames_for("groq") < vw.max_frames_for("anthropic"))
check("anthropic keeps the full frame budget", vw.max_frames_for("anthropic") == vw.MAX_FRAMES)
# The browser captures at 1280px; three of those overran the 8k ceiling and
# every free-tier analysis failed with a 413. Groq must advertise a downscale.
check("groq advertises a frame pixel budget", vw.max_frame_px_for("groq") > 0)
check("groq budget is well under the browser's 1280px capture", vw.max_frame_px_for("groq") <= 900)
check("anthropic sends frames untouched", vw.max_frame_px_for("anthropic") == 0)

# Groq has only JSON *mode*, not strict schemas, so the shape must be in the prompt.
instruction = vw._schema_instruction()
check("schema instruction names every finding field",
      all(f in instruction for f in vw.FINDING_FIELDS_ORDER))
check("schema instruction forbids markdown fences", "no markdown fence" in instruction)
check("field order matches the JSON schema",
      set(vw.FINDING_FIELDS_ORDER) == set(s_schema_fields := set(
          vw.ANALYSIS_SCHEMA["properties"]["findings"]["items"]["required"])),
      str(set(vw.FINDING_FIELDS_ORDER) ^ s_schema_fields))

# A live 413 taught this: Groq's free tier counts RESERVED output against the
# same ~8k/min ceiling as the input, so a large max_tokens made every request
# impossible regardless of prompt size. Keep the whole budget well inside it.
check("groq output budget fits the free-tier ceiling", vw.GROQ_MAX_TOKENS <= 4000)
check("compact instruction stays small",
      len(instruction) < 2000, f"{len(instruction)} chars")
# input ~= system + instruction + transcript + 4 images(~780 each)
_est = (len(vw.SYSTEM_PROMPT) + len(instruction)) / 4 + 500 + vw.GROQ_MAX_FRAMES * 800
check("estimated input + output stays under 8k tokens",
      _est + vw.GROQ_MAX_TOKENS < 8000, f"est {_est + vw.GROQ_MAX_TOKENS:.0f}")

fake_settings.anthropic_api_key = ""
fake_settings.groq_api_key = ""
# fetching_available() must track whether yt-dlp can be imported: the graceful
# degrade path in a bare environment, the happy one once requirements.txt is in.
import importlib.util

_has_ytdlp = importlib.util.find_spec("yt_dlp") is not None
check("fetching availability matches whether yt-dlp is installed", vf.fetching_available() is _has_ytdlp)

# Frame decoding is the one place browser bytes enter the service.
check("rejects a non-image data url", vw._decode_frame("data:text/html;base64,PHNjcmlwdD4=") is None)
check("rejects a bare string", vw._decode_frame("not-a-data-url") is None)
check("rejects malformed base64", vw._decode_frame("data:image/jpeg;base64,!!!!") is None)
tiny = "data:image/jpeg;base64," + "/9j/4AAQSkZJRg=="
check("accepts a valid jpeg data url", vw._decode_frame(tiny) is not None)
check("normalises image/jpg to image/jpeg",
      (vw._decode_frame("data:image/jpg;base64," + "/9j/4AAQSkZJRg==") or ("",""))[0] == "image/jpeg")

print("\nerror messages are actionable")
# The distinction that matters is retryable vs not. A live run against an
# out-of-credit account surfaced this: a 400 fell through to "Please try again",
# sending the user round a loop that could never succeed.
class _Err(Exception):
    def __init__(self, status, msg):
        super().__init__(msg)
        self.status_code = status

credit = vw._readable_error(_Err(400, "Your credit balance is too low to access the Anthropic API."))
check("names an out-of-credit account", "credit" in credit.lower())
check("does not tell the user to retry a billing failure", "try again" not in credit.lower(), credit)
check("reassures that local work survived", "exportable" in credit.lower())

auth = vw._readable_error(_Err(401, "invalid x-api-key"))
check("names a rejected key", "key was rejected" in auth.lower())
check("rate limit stays retryable", "retry" in vw._readable_error(_Err(429, "rate limited")).lower())
check("5xx stays retryable", "retry" in vw._readable_error(_Err(503, "overloaded")).lower())
check("oversized payload suggests trimming", "trim" in vw._readable_error(_Err(413, "too large")).lower())
check(
    "generic failure no longer promises a retry helps",
    "try again" not in vw._readable_error(_Err(None, "boom")).lower(),
)
# The fallbacks-beta retry must not swallow a billing 400.
check("billing 400 is not mistaken for a beta rejection",
      vw._is_beta_rejection(_Err(400, "Your credit balance is too low.")) is False)
check("beta 400 is detected",
      vw._is_beta_rejection(_Err(400, "unsupported beta: server-side-fallback")) is True)

print("\nschema shape")
s = vw.ANALYSIS_SCHEMA
check("root is closed", s["additionalProperties"] is False)
f = s["properties"]["findings"]["items"]
check("finding object is closed", f["additionalProperties"] is False)
check("every finding property is required", set(f["required"]) == set(f["properties"]))
check("no unsupported numeric constraints", not any(
    k in str(f) for k in ("minimum", "maximum", "minLength", "maxLength", "multipleOf")))
check("confidence is an integer", f["properties"]["confidence"]["type"] == "integer")
check("type is an enum of 9", len(f["properties"]["type"]["enum"]) == 9)

# ── Contract drift ────────────────────────────────────────────────────────────
# This schema is mirrored in lib/video-work/contract.ts, because the Ollama path
# runs in the browser with no server and the Claude path runs here. The two
# cannot import from each other, so this pins the shared field list on both
# sides: change one without the other and a suite fails instead of the providers
# silently diverging.
EXPECTED_FINDING_FIELDS = {
    "id", "type", "title", "priority", "confidence", "area", "description",
    "observed", "expected", "steps_to_reproduce", "client_statement",
    "interpretation", "timestamp_ms", "frame_time_ms", "acceptance_criteria",
    "dependencies", "needs_confirmation",
}
check("finding fields match the TypeScript contract",
      set(f["required"]) == EXPECTED_FINDING_FIELDS,
      str(set(f["required"]) ^ EXPECTED_FINDING_FIELDS))

EXPECTED_SUMMARY_FIELDS = {
    "overview", "what_client_wants", "what_is_broken", "risks", "recommended_order",
}
summary = s["properties"]["summary"]
check("summary fields match the TypeScript contract",
      set(summary["required"]) == EXPECTED_SUMMARY_FIELDS,
      str(set(summary["required"]) ^ EXPECTED_SUMMARY_FIELDS))

# The uncertainty rule is the product, not a nicety — assert it survives edits.
check("prompt keeps the uncertainty rule", "THE RULE THAT MATTERS MOST" in vw.SYSTEM_PROMPT)
check("prompt tells the model to score low when guessing",
      "below 50 when you are genuinely guessing" in vw.SYSTEM_PROMPT)

print(f"\n{ok} passed, {fails} failed\n")
sys.exit(1 if fails else 0)
