/**
 * Generic tool illustrations, deterministic, on-brand SVG artwork for every
 * tool category without a bespoke art system (developer, image, pdf, ai,
 * business, …). Same contract/design language as the specialised systems
 * (`lib/qr/illustrations`, `lib/document-tools/illustrations`, …).
 *
 * Unlike a single motif, this is a small SCENE LIBRARY: the tool's purpose
 * (derived from slug + group + category) selects a distinct composition that
 * DEPICTS THE WORK: crop brackets over a photo for "crop", a folded PDF
 * sheet for PDF tools, two format tiles with a swap arrow for converters, a
 * before/after squeeze for "compress", a small→large jump for "upscale", a
 * code window for developer tools, braces for JSON/data, a bar chart for
 * analytics, a shield for security, and so on. Each scene is tinted with the
 * tool's accent gradient, so color AND shape both vary across a grid.
 *
 * Pure and client-safe (no DOM, no libraries) → renders on the server (static
 * export), in tool cards, hero banners and OG images alike.
 *
 * Usage:
 *   getToolArt("crop-image", "card", { accent: "violet", category: "image-tools" })
 *   toolArtDataUrl("image-resizer", "hero")
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants (shared vocabulary with QR/SEO/SVG/Document) ─────────────────── */

export type ToolArtVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  readonly w: number;
  readonly h: number;
  readonly radius: number;
  /** Detail level: more props/rows on bigger variants. */
  readonly detail: 1 | 2 | 3;
}

const VARIANTS: Record<ToolArtVariant, VariantSpec> = {
  icon: { w: 96, h: 96, radius: 8, detail: 1 },
  card: { w: 400, h: 300, radius: 5, detail: 2 },
  hero: { w: 1200, h: 630, radius: 6, detail: 3 },
  banner: { w: 1200, h: 300, radius: 6, detail: 2 },
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

/** Round to 2dp and drop trailing zeros. Keeps the SVG string compact. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
const r = round;

/* ── Scene context + shared primitives ────────────────────────────────────── */

interface SceneCtx {
  /** Stage box the scene must draw within. */
  x: number;
  y: number;
  w: number;
  h: number;
  rand: () => number;
  uid: string;
  /** Accent gradient stops. */
  from: string;
  to: string;
  /** Base stroke width for the scene. */
  stroke: number;
  /** Detail level from the variant. */
  detail: number;
  /** What the "subject" inside framed scenes depicts (photo vs document). */
  subject: "photo" | "doc";
  /** Short label (format/filetype/keyword) drawn into the art so the card
   *  reads its job at a glance, e.g. "JSON", "SQL", "REGEX". */
  label?: string;
  /** For converters: [from, to] format names, e.g. ["PNG","JPG"]. */
  formats?: [string, string];
}

/** The accent linear-gradient fill reference. */
const G = (uid: string) => `url(#${uid}-g)`;
/** Neutral "surface" fill that adapts to light/dark theme. */
const SURFACE = "var(--card, #0b1220)";

function rrect(
  x: number,
  y: number,
  w: number,
  h: number,
  rad: number,
  fill: string,
  extra = "",
): string {
  return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(rad)}" fill="${fill}" ${extra}/>`;
}

/** Seeded "content rows" (like lines of text/code) inside a box. */
function rows(
  s: SceneCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  n: number,
): string {
  const gap = h / Math.max(1, n);
  const rh = Math.min(gap * 0.4, s.h * 0.04);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const indent = s.rand() < 0.35 ? w * (0.08 + s.rand() * 0.12) : 0;
    const len = 0.4 + s.rand() * 0.5;
    const rw = Math.max((w - indent) * len, rh * 3);
    out.push(
      `<rect x="${r(x + indent)}" y="${r(y + i * gap + gap * 0.3)}" width="${r(rw)}" height="${r(rh)}" rx="${r(rh / 2)}"/>`,
    );
  }
  return `<g fill="${G(s.uid)}" opacity="0.55">${out.join("")}</g>`;
}

/** A window/browser panel with three title-bar dots. Returns the chrome; the
 *  caller adds body content. */
function windowChrome(s: SceneCtx): { bodyTop: number; chrome: string } {
  const rad = Math.min(s.w, s.h) * 0.06;
  const barH = s.h * 0.16;
  const dotR = barH * 0.15;
  const dy = s.y + barH / 2;
  const dx = s.x + s.w * 0.07;
  const gap = dotR * 3.4;
  // Optional filename tab on the right of the title bar: carries the label so
  // e.g. an XML vs YAML vs SQL formatter reads differently at a glance.
  let tab = "";
  if (s.label) {
    const fs = barH * 0.42;
    const tw = fs * (s.label.length * 0.62 + 1.2);
    const tx = s.x + s.w - tw - s.w * 0.05;
    const ty = s.y + barH * 0.24;
    tab =
      rrect(tx, ty, tw, barH * 0.56, barH * 0.16, G(s.uid), `opacity="0.9"`) +
      `<text x="${r(tx + tw / 2)}" y="${r(ty + barH * 0.42)}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', monospace" font-size="${r(fs)}" font-weight="600" fill="#ffffff">${s.label}</text>`;
  }
  const chrome =
    rrect(s.x, s.y, s.w, s.h, rad, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<line x1="${r(s.x)}" y1="${r(s.y + barH)}" x2="${r(s.x + s.w)}" y2="${r(s.y + barH)}" stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}" opacity="0.3"/>` +
    `<g fill="${G(s.uid)}">` +
    `<circle cx="${r(dx)}" cy="${r(dy)}" r="${r(dotR)}" opacity="0.9"/>` +
    `<circle cx="${r(dx + gap)}" cy="${r(dy)}" r="${r(dotR)}" opacity="0.55"/>` +
    `<circle cx="${r(dx + gap * 2)}" cy="${r(dy)}" r="${r(dotR)}" opacity="0.3"/>` +
    `</g>` +
    tab;
  return { bodyTop: s.y + barH, chrome };
}

/** Mountains + sun inside a frame, the "photo". Seeded so every tool differs:
 *  the sun position/size and the peak positions/heights vary per slug. */
