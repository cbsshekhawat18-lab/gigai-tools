"use client";

/**
 * PDF to PowerPoint (PPTX): Document Studio "Convert from PDF" tool.
 *
 * HONEST best-effort converter: every PDF page is rasterised to a JPEG with the
 * shared PDF engine (`pdfToImages`, pdf.js lazy-imported) and placed full-bleed,
 * one per slide, into a real Office Open XML package that is zipped in the
 * browser with fflate. The output is a genuine .pptx that opens in PowerPoint,
 * Keynote and Google Slides, but each slide is an IMAGE of the page, not
 * editable text. That limitation is stated plainly in the UI, with pointers to
 * PDF to Text / PDF to Excel when the actual words are needed. Nothing is
 * uploaded: rendering and packaging both run on-device.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Field, SegmentedControl, download } from "@/components/tool/dev";
import { DocumentDropzone, type DetectedFile } from "@/components/tool/document";
import { pdfToImages } from "@/lib/pdf/convert";
import { toPdfInput } from "@/lib/pdf/types";
import { formatBytes } from "@/lib/pdf/core";

/* ── Options ──────────────────────────────────────────────────────────────── */

type Quality = "standard" | "high";
type SlideSize = "16:9" | "4:3";

const QUALITIES: ReadonlyArray<{ value: Quality; label: string }> = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
];

const SLIDE_SIZES: ReadonlyArray<{ value: SlideSize; label: string }> = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
];

/** Render scale per quality preset (feeds pdfToImages `scale`). */
const QUALITY_SCALE: Record<Quality, number> = {
  standard: 1.5,
  high: 2.25,
};

/** Slide dimensions in EMU (English Metric Units; 914400 EMU = 1 inch). */
const SLIDE_EMU: Record<SlideSize, { w: number; h: number }> = {
  "16:9": { w: 12192000, h: 6858000 },
  "4:3": { w: 9144000, h: 6858000 },
};

/** A rendered page: its blob, object-URL (for preview) and pixel dimensions. */
interface RenderedSlide {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

/* ── PPTX (Office Open XML) builders ──────────────────────────────────────── */

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

/** [Content_Types].xml, declares the JPEG default + every slide part. */
function contentTypesXml(slideCount: number): string {
  const slides = Array.from(
    { length: slideCount },
    (_, i) =>
      `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
  ).join("");
  return (
    XML_DECL +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Default Extension="jpeg" ContentType="image/jpeg"/>' +
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
    '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>' +
    '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>' +
    slides +
    "</Types>"
  );
}

/** Package-level _rels: presentation is the sole root relationship. */
function rootRelsXml(): string {
  return (
    XML_DECL +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>' +
    "</Relationships>"
  );
}

/** presentation.xml, slide size + ordered list of slide relationship ids. */
function presentationXml(slideCount: number, size: SlideSize): string {
  const { w, h } = SLIDE_EMU[size];
  // rId1 = master; slides start at rId2.
  const sldIds = Array.from(
    { length: slideCount },
    (_, i) =>
      `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`,
  ).join("");
  return (
    XML_DECL +
    '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
    '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>' +
    `<p:sldIdLst>${sldIds}</p:sldIdLst>` +
    `<p:sldSz cx="${w}" cy="${h}"/>` +
    '<p:notesSz cx="6858000" cy="9144000"/>' +
    "</p:presentation>"
  );
}

/** presentation.xml.rels: master + one relationship per slide. */
function presentationRelsXml(slideCount: number): string {
  const slides = Array.from(
    { length: slideCount },
    (_, i) =>
      `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
  ).join("");
  return (
    XML_DECL +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>' +
    slides +
    "</Relationships>"
  );
}

/** A minimal, valid slide master (no styling. Slides are full-bleed images). */
function slideMasterXml(): string {
  return (
    XML_DECL +
    '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
    '<p:cSld><p:spTree>' +
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>' +
    "</p:spTree></p:cSld>" +
    '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>' +
    '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>' +
    "</p:sldMaster>"
  );
}

function slideMasterRelsXml(): string {
  return (
    XML_DECL +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>' +
    "</Relationships>"
  );
}

/** A blank layout that points back at the master. */
function slideLayoutXml(): string {
  return (
    XML_DECL +
    '<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">' +
    '<p:cSld name="Blank"><p:spTree>' +
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>' +
    "</p:spTree></p:cSld>" +
    '<p:clrMapOvr><a:overrideClrMapping bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:clrMapOvr>' +
    "</p:sldLayout>"
  );
}

function slideLayoutRelsXml(): string {
  return (
    XML_DECL +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>' +
    "</Relationships>"
  );
}

/**
 * A slide holding one picture, fitted (aspect-preserving) and centred inside the
 * slide so the whole page is always visible, letterboxed rather than stretched.
 */
function slideXml(
  slide: RenderedSlide,
  size: SlideSize,
  index: number,
): string {
  const { w: slideW, h: slideH } = SLIDE_EMU[size];
  const imgRatio = slide.width / slide.height;
  const slideRatio = slideW / slideH;

  let drawW = slideW;
  let drawH = slideH;
  if (imgRatio > slideRatio) {
    // Page is wider than the slide → full width, letterbox top/bottom.
    drawH = Math.round(slideW / imgRatio);
  } else {
    // Page is taller → full height, letterbox left/right.
    drawW = Math.round(slideH * imgRatio);
  }
  const offX = Math.round((slideW - drawW) / 2);
  const offY = Math.round((slideH - drawH) / 2);

  return (
    XML_DECL +
    '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
    '<p:cSld><p:spTree>' +
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>' +
    "<p:pic>" +
    `<p:nvPicPr><p:cNvPr id="${index + 2}" name="Page ${index + 1}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>` +
    '<p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>' +
    "<p:spPr>" +
    `<a:xfrm><a:off x="${offX}" y="${offY}"/><a:ext cx="${drawW}" cy="${drawH}"/></a:xfrm>` +
    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>' +
    "</p:spPr>" +
    "</p:pic>" +
    "</p:spTree></p:cSld>" +
    '<p:clrMapOvr><a:overrideClrMapping bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:clrMapOvr>' +
    "</p:sld>"
  );
}

/** Each slide references its own embedded image. */
function slideRelsXml(index: number): string {
  return (
    XML_DECL +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${index + 1}.jpeg"/>` +
    "</Relationships>"
  );
}

/**
 * Zip all parts into a .pptx (an OOXML zip) with fflate. XML parts are stored
 * as deflate-compressed text; the already-compressed JPEGs are stored raw
 * (level 0) so we don't waste time recompressing them.
 */
async function buildPptx(
  slides: RenderedSlide[],
  size: SlideSize,
): Promise<Blob> {
  const { zip, strToU8 } = await import("fflate");

  const count = slides.length;
  const files: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};
  const text = (s: string): [Uint8Array, { level: 6 }] => [strToU8(s), { level: 6 }];

