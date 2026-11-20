/**
 * SVG tool illustrations, deterministic, on-brand SVG artwork for the SVG
 * toolkit.
 *
 * Same design language and contract as `lib/qr/illustrations` and
 * `lib/seo-tools/illustrations`: given a stable seed (a tool slug or a group key
 * like "optimize"/"convert"/"generate"/"edit"/"view") we DERIVE a
 * distinct-but-consistent illustration so every SVG tool gets branded artwork
 * for free. Pure and client-safe (no DOM, no libraries) so it renders on the
 * server (static export), in tool cards, hero banners and OG images alike.
 *
 * The motif is a stylised "vector canvas" scene: a seeded Bézier path drawn on a
 * dotted design grid, with anchor points and their control-point handles pulled
 * out (the unmistakable pen-tool look), tinted with the design-system accent
 * gradient, and a small "purpose glyph" (optimize/spark, convert/arrows,
 * generate/blob, edit/pen, view/eye, code/braces, …) floated over it hinting at
 * the tool's group.
 *
 * Usage:
 *   getSvgIllustration("svg-optimizer", "hero")   -> inline SVG string
 *   svgIllustrationDataUrl("generate", "card")    -> data: URL (for <img>)
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants (aspect + density presets; shared vocabulary with QR/SEO art) ── */

export type SvgIllustrationVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  readonly w: number;
  readonly h: number;
  /** Dotted design-grid resolution (dots per side of the seeded field). */
  readonly grid: number;
  /** Number of anchor nodes along the seeded Bézier path. */
  readonly nodes: number;
  /** Whether to draw the floating purpose glyph. */
  readonly glyph: boolean;
  /** Whether to draw control-point handles off each anchor. */
  readonly handles: boolean;
  /** Corner radius of the outer plate, in viewBox units. */
  readonly radius: number;
}

const VARIANTS: Record<SvgIllustrationVariant, VariantSpec> = {
  icon: { w: 96, h: 96, grid: 5, nodes: 4, glyph: false, handles: false, radius: 8 },
  card: { w: 400, h: 300, grid: 8, nodes: 5, glyph: true, handles: true, radius: 5 },
  hero: { w: 1200, h: 630, grid: 12, nodes: 6, glyph: true, handles: true, radius: 6 },
  banner: { w: 1200, h: 300, grid: 14, nodes: 7, glyph: true, handles: true, radius: 6 },
};

/* ── Seeded PRNG (deterministic per seed) ─────────────────────────────────── */

