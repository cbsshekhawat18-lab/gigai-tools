import type { Tool } from "@/types";

/**
 * PDF to HTML: reconstruct clean, semantic HTML from a PDF, in the browser.
 *
 * This is a "read a PDF" tool: pdf.js walks each page's text layer and the
 * engine (`pdfToHtml`, lib/document-tools/convert) groups the items into
 * reading-order paragraphs wrapped in per-page <section> tags. Every string
 * below is written for the searches people type when they want a PDF's text as
 * reusable web markup. It is deliberately NOT shared with the pdf-to-txt or
 * pdf-to-word copy, and no claim outruns what a text-layer reconstruction can
 * do: it recovers words, paragraphs and reading order, NOT pixel-perfect
 * layout, columns, fonts or images.
 */
const pdfToHtml: Tool = {
  slug: "pdf-to-html",
  title: "PDF to HTML",
  description:
    "Turn a PDF into clean, semantic HTML you can paste into a page, a CMS or an email. pdf.js reads each page's text and rebuilds reading-order paragraphs in per-page sections, 100% in your browser, nothing uploaded. Honest about layout: it recovers text structure, not pixel-perfect design.",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "Code",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-21",

  h1: "PDF to HTML, Convert a PDF to Clean Semantic HTML Online",
  tagline:
    "Drop a PDF and get clean, minimal HTML back, reading-order paragraphs wrapped in per-page sections, ready to paste into a web page, a CMS or a newsletter. It reads the PDF's embedded text layer right in your browser, so nothing is ever uploaded. It rebuilds text structure, not pixel-perfect layout: an honest, practical way to get a PDF's content onto the web.",
  longDescription:
    "The GigAI PDF to HTML converter lifts the readable content out of a PDF and rebuilds it as clean, semantic HTML you can actually reuse. Not a screenshot, not a tangle of absolutely-positioned <div>s, but tidy paragraphs grouped page by page. Drop or paste a PDF and pdf.js walks every page's embedded text layer. The engine groups the text items into reading-order lines, joins soft-wrapped lines back into paragraphs, escapes them safely, and wraps each page in a <section data-page> element. You see the result two ways: a rendered preview so you can read it like a web page, and a source view so you can inspect and copy the exact markup. Copy the whole document to your clipboard or download a self-contained.html file named after your PDF, then drop it straight into a page, a CMS body field, a static-site build or an HTML email. It is built for the everyday jobs where you need a PDF's words on the web without retyping: republishing a whitepaper as an article, moving a report's body copy into a CMS, seeding a knowledge-base page from a datasheet, or extracting quotable prose with light structure intact. Because everything runs on your device with a PDF engine loaded on demand, confidential contracts, internal reports and unreleased documents never leave your machine: close the tab and every trace is gone. One honest, important boundary you should read before you rely on it: this reconstructs a PDF's text layer, so it recovers words, paragraphs and reading order. It does NOT reproduce the original columns, tables, fonts, colors, headers, footers or images, and it will not be pixel-perfect. A PDF that is really a scan or a set of page images has no text layer at all and comes back empty. Those need OCR first. When you want the styling rebuilt more aggressively into an editable document, pdf-to-word attempts that instead. When you only want the raw words with no markup, pdf-to-txt strips everything to plain text. Choose PDF to HTML when your target is the web and clean, paste-ready markup is exactly what you need.",

  ctaText: "Convert to HTML",

  keywords: [
    "pdf to html",
    "convert pdf to html",
    "pdf to html converter",
    "pdf to html online",
    "pdf to web page",
    "extract html from pdf",
    "pdf to html free",
    "pdf to semantic html",
    "pdf text to html",
    "pdf to html5",
    "turn pdf into html",
    "pdf to html no upload",
  ],

  seo: {
    title: "PDF to HTML, Convert PDF to Clean HTML Online Free | GigAI Tools",
    description:
      "Free online PDF to HTML converter. Turn a PDF into clean, semantic HTML, reading-order paragraphs in per-page sections you can paste into a page, CMS or email. 100% in your browser, nothing uploaded. Rebuilds text structure, not pixel-perfect layout.",
  },

  features: [
    {
      icon: "Code",
      title: "Clean, semantic markup",
      description:
        "You get tidy paragraphs wrapped in per-page <section data-page> elements. Reusable HTML you can drop into a template, not a screenshot or a maze of positioned <div>s. All text is safely escaped.",
    },
    {
      icon: "Eye",
      title: "Rendered preview & source view",
      description:
        "Flip between a rendered preview that reads like a web page and a raw source view of the exact markup, so you can confirm the structure and copy precisely what you need.",
    },
    {
      icon: "AlignLeft",
      title: "Reading-order paragraphs",
      description:
        "pdf.js reads each page's text layer and the engine unwraps soft-wrapped lines back into real paragraphs in reading order, so the HTML flows the way the document reads, not line by line.",
    },
    {
      icon: "Copy",
      title: "Copy or download .html",
      description:
        "Copy the whole document to your clipboard in one click, or download a self-contained.html file named after your PDF, ready for a CMS body field, a static-site build or an HTML email.",
    },
    {
      icon: "Lock",
      title: "Handles protected PDFs",
      description:
        "If a PDF is password-protected, enter its open password and the tool decrypts it locally to read the text: the password and the file never leave your browser.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing and conversion run entirely in your browser with a PDF engine loaded on demand. Contracts, reports and private documents are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Get a PDF onto the web without retyping",
      description:
        "Republish a whitepaper, report or datasheet as a web article by pasting clean paragraphs straight into your page or CMS, the words and their reading order come across intact.",
    },
    {
      title: "Paste-ready, not screenshot-ready",
      description:
        "Because the output is real, escaped HTML text, it flows, reflows and restyles with your site's CSS: unlike an image of a page, which is frozen, unsearchable and inaccessible.",
    },
    {
      title: "Private by default",
      description:
        "Conversion is local, so confidential PDFs never touch a server. No upload, no account, no retention. Ideal for legal, financial and internal documents.",
    },
    {
      title: "Honest about what it can't do",
      description:
        "It tells you plainly that it rebuilds text structure, not pixel-perfect design, and points scanned files at OCR: instead of promising a perfect clone and silently mangling the layout.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description:
        "Drop a PDF onto the drop zone, click to browse, or paste one from your clipboard. If it's password-protected, enter the open password when prompted.",
    },
    {
      title: "Let it rebuild the HTML",
      description:
        "The tool reads every page's text layer in your browser and reconstructs reading-order paragraphs wrapped in per-page sections, shown in a live preview.",
    },
    {
      title: "Check the preview or the source",
      description:
        "Read the rendered preview to confirm the structure, then switch to the source view to inspect the exact markup you're about to reuse.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the whole HTML document to your clipboard, or download a self-contained .html file named after your PDF. Reset in one click to convert another document.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["HTML", "HTML5"],
  },

  useCases: [
    {
      audience: "Content / Web editor",
      title: "Republish a PDF as an article",
      description:
        "Turn a whitepaper or press release that only exists as a PDF into clean paragraphs you can paste into your CMS and style with the site's own CSS. No manual re-typing.",
    },
    {
      audience: "Knowledge-base author",
      title: "Seed a help page from a datasheet",
      description:
        "Pull the body text of a product datasheet or manual into semantic HTML and drop it into a knowledge-base or docs page as a first draft you can then tidy and expand.",
    },
    {
      audience: "Email / Newsletter marketer",
      title: "Move copy into an HTML email",
      description:
        "Extract the prose from a PDF one-pager into paste-ready paragraphs for an HTML email or landing page, keeping reading order without wrestling PDF layout into inline styles.",
    },
    {
      audience: "Developer / Migrator",
      title: "Bootstrap a static-site page",
      description:
        "Get a PDF's text as escaped, sectioned HTML to seed a static-site or Markdown-adjacent build, then refine the structure in code instead of transcribing by hand.",
    },
  ],

  troubleshooting: [
    {
      problem: "My PDF came back empty or with almost no HTML.",
      solution:
        "That PDF is almost certainly a scan or made of page images, which have no text layer to read, so there's nothing to rebuild into HTML. Run it through the OCR PDF tool first to recognise the characters, then convert it here.",
    },
    {
      problem: "The columns, tables and original layout are gone.",
      solution:
        "That's expected and by design. This reconstructs reading-order paragraphs from the text layer, not the visual layout: columns, tables, fonts and positioning are not reproduced. If you need structure rebuilt more aggressively, try pdf-to-word. If you only want the raw words, use pdf-to-txt.",
    },
    {
      problem: "Paragraph breaks are in odd places.",
      solution:
        "Paragraphs are inferred from blank-line gaps in the text layer, so headers, footers and multi-column flow can split or merge paragraphs. The source view lets you see exactly where the breaks fell so you can adjust the markup after pasting.",
    },
    {
      problem: "It asks for a password.",
      solution:
        "The PDF is encrypted. Enter its open (user) password and conversion runs locally. Nothing is sent anywhere. If you don't have the password, unlock it first with the Unlock PDF tool.",
    },
  ],

  tips: [
    "Use the source view before copying so you can see the exact <section data-page> structure you're pasting into your page.",
    "Only need part of the document? Convert everything, then copy just the paragraphs or the single <section> you want from the source.",
    "The output has no inline styling on purpose. It inherits your site's CSS, so it matches your design once pasted in.",
    "For a scanned PDF, run OCR PDF first, then bring the searchable result back here to rebuild the HTML.",
    "Want the raw words with no tags, or the styling rebuilt into an editable doc? Use pdf-to-txt or pdf-to-word instead of this web-focused converter.",
  ],

  security:
    "Your PDF is parsed and converted to HTML entirely in your browser using a PDF engine loaded on demand. The file is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert contracts, financial statements and confidential documents. All extracted text is HTML-escaped so the output can't carry active content, and password-protected PDFs are decrypted locally, the password never leaves your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The PDF is read and converted to HTML locally in your browser using a PDF engine loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see: it's safe for confidential contracts and internal documents.",
    },
    {
      question: "Is the HTML pixel-perfect. Does it match the PDF exactly?",
      answer:
        "No, and it doesn't pretend to. This reconstructs the PDF's text layer into clean, reading-order paragraphs wrapped in per-page sections. It recovers the words, their order and rough paragraphing. Not the original columns, tables, fonts, colors or images. If you need a faithful visual clone, a PDF is the wrong source for that in the browser. This gives you reusable content markup instead.",
    },
    {
      question: "Why did my PDF come back empty?",
      answer:
        "Because it has no text layer to read. Many PDFs are actually scans or page images: the words are pixels, not characters, so there's nothing to rebuild into HTML. Run the file through the OCR PDF tool first to recognise the text, then convert it here. The tool is honest about that rather than emitting empty or garbled markup.",
    },
    {
      question: "What's the difference between PDF to HTML, PDF to TXT and PDF to Word?",
      answer:
        "PDF to HTML gives you clean, semantic web markup, reading-order paragraphs in per-page sections, ideal when your target is a web page, CMS or email. PDF to TXT strips everything to raw plain text with no markup. PDF to Word tries to rebuild a more richly-structured, editable document. Pick HTML for the web, TXT for the raw words, and Word for an editable file.",
    },
    {
      question: "Will tables and columns be preserved?",
      answer:
        "No. Tables and multi-column layouts are visual arrangements of the text layer, not semantic structure the extractor can recover reliably, so they are flattened into reading-order paragraphs. If tabular structure matters, pdf-to-excel attempts a positional table heuristic instead, though it, too, is a best-effort reconstruction, not a perfect one.",
    },
    {
      question: "Is the exported HTML safe to paste into my site?",
      answer:
        "Yes. All extracted text is HTML-escaped before it goes into the markup, so the output is plain, inert content. No scripts, event handlers or embedded active content are carried over from the PDF. You can paste it into a CMS or template without worrying about injected markup.",
    },
    {
      question: "Can it convert password-protected PDFs?",
      answer:
        "Yes, if you know the open (user) password. Enter it when prompted and the PDF is decrypted locally to read the text. The password and file never leave your browser. If you don't have the password, unlock the PDF first with the Unlock PDF tool.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Once the page and its on-demand PDF engine have loaded, conversion is entirely local, so it keeps working without a connection and your documents stay on your machine.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, drop/paste a PDF and rebuild reading-order paragraphs into clean, semantic HTML wrapped in per-page <section> elements, with a rendered preview, a source view, copy-to-clipboard and a self-contained.html download.",
    },
    {
      date: "2026-06-27",
      change:
        "Added support for password-protected PDFs (decrypted locally) and a clearer empty-result notice that points scanned or image-only PDFs to the OCR PDF tool.",
    },
    {
      date: "2026-07-01",
      change:
        "Improved paragraph grouping to reduce split paragraphs on justified body text, and added a preview/source toggle so you can inspect the exact markup before copying.",
    },
  ],

  relatedTools: ["pdf-to-txt", "pdf-to-word", "html-to-pdf", "markdown-to-pdf"],
};

export default pdfToHtml;
