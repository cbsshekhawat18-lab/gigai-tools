"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  upscaleImage,
  formatBytes,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { Label } from "@/components/ui/label";
import { useImageTool } from "@/hooks/use-image-tool";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import type { ImageToolProps } from "@/components/tool/types";

type Factor = 2 | 4;

const FACTORS: { value: Factor; label: string; hint: string }[] = [
  { value: 2, label: "2x", hint: "Double, fastest, most faithful" },
  { value: 4, label: "4x", hint: "Quadruple, biggest reach" },
];

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** Map a source MIME type to a sensible download extension. */
function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  return "png";
}

/**
 * AI Image Upscaler: enlarges the source 2× or 4× via the engine's ESRGAN
 * super-resolution model (UpscalerJS + TensorFlow.js), with a canvas-resampling
 * fallback. A factor toggle previews the exact output resolution before
 * processing; the result panel reports the megapixel jump and new size.
 */
export default function ImageUpscalerTool({ tool }: ImageToolProps) {
  const [factor, setFactor] = React.useState<Factor>(2);
  const style = accentStyle(tool.accent);

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/*",
    process: (img: LoadedImage): Promise<ProcessResult> =>
      upscaleImage(img, { factor }),
    outputName: (img) =>
      `${baseName(img.file.name)}-${factor}x-gigai.${extFor(img.file.type)}`,
  });

  const source = state.image;

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel={`Upscale ${factor}x`}
      formatsHint="JPG, PNG, WebP, GIF or BMP, AI upscale 2x or 4x"
      controls={
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="Maximize2" size={15} className={style.text} />
              Enlargement factor
            </legend>
            <div
              role="radiogroup"
              aria-label="Enlargement factor"
              className="grid grid-cols-2 gap-2"
            >
              {FACTORS.map((f) => {
                const active = factor === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFactor(f.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn("bg-muted/60", style.border, style.text)
                        : "border-border text-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-lg font-bold leading-none tabular-nums">
                      {f.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {f.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {source ? (
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Icon name="Ruler" size={15} className={style.text} />
                <Label className="text-sm">New dimensions</Label>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm tabular-nums text-foreground">
                <span className="text-muted-foreground">
                  {source.width} × {source.height}
                </span>
                <Icon
                  name="ArrowRight"
                  size={14}
                  className="text-muted-foreground"
                />
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 font-semibold",
                    style.soft,
                  )}
                >
                  {source.width * factor} × {source.height * factor}
                </span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Real ESRGAN super-resolution: rebuilds edges and texture, runs
                privately in your browser. The first run downloads the model, and
                larger images or 4x take a little longer.
              </p>
            </div>
          ) : null}
        </>
      }
      resultMeta={(result, image) => {
        const fromPx = image.width * image.height;
        const toPx = result.width * result.height;
        const fromMp = fromPx / 1_000_000;
        const toMp = toPx / 1_000_000;

        return (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Original</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {image.width} × {image.height}
              </dd>
              <dd className="text-xs tabular-nums text-muted-foreground">
                {fromMp < 0.1 ? fromMp.toFixed(2) : fromMp.toFixed(1)} MP
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Upscaled</dt>
              <dd
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  style.text,
                )}
              >
                {result.width} × {result.height}
              </dd>
              <dd className="text-xs tabular-nums text-muted-foreground">
                {toMp < 0.1 ? toMp.toFixed(2) : toMp.toFixed(1)} MP
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">New file</dt>
              <dd className="inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums text-foreground">
                <Icon name="TrendingUp" size={14} className={style.text} />
                {formatBytes(result.size)}
              </dd>
              <dd className="text-xs tabular-nums text-muted-foreground">
                {factor}× larger
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
