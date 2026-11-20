import type { Tool } from "@/types";

/**
 * Text to PDF, the Document Studio's selectable-text converter.
 *
 * Paste or drop a .txt file and export a clean, print-ready PDF whose body is
 * drawn with jsPDF's vector text API (`txtToPdf`), so the words stay REAL,
 * selectable, searchable text. Not a rasterised image. This is the honest
 * counterpart to Markdown/HTML to PDF, which rasterise to preserve styling.
 * Every string is written for the exact queries people type when they need a
 * plain-text file, note, log or transcript as a shareable PDF; nothing here is
 * shared with the Markdown/HTML/CSV copy, and no claim outruns the renderer.
 */
const txtToPdf: Tool = {
  slug: "txt-to-pdf",
  title: "Text to PDF",
  description:
    "Paste text or drop a.txt file and export a clean, print-ready PDF with real selectable, searchable text. Pick the font, size, margins and page size: A4 or US Letter. 100% in your browser, nothing uploaded.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "FileText",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-15",

  h1: "Text to PDF, Convert TXT to a Clean PDF Online",
  tagline:
    "Paste plain text, drop a.txt file, or start typing, then export a tidy, print-ready PDF whose body is real, selectable, searchable text (not a screenshot). Choose the font, size, margins and page size, watch the live preview, and download in one click. 100% in your browser, never uploaded.",
  longDescription:
    "The GigAI Text to PDF converter turns any plain-text file into a polished, shareable PDF without an upload, a print-to-PDF hack, or a word processor. Paste text into the editor, drop a.txt,.log or.md file onto it, or just start typing. Then a live preview shows the paginated page exactly as it will export. Because the body is drawn with jsPDF's vector text engine rather than rasterised, every word in the finished PDF stays real, selectable and searchable: readers can copy-paste from it, Ctrl+F through it, and screen readers can read it aloud. Your own line breaks are preserved, and long lines are word-wrapped cleanly to the page's content width, then paginated across as many A4 or US Letter pages as it takes. Pick a serif (Times), sans-serif (Helvetica) or monospace (Courier) font, dial the point size and margins to taste, and confirm the layout in the preview before you download. It's built for the everyday text people actually keep in.txt: meeting notes, server and application logs, chat and interview transcripts, code snippets and configuration, book drafts and lyrics, licences and README bodies, and long email threads you need to archive as a document. Load a sample to see it work, copy the wrapped text back out if you'd rather paste it elsewhere, and reset to a blank canvas in one click. Everything runs on your device with a PDF library loaded on demand, so private notes, internal logs and unreleased drafts never leave your machine, close the tab and every trace is gone. One honest note: this tool renders plain text, so it does not interpret Markdown or HTML styling (headings, bold, tables). When you want styled output (formatted headings, tables and code blocks) the sibling Markdown to PDF tool renders that (as a high-fidelity image), and HTML to PDF handles rich HTML.",

  ctaText: "Download PDF",

  keywords: [
    "text to pdf",
    "txt to pdf",
    "convert txt to pdf",
    "text to pdf converter",
    "plain text to pdf",
    "txt to pdf online",
    "notes to pdf",
    "log to pdf",
    "transcript to pdf",
    "text file to pdf",
    "txt to pdf free",
    "save text as pdf",
  ],

  seo: {
    title: "Text to PDF, Convert TXT to PDF Online Free | GigAI Tools",
    description:
      "Free online Text to PDF converter that keeps real selectable, searchable text. Paste text or drop a .txt file, pick the font, size, margins and page size, preview the pages, and download a clean PDF. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "TextSelect",
      title: "Real selectable, searchable text",
      description:
        "The PDF body is drawn with a vector text engine, not rasterised, so readers can select, copy, Ctrl+F search and screen-read every word, exactly as they'd expect from a typed document.",
    },
    {
      icon: "Type",
      title: "Choose the font & size",
      description:
        "Export in a classic serif (Times), a clean sans-serif (Helvetica), or a monospace (Courier) that keeps logs, code and config aligned: then set the point size for comfortable reading or print.",
    },
    {
      icon: "FileCog",
      title: "Page size & margins",
      description:
        "Export to A4 or US Letter and tune the page margins, with automatic word-wrapping to the content width and clean pagination across as many pages as your text needs.",
    },
    {
      icon: "Eye",
      title: "Live paginated preview",
      description:
        "Watch a real page preview update as you type and change options, so the layout, wrapping and font are exactly what you'll get before you ever click download.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste or type",
      description:
        "Drop a.txt,.log or.md file onto the editor, paste straight from your clipboard, or start from a built-in sample, however your text arrives, it's editable in place.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Rendering happens entirely in your browser with a PDF library loaded on demand. Private notes, internal logs and unreleased drafts are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Text people can actually copy from",
      description:
        "Unlike a screenshot or a rasterised export, this PDF holds live text. Recipients can quote a line, search a keyword, or feed it to a screen reader instead of retyping.",
    },
    {
      title: "Your formatting, preserved",
      description:
        "Your own line breaks and blank lines are kept, and long lines wrap cleanly to the page, so notes, logs and transcripts read the way you wrote them.",
    },
    {
      title: "No install, no upload, no hack",
      description:
        "Skip the word-processor round-trip and the browser print dialog's ad-hoc margins, and never send a confidential.txt to a third-party server to get a clean PDF.",
    },
    {
      title: "Consistent, print-ready pages",
      description:
        "Fixed A4/Letter page size, tuned margins and a chosen font mean the document prints and shares the same way every time, on every machine.",
    },
  ],

  howTo: [
    {
      title: "Add your text",
      description:
        "Type or paste text into the editor, drop a .txt, .log or .md file onto the pane, or load a built-in sample to see the tool work in one click.",
    },
    {
      title: "Pick font, size, margins & page size",
      description:
        "Choose a serif, sans-serif or monospace font, set the point size and margins, and select A4 or US Letter, the preview reflects every change instantly.",
    },
    {
      title: "Check the live preview",
      description:
        "Confirm the wrapping, pagination and font in the page preview so you know exactly what the exported PDF will look like.",
    },
    {
      title: "Download the PDF",
      description:
        "Click Download PDF to save a paginated file with real selectable text, or copy the text back out to reuse it elsewhere. Reset to a blank canvas whenever you like.",
    },
  ],

  formats: {
    input: ["TXT", "Text", "LOG", "MD"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Engineer / SRE",
      title: "Archive logs as a PDF",
      description:
        "Paste a server or application log into a monospace PDF so columns stay aligned, then attach it to an incident ticket or postmortem, with searchable text intact.",
    },
    {
      audience: "Writer / Author",
      title: "Turn a draft into a clean PDF",
      description:
        "Export a plain-text chapter, script or set of lyrics as a tidy, print-ready PDF for reviewers or a submission, with your line breaks and spacing preserved.",
    },
    {
      audience: "Researcher / Journalist",
      title: "Save transcripts & notes",
      description:
        "Convert an interview transcript or field notes into a searchable PDF that colleagues can quote from and Ctrl+F, without exposing the source file to any server.",
    },
    {
      audience: "Support / Ops",
      title: "Package chat & email threads",
      description:
        "Paste a long chat or email thread and export it as a single readable PDF for a record, an audit, or a hand-off. No copy-paste into a word processor required.",
    },
  ],

  troubleshooting: [
    {
      problem: "My Markdown or HTML formatting didn't render.",
      solution:
        "This tool renders plain text, so #, **bold**, tables and HTML tags appear literally rather than as styling. That's what keeps the output real selectable text. If you want formatted headings, tables and code, use the sibling Markdown to PDF tool (styled, image-rendered) or HTML to PDF for rich HTML.",
    },
    {
      problem: "A very long line ran off the page or wrapped oddly.",
      solution:
        "Lines are word-wrapped to the page's content width. For wide fixed-width content like tables or long log lines, switch the font to Courier, reduce the point size, choose US Letter, or narrow the margins so more fits per line before it wraps.",
    },
    {
      problem: "My alignment / columns look off in the PDF.",
      solution:
        "Space-aligned columns only stay aligned in a monospace font. Pick the Courier (monospace) font so every character is the same width, and keep the point size modest so wide rows fit the page.",
    },
    {
      problem: "The character count looks different after export.",
      solution:
        "Windows-style line endings are normalised and trailing whitespace on wrapped lines can be trimmed during pagination, so counts may differ slightly from your source. The visible text and your intentional blank lines are preserved.",
    },
  ],

  tips: [
    "Use the Courier (monospace) font for logs, code and config so columns and indentation stay perfectly aligned.",
    "Drop US Letter or a smaller point size when lines are long, so more text fits per line before it wraps.",
    "Load a sample first to see how wrapping, pagination and each font look before pasting your own text.",
    "Need formatted headings, tables or code blocks? Use the Markdown to PDF tool for styled output.",
    "The exported text is selectable and searchable. Recipients can Ctrl+F and copy straight from the PDF.",
  ],

  security:
    "Your text is rendered to PDF entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert private notes, internal logs, confidential transcripts and unreleased drafts. The PDF library is loaded on demand and runs locally. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my text uploaded to a server?",
      answer:
        "No. The entire conversion runs locally in your browser using a PDF library loaded on demand. Your text never leaves your device, so there's nothing for us to store, log or see, it's safe to convert confidential notes, internal logs and private transcripts.",
    },
    {
      question: "Is the text in the exported PDF selectable and searchable?",
      answer:
        "Yes. The body is drawn with a vector text engine rather than rasterised, so every word is real text: readers can select and copy it, Ctrl+F search it, and screen readers can read it aloud. This is the key difference from a screenshot-style export.",
    },
    {
      question: "Can I choose the font, size, margins and page size?",
      answer:
        "Yes. Pick a serif (Times), sans-serif (Helvetica) or monospace (Courier) font, set the point size and page margins, and export to A4 or US Letter. The live preview reflects every choice so you can confirm the layout before downloading.",
    },
    {
      question: "Does it keep my line breaks and blank lines?",
      answer:
        "Yes. Your own line breaks and blank lines are preserved, and long lines are word-wrapped to the page's content width and paginated automatically, so the document reads the way you wrote it.",
    },
    {
      question: "Will my Markdown or HTML be formatted?",
      answer:
        "No. This tool renders plain text, so Markdown symbols and HTML tags appear literally. That's intentional: it's what keeps the output real, selectable text. For styled headings, tables and code use the Markdown to PDF tool, or HTML to PDF for rich HTML.",
    },
    {
      question: "Can I drop a .txt file or paste from my clipboard?",
      answer:
        "Both. Drop a .txt, .log or .md file onto the editor, paste text straight from your clipboard, or just start typing. However your text arrives it's fully editable in place before you export.",
    },
    {
      question: "How do I keep logs and code aligned?",
      answer:
        "Choose the Courier (monospace) font so every character is the same width, which keeps space-aligned columns, indentation and log fields lined up. A smaller point size and US Letter help wide rows fit the page.",
    },
    {
      question: "Does it work offline and with large files?",
      answer:
        "Once the page and its on-demand PDF library have loaded, conversion is entirely local and works offline. Very large texts render into many pages and are limited only by your device's memory, since everything happens in the browser tab.",
    },
  ],

  changelog: [
    {
      date: "2026-06-15",
      change:
        "Initial release, paste/drop/type plain text and export a paginated PDF with real selectable vector text, choice of serif/sans/monospace font, point size, margins and A4/Letter page size, live preview, samples and reset.",
    },
    {
      date: "2026-06-22",
      change:
        "Added a live paginated page preview that reflects font, size and margin changes in real time, plus word/character/line stats and a copy-text-back-out action.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved word-wrapping for long log lines and code, tightened blank-line preservation, and added a clearer honesty note distinguishing plain-text output from the styled Markdown to PDF tool.",
    },
  ],

  relatedTools: [
    "markdown-to-pdf",
    "html-to-pdf",
    "pdf-to-text",
    "merge-pdf",
  ],
};

export default txtToPdf;
