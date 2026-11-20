import type { Comparison } from "@/types";

/**
 * PNG vs JPG: the canonical worked example for the comparison content type.
 * Content authors: copy this file's shape exactly (see "=== TEMPLATE ===").
 */
const comparison: Comparison = {
  slug: "png-vs-jpg",
  a: "PNG",
  b: "JPG",
  title: "PNG vs JPG: Which Image Format Should You Use?",
  description:
    "PNG is a lossless format built for sharpness and transparency. JPG is a lossy format built for small photo files. Here's exactly when to pick each.",
  accent: "sky",
  icon: "Image",
  seo: {
    title: "PNG vs JPG: Which Image Format Should You Use? (2026 Guide)",
    description:
      "PNG vs JPG explained simply: transparency, file size, quality and the exact situations where each format wins, plus free converters to switch either way.",
    keywords: [
      "png vs jpg",
      "png or jpg",
      "difference between png and jpg",
      "jpg vs png quality",
      "when to use png",
      "when to use jpg",
    ],
    canonical: "/compare/png-vs-jpg",
  },
  intro: [
    "PNG and JPG are the two most common image formats on the web, and picking the wrong one is the single most common reason images look blurry or weigh far more than they should. The short version: PNG is lossless and supports transparency, so it's ideal for graphics, logos, screenshots and anything with sharp edges or text. JPG is lossy and produces much smaller files for photographs, so it's ideal for photos and rich, detailed images where a tiny quality trade-off is invisible.",
    "The reason they behave so differently comes down to how each one stores pixels. PNG keeps every pixel exactly as it was, which is why a screenshot stays crisp, but that fidelity costs bytes. JPG throws away detail the human eye barely notices to shrink the file dramatically, which is brilliant for a sunset photo and terrible for a screenshot of text, where the discarded detail shows up as fuzzy 'artifacts' around the letters.",
    "Below is a side-by-side breakdown, a clear rule for choosing, and the honest verdict: followed by the free converters to switch either direction in your browser.",
  ],
  dimensions: [
    {
      label: "Compression",
      a: "Lossless, every pixel preserved exactly, no quality loss ever.",
      b: "Lossy, discards fine detail to shrink the file. Quality is adjustable.",
    },
    {
      label: "Transparency",
      a: "Full alpha transparency (transparent backgrounds supported).",
      b: "None. No transparency. Empty areas become white or black.",
    },
    {
      label: "File size",
      a: "Larger, especially for photographs.",
      b: "Much smaller for photos: often 5–10× smaller than PNG.",
    },
    {
      label: "Best for",
      a: "Logos, icons, screenshots, text, line art, flat graphics.",
      b: "Photographs and detailed, colorful, real-world images.",
    },
    {
      label: "Color support",
      a: "Up to 16 million colors plus an 8-bit alpha channel.",
      b: "Up to 16 million colors. No alpha channel.",
    },
    {
      label: "Editing / re-saving",
      a: "Re-save as often as you like. No degradation.",
      b: "Each re-save loses more quality (generation loss).",
    },
    {
      label: "Web performance",
      a: "Heavier: can slow page loads if used for photos.",
      b: "Lightweight: the default for photographic web images.",
    },
  ],
  whenA: [
    "You need a transparent background (logos, badges, product cutouts, UI assets).",
    "The image has sharp edges, text or flat color, screenshots, diagrams, line art.",
    "Quality must be pixel-perfect and survive repeated editing and re-saving.",
    "You're exporting graphics for a design system, app or print where crispness matters.",
  ],
  whenB: [
    "The image is a photograph or a rich, detailed real-world scene.",
    "File size and fast page loads matter more than pixel-perfect edges.",
    "You're uploading many photos (galleries, e-commerce, social) and need them small.",
    "You don't need transparency and a tiny, invisible quality trade-off is fine.",
  ],
  verdict:
    "Use PNG for anything with transparency, text or sharp edges (logos, screenshots and graphics) and use JPG for photographs, where it delivers a near-identical image at a fraction of the size. If a photo doesn't need transparency, JPG is almost always the right call. If in doubt about a graphic, keep it PNG to stay crisp.",
  relatedToolSlugs: ["png-to-jpg", "jpg-to-png", "image-compressor", "webp-converter"],
  faq: [
    {
      question: "Is PNG or JPG better quality?",
      answer:
        "PNG is technically higher quality because it's lossless. No detail is ever discarded. But for photographs the difference is invisible to the eye, so JPG gives you effectively the same quality at a far smaller file size. For screenshots, text and graphics, PNG's quality advantage is very visible.",
    },
    {
      question: "Does converting JPG to PNG improve quality?",
      answer:
        "No. Converting a JPG to PNG cannot recover detail the JPG already discarded. It only stops further loss. The result looks identical to the JPG but with a larger file. Convert JPG to PNG when you need a lossless copy for editing or a format that supports transparency, not to 'upgrade' quality.",
    },
    {
      question: "Which format is smaller, PNG or JPG?",
      answer:
        "For photographs, JPG is dramatically smaller: often five to ten times smaller than the same image as PNG. For flat graphics with few colors (logos, icons), PNG can actually be the smaller of the two.",
    },
    {
      question: "Can PNG have a transparent background?",
      answer:
        "Yes. PNG supports full alpha transparency, which is why it's the standard for logos and any graphic that needs to sit cleanly on top of other content. JPG has no transparency at all: transparent areas become a solid color when you save as JPG.",
    },
    {
      question: "Should I use PNG or JPG for a website?",
      answer:
        "Use JPG for photographs to keep pages fast, and PNG for logos, icons and screenshots that need transparency or crisp edges. For the best of both worlds on modern sites, consider WebP, which compresses better than both while supporting transparency.",
    },
  ],
  relatedComparisonSlugs: [],
};

export default comparison;
