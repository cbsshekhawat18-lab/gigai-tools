"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioDropzone,
  AudioResult,
  AudioPlayer,
  Waveform,
  decodeAudio,
  describeAudio,
  formatDuration,
  type AudioMeta,
} from "@/components/tool/audio";
import { ErrorBanner } from "@/components/tool/dev/error-banner";
import { boost, gainToDb } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

/**
 * Audio Volume Booster, increase (or reduce) a clip's loudness by an exact dB
 * amount with real clip protection, entirely in the browser. Drop a file, drag
 * the gain slider, and `process.boost` multiplies every sample by the chosen
 * gain (native Web Audio, one pass, no ffmpeg, no upload). The tool measures the
 * source's true peak up front so it can show the clean headroom available and,
 * with the guard on, cap any boost at the safe maximum; with the guard off it
 * hard-clamps overshoot and warns honestly that peaks were flattened.
 *
 * 100% in-browser: decode, measure, gain and encode all run on-device. Honest by
 * design. This is single-factor gain with safe clamping, not a compressor, a
 * loudness maximiser or a LUFS matcher, and it can't un-clip a hot source.
 */

type OutFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Gain slider bounds in dB. Negative reduces, positive boosts. */
const GAIN_MIN = -24;
const GAIN_MAX = 24;
const GAIN_DEFAULT = 6;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Peak (max |sample|) across every channel of a buffer. */
function measurePeak(buffer: AudioBuffer): number {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const s = data[i] ?? 0;
      const a = s < 0 ? -s : s;
      if (a > peak) peak = a;
    }
  }
  return peak;
}

/** Format a linear amplitude as a dBFS string, e.g. 0.5 → "−6.0 dBFS". */
function dbfs(amp: number): string {
  if (amp <= 1e-8) return "−∞ dBFS";
  return `${signed(gainToDb(amp))} dBFS`;
}

/** Render a dB number with a real ± sign, one decimal, e.g. -6 → "−6.0". */
function signed(db: number): string {
  const r = db.toFixed(1);
  if (r === "0.0" || r === "-0.0") return "0.0";
  return r.startsWith("-") ? r.replace("-", "−") : `+${r}`;
}

type Phase = "idle" | "ready" | "processing" | "done";

interface Output {
  blob: Blob;
  filename: string;
  appliedDb: number;
  afterPeak: number;
  clamped: boolean;
}

