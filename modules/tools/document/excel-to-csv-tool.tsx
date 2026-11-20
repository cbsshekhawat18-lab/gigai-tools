"use client";

/**
 * Excel to CSV, a premium, in-browser XLSX/XLS → CSV converter.
 *
 * Flow: drop an .xlsx / .xls → SheetJS reads the whole workbook
 * (`readWorkbook`) → a sheet picker lists every tab → the chosen sheet renders
 * live in a read-only <DataGrid> and its raw CSV shows alongside → then copy the
 * CSV, download it as a .csv named after the sheet, or export every tab at once
 * as separate CSV files. Everything runs on the device; nothing is uploaded.
 *
 * Reuses the document engine verbatim, `readWorkbook` (multi-sheet parse) for
 * the picker + preview and `excelToCsv` (SheetJS's own RFC-4180 `sheet_to_csv`)
 * for the authoritative output: plus the shared document UI
 * (`DocumentDropzone`, `DataGrid`) and the dev harness (`download`,
 * `CopyButton`, `StatBadge`). SheetJS is lazy-imported inside the engine, so
 * this module stays light.
 *
 * HONEST limits (surfaced in the UI): CSV is a single flat table, so formulas
 * export as their last value and charts / images / formatting / multi-sheet
 * structure cannot be represented: one sheet becomes one CSV.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { WorkspaceToolData } from "@/types";
import {
  type Workbook,
  readWorkbook,
} from "@/lib/document-tools/excel";
import { excelToCsv } from "@/lib/document-tools/csv";
import {
  type TableData,
  matrixToTable,
} from "@/lib/document-tools";
import {
  DataGrid,
  DocumentDropzone,
  type DetectedFile,
} from "@/components/tool/document";
import { CopyButton, StatBadge, download } from "@/components/tool/dev";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** UTF-8 byte length: the real on-disk size of the CSV. */
const ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
function byteLength(s: string): number {
  if (ENCODER) return ENCODER.encode(s).length;
  return unescape(encodeURIComponent(s)).length;
}

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Make a filename-safe slug from a sheet name. */
function safeName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_");
  return cleaned || "sheet";
}

