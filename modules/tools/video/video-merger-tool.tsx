"use client";

/**
 * Video Merger: combine several clips into one continuous MP4, entirely in the
 * browser.
 *
 * Unlike the single-file flagships, merging needs a *list* of inputs the user
 * can reorder, so this module composes the video primitives directly instead of
 * the single-file {@link VideoWorkspace} scaffold: a multi-select dropzone, a
 * drag-to-reorder queue, the shared {@link FfmpegProgress} panel, and the
 * {@link VideoResult} card. The actual join runs via `operations.merge`, which
 * re-encodes each source to a common 1280×720 / 30fps / H.264 baseline so
 * mismatched clips concatenate cleanly. The ~31 MB wasm core is only fetched on
 * the first merge: nothing is uploaded.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { FileDropZone, ErrorBanner } from "@/components/tool/dev";
import { StatBadge } from "@/components/tool/dev/stat-badge";
import {
  FfmpegProgress,
  VideoResult,
  formatBytes,
  formatDuration,
  probeVideo,
  type VideoMeta,
} from "@/components/tool/video";
import { merge } from "@/lib/video-tools/operations";

/** A queued clip: the file, a stable id for React keys, and its probed meta. */
interface Clip {
  id: string;
  file: File;
  meta: VideoMeta | null;
}

const ACCEPT = "video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v";

