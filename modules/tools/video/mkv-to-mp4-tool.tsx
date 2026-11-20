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
 * MKV to MP4, a single-purpose converter that turns a Matroska (.mkv) file into
 * a universally-playable MP4 in the browser. It drives a CUSTOM ffmpeg pipeline
 * via {@link run} (rather than the generic `convertFormat`) so it can expose the
 * two paths that actually matter for MKV→MP4:
 *
 *  • REMUX (default): `-c copy -movflags +faststart`, copy the existing video
 *    and audio streams straight into an MP4 container. No decode, no re-encode:
 *    lossless, same size, and fast enough that a full movie can finish in
 *    seconds. Works whenever the inner codecs (usually H.264 + AAC) are ones MP4
 *  can carry, the common case.
 *
 *  • RE-ENCODE (fallback): transcode video to H.264 and audio to AAC. Needed
 *    when the MKV holds a codec MP4 can't hold (FLAC/Vorbis audio, exotic or
 *    10-bit video). Slower and CPU-bound, with a small quality hit, but far more
 *    compatible.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset. This component is just the
 * mode form + `onRun`. Honest by design: a remux is lossless and quick, a
 * re-encode in single-threaded WASM ffmpeg is heavy, browsers can't decode every
 * exotic MKV stream, and nothing is ever uploaded.
 */

type Mode = "remux" | "reencode";

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

export default function MkvToMp4Tool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [mode, setMode] = React.useState<Mode>("remux");

  return (
    <VideoWorkspace
      accept="video/x-matroska,.mkv,video/*"
      softMaxMB={2000}
      runLabel="Convert to MP4"
      runIcon="FileVideo"
      resultTitle="Your MP4 video"
      progressLabel={mode === "remux" ? "Remuxing to MP4" : "Re-encoding to H.264"}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // The first real run pulls the ~31MB WASM core once; flag it for the UI
        // until ffmpeg starts reporting progress.
        onEngineLoading(true);
        let started = false;

        const { fetchFile } = await import("@ffmpeg/util");
        const data = await fetchFile(file);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const srcExt = currentExt(file.name) || "mkv";
        const inName = `in.${srcExt}`;
        const outName = `${baseName(file.name)}.mp4`;

        // REMUX: copy streams verbatim into an MP4 shell, lossless, fast.
        // RE-ENCODE: transcode to H.264/AAC for maximum compatibility.
        const args =
          mode === "remux"
            ? [
                "-i", inName,
                "-c", "copy",
                // MKV can hold subtitle/data streams MP4 chokes on. Keep A/V only.
                "-map", "0:v:0",
                "-map", "0:a?",
                "-movflags", "+faststart",
                outName,
              ]
            : [
                "-i", inName,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-pixel_format", "yuv420p",
                "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-c:a", "aac",
                "-b:a", "128k",
                "-map", "0:v:0",
                "-map", "0:a?",
                "-movflags", "+faststart",
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
            "video/mp4",
          );
        } catch (err) {
          onEngineLoading(false);
          const detail = err instanceof Error && err.message ? ` ${err.message}` : "";
          throw new Error(
            mode === "remux"
              ? `Couldn't remux this MKV into MP4: its codecs may not fit an MP4 container. Switch to Re-encode mode for maximum compatibility.${detail}`
              : `Couldn't re-encode this file to MP4. The video or audio inside may be an unusual codec the browser can't decode.${detail}`,
          );
        }

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        // A "successful" remux can still yield an oddly tiny file if no A/V
        // stream mapped, surface that as an actionable error rather than a
        // broken download.
        if (blob.size < 1024) {
          throw new Error(
            "The converted file came back empty. This MKV's streams likely can't be copied into MP4. Try Re-encode mode instead.",
          );
        }

        return {
          blob,
          filename: outName,
          kind: "video",
        };
      }}
    >
      {({ file, busy }) => {
        const srcExt = currentExt(file.name);
        const notMkv = srcExt !== "" && srcExt !== "mkv";

        return (
          <div className="flex flex-col gap-5">
            {/* Conversion mode */}
            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="Settings2" size={15} className={style.text} />
                Conversion mode
              </legend>

              <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Conversion mode">
                <ModeCard
                  active={mode === "remux"}
                  disabled={busy}
                  onSelect={() => setMode("remux")}
                  icon="Zap"
                  title="Fast remux"
                  badge="Lossless"
                  description="Copies the video and audio untouched into an MP4 shell. No quality loss, often done in seconds. Best for standard MKVs."
                  style={style}
                />
                <ModeCard
                  active={mode === "reencode"}
                  disabled={busy}
                  onSelect={() => setMode("reencode")}
                  icon="RefreshCw"
                  title="Re-encode"
                  badge="Max compat"
                  description="Transcodes to H.264 + AAC for maximum compatibility. Slower and CPU-heavy: use it if the remux plays silent or fails."
                  style={style}
                />
              </div>
            </fieldset>

            {notMkv && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This is a .{srcExt} file, not an MKV. It&apos;ll still be converted to
                  MP4 here, but the general Video Converter is a better fit for
                  non-MKV sources.
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
                  MP4 {mode === "remux" ? "· copy" : "· H.264"}
                </dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                {mode === "remux" ? (
                  <>
                    A remux copies your existing streams into MP4, it&apos;s lossless
                    and fast because nothing is re-encoded. If the result plays
                    silent or won&apos;t play, the inner codec isn&apos;t MP4-friendly;
                    switch to Re-encode. Runs in FFmpeg (WebAssembly) on your
                    device. Nothing is uploaded.
                  </>
                ) : (
                  <>
                    Re-encoding runs H.264 in FFmpeg (WebAssembly) on your device  -
                    it&apos;s CPU-heavy, so short clips are quick and long or high-res
                    ones take real time. It&apos;s the compatibility safety net when a
                    remux can&apos;t carry a track. Nothing is uploaded.
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

/** A selectable conversion-mode card (acts as a radio option). */
function ModeCard({
  active,
  disabled,
  onSelect,
  icon,
  title,
  badge,
  description,
  style,
}: {
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  badge: string;
  description: string;
  style: ReturnType<typeof accentStyle>;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        style.ring,
        active
          ? cn("border-transparent ring-2", style.soft, style.ring)
          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name={icon} size={15} className={active ? style.text : "text-muted-foreground"} />
          {title}
        </span>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active ? style.soft : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
    </button>
  );
}

// Kept explicit so a future change to the workspace render-arg shape fails
// loudly here rather than silently drifting.
export type { VideoMeta };
