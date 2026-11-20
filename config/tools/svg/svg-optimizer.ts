import type { Tool } from "@/types";

/**
 * SVG Optimizer, the flagship of the GigAI SVG suite. It runs SVGO's full
 * plugin set (lazy-loaded browser build, with a dependency-free fallback)
 * entirely in the browser to strip editor cruft, collapse paths, round
 * coordinates and shrink markup, then shows a live before/after byte + gzip
 * meter so the win is visible at a glance. Every string below is written for
 * the exact queries people type when an Illustrator/Figma export balloons a
 * bundle. Nothing is shared with the JSON/dev copy, and no claim outruns what
 * the client-side engine actually does.
 */
const svgOptimizer: Tool = {
  slug: "svg-optimizer",
  title: "SVG Optimizer",
  description:
    "Minify and clean SVG files in your browser with SVGO, strip editor metadata, round coordinates, drop hidden layers and see the exact bytes and percentage saved. Nothing is uploaded.",
  category: "svg-tools",
  group: "Optimize",
  icon: "Minimize2",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "SVG Optimizer, Minify & Clean SVG Online with SVGO",
  tagline:
    "Paste or drop an SVG exported from Figma, Illustrator or Sketch and watch it shrink. Real SVGO optimization with tunable precision, a live before/after size meter, and a checkerboard preview so you can confirm nothing broke: all in your browser, never uploaded.",
  longDescription:
    "The GigAI SVG Optimizer is a desktop-grade cleaner for SVG markup that runs SVGO's full optimization pipeline directly in your browser. Design-tool exports are notoriously bloated: Figma, Illustrator and Sketch bake in editor metadata, invisible layers, redundant groups, absurdly precise coordinates and namespaced junk that can easily triple a file's size. Paste your SVG, drop a.svg file, or import one, and the optimizer strips comments and editor namespaces, collapses redundant transforms and groups, rounds path data to a precision you control, converts styles to attributes and removes hidden elements, then reports the exact bytes before and after, the percentage saved, and an estimated gzipped size so you know what actually ships. A live checkerboard preview renders the optimized result next to the code so you can instantly confirm the visual is identical, which is the one thing raw minifiers never show you. Every knob that matters is exposed without a config file: coordinate precision, whether to keep the viewBox (removing it silently breaks responsive scaling), whether to strip width/height for fluid sizing, multipass, and whether to remove IDs or the title/desc used by assistive tech. When SVGO's chunk can't load, a built-in fallback optimizer keeps the tool working. Because it is 100% client-side, brand assets, unreleased logos and internal icons never leave your machine, close the tab and every trace is gone.",

  ctaText: "Optimize SVG",

  keywords: [
    "svg optimizer",
    "svgo online",
    "optimize svg",
    "clean svg",
    "svg cleaner",
    "svgomg alternative",
    "figma svg export optimize",
    "shrink svg",
  ],

  seo: {
    title: "SVG Optimizer & Minifier, Clean SVG Online with SVGO | GigAI Tools",
    description:
      "Free online SVG optimizer powered by SVGO. Minify SVG, strip editor metadata, round coordinates and see exact bytes + gzip saved with a live preview, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Wand2",
      title: "Real SVGO, in your browser",
      description:
        "Runs SVGO's full preset, collapsing groups, merging paths, converting styles to attributes and dropping editor namespaces, the same engine build tools use, with no upload and no install.",
    },
    {
      icon: "Ruler",
      title: "Tunable coordinate precision",
      description:
        "Slide path/coordinate precision from lossless to aggressive. Fewer decimals means smaller files. The live preview lets you push until you can just start to see it, then back off one step.",
    },
    {
      icon: "Gauge",
      title: "Before / after size meter",
      description:
        "See input bytes, output bytes, percentage saved and an estimated gzipped size the moment you paste, so you know the real shipping weight, not just the raw number.",
    },
    {
      icon: "Eye",
      title: "Live checkerboard preview",
      description:
        "The optimized SVG renders live on a transparency checkerboard beside the code, so you can confirm the artwork is pixel-identical before you copy, the safety net raw minifiers skip.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Safe-by-default toggles",
      description:
        "Keep viewBox on, IDs and title/desc preserved by default so nothing breaks. Opt in to removing dimensions for fluid scaling or stripping IDs when you know nothing references them.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing and optimization happen on your device. Brand marks, unreleased logos and internal icon sets are never uploaded, stored or logged: a fallback optimizer even keeps it working offline.",
    },
  ],

  benefits: [
    {
      title: "Ship lighter icons and logos",
      description:
        "Design-tool exports routinely shrink 40–70%. Multiply that across an icon set or an inline logo on every page and it is real bytes off your bundle and your Largest Contentful Paint.",
    },
    {
      title: "See the visual can't break",
      description:
        "Unlike command-line SVGO, the live preview shows the optimized result next to the source, so you catch the rare case where an aggressive setting clips a gradient or a clip-path before it ships.",
    },
    {
      title: "No config, no install, no upload",
      description:
        "Get SVGO-quality output without wiring up a build plugin or an svgo.config.js, and without sending confidential brand assets to a third-party server.",
    },
    {
      title: "Inline-ready output",
      description:
        "Optimized markup is clean enough to paste straight into JSX, a Vue template or an HTML file, and small enough to drop into a data-URI without bloating your CSS.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste markup into the editor, drop a .svg file anywhere on the workspace, or click Import. A sample loads in one click if you just want to see it work.",
    },
    {
      title: "Tune the options",
      description:
        "Set coordinate precision and choose whether to keep the viewBox, strip width/height, remove IDs, drop title/desc or run multipass. Everything re-optimizes live as you change a knob.",
    },
    {
      title: "Check the preview & meter",
      description:
        "Glance at the checkerboard preview to confirm the artwork is unchanged, and read the before/after byte, percentage-saved and gzip-estimate badges.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the optimized SVG to your clipboard, download it as a .svg, or share a link that reopens the tool with your source pre-loaded.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Trim an inline logo",
      description:
        "Optimize the SVG logo you inline in the header of every page, shaving repeated bytes off HTML that ships on every request and nudging LCP in the right direction.",
    },
    {
      audience: "UI / Icon designer",
      title: "Clean a Figma export",
      description:
        "Strip the metadata, hidden layers and 12-decimal coordinates Figma bakes into an export, and confirm on the checkerboard that the icon still renders exactly as designed.",
    },
    {
      audience: "Design systems engineer",
      title: "Normalize an icon set",
      description:
        "Run every icon through the same precision and toggle settings so your sprite or React icon library is consistent and as small as possible before it hits the registry.",
    },
    {
      audience: "Marketer / Email",
      title: "Fit an SVG into a data-URI",
      description:
        "Minify a decorative SVG hard enough to embed it as an inline background-image data-URI without bloating a stylesheet or a marketing email.",
    },
  ],

  troubleshooting: [
    {
      problem: "My SVG stopped scaling / looks the wrong size after optimizing.",
      solution:
        "You almost certainly removed the viewBox. Turn 'Keep viewBox' back on: the viewBox is what lets an SVG scale to its container. If you want fluid sizing, keep the viewBox and instead enable 'Remove width/height'.",
    },
    {
      problem: "An icon in a sprite or a CSS reference went blank.",
      solution:
        "IDs were probably removed while something still points at them (a <use xlink:href>, a gradient, a clip-path or a CSS selector). Disable 'Remove IDs'. SVGO can't see references that live outside the file.",
    },
    {
      problem: "Curves or gradients look slightly off at high compression.",
      solution:
        "Precision is too aggressive for this artwork. Raise the precision by a decimal place or two and watch the preview. Smooth gradients and small icons need more decimals than large flat shapes.",
    },
    {
      problem: "It says the input doesn't contain an <svg> element.",
      solution:
        "The optimizer needs actual SVG markup starting with an <svg> tag. If you pasted a data-URI or a base64 blob, decode it to raw SVG first, or import the .svg file directly.",
    },
  ],

  tips: [
    "Start at precision 2–3 for icons and only lower it if the preview stays crisp: that's where most of the savings live.",
    "Keep the viewBox on and enable 'Remove width/height' when you want the SVG to scale fluidly to its container.",
    "Leave 'Remove IDs' off for anything used in a sprite, referenced by <use>, or targeted by CSS/JS. SVGO can't see external references.",
    "Optimize before converting to a data-URI or a React component so the embedded/inlined markup starts as small as possible.",
    "Preserve title/desc on meaningful graphics, screen readers use them, and the byte cost is tiny.",
  ],

  security:
    "Your SVG is parsed and optimized entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely optimize unreleased logos, brand marks and internal icon sets. If SVGO's optimizer can't load, a built-in fallback runs locally too. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. All parsing and optimization happen locally in your browser using SVGO's browser build (with a built-in fallback if it can't load). Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to optimize confidential logos and brand assets.",
    },
    {
      question: "How much smaller will my SVG get?",
      answer:
        "It depends on the source, but SVG exports from Figma, Illustrator and Sketch commonly shrink 40–70% because they carry so much editor metadata, hidden layers and over-precise coordinates. The before/after meter shows the exact bytes saved and an estimated gzipped size for the file you paste in.",
    },
    {
      question: "What does 'Keep viewBox' do and should I turn it off?",
      answer:
        "The viewBox defines the SVG's coordinate system and is what lets it scale to its container. Removing it makes an SVG render at a fixed size and breaks responsive scaling, so 'Keep viewBox' is on by default and you should almost always leave it on. To get fluid sizing, keep the viewBox and enable 'Remove width/height' instead.",
    },
    {
      question: "Will optimizing change how my SVG looks?",
      answer:
        "The defaults are lossless: the artwork renders identically. The one setting that can visibly change things is coordinate precision: rounding too aggressively can subtly shift curves or gradients. That is exactly why the tool shows a live preview, so you can push precision until you just start to notice and then back off a step.",
    },
    {
      question: "Is this the same as SVGO / SVGOMG?",
      answer:
        "It uses the same SVGO engine that powers SVGOMG and most build pipelines, run client-side. What it adds is a live checkerboard preview beside the code, a clear before/after byte and gzip meter, safe-by-default toggles, undo/redo and shareable links, so you get SVGO-quality output with a real editor experience.",
    },
    {
      question: "Why did removing IDs break my icon?",
      answer:
        "IDs are often referenced from outside the element that defines them: by a <use> tag, a gradient or clip-path, or a CSS/JS selector. SVGO can only see the file it's given, so stripping IDs can break those references. Leave 'Remove IDs' off for anything used in a sprite or referenced externally.",
    },
    {
      question: "Can I optimize SVGs with gradients, filters or animation?",
      answer:
        "Yes. The engine preserves gradients, filters and SMIL animation, and the preview renders them so you can confirm they survived. If a heavy filter or gradient looks off at high compression, nudge the precision up a decimal place and re-check the preview.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There's a generous guard so the browser tab stays responsive, and multipass optimization on very large files takes a moment. Typical icons, logos and illustrations are well within it. For an enormous single SVG, optimize it in pieces or lower the precision first.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, client-side SVGO optimization with tunable precision, keep-viewBox / remove-dimensions / remove-IDs / remove-title toggles, multipass, live checkerboard preview, before/after byte + gzip meter, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-21",
      change:
        "Added a dependency-free fallback optimizer so the tool keeps working when SVGO's chunk can't load, plus keyboard shortcuts and a curated set of sample SVGs.",
    },
    {
      date: "2026-06-28",
      change:
        "Refined the gzip-size estimate and added clearer guidance around viewBox removal and ID stripping to prevent broken sprites.",
    },
  ],

  relatedTools: [
    "svg-minifier",
    "svg-to-react",
    "svg-to-data-uri",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgOptimizer;
