"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  Field,
  SegmentedControl,
  Toggle,
  NumberStepper,
  StatBadge,
  ErrorBanner,
} from "@/components/tool/dev";
import {
  VideoDropzone,
  VideoPlayer,
  VideoResult,
  formatBytes,
  formatDuration,
  type VideoMeta,
} from "@/components/tool/video";
import { thumbnailAt, type ExtractedFrame } from "@/lib/video-tools/frames";

/** Output image encoding the user picks. */
type Format = "png" | "jpeg";

/** A captured still plus the download filename we derived for it. */
interface Capture {
  frame: ExtractedFrame;
  filename: string;
}

const DEFAULT_QUALITY = 0.92;
const DEFAULT_MAX_SIZE = 1280;

/** Clamp a seek time into the clip. */
function clampTime(t: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return Math.max(0, t);
  return Math.max(0, Math.min(t, duration));
}

/**
 * Video Thumbnail Generator, the "Extract" flagship of the GigAI Video
 * Toolkit. It composes {@link VideoDropzone} → {@link VideoPlayer} (scrubbable
 * preview) → format/quality/downscale options → an instant capture, and drives
 * the FFmpeg-free {@link thumbnailAt} operation (native `<video>` seek +
 * `<canvas>` draw). No WebAssembly core is ever loaded and there's no progress
 * bar: the still comes back the moment you capture. Everything runs in the
 * browser: the clip is never uploaded. The tool is honest that a capture is
 * exactly the source frame's pixels (it can't add detail) and that only
 * browser-decodable formats can be grabbed.
 */
