import type { Tool } from "@/types";

/**
 * CSS Beautifier, a desktop-grade formatter for CSS, SCSS and LESS that runs
 * entirely in the browser on top of Prettier. It auto-detects the syntax,
 * pretty-prints nested SCSS, respects your indent width and print width, and
 * points at the exact line and column when a stylesheet won't parse. Every copy
 * field below is unique to CSS/SCSS/LESS formatting and written to rank for the
 * queries developers actually type. Not shared boilerplate.
 */
const cssBeautifier: Tool = {
  slug: "css-beautifier",
  title: "CSS Beautifier",
  description:
    "Beautify and format CSS, SCSS and LESS in your browser with Prettier, auto-detected syntax, configurable indent and print width, nested-rule support and precise error lines. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Paintbrush",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "CSS Beautifier, Format & Prettify CSS, SCSS & LESS Online",
  tagline:
    "Paste minified or messy CSS, SCSS or LESS and get clean, consistently indented styles instantly. Prettier under the hood, syntax auto-detected, indent and print width your call, all client-side, nothing uploaded.",
  longDescription:
    "The GigAI CSS Beautifier is a proper stylesheet formatter that runs 100% in your browser, powered by the same Prettier engine editors like VS Code use. Drop in CSS, SCSS or LESS (it auto-detects the flavour, or you can pin it) and it reflows the whole sheet into a clean, canonical shape: one declaration per line, normalised spacing around colons, braces and combinators, consistent quoting, and properly indented nested SCSS/LESS rules and media queries. You control the two knobs that actually matter for a stylesheet: indent width (2, 4 or tabs) and print width, so long selector lists and value shorthands wrap exactly how your team's style guide wants. When a sheet is malformed (an unbalanced brace, a stray token in a selector, an unterminated block) it doesn't fail silently. It surfaces the precise line and column and lets you jump straight to it. Because Prettier runs on your device, none of your design tokens, unreleased component styles or client CSS ever leave the tab: no upload, no logging, no account. It's the fastest way to turn a minified bundle or a hand-hacked stylesheet back into something a human, and a code reviewer, can read.",

  ctaText: "Beautify CSS",

  keywords: [
    "css beautifier",
    "css formatter",
    "format css online",
    "prettify css",
    "scss formatter",
    "less formatter",
    "beautify scss",
    "css pretty print",
    "unminify css",
    "css indent tool",
    "format css scss less",
    "online css beautifier",
  ],

  seo: {
    title:
      "CSS Beautifier, Format & Prettify CSS, SCSS, LESS Online | GigAI Tools",
    description:
      "Free online CSS beautifier powered by Prettier. Format and prettify CSS, SCSS and LESS with auto-detected syntax, custom indent and print width, and precise error lines: 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "ScanLine",
      title: "Auto-detects CSS, SCSS & LESS",
      description:
        "Paste any of the three and the beautifier picks the right Prettier parser automatically: nested rules, @mixin, variables and interpolation are all understood. Pin the syntax manually whenever you want.",
    },
    {
      icon: "IndentIncrease",
      title: "Your indent & print width",
      description:
        "Set 2-space, 4-space or tab indentation and choose the print width so long selector lists, gradients and shorthand values wrap exactly the way your style guide expects.",
    },
    {
      icon: "ListTree",
      title: "Nested rules done right",
      description:
        "SCSS and LESS nesting, media queries and selector lists are re-indented cleanly with consistent brace placement, so deeply nested component styles stay readable.",
    },
    {
      icon: "MapPin",
      title: "Precise parse errors",
      description:
        "An unbalanced brace or stray token doesn't fail quietly. You get the exact line and column of the problem and a one-click jump straight to it.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Formatting runs on every keystroke with a smart debounce, so the output pane and error banner stay in sync. No 'Format' button dance required.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Prettier runs on your device. Your design tokens, unreleased component CSS and client stylesheets are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Unminify bundles instantly",
      description:
        "Turn a minified production stylesheet or a compiled CSS blob back into readable, indented source you can actually inspect and debug.",
    },
    {
      title: "Consistent diffs across a team",
      description:
        "One canonical format means Git diffs show real changes, not whitespace churn, reviews focus on the CSS that actually moved.",
    },
    {
      title: "Match your style guide",
      description:
        "Dialling in indent and print width reproduces your project's Prettier config, so pasted snippets land in exactly the house style.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs locally, so you can safely format proprietary or pre-launch styles containing internal class names and tokens.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import your styles",
      description:
        "Paste CSS/SCSS/LESS into the left editor, drag a .css/.scss/.less file onto it, or click to browse. Or load a built-in sample to try it instantly.",
    },
    {
      title: "Confirm the syntax",
      description:
        "Leave it on Auto to detect CSS, SCSS or LESS, or pin the flavour if your file mixes conventions or lacks tell-tale syntax.",
    },
    {
      title: "Set indent & print width",
      description:
        "Choose 2-space, 4-space or tab indentation and a print width. Everything re-formats live as you change the options.",
    },
    {
      title: "Fix any errors, then export",
      description:
        "If the sheet is malformed, jump to the reported line and column to fix it. Then copy the result, download a formatted file, or share a link.",
    },
  ],

  formats: {
    input: ["CSS", "SCSS", "LESS", "TXT"],
    output: ["CSS", "SCSS", "LESS"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Read a minified stylesheet",
      description:
        "Paste a minified bundle from a network tab or dist folder to unminify it into properly indented rules you can trace a bug through.",
    },
    {
      audience: "Design-system engineer",
      title: "Normalise component styles",
      description:
        "Run a batch of hand-authored SCSS partials through one canonical format so tokens, mixins and nested rules follow a single house style.",
    },
    {
      audience: "Code reviewer",
      title: "Kill whitespace-only diffs",
      description:
        "Beautify both versions of a stylesheet with identical settings so a pull request shows the real declaration changes, not reflow noise.",
    },
    {
      audience: "Student / learner",
      title: "See how nesting expands",
      description:
        "Format a compact SCSS example to watch nesting, selector lists and media queries lay out clearly with instant feedback on typos.",
    },
  ],

  troubleshooting: [
    {
      problem: "My SCSS mixins/variables get flagged as errors in CSS mode.",
      solution:
        "Plain CSS doesn't understand $variables, @mixin or nesting. Switch the syntax selector to SCSS (or LESS for @variables and mixin() calls) so the right Prettier parser is used.",
    },
    {
      problem: "It reports an error but the line looks fine.",
      solution:
        "Prettier reports where parsing broke, which is often just after the real mistake, an unclosed brace or missing semicolon a few lines above. Jump to the reported line, then scan upward for the unbalanced block.",
    },
    {
      problem: "Long selector lists still wrap onto multiple lines.",
      solution:
        "That's print width doing its job. Increase the print width if you prefer selectors and long values kept on one line. Lower it to force earlier wrapping.",
    },
    {
      problem: "My comments moved or reformatted.",
      solution:
        "Prettier normalises whitespace around comments but never deletes them. /* block comments */ are preserved. Note that plain CSS has no // line comments. Those are only valid in SCSS/LESS.",
    },
  ],

  tips: [
    "Leave syntax on Auto for most files, only pin SCSS/LESS when a sheet lacks the tell-tale nesting or variable syntax.",
    "Match your repo's Prettier config by setting the same indent width and print width here, so pasted snippets come out identical.",
    "Press Ctrl/Cmd+Enter to re-run instantly and Ctrl/Cmd+S to download the formatted stylesheet.",
    "Beautify both sides of a change with the same settings before a code review to eliminate whitespace-only diff noise.",
    "Getting a parse error near the end? It's almost always an unclosed brace or a missing semicolon higher up the sheet.",
  ],

  security:
    "Your CSS, SCSS or LESS is formatted entirely in your browser using Prettier running on your device. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely beautify proprietary design tokens, unreleased component styles or client stylesheets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my CSS uploaded to a server?",
      answer:
        "No. All formatting happens locally in your browser using the Prettier engine bundled into the page. Your stylesheets never leave your device, so there's nothing for us to store, log or see, it's safe to beautify proprietary or unreleased CSS containing internal class names and design tokens.",
    },
    {
      question: "Does it support SCSS and LESS as well as plain CSS?",
      answer:
        "Yes. The beautifier auto-detects CSS, SCSS or LESS and uses the matching Prettier parser, so nested rules, variables, mixins and interpolation are formatted correctly. You can also pin the syntax manually if a file's flavour is ambiguous.",
    },
    {
      question: "Can it unminify or expand minified CSS?",
      answer:
        "Absolutely. Paste a minified or single-line stylesheet and it reflows into clean, indented source, one declaration per line with normalised spacing, which is exactly what you want when debugging a compiled bundle.",
    },
    {
      question: "How do I control indentation and line wrapping?",
      answer:
        "Set the indent to 2 spaces, 4 spaces or tabs, and choose a print width. Print width is the target line length Prettier uses to decide when to wrap long selector lists and values: lower it for narrower output, raise it to keep things on one line.",
    },
    {
      question: "Why does it say there's a syntax error?",
      answer:
        "Prettier must parse the stylesheet before formatting it. If a brace is unbalanced, a block is unterminated, or a token is invalid for the chosen syntax, it reports the precise line and column so you can jump straight to the problem and fix it.",
    },
    {
      question: "Does beautifying change how my CSS behaves?",
      answer:
        "No. Formatting only changes whitespace, indentation, quoting style and where lines wrap: the selectors, properties and values are identical, so the rendered result is exactly the same. It's a purely cosmetic, lossless reformat.",
    },
    {
      question: "What's the difference between a beautifier and a minifier?",
      answer:
        "A beautifier adds indentation and line breaks to make CSS readable for humans and code review. A minifier does the opposite. It strips whitespace to shrink the file for production. This tool beautifies. Use a CSS minifier when you want the smallest possible bundle.",
    },
    {
      question: "Is there a limit on file size?",
      answer:
        "There's a generous character guard so the tab stays responsive on large stylesheets, and Prettier handles multi-thousand-line files comfortably. For extremely large concatenated bundles, format in sections if you notice any lag.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live CSS/SCSS/LESS beautifying with syntax auto-detection, 2/4/tab indent and configurable print width, precise line + column errors with jump-to-error, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added keyboard shortcuts (run, download, clear, undo/redo) with an in-tool shortcuts helper, plus curated CSS, SCSS and LESS sample snippets.",
    },
    {
      date: "2026-07-02",
      change:
        "Sharpened SCSS/LESS auto-detection and improved error messages for unbalanced braces and stray selector tokens.",
    },
  ],

  relatedTools: ["json-formatter", "yaml-to-json", "base64-encode", "jwt-decoder"],
};

export default cssBeautifier;