function photoInner(s: SceneCtx, x: number, y: number, w: number, h: number): string {
  const sunX = 0.6 + s.rand() * 0.24;
  const sunY = 0.24 + s.rand() * 0.16;
  const sunR = h * (0.1 + s.rand() * 0.06);
  const sun = `<circle cx="${r(x + w * sunX)}" cy="${r(y + h * sunY)}" r="${r(sunR)}" fill="${G(s.uid)}" opacity="0.85"/>`;
  const base = y + h * 0.9;
  const p1 = 0.28 + s.rand() * 0.14;
  const h1 = 0.42 + s.rand() * 0.14;
  const p2 = 0.6 + s.rand() * 0.14;
  const h2 = 0.5 + s.rand() * 0.14;
  const m1 = `M ${r(x)} ${r(base)} L ${r(x + w * p1)} ${r(y + h * h1)} L ${r(x + w * (p1 + 0.26))} ${r(base)} Z`;
  const m2 = `M ${r(x + w * 0.38)} ${r(base)} L ${r(x + w * p2)} ${r(y + h * h2)} L ${r(x + w)} ${r(base)} Z`;
  return `${sun}<path d="${m1}" fill="${G(s.uid)}" opacity="0.7"/><path d="${m2}" fill="${G(s.uid)}" opacity="0.45"/>`;
}

/** A short document header bar + text lines inside a frame: the "document". */
function docInner(s: SceneCtx, x: number, y: number, w: number, h: number): string {
  const px = w * 0.16;
  const header = `<rect x="${r(x + px)}" y="${r(y + h * 0.16)}" width="${r(w * 0.5)}" height="${r(h * 0.12)}" rx="${r(h * 0.06)}" fill="${G(s.uid)}" opacity="0.8"/>`;
  const lens = [0.68, 0.6, 0.48];
  const lines = lens
    .map(
      (l, i) =>
        `<rect x="${r(x + px)}" y="${r(y + h * (0.4 + i * 0.16))}" width="${r(w * l)}" height="${r(h * 0.08)}" rx="${r(h * 0.04)}" fill="${G(s.uid)}" opacity="0.4"/>`,
    )
    .join("");
  return header + lines;
}

/** Photo or document, per the tool's subject kind. */
function subjectInner(s: SceneCtx, x: number, y: number, w: number, h: number): string {
  return s.subject === "doc" ? docInner(s, x, y, w, h) : photoInner(s, x, y, w, h);
}

/** Corner brackets (crop marks) around a box. */
function cropBrackets(s: SceneCtx, x: number, y: number, w: number, h: number, len: number): string {
  const sw = s.stroke * 1.8;
  const corner = (cx: number, cy: number, dx: number, dy: number) =>
    `<path d="M ${r(cx + dx * len)} ${r(cy)} H ${r(cx)} V ${r(cy + dy * len)}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(sw)}" stroke-linecap="round"/>`;
  return (
    corner(x, y, 1, 1) +
    corner(x + w, y, -1, 1) +
    corner(x, y + h, 1, -1) +
    corner(x + w, y + h, -1, -1)
  );
}

/* ── Scenes ───────────────────────────────────────────────────────────────── */

type Scene = (s: SceneCtx) => string;

/** Developer / generic app-window with code rows. */
const sceneCode: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const n = s.detail === 3 ? 6 : s.detail === 2 ? 5 : 3;
  return chrome + rows(s, s.x + s.w * 0.08, bodyTop + bodyH * 0.12, s.w * 0.84, bodyH * 0.7, n);
};

/** JSON / structured data, big braces beside rows. */
const sceneData: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const n = s.detail >= 2 ? 4 : 3;
  const sw = s.stroke * 2;
  const bx = s.x + s.w * 0.66;
  const by = bodyTop + bodyH * 0.16;
  const bh = bodyH * 0.66;
  const bw = s.w * 0.12;
  const brace = (dir: number, ox: number) =>
    `<path d="M ${r(ox + (dir > 0 ? bw : 0))} ${r(by)} q ${r(-dir * bw * 0.7)} 0 ${r(-dir * bw * 0.7)} ${r(bh * 0.28)} q 0 ${r(bh * 0.22)} ${r(-dir * bw * 0.5)} ${r(bh * 0.22)} q ${r(dir * bw * 0.5)} 0 ${r(dir * bw * 0.5)} ${r(bh * 0.22)} q 0 ${r(bh * 0.28)} ${r(dir * bw * 0.7)} ${r(bh * 0.28)}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return (
    chrome +
    rows(s, s.x + s.w * 0.08, bodyTop + bodyH * 0.14, s.w * 0.44, bodyH * 0.66, n) +
    brace(1, bx) +
    brace(-1, bx + bw * 1.9)
  );
};

/** Photo, a framed picture (generic image tools). */
const scenePhoto: Scene = (s) => {
  const rad = Math.min(s.w, s.h) * 0.06;
  return (
    rrect(s.x, s.y, s.w, s.h, rad, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<clipPath id="${s.uid}-ph"><rect x="${r(s.x)}" y="${r(s.y)}" width="${r(s.w)}" height="${r(s.h)}" rx="${r(rad)}"/></clipPath>` +
    `<g clip-path="url(#${s.uid}-ph)">${photoInner(s, s.x, s.y, s.w, s.h)}</g>`
  );
};

/** Crop, a photo with darkened margins + crop brackets + thirds grid. */
const sceneCrop: Scene = (s) => {
  const rad = Math.min(s.w, s.h) * 0.06;
  const photo = scenePhoto(s);
  const ix = s.x + s.w * 0.16;
  const iy = s.y + s.h * 0.18;
  const iw = s.w * 0.6;
  const ih = s.h * 0.6;
  // dim everything, then the crop area is clear (drawn by a lighter overlay hole)
  const dim = `<rect x="${r(s.x)}" y="${r(s.y)}" width="${r(s.w)}" height="${r(s.h)}" rx="${r(rad)}" fill="#000" opacity="0.4"/>`;
  const clear = `<rect x="${r(ix)}" y="${r(iy)}" width="${r(iw)}" height="${r(ih)}" fill="${SURFACE}"/>`;
  const clip = `<clipPath id="${s.uid}-cr"><rect x="${r(ix)}" y="${r(iy)}" width="${r(iw)}" height="${r(ih)}"/></clipPath>`;
  const clearPhoto = `<g clip-path="url(#${s.uid}-cr)">${photoInner(s, s.x, s.y, s.w, s.h)}</g>`;
  const thirds =
    `<g stroke="#ffffff" stroke-width="${r(s.stroke * 0.7)}" opacity="0.4">` +
    `<line x1="${r(ix + iw / 3)}" y1="${r(iy)}" x2="${r(ix + iw / 3)}" y2="${r(iy + ih)}"/>` +
    `<line x1="${r(ix + (iw * 2) / 3)}" y1="${r(iy)}" x2="${r(ix + (iw * 2) / 3)}" y2="${r(iy + ih)}"/>` +
    `<line x1="${r(ix)}" y1="${r(iy + ih / 3)}" x2="${r(ix + iw)}" y2="${r(iy + ih / 3)}"/>` +
    `<line x1="${r(ix)}" y1="${r(iy + (ih * 2) / 3)}" x2="${r(ix + iw)}" y2="${r(iy + (ih * 2) / 3)}"/>` +
    `</g>`;
  return photo + dim + clip + clear + clearPhoto + thirds + cropBrackets(s, ix, iy, iw, ih, Math.min(iw, ih) * 0.24);
};

