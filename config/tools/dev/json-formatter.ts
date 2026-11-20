import type { Tool } from "@/types";

/**
 * JSON Formatter, the platform's flagship developer tool. It beautifies,
 * minifies, validates and key-sorts JSON entirely in the browser, with a
 * precise line + column error locator and jump-to-error, live-as-you-type
 * processing, drag/drop/paste import, and byte-size before/after stats. All
 * copy is unique to JSON formatting and validation, written to rank for the
 * exact queries developers type when a `JSON.parse` blows up at 2am.
 */
const jsonFormatter: Tool = {
  slug: "json-formatter",
  title: "JSON Formatter",
  description:
    "Format, validate and minify JSON in your browser with pinpoint error line + column, jump-to-error, key sorting and live editing: nothing is uploaded.",
  category: "developer-tools",
  icon: "Braces",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "JSON Formatter & Validator: Beautify, Minify, Fix Online",
  tagline:
    "Paste messy JSON and get it beautified, validated and minified instantly. When it's broken, we point at the exact line and column and let you jump straight to it, all client-side, nothing uploaded.",
  longDescription:
    "The GigAI JSON Formatter is a desktop-grade JSON editor that runs entirely in your browser. Paste, drop or type JSON and it beautifies with 2-space, 4-space or tab indentation, minifies to the most compact form, sorts every object key alphabetically for clean diffs, and validates as you type. What sets it apart from jsonformatter.org and JSONLint is the error experience: when your JSON is invalid we surface the precise line and column, explain what the parser expected, and give you a one-click jump straight to the offending character. No more counting braces by hand. It shows the byte size before and after so you can see exactly what minifying saved, keeps a full undo/redo history, and works from the keyboard with real shortcuts. Because everything happens locally with the browser's native JSON engine, your payloads (API responses, tokens, config, customer data) are never uploaded, logged or seen by anyone. Close the tab and it's gone.",

  ctaText: "Format JSON",

  keywords: [
    "json formatter",
    "json beautifier",
    "format json online",
    "json minifier",
    "json pretty print",
    "validate json",
    "json parse error line",
    "beautify json",
    "sort json keys",
    "json viewer",
  ],

  seo: {
    title: "JSON Formatter & Validator, Beautify / Minify JSON Online | GigAI Tools",
    description:
      "Free online JSON formatter, validator and minifier. Beautify or minify JSON, sort keys, and get the exact error line + column with jump-to-error, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "MapPin",
      title: "Exact error line & column",
      description:
        "When JSON won't parse we show the precise line and column, quote what the parser expected, and give you a one-click jump to the character, far beyond a generic 'unexpected token'.",
    },
    {
      icon: "Braces",
      title: "Beautify, minify or sort",
      description:
        "Pretty-print with 2-space, 4-space or tab indentation, collapse to the most compact one-liner, or alphabetise every object key for clean, reviewable diffs.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Formatting and validation run on every keystroke with a smart debounce, so the output pane and error banner stay in sync without a 'Format' button dance.",
    },
    {
      icon: "Scale",
      title: "Byte size before & after",
      description:
        "See the input and output size and the exact percentage saved when you minify, so you know what a build or payload trim actually buys you.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste or import",
      description:
        "Drag a .json file onto the editor, paste from your clipboard, or click to browse. Copy, download or share a link to the result with one click.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Parsing uses the browser's native JSON engine on your device. No API response, token or config file is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Debug broken JSON in seconds",
      description:
        "The pinpoint line/column locator and jump-to-error turn a cryptic parse failure into a two-second fix, instead of manually counting brackets in a wall of text.",
    },
    {
      title: "Clean diffs with sorted keys",
      description:
        "Sorting keys alphabetically makes two JSON blobs comparable in Git, so code review focuses on real changes rather than reshuffled fields.",
    },
    {
      title: "Trim payloads for production",
      description:
        "Minify config and fixtures and watch the byte savings, shaving weight off bundles, cache entries and API responses without touching the data.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can safely format JSON containing secrets, PII or internal API shapes, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import JSON",
      description:
        "Paste into the left editor, drag a .json file onto it, or click to browse. Or load a built-in sample to try it instantly.",
    },
    {
      title: "Pick a mode & indent",
      description:
        "Choose Beautify, Minify or Sort keys, and set 2-space, 4-space or tab indentation. Everything re-runs live as you change options.",
    },
    {
      title: "Fix any errors",
      description:
        "If the JSON is invalid, read the exact line and column in the error banner and click Jump to error to place your cursor on it.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the formatted output, download it as a .json file, or share a link that reopens the tool with your input pre-loaded.",
    },
  ],

  formats: {
    input: ["JSON", "TXT"],
    output: ["JSON"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Inspect an API response",
      description:
        "Paste a minified API payload from your network tab to read it structured, then sort keys to diff two responses and spot exactly what changed.",
    },
    {
      audience: "Frontend developer",
      title: "Fix a config that won't parse",
      description:
        "When a package.json, tsconfig or i18n file throws on load, jump straight to the trailing comma or unquoted key the parser is choking on.",
    },
    {
      audience: "QA / Data engineer",
      title: "Validate fixtures and exports",
      description:
        "Confirm a data dump or test fixture is valid JSON before it hits a pipeline, and minify large fixtures to keep repositories lean.",
    },
    {
      audience: "Student",
      title: "Learn JSON structure",
      description:
        "Beautify a compact example to see how objects, arrays and nesting fit together, with instant, plain-language feedback when something is malformed.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says 'Unexpected token' but the JSON looks fine.",
      solution:
        "Click Jump to error and inspect the reported line/column. The usual culprits are a trailing comma after the last item, a single quote instead of double, or an unquoted key. JSON is stricter than JavaScript object literals.",
    },
    {
      problem: "My large numbers changed after formatting.",
      solution:
        "JSON.parse coerces numbers to IEEE-754 doubles, so integers above 2^53−1 (like some Twitter/Snowflake IDs) lose precision on any round-trip. Keep such IDs as strings in the source to preserve them exactly.",
    },
    {
      problem: "Nothing happens on a huge paste.",
      solution:
        "Very large inputs (multi-megabyte) are guarded to keep the tab responsive. Trim the payload, or format it in sections. The limit is generous but not unbounded.",
    },
    {
      problem: "My comments disappeared.",
      solution:
        "Standard JSON has no comments, so the parser rejects them. If you're editing JSONC (VS Code settings, tsconfig), strip the comments first. This tool validates strict RFC 8259 JSON.",
    },
  ],

  tips: [
    "Use Sort keys before committing generated JSON so future diffs stay small and reviewable.",
    "Press Ctrl/Cmd+Enter to re-run instantly, and Ctrl/Cmd+S to download the formatted output.",
    "Minify then check the byte-size badge to see the exact savings before shipping a payload or fixture.",
    "Getting a parse error at the very end? It's almost always a trailing comma or a missing closing brace/bracket.",
    "Store big numeric IDs as strings to avoid silent precision loss on the parse/stringify round-trip.",
  ],

  security:
    "Your JSON is parsed and formatted entirely in your browser using its native JSON engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely paste responses containing tokens, keys or personal data. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my JSON uploaded to a server?",
      answer:
        "No. All parsing, formatting, minifying and validation happen locally in your browser with its built-in JSON engine. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to format JSON containing secrets or personal information.",
    },
    {
      question: "How do I find the error in invalid JSON?",
      answer:
        "When your JSON fails to parse, the error banner shows the exact line and column of the problem and explains what the parser expected. Click 'Jump to error' and your cursor is placed on the offending character, so you can fix a trailing comma, missing brace or unquoted key in seconds.",
    },
    {
      question: "What's the difference between beautify and minify?",
      answer:
        "Beautify (pretty-print) adds indentation and line breaks to make JSON readable: pick 2-space, 4-space or tab indent. Minify strips all optional whitespace to produce the smallest valid one-line representation, ideal for payloads, caches and bundles. The tool shows the byte size before and after so you can see the saving.",
    },
    {
      question: "Why does my JSON say 'Unexpected token' when it looks valid?",
      answer:
        "JSON is stricter than JavaScript objects. Common causes are a trailing comma after the last element, single quotes instead of double quotes, unquoted keys, comments (not allowed in standard JSON), or an unescaped control character in a string. Use jump-to-error to land right on the character the parser rejected.",
    },
    {
      question: "Does formatting change my large numbers?",
      answer:
        "It can. JSON numbers are parsed as 64-bit floating point, so integers larger than 2^53−1 lose precision on any parse-then-stringify round-trip. This affects things like Snowflake and some social-media IDs. To keep them exact, store such values as strings in your source JSON.",
    },
    {
      question: "What does 'Sort keys' do?",
      answer:
        "Sort keys recursively alphabetises the keys of every object in your JSON while leaving array order untouched. It produces a canonical form, which makes two JSON documents easy to compare in Git and keeps generated-file diffs small and meaningful.",
    },
    {
      question: "Can it validate JSON without reformatting it?",
      answer:
        "Yes. Validation runs continuously as you type, independent of the output. A valid document formats cleanly. An invalid one shows a precise, positioned error message so you can treat the tool purely as a JSON linter if you like.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on multi-megabyte inputs. Most real-world API responses, config files and fixtures are well within it. For extremely large files, format in sections or trim the payload first.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: live beautify/minify/sort, 2/4/tab indentation, precise line + column errors with jump-to-error, byte-size stats, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added keyboard shortcuts (run, download, clear, undo/redo) with an in-tool shortcuts helper, plus a curated set of sample documents.",
    },
    {
      date: "2026-07-02",
      change:
        "Improved big-integer precision guidance and refined error messages for trailing commas and unquoted keys.",
    },
  ],

  relatedTools: [
    "json-to-typescript",
    "yaml-to-json",
    "jwt-decoder",
    "base64-encode",
  ],
};

export default jsonFormatter;
