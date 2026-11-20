/**
 * GigAI Tools, CSV / delimited-text engine.
 *
 * All parsing goes through papaparse (robust RFC-4180 quoting, embedded
 * newlines, auto delimiter detection), and Excel writing goes through SheetJS
 * (`xlsx`). Both are dynamic-imported so their payloads code-split out of the
 * initial bundle. Everything runs client-side. Files are never uploaded.
 *
 * Return shape convention across the whole document engine:
 *   { ok: true; result: T }  |  { ok: false; error: string }
 */

import { type Result, fail, message, ok } from "./shared";

export type { Result };

/** A parsed row when `header: true`, column name → cell value. */
export type CsvRecord = Record<string, string>;

/** Options shared by the CSV parsers. */
export interface ParseCsvOptions {
  /**
   * Field delimiter. Omit (or "auto") to let papaparse sniff it, which handles
   * comma / semicolon / tab / pipe files without the caller guessing.
   */
  delimiter?: string | "auto";
  /** When true, the first row is used as column headers (→ objects). */
  header?: boolean;
  /** Skip rows that are entirely empty (default true). */
  skipEmptyLines?: boolean;
}

/** Result of a header-less parse: a rectangular grid of strings. */
export interface CsvGrid {
  rows: string[][];
  /** Delimiter papaparse actually used (useful after auto-detection). */
  delimiter: string;
}

/** Result of a header parse: typed records plus the detected field order. */
export interface CsvTable {
  fields: string[];
  records: CsvRecord[];
  delimiter: string;
}

/** Lazily import papaparse once. */
async function loadPapa() {
  return (await import("papaparse")).default;
}

/**
 * Parse CSV text. With `header: true` you get `{ fields, records }`; otherwise a
 * `{ rows }` grid. `delimiter` defaults to auto-detection. Cells are coerced to
 * strings (never to numbers) so leading zeros / IDs survive round-trips.
 */
