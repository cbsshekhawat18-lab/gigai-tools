"use client";

/**
 * Audio Trimmer: flagship in-browser audio tool and the Web Audio + waveform
 * showcase.
 *
 * Drop a track → it decodes natively (no upload, no WASM) and paints a real
 * waveform → drag a selection region over it to mark the slice to keep → preview
 * just that region → export a lossless WAV or a compact MP3 → download.
 * Everything runs on the user's device; the MP3 encoder is the only lazy import
 * and loads solely when MP3 is chosen.
 *
 * The {@link AudioWorkspace} scaffold owns the file/probe/busy/progress/abort/
 * error/result plumbing; this module supplies the options slot (waveform +
 * selection + preview + format controls) and the `onRun` trim function.
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
import { trim } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Live selection state shared with the run handler. */
interface TrimState {
  /** Selection start in seconds. */
  start: number;
  /** Selection end in seconds. */
  end: number;
  format: ExportFormat;
  bitrate: number;
}

/**
 * The options slot: decode the file, draw the waveform, host a draggable
 * selection region, preview only that region, and expose format + bitrate
 * controls. Kept in its own component (keyed on the file) so the decoded buffer
 * and per-file selection reset cleanly on a fresh drop.
 */
function TrimControls({
  file,
  meta,
  busy,
  onStateChange,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
  onStateChange: (state: TrimState) => void;
}) {
  const duration =
    Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  // Selection as fractions 0–1 (the Waveform's native unit); default full clip.
  const [selection, setSelection] = React.useState<WaveSelection>({
    start: 0,
    end: 1,
  });
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  // Preview of just the selected region, a decoded buffer + its WAV blob.
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

  // Seconds derived from the fractional selection (bounded to the real length).
  const startSec = duration > 0 ? clamp(selection.start * duration, 0, duration) : 0;
  const endSec = duration > 0 ? clamp(selection.end * duration, 0, duration) : 0;
  const keepSec = Math.max(0, endSec - startSec);

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

  // Build a decoded preview of the current region (native, instant).
  const makePreview = React.useCallback(() => {
    if (!buffer || keepSec <= 0) return;
    setPreviewBusy(true);
    // Defer so the button shows its busy state before the (sync) slice runs.
    requestAnimationFrame(() => {
      try {
        const clip = trim(buffer, startSec, endSec);
        const blob = encodeWav(clip);
        setPreview({ buffer: clip, blob });
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [buffer, startSec, endSec, keepSec]);

  const disabled = busy || duration <= 0 || !buffer;
  const noRegion = keepSec <= 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Waveform + draggable selection */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="Scissors" size={15} className="text-primary" />
          <span>Drag across the waveform to select the part you want to keep</span>
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
            aria-label="Trim selection, drag to set the region to keep"
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
          Tip: drag the region&apos;s body to slide it, pull an edge to resize, or focus
          it and nudge with the arrow keys, Shift for a bigger step, Alt for a
          finer one, Ctrl/Cmd to move just the end edge.
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
          Keeping{" "}
          <span
            className={cn(
              "font-semibold",
              noRegion ? "text-warning" : "text-primary",
            )}
          >
            {formatDuration(keepSec, true)}
          </span>
          {duration > 0 ? ` of ${formatDuration(duration)}` : null}
        </span>
      </div>

      {/* Preview of just the selection */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">Preview selection</span>
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
            {preview ? "Refresh preview" : "Preview selection"}
          </button>
        </div>
        {preview ? (
          <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Set a region and press “Preview selection” to hear just the part you&apos;re
            keeping before you export.
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
 * Audio Trimmer tool. Composes {@link AudioWorkspace} with an interactive
 * waveform-selection options slot and the native {@link trim} operation, then
 * encodes the kept region to WAV (native) or MP3 (lazy encoder). TS-strict
 * clean; dark-mode, responsive and keyboard-accessible; honest about the
 * memory-bound, in-browser nature of the engine.
 */
export default function AudioTrimmerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live selection + export options, updated by the options slot and read
  // at run time. A ref avoids re-running the workspace's onRun identity.
  const stateRef = React.useRef<TrimState>({
    start: 0,
    end: 0,
    format: "wav",
    bitrate: 192,
  });
  const setState = React.useCallback((state: TrimState) => {
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
          "Select a region to keep first, drag across the waveform so the start and end are apart.",
        );
      }

      // Decode natively (no ffmpeg), slice on exact frame boundaries.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };
      const clip = trim(buffer, start, end);

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";

      if (format === "mp3") {
        // MP3 encoder is lazily imported inside encodeMp3. No WASM, no ffmpeg.
        const blob = await encodeMp3(clip, { bitrate }, (p) =>
          hooks.onProgress(clamp(p, 0, 1)),
        );
        if (hooks.signal.aborted) return { blob: new Blob() };
        return { blob, filename: `${base}-trimmed.mp3` };
      }

      // WAV is a native, synchronous, lossless encode.
      const blob = encodeWav(clip);
      hooks.onProgress(1);
      return { blob, filename: `${base}-trimmed.wav` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Trim audio"
        runIcon="Scissors"
        resultTitle="Trimmed clip"
        softMaxMB={200}
        progressLabel="Trimming"
      >
        {(args) => (
          <TrimControls
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
