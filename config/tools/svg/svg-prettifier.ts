import type { Tool } from "@/types";

/**
 * SVG Prettifier, the readability companion to the Optimizer. Where the
 * Optimizer crushes markup down to the smallest possible bytes, this tool does
 * the opposite: it takes a minified, single-line or inconsistently-indented SVG
 * and re-expands it into clean, human-readable source with one element per line
 * and a consistent indent you control. It leans on SVGO's prettify path (with a
 * dependency-free indenter fallback) so nesting is honoured and nothing is
 * mangled. Every string below targets the exact queries developers type when
 * they inherit an unreadable one-liner and need to diff it, review it, or hand
 * it to a teammate; nothing is shared with the Optimizer copy, and no claim
 * outruns what the client-side `prettifySvg` engine actually does.
 */
const svgPrettifier: Tool = {
  slug: "svg-prettifier",
  title: "SVG Prettifier",
  description:
    "Beautify minified or single-line SVG source into clean, indented, human-readable markup, one element per line with a tab or space width you choose. Runs entirely in your browser. Nothing is uploaded.",
  category: "svg-tools",
  group: "Optimize",
  icon: "AlignLeft",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-18",

  h1: "SVG Prettifier: Beautify & Format SVG Code Online",
  tagline:
    "Paste a minified or single-line SVG and get it back as clean, indented source: one node per line, consistent nesting, and a live preview so you can confirm the artwork is untouched. Runs in your browser, never uploaded.",
  longDescription:
    "The GigAI SVG Prettifier is a desktop-grade code formatter for SVG markup that runs entirely in your browser. Minified SVGs (the kind SVGO, a build pipeline, or a data-URI leaves behind) are impossible to read: everything is crammed onto a single line, nesting is invisible, and a one-character diff shows up as the whole file changing. This tool reverses that. Paste the markup, drop a.svg file, or import one, and it re-indents the source with a consistent width you control (2, 4 or tab), puts each element on its own line, preserves the nesting of groups, defs, gradients and clip-paths, and hands back source you can actually read, review and diff. It uses SVGO's prettify path where available and a dependency-free indenter as a fallback, so it keeps working even offline. Crucially, prettifying is about presentation, not data: it does not round coordinates, merge paths, or strip attributes, so the rendered artwork is identical, and the live checkerboard preview proves it, sitting right beside the formatted code. Because everything happens on your device, confidential logos, unreleased brand marks and internal icon sets never leave the machine, close the tab and every trace is gone. Reach for the Prettifier when you need to understand an inherited SVG, produce a clean diff in a pull request, teach the structure of a graphic, or simply un-minify a file before editing it by hand.",

  ctaText: "Prettify SVG",

  keywords: [
    "svg prettifier",
    "beautify svg",
    "svg beautifier",
    "unminify svg",
    "svg pretty print",
    "prettify svg code",
    "svg indenter",
    "make svg readable",
  ],

  seo: {
    title: "SVG Prettifier, Beautify & Format SVG Code Online | GigAI Tools",
    description:
      "Free online SVG prettifier and formatter. Beautify minified or single-line SVG into clean, indented, readable markup with a chosen indent width and a live preview, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "AlignLeft",
      title: "One element per line, cleanly nested",
      description:
        "Explodes a crammed single-line SVG into readable source: every tag on its own line, groups, defs and gradients indented to show the tree, so structure is obvious at a glance.",
    },
    {
      icon: "Indent",
      title: "Choose your indent width",
      description:
        "Format with a 2-space, 4-space or tab indent to match your project's style guide. Change it and the code re-formats live. No config file, no Prettier plugin to wire up.",
    },
    {
      icon: "ShieldCheck",
      title: "Formats source, never touches data",
      description:
        "Prettifying is presentation-only: coordinates aren't rounded, paths aren't merged, attributes aren't stripped. The bytes grow but the rendered artwork is byte-for-byte identical.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the code",
      description:
        "A checkerboard preview renders the formatted SVG next to the source, so you can confirm at a glance that beautifying changed only the whitespace, never the graphic.",
    },
    {
      icon: "GitCompareArrows",
      title: "Diff-friendly output",
      description:
        "Consistent indentation and one-node-per-line make SVGs review-able in a pull request, a real change stands out instead of being buried in a single reformatted line.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side, works offline",
      description:
        "Formatting happens on your device using SVGO's prettify path with a dependency-free indenter fallback. Nothing is uploaded, stored or logged, safe for confidential brand assets.",
    },
  ],

  benefits: [
    {
      title: "Read and edit inherited SVGs",
      description:
        "Un-minify a file someone else shipped so you can actually find the path, gradient or group you need to change, then re-optimize it when you're done.",
    },
    {
      title: "Clean diffs in code review",
      description:
        "Formatted, one-node-per-line SVGs turn an unreviewable one-line blob into a diff a teammate can actually read, so real changes are visible in the pull request.",
    },
    {
      title: "No install, no config, no upload",
      description:
        "Get Prettier-style SVG formatting without adding a dependency or an editor plugin, and without sending an unreleased logo to a third-party server.",
    },
    {
      title: "Confidence it stays identical",
      description:
        "Because prettifying only changes whitespace, the live preview lets you confirm the artwork is untouched before you paste the readable version back into your codebase.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste minified or single-line markup into the editor, drop a .svg file anywhere on the workspace, or click Import. Load a sample in one click to see it work.",
    },
    {
      title: "Pick an indent",
      description:
        "Choose 2-space, 4-space or tab indentation to match your project. The source re-formats live the moment you change it.",
    },
    {
      title: "Check the preview",
      description:
        "Glance at the checkerboard preview beside the code to confirm the artwork is unchanged, prettifying should only ever move whitespace.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the formatted SVG to your clipboard, download it as a .svg, or share a link that reopens the tool with your source pre-loaded.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Un-minify before editing",
      description:
        "Expand a one-line SVG from a build output so you can hand-edit a path or swap a fill color, then run it back through the Optimizer once the change is in.",
    },
    {
      audience: "Reviewer / Team lead",
      title: "Make an SVG diffable in review",
      description:
        "Format a minified icon before it lands in a pull request so a coordinate or color change shows up as a one-line diff instead of a wholesale reformat.",
    },
    {
      audience: "Design systems engineer",
      title: "Normalize source style",
      description:
        "Re-indent every icon to the same 2-space width so the whole registry reads consistently and hand edits don't introduce noisy whitespace churn.",
    },
    {
      audience: "Educator / Learner",
      title: "See how a graphic is built",
      description:
        "Beautify a compact SVG to reveal its structure (the groups, gradients and clip-paths) so it's easy to teach or learn how the artwork is assembled.",
    },
  ],

  troubleshooting: [
    {
      problem: "The file got bigger after prettifying.",
      solution:
        "That's expected, indentation and line breaks add bytes. Prettifying is for readability, not shipping. When you're done editing, run the file through the SVG Optimizer or Minifier to shrink it back down.",
    },
    {
      problem: "It says the input doesn't look like an SVG.",
      solution:
        "The formatter needs real SVG markup that contains an <svg> element. If you pasted a data-URI or a base64 blob, decode it to raw SVG first with the Data-URI tool, or import the .svg file directly.",
    },
    {
      problem: "Indentation looks slightly off on odd markup.",
      solution:
        "When SVGO's prettify path can't load, a dependency-free indenter runs instead and is best-effort on unusual or malformed nesting. Fix any unclosed tags, or try a different indent width: the artwork in the preview is still correct.",
    },
    {
      problem: "My inline text or whitespace-sensitive content changed spacing.",
      solution:
        "A handful of SVGs rely on significant whitespace inside <text> or with xml:space=\"preserve\". Check the preview. If spacing matters, keep that element's original formatting rather than reformatting the whole file.",
    },
  ],

  tips: [
    "Match your project's indent. 2-space is the common default for SVG in web codebases. Use tabs if your repo does.",
    "Prettify to edit, optimize to ship: beautify to make a change, then run the SVG Optimizer to strip the whitespace back out before it goes live.",
    "Format a minified SVG before opening a pull request so reviewers see a real diff instead of one giant reformatted line.",
    "Use the live preview as a safety check: if the artwork looks different after formatting, the input markup was likely malformed.",
    "Pair with the SVG Viewer to inspect a graphic and the Prettifier to make its source readable at the same time.",
  ],

  security:
    "Your SVG is parsed and formatted entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely prettify unreleased logos, brand marks and internal icon sets. Formatting uses SVGO's prettify path with a dependency-free indenter fallback, so it keeps working even offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. All parsing and formatting happen locally in your browser using SVGO's prettify path, with a dependency-free indenter fallback if it can't load. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to prettify confidential logos and brand assets.",
    },
    {
      question: "Does prettifying change how my SVG looks?",
      answer:
        "No. Prettifying only adds indentation and line breaks. It does not round coordinates, merge paths or remove attributes, so the rendered artwork is identical. The live checkerboard preview sits beside the code precisely so you can confirm nothing about the graphic changed.",
    },
    {
      question: "Why did the file get bigger after I formatted it?",
      answer:
        "Because readable code carries extra whitespace: newlines and indentation add bytes. That's the point: prettifying is for reading, reviewing and editing, not for shipping. When you're finished, run the file through the SVG Optimizer or Minifier to remove the whitespace again before deploying.",
    },
    {
      question: "What's the difference between prettify and minify?",
      answer:
        "They're opposites. Minifying strips whitespace and cruft to make the smallest possible file for production. Prettifying re-adds indentation and line breaks to make the file readable for humans. Neither changes the artwork: use prettify to work on an SVG, minify to ship it.",
    },
    {
      question: "Can I choose the indentation width?",
      answer:
        "Yes. You can format with a 2-space, 4-space or tab indent to match your project's style, and the code re-formats live the moment you switch. There's no config file or editor plugin to set up: pick the width and copy the result.",
    },
    {
      question: "Will it break SVGs with gradients, filters or animation?",
      answer:
        "No. Prettifying preserves defs, gradients, filters, clip-paths and SMIL animation exactly. It only reflows the whitespace around them. The preview renders the formatted result so you can confirm every effect survived.",
    },
    {
      question: "Can it un-minify an SVG that's all on one line?",
      answer:
        "Yes: that's the core use case. A single-line SVG is expanded to one element per line with consistent nesting, so you can read the structure, find the part you need, and edit it by hand.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There's a generous guard to keep the browser tab responsive, but typical icons, logos and illustrations format instantly. For an unusually large single SVG, formatting takes a moment longer. The output is the same clean, indented source.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, client-side SVG prettifier with selectable 2-space / 4-space / tab indentation, one-element-per-line output, live checkerboard preview, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a dependency-free indenter fallback so formatting keeps working when SVGO's chunk can't load, plus keyboard shortcuts and a set of sample minified SVGs.",
    },
    {
      date: "2026-06-30",
      change:
        "Added a live before/after line-count and byte readout, and clearer guidance that prettifying is presentation-only and grows file size on purpose.",
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

export default svgPrettifier;
