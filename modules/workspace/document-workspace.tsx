/**
 * GigAI Workspace, DOCUMENT WORKSPACE.
 *
 * Chains real client-side document conversions on one or many dropped files
 * (CSV / TSV / JSON / XLSX / TXT / MD) without leaving the page. Every operation
 * is backed by an EXISTING function in `lib/document-tools/*`, nothing here
 * re-implements parsing or serialising. Each engine call is dynamic-imported
 * INSIDE `Operation.run`, so the heavy parsers (papaparse, SheetJS) stay out of
 * the initial bundle and only load the first time an op actually runs.
 *
 * ENGINES REUSED (all under lib/document-tools):
 *  • csv.ts, csvToJson, jsonToCsv, csvToExcelBlob, excelToCsv
 *  • text.ts: prettyJson, readText
 *  • tabular.ts, parseCsv, parseWorkbook (for the read-only preview only)
 * No conversion is invented: only the ones the engine truly implements are
 * exposed, and the UI is honest about which formats round-trip losslessly.
 *
 * The document blob is opaque bytes, so this is a SHELL-BASED workspace with a
 * CUSTOM `renderPreview` (first rows for tabular files, first lines for text)
 * and a `thumbIcon` fallback. The whole-page drop guard + pipeline + undo/redo +
 * ZIP download come for free from <WorkspaceShell>.
 *
 * Mounted as a next/dynamic({ ssr:false }) client island from the server page.
 * This module never imports @/lib/registry, @/lib/search, or @/config/tools.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type {
  Asset,
  Operation,
  OperationParams,
  OperationResult,
  ParamControlsProps,
  WorkspaceCategory,
} from "@/lib/workspace/types";

/* ── Accepted input ──────────────────────────────────────────────────────── */

const ACCEPT_EXT = ".csv,.tsv,.json,.xlsx,.txt,.md";
const ACCEPT_MIMES = [
  "text/csv",
  "text/tab-separated-values",
  "application/json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
  "text/markdown",
];

/* ── Format helpers (name → detected kind, no bytes read) ─────────────────── */

type DocFormat = "csv" | "tsv" | "json" | "xlsx" | "txt" | "md";

/** Classify a filename into one of the formats this workspace handles. */
function formatOf(name: string, mime = ""): DocFormat {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  if (ext === "csv") return "csv";
  if (ext === "tsv") return "tsv";
  if (ext === "json") return "json";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "txt" || ext === "text" || ext === "log") return "txt";
  // Fall back to MIME for extension-less names.
  const t = mime.toLowerCase();
  if (t.includes("csv")) return "csv";
  if (t.includes("json")) return "json";
  if (t.includes("spreadsheet") || t.includes("excel")) return "xlsx";
  if (t.includes("markdown")) return "md";
  return "txt";
}

/** True for grid-like formats papaparse / SheetJS can read into rows. */
function isTabular(fmt: DocFormat): boolean {
  return fmt === "csv" || fmt === "tsv" || fmt === "xlsx";
}

/** Swap a filename's extension, preserving the base name. */
function withExt(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Build a text OperationResult (updates mime + name to match the new format). */
function textResult(text: string, name: string, mime: string): OperationResult {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  return { blob, name, meta: { size: blob.size, mime } };
}

/* ── Small controlled param widgets (no external UI deps) ─────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SegChoice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-input p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-primary"
      />
      {label}
    </label>
  );
}

/** Small "unwraps a Result" helper: throws the engine's message so the store
 *  surfaces it in the shell's error region rather than a silent failure. */
function unwrap<T>(r: { ok: true; result: T } | { ok: false; error: string }): T {
  if (!r.ok) throw new Error(r.error);
  return r.result;
}

/* ── Operations ──────────────────────────────────────────────────────────────
 * Each Operation delegates to a real lib/document-tools function. `run` MUST
 * NOT mutate `asset`; it reads `asset.currentBlob` and returns a new blob.
 */

/* CSV → JSON --------------------------------------------------------------- */

type CsvToJsonParams = OperationParams & {
  /** "objects" keys each row by the header row; "arrays" emits row arrays. */
  shape: "objects" | "arrays";
  pretty: boolean;
};

const csvToJson: Operation<CsvToJsonParams> = {
  id: "document.csvToJson",
  label: "CSV → JSON",
  description: "Turn CSV/TSV rows into a JSON array (objects or arrays)",
  icon: "Braces",
  accepts: ["document"],
  defaultParams: { shape: "objects", pretty: true },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading…");
    const text = await asset.currentBlob.text();
    const { csvToJson: toJson } = await import("@/lib/document-tools/csv");
    onProgress?.(0.5, "Converting…");
    const json = unwrap(
      await toJson(text, { header: params.shape === "objects", pretty: params.pretty }),
    );
    onProgress?.(1, "Done");
    return textResult(json, withExt(asset.name, "json"), "application/json");
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<CsvToJsonParams>) => (
    <div className="space-y-2.5">
      <Field label="Output shape">
        <SegChoice
          value={params.shape}
          onChange={(shape) => onChange({ ...params, shape })}
          options={[
            { value: "objects", label: "Objects (use header)" },
            { value: "arrays", label: "Arrays" },
          ]}
        />
      </Field>
      <Check
        label="Pretty-print (2-space indent)"
        checked={params.pretty}
        onChange={(pretty) => onChange({ ...params, pretty })}
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        The delimiter is auto-detected (comma / tab / semicolon). Cells stay
        strings, so IDs and leading zeros survive.
      </p>
    </div>
  ),
};

