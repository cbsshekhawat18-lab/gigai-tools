"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioDropzone,
  AudioResult,
  Waveform,
  decodeAudio,
  describeAudio,
  formatDuration,
  type AudioMeta,
} from "@/components/tool/audio";
import { ErrorBanner } from "@/components/tool/dev/error-banner";
import { normalize, gainToDb } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

/**
 * Audio Normalizer, the flagship interactive audio tool and the showcase for
 * the native Web Audio engine. Drop a clip, pick Peak (maximise headroom) or RMS
 * (lift perceived loudness) plus a dBFS target, and `process.normalize`
 * re-levels the whole buffer on-device in a single pass. The result is shown as
 * a stacked before/after waveform with measured peak & RMS, a preview player,
 * and a WAV / in-browser-MP3 download.
 *
 * 100% in-browser: decode, measure, re-level and encode all happen on the
 * device. No ffmpeg, no upload. Honest by design: this is single-gain peak/RMS
 * normalisation, not LUFS loudness matching, and it can't un-clip a hot source.
 */

type Mode = "peak" | "rms";
type OutFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Target ceiling in dBFS; ≤ 0. −1 is the safe, transparent default. */
const TARGET_MIN = -12;
const TARGET_MAX = 0;
const TARGET_DEFAULT = -1;

interface Measure {
  peak: number;
  rms: number;
}

/** Measure peak (max |sample|) and RMS across every channel of a buffer. */
function measure(buffer: AudioBuffer): Measure {
  let peak = 0;
  let sumSquares = 0;
  let count = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const s = data[i] ?? 0;
      const a = s < 0 ? -s : s;
      if (a > peak) peak = a;
      sumSquares += s * s;
    }
    count += data.length;
  }
  const rms = count === 0 ? 0 : Math.sqrt(sumSquares / count);
  return { peak, rms };
}

/** Format a linear amplitude as a dBFS string, e.g. 0.5 → "−6.0 dBFS". */
function dbfs(amp: number): string {
  if (amp <= 1e-8) return "−∞ dBFS";
  const db = gainToDb(amp);
  const rounded = db.toFixed(1);
  // Use a real minus sign for the negative values normalisation deals in.
  return `${rounded.startsWith("-") ? rounded.replace("-", "−") : rounded} dBFS`;
}

type Phase = "idle" | "ready" | "processing" | "done";

interface Output {
  blob: Blob;
  filename: string;
  after: Measure;
}

