"use client";

/**
 * Add Page Numbers to a PDF, a Document Studio annotation tool.
 *
 * Drop a PDF, tune the position / format / start number / font size / margin /
 * skip-cover, and stamp REAL selectable Helvetica text onto every page via the
 * existing engine (`pdfops.addPageNumbers`; we do NOT reimplement it). A live
 * preview renders the first numbered page to a canvas as you change options, and
 * a debounced regeneration keeps it cheap. Everything runs in the browser: the
 * numbered blob is produced by pdf-lib and previewed with pdf.js, both lazy -
 * nothing is uploaded.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Field,
  NumberStepper,
  SegmentedControl,
  SelectField,
  Toggle,
  download,
} from "@/components/tool/dev";
import { DocumentDropzone, type DetectedFile } from "@/components/tool/document";
import { addPageNumbers, type PagePosition } from "@/lib/document-tools/pdfops";
import { toPdfInput } from "@/lib/pdf/types";
import { openPdfDocument, pageToCanvas, formatBytes } from "@/lib/pdf/core";

/* ── Options ──────────────────────────────────────────────────────────────── */

type VAlign = "top" | "bottom";
type HAlign = "left" | "center" | "right";
type FormatKey = "n" | "n-of-total" | "n-slash-total" | "dash-n-dash";

const V_OPTIONS: ReadonlyArray<{ value: VAlign; label: string }> = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
];

const H_OPTIONS: ReadonlyArray<{ value: HAlign; label: React.ReactNode; icon: string }> = [
  { value: "left", label: "Left", icon: "AlignLeft" },
  { value: "center", label: "Centre", icon: "AlignCenter" },
  { value: "right", label: "Right", icon: "AlignRight" },
];

/** Format preset → the `{n}`/`{total}` template consumed by addPageNumbers. */
const FORMAT_OPTIONS: ReadonlyArray<{ value: FormatKey; label: string; template: string }> = [
  { value: "n", label: "1", template: "{n}" },
  { value: "n-of-total", label: "Page 1 of N", template: "Page {n} of {total}" },
  { value: "n-slash-total", label: "1 / N", template: "{n} / {total}" },
  { value: "dash-n-dash", label: "- 1 -", template: "- {n} -" },
];

/** Compose the six-way PagePosition the engine expects. */
function toPosition(v: VAlign, h: HAlign): PagePosition {
  return `${v}-${h}` as PagePosition;
}

const FORMAT_TEMPLATE: Record<FormatKey, string> = FORMAT_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.template }),
  {} as Record<FormatKey, string>,
);

/* ── Component ────────────────────────────────────────────────────────────── */

