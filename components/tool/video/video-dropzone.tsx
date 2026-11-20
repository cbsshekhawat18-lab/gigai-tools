"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { FileDropZone } from "@/components/tool/dev";
import { StatBadge } from "@/components/tool/dev/stat-badge";

import {
  formatBytes,
  formatDuration,
  probeVideo,
  type VideoMeta,
} from "./media-utils";

/** Props for {@link VideoDropzone}. */
export interface VideoDropzoneProps {
  /** Called with the accepted video File once it has been probed. */
  onFile: (file: File, meta: VideoMeta) => void;
  /**
   * `accept` for the picker. Default covers the formats browsers can decode.
   */
  accept?: string;
  /** Soft size ceiling in MB; larger files warn (never blocked). Default 500. */
  softMaxMB?: number;
  disabled?: boolean;
  /** The currently loaded file, if any, renders the info card instead. */
  file?: File | null;
  /** Metadata for `file` (from a prior probe), shown in the info card. */
  meta?: VideoMeta | null;
  /** Clear handler; shows a "Change video" affordance on the info card. */
  onClear?: () => void;
  className?: string;
}

const DEFAULT_ACCEPT = "video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v,.gif";

/**
 * Drag / click / paste a single video. On drop it probes duration + dimensions
 * with a native `<video>` (instant, no ffmpeg) and surfaces name, size,
 * duration and resolution. Once a file is loaded it flips to a compact info
 * card with a "Change video" button. Oversized files get an honest warning
 * rather than a hard block.
 */
export function VideoDropzone({
  onFile,
  accept = DEFAULT_ACCEPT,
  softMaxMB = 500,
  disabled = false,
  file = null,
  meta = null,
  onClear,
  className,
}: VideoDropzoneProps) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFiles = React.useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setError(null);
      const looksLikeVideo =
        next.type.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi|m4v|gif)$/i.test(next.name);
      if (!looksLikeVideo) {
        setError("That doesn't look like a video file.");
        return;
      }
      setBusy(true);
      try {
        const probed = await probeVideo(next);
        onFile(next, probed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't read that video.");
      } finally {
        setBusy(false);
      }
    },
    [onFile],
  );

  // Loaded state → info card.
  if (file) {
    const overCap = file.size > softMaxMB * 1024 * 1024;
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-muted/30 p-4",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon name="Film" size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                {file.name}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatBadge label="Size" value={formatBytes(file.size)} icon="HardDrive" />
                {meta && Number.isFinite(meta.duration) && (
                  <StatBadge
                    label="Length"
                    value={formatDuration(meta.duration)}
                    icon="Clock"
                  />
                )}
                {meta && meta.width > 0 && (
                  <StatBadge
                    label="Size"
                    value={`${meta.width}×${meta.height}`}
                    icon="Ratio"
                  />
                )}
              </div>
            </div>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <Icon name="RefreshCw" size={13} />
              Change video
            </button>
          )}
        </div>
        {overCap && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-warning">
            <Icon name="TriangleAlert" size={14} className="mt-px shrink-0" />
            <span>
              This file is larger than ~{softMaxMB} MB. In-browser processing is
              memory-bound. It may run slowly or fail on lower-RAM devices.
            </span>
          </p>
        )}
      </div>
    );
  }

  // Empty state → drop zone.
  return (
    <div className={className}>
      <FileDropZone
        onFiles={handleFiles}
        accept={accept}
        multiple={false}
        disabled={disabled || busy}
        icon="Film"
        className="min-h-[180px]"
        label={busy ? "Reading video…" : "Drop a video, click to browse, or paste"}
        hint={
          busy
            ? "Checking duration and resolution"
            : "MP4, MOV, WebM, MKV, AVI, GIF. Everything stays on your device"
        }
      />
      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs text-destructive"
        >
          <Icon name="CircleAlert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