/* JSON → CSV --------------------------------------------------------------- */

type JsonToCsvParams = OperationParams & {
  delimiter: "," | "\t" | ";";
};

const jsonToCsv: Operation<JsonToCsvParams> = {
  id: "document.jsonToCsv",
  label: "JSON → CSV",
  description: "Flatten a JSON array of rows into CSV",
  icon: "Table",
  accepts: ["document"],
  defaultParams: { delimiter: "," },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading…");
    const text = await asset.currentBlob.text();
    const { jsonToCsv: toCsv } = await import("@/lib/document-tools/csv");
    onProgress?.(0.5, "Converting…");
    const csv = unwrap(await toCsv(text, { delimiter: params.delimiter }));
    onProgress?.(1, "Done");
    const ext = params.delimiter === "\t" ? "tsv" : "csv";
    return textResult(csv, withExt(asset.name, ext), "text/csv");
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<JsonToCsvParams>) => (
    <div className="space-y-2.5">
      <Field label="Delimiter">
        <SegChoice
          value={params.delimiter}
          onChange={(delimiter) => onChange({ ...params, delimiter })}
          options={[
            { value: ",", label: "Comma" },
            { value: "\t", label: "Tab" },
            { value: ";", label: "Semicolon" },
          ]}
        />
      </Field>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Input must be a JSON <em>array</em> of rows (objects or arrays). Nested
        objects are stringified per-cell; CSV is flat by nature.
      </p>
    </div>
  ),
};

/* CSV → XLSX --------------------------------------------------------------- */

type CsvToXlsxParams = OperationParams;

const csvToXlsx: Operation<CsvToXlsxParams> = {
  id: "document.csvToXlsx",
  label: "CSV → Excel",
  description: "Write CSV/TSV into a real .xlsx workbook (SheetJS)",
  icon: "Sheet",
  accepts: ["document"],
  defaultParams: {},
  run: async (asset, _params, onProgress) => {
    onProgress?.(0.1, "Reading…");
    const text = await asset.currentBlob.text();
    const { csvToExcelBlob } = await import("@/lib/document-tools/csv");
    onProgress?.(0.5, "Building workbook…");
    const blob = unwrap(await csvToExcelBlob(text, { delimiter: "auto" }));
    onProgress?.(1, "Done");
    return {
      blob,
      name: withExt(asset.name, "xlsx"),
      meta: { size: blob.size, mime: XLSX_MIME },
    };
  },
  ParamControls: () => (
    <p className="text-[11px] leading-relaxed text-muted-foreground">
      The delimiter is auto-detected. Every cell is written as text, so numbers
      and IDs round-trip exactly (Excel won&apos;t reformat them).
    </p>
  ),
};

/* Excel → CSV -------------------------------------------------------------- */

type XlsxToCsvParams = OperationParams;

