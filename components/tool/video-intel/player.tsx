"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatClock, type Chapter, type Bookmark } from "@/lib/video-intel/types";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
/** One video frame at 30fps: the step size for frame-accurate nudging. */
const FRAME = 1 / 30;

export interface PlayerHandle {
  seekTo: (ms: number) => void;
  play: () => void;
  pause: () => void;
}

interface PlayerProps {
  src: string;
  kind: "video" | "audio";
  chapters: Chapter[];
  bookmarks: Bookmark[];
  /** Current playhead in ms, lifted so the transcript can follow along. */
  onTime: (ms: number) => void;
  onDuration: (ms: number) => void;
  onAddBookmark: (ms: number) => void;
  className?: string;
}

/**
 * Media player for the Video Intelligence workspace.
 *
 * Deliberately built on a plain <video> element rather than a player library:
 * everything needed here (rate, PiP, fullscreen, frame stepping, marker
 * overlays) is native, and a library would add weight for no capability.
 *
 * Time is reported UP to the workspace via `onTime` so the transcript, timeline
 * and chapter list all follow one playhead instead of each polling their own.
 */
export const Player = React.forwardRef<PlayerHandle, PlayerProps>(function Player(
  { src, kind, chapters, bookmarks, onTime, onDuration, onAddBookmark, className },
  ref,
) {
  const mediaRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [rate, setRate] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  /** Optional A→B loop, in seconds. */
  const [loop, setLoop] = React.useState<{ a: number; b: number } | null>(null);

  React.useImperativeHandle(ref, () => ({
    seekTo(ms) {
      const el = mediaRef.current;
      if (!el) return;
      el.currentTime = Math.max(0, ms / 1000);
    },
    play: () => void mediaRef.current?.play(),
    pause: () => mediaRef.current?.pause(),
  }));

  const step = React.useCallback((seconds: number) => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = Math.min(el.duration || 0, Math.max(0, el.currentTime + seconds));
  }, []);

  const toggle = React.useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  /* Keyboard shortcuts, scoped to the player so they can't hijack typing in
     the transcript editor. */
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const el = mediaRef.current;
      if (!el) return;
      const key = event.key.toLowerCase();
      const handled = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      if (key === " " || key === "k") return handled(), toggle();
      if (key === "arrowleft") return handled(), step(event.shiftKey ? -1 : -5);
      if (key === "arrowright") return handled(), step(event.shiftKey ? 1 : 5);
      if (key === ",") return handled(), step(-FRAME);
      if (key === ".") return handled(), step(FRAME);
      if (key === "j") return handled(), step(-10);
      if (key === "l") return handled(), step(10);
      if (key === "m") return handled(), setMuted((m) => !m);
      if (key === "b") return handled(), onAddBookmark(el.currentTime * 1000);
      if (key === "f") {
        handled();
        void (document.fullscreenElement
          ? document.exitFullscreen()
          : el.parentElement?.requestFullscreen());
      }
    },
    [onAddBookmark, step, toggle],
  );

  const onTimeUpdate = React.useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    // Enforce the A→B loop before publishing the time, so listeners never see
    // a position outside the selection.
    if (loop && el.currentTime >= loop.b) {
      el.currentTime = loop.a;
      return;
    }
    setTime(el.currentTime);
    onTime(el.currentTime * 1000);
  }, [loop, onTime]);

  const seekFraction = React.useCallback(
    (fraction: number) => {
      const el = mediaRef.current;
      if (!el || !Number.isFinite(el.duration)) return;
      el.currentTime = Math.min(el.duration, Math.max(0, fraction * el.duration));
    },
    [],
  );

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      className={cn("flex flex-col gap-2 outline-none", className)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="group"
      aria-label="Media player. Space plays, arrows seek, B bookmarks."
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-black">
        {/* One element for both: an <audio> track in a <video> tag still plays,
            and keeps a single code path for rate, PiP and fullscreen. */}
        <video
          ref={mediaRef}
          src={src}
          className={cn("w-full", kind === "audio" ? "h-24" : "aspect-video")}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(event) => {
            const el = event.currentTarget;
            if (Number.isFinite(el.duration)) {
              setDuration(el.duration);
              onDuration(Math.round(el.duration * 1000));
            }
          }}
          playsInline
        />
      </div>

      {/* Scrubber with chapter + bookmark markers overlaid. */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={1000}
          value={duration > 0 ? Math.round((time / duration) * 1000) : 0}
          onChange={(event) => seekFraction(Number(event.target.value) / 1000)}
          aria-label="Seek"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5">
          {duration > 0 &&
            chapters.map((chapter) => (
              <span
                key={chapter.id}
                className="absolute top-0 h-1.5 w-px bg-foreground/50"
                style={{ left: `${(chapter.start / 1000 / duration) * 100}%` }}
              />
            ))}
          {duration > 0 &&
            bookmarks.map((bookmark) => (
              <span
                key={bookmark.id}
                className="absolute -top-0.5 size-2.5 -translate-x-1/2 rounded-full border border-background bg-amber-500"
                style={{ left: `${(bookmark.time / 1000 / duration) * 100}%` }}
              />
            ))}
        </div>
      </div>

      {/* Transport. */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name={playing ? "Pause" : "Play"} size={16} />
        </button>

        <IconButton label="Back 5 seconds" icon="Rewind" onClick={() => step(-5)} />
        <IconButton label="Forward 5 seconds" icon="FastForward" onClick={() => step(5)} />
        <IconButton label="Previous frame" icon="ChevronLeft" onClick={() => step(-FRAME)} />
        <IconButton label="Next frame" icon="ChevronRight" onClick={() => step(FRAME)} />

        <span className="ml-1 font-mono text-xs tabular-nums text-muted-foreground">
          {formatClock(time * 1000)} / {formatClock(duration * 1000)}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <label className="sr-only" htmlFor="vi-rate">
            Playback speed
          </label>
          <select
            id="vi-rate"
            value={rate}
            onChange={(event) => {
              const next = Number(event.target.value);
              setRate(next);
              if (mediaRef.current) mediaRef.current.playbackRate = next;
            }}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SPEEDS.map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>

          <IconButton
            label={muted ? "Unmute" : "Mute"}
            icon={muted || volume === 0 ? "VolumeX" : "Volume2"}
            onClick={() => {
              setMuted((m) => {
                const next = !m;
                if (mediaRef.current) mediaRef.current.muted = next;
                return next;
              });
            }}
          />
          <label className="sr-only" htmlFor="vi-vol">
            Volume
          </label>
          <input
            id="vi-vol"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              if (mediaRef.current) mediaRef.current.volume = next;
            }}
            className="w-16 cursor-pointer accent-primary"
          />

          <IconButton
            label={loop ? "Clear loop" : "Loop from here (10s)"}
            icon="Repeat"
            active={Boolean(loop)}
            onClick={() =>
              setLoop((current) =>
                current ? null : { a: time, b: Math.min(duration, time + 10) },
              )
            }
          />
          <IconButton
            label="Add bookmark"
            icon="Bookmark"
            onClick={() => onAddBookmark(time * 1000)}
          />
          <IconButton
            label="Picture in picture"
            icon="PictureInPicture"
            onClick={() => void mediaRef.current?.requestPictureInPicture?.()}
          />
          <IconButton
            label="Fullscreen"
            icon="Maximize"
            onClick={() =>
              void (document.fullscreenElement
                ? document.exitFullscreen()
                : mediaRef.current?.parentElement?.requestFullscreen())
            }
          />
        </div>
      </div>
    </div>
  );
});

function IconButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-border outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-accent text-foreground" : "bg-card text-muted-foreground",
      )}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}