export async function parseCsv(
  text: string,
  opts: ParseCsvOptions = {},
): Promise<Result<CsvGrid | CsvTable>> {
  try {
    if (typeof text !== "string" || text.length === 0) {
      return fail("There's no CSV text to parse.");
    }
    const Papa = await loadPapa();
    const header = opts.header ?? false;
    const delimiter = !opts.delimiter || opts.delimiter === "auto" ? "" : opts.delimiter;

    const parsed = Papa.parse<string[] | CsvRecord>(text, {
      delimiter,
      header,
      skipEmptyLines: opts.skipEmptyLines ?? true,
      // Keep every value a string; we never want papaparse guessing types.
      dynamicTyping: false,
    });

    // papaparse only reports fatal structural problems as errors we should stop
    // on; field-count mismatches are recoverable, so we don't hard-fail here.
    const fatal = parsed.errors.find((e) => e.type === "Quotes" || e.type === "Delimiter");
    if (fatal) {
      return fail(`Couldn't parse this CSV: ${fatal.message}`);
    }

    const used = parsed.meta.delimiter || opts.delimiter || ",";

    if (header) {
      return ok({
        fields: parsed.meta.fields ?? [],
        records: parsed.data as CsvRecord[],
        delimiter: used,
      });
    }
    return ok({ rows: parsed.data as string[][], delimiter: used });
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Convert CSV text to a JSON array. With `header: true` each row becomes an
 * object keyed by column; otherwise each row is a string array. Pretty-printed
 * with 2-space indent so the output is human-readable.
 */
export async function csvToJson(
  csv: string,
  opts: { header?: boolean; pretty?: boolean } = {},
): Promise<Result<string>> {
  const parsed = await parseCsv(csv, { header: opts.header ?? true });
  if (!parsed.ok) return parsed;
  const data =
    "records" in parsed.result ? parsed.result.records : parsed.result.rows;
  try {
    const json = JSON.stringify(data, null, opts.pretty === false ? 0 : 2);
    return ok(json);
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Convert a JSON array to CSV via papaparse's `unparse` (handles quoting and
 * escaping). Accepts either a JSON string or an already-parsed array of objects
 * / arrays. Rejects non-array JSON with a clear message.
 */
export async function jsonToCsv(
  json: string | unknown[],
  opts: { delimiter?: string } = {},
): Promise<Result<string>> {
  try {
    const data: unknown = typeof json === "string" ? JSON.parse(json) : json;
    if (!Array.isArray(data)) {
      return fail("JSON must be an array of rows (objects or arrays) to become CSV.");
    }
    if (data.length === 0) return ok("");
    const Papa = await loadPapa();
    const csv = Papa.unparse(data as object[], {
      delimiter: opts.delimiter ?? ",",
    });
    return ok(csv);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return fail("That isn't valid JSON.");
    }
    return fail(message(err));
  }
}

/**
 * Convert CSV text into a real .xlsx workbook blob via SheetJS. The CSV is
 * parsed as a grid (no header coercion) and written into a single "Sheet1"
 * worksheet, so numbers stay text-faithful and every cell round-trips.
 */
export async function csvToExcelBlob(
  csv: string,
  opts: { sheetName?: string; delimiter?: string | "auto" } = {},
): Promise<Result<Blob>> {
  try {
    const parsed = await parseCsv(csv, { header: false, delimiter: opts.delimiter });
    if (!parsed.ok) return parsed;
    const rows = "rows" in parsed.result ? parsed.result.rows : [];
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(opts.sheetName ?? "Sheet1"));
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return ok(blob);
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Read one sheet of an Excel/CSV file and emit CSV text via SheetJS. `sheet`
 * selects by name or 0-based index; omit for the first sheet. Handles .xlsx,
 * .xls, .ods and .csv transparently (SheetJS sniffs the format).
 */
export async function excelToCsv(
  file: Blob,
  opts: { sheet?: string | number } = {},
): Promise<Result<string>> {
  try {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const names = wb.SheetNames;
    if (names.length === 0) return fail("This workbook has no sheets.");

    let name: string | undefined;
    if (typeof opts.sheet === "number") name = names[opts.sheet];
    else if (typeof opts.sheet === "string") name = names.includes(opts.sheet) ? opts.sheet : undefined;
    else name = names[0];
    if (!name) {
      return fail(`Sheet "${opts.sheet}" not found. Available: ${names.join(", ")}.`);
    }

    const ws = wb.Sheets[name];
    if (!ws) return fail(`Sheet "${name}" could not be read.`);
    const csv = XLSX.utils.sheet_to_csv(ws);
    return ok(csv);
  } catch (err) {
    return fail(message(err));
  }
}

/** Column-level summary for one field of a CSV table. */
export interface ColumnStat {
  field: string;
  /** Non-empty cell count. */
  filled: number;
  /** Empty/blank cell count. */
  empty: number;
  /** Distinct non-empty values. */
  unique: number;
  /** True when every non-empty cell parses as a finite number. */
  numeric: boolean;
  /** Numeric aggregates (only when `numeric` is true). */
  min?: number;
  max?: number;
  mean?: number;
  sum?: number;
}

/** Whole-table statistics returned by {@link csvStats}. */
export interface CsvStats {
  rowCount: number;
  columnCount: number;
  columns: ColumnStat[];
}

/**
 * Compute per-column statistics for a header'd CSV table (the `records` from a
 * header parse). Detects numeric columns and reports min/max/mean/sum for them;
 * for every column reports filled/empty/unique counts. Pure and synchronous.
 */
export function csvStats(records: CsvRecord[], fields?: string[]): CsvStats {
  const cols = fields && fields.length > 0
    ? fields
    : Array.from(new Set(records.flatMap((r) => Object.keys(r))));

  const columns: ColumnStat[] = cols.map((field) => {
    let filled = 0;
    let empty = 0;
    const seen = new Set<string>();
    const nums: number[] = [];
    let numeric = true;

    for (const rec of records) {
      const raw = rec[field];
      const val = raw == null ? "" : String(raw).trim();
      if (val === "") {
        empty += 1;
        continue;
      }
      filled += 1;
      seen.add(val);
      const n = Number(val);
      if (Number.isFinite(n)) nums.push(n);
      else numeric = false;
    }
    // A column with no filled cells isn't meaningfully "numeric".
    if (filled === 0) numeric = false;

    const stat: ColumnStat = {
      field,
      filled,
      empty,
      unique: seen.size,
      numeric,
    };
    if (numeric && nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      stat.sum = sum;
      stat.mean = sum / nums.length;
      stat.min = Math.min(...nums);
      stat.max = Math.max(...nums);
    }
    return stat;
  });

  return { rowCount: records.length, columnCount: cols.length, columns };
}

/** Excel sheet names cap at 31 chars and forbid `[]*?/\:`. */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[[\]*?/\\:]/g, " ").trim() || "Sheet1";
  return cleaned.slice(0, 31);
}