const xlsxToCsv: Operation<XlsxToCsvParams> = {
  id: "document.xlsxToCsv",
  label: "Excel → CSV",
  description: "Export the first sheet of a workbook as CSV",
  icon: "Table",
  accepts: ["document"],
  defaultParams: {},
  run: async (asset, _params, onProgress) => {
    onProgress?.(0.2, "Reading workbook…");
    const { excelToCsv } = await import("@/lib/document-tools/csv");
    onProgress?.(0.6, "Exporting sheet…");
    const csv = unwrap(await excelToCsv(asset.currentBlob));
    onProgress?.(1, "Done");
    return textResult(csv, withExt(asset.name, "csv"), "text/csv");
  },
  ParamControls: () => (
    <p className="text-[11px] leading-relaxed text-muted-foreground">
      Exports the workbook&apos;s <strong>first</strong> sheet. Multi-sheet
      workbooks keep only sheet one, chain another export for others.
    </p>
  ),
};

/* To plain text ------------------------------------------------------------ */

type ToTextParams = OperationParams;

const toPlainText: Operation<ToTextParams> = {
  id: "document.toText",
  label: "To Plain Text",
  description: "Save the current file as a .txt copy",
  icon: "FileText",
  accepts: ["document"],
  defaultParams: {},
  run: async (asset, _params, onProgress) => {
    onProgress?.(0.2, "Reading…");
    const fmt = formatOf(asset.name, asset.meta.mime);
    let text: string;
    if (fmt === "xlsx") {
      // Flatten the first sheet to CSV so a binary workbook yields readable text.
      const { excelToCsv } = await import("@/lib/document-tools/csv");
      text = unwrap(await excelToCsv(asset.currentBlob));
    } else {
      text = await asset.currentBlob.text();
    }
    onProgress?.(1, "Done");
    return textResult(text, withExt(asset.name, "txt"), "text/plain");
  },
  ParamControls: () => (
    <p className="text-[11px] leading-relaxed text-muted-foreground">
      Text-based files (CSV, JSON, MD) are copied verbatim as UTF-8. Excel
      workbooks are flattened to their first sheet&apos;s CSV text first.
    </p>
  ),
};

/* Format JSON -------------------------------------------------------------- */

type FormatJsonParams = OperationParams & {
  mode: "pretty" | "minify";
};

const formatJson: Operation<FormatJsonParams> = {
  id: "document.formatJson",
  label: "Format JSON",
  description: "Pretty-print or minify a JSON file",
  icon: "Braces",
  accepts: ["document"],
  defaultParams: { mode: "pretty" },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.2, "Parsing…");
    const text = await asset.currentBlob.text();
    // Parse first so we fail loudly on invalid JSON (prettyJson would no-op).
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error("That file isn't valid JSON: nothing to format.");
    }
    const out =
      params.mode === "pretty"
        ? JSON.stringify(value, null, 2)
        : JSON.stringify(value);
    onProgress?.(1, "Done");
    return textResult(out, withExt(asset.name, "json"), "application/json");
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<FormatJsonParams>) => (
    <div className="space-y-2.5">
      <SegChoice
        value={params.mode}
        onChange={(mode) => onChange({ ...params, mode })}
        options={[
          { value: "pretty", label: "Pretty (2-space)" },
          { value: "minify", label: "Minify" },
        ]}
      />
      <p className="text-[11px] text-muted-foreground">
        Invalid JSON stops the step with an error, it&apos;s never silently
        passed through.
      </p>
    </div>
  ),
};

/* Clean whitespace --------------------------------------------------------- */

type CleanParams = OperationParams & {
  trimLines: boolean;
  collapseBlank: boolean;
  tabsToSpaces: boolean;
  spacesPerTab: number;
  finalNewline: boolean;
};

