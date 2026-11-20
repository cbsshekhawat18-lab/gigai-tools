"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

import { Waveform } from "./waveform";
import { formatDuration, type Peaks } from "./audio-utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Props for {@link AudioPlayer}. */
export interface AudioPlayerProps {
  /** Object/blob URL to play. Provide this or {@link AudioPlayerProps.blob}. */
  src?: string;
  /** A Blob to play. An object URL is created and revoked automatically. */
  blob?: Blob | null;
  /**
   * A decoded buffer for the waveform display. Optional: without it the player
   * still works, it just shows a flat track. Peaks are derived once.
   */
  buffer?: AudioBuffer | null;
  /** Precomputed envelope (skips decoding for large clips). */
  peaks?: Peaks | null;
  /** Start looping. Default false. */
  loop?: boolean;
  /** Waveform height in px. Default 96. */
  waveHeight?: number;
  className?: string;
}

/**
 * A clean, custom-chromed audio player built on the {@link Waveform}: click the
 * wave to seek, with play/pause, a live playhead, current/total time, mute +
 * volume, loop, and a playback-speed cycle. Fully keyboard-reachable
 * (Space/K toggle, ←/→ seek 5 s, ↑/↓ volume, M mute, L loop) and labelled. Give
 * it a `src` or `blob`; pass a decoded `buffer` (or `peaks`) for the waveform.
 */
export function AudioPlayer({
  src,
  blob = null,
  buffer = null,
  peaks = null,
  loop = false,
  waveHeight = 96,
  className,
}: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [looping, setLooping] = React.useState(loop);
  const [speedIdx, setSpeedIdx] = React.useState(2); // 1x

  const objectUrl = React.useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob],
  );
  React.useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );
  const resolvedSrc = src ?? objectUrl ?? undefined;

  const toggle = React.useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }, []);

  const seekTo = React.useCallback((t: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration)) return;
    a.currentTime = Math.min(Math.max(t, 0), a.duration);
    setCurrent(a.currentTime);
  }, []);

  const seekFraction = React.useCallback(
    (f: number) => {
      if (duration > 0) seekTo(f * duration);
    },
    [duration, seekTo],
  );

  const setVol = React.useCallback((val: number) => {
    const a = audioRef.current;
    if (!a) return;
    const clamped = Math.min(Math.max(val, 0), 1);
    a.volume = clamped;
    a.muted = clamped === 0;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const toggleMute = React.useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setIsMuted(a.muted);
    if (!a.muted && a.volume === 0) setVol(0.5);
  }, [setVol]);

  const cycleSpeed = React.useCallback(() => {
    setSpeedIdx((i) => {
      const next = (i + 1) % SPEEDS.length;
      const a = audioRef.current;
      if (a) a.playbackRate = SPEEDS[next]!;
      return next;
    });
  }, []);

  const toggleLoop = React.useCallback(() => setLooping((l) => !l), []);

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
      case "l":
        e.preventDefault();
        toggleLoop();
        break;
      default:
        break;
    }
  };

  const playhead = duration > 0 ? current / duration : null;
  const speed = SPEEDS[speedIdx] ?? 1;

  return (
    <div
      role="group"
      aria-label="Audio player"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={resolvedSrc}
        loop={looping}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          setDuration(Number.isFinite(d) ? d : 0);
          e.currentTarget.playbackRate = speed;
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setIsMuted(e.currentTarget.muted);
        }}
        className="sr-only"
      />

      <Waveform
        buffer={buffer}
        peaks={peaks}
        playhead={playhead}
        onSeek={seekFraction}
        height={waveHeight}
        aria-label="Seek within audio"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause" : "Play"}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Icon name={playing ? "Pause" : "Play"} size={16} className={playing ? "" : "ml-0.5"} />
        </button>

        <span className="tabular-nums text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{formatDuration(current)}</span>
          {" / "}
          {formatDuration(duration)}
        </span>

        <div className="group/vol ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"} title={isMuted || volume === 0 ? "Unmute" : "Mute"}
            className="rounded p-1.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon
              name={isMuted || volume === 0 ? "VolumeX" : volume < 0.5 ? "Volume1" : "Volume2"}
              size={16}
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
            className="audio-range h-1 w-0 cursor-pointer appearance-none rounded-full bg-border opacity-0 transition-all group-hover/vol:w-16 group-hover/vol:opacity-100 focus-visible:w-16 focus-visible:opacity-100"
          />
        </div>

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed ${speed}×`}
          className="min-w-[42px] rounded-md px-2 py-1 text-sm font-semibold tabular-nums text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {speed}×
        </button>

        <button
          type="button"
          onClick={toggleLoop}
          aria-label="Toggle loop" title="Toggle loop"
          aria-pressed={looping}
          className={cn(
            "rounded-md p-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            looping
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Icon name="Repeat" size={16} />
        </button>
      </div>

      <style>{`
        .audio-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: hsl(var(--primary));
          cursor: pointer;
        }
        .audio-range::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border: none;
          border-radius: 9999px;
          background: hsl(var(--primary));
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
