"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  resizeImage,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useImageTool } from "@/hooks/use-image-tool";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import type { ImageToolProps } from "@/components/tool/types";

/** One-click target sizes for the platforms people ask about most. */
const PRESETS: { label: string; sub: string; width: number; height: number }[] = [
  { label: "Instagram post", sub: "1080 × 1080", width: 1080, height: 1080 },
  { label: "Story / Reel", sub: "1080 × 1920", width: 1080, height: 1920 },
  { label: "YouTube thumb", sub: "1280 × 720", width: 1280, height: 720 },
  { label: "Facebook cover", sub: "820 × 312", width: 820, height: 312 },
  { label: "X header", sub: "1500 × 500", width: 1500, height: 500 },
  { label: "1080p wallpaper", sub: "1920 × 1080", width: 1920, height: 1080 },
];

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** Map a MIME type to a friendly download extension. */
function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/jpeg") return "jpg";
  return "png";
}

/** Coerce a dimension input into a positive integer (0 while the box is empty). */
function toDim(value: string): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 20000);
}

/**
 * Image Resizer, resample to an exact width × height. A lock keeps the two
 * dimensions in the source aspect ratio (editing one derives the other); social
 * presets fill both at once. The result panel reports the old/new size and the
 * exact scale factor. Everything runs through `resizeImage` in the browser.
 */
export default function ImageResizerTool({ tool }: ImageToolProps) {
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [lock, setLock] = React.useState(true);
  const style = accentStyle(tool.accent);

  // The source's natural aspect ratio, used to derive the locked dimension.
  const ratioRef = React.useRef(1);

  // P5 spec pages arrive with ?w=&h= presets ("resize for Discord emoji"),
  // so the visitor drops a file and gets a compliant output with zero setup.
  // Read once; a preset also unlocks the ratio (target trumps source shape).
  const presetRef = React.useRef<{ w: number; h: number } | null>(null);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const w = Number(params.get("w"));
    const h = Number(params.get("h"));
    if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
      presetRef.current = { w: Math.round(w), h: Math.round(h) };
      setWidth(Math.round(w));
      setHeight(Math.round(h));
      setLock(false);
    }
  }, []);

  // When a fresh image loads, seed the fields with its natural size - unless
  // a spec-page preset already set the target.
  const seed = React.useCallback((img: LoadedImage) => {
    ratioRef.current = img.height > 0 ? img.width / img.height : 1;
    if (presetRef.current) {
      setWidth(presetRef.current.w);
      setHeight(presetRef.current.h);
      return;
    }
    setWidth(img.width);
    setHeight(img.height);
  }, []);

  const changeWidth = React.useCallback(
    (raw: string) => {
      const w = toDim(raw);
      setWidth(w);
      if (lock && w > 0) {
        setHeight(Math.max(1, Math.round(w / ratioRef.current)));
      }
    },
    [lock],
  );

  const changeHeight = React.useCallback(
    (raw: string) => {
      const h = toDim(raw);
      setHeight(h);
      if (lock && h > 0) {
        setWidth(Math.max(1, Math.round(h * ratioRef.current)));
      }
    },
    [lock],
  );

  const applyPreset = React.useCallback(
    (w: number, h: number) => {
      // Presets set an explicit frame, so they ignore the lock intentionally.
      setLock(false);
      setWidth(w);
      setHeight(h);
    },
    [],
  );

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/*",
    process: (img: LoadedImage): Promise<ProcessResult> => {
      const w = width > 0 ? width : img.width;
      const h = height > 0 ? height : img.height;
      return resizeImage(img, { width: w, height: h, format: img.file.type });
    },
    outputName: (img) =>
      `${baseName(img.file.name)}-${width || img.width}x${
        height || img.height
      }-gigai.${extFor(img.file.type)}`,
  });

  // Seed the width/height inputs whenever a new source image becomes ready.
  const seededUrl = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (state.image && state.image.url !== seededUrl.current) {
      seededUrl.current = state.image.url;
      seed(state.image);
    }
    if (!state.image) seededUrl.current = null;
  }, [state.image, seed]);

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel="Resize image"
      formatsHint="JPG, PNG, WebP, GIF or BMP. Output keeps your original format"
      controls={
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="Ruler" size={15} className={style.text} />
              Dimensions (px)
            </legend>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resize-width" className="text-xs text-muted-foreground">
                  Width
                </Label>
                <Input
                  id="resize-width"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20000}
                  value={width || ""}
                  onChange={(event) => changeWidth(event.target.value)}
                  aria-label="Target width in pixels"
                  className="tabular-nums"
                />
              </div>

              <button
                type="button"
                onClick={() => setLock((v) => !v)}
                aria-pressed={lock}
                aria-label={
                  lock ? "Aspect ratio locked" : "Aspect ratio unlocked"
                }
                title={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                className={cn(
                  "mb-1.5 inline-flex size-9 items-center justify-center rounded-lg border transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  lock
                    ? cn("bg-muted/60", style.border, style.text)
                    : "border-border text-muted-foreground hover:bg-muted/40",
                )}
              >
                <Icon name={lock ? "Link2" : "Unlink2"} size={16} />
              </button>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resize-height" className="text-xs text-muted-foreground">
                  Height
                </Label>
                <Input
                  id="resize-height"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20000}
                  value={height || ""}
                  onChange={(event) => changeHeight(event.target.value)}
                  aria-label="Target height in pixels"
                  className="tabular-nums"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={lock}
                onChange={(event) => setLock(event.target.checked)}
                className={cn("size-3.5 rounded accent-emerald-500", style.ring)}
              />
              Lock aspect ratio (keep proportions)
            </label>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="LayoutGrid" size={15} className={style.text} />
              Social presets
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const active = width === p.width && height === p.height;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.width, p.height)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn("bg-muted/60", style.border, style.text)
                        : "border-border text-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {p.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </>
      }
      resultMeta={(result, image) => {
        const scale =
          image.width > 0
            ? Math.round((result.width / image.width) * 100)
            : 100;
        const enlarged = result.width > image.width;
        const same = result.width === image.width && result.height === image.height;

        return (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Original</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {image.width} × {image.height}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Resized</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {result.width} × {result.height}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Scale</dt>
              <dd
                className={cn(
                  "inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums",
                  same ? "text-muted-foreground" : style.text,
                )}
              >
                <Icon
                  name={
                    same ? "Minus" : enlarged ? "TrendingUp" : "TrendingDown"
                  }
                  size={14}
                />
                {scale}%
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
