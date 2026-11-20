import type { Tool } from "@/types";

/**
 * HTML to PDF: paste or drop HTML, see it rendered live, export a print-ready PDF.
 *
 * A split-pane HTML editor with a live sandboxed preview that paginates the exact
 * rendered document into an A4/Letter PDF entirely in the browser (DOMPurify ->
 * html2canvas -> jsPDF, via the shared `htmlToPdf` engine). Every string is written
 * for the queries people type when they need an HTML snippet, email, invoice or
 * report page saved as a shareable PDF. The copy is honest that the page is drawn
 * exactly as-is with NO network access, so external assets aren't fetched.
 */
const htmlToPdf: Tool = {
  slug: "html-to-pdf",
  title: "HTML to PDF",
  description:
    "Paste or drop HTML and export a clean, print-ready PDF in your browser. Live sandboxed preview renders your markup exactly as-is with inline CSS, then one click paginates it to A4 or US Letter. Nothing is uploaded and no external assets are fetched.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "CodeXml",
  accent: "sky",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "HTML to PDF, Convert HTML to a Print-Ready PDF Online",
  tagline:
    "Paste an HTML snippet, drop an.html file, or start typing, a live sandboxed preview renders your markup exactly as it will export, then one click paginates it into an A4 or US Letter PDF with the margins you pick. 100% in your browser, never uploaded, no external requests.",
  longDescription:
    "The GigAI HTML to PDF converter turns raw HTML into a polished, shareable PDF without a headless browser, a print-to-PDF hack, or an upload. Paste your markup on the left, a full page, an email template, an invoice, a receipt, a styled report or a fragment copied from your app, and a faithful, sandboxed preview renders it live on the right. Inline CSS and <style> blocks are honoured, so headings, tables, borders, background colors, flex and grid layouts, lists and links render the way your browser draws them. When it looks right, click Download PDF and the same rendered document is paginated into an A4 or US Letter file with the margins you chose, ready to email, print or attach to a ticket. Because the preview is the source of truth, what you see is what the PDF contains. No second render engine, no reflow surprises between editing and export. It's built for the HTML people actually paste: transactional email templates, generated invoices and receipts, dashboard exports, documentation pages, certificates and one-off report snippets. Load a sample to see it work, copy the sanitised HTML to reuse elsewhere, and reset to a blank canvas in one click. Everything runs on your device, the sanitiser (DOMPurify), the renderer (html2canvas) and the PDF writer (jsPDF) are loaded on demand, so confidential templates and internal reports never leave your machine. Close the tab and every trace is gone. Two honest notes worth knowing up front. First, for safety the HTML is sanitised before rendering, so scripts, iframes and event handlers are removed, layout and styling stay, active content does not. Second, this tool has no network access by design: it renders your markup exactly as-is and does NOT fetch external assets. Images, fonts and stylesheets referenced by a remote URL won't load. Inline them as data-URIs (or paste self-contained HTML with a <style> block) and they render perfectly. The styled page is captured as a high-resolution image inside the PDF to preserve the exact look, so that text isn't individually selectable, when you need selectable, searchable body text instead, the sibling Text to PDF tool draws real vector text.",

  ctaText: "Download PDF",

  keywords: [
    "html to pdf",
    "convert html to pdf",
    "html to pdf converter",
    "html to pdf online",
    "html file to pdf",
    "save html as pdf",
    "export html as pdf",
    "html code to pdf",
    "html to pdf free",
    "webpage html to pdf",
    "html email to pdf",
    "html invoice to pdf",
  ],

  seo: {
    title: "HTML to PDF: Convert HTML to PDF Online Free | GigAI Tools",
    description:
      "Free online HTML to PDF converter with a live sandboxed preview. Paste HTML or drop an .html file and export a clean, print-ready PDF with A4/Letter sizes and tunable margins. Inline CSS honoured, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Columns2",
      title: "Live sandboxed preview",
      description:
        "Paste or type HTML on the left and watch a faithful, isolated preview render on the right: the exact document that becomes your PDF, so there are no surprises on export.",
    },
    {
      icon: "Palette",
      title: "Inline CSS & <style> honoured",
      description:
        "Headings, tables, borders, background colors, flex and grid layouts, lists and links render as your browser draws them, so styled templates keep their look in the PDF.",
    },
    {
      icon: "FileCog",
      title: "Page size & margins",
      description:
        "Export to A4 or US Letter and pick cozy, comfortable or wide margins so the output reads cleanly on screen and in print, paginated to a fixed page every time.",
    },
    {
      icon: "FileDown",
      title: "One-click PDF, plus copy HTML",
      description:
        "Download a paginated PDF with a single click, or copy the sanitised HTML to paste into an email or CMS. A blank-canvas reset is always one button away.",
    },
    {
      icon: "ShieldCheck",
      title: "Sanitised & 100% client-side",
      description:
        "HTML is sanitised (scripts, iframes and handlers stripped) then rendered locally. Internal templates and private reports are never uploaded, stored or logged.",
    },
    {
      icon: "WifiOff",
      title: "No network requests",
      description:
        "The page is drawn exactly as-is with no outbound fetches, inline your images and fonts as data-URIs and the render is fully offline and reproducible.",
    },
  ],

  benefits: [
    {
      title: "A template your recipients can actually keep",
      description:
        "Turn an email template, invoice or receipt into a clean PDF for people who need a file, not a webpage, the formatted document, not raw markup.",
    },
    {
      title: "What you see is what you export",
      description:
        "The preview is the source of truth, so the PDF matches the pane exactly. No headless-browser drift, no reflow surprises between editing and downloading.",
    },
    {
      title: "No install, no server, no upload",
      description:
        "Get headless-browser-quality output for everyday HTML without wiring up Puppeteer or a print hack, and without sending confidential markup to a third-party server.",
    },
    {
      title: "Consistent, print-ready pages",
      description:
        "Fixed page size and tuned margins mean the same HTML prints and shares the same way every time, instead of depending on a browser's ad-hoc print dialog.",
    },
  ],

  howTo: [
    {
      title: "Add your HTML",
      description:
        "Paste HTML into the editor, drop an .html or .htm file onto the pane, or load a built-in sample to see the tool work in one click.",
    },
    {
      title: "Check the live preview",
      description:
        "The right pane renders your markup in a sandboxed frame in real time: inline CSS, tables, colors and layouts appear exactly as they'll export.",
    },
    {
      title: "Set page size & margins",
      description:
        "Choose A4 or US Letter and pick your margins so the output reads well on screen and in print before you commit.",
    },
    {
      title: "Download the PDF",
      description:
        "Click Download PDF to save a paginated file, or copy the sanitised HTML to reuse elsewhere. Reset to a blank canvas whenever you want to start over.",
    },
  ],

  formats: {
    input: ["HTML", "HTM"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Developer",
      title: "Export a generated invoice or receipt",
      description:
        "Paste the HTML your app produces for an invoice, receipt or order confirmation and get a pixel-faithful PDF to email or archive: inline the styles and it renders exactly.",
    },
    {
      audience: "Email / Marketing",
      title: "Save a transactional email template",
      description:
        "Turn an HTML email template into a PDF proof for sign-off or the archive, keeping the styled layout without spinning up a rendering service.",
    },
    {
      audience: "Support / Ops",
      title: "Archive a dashboard or report snippet",
      description:
        "Copy a styled report block or dashboard export as HTML and paginate it into a clean PDF for a ticket, a client, or a compliance record.",
    },
    {
      audience: "Educator / Designer",
      title: "Print a certificate or one-off page",
      description:
        "Craft a certificate, coupon or single styled page in HTML with inline CSS and export a print-ready PDF. No design tool or headless browser required.",
    },
  ],

  troubleshooting: [
    {
      problem: "My images, fonts or stylesheets didn't load in the PDF.",
      solution:
        "This tool has no network access by design. It renders your markup exactly as-is and does not fetch external assets. Inline images and fonts as data-URIs (base64) and put your CSS in an inline <style> block or style attributes, then everything renders. Remote <img src>, <link rel=stylesheet> and web fonts by URL will not resolve.",
    },
    {
      problem: "The text in my PDF isn't selectable or searchable.",
      solution:
        "The styled page is captured as a high-resolution image inside the PDF so the look is preserved exactly, which means that text isn't individually selectable. When you need selectable, searchable body text instead of pixel-perfect styling, use the sibling Text to PDF tool, which draws real vector text.",
    },
    {
      problem: "My <script> or interactive element was removed.",
      solution:
        "For safety, the HTML is sanitised before rendering, so scripts, iframes, event handlers and other active content are stripped. Layout and styling are preserved. Anything interactive won't appear in the preview or the PDF: render its final static state instead.",
    },
    {
      problem: "Wide content is clipped at the page edge.",
      solution:
        "Very wide layouts or long unbroken lines can overflow a fixed page width. Switch the page size to US Letter or the margins to 'Wide', constrain your content to a max-width, or add word-wrap/overflow-wrap so it fits the printable area.",
    },
  ],

  tips: [
    "Load a sample first to see how tables, colors and layout render before pasting your own HTML.",
    "Inline everything: base64 data-URI images and an inline <style> block make the render fully offline and reproducible.",
    "Give your content a sensible max-width (around 800px) so it maps cleanly onto the fixed page and nothing clips.",
    "Use US Letter or 'Wide' margins for dense tables or long lines so nothing runs off the page edge.",
    "Need selectable, searchable text instead of a pixel-perfect image? Use the Text to PDF tool for real vector text.",
  ],

  security:
    "Your HTML is sanitised, previewed and rendered to PDF entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert internal templates, invoices and confidential reports. Before rendering, the markup is sanitised with DOMPurify to strip scripts, iframes and event handlers, and the tool makes no outbound network requests, so no data leaks through remote asset loads. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my HTML uploaded to a server?",
      answer:
        "No. Sanitising, the live preview and the PDF render all happen locally in your browser using libraries loaded on demand. Your markup never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential templates and internal reports.",
    },
    {
      question: "Will my CSS and styling be preserved?",
      answer:
        "Yes, for CSS the browser can apply without a network call. Inline styles, style attributes and <style> blocks are honoured, so tables, borders, background colors, flex and grid layouts and typography render the way your browser draws them. External stylesheets loaded by URL won't resolve. Paste your CSS inline for a faithful result.",
    },
    {
      question: "Why don't my images or web fonts show up?",
      answer:
        "The tool has no network access by design and renders your HTML exactly as-is, so it does not fetch remote images, fonts or stylesheets. Inline images and fonts as base64 data-URIs and they render perfectly. Anything referenced by a remote URL will be blank.",
    },
    {
      question: "Is the text in the exported PDF selectable?",
      answer:
        "The styled page is captured as a high-resolution image inside the PDF to preserve the exact look, so that text isn't individually selectable or searchable. If you need selectable, searchable body text instead, use the sibling Text to PDF tool, which draws real vector text (with a trade-off in styling).",
    },
    {
      question: "Can I choose the page size and margins?",
      answer:
        "Yes. Export to A4 or US Letter and pick cozy, comfortable or wide margins. The preview reflects your page choice so you can confirm the layout before downloading, and the output is paginated to a fixed page every time.",
    },
    {
      question: "Are scripts and interactive elements kept?",
      answer:
        "No. For safety the HTML is sanitised before rendering, which removes scripts, iframes, event handlers and other active content. Static layout and styling are preserved, render the final state you want to capture, since anything interactive won't appear.",
    },
    {
      question: "Can I drop an .html file or paste from my clipboard?",
      answer:
        "Both. Drop an .html or .htm file onto the editor, paste HTML straight from your clipboard, or just start typing. However your markup arrives it's fully editable in place before you export.",
    },
    {
      question: "How is this different from printing to PDF from a browser?",
      answer:
        "A browser's print dialog depends on its ad-hoc page rules and often adds headers, footers and inconsistent margins, and it may fetch remote assets. This tool renders a sandboxed preview and paginates it into a fixed A4/Letter file with the margins you chose, offline, consistent every time, and matching the preview exactly.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: split-pane HTML editor with a live sandboxed preview, one-click PDF export with A4/Letter page sizes and tunable margins, drop/paste/type input, copy-sanitised-HTML, samples and reset.",
    },
    {
      date: "2026-06-24",
      change:
        "Added inline word/character/line stats, clearer honesty notes about no-network asset loading and image-rendered vs. selectable text, and improved sandbox isolation of the preview frame.",
    },
    {
      date: "2026-06-29",
      change:
        "Tuned pagination and margin presets to reduce clipping on wide tables and long lines, and hardened DOMPurify sanitisation of pasted markup.",
    },
  ],

  relatedTools: [
    "markdown-to-pdf",
    "text-to-pdf",
    "pdf-to-html",
    "merge-pdf",
  ],
};

export default htmlToPdf;
