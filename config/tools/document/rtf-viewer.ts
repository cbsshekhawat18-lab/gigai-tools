import type { Tool } from "@/types";

/**
 * RTF Viewer; open and read Rich Text Format documents in the browser.
 *
 * Drop or paste an.rtf file and the tool renders its readable, formatted text -
 * bold, italic, underline and paragraph breaks. Then lets you export the result
 * as clean HTML or plain TXT. It REUSES the platform's dependency-free RTF
 * parser end-to-end (`rtfToHtml` / `rtfToText` from lib/document-tools/rtf), so
 * there is no duplicated parsing code behind this URL, only unique copy.
 *
 * Honesty (surfaced in the UI, not just here): this is a lightweight reader, not
 * a full RTF renderer. It recovers text plus basic bold/italic/underline and
 * paragraph structure. Tables, images, embedded objects, fonts, colors, tab
 * stops and exotic control words are intentionally dropped. Every string below
 * respects that boundary instead of promising a pixel-perfect Word-grade view.
 */
const rtfViewer: Tool = {
  slug: "rtf-viewer",
  title: "RTF Viewer",
  description:
    "Open and read.rtf (Rich Text Format) files right in your browser. Drop or paste an RTF document and see its formatted text (bold, italic, underline and paragraphs) then export clean HTML or plain text. Nothing is uploaded.",
  category: "document-tools",
  group: "Viewers",
  icon: "FileText",
  accent: "amber",
  status: "live",
  createdAt: "2026-06-24",

  h1: "RTF Viewer. Open & Read Rich Text Format Files Online",
  tagline:
    "Got an.rtf file and no app that opens it cleanly? Drop it here, or paste the raw RTF, and read the formatted text instantly, bold, italic, underline and paragraph breaks preserved. Then export the result as tidy HTML or plain TXT. 100% in your browser, no upload, no account, nothing stored.",
  longDescription:
    "The GigAI RTF Viewer opens Rich Text Format documents, the.rtf files produced by WordPad, TextEdit, older word processors, email clients and countless export buttons: without installing anything or handing the file to a server. Drop an.rtf onto the page or paste the raw RTF markup and the tool parses it entirely on your device, then shows the readable, formatted result: bold, italic and underlined runs are rendered as such, and paragraph breaks are preserved so the document reads the way it was written instead of as a wall of backslash control words. When you have what you need, export it two ways. As clean, sanitised HTML you can drop into a CMS, an email or another editor, or as plain UTF-8 text stripped of all formatting for notes, search indexes or feeding into another tool. You can copy either output to the clipboard, download it as a file, toggle between the rendered preview and the raw RTF source, and reset to open another document in one click. Because everything runs in your browser using a small, purpose-built RTF parser loaded on demand, confidential letters, contracts, résumés and internal memos never leave your machine. There is nothing to upload and nothing is logged. One honest boundary, stated up front: this is a fast reader, not a full RTF rendering engine. It reliably recovers text plus basic bold/italic/underline and paragraph structure, the formatting the vast majority of.rtf files actually use. It does not reproduce tables, embedded images, drawing objects, specific fonts, colors, tab stops or exotic control words. Those are dropped in favour of clean, readable content. If you need the document's exact visual layout, open it in a full word processor. If you only need to read it, extract its text, or move it into HTML, this does that in seconds and keeps it private.",

  ctaText: "Open RTF File",

  keywords: [
    "rtf viewer",
    "open rtf file",
    "rtf reader online",
    "view rtf",
    "rtf to html",
    "rtf to text",
    "read rtf online",
    "rich text format viewer",
    "open rtf without word",
    "rtf file opener",
    "convert rtf to html",
    "extract text from rtf",
  ],

  seo: {
    title: "RTF Viewer. Open & Read Rich Text Format Files Online | GigAI Tools",
    description:
      "Free online RTF viewer. Drop or paste an.rtf file to read its formatted text (bold, italic, underline and paragraphs) then export clean HTML or plain TXT. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "FileText",
      title: "Formatted RTF preview",
      description:
        "See the document's readable text with bold, italic and underline runs rendered and paragraph breaks preserved, the formatting real.rtf files actually use, instead of raw control words.",
    },
    {
      icon: "Code",
      title: "Preview or raw source",
      description:
        "Toggle between the rendered reading view and the raw RTF markup, so you can read the document or inspect exactly what the parser was given.",
    },
    {
      icon: "FileCode2",
      title: "Export clean HTML",
      description:
        "Copy or download the rendered document as sanitised, escaped HTML, safe to paste into a CMS, an email or another editor with the bold/italic/underline structure intact.",
    },
    {
      icon: "FileDown",
      title: "Export plain text",
      description:
        "Strip all formatting and export the document as plain UTF-8 text for notes, search, or feeding into another tool, paragraphs kept as line breaks.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste or type",
      description:
        "Drop an .rtf file, paste raw RTF from your clipboard, or load a built-in sample. However the content arrives, it renders instantly with live character, word and paragraph stats.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing, preview and export all happen in your browser. Confidential letters, résumés, contracts and internal memos are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Read RTF without installing anything",
      description:
        "No Word, no WordPad, no LibreOffice, just open the file in a browser tab and read it. Perfect for a quick look at an.rtf someone emailed you.",
    },
    {
      title: "Move RTF into the modern web",
      description:
        "Export to clean HTML to lift an old RTF letter, template or memo into a CMS, a newsletter or a web editor without retyping it.",
    },
    {
      title: "Keep private documents private",
      description:
        "Résumés, contracts and internal memos are read entirely on your device. There is no server round-trip, so sensitive .rtf files never leave your machine.",
    },
    {
      title: "Get just the text when that's all you need",
      description:
        "One click strips the formatting to plain text you can search, quote, or paste anywhere. No manual clean-up of stray markup.",
    },
  ],

  howTo: [
    {
      title: "Add your RTF",
      description:
        "Drop an .rtf file onto the page, paste the raw RTF markup from your clipboard, or load the built-in sample to see the viewer work in one click.",
    },
    {
      title: "Read the formatted document",
      description:
        "The rendered view shows the text with bold, italic and underline runs and paragraph breaks preserved. Switch to the raw source view any time to inspect the markup.",
    },
    {
      title: "Export HTML or text",
      description:
        "Copy or download the document as clean, sanitised HTML for the web, or as plain UTF-8 text with formatting stripped: whichever you need next.",
    },
    {
      title: "Reset and open another",
      description:
        "Clear the current document and drop in a new one whenever you're done. Nothing is retained between files.",
    },
  ],

  formats: {
    input: ["RTF"],
    output: ["HTML", "TXT"],
  },

  useCases: [
    {
      audience: "Anyone with a stray .rtf",
      title: "Just open and read it",
      description:
        "Someone emailed an.rtf and your default app mangles it or won't open it: drop it here to read the formatted text immediately in the browser.",
    },
    {
      audience: "Content / Marketing",
      title: "Lift old copy into a CMS",
      description:
        "Export a legacy RTF letter, template or memo to clean HTML and paste it straight into your CMS or newsletter tool instead of retyping and reformatting.",
    },
    {
      audience: "Recruiter / HR",
      title: "Preview an RTF résumé",
      description:
        "Candidates still send résumés as .rtf. Open one privately in the browser to read it, then export the plain text for your applicant-tracking notes.",
    },
    {
      audience: "Developer / Data",
      title: "Extract text from RTF",
      description:
        "Pull the readable text out of an.rtf export as plain UTF-8 to index it, quote it, or pipe it into another script. No Office automation required.",
    },
  ],

  troubleshooting: [
    {
      problem: "My file won't load. It says it isn't valid RTF.",
      solution:
        "The viewer checks for the RTF signature (a file starting with {\\rtf). If your file is actually a .doc, .docx or plain text renamed to .rtf, it won't parse. Open it in its real editor and re-save it as genuine Rich Text Format, then try again.",
    },
    {
      problem: "Tables, images or colors from my document are missing.",
      solution:
        "This is a lightweight reader, not a full RTF renderer. It recovers text plus bold, italic, underline and paragraphs on purpose, and drops tables, embedded images, drawing objects, fonts and colors. For the exact visual layout, open the file in a full word processor.",
    },
    {
      problem: "Special characters or accents look wrong.",
      solution:
        "The parser decodes standard escapes and Unicode, defaulting to the Windows-1252 codepage that most RTF files use. A file authored in a different legacy codepage may map a few high-range characters imperfectly. Re-saving it from a modern editor usually fixes it.",
    },
    {
      problem: "The whole document renders as one big paragraph.",
      solution:
        "RTF marks real paragraph breaks with \\par control words, not blank lines. If the source used soft line wraps instead of paragraph breaks, the reader has nothing to split on. This reflects the file's structure rather than a viewer fault.",
    },
  ],

  tips: [
    "No file handy? Load the built-in sample to see how bold, italic, underline and paragraphs render before opening your own.",
    "Export HTML when you're moving the document onto the web, and plain text when you only need the words for notes, search or another tool.",
    "Use the raw-source toggle to sanity-check that a file really is RTF and to see the control words the parser is working from.",
    "The exported HTML is escaped and sanitised by construction, so it's safe to paste into a CMS without dragging along scripts or styling.",
    "Comparing two .rtf files? Export each to text here, or send them straight to the Document Comparer, which reads RTF directly.",
  ],

  security:
    "Your RTF file is parsed, previewed and exported entirely in your browser. It is never uploaded to any server. The parser runs on your device and nothing is stored, logged or transmitted, so confidential letters, résumés, contracts and internal memos are safe to open here. The HTML export is escaped and sanitised by construction, so it can't smuggle scripts into wherever you paste it. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my RTF file uploaded to a server?",
      answer:
        "No. Parsing, the formatted preview and both exports all happen locally in your browser using a small RTF parser loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to open confidential letters, résumés and internal documents.",
    },
    {
      question: "What is an RTF file and what opens it?",
      answer:
        "RTF (Rich Text Format) is a plain-text markup for documents, historically produced by WordPad, TextEdit, Word and many export buttons. Full word processors open it, but they can be heavy or reformat it. This viewer opens it in a browser tab so you can read it, extract its text, or move it into HTML in seconds.",
    },
    {
      question: "What formatting does the viewer preserve?",
      answer:
        "It renders the text with bold, italic and underline runs and preserves paragraph breaks: the formatting the large majority of.rtf files actually use. It honestly does not reproduce tables, embedded images, drawing objects, specific fonts, colors or tab stops. Those are dropped in favour of clean, readable content.",
    },
    {
      question: "Can I convert RTF to HTML or plain text?",
      answer:
        "Yes. Export the rendered document as clean, sanitised HTML: ready to paste into a CMS, email or web editor with the bold/italic/underline structure intact, or as plain UTF-8 text with all formatting stripped, for notes, search indexes or another tool. Copy to the clipboard or download either as a file.",
    },
    {
      question: "Can I paste raw RTF instead of uploading a file?",
      answer:
        "Yes. If you have the raw RTF markup on your clipboard, paste it straight into the tool and it renders immediately, handy when the content came from an email body or another app rather than a saved file.",
    },
    {
      question: "Why does it say my file isn't valid RTF?",
      answer:
        "The viewer verifies the RTF signature, genuine RTF starts with {\\rtf. A.doc,.docx or plain-text file renamed to.rtf will fail this check. Open it in its real editor and re-save it as genuine Rich Text Format, then reload it here.",
    },
    {
      question: "Is the exported HTML safe to paste elsewhere?",
      answer:
        "Yes. The HTML is escaped and sanitised by construction: the parser only ever emits paragraph, bold, italic and underline tags around escaped text, so there are no scripts, event handlers or arbitrary styling to carry along when you paste it into a CMS or email.",
    },
    {
      question: "Does it work offline and with large files?",
      answer:
        "Once the page and its parser have loaded, everything runs locally, so it keeps working without a connection and never sends your document anywhere. The parser is allocation-light and synchronous. Typical letters, résumés and memos render instantly, and even large RTF files parse quickly on your device.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, open.rtf files by drop or paste, render formatted text with bold/italic/underline and paragraphs, toggle a raw-source view, and export clean HTML or plain text with copy, download and reset.",
    },
    {
      date: "2026-06-28",
      change:
        "Added live character, word and paragraph stats, a built-in sample document, and a clearer honesty note about which RTF features the lightweight reader preserves versus drops.",
    },
  ],

  relatedTools: [
    "document-comparer",
    "html-to-pdf",
    "text-to-pdf",
    "markdown-to-pdf",
  ],
};

export default rtfViewer;
