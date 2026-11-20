"use client";

/**
 * Watermark PDF, stamp a text or image watermark onto every page.
 *
 * A focused annotation tool that REUSES the shared watermark engine
 * (`addWatermark` from `@/lib/document-tools/pdfops`, built on pdf-lib) rather
 * than reimplementing page drawing. The UI adds the everyday knobs: text/logo,
 * opacity, angle, color, size, and single-vs-tiled placement, plus a live
 * CSS preview of the mark over the loaded page, then exports a real watermarked
 * PDF. Everything runs in the browser; pdf-lib is lazy-imported by the engine.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import {
  Field,
  SegmentedControl,
  Toggle,
  download,
} from "@/components/tool/dev";
import {
  DocumentDropzone,
  DocumentPreview,
  type DetectedFile,
} from "@/components/tool/document";
import { addWatermark, toPdfInput } from "@/lib/document-tools/pdfops";

/* ── Options ──────────────────────────────────────────────────────────────── */

type Mode = "text" | "image";

const MODES: ReadonlyArray<{ value: Mode; label: string; icon: string }> = [
  { value: "text", label: "Text", icon: "Type" },
  { value: "image", label: "Image", icon: "Image" },
];

/** Quick-pick labels for the most-searched text watermarks. */
const PRESETS: ReadonlyArray<string> = [
  "DRAFT",
  "CONFIDENTIAL",
  "SAMPLE",
  "COPY",
  "DO NOT COPY",
];

