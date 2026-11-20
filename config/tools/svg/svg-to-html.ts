import type { Tool } from "@/types";

/**
 * SVG to HTML, the embed-ready converter of the SVG suite. It takes raw SVG
 * markup and hands you exactly the snippet you paste into a page: a sanitised
 * inline <svg> block that inherits currentColor and scales with CSS, or a
 * self-contained <img> whose src is a URL-optimized data URI. No extra file,
 * no HTTP request. Every string below is written uniquely for the "how do I put
 * an SVG in my HTML" search intent and never claims a capability the browser
 * engine lacks.
 */
const svgToHtml: Tool = {
  slug: "svg-to-html",
  title: "SVG to HTML",
  category: "svg-tools",
  group: "Convert",
  icon: "CodeXml",
  accent: "orange",
  status: "live",
  createdAt: "2026-06-21",

  description:
    "Convert SVG to ready-to-paste HTML in your browser: a clean inline <svg> block, or a self-contained <img> with a data-URI src. Live preview, copy and download, nothing uploaded.",

  h1: "SVG to HTML: Inline SVG & Data-URI <img> Generator",
  tagline:
    "Paste any SVG and get the exact snippet to drop into your page, an inline <svg> that inherits color and scales with CSS, or a single-request <img> data URI. Live preview, one-click copy, 100% in your browser.",
  longDescription:
    "The GigAI SVG to HTML converter turns raw SVG markup into the precise HTML you paste into a template, email-safe page or component, without hand-editing angle brackets or guessing at data-URI encoding. Choose Inline and you get the SVG embedded directly in the document flow, so it inherits currentColor, responds to CSS, animates, and adds zero network requests. Choose Data-URI <img> and the tool encodes the artwork with a URL-optimized, un-base64'd payload (the smaller, CSS-friendly encoding) and wraps it in a proper <img src=\"data:image/svg+xml,…\" alt=\"…\"> tag with your own alt text. One self-contained element that needs no separate.svg file on your server. The chosen snippet renders live in a checkerboard preview beside the source, so you confirm the mark still looks right, then copy it or download a ready.html file. Because parsing and encoding run entirely on your device with the browser's native engine, your artwork (logos, unreleased icons, client marks) is never uploaded, stored or logged. It's the shortest, most private path from an SVG export to a line of HTML that just works.",

  ctaText: "Convert SVG to HTML",

  keywords: [
    "svg to html",
    "inline svg html",
    "embed svg in html",
    "svg to img tag",
    "svg to data uri html",
    "svg img src data uri",
    "how to add svg to html",
    "svg inline vs img",
    "svg html converter",
    "convert svg to html online",
    "self contained svg html",
  ],

  seo: {
    title: "SVG to HTML: Inline SVG or Data-URI <img> Online | GigAI Tools",
    description:
      "Free online SVG to HTML converter. Paste SVG, get a clean inline <svg> block or a self-contained <img> with a data-URI src, with alt text and a live preview: 100% in your browser, no uploads.",
  },

  formats: {
    input: ["SVG"],
    output: ["HTML"],
  },

  features: [
    {
      icon: "Code2",
      title: "Clean inline <svg> output",
      description:
        "Get the SVG ready to sit directly in your markup, so it inherits currentColor, responds to CSS classes, can be animated, and adds zero extra HTTP requests: the way icon systems and design tokens want it.",
    },
    {
      icon: "Image",
      title: "Self-contained data-URI <img>",
      description:
        "Wrap the artwork in an <img src=\"data:image/svg+xml,…\"> that carries its own pixels. No separate file to host or link: one tag drops into any page, CMS field or template that only accepts an image src.",
    },
    {
      icon: "Minimize2",
      title: "URL-optimized encoding",
      description:
        "The data URI uses the smaller, un-base64'd percent-encoding recipe (single-quoted attributes, only the reserved characters escaped) so the string is shorter and stays legible. Not a base64 wall of text.",
    },
    {
      icon: "Type",
      title: "Your own alt text",
      description:
        "Type meaningful alt text and it's safely escaped into the <img> tag, so the data-URI image stays accessible to screen readers and search engines instead of shipping an empty alt.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the code",
      description:
        "A checkerboard preview renders the actual SVG next to the generated HTML, with light/dark backgrounds and zoom, so you catch a clipped viewBox or a missing fill before you paste it into production.",
    },
    {
      icon: "ShieldCheck",
      title: "Sanitised, safe to paste",
      description:
        "The preview strips script, on* handlers and other active content while it renders, so you can inspect untrusted SVG without executing it, and see exactly what will show once it's on your page.",
    },
  ],

  benefits: [
    {
      title: "Pick the right embed in one click",
      description:
        "Inline for themeable, CSS-driven icons. Data-URI <img> when a field only takes an image src or you want a zero-file asset. The tool shows both so you choose with the preview in front of you.",
    },
    {
      title: "Ship one fewer request",
      description:
        "Both outputs live inside the HTML. No extra.svg file to host, cache-bust or 404. Small marks embedded this way render on first paint with nothing to download separately.",
    },
    {
      title: "Paste anywhere",
      description:
        "A self-contained <img> data URI works in a CMS rich-text field, an HTML email builder, a Markdown file or a static template that can't reference external assets, the image travels with the tag.",
    },
    {
      title: "Private by design",
      description:
        "Conversion happens locally in your browser. Unreleased logos, client artwork and internal icons never leave your machine. Nothing is uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Paste or import your SVG",
      description:
        "Paste SVG markup into the editor, drop a .svg file anywhere on the workspace, or load a built-in example to see the output instantly.",
    },
    {
      title: "Choose inline or data-URI <img>",
      description:
        "Switch between an inline <svg> block and a self-contained <img> data URI. For the img mode, type the alt text you want baked into the tag.",
    },
    {
      title: "Check the live preview",
      description:
        "Confirm the mark still renders correctly in the preview pane, switch backgrounds or zoom to inspect a thin stroke, a transparent fill or a cropped viewBox.",
    },
    {
      title: "Copy or download the HTML",
      description:
        "Copy the snippet to your clipboard or download it as a ready .html file, then paste it into your page, component or CMS.",
    },
  ],

  useCases: [
    {
      audience: "Frontend developer",
      title: "Drop a logo into a template",
      description:
        "Turn a designer's SVG export into an inline block that inherits your text color and scales with CSS: pasted straight into a header or footer partial with no build step.",
    },
    {
      audience: "Email / newsletter builder",
      title: "Embed a mark with no hosting",
      description:
        "Generate a data-URI <img> so a small icon or badge travels inside the HTML itself, with alt text intact, instead of relying on an external image URL that a client might block.",
    },
    {
      audience: "CMS / content editor",
      title: "Paste SVG where only images are allowed",
      description:
        "Convert the artwork to a self-contained <img> tag that a rich-text field accepts as an image src. No file upload, no broken link, no separate asset to manage.",
    },
    {
      audience: "Docs / Markdown author",
      title: "Inline an icon in a README or page",
      description:
        "Produce a single <img> data URI that renders in Markdown and static-site output without committing a separate .svg file next to the document.",
    },
  ],

  tips: [
    "Run your SVG through the SVG Optimizer first. A smaller source means a dramatically shorter data URI, since the whole image lives in the string.",
    "Prefer inline when you want the mark to inherit color: set fill=\"currentColor\" in the source and it adopts the surrounding text color automatically.",
    "Reach for the data-URI <img> when a field only accepts an image src, or when you need one self-contained tag with no external file to host.",
    "Always fill in alt text for the <img> mode. It keeps the embedded image accessible and is a quick SEO win over an empty alt.",
    "Very large or photo-like SVGs make huge data URIs. For those, host the file and use a normal <img src=\"file.svg\"> instead of embedding.",
  ],

  troubleshooting: [
    {
      problem: "The <img> data URI renders blank or broken.",
      solution:
        "The source must be a single well-formed <svg>…</svg> root with a viewBox (and ideally explicit width/height). Strip any XML prolog or doctype, close every tag, and make sure the SVG isn't relying on an external stylesheet. A data-URI image can't reach outside itself.",
    },
    {
      problem: "The inline SVG shows the wrong color on my page.",
      solution:
        "A hard-coded fill or stroke wins over CSS. Set fill=\"currentColor\" (and/or stroke=\"currentColor\") in the source so the inline mark inherits the surrounding text color, then re-convert.",
    },
    {
      problem: "The data URI is enormous.",
      solution:
        "The entire image is encoded into the string, so a heavy SVG makes a heavy URI. Optimize the SVG first, or, for large or photographic artwork, host it as a file and reference it with a normal <img src> instead of embedding.",
    },
    {
      problem: "IDs in my defs/gradients clash after I paste several inline SVGs.",
      solution:
        "Multiple inline SVGs sharing the same gradient or clipPath id can collide on one page. Give each SVG unique ids before converting, or use the data-URI <img> mode, which isolates the markup inside the image.",
    },
  ],

  security:
    "Every conversion runs entirely in your browser using its native SVG engine. Your markup is never uploaded to any server. The preview sanitises script and event handlers so you can safely inspect untrusted SVG, and nothing is stored, logged or transmitted. Convert unreleased logos, client artwork or internal icons with confidence. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing, encoding and preview all happen entirely in your browser with its built-in SVG engine. Your artwork never leaves your device, so there's nothing for us to store, log or see: it's safe to convert confidential logos or unreleased icons.",
    },
    {
      question: "Should I use inline <svg> or an <img> data URI?",
      answer:
        "Use inline when you want the mark to inherit currentColor, respond to CSS or animate. It also adds no extra request. Use the data-URI <img> when a field only accepts an image src, when you want a single self-contained tag with no external file, or when you're pasting into a CMS or email. The tool generates both so you can compare in the live preview.",
    },
    {
      question: "Why is the data URI URL-encoded instead of base64?",
      answer:
        "URL-optimized percent-encoding (single-quoted attributes, only reserved characters escaped) produces a noticeably shorter, still-readable string than base64 for typical SVGs, the well-known recipe for embedding SVGs in data URIs. It works directly in an <img> src and in CSS url().",
    },
    {
      question: "How do I make an inline SVG match my text color?",
      answer:
        "Set fill=\"currentColor\" (and/or stroke=\"currentColor\") in the SVG source before converting. The inline block then adopts the CSS color of its surroundings, so the same icon adapts to light and dark themes without editing the HTML.",
    },
    {
      question: "Can I add alt text to the <img> output?",
      answer:
        "Yes. Type your alt text and it's safely escaped into the generated <img> tag, keeping the embedded image accessible to screen readers and meaningful to search engines. Leave it blank only for purely decorative marks.",
    },
    {
      question: "Does the data-URI <img> work in HTML email?",
      answer:
        "Many modern clients render SVG data URIs, but support is inconsistent across email software, some strip SVG entirely. Test in your target clients. When broad reach matters, a rasterised PNG fallback is safer than embedded SVG.",
    },
    {
      question: "Why does my SVG look blank as an <img>?",
      answer:
        "As a data URI the image is fully isolated: it can't reach an external CSS file, font or script. Make sure the SVG has a viewBox, self-contained styling, and a single well-formed <svg> root. Removing any XML prolog or doctype and closing all tags usually fixes it.",
    },
    {
      question: "Is inline SVG bad for performance?",
      answer:
        "For small, reused marks inline SVG is often faster. It renders on first paint with no extra request. For large artwork it bloats the HTML and can't be cached separately, so past a certain size a hosted file with a normal <img src> is the better trade-off.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, live SVG→HTML conversion with inline <svg> and self-contained data-URI <img> modes, custom alt text, a sanitised live preview, and copy/download to a.html file.",
    },
    {
      date: "2026-06-26",
      change:
        "Added undo/redo history, keyboard shortcuts, curated examples, and a shareable-link option that reopens the tool with your SVG pre-loaded.",
    },
    {
      date: "2026-06-30",
      change:
        "Switched the data URI to the shorter URL-optimized encoding and added byte-size stats so you can see the embedded weight before you paste.",
    },
  ],

  relatedTools: [
    "svg-to-react",
    "svg-optimizer",
    "svg-viewer",
    "svg-minifier",
    "image-compressor",
  ],
};

export default svgToHtml;
