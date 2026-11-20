import type { Tool } from "@/types";

/**
 * Extract PDF Pages. Pick individual pages from a document and pull them into a
 * brand-new PDF. Unlike Split (which divides a file into many pieces) or Delete
 * (which removes pages and keeps the rest), extraction is additive and precise:
 * you tap the exact pages you want, in any combination, and get one clean file
 * containing only those pages: copied byte-for-byte, entirely in the browser
 * with pdf-lib, never uploaded.
 */
const extractPdfPages: Tool = {
  slug: "extract-pdf-pages",
  title: "Extract PDF Pages",
  description:
    "Hand-pick the exact pages you want and save them as a brand-new PDF. Multi-select from live thumbnails, then download: free and 100% in your browser.",
  category: "pdf-tools",
  group: "Organize PDF",
  icon: "FileOutput",
  accent: "violet",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Extract Pages from a PDF, Free & Private",
  tagline:
    "Tap the pages you actually need from a live thumbnail grid and turn them into their own tidy PDF. No page ranges to type, no uploads, no watermark, just the pages you chose.",
  longDescription:
    "The GigAI Page Extractor lets you cherry-pick any pages from a PDF and copy just those into a fresh document. Upload one file, watch every page render as a thumbnail, then click to select the pages you want (a single page, a scattered handful, or an exact run) with a running count showing your choice. The tool rebuilds a new PDF from only those pages using pdf-lib, right inside your browser tab, keeping the original text, images and vector graphics intact. Because there are no page limits, no watermark and nothing ever leaves your device, extraction is instant and completely private, whether you're lifting one signature page out of a contract or a whole chapter out of a reference manual.",

  ctaText: "Extract pages",

  keywords: [
    "extract pdf pages",
    "extract pages from pdf",
    "save pages from pdf",
    "pull pages out of pdf",
    "pick pdf pages",
    "select pdf pages",
    "extract specific pages pdf",
    "pdf page extractor",
    "copy pages from pdf",
  ],

  seo: {
    title: "Extract PDF Pages. Save Selected Pages as a New PDF | GigAI Tools",
    description:
      "Extract specific pages from a PDF for free. Click pages on a thumbnail grid to select them, then save just those as a new file, 100% private, no uploads, no watermark.",
  },

  features: [
    {
      icon: "MousePointerClick",
      title: "Point-and-pick selection",
      description:
        "Click the pages you want straight on the thumbnail grid. No ranges to type. Selected pages get a check and a highlight so your choice is always obvious.",
    },
    {
      icon: "ListChecks",
      title: "Live selection counter",
      description:
        "A running tally shows exactly how many pages you've picked and which numbers they are, so you can confirm before you extract a single one.",
    },
    {
      icon: "FileOutput",
      title: "One clean output file",
      description:
        "Your chosen pages become a single new PDF in their natural order, the perfect handout, appendix or excerpt without the surrounding clutter.",
    },
    {
      icon: "ShieldCheck",
      title: "Extracted in your browser",
      description:
        "Pages are copied locally with pdf-lib. The file is never uploaded, stored or seen by anyone: the privacy promise holds for every page you keep.",
    },
    {
      icon: "FileCheck2",
      title: "Original quality preserved",
      description:
        "Each extracted page is copied as-is, so text stays selectable and images keep their resolution. Nothing is flattened, re-rendered or degraded.",
    },
  ],

  benefits: [
    {
      title: "Only what you need",
      description:
        "Skip the ranges and the guesswork. See every page, tap the ones that matter, and walk away with a document that contains those and nothing else.",
    },
    {
      title: "Private by design",
      description:
        "Extraction runs entirely inside your browser tab. Your PDF never leaves your device, so there's nothing for us to upload, store or read.",
    },
    {
      title: "Free with no watermark",
      description:
        "No account, no page cap and no stamp on your output. Extract one page or forty, as often as you like, at no cost.",
    },
    {
      title: "Works on any device",
      description:
        "It's a normal web page, nothing to install. Pick pages from a laptop, tablet or phone and get the exact same clean result.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag one PDF onto the drop zone, or click to browse. Every page renders as a numbered thumbnail you can scroll through.",
    },
    {
      title: "Select the pages",
      description:
        "Click each page you want to keep. The check mark and counter confirm your selection: click again to unpick a page.",
    },
    {
      title: "Extract",
      description:
        "Hit Extract pages. The tool copies just your chosen pages into a single new PDF, locally and instantly, with no upload.",
    },
    {
      title: "Download",
      description:
        "Download your new file. Need a different set? Adjust your selection and extract again, it's unlimited.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Lift the signed pages from a contract",
      description:
        "Pull just the execution page and the amended clause out of a 40-page agreement so counsel receives exactly the pages under review: nothing more.",
    },
    {
      audience: "Student",
      title: "Keep one chapter for revision",
      description:
        "Extract the pages of the single chapter you're studying from a hefty course reader, giving you a light file to annotate or print for exam prep.",
    },
    {
      audience: "Business",
      title: "Share a report's key figures",
      description:
        "Select the summary and the two charts stakeholders actually asked about, and send a focused two-page PDF instead of the full 50-page deck.",
    },
  ],

  troubleshooting: [
    {
      problem: "The pages came out in the wrong order.",
      solution:
        "Extraction keeps pages in their original document order regardless of the order you clicked them. If you need a custom sequence, use our Reorder PDF Pages tool on the extracted file.",
    },
    {
      problem: "The Extract button won't run.",
      solution:
        "At least one page must be selected. Click a thumbnail so it shows a check mark (the counter above the grid should read one or more selected) then extract.",
    },
    {
      problem: "The thumbnails won't render or the file won't open.",
      solution:
        "The PDF may be password-protected or damaged. Remove the password with our Unlock PDF tool (you'll need to know it), or re-save the file from its source, then upload it again.",
    },
  ],

  tips: [
    "Only need to remove a few pages instead of keeping a few? The Delete PDF Pages tool is the faster inverse. Keep everything except what you pick.",
    "For a large contiguous block like pages 12–40, our Split PDF tool's range mode can be quicker than clicking each thumbnail.",
    "Selecting scanned pages? The extracted file can be heavy. Run it through Compress PDF afterwards to shrink it for email.",
    "Extracted pages always follow the source order. If you want them rearranged, reorder the new file with our Reorder PDF Pages tool.",
  ],

  security:
    "Your PDF is opened and its pages extracted entirely in your browser with pdf-lib: it's never uploaded to any server. Nothing is stored, logged or shared, and when you close the tab every page is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server to extract pages?",
      answer:
        "No. The extractor runs entirely in your browser using pdf-lib. Your file is opened, the chosen pages are copied, and the new PDF is built and downloaded locally, nothing ever leaves your device.",
    },
    {
      question: "Can I select pages that aren't next to each other?",
      answer:
        "Yes. Click any combination of thumbnails, page 2, page 9 and page 30 if you like. Every selected page is copied into a single new PDF, so you're not limited to one continuous range.",
    },
    {
      question: "What order will the extracted pages be in?",
      answer:
        "They follow the original document order, not the order you clicked. So if you pick page 8 then page 3, the new file will show page 3 first. To set a custom order, run the result through our Reorder PDF Pages tool.",
    },
    {
      question: "How is this different from Split PDF or Delete PDF Pages?",
      answer:
        "Split divides a document into several separate files. Delete removes pages and keeps the rest. Extract is additive. You pick specific pages and get one new file containing only those, ideal when you want a small excerpt rather than the whole reorganized document.",
    },
    {
      question: "Will extracting lower the quality or add a watermark?",
      answer:
        "Never. Each page is copied exactly as it appears in the source, so text stays selectable and images keep their original resolution. No watermark is ever added to your file.",
    },
    {
      question: "Is there a limit on how many pages I can extract?",
      answer:
        "There's no artificial cap, extract one page or the whole document. The only practical limit is your device's memory, since the source and the new PDF are held in the browser while the pages are copied.",
    },
  ],

  relatedTools: ["split-pdf", "delete-pdf-pages", "merge-pdf", "reorder-pdf-pages"],
};

export default extractPdfPages;
