import type { Tool } from "@/types";

/**
 * PDF to Excel, the "Convert from PDF" table-extraction tool of the GigAI
 * Document Studio.
 *
 * Drop a PDF and a positional heuristic (pdf.js text items clustered into rows
 * by baseline Y and into columns by start-X) reconstructs the table into a live,
 * editable spreadsheet grid you can fix cell-by-cell before exporting a genuine
 * .xlsx workbook (or CSV). It REUSES the shared `pdfToExcelRows` engine and the
 * `DataGrid` / `toXlsxBlob` document plumbing. No bespoke parser, no upload.
 *
 * Because there is no table structure stored inside a normal PDF, extraction is
 * genuinely best-effort: clean, grid-aligned reports come out well, free-form or
 * scanned layouts do not. Every string below is written for the exact queries
 * people type when they need numbers out of a PDF and into a sheet, and every
 * claim is HONEST about the heuristic and its limits. Nothing is uploaded.
 */
const pdfToExcel: Tool = {
  slug: "pdf-to-excel",
  title: "PDF to Excel",
  description:
    "Extract tables from a PDF into an editable spreadsheet, fix any cells, then download a real Excel.xlsx (or CSV). Best-effort, position-based table detection. Works best on clean tabular PDFs. Nothing is uploaded.",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "FileSpreadsheet",
  accent: "emerald",
  status: "live",
  createdAt: "2026-06-16",

  h1: "PDF to Excel: Extract PDF Tables to a Spreadsheet Online",
  tagline:
    "Drop a PDF and its tables are reconstructed into a fast, editable spreadsheet grid, clean up any cell the heuristic guessed wrong, then export a genuine Excel.xlsx or a CSV. Position-based table detection that works best on simple, grid-like PDFs, and every byte stays in your browser.",
  longDescription:
    "The GigAI PDF to Excel converter pulls the numbers out of a PDF and drops them into a real, editable spreadsheet you can fix and export: all in your browser, with nothing uploaded. Here's the honest reality most tools gloss over: a normal PDF stores positioned glyphs on a page, not a table with rows and columns, so there is no structure to simply \"read out.\" This tool reconstructs it. It reads every text item with pdf.js, clusters items that share a baseline into rows, then infers column boundaries from where text consistently starts across the page: a positional heuristic that turns a grid-like PDF back into a grid. The result opens in a windowed spreadsheet where every cell is directly editable, so you can nudge a value that landed in the wrong column, merge a header that split in two, or delete a stray page number before you export. When it looks right, download a genuine.xlsx workbook written with SheetJS (a real Excel file that opens without the text-import wizard) or export a clean, correctly-escaped CSV, or copy the whole table to your clipboard to paste into Sheets. Live stat badges show the row, column and cell counts so you always know the shape of what came out. This works best on exactly what it sounds like: invoices, bank and brokerage statements, price lists, financial tables and reports where the columns are visually aligned. It is deliberately not magic, dense multi-column layouts, merged cells, and especially scanned or image-only PDFs (which contain no selectable text at all) won't extract cleanly, and the editable grid is there precisely so you can correct the rough edges instead of trusting a black box. Because pdf.js parses the file and SheetJS writes the workbook entirely on your device, confidential statements, invoices and financials never leave your machine. Close the tab and every trace is gone.",

  ctaText: "Extract to Excel",

  keywords: [
    "pdf to excel",
    "pdf to xlsx",
    "convert pdf to excel",
    "pdf to excel converter",
    "extract table from pdf",
    "pdf table to excel",
    "pdf to spreadsheet",
    "pdf to csv",
    "pdf to excel online",
    "pdf to excel free",
    "convert pdf table to excel",
    "pdf data to excel",
  ],

  seo: {
    title: "PDF to Excel, Extract PDF Tables to XLSX Online Free | GigAI Tools",
    description:
      "Free online PDF to Excel converter. Extract tables from a PDF into an editable spreadsheet, fix cells, then export a real.xlsx or CSV. Best-effort position-based detection, best on clean tabular PDFs. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "TableProperties",
      title: "Position-based table detection",
      description:
        "pdf.js reads every text item and a heuristic clusters them into rows by baseline and into columns by where text starts, reconstructing a grid from a PDF that stores no table structure of its own.",
    },
    {
      icon: "ListChecks",
      title: "One row per record",
      description:
        "PDFs that repeat the same labelled box - voter rolls, member directories, beneficiary lists - are detected automatically, and you can extract one spreadsheet row per record (serial, ID, and every labelled field as its own column) instead of a copy of the printed layout.",
    },
    {
      icon: "Table2",
      title: "Editable results grid",
      description:
        "The extracted table opens in a windowed spreadsheet where every cell is directly editable, so you can fix a value that landed in the wrong column or delete a stray header before exporting, you're never stuck with a bad guess.",
    },
    {
      icon: "FileSpreadsheet",
      title: "Real Excel .xlsx export",
      description:
        "Download a genuine.xlsx workbook written with SheetJS (a true Excel file that opens without the text-import wizard) or export a clean, correctly-escaped CSV, or copy the table to your clipboard.",
    },
    {
      icon: "Layers",
      title: "Multi-page extraction",
      description:
        "Every page of the PDF is scanned and its rows are stitched into one continuous sheet, so a multi-page statement or report comes out as a single table you can review end to end.",
    },
    {
      icon: "Gauge",
      title: "Handles large tables smoothly",
      description:
        "The results grid virtualises rows, so a long statement with thousands of lines stays responsive to scroll and edit where a naive HTML table would freeze the tab.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "The PDF is parsed and the workbook is written in your browser - invoices, bank statements and financial PDFs are not uploaded, stored or logged. The one exception is the optional Fix-text OCR step (30+ languages), which says so before it runs.",
    },
  ],

  benefits: [
    {
      title: "Numbers out of a PDF without retyping",
      description:
        "Recover the values from an invoice, statement or price list into an editable sheet in seconds, instead of transcribing rows by hand or wrestling with copy-paste that collapses every column.",
    },
    {
      title: "You correct the rough edges, not a black box",
      description:
        "Extraction is a heuristic, so the grid is fully editable on purpose: fix a mis-split column or a merged header in place and export a table you actually trust, rather than hoping an opaque converter got it right.",
    },
    {
      title: "A real Excel file, not a renamed CSV",
      description:
        "The.xlsx export is a genuine SheetJS workbook that opens straight into Excel, Numbers or Google Sheets. No text-import wizard, no mangled columns on open.",
    },
    {
      title: "Confidential financials stay on your machine",
      description:
        "Bank statements, brokerage exports and internal invoices are parsed and converted entirely on your device. Nothing is uploaded, stored or logged, close the tab and it's gone.",
    },
  ],

  howTo: [
    {
      title: "Drop your PDF",
      description:
        "Drag a PDF onto the workspace or browse to select one. It's read directly in your browser. Nothing is uploaded. Works best on PDFs with real, visually-aligned tables.",
    },
    {
      title: "Review the extracted grid",
      description:
        "The heuristic reconstructs rows and columns and opens them in an editable spreadsheet. Skim the result against the original and fix any cell that landed in the wrong place.",
    },
    {
      title: "Clean up the cells",
      description:
        "Edit values directly, delete stray rows like page numbers or repeated headers, and rename the header cells so the columns read the way you want.",
    },
    {
      title: "Export or copy",
      description:
        "Download a real Excel .xlsx or a CSV, or copy the whole table to your clipboard to paste into a sheet. Reset clears everything to try another PDF.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["XLSX", "CSV"],
  },

  useCases: [
    {
      audience: "Accountant / Bookkeeper",
      title: "Invoices & statements into a sheet",
      description:
        "Pull line items and totals from a supplier invoice or bank statement into an editable grid, tidy the columns, and export an .xlsx to reconcile or import into your accounting system.",
    },
    {
      audience: "Finance analyst",
      title: "Rescue tables from a report PDF",
      description:
        "Recover a financial table from a quarterly report or fact sheet into a spreadsheet you can model on, instead of retyping figures or losing the column structure to copy-paste.",
    },
    {
      audience: "Operations / Procurement",
      title: "Convert a price list to Excel",
      description:
        "Turn a vendor's PDF price list or catalogue table into an editable sheet, fix any mis-aligned rows, and export a CSV or .xlsx ready to load into your own systems.",
    },
    {
      audience: "Researcher / Analyst",
      title: "Extract data tables for analysis",
      description:
        "Get a data table out of a published PDF into a spreadsheet, clean up the extracted cells, and export CSV to drop straight into a notebook or dashboard.",
    },
  ],

  troubleshooting: [
    {
      problem: "My columns are shifted, merged or split in the wrong places.",
      solution:
        "The column boundaries are inferred from where text starts on the page, so tightly-packed or variably-indented columns can misalign. The grid is fully editable for exactly this: drag values into place, retype a cell, or split a merged header, then export. This is best-effort table detection, not a layout engine.",
    },
    {
      problem: "My PDF came out empty or as a single wide column.",
      solution:
        "That usually means the PDF is scanned or image-only (no selectable text to read) or the layout is free-form prose rather than a grid. This tool needs real text and visually-aligned columns. A scanned document would first need OCR, which this in-browser tool does not perform.",
    },
    {
      problem: "Page numbers, footers or repeated headers appear as extra rows.",
      solution:
        "Non-table text on the page can be captured as stray rows. Just select and delete those rows in the grid before exporting. The header row is treated as the first row, so remove any duplicate headers that repeated across pages, too.",
    },
    {
      problem: "The PDF is password-protected and won't open.",
      solution:
        "Encrypted PDFs can't be read until they're unlocked. Remove the password first with the Unlock PDF tool, then run the resulting file through this converter.",
    },
  ],

  tips: [
    "Best results come from PDFs with clean, visually-aligned tables (invoices, statements and price lists) not dense multi-column prose.",
    "Always skim the extracted grid against the original PDF and fix cells before exporting. The editable grid exists precisely so you can correct the heuristic.",
    "Delete stray rows like page numbers, footers and repeated headers before you export so your sheet is clean.",
    "Export to.xlsx (not a renamed CSV) when handing the file to someone on Excel. It opens without the text-import wizard and keeps every value as text.",
    "Scanned or image-only PDFs have no text to extract. If the result is blank, the document likely needs OCR first, which this tool doesn't do.",
  ],

  security:
    "By default your PDF is parsed and the spreadsheet is generated entirely in your browser using pdf.js and SheetJS - nothing is uploaded, stored or logged, so bank statements, invoices and confidential financial PDFs are safe to convert, and closing the tab removes every trace. One optional feature is the exception: if a PDF's broken font damages its text - Hindi, Tamil, Arabic, any of 30+ languages - you can choose a server OCR fix. That choice is stated on the button, the upload is processed and deleted immediately, and skipping it keeps everything local.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "Not for the standard extraction: the PDF is read with pdf.js and the workbook written with SheetJS, both in your browser, so there is nothing for us to store, log or see. The only exception is the optional Fix-text OCR repair for PDFs with broken font encodings (the language is auto-detected, with 30+ supported) - choosing it sends the PDF to our server, which processes it and deletes it immediately. The page tells you before that happens.",
    },
    {
      question: "How accurate is the table extraction?",
      answer:
        "It's best-effort, not perfect. Because a PDF stores positioned text rather than a real table, we reconstruct rows and columns from where text sits on the page. Clean, grid-aligned PDFs (invoices, statements, price lists) extract well. Dense multi-column or free-form layouts often need touch-up. That's exactly why the result opens in an editable grid, so you fix the rough edges before exporting.",
    },
    {
      question: "Can it convert a scanned PDF to Excel?",
      answer:
        "No. Scanned or image-only PDFs contain no selectable text to read, so there's nothing for the heuristic to extract and the result comes out empty. Those documents would first need OCR to turn the image into text, which this in-browser tool does not perform.",
    },
    {
      question: "Does it create a real Excel file?",
      answer:
        "Yes: the export is a genuine.xlsx workbook written with SheetJS, not a CSV with the extension changed. It opens directly in Excel, Numbers or Google Sheets without the text-import wizard, with your cells intact. You can also export a standard CSV.",
    },
    {
      question: "Can I fix the extracted data before downloading?",
      answer:
        "Yes, and you're encouraged to. The extracted table opens in a windowed, editable spreadsheet: edit any cell, rename headers, and delete stray rows like page numbers or repeated headers. Then export a clean .xlsx or CSV.",
    },
    {
      question: "Does it handle multi-page PDFs?",
      answer:
        "Yes. Every page is scanned and its rows are stitched into one continuous sheet, so a multi-page statement or report comes out as a single table. You may want to delete headers that repeat on each page after extraction.",
    },
    {
      question: "Why is my whole PDF in one column?",
      answer:
        "That happens when the layout is free-form prose rather than a visually-aligned grid, so there are no consistent column boundaries to detect, the text collapses into a single wide column. This tool is tuned for tabular PDFs. Unstructured documents won't split into columns.",
    },
    {
      question: "What about password-protected PDFs?",
      answer:
        "Encrypted PDFs must be unlocked before their text can be read. Use the Unlock PDF tool to remove the password first, then run the resulting file through this converter.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: best-effort PDF table extraction (pdf.js positional row/column heuristic) into an editable, windowed spreadsheet grid with export to real.xlsx, CSV and copy-to-clipboard.",
    },
    {
      date: "2026-06-23",
      change:
        "Added multi-page stitching into a single sheet, live row/column/cell stat badges, and clearer honesty notes about scanned PDFs and column touch-up.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved column-boundary detection on aligned tables, row-virtualisation tuning for long statements, and a sample-PDF walkthrough of the review-and-fix flow.",
    },
  ],

  relatedTools: [
    "excel-to-pdf",
    "pdf-to-text",
    "csv-editor",
    "unlock-pdf",
  ],
};

export default pdfToExcel;
