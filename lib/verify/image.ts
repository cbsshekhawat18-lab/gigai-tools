/**
 * Image analysis: EXIF, C2PA presence, JPEG structure, ELA.
 *
 * Everything here is parsed from the file's own bytes in the browser. No
 * library is fetched for EXIF because the subset that actually matters
 * (camera, software, timestamps, GPS presence) is a small, well-specified
 * corner of TIFF IFD parsing, and hand-rolling it avoids shipping a megabyte
 * of dependency for a dozen tags.
 *
 * The discipline: report what the bytes say. "Software: Adobe Photoshop" is a
 * fact. "This image was manipulated" is not, and never appears here.
 */

import type { Signal } from "./types";

/* ── Generator fingerprints ───────────────────────────────────────────────── */

/**
 * Strings that generators genuinely write into files. These are the ONLY
 * content-level route to an "AI" reading, because they are declarations rather
 * than inferences. The file is telling us what made it.
 */
const GENERATOR_PATTERNS: { re: RegExp; name: string }[] = [
  { re: /stable\s*diffusion/i, name: "Stable Diffusion" },
  { re: /\bmidjourney\b/i, name: "Midjourney" },
  { re: /\bdall[\s·.-]?e\b/i, name: "DALL·E" },
  { re: /\bfirefly\b/i, name: "Adobe Firefly" },
  { re: /\bimagen\b/i, name: "Google Imagen" },
  { re: /\bflux\b.{0,12}(schnell|dev|pro)/i, name: "FLUX" },
  { re: /\bcomfyui\b/i, name: "ComfyUI" },
  { re: /\bautomatic1111\b/i, name: "AUTOMATIC1111" },
  { re: /\bnovelai\b/i, name: "NovelAI" },
  { re: /\bleonardo\.ai\b/i, name: "Leonardo.Ai" },
  { re: /\bideogram\b/i, name: "Ideogram" },
  { re: /openai/i, name: "OpenAI" },
  { re: /\bgemini\b|\bnano[\s-]?banana\b/i, name: "Google Gemini" },
  { re: /\bgrok\b|\bxai\b/i, name: "xAI Grok" },
  { re: /\bsora\b/i, name: "Sora" },
  { re: /\bveo\b\s?\d?/i, name: "Google Veo" },
  { re: /\brunway\b/i, name: "Runway" },
  { re: /\bpika\b/i, name: "Pika" },
  { re: /"?parameters"?\s*[:=]\s*.{0,40}(steps|sampler|cfg\s*scale)/i, name: "a diffusion pipeline (generation parameters embedded)" },
];

const EDITOR_PATTERNS: { re: RegExp; name: string }[] = [
  { re: /adobe\s*photoshop/i, name: "Adobe Photoshop" },
  { re: /adobe\s*lightroom/i, name: "Adobe Lightroom" },
  { re: /\bgimp\b/i, name: "GIMP" },
  { re: /\baffinity\b/i, name: "Affinity Photo" },
  { re: /\bcapture\s*one\b/i, name: "Capture One" },
  { re: /\bsnapseed\b/i, name: "Snapseed" },
  { re: /\bcanva\b/i, name: "Canva" },
  { re: /\bfigma\b/i, name: "Figma" },
  { re: /\bpixelmator\b/i, name: "Pixelmator" },
];

/* ── EXIF ─────────────────────────────────────────────────────────────────── */

export interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  software?: string;
  dateTimeOriginal?: string;
  dateTimeModified?: string;
  artist?: string;
  copyright?: string;
  hasGps: boolean;
  orientation?: number;
  /** Every ASCII tag value we read, for fingerprint scanning. */
  rawStrings: string[];
}

const TAGS: Record<number, keyof ExifData | "gps" | "exifIfd"> = {
  0x010f: "make",
  0x0110: "model",
  0x0131: "software",
  0x0132: "dateTimeModified",
  0x013b: "artist",
  0x8298: "copyright",
  0x0112: "orientation",
  0x8769: "exifIfd",
  0x8825: "gps",
  0x9003: "dateTimeOriginal",
  0xa434: "lens",
};

