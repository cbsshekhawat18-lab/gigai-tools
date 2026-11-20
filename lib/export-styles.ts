/**
 * Export-format identity system. Every export type (PDF, CSV, JSON, ZIP, PNG…)
 * gets its own recognizable identity, icon + color family, so download
 * actions read at a glance instead of every button looking identical.
 *
 * Like `lib/design.ts`, every class string here is STATIC so Tailwind's JIT can
 * see it. Never assemble these names dynamically. Resolve a style with
 * `exportStyleFor()`, which accepts an extension ("pdf"), a filename
 * ("report.pdf") or a MIME type ("application/pdf").
 */

export interface ExportStyle {
  /** Short uppercase tag shown in labels/chips, e.g. "PDF". */
  tag: string;
  /** Lucide icon name. */
  icon: string;
  /** Text/glyph color. */
  text: string;
  /** Soft tinted chip (icon backgrounds, badges, active toggles). */
  chip: string;
  /** Hairline border matching the family. */
  border: string;
  /** Filled identity button: bg + hover + readable foreground. */
  solid: string;
  /** Outlined identity button: border + text + tint hover. */
  outline: string;
}

type Family = Omit<ExportStyle, "tag" | "icon">;

const FAMILIES = {
  /* PDF: the classic document red. */
  red: {
    text: "text-red-600 dark:text-red-400",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    solid: "bg-red-600 text-white hover:bg-red-500",
    outline:
      "border-red-500/30 text-red-700 hover:bg-red-500/10 dark:text-red-400",
  },
  /* Word-family documents. */
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    solid: "bg-blue-600 text-white hover:bg-blue-500",
    outline:
      "border-blue-500/30 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400",
  },
  /* CSV, spreadsheet green (lighter than Excel's). */
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    solid: "bg-emerald-600 text-white hover:bg-emerald-500",
    outline:
      "border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400",
  },
  /* Excel-inspired deep green. */
  green: {
    text: "text-green-700 dark:text-green-400",
    chip: "bg-green-500/10 text-green-700 dark:text-green-400",
    border: "border-green-600/30",
    solid: "bg-green-700 text-white hover:bg-green-600",
    outline:
      "border-green-600/30 text-green-700 hover:bg-green-500/10 dark:text-green-400",
  },
  /* JSON / data. */
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    solid: "bg-amber-600 text-white hover:bg-amber-500",
    outline:
      "border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400",
  },
  /* XML / HTML markup. */
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    solid: "bg-orange-600 text-white hover:bg-orange-500",
    outline:
      "border-orange-500/30 text-orange-700 hover:bg-orange-500/10 dark:text-orange-400",
  },
  /* Archives. */
  violet: {
    text: "text-teal-600 dark:text-teal-400",
    chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    border: "border-teal-500/30",
    solid: "bg-teal-600 text-white hover:bg-teal-500",
    outline:
      "border-teal-500/30 text-teal-700 hover:bg-teal-500/10 dark:text-teal-400",
  },
  /* Raster images. */
  sky: {
    text: "text-sky-600 dark:text-sky-400",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    border: "border-sky-500/30",
    solid: "bg-sky-600 text-white hover:bg-sky-500",
    outline:
      "border-sky-500/30 text-sky-700 hover:bg-sky-500/10 dark:text-sky-400",
  },
  /* Vectors. */
  fuchsia: {
    text: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    solid: "bg-rose-600 text-white hover:bg-rose-500",
    outline:
      "border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-400",
  },
  /* Code / config text. */
  cyan: {
    text: "text-cyan-600 dark:text-cyan-400",
    chip: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/30",
    solid: "bg-cyan-600 text-white hover:bg-cyan-500",
    outline:
      "border-cyan-500/30 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-400",
  },
  /* Subtitles / captions. */
  teal: {
    text: "text-teal-600 dark:text-teal-400",
    chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    border: "border-teal-500/30",
    solid: "bg-teal-600 text-white hover:bg-teal-500",
    outline:
      "border-teal-500/30 text-teal-700 hover:bg-teal-500/10 dark:text-teal-400",
  },
  /* Video. */
  indigo: {
    text: "text-blue-600 dark:text-blue-400",
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    solid: "bg-blue-600 text-white hover:bg-blue-500",
    outline:
      "border-blue-500/30 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400",
  },
  /* Audio. */
  purple: {
    text: "text-cyan-600 dark:text-cyan-400",
    chip: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/30",
    solid: "bg-cyan-600 text-white hover:bg-cyan-500",
    outline:
      "border-cyan-500/30 text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-400",
  },
  /* Plain text, clipboard, unknown files. */
  slate: {
    text: "text-slate-600 dark:text-slate-400",
    chip: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    border: "border-slate-500/30",
    solid: "bg-slate-700 text-white hover:bg-slate-600",
    outline:
      "border-slate-500/30 text-slate-700 hover:bg-slate-500/10 dark:text-slate-400",
  },
} satisfies Record<string, Family>;

type FamilyKey = keyof typeof FAMILIES;

interface FormatDef {
  family: FamilyKey;
  icon: string;
  /** Overrides the uppercased key, e.g. "PNG · clear". */
  tag?: string;
}

