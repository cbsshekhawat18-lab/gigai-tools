import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "heic-vs-jpg",
  a: "HEIC",
  b: "JPG",
  title: "HEIC vs JPG: Which Should You Use for Your Photos?",
  description:
    "HEIC saves iPhone photos at higher quality in half the size, but JPG opens everywhere. Here's when to keep HEIC, when to convert to JPG, and what you actually lose.",
  accent: "cyan",
  icon: "Smartphone",
  seo: {
    title: "HEIC vs JPG: Which Photo Format Should You Use? (2026)",
    description:
      "HEIC vs JPG explained: why iPhones use HEIC, the quality and size difference, the compatibility problems, and exactly when to convert HEIC to JPG.",
    keywords: [
      "heic vs jpg",
      "heic or jpg",
      "heic vs jpeg",
      "is heic better than jpg",
      "should i use heic or jpg",
      "convert heic to jpg",
    ],
    canonical: "/compare/heic-vs-jpg",
  },
  intro: [
    "HEIC versus JPG is really a trade between efficiency and compatibility. HEIC (High-Efficiency Image Container) is what modern iPhones and iPads shoot by default. It uses newer compression to store a photo at noticeably higher quality in roughly half the file size of the same image saved as JPG, great for keeping your camera roll small without visibly hurting quality.",
    "JPG (JPEG) is the format the whole world already understands. It's older and less efficient, so files are larger at the same quality, but it opens on every phone, PC, browser, printer and upload form without a second thought. That universal support is exactly what HEIC still lacks: plenty of Windows PCs, older apps, web forms and messaging tools can't open a .heic file at all.",
    "So the honest answer is: keep shooting HEIC to save space, and convert the specific photos you need to share into JPG. Below is a side-by-side breakdown, a clear rule for choosing, and the tools to convert HEIC to JPG in your browser.",
  ],
  dimensions: [
    {
      label: "File size",
      a: "About half the size of JPG at the same quality.",
      b: "Larger: older, less efficient compression.",
    },
    {
      label: "Image quality",
      a: "Higher quality per byte. Supports more color depth (HDR).",
      b: "Good, but lossier at the same file size.",
    },
    {
      label: "Compatibility",
      a: "Limited. Many PCs, apps and forms can't open it.",
      b: "Universal, opens literally everywhere.",
    },
    {
      label: "Transparency",
      a: "Not used for photos (it's a photo container).",
      b: "No transparency, always a solid background.",
    },
    {
      label: "Editing / sharing",
      a: "Fine within Apple. Friction outside it.",
      b: "Zero friction anywhere.",
    },
    {
      label: "Best for",
      a: "Storing photos efficiently on Apple devices.",
      b: "Sharing, uploading and printing anywhere.",
    },
  ],
  whenA: [
    "You're keeping photos on an iPhone or iPad and want to save storage.",
    "You stay inside Apple's ecosystem (Photos, AirDrop between Apple devices).",
    "You want the best quality per megabyte and don't need to share widely.",
    "You value HDR / wider color that HEIC can carry.",
  ],
  whenB: [
    "You're sharing a photo with a non-Apple device, PC or app.",
    "You're uploading to a website, form or platform that rejects HEIC.",
    "You're printing, or sending to someone whose software is older.",
    "You just want a file that will open, no questions asked.",
  ],
  verdict:
    "Keep HEIC on your device to save space, and convert to JPG whenever you need to share, upload or print. HEIC is the better format for storing photos. JPG is the better format for using them anywhere else. Converting a HEIC to JPG in your browser takes seconds and solves the 'this file won't open' problem for good.",
  relatedToolSlugs: ["heic-to-jpg", "image-compressor", "png-to-jpg", "webp-converter"],
  faq: [
    {
      question: "Is HEIC better quality than JPG?",
      answer:
        "Yes, per byte. HEIC uses newer compression, so at the same file size it holds more detail and color than JPG, or matches JPG's quality at roughly half the size. The catch is compatibility: JPG opens everywhere, HEIC doesn't yet.",
    },
    {
      question: "Should I shoot in HEIC or JPG on my iPhone?",
      answer:
        "Shoot HEIC to save storage and keep the best quality, then convert the specific photos you need to share into JPG. If you constantly send photos to non-Apple devices, switching the camera to 'Most Compatible' (JPG) can save the hassle.",
    },
    {
      question: "Why won't my HEIC photo open on Windows?",
      answer:
        "Many Windows PCs and apps don't support HEIC without extra codecs. Converting the photo to JPG makes it open in virtually any program on any device.",
    },
    {
      question: "Do I lose quality converting HEIC to JPG?",
      answer:
        "There's a small, usually invisible loss because JPG is lossier. At a high quality setting the difference isn't noticeable, and you gain a file that opens everywhere. Keep the HEIC original if you want the archival copy.",
    },
  ],
  relatedComparisonSlugs: ["png-vs-jpg", "jpeg-vs-webp"],
};

export default comparison;
