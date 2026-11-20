/**
 * Video Intelligence: report generation.
 *
 * Turns a transcript plus captured frames into a shareable document.
 *
 * HONESTY BOUNDARY, enforced in the copy this file emits: nothing here is
 * written by a language model. Quotes are selected by keyword density, action
 * items by phrase patterns, and on-screen text by OCR. Each section in the
 * output says how it was derived, so a reader knows a "detected action item" is
 * a pattern match to verify. Not a machine that understood the meeting.
 *
 * The PDF path reuses `reportHtmlToPdfBlob` from lib/seo-tools/report-pdf.ts,
 * which renders inside an isolated iframe to dodge the html2canvas/oklch crash.
 * Styles below are therefore plain hex, never Tailwind tokens.
 */

import { extractKeywords } from "./analyze";
import { countWords, formatClock } from "./types";
import type { EntityHit, Keyword, Analytics, Transcript } from "./types";
import type { CapturedFrame } from "./frames";

export interface Quote {
  text: string;
  timeMs: number;
  speaker?: string;
  /** Keyword density that earned it a place. */
  score: number;
}

export interface ActionItem {
  text: string;
  timeMs: number;
  /** Which pattern matched. Shown so the reader can judge it. */
  cue: string;
}

/**
 * Commitment and task phrasings. Deliberately narrow: a loose pattern fills the
 * report with noise, which is worse than an empty section.
 */
