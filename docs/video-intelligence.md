---
description: "How Video Intelligence works: in-browser Whisper transcription, chapters, keywords, entities and captions, built as pure functions over plain data with no upload."
---

# Video Intelligence: architecture and developer guide

Live at `/video-intelligence`. Shipped 2026-08-03.

A transcription and analysis workspace that runs entirely in the browser. This
document covers what it is, what it deliberately is not, how it's put together,
and how to extend it.

---

## 1. Scope, and why it stops where it does

The original brief asked for summarisation, AI chat, translation into 100+
languages, multi-perspective summaries, content generation and sentiment. **None
of those shipped, on purpose.**

Every one of them requires a hosted large language model. gigai.tools is a static
export (`output: "export"` in `next.config.ts`) with no application backend, but
more importantly, sending a transcript to a third-party model would break the
single promise the site is built on: *your file never leaves your device*. An "AI
Summary" button that quietly uploads a confidential meeting transcript is worse
than no button.

So the tool ships what can be delivered honestly on-device, and the UI says
plainly why the rest isn't there (see the FAQ in
`config/tools/video/video-intelligence.ts`).

| Capability | Status | Why |
| --- | --- | --- |
| Transcription | ✅ Whisper via transformers.js (WebGPU/WASM) | Runs locally |
| Transcript editing, search, speakers | ✅ | Pure client state |
| Sections, keywords, entities, graph | ✅ Deterministic | Statistics + pattern matching |
| Analytics | ✅ Measured | Arithmetic over the transcript |
| Exports (8 formats) | ✅ | Pure string generation |
| Screen / camera capture | ✅ MediaRecorder | Native browser API |
| Summarisation, chat, translation | ❌ Not shipped | Needs a hosted LLM → would upload your data |
| People / company recognition | ❌ Not shipped | Needs NER; regex would label "Monday" a person |
| Sentiment | ❌ Not shipped | Needs a model; keyword heuristics are not sentiment |
| YouTube / Vimeo / Drive import | ❌ Not viable | Needs server-side download; breaches their terms |

If an LLM backend is ever funded, the seam to extend is `ExportContext` in
`lib/video-intel/exports.ts` plus a new panel; the data model already carries
everything a summariser would need.

---

## 2. Layout

```
lib/video-intel/
  types.ts        Data model + Cue↔Segment conversion + formatClock/countWords
  analyze.ts      TF-IDF keywords, regex entities, co-occurrence graph, analytics
  chapters.ts     Structural segmentation from pauses / speaker changes
  exports.ts      TXT MD HTML CSV JSON XML (SRT/VTT delegated to lib/subtitles)
  transcribe.ts   Whisper pipeline + audio decode (WebAudio → ffmpeg fallback)

hooks/use-video-intel.ts        Document state, undo/redo, derived memos

components/tool/video-intel/
  player.tsx          <video>-based player, shortcuts, chapter/bookmark markers
  transcript-view.tsx Windowed transcript list, inline editing, highlighting
  panels.tsx          Chapters, speakers, keywords, entities, graph, analytics, bookmarks

modules/tools/video/video-intelligence-tool.tsx   Workspace assembly
config/tools/video/video-intelligence.ts          Tool config / page copy / SEO
scripts/test-video-intel.ts                       41 engine tests
```

### Key design decisions

**`Segment extends Cue`.** The data model builds on the `Cue` type already used
by the subtitle tools, so SRT/VTT import and export reuse `lib/subtitles.ts`
rather than growing a second parser that would drift. `exports.ts` delegates both
caption formats there, so caption timings can never disagree between the two
features.

**Derived state is never stored.** `transcript` is the single source of truth.
Chapters, keywords, entities, graph and analytics are all `useMemo` in
`use-video-intel.ts`. Editing a segment invalidates them automatically; there is
no cache to go stale.

**Undo snapshots the document, not the action.** Every mutation goes through
`commit()`, which pushes the previous `Transcript` onto a 50-deep stack. New
mutations get undo for free.

**The engine is DOM-free.** `lib/video-intel/*` (except `transcribe.ts`, which
touches Web Audio) is pure functions over plain data, which is why it can be
unit-tested directly and could move into a Web Worker unchanged.

---

## 3. Transcription pipeline

```
File
 └─ toPcm()                  WebAudio decodeAudioData → OfflineAudioContext
      │                      (mono, resampled to 16kHz)
      └─ on failure ────────► ffmpeg.wasm extracts WAV, then decode again
 └─ pipeline("automatic-speech-recognition", model)   lazy-imported
      │                      model cached in-module and by the browser
      └─ return_timestamps: true   ← REQUIRED
 └─ chunksToSegments()       seconds → ms, drops empties, clamps the tail
```

