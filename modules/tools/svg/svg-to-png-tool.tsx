"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { svgToPng, type RasterOptions } from "@/lib/svg-tools/raster";
import {
  CodePane,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  Field,
  NumberStepper,
  SegmentedControl,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
} from "@/components/tool/dev";
import { SvgWorkspace, readSvgDimensions } from "@/components/tool/svg";

/** How the output pixel dimensions are chosen. */
type SizeMode = "scale" | "exact";

/** All user-tunable rasterization options for one export. */
interface Settings {
  mode: SizeMode;
  scale: number;
  width: number;
  height: number;
  useBackground: boolean;
  background: string;
}

const DEFAULT_SETTINGS: Settings = {
  mode: "scale",
  scale: 2,
  width: 1024,
  height: 1024,
  useBackground: false,
  background: "#ffffff",
};

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const MIN_PX = 1;
const MAX_PX = 8192;

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
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

/** Intrinsic size of the SVG (width/height attrs → viewBox → 512 fallback). */
function intrinsicSize(svg: string): { width: number; height: number } {
  const dims = readSvgDimensions(svg);
  if (dims.width && dims.height) return { width: dims.width, height: dims.height };
  if (dims.viewBox) {
    const [, , w, h] = dims.viewBox;
    if (w > 0 && h > 0) return { width: w, height: h };
  }
  if (dims.width) return { width: dims.width, height: dims.width };
  if (dims.height) return { width: dims.height, height: dims.height };
  return { width: 512, height: 512 };
}

/** Resolve the final PNG pixel dimensions from settings + the source SVG. */
function outputSize(svg: string, s: Settings): { width: number; height: number } {
  if (s.mode === "exact") {
    return { width: Math.max(1, Math.round(s.width)), height: Math.max(1, Math.round(s.height)) };
  }
  const { width, height } = intrinsicSize(svg);
  const scale = s.scale > 0 ? s.scale : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Curated samples so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Logo mark",
    description: "Solid fill on a small viewBox",
    icon: "Hexagon",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" fill="#ea580c"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 2l12 7v14l-12 7L4 23V9l12-7zm0 5.2L9 11.3v9.4l7 4.1 7-4.1v-9.4L16 7.2z"/></svg>',
  },
  {
    label: "Gradient badge",
    description: "defs + linearGradient, no size attrs",
    icon: "Sparkles",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs><rect x="4" y="4" width="40" height="40" rx="12" fill="url(#g)"/><path d="M24 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff"/></svg>',
  },
  {
    label: "Stroked icon",
    description: "Transparent line art on any background",
    icon: "PenTool",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  },
];

