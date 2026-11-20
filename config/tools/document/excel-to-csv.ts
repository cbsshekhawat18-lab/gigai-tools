import type { Tool } from "@/types";

/**
 * Excel to CSV, the workbook-to-CSV converter of the "Spreadsheets & CSV"
 * group. Drop an .xlsx or .xls, pick any sheet from the workbook, and get a
 * clean, RFC-4180 CSV live in the browser: SheetJS reads every sheet
 * (`readWorkbook`) and SheetJS's own `sheet_to_csv` produces the output
 * (`excelToCsv`), so quoting, commas-inside-cells and multi-sheet files are all
 * handled correctly. Every string below targets the real queries people type
 * when they need to flatten one tab of a spreadsheet into a CSV for an import,
 * a database or a script. Nothing is shared with the CSV-editor or
 * CSV-to-JSON copy, and no claim outruns what the client-side engine does.
 */
const excelToCsv: Tool = {
  slug: "excel-to-csv",
  title: "Excel to CSV",
  description:
    "Convert Excel to CSV in your browser. Drop an.xlsx or.xls, pick the sheet you want and download a clean, correctly-quoted CSV. Multi-sheet workbooks, commas inside cells and quoted fields are all handled. Nothing is uploaded.",
  category: "document-tools",
  group: "Spreadsheets & CSV",
  icon: "FileDown",
  accent: "emerald",
  status: "live",
  featured: false,
  createdAt: "2026-06-14",

  h1: "Excel to CSV Converter, Convert XLSX & XLS to CSV Online",
  tagline:
    "Drop an Excel workbook, choose which sheet to export, and get a clean, properly-escaped CSV live in your browser. Multi-tab.xlsx and legacy.xls files, quoted fields and commas inside cells are all handled, and nothing is ever uploaded.",
  longDescription:
    "The GigAI Excel to CSV converter turns a spreadsheet into a plain CSV file without a server round-trip or a copy-paste-into-Notepad dance. Drop an.xlsx or a legacy.xls, and the tool reads the entire workbook with SheetJS, the same engine spreadsheet apps rely on to parse the OOXML and BIFF formats. A sheet picker lists every tab in the workbook so you can convert exactly the one you need: the finance tab, not the pivot cache. The raw data, not the summary. The chosen sheet renders live in an editable-preview grid so you can confirm the shape, headers and row count before you commit, and the raw CSV text is shown alongside it. Under the hood the CSV is produced by SheetJS's own sheet-to-CSV writer, which follows RFC 4180: values containing commas, quotes or line breaks are wrapped and escaped correctly, so the output opens cleanly in another spreadsheet, imports into Postgres or MySQL without mangled columns, and parses in any language's CSV library. Displayed values are exported as text: dates and percentages keep the text you see in the cell rather than turning into raw serial numbers. Copy the CSV to your clipboard, download it as a.csv file named after the sheet, or export every sheet at once. Each tab is saved as its own CSV file when a workbook needs to become a set of tables. Because it all runs client-side, financial models, HR spreadsheets and customer lists never leave your machine, close the tab and every trace is gone. Note the honest boundary: CSV is a flat, single-table text format, so formulas are exported as their last-calculated value, and charts, images, merged-cell layouts, colors and multiple sheets-in-one-file cannot be represented, one sheet becomes one CSV.",

  ctaText: "Convert to CSV",

  keywords: [
    "excel to csv",
    "xlsx to csv",
    "xls to csv",
    "convert excel to csv",
    "excel to csv converter",
    "excel to csv online",
    "spreadsheet to csv",
    "xlsx to csv converter",
    "export excel sheet to csv",
    "workbook to csv",
    "excel worksheet to csv",
    "convert xlsx to csv online free",
  ],

  seo: {
    title: "Excel to CSV Converter, Convert XLSX / XLS to CSV Online | GigAI Tools",
    description:
      "Free online Excel to CSV converter. Drop an.xlsx or.xls, pick a sheet and download a clean, RFC-4180 CSV. Multi-sheet workbooks, quoted fields and commas inside cells all handled: 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Layers",
      title: "Pick any sheet in the workbook",
      description:
        "A workbook can hold many tabs. The sheet picker lists every one so you export exactly the sheet you need (the raw data, not the summary) with the row count updating live as you switch.",
    },
    {
      icon: "Quote",
      title: "Correct RFC-4180 quoting",
      description:
        "SheetJS's own CSV writer wraps and escapes any value with commas, quotes or line breaks, so the output imports into another spreadsheet or a database without a single mangled column.",
    },
    {
      icon: "Eye",
      title: "Live preview before you download",
      description:
        "The selected sheet renders in a grid and the raw CSV shows alongside it, so you confirm the headers, shape and row count on screen before you commit to a file.",
    },
    {
      icon: "CopyPlus",
      title: "Export one sheet or the whole book",
      description:
        "Download the chosen sheet as a single.csv, or export every tab at once. Each sheet is saved as its own CSV file when a workbook needs to become a set of tables.",
    },
    {
      icon: "FileSpreadsheet",
      title: "Modern .xlsx and legacy .xls",
      description:
        "Both the current OOXML.xlsx and the older BIFF.xls formats are parsed by SheetJS (the same library spreadsheet apps trust) so old exports convert as reliably as new ones.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing and conversion run on your device. Financial models, HR spreadsheets and customer lists are never uploaded, stored or logged, close the tab and every trace is gone.",
    },
  ],

  benefits: [
    {
      title: "Feed data into any import",
      description:
        "Databases, BI tools, CRMs and bulk-upload forms almost always want CSV, not .xlsx. Convert the one sheet that matters and hand off a file the importer accepts on the first try.",
    },
    {
      title: "No mangled columns",
      description:
        "Because escaping follows RFC 4180, a cell like \"Smith, Jane\" or a value with a line break stays in one column instead of silently splitting your rows, the classic broken-CSV failure.",
    },
    {
      title: "Convert the right tab, not the whole file",
      description:
        "CSV can only hold one table. Instead of exporting a mess, you choose the exact sheet, preview it, and get a clean single-table CSV named after that tab.",
    },
    {
      title: "No install, no upload",
      description:
        "Get a spreadsheet-grade CSV export without opening Excel, wiring up a script, or pasting confidential data into a third-party server. It all runs locally in the tab.",
    },
  ],

  howTo: [
    {
      title: "Add your workbook",
      description:
        "Drop an .xlsx or .xls file onto the workspace, or click to browse. The whole workbook is read locally and every sheet is detected.",
    },
    {
      title: "Choose the sheet",
      description:
        "Pick the tab you want from the sheet menu. The grid and the raw CSV both re-render live so you can confirm the headers and row count.",
    },
    {
      title: "Preview and verify",
      description:
        "Scan the preview grid to make sure the right columns and rows came through, and check the row/column badges before you export.",
    },
    {
      title: "Copy, download, or export all",
      description:
        "Copy the CSV to your clipboard, download it as a .csv named after the sheet, or export every sheet at once as separate CSV files.",
    },
  ],

  formats: {
    input: ["XLSX", "XLS"],
    output: ["CSV"],
  },

  useCases: [
    {
      audience: "Data engineer",
      title: "Prep a file for a bulk load",
      description:
        "Flatten the one sheet a stakeholder sent into a clean, correctly-escaped CSV that COPY / LOAD DATA ingests without column-shift errors.",
    },
    {
      audience: "Ops & admin",
      title: "Upload to a CRM or tool",
      description:
        "Most bulk-import forms only accept CSV. Convert the contacts tab of a workbook to CSV so it uploads to your CRM, email platform or help desk in one go.",
    },
    {
      audience: "Analyst",
      title: "Split a workbook into tables",
      description:
        "Turn a multi-tab report into a set of individual CSVs with the export-all option, so each table loads independently into a notebook or pipeline.",
    },
    {
      audience: "Developer",
      title: "Make a test fixture",
      description:
        "Convert a sample-data sheet into a CSV you can commit as a fixture or feed to a seed script, without adding an Excel parser to your project.",
    },
  ],

  troubleshooting: [
    {
      problem: "Only one sheet was exported, but my workbook has several tabs.",
      solution:
        "CSV is a single-table format, so one sheet becomes one CSV. Use the sheet picker to convert each tab, or use 'Export all sheets' to download every tab at once as separate CSV files.",
    },
    {
      problem: "My formulas came through as numbers instead of the formula text.",
      solution:
        "That is expected. CSV cannot store formulas, so each cell is exported as its last-calculated value, the same value you saw in the sheet. Re-open the source.xlsx if you need the formulas themselves.",
    },
    {
      problem: "Dates or percentages look different from the spreadsheet.",
      solution:
        "Cells are exported as their displayed text, so most formatting is preserved. If a value differs, it is usually because the cell's number format changes how it's shown. Set the format in Excel before exporting to control the exact text.",
    },
    {
      problem: "A file won't open or the sheet is empty.",
      solution:
        "Confirm the file is a genuine.xlsx or.xls (not a renamed CSV or a password-protected workbook). Encrypted or corrupt workbooks can't be read in the browser: remove the password in Excel and try again.",
    },
  ],

  tips: [
    "Rename the tab you care about in Excel first: the downloaded CSV is named after the sheet, so a clear tab name gives a clear filename.",
    "Use 'Export all sheets' to save every tab of a multi-tab workbook as its own CSV in one click, instead of switching sheets and downloading one at a time.",
    "Preview the grid before downloading. If the first row isn't your header, it usually means the sheet has title rows above the table, delete them in Excel for a clean CSV.",
    "For a truly text-safe export (IDs, ZIP codes, phone numbers), keep those columns formatted as Text in Excel so leading zeros survive the round-trip.",
    "Need the reverse? Use the sibling CSV to Excel tool to turn a CSV back into a real .xlsx workbook.",
  ],

  security:
    "Your workbook is read and converted entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert financial models, HR spreadsheets and customer lists. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my Excel file uploaded to a server?",
      answer:
        "No. The workbook is parsed and converted locally in your browser using the SheetJS engine. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential financial and HR spreadsheets.",
    },
    {
      question: "Can it convert a workbook with multiple sheets?",
      answer:
        "Yes. Every tab in the workbook is detected and listed in the sheet picker, so you convert exactly the one you want. CSV holds a single table, so each sheet becomes its own CSV. Use 'Export all sheets' to download every tab at once as separate CSV files.",
    },
    {
      question: "Does it support the old .xls format as well as .xlsx?",
      answer:
        "Yes. Both the modern OOXML .xlsx and the legacy BIFF .xls formats are parsed by SheetJS, so old exports and new files convert with the same reliability.",
    },
    {
      question: "Will commas and quotes inside my cells break the CSV?",
      answer:
        "No. The output follows RFC 4180: any value containing a comma, a double-quote or a line break is wrapped in quotes and escaped correctly, so it stays in one column and imports cleanly into another spreadsheet or a database.",
    },
    {
      question: "What happens to formulas, charts and formatting?",
      answer:
        "CSV is a flat, plain-text table, so it can't represent formulas, charts, images, colors or merged-cell layouts. Formulas are exported as their last-calculated value and everything visual is dropped, the CSV contains only the cell values from the one sheet you pick.",
    },
    {
      question: "Are my dates and numbers preserved correctly?",
      answer:
        "Cells are exported as their displayed text, so dates and percentages keep the text you see in the spreadsheet rather than turning into raw serial numbers. For identifiers with leading zeros, format the column as Text in Excel before exporting so nothing is lost.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There's a generous guard so the browser tab stays responsive. Typical workbooks of thousands of rows are well within it. For a very large workbook, convert one sheet at a time rather than exporting everything at once.",
    },
    {
      question: "How do I convert a CSV back into Excel?",
      answer:
        "Use the sibling CSV to Excel tool. It takes a CSV and writes a real .xlsx workbook, with the same client-side, nothing-uploaded guarantee.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release: client-side Excel to CSV with full multi-sheet detection, a sheet picker, a live preview grid, RFC-4180 quoting via SheetJS, copy and download, and support for both.xlsx and legacy.xls.",
    },
    {
      date: "2026-06-20",
      change:
        "Added 'Export all sheets' to download every tab at once as individual CSV files, and named single-sheet downloads after the source tab.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved the preview grid for wide sheets, added row/column/size badges, and clarified the honest limits around formulas, charts and formatting.",
    },
  ],

  relatedTools: ["csv-to-excel", "csv-editor", "csv-to-json", "excel-to-pdf"],
};

export default excelToCsv;
