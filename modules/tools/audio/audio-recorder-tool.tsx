"use client";

/**
 * Audio Recorder, flagship "Record" tool of the GigAI Audio Toolkit.
 *
 * Record the microphone (live level meter + timer, via the shared
 * {@link AudioRecorder} + record.ts) → decode the take → trim the dead air off
 * the ends on a draggable {@link Waveform} while previewing in an
 * {@link AudioPlayer} → export a lossless WAV or a compact MP3 (selectable
 * bitrate) → download. Everything is captured and encoded on the user's device;
 * nothing is uploaded, and the mic-permission prompt is the browser's own.
 *
 * The WAV path is fully native; the MP3 path lazy-imports lamejs only when the
 * user actually exports MP3. No ffmpeg is ever loaded.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ErrorBanner } from "@/components/tool/dev/error-banner";
import {
  AudioRecorder,
  AudioPlayer,
  AudioResult,
  Waveform,
  decodeAudio,
  formatDuration,
  type WaveSelection,
} from "@/components/tool/audio";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";
import { trim as trimBuffer } from "@/lib/audio-tools/process";

type Stage = "record" | "edit" | "done";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 160, 192, 256, 320] as const;
type Mp3Bitrate = (typeof MP3_BITRATES)[number];

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The edit stage: decode the recorded take, let the user drag a keep-region on
 * the waveform, preview it, pick a format, and export. Kept in its own component
 * so it can own the (per-take) selection + playhead state.
 */
