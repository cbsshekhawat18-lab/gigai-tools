import type { Tool } from "@/types";

/**
 * CSV Viewer, the read-only counterpart in the GigAI "Spreadsheets & CSV"
 * group. Where the CSV Editor is a full read/write grid, this tool is a fast,
 * distraction-free VIEWER: drop or paste a CSV and it opens instantly as a
 * sortable, searchable spreadsheet with a live column profile (row/column
 * counts, per-column type, filled/empty and numeric min/max/mean). You look,
 * sort, filter and search, you never accidentally edit a cell, then export
 * clean CSV or JSON.
 *
 * It REUSES the same proven client-side engine as its siblings (papaparse via
 * `parseCsv`, the shared `csvStats` profiler, and `toXlsxBlob` is intentionally
 * NOT offered here. This is a viewer, not a converter). Copy below is written
 * fresh for "view csv online" / "csv viewer" search intent and shares nothing
 * with the CSV Editor or CSV-to-JSON pages. It is honest about being read-only:
 * to change cells, it points people to the sibling editor. Nothing is uploaded.
 */
const csvViewer: Tool = {
  slug: "csv-viewer",
  title: "CSV Viewer",
  description:
    "View CSV files online as a fast, sortable spreadsheet, search across every cell, sort any column, and read a live per-column profile with row/column counts and numeric stats. Read-only, so you never touch the data. Nothing is uploaded.",
  category: "document-tools",
  group: "Spreadsheets & CSV",
  icon: "Table",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-14",

  h1: "CSV Viewer. Open & Read CSV Files Online",
  tagline:
    "Drop or paste a CSV and it opens instantly as a clean, sortable, searchable spreadsheet. No editing, no clutter. Sort any column, filter and search across every cell, and read a live column profile that tells you the type, fill rate and numeric range of each field. Delimiter is auto-detected, tens of thousands of rows stay smooth, and everything runs in your browser. Never uploaded.",
  longDescription:
    "The GigAI CSV Viewer is the quickest way to actually read a CSV without wrestling it into Excel or Google Sheets. A.csv,.tsv or semicolon-delimited export drops straight into a windowed, spreadsheet-style grid: sticky header, tidy monospaced cells, and a row-number gutter so you always know where you are. Because it is read-only by design, you can hand it a production data dump or a client's file and explore it freely (sort, filter, scroll and search) without the risk of nudging a cell or re-saving a mangled file. Parsing goes through papaparse, so the delimiter (comma, tab or semicolon) is auto-detected and the awkward cases are handled correctly: commas inside quoted fields, embedded line breaks, and escaped quotes that a naive split-on-comma would shred. Click any header to sort ascending or descending (numeric columns sort by value, text columns alphabetically) and the sort is a view only, so the underlying order is never disturbed. Type in the search box to instantly filter to the rows that contain your term and see a live match count, which is how you find one record in a file with tens of thousands of lines instead of scrolling forever. What sets the viewer apart is the live column profile: for every column it shows whether the field is numeric or text, how many cells are filled versus empty, how many distinct values it holds, and, for numeric columns, the minimum, maximum, mean and sum. That is an instant sanity check on a dataset: spot the column that is 40% empty, the ID field that should be unique but isn't, or the price column whose max is an obvious outlier. When you want to take the data elsewhere, export a clean, correctly-escaped CSV or a formatted JSON array of objects keyed by your headers. Row virtualisation keeps big files responsive by mounting only the rows you can see. And because every byte is parsed and profiled on your device, confidential exports never leave your machine: close the tab and every trace is gone. Need to actually change cells, add rows or write a real.xlsx? The sibling CSV Editor does exactly that. This tool stays focused on fast, safe reading.",

  ctaText: "Open CSV Viewer",

  keywords: [
    "csv viewer",
    "view csv online",
    "open csv online",
    "csv viewer online",
    "read csv file",
    "csv reader",
    "online csv viewer",
    "view csv file",
    "csv table viewer",
    "csv preview",
    "tsv viewer",
    "free csv viewer",
  ],

  seo: {
    title: "CSV Viewer. Open & Read CSV Files Online | GigAI Tools",
    description:
      "Free online CSV viewer. Open a CSV as a fast, sortable, searchable spreadsheet with a live per-column profile (type, fill rate, min/max/mean). Read-only and 100% in your browser: nothing uploaded.",
  },

  features: [
    {
      icon: "Table",
      title: "Instant read-only spreadsheet",
      description:
        "Your CSV opens in a clean grid with a sticky header, row numbers and monospaced cells. It is view-only by design, so you can explore a production file without the risk of editing or re-saving it.",
    },
    {
      icon: "ScanLine",
      title: "Live column profile",
      description:
        "For every column, see its detected type (numeric or text), how many cells are filled versus empty, its distinct-value count, and, for numeric fields, the min, max, mean and sum. An instant data sanity check.",
    },
    {
      icon: "Search",
      title: "Search across every cell",
      description:
        "Type in the search box to filter to matching rows and get a live match count. Locate a single record in a file of tens of thousands of lines instead of scrolling.",
    },
    {
      icon: "ArrowDownUp",
      title: "Click-to-sort columns",
      description:
        "Click a header to sort ascending or descending. Numeric columns sort by value, text columns alphabetically, and sorting is a view, so the file's true row order is never changed.",
    },
    {
      icon: "FileCheck2",
      title: "Quoting-aware parsing",
      description:
        "Powered by papaparse: commas inside quoted fields, embedded line breaks and escaped quotes are handled correctly, and the delimiter (comma, tab or semicolon) is auto-detected on open.",
    },
    {
      icon: "Gauge",
      title: "Handles big files",
      description:
        "Rows are virtualised, so only the visible slice is mounted. Tens of thousands of rows scroll and search smoothly where a plain HTML table would freeze the tab.",
    },
  ],

  benefits: [
    {
      title: "Read a CSV without launching Excel",
      description:
        "Peek inside a data export in a browser tab in seconds. No waiting for a heavyweight spreadsheet app, and no import wizard mangling your dates and leading zeros.",
    },
    {
      title: "Explore safely, read-only",
      description:
        "Because there is no editing, you can open a client's file or a production dump and sort, filter and search freely with zero risk of changing a cell or overwriting the original.",
    },
    {
      title: "Profile a dataset at a glance",
      description:
        "The per-column type, fill rate and numeric range surface data problems instantly (an unexpectedly empty column, a non-unique ID, or an outlier value) before it reaches your pipeline.",
    },
    {
      title: "Keep confidential data on your machine",
      description:
        "Every byte is parsed and profiled on your device. Nothing is uploaded, stored or logged, so customer lists, financials and internal exports never leave your browser.",
    },
  ],

  howTo: [
    {
      title: "Add your CSV",
      description:
        "Drop a .csv or .tsv file onto the workspace, paste rows copied from Excel or Google Sheets, or load a sample. The delimiter is auto-detected and the data opens in the grid.",
    },
    {
      title: "Sort, search and profile",
      description:
        "Click any header to sort, type in the search box to filter and count matches across the whole sheet, and open the column profile to read each field's type, fill rate and numeric stats.",
    },
    {
      title: "Export or copy",
      description:
        "Download the data as a clean CSV or a formatted JSON array, or copy the CSV to your clipboard to paste elsewhere. Reset clears the viewer to open another file.",
    },
  ],

  formats: {
    input: ["CSV", "TSV", "TXT"],
    output: ["CSV", "JSON"],
  },

  useCases: [
    {
      audience: "Data analyst",
      title: "Sanity-check an export before analysis",
      description:
        "Drop a raw export, scan the column profile for empty or non-unique fields and out-of-range numbers, and confirm the file is clean before it goes into a notebook or dashboard.",
    },
    {
      audience: "Developer",
      title: "Inspect a data file quickly",
      description:
        "Open a CSV a service produced, sort by a key column and search for a specific record to verify the output, without importing it into anything or writing a throwaway script.",
    },
    {
      audience: "Support / Operations",
      title: "Look up a row in a big export",
      description:
        "Search a large contact or order export for one email or ID, read the matching row, and copy the values out, all without the risk of editing the source file.",
    },
    {
      audience: "Analyst reviewing a hand-off",
      title: "Review a file someone sent you",
      description:
        "Open a client's or colleague's CSV read-only, sort and profile it to understand its shape, and export a tidy CSV or JSON copy without ever altering the original.",
    },
  ],

  troubleshooting: [
    {
      problem: "My columns are all jammed into one on open.",
      solution:
        "The file uses a delimiter the auto-detector didn't pick, usually a semicolon from a European locale, or a tab. The viewer sniffs the most likely delimiter from the content. If a file is genuinely ambiguous, export the data as a comma CSV from here so it opens unambiguously everywhere afterward.",
    },
    {
      problem: "I need to change a cell, but nothing happens when I click it.",
      solution:
        "That's intentional. This is a read-only viewer, so cells can't be edited. Open the sibling CSV Editor to change cells, add or delete rows and columns, and export a real.xlsx workbook.",
    },
    {
      problem: "A column shows as text but I expected numbers.",
      solution:
        "The profile marks a column numeric only when every filled cell parses as a finite number. A single stray value (a blank rendered as a dash, a comma thousands-separator, or a currency symbol) flips it to text. Search for the odd value to find it.",
    },
    {
      problem: "The grid says rows were capped.",
      solution:
        "There's a large soft cap so the browser tab stays responsive on pathological files. If your file exceeds it, split it into parts first, or drop the columns you don't need before opening. The viewer is tuned for tens of thousands of rows, not millions.",
    },
  ],

  tips: [
    "Paste directly from Excel or Google Sheets: tab-separated clipboard data is detected and opens in the grid, no file needed.",
    "Open the column profile first: it's the fastest way to spot an unexpectedly empty field or a non-unique ID before you dig into the rows.",
    "Click a header once to sort ascending, again for descending. Sorting is a view only, so the file's real order is never touched.",
    "Use the search box to count matches across the whole sheet, then sort the matching column to group related rows together.",
    "Need to edit, not just read? The sibling CSV Editor opens the same file as a fully editable grid with Excel export.",
  ],

  security:
    "Your CSV is parsed, profiled and re-encoded entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely view customer lists, financials and internal exports. Because the viewer is read-only, the original file is never modified, and every CSV or JSON export is generated locally on your device. Close the tab and every trace of your data is gone.",

  faq: [
    {
      question: "Is my CSV uploaded to a server?",
      answer:
        "No. Parsing, profiling and every export happen locally in your browser using papaparse. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to view confidential exports like customer lists and financials.",
    },
    {
      question: "Can I edit cells in the viewer?",
      answer:
        "No. This tool is read-only by design, which is what makes it safe for exploring production files and client data without the risk of changing them. If you need to edit cells, add or delete rows and columns, or export a real.xlsx, use the sibling CSV Editor, which opens the same file as a fully editable grid.",
    },
    {
      question: "What does the column profile show?",
      answer:
        "For each column it shows the detected type (numeric or text), the number of filled versus empty cells, and the count of distinct values. For numeric columns it also reports the minimum, maximum, mean and sum, a fast way to spot empty fields, non-unique IDs and outlier values.",
    },
    {
      question: "Can it open tab-separated or semicolon files, not just commas?",
      answer:
        "Yes. On open the delimiter is auto-detected, so comma CSV, tab-separated TSV and semicolon-delimited files (common from European Excel locales) all display correctly. You can then export a standard comma CSV so the file is unambiguous everywhere afterward.",
    },
    {
      question: "How large a file can I open?",
      answer:
        "The grid virtualises rows, so tens of thousands of rows stay smooth to scroll, sort and search. There's a generous soft cap to keep the browser tab responsive on extreme files. If you hit it, split the file or drop unneeded columns first. It's built for large files, not million-row datasets.",
    },
    {
      question: "Can I sort and search the data?",
      answer:
        "Yes. Click any column header to sort ascending or descending (numeric columns sort by value, text columns alphabetically), and type in the search box to filter to matching rows with a live match count. Sorting is a view, so it never changes the file's underlying row order.",
    },
    {
      question: "Can I export the data after viewing it?",
      answer:
        "Yes. Export a clean, correctly-escaped CSV, or a formatted JSON array of objects keyed by your header row. You can also copy the CSV to your clipboard. For a real Excel .xlsx export, use the sibling CSV Editor.",
    },
    {
      question: "Will viewing change my data or reformat numbers?",
      answer:
        "No. Every cell is kept as text exactly as it appears in the file, so leading zeros, long IDs and precise strings are preserved, and the read-only design means the original is never altered. Number mangling you may have seen elsewhere is Excel coercing CSV text on open. This viewer never does that.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, drop/paste a CSV into a fast, read-only, windowed spreadsheet with auto delimiter detection, click-to-sort, search-across-cells, a live per-column profile (type, filled/empty, unique, numeric min/max/mean/sum), and export to CSV and JSON.",
    },
    {
      date: "2026-06-22",
      change:
        "Added tab-separated paste-to-view from Excel/Google Sheets, a live match count on search, and a copy-CSV-to-clipboard action.",
    },
    {
      date: "2026-06-29",
      change:
        "Refined the column profile layout for wide tables, tuned row virtualisation for large files, and added sample datasets for one-click onboarding.",
    },
  ],

  relatedTools: [
    "csv-editor",
    "csv-to-json",
    "excel-to-csv",
    "json-formatter",
  ],
};

export default csvViewer;
