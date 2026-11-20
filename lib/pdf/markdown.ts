/**
 * GigAI Tools: PDF → Markdown.
 *
 * Reuses `extractTextRuns` (lib/pdf/text.ts), which already gives each run its
 * position, size and bold/italic flags. Nothing here re-implements extraction.
 *
 * WHAT THIS CAN AND CANNOT KNOW. A PDF has no notion of "heading" or "list
 * item"; it is positioned glyphs. So structure is INFERRED from typography:
 * a run much larger than the document's body size is a heading, a line starting
 * with a bullet glyph or "1." is a list item, and so on. That inference is
 * usually right and sometimes wrong, and the tool says so rather than implying
 * it recovered a real outline. A scanned PDF has no text at all and is reported
 * as such instead of returning an empty file that looks like a failure.
 */

import { extractTextRuns, type TextRun } from "./text";
import { getPageCount } from "./core";
import type { PdfInput, ProgressFn } from "./types";

export interface PdfToMarkdownOptions {
  /** Emit `## Page 3` separators between pages. */
  pageBreaks?: boolean;
  /** Infer `#` headings from relative font size. */
  detectHeadings?: boolean;
  /** Turn bold/italic runs into `**` / `_`. */
  keepEmphasis?: boolean;
  /** Recognise bullets and numbered lines as list items. */
  detectLists?: boolean;
  pages?: number[];
  onProgress?: ProgressFn;
}

export interface PdfToMarkdownResult {
  markdown: string;
  /** Pages that yielded no text at all, the tell-tale sign of a scan. */
  emptyPages: number[];
  headings: number;
  words: number;
}

/** Lines are rebuilt by grouping runs whose vertical centres nearly coincide. */
const LINE_TOLERANCE = 0.006;

/** A run this much larger than body text is treated as a heading. */
const H1 = 1.8;
const H2 = 1.45;
const H3 = 1.18;

const BULLET = /^\s*[•▪◦‣·–—-]\s+/;
const NUMBERED = /^\s*(\d{1,3})[.)]\s+/;

interface Line {
  runs: TextRun[];
  text: string;
  size: number;
  bold: boolean;
  italic: boolean;
  x: number;
}

/** Group a page's runs into visual lines, left-to-right, top-to-bottom. */
function toLines(runs: TextRun[]): Line[] {
  const sorted = [...runs].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: Line[] = [];

  for (const run of sorted) {
    const last = lines[lines.length - 1];
    const sameLine =
      last && Math.abs(last.runs[0]!.y + last.runs[0]!.h / 2 - (run.y + run.h / 2)) < LINE_TOLERANCE;

    if (sameLine) {
      last.runs.push(run);
    } else {
      lines.push({ runs: [run], text: "", size: 0, bold: false, italic: false, x: run.x });
    }
  }

  for (const line of lines) {
    line.runs.sort((a, b) => a.x - b.x);
    // Insert a space where there is a visible horizontal gap, so "Total:42"
    // doesn't come out of two adjacent runs that were never joined.
    let text = "";
    let prev: TextRun | null = null;
    for (const r of line.runs) {
      if (prev && r.x - (prev.x + prev.w) > 0.004 && !/\s$/.test(text)) text += " ";
      text += r.str;
      prev = r;
    }
    line.text = text.replace(/\s+/g, " ").trim();
    line.size = Math.max(...line.runs.map((r) => r.fontHeightFrac));
    line.bold = line.runs.every((r) => r.bold);
    line.italic = line.runs.every((r) => r.italic);
    line.x = Math.min(...line.runs.map((r) => r.x));
  }

  return lines.filter((l) => l.text.length > 0);
}

/** Escape the characters that would otherwise become accidental Markdown. */
function escapeMd(s: string): string {
  return s.replace(/([\\`*_{}[\]#+|])/g, "\\$1");
}

export async function pdfToMarkdown(
  input: PdfInput,
  opts: PdfToMarkdownOptions = {},
): Promise<PdfToMarkdownResult> {
  const {
    pageBreaks = true,
    detectHeadings = true,
    keepEmphasis = true,
    detectLists = true,
  } = opts;

  const total = await getPageCount(input.file);
  const targets = opts.pages?.length ? opts.pages : Array.from({ length: total }, (_, i) => i + 1);

  // Body size is the MEDIAN run height across the document. Median, not mean,
  // so one giant title on a cover page can't drag the baseline up and make
  // every real heading look like body text.
  const perPage = new Map<number, Line[]>();
  const sizes: number[] = [];

  for (const [i, n] of targets.entries()) {
    opts.onProgress?.(i / targets.length, `Reading page ${n} of ${total}`);
    const runs = await extractTextRuns(input.file, n);
    const lines = toLines(runs);
    perPage.set(n, lines);
    for (const l of lines) sizes.push(l.size);
  }

  sizes.sort((a, b) => a - b);
  const body = sizes.length ? sizes[Math.floor(sizes.length / 2)]! : 0.02;

  const out: string[] = [];
  const emptyPages: number[] = [];
  let headings = 0;
  let words = 0;

  for (const n of targets) {
    const lines = perPage.get(n) ?? [];
    if (lines.length === 0) {
      emptyPages.push(n);
      continue;
    }
    if (pageBreaks && out.length > 0) out.push("\n---\n");

    for (const line of lines) {
      words += line.text.split(/\s+/).filter(Boolean).length;
      const ratio = body > 0 ? line.size / body : 1;

      if (detectHeadings && ratio >= H3) {
        const level = ratio >= H1 ? 1 : ratio >= H2 ? 2 : 3;
        headings++;
        out.push(`${"#".repeat(level)} ${escapeMd(line.text)}`);
        continue;
      }

      if (detectLists) {
        const numbered = NUMBERED.exec(line.text);
        if (numbered) {
          out.push(`${numbered[1]}. ${escapeMd(line.text.replace(NUMBERED, ""))}`);
          continue;
        }
        if (BULLET.test(line.text)) {
          out.push(`- ${escapeMd(line.text.replace(BULLET, ""))}`);
          continue;
        }
      }

      let text = escapeMd(line.text);
      if (keepEmphasis && line.bold && line.italic) text = `**_${text}_**`;
      else if (keepEmphasis && line.bold) text = `**${text}**`;
      else if (keepEmphasis && line.italic) text = `_${text}_`;
      out.push(text);
    }
  }

  opts.onProgress?.(1, "Assembling Markdown");

  // Blank line between blocks, but keep consecutive list items tight so a list
  // renders as one list rather than a run of single-item lists.
  const markdown = out
    .reduce<string[]>((acc, line, i) => {
      const prev = out[i - 1];
      const bothList = prev !== undefined && /^([-*]|\d+\.)\s/.test(prev) && /^([-*]|\d+\.)\s/.test(line);
      acc.push(bothList ? line : (i === 0 ? line : `\n${line}`));
      return acc;
    }, [])
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  return { markdown, emptyPages, headings, words };
}
