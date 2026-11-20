"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, formatDuration, type VideoMeta } from "@/components/tool/video/media-utils";
import { loopVideo } from "@/lib/video-tools/operations";

/**
 * Video Loop, repeat a clip end-to-end N times into one longer file. This
 * component is only the options form + `onRun`; {@link VideoWorkspace} owns the
 * dropzone, first-run engine-loading note, determinate progress, preview,
 * download and reset.
 *
 * The UI is expressed in TOTAL PLAYS (how many times the clip appears in the
 * output). The underlying `operations.loopVideo(file, count)` takes the number
 * of EXTRA repeats via ffmpeg's `-stream_loop`, so we pass `plays - 1`.
 *
 * Honest by design: looping multiplies length, so a big source × many plays is
 * a large, memory-bound WASM encode. The copy warns before heavy runs and the
 * workspace shows real progress. Nothing is uploaded.
 */

/** Total number of times the clip appears in the output. */
const PLAYS_MIN = 2;
const PLAYS_MAX = 50;
const PLAYS_DEFAULT = 3;

/** Rough size ceiling above which we warn the run is heavy for in-browser WASM. */
const HEAVY_OUTPUT_BYTES = 500 * 1024 * 1024; // ~500 MB

/** Handful of one-tap presets for common looping counts. */
const PRESETS = [2, 3, 5, 10] as const;

function clampPlays(n: number): number {
  if (!Number.isFinite(n)) return PLAYS_DEFAULT;
  return Math.min(PLAYS_MAX, Math.max(PLAYS_MIN, Math.round(n)));
}

export default function VideoLoopTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [plays, setPlays] = React.useState<number>(PLAYS_DEFAULT);

  return (
    <VideoWorkspace
      accept="video/*"
      softMaxMB={400}
      runLabel="Loop video"
      runIcon="Repeat"
      resultTitle="Looped video"
      progressLabel="Looping"
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI
        // until the first progress tick tells us ffmpeg is actually running.
        onEngineLoading(true);
        let started = false;

        // UI is total plays; loopVideo wants extra repeats = plays - 1.
        const extraRepeats = clampPlays(plays) - 1;

        const result = await loopVideo(file, extraRepeats, (fraction) => {
          if (signal.aborted) return;
          if (!started) {
            started = true;
            onEngineLoading(false);
          }
          onProgress(Math.min(1, Math.max(0, fraction)));
        });

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (!result.ok) {
          throw new Error(
            result.error ||
              "Couldn't loop this clip. Try a lower repeat count, or trim the source shorter first.",
          );
        }
        return { blob: result.blob, filename: result.outName, kind: "video" };
      }}
    >
      {({ file, meta, busy }) => {
        const safePlays = clampPlays(plays);
        const outSeconds = meta.duration * safePlays;
        const estBytes = file.size * safePlays;
        const heavy = estBytes > HEAVY_OUTPUT_BYTES;

        return (
          <div className="flex flex-col gap-5">
            {/* Repeat count */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="vl-plays"
                  className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                >
                  <Icon name="Repeat" size={15} className={style.text} />
                  Total plays
                </label>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  ×{safePlays}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy || safePlays <= PLAYS_MIN}
                  onClick={() => setPlays((p) => clampPlays(p - 1))}
                  aria-label="Fewer plays"
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground outline-none transition-colors",
                    "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    style.ring,
                  )}
                >
                  <Icon name="Minus" size={16} />
                </button>

                <div className="relative flex-1">
                  <input
                    id="vl-plays"
                    type="number"
                    inputMode="numeric"
                    min={PLAYS_MIN}
                    max={PLAYS_MAX}
                    step={1}
                    value={safePlays}
                    disabled={busy}
                    onChange={(e) => setPlays(clampPlays(Number(e.target.value)))}
                    aria-label="Total number of times the clip plays"
                    className={cn(
                      "w-full rounded-md border border-border bg-background py-2 pl-3 pr-14 text-center text-sm font-semibold tabular-nums text-foreground outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      style.ring,
                    )}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">
                    plays
                  </span>
                </div>

                <button
                  type="button"
                  disabled={busy || safePlays >= PLAYS_MAX}
                  onClick={() => setPlays((p) => clampPlays(p + 1))}
                  aria-label="More plays"
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground outline-none transition-colors",
                    "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    style.ring,
                  )}
                >
                  <Icon name="Plus" size={16} />
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Quick set:</span>
                {PRESETS.map((n) => {
                  const active = safePlays === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={busy}
                      onClick={() => setPlays(n)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-semibold tabular-nums outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        active
                          ? cn(style.soft, style.border)
                          : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      ×{n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live output readout */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatDuration(meta.duration)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Output length</dt>
                <dd className={cn("text-sm font-semibold tabular-nums", style.text)}>
                  {formatDuration(outSeconds)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Original size</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBytes(file.size)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Est. output*</dt>
                <dd
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    heavy ? "text-amber-600 dark:text-amber-400" : style.text,
                  )}
                >
                  ~{formatBytes(estBytes)}
                </dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon
                name={heavy ? "TriangleAlert" : "Info"}
                size={14}
                className={cn("mt-0.5 shrink-0", heavy && "text-amber-600 dark:text-amber-400")}
              />
              <span>
                {heavy ? (
                  <>
                    <span className="text-amber-600 dark:text-amber-400">
                      That&apos;s a large output (~{formatBytes(estBytes)}).
                    </span>{" "}
                    Looping multiplies length, and in-browser FFmpeg (WebAssembly)
                    is single-threaded and memory-bound; this may be slow or run
                    out of memory. Lower the count or trim the source first.
                  </>
                ) : (
                  <>
                    * A loose estimate; the exact size comes from the encode. The
                    clip is re-encoded and repeated {safePlays}× into one file,
                    entirely in your browser. Nothing is uploaded.
                  </>
                )}
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
