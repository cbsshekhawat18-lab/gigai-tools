/**
 * Video Intelligence, export layer.
 *
 * SRT and VTT are NOT re-implemented here: segments narrow back to Cues and go
 * through the serialiser in lib/subtitles.ts that the subtitle tools already
 * use, so caption output can't drift between the two features.
 *
 * Everything returns a plain string plus its filename and MIME type, so the
 * caller can download it, put it in a ZIP or hand it to the workspace's file
 * chain without this file knowing anything about the DOM.
 */

import { serialise } from "@/lib/subtitles";
import type { Analytics, EntityHit, Keyword, Transcript } from "./types";
import { countWords, formatClock, segmentsToCues } from "./types";

export type ExportFormat =
  | "txt"
  | "md"
  | "html"
  | "csv"
  | "json"
  | "xml"
  | "srt"
  | "vtt";

export interface ExportFile {
  name: string;
  mime: string;
  body: string;
}

export interface ExportContext {
  transcript: Transcript;
  analytics?: Analytics;
  keywords?: Keyword[];
  entities?: EntityHit[];
}

export interface ExportOptions {
  /** Prefix each line with its start time. */
  timestamps?: boolean;
  /** Prefix each line with the speaker label. */
  speakers?: boolean;
  /** Include analytics/keywords/entities where the format can carry them. */
  includeAnalysis?: boolean;
}

const DEFAULTS: Required<ExportOptions> = {
  timestamps: true,
  speakers: true,
  includeAnalysis: true,
};

/** Escape the five XML/HTML metacharacters. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Quote a CSV field per RFC 4180 (double the quotes, wrap if needed). */
function csvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Safe, lowercase filename stem from the media name. */
function stem(transcript: Transcript): string {
  const base = transcript.mediaName.replace(/\.[^.]+$/, "").trim();
  const slug = base
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "transcript";
}

/** Resolve a speaker id to its display label. */
function speakerLabel(transcript: Transcript, speakerId?: string): string {
  if (!speakerId) return "";
  return transcript.speakers.find((s) => s.id === speakerId)?.label ?? speakerId;
}

/** One transcript line, honouring the timestamp/speaker toggles. */
function line(transcript: Transcript, index: number, opts: Required<ExportOptions>): string {
  const segment = transcript.segments[index]!;
  const parts: string[] = [];
  if (opts.timestamps) parts.push(`[${formatClock(segment.start)}]`);
  if (opts.speakers) {
    const label = speakerLabel(transcript, segment.speakerId);
    if (label) parts.push(`${label}:`);
  }
  parts.push(segment.text.replace(/\s*\n\s*/g, " ").trim());
  return parts.join(" ");
}

function toTxt(ctx: ExportContext, opts: Required<ExportOptions>): string {
  const { transcript } = ctx;
  const head = [transcript.mediaName, "=".repeat(Math.max(3, transcript.mediaName.length))];
  const body = transcript.segments.map((_, i) => line(transcript, i, opts));
  return [...head, "", ...body, ""].join("\n");
}

function toMarkdown(ctx: ExportContext, opts: Required<ExportOptions>): string {
  const { transcript, analytics, keywords } = ctx;
  const out: string[] = [`# ${transcript.mediaName || "Transcript"}`, ""];

  if (opts.includeAnalysis && analytics) {
    out.push(
      `**Duration** ${formatClock(analytics.durationMs)} · **Words** ${analytics.words.toLocaleString()} · **Reading time** ${analytics.readingMinutes} min`,
      "",
    );
  }

  if (transcript.chapters.length > 0) {
    out.push("## Chapters", "");
    for (const chapter of transcript.chapters) {
      out.push(`- \`${formatClock(chapter.start)}\` **${chapter.title}**`);
    }
    out.push("");
  }

  if (opts.includeAnalysis && keywords && keywords.length > 0) {
    out.push("## Keywords", "", keywords.slice(0, 25).map((k) => `\`${k.term}\``).join(" · "), "");
  }

  out.push("## Transcript", "");
  if (transcript.chapters.length > 0) {
    for (const chapter of transcript.chapters) {
      out.push(`### ${formatClock(chapter.start)}: ${chapter.title}`, "");
      for (const id of chapter.segmentIds) {
        const index = transcript.segments.findIndex((s) => s.id === id);
        if (index >= 0) out.push(line(transcript, index, opts), "");
      }
    }
  } else {
    for (let i = 0; i < transcript.segments.length; i += 1) {
      out.push(line(transcript, i, opts), "");
    }
  }
  return out.join("\n");
}

