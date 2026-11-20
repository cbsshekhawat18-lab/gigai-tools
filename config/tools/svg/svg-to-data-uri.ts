import type { Tool } from "@/types";

/**
 * SVG to Data URI: the encoder of the SVG suite. It turns raw SVG markup into
 * a ready-to-paste `data:` URI (URL-optimized or base64) and wraps it in the
 * exact snippet a developer needs: a CSS `background-image`, an inline
 * `<img src>`, or the bare URI itself: with a live size comparison so you can
 * see which encoding is smaller. Every string below is unique to the
 * SVG→data-URI workflow and written for the queries people type when they want
 * to inline an icon or background without a second HTTP request.
 */
const svgToDataUri: Tool = {
  slug: "svg-to-data-uri",
  title: "SVG to Data URI",
  category: "svg-tools",
  group: "Convert",
  icon: "Link",
  accent: "sky",
  status: "live",
  createdAt: "2026-06-21",

  description:
    "Convert SVG to a data: URI in your browser, URL-encoded or base64, and copy it as a CSS background, an inline <img src>, or the raw URI, with a live size comparison. Nothing is uploaded.",

  h1: "SVG to Data URI Converter, URL-Encoded & Base64",
  tagline:
    "Paste an SVG and get a ready-to-paste data: URI, URL-optimized for the smallest CSS payload or base64 for maximum compatibility, as a background-image, an inline <img>, or the bare URI. Live size comparison, one-click copy, 100% in your browser.",
  longDescription:
    "The GigAI SVG to Data URI converter inlines an SVG straight into your stylesheet or markup, so a small icon or background no longer costs a separate network request. It offers both encodings that matter in practice: a URL-optimized form that single-quotes attributes and percent-encodes only the characters that would break inside a CSS url(\"…\") (the smallest, most CSS-friendly payload) and a classic base64 form for cases where a build step, email client, or tooling expects it. An optional cleanup pass strips editor cruft and collapses whitespace before encoding, which is usually the single biggest win on a data URI's size. Whatever you pick, the tool wraps the result in the snippet you actually paste: a CSS rule with background-image: url(…), an HTML <img src=\"…\">, or the raw URI on its own. A live comparison shows the original SVG size, the encoded size, and how the two encodings stack up, so you can choose the smaller one with your eyes instead of guessing. Everything runs on your device with the browser's native SVG parser and encoder, so brand marks, unreleased icons and client artwork are never uploaded, stored or logged. It's the fast, private path from an SVG export to a zero-request inline asset.",

  ctaText: "Convert SVG to Data URI",

  keywords: [
    "svg to data uri",
    "svg to base64",
    "svg data uri",
    "svg url encode",
    "svg data url",
    "svg base64 encoder",
    "svg background image data uri",
    "url-encoded svg",
    "svg to img src",
    "optimize svg data uri",
  ],

  seo: {
    title: "SVG to Data URI: Encode SVG as URL or Base64 Online | GigAI Tools",
    description:
      "Free online SVG to data URI converter. Paste SVG, get a URL-encoded or base64 data: URI as a CSS background, inline <img>, or raw URI, with a live size comparison, 100% in your browser, no uploads.",
  },

  formats: {
    input: ["SVG"],
    output: ["Data URI", "CSS", "HTML"],
  },

  features: [
    {
      icon: "Link",
      title: "URL-encoded and base64 output",
      description:
        "Pick the smallest, CSS-friendly URL-optimized encoding (single-quoted attributes with minimal percent-escaping) or classic base64 when a build step, tool or email client expects it. Swap between them and watch the size change.",
    },
    {
      icon: "Code2",
      title: "CSS, <img> or raw URI snippet",
      description:
        "Copy the exact thing you paste: a background-image: url(…) rule with your own selector, an <img src=\"…\"> tag, or the bare data: URI on its own line. No manual wrapping.",
    },
    {
      icon: "Scale",
      title: "Live size comparison",
      description:
        "See the original SVG size next to the encoded size, plus how URL-encoding and base64 stack up against each other, so you commit the smaller payload instead of guessing.",
    },
    {
      icon: "Wand2",
      title: "Optional cleanup before encoding",
      description:
        "Collapse whitespace and strip editor metadata first, usually the biggest single win on a data URI, so what you inline is as small as it can be without changing how the artwork looks.",
    },
    {
      icon: "Eye",
      title: "Live preview of the encoded asset",
      description:
        "A checkerboard preview renders the SVG exactly as the encoded URI would, with light/dark backgrounds and zoom, so you confirm nothing broke in encoding before you copy.",
    },
    {
      icon: "ShieldCheck",
      title: "Private, in-browser encoding",
      description:
        "Parsing and encoding run entirely on your device. Unreleased logos, client artwork and internal icons never leave the tab. Nothing is uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Kill an HTTP request",
      description:
        "Inlining a small icon or background as a data URI removes a round-trip to the server, so first paint isn't blocked waiting on a tiny file, ideal for above-the-fold and critical CSS.",
    },
    {
      title: "Ship the smaller encoding on purpose",
      description:
        "URL-encoding is almost always smaller than base64 for SVG, but not always. The side-by-side size comparison lets you choose with evidence instead of defaulting to base64 out of habit.",
    },
    {
      title: "Paste-ready for CSS or HTML",
      description:
        "You get the finished snippet (background rule, <img> tag or raw URI) not just an encoded blob, so there's no fiddling with quotes, url() wrapping or charset once it's in your file.",
    },
    {
      title: "Private by design",
      description:
        "Encoding happens locally in your browser, so confidential marks and unreleased assets never leave your machine. Close the tab and every trace is gone.",
    },
  ],

  howTo: [
    {
      title: "Paste or import your SVG",
      description:
        "Paste SVG markup into the editor, drop a .svg file onto the workspace, or load a built-in example to see a data URI immediately.",
    },
    {
      title: "Choose encoding and snippet",
      description:
        "Pick URL-encoded or base64, choose whether to output a CSS background, an <img> tag or the raw URI, and optionally turn on the cleanup pass. Everything regenerates live.",
    },
    {
      title: "Compare the sizes",
      description:
        "Check the size badges to confirm the encoding you chose is the smaller one, and glance at the preview to make sure the artwork still renders correctly.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the finished snippet to your clipboard or download it, then drop it straight into your stylesheet or markup.",
    },
  ],

  useCases: [
    {
      audience: "Frontend developer",
      title: "Inline a CSS background icon",
      description:
        "Turn a small chevron or check into a URL-encoded background-image data URI so the component renders without a separate request: perfect for pseudo-elements and critical CSS.",
    },
    {
      audience: "Email developer",
      title: "Embed an SVG where hosting is awkward",
      description:
        "Encode a mark as base64 to inline it directly in markup, avoiding an external asset URL in contexts where a hosted file is inconvenient or blocked.",
    },
    {
      audience: "Design-system engineer",
      title: "Bundle tiny icons into tokens",
      description:
        "Generate compact data URIs for a handful of core glyphs and store them as CSS custom properties, keeping the smallest icons request-free across the system.",
    },
    {
      audience: "Performance engineer",
      title: "Trim requests above the fold",
      description:
        "Inline the few decorative SVGs a hero section needs so they never block first paint, using the size comparison to keep each payload as lean as possible.",
    },
  ],

  tips: [
    "URL-encoding is usually smaller than base64 for SVG. Start there and only switch to base64 if a tool or email client demands it.",
    "Run the cleanup pass (or the SVG Optimizer first) before encoding. Removing editor metadata and whitespace shrinks the URI far more than the encoding choice does.",
    "Keep data URIs for small assets, inlining a large, complex SVG bloats your CSS and can't be cached separately from the stylesheet.",
    "For CSS, prefer the URL-encoded output: it stays human-diffable in your repo and avoids the ~33% size overhead base64 adds.",
    "Set fill=\"currentColor\" before encoding a monochrome icon so the inlined asset still inherits text color when used as an <img> or mask.",
  ],

  troubleshooting: [
    {
      problem: "My CSS background shows nothing after pasting the URI.",
      solution:
        "Wrap the URL-encoded URI in url(\"…\") with double quotes, the encoding single-quotes the SVG's own attributes precisely so the outer double quotes stay intact. Also confirm the rule has a size (background-size or explicit width/height) so the image has room to render.",
    },
    {
      problem: "The base64 URI is larger than I expected.",
      solution:
        "Base64 adds roughly a third to the byte count by design. For SVG, switch to the URL-encoded output and run the cleanup pass first: the size comparison will show the smaller of the two so you can pick it directly.",
    },
    {
      problem: "The converter won't encode my input.",
      solution:
        "The input must contain a single well-formed <svg>…</svg> root. Strip any XML prolog, doctype or surrounding HTML and make sure every tag is closed. Running the markup through the SVG Validator first will point out the malformed part.",
    },
    {
      problem: "The icon renders black when used as an <img>.",
      solution:
        "An <img> can't inherit CSS color, so a fill=\"currentColor\" icon falls back to black. Hard-code the intended fill in the SVG before encoding, or use the CSS mask output instead of an <img> if you need it to follow text color.",
    },
  ],

  security:
    "Every conversion runs entirely in your browser using its native SVG parser and encoder. Your markup is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely encode unreleased logos, client artwork or internal icons. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing and encoding happen entirely in your browser. Your artwork never leaves your device, so there's nothing for us to store, log or see: it's safe to convert confidential logos or unreleased icons.",
    },
    {
      question: "Should I use URL-encoding or base64?",
      answer:
        "For SVG, URL-encoding is almost always smaller and stays human-readable in your CSS, so it's the better default. Choose base64 when a build tool, framework loader or email client specifically expects a base64 data URI. The live size comparison shows both so you can pick the smaller one for your file.",
    },
    {
      question: "How do I use the data URI in CSS?",
      answer:
        "Use it as an image value, e.g. background-image: url(\"data:image/svg+xml,…\"). Pick the CSS output and the tool wraps the URI in a full rule with your selector, keeping the outer double quotes and the SVG's inner single quotes correct so it just works.",
    },
    {
      question: "Can I use the data URI in an <img> tag?",
      answer:
        "Yes. Choose the <img> output and you get <img src=\"data:image/svg+xml,…\"> ready to paste. Note that an <img> can't inherit CSS color, so encode a concrete fill rather than currentColor for monochrome icons.",
    },
    {
      question: "Does encoding change how my SVG looks?",
      answer:
        "No, encoding only changes how the bytes are represented, not the artwork. The optional cleanup pass removes whitespace and editor metadata, which is visually lossless. The live preview renders exactly what the encoded URI would display so you can confirm before copying.",
    },
    {
      question: "Why is a data URI sometimes worse than a linked file?",
      answer:
        "Data URIs can't be cached separately from the stylesheet or page they live in, and they inflate that file's size. They shine for small, above-the-fold assets where saving a request beats caching. For large or frequently reused SVGs, a linked, cacheable file is usually better.",
    },
    {
      question: "Can I convert a data URI back to SVG?",
      answer:
        "This tool focuses on encoding SVG to a data URI. To go the other way, the SVG suite's viewer and converters accept pasted markup, decode the payload and inspect or reformat it there.",
    },
    {
      question: "Why won't my SVG convert?",
      answer:
        "The input needs to be a single, well-formed <svg> element. Remove any XML prolog, doctype or surrounding HTML and ensure every tag is closed. If it still fails, run the markup through the SVG Validator to find the malformed part.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, live SVG→data URI encoding with URL-optimized and base64 output, CSS / <img> / raw URI snippets, an optional cleanup pass, a live size comparison, and copy/download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added undo/redo history, keyboard shortcuts, curated examples, and a shareable-link option that reopens the tool with your SVG pre-loaded.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer size badges comparing URL-encoded vs base64, and better errors when the input isn't a single well-formed <svg> root.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-to-react",
    "svg-viewer",
    "svg-minifier",
    "image-compressor",
  ],
};

export default svgToDataUri;
