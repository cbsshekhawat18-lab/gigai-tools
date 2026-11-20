"use client";

/**
 * PDF to Excel, best-effort PDF table extraction into an editable spreadsheet.
 *
 * Flow: drop a PDF → the shared `pdfToExcelRows` engine (pdf.js positional
 * row/column heuristic) reconstructs a table → it opens in a live, windowed
 * <DataGrid> you can edit cell-by-cell, fix mis-aligned columns in, and delete
 * stray rows from → then export a genuine .xlsx workbook or a clean CSV, or copy
 * the table to the clipboard. On-device except one opt-in step: the Fix-text
 * OCR repair (30+ languages, script auto-detected) uploads the PDF with
 * explicit disclosure (see repair-client.ts).
 *
 * HONEST by design: a PDF stores positioned glyphs, not a table, so extraction
 * is a heuristic: clean grid-like PDFs come out well, free-form or scanned ones
 * don't. The editable grid exists precisely so the user corrects the rough edges.
 *
 * Reuses the document engine (`pdfToExcelRows` from `@/lib/document-tools/excel`,
 * plus `matrixToTable` / `toCsv` / `toXlsxBlob` from the barrel) and the shared
 * document UI (`DocumentDropzone`, `DataGrid`) plus the dev harness (`download`,
 * `CopyButton`, `StatBadge`). All heavy libs (pdf.js, SheetJS) are lazy-imported
 * inside the engine, so this module stays light.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { WorkspaceToolData } from "@/types";
import {
  type TableData,
  matrixToTable,
  toCsv,
  toXlsxBlob,
} from "@/lib/document-tools";
import { pdfToExcelRows } from "@/lib/document-tools/excel";
import {
  pdfToRecords,
  tokenPagesToRecords,
  type RecordExtraction,
} from "@/lib/document-tools/records";
import { OCR_LANG_LABELS, repairPdfText, repairStatus } from "@/lib/document-tools/repair-client";
import { detect as detectIndianPii } from "@/lib/vendor/indian-pii/index";
import {
  DataGrid,
  DocumentDropzone,
  type DetectedFile,
} from "@/components/tool/document";
import { CopyButton, StatBadge, download } from "@/components/tool/dev";

type Busy = null | "csv" | "xlsx";

/** Total non-header cell count for the stat badge. */
function cellCount(table: TableData): number {
  return table.rows.length * table.headers.length;
}

