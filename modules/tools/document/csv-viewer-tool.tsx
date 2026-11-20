"use client";

/**
 * CSV Viewer, a fast, read-only CSV reader and the profiling counterpart to
 * the editable CSV Editor.
 *
 * Flow: drop / paste a CSV (delimiter auto-detected) → it parses (quoting-aware)
 * into a read-only, windowed <DataGrid> you can sort and search across, plus a
 * live per-column profile (type, filled/empty, unique, and numeric
 * min/max/mean/sum) → then export a clean CSV or a formatted JSON array, or copy
 * the CSV to the clipboard. Everything runs on the device; nothing is uploaded.
 *
 * REUSES the shared client-side engine rather than reinventing anything:
 * `parseCsv` (Result-based, header parse → CsvTable) and `csvStats` from
 * `@/lib/document-tools/csv`, `matrixToTable` / `toCsv` from the barrel, plus
 * the shared document UI (`DocumentDropzone`, `DataGrid` in read-only mode) and
 * the dev harness (`download`, `CopyButton`, `StatBadge`, `ExamplesMenu`). Heavy
 * libs (papaparse) stay lazy inside the engine, so this module is light.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { WorkspaceToolData } from "@/types";
import { type TableData, matrixToTable, toCsv } from "@/lib/document-tools";
import {
  parseCsv,
  csvStats,
  type CsvTable,
  type CsvStats,
} from "@/lib/document-tools/csv";
import {
  DataGrid,
  DocumentDropzone,
  type DetectedFile,
} from "@/components/tool/document";
import {
  CopyButton,
  StatBadge,
  ExamplesMenu,
  download,
  type Example,
} from "@/components/tool/dev";

/* ── Samples ─────────────────────────────────────────────────────────────── */

const SAMPLE_SALES = [
  "region,rep,deals,revenue_usd,win_rate",
  'North,"Ada Okonkwo",34,412000,0.61',
  "North,Grace Lim,29,388500,0.55",
  'South,"Kai Ramírez, Jr.",41,502750,0.67',
  "South,Priya Nair,,296000,0.48",
  "West,Tomás Alvi,38,455900,0.60",
].join("\n");

const SAMPLE_INVENTORY = [
  "sku;product;category;in_stock;price_usd",
  "GK-1001;Mechanical Keyboard;Peripherals;42;89.00",
  'GK-1002;27" 4K Monitor;Displays;18;319.50',
  "GK-1003;USB-C Dock;Accessories;0;74.99",
  "GK-1004;Ergonomic Mouse;Peripherals;120;39.00",
  "GK-1005;Laptop Stand;Accessories;;29.00",
].join("\n");

const SAMPLE_SIGNUPS = [
  "email\tplan\tcountry\tmrr",
  "sam@acme.io\tPro\tUS\t49",
  "lena@studio.de\tTeam\tDE\t199",
  "kenji@lab.jp\tPro\tJP\t49",
  "priya@build.in\tFree\tIN\t0",
].join("\n");

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Sales (comma CSV)",
    description: "Quoted fields + an empty cell to profile",
    value: SAMPLE_SALES,
    icon: "TrendingUp",
  },
  {
    label: "Inventory (semicolon)",
    description: "Semicolon-delimited, auto-detected",
    value: SAMPLE_INVENTORY,
    icon: "Boxes",
  },
  {
    label: "Signups (tab-separated)",
    description: "TSV pasted from a spreadsheet",
    value: SAMPLE_SIGNUPS,
    icon: "MailPlus",
  },
];

/* ── Types ───────────────────────────────────────────────────────────────── */

/** Everything a parsed file needs to render: grid + records + profile. */
interface ViewerData {
  table: TableData;
  stats: CsvStats;
  /** Keyed records straight from papaparse, reused for the JSON export. */
  records: CsvTable["records"];
}

type Busy = null | "csv" | "json";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Count cells (excluding headers) that contain the query, case-insensitive. */
function countMatches(table: TableData, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  let n = 0;
  for (const row of table.rows) {
    for (const cell of row) {
      if (cell.toLowerCase().includes(q)) n += 1;
    }
  }
  return n;
}

/** Total non-header cell count for the stat badge. */
function cellCount(table: TableData): number {
  return table.rows.length * table.headers.length;
}

/** Compact number formatting for the profile (keeps big means readable). */
function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Turn a Result-based header parse into everything the viewer renders. The
 * header parse hands back `fields` + keyed `records`; we build a display
 * `TableData` from them (via `matrixToTable`) and profile the records once.
 */
