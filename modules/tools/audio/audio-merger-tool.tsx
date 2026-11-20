"use client";

/**
 * Audio Merger, combine several clips into one continuous track, in the
 * browser.
 *
 * Drop a batch → each file decodes natively (no upload, no WASM) and joins a
 * reorderable list → drag rows to set the running order → choose a gapless join
 * or a crossfade with a selectable overlap → merge (native Web Audio) → preview
 * the combined track on a waveform → export a lossless WAV or a compact MP3 →
 * download. Everything runs on the user's device; the MP3 encoder is the only
 * lazy import and loads solely when MP3 is chosen.
 *
 * This is a multi-file tool, so it does NOT use the single-file AudioWorkspace
 * scaffold. It owns its own drop/list/merge/result plumbing while reusing the
 * shared audio primitives (dropzone visuals via FileDropZone, AudioPlayer,
 * AudioResult) and the native engine (decodeAudio, concatBuffers, encode).
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { FileDropZone } from "@/components/tool/dev/file-drop";
import {
  AudioPlayer,
  AudioResult,
  decodeAudio,
  formatBytes,
  formatDuration,
} from "@/components/tool/audio";
import { getAudioContext } from "@/lib/audio-tools/context";
import { encodeWav, encodeMp3 } from "@/lib/audio-tools/encode";

type ExportFormat = "wav" | "mp3";

const MP3_BITRATES = [128, 192, 256, 320] as const;

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|webm|aiff?|caf)$/i;

/** A dropped clip: the source file plus its decoded buffer + derived facts. */
interface Clip {
  /** Stable id for list keys / DnD (name+size+counter is unique enough here). */
  id: string;
  file: File;
  buffer: AudioBuffer;
  duration: number;
  channels: number;
  sampleRate: number;
}

let clipCounter = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Merge decoded buffers into one, optionally crossfading each seam.
 *
 * With `crossfadeSec <= 0` this is a plain end-to-end concat (delegated to the
 * engine's channel-reconciling {@link concatBuffers} semantics, re-implemented
 * here so the crossfade and gapless paths share one channel-mixing rule).
 *
 * With a crossfade, adjacent clips overlap by `overlap` frames: the tail of
 * the left clip ramps down linearly as the head of the right clip ramps up -
 * so the total length shrinks by one overlap per seam. The overlap is capped to
 * the shorter of the two neighbours so a fade never runs past a clip's edge.
 */
function mergeBuffers(buffers: AudioBuffer[], crossfadeSec: number): AudioBuffer {
  if (buffers.length === 0) throw new Error("Add at least one clip to merge.");
  const ctx = getAudioContext();
  const first = buffers[0]!;
  const sampleRate = first.sampleRate;
  const channels = buffers.reduce((max, b) => Math.max(max, b.numberOfChannels), 1);

  // Per-seam overlap in frames, capped to each neighbour so fades stay in-bounds.
  const wantOverlap = Math.max(0, Math.round(crossfadeSec * sampleRate));
  const overlaps: number[] = [];
  for (let i = 1; i < buffers.length; i++) {
    const left = buffers[i - 1]!;
    const right = buffers[i]!;
    overlaps.push(Math.min(wantOverlap, left.length, right.length));
  }

  const totalLength =
    buffers.reduce((sum, b) => sum + b.length, 0) -
    overlaps.reduce((sum, o) => sum + o, 0);

  const out = ctx.createBuffer(channels, Math.max(1, totalLength), sampleRate);

  // Read a source frame for an output channel, spreading mono across channels
  // and falling back to channel 0 when a source has fewer channels.
  const readSample = (b: AudioBuffer, ch: number, frame: number): number => {
    const srcCh = b.numberOfChannels === 1 ? 0 : Math.min(ch, b.numberOfChannels - 1);
    return b.getChannelData(srcCh)[frame] ?? 0;
  };

  // Write position of the current clip's start in the output timeline. Each
  // clip after the first starts `overlap` frames before the previous clip ends.
  let writeStart = 0;
  for (let ch = 0; ch < channels; ch++) {
    const dst = out.getChannelData(ch);
    writeStart = 0;
    for (let i = 0; i < buffers.length; i++) {
      const b = buffers[i]!;
      const overlapIn = i > 0 ? overlaps[i - 1]! : 0; // overlap with previous
      for (let f = 0; f < b.length; f++) {
        const pos = writeStart + f;
        if (pos < 0 || pos >= dst.length) continue;
        let g = 1;
        if (overlapIn > 0 && f < overlapIn) {
          // Fade this clip IN over its leading overlap (the previous clip is
          // simultaneously fading out into the same frames, additive mix).
          g = f / overlapIn;
          dst[pos] = (dst[pos] ?? 0) + readSample(b, ch, f) * g;
        } else {
          dst[pos] = readSample(b, ch, f);
        }
      }
      // Fade the trailing overlap of THIS clip OUT so it blends into the next.
      const overlapOut = i < buffers.length - 1 ? overlaps[i]! : 0;
      if (overlapOut > 0) {
        for (let k = 0; k < overlapOut; k++) {
          const f = b.length - overlapOut + k;
          const pos = writeStart + f;
          if (pos < 0 || pos >= dst.length) continue;
          const g = 1 - k / overlapOut; // ramp 1 → 0
          // Overwrite the plain write above with the faded tail; the next clip
          // adds its faded-in head onto these same frames.
          dst[pos] = readSample(b, ch, f) * g;
        }
      }
      // Advance: full clip length minus the overlap shared with the next clip.
      writeStart += b.length - overlapOut;
    }
  }

  // Guard against additive clipping introduced by the crossfade sum.
  if (crossfadeSec > 0) {
    for (let ch = 0; ch < channels; ch++) {
      const dst = out.getChannelData(ch);
      for (let i = 0; i < dst.length; i++) {
        const v = dst[i]!;
        if (v > 1) dst[i] = 1;
        else if (v < -1) dst[i] = -1;
      }
    }
  }

  return out;
}

