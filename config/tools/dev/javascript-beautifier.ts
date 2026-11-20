import type { Tool } from "@/types";

/**
 * JavaScript Beautifier; a Prettier-powered code formatter that runs entirely
 * in the browser. It pretty-prints JavaScript, TypeScript, JSX and TSX with the
 * exact style knobs developers actually argue about: semicolons, quote style,
 * tab width, print width and trailing commas, with true syntax-aware output
 * (not naive indentation) and precise line/column errors for broken input. All
 * copy is unique to beautifying JS/TS and written to rank for the queries
 * people type when they paste minified bundle code and need it readable again.
 */
const javascriptBeautifier: Tool = {
  slug: "javascript-beautifier",
  title: "JavaScript Beautifier",
  description:
    "Beautify and format JavaScript, TypeScript, JSX and TSX in your browser with Prettier, control semicolons, quotes, tab width, print width and trailing commas. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Braces",
  accent: "amber",
  status: "live",
  createdAt: "2026-06-24",

  h1: "JavaScript Beautifier, Format JS, TS, JSX & TSX Online",
  tagline:
    "Paste minified or messy JavaScript and get clean, readable, syntax-aware code instantly. Real Prettier options (semicolons, single vs double quotes, tab width, print width and trailing commas) all client-side, nothing uploaded.",
  longDescription:
    "The GigAI JavaScript Beautifier is a desktop-grade code formatter that reformats JavaScript, TypeScript, JSX and TSX using Prettier's real parser. Not a regex that just adds newlines. Paste a one-line minified bundle, an unreadable snippet from a Stack Overflow answer, or a diff-noisy file, and it rebuilds the code with consistent indentation, spacing and line wrapping in a fraction of a second. Unlike toy beautifiers that only re-indent, this understands the syntax tree, so template literals, arrow functions, JSX, decorators, optional chaining and modern ES2022+ features all come out correct. You get the exact style controls teams fight over in code review: semicolons on or off, single or double quotes, 2 / 4 / 8-space or tab indentation, a configurable print width that decides where long lines wrap, and trailing-comma style (none, ES5 or all). It auto-detects TypeScript and JSX so you rarely have to pick a language, but you can override it. When the input has a genuine syntax error, it surfaces the precise line and column Prettier choked on so you can fix it rather than staring at a silent blank pane. Everything happens locally in your browser, your proprietary source, API keys embedded in config, or client code is never uploaded, logged or seen. Close the tab and it's gone.",

  ctaText: "Beautify JavaScript",

  keywords: [
    "javascript beautifier",
    "js beautifier",
    "format javascript online",
    "javascript formatter",
    "typescript formatter",
    "prettier online",
    "beautify js",
    "unminify javascript",
    "jsx formatter",
    "tsx beautifier",
    "js pretty print",
    "code beautifier",
  ],

  seo: {
    title:
      "JavaScript Beautifier: Format JS / TS / JSX / TSX Online (Prettier) | GigAI Tools",
    description:
      "Free online JavaScript beautifier powered by Prettier. Format JS, TypeScript, JSX and TSX with semicolon, quote, tab-width, print-width and trailing-comma options, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Braces",
      title: "Real Prettier, not re-indenting",
      description:
        "Code is parsed into a full syntax tree and re-printed by Prettier, so template literals, JSX, decorators, optional chaining and modern ES2022+ syntax all format correctly: where naive beautifiers break.",
    },
    {
      icon: "SlidersHorizontal",
      title: "The options teams argue about",
      description:
        "Toggle semicolons, switch single vs double quotes, set 2 / 4 / 8-space or tab indentation, pick a print width for wrapping, and choose trailing-comma style, none, ES5 or all.",
    },
    {
      icon: "ScanSearch",
      title: "Auto-detect language",
      description:
        "It reads your snippet and picks JavaScript, TypeScript, JSX or TSX automatically from syntax cues, with a manual override when you want to force a specific parser.",
    },
    {
      icon: "MapPin",
      title: "Precise syntax errors",
      description:
        "When the input won't parse, the error banner shows the exact line and column Prettier rejected and lets you jump straight to it, instead of a silent, empty output pane.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Formatting runs on every keystroke with a smart debounce and auto-cancels stale runs, so the output stays in sync without a 'Beautify' button dance.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Prettier runs on your device via a lazy-loaded standalone build. Your source (proprietary logic, embedded keys, client code) is never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Turn minified bundles back into readable code",
      description:
        "Paste a one-line production bundle or an obfuscated snippet and get properly indented, wrapped, readable code you can actually reason about and debug.",
    },
    {
      title: "End style debates in code review",
      description:
        "Match your team's Prettier config (semicolons, quotes, width, trailing commas) so formatting is consistent and diffs show real logic changes, not whitespace churn.",
    },
    {
      title: "Format TypeScript and JSX without a toolchain",
      description:
        "No local Node install, ESLint config or editor plugin needed: beautify TS and JSX in a browser tab, ideal on a locked-down machine or a colleague's laptop.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can safely beautify source that contains secrets, internal API shapes or unreleased features, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import your code",
      description:
        "Paste into the left editor, drag a .js / .ts / .jsx / .tsx file onto it, or click to browse. Or load a built-in sample to try it instantly.",
    },
    {
      title: "Pick a language (or let it auto-detect)",
      description:
        "Leave it on Auto and it infers JS, TS, JSX or TSX from your code, or force a specific parser with the language control.",
    },
    {
      title: "Set your style options",
      description:
        "Choose semicolons, single or double quotes, indentation, print width and trailing-comma style. Everything re-runs live as you change options.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the beautified output, download it as a file, or share a link that reopens the tool with your code pre-loaded.",
    },
  ],

  formats: {
    input: ["JS", "TS", "JSX", "TSX", "TXT"],
    output: ["JS", "TS", "JSX", "TSX"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Unminify a production bundle",
      description:
        "Paste a minified vendor or app bundle from your network tab to restore indentation and line breaks, so you can trace a runtime bug back to readable code.",
    },
    {
      audience: "Full-stack developer",
      title: "Match a team's Prettier config",
      description:
        "Dial in the exact semicolon, quote, width and trailing-comma settings your repo enforces, so pasted snippets land in a consistent, review-ready style.",
    },
    {
      audience: "Open-source contributor",
      title: "Clean a snippet before a PR",
      description:
        "Beautify a quick fix written in a text box or issue comment before dropping it into the codebase, so it passes CI formatting checks first time.",
    },
    {
      audience: "Educator / student",
      title: "Make example code legible",
      description:
        "Reformat a cramped one-liner or a dense example into clearly indented code that's easier to read, teach from and understand.",
    },
  ],

  troubleshooting: [
    {
      problem: "It reports a syntax error but the code runs fine.",
      solution:
        "Prettier needs the code to parse as a complete unit. A stray unbalanced brace, an unterminated string or template literal, or JSX in a file detected as plain JS can all trip it. Try forcing JSX/TSX with the language control, or wrap a bare fragment so it parses.",
    },
    {
      problem: "My TypeScript types were stripped or flagged.",
      solution:
        "If the language is set to JavaScript, TS-only syntax (type annotations, interfaces, enums) won't parse. Switch the language to TypeScript or TSX, or leave it on Auto so the detector picks the right parser.",
    },
    {
      problem: "Lines aren't wrapping where I expect.",
      solution:
        "Prettier wraps based on print width, not a hard character cap. It keeps expressions readable rather than truncating mid-token. Lower the print-width value to encourage more wrapping, or raise it to keep more on one line.",
    },
    {
      problem: "Nothing happens on a very large paste.",
      solution:
        "Extremely large inputs are guarded to keep the tab responsive. Format the file in sections, or trim it first. The limit is generous but not unbounded.",
    },
  ],

  tips: [
    "Leave the language on Auto. It detects TS and JSX from syntax so you rarely need to choose manually.",
    "Lower the print width (e.g. 60–80) to force more line wrapping, or raise it (100–120) to keep more code on a single line.",
    "Turn semicolons off and quotes to single to match a common StandardJS-style config in one step.",
    "Press Ctrl/Cmd+Enter to re-run instantly, and Ctrl/Cmd+S to download the beautified output.",
    "Set trailing commas to 'all' for cleaner git diffs when adding items to arrays and argument lists.",
  ],

  security:
    "Your code is parsed and reformatted entirely in your browser by a lazy-loaded standalone build of Prettier. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely beautify source containing secrets, internal API shapes or unreleased features. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my code uploaded to a server?",
      answer:
        "No. All formatting happens locally in your browser using a standalone build of Prettier that loads on demand. Your source never leaves your device, so there is nothing for us to store, log or see. It is safe to beautify proprietary or secret-containing code.",
    },
    {
      question: "Does it format TypeScript and JSX, or only plain JavaScript?",
      answer:
        "All of them. It supports JavaScript, TypeScript, JSX and TSX using Prettier's babel and typescript parsers. Leave the language on Auto and it detects the right one from your code's syntax, or force a specific parser with the language control.",
    },
    {
      question: "Can I use it to unminify or de-obfuscate JavaScript?",
      answer:
        "Yes for unminifying: paste minified, one-line code and it restores indentation, spacing and line breaks so the code is readable again. Note it does not rename mangled variables, obfuscated short names like a, b, c stay as they are, since Prettier only reformats layout, not identifiers.",
    },
    {
      question: "What options can I control?",
      answer:
        "Semicolons (on/off), quote style (single or double), indentation (2, 4 or 8 spaces, or tabs), print width (where long lines wrap), and trailing-comma style (none, ES5 or all). Change any option and the output re-formats live.",
    },
    {
      question: "How is this different from a basic beautifier?",
      answer:
        "Basic beautifiers just re-indent text with rules that break on modern syntax. This tool parses your code into a full abstract syntax tree with Prettier and re-prints it, so template literals, arrow functions, JSX, decorators, optional chaining and ES2022+ features all format correctly and consistently.",
    },
    {
      question: "Why do I get a syntax error on valid-looking code?",
      answer:
        "Prettier must parse the whole snippet. Common causes are an unbalanced brace or parenthesis, an unterminated string or template literal, TS-only syntax while the language is set to JavaScript, or JSX while the parser is plain JS. The error banner shows the exact line and column so you can fix it, or switch the language to TSX and re-run.",
    },
    {
      question: "Does it change what my code does?",
      answer:
        "No. Beautifying only changes whitespace, line breaks and stylistic punctuation like quotes and trailing commas. It never alters logic, values or behaviour. The formatted output is semantically identical to your input.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on large files. Most real-world modules and snippets are well within it. For extremely large bundles, format in sections or trim the input first.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, Prettier-powered beautify for JS/TS/JSX/TSX with semicolon, quote, tab-width, print-width and trailing-comma options, live formatting, precise line/column errors, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-29",
      change:
        "Added automatic language detection (JS / TS / JSX / TSX) with manual override, plus curated code samples for the empty state.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined error messages for unterminated strings and JSX-in-JS mismatches, and added keyboard shortcuts with an in-tool helper.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "json-to-typescript",
    "jwt-decoder",
    "base64-encode",
  ],
};

export default javascriptBeautifier;
