import type { Tool } from "@/types";

/**
 * Delete PDF Pages, a single-document, page-aware PDF tool. It mirrors the
 * Merge PDF reference shape (accent, full micro-site content, useCases /
 * troubleshooting / tips / security) but every field is unique to deletion:
 * you tick the pages you want gone on a thumbnail grid, and pdf-lib rebuilds the
 * document from only the pages you keep, in the browser, with a guard that
 * refuses to remove the very last page, and nothing ever uploaded.
 */
const deletePdfPages: Tool = {
  slug: "delete-pdf-pages",
  title: "Delete PDF Pages",
  description:
    "Remove pages from a PDF by ticking them on a thumbnail grid (blank sheets, drafts, duplicates) then download the trimmed file. Free and 100% in your browser.",
  category: "pdf-tools",
  group: "Organize PDF",
  icon: "FileMinus2",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Delete Pages from a PDF: Free & Private",
  tagline:
    "See every page as a thumbnail, tick the ones you don't want, and delete them for good. The pages you keep are rebuilt into one clean PDF: previewed on screen, never uploaded, with no watermark.",
  longDescription:
    "The GigAI PDF Page Remover lets you take pages out of a document without touching a server. Upload one PDF, and every page appears as a thumbnail you can select with a click or the keyboard. Tick the blank sheets, scanning artefacts, old drafts or confidential pages you want removed, and the tool rebuilds a fresh PDF from only the pages you keep (in their original order) using pdf-lib right inside your browser tab. The kept pages are copied over exactly as they were, so text stays selectable and images keep their resolution. A built-in guard stops you from deleting every page, so you can never end up with an empty file. Because it all runs locally, even a large scanned document trims in a moment and stays completely private.",

  ctaText: "Delete Pages",

  keywords: [
    "delete pdf pages",
    "remove pages from pdf",
    "delete pages from pdf",
    "remove page from pdf",
    "delete pdf pages online",
    "remove blank pages pdf",
    "pdf page remover",
    "trim pdf pages",
    "cut pages from pdf",
  ],

  seo: {
    title: "Delete PDF Pages: Remove Pages from a PDF Online Free | GigAI Tools",
    description:
      "Delete pages from a PDF for free. Tick the pages to remove on a thumbnail grid and download the trimmed file, 100% private, no uploads, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "MousePointerClick",
      title: "Pick pages by thumbnail",
      description:
        "Every page renders as a preview, so you delete by sight. Not by guessing page numbers. Click or tap a thumbnail to mark it for removal.",
    },
    {
      icon: "CheckCheck",
      title: "Multi-select in one pass",
      description:
        "Tick as many pages as you like before you commit. Remove a single stray sheet or a dozen drafts in one action, then download once.",
    },
    {
      icon: "ShieldAlert",
      title: "Can't delete everything",
      description:
        "A built-in guard blocks removing the final page, so you never end up with an empty document. At least one page always survives.",
    },
    {
      icon: "FileCheck2",
      title: "Kept pages untouched",
      description:
        "The pages you keep are copied over as-is in their original order. Text stays selectable, images keep their quality. Nothing is re-rendered.",
    },
    {
      icon: "ShieldCheck",
      title: "Runs in your browser",
      description:
        "Your PDF is read and rebuilt locally with pdf-lib. It's never uploaded, stored or seen by anyone, the file only ever exists on your device.",
    },
  ],

  benefits: [
    {
      title: "See exactly what you're cutting",
      description:
        "You're never editing a blind list of page numbers. The thumbnails show the real content, so you delete the right sheet the first time.",
    },
    {
      title: "Safe by default",
      description:
        "The tool refuses to remove every page and never overwrites your original. It hands you a fresh trimmed copy, so a mistake is never permanent.",
    },
    {
      title: "Quality stays intact",
      description:
        "Deleting a page doesn't touch the ones you keep. They carry over pixel-for-pixel, so the trimmed PDF looks identical minus the removed pages.",
    },
    {
      title: "Free, private, no sign-up",
      description:
        "No account, no watermark, no daily cap. Because the work runs on your device, there's no server to pay for, so it's genuinely free.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag a single PDF onto the drop zone or click to browse. Every page appears as a numbered thumbnail you can select.",
    },
    {
      title: "Tick pages to remove",
      description:
        "Click each page you want gone: blank sheets, duplicates, old drafts. Selected pages are highlighted. Click again to keep one.",
    },
    {
      title: "Delete the pages",
      description:
        "Hit Delete Pages. The tool rebuilds the document from only the pages you kept, in their original order, entirely in your browser.",
    },
    {
      title: "Download",
      description:
        "Download your trimmed PDF. Not quite right? Start over and reselect, it's instant, unlimited and never uploaded.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Strip an internal page before sending",
      description:
        "A proposal has an internal pricing note on page two that the client shouldn't see. Delete just that page and send the polished rest.",
    },
    {
      audience: "Student",
      title: "Remove a rejected draft page",
      description:
        "Your combined assignment includes an old draft page you replaced. Take it out so the final submission reads cleanly from start to finish.",
    },
    {
      audience: "Business",
      title: "Clean up a scanned batch",
      description:
        "A scanned stack of forms picked up blank separator sheets and a mis-fed page. Delete them so the archived file is tidy and accurate.",
    },
  ],

  troubleshooting: [
    {
      problem: "The Delete button won't let me remove every page.",
      solution:
        "That's intentional, a PDF must keep at least one page. Leave one page selected to keep (unticked), or if you meant to keep almost nothing, use the Split or Extract tool to pull out only the page you want instead.",
    },
    {
      problem: "I selected the wrong page and the thumbnails all look similar.",
      solution:
        "Click the ticked page again to unselect it: nothing is deleted until you press Delete Pages. Zoom your browser in to tell near-identical scans apart, and check the page number under each thumbnail before you commit.",
    },
    {
      problem: "My PDF won't open or the pages won't load.",
      solution:
        "The file may be password-protected or damaged. Remove the password with our Unlock PDF tool first, or re-save it from its source, then upload it again.",
    },
  ],

  tips: [
    "Nothing is removed until you press Delete Pages, so tick freely and review your selection first: deselecting is just another click.",
    "Deleting is the inverse of extracting: if you want to keep only a handful of pages, our Extract PDF Pages tool is faster than removing everything else.",
    "Trim first, then merge, delete the dead pages from each source file before combining them so the final document has no gaps.",
    "The thumbnails match the output exactly, so trust what you see: the pages left unticked are precisely the pages you'll download.",
  ],

  security:
    "Your PDF is read and rebuilt entirely in your browser with pdf-lib and never uploaded to any server. The removed pages are simply left out of a fresh copy. Nothing is stored, logged or shared, and closing the tab erases every trace of the file.",

  faq: [
    {
      question: "Are the pages really removed, or just hidden?",
      answer:
        "Really removed. The tool builds a brand-new PDF containing only the pages you kept, copied over with pdf-lib. The deleted pages, and all of their content, are simply not part of the downloaded file, so there's nothing hidden to recover from it.",
    },
    {
      question: "Can I delete more than one page at a time?",
      answer:
        "Yes. Tick every page you want gone on the thumbnail grid before you press Delete Pages, one page or many. They're all removed in a single pass, and the pages you keep stay in their original order.",
    },
    {
      question: "What happens if I try to delete all the pages?",
      answer:
        "The tool won't let you. A PDF has to contain at least one page, so if your selection would empty the document, you'll get a clear message asking you to keep one. This guard means you can never accidentally produce a blank file.",
    },
    {
      question: "Will deleting pages change the ones I keep?",
      answer:
        "No. The pages you keep are copied over exactly as they were, same text, same images, same order. Only the removed pages are left out. Nothing is re-rendered, so the surviving pages keep their original quality and stay searchable.",
    },
    {
      question: "Is my file uploaded anywhere?",
      answer:
        "Never. The whole process runs locally in your browser using pdf-lib. Your PDF is read, trimmed and downloaded on your own device, so there's nothing for us to upload, store or read.",
    },
    {
      question: "Can I delete pages from a password-protected PDF?",
      answer:
        "Not directly. An encrypted PDF has to be unlocked first. Use our Unlock PDF tool to remove the password (you'll need to know it), then upload the unlocked file here to delete pages from it.",
    },
  ],

  relatedTools: ["extract-pdf-pages", "split-pdf", "reorder-pdf-pages", "merge-pdf"],
};

export default deletePdfPages;
