import type { Tool } from "@/types";

/**
 * EPUB to PDF, the Document Studio's ebook converter.
 *
 * Upload an .epub and get a readable, printable PDF entirely in the browser
 * (epubjs opens the archive → each chapter's sanitised HTML is paginated by the
 * shared html2canvas renderer, `epub.epubToPdf`). Every string is written for
 * the real queries people type when they want an ebook as a PDF, and every
 * claim stays honest about what a reflowable-to-fixed conversion can and can't
 * reproduce: EPUB is reflowable, so a PDF is a faithful linearised reading copy,
 * not a byte-perfect reproduction of the publisher's typeset pages.
 */
const epubToPdf: Tool = {
  slug: "epub-to-pdf",
  title: "EPUB to PDF",
  description:
    "Convert an EPUB ebook to a clean, printable PDF in your browser. Chapters are read in order and paginated to A4 or US Letter, text, headings and images intact. Nothing is uploaded, and it's honest about reflow.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "BookOpen",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "EPUB to PDF: Convert an Ebook to PDF Online",
  tagline:
    "Drop an.epub file and get a readable, print-ready PDF in seconds. Chapters are read in their real reading order and paginated to A4 or US Letter, with headings, paragraphs and images preserved. 100% in your browser: your book is never uploaded.",
  longDescription:
    "The GigAI EPUB to PDF converter turns a reflowable ebook into a clean, shareable PDF without an account, an app, or an upload. Drop an.epub file onto the page and the tool opens the ebook archive locally, walks its spine in the exact reading order the author set, sanitises each chapter's HTML, and paginates the whole book into an A4 or US Letter PDF you can print, annotate, email or read on any device. Headings, paragraphs, lists, blockquotes and embedded images render the way they read in an ebook reader, so a novel, a technical manual, a public-domain classic or your own EPUB export comes out as a tidy, continuous document. This is the honest, useful part to understand: EPUB is a reflowable format with no fixed pages, and PDF has fixed pages, so this tool produces a linearised reading copy, not a byte-perfect reproduction of a publisher's typeset layout. Original pagination, embedded fonts, drop caps and intricate CSS won't be reproduced exactly. The content, structure and images are. DRM-protected books can't be opened at all (the archive is encrypted, and this tool never strips protection) so it works with DRM-free EPUBs: your own exports, purchases from stores that sell DRM-free files, Project Gutenberg and Standard Ebooks classics, and manuscripts from writing tools that export EPUB. Everything runs on your device using an EPUB reader and PDF renderer loaded on demand, so an unpublished manuscript or a purchased book never leaves your machine, close the tab and every trace is gone. If you'd rather pull just the words out (for editing, search, or feeding another tool), the sibling EPUB to Text tool extracts plain text instead.",

  ctaText: "Convert to PDF",

  keywords: [
    "epub to pdf",
    "convert epub to pdf",
    "epub to pdf converter",
    "epub to pdf online",
    "ebook to pdf",
    "epub to pdf free",
    "change epub to pdf",
    "epub file to pdf",
    "epub2pdf",
    "epub to pdf browser",
    "convert ebook to pdf online",
    "epub reader to pdf",
  ],

  seo: {
    title: "EPUB to PDF: Convert Ebook to PDF Online Free | GigAI Tools",
    description:
      "Free online EPUB to PDF converter. Turn a DRM-free.epub ebook into a clean, printable A4 or US Letter PDF with chapters in reading order and images intact. 100% in your browser, nothing uploaded, and honest about reflow limits.",
  },

  features: [
    {
      icon: "BookOpen",
      title: "Reads chapters in order",
      description:
        "The tool walks the ebook's spine, the author's real reading order, so chapters, front matter and back matter land in the PDF exactly as they appear in an ebook reader, not shuffled by filename.",
    },
    {
      icon: "Image",
      title: "Keeps text & images",
      description:
        "Headings, paragraphs, lists, blockquotes and embedded images are carried into the PDF, so illustrated books, technical manuals and formatted novels stay readable and complete.",
    },
    {
      icon: "FileCog",
      title: "A4 or US Letter output",
      description:
        "Choose the page size that matches your printer or reading device, and the whole book is paginated cleanly into a fixed-page PDF ready to print or share.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "See the source EPUB rendered in-page before converting, then preview the finished PDF on the result screen. No blind downloads, and no surprises.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "The ebook is opened, read and rendered entirely in your browser. Unpublished manuscripts and purchased books are never uploaded, stored or logged.",
    },
    {
      icon: "Info",
      title: "Honest about reflow",
      description:
        "EPUB has no fixed pages. PDF does. This produces a faithful linearised reading copy (content and images intact) not a byte-perfect clone of the publisher's typeset layout. We say so up front.",
    },
  ],

  benefits: [
    {
      title: "Read your ebooks anywhere",
      description:
        "Turn an EPUB into a PDF that opens in any viewer, prints on any printer, and annotates in tools that don't understand ebook formats. No dedicated reader app required.",
    },
    {
      title: "Your book never leaves your device",
      description:
        "Conversion is fully local, so a purchased book or an unpublished manuscript stays private. There's no server to upload to and nothing for us to see or store.",
    },
    {
      title: "No account, no app, no watermark",
      description:
        "Skip the sign-up walls and watermarked exports of desktop converters. Drop a file, pick a page size, download: a clean PDF with no strings attached.",
    },
    {
      title: "Honest output you can trust",
      description:
        "Instead of promising a perfect layout it can't deliver, the tool tells you exactly what a reflowable-to-fixed conversion preserves, so the PDF meets your expectations.",
    },
  ],

  howTo: [
    {
      title: "Drop your EPUB",
      description:
        "Drag an.epub file onto the page or click to browse. The ebook opens locally in your browser, nothing is uploaded, and you'll see it rendered in the preview.",
    },
    {
      title: "Pick a page size",
      description:
        "Choose A4 or US Letter to match your printer or reading device before you convert.",
    },
    {
      title: "Convert to PDF",
      description:
        "Click Convert to PDF. The tool reads every chapter in order and paginates the whole book into a fixed-page PDF, right on your device.",
    },
    {
      title: "Preview & download",
      description:
        "Check the finished PDF in the result preview, then download it. Convert another ebook whenever you like. The previous one is cleared automatically.",
    },
  ],

  formats: {
    input: ["EPUB"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Reader",
      title: "Print a public-domain classic",
      description:
        "Grab a DRM-free EPUB from Project Gutenberg or Standard Ebooks and turn it into a PDF you can print, mark up, or read on a device that doesn't handle ebooks.",
    },
    {
      audience: "Author / Self-publisher",
      title: "Proof your manuscript",
      description:
        "Export your book to EPUB, convert it here, and get a paginated PDF to proofread on paper or circulate to beta readers who prefer a familiar format.",
    },
    {
      audience: "Student / Researcher",
      title: "Annotate course ebooks",
      description:
        "Convert a DRM-free course EPUB into a PDF so you can highlight, add margin notes, and combine it with other readings in your usual PDF workflow.",
    },
    {
      audience: "Professional",
      title: "Share a manual as PDF",
      description:
        "Turn an EPUB handbook or technical manual into a PDF for colleagues and clients who expect a fixed-page document they can email, print, and archive.",
    },
  ],

  troubleshooting: [
    {
      problem: "My EPUB won't open. It says it can't be read.",
      solution:
        "The most common cause is DRM. Books bought from stores that lock files (and library loans) are encrypted, and this tool never strips protection, so it can't open them. It works with DRM-free EPUBs: your own exports, DRM-free purchases, and classics from Project Gutenberg or Standard Ebooks. A corrupted or non-standard .epub can also fail to open.",
    },
    {
      problem: "The PDF doesn't look exactly like the ebook's layout.",
      solution:
        "That's expected. EPUB is reflowable with no fixed pages. PDF has fixed pages, so the tool produces a linearised reading copy. Content, structure and images are preserved, but the publisher's exact pagination, embedded fonts and intricate CSS are not reproduced. This is a fidelity limit of any reflowable-to-fixed conversion, not a bug.",
    },
    {
      problem: "Some images or one chapter are missing.",
      solution:
        "If a chapter fails to load (a missing internal resource or a malformed section) the tool skips it rather than aborting the whole export, so the rest of the book still converts. Re-exporting the source EPUB from your authoring tool usually resolves broken internal references.",
    },
    {
      problem: "A very large ebook is slow or the browser stalls.",
      solution:
        "Long, image-heavy books are rasterised page by page in memory, which is CPU- and RAM-intensive. Give a big book a little time, close other heavy tabs, and use a desktop browser for the largest files rather than a phone.",
    },
  ],

  tips: [
    "Only DRM-free EPUBs can be converted: use your own exports, DRM-free purchases, or classics from Project Gutenberg and Standard Ebooks.",
    "Pick US Letter for North American printers and A4 for the rest of the world so nothing is cropped when you print.",
    "Preview the source EPUB in-page before converting to confirm it opened correctly and you've got the right book.",
    "Just need the words for editing or search? Use the sibling EPUB to Text tool, which extracts plain text instead of paginating.",
    "For the largest, image-heavy books, convert on a desktop browser and close other tabs so the page has room to work.",
  ],

  security:
    "Your EPUB is opened, read and rendered to PDF entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert purchased books and unpublished manuscripts. The tool never strips DRM. Encrypted books simply can't be opened. Each chapter's HTML is sanitised before rendering to remove scripts and other active content. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my ebook uploaded to a server?",
      answer:
        "No. The EPUB is opened and converted entirely in your browser using an ebook reader and PDF renderer loaded on demand. Your file never leaves your device, so there's nothing for us to store, log or see: it's safe for purchased books and unpublished manuscripts.",
    },
    {
      question: "Can I convert a DRM-protected EPUB?",
      answer:
        "No. Books protected by DRM (most store purchases and all library loans) are encrypted, and this tool never strips protection, so it can't open them. It works with DRM-free EPUBs, your own exports, DRM-free purchases, and public-domain classics from Project Gutenberg or Standard Ebooks.",
    },
    {
      question: "Will the PDF match the ebook's layout exactly?",
      answer:
        "Not exactly, and that's honest. EPUB is reflowable with no fixed pages. PDF has fixed pages. The tool produces a faithful linearised reading copy (chapters in order, text and images intact) but the publisher's original pagination, embedded fonts and intricate CSS aren't reproduced. This is a limit of any reflowable-to-fixed conversion.",
    },
    {
      question: "Are images and chapters preserved?",
      answer:
        "Yes. The tool walks the ebook's spine in its real reading order and carries headings, paragraphs, lists, blockquotes and embedded images into the PDF. If a single chapter fails to load it's skipped so the rest of the book still converts, rather than the whole export failing.",
    },
    {
      question: "Can I choose the page size?",
      answer:
        "Yes. Pick A4 or US Letter before converting so the PDF matches your printer or reading device. The whole book is then paginated cleanly into that fixed page size.",
    },
    {
      question: "Is the text in the PDF selectable?",
      answer:
        "To preserve each chapter's exact on-screen look, pages are rendered as high-resolution images, so the text isn't individually selectable or searchable in the PDF. If you need the plain words instead (for editing, search or reuse) use the sibling EPUB to Text tool, which extracts selectable text.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Once the page and its on-demand libraries have loaded, the conversion itself runs entirely locally, so it works without a connection. The only exception is any resource the book references over the network, which is uncommon in a self-contained EPUB.",
    },
    {
      question: "Is there a file-size or book-length limit?",
      answer:
        "There's no hard limit, but conversion happens in your browser's memory, so very large, image-heavy books are slower and use more RAM. For the biggest files, use a desktop browser and close other heavy tabs to give the page room to work.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release. Drop an.epub, preview the source, choose A4 or US Letter, and export a paginated PDF with chapters in reading order and images intact. Fully client-side.",
    },
    {
      date: "2026-06-24",
      change:
        "Chapters that fail to load are now skipped instead of aborting the whole export, and the DRM / reflow limitations are stated clearly on the convert screen.",
    },
    {
      date: "2026-06-29",
      change:
        "Added an in-page source preview before conversion and a result preview after, plus tuned pagination to reduce mid-paragraph page breaks on image-heavy books.",
    },
  ],

  relatedTools: [
    "epub-to-text",
    "markdown-to-pdf",
    "text-to-pdf",
    "merge-pdf",
  ],
};

export default epubToPdf;
