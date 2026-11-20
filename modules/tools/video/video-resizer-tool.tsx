"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { resize, type ResizeOptions } from "@/lib/video-tools/operations";

/**
 * Video Resizer, change a clip's resolution entirely on-device via
 * `operations.resize`. The user picks a standard height preset (2160p…360p) or
 * types a custom width/height; with the aspect ratio LOCKED they set just one
 * dimension and the other is derived from the source, then even-snapped to keep
 * H.264 happy. When the target shape differs from the source, a fit mode
 * (Contain / Cover / Stretch) decides padding vs. crop vs. distortion.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset. This component is just the
 * options form + `onRun`. Honest by design: WASM ffmpeg is slower than native
 * and memory-bound, so the copy warns on large 4K sources and the workspace
 * shows real progress. Nothing is uploaded.
 */

type FitMode = "contain" | "cover" | "stretch";

interface HeightPreset {
  /** Standard target height in pixels. */
  height: number;
  /** Short label, e.g. "1080p". */
  label: string;
  /** Colloquial name shown under the label. */
  hint: string;
}

/** Standard heights people actually target, tall → short. */
const PRESETS: HeightPreset[] = [
  { height: 2160, label: "2160p", hint: "4K UHD" },
  { height: 1440, label: "1440p", hint: "2K QHD" },
  { height: 1080, label: "1080p", hint: "Full HD" },
  { height: 720, label: "720p", hint: "HD" },
  { height: 480, label: "480p", hint: "SD" },
  { height: 360, label: "360p", hint: "Low" },
];

const FIT_MODES: { id: FitMode; label: string; icon: string; blurb: string }[] = [
  {
    id: "contain",
    label: "Contain",
    icon: "Minimize2",
    blurb: "Fit the whole picture inside and pad the rest (black bars). Nothing is cut.",
  },
  {
    id: "cover",
    label: "Cover",
    icon: "Maximize2",
    blurb: "Fill the frame and trim the overflow. No bars, but edges are cropped.",
  },
  {
    id: "stretch",
    label: "Stretch",
    icon: "Move",
    blurb: "Force the exact width and height. Fast, but can distort the picture.",
  },
];

/** Round to the nearest even integer ≥ 2 (encoders require even dimensions). */
function even(n: number): number {
  return Math.max(2, Math.round(n / 2) * 2);
}

