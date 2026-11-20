import type { Tool } from "@/types";

/**
 * Redact PDF, the DOING half of the redaction pair.
 *
 * Keyword split is deliberate and must be kept: this page owns the action
 * ("redact pdf", "black out text in pdf"), `redaction-checker` owns the
 * verification ("check pdf redaction", "verify redaction"). They cross-link,
 * and neither competes for the other's terms.
 *
 * The honesty that matters here is structural, not decorative: drawing a box
 * over text is what most tools call redaction and it removes nothing. This one
 * rasterises, so the copy must keep saying both halves. The text is genuinely
 * destroyed, AND the whole document loses its text layer as the price.
 */
const redactPdf: Tool = {
  slug: "redact-pdf",
  title: "Redact PDF",
  description:
    "Permanently remove text from a PDF. Not a black box drawn on top. The words are destroyed, in your browser, and can't be selected, searched or recovered.",
  category: "pdf-tools",
  group: "PDF Security",
  icon: "EyeOff",
  accent: "rose",
  processor: "convert",
  status: "live",
  serverSide: false,
  createdAt: "2026-08-11",

  h1: "Redact PDF: Permanently Remove Text, Not Just Cover It",
  tagline: "A black rectangle isn't redaction. This is.",
  ctaText: "Redact a PDF",

  longDescription:
    "The most common way people redact a PDF is to draw a black rectangle over the sensitive part and send it. That removes nothing at all. The characters are still sitting in the content stream underneath, so anyone can select the text through the box, copy it out, run a command-line extractor over the file, or simply delete the annotation and read what was hidden. It is the single most common way confidential information leaks out of a document, and it has embarrassed law firms, governments and newsrooms in exactly this way. GigAI Redact PDF does the thing that actually works. Drag a box over anything you need gone and the page is rendered to an image, opaque blocks are painted over the marked areas, and a fresh PDF is built from those images while the original page objects (text, fonts, the lot) are discarded. What comes out contains no text layer at all, so the redacted words are not covered, they no longer exist in the file. Be clear about the trade-off, because it is the honest cost of doing this properly in a browser: every page is converted to an image, so no text anywhere in the output stays selectable or searchable, and the file gets larger. Every page is rasterised rather than only the marked ones. A document where one page has no selectable text and the next does quietly announces which page was censored. When you're finished, run the result through our Redaction Checker to confirm for yourself that nothing readable survived. It's free, needs no account, and the document never leaves your device, which is rather the point when the whole reason you're here is that the contents are sensitive.",

  keywords: [
    "redact pdf",
    "redact pdf online",
    "black out text in pdf",
    "remove sensitive text from pdf",
    "permanently delete text from pdf",
    "pdf redaction tool",
    "hide information in pdf",
    "censor pdf",
    "redact pdf free",
    "blackout pdf text",
  ],

  tags: ["privacy", "security", "redaction", "compliance", "legal"],
  fileTypes: ["pdf"],
  audiences: ["legal", "business", "journalists", "healthcare"],

  seo: {
    title: "Redact PDF Online Free, Permanently Remove Text, Not Cover It",
    description:
      "Truly redact a PDF: the text is destroyed, not hidden under a black box. Runs entirely in your browser, nothing uploaded. Free, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "The text is destroyed, not covered",
      description:
        "Pages are rasterised and rebuilt, so the original characters are discarded with the page objects. There is no text under the box to select, copy or extract, because there is no text layer at all.",
    },
    {
      icon: "MousePointerSquareDashed",
      title: "Drag to mark, page by page",
      description:
        "Drag a box over any text on the page preview. Marks are stored as page fractions, so what you drew on a small screen lands in exactly the same place at full render resolution.",
    },
    {
      icon: "CloudOff",
      title: "Never uploaded",
      description:
        "The whole operation runs in your browser. A document you're redacting is by definition one you shouldn't hand to a stranger's server, so this one doesn't.",
    },
    {
      icon: "Layers",
      title: "Every page treated the same",
      description:
        "All pages are rasterised, not just the marked ones. A file where page 3 has no selectable text and page 4 does is a file that tells everyone which page was censored.",
    },
    {
      icon: "SearchCheck",
      title: "Verify it worked",
      description:
        "Run the output through our Redaction Checker and see for yourself that no readable text survives. Don't take our word for it, that's the whole lesson of failed redactions.",
    },
  ],

  benefits: [
    {
      title: "The leak that keeps happening, prevented",
      description:
        "Courts, agencies and newspapers have all published documents where the black boxes came straight off with a copy-paste. This removes the possibility rather than the appearance.",
    },
    {
      title: "Safe for the documents that need it most",
      description:
        "Contracts, medical records, statements and case files never leave your device, so using the tool doesn't create the exposure you're trying to prevent.",
    },
    {
      title: "You're told the cost up front",
      description:
        "The output loses its text layer and grows in size. That's stated before you start, not discovered when someone can't search the file you sent them.",
    },
  ],

  howTo: [
    {
      title: "Add the PDF",
      description: "Drop the document in. It's decoded and rendered in your browser: nothing is uploaded.",
    },
    {
      title: "Drag boxes over what must go",
      description:
        "Drag across any text on the page preview. Move between pages with the arrows. Marks are kept per page and you can clear one page or all of them.",
    },
    {
      title: "Redact",
      description:
        "Each page is rendered, the boxes are painted on, and a new PDF is built from the images. The original text objects are discarded, not hidden.",
    },
    {
      title: "Verify before you send",
      description:
        "Open the result and try to select the redacted text. You won't be able to. For a formal check, run it through the Redaction Checker.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Legal",
      title: "Disclosure and court filings",
      description:
        "Remove privileged passages, client names and account numbers before a document is filed or disclosed, with no risk that the text survives under the mark.",
    },
    {
      audience: "Business",
      title: "Contracts shared with third parties",
      description:
        "Strip commercial terms, rates and counterparty details out of an agreement before sending it to someone who only needs to see the rest.",
    },
    {
      audience: "Healthcare & HR",
      title: "Records with personal data",
      description:
        "Take names, addresses, dates of birth and reference numbers out of a record before it's shared internally or with an external party.",
    },
    {
      audience: "Journalists",
      title: "Protecting a source",
      description:
        "Publish a document while genuinely removing the identifying details. Not merely drawing over them where anyone can lift the box.",
    },
  ],

  troubleshooting: [
    {
      problem: "The text in my redacted PDF isn't selectable any more",
      solution:
        "That's the tool working, not a bug. Real redaction in a browser means turning the page into an image so the characters no longer exist, which necessarily removes the text layer from the whole page. If you need a searchable document afterwards, run the redacted file through OCR PDF, which builds a fresh text layer from what's actually visible.",
    },
    {
      problem: "The file got much bigger",
      solution:
        "Expected: an image of a page is heavier than the text instructions that drew it. Run the result through Compress PDF to bring it back down: compression happens after redaction, so it can't undo the removal.",
    },
    {
      problem: "My box didn't cover everything",
      solution:
        "Drag slightly beyond the text on all sides. Descenders, accents and the tails of letters sit outside where the glyphs look like they end, and a box that clips them can leave a readable sliver. Zoom your browser in for finer control on dense text.",
    },
    {
      problem: "I marked the wrong area",
      solution:
        "Use Clear this page to drop the marks on the page you're viewing, or Clear all to start over. Nothing is applied until you press Redact, so no mark is permanent until then.",
    },
  ],

  tips: [
    "Redact, then verify. The whole reason this tool exists is that people trusted a black box without checking.",
    "Drag a little wider than the text, letter tails and accents extend past where the word appears to stop.",
    "Redact before you compress, not after. Compression can't remove text that redaction already destroyed.",
    "Cropping is not redaction: it hides content that's still in the file and can be brought back.",
  ],

  security:
    "Your document is rendered, redacted and rebuilt entirely inside your browser, and is never uploaded, which matters more here than on any other tool, since the only reason to redact a file is that its contents are sensitive. Nothing is stored, logged or transmitted, and you can disconnect from the network and redact anyway. The redaction itself is genuine: the marked page is rasterised and the original text objects are discarded, so the removed words are not present in the output file in any form. The trade-off is stated plainly rather than hidden: every page becomes an image, so no text in the result stays selectable, and the file grows.",

  faq: [
    {
      question: "Is this different from drawing a black box over the text?",
      answer:
        "Completely, and it's the whole point. A drawn box is a shape sitting on top of text that is still in the file: select through it, copy it, run a text extractor over the document, or just delete the shape, and the hidden words are right there. This renders the page to an image and discards the original text objects, so the words are gone from the file rather than covered up.",
    },
    {
      question: "Can the redacted text be recovered?",
      answer:
        "Not from the output file. The characters are not present in it. There is no text layer, only pixels, and the pixels under a redaction box are solid color. What you should keep in mind is the obvious: your original, un-redacted PDF still exists on your device, so handle that copy the way you'd handle any sensitive document.",
    },
    {
      question: "Why is my whole document no longer searchable?",
      answer:
        "Because genuine redaction in a browser requires rasterising the page, and we apply it to every page rather than only the marked ones. Mixed output would silently reveal which pages were censored. If you need the result searchable, run it through OCR PDF afterwards to build a new text layer from what's visibly left.",
    },
    {
      question: "Is my PDF uploaded?",
      answer:
        "No. Everything happens in your browser. The file is never sent anywhere, nothing is stored and nothing is logged. Disconnect from the network and it still works, which is the simplest way to satisfy yourself before redacting something confidential.",
    },
    {
      question: "How do I check the redaction actually worked?",
      answer:
        "Open the file and try to select the redacted text. You won't be able to, because there's no text to select. For a proper check, run the result through our Redaction Checker, which looks for readable text hiding beneath marks and reports what it finds.",
    },
    {
      question: "Is it free, and is there a watermark?",
      answer:
        "Free, unlimited, no account and no watermark. The processing runs on your own hardware, so there's no per-file cost for anyone to meter.",
    },
  ],

  changelog: [{ date: "2026-08-11", change: "Redact PDF released, true rasterised redaction, in-browser." }],

  relatedTools: ["redaction-checker", "compress-pdf", "ocr-pdf", "document-metadata-editor"],
};

export default redactPdf;