export default function DocumentPageNumberTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);

  const [vAlign, setVAlign] = React.useState<VAlign>("bottom");
  const [hAlign, setHAlign] = React.useState<HAlign>("center");
  const [format, setFormat] = React.useState<FormatKey>("n-of-total");
  const [start, setStart] = React.useState(1);
  const [fontSize, setFontSize] = React.useState(10);
  const [margin, setMargin] = React.useState(28);
  const [skipCover, setSkipCover] = React.useState(false);

  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  // Track the latest render so a stale async pass can't clobber a newer one.
  const runIdRef = React.useRef(0);
  // Cache the most recent numbered blob so Download reuses the previewed result.
  const blobRef = React.useRef<Blob | null>(null);

  /** Build the numbered PDF from the current options (single source of truth). */
  const buildNumbered = React.useCallback(
    async (target: File) => {
      const res = await addPageNumbers(toPdfInput(target), {
        position: toPosition(vAlign, hAlign),
        format: FORMAT_TEMPLATE[format],
        start,
        fontSize,
        margin,
        skipFirst: skipCover ? 1 : 0,
      });
      if (!res.ok) throw new Error(res.error);
      return res.result.blob;
    },
    [vAlign, hAlign, format, start, fontSize, margin, skipCover],
  );

  /** Regenerate + render the first page whenever the file or an option changes. */
  React.useEffect(() => {
    if (!file) return;
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setBusy(true);
        setError(null);
        try {
          const blob = await buildNumbered(file);
          if (cancelled || runIdRef.current !== runId) return;
          blobRef.current = blob;

          const doc = await openPdfDocument(blob);
          try {
            const first = await doc.getPage(1);
            const canvas = await pageToCanvas(first, 1.4);
            first.cleanup();
            if (cancelled || runIdRef.current !== runId) return;
            const url = canvas.toDataURL("image/png");
            setPreviewUrl(url);
          } finally {
            await doc.loadingTask.destroy();
          }
        } catch (err) {
          if (!cancelled && runIdRef.current === runId) {
            setError(
              err instanceof Error
                ? err.message
                : "Could not number this PDF. It may be corrupted or password-protected.",
            );
          }
        } finally {
          if (!cancelled && runIdRef.current === runId) setBusy(false);
        }
      })();
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [file, buildNumbered]);

  const handleFile = React.useCallback(async (detected: DetectedFile) => {
    setFile(detected.file);
    setError(null);
    setPreviewUrl("");
    blobRef.current = null;
    try {
      const doc = await openPdfDocument(detected.file);
      setPageCount(doc.numPages);
      await doc.loadingTask.destroy();
    } catch {
      setPageCount(0);
    }
  }, []);

  const reset = React.useCallback(() => {
    runIdRef.current += 1;
    blobRef.current = null;
    setFile(null);
    setPageCount(0);
    setPreviewUrl("");
    setError(null);
    setBusy(false);
  }, []);

  const handleDownload = React.useCallback(async () => {
    if (!file) return;
    setDownloading(true);
    setError(null);
    try {
      // Reuse the previewed blob if it's fresh; otherwise rebuild.
      const blob = blobRef.current ?? (await buildNumbered(file));
      const base = file.name.replace(/\.pdf$/i, "");
      download(`${base}-numbered.pdf`, blob, "application/pdf");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the numbered PDF. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  }, [file, buildNumbered]);

  /* ── Empty state: dropzone ──────────────────────────────────────────────── */
  if (!file) {
    return (
      <div className="flex flex-col gap-4">
        <DocumentDropzone
          accept={["pdf"]}
          onFile={(d) => void handleFile(d)}
          icon="Hash"
          label="Drop a PDF to add page numbers"
          hint="Numbers are drawn as real selectable text. Everything stays in your browser"
        />
        <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
          <span>
            100% in your browser. Your PDF is opened, numbered and saved on your device. It is never
            uploaded, stored or logged.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* File chip */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Icon name="FileText" size={18} className="shrink-0 text-cyan-600" />
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
        {pageCount > 0 && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {pageCount} page{pageCount === 1 ? "" : "s"}
          </span>
        )}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={reset}>
          <Icon name="RotateCcw" size={15} />
          Change file
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        {/* Live preview */}
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <Icon name="Eye" size={14} />
            Live preview
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 uppercase tracking-wide">
              Page 1{skipCover ? " · cover skipped" : ""}
            </span>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center overflow-auto p-4"
            style={{ background: "color-mix(in srgb, var(--muted) 40%, transparent)" }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL, no optimisation needed
              <img
                src={previewUrl}
                alt="Preview of the first page with the page number applied"
                className="max-h-[560px] max-w-full rounded shadow-sm ring-1 ring-black/10"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Icon name="LoaderCircle" size={22} className="animate-spin" />
                Rendering preview…
              </div>
            )}
            {busy && previewUrl && (
              <div className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 shadow-sm ring-1 ring-black/5">
                <Icon name="LoaderCircle" size={14} className="animate-spin text-muted-foreground" />
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <Field label="Vertical position">
            <SegmentedControl
              value={vAlign}
              onChange={setVAlign}
              options={V_OPTIONS}
              ariaLabel="Vertical position"
              size="sm"
            />
          </Field>

          <Field label="Horizontal position">
            <SegmentedControl
              value={hAlign}
              onChange={setHAlign}
              options={H_OPTIONS}
              ariaLabel="Horizontal position"
              size="sm"
            />
          </Field>

          <Field label="Format" htmlFor="pn-format">
            <SelectField
              id="pn-format"
              value={format}
              onChange={setFormat}
              options={FORMAT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              ariaLabel="Number format"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start at" htmlFor="pn-start">
              <NumberStepper
                id="pn-start"
                value={start}
                onChange={setStart}
                min={0}
                max={99999}
                ariaLabel="Start number"
              />
            </Field>
            <Field label="Font size (pt)" htmlFor="pn-size">
              <NumberStepper
                id="pn-size"
                value={fontSize}
                onChange={setFontSize}
                min={6}
                max={48}
                ariaLabel="Font size in points"
              />
            </Field>
          </div>

          <Field label="Margin (pt)" htmlFor="pn-margin" hint="Distance of the number from the page edge">
            <NumberStepper
              id="pn-margin"
              value={margin}
              onChange={setMargin}
              min={8}
              max={120}
              step={2}
              ariaLabel="Margin from page edge in points"
            />
          </Field>

          <Toggle
            checked={skipCover}
            onChange={setSkipCover}
            label="Skip cover page"
          />

          <Button
            size="lg"
            className="mt-1 w-full"
            onClick={() => void handleDownload()}
            disabled={downloading || busy}
          >
            {downloading ? (
              <Icon name="LoaderCircle" size={18} className="animate-spin" />
            ) : (
              <Icon name="FileDown" size={18} />
            )}
            {downloading ? "Saving…" : "Add Page Numbers"}
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
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          The number is drawn as real selectable text on top of each page: your original pages are
          never re-rasterised or re-flowed. It can&apos;t detect or replace numbers already printed
          inside a scanned page&apos;s image; if the number overlaps a footer, raise the margin or
          pick another corner. Everything runs in your browser. Nothing is uploaded.
        </span>
      </p>
    </div>
  );
}
