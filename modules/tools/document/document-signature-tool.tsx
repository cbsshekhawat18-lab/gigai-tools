"use client";

/**
 * Sign PDF, place a signature onto a PDF, entirely in the browser.
 *
 * Reuse map (no duplicated PDF code):
 *   - Page preview is rendered with pdf.js via `pageToCanvas` (@/lib/pdf/core).
 *   - The signed PDF is written with the shared engine's `addSignature`
 *     (@/lib/document-tools/pdfops), which stamps an image or typed text at a
 *  bottom-left-origin fractional position, exactly the model this UI edits.
 *
 * The signature is created three ways (draw / type / upload), then dragged and
 * resized over a rendered page. Position + size are held as page fractions so
 * they map straight onto `addSignature`'s x / y / size options. Nothing is
 * uploaded; pdf.js + pdf-lib are lazy-loaded inside the engine helpers.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import { DocumentDropzone, type DetectedFile } from "@/components/tool/document";
import { download } from "@/components/tool/dev";
import { openPdfDocument, pageToCanvas } from "@/lib/pdf/core";
import { addSignature, toPdfInput } from "@/lib/document-tools/pdfops";

/* ── Signature model ──────────────────────────────────────────────────────────
   A signature is exported as a transparent PNG (drawn/typed) or the raw bytes
   of an uploaded PNG. Placement is stored in PAGE FRACTIONS so it maps directly
   onto addSignature's { x, y, size } - resolution-independent, whatever scale
   the preview renders at. `x/y` are the bottom-left corner from the bottom-left
   origin (pdf-lib convention); the UI edits a top-left box and converts.
──────────────────────────────────────────────────────────────────────────── */

type SignatureMode = "draw" | "type" | "upload";

interface SignatureSource {
  /** Transparent PNG bytes to stamp. */
  bytes: Uint8Array;
  /** Data URL for on-screen preview. */
  url: string;
  /** Natural aspect ratio (height / width) to keep the box proportional. */
  aspect: number;
}

/** Placement in page fractions. `wFrac` is signature width ÷ page width. */
interface Placement {
  /** Left edge, fraction of page width from the left. */
  xFrac: number;
  /** Top edge, fraction of page height from the top. */
  yFrac: number;
  /** Width, fraction of page width. */
  wFrac: number;
}

const TYPED_FONTS: ReadonlyArray<{ value: string; label: string; css: string }> = [
  { value: "cursive-a", label: "Flowing", css: "'Segoe Script', 'Snell Roundhand', cursive" },
  { value: "cursive-b", label: "Classic", css: "'Brush Script MT', 'Apple Chancery', cursive" },
  { value: "serif", label: "Formal", css: "Georgia, 'Times New Roman', serif" },
];

const DEFAULT_PLACEMENT: Placement = { xFrac: 0.6, yFrac: 0.82, wFrac: 0.28 };

/* ── Helpers ──────────────────────────────────────────────────────────────── */

async function fileToPngBytes(file: File): Promise<{ bytes: Uint8Array; url: string; aspect: number }> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const url = URL.createObjectURL(file);
  const aspect = await new Promise<number>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.4);
    img.onerror = () => reject(new Error("That image couldn't be read."));
    img.src = url;
  });
  return { bytes: buf, url, aspect };
}

/** Render typed text to a tight transparent PNG. */
function typedTextToPng(text: string, cssFont: string): SignatureSource | null {
  const value = text.trim();
  if (!value) return null;
  const scale = 4; // supersample for crisp export
  const fontPx = 64;
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;
  measure.font = `${fontPx}px ${cssFont}`;
  const metrics = measure.measureText(value);
  const w = Math.ceil(metrics.width) + 32;
  const h = Math.ceil(fontPx * 1.6);
  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.font = `${fontPx}px ${cssFont}`;
  ctx.fillStyle = "#0d1a5a";
  ctx.textBaseline = "middle";
  ctx.fillText(value, 16, h / 2);
  const url = canvas.toDataURL("image/png");
  const bytes = dataUrlToBytes(url);
  return { bytes, url, aspect: h / w };
}

