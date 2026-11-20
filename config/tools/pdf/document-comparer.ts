import type { Tool } from "@/types";

/**
 * Document Comparer, the flagship of the GigAI Document suite. Upload two
 * documents (PDF, DOCX, RTF, TXT or Markdown), and the tool extracts the plain
 * text from each entirely in your browser and shows a color-coded diff:
 * removals in red, additions in green, with a live added/removed tally and a
 * choice of line- or word-level granularity.
 *
 * It reuses the shared document engine end-to-end, `extractText` (pdf.js /
 * mammoth / RTF parser / UTF-8) normalises every format to text, and
 * `compareDocuments` runs the single `computeDiff` implementation that powers
 * every diff on the platform. So there is no duplicated conversion or diff code
 * behind this URL, only unique, honestly-scoped copy written for the exact
 * queries people type when they need to see what changed between two files.
 *
 * Honesty: this compares TEXT, not layout. Formatting, images, tables and page
 * geometry are out of scope, and scanned/image-only PDFs have no text to
 * extract. Every string below reflects that boundary rather than promising a
 * pixel-level redline.
 */
const documentComparer: Tool = {
  slug: "document-comparer",
  title: "Document Comparer",
  description:
    "Compare two documents and see exactly what changed. Upload two PDF, Word, RTF, text or Markdown files and get a color-coded diff (additions in green, removals in red) with an added/removed count, all in your browser. Nothing is uploaded.",
  category: "pdf-tools",
  group: "PDF Security",
  icon: "GitCompare",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Document Comparer: Compare Two Documents & See What Changed",
  tagline:
    "Drop two versions of a contract, brief, README or report and instantly see every difference. The tool extracts the text from each PDF, Word, RTF, TXT or Markdown file right in your browser and paints a clean redline (removals struck in red, additions in green) with a live change count and line- or word-level granularity. No upload, no account, nothing stored.",
  longDescription:
    "The GigAI Document Comparer answers one question fast: what actually changed between these two files? Upload an original and a revision (PDF, Word (.docx/.doc), RTF, plain text or Markdown, in any mix) and the tool pulls the readable text out of each document entirely on your device: PDFs go through the pdf.js text layer, Word files through Mammoth, RTF through a built-in parser, and everything else is decoded as UTF-8. It then diffs the two texts and renders a color-coded comparison you can read at a glance: text present only in the original is shown struck through in red, text added in the revision is highlighted in green, and unchanged passages stay neutral so your eye jumps straight to the edits. A running tally reports how many lines or words were added and removed, and you can switch between line-level granularity (ideal for prose, contracts and READMEs, where you want whole rewritten sentences flagged) and word-level granularity (which pinpoints the exact words that moved inside an otherwise-identical paragraph). Copy the plain-text redline, download it as a.diff file, or reset and compare another pair in one click. Because the entire pipeline runs in your browser, confidential contracts, unreleased drafts and internal specs never leave your machine. There is no server to upload to and nothing is logged. One honest boundary worth stating up front: this compares the text of two documents, not their visual layout. It will not redline fonts, colors, images, tables or page breaks, and it can only compare text that actually exists as text. A scanned or image-only PDF has nothing to extract until it is run through OCR first.",

  ctaText: "Compare Documents",

  keywords: [
    "document comparer",
    "compare two documents",
    "compare pdf files",
    "compare word documents",
    "document diff",
    "text diff online",
    "compare documents online",
    "pdf compare",
    "docx compare",
    "redline documents",
    "find differences between documents",
    "compare two versions of a file",
  ],

  seo: {
    title:
      "Document Comparer: Compare Two PDF, Word, TXT or Markdown Files Online | GigAI Tools",
    description:
      "Free online document comparer. Upload two PDF, Word, RTF, text or Markdown files and see a color-coded diff (additions in green, removals in red) with a change count, line or word mode. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "GitCompare",
      title: "Color-coded redline",
      description:
        "Removals appear struck through in red and additions highlighted in green, with unchanged text left neutral, so what changed jumps out instantly instead of hiding in a wall of identical prose.",
    },
    {
      icon: "FileText",
      title: "Mix any two formats",
      description:
        "Compare a PDF against a Word doc, a Markdown file against plain text, or two revisions of the same file. Text is extracted from PDF, DOCX, DOC, RTF, TXT and MD before diffing, so formats never have to match.",
    },
    {
      icon: "TextCursorInput",
      title: "Line & word granularity",
      description:
        "Switch between line mode for prose, contracts and READMEs and word mode to pinpoint the exact words that changed inside an otherwise-identical paragraph: recomputed live the moment you toggle.",
    },
    {
      icon: "Hash",
      title: "Live change count",
      description:
        "A running tally shows how many lines or words were added and removed, so you can quantify the delta between two versions at a glance and confirm a revision is as small, or as large, as expected.",
    },
    {
      icon: "Copy",
      title: "Copy or download the diff",
      description:
        "Copy the plain-text redline to your clipboard or download it as a.diff file to attach to a ticket, a review or an email. No screenshots, no retyping.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Both documents are read and compared on your device. Nothing is uploaded, stored or logged, so you can safely diff confidential contracts, unreleased drafts and internal specs.",
    },
  ],

  benefits: [
    {
      title: "See every edit in seconds",
      description:
        "Instead of reading two documents side by side and hoping you spot the change, get a single color-coded view that flags every insertion and deletion for you.",
    },
    {
      title: "Compare across formats",
      description:
        "The other person sent a PDF and you have the Word original? No problem: the tool normalises both to text first, so you can diff a PDF against a DOCX, or Markdown against plain text, without converting anything by hand.",
    },
    {
      title: "Keep confidential files private",
      description:
        "Legal, HR and product documents never leave your machine. There is no server round-trip, so a sensitive contract or an unreleased spec is safe to compare here.",
    },
    {
      title: "Quantify the change",
      description:
        "The added/removed counter turns a vague 'they changed some things' into a concrete number, which is exactly what you want to note on a review or in a changelog.",
    },
  ],

  howTo: [
    {
      title: "Add the original",
      description:
        "Drop, paste or browse to your first document: the baseline you want to compare against. PDF, Word, RTF, TXT and Markdown are all accepted.",
    },
    {
      title: "Add the revision",
      description:
        "Add the second document (the changed or newer version) into the second slot. The two files don't have to be the same format.",
    },
    {
      title: "Choose line or word mode",
      description:
        "Pick line granularity for prose and contracts, or word granularity to pinpoint changes inside a paragraph. The diff recomputes instantly when you switch.",
    },
    {
      title: "Read the redline",
      description:
        "Scan the color-coded result (green for additions, red strike-through for removals) and check the added/removed count for the size of the change.",
    },
    {
      title: "Copy, download or reset",
      description:
        "Copy the diff to your clipboard, download it as a .diff file, or reset both slots to compare a new pair of documents.",
    },
  ],

  formats: {
    input: ["PDF", "DOCX", "DOC", "RTF", "TXT", "MD"],
    output: ["Diff", "TXT"],
  },

  useCases: [
    {
      audience: "Legal / Contracts",
      title: "Redline a contract revision",
      description:
        "Compare the counterparty's returned PDF against your original Word draft to see exactly which clauses were added, cut or reworded before you sign.",
    },
    {
      audience: "Writer / Editor",
      title: "Spot edits between drafts",
      description:
        "Diff two versions of an article, chapter or brief to see every sentence an editor changed, without manually re-reading the whole thing line by line.",
    },
    {
      audience: "Developer / Docs",
      title: "Diff two READMEs or specs",
      description:
        "Compare an old Markdown README or a text spec against the new one to review exactly what was documented, deprecated or rewritten.",
    },
    {
      audience: "Student / Researcher",
      title: "Track changes across submissions",
      description:
        "Compare a returned essay or thesis PDF against your saved copy to see precisely what feedback altered, or confirm which passages a revision touched.",
    },
  ],

  troubleshooting: [
    {
      problem: "My PDF shows as empty or almost no text is compared.",
      solution:
        "The PDF is probably a scan or an image-only export, which has no selectable text to extract. Run it through an OCR tool first to add a text layer, then compare the OCR'd version.",
    },
    {
      problem: "The whole document shows as changed when I only edited a little.",
      solution:
        "You're likely in line mode where a single reflowed or re-wrapped line reads as changed. Switch to word mode to see the exact words that differ, and note that PDF and Word extraction can wrap text differently, which shifts line boundaries.",
    },
    {
      problem: "Formatting, images or tables aren't shown as differences.",
      solution:
        "This tool compares the text of two documents, not their visual layout. Fonts, colors, images, tables and page breaks are intentionally out of scope: only the readable text is diffed.",
    },
    {
      problem: "My .doc (old Word format) didn't extract cleanly.",
      solution:
        "Legacy binary .doc support is best-effort. The modern .docx format extracts most reliably. If a .doc looks wrong, open it in Word or an editor and re-save it as .docx, then compare again.",
    },
  ],

  tips: [
    "Use line mode for contracts, essays and READMEs where you care about whole rewritten sentences. Switch to word mode to catch a single changed figure or name inside a paragraph.",
    "Put the older version in the first slot and the newer one in the second so green reads as 'added in the new version' and red as 'removed from the old', the natural before/after direction.",
    "Comparing a PDF against its Word source? Expect line boundaries to differ because the two formats wrap text differently. Word mode gives a cleaner read in that case.",
    "For a scanned PDF, OCR it first. The comparer can only diff text that actually exists as text in the file.",
    "Download the diff as a .diff file to attach it to a review, a ticket or an email instead of pasting a screenshot.",
  ],

  security:
    "Both documents are read and compared entirely in your browser. Neither file is ever uploaded to a server. PDF text is pulled with pdf.js, Word with Mammoth, and RTF with a built-in parser, all on your device. Nothing is stored, logged or transmitted. That means confidential contracts, unreleased drafts and internal specs are safe to compare here. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Are my documents uploaded to a server?",
      answer:
        "No. Both files are read and compared locally in your browser, PDF text via pdf.js, Word via Mammoth, RTF via a built-in parser, and plain text decoded directly. Nothing leaves your device, so there is nothing for us to store, log or see, and it is safe to compare confidential contracts and drafts.",
    },
    {
      question: "Which file types can I compare?",
      answer:
        "PDF, Word (.docx and best-effort.doc), RTF, plain text (.txt) and Markdown (.md). You can mix formats freely (for example compare a PDF against a Word document, or Markdown against plain text) because each file is normalised to text before the diff runs.",
    },
    {
      question: "Can I compare a PDF against a Word document?",
      answer:
        "Yes. The tool extracts the text from each file first, so the two documents don't need to be the same format. Just note that PDF and Word can wrap text into lines differently, so word mode often gives a cleaner comparison than line mode across formats.",
    },
    {
      question: "What's the difference between line mode and word mode?",
      answer:
        "Line mode flags whole lines that were added or removed, best for prose, contracts and READMEs where you want rewritten sentences highlighted. Word mode pinpoints the exact words that changed inside an otherwise-identical passage, best for catching a single altered name, date or figure. You can switch at any time and the diff recomputes instantly.",
    },
    {
      question: "Does it show formatting, image or layout differences?",
      answer:
        "No, and it's honest about that. The comparer diffs the readable text of two documents, not their visual appearance. Fonts, colors, images, tables and page breaks are out of scope. If you need a pixel-level visual redline, this is not that tool. It is a fast, private text-difference viewer.",
    },
    {
      question: "Why does my scanned PDF show no differences?",
      answer:
        "A scanned or image-only PDF contains pictures of text, not actual text, so there is nothing to extract or diff. Run it through an OCR tool first to add a real text layer, then compare the OCR'd file.",
    },
    {
      question: "Can I save or share the comparison?",
      answer:
        "Yes. You can copy the plain-text redline to your clipboard or download it as a.diff file to attach to a ticket, a review or an email. No screenshots required.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There is a generous guard so the browser tab stays responsive, and very large PDFs take a moment to extract because the text layer is read page by page. Typical contracts, articles, specs and READMEs are well within it. For enormous documents, compare the relevant sections.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, compare two PDF, Word, RTF, text or Markdown documents with in-browser text extraction, a color-coded added/removed diff, line and word granularity, a live change count, copy, download-as-.diff and reset.",
    },
    {
      date: "2026-06-23",
      change:
        "Added word-level granularity alongside line mode, plus clearer guidance for cross-format (PDF vs. Word) comparisons where line boundaries differ.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved handling of empty and scan-only PDFs with an explicit 'no text to compare' notice, and refined the added/removed counter for whitespace-only changes.",
    },
  ],

  relatedTools: [
    "merge-pdf",
    "split-pdf",
    "pdf-to-word",
    "word-to-pdf",
    "json-formatter",
  ],
};

export default documentComparer;
