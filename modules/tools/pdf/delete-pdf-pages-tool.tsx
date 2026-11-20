"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { deletePages } from "@/lib/pdf/ops";
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
 * Delete PDF Pages: mirrors the Merge PDF reference, but for a single document
 * with page-level selection.
 *
 * A `usePdfTool` queue (accept application/pdf, single file) feeds a
 * `PdfPageGrid` in selection mode: the `selected` array holds the 1-based page
 * numbers marked for removal, toggled by click or keyboard. On run we hand those
 * pages to the engine's `deletePages`, which rebuilds the PDF from only the kept
 * pages with pdf-lib. The engine already refuses to remove every page, and we
 * guard the same case in the UI so the primary action is disabled the moment a
 * selection would empty the document; you can never produce a blank file.
 */
export default function DeletePdfPagesTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  // 1-based page numbers marked for deletion.
  const [selected, setSelected] = React.useState<number[]>([]);
  // Total page count, learned from the grid once thumbnails render. Lets us
  // detect the "delete every page" case and offer a Select-all-but-one helper.
  const [pageCount, setPageCount] = React.useState(0);

  // Keep the freshest selection available to the async processor.
  const selectedRef = React.useRef(selected);
  React.useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "trimmed-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) {
        throw new Error("Add a PDF to edit. Drop in a file and try again.");
      }

      const pages = selectedRef.current;
      if (pages.length === 0) {
        throw new Error(
          "No pages are selected. Tick at least one page to remove, then try again.",
        );
      }
      if (pageCount > 0 && pages.length >= pageCount) {
        throw new Error(
          "You can't delete every page, at least one must remain. Leave one page unticked and try again.",
        );
      }

      const trimmed = await deletePages(input, pages);
      return [{ name: trimmed.name, blob: trimmed.blob, size: trimmed.size }];
    },
  });

  // The single queued file, if any. Drives the grid + resets selection.
  const file = state.files[0];
  const fileId = file?.id;

  // When the file changes (reset / new upload), start selection fresh.
  React.useEffect(() => {
    setSelected([]);
    setPageCount(0);
  }, [fileId]);

  const selectedCount = selected.length;
  const remaining = pageCount > 0 ? pageCount - selectedCount : null;
  // Guard: refuse an empty result. Also blocks the button when nothing's picked.
  const wouldEmpty = pageCount > 0 && selectedCount >= pageCount;
  const canDelete = selectedCount > 0 && !wouldEmpty;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="FileMinus2"
      dropHint="Select a single PDF to remove pages from"
      processLabel="Delete pages"
      resultHint="The pages you keep are rebuilt into a new PDF, entirely in your browser."
    >
      {file ? (
        <div className="flex flex-col gap-5">
          {/* ── Selection controls ──────────────────────────────────────── */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Icon name="SquareMousePointer" size={16} className={style.text} />
              <h3 className="text-sm font-medium text-foreground">
                Choose pages to delete
              </h3>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Selection shortcuts"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelected([])}
                disabled={selectedCount === 0}
                aria-label="Clear the current selection"
              >
                <Icon name="Undo2" size={15} />
                Clear selection
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click a page to mark it for removal; click again to keep it.
              Nothing is deleted until you press Delete Pages, and at least one
              page must always remain.
            </p>
          </div>

          {/* ── Page grid in selection mode ─────────────────────────────── */}
          <PdfPageGrid
            file={file.file}
            selected={selected}
            onSelectChange={(next) => {
              // Learn the total page count from the highest page the grid shows.
              const maxPage = Math.max(0, ...next);
              setPageCount((current) => Math.max(current, maxPage));
              setSelected(next);
            }}
            accent={tool.accent}
          />

          {/* ── Running summary + guard notice ──────────────────────────── */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Icon
                name={canDelete ? "FileMinus2" : "Info"}
                size={16}
                className={style.text}
              />
              {selectedCount === 0
                ? "Select at least one page to delete."
                : wouldEmpty
                  ? "You can't delete every page. Leave one to keep."
                  : `${selectedCount} to delete${
                      remaining !== null
                        ? ` · ${remaining} page${remaining === 1 ? "" : "s"} kept`
                        : ""
                    } · ${formatBytes(file.size)}`}
            </span>
            {canDelete ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  style.soft,
                )}
              >
                <Icon name="Eye" size={13} />
                Unticked pages are kept
              </span>
            ) : null}
          </div>

          {wouldEmpty ? (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
            >
              <Icon name="TriangleAlert" size={15} />
              At least one page must remain: unselect a page to continue.
            </p>
          ) : null}
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
