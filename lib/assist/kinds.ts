/**
 * GigAI Smart Assist: file KIND detection & routing.
 *
 * Pure data + tiny helpers that map a File (by MIME, then extension) to a
 * {@link FileFamily}, the workspace {@link AssetKind} that can process it (when
 * one exists), and the existing workspace route to hand off to. NO registry,
 * NO React, NO engines. Safe to import anywhere and stays out of heavy bundles.
 *
 * Extensibility (STEP 12): adding support for a new family is a one-line entry
 * here plus (optionally) an operation in `lib/assist/operations`. Nothing else
 * changes. The planner and UI are data-driven off these maps.
 */

import type { AssetKind, FileFamily } from "@/lib/assist/types";

/** Extension → family. Lower-case, no leading dot. Longest/most-specific wins. */
const EXT_FAMILY: Record<string, FileFamily> = {
  // images
  png: "image", jpg: "image", jpeg: "image", webp: "image", gif: "image",
  bmp: "image", ico: "image", avif: "image", heic: "image", heif: "image",
  tiff: "image", tif: "image",
  svg: "svg",
  // documents
  pdf: "pdf",
  doc: "document", docx: "document", rtf: "document", odt: "document",
  txt: "text", md: "text", markdown: "text",
  // spreadsheets / presentations
  csv: "data", tsv: "data",
  xls: "spreadsheet", xlsx: "spreadsheet", ods: "spreadsheet",
  ppt: "presentation", pptx: "presentation", odp: "presentation",
  // data / code
  json: "data", xml: "data", yaml: "data", yml: "data", toml: "data",
  html: "code", htm: "code", css: "code", js: "code", mjs: "code", ts: "code",
  jsx: "code", tsx: "code", sql: "code",
  // audio / video
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", m4a: "audio",
  aac: "audio", opus: "audio", wma: "audio", aiff: "audio",
  mp4: "video", webm: "video", mov: "video", mkv: "video", avi: "video",
  m4v: "video", flv: "video",
  // archives / fonts
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive",
  ttf: "font", otf: "font", woff: "font", woff2: "font",
};

/** MIME prefix → family (checked before extension for reliability). */
function familyFromMime(mime: string): FileFamily | undefined {
  if (!mime) return undefined;
  if (mime === "image/svg+xml") return "svg";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  // Office documents, MUST come before the generic xml/zip catch-alls below,
  // because OpenXML MIME types literally contain "openxmlformats"/"xml" and are
  // ZIP-based (e.g. .docx = application/vnd.openxmlformats-officedocument.
  // wordprocessingml.document). Matching "xml" first mislabels them as data.
  if (mime.includes("wordprocessingml") || mime === "application/msword" || mime.includes("opendocument.text")) return "document";
  if (mime.includes("spreadsheetml") || mime === "application/vnd.ms-excel" || mime.includes("opendocument.spreadsheet")) return "spreadsheet";
  if (mime.includes("presentationml") || mime === "application/vnd.ms-powerpoint" || mime.includes("opendocument.presentation")) return "presentation";
  if (mime === "application/rtf" || mime === "text/rtf") return "document";
  if (mime === "application/json") return "data";
  if (mime === "text/csv") return "data";
  if (mime === "text/html") return "code";
  if (mime === "text/css") return "code";
  if (mime.includes("javascript")) return "code";
  // Narrow XML: only genuine XML types (application/xml, text/xml, *+xml). NOT
  // the office "openxmlformats" vnd types handled above.
  if (mime === "application/xml" || mime === "text/xml" || mime.endsWith("+xml")) return "data";
  if (mime === "application/zip" || mime.endsWith("+zip") || mime.includes("compressed")) return "archive";
  if (mime.startsWith("text/")) return "text";
  return undefined;
}

/**
 * Families that a client-side workspace engine can PROCESS inline, and the
 * `AssetKind` used by those engines. Only image + pdf have inline operations in
 * this beta; every other family is analysed + routed to its existing tool.
 */
const INLINE_ASSET_KIND: Partial<Record<FileFamily, AssetKind>> = {
  image: "image",
  pdf: "pdf",
  // .docx → PDF runs inline (mammoth + jsPDF); the planner gates which document
  // goals are actually inline-capable (others still route to their tool).
  document: "document",
};

/** The existing workspace route slug that best fits a family (for hand-off). */
const FAMILY_WORKSPACE: Partial<Record<FileFamily, string>> = {
  image: "image",
  svg: "svg",
  pdf: "pdf",
  document: "document",
  spreadsheet: "document",
  presentation: "document",
  audio: "audio",
  video: "video",
  data: "developer",
  code: "developer",
  text: "document",
};

/** Lower-case extension (no dot) from a filename, or "". */
export function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Resolve the {@link FileFamily} for a file, MIME first, then extension. */
export function familyOf(file: File): FileFamily {
  return familyFromMime(file.type) ?? EXT_FAMILY[extOf(file.name)] ?? "unknown";
}

/** The workspace `AssetKind` for a family, when one can process it inline. */
export function assetKindFor(family: FileFamily): AssetKind | undefined {
  return INLINE_ASSET_KIND[family];
}

/** The existing `/<slug>-workspace` route for a family, or the general one. */
export function workspaceSlugFor(family: FileFamily): string | undefined {
  return FAMILY_WORKSPACE[family];
}

/** Families we can decode as UTF-8 text for a light structural analysis. */
export function isTextual(family: FileFamily): boolean {
  return family === "text" || family === "data" || family === "code" || family === "svg";
}

/** A short, human label for a family (used in copy). */
export const FAMILY_LABEL: Record<FileFamily, string> = {
  image: "image",
  pdf: "PDF",
  svg: "SVG",
  audio: "audio",
  video: "video",
  document: "document",
  spreadsheet: "spreadsheet",
  presentation: "presentation",
  archive: "archive",
  data: "data file",
  code: "code file",
  text: "text file",
  font: "font",
  unknown: "file",
};

/** A representative lucide icon per family, for the analysis header. */
export const FAMILY_ICON: Record<FileFamily, string> = {
  image: "Image",
  pdf: "FileText",
  svg: "PenTool",
  audio: "Music",
  video: "Video",
  document: "FileText",
  spreadsheet: "Sheet",
  presentation: "Presentation",
  archive: "FileArchive",
  data: "Braces",
  code: "Code",
  text: "FileText",
  font: "Type",
  unknown: "File",
};
