/**
 * The primitive vocabulary and the deterministic renderer.
 *
 * THIS IS THE HEART OF ICONLAB, and the reason its output is consistent.
 *
 * A generator that emits raw path data: whether an LLM or a person in a hurry
 * - produces icons that drift: strokes vary, shapes sit half a pixel off the
 * grid, corner radii wander. You cannot fix that with validation afterwards,
 * because there is nothing to snap back to.
 *
 * So nothing here ever emits arbitrary geometry. An icon is described as a
 * COMPOSITION, a small list of primitives with grid coordinates, and this
 * renderer draws it using the family's DNA for stroke width, corner radius,
 * padding and linecaps. Two icons made a year apart from the same DNA are
 * therefore identical in every stylistic respect by construction, not by luck.
 *
 * All coordinates are expressed on the family's grid (default 24×24) and are
 * snapped to a half-unit lattice, which is what keeps strokes crisp.
 */

import type { IconDNA } from "./types";

/* ── Composition model ────────────────────────────────────────────────────── */

export type PrimitiveKind =
  | "rect"
  | "circle"
  | "line"
  | "polyline"
  | "arc"
  | "chevron"
  | "triangle"
  | "dot";

export interface Primitive {
  kind: PrimitiveKind;
  /** Grid coordinates, in DNA grid units. Meaning depends on `kind`. */
  points: number[];
  /** Override the DNA corner radius for this shape (grid units). */
  radius?: number;
  /** Fill instead of stroke: used sparingly, e.g. for dots and badges. */
  filled?: boolean;
}

export interface Composition {
  /** Human concept this draws, e.g. "mail". */
  concept: string;
  primitives: Primitive[];
}

/* ── Snapping ─────────────────────────────────────────────────────────────── */

/**
 * Snap to a half-unit lattice, offset so an odd stroke width straddles the
 * pixel boundary cleanly. This is the difference between a crisp icon and a
 * blurry one at 24px, and it is why the renderer owns coordinates rather than
 * trusting whatever produced the composition.
 */
function snap(value: number): number {
  return Math.round(value * 2) / 2;
}

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return String(r);
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

/** Map a composition onto the DNA's canvas, honouring padding. */
function project(dna: IconDNA) {
  const { columns, rows } = dna.grid;
  const { width, height } = dna.canvas;
  const pad = dna.spacing.outerPadding;

  // The drawable box after padding, in canvas units.
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  return {
    x: (gx: number) => snap(pad + (gx / columns) * innerW),
    y: (gy: number) => snap(pad + (gy / rows) * innerH),
    /** Scale a grid length into canvas units. */
    len: (g: number) => snap((g / columns) * innerW),
  };
}

function renderPrimitive(p: Primitive, dna: IconDNA, P: ReturnType<typeof project>): string {
  const r = dna.geometry.style === "sharp" ? 0 : (p.radius ?? dna.geometry.cornerRadius);
  const fill = p.filled ? "currentColor" : "none";
  const stroke = p.filled ? "none" : "currentColor";
  const common = `fill="${fill}" stroke="${stroke}"`;

  switch (p.kind) {
    case "rect": {
      const [x, y, w, h] = p.points as [number, number, number, number];
      const rx = Math.min(P.len(r), P.len(w) / 2, P.len(h) / 2);
      return `<rect x="${fmt(P.x(x))}" y="${fmt(P.y(y))}" width="${fmt(P.len(w))}" height="${fmt(P.len(h))}" rx="${fmt(rx)}" ${common}/>`;
    }
    case "circle": {
      const [cx, cy, rad] = p.points as [number, number, number];
      return `<circle cx="${fmt(P.x(cx))}" cy="${fmt(P.y(cy))}" r="${fmt(P.len(rad))}" ${common}/>`;
    }
    case "dot": {
      const [cx, cy] = p.points as [number, number];
      // A dot is always filled, an unfilled 1-unit circle reads as noise.
      return `<circle cx="${fmt(P.x(cx))}" cy="${fmt(P.y(cy))}" r="${fmt(P.len(0.9))}" fill="currentColor" stroke="none"/>`;
    }
    case "line": {
      const [x1, y1, x2, y2] = p.points as [number, number, number, number];
      return `<path d="M${fmt(P.x(x1))} ${fmt(P.y(y1))}L${fmt(P.x(x2))} ${fmt(P.y(y2))}" fill="none" stroke="currentColor"/>`;
    }
    case "polyline":
    case "chevron": {
      const d = p.points
        .reduce<string[]>((acc, _v, i) => {
          if (i % 2) return acc;
          const gx = p.points[i]!;
          const gy = p.points[i + 1]!;
          acc.push(`${acc.length === 0 ? "M" : "L"}${fmt(P.x(gx))} ${fmt(P.y(gy))}`);
          return acc;
        }, [])
        .join("");
      return `<path d="${d}" fill="none" stroke="currentColor"/>`;
    }
    case "triangle": {
      const [x1, y1, x2, y2, x3, y3] = p.points as [number, number, number, number, number, number];
      const d = `M${fmt(P.x(x1))} ${fmt(P.y(y1))}L${fmt(P.x(x2))} ${fmt(P.y(y2))}L${fmt(P.x(x3))} ${fmt(P.y(y3))}Z`;
      return `<path d="${d}" ${common}/>`;
    }
    case "arc": {
      // cx, cy, r, startDeg, endDeg, swept the short way.
      const [cx, cy, rad, a0, a1] = p.points as [number, number, number, number, number];
      const toXY = (deg: number) => {
        const rd = (deg * Math.PI) / 180;
        return [P.x(cx + Math.cos(rd) * rad), P.y(cy + Math.sin(rd) * rad)] as const;
      };
      const [sx, sy] = toXY(a0);
      const [ex, ey] = toXY(a1);
      const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
      const sweep = a1 > a0 ? 1 : 0;
      const rr = P.len(rad);
      return `<path d="M${fmt(sx)} ${fmt(sy)}A${fmt(rr)} ${fmt(rr)} 0 ${large} ${sweep} ${fmt(ex)} ${fmt(ey)}" fill="none" stroke="currentColor"/>`;
    }
  }
}