const cleanWhitespace: Operation<CleanParams> = {
  id: "document.clean",
  label: "Clean Whitespace",
  description: "Trim trailing spaces, tidy blank lines & tabs in text",
  icon: "Wand2",
  accepts: ["document"],
  defaultParams: {
    trimLines: true,
    collapseBlank: true,
    tabsToSpaces: false,
    spacesPerTab: 2,
    finalNewline: true,
  },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.2, "Reading…");
    let text = await asset.currentBlob.text();
    // Normalise line endings to \n first so the rules are predictable.
    text = text.replace(/\r\n?/g, "\n");
    if (params.tabsToSpaces) {
      const pad = " ".repeat(Math.max(1, Math.min(8, params.spacesPerTab)));
      text = text.replace(/\t/g, pad);
    }
    if (params.trimLines) {
      text = text
        .split("\n")
        .map((line) => line.replace(/[ \t]+$/g, ""))
        .join("\n");
    }
    if (params.collapseBlank) {
      // Collapse 3+ consecutive blank lines down to a single blank line.
      text = text.replace(/\n{3,}/g, "\n\n");
    }
    text = text.replace(/\n+$/g, "");
    if (params.finalNewline) text += "\n";
    onProgress?.(1, "Done");
    const mime = asset.meta.mime ?? "text/plain";
    return textResult(text, asset.name, mime);
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<CleanParams>) => (
    <div className="space-y-2">
      <Check
        label="Trim trailing spaces per line"
        checked={params.trimLines}
        onChange={(trimLines) => onChange({ ...params, trimLines })}
      />
      <Check
        label="Collapse 3+ blank lines → one"
        checked={params.collapseBlank}
        onChange={(collapseBlank) => onChange({ ...params, collapseBlank })}
      />
      <Check
        label="Convert tabs to spaces"
        checked={params.tabsToSpaces}
        onChange={(tabsToSpaces) => onChange({ ...params, tabsToSpaces })}
      />
      <Check
        label="End file with a single newline"
        checked={params.finalNewline}
        onChange={(finalNewline) => onChange({ ...params, finalNewline })}
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Operates on the raw text of the file (CRLF is normalised to LF). Runs on
        any text-based document; leave the format unchanged.
      </p>
    </div>
  ),
};

/* ── Category config ─────────────────────────────────────────────────────── */

/**
 * Erase each op's specific param type to the catalog's `Operation` shape (the
 * store always calls run/ParamControls with the same step's params object it
 * seeded from `defaultParams`, so the concrete op receives its exact type).
 */
function asOp<P extends OperationParams>(op: Operation<P>): Operation {
  return op as unknown as Operation;
}

const OPERATIONS: Operation[] = [
  asOp(csvToJson),
  asOp(jsonToCsv),
  asOp(csvToXlsx),
  asOp(xlsxToCsv),
  asOp(formatJson),
  asOp(toPlainText),
  asOp(cleanWhitespace),
];

/* ── Read-only preview ───────────────────────────────────────────────────────
 * A small, scrollable peek at the CURRENT document: first rows as a table for
 * tabular formats (via tabular.parseCsv / parseWorkbook), or the first lines of
 * raw text otherwise. Async parsing is done in an effect keyed by the asset's
 * identity + blob so the preview refreshes after every applied step.
 */

const PREVIEW_ROWS = 12;
const PREVIEW_LINES = 40;

interface Peek {
  kind: "table" | "text" | "empty";
  headers?: string[];
  rows?: string[][];
  text?: string;
  truncated?: boolean;
}