const ACTION_CUES: ReadonlyArray<{ cue: string; re: RegExp }> = [
  { cue: "commitment", re: /\b(?:i'?ll|i will|we'?ll|we will)\s+\w+/i },
  { cue: "obligation", re: /\b(?:we|you|they)\s+(?:need to|have to|must|should)\s+\w+/i },
  { cue: "assignment", re: /\b(?:can you|could you|please)\s+\w+/i },
  { cue: "explicit", re: /\b(?:action item|to-?do|next step|follow[- ]up)\b/i },
  { cue: "deadline", re: /\b(?:by|before|due)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|end of (?:day|week|month)|\d{1,2}(?:st|nd|rd|th)?)\b/i },
  { cue: "recommendation", re: /\b(?:make sure|be sure to|don'?t forget|remember to)\b/i },
];

/** Sentences worth pulling out: substantial, keyword-dense, self-contained. */
export function extractQuotes(
  transcript: Transcript,
  keywords: Keyword[],
  limit = 8,
): Quote[] {
  const top = new Set(keywords.slice(0, 20).map((k) => k.term));
  if (top.size === 0) return [];

  const labelFor = (speakerId?: string) =>
    speakerId ? transcript.speakers.find((s) => s.id === speakerId)?.label : undefined;

  const scored: Quote[] = [];
  for (const segment of transcript.segments) {
    const words = countWords(segment.text);
    // Too short to stand alone; too long to quote.
    if (words < 8 || words > 60) continue;

    const tokens = segment.text.toLowerCase().split(/\W+/);
    const hits = tokens.filter((t) => top.has(t)).length;
    if (hits < 2) continue;

    scored.push({
      text: segment.text.trim(),
      timeMs: segment.start,
      speaker: labelFor(segment.speakerId),
      score: hits / Math.sqrt(words),
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Lines that read like a task or commitment. Pattern-matched, not understood. */
export function extractActionItems(transcript: Transcript, limit = 12): ActionItem[] {
  const items: ActionItem[] = [];
  const seen = new Set<string>();

  for (const segment of transcript.segments) {
    for (const { cue, re } of ACTION_CUES) {
      if (!re.test(segment.text)) continue;
      const text = segment.text.trim();
      const key = text.toLowerCase();
      if (seen.has(key)) break;
      seen.add(key);
      items.push({ text, timeMs: segment.start, cue });
      break;
    }
    if (items.length >= limit) break;
  }
  return items;
}

/* ── OCR ─────────────────────────────────────────────────────────────────── */

/** Tesseract's own confidence, below which output is noise more often than not. */
const OCR_MIN_CONFIDENCE = 70;

/**
 * Decide whether OCR output is real text or shredded pixels.
 *
 * Tesseract ALWAYS returns something. Pointed at a phone recording of a laptop
 * screen it emits things like `wld LLL SE Tr Tr, A~: NW0@D Ta Beri 8m`, which
 * a length check happily lets through and which then lands in a report the user
 * intends to send to clients. Two gates: tesseract's own confidence, and the
 * shape of the text. Real UI or slide text is mostly made of word-like tokens.
 */
export function isUsableOcr(text: string, confidence: number): boolean {
  if (!text || text.length < 15) return false;
  if (confidence < OCR_MIN_CONFIDENCE) return false;

  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return false;

  // A "word" here is 3+ characters and overwhelmingly letters.
  const wordLike = tokens.filter(
    (t) => t.length >= 3 && (t.match(/[A-Za-z]/g)?.length ?? 0) / t.length >= 0.8,
  );
  if (wordLike.length < 4) return false;
  return wordLike.length / tokens.length >= 0.5;
}

/**
 * Read on-screen text from captured frames with tesseract.js.
 *
 * One worker for all frames, initialising per frame dominates the runtime.
 * Lazy-imported so the OCR engine only downloads when a report is generated.
 */
export async function ocrFrames(
  frames: CapturedFrame[],
  onProgress?: (fraction: number, label: string) => void,
  signal?: AbortSignal,
): Promise<CapturedFrame[]> {
  if (frames.length === 0) return frames;
  const { createWorker } = await import("tesseract.js");

  let index = 0;
  const worker = await createWorker("eng", undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        const base = index / frames.length;
        onProgress?.(
          Math.min(0.999, base + m.progress / frames.length),
          `Reading on-screen text: frame ${index + 1} of ${frames.length}`,
        );
      }
    },
  });

  const out: CapturedFrame[] = [];
  try {
    for (index = 0; index < frames.length; index += 1) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const frame = frames[index]!;
      const { data } = await worker.recognize(frame.dataUrl);
      const text = (data.text ?? "").replace(/\s+/g, " ").trim();
      out.push({ ...frame, ocrText: isUsableOcr(text, data.confidence) ? text : undefined });
    }
  } finally {
    await worker.terminate();
  }
  return out;
}

/* ── document ────────────────────────────────────────────────────────────── */

export interface ReportInput {
  transcript: Transcript;
  analytics: Analytics;
  keywords: Keyword[];
  entities: EntityHit[];
  frames: CapturedFrame[];
  /** Optional summary the USER wrote. Never generated here. */
  userSummary?: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Frame nearest a timestamp, for chapter illustrations. */
function frameNear(frames: CapturedFrame[], timeMs: number): CapturedFrame | undefined {
  if (frames.length === 0) return undefined;
  return frames.reduce((best, f) =>
    Math.abs(f.timeMs - timeMs) < Math.abs(best.timeMs - timeMs) ? f : best,
  );
}

/**
 * Build the complete report as a self-contained HTML document.
 *
 * All styling is inline and hex-colored, `reportHtmlToPdfBlob` renders this in
 * an isolated iframe, and any `oklch()` would crash html2canvas.
 */
export function buildReportHtml(input: ReportInput): string {
  const { transcript, analytics, keywords, entities, frames, userSummary } = input;
  const quotes = extractQuotes(transcript, keywords);
  const actions = extractActionItems(transcript);
  const generated = new Date().toISOString().slice(0, 10);
  const cover = frames[0];

  const speakerLabel = (id?: string) =>
    id ? (transcript.speakers.find((s) => s.id === id)?.label ?? "") : "";

  const chapterSections = transcript.chapters
    .map((chapter, i) => {
      const shot = frameNear(frames, chapter.start);
      const lines = chapter.segmentIds
        .map((id) => transcript.segments.find((s) => s.id === id))
        .filter(Boolean)
        .slice(0, 6)
        .map((s) => `<p class="line"><span class="t">${formatClock(s!.start)}</span>${esc(s!.text)}</p>`)
        .join("");
      return `
      <section class="chapter">
        <h3>${i + 1}. ${esc(chapter.title)} <span class="stamp">${formatClock(chapter.start)} – ${formatClock(chapter.end)}</span></h3>
        ${shot ? `<img class="shot" src="${shot.dataUrl}" alt="Frame at ${formatClock(shot.timeMs)}">` : ""}
        ${chapter.keywords.length ? `<p class="tags">${chapter.keywords.map((k) => `<span>${esc(k)}</span>`).join("")}</p>` : ""}
        ${lines}
      </section>`;
    })
    .join("");

  const gallery = frames
    .map(
      (frame) => `
      <figure>
        <img src="${frame.dataUrl}" alt="Frame at ${formatClock(frame.timeMs)}">
        <figcaption>${formatClock(frame.timeMs)}${frame.ocrText ? ` - ${esc(frame.ocrText.slice(0, 120))}` : ""}</figcaption>
      </figure>`,
    )
    .join("");

  const transcriptBody = transcript.segments
    .map((s) => {
      const who = speakerLabel(s.speakerId);
      return `<p class="line"><span class="t">${formatClock(s.start)}</span>${who ? `<b>${esc(who)}: </b>` : ""}${esc(s.text)}</p>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(transcript.mediaName)}, Video Report</title>
<style>
 * { box-sizing: border-box; }
 body { margin:0; padding:40px; width:794px; font:12px/1.65 -apple-system,"Segoe UI",Roboto,sans-serif; color:#111827; background:#ffffff; }
 h1 { font-size:26px; margin:0 0 6px; letter-spacing:-.02em; }
 h2 { font-size:16px; margin:34px 0 10px; padding-bottom:6px; border-bottom:2px solid #6d28d9; color:#4c1d95; }
 h3 { font-size:13px; margin:20px 0 8px; }
.sub { color:#6b7280; margin:0 0 18px; font-size:12px; }
.cover { border-radius:10px; width:100%; max-height:340px; object-fit:cover; margin:12px 0 20px; }
.facts { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:14px 0 4px; }
.facts div { border:1px solid #e5e7eb; border-radius:8px; padding:8px 10px; }
.facts span { display:block; color:#6b7280; font-size:10px; text-transform:uppercase; letter-spacing:.05em; }
.facts b { font-size:15px; }
.note { background:#f5f3ff; border-left:3px solid #6d28d9; padding:8px 12px; margin:10px 0 0; font-size:11px; color:#4c1d95; }
.chapter { page-break-inside:avoid; margin-bottom:18px; }
.stamp { color:#6b7280; font-weight:400; font-size:11px; }
.shot { width:100%; max-height:300px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb; margin:6px 0 8px; }
.tags span { display:inline-block; background:#f3f4f6; border-radius:99px; padding:1px 8px; margin:0 4px 4px 0; font-size:10px; color:#374151; }
.line { margin:0 0 5px; }
.line.t { display:inline-block; min-width:52px; color:#6b7280; font-variant-numeric:tabular-nums; font-size:10px; }
 blockquote { margin:0 0 10px; padding:8px 12px; border-left:3px solid #d1d5db; background:#f9fafb; border-radius:0 6px 6px 0; }
 blockquote cite { display:block; margin-top:4px; color:#6b7280; font-size:10px; font-style:normal; }
 ul { margin:0; padding-left:18px; } li { margin-bottom:5px; }
.cue { color:#6d28d9; font-size:10px; text-transform:uppercase; letter-spacing:.04em; }
.grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
 figure { margin:0; page-break-inside:avoid; }
 figure img { width:100%; max-height:230px; object-fit:cover; border-radius:6px; border:1px solid #e5e7eb; }
 figcaption { color:#6b7280; font-size:9.5px; margin-top:3px; }
.foot { margin-top:34px; padding-top:10px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:10px; }
</style></head><body>

<h1>${esc(transcript.mediaName || "Video report")}</h1>
<p class="sub">Video report · ${formatClock(analytics.durationMs)} · generated ${generated} · gigai.tools</p>
${cover ? `<img class="cover" src="${cover.dataUrl}" alt="Cover frame">` : ""}

<h2>Quick facts</h2>
<div class="facts">
  <div><span>Duration</span><b>${formatClock(analytics.durationMs)}</b></div>
  ${analytics.words ? `<div><span>Words</span><b>${analytics.words.toLocaleString()}</b></div>` : ""}
  ${analytics.words ? `<div><span>Reading time</span><b>${analytics.readingMinutes} min</b></div>` : ""}
  ${transcript.chapters.length ? `<div><span>Sections</span><b>${transcript.chapters.length}</b></div>` : ""}
  ${transcript.speakers.length ? `<div><span>Speakers</span><b>${transcript.speakers.length}</b></div>`: ""}
 <div><span>Screenshots</span><b>${frames.length}</b></div>
</div>
<p class="note"><b>How this report was made.</b> ${transcript.segments.length ? "The transcript came from Whisper running in the browser. " : ""}Screenshots were chosen by scene-change and sharpness scoring, then de-duplicated. On-screen text was read by OCR. Quotes and action items below are selected by pattern and keyword density, <b>not written or interpreted by an AI</b>, so please verify anything you rely on.</p>

${userSummary ? `<h2>Summary</h2><p>${esc(userSummary).replace(/\n+/g, "</p><p>")}</p>` : ""}

${transcript.chapters.length ? `<h2>Sections</h2>${chapterSections}` : ""}

${
  quotes.length
    ? `<h2>Notable passages</h2>
<p class="sub">Selected by keyword density, the lines densest in this recording's dominant terms.</p>
${quotes.map((q) => `<blockquote>${esc(q.text)}<cite>${formatClock(q.timeMs)}${q.speaker ? ` · ${esc(q.speaker)}` : ""}</cite></blockquote>`).join("")}`
    : ""
}

${
  actions.length
    ? `<h2>Detected action items</h2>
<p class="sub">Lines matching common commitment and deadline phrasings. Pattern matches, not judgements; check each one.</p>
<ul>${actions.map((a) => `<li>${esc(a.text)} <span class="cue">${a.cue}</span> <span class="t">${formatClock(a.timeMs)}</span></li>`).join("")}</ul>`
    : ""
}

${
  keywords.length
    ? `<h2>Key terms</h2><p class="tags">${keywords.slice(0, 30).map((k) => `<span>${esc(k.term)} · ${k.count}</span>`).join("")}</p>`
    : ""
}

${
  entities.length
    ? `<h2>Detected details</h2><ul>${entities.slice(0, 20).map((e) => `<li><b>${esc(e.value)}</b> <span class="cue">${e.type}</span> <span class="t">${formatClock(e.times[0] ?? 0)}</span></li>`).join("")}</ul>`
    : ""
}

${frames.length ? `<h2>Visual gallery</h2><div class="grid2">${gallery}</div>` : ""}

${
  transcript.segments.length
    ? `<h2>Full transcript</h2>${transcriptBody}`
    : `<h2>Transcript</h2><p class="sub">No transcript was generated for this video, so this is a visual report: screenshots and any on-screen text only. Run Transcribe in the workspace and regenerate to include the spoken content, sections and notable passages.</p>`
}

<p class="foot">Generated by GigAI Video Intelligence: gigai.tools/video-intelligence. Processed entirely in the browser; the source video was never uploaded.</p>
</body></html>`;
}

/** Render the report to a PDF Blob, reusing the isolated-iframe renderer. */
export async function buildReportPdf(input: ReportInput): Promise<Blob> {
  const { reportHtmlToPdfBlob } = await import("@/lib/seo-tools/report-pdf");
  return reportHtmlToPdfBlob(buildReportHtml(input));
}
