"use client";

import * as React from "react";
import Image from "next/image";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes, type LoadedImage, type ProcessResult } from "@/lib/image/engine";
import { bytesReadout, ResultReadout } from "@/components/shared/result-readout";
import { notifyDoneInTitle, WorkGate } from "@/components/shared/working-state";
import { verbForms } from "@/lib/verb-forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { DropUploader } from "@/components/tool/drop-uploader";
import { ExportButton } from "@/components/tool/export-button";
import { NextSteps } from "@/components/tool/next-steps";
import { ResponsiveAd } from "@/components/ads";
import { ResultSuccess } from "@/components/tool/result-success";
import type { UseImageTool } from "@/hooks/use-image-tool";

export interface ToolWorkspaceProps {
  /** The headless tool state from `useImageTool`. */
  state: UseImageTool;
  /** Tool-specific settings controls (sliders, selects) shown in the ready state. */
  controls?: React.ReactNode;
  /** Label for the primary process button, e.g. "Compress image". */
  processLabel?: string;
  /** Per-tool accent for the primary action and highlights. */
  accent?: AccentKey;
  /** Accept string for the uploader + paste, e.g. "image/*". */
  accept?: string;
  /** Helper text for the uploader (formats). */
  formatsHint?: string;
  /** Renders the tool-specific result stats in the "done" state. */
  resultMeta?: (result: ProcessResult, image: LoadedImage) => React.ReactNode;
}

/** CSS for a subtle transparency checkerboard, used behind PNGs with alpha. */
const CHECKERBOARD: React.CSSProperties = {
  backgroundColor: "var(--muted)",
  backgroundImage:
    "linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.06) 75%), linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.06) 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 10px 10px",
};

function ImagePane({
  src,
  label,
  badge,
  checkered,
}: {
  src: string;
  label: string;
  badge?: React.ReactNode;
  checkered?: boolean;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex items-center justify-between px-0.5 text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {badge}
      </figcaption>
      <div
        style={checkered ? CHECKERBOARD : undefined}
        className={cn(
          "relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-xl border border-border",
          checkered ? "" : "bg-muted/40",
        )}
      >
        {/* Unoptimized: sources are in-browser object URLs, not remote assets. */}
        <Image
          src={src}
          alt={label}
          fill
          unoptimized
          sizes="(min-width: 768px) 40vw, 90vw"
          className="object-contain"
        />
      </div>
    </figure>
  );
}

/**
 * The universal image-tool card. It renders one of five layouts driven by
 * `state.phase`, idle (uploader), ready (preview + controls + process),
 * processing (overlay), done (before/after + download) and error (retry).
 * Tools supply only their `controls`, `resultMeta` and labels; everything
 * else (responsiveness, accessibility and the state machine) is shared.
 */
export function ToolWorkspace({
  state,
  controls,
  processLabel = "Process image",
  accent,
  accept = "image/*",
  formatsHint,
  resultMeta,
}: ToolWorkspaceProps) {
  const { phase, image, result, error } = state;
  const style = accentStyle(accent);

  return (
    <Card className="overflow-hidden rounded-2xl p-4 sm:p-6">
      {phase === "idle" ? (
        <DropUploader
          onFiles={(files) => void state.selectFiles(files)}
          accept={accept}
          hint={formatsHint}
          accent={accent}
        />
      ) : null}

      {phase === "error" ? (
        <ErrorState
          title="We couldn’t process that image"
          description={error ?? "Please try a different file and try again."}
          retry={state.reset}
        />
      ) : null}

      {image && (phase === "ready" || phase === "processing") ? (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="relative">
            <ImagePane
              src={image.url}
              label="Your image"
              badge={
                <span className="tabular-nums">
                  {image.width} × {image.height} · {formatBytes(image.file.size)}
                </span>
              }
            />
            <WorkGate busy={phase === "processing"}>
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 backdrop-blur-sm"
              >
                <Icon
                  name="LoaderCircle"
                  size={28}
                  className={cn("animate-spin", style.text)}
                />
                <span className="text-sm font-medium text-foreground">
                  {state.status ?? verbForms(processLabel).working}
                </span>
              </div>
            </WorkGate>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">{controls}</div>

            <div className="mt-auto flex flex-col gap-2">
              <Button
                size="lg"
                onClick={() => void state.run()}
                disabled={phase === "processing"}
                className={cn(
                  "w-full bg-gradient-to-r text-white shadow-sm hover:opacity-95",
                  style.gradient,
                )}
              >
                {phase === "processing" ? (
                  <>
                    <Icon name="LoaderCircle" size={16} className="animate-spin" />
                    {verbForms(processLabel).working}
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={16} />
                    {processLabel}
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <label className="cursor-pointer">
                    <Icon name="RefreshCw" size={16} />
                    Change
                    <input
                      type="file"
                      accept={accept}
                      className="sr-only"
                      onChange={(event) => {
                        if (event.target.files) {
                          void state.selectFiles(event.target.files);
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={state.reset}
                >
                  <Icon name="X" size={16} />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "done" && image && result ? (
        <div className="animate-rise flex flex-col gap-6">
          <ResultSuccess title={verbForms(processLabel).done} />

          {/* The signature result readout: the measured delta, in mono, with
              --signal on the result. The payoff of the whole interaction. */}
          <ResultReadout {...bytesReadout(image.file.size, result.size)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <ImagePane
              src={image.url}
              label="Original"
              badge={
                <span className="tabular-nums">{formatBytes(image.file.size)}</span>
              }
            />
            <ImagePane
              src={result.url}
              label="Result"
              checkered={result.format === "image/png"}
              badge={
                <span
                  className={cn(
                    "inline-flex items-center gap-1 tabular-nums",
                    style.text,
                  )}
                >
                  <Icon name="Check" size={13} />
                  {formatBytes(result.size)}
                </span>
              }
            />
          </div>

          {resultMeta ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              {resultMeta(result, image)}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <ExportButton
              size="lg"
              format={result.format}
              meta={formatBytes(result.size)}
              onClick={state.download}
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
