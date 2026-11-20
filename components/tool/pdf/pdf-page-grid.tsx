"use client";

import * as React from "react";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { renderThumbnails } from "@/lib/pdf/core";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** A rendered page thumbnail: 1-based page number + a data URL preview. */
interface PageThumb {
  page: number;
  dataUrl: string;
}

export interface PdfPageGridProps {
  /** The source PDF whose pages are rendered as thumbnails. */
  file: File;
  /**
   * Selected 1-based page numbers (controlled). When provided the grid renders
   * checkboxes and toggles selection on click, for delete / extract tools.
   */
  selected?: number[];
  /** Called with the next selection when a page is toggled. */
  onSelectChange?: (pages: number[]) => void;
  /**
   * Per-page rotation in degrees, keyed by 1-based page number (controlled).
   * When provided each thumbnail gains a rotate control.
   */
  rotations?: Record<number, number>;
  /** Called with the next rotation map when a page is rotated. */
  onRotateChange?: (rotations: Record<number, number>) => void;
  /**
   * Fired once per file when the thumbnails have rendered, with the natural
   * page sequence (1..N). Lets parents learn the page count without waiting
   * for a user interaction — "rotate all" and "reorder" need it on load.
   */
  onLoaded?: (pages: number[]) => void;
  /**
   * The display order as a list of 1-based page numbers (controlled). When
   * provided pages become reorderable by pointer + keyboard (Alt+Arrow).
   */
  order?: number[];
  /** Called with the next order when pages are reordered. */
  onReorder?: (order: number[]) => void;
  /** Per-tool accent for selection + highlights. */
  accent?: AccentKey;
  /** Max thumbnail width in px passed to the renderer. */
  maxWidth?: number;
  className?: string;
}