export default function VideoThumbnailGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<VideoMeta | null>(null);
  const [src, setSrc] = React.useState<string | null>(null);

  const [format, setFormat] = React.useState<Format>("png");
  const [quality, setQuality] = React.useState<number>(Math.round(DEFAULT_QUALITY * 100));
  const [downscale, setDownscale] = React.useState<boolean>(false);
  const [maxSize, setMaxSize] = React.useState<number>(DEFAULT_MAX_SIZE);

  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [capture, setCapture] = React.useState<Capture | null>(null);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Revoke the preview object URL when the file changes / on unmount.
  React.useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  // Revoke a captured frame's URL when it's replaced / on unmount.
  React.useEffect(() => {
    return () => {
      if (capture) URL.revokeObjectURL(capture.frame.url);
    };
  }, [capture]);

  const resetAll = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCapture((prev) => {
      if (prev) URL.revokeObjectURL(prev.frame.url);
      return null;
    });
    setCurrentTime(0);
    setError(null);
    setBusy(false);
  }, []);

  const onFile = React.useCallback(
    (f: File, m: VideoMeta) => {
      setError(null);
      setCapture((prev) => {
        if (prev) URL.revokeObjectURL(prev.frame.url);
        return null;
      });
      setSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
      setFile(f);
      setMeta(m);
      setCurrentTime(0);
    },
    [],
  );

  const handleCapture = React.useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    // Prefer the live playhead from the actual <video>, which is the most
    // accurate reflection of what the user is seeing.
    const duration = meta?.duration ?? videoRef.current?.duration ?? 0;
    const at = clampTime(
      videoRef.current?.currentTime ?? currentTime,
      duration,
    );
    try {
      const frame = await thumbnailAt(file, at, {
        format,
        quality: format === "jpeg" ? quality / 100 : undefined,
        maxSize: downscale ? maxSize : undefined,
      });
      const base = file.name.replace(/\.[^.]+$/, "") || "frame";
      const ext = format === "jpeg" ? "jpg" : "png";
      const stamp = formatDuration(at).replace(/:/g, "-");
      const filename = `${base}-frame-${stamp}.${ext}`;
      setCapture((prev) => {
        if (prev) URL.revokeObjectURL(prev.frame.url);
        return { frame, filename };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't capture this frame. The browser may not be able to decode this video.",
      );
    } finally {
      setBusy(false);
    }
  }, [file, meta, currentTime, format, quality, downscale, maxSize]);

  const seekBy = React.useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      const next = clampTime(v.currentTime + delta, meta?.duration ?? v.duration ?? 0);
      v.currentTime = next;
      setCurrentTime(next);
    },
    [meta],
  );

  // Output size of the still, honoring an optional downscale cap.
  const outSize = React.useMemo(() => {
    if (!meta || meta.width <= 0 || meta.height <= 0) return null;
    if (!downscale) return { w: meta.width, h: meta.height };
    const longest = Math.max(meta.width, meta.height);
    if (longest <= maxSize) return { w: meta.width, h: meta.height };
    const scale = maxSize / longest;
    return { w: Math.round(meta.width * scale), h: Math.round(meta.height * scale) };
  }, [meta, downscale, maxSize]);

  const aspect =
    meta && meta.width > 0 && meta.height > 0
      ? `${meta.width} / ${meta.height}`
      : "16 / 9";

  return (
    <div className="flex flex-col gap-5">
      <VideoDropzone
        onFile={onFile}
        file={file}
        meta={meta}
        onClear={resetAll}
        accept="video/*"
        softMaxMB={1000}
        disabled={busy}
      />

      {file && src && meta ? (
        <div className="flex flex-col gap-5">
          {/* Scrubbable preview - the source of the frame we capture. */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Scrub to the frame you want
            </span>
            <VideoPlayer
              src={src}
              aspectRatio={aspect}
              videoRef={videoRef}
              onTimeUpdate={setCurrentTime}
              onDuration={(d) => {
                // Keep meta duration authoritative but fall back if it was 0.
                if (!meta.duration && d) setMeta({ ...meta, duration: d });
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {formatDuration(clampTime(currentTime, meta.duration), true)}
                {" / "}
                {formatDuration(meta.duration)}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => seekBy(-1 / 30)}
                  disabled={busy}
                  aria-label="Step back one frame"
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Icon name="ChevronLeft" size={14} />
                  Frame
                </button>
                <button
                  type="button"
                  onClick={() => seekBy(1 / 30)}
                  disabled={busy}
                  aria-label="Step forward one frame"
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  Frame
                  <Icon name="ChevronRight" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Output options. */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Image format" hint="PNG is lossless. JPG is smaller">
              <SegmentedControl<Format>
                value={format}
                onChange={setFormat}
                ariaLabel="Output image format"
                options={[
                  { value: "png", label: "PNG", icon: "Image" },
                  { value: "jpeg", label: "JPG", icon: "FileImage" },
                ]}
              />
            </Field>

            {format === "jpeg" ? (
              <Field
                label={`JPG quality, ${quality}%`}
                htmlFor="jpg-quality"
                hint="Higher is sharper but larger"
              >
                <input
                  id="jpg-quality"
                  type="range"
                  min={40}
                  max={100}
                  step={1}
                  value={quality}
                  disabled={busy}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  aria-label="JPG quality percentage"
                  className="h-8 w-full cursor-pointer accent-current disabled:opacity-50"
                />
              </Field>
            ) : (
              <Field label="Format note" hint="PNG keeps every pixel exactly">
                <div className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs text-muted-foreground">
                  Lossless · supports transparency
                </div>
              </Field>
            )}

            <Field label="Downscale output" hint="Cap the longest side for web-ready thumbnails">
              <Toggle
                checked={downscale}
                onChange={setDownscale}
                disabled={busy}
                label={downscale ? "On, longest side capped" : "Off: full source resolution"}
              />
            </Field>

            {downscale ? (
              <Field label="Longest side (px)" hint="Aspect ratio is preserved">
                <NumberStepper
                  value={maxSize}
                  onChange={setMaxSize}
                  min={160}
                  max={4096}
                  step={40}
                  ariaLabel="Longest side in pixels"
                  disabled={busy}
                />
              </Field>
            ) : null}
          </div>

          {/* Output stats. */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <StatBadge
              label="Capture at"
              value={formatDuration(clampTime(currentTime, meta.duration), true)}
              icon="Clock"
              tone="info"
            />
            {outSize ? (
              <StatBadge
                label="Output"
                value={`${outSize.w}×${outSize.h}`}
                icon="Ruler"
                tone="default"
              />
            ) : null}
            <StatBadge
              label="Format"
              value={format === "jpeg" ? "JPG" : "PNG"}
              icon="Image"
              tone="default"
            />
            <StatBadge
              label="Engine"
              value="No FFmpeg · instant"
              icon="Zap"
              tone="default"
            />
          </div>

          {error ? <ErrorBanner error={error} onDismiss={() => setError(null)} /> : null}

          <button
            type="button"
            onClick={handleCapture}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-semibold text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            <Icon name={busy ? "LoaderCircle" : "Camera"} size={16} className={busy ? "animate-spin" : undefined} />
            {busy ? "Capturing…" : "Capture Frame"}
          </button>

          <p className="text-[11px] leading-snug text-muted-foreground">
            The still is exactly the source frame&apos;s pixels; it can&apos;t add detail a
            compressed video doesn&apos;t contain. Everything runs in your browser; the
            video is never uploaded.
          </p>

          {capture ? (
            <VideoResult
              blob={capture.frame.blob}
              filename={capture.filename}
              kind="image"
              title={`Captured frame · ${capture.frame.width}×${capture.frame.height} · ${formatBytes(capture.frame.blob.size)}`}
              onReset={() =>
                setCapture((prev) => {
                  if (prev) URL.revokeObjectURL(prev.frame.url);
                  return null;
                })
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
