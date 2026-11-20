"use client";

/**
 * PPT to PDF: an honest, 100%-in-browser best-effort converter.
 *
 * A .pptx is a ZIP of XML + media. We open it with fflate, read each slide's
 * XML in deck order, pull out the text runs (`<a:t>`) and the image parts it
 * references, then lay everything out one slide per page onto a real PDF with
 * jsPDF. Both heavy libs (fflate, jspdf) are lazy-imported so the module stays
 * cheap. Nothing is uploaded: the file is unzipped and rendered on the device.
 *
 * Honesty is the whole point: this is a content-and-image capture, NOT a
 * pixel-perfect Office render (fonts, geometry, SmartArt, charts, animations
 * need a real Office engine). The UI states that plainly and always points to
 * the exact-render path (File → Export/Download → PDF in PowerPoint / Slides).
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { FileDropZone, download } from "@/components/tool/dev";
import { DocumentPreview } from "@/components/tool/document";
import { formatBytes } from "@/lib/pdf/core";

/* ── Types ────────────────────────────────────────────────────────────────── */

type Phase = "idle" | "working" | "done" | "error";

interface Slide {
  /** Zip path, e.g. "ppt/slides/slide1.xml", sorted by numeric index. */
  path: string;
  /** Text runs, in reading order. */
  text: string[];
  /** Data-URI images embedded on the slide (already decoded). */
  images: string[];
}

interface ConversionResult {
  file: File;
  slideCount: number;
  imageCount: number;
  textCount: number;
}

/* ── .pptx parsing (all in-browser, deps lazy) ────────────────────────────── */

const XML_DECODER = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;

/** Numeric slide index from "ppt/slides/slide12.xml" → 12 (for correct order). */
function slideIndex(path: string): number {
  const m = /slide(\d+)\.xml$/i.exec(path);
  return m && m[1] ? Number.parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

/** Decode a handful of XML entities we care about in slide text. */
function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

/** Pull the visible text runs (`<a:t>…</a:t>`) out of one slide's XML. */
function extractSlideText(xml: string): string[] {
  const runs: string[] = [];
  const re = /<a:t>([\s\S]*?)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const raw = m[1];
    if (raw == null) continue;
    const text = decodeXmlEntities(raw).trim();
    if (text) runs.push(text);
  }
  return runs;
}

/** Collect the embed relationship ids (`r:embed="rIdN"`) referenced by a slide. */
function extractEmbedIds(xml: string): string[] {
  const ids: string[] = [];
  const re = /r:embed="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m[1]) ids.push(m[1]);
  }
  return ids;
}

/** Parse a slide's .rels file into { rId → target media path }. */
function parseRels(xml: string, slidePath: string): Record<string, string> {
  const map: Record<string, string> = {};
  const re = /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const id = m[1];
    const target = m[2];
    if (!id || !target) continue;
    map[id] = resolveTarget(target, slidePath);
  }
  return map;
}

