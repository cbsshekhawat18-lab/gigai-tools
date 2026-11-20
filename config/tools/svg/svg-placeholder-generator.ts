import type { Tool } from "@/types";

/**
 * SVG Placeholder Generator, the "Generate" tool for prototyping imagery. It
 * emits a razor-light labelled placeholder graphic (a colored rectangle with a
 * centred caption, usually its own dimensions) from four inputs: width, height,
 * a custom label and background/foreground colors. Because the output is an
 * SVG rather than a raster, a single ~250-byte file scales to any size, stays
 * crisp on retina screens, and can be dropped straight into markup, a CSS
 * background, or an <img src> as a data URI. Copy is written for the exact
 * queries developers and designers type when a real asset isn't ready yet and
 * they need a clean, on-brand grey box to reserve the layout.
 */
const svgPlaceholderGenerator: Tool = {
  slug: "svg-placeholder-generator",
  title: "SVG Placeholder Generator",
  description:
    "Generate lightweight SVG placeholder images for prototyping: set width, height, a custom label and background/foreground colors, then copy the SVG, grab a data URI, or download SVG/PNG. 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "ImagePlus",
  accent: "sky",
  status: "live",
  createdAt: "2026-06-20",

  h1: "SVG Placeholder Generator: Dummy Images for Prototyping",
  tagline:
    "Type a width, a height and a label, pick two colors, and get a tiny, razor-sharp SVG placeholder that scales forever. Copy the markup, grab a ready-to-paste data URI, or download SVG/PNG, all generated in your browser.",
  longDescription:
    "The GigAI SVG Placeholder Generator makes the clean grey (or on-brand) boxes you drop into a layout while the real imagery is still being shot, cropped or exported. Instead of a heavy JPEG or a third-party placeholder URL that phones home and breaks offline, you get a single SVG: a colored rectangle with a centred caption: by default the image's own dimensions, so the box literally tells you how big it is. Set the width and height in pixels, type any label you like (a ratio, a component name, ‘Hero image’, an emoji), and pick the background and text colors with native pickers. Because the result is a vector, one ~250-byte file stays perfectly crisp at any size and on any pixel density, unlike a raster placeholder that blurs the moment it's scaled. Copy the SVG markup for your JSX or template, or switch to a URL-optimized data URI you can paste straight into an <img src>, a CSS background-image or a Tailwind class with zero extra network requests. Need a real bitmap for a tool that won't take SVG? Export a transparent-free PNG at 2× from the browser canvas. Live preview updates as you type, undo/redo walks back every tweak, one-click presets cover the common ad and social sizes, and nothing (not your labels, not your colors) ever leaves the tab.",

  ctaText: "Generate a placeholder",

  keywords: [
    "svg placeholder generator",
    "placeholder image generator",
    "dummy image generator",
    "placeholder svg",
    "svg dummy image",
    "placeholder image svg",
    "prototype image placeholder",
    "data uri placeholder",
    "placeholder image data uri",
    "custom placeholder image",
    "lightweight placeholder image",
    "offline placeholder generator",
  ],

  seo: {
    title:
      "SVG Placeholder Generator, Lightweight Dummy Images (SVG + Data URI) | GigAI Tools",
    description:
      "Free SVG placeholder generator. Set width, height, a custom label and colors to create a tiny scalable placeholder image, then copy the SVG, grab a data URI, or download SVG/PNG. Runs 100% in your browser. No server, works offline.",
  },

  features: [
    {
      icon: "Ruler",
      title: "Any size, exact pixels",
      description:
        "Set width and height directly in pixels or start from a preset (16:9, square, banner, avatar). The caption defaults to the live dimensions, so the placeholder documents its own size.",
    },
    {
      icon: "Type",
      title: "Custom label, your words",
      description:
        "Replace the default ‘W × H’ with anything, a ratio, a component name, ‘Hero image’, an emoji. Font size auto-scales to the box, or override it to taste.",
    },
    {
      icon: "Palette",
      title: "Background & text colors",
      description:
        "Pick the fill and caption colors with native pickers or type a hex. Match your design tokens so the placeholders read as intentional, not accidental.",
    },
    {
      icon: "Link2",
      title: "One-click data URI",
      description:
        "Toggle to a URL-optimized data URI and paste it straight into an <img src>, a CSS background-image or a Tailwind arbitrary value. No file, no extra request, works offline.",
    },
    {
      icon: "FileImage",
      title: "SVG or PNG export",
      description:
        "Download a scalable .svg that stays crisp forever, or rasterise a .png at 2× on the browser canvas for tools and mockups that won't accept vectors.",
    },
    {
      icon: "Undo2",
      title: "Presets, undo & live preview",
      description:
        "Common ad and social sizes are one click away, a big preview updates as you type, and full undo/redo walks back every dimension, label and color you've tried.",
    },
  ],

  benefits: [
    {
      title: "Reserve the layout in seconds",
      description:
        "Drop a clean, correctly-sized box into your grid so spacing, aspect ratio and reflow are right long before the real image lands. No design app, no stock placeholder service.",
    },
    {
      title: "Bytes, not kilobytes",
      description:
        "A labelled SVG placeholder is roughly a quarter of a kilobyte and scales to any resolution. Swap out a bloated dummy JPEG and your prototype loads instantly.",
    },
    {
      title: "No external placeholder URLs",
      description:
        "Unlike hosted placeholder services, nothing is fetched from a third party. Your data URI is self-contained, so the prototype renders offline, in Storybook, and behind a firewall.",
    },
    {
      title: "On-brand, not off-the-shelf grey",
      description:
        "Set the colors to your palette and the label to real component names so stakeholders see an intentional wireframe instead of a jarring stock box.",
    },
  ],

  howTo: [
    {
      title: "Set the dimensions",
      description:
        "Type a width and height, or pick a preset like 16:9, square or a banner size. The caption updates to match unless you've set a custom label.",
    },
    {
      title: "Add a label & colors",
      description:
        "Leave the default ‘W × H’ or type your own text, then choose background and text colors to match your design. The preview redraws as you go.",
    },
    {
      title: "Choose your output",
      description:
        "Copy the SVG markup for code, switch to a data URI to paste into an <img> or CSS, or download a scalable .svg or a .png at 2×.",
    },
    {
      title: "Iterate freely",
      description:
        "Tweak sizes and labels for each slot in your layout. Undo/redo steps back through everything and Reset returns to defaults.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "PNG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Fill an image slot before assets land",
      description:
        "Paste a data-URI placeholder into an <img> or CSS background so a component renders with the right dimensions in Storybook and dev builds while the real graphic is still in production.",
    },
    {
      audience: "Product designer",
      title: "On-brand wireframe boxes",
      description:
        "Generate correctly-sized boxes in the brand palette, labelled with real component names, so early prototypes and design reviews read as intentional rather than unfinished.",
    },
    {
      audience: "QA & content teams",
      title: "Test responsive layouts",
      description:
        "Swap in placeholders at exact ad, hero and thumbnail sizes to check reflow, cropping and lazy-loading behaviour without waiting on final imagery.",
    },
    {
      audience: "Email & docs",
      title: "Mockup imagery for slides & templates",
      description:
        "Export a PNG placeholder for a deck, an email template or documentation where a labelled box communicates ‘image goes here’ at the right proportions.",
    },
  ],

  troubleshooting: [
    {
      problem: "My label is cut off or overflows the box.",
      solution:
        "The auto font size scales to the shorter side, but long custom labels can still spill on a very narrow placeholder. Lower the font-size override, shorten the text, or make the box wider. The caption is centred and won't wrap.",
    },
    {
      problem: "The data URI doesn't render in my <img> tag.",
      solution:
        "Make sure you copied the whole string including the leading data:image/svg+xml prefix, and that it's wrapped in quotes in the src attribute. If a strict CSP blocks inline SVG, use the downloaded .svg file as a normal src instead.",
    },
    {
      problem: "The PNG looks soft when I scale it up.",
      solution:
        "PNG is raster and only holds the pixels you exported. Increase the width and height before exporting, or use the SVG: it's resolution-independent and stays sharp at any size.",
    },
    {
      problem: "The text color is invisible against the background.",
      solution:
        "Foreground and background are too close in luminance. Pick a darker text color on a light box (or vice-versa) so the caption keeps enough contrast to stay readable.",
    },
  ],

  tips: [
    "Leave the label empty-of-custom-text to let it auto-track the dimensions, the box then always states its own size, which is handy in a busy layout.",
    "Use a data URI for throwaway prototypes and the downloaded .svg file once a placeholder is part of a committed component.",
    "Match the background to a muted brand tone and the text to your body color so placeholders read as intentional wireframe, not raw grey.",
    "Set the label to the real component or slot name (‘Product card’, ‘Avatar’) so reviewers know exactly what each box will become.",
    "Prefer SVG over PNG wherever the target accepts it, it's a fraction of the size and stays crisp on every screen.",
  ],

  security:
    "Every placeholder is generated in your browser, the SVG, the data URI and the PNG rasterisation all run locally on your device. Your dimensions, labels and colors are never uploaded, stored or logged, and no third-party placeholder service is contacted, so the tool works fully offline and closing the tab leaves nothing behind.",

  faq: [
    {
      question: "What is an SVG placeholder image?",
      answer:
        "It's a lightweight dummy graphic, a colored rectangle with a centred caption (usually its own width × height), used to reserve an image slot in a layout before the real asset is ready. As an SVG it's a single scalable file of a few hundred bytes that stays crisp at any size and can be embedded directly in markup or as a data URI, unlike a heavy raster placeholder.",
    },
    {
      question: "Why use an SVG placeholder instead of a hosted placeholder URL?",
      answer:
        "Hosted placeholder services fetch an image from a third-party server on every request, which adds latency, breaks offline and in locked-down environments, and depends on that service staying up. A generated SVG (or its data URI) is self-contained: it renders instantly, works offline, in Storybook and behind a firewall, and never phones home.",
    },
    {
      question: "Can I paste the placeholder straight into an <img> tag?",
      answer:
        "Yes. Switch the output to data URI and paste the string (including the data:image/svg+xml prefix) into the src of an <img>, into a CSS background-image, or into a Tailwind arbitrary value. There's no separate file to host and no extra network request.",
    },
    {
      question: "How do I change the size, label and colors?",
      answer:
        "Type the width and height in pixels (or pick a preset), enter any caption you like in the label field, and choose the background and text colors with the native pickers or by typing a hex value. The preview and the output update live as you change each control.",
    },
    {
      question: "Can I download the placeholder as PNG as well as SVG?",
      answer:
        "Yes. Download a scalable.svg for the web and code, or export a.png at 2× for tools that won't accept vectors, slide decks, email templates, mockups. The PNG is rasterised locally on the browser canvas, so nothing is uploaded.",
    },
    {
      question: "Does the caption text scale with the box?",
      answer:
        "By default the font size is derived from the shorter side of the placeholder, so the label stays proportionate as you resize. You can override the font size if you want it larger or smaller, and the caption is always horizontally and vertically centred.",
    },
    {
      question: "Is anything uploaded to a server?",
      answer:
        "No. The SVG geometry, the data-URI encoding and the PNG rasterisation are all computed in your browser. Your dimensions, labels and colors are never sent anywhere, stored or logged, so the tool is private by design and works offline.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. The placeholders you generate are plain shapes and text with no licence attached: use them freely in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, width/height, custom label and background/foreground colors with a live preview, SVG + data-URI output and SVG/PNG export.",
    },
    {
      date: "2026-06-26",
      change:
        "Added one-click size presets (16:9, square, banner, avatar, story), a font-size override, undo/redo across every change, and keyboard shortcuts.",
    },
  ],

  relatedTools: [
    "svg-blob-generator",
    "svg-pattern-generator",
    "svg-to-data-uri",
    "svg-optimizer",
    "image-compressor",
  ],
};

export default svgPlaceholderGenerator;
