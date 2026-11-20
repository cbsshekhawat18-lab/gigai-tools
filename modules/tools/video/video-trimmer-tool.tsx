"use client";

/**
 * Video Trimmer, flagship in-browser video tool.
 *
 * Drop a clip → scrub it in a live player → drag a dual-handle timeline over a
 * real-frame filmstrip to set in/out points → cut just that segment with a
 * self-hosted FFmpeg WebAssembly core → preview + download. Everything runs on
 * the user's device; the 31 MB wasm core is only fetched on the first trim.
 *
 * This module is intentionally thin: the {@link VideoWorkspace} scaffold owns
 * file/probe/busy/progress/abort/error/result, and this component supplies the
 * options UI (player + timeline) and the `onRun` cut function.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  VideoWorkspace,
  VideoPlayer,
  TrimTimeline,
  formatDuration,
  type TrimRange,
  type VideoMeta,
  type VideoWorkspaceRenderArgs,
} from "@/components/tool/video";
import { trim } from "@/lib/video-tools/operations";

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The options slot: a scrubbable preview + a dual-handle trim timeline. Lives in
 * its own component so it can hold the (per-file) trim range and playhead state
 * that the workspace deliberately doesn't own. Keyed on the file in the parent
 * so a fresh drop resets the selection.
 */
function TrimControls({
  file,
  meta,
  busy,
  onRangeChange,
}: VideoWorkspaceRenderArgs & {
  onRangeChange: (range: TrimRange) => void;
}) {
  // A finite, sane duration to bound the selection against.
  const duration =
    Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;

  const [src, setSrc] = React.useState<string>("");
  const [range, setRange] = React.useState<TrimRange>({
    start: 0,
    end: duration,
  });
  const [playhead, setPlayhead] = React.useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Object URL for the preview player; revoked on file change/unmount.
  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Publish the current selection up to the run handler whenever it changes.
  React.useEffect(() => {
    onRangeChange(range);
  }, [range, onRangeChange]);

  const handleRangeChange = React.useCallback(
    (next: TrimRange) => {
      if (duration <= 0) return;
      const start = clamp(next.start, 0, duration);
      const end = clamp(next.end, 0, duration);
      setRange({ start, end });
      // Snap the preview to whichever edge the user is shaping.
      const seekTo = Math.abs(end - playhead) < Math.abs(start - playhead) ? end : start;
      const el = videoRef.current;
      if (el) {
        el.currentTime = seekTo;
        setPlayhead(seekTo);
      }
    },
    [duration, playhead],
  );

  const seek = React.useCallback((seconds: number) => {
    const el = videoRef.current;
    if (el) el.currentTime = seconds;
    setPlayhead(seconds);
  }, []);

  const selected = Math.max(range.end - range.start, 0);

  return (
    <div className="flex flex-col gap-4">
      {src ? (
        <VideoPlayer
          src={src}
          videoRef={videoRef}
          aspectRatio={
            meta.aspectRatio > 0 ? `${meta.width} / ${meta.height}` : undefined
          }
          onTimeUpdate={setPlayhead}
          className="w-full"
        />
      ) : null}

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="Scissors" size={15} className="text-primary" />
          <span>Drag the handles to set your start and end</span>
        </div>
        <TrimTimeline
          duration={duration}
          value={range}
          onChange={handleRangeChange}
          source={file}
          playhead={playhead}
          onSeek={seek}
          disabled={busy || duration <= 0}
          thumbnails={12}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: focus a handle and nudge with the arrow keys, a second per press,
          or a tenth with Shift; Home/End snap to the edges.
        </p>
      </div>

      {/* Selection summary - mirrors what will be cut. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
        <span className="text-muted-foreground">
          Start <span className="font-medium text-foreground">{formatDuration(range.start, true)}</span>
        </span>
        <span className="text-muted-foreground">
          End <span className="font-medium text-foreground">{formatDuration(range.end, true)}</span>
        </span>
        <span className="text-muted-foreground">
          Keeping{" "}
          <span className="font-semibold text-primary">{formatDuration(selected, true)}</span>
          {duration > 0 ? ` of ${formatDuration(duration)}` : null}
        </span>
      </div>
    </div>
  );
}

/**
 * Video Trimmer tool. Composes the {@link VideoWorkspace} scaffold with a trim
 * timeline and the `trim` operation. TS-strict clean; dark-mode, responsive and
 * keyboard-accessible; honest about in-browser FFmpeg's speed/size limits.
 */
export default function VideoTrimmerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live selection, updated by the options slot and read at run time.
  const rangeRef = React.useRef<TrimRange>({ start: 0, end: 0 });
  const setRange = React.useCallback((range: TrimRange) => {
    rangeRef.current = range;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      meta: VideoMeta,
      hooks: {
        onProgress: (p: number) => void;
        onEngineLoading: (loading: boolean) => void;
        signal: AbortSignal;
      },
    ): Promise<{ blob: Blob; filename?: string; kind?: "video" }> => {
      const duration =
        Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 0;
      const { start, end } = rangeRef.current;
      const safeStart = clamp(start, 0, duration || start);
      const safeEnd = duration > 0 ? clamp(end, 0, duration) : end;

      if (!(safeEnd > safeStart)) {
        throw new Error(
          "Set an end point after the start point before trimming: drag the timeline handles apart.",
        );
      }

      // First trim of a session pays the one-time engine download.
      hooks.onEngineLoading(true);
      const result = await trim(file, safeStart, safeEnd, (fraction) => {
        // The engine has loaded and started emitting real progress.
        hooks.onEngineLoading(false);
        hooks.onProgress(clamp(fraction, 0, 1));
      });

      if (hooks.signal.aborted) {
        // Workspace ignores the return when aborted; keep the shape valid.
        return { blob: new Blob(), kind: "video" };
      }

      if (!result.ok) {
        throw new Error(result.error);
      }

      return { blob: result.blob, filename: result.outName, kind: "video" };
    },
    [],
  );

  return (
    <div className={cn("flex flex-col gap-4")}>
      <VideoWorkspace
        onRun={handleRun}
        runLabel="Trim video"
        runIcon="Scissors"
        resultTitle="Trimmed clip"
        accept="video/*"
        softMaxMB={500}
        progressLabel="Trimming"
      >
        {(args) => (
          <TrimControls key={args.file.name + args.file.size} {...args} onRangeChange={setRange} />
        )}
      </VideoWorkspace>
    </div>
  );
}
