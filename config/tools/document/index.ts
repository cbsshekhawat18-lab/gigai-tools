import type { Tool } from "@/types";

/**
 * Live Document Tools (the Document Studio, Phase 7).
 *
 * The single import barrel for the `document-tools` category. Drop a tool file
 * under `config/tools/document/` and add its default export here; the platform
 * generates routes, metadata, JSON-LD, cards and search entries from it, and
 * `lib/document-tools/illustrations` supplies its branded artwork automatically
 * (seeded by the tool's `group`, falling back to its slug).
 */
import csvViewer from "./csv-viewer";
import csvEditor from "./csv-editor";
import csvToJson from "./csv-to-json";
import jsonToCsv from "./json-to-csv";
import csvToExcel from "./csv-to-excel";
import excelToCsv from "./excel-to-csv";
import epubViewer from "./epub-viewer";
import rtfViewer from "./rtf-viewer";
import documentViewer from "./document-viewer";

export const DOCUMENT_TOOLS: Tool[] = [
  csvViewer,
  csvEditor,
  csvToJson,
  jsonToCsv,
  csvToExcel,
  excelToCsv,
  epubViewer,
  rtfViewer,
  documentViewer,
];
