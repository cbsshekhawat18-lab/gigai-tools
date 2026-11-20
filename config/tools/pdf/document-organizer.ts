import type { Tool } from "@/types";

/**
 * Document Organizer: a visual page manager for PDFs.
 *
 * Every page of the uploaded PDF renders as a thumbnail in a grid. In a single
 * workspace you can drag pages into a new order, rotate any page in 90° steps,
 * and mark pages for removal: then rebuild the document once. It REUSES the
 * shared page engine end-to-end: `organizePages` from
 * `@/lib/document-tools/pdfops` composes reorder + rotate + delete into a single
 * pdf-lib rebuild (the document is copied only once), and the thumbnails come
 * from the shared `PdfPageGrid`. So there is no duplicated page-op or rendering
 * code behind this URL.
 *
 * It is deliberately distinct from the PDF Editor (which edits page CONTENT -
 * text, annotations). This tool is about page MANAGEMENT: order, orientation and
 * inclusion. Where the platform already ships single-purpose siblings (Reorder,
 * Rotate, Delete Pages), this is the one canvas that does all three at once.
 *
 * Honesty: this rearranges, rotates and drops whole pages. It never touches the
 * content inside a page. Rotation is metadata (0/90/180/270), so it is lossless;
 * deletion is permanent in the output file. A scanned/image PDF is fine to
 * organize, but its text stays un-searchable because organizing pages doesn't add
 * a text layer.
 */
