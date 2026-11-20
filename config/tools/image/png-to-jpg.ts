import type { Tool } from "@/types";

/**
 * PNG to JPG: converts transparent PNGs into flat JPEGs. All copy is unique to
 * format conversion: the story here is choosing a background fill for the
 * transparent pixels PNG allows but JPG can't, then re-encoding at a quality you
 * control. Honest scope: JPG is lossy and opaque, so this trades PNG's alpha
 * channel and losslessness for the dramatically smaller files JPG delivers on
 * photographic content. Everything runs on the HTML canvas in your browser.
 */
const pngToJpg: Tool = {
  slug: "png-to-jpg",
  title: "PNG to JPG",
  notFor: [
    { text: "It does not shrink photographs that are already JPG.", toolSlug: "image-compressor" },
    { text: "Flat graphics and logos usually get BIGGER as JPG - keep those as PNG (our measured sample grew from 66 KB to 624 KB)." },
  ],
  description:
    "Convert PNG images to JPG in your browser: pick a background color for transparent areas, set the quality, and download a much smaller file.",
  category: "image-tools",
  icon: "Images",
  accent: "rose",
  processor: "convert",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Convert PNG to JPG, Free",
  tagline:
    "Turn heavy PNG screenshots and exports into lightweight JPGs. Choose the fill color behind transparent pixels and dial in the quality yourself.",
  longDescription:
    "PNG is brilliant for logos, screenshots and anything that needs sharp edges or transparency, but it's a poor fit for photographs and large exports. A single detailed PNG can be five to ten times bigger than the same picture saved as JPG. The GigAI PNG to JPG converter re-encodes your image as a JPEG entirely in the browser, so nothing is uploaded. Because JPG can't store transparency, you choose the color that fills those see-through areas (white to match a document, black for a dark UI, or any custom hex) and a quality slider lets you decide exactly how much you trade size for detail. Drop in a PNG, preview the result, and download a file that's typically a fraction of the original size.",

  ctaText: "Convert a PNG",

  keywords: [
    "png to jpg",
    "convert png to jpg",
    "png to jpeg converter",
    "change png to jpg",
    "png transparency to white background",
    "shrink png file size",
    "png to jpg online free",
    "flatten png background",
  ],

  seo: {
    title: "PNG to JPG Converter: Free & Private | GigAI Tools",
    description:
      "Convert PNG to JPG online for free. Choose a background color for transparent pixels, control the quality, and get a much smaller file. No upload, no sign-up.",
  },

  features: [
    {
      icon: "PaintBucket",
      title: "Choose the background fill",
      description:
        "JPG has no transparency, so you decide what fills it. Pick white, black or any custom hex to sit cleanly behind your former alpha pixels.",
    },
    {
      icon: "Gauge",
      title: "Quality you control",
      description:
        "A 10–100 slider sets the JPEG compression level, letting you tune the exact balance between a tiny file and a crisp, artifact-free image.",
    },
    {
      icon: "Scaling",
      title: "Big size savings",
      description:
        "Photographic and screenshot-heavy PNGs often shrink by 60–90% once re-encoded as JPG, without any visible change at high quality settings.",
    },
    {
      icon: "Eye",
      title: "Live before / after",
      description:
        "See the original PNG and the finished JPG side by side, with the exact bytes and percentage saved, before you commit to the download.",
    },
    {
      icon: "ShieldCheck",
      title: "Nothing leaves your device",
      description:
        "The conversion runs on the HTML canvas inside your tab. Your PNG is read, flattened and re-encoded locally. Never sent to a server.",
    },
  ],

  benefits: [
    {
      title: "Perfect for screenshots",
      description:
        "Screen-capture tools love to save bloated PNGs. Converting to JPG turns a multi-megabyte grab into a lean file that emails and uploads in seconds.",
    },
    {
      title: "Universal compatibility",
      description:
        "Every device, printer, CMS and photo app understands JPG. Converting removes any doubt about whether a recipient can open your image.",
    },
    {
      title: "Predictable, controllable output",
      description:
        "You choose the fill color and quality, so there are no surprises. What you preview is exactly the JPG you download. No auto-tuning behind your back.",
    },
    {
      title: "Instant and free forever",
      description:
        "There's no queue, no watermark and no daily cap. Convert one screenshot or a hundred exports back to back at full speed, at no cost.",
    },
  ],

  howTo: [
    {
      title: "Add your PNG",
      description:
        "Drag a PNG onto the drop zone, click to browse your files, or paste one straight from the clipboard after a screenshot.",
    },
    {
      title: "Set fill & quality",
      description:
        "Pick the background color that should replace transparent areas, then slide the quality control to balance sharpness against file size.",
    },
    {
      title: "Convert to JPG",
      description:
        "Press Convert to flatten and re-encode the image locally. The before/after panel shows precisely how much smaller the JPG is.",
    },
    {
      title: "Download",
      description:
        "Save your new JPG in one click. Want a different look? Change the fill or quality and convert again: it's instant.",
    },
  ],

  formats: {
    input: ["PNG"],
    output: ["JPG", "JPEG"],
  },

  faq: [
    {
      question: "What happens to the transparent parts of my PNG?",
      answer:
        "JPG can't store transparency, so those pixels have to be filled with a solid color. You choose which one. White is the safe default for documents and print, black suits dark interfaces, and a custom hex lets you match any brand or backdrop. The preview shows exactly how the fill looks before you download.",
    },
    {
      question: "Will converting to JPG lower the quality?",
      answer:
        "JPG is a lossy format, so some data is discarded during encoding, but you decide how much with the quality slider. At 85–95 the loss is effectively invisible on most images while the file still shrinks dramatically. Lower settings save even more space at the cost of visible artifacts around sharp edges and text.",
    },
    {
      question: "Why is my JPG so much smaller than the PNG?",
      answer:
        "PNG stores every pixel losslessly, which is expensive for detailed or photographic content. JPG uses lossy compression tuned for natural imagery, so it can represent the same picture in a fraction of the bytes. Screenshots and photos see the biggest savings. Flat graphics with few colors save less.",
    },
    {
      question: "Should I keep a PNG for logos and sharp text?",
      answer:
        "Often yes. PNG stays crisp on hard edges, flat color and text, and it's the only one of the two that supports transparency. Convert to JPG when you want a smaller file for a photo, a screenshot, or anywhere transparency and pixel-perfect edges don't matter. For logos on the web, PNG or SVG usually looks better.",
    },
    {
      question: "Is the conversion done online or on my device?",
      answer:
        "Entirely on your device. The tool reads your PNG in the browser, draws it to a canvas over your chosen background, and exports a JPG. All locally. Nothing is uploaded, so there's no file sitting on a server and nothing for us to store or see.",
    },
    {
      question: "Can I convert several PNGs at once?",
      answer:
        "You convert one image at a time so you can preview each result and fine-tune its fill and quality, but there's no limit on how many you process in a row. Convert, download, drop in the next one: as many as you like, for free.",
    },
  ],

  relatedTools: ["jpg-to-png", "image-compressor", "webp-converter", "image-resizer"],
};

export default pngToJpg;
