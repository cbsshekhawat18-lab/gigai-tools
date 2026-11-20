"use client";

/**
 * Audio Silence Remover, tighten a recording by deleting the dead air.
 *
 * Drop a track → it decodes natively (no upload, no WASM) and paints a real
 * waveform → tune a dBFS silence threshold and a minimum-gap length → the engine
 * re-scans on-device and shows a kept/cut segment strip plus a live gap count and
 * time-saved readout → preview the stitched, tightened result → export a lossless
 * WAV or a compact MP3 → download. Everything runs on the user's device; the MP3
 * encoder is the only lazy import and loads solely when MP3 is chosen.
 *
 * The {@link AudioWorkspace} scaffold owns file/probe/busy/progress/abort/error/
 * result plumbing; this module supplies the options slot (waveform + threshold +
 * min-gap + segment strip + preview + format controls) and the `onRun` function
 * that runs {@link removeSilence} and encodes the result.
 *
 * Honest by design: this deletes long silent gaps and joins what's left. It is
 * not a noise gate for continuous hiss, and MP3 export is a single lossy encode.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  AudioWorkspace,
  Waveform,
  AudioPlayer,
  decodeAudio,
  formatDuration,
  type AudioMeta,
  type AudioRunHooks,
  type AudioRunResult,
} from "@/components/tool/audio";
import { detectSilence, removeSilence } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Silence threshold range in dBFS (more negative = only true dead air cut). */
const THRESHOLD_MIN = -70;
const THRESHOLD_MAX = -20;
const THRESHOLD_DEFAULT = -50;

/** Minimum gap length in seconds before a silence qualifies for removal. */
const MINGAP_MIN = 0.1;
const MINGAP_MAX = 2;
const MINGAP_DEFAULT = 0.4;

/**
 * Breathing room kept either side of every retained segment, in seconds.
 *
 * Speech doesn't begin at full volume, a word ramps up over a few tens of
 * milliseconds. Cutting exactly where the level meter crosses the threshold
 * shears that onset off and makes every sentence start abruptly, which is the
 * usual reason auto-trimmed audio sounds "chopped".
 */
const PADDING_MIN = 0;
const PADDING_MAX = 0.3;
const PADDING_DEFAULT = 0.05;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Live detection settings shared with the run handler via a ref. */
interface SilenceState {
  thresholdDb: number;
  minSilenceSec: number;
  padSec: number;
  format: ExportFormat;
  bitrate: number;
}

/** Total seconds covered by the kept (loud) segments. */
function keptSeconds(keep: Array<[number, number]>): number {
  let total = 0;
  for (const [s, e] of keep) total += Math.max(0, e - s);
  return total;
}

/**
 * A slim kept/cut strip: each kept span is drawn as a filled block over a muted
 * track, so the user sees at a glance which parts survive and where the gaps are
 * removed, a lightweight complement to the full waveform above.
 */
function SegmentStrip({
  keep,
  duration,
}: {
  keep: Array<[number, number]>;
  duration: number;
}) {
  if (duration <= 0) return null;
  return (
    <div
      className="relative h-6 w-full overflow-hidden rounded-md bg-muted/60"
      role="img"
      aria-label={`Kept audio segments: ${keep.length} loud ${
        keep.length === 1 ? "segment" : "segments"
      } remain after removing silence`}
    >
      {keep.map(([s, e], i) => {
        const left = clamp((s / duration) * 100, 0, 100);
        const width = clamp(((e - s) / duration) * 100, 0, 100);
        return (
          <div
            key={`${i}-${s}`}
            className="absolute top-0 h-full rounded-sm bg-primary/70"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        );
      })}
    </div>
  );
}

/**
 * The options slot: decode the file, draw the full-track waveform, host the
 * dBFS threshold and minimum-gap controls, re-run silence detection on-device as
 * they change (with a live gap count + time-saved readout and a kept/cut strip),
 * preview the stitched result, and expose format + bitrate. Keyed on the file so
 * the decoded buffer and settings reset cleanly on a fresh drop.
 */
