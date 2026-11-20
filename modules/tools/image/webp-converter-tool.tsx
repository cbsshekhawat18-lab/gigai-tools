"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  convertFormat,
  formatBytes,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { Label } from "@/components/ui/label";
import { useImageTool } from "@/hooks/use-image-tool";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import type { ImageToolProps } from "@/components/tool/types";

/** Which way the conversion runs. */
type Direction = "to" | "from";

/** MIME targets the engine's convertFormat accepts. */
type ConvertFormat = "image/png" | "image/jpeg" | "image/webp";

/** Targets available when decoding a WebP back to a common format. */
const FROM_TARGETS: { value: ConvertFormat; label: string; ext: string; hint: string }[] = [
  {
    value: "image/png",
    label: "PNG",
    ext: "png",
    hint: "Lossless. Keeps transparency",
  },
  {
    value: "image/jpeg",
    label: "JPG",
    ext: "jpg",
    hint: "Smaller, flattens transparency",
  },
];

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/**
 * WebP Converter: a two-way format tool. A direction toggle switches between
 * encoding a PNG/JPG to WebP (with a quality dial) and decoding a WebP back to
 * PNG or JPG. The single engine call is `convertFormat`; the target MIME and
 * whether a quality value applies are derived from the current direction.
 */
export default function WebpConverterTool({ tool }: ImageToolProps) {
  const [direction, setDirection] = React.useState<Direction>("to");
  const [quality, setQuality] = React.useState(80);
  const [fromTarget, setFromTarget] = React.useState<ConvertFormat>("image/png");
  const style = accentStyle(tool.accent);

  // Resolve the encode target + whether the quality dial is meaningful.
  const target: ConvertFormat = direction === "to" ? "image/webp" : fromTarget;
  const lossy = target === "image/webp" || target === "image/jpeg";
  const ext =
    target === "image/webp" ? "webp" : target === "image/png" ? "png" : "jpg";

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/*",
    process: (img: LoadedImage): Promise<ProcessResult> =>
      convertFormat(img, {
        format: target,
        quality: lossy ? quality / 100 : undefined,
      }),
    outputName: (img) => `${baseName(img.file.name)}-gigai.${ext}`,
  });

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel={direction === "to" ? "Convert to WebP" : `Convert to ${ext.toUpperCase()}`}
      formatsHint="PNG, JPG or WebP in, WebP, PNG or JPG out"
      controls={
        <>
          {/* Direction toggle - the core choice of this tool. */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="ArrowLeftRight" size={15} className={style.text} />
              Direction
            </legend>
            <div
              role="radiogroup"
              aria-label="Conversion direction"
              className="grid grid-cols-2 gap-2"
            >
              {(
                [
                  {
                    value: "to" as Direction,
                    label: "To WebP",
                    hint: "Encode a PNG or JPG",
                  },
                  {
                    value: "from" as Direction,
                    label: "From WebP",
                    hint: "Decode to PNG or JPG",
                  },
                ]
              ).map((d) => {
                const active = direction === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDirection(d.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn("bg-muted/60", style.border, style.text)
                        : "border-border text-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-sm font-semibold">{d.label}</span>
                    <span className="text-xs text-muted-foreground">{d.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* From-WebP: pick the decode target. */}
          {direction === "from" && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="FileType2" size={15} className={style.text} />
                Convert to
              </legend>
              <div
                role="radiogroup"
                aria-label="Target format"
                className="grid grid-cols-2 gap-2"
              >
                {FROM_TARGETS.map((f) => {
                  const active = fromTarget === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFromTarget(f.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors outline-none",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                        active
                          ? cn("bg-muted/60", style.border, style.text)
                          : "border-border text-foreground hover:bg-muted/40",
                      )}
                    >
                      <span className="text-sm font-semibold">{f.label}</span>
                      <span className="text-xs text-muted-foreground">{f.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Quality dial - only when the output is lossy. */}
          {lossy ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="webp-quality">
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  Quality
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
                id="webp-quality"
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                aria-label={
                  direction === "to" ? "WebP quality" : "JPG quality"
                }
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:bg-blue-500",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-blue-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Best quality</span>
              </div>
            </div>
          ) : (
            <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              <Icon
                name="Info"
                size={14}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              PNG is lossless; every pixel from the WebP is preserved exactly,
              including transparency. No quality setting needed.
            </p>
          )}
        </>
      }
      resultMeta={(result, image) => {
        const original = image.file.size;
        const diff = original - result.size;
        const pct = original > 0 ? Math.round((diff / original) * 100) : 0;
        const smaller = diff > 0;
        const outLabel =
          result.format === "image/webp"
            ? "WebP"
            : result.format === "image/png"
              ? "PNG"
              : "JPG";

        return (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Original</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(original)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{outLabel}</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(result.size)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">
                {smaller ? "Saved" : "Change"}
              </dt>
              <dd
                className={cn(
                  "inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums",
                  smaller ? style.text : "text-muted-foreground",
                )}
              >
                <Icon name={smaller ? "TrendingDown" : "TrendingUp"} size={14} />
                {smaller ? `${pct}%` : `+${Math.abs(pct)}%`}
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
