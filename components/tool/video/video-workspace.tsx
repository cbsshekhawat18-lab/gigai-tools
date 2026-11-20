"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ErrorBanner } from "@/components/tool/dev/error-banner";

import { VideoDropzone } from "./video-dropzone";
import { FfmpegProgress } from "./ffmpeg-progress";
import { VideoResult } from "./video-result";
import { type VideoMeta } from "./media-utils";

/** State a tool receives to render its options + drive processing. */
export interface VideoWorkspaceRenderArgs {
  /** The loaded file (guaranteed non-null inside the options slot). */
  file: File;
  /** Probed metadata for the file. */
  meta: VideoMeta;
  /** True while processing, disable inputs. */
  busy: boolean;
}

/** Props for {@link VideoWorkspace}. */
export interface VideoWorkspaceProps {
  /** Options UI for this tool; receives the loaded file + meta. */
  children: (args: VideoWorkspaceRenderArgs) => React.ReactNode;
  /**
   * Runs the tool. Return the output blob (+ optional filename). Report
   * progress via the passed `onProgress` (0–1) and toggle the engine-loading
   * note via `onEngineLoading`. Throwing surfaces an error banner.
   */
  onRun: (
    file: File,
    meta: VideoMeta,
    hooks: {
      onProgress: (p: number) => void;
      onEngineLoading: (loading: boolean) => void;
      signal: AbortSignal;
    },
  ) => Promise<{ blob: Blob; filename?: string; kind?: "video" | "image" | "audio" }>;
  /** Run-button label. Default "Process video". */
  runLabel?: string;
  /** Run-button icon. Default "Play". */
  runIcon?: string;
  /** Result-card heading. */
  resultTitle?: string;
  /** `accept` passed to the dropzone. */
  accept?: string;
  /** Soft size warning ceiling (MB) for the dropzone. Default 500. */
  softMaxMB?: number;
  /** Progress-panel phase label. */
  progressLabel?: string;
  className?: string;
}

type Phase = "idle" | "ready" | "processing" | "done";

interface Output {
  blob: Blob;
  filename: string;
  kind: "video" | "image" | "audio";
}

/**
 * The end-to-end scaffold for a video tool: dropzone → options slot → run
 * button → {@link FfmpegProgress} → {@link VideoResult}. It owns the file,
 * probe metadata, busy/progress/engine-loading state, abort wiring, and error
 * surfacing, so an individual tool is just an options form plus an `onRun`
 * function. 100% in-browser; nothing is uploaded.
 */
export function VideoWorkspace({
  children,
  onRun,
  runLabel = "Process video",
  runIcon = "Play",
  resultTitle,
  accept,
  softMaxMB = 500,
  progressLabel,
  className,
}: VideoWorkspaceProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<VideoMeta | null>(null);
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

  const handleFile = React.useCallback((f: File, m: VideoMeta) => {
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
        onProgress: (p) => setProgress(p),
        onEngineLoading: setEngineLoading,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const fallbackName = deriveName(file.name, result.kind ?? "video");
      setOutput({
        blob: result.blob,
        filename: result.filename ?? fallbackName,
        kind: result.kind ?? "video",
      });
      setPhase("done");
    } catch (err) {
      if (controller.signal.aborted) {
        setPhase("ready");
        return;
      }
      setError(err instanceof Error ? err.message : "Processing failed. Try a smaller file.");
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
      <VideoDropzone
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
        label={progressLabel}
        onCancel={cancel}
      />

      {output && phase === "done" && (
        <VideoResult
          blob={output.blob}
          filename={output.filename}
          kind={output.kind}
          originalSize={file?.size}
          title={resultTitle}
          onReset={clearResult}
        />
      )}
    </div>
  );
}

/** Build a sensible output name from the input + result kind. */
function deriveName(input: string, kind: "video" | "image" | "audio"): string {
  const base = input.replace(/\.[^.]+$/, "") || "output";
  const ext = kind === "image" ? "png" : kind === "audio" ? "mp3" : "mp4";
  return `${base}-gigai.${ext}`;
}
