/**
 * GigAI Tools: document-tools engine barrel.
 *
 * Client-side document classification, tabular (CSV/Excel) I/O, and text /
 * markdown helpers shared by the document UI components under
 * `components/tool/document/*`. Heavy parsers (papaparse, SheetJS, marked) are
 * dynamic-imported inside their functions, so importing this barrel is cheap.
 */

export {
  type DocumentKind,
  KIND_LABELS,
  KIND_ICONS,
  TABULAR_KINDS,
  TEXTUAL_KINDS,
  fileExtension,
  detectKind,
  detectFileKind,
  acceptForKinds,
} from "./kind";

export {
  type TableData,
  type SheetTable,
  emptyTable,
  normalizeTable,
  matrixToTable,
  tableToMatrix,
  parseCsv,
  toCsv,
  toCsvBlob,
  parseWorkbook,
  toXlsxBlob,
} from "./tabular";

export {
  type TextStats,
  readText,
  markdownToHtml,
  escapeHtml,
  sanitizeHtml,
  prettyJson,
  textStats,
} from "./text";
