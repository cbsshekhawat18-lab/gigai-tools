import type { Tool } from "@/types";

/**
 * Document Watermark, stamp a text or image watermark onto every page of a PDF.
 *
 * A focused annotation tool that REUSES the shared PDF watermark engine
 * (`pdfops.addWatermark`, itself built on pdf-lib) rather than reimplementing
 * page drawing. It gives the everyday knobs people actually search for, the
 * watermark text or logo, opacity, angle, single-vs-tiled placement and
 * size, with a live on-page preview so you can see the diagonal "CONFIDENTIAL"
 * or your logo land before you export. Every string below is written for the
 * exact queries people type when they need to watermark a PDF, and no claim
 * outruns what the client-side pdf-lib renderer does (see the honesty notes).
 */
const documentWatermark: Tool = {
  slug: "document-watermark",
  title: "Watermark PDF",
  description:
    "Stamp a text or image watermark across every page of a PDF: set the opacity, angle and size, tile it or centre it, and preview the result before you export. 100% in your browser, nothing uploaded.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "Stamp",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "Watermark a PDF Online: Add Text or Logo to Every Page",
  tagline:
    "Drop in a PDF, type a watermark like DRAFT or CONFIDENTIAL (or upload a PNG/JPG logo) then dial in the opacity, angle and size and watch it land on the page live. Tile it edge-to-edge or centre a single stamp, then export a watermarked copy. Runs entirely in your browser. Your file is never uploaded.",
  longDescription:
    "The GigAI Watermark PDF tool stamps a repeating or centred watermark onto every page of a document without a login, an upload, or a desktop editor. Drop in a PDF, choose text mode to type a label such as DRAFT, CONFIDENTIAL, SAMPLE, or your company name, or switch to image mode and add a PNG or JPG logo, then tune exactly how it looks: opacity so the mark reads without hiding the content beneath it, a rotation angle for the classic 45° diagonal, and a size for either mode. Text marks are drawn in a neutral grey that reads over light pages. Choose a single centred stamp or tile the watermark across the whole page so it can't be cropped out, and a live preview renders your choices over the first page so you can judge the look before committing. When it's right, one click writes a new watermarked PDF that you download locally: the original is untouched. Because the stamp is drawn as a real vector text or embedded image layer over each page using pdf-lib, the output stays a genuine PDF (not a flattened screenshot) and the underlying text remains selectable. This is the tool for marking review drafts, protecting shared proposals and portfolios, branding exported reports with a logo, labelling internal-only handouts, and adding a light SAMPLE stamp to previews you send to clients. One honest note: this overlays a visible watermark on top of the page. It is a deterrent and a branding layer, not encryption or DRM, and a determined user with the right software can remove an overlay. If you need to actually restrict who can open or edit a file, combine it with the sibling Protect PDF (password) tool. Everything runs on your device with pdf-lib loaded on demand, so contracts, unreleased decks and confidential drafts never leave your machine, close the tab and every trace is gone.",

  ctaText: "Add Watermark",

  keywords: [
    "watermark pdf",
    "add watermark to pdf",
    "pdf watermark online",
    "watermark pdf free",
    "add text watermark to pdf",
    "add logo to pdf",
    "confidential watermark pdf",
    "draft watermark pdf",
    "stamp pdf",
    "tile watermark pdf",
    "diagonal watermark pdf",
    "watermark pdf without upload",
  ],

  seo: {
    title: "Watermark PDF Online Free: Add Text or Logo to Every Page | GigAI Tools",
    description:
      "Free online PDF watermark tool. Stamp text (DRAFT, CONFIDENTIAL) or a logo image across every page: control opacity, angle, size and tiling with a live preview. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Type",
      title: "Text or image watermark",
      description:
        "Type a text mark like DRAFT, CONFIDENTIAL or your company name, or switch to image mode and stamp a transparent PNG or JPG logo. One tool covers both the label and the brand.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Full control over the look",
      description:
        "Set opacity so the mark reads without hiding content, choose a rotation angle for the classic diagonal, and scale either mode up or down to fit the page.",
    },
    {
      icon: "Grid2x2",
      title: "Tile or centre",
      description:
        "Place a single centred stamp, or tile the watermark across the whole page so it repeats edge-to-edge and can't simply be cropped out of a screenshot.",
    },
    {
      icon: "Eye",
      title: "Live on-page preview",
      description:
        "A preview renders your text or logo, at your opacity and angle, over a page mock, so you judge the result before you export instead of guessing.",
    },
    {
      icon: "FileCheck2",
      title: "Real PDF, text stays selectable",
      description:
        "The watermark is drawn as a genuine vector-text or embedded-image layer with pdf-lib, so the output stays a true PDF and the document text underneath remains selectable. Not a flattened image.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Your PDF is opened, stamped and saved entirely in your browser with pdf-lib loaded on demand. Contracts, drafts and decks are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Mark drafts and confidential files in seconds",
      description:
        "Add a clear DRAFT or CONFIDENTIAL stamp to every page before you circulate a document, so no one mistakes a work-in-progress for the final, approved version.",
    },
    {
      title: "Brand exports without a design tool",
      description:
        "Drop a logo onto reports, proposals and portfolios to brand them consistently. No need to open a heavyweight PDF editor or re-export from the source app.",
    },
    {
      title: "Deter casual reuse of shared work",
      description:
        "A tiled, semi-transparent watermark makes lifted screenshots and casual re-sharing obvious, which discourages the everyday copying that plain files invite.",
    },
    {
      title: "Private by default",
      description:
        "Because everything runs on your device, you can watermark sensitive contracts and unreleased material without ever handing the file to a third-party server.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description:
        "Drop a PDF onto the drop zone or click to browse. It's opened locally. Nothing is uploaded to a server.",
    },
    {
      title: "Choose text or image",
      description:
        "Type a watermark label such as DRAFT or CONFIDENTIAL, or switch to image mode and add a PNG or JPG logo to stamp instead.",
    },
    {
      title: "Tune opacity, angle & tiling",
      description:
        "Set the opacity, rotation angle and size, then decide whether to centre a single stamp or tile it across the whole page. The preview updates live.",
    },
    {
      title: "Export the watermarked PDF",
      description:
        "Click Add Watermark to write a new, watermarked copy and download it. The original file is left untouched. Reset to start over any time.",
    },
  ],

  formats: {
    input: ["PDF", "PNG", "JPG"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Legal / Operations",
      title: "Stamp CONFIDENTIAL on contracts",
      description:
        "Add a tiled CONFIDENTIAL or DRAFT watermark to agreements and internal memos before sharing, so their status is unmistakable on every page.",
    },
    {
      audience: "Designer / Agency",
      title: "Brand deliverables with a logo",
      description:
        "Stamp a transparent PNG logo across proposals, mock-ups and PDF portfolios so exported work is clearly branded before it goes to a client.",
    },
    {
      audience: "Publisher / Course creator",
      title: "Add a SAMPLE mark to previews",
      description:
        "Overlay a light, tiled SAMPLE watermark on preview chapters or lesson PDFs so the free excerpt is protected while still readable.",
    },
    {
      audience: "Photographer / Freelancer",
      title: "Watermark proofs before delivery",
      description:
        "Send proof PDFs with a centred name or logo watermark so drafts can be reviewed without being reused as final, unpaid deliverables.",
    },
  ],

  troubleshooting: [
    {
      problem: "The watermark hides the text underneath.",
      solution:
        "Lower the opacity so the mark reads through the content, and reduce the size or switch from tiled to a single centred stamp. A tiled watermark around 15–25% opacity usually stays visible without obscuring the page.",
    },
    {
      problem: "My logo has a white box around it instead of being transparent.",
      solution:
        "JPG has no transparency, so its background renders as a solid rectangle. Use a PNG with a real transparent background for a logo watermark. The tool embeds PNG transparency as-is.",
    },
    {
      problem: "Can someone remove this watermark?",
      solution:
        "Yes. This is a visible overlay, a deterrent and a branding layer, not encryption. A determined user with PDF-editing software can remove an overlay. If you need to restrict who can open or edit the file, use the Protect PDF (password) tool alongside it.",
    },
    {
      problem: "My text watermark looks cramped or overlaps at the edges.",
      solution:
        "Tiled marks repeat on a fixed grid, so a long label at a large size can crowd the spacing. Shorten the text, reduce the font size, or use a single centred stamp for long phrases.",
    },
  ],

  tips: [
    "For the classic look, keep the angle at 45°, opacity around 15–20%, and turn tiling on so the mark repeats across the page.",
    "Use a transparent PNG (not JPG) for logo watermarks so there's no white box behind the mark.",
    "A single centred stamp reads best for a large logo. Tiling reads best for short text like DRAFT or CONFIDENTIAL.",
    "Preview on the first page, then export: the same settings apply to every page in the document.",
    "Need to actually lock the file, not just mark it? Pair this with the Protect PDF tool to add a password.",
  ],

  security:
    "Your PDF and any logo image are opened, watermarked and saved entirely in your browser using pdf-lib loaded on demand. They are never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely watermark contracts, unreleased decks and confidential drafts. Note that a visible watermark is a deterrent and a branding layer, not encryption. To restrict access use the Protect PDF (password) tool. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The PDF is opened, stamped and re-saved entirely in your browser using pdf-lib, which is loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see, it's safe for confidential contracts and unreleased material.",
    },
    {
      question: "Can I add both text and an image logo?",
      answer:
        "You choose one mode per export, a text watermark or an image watermark. To have both, run the tool twice: stamp the text mark, download the result, then feed that file back in and stamp your logo image.",
    },
    {
      question: "Does the watermark go on every page?",
      answer:
        "Yes. Whatever you set (text or image, tiled or centred, at your chosen opacity and angle) is applied to every page of the document in a single pass.",
    },
    {
      question: "Will this protect my document from being copied?",
      answer:
        "A watermark is a visible deterrent and a branding layer, not security. It makes reuse obvious and discourages casual copying, but a determined user with PDF-editing software can remove an overlay. To actually restrict who can open or edit the file, use the sibling Protect PDF (password) tool.",
    },
    {
      question: "Is the text under the watermark still selectable?",
      answer:
        "Yes. The watermark is drawn as a separate vector-text or embedded-image layer over the page with pdf-lib, so the output stays a genuine PDF and the original document text underneath remains selectable and searchable. It isn't flattened to an image.",
    },
    {
      question: "What image formats can I use for a logo watermark?",
      answer:
        "PNG and JPG. Use a PNG with a transparent background for a clean logo. A JPG will show a solid rectangular background because JPG doesn't support transparency.",
    },
    {
      question: "Can I control opacity, angle and size?",
      answer:
        "Yes. Set the opacity (how see-through the mark is), the rotation angle (45° is the classic diagonal), and the size for either mode. Text marks are drawn in a neutral grey. The live preview reflects each change before you export.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Once the page and the pdf-lib library have loaded, watermarking runs entirely on your device, so it keeps working with the network off and never sends your file anywhere.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, text and image watermarks stamped onto every PDF page with opacity, angle, size and single-vs-tiled placement, a live on-page preview, and fully client-side pdf-lib rendering.",
    },
    {
      date: "2026-06-24",
      change:
        "Added quick-pick presets (DRAFT, CONFIDENTIAL, SAMPLE) for text marks, PNG transparency support for logo watermarks, and clearer honesty notes distinguishing a visible watermark from password protection.",
    },
    {
      date: "2026-06-30",
      change:
        "Tuned the tiling grid to reduce edge crowding on long labels and improved the preview's fidelity to the exported angle and opacity.",
    },
  ],

  relatedTools: [
    "pdf-password-protect",
    "add-page-numbers",
    "merge-pdf",
    "document-signature",
  ],
};

export default documentWatermark;
