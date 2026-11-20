"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Field, NumberStepper, StatBadge } from "@/components/tool/dev";
import {
  VideoWorkspace,
  TrimTimeline,
  formatDuration,
  type TrimRange,
  type VideoMeta,
} from "@/components/tool/video";
import { toGif } from "@/lib/video-tools/operations";

/** GIF encode settings the user controls. All map to real ffmpeg levers. */
interface GifSettings {
  fps: number;
  width: number;
  range: TrimRange;
}

const DEFAULT_FPS = 12;
const DEFAULT_WIDTH = 480;
/** GIF gets heavy fast, nudge users toward short clips without forbidding more. */
const SUGGESTED_MAX_SECONDS = 10;

/** Rough, honest heuristic for how big the GIF is likely to land (bytes). */
function estimateGifBytes(seconds: number, fps: number, width: number): number {
  // GIF ~ frames × pixels × a per-pixel palette-index cost, discounted for the
  // typical LZW win on flat/UI content. This is a loose ESTIMATE only.
  const height = Math.round(width * 0.5625); // assume ~16:9 for a ballpark
  const frames = Math.max(1, Math.round(seconds * fps));
  const perPixel = 0.28;
  return Math.round(frames * width * height * perPixel);
}

function formatBytesRough(n: number): string {
  if (n < 1024) return `${Math.round(n)} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i] ?? "KB"}`;
}

/** Clamp a trim range into the clip and keep a minimum span. */
function clampRange(range: TrimRange, duration: number): TrimRange {
  const start = Math.max(0, Math.min(range.start, duration - 0.1));
  const end = Math.max(start + 0.1, Math.min(range.end, duration));
  return { start, end };
}

/**
 * Video to GIF, the flagship of the GigAI Video Toolkit. It composes
 * {@link VideoWorkspace} (dropzone → options slot → run → progress → result)
 * with a {@link TrimTimeline} range picker and fps/width steppers, and drives
 * the WebAssembly {@link toGif} operation. FFmpeg is dynamically imported and
 * its core is fetched once on the first conversion (surfaced as a one-time
 * engine-load note); a live progress bar tracks the encode. Everything runs in
 * the browser. The clip is never uploaded. The tool is honest about GIF being
 * a large 256-color format and about WASM being slower and memory-bound, and it
 * shows a loose size estimate so users can trade length/width/fps against size
 * before they commit.
 */
