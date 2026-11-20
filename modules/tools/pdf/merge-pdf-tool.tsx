"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { mergePdfs } from "@/lib/pdf/ops";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/** Suggested name for the combined document. */
const OUTPUT_NAME = "merged-gigai.pdf";

/**
 * Merge PDF, the reference PDF tool and the pattern the other PDF tools copy.
 *
 * It queues multiple PDFs through `usePdfTool` (accept application/pdf,
 * multiple), lets the user arrange them with a fully reorderable, keyboard- and
 * pointer-accessible `PdfFileList`, then combines them in browser order with
 * pdf-lib's `mergePdfs`. Order matters here, so the list is reorderable and the
 * "ready"-state hint makes the top-to-bottom sequence explicit.
 */
export default function MergePdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: true,
    zipName: "merged-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      if (files.length < 2) {
        throw new Error(
          "Add at least two PDFs to merge. Drop in another file and try again.",
        );
      }
      // A PdfInput queue is a superset of the engine's PdfInput, so it passes
      // straight through. We only rebrand the output filename.
      const merged = await mergePdfs(files);
      return [{ name: OUTPUT_NAME, blob: merged.blob, size: merged.size }];
    },
  });

  const totalSize = state.files.reduce((sum, f) => sum + f.size, 0);
  const canMerge = state.files.length >= 2;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple
      dropIcon="Combine"
      dropHint="Select two or more PDF files to combine into one"
      processLabel="Merge PDFs"
      resultHint="Files are joined top-to-bottom, entirely in your browser."
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        onReorder={state.reorder}
        accent={tool.accent}
        label="Files to merge"
        // Page counts carried over from the Document Merger when the two pages
        // were consolidated into this one: knowing a file is 40 pages, not 2,
        // is what tells you whether the running order is right before merging.
        showPageCounts
      />

      {/* A running summary + a gentle nudge when only one file is queued. */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Icon
            name={canMerge ? "Files" : "Info"}
            size={16}
            className={style.text}
          />
          {canMerge
            ? `${state.files.length} files · ${formatBytes(totalSize)}, ready to merge`
            : "Add at least one more PDF to merge."}
        </span>
        {canMerge ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              style.soft,
            )}
          >
            <Icon name="ArrowDownUp" size={13} />
            Drag to reorder
          </span>
        ) : null}
      </div>
    </PdfWorkspace>
  );
}
