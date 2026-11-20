/**
 * GigAI Tools, PDF text extraction for in-place "whiteout & retype" editing.
 *
 * Runs client-side only (pdf.js is dynamic-imported via `openPdfDocument`). For a
 * given page we pull the text layer with `page.getTextContent()` and convert each
 * text item's baseline transform into a NORMALISED [0,1] top-left bounding box, so
 * the editor can overlay a clickable target that lines up with the rendered page
 * at any scale. Note this only sees a real text layer, scanned/image-only PDFs
 * yield no runs, which the UI communicates honestly.
 */

import { openPdfDocument } from "./core";

/** One editable text run in normalised [0,1] top-left page space. */
export interface TextRun {
  /** Stable id: `p{page}-{index}`. */
  id: string;
  /** The original string as pdf.js decoded it. */
  str: string;
  /** Left edge, fraction of page width. */
  x: number;
  /** Top edge, fraction of page height. */
  y: number;
  /** Width, fraction of page width. */
  w: number;
  /** Height, fraction of page height. */
  h: number;
  /** Font height as a fraction of page height (for scale-independent sizing). */
  fontHeightFrac: number;
  /** True when the run's source font looks bold (name-based; best effort). */
  bold: boolean;
  /** True when the run's source font looks italic/oblique (best effort). */
  italic: boolean;
}

/** Detect bold/italic from a font's PostScript name (e.g. "ABCDEF+Arial-BoldMT"). */
function styleFromFontName(name: string): { bold: boolean; italic: boolean } {
  return {
    bold: /bold|black|heavy|semibold|demibold/i.test(name),
    italic: /italic|oblique/i.test(name),
  };
}

/**
 * Extract the text runs of a single 1-based page as normalised boxes.
 *
 * pdf.js gives each item a `transform = [a, b, c, d, e, f]` where `(e, f)` is the
 * baseline origin in unscaled PDF user space (origin bottom-left). We take the
 * glyph height from `hypot(c, d)` (falls back to `item.height`), then flip Y into
 * top-left normalised space against the scale-1 viewport. Whitespace-only items
 * are skipped; they carry no editable content.
 */
export async function extractTextRuns(
  file: File,
  pageNumber: number,
): Promise<TextRun[]> {
  const doc = await openPdfDocument(file);
  try {
    if (pageNumber < 1 || pageNumber > doc.numPages) return [];
    const page = await doc.getPage(pageNumber);
    try {
      const viewport = page.getViewport({ scale: 1 });
      const vpWidth = viewport.width;
      const vpHeight = viewport.height;
      if (vpWidth <= 0 || vpHeight <= 0) return [];

      const content = await page.getTextContent();
      const runs: TextRun[] = [];

      // Fonts only land in `page.commonObjs` when the page is RENDERED -
      // `getTextContent()` alone never resolves them. A ~8px throwaway render
      // is cheap (extraction runs once per page) and unlocks name-based
      // bold/italic detection below.
      try {
        const scale = 8 / Math.max(vpWidth, vpHeight);
        const tinyVp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(tinyVp.width));
        canvas.height = Math.max(1, Math.ceil(tinyVp.height));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            canvas,
            viewport: tinyVp,
          } as unknown as Parameters<typeof page.render>[0]).promise;
        }
      } catch {
        /* detection stays best-effort; manual B/I toggles still work */
      }

      // Resolve each pdf.js internal font id (e.g. "g_d0_f2") to its real
      // PostScript name once, so bold/italic can be inferred per run. `.get`
      // can still throw for unresolved ids. Treat those as regular (the
      // editor also offers manual B/I toggles).
      const styleCache = new Map<string, { bold: boolean; italic: boolean }>();
      const styleFor = (fontId: string | undefined) => {
        if (!fontId) return { bold: false, italic: false };
        const hit = styleCache.get(fontId);
        if (hit) return hit;
        let style = { bold: false, italic: false };
        try {
          const fontObj = (
            page.commonObjs as { get: (id: string) => { name?: string } | null }
          ).get(fontId);
          if (fontObj?.name) style = styleFromFontName(fontObj.name);
        } catch {
          /* font not resolved, default to regular */
        }
        styleCache.set(fontId, style);
        return style;
      };

      for (let i = 0; i < content.items.length; i += 1) {
        const item = content.items[i];
        // Skip marked-content markers (they lack `transform`/`str`).
        if (!item || !("str" in item) || !("transform" in item)) continue;
        const str = item.str;
        if (!str || str.trim().length === 0) continue;

        const t = item.transform;
        const x = t[4] ?? 0;
        const baselineY = t[5] ?? 0;
        const skewC = t[2] ?? 0;
        const scaleD = t[3] ?? 0;
        const fontHeight =
          Math.hypot(skewC, scaleD) || item.height || 0;
        const width = item.width || 0;
        if (fontHeight <= 0 || width <= 0) continue;

        const nx = x / vpWidth;
        const ny = (vpHeight - baselineY - fontHeight) / vpHeight;
        const nw = width / vpWidth;
        const nh = fontHeight / vpHeight;

        const { bold, italic } = styleFor(
          "fontName" in item ? (item.fontName as string) : undefined,
        );
        runs.push({
          id: `p${pageNumber}-${i}`,
          str,
          x: nx,
          y: ny,
          w: nw,
          h: nh,
          fontHeightFrac: nh,
          bold,
          italic,
        });
      }

      return runs;
    } finally {
      page.cleanup();
    }
  } finally {
    await doc.destroy();
  }
}

