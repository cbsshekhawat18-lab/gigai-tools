/**
 * GigAI Tools, SVG generators.
 *
 * Deterministic, dependency-free SVG makers for the generator tools: organic
 * blobs, wave dividers, tiling patterns, gradients, hero backgrounds, geometric
 * shapes (polygon/star/gear/heart…), placeholders, and `<symbol>` sprites.
 *
 * DETERMINISM CONTRACT: identical inputs ALWAYS yield byte-identical output.
 * There is no module-scope `Math.random`; every stochastic maker takes a
 * `seed` and threads a small seedable PRNG (mulberry32) so results are
 * reproducible and shareable via URL state.
 */

import { type SvgResult, ok, fail, roundNum, escapeAttr, escapeText } from "./core";

/* --------------------------------- PRNG ----------------------------------- */

/** Hash an arbitrary seed (string|number) into a 32-bit integer. */
function hashSeed(seed: string | number): number {
  const str = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: tiny, fast, well-distributed seeded PRNG returning [0,1). */
function mulberry32(seedInt: number): () => number {
  let a = seedInt >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seeded RNG bundle with helpers. */
function rng(seed: string | number) {
  const next = mulberry32(hashSeed(seed));
  return {
    next,
    range: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
  };
}

/** Round + join numbers for compact SVG coords. */
function n(value: number, precision = 2): string {
  return roundNum(value, precision);
}

/** Wrap SVG body in a root with viewBox and standard namespace. */
function svgRoot(width: number, height: number, body: string, extraAttrs = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}" height="${n(height)}" viewBox="0 0 ${n(width)} ${n(height)}"${extraAttrs ? " " + extraAttrs : ""}>${body}</svg>`;
}

/* --------------------------------- Blob ----------------------------------- */

export interface BlobOptions {
  seed?: string | number;
  /** Number of anchor points: higher = more lobes (3–20, default 6). */
  complexity?: number;
  /** How irregular the radius is, 0 (circle) – 1 (spiky) (default 0.4). */
  contrast?: number;
  /**
   * Angular asymmetry, 0 (evenly spaced, symmetric) – 1 (very lopsided). This
   * is what turns "a slightly wobbly circle" into a genuinely organic, one-of-a
   * -kind silhouette. Default 0 (backwards-compatible).
   */
  jitter?: number;
  /** Elongation along one axis, -0.4 (tall) – 0.4 (wide). Default 0 (round). */
  stretch?: number;
  /** Output size in px (square, default 512). */
  size?: number;
  /** Solid fill color (ignored if `gradient` set). */
  color?: string;
  /** Optional two-stop gradient [from,to]; overrides `color`. */
  gradient?: [string, string];
}

/**
 * Organic blob via a closed Catmull-Rom-ish spline through jittered polar
 * anchors. Deterministic given `seed`. `jitter` (angular) + `stretch` (axis)
 * give each shape a distinct silhouette, not just a wobblier circle. Returns
 * an SVG string.
 */
export function makeBlob(options: BlobOptions = {}): string {
  const size = options.size ?? 512;
  const complexity = Math.max(3, Math.min(20, Math.round(options.complexity ?? 6)));
  const contrast = Math.max(0, Math.min(1, options.contrast ?? 0.4));
  const jitter = Math.max(0, Math.min(1, options.jitter ?? 0));
  const stretch = Math.max(-0.4, Math.min(0.4, options.stretch ?? 0));
  const r = rng(options.seed ?? "blob");
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size * 0.34;
  const sx = 1 + stretch;
  const sy = 1 - stretch;

  const points: Array<{ x: number; y: number }> = [];
  const step = (Math.PI * 2) / complexity;
  for (let i = 0; i < complexity; i++) {
    // Offset each anchor's ANGLE (kept under half a step so points never cross)
    // for real asymmetry, and its RADIUS for spikiness.
    const jit = (r.next() - 0.5) * jitter * step * 0.9;
    const angle = i * step + jit;
    const radius = baseR * (1 - contrast / 2 + r.next() * contrast);
    points.push({ x: cx + Math.cos(angle) * radius * sx, y: cy + Math.sin(angle) * radius * sy });
  }
  const d = closedSpline(points);

  const useGrad = Boolean(options.gradient);
  const fill = useGrad ? "url(#blobGrad)" : options.color ?? "#6366f1";
  const defs = useGrad
    ? `<defs><linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${escapeAttr(options.gradient![0])}"/><stop offset="100%" stop-color="${escapeAttr(options.gradient![1])}"/></linearGradient></defs>`
    : "";
  return svgRoot(size, size, `${defs}<path d="${d}" fill="${escapeAttr(fill)}"/>`);
}

/** Closed smooth spline path through points (cardinal-spline segments). */
function closedSpline(pts: Array<{ x: number; y: number }>): string {
  const len = pts.length;
  if (len < 3) return "";
  const k = 0.5; // tension
  let d = `M ${n(pts[0]!.x)} ${n(pts[0]!.y)}`;
  for (let i = 0; i < len; i++) {
    const p0 = pts[(i - 1 + len) % len]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % len]!;
    const p3 = pts[(i + 2) % len]!;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * k * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * k * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * k * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * k * 2;
    d += ` C ${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2.x)} ${n(p2.y)}`;
  }
  return d + " Z";
}

