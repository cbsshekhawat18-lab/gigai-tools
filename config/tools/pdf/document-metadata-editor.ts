import type { Tool } from "@/types";

/**
 * Document Metadata Editor, view, edit and strip a PDF's document information
 * dictionary (title, author, subject, keywords, creator, producer, dates).
 *
 * REUSES the existing engine, never reimplements it: metadata is read with
 * `readMetadata` and written with `writeMetadata` from
 * `@/lib/document-tools/pdfops` (thin pdf-lib wrappers). Everything runs in the
 * browser; the PDF is loaded locally and re-saved locally, nothing is uploaded.
 * The copy below is honest about exactly which fields pdf-lib can read and write
 * and what "stripping" does (clears the info dictionary; it is a privacy scrub,
 * not a forensic wipe of every possible embedded trace).
 */
const documentMetadataEditor: Tool = {
  slug: "document-metadata-editor",
  title: "PDF Metadata Editor",
  description:
    "View and edit a PDF's document properties (title, author, subject, keywords, creator, producer and dates) then download the updated file. One click strips all metadata for privacy. 100% in your browser, nothing uploaded.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "Info",
  accent: "sky",
  status: "live",
  createdAt: "2026-06-18",

  h1: "PDF Metadata Editor, View, Edit & Remove PDF Properties Online",
  tagline:
    "Drop a PDF to instantly see its hidden document properties, title, author, subject, keywords, creator, producer and creation/modification dates. Edit any field and download the updated file, or wipe every field in one click for privacy. 100% in your browser, never uploaded.",
  longDescription:
    "The GigAI PDF Metadata Editor opens the document information dictionary that every PDF carries but few viewers show, the title, author, subject, keywords, the software that created and produced it, and the creation and modification dates. Drop a file and each field is read straight out of the PDF and laid into an editable form. Change what you like and download a new copy with the updated properties written back in, all without leaving the page. It solves two everyday problems at once. First, correctness and SEO: a proper Title and Author make a PDF show the right name in browser tabs, search results, document libraries and reference managers instead of a leftover template name or a cryptic export string. Second, privacy: exported PDFs quietly leak the author's real name, the internal file path baked into the Title, the exact editing timestamps, and the name of the software used, the one-click Strip clears every one of those fields before you send a document to a client, upload a resume, or publish a report. Because it reuses the same proven pdf-lib engine that powers the rest of the studio, editing is exact and lossless: only the info dictionary changes, so your pages, fonts, forms and bookmarks are untouched. You can edit a single field, clear an individual field, strip everything, reset back to the file's original values, and copy the current metadata as JSON for an audit trail, then download the result. Two honest notes: pdf-lib reads and writes the standard document-info fields shown here (it does not surface custom XMP or private application metadata), and Strip clears those standard fields for privacy but is a metadata scrub, not a guarantee that no identifying trace of any kind survives inside embedded objects. Everything (reading, editing, stripping and saving) happens on your device. The PDF is never uploaded, stored or logged.",

  ctaText: "Download updated PDF",

  keywords: [
    "pdf metadata editor",
    "edit pdf metadata",
    "remove pdf metadata",
    "strip pdf metadata",
    "change pdf title",
    "edit pdf author",
    "pdf properties editor",
    "view pdf metadata",
    "pdf document properties",
    "clear pdf metadata online",
    "pdf metadata remover",
    "edit pdf keywords",
  ],

  seo: {
    title: "PDF Metadata Editor: Edit & Remove PDF Properties Online | GigAI Tools",
    description:
      "Free online PDF metadata editor. View, edit or strip a PDF's title, author, subject, keywords, creator, producer and dates, then download the updated file. One-click privacy wipe. 100% in your browser: nothing uploaded.",
  },

  features: [
    {
      icon: "ScanEye",
      title: "See every hidden property",
      description:
        "Drop a PDF and instantly read the document information most viewers hide, title, author, subject, keywords, the creator and producer software, and the creation and modification dates.",
    },
    {
      icon: "PencilLine",
      title: "Edit any field in place",
      description:
        "Fix a wrong title, set a proper author, add descriptive keywords or correct the subject in a simple form, then download a new PDF with the updated properties written straight back in.",
    },
    {
      icon: "Eraser",
      title: "One-click privacy strip",
      description:
        "Clear the author name, internal file path, editing timestamps and creating-software fields in a single click before you send a document out. No field left behind for anyone to read.",
    },
    {
      icon: "FileCheck2",
      title: "Lossless, pages untouched",
      description:
        "Only the document-info dictionary is rewritten with the proven pdf-lib engine, so your pages, fonts, form fields and bookmarks are preserved exactly: nothing is re-rendered or degraded.",
    },
    {
      icon: "Braces",
      title: "Copy metadata as JSON",
      description:
        "Grab the current properties as clean JSON for an audit trail, a bug report, or a batch checklist, handy when you're verifying that a wipe actually took across a set of files.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Reading, editing, stripping and saving all happen in your browser. The PDF is never uploaded, stored or logged, so confidential and personal documents stay entirely on your machine.",
    },
  ],

  benefits: [
    {
      title: "Stop leaking your name and file paths",
      description:
        "Exported PDFs quietly carry the author's real name, the internal folder path baked into the title, and exact editing timestamps. Strip clears them before a resume, contract or report leaves your hands.",
    },
    {
      title: "A title that reads right everywhere",
      description:
        "The document Title is what browsers, search engines, document libraries and reference managers display. Set it properly and your PDF stops showing a template leftover or a cryptic export string.",
    },
    {
      title: "Exact edits, nothing re-rendered",
      description:
        "Because only the info dictionary changes, the file stays byte-faithful everywhere else. No quality loss, no reflow, no broken forms or links, unlike a print-to-PDF round trip.",
    },
    {
      title: "No upload, no account, no wait",
      description:
        "Edit and clean metadata instantly on your device without signing up or handing a sensitive document to a third-party server: close the tab and every trace is gone.",
    },
  ],

  howTo: [
    {
      title: "Drop your PDF",
      description:
        "Drag a PDF onto the drop zone, click to browse, or paste one from your clipboard. Its document properties are read locally and shown in an editable form right away.",
    },
    {
      title: "Review the current metadata",
      description:
        "See the existing title, author, subject, keywords, creator, producer and the creation and modification dates exactly as stored in the file.",
    },
    {
      title: "Edit or strip",
      description:
        "Change any field to correct or enrich the metadata, or click Strip all to clear every field in one pass for privacy. Reset restores the file's original values at any time.",
    },
    {
      title: "Download the updated PDF",
      description:
        "Click Download to save a new PDF with your changes written into the info dictionary. Optionally copy the current metadata as JSON before you save for your records.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF", "JSON"],
  },

  useCases: [
    {
      audience: "Job seeker",
      title: "Clean a resume before uploading",
      description:
        "Strip the author name, the software that made it, and the internal file path from your Title so a hiring portal or PDF viewer shows a clean, professional document instead of personal traces.",
    },
    {
      audience: "Author / Publisher",
      title: "Set correct title & author for a report",
      description:
        "Give an ebook, whitepaper or report a proper Title, Author, Subject and Keywords so it displays and indexes correctly in libraries, stores and reference managers.",
    },
    {
      audience: "Legal / Compliance",
      title: "Scrub metadata before sharing files",
      description:
        "Remove editing timestamps and creator details from contracts and filings before they leave the firm, reducing what an opposing party or recipient can learn from document properties.",
    },
    {
      audience: "Researcher / Librarian",
      title: "Standardise a batch of PDFs",
      description:
        "Normalise inconsistent titles and add subject keywords so a collection of PDFs sorts, searches and cites cleanly, copy the JSON to verify each file was updated.",
    },
  ],

  troubleshooting: [
    {
      problem: "Some fields were already blank when I opened the PDF.",
      solution:
        "That's normal, many PDFs never set an author, subject or keywords, so those fields simply come through empty. Type values into them and download to add proper metadata to the file.",
    },
    {
      problem: "The creation and modification dates aren't editable.",
      solution:
        "Dates are shown read-only because they're recorded by the software that produced the file. Use Strip all to remove them for privacy. When you save any edit, pdf-lib sets a fresh modification date on the new copy.",
    },
    {
      problem: "My PDF has custom metadata that doesn't appear here.",
      solution:
        "This tool reads and writes the standard document-information fields (title, author, subject, keywords, creator, producer, dates). It doesn't surface custom XMP or private application-specific metadata, so those fields aren't shown or edited.",
    },
    {
      problem: "The file wouldn't open or read.",
      solution:
        "Very heavily encrypted or corrupted PDFs can fail to load. If the PDF is password-protected, unlock it first with the Unlock PDF tool, then reopen it here to view and edit its properties.",
    },
  ],

  tips: [
    "Set a clean, human Title: it's what browser tabs, search results and document libraries display, not the filename.",
    "Before sending a resume or contract, click Strip all to remove your author name, editing timestamps and the internal file path baked into the Title.",
    "Add a few comma-separated Keywords to make a report easier to find in search and reference managers.",
    "Copy the metadata as JSON before and after a wipe to confirm every field was actually cleared.",
    "Editing only changes the info dictionary, so your pages, forms and bookmarks stay intact. Save as many times as you like.",
  ],

  security:
    "Your PDF is opened, edited, stripped and re-saved entirely in your browser using a PDF engine loaded on demand. It is never uploaded to any server, stored or logged, so personal resumes, contracts and confidential reports stay on your device. The Strip action clears the standard document-information fields (title, author, subject, keywords, creator, producer and dates) as a privacy scrub. It removes what most viewers and tools can read, but it is not a forensic guarantee that no identifying trace survives inside every embedded object. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What metadata can I view and edit?",
      answer:
        "The standard PDF document-information fields: title, author, subject, keywords, creator and producer (the software involved), plus the creation and modification dates. The text fields are fully editable. The dates are shown read-only and are refreshed when you save.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The PDF is read, edited, stripped and re-saved entirely in your browser using a PDF engine loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe for confidential and personal documents.",
    },
    {
      question: "What exactly does 'Strip all' remove?",
      answer:
        "It clears every standard document-information field (title, author, subject, keywords, creator and producer) before you download. This is a privacy scrub that removes what viewers, search engines and most tools can read. It is not a forensic wipe of every possible embedded trace inside the file.",
    },
    {
      question: "Will editing metadata change or degrade my pages?",
      answer:
        "No. Only the document-information dictionary is rewritten. Your pages, fonts, form fields, links and bookmarks are preserved exactly. Nothing is re-rendered or recompressed, so the rest of the file stays byte-faithful.",
    },
    {
      question: "Why does the modification date change after I save?",
      answer:
        "Saving any edit produces a new copy, and the PDF engine records a fresh modification date on that copy: standard behaviour for an edited document. If you'd rather have no dates at all, use Strip all before downloading.",
    },
    {
      question: "Can it edit custom or XMP metadata?",
      answer:
        "Not in this tool. It focuses on the standard info-dictionary fields that browsers and viewers actually display and that pdf-lib can reliably read and write. Custom XMP packets and private application-specific metadata aren't surfaced or edited here.",
    },
    {
      question: "Does it work on password-protected PDFs?",
      answer:
        "Encryption can block reading the properties. If your PDF is password-protected, unlock it first with the Unlock PDF tool, then reopen it here to view, edit or strip its metadata.",
    },
    {
      question: "Can I get the metadata as JSON?",
      answer:
        "Yes. Copy the current properties as clean JSON for an audit trail, a bug report, or to verify across a batch that a wipe actually took. It captures the fields exactly as they're stored in the file.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: drag/drop/paste a PDF to view its title, author, subject, keywords, creator, producer and dates, edit any field, one-click strip-all for privacy, reset to original, copy-as-JSON, and download the updated file. 100% in-browser via the pdf-lib engine.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a live 'changed fields' indicator and per-field clear buttons, plus a clearer honesty note distinguishing a standard-fields privacy scrub from a forensic wipe.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved handling of PDFs with empty or missing info dictionaries and surfaced the page count alongside the editable properties.",
    },
  ],

  relatedTools: [
    "unlock-pdf",
    "pdf-password-protect",
    "merge-pdf",
    "document-comparer",
  ],
};

export default documentMetadataEditor;
