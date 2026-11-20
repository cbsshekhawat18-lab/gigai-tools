import type { Tool } from "@/types";

/**
 * SVG to PNG, the raster bridge of the SVG suite. It renders vector SVG markup
 * to a crisp, pixel-perfect PNG at any resolution you choose: a scale multiplier
 * (1×–8×) or exact width/height, with a transparent or solid background, encoded
 * entirely in the browser via an offscreen canvas. Every string below is written
 * uniquely for the SVG→PNG workflow and targets the exact queries people type
 * when a vector file won't drop into a slide, an email, a favicon or an app.
 */
const svgToPng: Tool = {
  slug: "svg-to-png",
  title: "SVG to PNG",
  category: "svg-tools",
  group: "Convert",
  icon: "Image",
  accent: "orange",
  status: "live",
  createdAt: "2026-06-20",

  description:
    "Convert SVG to PNG in your browser at any resolution. Pick a 1×–8× scale or exact pixel size, keep transparency or set a background color, preview live and download. Nothing is uploaded.",

  h1: "SVG to PNG Converter, Export Vector to High-Resolution PNG",
  tagline:
    "Paste or drop an SVG and rasterize it to a razor-sharp PNG at any size: 2× and 4× retina exports, exact width/height, transparent or solid background, live preview and one-click download. 100% in your browser.",
  longDescription:
    "The GigAI SVG to PNG converter turns resolution-independent vector markup into a fixed-pixel PNG bitmap you can drop anywhere a raster image is required, a Keynote or PowerPoint slide, a marketplace listing, an email signature, a README on GitHub, an app icon set, or a design tool that refuses SVG. It reads the SVG's intrinsic size from its width/height attributes or its viewBox, then lets you export at a whole-number scale (1× through 8× for crisp retina and print-grade output) or at an exact target width and height you type in. Because SVG has an alpha channel and PNG does too, transparency is preserved by default, but you can drop in a solid background color in one click when you need an opaque image for JPEG-style contexts or a colored tile. The whole pipeline runs on your device: the SVG is drawn to an offscreen HTML canvas at your chosen dimensions and encoded with the browser's native PNG encoder, so your artwork (brand marks, unreleased icons, client illustrations) is never uploaded, stored or logged. A live checkerboard preview shows the vector before you commit, an estimated output-pixel readout tells you exactly how big the PNG will be, and download gives you a ready-to-use.png named after your file. It's the fast, private, no-signup path from a scalable vector to the exact bitmap a platform demands.",

  ctaText: "Convert SVG to PNG",

  keywords: [
    "svg to png",
    "convert svg to png",
    "svg to png converter",
    "svg to png online",
    "rasterize svg",
    "svg to png high resolution",
    "svg to png transparent",
    "svg to png 2x",
    "export svg as png",
    "svg to bitmap",
    "svg to png free",
    "vector to png",
  ],

  seo: {
    title: "SVG to PNG, Convert SVG to High-Res Transparent PNG Online | GigAI Tools",
    description:
      "Free online SVG to PNG converter. Paste or drop an SVG, choose a 1×–8× scale or exact pixel size, keep transparency or add a background, preview live and download, 100% in your browser, no uploads.",
  },

  formats: {
    input: ["SVG"],
    output: ["PNG"],
  },

  features: [
    {
      icon: "Maximize2",
      title: "Any resolution, 1×–8×",
      description:
        "Export at a whole-number scale multiplier for crisp retina and print output, or type an exact width and height. A live readout shows the final PNG's pixel dimensions before you download.",
    },
    {
      icon: "Grid2x2",
      title: "Transparency preserved",
      description:
        "PNG keeps the SVG's alpha channel, so transparent regions stay transparent, perfect for logos and icons that sit on any background. Toggle a solid color when you need an opaque image instead.",
    },
    {
      icon: "Ruler",
      title: "Scale or exact pixels",
      description:
        "Choose between a proportional scale that respects the SVG's aspect ratio or a locked width/height for pixel-exact assets, favicons, app-icon slots, social thumbnails and store artwork.",
    },
    {
      icon: "Eye",
      title: "Live preview before export",
      description:
        "A checkerboard preview renders the actual vector with light/dark backgrounds and zoom, so you catch a clipped viewBox or a thin stroke before it becomes a fixed-pixel bitmap.",
    },
    {
      icon: "Palette",
      title: "Background color on demand",
      description:
        "Fill the canvas with any hex color in one click for slides, tiles or contexts that expect an opaque image, or leave it off to keep a clean transparent PNG.",
    },
    {
      icon: "ShieldCheck",
      title: "Encoded in your browser",
      description:
        "The SVG is drawn to an offscreen canvas and encoded with the browser's native PNG encoder. Nothing is uploaded: your artwork never leaves the machine you're on.",
    },
  ],

  benefits: [
    {
      title: "Get a raster where SVG isn't allowed",
      description:
        "Slides, email signatures, marketplaces, README badges and many design tools reject SVG. This gives you a ready-to-paste PNG at the exact size the platform expects, in seconds.",
    },
    {
      title: "Crisp on retina and in print",
      description:
        "Exporting at 2×, 3× or 4× produces a bitmap dense enough to stay sharp on high-DPI screens and at print resolution, without hand-editing dimensions in an image editor.",
    },
    {
      title: "Keep or drop transparency at will",
      description:
        "One toggle covers both worlds: a clean transparent PNG for overlays and logos, or a solid-background image when you need an opaque tile. No separate tool required.",
    },
    {
      title: "Private and instant",
      description:
        "Conversion happens locally with no upload, no queue and no signup. Confidential brand marks and unreleased artwork are rasterized on your device and gone when you close the tab.",
    },
  ],

  howTo: [
    {
      title: "Paste or drop your SVG",
      description:
        "Paste SVG markup into the editor, drop a .svg file onto the workspace, or load a built-in example to see the pipeline instantly.",
    },
    {
      title: "Choose scale or exact size",
      description:
        "Pick a 1×–8× scale multiplier, or switch to exact mode and type a width and height in pixels. The output-dimension readout updates as you change it.",
    },
    {
      title: "Set the background",
      description:
        "Leave transparency on for a clean PNG, or flip on a background color and pick a hex value for an opaque image.",
    },
    {
      title: "Render and download",
      description:
        "Render the PNG in-browser, check the raster preview, and download the.png, named after your source file and ready to use anywhere.",
    },
  ],

  useCases: [
    {
      audience: "Presentation designer",
      title: "Drop a logo into a slide deck",
      description:
        "Rasterize a vector brand mark to a 2× transparent PNG that pastes cleanly into Keynote, PowerPoint or Google Slides without the blurry-scaling problem.",
    },
    {
      audience: "App developer",
      title: "Generate exact icon sizes",
      description:
        "Export the same SVG at precise pixel dimensions for the icon slots iOS, Android or a web manifest require, keeping every size pixel-perfect from one source.",
    },
    {
      audience: "Marketing / e-commerce",
      title: "Prepare marketplace-ready artwork",
      description:
        "Convert vector graphics to high-resolution PNGs with a solid background for listings, ads and platforms that only accept flat raster images.",
    },
    {
      audience: "Open-source maintainer",
      title: "Add a crisp README badge or diagram",
      description:
        "Turn an SVG diagram into a PNG that renders identically across every Markdown viewer and email client, including those that strip inline SVG.",
    },
  ],

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. The SVG is drawn to an offscreen canvas and encoded to PNG entirely in your browser using its native image engine. Your artwork never leaves your device, there's nothing for us to store, log or see, so it's safe to convert confidential logos and unreleased graphics.",
    },
    {
      question: "How do I export a high-resolution or retina PNG?",
      answer:
        "Use the scale control: 2× doubles every pixel dimension, 4× quadruples it, and so on up to 8×. Higher scales produce sharper results on high-DPI screens and in print. You can also switch to exact mode and type the precise width and height you need.",
    },
    {
      question: "Will transparency be preserved?",
      answer:
        "Yes. PNG supports an alpha channel, so transparent regions of your SVG stay transparent by default. If you need an opaque image instead, turn on the background option and pick a color: the canvas is filled before the SVG is drawn.",
    },
    {
      question: "What size will the PNG be?",
      answer:
        "The converter reads the SVG's intrinsic size from its width/height attributes, or from its viewBox if those are absent, and multiplies by your chosen scale, or uses the exact width/height you enter. The live readout shows the final pixel dimensions before you download.",
    },
    {
      question: "Why does my PNG look blurry or pixelated?",
      answer:
        "A PNG is a fixed grid of pixels, so it can't scale up like a vector. Export at a higher scale (2×–8×) or a larger exact size so the bitmap has enough pixels for where you'll display it. If the SVG has no width/height or viewBox, it defaults to 512×512: add a viewBox to control the aspect ratio.",
    },
    {
      question: "My SVG uses an external font or image: will it appear?",
      answer:
        "External resources loaded by URL (web fonts, remote <image> hrefs) often can't be fetched inside the canvas sandbox and may render as fallback or blank. Convert text to paths and embed images as data URIs in the SVG before converting for a faithful result.",
    },
    {
      question: "Can I convert the PNG back to SVG later?",
      answer:
        "You can trace a raster back to vector with our PNG to SVG tool, but tracing is a color-quantizing approximation, great for flat logos, lossy on photos. Keep the original SVG as your source of truth. Rasterizing is a one-way step for delivery.",
    },
    {
      question: "Is there a size limit or watermark?",
      answer:
        "There's no watermark and no signup. The practical limit is your browser's canvas memory: very large exact sizes at high scales (tens of thousands of pixels per side) can exhaust memory and fail to encode. Drop the scale or size and try again if that happens.",
    },
  ],

  tips: [
    "Export at 2× for standard retina screens and 3×–4× for print or large displays, the file grows, but the edges stay razor-sharp.",
    "Keep the background off for logos and icons you'll place on varied surfaces. Turn it on only when a platform needs an opaque image.",
    "Run your SVG through the SVG Optimizer first: a clean, well-formed root rasterizes more reliably and predictably.",
    "Need a specific slot size (favicon 512×512, social 1200×630)? Switch to exact mode and type the numbers instead of guessing a scale.",
    "Convert text to outlines in your design tool before exporting the SVG so fonts render identically regardless of the viewer's system fonts.",
  ],

  troubleshooting: [
    {
      problem: "The PNG comes out blank or transparent when I expected content.",
      solution:
        "The input must be a single well-formed <svg>…</svg> root. Strip any XML prolog, doctype or surrounding HTML and ensure every tag is closed. If the SVG references external fonts or remote images by URL, embed them (text→paths, images→data URIs). The canvas sandbox can't fetch external resources.",
    },
    {
      problem: "Transparent areas turned black or white in the PNG.",
      solution:
        "That happens when a background is applied. Turn the background option off to keep a true transparent PNG, or pick the exact color you want filled behind the artwork.",
    },
    {
      problem: "The export fails on very large dimensions.",
      solution:
        "A huge canvas (a big exact size multiplied by a high scale) can exceed the browser's memory limit for encoding. Reduce the scale or the exact width/height and render again, most icons and logos need far fewer pixels than you'd think.",
    },
    {
      problem: "The aspect ratio looks stretched.",
      solution:
        "Exact mode uses the width and height you type verbatim. To preserve proportions, use scale mode, or make sure your typed width and height match the SVG's viewBox ratio.",
    },
  ],

  security:
    "Every conversion runs entirely in your browser: the SVG is drawn to an offscreen canvas and encoded to PNG with the browser's built-in image engine. Nothing is uploaded to any server. Your markup and the resulting bitmap are never stored, logged or transmitted, so you can safely rasterize unreleased logos, client artwork and internal graphics. Close the tab and every trace is gone.",

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: in-browser SVG→PNG rasterization with a 1×–8× scale, exact width/height mode, transparent or solid background, live preview, output-dimension readout, and one-click download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added curated examples, keyboard shortcuts, a shareable link that reopens the tool with your SVG pre-loaded, and clearer errors when the input isn't a single well-formed <svg> root.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved intrinsic-size detection from viewBox, a rendered PNG preview beside the source, and a live file-size estimate for the encoded bitmap.",
    },
  ],

  relatedTools: [
    "eps-to-png",
    "svg-optimizer",
    "svg-to-data-uri",
    "svg-viewer",
    "svg-to-react",
    "image-compressor",
  ],
};

export default svgToPng;
