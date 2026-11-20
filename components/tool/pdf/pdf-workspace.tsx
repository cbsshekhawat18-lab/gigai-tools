"use client";

import * as React from "react";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { DropUploader } from "@/components/tool/drop-uploader";
import { ExportButton } from "@/components/tool/export-button";
import { NextSteps } from "@/components/tool/next-steps";
import { ResponsiveAd } from "@/components/ads";
import { ElapsedNote, notifyDoneInTitle, WorkGate } from "@/components/shared/working-state";
import { verbForms } from "@/lib/verb-forms";
import { ResultSuccess } from "@/components/tool/result-success";
import type { UsePdfTool } from "@/components/tool/pdf/use-pdf-tool";

export interface PdfWorkspaceProps {
  /** The headless tool state from `usePdfTool`. */
  state: UsePdfTool;
  /** Per-tool accent for the primary action and highlights. */
  accent?: AccentKey;
  /** Accept string for the uploader, e.g. "application/pdf". */
  accept?: string;
  /** Whether the uploader accepts multiple files. Default true. */
  multiple?: boolean;
  /** Helper text under the uploader prompt (formats). */
  dropHint?: string;
  /** Icon shown in the drop zone. Default "FilePlus2". */
  dropIcon?: string;
  /** Label for the primary process button, e.g. "Merge PDFs". */
  processLabel?: string;
  /** Short explanation of what happens on process, shown by the button. */
  resultHint?: string;
  /**
   * Tool-specific controls (file list, page grid, option toggles) shown in the
   * "ready" state above the Process button.
   */
  children?: React.ReactNode;
  /**
   * Extra content for the DONE state, shown above the download list.
   *
   * `children` render only while the phase is "ready", so a tool that produces
   * a report about its own result (Repair's recovery count, PDF to Markdown's
   * preview) has nowhere to put it without this slot — it would mount, be
   * invisible, and look like the feature was never built.
   */
  resultExtra?: React.ReactNode;
}

/**
 * The universal PDF-tool card. It renders one of five layouts driven by
 * `state.phase`:
 *
 *   idle       → DropUploader (drag / browse, multiple)
 *   ready      → `children` (the tool's controls) + a Process action
 *   processing → a determinate/indeterminate progress bar + live status
 *   done       → each result with a Download button, Download-all, Start over
 *   error      → ErrorState with a Retry
 *
 * Tools supply only their controls and labels; the flow, responsiveness,
 * accessibility and analytics live in `usePdfTool` + this shell.
 */
export function PdfWorkspace({
  state,
  accent,
  accept = "application/pdf",
  multiple = true,
  dropHint,
  dropIcon = "FilePlus2",
  processLabel = "Process",
  resultHint,
  children,
  resultExtra,
}: PdfWorkspaceProps) {
  const { phase, results, progress, error } = state;

  React.useEffect(() => {
    if (phase === "done") notifyDoneInTitle("Ready");
  }, [phase]);
  const style = accentStyle(accent);

  const pct =
    progress.value !== null
      ? Math.round(Math.min(1, Math.max(0, progress.value)) * 100)
      : null;

  return (
    <Card className="overflow-hidden rounded-2xl p-4 sm:p-6">
      {/* ── Idle: the uploader ─────────────────────────────────────────────── */}
      {phase === "idle" ? (
        <DropUploader
          onFiles={(f) => state.addFiles(f)}
          accept={accept}
          multiple={multiple}
          accent={accent}
          hint={dropHint}
          icon={dropIcon}
          showPaste={false}
          pasteFiles
          label={
            multiple
              ? "Upload PDF files — drag and drop, paste, or click to browse"
              : "Upload a PDF — drag and drop, paste, or click to browse"
          }
        />
      ) : null}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {phase === "error" ? (
        <ErrorState
          title="We couldn't process your files"
          description={error ?? "Please check your files and try again."}
          retry={state.hasFiles ? state.run : state.reset}
        />
      ) : null}

      {/* ── Ready: controls + process ──────────────────────────────────────── */}
      {phase === "ready" ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">{children}</div>

          {error ? (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
            >
              <Icon name="TriangleAlert" size={15} />
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="lg"
                onClick={() => void state.run()}
                disabled={!state.hasFiles}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Icon name="Sparkles" size={18} />
                {processLabel}
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <label className="cursor-pointer">
                  <Icon name="Plus" size={16} />
                  Add {multiple ? "more" : "another"}
                  <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="sr-only"
                    onChange={(event) => {
                      if (event.target.files) state.addFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </Button>

              <Button variant="ghost" size="lg" onClick={state.reset}>
                <Icon name="X" size={16} />
                Clear all
              </Button>
            </div>

            {resultHint ? (
              <p className="text-sm text-muted-foreground sm:max-w-[16rem] sm:text-right">
                {resultHint}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ── Processing: progress bar + status ──────────────────────────────── */}
      {phase === "processing" ? (
        <WorkGate busy>
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-5 px-4 py-14 text-center"
        >
          <Icon
            name="LoaderCircle"
            size={32}
            className={cn("animate-spin", style.text)}
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-base font-medium text-foreground">
              {progress.label ?? verbForms(processLabel).working}
            </p>
            <p className="text-sm text-muted-foreground">
              This runs entirely in your browser — larger files take a little
              longer.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct ?? undefined}
              aria-label="Processing progress"
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-[width] duration-300 ease-out",
                  pct === null && "animate-pulse",
                )}
                style={{ width: pct === null ? "100%" : `${pct}%` }}
              />
            </div>
            {pct !== null ? (
              <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                {pct}%
              </p>
            ) : null}
            <ElapsedNote busy progress={progress.value} />
          </div>
        </div>
        </WorkGate>
      ) : null}

      {/* ── Done: results + downloads ──────────────────────────────────────── */}
      {phase === "done" && results.length > 0 ? (
        <div className="animate-rise flex flex-col gap-6">
          <ResultSuccess
            title={
              results.length === 1
                ? verbForms(processLabel).done
                : `${verbForms(processLabel).done} — ${results.length} files`
            }
            detail="Processed locally — nothing was uploaded."
          />

          {resultExtra}

          <ul className="flex flex-col gap-2">
            {results.map((result, index) => (
              <li
                key={`${result.name}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    style.soft,
                  )}
                >
                  <Icon name="FileText" size={18} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {result.name}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatBytes(result.size)}
                  </span>
                </span>
                <ExportButton
                 
                  emphasis="outline"
                  format={result.name}
                  onClick={() => state.download(index)}
                  aria-label={`Download ${result.name}`}
                />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <ExportButton
              size="lg"
              format={results.length > 1 ? "zip" : results[0]!.name}
              label={results.length > 1 ? "Download all (.zip)" : undefined}
              meta={formatBytes(results.reduce((sum, r) => sum + r.size, 0))}
              onClick={() => void state.downloadAll()}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={state.reset}
            >
              <Icon name="RotateCcw" size={18} />
              Start over
            </Button>
          </div>

          <ResponsiveAd position="TOOL_AFTER_RESULT" />
          <NextSteps />
        </div>
      ) : null}
    </Card>
  );
}
