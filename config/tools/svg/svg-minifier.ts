import type { Tool } from "@/types";

/**
 * SVG Minifier: the single-purpose, "make it as small as possible" sibling to
 * the SVG Optimizer. Where the Optimizer is a full workbench of safe toggles,
 * the Minifier is opinionated: it ships aggressive minification presets (Safe,
 * Balanced, Aggressive), strips every non-essential byte, and puts the raw
 * compression win front and centre with a big before → after readout, a
 * saved-percentage bar and a live one-line minified output. All copy below is
 * written for people whose specific query is "minify SVG" / "make this SVG one
 * line". Nothing is shared with the Optimizer, Viewer or Convert pages, and no
 * claim outruns what the client-side engine (optimize.minifySvg) actually does.
 */
const svgMinifier: Tool = {
  slug: "svg-minifier",
  title: "SVG Minifier",
  description:
    "Aggressively minify SVG online: collapse whitespace, strip comments, metadata and editor namespaces, and squeeze markup to a single line with a live before/after size and % saved. 100% in your browser.",
  category: "svg-tools",
  group: "Optimize",
  icon: "Minimize2",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-18",

  h1: "SVG Minifier, Compress & Minify SVG Online",
  tagline:
    "Paste an SVG and get the smallest byte-for-byte equivalent back instantly, comments, metadata and whitespace gone, coordinates rounded, markup collapsed to one line. Pick a Safe, Balanced or Aggressive preset, watch the size bar drop, and copy. Nothing is uploaded.",
  longDescription:
    "The GigAI SVG Minifier does one thing and does it hard: it makes an SVG as small as it can possibly be without changing what you see. Hand-authored and design-tool SVG is full of bytes that never render: comments, XML declarations, editor namespaces, doctype boilerplate, indentation, trailing whitespace, over-precise coordinates and default attributes. Paste your markup or drop a.svg file and the minifier collapses all of it in the browser, rounds path data to a precision you control, and emits a compact single-line string you can drop straight into HTML, JSX, a CSS data-URI or a JSON payload. Instead of a wall of options, it leads with three presets: Safe keeps IDs and title/desc and rounds gently, Balanced is the everyday sweet spot, and Aggressive squeezes the last few percent by stripping IDs, dimensions and metadata, with an escape hatch to fine-tune precision and each toggle when you need to. The headline is the size: a large before → after readout, the exact bytes and percentage saved, a visual savings bar and a gzipped estimate so you know the real transfer weight, not just the raw number. A live preview renders the minified result on a checkerboard so you can confirm at a glance that nothing broke, the one safety net a copy-paste minifier never gives you. Because everything runs client-side on your own machine, confidential logos, unreleased brand marks and internal icons are never uploaded. A dependency-free fallback keeps it minifying even if the engine chunk can't load, and closing the tab erases every trace.",

  ctaText: "Minify SVG",

  keywords: [
    "svg minifier",
    "minify svg",
    "minify svg online",
    "svg to one line",
    "shrink svg file",
    "reduce svg size",
    "svg minify tool",
    "inline svg minifier",
    "svg data uri minify",
  ],

  seo: {
    title: "SVG Minifier: Compress & Minify SVG Online (Free) | GigAI Tools",
    description:
      "Free online SVG minifier. Aggressively compress SVG, strip comments, metadata and whitespace, round coordinates and collapse to one line with a live before/after size + % saved. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "One-click minify presets",
      description:
        "Safe, Balanced and Aggressive presets tune precision and every strip toggle for you, go from paste to the smallest sensible output in a single click, then fine-tune only if you want to.",
    },
    {
      icon: "AlignJustify",
      title: "True single-line output",
      description:
        "The result is collapsed to one clean line with no indentation, comments or line breaks: exactly the shape you want for inlining into HTML, JSX, a data-URI or a JSON string.",
    },
    {
      icon: "Gauge",
      title: "Big before → after readout",
      description:
        "The exact input and output bytes, a percentage-saved figure and a visual savings bar are front and centre, so the compression win is obvious the moment you paste.",
    },
    {
      icon: "Archive",
      title: "Gzipped transfer estimate",
      description:
        "Beyond raw bytes, the minifier estimates the gzipped size, the number your server actually sends over the wire, so you're optimizing for real-world payload, not just file size on disk.",
    },
    {
      icon: "Eye",
      title: "Live checkerboard preview",
      description:
        "The minified SVG renders live on a transparency checkerboard beside the code, so you can confirm the artwork is pixel-identical before you copy, the check a paste-and-pray minifier skips.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Minification runs entirely on your device. SVGs are never uploaded, stored or logged, and a dependency-free fallback keeps it working even if the engine chunk fails to load.",
    },
  ],

  benefits: [
    {
      title: "Smaller bundles and inline markup",
      description:
        "Minified icons and logos routinely drop 30–70% versus their exported source. Multiply that across an icon set or a logo inlined on every page and it's measurable bytes off your HTML and your bundle.",
    },
    {
      title: "Perfect for data-URIs and inline SVG",
      description:
        "A single-line, whitespace-free string is exactly what a CSS background-image data-URI or an inlined <svg> in JSX wants. No escaping surprises, no stray newlines bloating the payload.",
    },
    {
      title: "Confirm nothing broke",
      description:
        "The live preview shows the minified result beside the source, so you catch the rare case where an aggressive precision setting clips a curve or a gradient before it ever ships.",
    },
    {
      title: "No install, no upload, no config file",
      description:
        "Get build-tool-grade minification without wiring up an svgo.config.js or a bundler plugin, and without sending confidential brand assets to someone else's server.",
    },
  ],

  howTo: [
    {
      title: "Paste or drop your SVG",
      description:
        "Paste markup into the editor, drop a .svg file anywhere on the workspace, or load a sample. The minified result and size readout appear immediately.",
    },
    {
      title: "Pick a preset",
      description:
        "Choose Safe, Balanced or Aggressive. Safe preserves IDs and title/desc. Aggressive squeezes the last few percent. Each preset sets precision and the strip toggles for you.",
    },
    {
      title: "Fine-tune if needed",
      description:
        "Open the advanced controls to nudge coordinate precision or flip an individual toggle (keep viewBox, remove width/height, remove IDs, remove title/desc) and watch it re-minify live.",
    },
    {
      title: "Check the preview & bar",
      description:
        "Glance at the checkerboard preview to confirm the graphic is unchanged and read the before → after bytes, percentage saved and gzip estimate.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the single-line minified SVG, download it as a .svg, or share a link that reopens the tool with your source pre-loaded.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Inline an SVG into JSX",
      description:
        "Minify a decorative or logo SVG to a single line before pasting it inline in a component, so the markup ships as tight as possible without a build step or an extra request.",
    },
    {
      audience: "CSS author",
      title: "Embed as a data-URI background",
      description:
        "Squeeze a small SVG hard enough to embed it as a background-image data-URI in a stylesheet without bloating the file, the single-line output drops in cleanly.",
    },
    {
      audience: "Design systems engineer",
      title: "Compress an icon set uniformly",
      description:
        "Run every icon through the same preset so your sprite or icon library is consistently minified and as small as possible before it hits the registry.",
    },
    {
      audience: "Email / Marketing",
      title: "Trim an SVG for a payload budget",
      description:
        "Minify a badge or illustration to fit inside a tight HTML email or ad payload budget, using the gzip estimate to confirm the real transfer size.",
    },
  ],

  troubleshooting: [
    {
      problem: "My SVG lost its scaling / renders at the wrong size after minifying.",
      solution:
        "The viewBox was likely removed on the Aggressive preset. Switch to Balanced or open the advanced controls and turn 'Keep viewBox' back on: the viewBox is what lets an SVG scale to its container. For fluid sizing, keep the viewBox and enable 'Remove width/height' instead.",
    },
    {
      problem: "An icon in a sprite or referenced by CSS went blank.",
      solution:
        "Aggressive minification strips IDs, and something outside the file still points at one (a <use>, a gradient, a clip-path or a CSS selector). Use the Balanced preset or disable 'Remove IDs'. The minifier can't see references that live outside the SVG.",
    },
    {
      problem: "Curves or gradients look slightly off.",
      solution:
        "Coordinate precision is too aggressive for this artwork. Raise the precision a decimal or two and watch the preview, smooth gradients and tiny icons need more decimals than large flat shapes.",
    },
    {
      problem: "It says the input doesn't contain an <svg> element.",
      solution:
        "The minifier needs raw SVG markup starting with an <svg> tag. If you pasted a base64 blob or a data-URI, decode it back to plain SVG first, or drop the .svg file directly.",
    },
  ],

  tips: [
    "Start with the Balanced preset, it's the everyday sweet spot. Only reach for Aggressive when you've confirmed nothing external references the SVG's IDs.",
    "Precision 1–2 is plenty for large flat shapes. Bump it to 3+ for small icons or smooth gradients so curves stay crisp.",
    "Minify before converting to a data-URI or a React component so the embedded markup starts as small as possible.",
    "Watch the gzip estimate, not just raw bytes, that's the number that actually travels over the wire.",
    "Keep 'Keep viewBox' on and enable 'Remove width/height' when you want the minified SVG to scale fluidly to its container.",
  ],

  security:
    "Your SVG is parsed and minified entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely minify unreleased logos, brand marks and internal icon sets. If the engine chunk can't load, a built-in fallback minifier runs locally too. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded anywhere when I minify it?",
      answer:
        "No. All parsing and minification happen locally in your browser (with a built-in fallback if the engine chunk can't load). Your file never leaves your device, so there is nothing for us to store, log or see, it's safe to minify confidential logos and brand assets.",
    },
    {
      question: "How is this different from the SVG Optimizer?",
      answer:
        "They share the same engine, but the aim differs. The Optimizer is a full workbench of safe, individually toggled cleanups. The Minifier is opinionated and single-purpose: it leads with Safe / Balanced / Aggressive presets, always collapses the output to one compact line, and puts the raw before → after byte win front and centre. If you just want the smallest possible SVG fast, use the Minifier. If you want to tweak each cleanup by hand, use the Optimizer.",
    },
    {
      question: "How much smaller will my SVG get?",
      answer:
        "It depends on the source, but design-tool exports and hand-authored SVG commonly shrink 30–70% because they carry so many comments, editor namespaces, whitespace and over-precise coordinates. The before → after bar shows the exact bytes saved and an estimated gzipped size for the file you paste.",
    },
    {
      question: "Does minifying change how my SVG looks?",
      answer:
        "The Safe and Balanced presets are effectively lossless, the artwork renders identically. The one setting that can visibly change things is coordinate precision on the Aggressive preset: rounding too hard can subtly shift curves or gradients. That's exactly why the tool shows a live preview, so you can confirm before you copy.",
    },
    {
      question: "Will the output be on a single line?",
      answer:
        "Yes. Minified output is collapsed to one clean line with no comments, indentation or line breaks, the ideal shape for inlining into HTML, JSX, a CSS data-URI or a JSON string. If you'd rather have readable, indented markup, use the SVG Formatter instead.",
    },
    {
      question: "Why did an icon break when I used the Aggressive preset?",
      answer:
        "Aggressive strips IDs and dimensions to save the last few percent. If a <use> tag, gradient, clip-path or CSS/JS selector references one of those IDs from outside the file, that reference breaks. Switch to Balanced, or open the advanced controls and turn 'Remove IDs' off.",
    },
    {
      question: "Can I minify SVGs with gradients, filters or animation?",
      answer:
        "Yes. The engine preserves gradients, filters and SMIL animation, and the preview renders them so you can confirm they survived. If something looks off at high compression, nudge the precision up a decimal and re-check the preview.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There's a generous guard so the browser tab stays responsive. Typical icons, logos and illustrations are well within it. For an enormous single SVG, lower the precision first or minify it in pieces.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, client-side SVG minification with Safe / Balanced / Aggressive presets, single-line output, tunable precision and strip toggles, live checkerboard preview, before → after byte + gzip meter with a savings bar, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-25",
      change:
        "Added a dependency-free fallback minifier so the tool keeps working when the engine chunk can't load, plus keyboard shortcuts and a curated set of sample SVGs.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the gzip estimate, added a visual savings bar and clearer preset guidance to prevent broken sprites when stripping IDs on the Aggressive preset.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-to-data-uri",
    "svg-to-react",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgMinifier;
