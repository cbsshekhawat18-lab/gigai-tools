import type { Tool } from "@/types";

/**
 * CSV to Excel, the "get it into a real spreadsheet" tool in the GigAI
 * "Spreadsheets & CSV" group. It takes a CSV (pasted, dropped, or imported) and
 * writes a genuine binary .xlsx workbook with SheetJS, entirely in the browser:
 * papaparse sniffs the delimiter (comma / semicolon / tab), the tool shows a
 * live grid preview of exactly what will land in the sheet, lets you name the
 * worksheet, and hands back a file that opens natively in Microsoft Excel,
 * Google Sheets, LibreOffice Calc and Numbers. Every string is written for the
 * exact query someone types when a CSV won't open cleanly in Excel, and no
 * claim outruns what the client-side engine actually does (it writes a single
 * data sheet as text-typed cells; it does not fabricate formulas, styling or
 * multiple tabs).
 */
const csvToExcel: Tool = {
  slug: "csv-to-excel",
  title: "CSV to Excel",
  description:
    "Convert CSV to a real Excel.xlsx file in your browser. Paste or drop a.csv, preview the parsed grid live, name the sheet, and download a workbook that opens natively in Excel, Google Sheets and LibreOffice. Delimiter is auto-detected. Nothing is uploaded.",
  category: "document-tools",
  group: "Spreadsheets & CSV",
  icon: "FileSpreadsheet",
  accent: "emerald",
  status: "live",
  featured: false,
  createdAt: "2026-06-14",

  h1: "CSV to Excel Converter, Turn CSV Into a Real.xlsx Online",
  tagline:
    "Paste CSV or drop a spreadsheet export and download a genuine Excel workbook. The delimiter is auto-detected, a live grid shows exactly what lands in the sheet, and you name the worksheet before you export: all in your browser, never uploaded.",
  longDescription:
    "The GigAI CSV to Excel converter turns delimited text into a genuine binary.xlsx workbook without opening Excel, running a macro, or sending your data to a server. Paste CSV, drop a.csv exported from a database, an analytics dashboard or another app, or import a file, and the tool parses it with papaparse: automatically sniffing whether your fields are separated by commas, semicolons or tabs, and correctly handling quoted values, embedded commas and multi-line cells that make a raw CSV open as a single mangled column in Excel. A live grid preview shows exactly what will land in the spreadsheet before you commit, with row and column counts and the detected delimiter shown as badges, so there are no surprises after download. Name the worksheet whatever you like (it is sanitised to a valid Excel tab name for you), then export a real.xlsx file, not a renamed CSV, built with the SheetJS engine so it opens natively in Microsoft Excel, Google Sheets, LibreOffice Calc and Apple Numbers, and imports cleanly into Power BI, pandas or anything that reads the Office Open XML format. Because CSV carries no type or formatting information, every cell is written as its original text so nothing is silently reinterpreted, your leading zeros, long ID numbers and date-like strings survive exactly as they were. Everything runs client-side: financial exports, customer lists and internal datasets never leave your machine, there is nothing to upload or wait for, and closing the tab erases every trace. When you need to go the other way, the sibling Excel to CSV tool flattens a workbook back to plain text with the same nothing-uploaded guarantee.",

  ctaText: "Convert to Excel",

  keywords: [
    "csv to excel",
    "convert csv to excel",
    "csv to xlsx",
    "csv to excel converter",
    "csv to excel online",
    "csv to xlsx converter",
    "open csv in excel",
    "csv to spreadsheet",
    "csv to google sheets",
    "convert csv file to xlsx",
    "csv to excel free",
    "make excel from csv",
  ],

  seo: {
    title: "CSV to Excel Converter: Convert CSV to XLSX Online | GigAI Tools",
    description:
      "Free online CSV to Excel converter. Paste or drop a CSV and download a real.xlsx workbook that opens in Excel, Google Sheets and LibreOffice. Delimiter auto-detected, live grid preview, custom sheet name, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "FileSpreadsheet",
      title: "A real .xlsx, not a renamed CSV",
      description:
        "SheetJS writes a genuine Office Open XML workbook, so the file opens natively in Excel, Google Sheets, LibreOffice Calc and Numbers. No import wizard, no 'file format doesn't match' warning.",
    },
    {
      icon: "ScanLine",
      title: "Automatic delimiter detection",
      description:
        "Comma, semicolon or tab, papaparse sniffs the separator from your data and handles quoted fields, embedded commas and multi-line cells that make a raw CSV open as one mangled column.",
    },
    {
      icon: "Table",
      title: "Live grid preview",
      description:
        "See the parsed spreadsheet exactly as it will appear in Excel before you download, with row and column counts and the detected delimiter shown as live badges. No surprises after export.",
    },
    {
      icon: "Tag",
      title: "Name your worksheet",
      description:
        "Give the tab a meaningful name. It's sanitised to a valid Excel sheet name automatically (invalid characters and length limits handled for you).",
    },
    {
      icon: "Hash",
      title: "Text-safe cells",
      description:
        "Every value is written as its original text, so leading zeros, long ID numbers and date-like strings survive exactly as they were instead of being silently reinterpreted.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing and workbook generation happen on your device. Financial exports, customer lists and internal datasets are never uploaded, stored or logged: close the tab and every trace is gone.",
    },
  ],

  benefits: [
    {
      title: "Fixes the 'CSV opens as one column' mess",
      description:
        "Excel often mis-guesses the delimiter and crams every field into column A. This converter detects the separator first and writes a properly split .xlsx you can just open.",
    },
    {
      title: "Preserves data that Excel usually breaks",
      description:
        "Because cells are written as text, ZIP codes, product SKUs and 16-digit account numbers keep their leading zeros and exact digits instead of turning into rounded scientific notation.",
    },
    {
      title: "No Office install, no upload",
      description:
        "Produce a native spreadsheet on a locked-down machine or a Chromebook without Excel installed, and without pasting confidential data into a third-party website.",
    },
    {
      title: "Ready for the whole spreadsheet ecosystem",
      description:
        "The .xlsx imports cleanly into Google Sheets, Power BI, Tableau and pandas, so one conversion feeds every downstream tool.",
    },
  ],

  howTo: [
    {
      title: "Add your CSV",
      description:
        "Paste CSV into the editor, drop a .csv file anywhere on the workspace, or click Import. A sample loads in one click if you just want to see how it works.",
    },
    {
      title: "Check the live preview",
      description:
        "The grid shows exactly what will land in the sheet. Confirm the detected delimiter and the row/column counts match what you expect.",
    },
    {
      title: "Name the worksheet",
      description:
        "Type a tab name (or keep the default). It's sanitised to a valid Excel sheet name automatically.",
    },
    {
      title: "Download the .xlsx",
      description:
        "Click Download Excel to get a real workbook file, or copy the parsed data as CSV first if you want to double-check it. Nothing is uploaded at any step.",
    },
  ],

  formats: {
    input: ["CSV", "TSV", "TXT"],
    output: ["XLSX"],
  },

  useCases: [
    {
      audience: "Finance & ops",
      title: "Turn a system export into a workbook",
      description:
        "Convert a CSV dumped by an ERP or accounting tool into a clean .xlsx that opens with columns already split, ready for pivot tables and formulas.",
    },
    {
      audience: "Data analyst",
      title: "Hand a stakeholder a spreadsheet",
      description:
        "Send a colleague a proper Excel file instead of a raw CSV they'd have to import. The tab is named and the columns are correctly separated.",
    },
    {
      audience: "Developer",
      title: "Ship a report as .xlsx",
      description:
        "Take a CSV your script generated and produce the .xlsx a non-technical recipient expects, without adding a spreadsheet library to your build.",
    },
    {
      audience: "Educator / researcher",
      title: "Prep data for a class or study",
      description:
        "Convert a collected CSV into an Excel file that students or co-authors can open natively on any machine, with leading zeros and IDs preserved.",
    },
  ],

  troubleshooting: [
    {
      problem: "My whole CSV lands in one column in the preview.",
      solution:
        "The delimiter was mis-detected because the file is mostly one column or uses an unusual separator. Make sure it's genuine CSV/TSV with a consistent delimiter throughout, the sniffer picks comma, semicolon or tab from the data, so a mixed or rare separator can confuse it.",
    },
    {
      problem: "A ZIP code or ID lost its leading zeros in Excel.",
      solution:
        "This converter writes every cell as text, so the.xlsx it produces keeps leading zeros. If a number still displays trimmed, that's Excel re-guessing the type on open, format the column as Text in Excel, or the exported cell already holds the exact original string.",
    },
    {
      problem: "The sheet name I typed came out changed.",
      solution:
        "Excel forbids certain characters (: \\ / ? * [ ]) and caps tab names at 31 characters. The tool sanitises your name to a valid one automatically, so an over-long or illegal name is trimmed rather than rejected.",
    },
    {
      problem: "The download is slow or the tab feels sluggish.",
      solution:
        "Very large CSVs take longer to parse and write in the browser. Close other heavy tabs, or split an enormous file into a few smaller CSVs and convert each. Every conversion is local, so there's no upload wait, just processing time.",
    },
  ],

  tips: [
    "Glance at the detected-delimiter badge before exporting, if it's wrong, your source file probably has an inconsistent separator.",
    "The preview is authoritative: what you see in the grid is exactly what the .xlsx will contain.",
    "Paste tab-separated (TSV) data straight in: tabs are sniffed automatically, no setting to change.",
    "Give the worksheet a descriptive name so the recipient's tab isn't just 'Sheet1'.",
    "Need the reverse? The sibling Excel to CSV tool turns a workbook back into plain CSV, same nothing-uploaded guarantee.",
  ],

  security:
    "Your CSV is parsed and the Excel workbook is built entirely in your browser. Nothing is uploaded to any server. No data is stored, logged or transmitted, so you can safely convert financial exports, customer lists and internal datasets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my CSV uploaded to a server?",
      answer:
        "No. Parsing (papaparse) and workbook generation (SheetJS) run entirely in your browser. Your data never leaves your device, so there is nothing for us to store, log or see: it's safe for confidential exports and internal datasets.",
    },
    {
      question: "Is the output a real Excel file or just a renamed CSV?",
      answer:
        "It's a genuine binary.xlsx workbook written with SheetJS in the Office Open XML format, the same format Excel saves. It opens natively in Microsoft Excel, Google Sheets, LibreOffice Calc and Apple Numbers without any import step or format warning.",
    },
    {
      question: "Does it handle semicolon or tab-separated files?",
      answer:
        "Yes. The parser sniffs the delimiter from your data, so comma, semicolon and tab-separated (TSV) files all convert without changing a setting. The detected delimiter is shown as a badge so you can confirm it.",
    },
    {
      question: "Will my leading zeros and long ID numbers be preserved?",
      answer:
        "Yes. Every cell is written as its original text rather than being coerced to a number, so ZIP codes, SKUs and long account numbers keep their exact digits and leading zeros. (Note that Excel itself may re-guess types on open. Format the column as Text there if it re-trims a value.)",
    },
    {
      question: "Can it create multiple sheets or add formulas and styling?",
      answer:
        "No. It writes a single data worksheet of plain text values, which is what a CSV actually contains. It deliberately doesn't fabricate extra tabs, formulas or cell styling that weren't in your source. For richer workbooks, edit the exported.xlsx in Excel after downloading.",
    },
    {
      question: "Does it handle quoted fields and commas inside values?",
      answer:
        "Yes. papaparse follows RFC 4180, so quoted fields, commas inside quoted values and multi-line cells are parsed correctly, the exact cases where opening the raw CSV directly in Excel would split a value in the wrong place.",
    },
    {
      question: "Is there a file size limit?",
      answer:
        "There's a practical limit set by your browser's memory, since everything runs locally. Typical exports of a few thousand to tens of thousands of rows convert comfortably. For an enormous file, split it into smaller CSVs and convert each one.",
    },
    {
      question: "How do I convert an Excel file back to CSV?",
      answer:
        "Use the sibling Excel to CSV tool. It reads a .xlsx (or .xls) workbook and produces plain CSV text, with the same client-side, nothing-uploaded guarantee.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release: client-side CSV to.xlsx with automatic delimiter sniffing (comma/semicolon/tab), a live grid preview, row/column and detected-delimiter badges, a custom worksheet name, drag-drop/paste/import, copy-as-CSV, download and reset.",
    },
    {
      date: "2026-06-20",
      change:
        "Added worksheet-name sanitisation (illegal characters and the 31-character Excel limit are handled automatically) and clarified that cells are written as text to preserve leading zeros.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved TSV handling, added a curated set of sample CSVs and surfaced the detected delimiter as a badge so the parse can be verified before export.",
    },
  ],

  relatedTools: ["excel-to-csv", "csv-to-json", "csv-viewer", "json-to-csv"],
};

export default csvToExcel;
