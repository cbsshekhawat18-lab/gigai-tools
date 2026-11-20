---
description: "How Video to Work turns a client call or screen recording into tickets: in-browser transcription, the hosted and local analysis paths, the SSRF-fenced link fetcher and the export format."
---

# Video → Work

Turns a client screen recording into developer-ready findings: bugs, feature
requests, design changes, questions and decisions, each with acceptance
criteria, a screenshot, the client's verbatim sentence and the timestamp they
said it.

Live at `/video-to-work`.

---

## The one rule

**An uncertain reading is never presented as a settled requirement.**

Everything else in this document is implementation detail; this is the product.
The expensive failure in this workflow is not missing a request, it is building
a confident-looking ticket that misread a vague one. So three things are kept
structurally separate: in the data model, the UI, and every single export:

| | What it is |
|---|---|
| `evidence.clientStatement` | The client's own words, quoted verbatim. Never paraphrased. |
| `interpretation` | The model's reading of those words as an implementable change. |
| `confidence` + `needsConfirmation` | How sure it is, and whether a human must confirm. |

If you are changing this tool, the test is: can a developer reading your output
tell which half came from the client and which half a model inferred? If not,
the change is wrong regardless of how much nicer it reads.

`scripts/test-video-work.ts` asserts this invariant across Markdown, plain text,
JSON and the PDF. Those assertions are load-bearing; don't relax them.

---

## Architecture

```
BROWSER (always, on the user's own machine)
  file or fetched link
        │
        ├── probeMedia()          duration + poster, native <video>
        ├── transcribe()          Whisper via transformers.js  (lib/video-intel)
        ├── extractKeyFrames()    scene change + sharpness + aHash dedup
        └── ocrFrames()           tesseract.js on the chosen frames
                │
                │  transcript + selected JPEG frames   (NEVER the video)
                ▼
        ┌───────┴────────────────────────────────┐
        │                                        │
   LOCAL provider                          SERVER provider
   lib/video-work/ollama.ts                POST /api/video-work/analyze
   browser → http://localhost:11434        our backend → Claude
   Qwen2.5-VL etc, `format` = JSON schema  structured outputs
   NOTHING leaves the device               evidence sent, then discarded
        │                                        │
        └───────┬────────────────────────────────┘
                ▼
BROWSER
        mapAnalysisPayload()   shared clamping, provider-specific confidence floor
        mergeFindings()        re-id, dedupe, detect change / repeat / contradiction
        IndexedDB              findings + transcript + frames.  Never the video.
```

### Two providers, one contract

`lib/video-work/provider.ts` picks between them. **`decideProvider()` is the
rule that matters**: an explicit `local` choice never silently falls back to the
server. Shipping a client's transcript to a server the user deliberately opted
out of would be the worst bug this tool could have, so only `auto` substitutes,
and it prefers local.

| | Local (Ollama) | Hosted (Groq) | Hosted (Claude) |
|---|---|---|---|
| Cost to the site | £0 at any traffic | £0, shared free tier | Per-analysis spend |
| Visitor setup | Install Ollama | None | None |
| Leaves the device | Nothing | Transcript + frames | Transcript + frames |
| Works offline | Yes | No | No |
| Quality | Rougher | Middling | Sharpest |
| Confidence floor | 70 | 50 | 50 |
| Frames sent | 8 | **4** (API caps at 5) | 18 |
| Limits | None | ~30 RPM / 6k TPM **org-wide** | Billing |
| Trains on your data | n/a | No (account-wide policy) | No |

`active_provider()` picks the hosted one: **Anthropic wins when both keys are
set**: a deployment that has paid for capacity should never silently drop to a
shared free tier.

Groq is the cold-visitor bridge: it works with zero setup, which local can't,
but its free limits are **organisation-level**, so every visitor draws on the
same allowance. It is a trial path, not a scalable one, and the UI says so
("Shared limit" badge) rather than implying unlimited hosted analysis.

The **confidence floor** is the honest part. A 7B model reads the same evidence
less reliably, so more of its output deserves a human glance. We do *not* touch
the model's own scores; we raise the bar at which a finding counts as settled.
That is a property of the reader, not of the client's request.

