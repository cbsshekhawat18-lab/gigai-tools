"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoDropzone } from "@/components/tool/video/video-dropzone";
import { formatBytes, formatDuration, type VideoMeta } from "@/components/tool/video/media-utils";
import { getMetadata, type VideoMetadata } from "@/lib/video-tools/probe";

/**
 * Video Metadata Viewer. Drop a clip and read its facts instantly. The basics
 * (duration, resolution, aspect ratio, size, MIME type, best-effort audio) come
 * straight from a native `<video>` probe via {@link getMetadata}. No FFmpeg,
 * effectively instant. Codec / bitrate / fps aren't exposed by the browser's
 * media API, so they live behind an explicit "Deep probe" button that loads the
 * ~31 MB WASM core once (`getMetadata(file, { deep: true })`). Honest by design:
 * we never claim the browser can read what it can't, and nothing is uploaded.
 */

/** A tri-state audio-track label from the best-effort browser hints. */
function audioLabel(hasAudio: boolean | undefined): string {
  if (hasAudio === true) return "Present";
  if (hasAudio === false) return "None";
  return "Unknown";
}

/** Human bitrate, e.g. 2_500_000 → "2.5 Mbps". */
function formatBitrate(bitsPerSec: number | undefined): string | null {
  if (!bitsPerSec || !Number.isFinite(bitsPerSec) || bitsPerSec <= 0) return null;
  if (bitsPerSec >= 1_000_000) return `${(bitsPerSec / 1_000_000).toFixed(1)} Mbps`;
  return `${Math.round(bitsPerSec / 1000)} kbps`;
}

/** Orientation word from the aspect ratio, for a quick human read. */
function orientationOf(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return "—";
  if (Math.abs(ratio - 1) < 0.02) return "Square";
  return ratio > 1 ? "Landscape" : "Portrait";
}

/** One labelled fact in the report grid. */
interface Field {
  key: string;
  label: string;
  value: string;
  icon: string;
  /** Only present when the deep probe has been run. */
  deep?: boolean;
}

/** Build the display fields from a probe result. */
function buildFields(meta: VideoMetadata, deepDone: boolean): Field[] {
  const fields: Field[] = [
    {
      key: "duration",
      label: "Duration",
      value: meta.durationSec > 0 ? formatDuration(meta.durationSec, true) : "—",
      icon: "Clock",
    },
    {
      key: "resolution",
      label: "Resolution",
      value: meta.width > 0 && meta.height > 0 ? `${meta.width} × ${meta.height}` : "—",
      icon: "Maximize",
    },
    {
      key: "aspect",
      label: "Aspect ratio",
      value:
        meta.aspectLabel && meta.aspectLabel !== "-"
          ? `${meta.aspectLabel} · ${orientationOf(meta.aspectRatio)}`
          : "—",
      icon: "Ratio",
    },
    {
      key: "size",
      label: "File size",
      value: formatBytes(meta.sizeBytes),
      icon: "HardDrive",
    },
    {
      key: "type",
      label: "Container / MIME",
      value: meta.mimeType || "Unknown",
      icon: "FileVideo",
    },
    {
      key: "audio",
      label: "Audio track",
      value: audioLabel(meta.hasAudio),
      icon: "AudioLines",
    },
  ];

  if (deepDone) {
    const bitrate = formatBitrate(meta.bitrate);
    fields.push(
      {
        key: "videoCodec",
        label: "Video codec",
        value: meta.videoCodec ?? "-",
        icon: "Film",
        deep: true,
      },
      {
        key: "audioCodec",
        label: "Audio codec",
        value: meta.audioCodec ?? "-",
        icon: "Music",
        deep: true,
      },
      {
        key: "bitrate",
        label: "Bitrate",
        value: bitrate ?? "-",
        icon: "Activity",
        deep: true,
      },
      {
        key: "fps",
        label: "Frame rate",
        value: meta.fps ? `${meta.fps} fps` : "—",
        icon: "Gauge",
        deep: true,
      },
    );
  }

  return fields;
}

/** A plain-text report for the copy button. */
function toTextReport(fileName: string, fields: Field[]): string {
  const lines = fields.map((f) => `${f.label}: ${f.value}`);
  return [`# ${fileName}`, ...lines].join("\n");
}

/** A JSON report for the copy button. */
function toJsonReport(fileName: string, meta: VideoMetadata, deepDone: boolean): string {
  const payload: Record<string, unknown> = {
    file: fileName,
    durationSeconds: meta.durationSec || null,
    width: meta.width || null,
    height: meta.height || null,
    aspectRatio: meta.aspectLabel && meta.aspectLabel !== "-" ? meta.aspectLabel : null,
    sizeBytes: meta.sizeBytes,
    mimeType: meta.mimeType || null,
    hasAudio: meta.hasAudio ?? null,
  };
  if (deepDone) {
    payload.videoCodec = meta.videoCodec ?? null;
    payload.audioCodec = meta.audioCodec ?? null;
    payload.bitrateBitsPerSecond = meta.bitrate ?? null;
    payload.fps = meta.fps ?? null;
  }
  return JSON.stringify(payload, null, 2);
}

