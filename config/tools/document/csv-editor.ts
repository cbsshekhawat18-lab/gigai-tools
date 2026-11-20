import type { Tool } from "@/types";

/**
 * CSV Editor, the flagship of the GigAI "Spreadsheets & CSV" document group.
 *
 * A desktop-grade CSV editor that opens a comma-, tab- or semicolon-delimited
 * file (or a pasted block) into a real, windowed spreadsheet grid you can edit
 * cell-by-cell, add and delete rows and columns in, sort, and search: then
 * export straight back to CSV, JSON or a genuine .xlsx workbook. It is the
 * SheetJS + papaparse showcase: robust quoting-aware parsing on the way in,
 * clean re-encoding on the way out, and tens of thousands of rows kept smooth
 * by row virtualisation. Everything below is written for the exact queries
 * people type when a CSV won't open cleanly in Excel or they just need to fix a
 * few cells without launching a heavyweight app. No copy is shared with the
 * PDF, JSON or dev tools, and every claim matches what the in-browser engine
 * actually does. Nothing is uploaded.
 */
const csvEditor: Tool = {
  slug: "csv-editor",
  title: "CSV Editor",
  description:
    "Open, edit and clean CSV files in your browser as a real spreadsheet, fix cells, add or delete rows and columns, sort, find, and export to CSV, JSON or Excel. Nothing is uploaded.",
  category: "document-tools",
  group: "Spreadsheets & CSV",
  icon: "Table2",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-11",

  h1: "CSV Editor, Edit CSV Files Online as a Spreadsheet",
  tagline:
    "Drop or paste a CSV and it opens as a fast, editable spreadsheet grid, edit any cell, add or delete rows and columns, sort a column, search across everything, then export to CSV, JSON or a real Excel.xlsx. Robust quoting-aware parsing, tens of thousands of rows kept smooth, all in your browser and never uploaded.",
  longDescription:
    "The GigAI CSV Editor turns a raw comma-separated file into a proper, editable spreadsheet that runs entirely in your browser. CSVs look simple until they aren't: a stray comma inside a quoted field, a value that starts with a leading zero, a mix of tab and semicolon delimiters exported by a European locale, or a header row you need to rename. Drop a.csv or.tsv file, paste a block of rows straight from Excel or Google Sheets, or start from a blank grid, the editor parses it with papaparse's quoting-aware engine (auto-detecting the delimiter) and lays it out in a windowed grid where every cell is directly editable. Click a header to sort ascending or descending, add or delete rows and columns, rename headers, and type into any cell. The grid virtualises rows so a file with tens of thousands of lines stays responsive instead of freezing the tab. A live find box highlights and counts matches across the whole sheet so you can jump to the value you need. When you're done, export back to a clean, correctly-escaped CSV, to formatted JSON (array-of-objects keyed by your headers), or to a genuine.xlsx workbook written with SheetJS. Not a renamed CSV, but a real Excel file Excel opens without the text-import wizard. Live stat badges show the row and column counts and total cells so you always know the shape of your data. Because every byte is parsed, edited and re-encoded on your device, confidential exports (customer lists, financials, analytics dumps) never leave your machine. Close the tab and every trace is gone.",

  ctaText: "Open CSV Editor",

  keywords: [
    "csv editor",
    "edit csv online",
    "csv editor online",
    "open csv in browser",
    "edit csv file",
    "free csv editor",
    "csv spreadsheet editor",
    "fix csv file",
  ],

  seo: {
    title: "CSV Editor, Edit CSV Files Online as a Spreadsheet | GigAI Tools",
    description:
      "Free online CSV editor. Open a CSV as a real spreadsheet, edit cells, add or delete rows and columns, sort, search, then export to CSV, JSON or a real Excel.xlsx, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Table2",
      title: "A real editable grid",
      description:
        "Your CSV opens in a spreadsheet-style grid with a sticky header and directly-editable cells: click any cell and type, rename headers, and add or delete rows and columns without touching a text editor.",
    },
    {
      icon: "FileCheck2",
      title: "Quoting-aware parsing",
      description:
        "Powered by papaparse, so commas inside quoted fields, embedded line breaks, and escaped quotes are handled correctly, and the delimiter (comma, tab or semicolon) is auto-detected on import.",
    },
    {
      icon: "ArrowDownUp",
      title: "Click-to-sort columns",
      description:
        "Click a header to sort ascending or descending. Numeric columns sort by value, text columns alphabetically, and sorting is a view only, so your underlying row order and edits are never lost.",
    },
    {
      icon: "Search",
      title: "Find across the sheet",
      description:
        "Type in the search box to filter and count matches across every cell at once, so you can locate the row you need in a file with thousands of lines instead of scrolling.",
    },
    {
      icon: "FileSpreadsheet",
      title: "Export to real Excel",
      description:
        "Download a genuine.xlsx workbook written with SheetJS, a real Excel file that opens without the text-import wizard, or export clean, correctly-escaped CSV or formatted JSON.",
    },
    {
      icon: "Gauge",
      title: "Handles big files",
      description:
        "Rows are virtualised, so only the visible slice is mounted. Tens of thousands of rows scroll and edit smoothly where a naive HTML table would freeze the browser tab.",
    },
  ],

  benefits: [
    {
      title: "Fix a CSV without launching Excel",
      description:
        "Correct a few cells, rename a header or delete a bad column in seconds, right in a browser tab. No waiting for a heavyweight spreadsheet app to open a file you just need to nudge.",
    },
    {
      title: "Open files that break Excel's import",
      description:
        "Semicolon-delimited exports, leading zeros mangled into numbers, quoted commas: the editor parses them cleanly and lets you re-save a CSV that opens correctly everywhere.",
    },
    {
      title: "Convert between CSV, JSON and Excel",
      description:
        "One grid, three exports. Turn a CSV into array-of-objects JSON for an API, or into a real .xlsx for a colleague, without a separate converter or a command line.",
    },
    {
      title: "Keep confidential data on your machine",
      description:
        "Customer lists, financials and analytics dumps are parsed and edited entirely on your device. Nothing is uploaded, stored or logged, close the tab and it's gone.",
    },
  ],

  howTo: [
    {
      title: "Add your CSV",
      description:
        "Drop a .csv or .tsv file onto the workspace, paste rows copied from Excel or Google Sheets, or load a sample. The delimiter is detected automatically and the data opens in the grid.",
    },
    {
      title: "Edit the grid",
      description:
        "Click any cell to edit it, rename a header, and use the toolbar to add or delete rows and columns. Click a header to sort, and use the find box to locate a value across the whole sheet.",
    },
    {
      title: "Export or copy",
      description:
        "Download the result as CSV, as formatted JSON, or as a real Excel.xlsx workbook, or copy the CSV to your clipboard to paste elsewhere. Reset clears the grid to start fresh.",
    },
  ],

  formats: {
    input: ["CSV", "TSV", "TXT"],
    output: ["CSV", "JSON", "XLSX"],
  },

  useCases: [
    {
      audience: "Data analyst",
      title: "Clean an export before analysis",
      description:
        "Drop a raw data export, delete the columns you don't need, fix a few malformed cells and re-save a tidy CSV (or push it to JSON) before it goes into a notebook or dashboard.",
    },
    {
      audience: "Developer",
      title: "CSV to JSON for an API",
      description:
        "Paste a CSV, confirm the header row, and export array-of-objects JSON keyed by your column names to seed a database, a fixture file or a quick API payload.",
    },
    {
      audience: "Operations / Admin",
      title: "Prep a bulk-upload file",
      description:
        "Rename headers to match an import template, add or reorder columns, and export a correctly-escaped CSV that the target system accepts on the first try.",
    },
    {
      audience: "Marketer",
      title: "Fix a contact list",
      description:
        "Open a contact export, search for and correct bad entries, drop the columns your CRM doesn't want, and download a clean CSV or a real Excel file to hand off.",
    },
  ],

  troubleshooting: [
    {
      problem: "My columns are all jammed into one on import.",
      solution:
        "The file uses a delimiter the auto-detector didn't pick, usually a semicolon from a European locale, or a tab. The editor sniffs the most likely delimiter from the content. If a file is genuinely ambiguous, open it, then re-export as a comma CSV so it's unambiguous everywhere afterward.",
    },
    {
      problem: "Leading zeros or long numbers changed when I opened the file in Excel.",
      solution:
        "That's Excel coercing text into numbers, not the editor. Every value here is kept as text exactly as typed. Export to.xlsx from this tool (which preserves your cells) rather than opening a raw CSV in Excel, or keep the value as CSV text where it stays intact.",
    },
    {
      problem: "The grid says rows were capped.",
      solution:
        "There's a large soft cap so the browser tab stays responsive on pathological files. If your file exceeds it, split it into parts first, or remove columns you don't need before editing. The editor is tuned for tens of thousands of rows, not millions.",
    },
    {
      problem: "My first data row became the header (or vice-versa).",
      solution:
        "The editor treats the first row as headers. If your file has no header row, that's fine to edit in place, just rename the header cells to whatever you need, or add a blank row above and move your values down before exporting.",
    },
  ],

  tips: [
    "Paste directly from Excel or Google Sheets: tab-separated clipboard data is detected and expands into the grid, no file needed.",
    "Click a column header once to sort ascending, again for descending. Sorting is a view, so your saved row order and edits are preserved.",
    "Use the find box to count matches across the whole sheet before you start editing, so you know how many cells you'll need to touch.",
    "Export to.xlsx (not a renamed CSV) when handing a file to someone on Excel. It opens without the text-import wizard and keeps your values as text.",
    "Rename headers before exporting to JSON. They become the object keys, so clean, lowercase header names give you tidy JSON.",
  ],

  security:
    "Your CSV is parsed, edited and re-encoded entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely edit customer lists, financials and internal exports. All CSV, JSON and Excel exports are generated locally on your device. Close the tab and every trace of your data is gone.",

  faq: [
    {
      question: "Is my CSV uploaded to a server?",
      answer:
        "No. Parsing, editing and every export happen locally in your browser using papaparse and SheetJS. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to edit confidential exports like customer lists and financials.",
    },
    {
      question: "Can it open tab-separated or semicolon files, not just commas?",
      answer:
        "Yes. On import the delimiter is auto-detected, so comma CSV, tab-separated TSV and semicolon-delimited files (common from European Excel locales) all open correctly. You can then export back to a standard comma CSV so the file is unambiguous everywhere afterward.",
    },
    {
      question: "Does exporting to Excel create a real .xlsx file?",
      answer:
        "Yes. The Excel export is a genuine.xlsx workbook written with SheetJS, not a CSV with the extension changed. It opens directly in Excel, Numbers or Google Sheets without the text-import wizard, with your cells intact.",
    },
    {
      question: "How large a file can I edit?",
      answer:
        "The grid virtualises rows, so tens of thousands of rows stay smooth to scroll and edit. There's a generous soft cap to keep the browser tab responsive on extreme files. If you hit it, split the file or drop unneeded columns first. It's built for large files, not million-row datasets.",
    },
    {
      question: "Will editing change my data or reformat numbers?",
      answer:
        "No. Every cell is kept as text exactly as you type it, so leading zeros, long IDs and precise strings are preserved. Number mangling you may have seen is Excel coercing CSV text on open, export to.xlsx here, or keep it as CSV, to avoid it.",
    },
    {
      question: "Can I convert a CSV to JSON?",
      answer:
        "Yes. Export to JSON produces a formatted array of objects, one per row, keyed by your header names. Rename the headers first if you want clean, lowercase JSON keys, the export uses them verbatim.",
    },
    {
      question: "Can I paste data instead of uploading a file?",
      answer:
        "Yes. Paste a block copied from Excel or Google Sheets (tab-separated) or a raw CSV block, and it expands into the editable grid. No file required. You can also start from a blank grid and build a table from scratch.",
    },
    {
      question: "What happens to my headers and row order?",
      answer:
        "The first row is treated as the header and stays pinned. Click-to-sort only changes how rows are displayed, not their stored order, so your edits and original sequence are never lost, the exported file reflects the true underlying order plus your changes.",
    },
  ],

  changelog: [
    {
      date: "2026-06-11",
      change:
        "Initial release, drop/paste a CSV into an editable, windowed spreadsheet grid with cell editing, add/delete rows and columns, click-to-sort, find, live row/column/cell stats, and export to CSV, JSON and real.xlsx.",
    },
    {
      date: "2026-06-19",
      change:
        "Added automatic delimiter detection for tab- and semicolon-separated files, tab-separated paste-to-expand from Excel/Google Sheets, and a copy-CSV-to-clipboard action.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved large-file responsiveness with row virtualisation tuning, clearer capped-row notices, and sample datasets for one-click onboarding.",
    },
  ],

  relatedTools: [
    "excel-to-pdf",
    "csv-to-pdf",
    "merge-pdf",
    "json-formatter",
    "pdf-to-word",
  ],
};

export default csvEditor;