export default function VideoToGifTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [settings, setSettings] = React.useState<GifSettings>({
    fps: DEFAULT_FPS,
    width: DEFAULT_WIDTH,
    range: { start: 0, end: 0 },
  });
  // Track which file the range was initialized for, so a new drop re-seeds it.
  const initedForRef = React.useRef<string | null>(null);

  const seedRange = React.useCallback((meta: VideoMeta, fileKey: string) => {
    if (initedForRef.current === fileKey) return;
    initedForRef.current = fileKey;
    const end = Math.min(meta.duration, SUGGESTED_MAX_SECONDS);
    setSettings((prev) => ({ ...prev, range: { start: 0, end } }));
  }, []);

  const setFps = React.useCallback((fps: number) => {
    setSettings((prev) => ({ ...prev, fps }));
  }, []);
  const setWidth = React.useCallback((width: number) => {
    setSettings((prev) => ({ ...prev, width }));
  }, []);
  const setRange = React.useCallback((range: TrimRange) => {
    setSettings((prev) => ({ ...prev, range }));
  }, []);

  return (
    <VideoWorkspace
      accept="video/*"
      softMaxMB={300}
      runLabel="Convert to GIF"
      runIcon="Film"
      resultTitle="Your animated GIF"
      progressLabel="Encoding GIF"
      onRun={async (file, meta, { onProgress, onEngineLoading, signal }) => {
        // The engine lazy-loads on first use; toGif's progress starts at ~0.
        // Surface the one-time core download as an engine-loading note until
        // the first real progress tick arrives.
        onEngineLoading(true);
        let started = false;

        const range = clampRange(settings.range, meta.duration);
        const durationSec = Math.max(0.1, range.end - range.start);

        const result = await toGif(
          file,
          {
            fps: settings.fps,
            width: settings.width,
            startSec: range.start,
            durationSec,
          },
          (fraction) => {
            if (signal.aborted) return;
            if (!started) {
              started = true;
              onEngineLoading(false);
            }
            onProgress(fraction);
          },
        );

        onEngineLoading(false);
        if (signal.aborted) throw new Error("Cancelled");
        if (!result.ok) {
          throw new Error(
            result.error ||
              "Couldn't convert this clip to GIF. Try a shorter range or a smaller width.",
          );
        }

        const base = file.name.replace(/\.[^.]+$/, "") || "clip";
        return {
          blob: result.blob,
          filename: `${base}-gigai.gif`,
          kind: "image",
        };
      }}
    >
      {({ file, meta, busy }) => {
        // Seed the range the first time this file's options render.
        const fileKey = `${file.name}:${file.size}`;
        if (initedForRef.current !== fileKey) {
          // Defer state update out of render.
          queueMicrotask(() => seedRange(meta, fileKey));
        }

        const range = clampRange(settings.range, meta.duration);
        const clipSeconds = Math.max(0.1, range.end - range.start);
        const overSuggested = clipSeconds > SUGGESTED_MAX_SECONDS;
        const estBytes = estimateGifBytes(clipSeconds, settings.fps, settings.width);

        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Trim the clip
              </span>
              <TrimTimeline
                duration={meta.duration}
                value={range}
                onChange={(r) => setRange(clampRange(r, meta.duration))}
                source={file}
                disabled={busy}
              />
              <p className="text-[11px] leading-snug text-muted-foreground">
                Selecting{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(clipSeconds)}
                </span>{" "}
                of {formatDuration(meta.duration)}. Shorter clips make far smaller
                GIFs. Length is the biggest driver of file size.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Field
                label="Frame rate"
                hint="Frames per second: higher is smoother but heavier"
              >
                <NumberStepper
                  value={settings.fps}
                  onChange={setFps}
                  min={1}
                  max={30}
                  step={1}
                  ariaLabel="Frame rate in frames per second"
                  disabled={busy}
                />
              </Field>
              <Field
                label="Width (px)"
                hint="Output width. Height scales to keep the aspect ratio"
              >
                <NumberStepper
                  value={settings.width}
                  onChange={setWidth}
                  min={80}
                  max={1280}
                  step={20}
                  ariaLabel="Output width in pixels"
                  disabled={busy}
                />
              </Field>
              <Field label="Start" hint="Start time of the clip">
                <div className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground">
                  {formatDuration(range.start)}
                </div>
              </Field>
              <Field label="Length" hint="Duration of the GIF">
                <div className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground">
                  {formatDuration(clipSeconds)}
                </div>
              </Field>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatBadge
                  label="Est. size*"
                  value={`~${formatBytesRough(estBytes)}`}
                  icon="FileArchive"
                  tone={estBytes > 8 * 1024 * 1024 ? "warning" : "info"}
                />
                <StatBadge
                  label="Frames"
                  value={String(Math.max(1, Math.round(clipSeconds * settings.fps)))}
                  icon="Film"
                  tone="default"
                />
                <StatBadge
                  label="Palette"
                  value="Two-pass · 256 colors"
                  icon="Palette"
                  tone="default"
                />
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {overSuggested ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    This clip is longer than {SUGGESTED_MAX_SECONDS}s - GIF has
                    little cross-frame compression, so the file may get large and
                    the WebAssembly encode may take a while.{" "}
                  </span>
                ) : null}
                <span className="text-muted-foreground/80">
                  * A loose estimate, actual GIF size depends on the footage. All
                  encoding happens in your browser; nothing is uploaded.
                </span>
              </p>
            </div>
          </div>
        );
      }}
    </VideoWorkspace>
  );
}
