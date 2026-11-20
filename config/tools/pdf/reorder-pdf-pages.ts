import type { Tool } from "@/types";

/**
 * Reorder PDF Pages, rearrange the pages of a single document by dragging their
 * thumbnails (or moving them with the keyboard) into a new sequence, then export
 * a fresh PDF built to that exact order. Everything runs in the browser with
 * pdf-lib: pages are re-copied in the order you set, so content is preserved and
 * nothing is uploaded. All copy below is unique to reordering.
 */
const reorderPdfPages: Tool = {
  slug: "reorder-pdf-pages",
  title: "Reorder PDF Pages",
  description:
    "Drag the pages of a PDF into a new order, then download the rearranged file. Free, visual and fully in your browser. No uploads.",
  category: "pdf-tools",
  group: "Organize PDF",
  icon: "ArrowDownUp",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Reorder PDF Pages Online: Drag to Rearrange, Free & Private",
  tagline:
    "See every page as a thumbnail, drag it where it belongs, and export a PDF that reads in exactly the order you set. No uploads, no watermark, no page limit.",
  longDescription:
    "The GigAI Reorder PDF Pages tool turns page shuffling into a simple drag-and-drop. Open one PDF and every page appears as a numbered thumbnail. Grab any page and drop it into its new spot, or nudge it with Alt + arrow keys if you prefer the keyboard. The live preview always shows the current sequence, so you can see the story take shape before you commit. When you're happy, the tool rebuilds the document with pdf-lib in your browser, copying each page, in your order, into a brand-new PDF. Because the pages themselves aren't re-rendered, text stays selectable and images keep their quality. Nothing is sent to a server, there's no cap on page count, and the result is watermark-free.",

  ctaText: "Reorder Pages",

  keywords: [
    "reorder pdf pages",
    "rearrange pdf pages",
    "move pdf pages",
    "sort pdf pages",
    "change page order pdf",
    "drag pdf pages",
    "pdf page order",
    "reorder pdf online",
  ],

  seo: {
    title: "Reorder PDF Pages, Rearrange & Sort Pages Online Free | GigAI Tools",
    description:
      "Reorder PDF pages online free. Drag page thumbnails into a new sequence, then download, 100% private, in your browser, no uploads, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "MousePointerClick",
      title: "Visual drag-and-drop",
      description:
        "Every page shows as a numbered thumbnail. Grab one and drop it where it belongs. You rearrange what you can see, not a list of page numbers you have to picture.",
    },
    {
      icon: "Keyboard",
      title: "Keyboard reordering",
      description:
        "Prefer not to drag? Focus any page and press Alt + Left or Right to slide it one position at a time. Fully operable without a mouse.",
    },
    {
      icon: "Eye",
      title: "Live order preview",
      description:
        "The grid renumbers itself as you move pages, so the new sequence is always in front of you before you export a single byte.",
    },
    {
      icon: "FileCheck2",
      title: "Content preserved exactly",
      description:
        "Pages are re-copied, not re-rendered. Text stays selectable, images keep their resolution, and the rebuilt PDF matches the originals page-for-page.",
    },
    {
      icon: "ShieldCheck",
      title: "Runs entirely in your browser",
      description:
        "Your document is read and rebuilt locally with pdf-lib. It never leaves your device, so there's no upload, no queue and nothing for us to store.",
    },
  ],

  benefits: [
    {
      title: "You see the whole document",
      description:
        "No guessing which page is which. Thumbnails let you spot the intro, the appendix and the misplaced chart at a glance, then move them with confidence.",
    },
    {
      title: "Nothing leaves your device",
      description:
        "Reordering happens inside your browser tab. Sensitive contracts, reports and coursework stay private because there's nothing to upload.",
    },
    {
      title: "Free with no limits",
      description:
        "No account, no page cap, no paywall and no watermark. Rearrange a two-page memo or a 300-page manual as many times as you like.",
    },
    {
      title: "Undo is one drag away",
      description:
        "Not sure about a move? Just drag the page back. Because the preview is live and instant, experimenting with the order costs you nothing.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag a single PDF onto the drop zone or click to browse. Its pages render as thumbnails, each labelled with its current position.",
    },
    {
      title: "Drag pages into order",
      description:
        "Move any page by dragging its thumbnail, or focus it and press Alt + Left / Right. The grid renumbers live as the sequence changes.",
    },
    {
      title: "Rebuild the PDF",
      description:
        "Hit Reorder Pages. The tool copies every page into a new document following your exact sequence, locally, in a moment.",
    },
    {
      title: "Download",
      description:
        "Download the rearranged PDF. Want to tweak it? Drag a page and export again. Reordering is instant and unlimited.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Fix a report that scanned out of sequence",
      description:
        "A batch scanner fed pages in the wrong order? Drag the cover, summary and signature page back into place and export a report that reads correctly.",
    },
    {
      audience: "Student",
      title: "Put a merged thesis in the right order",
      description:
        "After combining chapters, appendices and the bibliography, slide any stray page into position so your submission flows title-to-references.",
    },
    {
      audience: "Business",
      title: "Reorder a contract before signing",
      description:
        "Move the terms ahead of the schedules, or bring the signature block to the front, so counterparties review clauses in the sequence you intend.",
    },
  ],

  troubleshooting: [
    {
      problem: "My changes didn't seem to save when I reopened the file.",
      solution:
        "Make sure you clicked Reorder Pages and downloaded the new file. The tool builds a fresh PDF at export time: the on-screen preview alone doesn't overwrite your original, so keep the downloaded copy.",
    },
    {
      problem: "The thumbnails are slow to appear for a large PDF.",
      solution:
        "Rendering hundreds of previews takes a moment on first load. Let the grid finish. Once thumbnails are visible, dragging and exporting are instant. Closing other heavy browser tabs frees up memory.",
    },
    {
      problem: "I only need to move a couple of pages, not resequence everything.",
      solution:
        "You don't have to touch every page. Just drag the ones that are out of place. Untouched pages keep their spots, so a two-page fix is only two drags.",
    },
  ],

  tips: [
    "Do the big moves first (drag a whole section into place), then fine-tune single pages, it's faster than nudging one step at a time.",
    "Use the page numbers on each thumbnail as your map: they show the current position, and they renumber the instant you drop a page.",
    "If a document arrived reversed from a scanner, drag the last page to the top and work down: the sequence flips quickly.",
    "Only need to pull a few pages out rather than resequence? Try Extract PDF Pages. To drop pages entirely, use Delete PDF Pages.",
  ],

  security:
    "Your PDF is opened and rebuilt entirely in your browser with pdf-lib, it's never uploaded to any server. Nothing is stored, logged or shared, and closing the tab clears every trace of the file.",

  faq: [
    {
      question: "Is my PDF uploaded when I reorder it?",
      answer:
        "No. The whole process (reading the pages, rendering thumbnails and rebuilding the document) runs in your browser with pdf-lib. Your file never leaves your device, so there's nothing for us to store or see.",
    },
    {
      question: "How do I move a page to a new position?",
      answer:
        "Drag its thumbnail and drop it where you want it, and the pages around it shift to make room. If you'd rather use the keyboard, focus a page and press Alt + Left or Alt + Right to move it one slot at a time.",
    },
    {
      question: "Does reordering change the page content or quality?",
      answer:
        "No. The tool copies each page into a new PDF rather than re-rendering it, so text stays selectable and images keep their original resolution. Only the sequence of the pages changes.",
    },
    {
      question: "Is there a limit on how many pages I can rearrange?",
      answer:
        "There's no built-in cap. You can reorder a handful of pages or a few hundred. The only practical limit is your device's memory, since the whole document is held in the browser while you work.",
    },
    {
      question: "Will the reordered file keep bookmarks, links or form fields?",
      answer:
        "Page content (text, images and vector graphics) is preserved exactly. Some document-level extras like internal bookmarks or cross-page links may not carry over, because a new document is assembled from the copied pages. Always check the download if those features matter.",
    },
    {
      question: "Can I reorder a password-protected PDF?",
      answer:
        "Not while it's encrypted. Remove the password first with our Unlock PDF tool (you'll need to know it), then open the unlocked file here to rearrange its pages.",
    },
  ],

  relatedTools: ["merge-pdf", "rotate-pdf", "extract-pdf-pages", "delete-pdf-pages"],
};

export default reorderPdfPages;
