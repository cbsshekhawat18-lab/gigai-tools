import type { Tool } from "@/types";

/**
 * Split PDF: a client-side page splitter. All copy is unique to splitting: a
 * single PDF is broken into several smaller documents entirely in the browser
 * with pdf-lib, either one file per page ("every page" mode) or one file per
 * custom page range ("custom ranges" mode). Nothing is ever uploaded, and the
 * results arrive as separate files (or a single ZIP for the whole batch).
 */
const splitPdf: Tool = {
  slug: "split-pdf",
  title: "Split PDF",
  description:
    "Break one PDF into several smaller files. Split every page out, or carve out custom page ranges. Free, fast and entirely in your browser.",
  category: "pdf-tools",
  group: "Organize PDF",
  icon: "Scissors",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Split PDF Files Online, Free & Private",
  tagline:
    "Turn one PDF into many. Pick pages from a live thumbnail grid, split every page into its own file, or define custom ranges, then download the lot as separate PDFs or one tidy ZIP. No uploads, no watermark.",
  longDescription:
    "The GigAI PDF Splitter takes a single PDF and divides it into several smaller documents without sending a byte to a server. Upload your file, see every page rendered as a thumbnail, and choose how to divide it: 'every page' produces one single-page PDF per page, while 'custom ranges' lets you type ranges like 1-3, 4-8, 9 to slice out exactly the sections you need. Everything is assembled locally with pdf-lib, so the original page content (text, images and vectors) carries across untouched, there's no page cap and no watermark. When you're done, download each split file individually or grab them all in one ZIP.",

  ctaText: "Split PDF",

  keywords: [
    "split pdf",
    "split pdf online",
    "split pdf into multiple files",
    "separate pdf pages",
    "extract pdf page range",
    "divide pdf",
    "pdf splitter",
    "split large pdf",
    "cut pdf pages",
  ],

  seo: {
    title: "Split PDF, Divide a PDF into Multiple Files Free | GigAI Tools",
    description:
      "Split a PDF into multiple files for free. Break out every page or define custom ranges, preview each page, then download as separate PDFs or a ZIP: 100% private, no uploads.",
  },

  features: [
    {
      icon: "LayoutGrid",
      title: "Visual page picker",
      description:
        "Every page is rendered as a thumbnail so you can see exactly what you're splitting. Set your split points against the real document, not a page number you're guessing at.",
    },
    {
      icon: "SplitSquareHorizontal",
      title: "Two split modes",
      description:
        "Choose 'every page' to burst the PDF into one file per page, or 'custom ranges' to type sections like 1-4, 5-9 and get one file per range: whichever fits the job.",
    },
    {
      icon: "FileArchive",
      title: "Download all as a ZIP",
      description:
        "Splitting a big document makes lots of files. Grab them one at a time, or download the entire batch bundled into a single ZIP with one click.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Your PDF is read and split locally with pdf-lib. It's never uploaded, stored or seen by anyone, the privacy promise holds for every page you cut.",
    },
    {
      icon: "FileCheck2",
      title: "Original quality kept",
      description:
        "Each split file copies its pages over as-is. Text stays selectable, images keep their resolution and nothing is re-rendered or compressed on the way out.",
    },
  ],

  benefits: [
    {
      title: "See before you split",
      description:
        "The thumbnail grid shows every page, so you set split points against the actual content. No more re-splitting because a range was off by one page.",
    },
    {
      title: "Private by design",
      description:
        "Splitting runs entirely inside your browser tab. Your document never leaves your device, so there's nothing for us to upload, store or read.",
    },
    {
      title: "Free with no limits",
      description:
        "No account, no daily cap, no paywall and no watermark. Split a two-page memo or a 500-page manual as often as you like, at no cost.",
    },
    {
      title: "One file becomes many, cleanly",
      description:
        "Each output is a complete, standalone PDF named after its source and pages, easy to file, email or upload individually.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag a single PDF onto the drop zone, or click to browse. Its pages render as thumbnails so you can see what you're working with.",
    },
    {
      title: "Choose a split mode",
      description:
        "Pick 'Every page' to make one file per page, or 'Custom ranges' and type the ranges you want, like 1-3, 4-8, 9.",
    },
    {
      title: "Split",
      description:
        "Hit Split PDF. The tool builds each smaller document locally, in a moment, with no upload.",
    },
    {
      title: "Download",
      description:
        "Download each split file, or grab them all at once as a ZIP. Need a different cut? Adjust the ranges and split again.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF", "ZIP"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Send only the relevant section",
      description:
        "Split a long contract so you can email a counterparty just the signature pages or the schedule they asked for, without forwarding the whole document.",
    },
    {
      audience: "Student",
      title: "Separate a scanned lecture pack",
      description:
        "Break a combined PDF of scanned handouts into one file per topic, so each week's reading is its own document you can revise independently.",
    },
    {
      audience: "Business",
      title: "Burst a batch of statements",
      description:
        "Split a merged run of monthly statements or payslips into one PDF per page, ready to file or distribute to the right recipient.",
    },
  ],

  troubleshooting: [
    {
      problem: "My custom ranges produced fewer files than I expected.",
      solution:
        "Each comma-separated range becomes exactly one file. '1-3, 4-6' makes two files (pages 1-3 and 4-6). If you want one file per page, use 'Every page' mode instead.",
    },
    {
      problem: "I get an 'out of bounds' error when I split.",
      solution:
        "A range references a page this PDF doesn't have. Check the highest page number against the thumbnail grid: ranges are inclusive and 1-based, so '1-10' needs at least ten pages.",
    },
    {
      problem: "The page previews won't load.",
      solution:
        "The file may be password-protected or corrupted. Remove the password with our Unlock PDF tool first, or re-save the document from its source, then upload it again.",
    },
  ],

  tips: [
    "Use 'Custom ranges' to keep chapters together, type each chapter's page span as its own range for cleanly divided files.",
    "Ranges are inclusive: '4-4' or just '4' both extract a single page as its own PDF.",
    "Splitting hundreds of pages? Download the ZIP rather than clicking each file. It bundles the whole batch in one go.",
    "Want the opposite: several files into one? Combine your split pieces back together with our Merge PDF tool any time.",
  ],

  security:
    "Your PDF is split entirely in your browser with pdf-lib and never uploaded to any server. Every output file is generated on your device, nothing is stored, logged or shared, and when you close the tab all of it is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server to be split?",
      answer:
        "No. The splitter runs entirely in your browser using pdf-lib. Your file is read, divided and downloaded locally. It never leaves your device, so there's nothing for us to store or see.",
    },
    {
      question: "What's the difference between the two split modes?",
      answer:
        "'Every page' bursts the PDF into one single-page file per page. 'Custom ranges' lets you type sections like 1-3, 4-8, 9, each range becomes its own multi-page file, so you get exactly the pieces you define.",
    },
    {
      question: "How do I write custom ranges?",
      answer:
        "Use 1-based, inclusive ranges separated by commas: '1-3, 4-8, 10'. A single number like '5' extracts just that page. Each entry produces one output PDF, and pages can appear in more than one range if you need overlap.",
    },
    {
      question: "How do I download all the split files at once?",
      answer:
        "When splitting produces more than one file, a 'Download all (.zip)' button appears. It bundles every output PDF into a single ZIP so you don't have to save them one by one.",
    },
    {
      question: "Will splitting reduce quality or add a watermark?",
      answer:
        "Never. Each output copies its pages over exactly as they were. Text stays selectable, images keep their resolution and no watermark is added. Splitting rearranges pages, it doesn't re-render them.",
    },
    {
      question: "Is there a limit on how many pages or files I can split?",
      answer:
        "There's no artificial cap. The only practical limit is your device's memory, since the whole document and its output files are held in the browser while they're generated.",
    },
  ],

  relatedTools: ["merge-pdf", "extract-pdf-pages", "delete-pdf-pages", "compress-pdf"],
};

export default splitPdf;
