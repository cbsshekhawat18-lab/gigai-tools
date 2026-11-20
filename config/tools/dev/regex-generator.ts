import type { Tool } from "@/types";

/**
 * Regex Generator (from examples): paste strings that should match and it
 * infers a regular expression: a known format, a structural pattern, or a broad
 * fallback, always validated against the examples. Pure client-side heuristic.
 * Honest scope: nails structured strings and common formats; complex/varied
 * inputs get a broad pattern to refine, the UI says so.
 */
const regexGenerator: Tool = {
  slug: "regex-generator",
  title: "Regex Generator",
  description:
    "Paste example strings and get a regular expression that matches them. No regex knowledge needed. Validated against your examples, private, in your browser.",
  category: "developer-tools",
  icon: "Regex",
  accent: "violet",
  status: "live",
  featured: false,
  createdAt: "2026-07-09",

  h1: "Regex Generator, From Examples",
  tagline:
    "Give it a few strings you want to match and it writes the regular expression for you. Then proves it works against your examples. No trial-and-error.",
  longDescription:
    "Writing a regular expression by hand is fiddly and error-prone. The GigAI Regex Generator flips it around: paste a few examples of the strings you want to match (order codes, dates, IDs, emails) and it infers a pattern for you. It first checks whether your examples are a known format (email, URL, IPv4, ISO date, time, UUID, hex color, integer, decimal) and emits a clean, battle-tested regex for it. Otherwise it analyzes the structure of your examples, splitting each into runs of digits, letters, spaces and separators, and generalises them into character classes and quantifiers, so 'ORD-2024-001' and 'ORD-2023-118' become [A-Z]{3}-\\d{4}-\\d{3}. You can also paste strings that should NOT match to tighten the result, and every pattern is validated against your examples so you can see honestly whether it works. It's a heuristic, not magic: highly varied inputs get a broad pattern you can refine. Everything runs in your browser, your data never leaves the page.",

  ctaText: "Generate a regex",

  keywords: [
    "regex generator",
    "regex from examples",
    "generate regex",
    "regex builder",
    "create regex from text",
    "regex from sample strings",
    "regular expression generator",
    "make a regex",
    "regex maker",
    "infer regex",
  ],

  seo: {
    title: "Regex Generator from Examples: Build a Regex Free | GigAI Tools",
    description:
      "Paste example strings and get a validated regular expression that matches them. No regex expertise needed. Private, in-browser, free, no sign-up.",
  },

  features: [
    {
      icon: "BadgeCheck",
      title: "Knows common formats",
      description:
        "If your examples are emails, URLs, IPs, dates, UUIDs, hex colors or numbers, it emits a clean, hand-tuned regex for that format.",
    },
    {
      icon: "Boxes",
      title: "Infers structure",
      description:
        "For custom strings it analyzes the pattern of digits, letters and separators and generalises it: 'AB-123' becomes [A-Z]{2}-\\d{3}.",
    },
    {
      icon: "ShieldCheck",
      title: "Validated, not guessed",
      description:
        "Every result is tested against your examples. Add strings that should NOT match to tighten it. The tool shows whether it passes.",
    },
    {
      icon: "BookOpen",
      title: "Explains itself",
      description:
        "A plain-English breakdown says exactly what the pattern matches, so you can trust it and tweak it with confidence.",
    },
  ],

  benefits: [
    {
      title: "No regex expertise required",
      description:
        "Describe what you want by example instead of memorising syntax. Perfect when you know the strings but not the pattern language.",
    },
    {
      title: "Faster than trial and error",
      description:
        "Skip the write-test-tweak loop. Paste examples, get a validated pattern, and refine from a working starting point.",
    },
    {
      title: "Private and instant",
      description:
        "Your example data (which might be real records) is analyzed locally in your browser and never uploaded.",
    },
  ],

  howTo: [
    {
      title: "Paste strings that should match",
      description:
        "One example per line: order codes, dates, IDs, emails, anything. A few varied examples work best.",
    },
    {
      title: "Add strings that shouldn't match (optional)",
      description:
        "Provide counter-examples to tighten the pattern. The tool checks the regex rejects them.",
    },
    {
      title: "Copy the regex",
      description:
        "Read the plain-English explanation, confirm the validation is green, and copy the pattern into your code.",
    },
    {
      title: "Refine if needed",
      description:
        "For complex inputs you'll get a broad starting pattern, tweak it by hand, or add more consistent examples.",
    },
  ],

  faq: [
    {
      question: "How does it generate a regex from examples?",
      answer:
        "First it checks whether every example is a known format (email, URL, date, etc.) and uses a clean regex for that. Otherwise it splits each example into runs of digits, letters, spaces and separators, aligns them, and generalises each run into a character class and quantifier.",
    },
    {
      question: "Will it always produce a perfect regex?",
      answer:
        "No: general regex synthesis is genuinely hard. It excels at structured strings (codes, IDs, dates) and common formats. For highly varied inputs it produces a broad pattern that you refine by hand. That's why it validates against your examples and tells you the method used.",
    },
    {
      question: "What are the 'should not match' examples for?",
      answer:
        "They're counter-examples. The tool checks that the generated regex rejects them and warns you if it doesn't, which helps you tighten a pattern that's too loose.",
    },
    {
      question: "Can I use the result in any language?",
      answer:
        "The output is standard regex syntax that works in JavaScript, Python, Java, Go and most engines. A couple of advanced constructs vary between languages, but the patterns this tool produces are broadly portable.",
    },
    {
      question: "Is my example data uploaded?",
      answer:
        "No. The inference runs entirely in your browser, so your examples, which may be real data, never leave your device.",
    },
  ],

  relatedTools: ["regex-tester", "diff-checker", "json-validator", "url-parser"],
};

export default regexGenerator;
