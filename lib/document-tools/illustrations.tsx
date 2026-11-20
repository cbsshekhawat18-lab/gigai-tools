/**
 * Document tool illustrations, deterministic, on-brand SVG artwork for the
 * Document Studio.
 *
 * Same design language and contract as `lib/qr/illustrations`,
 * `lib/seo-tools/illustrations` and `lib/svg-tools/illustrations`: given a
 * stable seed (a tool slug or a group key like "convert"/"data"/"office"/
 * "edit"/"read") we DERIVE a distinct-but-consistent illustration so every
 * document tool gets branded artwork for free. Pure and client-safe. No DOM,
 * no libraries, so it renders on the server (static export), in tool cards,
 * hero banners and OG images alike.
 *
 * The motif is a stylised "paper workspace" scene: two offset document sheets
 * (a back plate + a front sheet with a folded corner) carrying seeded lines of
 * "text", tinted with the design-system accent gradient, with a small "purpose
 * glyph" (convert/arrows, data/braces, table/grid, edit/pen, read/scan,
 * merge/stack, split/scissor, lock/shield) floated over it hinting at the
 * tool's group.
 *
 * Usage:
 *   getDocumentIllustration("csv-to-json", "hero")   -> inline SVG string
 *   documentIllustrationDataUrl("convert", "card")   -> data: URL (for <img>)
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants (aspect + density presets; shared vocabulary with QR/SEO/SVG) ── */

export type DocumentIllustrationVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  readonly w: number;
  readonly h: number;
  /** Number of seeded "text lines" drawn on the front sheet. */
  readonly lines: number;
  /** Whether to draw the floating purpose glyph. */
  readonly glyph: boolean;
  /** Whether to draw the offset back sheet (a small paper stack). */
  readonly stack: boolean;
  /** Corner radius of the outer plate, in viewBox units. */
  readonly radius: number;
}

