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
 * AVI to MP4: a single-purpose converter that transcodes a legacy AVI
 * (DivX/Xvid/MJPEG + MP3/PCM) into a universal H.264/AAC MP4 entirely in the
 * browser. It drives {@link convertFormat} with the "mp4" target, which under
 * the hood runs `-c:v libx264 -crf 23 -c:a aac -pixel_format yuv420p` plus an
 * even-dimension scale and `-movflags +faststart`, a real transcode with
 * web-ready faststart, not a rename.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset; this component supplies
 * only the small options summary + `onRun`. Honest by design: single-threaded
 * WASM ffmpeg is slower than native and memory-bound (AVIs are often large and
 * lightly compressed), and nothing is ever uploaded.
 */

/** Lowercased extension (no dot) of a filename, or "" if none. */
function currentExt(name: string): string {
  const m = /\.([^.]+)$/.exec(name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function AviToMp4Tool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  return (
    <VideoWorkspace
      accept="video/avi,video/x-msvideo,video/*,.avi"
      softMaxMB={500}
      runLabel="Convert AVI to MP4"
      runIcon="FileVideo"
      resultTitle="Your MP4 video"
      progressLabel="Encoding H.264"
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // The first real run pulls the ~31MB WASM core once; flag it for the UI
        // until ffmpeg starts reporting encode progress.
        onEngineLoading(true);
        const handleProgress = (p: number) => {
          // ffmpeg reports progress once it's running → engine has loaded.
          onEngineLoading(false);
          onProgress(Math.min(1, Math.max(0, p)));
        };

        let result;
        try {
          result = await convertFormat(file, "mp4", handleProgress);
        } catch (err) {
          onEngineLoading(false);
          throw new Error(
            err instanceof Error && err.message
              ? `Couldn't convert this file to MP4. ${err.message}`
              : "Couldn't convert this file to MP4. The codec inside the AVI may be unusual. Try a standard DivX/Xvid AVI.",
          );
        }

        onEngineLoading(false);
        if (signal.aborted) {
          // Surfaced as a cancel by the workspace; return a benign shape.
          throw new DOMException("Aborted", "AbortError");
        }
        if (!result.ok) throw new Error(result.error);

        return {
          blob: result.blob,
          filename: result.outName,
          kind: "video",
        };
      }}
    >
      {({ file }) => {
        const srcExt = currentExt(file.name);
        const notAvi = srcExt !== "" && srcExt !== "avi";

        return (
          <div className="flex flex-col gap-5">
            {notAvi && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This is a .{srcExt} file, not an AVI. It&apos;ll still be transcoded to
                  H.264/AAC MP4 here, but the general Video Converter is a better fit for
                  non-AVI sources and lets you pick the target format.
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
                  MP4 · H.264
                </dd>
              </div>
            </dl>

            {/* What the transcode does - plain-language, honest */}
            <ul className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                <span>
                  Legacy DivX/Xvid/MJPEG video is re-encoded to H.264 (yuv420p) so
                  phones, browsers and editors decode it natively.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                <span>Audio is converted to AAC, the standard MP4 audio codec.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                <span>
                  The MP4 is written with +faststart, so it begins playing instantly on
                  the web instead of buffering the whole file first.
                </span>
              </li>
            </ul>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Conversion runs in your browser via FFmpeg (WebAssembly): short clips are
                quick, while large, lightly-compressed AVIs take real time and are
                memory-bound. Nothing is uploaded.
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