`return_timestamps` is not optional. Without it Whisper returns one undivided
blob of text, and seeking, chapters, keyword timestamps and captions all depend
on knowing when each phrase was said.

The WebAudio path handles anything the browser can decode (MP4, WebM, MP3, WAV,
M4A). MKV and AVI throw, and fall through to ffmpeg.wasm, which is why the
~30MB ffmpeg core is lazy-imported and only pulled in when actually needed.

**Models** are declared in `MODELS`. Sizes shown in the UI before the user
commits to a download.

---

## 4. Performance

- **Shared bundle is unchanged at 109 kB.** transformers.js (9.1 MB) and
  ffmpeg.wasm are both `await import(...)`, verified after build that neither
  appears in the shared chunks, only in separate lazy ones.
- **The transcript list is windowed.** `transcript-view.tsx` renders only the
  visible slice plus 8 rows of overscan, with spacer divs preserving scroll
  height. A 100k-word transcript mounts a few dozen rows, not thousands.
- **The expensive passes are memoised on `segments`**, so seeking, switching tabs
  or playing does not re-run TF-IDF.
- `pipelines` is a module-level `Map`, so a second transcription in the same
  session skips model construction entirely.

**Honest ceiling:** roughly 3–10× realtime on WebGPU, below realtime on WASM. The
UI warns past `MAX_COMFORTABLE_MS` (20 min) rather than letting someone start a
job that runs for an hour.

---

## 5. Accessibility

- Every `<select>` and `<input>` has an associated `<label>` (`sr-only` where the
  design has no room for visible text).
- All 17 interactive controls carry an accessible name via `aria-label`, visible
  text, or an `sr-only` label.
- `focus-visible:ring-2` on every focusable control (24 occurrences).
- The player is a labelled `role="group"` with `tabIndex={0}`; shortcuts are
  scoped to it so they can't hijack typing in the transcript editor.
- Tabs use `role="tablist"` / `role="tab"` / `aria-selected`.
- Transcript editing is reachable without a mouse: the per-row Edit button lives
  in a `focus-within:opacity-100` group, so it appears on keyboard focus as well
  as hover. (Double-click is a shortcut, not the only route.)
- All three animations are guarded with `motion-reduce:animate-none`, matching
  the convention used elsewhere in the codebase.

---

## 6. Testing

```bash
npx tsx scripts/test-video-intel.ts     # 41 assertions, exits non-zero on failure
```

Covers keyword ranking and stopword rejection, all 11 entity types plus
non-overlap and implausible-match rejection, chapter splitting and the
anti-fragmentation merge, analytics invariants (ratios sum to 1, shares sum to
1), SRT round-tripping through the shared parser, CSV quote/comma escaping, XML
metacharacter escaping, and clock formatting edge cases.

The suite caught two real bugs before any UI existed: a `%` regex that could
never match (`\b` after a non-word character), and an incorrect word-count
expectation that turned out to be my arithmetic rather than the engine's.

Not covered by automated tests: the Whisper pipeline itself (needs a real model
download and a browser) and the MediaRecorder capture paths. Both are manual-test
only (see below).

---

## 7. Manual QA checklist

- [ ] Drop an MP4 → player loads, duration shows
- [ ] Transcribe with `whisper-tiny.en` → progress bar advances through download
      then transcription; segments appear
- [ ] Click a transcript line → player seeks; active line highlights while playing
- [ ] Double-click a line → edit, blur → text persists; Undo reverts it
- [ ] Add two speakers, assign lines, merge one into the other
- [ ] Press `B` with the player focused → bookmark appears on the scrubber
- [ ] Search the transcript → matches highlight, non-matches filter out
- [ ] Export each of the 8 formats → files download and open correctly
- [ ] Import an SRT → workspace populates without any model download
- [ ] Record screen and camera → capture lands in the workspace
- [ ] Test at 375px, 768px, 1280px, 1920px
- [ ] Tab through the whole workspace with no mouse
- [ ] With `prefers-reduced-motion: reduce`, confirm nothing spins or pulses

---

## 8. Extending it

**Add an export format:** add to `ExportFormat`, write a `toX()` in
`exports.ts`, add its MIME to the `MIME` map and a case to the switch, then add
it to `EXPORTS` in the tool component. Add a test asserting escaping.

**Add an entity type:** add to `EntityType` in `types.ts`, add a pattern to
`PATTERNS` in `analyze.ts` (**order matters**: earlier patterns claim character
spans first), add a label to `ENTITY_LABEL` in `panels.tsx`, and add a test
including a rejection case.

**Add a speech model:** append to `MODELS` in `transcribe.ts` with an honest
`sizeMb`; that figure is shown to the user before they commit to a download.

**Do not** add a heuristic that imitates a model. If a feature needs an LLM, it
needs an LLM; the value of this tool is that everything it claims is true.