/** Stroke width scaled by the family's optical weight. */
function effectiveStroke(dna: IconDNA): number {
  const factor = dna.opticalWeight === "light" ? 0.8 : dna.opticalWeight === "bold" ? 1.35 : 1;
  return Math.round(dna.stroke.width * factor * 100) / 100;
}

/**
 * Render a composition to SVG using the family's DNA.
 *
 * Deterministic: the same composition and DNA always produce byte-identical
 * output, which is what makes fingerprinting and duplicate detection meaningful.
 */
export function renderComposition(comp: Composition, dna: IconDNA, title?: string): string {
  const P = project(dna);
  const body = comp.primitives.map((p) => renderPrimitive(p, dna, P)).join("");
  const sw = effectiveStroke(dna);
  const label = title ?? comp.concept;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dna.canvas.width} ${dna.canvas.height}"`,
    ` width="${dna.canvas.width}" height="${dna.canvas.height}" fill="none"`,
    ` stroke-width="${sw}" stroke-linecap="${dna.stroke.linecap}" stroke-linejoin="${dna.stroke.linejoin}"`,
    ` role="img" aria-label="${label.replace(/[<>&"]/g, "")}">`,
    body,
    `</svg>`,
  ].join("");
}

/* ── Vocabulary ───────────────────────────────────────────────────────────── */

/**
 * Built-in concepts. Deliberately hand-composed on a 24-unit grid so the common
 * cases need no AI at all, which keeps bulk generation free, instant and
 * offline. The AI layer's only job is to describe concepts that are NOT here,
 * using these same primitives.
 */