/** Resize, inner frame + dashed outer bounds + diagonal resize arrow. */
const sceneResize: Scene = (s) => {
  const rad = Math.min(s.w, s.h) * 0.05;
  const ix = s.x + s.w * 0.1;
  const iy = s.y + s.h * 0.22;
  const iw = s.w * 0.5;
  const ih = s.h * 0.5;
  const photo =
    rrect(ix, iy, iw, ih, rad, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<clipPath id="${s.uid}-rz"><rect x="${r(ix)}" y="${r(iy)}" width="${r(iw)}" height="${r(ih)}" rx="${r(rad)}"/></clipPath>` +
    `<g clip-path="url(#${s.uid}-rz)">${subjectInner(s, ix, iy, iw, ih)}</g>`;
  const ox = ix;
  const oy = iy;
  const ow = s.w * 0.82;
  const oh = s.h * 0.72;
  const dashed = rrect(ox, oy, ow, oh, rad, "none", `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}" stroke-dasharray="${r(s.h * 0.03)} ${r(s.h * 0.022)}" opacity="0.7"`);
  // diagonal double arrow from inner BR corner to outer BR corner
  const ax = ix + iw;
  const ay = iy + ih;
  const bx = ox + ow;
  const by = oy + oh;
  const ah = Math.min(s.w, s.h) * 0.05;
  const arrow =
    `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.6)}" stroke-linecap="round" fill="none">` +
    `<line x1="${r(ax)}" y1="${r(ay)}" x2="${r(bx)}" y2="${r(by)}"/>` +
    `<path d="M ${r(bx - ah)} ${r(by)} L ${r(bx)} ${r(by)} L ${r(bx)} ${r(by - ah)}"/>` +
    `<path d="M ${r(ax + ah)} ${r(ay)} L ${r(ax)} ${r(ay)} L ${r(ax)} ${r(ay + ah)}"/>` +
    `</g>`;
  // corner handle on the outer BR
  const handle = `<rect x="${r(bx - ah * 0.5)}" y="${r(by - ah * 0.5)}" width="${r(ah)}" height="${r(ah)}" rx="${r(ah * 0.25)}" fill="${G(s.uid)}"/>`;
  return dashed + photo + arrow + handle;
};

