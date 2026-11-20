"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatDuration, type VideoMeta } from "@/components/tool/video/media-utils";
import { reverse, mute } from "@/lib/video-tools/operations";

/**
 * Reverse Video: flip a clip end-to-end so the last frame plays first, picture
 * and sound together. {@link VideoWorkspace} owns the dropzone, first-run
 * engine-loading note, determinate progress, preview, download and reset; this
 * component supplies only the options form (an audio-reverse toggle) and the
 * `onRun` that drives `operations.reverse`, plus a `mute` pass when the user
 * wants a clean silent reverse.
 *
 * Honest by design: reversing buffers the whole clip in memory to play it
 * back-to-front, and WASM ffmpeg is single-threaded, so the copy favours shorter
 * inputs and the workspace shows real progress. Nothing is uploaded.
 */

export default function VideoReverseTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [reverseAudio, setReverseAudio] = React.useState(true);

  return (
    <VideoWorkspace
      runLabel="Reverse video"
      runIcon="Rewind"
      resultTitle="Reversed video"
      progressLabel="Reversing"
      accept="video/*"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI.
        onEngineLoading(true);

        // When we also mute, split the progress bar across two ffmpeg passes so
        // the bar stays honest and monotonic instead of jumping to 100% twice.
        const stage1Cap = reverseAudio ? 1 : 0.9;
        const reversed = await reverse(file, (p) => {
          onEngineLoading(false);
          onProgress(Math.min(stage1Cap, p * stage1Cap));
        });
        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (!reversed.ok) throw new Error(reversed.error);

        // Keep audio flipped (default) → done. Otherwise strip the reversed
        // audio for a clean silent reverse.
        if (reverseAudio) {
          return { blob: reversed.blob, filename: reversed.outName, kind: "video" };
        }

        const silent = await mute(reversed.blob, (p) => {
          onProgress(Math.min(1, 0.9 + p * 0.1));
        });
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (!silent.ok) throw new Error(silent.error);

        // reverse() names the output *-reversed.<ext>; mute() re-derives a
        // *-muted name off that, so restore a clear reversed filename.
        const outName = reversed.outName.replace(/(\.[^.]+)$/, "-silent$1");
        return { blob: silent.blob, filename: outName, kind: "video" };
      }}
    >
      {({ meta, busy }) => (
        <div className="flex flex-col gap-5">
          {/* Audio toggle */}
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="Volume2" size={15} className={style.text} />
              Audio
            </span>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                role="radio"
                aria-checked={reverseAudio}
                disabled={busy}
                onClick={() => setReverseAudio(true)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  reverseAudio
                    ? cn(style.border, style.soft)
                    : "border-border hover:bg-muted/50",
                )}
              >
                <Icon
                  name="Volume2"
                  size={18}
                  className={cn("mt-0.5 shrink-0", reverseAudio ? style.text : "text-muted-foreground")}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Reverse audio too
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Flip the soundtrack in step with the picture, the classic
                    backwards-speech effect.
                  </span>
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={!reverseAudio}
                disabled={busy}
                onClick={() => setReverseAudio(false)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  !reverseAudio
                    ? cn(style.border, style.soft)
                    : "border-border hover:bg-muted/50",
                )}
              >
                <Icon
                  name="VolumeX"
                  size={18}
                  className={cn("mt-0.5 shrink-0", !reverseAudio ? style.text : "text-muted-foreground")}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Silent reverse
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Drop the audio for a clean, quiet flip: ideal when you&apos;ll
                    add your own sound later.
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* What happens row */}
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Length</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {meta.duration > 0 ? formatDuration(meta.duration) : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Output</dt>
              <dd className={cn("text-sm font-semibold", style.text)}>
                {reverseAudio ? "Backwards + audio" : "Backwards, silent"}
              </dd>
            </div>
          </dl>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            <span>
              Reversing rewrites every frame end-to-end and buffers the clip in
              memory, so it runs in your browser via FFmpeg (WebAssembly): short
              clips are quick, long or 4K ones take real time and are
              memory-bound. Trim first for a faster reverse. Nothing is uploaded.
            </span>
          </p>
        </div>
      )}
    </VideoWorkspace>
  );
}

// Referenced for typing parity with the workspace render args; kept explicit so
// a future refactor of the options signature fails loudly here.
export type { VideoMeta };
