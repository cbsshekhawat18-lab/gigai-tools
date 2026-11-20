/**
 * GigAI Workspace, the QR WORKSPACE (client island).
 *
 * A BATCH QR studio: instead of the per-file pipeline model, the user works with
 * a LIST of contents. They type/paste one payload per line OR drop a .csv/.txt
 * anywhere on the page, every line becomes a QR, and a SHARED style (foreground /
 * background color, dot & eye shape, error-correction, size, quiet-zone margin
 * and an optional centre logo) is applied to the whole set with a live grid
 * preview. The finished batch exports as a ZIP (PNG or SVG) or a printable sheet.
 *
 * This intentionally does NOT mount the generic <WorkspaceShell> (which is built
 * around a single active asset + per-file operation pipeline). A QR batch has no
 * "active file" to preview and its operations style the whole list at once, so -
 * like the PDF workspace; it is BESPOKE, adapting the shell's visual language
 * (rounded-2xl card, header, left/centre/right panels, bottom status bar) around
 * a batch instead.
 *
 * REUSE, DON'T REIMPLEMENT. Every real operation calls the existing lib/qr
 * engines, dynamic-imported INSIDE the handler so the initial bundle stays small:
 *  • parseBatchCsv / parseCsv / generateBatch (lib/qr/batch), CSV → rows → ZIP.
 *  • renderToCanvas / renderToSvgString (lib/qr/render): live previews.
 *  • exportQr (lib/qr/export): printable-sheet PNGs.
 *  • DEFAULT_QR_STYLE / QRStyleConfig (lib/qr/style), the shared style.
 *  • scanTest / contrastRatio (lib/qr/validate): honest warnings.
 * qr-code-styling (the render engine) and fflate/jspdf (the ZIP/PDF packers) are
 * only ever loaded from inside those engines, never at module scope.
 *
 * File input reuses the shared WINDOW-level drop guard (useFileDrop + <DropOverlay>)
 * so dropping a .csv/.txt ANYWHERE fills the list and the browser never navigates.
 *
 * HONEST LIMITS (surfaced in the UI, never faked):
 *  • Everything runs in your browser. Nothing is uploaded.
 *   • Batch size is bound by the tab: each QR is rendered for real, so hundreds
 *     of high-resolution codes take time and memory. A live progress bar tracks it
 *     and the run is cancellable.
 *   • The live grid previews the first ~60 rows for responsiveness; the ZIP / sheet
 *     always contains every valid row.
 *  • A logo covers modules, the scan-safety hint nudges error-correction up.
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { useFileDrop } from "@/lib/workspace/use-file-drop";
import { Button } from "@/components/ui/button";
import { DropOverlay } from "@/components/workspace/drop-overlay";
import {
  DEFAULT_QR_STYLE,
  type QRStyleConfig,
  type QRDotStyle,
  type QREyeFrameStyle,
  type QRErrorCorrection,
} from "@/lib/qr/style";

/* ── Types ──────────────────────────────────────────────────────────────── */

/** One entry in the batch: a payload + a safe, unique file-name stem. */
interface BatchItem {
  /** 1-based position for messages. */
  index: number;
  /** The QR payload string. */
  payload: string;
  /** File-name stem (sanitised, unique within the batch). */
  name: string;
}

/** Which export format the ZIP / sheet uses. */
type ExportFormat = "png" | "svg";

/** How many rows the live grid renders (the ZIP always covers all). */
const PREVIEW_LIMIT = 60;

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Accept .csv / .txt by MIME or extension (browsers vary on the MIME). */
function isTextList(file: File): boolean {
  return (
    /text\/(csv|plain)/.test(file.type) ||
    /\.(csv|txt|tsv)$/i.test(file.name) ||
    file.type === ""
  );
}

/** Sanitise a payload into a short, safe, file-name stem. */
function safeStem(input: string, fallback: string): string {
  const cleaned = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return cleaned || fallback;
}