/** Trim a drawn canvas to its ink bounds and export a transparent PNG. */
function canvasToSignature(canvas: HTMLCanvasElement): SignatureSource | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3] ?? 0;
      if (alpha > 8) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return null;
  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  if (!octx) return null;
  octx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
  const url = out.toDataURL("image/png");
  return { bytes: dataUrlToBytes(url), url, aspect: h / w };
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* ── Draw pad ─────────────────────────────────────────────────────────────── */

function DrawPad({
  onCommit,
  onClear,
}: {
  onCommit: (sig: SignatureSource | null) => void;
  onClear: () => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawing = React.useRef(false);
  const last = React.useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = React.useState(false);

  const pointFromEvent = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointFromEvent(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !last.current) return;
    const p = pointFromEvent(e);
    ctx.strokeStyle = "#0d1a5a";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas) onCommit(canvasToSignature(canvas));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--tw-prose-hr,rgba(0,0,0,0.02))_10px,rgba(0,0,0,0.02)_20px)]">
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="h-40 w-full cursor-crosshair touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          aria-label="Signature drawing area"
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Draw your signature here
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name="Eraser" size={14} />
        Clear
      </button>
    </div>
  );
}

/* ── Page canvas + draggable signature ────────────────────────────────────── */

function SignedPageCanvas({
  file,
  page,
  signature,
  placement,
  onPlacementChange,
  ringClass,
}: {
  file: File;
  page: number;
  signature: SignatureSource | null;
  placement: Placement;
  onPlacementChange: (p: Placement) => void;
  ringClass: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [rendering, setRendering] = React.useState(true);
  const drag = React.useRef<
    | { type: "move"; startX: number; startY: number; startPlacement: Placement }
    | { type: "resize"; startX: number; startPlacement: Placement }
    | null
  >(null);

  React.useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    setRendering(true);
    (async () => {
      try {
        const doc = await openPdfDocument(file);
        try {
          const p = await doc.getPage(page);
          const canvas = await pageToCanvas(p, 1.4);
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
          if (blob && !cancelled) {
            url = URL.createObjectURL(blob);
            setImgUrl(url);
          }
        } finally {
          await doc.destroy();
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, page]);

  const rect = () => wrapRef.current?.getBoundingClientRect() ?? null;

  const onPointerMove = React.useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      const box = rect();
      if (!d || !box || box.width === 0 || box.height === 0) return;
      if (d.type === "move") {
        const dx = (e.clientX - d.startX) / box.width;
        const dy = (e.clientY - d.startY) / box.height;
        const wFrac = d.startPlacement.wFrac;
        const hFrac = wFrac * (signature?.aspect ?? 0.35) * (box.width / box.height);
        const xFrac = Math.min(Math.max(d.startPlacement.xFrac + dx, 0), 1 - wFrac);
        const yFrac = Math.min(Math.max(d.startPlacement.yFrac + dy, 0), 1 - hFrac);
        onPlacementChange({ xFrac, yFrac, wFrac });
      } else {
        const dx = (e.clientX - d.startX) / box.width;
        const wFrac = Math.min(Math.max(d.startPlacement.wFrac + dx, 0.05), 1 - d.startPlacement.xFrac);
        onPlacementChange({ ...d.startPlacement, wFrac });
      }
    },
    [onPlacementChange, signature],
  );

  const onPointerUp = React.useCallback(() => {
    drag.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const beginMove = (e: React.PointerEvent) => {
    e.preventDefault();
    drag.current = { type: "move", startX: e.clientX, startY: e.clientY, startPlacement: placement };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const beginResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    drag.current = { type: "resize", startX: e.clientX, startPlacement: placement };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  React.useEffect(
    () => () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp],
  );

  const box = rect();
  const sigHeightPct =
    box && box.width && box.height
      ? placement.wFrac * (signature?.aspect ?? 0.35) * (box.width / box.height) * 100
      : placement.wFrac * (signature?.aspect ?? 0.35) * 130;

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm"
      style={{ aspectRatio: "1 / 1.294" }}
    >
      {imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgUrl} alt={`Page ${page}`} className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {rendering ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="LoaderCircle" size={16} className="animate-spin" />
              Rendering page…
            </span>
          ) : (
            "Couldn't render this page."
          )}
        </div>
      )}

      {signature && imgUrl && (
        <div
          role="button"
          tabIndex={0}
          onPointerDown={beginMove}
          className={`group absolute cursor-move touch-none rounded-sm outline-none ring-1 ring-transparent hover:ring-2 focus-visible:ring-2 ${ringClass}`}
          style={{
            left: `${placement.xFrac * 100}%`,
            top: `${placement.yFrac * 100}%`,
            width: `${placement.wFrac * 100}%`,
            height: `${sigHeightPct}%`,
          }}
          aria-label="Signature: drag to move"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signature.url} alt="Your signature" className="h-full w-full object-contain" draggable={false} />
          <span
            onPointerDown={beginResize}
            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            aria-label="Resize signature"
          />
        </div>
      )}
    </div>
  );
}

