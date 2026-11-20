import type { Tool } from "@/types";

/**
 * Markdown to PDF, the flagship converter of the GigAI Document Studio.
 *
 * A split-pane Markdown editor with a live GitHub-flavoured preview that turns
 * notes, READMEs, changelogs and docs into a clean, printable PDF entirely in
 * the browser (marked -> sanitised HTML -> jsPDF/html2canvas render). Every
 * string below is written for the exact queries people type when they need a
 * README or a set of notes as a shareable PDF. Nothing is shared with the
 * txt/HTML/CSV copy, and no claim outruns what the client-side renderer does.
 */
const markdownToPdf: Tool = {
  slug: "markdown-to-pdf",
  title: "Markdown to PDF",
  description:
    "Write or paste Markdown and export a clean, printable PDF in your browser. Live GitHub-flavoured preview with headings, tables, code blocks and task lists, page size, margins and theme included. Nothing is uploaded.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "FileText",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-12",

  h1: "Markdown to PDF, Convert Markdown to a Clean PDF Online",
  tagline:
    "Paste a README, drop a.md file, or start typing, a live GitHub-flavoured preview renders as you go, then one click exports a print-ready PDF with real headings, tables, fenced code and task lists. Choose the page size, margins and theme. 100% in your browser, never uploaded.",
  longDescription:
    "The GigAI Markdown to PDF converter is a desktop-grade editor that turns Markdown into a polished, shareable PDF without a build step, a CLI, or an upload. Type or paste your Markdown on the left and a faithful GitHub-flavoured preview renders live on the right, headings, bold and italic, ordered and unordered lists, task lists, blockquotes, fenced code blocks with monospace formatting, horizontal rules, links, images and pipe tables all render the way you expect from a README. When it looks right, click Download PDF and the same rendered document is paginated into an A4 or US Letter file with the margins and theme you picked, ready to email, print or attach to a ticket. Because the preview is the source of truth, what you see is what the PDF contains. No surprise reflow between editor and export. It handles the everyday Markdown people actually write: project READMEs, release notes and changelogs, meeting notes, design docs, API notes, study notes and interview take-homes. You can load a sample to see it work, copy the rendered HTML if you'd rather paste it elsewhere, and reset to a blank canvas in one click. Everything runs on your device using a Markdown parser and PDF renderer loaded on demand, so confidential docs, internal READMEs and unreleased notes never leave your machine, close the tab and every trace is gone. One honest note: styled Markdown (tables, code, colors) is rendered as a high-resolution image inside the PDF to preserve the exact look, so that text isn't individually selectable. When you need selectable, searchable body text instead of pixel-perfect styling, the sibling Text to PDF tool draws real vector text.",

  ctaText: "Download PDF",

  keywords: [
    "markdown to pdf",
    "md to pdf",
    "convert markdown to pdf",
    "markdown to pdf converter",
    "readme to pdf",
    "markdown pdf online",
    "github markdown to pdf",
    "gfm to pdf",
    "export markdown as pdf",
    "markdown to pdf free",
    "save markdown as pdf",
  ],

  seo: {
    title: "Markdown to PDF, Convert MD to PDF Online Free | GigAI Tools",
    description:
      "Free online Markdown to PDF converter with a live GitHub-flavoured preview. Turn READMEs, notes and docs into a clean printable PDF with headings, tables and code: page size, margins and theme included. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Columns2",
      title: "Live split-pane preview",
      description:
        "Write or paste Markdown on the left and watch a faithful GitHub-flavoured preview render on the right as you type, the same document that becomes your PDF, so there are no surprises on export.",
    },
    {
      icon: "Table",
      title: "Full GitHub-flavoured Markdown",
      description:
        "Headings, bold/italic, ordered and bulleted lists, task lists, blockquotes, fenced code blocks, horizontal rules, links, images and pipe tables all render: the everyday syntax a real README uses.",
    },
    {
      icon: "FileCog",
      title: "Page size, margins & theme",
      description:
        "Export to A4 or US Letter, pick comfortable, cozy or wide margins, and choose a light or sepia document theme so the PDF reads cleanly on screen and in print.",
    },
    {
      icon: "FileDown",
      title: "One-click PDF, plus copy HTML",
      description:
        "Download a paginated PDF with a single click, or copy the rendered, sanitised HTML to paste into an email or CMS. A blank-canvas reset is always one button away.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste or type",
      description:
        "Drop a.md or.markdown file onto the editor, paste Markdown straight from your clipboard, or start from a built-in sample: however your content arrives, it's editable in place.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing, preview and PDF rendering all happen in your browser. Internal READMEs, unreleased release notes and private docs are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "A README your reviewers can actually read",
      description:
        "Ship documentation as a clean PDF for people who don't have your repo open, reviewers, clients and non-technical stakeholders get the formatted doc, not raw asterisks and pipes.",
    },
    {
      title: "What you see is what you export",
      description:
        "The preview is the source of truth, so the PDF matches the pane exactly. No second render engine, no reflow surprises between editing and downloading.",
    },
    {
      title: "No install, no build, no upload",
      description:
        "Get pandoc-quality output for everyday docs without wiring up a toolchain or a print-to-PDF hack, and without sending confidential Markdown to a third-party server.",
    },
    {
      title: "Consistent, print-ready pages",
      description:
        "Fixed page size, tuned margins and a readable theme mean the same document prints and shares the same way every time, instead of depending on a browser's ad-hoc print dialog.",
    },
  ],

  howTo: [
    {
      title: "Add your Markdown",
      description:
        "Type or paste Markdown into the editor, drop a .md file onto the pane, or load a built-in sample to see the tool work in one click.",
    },
    {
      title: "Check the live preview",
      description:
        "The right pane renders your document as GitHub-flavoured Markdown in real time: headings, tables, code blocks and task lists appear exactly as they'll export.",
    },
    {
      title: "Set page size, margins & theme",
      description:
        "Choose A4 or US Letter, pick your margins, and select a light or sepia theme so the output reads well on screen and in print.",
    },
    {
      title: "Download the PDF",
      description:
        "Click Download PDF to save a paginated file, or copy the rendered HTML to reuse elsewhere. Reset to a blank canvas whenever you want to start over.",
    },
  ],

  formats: {
    input: ["Markdown", "MD"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Open-source maintainer",
      title: "Turn a README into a PDF",
      description:
        "Export your project's README.md as a formatted PDF to attach to a release, a grant application, or a sponsor update, headings, badges tables and code fences intact.",
    },
    {
      audience: "Engineer / Tech lead",
      title: "Share design docs & RFCs",
      description:
        "Draft an architecture note or RFC in Markdown and hand reviewers a clean PDF, so the discussion happens over a readable document instead of a raw diff.",
    },
    {
      audience: "Student / Researcher",
      title: "Print study & lecture notes",
      description:
        "Write structured notes in Markdown (headings, lists, tables and code) and export a tidy PDF to print, revise from, or submit.",
    },
    {
      audience: "Product / PM",
      title: "Circulate release notes",
      description:
        "Keep a changelog in Markdown and export the latest release notes as a PDF for stakeholders who live in email and slide decks, not in your repo.",
    },
  ],

  troubleshooting: [
    {
      problem: "The text in my PDF isn't selectable or searchable.",
      solution:
        "Styled Markdown (tables, code, colors) is rendered as a high-resolution image inside the PDF so the look is preserved exactly, which means that text isn't individually selectable. When you need selectable, searchable body text instead of pixel-perfect styling, use the sibling Text to PDF tool, which draws real vector text.",
    },
    {
      problem: "A wide table or long code line is clipped at the page edge.",
      solution:
        "Very wide content can overflow a fixed page width. Switch the page size to US Letter or the margins to 'Wide', shorten long code lines, or split a very wide table into fewer columns so it fits the printable area.",
    },
    {
      problem: "An image in my Markdown didn't appear in the PDF.",
      solution:
        "Only images the browser can load in-page render into the PDF. Local file paths and images behind authentication won't resolve. Use a publicly reachable URL or a data-URI, and give the preview a moment to load remote images before exporting.",
    },
    {
      problem: "My HTML written inside the Markdown was stripped.",
      solution:
        "For safety, raw HTML in the Markdown is sanitised before rendering, so scripts, iframes and event handlers are removed. Stick to Markdown syntax (or plain formatting tags) for anything you need to appear in the preview and the PDF.",
    },
  ],

  tips: [
    "Load a sample first to see how headings, tables, code and task lists render before pasting your own content.",
    "Use US Letter or 'Wide' margins when a document has wide tables or long code lines so nothing clips at the page edge.",
    "Pick the sepia theme for long-form reading: it's easier on the eyes in a printed handout than stark white.",
    "Need selectable, searchable text instead of a pixel-perfect image? Use the Text to PDF tool for real vector text.",
    "Copy the rendered HTML if you'd rather drop the formatted document into an email or a CMS instead of exporting a PDF.",
  ],

  security:
    "Your Markdown is parsed, previewed and rendered to PDF entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert internal READMEs, unreleased release notes and confidential docs. Raw HTML embedded in the Markdown is sanitised before rendering to strip scripts and other active content. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my Markdown uploaded to a server?",
      answer:
        "No. Parsing, the live preview and the PDF render all happen locally in your browser using a Markdown parser and PDF renderer loaded on demand. Your content never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential READMEs and internal docs.",
    },
    {
      question: "Which Markdown syntax is supported?",
      answer:
        "It renders GitHub-flavoured Markdown: headings, bold and italic, ordered and unordered lists, task lists (checkboxes), blockquotes, fenced code blocks, inline code, horizontal rules, links, images and pipe tables. That covers the syntax a real README, changelog or design doc actually uses.",
    },
    {
      question: "Is the text in the exported PDF selectable?",
      answer:
        "Styled Markdown is rendered as a high-resolution image inside the PDF to preserve the exact look of tables, code and colors, so that text isn't individually selectable or searchable. If you need selectable, searchable body text instead, use the sibling Text to PDF tool, which draws real vector text (with a trade-off in styling).",
    },
    {
      question: "Can I choose the page size and margins?",
      answer:
        "Yes. Export to A4 or US Letter, pick comfortable, cozy or wide margins, and choose a light or sepia document theme. The preview reflects your choices so you can confirm the layout before downloading.",
    },
    {
      question: "Will my code blocks and tables render correctly?",
      answer:
        "Yes. Fenced code blocks render in monospace with a subtle background, and pipe tables render with borders and header shading. Extremely wide tables or long code lines can overflow a fixed page width: switch to US Letter or wider margins, or wrap long lines, so everything fits the printable area.",
    },
    {
      question: "Can I drop a .md file or paste from my clipboard?",
      answer:
        "Both. Drop a .md or .markdown file onto the editor, paste Markdown straight from your clipboard, or just start typing. However your content arrives it's fully editable in place before you export.",
    },
    {
      question: "Does it work offline and with private documents?",
      answer:
        "Once the page and its on-demand libraries have loaded, conversion is entirely local, so private documents stay on your machine. Note that images referenced by remote URL still need a connection to load into the preview and the PDF.",
    },
    {
      question: "How is this different from printing to PDF from a viewer?",
      answer:
        "A browser's print dialog depends on its ad-hoc page rules and often adds headers, footers and inconsistent margins. This tool renders a document-styled preview and paginates it into a fixed A4/Letter file with the margins and theme you chose, so the output is consistent every time and matches the preview exactly.",
    },
  ],

  changelog: [
    {
      date: "2026-06-12",
      change:
        "Initial release, split-pane Markdown editor with a live GitHub-flavoured preview, one-click PDF export with A4/Letter page sizes, tunable margins and light/sepia themes, drop/paste/type input, copy-rendered-HTML, samples and reset.",
    },
    {
      date: "2026-06-20",
      change:
        "Added task-list (checkbox) rendering, improved table and fenced-code styling in both the preview and the PDF, and a clearer honesty note about image-rendered text vs. the selectable-text Text to PDF tool.",
    },
    {
      date: "2026-06-27",
      change:
        "Tuned pagination and margin presets to reduce clipping on wide tables and long code lines, and added live word/character/line stats to the editor footer.",
    },
  ],

  relatedTools: [
    "text-to-pdf",
    "html-to-pdf",
    "pdf-to-text",
    "merge-pdf",
    "json-formatter",
  ],
};

export default markdownToPdf;
