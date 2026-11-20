"use client";

import * as React from "react";

import {
  loadImageFile,
  downloadBlob,
  releaseImage,
  releaseResult,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { trackTool } from "@/lib/analytics";
import { rememberFiles } from "@/lib/recent-files";
import { warmImageEncoders } from "@/lib/engine-preload";

/** The finite states an image tool's workspace moves through. */
export type ToolPhase = "idle" | "ready" | "processing" | "done" | "error";

export interface UseImageTool {
  phase: ToolPhase;
  /** The decoded source image, or null before a file is chosen. */
  image: LoadedImage | null;
  /** The processed output, or null until `run()` completes. */
  result: ProcessResult | null;
  /** Human-readable error message when `phase === "error"`. */
  error: string | null;
  /** Live status line while `phase === "processing"` (e.g. model download). */
  status: string | null;
  /** Load and decode the first accepted file (drop, browse or paste). */
  selectFiles(files: FileList | File[]): Promise<void>;
  /** Process the current image with the tool's latest settings. */
  run(): Promise<void>;
  /** Tear everything down and return to the idle state. */
  reset(): void;
  /** Save the current result to disk. */
  download(): void;
}

export interface UseImageToolOptions {
  /** Tool slug — used for analytics attribution. */
  slug: string;
  /** The tool-specific processing function (closes over the tool's settings).
   *  May report live progress via the optional `onStatus` callback. */
  process: (
    img: LoadedImage,
    onStatus?: (message: string) => void,
  ) => Promise<ProcessResult>;
  /** Builds the download filename from the source image. */
  outputName: (img: LoadedImage) => string;
  /** Accept string for validation on paste (drop/browse validate in the uploader). */
  accept?: string;
}

/** Whether a file's MIME type satisfies a simple `accept` list. */
function matchesAccept(type: string, accept: string): boolean {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;

  const mime = type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return false; // extension rules need a filename
    if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

function toMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong while processing your image. Please try again.";
}

/**
 * Headless engine that powers every image tool's workspace. It owns the phase
 * machine, the decoded image / result lifecycle (revoking object URLs on reset
 * and unmount), clipboard-paste support and analytics — the UI layer
 * (`ToolWorkspace`) is purely presentational on top of this.
 *
 * The `process` and `outputName` callbacks are kept in refs so `run()` always
 * uses the tool's CURRENT settings, even though its own identity is stable.
 */
export function useImageTool(options: UseImageToolOptions): UseImageTool {
  const { slug, accept = "image/*" } = options;

  const [phase, setPhase] = React.useState<ToolPhase>("idle");
  const [image, setImage] = React.useState<LoadedImage | null>(null);
  const [result, setResult] = React.useState<ProcessResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);

  // Keep the latest callbacks/settings without re-binding effects or handlers.
  const processRef = React.useRef(options.process);
  const outputNameRef = React.useRef(options.outputName);
  React.useEffect(() => {
    processRef.current = options.process;
    outputNameRef.current = options.outputName;
  });

  // Refs mirror state so async handlers and the paste listener read fresh values.
  const imageRef = React.useRef<LoadedImage | null>(null);
  const resultRef = React.useRef<ProcessResult | null>(null);
  const phaseRef = React.useRef<ToolPhase>("idle");
  React.useEffect(() => {
    imageRef.current = image;
    resultRef.current = result;
    phaseRef.current = phase;
  }, [image, result, phase]);

  const clearResult = React.useCallback(() => {
    releaseResult(resultRef.current);
    resultRef.current = null;
    setResult(null);
  }, []);

  const selectFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files)[0];
      if (!file) return;

      // Start fetching the WASM encoders now, while the user reads the options.
      warmImageEncoders();

      // Drop any prior image/result before loading the new selection.
      clearResult();
      releaseImage(imageRef.current);
      imageRef.current = null;
      setImage(null);
      setError(null);

      try {
        const loaded = await loadImageFile(file);
        imageRef.current = loaded;
        setImage(loaded);
        setPhase("ready");
        rememberFiles([file]); // session-only hand-off to the next tool
        trackTool("file_selected", slug, {
          type: file.type,
          size: file.size,
          width: loaded.width,
          height: loaded.height,
        });
      } catch (err) {
        setError(toMessage(err));
        setPhase("error");
        trackTool("process_failed", slug, {
          stage: "load",
          message: toMessage(err),
        });
      }
    },
    [clearResult, slug],
  );

  const run = React.useCallback(async () => {
    const current = imageRef.current;
    if (!current) return;

    clearResult();
    setError(null);
    setStatus(null);
    setPhase("processing");
    trackTool("process_started", slug, {
      width: current.width,
      height: current.height,
    });

    // If the work runs long without its own status (usually a cold engine
    // download on first use), say so honestly instead of a silent spinner.
    let statusTouched = false;
    const reportStatus = (line: string | null) => {
      statusTouched = true;
      setStatus(line);
    };
    const firstRunNote = window.setTimeout(() => {
      if (!statusTouched) {
        setStatus("Setting up the engine in your browser. First run only, then it is instant.");
      }
    }, 2000);

    try {
      const output = await processRef.current(current, reportStatus);
      resultRef.current = output;
      setResult(output);
      setPhase("done");
      // The RESULT becomes the session hand-off — the next tool in the
      // workflow almost always wants the processed file, not the original.
      rememberFiles([
        new File([output.blob], outputNameRef.current(current), { type: output.format }),
      ]);
      trackTool("process_completed", slug, {
        outputSize: output.size,
        outputFormat: output.format,
        width: output.width,
        height: output.height,
      });
    } catch (err) {
      setError(toMessage(err));
      setPhase("error");
      trackTool("process_failed", slug, {
        stage: "process",
        message: toMessage(err),
      });
    } finally {
      window.clearTimeout(firstRunNote);
      setStatus(null);
    }
  }, [clearResult, slug]);

  const reset = React.useCallback(() => {
    clearResult();
    releaseImage(imageRef.current);
    imageRef.current = null;
    setImage(null);
    setError(null);
    setPhase("idle");
    trackTool("reset", slug);
  }, [clearResult, slug]);

  const download = React.useCallback(() => {
    const output = resultRef.current;
    const source = imageRef.current;
    if (!output || !source) return;
    const name = outputNameRef.current(source);
    downloadBlob(output.blob, name);
    trackTool("download", slug, { name, size: output.size });
  }, [slug]);

  // Clipboard paste: grab the first image on the clipboard while mounted.
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
        if (!matchesAccept(item.type, accept)) continue;
        const file = item.getAsFile();
        if (!file) continue;
        event.preventDefault();
        trackTool("paste", slug, { type: file.type, size: file.size });
        void selectFiles([file]);
        return;
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [accept, selectFiles, slug]);

  // Fire once per mount, and release all buffers on unmount.
  React.useEffect(() => {
    trackTool("tool_view", slug);
    return () => {
      releaseResult(resultRef.current);
      releaseImage(imageRef.current);
    };
  }, [slug]);

  return { phase, image, result, error, status, selectFiles, run, reset, download };
}
