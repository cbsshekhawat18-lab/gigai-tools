"use client";

/**
 * Audio Splitter: cut one recording into many, entirely in the browser.
 *
 * Drop a file → it decodes natively (no upload, no WASM) and paints a real
 * waveform → choose a split strategy (fixed-length chunks, custom time ranges,
 * or automatically on silence) → run the split and get a numbered list of parts,
 * each with its own mini waveform + player → download any part as a lossless WAV,
 * or grab the whole set as a single ZIP. Everything runs on the user's device;
 * the ZIP builder (jszip) is the only lazy import and loads solely when a ZIP is
 * requested.
 *
 * This tool does not use {@link AudioWorkspace} because it produces MANY outputs
 * rather than one blob. It owns its own file/decode/split/result plumbing while
 * reusing the shared audio dropzone, waveform, player and formatters.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { download, ErrorBanner } from "@/components/tool/dev";
import {
  AudioDropzone,
  Waveform,
  AudioPlayer,
  decodeAudio,
  describeAudio,
  formatDuration,
  formatBytes,
  type AudioMeta,
} from "@/components/tool/audio";
import { split } from "@/lib/audio-tools/process";
import { encodeWav } from "@/lib/audio-tools/encode";

type SplitMode = "chunks" | "ranges" | "silence";

/** One typed time range in the "ranges" mode. */
interface RangeRow {
  id: number;
  /** Raw text the user typed for the start (seconds). */
  start: string;
  /** Raw text the user typed for the end (seconds). */
  end: string;
}

