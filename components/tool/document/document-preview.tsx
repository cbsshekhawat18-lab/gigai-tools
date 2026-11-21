"use client";

/**
 * <DocumentPreview>: a universal, read-only preview for any document family.
 *
 * Branches on the detected (or provided) {@link DocumentKind} and renders the
 * right viewer entirely in the browser:
 *   pdf   → pdf.js canvas with page paging
 *   csv   → DataGrid (read-only) via papaparse
 *   xlsx  → DataGrid per sheet, with a sheet switcher
 *   md    → rendered markdown (marked)
 *   html  → sanitised HTML
 *   json  → pretty-printed, monospaced
 *   txt   → monospaced text with a stats footer
 *   epub  → epub.js rendition with prev/next
 *   image → object-fit-contained <img>
 *
 * Every heavy dependency is dynamic-imported inside its branch, so mounting the
 * component costs nothing until the relevant kind is shown. A graceful fallback
 * (icon + name + Download) covers unknown/unsupported files and load failures.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatBytes, openPdfDocument, pageToCanvas } from "@/lib/pdf/core";
import { download } from "@/components/tool/dev";
import { DataGrid } from "./data-grid";
import {
  type DocumentKind,
  type TableData,
  type SheetTable,
  detectFileKind,
  parseCsv,
  parseWorkbook,
  readText,
  markdownToHtml,
  sanitizeHtml,
  prettyJson,
  textStats,
  KIND_ICONS,
  KIND_LABELS,
} from "@/lib/document-tools";

/** Props for {@link DocumentPreview}. */
export interface DocumentPreviewProps {
  /** The file to preview. */
  file: File;
  /** Force a kind; defaults to auto-detection from the file. */
  kind?: DocumentKind;
  /** Viewport height in px. Default 480. */
  height?: number;
  /** Allow downloading the original file from the preview chrome. Default true. */
  downloadable?: boolean;
  className?: string;
}