/** Parse the EXIF APP1 segment of a JPEG. Returns null when there isn't one. */
export function parseExif(bytes: Uint8Array): ExifData | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null; // not a JPEG

  let offset = 2;
  let app1: { start: number; length: number } | null = null;

  while (offset < bytes.length - 4) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1]!;
    if (marker === 0xda) break; // start of scan - no more metadata segments
    const length = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    if (marker === 0xe1) {
      const head = String.fromCharCode(...bytes.subarray(offset + 4, offset + 10));
      if (head.startsWith("Exif")) {
        app1 = { start: offset + 10, length };
        break;
      }
    }
    offset += 2 + length;
  }
  if (!app1) return null;

  const tiff = app1.start;
  const le = bytes[tiff] === 0x49; // "II" little-endian, "MM" big-endian
  const u16 = (at: number) => (le ? bytes[at]! | (bytes[at + 1]! << 8) : (bytes[at]! << 8) | bytes[at + 1]!);
  const u32 = (at: number) =>
    le
      ? (bytes[at]! | (bytes[at + 1]! << 8) | (bytes[at + 2]! << 16) | (bytes[at + 3]! << 24)) >>> 0
      : ((bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!) >>> 0;

  if (u16(tiff + 2) !== 0x2a) return null;

  const out: ExifData = { hasGps: false, rawStrings: [] };

  const readIfd = (ifdOffset: number, depth = 0) => {
    if (depth > 2 || ifdOffset <= 0 || tiff + ifdOffset + 2 > bytes.length) return;
    const base = tiff + ifdOffset;
    const count = u16(base);
    if (count > 512) return; // implausible; treat as corrupt rather than loop

    for (let i = 0; i < count; i++) {
      const entry = base + 2 + i * 12;
      if (entry + 12 > bytes.length) return;
      const tag = u16(entry);
      const type = u16(entry + 2);
      const num = u32(entry + 4);
      const key = TAGS[tag];
      if (!key) continue;

      if (key === "gps") {
        out.hasGps = true;
        continue;
      }
      if (key === "exifIfd") {
        readIfd(u32(entry + 8), depth + 1);
        continue;
      }
      if (type === 3) {
        // SHORT. Orientation is the only one we read
        if (key === "orientation") out.orientation = u16(entry + 8);
        continue;
      }
      if (type !== 2) continue; // ASCII only from here

      const valueOffset = num > 4 ? tiff + u32(entry + 8) : entry + 8;
      if (valueOffset + num > bytes.length) continue;
      const raw = String.fromCharCode(...bytes.subarray(valueOffset, valueOffset + num))
        .replace(/\0+$/, "")
        .trim();
      if (!raw) continue;
      out.rawStrings.push(raw);
      if (key !== "hasGps" && key !== "rawStrings" && key !== "orientation") {
        (out as unknown as Record<string, unknown>)[key] = raw;
      }
    }
  };

  readIfd(u32(tiff + 4));
  return out;
}

/* ── C2PA / Content Credentials ───────────────────────────────────────────── */

export interface C2paPresence {
  present: boolean;
  /** Where it was found, e.g. "JPEG APP11 (JUMBF)". */
  location?: string;
  /** Strings lifted from the manifest, when readable. */
  claims: string[];
}

/**
 * Detect Content Credentials.
 *
 * This detects PRESENCE and reads readable claim strings; it does NOT verify
 * the cryptographic signature, which needs the full c2pa toolkit and a trust
 * list. That distinction is surfaced in the UI; an unverified manifest is
 * still meaningful evidence, but calling it "verified" would be a lie.
 */
export function detectC2pa(bytes: Uint8Array): C2paPresence {
  const claims: string[] = [];
  // "jumb" / "c2pa" box identifiers appear in JPEG APP11, PNG caBX chunks and
  // ISO-BMFF boxes alike, so a bounded byte scan covers every container.
  const limit = Math.min(bytes.length, 4 * 1024 * 1024);
  const text = latin1(bytes.subarray(0, limit));

  const hasJumbf = text.includes("jumb") && text.includes("c2pa");
  const hasManifest = /c2pa\.(assertions|claim|signature)/.test(text);
  if (!hasJumbf && !hasManifest) return { present: false, claims };

  for (const m of text.matchAll(/"?(c2pa\.[a-z_.]+|urn:uuid:[0-9a-f-]+)"?/gi)) {
    if (claims.length < 20 && !claims.includes(m[1]!)) claims.push(m[1]!);
  }
  // Actions like "c2pa.created" / "c2pa.placed" describe the provenance chain.
  for (const m of text.matchAll(/"(softwareAgent|claim_generator|alg)"\s*:\s*"([^"]{2,80})"/g)) {
    const v = `${m[1]}: ${m[2]}`;
    if (claims.length < 20 && !claims.includes(v)) claims.push(v);
  }

  return { present: true, location: "Embedded JUMBF / C2PA manifest", claims };
}