/** Compress, an image squeezed inward by two chevrons, size shrinks. */
const sceneCompress: Scene = (s) => {
  const rad = Math.min(s.w, s.h) * 0.06;
  const iw = s.w * 0.4;
  const ih = s.h * 0.56;
  const ix = s.x + (s.w - iw) / 2;
  const iy = s.y + (s.h - ih) / 2;
  const photo =
    rrect(ix, iy, iw, ih, rad, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<clipPath id="${s.uid}-cp"><rect x="${r(ix)}" y="${r(iy)}" width="${r(iw)}" height="${r(ih)}" rx="${r(rad)}"/></clipPath>` +
    `<g clip-path="url(#${s.uid}-cp)">${subjectInner(s, ix, iy, iw, ih)}</g>`;
  const cy = s.y + s.h / 2;
  const chevW = s.w * 0.09;
  const gap = s.w * 0.05;
  const sw = s.stroke * 2;
  const chev = (tipX: number, dir: number) =>
    `<path d="M ${r(tipX - dir * chevW)} ${r(cy - chevW)} L ${r(tipX)} ${r(cy)} L ${r(tipX - dir * chevW)} ${r(cy + chevW)}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return photo + chev(ix - gap, -1) + chev(ix + iw + gap, 1);
};

/** A file card (rounded sheet + folded corner) carrying a format label. */
function fileCard(
  s: SceneCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  labelText: string,
  solid: boolean,
): string {
  const fold = w * 0.28;
  const rad = w * 0.08;
  const x1 = x + w;
  const fy = y + fold;
  const fx = x1 - fold;
  const path = `M ${r(x + rad)} ${r(y)} H ${r(fx)} L ${r(x1)} ${r(fy)} V ${r(y + h - rad)} Q ${r(x1)} ${r(y + h)} ${r(x1 - rad)} ${r(y + h)} H ${r(x + rad)} Q ${r(x)} ${r(y + h)} ${r(x)} ${r(y + h - rad)} V ${r(y + rad)} Q ${r(x)} ${r(y)} ${r(x + rad)} ${r(y)} Z`;
  const foldPath = `M ${r(fx)} ${r(y)} V ${r(fy)} H ${r(x1)}`;
  const fillCard = solid ? G(s.uid) : SURFACE;
  const textFill = solid ? "#ffffff" : G(s.uid);
  const fs = Math.min(h * 0.24, w / Math.max(3, labelText.length) * 1.5);
  const label = labelText
    ? `<text x="${r(x + w / 2)}" y="${r(y + h * 0.64)}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', monospace" font-size="${r(fs)}" font-weight="700" fill="${textFill}">${labelText}</text>`
    : `<g transform="translate(${r(x + w * 0.22)} ${r(y + h * 0.3)})"><rect x="0" y="0" width="${r(w * 0.56)}" height="${r(h * 0.4)}" rx="${r(rad)}" fill="${textFill}" opacity="0.4"/></g>`;
  return (
    `<path d="${path}" fill="${fillCard}" stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}" stroke-linejoin="round"/>` +
    `<path d="${foldPath}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 0.8)}" stroke-linejoin="round" opacity="${solid ? 0.6 : 1}"/>` +
    label
  );
}

/** Convert, two file cards labelled with the source/target formats + arrow.
 *  The formats come from the tool (e.g. PNG → JPG, DOCX → PDF) so every
 *  converter is self-explanatory and unique. */
const sceneConvert: Scene = (s) => {
  const [from, to] = s.formats ?? ["", ""];
  const tw = s.w * 0.3;
  const th = s.h * 0.56;
  const ty = s.y + (s.h - th) / 2;
  const lx = s.x + s.w * 0.04;
  const rx = s.x + s.w - s.w * 0.04 - tw;
  const my = s.y + s.h / 2;
  const ah = Math.min(s.w, s.h) * 0.05;
  const arrow =
    `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.8)}" stroke-linecap="round" stroke-linejoin="round" fill="none">` +
    `<line x1="${r(lx + tw + s.w * 0.035)}" y1="${r(my)}" x2="${r(rx - s.w * 0.035)}" y2="${r(my)}"/>` +
    `<path d="M ${r(rx - s.w * 0.035 - ah)} ${r(my - ah)} L ${r(rx - s.w * 0.035)} ${r(my)} L ${r(rx - s.w * 0.035 - ah)} ${r(my + ah)}"/>` +
    `</g>`;
  return fileCard(s, lx, ty, tw, th, from, false) + arrow + fileCard(s, rx, ty, tw, th, to, true);
};

/** Upscale, small blocky image → large crisp photo + sparkle. */
const sceneUpscale: Scene = (s) => {
  const rad = Math.min(s.w, s.h) * 0.05;
  const sw2 = s.w * 0.22;
  const sh2 = s.h * 0.34;
  const sx2 = s.x + s.w * 0.04;
  const sy2 = s.y + (s.h - sh2) / 2;
  // small pixelated image (2x2 big pixels)
  const px = sw2 / 2;
  const small =
    rrect(sx2, sy2, sw2, sh2, rad * 0.6, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<g fill="${G(s.uid)}" opacity="0.6">` +
    `<rect x="${r(sx2 + 2)}" y="${r(sy2 + 2)}" width="${r(px - 3)}" height="${r(sh2 / 2 - 3)}"/>` +
    `<rect x="${r(sx2 + px + 1)}" y="${r(sy2 + sh2 / 2 + 1)}" width="${r(px - 3)}" height="${r(sh2 / 2 - 3)}"/>` +
    `</g>`;
  const bw = s.w * 0.42;
  const bh = s.h * 0.62;
  const bx = s.x + s.w - bw - s.w * 0.04;
  const by = s.y + (s.h - bh) / 2;
  const big =
    rrect(bx, by, bw, bh, rad, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<clipPath id="${s.uid}-up"><rect x="${r(bx)}" y="${r(by)}" width="${r(bw)}" height="${r(bh)}" rx="${r(rad)}"/></clipPath>` +
    `<g clip-path="url(#${s.uid}-up)">${subjectInner(s, bx, by, bw, bh)}</g>`;
  const my = s.y + s.h / 2;
  const mx = sx2 + sw2 + s.w * 0.02;
  const ah = Math.min(s.w, s.h) * 0.045;
  const arrow =
    `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.7)}" stroke-linecap="round" stroke-linejoin="round" fill="none">` +
    `<line x1="${r(mx)}" y1="${r(my)}" x2="${r(bx - s.w * 0.02)}" y2="${r(my)}"/>` +
    `<path d="M ${r(bx - s.w * 0.02 - ah)} ${r(my - ah)} L ${r(bx - s.w * 0.02)} ${r(my)} L ${r(bx - s.w * 0.02 - ah)} ${r(my + ah)}"/>` +
    `</g>`;
  const spR = s.h * 0.06;
  const spx = bx + bw * 0.86;
  const spy = by + bh * 0.16;
  const sparkle = `<path d="M ${r(spx)} ${r(spy - spR)} L ${r(spx + spR * 0.4)} ${r(spy - spR * 0.4)} L ${r(spx + spR)} ${r(spy)} L ${r(spx + spR * 0.4)} ${r(spy + spR * 0.4)} L ${r(spx)} ${r(spy + spR)} L ${r(spx - spR * 0.4)} ${r(spy + spR * 0.4)} L ${r(spx - spR)} ${r(spy)} L ${r(spx - spR * 0.4)} ${r(spy - spR * 0.4)} Z" fill="#ffffff"/>`;
  return small + arrow + big + sparkle;
};

/** PDF, a document sheet with folded corner + a PDF label. */
const scenePdf: Scene = (s) => {
  const sheetW = s.h * 0.62;
  const sheetH = s.h * 0.82;
  const sx = s.x + (s.w - sheetW) / 2;
  const sy = s.y + (s.h - sheetH) / 2;
  const fold = sheetW * 0.26;
  const x0 = sx;
  const y0 = sy;
  const x1 = sx + sheetW;
  const y1 = sy + sheetH;
  const fx = x1 - fold;
  const fy = y0 + fold;
  const path = `M ${r(x0)} ${r(y0)} H ${r(fx)} L ${r(x1)} ${r(fy)} V ${r(y1)} H ${r(x0)} Z`;
  const foldPath = `M ${r(fx)} ${r(y0)} V ${r(fy)} H ${r(x1)} Z`;
  const labelW = sheetW * 0.62;
  const labelH = sheetH * 0.16;
  const lx = sx + (sheetW - labelW) / 2;
  const ly = sy + sheetH * 0.42;
  const label =
    rrect(lx, ly, labelW, labelH, labelH * 0.28, G(s.uid)) +
    `<g fill="#ffffff" opacity="0.95">` +
    `<rect x="${r(lx + labelW * 0.16)}" y="${r(ly + labelH * 0.32)}" width="${r(labelW * 0.16)}" height="${r(labelH * 0.36)}" rx="${r(labelH * 0.08)}"/>` +
    `<rect x="${r(lx + labelW * 0.42)}" y="${r(ly + labelH * 0.32)}" width="${r(labelW * 0.16)}" height="${r(labelH * 0.36)}" rx="${r(labelH * 0.08)}"/>` +
    `<rect x="${r(lx + labelW * 0.68)}" y="${r(ly + labelH * 0.32)}" width="${r(labelW * 0.16)}" height="${r(labelH * 0.36)}" rx="${r(labelH * 0.08)}"/>` +
    `</g>`;
  const lineY = sy + sheetH * 0.66;
  const lines =
    `<g fill="${G(s.uid)}" opacity="0.4">` +
    `<rect x="${r(sx + sheetW * 0.18)}" y="${r(lineY)}" width="${r(sheetW * 0.64)}" height="${r(sheetH * 0.05)}" rx="${r(sheetH * 0.025)}"/>` +
    `<rect x="${r(sx + sheetW * 0.18)}" y="${r(lineY + sheetH * 0.12)}" width="${r(sheetW * 0.44)}" height="${r(sheetH * 0.05)}" rx="${r(sheetH * 0.025)}"/>` +
    `</g>`;
  return (
    `<path d="${path}" fill="${SURFACE}" stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}" stroke-linejoin="round"/>` +
    `<path d="${foldPath}" fill="${G(s.uid)}" opacity="0.25"/>` +
    `<path d="${foldPath}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 0.8)}" stroke-linejoin="round"/>` +
    label +
    lines
  );
};

/** Color, overlapping translucent swatch circles. */
const sceneColor: Scene = (s) => {
  const cy = s.y + s.h * 0.5;
  const cr = s.h * 0.24;
  const cx = s.x + s.w * 0.5;
  const off = cr * 0.7;
  return (
    `<g>` +
    `<circle cx="${r(cx - off)}" cy="${r(cy - off * 0.4)}" r="${r(cr)}" fill="${G(s.uid)}" opacity="0.85"/>` +
    `<circle cx="${r(cx + off)}" cy="${r(cy - off * 0.4)}" r="${r(cr)}" fill="${G(s.uid)}" opacity="0.5"/>` +
    `<circle cx="${r(cx)}" cy="${r(cy + off * 0.7)}" r="${r(cr)}" fill="${G(s.uid)}" opacity="0.3"/>` +
    `</g>`
  );
};

/** Text, a sheet with a big "Aa" and text lines. */
const sceneText: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const aa = `<text x="${r(s.x + s.w * 0.1)}" y="${r(bodyTop + bodyH * 0.62)}" font-family="Georgia, 'Times New Roman', serif" font-size="${r(bodyH * 0.66)}" font-weight="700" fill="${G(s.uid)}">Aa</text>`;
  return chrome + aa + rows(s, s.x + s.w * 0.5, bodyTop + bodyH * 0.2, s.w * 0.4, bodyH * 0.6, 4);
};

/** Chart, rising bars + trend line. */
const sceneChart: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const baseY = bodyTop + bodyH * 0.82;
  const n = 4;
  const bw = (s.w * 0.7) / (n * 1.6);
  const startX = s.x + s.w * 0.14;
  const heights = [0.28 + s.rand() * 0.2, 0.4 + s.rand() * 0.28, 0.36 + s.rand() * 0.3, 0.6 + s.rand() * 0.28];
  const bars = heights
    .map((hgt, i) => {
      const bx = startX + i * bw * 1.6;
      const bh = bodyH * 0.62 * hgt;
      return `<rect x="${r(bx)}" y="${r(baseY - bh)}" width="${r(bw)}" height="${r(bh)}" rx="${r(bw * 0.2)}" fill="${G(s.uid)}" opacity="${r(0.45 + i * 0.14)}"/>`;
    })
    .join("");
  return chrome + bars;
};

