import type { Tool } from "@/types";

/**
 * Crop PDF, trims the CropBox.
 *
 * The copy must never let a reader think this is a privacy tool. Cropping hides
 * content that is still in the file, and someone reaching for "crop out the
 * bank details" needs to be sent to Redact PDF instead. That warning appears in
 * the workspace, the description, the tips and the FAQ on purpose.
 */
const cropPdf: Tool = {
  slug: "crop-pdf",
  title: "Crop PDF",
  description:
    "Trim white margins or unwanted edges off every page of a PDF, with a live preview, in your browser, with nothing uploaded.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "Crop",
  accent: "violet",
  processor: "convert",
  status: "live",
  serverSide: false,
  createdAt: "2026-08-11",

  h1: "Crop PDF. Trim Margins and Edges Online",
  tagline: "Cut the dead space off every page at once.",
  ctaText: "Crop a PDF",

  longDescription:
    "Scanned pages arrive with a black border and half an inch of desk around them. Slides exported to PDF carry a title bar you don't want. A document built for A4 has margins so generous that reading it on a phone means squinting at a stamp in the middle of the screen. GigAI Crop PDF trims all of that away. Set how much to take off the top, right, bottom and left as a percentage of the page, watch the shaded preview show exactly what survives, and apply it to the whole document in one go. Margins are percentages rather than fixed measurements on purpose: a document that mixes A4 and US Letter pages, as scanned documents so often do, gets a consistent-looking trim instead of a setting that means one thing on one page and something else on the next. Cropping twice compounds predictably too, because each pass measures against the current page box rather than silently resetting to the original. One thing to be completely clear about, and it's the reason people get burned by crop tools: cropping hides content, it does not delete it. Setting the crop box changes what a viewer displays, but everything outside it is still inside the file and can be brought back by anyone who resets the box. That's fine (excellent, even) for tidying up scans and reclaiming screen space. It is the wrong tool entirely for removing a signature, an address or an account number from a document you're about to send, and for that you want Redact PDF, which genuinely destroys the content. Free, unlimited, no account, and the file never leaves your device.",

  keywords: [
    "crop pdf",
    "crop pdf online",
    "trim pdf margins",
    "remove white space from pdf",
    "cut pdf edges",
    "pdf margin remover",
    "crop pdf pages",
    "resize pdf margins",
    "crop scanned pdf",
  ],

  tags: ["pdf", "crop", "margins", "layout", "scan"],
  fileTypes: ["pdf"],
  audiences: ["students", "business", "designers"],

  seo: {
    title: "Crop PDF Online Free. Trim Margins and Edges in Your Browser",
    description:
      "Crop a PDF to remove white margins, scan borders or unwanted edges, with a live preview. Free, private and in-browser. Nothing is uploaded. No sign-up.",
  },

  features: [
    {
      icon: "Eye",
      title: "See exactly what survives",
      description:
        "The first page renders with the trimmed area shaded and the kept area outlined, so you're setting a crop you can see rather than guessing at numbers.",
    },
    {
      icon: "Percent",
      title: "Percentages, not fixed points",
      description:
        "Margins are a share of each page's own size, so a document that mixes A4 and Letter pages, as scans routinely do, gets a consistent trim rather than an uneven one.",
    },
    {
      icon: "Layers",
      title: "Every page in one pass",
      description:
        "Set the four edges once and the whole document is trimmed together. No page-by-page repetition on a hundred-page scan.",
    },
    {
      icon: "CloudOff",
      title: "Runs in your browser",
      description:
        "The PDF is read and rewritten on your own device and never uploaded. Nothing is stored and nothing is logged.",
    },
    {
      icon: "TriangleAlert",
      title: "Honest about what cropping is",
      description:
        "Cropping hides content rather than deleting it, the tool says so, in the workspace, and points you at Redact PDF when removal is what you actually need.",
    },
  ],

  benefits: [
    {
      title: "Readable on a phone",
      description:
        "Trimming a generous margin can double the effective text size on a small screen without changing a single font.",
    },
    {
      title: "Scans that look deliberate",
      description:
        "Remove the black border and the sliver of desk that every flatbed and phone scan picks up, so the document looks produced rather than photographed.",
    },
    {
      title: "Smaller printed output",
      description:
        "A tighter page means less dead space when printing several pages to a sheet, and a cleaner result when the PDF is placed into another document.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description: "Drop the file in, it's read in your browser and never uploaded.",
    },
    {
      title: "Set the four margins",
      description:
        "Drag the top, right, bottom and left sliders. The preview shades what's being trimmed away and outlines what you keep.",
    },
    {
      title: "Crop",
      description: "The crop is applied to every page at once and a new PDF is written on your device.",
    },
    {
      title: "Download",
      description:
        "Save the trimmed file. Need it smaller too? Send it through Compress PDF next.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Students",
      title: "Scanned textbook pages and handouts",
      description:
        "Cut the scanner border and the desk edge off a chapter scan so it reads cleanly on a tablet and prints without a grey frame.",
    },
    {
      audience: "Business",
      title: "Slides exported to PDF",
      description:
        "Trim a header bar, footer or presenter notes strip off every slide at once before circulating the deck.",
    },
    {
      audience: "Anyone reading on mobile",
      title: "Reclaiming screen space",
      description:
        "A report with 25mm margins wastes a third of a phone screen. Trim them and the text gets meaningfully bigger without any reflowing.",
    },
  ],

  troubleshooting: [
    {
      problem: "The cropped content came back when I opened it elsewhere",
      solution:
        "That's how cropping works. It sets the box a viewer displays, and the content outside is still in the file. Some viewers and print paths ignore or reset the crop box. If your goal is removing something rather than tidying the layout, use Redact PDF, which destroys the content instead of hiding it.",
    },
    {
      problem: "One page is cropped correctly but another isn't",
      solution:
        "Pages of different sizes take the same percentage but a different absolute amount, which is usually what you want and occasionally isn't. If a document mixes portrait and landscape pages, crop it in two passes: extract each set with Extract PDF Pages, crop separately, then merge.",
    },
    {
      problem: "The crop didn't take as much as I expected the second time",
      solution:
        "Each pass measures from the current page box, not the original, so a second 10% crop takes 10% of what's left rather than a further 10% of the original. Increase the value or do it in one pass.",
    },
  ],

  tips: [
    "Cropping hides. Redaction removes. Never use crop to take confidential detail out of a document you're sending.",
    "Trim scans a touch more than looks necessary. Flatbed borders are rarely perfectly straight.",
    "Crop before compressing: a smaller visible area doesn't shrink the file on its own, but the two together do.",
  ],

  security:
    "Your PDF is read and rewritten entirely inside your browser and is never uploaded. Nothing is stored, logged or transmitted, and you can crop with the network disconnected. One important caveat we'd rather state than let you assume: cropping changes the box a viewer displays, so the trimmed content remains inside the file and can be recovered by resetting that box. Never use cropping to remove sensitive information from a document you intend to share. Use Redact PDF, which genuinely destroys the content.",

  faq: [
    {
      question: "Does cropping delete the trimmed content?",
      answer:
        "No, and this is the one thing worth understanding about every crop tool, not just this one. Cropping sets the page box a viewer displays. Everything outside it is still inside the file and comes back if someone resets the box. It's the right tool for tidying margins and the wrong tool for removing confidential detail: use Redact PDF for that.",
    },
    {
      question: "Can I crop different pages by different amounts?",
      answer:
        "Not in a single pass, the margins you set apply to the whole document, which is what you want for the overwhelmingly common case of a scan with a consistent border. For mixed layouts, use Extract PDF Pages to separate the groups, crop each one, then merge them back together.",
    },
    {
      question: "Why are the margins percentages instead of millimetres?",
      answer:
        "Because documents mix page sizes far more often than people expect, especially scans. A fixed 20pt trim takes a different visual share off an A4 page than off a Letter page, so a percentage gives a consistent-looking result across the whole file.",
    },
    {
      question: "Will cropping make my PDF smaller?",
      answer:
        "Barely. The hidden content is still stored, so the file size is largely unchanged: cropping is a layout change, not a compression one. Run the result through Compress PDF if size is what you're after.",
    },
    {
      question: "Is my file uploaded?",
      answer:
        "No. The PDF is processed on your own device and never sent anywhere. Nothing is stored or logged, and there's no account, no watermark and no page limit.",
    },
  ],

  changelog: [{ date: "2026-08-11", change: "Crop PDF released, percentage margins with a live preview." }],

  relatedTools: ["redact-pdf", "compress-pdf", "extract-pdf-pages", "rotate-pdf"],
};

export default cropPdf;