const G = 24;
const V: Record<string, Primitive[]> = {
  mail: [
    { kind: "rect", points: [2, 5, 20, 14] },
    { kind: "polyline", points: [2, 6, 12, 13.5, 22, 6] },
  ],
  calendar: [
    { kind: "rect", points: [3, 5, 18, 16] },
    { kind: "line", points: [3, 10, 21, 10] },
    { kind: "line", points: [8, 2.5, 8, 6] },
    { kind: "line", points: [16, 2.5, 16, 6] },
  ],
  search: [
    { kind: "circle", points: [10.5, 10.5, 7] },
    { kind: "line", points: [15.5, 15.5, 21, 21] },
  ],
  settings: [
    { kind: "circle", points: [12, 12, 3.2] },
    { kind: "circle", points: [12, 12, 8.5] },
    { kind: "line", points: [12, 1.5, 12, 3.5] },
    { kind: "line", points: [12, 20.5, 12, 22.5] },
    { kind: "line", points: [1.5, 12, 3.5, 12] },
    { kind: "line", points: [20.5, 12, 22.5, 12] },
  ],
  user: [
    { kind: "circle", points: [12, 8, 4] },
    { kind: "arc", points: [12, 21, 8, 200, 340] },
  ],
  users: [
    { kind: "circle", points: [9, 8, 3.6] },
    { kind: "arc", points: [9, 20, 7, 200, 340] },
    { kind: "arc", points: [17, 8, 3.6, 300, 60] },
  ],
  home: [
    { kind: "polyline", points: [2.5, 11, 12, 3, 21.5, 11] },
    { kind: "polyline", points: [5, 10.5, 5, 21, 19, 21, 19, 10.5] },
  ],
  file: [
    { kind: "polyline", points: [5, 2.5, 14, 2.5, 19, 8, 19, 21.5, 5, 21.5, 5, 2.5] },
    { kind: "polyline", points: [14, 2.5, 14, 8, 19, 8] },
  ],
  folder: [
    { kind: "polyline", points: [2.5, 6, 9, 6, 11, 9, 21.5, 9, 21.5, 20, 2.5, 20, 2.5, 6] },
  ],
  cloud: [
    { kind: "arc", points: [12, 14, 7, 180, 360] },
    { kind: "line", points: [5, 14.5, 19, 14.5] },
    { kind: "arc", points: [9, 14.5, 4, 180, 360] },
  ],
  lock: [
    { kind: "rect", points: [4.5, 10, 15, 11] },
    { kind: "arc", points: [12, 10, 4.5, 180, 360] },
  ],
  shield: [
    { kind: "polyline", points: [12, 2.5, 20.5, 6, 20.5, 12, 12, 21.5, 3.5, 12, 3.5, 6, 12, 2.5] },
  ],
  bell: [
    { kind: "arc", points: [12, 16, 7, 180, 360] },
    { kind: "line", points: [5, 16.5, 19, 16.5] },
    { kind: "arc", points: [12, 19.5, 2.4, 0, 180] },
  ],
  chart: [
    { kind: "line", points: [3, 21, 21, 21] },
    { kind: "rect", points: [5, 13, 3.5, 8] },
    { kind: "rect", points: [10.2, 8, 3.5, 13] },
    { kind: "rect", points: [15.4, 4, 3.5, 17] },
  ],
  database: [
    { kind: "arc", points: [12, 6, 8, 0, 360] },
    { kind: "line", points: [4, 6, 4, 18] },
    { kind: "line", points: [20, 6, 20, 18] },
    { kind: "arc", points: [12, 18, 8, 0, 180] },
  ],
  code: [
    { kind: "polyline", points: [8, 7, 3, 12, 8, 17] },
    { kind: "polyline", points: [16, 7, 21, 12, 16, 17] },
  ],
  link: [
    { kind: "arc", points: [8.5, 12, 5, 90, 270] },
    { kind: "arc", points: [15.5, 12, 5, 270, 90] },
    { kind: "line", points: [8, 12, 16, 12] },
  ],
  download: [
    { kind: "line", points: [12, 3, 12, 15] },
    { kind: "polyline", points: [7, 10.5, 12, 15.5, 17, 10.5] },
    { kind: "polyline", points: [3.5, 18, 3.5, 21, 20.5, 21, 20.5, 18] },
  ],
  upload: [
    { kind: "line", points: [12, 15.5, 12, 3.5] },
    { kind: "polyline", points: [7, 8.5, 12, 3.5, 17, 8.5] },
    { kind: "polyline", points: [3.5, 18, 3.5, 21, 20.5, 21, 20.5, 18] },
  ],
  trash: [
    { kind: "line", points: [3, 6, 21, 6] },
    { kind: "polyline", points: [5.5, 6, 6.5, 21, 17.5, 21, 18.5, 6] },
    { kind: "polyline", points: [9, 6, 9, 3, 15, 3, 15, 6] },
  ],
  plus: [
    { kind: "line", points: [12, 4, 12, 20] },
    { kind: "line", points: [4, 12, 20, 12] },
  ],
  check: [{ kind: "polyline", points: [4, 12.5, 9.5, 18, 20, 6.5] }],
  close: [
    { kind: "line", points: [5, 5, 19, 19] },
    { kind: "line", points: [19, 5, 5, 19] },
  ],
  star: [
    { kind: "polyline", points: [12, 2.5, 15, 9, 21.5, 9.8, 16.8, 14.4, 18, 21, 12, 17.8, 6, 21, 7.2, 14.4, 2.5, 9.8, 9, 9, 12, 2.5] },
  ],
  heart: [
    { kind: "arc", points: [8.5, 9, 4.2, 180, 360] },
    { kind: "arc", points: [15.5, 9, 4.2, 180, 360] },
    { kind: "polyline", points: [4.3, 10, 12, 20.5, 19.7, 10] },
  ],
  clock: [
    { kind: "circle", points: [12, 12, 9] },
    { kind: "polyline", points: [12, 6.5, 12, 12, 16.5, 14] },
  ],
  robot: [
    { kind: "rect", points: [4, 8, 16, 12] },
    { kind: "dot", points: [9, 13] },
    { kind: "dot", points: [15, 13] },
    { kind: "line", points: [12, 4, 12, 8] },
    { kind: "dot", points: [12, 3.5] },
  ],
  sparkles: [
    { kind: "polyline", points: [9, 3, 10.6, 7.4, 15, 9, 10.6, 10.6, 9, 15, 7.4, 10.6, 3, 9, 7.4, 7.4, 9, 3] },
    { kind: "polyline", points: [17.5, 13, 18.4, 15.6, 21, 16.5, 18.4, 17.4, 17.5, 20, 16.6, 17.4, 14, 16.5, 16.6, 15.6, 17.5, 13] },
  ],
  card: [
    { kind: "rect", points: [2.5, 5, 19, 14] },
    { kind: "line", points: [2.5, 10, 21.5, 10] },
    { kind: "line", points: [6, 15.5, 10, 15.5] },
  ],
  globe: [
    { kind: "circle", points: [12, 12, 9] },
    { kind: "line", points: [3, 12, 21, 12] },
    { kind: "arc", points: [12, 12, 9, 270, 90] },
  ],
  filter: [
    { kind: "polyline", points: [3, 5, 21, 5, 14, 13, 14, 20, 10, 18, 10, 13, 3, 5] },
  ],
  menu: [
    { kind: "line", points: [3.5, 7, 20.5, 7] },
    { kind: "line", points: [3.5, 12, 20.5, 12] },
    { kind: "line", points: [3.5, 17, 20.5, 17] },
  ],
  play: [{ kind: "triangle", points: [8, 5, 19, 12, 8, 19] }],
  image: [
    { kind: "rect", points: [3, 5, 18, 14] },
    { kind: "circle", points: [8.5, 10, 1.8] },
    { kind: "polyline", points: [4, 17, 10, 12.5, 15, 16, 18, 14, 20, 15.5] },
  ],
  message: [
    { kind: "rect", points: [3, 4.5, 18, 13] },
    { kind: "polyline", points: [8, 17.5, 8, 21, 12.5, 17.5] },
  ],
  key: [
    { kind: "circle", points: [8, 16, 4.2] },
    { kind: "line", points: [11, 13, 20, 4] },
    { kind: "line", points: [17, 7, 19.5, 9.5] },
  ],

  /* ── Navigation & layout ──────────────────────────────────────────────── */
  grid: [
    { kind: "rect", points: [3, 3, 8, 8] },
    { kind: "rect", points: [13, 3, 8, 8] },
    { kind: "rect", points: [3, 13, 8, 8] },
    { kind: "rect", points: [13, 13, 8, 8] },
  ],
  list: [
    { kind: "line", points: [8, 6, 21, 6] },
    { kind: "line", points: [8, 12, 21, 12] },
    { kind: "line", points: [8, 18, 21, 18] },
    { kind: "dot", points: [4, 6] },
    { kind: "dot", points: [4, 12] },
    { kind: "dot", points: [4, 18] },
  ],
  columns: [
    { kind: "rect", points: [3, 4, 7.5, 16] },
    { kind: "rect", points: [13.5, 4, 7.5, 16] },
  ],
  sidebar: [
    { kind: "rect", points: [3, 4, 18, 16] },
    { kind: "line", points: [9.5, 4, 9.5, 20] },
  ],
  maximize: [
    { kind: "polyline", points: [9, 3, 3, 3, 3, 9] },
    { kind: "polyline", points: [15, 3, 21, 3, 21, 9] },
    { kind: "polyline", points: [21, 15, 21, 21, 15, 21] },
    { kind: "polyline", points: [9, 21, 3, 21, 3, 15] },
  ],
  "arrow-right": [
    { kind: "line", points: [3, 12, 20, 12] },
    { kind: "polyline", points: [14, 6, 20.5, 12, 14, 18] },
  ],
  "arrow-left": [
    { kind: "line", points: [21, 12, 4, 12] },
    { kind: "polyline", points: [10, 6, 3.5, 12, 10, 18] },
  ],
  "arrow-up": [
    { kind: "line", points: [12, 21, 12, 4] },
    { kind: "polyline", points: [6, 10, 12, 3.5, 18, 10] },
  ],
  "arrow-down": [
    { kind: "line", points: [12, 3, 12, 20] },
    { kind: "polyline", points: [6, 14, 12, 20.5, 18, 14] },
  ],
  refresh: [
    { kind: "arc", points: [12, 12, 8, 60, 330] },
    { kind: "polyline", points: [16, 2.5, 16.5, 8, 21.5, 7] },
  ],
  external: [
    { kind: "polyline", points: [13, 4, 20, 4, 20, 11] },
    { kind: "line", points: [20, 4, 11, 13] },
    { kind: "polyline", points: [17, 15, 17, 20, 4, 20, 4, 7, 9, 7] },
  ],

  /* ── Communication & social ───────────────────────────────────────────── */
  phone: [
    { kind: "rect", points: [7, 2, 10, 20], radius: 2.5 },
    { kind: "line", points: [10.5, 19, 13.5, 19] },
  ],
  send: [
    { kind: "polyline", points: [21, 3, 3, 10, 11, 13, 14, 21, 21, 3] },
  ],
  megaphone: [
    { kind: "polyline", points: [4, 10, 4, 15, 15, 20, 15, 5, 4, 10] },
    { kind: "line", points: [17, 9, 21, 8] },
    { kind: "line", points: [17, 15, 21, 16] },
  ],
  video: [
    { kind: "rect", points: [2, 6, 14, 12] },
    { kind: "triangle", points: [17, 9, 22, 6.5, 22, 17.5] },
  ],
  mic: [
    { kind: "rect", points: [9, 2, 6, 12], radius: 3 },
    { kind: "arc", points: [12, 13, 6, 0, 180] },
    { kind: "line", points: [12, 19, 12, 22] },
  ],
  "thumbs-up": [
    { kind: "polyline", points: [7, 10, 11, 3, 13, 3, 12, 9, 20, 9, 19, 20, 7, 20, 7, 10] },
    { kind: "rect", points: [2.5, 10, 4, 10] },
  ],

  /* ── Business, finance & commerce ─────────────────────────────────────── */
  briefcase: [
    { kind: "rect", points: [2.5, 7, 19, 13] },
    { kind: "polyline", points: [8, 7, 8, 3.5, 16, 3.5, 16, 7] },
  ],
  cart: [
    { kind: "polyline", points: [2, 3, 5, 3, 7.5, 15, 19, 15, 21, 7, 6, 7] },
    { kind: "dot", points: [8.5, 19.5] },
    { kind: "dot", points: [17.5, 19.5] },
  ],
  tag: [
    { kind: "polyline", points: [11, 2.5, 21.5, 13, 13, 21.5, 2.5, 11, 2.5, 2.5, 11, 2.5] },
    { kind: "dot", points: [7, 7] },
  ],
  wallet: [
    { kind: "polyline", points: [20, 7, 4, 7, 4, 5, 17, 3.5, 17, 7] },
    { kind: "rect", points: [2.5, 7, 19, 13.5] },
    { kind: "rect", points: [15, 11.5, 6.5, 4.5] },
    { kind: "dot", points: [18, 13.7] },
  ],
  receipt: [
    { kind: "polyline", points: [5, 2.5, 19, 2.5, 19, 21.5, 16, 19.5, 12, 21.5, 8, 19.5, 5, 21.5, 5, 2.5] },
    { kind: "line", points: [9, 8, 15, 8] },
    { kind: "line", points: [9, 13, 15, 13] },
  ],
  "trending-up": [
    { kind: "polyline", points: [3, 17, 9, 11, 13, 15, 21, 6] },
    { kind: "polyline", points: [16, 6, 21.5, 6, 21.5, 11] },
  ],
  "trending-down": [
    { kind: "polyline", points: [3, 7, 9, 13, 13, 9, 21, 18] },
    { kind: "polyline", points: [16, 18, 21.5, 18, 21.5, 13] },
  ],
  target: [
    { kind: "circle", points: [12, 12, 9] },
    { kind: "circle", points: [12, 12, 5.2] },
    { kind: "dot", points: [12, 12] },
  ],
  award: [
    { kind: "circle", points: [12, 9, 6.2] },
    { kind: "polyline", points: [8, 14, 6.5, 22, 12, 19, 17.5, 22, 16, 14] },
  ],
  gift: [
    { kind: "rect", points: [2.5, 9, 19, 12] },
    { kind: "line", points: [12, 9, 12, 21] },
    { kind: "arc", points: [8.5, 6.5, 3, 0, 300] },
    { kind: "arc", points: [15.5, 6.5, 3, 240, 540] },
  ],

  /* ── Files, media & data ──────────────────────────────────────────────── */
  copy: [
    { kind: "rect", points: [8, 8, 13, 13] },
    { kind: "polyline", points: [4.5, 15, 3, 15, 3, 3, 15, 3, 15, 4.5] },
  ],
  save: [
    { kind: "polyline", points: [3, 3, 17, 3, 21, 7, 21, 21, 3, 21, 3, 3] },
    { kind: "rect", points: [7, 13, 10, 8] },
    { kind: "rect", points: [7, 3, 8, 5] },
  ],
  archive: [
    { kind: "rect", points: [2.5, 3, 19, 5] },
    { kind: "polyline", points: [4.5, 8, 4.5, 21, 19.5, 21, 19.5, 8] },
    { kind: "line", points: [9.5, 13, 14.5, 13] },
  ],
  bookmark: [
    { kind: "polyline", points: [6, 2.5, 18, 2.5, 18, 21.5, 12, 16.5, 6, 21.5, 6, 2.5] },
  ],
  film: [
    { kind: "rect", points: [2.5, 4, 19, 16] },
    { kind: "line", points: [7, 4, 7, 20] },
    { kind: "line", points: [17, 4, 17, 20] },
    { kind: "line", points: [2.5, 12, 21.5, 12] },
  ],
  headphones: [
    { kind: "arc", points: [12, 12, 9, 180, 360] },
    { kind: "rect", points: [3, 12, 4.5, 8], radius: 2 },
    { kind: "rect", points: [16.5, 12, 4.5, 8], radius: 2 },
  ],
  volume: [
    { kind: "polyline", points: [3, 9, 7, 9, 12, 4, 12, 20, 7, 15, 3, 15, 3, 9] },
    { kind: "arc", points: [14, 12, 4, 300, 60] },
  ],
  layers: [
    { kind: "polyline", points: [12, 2.5, 21.5, 8, 12, 13.5, 2.5, 8, 12, 2.5] },
    { kind: "polyline", points: [3.5, 13, 12, 18, 20.5, 13] },
  ],
  "pie-chart": [
    { kind: "arc", points: [11, 13, 8.5, 275, 210] },
    { kind: "polyline", points: [11, 4.5, 11, 13, 3.5, 17.5] },
    { kind: "arc", points: [14, 10, 8.5, 280, 355] },
    { kind: "line", points: [14, 1.5, 14, 10] },
  ],
  activity: [
    { kind: "polyline", points: [2.5, 12, 7, 12, 10, 5, 14, 19, 17, 12, 21.5, 12] },
  ],

  /* ── Developer & system ───────────────────────────────────────────────── */
  terminal: [
    { kind: "rect", points: [2.5, 4, 19, 16] },
    { kind: "polyline", points: [6, 10, 9.5, 13, 6, 16] },
    { kind: "line", points: [12, 16.5, 17, 16.5] },
  ],
  git: [
    { kind: "dot", points: [7, 5] },
    { kind: "dot", points: [7, 19] },
    { kind: "dot", points: [17, 12] },
    { kind: "line", points: [7, 6, 7, 18] },
    { kind: "arc", points: [11, 12, 6, 300, 60] },
  ],
  cpu: [
    { kind: "rect", points: [6, 6, 12, 12], radius: 1.5 },
    { kind: "rect", points: [9.5, 9.5, 5, 5], radius: 1 },
    { kind: "line", points: [10, 2.5, 10, 6] },
    { kind: "line", points: [14, 2.5, 14, 6] },
    { kind: "line", points: [10, 18, 10, 21.5] },
    { kind: "line", points: [14, 18, 14, 21.5] },
  ],
  bug: [
    { kind: "rect", points: [7, 7, 10, 13], radius: 5 },
    { kind: "line", points: [2.5, 11, 7, 11] },
    { kind: "line", points: [17, 11, 21.5, 11] },
    { kind: "line", points: [2.5, 17, 7, 17] },
    { kind: "line", points: [17, 17, 21.5, 17] },
  ],
  package: [
    { kind: "polyline", points: [12, 2.5, 21.5, 7, 21.5, 17, 12, 21.5, 2.5, 17, 2.5, 7, 12, 2.5] },
    { kind: "line", points: [2.5, 7, 12, 12] },
    { kind: "line", points: [12, 12, 12, 21.5] },
  ],
  branch: [
    { kind: "dot", points: [6, 4] },
    { kind: "dot", points: [6, 20] },
    { kind: "dot", points: [18, 8] },
    { kind: "line", points: [6, 5, 6, 19] },
    { kind: "polyline", points: [18, 9, 18, 12, 7, 14] },
  ],
  wifi: [
    { kind: "arc", points: [12, 18, 9, 210, 330] },
    { kind: "arc", points: [12, 18, 5.5, 210, 330] },
    { kind: "dot", points: [12, 18] },
  ],
  power: [
    { kind: "arc", points: [12, 13, 7.5, 300, 240] },
    { kind: "line", points: [12, 2.5, 12, 10] },
  ],

  /* ── Security & status ────────────────────────────────────────────────── */
  eye: [
    { kind: "arc", points: [12, 16, 10, 200, 340] },
    { kind: "arc", points: [12, 8, 10, 20, 160] },
    { kind: "circle", points: [12, 12, 3.2] },
  ],
  "eye-off": [
    { kind: "arc", points: [12, 16, 10, 200, 340] },
    { kind: "line", points: [4, 20, 20, 4] },
  ],
  fingerprint: [
    { kind: "arc", points: [12, 13, 9, 200, 340] },
    { kind: "arc", points: [12, 13, 6, 200, 340] },
    { kind: "arc", points: [12, 13, 3, 200, 340] },
  ],
  info: [
    { kind: "circle", points: [12, 12, 9] },
    { kind: "line", points: [12, 11, 12, 17] },
    { kind: "dot", points: [12, 7.5] },
  ],
  warning: [
    { kind: "polyline", points: [12, 3, 22, 20.5, 2, 20.5, 12, 3] },
    { kind: "line", points: [12, 10, 12, 15] },
    { kind: "dot", points: [12, 18] },
  ],
  ban: [
    { kind: "circle", points: [12, 12, 8.5] },
    { kind: "line", points: [18, 6, 6, 18] },
  ],
  verified: [
    { kind: "polyline", points: [12, 2.5, 15, 5.5, 19, 5, 19.5, 9, 22, 12, 19.5, 15, 19, 19, 15, 18.5, 12, 21.5, 9, 18.5, 5, 19, 4.5, 15, 2, 12, 4.5, 9, 5, 5, 9, 5.5, 12, 2.5] },
    { kind: "polyline", points: [8, 12, 11, 15, 16, 9] },
  ],

  /* ── People, health & misc ────────────────────────────────────────────── */
  "user-plus": [
    { kind: "circle", points: [9, 8, 4] },
    { kind: "arc", points: [9, 21, 7.5, 200, 340] },
    { kind: "line", points: [18, 6, 18, 12] },
    { kind: "line", points: [15, 9, 21, 9] },
  ],
  building: [
    { kind: "rect", points: [4, 3, 16, 18] },
    { kind: "line", points: [8, 7, 8, 7.5] },
    { kind: "rect", points: [7, 6, 3, 3] },
    { kind: "rect", points: [14, 6, 3, 3] },
    { kind: "rect", points: [7, 12, 3, 3] },
    { kind: "rect", points: [14, 12, 3, 3] },
  ],
  map: [
    { kind: "polyline", points: [2.5, 5.5, 9, 3, 15, 6, 21.5, 3.5, 21.5, 18.5, 15, 21, 9, 18, 2.5, 20.5, 2.5, 5.5] },
    { kind: "line", points: [9, 3, 9, 18] },
    { kind: "line", points: [15, 6, 15, 21] },
  ],
  pin: [
    { kind: "arc", points: [12, 9.5, 6.5, 0, 360] },
    { kind: "polyline", points: [7, 13, 12, 21.5, 17, 13] },
    { kind: "dot", points: [12, 9.5] },
  ],
  sun: [
    { kind: "circle", points: [12, 12, 4.5] },
    { kind: "line", points: [12, 2, 12, 4.5] },
    { kind: "line", points: [12, 19.5, 12, 22] },
    { kind: "line", points: [2, 12, 4.5, 12] },
    { kind: "line", points: [19.5, 12, 22, 12] },
  ],
  moon: [
    { kind: "arc", points: [12, 12, 9, 300, 120] },
    { kind: "arc", points: [16, 12, 7.5, 120, 300] },
  ],
  zap: [
    { kind: "polyline", points: [13, 2.5, 5, 13.5, 11.5, 13.5, 10.5, 21.5, 19, 10.5, 12.5, 10.5, 13, 2.5] },
  ],
  flag: [
    { kind: "line", points: [5, 2.5, 5, 21.5] },
    { kind: "polyline", points: [5, 4, 19, 4, 16, 9, 19, 14, 5, 14] },
  ],
  edit: [
    { kind: "polyline", points: [4, 20, 4, 15.5, 16, 3.5, 20.5, 8, 8.5, 20, 4, 20] },
    { kind: "line", points: [13.5, 6, 18, 10.5] },
  ],
  "arrow-repeat": [
    { kind: "polyline", points: [4, 8, 18, 8, 15, 5] },
    { kind: "polyline", points: [20, 16, 6, 16, 9, 19] },
  ],
};

