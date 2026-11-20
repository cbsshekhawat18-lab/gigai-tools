import type { Tool } from "@/types";

/**
 * Redaction Checker, the QA step between "we redacted it" and "we sent it".
 *
 * Deliberately not a redaction tool: it attacks a finished file the way a
 * recipient would and reports what it recovers. Two things separate it from the
 * single-file verifiers that appeared after the 2025 court-filing leaks. It
 * takes a whole outgoing set at once, and it exports a report you can keep on
 * file. Runs entirely on-device.
 */
const redactionChecker: Tool = {
  slug: "redaction-checker",
  title: "Redaction Checker",
  description:
    "Check whether a document really is redacted before you send it. Recovers text hidden under black boxes, tracked changes, hidden sheets and speaker notes, a whole set at once, in your browser.",
  category: "pdf-tools",
  group: "PDF Security",
  icon: "ScanSearch",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-08-03",

  tags: ["privacy", "security", "audit", "redaction", "compliance"],
  fileTypes: ["pdf", "docx", "xlsx", "pptx", "jpg", "png"],
  audiences: ["business", "professionals"],

  h1: "Redaction Checker, Prove It Before You Send It",
  tagline:
    "A black box over text does not delete the text. Drop in the files you are about to release and see exactly what a recipient could still recover, then export the proof you checked.",
  longDescription:
    "Most redaction failures are not exotic. Someone draws a black rectangle in a PDF viewer, the rectangle is painted on top, and the words underneath stay in the file where anyone can select, search or extract them: a problem that stopped being theoretical when large court releases in 2025 exposed victims' names exactly this way, and which now takes one sentence to exploit in any AI assistant. The GigAI redaction checker is the step that catches it. Rather than looking for black rectangles, it renders each page and cross-examines it against the text a machine can still pull out: if a run of text carries real characters but the pixels where it sits are a flat, featureless block, something is painted over it and the content underneath is intact. That single approach catches every covering method at once: black boxes, white-out, pasted images, opaque annotations, invisible text layers. It goes on to check the things that leak just as often and get noticed far less: redaction marks that were placed but never applied, tracked changes still holding every earlier wording, review comments and the names attached to them, hidden worksheets and hidden rows, hidden slides and speaker notes, filled form values, embedded files, and the author and template trail in the document properties. You can check a whole outgoing set in one pass instead of one file at a time, and export an HTML or JSON report recording what was checked and what was found. Everything happens in your browser: a document you are worried about leaking is the last file you should upload to a scanner.",

  ctaText: "Check a document",

  keywords: [
    "redaction checker",
    "check pdf redaction",
    "verify redaction",
    "is my pdf redacted properly",
    "text under black box pdf",
    "failed redaction check",
    "hidden data in word document",
    "check document before sending",
    "tracked changes checker",
    "document metadata checker",
    "unredact test",
    "check hidden sheets excel",
  ],

  seo: {
    title: "Redaction Checker. Verify a PDF Is Really Redacted | GigAI Tools",
    description:
      "Free browser-based redaction checker. Recovers text hidden under black boxes, finds tracked changes, hidden sheets, speaker notes and metadata across a whole file set. Nothing uploaded.",
  },

  formats: {
    input: ["PDF", "DOCX", "XLSX", "PPTX", "JPG", "PNG", "WEBP", "GIF"],
    output: ["HTML report", "JSON report"],
  },

  features: [
    {
      icon: "ScanSearch",
      title: "Reads what is under the box",
      description:
        "Each page is rendered and compared against its extractable text. Where text exists but nothing is visible, the cover is hiding live content, and the checker shows you the words it recovered.",
    },
    {
      icon: "Layers",
      title: "Catches every covering method",
      description:
        "Black boxes, white-out, pasted images, opaque annotations and invisible text layers all fail the same test, so nothing slips through because it was hidden a different way.",
    },
    {
      icon: "FileStack",
      title: "A whole release at once",
      description:
        "Production sets are not one file. Drop the entire outgoing batch and get every finding ranked by severity, with the worst verdict rolled up to the top.",
    },
    {
      icon: "FileCheck",
      title: "Exports a record",
      description:
        "An HTML or JSON report of what was checked, when, and what was found, for the production log, the sign-off, or the question that arrives six months later.",
    },
    {
      icon: "GitPullRequestClosed",
      title: "Tracked changes and hidden content",
      description:
        "Deleted wording in Word, hidden worksheets and rows in Excel, hidden slides and speaker notes in PowerPoint, the leaks that never involved a black box at all.",
    },
    {
      icon: "Lock",
      title: "Never uploaded",
      description:
        "Rendering, extraction and comparison all happen on your device. A file you are afraid to leak should not be handed to a web server to find out.",
    },
  ],

  benefits: [
    {
      title: "Catch it before the recipient does",
      description:
        "Failed redactions are found by the person you sent the file to. This is the check that happens while it is still yours.",
    },
    {
      title: "Check the set, not the file",
      description:
        "One bad document in a release of two hundred is what causes the incident. Scanning the batch is the only way that is a realistic thing to catch.",
    },
    {
      title: "Show your work",
      description:
        "A verdict on a screen disappears. An exported report is what you attach to the file when someone needs to know a check was actually run.",
    },
  ],

  howTo: [
    {
      title: "Drop in the outgoing files",
      description:
        "Add a single PDF or the whole release set, PDF, Word, Excel, PowerPoint and images together. They are read in your browser, not uploaded.",
    },
    {
      title: "Read the verdict",
      description:
        "Each file is marked do-not-release, review, or no-issues. Open any file to see its findings ranked by severity.",
    },
    {
      title: "See what was recovered",
      description:
        "Where text was hidden under a cover, the checker shows the actual recovered words: kept blurred until you ask, so it stays private on a shared screen.",
    },
    {
      title: "Fix, re-check, and keep the report",
      description:
        "Repair the file properly, run it again to confirm the finding is gone, then export the HTML or JSON report for your records.",
    },
  ],

  useCases: [
    {
      audience: "Legal",
      title: "Before a filing or production goes out",
      description:
        "Check redactions, tracked changes and privileged comments across a production set in one pass, and keep the report with the production log.",
    },
    {
      audience: "Compliance & records",
      title: "Responding to a records or disclosure request",
      description:
        "Confirm that what was withheld is genuinely unreadable, and that no hidden sheet or attachment is riding along with the release.",
    },
    {
      audience: "Business",
      title: "Sending a contract, deck or model externally",
      description:
        "Catch the hidden pricing tab, the speaker notes, and the deleted negotiating language before a client or counterparty receives it.",
    },
    {
      audience: "Journalism & research",
      title: "Publishing a source document",
      description:
        "Verify that a document you are about to publish does not expose a source through metadata, comments or a failed redaction.",
    },
  ],

  troubleshooting: [
    {
      problem: "It found nothing, but I know the document was redacted.",
      solution:
        "That is the result you want. It means the text was genuinely removed rather than covered. Note that a scanned or image-only page has no text layer at all, so there is nothing to recover and nothing to report either way.",
    },
    {
      problem: "It flagged text I redacted on purpose.",
      solution:
        "That is the finding. The cover is drawn over the words but the words are still in the file. Redact it properly (apply the redaction, or rasterise the page) and run the check again to confirm it is gone.",
    },
    {
      problem: "It flagged a heading that looks fine on screen.",
      solution:
        "Text sitting on a flat block of color with very little contrast can read as covered. Open the page and confirm. If the text is genuinely visible and legible, it is a false positive you can dismiss.",
    },
    {
      problem: "A long PDF stopped part way through.",
      solution:
        "Rendering every page in the browser is slow, so the scan uses a page limit and reports it in the results. Raise the limit before you rely on the result. Unchecked pages are not cleared pages.",
    },
    {
      problem: "The scan is slow on a large batch.",
      solution:
        "Files are processed one at a time on purpose. Rendering pages is memory-hungry, and running them in parallel is what makes a browser tab crash. Lower the page limit for a fast first pass, then re-run the flagged files at a higher one.",
    },
  ],

  tips: [
    "Covering text with a shape is never redaction. Real redaction deletes the underlying content: apply the redaction in your editor, or flatten the page to an image.",
    "Accepting tracked changes in the view does not remove them. Use your editor's inspect-and-remove step before the file leaves the building.",
    "Test any redaction the cheap way too: open the file, select all, and paste into a plain text editor. Anything that appears was never removed.",
    "Check the file you are actually sending. A re-save, a conversion, or a different export path can reintroduce what an earlier copy had clean.",
    "A clean result is evidence, not a guarantee. It means these checks found nothing. It does not replace a human read of the document.",
  ],

  faq: [
    {
      question: "Why is text still readable under a black box?",
      answer:
        "Because a PDF holds text and graphics in separate layers. Drawing a black rectangle adds a shape to the graphics layer. It does not touch the text layer underneath. The words stay fully intact in the file, and anyone can recover them by selecting the page, running text extraction, or pasting the document into an AI assistant. Real redaction removes the text itself.",
    },
    {
      question: "Does this tool redact my document?",
      answer:
        "No, and that is deliberate. It is the verification step, not the editing step. It tells you whether a document you already redacted is genuinely safe, and shows you exactly what is still recoverable so you can go and fix it properly.",
    },
    {
      question: "Are my files uploaded?",
      answer:
        "No. Every file is read, rendered and compared in your browser on your own device. Nothing is sent to a server, and there is nothing to delete afterwards. A document you are worried about leaking is precisely the document you should not upload to a scanner to find out.",
    },
    {
      question: "What does it check besides redaction?",
      answer:
        "Redaction marks placed but never applied, tracked changes and deleted text in Word, review comments and the names attached to them, hidden worksheets, rows and columns in Excel, hidden slides and speaker notes in PowerPoint, filled form values, embedded files and scripts, the author, company and template trail in document properties, and EXIF and GPS data in images.",
    },
    {
      question: "Can it check a whole set of files at once?",
      answer:
        "Yes. Drop in the entire outgoing release: mixed formats are fine. Each file gets its own verdict and findings, and the worst verdict across the set is rolled up so one bad file cannot hide in a long list.",
    },
    {
      question: "Will it catch a redaction on a scanned document?",
      answer:
        "No, and it says so rather than implying otherwise. A scanned page is an image with no text layer, so there is nothing recoverable to find. If a scanned document was OCR'd, the OCR text layer is checked like any other.",
    },
    {
      question: "What is in the exported report?",
      answer:
        "The verdict, every finding with its severity and location, the recovered evidence, which checks were run, how many pages were inspected per file, and the scan's stated limits. HTML is a single self-contained file that opens anywhere and prints to PDF. JSON is the machine-readable version. Both reproduce recovered content, so store them as carefully as the source documents.",
    },
    {
      question: "Can I rely on a clean result?",
      answer:
        "Treat it as one control among several. A clean result means these specific checks found nothing recoverable. It is not a warranty that a document is safe to release, and it does not replace review by someone who knows what the document is supposed to say.",
    },
  ],

  security:
    "Files are read, rendered and analyzed entirely in your browser using your device's own resources. Nothing is uploaded, stored or transmitted. Exported reports contain the recovered content as evidence, so treat a report as being as sensitive as the documents it describes.",

  changelog: [
    {
      date: "2026-08-03",
      change:
        "First release, render-vs-text-layer redaction check, Office hidden-content checks, image EXIF, batch scanning and HTML/JSON report export.",
    },
  ],

  relatedTools: ["remove-metadata", "document-metadata-editor", "pdf-editor", "pdf-password-protect"],
};

export default redactionChecker;
