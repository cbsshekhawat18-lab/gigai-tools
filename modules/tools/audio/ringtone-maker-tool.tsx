"use client";

/**
 * Ringtone Maker: the fun, popular member of the GigAI Audio Toolkit.
 *
 * Drop a song → it decodes natively (no upload, no WASM) and paints a real
 * waveform → drag a selection over the hook, capped to a ringtone-friendly
 * length (~40s) → add a fade-in and fade-out with a live volume-ramp overlay →
 * preview the finished, faded tone → export an MP3 (universal / Android) or an
 * M4A/AAC (Apple-friendly, rename to .m4r) → download.
 *
 * The engine is honest about its two encode paths:
 *  • MP3: native decode + fade + lamejs (lazy import). NO ffmpeg download.
 *  • M4A, decode + fade → native WAV → shared ffmpeg core (loads the 31 MB
 *            core ONLY when M4A is chosen; we flag onEngineLoading for it).
 *
 * The {@link AudioWorkspace} scaffold owns the file/probe/busy/progress/
 * engine-loading/abort/error/result plumbing; this module supplies the options
 * slot (waveform selection + length cap + fade ramp + preview + format) and the
 * `onRun` build function.
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
  type WaveSelection,
  type AudioRunHooks,
  type AudioRunResult,
} from "@/components/tool/audio";
import { trim, fade } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3, encodeViaFfmpeg } from "@/lib/audio-tools/encode";

/** Ringtone-friendly clip length (seconds). iOS/Android tones cap ~30–40s. */
const MAX_RINGTONE_SEC = 40;
/** A comfortable default clip length when the song is long enough. */
const DEFAULT_CLIP_SEC = 25;

type ExportFormat = "mp3" | "m4a";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Live ringtone state shared with the run handler (all in seconds). */
interface RingtoneState {
  /** Selection start in seconds. */
  start: number;
  /** Selection end in seconds (already length-capped). */
  end: number;
  /** Fade-in length in seconds. */
  fadeIn: number;
  /** Fade-out length in seconds. */
  fadeOut: number;
  format: ExportFormat;
  bitrate: number;
}

/**
 * The options slot: decode the song, draw the waveform, host a draggable
 * selection region (capped to a ringtone length), fade-in/out sliders with a
 * ramp overlay, a finished-tone preview, and format controls. Kept in its own
 * component (keyed on the file) so the decoded buffer and per-file settings
 * reset cleanly on a fresh drop.
 */
