"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { download } from "@/components/tool/dev/download-button";
import { ExportButton } from "@/components/tool/export-button";
import { NextSteps } from "@/components/tool/next-steps";
import { notifyDoneInTitle } from "@/components/shared/working-state";
import { ResponsiveAd } from "@/components/ads";
import { StatBadge } from "@/components/tool/dev/stat-badge";
import { rememberFiles } from "@/lib/recent-files";

import { AudioPlayer } from "./audio-player";
import { decodeAudio, formatBytes, formatDelta } from "./audio-utils";

/** Props for {@link AudioResult}. */
export interface AudioResultProps {
  /** The finished output blob. */
  blob: Blob;
  /** Suggested download filename, e.g. "voice.mp3". */
  filename: string;
  /** Original input size in bytes, enables the before/after comparison. */
  originalSize?: number;
  /** Reset handler, clears the result and returns to the input state. */
  onReset?: () => void;
  /** Heading. Default "Ready". */
  title?: string;
  className?: string;
}

/**
 * The finished-output card for an audio tool: previews the result in an
 * {@link AudioPlayer} with a waveform, shows a before → after size comparison
 * with the percentage saved, and offers Download + "Start over". The blob is
 * decoded once (best-effort) to draw the waveform; if it can't be decoded the
 * player still plays via the object URL, just without the envelope.
 */
export function AudioResult({
  blob,
  filename,
  originalSize,
  onReset,
  title = "Ready",
  className,
}: AudioResultProps) {
  React.useEffect(() => {
    notifyDoneInTitle("Ready");
  }, []);

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);

  // The RESULT becomes the session hand-off (lib/recent-files): the next
  // tool in the workflow wants the processed file, not the original.
  React.useEffect(() => {
    rememberFiles([new File([blob], filename, { type: blob.type })]);
  }, [blob, filename]);

  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    decodeAudio(blob)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch(() => {
        /* undecodable output (e.g. exotic codec): player still works */
      });
    return () => {
      cancelled = true;
    };
  }, [blob]);

  const smaller = originalSize != null && blob.size < originalSize;
  const larger = originalSize != null && blob.size > originalSize;

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
           
            format={filename}
            onClick={() =>
              download(filename, blob, blob.type || "application/octet-stream")
            }
          />
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="RotateCcw" size={13} />
              Start over
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <AudioPlayer blob={blob} buffer={buffer} />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <StatBadge
          label="File"
          value={filename}
          icon="FileAudio"
          className="max-w-full truncate"
          title={filename}
        />
        {originalSize != null ? (
          <>
            <StatBadge label="Before" value={formatBytes(originalSize)} />
            <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
            <StatBadge
              label="After"
              value={formatBytes(blob.size)}
              tone={smaller ? "success" : larger ? "warning" : "default"}
            />
            <StatBadge
              value={formatDelta(originalSize, blob.size)}
              icon={smaller ? "TrendingDown" : larger ? "TrendingUp" : "Minus"}
              tone={smaller ? "success" : larger ? "warning" : "default"}
            />
          </>
        ) : (
          <StatBadge label="Output" value={formatBytes(blob.size)} icon="HardDrive" />
        )}
      </div>

      <ResponsiveAd position="TOOL_AFTER_RESULT" className="border-t border-border" />
      <NextSteps className="rounded-none border-x-0 border-b-0" />
    </div>
  );
}
