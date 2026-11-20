/**
 * GigAI Tools, Excel / spreadsheet engine (client-side, SheetJS-backed).
 *
 * `readWorkbook` parses any SheetJS-supported format (.xlsx/.xls/.ods/.csv) into
 * a plain `{ sheets:[{name, rows}] }` structure. `sheetToHtmlTable` renders a
 * grid as an accessible <table>. `excelToPdf` renders a chosen sheet as that
 * table and paginates it via the shared html2canvas renderer. `pdfToExcelRows`
 * is an HONEST, heuristic table extractor: it clusters pdf.js text items into
 * rows and columns by position: good for clean grid-like PDFs, rough on
 * free-form layouts (surfaced in the UI).
 *
 * xlsx and pdf.js are dynamic-imported; the PDF reader reuses `openPdfDocument`.
 */

import { openPdfDocument } from "@/lib/pdf/core";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { renderHtmlToPdf } from "./render-pdf";
import { type Result, escapeHtml, fail, message, ok } from "./shared";

/** A single worksheet as a rectangular grid of stringified cells. */
export interface Sheet {
  name: string;
  rows: string[][];
}

/** A parsed workbook: every sheet in file order. */
export interface Workbook {
  sheets: Sheet[];
}

/**
 * Read a spreadsheet file into a `Workbook`. Every cell is emitted as a string
 * (via `sheet_to_json` with `raw:false`, so dates/percentages keep their
 * displayed text). Empty trailing cells are preserved per-row so columns line
 * up. Works for .xlsx, .xls, .ods and .csv (SheetJS sniffs the format).
 */
export async function readWorkbook(file: Blob): Promise<Result<Workbook>> {
  try {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: false });
    const sheets: Sheet[] = wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name];
      const rows = ws
        ? (XLSX.utils.sheet_to_json(ws, {
            header: 1,
            raw: false,
            defval: "",
            blankrows: false,
          }) as unknown[][])
        : [];
      return {
        name,
        rows: rows.map((row) => row.map((cell) => (cell == null ? "" : String(cell)))),
      };
    });
    if (sheets.length === 0) return fail("This workbook has no sheets.");
    return ok({ sheets });
  } catch (err) {
    return fail(message(err));
  }
}

export interface SheetToHtmlOptions {
  /** Treat the first row as <th> header cells. Default true. */
  header?: boolean;
  /** Caption/title rendered above the table. */
  caption?: string;
}

/**
 * Render a grid of rows as a styled, accessible HTML `<table>` string. The first
 * row becomes a header (`<thead>`) unless `header:false`. Cell text is escaped.
 */
export function sheetToHtmlTable(rows: string[][], opts: SheetToHtmlOptions = {}): string {
  const header = opts.header ?? true;
  if (rows.length === 0) return "<p>This sheet is empty.</p>";

  const colCount = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const cell = (v: string | undefined) => escapeHtml(v ?? "");
  const pad = (r: string[]) =>
    Array.from({ length: colCount }, (_, i) => r[i] ?? "");

  const parts: string[] = [];
  parts.push('<table class="gk-sheet">');
  if (opts.caption) parts.push(`<caption>${escapeHtml(opts.caption)}</caption>`);

  let bodyRows = rows;
  if (header) {
    const head = pad(rows[0] ?? []);
    parts.push("<thead><tr>");
    for (const h of head) parts.push(`<th scope="col">${cell(h)}</th>`);
    parts.push("</tr></thead>");
    bodyRows = rows.slice(1);
  }

  parts.push("<tbody>");
  for (const r of bodyRows) {
    parts.push("<tr>");
    for (const c of pad(r)) parts.push(`<td>${cell(c)}</td>`);
    parts.push("</tr>");
  }
  parts.push("</tbody></table>");
  return parts.join("");
}

export interface ExcelToPdfOptions {
  /** Which sheet to render (name or 0-based index). Default: first sheet. */
  sheet?: string | number;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  /** Render the first row as a header. Default true. */
  header?: boolean;
}

/**
 * Render one sheet of a spreadsheet to a PDF, laid out as an HTML table and
 * paginated by the shared html2canvas renderer. Landscape is the default because
 * spreadsheets are usually wide. HONEST: very wide sheets are scaled down to fit
 * the page width, and text is rasterised (not selectable).
 */