/** One reorderable clip row. */
function ClipRow({
  clip,
  index,
  total,
  disabled,
  dragging,
  isDropTarget,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onMove,
  onRemove,
}: {
  clip: Clip;
  index: number;
  total: number;
  disabled: boolean;
  dragging: boolean;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <li
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(e) => e.preventDefault()}
      className={cn(
        "group flex items-center gap-2 rounded-md border bg-card px-2.5 py-2 transition-colors",
        dragging ? "opacity-40" : "opacity-100",
        isDropTarget ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground active:cursor-grabbing",
          disabled && "cursor-not-allowed opacity-50",
        )}
        aria-hidden="true"
      >
        <Icon name="GripVertical" size={16} />
      </span>

      <span className="grid size-6 shrink-0 place-items-center rounded bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={clip.file.name}>
          {clip.file.name}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatDuration(clip.duration)} · {clip.channels > 1 ? "Stereo" : "Mono"} ·{" "}
          {formatBytes(clip.file.size)}
        </p>
      </div>

      {/* Keyboard-accessible reorder controls (mirror the drag). */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={disabled || index === 0}
          aria-label={`Move ${clip.file.name} up`}
          className="grid size-7 place-items-center rounded text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <Icon name="ChevronUp" size={15} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={disabled || index === total - 1}
          aria-label={`Move ${clip.file.name} down`}
          className="grid size-7 place-items-center rounded text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <Icon name="ChevronDown" size={15} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${clip.file.name}`} title={`Remove ${clip.file.name}`}
          className="grid size-7 place-items-center rounded text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
        >
          <Icon name="X" size={15} />
        </button>
      </div>
    </li>
  );
}

/**
 * Audio Merger tool. Owns the clip list, ordering (drag + keyboard), crossfade
 * and format options, and the native merge → encode → preview → download flow.
 * TS-strict clean; dark-mode, responsive and keyboard-accessible; honest about
 * the memory-bound, in-browser nature of the engine and MP3 lossiness.
 */
