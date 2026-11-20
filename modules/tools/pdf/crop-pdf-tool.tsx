"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { cropPdf, NO_CROP, type CropMargins } from "@/lib/pdf/edit";
import { warmPdfRaster } from "@/lib/engine-preload";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";

const EDGES = [
  { key: "top", label: "Top", icon: "ArrowUp" },
  { key: "right", label: "Right", icon: "ArrowRight" },
  { key: "bottom", label: "Bottom", icon: "ArrowDown" },
  { key: "left", label: "Left", icon: "ArrowLeft" },
] as const;

/**
 * Crop PDF. Trim margins by setting the CropBox.
 *
 * Margins are percentages of each page's own size, so one setting behaves
 * sensibly across a mixed-size document. A live preview of the first page shows
 * the kept area, because "8% off the left" means nothing until you see it.
 */
export default function CropPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);
  const [margins, setMargins] = React.useState<CropMargins>(NO_CROP);
  const marginsRef = React.useRef(margins);
  React.useEffect(() => {
    marginsRef.current = margins;
  }, [margins]);

  const state = usePdfTool({
    slug: tool.slug,
    warm: warmPdfRaster,
    accept: "application/pdf",
    multiple: false,
    zipName: "cropped-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) throw new Error("Add a PDF to crop.");
      const m = marginsRef.current;
      if (m.top + m.right + m.bottom + m.left === 0) {
        throw new Error("Set at least one margin above 0%, otherwise there's nothing to trim.");
      }
      return [await cropPdf(input, m)];
    },
  });

  const source = state.files[0];
  const total = margins.top + margins.right + margins.bottom + margins.left;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="Crop"
      dropHint="Select one PDF to trim its margins"
      processLabel={total > 0 ? "Crop PDF" : "Set a margin to crop"}
      resultHint="Cropped in your browser: the file is never uploaded."
    >
      {source ? (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-foreground">
              How much to trim from each edge
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {EDGES.map((edge) => {
                const value = margins[edge.key];
                return (
                  <div key={edge.key} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`crop-${edge.key}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <Icon name={edge.icon} size={14} className={style.text} />
                        {edge.label}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {Math.round(value * 100)}%
                      </span>
                    </label>
                    <input
                      id={`crop-${edge.key}`}
                      type="range"
                      min={0}
                      max={45}
                      step={1}
                      value={Math.round(value * 100)}
                      onChange={(e) =>
                        setMargins((m) => ({ ...m, [edge.key]: Number(e.target.value) / 100 }))
                      }
                      className={cn("w-full accent-current", style.text)}
                    />
                  </div>
                );
              })}
            </div>
            {total > 0 ? (
              <button
                type="button"
                onClick={() => setMargins(NO_CROP)}
                className="self-start text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Reset all margins
              </button>
            ) : null}
          </fieldset>

          <CropPreview file={source.file} margins={margins} accent={tool.accent} />

          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-muted-foreground">
              <strong className="font-medium text-foreground">Cropping hides, it doesn&apos;t delete.</strong>{" "}
              The trimmed content is still inside the file and can be brought
              back by resetting the page box. To genuinely remove sensitive
              text, use{" "}
              <Link href="/redact-pdf" className={cn("underline underline-offset-4", style.text)}>
                Redact PDF
              </Link>{" "}
              instead.
            </span>
          </div>
        </>
      ) : null}
    </PdfWorkspace>
  );
}

/**
 * First-page preview with the kept area highlighted. Rendered once per file;
 * the overlay is pure CSS so dragging a slider doesn't re-render the page.
 */
function CropPreview({
  file,
  margins,
  accent,
}: {
  file: File;
  margins: CropMargins;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    void (async () => {
      const { openPdfDocument, pageToCanvas, canvasToBlob } = await import("@/lib/pdf/core");
      const doc = await openPdfDocument(file);
      try {
        const page = await doc.getPage(1);
        const canvas = await pageToCanvas(page, 1.2);
        const blob = await canvasToBlob(canvas);
        page.cleanup();
        if (cancelled || !blob) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      } finally {
        await doc.destroy();
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Preview: page 1</span>
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted/30">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="First page of the PDF with the crop area highlighted" className="block w-full" />
        ) : (
          <div className="aspect-[1/1.414] w-full animate-pulse bg-muted" />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-foreground/45"
          style={{
            clipPath: `polygon(
              0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
              ${margins.left * 100}% ${margins.top * 100}%,
              ${margins.left * 100}% ${(1 - margins.bottom) * 100}%,
              ${(1 - margins.right) * 100}% ${(1 - margins.bottom) * 100}%,
              ${(1 - margins.right) * 100}% ${margins.top * 100}%,
              ${margins.left * 100}% ${margins.top * 100}%
            )`,
          }}
        />
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute border-2 border-dashed", style.border)}
          style={{
            left: `${margins.left * 100}%`,
            top: `${margins.top * 100}%`,
            right: `${margins.right * 100}%`,
            bottom: `${margins.bottom * 100}%`,
          }}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        The shaded area is trimmed away. Every page gets the same margins.
      </p>
    </div>
  );
}
