import type { Tool } from "@/types";

/**
 * SVG Blob Generator: the flagship "Generate" tool of the SVG suite. It
 * synthesises smooth, organic blob shapes from a seeded spline: sliders for
 * complexity (lobe count), contrast (edge irregularity) and size, a solid or
 * two-stop gradient fill, and a one-click re-roll that walks a reproducible
 * seed so any blob you love can be reproduced and shared byte-for-byte. Live
 * big-canvas preview, copy the SVG markup, download crisp SVG or a rasterised
 * PNG, all computed in the browser with a deterministic PRNG, no server, no
 * randomness you can't reproduce. Copy is written for the exact queries
 * designers type when they want "that gooey blob background from every SaaS
 * landing page" without opening a vector editor.
 */
const svgBlobGenerator: Tool = {
  slug: "svg-blob-generator",
  title: "SVG Blob Generator",
  description:
    "Generate smooth, organic SVG blob shapes with sliders for complexity, edge contrast and size, solid or gradient fills, and a seeded re-roll, then copy the SVG or download SVG/PNG. 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Blend",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-18",

  h1: "SVG Blob Generator, Organic Blob Shapes, Free",
  tagline:
    "Drag three sliders and watch a smooth, gooey blob take shape. Re-roll for a fresh silhouette, drop in a gradient, and copy the SVG or export a PNG: every blob is generated from a seed you can reproduce, entirely in your browser.",
  longDescription:
    "The GigAI SVG Blob Generator turns three simple controls into the soft, organic blob shapes behind almost every modern SaaS hero, avatar mask and section background. A seeded spline algorithm plots anchor points around a circle, jitters their radius, then threads a closed smooth curve through them, so complexity controls how many lobes the blob has, contrast controls how irregular and gooey the edge gets, and re-roll advances a reproducible seed for an endless supply of fresh silhouettes. Because the whole thing is deterministic, the blob you fall in love with is never lost: the same seed and settings always regenerate the exact same path, so you can copy the markup, download a razor-sharp SVG that scales to any size, or rasterise a transparent PNG at 2× for tools that don't take vectors. Fill it with a flat brand color or a two-stop gradient, preview it on a checkerboard, light or dark surface, and undo/redo your way back to an earlier shape. Nothing is uploaded: the generator, the PNG rasteriser and the seed all run locally, so it works offline and never sees your brand colors or where the graphic is headed.",

  ctaText: "Generate a blob",

  keywords: [
    "svg blob generator",
    "blob generator",
    "organic blob svg",
    "blob shape generator",
    "blob maker",
    "svg blob background",
    "gooey blob svg",
    "random blob generator",
    "blob svg download",
    "css blob shape",
    "abstract shape generator",
    "svg blob png",
  ],

  seo: {
    title: "SVG Blob Generator, Organic Blob Shapes (SVG + PNG) | GigAI Tools",
    description:
      "Free SVG blob generator. Create smooth organic blob shapes with complexity, contrast and size sliders, solid or gradient fills and a seeded re-roll, then copy the SVG or download SVG/PNG. 100% in your browser.",
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "Three sliders, infinite blobs",
      description:
        "Complexity sets the number of lobes (3–12), contrast controls how irregular and gooey the edge is (perfect circle to spiky), and size drives the export dimensions: every change re-draws the curve instantly.",
    },
    {
      icon: "Dices",
      title: "Seeded re-roll you can reproduce",
      description:
        "Re-roll walks a deterministic seed for a fresh silhouette on demand. The same seed plus settings always regenerate the identical path, so a blob you like is never a one-time accident.",
    },
    {
      icon: "Palette",
      title: "Solid or two-stop gradient",
      description:
        "Fill with a flat brand color or a diagonal two-stop gradient using native color pickers. The gradient is emitted as a real SVG <linearGradient>, not a flattened raster.",
    },
    {
      icon: "FileCode",
      title: "Clean, scalable SVG output",
      description:
        "Output is a single tidy <path> inside a proper viewBox: resolution-independent, tiny, and ready to paste into React, CSS masks, Figma or a plain <img>.",
    },
    {
      icon: "FileImage",
      title: "Transparent PNG export",
      description:
        "Rasterise the blob to a transparent PNG at 2× in one click for tools that won't take vectors (Canva, slide decks, email) using the browser canvas, no upload.",
    },
    {
      icon: "Undo2",
      title: "Undo, redo & live preview",
      description:
        "A big preview on a checkerboard, light or dark surface updates as you drag, with full undo/redo through every shape and color you've tried this session.",
    },
  ],

  benefits: [
    {
      title: "Ship the SaaS-hero look in seconds",
      description:
        "Skip Illustrator. Get the soft, organic blob behind modern landing pages, avatars and section dividers with three sliders and a re-roll: then paste the SVG straight into your build.",
    },
    {
      title: "Reproducible, not throwaway",
      description:
        "Because every blob comes from a seed, the shape you approved in design review regenerates byte-for-byte later. Share the settings and a teammate gets the exact same graphic.",
    },
    {
      title: "One shape, every format",
      description:
        "Copy the markup for code, download a crisp SVG that scales forever, or export a transparent PNG for tools that can't read vectors: all from the same blob.",
    },
    {
      title: "Private and offline",
      description:
        "The generator, the gradient and the PNG rasteriser all run on your device. Your brand colors and where the graphic is going never leave the tab.",
    },
  ],

  howTo: [
    {
      title: "Shape it with the sliders",
      description:
        "Set complexity for how many lobes the blob has, contrast for how irregular the edge gets, and size for the export dimensions. The preview redraws live.",
    },
    {
      title: "Re-roll for a fresh silhouette",
      description:
        "Not feeling it? Hit Re-roll (or Randomize) to advance the seed and get a new blob. Undo steps back to a shape you liked better.",
    },
    {
      title: "Pick a fill",
      description:
        "Choose a solid color or switch to gradient and set two stops. Preview it on checkerboard, light or dark to check it against your real background.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the SVG markup, download a scalable .svg, or export a transparent .png at 2×. Everything is generated locally in your browser.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "PNG"],
  },

  useCases: [
    {
      audience: "Product designer",
      title: "Hero & section backgrounds",
      description:
        "Generate the gooey blob shapes that anchor a SaaS hero or divide sections, tune them to the brand palette, and hand off reproducible SVGs the engineers can drop in unchanged.",
    },
    {
      audience: "Frontend developer",
      title: "Avatar & image masks",
      description:
        "Use a blob path as a clip-path or SVG mask so profile photos and thumbnails render in an organic shape instead of a plain circle: copy the path and reference it in CSS.",
    },
    {
      audience: "Content & social",
      title: "Slide and post graphics",
      description:
        "Export a transparent PNG blob for a deck, a story background or an email header where a vector isn't accepted, without opening a design app or paying for stock shapes.",
    },
    {
      audience: "Indie hacker",
      title: "Launch-page decoration",
      description:
        "Scatter a couple of soft, on-brand blobs behind your copy to make a bare landing page feel designed: free, reproducible, and yours to tweak until it's right.",
    },
  ],

  troubleshooting: [
    {
      problem: "My gradient shows as a flat color in another app.",
      solution:
        "Some tools flatten or drop SVG <linearGradient> defs on paste. If the destination can't render gradients, export the PNG instead, it bakes the gradient into pixels, or keep the fill solid for maximum compatibility.",
    },
    {
      problem: "The PNG looks soft or pixelated when scaled up.",
      solution:
        "PNG is raster, so it only has the pixels you exported. Bump the size slider before exporting, or better, use the SVG. It's resolution-independent and stays crisp at any scale.",
    },
    {
      problem: "I re-rolled past a blob I loved and can't get it back.",
      solution:
        "Use Undo (Ctrl/Cmd+Z) to step back through every shape this session, then Redo to move forward. Once you land on the one you want, copy or download it immediately to lock it in.",
    },
    {
      problem: "The blob looks like a plain circle.",
      solution:
        "Contrast is at or near zero, which makes every radius equal. Raise the contrast slider for a more irregular, organic edge, and increase complexity for more distinct lobes.",
    },
  ],

  tips: [
    "Keep complexity between 5 and 8 for the classic 'SaaS blob', too many lobes reads as a gear, too few as an egg.",
    "Moderate contrast (around 0.3–0.5) gives the friendly, gooey look. Crank it past 0.7 only when you want something jagged.",
    "Prefer the SVG over the PNG wherever the target accepts it, it's smaller, sharper at any size, and re-colorable in code.",
    "Use a blob path as a CSS clip-path or mask to frame avatars and images in an organic shape.",
    "Found the perfect blob? Note the settings, the same seed and sliders always regenerate it exactly.",
  ],

  security:
    "Every blob is generated in your browser from a deterministic seed, the shape, the gradient and the PNG rasterisation all run locally on your device. Nothing is uploaded, stored or logged, so your brand colors and where the graphic is headed stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "What is an SVG blob and why would I use one?",
      answer:
        "A blob is a smooth, closed organic shape, the soft, gooey silhouette you see behind modern SaaS heroes, in avatar masks and as section dividers. As an SVG it's a single scalable path: tiny in bytes, crisp at any size, and re-colorable in code, which makes it ideal for backgrounds, decoration and image masks.",
    },
    {
      question: "Are the blobs random, and can I reproduce one?",
      answer:
        "They're generated from a seed, so they're reproducible rather than truly random. Re-roll advances the seed for a fresh shape, but the same seed plus the same slider settings always regenerate the identical path. That means a blob you approve in design review can be recreated byte-for-byte later, and you can share the settings for a teammate to get the exact same graphic.",
    },
    {
      question: "What do the complexity and contrast sliders do?",
      answer:
        "Complexity sets how many anchor points ring the blob, more points mean more lobes and a busier silhouette (3–12). Contrast controls how much each point's radius varies: near zero it's a smooth circle, and higher values push the edge into an irregular, organic, gooey shape. Size drives the export dimensions.",
    },
    {
      question: "Can I download the blob as PNG as well as SVG?",
      answer:
        "Yes. Copy the SVG markup or download a scalable.svg for the web and code, or export a transparent.png at 2× for tools that don't accept vectors, decks, Canva, email headers. The PNG is rasterised locally on the browser canvas. Nothing is uploaded.",
    },
    {
      question: "How do I use a blob as an image or avatar mask?",
      answer:
        "Copy the blob's <path>, give it an id, and reference it from a CSS clip-path or an SVG <mask>/<clipPath> applied to your image. The photo then renders inside the organic blob shape instead of a rectangle or circle. Keeping the blob as SVG means the mask stays sharp at every resolution.",
    },
    {
      question: "Can I add a gradient fill?",
      answer:
        "Yes, switch the fill to gradient and pick two colors. The tool emits a real SVG <linearGradient> in the output, so it stays editable and resolution-independent. If a destination app flattens gradients on paste, export the PNG instead, which bakes the colors into pixels.",
    },
    {
      question: "Is anything uploaded to a server?",
      answer:
        "No. The blob geometry, the gradient and the PNG rasterisation are all computed in your browser. Nothing you generate is sent anywhere, stored or logged, so it's private by design and works offline: close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. The shapes you generate are plain geometry with no licence attached. Use them freely in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, seeded blob generator with complexity, contrast and size sliders, solid/gradient fill, live preview, re-roll, and SVG + PNG export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added undo/redo across shapes and colors, keyboard shortcuts (re-roll, copy, download, undo/redo), and a set of one-click preset blobs to start from.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the spline tension for smoother edges at high contrast and added checkerboard/light/dark preview surfaces to check blobs against real backgrounds.",
    },
  ],

  relatedTools: [
    "svg-wave-generator",
    "svg-pattern-generator",
    "svg-gradient-generator",
    "svg-optimizer",
    "svg-to-react",
    "image-compressor",
  ],
};

export default svgBlobGenerator;