function latin1(bytes: Uint8Array): string {
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return s;
}

/* ── JPEG structure ───────────────────────────────────────────────────────── */

export interface JpegStructure {
  isJpeg: boolean;
  progressive?: boolean;
  /** Number of quantization tables; 1 usually means greyscale-ish or unusual. */
  quantTables?: number;
  /** e.g. "4:2:0", "4:4:4". */
  subsampling?: string;
  hasThumbnail?: boolean;
  hasIccProfile?: boolean;
  hasXmp?: boolean;
  /** Every ASCII-ish string from metadata segments, for fingerprint scanning. */
  metaStrings: string[];
}

export function analyseJpeg(bytes: Uint8Array): JpegStructure {
  const out: JpegStructure = { isJpeg: bytes[0] === 0xff && bytes[1] === 0xd8, metaStrings: [] };
  if (!out.isJpeg) return out;

  let offset = 2;
  let quant = 0;

  while (offset < bytes.length - 4) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1]!;
    if (marker === 0xda) break;
    const length = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    const segment = bytes.subarray(offset + 4, offset + 2 + length);

    if (marker === 0xdb) quant++;
    if (marker === 0xc2) out.progressive = true;
    if (marker === 0xc0) out.progressive = out.progressive ?? false;

    // SOF0/SOF2 carry the component sampling factors → chroma subsampling.
    if ((marker === 0xc0 || marker === 0xc2) && segment.length >= 6) {
      const components = segment[5]!;
      if (components === 3 && segment.length >= 9) {
        const h = segment[7]! >> 4;
        const v = segment[7]! & 0x0f;
        out.subsampling = h === 2 && v === 2 ? "4:2:0" : h === 2 && v === 1 ? "4:2:2" : h === 1 && v === 1 ? "4:4:4" : `${h}x${v}`;
      }
    }
    if (marker === 0xe1) {
      const head = latin1(segment.subarray(0, 30));
      if (head.includes("http://ns.adobe.com/xap")) out.hasXmp = true;
      // Grab readable strings for fingerprinting (XMP is XML).
      const body = latin1(segment.subarray(0, Math.min(segment.length, 16384)));
      for (const m of body.matchAll(/[\x20-\x7e]{6,90}/g)) out.metaStrings.push(m[0]);
    }
    if (marker === 0xe2 && latin1(segment.subarray(0, 12)).startsWith("ICC_PROFILE")) out.hasIccProfile = true;
    if (marker === 0xe0) {
      // APP0/JFIF thumbnail dimensions sit at the end of the segment.
      if (segment.length >= 14 && (segment[12]! > 0 || segment[13]! > 0)) out.hasThumbnail = true;
    }
    if (marker === 0xed || marker === 0xee) {
      const body = latin1(segment.subarray(0, Math.min(segment.length, 8192)));
      for (const m of body.matchAll(/[\x20-\x7e]{6,90}/g)) out.metaStrings.push(m[0]);
    }

    offset += 2 + length;
  }

  out.quantTables = quant;
  return out;
}

/* ── Error Level Analysis ─────────────────────────────────────────────────── */

export interface ElaOptions {
  quality?: number;
  amplify?: number;
}

/**
 * Error Level Analysis: re-encode the image at a known quality and amplify the
 * per-pixel difference. Regions that survive re-compression differently show up
 * brighter.
 *
 * This is a VISUALISATION, not a detector, and the UI says so. Editing,
 * exporting, screenshotting, resizing and social-media recompression all
 * produce the same patterns as manipulation. ELA alone proves nothing.
 */