export default function AudioNormalizerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<AudioMeta | null>(null);
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [before, setBefore] = React.useState<Measure | null>(null);

  const [mode, setMode] = React.useState<Mode>("peak");
  const [target, setTarget] = React.useState(TARGET_DEFAULT);
  const [format, setFormat] = React.useState<OutFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [progress, setProgress] = React.useState(-1);
  const [output, setOutput] = React.useState<Output | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const busy = phase === "processing";

  const handleFile = React.useCallback(async (f: File, m: AudioMeta) => {
    setError(null);
    setOutput(null);
    setFile(f);
    setMeta(m);
    setPhase("ready");
    setBuffer(null);
    setBefore(null);
    try {
      const decoded = await decodeAudio(f);
      setBuffer(decoded);
      setBefore(measure(decoded));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decode that audio.");
    }
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setBuffer(null);
    setBefore(null);
    setOutput(null);
    setError(null);
    setPhase("idle");
    setProgress(-1);
  }, []);

  const clearResult = React.useCallback(() => {
    setOutput(null);
    setProgress(-1);
    setError(null);
    setPhase(file ? "ready" : "idle");
  }, [file]);

  const run = React.useCallback(async () => {
    if (!buffer || !file) return;
    setError(null);
    setProgress(-1);
    setPhase("processing");
    try {
      // Re-level the whole buffer in one native pass (no ffmpeg, no upload).
      const normalized = normalize(buffer, { targetDb: target, mode });
      const after = measure(normalized);

      let blob: Blob;
      let ext: string;
      if (format === "mp3") {
        blob = await encodeMp3(normalized, { bitrate }, (p) => setProgress(p));
        ext = "mp3";
      } else {
        setProgress(-1);
        blob = encodeWav(normalized);
        ext = "wav";
      }

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";
      setOutput({ blob, filename: `${base}-normalized.${ext}`, after });
      setPhase("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Normalisation failed. Try a smaller file.",
      );
      setPhase("ready");
    } finally {
      setProgress(-1);
    }
  }, [buffer, file, target, mode, format, bitrate]);

  const inputId = React.useId();

  return (
    <div className="flex flex-col gap-4">
      <AudioDropzone
        onFile={handleFile}
        softMaxMB={200}
        disabled={busy}
        file={file}
        meta={meta}
        onClear={busy ? undefined : reset}
      />

      {file && meta && phase !== "done" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-5">
            {/* Original waveform + measured level */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon name="AudioLines" size={15} className={style.text} />
                  Original
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatDuration(meta.duration)} · {describeAudio(meta)}
                </span>
              </div>
              <Waveform
                buffer={buffer}
                height={80}
                aria-label="Original audio waveform"
              />
              {before && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Peak{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {dbfs(before.peak)}
                    </span>
                  </span>
                  <span>
                    RMS{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {dbfs(before.rms)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Mode */}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="Gauge" size={15} className={style.text} />
                Normalisation mode
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "peak" as const,
                      title: "Peak",
                      hint: "Loudest sample hits the ceiling: transparent, no clipping.",
                    },
                    {
                      value: "rms" as const,
                      title: "RMS",
                      hint: "Lift average energy so it feels louder (peaks hard-limited).",
                    },
                  ]
                ).map((opt) => {
                  const active = mode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={busy}
                      onClick={() => setMode(opt.value)}
                      aria-pressed={active}
                      className={cn(
                        "flex flex-col gap-1 rounded-md border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        active
                          ? cn(style.border, style.soft)
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        {active && <Icon name="Check" size={14} className={style.text} />}
                        {opt.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Target ceiling */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`${inputId}-target`}
                  className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                >
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  Target ceiling
                </label>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {target === 0 ? "0" : `−${Math.abs(target)}`} dBFS
                </span>
              </div>
              <input
                id={`${inputId}-target`}
                type="range"
                min={TARGET_MIN}
                max={TARGET_MAX}
                step={0.5}
                value={target}
                disabled={busy}
                onChange={(e) => setTarget(Number(e.target.value))}
                aria-label="Target ceiling in dBFS"
                aria-valuetext={`${target === 0 ? "0" : `minus ${Math.abs(target)}`} dBFS`}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-rose-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>−12 dBFS (more headroom)</span>
                <span>0 dBFS (full scale)</span>
              </div>
            </div>

            {/* Output format */}
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="FileAudio" size={15} className={style.text} />
                Output format
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md border border-border p-0.5">
                  {(["wav", "mp3"] as const).map((f) => {
                    const active = format === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        disabled={busy}
                        onClick={() => setFormat(f)}
                        aria-pressed={active}
                        className={cn(
                          "rounded px-3 py-1.5 text-xs font-semibold uppercase outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
                {format === "mp3" && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Bitrate
                    <select
                      value={bitrate}
                      disabled={busy}
                      onChange={(e) => setBitrate(Number(e.target.value))}
                      aria-label="MP3 bitrate"
                      className={cn(
                        "rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:ring-2",
                        style.ring,
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      )}
                    >
                      {MP3_BITRATES.map((b) => (
                        <option key={b} value={b}>
                          {b} kbps
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <span className="text-xs text-muted-foreground">
                  {format === "wav"
                    ? "Lossless 16-bit PCM: best for further editing."
                    : "Smaller share-ready file, encoded in your browser."}
                </span>
              </div>
            </div>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Peak/RMS normalisation applies one gain to level the whole track, it&apos;s
                not LUFS loudness matching and can&apos;t un-clip a source recorded too hot.
                Everything runs in your browser; nothing is uploaded.
              </span>
            </p>

            <div className="flex items-center justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={run}
                disabled={busy || !buffer}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name={busy ? "Loader" : "Gauge"} size={16} className={busy ? "animate-spin" : ""} />
                {busy
                  ? format === "mp3"
                    ? "Encoding MP3…"
                    : "Normalising…"
                  : "Normalize audio"}
              </button>
            </div>

            {busy && format === "mp3" && progress >= 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {output && phase === "done" && (
        <div className="flex flex-col gap-4">
          {/* Before / after level comparison */}
          {before && (
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
              <Stat label="Peak before" value={dbfs(before.peak)} />
              <Stat label="Peak after" value={dbfs(output.after.peak)} highlight={style.text} />
              <Stat label="RMS before" value={dbfs(before.rms)} />
              <Stat label="RMS after" value={dbfs(output.after.rms)} highlight={style.text} />
            </div>
          )}

          {/* Stacked before → after waveforms */}
          <div className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Before</span>
              <Waveform buffer={buffer} height={72} aria-label="Original waveform" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={cn("text-xs font-medium", style.text)}>After (normalised)</span>
              <NormalizedWave blob={output.blob} height={72} />
            </div>
          </div>

          <AudioResult
            blob={output.blob}
            filename={output.filename}
            originalSize={file?.size}
            title="Normalised audio"
            onReset={clearResult}
          />
        </div>
      )}
    </div>
  );
}

/** A compact labelled stat cell for the before/after level grid. */
function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums text-foreground", highlight)}>
        {value}
      </span>
    </div>
  );
}

/**
 * Decode the normalised output blob once so the "after" waveform draws the real
 * re-levelled envelope. Falls back to a flat track if the blob can't be decoded.
 */
function NormalizedWave({ blob, height }: { blob: Blob; height: number }) {
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    decodeAudio(blob)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch(() => {
        /* undecodable, Waveform renders a flat track */
      });
    return () => {
      cancelled = true;
    };
  }, [blob]);
  return <Waveform buffer={buffer} height={height} aria-label="Normalised waveform" />;
}