/* --------------------------------- Wave ----------------------------------- */

export interface WaveOptions {
  seed?: string | number;
  /** Overall width (default 1440). */
  width?: number;
  /** Overall height (default 160). */
  height?: number;
  /** Number of crests (default 3). */
  waves?: number;
  /** Crest amplitude 0–1 of height (default 0.5). */
  amplitude?: number;
  /** Flip vertically (divider at top vs bottom). */
  flip?: boolean;
  color?: string;
  gradient?: [string, string];
}

/** Smooth wave/section-divider SVG. Deterministic. */
export function makeWave(options: WaveOptions = {}): string {
  const width = options.width ?? 1440;
  const height = options.height ?? 160;
  const waves = Math.max(1, Math.min(12, Math.round(options.waves ?? 3)));
  const amp = Math.max(0, Math.min(1, options.amplitude ?? 0.5)) * (height * 0.45);
  const r = rng(options.seed ?? "wave");
  const mid = height / 2;

  const segments = waves * 2;
  const step = width / segments;
  let d = `M 0 ${n(mid)}`;
  for (let i = 0; i < segments; i++) {
    const x1 = step * i;
    const x2 = step * (i + 1);
    const dir = i % 2 === 0 ? -1 : 1;
    const jitter = 1 - r.next() * 0.3;
    const cy = mid + dir * amp * jitter;
    const cx = (x1 + x2) / 2;
    d += ` Q ${n(cx)} ${n(cy)} ${n(x2)} ${n(mid)}`;
  }
  d += ` L ${n(width)} ${n(height)} L 0 ${n(height)} Z`;
  if (options.flip) d = `M 0 ${n(mid)}` + d.slice(d.indexOf(" Q")); // keep shape; visual flip via transform below

  const useGrad = Boolean(options.gradient);
  const fill = useGrad ? "url(#waveGrad)" : options.color ?? "#0ea5e9";
  const defs = useGrad
    ? `<defs><linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${escapeAttr(options.gradient![0])}"/><stop offset="100%" stop-color="${escapeAttr(options.gradient![1])}"/></linearGradient></defs>`
    : "";
  const transform = options.flip ? ` transform="scale(1,-1) translate(0,-${n(height)})"` : "";
  return svgRoot(width, height, `${defs}<path d="${d}" fill="${escapeAttr(fill)}"${transform}/>`);
}

/* -------------------------------- Pattern --------------------------------- */