export async function computeEla(
  file: Blob,
  opts: ElaOptions = {},
): Promise<{ originalUrl: string; elaUrl: string } | null> {
  const quality = opts.quality ?? 0.9;
  const amplify = opts.amplify ?? 18;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;

  // Cap the working size: ELA on a 50MP image costs memory for no extra insight.
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const base = document.createElement("canvas");
  base.width = w;
  base.height = h;
  const bctx = base.getContext("2d", { willReadFrequently: true });
  if (!bctx) {
    bitmap.close();
    return null;
  }
  bctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const originalUrl = base.toDataURL("image/png");
  const first = bctx.getImageData(0, 0, w, h);

  // Round-trip through JPEG at a known quality.
  const jpegBlob: Blob | null = await new Promise((r) => base.toBlob(r, "image/jpeg", quality));
  if (!jpegBlob) return null;
  const reBitmap = await createImageBitmap(jpegBlob).catch(() => null);
  if (!reBitmap) return null;

  const second = document.createElement("canvas");
  second.width = w;
  second.height = h;
  const sctx = second.getContext("2d", { willReadFrequently: true });
  if (!sctx) {
    reBitmap.close();
    return null;
  }
  sctx.drawImage(reBitmap, 0, 0, w, h);
  reBitmap.close();
  const again = sctx.getImageData(0, 0, w, h);

  const diff = bctx.createImageData(w, h);
  for (let i = 0; i < first.data.length; i += 4) {
    diff.data[i] = Math.min(255, Math.abs(first.data[i]! - again.data[i]!) * amplify);
    diff.data[i + 1] = Math.min(255, Math.abs(first.data[i + 1]! - again.data[i + 1]!) * amplify);
    diff.data[i + 2] = Math.min(255, Math.abs(first.data[i + 2]! - again.data[i + 2]!) * amplify);
    diff.data[i + 3] = 255;
  }
  sctx.putImageData(diff, 0, 0);
  const elaUrl = second.toDataURL("image/png");

  base.width = base.height = 0;
  second.width = second.height = 0;
  return { originalUrl, elaUrl };
}

/* ── Signal construction ──────────────────────────────────────────────────── */

/** Scan any collection of strings for generator / editor fingerprints. */
export function findFingerprints(strings: string[]): { generators: string[]; editors: string[] } {
  const generators: string[] = [];
  const editors: string[] = [];
  const joined = strings.join(" \n ");
  for (const { re, name } of GENERATOR_PATTERNS) {
    if (re.test(joined) && !generators.includes(name)) generators.push(name);
  }
  for (const { re, name } of EDITOR_PATTERNS) {
    if (re.test(joined) && !editors.includes(name)) editors.push(name);
  }
  return { generators, editors };
}

export interface ImageAnalysis {
  exif: ExifData | null;
  c2pa: C2paPresence;
  jpeg: JpegStructure;
  signals: Signal[];
}