export default function AudioVolumeBoosterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<AudioMeta | null>(null);
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [srcPeak, setSrcPeak] = React.useState<number | null>(null);

  const [gain, setGain] = React.useState(GAIN_DEFAULT);
  const [preventClip, setPreventClip] = React.useState(true);
  const [format, setFormat] = React.useState<OutFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [progress, setProgress] = React.useState(-1);
  const [output, setOutput] = React.useState<Output | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const busy = phase === "processing";
  const inputId = React.useId();

  // Maximum clean gain (dB) before the source's peak hits 0 dBFS. null while we
  // don't yet have a decoded peak; +∞-ish (large) for effectively-silent tracks.
  const maxCleanDb = React.useMemo(() => {
    if (srcPeak === null) return null;
    if (srcPeak <= 1e-8) return GAIN_MAX; // silence: any boost stays "clean"
    return -gainToDb(srcPeak); // headroom = 0 dBFS − peak
  }, [srcPeak]);

  // The gain that will actually be applied once the clip guard is considered.
  const effectiveDb = React.useMemo(() => {
    if (!preventClip || maxCleanDb === null) return gain;
    if (gain <= 0) return gain; // cutting never clips
    return Math.min(gain, maxCleanDb);
  }, [gain, preventClip, maxCleanDb]);

  // True when the requested boost will be trimmed by the clip guard.
  const capped =
    preventClip &&
    maxCleanDb !== null &&
    gain > 0 &&
    gain > maxCleanDb + 1e-3;

  // True when we'll deliberately clamp peaks (guard off, pushing past headroom).
  const willClamp =
    !preventClip &&
    maxCleanDb !== null &&
    gain > maxCleanDb + 1e-3;

  const handleFile = React.useCallback(async (f: File, m: AudioMeta) => {
    setError(null);
    setOutput(null);
    setFile(f);
    setMeta(m);
    setPhase("ready");
    setBuffer(null);
    setSrcPeak(null);
    try {
      const decoded = await decodeAudio(f);
      setBuffer(decoded);
      setSrcPeak(measurePeak(decoded));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decode that audio.");
    }
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setBuffer(null);
    setSrcPeak(null);
    setOutput(null);
    setError(null);
    setPhase("idle");
    setProgress(-1);
    setGain(GAIN_DEFAULT);
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
      const appliedDb = effectiveDb;
      // Apply one gain to the whole buffer (native, hard-clamped to [-1, 1]).
      const boosted = boost(buffer, appliedDb);
      const afterPeak = measurePeak(boosted);
      // Peaks were flattened if the ideal (unclamped) peak would exceed 1.0.
      const idealPeak = (srcPeak ?? 0) * Math.pow(10, appliedDb / 20);
      const clamped = idealPeak > 1 + 1e-4;

      let blob: Blob;
      let ext: string;
      if (format === "mp3") {
        blob = await encodeMp3(boosted, { bitrate }, (p) => setProgress(p));
        ext = "mp3";
      } else {
        setProgress(-1);
        blob = encodeWav(boosted);
        ext = "wav";
      }

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";
      const tag = appliedDb >= 0 ? "louder" : "quieter";
      setOutput({
        blob,
        filename: `${base}-${tag}.${ext}`,
        appliedDb,
        afterPeak,
        clamped,
      });
      setPhase("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Boost failed. Try a smaller file.",
      );
      setPhase("ready");
    } finally {
      setProgress(-1);
    }
  }, [buffer, file, effectiveDb, srcPeak, format, bitrate]);

  const boosting = gain > 0;
  const cutting = gain < 0;

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
            {/* Source waveform + measured peak / headroom */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon name="AudioLines" size={15} className={style.text} />
                  Source
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatDuration(meta.duration)} · {describeAudio(meta)}
                </span>
              </div>
              <Waveform
                buffer={buffer}
                height={80}
                color="currentColor"
                aria-label="Source audio waveform"
              />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Peak{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {srcPeak === null ? "…" : dbfs(srcPeak)}
                  </span>
                </span>
                <span>
                  Clean headroom{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {maxCleanDb === null
                      ? "…"
                      : maxCleanDb >= GAIN_MAX
                        ? "plenty"
                        : `${signed(maxCleanDb)} dB`}
                  </span>
                </span>
              </div>
            </div>

            {/* Gain slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`${inputId}-gain`}
                  className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                >
                  <Icon
                    name={cutting ? "Volume1" : boosting ? "Volume2" : "Volume"}
                    size={15}
                    className={style.text}
                  />
                  {cutting ? "Reduce volume" : "Boost volume"}
                </label>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {signed(gain)} dB
                </span>
              </div>
              <input
                id={`${inputId}-gain`}
                type="range"
                min={GAIN_MIN}
                max={GAIN_MAX}
                step={0.5}
                value={gain}
                disabled={busy}
                onChange={(e) => setGain(clamp(Number(e.target.value), GAIN_MIN, GAIN_MAX))}
                aria-label="Volume change in decibels"
                aria-valuetext={`${signed(gain)} decibels`}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-amber-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>−24 dB (quieter)</span>
                <span>0 dB</span>
                <span>+24 dB (louder)</span>
              </div>
            </div>

            {/* Clip protection */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={preventClip}
                disabled={busy}
                onClick={() => setPreventClip((v) => !v)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  preventClip ? cn(style.border, style.soft) : "border-border hover:bg-muted/50",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon name="ShieldCheck" size={16} className={preventClip ? style.text : "text-muted-foreground"} />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Prevent clipping</span>
                    <span className="text-xs text-muted-foreground">
                      Cap the boost at the source&apos;s clean headroom so it can&apos;t distort.
                    </span>
                  </span>
                </span>
                <span
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                    preventClip ? style.solid : "bg-muted",
                  )}
                  aria-hidden
                >
                  <span
                    className={cn(
                      "inline-block size-4 translate-x-0.5 rounded-full bg-background shadow transition-transform",
                      preventClip && "translate-x-[1.125rem]",
                    )}
                  />
                </span>
              </button>

              {capped && (
                <p className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                  <span>
                    Your source only has {maxCleanDb === null ? "" : `${signed(maxCleanDb)} dB `}
                    of clean headroom, so the boost will be capped there -{" "}
                    <span className="font-medium text-foreground">{signed(effectiveDb)} dB</span>{" "}
                    will be applied instead of {signed(gain)} dB. Turn the guard off to push further.
                  </span>
                </p>
              )}

              {willClamp && (
                <p className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                  <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
                  <span>
                    Clip guard is off and {signed(gain)} dB exceeds the{" "}
                    {maxCleanDb === null ? "" : `${signed(maxCleanDb)} dB `}headroom - peaks will be
                    hard-clamped and may sound distorted. Turn the guard back on for a clean lift.
                  </span>
                </p>
              )}
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
                    ? "Lossless 16-bit PCM, best for further editing."
                    : "Smaller share-ready file, encoded in your browser."}
                </span>
              </div>
            </div>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Boosting applies one gain to the whole track. It raises hiss and noise along
                with the signal, isn&apos;t a compressor or LUFS loudness match, and can&apos;t un-clip a
                source recorded too hot. Everything runs in your browser; nothing is uploaded.
              </span>
            </p>

            <div className="flex items-center justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={run}
                disabled={busy || !buffer || srcPeak === null}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon
                  name={busy ? "Loader" : cutting ? "Volume1" : "Volume2"}
                  size={16}
                  className={busy ? "animate-spin" : ""}
                />
                {busy
                  ? format === "mp3"
                    ? "Boosting volume…"
                    : "Boosting volume…"
                  : cutting
                    ? "Reduce volume"
                    : "Boost volume"}
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
          {/* Before / after peak comparison */}
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-center">
            <Stat label="Peak before" value={srcPeak === null ? "-" : dbfs(srcPeak)} />
            <Stat label="Applied gain" value={`${signed(output.appliedDb)} dB`} highlight={style.text} />
            <Stat label="Peak after" value={dbfs(output.afterPeak)} highlight={style.text} />
          </div>

          {output.clamped && (
            <p className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
              <span>
                Some peaks exceeded full scale and were hard-clamped, which can sound distorted.
                Re-run with the clip guard on for a clean lift.
              </span>
            </p>
          )}

          {/* Preview player */}
          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
            <span className={cn("text-xs font-medium", style.text)}>Preview (boosted)</span>
            <AudioPlayer blob={output.blob} waveHeight={72} />
          </div>

          <AudioResult
            blob={output.blob}
            filename={output.filename}
            originalSize={file?.size}
            title={output.appliedDb >= 0 ? "Boosted volume" : "Reduced volume"}
            onReset={clearResult}
          />
        </div>
      )}
    </div>
  );
}

/** A compact labelled stat cell for the before/after grid. */
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
