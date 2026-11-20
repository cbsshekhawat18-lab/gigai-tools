"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  Field,
  NumberStepper,
  SegmentedControl,
  SelectField,
  StatBadge,
  ErrorBanner,
  download,
} from "@/components/tool/dev";
import {
  VideoDropzone,
  FfmpegProgress,
  formatDuration,
  formatBytes,
  type VideoMeta,
} from "@/components/tool/video";
import { extractFrames, type ExtractedFrame } from "@/lib/video-tools/frames";

/** How the user chooses which frames to grab. */
type Mode = "rate" | "timestamps";
type OutFormat = "png" | "jpeg";

const DEFAULT_FPS = 1;
const DEFAULT_FORMAT: OutFormat = "png";
/** Above this many planned frames we warn (never block): memory-bound in-tab. */
const FRAME_WARN_THRESHOLD = 200;

const MODE_OPTIONS = [
  { value: "rate" as const, label: "By frame rate" },
  { value: "timestamps" as const, label: "By timestamps" },
];

const FORMAT_OPTIONS = [
  { value: "png" as const, label: "PNG · lossless" },
  { value: "jpeg" as const, label: "JPEG · smaller" },
];

const MAXSIZE_OPTIONS = [
  { value: "0" as const, label: "Original size" },
  { value: "640" as const, label: "Max 640 px" },
  { value: "1280" as const, label: "Max 1280 px" },
  { value: "1920" as const, label: "Max 1920 px" },
];

/**
 * Parse a free-text list of timestamps (comma / space / newline separated).
 * Accepts plain seconds ("83") and mm:ss / h:mm:ss ("1:23", "1:02:03").
 * Returns de-duplicated, sorted, in-range seconds.
 */