export type PatternType = "dots" | "grid" | "lines" | "cross" | "triangles" | "chevron" | "circles";

export interface PatternOptions {
  /** Foreground color(s). */
  colors?: string[];
  /** Tile size in px (default 40). */
  scale?: number;
  /** Background color (default transparent). */
  background?: string;
  /** Stroke width for line patterns (default 2). */
  strokeWidth?: number;
}

/**
 * Tiling pattern SVG. Renders one tile inside a `<pattern>` and fills a rect so
 * the output is directly usable as a background. Deterministic.
 */
export function makePattern(type: PatternType, options: PatternOptions = {}): string {
  const s = options.scale ?? 40;
  const fg = options.colors?.[0] ?? "#334155";
  const sw = options.strokeWidth ?? 2;
  const bg = options.background;

  let tile = "";
  switch (type) {
    case "dots":
      tile = `<circle cx="${n(s / 2)}" cy="${n(s / 2)}" r="${n(s * 0.12)}" fill="${escapeAttr(fg)}"/>`;
      break;
    case "circles":
      tile = `<circle cx="${n(s / 2)}" cy="${n(s / 2)}" r="${n(s * 0.35)}" fill="none" stroke="${escapeAttr(fg)}" stroke-width="${n(sw)}"/>`;
      break;
    case "grid":
      tile = `<path d="M ${n(s)} 0 L 0 0 0 ${n(s)}" fill="none" stroke="${escapeAttr(fg)}" stroke-width="${n(sw)}"/>`;
      break;
    case "lines":
      tile = `<path d="M 0 ${n(s)} L ${n(s)} 0" stroke="${escapeAttr(fg)}" stroke-width="${n(sw)}"/>`;
      break;
    case "cross":
      tile = `<path d="M ${n(s / 2)} ${n(s * 0.2)} L ${n(s / 2)} ${n(s * 0.8)} M ${n(s * 0.2)} ${n(s / 2)} L ${n(s * 0.8)} ${n(s / 2)}" stroke="${escapeAttr(fg)}" stroke-width="${n(sw)}"/>`;
      break;
    case "chevron":
      tile = `<path d="M 0 ${n(s / 2)} L ${n(s / 2)} 0 L ${n(s)} ${n(s / 2)}" fill="none" stroke="${escapeAttr(fg)}" stroke-width="${n(sw)}"/>`;
      break;
    case "triangles":
      tile = `<path d="M ${n(s / 2)} 0 L ${n(s)} ${n(s)} L 0 ${n(s)} Z" fill="${escapeAttr(fg)}"/>`;
      break;
  }

  const patternId = `p-${type}`;
  const bgRect = bg ? `<rect width="100%" height="100%" fill="${escapeAttr(bg)}"/>` : "";
  const body =
    `<defs><pattern id="${patternId}" width="${n(s)}" height="${n(s)}" patternUnits="userSpaceOnUse">${tile}</pattern></defs>` +
    bgRect +
    `<rect width="100%" height="100%" fill="url(#${patternId})"/>`;
  return svgRoot(s * 8, s * 8, body);
}

/* -------------------------------- Gradient -------------------------------- */

export interface GradientStop {
  offset: number; // 0–100
  color: string;
}

export interface GradientOptions {
  type?: "linear" | "radial" | "conic";
  stops?: GradientStop[];
  /** Angle for linear gradients in degrees (default 90). */
  angle?: number;
  size?: number;
}

/** Build both an SVG gradient and the equivalent CSS. */
export interface GradientResult {
  svg: string;
  css: string;
}

