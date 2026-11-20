import type { Tool } from "@/types";

/**
 * Document Viewer, the universal, catch-all viewer of the GigAI Document
 * suite. Drop ANY supported document (PDF, CSV, XLSX, TXT, MD, EPUB, RTF or an
 * image) and the tool auto-detects the format and renders the right in-browser
 * preview: a paged pdf.js canvas for PDFs, an editable-looking read-only grid
 * for spreadsheets, rendered Markdown, an EPUB rendition, and so on.
 *
 * It is composition, not reinvention. The whole preview surface is the shared
 * `<DocumentPreview>` component, which internally dispatches to the same per-kind
 * renderers (pdf.js / papaparse / SheetJS / marked / epub.js) that power previews
 * everywhere else on the platform. RTF is normalised to HTML through the shared
 * `rtfToHtml` engine before preview. There is no duplicated viewer code behind
 * this URL: only unique, honestly-scoped copy for the exact "open / view /
 * preview a file online" queries people type.
 *
 * Honesty: this is a VIEWER, not an editor or a converter. It shows the file
 * faithfully and lets you download the original, but it does not change, convert
 * or re-export it. Scanned/image-only PDFs display as images (no selectable
 * text), and legacy binary formats (.doc,.ppt) aren't previewable here: the
 * copy states those boundaries and points to the right sibling tool.
 */