/** Turn raw lines of text into a de-duplicated, uniquely-named batch. */
function linesToItems(text: string): BatchItem[] {
  const used = new Set<string>();
  const uniqueName = (stem: string): string => {
    let name = stem;
    let n = 2;
    while (used.has(name)) name = `${stem}-${n++}`;
    used.add(name);
    return name;
  };
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((payload, i) => ({
      index: i + 1,
      payload,
      name: uniqueName(safeStem(payload, `qr-${i + 1}`)),
    }));
}

/** Trigger a browser download for a blob without leaking the object URL. */
function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read a File as text. */
function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(file);
  });
}

/* ── Small vocab for the style controls ─────────────────────────────────── */

const DOT_STYLES: { value: QRDotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy round" },
  { value: "extra-rounded", label: "Extra round" },
];

const EYE_STYLES: { value: QREyeFrameStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
];

const EC_LEVELS: { value: QRErrorCorrection; label: string; hint: string }[] = [
  { value: "L", label: "L", hint: "~7% recovery" },
  { value: "M", label: "M", hint: "~15% recovery" },
  { value: "Q", label: "Q", hint: "~25% recovery" },
  { value: "H", label: "H", hint: "~30%: best with a logo" },
];

const SWATCHES = ["#000000", "#0f172a", "#1d4ed8", "#7c3aed", "#be123c", "#047857", "#b45309"];

/* ── Component ──────────────────────────────────────────────────────────── */

