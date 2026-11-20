"use client";

/**
 * Audio Waveform Generator: turn a sound file into a shareable soundwave image.
 *
 * Drop a clip → it decodes natively (no upload, no WASM) → the tool reduces it
 * to a per-bucket peak envelope with {@link computePeaks} → a live <canvas>
 * preview paints the waveform to the user's spec (color, background, style, gap,
 * bar count, size, orientation) → export a pixel-exact PNG or an infinitely
 * scalable SVG. Everything runs on-device; the original audio is only ever read,
 * never played or altered, and nothing leaves the tab.
 *
 * This is an image-output tool, so it does NOT use the audio-blob AudioWorkspace
 * scaffold. It composes the standalone <AudioDropzone> primitive with a custom
 * canvas renderer and PNG/SVG export. The same peak math powers both the raster
 * (canvas.toBlob) and vector (hand-built SVG string) exports so they match.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  AudioDropzone,
  decodeAudio,
  describeAudio,
  formatDuration,
  formatBytes,
  type AudioMeta,
} from "@/components/tool/audio";
import { computePeaks, peaksToBars } from "@/lib/audio-tools/waveform";

/** Bar rendering styles offered to the user. */
type WaveStyle = "bars" | "filled";
/** Canvas orientation presets. */
type Orientation = "landscape" | "portrait" | "square";

/** All the knobs that shape the rendered image. */
interface WaveOptions {
  color: string;
  background: string;
  transparent: boolean;
  style: WaveStyle;
  barCount: number;
  gap: number; // 0..0.9 fraction of each bar slot left empty
  width: number;
  height: number;
}

const COLOR_SWATCHES = [
  "#f43f5e", // rose (brand accent)
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#ffffff", // white
  "#111827", // near-black
] as const;

const BG_SWATCHES = [
  "#0b0b0f", // near-black
  "#ffffff", // white
  "#111827", // slate
  "#f43f5e", // rose
] as const;

const ORIENTATIONS: Record<Orientation, { width: number; height: number; label: string; icon: string }> = {
  landscape: { width: 1600, height: 500, label: "Landscape", icon: "RectangleHorizontal" },
  square: { width: 1000, height: 1000, label: "Square", icon: "Square" },
  portrait: { width: 700, height: 1200, label: "Portrait", icon: "RectangleVertical" },
};

const DEFAULT_OPTIONS: WaveOptions = {
  color: "#f43f5e",
  background: "#0b0b0f",
  transparent: true,
  style: "bars",
  barCount: 160,
  gap: 0.35,
  width: ORIENTATIONS.landscape.width,
  height: ORIENTATIONS.landscape.height,
};

/** Validate a #rgb / #rrggbb hex string. */
function isHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Paint the waveform onto a 2D canvas context at (width × height) using the
 * given peaks and options. Shared by the live preview and the PNG export so both
 * are pixel-identical. `transparent` leaves the canvas backdrop untouched
 * (the caller must have cleared it) so PNG export keeps a see-through alpha.
 */
function paintWaveform(
  ctx: CanvasRenderingContext2D,
  peaks: number[],
  opts: WaveOptions,
): void {
  const { width, height } = opts;
  ctx.clearRect(0, 0, width, height);
  if (!opts.transparent) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, width, height);
  }
  if (peaks.length === 0) return;

  ctx.fillStyle = opts.color;

  if (opts.style === "filled") {
    // Continuous mirrored envelope as a single filled path.
    const mid = height / 2;
    const slot = width / peaks.length;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    for (let i = 0; i < peaks.length; i++) {
      const x = i * slot + slot / 2;
      const h = Math.max(1, (peaks[i] ?? 0) * height);
      ctx.lineTo(x, mid - h / 2);
    }
    for (let i = peaks.length - 1; i >= 0; i--) {
      const x = i * slot + slot / 2;
      const h = Math.max(1, (peaks[i] ?? 0) * height);
      ctx.lineTo(x, mid + h / 2);
    }
    ctx.closePath();
    ctx.fill();
    return;
  }

  // Mirrored bars.
  const bars = peaksToBars(peaks, width, height, opts.gap);
  const radius = Math.min(4, Math.max(0, bars[0] ? bars[0].width / 2 : 0));
  for (const bar of bars) {
    if (radius > 0 && typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(bar.x, bar.top, bar.width, bar.height, radius);
      ctx.fill();
    } else {
      ctx.fillRect(bar.x, bar.top, bar.width, bar.height);
    }
  }
}

