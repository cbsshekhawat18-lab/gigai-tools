"use client";

/**
 * Video Splitter: one video in, many clips out.
 *
 * Drop a clip → choose equal-length chunks (every N seconds) or a list of
 * custom start–end ranges → each segment is re-encoded locally by a self-hosted
 * FFmpeg WebAssembly core → preview any part, download them one by one, or grab
 * the whole set as a single in-browser ZIP. Everything runs on the user's
 * device; the ~31 MB wasm core is only fetched on the first split.
 *
 * Unlike the single-output flagships this tool produces a *set* of files, so it
 * doesn't ride VideoWorkspace's one-result path; it composes VideoDropzone,
 * FfmpegProgress and a custom results grid directly, while reusing the same
 * engine, helpers and honesty about in-browser FFmpeg's speed/size limits.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  VideoDropzone,
  VideoPlayer,
  FfmpegProgress,
  formatBytes,
  formatDuration,
  type VideoMeta,
} from "@/components/tool/video";
import { split, type SplitOptions } from "@/lib/video-tools/operations";
import { zipBlobs } from "@/lib/pdf/zip";
import { namedBlob } from "@/lib/pdf/types";

/** Trigger a browser download for a blob without leaving the tab. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the click a beat to register before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type SplitMode = "chunks" | "ranges";

/** A produced segment plus its own preview object URL. */
interface Segment {
  blob: Blob;
  name: string;
  url: string;
}

/**
 * Parse a single timecode: seconds (`90`, `90.5`), `M:SS` or `H:MM:SS`.
 * Returns null if it can't be read.
 */
function parseTimecode(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
  const parts = t.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  let seconds = 0;
  for (const part of parts) {
    if (!/^\d+(\.\d+)?$/.test(part.trim())) return null;
    seconds = seconds * 60 + Number(part.trim());
  }
  return seconds;
}

interface ParsedRanges {
  ranges: Array<[number, number]>;
  invalid: string | null;
}

/**
 * Parse a free-text list of `start-end` ranges (newline- or comma-separated).
 * Timecodes may be seconds or M:SS / H:MM:SS. Each range is validated against
 * the clip duration; the first entry that fails is reported in `invalid`.
 */
function parseRanges(text: string, duration: number): ParsedRanges {
  const entries = text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ranges: Array<[number, number]> = [];
  for (const entry of entries) {
    const dash = entry.indexOf("-");
    if (dash <= 0) return { ranges: [], invalid: entry };
    const start = parseTimecode(entry.slice(0, dash));
    const end = parseTimecode(entry.slice(dash + 1));
    if (start === null || end === null) return { ranges: [], invalid: entry };
    if (!(end > start)) return { ranges: [], invalid: entry };
    if (duration > 0 && (start >= duration || end > duration + 0.01)) {
      return { ranges: [], invalid: entry };
    }
    ranges.push([start, clamp(end, 0, duration > 0 ? duration : end)]);
  }
  return { ranges, invalid: null };
}

/** How many equal parts a chunk length yields for a given duration. */
function chunkCount(duration: number, everySec: number): number {
  if (duration <= 0 || everySec <= 0) return 0;
  return Math.ceil(duration / everySec);
}

