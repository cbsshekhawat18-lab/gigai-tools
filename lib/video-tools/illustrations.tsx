/**
 * Video tool illustrations: deterministic, on-brand SVG artwork for the Video
 * Toolkit.
 *
 * Same design language and contract as `lib/qr/illustrations`,
 * `lib/seo-tools/illustrations`, `lib/svg-tools/illustrations` and
 * `lib/document-tools/illustrations`: given a stable seed (a tool slug or a
 * group key like "compress"/"convert"/"trim"/"gif"/"audio") we DERIVE a
 * distinct-but-consistent illustration so every video tool gets branded artwork
 * for free. Pure and client-safe (no DOM, no libraries) so it renders on the
 * server (static export), in tool cards, hero banners and OG images alike.
 *
 * The motif is a stylised "film frame" scene: a rounded video frame plate with
 * a strip of sprocket holes down each edge, a large play triangle centred in
 * the viewport, a seeded timeline scrubber at the bottom (playhead + ticks), and
 * a small "purpose glyph" (compress/converge, convert/arrows, trim/scissor,
 * gif/frames, audio/waveform, extract-frame/grid, mute/speaker, merge/stack)
 * floated over it hinting at the tool's group.
 *
 * Usage:
 *   getVideoIllustration("video-compressor", "hero")  -> inline SVG string
 *   videoIllustrationDataUrl("convert", "card")        -> data: URL (for <img>)
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants (aspect + density presets; shared vocabulary with the others) ── */

export type VideoIllustrationVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  readonly w: number;
  readonly h: number;
  /** Number of sprocket holes down each vertical edge of the film frame. */
  readonly perfs: number;
  /** Whether to draw the floating purpose glyph. */
  readonly glyph: boolean;
  /** Whether to draw the timeline scrubber (playhead + ticks) below the frame. */
  readonly scrubber: boolean;
  /** Corner radius of the outer plate, in viewBox units. */
  readonly radius: number;
}