/**
 * Build a self-contained SVG string for the same waveform. Mirrors
 * {@link paintWaveform} so the vector export matches the raster preview.
 */
function buildSvg(peaks: number[], opts: WaveOptions): string {
  const { width, height } = opts;
  const bg = opts.transparent
    ? ""
    : `<rect width="${width}" height="${height}" fill="${opts.background}"/>`;

  let shape = "";
  if (opts.style === "filled") {
    const mid = height / 2;
    const slot = width / Math.max(1, peaks.length);
    const pts: string[] = [`M0,${mid.toFixed(2)}`];
    for (let i = 0; i < peaks.length; i++) {
      const x = i * slot + slot / 2;
      const h = Math.max(1, (peaks[i] ?? 0) * height);
      pts.push(`L${x.toFixed(2)},${(mid - h / 2).toFixed(2)}`);
    }
    for (let i = peaks.length - 1; i >= 0; i--) {
      const x = i * slot + slot / 2;
      const h = Math.max(1, (peaks[i] ?? 0) * height);
      pts.push(`L${x.toFixed(2)},${(mid + h / 2).toFixed(2)}`);
    }
    pts.push("Z");
    shape = `<path d="${pts.join("")}" fill="${opts.color}"/>`;
  } else {
    const bars = peaksToBars(peaks, width, height, opts.gap);
    const radius = Math.min(4, bars[0] ? bars[0].width / 2 : 0).toFixed(2);
    shape = bars
      .map(
        (b) =>
          `<rect x="${b.x.toFixed(2)}" y="${b.top.toFixed(2)}" width="${b.width.toFixed(
            2,
          )}" height="${b.height.toFixed(2)}" rx="${radius}" fill="${opts.color}"/>`,
      )
      .join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bg}${shape}</svg>`;
}

/** Trigger a browser download of a blob under `filename`, then revoke the URL. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has been dispatched.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Live canvas preview of the waveform. Renders at the real output resolution but
 * is CSS-scaled to fit the container, so what you see is exactly what exports.
 */
function WavePreview({
  peaks,
  options,
  canvasRef,
}: {
  peaks: number[];
  options: WaveOptions;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    paintWaveform(ctx, peaks, options);
  }, [peaks, options, canvasRef]);

  const checkerboard = options.transparent;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-border p-3",
        checkerboard
          ? "bg-[repeating-conic-gradient(theme(colors.muted.DEFAULT)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]"
          : "bg-muted/30",
      )}
    >
      <canvas
        ref={canvasRef}
        className="h-auto max-h-[360px] w-auto max-w-full rounded"
        style={{ aspectRatio: `${options.width} / ${options.height}` }}
        aria-label="Waveform preview"
        role="img"
      />
    </div>
  );
}

/** A labelled color control: swatch row + live hex input. */
function ColorField({
  label,
  value,
  swatches,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  swatches: readonly string[];
  onChange: (hex: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {swatches.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s)}
            aria-label={`Use ${s}`}
            aria-pressed={value.toLowerCase() === s.toLowerCase()}
            className={cn(
              "h-7 w-7 rounded-full border outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              value.toLowerCase() === s.toLowerCase()
                ? "scale-110 border-foreground ring-2 ring-ring"
                : "border-border hover:scale-105",
            )}
            style={{ backgroundColor: s }}
          />
        ))}
        <label className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs">
          <input
            type="color"
            value={isHex(draft) ? draft : value}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              onChange(e.target.value);
            }}
            aria-label={`${label} picker`}
            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <input
            type="text"
            value={draft}
            disabled={disabled}
            spellCheck={false}
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              if (isHex(next)) onChange(next.trim());
            }}
            aria-label={`${label} hex`}
            className="w-[4.5rem] bg-transparent font-mono text-xs text-foreground outline-none"
            placeholder="#f43f5e"
          />
        </label>
      </div>
    </div>
  );
}

/**
 * The styling + export controls once a file is decoded. Owns all render options
 * and produces the PNG/SVG on demand.
 */
function WaveformStudio({
  file,
  meta,
  buffer,
  accent,
}: {
  file: File;
  meta: AudioMeta;
  buffer: AudioBuffer;
  accent: ReturnType<typeof accentStyle>;
}) {
  const [options, setOptions] = React.useState<WaveOptions>(DEFAULT_OPTIONS);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [orientation, setOrientation] = React.useState<Orientation>("landscape");

  // Peaks depend only on the buffer + bar count: memoise so tweaking color or
  // size doesn't re-scan the whole (potentially large) sample array.
  const peaks = React.useMemo(
    () => computePeaks(buffer, options.barCount),
    [buffer, options.barCount],
  );

  const baseName = React.useMemo(
    () => file.name.replace(/\.[^.]+$/, "") || "audio",
    [file.name],
  );

  const set = React.useCallback(
    <K extends keyof WaveOptions>(key: K, val: WaveOptions[K]) =>
      setOptions((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const applyOrientation = React.useCallback((o: Orientation) => {
    setOrientation(o);
    const preset = ORIENTATIONS[o];
    setOptions((prev) => ({ ...prev, width: preset.width, height: preset.height }));
  }, []);

  const [exporting, setExporting] = React.useState<null | "png" | "svg">(null);

  const exportPng = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setExporting("png");
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${baseName}-waveform.png`);
      setExporting(null);
    }, "image/png");
  }, [baseName]);

  const exportSvg = React.useCallback(() => {
    setExporting("svg");
    const svg = buildSvg(peaks, options);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, `${baseName}-waveform.svg`);
    setExporting(null);
  }, [peaks, options, baseName]);

  return (
    <div className="flex flex-col gap-5">
      {/* Live preview */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="AudioWaveform" size={15} className={accent.text} />
            <span>Live preview. This is exactly what you&apos;ll download</span>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {options.width}×{options.height}px
          </span>
        </div>
        <WavePreview peaks={peaks} options={options} canvasRef={canvasRef} />
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
          <span>{describeAudio(meta)}</span>
          {meta.duration > 0 && <span>Length {formatDuration(meta.duration)}</span>}
          <span>{formatBytes(file.size)}</span>
          <span>{options.barCount} bars</span>
        </p>
      </div>

      {/* Colors */}
      <div className="grid gap-5 sm:grid-cols-2">
        <ColorField
          label="Waveform color"
          value={options.color}
          swatches={COLOR_SWATCHES}
          onChange={(hex) => set("color", hex)}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Background</span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={options.transparent}
                onChange={(e) => set("transparent", e.target.checked)}
                className="h-3.5 w-3.5 accent-current"
              />
              Transparent
            </label>
          </div>
          <ColorField
            label=""
            value={options.background}
            swatches={BG_SWATCHES}
            onChange={(hex) => set("background", hex)}
            disabled={options.transparent}
          />
          {options.transparent && (
            <p className="text-xs text-muted-foreground">
              PNG exports with a genuine see-through backdrop; SVG omits the
              background rectangle.
            </p>
          )}
        </div>
      </div>

      {/* Style + gap */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Style</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Waveform style">
            {(
              [
                { key: "bars", label: "Bars", icon: "AudioWaveform" },
                { key: "filled", label: "Filled", icon: "Shapes" },
              ] as const
            ).map((opt) => {
              const active = options.style === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("style", opt.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? cn("bg-primary/10 text-foreground", accent.border)
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon name={opt.icon} size={15} className={active ? accent.text : ""} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between text-sm font-medium text-foreground">
            Bar gap
            <span className="text-xs font-normal text-muted-foreground tabular-nums">
              {Math.round(options.gap * 100)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={0.8}
            step={0.05}
            value={options.gap}
            disabled={options.style === "filled"}
            onChange={(e) => set("gap", Number(e.target.value))}
            aria-label="Gap between bars"
            className="w-full accent-current disabled:opacity-40"
          />
          {options.style === "filled" && (
            <span className="text-xs text-muted-foreground">
              Gap applies to the Bars style.
            </span>
          )}
        </label>
      </div>

      {/* Resolution (bar count) */}
      <label className="flex flex-col gap-2">
        <span className="flex items-center justify-between text-sm font-medium text-foreground">
          Detail (bars)
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {options.barCount}
          </span>
        </span>
        <input
          type="range"
          min={40}
          max={600}
          step={10}
          value={options.barCount}
          onChange={(e) => set("barCount", Number(e.target.value))}
          aria-label="Number of bars"
          className="w-full accent-current"
        />
        <span className="text-xs text-muted-foreground">
          Fewer bars read chunky and bold; more bars capture fine dynamics.
        </span>
      </label>

      {/* Size / orientation */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Output size</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Orientation">
          {(Object.keys(ORIENTATIONS) as Orientation[]).map((o) => {
            const preset = ORIENTATIONS[o];
            const active = orientation === o;
            return (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => applyOrientation(o)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? cn("bg-primary/10 text-foreground", accent.border)
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon name={preset.icon} size={15} className={active ? accent.text : ""} />
                <span className="font-medium">{preset.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Width</span>
            <input
              type="number"
              min={100}
              max={4000}
              value={options.width}
              onChange={(e) =>
                set("width", Math.max(100, Math.min(4000, Number(e.target.value) || 100)))
              }
              aria-label="Output width in pixels"
              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Height</span>
            <input
              type="number"
              min={100}
              max={4000}
              value={options.height}
              onChange={(e) =>
                set("height", Math.max(100, Math.min(4000, Number(e.target.value) || 100)))
              }
              aria-label="Output height in pixels"
              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>

      {/* Export */}
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={exportPng}
          disabled={exporting !== null}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
            "bg-primary hover:bg-primary/90",
          )}
        >
          <Icon
            name={exporting === "png" ? "LoaderCircle" : "ImageDown"}
            size={16}
            className={exporting === "png" ? "animate-spin" : ""}
          />
          Download PNG
        </button>
        <button
          type="button"
          onClick={exportSvg}
          disabled={exporting !== null}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            name={exporting === "svg" ? "LoaderCircle" : "Shapes"}
            size={16}
            className={exporting === "svg" ? "animate-spin" : ""}
          />
          Download SVG
        </button>
      </div>
    </div>
  );
}

/**
 * Audio Waveform Generator tool. Composes the standalone {@link AudioDropzone}
 * with a custom canvas renderer + PNG/SVG export. TS-strict clean; dark-mode,
 * responsive and keyboard-accessible; honest that this is an amplitude-envelope
 * renderer (not a spectrogram) that only reads, never plays or alters, the
 * source, entirely in the browser.
 */
export default function AudioWaveformTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = React.useMemo(() => accentStyle(tool.accent), [tool.accent]);

  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<AudioMeta | null>(null);
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  const [decoding, setDecoding] = React.useState(false);

  const onFile = React.useCallback((f: File, m: AudioMeta) => {
    setFile(f);
    setMeta(m);
    setBuffer(null);
    setDecodeError(null);
    setDecoding(true);
    let cancelled = false;
    decodeAudio(f)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch((err) => {
        if (!cancelled) {
          setDecodeError(
            err instanceof Error
              ? err.message
              : "Couldn't decode that audio in the browser. Try converting it to WAV or MP3 first.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setDecoding(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = React.useCallback(() => {
    setFile(null);
    setMeta(null);
    setBuffer(null);
    setDecodeError(null);
    setDecoding(false);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AudioDropzone
        onFile={onFile}
        file={file}
        meta={meta}
        onClear={reset}
        softMaxMB={200}
      />

      {file && decodeError && (
        <p
          role="alert"
          className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="shrink-0" />
          {decodeError}
        </p>
      )}

      {file && !decodeError && decoding && (
        <div
          className="flex h-[160px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <Icon name="LoaderCircle" size={18} className="mr-2 animate-spin" />
          Decoding audio…
        </div>
      )}

      {file && meta && buffer && !decodeError && (
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <WaveformStudio
            key={file.name + file.size}
            file={file}
            meta={meta}
            buffer={buffer}
            accent={accent}
          />
        </div>
      )}
    </div>
  );
}