/** FNV-1a → 32-bit unsigned seed from any string. */
function seedFrom(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32, tiny, fast, deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Purpose glyphs (24×24, currentColor stroke) ──────────────────────────── */

/**
 * Group/purpose → an SVG path that hints at what the tool does. Line-based so it
 * reads at any size. The glyph is chosen from the seed via `glyphKeyFor`, which
 * also understands the SVG group labels ("Optimize", "Convert", …).
 */
const GLYPHS: Record<string, string> = {
  // The vector pen: the toolkit's default motif.
  pen: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.5 7.5M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  // Optimize / minify, a spark/shrink.
  optimize:
    "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  // Convert: two-way transform arrows.
  convert:
    "M4 8h13l-3-3M4 8l3 3M20 16H7l3 3M20 16l-3-3",
  // Generate, a blob / organic shape.
  generate:
    "M12 3c3.5 0 7 2 7 6 0 3-2 4-2 6.5S15 21 12 21s-5-2-5-5.5S5 12 5 9c0-4 3.5-6 7-6z",
  // Edit, pencil on a sheet.
  edit: "M4 4h9M4 9h6M4 14h5M4 19h8M14 15l5-5 3 3-5 5-3.5.5.5-3.5z",
  // View: the eye.
  view: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  // Code / data-uri: braces.
  code: "M8 4S5 4 5 8s-2 4-2 4 2 0 2 4 3 4 3 4M16 4s3 0 3 4 2 4 2 4-2 0-2 4-3 4-3 4",
  // Layers / sprite sheet.
  layers:
    "M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5",
  // Trace / raster to vector, grid to curve.
  trace:
    "M3 5h8v8H3zM3 5l4 4M7 5l4 4M3 9l4 4M13 15c4 0 8-3 8-8M13 15l3-2M13 15l2 3",
  // Wand / effects.
  wand: "M15 4V2M15 22v-2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 15h2M20 15h2M4.9 25.1M6 21l14-14-3-3L3 18z",
  // Crop / viewbox.
  crop: "M6 2v16h16M2 6h16v16M6 6h12v12H6z",
  // Path / route.
  path: "M4 20L20 4M6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  // Palette / color.
  palette:
    "M12 3a9 9 0 0 0 0 18c1 0 2-1 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-6.9-9-6.9zM7.5 12a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM12 8a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 12 8zM16.5 12a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z",
};

/** Map a seed (slug or group label) to a glyph key. */
function glyphKeyFor(key: string): keyof typeof GLYPHS {
  const s = key.toLowerCase();
  const table: [RegExp, keyof typeof GLYPHS][] = [
    [/optim|minif|compress|clean|shrink/, "optimize"],
    [/trace|raster|png-?to|jpg-?to|bitmap|vectoriz/, "trace"],
    [/data-?uri|base64|encode|to-?react|to-?jsx|to-?css|code/, "code"],
    [/convert|to-png|to-jpg|to-svg|export/, "convert"],
    [/blob|generat|wave|pattern|shape|gradient|noise/, "generate"],
    [/sprite|stack|layer|icon-?set/, "layers"],
    [/color|palette|recolor|fill|tint/, "palette"],
    [/crop|viewbox|resize|trim/, "crop"],
    [/path|animate|morph|stroke/, "path"],
    [/effect|filter|shadow|glow|wand/, "wand"],
    [/view|preview|render|display/, "view"],
    [/edit|editor|tweak/, "edit"],
  ];
  for (const [re, g] of table) if (re.test(s)) return g;
  return "pen";
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface SvgIllustrationOptions {
  /** Accent override; defaults to the SVG toolkit accent (orange). */
  accent?: AccentKey;
  /** Force a specific glyph regardless of the seed key. */
  glyph?: keyof typeof GLYPHS;
}

/**
 * Build the inline SVG string for an SVG-tool illustration.
 *
 * @param key     Tool slug OR group key (e.g. "optimize", "convert",
 *  "generate"): seeds both the Bézier path and the purpose glyph.
 * @param variant Size/aspect preset.
 */
export function getSvgIllustration(
  key: string,
  variant: SvgIllustrationVariant = "card",
  options: SvgIllustrationOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, radius } = spec;
  const accent = accentStyle(options.accent ?? "orange");
  const [from, to] = accent.hex;

  const rand = mulberry32(seedFrom(key));
  const uid = `svg-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  // ── Canvas field: center a working area within the viewBox. ───────────────
  const field = Math.min(w, h) * (variant === "icon" ? 0.82 : 0.72);
  const fw = variant === "hero" || variant === "banner" ? w * 0.6 : field;
  const fh = field;
  const ox = variant === "hero" || variant === "banner" ? w * 0.06 : (w - fw) / 2;
  const oy = (h - fh) / 2;

  // ── Dotted design grid (the "vector workspace" backdrop). ─────────────────
  const g = spec.grid;
  const stepX = fw / (g - 1);
  const stepY = fh / (g - 1);
  const dotR = round(Math.min(stepX, stepY) * 0.09);
  const dots: string[] = [];
  for (let r = 0; r < g; r++) {
    for (let c = 0; c < g; c++) {
      dots.push(
        `<circle cx="${round(ox + c * stepX)}" cy="${round(oy + r * stepY)}" r="${dotR}"/>`,
      );
    }
  }

  // ── Seeded anchor points along a left-to-right sweep. ─────────────────────
  const n = spec.nodes;
  const anchors: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // Keep a margin so handles stay inside the plate.
    const px = ox + fw * (0.12 + t * 0.76);
    const py = oy + fh * (0.2 + rand() * 0.6);
    anchors.push([round(px), round(py)]);
  }

  // Build a smooth cubic Bézier through the anchors; remember the control
  // points so we can draw pen-tool handles.
  const handleLen = Math.min(stepX, stepY) * 1.1;
  const controls: [number, number][] = [];
  let d = `M ${anchors[0]![0]} ${anchors[0]![1]}`;
  for (let i = 0; i < n - 1; i++) {
    const a = anchors[i]!;
    const b = anchors[i + 1]!;
    const c1x = round(a[0] + handleLen);
    const c1y = round(a[1] + (rand() - 0.5) * handleLen);
    const c2x = round(b[0] - handleLen);
    const c2y = round(b[1] + (rand() - 0.5) * handleLen);
    controls.push([c1x, c1y], [c2x, c2y]);
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${b[0]} ${b[1]}`;
  }

  const strokeW = round(Math.min(w, h) * (variant === "icon" ? 0.03 : 0.02));

  // ── Pen-tool handles: a light line from each anchor to its control point. ──
  let handleMarks = "";
  if (spec.handles) {
    const parts: string[] = [];
    const anchorR = round(Math.min(stepX, stepY) * 0.16);
    const ctrlR = round(anchorR * 0.7);
    // Handles: pair controls[2i], controls[2i+1] belong to segment i (anchor i
    // outgoing, anchor i+1 incoming).
    for (let i = 0; i < n - 1; i++) {
      const a = anchors[i]!;
      const b = anchors[i + 1]!;
      const c1 = controls[i * 2]!;
      const c2 = controls[i * 2 + 1]!;
      parts.push(
        `<line x1="${a[0]}" y1="${a[1]}" x2="${c1[0]}" y2="${c1[1]}"/>`,
        `<line x1="${b[0]}" y1="${b[1]}" x2="${c2[0]}" y2="${c2[1]}"/>`,
      );
    }
    const handleLines = `<g stroke="url(#${uid}-g)" stroke-width="${round(
      strokeW * 0.5,
    )}" opacity="0.5">${parts.join("")}</g>`;
    // Control-point diamonds (hollow) + anchor squares (filled).
    const ctrlMarks = controls
      .map(
        ([x, y]) =>
          `<rect x="${round(x - ctrlR)}" y="${round(y - ctrlR)}" width="${round(
            ctrlR * 2,
          )}" height="${round(ctrlR * 2)}" transform="rotate(45 ${x} ${y})" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(
            strokeW * 0.5,
          )}"/>`,
      )
      .join("");
    const anchorMarks = anchors
      .map(
        ([x, y]) =>
          `<rect x="${round(x - anchorR)}" y="${round(y - anchorR)}" width="${round(
            anchorR * 2,
          )}" height="${round(anchorR * 2)}" rx="${round(anchorR * 0.3)}" fill="url(#${uid}-g)"/>`,
      )
      .join("");
    handleMarks = handleLines + ctrlMarks + anchorMarks;
  }

  // ── Optional floating purpose glyph, bottom-right, on a soft plate. ───────
  let glyph = "";
  if (spec.glyph) {
    const gk = options.glyph ?? glyphKeyFor(key);
    const path = GLYPHS[gk] ?? GLYPHS.pen;
    const plate = Math.min(w, h) * (variant === "banner" ? 0.42 : 0.34);
    const gx = w - plate - Math.min(w, h) * 0.08;
    const gy = h - plate - Math.min(w, h) * 0.08;
    const inset = plate * 0.22;
    const scale = (plate - inset * 2) / 24;
    glyph =
      `<g filter="url(#${uid}-sh)">` +
      `<rect x="${round(gx)}" y="${round(gy)}" width="${round(plate)}" height="${round(
        plate,
      )}" rx="${round(plate * 0.28)}" fill="url(#${uid}-g)"/>` +
      `<g transform="translate(${round(gx + inset)} ${round(gy + inset)}) scale(${round(
        scale,
      )})" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="${path}"/></g></g>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" fill="none">` +
    `<defs>` +
    `<linearGradient id="${uid}-g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient>` +
    `<radialGradient id="${uid}-bg" cx="0.5" cy="0.35" r="0.9">` +
    `<stop offset="0" stop-color="${from}" stop-opacity="0.14"/>` +
    `<stop offset="1" stop-color="${to}" stop-opacity="0.03"/>` +
    `</radialGradient>` +
    `<filter id="${uid}-sh" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feDropShadow dx="0" dy="${round(Math.min(w, h) * 0.012)}" stdDeviation="${round(
      Math.min(w, h) * 0.02,
    )}" flood-color="${from}" flood-opacity="0.35"/></filter>` +
    `</defs>` +
    // Plate background
    `<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="url(#${uid}-bg)"/>` +
    // Dotted design grid (subtle)
    `<g fill="url(#${uid}-g)" opacity="0.28">${dots.join("")}</g>` +
    // The seeded Bézier curve
    `<path d="${d}" stroke="url(#${uid}-g)" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>` +
    // Pen-tool handles + anchor/control markers
    handleMarks +
    glyph +
    `</svg>`
  );
}

/** Round to 2dp and drop trailing zeros; keeps the SVG string compact. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Same illustration as a `data:` URL, safe for `<img src>` / CSS `url()`. */
export function svgIllustrationDataUrl(
  key: string,
  variant: SvgIllustrationVariant = "card",
  options: SvgIllustrationOptions = {},
): string {
  const svg = getSvgIllustration(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All glyph keys, for tooling / previews. */
export const SVG_GLYPH_KEYS = Object.keys(GLYPHS) as (keyof typeof GLYPHS)[];
