/**
 * GigAI Tools: `Block[]` -> a real text PDF, laid out with jsPDF's text API.
 *
 * This replaces the old "screenshot the page and slice the image" approach.
 * Drawing text as text means the output is selectable, searchable, sharp at any
 * zoom and a fraction of the size; laying it out line by line means a page
 * break lands *between* lines instead of shearing one in half, which is what
 * the raster path did on every page boundary.
 *
 * The standard PDF fonts only cover WinAnsi, so callers must check
 * `isLatinSafe` before choosing this renderer (see `render-pdf.ts`).
 *
 * jsPDF is dynamic-imported: this module is cheap to reference.
 */

import type { Align, Block, Inline, TableBlock, TableRow } from "./pdf-blocks";
import { type Result, fail, message, ok } from "./shared";

export interface LayoutOptions {
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  /** Uniform page margin in points (1pt = 1/72"). */
  margin?: number;
  /** Body text size in points. */
  fontSize?: number;
  /** Serif body text (headings follow). */
  serif?: boolean;
  /** Document title written into the PDF metadata. */
  title?: string;
}

/** Heading point sizes, index 1-6; index 0 is unused. */
const HEADING_SIZE = [0, 20, 16.5, 14, 12.5, 11.5, 11];
const LINE_RATIO = 1.34;
const PARA_GAP = 7;
const HEADING_GAP_BEFORE = 12;
const HEADING_GAP_AFTER = 5;
const LIST_INDENT = 18;
const CELL_PAD = 5;
const RULE_COLOR = 200;
const BORDER_COLOR = 170;

type Doc = import("jspdf").jsPDF;

/** One measured piece of a line: text plus the style it must be drawn with. */
interface Seg {
  text: string;
  run: Inline;
  size: number;
  width: number;
  space: boolean;
}

interface Line {
  segs: Seg[];
  /** Width with trailing spaces removed - what alignment is computed from. */
  width: number;
  height: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) return [17, 17, 17];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Apply a run's character properties to the document before measuring/drawing. */
function applyRun(doc: Doc, run: Inline, size: number, serif: boolean): void {
  const style = run.bold && run.italic ? "bolditalic" : run.bold ? "bold" : run.italic ? "italic" : "normal";
  doc.setFont(run.mono ? "courier" : serif ? "times" : "helvetica", style);
  doc.setFontSize(size);
  const [r, g, b] = run.href ? [13, 71, 161] : run.color ? hexToRgb(run.color) : [17, 17, 17];
  doc.setTextColor(r, g, b);
}

/**
 * Split runs into measurable tokens. Words and the spaces between them are
 * separate tokens so the wrapper can break on a space and drop it at the edge.
 */
function tokenise(doc: Doc, runs: Inline[], baseSize: number, serif: boolean, pre: boolean): Seg[] {
  const segs: Seg[] = [];
  for (const run of runs) {
    const size = run.size ?? baseSize;
    applyRun(doc, run, size, serif);
    // In preformatted text every space is significant, so only newlines split.
    const parts = pre ? [run.text] : run.text.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      segs.push({
        text: part,
        run,
        size,
        width: doc.getTextWidth(part),
        space: !pre && /^\s+$/.test(part),
      });
    }
  }
  return segs;
}

/** Greedy line breaker: never splits a word unless the word alone overflows. */
function wrap(doc: Doc, segs: Seg[], maxWidth: number, serif: boolean): Line[] {
  const lines: Line[] = [];
  let cur: Seg[] = [];
  let width = 0;

  const flush = () => {
    // Trailing spaces must not count toward the measured width, or centred and
    // right-aligned lines drift by however many spaces ended the line.
    let end = cur.length;
    while (end > 0 && cur[end - 1]?.space) end -= 1;
    const kept = cur.slice(0, end);
    const w = kept.reduce((sum, s) => sum + s.width, 0);
    const size = kept.reduce((m, s) => Math.max(m, s.size), 0) || 11;
    lines.push({ segs: kept, width: w, height: size * LINE_RATIO });
    cur = [];
    width = 0;
  };

  for (const seg of segs) {
    if (seg.text.includes("\n")) {
      // Hard newline inside preformatted text.
      const pieces = seg.text.split("\n");
      pieces.forEach((piece, i) => {
        if (i > 0) flush();
        if (!piece) return;
        applyRun(doc, seg.run, seg.size, serif);
        const w = doc.getTextWidth(piece);
        cur.push({ ...seg, text: piece, width: w });
        width += w;
      });
      continue;
    }
    if (!seg.space && width + seg.width > maxWidth && cur.length > 0) flush();
    if (seg.space && cur.length === 0) continue; // no leading space after a break
    cur.push(seg);
    width += seg.width;
  }
  if (cur.length) flush();
  if (!lines.length) lines.push({ segs: [], width: 0, height: 11 * LINE_RATIO });
  return lines;
}

