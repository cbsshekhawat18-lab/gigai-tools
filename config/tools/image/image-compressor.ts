import type { Tool } from "@/types";

/**
 * Image Compressor: the REFERENCE tool. Its shape (accent, processor, full
 * micro-site content) is the template every other image tool follows. All copy
 * here is unique to compression and kept honest: it shrinks files by re-encoding
 * with adjustable JPEG/WebP quality, entirely in the browser.
 */
const imageCompressor: Tool = {
  slug: "image-compressor",
  title: "Image Compressor",
  notFor: [
    { text: "It does not change pixel dimensions - a 4000×3000 photo stays 4000×3000, just lighter.", toolSlug: "image-resizer" },
    { text: "It does not cut anything out of the frame.", toolSlug: "crop-image" },
    { text: "It does not convert between formats - a JPG stays a JPG.", toolSlug: "webp-converter" },
  ],
  description:
    "Shrink JPG, PNG and WebP images without a visible quality drop. Set the quality yourself, or compress to an exact target size like 100 KB. Free, entirely in your browser.",
  category: "image-tools",
  icon: "Minimize2",
  accent: "sky",
  processor: "compress",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Compress Images Online",
  tagline:
    "Make JPG, PNG and WebP files dramatically smaller, with a live quality slider and a real before/after size comparison.",
  longDescription:
    "The GigAI Image Compressor re-encodes your photos and graphics at a quality level you control, cutting file size by 40–80% while keeping them sharp. Two modes: set the quality slider yourself, or switch to Target size and enter a limit like 100 KB, the tool binary-searches the highest quality that fits your budget, so you hit upload caps (under 100 KB, 50 KB, 2 MB) without guesswork. Drag in a JPG, PNG or WebP, and download. No account, no watermark, no upload. Every pixel is processed locally in your browser, so your images never touch a server. Smaller images mean faster-loading pages, quicker email attachments and more room on your device.",

  ctaText: "Compress an image",

  keywords: [
    "image compressor",
    "compress image",
    "reduce image size",
    "compress jpg",
    "compress png",
    "compress webp",
    "shrink image file size",
    "optimize images",
    "reduce photo size online",
    "compress image to 100kb",
    "compress image to 50kb",
    "compress image to 20kb",
    "compress jpeg to a specific size",
    "compress image to target size",
    "reduce image to under 2mb",
  ],

  seo: {
    title: "Image Compressor: Reduce Image File Size Free | GigAI Tools",
    description:
      "Compress JPG, PNG and WebP images online for free. Adjust quality with a live slider, see the exact size saved, and download: private, no upload, no sign-up.",
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "Live quality slider",
      description:
        "Trade size for fidelity in real time. Slide from 10 to 100 and watch the projected file size respond before you commit.",
    },
    {
      icon: "GaugeCircle",
      title: "40–80% smaller files",
      description:
        "Typical photos drop by more than half at high quality: enough to speed up a page load or clear an email size limit.",
    },
    {
      icon: "FileType2",
      title: "JPEG or WebP output",
      description:
        "Choose classic JPEG for universal support, or WebP for the same quality at an even smaller size on modern browsers.",
    },
    {
      icon: "SplitSquareHorizontal",
      title: "Before / after comparison",
      description:
        "See the original and the compressed result side by side, with the exact bytes saved and the percentage reduction.",
    },
    {
      icon: "Infinity",
      title: "No limits, no queue",
      description:
        "Compress as many images as you like, one after another, with no daily caps, sign-ups or waiting in line.",
    },
  ],

  benefits: [
    {
      title: "Private by design",
      description:
        "Compression happens inside your browser tab using the canvas API. Your images are never uploaded, stored or seen by anyone.",
    },
    {
      title: "Faster websites & emails",
      description:
        "Lighter images load sooner, improve Core Web Vitals and slip under attachment size limits that would otherwise bounce.",
    },
    {
      title: "You stay in control",
      description:
        "Nothing is auto-applied. You pick the quality and format, preview the outcome, and only then download the file.",
    },
    {
      title: "Works on any device",
      description:
        "It's a normal web page. No install and no plugin. Compress from a laptop, tablet or phone with the same result.",
    },
  ],

  howTo: [
    {
      title: "Add your image",
      description:
        "Drag a JPG, PNG or WebP onto the drop zone, click to browse, or paste one straight from your clipboard.",
    },
    {
      title: "Set the quality",
      description:
        "Drag the quality slider to balance file size against detail, and pick JPEG or WebP as your output format.",
    },
    {
      title: "Compress",
      description:
        "Hit Compress to re-encode the image locally. The before/after view shows exactly how many bytes you saved.",
    },
    {
      title: "Download",
      description:
        "Happy with the result? Download the smaller file. Not quite? Adjust the slider and compress again, it's instant.",
    },
  ],

  formats: {
    input: ["JPG", "JPEG", "PNG", "WebP", "GIF", "BMP"],
    output: ["JPG", "WebP"],
  },

  faq: [
    {
      question: "Does compressing an image reduce its quality?",
      answer:
        "It can, but you decide how much. Compression works by discarding data the eye is least likely to notice. At high quality settings (80–95) the loss is usually invisible while the file still shrinks a lot. Lower settings save more space at the cost of visible artifacts. The live preview lets you find the sweet spot for each image.",
    },
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. The compressor runs entirely in your browser using the HTML canvas. Your files are read, re-encoded and downloaded locally. They never leave your device, so there's nothing for us to store or see.",
    },
    {
      question: "Should I choose JPEG or WebP?",
      answer:
        "Pick JPEG when you need maximum compatibility: every browser, app and OS opens it. Choose WebP for the web: it typically produces a noticeably smaller file at the same visual quality and is supported by all modern browsers.",
    },
    {
      question: "Why doesn't it output compressed PNG?",
      answer:
        "PNG is lossless, so re-saving it rarely shrinks a photo and can even make it larger. To genuinely compress a photographic PNG we re-encode it to JPEG or WebP, which are built for exactly that. If you need a transparent, lossless PNG, keep it as PNG instead.",
    },
    {
      question: "How much smaller will my file get?",
      answer:
        "It depends on the image and the quality you choose, but most photos come out 40–80% smaller. Detailed photographs compress the most. Simple graphics with flat color compress less. The result panel always shows the exact size and percentage saved.",
    },
    {
      question: "Is there a limit on file size or number of images?",
      answer:
        "There's no artificial cap and no daily limit. You can compress image after image for free. The only practical ceiling is your device's memory, since very large images are held in the browser while they're processed.",
    },
  ],

  relatedTools: [
    "image-resizer",
    "webp-converter",
    "png-to-jpg",
  ],
};

export default imageCompressor;
