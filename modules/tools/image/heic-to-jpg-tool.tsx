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

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/**
 * HEIC to JPG, decodes an iPhone HEIC/HEIF photo (via the engine's lazy libheif
 * pre-decode) and re-encodes it to JPG or PNG. Controls: an output-format toggle
 * and a quality slider (JPG only). White background fills any non-photo edges
 * since HEIC photos are opaque. The result panel reports the output size.
 */
export default function HeicToJpgTool({ tool }: ImageToolProps) {
  const [format, setFormat] = React.useState<"image/jpeg" | "image/png">("image/jpeg");
  const [quality, setQuality] = React.useState(92);
  const style = accentStyle(tool.accent);
  const isJpg = format === "image/jpeg";

  const state = useImageTool({
    slug: tool.slug,
    // Browsers report HEIC as image/heic, image/heif, or sometimes an empty type
    // - accept broadly plus the extensions so the picker always allows them.
    accept: "image/heic,image/heif,.heic,.heif,image/*",
    process: (img: LoadedImage): Promise<ProcessResult> =>
      convertFormat(img, {
        format,
        quality: quality / 100,
        background: "#ffffff",
      }),
    outputName: (img) => `${baseName(img.file.name)}-gigai.${isJpg ? "jpg" : "png"}`,
  });

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel={`Convert to ${isJpg ? "JPG" : "PNG"}`}
      formatsHint="HEIC / HEIF in, JPG or PNG out"
      controls={
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="Image" size={15} className={style.text} />
              Output format
            </legend>
            <div role="radiogroup" aria-label="Output format" className="grid grid-cols-2 gap-2">
              {[
                { value: "image/jpeg" as const, label: "JPG", hint: "Smallest, universal" },
                { value: "image/png" as const, label: "PNG", hint: "Lossless" },
              ].map((opt) => {
                const active = format === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFormat(opt.value)}
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 rounded-xl border p-3 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn(style.soft, style.border, "border-2")
                        : "border-2 border-border hover:border-foreground/30 hover:bg-muted/40",
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          active ? style.text : "text-foreground",
                        )}
                      >
                        {opt.label}
                      </span>
                      {active ? <Icon name="Check" size={15} className={style.text} /> : null}
                    </span>
                    <span className="text-[11px] leading-none text-muted-foreground">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {isJpg ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">
                  <Icon name="Gauge" size={15} className={style.text} />
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
                id="quality"
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
          ) : null}
        </>
      }
      resultMeta={(result, image) => {
        const original = image.file.size;
        return (
          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">HEIC</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(original)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{isJpg ? "JPG" : "PNG"}</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(result.size)}
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
