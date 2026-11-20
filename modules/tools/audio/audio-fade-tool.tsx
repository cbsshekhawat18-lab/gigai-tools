"use client";

/**
 * Audio Fade: add a smooth fade-in and/or fade-out to any track, in the
 * browser.
 *
 * Drop a file → it decodes natively (no upload, no WASM) and paints a real
 * waveform → drag the fade-in in from the left and the fade-out in from the
 * right (or type exact seconds) with a live volume-ramp overlay → preview the
 * faded result → export a lossless WAV or a compact MP3 → download. Everything
 * runs on the user's device; the MP3 encoder is the only lazy import and loads
 * solely when MP3 is chosen.
 *
 * The {@link AudioWorkspace} scaffold owns the file/probe/busy/progress/abort/
 * error/result plumbing; this module supplies the options slot (waveform + fade
 * handles + ramp overlay + preview + format controls) and the `onRun` fade
 * function built on the native {@link fade} operation.
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
import { fade } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Selectable fade shapes.
 *
 * A linear *amplitude* ramp is not a linear ramp to the ear. Loudness is
 * roughly logarithmic, so a linear fade-out seems to hold full volume and then
 * fall off a cliff. "Smooth" (equal-power) is the default because it is what
 * people mean when they say fade; the other two are here for when you want the
 * old ramp or a long, gentle music tail.
 */
const FADE_CURVES = [
  { key: "equalPower", label: "Smooth", hint: "Natural, recommended" },
  { key: "linear", label: "Linear", hint: "Constant amplitude" },
  { key: "exponential", label: "Gentle", hint: "Slow start, quick finish" },
] as const;

type FadeCurveKey = (typeof FADE_CURVES)[number]["key"];

/** Live fade state shared with the run handler (seconds). */
interface FadeState {
  inSec: number;
  outSec: number;
  curve: FadeCurveKey;
  format: ExportFormat;
  bitrate: number;
}

/**
 * The options slot: decode the file, draw the waveform with a fade-ramp
 * overlay, host drag handles + numeric inputs for the two fade lengths, preview
 * the faded result, and expose format + bitrate controls. Kept in its own
 * component (keyed on the file) so the decoded buffer and fade lengths reset
 * cleanly on a fresh drop.
 */
