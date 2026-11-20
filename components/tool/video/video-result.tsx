"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { bytesReadout, ResultReadout } from "@/components/shared/result-readout";
import { notifyDoneInTitle } from "@/components/shared/working-state";
import { download } from "@/components/tool/dev/download-button";
import { ExportButton } from "@/components/tool/export-button";
import { NextSteps } from "@/components/tool/next-steps";
import { ResponsiveAd } from "@/components/ads";
import { rememberFiles } from "@/lib/recent-files";

import { VideoPlayer } from "./video-player";
import { formatBytes } from "./media-utils";

/** Props for {@link VideoResult}. */
export interface VideoResultProps {
  /** The finished output blob. */
  blob: Blob;
  /** Suggested download filename, e.g. "clip.mp4". */
  filename: string;
  /** Original input size in bytes: enables the before/after comparison. */
  originalSize?: number;
  /** Whether the output is an image (e.g. an extracted frame) not a video. */
  kind?: "video" | "image" | "audio";
  /** Reset handler: clears the result and returns to the input state. */
  onReset?: () => void;
  /** Heading. Default "Ready". */
  title?: string;
  className?: string;
}

/**
 * The finished-output card: previews the result (video player, image, or audio
 * element), shows a before → after size comparison with the percentage saved,
 * and offers Download + "Start over". The preview object URL is created from the
 * blob and revoked on unmount / blob change.
 */
export function VideoResult({
  blob,
  filename,
  originalSize,
  kind = "video",
  onReset,
  title = "Ready",
  className,
}: VideoResultProps) {
  const url = React.useMemo(() => URL.createObjectURL(blob), [blob]);
  React.useEffect(() => () => URL.revokeObjectURL(url), [url]);

  // The RESULT becomes the session hand-off (lib/recent-files): the next
  // tool in the workflow wants the processed file, not the original.
  React.useEffect(() => {
    rememberFiles([new File([blob], filename, { type: blob.type })]);
    notifyDoneInTitle("Ready");
  }, [blob, filename]);


  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <Icon name="CircleCheck" size={16} className="gigai-pop text-success" />
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="ml-auto flex items-center gap-2">
          <ExportButton
            size="sm"
            format={filename}
            onClick={() => download(filename, blob, blob.type || "application/octet-stream")}
          />
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="RotateCcw" size={13} />
              Start over
            </button>
          )}
        </div>
      </div>

      <div className="bg-black/40 p-3">
        {kind === "video" && (
          <VideoPlayer src={url} className="mx-auto max-h-[420px] w-full" />
        )}
        {kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Result preview"
            className="mx-auto max-h-[420px] max-w-full rounded"
          />
        )}
        {kind === "audio" && (
          <div className="grid place-items-center py-6">
            <audio src={url} controls className="w-full max-w-md" />
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        {originalSize != null ? (
          <ResultReadout {...bytesReadout(originalSize, blob.size)} className="border-0 p-0" />
        ) : (
          <ResultReadout
            from={filename.split(".").pop()?.toUpperCase() ?? "FILE"}
            fromLabel="format"
            to={formatBytes(blob.size)}
            toLabel="output"
            className="border-0 p-0"
          />
        )}
      </div>

      <ResponsiveAd position="TOOL_AFTER_RESULT" className="border-t border-border" />
      <NextSteps className="rounded-none border-x-0 border-b-0" />
    </div>
  );
}
