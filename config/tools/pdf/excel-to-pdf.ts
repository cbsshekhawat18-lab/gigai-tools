import type { Tool } from "@/types";

/**
 * Excel to PDF, spreadsheet → print-ready PDF, entirely in the browser.
 *
 * Drop an .xlsx/.xls/.ods (or .csv) workbook, pick the sheet you want, choose
 * orientation and page size, and export the grid as a clean, bordered table PDF
 * (SheetJS parse → accessible <table> → html2canvas/jsPDF paginate). Every string
 * below is written for the real queries people type when they need a spreadsheet
 * as a shareable PDF, and no claim outruns what the client-side renderer does -
 * the honest limits (rasterised text, scale-to-fit on very wide sheets) are stated
 * plainly rather than glossed over.
 */
const excelToPdf: Tool = {
  slug: "excel-to-pdf",
  title: "Excel to PDF",
  description:
    "Convert an Excel spreadsheet (.xlsx, .xls, .ods) to a clean, printable PDF in your browser. Pick the sheet, choose portrait or landscape and A4 or Letter, then download a bordered table PDF. Nothing is uploaded.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "FileText",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Excel to PDF: Convert XLSX Spreadsheets to PDF Online",
  tagline:
    "Drop an.xlsx,.xls or.ods workbook, pick the sheet you need, set orientation and page size, and export a clean, bordered table PDF with one click. A live preview shows the exact grid before you download. 100% in your browser. Your spreadsheet is never uploaded.",
  longDescription:
    "The GigAI Excel to PDF converter turns a spreadsheet into a tidy, shareable PDF without opening Excel, installing a plugin, or sending your data to a server. Drop a workbook and the tool reads every worksheet on your device (via SheetJS), lists them by name, and shows a live preview of the sheet you choose so you can confirm the exact rows and columns before exporting. Cells keep their displayed text: dates, currencies and percentages render the way they look in the sheet, not as raw serial numbers, and the first row can be treated as a bold header. When it looks right, pick portrait or landscape, choose A4 or US Letter, and click Download PDF: the grid is laid out as an accessible bordered table with header shading and zebra rows, then paginated into a print-ready file ready to email, attach to a ticket, or hand to a reviewer who doesn't have Excel open. It handles the everyday work people actually reach for: exporting a single tab of a multi-sheet model, sharing a data table with a client, printing an invoice or a roster, or attaching a clean report to an email. Because everything runs locally using libraries loaded on demand, confidential financials, customer lists and internal models never leave your machine: close the tab and every trace is gone. Two honest notes, stated up front rather than buried: the sheet is rendered as a high-resolution image inside the PDF to preserve the exact grid look, so that text isn't individually selectable or searchable, and a very wide sheet is scaled down to fit the page width, so landscape (the default) plus splitting an unusually wide sheet into fewer columns gives the most readable result. When you need selectable, editable data instead of a picture of a grid, the sibling CSV Editor and CSV to Excel tools keep the values live.",

  ctaText: "Download PDF",

  keywords: [
    "excel to pdf",
    "xlsx to pdf",
    "convert excel to pdf",
    "spreadsheet to pdf",
    "xls to pdf",
    "excel to pdf converter",
    "ods to pdf",
    "excel spreadsheet to pdf online",
    "save excel as pdf",
    "export excel to pdf",
    "excel to pdf free",
    "sheet to pdf",
  ],

  seo: {
    title: "Excel to PDF, Convert XLSX to PDF Online Free | GigAI Tools",
    description:
      "Free online Excel to PDF converter. Drop an.xlsx,.xls or.ods workbook, pick the sheet, choose portrait/landscape and A4/Letter, and download a clean bordered table PDF. 100% in your browser. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Table2",
      title: "Sheet picker with live preview",
      description:
        "Multi-tab workbook? The tool lists every worksheet by name and shows a live preview of the one you select, so you export exactly the grid you mean. Not the wrong tab.",
    },
    {
      icon: "FileCog",
      title: "Orientation & page size",
      description:
        "Choose landscape (best for wide sheets) or portrait, and export to A4 or US Letter. The preview and export use the same layout so there are no surprises.",
    },
    {
      icon: "CalendarClock",
      title: "Displayed values, not raw serials",
      description:
        "Dates, currencies and percentages render as the text you see in the sheet. No stray date serial numbers or lost formatting in the exported table.",
    },
    {
      icon: "Heading",
      title: "Header row & readable grid",
      description:
        "Treat the first row as a bold header, with a bordered table, header shading and zebra striping so a printed data table stays easy to scan.",
    },
    {
      icon: "FileType2",
      title: "xlsx, xls, ods & csv",
      description:
        "Reads modern.xlsx, legacy.xls, OpenDocument.ods and plain.csv. The format is sniffed automatically, so you drop the file and go.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing, preview and PDF rendering all happen in your browser. Confidential financials, customer lists and internal models are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Share data with people who don't have Excel",
      description:
        "Hand a reviewer, client or non-technical stakeholder a clean PDF of the exact grid, instead of a spreadsheet they can't open, or accidentally edit.",
    },
    {
      title: "What you preview is what you export",
      description:
        "The live preview shows the same sheet, in the same layout, that becomes your PDF. No reflow surprises between choosing a tab and downloading.",
    },
    {
      title: "No install, no upload, no macros",
      description:
        "Get a consistent print-ready PDF without a print-to-PDF hack, a paid converter, or sending confidential rows to a third-party server.",
    },
    {
      title: "One tab of a big model, not the whole thing",
      description:
        "Export a single worksheet from a multi-sheet workbook so recipients see just the summary you meant to share, not every hidden working tab.",
    },
  ],

  howTo: [
    {
      title: "Drop your spreadsheet",
      description:
        "Drag an.xlsx,.xls,.ods or.csv file onto the page, or click to browse. It's read entirely on your device: nothing is uploaded.",
    },
    {
      title: "Pick the sheet",
      description:
        "Choose which worksheet to export from the list of tabs. A live preview updates so you can confirm the rows and columns before you convert.",
    },
    {
      title: "Set orientation & page size",
      description:
        "Choose landscape or portrait and A4 or US Letter, and decide whether the first row is a header. Landscape suits wide sheets best.",
    },
    {
      title: "Download the PDF",
      description:
        "Click Download PDF to save a paginated, bordered table PDF. Convert another sheet or another file whenever you like.",
    },
  ],

  formats: {
    input: ["XLSX", "XLS", "ODS", "CSV"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Accountant / Finance",
      title: "Share a report without the workbook",
      description:
        "Export a single summary tab of a financial model as a clean PDF for a client or partner, keeping the underlying formulas and working tabs private.",
    },
    {
      audience: "Operations / Admin",
      title: "Print rosters, invoices & inventory",
      description:
        "Turn a schedule, an invoice sheet or an inventory list into a bordered, print-ready PDF that looks the same on every printer and every screen.",
    },
    {
      audience: "Analyst / Data",
      title: "Attach a data table to a report",
      description:
        "Drop a results sheet into a PDF and attach it to an email or a doc, so stakeholders see the table without opening a spreadsheet app.",
    },
    {
      audience: "Teacher / Researcher",
      title: "Hand out a marks or results grid",
      description:
        "Export a grades table or a results grid as a tidy PDF for printing or distribution, with a clear header row and readable striping.",
    },
  ],

  troubleshooting: [
    {
      problem: "The text in my PDF isn't selectable or searchable.",
      solution:
        "The sheet is rendered as a high-resolution image inside the PDF to preserve the exact grid look, so that text isn't individually selectable. When you need selectable, editable values instead of a picture of a grid, keep the data live with the CSV Editor or CSV to Excel tools.",
    },
    {
      problem: "A very wide sheet looks small or cramped in the PDF.",
      solution:
        "Wide sheets are scaled down to fit the page width. Switch to landscape orientation (the default), choose US Letter, or split an unusually wide sheet into fewer columns so the printable area isn't overrun.",
    },
    {
      problem: "The wrong tab was exported.",
      solution:
        "Multi-sheet workbooks default to the first worksheet. Use the sheet picker to select the exact tab you want, the live preview updates to confirm it before you download.",
    },
    {
      problem: "My charts or cell colors didn't come through.",
      solution:
        "This tool renders the cell values as a clean data table, not the workbook's charts, images or conditional-format fills. The grid text and structure are preserved. Embedded charts and rich cell styling are not carried into the PDF.",
    },
  ],

  tips: [
    "Use landscape orientation for wide sheets. It fits far more columns before the grid is scaled down.",
    "Export one tab at a time from a big workbook so recipients see only the summary you meant to share.",
    "Keep the header row on so the first row prints as a bold, shaded heading that's easy to scan.",
    "Need selectable, editable values instead of a picture of the grid? Keep the data live with the CSV Editor or CSV to Excel tools.",
    "Very wide sheet? Split it into fewer columns or hide working columns before exporting so nothing shrinks to fit.",
  ],

  security:
    "Your spreadsheet is parsed, previewed and rendered to PDF entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert confidential financials, customer lists and internal models. The workbook is read on-device with an on-demand library. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my spreadsheet uploaded to a server?",
      answer:
        "No. The workbook is read, previewed and rendered to PDF entirely in your browser using libraries loaded on demand. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe for confidential financials and customer lists.",
    },
    {
      question: "Which spreadsheet formats can I convert?",
      answer:
        "Modern Excel .xlsx, legacy .xls, OpenDocument .ods and plain .csv. The format is detected automatically, so you just drop the file and choose the sheet you want to export.",
    },
    {
      question: "My workbook has several sheets. Can I choose which one?",
      answer:
        "Yes. Every worksheet is listed by name, and a live preview updates as you switch sheets so you can confirm the exact rows and columns before exporting. Each export is a single chosen sheet.",
    },
    {
      question: "Is the text in the exported PDF selectable?",
      answer:
        "No. The sheet is rendered as a high-resolution image inside the PDF to preserve the exact grid look, so that text isn't individually selectable or searchable. If you need selectable, editable values instead, keep the data live with the sibling CSV Editor or CSV to Excel tools.",
    },
    {
      question: "Will my dates and currencies render correctly?",
      answer:
        "Yes. Cells keep their displayed text, so dates, currencies and percentages appear the way they look in the sheet rather than as raw serial numbers or unformatted values.",
    },
    {
      question: "What happens to a very wide sheet?",
      answer:
        "Wide sheets are scaled down to fit the page width, which can make text small. Use landscape orientation (the default), pick US Letter, or split the sheet into fewer columns so the grid stays readable on the page.",
    },
    {
      question: "Can I choose portrait or landscape, and A4 or Letter?",
      answer:
        "Yes. Pick landscape or portrait orientation and A4 or US Letter page size. Landscape is the default because spreadsheets are usually wider than they are tall.",
    },
    {
      question: "Do charts, images and cell colors come through?",
      answer:
        "This tool renders the cell values as a clean bordered data table, not the workbook's charts, embedded images or conditional-format fills. The text and grid structure are preserved. Rich visual styling and charts are not carried into the PDF.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: drop an.xlsx/.xls/.ods/.csv workbook, pick a sheet with live preview, choose orientation and A4/Letter, header-row toggle, and one-click bordered-table PDF export, all in the browser.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a named sheet picker for multi-tab workbooks and preserved displayed cell text so dates, currencies and percentages export as shown instead of raw serials.",
    },
    {
      date: "2026-06-29",
      change:
        "Improved wide-sheet scaling and header/zebra styling in the exported table, and added a clearer honesty note about rasterised text vs. the live CSV Editor tools.",
    },
  ],

  relatedTools: [
    "csv-editor",
    "csv-to-json",
    "markdown-to-pdf",
    "document-comparer",
  ],
};

export default excelToPdf;
