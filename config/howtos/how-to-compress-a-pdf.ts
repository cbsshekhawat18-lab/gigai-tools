import type { HowTo } from "@/types";

/**
 * How to compress a PDF, the canonical worked example for the how-to content
 * type. Content authors: copy this file's shape exactly (see "=== TEMPLATE ===").
 */
const howto: HowTo = {
  slug: "how-to-compress-a-pdf",
  title: "How to Compress a PDF (Free, In Your Browser)",
  description:
    "Shrink a large PDF in seconds. No software, no upload, no watermark. A simple step-by-step guide to reducing PDF file size while keeping it readable.",
  accent: "rose",
  icon: "FileArchive",
  toolSlug: "compress-pdf",
  seo: {
    title: "How to Compress a PDF for Free (No Upload, No Watermark)",
    description:
      "Learn how to compress a PDF and reduce its file size in your browser, free, private and instant. Step-by-step, with tips for the best quality-to-size balance.",
    keywords: [
      "how to compress a pdf",
      "reduce pdf file size",
      "compress pdf free",
      "shrink pdf",
      "make pdf smaller",
    ],
    canonical: "/how-to/how-to-compress-a-pdf",
  },
  intro: [
    "A PDF that's too large to email or slow to upload is one of the most common file headaches, and it's almost always caused by high-resolution images embedded in the document. Compressing the PDF re-encodes those images and strips redundant data, often cutting the file size by half or more while keeping the text perfectly sharp.",
    "You don't need Acrobat or any installed software to do this. The guide below uses our free PDF compressor, which runs entirely in your browser: your file never leaves your device, there's no sign-up, and the result has no watermark. The whole process takes under a minute.",
  ],
  steps: [
    {
      title: "Open the PDF compressor",
      body: "Head to the Compress PDF tool. It loads instantly and works on desktop and mobile, nothing to install and no account required.",
    },
    {
      title: "Add your PDF",
      body: "Drag your PDF onto the upload area, or click to browse and select it. The file is loaded into your browser locally. It is never uploaded to a server.",
    },
    {
      title: "Choose a compression level",
      body: "Pick how aggressively to compress. A balanced setting keeps the document crisp while cutting size significantly. A stronger setting shrinks it further for email, at a small cost to image detail.",
    },
    {
      title: "Compress the file",
      body: "Click Compress and let the tool re-encode the images and streamline the file. You'll see the new size and how much smaller it is compared to the original.",
    },
    {
      title: "Download your smaller PDF",
      body: "Download the compressed PDF straight to your device. It has no watermark and is ready to email, upload or archive. If it's still too large, run it again at a stronger level.",
    },
  ],
  tips: [
    "Compression mostly targets images. A text-only PDF is already small and won't shrink much.",
    "Start with a balanced level and only go stronger if you still need a smaller file. That preserves the best readability.",
    "If you only need part of the document, split or extract the pages you need first: a shorter PDF is a smaller PDF.",
    "For scanned documents, running OCR first can help, but expect scanned pages (which are images) to stay larger than digital-text pages.",
  ],
  faq: [
    {
      question: "Is it safe to compress a PDF online?",
      answer:
        "With this tool, yes. It runs entirely in your browser, so your PDF is processed on your own device and never uploaded to a server. Nothing is stored or logged, which makes it safe even for sensitive or confidential documents.",
    },
    {
      question: "Will compressing a PDF reduce its quality?",
      answer:
        "Text stays perfectly sharp because it isn't compressed the way images are. Images may lose a small amount of detail at stronger compression levels, but at a balanced setting the difference is usually invisible on screen and in print.",
    },
    {
      question: "How much smaller will my PDF get?",
      answer:
        "It depends on the file. Image-heavy PDFs often shrink by 50–80%, while PDFs that are mostly text are already compact and will only shrink a little. The tool shows you the exact reduction before you download.",
    },
    {
      question: "Do I need to install any software?",
      answer:
        "No. Everything happens in your web browser, there's nothing to download or install, no account to create and no watermark on the result.",
    },
  ],
  relatedToolSlugs: ["merge-pdf", "split-pdf", "pdf-to-word", "image-compressor"],
  relatedHowToSlugs: [],
};

export default howto;
