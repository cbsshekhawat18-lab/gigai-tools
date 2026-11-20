import type { Tool } from "@/types";

/**
 * SVG to CSS, turns raw SVG markup into a ready-to-paste CSS rule that renders
 * the artwork as a `background-image` or a recolorable `mask`, using a compact,
 * URL-optimized `data:` URI (no base64 bloat, no extra HTTP request). Every
 * string below is unique to the SVG→CSS workflow and written for the exact
 * queries developers type when they want an icon in pure CSS.
 */
const svgToCss: Tool = {
  slug: "svg-to-css",
  title: "SVG to CSS",
  category: "svg-tools",
  group: "Convert",
  icon: "Paintbrush",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-21",

  description:
    "Convert SVG to a CSS background-image or mask rule in your browser: a compact URL-encoded data URI with a ready selector snippet, live preview and one-click copy. Nothing is uploaded.",

  h1: "SVG to CSS Background & Mask Converter",
  tagline:
    "Paste any SVG and get a clean CSS rule instantly: a compact URL-encoded data URI as a background-image, or a mask you can recolor with a single background-color. Live preview, one-click copy, 100% in your browser.",
  longDescription:
    "The GigAI SVG to CSS converter turns raw SVG markup into a production-ready CSS rule you can paste straight into a stylesheet. No image file, no extra HTTP request, no build step. It encodes your SVG as a smart URL-optimized data URI (single-quoted attributes plus minimal percent-encoding of only the characters that break inside a CSS url()), which is dramatically smaller and more readable than the usual base64 blob, then wraps it in a ready selector so the artwork drops in as either a background-image or a mask. Background mode gives you a self-contained, crisply scalable image sized with no-repeat center / contain. Mask mode is the developer favorite: the SVG becomes an alpha mask (with the -webkit- prefix for Safari) and the shape takes its color from a single background-color: currentColor line, so one icon inherits your text color and adapts to light and dark themes without a second file. You choose the CSS selector, switch modes live, and see the exact rule render next to a real preview of the artwork. Because encoding runs entirely in your browser with no upload, your logos, unreleased icons and client assets never leave your machine. It's the fast, private path from an SVG export to an inline-in-CSS icon that ships without a single network round-trip.",

  ctaText: "Convert SVG to CSS",

  keywords: [
    "svg to css",
    "svg to css background",
    "svg background image css",
    "svg to data uri css",
    "svg css mask",
    "css mask svg",
    "inline svg css",
    "svg url encode css",
    "svg background-image data uri",
    "css icon from svg",
    "svg to background url",
    "recolor svg with css",
  ],

  seo: {
    title: "SVG to CSS, Background-image & Mask Data URI Converter | GigAI Tools",
    description:
      "Free online SVG to CSS converter. Paste SVG, get a clean background-image or recolorable mask rule with a compact URL-encoded data URI, a ready selector and a live preview: 100% in your browser, no uploads.",
  },

  formats: {
    input: ["SVG"],
    output: ["CSS"],
  },

  features: [
    {
      icon: "Paintbrush",
      title: "background-image or mask",
      description:
        "Emit the SVG as a self-contained background-image, or as a CSS mask that inherits its color from background-color: currentColor. Flip modes and the whole rule regenerates live.",
    },
    {
      icon: "Minimize2",
      title: "Compact URL-encoded data URI",
      description:
        "Instead of a bulky base64 blob, the SVG is single-quoted and only the characters that break inside url() are percent-encoded: a smaller, human-readable payload that gzips well and stays inline.",
    },
    {
      icon: "Palette",
      title: "Recolor with one line",
      description:
        "In mask mode the shape becomes an alpha mask, so background-color (or currentColor) sets its color. One icon covers every theme. No duplicate files for light and dark.",
    },
    {
      icon: "Type",
      title: "Your own selector",
      description:
        "Name the CSS selector the rule attaches to (.icon,.btn::before, [data-icon='menu']) and the snippet is ready to paste with zero find-and-replace afterwards.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the CSS",
      description:
        "A checkerboard preview renders the actual SVG next to the generated rule, with light/dark backgrounds and zoom, so you confirm the artwork before you copy it into your stylesheet.",
    },
    {
      icon: "Wifi",
      title: "Zero extra requests",
      description:
        "The data URI lives inside the CSS, so the icon paints with the stylesheet. No separate image file, no waterfall, no flash of missing icon on first render.",
    },
  ],

  benefits: [
    {
      title: "Icons without an HTTP request",
      description:
        "Small UI marks (arrows, chevrons, spinners, brand glyphs) belong in the CSS, not in a network waterfall. Inlining them removes a request and the flash of a late-loading image.",
    },
    {
      title: "One mask, every theme",
      description:
        "Mask mode plus currentColor means a single rule recolors itself for hover, dark mode, or a disabled state. Set the text color and the icon follows, no second asset required.",
    },
    {
      title: "Smaller than base64",
      description:
        "URL-optimized encoding keeps SVG readable and typically smaller than base64, so your stylesheet stays lean and the payload compresses well over the wire.",
    },
    {
      title: "Private by design",
      description:
        "Encoding happens locally in your browser. Unreleased logos, client artwork and internal icons never leave your machine. Nothing is uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Paste or import your SVG",
      description:
        "Paste SVG markup into the editor, drop a .svg file anywhere on the workspace, or load a built-in example to see the CSS instantly.",
    },
    {
      title: "Pick background or mask",
      description:
        "Choose background-image for a self-contained image, or mask to make the shape recolorable with background-color / currentColor.",
    },
    {
      title: "Set your selector",
      description:
        "Type the CSS selector the rule should target (a class, an element, or a pseudo-element like.btn::before) and the snippet updates live.",
    },
    {
      title: "Copy or download the CSS",
      description:
        "Confirm the artwork in the preview, then copy the rule to your clipboard or download it as a .css file and paste it into your stylesheet.",
    },
  ],

  useCases: [
    {
      audience: "Frontend developer",
      title: "Inline a UI icon in CSS",
      description:
        "Turn a chevron or spinner into a background-image rule so it paints with the stylesheet, one fewer request and no late-loading flash on first render.",
    },
    {
      audience: "Design-system engineer",
      title: "Ship a themeable icon utility",
      description:
        "Emit a mask rule with currentColor so a single .icon class recolors for hover, dark mode and disabled states without a second file per theme.",
    },
    {
      audience: "Email / newsletter builder",
      title: "Embed art without hosting it",
      description:
        "Drop a self-contained data-URI background into a component's CSS so the artwork travels with the markup instead of relying on an external image host.",
    },
    {
      audience: "No-code / CMS user",
      title: "Add a custom background in a theme editor",
      description:
        "Paste the generated background-image value into a page-builder's custom-CSS box to set a decorative shape or pattern with no upload step.",
    },
  ],

  tips: [
    "Use mask mode for monochrome icons you want to recolor: background-color (or currentColor) sets the shape's color, so one rule serves every theme.",
    "Run your SVG through the SVG Optimizer first, fewer nodes and no editor metadata means a shorter data URI and a lighter stylesheet.",
    "Set fill=\"currentColor\" in the source for background mode. For mask mode the fill is ignored and color comes from background-color instead.",
    "Target a pseudo-element like.btn::before as the selector when the icon is decorative. It keeps your HTML clean and the icon out of the accessibility tree.",
    "Keep the SVG small (a UI glyph, not a detailed illustration). Huge artwork makes an unwieldy data URI that bloats the CSS file.",
  ],

  troubleshooting: [
    {
      problem: "The background shows but the icon is the wrong color.",
      solution:
        "background-image renders the SVG's own colors verbatim. CSS color has no effect on it. To recolor, switch to mask mode and set background-color (or currentColor), or edit fill in the SVG source before converting.",
    },
    {
      problem: "The mask works in Chrome but not Safari.",
      solution:
        "The rule already includes both mask and -webkit-mask. If it still fails, make sure the SVG has an explicit viewBox and non-zero size, and that no parent sets overflow or transform that clips the masked box.",
    },
    {
      problem: "The icon looks blurry or cropped.",
      solution:
        "Add a viewBox to the SVG so it scales cleanly, and size the element to the icon's aspect ratio. The rule uses center / contain, so a mismatched box leaves empty space or crops: set width/height on the element to match.",
    },
    {
      problem: "My CSS build tool complains about the url() value.",
      solution:
        "Some pipelines re-encode data URIs. If a tool mangles the single-quoted attributes, wrap the whole value in double quotes (already done here) or switch the SVG's inner quotes, then re-copy the rule.",
    },
  ],

  security:
    "Every conversion runs entirely in your browser. Your SVG is encoded on your device and never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert unreleased logos, client artwork or internal icons. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing and data-URI encoding happen entirely in your browser. Your artwork never leaves your device, so there's nothing for us to store, log or see: it's safe to convert confidential logos or unreleased icons.",
    },
    {
      question: "What's the difference between background and mask mode?",
      answer:
        "Background mode renders the SVG's own colors as a background-image, what you see in the source is what you get. Mask mode turns the shape into an alpha mask and paints it with background-color (or currentColor), so the same icon can be recolored per theme, hover or state with a single line of CSS.",
    },
    {
      question: "Why not use base64 encoding?",
      answer:
        "Base64 inflates SVG by roughly a third and is unreadable. This converter uses a URL-optimized encoding (single-quoted attributes with only the characters that break inside url() percent-encoded) which is smaller, stays human-readable, and compresses well. For SVG, it's the recommended approach for CSS data URIs.",
    },
    {
      question: "How do I recolor the icon with CSS?",
      answer:
        "Use mask mode. The generated rule sets background-color: currentColor, so the icon adopts the element's text color. Change color on hover, in dark mode or on a disabled state and the icon follows. No second file. Background mode can't be recolored with CSS. Edit the SVG's fill instead.",
    },
    {
      question: "Can I use my own selector or a pseudo-element?",
      answer:
        "Yes. Type any selector (a class like.icon, an attribute selector, or a pseudo-element such as.btn::before) and the rule attaches to exactly that. Decorative icons work well on::before or::after so they stay out of your HTML and the accessibility tree.",
    },
    {
      question: "Does the data URI add an extra network request?",
      answer:
        "No. The encoded SVG lives inside the CSS rule, so it paints together with the stylesheet, there's no separate image file to fetch and no flash of a missing icon on first render. That's the main reason to inline small UI glyphs this way.",
    },
    {
      question: "What size should the SVG be?",
      answer:
        "Keep it to a compact UI glyph. Data URIs are ideal for small marks: icons, chevrons, spinners, simple logos. A large, detailed illustration produces a very long URI that bloats the stylesheet. Host those as a normal file instead.",
    },
    {
      question: "The mask doesn't show in Safari: what's wrong?",
      answer:
        "The rule already includes the -webkit-mask prefix Safari needs. Double-check that the SVG has an explicit viewBox and the element has a non-zero width and height, and that no ancestor clips it with overflow or transform.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, live SVG→CSS conversion with background-image and mask modes, a compact URL-optimized data URI, a custom selector, live preview, and copy/download.",
    },
    {
      date: "2026-06-27",
      change:
        "Added undo/redo history, keyboard shortcuts, curated examples, and a shareable-link option that reopens the tool with your SVG pre-loaded.",
    },
    {
      date: "2026-07-02",
      change:
        "Added a payload size readout comparing the URL-optimized data URI against base64, and clearer guidance for recoloring in mask mode.",
    },
  ],

  relatedTools: [
    "svg-to-react",
    "svg-optimizer",
    "svg-minifier",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgToCss;