### Why a hosted option exists at all

Turning *"this button looks weird, make it smaller and move it down"* into a
change with a named element and testable acceptance criteria requires a language
model. The alternative (pattern-matching phrases with regex and calling it AI)
produces confident nonsense, which is worse than useless when someone builds
from it. Users who want zero egress have the local path; users who want the
sharpest output have the hosted one. Both are stated plainly on the page.

### Browser → localhost, and why it works

`http://localhost` and `127.0.0.1` are *potentially trustworthy origins* in the
mixed-content spec, so an HTTPS page is **not** blocked from calling them. The
only thing the user must do is let Ollama accept our origin, since it allows
localhost callers by default:

```sh
OLLAMA_ORIGINS=https://gigai.tools ollama serve
```

`checkOllama()` distinguishes "not running" from "running but refusing our
origin", because the fixes are completely different and a generic "couldn't
connect" sends people down the wrong path.

`lib/video-intel` (the Video Intelligence tool) provides transcription, frame
selection and OCR. Video → Work builds on it rather than beside it; if you are
fixing a transcription or frame-selection bug, it belongs there.

### The contract is mirrored, on purpose

`lib/video-work/contract.ts` (TS) and `backend/app/services/video_work.py`
(Python) hold the same prompt and JSON schema. They cannot import from each
other: the Ollama path runs in a browser with no server, the Claude path runs
in Python. **Both test suites pin the same field list**, so changing one without
the other fails a test instead of silently diverging.

---

## Files

| Path | Role |
|---|---|
| `lib/video-work/types.ts` | Domain model, stats, intent map, implementation ordering |
| `lib/video-work/ingest.ts` | File + URL validation, provider detection, server fetch client |
| `lib/video-work/pipeline.ts` | Six-stage orchestration with measured progress |
| `lib/video-work/contract.ts` | Prompt + JSON schema, mirrored in Python, drift-tested |
| `lib/video-work/provider.ts` | Provider selection; `decideProvider()` is the no-silent-fallback rule |
| `lib/video-work/ollama.ts` | Local analysis in the browser against the user's own Ollama |
| `lib/video-work/analyze.ts` | Hosted-analysis client + the shared `mapAnalysisPayload` clamping |
| `lib/video-work/merge.ts` | Multi-video reconciliation: change, repeat, conflict detection |
| `lib/video-work/exports.ts` | Markdown, handoff, JSON, TXT |
| `lib/video-work/report.ts` | PDF report markup |
| `lib/video-work/storage.ts` | IndexedDB persistence + retention + delete |
| `components/tool/video-work/*` | Workspace UI |
| `modules/tools/video/video-to-work-tool.tsx` | The workspace itself |
| `config/tools/video/video-to-work.ts` | Registry entry (routes, SEO, FAQ generated from it) |
| `backend/app/services/video_work.py` | Prompt, output schema, model call |
| `backend/app/services/video_fetch.py` | yt-dlp retrieval + SSRF guards |
| `backend/app/api/video_work.py` | The four routes |

---

## API

All under `/api/video-work`.

### `GET /status`

Capability probe. The frontend is a static export that can be served with no
backend at all, so the workspace asks first and shows an honest "analysis isn't
configured" state instead of failing at the end of a long local transcription.

```json
{ "configured": true, "model": "claude-opus-5", "max_frames": 18,
  "max_transcript_chars": 120000, "fetch_enabled": true,
  "max_fetch_minutes": 90, "max_fetch_mb": 600 }
```

### `POST /analyze`

Transcript + frames → findings. Nothing is persisted.

Frames arrive as JPEG data URLs and are strictly validated (`_decode_frame`):
this is the one place browser-supplied bytes enter the service.

### `POST /resolve` and `POST /fetch`

URL ingestion. `resolve` inspects without downloading (fast; catches private
Looms, expired links, live streams and over-long recordings); `fetch` downloads
to a temp dir, streams it back, and a `BackgroundTask` deletes it the moment
streaming finishes.

---

## Security

### SSRF: read this before touching `video_fetch.py`

Fetching a user-supplied URL from our own network is a classic SSRF vector. Four
fences, all in `_guard()`:

1. **Scheme check**: http/https only.
2. **Host allowlist**: the providers we support, plus links whose path ends in
   a media extension. An arbitrary host is refused before any network call.
3. **Address inspection**: every address the hostname resolves to must be
   public. Loopback, RFC1918, link-local (including `169.254.169.254`, the cloud
   metadata endpoint an SSRF would target), reserved and multicast are refused.
   *All* resolved addresses are checked, not just the first.
4. **Hard caps**: 90 minutes, 600MB, 240s wall clock, 2 concurrent fetches.

yt-dlp is called as a library with no shell, no playlists, no post-processors,
no browser cookies and no cache. `_download_name` strips anything that could be
a path separator or a header injection.

`backend/tests/test_video_work_guards.py` covers all of it. Run it after any
change here:

```sh
cd backend && python3 tests/test_video_work_guards.py
```

### Data handling

- The video file is **never written to disk on the server** except in the
  fetch path, where it lives in a per-request temp dir and is deleted on
  response completion.
- The video is **never stored in the browser** either. Findings, transcript and
  frames go to IndexedDB; the file stays an object URL and dies with the tab.
  Client recordings routinely contain admin panels, customer records and
  inboxes; keeping one in browser storage past the session is not a trade worth
  making for the convenience of resuming playback.
- No transcript or frame content is logged, at any level.
- Users can switch retention to session-only (which deletes what is already
  stored) or delete everything, from the Export tab.

---

## Configuration

**Current deployment: local-only, by choice.**

`ANTHROPIC_API_KEY` is deliberately empty. A free public tool cannot carry an
unbounded per-visitor API bill, and a local model costs nothing regardless of
traffic, so analysis runs on each visitor's own machine. While the key is
absent the UI never advertises a hosted option; it presents Ollama as *the*
path rather than showing a permanently-greyed "Not configured" card, which
would read as a half-finished product.

**To turn the paid tier on later**, drop a key in `backend/.env` and restart.
No code change: `/status` starts reporting `configured: true`, the provider
panel grows a second card and an automatic-choice control, and `decideProvider`
starts offering both.

```sh
ANTHROPIC_API_KEY=                  # empty → paid tier off (current state)
VIDEO_WORK_MODEL=claude-opus-5      # used only when the above is set
GROQ_API_KEY=                       # optional free hosted tier for cold visitors
GROQ_MODEL=qwen/qwen3.6-27b         # Groq's vision model; max 5 images/request
VIDEO_FETCH_ENABLED=true            # yt-dlp link fetching: bandwidth only, no API cost
```

**Groq implementation notes.** It is OpenAI-compatible, so `_analyze_groq()` is
a plain `httpx` POST, no extra SDK. Two differences from the Anthropic path:

1. **No strict schema.** Groq offers JSON *mode*, which guarantees valid JSON
   but not our shape, so `_schema_instruction()` puts the schema in the prompt
   and the result is validated defensively. Accepting a looser provider is only
   safe because `mapAnalysisPayload` clamps every field client-side.
2. **Four frames, not eighteen.** Five images is a hard API cap and the free
   tier meters tokens per minute, where images are the expensive part. The
   client reads `max_frames` from `/status` and trims *before* uploading, so a
   visitor doesn't spend bandwidth on frames the server would drop.