export default function PdfToExcelTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [table, setTable] = React.useState<TableData | null>(null);
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [emptyExtract, setEmptyExtract] = React.useState(false);
  const [extracting, setExtracting] = React.useState(false);
  const [busy, setBusy] = React.useState<Busy>(null);
  // Repeating-record detection: when the PDF is a page of repeated boxes
  // (voter rolls, directories) the user chooses between one-row-per-record
  // and the plain table heuristic before the grid opens.
  const [detected, setDetected] = React.useState<RecordExtraction | null>(null);
  const [fontDamage, setFontDamage] = React.useState(false);
  // Server OCR repair: offered only when the font is damaged AND the endpoint
  // reports itself up. It's an explicit, disclosed opt-in - the default path
  // never leaves the browser.
  const [repairReady, setRepairReady] = React.useState(false);
  const [serverLangs, setServerLangs] = React.useState<string[]>([]);
  const [piiNote, setPiiNote] = React.useState<string | null>(null);
  const [ocrLang, setOcrLang] = React.useState("auto");
  const [repairing, setRepairing] = React.useState<string | null>(null);
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

  const onFile = React.useCallback(async (detected: DetectedFile) => {
    setError(null);
    setEmptyExtract(false);
    setTable(null);
    setSelected(detected);
    setExtracting(true);
    setStatus("Reading the PDF…");
    try {
      // First, look for a repeating-record structure (a page of identical
      // labelled boxes - voter rolls, member directories). If found, the user
      // picks the shape; if not, fall straight through to the table heuristic.
      setStatus("Checking for a repeating record structure…");
      const rec = await pdfToRecords(detected.file);
      if (rec.ok && rec.result.recordCount >= 6) {
        setDetected(rec.result);
        setFontDamage(rec.result.textDamaged);
        if (rec.result.textDamaged) {
          void repairStatus().then((st) => {
            setRepairReady(st.enabled);
            setServerLangs(st.langs);
          });
        }
        return;
      }
      setStatus("Detecting table rows and columns…");
      const result = await pdfToExcelRows(detected.file);
      if (!result.ok) {
        setError(result.error);
        setSelected(null);
        return;
      }
      const rows = result.result;
      // Drop fully-empty rows the heuristic may emit between blocks.
      const cleaned = rows.filter((r) => r.some((c) => c.trim() !== ""));
      if (cleaned.length === 0) {
        setEmptyExtract(true);
        return;
      }
      // First extracted row becomes the header row of the editable grid.
      setTable(matrixToTable(cleaned, true));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't read that PDF. Please try another file.",
      );
      setSelected(null);
    } finally {
      setExtracting(false);
      setStatus("");
    }
  }, []);

  const reset = React.useCallback(() => {
    setTable(null);
    setSelected(null);
    setError(null);
    setEmptyExtract(false);
    setDetected(null);
    setFontDamage(false);
    setRepairReady(false);
    setRepairing(null);
    setStatus("");
  }, []);

  /**
   * Checksum-validated Indian identifiers in the extracted data (vendored
   * indian-pii). Purely an on-device advisory - nothing is sent anywhere.
   */
  const notePii = React.useCallback((rows: string[][]) => {
    try {
      const sample = rows.slice(0, 4000).map((r) => r.join(" ")).join("\n");
      const hits = detectIndianPii(sample, { requireValid: true });
      if (hits.length === 0) {
        setPiiNote(null);
        return;
      }
      const types = [...new Set(hits.map((h) => h.type))].join(", ");
      setPiiNote(
        `This data contains ${hits.length.toLocaleString()} checksum-valid Indian identifier${hits.length === 1 ? "" : "s"} (${types}). Handle the export under the DPDP Act - it is personal data.`,
      );
    } catch {
      setPiiNote(null);
    }
  }, []);

  /** Records mode: the detection result IS the table - open it. */
  const extractAsRecords = React.useCallback(() => {
    if (!detected) return;
    setTable(matrixToTable([detected.headers, ...detected.rows], true));
    notePii(detected.rows);
    setDetected(null);
  }, [detected, notePii]);

  /**
   * Server repair mode: upload the PDF (disclosed on the button itself), let
   * the server re-read the damaged Hindi from the RENDERED page via OCR, then
   * run the exact same records pipeline over the repaired tokens.
   */
  const extractWithRepair = React.useCallback(async () => {
    if (!selected) return;
    setRepairing("Uploading the PDF…");
    setError(null);
    try {
      const pages = await repairPdfText(
        selected.file,
        ({ page, pages: total }) =>
          setRepairing(
            total > 0 ? `Re-reading page ${page} of ${total} with OCR…` : "Starting OCR…",
          ),
        ocrLang,
      );
      if (!pages.ok) {
        setError(`${pages.error} Your file was still extracted locally below.`);
        return;
      }
      const rec = tokenPagesToRecords(pages.result);
      if (!rec.ok) {
        setError(rec.error);
        return;
      }
      setTable(matrixToTable([rec.result.headers, ...rec.result.rows], true));
      notePii(rec.result.rows);
      setDetected(null);
    } finally {
      setRepairing(null);
    }
  }, [selected, ocrLang, notePii]);

  /** Simple mode: run the plain table heuristic instead. */
  const extractAsSimple = React.useCallback(async () => {
    if (!selected) return;
    setDetected(null);
    setExtracting(true);
    setStatus("Detecting table rows and columns…");
    try {
      const result = await pdfToExcelRows(selected.file);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const cleaned = result.result.filter((r) => r.some((c) => c.trim() !== ""));
      if (cleaned.length === 0) {
        setEmptyExtract(true);
        return;
      }
      setTable(matrixToTable(cleaned, true));
    } finally {
      setExtracting(false);
      setStatus("");
    }
  }, [selected]);

  const baseName = selected
    ? selected.file.name.replace(/\.[^.]+$/, "")
    : "gigai-extract";

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

  const hasData = !!table;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input / extraction state (before a grid exists) ── */}
      {!hasData && (
        <div className="flex flex-col gap-4">
          <DocumentDropzone
            accept={["pdf"]}
            onFile={onFile}
            selected={selected}
            onClear={reset}
            disabled={extracting}
            icon="FileSpreadsheet"
            label="Drop a PDF to extract its tables"
            hint="Works best on PDFs with clean, visually-aligned tables: invoices, statements, price lists. Scanned or image-only PDFs have no text to extract."
          />

          {extracting && (
            <p
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
              role="status"
            >
              <Icon
                name="LoaderCircle"
                size={16}
                className="animate-spin shrink-0"
              />
              {status || "Extracting…"}
            </p>
          )}

          {detected && !extracting && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-2.5">
                <Icon name="ListChecks" size={18} className={cn("mt-0.5 shrink-0", style.text)} />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    This PDF repeats the same record {detected.recordCount.toLocaleString()} times
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Across {detected.pageCount.toLocaleString()} pages we found repeated boxes with
                    the fields {detected.labels.slice(0, 5).join(", ")}
                    {detected.labels.length > 5 ? "…" : ""}. Choose how to extract it.
                  </p>
                </div>
              </div>
              {fontDamage && (
                <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                  <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
                  This PDF&rsquo;s embedded font has a lossy character map, so its non-Latin text
                  extracts incorrectly - every text extractor sees the same damage. Numbers, IDs
                  and English text are unaffected.
                  {repairReady
                    ? " The fix below re-reads the RENDERED pages with OCR, which recovers the real text. The language is detected automatically - override it if the guess is wrong."
                    : " Treat the extracted non-Latin text as approximate."}
                </p>
              )}
              {repairing ? (
                <p
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                  role="status"
                >
                  <Icon name="LoaderCircle" size={16} className="animate-spin shrink-0" />
                  {repairing} You can leave this tab open; large files take several minutes.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {fontDamage && repairReady && serverLangs.length > 0 && (
                    <label className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      OCR language
                      <select
                        value={ocrLang}
                        onChange={(e) => setOcrLang(e.target.value)}
                        className="h-11 rounded-md border border-border bg-background px-2 text-sm text-foreground md:h-9"
                      >
                        <option value="auto">Auto-detect from the document</option>
                        {serverLangs.map((code) => (
                          <option key={code} value={code}>
                            {OCR_LANG_LABELS[code] ?? code}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {fontDamage && repairReady && (
                      <Button onClick={() => void extractWithRepair()}>
                        <Icon name="Languages" size={15} />
                        Fix text (OCR) + one row per record
                      </Button>
                    )}
                    <Button
                      variant={fontDamage && repairReady ? "outline" : "default"}
                      onClick={extractAsRecords}
                    >
                      <Icon name="Rows3" size={15} />
                      One row per record ({detected.recordCount.toLocaleString()})
                    </Button>
                    <Button variant="outline" onClick={() => void extractAsSimple()}>
                      <Icon name="Table" size={15} />
                      Simple table (as printed)
                    </Button>
                  </div>
                  {fontDamage && repairReady && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      &ldquo;Fix text&rdquo; sends this PDF to our server for the OCR step, which
                      processes it and deletes it immediately - nothing is stored. It takes roughly
                      ten seconds per page. The other two options stay entirely in your browser.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!extracting && !detected && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon
                name="Info"
                size={16}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              Extraction is best-effort: a PDF stores positioned text, not a real
              table, so we reconstruct rows and columns from where the text sits.
              You&rsquo;ll review and fix the result in an editable grid before
              exporting. It runs in your browser and the PDF is not uploaded (the
              one optional server feature, the Fix-text OCR repair, says so before it runs).
            </p>
          )}

          {emptyExtract && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
            >
              <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
              No extractable table text was found. This PDF is likely scanned or
              image-only (no selectable text), or its layout is free-form prose
              rather than a grid. Scanned documents need OCR first, which this
              tool doesn&rsquo;t perform.
            </p>
          )}

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

      {/* ── Editable extracted grid ── */}
      {hasData && table && (
        <div className="flex flex-col gap-4">
          {piiNote && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              <Icon name="ShieldAlert" size={14} className="mt-0.5 shrink-0" />
              {piiNote} This check ran on your device - the data was not sent anywhere.
            </p>
          )}
          {/* Toolbar: stats + reset */}
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

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="gap-1.5"
            >
              <Icon name="RotateCcw" size={15} />
              Try another PDF
            </Button>
          </div>

          {/* Honesty note: review + fix before exporting */}
          <p className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Icon
              name="PencilLine"
              size={16}
              className={cn("mt-0.5 shrink-0", style.text)}
            />
            Review this against your PDF and fix anything the heuristic guessed
            wrong: click a cell to edit it, rename the headers, and delete stray
            rows like page numbers or repeated headers before you export.
          </p>

          {/* The editable spreadsheet grid */}
          <DataGrid
            data={table}
            onChange={setTable}
            height={520}
            emptyLabel={
              <span className="inline-flex flex-col items-center gap-1">
                <span>The grid is empty.</span>
                <span className="text-xs">
                  Extraction removed every row. Try another PDF.
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

          <p className="text-xs text-muted-foreground">
            Excel export is a real{" "}
            <code className="rounded bg-muted px-1 py-0.5">.xlsx</code> workbook
            written with SheetJS, so it opens without the text-import wizard and
            keeps every value as text. Column boundaries are inferred from text
            position, for tightly-packed layouts, expect to tidy a few cells.
          </p>
        </div>
      )}
    </div>
  );
}