export async function excelToPdf(
  file: Blob,
  opts: ExcelToPdfOptions = {},
): Promise<Result<Blob>> {
  const parsed = await readWorkbook(file);
  if (!parsed.ok) return parsed;
  const { sheets } = parsed.result;

  let sheet: Sheet | undefined;
  if (typeof opts.sheet === "number") sheet = sheets[opts.sheet];
  else if (typeof opts.sheet === "string") sheet = sheets.find((s) => s.name === opts.sheet);
  else sheet = sheets[0];
  if (!sheet) {
    return fail(`Sheet "${opts.sheet}" not found. Available: ${sheets.map((s) => s.name).join(", ")}.`);
  }

  const table = sheetToHtmlTable(sheet.rows, {
    header: opts.header ?? true,
    caption: sheet.name,
  });
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;">
<style>
  table.gk-sheet{border-collapse:collapse;width:100%;font-size:11px;}
  table.gk-sheet caption{font-weight:700;font-size:14px;text-align:left;margin-bottom:8px;}
  table.gk-sheet th,table.gk-sheet td{border:1px solid #cbd5e1;padding:4px 7px;text-align:left;vertical-align:top;white-space:normal;overflow-wrap:anywhere;}
  table.gk-sheet th{background:#eef2f7;font-weight:600;}
  table.gk-sheet tbody tr:nth-child(even){background:#f8fafc;}
</style>${table}</div>`;

  // Landscape default + wider pixel surface so more columns fit before scaling.
  const orientation = opts.orientation ?? "landscape";
  return renderHtmlToPdf(html, {
    format: opts.format ?? "a4",
    orientation,
    pixelWidth: orientation === "landscape" ? 1122 : 794,
    margin: 28,
  });
}

/**
 * Extract table-like rows from a PDF via a positional heuristic (HONEST: this is
 * best-effort, not a layout engine). For each page we read pdf.js text items,
 * cluster them into rows by their baseline Y, then split each row into columns
 * using the global set of item start-X positions as column boundaries. Clean,
 * grid-aligned PDFs extract well; free-form prose collapses into one wide column.
 */
export async function pdfToExcelRows(
  file: Blob,
  opts: { password?: string } = {},
): Promise<Result<string[][]>> {
  try {
    const doc = await openPdfDocument(file, opts.password);
    try {
      const allRows: string[][] = [];
      for (let p = 1; p <= doc.numPages; p += 1) {
        const page = await doc.getPage(p);
        try {
          const content = await page.getTextContent();
          const rows = extractRowsFromItems(content.items as TextItem[]);
          for (const r of rows) allRows.push(r);
        } finally {
          page.cleanup();
        }
      }
      return ok(normaliseColumns(allRows));
    } finally {
      await doc.destroy();
    }
  } catch (err) {
    return fail(message(err));
  }
}

/** One positioned text token used by the row/column heuristic. */
interface Token {
  str: string;
  x: number;
  y: number;
  h: number;
}

/** Turn pdf.js items into rows of cells using position clustering. */
function extractRowsFromItems(items: TextItem[]): string[][] {
  const tokens: Token[] = [];
  for (const item of items) {
    if (!("str" in item) || !("transform" in item)) continue;
    if (!item.str || item.str.trim().length === 0) continue;
    const t = item.transform;
    const x = t[4] ?? 0;
    const y = t[5] ?? 0;
    const h = Math.hypot(t[2] ?? 0, t[3] ?? 0) || item.height || 8;
    tokens.push({ str: item.str, x, y, h });
  }
  if (tokens.length === 0) return [];

  // Cluster into rows by Y (baselines within ~0.6× font height share a row).
  tokens.sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: Token[][] = [];
  for (const tok of tokens) {
    const row = rows[rows.length - 1];
    const ref = row?.[0];
    if (row && ref && Math.abs(ref.y - tok.y) <= 0.6 * Math.max(ref.h, tok.h)) {
      row.push(tok);
    } else {
      rows.push([tok]);
    }
  }

  // Column boundaries: gather every token's start-X across all rows, then bucket
  // near-equal positions (within an average glyph width) into shared columns.
  const avgH = tokens.reduce((s, t) => s + t.h, 0) / tokens.length;
  const gap = avgH * 0.9;
  const starts = Array.from(new Set(tokens.map((t) => t.x))).sort((a, b) => a - b);
  const columns: number[] = [];
  for (const x of starts) {
    const last = columns[columns.length - 1];
    if (last === undefined || x - last > gap) columns.push(x);
  }
  const columnOf = (x: number): number => {
    let idx = 0;
    for (let i = 0; i < columns.length; i += 1) {
      if (x >= (columns[i] ?? Infinity) - gap / 2) idx = i;
      else break;
    }
    return idx;
  };

  return rows.map((row) => {
    const cells: string[] = new Array(columns.length).fill("");
    const sorted = [...row].sort((a, b) => a.x - b.x);
    for (const tok of sorted) {
      const c = columnOf(tok.x);
      cells[c] = cells[c] ? `${cells[c]} ${tok.str}` : tok.str;
    }
    return cells.map((c) => c.trim());
  });
}

/** Pad all rows to the same width and drop trailing all-empty columns. */
function normaliseColumns(rows: string[][]): string[][] {
  if (rows.length === 0) return rows;
  let width = rows.reduce((m, r) => Math.max(m, r.length), 0);
  // Trim trailing columns that are empty in every row.
  while (width > 1 && rows.every((r) => (r[width - 1] ?? "").trim() === "")) width -= 1;
  return rows.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ""));
}