/** Resolve a relationship Target (often "../media/image1.png") to a zip path. */
function resolveTarget(target: string, slidePath: string): string {
  if (/^https?:/i.test(target)) return target;
  const baseDir = slidePath.replace(/\/[^/]*$/, ""); // "ppt/slides"
  const parts = baseDir.split("/");
  for (const seg of target.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
};

/** Bytes → data-URI for an image path, or null for unsupported types. */
function imageToDataUri(path: string, bytes: Uint8Array): string | null {
  const ext = (path.split(".").pop() ?? "").toLowerCase();
  const mime = IMAGE_MIME[ext];
  if (!mime) return null;
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

/** Caps that keep a malicious/huge .pptx from exhausting browser memory. */
const MAX_PPTX_MB = 100;
const MAX_UNZIPPED_BYTES = 500 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 2000;

/** Open a .pptx (ZIP) and return its slides with text + embedded images. */
async function parsePptx(file: File): Promise<Slide[]> {
  if (file.size > MAX_PPTX_MB * 1024 * 1024) {
    throw new Error(
      `This presentation is larger than ${MAX_PPTX_MB} MB: please use a smaller.pptx file.`,
    );
  }

  const { unzipSync } = await import("fflate");
  const buf = new Uint8Array(await file.arrayBuffer());

  // Guard against zip bombs while unzipping: cap the entry count and the
  // running decompressed size, skipping (not decompressing) anything beyond.
  let entryCount = 0;
  let unzippedBytes = 0;
  let overflowed = false;

  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buf, {
      filter: (entry) => {
        entryCount += 1;
        unzippedBytes += entry.originalSize;
        if (entryCount > MAX_ZIP_ENTRIES || unzippedBytes > MAX_UNZIPPED_BYTES) {
          overflowed = true;
          return false;
        }
        return true;
      },
    });
  } catch {
    throw new Error(
      "This doesn't look like a valid .pptx file. It may be an old binary .ppt (save it as .pptx first) or a corrupted archive.",
    );
  }

  if (overflowed) {
    throw new Error(
      "This presentation is too large to convert in the browser. It unpacks to over 500 MB or contains more than 2000 parts. Please use a smaller.pptx file.",
    );
  }

  const slidePaths = Object.keys(files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
    .sort((a, b) => slideIndex(a) - slideIndex(b));

  if (slidePaths.length === 0) {
    throw new Error(
      "No slides were found inside this file. Make sure it's a PowerPoint .pptx (Office Open XML) presentation.",
    );
  }

  const decode = (bytes: Uint8Array): string =>
    XML_DECODER ? XML_DECODER.decode(bytes) : String.fromCharCode(...bytes);

  const slides: Slide[] = [];
  for (const path of slidePaths) {
    const xmlBytes = files[path];
    if (!xmlBytes) continue;
    const xml = decode(xmlBytes);
    const text = extractSlideText(xml);

    // Resolve embedded images via the slide's .rels file.
    const images: string[] = [];
    const relsPath = path.replace(/slides\/(slide\d+)\.xml$/i, "slides/_rels/$1.xml.rels");
    const relsBytes = files[relsPath];
    if (relsBytes) {
      const rels = parseRels(decode(relsBytes), path);
      const seen = new Set<string>();
      for (const id of extractEmbedIds(xml)) {
        const mediaPath = rels[id];
        if (!mediaPath || seen.has(mediaPath)) continue;
        seen.add(mediaPath);
        const mediaBytes = files[mediaPath];
        if (!mediaBytes) continue;
        const uri = imageToDataUri(mediaPath, mediaBytes);
        if (uri) images.push(uri);
      }
    }

    slides.push({ path, text, images });
  }

  return slides;
}

/** Load a data-URI image to get its natural pixel dimensions. */
function loadImageSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = src;
  });
}

/** Render extracted slides to a landscape (16:9-ish) PDF, one slide per page. */
async function slidesToPdf(slides: Slide[], baseName: string): Promise<ConversionResult> {
  const { jsPDF } = await import("jspdf");
  // Landscape A4 matches the shape of most decks better than portrait.
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape", compress: true });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;

  let imageCount = 0;
  let textCount = 0;

  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    if (!slide) continue;
    if (i > 0) pdf.addPage("a4", "landscape");

    // Slide-number heading.
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(120);
    pdf.text(`Slide ${i + 1} of ${slides.length}`, margin, margin - 12);
    pdf.setTextColor(20);

    let y = margin + 6;

    // First text run rendered as a slide title, the rest as body.
    slide.text.forEach((run, idx) => {
      textCount += 1;
      const isTitle = idx === 0;
      pdf.setFont("helvetica", isTitle ? "bold" : "normal");
      pdf.setFontSize(isTitle ? 20 : 13);
      const lines = pdf.splitTextToSize(run, contentW) as string[];
      for (const line of lines) {
        if (y > pageH - margin) {
          pdf.addPage("a4", "landscape");
          y = margin;
        }
        pdf.text(line, margin, y);
        y += isTitle ? 26 : 18;
      }
      if (isTitle) y += 6;
    });

    // Place embedded images below the text, scaled to fit the remaining space.
    for (const src of slide.images) {
      const { w, h } = await loadImageSize(src);
      if (w === 0 || h === 0) continue;
      imageCount += 1;

      const availH = pageH - margin - y;
      // If little vertical room remains, give the image a fresh page.
      if (availH < 90) {
        pdf.addPage("a4", "landscape");
        y = margin;
      }
      const maxH = pageH - margin - y;
      const ratio = w / h;
      let drawW = Math.min(contentW, w);
      let drawH = drawW / ratio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * ratio;
      }
      const x = margin + (contentW - drawW) / 2;
      const fmt = src.startsWith("data:image/png") ? "PNG" : "JPEG";
      try {
        pdf.addImage(src, fmt, x, y, drawW, drawH);
      } catch {
        // Skip images jsPDF can't decode rather than failing the whole export.
        continue;
      }
      y += drawH + 14;
    }

    // A slide with neither text nor images still gets a labelled blank page.
    if (slide.text.length === 0 && slide.images.length === 0) {
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(12);
      pdf.setTextColor(150);
      pdf.text("(No extractable text or images on this slide.)", margin, margin + 30);
      pdf.setTextColor(20);
    }
  }

  const blob = pdf.output("blob");
  const filename = baseName.replace(/\.pptx?$/i, "") + ".pdf";
  const file = new File([blob], filename, { type: "application/pdf" });
  return { file, slideCount: slides.length, imageCount, textCount };
}

