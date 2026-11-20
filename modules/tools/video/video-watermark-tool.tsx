"use client";

/**
 * Video Watermark, in-browser branding tool.
 *
 * Drop a clip → preview it → overlay a text caption or an uploaded logo → pin it
 * to a corner or the centre, set the opacity (and, for text, size + color) → a
 * live overlay shows roughly where the mark lands → burn it into every frame
 * with a self-hosted FFmpeg WebAssembly core → preview + download. Everything
 * runs on the user's device; the ~31 MB wasm core is only fetched on the first
 * burn. {@link VideoWorkspace} owns file/probe/busy/progress/abort/error/result;
 * this module supplies the options UI (mode, text/logo, position, opacity) and
 * `onRun`.
 *
 * The chosen settings live in a ref so the run handler reads the latest values
 * without re-instantiating the render-prop child mid-drag.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  VideoWorkspace,
  VideoPlayer,
  type VideoMeta,
  type VideoWorkspaceRenderArgs,
} from "@/components/tool/video";
import {
  watermark,
  type WatermarkPosition,
} from "@/lib/video-tools/operations";

/** Which kind of mark to overlay. */
type Mode = "text" | "logo";

/** Everything the run handler needs to build the watermark call. */
interface WatermarkSettings {
  mode: Mode;
  text: string;
  fontSize: number;
  color: string;
  position: WatermarkPosition;
  opacity: number;
  /** Loaded logo bytes + original filename (for the extension), when in logo mode. */
  logo: { data: Uint8Array; name: string } | null;
}

const DEFAULT_SETTINGS: WatermarkSettings = {
  mode: "text",
  text: "GigAI Tools",
  fontSize: 32,
  color: "#ffffff",
  position: "bottom-right",
  opacity: 0.7,
  logo: null,
};

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Nine-cell placement grid; only corners + centre are real targets. */
const POSITIONS: { id: WatermarkPosition; label: string; cell: string }[] = [
  { id: "top-left", label: "Top left", cell: "col-start-1 row-start-1" },
  { id: "top-right", label: "Top right", cell: "col-start-3 row-start-1" },
  { id: "center", label: "Centre", cell: "col-start-2 row-start-2" },
  { id: "bottom-left", label: "Bottom left", cell: "col-start-1 row-start-3" },
  { id: "bottom-right", label: "Bottom right", cell: "col-start-3 row-start-3" },
];

/** Accepted logo image types. */
const LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";
/** Above this we warn a logo may be heavier than it needs to be. */
const LOGO_SOFT_MAX_BYTES = 8 * 1024 * 1024;

/** Map a WatermarkPosition to flex alignment for the live preview badge. */
function previewAlign(pos: WatermarkPosition): {
  justify: string;
  align: string;
} {
  const justify =
    pos === "center"
      ? "justify-center"
      : pos.includes("right")
        ? "justify-end"
        : "justify-start";
  const align =
    pos === "center"
      ? "items-center"
      : pos.includes("bottom")
        ? "items-end"
        : "items-start";
  return { justify, align };
}

/**
 * The options slot: a live preview with a placement badge overlaid, plus the
 * mode toggle, text/logo inputs, position grid and opacity slider. Holds the
 * (per-file) watermark settings and publishes them up on every change.
 */
