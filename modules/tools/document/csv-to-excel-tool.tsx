"use client";

/**
 * CSV to Excel, turn a CSV (pasted, dropped or imported) into a genuine binary
 * .xlsx workbook, entirely in the browser.
 *
 * The parsing (papaparse) and workbook generation (SheetJS) are REUSED from the
 * document engine, `csv.ts`'s Result-based `parseCsv` drives the live grid
 * preview and delimiter detection, and `csvToExcelBlob` writes the downloadable
 * file. This module owns only the workspace UI: a CSV editor, a `<DataGrid>`
 * preview of exactly what lands in the sheet, a worksheet-name field, live
 * row/column/delimiter badges, and copy/download/reset actions. Nothing is
 * uploaded.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  CodePane,
  CopyButton,
  ExamplesMenu,
  Field,
  StatBadge,
  download,
  type Example,
} from "@/components/tool/dev";
import { DataGrid } from "@/components/tool/document";
import { matrixToTable, type TableData } from "@/lib/document-tools";
import { parseCsv, csvToExcelBlob } from "@/lib/document-tools/csv";

/* ── Samples ──────────────────────────────────────────────────────────────── */

const PEOPLE_SAMPLE = `id,name,role,active,salary
001,Ada Lovelace,Engineer,true,120000
002,"Grace Hopper, PhD",Architect,true,145000
003,Alan Turing,Researcher,false,110000`;

const SALES_SAMPLE = `region;product;units;revenue
North;Widget;340;10200
South;Gadget;128;7680
East;Widget;512;15360
West;Gadget;96;5760`;

const INVENTORY_SAMPLE = `sku\tquantity\tin_stock\tlocation
A-100\t12\ttrue\tAisle 3
B-220\t0\tfalse\tAisle 7
C-330\t7\ttrue\tAisle 1`;

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "People (with quotes)",
    description: "Header row, a quoted comma, leading-zero IDs",
    value: PEOPLE_SAMPLE,
    icon: "Users",
  },
  {
    label: "Sales (semicolons)",
    description: "European-style CSV: delimiter auto-detected",
    value: SALES_SAMPLE,
    icon: "TrendingUp",
  },
  {
    label: "Inventory (tabs / TSV)",
    description: "Tab-separated, sniffed automatically",
    value: INVENTORY_SAMPLE,
    icon: "Boxes",
  },
];

/* ── Delimiter → human label ─────────────────────────────────────────────── */

function delimiterLabel(delim: string): string {
  switch (delim) {
    case ",":
      return "Comma";
    case ";":
      return "Semicolon";
    case "\t":
      return "Tab";
    case "|":
      return "Pipe";
    case " ":
      return "Space";
    default:
      return delim ? `“${delim}”` : "Unknown";
  }
}

/** Turn a worksheet name into a valid Excel tab (mirrors the engine's sanitiser). */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31);
  return cleaned || "Sheet1";
}

/* ── Parse state ─────────────────────────────────────────────────────────── */

interface ParsedState {
  table: TableData;
  rows: number;
  cols: number;
  delimiter: string;
  error: string | null;
}

const EMPTY_PARSE: ParsedState = {
  table: { headers: [], rows: [] },
  rows: 0,
  cols: 0,
  delimiter: "",
  error: null,
};

/* ── Component ────────────────────────────────────────────────────────────── */