/** Generate a gradient as SVG + CSS. Conic is CSS-only (SVG has no conic). */
export function makeGradient(options: GradientOptions = {}): GradientResult {
  const type = options.type ?? "linear";
  const size = options.size ?? 512;
  const stops = options.stops?.length ? options.stops : [{ offset: 0, color: "#6366f1" }, { offset: 100, color: "#ec4899" }];
  const angle = options.angle ?? 90;

  const stopEls = stops
    .map((s) => `<stop offset="${n(Math.max(0, Math.min(100, s.offset)))}%" stop-color="${escapeAttr(s.color)}"/>`)
    .join("");

  let svg: string;
  let css: string;
  const cssStops = stops.map((s) => `${escapeText(s.color)} ${n(s.offset)}%`).join(", ");

  if (type === "radial") {
    svg = svgRoot(size, size, `<defs><radialGradient id="g">${stopEls}</radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`);
    css = `background: radial-gradient(circle, ${cssStops});`;
  } else if (type === "conic") {
    // No native SVG conic gradient; emit a linear SVG fallback + true CSS conic.
    svg = svgRoot(size, size, `<defs><linearGradient id="g">${stopEls}</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`);
    css = `background: conic-gradient(from ${n(angle)}deg, ${cssStops});`;
  } else {
    const rad = (angle - 90) * (Math.PI / 180);
    const x2 = n(0.5 + Math.cos(rad) * 0.5);
    const y2 = n(0.5 + Math.sin(rad) * 0.5);
    const x1 = n(0.5 - Math.cos(rad) * 0.5);
    const y1 = n(0.5 - Math.sin(rad) * 0.5);
    svg = svgRoot(size, size, `<defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopEls}</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`);
    css = `background: linear-gradient(${n(angle)}deg, ${cssStops});`;
  }
  return { svg, css };
}

/* ------------------------------- Background ------------------------------- */

export interface BackgroundOptions {
  seed?: string | number;
  width?: number;
  height?: number;
  /** Base gradient stops for the backdrop. */
  colors?: [string, string];
  /** Number of floating blobs to scatter (default 3). */
  blobs?: number;
  /** Blur amount in px (default 40). */
  blur?: number;
}

