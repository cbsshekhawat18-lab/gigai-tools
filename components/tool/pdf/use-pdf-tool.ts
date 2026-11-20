"use client";

import * as React from "react";

import type { NamedBlob, PdfInput as EnginePdfInput } from "@/lib/pdf/types";
import { trackTool } from "@/lib/analytics";
import { fileMatchesAccept } from "@/lib/file-accept";
import { downloadBlob } from "@/lib/pdf/core";
import { zipBlobs } from "@/lib/pdf/zip";
import { rememberFiles } from "@/lib/recent-files";
import { warmPdfBase } from "@/lib/engine-preload";

// Re-export the engine's output type so tools import everything from one place.
export type { NamedBlob } from "@/lib/pdf/types";

/** The finite states a PDF tool's workspace moves through. */
export type PdfPhase = "idle" | "ready" | "processing" | "done" | "error";

/**
 * A queued source file. It's a superset of the engine's `PdfInput` (`file` +
 * `name`), adding a stable `id` for keyed lists / reordering and the cached
 * `size` for display. Because it structurally satisfies the engine type, tools
 * can pass the queue straight to `lib/pdf/*` functions.
 */
export interface PdfInput extends EnginePdfInput {
  /** Stable id so the list can key + reorder without index churn. */
  id: string;
  size: number;
}

/** Progress reported by long-running engine operations (0–1). */
export interface PdfProgress {
  /** Fraction complete in [0, 1], or null when indeterminate. */
  value: number | null;
  /** Optional human-readable status, e.g. "Rendering page 3 of 12". */
  label?: string;
}

export interface UsePdfTool {
  phase: PdfPhase;
  /** The queued input files, in the order they'll be processed. */
  files: PdfInput[];
  /** The processed outputs, available once `run()` completes. */
  results: NamedBlob[];
  /** Live progress while `phase === "processing"`. */
  progress: PdfProgress;
  /** Human-readable error message when `phase === "error"`. */
  error: string | null;
  /** True while at least one file is queued (drives the ready state). */
  hasFiles: boolean;
  /** Add files from a drop, browse or programmatic source (validated). */
  addFiles(files: FileList | File[]): void;
  /** Remove a single queued file by id. */
  removeFile(id: string): void;
  /** Move a file from one index to another (for order-sensitive tools). */
  reorder(from: number, to: number): void;
  /** Clear the whole queue and return to idle. */
  clearFiles(): void;
  /** Run the tool's `process` over the current queue. */
  run(): Promise<void>;
  /** Discard results + queue and return to idle. */
  reset(): void;
  /** Download one result by index, or the first when omitted. */
  download(index?: number): void;
  /** Download every result: a single file directly, many as a.zip. */
  downloadAll(): Promise<void>;
}

export interface UsePdfToolOptions {
  /** Tool slug, used for analytics attribution. */
  slug: string;
  /** Accept string for type validation, e.g. "application/pdf". */
  accept?: string;
  /** Allow queueing more than one file. Default true. */
  multiple?: boolean;
  /** Hard cap on the number of queued files. */
  maxFiles?: number;
  /** Per-file size ceiling in megabytes. Default 100. */
  maxSizeMb?: number;
  /**
   * Extra engine warm-up to start the moment files are queued (e.g. pdf.js +
   * the JPEG encoder for rasterising tools). pdf-lib is always warmed.
   */
  warm?: () => void;
  /** Base name for the combined .zip when downloading many results. */
  zipName?: string;
  /**
   * The tool-specific processor. Receives the ordered queue and a progress
   * reporter, and resolves to the output blobs to offer for download.
   */
  process: (
    files: PdfInput[],
    onProgress: (progress: PdfProgress) => void,
  ) => Promise<NamedBlob[]>;
}

let idCounter = 0;
/** Monotonic, collision-free id for a queued file. */
function nextId(): string {
  idCounter += 1;
  return `f${idCounter}-${Date.now().toString(36)}`;
}

