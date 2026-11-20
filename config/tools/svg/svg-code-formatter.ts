import type { Tool } from "@/types";

/**
 * SVG Code Formatter, a clean-code tool for SVG markup. Where the Optimizer
 * shrinks bytes and the Beautifier is framed around pretty output, this tool is
 * specifically about MACHINE-CONSISTENT source: deterministic indentation,
 * one-element-per-line structure and a stable, diff-friendly layout so hand-
 * edited SVGs read like the rest of your codebase. It leans on
 * `prettifySvg` (SVGO's non-destructive pretty pass, with a dependency-free
 * indenter fallback) so no path data, IDs, gradients or a11y metadata are ever
 * dropped: only the whitespace changes. Every string is written for the exact
 * queries developers type when a one-line minified SVG lands in a PR and needs
 * to become reviewable, and none of it is shared with the Optimizer or
 * Beautifier copy.
 */
const svgCodeFormatter: Tool = {
  slug: "svg-code-formatter",
  title: "SVG Code Formatter",
  description:
    "Format and indent SVG source in your browser, turn a minified one-liner into clean, diff-friendly markup with consistent indentation and one element per line. Nothing is uploaded, and no data is removed.",
  category: "svg-tools",
  group: "Optimize",
  icon: "Code",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-18",

  h1: "SVG Code Formatter, Indent & Clean Up SVG Source Online",
  tagline:
    "Paste a minified or messy SVG and get back clean, consistently indented markup with one element per line, readable, reviewable and diff-friendly. It only touches whitespace, so paths, IDs, gradients and titles are preserved exactly. Runs entirely in your browser.",
  longDescription:
    "The GigAI SVG Code Formatter reformats SVG markup into clean, predictable source code without changing a single byte of meaning. Minified SVGs (the kind an icon pipeline, a bundler or a copy-paste from the network tab produces) arrive as an unreadable single line, and once one lands in a pull request nobody can review it or spot a stray attribute. This tool re-indents that markup deterministically: every element on its own line, children indented under their parents, attributes left intact and in place, so the result reads like code a human wrote. Under the hood it uses SVGO's non-destructive prettify pass (with a dependency-free indenter fallback when the engine can't load), which means it strips comments and normalizes whitespace but never removes path data, IDs, gradients, clip-paths, filters, SMIL animation or the <title>/<desc> that assistive tech relies on. You control the indent unit (two spaces, four spaces or tabs) so the output matches your project's style guide and produces the smallest possible diff when you commit it. A live checkerboard preview renders the formatted SVG beside the code so you can confirm at a glance that formatting changed the layout and nothing else. Because everything runs client-side, minified brand assets, internal icon sets and unreleased marks are formatted on your machine and never uploaded, stored or logged. It is the SVG equivalent of running Prettier on a file before you open the PR: a clean-code pass, not a compressor.",

  ctaText: "Format SVG",

  keywords: [
    "svg code formatter",
    "format svg online",
    "indent svg",
    "svg formatter",
    "clean up svg markup",
    "svg indentation",
    "readable svg",
    "svg prettier",
    "reformat svg source",
  ],

  seo: {
    title: "SVG Code Formatter, Indent & Pretty-Print SVG Online | GigAI Tools",
    description:
      "Free online SVG code formatter. Turn minified SVG into clean, indented, diff-friendly source with 2-space, 4-space or tab indentation. Whitespace-only. No data removed. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "IndentIncrease",
      title: "Deterministic indentation",
      description:
        "Every element lands on its own line with children indented under their parents, so a minified one-liner becomes a clean tree you can actually read, review and hand-edit.",
    },
    {
      icon: "AlignLeft",
      title: "2-space, 4-space or tabs",
      description:
        "Pick the indent unit that matches your project's style guide. The formatter reflows the whole document to it, so your committed SVG lines up with everything else in the repo.",
    },
    {
      icon: "ShieldCheck",
      title: "Whitespace-only, data-safe",
      description:
        "Built on SVGO's non-destructive prettify pass. It normalizes whitespace and drops comments, but never touches path data, IDs, gradients, filters, animation or title/desc.",
    },
    {
      icon: "GitCompare",
      title: "Diff-friendly output",
      description:
        "One element per line means a change to a single attribute shows up as a single-line diff in code review: instead of the whole SVG appearing to change because it was one long string.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the code",
      description:
        "A checkerboard preview renders the formatted result next to the source, so you can confirm formatting changed only the layout and the artwork is byte-for-byte identical.",
    },
    {
      icon: "Undo2",
      title: "Undo / redo & samples",
      description:
        "Full undo and redo on your source, one-click sample SVGs to try it instantly, copy, download and a shareable link that reopens the tool with your markup pre-loaded.",
    },
  ],

  benefits: [
    {
      title: "Make minified SVGs reviewable",
      description:
        "A one-line SVG in a pull request is impossible to review. Format it first and every element, attribute and nesting level becomes visible, so a teammate can actually catch a mistake.",
    },
    {
      title: "Match your codebase style",
      description:
        "Choosing 2-space, 4-space or tab indentation means your committed SVGs read like the rest of your source, not like a machine-generated blob dropped into the tree.",
    },
    {
      title: "Safer than a minifier",
      description:
        "This is a formatting pass, not an optimizer: it changes whitespace only, so there is no precision setting to accidentally clip a curve and no ID stripping to break a sprite.",
    },
    {
      title: "Clean diffs, forever",
      description:
        "Once an SVG is formatted one element per line, future edits produce tight, focused diffs: a single changed attribute is a single changed line, not a rewritten string.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste minified or messy SVG markup, drop a .svg file onto the workspace, or click Import. Load a sample if you just want to see the formatting in action.",
    },
    {
      title: "Choose your indentation",
      description:
        "Pick 2 spaces, 4 spaces or tabs to match your project. The whole document reflows live to the unit you select.",
    },
    {
      title: "Confirm in the preview",
      description:
        "Glance at the checkerboard preview to verify the artwork is unchanged, only the source layout should differ.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the formatted SVG to your clipboard, download it as a .svg, or share a link that reopens the tool with your markup ready to go.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Unminify an SVG for a PR",
      description:
        "A bundler emitted a minified icon and it needs a hand tweak. Format it to a readable tree, make the edit, and commit clean source your reviewers can actually read.",
    },
    {
      audience: "Design systems engineer",
      title: "Normalize an icon library",
      description:
        "Run every icon through the same indent unit so your entire SVG set shares one consistent layout. No mix of tabs, four-space and single-line files in the same folder.",
    },
    {
      audience: "Open-source maintainer",
      title: "Keep SVG diffs tight",
      description:
        "Format contributed SVGs to one element per line so future changes show up as focused, line-level diffs instead of an entire re-serialized string.",
    },
    {
      audience: "Technical writer",
      title: "Make markup readable for docs",
      description:
        "Paste a minified SVG into the formatter to get clean, indented source you can drop into documentation or a code sample without a wall-of-text one-liner.",
    },
  ],

  troubleshooting: [
    {
      problem: "My comments disappeared after formatting.",
      solution:
        "That's expected, the prettify pass removes comments while it normalizes whitespace. If you need to keep a specific note, add it back after formatting, or keep the original file alongside the formatted one.",
    },
    {
      problem: "The file got a little smaller / larger, not just reformatted.",
      solution:
        "Formatting adds indentation and newlines (usually a small size increase) and removes comments and redundant whitespace (a decrease). No path data, IDs or elements are removed: only whitespace and comments change. If you want smaller bytes, run it through the SVG Optimizer instead.",
    },
    {
      problem: "It says the input doesn't contain an <svg> element.",
      solution:
        "The formatter needs real SVG markup that includes an <svg> tag. If you pasted a data-URI or a base64 blob, decode it to raw SVG first, or import the .svg file directly.",
    },
    {
      problem: "Attributes didn't reorder the way I expected.",
      solution:
        "This is a formatter, not a linter. It re-indents structure and leaves your attributes intact and in place so the change stays whitespace-only and predictable. It won't reorder or rename attributes.",
    },
  ],

  tips: [
    "Match the indent unit to your project (2 spaces is the common web default) so committed SVGs line up with the rest of your source.",
    "Format an SVG before hand-editing it. A readable tree makes it far easier to find the right path or attribute to change.",
    "Formatting produces clean line-level diffs. Commit the formatted version once and future edits stay reviewable.",
    "Use the checkerboard preview to confirm formatting was whitespace-only and the artwork is unchanged before you copy.",
    "If your goal is smaller files rather than readable source, reach for the SVG Optimizer: formatting is a clean-code pass, not a compressor.",
  ],

  security:
    "Your SVG is parsed and formatted entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely format unreleased logos, brand marks and internal icon sets. When the engine can't load, a built-in dependency-free indenter runs locally too. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. All parsing and formatting happen locally in your browser (with a built-in fallback indenter if the engine can't load). Your file never leaves your device, so there is nothing to store, log or see. It is safe to format confidential logos and internal icon sets.",
    },
    {
      question: "Does formatting change how my SVG looks?",
      answer:
        "No. Formatting only changes whitespace and removes comments. It never touches path data, coordinates, IDs, gradients, filters or animation. The artwork renders byte-for-byte identical, and the live preview lets you confirm that at a glance.",
    },
    {
      question: "What's the difference between this and the SVG Optimizer?",
      answer:
        "The Optimizer shrinks bytes: it rounds coordinates, collapses paths, can strip IDs and metadata, and there are settings that can subtly change the artwork. The Formatter is a clean-code pass. It only re-indents your source and removes comments, so nothing about the graphic changes. Use the Formatter for readable, reviewable source. Use the Optimizer for smaller files.",
    },
    {
      question: "Can I format with tabs instead of spaces?",
      answer:
        "Yes. You can choose 2-space, 4-space or tab indentation, and the whole document reflows live to match. Pick whatever your project's style guide uses so the committed SVG lines up with the rest of your code.",
    },
    {
      question: "Will it remove my comments?",
      answer:
        "Yes, the prettify pass removes comments while it normalizes whitespace. If you need to keep a specific comment, add it back after formatting. Everything else (paths, IDs, gradients, title/desc) is preserved exactly.",
    },
    {
      question: "Can it un-minify a one-line SVG?",
      answer:
        "That's exactly what it's for. Paste a minified single-line SVG and the formatter expands it into a clean tree with one element per line and consistent indentation, so it becomes readable and reviewable again.",
    },
    {
      question: "Does it reorder or rename my attributes?",
      answer:
        "No. This is a formatter, not a linter. It re-indents the structure and leaves your attributes intact and in place, which keeps the change strictly whitespace-only and produces the smallest, most predictable diff.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There's a generous guard to keep the tab responsive. Typical icons, logos and illustrations format instantly. For an unusually large single SVG it may take a moment to reflow, but it stays entirely in your browser.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, client-side SVG formatting with 2-space / 4-space / tab indentation, whitespace-only prettify, live checkerboard preview, copy, download, undo/redo, sample SVGs and shareable links.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a dependency-free indenter fallback so formatting keeps working when the engine chunk can't load, plus keyboard shortcuts for undo, redo, indent switching and clear.",
    },
    {
      date: "2026-06-30",
      change:
        "Clarified in-tool that formatting is whitespace-only and preserves all data, with guidance pointing to the SVG Optimizer when smaller bytes are the goal.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-minifier",
    "svg-viewer",
    "svg-to-react",
    "json-formatter",
  ],
};

export default svgCodeFormatter;