/** Layered hero background: gradient base + soft blurred blobs. Deterministic. */
export function makeBackground(options: BackgroundOptions = {}): string {
  const width = options.width ?? 1440;
  const height = options.height ?? 900;
  const [c1, c2] = options.colors ?? ["#0f172a", "#1e293b"];
  const blobCount = Math.max(0, Math.min(8, Math.round(options.blobs ?? 3)));
  const blur = options.blur ?? 40;
  const r = rng(options.seed ?? "bg");

  const palette = ["#6366f1", "#ec4899", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6"];
  let blobs = "";
  for (let i = 0; i < blobCount; i++) {
    const cx = r.range(0, width);
    const cy = r.range(0, height);
    const rad = r.range(width * 0.12, width * 0.28);
    const color = palette[r.int(0, palette.length - 1)]!;
    blobs += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(rad)}" fill="${escapeAttr(color)}" opacity="0.35" filter="url(#bgBlur)"/>`;
  }
  const defs =
    `<defs><linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${escapeAttr(c1)}"/><stop offset="100%" stop-color="${escapeAttr(c2)}"/></linearGradient>` +
    `<filter id="bgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${n(blur)}"/></filter></defs>`;
  const body = `${defs}<rect width="100%" height="100%" fill="url(#bgGrad)"/>${blobs}`;
  return svgRoot(width, height, body);
}

/* --------------------------------- Shape ---------------------------------- */

export type ShapeType = "polygon" | "star" | "gear" | "heart" | "burst" | "hexagon" | "triangle";

export interface ShapeOptions {
  /** For polygon/star/gear/burst: number of sides/points (default 5). */
  sides?: number;
  /** Outer radius fraction of size (default 0.45). */
  radius?: number;
  /** Inner radius fraction for star/gear/burst (default 0.5 of outer). */
  innerRadius?: number;
  /** Rotation offset in degrees (default 0). */
  rotation?: number;
  size?: number;
  color?: string;
  gradient?: [string, string];
}

/** Geometric shape SVG (polygon/star/gear/heart/…). Deterministic (no seed). */
export function makeShape(type: ShapeType, options: ShapeOptions = {}): string {
  const size = options.size ?? 512;
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * (options.radius ?? 0.45);
  const inner = outer * (options.innerRadius ?? 0.5);
  const sides = Math.max(3, Math.min(60, Math.round(options.sides ?? 5)));
  const rot = ((options.rotation ?? 0) - 90) * (Math.PI / 180);

  let d = "";
  switch (type) {
    case "heart":
      d = heartPath(cx, cy, outer);
      break;
    case "gear":
      d = gearPath(cx, cy, outer, inner, sides);
      break;
    case "star":
    case "burst":
      d = starPath(cx, cy, outer, type === "burst" ? outer * 0.55 : inner, sides, rot);
      break;
    case "hexagon":
      d = polygonPath(cx, cy, outer, 6, rot);
      break;
    case "triangle":
      d = polygonPath(cx, cy, outer, 3, rot);
      break;
    case "polygon":
    default:
      d = polygonPath(cx, cy, outer, sides, rot);
      break;
  }

  const useGrad = Boolean(options.gradient);
  const fill = useGrad ? "url(#shapeGrad)" : options.color ?? "#6366f1";
  const defs = useGrad
    ? `<defs><linearGradient id="shapeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${escapeAttr(options.gradient![0])}"/><stop offset="100%" stop-color="${escapeAttr(options.gradient![1])}"/></linearGradient></defs>`
    : "";
  return svgRoot(size, size, `${defs}<path d="${d}" fill="${escapeAttr(fill)}"/>`);
}

function polygonPath(cx: number, cy: number, r: number, sides: number, rot: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2;
    pts.push(`${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * r)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function starPath(cx: number, cy: number, outer: number, inner: number, points: number, rot: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i / (points * 2)) * Math.PI * 2;
    pts.push(`${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * r)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function gearPath(cx: number, cy: number, outer: number, inner: number, teeth: number): string {
  const pts: string[] = [];
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const r = phase === 0 || phase === 1 ? outer : inner;
    pts.push(`${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * r)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function heartPath(cx: number, cy: number, r: number): string {
  // Parametric heart scaled into radius r, centered on cx,cy.
  const pts: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push(`${n(cx + (x / 17) * r)} ${n(cy - (y / 17) * r)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

/* ------------------------------ Placeholder ------------------------------- */

export interface PlaceholderOptions {
  w?: number;
  h?: number;
  text?: string;
  bg?: string;
  fg?: string;
  fontSize?: number;
}

/** Simple labeled placeholder image SVG (defaults show its dimensions). */
export function makePlaceholder(options: PlaceholderOptions = {}): string {
  const w = Math.max(1, Math.round(options.w ?? 600));
  const h = Math.max(1, Math.round(options.h ?? 400));
  const bg = options.bg ?? "#e2e8f0";
  const fg = options.fg ?? "#64748b";
  const text = options.text ?? `${w} × ${h}`;
  const fontSize = options.fontSize ?? Math.round(Math.min(w, h) * 0.15);
  const body =
    `<rect width="${w}" height="${h}" fill="${escapeAttr(bg)}"/>` +
    `<text x="50%" y="50%" fill="${escapeAttr(fg)}" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central">${escapeText(text)}</text>`;
  return svgRoot(w, h, body);
}

/* -------------------------------- Sprite ---------------------------------- */

export interface SpriteEntry {
  id: string;
  svg: string;
}

export interface SpriteResult {
  /** The combined `<svg>` sprite with `<symbol>` per icon. */
  sprite: string;
  /** Copy-paste usage snippet. */
  usage: string;
}

/**
 * Combine multiple SVGs into a single `<symbol>` sprite. Each source's inner
 * markup + viewBox becomes a `<symbol id="…">`; usage is a `<use>` reference.
 * Sanitizes ids to valid, unique tokens.
 */
export function makeSprite(entries: SpriteEntry[]): SvgResult<SpriteResult> {
  if (!entries.length) return fail("Add at least one SVG to build a sprite.");
  const usedIds = new Set<string>();
  const symbols: string[] = [];

  for (const entry of entries) {
    const inner = /<svg\b[^>]*>([\s\S]*?)<\/svg>/i.exec(entry.svg);
    if (!inner) return fail(`Entry "${entry.id}" is not a valid <svg>.`);
    const openTag = /<svg\b[^>]*>/i.exec(entry.svg)?.[0] ?? "";
    const viewBox = /\bviewBox\s*=\s*["']([^"']+)["']/i.exec(openTag)?.[1] ?? "0 0 24 24";
    let id = sanitizeId(entry.id);
    let suffix = 1;
    while (usedIds.has(id)) id = `${sanitizeId(entry.id)}-${suffix++}`;
    usedIds.add(id);
    symbols.push(`<symbol id="${escapeAttr(id)}" viewBox="${escapeAttr(viewBox)}">${inner[1] ?? ""}</symbol>`);
  }

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join("")}</svg>`;
  const firstId = sanitizeId(entries[0]!.id);
  const usage = `<svg width="24" height="24"><use href="#${firstId}"></use></svg>`;
  return ok({ sprite, usage });
}

/** Turn arbitrary text into a valid, lowercase id token. */
function sanitizeId(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "icon";
}

/* --------------------------------- Icons ---------------------------------- */

/**
 * Normalize a batch of icon SVGs: strip fixed fills to `currentColor`, unify
 * the viewBox, and re-title. Used by the icon generator / editor. Returns the
 * normalized SVG strings in order.
 */
export function normalizeIcons(svgs: string[], options: { toCurrentColor?: boolean; viewBox?: string } = {}): string[] {
  const toCurrent = options.toCurrentColor ?? true;
  return svgs.map((svg) => {
    let out = svg.trim();
    if (toCurrent) {
      out = out.replace(/fill\s*=\s*["'](?!none)[^"']*["']/gi, 'fill="currentColor"');
      out = out.replace(/stroke\s*=\s*["'](?!none)(#[0-9a-f]{3,8}|[a-z]+)["']/gi, 'stroke="currentColor"');
    }
    if (options.viewBox) {
      out = out.replace(/(<svg\b[^>]*?)\sviewBox\s*=\s*["'][^"']*["']/i, `$1 viewBox="${escapeAttr(options.viewBox)}"`);
    }
    return out;
  });
}

/**
 * Lay out icons in a preview grid SVG (for the icon-set generator). Deterministic;
 * arranges each icon in a cell of `cell` px, `cols` per row.
 */
export function iconGrid(svgs: string[], options: { cols?: number; cell?: number; gap?: number; color?: string } = {}): string {
  const cols = Math.max(1, options.cols ?? 6);
  const cell = options.cell ?? 48;
  const gap = options.gap ?? 16;
  const rows = Math.ceil(svgs.length / cols);
  const width = cols * cell + (cols + 1) * gap;
  const height = rows * cell + (rows + 1) * gap;

  const cells = svgs
    .map((svg, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gap + col * (cell + gap);
      const y = gap + row * (cell + gap);
      const inner = /<svg\b[^>]*>([\s\S]*?)<\/svg>/i.exec(svg)?.[1] ?? "";
      const vb = /\bviewBox\s*=\s*["']([^"']+)["']/i.exec(svg)?.[1] ?? "0 0 24 24";
      return `<svg x="${n(x)}" y="${n(y)}" width="${n(cell)}" height="${n(cell)}" viewBox="${escapeAttr(vb)}">${inner}</svg>`;
    })
    .join("");

  const color = options.color ?? "#0f172a";
  return svgRoot(width, height, `<g fill="${escapeAttr(color)}">${cells}</g>`);
}