export default function QrWorkspace() {
  // The raw text the user is editing (source of truth for the list).
  const [raw, setRaw] = React.useState("");
  // The parsed, uniquely-named batch derived from `raw`.
  const items = React.useMemo(() => linesToItems(raw), [raw]);

  // The shared style applied to every QR in the batch.
  const [style, setStyle] = React.useState<QRStyleConfig>(() => ({
    ...DEFAULT_QR_STYLE,
    dotStyle: "rounded",
    eyeFrameStyle: "rounded",
    errorCorrection: "M",
  }));
  const [exportSize, setExportSize] = React.useState(1024);
  const [format, setFormat] = React.useState<ExportFormat>("png");

  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  // Batch progress (0..1) while generating; null when idle.
  const [progress, setProgress] = React.useState<number | null>(null);
  const cancelRef = React.useRef(false);

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  const patch = React.useCallback((next: Partial<QRStyleConfig>) => {
    setStyle((s) => ({ ...s, ...next }));
  }, []);

  /* ── Import: text / CSV file → the list ───────────────────────────────── */

  const importFile = React.useCallback(async (file: File) => {
    setError(null);
    if (!isTextList(file)) {
      setError("Drop a.csv or.txt file, one QR value per line, or a CSV with a header row.");
      return;
    }
    try {
      const text = await readText(file);
      // A CSV with a header gets its first column extracted via the engine's
      // parser; a plain .txt is used verbatim (one value per line).
      if (/\.(csv|tsv)$/i.test(file.name) || /,/.test(text.split(/\r?\n/)[0] ?? "")) {
        const { parseBatchCsv } = await import("@/lib/qr/batch");
        const parsed = parseBatchCsv(text);
        const values = parsed.rows
          .map((r) => r.payload)
          .filter((p): p is string => Boolean(p));
        if (values.length === 0) {
          setError("No usable rows found in that file.");
          return;
        }
        setRaw((prev) => (prev.trim() ? `${prev.trim()}\n${values.join("\n")}` : values.join("\n")));
      } else {
        setRaw((prev) => {
          const merged = prev.trim() ? `${prev.trim()}\n${text}` : text;
          return merged;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file.");
    }
  }, []);

  // Whole-page drop guard: dropping a .csv/.txt ANYWHERE appends its lines.
  const { isDragging } = useFileDrop((files) => {
    const file = files.find(isTextList) ?? files[0];
    if (file) void importFile(file);
  });

  /* ── Logo (data URL embedded in the shared style) ─────────────────────── */

  const onLogoPicked = React.useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Choose an image file for the logo (PNG or SVG works best).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        patch({
          logo: {
            dataUrl: String(reader.result),
            sizeRatio: 0.24,
            hideBackgroundDots: true,
          },
          // A logo overlays modules, nudge EC up so codes stay recoverable.
          errorCorrection: style.errorCorrection === "L" || style.errorCorrection === "M" ? "Q" : style.errorCorrection,
        });
      };
      reader.readAsDataURL(file);
    },
    [patch, style.errorCorrection],
  );

  const clearLogo = React.useCallback(() => {
    setStyle((s) => {
      const { logo: _drop, ...rest } = s;
      return rest;
    });
  }, []);

  /* ── Live scan-safety (reuses the validate engine, no DOM) ────────────── */

  const [report, setReport] = React.useState<{ scannable: boolean; contrast: number; warnings: string[] } | null>(null);
  React.useEffect(() => {
    let alive = true;
    void (async () => {
      const { scanTest } = await import("@/lib/qr/validate");
      // Score against a representative payload (the first/longest row).
      const sample = items.reduce((a, b) => (b.payload.length > a.length ? b.payload : a), items[0]?.payload ?? "");
      const r = scanTest(style, sample);
      if (!alive) return;
      setReport({
        scannable: r.scannable,
        contrast: r.contrast,
        warnings: r.issues.map((i) => i.message),
      });
    })();
    return () => {
      alive = false;
    };
  }, [style, items]);

  /* ── Export: ZIP (reuses generateBatch) ───────────────────────────────── */

  const exportZip = React.useCallback(async () => {
    if (items.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    cancelRef.current = false;
    setProgress(0);
    setStatus("Rendering QR codes…");
    try {
      const { generateBatch } = await import("@/lib/qr/batch");
      const rows = items.map((it) => ({
        index: it.index,
        payload: it.payload,
        name: it.name,
        cells: {},
      }));
      const result = await generateBatch(rows, style, {
        format,
        size: exportSize,
        onProgress: (done, total) => {
          setProgress(done / total);
          setStatus(`Rendering ${done} / ${total}…`);
        },
        shouldCancel: () => cancelRef.current,
      });
      download(result.blob, `qr-batch-${result.count}.zip`);
      setStatus(
        result.skipped > 0
          ? `Done, ${result.count} codes zipped (${result.skipped} empty rows skipped).`
          : `Done: ${result.count} codes zipped.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      setError(msg === "Batch cancelled." ? null : msg);
      if (msg === "Batch cancelled.") setStatus("Cancelled.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [items, busy, style, format, exportSize]);

  /* ── Export: printable sheet (reuses exportQr for each cell) ──────────── */

  const exportSheet = React.useCallback(async () => {
    if (items.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    cancelRef.current = false;
    setProgress(0);
    setStatus("Building printable sheet…");
    try {
      const { exportQr } = await import("@/lib/qr/export");
      // Render each code to a PNG data URL, then lay them on an A4 grid we open
      // in a print window (no extra dependency: the browser owns the PDF step).
      const cells: { url: string; label: string }[] = [];
      const total = items.length;
      for (let i = 0; i < items.length; i += 1) {
        if (cancelRef.current) throw new Error("Batch cancelled.");
        const it = items[i]!;
        const blob = await exportQr(it.payload, style, 512, "png");
        cells.push({ url: await blobToDataUrl(blob), label: it.name });
        setProgress((i + 1) / total);
        setStatus(`Rendering ${i + 1} / ${total}…`);
        await new Promise((r) => setTimeout(r, 0));
      }
      openPrintSheet(cells);
      setStatus(`Sheet ready, ${cells.length} codes. Use your browser's “Save as PDF”.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sheet build failed.";
      setError(msg === "Batch cancelled." ? null : msg);
      if (msg === "Batch cancelled.") setStatus("Cancelled.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [items, busy, style]);

  const cancel = React.useCallback(() => {
    cancelRef.current = true;
  }, []);

  const clearAll = React.useCallback(() => {
    setRaw("");
    setError(null);
    setStatus(null);
  }, []);

  const loadSample = React.useCallback(() => {
    setRaw(
      [
        "https://gigaikripaservices.com",
        "https://gigaikripaservices.com/tools",
        "https://gigaikripaservices.com/qr-tools",
        "WIFI:T:WPA;S:Studio-Guest;P:welcome123;;",
        "mailto:hello@gigaikripaservices.com",
        "tel:+15551234567",
      ].join("\n"),
    );
  }, []);

  const hasItems = items.length > 0;
  const previewItems = items.slice(0, PREVIEW_LIMIT);
  const hiddenCount = items.length - previewItems.length;

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="relative flex h-[min(82vh,940px)] min-h-[600px] w-full flex-col overflow-hidden max-md:h-auto max-md:min-h-0 max-md:overflow-visible rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <DropOverlay show={isDragging} label="Drop a .csv or .txt to add rows" />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name="QrCode" size={16} />
          </span>
          <h2 className="truncate text-sm font-semibold">QR Studio</h2>
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            · {items.length} code{items.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
            disabled={busy}
            aria-label="Export format"
            className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
          {busy ? (
            <Button variant="outline" size="sm" onClick={cancel}>
              <Icon name="X" size={15} />
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" disabled={!hasItems} onClick={exportSheet}>
                <Icon name="Printer" size={15} />
                <span className="max-sm:hidden">Print sheet</span>
              </Button>
              <Button size="sm" disabled={!hasItems} onClick={exportZip}>
                <Icon name="Download" size={15} />
                Export ZIP
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ── Body: list · preview · style ─────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(240px,300px)_1fr_minmax(250px,320px)] max-lg:grid-cols-[minmax(220px,280px)_1fr] max-md:grid-cols-1">
        {/* LEFT: the content list */}
        <aside className="flex min-h-0 flex-col border-r border-border max-md:border-r-0 max-md:border-b">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contents
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Import a .csv or .txt file"
              >
                Import
              </button>
              <button
                type="button"
                onClick={loadSample}
                className="rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sample
              </button>
              {raw.trim() ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3 max-md:min-h-[180px]">
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              placeholder={
                "Paste one QR value per line, e.g.\n\nhttps://example.com\nhttps://example.com/pricing\nWIFI:T:WPA;S:Guest;P:pass123;;\n\n…or drop a .csv / .txt anywhere."
              }
              className="h-full w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            {items.length} value{items.length === 1 ? "" : "s"} · blank lines are ignored ·
            duplicate names are auto-numbered.
          </p>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.txt,.tsv,text/csv,text/plain"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = "";
            }}
          />
        </aside>

        {/* CENTER: live grid preview */}
        <main className="flex min-h-0 flex-col overflow-hidden bg-muted/20">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="LayoutGrid" size={13} />
              <span>Live preview</span>
            </div>
            {report ? (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  report.scannable
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive",
                )}
                title={`Contrast ${report.contrast}:1`}
              >
                <Icon name={report.scannable ? "ShieldCheck" : "ShieldAlert"} size={12} />
                {report.scannable ? "Scan-ready" : "Low scannability"}
              </span>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4 max-md:min-h-[280px]">
            {!hasItems ? (
              <EmptyState onSample={loadSample} onImport={() => csvInputRef.current?.click()} />
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-3">
                  {previewItems.map((it) => (
                    <QrCell key={`${it.name}:${it.index}`} payload={it.payload} name={it.name} style={style} />
                  ))}
                </div>
                {hiddenCount > 0 ? (
                  <p className="mt-4 text-center text-[11px] text-muted-foreground">
                    + {hiddenCount} more not previewed - the ZIP / sheet includes all{" "}
                    {items.length} codes.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </main>

        {/* RIGHT: shared style */}
        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l border-border p-3 max-lg:col-span-2 max-lg:flex-row max-lg:flex-wrap max-lg:border-l-0 max-lg:border-t max-md:col-span-1 max-md:flex-col">
          <StylePanel
            style={style}
            exportSize={exportSize}
            busy={busy}
            report={report}
            onPatch={patch}
            onSize={setExportSize}
            onPickLogo={() => logoInputRef.current?.click()}
            onClearLogo={clearLogo}
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              onLogoPicked(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </aside>
      </div>

      {/* ── Bottom status bar ────────────────────────────────────── */}
      <footer className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs">
        {busy ? (
          <span className="flex flex-1 items-center gap-2 text-foreground">
            <Icon name="LoaderCircle" size={14} className="animate-spin" />
            <span className="truncate">{status ?? "Working…"}</span>
            {progress !== null ? (
              <span className="ml-auto flex items-center gap-2">
                <span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </span>
                <span className="tabular-nums text-muted-foreground">{Math.round(progress * 100)}%</span>
              </span>
            ) : null}
          </span>
        ) : error ? (
          <span className="flex items-center gap-2 text-destructive">
            <Icon name="TriangleAlert" size={14} />
            {error}
          </span>
        ) : status ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Check" size={14} className="text-emerald-500" />
            {status}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Batch QR studio - {items.length} code{items.length === 1 ? "" : "s"}. Everything renders
            in your browser and nothing is uploaded.
          </span>
        )}
      </footer>
    </div>
  );
}

/* ── Live single-QR cell (renders via the render engine) ────────────────── */

const QrCell = React.memo(function QrCell({
  payload,
  name,
  style,
}: {
  payload: string;
  name: string;
  style: QRStyleConfig;
}) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setFailed(false);
    void (async () => {
      try {
        const { renderToCanvas } = await import("@/lib/qr/render");
        const canvas = await renderToCanvas(payload, style, 256);
        if (!alive) return;
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [payload, style]);

  return (
    <figure className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-2 shadow-sm">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
        {failed ? (
          <span className="flex flex-col items-center gap-1 text-destructive">
            <Icon name="TriangleAlert" size={18} />
            <span className="text-[10px]">render error</span>
          </span>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`QR for ${name}`} className="size-full object-contain" />
        ) : (
          <Icon name="LoaderCircle" size={18} className="animate-spin text-muted-foreground" />
        )}
      </div>
      <figcaption className="truncate text-center text-[10px] text-muted-foreground" title={payload}>
        {name}
      </figcaption>
    </figure>
  );
});

/* ── Empty state (before any content) ───────────────────────────────────── */

function EmptyState({ onSample, onImport }: { onSample: () => void; onImport: () => void }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon name="QrCode" size={28} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Generate a batch of QR codes</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Type or paste one value per line on the left, or drop a .csv / .txt file anywhere. Style
          them all together, then export a ZIP or a printable sheet.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSample}>
          <Icon name="Sparkles" size={15} />
          Load a sample
        </Button>
        <Button variant="outline" size="sm" onClick={onImport}>
          <Icon name="Upload" size={15} />
          Import a file
        </Button>
      </div>
    </div>
  );
}

/* ── Style panel (right column) ─────────────────────────────────────────── */

function StylePanel({
  style,
  exportSize,
  report,
  onPatch,
  onSize,
  onPickLogo,
  onClearLogo,
}: {
  style: QRStyleConfig;
  exportSize: number;
  busy: boolean;
  report: { scannable: boolean; contrast: number; warnings: string[] } | null;
  onPatch: (next: Partial<QRStyleConfig>) => void;
  onSize: (n: number) => void;
  onPickLogo: () => void;
  onClearLogo: () => void;
}) {
  return (
    <div className="flex min-w-[220px] flex-1 flex-col gap-4 max-lg:min-w-[280px]">
      {/* Colors */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Colors</h3>
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Foreground" value={style.fgColor} onChange={(v) => onPatch({ fgColor: v })} />
          <ColorField
            label="Background"
            value={style.bgColor}
            disabled={style.transparentBg}
            onChange={(v) => onPatch({ bgColor: v })}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPatch({ fgColor: c })}
              aria-label={`Foreground ${c}`}
              className={cn(
                "size-6 rounded-md border transition-transform hover:scale-110",
                style.fgColor.toLowerCase() === c ? "border-foreground ring-2 ring-ring" : "border-border",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={style.transparentBg ?? false}
            onChange={(e) => onPatch({ transparentBg: e.target.checked })}
            className="size-3.5 accent-[var(--primary)]"
          />
          Transparent background (PNG / SVG)
        </label>
      </section>

      {/* Shape */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shape</h3>
        <Segmented
          label="Dots"
          value={style.dotStyle}
          options={DOT_STYLES}
          onChange={(v) => onPatch({ dotStyle: v })}
        />
        <Segmented
          label="Eyes"
          value={style.eyeFrameStyle}
          options={EYE_STYLES}
          onChange={(v) => onPatch({ eyeFrameStyle: v, eyeDotStyle: v === "circle" ? "circle" : v === "rounded" ? "rounded" : "square" })}
        />
      </section>

      {/* Reliability */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Error correction
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {EC_LEVELS.map((ec) => (
            <button
              key={ec.value}
              type="button"
              onClick={() => onPatch({ errorCorrection: ec.value })}
              title={ec.hint}
              className={cn(
                "rounded-md border py-1.5 text-xs font-semibold transition-colors",
                style.errorCorrection === ec.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted/40",
              )}
            >
              {ec.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs text-muted-foreground">
            Quiet-zone margin
            <span className="ml-1 tabular-nums text-foreground">{style.margin}px</span>
          </label>
        </div>
        <input
          type="range"
          min={0}
          max={40}
          step={2}
          value={style.margin}
          onChange={(e) => onPatch({ margin: Number(e.target.value) })}
          className="w-full accent-[var(--primary)]"
        />
      </section>

      {/* Logo */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Centre logo</h3>
        {style.logo?.dataUrl ? (
          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <span className="flex size-9 items-center justify-center overflow-hidden rounded bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={style.logo.dataUrl} alt="Logo" className="size-full object-contain" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs">
                {Math.round((style.logo.sizeRatio ?? 0.24) * 100)}% of width
              </span>
              <input
                type="range"
                min={10}
                max={40}
                step={1}
                value={Math.round((style.logo.sizeRatio ?? 0.24) * 100)}
                onChange={(e) =>
                  onPatch({ logo: { ...style.logo!, sizeRatio: Number(e.target.value) / 100 } })
                }
                className="w-full accent-[var(--primary)]"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={onClearLogo} aria-label="Remove logo">
              <Icon name="Trash2" size={15} />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="justify-start" onClick={onPickLogo}>
            <Icon name="ImagePlus" size={15} />
            Add a logo
          </Button>
        )}
      </section>

      {/* Export size */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Export size
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {[256, 512, 1024, 2048].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSize(s)}
              className={cn(
                "rounded-md border py-1.5 text-[11px] font-medium transition-colors",
                exportSize === s ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Honest scan warnings */}
      {report && report.warnings.length > 0 ? (
        <section className="flex flex-col gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            <Icon name="TriangleAlert" size={13} />
            Scan check
          </h3>
          <ul className="space-y-1">
            {report.warnings.slice(0, 3).map((w, i) => (
              <li key={i} className="text-[11px] leading-snug text-muted-foreground">
                {w}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-auto rounded-lg border border-dashed border-border p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        Every code is rendered for real in your browser, large, high-resolution batches take time
        and memory. The run is cancellable. The grid previews the first {PREVIEW_LIMIT}; exports
        include all rows.
      </p>
    </div>
  );
}

/* ── Small controls ─────────────────────────────────────────────────────── */

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className={cn("flex flex-col gap-1", disabled && "opacity-50")}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 rounded-md border border-border p-1">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="size-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[11px] outline-none"
        />
      </span>
    </label>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              value === o.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Printable sheet + data-url helpers ─────────────────────────────────── */

/** Read a Blob as a data URL. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read blob."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

/**
 * Open a print-ready A4 sheet of the rendered QR PNGs in a new window. We hand
 * the final PDF step to the browser's own "Save as PDF" (no extra dependency),
 * which is honest about how the sheet becomes a file.
 */
function openPrintSheet(cells: { url: string; label: string }[]): void {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!win) return;
  const escapeHtml = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const cellsHtml = cells
    .map(
      (c) =>
        `<figure><img src="${c.url}" alt=""/><figcaption>${escapeHtml(c.label)}</figcaption></figure>`,
    )
    .join("");
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>QR sheet, ${cells.length} codes</title>` +
      `<style>` +
      `@page{size:A4;margin:12mm}` +
      `body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif}` +
      `.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8mm}` +
      `figure{margin:0;text-align:center;break-inside:avoid}` +
      `img{width:100%;height:auto;border:1px solid #eee;border-radius:4px}` +
      `figcaption{margin-top:2mm;font-size:8pt;color:#555;word-break:break-all}` +
      `</style></head><body><div class="grid">${cellsHtml}</div>` +
      `<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>` +
      `</body></html>`,
  );
  win.document.close();
}
