"use client";

/**
 * Audio Player, the "Info" / listening tool of the GigAI Audio Toolkit.
 *
 * A pure, private in-browser player. Drop a file: it's decoded locally with the
 * native Web Audio API only to draw a {@link Waveform}, and played back through a
 * plain <audio> element that streams the ORIGINAL, untouched file (no upload, no
 * re-encode, no export). On top of the base playback we add:
 *   - click-to-seek on the waveform with a live playhead,
 *   - variable playback speed (pitch shifts with speed, like a tape machine),
 *   - whole-track loop, and
 *   - A–B repeat: drag a region on the waveform to loop just that passage.
 *
 * Everything stays on the device; nothing is uploaded, stored or altered. No
 * ffmpeg and no encoder are ever loaded. This tool only reads and plays.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ErrorBanner } from "@/components/tool/dev/error-banner";
import {
  AudioDropzone,
  Waveform,
  decodeAudio,
  describeAudio,
  formatBytes,
  formatDuration,
  type AudioMeta,
  type WaveSelection,
} from "@/components/tool/audio";

/** Selectable playback rates. Pitch shifts with speed (tape-style). */
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface Loaded {
  file: File;
  meta: AudioMeta;
}

/**
 * The player surface, mounted once per loaded file (keyed by name+size so all
 * per-file state (playback, speed, A–B loop) resets cleanly on a new drop).
 */
