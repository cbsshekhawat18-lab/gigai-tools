import type { Tool } from "@/types";

/**
 * SVG Size Optimizer, the precision-first member of the GigAI SVG suite.
 * Where the flagship SVG Optimizer leads with SVGO's full plugin sweep, this
 * tool puts the single biggest lever on the front page: coordinate precision.
 * A large decimal-precision slider drives a live byte + gzip trade-off readout
 * so you can dial an SVG down decimal-by-decimal and watch the exact size cost
 * of each digit, while the checkerboard preview proves the artwork holds.
 * Every string is written for people whose SVG is "already minified" but still
 * too heavy, and nothing here is shared with the flagship's copy.
 */
const svgSizeOptimizer: Tool = {
  slug: "svg-size-optimizer",
  title: "SVG Size Optimizer",
  description:
    "Shrink an SVG to a target size with a precision slider and a live byte + gzip trade-off meter. Round coordinates decimal-by-decimal, watch the file get lighter, and confirm the artwork holds, all in your browser.",
  category: "svg-tools",
  group: "Optimize",
  icon: "Ruler",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-06-19",

  h1: "SVG Size Optimizer: Shrink SVG by Precision, Online",
  tagline:
    "Some SVGs are already minified and still too heavy. The weight is hiding in twelve-decimal path coordinates. Drag one precision slider and watch the bytes, the gzip estimate and the savings percentage move in real time, with a checkerboard preview that proves the curve never budged.",
  longDescription:
    "The GigAI SVG Size Optimizer is built around one insight: after the obvious cruft is gone, most of the remaining weight in an SVG lives in the length of its numbers. A path point written as 24.0000001 costs nine characters where 24 costs two, and a single icon can carry hundreds of them. This tool makes that trade-off the whole experience. A prominent precision slider runs from lossless full precision down to aggressive one- and zero-decimal rounding. As you drag it, the byte count, the estimated gzipped size and the percentage saved update live, and the checkerboard preview re-renders so you can push exactly until the artwork starts to move and then step back. Under the slider it still runs the real SVGO pipeline in your browser (collapsing groups, converting styles to attributes and dropping editor metadata) with a dependency-free fallback when SVGO's chunk can't load, so precision is the headline lever but never the only one. Safe defaults keep the viewBox, IDs and title/desc intact so responsive scaling, sprite references and accessibility survive. You opt into removing width/height for fluid sizing or stripping IDs only when you know nothing points at them. Everything runs client-side, so confidential logos, unreleased marks and internal icon sets never leave your machine. It is the tool you reach for when a build plugin already ran and the file is still bigger than you want to ship.",

  ctaText: "Shrink SVG",

  keywords: [
    "svg size optimizer",
    "reduce svg file size",
    "svg precision reducer",
    "round svg coordinates",
    "svg decimal precision",
    "shrink svg to target size",
    "compress svg further",
    "svg path precision",
    "make svg smaller",
    "svg byte size reducer",
    "trim svg coordinates",
  ],

  seo: {
    title: "SVG Size Optimizer, Shrink SVG by Coordinate Precision | GigAI Tools",
    description:
      "Free SVG size optimizer with a precision slider and live byte + gzip trade-off. Round coordinates decimal-by-decimal, hit a target size, and confirm the artwork with a checkerboard preview: 100% in your browser.",
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "One big precision slider",
      description:
        "Coordinate precision is the front-and-center control, not a buried number field. Drag from full precision to zero decimals and feel exactly where the savings live for this specific artwork.",
    },
    {
      icon: "Gauge",
      title: "Live size trade-off meter",
      description:
        "Bytes, estimated gzip and percentage saved update the instant you move the slider, so every decimal place has a visible price and you can stop the moment the returns flatten out.",
    },
    {
      icon: "Eye",
      title: "Checkerboard proof preview",
      description:
        "The rounded result renders live on a transparency checkerboard beside the code. Push precision until a curve or gradient just starts to shift, then back off one step, the exact edge, made visible.",
    },
    {
      icon: "Wand2",
      title: "Real SVGO underneath",
      description:
        "Beyond rounding, it runs SVGO's browser build to collapse groups, merge redundant markup and strip editor metadata, with a dependency-free fallback so precision reduction keeps working offline.",
    },
    {
      icon: "ShieldCheck",
      title: "Safe defaults, opt-in risk",
      description:
        "viewBox, IDs and title/desc stay by default so scaling, sprites and accessibility don't break. Removing dimensions or IDs is a deliberate toggle, never a surprise.",
    },
    {
      icon: "Lock",
      title: "Never uploaded",
      description:
        "Parsing, rounding and optimization all happen on your device. Unreleased logos and internal icon sets never touch a server, close the tab and nothing remains.",
    },
  ],

  benefits: [
    {
      title: "Squeeze files a build plugin already touched",
      description:
        "SVGO in your pipeline uses a fixed precision. This tool lets you go lower per-file, by eye, for the handful of heavy icons that matter most, reclaiming bytes an automated pass left on the table.",
    },
    {
      title: "Hit a size budget you can see",
      description:
        "When an inline SVG has to fit under a byte budget for LCP or a data-URI, the live meter turns 'small enough' from guesswork into a number you drag toward.",
    },
    {
      title: "Never over-round by accident",
      description:
        "Precision is destructive if you go too far. The side-by-side preview means you always see the cost before you commit, so aggressive settings never silently deform an icon.",
    },
    {
      title: "Understand where SVG weight comes from",
      description:
        "Watching bytes fall as decimals drop is the fastest way to learn that coordinate precision (not the markup) is usually what makes an 'already minified' SVG heavy.",
    },
  ],

  howTo: [
    {
      title: "Load an SVG",
      description:
        "Paste markup, drop a .svg file onto the workspace, or click Import. A sample with deliberately over-precise coordinates loads in one click if you just want to see the slider work.",
    },
    {
      title: "Drag the precision slider",
      description:
        "Pull precision down from full to a couple of decimals and watch the byte, gzip and saved-percentage badges move together in real time.",
    },
    {
      title: "Watch the preview for the edge",
      description:
        "Keep going until the checkerboard preview shows the artwork start to shift, then step back one decimal. That is the smallest safe size for this graphic.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the shrunk SVG, download it as a .svg, or share a link that reopens the tool with your source and settings ready to reproduce.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Performance engineer",
      title: "Fit an inline SVG under a byte budget",
      description:
        "You inline a hero graphic for LCP and it has to stay under a hard byte budget. Drag precision until the meter reads under target while the preview confirms the shape is intact.",
    },
    {
      audience: "Icon designer",
      title: "Tame a hand-exported path",
      description:
        "A path traced or exported at full float precision carries dozens of long decimals. Round it down by eye and keep only the digits the icon actually needs to look crisp.",
    },
    {
      audience: "Design systems engineer",
      title: "Right-size the heavy outliers",
      description:
        "Your build's SVGO precision is a compromise for the whole set. Hand-tune the three or four icons that dominate the sprite's weight to a lower precision they can tolerate.",
    },
    {
      audience: "Email / CSS author",
      title: "Slim an SVG for a data-URI",
      description:
        "Data-URI embedding punishes every byte. Shrink a decorative SVG hard, confirm it in the preview, then hand it to the SVG-to-data-URI tool already at its lightest.",
    },
  ],

  troubleshooting: [
    {
      problem: "The icon looks lumpy or jagged after I lowered precision.",
      solution:
        "You rounded past what this artwork can tolerate. Raise precision by a decimal or two until the checkerboard preview looks smooth again: small icons and curved paths need more decimals than large flat shapes.",
    },
    {
      problem: "Bytes barely dropped even at low precision.",
      solution:
        "This SVG's weight isn't in its coordinates. It may be gradients, filters, embedded rasters or long IDs. Precision reduction only shrinks numeric path data. Try the full SVG Optimizer for structural cleanup.",
    },
    {
      problem: "My SVG stopped scaling to its container.",
      solution:
        "The viewBox was removed or you stripped width/height incorrectly. Keep 'Keep viewBox' on: the viewBox is what enables scaling. For fluid sizing, keep the viewBox and enable 'Remove width/height' instead.",
    },
    {
      problem: "The gzip number and the byte number disagree on how much I saved.",
      solution:
        "That's expected: gzip is an estimate of the compressed shipping weight, and shortening repetitive numbers compresses differently than raw bytes suggest. Treat the byte count as exact and the gzip figure as a shipping-weight guide.",
    },
  ],

  tips: [
    "Drag precision down until the preview just starts to move, then step back one decimal, that's the sweet spot for almost every icon.",
    "Most SVG weight is in coordinate length: dropping from 6 decimals to 2 often saves more than any structural plugin.",
    "Curves and gradients need more decimals than flat rectangles, tune precision per graphic, not once for a whole set.",
    "Watch the gzip estimate, not just raw bytes: it's closer to what actually ships over the wire.",
    "Optimize with precision before embedding as a data-URI so the encoded string starts as short as possible.",
  ],

  security:
    "Your SVG is parsed, rounded and optimized entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so unreleased logos, brand marks and internal icons are safe to shrink here. If SVGO's browser build can't load, a built-in fallback still runs locally. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How is this different from the SVG Optimizer?",
      answer:
        "The SVG Optimizer leads with SVGO's full plugin sweep for general cleanup. The SVG Size Optimizer puts coordinate precision front and center with a big slider and a live size trade-off, for the case where an SVG is already minified but the numbers are still too long. Both run the same engine underneath. This one is tuned for dialing in a target size by eye.",
    },
    {
      question: "Why does lowering precision shrink the file so much?",
      answer:
        "Path data is stored as text, so 24.0000001 literally costs more characters than 24. Design tools and tracers often emit six to twelve decimals of precision that no display will ever resolve. Rounding those numbers down removes real bytes from every point in every path, usually the single largest saving in an already-minified SVG.",
    },
    {
      question: "Will rounding coordinates change how the SVG looks?",
      answer:
        "It can, if you go too far. Precision reduction is lossy: round hard enough and curves flatten or points drift. That's exactly why the tool shows a live checkerboard preview beside the code. You push precision until the artwork just starts to shift, then step back one decimal to keep the file small and the shape intact.",
    },
    {
      question: "What precision should I use?",
      answer:
        "For most icons, 2 to 3 decimals is invisible and captures nearly all the savings. Large flat shapes often survive 0 to 1 decimal. Detailed illustrations, tight curves and smooth gradients may need 3 to 4. There's no universal number: the point of the slider and preview is to find the right one for your specific graphic.",
    },
    {
      question: "Is the gzip size a real gzip?",
      answer:
        "No: it's a fast estimate modeled from the output's size and character repetition, clearly labeled as an estimate in the UI. It's a good guide to relative shipping weight as you drag the slider. For a byte-exact compressed size, gzip the downloaded file with your build tooling.",
    },
    {
      question: "Is my SVG uploaded anywhere?",
      answer:
        "No. All parsing, rounding and optimization happen locally in your browser using SVGO's browser build, with a dependency-free fallback if it can't load. Your file never leaves your device, so there's nothing to store or log, it's safe for confidential and unreleased assets.",
    },
    {
      question: "Can I shrink an SVG to a specific target size?",
      answer:
        "Yes. That's the workflow this tool is built for. Watch the live byte and gzip badges as you drag precision and toggle options until the meter reads under your target, using the preview to make sure you didn't sacrifice the artwork to hit the number.",
    },
    {
      question: "Does it work on SVGs with gradients, filters or animation?",
      answer:
        "Yes. The engine preserves gradients, filters and SMIL animation, and the preview renders them so you can confirm they survived. Note that precision reduction only shrinks numeric coordinates, if most of a file's weight is a heavy filter or an embedded raster, expect smaller wins and consider the full optimizer.",
    },
  ],

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release: precision-first SVG shrinking with a large coordinate-precision slider, live byte + gzip + saved-percentage trade-off meter, checkerboard preview, keep-viewBox / remove-dimensions / remove-IDs / remove-title toggles, multipass, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-25",
      change:
        "Added precision presets (Lossless, Balanced, Aggressive), keyboard shortcuts for stepping precision, and sample SVGs with deliberately over-precise coordinates to demonstrate the slider.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved the gzip shipping-weight estimate and added clearer guidance for when precision reduction won't help (gradient/filter/raster-heavy files).",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-minifier",
    "svg-to-data-uri",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgSizeOptimizer;