const documentOrganizer: Tool = {
  slug: "document-organizer",
  title: "Document Organizer",
  description:
    "Reorder, rotate and delete PDF pages on one visual canvas. Every page renders as a thumbnail: drag to rearrange, rotate in 90° steps, mark pages to remove, then download the rebuilt PDF. 100% in your browser, nothing uploaded.",
  category: "pdf-tools",
  group: "Organize PDF",
  icon: "LayoutList",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Document Organizer, Reorder, Rotate & Delete PDF Pages Online",
  tagline:
    "Drop in a PDF and manage its pages the way you'd shuffle a deck of cards. Every page becomes a thumbnail you can drag into a new order, rotate 90° at a time to fix sideways scans, and tap to remove, all on one canvas, with a live count of what changed. One click rebuilds the file. No upload, no account, nothing stored.",
  longDescription:
    "The GigAI Document Organizer turns page housekeeping into a single, visual pass. Upload a PDF and every page renders as a thumbnail in a responsive grid. From there you can drag any page to a new position, rotate individual pages in clean 90° steps to straighten sideways scans or landscape charts, and mark the pages you don't want so they drop out of the final file: all in the same view, without switching tools or re-uploading between steps. A running summary tells you exactly what you've changed: how many pages were reordered, rotated or removed, and how many will remain, so you can confirm the result before you commit. When it looks right, one click rebuilds the document and hands you a clean PDF to download. Under the hood it reuses the platform's shared page engine: reorder, rotate and delete are composed into a single pdf-lib rebuild, so the file is copied only once rather than passed through three separate operations. That keeps the output tight and the process fast. Because everything runs on your device, confidential contracts, HR packets, scanned records and unreleased decks never leave your machine. There's no server to upload to and nothing is logged. Two honest boundaries worth stating up front: this tool manages whole pages (order, orientation and inclusion) and never edits the content inside a page (for text and annotation edits, use the PDF Editor). And rotation is stored as lossless page metadata (0°/90°/180°/270°), while a removed page is permanently absent from the file you download, so keep your original if you might need those pages back.",

  ctaText: "Rebuild PDF",

  keywords: [
    "organize pdf pages",
    "pdf page organizer",
    "manage pdf pages online",
    "pdf page manager",
    "pdf organizer free",
    "edit pdf page order",
    "pdf page thumbnail view",
    "restructure pdf document",
    "pdf page management tool",
  ],

  seo: {
    title:
      "Document Organizer, Reorder, Rotate & Delete PDF Pages Online Free | GigAI Tools",
    description:
      "Free online PDF page organizer. Drag to reorder, rotate 90° and delete pages on one visual canvas of thumbnails, then download the rebuilt PDF. Fast, lossless rotation, 100% in your browser: nothing uploaded.",
  },

  features: [
    {
      icon: "LayoutList",
      title: "One canvas for every page",
      description:
        "Every page of your PDF renders as a thumbnail in a responsive grid, so you see the whole document at a glance and manage it visually instead of guessing at page numbers.",
    },
    {
      icon: "ArrowDownUp",
      title: "Drag-and-drop reordering",
      description:
        "Grab any page and drop it into its new spot, or focus a page and press Alt + ← / → to nudge it. The numbering updates live, so the sequence you see is the sequence you'll get.",
    },
    {
      icon: "RotateCw",
      title: "Lossless 90° rotation",
      description:
        "Rotate individual pages in clean 90° steps to fix sideways scans or landscape charts. Rotation is stored as page metadata, so it's lossless. No re-rendering, no quality drop.",
    },
    {
      icon: "Trash2",
      title: "Mark pages to remove",
      description:
        "Tap any page to drop it from the output. A live count shows how many pages remain, and you can un-mark just as easily before you rebuild. Nothing is removed until you download.",
    },
    {
      icon: "Layers",
      title: "One clean rebuild",
      description:
        "Reorder, rotate and delete are composed into a single pass, so the document is copied only once. The output is a tight, standards-clean PDF. Not a file run through three separate tools.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Pages are rendered and the PDF is rebuilt entirely on your device. Nothing is uploaded, stored or logged, so confidential contracts, records and decks stay private.",
    },
  ],

  benefits: [
    {
      title: "Fix a whole document in one pass",
      description:
        "Reorder a misassembled scan, straighten the sideways pages, and drop the blank separators: all in one view, then rebuild once, instead of chaining three separate tools and re-uploading between them.",
    },
    {
      title: "See exactly what you'll get",
      description:
        "The thumbnails and live numbering are the source of truth. The page order, orientation and inclusion you see on the canvas is precisely what lands in the downloaded file. No surprises on export.",
    },
    {
      title: "Lossless, tight output",
      description:
        "Rotation is metadata and the file is rebuilt in a single copy, so you get a clean PDF at full quality without the bloat of round-tripping through multiple exports.",
    },
    {
      title: "Keep sensitive documents private",
      description:
        "Legal, HR, medical and financial PDFs never leave your machine: there's no server round-trip, so a confidential packet is safe to reorganize here.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drop a PDF onto the canvas or browse to it. Every page renders as a thumbnail in a grid so you can see and manage the whole document at once.",
    },
    {
      title: "Reorder pages",
      description:
        "Drag any page to a new position, or focus a page and press Alt + ← / → to move it. The page numbers update live as you rearrange.",
    },
    {
      title: "Rotate and remove",
      description:
        "Use each page's rotate control to spin it 90° at a time, and tap a page to mark it for removal. A running summary shows what changed and how many pages remain.",
    },
    {
      title: "Rebuild and download",
      description:
        "Click Rebuild PDF to compose your changes into a single clean file, then download it. Start over anytime to organize another document.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Operations / Admin",
      title: "Fix a misassembled scan",
      description:
        "A batch scanner spat out pages in the wrong order and rotated a few sideways? Reorder them, straighten the rotated ones, and drop the blank separators, then rebuild one clean PDF.",
    },
    {
      audience: "Legal / Contracts",
      title: "Assemble a clean packet",
      description:
        "Trim the draft cover pages, put the signed exhibits in the right order and remove duplicates so the packet you send is exactly the pages you mean, in the sequence you mean.",
    },
    {
      audience: "Student / Researcher",
      title: "Tidy up lecture material",
      description:
        "Drop the blank or duplicate slides from a downloaded deck, rotate a landscape diagram upright, and reorder chapters into study sequence before printing or sharing.",
    },
    {
      audience: "Product / Design",
      title: "Curate a portfolio or deck",
      description:
        "Reorder case studies to lead with your strongest work, remove the pages you'd rather not send, and hand over a tight PDF instead of the full export.",
    },
  ],

  troubleshooting: [
    {
      problem: "The page thumbnails are slow to appear.",
      solution:
        "Thumbnails render page by page on your device, so a large or high-resolution PDF takes a moment. Let the previews finish loading before you rebuild, the drag, rotate and delete controls activate as pages appear.",
    },
    {
      problem: "I removed a page and now I want it back.",
      solution:
        "Un-marking a page before you rebuild restores it instantly, but a removed page is permanently absent from the downloaded file. If you've already downloaded, re-upload your original PDF and organize again. Keep the original whenever pages might be needed later.",
    },
    {
      problem: "My rotation looks fine on screen but prints or opens rotated.",
      solution:
        "Rotation is written as standard page metadata (0/90/180/270). Almost every viewer honours it, but a few legacy or embedded viewers ignore page rotation flags. If a target viewer misbehaves, rotate to the orientation that reads correctly in that specific app.",
    },
    {
      problem: "The text in my organized PDF still isn't searchable.",
      solution:
        "Organizing pages rearranges, rotates and drops whole pages. It never adds a text layer. If the source was a scanned or image-only PDF, its text stays un-searchable. Run it through an OCR tool first to make the text selectable.",
    },
  ],

  tips: [
    "Do all your reordering, rotating and deleting in this one view, then rebuild once. It keeps the output file tight and avoids re-uploading between steps.",
    "Focus a page and use Alt + ← / → for precise, keyboard-only reordering when dragging across many pages is fiddly.",
    "Rotation is lossless page metadata, so rotate freely to straighten scans. You won't lose any quality no matter how many times you spin a page.",
    "Un-mark a page any time before rebuilding to bring it back. Once you download, removed pages are gone from that file, so keep your original.",
    "Only need one operation? The single-purpose Reorder, Rotate and Delete Pages siblings are lighter, but this canvas is the fastest way to do all three together.",
  ],

  security:
    "Your PDF is rendered into thumbnails and rebuilt entirely in your browser. The file is never uploaded to any server. Reorder, rotate and delete all run on your device with pdf-lib, and nothing is stored, logged or transmitted. That means confidential contracts, HR packets, medical records and unreleased decks are safe to reorganize here. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The page thumbnails are rendered and the final PDF is rebuilt locally in your browser using pdf-lib, loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to organize confidential documents.",
    },
    {
      question: "Can I reorder, rotate and delete pages at the same time?",
      answer:
        "Yes, That is the point. All three actions happen on one canvas of thumbnails, and when you rebuild they're composed into a single pass rather than three separate operations, so the output is one clean file copied only once.",
    },
    {
      question: "Does rotating pages reduce quality?",
      answer:
        "No. Rotation is written as standard page metadata (0°/90°/180°/270°), not by re-rendering the page, so it is completely lossless. You can rotate a page as many times as you like without any drop in quality.",
    },
    {
      question: "Can I get a deleted page back?",
      answer:
        "Before you rebuild, just un-mark the page and it returns instantly. After you download, a removed page is permanently absent from that file, so keep your original PDF whenever you might need those pages again, and re-upload it to start over.",
    },
    {
      question: "How is this different from the PDF Editor?",
      answer:
        "The Document Organizer manages whole pages, their order, orientation and whether they're included. The PDF Editor edits the content inside a page, such as text and annotations. Use this tool to assemble and clean up a document's pages. Use the editor to change what's printed on them.",
    },
    {
      question: "Will it work on a scanned PDF?",
      answer:
        "Yes. You can reorder, rotate and delete pages of a scanned or image-only PDF just fine. Note that organizing pages doesn't add a text layer, so the text stays un-searchable: run the file through OCR first if you need selectable text.",
    },
    {
      question: "Is there a limit on the number of pages?",
      answer:
        "There's no hard page cap, but every page is rendered as a thumbnail on your device, so very large PDFs take longer to preview and use more memory. Typical contracts, reports, scans and decks are comfortably within reach. For enormous files, expect the previews to take a little longer to appear.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "Neither. It runs in your browser with no sign-up, no install and no watermark. Open the page, drop a PDF, organize the pages and download the rebuilt file.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: a single visual canvas of page thumbnails with drag-and-drop reordering, lossless 90° rotation, mark-to-delete, a live change summary and a one-pass rebuild, all in the browser.",
    },
    {
      date: "2026-06-24",
      change:
        "Added Alt + ← / → keyboard reordering and per-page rotate controls to the thumbnail grid, plus a running count of reordered, rotated and removed pages.",
    },
    {
      date: "2026-06-30",
      change:
        "Composed reorder, rotate and delete into a single pdf-lib rebuild so the document is copied only once, and clarified the honesty notes on lossless rotation vs. permanent deletion.",
    },
  ],

  relatedTools: [
    "reorder-pdf-pages",
    "rotate-pdf",
    "delete-pdf-pages",
    "pdf-editor",
    "merge-pdf",
  ],
};

export default documentOrganizer;