function parseTimestamps(raw: string, duration: number): number[] {
  const tokens = raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const out: number[] = [];
  for (const tok of tokens) {
    let seconds: number;
    if (tok.includes(":")) {
      const parts = tok.split(":").map((p) => Number(p));
      if (parts.some((n) => !Number.isFinite(n))) continue;
      seconds = parts.reduce((acc, n) => acc * 60 + n, 0);
    } else {
      seconds = Number(tok);
    }
    if (!Number.isFinite(seconds) || seconds < 0) continue;
    // Clamp just inside the clip so the seek always resolves to a real frame.
    const clamped = Math.min(seconds, Math.max(0, duration - 0.05));
    out.push(Math.round(clamped * 1000) / 1000);
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

/** Estimate how many frames a rate sweep will produce across the clip. */
function plannedRateCount(fps: number, duration: number): number {
  if (fps <= 0 || duration <= 0) return 0;
  return Math.max(1, Math.floor(duration * fps));
}

function extForFormat(format: OutFormat): string {
  return format === "jpeg" ? "jpg" : "png";
}

/**
 * Video Frame Extractor: a NO-ffmpeg tool. It loads the dropped clip into a
 * native `<video>`, seeks to each requested moment and draws it to a canvas via
 * {@link extractFrames}, so extraction is effectively instant and the ~31 MB
 * WASM core is never fetched. Two modes: sample the whole clip at a chosen fps,
 * or grab an explicit list of timestamps. Frames preview in a responsive grid;
 * download any single still, or ZIP them all (jszip is dynamically imported only
 * when the user clicks Download all). Everything runs on-device; nothing is
 * uploaded. Honest about browser seek precision, DRM/codec limits, and the
 * memory cost of very large batches.
 */
export default function VideoFrameExtractorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<VideoMeta | null>(null);

  const [mode, setMode] = React.useState<Mode>("rate");
  const [fps, setFps] = React.useState<number>(DEFAULT_FPS);
  const [timestampsText, setTimestampsText] = React.useState<string>("");
  const [format, setFormat] = React.useState<OutFormat>(DEFAULT_FORMAT);
  const [maxSize, setMaxSize] = React.useState<string>("0");

  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [frames, setFrames] = React.useState<ExtractedFrame[]>([]);
  const [zipping, setZipping] = React.useState(false);

  // Track object URLs so we can revoke them on reset / unmount / re-extract.
  const framesRef = React.useRef<ExtractedFrame[]>([]);
  framesRef.current = frames;

  const revokeAll = React.useCallback(() => {
    for (const f of framesRef.current) URL.revokeObjectURL(f.url);
  }, []);

  React.useEffect(() => revokeAll, [revokeAll]);

  const onFile = React.useCallback(
    (f: File, m: VideoMeta) => {
      revokeAll();
      setFile(f);
      setMeta(m);
      setFrames([]);
      setError(null);
      setTimestampsText("");
    },
    [revokeAll],
  );

  const onClear = React.useCallback(() => {
    revokeAll();
    setFile(null);
    setMeta(null);
    setFrames([]);
    setError(null);
  }, [revokeAll]);

  const duration = meta?.duration ?? 0;
  const parsedTimes = React.useMemo(
    () => parseTimestamps(timestampsText, duration),
    [timestampsText, duration],
  );
  const plannedCount =
    mode === "timestamps"
      ? parsedTimes.length
      : plannedRateCount(fps, duration);
  const overMany = plannedCount > FRAME_WARN_THRESHOLD;

  const runExtract = React.useCallback(async () => {
    if (!file || !meta) return;
    if (mode === "timestamps" && parsedTimes.length === 0) {
      setError(
        "Add at least one timestamp, type times in seconds (e.g. 83) or mm:ss (e.g. 1:23).",
      );
      return;
    }
    revokeAll();
    setFrames([]);
    setError(null);
    setBusy(true);
    setProgress(0);

    const capValue = Number(maxSize);
    const maxSizeOpt = capValue > 0 ? capValue : undefined;

    try {
      const result = await extractFrames(file, {
        format,
        quality: format === "jpeg" ? 0.92 : undefined,
        maxSize: maxSizeOpt,
        ...(mode === "timestamps"
          ? { times: parsedTimes }
          : { fps: fps > 0 ? fps : 1 }),
        onProgress: (fraction) => setProgress(Math.min(1, Math.max(0, fraction))),
      });
      if (result.length === 0) {
        setError(
          "No frames could be grabbed from this clip. If it won't play in the browser (DRM or an unsupported codec), it can't be sampled. Try converting it to standard MP4 first.",
        );
      }
      setFrames(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't extract frames from this video. Make sure it plays in your browser and try again.",
      );
    } finally {
      setBusy(false);
    }
  }, [file, meta, mode, parsedTimes, fps, format, maxSize, revokeAll]);

  const downloadOne = React.useCallback(
    (frame: ExtractedFrame, index: number) => {
      const base = file?.name.replace(/\.[^.]+$/, "") || "frame";
      const stamp = formatDuration(frame.time).replace(/[:.]/g, "-");
      download(
        `${base}-${String(index + 1).padStart(3, "0")}-${stamp}.${extForFormat(format)}`,
        frame.blob,
        frame.blob.type || "image/png",
      );
    },
    [file, format],
  );

  const downloadZip = React.useCallback(async () => {
    if (frames.length === 0) return;
    setZipping(true);
    setError(null);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const base = file?.name.replace(/\.[^.]+$/, "") || "frames";
      const ext = extForFormat(format);
      frames.forEach((frame, i) => {
        const stamp = formatDuration(frame.time).replace(/[:.]/g, "-");
        zip.file(`${base}-${String(i + 1).padStart(3, "0")}-${stamp}.${ext}`, frame.blob);
      });
      const archive = await zip.generateAsync({ type: "blob" });
      download(`${base}-frames.zip`, archive, "application/zip");
    } catch {
      setError(
        "Couldn't build the ZIP in your browser. Try downloading frames individually, or reduce how many frames you extract at once.",
      );
    } finally {
      setZipping(false);
    }
  }, [frames, file, format]);

  const totalBytes = React.useMemo(
    () => frames.reduce((sum, f) => sum + f.blob.size, 0),
    [frames],
  );

  return (
    <div className="flex flex-col gap-5">
      <VideoDropzone
        onFile={onFile}
        file={file}
        meta={meta}
        onClear={onClear}
        accept="video/*"
        softMaxMB={500}
        disabled={busy}
      />

      {file && meta && (
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card/40 p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              How should we pick frames?
            </span>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={MODE_OPTIONS}
              ariaLabel="Frame selection mode"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {mode === "rate" ? (
              <Field
                label="Frames per second"
                hint="How many evenly spaced stills to grab per second of video"
              >
                <NumberStepper
                  value={fps}
                  onChange={setFps}
                  min={1}
                  max={30}
                  step={1}
                  ariaLabel="Sampling rate in frames per second"
                  disabled={busy}
                />
              </Field>
            ) : (
              <Field
                label="Timestamps"
                hint="Seconds (83) or mm:ss (1:23), separated by commas, spaces or new lines"
              >
                <textarea
                  value={timestampsText}
                  onChange={(e) => setTimestampsText(e.target.value)}
                  disabled={busy}
                  rows={2}
                  placeholder="e.g. 0:03, 0:17, 45, 1:02:03"
                  aria-label="Timestamps to extract, in seconds or mm:ss"
                  className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                />
              </Field>
            )}

            <Field
              label="Output format"
              hint="PNG is lossless. JPEG is much smaller for big batches"
            >
              <SelectField
                value={format}
                onChange={setFormat}
                options={FORMAT_OPTIONS}
                ariaLabel="Output image format"
                disabled={busy}
              />
            </Field>

            <Field
              label="Max size"
              hint="Downscale the longest edge to keep large batches light"
            >
              <SelectField
                value={maxSize}
                onChange={setMaxSize}
                options={MAXSIZE_OPTIONS}
                ariaLabel="Maximum output dimension"
                disabled={busy}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatBadge
                label="Duration"
                value={formatDuration(duration)}
                icon="Clock"
                tone="default"
              />
              <StatBadge
                label="Frames planned"
                value={plannedCount > 0 ? String(plannedCount) : "—"}
                icon="Images"
                tone={overMany ? "warning" : "info"}
              />
              <StatBadge
                label="Engine"
                value="Instant · no FFmpeg"
                icon="Zap"
                tone="default"
              />
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              {overMany ? (
                <span className="text-amber-600 dark:text-amber-400">
                  That plans {plannedCount} frames - a large batch is decoded and
                  held in memory for preview. Consider JPEG, a smaller max size, a
                  lower rate, or specific timestamps.{" "}
                </span>
              ) : null}
              <span className="text-muted-foreground/80">
                Frames are grabbed with your browser&apos;s own video decoder  -
                nothing is uploaded and no engine is downloaded. Seek precision
                lands on the nearest decodable frame.
              </span>
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={runExtract}
              disabled={busy || (mode === "timestamps" && parsedTimes.length === 0)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="Images" size={16} />
              {busy ? "Extracting…" : "Extract frames"}
            </button>
          </div>
        </div>
      )}

      {busy && (
        <FfmpegProgress
          busy={busy}
          progress={progress}
          label="Grabbing frames"
        />
      )}

      {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

      {frames.length > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {frames.length} {frames.length === 1 ? "frame" : "frames"}
              </span>
              <StatBadge
                label="Total"
                value={formatBytes(totalBytes)}
                icon="FileArchive"
                tone="default"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadZip}
                disabled={zipping}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="FileArchive" size={15} />
                {zipping ? "Zipping…" : "Download all (ZIP)"}
              </button>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Icon name="RotateCcw" size={15} />
                Reset
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {frames.map((frame, i) => (
              <li
                key={`${frame.time}-${i}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame.url}
                    alt={`Frame at ${formatDuration(frame.time)}`}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatDuration(frame.time)}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadOne(frame, i)}
                    aria-label={`Download frame at ${formatDuration(frame.time)}`}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-[11px] font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon name="Download" size={13} />
                    Save
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
