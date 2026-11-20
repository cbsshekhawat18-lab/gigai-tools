"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { extractPages } from "@/lib/pdf/ops";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";

/**
 * Summarise a sorted list of 1-based page numbers as compact runs, e.g.
 * [1,2,3,7,9,10] → "1–3, 7, 9–10". Used to show, at a glance, exactly which
 * pages will land in the extracted file.
 */
function summarizePages(pages: number[]): string {
  if (pages.length === 0) return "";
  const sorted = [...pages].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0]!;
  let prev = start;

  for (let i = 1; i <= sorted.length; i += 1) {
    const current = sorted[i];
    if (current !== undefined && current === prev + 1) {
      prev = current;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}–${prev}`);
    if (current !== undefined) {
      start = current;
      prev = current;
    }
  }
  return parts.join(", ");
}

/**
 * Extract PDF Pages, cherry-pick individual pages from one PDF and copy just
 * those into a brand-new document, entirely in the browser with pdf-lib.
 *
 * A single file is queued through `usePdfTool` (accept application/pdf, single).
 * Its pages render in a selectable `PdfPageGrid`; the locally-held `selected`
 * state (a list of 1-based page numbers) drives both the live count/summary and
 * the engine call. On process, `extractPages` copies exactly those pages, in
 * their original document order, into one new PDF surfaced by `PdfWorkspace`.
 */
export default function ExtractPdfPagesTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [selected, setSelected] = React.useState<number[]>([]);

  // Keep the freshest selection for the (stable) process callback.
  const selectedRef = React.useRef(selected);
  React.useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "extracted-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Upload a PDF to extract from. Drop a file in and try again.");
      }
      const pages = selectedRef.current;
      if (pages.length === 0) {
        throw new Error(
          "Select at least one page to extract. Click the pages you want on the grid, then try again.",
        );
      }
      const extracted = await extractPages(source, pages);
      return [{ name: extracted.name, blob: extracted.blob, size: extracted.size }];
    },
  });

  const source = state.files[0];

  // A new upload starts from a clean selection.
  React.useEffect(() => {
    setSelected([]);
  }, [source?.id]);

  const count = selected.length;
  const canExtract = count > 0;
  const summary = React.useMemo(() => summarizePages(selected), [selected]);

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="FileOutput"
      dropHint="Select one PDF, then pick the pages you want to keep"
      processLabel={
        canExtract
          ? `Extract ${count} page${count === 1 ? "" : "s"}`
          : "Extract pages"
      }
      resultHint="Chosen pages become one new PDF, built entirely in your browser."
    >
      {source ? (
        <>
          {/* Source summary + live selection state. */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Icon name="FileText" size={16} className={style.text} />
                <span className="max-w-[16rem] truncate font-medium text-foreground">
                  {source.name}
                </span>
                <span className="tabular-nums">· {formatBytes(source.size)}</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  canExtract ? style.soft : "bg-muted text-muted-foreground",
                )}
              >
                <Icon name={canExtract ? "ListChecks" : "MousePointerClick"} size={13} />
                {canExtract
                  ? `${count} page${count === 1 ? "" : "s"} selected`
                  : "Click pages to select"}
              </span>
            </div>

            {/* Selected-pages readout, plus a quick clear-selection control. */}
            <div
              className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
              aria-live="polite"
            >
              <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
                <Icon
                  name={canExtract ? "FileOutput" : "Info"}
                  size={16}
                  className={style.text}
                />
                {canExtract ? (
                  <span className="min-w-0">
                    Extracting page{count === 1 ? "" : "s"}{" "}
                    <span className="font-medium text-foreground">{summary}</span>{" "}
                    into a new PDF, pages stay in their original order.
                  </span>
                ) : (
                  "Click any pages below to add them to your new PDF."
                )}
              </span>
              {canExtract ? (
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-medium outline-none transition-colors sm:self-auto",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon name="X" size={13} />
                  Clear selection
                </button>
              ) : null}
            </div>
          </div>

          {/* Multi-select page grid. */}
          <PdfPageGrid
            file={source.file}
            selected={selected}
            onSelectChange={setSelected}
            accent={tool.accent}
          />
        </>
      ) : null}
    </PdfWorkspace>
  );
}
