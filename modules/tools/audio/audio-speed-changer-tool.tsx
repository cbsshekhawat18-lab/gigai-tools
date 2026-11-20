"use client";

/**
 * Audio Speed Changer, the GigAI Audio Toolkit's tempo tool.
 *
 * Drop a track → it decodes natively (no upload, no WASM) and paints a real
 * waveform → set a speed from 0.5× to 2× with a slider or a preset → choose
 * whether to keep the pitch → preview the retimed audio in the tab → export a
 * lossless WAV or a compact MP3 → download. Everything runs on the user's
 * device; the MP3 encoder is the only lazy import and loads solely when MP3 is
 * chosen.
 *
 * The {@link AudioWorkspace} scaffold owns the file/probe/busy/progress/abort/
 * error/result plumbing; this module supplies the options slot (waveform + speed
 * slider + pitch toggle + preview + format controls) and the `onRun` retime
 * function.
 *
 * Two real engines, both surfaced in the UI copy:
 *  • "Keep pitch" ON (default): genuine WSOLA time-stretching, so a podcast at
 *     1.5× sounds like the same voice talking faster, not a chipmunk.
 *  • "Keep pitch" OFF: a fast linear resample where pitch follows speed, the
 *     classic tape/vinyl effect.
 *
 * This toggle used to route through `AudioBufferSourceNode.playbackRate`, which
 * is itself a resample and shifted pitch by exactly the same ratio as the "off"
 * path: the option looked like it worked and did nothing. It is now backed by a
 * real time-stretch implementation (lib/audio-tools/timestretch).
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
import { changeSpeed } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MIN_SPEED = 0.5;
const MAX_SPEED = 2;
const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Quick speed presets (slower on the left, faster on the right). */
const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Round a speed to a tidy 2-decimal number for display and the engine. */
function tidySpeed(value: number): number {
  return Math.round(clamp(value, MIN_SPEED, MAX_SPEED) * 100) / 100;
}

/** Live retime state shared with the run handler. */
interface SpeedState {
  speed: number;
  keepPitch: boolean;
  format: ExportFormat;
  bitrate: number;
}

/**
 * The options slot: decode the file, draw the waveform, host the speed slider +
 * presets, a keep-pitch toggle, a preview of the retimed audio, and the export
 * format + bitrate controls. Kept in its own component (keyed on the file) so
 * the decoded buffer and per-file speed reset cleanly on a fresh drop.
 */
