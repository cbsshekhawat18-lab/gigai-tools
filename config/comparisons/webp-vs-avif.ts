import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "webp-vs-avif",
  a: "WebP",
  b: "AVIF",
  title: "WebP vs AVIF: Which Modern Image Format for the Web?",
  description:
    "AVIF compresses smaller than WebP at the same quality, but WebP has wider support. How to do it to pick the right modern format for fast-loading web images.",
  accent: "sky",
  icon: "Image",
  seo: {
    title: "WebP vs AVIF: Which Modern Image Format Wins? (2026)",
    description:
      "WebP vs AVIF explained: file size, quality, browser support and encoding speed, and which next-gen image format to use for a fast website in 2026.",
    keywords: [
      "webp vs avif",
      "avif vs webp",
      "avif or webp",
      "best image format for web",
      "next-gen image format",
      "avif vs webp quality",
    ],
    canonical: "/compare/webp-vs-avif",
  },
  intro: [
    "WebP and AVIF are both modern image formats built to make web pages faster by shrinking images well below what JPG and PNG can manage. The question isn't whether to use one (either beats the old formats) but which to reach for as your primary, and what to fall back to.",
    "AVIF, based on the AV1 video codec, generally wins on pure compression: at the same visual quality it's usually smaller than WebP, and it supports HDR and wide color. WebP is a little older and slightly less efficient, but it's supported in more places, encodes faster, and has years of tooling behind it. Both handle transparency and both are lossy or lossless.",
    "In practice, the modern approach is to serve AVIF where it's supported, fall back to WebP, and keep a JPG/PNG fallback for the oldest browsers. Below is the side-by-side, a clear rule, and the tools to convert and compress either one in your browser.",
  ],
  dimensions: [
    {
      label: "File size",
      a: "Smaller than JPG/PNG. Slightly larger than AVIF.",
      b: "Usually the smallest at the same quality.",
    },
    {
      label: "Image quality",
      a: "Excellent. Great at typical web quality levels.",
      b: "Excellent. Often keeps detail better at low bitrates, plus HDR.",
    },
    {
      label: "Browser support",
      a: "Very broad: supported almost everywhere modern.",
      b: "Broad and growing, but slightly behind WebP.",
    },
    {
      label: "Encoding speed",
      a: "Fast to encode.",
      b: "Slower to encode (heavier compression).",
    },
    {
      label: "Transparency",
      a: "Yes.",
      b: "Yes.",
    },
    {
      label: "Best for",
      a: "A safe, fast default for web images today.",
      b: "Maximum compression when you can add a fallback.",
    },
  ],
  whenA: [
    "You want one modern format that just works almost everywhere.",
    "Encoding speed matters (lots of images, build pipelines).",
    "You'd rather not manage multiple fallbacks.",
    "You're upgrading from JPG/PNG and want an easy, big win.",
  ],
  whenB: [
    "You want the smallest possible files for speed and Core Web Vitals.",
    "You can serve AVIF with a WebP/JPG fallback for older browsers.",
    "Your images benefit from HDR or wide color.",
    "Low-bitrate quality (heavily compressed hero images) matters.",
  ],
  verdict:
    "Use AVIF as your primary when you can add a fallback: it's typically the smallest at the same quality. Use WebP when you want one dependable, fast-encoding format with the widest support and no fallback juggling. The best real-world setup serves AVIF, falls back to WebP, then JPG. Either is a huge upgrade over JPG/PNG for site speed.",
  relatedToolSlugs: ["webp-converter", "image-compressor", "png-to-jpg", "image-resizer"],
  faq: [
    {
      question: "Is AVIF better than WebP?",
      answer:
        "On file size, usually yes, AVIF compresses smaller at the same quality and supports HDR. WebP has slightly wider support and faster encoding. For most sites, AVIF with a WebP fallback is the ideal combination.",
    },
    {
      question: "Should I use AVIF or WebP for my website?",
      answer:
        "Serve AVIF where supported for the smallest files, fall back to WebP, and keep a JPG/PNG fallback for very old browsers. If you want just one format with no fallback effort, WebP is the safe, fast choice.",
    },
    {
      question: "Do WebP and AVIF support transparency?",
      answer:
        "Yes, both support transparency (an alpha channel) as well as lossy and lossless modes, so either can replace both JPG and PNG on the web.",
    },
    {
      question: "Why is AVIF slower?",
      answer:
        "AVIF uses heavier, AV1-based compression to reach smaller files, which takes more processing to encode. The payoff is a smaller download for your visitors. The cost is slower encoding when you create the images.",
    },
  ],
  relatedComparisonSlugs: ["jpeg-vs-webp", "png-vs-webp"],
};

export default comparison;
