/**
 * Audio tool illustrations, deterministic, on-brand SVG artwork for the Audio
 * Toolkit.
 *
 * Same design language and contract as `lib/qr/illustrations`,
 * `lib/seo-tools/illustrations`, `lib/svg-tools/illustrations`,
 * `lib/document-tools/illustrations` and `lib/video-tools/illustrations`: given
 * a stable seed (a tool slug or a group key like "trim"/"convert"/"record"/
 * "merge"/"normalize") we DERIVE a distinct-but-consistent illustration so every
 * audio tool gets branded artwork for free. Pure and client-safe. No DOM, no
 * libraries, so it renders on the server (static export), in tool cards, hero
 * banners and OG images alike.
 *
 * The motif is a stylised "audio scene": a rounded plate holding a centred
 * waveform (a symmetric stack of seeded amplitude bars, like a real oscillogram)
 * with a playhead sweeping across it, an optional playback progress track below,
 * and a small "purpose glyph" (trim/scissor, convert/arrows, record/dot,
 * merge/stack, normalize/level, volume/speaker, speed/gauge, reverse/loop,
 * fade/wedge, silence/mute) floated over it hinting at the tool's group.
 *
 * Usage:
 *   getAudioIllustration("audio-trimmer", "hero")  -> inline SVG string
 *   audioIllustrationDataUrl("convert", "card")    -> data: URL (for <img>)
 */
import type { AccentKey } from "@/types";
import { accentStyle } from "@/lib/design";

/* ── Variants (aspect + density presets; shared vocabulary with the others) ── */

export type AudioIllustrationVariant = "icon" | "card" | "hero" | "banner";

interface VariantSpec {
  readonly w: number;
  readonly h: number;
  /** Number of amplitude bars in the waveform. */
  readonly bars: number;
  /** Whether to draw the floating purpose glyph. */
  readonly glyph: boolean;
  /** Whether to draw the playback progress track below the waveform. */
  readonly track: boolean;
  /** Corner radius of the outer plate, in viewBox units. */
  readonly radius: number;
}

