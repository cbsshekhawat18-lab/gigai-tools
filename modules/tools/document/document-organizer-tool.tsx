"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { organizePages } from "@/lib/document-tools/pdfops";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";
import { Button } from "@/components/ui/button";

/**
 * Document Organizer, one visual canvas that reorders, rotates and deletes PDF
 * pages in a single rebuild.
 *
 * A single PDF is queued through `usePdfTool` (accept application/pdf, single
 * file). Its pages render in the shared `PdfPageGrid`, which is given ALL THREE
 * of its composable capabilities at once, `order` + `onReorder` (drag / Alt+
 * Arrow), `rotations` + `onRotateChange` (per-page 90° spin), and `selected` +
 * `onSelectChange` (mark-to-delete). This module never reimplements any page op:
 * on rebuild it hands the resulting order (minus deleted pages) and the per-page
 * rotations to `organizePages` (`@/lib/document-tools/pdfops`), which composes
 * reorder + rotate + delete into a SINGLE pdf-lib pass, copying the document only
 * once.
 *
 * The grid is the source of truth for the page count: the first `onReorder` it
 * emits reveals the full 1..N sequence, which we remember. `rotations` and
 * `selected` are keyed by 1-based SOURCE page number, matching `organizePages`.
 */
export default function DocumentOrganizerTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  // Display order as 1-based SOURCE page numbers. Empty until the grid reports
  // its natural sequence via the first onReorder call.
  const [order, setOrder] = React.useState<number[]>([]);
  // Per-page clockwise rotation to add, keyed by 1-based SOURCE page number.
  const [rotations, setRotations] = React.useState<Record<number, number>>({});
  // 1-based SOURCE page numbers marked for removal.
  const [removed, setRemoved] = React.useState<number[]>([]);

  // Keep the freshest state available to the (stable) async processor.
  const stateRef = React.useRef({ order, rotations, removed });
  React.useEffect(() => {
    stateRef.current = { order, rotations, removed };
  }, [order, rotations, removed]);

  const pdf = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "organized-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) {
        throw new Error("Add a PDF to organize. Drop in a file and try again.");
      }

      const { order: seq, rotations: rot, removed: rem } = stateRef.current;
      if (seq.length === 0) {
        throw new Error(
          "The pages are still loading. Wait for the previews, then arrange your pages and try again.",
        );
      }

      // Final output order = display order with removed pages taken out.
      const removedSet = new Set(rem);
      const finalOrder = seq.filter((page) => !removedSet.has(page));
      if (finalOrder.length === 0) {
        throw new Error(
          "You've marked every page for removal. Leave at least one page to rebuild the PDF.",
        );
      }

      const result = await organizePages(input, {
        order: finalOrder,
        rotations: rot,
      });
      if (!result.ok) throw new Error(result.error);
      return [{ name: result.result.name, blob: result.result.blob, size: result.result.size }];
    },
  });

  // The single queued file, if any. Drives the grid + resets all edit state.
  const file = pdf.files[0];
  const fileId = file?.id;

  // When the file changes (reset / new upload), forget the previous edits.
  React.useEffect(() => {
    setOrder([]);
    setRotations({});
    setRemoved([]);
  }, [fileId]);

  const pageCount = order.length;
  const keptCount = pageCount - removed.length;

  // Detect whether anything actually changed, so summaries + reset stay honest.
  const isReordered = React.useMemo(
    () => order.some((page, index) => page !== index + 1),
    [order],
  );
  const rotatedCount = React.useMemo(
    () => Object.values(rotations).filter((deg) => deg % 360 !== 0).length,
    [rotations],
  );
  const hasChanges = isReordered || rotatedCount > 0 || removed.length > 0;

  /** Restore every page: original order, no rotation, nothing removed. */
  const resetEdits = React.useCallback(() => {
    setOrder((prev) => prev.map((_, index) => index + 1));
    setRotations({});
    setRemoved([]);
  }, []);

  // Build the running summary from what actually changed.
  const summary = React.useMemo(() => {
    if (pageCount === 0) return "Loading page previews…";
    if (!hasChanges) {
      return `${pageCount} page${pageCount === 1 ? "" : "s"} in their original order · ${formatBytes(
        file?.size ?? 0,
      )}: drag, rotate or tap a page to start`;
    }
    const parts: string[] = [];
    if (isReordered) parts.push("reordered");
    if (rotatedCount > 0)
      parts.push(`${rotatedCount} rotated`);
    if (removed.length > 0)
      parts.push(`${removed.length} to remove`);
    return `${keptCount} page${keptCount === 1 ? "" : "s"} will remain · ${parts.join(
      " · ",
    )}: ready to rebuild`;
  }, [
    pageCount,
    hasChanges,
    isReordered,
    rotatedCount,
    removed.length,
    keptCount,
    file?.size,
  ]);

  return (
    <PdfWorkspace
      state={pdf}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="LayoutList"
      dropHint="Select a single PDF to reorder, rotate and delete its pages"
      processLabel="Rebuild PDF"
      resultHint="Reorder, rotation and deletions are composed into one rebuild, entirely in your browser."
    >
      {file ? (
        <div className="flex flex-col gap-5">
          {/* ── Header + reset control ───────────────────────────────────── */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="LayoutList" size={16} className={style.text} />
                <h3 className="text-sm font-medium text-foreground">
                  Organize the pages
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetEdits}
                disabled={!hasChanges}
                aria-label="Undo all changes and restore the original document"
              >
                <Icon name="Undo2" size={15} />
                Reset changes
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag a page to reorder it, use its{" "}
              <Icon
                name="RotateCw"
                size={12}
                className="inline align-[-1px]"
              />{" "}
              button to rotate 90°, and tap a page to mark it for removal. Focus a
              page and press{" "}
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] font-medium text-foreground">
                Alt + &larr; / &rarr;
              </kbd>{" "}
              to move it with the keyboard. Nothing is changed in your file until
              you rebuild.
            </p>
          </div>

          {/* ── Combined page grid: reorder + rotate + delete ────────────── */}
          <PdfPageGrid
            file={file.file}
            order={order.length > 0 ? order : undefined}
            onReorder={setOrder}
            rotations={rotations}
            onRotateChange={setRotations}
            selected={removed}
            onSelectChange={setRemoved}
            accent={tool.accent}
          />

          {/* ── Running summary ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Icon
                name={hasChanges ? "LayoutList" : "Info"}
                size={16}
                className={style.text}
              />
              {summary}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {isReordered ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    style.soft,
                  )}
                >
                  <Icon name="ArrowDownUp" size={13} />
                  Reordered
                </span>
              ) : null}
              {rotatedCount > 0 ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    style.soft,
                  )}
                >
                  <Icon name="RotateCw" size={13} />
                  {rotatedCount} rotated
                </span>
              ) : null}
              {removed.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                  <Icon name="Trash2" size={13} />
                  {removed.length} to remove
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
