/**
 * GigAI Tools, document kind detection.
 *
 * A tiny, framework-agnostic classifier that maps a File (or a bare filename +
 * MIME type) onto one of the document families the toolkit understands. Runs
 * fully client-side; it never reads file bytes, only the name and reported type,
 * so it's cheap and synchronous. The document UI components (dropzone, preview,
 * convert shell) branch on this to pick a renderer.
 */

/** The families of document the toolkit can preview / convert. */
export type DocumentKind =
  | "pdf"
  | "csv"
  | "xlsx"
  | "txt"
  | "md"
  | "html"
  | "json"
  | "epub"
  | "docx"
  | "image"
  | "unknown";

/** Human labels for each kind: used in dropzone hints and preview headers. */
export const KIND_LABELS: Record<DocumentKind, string> = {
  pdf: "PDF document",
  csv: "CSV spreadsheet",
  xlsx: "Excel workbook",
  txt: "Plain text",
  md: "Markdown",
  html: "HTML document",
  json: "JSON data",
  epub: "EPUB e-book",
  docx: "Word document",
  image: "Image",
  unknown: "File",
};

/** A representative lucide icon for each kind. */
export const KIND_ICONS: Record<DocumentKind, string> = {
  pdf: "FileText",
  csv: "Table",
  xlsx: "Sheet",
  txt: "FileText",
  md: "FileCode",
  html: "FileCode2",
  json: "Braces",
  epub: "BookOpen",
  docx: "FileType",
  image: "Image",
  unknown: "File",
};

/** Kinds whose content is a grid/table (rendered via DataGrid). */
export const TABULAR_KINDS: ReadonlySet<DocumentKind> = new Set<DocumentKind>([
  "csv",
  "xlsx",
]);

/** Kinds whose content is plain-ish text (rendered as formatted text). */
export const TEXTUAL_KINDS: ReadonlySet<DocumentKind> = new Set<DocumentKind>([
  "txt",
  "md",
  "html",
  "json",
]);

const EXT_MAP: Record<string, DocumentKind> = {
  pdf: "pdf",
  csv: "csv",
  tsv: "csv",
  xlsx: "xlsx",
  xls: "xlsx",
  xlsm: "xlsx",
  txt: "txt",
  text: "txt",
  log: "txt",
  md: "md",
  markdown: "md",
  mdx: "md",
  html: "html",
  htm: "html",
  json: "json",
  epub: "epub",
  docx: "docx",
  doc: "docx",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  bmp: "image",
  svg: "image",
  avif: "image",
};

const MIME_MAP: Array<[RegExp, DocumentKind]> = [
  [/^application\/pdf$/, "pdf"],
  [/csv/, "csv"],
  [/spreadsheetml|ms-excel|excel/, "xlsx"],
  [/markdown/, "md"],
  [/html/, "html"],
  [/json/, "json"],
  [/epub/, "epub"],
  [/wordprocessingml|msword/, "docx"],
  [/^image\//, "image"],
  [/^text\/plain$/, "txt"],
];

/** Extract a lowercase extension (no dot) from a filename, or "". */
export function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0 || dot === filename.length - 1) return "";
  return filename.slice(dot + 1).toLowerCase();
}

/**
 * Classify by filename + optional MIME type. Extension wins (it's the most
 * reliable signal in practice); MIME is the fallback for extension-less names.
 */
export function detectKind(filename: string, mime = ""): DocumentKind {
  const ext = fileExtension(filename);
  const byExt = EXT_MAP[ext];
  if (byExt) return byExt;

  const type = mime.toLowerCase();
  for (const [re, kind] of MIME_MAP) {
    if (re.test(type)) return kind;
  }
  return "unknown";
}

/** Convenience: classify a File directly. */
export function detectFileKind(file: File): DocumentKind {
  return detectKind(file.name, file.type);
}

/**
 * Build an `accept` attribute string from a list of kinds, expanding each into
 * its common extensions + MIME types. Handy for wiring dropzones from a config.
 */
export function acceptForKinds(kinds: readonly DocumentKind[]): string {
  const tokens = new Set<string>();
  const add = (...t: string[]) => t.forEach((x) => tokens.add(x));
  for (const kind of kinds) {
    switch (kind) {
      case "pdf":
        add(".pdf", "application/pdf");
        break;
      case "csv":
        add(".csv", ".tsv", "text/csv");
        break;
      case "xlsx":
        add(
          ".xlsx",
          ".xls",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        );
        break;
      case "txt":
        add(".txt", ".text", ".log", "text/plain");
        break;
      case "md":
        add(".md", ".markdown", ".mdx", "text/markdown");
        break;
      case "html":
        add(".html", ".htm", "text/html");
        break;
      case "json":
        add(".json", "application/json");
        break;
      case "epub":
        add(".epub", "application/epub+zip");
        break;
      case "docx":
        add(
          ".docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        break;
      case "image":
        add(".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", "image/*");
        break;
      case "unknown":
        break;
    }
  }
  return Array.from(tokens).join(",");
}
