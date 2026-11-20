"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ErrorBanner } from "@/components/tool/dev/error-banner";
import { FfmpegProgress } from "@/components/tool/video";

import { AudioDropzone } from "./audio-dropzone";
import { AudioResult } from "./audio-result";
import { type AudioMeta } from "./audio-utils";

/** State a tool receives to render its options + drive processing. */
export interface AudioWorkspaceRenderArgs {
  /** The loaded file (guaranteed non-null inside the options slot). */
  file: File;
  /** Probed metadata for the file. */
  meta: AudioMeta;
  /** True while processing, disable inputs. */
  busy: boolean;
}

/** Hooks handed to `onRun` so a tool can report progress + engine state. */
export interface AudioRunHooks {
  /** Report determinate progress 0–1 (omit / pass <0 for indeterminate). */
  onProgress: (p: number) => void;
  /**
   * Toggle the "loading engine" note. Only the exotic ffmpeg conversions need
   * this; native Web Audio / MP3 tools never call it (no 31 MB download).
   */
  onEngineLoading: (loading: boolean) => void;
  /** Aborts when the user cancels or resets. */
  signal: AbortSignal;
}

/** What `onRun` returns. */
export interface AudioRunResult {
  blob: Blob;
  /** Suggested download name. Falls back to `<input>-gigai.<ext>`. */
  filename?: string;
}

/** Props for {@link AudioWorkspace}. */
export interface AudioWorkspaceProps {
  /** Options UI for this tool; receives the loaded file + meta + busy. */
  children: (args: AudioWorkspaceRenderArgs) => React.ReactNode;
  /**
   * Runs the tool. Return the output blob (+ optional filename). Throwing
   * surfaces an error banner; check `signal.aborted` for cancellation.
   */
  onRun: (file: File, meta: AudioMeta, hooks: AudioRunHooks) => Promise<AudioRunResult>;
  /** Run-button label. Default "Process audio". */
  runLabel?: string;
  /** Run-button icon. Default "Play". */
  runIcon?: string;
  /** Result-card heading. */
  resultTitle?: string;
  /** `accept` passed to the dropzone. */
  accept?: string;
  /** Soft size warning ceiling (MB) for the dropzone. Default 200. */
  softMaxMB?: number;
  /** Progress-panel phase label, e.g. "Encoding MP3". */
  progressLabel?: string;
  className?: string;
}

type Phase = "idle" | "ready" | "processing" | "done";

interface Output {
  blob: Blob;
  filename: string;
}

/**
 * The end-to-end scaffold for an audio tool: dropzone → options slot → run
 * button → {@link FfmpegProgress} → {@link AudioResult}. It owns the file, probe
 * metadata, busy / progress / engine-loading state, abort wiring, and error
 * surfacing, so an individual tool is just an options form plus an `onRun`
 * function. 100% in-browser; nothing is uploaded. The shared ffmpeg progress
 * panel means WAV/MP3 tools show a clean indeterminate bar while exotic
 * conversions transparently surface the one-time engine download.
 */
export function AudioWorkspace({
  children,
  onRun,
  runLabel = "Process audio",
  runIcon = "Play",
  resultTitle,
  accept,
  softMaxMB = 200,
  progressLabel,
  className,
}: AudioWorkspaceProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<AudioMeta | null>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [progress, setProgress] = React.useState(-1);
  const [engineLoading, setEngineLoading] = React.useState(false);
  const [output, setOutput] = React.useState<Output | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const busy = phase === "processing";

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setFile(null);
    setMeta(null);
    setPhase("idle");
    setProgress(-1);
    setEngineLoading(false);
    setOutput(null);
    setError(null);
  }, []);

  const clearResult = React.useCallback(() => {
    setOutput(null);
    setPhase(file ? "ready" : "idle");
    setProgress(-1);
    setError(null);
  }, [file]);

  const handleFile = React.useCallback((f: File, m: AudioMeta) => {
    setFile(f);
    setMeta(m);
    setPhase("ready");
    setOutput(null);
    setError(null);
  }, []);

  const run = React.useCallback(async () => {
    if (!file || !meta) return;
    setError(null);
    setProgress(-1);
    setPhase("processing");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await onRun(file, meta, {
        onProgress: setProgress,
        onEngineLoading: setEngineLoading,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setOutput({
        blob: result.blob,
        filename: result.filename ?? deriveName(file.name, result.blob.type),
      });
      setPhase("done");
    } catch (err) {
      if (controller.signal.aborted) {
        setPhase("ready");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Processing failed. Try a smaller file.",
      );
      setPhase("ready");
    } finally {
      setEngineLoading(false);
    }
  }, [file, meta, onRun]);

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
    setPhase("ready");
    setEngineLoading(false);
    setProgress(-1);
  }, []);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <AudioDropzone
        onFile={handleFile}
        accept={accept}
        softMaxMB={softMaxMB}
        disabled={busy}
        file={file}
        meta={meta}
        onClear={busy ? undefined : reset}
      />

      {file && meta && phase !== "done" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            {children({ file, meta, busy })}
            <div className="flex items-center justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={run}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name={runIcon} size={16} />
                {runLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <FfmpegProgress
        busy={busy}
        progress={progress}
        loadingEngine={engineLoading}
        label={progressLabel ?? "Processing audio…"}
        onCancel={cancel}
      />

      {output && phase === "done" && (
        <AudioResult
          blob={output.blob}
          filename={output.filename}
          originalSize={file?.size}
          title={resultTitle}
          onReset={clearResult}
        />
      )}
    </div>
  );
}

/** Build a sensible output name from the input + output mime type. */
function deriveName(input: string, mime: string): string {
  const base = input.replace(/\.[^.]+$/, "") || "audio";
  const ext = mime.includes("mpeg") || mime.includes("mp3")
    ? "mp3"
    : mime.includes("wav")
      ? "wav"
      : mime.includes("ogg")
        ? "ogg"
        : mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")
          ? "m4a"
          : mime.includes("flac")
            ? "flac"
            : mime.includes("webm")
              ? "webm"
              : "wav";
  return `${base}-gigai.${ext}`;
}
