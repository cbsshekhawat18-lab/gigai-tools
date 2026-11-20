import type { Tool } from "@/types";

/**
 * PDF to Markdown: text plus INFERRED structure.
 *
 * Keyword lane: "pdf to markdown" / "pdf to md". Deliberately distinct from
 * `pdf-to-txt` (raw text, no structure) and `markdown-to-pdf` (the reverse
 * direction), both of which already exist and are cross-linked rather than
 * competed with. The copy consistently says structure is *inferred* from
 * typography, because a PDF has no headings to recover.
 */
const pdfToMarkdown: Tool = {
  slug: "pdf-to-markdown",
  title: "PDF to Markdown",
  description:
    "Turn a PDF into clean Markdown with headings, lists and emphasis inferred from the page, converted in your browser, never uploaded.",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "FileCode2",
  accent: "emerald",
  processor: "convert",
  status: "live",
  serverSide: false,
  createdAt: "2026-08-11",

  h1: "PDF to Markdown, Convert With Structure, Not Just Text",
  tagline: "Get the words out with their shape intact.",
  ctaText: "Convert a PDF to Markdown",

  longDescription:
    "Pulling text out of a PDF is easy and usually disappointing: you get an undifferentiated wall of words where the headings, the bullet points and the emphasis have all been flattened into the same plain paragraph. GigAI PDF to Markdown does better by paying attention to how the page looks. It reads every text run with its position, its font size and whether the typeface is bold or italic, groups those runs back into visual lines, and then infers structure from typography: a line set noticeably larger than the document's body size becomes a heading, and the size gap decides whether that's an H1, H2 or H3. A line starting with a bullet glyph or a number becomes a list item. Bold and italic runs come across as Markdown emphasis. The body size is measured as the median across the whole document rather than the average, so a single huge title on a cover page can't skew the baseline and make every genuine heading look like ordinary text. Here's the honest framing, because it matters for judging the output: a PDF contains positioned glyphs and no notion whatsoever of a 'heading' or a 'list'. That structure is not being recovered, it is being inferred, and inference is right most of the time and wrong some of the time, heavily designed pages, multi-column magazine layouts and documents that use size for decoration rather than hierarchy will all trip it up. You get a preview before you download precisely so you can judge that yourself. One more thing worth knowing: a scanned PDF has no text at all, only pictures of text, so there is nothing to extract. Rather than handing you an empty file that looks like a bug, the tool names the pages that came back blank and points you at OCR PDF to build a text layer first. Free, unlimited, no account, and the file never leaves your browser.",

  keywords: [
    "pdf to markdown",
    "convert pdf to markdown",
    "pdf to md",
    "pdf to markdown converter",
    "extract markdown from pdf",
    "pdf to markdown online",
    "pdf to markdown free",
  ],

  tags: ["pdf", "markdown", "convert", "text", "documentation"],
  fileTypes: ["pdf", "md"],
  audiences: ["developers", "writers", "students", "product-teams"],

  seo: {
    title: "PDF to Markdown Converter: Free, Keeps Headings & Lists",
    description:
      "Convert PDF to Markdown with headings, lists and bold/italic preserved. Runs entirely in your browser: nothing uploaded. Free, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "Heading",
      title: "Headings inferred from type size",
      description:
        "Lines set larger than the document's body text become #, ## or ### by how much bigger they are, measured against the median size, so one giant cover title can't skew the whole document.",
    },
    {
      icon: "List",
      title: "Lists stay lists",
      description:
        "Bullet glyphs and numbered prefixes are recognised and emitted as real Markdown list items, with consecutive items kept together as one list rather than a run of single-item ones.",
    },
    {
      icon: "Bold",
      title: "Bold and italic carried across",
      description:
        "Emphasis is read from the source font names and re-emitted as ** and _, so the stress the author put on a phrase survives the conversion.",
    },
    {
      icon: "ScanText",
      title: "Tells you when a page is a scan",
      description:
        "Pages with no text layer are named explicitly and pointed at OCR PDF, instead of silently contributing nothing and leaving you to wonder what went wrong.",
    },
    {
      icon: "Eye",
      title: "Preview before you commit",
      description:
        "The Markdown appears in the workspace with a word and heading count, and a one-click copy, so you can judge the inference rather than trust it.",
    },
  ],

  benefits: [
    {
      title: "Documentation you can actually edit",
      description:
        "A spec or manual trapped in PDF becomes text you can put in a repo, diff in a pull request and edit like any other file.",
    },
    {
      title: "Ready for the next tool",
      description:
        "Markdown drops straight into static site generators, note apps, wikis and LLM prompts, none of which want a wall of unstructured text.",
    },
    {
      title: "Nothing to trust with your file",
      description:
        "The conversion runs on your device, so a confidential report doesn't have to be uploaded to a converter to be read.",
    },
  ],

  howTo: [
    {
      title: "Add the PDF",
      description: "Drop the file in, it's read in your browser and never uploaded.",
    },
    {
      title: "Choose what to infer",
      description:
        "Headings, emphasis, lists and page-break markers can each be turned off if the document's typography would mislead them.",
    },
    {
      title: "Convert and read the preview",
      description:
        "The Markdown appears with a word count and the number of headings found, plus a warning naming any pages that had no text.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the whole thing to the clipboard, or download a .md file ready to commit.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["MD", "Markdown"],
  },

  useCases: [
    {
      audience: "Developers",
      title: "A spec that arrived as a PDF",
      description:
        "Convert it to Markdown, commit it beside the code, and diff future revisions instead of comparing two PDFs by eye.",
    },
    {
      audience: "Writers & researchers",
      title: "Quoting from a report",
      description:
        "Pull structured text out of a paper or report with its headings intact, so you can find and cite the section you need.",
    },
    {
      audience: "Anyone using AI tools",
      title: "Feeding a document to a model",
      description:
        "Markdown gives a language model the document's hierarchy as well as its words, which produces markedly better summaries than a flat text dump.",
    },
    {
      audience: "Product teams",
      title: "Migrating documentation",
      description:
        "Move a library of PDF guides into a wiki or static site without retyping the headings and lists by hand.",
    },
  ],

  troubleshooting: [
    {
      problem: "The Markdown is empty, or some pages produced nothing",
      solution:
        "Those pages are images. A scan has pictures of text, not text, so there is nothing to extract. The tool names the pages this affects. Run the PDF through OCR PDF first to build a real text layer, then convert.",
    },
    {
      problem: "Ordinary paragraphs became headings",
      solution:
        "The document probably sets body text at several sizes, so the inference reads the larger ones as hierarchy. Turn off Detect headings and you'll get clean paragraphs you can mark up yourself, usually faster than un-picking wrong ones.",
    },
    {
      problem: "A two-column page came out interleaved",
      solution:
        "Multi-column layouts are read in the order the glyphs sit on the page, which zig-zags across columns. There's no reliable way to detect column boundaries from positioned text alone. For heavily columned documents, convert page ranges separately or tidy the result by hand.",
    },
    {
      problem: "Tables came out as plain lines",
      solution:
        "A PDF stores a table as separately positioned text runs with no notion of rows or cells, so there's no grid to convert. The cell contents come across in reading order. If you need real tabular data, PDF to Excel is the better route.",
    },
  ],

  tips: [
    "Read the preview before downloading. Inference is usually right, and you want to be the one who spots when it isn't.",
    "Turn off heading detection for documents that use type size decoratively rather than hierarchically.",
    "Scanned PDF? Run OCR PDF first. No extractor can read text that was never stored as text.",
    "Markdown is the best format to hand a language model: it carries structure that plain text throws away.",
  ],

  security:
    "Your PDF is read and converted entirely inside your browser and is never uploaded. Nothing is stored, logged or transmitted, so a confidential report, contract or draft can be converted without handing it to anyone. You can disconnect from the network and it still works. The Markdown is produced on your device and only leaves it if you choose to copy or download it.",

  faq: [
    {
      question: "How does it know what's a heading?",
      answer:
        "By type size. A PDF has no idea what a heading is (it stores positioned glyphs) so structure is inferred: the median text size in the document is treated as the body, and lines noticeably larger become H1, H2 or H3 depending on how much larger. It's right for ordinary documents and can misread heavily designed pages, which is why there's a preview and a switch to turn it off.",
    },
    {
      question: "What's the difference between this and PDF to Text?",
      answer:
        "PDF to Text gives you the raw words with no structure at all. This reads the typography as well and emits Markdown, so headings, lists and emphasis survive. Use PDF to Text when you want plain content to process yourself, and this when the shape of the document matters.",
    },
    {
      question: "Why is my scanned PDF producing nothing?",
      answer:
        "Because a scan contains images of text, not text. There's no text layer to read, so there's nothing to convert: the tool names the affected pages rather than handing you an empty file. Run it through OCR PDF first to create a text layer, then convert.",
    },
    {
      question: "Are tables converted to Markdown tables?",
      answer:
        "No, and it's better to say so than to produce a mangled grid. A PDF stores a table as separately positioned runs of text with no rows or cells recorded, so there's no structure to convert reliably. Cell contents come across as text in reading order. For genuine tabular data, use PDF to Excel.",
    },
    {
      question: "Is my file uploaded?",
      answer:
        "No. Everything runs in your browser, the PDF never leaves your device, nothing is stored and nothing is logged. Free, unlimited, no account and no watermark.",
    },
  ],

  changelog: [
    { date: "2026-08-11", change: "PDF to Markdown released, typography-based heading, list and emphasis inference." },
  ],

  relatedTools: ["pdf-to-txt", "markdown-to-pdf", "ocr-pdf", "pdf-to-word"],
};

export default pdfToMarkdown;
