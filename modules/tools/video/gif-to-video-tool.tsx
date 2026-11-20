"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { gifToVideo } from "@/lib/video-tools/operations";

/**
 * GIF to Video, the inverse of the flagship Video to GIF. The user drops an
 * animated GIF, picks MP4 (H.264) or WebM (VP9), and the run re-encodes it
 * on-device via FFmpeg (WebAssembly) using {@link gifToVideo}. The payoff is
 * concrete: GIF is a 256-color, barely-compressed format, so modern video codecs
 * usually shrink the same animation to a fraction of its size while restoring
 * full color and smoother playback: {@link VideoWorkspace} surfaces the exact
 * before/after size delta on the result, so the win is measured, not promised.
 *
 * The workspace owns the dropzone, first-run engine-loading note, determinate
 * progress, preview, download and reset; this component is just the format
 * toggle + `onRun`. Honest by design: the output is a soundless video (a GIF has
 * no audio to carry over), looping is player-driven rather than baked in, WASM
 * ffmpeg is slower and memory-bound on very large GIFs, and nothing is uploaded.
 */

/** Output containers. Each maps to a real codec default inside gifToVideo. */
type TargetFormat = "mp4" | "webm";

interface FormatOption {
  value: TargetFormat;
  label: string;
  codec: string;
  /** One honest line about what this target is good for. */
  hint: string;
}

const MP4_OPTION: FormatOption = {
  value: "mp4",
  label: "MP4",
  codec: "H.264",
  hint: "Most universal: feeds, decks, editors & messengers all take it",
};

const WEBM_OPTION: FormatOption = {
  value: "webm",
  label: "WebM",
  codec: "VP9",
  hint: "Lean, modern-browser file. Can win on flat/UI content",
};

const FORMAT_OPTIONS: readonly FormatOption[] = [MP4_OPTION, WEBM_OPTION] as const;

/** True when the dropped file looks like a GIF, for a gentle input warning. */
function looksLikeGif(file: File): boolean {
  return (
    file.type === "image/gif" || /\.gif$/i.test(file.name)
  );
}

export default function GifToVideoTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [target, setTarget] = React.useState<TargetFormat>("mp4");

  const active = target === "webm" ? WEBM_OPTION : MP4_OPTION;

  return (
    <VideoWorkspace
      accept="image/gif"
      softMaxMB={200}
      runLabel="Convert to video"
      runIcon="Film"
      resultTitle="Your video"
      progressLabel="Encoding video"
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI
        // until ffmpeg emits its first progress tick (i.e. it's actually running).
        onEngineLoading(true);
        let started = false;

        const result = await gifToVideo(file, { format: target }, (fraction) => {
          if (signal.aborted) return;
          if (!started) {
            started = true;
            onEngineLoading(false);
          }
          onProgress(fraction);
        });

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (!result.ok) {
          throw new Error(
            result.error ||
              "Couldn't convert this GIF. It may be corrupt or not a real animated GIF: try re-saving it or a different file.",
          );
        }

        return {
          blob: result.blob,
          filename: result.outName,
          kind: "video",
        };
      }}
    >
      {({ file, busy }) => {
        const isGif = looksLikeGif(file);

        return (
          <div className="flex flex-col gap-5">
            {/* Not-a-GIF guard */}
            {!isGif && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This tool expects an animated <strong>GIF</strong>. Your file
                  doesn&apos;t look like one, so the conversion may fail, to turn a
                  video into a GIF instead, use the Video to GIF tool.
                </span>
              </p>
            )}

            {/* Target-format picker */}
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="RefreshCw" size={15} className={style.text} />
                Convert to
              </span>
              <div
                role="radiogroup"
                aria-label="Output video format"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {FORMAT_OPTIONS.map((opt) => {
                  const selected = opt.value === target;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={busy}
                      onClick={() => setTarget(opt.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        selected
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <span className="flex items-baseline gap-1.5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            selected ? style.text : "text-foreground",
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {opt.codec}
                        </span>
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Source summary + expected win */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Source GIF</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBytes(file.size)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Output</dt>
                <dd className={cn("text-sm font-semibold uppercase", style.text)}>
                  {active.label} · {active.codec}
                </dd>
              </div>
            </dl>

            {/* Honest notes: soundless + player-driven loop */}
            <div className="flex flex-col gap-2">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="VolumeX" size={14} className="mt-0.5 shrink-0" />
                <span>
                  The output has <strong>no sound</strong> - a GIF has no audio track
                  to carry over. It&apos;s a soundless video by nature.
                </span>
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Repeat" size={14} className="mt-0.5 shrink-0" />
                <span>
                  Looping is <strong>player-driven</strong>, not baked in. For an
                  autoplaying loop on the web, use a muted, looping{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                    &lt;video&gt;
                  </code>{" "}
                  tag.
                </span>
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  Encoding runs in your browser via FFmpeg (WebAssembly): most GIFs
                  are quick, but a very large one takes real time and is memory-bound.
                  Modern video usually lands a fraction of the GIF&apos;s size, you&apos;ll
                  see the exact before/after on the result. Nothing is uploaded.
                </span>
              </p>
            </div>
          </div>
        );
      }}
    </VideoWorkspace>
  );
}

// Referenced for typing parity with the workspace render args; kept explicit so
// a future refactor of the options signature fails loudly here.
export type { VideoMeta };