function SpeedControls({
  file,
  meta,
  busy,
  onStateChange,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
  onStateChange: (state: SpeedState) => void;
}) {
  const duration =
    Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  const [speed, setSpeed] = React.useState<number>(1);
  // Default ON: most people speeding audio up are speeding up *speech*, and they
  // want the same voice faster. Not a higher one.
  const [keepPitch, setKeepPitch] = React.useState<boolean>(true);
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  // Preview of the retimed audio: a decoded buffer + its WAV blob.
  const [preview, setPreview] = React.useState<{
    buffer: AudioBuffer;
    blob: Blob;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  // Decode the dropped file once for the full-track waveform.
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

  // New duration at the current speed (slower = longer, faster = shorter).
  const newDuration = duration > 0 ? duration / speed : 0;
  const isChanged = Math.abs(speed - 1) > 1e-3;

  // Publish the live speed + export options up to the run handler.
  React.useEffect(() => {
    onStateChange({ speed, keepPitch, format, bitrate });
  }, [speed, keepPitch, format, bitrate, onStateChange]);

  // Any change to speed/pitch invalidates a stale preview.
  const invalidatePreview = React.useCallback(() => setPreview(null), []);

  const handleSpeed = React.useCallback(
    (next: number) => {
      setSpeed(tidySpeed(next));
      invalidatePreview();
    },
    [invalidatePreview],
  );

  const handleKeepPitch = React.useCallback(
    (next: boolean) => {
      setKeepPitch(next);
      invalidatePreview();
    },
    [invalidatePreview],
  );

  // Build a decoded preview of the retimed audio (native resample; async).
  const makePreview = React.useCallback(() => {
    if (!buffer || duration <= 0) return;
    setPreviewBusy(true);
    void (async () => {
      try {
        const retimed = await changeSpeed(buffer, speed, { preservePitch: keepPitch });
        const blob = encodeWav(retimed);
        setPreview({ buffer: retimed, blob });
      } catch {
        // Leave the previous (or empty) preview in place on failure.
      } finally {
        setPreviewBusy(false);
      }
    })();
  }, [buffer, duration, speed, keepPitch]);

  const disabled = busy || duration <= 0 || !buffer;

  return (
    <div className="flex flex-col gap-4">
      {/* Waveform of the source track */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="Gauge" size={15} className="text-primary" />
          <span>Set the playback speed for this track</span>
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
            height={96}
            aria-label="Waveform of the source audio"
          />
        ) : (
          <div
            className="flex h-[96px] items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" />
            Decoding waveform…
          </div>
        )}
      </div>

      {/* Speed slider + presets */}
      <fieldset className="flex flex-col gap-3" disabled={disabled}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label
            htmlFor="speed-slider"
            className="text-sm font-medium text-foreground"
          >
            Speed
          </label>
          <span className="text-sm font-semibold tabular-nums text-primary">
            {speed.toFixed(2)}×
          </span>
        </div>

        <input
          id="speed-slider"
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={0.05}
          value={speed}
          onChange={(e) => handleSpeed(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Playback speed multiplier"
          aria-valuetext={`${speed.toFixed(2)} times`}
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>0.5× (slower)</span>
          <span>1× (original)</span>
          <span>2× (faster)</span>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Speed presets">
          {SPEED_PRESETS.map((p) => {
            const active = Math.abs(speed - p) < 1e-3;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleSpeed(p)}
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {p}×
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Live duration readout */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
        <span className="text-muted-foreground">
          Original{" "}
          <span className="font-medium text-foreground">
            {duration > 0 ? formatDuration(duration) : "—"}
          </span>
        </span>
        <span className="text-muted-foreground">
          New length{" "}
          <span
            className={cn(
              "font-semibold",
              isChanged ? "text-primary" : "text-foreground",
            )}
          >
            {newDuration > 0 ? formatDuration(newDuration) : "—"}
          </span>
        </span>
      </div>

      {/* Keep-pitch toggle with an honest note */}
      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={keepPitch}
            disabled={disabled}
            onChange={(e) => handleKeepPitch(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="font-medium text-foreground">
            Keep the pitch (don&apos;t let it rise or fall with speed)
          </span>
        </label>
        <p className="pl-[26px] text-xs text-muted-foreground">
          {keepPitch
            ? "Real time-stretching (WSOLA): the track gets shorter or longer while every voice and note stays at its original pitch. Ideal for podcasts, lectures and audiobooks. Beyond about 0.5×–2× you may hear mild warble, and dense music artifacts more than speech."
            : "Off: pitch rises as it speeds up and drops as it slows, like a tape or a record, the classic effect. Faster to compute, and the one you want for a deliberate chipmunk or slow-mo sound."}
        </p>
      </div>

      {/* Preview of the retimed audio */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">Preview result</span>
          <button
            type="button"
            onClick={makePreview}
            disabled={disabled || previewBusy}
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
            Set a speed and press “Preview result” to hear the retimed audio before
            you export.
          </p>
        )}
      </div>

      {/* Export format + bitrate */}
      <fieldset className="flex flex-col gap-3" disabled={busy}>
        <legend className="mb-1 text-sm font-medium text-foreground">
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
    </div>
  );
}

/**
 * Audio Speed Changer tool. Composes {@link AudioWorkspace} with a speed-slider
 * options slot and the native {@link changeSpeed} operation, then encodes the
 * retimed buffer to WAV (native) or MP3 (lazy encoder). TS-strict clean;
 * dark-mode, responsive and keyboard-accessible; honest about the memory-bound,
 * in-browser nature of the engine and the approximate pitch-preservation.
 */
export default function AudioSpeedChangerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live speed + export options, updated by the options slot and read at run
  // time. A ref keeps the workspace's onRun identity stable.
  const stateRef = React.useRef<SpeedState>({
    speed: 1,
    keepPitch: true, // must match SpeedControls' initial state
    format: "wav",
    bitrate: 192,
  });
  const setState = React.useCallback((state: SpeedState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      const { speed, keepPitch, format, bitrate } = stateRef.current;

      if (Math.abs(speed - 1) <= 1e-3) {
        throw new Error(
          "Set a speed other than 1× first: drag the slider or tap a preset to change the tempo.",
        );
      }

      // Decode natively (no ffmpeg), then resample to the new speed.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };

      const retimed = await changeSpeed(buffer, speed, { preservePitch: keepPitch });
      if (hooks.signal.aborted) return { blob: new Blob() };

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";
      const tag = `${speed.toFixed(2).replace(/\.?0+$/, "")}x`;

      if (format === "mp3") {
        // MP3 encoder is lazily imported inside encodeMp3. No WASM, no ffmpeg.
        const blob = await encodeMp3(retimed, { bitrate }, (p) =>
          hooks.onProgress(clamp(p, 0, 1)),
        );
        if (hooks.signal.aborted) return { blob: new Blob() };
        return { blob, filename: `${base}-${tag}.mp3` };
      }

      // WAV is a native, synchronous, lossless encode of the resampled buffer.
      const blob = encodeWav(retimed);
      hooks.onProgress(1);
      return { blob, filename: `${base}-${tag}.wav` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Change speed"
        runIcon="Gauge"
        resultTitle="Retimed audio"
        softMaxMB={200}
        progressLabel="Changing speed"
      >
        {(args) => (
          <SpeedControls
            key={args.file.name + args.file.size}
            file={args.file}
            meta={args.meta}
            busy={args.busy}
            onStateChange={setState}
          />
        )}
      </AudioWorkspace>
    </div>
  );
}
