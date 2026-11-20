"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { compress, convertFormat, toGif } from "@/lib/video-tools/operations";

/**
 * Video Converter: the format-changer of the toolkit. The user picks a target
 * container and the run transcodes the clip on-device via FFmpeg (WebAssembly):
 *
 *   • MP4  → routes through `operations.compress`, which re-encodes H.264/AAC and
 *            exposes a REAL quality dial (CRF) plus faststart. This is why MP4 is
 *  the only target with a quality control. It genuinely re-encodes.
 *   • GIF  → routes through `operations.toGif` (palette-optimized), honest about
 *            GIF ballooning on anything but short clips.
 *   • else → `operations.convertFormat` picks each container's sensible codec
 *            defaults (VP9/Opus for WebM, H.264/AAC for MOV/MKV, etc.).
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset. This component is just the
 * options form + `onRun`. Honest by design: WASM ffmpeg is slower than native and
 * memory-bound, and nothing is ever uploaded.
 */

/** Selectable output containers. `mp4` and `gif` take dedicated code paths. */
type TargetFormat = "mp4" | "webm" | "mov" | "avi" | "mkv" | "gif";

interface FormatOption {
  value: TargetFormat;
  label: string;
  /** One honest line about what this target is good for. */
  hint: string;
}

const FORMAT_OPTIONS: readonly FormatOption[] = [
  { value: "mp4", label: "MP4", hint: "Most universal, plays virtually everywhere" },
  { value: "webm", label: "WebM", hint: "VP9/Opus, lean for modern browsers" },
  { value: "mov", label: "MOV", hint: "Apple/QuickTime-friendly container" },
  { value: "mkv", label: "MKV", hint: "Flexible container for editors & archives" },
  { value: "avi", label: "AVI", hint: "Legacy container for older software" },
  { value: "gif", label: "GIF", hint: "Soundless loop. Keep it short" },
] as const;

/** MP4-only H.264 quality dial. Lower CRF = better quality, bigger file. */
const CRF_BEST = 18;
const CRF_SMALLEST = 30;
const QUALITY_MIN = 1;
const QUALITY_MAX = 10;
const QUALITY_DEFAULT = 7;

/** Map a 1..10 quality step to an H.264 CRF (10 → best, 1 → smallest). */
function qualityToCrf(q: number): number {
  const t = (q - QUALITY_MIN) / (QUALITY_MAX - QUALITY_MIN); // 0..1
  return Math.round(CRF_SMALLEST + t * (CRF_BEST - CRF_SMALLEST));
}

function qualityLabel(q: number): string {
  if (q >= 9) return "Best quality";
  if (q >= 7) return "High";
  if (q >= 4) return "Balanced";
  if (q >= 2) return "Small file";
  return "Smallest file";
}

/** Extension the source already is, lowercased, for the "no-op" guard. */
function currentExt(name: string): string {
  const m = /\.([^.]+)$/.exec(name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function VideoConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [target, setTarget] = React.useState<TargetFormat>("mp4");
  const [quality, setQuality] = React.useState(QUALITY_DEFAULT);

  const crf = qualityToCrf(quality);
  const isMp4 = target === "mp4";
  const isGif = target === "gif";

  return (
    <VideoWorkspace
      runLabel="Convert video"
      runIcon="RefreshCw"
      resultTitle="Converted video"
      progressLabel="Converting"
      softMaxMB={500}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI.
        onEngineLoading(true);
        const handleProgress = (p: number) => {
          // ffmpeg reports progress once it's running → engine has loaded.
          onEngineLoading(false);
          onProgress(p);
        };

        const result = isMp4
          ? await compress(file, { crf }, handleProgress)
          : isGif
            ? await toGif(file, {}, handleProgress)
            : await convertFormat(file, target, handleProgress);

        onEngineLoading(false);
        if (signal.aborted) {
          // Surfaced as a cancel by the workspace; return a benign shape.
          throw new DOMException("Aborted", "AbortError");
        }
        if (!result.ok) throw new Error(result.error);
        return {
          blob: result.blob,
          filename: result.outName,
          kind: isGif ? "image" : "video",
        };
      }}
    >
      {({ file, busy }) => {
        const srcExt = currentExt(file.name);
        const sameFormat = srcExt === target;

        return (
          <div className="flex flex-col gap-5">
            {/* Target-format picker */}
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="RefreshCw" size={15} className={style.text} />
                Convert to
              </span>
              <div
                role="radiogroup"
                aria-label="Target format"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {FORMAT_OPTIONS.map((opt) => {
                  const active = opt.value === target;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => setTarget(opt.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        active
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          active ? style.text : "text-foreground",
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
              {sameFormat && (
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                  <span>
                    Your file is already .{srcExt}. Converting will re-encode it  -
                    useful to re-compress or fix a container, but not required just to
                    keep the same format.
                  </span>
                </p>
              )}
            </div>

            {/* MP4-only quality dial (the only target that re-encodes with a CRF) */}
            {isMp4 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="conv-quality"
                    className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                  >
                    <Icon name="SlidersHorizontal" size={15} className={style.text} />
                    MP4 quality
                  </label>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                      style.soft,
                    )}
                  >
                    {qualityLabel(quality)} · CRF {crf}
                  </span>
                </div>
                <input
                  id="conv-quality"
                  type="range"
                  min={QUALITY_MIN}
                  max={QUALITY_MAX}
                  step={1}
                  value={quality}
                  disabled={busy}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  aria-label="MP4 output quality"
                  aria-valuetext={`${qualityLabel(quality)}, CRF ${crf}`}
                  className={cn(
                    "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    style.ring,
                    "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:shadow",
                    "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-sky-500",
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Smaller file</span>
                  <span>Best quality</span>
                </div>
              </div>
            )}

            {/* GIF-specific honesty note */}
            {isGif && (
              <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                <span>
                  GIF has no real inter-frame compression, so size grows fast with
                  length and resolution. This converts the whole clip at a sensible
                  frame rate and width, for a short, punchy loop with fine-grained
                  control, use the dedicated Video to GIF tool.
                </span>
              </p>
            )}

            {/* Summary + honest engine note */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBytes(file.size)}
                  {srcExt && (
                    <span className="ml-1 uppercase text-muted-foreground">
                      · {srcExt}
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Output format</dt>
                <dd className={cn("text-sm font-semibold uppercase", style.text)}>
                  {target}
                </dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Conversion runs in your browser via FFmpeg (WebAssembly): short clips
                are quick, large ones take real time and are memory-bound. GIF is the
                heaviest target. Nothing is uploaded.
              </span>
            </p>
          </div>
        );
      }}
    </VideoWorkspace>
  );
}

// Referenced for typing parity with the workspace render args; kept explicit so
// a future refactor of the options signature fails loudly here.
export type { VideoMeta };
