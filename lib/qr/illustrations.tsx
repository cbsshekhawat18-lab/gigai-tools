/**
 * QR tool illustrations, deterministic, on-brand SVG artwork for the QR studio.
 *
 * Same spirit as `lib/blog-covers.ts`: instead of hand-authoring an image per
 * tool, we DERIVE one from a stable seed (the tool slug / content type) so every
 * QR tool gets a distinct-but-consistent illustration for free. Pure and
 * client-safe (no DOM, no libraries) so it renders on the server (static
 * export), in cards, and in OG images alike.
 *
 * The motif is a stylised QR matrix (three finder eyes + a seeded field of
 * modules) tinted with the design-system accent gradient, with a small "purpose
 * glyph" (wifi, card, link, menu, scan, …) floated over it so the artwork hints
 * at what the tool actually does.
 *
 * Usage:
 *   getQrIllustration("wifi-qr-code-generator", "hero")  -> inline SVG string
 *   qrIllustrationDataUrl("upi", "card")                 -> data: URL (for <img>)
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants ─────────────────────────────────────────────────────────────── */

/** Aspect + density presets. */
export type QrIllustrationVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  /** viewBox width / height. */
  readonly w: number;
  readonly h: number;
  /** QR field grid size (modules per side). */
  readonly grid: number;
  /** Whether to draw the floating purpose glyph. */
  readonly glyph: boolean;
  /** Corner radius of the outer plate, in viewBox units. */
  readonly radius: number;
}

const VARIANTS: Record<QrIllustrationVariant, VariantSpec> = {
  // Compact, glanceable, used on tool cards/grids. Square.
  icon: { w: 96, h: 96, grid: 9, glyph: false, radius: 8 },
  // Tool-card artwork, square, a touch more detail + glyph.
  card: { w: 400, h: 300, grid: 13, glyph: true, radius: 5 },
  // Full-width tool hero. Wide.
  hero: { w: 1200, h: 630, grid: 17, glyph: true, radius: 6 },
  // Slim promotional strip (category rails, CTAs).
  banner: { w: 1200, h: 300, grid: 21, glyph: true, radius: 6 },
};

/* ── Seeded PRNG (deterministic per slug) ─────────────────────────────────── */

