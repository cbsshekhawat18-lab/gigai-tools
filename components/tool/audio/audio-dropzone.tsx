"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { FileDropZone } from "@/components/tool/dev";
import { StatBadge } from "@/components/tool/dev/stat-badge";

import {
  decodeAudio,
  describeAudio,
  formatBytes,
  formatDuration,
  type AudioMeta,
} from "./audio-utils";

/** Props for {@link AudioDropzone}. */
export interface AudioDropzoneProps {
  /** Called with the accepted audio File once it has been decoded + probed. */
  onFile: (file: File, meta: AudioMeta) => void;
  /** `accept` for the picker. Default covers browser-decodable formats. */
  accept?: string;
  /** Soft size ceiling in MB; larger files warn (never blocked). Default 200. */
  softMaxMB?: number;
  disabled?: boolean;
  /** The currently loaded file, if any, renders the info card instead. */
  file?: File | null;
  /** Metadata for `file` (from a prior probe), shown in the info card. */
  meta?: AudioMeta | null;
  /** Clear handler; shows a "Change audio" affordance on the info card. */
  onClear?: () => void;
  className?: string;
}

const DEFAULT_ACCEPT =
  "audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.weba,.webm";

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|webm|aiff?|caf)$/i;

/**
 * Drag / click / paste a single audio file. On drop it decodes with the Web
 * Audio API (instant, no ffmpeg) and surfaces name, size, duration, and the
 * channel/sample-rate layout. Once loaded it flips to a compact info card with a
 * "Change audio" button. Files the browser can't natively decode surface an
 * honest error pointing at the conversion path; oversized files warn but are
 * never hard-blocked.
 */
export function AudioDropzone({
  onFile,
  accept = DEFAULT_ACCEPT,
  softMaxMB = 200,
  disabled = false,
  file = null,
  meta = null,
  onClear,
  className,
}: AudioDropzoneProps) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFiles = React.useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setError(null);
      const looksLikeAudio =
        next.type.startsWith("audio/") || AUDIO_EXT.test(next.name);
      if (!looksLikeAudio) {
        setError("That doesn't look like an audio file.");
        return;
      }
      setBusy(true);
      try {
        const buffer = await decodeAudio(next);
        onFile(next, {
          duration: buffer.duration,
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't read that audio.",
        );
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
              <Icon name="AudioLines" size={20} />
            </span>
            <div className="min-w-0">
              <p
                className="truncate text-sm font-medium text-foreground"
                title={file.name}
              >
                {file.name}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatBadge
                  label="Size"
                  value={formatBytes(file.size)}
                  icon="HardDrive"
                />
                {meta && Number.isFinite(meta.duration) && (
                  <StatBadge
                    label="Length"
                    value={formatDuration(meta.duration)}
                    icon="Clock"
                  />
                )}
                {meta && meta.sampleRate > 0 && (
                  <StatBadge value={describeAudio(meta)} icon="Waves" />
                )}
              </div>
            </div>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <Icon name="RefreshCw" size={13} />
              Change audio
            </button>
          )}
        </div>
        {overCap && (
          <p className="mt-3 flex items-start gap-1.5 text-sm text-warning">
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
        icon="AudioLines"
        className="min-h-[180px]"
        label={busy ? "Reading audio…" : "Drop audio, click to browse, or paste"}
        hint={
          busy
            ? "Decoding duration and channels"
            : "MP3, WAV, OGG, M4A, FLAC: everything stays on your device"
        }
      />
      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
