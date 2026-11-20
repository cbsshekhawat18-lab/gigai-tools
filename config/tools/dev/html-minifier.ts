import type { Tool } from "@/types";

/**
 * HTML Minifier: a browser-only tool that shrinks HTML by collapsing
 * whitespace and stripping comments while preserving the exact contents of
 * whitespace-significant and code elements (pre, textarea, script, style) and
 * IE conditional comments. Every field is unique to HTML minification: written
 * to rank for the queries developers type when they want to trim page weight,
 * clean up templated markup, or shave bytes off an email or landing page.
 */
const htmlMinifier: Tool = {
  slug: "html-minifier",
  title: "HTML Minifier",
  description:
    "Minify HTML in your browser, collapse whitespace, strip comments and shrink page weight while safely preserving pre, textarea, script and style content. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Minimize2",
  accent: "orange",
  status: "live",
  createdAt: "2026-06-24",

  h1: "HTML Minifier, Compress & Shrink HTML Online",
  tagline:
    "Paste your markup and get the smallest safe HTML instantly, collapsed whitespace, stripped comments, and a live byte-saving readout. It never touches your <pre>, <textarea>, <script> or <style>, and nothing leaves your browser.",
  longDescription:
    "The GigAI HTML Minifier is a desktop-grade tool that compresses HTML entirely on your device. Drop in a page, a fragment or an email template and it collapses the runs of whitespace between and inside tags, removes comments, and trims the document to the smallest byte-safe form: showing you the input size, output size and exact percentage saved as you type. What makes it safe where a naive find-and-replace is dangerous: it lifts out every <pre>, <textarea>, <script> and <style> block and restores them verbatim, so significant whitespace, inline code and JavaScript templates survive untouched. It also keeps Internet-Explorer conditional comments (`<!--[if IE]>`) intact while stripping ordinary ones, so build-time markers still work. Because minifying runs locally with no dependency call to any server, you can safely shrink markup that contains customer data, API keys in data-attributes, unreleased copy or internal template variables. None of it is uploaded, logged or seen by anyone. Toggle comment stripping on or off, import a.html file by drag-and-drop, copy or download the result, undo and redo, and share a link that reopens the tool with your markup pre-loaded.",

  ctaText: "Minify HTML",

  keywords: [
    "html minifier",
    "minify html",
    "html compressor",
    "compress html online",
    "shrink html",
    "html minify tool",
    "remove html comments",
    "collapse html whitespace",
    "reduce html size",
    "html optimizer",
    "beautify vs minify html",
    "minify html email",
  ],

  seo: {
    title: "HTML Minifier, Compress & Minify HTML Online | GigAI Tools",
    description:
      "Free online HTML minifier. Collapse whitespace, strip comments and shrink HTML while safely preserving pre, textarea, script and style: 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "Preserves code & pre blocks",
      description:
        "Every <pre>, <textarea>, <script> and <style> is lifted out and restored byte-for-byte, so significant whitespace, inline JavaScript and code samples are never mangled.",
    },
    {
      icon: "Scissors",
      title: "Smart comment stripping",
      description:
        "Removes ordinary HTML comments to save weight, while keeping IE conditional comments (`<!--[if IE]>`) intact. Toggle stripping off when you need to keep build markers.",
    },
    {
      icon: "Scale",
      title: "Live byte savings",
      description:
        "See input size, output size and the exact percentage saved as you type, so you know precisely what the minify bought before you ship it.",
    },
    {
      icon: "Zap",
      title: "Instant as you type",
      description:
        "Minification re-runs on every keystroke with a smart debounce. No 'Minify' button dance, the output and stats stay in sync automatically.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste or import",
      description:
        "Drag an .html file onto the editor, paste from the clipboard, or click to browse. Copy, download or share a link to the minified result in one click.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "All processing happens locally on your device. Markup containing customer data, keys in data-attributes or unreleased copy is never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Shave real weight off pages",
      description:
        "Collapsing inter-tag and in-text whitespace and dropping comments trims the HTML the browser downloads, cutting transfer size on landing pages, SSR output and cached fragments.",
    },
    {
      title: "Minify without breaking layout",
      description:
        "Because whitespace-significant elements are preserved verbatim, you get the size win without the classic bug of a collapsed <pre> or a broken inline script template.",
    },
    {
      title: "Clean up templated markup",
      description:
        "Server-side templates leave gaps of indentation and comment scaffolding: one paste produces tight, production-ready HTML you can drop straight into a response or email.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs on your machine, so you can safely minify internal templates, draft marketing copy or markup carrying embedded data with nothing leaving the browser.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import HTML",
      description:
        "Paste markup into the left editor, drag an .html file onto it, or click to browse. Or load the built-in sample to see it work instantly.",
    },
    {
      title: "Choose your options",
      description:
        "Keep comment stripping on for the smallest output, or turn it off to retain comments. Minification re-runs live as you change the toggle.",
    },
    {
      title: "Check the savings",
      description:
        "Watch the input, output and percentage-saved badges to confirm the minify is worthwhile before you use the result.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the minified HTML, download it as an .html file, or share a link that reopens the tool with your markup pre-loaded.",
    },
  ],

  formats: {
    input: ["HTML", "HTM", "TXT"],
    output: ["HTML"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Trim server-rendered pages",
      description:
        "Paste SSR or templated output riddled with indentation and comment scaffolding, and get tight production HTML that shrinks the payload without altering the rendered result.",
    },
    {
      audience: "Email developer",
      title: "Shrink HTML email templates",
      description:
        "Collapse the whitespace in a bloated email template to fit under Gmail's clipping threshold, while keeping inline <style> blocks and conditional comments intact.",
    },
    {
      audience: "Performance engineer",
      title: "Measure a minify win",
      description:
        "Drop a page's HTML in to see the exact byte and percentage saving, quantifying whether adding HTML minification to the build is worth wiring up.",
    },
    {
      audience: "Content / marketing",
      title: "Clean embed snippets",
      description:
        "Tidy a copy-pasted widget or landing-page fragment into a compact one-liner that's easy to paste into a CMS field or documentation.",
    },
  ],

  troubleshooting: [
    {
      problem: "My inline <script> or <pre> spacing changed.",
      solution:
        "It shouldn't. Those elements are preserved verbatim. If content still shifts, check that the tag is properly closed. An unclosed <pre> or <script> means the preserver can't find its end and the rest of the document is treated as normal text.",
    },
    {
      problem: "A comment I needed was removed.",
      solution:
        "Turn off 'Strip comments' to keep all comments. Note that IE conditional comments (`<!--[if IE]>…<![endif]-->`) are always preserved even with stripping on, because they carry logic rather than notes.",
    },
    {
      problem: "The savings look small.",
      solution:
        "Already-tight HTML has little whitespace to collapse. The biggest wins come from deeply indented, comment-heavy templated output. Hand-minified markup will barely move.",
    },
    {
      problem: "Nothing happens on a very large paste.",
      solution:
        "Extremely large inputs are guarded to keep the tab responsive. Minify the document in sections, or trim it first. The limit is generous but not unbounded.",
    },
  ],

  tips: [
    "Keep 'Strip comments' on for the smallest output. Turn it off only when a comment carries a build-time marker you rely on.",
    "IE conditional comments survive stripping automatically, so you don't have to choose between size and legacy support.",
    "Press Ctrl/Cmd+Enter to re-run instantly and Ctrl/Cmd+S to download the minified HTML.",
    "Check the 'Saved' badge before shipping, on already-tight markup the win may be too small to bother.",
    "Minifying is safe on markup with embedded data or draft copy because everything stays in your browser.",
  ],

  security:
    "Your HTML is minified entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely compress markup containing customer data, keys in data-attributes, or unreleased copy. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my HTML uploaded to a server?",
      answer:
        "No. All minification happens locally in your browser. Your markup never leaves your device, so there is nothing for us to store, log or see. It is safe to minify HTML containing embedded data, template variables or draft content.",
    },
    {
      question: "Will minifying break my inline scripts or styles?",
      answer:
        "No. Every <script>, <style>, <pre> and <textarea> is extracted before minification and restored byte-for-byte afterwards, so JavaScript templates, CSS, code samples and any whitespace-significant content are preserved exactly as written.",
    },
    {
      question: "Does it remove HTML comments?",
      answer:
        "By default yes. Ordinary comments are stripped to save bytes. You can toggle this off to keep them. Internet-Explorer conditional comments (`<!--[if IE]>…<![endif]-->`) are always preserved because they carry rendering logic rather than notes.",
    },
    {
      question: "How much smaller will my HTML get?",
      answer:
        "It depends on how much whitespace and comment scaffolding your markup carries. Deeply indented, server-templated output can shrink noticeably, while already-tight or hand-minified HTML barely changes. The tool shows the exact byte and percentage saving so you never have to guess.",
    },
    {
      question: "What's the difference between minifying and beautifying HTML?",
      answer:
        "Minifying strips optional whitespace and comments to produce the smallest byte-safe HTML for shipping. Beautifying does the opposite. It adds indentation and line breaks to make markup readable. Use minify for production output and a formatter when you need to read or edit the source.",
    },
    {
      question: "Is it safe to minify HTML email templates?",
      answer:
        "Yes. Inline <style> blocks and conditional comments, both critical for email clients, are preserved, so you get a smaller template that can slip under Gmail's clipping limit without breaking rendering in Outlook or Apple Mail.",
    },
    {
      question: "Does minifying change what the page renders?",
      answer:
        "No. Only insignificant whitespace between and within tags is collapsed and comments are removed. The DOM the browser builds and the visible output are unchanged. Whitespace that matters (inside <pre>, <textarea> and preformatted content) is left exactly as-is.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on large inputs. Most real-world pages, fragments and email templates are well within it. For extremely large documents, minify in sections.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live whitespace collapse and comment stripping with pre/textarea/script/style preservation, IE conditional-comment safety, byte-saving stats, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-29",
      change:
        "Added a comment-stripping toggle and keyboard shortcuts (run, download, clear, undo/redo) with an in-tool shortcuts helper.",
    },
  ],

  relatedTools: [
    "html-formatter",
    "json-formatter",
    "xml-formatter",
    "base64-encode",
  ],
};

export default htmlMinifier;