/** Universal read-only document viewer with per-kind renderers. */
export function DocumentPreview({
  file,
  kind,
  height = 480,
  downloadable = true,
  className,
}: DocumentPreviewProps) {
  const resolved = kind ?? detectFileKind(file);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <header className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <Icon name={KIND_ICONS[resolved]} size={15} className="text-muted-foreground" />
        <span className="truncate text-sm font-medium text-foreground">
          {file.name}
        </span>
        <span className="ml-auto shrink-0 text-sm text-muted-foreground">
          {KIND_LABELS[resolved]} · {formatBytes(file.size)}
        </span>
        {downloadable && (
          <button
            type="button"
            onClick={() => download(file.name, file, file.type || undefined)}
            aria-label="Download original file"
            className="rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Download" size={15} />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1">
        <PreviewBody file={file} kind={resolved} height={height} />
      </div>
    </div>
  );
}

/** Dispatch to the right renderer. */
function PreviewBody({
  file,
  kind,
  height,
}: {
  file: File;
  kind: DocumentKind;
  height: number;
}) {
  switch (kind) {
    case "pdf":
      return <PdfPreview file={file} height={height} />;
    case "csv":
    case "xlsx":
      return <TabularPreview file={file} kind={kind} height={height} />;
    case "md":
    case "html":
    case "json":
    case "txt":
      return <TextPreview file={file} kind={kind} height={height} />;
    case "epub":
      return <EpubPreview file={file} height={height} />;
    case "image":
      return <ImagePreview file={file} height={height} />;
    default:
      return <Fallback file={file} kind={kind} />;
  }
}

/* ── Shared status states ──────────────────────────────────────────────────── */

function Loading({ height }: { height: number }) {
  return (
    <div
      className="grid place-items-center text-muted-foreground"
      style={{ minHeight: Math.min(height, 240) }}
    >
      <Icon name="LoaderCircle" size={24} className="animate-spin" />
    </div>
  );
}

function Fallback({
  file,
  kind,
  message,
}: {
  file: File;
  kind: DocumentKind;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon name={KIND_ICONS[kind]} size={24} />
      </span>
      <p className="text-sm text-muted-foreground">
        {message ?? "No inline preview for this file."}
      </p>
      <button
        type="button"
        onClick={() => download(file.name, file, file.type || undefined)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name="Download" size={15} />
        Download file
      </button>
    </div>
  );
}

/* ── PDF ───────────────────────────────────────────────────────────────────── */

function PdfPreview({ file, height }: { file: File; height: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [page, setPage] = React.useState(1);
  const [numPages, setNumPages] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    let doc: Awaited<ReturnType<typeof openPdfDocument>> | null = null;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        doc = await openPdfDocument(file);
        if (cancelled) return;
        setNumPages(doc.numPages);
        const target = Math.min(page, doc.numPages);
        const p = await doc.getPage(target);
        const base = p.getViewport({ scale: 1 });
        const scale = base.width > 0 ? Math.min(2, 720 / base.width) : 1;
        const rendered = await pageToCanvas(p, scale);
        p.cleanup();
        if (cancelled) return;
        const dest = canvasRef.current;
        if (dest) {
          dest.width = rendered.width;
          dest.height = rendered.height;
          dest.getContext("2d")?.drawImage(rendered, 0, 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not render this PDF.");
        }
      } finally {
        if (!cancelled) setLoading(false);
        await doc?.loadingTask.destroy();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, page]);

  if (error) return <Fallback file={file} kind="pdf" message={error} />;

  return (
    <div className="flex flex-col">
      <div
        className="overflow-auto bg-neutral-100 p-4 dark:bg-neutral-900"
        style={{ maxHeight: height }}
      >
        {loading && numPages === 0 ? (
          <Loading height={height} />
        ) : (
          <canvas
            ref={canvasRef}
            className="mx-auto h-auto max-w-full rounded shadow-md"
          />
        )}
      </div>
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-border px-3 py-2">
          <Pager
            page={page}
            total={numPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(numPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}

/* ── Tabular (CSV / XLSX) ────────────────────────────────────────────────────── */

function TabularPreview({
  file,
  kind,
  height,
}: {
  file: File;
  kind: "csv" | "xlsx";
  height: number;
}) {
  const [sheets, setSheets] = React.useState<SheetTable[] | null>(null);
  const [active, setActive] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setSheets(null);
    setError(null);
    (async () => {
      try {
        if (kind === "csv") {
          const table = await parseCsv(await readText(file));
          if (!cancelled) setSheets([{ name: "Sheet", table }]);
        } else {
          const parsed = await parseWorkbook(file);
          if (!cancelled) setSheets(parsed.length ? parsed : [{ name: "Sheet", table: { headers: ["Column 1"], rows: [] } }]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not read this file.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, kind]);

  if (error) return <Fallback file={file} kind={kind} message={error} />;
  if (!sheets) return <Loading height={height} />;

  const current: TableData =
    sheets[Math.min(active, sheets.length - 1)]?.table ?? { headers: [], rows: [] };

  return (
    <div className="flex flex-col p-3">
      {sheets.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {sheets.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                i === active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <DataGrid data={current} editable={false} height={height} />
    </div>
  );
}

/* ── Text / Markdown / HTML / JSON ────────────────────────────────────────────── */

function TextPreview({
  file,
  kind,
  height,
}: {
  file: File;
  kind: "md" | "html" | "json" | "txt";
  height: number;
}) {
  const [content, setContent] = React.useState<string | null>(null);
  const [html, setHtml] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setContent(null);
    setHtml(null);
    (async () => {
      const raw = await readText(file);
      if (cancelled) return;
      if (kind === "md") {
        const rendered = await markdownToHtml(raw);
        if (!cancelled) setHtml(rendered);
      } else if (kind === "html") {
        if (!cancelled) setHtml(sanitizeHtml(raw));
      } else {
        setContent(kind === "json" ? prettyJson(raw) : raw);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, kind]);

  if (content === null && html === null) return <Loading height={height} />;

  if (html !== null) {
    return (
      <div className="overflow-auto p-4" style={{ maxHeight: height }}>
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          // Content is sanitised in the engine before injection.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  const stats = textStats(content ?? "");
  return (
    <div className="flex flex-col">
      <pre
        className="overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-foreground"
        style={{ maxHeight: height }}
      >
        {content}
      </pre>
      <div className="flex gap-4 border-t border-border px-4 py-1.5 text-sm text-muted-foreground tabular-nums">
        <span>{stats.lines.toLocaleString()} lines</span>
        <span>{stats.words.toLocaleString()} words</span>
        <span>{stats.characters.toLocaleString()} chars</span>
      </div>
    </div>
  );
}

/* ── EPUB ──────────────────────────────────────────────────────────────────── */

function EpubPreview({ file, height }: { file: File; height: number }) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const renditionRef = React.useRef<{
    prev: () => void;
    next: () => void;
    destroy: () => void;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    setReady(false);
    setError(null);
    (async () => {
      try {
        const ePubMod = await import("epubjs");
        const ePub = ePubMod.default;
        const buffer = await file.arrayBuffer();
        if (cancelled) return;
        const book = ePub(buffer);
        const host = hostRef.current;
        if (!host) return;
        const rendition = book.renderTo(host, {
          width: "100%",
          height: height - 44,
          flow: "paginated",
          spread: "none",
        });
        renditionRef.current = rendition as unknown as typeof renditionRef.current;
        await rendition.display();
        if (cancelled) {
          rendition.destroy();
          return;
        }
        setReady(true);
        cleanup = () => {
          rendition.destroy();
          book.destroy();
        };
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not open this e-book.");
        }
      }
    })();
    return () => {
      cancelled = true;
      cleanup?.();
      renditionRef.current = null;
    };
  }, [file, height]);

  if (error) return <Fallback file={file} kind="epub" message={error} />;

  return (
    <div className="flex flex-col">
      <div className="relative" style={{ height: height - 44 }}>
        {!ready && (
          <div className="absolute inset-0">
            <Loading height={height} />
          </div>
        )}
        <div ref={hostRef} className="h-full w-full" />
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-border px-3 py-2">
        <NavButton
          icon="ChevronLeft"
          label="Previous"
          onClick={() => renditionRef.current?.prev()}
        />
        <NavButton
          icon="ChevronRight"
          label="Next"
          onClick={() => renditionRef.current?.next()}
        />
      </div>
    </div>
  );
}

/* ── Image ─────────────────────────────────────────────────────────────────── */

function ImagePreview({ file, height }: { file: File; height: number }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div
      className="grid place-items-center overflow-auto bg-neutral-100 p-4 dark:bg-neutral-900"
      style={{ maxHeight: height }}
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL, no next/image
        <img
          src={url}
          alt={file.name}
          className="max-h-full max-w-full rounded object-contain shadow-sm"
        />
      )}
    </div>
  );
}

/* ── Small nav primitives ──────────────────────────────────────────────────── */

function Pager({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <NavButton icon="ChevronLeft" label="Previous page" onClick={onPrev} disabled={page <= 1} />
      <span className="min-w-[5rem] text-center text-sm text-muted-foreground tabular-nums">
        Page {page} / {total}
      </span>
      <NavButton icon="ChevronRight" label="Next page" onClick={onNext} disabled={page >= total} />
    </>
  );
}

function NavButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label} title={label}
      className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon name={icon} size={16} />
    </button>
  );
}
