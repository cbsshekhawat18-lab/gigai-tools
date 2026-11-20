/**
 * SEO tool illustrations, deterministic, on-brand SVG artwork for the
 * Website & SEO toolkit.
 *
 * Same design language and contract as `lib/qr/illustrations`: given a stable
 * seed (a tool slug or a group key like "meta"/"schema"/"sitemap") we DERIVE a
 * distinct-but-consistent illustration so every SEO tool gets branded artwork
 * for free. Pure and client-safe (no DOM, no libraries) so it renders on the
 * server (static export), in tool cards, hero banners and OG images alike.
 *
 * The motif is a stylised "search & structure" scene: a browser/search plate
 * with a result-snippet skeleton (title + url + description lines) behind a
 * seeded field of connector nodes, tinted with the design-system accent
 * gradient, with a small "purpose glyph" (search, code braces, sitemap, share,
 * robot, link, …) floated over it hinting at the tool's group.
 *
 * Usage:
 *   getSeoIllustration("meta-tag-generator", "hero")  -> inline SVG string
 *   seoIllustrationDataUrl("schema", "card")          -> data: URL (for <img>)
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants (aspect + density presets; shared vocabulary with QR art) ─────── */

export type SeoIllustrationVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  readonly w: number;
  readonly h: number;
  /** Connector-node grid size (nodes per side of the seeded field). */
  readonly grid: number;
  /** Whether to draw the floating purpose glyph. */
  readonly glyph: boolean;
  /** Whether to draw the search-result snippet skeleton. */
  readonly snippet: boolean;
  /** Corner radius of the outer plate, in viewBox units. */
  readonly radius: number;
}

const VARIANTS: Record<SeoIllustrationVariant, VariantSpec> = {
  icon: { w: 96, h: 96, grid: 5, glyph: false, snippet: false, radius: 8 },
  card: { w: 400, h: 300, grid: 7, glyph: true, snippet: true, radius: 5 },
  hero: { w: 1200, h: 630, grid: 9, glyph: true, snippet: true, radius: 6 },
  banner: { w: 1200, h: 300, grid: 11, glyph: true, snippet: true, radius: 6 },
};

/* ── Seeded PRNG (deterministic per seed) ─────────────────────────────────── */

