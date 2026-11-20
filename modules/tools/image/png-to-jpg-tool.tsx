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

/** Preset fills offered for the transparent areas a JPG can't keep. */
const SWATCHES: { value: string; label: string }[] = [
  { value: "#ffffff", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "#f3f4f6", label: "Light grey" },
  { value: "#1f2937", label: "Dark grey" },
];

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** Normalise loose hex input (#fff, fff, #FFFFFF) to a valid 6-digit hex. */
function normaliseHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return (
      "#" +
      raw
        .split("")
        .map((c) => c + c)
        .join("")
    ).toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

/**
 * PNG to JPG, flattens a transparent PNG onto a chosen background color and
 * re-encodes it as JPEG via the shared `convertFormat` engine. Controls: a
 * background fill picker (presets + custom hex + native color input) and a
 * 10–100 quality slider. The result panel reports the original vs JPG size and
 * the exact percentage saved.
 */
export default function PngToJpgTool({ tool }: ImageToolProps) {
  const [background, setBackground] = React.useState("#ffffff");
  const [hexDraft, setHexDraft] = React.useState("#ffffff");
  const [quality, setQuality] = React.useState(90);
  const style = accentStyle(tool.accent);

  /** Apply a color from any source, keeping the text field in sync. */
  const applyColor = React.useCallback((value: string) => {
    setBackground(value);
    setHexDraft(value);
  }, []);

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/png,image/*",
    process: (img: LoadedImage): Promise<ProcessResult> =>
      convertFormat(img, {
        format: "image/jpeg",
        quality: quality / 100,
        background,
      }),
    outputName: (img) => `${baseName(img.file.name)}-gigai.jpg`,
  });

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel="Convert to JPG"
      formatsHint="PNG in: JPG out, with your chosen background fill"
      controls={
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="PaintBucket" size={15} className={style.text} />
              Background fill
            </legend>
            <p className="text-xs text-muted-foreground">
              JPG has no transparency: pick the color that replaces see-through
              areas.
            </p>

            <div
              role="radiogroup"
              aria-label="Background fill color"
              className="grid grid-cols-4 gap-2"
            >
              {SWATCHES.map((s) => {
                const active =
                  background.toLowerCase() === s.value.toLowerCase();
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={s.label}
                    title={s.label}
                    onClick={() => applyColor(s.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn("bg-muted/60", style.border)
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span
                      className="size-7 rounded-md border border-border/60 shadow-inner"
                      style={{ backgroundColor: s.value }}
                    />
                    <span
                      className={cn(
                        "text-[11px] leading-none",
                        active
                          ? cn("font-semibold", style.text)
                          : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="bg-color"
                className="relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: background }}
                title="Pick a custom color"
              >
                <span className="sr-only">Pick a custom color</span>
                <input
                  id="bg-color"
                  type="color"
                  value={background}
                  onChange={(event) => applyColor(event.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  aria-label="Custom background color picker"
                />
              </label>
              <div className="relative flex-1">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-hidden
                >
                  #
                </span>
                <input
                  type="text"
                  inputMode="text"
                  spellCheck={false}
                  value={hexDraft.replace(/^#/, "")}
                  onChange={(event) => {
                    const next = `#${event.target.value.replace(/^#/, "")}`;
                    setHexDraft(next);
                    const valid = normaliseHex(next);
                    if (valid) setBackground(valid);
                  }}
                  onBlur={() => setHexDraft(background)}
                  aria-label="Background color hex code"
                  placeholder="ffffff"
                  className={cn(
                    "h-9 w-full rounded-lg border border-border bg-background pl-6 pr-3 font-mono text-sm uppercase tabular-nums outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                  )}
                />
              </div>
            </div>
          </fieldset>

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
                "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow",
                "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-rose-500",
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Best quality</span>
            </div>
          </div>
        </>
      }
      resultMeta={(result, image) => {
        const original = image.file.size;
        const saved = original - result.size;
        const pct = original > 0 ? Math.round((saved / original) * 100) : 0;
        const smaller = saved > 0;

        return (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">PNG</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(original)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">JPG</dt>
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
                <Icon name={smaller ? "TrendingDown" : "Minus"} size={14} />
                {smaller ? `${pct}%` : "no gain"}
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
