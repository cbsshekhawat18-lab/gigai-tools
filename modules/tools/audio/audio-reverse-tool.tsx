"use client";

/**
 * Audio Reverse: flip a track so it plays backwards, end to first.
 *
 * Drop a file → it decodes natively (no upload, no WASM) and paints a real
 * waveform → preview the reversed result on a seekable player → export a
 * lossless WAV → download. The reversal is a pure Web Audio sample-order flip
 * ({@link reverse}) applied per channel, so stereo imaging is preserved and the
 * output is bit-for-bit the source played backwards. Nothing leaves the tab and
 * no ffmpeg is ever loaded. WAV is written natively.
 *
 * The {@link AudioWorkspace} scaffold owns the file/probe/busy/progress/abort/
 * error/result plumbing; this module supplies the options slot (waveform +
 * reversed preview) and the `onRun` reverse function.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  AudioWorkspace,
  Waveform,
  AudioPlayer,
  decodeAudio,
  describeAudio,
  formatDuration,
  type AudioMeta,
  type AudioRunHooks,
  type AudioRunResult,
} from "@/components/tool/audio";
import { reverse } from "@/lib/audio-tools/process";
import { encodeWav } from "@/lib/audio-tools/encode";

/**
 * The options slot: decode the dropped file, draw its waveform, and let the user
 * preview the reversed result before committing. Kept in its own component
 * (keyed on the file) so the decoded buffer and preview reset cleanly on a fresh
 * drop.
 */
function ReverseControls({
  file,
  meta,
  busy,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
}) {
  const duration =
    Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);

  // Preview of the reversed track: a decoded buffer + its WAV blob.
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

  // Build a decoded preview of the reversed track (native, instant).
  const makePreview = React.useCallback(() => {
    if (!buffer) return;
    setPreviewBusy(true);
    // Defer so the button shows its busy state before the (sync) reverse runs.
    requestAnimationFrame(() => {
      try {
        const flipped = reverse(buffer);
        const blob = encodeWav(flipped);
        setPreview({ buffer: flipped, blob });
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [buffer]);

  const disabled = busy || duration <= 0 || !buffer;

  return (
    <div className="flex flex-col gap-4">
      {/* Source waveform */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="Rewind" size={15} className="text-primary" />
          <span>This whole track will play backwards, last frame to first</span>
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
            height={120}
            aria-label="Source waveform. The whole track will be reversed"
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

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
          {duration > 0 && <span>Length {formatDuration(duration)}</span>}
          <span>{describeAudio(meta)}</span>
          <span>Output: lossless WAV, same pitch and tempo, reversed in time</span>
        </p>
      </div>

      {/* Preview of the reversed track */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            Preview reversed
          </span>
          <button
            type="button"
            onClick={makePreview}
            disabled={disabled || previewBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={previewBusy ? "LoaderCircle" : "Rewind"}
              size={14}
              className={previewBusy ? "animate-spin" : ""}
            />
            {preview ? "Refresh preview" : "Preview reversed"}
          </button>
        </div>
        {preview ? (
          <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Press “Preview reversed” to hear the track played backwards before you
            export - handy for lining up a reversed swell or checking a backmasked
            line.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Audio Reverse tool. Composes {@link AudioWorkspace} with a waveform + reversed
 * preview options slot and the native {@link reverse} operation, then encodes
 * the flipped buffer to a lossless WAV. TS-strict clean; dark-mode, responsive
 * and keyboard-accessible; honest about the memory-bound, in-browser engine and
 * that the reversal is exact and lossless on the WAV path.
 */
export default function AudioReverseTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      // Decode natively (no ffmpeg), flip sample order per channel.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };

      const flipped = reverse(buffer);
      // WAV is a native, synchronous, lossless encode.
      const blob = encodeWav(flipped);
      hooks.onProgress(1);

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";
      return { blob, filename: `${base}-reversed.wav` };
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <AudioWorkspace
        onRun={handleRun}
        runLabel="Reverse audio"
        runIcon="Rewind"
        resultTitle="Reversed audio"
        softMaxMB={200}
        progressLabel="Reversing"
      >
        {(args) => (
          <ReverseControls
            key={args.file.name + args.file.size}
            file={args.file}
            meta={args.meta}
            busy={args.busy}
          />
        )}
      </AudioWorkspace>
    </div>
  );
}
