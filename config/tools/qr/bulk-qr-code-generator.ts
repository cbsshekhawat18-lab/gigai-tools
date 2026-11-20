import type { Tool } from "@/types";

/**
 * Bulk QR Code Generator, a flagship, batch-first micro-site over the QR
 * Studio. Where the single-code generator makes one design at a time, this tool
 * is built for volume: upload a CSV (or paste a list), apply ONE shared style -
 * colors, dot/eye shapes, a centre logo, a frame, and download a ZIP of
 * hundreds or thousands of individually rendered QR codes, each named from your
 * spreadsheet. Every string here targets the exact queries people type when they
 * need to mass-produce codes for a product catalogue, an event's tables, an
 * asset register or a mail-merge. Not another one-off PNG.
 *
 * Honest boundary baked into the copy: these are STATIC codes generated from
 * your rows entirely in the browser (no server, no accounts, no per-code
 * tracking or editable-after-print redirects), and very large batches are bound
 * by your device's memory because all the work happens client-side.
 */
const bulkQrCodeGenerator: Tool = {
  slug: "bulk-qr-code-generator",
  title: "Bulk QR Code Generator",
  description:
    "Generate hundreds or thousands of QR codes at once from a CSV. Apply one shared style (colors, logo, dot shapes) and download every code as a named PNG or SVG inside a single ZIP. Runs 100% in your browser. Nothing is uploaded.",
  category: "qr-tools",
  icon: "Layers",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "bulk-qr-code-generator",

  h1: "Bulk QR Code Generator, CSV to a ZIP of Codes",
  tagline:
    "Turn a spreadsheet into a whole set of QR codes in one pass. Upload your CSV, style every code identically with colors, shapes and a logo, watch the progress bar fill, and download a ZIP where each file is named from your data. No sign-up, no watermark, and every row is processed on your own device.",
  longDescription:
    "The GigAI Bulk QR Code Generator is built for the moment one code isn't enough: a 400-SKU product catalogue, a 90-table restaurant, a conference with a badge per attendee, or an asset register with a code on every laptop. Upload a CSV (grab the built-in template if you're starting fresh) and each row becomes its own QR code: point one column at the value to encode (a URL, a Wi-Fi string, a vCard, any of the 28 supported payload types) and optionally add a filename column so every exported file is named exactly the way you want (sku-1024.png, table-07.svg, badge-jsmith.png). Then style the whole batch once: pick your brand colors or a gradient, choose dot and finder-eye shapes, set the quiet-zone margin and corner radius, and drop a centre logo in, the entire set inherits that single design, so 800 codes look like they came from one hand. A live preview shows exactly what each code will look like before you commit, and a running progress bar reports how many of your rows have rendered as the batch streams through the browser's canvas. When it's done you get one ZIP: every code as a lossless PNG (or scalable SVG) at the resolution you choose, individually named from your sheet and ready to drop straight into a print run, a label sheet or an asset system. Crucially, all of this happens locally: the CSV is parsed, every code is rendered, and the ZIP is packed entirely on your machine using the browser's own APIs. Your links, SKUs, contact rows and Wi-Fi credentials never touch a server, there is no account and no watermark, and nothing is stored after you close the tab. These are static codes (the data is baked into each pattern), so they never expire and need no hosting. The honest trade-off is that you can't re-target them after printing and, because the whole batch is rendered in your browser, very large jobs are bound by your device's memory rather than a data-centre.",

  ctaText: "Upload CSV & Generate Codes",

  keywords: [
    "bulk qr code generator",
    "batch qr code generator",
    "csv to qr code",
    "generate multiple qr codes",
    "mass qr code generator",
    "qr codes from spreadsheet",
    "qr code batch download zip",
    "bulk qr code maker free",
    "multiple qr codes at once",
    "excel to qr code",
    "bulk qr codes with logo",
  ],

  seo: {
    title:
      "Bulk QR Code Generator, CSV to ZIP of QR Codes (Free, No Signup) | GigAI Tools",
    description:
      "Free bulk QR code generator. Upload a CSV, apply one shared style with logo and colors, and download hundreds or thousands of named QR codes in a single ZIP. 100% in-browser. No watermark, no upload, no account.",
  },

  features: [
    {
      icon: "Table",
      title: "CSV → ZIP in one pass",
      description:
        "Upload a spreadsheet and every row becomes its own QR code, packed into a single downloadable ZIP. A built-in template shows the exact column layout, so you can start from scratch or paste in data you already have.",
    },
    {
      icon: "Palette",
      title: "One style for the whole batch",
      description:
        "Set colors or a gradient, dot and finder-eye shapes, quiet-zone margin and corner radius once, and every code in the set inherits that design: hundreds of codes that look like they came from one brand.",
    },
    {
      icon: "Image",
      title: "Your logo on every code",
      description:
        "Drop a centre logo into the shared style and it's applied across the entire batch, with automatic error-correction guidance so each code stays reliably scannable with your mark on top.",
    },
    {
      icon: "FileText",
      title: "Named from your data",
      description:
        "Add a filename column and each exported file is named from your sheet (sku-1024.png, table-07.svg, badge-jsmith.png) so the ZIP drops straight into a print run or asset system without renaming a thing.",
    },
    {
      icon: "Loader",
      title: "Live progress + preview",
      description:
        "A running progress bar reports how many rows have rendered as the batch streams through, and a live preview shows exactly what a code will look like before you generate the full set.",
    },
    {
      icon: "ShieldCheck",
      title: "Every row stays on your device",
      description:
        "The CSV is parsed, all codes are rendered, and the ZIP is packed entirely in your browser. Your links, SKUs and contact rows are never uploaded, logged or stored. No server, no account.",
    },
  ],

  benefits: [
    {
      title: "Hours of work in one click",
      description:
        "Instead of pasting values one at a time into a single-code generator and downloading each PNG by hand, you turn a whole spreadsheet into a finished ZIP in a single pass: the difference between an afternoon and a minute.",
    },
    {
      title: "Perfectly consistent set",
      description:
        "One shared style means every code in a 500-item catalogue is the same size, color and shape with the same logo. No drift, no mismatched exports, no code that looks off next to the others.",
    },
    {
      title: "Drop-in file names",
      description:
        "Because each file is named from your own filename column, the ZIP maps cleanly onto your SKUs, table numbers or asset IDs, ready for a label template or print shop with zero manual renaming.",
    },
    {
      title: "Private and free at any scale",
      description:
        "No account, no watermark and no per-code fee, generate ten codes or ten thousand. Everything runs locally, so the data in your spreadsheet never leaves your browser.",
    },
  ],

  howTo: [
    {
      title: "Get the CSV template",
      description:
        "Download the built-in template to see the expected columns, a value column for what to encode and an optional filename column, or open the batch panel and upload a CSV you already have.",
    },
    {
      title: "Upload your spreadsheet",
      description:
        "Drop your CSV in. Each row is read as one code. The tool shows how many rows it found so you can confirm the whole set before generating.",
    },
    {
      title: "Style the whole batch",
      description:
        "Set your colors or gradient, dot and eye shapes, margin and corner radius, and add a centre logo. The shared design previews live and applies to every code in the set.",
    },
    {
      title: "Generate and download",
      description:
        "Hit generate and watch the progress bar fill as each row renders in your browser. When it finishes, download one ZIP containing every named QR code, ready to print or import.",
    },
  ],

  formats: {
    input: ["CSV", "PNG", "JPG", "SVG"],
    output: ["ZIP", "PNG", "SVG"],
  },

  useCases: [
    {
      audience: "E-commerce / Retail",
      title: "A code for every SKU",
      description:
        "Export a product catalogue's links or SKUs as a named ZIP of codes, styled to your packaging, so each product page or reorder link becomes a scannable code on the label or shelf tag.",
    },
    {
      audience: "Event organizer",
      title: "Per-attendee or per-table codes",
      description:
        "Turn an attendee list into a badge code each, or a floor plan into a code per table, all in one branded style, printed onto badges, place cards or table tents in a single run.",
    },
    {
      audience: "Operations / IT",
      title: "Asset & inventory tagging",
      description:
        "Generate a QR for every asset ID or inventory item from your register, named to match, so laptops, equipment and stock can be scanned into your system with a consistent set of labels.",
    },
    {
      audience: "Marketing",
      title: "Campaign links at scale",
      description:
        "Encode a spreadsheet of tracked landing-page URLs (one per store, region or channel) as a matched set of branded codes for flyers, packaging or point-of-sale in different locations.",
    },
  ],

  troubleshooting: [
    {
      problem: "My CSV uploaded but produced fewer codes than I expected.",
      solution:
        "Check for blank rows and that your value column has data on every row you want a code for. Empty values are skipped. Also confirm the file is genuinely comma-separated (re-export as CSV from Excel/Sheets, not XLSX) and that the header row matches the template's columns.",
    },
    {
      problem: "A very large batch is slow or the tab becomes unresponsive.",
      solution:
        "Every code is rendered in your browser, so huge jobs are bound by your device's memory. Split a very large sheet into chunks (for example a few thousand rows at a time), lower the export resolution, or use SVG output, and let one batch finish before starting the next.",
    },
    {
      problem: "Some codes in the ZIP have odd or duplicate file names.",
      solution:
        "File names come from your filename column, so duplicate or empty entries there cause clashes or fallback numbering. Make sure that column is unique per row (e.g. include the SKU or table number) and avoid characters like / \\ : that aren't allowed in file names.",
    },
    {
      problem: "The logo makes some codes hard to scan.",
      solution:
        "Because one logo applies to the whole batch, size it conservatively and raise error correction to Q or H in the style panel. Verify a sample code with your phone before committing to the full run and the print job.",
    },
  ],

  tips: [
    "Start from the built-in CSV template. It shows the exact columns, so your data lines up and every code gets the right filename automatically.",
    "Add a filename column with your SKU, table number or asset ID so the ZIP maps straight onto your existing system with no renaming.",
    "Style and preview a single code first, confirm it scans on a real phone, then run the full batch so your whole set inherits a design you've already verified.",
    "For print runs, choose SVG output. It stays razor-sharp at any label size and keeps the ZIP smaller than high-res PNGs for very large batches.",
    "Test one printed sample from the batch under the real lighting where it'll live before committing to thousands of copies.",
  ],

  security:
    "Your CSV is parsed, every QR code is rendered, and the ZIP is packed entirely in your browser using the canvas and Web APIs on your device. The URLs, SKUs, contact rows and Wi-Fi strings in your spreadsheet, and any logo you add, are never uploaded, logged or stored, and there is no account. Because the whole batch runs client-side there is no server that ever sees your data. Close the tab and nothing remains. Note that the generated codes are static, so each contains the exact value from its row.",

  faq: [
    {
      question: "How do I generate multiple QR codes at once from a spreadsheet?",
      answer:
        "Open the bulk panel, download the CSV template to see the expected columns (a value column for what each code should encode, plus an optional filename column), fill it with your data, and upload it. Every row becomes one QR code. Apply a single shared style, then generate and download the whole set as one ZIP. No pasting values one at a time.",
    },
    {
      question: "How many QR codes can I generate in one batch?",
      answer:
        "There's no fixed limit we impose. You can do tens, hundreds or thousands. The practical ceiling is your device's memory, because every code is rendered in your browser rather than on a server. For very large jobs, split the sheet into chunks of a few thousand rows, lower the resolution, or use SVG output to keep memory use down.",
    },
    {
      question: "Can I use an Excel file, or does it have to be CSV?",
      answer:
        "Upload it as CSV. From Excel or Google Sheets choose 'Save As' or 'Download' and pick CSV (comma-separated values), the tool reads that directly. XLSX files aren't parsed, so re-export as CSV first. The built-in template is already a CSV you can open and edit in any spreadsheet app.",
    },
    {
      question: "Will all the codes share the same colors, logo and shape?",
      answer:
        "Yes, that's the point of bulk mode. You set the style once (colors or gradient, dot and eye shapes, margin, corner radius and a centre logo) and every code in the batch inherits it, so a whole catalogue or event set looks perfectly consistent. To verify, preview and scan a single code before running the full batch.",
    },
    {
      question: "Can each QR code have its own file name?",
      answer:
        "Yes. Add a filename column to your CSV and each exported file is named from it (for example sku-1024.png, table-07.svg or badge-jsmith.png) so the ZIP drops straight into a print template or asset system. Keep those names unique per row and avoid characters like slashes or colons that aren't valid in file names.",
    },
    {
      question: "Is my spreadsheet data uploaded anywhere?",
      answer:
        "No. The CSV is parsed, every code is rendered, and the ZIP is assembled entirely in your browser on your own device. The links, SKUs, contact details and any logo never leave your machine, there's no server round-trip, no account and nothing stored. Close the tab and it's all gone.",
    },
    {
      question: "Are bulk QR codes static or dynamic. Can I edit them later?",
      answer:
        "They're static: each code has its row's data baked directly into the pattern, so it never expires and needs no hosting. The honest trade-off is you can't re-target a printed code afterwards. If you need to change destinations later, encode links you control (your own domain or a link manager) in the value column and redirect them on your side.",
    },
    {
      question: "What formats can I download the batch in?",
      answer:
        "You get a single ZIP containing every code. Choose PNG for a lossless raster set at the resolution you pick, or SVG for scalable vectors that stay crisp at any print size and keep large batches smaller. Either way, files are individually named from your sheet and ready to use immediately.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, CSV upload with a downloadable template, shared batch styling (colors, dot/eye shapes, margin, corner radius), live progress and a single-ZIP download of individually named QR codes.",
    },
    {
      date: "2026-06-25",
      change:
        "Added a centre logo across the whole batch with automatic error-correction guidance, SVG batch output, and a live single-code preview of the shared style before generating.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved handling of very large sheets, clearer skipping of blank rows, and safer file-name sanitisation from the filename column.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default bulkQrCodeGenerator;
