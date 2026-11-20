"use client";

/**
 * Shape QR: controls (left column), preview and download (right column,
 * swapped in for the classic preview and download menu while the Shape tab is
 * active - what the user sees and what they download must be the same object).
 *
 * Three looks:
 *  - filled (default): the whole silhouette is QR texture, code inside it.
 *  - outline: the silhouette's contour only, code inside a hollow shape.
 *  - emoji art: the code IS the emoji, in colour, via the halftone renderer
 *    (lib/qr/emoji-qr.ts). A silhouette throws away everything that makes one
 *    smiley different from another, so faces default to this look.
 * All three go through one verify-then-allow path: the canvas must decode back
 * to the exact payload before the badge turns green, and every export is
 * re-verified at its own resolution before it can be saved.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import type { QRStyleConfig } from "@/lib/qr/style";
import { QR_SHAPES, renderShapeQr, type ShapeQrOptions } from "@/lib/qr/shape";
import { renderEmojiQrVerified } from "@/lib/qr/emoji-qr";
import { scanTestCanvas } from "@/lib/qr/validate";
import { canvasToBlob } from "@/lib/qr/render";
import { download } from "@/components/tool/dev";

/** Silhouette fills, plus the halftone renderer's colour artwork. */
export type ShapeFill = NonNullable<ShapeQrOptions["fill"]> | "halftone";

export interface ShapeState {
  emoji: string;
  fill: ShapeFill;
}

export const DEFAULT_SHAPE_STATE: ShapeState = { emoji: "❤️", fill: "solid" };

const FILLS: [ShapeFill, string][] = [
  ["solid", "Filled shape"],
  ["outline", "Outline only"],
  ["halftone", "Emoji art"],
];

/** Colors the shape renderer needs, pulled from the studio's style config. */
function inkOf(style: QRStyleConfig) {
  return {
    fg: style.fgColor || "#111111",
    bg: style.bgColor && !style.transparentBg ? style.bgColor : "#ffffff",
  };
}

/** What a verified render produced, for the preview badge and the exporter. */
type RenderReport =
  | { ok: true; contained: boolean; strength: number }
  | { ok: false; reason: "unsupported" | "unscannable" };

/**
 * Draw the picked look and prove it decodes back to the payload. One path for
 * all three looks, so the preview and the download can never disagree about
 * whether a code is safe to hand over.
 */
async function renderVerified(
  canvas: HTMLCanvasElement,
  o: { payload: string; state: ShapeState; fg: string; bg: string; size?: number },
): Promise<RenderReport> {
  const { payload, state, fg, bg, size } = o;
  if (state.fill === "halftone") {
    const art = await renderEmojiQrVerified(canvas, { payload, emoji: state.emoji, fg, bg, size });
    return art.ok ? { ok: true, contained: true, strength: art.strength } : art;
  }
  const meta = renderShapeQr(canvas, { payload, emoji: state.emoji, fg, bg, size, fill: state.fill });
  if (!meta) return { ok: false, reason: "unsupported" };
  const check = await scanTestCanvas(canvas, payload);
  if (!check.scannable || check.matches === false) return { ok: false, reason: "unscannable" };
  return { ok: true, contained: meta.contained, strength: 1 };
}

/* ── left column: the controls ────────────────────────────────────────────── */

/* ── the full catalog: 1,900+ emoji, searchable, paged ─────────────────────── */

const CATALOG_PAGE = 63;

/** A catalog row: the emoji, its CLDR name, and its Unicode group. */
type CatalogRow = [string, string, string];

let catalogOnce: Promise<CatalogRow[]> | null = null;

