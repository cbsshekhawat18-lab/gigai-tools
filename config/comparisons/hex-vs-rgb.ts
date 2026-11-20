import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "hex-vs-rgb",
  a: "HEX",
  b: "RGB",
  title: "HEX vs RGB: Which Color Format Should You Use in CSS?",
  description:
    "HEX and RGB describe the exact same colors in different notation. HEX is compact. RGB is readable and supports alpha. Here's when to reach for each.",
  accent: "rose",
  icon: "Palette",
  seo: {
    title: "HEX vs RGB: Which Color Format Should You Use in CSS? (2026)",
    description:
      "HEX vs RGB explained: both encode the same red/green/blue values, but differ in readability, alpha transparency and workflow. When to use each in CSS and design.",
    keywords: [
      "hex vs rgb",
      "rgb vs hex",
      "difference between hex and rgb",
      "hex or rgb css",
      "hex to rgb",
      "rgba vs hex",
    ],
    canonical: "/compare/hex-vs-rgb",
  },
  intro: [
    "HEX and RGB are two ways of writing the very same thing: a color built from red, green and blue channels. A HEX code like #3B82F6 and an RGB value like rgb(59, 130, 246) point to the identical pixel on screen: they're just different notations for the same three numbers. So this isn't a quality or capability comparison in the usual sense. It's a question of which notation fits your workflow, your tooling and whether you need transparency.",
    "HEX packs each 0–255 channel into two hexadecimal digits, giving you a compact six-character string that's easy to copy, paste and drop into a stylesheet. RGB spells the channels out as plain decimal numbers, which is far more human-readable and, critically, extends naturally to RGBA, where a fourth value sets opacity. That alpha channel, plus the ability to plug in variables and do channel math, is where the two formats genuinely diverge.",
    "Below is a side-by-side breakdown, a clear rule for choosing, and an honest verdict: plus color tools to work with either notation.",
  ],
  dimensions: [
    {
      label: "What it encodes",
      a: "Red, green, blue as pairs of hex digits (00–FF each).",
      b: "Red, green, blue as decimal numbers (0–255 each).",
    },
    {
      label: "Example",
      a: "#3B82F6",
      b: "rgb(59, 130, 246)",
    },
    {
      label: "Readability",
      a: "Compact but not human-readable at a glance.",
      b: "Very readable. You can see each channel's value directly.",
    },
    {
      label: "Transparency (alpha)",
      a: "Supported via 8-digit HEX (#RRGGBBAA), but less intuitive.",
      b: "Native and clear with rgba(r, g, b, a): the common choice.",
    },
    {
      label: "Editing individual channels",
      a: "Awkward. You must convert hex digits mentally.",
      b: "Easy: bump a single decimal channel up or down.",
    },
    {
      label: "Copy / paste from design tools",
      a: "The default output of most pickers. Ideal for pasting.",
      b: "Common in code where variables and math are involved.",
    },
    {
      label: "Use with CSS variables / math",
      a: "Harder to compose or interpolate.",
      b: "Plays well with variables and calc-style channel manipulation.",
    },
  ],
  whenA: [
    "You're copying a solid color from a design tool and pasting it straight into CSS.",
    "You want the most compact, standard notation for a color constant.",
    "You don't need transparency and value readability isn't a concern.",
    "You're matching brand colors defined as HEX in a style guide.",
  ],
  whenB: [
    "You need alpha transparency. Rgba() is the clearest way to set opacity.",
    "You're generating or manipulating colors in code and want readable channels.",
    "You're teaching, debugging or reviewing where seeing 0–255 values helps.",
    "You're interpolating colors or driving them from variables and calculations.",
  ],
  verdict:
    "Since HEX and RGB describe identical colors, pick by workflow: use HEX for compact, static solid colors pasted from design tools, and use RGB (really RGBA) whenever you need transparency, readable channel values, or programmatic color work. Most codebases mix both (HEX for the palette, RGBA for overlays and shadows) and that's perfectly fine.",
  relatedToolSlugs: ["svg-color-editor", "svg-gradient-generator", "css-beautifier"],
  faq: [
    {
      question: "Is there any color HEX can show that RGB can't?",
      answer:
        "No. Standard six-digit HEX and rgb() cover exactly the same range of colors, because both encode the same three 0–255 channels. Eight-digit HEX and rgba() likewise both add an alpha channel. Neither notation can display a color the other can't.",
    },
    {
      question: "Which is better for CSS, HEX or RGB?",
      answer:
        "Neither is objectively better. They render identically. HEX is more compact and pastes cleanly from design tools, while RGB (as rgba) is clearer for transparency and easier to read and manipulate. Many stylesheets use HEX for solid brand colors and RGBA wherever they need opacity.",
    },
    {
      question: "How do I convert HEX to RGB?",
      answer:
        "Split the six-digit HEX into three pairs and convert each pair from hexadecimal to decimal. For example #3B82F6 becomes 3B = 59, 82 = 130, F6 = 246, giving rgb(59, 130, 246). A color tool does this instantly in either direction.",
    },
    {
      question: "Does RGB support transparency and HEX doesn't?",
      answer:
        "Both support transparency now. RGB does it with rgba() and a fourth 0–1 value, while HEX adds two extra digits for an alpha channel (#RRGGBBAA). RGBA is usually preferred because setting opacity as a plain decimal is more intuitive than a hex pair.",
    },
    {
      question: "Do browsers render HEX and RGB colors differently?",
      answer:
        "No. Once parsed, both resolve to the same underlying red/green/blue values, so the rendered pixel is identical. Your choice is purely about authoring convenience and readability, not the final appearance.",
    },
  ],
  relatedComparisonSlugs: [],
};

export default comparison;