/** A finished part: its decoded buffer, its WAV blob, and derived metadata. */
interface SplitPart {
  buffer: AudioBuffer;
  blob: Blob;
  startSec: number;
  endSec: number;
}

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Parse a user-typed seconds field; returns null when blank/invalid. */
function parseSeconds(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  // Support either "83.5" or "1:23.5" (m:ss) style input.
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    let total = 0;
    for (const part of parts) {
      const n = Number(part);
      if (!Number.isFinite(n)) return null;
      total = total * 60 + n;
    }
    return total >= 0 ? total : null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

let rangeIdSeq = 1;

export default function AudioSplitterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<AudioMeta | null>(null);
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  const [decoding, setDecoding] = React.useState(false);

  const [mode, setMode] = React.useState<SplitMode>("chunks");

  // Fixed-length mode: chunk length in seconds.
  const [chunkSec, setChunkSec] = React.useState<string>("30");

  // Ranges mode: rows of typed start/end.
  const [ranges, setRanges] = React.useState<RangeRow[]>([
    { id: 0, start: "0", end: "" },
  ]);

  // Silence mode: threshold (dB, negative) + minimum gap (seconds).
  const [thresholdDb, setThresholdDb] = React.useState<number>(-50);
  const [minSilenceSec, setMinSilenceSec] = React.useState<number>(0.5);

  const [parts, setParts] = React.useState<SplitPart[]>([]);
  const [splitting, setSplitting] = React.useState(false);
  const [runError, setRunError] = React.useState<string | null>(null);
  const [zipping, setZipping] = React.useState(false);

  const duration =
    meta && Number.isFinite(meta.duration) && meta.duration > 0
      ? meta.duration
      : 0;

  const baseName = React.useMemo(
    () => file?.name.replace(/\.[^.]+$/, "") || "audio",
    [file],
  );

  // Decode the dropped file for the full-track waveform.
  const onFile = React.useCallback((f: File, m: AudioMeta) => {
    setFile(f);
    setMeta(m);
    setBuffer(null);
    setDecodeError(null);
    setParts([]);
    setRunError(null);
    setDecoding(true);
    decodeAudio(f)
      .then((b) => {
        setBuffer(b);
      })
      .catch((err) => {
        setDecodeError(
          err instanceof Error
            ? err.message
            : "Couldn't decode that audio in the browser.",
        );
      })
      .finally(() => setDecoding(false));
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setBuffer(null);
    setDecodeError(null);
    setParts([]);
    setRunError(null);
  }, []);

  const addRange = React.useCallback(() => {
    setRanges((prev) => [
      ...prev,
      { id: rangeIdSeq++, start: "", end: "" },
    ]);
  }, []);

  const removeRange = React.useCallback((id: number) => {
    setRanges((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  }, []);

  const updateRange = React.useCallback(
    (id: number, field: "start" | "end", value: string) => {
      setRanges((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      );
    },
    [],
  );

  /** Build the split-op options for the active mode, or throw a friendly error. */
  const buildOpts = React.useCallback((): Parameters<typeof split>[1] => {
    if (mode === "chunks") {
      const secs = Number(chunkSec);
      if (!Number.isFinite(secs) || secs <= 0) {
        throw new Error(
          "Enter a chunk length greater than zero (in seconds) to split into equal pieces.",
        );
      }
      if (duration > 0 && secs >= duration) {
        throw new Error(
          `The chunk length (${formatDuration(secs)}) is at least as long as the track (${formatDuration(duration)}), so there's nothing to split. Use a shorter length.`,
        );
      }
      return { everySec: secs };
    }

    if (mode === "ranges") {
      const parsed: Array<[number, number]> = [];
      for (const row of ranges) {
        const s = parseSeconds(row.start);
        const e = parseSeconds(row.end);
        if (s === null && e === null) continue; // skip fully-blank rows
        if (s === null || e === null) {
          throw new Error(
            "Every range needs both a start and an end time (in seconds or m:ss). Fill in or remove the incomplete row.",
          );
        }
        const start = clamp(s, 0, duration || s);
        const end = clamp(e, 0, duration || e);
        if (!(end > start)) {
          throw new Error(
            `Range ${formatDuration(start)}–${formatDuration(end)} is empty: the end must be after the start.`,
          );
        }
        parsed.push([start, end]);
      }
      if (parsed.length === 0) {
        throw new Error(
          "Add at least one time range with a start before its end to split the file.",
        );
      }
      return { ranges: parsed };
    }

    // silence
    return {
      onSilence: {
        thresholdDb: clamp(thresholdDb, -90, -10),
        minSilenceSec: clamp(minSilenceSec, 0.05, 10),
      },
    };
  }, [mode, chunkSec, ranges, thresholdDb, minSilenceSec, duration]);

  const runSplit = React.useCallback(() => {
    if (!buffer) return;
    setRunError(null);
    setSplitting(true);
    // Defer so the button shows its busy state before the (sync) split runs.
    requestAnimationFrame(() => {
      try {
        const opts = buildOpts();
        const pieces = split(buffer, opts);
        // Filter out any zero-length slices and track running offsets so each
        // part carries an honest start/end for the readout.
        const built: SplitPart[] = [];
        let cursor = 0;
        pieces.forEach((clip, i) => {
          if (clip.duration <= 0) return;
          // For chunks/silence the parts are sequential; for ranges we still
          // show their own duration and cumulative position as a fallback.
          const startSec =
            "ranges" in opts && opts.ranges?.[i] ? opts.ranges[i]![0] : cursor;
          const endSec =
            "ranges" in opts && opts.ranges?.[i]
              ? opts.ranges[i]![1]
              : cursor + clip.duration;
          built.push({
            buffer: clip,
            blob: encodeWav(clip),
            startSec,
            endSec,
          });
          cursor += clip.duration;
        });

        if (built.length === 0) {
          setRunError(
            mode === "silence"
              ? "No silence gaps were detected with these settings, so the file wasn't split. Raise the threshold or lower the minimum-gap and try again."
              : "That configuration produced no parts. Check your settings and try again.",
          );
          setParts([]);
          return;
        }
        setParts(built);
      } catch (err) {
        setRunError(
          err instanceof Error
            ? err.message
            : "Couldn't split the audio in your browser.",
        );
        setParts([]);
      } finally {
        setSplitting(false);
      }
    });
  }, [buffer, buildOpts, mode]);

  const downloadOne = React.useCallback(
    (part: SplitPart, index: number) => {
      const num = String(index + 1).padStart(2, "0");
      download(`${baseName}-part-${num}.wav`, part.blob, "audio/wav");
    },
    [baseName],
  );

  const downloadZip = React.useCallback(async () => {
    if (parts.length === 0) return;
    setZipping(true);
    setRunError(null);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      parts.forEach((part, i) => {
        const num = String(i + 1).padStart(2, "0");
        zip.file(`${baseName}-part-${num}.wav`, part.blob);
      });
      const archive = await zip.generateAsync({ type: "blob" });
      download(`${baseName}-parts.zip`, archive, "application/zip");
    } catch {
      setRunError(
        "Couldn't build the ZIP in your browser. Try downloading the parts individually, or split into fewer pieces.",
      );
    } finally {
      setZipping(false);
    }
  }, [parts, baseName]);

  const totalPartBytes = React.useMemo(
    () => parts.reduce((sum, p) => sum + p.blob.size, 0),
    [parts],
  );

  const modeOptions = [
    {
      key: "chunks" as const,
      label: "Equal chunks",
      icon: "Timer" as const,
      hint: "Fixed length",
    },
    {
      key: "ranges" as const,
      label: "Time ranges",
      icon: "ListOrdered" as const,
      hint: "You choose",
    },
    {
      key: "silence" as const,
      label: "On silence",
      icon: "AudioLines" as const,
      hint: "Automatic",
    },
  ];

  const canRun = !!buffer && !decoding && !splitting;

  return (
    <div className="flex flex-col gap-5">
      <AudioDropzone
        onFile={onFile}
        file={file}
        meta={meta}
        onClear={reset}
        softMaxMB={200}
      />

      {decodeError && <ErrorBanner error={decodeError} />}

      {file && !decodeError && (
        <div className="flex flex-col gap-5">
          {/* Full-track waveform */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon
                  name="SplitSquareHorizontal"
                  size={15}
                  className="text-primary"
                />
                <span>Source track</span>
              </div>
              {meta && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {describeAudio(meta)} · {formatDuration(meta.duration)}
                  {" · "}
                  {formatBytes(file.size)}
                </span>
              )}
            </div>

            {buffer ? (
              <Waveform
                buffer={buffer}
                height={110}
                aria-label="Source waveform"
              />
            ) : (
              <div
                className="flex h-[110px] items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground"
                aria-live="polite"
              >
                <Icon
                  name="LoaderCircle"
                  size={16}
                  className="mr-2 animate-spin"
                />
                Decoding waveform…
              </div>
            )}
          </div>

          {/* Mode selector */}
          <fieldset className="flex flex-col gap-3" disabled={splitting}>
            <legend className="mb-1 text-sm font-medium text-foreground">
              How should we split it?
            </legend>
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="Split mode"
            >
              {modeOptions.map((opt) => {
                const active = mode === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMode(opt.key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon
                      name={opt.icon}
                      size={17}
                      className={active ? "text-primary" : ""}
                    />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Per-mode controls */}
            {mode === "chunks" && (
              <label className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Chunk length</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={1}
                  value={chunkSec}
                  onChange={(e) => setChunkSec(e.target.value)}
                  className="w-28 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Chunk length in seconds"
                />
                <span>seconds each</span>
                {duration > 0 && Number(chunkSec) > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {Math.ceil(duration / Number(chunkSec))} parts
                  </span>
                )}
              </label>
            )}

            {mode === "ranges" && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Type each clip&apos;s start and end (in seconds, or{" "}
                  <span className="font-medium">m:ss</span> like{" "}
                  <span className="tabular-nums">1:23</span>). Blank rows are
                  ignored.
                </p>
                <ul className="flex flex-col gap-2">
                  {ranges.map((row, i) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="w-6 text-xs font-medium text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.start}
                        placeholder="start"
                        onChange={(e) =>
                          updateRange(row.id, "start", e.target.value)
                        }
                        className="w-24 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Range ${i + 1} start`}
                      />
                      <span className="text-muted-foreground">→</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.end}
                        placeholder="end"
                        onChange={(e) =>
                          updateRange(row.id, "end", e.target.value)
                        }
                        className="w-24 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Range ${i + 1} end`}
                      />
                      <button
                        type="button"
                        onClick={() => removeRange(row.id)}
                        disabled={ranges.length <= 1}
                        className="inline-flex items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Remove range ${i + 1}`}
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={addRange}
                  className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="Plus" size={14} />
                  Add range
                </button>
              </div>
            )}

            {mode === "silence" && (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center justify-between">
                    <span>Silence threshold</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {thresholdDb} dB
                    </span>
                  </span>
                  <input
                    type="range"
                    min={-90}
                    max={-10}
                    step={1}
                    value={thresholdDb}
                    onChange={(e) => setThresholdDb(Number(e.target.value))}
                    className="accent-primary"
                    aria-label="Silence threshold in decibels"
                  />
                  <span className="text-xs text-muted-foreground">
                    Anything quieter than this counts as silence. Raise it
                    (toward 0) for noisy sources; lower it for clean, quiet ones.
                  </span>
                </label>
                <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center justify-between">
                    <span>Minimum gap length</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {minSilenceSec.toFixed(2)} s
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0.1}
                    max={3}
                    step={0.05}
                    value={minSilenceSec}
                    onChange={(e) => setMinSilenceSec(Number(e.target.value))}
                    className="accent-primary"
                    aria-label="Minimum silence gap in seconds"
                  />
                  <span className="text-xs text-muted-foreground">
                    Only gaps at least this long trigger a split, so short
                    pauses inside a sentence aren&apos;t mistaken for section breaks.
                  </span>
                </label>
              </div>
            )}
          </fieldset>

          {/* Run */}
          <button
            type="button"
            onClick={runSplit}
            disabled={!canRun}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Icon
              name={splitting ? "LoaderCircle" : "SplitSquareHorizontal"}
              size={16}
              className={splitting ? "animate-spin" : ""}
            />
            {splitting ? "Splitting…" : "Split audio"}
          </button>

          {runError && <ErrorBanner error={runError} />}
        </div>
      )}

      {/* Results */}
      {parts.length > 0 && (
        <section
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="CircleCheck" size={16} className="text-primary" />
              {parts.length} {parts.length === 1 ? "part" : "parts"}
              <span className="font-normal text-muted-foreground">
                · {formatBytes(totalPartBytes)} total
              </span>
            </h2>
            <button
              type="button"
              onClick={downloadZip}
              disabled={zipping}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                name={zipping ? "LoaderCircle" : "Archive"}
                size={14}
                className={zipping ? "animate-spin" : ""}
              />
              {zipping ? "Zipping…" : "Download all (ZIP)"}
            </button>
          </div>

          <ul className="flex flex-col gap-3">
            {parts.map((part, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 rounded-md border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                      {i + 1}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatDuration(part.startSec)} –{" "}
                      {formatDuration(part.endSec)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatDuration(part.buffer.duration)} ·{" "}
                      {formatBytes(part.blob.size)})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadOne(part, i)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon name="Download" size={14} />
                    WAV
                  </button>
                </div>
                <AudioPlayer
                  blob={part.blob}
                  buffer={part.buffer}
                  waveHeight={56}
                />
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            Every part is a lossless WAV cut on exact frame boundaries. Preview
            any clip above, download the ones you want, or grab them all as a
            ZIP, all built in your browser, nothing uploaded.
          </p>
        </section>
      )}
    </div>
  );
}