function DocumentPreview({ asset }: { asset: Asset }) {
  const [peek, setPeek] = useState<Peek | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-key on blob so the preview updates as the pipeline mutates the asset.
  useEffect(() => {
    let cancelled = false;
    setPeek(null);
    setError(null);
    const blob = asset.currentBlob;
    const fmt = formatOf(asset.name, asset.meta.mime);

    (async () => {
      try {
        if (isTabular(fmt)) {
          const { parseCsv, parseWorkbook } = await import(
            "@/lib/document-tools/tabular"
          );
          if (fmt === "xlsx") {
            const sheets = await parseWorkbook(blob, true);
            const first = sheets[0];
            if (!first) {
              if (!cancelled) setPeek({ kind: "empty" });
              return;
            }
            const rows = first.table.rows.slice(0, PREVIEW_ROWS);
            if (!cancelled)
              setPeek({
                kind: "table",
                headers: first.table.headers,
                rows,
                truncated: first.table.rows.length > PREVIEW_ROWS,
              });
          } else {
            const text = await blob.text();
            const delimiter = fmt === "tsv" ? "\t" : undefined;
            const table = await parseCsv(
              text,
              delimiter ? { header: true, delimiter } : { header: true },
            );
            const rows = table.rows.slice(0, PREVIEW_ROWS);
            if (!cancelled)
              setPeek({
                kind: "table",
                headers: table.headers,
                rows,
                truncated: table.rows.length > PREVIEW_ROWS,
              });
          }
        } else {
          const text = await blob.text();
          const lines = text.split(/\r\n|\r|\n/);
          const shown = lines.slice(0, PREVIEW_LINES).join("\n");
          if (!cancelled)
            setPeek({
              kind: text.trim() ? "text" : "empty",
              text: shown,
              truncated: lines.length > PREVIEW_LINES,
            });
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Couldn't read this file.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [asset.currentBlob, asset.name, asset.meta.mime]);

  const frame =
    "w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card text-left";

  if (error) {
    return (
      <div className={cn(frame, "flex items-center gap-2 p-4 text-xs text-destructive")}>
        <Icon name="TriangleAlert" size={14} />
        <span>{error}</span>
      </div>
    );
  }
  if (!peek) {
    return (
      <div className={cn(frame, "flex items-center gap-2 p-4 text-xs text-muted-foreground")}>
        <Icon name="LoaderCircle" size={14} className="animate-spin" />
        <span>Reading preview…</span>
      </div>
    );
  }
  if (peek.kind === "empty") {
    return (
      <div className={cn(frame, "flex flex-col items-center gap-2 p-8 text-muted-foreground")}>
        <Icon name="FileType" size={40} />
        <span className="text-xs">Empty or non-text document.</span>
      </div>
    );
  }
  if (peek.kind === "table") {
    return (
      <div className={cn(frame, "max-h-[52vh]")}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr>
              {(peek.headers ?? []).map((h, i) => (
                <th
                  key={i}
                  className="border-b border-border px-2.5 py-1.5 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(peek.rows ?? []).map((row, r) => (
              <tr key={r} className="odd:bg-muted/30">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="max-w-[16rem] truncate border-b border-border/50 px-2.5 py-1 text-muted-foreground"
                    title={cell}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {peek.truncated && (
          <p className="px-2.5 py-1.5 text-[11px] text-muted-foreground">
            Showing the first {PREVIEW_ROWS} rows.
          </p>
        )}
      </div>
    );
  }
  // text
  return (
    <div className={cn(frame, "max-h-[52vh]")}>
      <pre className="whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        {peek.text}
      </pre>
      {peek.truncated && (
        <p className="px-3 pb-2 text-[11px] text-muted-foreground">
          Showing the first {PREVIEW_LINES} lines.
        </p>
      )}
    </div>
  );
}

/**
 * Build the Document WorkspaceCategory. `createAsset` stores the raw file and a
 * (unused-by-<img>) object URL; metadata is just size + mime since documents
 * have no pixel dimensions. The custom `renderPreview` shows the content.
 */
function createDocumentCategory(): WorkspaceCategory {
  return {
    id: "document",
    title: "Document Workspace",
    kind: "document",
    accept: ACCEPT_EXT,
    acceptMimes: ACCEPT_MIMES,
    operations: OPERATIONS,
    defaultExt: "txt",
    thumbIcon: "FileType",
    renderPreview: (asset) => <DocumentPreview asset={asset} />,
    createAsset: async (file, id): Promise<Asset> => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        name: file.name,
        kind: "document",
        originalBlob: file,
        currentBlob: file,
        previewUrl,
        meta: {
          size: file.size,
          mime: file.type || guessMime(file.name),
        },
        history: [],
        future: [],
      };
    },
  };
}

/** Best-effort MIME from a filename when the browser reports none. */
function guessMime(name: string): string {
  switch (formatOf(name)) {
    case "json":
      return "application/json";
    case "csv":
    case "tsv":
      return "text/csv";
    case "xlsx":
      return XLSX_MIME;
    case "md":
      return "text/markdown";
    default:
      return "text/plain";
  }
}

/* ── Component (default export) ──────────────────────────────────────────── */

export default function DocumentWorkspace() {
  const category = useMemo(createDocumentCategory, []);

  return (
    <div className="space-y-4">
      <WorkspaceShell category={category} />
      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className="mt-0.5 text-primary" />
        <span>
          Every file is parsed entirely in your browser: nothing is uploaded.
          Chain conversions like <strong className="text-foreground">CSV → JSON</strong> or{" "}
          <strong className="text-foreground">CSV → Excel</strong>, run them across all your
          files at once, then download as a ZIP.{" "}
          <strong className="text-foreground">Round-trips honestly:</strong> CSV ⇄ JSON and
          CSV ⇄ Excel are lossless for flat tables; Excel → CSV keeps only the first sheet and
          drops formulas/styling; nested JSON is stringified per cell when flattened to CSV.
          SheetJS and the CSV parser load the first time a conversion runs, so the first click
          is slightly slower.
        </span>
      </p>
    </div>
  );
}