const documentViewer: Tool = {
  slug: "document-viewer",
  title: "Document Viewer",
  description:
    "Open and view almost any document in your browser. Drop a PDF, CSV, Excel, text, Markdown, EPUB, RTF or image file and the viewer auto-detects the format and previews it instantly, paged PDFs, scrollable spreadsheets, rendered Markdown and more. Nothing is uploaded.",
  category: "document-tools",
  group: "Viewers",
  icon: "Eye",
  accent: "indigo",
  status: "live",
  featured: false,
  createdAt: "2026-06-19",

  h1: "Document Viewer. Open & Preview Any File Online",
  tagline:
    "One drop zone for everything. Add a PDF, CSV, Excel workbook, text file, Markdown, EPUB, RTF or image and the viewer works out the format for you and renders a faithful preview right in your browser: page through a PDF, scroll a spreadsheet, read rendered Markdown or an e-book, all without an app, an account or an upload.",
  longDescription:
    "The GigAI Document Viewer is the catch-all opener for when you have a file and just need to see what's inside it, without hunting for the right app, buying a licence, or uploading a private document to some website. Drop a file onto the single universal drop zone (or click to browse, or paste one from your clipboard) and the viewer detects the format from its contents and extension, then renders it with the appropriate previewer entirely on your device. A PDF opens as a crisp, paged pdf.js canvas you can move through page by page. A CSV or Excel workbook (.xlsx) opens as a clean, scrollable grid, with a sheet switcher for multi-sheet workbooks. Markdown is rendered to formatted HTML rather than shown as raw asterisks, plain text appears with a live character/word/line count, JSON is pretty-printed and monospaced, an EPUB opens as a real reflowing e-book rendition with prev/next paging, RTF is converted to formatted HTML for display, and images are shown fitted to the frame. When a format can't be previewed, you still get a tidy fallback with the file's name, size and a one-click download rather than a broken page. Because every previewer runs in the browser and each heavy library is loaded only when its format is actually shown, opening a file is fast and completely private: nothing is transmitted, stored or logged, so confidential PDFs, financial spreadsheets and unreleased drafts are safe to open here. Two honest boundaries worth stating up front: this is a viewer, not an editor or a converter. It shows the file and lets you download the original as-is, but it does not modify, convert or re-export it (there are dedicated GigAI tools for that). And it can only render what a file actually contains: a scanned or image-only PDF will display as page images with no selectable text, and legacy binary formats such as old.doc or.ppt aren't previewable in the browser here.",

  ctaText: "Open a Document",

  keywords: [
    "document viewer",
    "open document online",
    "view pdf online",
    "file viewer",
    "online file viewer",
    "view excel online",
    "open epub online",
    "view rtf online",
    "preview document",
    "open any file browser",
  ],

  seo: {
    title:
      "Document Viewer: Open & View PDF, CSV, Excel, Markdown, EPUB & More Online | GigAI Tools",
    description:
      "Free universal document viewer. Drop a PDF, CSV, Excel, text, Markdown, EPUB, RTF or image and preview it instantly in your browser, paged PDFs, scrollable spreadsheets, rendered Markdown and e-books. 100% private, nothing uploaded.",
  },

  features: [
    {
      icon: "Eye",
      title: "One viewer for every file",
      description:
        "PDF, CSV, Excel (.xlsx), text, Markdown, JSON, EPUB, RTF and common images all open through a single drop zone. No need to find the right app or switch between tools for each format.",
    },
    {
      icon: "Wand2",
      title: "Automatic format detection",
      description:
        "Drop a file and the viewer works out what it is from its contents and extension, then picks the matching previewer for you. There's nothing to configure and no format to choose.",
    },
    {
      icon: "FileText",
      title: "Format-aware previews",
      description:
        "Each type is shown the right way: PDFs paginate, spreadsheets become scrollable grids with a sheet switcher, Markdown renders to formatted text, EPUBs reflow as an e-book, and images fit the frame.",
    },
    {
      icon: "Zap",
      title: "Fast and lazy-loaded",
      description:
        "Each heavy previewer library (pdf.js, SheetJS, epub.js) is loaded only when its format is actually opened, so the page stays light and a file appears within moments of dropping it.",
    },
    {
      icon: "Download",
      title: "Download the original",
      description:
        "Grab the original file straight from the preview chrome with one click. Even unsupported formats get a tidy fallback card with the name, size and a download button instead of a broken view.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, in-browser",
      description:
        "Every file is opened and rendered on your device. Nothing is uploaded, stored or logged, so confidential PDFs, financial spreadsheets and unreleased drafts are safe to open here.",
    },
  ],

  benefits: [
    {
      title: "Skip installing apps",
      description:
        "No PDF reader, spreadsheet suite or e-book app required. If you can open a browser tab, you can open the file. Handy on a locked-down work machine or a borrowed computer.",
    },
    {
      title: "Open sensitive files safely",
      description:
        "Because the viewer never uploads anything, you can inspect a confidential contract, a payroll spreadsheet or an unreleased draft without it ever leaving your machine.",
    },
    {
      title: "Quickly check what's inside",
      description:
        "Received a mystery attachment or an unlabelled export? Drop it in to see its contents at a glance before deciding what to do with it, convert it, edit it elsewhere, or discard it.",
    },
    {
      title: "One habit for many formats",
      description:
        "Instead of remembering which app opens which extension, use one drop zone for PDFs, spreadsheets, Markdown, e-books and images alike.",
    },
  ],

  howTo: [
    {
      title: "Drop or choose a file",
      description:
        "Drag a document onto the drop zone, click to browse, or paste one from your clipboard. PDF, CSV, XLSX, TXT, MD, JSON, EPUB, RTF and images are all accepted.",
    },
    {
      title: "Let it auto-detect",
      description:
        "The viewer identifies the format from the file's contents and extension and loads the matching previewer. You don't have to pick a type.",
    },
    {
      title: "Read, page or scroll",
      description:
        "Move through a PDF page by page, scroll a spreadsheet grid, switch sheets in a workbook, page through an EPUB, or read rendered Markdown: whatever the file needs.",
    },
    {
      title: "Download or open another",
      description:
        "Download the original from the preview chrome if you want to keep it, or reset the viewer and drop a different file to open it just as fast.",
    },
  ],

  formats: {
    input: ["PDF", "CSV", "XLSX", "TXT", "MD", "JSON", "EPUB", "RTF", "PNG", "JPG"],
    output: ["Original file"],
  },

  useCases: [
    {
      audience: "Everyday / General",
      title: "Open a mystery attachment",
      description:
        "Someone emailed a file and you don't have the right app installed. Drop it into the viewer to see what's inside before deciding whether to keep, convert or delete it.",
    },
    {
      audience: "Analyst / Finance",
      title: "Peek at a spreadsheet fast",
      description:
        "Open a CSV export or an Excel workbook as a scrollable grid, flip between sheets and check the columns without launching a heavyweight spreadsheet app.",
    },
    {
      audience: "Reader / Student",
      title: "Read an EPUB or PDF anywhere",
      description:
        "Open an e-book or a PDF study guide in the browser on a machine with no reader installed, and page through it comfortably.",
    },
    {
      audience: "Developer / Docs",
      title: "Preview Markdown and JSON",
      description:
        "See a README render exactly as it will look, or pretty-print a JSON payload to inspect its structure, without pasting private content into an online box.",
    },
  ],

  troubleshooting: [
    {
      problem: "My PDF opens but I can't select any text.",
      solution:
        "The PDF is a scan or an image-only export, so its pages are pictures with no underlying text layer. The viewer displays those page images faithfully. To get selectable text you'd need to run the file through an OCR tool first.",
    },
    {
      problem: "My file shows the fallback card instead of a preview.",
      solution:
        "The format isn't one the viewer can render in-browser, legacy binary.doc /.ppt and some niche types fall here. You can still download the original from the card, for.doc, try the Word-to-PDF tool, and for spreadsheets export to.xlsx or.csv first.",
    },
    {
      problem: "I edited the file in the viewer but changes didn't save.",
      solution:
        "This is a read-only viewer, not an editor. Grids, text and PDFs are shown for viewing only and nothing you type is saved. Use the dedicated CSV Editor, PDF Editor or Markdown tools when you need to make and keep changes.",
    },
    {
      problem: "A very large file is slow to open.",
      solution:
        "Big PDFs render page by page and large workbooks parse every row, both of which take a moment. Give it a few seconds. If a file is enormous, opening a smaller export or a single sheet will be faster.",
    },
  ],

  tips: [
    "You don't need to pick a format, just drop the file and the viewer detects it. Paste from the clipboard works too.",
    "For a multi-sheet Excel workbook, use the sheet switcher above the grid to move between tabs.",
    "Markdown is rendered, not shown raw: perfect for previewing a README exactly as it'll appear before you publish it.",
    "Need to change the file, not just look at it? Reach for the CSV Editor, PDF Editor or a converter. This tool is view-only by design.",
    "A scanned PDF will open as page images. Run it through OCR first if you need to select or copy its text.",
  ],

  security:
    "Every file you open is read and rendered entirely in your browser: nothing is ever uploaded to a server. PDFs are drawn with pdf.js, spreadsheets parsed with SheetJS, Markdown rendered with marked, EPUBs opened with epub.js and RTF converted with a built-in parser, all on your device. Each library loads only when its format is shown, and nothing is stored, logged or transmitted. That makes it safe to open confidential PDFs, financial spreadsheets and unreleased drafts here. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my file uploaded anywhere?",
      answer:
        "No. The viewer opens and renders every file locally in your browser, pdf.js for PDFs, SheetJS for spreadsheets, marked for Markdown, epub.js for e-books and a built-in parser for RTF. Nothing leaves your device, so there is nothing for us to store, log or see, and it is safe to open confidential documents.",
    },
    {
      question: "Which file types can I open?",
      answer:
        "PDF, CSV, Excel (.xlsx), plain text (.txt), Markdown (.md), JSON, EPUB, RTF and common images (PNG, JPG, GIF, WebP, SVG). The viewer detects the format automatically and picks the right previewer for you. Legacy binary formats like old .doc and .ppt aren't previewable in the browser.",
    },
    {
      question: "Can I edit or convert the file here?",
      answer:
        "No, and it's honest about that. This is a viewer, not an editor or converter. It shows the file faithfully and lets you download the original as-is, but it doesn't modify, convert or re-export it. GigAI has dedicated tools for editing (CSV Editor, PDF Editor) and converting (Word-to-PDF, Excel-to-PDF and more).",
    },
    {
      question: "Why can't I select text in my PDF?",
      answer:
        "Because that PDF is a scan or image-only export: its pages are pictures of text with no real text layer. The viewer displays those images accurately, but there's nothing to select. Run the file through an OCR tool to add a text layer if you need selectable, copyable text.",
    },
    {
      question: "Do I need to install anything?",
      answer:
        "No. Everything runs in your browser, so you don't need a PDF reader, a spreadsheet suite or an e-book app. It works on a locked-down work laptop or a borrowed machine, just open the page and drop a file.",
    },
    {
      question: "Can I open an Excel workbook with multiple sheets?",
      answer:
        "Yes. Multi-sheet .xlsx workbooks open with a sheet switcher above the grid, so you can move between tabs and view each sheet as a scrollable table. For the best results, export older .xls files to .xlsx first.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There's a generous guard so your browser tab stays responsive. Large PDFs render page by page and big workbooks parse every row, so very large files take a moment to appear. Typical documents, exports and e-books open comfortably.",
    },
    {
      question: "What happens with a format the viewer doesn't support?",
      answer:
        "You get a clean fallback card showing the file's name and size with a one-click download, rather than a broken page. That way you can still grab the original and open it in the right dedicated tool or app.",
    },
  ],

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release: a universal in-browser viewer that auto-detects and previews PDF, CSV, Excel, text, Markdown, JSON, EPUB, RTF and image files, with a one-click download of the original and a tidy fallback for unsupported types.",
    },
    {
      date: "2026-06-25",
      change:
        "Added a sheet switcher for multi-sheet Excel workbooks and a live character/word/line count on the plain-text preview.",
    },
    {
      date: "2026-07-01",
      change:
        "Improved handling of scanned and image-only PDFs with a clear 'no selectable text' notice, and refined the fallback card for legacy binary formats.",
    },
  ],

  relatedTools: [
    "document-comparer",
    "csv-editor",
    "markdown-to-pdf",
    "pdf-to-word",
  ],
};

export default documentViewer;
