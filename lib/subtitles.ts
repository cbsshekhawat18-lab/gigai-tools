/**
 * Subtitle toolkit, parse, convert and retime SRT/VTT captions entirely in the
 * browser. Pure string processing: no ML model, no ffmpeg, nothing uploaded.
 *
 * Handles the two things people actually need:
 *   - Convert SRT ↔ WebVTT (web players want VTT; editors export SRT).
 *   - Shift every caption by ± an offset to fix audio that's out of sync.
 * Plus a clean-up pass: sort by start time and renumber.
 */

export interface Cue {
  /** Start time in milliseconds. */
  start: number;
  /** End time in milliseconds. */
  end: number;
  /** Caption text (may contain newlines). */
  text: string;
}

export type Format = "srt" | "vtt";

/** Parse a "HH:MM:SS,mmm" / "HH:MM:SS.mmm" / "MM:SS.mmm" timestamp to ms. */
function parseTime(raw: string): number | null {
  const m = raw.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  if (!m) return null;
  const [, hh, mm, ss, mmm] = m;
  if (mm == null || ss == null || mmm == null) return null;
  const h = hh ? Number(hh) : 0;
  return ((h * 60 + Number(mm)) * 60 + Number(ss)) * 1000 + Number(mmm.padEnd(3, "0"));
}

/** Format ms as a timestamp. `sep` is "," for SRT, "." for VTT. */
export function formatTime(ms: number, sep: "," | "."): string {
  const clamped = Math.max(0, Math.round(ms));
  const h = Math.floor(clamped / 3_600_000);
  const min = Math.floor((clamped % 3_600_000) / 60_000);
  const sec = Math.floor((clamped % 60_000) / 1000);
  const milli = clamped % 1000;
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(min)}:${pad(sec)}${sep}${pad(milli, 3)}`;
}

/** Detect whether a subtitle blob is VTT (by its header) or SRT. */
export function detectFormat(text: string): Format {
  return /^﻿?\s*WEBVTT/i.test(text) ? "vtt" : "srt";
}

/**
 * Parse SRT or VTT text into cues. Lenient: tolerates missing indices, blank
 * lines, a WEBVTT header, and VTT cue ids/settings. Returns cues in file order.
 */
export function parseSubtitles(input: string): { cues: Cue[]; format: Format } {
  const format = detectFormat(input);
  // Normalise newlines and strip a WEBVTT header + any leading BOM.
  const text = input.replace(/\r\n?/g, "\n").replace(/^﻿/, "");
  const body = format === "vtt" ? text.replace(/^\s*WEBVTT[^\n]*\n/i, "") : text;

  const cues: Cue[] = [];
  for (const block of body.split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((l, i, arr) => !(i === arr.length - 1 && l.trim() === ""));
    if (lines.length === 0) continue;

    // Find the timing line ("start --> end") anywhere in the block.
    const tIdx = lines.findIndex((l) => l.includes("-->"));
    if (tIdx === -1) continue;
    const timing = lines[tIdx];
    if (!timing) continue;
    const parts = timing.split("-->");
    const startStr = parts[0];
    const endPart = parts[1];
    if (startStr == null || endPart == null) continue;
    const start = parseTime(startStr);
    // The end side may carry VTT cue settings after the timestamp, take the first token.
    const endToken = endPart.trim().split(/\s+/)[0] ?? "";
    const end = parseTime(endToken);
    if (start == null || end == null) continue;

    const textLines = lines.slice(tIdx + 1);
    cues.push({ start, end, text: textLines.join("\n").trim() });
  }
  return { cues, format };
}

/** Shift every cue by `deltaMs` (can be negative); never goes below zero. */
export function shiftCues(cues: Cue[], deltaMs: number): Cue[] {
  return cues.map((c) => ({
    start: Math.max(0, c.start + deltaMs),
    end: Math.max(0, c.end + deltaMs),
    text: c.text,
  }));
}

/** Sort cues by start time and drop empties. */
export function cleanCues(cues: Cue[]): Cue[] {
  return [...cues].filter((c) => c.text.trim().length > 0).sort((a, b) => a.start - b.start);
}

/** Serialise cues as SRT. */
export function toSRT(cues: Cue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${formatTime(c.start, ",")} --> ${formatTime(c.end, ",")}\n${c.text}`)
    .join("\n\n")
    .concat(cues.length ? "\n" : "");
}

/** Serialise cues as WebVTT. */
export function toVTT(cues: Cue[]): string {
  const body = cues
    .map((c) => `${formatTime(c.start, ".")} --> ${formatTime(c.end, ".")}\n${c.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${body}${cues.length ? "\n" : ""}`;
}

export function serialise(cues: Cue[], format: Format): string {
  return format === "vtt" ? toVTT(cues) : toSRT(cues);
}
