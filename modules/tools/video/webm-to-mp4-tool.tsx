"use client";

import * as React from "react";

import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import { formatBytes, type VideoMeta } from "@/components/tool/video/media-utils";
import { convertFormat } from "@/lib/video-tools/operations";

/**
 * WebM to MP4: a single-purpose converter that re-encodes a VP8/VP9 WebM into a
 * universally compatible H.264/AAC MP4 entirely in the browser. It drives the
 * generic {@link convertFormat} operation with target "mp4"; there are no dials
 * to fumble because the point of this tool is compatibility, not tuning, the
 * op targets a quality-preserving H.264 encode by default.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, in-page preview, before/after size delta, download and
 * reset. This component is just a compatibility summary + `onRun`. Honest by
 * design: H.264 in single-threaded WASM ffmpeg is slower than native, and this
 * is a re-encode between two lossy codecs (VP9 → H.264), not a lossless rewrap.
 * Nothing is ever uploaded.
 */

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

export default function WebmToMp4Tool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  return (
    <VideoWorkspace
      accept="video/webm,.webm,video/*"
      softMaxMB={400}
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
        if (signal.aborted) {
          // The workspace ignores aborted runs; return a benign value.
          return { blob: new Blob(), kind: "video" as const };
        }

        if (!result.ok) {
          throw new Error(
            result.error ||
              "Couldn't convert this file to MP4. The codec inside may be unusual. Try a standard VP8/VP9 WebM.",
          );
        }

        return {
          blob: result.blob,
          filename: `${baseName(file.name)}.mp4`,
          kind: "video" as const,
        };
      }}
    >
      {({ file, busy }) => {
        void busy;
        const srcExt = currentExt(file.name);
        const notWebm = srcExt !== "" && srcExt !== "webm";

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
                <dd className={`text-sm font-semibold uppercase ${style.text}`}>
                  MP4 · H.264
                </dd>
              </div>
            </dl>

            {notWebm && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This is a .{srcExt} file, not a WebM. It&apos;ll still be transcoded to
                  H.264/MP4 here, but the general Video Converter is a better fit for
                  non-WebM sources.
                </span>
              </p>
            )}

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                H.264 encodes in FFmpeg (WebAssembly) on your device, short clips
                are quick, long or high-res ones take real time. This is a re-encode
                between two lossy codecs (VP9 → H.264), so a little detail can be
                lost, but MP4 plays on iPhones, in editors, on TVs and in slide decks
                where WebM won&apos;t. Nothing is uploaded.
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