function buildViewerData(parsed: CsvTable): ViewerData {
  const fields = parsed.fields.length
    ? parsed.fields
    : // Fallback: derive columns from the first record when meta.fields is empty.
      Array.from(new Set(parsed.records.flatMap((r) => Object.keys(r))));
  const matrix: string[][] = [
    fields,
    ...parsed.records.map((rec) => fields.map((f) => rec[f] ?? "")),
  ];
  const table = matrixToTable(matrix, true);
  const stats = csvStats(parsed.records, fields);
  return { table, stats, records: parsed.records };
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function CsvViewerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [data, setData] = React.useState<ViewerData | null>(null);
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<Busy>(null);
  const [showProfile, setShowProfile] = React.useState(true);
  const [copyText, setCopyText] = React.useState("");

  // Keep a clean CSV string in sync for the copy / CSV-export actions.
  React.useEffect(() => {
    let alive = true;
    if (!data) {
      setCopyText("");
      return;
    }
    void toCsv(data.table).then((csv) => {
      if (alive) setCopyText(csv);
    });
    return () => {
      alive = false;
    };
  }, [data]);

  const loadCsvText = React.useCallback(
    async (text: string, source: DetectedFile | null) => {
      setError(null);
      const parsed = await parseCsv(text, { header: true });
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      // With `header: true`, parseCsv returns a CsvTable (has `records`).
      if (!("records" in parsed.result)) {
        setError("We couldn't read a header row from that CSV.");
        return;
      }
      setData(buildViewerData(parsed.result));
      setSelected(source);
      setQuery("");
    },
    [],
  );

  const onFile = React.useCallback(
    async (detected: DetectedFile) => {
      try {
        const text = await detected.file.text();
        await loadCsvText(text, detected);
      } catch {
        setError("We couldn't read that file. Please try another CSV.");
      }
    },
    [loadCsvText],
  );

  const reset = React.useCallback(() => {
    setData(null);
    setSelected(null);
    setQuery("");
    setError(null);
  }, []);

  /* ── Exports (all in-browser) ──────────────────────────────────────────── */

  const baseName = selected
    ? selected.file.name.replace(/\.[^.]+$/, "")
    : "gigai-csv";

  const exportCsv = React.useCallback(async () => {
    if (!data) return;
    setBusy("csv");
    try {
      const csv = await toCsv(data.table);
      download(
        `${baseName}.csv`,
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
    } finally {
      setBusy(null);
    }
  }, [data, baseName]);

  const exportJson = React.useCallback(async () => {
    if (!data) return;
    setBusy("json");
    try {
      // records are already keyed by header: the JSON is array-of-objects.
      const json = JSON.stringify(data.records, null, 2);
      download(
        `${baseName}.json`,
        new Blob([json], { type: "application/json;charset=utf-8" }),
      );
    } finally {
      setBusy(null);
    }
  }, [data, baseName]);

  const matches = React.useMemo(
    () => (data ? countMatches(data.table, query) : 0),
    [data, query],
  );

  const hasData = !!data;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input: dropzone (before any data is loaded) ── */}
      {!hasData && (
        <div className="flex flex-col gap-4">
          <DocumentDropzone
            accept={["csv"]}
            onFile={onFile}
            selected={selected}
            onClear={reset}
            icon="Table"
            label="Drop a CSV, or paste rows from a spreadsheet"
            hint="CSV, TSV or semicolon-delimited. The delimiter is auto-detected. Paste tab-separated data from Excel or Google Sheets, too. Read-only: your file is never modified."
          />

          <div className="flex flex-wrap items-center gap-3">
            <ExamplesMenu
              examples={EXAMPLES}
              heading="Load a sample CSV"
              onPick={(value) => void loadCsvText(value, null)}
            />
            <span className="text-sm text-muted-foreground">
              Everything runs in your browser: nothing is uploaded.
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

      {/* ── Viewer ── */}
      {hasData && data && (
        <div className="flex flex-col gap-4">
          {/* Toolbar: stats + find + actions */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <StatBadge
                icon="Rows3"
                label="Rows"
                value={data.table.rows.length.toLocaleString()}
              />
              <StatBadge
                icon="Columns3"
                label="Columns"
                value={data.table.headers.length.toLocaleString()}
              />
              <StatBadge
                icon="Grid3x3"
                label="Cells"
                value={cellCount(data.table).toLocaleString()}
              />
              {selected && (
                <StatBadge
                  icon="FileText"
                  value={selected.file.name}
                  className="max-w-[14rem] truncate"
                  title={selected.file.name}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Icon
                  name="Search"
                  size={15}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find in cells…"
                  aria-label="Find text across all cells"
                  className={cn(
                    "h-9 w-44 rounded-md border border-border bg-background pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2",
                    style.ring,
                  )}
                />
              </div>
              {query.trim() && (
                <StatBadge
                  tone={matches > 0 ? "info" : "warning"}
                  value={
                    matches > 0
                      ? `${matches.toLocaleString()} match${matches === 1 ? "" : "es"}`
                      : "No matches"
                  }
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile((v) => !v)}
                aria-pressed={showProfile}
                className="gap-1.5"
              >
                <Icon name="ScanLine" size={15} />
                {showProfile ? "Hide profile" : "Column profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                className="gap-1.5"
              >
                <Icon name="RotateCcw" size={15} />
                Reset
              </Button>
            </div>
          </div>

          {/* Column profile */}
          {showProfile && (
            <ColumnProfile stats={data.stats} accentText={style.text} />
          )}

          {/* The read-only spreadsheet grid */}
          <DataGrid
            data={data.table}
            editable={false}
            height={520}
            emptyLabel="This CSV has a header row but no data rows."
          />

          {/* Export bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="ShieldCheck" size={16} className={style.text} />
              <span>Read-only; your file is never modified or uploaded.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CopyButton value={copyText} label="Copy CSV" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exportCsv}
                disabled={busy === "csv"}
                className="gap-1.5"
              >
                <Icon name="FileText" size={15} />
                {busy === "csv" ? "Preparing…" : "CSV"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={exportJson}
                disabled={busy === "json"}
                className={cn("gap-1.5", style.solid)}
              >
                <Icon name="Braces" size={15} />
                {busy === "json" ? "Preparing…" : "JSON"}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This is a read-only viewer; cells can’t be edited here. To change
            cells, add or delete rows and columns, or export a real{" "}
            <code className="rounded bg-muted px-1 py-0.5">.xlsx</code> workbook,
            open the sibling CSV Editor. JSON export produces an array of objects
            keyed by your header cells.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Column profile ──────────────────────────────────────────────────────── */

/**
 * A compact, responsive summary of every column: its type, fill rate, distinct
 * count, and (for numeric columns) min / max / mean / sum. Reads directly off
 * the shared `csvStats` output; no extra passes over the data.
 */
function ColumnProfile({
  stats,
  accentText,
}: {
  stats: CsvStats;
  accentText: string;
}) {
  if (stats.columns.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <Icon name="ScanLine" size={15} className={accentText} />
        <span className="text-sm font-medium text-foreground">
          Column profile
        </span>
        <span className="text-xs text-muted-foreground">
          {stats.columnCount} column{stats.columnCount === 1 ? "" : "s"} ·{" "}
          {stats.rowCount.toLocaleString()} row
          {stats.rowCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Column</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 text-right font-medium">Filled</th>
              <th className="px-3 py-2 text-right font-medium">Empty</th>
              <th className="px-3 py-2 text-right font-medium">Unique</th>
              <th className="px-3 py-2 text-right font-medium">Min</th>
              <th className="px-3 py-2 text-right font-medium">Max</th>
              <th className="px-3 py-2 text-right font-medium">Mean</th>
              <th className="px-3 py-2 text-right font-medium">Sum</th>
            </tr>
          </thead>
          <tbody>
            {stats.columns.map((col, i) => (
              <tr
                key={`${col.field}-${i}`}
                className="border-b border-border/60 last:border-b-0 hover:bg-accent/30"
              >
                <td
                  className="max-w-[16rem] truncate px-3 py-2 font-medium text-foreground"
                  title={col.field || `Column ${i + 1}`}
                >
                  {col.field || (
                    <span className="text-muted-foreground">
                      Column {i + 1}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      col.numeric
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon
                      name={col.numeric ? "Hash" : "Type"}
                      size={11}
                      aria-hidden
                    />
                    {col.numeric ? "Numeric" : "Text"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-foreground">
                  {col.filled.toLocaleString()}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right tabular-nums",
                    col.empty > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground",
                  )}
                >
                  {col.empty.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-foreground">
                  {col.unique.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {col.numeric && col.min !== undefined ? fmtNum(col.min) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {col.numeric && col.max !== undefined ? fmtNum(col.max) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {col.numeric && col.mean !== undefined
                    ? fmtNum(col.mean)
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {col.numeric && col.sum !== undefined ? fmtNum(col.sum) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