/* ── Cross-run / per-line matching ─────────────────────────────────────────────

   Real PDFs frequently split a single visual word across several pdf.js text
   items (kerning, letter-spacing on headings, ligatures) and may store styled
   uppercase text in mixed case. Testing each run in isolation therefore misses
   matches like "WORK" inside a "SCOPE OF WORK" heading. `findRunReplacements`
   groups a page's runs into visual lines, concatenates each line (inserting a
   space only at real word gaps), replaces EVERY occurrence of `find` in the line
   text, then maps the result back onto the covered runs: emitting, per run, the
   final string to retype over it. This handles multiple matches per run, matches
   that span runs, and matches inside a single run uniformly. `run.str` is never
   mutated.
──────────────────────────────────────────────────────────────────────────── */

/** One run that must be redrawn after a replace, with its final text. */
export interface RunReplacement {
  run: TextRun;
  /**
   * The full new string to paint over this run's box (its untouched characters
   * plus any replacement text for matches that begin within it). "" means the
   * run's original glyphs are covered and nothing is retyped (whiteout only).
   */
  newStr: string;
}

/** Result of scanning a page's runs for a term. */
export interface FindResult {
  /** Total number of occurrences found across all lines (for the UI count). */
  count: number;
  /** The runs to cover + retype so every occurrence is replaced. */
  replacements: RunReplacement[];
}

/** Escape a string so it can be used literally inside a RegExp. */
function escapeForRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Group runs into visual lines by vertical proximity, each sorted L→R. */
function groupIntoLines(runs: TextRun[]): TextRun[][] {
  const lines: TextRun[][] = [];
  for (const run of runs) {
    let placed = false;
    for (const line of lines) {
      const ref = line[0];
      if (!ref) continue;
      const tol = 0.6 * Math.max(run.h, ref.h);
      if (Math.abs(run.y - ref.y) <= tol) {
        line.push(run);
        placed = true;
        break;
      }
    }
    if (!placed) lines.push([run]);
  }
  for (const line of lines) line.sort((a, b) => a.x - b.x);
  return lines;
}

/**
 * Scan a page's runs and compute, for the given term, both the occurrence count
 * and the per-run replacement strings needed to replace EVERY occurrence.
 *
 * For each visual line we build the concatenated text plus a char→run map, run a
 * global regex to find all (non-overlapping) matches, and then rebuild each run's
 * output text: characters outside any match are kept verbatim; the replacement
 * string is emitted once, at the run that owns the match's first character. Runs
 * whose output differs from their original text are returned as replacements
 * (this also covers the case where a match deletes text, yielding "").
 */
export function findRunReplacements(
  runs: TextRun[],
  find: string,
  replace: string,
  matchCase: boolean,
): FindResult {
  if (find.length === 0 || runs.length === 0) {
    return { count: 0, replacements: [] };
  }

  const lines = groupIntoLines(runs);
  const replacements: RunReplacement[] = [];
  let count = 0;

  for (const line of lines) {
    // Build the line string, mapping each character back to its run index.
    let text = "";
    const charRun: number[] = [];
    for (let ri = 0; ri < line.length; ri += 1) {
      const run = line[ri];
      if (!run) continue;
      if (ri > 0) {
        const prev = line[ri - 1];
        if (prev) {
          const gap = run.x - (prev.x + prev.w);
          if (gap > 0.25 * prev.h) {
            // Real word gap: attribute the joining space to the previous run so
            // it is preserved when that run is rebuilt.
            text += " ";
            charRun.push(ri - 1);
          }
        }
      }
      for (let c = 0; c < run.str.length; c += 1) {
        text += run.str[c];
        charRun.push(ri);
      }
    }
    if (text.length === 0) continue;

    // Find every non-overlapping occurrence in this line.
    const re = new RegExp(escapeForRegExp(find), matchCase ? "g" : "gi");
    interface Span {
      start: number;
      end: number;
    }
    const spans: Span[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex += 1;
        continue;
      }
      spans.push({ start: m.index, end: m.index + m[0].length });
    }
    if (spans.length === 0) continue;
    count += spans.length;

    // Rebuild each covered run's output text character by character.
    const rebuilt = new Map<number, string>();
    const touchedRuns = new Set<number>();

    // Mark which line-char index each span starts at (emit replacement there).
    const startAt = new Map<number, string>();
    const inMatch: boolean[] = new Array(text.length).fill(false);
    for (const span of spans) {
      startAt.set(span.start, replace);
      for (let i = span.start; i < span.end; i += 1) inMatch[i] = true;
      // Every run touched by this span must be redrawn (its glyphs are covered).
      for (let i = span.start; i < span.end; i += 1) {
        const ri = charRun[i];
        if (ri !== undefined) touchedRuns.add(ri);
      }
    }

    for (let i = 0; i < text.length; i += 1) {
      const ri = charRun[i];
      if (ri === undefined) continue;
      // Emit the replacement at the char where a match starts, attributing it to
      // that char's run (the anchor run for this occurrence).
      const rep = startAt.get(i);
      if (rep !== undefined) {
        rebuilt.set(ri, (rebuilt.get(ri) ?? "") + rep);
      }
      if (!inMatch[i]) {
        rebuilt.set(ri, (rebuilt.get(ri) ?? "") + text[i]);
      } else {
        // Ensure covered-but-untyped runs get an entry so they are whited out.
        if (!rebuilt.has(ri)) rebuilt.set(ri, "");
      }
    }

    for (const ri of touchedRuns) {
      const run = line[ri];
      if (!run) continue;
      replacements.push({ run, newStr: rebuilt.get(ri) ?? "" });
    }
  }

  return { count, replacements };
}