const FORMATS: Record<string, FormatDef> = {
  // Documents
  pdf: { family: "red", icon: "FileText" },
  doc: { family: "blue", icon: "FileText" },
  docx: { family: "blue", icon: "FileText" },
  rtf: { family: "blue", icon: "FileText" },
  odt: { family: "blue", icon: "FileText" },
  epub: { family: "blue", icon: "BookOpen" },
  md: { family: "slate", icon: "FileText" },
  txt: { family: "slate", icon: "FileType" },

  // Data / spreadsheets
  csv: { family: "emerald", icon: "Table" },
  tsv: { family: "emerald", icon: "Table" },
  xls: { family: "green", icon: "FileSpreadsheet" },
  xlsx: { family: "green", icon: "FileSpreadsheet" },
  json: { family: "amber", icon: "Braces" },
  ndjson: { family: "amber", icon: "Braces" },

  // Markup / code
  xml: { family: "orange", icon: "Code" },
  html: { family: "orange", icon: "FileCode" },
  css: { family: "cyan", icon: "FileCode" },
  js: { family: "cyan", icon: "FileCode" },
  ts: { family: "cyan", icon: "FileCode" },
  sql: { family: "cyan", icon: "Database" },
  yaml: { family: "cyan", icon: "FileCode" },
  yml: { family: "cyan", icon: "FileCode" },
  toml: { family: "cyan", icon: "FileCode" },

  // Archives
  zip: { family: "violet", icon: "FileArchive" },
  gz: { family: "violet", icon: "FileArchive" },
  tar: { family: "violet", icon: "FileArchive" },
  "7z": { family: "violet", icon: "FileArchive" },
  rar: { family: "violet", icon: "FileArchive" },

  // Raster images
  png: { family: "sky", icon: "FileImage" },
  jpg: { family: "sky", icon: "FileImage" },
  jpeg: { family: "sky", icon: "FileImage", tag: "JPG" },
  webp: { family: "sky", icon: "FileImage" },
  gif: { family: "sky", icon: "FileImage" },
  bmp: { family: "sky", icon: "FileImage" },
  avif: { family: "sky", icon: "FileImage" },
  tiff: { family: "sky", icon: "FileImage" },
  heic: { family: "sky", icon: "FileImage" },
  ico: { family: "sky", icon: "FileImage" },

  // Vectors
  svg: { family: "fuchsia", icon: "PenTool" },
  eps: { family: "fuchsia", icon: "PenTool" },

  // Audio
  mp3: { family: "purple", icon: "FileAudio" },
  wav: { family: "purple", icon: "FileAudio" },
  ogg: { family: "purple", icon: "FileAudio" },
  m4a: { family: "purple", icon: "FileAudio" },
  aac: { family: "purple", icon: "FileAudio" },
  flac: { family: "purple", icon: "FileAudio" },

  // Video
  mp4: { family: "indigo", icon: "FileVideo" },
  webm: { family: "indigo", icon: "FileVideo" },
  mov: { family: "indigo", icon: "FileVideo" },
  avi: { family: "indigo", icon: "FileVideo" },
  mkv: { family: "indigo", icon: "FileVideo" },

  // Subtitles
  srt: { family: "teal", icon: "Captions" },
  vtt: { family: "teal", icon: "Captions" },

  // Pseudo-formats
  copy: { family: "slate", icon: "Clipboard", tag: "Copy" },
};

/** MIME subtypes whose name doesn't match our format keys. */
const MIME_ALIASES: Record<string, string> = {
  "svg+xml": "svg",
  plain: "txt",
  markdown: "md",
  msword: "doc",
  "vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "vnd.ms-excel": "xls",
  "vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "x-zip-compressed": "zip",
  "x-icon": "ico",
  "vnd.microsoft.icon": "ico",
  mpeg: "mp3",
  "x-wav": "wav",
  quicktime: "mov",
};

/**
 * Normalize any of: extension ("pdf", ".pdf"), filename ("a.b.pdf"), or MIME
 * ("application/pdf", "image/svg+xml") to a lower-case format key.
 */
function normalizeFormat(input: string): string {
  const value = input.trim().toLowerCase();
  if (value.includes("/")) {
    const [type, subtypeRaw] = value.split("/");
    const subtype = (subtypeRaw ?? "").split(";")[0]!;
    const aliased = MIME_ALIASES[subtype] ?? subtype;
    if (FORMATS[aliased]) return aliased;
    // Unknown subtype, fall back to a sensible family per top-level type.
    if (type === "image") return "png";
    if (type === "audio") return "mp3";
    if (type === "video") return "mp4";
    if (type === "text") return "txt";
    return aliased;
  }
  const noDots = value.startsWith(".") ? value.slice(1) : value;
  const lastSegment = noDots.includes(".")
    ? noDots.slice(noDots.lastIndexOf(".") + 1)
    : noDots;
  return lastSegment;
}

/**
 * Resolve the identity for an export. Unknown formats get a neutral slate
 * identity with the extension as the tag, so nothing ever renders unstyled.
 */
export function exportStyleFor(input?: string | null): ExportStyle {
  const key = input ? normalizeFormat(input) : "";
  const def = FORMATS[key];
  if (def) {
    return { tag: def.tag ?? key.toUpperCase(), icon: def.icon, ...FAMILIES[def.family] };
  }
  return {
    tag: key ? key.toUpperCase().slice(0, 5) : "FILE",
    icon: "Download",
    ...FAMILIES.slate,
  };
}
