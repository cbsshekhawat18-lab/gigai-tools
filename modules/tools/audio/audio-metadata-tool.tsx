"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioDropzone,
  AudioPlayer,
  Waveform,
  decodeAudio,
  formatBytes,
  formatDuration,
  type AudioMeta,
} from "@/components/tool/audio";
import { ErrorBanner } from "@/components/tool/dev/error-banner";
import { getAudioMetadata, type AudioMetadata } from "@/lib/audio-tools/metadata";
import { detectFormat } from "@/lib/audio-tools/convert";

/**
 * Audio Metadata Viewer, the read-only companion to the GigAI Audio Toolkit.
 * Drop any browser-decodable clip and it reports the technical shape of the file
 * (exact decoded duration, sample rate, channel layout, size, MIME type,
 * detected format and an HONEST estimated average bitrate) alongside a waveform
 * and a preview player. Nothing is modified, encoded or uploaded. The file is
 * decoded once on-device with the native Web Audio engine and every value can be
 * copied individually or as a full text report.
 *
 * Honest by design: the bitrate is an estimate (bytes ÷ duration), and container
 * text tags (ID3 title/artist/art) are not exposed by decodeAudioData, so they
 * aren't shown.
 */

interface Row {
  key: string;
  label: string;
  icon: string;
  value: string;
  /** Optional secondary line under the value (e.g. byte-precise size). */
  sub?: string;
}

/** Describe the channel layout in words, e.g. 2 → "Stereo (2)". */
function channelLabel(channels: number): string {
  if (channels === 1) return "Mono (1)";
  if (channels === 2) return "Stereo (2)";
  return `${channels} channels`;
}

/** Build the ordered list of metadata rows from a probe + detected format. */
function buildRows(m: AudioMetadata, detected: string | null): Row[] {
  return [
    {
      key: "duration",
      label: "Duration",
      icon: "Timer",
      value: formatDuration(m.duration, true),
      sub: `${m.duration.toFixed(3)} s (decoded)`,
    },
    {
      key: "sampleRate",
      label: "Sample rate",
      icon: "AudioWaveform",
      value: `${(m.sampleRate / 1000).toLocaleString(undefined, {
        maximumFractionDigits: 3,
      })} kHz`,
      sub: `${m.sampleRate.toLocaleString()} Hz`,
    },
    {
      key: "channels",
      label: "Channels",
      icon: "AudioLines",
      value: channelLabel(m.channels),
    },
    {
      key: "bitrate",
      label: "Bitrate (est.)",
      icon: "Gauge",
      value: m.bitrateEstimate > 0 ? `~${m.bitrateEstimate.toLocaleString()} kbps` : "—",
      sub: "size ÷ duration, average, not container-reported",
    },
    {
      key: "size",
      label: "File size",
      icon: "HardDrive",
      value: formatBytes(m.size),
      sub: `${m.size.toLocaleString()} bytes`,
    },
    {
      key: "format",
      label: "Format",
      icon: "FileAudio",
      value: detected ? detected.toUpperCase() : "Unknown",
    },
    {
      key: "type",
      label: "MIME type",
      icon: "FileType",
      value: m.type || "-",
      sub: m.type ? undefined : "the OS attached no MIME type",
    },
  ];
}

/** Serialise the whole report to plain text for the "copy report" action. */
function reportText(name: string, rows: Row[]): string {
  const lines = [`Audio metadata: ${name}`, ""];
  for (const r of rows) {
    lines.push(`${r.label}: ${r.value}${r.sub ? ` (${r.sub})` : ""}`);
  }
  return lines.join("\n");
}

type Phase = "idle" | "loading" | "ready";

export default function AudioMetadataTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<AudioMeta | null>(null);
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [info, setInfo] = React.useState<AudioMetadata | null>(null);
  const [detected, setDetected] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  const rows = React.useMemo(
    () => (info ? buildRows(info, detected) : []),
    [info, detected],
  );

  const handleFile = React.useCallback(async (f: File, m: AudioMeta) => {
    setError(null);
    setCopied(null);
    setFile(f);
    setMeta(m);
    setInfo(null);
    setBuffer(null);
    setDetected(detectFormat(f));
    setPhase("loading");
    try {
      // Probe (exact duration/rate/channels + bitrate estimate) and decode the
      // buffer for the waveform in parallel: both are pure on-device work.
      const [probe, decoded] = await Promise.all([
        getAudioMetadata(f),
        decodeAudio(f).catch(() => null),
      ]);
      setInfo(probe);
      setBuffer(decoded);
      setPhase("ready");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't decode that audio in this browser.",
      );
      setPhase("idle");
    }
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setBuffer(null);
    setInfo(null);
    setDetected(null);
    setError(null);
    setCopied(null);
    setPhase("idle");
  }, []);

  const copy = React.useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1400);
    } catch {
      setError("Couldn't copy to the clipboard, your browser may block it here.");
    }
  }, []);

  const loading = phase === "loading";

  return (
    <div className="flex flex-col gap-4">
      <AudioDropzone
        onFile={handleFile}
        softMaxMB={200}
        disabled={loading}
        file={file}
        meta={meta}
        onClear={loading ? undefined : reset}
      />

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <Icon name="Loader" size={16} className="animate-spin" />
          Decoding on your device…
        </div>
      )}

      {phase === "ready" && info && file && (
        <div className="flex flex-col gap-4">
          {/* Header + copy-full-report */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="Info" size={16} className={style.text} />
              Metadata
            </h2>
            <button
              type="button"
              onClick={() => copy("__report", reportText(info.name, rows))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.ring,
              )}
            >
              <Icon
                name={copied === "__report" ? "Check" : "Copy"}
                size={14}
                className={copied === "__report" ? style.text : undefined}
              />
              {copied === "__report" ? "Copied report" : "Copy report"}
            </button>
          </div>

          {/* Metadata grid */}
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {rows.map((r) => {
              const isCopied = copied === r.key;
              return (
                <div
                  key={r.key}
                  className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <Icon
                      name={r.icon}
                      size={16}
                      className={cn("mt-0.5 shrink-0", style.text)}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{r.label}</dt>
                      <dd className="truncate text-sm font-semibold tabular-nums text-foreground">
                        {r.value}
                      </dd>
                      {r.sub && (
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          {r.sub}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(r.key, r.value)}
                    aria-label={`Copy ${r.label}`}
                    className={cn(
                      "shrink-0 rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                    )}
                  >
                    <Icon
                      name={isCopied ? "Check" : "Copy"}
                      size={14}
                      className={isCopied ? style.text : undefined}
                    />
                  </button>
                </div>
              );
            })}
          </dl>

          {/* Waveform + preview player */}
          {buffer ? (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="AudioLines" size={15} className={style.text} />
                Waveform &amp; preview
              </span>
              <Waveform buffer={buffer} height={80} aria-label="Audio waveform" />
              <AudioPlayer buffer={buffer} blob={file} waveHeight={64} />
            </div>
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                The metadata above was read, but this browser couldn&apos;t decode the
                file for a waveform preview. The numbers are still accurate.
              </span>
            </p>
          )}

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
            <span>
              Read-only and 100% on-device: the file is decoded in your browser to
              measure these properties and is never modified or uploaded. Bitrate is
              an estimate (size ÷ duration), and container tags like ID3 title/artist
              aren&apos;t exposed by the decode API.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
