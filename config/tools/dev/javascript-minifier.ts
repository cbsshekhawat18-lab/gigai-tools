import type { Tool } from "@/types";

/**
 * JavaScript Minifier: a terser-powered, in-browser JS compressor. It mangles
 * names, applies dead-code and constant-folding compression, and reports the
 * exact byte savings, while optionally preserving class and function names for
 * frameworks that depend on them. All copy is unique to JavaScript minification
 * - written for the queries developers type when they need to shrink a script
 * without a build step.
 */
const javascriptMinifier: Tool = {
  slug: "javascript-minifier",
  title: "JavaScript Minifier",
  description:
    "Minify and compress JavaScript in your browser with terser: mangle names, drop dead code and comments, keep class/function names when needed, and see the exact bytes saved. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Minimize2",
  accent: "amber",
  status: "live",
  createdAt: "2026-06-24",

  h1: "JavaScript Minifier: Compress & Mangle JS Online",
  tagline:
    "Paste a script and get production-grade minified JavaScript instantly. Powered by terser, with name mangling, dead-code elimination and live byte-savings, all client-side, nothing uploaded.",
  longDescription:
    "The GigAI JavaScript Minifier is a desktop-grade JS compressor that runs entirely in your browser on top of terser, the same engine that ships inside webpack, Rollup and Next.js. Paste, drop or type JavaScript and it strips comments and whitespace, shortens local variable and function names (mangling), and applies real structural compression (dead-code elimination, constant folding, boolean and conditional simplification) to produce the smallest equivalent script. Every run reports the before and after size in bytes and the exact percentage saved, so you can see what a minify pass buys before you ship it. Unlike a naïve whitespace stripper, terser understands the syntax tree, so it never breaks your code by removing a meaningful newline or comma. When you need runtime introspection (a class name for a decorator, a function name for logging or a DI container) toggle Keep class names or Keep function names and terser preserves them while still mangling everything else. Because it is powered by ES2015+ aware parsing, it handles modern syntax: arrow functions, template literals, optional chaining, classes and async/await. And because it all happens locally, no proprietary source, API key or unreleased feature ever leaves your machine. Close the tab and it is gone.",

  ctaText: "Minify JavaScript",

  keywords: [
    "javascript minifier",
    "minify javascript",
    "js minifier online",
    "compress javascript",
    "terser online",
    "javascript compressor",
    "minify js",
    "uglify javascript",
    "mangle javascript",
    "js code minifier",
    "shrink javascript",
    "minify es6",
  ],

  seo: {
    title:
      "JavaScript Minifier, Compress & Minify JS Online (terser) | GigAI Tools",
    description:
      "Free online JavaScript minifier powered by terser. Mangle names, remove dead code and comments, keep class/function names, and see exact bytes saved: 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Cpu",
      title: "Real terser compression",
      description:
        "Runs the same terser engine bundlers use (dead-code elimination, constant folding, conditional and boolean simplification) not a naïve whitespace strip, so output is genuinely smaller and never broken.",
    },
    {
      icon: "Shrink",
      title: "Name mangling",
      description:
        "Rewrites local variable and function names to single characters, reclaiming the bytes long identifiers cost. Toggle it off when you want readable-ish output without renaming.",
    },
    {
      icon: "ShieldHalf",
      title: "Keep class & function names",
      description:
        "Preserve class and function names for decorators, dependency injection, error stacks and logging, while still mangling everything else, the switches frameworks like Angular and NestJS need.",
    },
    {
      icon: "TrendingDown",
      title: "Exact byte savings",
      description:
        "Every run shows input size, output size and the precise percentage saved, so you can prove what a minify pass actually shaves off your script.",
    },
    {
      icon: "Sparkles",
      title: "Modern syntax aware",
      description:
        "Handles ES2015+ and beyond: arrow functions, classes, template literals, optional chaining, nullish coalescing and async/await: without choking on modern JavaScript.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Minification runs on your device with no network calls. Your unreleased source, keys and business logic are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Ship smaller scripts without a build",
      description:
        "Get bundler-quality output for a one-off script, a snippet or a CDN file without spinning up webpack, a config or a toolchain. Paste and copy.",
    },
    {
      title: "Cut load time and bandwidth",
      description:
        "Smaller JavaScript means faster parse, less bandwidth and better Core Web Vitals. The byte badge shows exactly how much lighter each file becomes.",
    },
    {
      title: "Keep frameworks working",
      description:
        "Preserve the class and function names your DI container, decorators or error reporting rely on, so aggressive minification never silently breaks reflection.",
    },
    {
      title: "Private by design",
      description:
        "Because it is fully client-side, you can safely minify proprietary or pre-launch code, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import JavaScript",
      description:
        "Paste into the editor, drag a .js file onto it, or click to browse. Or load the built-in sample to try it in one click.",
    },
    {
      title: "Choose your options",
      description:
        "Toggle mangling and compression, and turn on Keep class names or Keep function names if your framework relies on runtime name introspection.",
    },
    {
      title: "Read the savings",
      description:
        "The output pane updates live and the badges show input size, output size and the exact percentage saved.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the minified code, download it as a .min.js file, or share a link that reopens the tool with your source pre-loaded.",
    },
  ],

  formats: {
    input: ["JS", "MJS", "TXT"],
    output: ["JS"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Minify a standalone script",
      description:
        "Compress a small widget, analytics snippet or vanilla-JS component that has no build pipeline, then drop the .min.js straight onto your page or CDN.",
    },
    {
      audience: "Library author",
      title: "Produce a distributable build",
      description:
        "Generate a compact single-file build of a utility library for a quick release, keeping public class and function names intact for consumers.",
    },
    {
      audience: "Performance engineer",
      title: "Prove a minify win",
      description:
        "Paste a bundle chunk and read the exact bytes and percentage saved to justify enabling or tuning terser in the real build.",
    },
    {
      audience: "Educator / blogger",
      title: "Show minified vs. source",
      description:
        "Demonstrate what mangling and compression do to readable code, side by side, when teaching how JavaScript ships to production.",
    },
  ],

  troubleshooting: [
    {
      problem: "My decorators or dependency injection broke after minifying.",
      solution:
        "Frameworks that read class or function names at runtime (Angular, NestJS, some DI containers) break when those names are mangled. Turn on Keep class names and Keep function names: terser then preserves them while still compressing everything else.",
    },
    {
      problem: "It reports a syntax error on valid-looking code.",
      solution:
        "terser parses your JavaScript before minifying, so genuine syntax mistakes surface here. Check the reported message and line, and note that TypeScript, JSX or Flow-typed source must be transpiled to plain JavaScript first. This tool minifies JS, not TS or JSX.",
    },
    {
      problem: "The output isn't much smaller.",
      solution:
        "Code that is already compact, or that is mostly string data, has little to gain. Ensure both Mangle and Compress are on. The biggest wins come from long identifier names and removable dead code, which short or data-heavy scripts simply don't have.",
    },
    {
      problem: "Nothing happens on a very large paste.",
      solution:
        "Extremely large inputs are guarded to keep the tab responsive. Minify in sections, or run huge files through terser in your local build. The in-browser limit is generous but not unbounded.",
    },
  ],

  tips: [
    "Leave Mangle and Compress both on for the smallest output. They attack different kinds of waste (names vs. structure).",
    "Only enable Keep class/function names when something actually reads them at runtime. Keeping them costs bytes.",
    "Press Ctrl/Cmd+Enter to re-run and Ctrl/Cmd+S to download the .min.js.",
    "Minifying TypeScript or JSX? Transpile it to plain JavaScript first, terser expects standard JS.",
    "Check the Saved badge to decide whether a file is worth minifying at all before you wire it into a pipeline.",
  ],

  security:
    "Your JavaScript is parsed and minified entirely in your browser with terser running on your device. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely compress proprietary, unreleased or secret-bearing code. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my JavaScript uploaded to a server?",
      answer:
        "No. The entire minification runs locally in your browser using terser compiled to run on your device. Your source code never leaves your machine, so there is nothing for us to store, log or see. It is safe to minify proprietary or pre-launch scripts.",
    },
    {
      question: "What engine does this minifier use?",
      answer:
        "It uses terser, the industry-standard JavaScript minifier that powers the production builds of webpack, Rollup and Next.js. Because terser understands the abstract syntax tree, it compresses far more aggressively than whitespace strippers while never breaking working code.",
    },
    {
      question: "What is the difference between mangle and compress?",
      answer:
        "Mangle renames local variables and functions to short one- or two-character names to reclaim the bytes long identifiers cost. Compress rewrites the code structure, removing dead code, folding constants, simplifying conditionals and booleans. They target different waste, so leaving both on yields the smallest output.",
    },
    {
      question: "How do I stop it from breaking my class or function names?",
      answer:
        "Turn on Keep class names and/or Keep function names. terser will preserve those identifiers (which decorators, dependency injection, error stacks and logging often rely on) while still mangling and compressing everything else.",
    },
    {
      question: "Can it minify TypeScript, JSX or ES modules?",
      answer:
        "It minifies plain JavaScript, including ES module syntax (import/export) and modern ES2015+ features. TypeScript and JSX must be transpiled to standard JavaScript first, because terser is a minifier, not a compiler. It does not strip types or transform JSX.",
    },
    {
      question: "Will minifying change how my code behaves?",
      answer:
        "It shouldn't. terser preserves semantics for standard JavaScript. The rare exceptions involve code that depends on function or class names at runtime, or on specific whitespace in template strings. The first is solved by the keep-names toggles, and template-literal contents are always preserved verbatim.",
    },
    {
      question: "How much smaller will my file get?",
      answer:
        "It depends entirely on the code. Verbose source with long names, comments and dead branches can shrink dramatically. Already-compact or data-heavy scripts less so. The tool shows the exact input size, output size and percentage saved for your specific file after every run.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on large inputs. Most standalone scripts, snippets and single-file libraries are well within it. For very large files, minify in sections or use terser directly in your local build.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: terser-powered minification with mangle and compress toggles, keep class/function names, live byte-savings stats, drag-drop import, copy/download/share and keyboard shortcuts.",
    },
    {
      date: "2026-06-29",
      change:
        "Added a curated sample script and refined error reporting so terser parse failures surface a clear message and line.",
    },
    {
      date: "2026-07-02",
      change:
        "Improved keep-names behaviour so class and function names are preserved consistently across both the mangle and compress passes.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "html-formatter",
    "base64-encoder",
    "sql-formatter",
  ],
};

export default javascriptMinifier;