/** Load the generated catalog chunk once, however many callers want it. */
function useShapeCatalog(): CatalogRow[] | null {
  const [rows, setRows] = React.useState<CatalogRow[] | null>(null);
  React.useEffect(() => {
    let alive = true;
    catalogOnce ??= import("@/lib/qr/shape-catalog.json").then(
      (m) => m.default as unknown as CatalogRow[],
    );
    void catalogOnce.then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, []);
  return rows;
}

/**
 * Emoji whose identity is a face, for characters the catalog does not carry -
 * a freshly typed ZWJ sequence, or an emoji newer than our generated list.
 * Emoticons and the supplemental block are where faces live.
 */
const FACE_BLOCKS = /[\u{1F600}-\u{1F64F}\u{1F900}-\u{1F9FF}]/u;

/**
 * Lazily loads the generated shape catalog (lib/qr/shape-catalog.json - a
 * ~75 KB [emoji, name, group] list split into its own chunk) the first time the
 * browser section mounts. Buttons are plain text glyphs on purpose: a real
 * shape-QR render costs 15-40 ms, so thumbnailing a grid would stall the
 * main thread (engine owner's note). The live preview + scan badge are the
 * judge of any pick - with an open catalog there is no human curation gate,
 * and the `contained` warning in the preview covers the shapes that cannot
 * hold a code cleanly.
 */
function ShapeCatalogBrowser({
  catalog,
  active,
  onPick,
}: {
  catalog: CatalogRow[] | null;
  active: string;
  onPick: (emoji: string, name: string, group: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [limit, setLimit] = React.useState(CATALOG_PAGE);

  const filtered = React.useMemo(() => {
    if (!catalog) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter(([, name]) => name.includes(needle));
  }, [catalog, query]);

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <label className="flex items-center gap-2">
        <Icon name="Search" size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(CATALOG_PAGE);
          }}
          placeholder={catalog ? `Search ${catalog.length.toLocaleString()} shapes…` : "Loading shapes…"}
          className="h-11 w-full rounded-md border border-border bg-background px-2.5 text-sm md:h-9"
          aria-label="Search all shapes"
        />
      </label>
      {catalog && filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing matches &ldquo;{query.trim()}&rdquo;. Try a simpler word - shapes are
          named in English (dog, cake, rocket).
        </p>
      ) : null}
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
        {filtered.slice(0, limit).map(([emoji, name, group]) => (
          <button
            key={emoji}
            type="button"
            title={name}
            aria-pressed={active === emoji}
            onClick={() => onPick(emoji, name, group)}
            className={cn(
              "flex h-11 items-center justify-center rounded-md border text-xl transition-colors",
              active === emoji
                ? "border-primary bg-primary/10"
                : "border-border hover:border-foreground/30",
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
      {filtered.length > limit ? (
        <Button
          variant="outline"
          size="sm"
          className="self-center"
          onClick={() => setLimit((l) => l + CATALOG_PAGE * 2)}
        >
          Load more ({(filtered.length - limit).toLocaleString()} left)
        </Button>
      ) : null}
    </div>
  );
}

export function ShapeControls({
  state,
  onChange,
}: {
  state: ShapeState;
  onChange: (next: ShapeState) => void;
}) {
  const [custom, setCustom] = React.useState("");
  // Once the user picks a look themselves, stop choosing one for them.
  const chosenFill = React.useRef(false);
  const catalog = useShapeCatalog();
  const byEmoji = React.useMemo(
    () => new Map((catalog ?? []).map((row) => [row[0], row])),
    [catalog],
  );

  /**
   * Faces are the case the silhouette engine cannot serve: mask a smiley and
   * every one of them becomes the same circle. Pick the artwork renderer for
   * those, the silhouette for objects, until the user overrides.
   *
   * The rule reads the catalog's own metadata, so an emoji TYPED into the box
   * lands on the same look as the identical emoji picked from the grid. Before
   * this, typed input skipped the rule entirely and quietly got the monochrome
   * silhouette (found by the other session's battery).
   */
  const pick = (emoji: string, name?: string, group?: string) => {
    setCustom("");
    const row = byEmoji.get(emoji);
    const label = name ?? row?.[1] ?? "";
    const kind = group ?? row?.[2] ?? "";
    const arty =
      kind === "smileys_emotion" || label.includes("face") || FACE_BLOCKS.test(emoji);
    onChange({
      ...state,
      emoji,
      fill: chosenFill.current ? state.fill : arty ? "halftone" : "solid",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Two ways to build one: the silhouette looks are drawn from the code&rsquo;s own
        modules, with the real code sitting inside the shape. Emoji art goes further and
        turns the code itself into the emoji, in colour. Every preview is decoded back
        with our scanner before you can download it.
      </p>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Look">
        {FILLS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={state.fill === value}
            onClick={() => {
              chosenFill.current = true;
              onChange({ ...state, fill: value });
            }}
            className={cn(
              "min-h-11 rounded-md border px-3 text-xs font-medium transition-colors",
              state.fill === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Popular shapes
      </p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
        {QR_SHAPES.map((s) => (
          <button
            key={s.emoji}
            type="button"
            title={s.label}
            aria-pressed={state.emoji === s.emoji}
            onClick={() => pick(s.emoji, s.label.toLowerCase())}
            className={cn(
              "flex h-11 items-center justify-center rounded-md border text-xl transition-colors",
              state.emoji === s.emoji
                ? "border-primary bg-primary/10"
                : "border-border hover:border-foreground/30",
            )}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      <ShapeCatalogBrowser catalog={catalog} active={state.emoji} onPick={pick} />

      <label className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Or paste any emoji:
        <input
          value={custom}
          onChange={(e) => {
            const v = e.target.value.slice(0, 4);
            if (!v.trim()) {
              setCustom(v);
              return;
            }
            pick(v.trim());
            setCustom(v);
          }}
          placeholder="🦷"
          className="h-11 w-20 rounded-md border border-border bg-background px-2 text-center text-lg md:h-9"
        />
      </label>
    </div>
  );
}

/* ── right column: live preview ───────────────────────────────────────────── */

type ScanState = "idle" | "checking" | "ok" | "fail";

export function ShapePreview({
  payload,
  style,
  state,
}: {
  payload: string;
  style: QRStyleConfig;
  state: ShapeState;
}) {
  const [scan, setScan] = React.useState<ScanState>("idle");
  const [unsupported, setUnsupported] = React.useState(false);
  const [contained, setContained] = React.useState(true);
  const [strength, setStrength] = React.useState(1);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const { fg, bg } = inkOf(style);

  React.useEffect(() => {
    if (!payload) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setScan("checking");
    setUnsupported(false);
    // Emoji art walks a verification ladder, so a render can outlive the pick
    // that started it; drop anything that comes back for an older state.
    let live = true;
    const timer = window.setTimeout(() => {
      void renderVerified(canvas, { payload, state, fg, bg }).then((r) => {
        if (!live) return;
        setUnsupported(!r.ok && r.reason === "unsupported");
        setScan(r.ok ? "ok" : r.reason === "unsupported" ? "idle" : "fail");
        setContained(r.ok ? r.contained : true);
        setStrength(r.ok ? r.strength : 1);
      });
    }, 150);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [payload, state, fg, bg]);

  if (!payload) {
    return <p className="text-sm text-muted-foreground">Enter your link or content first.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[360px] rounded-md border border-border bg-white"
        aria-label={
          state.fill === "halftone"
            ? `QR code drawn as ${state.emoji}`
            : `QR code shaped as ${state.emoji}`
        }
      />
      {scan === "ok" && state.fill === "halftone" && strength < 1 ? (
        // The ladder backed off to keep the code readable. Say so, rather than
        // letting the user wonder why their emoji came out faded.
        <p className="w-full max-w-[360px] text-xs leading-relaxed text-muted-foreground">
          Art strength {Math.round(strength * 100)}% - reduced until it scanned. A
          shorter link leaves more room for the picture.
        </p>
      ) : null}
      {!unsupported && !contained && state.fill !== "halftone" ? (
        // Engine fallback fired: no inscribed square could hold the matrix,
        // so the code overhangs the outline. Scannable, but it looks broken
        // on a printed page - reacts to the CURRENT payload, since a longer
        // link needs a bigger matrix (engine owner's note).
        <p className="w-full max-w-[360px] text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          This shape can&rsquo;t hold the code cleanly, so the code sticks out of the
          outline. A chunkier shape - or a shorter link - fixes it.
        </p>
      ) : null}
      {unsupported ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          That character didn&rsquo;t render as a shape here. Try another emoji.
        </p>
      ) : (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium",
            scan === "ok" && "text-emerald-600 dark:text-emerald-400",
            scan === "fail" && "text-red-600 dark:text-red-400",
            (scan === "checking" || scan === "idle") && "text-muted-foreground",
          )}
        >
          <Icon
            name={scan === "ok" ? "CircleCheck" : scan === "fail" ? "TriangleAlert" : "LoaderCircle"}
            size={13}
            className={scan === "checking" ? "animate-spin" : ""}
          />
          {scan === "ok" && "Scan-verified with our decoder"}
          {scan === "fail" && "Doesn't scan - try stronger contrast between the colors"}
          {scan === "checking" && "Testing the scan…"}
          {scan === "idle" && "…"}
        </span>
      )}
    </div>
  );
}

/* ── right column: download (raster only - the shape is drawn on canvas) ──── */

const SHAPE_SIZES = [512, 1024, 2048] as const;
const SHAPE_FORMATS = [
  { value: "png", label: "PNG", icon: "Image", ext: "png" },
  { value: "jpeg", label: "JPG", icon: "Image", ext: "jpg" },
  { value: "webp", label: "WEBP", icon: "Image", ext: "webp" },
] as const;

export function ShapeDownload({
  payload,
  style,
  state,
  filename,
}: {
  payload: string;
  style: QRStyleConfig;
  state: ShapeState;
  filename: string;
}) {
  const [format, setFormat] = React.useState<(typeof SHAPE_FORMATS)[number]["value"]>("png");
  const [size, setSize] = React.useState<number>(1024);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { fg, bg } = inkOf(style);

  const save = React.useCallback(async () => {
    if (!payload) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      // Rendered and decoded again at the export resolution: never hand over a
      // dead code, and never assume the preview's verdict covers this size.
      const r = await renderVerified(canvas, { payload, state, fg, bg, size });
      if (!r.ok) {
        throw new Error(
          r.reason === "unsupported"
            ? "That emoji didn't render as a shape. Try another one."
            : "This render didn't decode. Try stronger contrast between the colors.",
        );
      }
      const ext = SHAPE_FORMATS.find((f) => f.value === format)!.ext;
      const kind = state.fill === "halftone" ? "art" : "shape";
      download(`${filename}-${kind}.${ext}`, await canvasToBlob(canvas, format));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }, [payload, state, fg, bg, size, format, filename]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1.5">
        {SHAPE_FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={format === f.value}
            onClick={() => setFormat(f.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 text-sm font-medium transition-colors",
              format === f.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon name={f.icon} size={14} /> {f.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {SHAPE_SIZES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={size === s}
            onClick={() => setSize(s)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm font-medium tabular-nums transition-colors",
              size === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Icon name="Info" size={12} className="mt-0.5 shrink-0 text-primary" />
        Shape and emoji-art codes export as raster images. Need SVG, PDF or EPS?
        Switch off the Shape tab for the classic code.
      </p>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <Icon name="TriangleAlert" size={13} /> {error}
        </p>
      )}
      <Button size="sm" data-shape-download disabled={!payload || busy} onClick={() => void save()}>
        <Icon name="Download" size={14} />
        {busy ? "Rendering…" : `Download ${format === "jpeg" ? "JPG" : format.toUpperCase()}`}
      </Button>
    </div>
  );
}
