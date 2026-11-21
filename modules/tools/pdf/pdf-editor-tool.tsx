"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  fileToUint8Array,
  formatBytes,
  openPdfDocument,
  pageToCanvas,
  pdfDocToBlob,
} from "@/lib/pdf/core";
import { changeExtension } from "@/lib/pdf/types";
import { warmPdfRaster } from "@/lib/engine-preload";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import {
  extractTextRuns,
  findRunReplacements,
  type TextRun,
} from "@/lib/pdf/text";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";
import { Button } from "@/components/ui/button";

/* ── Annotation model ─────────────────────────────────────────────────────────

   Every mark is stored in NORMALISED page coordinates (0..1, origin at the
   TOP-LEFT of the page as it renders on screen). Normalising decouples the
   marks from the render scale and from each page's real point size, so the same
   annotation bakes correctly whether the page previews at 600px or 900px wide
   and whatever the PDF's own dimensions are. On export we multiply back up by
   each page's pdf-lib point size and flip Y (pdf-lib's origin is bottom-left).
──────────────────────────────────────────────────────────────────────────── */

type ToolKind =
  | "select"
  | "text"
  | "pen"
  | "highlight"
  | "rect"
  | "stamp"
  | "edittext";

/** A normalised point in [0,1] page space. */
interface NPoint {
  x: number;
  y: number;
}

interface BaseAnnotation {
  id: string;
  /** 1-based page the mark belongs to. */
  page: number;
  color: string;
}

interface TextAnnotation extends BaseAnnotation {
  kind: "text";
  at: NPoint;
  text: string;
  /** Font size as a fraction of page height (keeps text scale-independent). */
  sizeFrac: number;
}

interface StrokeAnnotation extends BaseAnnotation {
  kind: "pen";
  points: NPoint[];
  /** Line width as a fraction of the smaller page dimension. */
  widthFrac: number;
}

interface HighlightAnnotation extends BaseAnnotation {
  kind: "highlight";
  /** Two opposite corners of the swiped band. */
  from: NPoint;
  to: NPoint;
}

interface RectAnnotation extends BaseAnnotation {
  kind: "rect";
  from: NPoint;
  to: NPoint;
  /** Fill the rectangle (redaction-style) vs. outline only. */
  filled: boolean;
}

interface StampAnnotation extends BaseAnnotation {
  kind: "stamp";
  from: NPoint;
  to: NPoint;
  /** Object URL for on-screen preview. */
  url: string;
  /** Raw bytes + mime, kept so pdf-lib can embed the image on export. */
  bytes: Uint8Array;
  mime: string;
}

interface EditTextAnnotation extends BaseAnnotation {
  kind: "edittext";
  /** Id of the TextRun this edit replaces (one edit per run). */
  runId: string;
  /** Original run box in normalised [0,1] top-left space. */
  box: { x: number; y: number; w: number; h: number };
  /** Font height as a fraction of page height (drives the retyped size). */
  fontHeightFrac: number;
  originalStr: string;
  newStr: string;
  /** Cover color painted over the original text ("" = transparent/none). */
  bg: string;
  /** Retype weight/style, auto-detected from the run's source font, and user
      overridable via the inline editor's B/I toggles or Ctrl/Cmd+B / +I. */
  bold: boolean;
  italic: boolean;
}

type Annotation =
  | TextAnnotation
  | StrokeAnnotation
  | HighlightAnnotation
  | RectAnnotation
  | StampAnnotation
  | EditTextAnnotation;

/** A single rendered page + the geometry needed to place & bake marks. */
interface RenderedPage {
  page: number;
  dataUrl: string;
  /** Displayed aspect ratio (width / height) for the overlay box. */
  aspect: number;
}

const OUTPUT_SUFFIX = "-edited";
// 2x keeps large pages crisp in the taller viewport without risking the browser
// max-canvas / memory ceiling for typical letter/A4 pages (~1224x1584px here).
const RENDER_SCALE = 2;
const PALETTE = ["#1e1b4b", "#dc2626", "#2563eb", "#16a34a", "#f59e0b", "#000000"];
const HIGHLIGHT_DEFAULT = "#facc15";
/** Cover-color choices for the edit-text tool (backgrounds vary per PDF). */
const COVER_COLORS: { value: string; label: string }[] = [
  { value: "auto", label: "Auto (match page)" },
  { value: "#ffffff", label: "White" },
  { value: "#f3f4f6", label: "Light grey" },
  { value: "#000000", label: "Black" },
  { value: "", label: "None" },
];

/**
 * Decode a rendered page dataUrl into (downscaled) ImageData for background
 * sampling. Downscaled to ~800px wide: plenty for color sampling, ~10x less
 * memory than the 2x render (matters for Replace-all across many pages).
 */
async function imageDataFromDataUrl(dataUrl: string): Promise<ImageData> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, 800 / (img.naturalWidth || 800));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/**
 * Sample the page color AROUND a run box (median of a pixel ring outside the
 * padded cover area). The "Auto" cover color. Median is robust against the
 * ring nicking a neighbouring glyph.
 */
