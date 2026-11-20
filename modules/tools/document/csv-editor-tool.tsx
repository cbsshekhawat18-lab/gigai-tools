"use client";

/**
 * CSV Editor, a premium, in-browser CSV editor and the SheetJS + papaparse
 * showcase of the document toolkit.
 *
 * Flow: drop / paste a CSV (or start blank) → it parses (quoting-aware,
 * delimiter auto-detected) into a live, windowed <DataGrid> you can edit cell
 * by cell, add / delete rows and columns in, sort, and search across → then
 * export to a clean CSV, formatted JSON (array of objects keyed by headers) or
 * a genuine .xlsx workbook, or copy the CSV to the clipboard. Everything runs on
 * the device; nothing is uploaded.
 *
 * Reuses the document engine (`parseCsv`, `toCsv`, `toXlsxBlob`, `emptyTable`,
 * `normalizeTable`, `tableToMatrix`) and the shared document UI
 * (`DocumentDropzone`, `DataGrid`) plus the dev harness (`download`,
 * `CopyButton`, `StatBadge`, `ExamplesMenu`). All heavy libs (papaparse,
 * SheetJS) are lazy-imported inside the engine, so this module stays light.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { WorkspaceToolData } from "@/types";
import {
  type TableData,
  parseCsv,
  toCsv,
  toXlsxBlob,
  emptyTable,
  normalizeTable,
} from "@/lib/document-tools";
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

const SAMPLE_EMPLOYEES = [
  "name,department,role,salary,start_date",
  'Ada Lovelace,Engineering,"Principal Engineer",184000,2021-03-01',
  "Grace Hopper,Engineering,Staff Engineer,171000,2020-07-14",
  'Katherine Johnson,Research,"Lead Analyst, Orbital",166000,2019-11-02',
  "Alan Turing,Research,Cryptography Lead,178000,2018-05-20",
  "Radia Perlman,Networking,Distinguished Engineer,192000,2022-01-10",
].join("\n");

const SAMPLE_INVENTORY = [
  "sku;product;category;in_stock;price_usd",
  "GK-1001;Mechanical Keyboard;Peripherals;42;89.00",
  "GK-1002;27\" 4K Monitor;Displays;18;319.50",
  "GK-1003;USB-C Dock;Accessories;0;74.99",
  "GK-1004;Ergonomic Mouse;Peripherals;120;39.00",
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
    label: "Employees (comma CSV)",
    description: "Quoted fields with embedded commas",
    value: SAMPLE_EMPLOYEES,
    icon: "Users",
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

/**
 * CSV → array-of-objects JSON keyed by the header cells. Duplicate/blank
 * headers are disambiguated so no key is silently dropped.
 */