export default function VideoSplitterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<VideoMeta | null>(null);

  const [mode, setMode] = React.useState<SplitMode>("chunks");
  const [chunkSec, setChunkSec] = React.useState(60);
  const [rangeText, setRangeText] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [engineLoading, setEngineLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [zipping, setZipping] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);
  const segmentsRef = React.useRef<Segment[]>([]);
  segmentsRef.current = segments;

  const duration =
    meta && Number.isFinite(meta.duration) && meta.duration > 0
      ? meta.duration
      : 0;

  // Revoke every segment preview URL on unmount.
  React.useEffect(() => {
    return () => {
      for (const seg of segmentsRef.current) URL.revokeObjectURL(seg.url);
    };
  }, []);

  const clearSegments = React.useCallback(() => {
    for (const seg of segmentsRef.current) URL.revokeObjectURL(seg.url);
    setSegments([]);
  }, []);

  const handleFile = React.useCallback(
    (next: File, probed: VideoMeta) => {
      clearSegments();
      setFile(next);
      setMeta(probed);
      setError(null);
      setProgress(0);
    },
    [clearSegments],
  );

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    clearSegments();
    setFile(null);
    setMeta(null);
    setError(null);
    setBusy(false);
    setEngineLoading(false);
    setProgress(0);
    setMode("chunks");
    setChunkSec(60);
    setRangeText("");
  }, [clearSegments]);

  const parsed = React.useMemo(
    () => parseRanges(rangeText, duration),
    [rangeText, duration],
  );

  const parts = chunkCount(duration, chunkSec);

  const handleCancel = React.useCallback(() => {
    abortRef.current?.abort();
    setBusy(false);
    setEngineLoading(false);
  }, []);

  const handleSplit = React.useCallback(async () => {
    if (!file) return;

    // Build the split options for the chosen mode, validating first.
    let opts: SplitOptions;
    if (mode === "chunks") {
      if (!(chunkSec > 0)) {
        setError("Set a chunk length of at least one second.");
        return;
      }
      if (duration > 0 && chunkSec >= duration) {
        setError(
          "That chunk length is as long as the whole clip: use a shorter length to get more than one part.",
        );
        return;
      }
      opts = { everySec: chunkSec };
    } else {
      if (parsed.invalid !== null) {
        setError(
          `"${parsed.invalid}" isn't a valid range. Use start-end timecodes like 1:00-2:30, inside the clip's length.`,
        );
        return;
      }
      if (parsed.ranges.length === 0) {
        setError("Add at least one range, e.g. 0:00-1:30, 2:00-3:15.");
        return;
      }
      opts = { ranges: parsed.ranges };
    }

    const controller = new AbortController();
    abortRef.current = controller;

    clearSegments();
    setError(null);
    setBusy(true);
    setProgress(0);
    // First split of a session pays the one-time engine download.
    setEngineLoading(true);

    try {
      const result = await split(file, opts, (fraction) => {
        // Real progress means the engine has loaded and started cutting.
        setEngineLoading(false);
        setProgress(clamp(fraction, 0, 1));
      });

      if (controller.signal.aborted) return;

      if (!result.ok || !result.segments) {
        throw new Error(result.error || "Splitting failed.");
      }
      if (result.segments.length === 0) {
        throw new Error("No segments were produced. Check your split settings.");
      }

      const next: Segment[] = result.segments.map((s) => ({
        blob: s.blob,
        name: s.outName,
        url: URL.createObjectURL(s.blob),
      }));
      setSegments(next);
      setProgress(1);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Splitting failed. Please try again.",
        );
      }
    } finally {
      setBusy(false);
      setEngineLoading(false);
    }
  }, [file, mode, chunkSec, duration, parsed, clearSegments]);

  const handleDownloadZip = React.useCallback(async () => {
    if (segments.length === 0) return;
    setZipping(true);
    try {
      const base = file
        ? file.name.replace(/\.[^.]+$/, "")
        : "video-splitter";
      const zip = await zipBlobs(
        segments.map((s) => namedBlob(s.name, s.blob)),
        `${base}-parts.zip`,
      );
      downloadBlob(zip.blob, zip.name);
    } catch {
      setError(
        "We couldn't bundle the parts into a ZIP. Please download them one by one.",
      );
    } finally {
      setZipping(false);
    }
  }, [segments, file]);

  const canRun =
    !!file &&
    !busy &&
    (mode === "chunks"
      ? chunkSec > 0
      : parsed.invalid === null && parsed.ranges.length > 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Input */}
      <VideoDropzone
        onFile={handleFile}
        file={file}
        meta={meta}
        onClear={reset}
        accept="video/*"
        softMaxMB={500}
        disabled={busy}
      />

      {file && (
        <>
          {/* Mode selector */}
          <fieldset className="flex flex-col gap-3" disabled={busy}>
            <legend className="text-sm font-medium text-foreground">
              How should we split it?
            </legend>
            <div
              className="grid gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Split mode"
            >
              {(
                [
                  {
                    value: "chunks" as const,
                    icon: "Ruler",
                    title: "Equal chunks",
                    hint: "Cut the whole clip into parts of one length.",
                  },
                  {
                    value: "ranges" as const,
                    icon: "ListChecks",
                    title: "Custom ranges",
                    hint: "Extract only the start–end segments you list.",
                  },
                ]
              ).map((opt) => {
                const active = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMode(opt.value)}
                    disabled={busy}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      active
                        ? cn("ring-2", style.border, style.ring)
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        active ? cn(style.solid, "text-white") : style.soft,
                      )}
                    >
                      <Icon name={opt.icon} size={18} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {opt.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Mode-specific controls */}
          {mode === "chunks" ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="chunk-sec"
                className="text-sm font-medium text-foreground"
              >
                Chunk length
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="chunk-sec"
                    type="number"
                    min={1}
                    max={duration > 0 ? Math.max(1, Math.floor(duration)) : undefined}
                    step={1}
                    value={chunkSec}
                    disabled={busy}
                    onChange={(e) =>
                      setChunkSec(
                        Math.max(1, Math.round(Number(e.target.value) || 0)),
                      )
                    }
                    className={cn(
                      "w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  />
                  <span className="text-sm text-muted-foreground">seconds each</span>
                </div>
                {duration > 0 && parts > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      style.soft,
                    )}
                  >
                    ≈ {parts} {parts === 1 ? "part" : "parts"} from{" "}
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                The whole clip is cut into back-to-back parts of this length; the
                final part is whatever time is left over.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="range-text"
                className="text-sm font-medium text-foreground"
              >
                Ranges to extract
              </label>
              <textarea
                id="range-text"
                rows={4}
                value={rangeText}
                disabled={busy}
                placeholder={"0:00-1:30\n2:00-3:15\n5:00-6:00"}
                onChange={(e) => setRangeText(e.target.value)}
                className={cn(
                  "w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
                aria-describedby="range-help"
              />
              <p id="range-help" className="text-xs text-muted-foreground">
                One range per line (or comma-separated) as start-end. Use seconds
                or M:SS / H:MM:SS timecodes, e.g.{" "}
                <code className="rounded bg-muted px-1 py-0.5">1:00-2:30</code>.
                Each must sit inside the clip&apos;s{" "}
                {duration > 0 ? formatDuration(duration) : "length"}.
              </p>
              {rangeText.trim() &&
                (parsed.invalid !== null ? (
                  <p className="text-xs font-medium text-destructive">
                    Couldn&apos;t read &ldquo;{parsed.invalid}&rdquo; - check the
                    start-end format and that it fits the clip.
                  </p>
                ) : (
                  <span
                    className={cn(
                      "w-fit rounded-full px-2.5 py-1 text-xs font-medium",
                      style.soft,
                    )}
                  >
                    {parsed.ranges.length}{" "}
                    {parsed.ranges.length === 1 ? "range" : "ranges"} ready
                  </span>
                ))}
            </div>
          )}

          {/* Run */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSplit}
              disabled={!canRun}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white outline-none transition-opacity",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.solid,
                style.ring,
                "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Icon name="Scissors" size={16} />
              {busy ? "Splitting…" : "Split video"}
            </button>
            <p className="text-xs text-muted-foreground">
              Runs 100% in your browser. Each part is re-encoded, so the first run
              also downloads the engine once; give it a moment.
            </p>
          </div>

          {/* Progress */}
          <FfmpegProgress
            busy={busy}
            progress={progress}
            loadingEngine={engineLoading}
            label="Splitting"
            onCancel={handleCancel}
          />

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Results */}
          {segments.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon name="Layers" size={16} className={style.text} />
                  {segments.length}{" "}
                  {segments.length === 1 ? "part" : "parts"} ready
                </h2>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={zipping}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.border,
                    style.ring,
                    style.text,
                    "hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                >
                  <Icon name="Archive" size={16} />
                  {zipping ? "Zipping…" : "Download all (ZIP)"}
                </button>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {segments.map((seg, i) => (
                  <li
                    key={seg.name + i}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card/40 p-3"
                  >
                    <VideoPlayer src={seg.url} className="w-full" />
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium text-foreground"
                          title={seg.name}
                        >
                          Part {i + 1}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {formatBytes(seg.blob.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadBlob(seg.blob, seg.name)}
                        aria-label={`Download part ${i + 1}`}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none transition-opacity",
                          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          style.solid,
                          style.ring,
                          "hover:opacity-90",
                        )}
                      >
                        <Icon name="Download" size={15} />
                        Save
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground">
                Every part and the ZIP were produced on your device: nothing was
                uploaded, and there&apos;s no watermark on any segment.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
