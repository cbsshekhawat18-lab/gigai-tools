"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { pdfToImages } from "@/lib/pdf/convert";
import { warmPdfRaster } from "@/lib/engine-preload";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";
import { Label } from "@/components/ui/label";

/** The two output image formats this tool can render pages to. */
type OutputFormat = "image/jpeg" | "image/png";

/**
 * PDF to JPG: mirrors the Merge reference, but for a SINGLE PDF that is
 * rasterised to one image per page.
 *
 * A `usePdfTool` queue (accept application/pdf, single file) feeds
 * `pdfToImages`, which renders each page via pdf.js and encodes it as JPG (with
 * a quality dial) or lossless PNG. Because order and multiplicity don't matter
 * here, the "ready" state shows a live `PdfPageGrid` preview of the source pages
 * plus format/quality controls, and the results panel exposes every page as an
 * individually downloadable image or one ZIP.
 */
export default function PdfToJpgTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [format, setFormat] = React.useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = React.useState(90);

  // Keep the freshest settings available to the process callback.
  const formatRef = React.useRef(format);
  const qualityRef = React.useRef(quality);
  React.useEffect(() => {
    formatRef.current = format;
  }, [format]);
  React.useEffect(() => {
    qualityRef.current = quality;
  }, [quality]);

  const state = usePdfTool({
    slug: tool.slug,
    warm: warmPdfRaster,
    accept: "application/pdf",
    multiple: false,
    zipName: "pdf-images-gigai",
    process: async (
      files: PdfInput[],
      onProgress,
    ): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Add a PDF to convert its pages to images.");
      }
      const images = await pdfToImages(source, {
        format: formatRef.current,
        quality: qualityRef.current / 100,
        onProgress: (value, label) => onProgress({ value, label }),
      });
      if (images.length === 0) {
        throw new Error(
          "No pages could be rendered from this PDF. It may be empty or protected.",
        );
      }
      return images;
    },
  });

  const source = state.files[0];
  const isJpg = format === "image/jpeg";

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="Image"
      dropHint="Select one PDF to render each page as a JPG or PNG image"
      processLabel={isJpg ? "Convert to JPG" : "Convert to PNG"}
      resultHint="Each page is rendered to an image in your browser: nothing is uploaded."
    >
      {source ? (
        <div className="flex flex-col gap-6">
          {/* Source summary. */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <Icon name="FileText" size={18} className={cn("shrink-0", style.text)} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-foreground">
                {source.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatBytes(source.size)}
              </span>
            </span>
          </div>

          {/* Format picker - a two-option, keyboard-accessible radio group. */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
              <Icon name="Palette" size={15} className={style.text} />
              Output format
            </legend>
            <div
              role="radiogroup"
              aria-label="Output image format"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {(
                [
                  {
                    value: "image/jpeg" as const,
                    title: "JPG",
                    hint: "Small files, great for sharing",
                    icon: "Image",
                  },
                  {
                    value: "image/png" as const,
                    title: "PNG",
                    hint: "Lossless, pixel-perfect pages",
                    icon: "ImageOff",
                  },
                ] satisfies {
                  value: OutputFormat;
                  title: string;
                  hint: string;
                  icon: string;
                }[]
              ).map((option) => {
                const selected = format === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFormat(option.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      selected
                        ? cn("ring-2", style.border, style.ring)
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        style.soft,
                      )}
                    >
                      <Icon name={option.icon} size={18} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {option.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selected
                          ? cn(style.solid, "border-transparent text-white")
                          : "border-border text-transparent",
                      )}
                    >
                      <Icon name="Check" size={12} />
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* JPG quality - only meaningful for the lossy format. */}
          {isJpg ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="pdf-jpg-quality">
                  <Icon name="Gauge" size={15} className={style.text} />
                  JPG quality
                </Label>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {quality}
                </span>
              </div>
              <input
                id="pdf-jpg-quality"
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                aria-label="JPG quality"
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-cyan-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Best quality</span>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <Icon name="Info" size={14} className={style.text} />
              PNG is lossless; every page is captured pixel-for-pixel, so there&apos;s
              no quality dial.
            </p>
          )}

          {/* Live preview of the source pages that will be converted. */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">
              Pages to convert
            </h3>
            <PdfPageGrid file={source.file} accent={tool.accent} />
          </div>
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