function tableToJson(table: TableData): string {
  const t = normalizeTable(table);
  const seen = new Map<string, number>();
  const keys = t.headers.map((h, i) => {
    const base = h.trim() || `column_${i + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
  const records = t.rows.map((row) => {
    const obj: Record<string, string> = {};
    keys.forEach((k, i) => {
      obj[k] = row[i] ?? "";
    });
    return obj;
  });
  return JSON.stringify(records, null, 2);
}

/** Total non-header cell count for the stat badge. */
function cellCount(table: TableData): number {
  return table.rows.length * table.headers.length;
}

type Busy = null | "csv" | "json" | "xlsx";

/* ── Component ───────────────────────────────────────────────────────────── */

export default function CsvEditorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [table, setTable] = React.useState<TableData | null>(null);
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<Busy>(null);
  const [copyText, setCopyText] = React.useState("");

  // Keep a CSV string in sync for the copy-to-clipboard action.
  React.useEffect(() => {
    let alive = true;
    if (!table) {
      setCopyText("");
      return;
    }
    void toCsv(table).then((csv) => {
      if (alive) setCopyText(csv);
    });
    return () => {
      alive = false;
    };
  }, [table]);

  const loadCsvText = React.useCallback(
    async (text: string, source: DetectedFile | null) => {
      setError(null);
      try {
        const parsed = await parseCsv(text, { header: true });
        setTable(parsed);
        setSelected(source);
        setQuery("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't parse that as CSV. Check the delimiter and quoting.",
        );
      }
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

  const startBlank = React.useCallback(() => {
    setError(null);
    setTable(normalizeTable(emptyTable(4)));
    setSelected(null);
    setQuery("");
  }, []);

  const reset = React.useCallback(() => {
    setTable(null);
    setSelected(null);
    setQuery("");
    setError(null);
  }, []);

  /* ── Exports (all in-browser) ──────────────────────────────────────────── */

  const baseName = selected
    ? selected.file.name.replace(/\.[^.]+$/, "")
    : "gigai-csv";

  const exportCsv = React.useCallback(async () => {
    if (!table) return;
    setBusy("csv");
    try {
      const csv = await toCsv(table);
      download(
        `${baseName}.csv`,
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
    } finally {
      setBusy(null);
    }
  }, [table, baseName]);

  const exportJson = React.useCallback(async () => {
    if (!table) return;
    setBusy("json");
    try {
      const json = tableToJson(table);
      download(
        `${baseName}.json`,
        new Blob([json], { type: "application/json;charset=utf-8" }),
      );
    } finally {
      setBusy(null);
    }
  }, [table, baseName]);

  const exportXlsx = React.useCallback(async () => {
    if (!table) return;
    setBusy("xlsx");
    try {
      const blob = await toXlsxBlob([{ name: "Sheet1", table }]);
      download(`${baseName}.xlsx`, blob);
    } finally {
      setBusy(null);
    }
  }, [table, baseName]);

  const matches = React.useMemo(
    () => (table ? countMatches(table, query) : 0),
    [table, query],
  );

  const hasData = !!table;
  const isEmptyGrid = !!table && table.rows.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input: dropzone (before any data is loaded) ── */}
      {!hasData && (
        <div className="flex flex-col gap-4">
          <DocumentDropzone
            accept={["csv", "xlsx"]}
            onFile={onFile}
            selected={selected}
            onClear={reset}
            icon="Table2"
            label="Drop a CSV, or paste rows from a spreadsheet"
            hint="CSV, TSV or semicolon-delimited. The delimiter is auto-detected. Paste tab-separated data from Excel or Google Sheets, too."
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={startBlank}
              className="gap-2"
            >
              <Icon name="Plus" size={16} />
              Start a blank grid
            </Button>
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

      {/* ── Editor ── */}
      {hasData && table && (
        <div className="flex flex-col gap-4">
          {/* Toolbar: stats + find + actions */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
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
                icon="Grid3x3"
                label="Cells"
                value={cellCount(table).toLocaleString()}
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
                onClick={reset}
                className="gap-1.5"
              >
                <Icon name="RotateCcw" size={15} />
                Reset
              </Button>
            </div>
          </div>

          {/* The editable spreadsheet grid */}
          <DataGrid
            data={table}
            onChange={setTable}
            height={520}
            emptyLabel={
              <span className="inline-flex flex-col items-center gap-1">
                <span>This grid is empty.</span>
                <span className="text-xs">
                  Use “Add row” above, or paste tab-separated data into a cell.
                </span>
              </span>
            }
          />

          {/* Export bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="ShieldCheck" size={16} className={style.text} />
              <span>Exports are generated on your device. Never uploaded.</span>
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
                variant="outline"
                size="sm"
                onClick={exportJson}
                disabled={busy === "json"}
                className="gap-1.5"
              >
                <Icon name="Braces" size={15} />
                {busy === "json" ? "Preparing…" : "JSON"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={exportXlsx}
                disabled={busy === "xlsx"}
                className={cn("gap-1.5", style.solid)}
              >
                <Icon name="FileSpreadsheet" size={15} />
                {busy === "xlsx" ? "Building…" : "Excel"}
              </Button>
            </div>
          </div>

          {isEmptyGrid && (
            <p className="text-sm text-muted-foreground">
              Tip: exports include your header row even when there are no data
              rows yet, rename the headers to build a template.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            JSON export produces an array of objects keyed by your header cells.
            Excel export is a real{" "}
            <code className="rounded bg-muted px-1 py-0.5">.xlsx</code> workbook
            written with SheetJS, so it opens without the text-import wizard and
            keeps every value as text.
          </p>
        </div>
      )}
    </div>
  );
}