function toHtml(ctx: ExportContext, opts: Required<ExportOptions>): string {
  const { transcript, analytics } = ctx;
  const rows = transcript.segments
    .map((segment) => {
      const label = speakerLabel(transcript, segment.speakerId);
      return `    <p class="seg"><span class="t">${esc(formatClock(segment.start))}</span>${
        opts.speakers && label ? `<span class="sp">${esc(label)}</span>` : ""
      }<span class="x">${esc(segment.text)}</span></p>`;
    })
    .join("\n");

  const meta =
    opts.includeAnalysis && analytics
      ? `  <p class="meta">${formatClock(analytics.durationMs)} · ${analytics.words.toLocaleString()} words · ${analytics.readingMinutes} min read</p>\n`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(transcript.mediaName || "Transcript")}</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin:0 auto; padding:2rem 1.25rem; max-width:52rem; font:16px/1.7 ui-sans-serif,system-ui,sans-serif; }
    h1 { font-size:1.6rem; margin:0 0 .25rem; }
    .meta { color:#6b7280; margin:0 0 2rem; font-size:.875rem; }
    .seg { display:grid; grid-template-columns:5rem auto; gap:.25rem 1rem; margin:0 0 1rem; }
    .t { color:#6b7280; font-variant-numeric:tabular-nums; font-size:.8125rem; }
    .sp { grid-column:2; font-weight:600; font-size:.875rem; }
    .x { grid-column:2; }
    @media (max-width:40rem){ .seg{grid-template-columns:1fr} .sp,.x{grid-column:1} }
  </style>
</head>
<body>
  <h1>${esc(transcript.mediaName || "Transcript")}</h1>
${meta}${rows}
</body>
</html>
`;
}

function toCsv(ctx: ExportContext): string {
  const { transcript } = ctx;
  const header = ["start_ms", "end_ms", "start", "speaker", "text", "words"];
  const rows = transcript.segments.map((segment) =>
    [
      String(segment.start),
      String(segment.end),
      formatClock(segment.start),
      speakerLabel(transcript, segment.speakerId),
      segment.text.replace(/\s*\n\s*/g, " ").trim(),
      String(countWords(segment.text)),
    ]
      .map(csvField)
      .join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}

function toJson(ctx: ExportContext, opts: Required<ExportOptions>): string {
  return JSON.stringify(
    {
      media: ctx.transcript.mediaName,
      source: ctx.transcript.source,
      durationMs: ctx.transcript.durationMs,
      speakers: ctx.transcript.speakers,
      chapters: ctx.transcript.chapters,
      segments: ctx.transcript.segments,
      bookmarks: ctx.transcript.bookmarks,
      comments: ctx.transcript.comments,
      ...(opts.includeAnalysis
        ? { analytics: ctx.analytics, keywords: ctx.keywords, entities: ctx.entities }
        : {}),
    },
    null,
    2,
  );
}

function toXml(ctx: ExportContext, opts: Required<ExportOptions>): string {
  const { transcript } = ctx;
  const segments = transcript.segments
    .map(
      (segment) =>
        `    <segment id="${esc(segment.id)}" start="${segment.start}" end="${segment.end}"${
          opts.speakers && segment.speakerId ? ` speaker="${esc(speakerLabel(transcript, segment.speakerId))}"` : ""
        }>${esc(segment.text.trim())}</segment>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<transcript media="${esc(transcript.mediaName)}" duration="${transcript.durationMs}">
  <segments>
${segments}
  </segments>
</transcript>
`;
}

const MIME: Record<ExportFormat, string> = {
  txt: "text/plain;charset=utf-8",
  md: "text/markdown;charset=utf-8",
  html: "text/html;charset=utf-8",
  csv: "text/csv;charset=utf-8",
  json: "application/json;charset=utf-8",
  xml: "application/xml;charset=utf-8",
  srt: "application/x-subrip;charset=utf-8",
  vtt: "text/vtt;charset=utf-8",
};

/** Render the workspace to one file in the requested format. */
export function exportTranscript(
  format: ExportFormat,
  ctx: ExportContext,
  options: ExportOptions = {},
): ExportFile {
  const opts = { ...DEFAULTS, ...options };
  const name = `${stem(ctx.transcript)}.${format}`;

  const body = (() => {
    switch (format) {
      case "txt":
        return toTxt(ctx, opts);
      case "md":
        return toMarkdown(ctx, opts);
      case "html":
        return toHtml(ctx, opts);
      case "csv":
        return toCsv(ctx);
      case "json":
        return toJson(ctx, opts);
      case "xml":
        return toXml(ctx, opts);
      // Delegated so caption output matches the subtitle tools exactly.
      case "srt":
        return serialise(segmentsToCues(ctx.transcript.segments), "srt");
      case "vtt":
        return serialise(segmentsToCues(ctx.transcript.segments), "vtt");
    }
  })();

  return { name, mime: MIME[format], body };
}

/** Turn an ExportFile into a Blob for download or the workspace file chain. */
export function toBlob(file: ExportFile): Blob {
  return new Blob([file.body], { type: file.mime });
}