export default function CsvToExcelTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [source, setSource] = React.useState<string>(PEOPLE_SAMPLE);
  const [sheetName, setSheetName] = React.useState<string>("Sheet1");
  const [parsed, setParsed] = React.useState<ParsedState>(EMPTY_PARSE);
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Live parse → grid preview + delimiter/row/col badges (papaparse, lazy).
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!source.trim()) {
        if (!cancelled) setParsed(EMPTY_PARSE);
        return;
      }
      // header:false → CsvGrid of raw rows; first row is treated as the header
      // in the preview so the grid matches how Excel will show the sheet.
      const res = await parseCsv(source, { header: false, delimiter: "auto" });
      if (cancelled) return;
      if (!res.ok) {
        setParsed({ ...EMPTY_PARSE, error: res.error });
        return;
      }
      const grid = "rows" in res.result ? res.result.rows : [];
      const cols = grid.reduce((max, r) => Math.max(max, r.length), 0);
      setParsed({
        table: matrixToTable(grid, true),
        rows: Math.max(grid.length - 1, 0),
        cols,
        delimiter: res.result.delimiter,
        error: null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const handleDropText = React.useCallback((text: string) => {
    setSource(text);
    setError(null);
  }, []);

  const handleExport = React.useCallback(async () => {
    if (!source.trim()) {
      setError("Add some CSV before exporting.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const res = await csvToExcelBlob(source, {
        sheetName: sheetName || "Sheet1",
        delimiter: "auto",
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      download(
        "spreadsheet.xlsx",
        res.result,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export failed. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  }, [source, sheetName]);

  const reset = React.useCallback(() => {
    setSource("");
    setSheetName("Sheet1");
    setError(null);
  }, []);

  const hasData = parsed.rows > 0 || parsed.cols > 0;
  const previewTable = hasData
    ? parsed.table
    : { headers: ["Column A", "Column B", "Column C"], rows: [] };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={(value) => {
            setSource(value);
            setError(null);
          }}
        />
        <CopyButton
          getValue={() => source}
          label="Copy CSV"
          disabled={!source.trim()}
        />
        <Button variant="ghost" size="sm" onClick={reset}>
          <Icon name="RotateCcw" size={15} />
          Clear
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          <StatBadge label="Rows" value={parsed.rows.toLocaleString()} icon="Rows3" />
          <StatBadge label="Columns" value={parsed.cols.toLocaleString()} icon="Columns3" />
          <StatBadge
            label="Delimiter"
            value={parsed.delimiter ? delimiterLabel(parsed.delimiter) : "—"}
            icon="ScanLine"
            tone="info"
          />
        </div>
      </div>

      {/* Split-pane: CSV editor + live spreadsheet preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CodePane
          value={source}
          onChange={(v) => {
            setSource(v);
            setError(null);
          }}
          onDropText={handleDropText}
          label="CSV input"
          placeholder="Paste CSV here, drop a.csv file, or load a sample, e.g. id,name&#10;1,Ada"
          lineNumbers
          ariaLabel="CSV source editor"
          minHeight={420}
          maxHeight={620}
        />

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <Icon name="Table" size={14} />
            Spreadsheet preview
            <span className="ml-auto truncate rounded bg-muted px-1.5 py-0.5 font-mono uppercase tracking-wide">
              {sanitizeSheetName(sheetName)}
            </span>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            {parsed.error ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                <span>{parsed.error}</span>
              </div>
            ) : (
              <DataGrid
                data={previewTable}
                editable={false}
                height={380}
                emptyLabel="Add CSV to see the spreadsheet preview…"
              />
            )}
          </div>
        </div>
      </div>

      {/* Options + export */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
        <Field
          label="Worksheet name"
          hint="Illegal characters and the 31-char limit are handled for you"
        >
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet1"
            aria-label="Worksheet name"
            maxLength={64}
            className="h-9 w-48 max-w-full rounded-md border border-border bg-background px-3 text-sm outline-none ring-ring/40 focus-visible:ring-2"
          />
        </Field>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="lg"
            onClick={() => void handleExport()}
            disabled={exporting || !source.trim()}
          >
            {exporting ? (
              <Icon name="LoaderCircle" size={18} className="animate-spin" />
            ) : (
              <Icon name="FileDown" size={18} />
            )}
            {exporting ? "Building workbook…" : "Download Excel"}
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Honesty note */}
      <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          The download is a genuine binary <span className="font-medium">.xlsx</span>{" "}
          workbook (built with SheetJS) that opens natively in Excel, Google Sheets,
          LibreOffice and Numbers. It writes a single data sheet with every cell as
          text, so leading zeros and long IDs are preserved, and doesn&apos;t
          fabricate formulas, styling or extra tabs that weren&apos;t in your CSV.
          Everything runs in your browser; nothing is uploaded.
        </span>
      </p>
    </div>
  );
}
