import type { Tool } from "@/types";

/**
 * Compress PDF, an honest, in-browser PDF size reducer. Each page is
 * rasterised and re-encoded as a JPEG with a quality/scale profile chosen by
 * the level control, which reliably shrinks image-heavy and scanned PDFs. All
 * copy is unique to compression and deliberately candid about the trade-off:
 * text is flattened into an image, and text-only PDFs may barely shrink. The
 * work happens locally with pdf.js + pdf-lib. No upload, ever.
 */
const compressPdf: Tool = {
  slug: "compress-pdf",
  title: "Compress PDF",
  notFor: [
    { text: "It does not split a document into parts.", toolSlug: "split-pdf" },
    { text: "It does not remove pages - every page stays, smaller.", toolSlug: "delete-pdf-pages" },
  ],
  description:
    "Shrink a PDF's file size right in your browser. Pick a compression level, see exactly how much you saved, and download. No uploads, no watermark.",
  category: "pdf-tools",
  group: "Optimize PDF",
  icon: "FileArchive",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Compress PDF Online, Reduce File Size Free & Private",
  tagline:
    "Make heavy PDFs email-friendly. Choose Low, Medium or High compression, watch the before-and-after sizes update, and download a lighter file, all processed on your device, nothing uploaded.",
  longDescription:
    "The GigAI PDF Compressor shrinks bulky PDFs without sending them anywhere. It renders each page and re-encodes it as an optimized JPEG using a quality profile you pick, which is especially effective on scanned documents and image-heavy files where most of the weight lives in pictures. Everything runs in your browser with pdf.js and pdf-lib, so there's no upload, no queue and no watermark. We're upfront about the method: this is a genuine, lossy recompression rather than server-grade structural optimisation, so vector text becomes part of the page image. If a file happens to compress larger than the original, as pure-text PDFs sometimes do, the tool simply hands your original back unchanged. You always see the exact saving before you download.",

  ctaText: "Compress PDF",

  keywords: [
    "compress pdf",
    "reduce pdf size",
    "pdf compressor",
    "shrink pdf",
    "compress pdf online",
    "make pdf smaller",
    "reduce pdf file size free",
    "pdf size reducer",
    "optimize pdf",
    "compress pdf for email",
  ],

  seo: {
    title: "Compress PDF, Reduce PDF File Size Online Free | GigAI Tools",
    description:
      "Compress PDF files for free in your browser. Choose a compression level, see the exact size saved, and download a lighter PDF. No uploads, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "Low, Medium & High levels",
      description:
        "One control trades quality against savings. Low keeps pages crisp for a modest cut. High is aggressive when you just need the file to fit.",
    },
    {
      icon: "Scale",
      title: "See the exact saving",
      description:
        "Original size, compressed size and the percentage reduced are shown side by side, so you know precisely what you gained before downloading.",
    },
    {
      icon: "Images",
      title: "Best on scans & image PDFs",
      description:
        "Compression re-encodes each page as a JPEG, so scanned documents, photo brochures and slide exports typically shrink the most.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Your PDF is read and recompressed locally with pdf.js and pdf-lib. It's never uploaded, stored or seen by anyone: privacy holds on every page.",
    },
    {
      icon: "ShieldAlert",
      title: "Never returns a bigger file",
      description:
        "If recompression can't beat the original (common for pure-text PDFs) the tool returns your original bytes untouched rather than inflating it.",
    },
  ],

  benefits: [
    {
      title: "Honest about the method",
      description:
        "This is real, lossy JPEG recompression, not magic. We tell you plainly that text is flattened into the page image, so you can choose the right level.",
    },
    {
      title: "Fits email & upload limits",
      description:
        "Bring a report under a 10 MB mail cap or a portal's upload ceiling in seconds, without splitting the file or losing a page.",
    },
    {
      title: "Free with no watermark",
      description:
        "No account, no daily quota, no paywall and nothing stamped on your pages, compress as many PDFs as you like at no cost.",
    },
    {
      title: "Private by design",
      description:
        "Because compression runs on your device, sensitive contracts and scans never leave it. Close the tab and every trace is gone.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag a single PDF onto the drop zone, or click to browse. The tool reads it locally. Nothing is sent anywhere.",
    },
    {
      title: "Choose a level",
      description:
        "Pick Low, Medium or High. Higher levels reduce quality further for a smaller file. Low keeps pages sharpest.",
    },
    {
      title: "Compress",
      description:
        "Hit Compress PDF. Each page is rendered and re-encoded on your device, with a progress bar for longer documents.",
    },
    {
      title: "Review & download",
      description:
        "Check the before/after sizes and percentage saved. Happy with it? Download. Want more savings? Try a higher level.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Email a heavy client deck",
      description:
        "Squeeze an image-rich proposal or slide export under your mail server's attachment cap so it sends first time, without a file-sharing link.",
    },
    {
      audience: "Student",
      title: "Meet a portal upload limit",
      description:
        "Trim a scanned thesis or assignment below a submission system's size ceiling so it uploads before the deadline, no pages dropped.",
    },
    {
      audience: "Business",
      title: "Slim an archive of scans",
      description:
        "Reduce months of scanned invoices and receipts to a fraction of their size for cheaper storage and faster syncing across devices.",
    },
  ],

  troubleshooting: [
    {
      problem: "My PDF barely got smaller.",
      solution:
        "Text-only PDFs are already compact, so there's little to reclaim. This tool shines on scans and images. Try a higher level. If the result would be larger, we return your original unchanged.",
    },
    {
      problem: "The text is no longer selectable after compressing.",
      solution:
        "That's expected: compression rasterises each page into an image, which flattens live text. If you need selectable text, keep the original or run our OCR PDF tool on the compressed file.",
    },
    {
      problem: "Pages look soft or blurry.",
      solution:
        "You likely used High compression. Re-upload the original and choose Medium or Low for a gentler quality cut, or accept a slightly larger file for sharper pages.",
    },
  ],

  tips: [
    "Start on Medium. It balances size and quality well. Only reach for High when a hard limit forces it.",
    "Scanned or photo-heavy PDFs compress far more than text documents, so set expectations by what's inside the file.",
    "Need both small AND selectable text? Compress first, then run OCR PDF to add a searchable text layer back.",
    "Merging several files? Combine them with Merge PDF first, then compress once, it's faster than compressing each separately.",
  ],

  security:
    "Your PDF is compressed entirely in your browser with pdf.js and pdf-lib, it's never uploaded to any server. Nothing is stored, logged or shared, so when you close the tab every page is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to compress it?",
      answer:
        "No. Compression runs entirely in your browser using pdf.js and pdf-lib. Your file is read, recompressed and downloaded locally. It never leaves your device, so there's nothing for us to store or see.",
    },
    {
      question: "Why did my file barely shrink?",
      answer:
        "This tool works by re-encoding page images as JPEGs, so it reduces image-heavy and scanned PDFs the most. A file that's mostly plain text is already efficient and has little to reclaim. If a level would produce a larger file, we return your original unchanged.",
    },
    {
      question: "Will compressing reduce quality?",
      answer:
        "Yes. This is genuine lossy compression, and we won't pretend otherwise. Each page is rasterised and re-encoded as a JPEG, so images get softer at higher levels and text becomes part of the page picture rather than selectable text. Choose Low for the gentlest result.",
    },
    {
      question: "What do Low, Medium and High actually do?",
      answer:
        "Each level sets a render scale and JPEG quality. Low renders sharper at higher quality for a modest saving. Medium balances the two. High renders smaller at lower quality for the biggest cut. Try a level, check the reported saving, and adjust.",
    },
    {
      question: "Can I keep the text selectable and searchable?",
      answer:
        "Not through compression itself, because pages are flattened to images. If you need searchable text afterwards, run the compressed file through our OCR PDF tool to add a text layer back on top of the images.",
    },
    {
      question: "Is it really free with no watermark?",
      answer:
        "Completely. There's no account, no daily limit, no paywall and no watermark on your pages. Since the work happens on your device, we don't run servers to process files, so we can offer it free with no catch.",
    },
  ],

  relatedTools: ["merge-pdf", "split-pdf", "pdf-to-jpg", "rotate-pdf"],
};

export default compressPdf;
