"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { pngToSvg, type TraceOptions } from "@/lib/svg-tools/raster";
import { utf8Bytes } from "@/lib/svg-tools/core";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  Field,
  FileDropZone,
  NumberStepper,
  SegmentedControl,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useShortcuts,
  type Example,
} from "@/components/tool/dev";
import { SvgPreview, type PreviewBackground } from "@/components/tool/svg";
import { Icon } from "@/lib/icons";

/** imagetracerjs mode preset. */
type TraceMode = NonNullable<TraceOptions["mode"]>;

/** All user-tunable trace settings for one run. */
interface Settings {
  mode: TraceMode;
  colors: number;
}

const DEFAULT_SETTINGS: Settings = { mode: "flat", colors: 8 };

/** Modes exposed in the UI, with a one-word hint each. */
const MODE_OPTIONS: ReadonlyArray<{ value: TraceMode; label: string; icon: string }> = [
  { value: "flat", label: "Flat", icon: "Square" },
  { value: "poster", label: "Poster", icon: "LayoutGrid" },
  { value: "photo", label: "Photo", icon: "Image" },
  { value: "sketch", label: "Sketch", icon: "PenLine" },
];

/** Accepted raster inputs. */
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/bmp";
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB - keep tracing responsive.

/** A loaded source image plus its object URL for preview. */
interface Source {
  file: File;
  url: string;
  width: number;
  height: number;
}

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${Math.max(0, Math.round(n))} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Count top-level <path> elements in traced SVG output. */
function countPaths(svg: string): number {
  const m = svg.match(/<path\b/gi);
  return m ? m.length : 0;
}

/** Strip extension from a filename for the download base. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.length > 0 ? cleaned : "traced";
}

/**
 * A pair of tiny, dependency-free sample rasters embedded as PNG data URIs so
 * the empty state is one click from a real trace. Both are flat art, exactly
 * what the tracer excels at, generated once as small canvases.
 */
function makeSampleFile(kind: "logo" | "chip"): Promise<File> {
  return new Promise((resolve, reject) => {
    const size = 96;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas unavailable."));
      return;
    }
    if (kind === "logo") {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(48, 48, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(58, 40, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const cols = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"];
      for (let y = 0; y < 4; y += 1) {
        for (let x = 0; x < 4; x += 1) {
          ctx.fillStyle = cols[(x + y) % cols.length] ?? "#111827";
          ctx.fillRect(x * 24 + 4, y * 24 + 4, 16, 16);
        }
      }
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not build the sample image."));
        return;
      }
      resolve(new File([blob], `${kind === "logo" ? "sample-logo" : "sample-swatches"}.png`, { type: "image/png" }));
    }, "image/png");
  });
}

/** Sample entries: the value is a factory (built on click, browser-only). */
const EXAMPLES: ReadonlyArray<Example<"logo" | "chip">> = [
  {
    label: "Flat logo mark",
    description: "Solid shapes, traces to a handful of clean paths",
    icon: "Hexagon",
    value: "logo",
  },
  {
    label: "Color swatches",
    description: "Blocks of flat color, ideal tracer input",
    icon: "LayoutGrid",
    value: "chip",
  },
];

/**
 * PNG to SVG: the vectorizer of the SVG suite. It loads a raster image
 * (drop / browse / paste), traces it to SVG with `lib/svg-tools/raster`'s
 * `pngToSvg` under a Flat/Poster/Photo/Sketch mode + color-count panel, and
 * shows the ORIGINAL raster beside the traced {@link SvgPreview} so fidelity is
 * obvious. Path-count and size badges, copy/download, sample images and a reset
 * round it out. imagetracerjs lazy-loads; tracing is async and guarded by a
 * run-id so a slow trace can never overwrite a newer one. Everything runs in
 * the browser, nothing is uploaded, and the UI is honest that this is a
 * color-quantizing tracer, not an AI vectorizer.
 */
