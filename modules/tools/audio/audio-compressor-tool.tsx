"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioWorkspace,
  Waveform,
  computePeaks,
  decodeAudio,
  describeAudio,
  formatBytes,
  formatDuration,
  type AudioMeta,
  type Peaks,
} from "@/components/tool/audio";
import { renderOffline } from "@/lib/audio-tools/context";
import { encodeMp3 } from "@/lib/audio-tools/encode";
import { MP3_BITRATES } from "@/lib/audio-tools/convert";

/**
 * Audio Compressor, the "make this smaller" tool of the audio toolkit. Composes
 * the shared {@link AudioWorkspace} (dropzone → options → run → progress → result
 * + download + reset) with a bitrate picker and a sample-rate picker, then runs
 * a fully native, upload-free pipeline:
 *
 *   decode (Web Audio) → optional offline resample → lamejs MP3 encode.
 *
 * MP3 output only: it's the format that pairs the smallest size with universal
 * playback, and its CBR bitrate maps almost linearly to file weight. NO ffmpeg
 * is ever loaded (native path only), so `onEngineLoading` is never called.
 *
 * Honest by design: compression discards detail, downsampling removes treble you
 * can't recover, and re-compressing an already-lossy source only loses a little
 * more. The workspace shows the exact before/after size. TS strict +
 * noUncheckedIndexedAccess clean.
 */

/** Bitrate presets come from the engine (96…320). 128 is a strong default shrink. */
const DEFAULT_BITRATE = 128;

/** One honest size/quality line per bitrate for the picker. */
const BITRATE_HINTS: Record<number, string> = {
  96: "Tiniest: voice only",
  128: "Small: great all-round",
  160: "Lean, still musical",
  192: "Balanced for music",
  256: "Light compression",
  320: "Minimal size saving",
};

function bitrateLabel(kbps: number): string {
  if (kbps >= 320) return "Maximum";
  if (kbps >= 256) return "High";
  if (kbps >= 192) return "Balanced";
  if (kbps >= 128) return "Small";
  return "Smallest";
}

/**
 * Sample-rate choices. `null` = keep the source rate (best for music). Lower
 * rates strip high frequencies but shrink voice further. Values are guarded at
 * run time against the source rate so we never *upsample*.
 */
interface RateOption {
  /** Target sample rate in Hz, or `null` to keep the original. */
  value: number | null;
  label: string;
  hint: string;
}

const RATE_OPTIONS: readonly RateOption[] = [
  { value: null, label: "Original", hint: "Keep source: best for music" },
  { value: 22050, label: "22.05 kHz", hint: "Great for voice, smaller" },
  { value: 16000, label: "16 kHz", hint: "Smallest, speech only" },
] as const;

/** Source extension, lowercased, for display. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

/**
 * Resample a buffer to `targetRate` via an offline render. Returns the input
 * unchanged when the target is null or not below the source rate (never
 * upsamples. That would grow the file for no benefit).
 */
async function resampleTo(
  buffer: AudioBuffer,
  targetRate: number | null,
): Promise<AudioBuffer> {
  if (targetRate === null || targetRate >= buffer.sampleRate) return buffer;
  const ratio = targetRate / buffer.sampleRate;
  const length = Math.max(1, Math.round(buffer.length * ratio));
  return renderOffline(buffer.numberOfChannels, length, targetRate, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.start(0);
    return src;
  });
}

/**
 * Waveform + metadata preview for the loaded file. Decodes once (keyed on the
 * file identity by the parent) and computes a static min/max envelope; failures
 * fall back to just the metadata row so the tool still works.
 */
