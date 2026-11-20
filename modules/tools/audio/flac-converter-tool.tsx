"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioWorkspace,
  AudioPlayer,
  decodeAudio,
  computePeaks,
  formatBytes,
  formatDuration,
  describeAudio,
  type AudioMeta,
  type Peaks,
} from "@/components/tool/audio";
import { convertAudio, detectFormat } from "@/lib/audio-tools/convert";

/**
 * FLAC Converter: the lossless "Convert" tool of the audio toolkit. Composes the
 * shared {@link AudioWorkspace} (dropzone → options → run → progress → result +
 * download + reset) with a source waveform preview and hands the file to the
 * engine's {@link convertAudio} router with target `"flac"`.
 *
 * FLAC is ALWAYS an exotic target: every conversion decodes natively (Web Audio)
 * then transcodes through the shared ffmpeg.wasm core, whose ~31 MB core loads
 * on demand the first time and is cached for the session. So `onEngineLoading`
 * is flagged for every run.
 *
 * Honest by design: FLAC is lossless relative to what it's given, a lossy MP3
 * source can't be made lossless again, and the resulting FLAC is usually LARGER
 * than the MP3. The UI surfaces exactly that per source. Nothing is uploaded.
 * TS strict + noUncheckedIndexedAccess clean.
 */

/** Source extension, lowercased, for display + the lossless/lossy note. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

/** Lossy source formats: converting these to FLAC can't restore quality. */
const LOSSY_FORMATS = new Set(["mp3", "m4a", "aac", "ogg"]);

export default function FlacConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  // Source waveform preview, keyed on the current file so it resets on new drop.
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = React.useState<Peaks | null>(null);
  const previewKeyRef = React.useRef<string>("");

  const loadPreview = React.useCallback((file: File) => {
    const key = `${file.name}:${file.size}`;
    if (previewKeyRef.current === key) return;
    previewKeyRef.current = key;
    setBuffer(null);
    setPeaks(null);
    decodeAudio(file)
      .then((buf) => {
        // Ignore if the user swapped files while decoding.
        if (previewKeyRef.current !== key) return;
        setBuffer(buf);
        setPeaks(computePeaks(buf, 900));
      })
      .catch(() => {
        /* Non-fatal: the workspace still handles decode errors on run. */
      });
  }, []);

  return (
    <AudioWorkspace
      runLabel="Convert to FLAC"
      runIcon="FileAudio"
      resultTitle="Your FLAC"
      progressLabel="Encoding FLAC…"
      softMaxMB={400}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // FLAC always transcodes through the on-device ffmpeg core, so flag the
        // one-time engine load for every conversion.
        onEngineLoading(true);

        const blob = await convertAudio(file, "flac", {}, (p) => {
          // Any reported progress means the core is loaded and work has started.
          onEngineLoading(false);
          onProgress(p);
        });

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        return { blob, filename: `${base}-gigai.flac` };
      }}
    >
      {({ file, meta }) => {
        // Kick off (or reuse) the waveform preview for this file.
        loadPreview(file);

        const ext = sourceExt(file);
        const fmt = detectFormat(file);
        const label = (ext || fmt || "audio").toUpperCase();
        const isLossy = fmt !== null && LOSSY_FORMATS.has(fmt);
        const alreadyFlac = fmt === "flac";

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
                <dt className="text-xs text-muted-foreground">Sample rate</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {(meta.sampleRate / 1000).toFixed(1)} kHz
                </dd>
              </div>
            </dl>

            <p className="sr-only">{describeAudio(meta)}</p>

            {/* Waveform preview + player */}
            <section className="flex flex-col gap-2" aria-label="Source preview">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="AudioLines" size={15} className={style.text} />
                Source preview
              </div>
              {buffer ? (
                <AudioPlayer
                  blob={file}
                  buffer={buffer}
                  peaks={peaks}
                  waveHeight={88}
                />
              ) : (
                <div
                  className="flex h-[88px] items-center justify-center rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground"
                  role="status"
                >
                  <Icon name="Loader" size={14} className="mr-2 animate-spin" />
                  Reading waveform…
                </div>
              )}
            </section>

            {/* Lossless / lossy honesty note (per source) */}
            <p
              className={cn(
                "flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed",
                isLossy
                  ? "border-border bg-muted/30 text-muted-foreground"
                  : cn(style.border, style.soft, "text-foreground"),
              )}
            >
              <Icon
                name={isLossy ? "Info" : "ShieldCheck"}
                size={14}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              <span>
                {alreadyFlac ? (
                  <>
                    This file is already FLAC. Re-encoding keeps it lossless and can
                    normalise the container, but it won&rsquo;t shrink further in any
                    meaningful way: the audio is already stored bit-for-bit.
                  </>
                ) : isLossy ? (
                  <>
                    Heads up: {label} is a <strong>lossy</strong> format. Converting it to
                    FLAC gives you a lossless container of the already-compressed audio  -
                    it can&rsquo;t restore detail {label} discarded, and the FLAC will
                    usually be <em>larger</em> than the source. Great when a player needs
                    FLAC; not a way to recover quality.
                  </>
                ) : (
                  <>
                    {label} is lossless, so your FLAC will be <strong>bit-perfect</strong>{" "}
                    - identical audio, typically 40–60% smaller than the WAV. This is
                    exactly the source FLAC is made for.
                  </>
                )}
              </span>
            </p>

            {/* Engine honesty note */}
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Cpu" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
              <span>
                FLAC encoding runs on an on-device ffmpeg core (~31 MB) that loads once
                the first time you convert, then stays cached for the session. Your audio
                is decoded and encoded entirely on your machine. Nothing is uploaded.
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
