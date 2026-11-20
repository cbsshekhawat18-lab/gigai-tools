/**
 * File Detector: work out what a file actually is.
 *
 * Extension and the browser's `file.type` are both hints, not facts: a `.jpg`
 * that is really a PNG, or a file with an empty MIME because it came off a
 * phone share sheet, are both routine. So the first 32 bytes are read and
 * matched against magic numbers, and that wins when it disagrees with the name.
 * Getting this right is what stops GigAI Fit handing a PNG to the JPEG path and
 * reporting a confusing failure two steps later.
 */

import type { FileKind } from "./types";

interface Signature {
  kind: FileKind;
  mime: string;
  label: string;
  /** Byte pattern; null means "any byte" (wildcard). */
  magic: (number | null)[];
  offset?: number;
}

/* Ordered most-specific first. RIFF and ISO-BMFF need a second check, handled
   below, because the leading bytes alone don't distinguish WAV from AVI or MP4
   from M4A. */
const SIGNATURES: Signature[] = [
  { kind: "image", mime: "image/jpeg", label: "JPG Image", magic: [0xff, 0xd8, 0xff] },
  { kind: "image", mime: "image/png", label: "PNG Image", magic: [0x89, 0x50, 0x4e, 0x47] },
  { kind: "image", mime: "image/gif", label: "GIF Image", magic: [0x47, 0x49, 0x46, 0x38] },
  { kind: "image", mime: "image/bmp", label: "BMP Image", magic: [0x42, 0x4d] },
  { kind: "image", mime: "image/tiff", label: "TIFF Image", magic: [0x49, 0x49, 0x2a, 0x00] },
  { kind: "image", mime: "image/tiff", label: "TIFF Image", magic: [0x4d, 0x4d, 0x00, 0x2a] },
  { kind: "pdf", mime: "application/pdf", label: "PDF Document", magic: [0x25, 0x50, 0x44, 0x46] },
  { kind: "audio", mime: "audio/mpeg", label: "MP3 Audio", magic: [0x49, 0x44, 0x33] },
  { kind: "audio", mime: "audio/mpeg", label: "MP3 Audio", magic: [0xff, 0xfb] },
  { kind: "audio", mime: "audio/mpeg", label: "MP3 Audio", magic: [0xff, 0xf3] },
  { kind: "audio", mime: "audio/flac", label: "FLAC Audio", magic: [0x66, 0x4c, 0x61, 0x43] },
  { kind: "video", mime: "video/x-matroska", label: "MKV Video", magic: [0x1a, 0x45, 0xdf, 0xa3] },
];