const VARIANTS: Record<AudioIllustrationVariant, VariantSpec> = {
  icon: { w: 96, h: 96, bars: 13, glyph: false, track: false, radius: 8 },
  card: { w: 400, h: 300, bars: 33, glyph: true, track: true, radius: 5 },
  hero: { w: 1200, h: 630, bars: 63, glyph: true, track: true, radius: 6 },
  banner: { w: 1200, h: 300, bars: 71, glyph: true, track: true, radius: 6 },
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
 * also understands audio group labels ("Trim", "Convert", "Record", …).
 */
const GLYPHS: Record<string, string> = {
  // The default, a compact waveform.
  wave: "M3 12h2l2-6 3 14 3-11 2 6 2-3h4",
  // Trim / cut, scissors on a track.
  trim: "M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 9l12 6M8 15l12-6M3 12h4",
  // Convert, two-way arrows.
  convert: "M4 8h13l-3-3M4 8l3 3M20 16H7l3 3M20 16l-3-3",
  // Record: a filled dot in a ring.
  record: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  // Merge / join, two tracks flowing into one.
  merge: "M4 5h6v6H4zM4 13h6v6H4zM10 8h4a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-4M14 11l3 1M17 12l-3 1",
  // Normalize / level, a fader / equalizer level.
  normalize: "M6 4v16M12 4v16M18 4v16M3 9h6M9 15h6M15 7h6",
  // Volume, a speaker with sound waves.
  volume: "M4 9v6h4l5 4V5L8 9zM16 9a3 3 0 0 1 0 6M18.5 7a6 6 0 0 1 0 10",
  // Speed, a gauge / tachometer.
  speed: "M12 14a9 9 0 1 1 8-5M12 14l4-4M12 14h.01M4 20h16",
  // Reverse: a looping back arrow.
  reverse: "M4 12a8 8 0 1 1 3 6M4 18v-4h4M8 9l4 3-4 3",
  // Fade, a rising wedge.
  fade: "M3 20L21 6M3 20h18M3 20v-2M9 20v-6M15 20v-9M21 20V6",
  // Silence / mute: a speaker with a slash.
  mute: "M4 9v6h4l5 4V5L8 9zM16 9l6 6M22 9l-6 6",
  // Ringtone / bell, a phone bell.
  ring: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21a2 2 0 0 0 4 0",
};

/** Map a seed (slug or group label) to a glyph key. */
function glyphKeyFor(key: string): keyof typeof GLYPHS {
  const s = key.toLowerCase();
  const table: [RegExp, keyof typeof GLYPHS][] = [
    [/trim|cut|clip|split/, "trim"],
    [/record|capture|mic|voice/, "record"],
    [/merge|combin|join|concat|stitch|mix/, "merge"],
    [/normali[sz]e|level|gain|loudness|equali[sz]e/, "normalize"],
    [/volume|amplif|louder|quieter/, "volume"],
    [/speed|slow|fast|tempo|rate|pitch/, "speed"],
    [/reverse|backward|reversal/, "reverse"],
    [/fade|in-out|crossfade/, "fade"],
    [/silence|mute|remove-silence|trim-silence|gap/, "mute"],
    [/ringtone|ring|alert|notification/, "ring"],
    [
      /convert|to-mp3|to-wav|to-ogg|to-flac|to-m4a|to-aac|transcode|mp3|wav|ogg|flac|m4a|aac/,
      "convert",
    ],
  ];
  for (const [re, g] of table) if (re.test(s)) return g;
  return "wave";
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

export interface AudioIllustrationOptions {
  /** Accent override; defaults to the Audio Toolkit accent (rose). */
  accent?: AccentKey;
  /** Force a specific glyph regardless of the seed key. */
  glyph?: keyof typeof GLYPHS;
}

/**
 * Build the inline SVG string for an audio-tool illustration.
 *
 * @param key Tool slug OR group key (e.g. "trim", "convert", "record") -
 *                seeds both the waveform shape and the purpose glyph.
 * @param variant Size/aspect preset.
 */
export function getAudioIllustration(
  key: string,
  variant: AudioIllustrationVariant = "card",
  options: AudioIllustrationOptions = {},
): string {
  const spec = VARIANTS[variant];
  const { w, h, radius } = spec;
  const accent = accentStyle(options.accent ?? "rose");
  const [from, to] = accent.hex;

  const rand = mulberry32(seedFrom(key));
  const uid = `aud-${(seedFrom(`${key}:${variant}`) % 0xffffff).toString(16)}`;

  const isWide = variant === "hero" || variant === "banner";
  const min = Math.min(w, h);

  // ── Waveform panel geometry: a centred oscillogram plate (left-set on wide
  //    banners so the glyph has room on the right). ──────────────────────────
  const panelW = isWide ? w * 0.62 : w * (variant === "icon" ? 0.78 : 0.82);
  const panelH = spec.track ? min * 0.5 : min * 0.62;
  const px = isWide ? w * 0.07 : (w - panelW) / 2;
  const py = (h - panelH) / 2 - (spec.track ? min * 0.05 : 0);

  // ── The waveform: a symmetric stack of seeded amplitude bars mirrored around
  //    a centre baseline, like a real audio oscillogram. ─────────────────────
  const cy = py + panelH / 2;
  const n = spec.bars;
  const pad = panelW * 0.06;
  const usableW = panelW - pad * 2;
  const slot = usableW / n;
  const barW = round(Math.max(1, slot * 0.5));
  const maxAmp = panelH * 0.44;
  // Playhead sweeps to a seeded position; bars before it read "played".
  const headT = 0.32 + rand() * 0.4;
  const headIdx = Math.floor(n * headT);

  const played: string[] = [];
  const upcoming: string[] = [];
  for (let i = 0; i < n; i++) {
    const bx = round(px + pad + slot * i + (slot - barW) / 2);
    // A gentle envelope (louder in the middle) times per-bar randomness, reads
    // like speech/music rather than white noise.
    const t = i / (n - 1);
    const envelope = 0.35 + 0.65 * Math.sin(Math.PI * t);
    const amp = round(Math.max(min * 0.02, maxAmp * envelope * (0.35 + rand() * 0.65)));
    const bh = round(amp * 2);
    const byTop = round(cy - amp);
    const bar = `<rect x="${bx}" y="${byTop}" width="${barW}" height="${bh}" rx="${round(
      barW / 2,
    )}"/>`;
    (i <= headIdx ? played : upcoming).push(bar);
  }

  const waveform =
    `<g fill="url(#${uid}-g)">${played.join("")}</g>` +
    `<g fill="url(#${uid}-g)" opacity="0.28">${upcoming.join("")}</g>`;

  // ── Playhead: a vertical line + knob at the sweep position. ───────────────
  const headX = round(px + pad + usableW * headT);
  const headTop = round(py + panelH * 0.08);
  const headBot = round(py + panelH * 0.92);
  const playhead =
    `<line x1="${headX}" y1="${headTop}" x2="${headX}" y2="${headBot}" stroke="url(#${uid}-g)" stroke-width="${round(
      Math.max(1, min * 0.006),
    )}" stroke-linecap="round"/>` +
    `<circle cx="${headX}" cy="${headTop}" r="${round(
      min * 0.022,
    )}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(min * 0.008)}"/>`;

  // ── Optional playback progress track below the waveform panel. ────────────
  let track = "";
  if (spec.track) {
    const trackY = round(py + panelH + min * 0.1);
    const trackX0 = round(px + panelW * 0.05);
    const trackX1 = round(px + panelW * 0.95);
    const trackW = trackX1 - trackX0;
    const trackH = round(min * 0.02);
    const knobX = round(trackX0 + trackW * headT);
    track =
      // Track base
      `<rect x="${trackX0}" y="${trackY}" width="${trackW}" height="${trackH}" rx="${round(
        trackH / 2,
      )}" fill="url(#${uid}-g)" opacity="0.2"/>` +
      // Played portion
      `<rect x="${trackX0}" y="${trackY}" width="${round(knobX - trackX0)}" height="${trackH}" rx="${round(
        trackH / 2,
      )}" fill="url(#${uid}-g)"/>` +
      // Knob
      `<circle cx="${knobX}" cy="${round(trackY + trackH / 2)}" r="${round(
        trackH * 1.9,
      )}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(min * 0.008)}"/>`;
  }

  // ── Optional floating purpose glyph, bottom-right, on a soft plate. ───────
  let glyph = "";
  if (spec.glyph) {
    const gk = options.glyph ?? glyphKeyFor(key);
    const path = GLYPHS[gk] ?? GLYPHS.wave;
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
    // Waveform panel
    `<rect x="${round(px)}" y="${round(py)}" width="${round(panelW)}" height="${round(
      panelH,
    )}" rx="${round(panelW * 0.05)}" fill="var(--card, #ffffff)" stroke="url(#${uid}-g)" stroke-width="${round(
      min * 0.008,
    )}"/>` +
    // Centre baseline
    `<line x1="${round(px + pad)}" y1="${round(cy)}" x2="${round(
      px + panelW - pad,
    )}" y2="${round(cy)}" stroke="url(#${uid}-g)" stroke-width="${round(
      Math.max(1, min * 0.004),
    )}" opacity="0.25"/>` +
    // Amplitude bars
    waveform +
    // Playhead
    playhead +
    // Progress track
    track +
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
export function audioIllustrationDataUrl(
  key: string,
  variant: AudioIllustrationVariant = "card",
  options: AudioIllustrationOptions = {},
): string {
  const svg = getAudioIllustration(key, variant, options);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** All glyph keys, for tooling / previews. */
export const AUDIO_GLYPH_KEYS = Object.keys(GLYPHS) as (keyof typeof GLYPHS)[];
