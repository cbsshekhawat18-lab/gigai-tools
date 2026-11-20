import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "svg-vs-png",
  a: "SVG",
  b: "PNG",
  title: "SVG vs PNG: Vector or Raster for Your Graphics?",
  description:
    "SVG is resolution-independent code that scales to any size and stays tiny for simple graphics. PNG is fixed-resolution pixels ideal for detail and screenshots. How to do it to choose.",
  accent: "emerald",
  icon: "Shapes",
  seo: {
    title: "SVG vs PNG: When to Use Vector vs Raster (2026 Guide)",
    description:
      "SVG vs PNG explained: why vectors scale infinitely and stay small for logos and icons, when PNG's pixels win, file size, editability, and the honest verdict.",
    keywords: [
      "svg vs png",
      "png vs svg",
      "svg or png for logo",
      "vector vs raster",
      "difference between svg and png",
      "svg vs png file size",
    ],
    canonical: "/compare/svg-vs-png",
  },
  intro: [
    "SVG and PNG solve the same problem, displaying a graphic, in fundamentally different ways, and understanding that difference is the whole decision. PNG is a raster format: it stores a fixed grid of pixels, so a PNG has one native resolution and gets blurry or blocky when scaled up. SVG is a vector format: it stores the graphic as math (points, lines, curves and fills described in text) so it renders razor-sharp at any size, from a 16-pixel favicon to a billboard, from the same tiny file.",
    "That makes the choice mostly about what the image contains. For logos, icons, illustrations and anything built from clean shapes and text, SVG is usually ideal: it's crisp at every scale, often only a few kilobytes, editable in code, and stylable with CSS. For photographs, screenshots, and anything with fine per-pixel detail or gradients too complex to describe as shapes, SVG falls apart, you can't meaningfully vectorise a photo, and PNG's exact pixel grid is exactly what you want.",
    "Below is a side-by-side of how the two formats behave, when each is the right tool, and a clear verdict, with the free converters to move between them.",
  ],
  dimensions: [
    {
      label: "Image type",
      a: "Vector, described as shapes, lines and curves (math).",
      b: "Raster, a fixed grid of individual pixels.",
    },
    {
      label: "Scaling",
      a: "Infinite, perfectly crisp at any size, no quality loss.",
      b: "Fixed: blurs or pixelates when enlarged past its resolution.",
    },
    {
      label: "Best content",
      a: "Logos, icons, illustrations, line art, flat shapes and text.",
      b: "Photos, screenshots, textures and fine per-pixel detail.",
    },
    {
      label: "File size",
      a: "Tiny for simple graphics. Can balloon for very complex artwork.",
      b: "Fixed by pixel dimensions. Large for big or detailed images.",
    },
    {
      label: "Editability",
      a: "Editable as plain text/code. Stylable and animatable with CSS.",
      b: "Edited pixel-by-pixel in a raster editor, not code-editable.",
    },
    {
      label: "Transparency",
      a: "Full support, plus partial fills and gradients.",
      b: "Full 8-bit alpha transparency.",
    },
    {
      label: "Photographs",
      a: "Unsuitable, cannot represent photographic detail efficiently.",
      b: "Excellent, the standard for lossless raster images.",
    },
    {
      label: "Responsiveness",
      a: "One file serves every screen density (Retina and beyond) crisply.",
      b: "Needs multiple sizes (1x/2x/3x) to stay sharp across screens.",
    },
  ],
  whenA: [
    "The graphic is a logo, icon or illustration made of clean shapes and text.",
    "It must stay crisp at every size and on every screen density from favicon to hero.",
    "You want a tiny file you can edit in code, recolor with CSS, or animate.",
    "You need one asset that adapts to any resolution without exporting multiple sizes.",
  ],
  whenB: [
    "The image is a photograph, screenshot or has fine per-pixel detail.",
    "The artwork is too complex to describe as vector shapes efficiently.",
    "You need a format that opens in every image viewer and editor by default.",
    "You're capturing a rendered result (a chart image, a UI snapshot) at a fixed size.",
  ],
  verdict:
    "Use SVG for logos, icons and any graphic built from shapes and text, it's smaller, infinitely scalable and editable, which makes it the modern default for interface and brand assets. Use PNG for photographs, screenshots and detailed raster imagery that can't be expressed as vectors. If you have a logo trapped in a PNG, converting it to SVG (where the shapes allow) future-proofs it. If you need a fixed-size raster of an SVG for a tool that won't render vectors, export it to PNG.",
  relatedToolSlugs: ["png-to-svg", "svg-to-png", "svg-optimizer", "image-compressor"],
  faq: [
    {
      question: "Should I use SVG or PNG for a logo?",
      answer:
        "Use SVG. A logo is exactly the kind of clean, shape-based graphic vectors are built for. It stays razor-sharp at every size from favicon to billboard, ships as a tiny file, and can be recolored or animated with CSS. Keep a PNG export on hand only for places that can't render SVG.",
    },
    {
      question: "Can I convert a photo to SVG?",
      answer:
        "Not usefully. SVG describes graphics as shapes, and a photograph is millions of subtly varying pixels that can't be reduced to clean shapes without either losing all detail or producing a bloated, worse-looking file. Photos should stay as PNG or JPEG. SVG is for logos, icons and illustrations.",
    },
    {
      question: "Which is smaller, SVG or PNG?",
      answer:
        "For simple graphics like icons and logos, SVG is usually far smaller (often just a few kilobytes) because it stores instructions rather than pixels. For photographs or highly detailed artwork, SVG becomes larger and impractical, and PNG (or a lossy format) is the smaller, correct choice.",
    },
    {
      question: "Does SVG support transparency?",
      answer:
        "Yes, fully. SVG supports transparent backgrounds, semi-transparent fills, gradients and opacity, so it works cleanly over any background. PNG also supports full alpha transparency, so on that dimension the two are equally capable.",
    },
    {
      question: "Why do SVGs stay sharp when I zoom in but PNGs don't?",
      answer:
        "Because SVG is redrawn from math at whatever size you display it, so there's no fixed resolution to run out of. A PNG has a set number of pixels. Zoom past that and the browser has to stretch each pixel, which produces the blurry or blocky look. That's the core reason vectors win for scalable assets.",
    },
  ],
  relatedComparisonSlugs: ["png-vs-webp", "png-vs-jpg"],
};

export default comparison;