type CopyMode = "text" | "json";

export default function VideoMetadataTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<VideoMetadata | null>(null);
  const [probing, setProbing] = React.useState(false);
  const [deepDone, setDeepDone] = React.useState(false);
  const [deepLoading, setDeepLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<CopyMode | null>(null);

  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setDeepDone(false);
    setDeepLoading(false);
    setError(null);
    setCopied(null);
  }, []);

  const onFile = React.useCallback(async (f: File, _m: VideoMeta) => {
    void _m;
    setFile(f);
    setMeta(null);
    setDeepDone(false);
    setError(null);
    setCopied(null);
    setProbing(true);
    try {
      // Instant, FFmpeg-free basics from a native <video> element.
      const basic = await getMetadata(f);
      setMeta(basic);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not read this video's metadata. The format may be unsupported by your browser.",
      );
    } finally {
      setProbing(false);
    }
  }, []);

  const runDeepProbe = React.useCallback(async () => {
    if (!file || deepLoading) return;
    setDeepLoading(true);
    setError(null);
    try {
      // Opt-in only: this loads the ~31 MB FFmpeg (WebAssembly) core once.
      const deep = await getMetadata(file, { deep: true });
      setMeta(deep);
      setDeepDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The deep probe couldn't read codec details from this file.",
      );
    } finally {
      setDeepLoading(false);
    }
  }, [file, deepLoading]);

  const fields = React.useMemo(
    () => (meta ? buildFields(meta, deepDone) : []),
    [meta, deepDone],
  );

  const handleCopy = React.useCallback(
    async (mode: CopyMode) => {
      if (!meta || !file) return;
      const text =
        mode === "text"
          ? toTextReport(file.name, buildFields(meta, deepDone))
          : toJsonReport(file.name, meta, deepDone);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(mode);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(null), 1800);
      } catch {
        setError("Couldn't copy to the clipboard: your browser may have blocked it.");
      }
    },
    [meta, file, deepDone],
  );

  return (
    <div className="flex flex-col gap-5">
      <VideoDropzone
        onFile={onFile}
        file={file}
        onClear={reset}
        softMaxMB={2000}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"
        >
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && probing && (
        <div
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <Icon name="LoaderCircle" size={16} className="animate-spin" />
          Reading metadata…
        </div>
      )}

      {meta && !probing && (
        <section
          aria-label="Video metadata report"
          className="flex flex-col gap-4"
        >
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <div
                key={f.key}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border p-3",
                  f.deep ? cn(style.border, style.soft) : "border-border bg-muted/30",
                )}
              >
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon
                    name={f.icon}
                    size={13}
                    className={f.deep ? style.text : undefined}
                    aria-hidden
                  />
                  {f.label}
                </dt>
                <dd className="break-words text-sm font-semibold tabular-nums text-foreground">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Deep probe / actions */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
            {!deepDone && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                  <span>
                    Codec, bitrate and frame rate aren&apos;t exposed by the browser. Run the
                    deep probe to read them; it loads the FFmpeg engine (~31 MB) once,
                    entirely on your device.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={runDeepProbe}
                  disabled={deepLoading}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold text-white outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-70",
                    style.solid,
                    style.ring,
                  )}
                >
                  {deepLoading ? (
                    <>
                      <Icon name="LoaderCircle" size={15} className="animate-spin" />
                      Loading engine…
                    </>
                  ) : (
                    <>
                      <Icon name="Search" size={15} />
                      Deep probe
                    </>
                  )}
                </button>
              </div>
            )}

            {deepDone && (
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon name="CircleCheck" size={14} className={style.text} />
                Deep probe complete, codec, bitrate and frame rate added above.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopy("text")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground outline-none transition-colors",
                  "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                )}
              >
                <Icon name={copied === "text" ? "Check" : "Copy"} size={13} />
                {copied === "text" ? "Copied" : "Copy report"}
              </button>
              <button
                type="button"
                onClick={() => handleCopy("json")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground outline-none transition-colors",
                  "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                )}
              >
                <Icon name={copied === "json" ? "Check" : "Braces"} size={13} />
                {copied === "json" ? "Copied" : "Copy JSON"}
              </button>
              <button
                type="button"
                onClick={reset}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground outline-none transition-colors",
                  "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                )}
              >
                <Icon name="RotateCcw" size={13} />
                Inspect another
              </button>
            </div>
          </div>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
            <span>
              Everything is read on your device: the basics via a native video element,
              the deep probe via a self-hosted FFmpeg (WebAssembly) engine. Nothing is
              uploaded, stored or logged.
            </span>
          </p>
        </section>
      )}
    </div>
  );
}

// Kept explicit so a refactor of the dropzone's onFile signature fails loudly here.
export type { VideoMeta };
