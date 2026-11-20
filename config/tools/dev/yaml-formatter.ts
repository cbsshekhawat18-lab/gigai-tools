import type { Tool } from "@/types";

/**
 * YAML Formatter & Converter, a client-side YAML beautifier that also converts
 * YAML ↔ JSON. Copy is written uniquely for YAML (indentation, key sorting,
 * flow vs block style, and precise parse errors) so it ranks for the exact
 * queries developers type when a CI pipeline, Kubernetes manifest or GitHub
 * Actions workflow refuses to parse. Everything runs locally via js-yaml. No
 * manifest, secret or config file is ever uploaded.
 */
const yamlFormatter: Tool = {
  slug: "yaml-formatter",
  title: "YAML Formatter",
  description:
    "Format, clean and re-indent YAML in your browser, or convert YAML ↔ JSON, with key sorting, flow/block style and the exact error line + column. Nothing is uploaded.",
  category: "developer-tools",
  icon: "AlignLeft",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "YAML Formatter & Converter, Beautify, Lint, YAML ↔ JSON Online",
  tagline:
    "Paste messy YAML and get it re-indented, key-sorted and validated instantly, or convert it to JSON and back. When it won't parse we point at the exact line and column. 100% client-side, nothing uploaded.",
  longDescription:
    "The GigAI YAML Formatter is a desktop-grade YAML editor that runs entirely in your browser. Paste, drop or type YAML and it normalises the indentation to 2, 4 or 8 spaces, sorts every mapping key alphabetically for clean diffs, and can re-emit your document in compact flow style (`{a: 1, b: 2}`) or readable block style. It doubles as a two-way converter: turn a Kubernetes manifest or GitHub Actions workflow into JSON to feed a tool that only speaks JSON, then convert the JSON back to clean YAML. What sets it apart from the usual online converters is the error experience. When your YAML is invalid we surface the precise line and column, quote what the parser expected, and give you a one-click jump straight to the offending character, so a mis-indented key or a stray tab stops being a five-minute hunt. It keeps a full undo/redo history, works from the keyboard, and shows document stats at a glance. Because parsing and dumping happen locally with js-yaml, your manifests, secrets, CI configuration and infrastructure files are never uploaded, logged or seen by anyone. Close the tab and it's gone.",

  ctaText: "Format YAML",

  keywords: [
    "yaml formatter",
    "yaml beautifier",
    "yaml validator",
    "format yaml online",
    "yaml to json",
    "json to yaml",
    "yaml lint",
    "yaml parse error line",
    "beautify yaml",
    "sort yaml keys",
    "yaml indent fixer",
    "yaml converter",
  ],

  seo: {
    title: "YAML Formatter & Converter: Beautify YAML, YAML ↔ JSON | GigAI Tools",
    description:
      "Free online YAML formatter, validator and converter. Re-indent and beautify YAML, sort keys, switch flow/block style, convert YAML ↔ JSON, and get the exact error line + column, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "AlignLeft",
      title: "Re-indent & beautify",
      description:
        "Normalise inconsistent indentation to 2, 4 or 8 spaces, strip trailing noise and emit clean, canonical YAML: the fix for manifests copied out of a chat window.",
    },
    {
      icon: "ArrowRightLeft",
      title: "YAML ↔ JSON both ways",
      description:
        "Convert YAML to pretty JSON to feed a JSON-only tool, or turn JSON back into readable block YAML. Switch direction with one control and everything re-runs live.",
    },
    {
      icon: "MapPin",
      title: "Exact error line & column",
      description:
        "When YAML won't parse we show the precise line and column, quote what the parser expected, and offer a one-click jump to the character. No counting spaces by hand.",
    },
    {
      icon: "ArrowDownAZ",
      title: "Sort keys for clean diffs",
      description:
        "Alphabetise every mapping key recursively so two versions of a config compare cleanly in Git and review focuses on real changes, not reshuffled fields.",
    },
    {
      icon: "Braces",
      title: "Flow or block style",
      description:
        "Re-emit collapsed flow style like `{name: web, port: 80}` for compact snippets, or expand to readable multi-line block style: your choice, applied instantly.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Parsing and dumping run locally with js-yaml on your device. No manifest, secret, token or CI file is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Fix broken indentation in seconds",
      description:
        "YAML lives and dies by whitespace. Re-indenting normalises tabs and ragged spacing into a valid, canonical document instead of a manual space-counting exercise.",
    },
    {
      title: "Bridge YAML and JSON toolchains",
      description:
        "Convert a Helm values file or Actions workflow to JSON for a linter or API that only speaks JSON, then convert the result straight back to clean YAML.",
    },
    {
      title: "Clean diffs with sorted keys",
      description:
        "Sorting mapping keys produces a canonical form, so pull-request diffs on configuration stay small, meaningful and easy to review.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can safely format YAML containing secrets, API keys or internal infrastructure: none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import YAML",
      description:
        "Paste into the left editor, drag a .yml/.yaml file onto it, or click to browse. Or load a built-in sample to try it instantly.",
    },
    {
      title: "Pick a mode & options",
      description:
        "Choose Format, YAML → JSON or JSON → YAML, then set the indent, whether to sort keys, and flow vs block style. Everything re-runs live.",
    },
    {
      title: "Fix any errors",
      description:
        "If the input is invalid, read the exact line and column in the error banner and click Jump to error to place your cursor on it.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the result, download it as a .yaml or .json file, or share a link that reopens the tool with your input pre-loaded.",
    },
  ],

  formats: {
    input: ["YAML", "YML", "JSON", "TXT"],
    output: ["YAML", "JSON"],
  },

  useCases: [
    {
      audience: "DevOps / Platform engineer",
      title: "Clean up a Kubernetes manifest",
      description:
        "Re-indent a manifest pasted from Slack, sort keys so the deployment diffs cleanly, or convert it to JSON to feed a policy checker that only reads JSON.",
    },
    {
      audience: "Backend developer",
      title: "Fix a CI workflow that won't parse",
      description:
        "When a GitHub Actions or GitLab CI file throws on load, jump straight to the line the parser rejects, usually a tab, a bad indent or an unquoted colon.",
    },
    {
      audience: "Frontend developer",
      title: "Convert config between formats",
      description:
        "Turn a JSON config into readable YAML for a tool that prefers it, or flatten a YAML fixture to JSON to paste into a test, round-trip either direction.",
    },
    {
      audience: "Technical writer",
      title: "Tidy YAML for docs",
      description:
        "Beautify example snippets to a consistent indent and style so code blocks in documentation are correct, readable and copy-paste-safe.",
    },
  ],

  troubleshooting: [
    {
      problem: "It rejects my file with 'bad indentation' or a tab error.",
      solution:
        "YAML forbids tab characters for indentation. Click Jump to error, then replace tabs with spaces on the reported line. Re-formatting afterwards normalises the whole document to a consistent space indent.",
    },
    {
      problem: "A value like `on: true` or `version: 3.10` changed meaning.",
      solution:
        "YAML auto-types bare scalars, so `on`, `yes`, `no`, `off` become booleans and `3.10` becomes the number 3.1. Quote the value ('3.10', \"on\") to keep it an exact string on the round-trip.",
    },
    {
      problem: "Only the first document came through.",
      solution:
        "This tool reads a single YAML document. If your file uses `---` separators for a multi-document stream, format each document separately or remove the extra separators first.",
    },
    {
      problem: "Anchors and aliases disappeared after formatting.",
      solution:
        "The formatter resolves `&anchor`/`*alias` references and emits the expanded value so the output is self-contained. If you need the references preserved verbatim, format a copy and keep the original.",
    },
  ],

  tips: [
    "Use Sort keys before committing generated YAML so future diffs stay small and reviewable.",
    "Press Ctrl/Cmd+Enter to re-run instantly, and Ctrl/Cmd+S to download the result.",
    "Getting a parse error you can't see? It's almost always a tab character or a key indented by an odd number of spaces.",
    "Quote values like '3.10', 'on' and 'yes' when you need them to stay strings, not numbers or booleans.",
    "Convert to JSON and back to YAML to instantly canonicalise a hand-edited file into a consistent style.",
  ],

  security:
    "Your YAML is parsed and dumped entirely in your browser with js-yaml. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely format manifests, CI configuration or files containing secrets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my YAML uploaded to a server?",
      answer:
        "No. All parsing, formatting and conversion happen locally in your browser using js-yaml. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to format YAML containing secrets, API keys or internal infrastructure details.",
    },
    {
      question: "How do I find the error in invalid YAML?",
      answer:
        "When your YAML fails to parse, the error banner shows the exact line and column of the problem and explains what the parser expected. Click 'Jump to error' and your cursor lands on the offending character, so you can fix a bad indent, a stray tab or an unquoted colon in seconds.",
    },
    {
      question: "Can it convert YAML to JSON and JSON to YAML?",
      answer:
        "Yes. Switch the mode to YAML → JSON to get pretty, indented JSON from your YAML, or JSON → YAML to turn a JSON document into clean, readable block YAML. Both directions run live and validate as you type, with precise errors when the input is malformed.",
    },
    {
      question: "Why did YAML turn `on`, `yes` or `3.10` into something else?",
      answer:
        "YAML automatically types unquoted scalars: `on`, `yes`, `no` and `off` become booleans, and numeric-looking values like `3.10` become numbers (3.1). To keep a value as an exact string, wrap it in quotes ('on', 'yes', '3.10') and it will survive formatting and conversion unchanged.",
    },
    {
      question: "What is the difference between flow and block style?",
      answer:
        "Block style is the familiar multi-line YAML with indentation. Flow style writes collapsed inline structures like `{name: web, ports: [80, 443]}`, similar to JSON. This tool can emit either: flow for compact one-liners and snippets, block for readable, reviewable config.",
    },
    {
      question: "Does it support tabs for indentation?",
      answer:
        "The YAML spec forbids tabs as indentation, so a file that uses tabs will fail to parse. Replace the tabs on the reported line with spaces. Once the document parses, formatting normalises everything to a consistent 2, 4 or 8-space indent.",
    },
    {
      question: "What does 'Sort keys' do?",
      answer:
        "Sort keys recursively alphabetises the keys of every mapping in your document while leaving sequence (list) order untouched. It produces a canonical form that makes two YAML files easy to compare in Git and keeps generated-file diffs small and meaningful.",
    },
    {
      question: "Does it handle multi-document YAML streams?",
      answer:
        "It formats a single YAML document at a time. If your file uses `---` separators to hold multiple documents in one stream, format each document individually, the tool reads the first one and will not merge the rest.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live YAML formatting with 2/4/8-space indent, key sorting, flow/block style, YAML ↔ JSON conversion, precise line + column errors with jump-to-error, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added keyboard shortcuts (run, download, clear, undo/redo) with an in-tool shortcuts helper and a curated set of sample documents (Kubernetes, GitHub Actions, docker-compose).",
    },
    {
      date: "2026-07-02",
      change:
        "Refined error messages for tab-indentation and unquoted-colon mistakes, and added document stats (keys, lines, output size).",
    },
  ],

  relatedTools: [
    "json-formatter",
    "json-to-typescript",
    "base64-encoder",
    "jwt-decoder",
  ],
};

export default yamlFormatter;
