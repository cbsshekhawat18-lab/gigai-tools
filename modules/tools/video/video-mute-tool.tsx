"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatDuration, type VideoMeta } from "@/components/tool/video/media-utils";
import { mute } from "@/lib/video-tools/operations";

/**
 * Mute Video, strip the audio track out of a clip and hand back a silent copy,
 * picture untouched. {@link VideoWorkspace} owns the dropzone, first-run
 * engine-loading note, determinate progress, preview, download and reset; this
 * component supplies only the informational options panel and the `onRun` that
 * drives `operations.mute` (a lossless video stream-copy. No re-encode of the
 * frames).
 *
 * Honest by design: muting copies the picture without re-encoding, so it's one
 * of the fastest ops here, but single-threaded WASM still demuxes and remuxes
 * the container, so very large files scale with time and memory. Nothing is
 * uploaded.
 */

export default function VideoMuteTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  return (
    <VideoWorkspace
      runLabel="Mute video"
      runIcon="VolumeX"
      resultTitle="Muted video"
      progressLabel="Muting"
      accept="video/*"
      softMaxMB={500}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI so
        // the workspace shows the one-time engine-loading note.
        onEngineLoading(true);

        const result = await mute(file, (p) => {
          onEngineLoading(false);
          onProgress(Math.min(1, Math.max(0, p)));
        });
        onEngineLoading(false);

        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (!result.ok) throw new Error(result.error);

        return { blob: result.blob, filename: result.outName, kind: "video" };
      }}
    >
      {({ meta }) => (
        <div className="flex flex-col gap-5">
          {/* What the mute will do - no options; muting is a single, honest action. */}
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="VolumeX" size={15} className={style.text} />
              What happens
            </span>

            <ul className="flex flex-col gap-2">
              <li className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Icon
                  name="VolumeX"
                  size={18}
                  className={cn("mt-0.5 shrink-0", style.text)}
                  aria-hidden
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Every audio track is removed
                  </span>
                  <span className="text-xs text-muted-foreground">
                    The output is genuinely silent. No residual soundtrack and
                    no hidden second track left behind.
                  </span>
                </span>
              </li>

              <li className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Icon
                  name="Copy"
                  size={18}
                  className={cn("mt-0.5 shrink-0", style.text)}
                  aria-hidden
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    The picture is copied losslessly
                  </span>
                  <span className="text-xs text-muted-foreground">
                    The video stream is passed through untouched, same
                    resolution, bitrate and quality. Only the sound changes.
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Metadata summary row */}
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Length</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {meta.duration > 0 ? formatDuration(meta.duration) : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Output</dt>
              <dd className={cn("text-sm font-semibold", style.text)}>Silent copy</dd>
            </div>
          </dl>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Muting copies the video stream without re-encoding, so it&apos;s fast
              and keeps the picture identical. It runs in your browser via
              FFmpeg (WebAssembly). Very large or long files still take real
              time to demux and remux, and are bounded by your tab&apos;s memory.
              Nothing is uploaded.
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