function FadeControls({
  file,
  meta,
  busy,
  onStateChange,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
  onStateChange: (state: FadeState) => void;
}) {
  const duration =
    Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  // Fade lengths in seconds. Sensible defaults: a short fade at each end.
  const [inSec, setInSec] = React.useState<number>(0);
  const [outSec, setOutSec] = React.useState<number>(0);
  const [curve, setCurve] = React.useState<FadeCurveKey>("equalPower");
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  // Preview of the fully faded track, a decoded buffer + its WAV blob.
  const [preview, setPreview] = React.useState<{
    buffer: AudioBuffer;
    blob: Blob;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  // Which fade handle is being dragged, if any.
  const [dragging, setDragging] = React.useState<"in" | "out" | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  // Decode the dropped file once for the full-track waveform. Seed a gentle
  // default fade-out on ended-sounding clips so the tool is useful immediately.
  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    setDecodeError(null);
    setPreview(null);
    decodeAudio(file)
      .then((b) => {
        if (cancelled) return;
        setBuffer(b);
        const dur = b.duration;
        // Default to a 1s fade-out (or a quarter of the clip if very short),
        // capped so it never exceeds the clip; fade-in stays off by default.
        setOutSec(Math.min(1, dur > 0 ? dur / 4 : 0));
        setInSec(0);
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

  // Bounded fade lengths and overlap detection.
  const boundedIn = duration > 0 ? clamp(inSec, 0, duration) : 0;
  const boundedOut = duration > 0 ? clamp(outSec, 0, duration) : 0;
  const overlap = duration > 0 && boundedIn + boundedOut > duration;

  // Publish live fade lengths + export options up to the run handler.
  React.useEffect(() => {
    onStateChange({
      inSec: boundedIn,
      outSec: boundedOut,
      curve,
      format,
      bitrate,
    });
  }, [boundedIn, boundedOut, curve, format, bitrate, onStateChange]);

  // Any fade change invalidates a stale preview.
  const updateIn = React.useCallback((next: number) => {
    setInSec(Math.max(0, next));
    setPreview(null);
  }, []);
  const updateOut = React.useCallback((next: number) => {
    setOutSec(Math.max(0, next));
    setPreview(null);
  }, []);

  // Build a decoded preview of the faded track (native, instant).
  const makePreview = React.useCallback(() => {
    if (!buffer || (boundedIn <= 0 && boundedOut <= 0)) return;
    setPreviewBusy(true);
    // Defer so the button shows its busy state before the (sync) fade runs.
    requestAnimationFrame(() => {
      try {
        const faded = fade(buffer, { inSec: boundedIn, outSec: boundedOut, curve });
        const blob = encodeWav(faded);
        setPreview({ buffer: faded, blob });
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [buffer, boundedIn, boundedOut, curve]);

  // --- Drag handling on the ramp overlay -------------------------------------
  // Convert a pointer x within the overlay to a fraction 0–1 of the track.
  const fractionFromPointer = React.useCallback((clientX: number): number => {
    const el = overlayRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const onPointerDownHandle = React.useCallback(
    (which: "in" | "out") => (e: React.PointerEvent) => {
      if (busy || duration <= 0) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      setDragging(which);
    },
    [busy, duration],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || duration <= 0) return;
      const frac = fractionFromPointer(e.clientX);
      if (dragging === "in") {
        updateIn(frac * duration);
      } else {
        updateOut((1 - frac) * duration);
      }
    },
    [dragging, duration, fractionFromPointer, updateIn, updateOut],
  );

  const onPointerUp = React.useCallback(() => setDragging(null), []);

  const disabled = busy || duration <= 0 || !buffer;
  const noFade = boundedIn <= 0 && boundedOut <= 0;

  // Fractions for the overlay ramps.
  const inFrac = duration > 0 ? clamp(boundedIn / duration, 0, 1) : 0;
  const outFrac = duration > 0 ? clamp(boundedOut / duration, 0, 1) : 0;

  const WAVE_HEIGHT = 120;

  return (
    <div className="flex flex-col gap-4">
      {/* Waveform + fade ramp overlay */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="AudioWaveform" size={15} className="text-primary" />
          <span>Drag the handles in from each edge to set the fade lengths</span>
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
          <div
            className="relative select-none"
            style={{ height: WAVE_HEIGHT }}
          >
            <Waveform
              buffer={buffer}
              height={WAVE_HEIGHT}
              aria-label="Track waveform with fade regions"
            />

            {/* Ramp overlay: translucent triangles + draggable edge handles. */}
            <div
              ref={overlayRef}
              className="absolute inset-0 touch-none"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Fade-in ramp: a right triangle rising from bottom-left. */}
              {inFrac > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 bg-primary/15"
                  style={{
                    width: `${inFrac * 100}%`,
                    clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
                  }}
                  aria-hidden="true"
                />
              )}
              {/* Fade-out ramp: a right triangle falling to bottom-right. */}
              {outFrac > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 bg-primary/15"
                  style={{
                    width: `${outFrac * 100}%`,
                    clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Fade-in handle */}
              <button
                type="button"
                aria-label="Fade-in length"
                onPointerDown={onPointerDownHandle("in")}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 1 : 0.1;
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    updateIn(boundedIn + step);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    updateIn(boundedIn - step);
                  }
                }}
                disabled={disabled}
                className={cn(
                  "absolute top-0 z-10 h-full w-2 -translate-x-1/2 cursor-ew-resize touch-none outline-none",
                  "before:absolute before:inset-y-0 before:left-1/2 before:w-0.5 before:-translate-x-1/2 before:bg-primary before:content-['']",
                  "focus-visible:before:w-1 focus-visible:before:bg-primary",
                  "disabled:cursor-not-allowed",
                )}
                style={{ left: `${inFrac * 100}%` }}
              />
              {/* Fade-out handle */}
              <button
                type="button"
                aria-label="Fade-out length"
                onPointerDown={onPointerDownHandle("out")}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 1 : 0.1;
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    updateOut(boundedOut + step);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    updateOut(boundedOut - step);
                  }
                }}
                disabled={disabled}
                className={cn(
                  "absolute top-0 z-10 h-full w-2 -translate-x-1/2 cursor-ew-resize touch-none outline-none",
                  "before:absolute before:inset-y-0 before:left-1/2 before:w-0.5 before:-translate-x-1/2 before:bg-primary before:content-['']",
                  "focus-visible:before:w-1 focus-visible:before:bg-primary",
                  "disabled:cursor-not-allowed",
                )}
                style={{ left: `${(1 - outFrac) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div
            className="flex h-[120px] items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" />
            Decoding waveform…
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          Tip: drag the left handle for the fade-in and the right handle for the
          fade-out, or type exact seconds below. Focus a handle and use the
          arrow keys: Shift for a bigger step.
        </p>
      </div>

      {/* Numeric fade inputs + live readout */}
      <fieldset
        className="flex flex-col gap-3"
        disabled={busy || duration <= 0}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-foreground">
              Fade-in (seconds)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={duration > 0 ? Math.round(duration * 100) / 100 : undefined}
              step={0.1}
              value={Number.isFinite(boundedIn) ? Math.round(boundedIn * 100) / 100 : 0}
              onChange={(e) => updateIn(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none tabular-nums focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Fade-in length in seconds"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-foreground">
              Fade-out (seconds)
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={duration > 0 ? Math.round(duration * 100) / 100 : undefined}
              step={0.1}
              value={Number.isFinite(boundedOut) ? Math.round(boundedOut * 100) / 100 : 0}
              onChange={(e) => updateOut(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none tabular-nums focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Fade-out length in seconds"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
          <span className="text-muted-foreground">
            Fade-in{" "}
            <span className="font-medium text-foreground">
              {formatDuration(boundedIn, true)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Fade-out{" "}
            <span className="font-medium text-foreground">
              {formatDuration(boundedOut, true)}
            </span>
          </span>
          {duration > 0 ? (
            <span className="text-muted-foreground">
              Track{" "}
              <span className="font-medium text-foreground">
                {formatDuration(duration)}
              </span>
            </span>
          ) : null}
        </div>

        {overlap && (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
          >
            <Icon name="TriangleAlert" size={14} className="shrink-0" />
            The fade-in and fade-out overlap on this short clip: the middle will
            dip in volume. Shorten one so their total is less than the track
            length.
          </p>
        )}
      </fieldset>

      {/* Fade shape */}
      <fieldset className="flex flex-col gap-2" disabled={busy}>
        <legend className="mb-1 text-sm font-medium text-foreground">Fade shape</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Fade shape">
          {FADE_CURVES.map((opt) => {
            const active = curve === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setCurve(opt.key);
                  setPreview(null);
                }}
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
        <p className="text-xs text-muted-foreground">
          {curve === "equalPower"
            ? "Equal-power curve, holds a steady perceived loudness through the fade. The most natural-sounding option for both speech and music."
            : curve === "linear"
              ? "A straight amplitude ramp. Because loudness is roughly logarithmic, this tends to sound like it stays loud and then drops away suddenly at the end."
              : "Starts gently and falls away faster toward the end, the long, soft tail used on music outros."}
        </p>
      </fieldset>

      {/* Preview of the faded result */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            Preview result
          </span>
          <button
            type="button"
            onClick={makePreview}
            disabled={disabled || noFade || previewBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={previewBusy ? "LoaderCircle" : "PlayCircle"}
              size={14}
              className={previewBusy ? "animate-spin" : ""}
            />
            {preview ? "Refresh preview" : "Preview fade"}
          </button>
        </div>
        {preview ? (
          <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Set a fade-in and/or fade-out, then press “Preview fade” to hear the
            faded track before you export.
          </p>
        )}
      </div>

      {/* Export format + bitrate */}
      <fieldset className="flex flex-col gap-3" disabled={busy}>
        <legend className="mb-1 text-sm font-medium text-foreground">
          Export format
        </legend>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Export format"
        >
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
                onClick={() => {
                  setFormat(opt.key);
                }}
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
 * Audio Fade tool. Composes {@link AudioWorkspace} with an interactive
 * waveform-plus-ramp options slot and the native {@link fade} operation, then
 * encodes the faded track to WAV (native) or MP3 (lazy encoder). TS-strict
 * clean; dark-mode, responsive and keyboard-accessible; honest about the
 * memory-bound, in-browser nature of the engine.
 */
export default function AudioFadeTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live fade lengths + export options, updated by the options slot and
  // read at run time. A ref avoids re-running the workspace's onRun identity.
  const stateRef = React.useRef<FadeState>({
    inSec: 0,
    outSec: 0,
    curve: "equalPower", // must match FadeControls' initial state
    format: "wav",
    bitrate: 192,
  });
  const setState = React.useCallback((state: FadeState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      const { inSec, outSec, curve, format, bitrate } = stateRef.current;

      if (!(inSec > 0) && !(outSec > 0)) {
        throw new Error(
          "Set a fade-in or fade-out first, drag a handle in from an edge, or type a number of seconds.",
        );
      }

      // Decode natively (no ffmpeg) and apply the fades frame-by-frame.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };
      const faded = fade(buffer, { inSec, outSec, curve });

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";

      if (format === "mp3") {
        // MP3 encoder is lazily imported inside encodeMp3. No WASM, no ffmpeg.
        const blob = await encodeMp3(faded, { bitrate }, (p) =>
          hooks.onProgress(clamp(p, 0, 1)),
        );
        if (hooks.signal.aborted) return { blob: new Blob() };
        return { blob, filename: `${base}-faded.mp3` };
      }

      // WAV is a native, synchronous, lossless encode.
      const blob = encodeWav(faded);
      hooks.onProgress(1);
      return { blob, filename: `${base}-faded.wav` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Apply fade"
        runIcon="AudioWaveform"
        resultTitle="Faded audio"
        softMaxMB={200}
        progressLabel="Fading"
      >
        {(args) => (
          <FadeControls
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
