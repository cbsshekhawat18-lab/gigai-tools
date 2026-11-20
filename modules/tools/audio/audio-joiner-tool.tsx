"use client";

/**
 * Audio Joiner: combine several clips into one continuous track, in-browser.
 *
 * Drop multiple files → each decodes natively (no upload, no WASM) and joins an
 * ordered list → drag them up/down into sequence → preview the whole joined
 * track → export a lossless WAV or a compact MP3 → download. Everything runs on
 * the user's device; the MP3 encoder is the only lazy import and loads solely
 * when MP3 is chosen.
 *
 * Unlike single-file tools, a joiner is inherently multi-input, so this module
 * composes the audio primitives directly (multi-file {@link FileDropZone}, an
 * ordered clip list, an {@link AudioPlayer} preview and {@link AudioResult})
 * rather than the single-file {@link AudioWorkspace} scaffold. The join itself
 * is the native {@link merge} (an exact end-to-end concat).
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  AudioPlayer,
  AudioResult,
  decodeAudio,
  formatBytes,
  formatDuration,
} from "@/components/tool/audio";
import { FileDropZone, ErrorBanner } from "@/components/tool/dev";
import { merge } from "@/lib/audio-tools/process";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

const ACCEPT = "audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.weba,.webm";
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|webm|aiff?|caf)$/i;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** A clip in the ordered join list. */
interface Clip {
  /** Stable id for React keys and reorder targeting. */
  id: string;
  file: File;
  /** Duration in seconds once decoded; null while probing or on failure. */
  duration: number | null;
  /** True if the browser couldn't decode it. */
  failed: boolean;
}

let clipSeq = 0;
function nextClipId(): string {
  clipSeq += 1;
  return `clip-${clipSeq}`;
}

/** Accept only files that look like audio (by MIME or extension). */
function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/") || AUDIO_EXT.test(file.name);
}