**Local (nothing to configure server-side: it is the user's own machine):**

```sh
ollama pull qwen2.5vl:7b                      # ~6GB, once
OLLAMA_ORIGINS=https://gigai.tools ollama serve
```

Every capability degrades independently and visibly. With no Ollama the tool
still transcribes and extracts screenshots locally and shows the setup steps
inline. With fetching off, the URL field explains that and points at file upload.

Note `serverSide: false` in the registry entry: with analysis local, the shared
privacy badges ("Runs in your browser", "No uploads", "Nothing stored") are
literally true. If you enable the hosted tier for a deployment where it is the
primary path, revisit that flag.

---

## The model call

`claude-opus-5`, adaptive thinking, `effort: high`, streamed (32K `max_tokens`
would otherwise risk an HTTP timeout), with **structured outputs** against
`ANALYSIS_SCHEMA` so the response is schema-validated and the model retries on
mismatch rather than us parsing prose.

Two things worth knowing if you change it:

- **`stop_reason` is checked before `content`.** A safety-classifier refusal
  returns HTTP 200 with empty or partial content; indexing `content[0]` blindly
  would crash. Refusals surface as a user-facing message with the transcript and
  screenshots preserved.
- **Server-side fallbacks are enabled** (`fallbacks: "default"`), with a graceful
  degrade if the beta isn't available on the key.

The prompt is in `SYSTEM_PROMPT`. The section that matters most is *"THE RULE
THAT MATTERS MOST"*: it is what makes the model score low confidence honestly
instead of rounding every reading up to certainty. Don't soften it.

`analyze.ts → toFinding()` clamps what the schema can't: confidence outside
0–100, a `frame_time_ms` matching no real frame (snapped to a frame within
1.5s, else null), self-dependencies, unknown enum values.

---

## Multi-video reconciliation

`mergeFindings()` runs on every added video and does three things:

1. **Re-numbers incoming findings.** The model numbers from `BUG-001` for every
   video, so a second video would collide with the first. Dependencies are
   repointed to match.
2. **Matches against existing findings** by token overlap (stopword-filtered
   Jaccard), boosted for a shared area and type.
3. **Classifies the relationship**: `repeated` (≥0.82 similarity, nothing new),
   `contradicted` (an opposing value from the same vocabulary: colour, size,
   position, visibility, state, alignment), or `changed`.

**It never picks a winner.** "Newest wins" is wrong often enough to be dangerous:
clients float an idea and walk it back, and the walk-back is sometimes the
earlier recording. Contradictions are surfaced with both statements and their
timestamps, and stay open until a human resolves them. Nothing is deleted
either; relationships are recorded alongside.

---

## Tests

```sh
npx tsx scripts/test-video-work.ts                     # 131 engine assertions
cd backend && python3 tests/test_video_work_guards.py  # 56 security + contract assertions
npx tsc --noEmit
```

The frontend suite covers merge/conflict logic, ordering (including cycles and
missing dependencies), stats, the intent map, export selection, the
evidence-and-uncertainty invariant across all four formats, HTML escaping in the
PDF, URL provider detection and normalisation, and file validation.

The model call itself is not mocked; mocking it would only assert that the mock
returns the mock. What *is* asserted is the part we control: that malformed
model output is clamped, and that uncertainty survives to every export.

---

## Known limits

- **Transcription speed is the bottleneck.** Whisper runs on the user's hardware:
  several times faster than realtime with WebGPU, slower without. Long
  recordings are a genuine wait; the UI says so rather than hiding it.
- **yt-dlp extractors break.** When a provider changes its player, fetching that
  provider fails until yt-dlp is updated. Keep the pin current. Failures are
  specific ("that recording is private") and always point at the file-upload
  path, which never breaks.
- **Frame selection is measured, not semantic.** It finds sharp, distinct,
  visually eventful frames. Knowing a chart from a whiteboard is the model's job,
  from the frame it's given.
- **Speaker labels are not produced.** Whisper does not diarise, and inventing
  "Speaker 1 / Speaker 2" would be fabrication.
- **Local models are meaningfully weaker.** Qwen2.5-VL 7B produces vaguer
  interpretations and noisier confidence than a frontier model, and occasionally
  returns wrong types (`null` where a string belongs), which is why
  `mapAnalysisPayload` treats every field as unknown. The 3B variant is rough
  enough that most of its output lands in "needs confirmation", which is the
  correct outcome rather than a bug.

---

## Not built yet, deliberately

- **Jira / Linear / GitHub Issues push.** The JSON export is the mapping layer,
  versioned (`EXPORT_SCHEMA_VERSION`) and carrying every field a tracker
  wants, including evidence and acceptance criteria. An integration is a
  mapping file, not a change to this tool.
- **Agent execution.** The Export tab has a "coming soon" panel. When built, the
  flow is: approved task → agent → test → screenshot → report back for review.
  Human approval stays a required step; nothing should ever run from an
  unconfirmed interpretation.
