"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { compress } from "@/lib/video-tools/operations";

/**
 * Video Compressor, the flagship interactive tool and the showcase for the
 * in-browser FFmpeg (WebAssembly) engine. A single plain-English quality slider
 * maps to an H.264 CRF (18 = best quality → 32 = smallest file), an optional
 * target-size hint estimates where to aim, and the run re-encodes the clip
 * entirely on-device via `operations.compress`. {@link VideoWorkspace} owns the
 * dropzone, first-run engine-loading note, determinate progress, preview,
 * download and reset; this component is just the options form + `onRun`.
 *
 * Honest by design: WASM ffmpeg is slower than native and memory-bound, so the
 * copy warns on large files and the workspace shows real progress. Nothing is
 * uploaded.
 */

/** CRF bounds for the quality slider. Lower CRF = better quality, bigger file. */
const CRF_BEST = 18;
const CRF_SMALLEST = 32;

/** Slider runs 1..10 (left = smaller, right = best) for a friendly feel. */
const QUALITY_MIN = 1;
const QUALITY_MAX = 10;
const QUALITY_DEFAULT = 6;

/** Map a 1..10 quality step to an H.264 CRF (10 → CRF_BEST, 1 → CRF_SMALLEST). */
function qualityToCrf(q: number): number {
  const t = (q - QUALITY_MIN) / (QUALITY_MAX - QUALITY_MIN); // 0..1
  return Math.round(CRF_SMALLEST + t * (CRF_BEST - CRF_SMALLEST));
}

/** A short human label for a quality step. */
function qualityLabel(q: number): string {
  if (q >= 9) return "Best quality";
  if (q >= 7) return "High";
  if (q >= 4) return "Balanced";
  if (q >= 2) return "Small file";
  return "Smallest file";
}

/**
 * Very rough estimate of the output size (bytes) at a given quality, used only
 * to power the target-size hint. CRF is logarithmic-ish: each ~6 CRF steps
 * roughly halves the bitrate. We anchor at the source size ≈ CRF 23 baseline.
 * This is deliberately approximate: the real result comes from the encode.
 */
function estimateSize(originalBytes: number, crf: number): number {
  const factor = Math.pow(2, (23 - crf) / 6);
  return Math.round(originalBytes * factor);
}

/** Parse a target-size string like "20" / "20 MB" into bytes, or null. */
function parseTargetMB(value: string): number | null {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 1024 * 1024) : null;
}

/**
 * Suggest the highest quality step whose estimated output still fits under
 * `targetBytes`. Returns null if even the smallest setting can't get there.
 */
function suggestQuality(originalBytes: number, targetBytes: number): number | null {
  for (let q = QUALITY_MAX; q >= QUALITY_MIN; q--) {
    if (estimateSize(originalBytes, qualityToCrf(q)) <= targetBytes) return q;
  }
  return null;
}

export default function VideoCompressorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [quality, setQuality] = React.useState(QUALITY_DEFAULT);
  const [target, setTarget] = React.useState("");

  const crf = qualityToCrf(quality);

  return (
    <VideoWorkspace
      runLabel="Compress video"
      runIcon="Minimize2"
      resultTitle="Compressed video"
      progressLabel="Compressing"
      softMaxMB={500}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI.
        onEngineLoading(true);
        const result = await compress(
          file,
          { crf },
          (p) => {
            // ffmpeg reports progress once it's running → engine has loaded.
            onEngineLoading(false);
            onProgress(p);
          },
        );
        onEngineLoading(false);
        if (signal.aborted) {
          // Surfaced as a cancel by the workspace; return a benign shape.
          throw new DOMException("Aborted", "AbortError");
        }
        if (!result.ok) throw new Error(result.error);
        return { blob: result.blob, filename: result.outName, kind: "video" };
      }}
    >
      {({ file, busy }) => {
        const originalBytes = file.size;
        const est = estimateSize(originalBytes, crf);
        const targetBytes = parseTargetMB(target);
        const suggestion =
          targetBytes != null ? suggestQuality(originalBytes, targetBytes) : null;

        return (
          <div className="flex flex-col gap-5">
            {/* Quality slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="vc-quality"
                  className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                >
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  Quality
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
                id="vc-quality"
                type="range"
                min={QUALITY_MIN}
                max={QUALITY_MAX}
                step={1}
                value={quality}
                disabled={busy}
                onChange={(e) => setQuality(Number(e.target.value))}
                aria-label="Compression quality"
                aria-valuetext={`${qualityLabel(quality)}, CRF ${crf}`}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-teal-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Best quality</span>
              </div>
            </div>

            {/* Target-size hint */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="vc-target"
                className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
              >
                <Icon name="Target" size={15} className={style.text} />
                Target size <span className="text-muted-foreground">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="vc-target"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={target}
                    disabled={busy}
                    placeholder="e.g. 20"
                    onChange={(e) => setTarget(e.target.value)}
                    aria-label="Target size in megabytes"
                    className={cn(
                      "w-full rounded-md border border-border bg-background py-2 pl-3 pr-12 text-sm text-foreground outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      style.ring,
                    )}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">
                    MB
                  </span>
                </div>
                {suggestion != null && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setQuality(suggestion)}
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      style.border,
                      style.text,
                      "hover:bg-muted/50",
                      style.ring,
                    )}
                  >
                    <Icon name="Wand2" size={13} />
                    Aim for it
                  </button>
                )}
              </div>
              {targetBytes != null && (
                <p className="text-xs text-muted-foreground">
                  {suggestion != null ? (
                    <>
                      Quality step {suggestion} ({qualityLabel(suggestion)}) should land
                      near or under {formatBytes(targetBytes)}. It&apos;s an estimate - the
                      exact size shows after compressing.
                    </>
                  ) : (
                    <>
                      Even the smallest setting may not reach {formatBytes(targetBytes)} at
                      watchable quality. Try trimming the clip&apos;s length first.
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Live estimate row */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Original</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBytes(originalBytes)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Est. output</dt>
                <dd className={cn("text-sm font-semibold tabular-nums", style.text)}>
                  ~{formatBytes(est)}
                </dd>
              </div>
              <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
                <dt className="text-xs text-muted-foreground">Est. saved</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {originalBytes > 0
                    ? `~${Math.max(0, Math.round(((originalBytes - est) / originalBytes) * 100))}%`
                    : "—"}
                </dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Estimates are rough. The real size comes from the encode. Compression
                runs in your browser via FFmpeg (WebAssembly): short clips are quick,
                large ones take real time and are memory-bound. Nothing is uploaded.
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
