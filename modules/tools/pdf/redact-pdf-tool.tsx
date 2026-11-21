"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { redactPdf, type RedactionBox } from "@/lib/pdf/redact";
import { warmPdfRaster } from "@/lib/engine-preload";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";

/**
 * Redact PDF: drag boxes over what must be destroyed.
 *
 * Boxes are stored in page FRACTIONS, so the preview's display size is
 * irrelevant and a box drawn on a small screen lands in the same place at full
 * render scale. The warning about rasterisation is unmissable by design: a user
 * who doesn't realise the whole document loses its text layer will be surprised
 * later, and surprise is the enemy of a security tool.
 */
export default function RedactPdfTool({ tool }: ImageToolProps) {
  const [boxes, setBoxes] = React.useState<RedactionBox[]>([]);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(0);
  const boxesRef = React.useRef(boxes);
  React.useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);

  const state = usePdfTool({
    slug: tool.slug,
    warm: warmPdfRaster,
    accept: "application/pdf",
    multiple: false,
    zipName: "redacted-gigai",
    process: async (files: PdfInput[], onProgress): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) throw new Error("Add the PDF you need to redact.");
      const { file } = await redactPdf(input, boxesRef.current, {
        onProgress: (fraction, status) => onProgress({ value: fraction, label: status }),
      });
      return [file];
    },
  });

  const source = state.files[0];

  React.useEffect(() => {
    if (!source) {
      setBoxes([]);
      setPage(1);
      setPages(0);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { getPageCount } = await import("@/lib/pdf/core");
      try {
        const n = await getPageCount(source.file);
        if (!cancelled) setPages(n);
      } catch {
        if (!cancelled) setPages(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const onPage = boxes.filter((b) => b.page === page);

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="EyeOff"
      dropHint="Select the PDF containing text you need permanently removed"
      processLabel={
        boxes.length > 0
          ? `Redact ${boxes.length} area${boxes.length === 1 ? "" : "s"}`
          : "Mark an area to redact"
      }
      resultHint="Redacted in your browser. The file is never uploaded."
    >
      {source ? (
        <>
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
            <Icon name="ShieldCheck" size={16} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="text-muted-foreground">
              <strong className="font-medium text-foreground">This removes the text, not just covers it.</strong>{" "}
              Every page is converted to an image and the original text objects
              are discarded, so redacted words cannot be selected, searched or
              recovered. The trade-off: <strong className="font-medium text-foreground">no</strong> text
              anywhere in the output stays selectable, and the file gets larger.
              That&apos;s the price of it being real.
            </span>
          </div>

          {pages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">
                Page {page} of {pages}
              </span>
              <div className="flex items-center gap-1.5">
                <NavBtn
                  label="Previous page"
                  icon="ChevronLeft"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  accent={tool.accent}
                />
                <NavBtn
                  label="Next page"
                  icon="ChevronRight"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  accent={tool.accent}
                />
              </div>
            </div>
          ) : null}

          <RedactCanvas
            file={source.file}
            page={page}
            boxes={onPage}
            onAdd={(b) => setBoxes((prev) => [...prev, b])}
            accent={tool.accent}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              {boxes.length === 0
                ? "Drag across the page to mark text for removal."
                : `${boxes.length} area${boxes.length === 1 ? "" : "s"} marked (${onPage.length} on this page).`}
            </span>
            {boxes.length > 0 ? (
              <div className="flex gap-3">
                {onPage.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setBoxes((prev) => prev.filter((b) => b.page !== page))}
                    className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Clear this page
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setBoxes([])}
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </PdfWorkspace>
  );
}

function NavBtn({
  label,
  icon,
  disabled,
  onClick,
  accent,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg border transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        style.border,
        "hover:bg-muted/50",
      )}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

/** The page image plus a drag-to-mark overlay. Boxes are page fractions. */
function RedactCanvas({
  file,
  page,
  boxes,
  onAdd,
  accent,
}: {
  file: File;
  page: number;
  boxes: RedactionBox[];
  onAdd: (b: RedactionBox) => void;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  const [src, setSrc] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [drag, setDrag] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const start = React.useRef<{ x: number; y: number } | null>(null);
  // The committed rectangle is ALSO kept in a ref. `onPointerUp` used to read
  // the `drag` state directly, which is whatever was committed at the time that
  // handler was created: with React's automatic batching that can still be
  // null when the pointer goes up, so the box was silently dropped and the mark
  // never appeared. The ref is written synchronously during the move, so it is
  // always current no matter how renders are batched.
  const dragRef = React.useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  React.useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setSrc(null);

    void (async () => {
      const { openPdfDocument, pageToCanvas, canvasToBlob } = await import("@/lib/pdf/core");
      const doc = await openPdfDocument(file);
      try {
        const p = await doc.getPage(page);
        const canvas = await pageToCanvas(p, 1.5);
        const blob = await canvasToBlob(canvas);
        p.cleanup();
        if (cancelled || !blob) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      } finally {
        await doc.loadingTask.destroy();
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, page]);

  const pointFrom = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={ref}
        className="relative mx-auto w-full max-w-lg cursor-crosshair touch-none overflow-hidden rounded-lg border border-border bg-muted/30 select-none"
        onPointerDown={(e) => {
          const p = pointFrom(e);
          if (!p) return;
          ref.current?.setPointerCapture?.(e.pointerId);
          start.current = p;
          dragRef.current = { x: p.x, y: p.y, w: 0, h: 0 };
          setDrag(dragRef.current);
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          const p = pointFrom(e);
          if (!p) return;
          dragRef.current = {
            x: Math.min(start.current.x, p.x),
            y: Math.min(start.current.y, p.y),
            w: Math.abs(p.x - start.current.x),
            h: Math.abs(p.y - start.current.y),
          };
          setDrag(dragRef.current);
        }}
        onPointerUp={() => {
          // Read the ref, never the state. See the note where dragRef is declared.
          const box = dragRef.current;
          // Ignore accidental taps, a box smaller than this covers no text and
          // would just clutter the page with invisible marks.
          if (box && box.w > 0.01 && box.h > 0.005) {
            onAdd({ page, ...box });
          }
          start.current = null;
          dragRef.current = null;
          setDrag(null);
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`Page ${page}`} draggable={false} className="pointer-events-none block w-full" />
        ) : (
          <div className="aspect-[1/1.414] w-full animate-pulse bg-muted" />
        )}

        {boxes.map((b, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute bg-foreground"
            style={{
              left: `${b.x * 100}%`,
              top: `${b.y * 100}%`,
              width: `${b.w * 100}%`,
              height: `${b.h * 100}%`,
            }}
          />
        ))}

        {drag ? (
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute border-2 bg-foreground/60", style.border)}
            style={{
              left: `${drag.x * 100}%`,
              top: `${drag.y * 100}%`,
              width: `${drag.w * 100}%`,
              height: `${drag.h * 100}%`,
            }}
          />
        ) : null}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Drag across any text to mark it. Marks apply to the page you&apos;re viewing.
      </p>
    </div>
  );
}