/** Parse a positive-integer pixel string, or null. */
function parsePx(value: string): number | null {
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function VideoResizerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  // Locked ⇒ set one dimension, derive the other from the source aspect.
  const [locked, setLocked] = React.useState(true);
  const [widthStr, setWidthStr] = React.useState("");
  const [heightStr, setHeightStr] = React.useState("");
  const [fit, setFit] = React.useState<FitMode>("contain");
  // Which preset (by height) is currently active, for button highlighting.
  const [activePreset, setActivePreset] = React.useState<number | null>(null);

  return (
    <VideoWorkspace
      runLabel="Resize video"
      runIcon="Scaling"
      resultTitle="Resized video"
      progressLabel="Resizing"
      accept="video/*"
      softMaxMB={500}
      onRun={async (file, meta, { onProgress, onEngineLoading, signal }) => {
        const srcW = meta.width > 0 ? meta.width : 0;
        const srcH = meta.height > 0 ? meta.height : 0;

        const wIn = parsePx(widthStr);
        const hIn = parsePx(heightStr);

        // Build the resize options. With the aspect locked we pass only the
        // dimension(s) the user gave and let ffmpeg's -2 auto-derive the rest,
        // which guarantees the source ratio and even dimensions.
        let opts: ResizeOptions;
        if (locked) {
          if (wIn == null && hIn == null) {
            throw new Error(
              "Enter a target width or height (or tap a preset) to resize the video.",
            );
          }
          // Prefer height when both are somehow set while locked; pass one dim
          // so the operation auto-computes the matching side (-2).
          if (hIn != null) {
            opts = { h: even(hIn) };
          } else {
            opts = { w: even(wIn as number) };
          }
        } else {
          if (wIn == null || hIn == null) {
            throw new Error(
              "With the aspect ratio unlocked, enter BOTH a width and a height (in pixels).",
            );
          }
          opts = { w: even(wIn), h: even(hIn), fit };
        }

        // Guard against a no-op when the source is already the target size.
        if (
          srcW > 0 &&
          srcH > 0 &&
          opts.w != null &&
          opts.h != null &&
          even(srcW) === opts.w &&
          even(srcH) === opts.h
        ) {
          throw new Error(
            "The target size matches the source resolution: pick a different width or height to actually rescale.",
          );
        }

        // First resize of a session pays the one-time ~31MB engine download.
        onEngineLoading(true);
        const result = await resize(file, opts, (p) => {
          // ffmpeg emitting progress ⇒ the engine has loaded.
          onEngineLoading(false);
          onProgress(Math.min(1, Math.max(0, p)));
        });
        onEngineLoading(false);

        if (signal.aborted) {
          // Workspace ignores the return when aborted; keep the shape valid.
          return { blob: new Blob(), kind: "video" as const };
        }
        if (!result.ok) throw new Error(result.error);
        return { blob: result.blob, filename: result.outName, kind: "video" as const };
      }}
    >
      {({ file, meta, busy }) => {
        const srcW = meta.width > 0 ? meta.width : 0;
        const srcH = meta.height > 0 ? meta.height : 0;
        const hasDims = srcW > 0 && srcH > 0;
        const ratio = hasDims ? srcW / srcH : 0;

        const wIn = parsePx(widthStr);
        const hIn = parsePx(heightStr);

        // Apply a preset height: fill the height field and, when locked and we
        // know the source ratio, the derived width too.
        const applyPreset = (p: HeightPreset) => {
          setActivePreset(p.height);
          setHeightStr(String(p.height));
          if (locked && hasDims) {
            setWidthStr(String(even(p.height * ratio)));
          } else {
            setWidthStr("");
          }
        };

        // Keep the counterpart dimension in sync while locked.
        const onWidth = (v: string) => {
          setActivePreset(null);
          setWidthStr(v);
          if (locked && hasDims) {
            const n = parsePx(v);
            setHeightStr(n != null ? String(even(n / ratio)) : "");
          }
        };
        const onHeight = (v: string) => {
          setActivePreset(null);
          setHeightStr(v);
          if (locked && hasDims) {
            const n = parsePx(v);
            setWidthStr(n != null ? String(even(n * ratio)) : "");
          }
        };

        const toggleLock = () => {
          const next = !locked;
          setLocked(next);
          // Re-derive the counterpart when turning the lock back on.
          if (next && hasDims) {
            if (hIn != null) setWidthStr(String(even(hIn * ratio)));
            else if (wIn != null) setHeightStr(String(even(wIn / ratio)));
          }
        };

        // Compute the effective output dimensions for the summary.
        let outW: number | null = null;
        let outH: number | null = null;
        if (locked && hasDims) {
          if (hIn != null) {
            outH = even(hIn);
            outW = even(hIn * ratio);
          } else if (wIn != null) {
            outW = even(wIn);
            outH = even(wIn / ratio);
          }
        } else if (!locked) {
          if (wIn != null) outW = even(wIn);
          if (hIn != null) outH = even(hIn);
        }

        // A shape change (relevant to fit modes) only when unlocked and the
        // target ratio differs from the source.
        const targetRatio = outW && outH ? outW / outH : 0;
        const shapeChanges =
          !locked &&
          hasDims &&
          targetRatio > 0 &&
          Math.abs(targetRatio - ratio) > 0.01;

        const isUpscale =
          hasDims &&
          outW != null &&
          outH != null &&
          (outW > srcW || outH > srcH);

        return (
          <div className="flex flex-col gap-5">
            {/* Source resolution readout */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
              <span className="text-muted-foreground">
                Source{" "}
                <span className={cn("font-semibold", style.text)}>
                  {hasDims ? `${srcW} × ${srcH}` : "reading…"}
                </span>
              </span>
              <span className="text-muted-foreground">
                File{" "}
                <span className="font-medium text-foreground">
                  {formatBytes(file.size)}
                </span>
              </span>
            </div>

            {/* Height presets */}
            <div
              role="group"
              aria-label="Resolution preset"
              className="flex flex-col gap-2"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="Scaling" size={15} className={style.text} />
                Preset height
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const active = activePreset === p.height;
                  const disabled = busy || (locked && !hasDims);
                  return (
                    <button
                      key={p.height}
                      type="button"
                      onClick={() => applyPreset(p)}
                      disabled={disabled}
                      aria-pressed={active}
                      className={cn(
                        "flex min-w-[4.5rem] flex-col items-center rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        style.ring,
                        active
                          ? cn(style.solid, "border-transparent text-white")
                          : "border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      <span>{p.label}</span>
                      <span
                        className={cn(
                          "text-[10px] font-normal",
                          active ? "text-white/80" : "text-muted-foreground",
                        )}
                      >
                        {p.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
              {locked && !hasDims && (
                <p className="text-xs text-muted-foreground">
                  Reading the video&rsquo;s dimensions&hellip; presets fill in the
                  matching width once the size is known.
                </p>
              )}
            </div>

            {/* Custom width / height + aspect lock */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  Custom size
                </span>
                <button
                  type="button"
                  onClick={toggleLock}
                  disabled={busy}
                  aria-pressed={locked}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    style.ring,
                    locked
                      ? cn(style.soft, style.border)
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon name={locked ? "Lock" : "LockOpen"} size={13} />
                  {locked ? "Aspect locked" : "Aspect free"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={2}
                    step={2}
                    value={widthStr}
                    disabled={busy}
                    placeholder="width"
                    aria-label="Target width in pixels"
                    onChange={(e) => onWidth(e.target.value)}
                    className={cn(
                      "w-full rounded-md border border-border bg-background py-2 pl-3 pr-9 text-sm text-foreground outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      style.ring,
                    )}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">
                    px
                  </span>
                </div>
                <Icon
                  name="X"
                  size={14}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={2}
                    step={2}
                    value={heightStr}
                    disabled={busy}
                    placeholder="height"
                    aria-label="Target height in pixels"
                    onChange={(e) => onHeight(e.target.value)}
                    className={cn(
                      "w-full rounded-md border border-border bg-background py-2 pl-3 pr-9 text-sm text-foreground outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      style.ring,
                    )}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">
                    px
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {locked
                  ? "Aspect locked. Set one dimension and the other follows your source. Values snap to even numbers."
                  : "Aspect free. Set both width and height. Mismatched shapes use the fit mode below."}
              </p>
            </div>

            {/* Fit mode - only meaningful when the shape changes (unlocked). */}
            {!locked && (
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon name="LayoutGrid" size={15} className={style.text} />
                  Fit
                  {!shapeChanges && (
                    <span className="text-xs font-normal text-muted-foreground">
                      (only applies when the shape changes)
                    </span>
                  )}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {FIT_MODES.map((m) => {
                    const active = fit === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFit(m.id)}
                        disabled={busy}
                        aria-pressed={active}
                        className={cn(
                          "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          style.ring,
                          active
                            ? cn(style.soft, style.border)
                            : "border-border bg-background hover:bg-muted",
                        )}
                      >
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Icon
                            name={m.icon}
                            size={14}
                            className={active ? style.text : "text-muted-foreground"}
                          />
                          {m.label}
                        </span>
                        <span className="text-xs leading-snug text-muted-foreground">
                          {m.blurb}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Output summary */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {hasDims ? `${srcW} × ${srcH}` : "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Output</dt>
                <dd className={cn("text-sm font-semibold tabular-nums", style.text)}>
                  {outW != null && outH != null ? `${outW} × ${outH}` : "—"}
                </dd>
              </div>
            </dl>

            {isUpscale && (
              <p className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This target is larger than the source. Upscaling can&rsquo;t add
                  real detail. It only enlarges existing pixels, so expect a
                  softer picture.
                </span>
              </p>
            )}

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Resizing runs in your browser via FFmpeg (WebAssembly): short or
                low-resolution clips are quick, large 4K sources take real time and
                are memory-bound. Dimensions snap to even numbers. Nothing is
                uploaded.
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