function sampleBoxBackground(
  data: ImageData,
  box: { x: number; y: number; w: number; h: number },
): string {
  const { width: W, height: H, data: px } = data;
  const x0 = Math.round(box.x * W);
  const y0 = Math.round(box.y * H);
  const x1 = Math.round((box.x + box.w) * W);
  const y1 = Math.round((box.y + box.h) * H);
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    rs.push(px[i] ?? 255);
    gs.push(px[i + 1] ?? 255);
    bs.push(px[i + 2] ?? 255);
  };
  // Ring sits beyond the padded cover rect so we never sample our own patch.
  for (let d = 3; d <= 6; d += 1) {
    for (let x = x0 - d; x <= x1 + d; x += 2) {
      push(x, y0 - d);
      push(x, y1 + d);
    }
    for (let y = y0 - d; y <= y1 + d; y += 2) {
      push(x0 - d, y);
      push(x1 + d, y);
    }
  }
  if (rs.length === 0) return "#ffffff";
  const med = (a: number[]) => {
    a.sort((m, n) => m - n);
    return a[a.length >> 1] ?? 255;
  };
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(med(rs))}${hx(med(gs))}${hx(med(bs))}`;
}

/** Relative luminance (WCAG) of a hex color. */
function hexLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * With an auto-sampled cover, make sure the retyped text stays readable: if the
 * user's ink color has almost no contrast against the sampled background
 * (e.g. navy text on a navy band), flip to white/near-black automatically.
 */
function autoTextColor(bgHex: string, chosen: string): string {
  const L1 = hexLuminance(bgHex);
  const L2 = hexLuminance(chosen);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  if (ratio >= 1.9) return chosen;
  return L1 > 0.45 ? "#111111" : "#ffffff";
}

/**
 * Original glyphs routinely overshoot the measured run box (ascenders,
 * descenders, antialiased edges) which left ghost slivers of the old text
 * around the cover. Pad the painted cover rect: the retyped text keeps the
 * ORIGINAL box, only the patch grows.
 */
function padCoverBox(box: { x: number; y: number; w: number; h: number }): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const padX = Math.max(0.0015, box.w * 0.02);
  const padT = box.h * 0.16;
  const padB = box.h * 0.24;
  const x = Math.max(0, box.x - padX);
  const y = Math.max(0, box.y - padT);
  return {
    x,
    y,
    w: Math.min(1 - x, box.w + 2 * padX),
    h: Math.min(1 - y, box.h + padT + padB),
  };
}

let annId = 0;
const nextAnnId = () => `a${(annId += 1)}`;

/** Convert a #rrggbb string to pdf-lib's 0..1 rgb triplet. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full || "000000", 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

/** Pointer position as a normalised [0,1] point within an element. */
function normalisedPoint(
  el: HTMLElement,
  clientX: number,
  clientY: number,
): NPoint {
  const rect = el.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
}

/** Clamp a scalar into [0,1]. */
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Translate a point by (dx, dy), clamped to the page. */
const shift = (p: NPoint, dx: number, dy: number): NPoint => ({
  x: clamp01(p.x + dx),
  y: clamp01(p.y + dy),
});

/**
 * Return a copy of `a` translated by (dx, dy) in normalised space, with every
 * coordinate clamped to [0,1]. Each kind moves its own geometry fields.
 */
function translateAnnotation(a: Annotation, dx: number, dy: number): Annotation {
  switch (a.kind) {
    case "text":
      return { ...a, at: shift(a.at, dx, dy) };
    case "pen":
      return { ...a, points: a.points.map((p) => shift(p, dx, dy)) };
    case "highlight":
    case "rect":
    case "stamp":
      return { ...a, from: shift(a.from, dx, dy), to: shift(a.to, dx, dy) };
    case "edittext":
      return {
        ...a,
        box: {
          ...a.box,
          x: clamp01(a.box.x + dx),
          y: clamp01(a.box.y + dy),
        },
      };
    default:
      return a;
  }
}

/** Normalised bounding box (top-left + size) of any annotation, for the outline. */
function annotationBounds(a: Annotation): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  switch (a.kind) {
    case "text":
      // Text has no intrinsic box; use a small handle anchored at its origin.
      return { x: a.at.x, y: a.at.y, w: 0, h: a.sizeFrac };
    case "pen": {
      const xs = a.points.map((p) => p.x);
      const ys = a.points.map((p) => p.y);
      const minX = xs.length ? Math.min(...xs) : 0;
      const minY = ys.length ? Math.min(...ys) : 0;
      const maxX = xs.length ? Math.max(...xs) : 0;
      const maxY = ys.length ? Math.max(...ys) : 0;
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case "highlight":
    case "rect":
    case "stamp":
      return {
        x: Math.min(a.from.x, a.to.x),
        y: Math.min(a.from.y, a.to.y),
        w: Math.abs(a.to.x - a.from.x),
        h: Math.abs(a.to.y - a.from.y),
      };
    case "edittext":
      return { x: a.box.x, y: a.box.y, w: a.box.w, h: a.box.h };
    default:
      return { x: 0, y: 0, w: 0, h: 0 };
  }
}

/* ── Per-page annotation overlay ──────────────────────────────────────────── */

interface PageEditorProps {
  rendered: RenderedPage;
  tool: ToolKind;
  color: string;
  stamp: { bytes: Uint8Array; mime: string; url: string } | null;
  annotations: Annotation[];
  onAdd: (a: Annotation) => void;
  /** Replace an existing annotation (by id), used by the select/move tool. */
  onUpdate: (a: Annotation) => void;
  /** Remove an annotation (by id), used by the select/delete tool. */
  onDelete: (id: string) => void;
  /** Create or update the edit-text annotation for a given run. */
  onEditText: (
    run: TextRun,
    newStr: string,
    style: { bold: boolean; italic: boolean },
  ) => void;
  /** Extracted text runs for this page (null = not yet loaded). */
  textRuns: TextRun[] | null;
  /** True while this page's runs are being extracted. */
  runsLoading: boolean;
  accentRing: string;
}

/**
 * One page: the rendered bitmap plus an interactive overlay. All drawing math is
 * done in normalised space so the SVG overlay scales with the responsive image.
 */
function PageEditor({
  rendered,
  tool,
  color,
  stamp,
  annotations,
  onAdd,
  onUpdate,
  onDelete,
  onEditText,
  textRuns,
  runsLoading,
  accentRing,
}: PageEditorProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const [draft, setDraft] = React.useState<NPoint[] | null>(null);
  const [drag, setDrag] = React.useState<{ from: NPoint; to: NPoint } | null>(
    null,
  );
  /** The run currently being edited via an inline input (null = none). */
  const [editingRun, setEditingRun] = React.useState<TextRun | null>(null);
  /** Click point where the floating text editor is open (null = closed). */
  const [textDraft, setTextDraft] = React.useState<NPoint | null>(null);
  /** Existing text mark being edited inline (null = not editing). */
  const [textEdit, setTextEdit] = React.useState<TextAnnotation | null>(null);
  /** Currently selected mark id in select mode (null = none). */
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  /** Live move-drag state: which mark, the down point, and its snapshot. */
  const moveRef = React.useRef<{
    id: string;
    start: NPoint;
    origin: Annotation;
  } | null>(null);
  const [moving, setMoving] = React.useState<Annotation | null>(null);

  const pageAnns = annotations.filter((a) => a.page === rendered.page);
  const editTextAnns = pageAnns.filter(
    (a): a is EditTextAnnotation => a.kind === "edittext",
  );
  const isDrawTool =
    tool === "pen" || tool === "highlight" || tool === "rect" || tool === "stamp";
  const isEditText = tool === "edittext";
  const isSelect = tool === "select";

  // Clear any selection and close the inline text editor when leaving select
  // mode (the edit-a-mark flow is reachable only from select mode).
  React.useEffect(() => {
    if (!isSelect) {
      setSelectedId(null);
      setTextEdit(null);
    }
  }, [isSelect]);

  // Close the floating text editor when the text tool is no longer active.
  React.useEffect(() => {
    if (tool !== "text") setTextDraft(null);
  }, [tool]);

  /** Begin dragging a committed mark (select mode only). */
  const startMove = (e: React.PointerEvent, a: Annotation) => {
    const surface = surfaceRef.current;
    if (!surface) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(a.id);
    surface.focus();
    // Capture on the SURFACE so its onPointerMove/onPointerUp drive the drag
    // (the mark div itself has no move/up handlers).
    surface.setPointerCapture(e.pointerId);
    const start = normalisedPoint(surface, e.clientX, e.clientY);
    moveRef.current = { id: a.id, start, origin: a };
    setMoving(a);
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current;
    if (!surface) return;

    // Select mode: a press on the bare surface (not on a mark, whose handler
    // stops propagation) clears the current selection. Never starts a draw.
    if (isSelect) {
      surface.focus();
      setSelectedId(null);
      return;
    }

    if (tool === "text") {
      // Open the modern floating editor at the click point (no window.prompt).
      // Ignore clicks while an editor is already open so the drop point sticks.
      if (textDraft) return;
      surface.focus();
      setTextDraft(normalisedPoint(surface, e.clientX, e.clientY));
      return;
    }

    if (tool === "stamp" && !stamp) return;
    if (!isDrawTool) return;

    e.preventDefault();
    surface.setPointerCapture(e.pointerId);
    const p = normalisedPoint(surface, e.clientX, e.clientY);
    if (tool === "pen") setDraft([p]);
    else setDrag({ from: p, to: p });
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const p = normalisedPoint(surface, e.clientX, e.clientY);
    // Select mode: translate the mark being dragged (live preview only).
    const mv = moveRef.current;
    if (isSelect && mv) {
      const dx = p.x - mv.start.x;
      const dy = p.y - mv.start.y;
      setMoving(translateAnnotation(mv.origin, dx, dy));
      return;
    }
    if (tool === "pen" && draft) setDraft((prev) => (prev ? [...prev, p] : [p]));
    else if (drag) setDrag((prev) => (prev ? { ...prev, to: p } : prev));
  };

  const handleUp = () => {
    // Select mode: commit a completed move-drag.
    if (moveRef.current) {
      if (moving) onUpdate(moving);
      moveRef.current = null;
      setMoving(null);
      return;
    }
    if (tool === "pen" && draft) {
      if (draft.length > 1) {
        onAdd({
          id: nextAnnId(),
          kind: "pen",
          page: rendered.page,
          points: draft,
          color,
          widthFrac: 0.004,
        });
      }
      setDraft(null);
      return;
    }
    if (drag) {
      const dx = Math.abs(drag.to.x - drag.from.x);
      const dy = Math.abs(drag.to.y - drag.from.y);
      // Ignore accidental micro-drags (a stray click).
      if (dx > 0.01 || dy > 0.01) {
        if (tool === "highlight") {
          onAdd({
            id: nextAnnId(),
            kind: "highlight",
            page: rendered.page,
            from: drag.from,
            to: drag.to,
            color: HIGHLIGHT_DEFAULT,
          });
        } else if (tool === "rect") {
          onAdd({
            id: nextAnnId(),
            kind: "rect",
            page: rendered.page,
            from: drag.from,
            to: drag.to,
            color,
            filled: false,
          });
        } else if (tool === "stamp" && stamp) {
          onAdd({
            id: nextAnnId(),
            kind: "stamp",
            page: rendered.page,
            from: drag.from,
            to: drag.to,
            color,
            url: stamp.url,
            bytes: stamp.bytes,
            mime: stamp.mime,
          });
        }
      }
      setDrag(null);
    }
  };

  const cursor =
    tool === "select"
      ? "cursor-default"
      : tool === "text" || tool === "edittext"
        ? "cursor-text"
        : "cursor-crosshair";

  // Keyboard on the surface: Delete/Backspace removes the selected mark,
  // Escape clears the selection (select mode only).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isSelect || !selectedId) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onDelete(selectedId);
      setSelectedId(null);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSelectedId(null);
    }
  };

  // The mark set to render: swap the mark being dragged for its live preview.
  const displayAnns =
    moving && moveRef.current
      ? pageAnns.map((a) => (a.id === moving.id ? moving : a))
      : pageAnns;
  const displayEditTextAnns = displayAnns.filter(
    (a): a is EditTextAnnotation => a.kind === "edittext",
  );

  /**
   * Open the inline floating editor over a text mark (double-click in select
   * mode), the same `TextDraftInput` used to add text, pre-filled with this
   * mark's current text, color, and size. Commit updates the mark in place;
   * an empty commit deletes it; cancel leaves it untouched.
   */
  const editTextMark = (a: TextAnnotation) => {
    setSelectedId(a.id);
    setTextEdit(a);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="tabular-nums">Page {rendered.page}</span>
        {pageAnns.length > 0 ? (
          <span className="rounded-full bg-muted px-2 py-0.5 tabular-nums">
            {pageAnns.length} mark{pageAnns.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div
        ref={surfaceRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onKeyDown={handleKeyDown}
        role="application"
        aria-label={`Annotation layer for page ${rendered.page}. Current tool: ${tool}.`}
        className={cn(
          "relative w-full touch-none select-none overflow-hidden rounded-lg border border-border bg-white shadow-sm outline-none",
          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          accentRing,
          cursor,
        )}
        style={{ aspectRatio: String(rendered.aspect), containerType: "size" }}
        tabIndex={0}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- in-browser data URL */}
        <img
          src={rendered.dataUrl}
          alt={`Page ${rendered.page}`}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* Vector overlay: all committed marks + the live draft, in 0..1 space. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {displayAnns.map((a) => (
            <AnnotationShape key={a.id} a={a} />
          ))}
          {draft && draft.length > 1 ? (
            <polyline
              points={draft.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {drag ? <DragPreview tool={tool} from={drag.from} to={drag.to} color={color} /> : null}
        </svg>

        {/* Text + stamp marks are rendered as positioned DOM for crisp preview.
            The mark being edited inline is hidden so the editor's live preview
            is the only copy on screen. */}
        {displayAnns.map((a) =>
          a.kind === "text" ? (
            a.id === textEdit?.id ? null : (
            <span
              key={`t-${a.id}`}
              className="pointer-events-none absolute whitespace-pre font-sans leading-none"
              style={{
                left: `${a.at.x * 100}%`,
                top: `${a.at.y * 100}%`,
                color: a.color,
                fontSize: `calc(${a.sizeFrac} * 100cqh)`,
              }}
            >
              {a.text}
            </span>
            )
          ) : a.kind === "stamp" ? (
            // eslint-disable-next-line @next/next/no-img-element -- object URL preview
            <img
              key={`s-${a.id}`}
              src={a.url}
              alt="Stamp"
              className="pointer-events-none absolute object-contain"
              style={{
                left: `${Math.min(a.from.x, a.to.x) * 100}%`,
                top: `${Math.min(a.from.y, a.to.y) * 100}%`,
                width: `${Math.abs(a.to.x - a.from.x) * 100}%`,
                height: `${Math.abs(a.to.y - a.from.y) * 100}%`,
              }}
              draggable={false}
            />
          ) : null,
        )}

        {/* Edit-text: committed edits (cover rect + retyped text), always shown. */}
        {displayEditTextAnns.map((a) => {
          if (a.runId === editingRun?.id) return null;
          const pad = a.bg ? padCoverBox(a.box) : null;
          return (
            <React.Fragment key={`e-${a.id}`}>
              {pad ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute"
                  style={{
                    left: `${pad.x * 100}%`,
                    top: `${pad.y * 100}%`,
                    width: `${pad.w * 100}%`,
                    height: `${pad.h * 100}%`,
                    backgroundColor: a.bg,
                  }}
                />
              ) : null}
              <span
                className="pointer-events-none absolute overflow-visible whitespace-pre font-sans leading-none"
                style={{
                  left: `${a.box.x * 100}%`,
                  top: `${a.box.y * 100}%`,
                  width: `${a.box.w * 100}%`,
                  height: `${a.box.h * 100}%`,
                  color: a.color,
                  fontSize: `calc(${a.fontHeightFrac} * 100cqh)`,
                  fontWeight: a.bold ? 700 : 400,
                  fontStyle: a.italic ? "italic" : "normal",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {a.newStr}
              </span>
            </React.Fragment>
          );
        })}

        {/* Edit-text tool: clickable targets over each extracted run. */}
        {isEditText && textRuns
          ? textRuns.map((run) => {
              const existing = editTextAnns.find((a) => a.runId === run.id);
              if (editingRun?.id === run.id) return null;
              return (
                <button
                  key={`rt-${run.id}`}
                  type="button"
                  aria-label={`Edit text: ${(existing?.newStr ?? run.str).slice(0, 40)}`}
                  onClick={() => setEditingRun(run)}
                  className={cn(
                    "absolute rounded-[1px] border border-dashed outline-none transition-colors",
                    "border-blue-400/60 bg-blue-400/10 hover:bg-blue-400/25",
                    "focus-visible:ring-2 focus-visible:ring-offset-1",
                    accentRing,
                  )}
                  style={{
                    left: `${run.x * 100}%`,
                    top: `${run.y * 100}%`,
                    width: `${run.w * 100}%`,
                    height: `${run.h * 100}%`,
                    minHeight: 8,
                  }}
                />
              );
            })
          : null}

        {/* Inline editor input positioned over the run being edited. */}
        {isEditText && editingRun ? (
          <RunInput
            key={`in-${editingRun.id}`}
            run={editingRun}
            color={color}
            initial={
              editTextAnns.find((a) => a.runId === editingRun.id)?.newStr ??
              editingRun.str
            }
            initialBold={
              editTextAnns.find((a) => a.runId === editingRun.id)?.bold ??
              editingRun.bold
            }
            initialItalic={
              editTextAnns.find((a) => a.runId === editingRun.id)?.italic ??
              editingRun.italic
            }
            onCommit={(value, style) => {
              onEditText(editingRun, value, style);
              setEditingRun(null);
            }}
            onCancel={() => setEditingRun(null)}
          />
        ) : null}

        {/* Text tool: floating in-canvas editor at the click point. */}
        {tool === "text" && textDraft ? (
          <TextDraftInput
            key={`td-${textDraft.x.toFixed(4)}-${textDraft.y.toFixed(4)}`}
            at={textDraft}
            color={color}
            onCommit={(text, sizeFrac) => {
              onAdd({
                id: nextAnnId(),
                kind: "text",
                page: rendered.page,
                at: textDraft,
                text,
                color,
                sizeFrac,
              });
              setTextDraft(null);
            }}
            onCancel={() => setTextDraft(null)}
          />
        ) : null}

        {/* Select tool: inline editor over the text mark being edited (double-
            click). Reuses TextDraftInput, pre-filled with the mark's text/size;
            commit updates it in place, empty deletes it, cancel leaves it. */}
        {isSelect && textEdit ? (
          <TextDraftInput
            key={`te-${textEdit.id}`}
            at={textEdit.at}
            color={textEdit.color}
            initialText={textEdit.text}
            initialSize={textEdit.sizeFrac}
            confirmLabel="Save text (Enter)"
            onCommit={(text, sizeFrac) => {
              onUpdate({ ...textEdit, text, sizeFrac });
              setTextEdit(null);
            }}
            onEmpty={() => {
              onDelete(textEdit.id);
              setSelectedId(null);
              setTextEdit(null);
            }}
            onCancel={() => setTextEdit(null)}
          />
        ) : null}

        {/* Select tool: interactive hit-targets to move / delete each mark.
            The mark being edited inline has no hit-target so pointer events
            reach its editor instead. */}
        {isSelect
          ? displayAnns.map((a) => {
              if (a.id === textEdit?.id) return null;
              const b = annotationBounds(a);
              const selected = a.id === selectedId;
              // Text marks have no real box; give them a grabbable min size.
              const isPointish = a.kind === "text";
              return (
                <div
                  key={`sel-${a.id}`}
                  role="button"
                  tabIndex={-1}
                  aria-label={`Move or delete ${a.kind} mark`}
                  onPointerDown={(e) => startMove(e, a)}
                  onDoubleClick={
                    a.kind === "text"
                      ? () => editTextMark(a)
                      : undefined
                  }
                  className={cn(
                    "absolute cursor-move touch-none rounded-[2px] outline-none",
                    selected
                      ? "ring-2 ring-blue-500"
                      : "hover:ring-1 hover:ring-blue-400/70",
                  )}
                  style={{
                    left: `${b.x * 100}%`,
                    top: `${b.y * 100}%`,
                    width: `${b.w * 100}%`,
                    height: `${b.h * 100}%`,
                    minWidth: isPointish ? 16 : 8,
                    minHeight: isPointish ? 12 : 8,
                  }}
                >
                  {selected ? (
                    <button
                      type="button"
                      aria-label={`Delete ${a.kind} mark`}
                      onPointerDown={(e) => {
                        // Don't start a move when hitting the delete button.
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(a.id);
                        setSelectedId(null);
                      }}
                      className="absolute -right-2 -top-2 z-10 inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shadow outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 hover:bg-blue-700"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  ) : null}
                </div>
              );
            })
          : null}

        {/* Loading / empty state for the text layer. */}
        {isEditText && runsLoading ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow">
            Reading text…
          </span>
        ) : isEditText && textRuns && textRuns.length === 0 ? (
          <span className="pointer-events-none absolute left-2 top-2 max-w-[90%] rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow">
            No selectable text found on this page (it may be scanned).
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Inline single-line editor rendered over a run box. Auto-sized to the run;
 * commits on Enter / blur, cancels on Escape. Kept at module scope (stable
 * component type) so it never remounts and steals focus on parent re-renders.
 */
function RunInput({
  run,
  initial,
  initialBold,
  initialItalic,
  color,
  onCommit,
  onCancel,
}: {
  run: TextRun;
  initial: string;
  /** Starting weight/style: an existing edit's choice, else the source font's. */
  initialBold: boolean;
  initialItalic: boolean;
  color: string;
  onCommit: (value: string, style: { bold: boolean; italic: boolean }) => void;
  onCancel: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState(initial);
  const [bold, setBold] = React.useState(initialBold);
  const [italic, setItalic] = React.useState(initialItalic);
  // Style state the blur-commit can read without stale closures (toggling via
  // the buttons blurs the input, which must not commit the OLD style).
  const styleRef = React.useRef({ bold: initialBold, italic: initialItalic });
  styleRef.current = { bold, italic };
  // Suppress the blur-commit while focus moves to the B/I toggles.
  const suppressBlur = React.useRef(false);

  React.useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const toggleProps = (
    active: boolean,
    label: string,
    onToggle: () => void,
  ) => ({
    type: "button" as const,
    "aria-pressed": active,
    "aria-label": label,
    onPointerDown: (e: React.PointerEvent) => {
      // Keep focus in the input: no blur, no lost selection.
      e.preventDefault();
      suppressBlur.current = true;
    },
    onClick: () => {
      onToggle();
      suppressBlur.current = false;
      inputRef.current?.focus();
    },
    className: cn(
      "inline-flex h-6 w-6 items-center justify-center rounded border text-xs leading-none transition-colors",
      active
        ? "border-blue-500 bg-blue-500 text-white"
        : "border-border bg-white text-foreground hover:bg-muted",
    ),
  });

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${run.x * 100}%`,
        top: `${run.y * 100}%`,
        minWidth: `${run.w * 100}%`,
      }}
    >
      {/* Mini style toolbar floated above the input. */}
      <div className="absolute -top-7 left-0 flex gap-1 rounded-md border border-border bg-white p-0.5 shadow">
        <button {...toggleProps(bold, "Bold (Ctrl/Cmd+B)", () => setBold((b) => !b))}>
          <span className="font-bold">B</span>
        </button>
        <button {...toggleProps(italic, "Italic (Ctrl/Cmd+I)", () => setItalic((i) => !i))}>
          <span className="italic">I</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="text"
        aria-label={`Replace text "${run.str}"`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
            setBold((b) => !b);
          } else if ((e.metaKey || e.ctrlKey) && (e.key === "i" || e.key === "I")) {
            e.preventDefault();
            setItalic((i) => !i);
          } else if (e.key === "Enter") {
            e.preventDefault();
            onCommit(value, styleRef.current);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={() => {
          if (suppressBlur.current) return;
          onCommit(value, styleRef.current);
        }}
        className="w-full rounded-[1px] border border-blue-500 bg-white px-0.5 font-sans leading-none text-foreground shadow outline-none"
        style={{
          height: `calc(${run.h} * 100cqh)`,
          minHeight: 16,
          fontSize: `calc(${run.fontHeightFrac} * 100cqh)`,
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? "italic" : "normal",
          color,
        }}
      />
    </div>
  );
}