/** Lock / security, a shield with a keyhole. */
const sceneLock: Scene = (s) => {
  const sw2 = s.h * 0.46;
  const sh2 = s.h * 0.58;
  const cx = s.x + s.w * 0.5;
  const top = s.y + (s.h - sh2) / 2;
  const path = `M ${r(cx)} ${r(top)} L ${r(cx + sw2 / 2)} ${r(top + sh2 * 0.16)} V ${r(top + sh2 * 0.52)} Q ${r(cx + sw2 / 2)} ${r(top + sh2 * 0.9)} ${r(cx)} ${r(top + sh2)} Q ${r(cx - sw2 / 2)} ${r(top + sh2 * 0.9)} ${r(cx - sw2 / 2)} ${r(top + sh2 * 0.52)} V ${r(top + sh2 * 0.16)} Z`;
  const kh = sh2 * 0.12;
  const keyhole =
    `<circle cx="${r(cx)}" cy="${r(top + sh2 * 0.44)}" r="${r(kh)}" fill="#ffffff"/>` +
    `<rect x="${r(cx - kh * 0.4)}" y="${r(top + sh2 * 0.44)}" width="${r(kh * 0.8)}" height="${r(kh * 1.6)}" rx="${r(kh * 0.3)}" fill="#ffffff"/>`;
  return `<path d="${path}" fill="${G(s.uid)}"/>${keyhole}`;
};

/** Diff / compare: two panels side by side with +/- rows. */
const sceneDiff: Scene = (s) => {
  const gap = s.w * 0.05;
  const pw = (s.w - gap) / 2;
  const draw = (px: number) => {
    const sub: SceneCtx = { ...s, x: px, w: pw };
    const { bodyTop, chrome } = windowChrome(sub);
    const bodyH = s.y + s.h - bodyTop;
    return chrome + rows(sub, px + pw * 0.1, bodyTop + bodyH * 0.14, pw * 0.8, bodyH * 0.7, 4);
  };
  return draw(s.x) + draw(s.x + pw + gap);
};

/* ── Small framed-subject helper (photo or doc, per category) ─────────────── */
function framedSubject(s: SceneCtx, x: number, y: number, w: number, h: number, rad: number): string {
  const id = `${s.uid}-f${r(x)}`;
  return (
    rrect(x, y, w, h, rad, SURFACE, `stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}"`) +
    `<clipPath id="${id}"><rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(rad)}"/></clipPath>` +
    `<g clip-path="url(#${id})">${subjectInner(s, x, y, w, h)}</g>`
  );
}

/** Polar helper for arcs. */
function polar(cx: number, cy: number, rad: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
}

/** Rotate, a framed image with a curved rotation arrow around it. */
const sceneRotate: Scene = (s) => {
  const box = Math.min(s.w, s.h) * 0.42;
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const img = framedSubject(s, cx - box / 2, cy - box / 2, box, box, box * 0.1);
  // Radius kept tight so the rotation arc HUGS the page and never overshoots the
  // scene (a larger radius got clipped at the top → disjointed floating arcs).
  const R = box * 0.78;
  const [sxp, syp] = polar(cx, cy, R, -60);
  const [exp, eyp] = polar(cx, cy, R, 200);
  const arc = `M ${r(sxp)} ${r(syp)} A ${r(R)} ${r(R)} 0 1 0 ${r(exp)} ${r(eyp)}`;
  const ah = box * 0.16;
  const [tx, ty] = polar(cx, cy, R, -60);
  const head = `<path d="M ${r(tx - ah)} ${r(ty - ah * 0.2)} L ${r(tx)} ${r(ty)} L ${r(tx - ah * 0.2)} ${r(ty + ah)}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.8)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<path d="${arc}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.8)}" stroke-linecap="round"/>${head}${img}`;
};