function seedFrom(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

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
 * also understands the SEO group labels ("Meta Tags", "Schema", …).
 */
const GLYPHS: Record<string, string> = {
  search: "M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M21 21l-5-5",
  meta: "M4 4h16v4H4zM4 12h16M4 16h10M4 20h13",
  schema:
    "M12 3l3 2v4l-3 2-3-2V5zM5 14l3 2v4l-3 2-3-2v-4zM19 14l3 2v4l-3 2-3-2v-4zM12 11v3M12 14l-6 3M12 14l6 3",
  sitemap:
    "M9 3h6v4H9zM3 17h6v4H3zM15 17h6v4h-6zM12 7v4M12 11H6v6M12 11h6v6",
  robot:
    "M9 2v3M15 2v3M5 8h14v11H5zM9 13h.01M15 13h.01M9 16h6M2 12h3M19 12h3",
  share:
    "M18 5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M18 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M8.6 10.7l6.8-4M8.6 13.3l6.8 4",
  link: "M9 15l6-6M10.5 6.5l1-1a4 4 0 0 1 6 6l-2 2M13.5 17.5l-1 1a4 4 0 0 1-6-6l2-2",
  check:
    "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  content: "M6 4h12M6 8h12M6 12h12M6 16h8M6 20h10",
  preview:
    "M2 5h20v14H2zM2 9h20M5 7h.01M8 7h.01M11 7h.01M6 13h12M6 16h7",
  headers:
    "M4 4h16v4H4zM6 12h12M6 16h9M18 12l2 2-2 2",
  tag: "M4 4h8l8 8-8 8-8-8zM8.5 8.5h.01",
};

/** Map a seed (slug or group label) to a glyph key. */
function glyphKeyFor(key: string): keyof typeof GLYPHS {
  const s = key.toLowerCase();
  const table: [RegExp, keyof typeof GLYPHS][] = [
    [/schema|structured|json-?ld|rich-?result/, "schema"],
    [/sitemap/, "sitemap"],
    [/robot|crawl/, "robot"],
    [/open-?graph|og-|twitter|social|share/, "share"],
    [/serp|preview|snippet|google/, "preview"],
    [/header|security|hsts|csp|ssl/, "headers"],
    [/canonical|redirect|url|slug|link/, "link"],
    [/valid|check|lint|test|audit/, "check"],
    [/content|keyword|readab|word-?count|text/, "content"],
    [/meta|title|description|tag/, "meta"],
  ];
  for (const [re, g] of table) if (re.test(s)) return g;
  return "search";
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface SeoIllustrationOptions {
  /** Accent override; defaults to the SEO toolkit accent (emerald). */
  accent?: AccentKey;
  /** Force a specific glyph regardless of the seed key. */
  glyph?: keyof typeof GLYPHS;
}

/**
 * Build the inline SVG string for an SEO-tool illustration.
 *
 * @param key Tool slug OR group key (e.g. "meta", "schema", "sitemap") -
 *                seeds both the connector field and the purpose glyph.
 * @param variant Size/aspect preset.
 */
export function getSeoIllustration(
  key: string,
  variant: SeoIllustrationVariant = "card",
  options: SeoIllustrationOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, grid, radius } = spec;
  const accent = accentStyle(options.accent ?? "emerald");
  const [from, to] = accent.hex;

  const rand = mulberry32(seedFrom(key));
  const uid = `seo-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  // ── Connector node field (subtle "structure/graph" motif) ─────────────────
  const field = Math.min(w, h) * (variant === "icon" ? 0.82 : 0.66);
  const step = field / (grid - 1);
  const ox = (w - field) / 2;
  const oy = (h - field) / 2;
  // Nudge the field left on wide variants so glyph + snippet have room right.
  const fx = variant === "hero" || variant === "banner" ? ox * 0.4 : ox;

  const pts: [number, number][] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Deterministic ~45% of the lattice becomes an active node.
      if (rand() > 0.45) continue;
      pts.push([round(fx + c * step), round(oy + r * step)]);
    }
  }

  // Edges: connect each active node to its nearest active neighbour to the
  // right/below, forming a light "site graph".
  const edges: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i]!;
      const b = pts[j]!;
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const d = Math.hypot(dx, dy);
      if (d <= step * 1.2 && rand() > 0.4) {
        edges.push(
          `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`,
        );
      }
    }
  }

  const nodeR = round(step * (variant === "icon" ? 0.16 : 0.13));
  const nodes = pts
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${nodeR}"/>`)
    .join("");

  // ── Search-result snippet skeleton (title + url + description lines) ───────
  let snippet = "";
  if (spec.snippet) {
    const sw = field * (variant === "banner" ? 0.5 : 0.62);
    const sx = round(fx + Math.min(w, h) * 0.05);
    const sy = round(oy + Math.min(w, h) * 0.08);
    const lh = round(Math.min(w, h) * 0.055);
    const bar = (dy: number, wPct: number, opacity: number, tall = false) =>
      `<rect x="${sx}" y="${round(sy + dy)}" width="${round(sw * wPct)}" height="${round(
        tall ? lh * 1.05 : lh * 0.5,
      )}" rx="${round(lh * 0.28)}" fill="url(#${uid}-g)" opacity="${opacity}"/>`;
    snippet =
      bar(0, 0.72, 0.95, true) +
      bar(lh * 1.5, 0.42, 0.5) +
      bar(lh * 2.4, 0.96, 0.28) +
      bar(lh * 3.2, 0.8, 0.28);
  }

  // ── Optional floating purpose glyph, bottom-right, on a soft plate. ───────
  let glyph = "";
  if (spec.glyph) {
    const gk = options.glyph ?? glyphKeyFor(key);
    const path = GLYPHS[gk] ?? GLYPHS.search;
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
    // Snippet skeleton behind the graph
    snippet +
    // Graph edges (thin, translucent) then nodes (gradient fill)
    `<g stroke="url(#${uid}-g)" stroke-width="${round(
      Math.min(w, h) * 0.006,
    )}" opacity="0.55">${edges.join("")}</g>` +
    `<g fill="url(#${uid}-g)">${nodes}</g>` +
    glyph +
    `</svg>`
  );
}

/** Round to 2dp and drop trailing zeros. Keeps the SVG string compact. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Same illustration as a `data:` URL, safe for `<img src>` / CSS `url()`. */
export function seoIllustrationDataUrl(
  key: string,
  variant: SeoIllustrationVariant = "card",
  options: SeoIllustrationOptions = {},
): string {
  const svg = getSeoIllustration(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All glyph keys, for tooling / previews. */
export const SEO_GLYPH_KEYS = Object.keys(GLYPHS) as (keyof typeof GLYPHS)[];
