import type { Tool } from "@/types";

/**
 * PDF to PowerPoint (PPTX), Document Studio "Convert from PDF" tool.
 *
 * Turns a PDF into a .pptx deck by rendering every page to a high-resolution
 * image and placing one image, full-bleed, on its own slide. This is an HONEST
 * best-effort converter: pdf.js rasterises each page (`pdfToImages`) and a
 * minimal Office Open XML package is zipped in the browser (fflate) to produce
 * a real, PowerPoint/Keynote/Google-Slides-openable .pptx. Every string below
 * is written for this exact job: nothing is shared with the excel/markdown
 * converter copy, and the limitation (image slides, not editable text/shapes)
 * is stated plainly rather than glossed over.
 */
const pdfToPpt: Tool = {
  slug: "pdf-to-ppt",
  title: "PDF to PowerPoint",
  description:
    "Turn a PDF into a PowerPoint (.pptx) deck in your browser, one slide per page, rendered as a crisp full-bleed image. Great for dropping a report or handout straight into a presentation. 100% on-device, nothing uploaded. (Slides are page images, not editable text.)",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "Presentation",
  accent: "orange",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "PDF to PowerPoint: Convert PDF to PPTX Online",
  tagline:
    "Drop a PDF and get a.pptx deck with one slide per page, each rendered as a high-resolution, full-bleed image. Pick the resolution and slide size, preview every slide, then download a file that opens straight in PowerPoint, Keynote or Google Slides. 100% in your browser. Your PDF is never uploaded.",
  longDescription:
    "PDF to PowerPoint takes a PDF and builds a genuine.pptx presentation on your device. No upload, no sign-up, no add-in. Each page of the PDF is rendered to a sharp image with the pdf.js engine and placed, edge to edge, on its own slide, so the deck mirrors your document page for page. The result is a real Office Open XML package (the same.pptx format PowerPoint saves) zipped together in the browser, so it opens cleanly in Microsoft PowerPoint, Apple Keynote and Google Slides. It is the fastest way to get a report, a one-pager, a poster, a scanned handout or a set of exported design boards into a slide deck you can present from, annotate over, or fold into a larger presentation. Before you download you can preview every slide in a live grid, choose the render resolution (standard for small files, high for text-heavy pages that must stay legible when projected), and pick a 16:9 or 4:3 slide size to match your template. Everything runs locally using pdf.js and an in-browser zip step loaded on demand, so confidential decks, unreleased reports and internal documents never leave your machine, close the tab and nothing remains. One honest, important note: because each slide is a picture of the PDF page, the text on the slide is not editable, selectable or searchable, and there are no native PowerPoint shapes, tables or placeholders to restyle. This is the right, reliable trade-off for faithfully reproducing a PDF's exact layout in a deck. A true PDF-to-editable-slides conversion that reconstructs text boxes and shapes is not something any tool can do reliably in the browser, and we won't pretend otherwise. If you instead need to extract the words to reuse, the sibling PDF to Text tool pulls the selectable text out, and PDF to Excel lifts tabular data.",

  ctaText: "Convert to PowerPoint",

  keywords: [
    "pdf to powerpoint",
    "pdf to pptx",
    "convert pdf to powerpoint",
    "pdf to ppt",
    "pdf to powerpoint converter",
    "pdf to slides",
    "pdf to presentation",
    "pdf to pptx online",
    "pdf to powerpoint free",
    "pdf page to slide",
    "convert pdf to slides",
    "pdf to keynote",
  ],

  seo: {
    title: "PDF to PowerPoint, Convert PDF to PPTX Online Free | GigAI Tools",
    description:
      "Free online PDF to PowerPoint converter. Turn each PDF page into a slide as a high-resolution image and download a real.pptx that opens in PowerPoint, Keynote and Google Slides. Choose resolution and 16:9 or 4:3. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Presentation",
      title: "One slide per page",
      description:
        "Every PDF page becomes its own slide, rendered full-bleed so the deck mirrors your document exactly. Page one is slide one, all the way through.",
    },
    {
      icon: "Images",
      title: "Live slide-by-slide preview",
      description:
        "See a thumbnail of every rendered slide before you download, so you can confirm the pages, order and clarity are right. No blind conversion.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Resolution & slide size",
      description:
        "Choose standard or high render resolution to balance file size against legibility, and pick a 16:9 or 4:3 slide to match your presentation template.",
    },
    {
      icon: "FileDown",
      title: "Real, openable .pptx",
      description:
        "The output is a genuine Office Open XML package built in your browser. It opens cleanly in Microsoft PowerPoint, Apple Keynote and Google Slides.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Rendering and the .pptx zip step both run on your device using pdf.js loaded on demand. Confidential and unreleased documents are never uploaded, stored or logged.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, pick or paste",
      description:
        "Drag a PDF onto the tool, browse for it, or paste it from the clipboard, then reset and convert another in a single click.",
    },
  ],

  benefits: [
    {
      title: "Present straight from a PDF",
      description:
        "Skip the copy-paste-into-slides busywork. Get a report, poster or handout into a deck you can project, present and annotate over in seconds.",
    },
    {
      title: "Pixel-faithful to the original",
      description:
        "Because each slide is an image of the page, charts, fonts, columns and branding land exactly as they appear in the PDF. No reflow, no broken layout.",
    },
    {
      title: "Private by design",
      description:
        "Your PDF is rendered and packaged entirely in the browser, so confidential decks and internal reports never touch a server. Nothing is uploaded or retained.",
    },
    {
      title: "Fold PDF pages into a bigger deck",
      description:
        "Convert once, then drag the image slides into an existing presentation to reuse a page, an appendix or an exported design board without recreating it.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description:
        "Drop a PDF onto the tool, click to browse, or paste it from your clipboard. It's read privately in your browser. Never uploaded.",
    },
    {
      title: "Choose resolution & slide size",
      description:
        "Pick standard or high resolution and a 16:9 or 4:3 slide. Use high resolution for text-heavy pages that must stay sharp on a projector.",
    },
    {
      title: "Preview the slides",
      description:
        "Every page is rendered to a thumbnail so you can confirm the pages, order and clarity before you commit to the download.",
    },
    {
      title: "Download the .pptx",
      description:
        "Click Convert to PowerPoint to build the deck in your browser and save a .pptx that opens in PowerPoint, Keynote or Google Slides.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PPTX", "PowerPoint"],
  },

  useCases: [
    {
      audience: "Consultant / Analyst",
      title: "Drop a report into a deck",
      description:
        "Turn a polished PDF report into slides you can present from, or paste selected pages into a client presentation without rebuilding the charts.",
    },
    {
      audience: "Teacher / Trainer",
      title: "Project handouts and worksheets",
      description:
        "Convert a PDF handout, worksheet or scanned page set into a slide deck to project in class or share as a walk-through presentation.",
    },
    {
      audience: "Designer",
      title: "Show exported boards as slides",
      description:
        "Export design boards or a portfolio to PDF, convert to.pptx, and present them full-bleed. Every layout stays exactly as you designed it.",
    },
    {
      audience: "Event / Ops",
      title: "Turn a one-pager into a title slide",
      description:
        "Drop a flyer, poster or agenda PDF into a deck to use as a full-bleed title or section slide in a larger event presentation.",
    },
  ],

  troubleshooting: [
    {
      problem: "The text on my slides isn't editable or selectable.",
      solution:
        "By design. Each slide is a high-resolution image of the PDF page, which preserves the exact layout but means the text is a picture, not editable PowerPoint text. If you need the words back, use the sibling PDF to Text tool to extract selectable text, or PDF to Excel for tables.",
    },
    {
      problem: "A text-heavy slide looks slightly soft when projected.",
      solution:
        "Switch the resolution from Standard to High and re-convert. High renders each page at a larger pixel size so small text stays crisp on a big screen, at the cost of a larger .pptx file.",
    },
    {
      problem: "There are white bars beside my slide image.",
      solution:
        "The page is fitted inside the chosen slide size while keeping its aspect ratio, so a portrait PDF on a 16:9 slide will have side margins. Switch to the 4:3 slide, or accept the letterboxing. The full page is always visible and never cropped.",
    },
    {
      problem: "My PDF is password-protected and won't open.",
      solution:
        "Encrypted PDFs must be unlocked before conversion. Use the sibling Unlock PDF tool to remove the password (with the owner's permission), then drop the unlocked file here.",
    },
  ],

  tips: [
    "Use High resolution for pages with small text, footnotes or dense tables so they stay legible when projected.",
    "Pick the 4:3 slide size for portrait PDFs to reduce the side letterboxing you get on a 16:9 slide.",
    "Standard resolution keeps the.pptx small: ideal for image-light pages or when you'll email the deck.",
    "Need the actual words instead of a picture? Use PDF to Text to pull selectable text, or PDF to Excel for tables.",
    "Convert once, then drag the image slides into an existing deck to reuse a single page without redoing it.",
  ],

  security:
    "Your PDF is rendered to images and packaged into a.pptx entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert confidential reports, unreleased decks and internal documents. The rendering engine and zip step are loaded on demand and run on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The PDF is rendered to images and zipped into a.pptx entirely in your browser using pdf.js and an in-browser packaging step loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential reports and internal decks.",
    },
    {
      question: "Will the text in my slides be editable?",
      answer:
        "No, and this is the key honest limitation: each slide is a high-resolution image of the PDF page, so the text is a picture rather than editable PowerPoint text. This is the reliable way to reproduce a PDF's exact layout in a deck. If you need the words to reuse, use the PDF to Text tool to extract selectable text, or PDF to Excel for tabular data.",
    },
    {
      question: "Does the .pptx open in PowerPoint, Keynote and Google Slides?",
      answer:
        "Yes. The output is a genuine Office Open XML (.pptx) package, the same format PowerPoint saves, so it opens cleanly in Microsoft PowerPoint, Apple Keynote and Google Slides. Each page shows up as its own full-bleed image slide.",
    },
    {
      question: "How many slides will I get?",
      answer:
        "One slide per PDF page, in order. A 12-page PDF becomes a 12-slide deck, with page one as slide one, so the presentation mirrors your document exactly.",
    },
    {
      question: "Which resolution and slide size should I choose?",
      answer:
        "Use Standard resolution for image-light pages and smaller files, and High for text-heavy pages that must stay sharp on a projector. Pick 16:9 for widescreen templates or 4:3 for classic slides and portrait PDFs, which fit 4:3 with less letterboxing.",
    },
    {
      question: "Can it convert a password-protected PDF?",
      answer:
        "Not directly. An encrypted PDF has to be unlocked first. Use the sibling Unlock PDF tool to remove the password (with the owner's permission), then drop the unlocked file here to convert it.",
    },
    {
      question: "Why is there white space around some slides?",
      answer:
        "Each page is fitted inside the chosen slide size while keeping its aspect ratio, so a page that doesn't match the slide's shape (for example a portrait PDF on a 16:9 slide) is letterboxed with margins. The whole page is always shown and never cropped. Switching to 4:3 reduces the margins for portrait pages.",
    },
    {
      question: "Is there a page limit or file-size cap?",
      answer:
        "There's no hard limit, but everything runs in your browser's memory, so very large PDFs (hundreds of pages) at High resolution can be slow and memory-hungry. If you hit a wall, use Standard resolution or split the PDF into smaller parts first.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, PDF to.pptx with one full-bleed image slide per page, a live slide-by-slide preview, standard/high render resolution, 16:9 / 4:3 slide sizes, and a genuine Office Open XML package built in the browser.",
    },
    {
      date: "2026-06-24",
      change:
        "Added aspect-ratio-preserving fit so pages are letterboxed instead of stretched, plus a clearer honesty note that slides are page images, not editable text, with pointers to PDF to Text and PDF to Excel.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved High-resolution sharpness for text-heavy pages and reduced peak memory during conversion of longer PDFs.",
    },
  ],

  relatedTools: ["pdf-to-txt", "pdf-to-excel", "excel-to-pdf", "unlock-pdf"],
};

export default pdfToPpt;
