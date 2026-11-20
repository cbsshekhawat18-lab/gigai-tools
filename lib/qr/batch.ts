/**
 * GigAI QR Studio, batch (CSV → many QRs → ZIP).
 *
 * Parses a CSV of rows, builds a payload per row (either a "content" CSV whose
 * columns map to a content type's fields, or a simple "value" CSV of raw
 * payloads), renders each with a shared {@link QRStyleConfig}, and packs the lot
 * into a ZIP via fflate. Fully client-side; heavy libs are dynamic-imported.
 *
 * Honest about scale: rendering thousands of styled QRs in the browser is real
 * work, so `generateBatch` reports progress and yields to the event loop between
 * rows to keep the UI responsive.
 */

import type { QRStyleConfig } from "./style";
import { buildPayload, type QRContentType, type QRFields } from "./content";
import { exportQr, type QrDownloadFormat } from "./export";

/** A minimal CSV parser (RFC-4180-ish: quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      pushField();
    } else if (ch === "\r") {
      // handled by the \n branch; skip lone CR
      if (text[i + 1] !== "\n") pushRow();
    } else if (ch === "\n") {
      pushRow();
    } else {
      field += ch;
    }
  }
  // Trailing field/row (unless the file ended exactly on a newline).
  if (field.length > 0 || row.length > 0) pushRow();
  // Drop a trailing fully-empty row (common when files end in a newline).
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last && last.length === 1 && last[0] === "") rows.pop();
  }
  return rows;
}

/** One row's resolved payload + a safe file name stem. */
export interface BatchRow {
  /** 1-based row number (excluding the header) for messages. */
  index: number;
  /** The payload string, or null if the row was incomplete. */
  payload: string | null;
  /** File-name stem (sanitised), unique within the batch. */
  name: string;
  /** The raw parsed cells (for the UI preview). */
  cells: Record<string, string>;
}

/** Result of {@link parseBatchCsv}. */
export interface BatchParse {
  header: string[];
  rows: BatchRow[];
  /** Rows that produced no payload (incomplete/invalid). */
  skipped: number;
}

/** Sanitise a string into a safe, short file-name stem. */
function safeName(input: string, fallback: string): string {
  const cleaned = input
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || fallback;
}

/**
 * Parse a CSV into batch rows.
 *
 * When `contentType` is given, every column header is treated as a field key
 * for that content type (e.g. headers `ssid,password` for a Wi-Fi batch), and a
 * `name`/`filename` column (if present) sets the file name. Otherwise the CSV is
 * a "simple" list: the first column is the raw payload and an optional second
 * column is the name.
 */
export function parseBatchCsv(text: string, contentType?: QRContentType): BatchParse {
  const table = parseCsv(text);
  if (table.length === 0) return { header: [], rows: [], skipped: 0 };

  const header = (table[0] ?? []).map((h) => h.trim());
  const bodyRows = table.slice(1);
  const nameCol = header.findIndex((h) => /^(name|filename|file)$/i.test(h));

  const usedNames = new Set<string>();
  const uniqueName = (stem: string): string => {
    let name = stem;
    let n = 2;
    while (usedNames.has(name)) name = `${stem}-${n++}`;
    usedNames.add(name);
    return name;
  };

  let skipped = 0;
  const rows: BatchRow[] = bodyRows
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((cells, i) => {
      const record: Record<string, string> = {};
      header.forEach((key, ci) => {
        record[key] = (cells[ci] ?? "").trim();
      });

      let payload: string | null;
      if (contentType) {
        const fields: QRFields = { ...record };
        payload = buildPayload(contentType, fields) || null;
      } else {
        const value = (cells[0] ?? "").trim();
        payload = value || null;
      }
      if (payload === null) skipped += 1;

      const rawName =
        nameCol >= 0
          ? cells[nameCol] ?? ""
          : record.name ?? record.ssid ?? record.url ?? cells[0] ?? "";
      const name = uniqueName(safeName(rawName, `qr-${i + 1}`));

      return { index: i + 1, payload, name, cells: record };
    });

  return { header, rows, skipped };
}

/** Progress callback for {@link generateBatch}. */
export type BatchProgress = (done: number, total: number) => void;

/** Options for {@link generateBatch}. */
export interface GenerateBatchOptions {
  format?: QrDownloadFormat;
  size?: number;
  quality?: number;
  onProgress?: BatchProgress;
  /** Abort flag the caller can flip to cancel a long run. */
  shouldCancel?: () => boolean;
}

/** Result of a completed batch. */
export interface BatchZip {
  blob: Blob;
  /** Number of QRs written to the ZIP. */
  count: number;
  /** Rows skipped because they produced no payload. */
  skipped: number;
}

/** Default extension for a download format (mirrors export.ts). */
function extFor(format: QrDownloadFormat): string {
  if (format === "png" || format === "png-transparent") return "png";
  if (format === "jpeg") return "jpg";
  if (format === "svg" || format === "svg-transparent") return "svg";
  return format; // pdf | eps | webp
}

/**
 * Render every valid row and pack the outputs into a ZIP. Yields to the event
 * loop between rows and reports progress so the UI stays responsive. Rows with
 * no payload are skipped (counted in the result), never faked.
 */
export async function generateBatch(
  rows: BatchRow[],
  style: QRStyleConfig,
  options: GenerateBatchOptions = {},
): Promise<BatchZip> {
  const format = options.format ?? "png";
  const size = options.size ?? 1024;
  const valid = rows.filter((r) => r.payload);
  const total = valid.length;
  if (total === 0) throw new Error("No valid rows to generate: check your CSV.");

  const { zipSync } = await import("fflate");
  const files: Record<string, Uint8Array> = {};
  const ext = extFor(format);

  let done = 0;
  for (const row of valid) {
    if (options.shouldCancel?.()) throw new Error("Batch cancelled.");
    const blob = await exportQr(row.payload!, style, size, format, { quality: options.quality });
    const buf = new Uint8Array(await blob.arrayBuffer());
    files[`${row.name}.${ext}`] = buf;
    done += 1;
    options.onProgress?.(done, total);
    // Yield so the progress bar can paint and the tab stays responsive.
    await new Promise((r) => setTimeout(r, 0));
  }

  const zipped = zipSync(files, { level: 6 });
  const blob = new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
  return { blob, count: done, skipped: rows.length - valid.length };
}

/** A ready-to-use CSV template string for a content type (or the simple form). */
export function csvTemplate(contentType?: QRContentType): string {
  if (!contentType) {
    return "value,name\nhttps://example.com,homepage\nhttps://example.com/pricing,pricing\n";
  }
  const templates: Partial<Record<QRContentType, string>> = {
    url: "url,name\nhttps://example.com,homepage\nhttps://example.com/about,about\n",
    wifi: "ssid,password,encryption,name\nCafe-Guest,welcome123,WPA,cafe-guest\nOffice,,nopass,office-open\n",
    text: "text,name\nHello world,greeting\nRow two,second\n",
    vcard: "firstName,lastName,phone,email,org,name\nAda,Lovelace,+15551234567,ada@example.com,Engines Ltd,ada\n",
    email: "email,subject,body,name\nhello@example.com,Hi,Message body,contact\n",
    phone: "phone,name\n+15551234567,support\n",
    sms: "phone,message,name\n+15551234567,Hello there,sms1\n",
  };
  return templates[contentType] ?? "value,name\n";
}