/** Small delay so the browser flushes each sequential download. */
function tick(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Busy = null | "csv" | "all";

/* ── Component ───────────────────────────────────────────────────────────── */

export default function ExcelToCsvTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [workbook, setWorkbook] = React.useState<Workbook | null>(null);
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [sheetName, setSheetName] = React.useState<string>("");
  const [csv, setCsv] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [reading, setReading] = React.useState(false);
  const [busy, setBusy] = React.useState<Busy>(null);

  /** The active sheet's grid, rendered read-only (first row as headers). */
  const table: TableData | null = React.useMemo(() => {
    if (!workbook) return null;
    const sheet = workbook.sheets.find((s) => s.name === sheetName);
    if (!sheet) return null;
    return matrixToTable(sheet.rows, true);
  }, [workbook, sheetName]);

  /** Re-derive the authoritative CSV whenever the active sheet changes. */
  React.useEffect(() => {
    let alive = true;
    const file = selected?.file;
    if (!file || !sheetName) {
      setCsv("");
      return;
    }
    void excelToCsv(file, { sheet: sheetName }).then((res) => {
      if (!alive) return;
      if (res.ok) {
        setCsv(res.result);
      } else {
        setCsv("");
        setError(res.error);
      }
    });
    return () => {
      alive = false;
    };
  }, [selected, sheetName]);

  const onFile = React.useCallback(async (detected: DetectedFile) => {
    setError(null);
    setReading(true);
    try {
      const res = await readWorkbook(detected.file);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const first = res.result.sheets[0];
      setWorkbook(res.result);
      setSelected(detected);
      setSheetName(first ? first.name : "");
    } catch {
      setError("We couldn't read that workbook. Please try another .xlsx or .xls file.");
    } finally {
      setReading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setWorkbook(null);
    setSelected(null);
    setSheetName("");
    setCsv("");
    setError(null);
    setBusy(null);
  }, []);

  const baseName = selected
    ? selected.file.name.replace(/\.[^.]+$/, "")
    : "workbook";

  /* ── Exports (all in-browser) ──────────────────────────────────────────── */

  const exportCsv = React.useCallback(() => {
    if (!csv || !sheetName) return;
    setBusy("csv");
    try {
      const name = `${safeName(baseName)}-${safeName(sheetName)}.csv`;
      download(name, new Blob([csv], { type: "text/csv;charset=utf-8" }));
    } finally {
      setBusy(null);
    }
  }, [csv, sheetName, baseName]);

  const exportAll = React.useCallback(async () => {
    const file = selected?.file;
    if (!workbook || !file) return;
    setBusy("all");
    setError(null);
    try {
      for (const sheet of workbook.sheets) {
        const res = await excelToCsv(file, { sheet: sheet.name });
        if (!res.ok) {
          setError(res.error);
          break;
        }
        const name = `${safeName(baseName)}-${safeName(sheet.name)}.csv`;
        download(name, new Blob([res.result], { type: "text/csv;charset=utf-8" }));
        // Give the browser a beat between saves so none are dropped.
        await tick(180);
      }
    } finally {
      setBusy(null);
    }
  }, [workbook, selected, baseName]);

  const sheetCount = workbook?.sheets.length ?? 0;
  const hasData = !!workbook;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input: dropzone (before a workbook is loaded) ── */}
      {!hasData && (
        <div className="flex flex-col gap-4">
          <DocumentDropzone
            accept={["xlsx"]}
            onFile={onFile}
            selected={selected}
            onClear={reset}
            disabled={reading}
            icon="FileSpreadsheet"
            label="Drop an Excel workbook (.xlsx or .xls)"
            hint="Every sheet is read locally in your browser. Pick the tab you want and download a clean CSV. Nothing is uploaded."
          />

          <div className="flex flex-wrap items-center gap-3">
            {reading && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="LoaderCircle" size={16} className="animate-spin" />
                Reading workbook…
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              Both modern .xlsx and legacy .xls files are supported.
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>
      )}

      {/* ── Converter ── */}
      {hasData && workbook && (
        <div className="flex flex-col gap-4">
          {/* Toolbar: sheet picker + stats + reset */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Icon name="Layers" size={16} className={style.text} />
                <span className="text-muted-foreground">Sheet</span>
                <select
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  aria-label="Choose a sheet to convert"
                  className={cn(
                    "h-9 max-w-[16rem] truncate rounded-md border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2",
                    style.ring,
                  )}
                >
                  {workbook.sheets.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              {sheetCount > 1 && (
                <StatBadge icon="Copy" label="Sheets" value={sheetCount.toLocaleString()} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {table && (
                <>
                  <StatBadge
                    icon="Rows3"
                    label="Rows"
                    value={table.rows.length.toLocaleString()}
                  />
                  <StatBadge
                    icon="Columns3"
                    label="Columns"
                    value={table.headers.length.toLocaleString()}
                  />
                  <StatBadge
                    tone="info"
                    icon="FileText"
                    label="CSV size"
                    value={formatBytes(byteLength(csv))}
                  />
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                className="gap-1.5"
              >
                <Icon name="RotateCcw" size={15} />
                New file
              </Button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          {/* Preview grid (read-only - this is a converter, not an editor) */}
          {table && (
            <DataGrid
              data={table}
              editable={false}
              height={460}
              emptyLabel="This sheet has no rows."
            />
          )}

          {/* Export bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="ShieldCheck" size={16} className={style.text} />
              <span>CSV is generated on your device. Never uploaded.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CopyButton value={csv} label="Copy CSV" />
              <Button
                type="button"
                size="sm"
                onClick={exportCsv}
                disabled={!csv || busy !== null}
                className={cn("gap-1.5", style.solid)}
              >
                <Icon name="FileDown" size={15} />
                {busy === "csv" ? "Preparing…" : "Download CSV"}
              </Button>
              {sheetCount > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportAll}
                  disabled={busy !== null}
                  className="gap-1.5"
                >
                  <Icon name="CopyPlus" size={15} />
                  {busy === "all" ? "Exporting…" : `Export all ${sheetCount} sheets`}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            CSV is produced by SheetJS&rsquo;s own writer, so values with commas,
            quotes or line breaks are escaped correctly (RFC 4180). Because CSV is a
            single flat table, formulas are exported as their last-calculated value
            and charts, images, colors and merged-cell layouts can&rsquo;t be
            represented, one sheet becomes one CSV. &ldquo;Export all&rdquo; saves
            each tab as its own file.
          </p>
        </div>
      )}
    </div>
  );
}