function RingtoneControls({
  file,
  meta,
  busy,
  onStateChange,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
  onStateChange: (state: RingtoneState) => void;
}) {
  const duration =
    Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  // Selection as fractions 0–1 (the Waveform's native unit).
  const [selection, setSelection] = React.useState<WaveSelection>({
    start: 0,
    end: 1,
  });
  // Fade lengths in seconds.
  const [fadeIn, setFadeIn] = React.useState<number>(1);
  const [fadeOut, setFadeOut] = React.useState<number>(1);
  const [format, setFormat] = React.useState<ExportFormat>("mp3");
  const [bitrate, setBitrate] = React.useState<number>(256);

  // Preview of the finished tone, a decoded buffer + its WAV blob.
  const [preview, setPreview] = React.useState<{
    buffer: AudioBuffer;
    blob: Blob;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  // Decode the dropped song once for the full-track waveform, and seed a
  // sensible default selection (a ~25s window near the start: where hooks
  // often are, capped to the ringtone limit and the actual length).
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
        if (dur > 0) {
          const clip = Math.min(DEFAULT_CLIP_SEC, MAX_RINGTONE_SEC, dur);
          setSelection({ start: 0, end: clamp(clip / dur, 0, 1) });
          // Short fades that never exceed the clip.
          const f = Math.min(1, clip / 4);
          setFadeIn(f);
          setFadeOut(f);
        }
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

  // Seconds derived from the fractional selection (bounded to the real length).
  const rawStartSec =
    duration > 0 ? clamp(selection.start * duration, 0, duration) : 0;
  const rawEndSec =
    duration > 0 ? clamp(selection.end * duration, 0, duration) : 0;
  // Enforce the ringtone length cap on the END, anchored to the start.
  const startSec = rawStartSec;
  const endSec = Math.min(rawEndSec, startSec + MAX_RINGTONE_SEC);
  const clipSec = Math.max(0, endSec - startSec);
  const overLimit = rawEndSec - rawStartSec > MAX_RINGTONE_SEC + 0.001;

  // Bounded fades (can't exceed the clip, and together shouldn't exceed it).
  const boundedIn = clamp(fadeIn, 0, clipSec);
  const boundedOut = clamp(fadeOut, 0, clipSec);
  const fadesOverlap = boundedIn + boundedOut > clipSec && clipSec > 0;

  // Publish the live settings up to the run handler.
  React.useEffect(() => {
    onStateChange({
      start: startSec,
      end: endSec,
      fadeIn: boundedIn,
      fadeOut: boundedOut,
      format,
      bitrate,
    });
  }, [
    startSec,
    endSec,
    boundedIn,
    boundedOut,
    format,
    bitrate,
    onStateChange,
  ]);

  // A new selection or fade invalidates any stale preview.
  const handleSelect = React.useCallback(
    (next: WaveSelection) => {
      // Cap the visual selection length so the handle can't drag past the limit.
      const start = clamp(next.start, 0, 1);
      let end = clamp(Math.max(next.end, next.start), 0, 1);
      if (duration > 0) {
        const maxFrac = clamp((start * duration + MAX_RINGTONE_SEC) / duration, 0, 1);
        end = Math.min(end, maxFrac);
      }
      setSelection({ start, end });
      setPreview(null);
    },
    [duration],
  );

  const updateFadeIn = React.useCallback((v: number) => {
    setFadeIn(Math.max(0, v));
    setPreview(null);
  }, []);
  const updateFadeOut = React.useCallback((v: number) => {
    setFadeOut(Math.max(0, v));
    setPreview(null);
  }, []);

  /** Build the finished tone buffer (trim → fade), used for preview and export. */
  const buildTone = React.useCallback(
    (src: AudioBuffer): AudioBuffer => {
      const clip = trim(src, startSec, endSec);
      if (boundedIn <= 0 && boundedOut <= 0) return clip;
      return fade(clip, { inSec: boundedIn, outSec: boundedOut });
    },
    [startSec, endSec, boundedIn, boundedOut],
  );

  // Build a decoded preview of the finished tone (native, instant).
  const makePreview = React.useCallback(() => {
    if (!buffer || clipSec <= 0) return;
    setPreviewBusy(true);
    // Defer so the button shows its busy state before the (sync) work runs.
    requestAnimationFrame(() => {
      try {
        const tone = buildTone(buffer);
        const blob = encodeWav(tone);
        setPreview({ buffer: tone, blob });
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [buffer, clipSec, buildTone]);

  const disabled = busy || duration <= 0 || !buffer;
  const noRegion = clipSec <= 0;

  // Overlay ramp fractions (relative to the CLIP, not the whole track).
  const inRampPct = clipSec > 0 ? clamp(boundedIn / clipSec, 0, 1) * 100 : 0;
  const outRampPct = clipSec > 0 ? clamp(boundedOut / clipSec, 0, 1) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Waveform + draggable selection */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="AudioWaveform" size={15} className="text-primary" />
          <span>Drag across the waveform to grab the hook for your ringtone</span>
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
            selection={selection}
            onSelect={handleSelect}
            height={120}
            aria-label="Ringtone selection, drag to set the section to keep"
          />
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
          Tip: drag the region&apos;s body to slide it, pull an edge to resize, or
          focus it and nudge with the arrow keys. Ringtones are best around
          20–30 seconds and are capped at {MAX_RINGTONE_SEC}s here so your phone
          accepts them.
        </p>
      </div>

      {/* Live selection readout */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
        <span className="text-muted-foreground">
          Start{" "}
          <span className="font-medium text-foreground">
            {formatDuration(startSec, true)}
          </span>
        </span>
        <span className="text-muted-foreground">
          End{" "}
          <span className="font-medium text-foreground">
            {formatDuration(endSec, true)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Ringtone{" "}
          <span
            className={cn(
              "font-semibold",
              noRegion ? "text-warning" : "text-primary",
            )}
          >
            {formatDuration(clipSec, true)}
          </span>
        </span>
      </div>

      {overLimit && (
        <p
          role="alert"
          className="flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
        >
          <Icon name="TriangleAlert" size={14} className="shrink-0" />
          Selection is longer than {MAX_RINGTONE_SEC}s - it&apos;s been capped to the
          first {MAX_RINGTONE_SEC}s from your start point. Drag the start to move
          the window, or shorten the selection for a tighter tone.
        </p>
      )}

      {/* Fade controls + ramp overlay */}
      <fieldset className="flex flex-col gap-3" disabled={disabled}>
        <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="Waves" size={15} className="text-primary" />
          Fade in &amp; out
        </legend>

        {/* Ramp preview bar (clip-relative) */}
        <div
          className="relative h-8 overflow-hidden rounded-md border border-border bg-muted/40"
          aria-hidden="true"
        >
          {inRampPct > 0 && (
            <div
              className="absolute inset-y-0 left-0 bg-primary/20"
              style={{
                width: `${inRampPct}%`,
                clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
              }}
            />
          )}
          {outRampPct > 0 && (
            <div
              className="absolute inset-y-0 right-0 bg-primary/20"
              style={{
                width: `${outRampPct}%`,
                clipPath: "polygon(0 0, 0 100%, 100% 100%)",
              }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {noRegion ? "Set a region first" : "Volume ramp"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="flex items-center justify-between font-medium text-foreground">
              <span>Fade-in</span>
              <span className="tabular-nums text-muted-foreground">
                {formatDuration(boundedIn, true)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0.1, Math.round(clipSec * 10) / 10)}
              step={0.1}
              value={boundedIn}
              onChange={(e) => updateFadeIn(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Fade-in length in seconds"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="flex items-center justify-between font-medium text-foreground">
              <span>Fade-out</span>
              <span className="tabular-nums text-muted-foreground">
                {formatDuration(boundedOut, true)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0.1, Math.round(clipSec * 10) / 10)}
              step={0.1}
              value={boundedOut}
              onChange={(e) => updateFadeOut(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Fade-out length in seconds"
            />
          </label>
        </div>

        {fadesOverlap && (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
          >
            <Icon name="TriangleAlert" size={14} className="shrink-0" />
            The fades overlap on this short clip; the middle will dip in volume.
            Shorten one so their total is less than the ringtone length.
          </p>
        )}
      </fieldset>

      {/* Preview of the finished tone */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            Preview ringtone
          </span>
          <button
            type="button"
            onClick={makePreview}
            disabled={disabled || noRegion || previewBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={previewBusy ? "LoaderCircle" : "PlayCircle"}
              size={14}
              className={previewBusy ? "animate-spin" : ""}
            />
            {preview ? "Refresh preview" : "Preview ringtone"}
          </button>
        </div>
        {preview ? (
          <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Set your region and fades, then press “Preview ringtone” to hear the
            finished tone before you export.
          </p>
        )}
      </div>

      {/* Export format */}
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
              { key: "mp3", label: "MP3", hint: "Android · universal" },
              { key: "m4a", label: "M4A", hint: "iPhone · rename to .m4r" },
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

        {format === "mp3" ? (
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
        ) : (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
            M4A/AAC uses a small in-browser converter that downloads once on first
            use. Rename the downloaded file to end in <code>.m4r</code> to add it
            as an iPhone ringtone in your phone&apos;s tools.
          </p>
        )}
      </fieldset>
    </div>
  );
}

/**
 * Ringtone Maker tool. Composes {@link AudioWorkspace} with an interactive
 * waveform-selection + fade options slot: trims the hook (length-capped),
 * applies fades, then encodes to MP3 (native lamejs) or M4A/AAC (shared ffmpeg,
 * flagged via onEngineLoading). TS-strict clean; dark-mode, responsive and
 * keyboard-accessible; honest about the memory-bound, in-browser engine.
 */
export default function RingtoneMakerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live settings, updated by the options slot and read at run time. A ref
  // avoids re-running the workspace's onRun identity.
  const stateRef = React.useRef<RingtoneState>({
    start: 0,
    end: 0,
    fadeIn: 1,
    fadeOut: 1,
    format: "mp3",
    bitrate: 256,
  });
  const setState = React.useCallback((state: RingtoneState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      const { start, end, fadeIn, fadeOut, format, bitrate } = stateRef.current;

      if (!(end > start)) {
        throw new Error(
          "Grab a section first, drag across the waveform so the start and end are apart.",
        );
      }

      // Decode natively (no ffmpeg), slice the hook, then fade both ends.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };

      let tone = trim(buffer, start, end);
      if (fadeIn > 0 || fadeOut > 0) {
        tone = fade(tone, { inSec: fadeIn, outSec: fadeOut });
      }
      if (hooks.signal.aborted) return { blob: new Blob() };

      const base = file.name.replace(/\.[^.]+$/, "") || "ringtone";

      if (format === "m4a") {
        // M4A/AAC routes through the shared ffmpeg core. It loads the 31 MB
        // core on first use, so flag the engine-loading state for the UI.
        hooks.onEngineLoading(true);
        try {
          const wav = encodeWav(tone);
          const blob = await encodeViaFfmpeg(wav, "m4a", (p) =>
            hooks.onProgress(clamp(p, 0, 1)),
          );
          if (hooks.signal.aborted) return { blob: new Blob() };
          return { blob, filename: `${base}-ringtone.m4a` };
        } finally {
          hooks.onEngineLoading(false);
        }
      }

      // MP3: lamejs encoder is lazily imported inside encodeMp3. No ffmpeg.
      const blob = await encodeMp3(tone, { bitrate }, (p) =>
        hooks.onProgress(clamp(p, 0, 1)),
      );
      if (hooks.signal.aborted) return { blob: new Blob() };
      return { blob, filename: `${base}-ringtone.mp3` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Make ringtone"
        runIcon="Bell"
        resultTitle="Your ringtone"
        softMaxMB={200}
        progressLabel="Building ringtone"
      >
        {(args) => (
          <RingtoneControls
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