export default function AudioJoinerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [clips, setClips] = React.useState<Clip[]>([]);
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);

  const [preview, setPreview] = React.useState<{
    buffer: AudioBuffer;
    blob: Blob;
  } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(
    null,
  );
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  // Any change to the clip list invalidates a stale preview / result.
  const invalidateOutputs = React.useCallback(() => {
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  // Add dropped/picked files, probing each for duration in the background.
  const addFiles = React.useCallback(
    (files: File[]) => {
      const audio = files.filter(isAudioFile);
      if (!audio.length) {
        setError("Those didn't look like audio files: drop MP3, WAV, M4A, OGG or FLAC.");
        return;
      }
      invalidateOutputs();
      const added: Clip[] = audio.map((file) => ({
        id: nextClipId(),
        file,
        duration: null,
        failed: false,
      }));
      setClips((prev) => [...prev, ...added]);

      // Probe durations off the main flow; update each clip as it resolves.
      for (const clip of added) {
        decodeAudio(clip.file)
          .then((buf) => {
            setClips((prev) =>
              prev.map((c) =>
                c.id === clip.id ? { ...c, duration: buf.duration } : c,
              ),
            );
          })
          .catch(() => {
            setClips((prev) =>
              prev.map((c) =>
                c.id === clip.id ? { ...c, failed: true } : c,
              ),
            );
          });
      }
    },
    [invalidateOutputs],
  );

  const removeClip = React.useCallback(
    (id: string) => {
      invalidateOutputs();
      setClips((prev) => prev.filter((c) => c.id !== id));
    },
    [invalidateOutputs],
  );

  const moveClip = React.useCallback(
    (index: number, dir: -1 | 1) => {
      invalidateOutputs();
      setClips((prev) => {
        const target = index + dir;
        if (target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        const a = next[index];
        const b = next[target];
        if (!a || !b) return prev;
        next[index] = b;
        next[target] = a;
        return next;
      });
    },
    [invalidateOutputs],
  );

  const reset = React.useCallback(() => {
    setClips([]);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setBusy(false);
  }, []);

  // Usable clips = decodable ones, in order.
  const usableClips = React.useMemo(
    () => clips.filter((c) => !c.failed),
    [clips],
  );
  const knownDuration = React.useMemo(
    () =>
      usableClips.reduce((sum, c) => sum + (c.duration ?? 0), 0),
    [usableClips],
  );
  const totalSize = React.useMemo(
    () => clips.reduce((sum, c) => sum + c.file.size, 0),
    [clips],
  );
  const stillProbing = usableClips.some((c) => c.duration === null);
  const canJoin = usableClips.length >= 2 && !busy;

  // Decode every usable clip in list order and concat into one buffer.
  const buildJoined = React.useCallback(async (): Promise<AudioBuffer> => {
    const buffers: AudioBuffer[] = [];
    for (const clip of usableClips) {
      buffers.push(await decodeAudio(clip.file));
    }
    return merge(buffers);
  }, [usableClips]);

  const makePreview = React.useCallback(async () => {
    if (usableClips.length < 2 || previewBusy) return;
    setPreviewBusy(true);
    setError(null);
    try {
      const joined = await buildJoined();
      const blob = encodeWav(joined);
      setPreview({ buffer: joined, blob });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't decode one of those clips in the browser.",
      );
    } finally {
      setPreviewBusy(false);
    }
  }, [usableClips, previewBusy, buildJoined]);

  const runJoin = React.useCallback(async () => {
    if (usableClips.length < 2) {
      setError("Add at least two clips to join.");
      return;
    }
    setBusy(true);
    setError(null);
    setProgress(0);
    setResult(null);
    try {
      const joined = await buildJoined();

      const firstName =
        usableClips[0]?.file.name.replace(/\.[^.]+$/, "") || "audio";
      const base = `${firstName}-joined`;

      if (format === "mp3") {
        const blob = await encodeMp3(joined, { bitrate }, (p) =>
          setProgress(clamp(p, 0, 1)),
        );
        setResult({ blob, filename: `${base}.mp3` });
      } else {
        const blob = encodeWav(joined);
        setProgress(1);
        setResult({ blob, filename: `${base}.wav` });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't join those clips in the browser.",
      );
    } finally {
      setBusy(false);
    }
  }, [usableClips, buildJoined, format, bitrate]);

  // Result view: the finished, downloadable joined track.
  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <AudioResult
          blob={result.blob}
          filename={result.filename}
          originalSize={totalSize > 0 ? totalSize : undefined}
          onReset={reset}
          title="Joined track"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FileDropZone
        onFiles={addFiles}
        accept={ACCEPT}
        multiple
        disabled={busy}
        icon="Link"
        label={
          clips.length
            ? "Drop, browse or paste more clips to add"
            : "Drop audio clips, click to browse, or paste"
        }
        hint="MP3, WAV, M4A, AAC, OGG, FLAC, multiple files, joined in the order below. Everything stays in your browser."
      />

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {clips.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Icon name="ListOrdered" size={15} className="text-primary" />
              <span>
                Join order{" "}
                <span className="text-muted-foreground">
                  ({clips.length} {clips.length === 1 ? "clip" : "clips"})
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="Trash2" size={13} />
              Clear all
            </button>
          </div>

          <ul className="flex flex-col gap-1.5">
            {clips.map((clip, index) => (
              <li
                key={clip.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm",
                  clip.failed
                    ? "border-destructive/40 bg-destructive/10"
                    : "border-border bg-card",
                )}
              >
                <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <Icon
                  name={clip.failed ? "CircleAlert" : "FileAudio"}
                  size={15}
                  className={cn(
                    "shrink-0",
                    clip.failed ? "text-destructive" : "text-primary",
                  )}
                />
                <span className="min-w-0 flex-1 truncate" title={clip.file.name}>
                  {clip.file.name}
                </span>
                <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                  {clip.failed
                    ? "can't decode"
                    : clip.duration != null
                      ? formatDuration(clip.duration)
                      : "…"}
                </span>
                <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                  {formatBytes(clip.file.size)}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveClip(index, -1)}
                    disabled={busy || index === 0}
                    aria-label={`Move ${clip.file.name} up`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Icon name="ChevronUp" size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveClip(index, 1)}
                    disabled={busy || index === clips.length - 1}
                    aria-label={`Move ${clip.file.name} down`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Icon name="ChevronDown" size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeClip(clip.id)}
                    disabled={busy}
                    aria-label={`Remove ${clip.file.name}`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Icon name="X" size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
            <span className="text-muted-foreground">
              Clips to join{" "}
              <span className="font-medium text-foreground">
                {usableClips.length}
              </span>
            </span>
            <span className="text-muted-foreground">
              Combined length{" "}
              <span className="font-semibold text-primary">
                {formatDuration(knownDuration)}
                {stillProbing ? "+" : ""}
              </span>
            </span>
            <span className="text-muted-foreground">
              Total input{" "}
              <span className="font-medium text-foreground">
                {formatBytes(totalSize)}
              </span>
            </span>
          </div>
        </div>
      )}

      {clips.length > 0 && (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              Preview joined track
            </span>
            <button
              type="button"
              onClick={makePreview}
              disabled={usableClips.length < 2 || busy || previewBusy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                name={previewBusy ? "LoaderCircle" : "PlayCircle"}
                size={14}
                className={previewBusy ? "animate-spin" : ""}
              />
              {preview ? "Refresh preview" : "Preview joined track"}
            </button>
          </div>
          {preview ? (
            <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
              Add at least two clips, put them in order, then press “Preview joined
              track” to hear the whole sequence play through before you export.
            </p>
          )}
        </div>
      )}

      {clips.length > 0 && (
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
                    setResult(null);
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
                onChange={(e) => {
                  setBitrate(Number(e.target.value));
                  setResult(null);
                }}
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
      )}

      {clips.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={runJoin}
            disabled={!canJoin}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={busy ? "LoaderCircle" : "Link"}
              size={16}
              className={busy ? "animate-spin" : ""}
            />
            {busy
              ? format === "mp3"
                ? "Joining & encoding…"
                : "Joining…"
              : `Join ${usableClips.length >= 2 ? usableClips.length : ""} clips`.trim()}
          </button>

          {busy && format === "mp3" && (
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Encoding progress"
            >
              <div
                className="h-full bg-primary transition-[width] duration-150"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}

          {usableClips.length < 2 && (
            <p className="text-xs text-muted-foreground">
              Add at least two decodable clips to join them into one track.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