/** Flip: an image and its mirrored ghost across a dashed axis. */
const sceneFlip: Scene = (s) => {
  const box = Math.min(s.w, s.h) * 0.5;
  const cy = s.y + s.h / 2;
  const cx = s.x + s.w / 2;
  const left = framedSubject(s, cx - box - s.w * 0.02, cy - box / 2, box, box, box * 0.1);
  const rx = cx + s.w * 0.02;
  const ghost = `<g transform="translate(${r(rx + box)} 0) scale(-1 1)" opacity="0.4">${framedSubject(s, 0, cy - box / 2, box, box, box * 0.1)}</g>`;
  const axis = `<line x1="${r(cx)}" y1="${r(cy - box * 0.62)}" x2="${r(cx)}" y2="${r(cy + box * 0.62)}" stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}" stroke-dasharray="${r(s.h * 0.03)} ${r(s.h * 0.02)}"/>`;
  return left + ghost + axis;
};

/** Watermark: a photo with a diagonal stamp band. */
const sceneWatermark: Scene = (s) => {
  const photo = scenePhoto(s);
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const band =
    `<g transform="rotate(-24 ${r(cx)} ${r(cy)})">` +
    `<rect x="${r(s.x - s.w * 0.1)}" y="${r(cy - s.h * 0.09)}" width="${r(s.w * 1.2)}" height="${r(s.h * 0.18)}" fill="${G(s.uid)}" opacity="0.28"/>` +
    `<g fill="#ffffff" opacity="0.85">` +
    [0.2, 0.5, 0.8]
      .map(
        (fx) =>
          `<circle cx="${r(s.x + s.w * fx)}" cy="${r(cy)}" r="${r(s.h * 0.035)}" fill="none" stroke="#ffffff" stroke-width="${r(s.stroke)}"/>`,
      )
      .join("") +
    `</g></g>`;
  return photo + band;
};

/** Merge, two sheets flowing into one. */
const sceneMerge: Scene = (s) => {
  const sw = s.w * 0.24;
  const sh = s.h * 0.5;
  const rad = sw * 0.12;
  const a = framedSubject(s, s.x + s.w * 0.02, s.y + s.h * 0.16, sw, sh, rad);
  const b = framedSubject(s, s.x + s.w * 0.1, s.y + s.h * 0.36, sw, sh, rad);
  const out = framedSubject(s, s.x + s.w - sw - s.w * 0.04, s.y + (s.h - sh) / 2, sw, sh, rad);
  const my = s.y + s.h / 2;
  const ax = s.x + s.w * 0.1 + sw + s.w * 0.03;
  const bx = s.x + s.w - sw - s.w * 0.04 - s.w * 0.02;
  const ah = Math.min(s.w, s.h) * 0.045;
  const arrow = `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.7)}" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="${r(ax)}" y1="${r(my)}" x2="${r(bx)}" y2="${r(my)}"/><path d="M ${r(bx - ah)} ${r(my - ah)} L ${r(bx)} ${r(my)} L ${r(bx - ah)} ${r(my + ah)}"/></g>`;
  return a + b + arrow + out;
};

/** Split, one sheet into two. */
const sceneSplit: Scene = (s) => {
  const sw = s.w * 0.24;
  const sh = s.h * 0.5;
  const rad = sw * 0.12;
  const src = framedSubject(s, s.x + s.w * 0.04, s.y + (s.h - sh) / 2, sw, sh, rad);
  const a = framedSubject(s, s.x + s.w - sw - s.w * 0.04, s.y + s.h * 0.12, sw, sh * 0.82, rad);
  const b = framedSubject(s, s.x + s.w - sw - s.w * 0.12, s.y + s.h * 0.46, sw, sh * 0.82, rad);
  const my = s.y + s.h / 2;
  const ax = s.x + s.w * 0.04 + sw + s.w * 0.02;
  const bx = s.x + s.w * 0.5;
  const arrow = `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.5)}" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M ${r(ax)} ${r(my)} H ${r(bx)} M ${r(bx)} ${r(my)} L ${r(bx + s.w * 0.08)} ${r(s.y + s.h * 0.32)} M ${r(bx)} ${r(my)} L ${r(bx + s.w * 0.08)} ${r(s.y + s.h * 0.66)}"/></g>`;
  return src + arrow + a + b;
};

/** Sign, a document with a signature squiggle. */
const sceneSign: Scene = (s) => {
  const sub: SceneCtx = { ...s, subject: "doc" };
  const sheetW = s.h * 0.62;
  const sheetH = s.h * 0.82;
  const sx = s.x + (s.w - sheetW) / 2;
  const sy = s.y + (s.h - sheetH) / 2;
  const sheet = framedSubject(sub, sx, sy, sheetW, sheetH, sheetW * 0.06);
  const ly = sy + sheetH * 0.72;
  const sig = `<path d="M ${r(sx + sheetW * 0.2)} ${r(ly)} q ${r(sheetW * 0.1)} ${r(-sheetH * 0.14)} ${r(sheetW * 0.18)} 0 q ${r(sheetW * 0.06)} ${r(sheetH * 0.1)} ${r(sheetW * 0.16)} ${r(-sheetH * 0.06)} q ${r(sheetW * 0.08)} ${r(-sheetH * 0.05)} ${r(sheetW * 0.14)} ${r(sheetH * 0.03)}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.8)}" stroke-linecap="round"/>`;
  const rule = `<line x1="${r(sx + sheetW * 0.18)}" y1="${r(ly + sheetH * 0.08)}" x2="${r(sx + sheetW * 0.82)}" y2="${r(ly + sheetH * 0.08)}" stroke="${G(s.uid)}" stroke-width="${r(s.stroke)}" opacity="0.5"/>`;
  return sheet + sig + rule;
};

/** Scan / OCR: a document with a bright scan line. */
const sceneScan: Scene = (s) => {
  const sub: SceneCtx = { ...s, subject: "doc" };
  const sheetW = s.h * 0.62;
  const sheetH = s.h * 0.82;
  const sx = s.x + (s.w - sheetW) / 2;
  const sy = s.y + (s.h - sheetH) / 2;
  const sheet = framedSubject(sub, sx, sy, sheetW, sheetH, sheetW * 0.06);
  const scanY = sy + sheetH * 0.58;
  const glow = `<rect x="${r(sx - sheetW * 0.06)}" y="${r(scanY - sheetH * 0.03)}" width="${r(sheetW * 1.12)}" height="${r(sheetH * 0.06)}" rx="${r(sheetH * 0.03)}" fill="${G(s.uid)}" opacity="0.85"/>`;
  const brackets = cropBrackets(sub, sx - sheetW * 0.04, sy - sheetH * 0.03, sheetW * 1.08, sheetH * 1.06, sheetW * 0.16);
  return sheet + glow + brackets;
};