  files["[Content_Types].xml"] = text(contentTypesXml(count));
  files["_rels/.rels"] = text(rootRelsXml());
  files["ppt/presentation.xml"] = text(presentationXml(count, size));
  files["ppt/_rels/presentation.xml.rels"] = text(presentationRelsXml(count));
  files["ppt/slideMasters/slideMaster1.xml"] = text(slideMasterXml());
  files["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = text(slideMasterRelsXml());
  files["ppt/slideLayouts/slideLayout1.xml"] = text(slideLayoutXml());
  files["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = text(slideLayoutRelsXml());

  for (let i = 0; i < count; i += 1) {
    const slide = slides[i]!;
    files[`ppt/slides/slide${i + 1}.xml`] = text(slideXml(slide, size, i));
    files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = text(slideRelsXml(i));
    const bytes = new Uint8Array(await slide.blob.arrayBuffer());
    files[`ppt/media/image${i + 1}.jpeg`] = [bytes, { level: 0 }];
  }

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(files, (err, data) => (err ? reject(err) : resolve(data)));
  });
  const copy = new Uint8Array(zipped.byteLength);
  copy.set(zipped);
  return new Blob([copy], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function PdfToPptTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [quality, setQuality] = React.useState<Quality>("standard");
  const [slideSize, setSlideSize] = React.useState<SlideSize>("16:9");

  const [slides, setSlides] = React.useState<RenderedSlide[]>([]);
  const [rendering, setRendering] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Track the current render so a stale async pass can't clobber a newer one.
  const runIdRef = React.useRef(0);
  const slidesRef = React.useRef<RenderedSlide[]>([]);

  const revokeAll = React.useCallback(() => {
    for (const s of slidesRef.current) URL.revokeObjectURL(s.url);
    slidesRef.current = [];
  }, []);

  // Revoke object URLs on unmount.
  React.useEffect(() => () => revokeAll(), [revokeAll]);

  const renderPages = React.useCallback(
    async (target: File, q: Quality) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      revokeAll();
      setSlides([]);
      setError(null);
      setRendering(true);
      setStatus("Reading PDF…");

      try {
        const named = await pdfToImages(toPdfInput(target), {
          format: "image/jpeg",
          scale: QUALITY_SCALE[q],
          quality: 0.85,
          onProgress: (ratio, msg) => {
            if (runIdRef.current === runId) {
              setStatus(msg ?? `Rendering… ${Math.round(ratio * 100)}%`);
            }
          },
        });

        // A newer render started while we were working: discard this one.
        if (runIdRef.current !== runId) {
          for (const n of named) void n;
          return;
        }

        const rendered: RenderedSlide[] = await Promise.all(
          named.map(async (n) => {
            const dims = await imageDimensions(n.blob);
            return { blob: n.blob, url: URL.createObjectURL(n.blob), ...dims };
          }),
        );

        if (runIdRef.current !== runId) {
          for (const r of rendered) URL.revokeObjectURL(r.url);
          return;
        }

        slidesRef.current = rendered;
        setSlides(rendered);
      } catch (err) {
        if (runIdRef.current === runId) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not read this PDF. It may be corrupted or password-protected.",
          );
        }
      } finally {
        if (runIdRef.current === runId) setRendering(false);
      }
    },
    [revokeAll],
  );

  const handleFile = React.useCallback(
    (detected: DetectedFile) => {
      setFile(detected.file);
      void renderPages(detected.file, quality);
    },
    [renderPages, quality],
  );

  // Re-render when the resolution changes (image size differs by quality).
  const handleQuality = React.useCallback(
    (q: Quality) => {
      setQuality(q);
      if (file) void renderPages(file, q);
    },
    [file, renderPages],
  );

  const reset = React.useCallback(() => {
    runIdRef.current += 1;
    revokeAll();
    setFile(null);
    setSlides([]);
    setError(null);
    setStatus("");
    setRendering(false);
  }, [revokeAll]);

  const [building, setBuilding] = React.useState(false);

  const handleConvert = React.useCallback(async () => {
    if (!file || slides.length === 0) return;
    setBuilding(true);
    setError(null);
    try {
      const blob = await buildPptx(slides, slideSize);
      const base = file.name.replace(/\.pdf$/i, "");
      download(
        `${base}.pptx`,
        blob,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the PowerPoint file.");
    } finally {
      setBuilding(false);
    }
  }, [file, slides, slideSize]);

  /* ── Empty state: dropzone ──────────────────────────────────────────────── */
  if (!file) {
    return (
      <div className="flex flex-col gap-4">
        <DocumentDropzone
          accept={["pdf"]}
          onFile={handleFile}
          icon="Presentation"
          label="Drop a PDF to convert to PowerPoint"
          hint="Each page becomes a full-bleed slide. Read privately in your browser"
        />
        <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
          <span>
            100% in your browser. Your PDF is rendered and packaged into a.pptx on your device. It
            is never uploaded, stored or logged.
          </span>
        </p>
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          <span>
            Honest note: each slide is a high-resolution image of the page, so the text is a picture,
            not editable PowerPoint text. Need the words back? Use{" "}
            <span className="font-medium">PDF to Text</span> or{" "}
            <span className="font-medium">PDF to Excel</span>.
          </span>
        </p>
      </div>
    );
  }

  const ready = !rendering && slides.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* File chip */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Icon name="FileText" size={18} className="shrink-0 text-orange-600" />
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
        {slides.length > 0 && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {slides.length} slide{slides.length === 1 ? "" : "s"}
          </span>
        )}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={reset}>
          <Icon name="RotateCcw" size={15} />
          Change file
        </Button>
      </div>

      {/* Options + action */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
        <Field label="Resolution">
          <SegmentedControl
            value={quality}
            onChange={handleQuality}
            options={QUALITIES}
            ariaLabel="Render resolution"
            size="sm"
          />
        </Field>
        <Field label="Slide size">
          <SegmentedControl
            value={slideSize}
            onChange={setSlideSize}
            options={SLIDE_SIZES}
            ariaLabel="Slide size"
            size="sm"
          />
        </Field>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="lg"
            onClick={() => void handleConvert()}
            disabled={!ready || building}
          >
            {building ? (
              <Icon name="LoaderCircle" size={18} className="animate-spin" />
            ) : (
              <Icon name="FileDown" size={18} />
            )}
            {building ? "Building…" : "Convert to PowerPoint"}
          </Button>
        </div>
      </div>

      {/* Rendering status */}
      {rendering && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground"
        >
          <Icon name="LoaderCircle" size={18} className="animate-spin" />
          {status || "Rendering pages…"}
        </div>
      )}

      {/* Live slide preview grid */}
      {slides.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <Icon name="Images" size={14} />
            Slide preview
            <span className="ml-auto flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5">
                {slides.length} slide{slides.length === 1 ? "" : "s"}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 uppercase tracking-wide">
                {slideSize} · {quality === "high" ? "High" : "Std"}
              </span>
            </span>
          </div>
          <div
            className="grid gap-3 overflow-auto p-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              maxHeight: 460,
            }}
          >
            {slides.map((slide, i) => (
              <figure
                key={slide.url}
                className="flex flex-col gap-1.5"
              >
                <div
                  className="relative flex items-center justify-center overflow-hidden rounded-lg border border-border bg-neutral-100 dark:bg-neutral-900"
                  style={{ aspectRatio: slideSize === "16:9" ? "16 / 9" : "4 / 3" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, no remote fetch */}
                  <img
                    src={slide.url}
                    alt={`Slide ${i + 1}`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-center text-xs text-muted-foreground tabular-nums">
                  Slide {i + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Honesty note */}
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          Each slide is a high-resolution image of the PDF page, so the exact layout is preserved but
          the text isn&apos;t editable, selectable or searchable, and there are no native shapes or
          tables to restyle. Pages are fitted to the slide (letterboxed, never cropped). Need the
          actual words? Use the <span className="font-medium">PDF to Text</span> tool for selectable
          text or <span className="font-medium">PDF to Excel</span> for tables. Everything runs in
          your browser: nothing is uploaded.
        </span>
      </p>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** Read the pixel dimensions of an image blob (for aspect-preserving fit). */
async function imageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(blob);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    // Fallback via an <img> if createImageBitmap is unavailable for this type.
    return await new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve({ width: 1600, height: 900 });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }
}