function SilenceControls({
  file,
  busy,
  onStateChange,
}: {
  file: File;
  busy: boolean;
  onStateChange: (state: SilenceState) => void;
}) {
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);

  const [thresholdDb, setThresholdDb] = React.useState(THRESHOLD_DEFAULT);
  const [minSilenceSec, setMinSilenceSec] = React.useState(MINGAP_DEFAULT);
  const [padSec, setPadSec] = React.useState(PADDING_DEFAULT);
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  // Stitched preview of the de-silenced result.
  const [preview, setPreview] = React.useState<{
    buffer: AudioBuffer;
    blob: Blob;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  const inputId = React.useId();

  // Decode the dropped file once for the full-track waveform + detection.
  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    setDecodeError(null);
    setPreview(null);
    decodeAudio(file)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch((err) => {
        if (!cancelled) {
          setDecodeError(
            err instanceof Error
              ? err.message
              : "Couldn't decode that audio in the browser.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const duration =
    buffer && Number.isFinite(buffer.duration) && buffer.duration > 0
      ? buffer.duration
      : 0;

  // Re-run detection on-device whenever the buffer or thresholds change. Cheap
  // enough for typical takes; memoised so it doesn't re-scan on unrelated state.
  const keep = React.useMemo<Array<[number, number]>>(() => {
    if (!buffer) return [];
    return detectSilence(buffer, { thresholdDb, minSilenceSec, padSec });
  }, [buffer, thresholdDb, minSilenceSec, padSec]);

  const kept = keptSeconds(keep);
  const removed = Math.max(0, duration - kept);
  // detectSilence returns kept (loud) segments; gaps removed = internal + edge
  // silences between/around them. Count spans where audio was dropped.
  const gapsRemoved = React.useMemo(() => {
    if (duration <= 0 || keep.length === 0) return removed > 0.001 ? 1 : 0;
    let gaps = 0;
    // Leading silence.
    if (keep[0]![0] > 0.001) gaps++;
    // Between-segment silences.
    for (let i = 1; i < keep.length; i++) {
      if (keep[i]![0] - keep[i - 1]![1] > 0.001) gaps++;
    }
    // Trailing silence.
    if (duration - keep[keep.length - 1]![1] > 0.001) gaps++;
    return gaps;
  }, [keep, duration, removed]);

  // Publish live detection settings up to the run handler.
  React.useEffect(() => {
    onStateChange({ thresholdDb, minSilenceSec, padSec, format, bitrate });
  }, [thresholdDb, minSilenceSec, padSec, format, bitrate, onStateChange]);

  // A settings change invalidates any stale preview.
  React.useEffect(() => {
    setPreview(null);
  }, [thresholdDb, minSilenceSec, padSec]);

  // Build a decoded stitched preview of the tightened result (native, sync).
  const makePreview = React.useCallback(() => {
    if (!buffer || removed <= 0.001) return;
    setPreviewBusy(true);
    // Defer so the button shows its busy state before the (sync) rebuild runs.
    requestAnimationFrame(() => {
      try {
        const tightened = removeSilence(buffer, { thresholdDb, minSilenceSec, padSec });
        const blob = encodeWav(tightened);
        setPreview({ buffer: tightened, blob });
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [buffer, thresholdDb, minSilenceSec, padSec, removed]);

  const nothingToCut = removed <= 0.001;

  return (
    <div className="flex flex-col gap-5">
      {/* Full-track waveform */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="AudioWaveform" size={15} className="text-primary" />
          <span>Silence detection preview</span>
        </div>

        {decodeError ? (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <Icon name="CircleAlert" size={14} className="shrink-0" />
            {decodeError}
          </p>
        ) : buffer ? (
          <Waveform
            buffer={buffer}
            height={110}
            aria-label="Recording waveform"
          />
        ) : (
          <div
            className="flex h-[110px] items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" />
            Decoding waveform…
          </div>
        )}

        {/* Kept/cut segment strip */}
        {buffer && (
          <div className="mt-2">
            <SegmentStrip keep={keep} duration={duration} />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block size-2.5 rounded-sm bg-primary/70" aria-hidden />
              Kept audio
              <span className="mx-1 inline-block size-2.5 rounded-sm bg-muted/60" aria-hidden />
              Removed silence
            </p>
          </div>
        )}
      </div>

      {/* Live gap count + time-saved readout */}
      {buffer && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
          <span className="text-muted-foreground">
            Gaps removed{" "}
            <span
              className={cn(
                "font-semibold",
                gapsRemoved > 0 ? "text-primary" : "text-foreground",
              )}
            >
              {gapsRemoved}
            </span>
          </span>
          <span className="text-muted-foreground">
            Time saved{" "}
            <span
              className={cn(
                "font-semibold",
                nothingToCut ? "text-warning" : "text-primary",
              )}
            >
              {formatDuration(removed, true)}
            </span>
          </span>
          <span className="text-muted-foreground">
            New length{" "}
            <span className="font-medium text-foreground">
              {formatDuration(kept, true)}
            </span>
            {duration > 0 ? ` of ${formatDuration(duration)}` : null}
          </span>
        </div>
      )}

      {/* Threshold control */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={`${inputId}-threshold`}
            className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
          >
            <Icon name="SlidersHorizontal" size={15} className="text-primary" />
            Silence threshold
          </label>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
            −{Math.abs(thresholdDb)} dBFS
          </span>
        </div>
        <input
          id={`${inputId}-threshold`}
          type="range"
          min={THRESHOLD_MIN}
          max={THRESHOLD_MAX}
          step={1}
          value={thresholdDb}
          disabled={busy}
          onChange={(e) => setThresholdDb(Number(e.target.value))}
          aria-label="Silence threshold in dBFS"
          aria-valuetext={`minus ${Math.abs(thresholdDb)} dBFS`}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow",
            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-rose-500",
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>−70 dBFS (only true dead air)</span>
          <span>−20 dBFS (catch soft passages)</span>
        </div>
      </div>

      {/* Minimum gap control */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={`${inputId}-mingap`}
            className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
          >
            <Icon name="Timer" size={15} className="text-primary" />
            Minimum gap to remove
          </label>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
            {minSilenceSec.toFixed(1)} s
          </span>
        </div>
        <input
          id={`${inputId}-mingap`}
          type="range"
          min={MINGAP_MIN}
          max={MINGAP_MAX}
          step={0.1}
          value={minSilenceSec}
          disabled={busy}
          onChange={(e) => setMinSilenceSec(Number(e.target.value))}
          aria-label="Minimum silence gap length in seconds"
          aria-valuetext={`${minSilenceSec.toFixed(1)} seconds`}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow",
            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-rose-500",
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.1 s (aggressive)</span>
          <span>2.0 s (keep natural pauses)</span>
        </div>
      </div>

      {/* Padding control - keeps word onsets from being sheared off */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={`${inputId}-padding`}
            className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
          >
            <Icon name="Blend" size={15} className="text-primary" />
            Breathing room around speech
          </label>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
            {Math.round(padSec * 1000)} ms
          </span>
        </div>
        <input
          id={`${inputId}-padding`}
          type="range"
          min={PADDING_MIN}
          max={PADDING_MAX}
          step={0.01}
          value={padSec}
          disabled={busy}
          onChange={(e) => setPadSec(Number(e.target.value))}
          aria-label="Padding kept around each speech segment, in seconds"
          aria-valuetext={`${Math.round(padSec * 1000)} milliseconds`}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow",
            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-rose-500",
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 ms (tightest)</span>
          <span>300 ms (most natural)</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Words ramp up over a few tens of milliseconds, so cutting exactly where
          the meter crosses the threshold clips the start of each one. This keeps
          a margin on both sides. Every join is also crossfaded over a few
          milliseconds, which is what stops the cuts from clicking.
        </p>
      </div>

      {/* Preview of the stitched result */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">Preview result</span>
          <button
            type="button"
            onClick={makePreview}
            disabled={busy || !buffer || nothingToCut || previewBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={previewBusy ? "LoaderCircle" : "PlayCircle"}
              size={14}
              className={previewBusy ? "animate-spin" : ""}
            />
            {preview ? "Refresh preview" : "Preview result"}
          </button>
        </div>
        {preview ? (
          <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            {nothingToCut
              ? "No silence long enough to remove at these settings, raise the threshold or lower the minimum gap."
              : "Press “Preview result” to hear the tightened clip before you export."}
          </p>
        )}
      </div>

      {/* Export format + bitrate */}
      <fieldset className="flex flex-col gap-3" disabled={busy}>
        <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="FileAudio" size={15} className="text-primary" />
          Export format
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Export format">
          {(
            [
              { key: "wav", label: "WAV", hint: "Lossless" },
              { key: "mp3", label: "MP3", hint: "Compact" },
            ] as const
          ).map((opt) => {
            const active = format === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFormat(opt.key)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  name={active ? "CircleCheck" : "Circle"}
                  size={15}
                  className={active ? "text-primary" : ""}
                />
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.hint}</span>
              </button>
            );
          })}
        </div>

        {format === "mp3" && (
          <label className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>MP3 bitrate</span>
            <select
              value={bitrate}
              onChange={(e) => setBitrate(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="MP3 bitrate in kbps"
            >
              {MP3_BITRATES.map((b) => (
                <option key={b} value={b}>
                  {b} kbps{b === 320 ? " (best)" : b === 128 ? " (smallest)" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          This removes long silent gaps and joins what&apos;s left: it&apos;s not a noise gate,
          so constant background hiss or hum counts as “not silence” and stays.
          Everything runs in your browser; nothing is uploaded.
        </span>
      </p>
    </div>
  );
}

/**
 * Audio Silence Remover tool. Composes {@link AudioWorkspace} with an
 * interactive threshold/min-gap options slot and the native
 * {@link removeSilence} operation, then encodes the tightened result to WAV
 * (native) or MP3 (lazy encoder). TS-strict clean; dark-mode, responsive and
 * keyboard-accessible; honest about the memory-bound, in-browser engine.
 */
export default function AudioSilenceRemoverTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // Live detection settings, updated by the options slot and read at run time.
  // A ref avoids re-running the workspace's onRun identity.
  const stateRef = React.useRef<SilenceState>({
    thresholdDb: THRESHOLD_DEFAULT,
    minSilenceSec: MINGAP_DEFAULT,
    padSec: PADDING_DEFAULT,
    format: "wav",
    bitrate: 192,
  });
  const setState = React.useCallback((state: SilenceState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      const { thresholdDb, minSilenceSec, padSec, format, bitrate } = stateRef.current;

      // Decode natively (no ffmpeg), scan for silence, rebuild loud segments.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };

      const keep = detectSilence(buffer, { thresholdDb, minSilenceSec, padSec });
      const removedSec =
        buffer.duration -
        keep.reduce((sum, [s, e]) => sum + Math.max(0, e - s), 0);
      if (!(removedSec > 0.001)) {
        throw new Error(
          "No silence long enough to remove at these settings, raise the threshold or lower the minimum gap, then try again.",
        );
      }

      const tightened = removeSilence(buffer, { thresholdDb, minSilenceSec, padSec });
      const base = file.name.replace(/\.[^.]+$/, "") || "audio";

      if (format === "mp3") {
        // MP3 encoder is lazily imported inside encodeMp3. No WASM, no ffmpeg.
        const blob = await encodeMp3(tightened, { bitrate }, (p) =>
          hooks.onProgress(clamp(p, 0, 1)),
        );
        if (hooks.signal.aborted) return { blob: new Blob() };
        return { blob, filename: `${base}-desilenced.mp3` };
      }

      // WAV is a native, synchronous, lossless encode of the kept audio.
      const blob = encodeWav(tightened);
      hooks.onProgress(1);
      return { blob, filename: `${base}-desilenced.wav` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Remove silence"
        runIcon="Eraser"
        resultTitle="Tightened audio"
        softMaxMB={200}
        progressLabel="Removing silence"
      >
        {(args) => (
          <SilenceControls
            key={args.file.name + args.file.size}
            file={args.file}
            busy={args.busy}
            onStateChange={setState}
          />
        )}
      </AudioWorkspace>
    </div>
  );
}
