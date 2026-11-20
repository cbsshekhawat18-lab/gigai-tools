"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

import { formatDuration } from "./media-utils";

/** Props for {@link VideoPlayer}. */
export interface VideoPlayerProps {
  /** Object URL or blob URL for the clip. */
  src: string;
  /** Poster image URL. */
  poster?: string;
  /** Loop playback. Default false. */
  loop?: boolean;
  /** Start muted. Default false. */
  muted?: boolean;
  /** Fires as playback position changes (throttled to rAF). */
  onTimeUpdate?: (currentTime: number) => void;
  /** Fires once metadata (duration) is known. */
  onDuration?: (duration: number) => void;
  /** Constrain the media box, e.g. "16 / 9". Default: intrinsic. */
  aspectRatio?: string;
  className?: string;
  /** Expose the underlying element for programmatic seeking (e.g. trim preview). */
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

/**
 * A clean, custom-chromed video player: play/pause, a scrub bar with buffered
 * range, current/total time, mute + volume, and fullscreen. Controls fade while
 * playing and return on hover/focus. Keyboard: Space/K toggle, ←/→ seek 5s,
 * ↑/↓ volume, M mute, F fullscreen. Fully keyboard-reachable and labelled.
 */
export function VideoPlayer({
  src,
  poster,
  loop = false,
  muted = false,
  onTimeUpdate,
  onDuration,
  aspectRatio,
  className,
  videoRef,
}: VideoPlayerProps) {
  const innerRef = React.useRef<HTMLVideoElement | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const setVideo = (el: HTMLVideoElement | null) => {
    innerRef.current = el;
    if (videoRef) videoRef.current = el;
  };

  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [volume, setVolume] = React.useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = React.useState(muted);
  const [fullscreen, setFullscreen] = React.useState(false);

  const onTimeRef = React.useRef(onTimeUpdate);
  onTimeRef.current = onTimeUpdate;
  const onDurRef = React.useRef(onDuration);
  onDurRef.current = onDuration;

  const toggle = React.useCallback(() => {
    const v = innerRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }, []);

  const seekTo = React.useCallback((t: number) => {
    const v = innerRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(t, 0), v.duration);
  }, []);

  const setVol = React.useCallback((val: number) => {
    const v = innerRef.current;
    if (!v) return;
    const clamped = Math.min(Math.max(val, 0), 1);
    v.volume = clamped;
    v.muted = clamped === 0;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const toggleMute = React.useCallback(() => {
    const v = innerRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted && v.volume === 0) setVol(0.5);
  }, [setVol]);

  const toggleFullscreen = React.useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  React.useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        toggle();
        break;
      case "ArrowRight":
        e.preventDefault();
        seekTo(current + 5);
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekTo(current - 5);
        break;
      case "ArrowUp":
        e.preventDefault();
        setVol(volume + 0.1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setVol(volume - 0.1);
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "f":
        e.preventDefault();
        toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const bufPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="group"
      aria-label="Video player"
      className={cn(
        "group relative overflow-hidden rounded-lg bg-black outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <video
        ref={setVideo}
        src={src}
        poster={poster}
        loop={loop}
        muted={muted}
        playsInline
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(e) => {
          const v = e.currentTarget;
          setVolume(v.volume);
          setIsMuted(v.muted);
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          setDuration(d);
          onDurRef.current?.(d);
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrent(v.currentTime);
          onTimeRef.current?.(v.currentTime);
          try {
            if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
          } catch {
            /* buffered can throw before data */
          }
        }}
        className="block h-full w-full cursor-pointer"
      />

      {/* Center play affordance when paused */}
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center bg-black/20 transition-colors hover:bg-black/30"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur transition-transform hover:scale-105">
            <Icon name="Play" size={28} className="ml-1" />
          </span>
        </button>
      )}

      {/* Control bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 text-white transition-opacity",
          playing
            ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            : "opacity-100",
        )}
      >
        {/* Scrub bar */}
        <div className="relative flex h-4 items-center">
          <div className="absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-white/30" style={{ width: `${bufPct}%` }} />
          </div>
          <div
            className="pointer-events-none absolute h-1 rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.05}
            value={current}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek"
            className="video-range absolute inset-x-0 h-4 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause" : "Play"}
            className="rounded p-1 outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
          >
            <Icon name={playing ? "Pause" : "Play"} size={18} />
          </button>

          <div className="group/vol flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"} title={isMuted || volume === 0 ? "Unmute" : "Mute"}
              className="rounded p-1 outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
            >
              <Icon
                name={isMuted || volume === 0 ? "VolumeX" : volume < 0.5 ? "Volume1" : "Volume2"}
                size={18}
              />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              aria-label="Volume"
              className="video-range h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all group-hover/vol:w-16 group-hover/vol:opacity-100 focus-visible:w-16 focus-visible:opacity-100"
            />
          </div>

          <span className="tabular-nums text-xs text-white/90">
            {formatDuration(current)} <span className="text-white/50">/ {formatDuration(duration)}</span>
          </span>

          <div className="ml-auto">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="rounded p-1 outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
            >
              <Icon name={fullscreen ? "Minimize" : "Maximize"} size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .video-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,.5);
          cursor: pointer;
        }
        .video-range::-moz-range-thumb {
          width: 13px;
          height: 13px;
          border: none;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
