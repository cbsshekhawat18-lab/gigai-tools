"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { imagesToPdf, type ImagesToPdfOptions } from "@/lib/pdf/convert";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/** Suggested name for the generated document. */
const OUTPUT_NAME = "images-gigai.pdf";

/** Page-size choices surfaced in the UI, mapped to the engine's options. */
type PageSize = NonNullable<ImagesToPdfOptions["pageSize"]>;
type Orientation = NonNullable<ImagesToPdfOptions["orientation"]>;

const PAGE_SIZES: ReadonlyArray<{
  value: PageSize;
  label: string;
  hint: string;
}> = [
  { value: "A4", label: "A4", hint: "210 × 297 mm" },
  { value: "Letter", label: "Letter", hint: "8.5 × 11 in" },
  { value: "fit", label: "Fit to image", hint: "borderless, full-bleed" },
];

const ORIENTATIONS: ReadonlyArray<{ value: Orientation; label: string; icon: string }> = [
  { value: "portrait", label: "Portrait", icon: "RectangleVertical" },
  { value: "landscape", label: "Landscape", icon: "RectangleHorizontal" },
];

/**
 * JPG to PDF: mirrors the Merge PDF reference tool.
 *
 * It queues multiple images through `usePdfTool` (accept image/*, multiple),
 * lets the user arrange them with the reorderable, keyboard-accessible
 * `PdfFileList` (page order = list order), then embeds each image at native
 * resolution into a single PDF with `imagesToPdf`. Two tool-specific controls -
 * page size and orientation. Are rendered as accessible radio button groups
 * and passed straight through to the engine. Orientation is irrelevant when the
 * page fits the image, so it's disabled in that mode.
 */
export default function JpgToPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [pageSize, setPageSize] = React.useState<PageSize>("A4");
  const [orientation, setOrientation] = React.useState<Orientation>("portrait");

  // Keep the latest settings available to the (stable) process callback.
  const optionsRef = React.useRef({ pageSize, orientation });
  React.useEffect(() => {
    optionsRef.current = { pageSize, orientation };
  }, [pageSize, orientation]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "image/*",
    multiple: true,
    zipName: "images-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      if (files.length === 0) {
        throw new Error(
          "Add at least one image to convert. Drop in a JPG or PNG and try again.",
        );
      }
      const { pageSize: size, orientation: orient } = optionsRef.current;
      const pdf = await imagesToPdf(files, {
        pageSize: size,
        // Orientation only applies to fixed page sizes; ignored for "fit".
        orientation: size === "fit" ? undefined : orient,
        fileName: OUTPUT_NAME,
      });
      return [{ name: pdf.name, blob: pdf.blob, size: pdf.size }];
    },
  });

  const totalSize = state.files.reduce((sum, f) => sum + f.size, 0);
  const count = state.files.length;
  const fitMode = pageSize === "fit";

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="image/*"
      multiple
      dropIcon="FileImage"
      dropHint="Select JPG, PNG or WebP images: each becomes one page"
      processLabel="Convert to PDF"
      resultHint="Images are embedded at full resolution, entirely in your browser."
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        onReorder={state.reorder}
        accent={tool.accent}
        label="Images to convert"
      />

      {/* ── Layout controls: page size + orientation ─────────────────────── */}
      <fieldset className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <legend className="px-1 text-sm font-medium text-foreground">
          Page layout
        </legend>

        {/* Page size - a radio group of segmented buttons. */}
        <div
          role="radiogroup"
          aria-label="Page size"
          className="flex flex-col gap-2"
        >
          <span className="text-xs font-medium text-muted-foreground">
            Page size
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PAGE_SIZES.map((option) => {
              const active = pageSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPageSize(option.value)}
                  className={cn(
                    "flex min-h-11 flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                    active
                      ? cn(style.border, style.soft)
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {active ? (
                      <Icon name="Check" size={14} className={style.text} />
                    ) : null}
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orientation - disabled when the page fits the image. */}
        <div
          role="radiogroup"
          aria-label="Orientation"
          className="flex flex-col gap-2"
        >
          <span className="text-xs font-medium text-muted-foreground">
            Orientation
            {fitMode ? (
              <span className="ml-1 font-normal">
                (not needed: pages match each image)
              </span>
            ) : null}
          </span>
          <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
            {ORIENTATIONS.map((option) => {
              const active = !fitMode && orientation === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={fitMode}
                  onClick={() => setOrientation(option.value)}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                    active
                      ? cn(style.border, style.soft, "text-foreground")
                      : "border-border bg-card text-foreground hover:bg-muted/50",
                    fitMode && "cursor-not-allowed opacity-50 hover:bg-card",
                  )}
                >
                  <Icon name={option.icon} size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Running summary of the queue. */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Icon
            name={count > 0 ? "Images" : "Info"}
            size={16}
            className={style.text}
          />
          {count > 0
            ? `${count} image${count === 1 ? "" : "s"} · ${formatBytes(totalSize)}, ${count} page${count === 1 ? "" : "s"} in your PDF`
            : "Add at least one image to convert."}
        </span>
        {count > 1 ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              style.soft,
            )}
          >
            <Icon name="ArrowDownUp" size={13} />
            Drag to reorder pages
          </span>
        ) : null}
      </div>
    </PdfWorkspace>
  );
}
