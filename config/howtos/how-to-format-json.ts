import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-format-json",
  title: "How to Format JSON (Pretty-Print & Validate)",
  description:
    "Turn a minified or broken JSON string into clean, indented, readable JSON, and catch syntax errors while you're at it. A quick step-by-step guide.",
  accent: "violet",
  icon: "Braces",
  toolSlug: "json-formatter",
  seo: {
    title: "How to Format JSON: Pretty-Print, Indent & Validate (Free)",
    description:
      "Learn how to format and pretty-print JSON in your browser, fix indentation, spot syntax errors and make dense API responses readable. Step-by-step, free and private.",
    keywords: [
      "how to format json",
      "pretty print json",
      "json formatter",
      "beautify json",
      "indent json",
      "validate json",
    ],
    canonical: "/how-to/how-to-format-json",
  },
  intro: [
    "Raw JSON from an API or a config file often arrives as one long, unbroken line with no whitespace. It's valid, but it's almost impossible to read, nested objects blur together and a single misplaced comma can be hard to find. Formatting (also called pretty-printing or beautifying) re-indents the data so every key, value and nesting level lines up on its own row.",
    "Formatting also doubles as validation: a formatter can only lay out JSON that actually parses, so if it refuses, you've found a syntax error. The guide below uses our free JSON formatter, which runs entirely in your browser. Your data is never uploaded, so it's safe to paste even sensitive payloads.",
  ],
  steps: [
    {
      title: "Open the JSON formatter",
      body: "Go to the JSON formatter tool. It loads instantly in the browser with nothing to install and no account needed.",
    },
    {
      title: "Paste your JSON",
      body: "Paste the raw JSON into the input box, a minified API response, a copied config snippet, or anything in between. You can also type it directly if you're building a payload by hand.",
    },
    {
      title: "Choose your indentation",
      body: "Pick how much to indent each level. Two spaces is the most common convention, four spaces is more spacious, and tabs suit some editors. This controls how the formatted output looks.",
    },
    {
      title: "Format the JSON",
      body: "Run the formatter. It parses the input and re-emits it with consistent indentation, one property per line, so the structure becomes immediately scannable.",
    },
    {
      title: "Fix any reported errors",
      body: "If the JSON is invalid, the tool points to the problem, a trailing comma, a missing bracket, or unquoted keys. Correct it and format again until it parses cleanly.",
    },
    {
      title: "Copy or download the result",
      body: "Copy the pretty-printed JSON to your clipboard, or download it as a .json file to drop straight into your project or documentation.",
    },
  ],
  tips: [
    "JSON keys and strings must use double quotes. Single quotes are the single most common cause of 'invalid JSON' errors.",
    "Trailing commas after the last item in an object or array are not allowed in strict JSON, even though many languages permit them.",
    "If you need the smallest possible size for transport, format to read it, then minify the final version, indentation adds bytes you don't want to ship.",
    "Comments aren't part of the JSON spec. If your file has // or /* */ comments it's really JSON5 or JSONC, and a strict formatter will reject them.",
  ],
  faq: [
    {
      question: "What does formatting JSON actually do?",
      answer:
        "It re-indents the data and puts each property on its own line so the nesting is easy to read. The values themselves are unchanged, formatting only affects whitespace, so the parsed data is identical before and after.",
    },
    {
      question: "Why is my JSON invalid?",
      answer:
        "The usual culprits are single quotes instead of double quotes, a trailing comma after the last element, a missing closing bracket or brace, or unquoted property names. The formatter highlights where parsing fails so you can jump straight to the fix.",
    },
    {
      question: "Is it safe to paste sensitive JSON here?",
      answer:
        "Yes. The formatter runs entirely in your browser, nothing is uploaded to a server or logged, so it's safe for tokens, keys and other confidential payloads.",
    },
    {
      question: "What's the difference between formatting and minifying?",
      answer:
        "Formatting adds whitespace to make JSON readable for humans. Minifying strips all of it to make the file as small as possible for machines. Both produce the same data. You format for editing and minify for transport.",
    },
    {
      question: "How many spaces should I indent JSON with?",
      answer:
        "Two spaces is the most widely used convention and keeps deeply nested data compact. Four spaces is more legible for shallow structures. Either is fine. Pick one and stay consistent across a project.",
    },
  ],
  relatedToolSlugs: [
    "json-validator",
    "json-to-csv",
    "csv-to-json",
    "json-to-typescript",
  ],
  relatedHowToSlugs: [],
};

export default howto;