/** Merge neighbouring segments that share a run so each becomes one draw call. */
function coalesce(segs: Seg[]): Seg[] {
  const out: Seg[] = [];
  for (const seg of segs) {
    const prev = out[out.length - 1];
    if (prev && prev.run === seg.run && prev.size === seg.size) {
      prev.text += seg.text;
      prev.width += seg.width;
    } else {
      out.push({ ...seg });
    }
  }
  return out;
}

/** The writer: owns the cursor, the page and every draw call. */
class Writer {
  readonly doc: Doc;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly serif: boolean;
  readonly base: number;
  y: number;

  constructor(doc: Doc, margin: number, fontSize: number, serif: boolean) {
    this.doc = doc;
    this.left = margin;
    this.right = doc.internal.pageSize.getWidth() - margin;
    this.top = margin;
    this.bottom = doc.internal.pageSize.getHeight() - margin;
    this.serif = serif;
    this.base = fontSize;
    this.y = margin;
  }

  get width(): number {
    return this.right - this.left;
  }

  /** Start a new page if `height` will not fit in what remains of this one. */
  ensure(height: number): void {
    if (this.y + height > this.bottom && this.y > this.top) {
      this.doc.addPage();
      this.y = this.top;
    }
  }

  newPage(): void {
    this.doc.addPage();
    this.y = this.top;
  }

  gap(points: number): void {
    if (this.y > this.top) this.y += points;
  }

  /** Draw one wrapped line, honouring alignment and per-run decoration. */
  drawLine(line: Line, x: number, maxWidth: number, align: Align, isLast: boolean): void {
    const segs = coalesce(line.segs);
    if (!segs.length) return;

    let cursor = x;
    let extraPerSpace = 0;
    if (align === "center") cursor = x + (maxWidth - line.width) / 2;
    else if (align === "right") cursor = x + (maxWidth - line.width);
    else if (align === "justify" && !isLast) {
      const spaces = segs.filter((s) => s.space).length;
      if (spaces > 0 && line.width < maxWidth) extraPerSpace = (maxWidth - line.width) / spaces;
    }

    const baseline = this.y + line.height * 0.76;
    for (const seg of segs) {
      const w = seg.width + (seg.space ? extraPerSpace : 0);
      if (seg.text.trim()) {
        applyRun(this.doc, seg.run, seg.size, this.serif);
        if (seg.run.href) {
          this.doc.textWithLink(seg.text, cursor, baseline, { url: seg.run.href });
        } else {
          this.doc.text(seg.text, cursor, baseline);
        }
        if (seg.run.underline || seg.run.strike || seg.run.href) {
          const [r, g, b] = seg.run.color ? hexToRgb(seg.run.color) : seg.run.href ? [13, 71, 161] : [17, 17, 17];
          this.doc.setDrawColor(r, g, b);
          this.doc.setLineWidth(Math.max(0.4, seg.size * 0.045));
          if (seg.run.underline || seg.run.href) {
            const uy = baseline + seg.size * 0.12;
            this.doc.line(cursor, uy, cursor + seg.width, uy);
          }
          if (seg.run.strike) {
            const sy = baseline - seg.size * 0.28;
            this.doc.line(cursor, sy, cursor + seg.width, sy);
          }
        }
      }
      cursor += w;
    }
    this.y += line.height;
  }

