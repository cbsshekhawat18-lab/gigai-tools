import type { Tool } from "@/types";

/**
 * SVG Pattern Generator, the "Generate" tool for seamless, tiling SVG
 * backgrounds. Seven tile primitives (dots, grid, lines, cross, chevron,
 * triangles, circles) drive `makePattern` from the SVG engine; a tile-size
 * slider, foreground/background color pickers and a stroke-weight control tune
 * the look, and the tool emits both a clean tiling SVG and ready-to-paste CSS
 * that references a compact single-tile data-URI so the pattern repeats at any
 * size. Every tile is deterministic geometry. No server, no upload, and the
 * copy is written for the exact searches designers make when they want "that
 * subtle dotted / graph-paper / diagonal-line background" without opening a
 * vector editor.
 */
const svgPatternGenerator: Tool = {
  slug: "svg-pattern-generator",
  title: "SVG Pattern Generator",
  description:
    "Create seamless, tiling SVG background patterns (dots, grid, diagonal lines, cross, chevron, triangles and circles) with tile-size, color and stroke controls, then copy the SVG or ready-to-paste CSS. 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Grid3x3",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-20",

  h1: "SVG Pattern Generator, Seamless Tiling Backgrounds, Free",
  tagline:
    "Pick a tile (dots, grid, diagonal lines, chevron and more) set the size, colors and stroke, and watch a seamless repeating background take shape. Copy the tiling SVG or paste-ready CSS, all generated in your browser.",
  longDescription:
    "The GigAI SVG Pattern Generator makes the subtle, repeating textures that sit behind hero sections, cards and empty states: the dotted grids, graph-paper lines, diagonal hatches and chevrons you see on polished product pages: without touching Illustrator or hunting for a stock texture. Choose one of seven tile primitives, then dial in the tile size, foreground and background colors, and stroke weight. The preview redraws instantly and the pattern stays perfectly seamless because it's rendered as a real SVG `<pattern>` tile repeated across the canvas, not a cropped image. When you're happy, take the output two ways: copy a clean, scalable tiling SVG you can drop into an `<img>`, a React component or a CSS mask, or copy a ready-to-paste CSS rule that embeds a compact single-tile data-URI and repeats it with `background-repeat`, so the exact same texture renders anywhere a `background-image` does. No extra HTTP request, no sprite sheet. Because every tile is deterministic geometry, the pattern you approve regenerates identically from the same settings, and you can undo/redo through everything you've tried, preview it on light or dark, and randomise for inspiration. Nothing is uploaded: the tile maths, the data-URI encoding and the CSS all run locally, so it works offline and never sees your brand colors.",

  ctaText: "Generate a pattern",

  keywords: [
    "svg pattern generator",
    "pattern generator",
    "seamless pattern svg",
    "tiling background generator",
    "css background pattern",
    "svg background pattern",
    "dot pattern generator",
    "grid pattern svg",
    "diagonal lines background",
    "chevron pattern svg",
    "repeating svg background",
    "hero background pattern",
  ],

  seo: {
    title:
      "SVG Pattern Generator, Seamless Tiling Backgrounds (SVG + CSS) | GigAI Tools",
    description:
      "Free SVG pattern generator. Build seamless tiling backgrounds (dots, grid, diagonal lines, cross, chevron, triangles, circles) with tile-size, color and stroke controls, then copy the SVG or ready-to-paste CSS. 100% in your browser.",
  },

  features: [
    {
      icon: "Shapes",
      title: "Seven tile primitives",
      description:
        "Dots, grid, diagonal lines, cross, chevron, triangles and circles, each rendered as a true SVG <pattern> tile so it repeats seamlessly with no visible seams, no matter how large the fill area.",
    },
    {
      icon: "Ruler",
      title: "Tile-size & stroke control",
      description:
        "Scale the tile from tight, fine textures to bold, spacious ones, and set the stroke weight for the line-based tiles (grid, lines, cross, chevron, circles) to go from hairline to heavy.",
    },
    {
      icon: "Palette",
      title: "Foreground & background colors",
      description:
        "Pick the pattern color and an optional solid backdrop with native color pickers, or keep the background transparent so the texture floats over whatever's behind it.",
    },
    {
      icon: "Code2",
      title: "Copy SVG or paste-ready CSS",
      description:
        "Take a clean, scalable tiling SVG for markup and masks, or a CSS rule that embeds a compact single-tile data-URI and repeats it, the exact same texture, no extra HTTP request.",
    },
    {
      icon: "Dices",
      title: "Randomise for inspiration",
      description:
        "One click rolls a fresh combination of tile, size, stroke and colors when you're not sure where to start: then fine-tune from there. It's deterministic, so nothing is lost.",
    },
    {
      icon: "Undo2",
      title: "Undo, redo & live preview",
      description:
        "A big preview on a light or dark surface updates as you tweak, with full undo/redo through every tile, size and color you've tried this session.",
    },
  ],

  benefits: [
    {
      title: "Backgrounds that never tile-seam",
      description:
        "Because the output is a real repeating SVG tile, the texture stays perfectly seamless at any size. No half-cut dots or misaligned lines the way a cropped raster image gives you.",
    },
    {
      title: "One texture, two clean outputs",
      description:
        "Copy a scalable SVG for markup and masks, or a CSS background-image rule with an inline data-URI, the same pattern, whichever fits your stack, with no separate asset file to host.",
    },
    {
      title: "Reproducible and on-brand",
      description:
        "Every tile is deterministic geometry, so the pattern you approve in review regenerates identically from the same settings, and it's colored with your exact hex values, not a fixed palette.",
    },
    {
      title: "Private and offline",
      description:
        "The tile maths, the data-URI encoding and the CSS all run on your device. Your brand colors and where the background is headed never leave the tab.",
    },
  ],

  howTo: [
    {
      title: "Pick a tile",
      description:
        "Choose from dots, grid, diagonal lines, cross, chevron, triangles or circles. The preview shows the pattern tiling across the canvas immediately.",
    },
    {
      title: "Tune size, stroke & colors",
      description:
        "Drag the tile-size slider for density, set the stroke weight for the line tiles, and pick a foreground color plus an optional solid background.",
    },
    {
      title: "Preview on light or dark",
      description:
        "Flip the preview surface to check the texture against a real background, and randomise or undo/redo until it feels right.",
    },
    {
      title: "Copy the SVG or the CSS",
      description:
        "Copy the tiling SVG for markup, or the paste-ready CSS with an embedded data-URI. Download the .svg if you'd rather host it. Everything is generated locally.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "CSS"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Section & hero backgrounds",
      description:
        "Generate a subtle dotted or graph-paper texture and drop the CSS data-URI straight into a section's background-image. No extra asset request, seamless at any viewport width.",
    },
    {
      audience: "Product designer",
      title: "Card & empty-state texture",
      description:
        "Add a light diagonal-line or cross hatch behind cards and empty states to give flat UI depth, tuned to the brand color and handed off as a reproducible SVG.",
    },
    {
      audience: "Content & social",
      title: "Slide and banner backdrops",
      description:
        "Export a tiling SVG to sit behind slide content or a banner where a plain color feels bare, without paying for a stock texture pack or opening a design app.",
    },
    {
      audience: "Indie hacker",
      title: "Landing-page polish",
      description:
        "Layer a faint pattern behind your copy to make a bare landing page feel intentional, free, on-brand and yours to tweak until the density is right.",
    },
  ],

  troubleshooting: [
    {
      problem: "My pattern looks too busy or too sparse.",
      solution:
        "Adjust the tile-size slider, a smaller tile packs the motif more densely, a larger tile spaces it out. For line tiles, lowering the stroke weight also makes a dense pattern feel lighter.",
    },
    {
      problem: "The background is transparent when I wanted a solid color.",
      solution:
        "By default the tile background is transparent so it floats over your page. Turn on the background color and pick a hue to bake a solid backdrop into the pattern itself.",
    },
    {
      problem: "The stroke slider doesn't change the dots or triangles.",
      solution:
        "Dots and triangles are filled shapes, so stroke weight doesn't apply to them. Stroke affects the line-based tiles, grid, lines, cross, chevron and circles. Switch to one of those to see it take effect.",
    },
    {
      problem: "The CSS pattern looks different from the SVG preview.",
      solution:
        "The CSS uses a single-tile data-URI sized to one tile and repeated by the browser, so faint sub-pixel rendering can differ from the multi-tile SVG. Set background-size to the tile size (shown in the snippet) for a pixel-exact match.",
    },
  ],

  tips: [
    "For a modern 'dot grid', pick dots with a small tile size and a low-contrast foreground close to your background color, subtle beats loud.",
    "Graph-paper look: choose grid with a hairline stroke (1–1.5) and a very light foreground for a clean, technical backdrop.",
    "Keep the background transparent when layering the pattern over an existing colored section. Only bake a solid background when the SVG stands alone.",
    "Prefer the CSS data-URI output for backgrounds. It repeats natively and needs no separate file or HTTP request.",
    "Found the perfect texture? The same tile, size, stroke and colors always regenerate it exactly, so note the settings.",
  ],

  security:
    "Every pattern is generated in your browser, the tile geometry, the data-URI encoding and the CSS all run locally on your device. Nothing is uploaded, stored or logged, so your brand colors and where the background is headed stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "How do I add an SVG pattern as a CSS background?",
      answer:
        "Copy the CSS output from this tool, it's a ready-to-paste rule that embeds the tile as a compact data-URI and repeats it with background-repeat. Drop it onto any element and the pattern fills the background with no separate image file to host and no extra HTTP request. For a pixel-exact repeat, keep the background-size value the tool includes.",
    },
    {
      question: "Are the patterns actually seamless when they tile?",
      answer:
        "Yes. Each pattern is rendered as a real SVG <pattern> tile that the browser repeats, and the motif is drawn to line up edge-to-edge, so there are no half-cut dots, broken lines or visible seams however large the fill area gets. That's the advantage of a generated tile over cropping a raster image.",
    },
    {
      question: "What's the difference between the SVG and CSS output?",
      answer:
        "The SVG output is a standalone, scalable file with a repeating <pattern> filling the canvas, ideal for an <img>, a React component or an SVG mask. The CSS output is a background-image rule that inlines a single tile as a data-URI and repeats it, which is what you want when the pattern is decoration behind other content. Both render the same texture. Pick whichever fits your stack.",
    },
    {
      question: "Which patterns can I generate?",
      answer:
        "Seven tile primitives: dots, grid, diagonal lines, cross, chevron, triangles and circles. Each can be tuned by tile size and color, and the line-based tiles (grid, lines, cross, chevron, circles) also respond to the stroke-weight control, giving a wide range of densities and weights from a small set of shapes.",
    },
    {
      question: "Can I change the colors to match my brand?",
      answer:
        "Yes. Set the foreground color of the pattern with a native color picker, plus an optional solid background color, using your exact hex values. Leave the background transparent to float the texture over an existing colored section, or bake in a solid backdrop when the pattern stands alone.",
    },
    {
      question: "Do I need to host an image file for the pattern?",
      answer:
        "No. The CSS output embeds the tile inline as a data-URI, so the pattern travels with your stylesheet, there's no separate.svg or.png to upload, host or cache-bust. If you'd rather serve a file, you can still download the standalone tiling SVG instead.",
    },
    {
      question: "Is my data uploaded to a server?",
      answer:
        "No. The tile geometry, the data-URI encoding and the CSS are all computed in your browser. Nothing you generate is sent anywhere, stored or logged, so it's private by design and works offline: close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. The patterns are plain geometry with no licence attached. Use them freely in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, seven tile primitives (dots, grid, lines, cross, chevron, triangles, circles) with tile-size, color and stroke controls, live preview, and SVG + CSS output.",
    },
    {
      date: "2026-06-26",
      change:
        "Added ready-to-paste CSS with an inline single-tile data-URI, undo/redo, keyboard shortcuts, and a randomise button for quick inspiration.",
    },
    {
      date: "2026-07-01",
      change:
        "Added light/dark preview surfaces and a transparent-background toggle so patterns can be checked against real page colors before export.",
    },
  ],

  relatedTools: [
    "svg-blob-generator",
    "svg-wave-generator",
    "svg-gradient-generator",
    "svg-optimizer",
    "svg-to-react",
    "image-compressor",
  ],
};

export default svgPatternGenerator;
