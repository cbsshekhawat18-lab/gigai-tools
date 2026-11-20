"use client";

import * as React from "react";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes, getPageCount } from "@/lib/pdf/core";
import { Button } from "@/components/ui/button";
import type { PdfInput } from "@/components/tool/pdf/use-pdf-tool";

export interface PdfFileListProps {
  files: PdfInput[];
  /** Remove a queued file by id. */
  onRemove: (id: string) => void;
  /**
   * Move a file from one index to another. When provided, each row gains
   * keyboard-accessible up/down controls and a drag handle. Use it for
   * order-sensitive tools (merge, arrange). Omit for order-agnostic tools.
   */
  onReorder?: (from: number, to: number) => void;
  /** Per-tool accent for indices + highlights. */
  accent?: AccentKey;
  /** Optional heading above the list. */
  label?: string;
  /**
   * Read and show each file's page count beside its size. Off by default
   * because it opens every queued PDF, which is wasted work for tools where
   * the count tells the user nothing. Encrypted or damaged files simply keep
   * showing their size. The count is a nicety, never a blocker.
   */
  showPageCounts?: boolean;
  className?: string;
}

/**
 * The queued-file list for a PDF tool. Each row shows an ordinal, the file
 * name + size, and a remove control. When `onReorder` is supplied the rows are
 * fully reorderable by pointer (native drag & drop) AND keyboard (up/down
 * buttons, or Alt+Arrow while the row is focused) so order-sensitive tools like
 * Merge stay WCAG-accessible.
 */
export function PdfFileList({
  files,
  onRemove,
  onReorder,
  accent,
  label,
  showPageCounts = false,
  className,
}: PdfFileListProps) {
  const style = accentStyle(accent);
  const reorderable = typeof onReorder === "function";
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  // Page counts, keyed by queue id and read lazily one file at a time. Ids are
  // stable across reordering, so dragging never re-reads a file, and a removed
  // file's entry is simply never looked up again.
  const [pageCounts, setPageCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!showPageCounts) return;
    let cancelled = false;

    void (async () => {
      for (const file of files) {
        if (cancelled) return;
        if (pageCounts[file.id] !== undefined) continue;
        try {
          const count = await getPageCount(file.file);
          if (cancelled) return;
          setPageCounts((prev) => ({ ...prev, [file.id]: count }));
        } catch {
          // Encrypted or damaged. The row keeps its size and says nothing it
          // cannot back up, rather than showing a wrong or invented count.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [files, showPageCounts, pageCounts]);

  const move = React.useCallback(
    (from: number, to: number) => {
      if (!onReorder) return;
      if (to < 0 || to >= files.length || from === to) return;
      onReorder(from, to);
    },
    [files.length, onReorder],
  );

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    index: number,
  ) => {
    if (!reorderable) return;
    // Alt+Arrow reorders; plain arrows still scroll/navigate normally.
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      move(index, event.key === "ArrowUp" ? index - 1 : index + 1);
    }
  };

  if (files.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label ? (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <span className="text-sm text-muted-foreground tabular-nums">
            {files.length} file{files.length === 1 ? "" : "s"}
          </span>
        </div>
      ) : null}

      {reorderable ? (
        <p className="text-sm text-muted-foreground">
          Drag to reorder, or focus a file and press{" "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] font-medium text-foreground">
            Alt + ↑ / ↓
          </kbd>
          . This is the order they&apos;ll be combined.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {files.map((file, index) => {
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;

          return (
            <li
              key={file.id}
              draggable={reorderable}
              tabIndex={reorderable ? 0 : -1}
              aria-label={
                reorderable
                  ? `${file.name}, position ${index + 1} of ${files.length}. Press Alt plus Arrow Up or Arrow Down to reorder.`
                  : undefined
              }
              onKeyDown={(event) => handleKeyDown(event, index)}
              onDragStart={() => reorderable && setDragIndex(index)}
              onDragEnter={() => reorderable && setOverIndex(index)}
              onDragOver={(event) => {
                if (reorderable) event.preventDefault();
              }}
              onDrop={(event) => {
                if (!reorderable || dragIndex === null) return;
                event.preventDefault();
                move(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors outline-none",
                reorderable &&
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                reorderable && style.ring,
                isOver ? cn("border-dashed", style.border) : "border-border",
                isDragging ? "opacity-50" : "hover:bg-muted/40",
              )}
            >
              {reorderable ? (
                <span
                  aria-hidden="true"
                  className="flex cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <Icon name="GripVertical" size={16} />
                </span>
              ) : null}

              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
                  style.soft,
                )}
              >
                {index + 1}
              </span>

              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Icon
                  name="FileText"
                  size={16}
                  className={cn("shrink-0", style.text)}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {pageCounts[file.id] !== undefined
                      ? `${pageCounts[file.id]} ${pageCounts[file.id] === 1 ? "page" : "pages"} · ${formatBytes(file.size)}`
                      : formatBytes(file.size)}
                  </span>
                </span>
              </span>

              {reorderable ? (
                <span className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${file.name} up`}
                  >
                    <Icon name="ChevronUp" size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => move(index, index + 1)}
                    disabled={index === files.length - 1}
                    aria-label={`Move ${file.name} down`}
                  >
                    <Icon name="ChevronDown" size={16} />
                  </Button>
                </span>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                <Icon name="X" size={16} />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