/** FNV-1a → 32-bit unsigned seed from any string. */
function seedFrom(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: tiny, fast, deterministic PRNG. */
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

/* ── Purpose glyphs ───────────────────────────────────────────────────────── */

/**
 * Content-type / purpose → an SVG path (drawn in a 24×24 box, `currentColor`
 * stroke) that hints at the tool. Kept intentionally simple + line-based so it
 * reads at any size. The glyph is chosen from the slug via `glyphKeyFor`.
 */
const GLYPHS: Record<string, string> = {
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  wifi: "M5 12.55a11 11 0 0 1 14 0M8.5 16.1a6 6 0 0 1 7 0M12 20h.01",
  vcard:
    "M4 5h16v14H4zM4 9h16M8 13h4M8 16h6M15 14.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  link: "M9 15l6-6M10.5 6.5l1-1a4 4 0 0 1 6 6l-2 2M13.5 17.5l-1 1a4 4 0 0 1-6-6l2-2",
  upi: "M7 4l-3 8h5l-3 8 10-11h-6l4-5z",
  menu: "M4 6h16M4 12h16M4 18h10M18 15l2 2-2 2",
  email: "M3 5h18v14H3zM3 6l9 7 9-7",
  phone:
    "M6 3l3 1 1 4-2 1a11 11 0 0 0 6 6l1-2 4 1 1 3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z",
  sms: "M4 5h16v11H8l-4 4z",
  location: "M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  event: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3v3H8z",
  scan: "M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M4 12h16",
  text: "M6 6h12M6 10h12M6 14h8M6 18h10",
  logo: "M12 3l7 4v6c0 4-3 6-7 8-4-2-7-4-7-8V7z M9 12l2 2 4-4",
  bulk: "M4 4h9v9H4zM11 11h9v9h-9zM7 15h2v2H7zM15 5h2v2h-2z",
};

/** Map a slug or explicit content type to a glyph key. */
function glyphKeyFor(key: string): keyof typeof GLYPHS {
  const s = key.toLowerCase();
  const table: [RegExp, keyof typeof GLYPHS][] = [
    [/wifi|wi-fi/, "wifi"],
    [/vcard|contact/, "vcard"],
    [/upi|pay|payment/, "upi"],
    [/menu|restaurant/, "menu"],
    [/e-?mail/, "email"],
    [/sms|text-message/, "sms"],
    [/phone|call|tel/, "phone"],
    [/location|map|geo/, "location"],
    [/event|calendar|vevent/, "event"],
    [/scan|read|decod|reader/, "scan"],
    [/logo|brand|styl|design/, "logo"],
    [/bulk|batch/, "bulk"],
    [/url|link|website/, "link"],
    [/text|plain/, "text"],
  ];
  for (const [re, g] of table) if (re.test(s)) return g;
  return "qr";
}

/* ── Matrix layout helpers ────────────────────────────────────────────────── */

/** Is cell (r,c) inside one of the three 3×3 finder-eye zones? */
function inFinder(r: number, c: number, grid: number): boolean {
  const eye = 3;
  const near = (v: number, edge: number) => v >= edge && v < edge + eye;
  return (
    (near(r, 0) && near(c, 0)) ||
    (near(r, 0) && near(c, grid - eye)) ||
    (near(r, grid - eye) && near(c, 0))
  );
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface QrIllustrationOptions {
  /** Accent override; defaults to the QR studio accent (indigo). */
  accent?: AccentKey;
  /** Force a specific glyph regardless of the seed key. */
  glyph?: keyof typeof GLYPHS;
  /** Rounded ("dots") vs square modules. Defaults to rounded. */
  dots?: boolean;
}

/**
 * Build the inline SVG string for a QR-tool illustration.
 *
 * @param key Tool slug OR content type (e.g. "wifi", "upi"): seeds both the
 *                module field and the purpose glyph deterministically.
 * @param variant Size/aspect preset.
 */
export function getQrIllustration(
  key: string,
  variant: QrIllustrationVariant = "card",
  options: QrIllustrationOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, grid, radius } = spec;
  const accent = accentStyle(options.accent ?? "indigo");
  const [from, to] = accent.hex;
  const dots = options.dots ?? true;

  const rand = mulberry32(seedFrom(key));
  // A unique id so multiple inline SVGs on one page don't share defs.
  const uid = `qr-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  // ── Matrix geometry: center a square QR field within the viewBox. ─────────
  const field = Math.min(w, h) * (variant === "icon" ? 0.82 : 0.7);
  const cell = field / grid;
  const gap = cell * 0.14; // module inset for a "dot" look
  const ox = (w - field) / 2;
  // Nudge the field left on wide variants so the glyph has breathing room right.
  const oy = (h - field) / 2;
  const fx = variant === "hero" || variant === "banner" ? ox * 0.45 : ox;

  const modules: string[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (inFinder(r, c, grid)) continue;
      // Deterministic ~48% fill, slightly denser toward center for balance.
      if (rand() > 0.52) continue;
      const x = fx + c * cell + gap;
      const y = oy + r * cell + gap;
      const size = cell - gap * 2;
      const rx = dots ? size / 2 : size * 0.22;
      modules.push(
        `<rect x="${round(x)}" y="${round(y)}" width="${round(size)}" height="${round(
          size,
        )}" rx="${round(rx)}"/>`,
      );
    }
  }

  // ── Three finder eyes (outer ring + inner pupil). ─────────────────────────
  const eyes = ([
    [0, 0],
    [0, grid - 3],
    [grid - 3, 0],
  ] as const)
    .map(([er, ec]) => {
      const x = fx + ec * cell;
      const y = oy + er * cell;
      const s = cell * 3;
      const outerR = dots ? s * 0.32 : s * 0.16;
      const innerR = dots ? s * 0.2 : s * 0.1;
      const pad = s * 0.16;
      const pupR = dots ? (s - pad * 2 - s * 0.36) * 0.5 : s * 0.08;
      return (
        `<rect x="${round(x)}" y="${round(y)}" width="${round(s)}" height="${round(
          s,
        )}" rx="${round(outerR)}" fill="none" stroke="url(#${uid}-g)" stroke-width="${round(
          s * 0.18,
        )}"/>` +
        `<rect x="${round(x + s * 0.32)}" y="${round(y + s * 0.32)}" width="${round(
          s * 0.36,
        )}" height="${round(s * 0.36)}" rx="${round(pupR + innerR * 0)}" fill="url(#${uid}-g)"/>`
      );
    })
    .join("");

  // ── Optional floating purpose glyph, bottom-right, on a soft plate. ───────
  let glyph = "";
  if (spec.glyph) {
    const gk = options.glyph ?? glyphKeyFor(key);
    const path = GLYPHS[gk] ?? GLYPHS.qr;
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
    // Modules share the gradient fill
    `<g fill="url(#${uid}-g)">${modules.join("")}</g>` +
    eyes +
    glyph +
    `</svg>`
  );
}

/** Round to 2dp and drop trailing zeros: keeps the SVG string compact. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Same illustration as a `data:` URL, safe for `<img src>` / CSS `url()`. */
export function qrIllustrationDataUrl(
  key: string,
  variant: QrIllustrationVariant = "card",
  options: QrIllustrationOptions = {},
): string {
  const svg = getQrIllustration(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All glyph keys, for tooling / previews. */
export const QR_GLYPH_KEYS = Object.keys(GLYPHS) as (keyof typeof GLYPHS)[];
