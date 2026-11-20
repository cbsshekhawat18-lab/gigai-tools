"use client";

/**
 * Audio Cutter, the "remove the middle" editor, companion to the Audio Trimmer.
 *
 * Drop a track → it decodes natively (no upload, no WASM) and paints a real
 * waveform → drag a selection region over the span to delete → preview the
 * already-joined result (before + after stitched) → export a lossless WAV or a
 * compact MP3 → download. Everything runs on the user's device; the MP3 encoder
 * is the only lazy import and loads solely when MP3 is chosen.
 *
 * Where the trimmer KEEPS the selected region, the cutter REMOVES it and joins
 * what's left, via the native {@link cut} operation. The {@link AudioWorkspace}
 * scaffold owns the file/probe/busy/progress/abort/error/result plumbing; this
 * module supplies the options slot and the `onRun` cut function.
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
import { cut } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Live selection state (the span to remove) shared with the run handler. */
interface CutState {
  /** Removal-span start in seconds. */
  start: number;
  /** Removal-span end in seconds. */
  end: number;
  format: ExportFormat;
  bitrate: number;
}

/**
 * The options slot: decode the file, draw the waveform, host a draggable
 * selection region marking the span to DELETE, preview the joined result, and
 * expose format + bitrate controls. Kept in its own component (keyed on the
 * file) so the decoded buffer and per-file selection reset cleanly on a fresh
 * drop.
 */
function CutControls({
  file,
  busy,
  onStateChange,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
  onStateChange: (state: CutState) => void;
}) {
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  // Selection as fractions 0–1 (the Waveform's native unit). Default to a small
  // central span so it reads as "remove this bit", not "remove everything".
  const [selection, setSelection] = React.useState<WaveSelection>({
    start: 0.4,
    end: 0.6,
  });
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  // Preview of the JOINED result (before + after), a decoded buffer + WAV blob.
  const [preview, setPreview] = React.useState<{
    buffer: AudioBuffer;
    blob: Blob;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  const duration =
    buffer && buffer.duration > 0 ? buffer.duration : 0;

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

  // Seconds derived from the fractional selection (bounded to the real length).
  const startSec =
    duration > 0 ? clamp(selection.start * duration, 0, duration) : 0;
  const endSec =
    duration > 0 ? clamp(selection.end * duration, 0, duration) : 0;
  const removeSec = Math.max(0, endSec - startSec);
  const remainingSec = Math.max(0, duration - removeSec);

  // Publish the live selection + export options up to the run handler.
  React.useEffect(() => {
    onStateChange({ start: startSec, end: endSec, format, bitrate });
  }, [startSec, endSec, format, bitrate, onStateChange]);

  // A new selection invalidates any stale preview.
  const handleSelect = React.useCallback((next: WaveSelection) => {
    setSelection({
      start: clamp(next.start, 0, 1),
      end: clamp(Math.max(next.end, next.start), 0, 1),
    });
    setPreview(null);
  }, []);

  // Build a decoded preview of the JOINED result (native, instant).
  const makePreview = React.useCallback(() => {
    if (!buffer || removeSec <= 0) return;
    setPreviewBusy(true);
    // Defer so the button shows its busy state before the (sync) splice runs.
    requestAnimationFrame(() => {
      try {
        const joined = cut(buffer, startSec, endSec);
        const blob = encodeWav(joined);
        setPreview({ buffer: joined, blob });
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [buffer, startSec, endSec, removeSec]);

  const disabled = busy || duration <= 0 || !buffer;
  const noRegion = removeSec <= 0;
  const removesEverything = duration > 0 && remainingSec <= 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Waveform + draggable selection (the span to remove) */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="Scissors" size={15} className="text-primary" />
          <span>Drag across the waveform to select the part you want to remove</span>
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
            aria-label="Cut selection, drag to set the region to remove"
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
          The highlighted span is what gets deleted, the audio before and after it
          is joined together. Drag the region&apos;s body to slide it, pull an edge to
          resize, or focus it and nudge with the arrow keys (Shift for a bigger
          step, Alt for a finer one, Ctrl/Cmd to move just the end edge).
        </p>
      </div>

      {/* Live removing / remaining readout */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
        <span className="text-muted-foreground">
          Cut from{" "}
          <span className="font-medium text-foreground">
            {formatDuration(startSec, true)}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {formatDuration(endSec, true)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Removing{" "}
          <span
            className={cn(
              "font-semibold",
              noRegion ? "text-warning" : "text-primary",
            )}
          >
            {formatDuration(removeSec, true)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Remaining{" "}
          <span
            className={cn(
              "font-semibold",
              removesEverything ? "text-warning" : "text-foreground",
            )}
          >
            {formatDuration(remainingSec, true)}
          </span>
          {duration > 0 ? ` of ${formatDuration(duration)}` : null}
        </span>
      </div>

      {removesEverything && (
        <p
          role="alert"
          className="flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
        >
          <Icon name="TriangleAlert" size={14} className="shrink-0" />
          That selection covers the whole track: nothing would be left. Make the
          removal span shorter so some audio remains.
        </p>
      )}

      {/* Preview of the joined result */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            Preview result
          </span>
          <button
            type="button"
            onClick={makePreview}
            disabled={disabled || noRegion || removesEverything || previewBusy}
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
            Set the span to remove and press “Preview result” to hear the audio
            with that section cut out and the rest joined: check the seam before
            you export.
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
 * Audio Cutter tool. Composes {@link AudioWorkspace} with an interactive
 * waveform-selection options slot and the native {@link cut} operation (remove
 * the span, join the rest), then encodes the result to WAV (native) or MP3
 * (lazy encoder). TS-strict clean; dark-mode, responsive and keyboard-accessible;
 * honest about the memory-bound, in-browser nature of the engine.
 */
export default function AudioCutterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live removal span + export options, updated by the options slot and read
  // at run time. A ref avoids re-running the workspace's onRun identity.
  const stateRef = React.useRef<CutState>({
    start: 0,
    end: 0,
    format: "wav",
    bitrate: 192,
  });
  const setState = React.useCallback((state: CutState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      const { start, end, format, bitrate } = stateRef.current;

      if (!(end > start)) {
        throw new Error(
          "Select a span to remove first, drag across the waveform so the start and end are apart.",
        );
      }

      // Decode natively (no ffmpeg), splice out the span on exact frame
      // boundaries and join what's left.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };

      if (!(end < buffer.duration) && !(start > 0)) {
        throw new Error(
          "That selection covers the whole track. Nothing would be left. Make the removal span shorter so some audio remains.",
        );
      }

      const joined = cut(buffer, start, end);
      if (joined.length <= 0) {
        throw new Error(
          "The cut would leave no audio. Make the removal span shorter so some audio remains.",
        );
      }

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";

      if (format === "mp3") {
        // MP3 encoder is lazily imported inside encodeMp3. No WASM, no ffmpeg.
        const blob = await encodeMp3(joined, { bitrate }, (p) =>
          hooks.onProgress(clamp(p, 0, 1)),
        );
        if (hooks.signal.aborted) return { blob: new Blob() };
        return { blob, filename: `${base}-cut.mp3` };
      }

      // WAV is a native, synchronous, lossless encode.
      const blob = encodeWav(joined);
      hooks.onProgress(1);
      return { blob, filename: `${base}-cut.wav` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Cut audio"
        runIcon="Scissors"
        resultTitle="Cut clip"
        softMaxMB={200}
        progressLabel="Cutting"
      >
        {(args) => (
          <CutControls
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
