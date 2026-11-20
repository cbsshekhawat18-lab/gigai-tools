import type { Tool } from "@/types";

/**
 * HEIC to JPG, converts Apple's HEIC/HEIF photos into universal JPG (or PNG).
 * Browsers can't decode HEIC natively, so this tool decodes it with a WASM
 * libheif build (heic2any), lazy-loaded only when a HEIC is opened, then
 * re-encodes to JPG on the canvas. All in the browser. Nothing is uploaded.
 * Honest scope: HEIC holds one photo (this handles the main image), and some
 * uncommon HEIC variants may not decode: the tool says so clearly if that hits.
 */
const heicToJpg: Tool = {
  slug: "heic-to-jpg",
  title: "HEIC to JPG",
  notFor: [
    { text: "It does not make files smaller - JPG is usually larger than HEIC at the same quality. Convert for compatibility, then compress if size matters.", toolSlug: "image-compressor" },
  ],
  description:
    "Convert iPhone HEIC photos to JPG (or PNG) in your browser, so they open everywhere. Free, private and instant. Nothing is uploaded.",
  category: "image-tools",
  icon: "Smartphone",
  accent: "cyan",
  processor: "convert",
  status: "live",
  featured: false,
  createdAt: "2026-07-09",

  h1: "Convert HEIC to JPG, Free",
  tagline:
    "iPhone photos save as HEIC, which many apps and PCs can't open. Convert them to a universal JPG in your browser. No upload, no sign-up.",
  longDescription:
    "Apple devices save photos as HEIC (High-Efficiency Image Container) to keep quality high and files small, but the format still trips up plenty of Windows PCs, older apps, web forms and messaging tools that expect a JPG. The GigAI HEIC to JPG converter fixes that entirely in your browser: it decodes the HEIC with a WebAssembly build of libheif (the same open decoder behind most HEIC tools) then re-encodes the picture as a standard JPG (or PNG) you can open, upload and share anywhere. Because everything runs on your device, your photos are never uploaded to a server. Drop in a HEIC, choose the output format and quality, and download a file that just works.",

  ctaText: "Convert a HEIC",

  keywords: [
    "heic to jpg",
    "convert heic to jpg",
    "heic to jpeg",
    "iphone photo to jpg",
    "heic converter",
    "open heic file",
    "heic to png",
    "heic won't open",
  ],

  seo: {
    title: "HEIC to JPG Converter, Free & Private | GigAI Tools",
    description:
      "Convert iPhone HEIC photos to JPG online for free. Decoded and re-encoded in your browser: nothing uploaded, no sign-up, no watermark. Also exports PNG.",
  },

  features: [
    {
      icon: "Smartphone",
      title: "Made for iPhone photos",
      description:
        "HEIC is what iPhones and iPads shoot by default. This tool reads it directly, so you don't have to change your camera settings or email photos to yourself first.",
    },
    {
      icon: "Gauge",
      title: "Quality you control",
      description:
        "A quality slider sets the JPG compression, so you choose the balance between a small file and a crisp, artifact-free photo.",
    },
    {
      icon: "ShieldCheck",
      title: "Nothing leaves your device",
      description:
        "The HEIC is decoded and re-encoded on your device with WebAssembly. Your photos are read locally and never sent to a server.",
    },
    {
      icon: "Image",
      title: "JPG or PNG out",
      description:
        "Export a universal JPG for the smallest, most-compatible file, or a lossless PNG when you need maximum fidelity.",
    },
  ],

  benefits: [
    {
      title: "Opens everywhere",
      description:
        "A JPG works on every PC, phone, website form and app. Converting removes the 'this file type isn't supported' headache that HEIC causes on non-Apple devices.",
    },
    {
      title: "No camera changes needed",
      description:
        "Keep shooting in high-efficiency HEIC to save space on your phone, and just convert the few photos you need to share as JPG.",
    },
    {
      title: "Private by design",
      description:
        "Personal photos shouldn't be uploaded to a random converter. Here they're processed in your browser tab and nowhere else.",
    },
    {
      title: "Instant and free forever",
      description:
        "No queue, no watermark and no daily cap, convert one photo or a whole camera roll, back to back, at no cost.",
    },
  ],

  howTo: [
    {
      title: "Add your HEIC photo",
      description:
        "Drag a .heic file onto the drop zone or click to browse. The first conversion loads a small decoder. After that it's instant.",
    },
    {
      title: "Choose format & quality",
      description:
        "Pick JPG for a small, universal file or PNG for lossless output, then set the quality if you're exporting JPG.",
    },
    {
      title: "Convert",
      description:
        "The photo is decoded and re-encoded locally in your browser. The before/after panel shows the new file size.",
    },
    {
      title: "Download",
      description:
        "Save your JPG in one click, ready to upload, email or open anywhere. Drop in the next HEIC to keep going.",
    },
  ],

  formats: {
    input: ["HEIC", "HEIF"],
    output: ["JPG", "JPEG", "PNG"],
  },

  faq: [
    {
      question: "What is a HEIC file?",
      answer:
        "HEIC (High-Efficiency Image Container) is the format Apple devices use by default. It stores photos at high quality in about half the size of a JPG: great for saving space, but not yet supported everywhere, which is why so many people need to convert it.",
    },
    {
      question: "Why won't my HEIC open on Windows or in an app?",
      answer:
        "Many Windows PCs, older apps, web upload forms and messaging tools don't support HEIC. Converting the photo to JPG makes it open in virtually any program, on any device.",
    },
    {
      question: "Is the conversion done online or on my device?",
      answer:
        "Entirely on your device. The tool decodes the HEIC with a WebAssembly decoder in your browser and re-encodes it to JPG locally. Nothing is uploaded, so your photos never touch a server.",
    },
    {
      question: "Will converting reduce the quality?",
      answer:
        "JPG is lossy, so a little detail is discarded during encoding, but you control how much with the quality slider. At 85–95 the difference is effectively invisible. Choose PNG if you want a lossless copy.",
    },
    {
      question: "Does it keep the photo's date or location data?",
      answer:
        "Conversion focuses on the image itself. Some metadata (like EXIF) may not carry across, which many people actually prefer for privacy when sharing. Keep the original HEIC if you need the full metadata.",
    },
    {
      question: "A HEIC contains a Live Photo, what happens?",
      answer:
        "This tool converts the still image, which is what you need for uploads and sharing. The short motion clip attached to a Live Photo is separate and isn't part of the JPG.",
    },
  ],

  relatedTools: ["image-compressor", "image-resizer", "png-to-jpg", "webp-converter"],
};

export default heicToJpg;