/** Normalise a rotation into the 0/90/180/270 range. */
function normalizeRotation(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * A responsive grid of PDF page thumbnails with three optional, composable
 * capabilities driven purely by which props a tool passes:
 *
 *  • selection, pass `selected` + `onSelectChange` (delete / extract pages)
 *  • rotation, pass `rotations` + `onRotateChange` (per-page rotate)
 *  • reordering: pass `order` + `onReorder` (drag or Alt+Arrow to arrange)
 *
 * Thumbnails render lazily off the main thread via `renderThumbnails`, showing
 * skeletons until ready. Everything is keyboard-operable and screen-reader
 * labelled.
 */
export function PdfPageGrid({
  file,
  selected,
  onSelectChange,
  rotations,
  onRotateChange,
  onLoaded,
  order,
  onReorder,
  accent,
  maxWidth = 240,
  className,
}: PdfPageGridProps) {
  const style = accentStyle(accent);
  const [thumbs, setThumbs] = React.useState<PageThumb[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const selectable = typeof onSelectChange === "function";
  const rotatable = typeof onRotateChange === "function";
  const reorderable = typeof onReorder === "function";

  const selectedSet = React.useMemo(
    () => new Set(selected ?? []),
    [selected],
  );

  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  // Parents typically pass a fresh onLoaded closure each render; keep it in a
  // ref so the thumbnail effect stays keyed to the file alone.
  const onLoadedRef = React.useRef(onLoaded);
  React.useEffect(() => {
    onLoadedRef.current = onLoaded;
  });

  // Render thumbnails once per file; keep them stable across selection changes.
  React.useEffect(() => {
    let cancelled = false;
    setThumbs(null);
    setError(null);

    renderThumbnails(file, maxWidth)
      .then((rendered) => {
        if (cancelled) return;
        setThumbs(rendered);
        onLoadedRef.current?.(rendered.map((t) => t.page));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error && err.message
            ? err.message
            : "We couldn't render this PDF's pages.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [file, maxWidth]);

  const byPage = React.useMemo(() => {
    const map = new Map<number, PageThumb>();
    for (const t of thumbs ?? []) map.set(t.page, t);
    return map;
  }, [thumbs]);

  // The sequence of page numbers to render: an explicit order, else natural.
  const sequence = React.useMemo<number[]>(() => {
    if (order && order.length > 0) return order;
    return (thumbs ?? []).map((t) => t.page);
  }, [order, thumbs]);

  const toggleSelect = (page: number) => {
    if (!onSelectChange) return;
    const next = new Set(selectedSet);
    if (next.has(page)) next.delete(page);
    else next.add(page);
    onSelectChange([...next].sort((a, b) => a - b));
  };

  const rotatePage = (page: number) => {
    if (!onRotateChange) return;
    const current = rotations?.[page] ?? 0;
    onRotateChange({ ...(rotations ?? {}), [page]: normalizeRotation(current + 90) });
  };

  const moveTo = (from: number, to: number) => {
    if (!onReorder) return;
    if (to < 0 || to >= sequence.length || from === to) return;
    const next = sequence.slice();
    const [moved] = next.splice(from, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);
    onReorder(next);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    page: number,
    index: number,
  ) => {
    if (selectable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggleSelect(page);
      return;
    }
    if (
      reorderable &&
      event.altKey &&
      (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      event.preventDefault();
      moveTo(index, event.key === "ArrowLeft" ? index - 1 : index + 1);
    }
  };

  const gridClass =
    "mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </p>
    );
  }

  // Loading skeletons: one per expected page is unknown up front, so show a set.
  if (thumbs === null) {
    return (
      <div className={cn(gridClass, className)} aria-busy="true" role="status">
        <span className="sr-only">Rendering page previews…</span>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-3/4 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {reorderable ? (
        <p className="text-sm text-muted-foreground">
          Drag pages to rearrange, or focus a page and press{" "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] font-medium text-foreground">
            Alt + ← / →
          </kbd>
          .
        </p>
      ) : null}

      <ul className={gridClass}>
        {sequence.map((page, index) => {
          const thumb = byPage.get(page);
          const isSelected = selectedSet.has(page);
          const rotation = rotations?.[page] ?? 0;
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;

          const interactive = selectable || reorderable;

          return (
            <li key={page} className="min-w-0">
              <div
                role={selectable ? "checkbox" : undefined}
                aria-checked={selectable ? isSelected : undefined}
                tabIndex={interactive ? 0 : -1}
                aria-label={
                  selectable
                    ? `Page ${page}${isSelected ? ", selected" : ""}`
                    : `Page ${page}`
                }
                draggable={reorderable}
                onClick={() => selectable && toggleSelect(page)}
                onKeyDown={(event) => handleKeyDown(event, page, index)}
                onDragStart={() => reorderable && setDragIndex(index)}
                onDragEnter={() => reorderable && setOverIndex(index)}
                onDragOver={(event) => reorderable && event.preventDefault()}
                onDrop={(event) => {
                  if (!reorderable || dragIndex === null) return;
                  event.preventDefault();
                  moveTo(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border bg-card p-2 transition-all outline-none",
                  interactive && "cursor-pointer",
                  interactive &&
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  interactive && style.ring,
                  isSelected
                    ? cn("ring-2", style.border, style.ring)
                    : "border-border",
                  isOver && cn("border-dashed", style.border),
                  isDragging ? "opacity-50" : interactive && "hover:bg-muted/40",
                )}
              >
                {selectable ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-3 top-3 z-10 flex size-5 items-center justify-center rounded-md border-2 bg-background/90 transition-colors",
                      isSelected
                        ? cn(style.solid, "border-transparent text-white")
                        : "border-border text-transparent",
                    )}
                  >
                    <Icon name="Check" size={12} />
                  </span>
                ) : null}

                <div className="flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- in-browser data URL, not a remote asset
                    <img
                      src={thumb.dataUrl}
                      alt={`Preview of page ${page}`}
                      className="max-h-full max-w-full object-contain transition-transform"
                      style={{ transform: `rotate(${rotation}deg)` }}
                      draggable={false}
                    />
                  ) : (
                    <Skeleton className="size-full" />
                  )}
                </div>

                <div className="flex w-full items-center justify-between gap-1 px-0.5">
                  <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    Page {page}
                  </span>
                  {rotatable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={(event) => {
                        event.stopPropagation();
                        rotatePage(page);
                      }}
                      aria-label={`Rotate page ${page} 90 degrees`}
                    >
                      <Icon name="RotateCw" size={14} />
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