export const VOCABULARY = Object.keys(V);

/** Aliases so natural concept names resolve to a built-in composition. */
const ALIASES: Record<string, string> = {
  email: "mail", envelope: "mail", inbox: "mail",
  dashboard: "chart", analytics: "chart", stats: "chart", graph: "chart",
  security: "shield", protect: "shield", secure: "shield",
  password: "lock", locked: "lock", privacy: "lock",
  account: "user", profile: "user", person: "user",
  team: "users", group: "users", people: "users",
  document: "file", page: "file", doc: "file",
  directory: "folder", files: "folder",
  storage: "database", server: "database", data: "database",
  developer: "code", api: "code", terminal: "code",
  notification: "bell", alert: "bell", reminder: "bell",
  billing: "card", payment: "card", invoice: "card", pricing: "card",
  ai: "sparkles", magic: "sparkles", assistant: "sparkles", generate: "sparkles",
  bot: "robot", agent: "robot", automation: "robot",
  time: "clock", history: "clock", schedule: "clock", recent: "clock",
  favorite: "star", favourite: "star", bookmark: "star",
  like: "heart", love: "heart",
  world: "globe", language: "globe", web: "globe", internet: "globe",
  add: "plus", new: "plus", create: "plus",
  done: "check", success: "check", complete: "check", approve: "check",
  cancel: "close", remove: "close", exit: "close",
  delete: "trash", bin: "trash",
  config: "settings", preferences: "settings", gear: "settings",
  photo: "image", picture: "image", gallery: "image", media: "image",
  chat: "message", comment: "message", support: "message",
  auth: "key", token: "key", credentials: "key",
  sort: "filter", refine: "filter",
  navigation: "menu", more: "menu",
  video: "play", start: "play", run: "play",
  share: "link", url: "link", connect: "link", integration: "link",

  layout: "grid", apps: "grid", modules: "grid", categories: "grid",
  items: "list", tasks: "list", todo: "list", queue: "list",
  compare: "columns", split: "columns", panels: "columns",
  fullscreen: "maximize", expand: "maximize",
  next: "arrow-right", forward: "arrow-right", continue: "arrow-right",
  back: "arrow-left", previous: "arrow-left", return: "arrow-left",
  top: "arrow-up", increase: "arrow-up",
  bottom: "arrow-down", decrease: "arrow-down",
  reload: "refresh", sync: "refresh", retry: "refresh", update: "refresh",
  "open-in-new": "external", launch: "external",
  call: "phone", mobile: "phone", contact: "phone",
  submit: "send", deliver: "send",
  announce: "megaphone", marketing: "megaphone", campaign: "megaphone",
  recording: "video", camera: "video", stream: "video",
  microphone: "mic", voice: "mic", audio: "mic", podcast: "mic",
  vote: "thumbs-up", endorse: "thumbs-up",

  work: "briefcase", job: "briefcase", portfolio: "briefcase", company: "briefcase",
  shop: "cart", ecommerce: "cart", basket: "cart", checkout: "cart",
  label: "tag", price: "tag", discount: "tag",
  balance: "wallet", funds: "wallet", money: "wallet",
  order: "receipt", transaction: "receipt", bill: "receipt",
  growth: "trending-up", revenue: "trending-up", performance: "trending-up",
  decline: "trending-down", loss: "trending-down", churn: "trending-down",
  goal: "target", objective: "target", precision: "target", focus: "target",
  achievement: "award", certificate: "award", badge: "award", reward: "award",
  bonus: "gift", promo: "gift", referral: "gift",

  duplicate: "copy", clone: "copy",
  export: "save", store: "save",
  archived: "archive", backup: "archive",
  saved: "bookmark", pinned: "bookmark", read_later: "bookmark",
  movie: "film", cinema: "film", clip: "film",
  listen: "headphones", support_agent: "headphones",
  sound: "volume", speaker: "volume",
  stack: "layers", versions: "layers", tiers: "layers",
  breakdown: "pie-chart", distribution: "pie-chart", share_of: "pie-chart",
  monitoring: "activity", pulse: "activity", uptime: "activity", health: "activity",

  console: "terminal", shell: "terminal", cli: "terminal",
  repository: "git", commit: "git", version_control: "git",
  processor: "cpu", compute: "cpu", hardware: "cpu",
  issue: "bug", defect: "bug", debug: "bug",
  library: "package", dependency: "package", release: "package", shipment: "package",
  fork: "branch", "pull-request": "branch", workflow: "branch",
  network: "wifi", signal: "wifi", online: "wifi",
  shutdown: "power", restart: "power", energy: "power",

  view: "eye", preview: "eye", visible: "eye", watch: "eye",
  hidden: "eye-off", hide: "eye-off", private: "eye-off",
  biometric: "fingerprint", identity: "fingerprint",
  about: "info", help: "info", details: "info",
  caution: "warning", risk: "warning", error: "warning",
  blocked: "ban", forbidden: "ban", restricted: "ban",
  trusted: "verified", official: "verified", certified: "verified",

  invite: "user-plus", signup: "user-plus", "add-user": "user-plus",
  office: "building", organization: "building", enterprise: "building", property: "building",
  location: "map", region: "map", territory: "map",
  place: "pin", address: "pin", marker: "pin",
  light: "sun", day: "sun", bright: "sun",
  dark: "moon", night: "moon", sleep: "moon",
  fast: "zap", instant: "zap", boost: "zap", energy_bolt: "zap",
  report: "flag", flagged: "flag", milestone: "flag",
  write: "edit", compose: "edit", pencil: "edit", modify: "edit",
  swap: "arrow-repeat", exchange: "arrow-repeat", transfer: "arrow-repeat",
};

