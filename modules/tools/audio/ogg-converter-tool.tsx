"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioWorkspace,
  AudioPlayer,
  formatBytes,
  formatDuration,
  describeAudio,
  decodeAudio,
  type AudioMeta,
} from "@/components/tool/audio";
import { convertAudio, detectFormat } from "@/lib/audio-tools/convert";

/**
 * OGG Converter, the "Convert" tool that turns any decodable audio into OGG
 * Vorbis. Composes the shared {@link AudioWorkspace} (dropzone → options → run →
 * progress → result + download + reset) with a source waveform preview and hands
 * the file to the engine's {@link convertAudio} router.
 *
 * OGG is NOT a native browser encode target, so this path is always:
 *   decode natively (Web Audio) → lossless WAV → shared ffmpeg.wasm core
 *   (`-c:a libvorbis`) transcodes to .ogg.
 *
 * The 31 MB WebAssembly core loads once per session (only for exotic targets
 * like this one) and is cached thereafter; the transcode runs on-device, nothing
 * is uploaded. The engine encodes Vorbis at its default quality with no exposed
 * bitrate/quality knob, so, being honest by design, this UI does NOT show a
 * fake quality control. TS strict + noUncheckedIndexedAccess clean.
 */

/** Source extension, lowercased, for display. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

/** Inner preview: decodes the source once for the waveform player. */
function SourcePreview({ file }: { file: File }) {
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);

  React.useEffect(() => {
    let alive = true;
    setBuffer(null);
    decodeAudio(file)
      .then((b) => {
        if (alive) setBuffer(b);
      })
      .catch(() => {
        /* preview is best-effort; the convert path surfaces real errors */
      });
    return () => {
      alive = false;
    };
  }, [file]);

  if (!buffer) return null;
  return (
    <AudioPlayer
      blob={file}
      buffer={buffer}
      waveHeight={88}
      className="rounded-lg border border-border bg-muted/20 p-2"
    />
  );
}

export default function OggConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  return (
    <AudioWorkspace
      runLabel="Convert to OGG"
      runIcon="FileAudio"
      resultTitle="Your OGG"
      progressLabel="Encoding OGG Vorbis…"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // OGG is never native, always decode + ffmpeg (libvorbis). Flag the
        // one-time core download so the UI can show its loading state.
        onEngineLoading(true);

        const blob = await convertAudio(file, "ogg", {}, (p) => {
          // Any reported progress means transcode has started → core is loaded.
          onEngineLoading(false);
          onProgress(p);
        });

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        return { blob, filename: `${base}-gigai.ogg` };
      }}
    >
      {({ file, meta }) => {
        const ext = sourceExt(file);
        const fmt = detectFormat(file);
        const alreadyOgg = fmt === "ogg";

        return (
          <div className="flex flex-col gap-5">
            {/* Source summary */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="text-sm font-semibold uppercase text-foreground">
                  {ext || fmt || "audio"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Size</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBytes(file.size)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatDuration(meta.duration)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Channels</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {meta.channels > 1 ? "Stereo" : "Mono"}
                </dd>
              </div>
            </dl>

            <p className="sr-only">{describeAudio(meta)}</p>

            {/* Source waveform preview */}
            <SourcePreview file={file} />

            {/* Already-OGG note */}
            {alreadyOgg && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This file is already an OGG. Re-encoding is useful to standardise
                  or re-wrap the file, but it can&rsquo;t improve quality. Vorbis is
                  lossy, so a second pass can only lose a little more detail.
                </span>
              </p>
            )}

            {/* On-demand codec + Vorbis honesty */}
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Cpu" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
              <span>
                OGG can&rsquo;t be encoded natively in the browser, so this
                {" "}
                {(ext || fmt || "file").toUpperCase()} decodes with the Web Audio API,
                then a one-time on-demand codec transcodes it to OGG Vorbis
                (open, royalty-free, and usually smaller than MP3 at the same
                quality). The codec downloads once per session; the transcode runs
                on your device and nothing is uploaded. Vorbis is lossy, so start
                from a lossless WAV or FLAC for the cleanest result.
              </span>
            </p>
          </div>
        );
      }}
    </AudioWorkspace>
  );
}

// Kept explicit so a future change to the workspace render-arg signature fails
// loudly here rather than silently drifting.
export type { AudioMeta };
