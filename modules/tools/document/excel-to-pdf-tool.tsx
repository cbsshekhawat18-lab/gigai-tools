"use client";

/**
 * Excel to PDF, Document Studio spreadsheet converter.
 *
 * Drop an .xlsx/.xls/.ods/.csv workbook → the engine reads every sheet on-device
 * (`readWorkbook`, SheetJS lazy-imported). Pick a tab, preview the exact grid in a
 * read-only DataGrid, choose orientation / page size / header, then export the
 * chosen sheet as a bordered table PDF (`excelToPdf` → html2canvas/jsPDF). Nothing
 * is uploaded; the honest limits (rasterised text, scale-to-fit) are stated in-UI.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Field, SegmentedControl, SelectField, Toggle, download } from "@/components/tool/dev";
import { DocumentDropzone, DataGrid, type DetectedFile } from "@/components/tool/document";
import { matrixToTable, type TableData } from "@/lib/document-tools";
import { readWorkbook, excelToPdf, type Workbook } from "@/lib/document-tools/excel";
import { formatBytes } from "@/lib/pdf/core";

/* ── Options ──────────────────────────────────────────────────────────────── */

type Orientation = "landscape" | "portrait";
type PageSize = "a4" | "letter";

const ORIENTATIONS: ReadonlyArray<{ value: Orientation; label: string }> = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
];

const PAGE_SIZES: ReadonlyArray<{ value: PageSize; label: string }> = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function ExcelToPdfTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [workbook, setWorkbook] = React.useState<Workbook | null>(null);
  const [sheetName, setSheetName] = React.useState<string>("");
  const [orientation, setOrientation] = React.useState<Orientation>("landscape");
  const [pageSize, setPageSize] = React.useState<PageSize>("a4");
  const [header, setHeader] = React.useState(true);

  const [reading, setReading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = React.useCallback(async (detected: DetectedFile) => {
    setError(null);
    setFile(detected.file);
    setWorkbook(null);
    setSheetName("");
    setReading(true);
    try {
      const res = await readWorkbook(detected.file);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setWorkbook(res.result);
      setSheetName(res.result.sheets[0]?.name ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this spreadsheet.");
    } finally {
      setReading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setWorkbook(null);
    setSheetName("");
    setError(null);
  }, []);

  const activeSheet = React.useMemo(
    () => workbook?.sheets.find((s) => s.name === sheetName) ?? workbook?.sheets[0],
    [workbook, sheetName],
  );

  // Build a read-only TableData preview from the selected sheet's raw rows.
  const previewTable = React.useMemo<TableData | null>(() => {
    if (!activeSheet) return null;
    if (activeSheet.rows.length === 0) return null;
    return matrixToTable(activeSheet.rows, header);
  }, [activeSheet, header]);

  const handleExport = React.useCallback(async () => {
    if (!file || !activeSheet) return;
    setExporting(true);
    setError(null);
    try {
      const res = await excelToPdf(file, {
        sheet: activeSheet.name,
        orientation,
        format: pageSize,
        header,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const base = file.name.replace(/\.(xlsx|xls|ods|csv)$/i, "");
      const suffix = workbook && workbook.sheets.length > 1 ? `-${activeSheet.name}` : "";
      download(`${base}${suffix}.pdf`, res.result, "application/pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [file, activeSheet, orientation, pageSize, header, workbook]);

  const sheetOptions = React.useMemo(
    () => (workbook?.sheets ?? []).map((s) => ({ value: s.name, label: s.name || "Sheet" })),
    [workbook],
  );

  const rowCount = activeSheet?.rows.length ?? 0;
  const colCount = activeSheet?.rows.reduce((m, r) => Math.max(m, r.length), 0) ?? 0;

  /* ── Empty state: dropzone ──────────────────────────────────────────────── */
  if (!file) {
    return (
      <div className="flex flex-col gap-4">
        <DocumentDropzone
          accept={["xlsx", "csv"]}
          onFile={(d) => void handleFile(d)}
          icon="Table2"
          label="Drop a spreadsheet to convert"
          hint="Excel.xlsx /.xls, OpenDocument.ods or.csv. Read privately in your browser"
        />
        <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
          <span>
            100% in your browser. Your workbook is parsed, previewed and rendered to PDF on your
            device. It is never uploaded, stored or logged.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* File chip */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Icon name="FileSpreadsheet" size={18} className="shrink-0 text-emerald-600" />
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
        {workbook && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {workbook.sheets.length} sheet{workbook.sheets.length === 1 ? "" : "s"}
          </span>
        )}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={reset}>
          <Icon name="RotateCcw" size={15} />
          Change file
        </Button>
      </div>

      {reading && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          <Icon name="LoaderCircle" size={18} className="animate-spin" />
          Reading workbook…
        </div>
      )}

      {workbook && (
        <>
          {/* Options */}
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
            {sheetOptions.length > 1 && (
              <Field label="Sheet">
                <SelectField
                  value={sheetName}
                  onChange={setSheetName}
                  options={sheetOptions}
                  ariaLabel="Sheet to export"
                />
              </Field>
            )}
            <Field label="Orientation">
              <SegmentedControl
                value={orientation}
                onChange={setOrientation}
                options={ORIENTATIONS}
                ariaLabel="Page orientation"
                size="sm"
              />
            </Field>
            <Field label="Page size">
              <SegmentedControl
                value={pageSize}
                onChange={setPageSize}
                options={PAGE_SIZES}
                ariaLabel="Page size"
                size="sm"
              />
            </Field>
            <Field label="First row">
              <Toggle
                checked={header}
                onChange={setHeader}
                label="Header row"
              />
            </Field>

            <div className="ml-auto flex items-center gap-2">
              <Button
                size="lg"
                onClick={() => void handleExport()}
                disabled={exporting || !activeSheet || rowCount === 0}
              >
                {exporting ? (
                  <Icon name="LoaderCircle" size={18} className="animate-spin" />
                ) : (
                  <Icon name="FileDown" size={18} />
                )}
                {exporting ? "Rendering…" : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
              <Icon name="Eye" size={14} />
              Preview
              <span className="truncate font-normal">· {activeSheet?.name || "Sheet"}</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5">
                  {rowCount} rows × {colCount} cols
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 uppercase tracking-wide">
                  {pageSize === "a4" ? "A4" : "Letter"} · {orientation === "landscape" ? "Land" : "Port"}
                </span>
              </span>
            </div>
            {previewTable ? (
              <DataGrid data={previewTable} editable={false} height={440} />
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                This sheet is empty. Pick another sheet or choose a different file.
              </div>
            )}
          </div>
        </>
      )}

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
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          The sheet is rendered as a high-resolution image in the PDF to preserve the exact grid, so
          that text isn&apos;t individually selectable, and very wide sheets are scaled to fit the
          page. Use landscape and split wide sheets for the best result. Need selectable, editable
          values instead? Keep the data live with the{" "}
          <span className="font-medium">CSV Editor</span> tool. Everything runs in your browser  -
          nothing is uploaded.
        </span>
      </p>
    </div>
  );
}
