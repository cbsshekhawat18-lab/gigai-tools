import type { Tool } from "@/types";

/**
 * JPG to PNG: a focused format converter. It re-wraps a JPEG's decoded pixels
 * into a lossless PNG so the output can carry an alpha channel later, survive
 * repeated edits without re-compression, and render crisp flat color and text.
 * Copy is unique to this tool and honest: converting to PNG cannot recover
 * detail JPEG already discarded. It simply stops any further quality loss.
 */
const jpgToPng: Tool = {
  slug: "jpg-to-png",
  title: "JPG to PNG",
  description:
    "Convert JPG and JPEG images to lossless PNG in your browser, perfect for editing, transparency workflows and crisp graphics. Free, private, no upload.",
  category: "image-tools",
  icon: "FileImage",
  accent: "cyan",
  processor: "convert",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Convert JPG to PNG, Free & Lossless",
  tagline:
    "Turn any JPG into a pixel-perfect PNG that's ready for editing, layering and transparent workflows. No re-compression, no quality loss on the way out.",
  longDescription:
    "The GigAI JPG to PNG converter decodes your JPEG and re-encodes it as a lossless PNG, the format designers reach for whenever an image needs to be edited, layered or kept perfectly sharp. Unlike JPEG, PNG never re-compresses on save, so once your image is a PNG you can crop, retouch and export it again and again with zero added artifacts. It's the natural first step before removing a background, dropping a logo onto a new color or feeding an asset into a design tool that expects PNG. Everything runs locally with the HTML canvas: drop in a JPG, convert, and download a clean PNG that never leaves your device.",

  ctaText: "Convert JPG to PNG",

  keywords: [
    "jpg to png",
    "jpeg to png converter",
    "convert jpg to png",
    "jpg to png online",
    "lossless png converter",
    "change jpg to png",
    "image format converter",
    "jpg to transparent png",
  ],

  seo: {
    title: "JPG to PNG Converter: Free & Lossless Online | GigAI Tools",
    description:
      "Convert JPG to PNG online for free. Get a lossless PNG ready for editing, transparency and crisp graphics, fully private, processed in your browser, no upload or sign-up.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "Truly lossless output",
      description:
        "PNG stores every pixel exactly. Once converted, your image can be edited and re-saved endlessly without the compression artifacts JPEG adds each time.",
    },
    {
      icon: "Layers",
      title: "Edit-ready for design tools",
      description:
        "PNG is the format Photoshop, Figma and Canva expect for clean assets. Convert first, then layer, mask or composite without fighting JPEG blockiness.",
    },
    {
      icon: "Type",
      title: "Crisp text & flat color",
      description:
        "Screenshots, logos and diagrams keep razor-sharp edges in PNG instead of the fuzzy halos JPEG leaves around high-contrast lines.",
    },
    {
      icon: "MousePointerClick",
      title: "One-click, zero settings",
      description:
        "No quality dials to guess at: PNG is lossless, so conversion is a single click. Drop the JPG in and the PNG is ready to download.",
    },
    {
      icon: "WifiOff",
      title: "Works fully offline",
      description:
        "Because the conversion runs on the canvas in your tab, once the page has loaded you can keep converting even with the connection dropped.",
    },
  ],

  benefits: [
    {
      title: "A clean base for transparency",
      description:
        "JPEG can't hold transparency, but PNG can. Converting to PNG is the prerequisite for cutting out a background or dropping an image onto a new color.",
    },
    {
      title: "No more generation loss",
      description:
        "Every time you re-save a JPEG it degrades a little. PNG breaks that cycle so your working file stays identical no matter how many times you export it.",
    },
    {
      title: "Nothing leaves your device",
      description:
        "The JPG is decoded and re-encoded inside your browser. No upload, no server copy, no account: ideal for private photos, contracts or brand assets.",
    },
    {
      title: "Predictable, sharp results",
      description:
        "PNG gives you an exact, repeatable output every time (the same pixels in, the same pixels out) with no surprise quality changes on download.",
    },
  ],

  howTo: [
    {
      title: "Add a JPG",
      description:
        "Drag a JPG or JPEG onto the drop zone, click to browse your files, or paste an image straight from your clipboard.",
    },
    {
      title: "Preview it",
      description:
        "Check the loaded image looks right. There are no quality settings to tune. PNG is lossless, so what you see is exactly what you'll get.",
    },
    {
      title: "Convert to PNG",
      description:
        "Click Convert to re-encode the picture as a lossless PNG locally. The before/after view confirms the new format and file size.",
    },
    {
      title: "Download the PNG",
      description:
        "Save your new PNG and take it straight into your editor or design tool. No watermark, no sign-up.",
    },
  ],

  formats: {
    input: ["JPG", "JPEG"],
    output: ["PNG"],
  },

  faq: [
    {
      question: "Does converting JPG to PNG improve the image quality?",
      answer:
        "No, and any tool that claims it does is misleading you. JPEG permanently discards detail when it compresses, and converting to PNG can't bring that detail back. What PNG does do is stop any further loss: from the moment you convert, the pixels are frozen exactly as they are, so future edits and saves won't degrade the image any more.",
    },
    {
      question: "Will the PNG file be larger than the JPG?",
      answer:
        "Usually, yes. PNG is lossless, so for photographs it often ends up several times bigger than the JPEG. That's the trade-off for perfect fidelity and edit-friendly output. For flat graphics, screenshots and logos the size difference is much smaller, and PNG can even win.",
    },
    {
      question: "Will the converted PNG have a transparent background?",
      answer:
        "Not automatically. A JPEG has no transparency, so the PNG inherits its solid background. Converting to PNG is the first step, to actually make an area see-through you then erase the pixels you don't want in an image editor, which needs PNG's alpha channel to work.",
    },
    {
      question: "Are my images uploaded anywhere?",
      answer:
        "No. The conversion happens entirely in your browser using the HTML canvas. Your JPG is read, redrawn and re-encoded locally, then offered as a download. Nothing is sent to a server, stored or seen by us.",
    },
    {
      question: "Why choose PNG over WebP for editing?",
      answer:
        "Both are lossless-capable, but PNG has near-universal support across editors, operating systems and older software, and it's the format most design tools default to for imported assets. WebP is excellent for shipping images on the web at a smaller size. PNG is the safer choice as a working file.",
    },
    {
      question: "Can I convert several JPGs to PNG?",
      answer:
        "Yes, convert one, download it, then drop in the next. There's no daily cap, no queue and no sign-up. The only limit is your device's memory, since each image is held in the browser while it's being processed.",
    },
  ],

  relatedTools: ["png-to-jpg", "webp-converter", "crop-image"],
};

export default jpgToPng;
