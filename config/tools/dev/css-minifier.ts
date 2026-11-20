import type { Tool } from "@/types";

/**
 * CSS Minifier, a browser-only CSS compressor built on csso. It goes beyond
 * whitespace stripping: it merges duplicate selectors, collapses shorthand,
 * removes dead rules and shortens colors, then reports the exact byte savings.
 * Every field below is written uniquely for CSS-minification search intent so
 * the page reads like an independent SaaS product, not a clone of a formatter.
 */
const cssMinifier: Tool = {
  slug: "css-minifier",
  title: "CSS Minifier",
  description:
    "Minify and compress CSS in your browser with csso. Merge duplicate rules, collapse shorthand and shorten colors, then see the exact bytes and percentage saved. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Minimize2",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "CSS Minifier: Compress & Optimize CSS Online",
  tagline:
    "Paste your stylesheet and get production-ready, minified CSS instantly. Powered by csso, it doesn't just strip whitespace. It merges duplicate selectors, collapses shorthand and shortens colors, then shows exactly how many bytes you saved. All client-side, nothing uploaded.",
  longDescription:
    "The GigAI CSS Minifier is a desktop-grade CSS compressor that runs entirely in your browser on top of the csso optimizer. Unlike naive minifiers that only delete spaces and newlines, csso performs true structural optimisation: it merges rules with identical selectors, groups selectors that share the same declarations, removes overridden and duplicate properties, collapses longhand into shorthand where it is provably safe, shortens hex colors and other values, and drops empty rulesets and comments. The result is the smallest byte-for-byte equivalent stylesheet, and the tool shows you the original size, the minified size and the exact percentage saved so a build-step decision takes seconds. You can optionally keep the safer whitespace-only behaviour by turning restructuring off, or preserve licence and attribution comments. Everything is live as you type, with drag-and-drop or paste import, one-click copy and download of a.min.css file, undo/redo history, keyboard shortcuts and shareable links. Because csso executes locally in your tab, your stylesheets, including unreleased design systems and client work, are never uploaded, logged or seen by anyone. Close the tab and it's gone.",

  ctaText: "Minify CSS",

  keywords: [
    "css minifier",
    "minify css",
    "css compressor",
    "compress css online",
    "css optimizer",
    "csso online",
    "minify css online",
    "css minify tool",
    "shrink css file",
    "reduce css size",
    "css beautifier minifier",
    "optimize stylesheet",
  ],

  seo: {
    title: "CSS Minifier: Compress & Optimize CSS Online (csso) | GigAI Tools",
    description:
      "Free online CSS minifier powered by csso. Merge duplicate rules, collapse shorthand and shorten colors, and see exact bytes saved, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Combine",
      title: "Structural optimisation, not just whitespace",
      description:
        "csso merges duplicate selectors, groups shared declarations, drops overridden properties and empty rules, and collapses shorthand: savings a space-stripper can never reach.",
    },
    {
      icon: "Scale",
      title: "Exact bytes & percentage saved",
      description:
        "See the original size, the minified size and the precise percentage shaved off, measured in real UTF-8 bytes so it matches what ships over the wire.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Restructure & comment controls",
      description:
        "Toggle aggressive restructuring off for safe whitespace-only minification, or keep licence and attribution comments intact when you need them.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Minification runs on every keystroke with a smart debounce, so the output pane and size badges stay in sync without hunting for a button.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste or import",
      description:
        "Drag a .css file onto the editor, paste from the clipboard, or click to browse. Copy, download a .min.css, or share a link to the result in one click.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "csso runs on your device via a lazy-loaded module. No stylesheet is uploaded, stored or logged, safe for unreleased design systems and client work.",
    },
  ],

  benefits: [
    {
      title: "Ship smaller stylesheets",
      description:
        "A smaller CSS file means faster first paint and less bandwidth. The before/after badge shows the exact win before you wire it into a build step.",
    },
    {
      title: "Skip the build config",
      description:
        "Need a quick minified stylesheet without spinning up PostCSS or a bundler? Paste, copy the result, and move on. No toolchain, no install.",
    },
    {
      title: "Safe when you need it",
      description:
        "Turn restructuring off for a conservative, whitespace-only pass when a stylesheet relies on source order or you want a minimal, auditable diff.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can minify proprietary or unreleased CSS with confidence, none of it ever leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import CSS",
      description:
        "Paste into the left editor, drag a .css file onto it, or click to browse. Or load the built-in sample to try it in one click.",
    },
    {
      title: "Choose your options",
      description:
        "Leave restructuring on for maximum compression, or turn it off for a safe whitespace-only pass. Optionally keep comments. Everything re-runs live.",
    },
    {
      title: "Check the savings",
      description:
        "Read the original size, minified size and percentage saved in the badges above the output to confirm the win.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the minified CSS, download it as a .min.css file, or share a link that reopens the tool with your stylesheet pre-loaded.",
    },
  ],

  formats: {
    input: ["CSS", "TXT"],
    output: ["CSS", "MIN.CSS"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Ship a hand-written stylesheet",
      description:
        "Minify a component or utility stylesheet before dropping it into production when there's no bundler in the loop, and confirm the byte savings first.",
    },
    {
      audience: "Web performance engineer",
      title: "Trim critical CSS",
      description:
        "Compress an above-the-fold critical-CSS block to inline in the <head>, keeping the HTML payload as small as possible for a faster first paint.",
    },
    {
      audience: "Email developer",
      title: "Compact email CSS",
      description:
        "Squeeze inline-ready styles for HTML email where every byte and every duplicate rule counts against client size limits.",
    },
    {
      audience: "Agency / freelancer",
      title: "Optimize a client handoff",
      description:
        "Deliver a minified stylesheet alongside the source without exposing unreleased work to a third-party server.",
    },
  ],

  troubleshooting: [
    {
      problem: "My layout broke after minifying.",
      solution:
        "Aggressive restructuring can merge or reorder rules in ways that expose an existing specificity or source-order dependency. Turn restructuring off for a whitespace-only pass, then re-test. The diff will be far smaller and safer.",
    },
    {
      problem: "My licence comment was removed.",
      solution:
        "By default comments are stripped. Enable 'Keep comments' to preserve licence and attribution blocks. Note that only comments starting with /*! are treated as important by most tooling.",
    },
    {
      problem: "The output looks the same size as the input.",
      solution:
        "Your CSS may already be minified, or it might be tiny. The size badges show the exact before/after bytes. If the percentage saved is near zero there simply isn't more to remove without changing behaviour.",
    },
    {
      problem: "It reports a parse error on valid-looking CSS.",
      solution:
        "csso needs syntactically valid CSS. A stray unclosed brace, an unterminated string or an at-rule the parser doesn't recognise can trip it, the error message points at the problem so you can fix and re-run.",
    },
  ],

  tips: [
    "Leave restructuring on for the smallest possible output. Turn it off only when a stylesheet depends on source order.",
    "Press Ctrl/Cmd+Enter to re-run instantly and Ctrl/Cmd+S to download the minified .min.css.",
    "Use the percentage-saved badge to justify adding a minify step to your build. The number is the real wire savings.",
    "Keep licence comments by starting them with /*! and enabling 'Keep comments'.",
    "Minify critical CSS separately and inline it in the <head> for the fastest first paint.",
  ],

  security:
    "Your CSS is parsed and minified entirely in your browser by a locally-loaded csso module. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely minify proprietary design systems or client stylesheets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my CSS uploaded to a server?",
      answer:
        "No. All parsing and minification happen locally in your browser using the csso optimizer, loaded on demand into your tab. Your stylesheet never leaves your device, so there is nothing for us to store, log or see. It is safe to minify proprietary or unreleased CSS.",
    },
    {
      question: "What does the CSS minifier actually do?",
      answer:
        "It uses csso to produce the smallest behaviourally-equivalent stylesheet. That means removing whitespace, comments and empty rules, merging duplicate selectors and rules that share declarations, dropping overridden properties, collapsing longhand into shorthand where safe, and shortening values like hex colors. You also see the exact bytes and percentage saved.",
    },
    {
      question: "Is minified CSS the same as the original?",
      answer:
        "With restructuring off it is a whitespace-and-comment-only compression that renders identically. With restructuring on, csso makes only transformations it considers behaviour-preserving, but very specificity- or source-order-dependent stylesheets can be affected, so always test the result, and use the restructuring toggle if you need a conservative pass.",
    },
    {
      question: "What's the difference between a minifier and a compressor like gzip?",
      answer:
        "Minification rewrites the CSS text itself into a smaller equivalent form, which is what this tool does. Gzip/Brotli compression happens on top, at transport time, on the server. They stack: minified CSS is smaller both on disk and after gzip, so you should do both for best results.",
    },
    {
      question: "Can I keep my licence or copyright comments?",
      answer:
        "Yes. Comments are removed by default for maximum savings, but enabling 'Keep comments' preserves them. As a convention, mark comments you always want kept with /*! at the start, which most build tools treat as important.",
    },
    {
      question: "How do I un-minify (beautify) CSS again?",
      answer:
        "This tool focuses on making CSS smaller. To pretty-print a minified stylesheet back into a readable, indented form, use the CSS/SCSS formatter. It re-adds line breaks and indentation. Minification is lossy for formatting, so the original spacing can't be recovered exactly.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on very large stylesheets. Typical component libraries and framework CSS files are well within it. For enormous concatenated bundles, minify per-file or trim first.",
    },
    {
      question: "Why did my percentage saved come out negative or zero?",
      answer:
        "If your input is already minified there may be nothing left to remove, giving a near-zero saving. It is essentially never larger. The size badges always show the true before/after byte counts so you can verify the result at a glance.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live csso minification, restructuring and keep-comments toggles, before/after byte + percentage-saved stats, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added keyboard shortcuts (run, download, clear, undo/redo) with an in-tool shortcuts helper and a curated sample stylesheet for the empty state.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined parse-error messages and improved the size badges to distinguish structural savings from whitespace-only compression.",
    },
  ],

  relatedTools: ["html-formatter", "json-formatter", "sql-formatter", "xml-formatter"],
};

export default cssMinifier;
