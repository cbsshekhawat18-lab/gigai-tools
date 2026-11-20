import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "png-vs-webp",
  a: "PNG",
  b: "WebP",
  title: "PNG vs WebP: A Smaller Format for Graphics and Transparency?",
  description:
    "Lossless WebP matches PNG's crispness and transparency while producing noticeably smaller files. Here's where WebP wins, where PNG still earns its place, and how to choose.",
  accent: "violet",
  icon: "Image",
  seo: {
    title: "PNG vs WebP: Transparency, File Size & Support (2026 Guide)",
    description:
      "PNG vs WebP for graphics and logos: how lossless WebP stays crisp at smaller sizes, whether it keeps transparency, 2026 browser support, and when to keep PNG.",
    keywords: [
      "png vs webp",
      "webp vs png",
      "webp vs png transparency",
      "is webp better than png",
      "lossless webp",
      "webp for logos",
    ],
    canonical: "/compare/png-vs-webp",
  },
  intro: [
    "PNG is the go-to format for anything that must stay pixel-perfect: logos, icons, screenshots, UI assets and any graphic with a transparent background. It's lossless, so nothing is ever discarded, but that fidelity makes PNG files heavy, and on graphics-rich pages those bytes add up. WebP was built to fix exactly that. Its lossless mode matches PNG's perfect fidelity and full alpha transparency, while typically producing files around 20–30% smaller.",
    "That means the two formats compete head-to-head on the same ground: crisp, transparent, non-photographic images. Unlike the JPEG comparison (where WebP trades a little compatibility for smaller photos) here WebP offers the same visual result as PNG with no quality loss and a smaller footprint. The only real cost is reach: PNG opens in absolutely everything, whereas WebP, though universally supported in modern browsers, still isn't accepted everywhere PNG is.",
    "Below is a like-for-like breakdown of lossless WebP against PNG, the situations where each is the smarter pick, and a straight verdict for graphics and transparent assets.",
  ],
  dimensions: [
    {
      label: "Compression",
      a: "Lossless, pixel-perfect, but large files.",
      b: "Lossless or lossy, lossless matches PNG at ~20–30% smaller.",
    },
    {
      label: "Transparency",
      a: "Full 8-bit alpha transparency.",
      b: "Full alpha transparency, in both lossless and lossy modes.",
    },
    {
      label: "File size (graphics)",
      a: "Heavier: noticeable on icon- and screenshot-heavy pages.",
      b: "Smaller at identical quality. Bigger savings on complex graphics.",
    },
    {
      label: "Sharp edges / text",
      a: "Perfectly crisp, the reference for screenshots and line art.",
      b: "Perfectly crisp in lossless mode. Equal to PNG.",
    },
    {
      label: "Browser support",
      a: "Universal, everywhere, forever.",
      b: "All modern browsers. Weaker in old software and some apps.",
    },
    {
      label: "Tooling / export",
      a: "Every editor and OS exports and previews it natively.",
      b: "Widely supported now, but not yet as ubiquitous as PNG.",
    },
    {
      label: "Best for",
      a: "Universal graphics hand-off, print, anything needing max reach.",
      b: "Web graphics and logos where smaller, crisp files matter.",
    },
  ],
  whenA: [
    "The graphic must open anywhere, email, older tools, print workflows, any device.",
    "You're delivering source assets to a client or team that expects PNG.",
    "You need a universally-editable master that any application can re-open cleanly.",
    "The image is a favicon, app icon or OS asset where PNG is the expected container.",
  ],
  whenB: [
    "You're serving logos, icons or screenshots on the web and want smaller files.",
    "You need transparency but PNG's file size is hurting your page speed.",
    "You control delivery and can fall back to PNG for the rare old client.",
    "You're optimizing a graphics-heavy interface where every kilobyte compounds.",
  ],
  verdict:
    "For transparent graphics served on the web, lossless WebP is the better default. It looks identical to PNG with no quality loss but ships smaller, which speeds up your pages. Keep PNG where universal reach matters: icons the OS expects, files you email or print, and masters handed to tools you don't control. As with photos, serving WebP with a PNG fallback gives you the savings without losing anyone.",
  relatedToolSlugs: ["webp-converter", "image-compressor", "jpg-to-png", "svg-to-png"],
  faq: [
    {
      question: "Does WebP support transparency like PNG?",
      answer:
        "Yes. WebP supports full alpha transparency in both its lossless and lossy modes, so it can replace PNG for logos, icons and any graphic that needs a transparent background, usually at a smaller file size.",
    },
    {
      question: "Is lossless WebP really the same quality as PNG?",
      answer:
        "Visually, yes: lossless WebP preserves every pixel exactly like PNG, so screenshots, text and sharp edges stay perfectly crisp. The difference is only in the file size: the WebP is typically 20–30% smaller for the same pixel-perfect result.",
    },
    {
      question: "When should I still use PNG instead of WebP?",
      answer:
        "Use PNG when the image must be openable everywhere without a fallback: app and favicon assets the OS expects, files you email or send to print, and source masters handed to software that may not read WebP. PNG's guaranteed universal support is its remaining edge.",
    },
    {
      question: "How much smaller is WebP than PNG?",
      answer:
        "For lossless graphics, WebP is usually around 20–30% smaller than the equivalent PNG, with larger savings on complex images and smaller savings on very simple flat graphics. If you allow lossy WebP for images that don't need perfect edges, the reduction can be far greater.",
    },
    {
      question: "Can I convert PNG to WebP without losing transparency?",
      answer:
        "Yes. Converting PNG to lossless WebP keeps the alpha channel intact and preserves the image exactly, just in a smaller file. Only choose lossy WebP if a slight, usually invisible change to non-edge areas is acceptable in exchange for an even smaller size.",
    },
  ],
  relatedComparisonSlugs: ["jpeg-vs-webp", "svg-vs-png"],
};

export default comparison;
