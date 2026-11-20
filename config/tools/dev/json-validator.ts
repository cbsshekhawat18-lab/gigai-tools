import type { Tool } from "@/types";

/**
 * JSON Validator, a correctness-first companion to the JSON Formatter. Where the
 * formatter is about pretty-printing, this tool is about *linting*: it validates
 * strict RFC 8259 JSON, pinpoints the exact line + column of the first syntax
 * error with a caret under the offending character, explains the mistake in plain
 * language (trailing commas, single quotes, unquoted keys, comments, NaN), and
 * offers an opt-in lenient auto-fix that repairs the common ones and reports every
 * change it made. It also profiles a valid document, key count, maximum nesting
 * depth, object/array counts, byte size and a value-type breakdown. All copy is
 * unique to validation and linting, written to rank for the queries developers
 * search when a payload is rejected, not when they just want it prettified.
 */
const jsonValidator: Tool = {
  slug: "json-validator",
  title: "JSON Validator",
  description:
    "Validate JSON against RFC 8259 with the exact error line, column and a caret under the bad character. Get plain-English explanations, one-click auto-fix for trailing commas and single quotes, plus depth, key-count and type stats, nothing uploaded.",
  category: "developer-tools",
  icon: "FileCheck2",
  accent: "emerald",
  status: "live",
  createdAt: "2026-06-24",

  h1: "JSON Validator: Check, Lint & Auto-Fix JSON Online",
  tagline:
    "Paste JSON and know instantly whether it is valid. When it isn't, we point at the exact line and column, draw a caret under the broken character, explain why the parser choked, and offer a one-click lenient fix: all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI JSON Validator is a strict, RFC 8259 conformance checker and linter that runs entirely in your browser. Paste, drop or type JSON and it tells you the moment something is wrong. Not with a vague 'unexpected token', but with the precise line and column, a caret drawn directly under the offending character, and a plain-English explanation of what the parser expected there. It recognises the mistakes that trip everyone up: a trailing comma after the last array element, single quotes instead of double, unquoted object keys, // or /* */ comments carried over from JavaScript or JSONC, and non-standard literals like NaN, Infinity or undefined. Turn on lenient Auto-fix and it repairs those issues in one click and shows you a line-by-line report of exactly what it changed, so you stay in control and learn the rules instead of guessing. For valid documents it goes further than a pass/fail: it profiles the structure, total keys, maximum nesting depth, object and array counts, byte size, and a breakdown of how many strings, numbers, booleans and nulls it contains, so you can sanity-check a payload's shape at a glance. Because it uses the browser's native JSON engine on your own device, your API responses, tokens, config and customer data are never uploaded, stored or logged. It's the linter you reach for when JSON.parse fails in production and you need the answer in seconds.",

  ctaText: "Validate JSON",

  keywords: [
    "json validator",
    "validate json online",
    "json lint",
    "json linter",
    "check json",
    "json syntax checker",
    "json error line column",
    "rfc 8259 validator",
    "fix json trailing comma",
    "json auto fix",
    "is my json valid",
    "json parse error",
  ],

  seo: {
    title: "JSON Validator, Check, Lint & Auto-Fix JSON Online | GigAI Tools",
    description:
      "Free online JSON validator and linter. Validate JSON to RFC 8259, get the exact error line + column with a caret, plain-English fixes, one-click auto-fix for trailing commas and single quotes, and structure stats: 100% in your browser.",
  },

  features: [
    {
      icon: "Crosshair",
      title: "Caret at the exact error",
      description:
        "Beyond the line and column, we reproduce the failing line and draw a caret directly under the character the parser rejected, so you see the problem, not just coordinates.",
    },
    {
      icon: "MessageSquareWarning",
      title: "Plain-English diagnoses",
      description:
        "We detect and name the real cause (trailing comma, single quote, unquoted key, stray comment, NaN/Infinity) and tell you the RFC rule it breaks, instead of a cryptic 'unexpected token'.",
    },
    {
      icon: "Wand2",
      title: "One-click lenient auto-fix",
      description:
        "Opt into Auto-fix to repair trailing commas, single quotes, comments and unquoted keys in a click, with a line-by-line report of every change so you stay fully in control.",
    },
    {
      icon: "ChartNoAxesColumn",
      title: "Structure & type stats",
      description:
        "Valid JSON is profiled: total keys, maximum nesting depth, object/array counts, byte size and a breakdown of strings, numbers, booleans and nulls, a quick shape check for any payload.",
    },
    {
      icon: "Zap",
      title: "Validates as you type",
      description:
        "Every keystroke re-validates with a smart debounce, so the verdict, error caret and stats stay live without hunting for a 'Validate' button.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Validation uses the browser's native JSON engine on your device. No API response, secret or config file is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Find the broken character in seconds",
      description:
        "The caret and named diagnosis turn a failed JSON.parse into an instant fix, instead of squinting at a wall of braces trying to spot a stray comma.",
    },
    {
      title: "Learn the rules, not just patch symptoms",
      description:
        "Because Auto-fix reports every change it makes, you see which JavaScript habits JSON rejects, and stop repeating them.",
    },
    {
      title: "Sanity-check payload shape",
      description:
        "Depth, key-count and type stats let you confirm a response or fixture looks structurally right before it flows into a pipeline or UI.",
    },
    {
      title: "Safe for sensitive data",
      description:
        "It runs locally, so you can validate JSON containing tokens, PII or internal API shapes without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import JSON",
      description:
        "Paste into the editor, drag a .json file onto it, or load the built-in sample. Validation begins immediately.",
    },
    {
      title: "Read the verdict",
      description:
        "A green badge means valid, RFC 8259-conformant JSON. A red one shows the exact line, column, a caret under the bad character and what went wrong.",
    },
    {
      title: "Auto-fix or fix by hand",
      description:
        "Click Auto-fix to repair common issues and review the change report, or click Jump to error to place your cursor on the character and fix it yourself.",
    },
    {
      title: "Inspect the stats",
      description:
        "For valid JSON, check the depth, key-count and value-type breakdown to confirm the document's shape, then copy or share.",
    },
  ],

  formats: {
    input: ["JSON", "JSONC", "TXT"],
    output: ["JSON"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Debug a 400 from a request body",
      description:
        "When an endpoint rejects a payload as malformed JSON, paste the body to get the exact character at fault and confirm it's valid before retrying.",
    },
    {
      audience: "DevOps / Platform engineer",
      title: "Lint config before it ships",
      description:
        "Validate a package.json, tsconfig or CI config that failed to load, jump straight to the trailing comma or comment, and auto-fix JSONC leftovers.",
    },
    {
      audience: "QA / Data engineer",
      title: "Gate fixtures and exports",
      description:
        "Confirm a data dump is valid JSON and eyeball its depth and type mix before it enters a test suite or ingestion pipeline.",
    },
    {
      audience: "API integrator",
      title: "Verify a webhook payload",
      description:
        "Paste a captured webhook body to prove it parses and inspect its structure so you can map fields with confidence.",
    },
  ],

  troubleshooting: [
    {
      problem: "Auto-fix didn't repair my file.",
      solution:
        "Auto-fix handles the common lenient cases, trailing commas, single-quoted strings/keys, // and /* */ comments, and unquoted keys. Structural errors like a missing closing brace, a truncated file or duplicated content can't be inferred safely, so it leaves them for you. Use the caret and Jump to error to fix those by hand.",
    },
    {
      problem: "It flags my JSON with comments as invalid.",
      solution:
        "Standard JSON (RFC 8259) has no comments, VS Code settings and tsconfig use a superset called JSONC. Turn on Auto-fix to strip the comments, or remove them manually, to get strict, portable JSON.",
    },
    {
      problem: "Valid JSON, but the depth looks higher than expected.",
      solution:
        "Depth counts every nesting level, so an array of objects that each contain an array is deeper than it feels. The stat measures the longest path from the root to a leaf. Use it to spot accidentally over-nested structures.",
    },
    {
      problem: "The caret points a column off from my editor.",
      solution:
        "We report 1-based line and column against the raw text. Tabs count as a single column here, whereas some editors render them as multiple visual columns, jump to the line and the caret lands on the exact character.",
    },
  ],

  tips: [
    "Turn on Auto-fix to convert JSONC (comments, trailing commas) into strict JSON in one click, then read the report to see what changed.",
    "A parse error at the very end of the document is almost always a trailing comma or a missing closing brace or bracket.",
    "Use the depth and key-count stats to catch accidentally over-nested or unexpectedly huge payloads before they hit production.",
    "Press Ctrl/Cmd+Enter to re-validate and Esc to dismiss the error banner.",
    "Single quotes are valid in JavaScript but not JSON, if a key or string uses them, Auto-fix will double-quote it for you.",
  ],

  security:
    "Your JSON is validated entirely in your browser using its native JSON engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely paste payloads containing tokens, keys or personal data. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How do I know exactly where my JSON is broken?",
      answer:
        "When validation fails, the tool shows the precise 1-based line and column, reproduces the failing line, and draws a caret (^) directly under the character the parser rejected. Click 'Jump to error' to place your cursor there, so you can fix a trailing comma, missing brace or unquoted key immediately.",
    },
    {
      question: "What does the auto-fix actually change?",
      answer:
        "Lenient Auto-fix repairs the most common non-standard patterns: it removes trailing commas, converts single quotes to double quotes on strings and keys, quotes unquoted object keys, and strips // line and /* block */ comments. After it runs it shows a line-by-line report of every change it made, so nothing happens silently and you learn the rules.",
    },
    {
      question: "Which JSON standard does it validate against?",
      answer:
        "It validates strict JSON as defined by RFC 8259 (equivalent to ECMA-404), using the browser's native JSON.parse. That means double-quoted keys and strings, no trailing commas, no comments, and no NaN, Infinity or undefined literals, the same rules a server's JSON parser applies.",
    },
    {
      question: "Why does valid-looking JSON get rejected?",
      answer:
        "JSON is stricter than JavaScript object literals. The usual causes are a trailing comma after the last element, single quotes instead of double, unquoted keys, comments (JSONC, not JSON), or literals like NaN and Infinity. The validator names the specific cause and points the caret at it, so you don't have to guess.",
    },
    {
      question: "What's the difference between this and a JSON formatter?",
      answer:
        "A formatter pretty-prints or minifies JSON that already parses. This validator focuses on correctness: it lints your JSON, diagnoses why it fails, offers a lenient auto-fix, and profiles the structure of valid documents. Use the validator to make JSON correct, then a formatter to make it pretty.",
    },
    {
      question: "What do the depth and key-count stats mean?",
      answer:
        "Depth is the deepest nesting level from the root to any leaf value. Keys is the total number of object keys across the whole document. Together with the object/array counts, byte size and value-type breakdown, they give you a quick structural profile so you can confirm a payload looks right.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. All validation, auto-fixing and profiling happen locally in your browser using its built-in JSON engine. Your data never leaves your device. There is nothing for us to store, log or see, so it is safe to validate JSON containing secrets or personal information.",
    },
    {
      question: "Can it validate very large JSON files?",
      answer:
        "Yes, within a generous character guard that keeps the browser tab responsive on multi-megabyte inputs. Most real-world API responses, config files and fixtures are comfortably inside it. For extremely large files, validate in sections.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live RFC 8259 validation, precise line + column errors with an on-screen caret, plain-English diagnoses, jump-to-error and structure stats (keys, depth, counts, byte size, type breakdown).",
    },
    {
      date: "2026-06-28",
      change:
        "Added lenient Auto-fix for trailing commas, single quotes, unquoted keys and comments, with a line-by-line report of every change applied.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined error diagnoses for NaN/Infinity literals and duplicate-key detection, plus drag-drop/paste import, shareable links and keyboard shortcuts.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "json-to-typescript",
    "yaml-to-json",
    "jwt-decoder",
  ],
};

export default jsonValidator;