function EditStage({
  blob,
  onExport,
  onDiscard,
  busy,
}: {
  blob: Blob;
  onExport: (buffer: AudioBuffer, format: ExportFormat, bitrate: Mp3Bitrate) => void;
  onDiscard: () => void;
  busy: boolean;
}) {
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  // Selection as fractions 0–1; defaults to the whole take.
  const [selection, setSelection] = React.useState<WaveSelection>({ start: 0, end: 1 });
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<Mp3Bitrate>(192);

  // Decode the recorded blob once so we can draw + trim it.
  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    setDecodeError(null);
    setSelection({ start: 0, end: 1 });
    decodeAudio(blob)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch(() => {
        if (!cancelled) {
          setDecodeError(
            "Couldn't read that recording back for editing. You can still download it as-is below, or record a new take.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [blob]);

  const duration = buffer?.duration ?? 0;
  const startSec = duration * selection.start;
  const endSec = duration * selection.end;
  const keptSec = Math.max(0, endSec - startSec);

  // The trimmed buffer used for both preview and export. Recomputed only when
  // the selection or source changes; the whole take when the selection is full.
  const trimmed = React.useMemo<AudioBuffer | null>(() => {
    if (!buffer) return null;
    if (selection.start <= 0 && selection.end >= 1) return buffer;
    if (!(endSec > startSec)) return buffer;
    return trimBuffer(buffer, startSec, endSec);
  }, [buffer, selection.start, selection.end, startSec, endSec]);

  const handleSelect = React.useCallback((next: WaveSelection) => {
    const start = clamp(Math.min(next.start, next.end), 0, 1);
    const end = clamp(Math.max(next.start, next.end), 0, 1);
    setSelection({ start, end });
  }, []);

  const canExport = Boolean(trimmed) && keptSec > 0.02;

  if (decodeError) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorBanner error={decodeError} />
        <AudioResult
          blob={blob}
          filename="recording.webm"
          title="Your recording"
          onReset={onDiscard}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!buffer ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-10 text-sm text-muted-foreground">
          <Icon name="Loader" size={16} className="animate-spin" />
          Preparing your recording…
        </div>
      ) : (
        <>
          {/* Trim editor */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Icon name="Scissors" size={15} className="text-primary" />
              <span>Drag to keep just the part you want</span>
            </div>
            <Waveform
              buffer={buffer}
              selection={selection}
              onSelect={handleSelect}
              height={112}
              aria-label="Recording waveform, drag to select the region to keep"
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs tabular-nums text-muted-foreground">
              <span>
                Start{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(startSec, true)}
                </span>
              </span>
              <span>
                End{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(endSec, true)}
                </span>
              </span>
              <span>
                Keeping{" "}
                <span className="font-semibold text-primary">
                  {formatDuration(keptSec, true)}
                </span>
                {duration > 0 ? ` of ${formatDuration(duration)}` : null}
              </span>
            </div>
          </div>

          {/* Preview of the trimmed selection */}
          {trimmed ? (
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
                <Icon name="PlayCircle" size={14} />
                Preview your trimmed take
              </p>
              <AudioPlayer buffer={trimmed} waveHeight={64} />
            </div>
          ) : null}

          {/* Export controls */}
          <div className="rounded-lg border border-border bg-card p-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">
                Export format
              </legend>
              <div className="flex flex-wrap gap-2">
                {(["wav", "mp3"] as const).map((f) => {
                  const active = format === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:bg-accent",
                      )}
                    >
                      <Icon name="FileAudio" size={14} />
                      {f.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {format === "wav"
                  ? "Lossless and uncompressed, best for editing or archiving, but larger files."
                  : "Compressed and compact: best for sharing. Higher bitrate sounds better and weighs more."}
              </p>

              {format === "mp3" ? (
                <div className="mt-3">
                  <label
                    htmlFor="mp3-bitrate"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    MP3 bitrate
                  </label>
                  <div className="flex flex-wrap gap-1.5" id="mp3-bitrate" role="group">
                    {MP3_BITRATES.map((b) => {
                      const active = bitrate === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBitrate(b)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          {b} kbps
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </fieldset>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!canExport || busy}
                onClick={() => {
                  if (trimmed) onExport(trimmed, format, bitrate);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              >
                <Icon
                  name={busy ? "Loader" : "Download"}
                  size={15}
                  className={busy ? "animate-spin" : ""}
                />
                {busy
                  ? "Encoding…"
                  : `Export ${format.toUpperCase()}`}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onDiscard}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                <Icon name="RotateCcw" size={14} />
                Record again
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Audio Recorder tool. Composes the shared audio components (recorder →
 * waveform trim → player preview → result) with the native WAV encoder and the
 * lazy MP3 encoder. TS-strict clean; dark-mode, responsive and keyboard
 * accessible; honest about the mic-permission prompt and that everything stays
 * on the device.
 */
export default function AudioRecorderTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  const [stage, setStage] = React.useState<Stage>("record");
  const [recorded, setRecorded] = React.useState<Blob | null>(null);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRecorded = React.useCallback((blob: Blob) => {
    setError(null);
    setRecorded(blob);
    setStage("edit");
  }, []);

  const handleExport = React.useCallback(
    async (buffer: AudioBuffer, format: ExportFormat, bitrate: Mp3Bitrate) => {
      setBusy(true);
      setError(null);
      try {
        const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
        let blob: Blob;
        let filename: string;
        if (format === "mp3") {
          blob = await encodeMp3(buffer, { bitrate });
          filename = `recording-${stamp}.mp3`;
        } else {
          blob = encodeWav(buffer);
          filename = `recording-${stamp}.wav`;
        }
        setResult({ blob, filename });
        setStage("done");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while encoding your recording. Try again, or switch export format.",
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const reset = React.useCallback(() => {
    setRecorded(null);
    setResult(null);
    setError(null);
    setStage("record");
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {error ? <ErrorBanner error={error} onDismiss={() => setError(null)} /> : null}

      {stage === "record" ? (
        <div className="flex flex-col gap-3">
          <AudioRecorder onRecorded={handleRecorded} />
          <p className="flex items-start gap-1.5 px-1 text-xs text-muted-foreground">
            <Icon name="ShieldCheck" size={14} className="mt-px shrink-0 text-success" />
            Your browser will ask permission to use the microphone. Recording is
            captured and encoded on your device: nothing is uploaded, and it&apos;s
            gone when you close the tab.
          </p>
        </div>
      ) : null}

      {stage === "edit" && recorded ? (
        <EditStage
          key={recorded.size}
          blob={recorded}
          onExport={handleExport}
          onDiscard={reset}
          busy={busy}
        />
      ) : null}

      {stage === "done" && result ? (
        <AudioResult
          blob={result.blob}
          filename={result.filename}
          title="Recording ready"
          onReset={reset}
        />
      ) : null}
    </div>
  );
}
