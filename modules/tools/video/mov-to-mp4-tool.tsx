"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { convertFormat } from "@/lib/video-tools/operations";

/**
 * MOV to MP4, a single-purpose converter that re-encodes a QuickTime.mov into
 * a universally compatible H.264/AAC MP4 entirely in the browser. It drives the
 * shared {@link convertFormat} operation with the target extension "mp4", which
 * transcodes video to libx264 (yuv420p) and audio to AAC and writes the file
 * with +faststart for instant playback.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset. This component is just the
 * source/output summary + `onRun`. Honest by design: this is a genuine re-encode
 * (not a rename), single-threaded WASM ffmpeg is slower than a native encoder,
 * and nothing is ever uploaded.
 */

/** Lowercased extension (no dot) of a filename, or "" if none. */
function currentExt(name: string): string {
  const m = /\.([^.]+)$/.exec(name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function MovToMp4Tool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  return (
    <VideoWorkspace
      accept="video/quicktime,video/*,.mov"
      softMaxMB={500}
      runLabel="Convert to MP4"
      runIcon="FileVideo"
      resultTitle="Your MP4 video"
      progressLabel="Encoding H.264"
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // The first real run pulls the ~31MB WASM core once; flag it for the UI
        // until ffmpeg starts reporting encode progress.
        onEngineLoading(true);
        let started = false;

        const result = await convertFormat(file, "mp4", (fraction) => {
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
              "Couldn't convert this file to MP4. The codec inside the MOV may be unusual: try a shorter clip or a standard QuickTime recording.",
          );
        }

        return {
          blob: result.blob,
          filename: result.outName,
          kind: "video",
        };
      }}
    >
      {({ file }) => {
        const srcExt = currentExt(file.name);
        const notMov = srcExt !== "" && srcExt !== "mov" && srcExt !== "qt";

        return (
          <div className="flex flex-col gap-5">
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
                  MP4 · H.264
                </dd>
              </div>
            </dl>

            {notMov && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This is a .{srcExt} file, not a MOV. It&apos;ll still be transcoded to
                  H.264 MP4 here, but the general Video Converter is a better fit for
                  non-QuickTime sources.
                </span>
              </p>
            )}

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="ShieldCheck" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
              <span>
                Your MOV is re-encoded to H.264/AAC MP4 by FFmpeg (WebAssembly) on
                your device, with faststart for instant playback and a broadly
                compatible yuv420p pixel format. It&apos;s a real transcode, not a
                rename, so short clips are quick while long or 4K ones take real
                time. Nothing is uploaded.
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
