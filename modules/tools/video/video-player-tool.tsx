"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  VideoDropzone,
  VideoPlayer,
  formatDuration,
  type VideoMeta,
} from "@/components/tool/video";

/** Playback rates offered by the speed control. 1× is the neutral default. */
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4] as const;

/** Common video frame rates; used only to size a single "frame" step. */
const ASSUMED_FPS = 30;

/** An A→B loop region. `null` on either bound means that end is unset. */
interface LoopRegion {
  a: number | null;
  b: number | null;
}

/**
 * Video Player: a private, in-browser player. It never uploads, converts or
 * re-encodes: the file is opened through a local object URL and decoded by the
 * browser's own video engine, so there's no FFmpeg core to fetch and nothing to
 * wait on. On top of the base {@link VideoPlayer} chrome (scrub, volume, mute,
 * fullscreen, keyboard) this adds a review layer, variable speed, A→B loop,
 * frame-by-frame stepping and Picture-in-Picture, all pure playback controls.
 */
export default function VideoPlayerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<VideoMeta | null>(null);
  const [src, setSrc] = React.useState<string | null>(null);

  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const [loop, setLoop] = React.useState<LoopRegion>({ a: null, b: null });
  const [pipActive, setPipActive] = React.useState(false);
  const [pipSupported, setPipSupported] = React.useState(true);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Own the object URL so it's revoked deterministically on swap/unmount.
  const onFile = React.useCallback((f: File, m: VideoMeta) => {
    setFile(f);
    setMeta(m);
    setSpeed(1);
    setLoop({ a: null, b: null });
    setCurrent(0);
    setDuration(Number.isFinite(m.duration) ? m.duration : 0);
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }, []);

  const reset = React.useCallback(() => {
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(null);
    setMeta(null);
    setSpeed(1);
    setLoop({ a: null, b: null });
    setCurrent(0);
    setDuration(0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
    // Revoke only on unmount; swaps are handled in onFile/reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect Picture-in-Picture support once, client-side.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const doc = document as Document & { pictureInPictureEnabled?: boolean };
    setPipSupported(Boolean(doc.pictureInPictureEnabled));
    const onLeave = () => setPipActive(false);
    const onEnter = () => setPipActive(true);
    document.addEventListener("leavepictureinpicture", onLeave);
    // enterpictureinpicture fires on the element, but the state is mirrored here
    // via the toggle handler; listen on document leave for the exit case.
    return () => {
      document.removeEventListener("leavepictureinpicture", onLeave);
      void onEnter;
    };
  }, []);

  // Apply the chosen playback rate whenever it (or the source) changes.
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
    // Ask the browser to keep pitch steady at non-1× rates where supported.
    const withPitch = v as HTMLVideoElement & { preservesPitch?: boolean };
    withPitch.preservesPitch = true;
  }, [speed, src]);

  // A→B loop: when both bounds are set, snap back to A once playback passes B.
  const onTime = React.useCallback(
    (t: number) => {
      setCurrent(t);
      const v = videoRef.current;
      if (!v) return;
      const { a, b } = loop;
      if (a !== null && b !== null && b > a && t >= b) {
        v.currentTime = a;
      }
    },
    [loop],
  );

  const stepFrame = React.useCallback(
    (direction: 1 | -1) => {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      const frame = 1 / ASSUMED_FPS;
      const next = Math.min(
        Math.max(v.currentTime + direction * frame, 0),
        Number.isFinite(v.duration) ? v.duration : v.currentTime,
      );
      v.currentTime = next;
    },
    [],
  );

  const togglePip = React.useCallback(async () => {
    const v = videoRef.current as
      | (HTMLVideoElement & {
          requestPictureInPicture?: () => Promise<PictureInPictureWindow>;
        })
      | null;
    if (!v) return;
    const doc = document as Document & {
      pictureInPictureElement?: Element | null;
      exitPictureInPicture?: () => Promise<void>;
    };
    try {
      if (doc.pictureInPictureElement) {
        await doc.exitPictureInPicture?.();
        setPipActive(false);
      } else if (v.requestPictureInPicture) {
        await v.requestPictureInPicture();
        setPipActive(true);
      }
    } catch {
      // PiP can reject (e.g. gesture required, or fullscreen active), ignore.
    }
  }, []);

  const setLoopPoint = React.useCallback((which: "a" | "b") => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    setLoop((prev) => {
      const next: LoopRegion = { ...prev, [which]: t };
      // Keep A ≤ B; if the new point crosses the other, clear the other.
      if (which === "a" && next.b !== null && next.b <= t) next.b = null;
      if (which === "b" && next.a !== null && next.a >= t) next.a = null;
      return next;
    });
  }, []);

  const clearLoop = React.useCallback(() => setLoop({ a: null, b: null }), []);

  // Frame-step via keyboard (comma / period) at the tool level, so it works
  // even when the base player has focus.
  React.useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === ",") {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.key === ".") {
        e.preventDefault();
        stepFrame(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, stepFrame]);

  const loopReady = loop.a !== null && loop.b !== null;
  const aspectRatio =
    meta && meta.aspectRatio > 0 ? `${meta.width} / ${meta.height}` : "16 / 9";

  return (
    <div className="flex flex-col gap-4">
      <VideoDropzone
        onFile={onFile}
        file={file}
        meta={meta}
        onClear={reset}
        softMaxMB={5000}
      />

      {src && (
        <>
          <VideoPlayer
            src={src}
            aspectRatio={aspectRatio}
            videoRef={videoRef}
            onTimeUpdate={onTime}
            onDuration={setDuration}
          />

          {/* Review controls - pure playback, no processing. */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {/* Speed */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon name="Gauge" size={14} />
                  Speed
                </span>
                <div
                  role="group"
                  aria-label="Playback speed"
                  className="flex flex-wrap items-center gap-1"
                >
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        speed === s
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame step */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon name="Film" size={14} />
                  Frame
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => stepFrame(-1)}
                    aria-label="Step back one frame"
                    title="Step back one frame (,)"
                    className="rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon name="StepBack" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepFrame(1)}
                    aria-label="Step forward one frame"
                    title="Step forward one frame (.)"
                    className="rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon name="StepForward" size={16} />
                  </button>
                </div>
              </div>

              {/* Picture-in-Picture */}
              <button
                type="button"
                onClick={togglePip}
                disabled={!pipSupported}
                aria-pressed={pipActive}
                title={
                  pipSupported
                    ? "Picture-in-Picture"
                    : "Picture-in-Picture isn't available in this browser"
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  pipActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon name="PictureInPicture2" size={15} />
                Picture-in-Picture
              </button>
            </div>

            {/* A→B loop */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon name="Repeat" size={14} />
                A→B loop
              </span>
              <button
                type="button"
                onClick={() => setLoopPoint("a")}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium tabular-nums text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                Set A
                {loop.a !== null && (
                  <span className="ml-1.5 text-muted-foreground">
                    {formatDuration(loop.a, true)}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLoopPoint("b")}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium tabular-nums text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                Set B
                {loop.b !== null && (
                  <span className="ml-1.5 text-muted-foreground">
                    {formatDuration(loop.b, true)}
                  </span>
                )}
              </button>
              {(loop.a !== null || loop.b !== null) && (
                <button
                  type="button"
                  onClick={clearLoop}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="X" size={13} />
                  Clear
                </button>
              )}
              <span
                className={cn(
                  "text-xs",
                  loopReady ? "text-primary" : "text-muted-foreground",
                )}
                aria-live="polite"
              >
                {loopReady
                  ? "Looping this section on repeat"
                  : "Set A then B to loop a passage"}
              </span>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <Icon name="Lock" size={12} className="mt-px shrink-0" />
              <span>
                This file plays through your browser&apos;s own decoder. Nothing is
                uploaded, converted or stored. Speed, loop and frame-step change
                only playback, never the file. Frame steps assume ~{ASSUMED_FPS}{" "}
                fps, so a step may land a hair off on variable-frame-rate clips.
              </span>
            </p>
          </div>

          <p className="text-center text-xs tabular-nums text-muted-foreground">
            {formatDuration(current)} / {formatDuration(duration)}
          </p>
        </>
      )}
    </div>
  );
}
