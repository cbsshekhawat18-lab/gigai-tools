/**
 * GigAI Tools: tabular read/write helpers for CSV & Excel.
 *
 * All parsing/serialising runs in the browser; the heavy libraries (papaparse
 * for robust CSV, SheetJS for .xlsx/.xls) are dynamic-imported so they stay out
 * of the initial bundle and are only fetched when a spreadsheet tool runs.
 *
 * The shared in-memory shape is `TableData`: a flat header row plus a rows array
 * of string cells. Everything is stringified on read so the DataGrid can edit
 * uniformly; writers re-encode from strings.
 */

/** A parsed table: one header row + N data rows of string cells. */
export interface TableData {
  /** Column headers. Length defines the canonical column count. */
  headers: string[];
  /** Data rows. Each row is padded/truncated to `headers.length` on normalise. */
  rows: string[][];
}

/** An empty table with `cols` blank-named columns and zero rows. */
export function emptyTable(cols = 3): TableData {
  return {
    headers: Array.from({ length: Math.max(1, cols) }, (_, i) => `Column ${i + 1}`),
    rows: [],
  };
}

/**
 * Normalise a table so every row matches the header width exactly (pad with ""
 * / truncate extras) and cells are always strings. Idempotent.
 */
export function normalizeTable(table: TableData): TableData {
  const width = Math.max(1, table.headers.length);
  const headers = table.headers.slice(0, width).map((h) => String(h ?? ""));
  while (headers.length < width) headers.push(`Column ${headers.length + 1}`);
  const rows = table.rows.map((row) => {
    const next = row.slice(0, width).map((c) => (c == null ? "" : String(c)));
    while (next.length < width) next.push("");
    return next;
  });
  return { headers, rows };
}

/** Coerce an unknown 2-D matrix into a TableData, using the first row as headers. */
export function matrixToTable(matrix: unknown[][], hasHeader = true): TableData {
  const stringify = (v: unknown) => (v == null ? "" : String(v));
  if (matrix.length === 0) return emptyTable();
  if (hasHeader) {
    const [head, ...body] = matrix;
    return normalizeTable({
      headers: (head ?? []).map(stringify),
      rows: body.map((r) => r.map(stringify)),
    });
  }
  const width = matrix.reduce((m, r) => Math.max(m, r.length), 0);
  return normalizeTable({
    headers: Array.from({ length: width }, (_, i) => `Column ${i + 1}`),
    rows: matrix.map((r) => r.map(stringify)),
  });
}

/** Back to a plain matrix (header row first) for writers. */
export function tableToMatrix(table: TableData, includeHeader = true): string[][] {
  const t = normalizeTable(table);
  return includeHeader ? [t.headers, ...t.rows] : t.rows;
}

/* ── CSV ─────────────────────────────────────────────────────────────────── */

/** Parse CSV/TSV text into a TableData using papaparse (robust quoting). */
export async function parseCsv(
  text: string,
  opts: { header?: boolean; delimiter?: string } = {},
): Promise<TableData> {
  const Papa = (await import("papaparse")).default;
  const result = Papa.parse<string[]>(text, {
    delimiter: opts.delimiter ?? "",
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });
  const matrix = (result.data as unknown[][]) ?? [];
  return matrixToTable(matrix, opts.header ?? true);
}

/** Serialise a TableData to CSV text (papaparse handles escaping). */
export async function toCsv(table: TableData): Promise<string> {
  const Papa = (await import("papaparse")).default;
  return Papa.unparse(tableToMatrix(table, true));
}

/** Serialise a TableData to a CSV Blob. */
export async function toCsvBlob(table: TableData): Promise<Blob> {
  const csv = await toCsv(table);
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

/* ── Excel (SheetJS) ─────────────────────────────────────────────────────── */

/** One worksheet from a workbook, already flattened to a TableData. */
export interface SheetTable {
  name: string;
  table: TableData;
}

/**
 * Read every sheet of an .xlsx/.xls workbook into TableData. `hasHeader` treats
 * the first row of each sheet as headers (default true).
 */
export async function parseWorkbook(
  file: Blob,
  hasHeader = true,
): Promise<SheetTable[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  return wb.SheetNames.map((name) => {
    const sheet = wb.Sheets[name];
    const matrix = sheet
      ? (XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
          defval: "",
        }) as unknown[][])
      : [];
    return { name, table: matrixToTable(matrix, hasHeader) };
  });
}

/** Build an .xlsx Blob from one or more named sheets. */
export async function toXlsxBlob(
  sheets: Array<{ name: string; table: TableData }>,
): Promise<Blob> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  sheets.forEach((s, i) => {
    // Excel sheet names: max 31 chars, unique, no []:*?/\ characters.
    let name = (s.name || `Sheet${i + 1}`).replace(/[[\]:*?/\\]/g, "").slice(0, 31);
    if (!name) name = `Sheet${i + 1}`;
    let unique = name;
    let n = 1;
    while (used.has(unique.toLowerCase())) unique = `${name.slice(0, 28)}_${n++}`;
    used.add(unique.toLowerCase());
    const ws = XLSX.utils.aoa_to_sheet(tableToMatrix(s.table, true));
    XLSX.utils.book_append_sheet(wb, ws, unique);
  });
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
