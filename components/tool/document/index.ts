/**
 * Document-tool shared UI. Client components built on the dev harness, the PDF
 * engine, and `lib/document-tools`. Compose these to build a CSV / Excel / text
 * / PDF / EPUB tool in a handful of lines.
 *
 *  DataGrid, editable, windowed spreadsheet grid over TableData
 *  DocumentDropzone: type-detecting drag/drop/paste file input
 *  DocumentPreview: universal read-only viewer (pdf/csv/xlsx/txt/md/html/json/epub/image)
 *  ConvertShell: input → convert → result frame for converter tools
 */

export { DataGrid, type DataGridProps } from "./data-grid";
export {
  DocumentDropzone,
  type DocumentDropzoneProps,
  type DetectedFile,
} from "./document-dropzone";
export {
  DocumentPreview,
  type DocumentPreviewProps,
} from "./document-preview";
export {
  ConvertShell,
  type ConvertShellProps,
  type ConvertResult,
} from "./convert-shell";