/** Encode, "A" transformed into binary. */
const sceneEncode: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const a = `<text x="${r(s.x + s.w * 0.14)}" y="${r(bodyTop + bodyH * 0.66)}" font-family="ui-monospace, monospace" font-size="${r(bodyH * 0.6)}" font-weight="700" fill="${G(s.uid)}">A</text>`;
  const ah = Math.min(s.w, s.h) * 0.04;
  const my = bodyTop + bodyH * 0.5;
  const arrow = `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.4)}" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="${r(s.x + s.w * 0.36)}" y1="${r(my)}" x2="${r(s.x + s.w * 0.48)}" y2="${r(my)}"/><path d="M ${r(s.x + s.w * 0.48 - ah)} ${r(my - ah)} L ${r(s.x + s.w * 0.48)} ${r(my)} L ${r(s.x + s.w * 0.48 - ah)} ${r(my + ah)}"/></g>`;
  const bits = ["01", "10", "11"]
    .map(
      (bitrow, i) =>
        `<text x="${r(s.x + s.w * 0.54)}" y="${r(bodyTop + bodyH * (0.36 + i * 0.22))}" font-family="ui-monospace, monospace" font-size="${r(bodyH * 0.18)}" fill="${G(s.uid)}" opacity="0.7">${bitrow + (s.rand() > 0.5 ? "01" : "10")}</text>`,
    )
    .join("");
  return chrome + a + arrow + bits;
};

/** Link, two interlocking chain links (URL tools). */
const sceneLink: Scene = (s) => {
  const cy = s.y + s.h / 2;
  const lw = s.w * 0.26;
  const lh = s.h * 0.3;
  const sw2 = s.stroke * 2.4;
  const link = (lx: number) =>
    `<rect x="${r(lx)}" y="${r(cy - lh / 2)}" width="${r(lw)}" height="${r(lh)}" rx="${r(lh / 2)}" fill="none" stroke="${G(s.uid)}" stroke-width="${r(sw2)}"/>`;
  const l1 = link(s.x + s.w * 0.2);
  const l2 = link(s.x + s.w * 0.44);
  const bar = `<rect x="${r(s.x + s.w * 0.42)}" y="${r(cy - sw2)}" width="${r(s.w * 0.06)}" height="${r(sw2 * 2)}" rx="${r(sw2)}" fill="${SURFACE}"/>`;
  return l1 + bar + l2;
};

/** Hash / fingerprint, a big "#" over data blocks. */
const sceneHash: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const hash = `<text x="${r(s.x + s.w * 0.5)}" y="${r(bodyTop + bodyH * 0.6)}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="${r(bodyH * 0.6)}" font-weight="700" fill="${G(s.uid)}">#</text>`;
  const blocks = Array.from({ length: 8 })
    .map((_, i) => `<rect x="${r(s.x + s.w * (0.14 + i * 0.09))}" y="${r(bodyTop + bodyH * 0.82)}" width="${r(s.w * 0.06)}" height="${r(bodyH * 0.1)}" rx="${r(bodyH * 0.02)}" fill="${G(s.uid)}" opacity="${r(0.3 + s.rand() * 0.5)}"/>`)
    .join("");
  return chrome + hash + blocks;
};