const VARIANTS: Record<VideoIllustrationVariant, VariantSpec> = {
  icon: { w: 96, h: 96, perfs: 3, glyph: false, scrubber: false, radius: 8 },
  card: { w: 400, h: 300, perfs: 5, glyph: true, scrubber: true, radius: 5 },
  hero: { w: 1200, h: 630, perfs: 7, glyph: true, scrubber: true, radius: 6 },
  banner: { w: 1200, h: 300, perfs: 5, glyph: true, scrubber: true, radius: 6 },
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
 * also understands video group labels ("Compress", "Convert", "Trim", …).
 */
const GLYPHS: Record<string, string> = {
  // The default: a play triangle in a rounded frame.
  play: "M4 4h16v16H4zM10 9l6 3-6 3z",
  // Compress: arrows converging inward.
  compress: "M4 4l5 5M9 4H4v5M20 4l-5 5M15 4h5v5M4 20l5-5M9 20H4v-5M20 20l-5-5M15 20h5v-5",
  // Convert, two-way arrows.
  convert: "M4 8h13l-3-3M4 8l3 3M20 16H7l3 3M20 16l-3-3",
  // Trim / cut: scissors on a timeline.
  trim: "M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 9l12 6M8 15l12-6M3 12h4",
  // GIF / frames, a strip of film frames.
  gif: "M3 6h18v12H3zM7 6v12M17 6v12M3 10h4M17 10h4M3 14h4M17 14h4",
  // Audio: a waveform.
  audio: "M3 12h2l2-6 3 14 3-11 2 6 2-3h4",
  // Extract frame / thumbnail: a framed grid.
  frame: "M4 5h16v14H4zM4 12h16M12 5v14M8 9h.01M16 15h.01",
  // Mute / remove audio, a speaker with a slash.
  mute: "M4 9v6h4l5 4V5L8 9zM16 9l6 6M22 9l-6 6",
  // Merge / join, two clips flowing into one.
  merge: "M4 5h6v6H4zM4 13h6v6H4zM10 8h4a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-4M14 11l3 1M17 12l-3 1",
  // Resize / scale: a frame with a drag handle.
  resize: "M4 4h10v10H4zM8 8h12v12H8M14 14l4 4M18 14v4h-4",
  // Speed, a fast-forward chevron.
  speed: "M4 6l7 6-7 6zM13 6l7 6-7 6z",
  // Rotate: a curved arrow around a frame.
  rotate: "M6 8h8v8H6zM17 6a7 7 0 1 1-2-1M15 3v3h-3",
};

/** Map a seed (slug or group label) to a glyph key. */
function glyphKeyFor(key: string): keyof typeof GLYPHS {
  const s = key.toLowerCase();
  const table: [RegExp, keyof typeof GLYPHS][] = [
    [/compress|reduce|shrink|optimi[sz]e|smaller/, "compress"],
    [/trim|cut|clip|crop-time|split/, "trim"],
    [/gif|to-gif|animated/, "gif"],
    [/extract-audio|to-mp3|to-aac|to-wav|audio|sound|soundtrack/, "audio"],
    [/mute|remove-audio|silence|no-audio/, "mute"],
    [/thumbnail|frame|screenshot|poster|still|snapshot/, "frame"],
    [/merge|combin|join|concat|stitch/, "merge"],
    [/resize|scale|dimension|crop|aspect/, "resize"],
    [/speed|slow|fast|timelapse|rate/, "speed"],
    [/rotate|flip|orient/, "rotate"],
    [/convert|to-webm|to-mp4|to-mov|to-mkv|to-avi|transcode|webm|mp4|mov/, "convert"],
  ];
  for (const [re, g] of table) if (re.test(s)) return g;
  return "play";
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface VideoIllustrationOptions {
  /** Accent override; defaults to the Video Toolkit accent (cyan). */
  accent?: AccentKey;
  /** Force a specific glyph regardless of the seed key. */
  glyph?: keyof typeof GLYPHS;
}

/**
 * Build the inline SVG string for a video-tool illustration.
 *
 * @param key Tool slug OR group key (e.g. "compress", "convert", "trim") -
 *                seeds both the film-frame layout and the purpose glyph.
 * @param variant Size/aspect preset.
 */
export function getVideoIllustration(
  key: string,
  variant: VideoIllustrationVariant = "card",
  options: VideoIllustrationOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, radius } = spec;
  const accent = accentStyle(options.accent ?? "cyan");
  const [from, to] = accent.hex;

  const rand = mulberry32(seedFrom(key));
  const uid = `vid-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  const isWide = variant === "hero" || variant === "banner";
  const min = Math.min(w, h);

  // ── Film frame geometry: a 16:9-ish landscape frame centred (or left-set on
  //    wide banners so the glyph has room on the right). ────────────────────────
  const frameW = isWide ? w * 0.5 : w * (variant === "icon" ? 0.7 : 0.66);
  const frameH = spec.scrubber ? frameW * 0.56 : frameW * 0.62;
  const fx = isWide ? w * 0.08 : (w - frameW) / 2;
  const fy = (h - frameH) / 2 - (spec.scrubber ? min * 0.05 : 0);
  const fr = round(frameW * 0.05);

  // ── Sprocket-hole strips down each vertical edge of the frame. ─────────────
  const perfW = round(frameW * 0.045);
  const stripInset = perfW * 1.6;
  const perfs: string[] = [];
  const n = spec.perfs;
  const perfTop = fy + frameH * 0.1;
  const perfSpan = frameH * 0.8;
  const perfGap = perfSpan / Math.max(1, n);
  const perfH = round(perfGap * 0.5);
  for (let i = 0; i < n; i++) {
    const py = round(perfTop + i * perfGap + (perfGap - perfH) / 2);
    perfs.push(
      `<rect x="${round(fx + stripInset - perfW / 2)}" y="${py}" width="${perfW}" height="${perfH}" rx="${round(
        perfW * 0.3,
      )}"/>`,
      `<rect x="${round(fx + frameW - stripInset - perfW / 2)}" y="${py}" width="${perfW}" height="${perfH}" rx="${round(
        perfW * 0.3,
      )}"/>`,
    );
  }

  // ── Central play triangle inside the frame's "viewport". ──────────────────
  const vpX = fx + stripInset * 2;
  const vpW = frameW - stripInset * 4;
  const vpCx = vpX + vpW / 2;
  const vpCy = fy + frameH / 2;
  const triR = Math.min(vpW, frameH) * (variant === "icon" ? 0.3 : 0.24);
  const tri =
    `M ${round(vpCx - triR * 0.5)} ${round(vpCy - triR * 0.86)}` +
    ` L ${round(vpCx + triR)} ${round(vpCy)}` +
    ` L ${round(vpCx - triR * 0.5)} ${round(vpCy + triR * 0.86)} Z`;

  // ── Optional timeline scrubber (playhead + seeded ticks) below the frame. ──
  let scrubber = "";
  if (spec.scrubber) {
    const trackY = round(fy + frameH + min * 0.09);
    const trackX0 = round(fx + frameW * 0.05);
    const trackX1 = round(fx + frameW * 0.95);
    const trackW = trackX1 - trackX0;
    const trackH = round(min * 0.02);
    // Playhead position varies per seed (feels like a real scrub position).
    const headT = 0.28 + rand() * 0.44;
    const headX = round(trackX0 + trackW * headT);
    // Ticks along the track.
    const ticks: string[] = [];
    const tickN = variant === "hero" ? 9 : 7;
    for (let i = 1; i < tickN; i++) {
      const tx = round(trackX0 + (trackW / tickN) * i);
      ticks.push(
        `<rect x="${tx}" y="${round(trackY - trackH * 1.6)}" width="${round(
          Math.max(1, trackH * 0.28),
        )}" height="${round(trackH * 4.2)}" rx="${round(trackH * 0.14)}"/>`,
      );
    }
    scrubber =
      // Track base
      `<rect x="${trackX0}" y="${trackY}" width="${trackW}" height="${trackH}" rx="${round(
        trackH / 2,
      )}" fill="url(#${uid}-g)" opacity="0.2"/>` +
      // Buffered/played portion up to the playhead
      `<rect x="${trackX0}" y="${trackY}" width="${round(headX - trackX0)}" height="${trackH}" rx="${round(
        trackH / 2,
      )}" fill="url(#${uid}-g)"/>` +
      // Ticks
      `<g fill="url(#${uid}-g)" opacity="0.35">${ticks.join("")}</g>` +
      // Playhead knob
      `<circle cx="${headX}" cy="${round(trackY + trackH / 2)}" r="${round(
        trackH * 1.9,
      )}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(
        min * 0.008,
      )}"/>`;
  }

  // ── Optional floating purpose glyph, bottom-right, on a soft plate. ───────
  let glyph = "";
  if (spec.glyph) {
    const gk = options.glyph ?? glyphKeyFor(key);
    const path = GLYPHS[gk] ?? GLYPHS.play;
    const plate = min * (variant === "banner" ? 0.42 : 0.34);
    const gx = w - plate - min * 0.08;
    const gy = h - plate - min * 0.08;
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
    `<feDropShadow dx="0" dy="${round(min * 0.012)}" stdDeviation="${round(
      min * 0.02,
    )}" flood-color="${from}" flood-opacity="0.35"/></filter>` +
    `</defs>` +
    // Plate background
    `<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="url(#${uid}-bg)"/>` +
    // Film frame
    `<rect x="${round(fx)}" y="${round(fy)}" width="${round(frameW)}" height="${round(
      frameH,
    )}" rx="${fr}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(
      min * 0.008,
    )}"/>` +
    // Sprocket holes
    `<g fill="url(#${uid}-g)" opacity="0.4">${perfs.join("")}</g>` +
    // Play triangle
    `<path d="${tri}" fill="url(#${uid}-g)"/>` +
    // Timeline scrubber
    scrubber +
    // Floating purpose glyph
    glyph +
    `</svg>`
  );
}

/** Round to 2dp and drop trailing zeros. Keeps the SVG string compact. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Same illustration as a `data:` URL, safe for `<img src>` / CSS `url()`. */
export function videoIllustrationDataUrl(
  key: string,
  variant: VideoIllustrationVariant = "card",
  options: VideoIllustrationOptions = {},
): string {
  const svg = getVideoIllustration(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All glyph keys, for tooling / previews. */
export const VIDEO_GLYPH_KEYS = Object.keys(GLYPHS) as (keyof typeof GLYPHS)[];
