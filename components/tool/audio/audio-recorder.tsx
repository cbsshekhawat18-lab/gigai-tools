"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

import { formatDuration } from "./audio-utils";

/** Props for {@link AudioRecorder}. */
export interface AudioRecorderProps {
  /** Called with the finished recording once the user stops. */
  onRecorded: (blob: Blob, meta: { duration: number; mimeType: string }) => void;
  /**
   * Preferred container/codec. Default tries "audio/webm" then "audio/mp4",
   * falling back to whatever the browser's MediaRecorder offers.
   */
  mimeType?: string;
  className?: string;
}

type Status = "idle" | "requesting" | "recording" | "paused" | "denied" | "unsupported";

/** Pick the first MediaRecorder mime type the browser can actually produce. */
function pickMimeType(preferred?: string): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    preferred,
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

/**
 * Microphone recorder with a live level meter, a running timer, and
 * start / pause / resume / stop controls. Permissions are handled gracefully:
 * denied or unsupported states surface an honest message instead of failing
 * silently. On stop it emits the recorded Blob plus its measured duration and
 * mime type. All streams, the AudioContext analyser, and the animation loop are
 * torn down on stop and unmount.
 */
export function AudioRecorder({ onRecorded, mimeType, className }: AudioRecorderProps) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [elapsed, setElapsed] = React.useState(0);
  const [level, setLevel] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const ctxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const startedAtRef = React.useRef(0);
  const accumRef = React.useRef(0); // seconds banked across pauses

  const onRecordedRef = React.useRef(onRecorded);
  onRecordedRef.current = onRecorded;

  const teardown = React.useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      void ctxRef.current.close();
    }
    ctxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setLevel(0);
  }, []);

  React.useEffect(() => teardown, [teardown]);

  // Timer + meter loop.
  const tick = React.useCallback(() => {
    const analyser = analyserRef.current;
    if (analyser) {
      const buf = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i]! - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setLevel((prev) => prev * 0.6 + Math.min(1, rms * 2.2) * 0.4);
    }
    if (recorderRef.current?.state === "recording") {
      setElapsed(accumRef.current + (performance.now() - startedAtRef.current) / 1000);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = React.useCallback(async () => {
    setError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setStatus("unsupported");
      setError("Recording isn't supported in this browser.");
      return;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const type = pickMimeType(mimeType);
      const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const outType = recorder.mimeType || type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: outType });
        const duration =
          accumRef.current + (performance.now() - startedAtRef.current) / 1000;
        onRecordedRef.current(blob, { duration, mimeType: outType });
        teardown();
        setStatus("idle");
        setElapsed(0);
      };
      recorderRef.current = recorder;

      // Analyser for the level meter.
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctor) {
        const ctx = new Ctor();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
      }

      accumRef.current = 0;
      startedAtRef.current = performance.now();
      recorder.start(200);
      setStatus("recording");
      setElapsed(0);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      teardown();
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError");
      setStatus(denied ? "denied" : "idle");
      setError(
        denied
          ? "Microphone access was blocked. Allow it in your browser's site settings and try again."
          : err instanceof Error
            ? err.message
            : "Couldn't start recording.",
      );
    }
  }, [mimeType, tick, teardown]);

  const pause = React.useCallback(() => {
    const r = recorderRef.current;
    if (r?.state === "recording") {
      r.pause();
      accumRef.current += (performance.now() - startedAtRef.current) / 1000;
      setStatus("paused");
    }
  }, []);

  const resume = React.useCallback(() => {
    const r = recorderRef.current;
    if (r?.state === "paused") {
      r.resume();
      startedAtRef.current = performance.now();
      setStatus("recording");
    }
  }, []);

  const stop = React.useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
  }, []);

  const active = status === "recording" || status === "paused";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center",
        className,
      )}
    >
      {/* Level meter ring */}
      <div className="relative grid size-24 place-items-center">
        <span
          className={cn(
            "absolute inset-0 rounded-full transition-transform duration-75",
            status === "recording" ? "bg-destructive/15" : "bg-muted",
          )}
          style={{ transform: `scale(${active ? 1 + level * 0.6 : 1})` }}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={active ? stop : start}
          disabled={status === "requesting"}
          aria-label={active ? "Stop recording" : "Start recording"} title={active ? "Stop recording" : "Start recording"}
          className={cn(
            "relative grid size-16 place-items-center rounded-full text-white shadow-lg outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60",
            active
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90",
          )}
        >
          <Icon
            name={
              status === "requesting"
                ? "Loader"
                : active
                  ? "Square"
                  : "Mic"
            }
            size={24}
            className={status === "requesting" ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {formatDuration(elapsed)}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {status === "recording" && (
            <>
              <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
              Recording
            </>
          )}
          {status === "paused" && "Paused"}
          {status === "requesting" && "Waiting for microphone…"}
          {status === "idle" && "Tap to record from your microphone"}
          {status === "denied" && "Microphone blocked"}
          {status === "unsupported" && "Recording unavailable"}
        </span>
      </div>

      {/* Pause / resume + stop controls while active */}
      {active && (
        <div className="flex items-center gap-2">
          {status === "recording" ? (
            <button
              type="button"
              onClick={pause}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="Pause" size={14} />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={resume}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="Play" size={14} />
              Resume
            </button>
          )}
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Check" size={14} />
            Finish
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={14} className="mt-px shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
