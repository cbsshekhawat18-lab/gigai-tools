"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { run } from "@/lib/video-tools/ffmpeg";

/**
 * MP4 to WebM, a single-purpose converter that re-encodes an H.264 MP4 into a
 * VP9/Opus WebM entirely in the browser. It drives a CUSTOM ffmpeg pipeline via
 * {@link run} (rather than the generic `convertFormat`) so it can expose a REAL
 * VP9 constant-quality dial: `-c:v libvpx-vp9 -b:v 0 -crf <n>` is VP9's proper
 * constant-quality mode, where a lower CRF means better quality and a bigger
 * file. Audio is transcoded to Opus (`-c:a libopus`). `-row-mt 1` is a cheap
 * win even in the single-threaded core.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset. This component is just the
 * quality form + `onRun`. Honest by design: VP9 in single-threaded WASM ffmpeg
 * is CPU-heavy and slower than native, WebM isn't universal (older Safari and
 * some editors reject it), and nothing is ever uploaded.
 */

// VP9 constant-quality CRF sits on a 0..63 scale. We surface a friendly 1..10
// quality dial and map it into a sensible visual window: 10 → crisp (low CRF),
// 1 → small file (high CRF). 32 is a common "good default" for VP9.
const CRF_BEST = 24; // crispest we expose (bigger file)
const CRF_SMALLEST = 44; // smallest we expose (softer)
const QUALITY_MIN = 1;
const QUALITY_MAX = 10;
const QUALITY_DEFAULT = 6;

/** Map a 1..10 quality step to a VP9 CRF (10 → best/low CRF, 1 → high CRF). */
function qualityToCrf(q: number): number {
  const t = (q - QUALITY_MIN) / (QUALITY_MAX - QUALITY_MIN); // 0..1
  return Math.round(CRF_SMALLEST + t * (CRF_BEST - CRF_SMALLEST));
}

function qualityLabel(q: number): string {
  if (q >= 9) return "Crisp";
  if (q >= 7) return "High";
  if (q >= 4) return "Balanced";
  if (q >= 2) return "Small file";
  return "Smallest file";
}

/** Lowercased extension (no dot) of a filename, or "" if none. */
function currentExt(name: string): string {
  const m = /\.([^.]+)$/.exec(name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

/** Sanitize a filename base for the output name. */
function baseName(name: string): string {
  const noExt = name.replace(/\.[^.]+$/, "");
  const cleaned = noExt.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "video";
}

export default function Mp4ToWebmTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [quality, setQuality] = React.useState(QUALITY_DEFAULT);

  const crf = qualityToCrf(quality);

  return (
    <VideoWorkspace
      accept="video/mp4,video/*"
      softMaxMB={400}
      runLabel="Convert to WebM"
      runIcon="FileVideo"
      resultTitle="Your WebM video"
      progressLabel="Encoding VP9"
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // The first real run pulls the ~31MB WASM core once; flag it for the UI
        // until ffmpeg starts reporting encode progress.
        onEngineLoading(true);
        let started = false;

        const { fetchFile } = await import("@ffmpeg/util");
        const data = await fetchFile(file);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const inName = "in.mp4";
        const outName = `${baseName(file.name)}.webm`;

        // Real VP9 constant-quality encode: -b:v 0 + -crf enables CQ mode.
        // -row-mt 1 helps a little even single-threaded; Opus for audio.
        const args = [
          "-i", inName,
          "-c:v", "libvpx-vp9",
          "-b:v", "0",
          "-crf", String(crf),
          "-row-mt", "1",
          "-c:a", "libopus",
          "-b:a", "128k",
          outName,
        ];

        let blob: Blob;
        try {
          blob = await run(
            args,
            { name: inName, data },
            outName,
            (fraction) => {
              if (signal.aborted) return;
              if (!started) {
                started = true;
                onEngineLoading(false);
              }
              onProgress(Math.min(1, Math.max(0, fraction)));
            },
            "video/webm",
          );
        } catch (err) {
          onEngineLoading(false);
          throw new Error(
            err instanceof Error && err.message
              ? `Couldn't convert this file to WebM. ${err.message}`
              : "Couldn't convert this file to WebM. The codec inside may be unusual. Try a standard H.264 MP4.",
          );
        }

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        return {
          blob,
          filename: outName,
          kind: "video",
        };
      }}
    >
      {({ file, busy }) => {
        const srcExt = currentExt(file.name);
        const notMp4 = srcExt !== "" && srcExt !== "mp4";

        return (
          <div className="flex flex-col gap-5">
            {/* VP9 quality dial (real constant-quality target) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="webm-quality"
                  className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                >
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  VP9 quality
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
                id="webm-quality"
                type="range"
                min={QUALITY_MIN}
                max={QUALITY_MAX}
                step={1}
                value={quality}
                disabled={busy}
                onChange={(e) => setQuality(Number(e.target.value))}
                aria-label="VP9 output quality"
                aria-valuetext={`${qualityLabel(quality)}, CRF ${crf}`}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-emerald-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Crisper picture</span>
              </div>
            </div>

            {notMp4 && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This is a .{srcExt} file, not an MP4. It&apos;ll still be transcoded to
                  VP9/WebM here, but the general Video Converter is a better fit for
                  non-MP4 sources.
                </span>
              </p>
            )}

            {/* Source → output summary */}
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
                <dt className="text-xs text-muted-foreground">Output</dt>
                <dd className={cn("text-sm font-semibold uppercase", style.text)}>
                  WebM · VP9
                </dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                VP9 encodes in FFmpeg (WebAssembly) on your device, it&apos;s a heavy
                codec, so short clips are quick and long or high-res ones take real
                time. WebM plays natively in Chrome, Firefox and Edge, but older
                Safari and some editors won&apos;t accept it. Nothing is uploaded.
              </span>
            </p>
          </div>
        );
      }}
    </VideoWorkspace>
  );
}

// Kept explicit so a future change to the workspace render-arg shape fails
// loudly here rather than silently drifting.
export type { VideoMeta };