/** One rendered PNG result, ready for preview + download. */
interface RenderResult {
  url: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * SVG to PNG: the raster bridge of the SVG suite. It drives
 * `lib/svg-tools/raster`'s `svgToPng` from a scale/exact-size + background panel
 * and renders the result in synced surfaces: an editable SVG source pane, a live
 * sanitised vector preview ({@link SvgWorkspace}), and a rendered-PNG panel with
 * an object-URL preview, a size readout and download. Undo/redo, examples,
 * shortcuts and a shareable link round out a desktop-grade experience: all in
 * the browser, nothing uploaded.
 */
export default function SvgToPngTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const svg = useHistory<string>("");
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [render, setRender] = React.useState<RenderResult | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dismissedError, setDismissedError] = React.useState(false);

  const share = useShareState({
    onInit: (value) => svg.reset(value),
  });

  const setField = React.useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Revoke the previous object URL whenever it is replaced or the tool unmounts.
  const urlRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    urlRef.current = render?.url ?? null;
  }, [render]);
  React.useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const hasSvg = svg.state.trim().length > 0;

  // Planned output dimensions (recomputed as the SVG or size options change).
  const planned = React.useMemo(
    () => (hasSvg ? outputSize(svg.state, settings) : { width: 0, height: 0 }),
    [hasSvg, svg.state, settings],
  );

  // A new render becomes stale the moment the source or size options change.
  const renderKey = `${svg.state}|${settings.mode}|${settings.scale}|${settings.width}|${settings.height}|${settings.useBackground}|${settings.background}`;
  const lastRenderedKey = React.useRef<string | null>(null);
  const isStale = render != null && lastRenderedKey.current !== renderKey;

  const doRender = React.useCallback(async () => {
    if (!hasSvg || busy) return;
    setBusy(true);
    setError(null);
    setDismissedError(false);
    try {
      const opts: RasterOptions =
        settings.mode === "exact"
          ? {
              width: Math.max(MIN_PX, Math.round(settings.width)),
              height: Math.max(MIN_PX, Math.round(settings.height)),
            }
          : { scale: settings.scale > 0 ? settings.scale : 1 };
      if (settings.useBackground) opts.background = settings.background;

      const blob = await svgToPng(svg.state, opts);
      const url = URL.createObjectURL(blob);
      const size = outputSize(svg.state, settings);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      lastRenderedKey.current = renderKey;
      setRender({ url, blob, width: size.width, height: size.height });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not render the PNG.");
    } finally {
      setBusy(false);
    }
  }, [hasSvg, busy, settings, svg.state, renderKey]);

  const onShare = React.useCallback(() => {
    if (!hasSvg) return;
    void share.copyShareLink(svg.state);
  }, [share, svg.state, hasSvg]);

  useShortcuts({
    "mod+enter": (e) => {
      e.preventDefault();
      void doRender();
    },
    "mod+z": (e) => {
      e.preventDefault();
      svg.undo();
    },
    "mod+shift+z": (e) => {
      e.preventDefault();
      svg.redo();
    },
    escape: () => setDismissedError(true),
  });

  const options = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <Field label="Size mode">
          <SegmentedControl<SizeMode>
            value={settings.mode}
            onChange={(v) => setField("mode", v)}
            ariaLabel="Output size mode"
            size="sm"
            options={[
              { value: "scale", label: "Scale", icon: "Maximize2" },
              { value: "exact", label: "Exact px", icon: "Ruler" },
            ]}
          />
        </Field>

        {settings.mode === "scale" ? (
          <Field label={`Scale, ${settings.scale}×`} htmlFor="png-scale">
            <input
              id="png-scale"
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={1}
              value={settings.scale}
              onChange={(e) => setField("scale", Number(e.target.value))}
              aria-label="Scale multiplier"
              className="h-2 w-40 cursor-pointer appearance-none rounded-full bg-muted outline-none accent-orange-500 focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
        ) : (
          <>
            <Field label="Width (px)">
              <NumberStepper
                value={settings.width}
                onChange={(v) => setField("width", v)}
                min={MIN_PX}
                max={MAX_PX}
                step={16}
                ariaLabel="Output width in pixels"
              />
            </Field>
            <Field label="Height (px)">
              <NumberStepper
                value={settings.height}
                onChange={(v) => setField("height", v)}
                min={MIN_PX}
                max={MAX_PX}
                step={16}
                ariaLabel="Output height in pixels"
              />
            </Field>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-3">
        <Toggle
          checked={settings.useBackground}
          onChange={(v) => setField("useBackground", v)}
          label="Background color"
        />
        {settings.useBackground ? (
          <div className="inline-flex items-center gap-2">
            <input
              type="color"
              value={settings.background}
              onChange={(e) => setField("background", e.target.value)}
              aria-label="Background color picker"
              className="h-8 w-10 cursor-pointer rounded-md border border-border bg-background p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="text"
              value={settings.background}
              onChange={(e) => setField("background", e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-label="Background hex value"
              className="h-8 w-24 rounded-md border border-border bg-background px-2 font-mono text-xs uppercase text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            Off = transparent PNG (alpha preserved).
          </span>
        )}
        {hasSvg ? (
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            Output: {planned.width} × {planned.height} px
          </span>
        ) : null}
      </div>
    </div>
  );

  const workspaceExtra = (
    <>
      <ExamplesMenu
        examples={EXAMPLES}
        onPick={(value) => svg.reset(value)}
        heading="Load a sample SVG"
      />
      <ToolbarDivider />
      <ToolbarButton
        icon="Undo2"
        label="Undo"
        onClick={svg.undo}
        disabled={!svg.canUndo}
      />
      <ToolbarButton
        icon="Redo2"
        label="Redo"
        onClick={svg.redo}
        disabled={!svg.canRedo}
      />
    </>
  );

  const showError = error != null && !dismissedError;

  return (
    <div className="flex flex-col gap-4">
      <SvgWorkspace
        input={svg.state}
        onInputChange={svg.set}
        inputLabel="SVG source"
        placeholder='Paste SVG markup, drop a.svg file, or load a sample, e.g. <svg viewBox="0 0 24 24">…</svg>'
        filename="source.svg"
        copyTarget="input"
        options={options}
        toolbarExtra={workspaceExtra}
        onReset={() => {
          svg.reset("");
          setRender(null);
          setError(null);
        }}
        onShare={onShare}
        shareJustCopied={share.justCopied}
        emptyLabel="Your vector preview appears here"
      />

      {hasSvg ? (
        <div className="flex flex-col gap-2">
          {showError ? (
            <ErrorBanner error={error} onDismiss={() => setDismissedError(true)} />
          ) : null}

          <Toolbar>
            <span className="px-1 text-sm font-medium text-foreground">PNG output</span>
            <ToolbarDivider />
            <ToolbarButton
              icon="ImageDown"
              label="Render PNG"
              variant="active"
              onClick={() => void doRender()}
              loading={busy}
              disabled={busy}
              labelMode="always"
            />
            <DownloadButton
              filename="image.png"
              getValue={() => render?.blob ?? new Blob()}
              mime="image/png"
              label="Download"
              icon="Download"
            />
            <ToolbarSpacer />
            {render ? (
              <>
                <StatBadge
                  label="Pixels"
                  value={`${render.width} × ${render.height}`}
                  icon="Ruler"
                  tone={isStale ? "default" : "info"}
                />
                <StatBadge
                  label="Size"
                  value={formatBytes(render.blob.size)}
                  icon="Scale"
                />
                {isStale ? (
                  <StatBadge label="" value="Stale, re-render" icon="RefreshCw" tone="danger" />
                ) : (
                  <StatBadge label="" value="Rendered" icon="CircleCheck" tone="success" />
                )}
              </>
            ) : null}
          </Toolbar>

          {render ? (
            <div className="overflow-hidden rounded-lg border border-border bg-[conic-gradient(#0000_90deg,#8881_0)_0_0/16px_16px] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={render.url}
                alt="Rendered PNG preview"
                className="mx-auto block h-auto max-h-[420px] max-w-full object-contain"
                style={{ imageRendering: "auto" }}
              />
            </div>
          ) : (
            <CodePane
              value={
                busy
                  ? "// Rendering PNG…"
                  : "// Set your size and background, then Render PNG (⌘/Ctrl+Enter)."
              }
              readOnly
              label="PNG preview"
              minHeight={160}
              ariaLabel="PNG output placeholder"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
