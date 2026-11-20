"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  compressImage,
  compressToTargetSize,
  formatBytes,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { Label } from "@/components/ui/label";
import { useImageTool } from "@/hooks/use-image-tool";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import type { ImageToolProps } from "@/components/tool/types";

type OutputFormat = "image/jpeg" | "image/webp";
type Mode = "quality" | "target";

const FORMATS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

/** Quick target presets in kilobytes. */
const TARGET_PRESETS = [50, 100, 200, 500, 1024];

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function presetLabel(kb: number): string {
  return kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;
}

/**
 * Image Compressor; two modes. "Quality" is a manual 10–100 slider; "Target
 * size" binary-searches the quality that lands just under a KB budget (e.g. 100
 * KB for an upload) via `compressToTargetSize`. A JPEG/WebP toggle picks the
 * output. The result panel reports original vs compressed size and, in target
 * mode, whether the goal was met.
 */
export default function ImageCompressorTool({ tool }: ImageToolProps) {
  const [mode, setMode] = React.useState<Mode>("quality");
  const [quality, setQuality] = React.useState(75);
  const [targetKb, setTargetKb] = React.useState(100);
  const [format, setFormat] = React.useState<OutputFormat>("image/jpeg");
  const style = accentStyle(tool.accent);

  const ext = FORMATS.find((f) => f.value === format)?.ext ?? "jpg";

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/*",
    process: (img: LoadedImage): Promise<ProcessResult> =>
      mode === "target"
        ? compressToTargetSize(img, {
            targetBytes: Math.max(1, targetKb) * 1024,
            format,
          })
        : compressImage(img, { quality: quality / 100, format }),
    outputName: (img) => `${baseName(img.file.name)}-compressed-gigai.${ext}`,
  });

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel={mode === "target" ? `Compress to ${presetLabel(targetKb)}` : "Compress image"}
      formatsHint="JPG, PNG, WebP, GIF or BMP, output as JPEG or WebP"
      controls={
        <>
          {/* Mode toggle */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="Settings2" size={15} className={style.text} />
              Compression mode
            </legend>
            <div role="radiogroup" aria-label="Compression mode" className="grid grid-cols-2 gap-2">
              {([
                { value: "quality", label: "Quality", hint: "Set it yourself" },
                { value: "target", label: "Target size", hint: "Hit a KB goal" },
              ] as const).map((m) => {
                const active = mode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2.5 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn(style.soft, style.border)
                        : "border-border hover:border-foreground/30 hover:bg-muted/40",
                    )}
                  >
                    <span className={cn("text-sm font-semibold", active ? style.text : "text-foreground")}>
                      {m.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {mode === "quality" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  Quality
                </Label>
                <span className={cn("rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums", style.soft)}>
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
                aria-label="Compression quality"
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
                  format === "image/webp"
                    ? "[&::-webkit-slider-thumb]:bg-cyan-500 [&::-moz-range-thumb]:bg-cyan-500"
                    : "[&::-webkit-slider-thumb]:bg-sky-500 [&::-moz-range-thumb]:bg-sky-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Best quality</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Label htmlFor="target-kb">
                <Icon name="Target" size={15} className={style.text} />
                Target size
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {TARGET_PRESETS.map((kb) => {
                  const active = targetKb === kb;
                  return (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => setTargetKb(kb)}
                      aria-pressed={active}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors outline-none",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                        active
                          ? cn(style.soft, style.border, style.text)
                          : "border-border text-foreground hover:bg-muted/40",
                      )}
                    >
                      {presetLabel(kb)}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <input
                  id="target-kb"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={targetKb}
                  onChange={(event) => setTargetKb(Math.max(1, Number(event.target.value) || 0))}
                  aria-label="Target size in kilobytes"
                  className={cn(
                    "h-10 w-full rounded-lg border border-border bg-background pl-3 pr-12 text-sm tabular-nums outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                  )}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  KB
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                We&rsquo;ll find the highest quality that fits your target. Very small targets on a
                large image may land a little above. The result shows the actual size.
              </p>
            </div>
          )}

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="FileType2" size={15} className={style.text} />
              Output format
            </legend>
            <div role="radiogroup" aria-label="Output format" className="grid grid-cols-2 gap-2">
              {FORMATS.map((f) => {
                const active = format === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2.5 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn("bg-muted/60", style.border, style.text)
                        : "border-border text-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-sm font-semibold">{f.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {f.value === "image/webp" ? "Smallest, modern web" : "Universal: works everywhere"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </>
      }
      resultMeta={(result, image) => {
        const original = image.file.size;
        const saved = original - result.size;
        const pct = original > 0 ? Math.round((saved / original) * 100) : 0;
        const smaller = saved > 0;
        const targetBytes = targetKb * 1024;
        const hitTarget = mode === "target" && result.size <= targetBytes;

        return (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground">Original</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">{formatBytes(original)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground">Compressed</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">{formatBytes(result.size)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground">{smaller ? "Saved" : "Change"}</dt>
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
            {mode === "target" ? (
              <p
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                  hitTarget ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600",
                )}
              >
                <Icon name={hitTarget ? "Check" : "Info"} size={14} />
                {hitTarget
                  ? `Under your ${presetLabel(targetKb)} target`
                  : `Closest we could reach: try WebP or a smaller image for under ${presetLabel(targetKb)}`}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