const VARIANTS: Record<DocumentIllustrationVariant, VariantSpec> = {
  icon: { w: 96, h: 96, lines: 3, glyph: false, stack: false, radius: 8 },
  card: { w: 400, h: 300, lines: 5, glyph: true, stack: true, radius: 5 },
  hero: { w: 1200, h: 630, lines: 6, glyph: true, stack: true, radius: 6 },
  banner: { w: 1200, h: 300, lines: 5, glyph: true, stack: true, radius: 6 },
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

/* ── Purpose glyphs (24×24, currentColor stroke) ──────────────────────────── */

/**
 * Group/purpose → an SVG path that hints at what the tool does. Line-based so it
 * reads at any size. The glyph is chosen from the seed via `glyphKeyFor`, which
 * also understands document group labels ("Convert", "Data", "Office", …).
 */
const GLYPHS: Record<string, string> = {
  // The default, a document page with a folded corner.
  doc: "M6 2h8l4 4v16H6zM14 2v4h4M9 12h6M9 16h6M9 8h2",
  // Convert / transform, two-way arrows.
  convert: "M4 8h13l-3-3M4 8l3 3M20 16H7l3 3M20 16l-3-3",
  // Data, braces / structured payload.
  data: "M8 4S5 4 5 8s-2 4-2 4 2 0 2 4 3 4 3 4M16 4s3 0 3 4 2 4 2 4-2 0-2 4-3 4-3 4",
  // Table / spreadsheet: a grid.
  table: "M3 4h18v16H3zM3 10h18M3 15h18M9 4v16M15 4v16",
  // Edit, pencil on a sheet.
  edit: "M4 4h9M4 9h6M4 14h5L19 4l2 2-9 9H4zM4 19h8",
  // Read / scan: a page with a scan line.
  read: "M6 3h9l4 4v14H6zM15 3v4h4M4 8v8M9 12h6M9 16h4",
  // Merge, two sheets flowing into one.
  merge: "M4 4h6v6H4zM14 14h6v6h-6zM10 7h4a3 3 0 0 1 3 3v4M14 12l3 2M17 14l-3 2",
  // Split: scissors / divide.
  split: "M6 4v6a3 3 0 0 0 3 3h6M6 20v-6M6 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM6 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 8l4 4-4 4",
  // Compare / diff: two overlapping panels.
  compare: "M4 5h7v14H4zM13 5h7v14h-7M8 9v6M16 9v6",
  // Lock / protect, shield with keyhole.
  lock: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM12 11v3M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  // Markdown / rich text, hash + text.
  markdown: "M4 6h16v12H4zM6 15v-6l2.5 3L11 9v6M15 9v6M13 12h4l-2 3",
  // Text / plain, lines of text.
  text: "M5 5h14M5 9h14M5 13h10M5 17h12",
};

/** Map a seed (slug or group label) to a glyph key. */
function glyphKeyFor(key: string): keyof typeof GLYPHS {
  const s = key.toLowerCase();
  const table: [RegExp, keyof typeof GLYPHS][] = [
    [/merge|combin|join|concat/, "merge"],
    [/split|divide|separat|extract-page/, "split"],
    [/compar|diff|differ/, "compare"],
    [/password|protect|encrypt|lock|secure|unlock/, "lock"],
    [/csv|json|xml|yaml|data|parse/, "data"],
    [/excel|xlsx|spreadsheet|table|sheet/, "table"],
    [/markdown|md-to|to-md/, "markdown"],
    [/txt|text|plain|to-txt/, "text"],
    [/edit|editor|tweak/, "edit"],
    [/read|ocr|scan|view|preview|epub/, "read"],
    [/convert|to-pdf|to-word|to-docx|to-html|office/, "convert"],
  ];
  for (const [re, g] of table) if (re.test(s)) return g;
  return "doc";
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface DocumentIllustrationOptions {
  /** Accent override; defaults to the Document Studio accent (cyan). */
  accent?: AccentKey;
  /** Force a specific glyph regardless of the seed key. */
  glyph?: keyof typeof GLYPHS;
}

/**
 * Build the inline SVG string for a document-tool illustration.
 *
 * @param key Tool slug OR group key (e.g. "convert", "data", "office") -
 *                seeds both the sheet/text layout and the purpose glyph.
 * @param variant Size/aspect preset.
 */
export function getDocumentIllustration(
  key: string,
  variant: DocumentIllustrationVariant = "card",
  options: DocumentIllustrationOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, radius } = spec;
  const accent = accentStyle(options.accent ?? "cyan");
  const [from, to] = accent.hex;

  const rand = mulberry32(seedFrom(key));
  const uid = `doc-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  const isWide = variant === "hero" || variant === "banner";

  // ── Front sheet geometry: an A4-ish portrait sheet centred (or left-set on
  //    wide banners so the glyph has room on the right). ──────────────────────
  const sheetH = h * (variant === "icon" ? 0.72 : 0.68);
  const sheetW = sheetH * 0.74;
  const sx = isWide ? w * 0.08 : (w - sheetW) / 2;
  const sy = (h - sheetH) / 2;
  const fold = sheetW * (variant === "icon" ? 0.26 : 0.22);

  // ── Optional offset back sheet (a subtle paper stack behind the front). ───
  let backSheet = "";
  if (spec.stack) {
    const bx = sx + sheetW * 0.08;
    const by = sy - sheetH * 0.06;
    backSheet =
      `<rect x="${round(bx)}" y="${round(by)}" width="${round(sheetW)}" height="${round(
        sheetH,
      )}" rx="${round(sheetW * 0.06)}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(
        Math.min(w, h) * 0.006,
      )}" opacity="0.5"/>`;
  }

  // ── Front sheet path with a folded top-right corner. ──────────────────────
  const r = round(sheetW * 0.05);
  const x0 = round(sx);
  const y0 = round(sy);
  const x1 = round(sx + sheetW);
  const y1 = round(sy + sheetH);
  const fx = round(sx + sheetW - fold);
  const fy = round(sy + fold);
  const sheetPath =
    `M ${x0 + r} ${y0}` +
    ` H ${fx}` +
    ` L ${x1} ${fy}` +
    ` V ${y1 - r}` +
    ` Q ${x1} ${y1} ${x1 - r} ${y1}` +
    ` H ${x0 + r}` +
    ` Q ${x0} ${y1} ${x0} ${y1 - r}` +
    ` V ${y0 + r}` +
    ` Q ${x0} ${y0} ${x0 + r} ${y0} Z`;
  // The folded corner triangle.
  const foldPath = `M ${fx} ${y0} V ${fy} H ${x1} Z`;

  // ── Seeded "text" lines across the sheet body (below the fold). ───────────
  const padX = sheetW * 0.16;
  const lineTop = fy + sheetH * 0.14;
  const lineBottom = y1 - sheetH * 0.14;
  const n = spec.lines;
  const gap = (lineBottom - lineTop) / Math.max(1, n - 1);
  const lineH = round(Math.min(gap * 0.34, sheetW * 0.05));
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    const ly = round(lineTop + i * gap);
    // Vary line length so it reads like real prose.
    const len = 0.5 + rand() * 0.48;
    const lw = round((sheetW - padX * 2) * len);
    lines.push(
      `<rect x="${round(sx + padX)}" y="${ly}" width="${lw}" height="${lineH}" rx="${round(
        lineH / 2,
      )}"/>`,
    );
  }

  // ── Optional floating purpose glyph, bottom-right, on a soft plate. ───────
  let glyph = "";
  if (spec.glyph) {
    const gk = options.glyph ?? glyphKeyFor(key);
    const path = GLYPHS[gk] ?? GLYPHS.doc;
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
    // Paper stack (back sheet, if any)
    backSheet +
    // Front sheet
    `<path d="${sheetPath}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(
      Math.min(w, h) * 0.008,
    )}"/>` +
    // Folded corner (tinted)
    `<path d="${foldPath}" fill="url(#${uid}-g)" opacity="0.22"/>` +
    `<path d="${foldPath}" fill="none" stroke="url(#${uid}-g)" stroke-width="${round(
      Math.min(w, h) * 0.006,
    )}"/>` +
    // Seeded text lines
    `<g fill="url(#${uid}-g)" opacity="0.6">${lines.join("")}</g>` +
    // Floating purpose glyph
    glyph +
    `</svg>`
  );
}

/** Round to 2dp and drop trailing zeros: keeps the SVG string compact. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Same illustration as a `data:` URL, safe for `<img src>` / CSS `url()`. */
export function documentIllustrationDataUrl(
  key: string,
  variant: DocumentIllustrationVariant = "card",
  options: DocumentIllustrationOptions = {},
): string {
  const svg = getDocumentIllustration(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All glyph keys, for tooling / previews. */
export const DOCUMENT_GLYPH_KEYS = Object.keys(GLYPHS) as (keyof typeof GLYPHS)[];