function SourcePreview({
  file,
  meta,
  color,
}: {
  file: File;
  meta: AudioMeta;
  color: string;
}) {
  const [peaks, setPeaks] = React.useState<Peaks | null>(null);

  React.useEffect(() => {
    let alive = true;
    decodeAudio(file)
      .then((buffer) => {
        if (alive) setPeaks(computePeaks(buffer, 1200));
      })
      .catch(() => {
        /* metadata-only fallback, the run path still decodes independently */
      });
    return () => {
      alive = false;
    };
  }, [file]);

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Source</dt>
          <dd className="text-sm font-semibold uppercase text-foreground">
            {sourceExt(file) || "audio"}
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
          <dt className="text-xs text-muted-foreground">Rate</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {(meta.sampleRate / 1000).toFixed(1).replace(/\.0$/, "")} kHz
          </dd>
        </div>
      </dl>

      {peaks && (
        <Waveform
          peaks={peaks}
          color={color}
          height={80}
          aria-label={`Waveform of ${file.name}`}
        />
      )}
      <p className="sr-only">{describeAudio(meta)}</p>
    </div>
  );
}

export default function AudioCompressorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [bitrate, setBitrate] = React.useState<number>(DEFAULT_BITRATE);
  const [rate, setRate] = React.useState<number | null>(null);

  return (
    <AudioWorkspace
      runLabel="Compress audio"
      runIcon="Minimize2"
      resultTitle="Compressed audio"
      progressLabel="Compressing…"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, signal }) => {
        // Native path only. No ffmpeg, so onEngineLoading is intentionally
        // never called (no 31 MB download for compression).
        const decoded = await decodeAudio(file);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const resampled = await resampleTo(decoded, rate);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const blob = await encodeMp3(resampled, { bitrate }, (p) => onProgress(p));
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        return { blob, filename: `${base}-compressed.mp3` };
      }}
    >
      {({ file, meta, busy }) => {
        // Downsampling below the source rate is what actually saves extra bytes;
        // a target at/above the source is a no-op (we never upsample).
        const effectiveRate =
          rate !== null && rate < meta.sampleRate ? rate : null;

        return (
          <div className="flex flex-col gap-5">
            <SourcePreview file={file} meta={meta} color={style.hex[0]} />

            {/* Bitrate picker */}
            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="flex items-center justify-between gap-3 pb-1">
                <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  Bitrate
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {bitrateLabel(bitrate)} · {bitrate} kbps
                </span>
              </legend>
              <div
                role="radiogroup"
                aria-label="MP3 bitrate"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {MP3_BITRATES.map((kbps) => {
                  const active = kbps === bitrate;
                  return (
                    <button
                      key={kbps}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => setBitrate(kbps)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        active
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          active ? style.text : "text-foreground",
                        )}
                      >
                        {kbps} kbps
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {BITRATE_HINTS[kbps] ?? "Constant bitrate"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Sample-rate picker */}
            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="flex items-center justify-between gap-3 pb-1">
                <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                  <Icon name="AudioWaveform" size={15} className={style.text} />
                  Sample rate
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {effectiveRate === null
                    ? "Original"
                    : `${(effectiveRate / 1000).toFixed(2).replace(/\.?0+$/, "")} kHz`}
                </span>
              </legend>
              <div
                role="radiogroup"
                aria-label="Output sample rate"
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {RATE_OPTIONS.map((opt) => {
                  const active = rate === opt.value;
                  // Flag a chosen target that isn't below the source (no effect).
                  const noEffect =
                    opt.value !== null && opt.value >= meta.sampleRate;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => setRate(opt.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        active
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          active ? style.text : "text-foreground",
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {noEffect ? "Above source. No change" : opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Honesty note - native, lossy, private */}
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Zap" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
              <span>
                Compression runs entirely on your device: decode with the Web
                Audio API{effectiveRate !== null ? ", resample offline," : ""} then
                encode to MP3 in-browser with lamejs, no engine download. It&rsquo;s
                lossy: a lower bitrate{effectiveRate !== null ? " and rate" : ""}{" "}
                makes the file smaller by discarding detail you can&rsquo;t get back.
                Nothing is uploaded.
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