/** Run the byte-level image modules and turn the findings into signals. */
export function analyseImageBytes(bytes: Uint8Array): ImageAnalysis {
  const exif = parseExif(bytes);
  const c2pa = detectC2pa(bytes);
  const jpeg = analyseJpeg(bytes);
  const signals: Signal[] = [];

  const allStrings = [...(exif?.rawStrings ?? []), ...jpeg.metaStrings];
  const { generators, editors } = findFingerprints(allStrings);

  /* Provenance, the only strong evidence available client-side. */
  if (c2pa.present) {
    const declaresAi = /ai|generat|trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia/i.test(
      c2pa.claims.join(" "),
    );
    signals.push({
      id: "c2pa-present",
      category: "provenance",
      title: "Content Credentials found",
      finding: declaresAi
        ? "This file carries an embedded C2PA manifest, and the claims reference AI or algorithmic media."
        : "This file carries an embedded C2PA manifest describing how it was made.",
      direction: declaresAi ? "ai" : "human",
      reliability: "strong",
      weight: declaresAi ? 0.9 : 0.55,
      evidence: { location: c2pa.location ?? "embedded", claims: c2pa.claims.slice(0, 8).join(", ") },
      alternative:
        "The signature is not cryptographically verified here, so a manifest could in principle have been copied from another file. Presence is strong evidence, not proof.",
      module: "c2pa",
    });
  } else {
    signals.push({
      id: "c2pa-absent",
      category: "provenance",
      title: "No Content Credentials",
      finding: "No C2PA provenance manifest is embedded in this file.",
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      alternative:
        "Most files have never carried provenance data. Absence says nothing about whether the content is human or AI: social platforms and messaging apps also strip it routinely.",
      module: "c2pa",
    });
  }

  /* Declared generator: the file naming its own maker. */
  if (generators.length) {
    signals.push({
      id: "generator-fingerprint",
      category: "metadata",
      title: "Generative software named in metadata",
      finding: `The file's metadata references ${generators.join(", ")}.`,
      direction: "ai",
      reliability: "strong",
      weight: 0.85,
      evidence: { software: generators.join(", ") },
      alternative:
        "Metadata can be copied between files or added by hand, and an editor that merely opened the file can leave its name behind.",
      module: "metadata",
    });
  }

  /* Camera evidence. */
  if (exif?.make || exif?.model) {
    signals.push({
      id: "camera-present",
      category: "metadata",
      title: "Camera information present",
      finding: `EXIF names a capture device: ${[exif.make, exif.model].filter(Boolean).join(" ")}${exif.lens ? ` with ${exif.lens}` : ""}.`,
      direction: "human",
      reliability: "moderate",
      weight: 0.45,
      evidence: {
        make: exif.make ?? "",
        model: exif.model ?? "",
        ...(exif.lens ? { lens: exif.lens } : {}),
        ...(exif.dateTimeOriginal ? { captured: exif.dateTimeOriginal } : {}),
        gps: exif.hasGps,
      },
      alternative:
        "EXIF is trivially editable: camera tags can be written into any file, including a generated one.",
      module: "exif",
    });
  } else if (exif) {
    signals.push({
      id: "camera-absent",
      category: "metadata",
      title: "No camera information",
      finding: "The file has EXIF metadata but no camera make or model.",
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      alternative:
        "Screenshots, exports, downloads and edited images routinely lose camera tags. This is not evidence of AI.",
      module: "exif",
    });
  } else {
    signals.push({
      id: "exif-absent",
      category: "metadata",
      title: "No EXIF metadata",
      finding: "No EXIF metadata block was found in this file.",
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      alternative:
        "Almost every social platform, messaging app and screenshot strips metadata entirely. Missing EXIF is the normal state of an image from the internet and is not evidence of anything.",
      module: "exif",
    });
  }

  /* Editing software. */
  if (editors.length) {
    signals.push({
      id: "editor-fingerprint",
      category: "metadata",
      title: "Editing software detected",
      finding: `The file passed through ${editors.join(", ")}.`,
      direction: "edited",
      reliability: "moderate",
      weight: 0.35,
      evidence: { software: editors.join(", ") },
      alternative:
        "Ordinary photo editing (cropping, color correction, exporting for the web) produces exactly this signal.",
      module: "metadata",
    });
  }

  /* Timestamp conflict. */
  if (exif?.dateTimeOriginal && exif?.dateTimeModified && exif.dateTimeOriginal !== exif.dateTimeModified) {
    signals.push({
      id: "timestamp-mismatch",
      category: "metadata",
      title: "Capture and modification times differ",
      finding: `Captured ${exif.dateTimeOriginal}, last modified ${exif.dateTimeModified}.`,
      direction: "edited",
      reliability: "weak",
      weight: 0.2,
      evidence: { captured: exif.dateTimeOriginal, modified: exif.dateTimeModified },
      alternative:
        "Any edit, export or even a metadata rewrite updates the modification time. A difference is expected for most edited photos.",
      module: "exif",
    });
  }

  /* Structure. */
  if (jpeg.isJpeg) {
    signals.push({
      id: "jpeg-structure",
      category: "structure",
      title: "JPEG structure read",
      finding: `${jpeg.progressive ? "Progressive" : "Baseline"} JPEG${jpeg.subsampling ? `, ${jpeg.subsampling} chroma subsampling` : ""}${jpeg.quantTables ? `, ${jpeg.quantTables} quantization table${jpeg.quantTables === 1 ? "" : "s"}` : ""}.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      evidence: {
        mode: jpeg.progressive ? "progressive" : "baseline",
        subsampling: jpeg.subsampling ?? "unknown",
        quantTables: jpeg.quantTables ?? 0,
        iccProfile: Boolean(jpeg.hasIccProfile),
        xmp: Boolean(jpeg.hasXmp),
        thumbnail: Boolean(jpeg.hasThumbnail),
      },
      alternative:
        "Encoder settings vary with the software and platform that produced the file. They describe how it was saved, not who or what made it.",
      module: "structure",
    });
  }

  return { exif, c2pa, jpeg, signals };
}
