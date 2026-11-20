"use client";

/**
 * <ConvertShell>: the small, opinionated frame every document converter tool
 * is built on: input (dropzone) → options → Convert action → result (preview +
 * download). It owns the whole state machine so a tool file only supplies an
 * `accept` list, an async `convert` function, and (optionally) an options slot.
 *
 * Phases:
 *   idle       → DocumentDropzone
 *   ready      → selected-file chip + options + Convert button
 *   converting → spinner + status
 *   done       → result preview + Download + Convert another
 *   error      → inline error + Retry
 *
 * The `convert` callback receives the chosen file and returns a {@link ConvertResult}
 * (a named Blob, plus an optional previewable File and an honesty `note`). All
 * work is in-browser; the shell never uploads anything.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatBytes } from "@/lib/pdf/core";
import { rememberFiles } from "@/lib/recent-files";
import { Button } from "@/components/ui/button";
import { download } from "@/components/tool/dev";
import {
  DocumentDropzone,
  type DetectedFile,
  type DocumentDropzoneProps,
} from "./document-dropzone";
import { DocumentPreview } from "./document-preview";
import { type DocumentKind, detectKind } from "@/lib/document-tools";

/** The output of a conversion. */
export interface ConvertResult {
  /** Suggested download filename, e.g. "report.pdf". */
  filename: string;
  /** The converted bytes. */
  blob: Blob;
  /** MIME type for the download. Defaults from the blob / filename. */
  mime?: string;
  /**
   * A previewable File for the result (often just `new File([blob], filename)`).
   * When omitted the shell derives one from `blob` + `filename`.
   */
  previewFile?: File;
  /** Force the preview kind; otherwise detected from `filename`/`mime`. */
  previewKind?: DocumentKind;
  /**
   * An honest caveat about fidelity (e.g. "Layout is approximate: complex
   * tables may shift"). Surfaced prominently on the result screen.
   */
  note?: string;
}

/** Phases of the convert flow. */
type Phase = "idle" | "ready" | "converting" | "done" | "error";

/** Props for {@link ConvertShell}. */
export interface ConvertShellProps {
  /** Allowed input kinds; forwarded to the dropzone + used for the accept filter. */
  accept: readonly DocumentKind[];
  /** Does the actual work. `status` reports progress text for the busy screen. */
  convert: (
    file: File,
    setStatus: (text: string) => void,
  ) => Promise<ConvertResult>;
  /** Label for the primary action. Default "Convert". */
  convertLabel?: string;
  /** Optional controls rendered between the file chip and the Convert button. */
  options?: React.ReactNode;
  /** Prompt shown in the empty dropzone. */
  dropLabel?: React.ReactNode;
  /** Hint under the dropzone prompt. */
  dropHint?: React.ReactNode;
  /** Drop-zone icon. */
  dropIcon?: string;
  /** Preview the *input* file once selected (above options). Default true. */
  previewInput?: boolean;
  /** Preview the *result* on the done screen. Default true. */
  previewResult?: boolean;
  /**
   * A persistent honesty note about the conversion's limits, shown on the ready
   * screen (before converting). For caveats that always apply.
   */
  limitationNote?: React.ReactNode;
  /** Extra props forwarded to the dropzone (e.g. paste, disabled). */
  dropzoneProps?: Partial<
    Omit<DocumentDropzoneProps, "onFile" | "accept" | "selected" | "onClear">
  >;
  className?: string;
}

/** The reusable input→convert→result frame for document converters. */
export function ConvertShell({
  accept,
  convert,
  convertLabel = "Convert",
  options,
  dropLabel,
  dropHint,
  dropIcon,
  previewInput = true,
  previewResult = true,
  limitationNote,
  dropzoneProps,
  className,
}: ConvertShellProps) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [status, setStatus] = React.useState("Working…");
  const [result, setResult] = React.useState<ConvertResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setPhase("idle");
    setSelected(null);
    setResult(null);
    setError(null);
  };

  const onFile = (detected: DetectedFile) => {
    setSelected(detected);
    setResult(null);
    setError(null);
    setPhase("ready");
  };

  const run = async () => {
    if (!selected) return;
    setPhase("converting");
    setError(null);
    setStatus("Working…");
    try {
      const out = await convert(selected.file, setStatus);
      setResult(out);
      setPhase("done");
      // The RESULT becomes the session hand-off (lib/recent-files), the
      // next tool in the workflow wants the converted file.
      rememberFiles([
        new File([out.blob], out.filename, { type: out.mime ?? out.blob.type }),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Conversion failed. Please try again.",
      );
      setPhase("error");
    }
  };

  const doDownload = () => {
    if (!result) return;
    const mime = result.mime ?? result.blob.type ?? undefined;
    download(result.filename, result.blob, mime);
  };

  const resultPreviewFile = React.useMemo(() => {
    if (!result) return null;
    if (result.previewFile) return result.previewFile;
    return new File([result.blob], result.filename, {
      type: result.mime ?? result.blob.type,
    });
  }, [result]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Idle */}
      {phase === "idle" && (
        <DocumentDropzone
          onFile={onFile}
          accept={accept}
          label={dropLabel}
          hint={dropHint}
          {...(dropIcon ? { icon: dropIcon } : {})}
          {...dropzoneProps}
        />
      )}

      {/* Ready */}
      {phase === "ready" && selected && (
        <div className="flex flex-col gap-4">
          <DocumentDropzone
            onFile={onFile}
            accept={accept}
            selected={selected}
            onClear={reset}
          />

          {previewInput && (
            <DocumentPreview
              file={selected.file}
              kind={selected.kind}
              height={360}
            />
          )}

          {options && (
            <div className="rounded-xl border border-border bg-card p-4">
              {options}
            </div>
          )}

          {limitationNote && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>{limitationNote}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={() => void run()}>
              <Icon name="Sparkles" size={18} />
              {convertLabel}
            </Button>
            <Button variant="ghost" size="lg" onClick={reset}>
              <Icon name="X" size={16} />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Converting */}
      {phase === "converting" && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-4 py-14 text-center"
        >
          <Icon name="LoaderCircle" size={30} className="animate-spin text-primary" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-foreground">{status}</p>
            <p className="text-sm text-muted-foreground">
              This runs entirely in your browser; nothing is uploaded.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <Icon name="CircleAlert" size={22} className="mt-0.5 shrink-0 text-destructive" />
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">We couldn&apos;t convert your file</p>
              <p className="text-sm text-muted-foreground">
                {error ?? "Please check the file and try again."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected && (
              <Button onClick={() => void run()}>
                <Icon name="RotateCcw" size={16} />
                Try again
              </Button>
            )}
            <Button variant="outline" onClick={reset}>
              <Icon name="X" size={16} />
              Start over
            </Button>
          </div>
        </div>
      )}

      {/* Done */}
      {phase === "done" && result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Icon name="CircleCheck" size={24} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-sm font-semibold text-foreground">
                {result.filename}
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {formatBytes(result.blob.size)} · Ready to download
              </p>
            </div>
            <Button onClick={doDownload}>
              <Icon name="Download" size={16} />
              Download
            </Button>
          </div>

          {result.note && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>{result.note}</span>
            </p>
          )}

          {previewResult && resultPreviewFile && (
            <DocumentPreview
              file={resultPreviewFile}
              kind={
                result.previewKind ??
                detectKind(result.filename, result.mime ?? result.blob.type)
              }
              height={420}
            />
          )}

          <Button variant="outline" size="lg" onClick={reset} className="self-start">
            <Icon name="RotateCcw" size={16} />
            Convert another file
          </Button>
        </div>
      )}
    </div>
  );
}