  /** Lay out runs into the given column, breaking pages between lines. */
  paragraph(
    runs: Inline[],
    opts: { x?: number; width?: number; align?: Align; size?: number; pre?: boolean; quote?: boolean } = {},
  ): void {
    const x = opts.x ?? this.left;
    const width = opts.width ?? this.right - x;
    const size = opts.size ?? this.base;
    const align = opts.align ?? "left";
    const segs = tokenise(this.doc, runs, size, this.serif, opts.pre === true);
    const lines = wrap(this.doc, segs, width, this.serif);

    lines.forEach((line, i) => {
      this.ensure(line.height);
      if (opts.quote) {
        this.doc.setDrawColor(BORDER_COLOR);
        this.doc.setLineWidth(2);
        this.doc.line(x - 8, this.y + 1, x - 8, this.y + line.height - 1);
      }
      this.drawLine(line, x, width, align, i === lines.length - 1);
    });
  }

  rule(): void {
    this.ensure(10);
    this.y += 4;
    this.doc.setDrawColor(RULE_COLOR);
    this.doc.setLineWidth(0.6);
    this.doc.line(this.left, this.y, this.right, this.y);
    this.y += 6;
  }

  image(block: Extract<Block, { type: "image" }>): void {
    const maxW = this.width;
    const maxH = this.bottom - this.top;
    // Word stores images at 96dpi; PDF works in points, hence the 0.75 factor.
    let w = Math.min(block.width * 0.75, maxW);
    let h = (block.height / Math.max(block.width, 1)) * w;
    if (h > maxH) {
      h = maxH;
      w = (block.width / Math.max(block.height, 1)) * h;
    }
    this.ensure(h);
    try {
      this.doc.addImage(block.data, block.format, this.left, this.y, w, h);
    } catch {
      // A corrupt or unsupported image must not abort the whole document.
      return;
    }
    this.y += h + 4;
  }
}

/** Natural (unwrapped) width of a cell's text, used to share out columns. */
function cellNaturalWidth(doc: Doc, cell: { runs: Inline[] }, size: number, serif: boolean): number {
  let total = 0;
  for (const run of cell.runs) {
    applyRun(doc, run, run.size ?? size, serif);
    total += doc.getTextWidth(run.text);
  }
  return total + CELL_PAD * 2;
}

/**
 * Share the table width out between columns: start from what each column would
 * need unwrapped, then scale down proportionally so the table always fits the
 * page (and never pushes content into the margin, as an HTML table would).
 */
function columnWidths(doc: Doc, table: TableBlock, total: number, size: number, serif: boolean): number[] {
  const count = Math.max(...table.rows.map((r) => r.cells.reduce((n, c) => n + (c.span ?? 1), 0)), 1);
  const natural = new Array<number>(count).fill(0);
  for (const row of table.rows) {
    let col = 0;
    for (const cell of row.cells) {
      const span = cell.span ?? 1;
      const w = cellNaturalWidth(doc, cell, size, serif) / span;
      for (let i = 0; i < span && col + i < count; i += 1) {
        natural[col + i] = Math.max(natural[col + i] ?? 0, w);
      }
      col += span;
    }
  }
  const sum = natural.reduce((a, b) => a + b, 0) || 1;
  const min = 32;
  // Proportional fit, with a floor so a narrow column stays readable.
  const scaled = natural.map((w) => Math.max(min, (w / sum) * total));
  const scaledSum = scaled.reduce((a, b) => a + b, 0);
  return scaledSum > total ? scaled.map((w) => (w / scaledSum) * total) : scaled;
}