export default function AudioMergerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [clips, setClips] = React.useState<Clip[]>([]);
  const [format, setFormat] = React.useState<ExportFormat>("wav");
  const [bitrate, setBitrate] = React.useState<number>(192);
  const [crossfade, setCrossfade] = React.useState<boolean>(false);
  const [crossfadeSec, setCrossfadeSec] = React.useState<number>(0.5);

  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);

  // Live preview of the merged track (decoded buffer + WAV blob), rebuilt lazily.
  const [preview, setPreview] = React.useState<{ buffer: AudioBuffer; blob: Blob } | null>(null);
  const [previewBusy, setPreviewBusy] = React.useState(false);

  // Drag-reorder cursor state.
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const disabled = busy || loading;

  const totalDuration = React.useMemo(
    () => clips.reduce((sum, c) => sum + c.duration, 0),
    [clips],
  );
  const totalSize = React.useMemo(
    () => clips.reduce((sum, c) => sum + c.file.size, 0),
    [clips],
  );
  // Effective crossfade seconds (0 when the toggle is off).
  const effXfade = crossfade ? Math.max(0, crossfadeSec) : 0;
  // Approx merged length: total minus one overlap per seam (visual estimate).
  const estMergedDuration = Math.max(
    0,
    totalDuration - effXfade * Math.max(0, clips.length - 1),
  );

  // Invalidate any preview/result whenever the inputs or options change.
  const invalidate = React.useCallback(() => {
    setPreview(null);
    setResult(null);
  }, []);

  // Decode a batch of dropped files and append them to the list.
  const handleFiles = React.useCallback(
    async (files: File[]) => {
      const audioFiles = files.filter(
        (f) => f.type.startsWith("audio/") || AUDIO_EXT.test(f.name),
      );
      if (audioFiles.length === 0) {
        setError("Those don't look like audio files. Drop MP3, WAV, M4A, OGG or FLAC clips.");
        return;
      }
      setError(null);
      setLoading(true);
      invalidate();
      const added: Clip[] = [];
      const failed: string[] = [];
      for (const file of audioFiles) {
        try {
          const buffer = await decodeAudio(file);
          added.push({
            id: `${file.name}-${file.size}-${clipCounter++}`,
            file,
            buffer,
            duration: buffer.duration,
            channels: buffer.numberOfChannels,
            sampleRate: buffer.sampleRate,
          });
        } catch {
          failed.push(file.name);
        }
      }
      if (added.length > 0) setClips((prev) => [...prev, ...added]);
      if (failed.length > 0) {
        setError(
          `Couldn't decode ${failed.length === 1 ? "" : "these"} in the browser: ${failed.join(", ")}. Try converting them first with the Audio Converter.`,
        );
      }
      setLoading(false);
    },
    [invalidate],
  );

  const moveClip = React.useCallback(
    (from: number, to: number) => {
      setClips((prev) => {
        if (to < 0 || to >= prev.length || from === to) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        if (moved) next.splice(to, 0, moved);
        return next;
      });
      invalidate();
    },
    [invalidate],
  );

  const removeClip = React.useCallback(
    (id: string) => {
      setClips((prev) => prev.filter((c) => c.id !== id));
      invalidate();
    },
    [invalidate],
  );

  const clearAll = React.useCallback(() => {
    setClips([]);
    setError(null);
    invalidate();
  }, [invalidate]);

  // Commit a drag-reorder when the pointer is released over a target row.
  const commitDrag = React.useCallback(() => {
    if (dragIndex != null && overIndex != null && dragIndex !== overIndex) {
      moveClip(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, overIndex, moveClip]);

  const orderedBuffers = React.useCallback(() => clips.map((c) => c.buffer), [clips]);

  // Build (or refresh) a decoded WAV preview of the merged track, native, sync.
  const makePreview = React.useCallback(() => {
    if (clips.length === 0) return;
    setError(null);
    setPreviewBusy(true);
    requestAnimationFrame(() => {
      try {
        const merged = mergeBuffers(orderedBuffers(), effXfade);
        setPreview({ buffer: merged, blob: encodeWav(merged) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't build the preview.");
      } finally {
        setPreviewBusy(false);
      }
    });
  }, [clips.length, orderedBuffers, effXfade]);

  // Run the merge and encode to the chosen format.
  const handleMerge = React.useCallback(async () => {
    if (clips.length === 0) {
      setError("Add at least one clip to merge.");
      return;
    }
    setError(null);
    setBusy(true);
    setResult(null);
    try {
      const merged = mergeBuffers(orderedBuffers(), effXfade);
      const first = clips[0]!;
      const base = first.file.name.replace(/\.[^.]+$/, "") || "audio";
      if (format === "mp3") {
        // MP3 encoder is lazily imported inside encodeMp3. No WASM, no ffmpeg.
        const blob = await encodeMp3(merged, { bitrate });
        setResult({ blob, filename: `${base}-merged.mp3` });
      } else {
        // WAV is a native, synchronous, lossless encode on the gapless path.
        const blob = encodeWav(merged);
        setResult({ blob, filename: `${base}-merged.wav` });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't merge those clips.");
    } finally {
      setBusy(false);
    }
  }, [clips, orderedBuffers, effXfade, format, bitrate]);

  const canMerge = clips.length > 0 && !disabled;

  return (
    <div className="flex flex-col gap-5">
      {/* Drop zone (always available so you can keep adding clips). */}
      <FileDropZone
        onFiles={handleFiles}
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.weba,.webm"
        multiple
        disabled={disabled}
        icon="Combine"
        className="min-h-[150px]"
        label={
          loading
            ? "Decoding clips…"
            : clips.length > 0
              ? "Drop more clips, click to browse, or paste"
              : "Drop audio clips, click to browse, or paste"
        }
        hint={
          loading
            ? "Reading durations and channels"
            : "Add several MP3, WAV, OGG, M4A or FLAC files: everything stays on your device"
        }
      />

      {error && (
        <p
          role="alert"
          className="flex items-start gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <Icon name="CircleAlert" size={14} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Clip list + ordering. */}
      {clips.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Icon name="ListOrdered" size={15} className={style.text} />
              <span>
                {clips.length} clip{clips.length === 1 ? "" : "s"} · drag to reorder
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <Icon name="Trash2" size={13} />
              Clear all
            </button>
          </div>

          <ul className="flex flex-col gap-1.5">
            {clips.map((clip, index) => (
              <ClipRow
                key={clip.id}
                clip={clip}
                index={index}
                total={clips.length}
                disabled={disabled}
                dragging={dragIndex === index}
                isDropTarget={overIndex === index && dragIndex !== index}
                onDragStart={() => setDragIndex(index)}
                onDragEnter={() => setOverIndex(index)}
                onDragEnd={commitDrag}
                onMove={(dir) => moveClip(index, index + dir)}
                onRemove={() => removeClip(clip.id)}
              />
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
            <span className="text-muted-foreground">
              Total in{" "}
              <span className="font-medium text-foreground">
                {formatDuration(totalDuration)}
              </span>
            </span>
            <span className="text-muted-foreground">
              Merged out{" "}
              <span className={cn("font-semibold", style.text)}>
                ≈ {formatDuration(estMergedDuration)}
              </span>
            </span>
            <span className="text-muted-foreground">
              Input size{" "}
              <span className="font-medium text-foreground">{formatBytes(totalSize)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Options: crossfade + export format. */}
      {clips.length > 0 && (
        <fieldset className="flex flex-col gap-4" disabled={busy}>
          <legend className="sr-only">Merge options</legend>

          {/* Crossfade toggle + length. */}
          <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={crossfade}
                onChange={(e) => {
                  setCrossfade(e.target.checked);
                  invalidate();
                }}
                className="size-4 accent-primary"
              />
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Icon name="Blend" size={15} className={style.text} />
                Crossfade the joins
              </span>
              <span className="text-xs text-muted-foreground">
                Blend each seam instead of a hard cut
              </span>
            </label>

            {crossfade && (
              <div className="flex flex-wrap items-center gap-3 pl-7 pt-1">
                <label className="flex flex-1 items-center gap-3 text-xs text-muted-foreground">
                  <span className="shrink-0">Overlap</span>
                  <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={crossfadeSec}
                    onChange={(e) => {
                      setCrossfadeSec(clamp(Number(e.target.value), 0.1, 5));
                      invalidate();
                    }}
                    className="h-1.5 flex-1 accent-primary"
                    aria-label="Crossfade overlap in seconds"
                  />
                  <span className="w-12 shrink-0 text-right font-medium tabular-nums text-foreground">
                    {crossfadeSec.toFixed(1)}s
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Export format + bitrate. */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Export format</span>
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
                    onClick={() => {
                      setFormat(opt.key);
                      setResult(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? cn("bg-primary/10 text-foreground", style.border)
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon
                      name={active ? "CircleCheck" : "Circle"}
                      size={15}
                      className={active ? style.text : ""}
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
          </div>
        </fieldset>
      )}

      {/* Preview of the combined track. */}
      {clips.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">Preview merged track</span>
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
              {preview ? "Refresh preview" : "Preview merge"}
            </button>
          </div>
          {preview ? (
            <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={80} />
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
              Set the order and press “Preview merge” to hear the whole combined track, with your
              crossfade, if enabled, before you export.
            </p>
          )}
        </div>
      )}

      {/* Merge action. */}
      {clips.length > 0 && (
        <button
          type="button"
          onClick={handleMerge}
          disabled={!canMerge}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name={busy ? "LoaderCircle" : "Combine"} size={16} className={busy ? "animate-spin" : ""} />
          {busy
            ? "Merging…"
            : `Merge ${clips.length} clip${clips.length === 1 ? "" : "s"} → ${format.toUpperCase()}`}
        </button>
      )}

      {/* Result. */}
      {result && (
        <AudioResult
          blob={result.blob}
          filename={result.filename}
          originalSize={totalSize > 0 ? totalSize : undefined}
          onReset={() => setResult(null)}
          title="Merged track"
        />
      )}
    </div>
  );
}