/** Check / validate: a window with a big checkmark. */
const sceneCheck: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const rowsG = rows(s, s.x + s.w * 0.08, bodyTop + bodyH * 0.14, s.w * 0.5, bodyH * 0.66, 3);
  const cx = s.x + s.w * 0.72;
  const cy = bodyTop + bodyH * 0.5;
  const rad2 = Math.min(s.w, s.h) * 0.16;
  const circle = `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad2)}" fill="${G(s.uid)}"/>`;
  const tick = `<path d="M ${r(cx - rad2 * 0.42)} ${r(cy)} L ${r(cx - rad2 * 0.08)} ${r(cy + rad2 * 0.36)} L ${r(cx + rad2 * 0.46)} ${r(cy - rad2 * 0.34)}" fill="none" stroke="#ffffff" stroke-width="${r(s.stroke * 2.4)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return chrome + rowsG + circle + tick;
};

/** Tree: a small node hierarchy (tree viewer, sitemap, outline). */
const sceneTree: Scene = (s) => {
  const { bodyTop, chrome } = windowChrome(s);
  const bodyH = s.y + s.h - bodyTop;
  const nw = s.w * 0.26;
  const nh = bodyH * 0.2;
  const rootX = s.x + s.w * 0.12;
  const rootY = bodyTop + bodyH * 0.14;
  const childX = s.x + s.w * 0.5;
  const c1Y = bodyTop + bodyH * 0.16;
  const c2Y = bodyTop + bodyH * 0.46;
  const c3Y = bodyTop + bodyH * 0.76;
  const node = (x: number, y: number, op: number) => `<rect x="${r(x)}" y="${r(y)}" width="${r(nw)}" height="${r(nh)}" rx="${r(nh * 0.3)}" fill="${G(s.uid)}" opacity="${op}"/>`;
  const jx = rootX + nw * 0.3;
  const conn = `<g stroke="${G(s.uid)}" stroke-width="${r(s.stroke * 1.2)}" fill="none" opacity="0.6">` +
    `<path d="M ${r(jx)} ${r(rootY + nh)} V ${r(c3Y + nh / 2)}"/>` +
    [c1Y, c2Y, c3Y].map((cy) => `<path d="M ${r(jx)} ${r(cy + nh / 2)} H ${r(childX)}"/>`).join("") +
    `</g>`;
  return (
    chrome +
    node(rootX, rootY, 0.85) +
    conn +
    node(childX, c1Y, 0.6) +
    node(childX, c2Y, 0.5) +
    node(childX, c3Y, 0.4)
  );
};

const SCENES: Record<string, Scene> = {
  code: sceneCode,
  data: sceneData,
  check: sceneCheck,
  tree: sceneTree,
  photo: scenePhoto,
  crop: sceneCrop,
  resize: sceneResize,
  compress: sceneCompress,
  convert: sceneConvert,
  upscale: sceneUpscale,
  pdf: scenePdf,
  color: sceneColor,
  text: sceneText,
  chart: sceneChart,
  lock: sceneLock,
  diff: sceneDiff,
  rotate: sceneRotate,
  flip: sceneFlip,
  watermark: sceneWatermark,
  merge: sceneMerge,
  split: sceneSplit,
  sign: sceneSign,
  scan: sceneScan,
  encode: sceneEncode,
  link: sceneLink,
  hash: sceneHash,
};

export type ToolArtScene = keyof typeof SCENES;

/** Pick a scene from the tool's slug/group/category. Specific first. */
/** Display form for a format token (e.g. "jpeg" → "JPG", "yml" → "YAML"). */
const FORMAT_DISPLAY: Record<string, string> = {
  jpeg: "JPG",
  htm: "HTML",
  yml: "YAML",
  markdown: "MD",
  text: "TXT",
  word: "DOCX",
  excel: "XLSX",
  powerpoint: "PPTX",
  regexp: "REGEX",
};
function fmt(token: string): string {
  return (FORMAT_DISPLAY[token] ?? token).toUpperCase();
}

/** Parse a converter slug into [from, to] format labels, or null. */
export function convertFormats(key: string): [string, string] | null {
  const m = key.match(/([a-z0-9]+)-to-([a-z0-9]+)/);
  if (m) return [fmt(m[1]!), fmt(m[2]!)];
  const c = key.match(/([a-z0-9]+)-(?:converter|convert)/);
  if (c) return ["", fmt(c[1]!)];
  return null;
}

/** Extract a short format/keyword label from a slug for the window tab. */
export function labelFromKey(key: string): string | undefined {
  const m = key.match(
    /\b(json|xml|yaml|yml|csv|tsv|sql|html|htm|css|scss|sass|less|toml|ini|graphql|regexp|regex|base64|jwt|uuid|markdown|md|hex|cron|env|svg)\b/,
  );
  return m ? fmt(m[1]!) : undefined;
}

function sceneKeyFor(key: string, category?: string): ToolArtScene {
  const s = `${key} ${category ?? ""}`.toLowerCase();
  const table: [RegExp, ToolArtScene][] = [
    // Image edits
    [/upscal|super.?res|enhance|enlarge/, "upscale"],
    [/watermark|stamp/, "watermark"],
    [/\bflip\b|mirror/, "flip"],
    [/rotate|deskew|straighten/, "rotate"],
    [/crop|trim/, "crop"],
    [/resize|rescale|dimension|\bscale\b/, "resize"],
    [/compress|optimi|shrink|reduce|minif/, "compress"],
    // Document / PDF ops
    [/merge|combine|\bjoin\b|concat|stitch/, "merge"],
    [/split|extract.?page|separate|divide|burst/, "split"],
    [/sign|signature|esign/, "sign"],
    [/\bocr\b|scan|recogni[sz]e|extract.?text/, "scan"],
    // Data / dev
    [/base64|encode|decode|escape|unescape|cipher|morse/, "encode"],
    [/hash|md5|sha\d|checksum|fingerprint/, "hash"],
    [/\burl\b|link|utm|slugify|shorten|querystring/, "link"],
    [/convert|-to-|to-(jpg|jpeg|png|webp|gif|bmp|ico|avif|svg|pdf|word|excel)|(png|jpg|jpeg|webp|gif|heic|avif|bmp)-to/, "convert"],
    [/diff|compare|differ/, "diff"],
    [/valid|lint|verify|\bcheck|test\b/, "check"],
    [/tree|hierarch|viewer|\bnode|sitemap|outline|nesting/, "tree"],
    [/password|jwt|token|uuid|encrypt|decrypt|secret|\bkey\b|crypt|lock|protect/, "lock"],
    [/color|color|palette|gradient|\bhex\b|\brgb\b|\bhsl\b|contrast|swatch/, "color"],
    [/chart|graph|\bstat|analytic|percent|\bcalc|counter|invoice|budget/, "chart"],
    [/json|xml|yaml|csv|parse|schema|beautif|format|prettif/, "data"],
    [/text|case|lorem|\bword|font|\btype\b|markdown|\bstring/, "text"],
    [/pdf/, "pdf"],
    [/image|photo|picture|filter|meme|blur|border|collage/, "photo"],
    [/code|dev|regex|script|css|html|\bjs\b/, "code"],
  ];
  for (const [re, sc] of table) if (re.test(s)) return sc;
  // Category fallbacks so a whole category still reads coherently.
  if (category === "image-tools") return "photo";
  if (category === "pdf-tools") return "pdf";
  return "code";
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface ToolArtOptions {
  /** Accent override; defaults to violet (the developer accent). */
  accent?: AccentKey;
  /** The tool category, used to bias the scene selection. */
  category?: string;
  /** Force a specific scene regardless of the seed/category. */
  scene?: ToolArtScene;
}

/**
 * Build the inline SVG string for a generic tool illustration.
 *
 * @param key Tool slug OR group key, selects the scene + seeds its detail.
 * @param variant Size/aspect preset.
 */
export function getToolArt(
  key: string,
  variant: ToolArtVariant = "card",
  options: ToolArtOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, radius, detail } = spec;
  const accent = accentStyle(options.accent ?? "violet");
  const [from, to] = accent.hex;
  const min = Math.min(w, h);
  const rand = mulberry32(seedFrom(key));
  const uid = `ta-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  const sceneKey = options.scene ?? sceneKeyFor(key, options.category);
  const formats = convertFormats(key) ?? undefined;
  // Only show the window filename tab on abstract window scenes (skip the icon
  // variant, too small, and scenes that already carry their own labels).
  const label =
    variant === "icon" ? undefined : labelFromKey(key);

  // Stage box the scene draws in (leaves an even margin).
  const pad = min * (variant === "icon" ? 0.12 : 0.1);
  const stage: SceneCtx = {
    x: pad,
    y: pad,
    w: w - pad * 2,
    h: h - pad * 2,
    rand,
    uid,
    from,
    to,
    stroke: Math.max(min * 0.008, 1),
    detail,
    subject: options.category === "pdf-tools" ? "doc" : "photo",
    ...(label ? { label } : {}),
    ...(formats ? { formats } : {}),
  };

  const scene = SCENES[sceneKey] ?? sceneCode;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" fill="none">` +
    `<defs>` +
    `<linearGradient id="${uid}-g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient>` +
    `<radialGradient id="${uid}-bg" cx="0.5" cy="0.32" r="0.9">` +
    `<stop offset="0" stop-color="${from}" stop-opacity="0.16"/>` +
    `<stop offset="1" stop-color="${to}" stop-opacity="0.03"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="url(#${uid}-bg)"/>` +
    scene(stage) +
    `</svg>`
  );
}

/** Same illustration as a `data:` URL, safe for `<img src>` / CSS `url()`. */
export function toolArtDataUrl(
  key: string,
  variant: ToolArtVariant = "card",
  options: ToolArtOptions = {},
): string {
  const svg = getToolArt(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All scene keys, for tooling / previews. */
export const TOOL_ART_SCENES = Object.keys(SCENES) as ToolArtScene[];