/** Read a File's bytes for pdf-lib image embedding. */
async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function DocumentWatermarkTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [mode, setMode] = React.useState<Mode>("text");

  // Text mode
  const [text, setText] = React.useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = React.useState(48);

  // Image mode
  const [image, setImage] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imageScale, setImageScale] = React.useState(50); // % of page width

  // Shared
  const [opacity, setOpacity] = React.useState(20); // %
  const [angle, setAngle] = React.useState(45); // degrees
  const [tile, setTile] = React.useState(true);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<{ name: string; blob: Blob; file: File } | null>(null);

  const fileInputId = React.useId();

  // Manage the object URL for the logo preview.
  React.useEffect(() => {
    if (!image) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const reset = React.useCallback(() => {
    setSelected(null);
    setImage(null);
    setDone(null);
    setError(null);
  }, []);

  const handleImagePick = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    setDone(null);
    if (f && !/^image\/(png|jpe?g)$/i.test(f.type)) {
      setError("Please choose a PNG or JPG image for the logo.");
      return;
    }
    setImage(f);
  }, []);

  const canExport =
    selected != null && (mode === "text" ? text.trim().length > 0 : image != null);

  const handleExport = React.useCallback(async () => {
    if (!selected) return;
    if (mode === "text" && !text.trim()) {
      setError("Type some watermark text first.");
      return;
    }
    if (mode === "image" && !image) {
      setError("Add a PNG or JPG logo to stamp.");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const input = toPdfInput(selected.file);
      const shared = {
        opacity: opacity / 100,
        angle,
        tile,
      };
      const res =
        mode === "text"
          ? await addWatermark(input, {
              ...shared,
              text: text.trim(),
              fontSize,
            })
          : await addWatermark(input, {
              ...shared,
              image: await readBytes(image!),
              imageType: /png$/i.test(image!.type) ? "png" : "jpg",
              imageScale: imageScale / 100,
            });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const outFile = new File([res.result.blob], res.result.name, {
        type: "application/pdf",
      });
      setDone({ name: res.result.name, blob: res.result.blob, file: outFile });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Watermarking failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [selected, mode, text, fontSize, image, imageScale, opacity, angle, tile]);

  /* ── Live watermark overlay (CSS approximation of the export) ───────────── */
  const overlay = React.useMemo(() => {
    const cell = (key: string | number) => (
      <div
        key={key}
        style={{
          transform: `rotate(${-angle}deg)`,
          opacity: opacity / 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mode === "text" ? (
          <span
            style={{
              color: "rgb(128,128,128)",
              fontWeight: 700,
              fontFamily: "ui-sans-serif, system-ui, Arial, sans-serif",
              fontSize: Math.max(10, fontSize * (tile ? 0.34 : 0.5)),
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
            }}
          >
            {text || "WATERMARK"}
          </span>
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img
            src={imageUrl}
            alt=""
            style={{ width: `${(tile ? imageScale * 0.5 : imageScale) }%`, maxWidth: "80%", height: "auto" }}
          />
        ) : (
          <span style={{ color: "rgba(120,120,120,.6)", fontSize: 13 }}>Add a logo…</span>
        )}
      </div>
    );

    if (tile) {
      return (
        <div
          className="pointer-events-none absolute inset-0 grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, 1fr)" }}
        >
          {Array.from({ length: 12 }, (_, i) => cell(i))}
        </div>
      );
    }
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {cell("single")}
      </div>
    );
  }, [angle, opacity, mode, fontSize, tile, text, imageUrl, imageScale]);

  /* ── Render ─────────────────────────────────────────────────────────────── */

  // No file yet → just the drop zone.
  if (!selected) {
    return (
      <div className="flex flex-col gap-4">
        <DocumentDropzone
          accept={["pdf"]}
          selected={null}
          onFile={(d) => {
            setSelected(d);
            setError(null);
            setDone(null);
          }}
          onClear={() => setSelected(null)}
          icon="Stamp"
          label="Drop a PDF to watermark"
          hint="PDF only · opened locally, never uploaded"
        />
        <HonestyNote />
      </div>
    );
  }

  // Result screen.
  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
          <span
            className={cn(
              "grid size-12 place-items-center rounded-full",
              style.soft,
            )}
          >
            <Icon name="CircleCheck" size={24} className={style.text} />
          </span>
          <div>
            <p className="font-medium text-foreground">Watermark added to every page</p>
            <p className="text-sm text-muted-foreground">{done.name}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={() => download(done.name, done.blob, "application/pdf")}
              size="lg"
            >
              <Icon name="Download" size={18} />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => setDone(null)}>
              <Icon name="SlidersHorizontal" size={16} />
              Adjust settings
            </Button>
            <Button variant="ghost" onClick={reset}>
              <Icon name="RotateCcw" size={16} />
              Start over
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <DocumentPreview file={done.file} kind="pdf" height={520} />
        </div>

        <HonestyNote />
      </div>
    );
  }

  // Configure screen.
  return (
    <div className="flex flex-col gap-4">
      {/* Selected-file chip */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <span className={cn("grid size-9 place-items-center rounded-lg", style.soft)}>
          <Icon name="FileText" size={18} className={style.text} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{selected.file.name}</p>
          <p className="text-xs text-muted-foreground">Ready to watermark</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <Icon name="X" size={15} />
          Change file
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Live preview */}
        <div className="flex min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <Icon name="Eye" size={14} />
            Live preview
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 uppercase tracking-wide">
              {tile ? "Tiled" : "Centered"}
            </span>
          </div>
          <div
            className="flex-1 overflow-auto p-4"
            style={{ background: "color-mix(in srgb, var(--muted) 40%, transparent)" }}
          >
            {/* A page mock with the watermark overlaid so parameters are visible live. */}
            <div className="relative mx-auto aspect-[1/1.414] w-full max-w-[420px] overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5">
              {/* Faux page content underneath, so opacity reads truthfully. */}
              <div className="absolute inset-0 p-6" aria-hidden>
                <div className="mb-3 h-3 w-2/5 rounded bg-neutral-800/80" />
                {Array.from({ length: 14 }, (_, i) => (
                  <div
                    key={i}
                    className="mb-2 h-2 rounded bg-neutral-300"
                    style={{ width: `${70 + ((i * 37) % 28)}%` }}
                  />
                ))}
              </div>
              {overlay}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Approximate preview · the same mark is applied to every page on export
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <Field label="Watermark type">
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={MODES}
              ariaLabel="Watermark type"
              size="sm"
            />
          </Field>

          {mode === "text" ? (
            <>
              <Field label="Text" htmlFor="wm-text">
                <input
                  id="wm-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setText(p)}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                      text === p
                        ? cn(style.soft, style.border)
                        : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Field label={`Font size · ${fontSize}pt`} htmlFor="wm-size">
                <input
                  id="wm-size"
                  type="range"
                  min={12}
                  max={120}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                  aria-label="Font size"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Logo image (PNG or JPG)">
                <label
                  htmlFor={fileInputId}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/40"
                >
                  <Icon name="Upload" size={16} className={style.text} />
                  {image ? <span className="truncate text-foreground">{image.name}</span> : "Choose an image…"}
                </label>
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImagePick}
                  className="sr-only"
                />
              </Field>
              <Field label={`Size · ${imageScale}% of page width`} htmlFor="wm-scale">
                <input
                  id="wm-scale"
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={imageScale}
                  onChange={(e) => setImageScale(Number(e.target.value))}
                  className="w-full"
                  aria-label="Image size"
                />
              </Field>
              <p className="text-xs text-muted-foreground">
                Use a transparent PNG for a clean logo; a JPG shows a solid background.
              </p>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label={`Opacity · ${opacity}%`} htmlFor="wm-opacity">
              <input
                id="wm-opacity"
                type="range"
                min={5}
                max={100}
                step={5}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
                aria-label="Opacity"
              />
            </Field>
            <Field label={`Angle · ${angle}°`} htmlFor="wm-angle">
              <input
                id="wm-angle"
                type="range"
                min={-90}
                max={90}
                step={5}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full"
                aria-label="Rotation angle"
              />
            </Field>
          </div>

          <Field label="Placement">
            <Toggle checked={tile} onChange={setTile} label={tile ? "Tiled across page" : "Single centered stamp"} />
          </Field>

          <Button
            size="lg"
            className="mt-1 w-full"
            onClick={() => void handleExport()}
            disabled={busy || !canExport}
          >
            {busy ? (
              <Icon name="LoaderCircle" size={18} className="animate-spin" />
            ) : (
              <Icon name="Stamp" size={18} />
            )}
            {busy ? "Stamping…" : "Add Watermark"}
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <HonestyNote />
    </div>
  );
}

/* ── Shared honesty note ──────────────────────────────────────────────────── */

function HonestyNote() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
      <span>
        A watermark is a visible deterrent and branding layer, not encryption: a determined user with
        PDF-editing software can remove an overlay. To restrict who can open or edit the file, use the{" "}
        <span className="font-medium">Protect PDF (password)</span> tool. Everything runs in your
        browser; your file is never uploaded.
      </span>
    </p>
  );
}