/** Draw a table, repeating header rows whenever it spills onto a new page. */
function drawTable(w: Writer, table: TableBlock, size: number): void {
  const widths = columnWidths(w.doc, table, w.width, size, w.serif);
  const headers = table.rows.filter((r) => r.header);

  const rowLines = (row: TableRow): { lines: Line[]; width: number; x: number }[] => {
    const out: { lines: Line[]; width: number; x: number }[] = [];
    let col = 0;
    let x = w.left;
    for (const cell of row.cells) {
      const span = cell.span ?? 1;
      let cw = 0;
      for (let i = 0; i < span; i += 1) cw += widths[col + i] ?? 0;
      const inner = cw - CELL_PAD * 2;
      const segs = tokenise(w.doc, cell.runs, size, w.serif, false);
      out.push({ lines: wrap(w.doc, segs, Math.max(inner, 16), w.serif), width: cw, x });
      x += cw;
      col += span;
    }
    return out;
  };

  const drawRow = (row: TableRow): void => {
    const measured = rowLines(row);
    const height = Math.max(...measured.map((m) => m.lines.reduce((s, l) => s + l.height, 0)), size) + CELL_PAD * 2;

    // Keep a row whole: if it cannot fit, start a page and repeat the headers.
    if (w.y + height > w.bottom && w.y > w.top) {
      w.newPage();
      for (const h of headers) if (h !== row) drawRow(h);
    }

    const top = w.y;
    if (row.header) {
      w.doc.setFillColor(242, 242, 242);
      w.doc.rect(w.left, top, widths.reduce((a, b) => a + b, 0), height, "F");
    }
    measured.forEach((m, i) => {
      w.doc.setDrawColor(BORDER_COLOR);
      w.doc.setLineWidth(0.5);
      w.doc.rect(m.x, top, m.width, height);
      const cell = row.cells[i];
      let y = top + CELL_PAD;
      for (const line of m.lines) {
        const saved = w.y;
        w.y = y;
        w.drawLine(line, m.x + CELL_PAD, m.width - CELL_PAD * 2, cell?.align ?? "left", true);
        y = w.y;
        w.y = saved;
      }
    });
    w.y = top + height;
  };

  w.ensure(size * 3);
  for (const row of table.rows) drawRow(row);
  w.y += PARA_GAP;
}

/** Render a block list into a PDF Blob. Runs in the browser (jsPDF). */
export async function renderBlocksToPdf(blocks: Block[], opts: LayoutOptions = {}): Promise<Result<Blob>> {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      unit: "pt",
      format: opts.format ?? "a4",
      orientation: opts.orientation ?? "portrait",
      compress: true,
    }) as Doc;
    if (opts.title) doc.setProperties({ title: opts.title });

    const size = opts.fontSize ?? 11;
    const w = new Writer(doc, opts.margin ?? 36, size, opts.serif === true);

    for (const block of blocks) {
      switch (block.type) {
        case "pagebreak":
          if (w.y > w.top) w.newPage();
          break;
        case "rule":
          w.rule();
          break;
        case "image":
          w.image(block);
          break;
        case "table":
          drawTable(w, block, size);
          break;
        case "list": {
          for (const item of block.items) {
            const indent = LIST_INDENT * (item.level + 1);
            const x = w.left + indent;
            // Measure the first line so the marker and the text it belongs to
            // always land on the same page: reserving the space first means a
            // break happens before the marker is drawn, never between them.
            const segs = tokenise(w.doc, item.runs, size, w.serif, false);
            const lines = wrap(w.doc, segs, w.right - x, w.serif);
            w.ensure(lines[0]?.height ?? size * LINE_RATIO);
            const markerY = w.y;
            w.paragraph(item.runs, { x, width: w.right - x, align: "left", size });
            const after = w.y;
            w.y = markerY;
            w.doc.setTextColor(17, 17, 17);
            w.paragraph([{ text: item.marker }], { x: x - LIST_INDENT, width: LIST_INDENT - 4, align: "left", size });
            w.y = after;
          }
          w.y += PARA_GAP;
          break;
        }
        case "para": {
          const heading = block.heading;
          const psize = heading ? (HEADING_SIZE[heading] ?? size) : size;
          if (heading) w.gap(HEADING_GAP_BEFORE);
          const runs = heading ? block.runs.map((r) => ({ ...r, bold: true })) : block.runs;
          const x = w.left + (block.indent ?? 0) + (block.quote ? 14 : 0);
          w.paragraph(runs, {
            x,
            width: w.right - x,
            align: block.align ?? "left",
            size: psize,
            pre: block.pre,
            quote: block.quote,
          });
          w.y += heading ? HEADING_GAP_AFTER : PARA_GAP;
          break;
        }
      }
    }

    return ok(doc.output("blob"));
  } catch (err) {
    return fail(message(err));
  }
}
