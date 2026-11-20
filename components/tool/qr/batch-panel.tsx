"use client";

/**
 * QR Studio, batch panel.
 *
 * Upload a CSV → build one QR per row (sharing the current style) → download a
 * ZIP, all in-browser via `lib/qr/batch`. Offers a downloadable template, a live
 * row preview, a format/size picker, and a real progress bar. Honest about
 * skipped (incomplete) rows.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import type { QRContentType } from "@/lib/qr/content";
import type { QRStyleConfig } from "@/lib/qr/style";
import { downloadBlob, type QrDownloadFormat } from "@/lib/qr/export";
import { csvTemplate, generateBatch, parseBatchCsv, type BatchParse } from "@/lib/qr/batch";
import { FileDropZone, SegmentedControl, StatBadge, Toolbar, ToolbarButton, ToolbarSpacer, download } from "@/components/tool/dev";

/** Props for {@link BatchPanel}. */
export interface BatchPanelProps {
  style: QRStyleConfig;
  /** When set, CSV columns map to this content type's fields; else raw values. */
  contentType?: QRContentType;
}

const FORMAT_OPTIONS: ReadonlyArray<{ value: QrDownloadFormat; label: string }> = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "jpeg", label: "JPG" },
  { value: "pdf", label: "PDF" },
];

/** CSV → many QRs → ZIP, with a template, preview, and progress. */
export function BatchPanel({ style, contentType }: BatchPanelProps) {
  const [parsed, setParsed] = React.useState<BatchParse | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [format, setFormat] = React.useState<QrDownloadFormat>("png");
  const [size, setSize] = React.useState(1024);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const cancelRef = React.useRef(false);

  const onFiles = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
        setError("Please upload a .csv file.");
        return;
      }
      try {
        const text = await file.text();
        const result = parseBatchCsv(text, contentType);
        if (result.rows.length === 0) {
          setError("No data rows found. Make sure the first line is a header.");
          setParsed(null);
          return;
        }
        setParsed(result);
        setFileName(file.name);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read the CSV.");
      }
    },
    [contentType],
  );

  const downloadTemplate = React.useCallback(() => {
    download(`qr-batch-template${contentType ? `-${contentType}` : ""}.csv`, csvTemplate(contentType), "text/csv;charset=utf-8");
  }, [contentType]);

  const validCount = parsed?.rows.filter((r) => r.payload).length ?? 0;

  const run = React.useCallback(async () => {
    if (!parsed || validCount === 0) return;
    cancelRef.current = false;
    setError(null);
    setProgress({ done: 0, total: validCount });
    try {
      const result = await generateBatch(parsed.rows, style, {
        format,
        size,
        onProgress: (done, total) => setProgress({ done, total }),
        shouldCancel: () => cancelRef.current,
      });
      downloadBlob(result.blob, "qr-codes-gigai.zip");
    } catch (err) {
      if (!cancelRef.current) setError(err instanceof Error ? err.message : "Batch failed.");
    } finally {
      setProgress(null);
    }
  }, [parsed, validCount, style, format, size]);

  return (
    <div className="flex flex-col gap-3">
      {/* Intro + template */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Upload a CSV - one QR per row, all sharing your current design. {contentType ? "Columns map to this tool's fields." : "First column is the payload, an optional “name” column sets the file name."}
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Download" size={13} />
          Template CSV
        </button>
      </div>

      {/* Drop zone */}
      <FileDropZone onFiles={(f) => void onFiles(f)} accept=".csv,text/csv" icon="FileSpreadsheet" label="Drop a CSV, click to browse, or paste" hint="One row per QR" />

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <Icon name="TriangleAlert" size={13} /> {error}
        </p>
      )}

      {/* Parsed preview */}
      {parsed && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatBadge icon="FileCheck" label="File" value={fileName ?? "CSV"} tone="info" />
            <StatBadge icon="QrCode" value={`${validCount} valid`} tone="success" />
            {parsed.skipped > 0 && <StatBadge icon="TriangleAlert" value={`${parsed.skipped} skipped`} tone="warning" title="Rows with missing required fields" />}
          </div>

          {/* Row table */}
          <div className="max-h-52 overflow-auto rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 font-medium">#</th>
                  <th className="px-2 py-1.5 font-medium">Name</th>
                  <th className="px-2 py-1.5 font-medium">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parsed.rows.slice(0, 100).map((r) => (
                  <tr key={r.index} className={cn(!r.payload && "bg-warning/5")}>
                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{r.index}</td>
                    <td className="px-2 py-1.5 font-mono text-foreground">{r.name}</td>
                    <td className="px-2 py-1.5 font-mono text-muted-foreground">
                      {r.payload ? <span className="line-clamp-1">{r.payload}</span> : <span className="italic text-warning">incomplete: skipped</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.rows.length > 100 && <p className="px-2 py-1.5 text-[11px] text-muted-foreground">Showing first 100 of {parsed.rows.length} rows.</p>}
          </div>

          {/* Format + size */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Format</span>
              <SegmentedControl<QrDownloadFormat> value={format} onChange={setFormat} ariaLabel="Batch format" options={FORMAT_OPTIONS} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Size</span>
              <SegmentedControl<string>
                value={String(size)}
                onChange={(v) => setSize(Number(v))}
               
                ariaLabel="Batch size"
                options={[
                  { value: "512", label: "512" },
                  { value: "1024", label: "1024" },
                  { value: "2048", label: "2048" },
                ]}
              />
            </div>
          </div>

          {/* Progress / run */}
          {progress ? (
            <div className="flex flex-col gap-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Generating {progress.done} / {progress.total}…
                </span>
                <button type="button" onClick={() => (cancelRef.current = true)} className="text-destructive underline-offset-2 hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <Toolbar>
              <ToolbarButton icon="Package" label={`Generate ${validCount} QRs → ZIP`} variant="primary" disabled={validCount === 0} onClick={() => void run()} />
              <ToolbarSpacer />
              <button
                type="button"
                onClick={() => {
                  setParsed(null);
                  setFileName(null);
                }}
                className="px-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </Toolbar>
          )}
        </div>
      )}
    </div>
  );
}
