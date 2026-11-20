"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { reorderPages } from "@/lib/pdf/ops";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";
import { Button } from "@/components/ui/button";

/**
 * Reorder PDF Pages, mirrors the Merge PDF reference, but works within a single
 * document at the page level.
 *
 * One PDF is queued through `usePdfTool` (accept application/pdf, single file)
 * and its pages render in `PdfPageGrid`. Passing `order` + `onReorder` unlocks
 * the grid's drag-and-drop / Alt+Arrow reordering; the grid is the source of
 * truth for the page count too, the first `onReorder` it emits reveals the full
 * 1..N sequence, which we remember. On run we hand that sequence to the engine's
 * `reorderPages`, which re-copies every page into a fresh PDF in exactly this
 * order with pdf-lib. The order is written into the file, not just previewed.
 */
export default function ReorderPdfPagesTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  // The display order as 1-based page numbers. Empty until the grid reports its
  // natural sequence via the first onReorder call.
  const [order, setOrder] = React.useState<number[]>([]);

  // Keep the freshest order available to the (stable) async processor.
  const orderRef = React.useRef(order);
  React.useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "reordered-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) {
        throw new Error("Add a PDF to reorder. Drop in a file and try again.");
      }

      const sequence = orderRef.current;
      if (sequence.length === 0) {
        throw new Error(
          "The pages are still loading. Wait for the previews to appear, then try again.",
        );
      }

      const reordered = await reorderPages(input, sequence);
      return [{ name: reordered.name, blob: reordered.blob, size: reordered.size }];
    },
  });

  // The single queued file, if any. Drives the grid + resets order state.
  const file = state.files[0];
  const fileId = file?.id;

  // When the file changes (reset / new upload), forget the previous order.
  React.useEffect(() => {
    setOrder([]);
  }, [fileId]);

  const pageCount = order.length;

  // The natural order is 1,2,3…N. Compare against `order` to know if the user
  // has actually moved anything (so the summary and reset control are honest).
  const isReordered = React.useMemo(
    () => order.some((page, index) => page !== index + 1),
    [order],
  );

  /** Restore the pages to their original 1..N sequence. */
  const resetOrder = React.useCallback(() => {
    setOrder((prev) => prev.map((_, index) => index + 1));
  }, []);

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="ArrowDownUp"
      dropHint="Select a single PDF to rearrange its pages"
      processLabel="Reorder pages"
      resultHint="Pages are re-copied into your new order, entirely in your browser."
    >
      {file ? (
        <div className="flex flex-col gap-5">
          {/* ── Header + reset control ───────────────────────────────────── */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="ArrowDownUp" size={16} className={style.text} />
                <h3 className="text-sm font-medium text-foreground">
                  Arrange the pages
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetOrder}
                disabled={!isReordered}
                aria-label="Restore the original page order"
              >
                <Icon name="Undo2" size={15} />
                Original order
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag any page to a new spot, or focus one and press{" "}
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] font-medium text-foreground">
                Alt + &larr; / &rarr;
              </kbd>
              . The numbers update as you go, so the sequence you see is the
              sequence you&rsquo;ll get.
            </p>
          </div>

          {/* ── Reorderable page grid with live numbering ────────────────── */}
          <PdfPageGrid
            onLoaded={(pages) => setOrder((prev) => (prev.length > 0 ? prev : pages))}
            file={file.file}
            order={order.length > 0 ? order : undefined}
            onReorder={setOrder}
            accent={tool.accent}
          />

          {/* ── Running summary ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Icon
                name={isReordered ? "ListOrdered" : "Info"}
                size={16}
                className={style.text}
              />
              {pageCount === 0
                ? "Loading page previews…"
                : isReordered
                  ? `New order set across ${pageCount} page${pageCount === 1 ? "" : "s"} · ${formatBytes(
                      file.size,
                    )}, ready to rebuild`
                  : `${pageCount} page${pageCount === 1 ? "" : "s"} in their original order · ${formatBytes(
                      file.size,
                    )}, drag a page to rearrange`}
            </span>
            {isReordered ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  style.soft,
                )}
              >
                <Icon name="Check" size={13} />
                Order changed
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