/* ── Main tool ────────────────────────────────────────────────────────────── */

export default function DocumentSignatureTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(1);
  const [pageNum, setPageNum] = React.useState(1);

  const [mode, setMode] = React.useState<SignatureMode>("draw");
  const [signature, setSignature] = React.useState<SignatureSource | null>(null);
  // Revoke a replaced/cleared signature's blob URL (uploaded signatures mint
  // one via createObjectURL; typed/drawn ones use data: URLs, which the
  // `blob:` guard skips). Watch-effect + unmount sweep. No leaks, and no side
  // effects inside state updaters (Strict Mode safe).
  const prevSigUrl = React.useRef<string | null>(null);
  React.useEffect(() => {
    const prev = prevSigUrl.current;
    const curr = signature?.url ?? null;
    if (prev && prev !== curr && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
    prevSigUrl.current = curr;
  }, [signature]);
  React.useEffect(
    () => () => {
      if (prevSigUrl.current?.startsWith("blob:"))
        URL.revokeObjectURL(prevSigUrl.current);
    },
    [],
  );
  const [typedText, setTypedText] = React.useState("");
  const [typedFont, setTypedFont] = React.useState(TYPED_FONTS[0]!.value);

  const [placement, setPlacement] = React.useState<Placement>(DEFAULT_PLACEMENT);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fontUploadRef = React.useRef<HTMLInputElement | null>(null);

  // Load the PDF and its page count.
  const onFile = React.useCallback(async (detected: DetectedFile) => {
    setError(null);
    setFile(detected.file);
    setPageNum(1);
    setPlacement(DEFAULT_PLACEMENT);
    try {
      const doc = await openPdfDocument(detected.file);
      try {
        setPageCount(doc.numPages);
      } finally {
        await doc.destroy();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open that PDF.");
      setFile(null);
    }
  }, []);

  // Recompute the typed signature whenever text/font change (and we're in type mode).
  React.useEffect(() => {
    if (mode !== "type") return;
    const cssFont = TYPED_FONTS.find((f) => f.value === typedFont)?.css ?? "cursive";
    setSignature(typedTextToPng(typedText, cssFont));
  }, [mode, typedText, typedFont]);

  const onUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError(null);
    try {
      const { bytes, url, aspect } = await fileToPngBytes(f);
      setSignature({ bytes, url, aspect });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that image.");
    }
  };

  const switchMode = (next: SignatureMode) => {
    setMode(next);
    // Clear the previous surface's signature so the panels don't conflict.
    if (next !== "type") setSignature(null);
  };

  const reset = () => {
    setFile(null);
    setSignature(null);
    setTypedText("");
    setPageCount(1);
    setPageNum(1);
    setPlacement(DEFAULT_PLACEMENT);
    setError(null);
    setMode("draw");
  };

  const sign = async () => {
    if (!file || !signature) return;
    setBusy(true);
    setError(null);
    try {
      // UI stores the signature's TOP-LEFT box in top-origin fractions.
      // addSignature wants the BOTTOM-LEFT corner in bottom-origin fractions.
      // We approximate page aspect at A4 to convert the box height fraction.
      const doc = await openPdfDocument(file);
      let pageAspect = 1.294; // height / width, A4 fallback
      try {
        const p = await doc.getPage(pageNum);
        const vp = p.getViewport({ scale: 1 });
        pageAspect = vp.height / vp.width;
      } finally {
        await doc.destroy();
      }
      const hFrac = placement.wFrac * signature.aspect / pageAspect;
      const yBottom = Math.max(0, 1 - placement.yFrac - hFrac);

      const result = await addSignature(toPdfInput(file), {
        image: signature.bytes,
        imageType: "png",
        page: pageNum,
        x: placement.xFrac,
        y: yBottom,
        size: placement.wFrac,
      });
      if (!result.ok) throw new Error(result.error);
      download(result.result.name, result.result.blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ── Empty state ──────────────────────────────────────────────────────── */
  if (!file) {
    return (
      <div className="space-y-4">
        <DocumentDropzone
          accept={["pdf"]}
          onFile={onFile}
          label="Drop a PDF to sign"
          hint="or click to browse, your file never leaves your device"
          icon="PenLine"
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          This adds a visual e-signature (a stamped image or typed name). It is not a certificate-based digital
          signature: for a qualified/eIDAS-style certificate, use a dedicated signing provider.
        </p>
      </div>
    );
  }

  const canSign = Boolean(signature);

  /* ── Signing workspace ────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${style.soft}`}>
            <Icon name="FileText" size={15} className={style.text} />
          </span>
          <span className="max-w-[16rem] truncate font-medium text-foreground" title={file.name}>
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="RotateCcw" size={14} />
          Start over
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Page preview */}
        <div className="space-y-3">
          <SignedPageCanvas
            file={file}
            page={pageNum}
            signature={signature}
            placement={placement}
            onPlacementChange={setPlacement}
            ringClass={style.ring}
          />
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNum((n) => Math.max(1, n - 1))}
                disabled={pageNum <= 1}
                aria-label="Previous page"
              >
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <span className="tabular-nums text-muted-foreground">
                Page {pageNum} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNum((n) => Math.min(pageCount, n + 1))}
                disabled={pageNum >= pageCount}
                aria-label="Next page"
              >
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Drag the signature to position it; drag the corner handle to resize.
          </p>
        </div>

        {/* Signature builder */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Signature type">
            {(["draw", "type", "upload"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-md px-2 py-1.5 text-sm font-medium capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === "draw" && (
            <DrawPad onCommit={setSignature} onClear={() => setSignature(null)} />
          )}

          {mode === "type" && (
            <div className="space-y-3">
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type your name"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Typed signature text"
              />
              <div className="grid grid-cols-3 gap-1.5">
                {TYPED_FONTS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTypedFont(f.value)}
                    style={{ fontFamily: f.css }}
                    className={`truncate rounded-md border px-2 py-2 text-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                      typedFont === f.value ? `${style.border} ${style.soft}` : "border-border hover:bg-accent"
                    }`}
                    title={f.label}
                  >
                    {typedText.trim() || "Aa"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "upload" && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fontUploadRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="Upload" size={20} />
                {signature ? "Replace signature image" : "Upload a PNG signature"}
              </button>
              <input
                ref={fontUploadRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={onUploadSignature}
                className="sr-only"
              />
              <p className="text-xs text-muted-foreground">Use a PNG with a transparent background for a clean result.</p>
            </div>
          )}

          {signature && (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
              <div className="flex h-14 items-center justify-center rounded bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signature.url} alt="Signature preview" className="max-h-12 max-w-full object-contain" />
              </div>
            </div>
          )}

          <Button onClick={sign} disabled={!canSign || busy} className="w-full" size="lg">
            {busy ? (
              <>
                <Icon name="LoaderCircle" size={16} className="animate-spin" />
                Signing…
              </>
            ) : (
              <>
                <Icon name="Download" size={16} />
                {tool.ctaText ?? "Download signed PDF"}
              </>
            )}
          </Button>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Visual e-signature only. Not a certificate-based digital signature. Everything runs in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