function Player({ file, meta }: Loaded) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);

  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(meta.duration || 0);
  const [speedIdx, setSpeedIdx] = React.useState(2); // 1×
  const [looping, setLooping] = React.useState(false);

  // A–B repeat region as fractions 0–1, or null when off.
  const [abLoop, setAbLoop] = React.useState<WaveSelection | null>(null);

  // Object URL for the ORIGINAL file, streamed untouched, never re-encoded.
  const objectUrl = React.useMemo(() => URL.createObjectURL(file), [file]);
  React.useEffect(() => () => URL.revokeObjectURL(objectUrl), [objectUrl]);

  // Decode locally, once, only to draw the waveform.
  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    setDecodeError(null);
    decodeAudio(file)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch(() => {
        if (!cancelled) {
          setDecodeError(
            "Couldn't draw a waveform for this file, but you can still play it below. If it won't play either, the codec isn't supported here, convert it first with the Audio Converter.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const speed = SPEEDS[speedIdx] ?? 1;
  const dur = duration || meta.duration || 0;
  const playhead = dur > 0 ? clamp(current / dur, 0, 1) : null;

  const seekToFraction = React.useCallback(
    (f: number) => {
      const a = audioRef.current;
      if (!a || !(dur > 0)) return;
      a.currentTime = clamp(f, 0, 1) * dur;
      setCurrent(a.currentTime);
    },
    [dur],
  );

  const toggle = React.useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }, []);

  const cycleSpeed = React.useCallback(() => {
    setSpeedIdx((i) => {
      const next = (i + 1) % SPEEDS.length;
      const a = audioRef.current;
      if (a) a.playbackRate = SPEEDS[next] ?? 1;
      return next;
    });
  }, []);

  const setLoopA = React.useCallback(() => {
    if (!(dur > 0)) return;
    const a = current / dur;
    setAbLoop((prev) => {
      const end = prev ? Math.max(prev.end, a) : Math.min(1, a + 0.02);
      return { start: clamp(Math.min(a, end), 0, 1), end: clamp(Math.max(a, end), 0, 1) };
    });
  }, [current, dur]);

  const setLoopB = React.useCallback(() => {
    if (!(dur > 0)) return;
    const b = current / dur;
    setAbLoop((prev) => {
      const start = prev ? prev.start : 0;
      return { start: clamp(Math.min(start, b), 0, 1), end: clamp(Math.max(start, b), 0, 1) };
    });
  }, [current, dur]);

  const clearLoop = React.useCallback(() => setAbLoop(null), []);

  // Enforce the A–B loop during playback: when playback passes B, snap back to A.
  const handleTimeUpdate = React.useCallback(
    (t: number) => {
      setCurrent(t);
      const a = audioRef.current;
      if (!a || !abLoop || !(dur > 0)) return;
      const startSec = abLoop.start * dur;
      const endSec = abLoop.end * dur;
      if (endSec - startSec < 0.02) return;
      if (t >= endSec || t < startSec - 0.05) {
        a.currentTime = startSec;
        setCurrent(startSec);
        if (a.paused) void a.play();
      }
    },
    [abLoop, dur],
  );

  const handleSelect = React.useCallback((next: WaveSelection) => {
    const start = clamp(Math.min(next.start, next.end), 0, 1);
    const end = clamp(Math.max(next.start, next.end), 0, 1);
    setAbLoop({ start, end });
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
        seekToFraction((current + 5) / (dur || 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekToFraction((current - 5) / (dur || 1));
        break;
      case "l":
        e.preventDefault();
        setLooping((v) => !v);
        break;
      default:
        break;
    }
  };

  const abStartSec = abLoop ? abLoop.start * dur : 0;
  const abEndSec = abLoop ? abLoop.end * dur : 0;
  const abLen = Math.max(0, abEndSec - abStartSec);
  const abActive = Boolean(abLoop) && abLen > 0.02;

  return (
    <div className="flex flex-col gap-4">
      {decodeError ? <ErrorBanner error={decodeError} onDismiss={() => setDecodeError(null)} /> : null}

      {/* Meta strip */}
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
        <Icon name="FileAudio" size={14} className="text-primary" />
        <span className="font-medium text-foreground">{file.name}</span>
        <span aria-hidden>·</span>
        <span>{describeAudio(meta)}</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{formatDuration(meta.duration)}</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{formatBytes(file.size)}</span>
      </p>

      {/* Player card */}
      <div
        role="group"
        aria-label={`Audio player, ${file.name}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
      >
        {/* Hidden media element streaming the ORIGINAL, untouched file. */}
        <audio
          ref={audioRef}
          src={objectUrl}
          loop={looping}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(d);
            e.currentTarget.playbackRate = speed;
          }}
          onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
          className="sr-only"
        />

        <Waveform
          buffer={buffer}
          selection={abLoop}
          onSelect={handleSelect}
          playhead={playhead}
          onSeek={seekToFraction}
          height={112}
          aria-label="Waveform. Click to seek, or drag to set an A–B repeat region"
        />

        {/* Transport row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause" : "Play"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Icon name={playing ? "Pause" : "Play"} size={18} className={playing ? "" : "ml-0.5"} />
          </button>

          <span className="tabular-nums text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{formatDuration(current)}</span>
            {" / "}
            {formatDuration(dur)}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={cycleSpeed}
              aria-label={`Playback speed ${speed}×`}
              className="min-w-[46px] rounded-md border border-border px-2 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {speed}×
            </button>

            <button
              type="button"
              onClick={() => setLooping((v) => !v)}
              aria-label="Toggle whole-track loop"
              aria-pressed={looping}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                looping
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon name="RefreshCw" size={14} />
              Loop
            </button>
          </div>
        </div>

        {/* A–B repeat row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Icon name="Repeat" size={14} className="text-primary" />
            A–B repeat
          </span>

          <div className="flex items-center gap-1.5" role="group" aria-label="Set A–B repeat points">
            <button
              type="button"
              onClick={setLoopA}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              Set A
            </button>
            <button
              type="button"
              onClick={setLoopB}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              Set B
            </button>
            <button
              type="button"
              onClick={clearLoop}
              disabled={!abLoop}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <Icon name="X" size={13} />
              Clear
            </button>
          </div>

          <span className="ml-auto text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {abActive ? (
              <>
                Looping{" "}
                <span className="font-semibold text-primary">{formatDuration(abStartSec, true)}</span>
                {" – "}
                <span className="font-semibold text-primary">{formatDuration(abEndSec, true)}</span>
                {" · "}
                {formatDuration(abLen, true)}
              </>
            ) : (
              "Drag the waveform, or use Set A / Set B"
            )}
          </span>
        </div>
      </div>

      <p className="flex items-start gap-1.5 px-1 text-xs text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className="mt-px shrink-0 text-success" />
        This is a player only. Your file is played on your device, never uploaded,
        re-encoded or exported, and it&apos;s gone when you close the tab.
      </p>
    </div>
  );
}

/**
 * Audio Player tool. A private, in-browser listening surface: drop a file, get a
 * real waveform, and play it with click-to-seek, variable speed, whole-track
 * loop and A–B repeat. No upload, no processing, no export. TS-strict clean;
 * dark-mode, responsive and keyboard accessible.
 */
export default function AudioPlayerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);

  const onFile = React.useCallback((file: File, meta: AudioMeta) => {
    setLoaded({ file, meta });
  }, []);

  const onClear = React.useCallback(() => setLoaded(null), []);

  return (
    <div className="flex flex-col gap-4">
      <AudioDropzone
        onFile={onFile}
        file={loaded?.file ?? null}
        meta={loaded?.meta ?? null}
        onClear={onClear}
      />

      {loaded ? (
        <Player key={`${loaded.file.name}:${loaded.file.size}`} file={loaded.file} meta={loaded.meta} />
      ) : null}
    </div>
  );
}