function WatermarkControls({
  file,
  busy,
  meta,
  onSettingsChange,
}: VideoWorkspaceRenderArgs & {
  onSettingsChange: (settings: WatermarkSettings) => void;
}) {
  void file;
  const [src, setSrc] = React.useState<string>("");
  const [mode, setMode] = React.useState<Mode>("text");
  const [text, setText] = React.useState<string>(DEFAULT_SETTINGS.text);
  const [fontSize, setFontSize] = React.useState<number>(
    DEFAULT_SETTINGS.fontSize,
  );
  const [color, setColor] = React.useState<string>(DEFAULT_SETTINGS.color);
  const [position, setPosition] = React.useState<WatermarkPosition>(
    DEFAULT_SETTINGS.position,
  );
  const [opacity, setOpacity] = React.useState<number>(
    DEFAULT_SETTINGS.opacity,
  );
  const [logo, setLogo] = React.useState<{
    data: Uint8Array;
    name: string;
    previewUrl: string;
    sizeBytes: number;
  } | null>(null);
  const [logoError, setLogoError] = React.useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const aspectRatio =
    meta.width > 0 && meta.height > 0
      ? `${meta.width} / ${meta.height}`
      : undefined;

  // Object URL for the preview player; revoked on file change/unmount.
  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Revoke the logo preview URL when it changes or on unmount.
  React.useEffect(() => {
    return () => {
      if (logo) URL.revokeObjectURL(logo.previewUrl);
    };
  }, [logo]);

  // Publish current settings up to the run handler whenever anything changes.
  React.useEffect(() => {
    onSettingsChange({
      mode,
      text,
      fontSize,
      color,
      position,
      opacity,
      logo: logo ? { data: logo.data, name: logo.name } : null,
    });
  }, [mode, text, fontSize, color, position, opacity, logo, onSettingsChange]);

  const onLogoPicked = React.useCallback(
    async (picked: File | undefined) => {
      if (!picked) return;
      setLogoError("");
      if (!picked.type.startsWith("image/")) {
        setLogoError("That's not an image. Upload a PNG, JPG, WebP or SVG logo.");
        return;
      }
      const buffer = new Uint8Array(await picked.arrayBuffer());
      const previewUrl = URL.createObjectURL(picked);
      setLogo((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return {
          data: buffer,
          name: picked.name,
          previewUrl,
          sizeBytes: picked.size,
        };
      });
    },
    [],
  );

  const clearLogo = React.useCallback(() => {
    setLogo((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setLogoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const { justify, align } = previewAlign(position);
  const opacityPct = Math.round(opacity * 100);
  const logoTooBig = logo != null && logo.sizeBytes > LOGO_SOFT_MAX_BYTES;

  // Whether the run will have something to draw.
  const textReady = mode === "text" && text.trim().length > 0;
  const logoReady = mode === "logo" && logo != null;

  return (
    <div className="flex flex-col gap-5">
      {/* Preview stage with the placement badge layered on top of the player. */}
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-black/80">
        {src ? (
          <VideoPlayer src={src} aspectRatio={aspectRatio} className="w-full" />
        ) : null}

        {/* Placement overlay. pointer-events-none so the player stays usable. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex p-4 sm:p-6",
            justify,
            align,
          )}
        >
          {textReady ? (
            <span
              className="max-w-[80%] truncate rounded px-2 py-1 text-sm font-semibold sm:text-base"
              style={{
                color,
                opacity,
                backgroundColor: `rgba(0,0,0,${(opacity * 0.4).toFixed(2)})`,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              {text.trim()}
            </span>
          ) : null}
          {logoReady && logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.previewUrl}
              alt=""
              className="max-h-[35%] max-w-[45%] object-contain"
              style={{ opacity }}
            />
          ) : null}
        </div>

        {/* Hint when there's nothing to preview yet. */}
        {!textReady && !logoReady ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <span className="rounded-md bg-black/60 px-3 py-1.5 text-xs text-white">
              {mode === "text"
                ? "Type a caption below to preview it here"
                : "Upload a logo below to preview it here"}
            </span>
          </div>
        ) : null}
      </div>

      {/* Mode toggle: text vs logo. */}
      <div
        role="group"
        aria-label="Watermark type"
        className="grid grid-cols-2 gap-2"
      >
        {(
          [
            { id: "text" as const, label: "Text", icon: "Type" },
            { id: "logo" as const, label: "Logo image", icon: "Image" },
          ]
        ).map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              disabled={busy}
              aria-pressed={active}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              <Icon name={opt.icon} size={16} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Text controls. */}
      {mode === "text" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="wm-text"
              className="text-sm font-medium text-foreground"
            >
              Watermark text
            </label>
            <input
              id="wm-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
              maxLength={120}
              placeholder="Your name, @handle, URL or © line"
              className={cn(
                "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Font size. */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="wm-size"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>Font size</span>
                <span className="tabular-nums text-muted-foreground">
                  {fontSize}px
                </span>
              </label>
              <input
                id="wm-size"
                type="range"
                min={12}
                max={96}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                disabled={busy}
                className="w-full accent-primary disabled:opacity-50"
              />
            </div>

            {/* Color. */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="wm-color"
                className="text-sm font-medium text-foreground"
              >
                Text color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="wm-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={busy}
                  aria-label="Text color"
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-background disabled:opacity-50"
                />
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  {color}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Text uses the engine&rsquo;s built-in font, so exact letterforms may
            differ from your system fonts. For a specific brand typeface, render
            it as a transparent PNG and add it as a logo.
          </p>
        </div>
      ) : (
        /* Logo controls. */
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={LOGO_ACCEPT}
            className="sr-only"
            onChange={(e) => onLogoPicked(e.target.files?.[0])}
            disabled={busy}
          />
          {logo ? (
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
              <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded border border-border bg-[repeating-conic-gradient(#0000_0deg_90deg,#8883_0deg_180deg)] bg-[length:12px_12px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.previewUrl}
                  alt="Logo preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {logo.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(logo.sizeBytes / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={clearLogo}
                disabled={busy}
                className={cn(
                  "flex-none rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Icon name="Upload" size={22} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                Upload a logo image
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG, WebP or SVG &middot; a transparent PNG works best
              </span>
            </button>
          )}
          {logoError ? (
            <p className="text-xs text-destructive" role="alert">
              {logoError}
            </p>
          ) : null}
          {logoTooBig ? (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              That logo is fairly large; a smaller PNG keeps the burn fast and
              the edges crisp.
            </p>
          ) : null}
        </div>
      )}

      {/* Position grid. */}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Icon name="Move" size={15} className="text-primary" />
          Position
        </span>
        <div
          role="group"
          aria-label="Watermark position"
          className="grid aspect-video w-full max-w-[260px] grid-cols-3 grid-rows-3 gap-1.5 rounded-md border border-border bg-muted/30 p-1.5"
        >
          {POSITIONS.map((pos) => {
            const active = position === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => setPosition(pos.id)}
                disabled={busy}
                aria-pressed={active}
                aria-label={pos.label}
                title={pos.label}
                className={cn(
                  pos.cell,
                  "flex items-center justify-center rounded transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon name={active ? "Stamp" : "Circle"} size={active ? 16 : 8} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Opacity slider. */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="wm-opacity"
          className="flex items-center justify-between text-sm font-medium text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Icon name="Contrast" size={15} className="text-primary" />
            Opacity
          </span>
          <span className="tabular-nums text-muted-foreground">
            {opacityPct}%
          </span>
        </label>
        <input
          id="wm-opacity"
          type="range"
          min={5}
          max={100}
          step={5}
          value={opacityPct}
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          disabled={busy}
          className="w-full accent-primary disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground">
          A faint ghost protects without distracting; a solid stamp makes the
          mark the point.
        </p>
      </div>
    </div>
  );
}

/**
 * Video Watermark tool. Composes the {@link VideoWorkspace} scaffold with a
 * text/logo overlay UI and the `watermark` operation. TS-strict clean;
 * dark-mode, responsive and a11y-minded; honest about in-browser FFmpeg's
 * speed/size limits and the bundled text font.
 */
export default function VideoWatermarkTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // Live settings, updated by the options slot and read at run time.
  const settingsRef = React.useRef<WatermarkSettings>(DEFAULT_SETTINGS);
  const setSettings = React.useCallback((settings: WatermarkSettings) => {
    settingsRef.current = settings;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: VideoMeta,
      hooks: {
        onProgress: (p: number) => void;
        onEngineLoading: (loading: boolean) => void;
        signal: AbortSignal;
      },
    ): Promise<{ blob: Blob; filename?: string; kind?: "video" }> => {
      void _meta;
      const s = settingsRef.current;

      if (s.mode === "text" && s.text.trim().length === 0) {
        throw new Error(
          "Type some watermark text first, or switch to logo mode and upload an image.",
        );
      }
      if (s.mode === "logo" && !s.logo) {
        throw new Error(
          "Upload a logo image first, or switch to text mode and type a caption.",
        );
      }

      const opts =
        s.mode === "logo" && s.logo
          ? {
              imageData: s.logo,
              position: s.position,
              opacity: clamp(s.opacity, 0, 1),
            }
          : {
              text: s.text.trim(),
              position: s.position,
              opacity: clamp(s.opacity, 0, 1),
              fontSize: clamp(Math.round(s.fontSize), 8, 200),
              color: s.color,
            };

      // First burn of a session pays the one-time engine download.
      hooks.onEngineLoading(true);
      const result = await watermark(file, opts, (fraction) => {
        // The engine has loaded and started emitting real progress.
        hooks.onEngineLoading(false);
        hooks.onProgress(clamp(fraction, 0, 1));
      });

      if (hooks.signal.aborted) {
        // Workspace ignores the return when aborted; keep the shape valid.
        return { blob: new Blob(), kind: "video" };
      }

      if (!result.ok) {
        throw new Error(result.error);
      }

      return { blob: result.blob, filename: result.outName, kind: "video" };
    },
    [],
  );

  return (
    <div className={cn("flex flex-col gap-4")}>
      <VideoWorkspace
        onRun={handleRun}
        runLabel="Add watermark"
        runIcon="Stamp"
        resultTitle="Watermarked video"
        accept="video/*"
        softMaxMB={500}
        progressLabel="Adding watermark"
      >
        {(args) => (
          <WatermarkControls
            key={args.file.name + args.file.size}
            {...args}
            onSettingsChange={setSettings}
          />
        )}
      </VideoWorkspace>
    </div>
  );
}
