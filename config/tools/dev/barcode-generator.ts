import type { Tool } from "@/types";

/**
 * Barcode Generator: a client-side 1D barcode studio. It renders CODE128,
 * CODE39, EAN-13/8, UPC-A, ITF-14, MSI, pharmacode and Codabar live as you
 * type, validates every value against its symbology's real rules, and exports
 * crisp PNG or infinitely-scalable SVG. All copy is unique to barcode
 * generation and its retail/logistics/pharma use cases, written to rank for
 * the exact queries people type when they need a scannable barcode fast.
 */
const barcodeGenerator: Tool = {
  slug: "barcode-generator",
  title: "Barcode Generator",
  description:
    "Generate scannable 1D barcodes (CODE128, EAN-13, UPC-A, CODE39, ITF-14, MSI, pharmacode and Codabar) live in your browser, with per-format validation and PNG or SVG export. Nothing is uploaded.",
  category: "developer-tools",
  icon: "ScanBarcode",
  accent: "amber",
  status: "live",
  createdAt: "2026-06-24",

  h1: "Barcode Generator: Create CODE128, EAN-13 & UPC Barcodes Online",
  tagline:
    "Type a value, pick a symbology, and get a scannable barcode instantly. We validate against each format's real rules, render live as you type, and export sharp PNG or vector SVG: all client-side, nothing uploaded.",
  longDescription:
    "The GigAI Barcode Generator is a desktop-grade barcode studio that runs entirely in your browser. Choose from nine of the world's most-used 1D symbologies (CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, MSI, pharmacode and Codabar) and watch the barcode redraw live on every keystroke and every option change. What separates it from the free barcode sites that hand you a broken image is real, per-format validation: EAN-13 must be 12–13 digits, UPC-A 11–12, pharmacode a number between 3 and 131070, Codabar restricted to its allowed character set, and when a value doesn't fit, we tell you exactly what the format expects instead of silently rendering garbage that no scanner will read. Tune bar width, height, the human-readable text and its font size, then export a pixel-perfect PNG for a document or a resolution-independent SVG for print, labels and packaging that stay razor-sharp at any size. Because rendering happens locally on a canvas in your own tab, your SKUs, GTINs, batch numbers and internal identifiers are never uploaded, stored or logged, making it safe for product data you can't send to a random server.",

  ctaText: "Generate a barcode",

  keywords: [
    "barcode generator",
    "code128 generator",
    "ean-13 barcode generator",
    "upc barcode generator",
    "generate barcode online",
    "code39 barcode",
    "itf-14 generator",
    "barcode svg download",
    "barcode png",
    "free barcode maker",
    "sku barcode generator",
    "codabar generator",
  ],

  seo: {
    title:
      "Barcode Generator: CODE128, EAN-13, UPC & SVG/PNG Online | GigAI Tools",
    description:
      "Free online barcode generator. Create scannable CODE128, EAN-13, EAN-8, UPC-A, CODE39, ITF-14, MSI, pharmacode and Codabar barcodes, with live preview, per-format validation and PNG/SVG export, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "ScanBarcode",
      title: "Nine 1D symbologies",
      description:
        "CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, MSI, pharmacode and Codabar: the formats retail, logistics and pharma actually scan, all from one control.",
    },
    {
      icon: "ShieldCheck",
      title: "Real per-format validation",
      description:
        "Each symbology enforces its own rules (digit counts, allowed characters, pharmacode range) and tells you exactly what's wrong instead of rendering an unscannable image.",
    },
    {
      icon: "Zap",
      title: "Live preview as you type",
      description:
        "The barcode redraws on every keystroke and every option change, so you see a scannable result immediately without hunting for a 'Generate' button.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Tune bars & text",
      description:
        "Adjust bar width, height, whether the human-readable value shows, and its font size: dial in a barcode that fits your label, box or document.",
    },
    {
      icon: "Download",
      title: "PNG and vector SVG export",
      description:
        "Download a crisp PNG for docs and screens, or a resolution-independent SVG that stays sharp on packaging and print at any size.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Barcodes render on a local canvas in your tab. Your SKUs, GTINs and batch numbers are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Never ship an unscannable barcode",
      description:
        "Format-aware validation catches a wrong digit count or an illegal character before you print a thousand labels, so what leaves the tool actually scans at the till.",
    },
    {
      title: "Print-perfect at any size",
      description:
        "Export SVG and the bars stay mathematically sharp whether the barcode ends up on a shelf tag or a shipping carton. No blurry upscaled raster.",
    },
    {
      title: "Fast enough for bulk work",
      description:
        "Live rendering and one-click PNG/SVG export make it quick to knock out a batch of product or asset codes without a spreadsheet plugin or install.",
    },
    {
      title: "Private by design",
      description:
        "Because everything runs locally, you can encode confidential internal identifiers and unreleased SKUs without any of them touching a server.",
    },
  ],

  howTo: [
    {
      title: "Pick a symbology",
      description:
        "Choose the format your scanner or standard needs, CODE128 for general use, EAN-13/UPC for retail, ITF-14 for cartons, pharmacode for pharma.",
    },
    {
      title: "Enter your value",
      description:
        "Type or paste the data to encode. If it doesn't fit the format's rules, a clear message tells you exactly what to change.",
    },
    {
      title: "Style the barcode",
      description:
        "Set bar width and height, toggle the human-readable text, and adjust its font size until it fits your label or document.",
    },
    {
      title: "Download PNG or SVG",
      description:
        "Export a PNG for screens and documents, or an SVG for print and packaging that stays crisp at any scale. Copy the image with one click too.",
    },
  ],

  formats: {
    input: ["Text", "Numbers"],
    output: ["PNG", "SVG"],
  },

  useCases: [
    {
      audience: "Retail / e-commerce",
      title: "Print product barcodes",
      description:
        "Turn a GTIN into an EAN-13 or UPC-A barcode for shelf tags and packaging, or use CODE128 for internal SKUs that need to scan at the register.",
    },
    {
      audience: "Warehouse / logistics",
      title: "Label cartons and pallets",
      description:
        "Generate ITF-14 codes for shipping cases or CODE128 asset tags, export SVG, and drop them straight into a label template at full resolution.",
    },
    {
      audience: "Pharma / lab",
      title: "Encode pack and batch numbers",
      description:
        "Produce compliant pharmacode barcodes within the 3–131070 range for medication packaging, with validation that flags out-of-range values before print.",
    },
    {
      audience: "Developer / maker",
      title: "Test scanner integrations",
      description:
        "Quickly mint valid CODE39, Codabar or MSI barcodes to test a scanner, POS flow or inventory app without touching a paid label service.",
    },
  ],

  troubleshooting: [
    {
      problem: "My EAN-13 or UPC won't render.",
      solution:
        "These formats accept digits only and a fixed length: EAN-13 needs 12 or 13 digits, EAN-8 needs 7 or 8, and UPC-A needs 11 or 12. Give 12 (EAN-13) or 11 (UPC-A) digits and the correct check digit is calculated for you. Supply the full length to control it yourself.",
    },
    {
      problem: "A scanner can't read my printed barcode.",
      solution:
        "Increase the bar width for more physical resolution, keep the quiet-zone margins intact, and print in pure black on white. For print, export SVG rather than upscaling a PNG so the bar edges stay crisp.",
    },
    {
      problem: "Pharmacode says the value is out of range.",
      solution:
        "Pharmacode encodes a single number from 3 to 131070. Values below 3, above 131070, or containing non-digits are rejected by the standard: pick a number inside that window.",
    },
    {
      problem: "The human-readable text is too big or missing.",
      solution:
        "Toggle 'Show value' to display or hide the text under the bars, and use the font-size control to size it for your label. Some symbologies (like pharmacode) are bars-only by design.",
    },
  ],

  tips: [
    "Use CODE128 when you're not bound to a retail standard, it's compact and encodes any ASCII, including letters and symbols.",
    "Export SVG for anything that gets printed or resized. Keep PNG for quick drops into docs, slides and chats.",
    "For EAN-13 and UPC-A, supply one digit short (12 and 11) and let the tool compute the check digit automatically.",
    "Bump the bar width before printing small labels. Thin bars are the most common cause of failed scans.",
    "Leave the quiet-zone margin in place. Scanners need that blank space on either side to lock on.",
  ],

  security:
    "Barcodes are rendered entirely in your browser on a local canvas. Nothing is uploaded to any server. Your values are never stored, logged or transmitted, so you can safely encode confidential SKUs, GTINs, batch numbers and internal identifiers. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Are my barcode values uploaded to a server?",
      answer:
        "No. Every barcode is generated locally in your browser by drawing to a canvas on your own device. Your values (SKUs, GTINs, batch or asset numbers) never leave your machine, so there is nothing for us to store, log or see. It is safe to encode confidential product data.",
    },
    {
      question: "Which barcode format should I use?",
      answer:
        "Use CODE128 for general-purpose alphanumeric data (internal SKUs, asset tags), it's compact and encodes any ASCII. Use EAN-13 or UPC-A for retail products that scan at a till, EAN-8 for very small packages, ITF-14 for shipping cartons, pharmacode for pharmaceutical packaging, and CODE39, Codabar or MSI where a specific legacy system requires them.",
    },
    {
      question: "What's the difference between PNG and SVG export?",
      answer:
        "PNG is a raster image, great for documents, slides and screens at the size you generate it. SVG is a vector image that stays perfectly sharp at any scale, which makes it the right choice for print, labels and packaging where the barcode may be resized. If in doubt for anything printed, choose SVG.",
    },
    {
      question: "Do I need to include the check digit for EAN-13 or UPC?",
      answer:
        "You can, but you don't have to. Provide 12 digits for EAN-13 (or 11 for UPC-A) and the correct final check digit is calculated automatically. If you supply the full 13 (or 12) digits, your check digit is used as-is: handy when you're reproducing an existing code.",
    },
    {
      question: "What is a pharmacode and what values does it accept?",
      answer:
        "Pharmacode (Pharmaceutical Binary Code) is a barcode used on medication packaging that encodes a single integer between 3 and 131070. It has no human-readable digits and is designed to be read reliably at high speed on a packaging line. Values outside that range or containing non-digits are rejected.",
    },
    {
      question: "Will these barcodes actually scan?",
      answer:
        "Yes. Each value is validated against its symbology's rules and encoded with correct check digits and quiet zones, so the output is standards-compliant. For reliable physical scanning, print in solid black on white, keep the margins, and increase the bar width for small labels or use the SVG export to avoid blur.",
    },
    {
      question: "Can I generate barcodes with letters, not just numbers?",
      answer:
        "Yes. CODE128 encodes the full ASCII set including letters and symbols, and CODE39 supports A–Z, 0–9 and a handful of symbols. The purely numeric standards (EAN, UPC, ITF-14, MSI and pharmacode) accept digits only, which the validator enforces.",
    },
    {
      question: "Is there a limit on how many barcodes I can make?",
      answer:
        "No. The tool is free and runs entirely in your browser with no account, no watermark and no cap. Generate and export as many PNG or SVG barcodes as you need.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, nine 1D symbologies with live preview, per-format validation, adjustable bar width/height and human-readable text, plus PNG and SVG export.",
    },
    {
      date: "2026-06-28",
      change:
        "Added font-size control for the human-readable value, copy-image support, and shareable links that restore the format and options.",
    },
    {
      date: "2026-07-02",
      change:
        "Sharper SVG export, clearer validation messages for EAN/UPC digit counts, and a sample-value empty state for each format.",
    },
  ],

  relatedTools: ["qr-code-generator", "uuid-generator", "nanoid-generator", "json-formatter"],
};

export default barcodeGenerator;