/** Monotonic id source, avoids key collisions when the same file is re-added. */
let clipSeq = 0;
function nextId(): string {
  clipSeq += 1;
  return `clip-${clipSeq}`;
}

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function VideoMergerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [clips, setClips] = React.useState<Clip[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(-1);
  const [loadingEngine, setLoadingEngine] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ blob: Blob; name: string } | null>(
    null,
  );
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);

  // Probe and append newly dropped files (multi-select supported). Bad files are
  // skipped with an honest note rather than blocking the whole batch.
  const addFiles = React.useCallback(async (files: File[]) => {
    const videos = files.filter(
      (f) =>
        f.type.startsWith("video/") ||
        /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(f.name),
    );
    if (videos.length === 0) {
      setError("Those don't look like video files.");
      return;
    }
    setError(null);
    setResult(null);

    // Add immediately with meta pending, then fill probes in as they resolve so
    // the list feels responsive on a big multi-select.
    const added: Clip[] = videos.map((file) => ({
      id: nextId(),
      file,
      meta: null,
    }));
    setClips((prev) => [...prev, ...added]);

    await Promise.all(
      added.map(async (clip) => {
        try {
          const meta = await probeVideo(clip.file);
          setClips((prev) =>
            prev.map((c) => (c.id === clip.id ? { ...c, meta } : c)),
          );
        } catch {
          // Leave meta null, the row still merges; we just can't preview stats.
        }
      }),
    );
  }, []);

  const removeClip = React.useCallback((id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    setResult(null);
  }, []);

  const moveClip = React.useCallback((from: number, to: number) => {
    setClips((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });
    setResult(null);
  }, []);

  const clearAll = React.useCallback(() => {
    setClips([]);
    setResult(null);
    setError(null);
  }, []);

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const runMerge = React.useCallback(async () => {
    if (clips.length < 2 || busy) return;
    setError(null);
    setResult(null);
    setBusy(true);
    setProgress(-1);
    setLoadingEngine(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const out = await merge(
        clips.map((c) => c.file),
        (fraction) => {
          // Real progress means the engine has loaded and encoding has begun.
          setLoadingEngine(false);
          setProgress(clamp(fraction, 0, 1));
        },
      );

      if (controller.signal.aborted) return;

      if (!out.ok) {
        setError(out.error);
        return;
      }
      setResult({ blob: out.blob, name: out.outName });
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while merging.",
        );
      }
    } finally {
      setBusy(false);
      setLoadingEngine(false);
      setProgress(-1);
      abortRef.current = null;
    }
  }, [clips, busy]);

  // Aggregate stats for the queue summary.
  const totalBytes = clips.reduce((sum, c) => sum + c.file.size, 0);
  const knownDurations = clips.filter(
    (c) => c.meta && Number.isFinite(c.meta.duration),
  );
  const totalDuration = knownDurations.reduce(
    (sum, c) => sum + (c.meta?.duration ?? 0),
    0,
  );
  const someUnknown = knownDurations.length < clips.length;
  const canMerge = clips.length >= 2 && !busy;

  return (
    <div className="flex flex-col gap-4">
      {/* Always-available adder: multi-select drop zone. */}
      <FileDropZone
        onFiles={addFiles}
        accept={ACCEPT}
        multiple
        disabled={busy}
        icon="Combine"
        className="min-h-[160px]"
        label={
          clips.length === 0
            ? "Drop videos, click to browse, or paste"
            : "Add more videos"
        }
        hint="MP4, MOV, WebM, MKV, AVI: everything stays on your device"
      />

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {clips.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Queue header + summary */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Icon name="ListOrdered" size={15} className={style.text} />
              <span>
                {clips.length} clip{clips.length === 1 ? "" : "s"} - drag to set
                the order
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="Trash2" size={13} />
              Clear all
            </button>
          </div>

          {/* Reorderable clip list */}
          <ol className="flex flex-col gap-2">
            {clips.map((clip, index) => {
              const dragging = dragIndex === index;
              return (
                <li
                  key={clip.id}
                  draggable={!busy}
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(e) => {
                    if (dragIndex === null || dragIndex === index) return;
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null) moveClip(dragIndex, index);
                    setDragIndex(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-colors",
                    dragging
                      ? cn("opacity-60", style.border)
                      : "border-border",
                  )}
                >
                  {/* Drag handle + position */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "cursor-grab text-muted-foreground",
                        busy && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <Icon name="GripVertical" size={16} />
                    </span>
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        style.soft,
                      )}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-foreground"
                      title={clip.file.name}
                    >
                      {clip.file.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <StatBadge
                        label="Size"
                        value={formatBytes(clip.file.size)}
                        icon="HardDrive"
                      />
                      {clip.meta && Number.isFinite(clip.meta.duration) && (
                        <StatBadge
                          label="Length"
                          value={formatDuration(clip.meta.duration)}
                          icon="Clock"
                        />
                      )}
                      {clip.meta && clip.meta.width > 0 && (
                        <StatBadge
                          label="Res"
                          value={`${clip.meta.width}×${clip.meta.height}`}
                          icon="Ratio"
                        />
                      )}
                    </div>
                  </div>

                  {/* Reorder + remove controls */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveClip(index, index - 1)}
                      disabled={busy || index === 0}
                      aria-label={`Move ${clip.file.name} up`}
                      className="grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Icon name="ChevronUp" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveClip(index, index + 1)}
                      disabled={busy || index === clips.length - 1}
                      aria-label={`Move ${clip.file.name} down`}
                      className="grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Icon name="ChevronDown" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeClip(clip.id)}
                      disabled={busy}
                      aria-label={`Remove ${clip.file.name}`}
                      className="grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Queue totals */}
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Clips</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {clips.length}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Est. length</dt>
              <dd className={cn("text-sm font-semibold tabular-nums", style.text)}>
                {totalDuration > 0
                  ? `${someUnknown ? "~" : ""}${formatDuration(totalDuration)}`
                  : "—"}
              </dd>
            </div>
            <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
              <dt className="text-xs text-muted-foreground">Total input</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(totalBytes)}
              </dd>
            </div>
          </dl>

          {/* Merge action */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={runMerge}
              disabled={!canMerge}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground outline-none transition-colors",
                "bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Icon name="Combine" size={16} />
              {busy ? "Merging…" : "Merge videos"}
            </button>
            {clips.length < 2 && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Info" size={13} />
                Add at least two clips to merge.
              </p>
            )}
          </div>

          {/* Honest note on the heaviest operation. */}
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            <span>
              Merging re-encodes every clip to a common 1280×720 / 30fps baseline
              so mismatched sizes and formats join cleanly, it&apos;s the heaviest job
              here and runs in your browser via FFmpeg (WebAssembly), so long or
              large batches take real time and are memory-bound. Nothing is
              uploaded.
            </span>
          </p>
        </div>
      )}

      <FfmpegProgress
        busy={busy}
        progress={progress}
        loadingEngine={loadingEngine}
        label="Merging clips"
        onCancel={cancel}
      />

      {result && (
        <VideoResult
          blob={result.blob}
          filename={result.name}
          kind="video"
          title="Merged video"
          onReset={() => setResult(null)}
        />
      )}
    </div>
  );
}