/** Whether a file satisfies a simple comma-separated `accept` list. */
const matchesAccept = fileMatchesAccept;

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** Reorder helper that is a no-op for out-of-range or identical indices. */
function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list;
  }
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return list;
  next.splice(to, 0, moved);
  return next;
}

/**
 * Headless engine that powers every PDF tool's workspace. It owns the phase
 * machine over a *queue* of files (unlike the single-image hook), tracks
 * progress for long jobs, produces one or more downloadable results, and fires
 * analytics. The presentational `PdfWorkspace` renders purely on top of this.
 *
 * The `process` callback is kept in a ref so `run()` always uses the tool's
 * CURRENT settings even though the hook's own methods are stable.
 */
export function usePdfTool(options: UsePdfToolOptions): UsePdfTool {
  const {
    slug,
    accept = "application/pdf",
    multiple = true,
    maxFiles,
    maxSizeMb = 100,
    zipName = `${slug}-gigai`,
  } = options;

  const [phase, setPhase] = React.useState<PdfPhase>("idle");
  const [files, setFiles] = React.useState<PdfInput[]>([]);
  const [results, setResults] = React.useState<NamedBlob[]>([]);
  const [progress, setProgress] = React.useState<PdfProgress>({ value: null });
  const [error, setError] = React.useState<string | null>(null);

  // Keep the latest process callback without re-binding run().
  const processRef = React.useRef(options.process);
  React.useEffect(() => {
    processRef.current = options.process;
  });

  // Same pattern for the optional warm-up, so addFiles stays stably bound.
  const warmRef = React.useRef(options.warm);
  React.useEffect(() => {
    warmRef.current = options.warm;
  });

  // Mirror the queue so async handlers read the freshest value.
  const filesRef = React.useRef<PdfInput[]>([]);
  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const maxBytes =
    typeof maxSizeMb === "number" ? maxSizeMb * 1024 * 1024 : undefined;

  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      const candidates = Array.from(incoming);
      if (candidates.length === 0) return;

      // Fetch the engines while the user reviews the queue and options.
      warmPdfBase();
      warmRef.current?.();

      const current = filesRef.current;
      const accepted: PdfInput[] = [];
      let rejectedType = 0;
      let rejectedSize = 0;

      for (const file of candidates) {
        if (!matchesAccept(file, accept)) {
          rejectedType += 1;
          continue;
        }
        if (maxBytes !== undefined && file.size > maxBytes) {
          rejectedSize += 1;
          continue;
        }
        accepted.push({
          id: nextId(),
          file,
          name: file.name,
          size: file.size,
        });
      }

      // Surface the first validation problem instead of silently dropping.
      if (accepted.length === 0) {
        if (rejectedType > 0) {
          setError(
            `That file type isn't supported here. Please choose a ${
              accept.includes("pdf") ? "PDF" : "supported"
            } file.`,
          );
          setPhase(current.length > 0 ? "ready" : "error");
        } else if (rejectedSize > 0 && maxSizeMb) {
          setError(
            accept.includes("pdf")
              ? `This PDF is larger than ${maxSizeMb} MB. Split it first or use a smaller file.`
              : `That file is larger than the ${maxSizeMb} MB limit. Please choose a smaller file.`,
          );
          setPhase(current.length > 0 ? "ready" : "error");
        }
        return;
      }

      // For single-file tools, the newest selection replaces the queue.
      const merged = multiple ? [...current, ...accepted] : accepted.slice(-1);
      const capped =
        multiple && typeof maxFiles === "number"
          ? merged.slice(0, maxFiles)
          : merged;

      setError(
        rejectedSize > 0 && maxSizeMb
          ? `Some files were over the ${maxSizeMb} MB limit and were skipped.`
          : null,
      );
      setFiles(capped);
      filesRef.current = capped;
      setResults([]);
      setPhase("ready");
      rememberFiles(accepted.map((a) => a.file)); // session-only hand-off

      trackTool("file_selected", slug, {
        category: "pdf_tool",
        added: accepted.length,
        total: capped.length,
        skipped: rejectedType + rejectedSize,
      });
    },
    [accept, maxBytes, maxFiles, maxSizeMb, multiple, slug],
  );

  const removeFile = React.useCallback((id: string) => {
    const next = filesRef.current.filter((f) => f.id !== id);
    filesRef.current = next;
    setFiles(next);
    setResults([]);
    setError(null);
    // Removing while showing a result/error returns to the appropriate zero/
    // ready state; mid-flow (processing) we leave the phase untouched.
    setPhase((prev) =>
      prev === "done" || prev === "error"
        ? next.length > 0
          ? "ready"
          : "idle"
        : prev,
    );
  }, []);

  const reorder = React.useCallback((from: number, to: number) => {
    const next = moveItem(filesRef.current, from, to);
    if (next === filesRef.current) return;
    filesRef.current = next;
    setFiles(next);
  }, []);

  const clearFiles = React.useCallback(() => {
    setFiles([]);
    filesRef.current = [];
    setResults([]);
    setError(null);
    setProgress({ value: null });
    setPhase("idle");
    trackTool("reset", slug, { category: "pdf_tool" });
  }, [slug]);

  const run = React.useCallback(async () => {
    const queue = filesRef.current;
    if (queue.length === 0) return;

    setResults([]);
    setError(null);
    setProgress({ value: null });
    setPhase("processing");
    trackTool("process_started", slug, {
      category: "pdf_tool",
      files: queue.length,
    });

    try {
      const output = await processRef.current(queue, setProgress);
      if (output.length === 0) {
        throw new Error("Nothing was produced. Please check your files and try again.");
      }
      setResults(output);
      setProgress({ value: 1 });
      setPhase("done");
      // The RESULTS become the session hand-off: the next tool in the
      // workflow almost always wants the processed files, not the originals.
      rememberFiles(
        output.map((r) => new File([r.blob], r.name, { type: r.blob.type })),
      );
      trackTool("process_completed", slug, {
        category: "pdf_tool",
        results: output.length,
        outputSize: output.reduce((sum, r) => sum + r.size, 0),
      });
    } catch (err) {
      const message = toMessage(
        err,
        "Something went wrong while processing your files. Please try again.",
      );
      setError(message);
      setPhase("error");
      trackTool("process_failed", slug, {
        category: "pdf_tool",
        stage: "process",
        message,
      });
    }
  }, [slug]);

  const reset = React.useCallback(() => {
    setFiles([]);
    filesRef.current = [];
    setResults([]);
    setError(null);
    setProgress({ value: null });
    setPhase("idle");
    trackTool("reset", slug, { category: "pdf_tool" });
  }, [slug]);

  const download = React.useCallback(
    (index = 0) => {
      const target = results[index];
      if (!target) return;
      downloadBlob(target.blob, target.name);
      trackTool("download", slug, {
        category: "pdf_tool",
        name: target.name,
        size: target.size,
      });
    },
    [results, slug],
  );

  const downloadAll = React.useCallback(async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      const only = results[0];
      if (!only) return;
      downloadBlob(only.blob, only.name);
      trackTool("download", slug, {
        category: "pdf_tool",
        name: only.name,
        size: only.size,
      });
      return;
    }

    try {
      const zip = await zipBlobs(results, `${zipName}.zip`);
      downloadBlob(zip.blob, zip.name);
      trackTool("download", slug, {
        category: "pdf_tool",
        name: zip.name,
        size: zip.size,
        bundled: results.length,
      });
    } catch (err) {
      setError(
        toMessage(err, "We couldn't bundle the files into a zip. Please download them one by one."),
      );
    }
  }, [results, slug, zipName]);

  // Fire once per mount for view attribution.
  React.useEffect(() => {
    trackTool("tool_view", slug, { category: "pdf_tool" });
  }, [slug]);

  return {
    phase,
    files,
    results,
    progress,
    error,
    hasFiles: files.length > 0,
    addFiles,
    removeFile,
    reorder,
    clearFiles,
    run,
    reset,
    download,
    downloadAll,
  };
}