/* ── Component ────────────────────────────────────────────────────────────── */

const HONESTY_NOTE = (
  <>
    This is an honest best-effort capture: it extracts each slide&apos;s text and embedded images and
    lays them out one slide per page. It is <span className="font-medium">not</span> a pixel-perfect
    render of PowerPoint&apos;s layout, exact fonts, positioning, SmartArt, charts and animations
    need a real Office engine. For a design-accurate PDF, use{" "}
    <span className="font-medium">File → Export → Create PDF/XPS</span> in PowerPoint or{" "}
    <span className="font-medium">File → Download → PDF Document</span> in Google Slides. Everything
    here runs in your browser. Nothing is uploaded.
  </>
);

export default function PptToPdfTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [status, setStatus] = React.useState("Working…");
  const [result, setResult] = React.useState<ConversionResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const reset = React.useCallback(() => {
    setPhase("idle");
    setResult(null);
    setError(null);
  }, []);

  const run = React.useCallback(async (file: File) => {
    setPhase("working");
    setError(null);
    setResult(null);
    try {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".pptx")) {
        throw new Error(
          name.endsWith(".ppt")
            ? "Legacy binary .ppt files aren't supported. Open it in PowerPoint or Google Slides and save it as .pptx (or export straight to PDF), then try again."
            : "Please choose a PowerPoint .pptx file.",
        );
      }
      setStatus("Opening and unzipping the presentation…");
      const slides = await parsePptx(file);
      setStatus(`Rendering ${slides.length} slide${slides.length === 1 ? "" : "s"} to PDF…`);
      const out = await slidesToPdf(slides, file.name);
      setResult(out);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed. Please try again.");
      setPhase("error");
    }
  }, []);

  const onFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (file) void run(file);
    },
    [run],
  );

  const doDownload = React.useCallback(() => {
    if (result) download(result.file.name, result.file, "application/pdf");
  }, [result]);

  return (
    <div className="flex flex-col gap-4">
      {/* Idle - drop zone */}
      {phase === "idle" && (
        <FileDropZone
          onFiles={onFiles}
          accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          icon="Presentation"
          label="Drop a PowerPoint .pptx here, click to browse, or paste"
          hint="Converted entirely in your browser. Nothing is uploaded"
          className="p-10"
        />
      )}

      {/* Persistent honesty note on the idle screen */}
      {phase === "idle" && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          <span>{HONESTY_NOTE}</span>
        </p>
      )}

      {/* Working */}
      {phase === "working" && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-4 py-14 text-center"
        >
          <Icon name="LoaderCircle" size={30} className="animate-spin text-primary" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-foreground">{status}</p>
            <p className="text-sm text-muted-foreground">
              This runs entirely in your browser; nothing is uploaded.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <Icon name="CircleAlert" size={22} className="mt-0.5 shrink-0 text-destructive" />
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">We couldn&apos;t convert your file</p>
              <p className="text-sm text-muted-foreground">
                {error ?? "Please check the file and try again."}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={reset} className="self-start">
            <Icon name="X" size={16} />
            Start over
          </Button>
        </div>
      )}

      {/* Done */}
      {phase === "done" && result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Icon name="CircleCheck" size={24} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-sm font-semibold text-foreground">{result.file.name}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatBytes(result.file.size)} · {result.slideCount} slide
                {result.slideCount === 1 ? "" : "s"}
                {result.imageCount > 0 ? ` · ${result.imageCount} image${result.imageCount === 1 ? "" : "s"}` : ""}
                {" "}· Ready to download
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={doDownload}>
                <Icon name="Download" size={16} />
                Download PDF
              </Button>
              <Button variant="outline" onClick={reset}>
                <Icon name="RotateCcw" size={16} />
                Convert another
              </Button>
            </div>
          </div>

          {/* Honesty caveat on the result screen */}
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            <span>{HONESTY_NOTE}</span>
          </p>

          <DocumentPreview file={result.file} kind="pdf" height={460} />
        </div>
      )}
    </div>
  );
}