/** Default text size as a fraction of page height, and its adjustable range. */
const TEXT_SIZE_DEFAULT = 0.028;
const TEXT_SIZE_MIN = 0.012;
const TEXT_SIZE_MAX = 0.08;
const TEXT_SIZE_STEP = 0.004;

/**
 * Floating in-canvas editor for the "text" tool. Positioned at a point in
 * normalised [0,1] page space, it grows a live preview in the chosen color at
 * the current size, with a tiny toolbar (size stepper + confirm / cancel).
 * Enter confirms, Escape cancels, empty text cancels. Mirrors `RunInput`'s
 * in-canvas styling so text entry feels consistent across the editor. Kept at
 * module scope (stable type) so it never remounts and steals focus.
 *
 * Serves BOTH flows with one component: adding a new text mark (empty initial
 * value, default size) and editing an existing mark (pre-filled text + its
 * size, autofocused with the text selected). `onCommit` decides which: the add
 * flow inserts a new annotation, the edit flow updates the existing one.
 */
function TextDraftInput({
  at,
  color,
  initialText = "",
  initialSize = TEXT_SIZE_DEFAULT,
  confirmLabel = "Add text (Enter)",
  onCommit,
  onCancel,
  onEmpty,
}: {
  at: NPoint;
  color: string;
  /** Pre-filled text (edit flow); empty for the add flow. */
  initialText?: string;
  /** Starting size fraction (edit flow reuses the mark's size). */
  initialSize?: number;
  /** Accessible label / title for the confirm button. */
  confirmLabel?: string;
  /** Fired with the typed text + chosen size fraction on confirm. */
  onCommit: (text: string, sizeFrac: number) => void;
  onCancel: () => void;
  /**
   * Confirming with empty text. The add flow omits it (an empty add is a no-op,
   * so it falls back to `onCancel`); the edit flow uses it to delete the mark.
   */
  onEmpty?: () => void;
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState(initialText);
  const [sizeFrac, setSizeFrac] = React.useState(initialSize);

  React.useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      // Select the pre-filled text so editing can overtype immediately.
      el.select();
    }
  }, []);

  const commit = () => {
    if (value.trim().length === 0) {
      // Empty confirm: delete (edit flow via onEmpty) or no-op (add flow).
      (onEmpty ?? onCancel)();
      return;
    }
    onCommit(value.trim(), sizeFrac);
  };

  const stepSize = (dir: 1 | -1) => {
    setSizeFrac((s) =>
      Math.min(
        TEXT_SIZE_MAX,
        Math.max(TEXT_SIZE_MIN, Math.round((s + dir * TEXT_SIZE_STEP) * 1000) / 1000),
      ),
    );
    inputRef.current?.focus();
  };

  // Anchor from the left, but flip to the right edge past the page midpoint so
  // the panel stays within the page on late clicks.
  const anchorRight = at.x > 0.6;
  const anchorBottom = at.y > 0.85;

  return (
    <div
      className="absolute z-20"
      style={{
        left: anchorRight ? undefined : `${at.x * 100}%`,
        right: anchorRight ? `${(1 - at.x) * 100}%` : undefined,
        top: anchorBottom ? undefined : `${at.y * 100}%`,
        bottom: anchorBottom ? `${(1 - at.y) * 100}%` : undefined,
      }}
      // Keep pointer events inside the editor from starting a draw on the surface.
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-zinc-900/95 p-1.5 shadow-xl shadow-black/40 backdrop-blur ring-1 ring-black/5">
        <textarea
          ref={inputRef}
          rows={1}
          aria-label="Text to add"
          value={value}
          placeholder="Type text…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter confirms; Shift+Enter inserts a newline. Escape cancels.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          // White "paper" field so the text shows in the chosen color exactly as
          // it will on the (white) PDF page; any color stays readable here.
          className="min-w-[9rem] max-w-[16rem] resize-none rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm font-medium leading-snug shadow-inner outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{ color }}
        />
        <div className="flex items-center gap-1">
          <div className="flex items-center rounded-md border border-white/10 bg-zinc-950/60">
            <button
              type="button"
              aria-label="Smaller text"
              onClick={() => stepSize(-1)}
              disabled={sizeFrac <= TEXT_SIZE_MIN + 1e-6}
              className="inline-flex size-6 items-center justify-center rounded-l-md text-zinc-300 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40"
            >
              <Icon name="Minus" size={13} />
            </button>
            <span className="min-w-[2.25rem] px-1 text-center text-[11px] font-medium tabular-nums text-zinc-400">
              {Math.round(sizeFrac * 1000)}
            </span>
            <button
              type="button"
              aria-label="Larger text"
              onClick={() => stepSize(1)}
              disabled={sizeFrac >= TEXT_SIZE_MAX - 1e-6}
              className="inline-flex size-6 items-center justify-center rounded-r-md text-zinc-300 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40"
            >
              <Icon name="Plus" size={13} />
            </button>
          </div>
          <span className="flex-1" />
          <button
            type="button"
            aria-label="Cancel (Escape)"
            title="Cancel (Esc)"
            onClick={onCancel}
            className="inline-flex size-6 items-center justify-center rounded-md text-zinc-300 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Icon name="X" size={14} />
          </button>
          <button
            type="button"
            aria-label={confirmLabel}
            title={confirmLabel}
            onClick={commit}
            className="inline-flex size-6 items-center justify-center rounded-md bg-blue-600 text-white outline-none transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Icon name="Check" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Render one committed vector annotation into the 0..100 SVG space. */
function AnnotationShape({ a }: { a: Annotation }) {
  if (a.kind === "pen") {
    return (
      <polyline
        points={a.points.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
        fill="none"
        stroke={a.color}
        strokeWidth={a.widthFrac * 100}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (a.kind === "highlight") {
    const x = Math.min(a.from.x, a.to.x) * 100;
    const y = Math.min(a.from.y, a.to.y) * 100;
    const w = Math.abs(a.to.x - a.from.x) * 100;
    const h = Math.abs(a.to.y - a.from.y) * 100;
    return <rect x={x} y={y} width={w} height={h} fill={a.color} opacity={0.4} />;
  }
  if (a.kind === "rect") {
    const x = Math.min(a.from.x, a.to.x) * 100;
    const y = Math.min(a.from.y, a.to.y) * 100;
    const w = Math.abs(a.to.x - a.from.x) * 100;
    const h = Math.abs(a.to.y - a.from.y) * 100;
    return (
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={a.filled ? a.color : "none"}
        stroke={a.color}
        strokeWidth={0.5}
      />
    );
  }
  return null;
}

/** Live preview of a drag-based tool while the pointer is down. */
function DragPreview({
  tool,
  from,
  to,
  color,
}: {
  tool: ToolKind;
  from: NPoint;
  to: NPoint;
  color: string;
}) {
  const x = Math.min(from.x, to.x) * 100;
  const y = Math.min(from.y, to.y) * 100;
  const w = Math.abs(to.x - from.x) * 100;
  const h = Math.abs(to.y - from.y) * 100;
  if (tool === "highlight") {
    return <rect x={x} y={y} width={w} height={h} fill={HIGHLIGHT_DEFAULT} opacity={0.4} />;
  }
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="none"
      stroke={color}
      strokeDasharray="1 1"
      strokeWidth={0.4}
    />
  );
}

/* ── Toolbar ──────────────────────────────────────────────────────────────── */

const TOOLS: { kind: ToolKind; icon: string; label: string }[] = [
  { kind: "select", icon: "MousePointer2", label: "Select" },
  { kind: "text", icon: "Type", label: "Text" },
  { kind: "pen", icon: "PencilLine", label: "Pen" },
  { kind: "highlight", icon: "Highlighter", label: "Highlight" },
  { kind: "rect", icon: "Square", label: "Rectangle" },
  { kind: "stamp", icon: "Stamp", label: "Stamp" },
  { kind: "edittext", icon: "TextCursorInput", label: "Edit text" },
];

/* ── The tool ─────────────────────────────────────────────────────────────── */

/**
 * PDF Editor, a page-based annotate + arrange studio.
 *
 * Flow: `usePdfTool` queues a single PDF; we render its pages to preview images
 * with pdf.js, collect annotations + page structure (rotate/delete/reorder) in
 * local state, and on run() we bake everything onto the real pages with pdf-lib.
 *
 * Honest scope: this annotates a LAYER above each page (text/ink/highlight/
 * shapes/stamps) and rearranges pages; it does NOT reflow the PDF's own text.
 */
export default function PdfEditorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [view, setView] = React.useState<"annotate" | "pages">("annotate");
  // Default to "edit text" so uploading a PDF drops the user straight into
  // click-a-word-to-edit mode (the most common intent).
  const [activeTool, setActiveTool] = React.useState<ToolKind>("edittext");
  const [color, setColor] = React.useState<string>(PALETTE[0] ?? "#000000");
  const [coverColor, setCoverColor] = React.useState<string>(
    COVER_COLORS[0]?.value ?? "#ffffff",
  );
  const [annotations, setAnnotations] = React.useState<Annotation[]>([]);
  // Per-page extracted text runs (lazy, cached) + which pages are loading.
  const [textRuns, setTextRuns] = React.useState<Record<number, TextRun[]>>({});
  const [runsLoading, setRunsLoading] = React.useState<Record<number, boolean>>(
    {},
  );
  const [pages, setPages] = React.useState<RenderedPage[]>([]);
  // Downscaled page pixels for "Auto" cover sampling (decoded lazily, per page).
  const pageImageDataRef = React.useRef(new Map<number, ImageData>());
  React.useEffect(() => {
    pageImageDataRef.current.clear();
  }, [pages]);
  const samplePageBg = React.useCallback(
    async (page: number, box: { x: number; y: number; w: number; h: number }) => {
      let data = pageImageDataRef.current.get(page);
      if (!data) {
        const rendered = pages[page - 1];
        if (!rendered) return "#ffffff";
        try {
          data = await imageDataFromDataUrl(rendered.dataUrl);
        } catch {
          return "#ffffff";
        }
        pageImageDataRef.current.set(page, data);
      }
      return sampleBoxBackground(data, box);
    },
    [pages],
  );
  const [rendering, setRendering] = React.useState(false);
  const [renderError, setRenderError] = React.useState<string | null>(null);

  // Find & Replace panel state.
  const [findTerm, setFindTerm] = React.useState("");
  const [replaceTerm, setReplaceTerm] = React.useState("");
  const [matchCase, setMatchCase] = React.useState(false);
  const [frCover, setFrCover] = React.useState<string>(
    COVER_COLORS[0]?.value ?? "#ffffff",
  );
  const [frBusy, setFrBusy] = React.useState(false);
  const [frResult, setFrResult] = React.useState<string | null>(null);

  // Page-structure edits (applied together with annotations on export).
  const [order, setOrder] = React.useState<number[]>([]);
  const [rotations, setRotations] = React.useState<Record<number, number>>({});
  const [deleted, setDeleted] = React.useState<number[]>([]);

  // Current stamp image (uploaded once, reused for every placement).
  const [stamp, setStamp] = React.useState<{
    bytes: Uint8Array;
    mime: string;
    url: string;
  } | null>(null);
  const stampUrlRef = React.useRef<string | null>(null);

  // A stable snapshot of state for the async process() to read at export time.
  const editRef = React.useRef({ annotations, order, rotations, deleted });
  React.useEffect(() => {
    editRef.current = { annotations, order, rotations, deleted };
  }, [annotations, order, rotations, deleted]);

  const state = usePdfTool({
    slug: tool.slug,
    warm: warmPdfRaster,
    accept: "application/pdf",
    multiple: false,
    zipName: "pdf-editor-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) throw new Error("Add a PDF to edit first.");
      const edited = await bakeAnnotations(input, editRef.current);
      return [edited];
    },
  });

  const activeFile = state.files[0]?.file ?? null;

  // Render page previews whenever a new file is queued; reset all edit state.
  React.useEffect(() => {
    if (!activeFile) {
      setPages([]);
      setAnnotations([]);
      setOrder([]);
      setRotations({});
      setDeleted([]);
      setTextRuns({});
      setRunsLoading({});
      setFrResult(null);
      return;
    }
    let cancelled = false;
    setRendering(true);
    setRenderError(null);
    setAnnotations([]);
    setRotations({});
    setDeleted([]);
    setTextRuns({});
    setRunsLoading({});
    setFrResult(null);

    renderPreviews(activeFile)
      .then((result) => {
        if (cancelled) return;
        setPages(result);
        setOrder(result.map((p) => p.page));
        setRendering(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setRenderError(
          err instanceof Error ? err.message : "We couldn't open this PDF.",
        );
        setRendering(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFile]);

  // Release the previous stamp object URL when it changes / on unmount.
  React.useEffect(() => {
    return () => {
      if (stampUrlRef.current) URL.revokeObjectURL(stampUrlRef.current);
    };
  }, []);

  const addAnnotation = React.useCallback((a: Annotation) => {
    setAnnotations((prev) => [...prev, a]);
  }, []);

  // Replace an annotation in place (by id): the select/move + edit callbacks.
  const updateAnnotation = React.useCallback((a: Annotation) => {
    setAnnotations((prev) => prev.map((p) => (p.id === a.id ? a : p)));
  }, []);

  // Remove an annotation (by id), the select/delete callback.
  const deleteAnnotation = React.useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Create or update the edit-text annotation for a run. An empty replacement
  // still commits (covers the original with a blank), matching a "whiteout".
  const editText = React.useCallback(
    async (
      run: TextRun,
      page: number,
      newStr: string,
      bg: string,
      textColor: string,
      style?: { bold: boolean; italic: boolean },
    ) => {
      // "Auto" cover: sample the page behind the run; keep the text readable.
      if (bg === "auto") {
        bg = await samplePageBg(page, { x: run.x, y: run.y, w: run.w, h: run.h });
        textColor = autoTextColor(bg, textColor);
      }
      setAnnotations((prev) => {
        const rest = prev.filter(
          (a) => !(a.kind === "edittext" && a.runId === run.id),
        );
        const edit: EditTextAnnotation = {
          id: nextAnnId(),
          kind: "edittext",
          page,
          runId: run.id,
          box: { x: run.x, y: run.y, w: run.w, h: run.h },
          fontHeightFrac: run.fontHeightFrac,
          originalStr: run.str,
          newStr,
          color: textColor,
          bg,
          // Style: explicit user choice wins; else match the source font.
          bold: style?.bold ?? run.bold,
          italic: style?.italic ?? run.italic,
        };
        return [...rest, edit];
      });
    },
    [samplePageBg],
  );

  // Find & Replace: scan every page's text runs and, for each run that contains
  // the find term, generate the SAME edittext annotation click-to-edit produces
  // (cover the run + retype the replaced string). Existing edittext annotations
  // for a touched run are replaced; all other marks are left untouched.
  const replaceAll = React.useCallback(async () => {
    if (!activeFile) return;
    const find = findTerm;
    if (find.length === 0) return;

    setFrBusy(true);
    setFrResult(null);
    try {
      const pageCount = pages.length;
      const newEdits: EditTextAnnotation[] = [];
      let totalMatches = 0;
      const pagesTouched = new Set<number>();
      let anyRunsFound = false;

      // For every page, extract its runs and compute the per-run replacement
      // strings needed to replace EVERY occurrence (handles cross-run splits,
      // multiple matches per run, and case-insensitivity in `findRunReplacements`).
      for (let page = 1; page <= pageCount; page += 1) {
        const runs = await extractTextRuns(activeFile, page);
        if (runs.length > 0) anyRunsFound = true;
        const { count, replacements } = findRunReplacements(
          runs,
          find,
          replaceTerm,
          matchCase,
        );
        if (count === 0) continue;
        totalMatches += count;
        pagesTouched.add(page);

        for (const { run, newStr } of replacements) {
          let bg = frCover;
          let inkColor = color;
          if (frCover === "auto") {
            bg = await samplePageBg(page, { x: run.x, y: run.y, w: run.w, h: run.h });
            inkColor = autoTextColor(bg, color);
          }
          newEdits.push({
            id: nextAnnId(),
            kind: "edittext",
            page,
            runId: run.id,
            box: { x: run.x, y: run.y, w: run.w, h: run.h },
            fontHeightFrac: run.fontHeightFrac,
            originalStr: run.str,
            newStr,
            color: inkColor,
            bg,
            // Match the replaced run's weight/style (e.g. bold headings).
            bold: run.bold,
            italic: run.italic,
          });
        }
      }

      if (totalMatches === 0) {
        setFrResult(
          anyRunsFound
            ? `No matches for “${find}”.`
            : "No selectable text. This PDF may be scanned. Run OCR first.",
        );
        return;
      }

      // Merge: drop any prior edittext annotation for a touched run, keep every
      // other annotation, then append the freshly generated edits. This mutates
      // `annotations`, which the page overlays render from, so the preview
      // refreshes immediately.
      const touchedRunIds = new Set(newEdits.map((e) => e.runId));
      setAnnotations((prev) => [
        ...prev.filter(
          (a) => !(a.kind === "edittext" && touchedRunIds.has(a.runId)),
        ),
        ...newEdits,
      ]);

      const pageWord = pagesTouched.size === 1 ? "page" : "pages";
      const matchWord = totalMatches === 1 ? "match" : "matches";
      setFrResult(
        `Replaced ${totalMatches} ${matchWord} on ${pagesTouched.size} ${pageWord}.`,
      );
    } catch {
      setFrResult("We couldn't scan this PDF's text. Please try again.");
    } finally {
      setFrBusy(false);
    }
  }, [activeFile, findTerm, replaceTerm, matchCase, color, frCover, pages.length, samplePageBg]);

  // Lazily extract + cache the text runs for a page when the edit-text tool is
  // active and the page becomes visible.
  const ensureTextRuns = React.useCallback(
    (page: number) => {
      if (!activeFile) return;
      setTextRuns((prevRuns) => {
        if (prevRuns[page]) return prevRuns;
        setRunsLoading((prevLoading) => {
          if (prevLoading[page]) return prevLoading;
          extractTextRuns(activeFile, page)
            .then((runs) => {
              setTextRuns((r) => ({ ...r, [page]: runs }));
            })
            .catch(() => {
              setTextRuns((r) => ({ ...r, [page]: [] }));
            })
            .finally(() => {
              setRunsLoading((l) => ({ ...l, [page]: false }));
            });
          return { ...prevLoading, [page]: true };
        });
        return prevRuns;
      });
    },
    [activeFile],
  );

  const undo = React.useCallback(() => {
    setAnnotations((prev) => prev.slice(0, -1));
  }, []);

  const clearMarks = React.useCallback(() => {
    setAnnotations([]);
  }, []);

  // Keyboard: Cmd/Ctrl+Z = undo, number keys pick tools when annotating.
  React.useEffect(() => {
    if (state.phase !== "ready" || view !== "annotate") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      const idx = Number(e.key);
      if (Number.isInteger(idx) && idx >= 1 && idx <= TOOLS.length) {
        const picked = TOOLS[idx - 1];
        if (picked) setActiveTool(picked.kind);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, view, undo]);

  const onStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void file.arrayBuffer().then((buf) => {
      if (stampUrlRef.current) URL.revokeObjectURL(stampUrlRef.current);
      const url = URL.createObjectURL(file);
      stampUrlRef.current = url;
      setStamp({ bytes: new Uint8Array(buf), mime: file.type, url });
      setActiveTool("stamp");
    });
  };

  const visiblePages = React.useMemo(
    () => pages.filter((p) => !deleted.includes(p.page)),
    [pages, deleted],
  );

  // When the edit-text tool is active, warm the text-run cache for every
  // visible page so its clickable targets appear without a per-page click.
  React.useEffect(() => {
    if (activeTool !== "edittext") return;
    for (const p of visiblePages) ensureTextRuns(p.page);
  }, [activeTool, visiblePages, ensureTextRuns]);

  const totalMarks = annotations.length;
  const structuralEdits =
    deleted.length +
    Object.values(rotations).filter((d) => d % 360 !== 0).length +
    (order.some((p, i) => p !== i + 1) ? 1 : 0);

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="PenLine"
      dropHint="Open one PDF to annotate and rearrange"
      processLabel="Export edited PDF"
      resultHint="Marks are baked onto the pages in your browser. Nothing is uploaded."
    >
      {/* View switcher: draw on pages vs. manage the page set. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Editor mode"
          className="inline-flex rounded-lg border border-border bg-muted/40 p-1"
        >
          {(["annotate", "pages"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.ring,
                view === v
                  ? cn("bg-background text-foreground shadow-sm")
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name={v === "annotate" ? "PencilLine" : "LayoutGrid"} size={15} />
              {v === "annotate" ? "Annotate" : "Pages"}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {totalMarks} mark{totalMarks === 1 ? "" : "s"}
          {structuralEdits > 0 ? ` · ${visiblePages.length} pages` : ""}
        </p>
      </div>

      {/* Higher-fidelity editing route for heavy text changes. */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-start gap-2 text-muted-foreground">
          <Icon name="FileType2" size={16} className={cn("mt-0.5", style.text)} />
          <span>
            Need to change a lot of text or keep exact formatting? Convert your
            PDF to an editable Word document, edit it, then convert back.
          </span>
        </span>
        <span className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/pdf-to-word">PDF to Word</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/word-to-pdf">Word to PDF</Link>
          </Button>
        </span>
      </div>

      {rendering ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 py-16 text-sm text-muted-foreground"
        >
          <Icon name="LoaderCircle" size={18} className={cn("animate-spin", style.text)} />
          Rendering pages…
        </div>
      ) : renderError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {renderError}
        </p>
      ) : (
        <>
          {view === "annotate" ? (
            <div
              key="annotate"
              className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
            >
              {/* Toolbar: tools + color + stamp upload + undo/clear. */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-2">
                <div role="toolbar" aria-label="Drawing tools" className="flex flex-wrap gap-1">
                  {TOOLS.map((t, i) => {
                    const active = activeTool === t.kind;
                    return (
                      <button
                        key={t.kind}
                        type="button"
                        aria-pressed={active}
                        aria-label={`${t.label} tool (shortcut ${i + 1})`}
                        title={`${t.label} (${i + 1})`}
                        onClick={() => setActiveTool(t.kind)}
                        className={cn(
                          "inline-flex size-9 items-center justify-center rounded-lg border text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          style.ring,
                          active
                            ? cn(style.solid, "border-transparent text-white")
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon name={t.icon} size={16} />
                      </button>
                    );
                  })}
                </div>

                <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

                {/* Color swatches (drives text / pen / rectangle). */}
                <div className="flex items-center gap-1" role="group" aria-label="Color">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      aria-pressed={color === c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "size-7 rounded-full border-2 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:scale-110",
                        style.ring,
                        color === c ? "border-foreground" : "border-border",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

                <Button type="button" variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Icon name="ImagePlus" size={15} />
                    {stamp ? "Change stamp" : "Upload stamp"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      onChange={onStampUpload}
                    />
                  </label>
                </Button>

                {activeTool === "edittext" ? (
                  <>
                    <span
                      className="mx-1 hidden h-6 w-px bg-border sm:block"
                      aria-hidden="true"
                    />
                    <div
                      className="flex items-center gap-1.5"
                      role="group"
                      aria-label="Cover color"
                    >
                      <label
                        htmlFor="edittext-cover"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Cover
                      </label>
                      <select
                        id="edittext-cover"
                        value={coverColor}
                        onChange={(e) => setCoverColor(e.target.value)}
                        className={cn(
                          "h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          style.ring,
                        )}
                      >
                        {COVER_COLORS.map((c) => (
                          <option key={c.label} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : null}

                <span className="flex-1" />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={totalMarks === 0}
                >
                  <Icon name="Undo2" size={15} />
                  Undo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearMarks}
                  disabled={totalMarks === 0}
                >
                  <Icon name="Eraser" size={15} />
                  Clear marks
                </Button>
              </div>

              {/* Find & Replace: bulk edit-text generation across all pages. */}
              <section
                aria-label="Find and replace text"
                className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon name="Replace" size={16} className={style.text} />
                  Find &amp; Replace
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <div className="flex flex-1 flex-col gap-1 sm:min-w-[10rem]">
                    <label
                      htmlFor="fr-find"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Find
                    </label>
                    <input
                      id="fr-find"
                      type="text"
                      value={findTerm}
                      onChange={(e) => setFindTerm(e.target.value)}
                      placeholder="Text to find"
                      className={cn(
                        "h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                      )}
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-1 sm:min-w-[10rem]">
                    <label
                      htmlFor="fr-replace"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Replace with
                    </label>
                    <input
                      id="fr-replace"
                      type="text"
                      value={replaceTerm}
                      onChange={(e) => setReplaceTerm(e.target.value)}
                      placeholder="Replacement text"
                      className={cn(
                        "h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="fr-cover"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Cover color
                    </label>
                    <select
                      id="fr-cover"
                      value={frCover}
                      onChange={(e) => setFrCover(e.target.value)}
                      className={cn(
                        "h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                      )}
                    >
                      {COVER_COLORS.map((c) => (
                        <option key={c.label} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label
                    htmlFor="fr-match-case"
                    className="flex h-9 items-center gap-2 text-sm text-muted-foreground"
                  >
                    <input
                      id="fr-match-case"
                      type="checkbox"
                      checked={matchCase}
                      onChange={(e) => setMatchCase(e.target.checked)}
                      className={cn(
                        "size-4 rounded border-border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        style.ring,
                      )}
                    />
                    Match case
                  </label>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void replaceAll()}
                    disabled={frBusy || findTerm.length === 0}
                    aria-label="Replace all matches across every page"
                    aria-busy={frBusy}
                  >
                    {frBusy ? (
                      <Icon name="LoaderCircle" size={15} className="animate-spin" />
                    ) : (
                      <Icon name="Replace" size={15} />
                    )}
                    {frBusy ? "Replacing…" : "Replace all"}
                  </Button>
                </div>

                <p
                  role="status"
                  aria-live="polite"
                  className="min-h-[1.25rem] text-xs text-muted-foreground"
                >
                  {frResult ?? ""}
                </p>

                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon name="Info" size={14} className={cn("mt-0.5", style.text)} />
                  Find &amp; Replace covers the old text and retypes the new. Works
                  best on simple PDFs with plain backgrounds and standard fonts.
                  Very long replacements may overrun; scanned PDFs have no
                  selectable text. Review the preview, then use{" "}
                  <span className="font-medium text-foreground">Export edited PDF</span>{" "}
                  to download the final file.
                </p>
              </section>

              {/* Contextual hint for the active tool. */}
              <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Icon name="Info" size={14} className={style.text} />
                {activeTool === "select"
                  ? "Select mode. Click a mark to move it (drag), double-click text to edit, or press Delete to remove it. Press 1–7 to pick a tool."
                  : activeTool === "text"
                    ? "Click a spot on the page, type your text, adjust the size, then press Enter (Esc to cancel). Move it later with the Select tool."
                    : activeTool === "pen"
                      ? "Drag to draw freehand. Great for a quick signature."
                      : activeTool === "highlight"
                        ? "Drag across text to lay a translucent highlight."
                        : activeTool === "rect"
                          ? "Drag to draw a rectangle. Use black to cover an area."
                          : activeTool === "edittext"
                            ? "Click text to edit it. Best on simple PDFs with plain backgrounds: the old text is covered and retyped."
                            : stamp
                              ? "Drag a box on the page to place your stamp image."
                              : "Upload a PNG or JPG stamp, then drag to place it."}
              </p>

              {/* The pages, each with an interactive overlay. */}
              <div className="flex max-h-[88vh] flex-col gap-6 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
                {visiblePages.map((p) => (
                  <PageEditor
                    key={p.page}
                    rendered={p}
                    tool={activeTool}
                    color={color}
                    stamp={stamp}
                    annotations={annotations}
                    onAdd={addAnnotation}
                    onUpdate={updateAnnotation}
                    onDelete={deleteAnnotation}
                    onEditText={(run, newStr, style) =>
                      void editText(run, p.page, newStr, coverColor, color, style)
                    }
                    textRuns={textRuns[p.page] ?? null}
                    runsLoading={runsLoading[p.page] ?? false}
                    accentRing={style.ring}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              key="pages"
              className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
            >
              <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Icon name="Info" size={14} className={style.text} />
                Rotate, delete or drag pages to reorder. Deleting a page also
                drops any marks you made on it.
              </p>

              {activeFile ? (
                <PdfPageGrid
                  file={activeFile}
                  accent={tool.accent}
                  order={order}
                  onReorder={setOrder}
                  rotations={rotations}
                  onRotateChange={setRotations}
                  selected={deleted}
                  onSelectChange={setDeleted}
                />
              ) : null}

              <p className="text-xs text-muted-foreground">
                Selected (checked) pages are marked for deletion. Uncheck to keep.
              </p>
            </div>
          )}
        </>
      )}

      {/* Summary strip. */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Icon name="FileText" size={16} className={style.text} />
          {state.files[0]
            ? `${state.files[0].name} · ${formatBytes(state.files[0].size)}`
            : "No file"}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            style.soft,
          )}
        >
          <Icon name="Sparkles" size={13} />
          {totalMarks + structuralEdits === 0
            ? "No edits yet"
            : `${totalMarks} mark${totalMarks === 1 ? "" : "s"}${
                structuralEdits > 0 ? " + page changes" : ""
              } ready`}
        </span>
      </div>
    </PdfWorkspace>
  );
}

/* ── Rendering & baking (pdf.js in, pdf-lib out) ──────────────────────────── */

/** Render every page of a File to a preview data URL + aspect ratio. */
async function renderPreviews(file: File): Promise<RenderedPage[]> {
  const doc = await openPdfDocument(file);
  const out: RenderedPage[] = [];
  try {
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const canvas = await pageToCanvas(page, RENDER_SCALE);
      out.push({
        page: n,
        dataUrl: canvas.toDataURL("image/png"),
        aspect: canvas.width / Math.max(1, canvas.height),
      });
      page.cleanup();
    }
    return out;
  } finally {
    await doc.loadingTask.destroy();
  }
}

interface EditState {
  annotations: Annotation[];
  order: number[];
  rotations: Record<number, number>;
  deleted: number[];
}

/**
 * Bake annotations + structural edits onto the real PDF with pdf-lib.
 *
 * Steps: load the source, decide the surviving page order (respecting deletes
 * and reorder), draw each page's marks in that page's point space (flipping Y),
 * apply per-page rotation, and assemble a fresh document. Coordinates come in
 * normalised [0,1] top-left space and are scaled to each page's real size.
 */
async function bakeAnnotations(
  input: PdfInput,
  edit: EditState,
): Promise<NamedBlob> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");

  const srcBytes = await fileToUint8Array(input.file);
  const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const total = src.getPageCount();

  // Surviving pages, in the user's order, dropping any deleted ones.
  const deleted = new Set(edit.deleted);
  const requested = edit.order.length > 0 ? edit.order : range(1, total);
  const survivors = requested.filter(
    (n) => n >= 1 && n <= total && !deleted.has(n),
  );
  if (survivors.length === 0) {
    throw new Error("Every page is deleted. Keep at least one page to export.");
  }

  const outDoc = await PDFDocument.create();
  // Base-14 fonts carry no glyph payload, so embedding all four variants is
  // effectively free. Retyped text can then match the source weight/style.
  const font = await outDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await outDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await outDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldOblique = await outDoc.embedFont(
    StandardFonts.HelveticaBoldOblique,
  );
  const pickFont = (bold: boolean, italic: boolean) =>
    bold && italic ? fontBoldOblique : bold ? fontBold : italic ? fontOblique : font;

  // Cache embedded stamp images by their bytes so repeats embed once.
  const stampCache = new Map<Uint8Array, Awaited<ReturnType<typeof outDoc.embedPng>>>();

  const copied = await outDoc.copyPages(
    src,
    survivors.map((n) => n - 1),
  );

  for (let i = 0; i < survivors.length; i += 1) {
    const sourcePage = survivors[i]!;
    const page = copied[i]!;
    outDoc.addPage(page);

    const { width, height } = page.getSize();
    const marks = edit.annotations.filter((a) => a.page === sourcePage);

    for (const a of marks) {
      if (a.kind === "text") {
        const size = a.sizeFrac * height;
        const { r, g, b } = hexToRgb(a.color);
        page.drawText(a.text, {
          x: a.at.x * width,
          // Normalised Y is top-down; pdf-lib is bottom-up. Offset by size so
          // the text's top sits where the box was dropped.
          y: height - a.at.y * height - size,
          size,
          font,
          color: rgb(r, g, b),
        });
      } else if (a.kind === "pen") {
        const { r, g, b } = hexToRgb(a.color);
        const thickness = a.widthFrac * Math.min(width, height);
        for (let p = 1; p < a.points.length; p += 1) {
          const p0 = a.points[p - 1]!;
          const p1 = a.points[p]!;
          page.drawLine({
            start: { x: p0.x * width, y: height - p0.y * height },
            end: { x: p1.x * width, y: height - p1.y * height },
            thickness,
            color: rgb(r, g, b),
          });
        }
      } else if (a.kind === "highlight" || a.kind === "rect") {
        const x0 = Math.min(a.from.x, a.to.x) * width;
        const y1 = height - Math.min(a.from.y, a.to.y) * height;
        const w = Math.abs(a.to.x - a.from.x) * width;
        const h = Math.abs(a.to.y - a.from.y) * height;
        const { r, g, b } = hexToRgb(a.color);
        if (a.kind === "highlight") {
          page.drawRectangle({
            x: x0,
            y: y1 - h,
            width: w,
            height: h,
            color: rgb(r, g, b),
            opacity: 0.4,
          });
        } else {
          page.drawRectangle({
            x: x0,
            y: y1 - h,
            width: w,
            height: h,
            ...(a.filled
              ? { color: rgb(r, g, b) }
              : { borderColor: rgb(r, g, b), borderWidth: 1.5 }),
          });
        }
      } else if (a.kind === "stamp") {
        let image = stampCache.get(a.bytes);
        if (!image) {
          image = a.mime.includes("png")
            ? await outDoc.embedPng(a.bytes)
            : await outDoc.embedJpg(a.bytes);
          stampCache.set(a.bytes, image);
        }
        const x0 = Math.min(a.from.x, a.to.x) * width;
        const y0 = Math.min(a.from.y, a.to.y) * height;
        const w = Math.abs(a.to.x - a.from.x) * width;
        const h = Math.abs(a.to.y - a.from.y) * height;
        page.drawImage(image, {
          x: x0,
          y: height - y0 - h,
          width: w,
          height: h,
        });
      } else if (a.kind === "edittext") {
        const x0 = a.box.x * width;
        const boxTopY = height - a.box.y * height;
        const h = a.box.h * height;
        // 1) Cover the original text with the chosen background color. The
        //  rect is PADDED (glyphs overshoot the measured box), mirrors the
        //    on-screen preview exactly.
        if (a.bg) {
          const pad = padCoverBox(a.box);
          const { r, g, b } = hexToRgb(a.bg);
          page.drawRectangle({
            x: pad.x * width,
            y: height - pad.y * height - pad.h * height,
            width: pad.w * width,
            height: pad.h * height,
            color: rgb(r, g, b),
          });
        }
        // 2) Retype the replacement at the run's baseline / left edge, in the
        //    weight/style matching the source font (or the user's override).
        if (a.newStr.trim().length > 0) {
          const size = a.fontHeightFrac * height;
          const { r, g, b } = hexToRgb(a.color);
          page.drawText(a.newStr, {
            x: x0,
            // Box bottom sits at (boxTopY - h); that is the glyph baseline area.
            y: boxTopY - h,
            size,
            font: pickFont(a.bold, a.italic),
            color: rgb(r, g, b),
          });
        }
      }
    }

    // Apply the page's accumulated rotation (added to its existing angle).
    const extra = edit.rotations[sourcePage];
    if (extra && extra % 360 !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees(((current + extra) % 360 + 360) % 360));
    }
  }

  const blob = await pdfDocToBlob(outDoc);
  const name = changeExtension(
    input.name.replace(/\.pdf$/i, `${OUTPUT_SUFFIX}`),
    "pdf",
  );
  return { name, blob, size: blob.size };
}

/** Inclusive integer range [from, to]. */
function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i += 1) out.push(i);
  return out;
}