export default function PngToSvgTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [source, setSource] = React.useState<Source | null>(null);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [background, setBackground] = React.useState<PreviewBackground>("checker");

  const sourceRef = React.useRef<Source | null>(null);
  sourceRef.current = source;

  // Revoke the object URL when the source is replaced or the tool unmounts.
  React.useEffect(() => {
    return () => {
      if (sourceRef.current) URL.revokeObjectURL(sourceRef.current.url);
    };
  }, []);

  const setField = React.useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /** Load a File as the active source, measuring its intrinsic size. */
  const loadFile = React.useCallback((file: File) => {
    if (file.size > MAX_BYTES) {
      setError(`That image is ${formatBytes(file.size)}, please use one under ${formatBytes(MAX_BYTES)} so tracing stays responsive.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose a raster image (PNG, JPG, WebP, GIF or BMP). SVG and PDF aren't raster inputs.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setError(null);
      setSvg("");
      setSource((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { file, url, width: img.naturalWidth, height: img.naturalHeight };
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That file couldn't be decoded as an image. Try a PNG, JPG or WebP.");
    };
    img.src = url;
  }, []);

  const onFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const onPickExample = React.useCallback(
    (kind: "logo" | "chip") => {
      setSettings(DEFAULT_SETTINGS);
      makeSampleFile(kind)
        .then(loadFile)
        .catch(() => setError("Couldn't build the sample image in this browser."));
    },
    [loadFile],
  );

  // Trace whenever the source or a setting changes. Guarded by a monotonic run
  // id so a slow trace can never overwrite a newer result.
  const runIdRef = React.useRef(0);
  React.useEffect(() => {
    if (!source) {
      setSvg("");
      setBusy(false);
      return;
    }
    const runId = ++runIdRef.current;
    setBusy(true);
    const opts: TraceOptions = { mode: settings.mode, colors: settings.colors };
    pngToSvg(source.file, opts)
      .then((result) => {
        if (runId !== runIdRef.current) return;
        if (result.ok) {
          setSvg(result.result);
          setError(null);
        } else {
          setSvg("");
          setError(result.error.message);
        }
      })
      .catch(() => {
        if (runId !== runIdRef.current) return;
        setSvg("");
        setError("Tracing failed. Try a smaller image or a different mode.");
      })
      .finally(() => {
        if (runId === runIdRef.current) setBusy(false);
      });
  }, [source, settings]);

  const reset = React.useCallback(() => {
    setSource((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setSvg("");
    setError(null);
    setSettings(DEFAULT_SETTINGS);
    setBusy(false);
  }, []);

  useShortcuts(
    {
      "mod+backspace": (e) => {
        e.preventDefault();
        reset();
      },
    },
    { allowInInputs: true },
  );

  const filename = source ? `${baseName(source.file.name)}.svg` : "traced.svg";
  const svgBytes = svg ? utf8Bytes(svg) : 0;
  const paths = svg ? countPaths(svg) : 0;
  const heavy = paths > 800;

  const controls = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="Mode" hint="Preset that tunes the tracer">
          <SegmentedControl<TraceMode>
            value={settings.mode}
            onChange={(v) => setField("mode", v)}
            ariaLabel="Trace mode"
            size="sm"
            options={MODE_OPTIONS}
          />
        </Field>
        <Field label="Colors" hint="Fewer = cleaner, smaller">
          <NumberStepper
            value={settings.colors}
            onChange={(v) => setField("colors", v)}
            min={2}
            max={64}
            step={1}
            ariaLabel="Number of colors"
          />
        </Field>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        <span className="font-medium">Honest limits</span> - this is a
        color-quantizing tracer (imagetracerjs), not an AI vectorizer. It shines
        on flat logos, icons and pixel art. Photographs trace to thousands of
        paths and a large file; for those a raster format is usually better.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: sample images + reset. */}
      <Toolbar>
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={onPickExample}
          heading="Load a sample image"
        />
        <ToolbarDivider />
        <ToolbarButton
          icon="RotateCcw"
          label="Reset"
          onClick={reset}
          disabled={!source && !error}
          variant="destructive"
        />
        <ToolbarSpacer />
        {source ? (
          <StatBadge
            label="Source"
            value={`${source.width}×${source.height}`}
            icon="Image"
            tone="info"
          />
        ) : null}
        {busy ? <StatBadge value="Tracing…" icon="Loader" tone="info" /> : null}
      </Toolbar>

      {error ? <ErrorBanner error={error} onDismiss={() => setError(null)} /> : null}

      {controls}

      {/* Side-by-side: original raster + traced SVG. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Original raster pane */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Original</span>
            {source ? (
              <span className="text-xs text-muted-foreground">
                {source.file.name} · {formatBytes(source.file.size)}
              </span>
            ) : null}
          </div>
          {source ? (
            <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:20px_20px] p-4 dark:bg-[repeating-conic-gradient(#1f2937_0_25%,transparent_0_50%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.url}
                alt={`Original raster: ${source.file.name}`}
                className="max-h-[360px] max-w-full object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          ) : (
            <FileDropZone
              onFiles={onFiles}
              accept={ACCEPT}
              icon="ImagePlus"
              label="Drop a PNG, JPG or WebP, click to browse, or paste"
              hint="PNG · JPG · WebP · GIF · BMP. Up to 12 MB, stays on your device"
              className="min-h-[280px]"
            />
          )}
        </div>

        {/* Traced SVG pane */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Traced SVG</span>
            {svg ? (
              <div className="flex items-center gap-1.5">
                <StatBadge
                  label="Paths"
                  value={String(paths)}
                  icon="Spline"
                  tone={heavy ? "danger" : "success"}
                />
                <StatBadge label="Size" value={formatBytes(svgBytes)} icon="Scale" />
              </div>
            ) : null}
          </div>
          <SvgPreview
            svg={svg}
            background={background}
            onBackgroundChange={setBackground}
            minHeight={280}
            emptyLabel={
              source
                ? busy
                  ? "Tracing your image…"
                  : "Adjust the controls to trace"
                : "Your traced vector appears here"
            }
            ariaLabel="Traced SVG preview"
          />
        </div>
      </div>

      {/* Honest heavy-trace nudge. */}
      {heavy ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>
            This trace produced {paths.toLocaleString()} paths - the sign of a
            photographic or heavily-shaded source. Lower the color count, try
            Flat or Poster mode, or run the result through the SVG Optimizer.
          </span>
        </div>
      ) : null}

      {/* Output actions + source code. */}
      {svg ? (
        <div className="flex flex-col gap-2">
          <Toolbar>
            <span className="px-1 text-sm font-medium text-foreground">SVG source</span>
            <ToolbarDivider />
            <CopyButton getValue={() => svg} label="Copy SVG" />
            <DownloadButton
              filename={filename}
              getValue={() => svg}
              mime="image/svg+xml;charset=utf-8"
              label="Download"
            />
            <ToolbarSpacer />
            <StatBadge label="File" value={filename} icon="FileCode2" tone="info" />
          </Toolbar>
          <CodePane
            value={svg}
            readOnly
            label="Traced SVG, generated"
            lineNumbers
            wrap={false}
            minHeight={220}
            maxHeight={420}
            ariaLabel="Traced SVG source"
          />
          <p className={cn("text-[11px] leading-snug text-muted-foreground")}>
            Tip: send this to the SVG Optimizer to merge points and round
            coordinates, or to SVG to React to use it inline in a component.
          </p>
        </div>
      ) : null}
    </div>
  );
}
