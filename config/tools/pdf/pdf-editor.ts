import type { Tool } from "@/types";

/**
 * PDF Editor, the most capable PDF micro-tool: a page-based annotation +
 * arrangement studio. It renders each page with pdf.js, lets you draw a layer
 * of text boxes, freehand ink, highlights, rectangles and image/signature
 * stamps on top, and manage the page set (rotate, delete, reorder). On export
 * those annotations are baked onto the real pages with pdf-lib: all in the
 * browser, nothing uploaded.
 *
 * The copy is deliberately honest about scope: this is annotate-and-arrange
 * editing, NOT reflowable text editing. You add marks and content on a layer
 * above the page; you don't rewrite the words already set in the PDF.
 */
const pdfEditor: Tool = {
  slug: "pdf-editor",
  title: "PDF Editor",
  description:
    "Edit a PDF in your browser: add text, draw, highlight, drop in a signature, and rearrange or rotate pages, then export. Free, private, no uploads.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "PenLine",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Free Online PDF Editor, Annotate & Arrange",
  tagline:
    "Mark up any PDF right in the browser. Add text boxes and freehand ink, highlight passages, draw shapes, stamp a signature or image, and reorder or rotate pages: then export a flattened file. No account, no watermark, no upload.",
  longDescription:
    "The GigAI PDF Editor turns a static PDF into a working canvas. Each page is rendered with pdf.js and given an annotation layer you draw straight onto: type a text box anywhere, sketch freehand, swipe a translucent highlight over a line, drop a rectangle around a figure, or stamp an image or your signature. Alongside the drawing tools you get full page management: rotate, delete and reorder pages with live thumbnails. When you're done, pdf-lib bakes every annotation onto the underlying pages and saves a fresh PDF, entirely on your device. It's honest about its limits: this is layer-based annotation and page arrangement, not reflowable text editing, so you add marks and content above the page rather than rewriting the text already set inside it.",

  ctaText: "Edit PDF",

  keywords: [
    "pdf editor",
    "edit pdf online",
    "annotate pdf",
    "add text to pdf",
    "draw on pdf",
    "highlight pdf",
    "free pdf editor",
    "mark up pdf",
    "edit pdf in browser",
  ],

  seo: {
    title: "PDF Editor, Edit, Annotate & Sign PDFs Online Free | GigAI Tools",
    description:
      "Free online PDF editor. Add text, draw, highlight, stamp a signature, and reorder or rotate pages, then export. 100% in-browser. No uploads, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "Type",
      title: "Text boxes anywhere",
      description:
        "Click to drop an editable text box on any page, fill a form field, add a note, label a diagram or write a correction. Set size, color and position freely.",
    },
    {
      icon: "PencilLine",
      title: "Freehand ink & highlighter",
      description:
        "Sketch with a pen for signatures and circles, or swipe a translucent highlighter over lines and phrases you want to draw the eye to: just like marking up on paper.",
    },
    {
      icon: "Square",
      title: "Shapes & callouts",
      description:
        "Draw rectangles to box a figure, redact-style cover an area, or frame the part that matters. Snap them anywhere and color them to suit the page.",
    },
    {
      icon: "Stamp",
      title: "Signature & image stamps",
      description:
        "Upload a PNG or JPG (a scanned signature, a logo, a company stamp) and place it exactly where it belongs. Perfect for signing contracts without printing.",
    },
    {
      icon: "LayoutGrid",
      title: "Full page management",
      description:
        "Rotate any page, delete the ones you don't need, and drag pages into a new order, all with live thumbnails, before you commit a single change.",
    },
  ],

  benefits: [
    {
      title: "One tool, every markup",
      description:
        "Text, ink, highlight, shapes, stamps and page arrangement live in a single workspace, so you finish a document in one pass instead of juggling several apps.",
    },
    {
      title: "Nothing leaves your device",
      description:
        "Rendering with pdf.js and baking with pdf-lib both run locally. Your PDF (contract, form, or private record) is never uploaded, stored or seen by anyone.",
    },
    {
      title: "Undo and iterate freely",
      description:
        "Step back a mistaken mark, clear a page's layer, or reorder again. Because it's all in the browser, experimenting costs nothing and there's no queue.",
    },
    {
      title: "Honest, no-watermark output",
      description:
        "The exported PDF carries your annotations flattened onto the real pages, with no stamp, no page cap and no paywall added by us.",
    },
  ],

  howTo: [
    {
      title: "Open your PDF",
      description:
        "Drag a PDF onto the drop zone or browse for it. Every page renders as an editable canvas with an annotation layer on top.",
    },
    {
      title: "Choose a tool and mark up",
      description:
        "Pick text, pen, highlighter, rectangle or stamp from the toolbar, set a color, and draw or type directly on the page. Undo any step you don't like.",
    },
    {
      title: "Arrange the pages",
      description:
        "Switch to page view to rotate, delete or drag pages into the order you want. Thumbnails update live so you can see the result first.",
    },
    {
      title: "Export the edited PDF",
      description:
        "Hit Export. Your annotations are baked onto the pages with pdf-lib and a fresh PDF downloads: flattened, watermark-free and never uploaded.",
    },
  ],

  formats: {
    input: ["PDF", "PNG (stamp)", "JPG (stamp)"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Sign and return a contract",
      description:
        "Stamp your scanned signature, add the date in a text box and highlight the clause you've queried: then send the finished PDF back without ever printing it.",
    },
    {
      audience: "Student",
      title: "Annotate lecture notes and readings",
      description:
        "Highlight key passages, scribble margin notes with the pen, and box the diagrams you'll be tested on, all inside the original handout PDF.",
    },
    {
      audience: "Business",
      title: "Mark up a proposal for review",
      description:
        "Circle figures, drop comment text boxes, delete an outdated appendix and reorder sections before the document goes to the whole team.",
    },
  ],

  troubleshooting: [
    {
      problem: "I typed text but it saved in the wrong place.",
      solution:
        "Annotations are anchored to where you placed them on the rendered page. If the page was rotated after you typed, rotate first, then add text, the editor bakes marks using each page's final orientation.",
    },
    {
      problem: "My existing PDF text won't let me retype it.",
      solution:
        "This editor annotates on a layer above the page. It can't reflow words already set in the PDF. To hide old text, cover it with a filled rectangle and add a text box on top with the correct wording.",
    },
    {
      problem: "My signature stamp looks blocky or has a white box around it.",
      solution:
        "Use a PNG with a transparent background for a clean stamp, a JPG always carries a solid rectangle. Scan or export your signature as a high-resolution transparent PNG for the crispest result.",
    },
  ],

  tips: [
    "Add every text box and stamp before you reorder or rotate pages. Arranging last means marks land exactly where you expect.",
    "Use the highlighter at a low opacity so the underlying words stay perfectly readable through the color.",
    "For a redaction-style cover, draw a solid black rectangle, but remember it hides text visually rather than deleting the data beneath.",
    "Keep signature PNGs transparent and roughly 600px wide. They scale down crisply and never bring a white background with them.",
  ],

  security:
    "Your PDF and any stamp images are rendered with pdf.js and edited with pdf-lib entirely inside your browser. Nothing is uploaded, stored or logged. Every mark you add is baked in on your device, and closing the tab erases the file completely.",

  faq: [
    {
      question: "Can I edit the existing text in the PDF, like a Word document?",
      answer:
        "Not in the reflow sense. This is a layer-based editor: you add text boxes, ink, highlights, shapes and stamps on top of each page, and rearrange pages, but the words already set inside the PDF stay fixed. To replace old text, cover it with a filled rectangle and type the new text in a box above it.",
    },
    {
      question: "Is my PDF uploaded anywhere?",
      answer:
        "No. Pages are rendered with pdf.js and the final file is assembled with pdf-lib, both running locally in your browser. Your document and any signature or stamp images never leave your device, so there's nothing for us to store or see.",
    },
    {
      question: "How do I add my signature?",
      answer:
        "Use the stamp tool to upload a PNG or JPG of your signature and place it where it's needed, or draw it directly with the freehand pen. A transparent PNG gives the cleanest result because it won't carry a white background box.",
    },
    {
      question: "Can I undo a mistake?",
      answer:
        "Yes. Each annotation you add can be stepped back with undo, and you can clear a page's whole layer or reset the document to start fresh. Nothing is committed until you export, so it's safe to experiment.",
    },
    {
      question: "Will the exported PDF have a watermark?",
      answer:
        "Never. Your annotations are flattened onto the real pages and the file downloads clean. No watermark, no page limit and no sign-up. We don't run servers on your file, so there's nothing to gate behind a paywall.",
    },
    {
      question: "Can I rotate, delete or reorder pages too?",
      answer:
        "Yes. The page view gives you live thumbnails to rotate any page, remove the ones you don't need, and drag pages into a new order. Those structural edits are applied together with your annotations when you export.",
    },
  ],

  relatedTools: ["merge-pdf", "split-pdf", "rotate-pdf", "compress-pdf"],
};

export default pdfEditor;