const EXT_MAP: Record<string, { kind: FileKind; mime: string; label: string }> = {
  jpg: { kind: "image", mime: "image/jpeg", label: "JPG Image" },
  jpeg: { kind: "image", mime: "image/jpeg", label: "JPG Image" },
  png: { kind: "image", mime: "image/png", label: "PNG Image" },
  webp: { kind: "image", mime: "image/webp", label: "WebP Image" },
  avif: { kind: "image", mime: "image/avif", label: "AVIF Image" },
  gif: { kind: "image", mime: "image/gif", label: "GIF Image" },
  bmp: { kind: "image", mime: "image/bmp", label: "BMP Image" },
  tif: { kind: "image", mime: "image/tiff", label: "TIFF Image" },
  tiff: { kind: "image", mime: "image/tiff", label: "TIFF Image" },
  heic: { kind: "image", mime: "image/heic", label: "HEIC Image" },
  heif: { kind: "image", mime: "image/heif", label: "HEIF Image" },
  svg: { kind: "image", mime: "image/svg+xml", label: "SVG Image" },

  pdf: { kind: "pdf", mime: "application/pdf", label: "PDF Document" },

  mp4: { kind: "video", mime: "video/mp4", label: "MP4 Video" },
  m4v: { kind: "video", mime: "video/mp4", label: "MP4 Video" },
  mov: { kind: "video", mime: "video/quicktime", label: "MOV Video" },
  webm: { kind: "video", mime: "video/webm", label: "WebM Video" },
  mkv: { kind: "video", mime: "video/x-matroska", label: "MKV Video" },
  avi: { kind: "video", mime: "video/x-msvideo", label: "AVI Video" },

  mp3: { kind: "audio", mime: "audio/mpeg", label: "MP3 Audio" },
  wav: { kind: "audio", mime: "audio/wav", label: "WAV Audio" },
  m4a: { kind: "audio", mime: "audio/mp4", label: "M4A Audio" },
  aac: { kind: "audio", mime: "audio/aac", label: "AAC Audio" },
  ogg: { kind: "audio", mime: "audio/ogg", label: "OGG Audio" },
  oga: { kind: "audio", mime: "audio/ogg", label: "OGG Audio" },
  flac: { kind: "audio", mime: "audio/flac", label: "FLAC Audio" },

  docx: { kind: "document", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word Document" },
  doc: { kind: "document", mime: "application/msword", label: "Word Document" },
  pptx: { kind: "document", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", label: "PowerPoint" },
  xlsx: { kind: "document", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "Excel Workbook" },
  epub: { kind: "document", mime: "application/epub+zip", label: "EPUB Book" },
  txt: { kind: "document", mime: "text/plain", label: "Text File" },
  md: { kind: "document", mime: "text/markdown", label: "Markdown File" },
};

function matches(bytes: Uint8Array, sig: Signature): boolean {
  const at = sig.offset ?? 0;
  if (bytes.length < at + sig.magic.length) return false;
  return sig.magic.every((b, i) => b === null || bytes[at + i] === b);
}

const ascii = (bytes: Uint8Array, from: number, len: number) =>
  String.fromCharCode(...bytes.subarray(from, from + len));

export interface Detected {
  kind: FileKind;
  mime: string;
  label: string;
  /** True when the magic bytes disagreed with the file's extension. */
  extensionMismatch: boolean;
}

/**
 * Identify a file from its first bytes, falling back to its extension.
 *
 * Reads only a 32-byte slice, so this is safe to call the instant a file is
 * dropped even when the file is gigabytes.
 */
export async function detectFile(file: File): Promise<Detected> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());

  let found: { kind: FileKind; mime: string; label: string } | null = null;

  // ISO base media (MP4 / MOV / M4A / HEIC), "ftyp" at offset 4, then a brand.
  if (head.length >= 12 && ascii(head, 4, 4) === "ftyp") {
    const brand = ascii(head, 8, 4).trim().toLowerCase();
    if (brand.startsWith("qt")) found = { kind: "video", mime: "video/quicktime", label: "MOV Video" };
    else if (brand.startsWith("m4a")) found = { kind: "audio", mime: "audio/mp4", label: "M4A Audio" };
    else if (brand.startsWith("heic") || brand.startsWith("heif") || brand.startsWith("mif1"))
      found = { kind: "image", mime: "image/heic", label: "HEIC Image" };
    else found = { kind: "video", mime: "video/mp4", label: "MP4 Video" };
  }

  // RIFF container: WAV, AVI and WebP all start "RIFF"; the type tag is at 8.
  if (!found && head.length >= 12 && ascii(head, 0, 4) === "RIFF") {
    const type = ascii(head, 8, 4);
    if (type === "WAVE") found = { kind: "audio", mime: "audio/wav", label: "WAV Audio" };
    else if (type === "AVI ") found = { kind: "video", mime: "video/x-msvideo", label: "AVI Video" };
    else if (type === "WEBP") found = { kind: "image", mime: "image/webp", label: "WebP Image" };
  }

  // OGG carries either audio or video; treat as audio, which is the real case.
  if (!found && head.length >= 4 && ascii(head, 0, 4) === "OggS") {
    found = { kind: "audio", mime: "audio/ogg", label: "OGG Audio" };
  }

  // ZIP-based Office/EPUB formats share the PK header, so the extension is the
  // only way to tell a .docx from a .xlsx without unzipping. Extension wins here.
  if (!found && head.length >= 2 && head[0] === 0x50 && head[1] === 0x4b) {
    const ext = extensionOf(file.name);
    found = EXT_MAP[ext] ?? { kind: "document", mime: "application/zip", label: "Archive" };
  }

  if (!found) {
    for (const sig of SIGNATURES) {
      if (matches(head, sig)) {
        found = { kind: sig.kind, mime: sig.mime, label: sig.label };
        break;
      }
    }
  }

  const ext = extensionOf(file.name);
  const byExt = EXT_MAP[ext];

  if (!found) {
    // Nothing recognisable in the bytes. Text-ish formats have no magic number
    // at all, so the extension is legitimately the best evidence available.
    found = byExt ?? { kind: "unknown", mime: file.type || "application/octet-stream", label: ext ? `${ext.toUpperCase()} File` : "Unknown File" };
    return { ...found, extensionMismatch: false };
  }

  return {
    ...found,
    extensionMismatch: Boolean(byExt && byExt.kind !== found.kind),
  };
}

/** Lower-case extension without the dot, or "" when there isn't one. */
export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Replace a filename's extension, preserving the rest of the name. */
export function withExtension(name: string, ext: string): string {
  const i = name.lastIndexOf(".");
  const base = i > 0 ? name.slice(0, i) : name;
  return `${base}.${ext}`;
}