/** Resolve a free-text concept to a built-in composition, if one exists. */
export function lookupConcept(concept: string): Composition | null {
  const key = concept.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "");
  const direct = V[key];
  if (direct) return { concept: key, primitives: direct };

  const alias = ALIASES[key];
  if (alias && V[alias]) return { concept: key, primitives: V[alias]! };

  // Try individual words, "user settings" should find "settings".
  for (const word of key.split(/[\s-]+/).reverse()) {
    if (V[word]) return { concept: key, primitives: V[word]! };
    const a = ALIASES[word];
    if (a && V[a]) return { concept: key, primitives: V[a]! };
  }
  return null;
}

/**
 * Vary a composition deterministically from a seed, used when regenerating
 * after a similarity collision. Nudges positions within the grid rather than
 * inventing geometry, so the result stays on-style.
 */
export function varyComposition(comp: Composition, seed: number): Composition {
  // Offsets deliberately exclude 0, an earlier version computed the jitter as
  // ((seed % 5) - 2) * 0.5, which is exactly 0 for seed 7, so "regenerate after
  // a collision" returned the identical icon and the retry loop could never
  // clear. Every step here moves something.
  const OFFSETS = [1, -1, 1.5, -1.5, 2, -2];
  const dx = OFFSETS[seed % OFFSETS.length]!;
  const dy = OFFSETS[(seed + 2) % OFFSETS.length]!;
  const clamp = (v: number) => Math.min(G - 1, Math.max(1, v));

  return {
    concept: comp.concept,
    primitives: comp.primitives.map((p, i) => {
      if (p.kind === "dot") return p;
      // Alternate which axis moves, so the whole icon doesn't merely translate
      // (a pure translation keeps every internal relationship and still reads
      // as the same drawing).
      const shiftX = i % 2 === 0;
      return {
        ...p,
        radius: p.radius,
        points: p.points.map((v, j) => {
          const isX = j % 2 === 0;
          if (isX && shiftX) return clamp(v + dx);
          if (!isX && !shiftX) return clamp(v + dy);
          return v;
        }),
      };
    }),
  };
}
