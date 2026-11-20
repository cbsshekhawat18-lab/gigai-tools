import type { Tool } from "@/types";

/**
 * Add Page Numbers to a PDF, a Document Studio annotation tool.
 *
 * Drop a PDF, choose where the number sits, how it reads ("Page 3 of 12" or a
 * bare "3"), which number the sequence starts on, and the font size / margin -
 * then stamp real vector text onto every page with pdf-lib's built-in Helvetica
 * (via `pdfops.addPageNumbers`). Everything below is written for the exact
 * queries people type when they need to number a PDF, and every claim matches
 * what the in-browser stamper actually does: it draws NEW selectable text on top
 * of each page, it never re-flows or re-rasterises your document, and it can skip
 * a leading cover page. Nothing is shared with the watermark/signature copy.
 */
const documentPageNumber: Tool = {
  slug: "document-page-number",
  title: "Add Page Numbers to PDF",
  description:
    "Stamp page numbers onto a PDF in your browser. Pick the corner, choose a bare number or a 'Page X of Y' label, set the start number, font size and margin, and skip a cover page. Real selectable text, nothing uploaded.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "Hash",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-18",

  h1: "Add Page Numbers to a PDF Online",
  tagline:
    "Drop a PDF and stamp clean, consistent page numbers on every page: choose the corner, a bare number or a 'Page X of Y' label, the starting number, the font size and the margin, and optionally skip a cover page. The numbers are real, selectable vector text drawn on top of your document, and everything runs 100% in your browser. Your file is never uploaded.",
  longDescription:
    "The GigAI Add Page Numbers tool paginates a PDF the way you'd expect a word processor to, but without an upload, an install, or a print-to-PDF workaround. Drop your file and a live preview shows the first numbered page immediately. From there you control exactly how the number reads and where it sits. Choose any of six positions (the three top corners/centre or the three bottom ones) pick a plain number, a 'Page X of Y' label, a 'X / Y' style or a '- X -' style, and set which number the sequence begins on (handy when a chapter continues from an earlier file). Fine-tune the font size and the distance from the page edge, and if your document opens with a title or cover page, skip it so numbering starts on the first content page while the label still counts from your chosen start. When it looks right, download a new PDF with the numbers baked in. Crucially, this tool draws the numbers as new, real vector text using pdf-lib's built-in Helvetica. It does not rasterise, re-compress or re-flow your original pages, so your document stays exactly as sharp as it was and the numbers themselves remain selectable and searchable in any PDF reader. It handles the everyday jobs people actually have: numbering a scanned contract before signing, paginating an exported report or thesis, adding folio numbers to a merged bundle of PDFs, or Bates-style sequential numbering for a set of documents. Because the whole operation happens on your device using pdf-lib loaded on demand, confidential contracts, legal bundles and unreleased reports never leave your machine: close the tab and every trace is gone. Two honest notes: the tool stamps a single number per page, so it won't detect or overwrite numbers already printed inside a scanned page's image, and it draws over the existing content, so a position that overlaps a footer can be nudged with the margin control or a different corner.",

  ctaText: "Add Page Numbers",

  keywords: [
    "add page numbers to pdf",
    "pdf page numbers",
    "number pdf pages",
    "insert page numbers pdf",
    "pdf page numbering",
    "page x of y pdf",
    "add page numbers to pdf online free",
    "bates numbering pdf",
    "paginate pdf",
    "put page numbers on pdf",
    "pdf page number online",
    "stamp page numbers pdf",
  ],

  seo: {
    title: "Add Page Numbers to PDF, Free Online, In Your Browser | GigAI Tools",
    description:
      "Free online tool to add page numbers to a PDF. Choose the position, a bare number or 'Page X of Y' label, the start number, font size and margin, and skip a cover page. Real selectable text: 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "LayoutGrid",
      title: "Six precise positions",
      description:
        "Place the number in any of six spots (top-left, top-centre, top-right or the matching bottom corners) so it sits clear of your existing headers and footers.",
    },
    {
      icon: "Hash",
      title: "Bare number or 'Page X of Y'",
      description:
        "Pick a plain page number, a 'Page X of Y' label, a compact 'X / Y', or a centred '- X -'. The total updates automatically to match how many pages you're numbering.",
    },
    {
      icon: "ListOrdered",
      title: "Custom start number",
      description:
        "Begin the sequence at any number, not just 1: perfect when a chapter continues from an earlier PDF or you want folio numbers to line up across a set.",
    },
    {
      icon: "FileMinus",
      title: "Skip a cover page",
      description:
        "Leave a title or cover page unnumbered while the count still starts from your chosen number, so the first content page reads exactly as it should.",
    },
    {
      icon: "Type",
      title: "Real selectable text",
      description:
        "Numbers are drawn as genuine vector text in Helvetica, not baked into an image. They stay crisp at any zoom and remain selectable and searchable in any reader.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Your PDF is opened, stamped and saved entirely in your browser using pdf-lib loaded on demand. Nothing is uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Your document stays untouched",
      description:
        "The tool draws new text on top of your pages rather than re-rendering them, so nothing is re-compressed or re-flowed: your PDF is exactly as sharp as before, just numbered.",
    },
    {
      title: "See the result before you save",
      description:
        "A live preview renders the first numbered page as you change the position, format, size and margin, so you commit to a download only once it looks right.",
    },
    {
      title: "No install, no upload, no watermark",
      description:
        "Get clean, consistent pagination without a desktop editor, a subscription, or sending a confidential contract to someone else's server.",
    },
  ],

  howTo: [
    {
      title: "Drop your PDF",
      description:
        "Drag a PDF onto the drop zone, click to browse, or paste one from your clipboard. A live preview of the first numbered page appears right away.",
    },
    {
      title: "Choose position and format",
      description:
        "Pick one of the six corner/centre positions and how the number reads, a bare number or a 'Page X of Y' style label.",
    },
    {
      title: "Set start, size and margin",
      description:
        "Choose the starting number, the font size and the distance from the page edge. Skip a cover page if your document opens with a title.",
    },
    {
      title: "Download the numbered PDF",
      description:
        "Click Add Page Numbers to save a new PDF with the numbers baked in as selectable text. Change the file or reset whenever you like.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Legal / Paralegal",
      title: "Number a bundle before filing",
      description:
        "Add sequential page numbers to a merged set of exhibits or a contract so every page is referenceable: start the count wherever the previous bundle left off.",
    },
    {
      audience: "Student / Researcher",
      title: "Paginate a thesis or report",
      description:
        "Number an exported dissertation or report cleanly, skipping the title page while the count still starts on the first chapter.",
    },
    {
      audience: "Operations / Admin",
      title: "Folio a merged PDF",
      description:
        "After merging several PDFs into one bundle, stamp consistent 'Page X of Y' numbers so the combined document reads as one continuous file.",
    },
    {
      audience: "Finance / Accounting",
      title: "Number statements & invoices",
      description:
        "Add page numbers to a multi-page statement or invoice pack so recipients can cite exact pages without ambiguity.",
    },
  ],

  troubleshooting: [
    {
      problem: "The number overlaps an existing footer on the page.",
      solution:
        "The tool draws over the current content, so a busy footer can collide with the number. Increase the margin so the number sits closer to the edge, or move it to a different corner or the top of the page.",
    },
    {
      problem: "My scanned PDF already shows printed numbers and now there are two.",
      solution:
        "Numbers printed inside a scanned page are part of the page image and can't be detected or removed by an overlay tool. Pick a position and start number that complements the printed ones, or use a page-organize tool to work with the scan differently.",
    },
    {
      problem: "The first page is my cover and shouldn't be numbered.",
      solution:
        "Turn on 'Skip cover page'. The leading page is left blank while the count still begins from your chosen start number, so numbering appears from the first content page onward.",
    },
    {
      problem: "The PDF is password-protected and won't open.",
      solution:
        "Remove the open password first with the Unlock PDF tool, then add page numbers to the unlocked copy. Encrypted files can't be reliably annotated in the browser.",
    },
  ],

  tips: [
    "Use 'Page X of Y' for reports and contracts so a reader always knows how much is left. Use a bare number for a clean, minimal look.",
    "Set the start number to continue a sequence across several files, e.g. begin at 13 when the previous bundle ended at 12.",
    "If a bottom-centre number clashes with a footer, bump the margin up a few points or move it to a top corner.",
    "Skip the cover page so the title page stays clean while numbering starts on the first real page.",
    "Because the numbers are real text, you can select and copy them in any reader, handy for citing an exact page.",
  ],

  security:
    "Your PDF is opened, numbered and saved entirely in your browser using pdf-lib loaded on demand. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely number confidential contracts, legal bundles and internal reports. The tool only adds text on top of your existing pages. It never re-uploads or re-hosts the original. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The file is opened, stamped and saved locally in your browser using pdf-lib loaded on demand. Your document never leaves your device, so there is nothing for us to store, log or see. It is safe to number confidential contracts and internal reports.",
    },
    {
      question: "Are the page numbers selectable and searchable?",
      answer:
        "Yes. The numbers are drawn as real vector text in Helvetica, not baked into an image, so they stay crisp at any zoom and can be selected, copied and searched in any PDF reader, just like the rest of the document's text.",
    },
    {
      question: "Can I start numbering from a number other than 1?",
      answer:
        "Yes. Set any start number and the sequence counts up from there. This is useful when a chapter continues from an earlier PDF, or when you want folio numbers to line up across a set of documents.",
    },
    {
      question: "Can I skip the cover or title page?",
      answer:
        "Yes. Turn on 'Skip cover page' and the leading page is left unnumbered while the count still begins from your chosen start number, so the first content page reads exactly as it should.",
    },
    {
      question: "Where can I put the page number?",
      answer:
        "In any of six positions: top-left, top-centre, top-right, bottom-left, bottom-centre or bottom-right. Combined with the margin control, you can keep the number clear of your existing headers and footers.",
    },
    {
      question: "Does this change or degrade my original pages?",
      answer:
        "No. The tool only draws new text on top of your existing pages. It does not re-rasterise, re-compress or re-flow the document. Your PDF stays exactly as sharp as it was. It simply gains page numbers.",
    },
    {
      question: "Can it do Bates-style numbering?",
      answer:
        "For simple sequential numbering, yes. Pick a bare-number format and a start number and every page gets the next number in the run. For full Bates stamping with prefixes and zero-padded suffixes across multiple files, treat this as the single-file pagination step.",
    },
    {
      question: "It won't open my password-protected PDF: what now?",
      answer:
        "Encrypted PDFs can't be reliably annotated in the browser. Remove the open password first with the Unlock PDF tool, then add page numbers to the unlocked copy.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drag/drop/paste a PDF, six positions, bare-number and 'Page X of Y' formats, custom start number, font size and margin, skip-cover-page, live first-page preview and one-click download. Numbers are drawn as real selectable Helvetica text, fully in the browser.",
    },
    {
      date: "2026-06-24",
      change:
        "Added compact 'X / Y' and centred '- X -' formats, a live page count in the file chip, and a clearer honesty note about stamping over scanned pages that already show printed numbers.",
    },
    {
      date: "2026-06-29",
      change:
        "Tuned the preview to re-render as you change any option and improved margin defaults so bottom-centre numbers clear common footers.",
    },
  ],

  relatedTools: [
    "merge-pdf",
    "document-organizer",
    "split-pdf",
    "unlock-pdf",
  ],
};

export default documentPageNumber;
