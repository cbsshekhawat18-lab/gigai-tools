import type { Tool } from "@/types";

/**
 * Markdown Preview: a live, side-by-side GitHub-Flavoured Markdown editor and
 * renderer. It turns Markdown into a safe, sanitised HTML preview as you type,
 * with a formatting toolbar, tables, task lists, and one-click copy of either
 * the Markdown source or the rendered HTML. All copy is unique to Markdown
 * previewing, written to rank for the queries writers and developers type when
 * they want to see how a README, comment or doc will actually render.
 */
const markdownPreview: Tool = {
  slug: "markdown-preview",
  title: "Markdown Preview",
  description:
    "Write GitHub-Flavoured Markdown and see a live, sanitised HTML preview side-by-side, with a formatting toolbar, tables, task lists, and copy-as-HTML. Nothing is uploaded.",
  category: "developer-tools",
  icon: "FileText",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "Markdown Preview, Live GitHub-Flavoured Markdown Editor Online",
  tagline:
    "Type Markdown on the left and watch it render as clean, safe HTML on the right, instantly. Tables, task lists, code blocks and links all supported, a formatting toolbar handles the syntax, and everything runs client-side with nothing uploaded.",
  longDescription:
    "The GigAI Markdown Preview is a desktop-grade, split-pane Markdown editor that renders as you type. Paste a README, a pull-request comment, release notes or documentation and see exactly how GitHub-Flavoured Markdown (GFM) will look, headings, bold and italic, links, images, blockquotes, fenced code blocks, ordered and unordered lists, task-list checkboxes and full pipe tables. A formatting toolbar inserts the correct syntax around your selection, so you get bold, italic, headings, links, lists and inline code without memorising a single character of Markdown. What sets it apart from dillinger.io and StackEdit is trust and speed: the preview is produced by the battle-tested marked parser and then scrubbed with DOMPurify, so scripts, inline event handlers and dangerous URLs are stripped before anything reaches the page. You can safely preview Markdown pasted from anywhere. When you are done, copy the rendered HTML to drop into a CMS or email, copy the Markdown back out, or download either. Because rendering happens entirely in your browser, your drafts, notes and internal docs are never uploaded, stored or logged. Close the tab and it is gone.",

  ctaText: "Preview Markdown",

  keywords: [
    "markdown preview",
    "markdown editor online",
    "markdown to html",
    "github flavored markdown",
    "gfm preview",
    "live markdown preview",
    "readme preview",
    "markdown viewer",
    "markdown renderer",
    "preview markdown online",
    "markdown table preview",
    "markdown to html converter",
  ],

  seo: {
    title:
      "Markdown Preview, Live GFM Editor & Markdown to HTML Online | GigAI Tools",
    description:
      "Free online Markdown preview and editor. Write GitHub-Flavoured Markdown and get a live, sanitised HTML preview with tables, task lists and copy-as-HTML, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Columns2",
      title: "Live split-pane preview",
      description:
        "Type Markdown on the left and a fully rendered HTML preview appears on the right on every keystroke. No 'render' button, no page reloads, no lag.",
    },
    {
      icon: "Github",
      title: "GitHub-Flavoured Markdown",
      description:
        "Full GFM support: pipe tables, task-list checkboxes, fenced code blocks, autolinks, strikethrough, blockquotes and nested lists all render the way they do on GitHub.",
    },
    {
      icon: "Bold",
      title: "Formatting toolbar",
      description:
        "One-click bold, italic, heading, link, list and inline-code buttons wrap your current selection in the right syntax, so you never have to remember Markdown by hand.",
    },
    {
      icon: "ShieldCheck",
      title: "Sanitised, XSS-safe output",
      description:
        "Every preview is scrubbed with DOMPurify, stripping scripts, inline event handlers and dangerous URLs, so pasting Markdown from anywhere is always safe.",
    },
    {
      icon: "Code",
      title: "Copy Markdown or HTML",
      description:
        "Copy the rendered HTML to paste into a CMS, email or template, or copy the Markdown source back out, plus download either as a file with one click.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Parsing and rendering happen locally on your device. No README, draft or internal doc is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "See your README before you commit",
      description:
        "Preview exactly how a README, issue or PR comment will render on GitHub, so you catch a broken table or unbalanced code fence before anyone else does.",
    },
    {
      title: "Write Markdown without knowing Markdown",
      description:
        "The formatting toolbar inserts correct syntax around your selection, making the tool approachable for writers and product folks, not just developers.",
    },
    {
      title: "Safely preview untrusted content",
      description:
        "Because the output is sanitised, you can paste Markdown from a form submission, comment or third party and preview it with no XSS risk.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs locally, so drafts containing internal names, unreleased features or personal notes never leave your machine.",
    },
  ],

  howTo: [
    {
      title: "Type, paste or import Markdown",
      description:
        "Write in the left editor, paste from your clipboard, or drop a .md file onto it. Load the built-in sample to see every supported feature instantly.",
    },
    {
      title: "Format with the toolbar",
      description:
        "Select text and click Bold, Italic, Heading, Link, List or Code to wrap it in the correct Markdown, or just type the syntax yourself.",
    },
    {
      title: "Watch the live preview",
      description:
        "The right pane re-renders on every keystroke, showing the exact sanitised HTML, including tables, task lists and code blocks.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the rendered HTML or the Markdown source, or download either as a file. Share a link that reopens the tool with your text pre-loaded.",
    },
  ],

  formats: {
    input: ["Markdown", "MD", "TXT"],
    output: ["HTML"],
  },

  useCases: [
    {
      audience: "Open-source maintainer",
      title: "Polish a README",
      description:
        "Draft or edit a project README and confirm every badge, table and code block renders correctly before pushing it to the repository.",
    },
    {
      audience: "Technical writer",
      title: "Draft docs and release notes",
      description:
        "Write documentation or changelog entries in Markdown, preview the formatting, then copy clean HTML into a docs site or CMS.",
    },
    {
      audience: "Developer",
      title: "Compose a PR or issue comment",
      description:
        "Check that a long pull-request description with task lists, tables and code snippets will render the way you intend on GitHub or GitLab.",
    },
    {
      audience: "Content / marketing",
      title: "Turn Markdown into email or web HTML",
      description:
        "Write in comfortable Markdown, then copy the sanitised HTML to drop straight into an email template or content-management field.",
    },
  ],

  troubleshooting: [
    {
      problem: "My table isn't rendering as a table.",
      solution:
        "GFM tables need a header row and a separator row of dashes and pipes, like | A | B | on the first line and | --- | --- | on the second. Every row must have the same number of pipe-separated cells, and there must be a blank line before the table.",
    },
    {
      problem: "My raw HTML or <script> didn't appear.",
      solution:
        "The preview is sanitised with DOMPurify, so scripts, event handlers (onclick, etc.) and unsafe URLs are removed by design. Ordinary Markdown and safe inline HTML render fine. Anything that could execute code is intentionally stripped.",
    },
    {
      problem: "A single line break was ignored.",
      solution:
        "In standard GFM a single newline inside a paragraph does not force a line break. End a line with two spaces, or leave a blank line, to start a new paragraph. This matches how GitHub renders Markdown.",
    },
    {
      problem: "My code block shows the ``` fences as text.",
      solution:
        "Fenced code blocks need the opening and closing ``` on their own lines, with nothing else on those lines except an optional language after the opening fence. Make sure the closing fence isn't indented inside a list at a different level.",
    },
  ],

  tips: [
    "Select text first, then click a toolbar button to wrap just that selection in bold, italic, a link or inline code.",
    "Use - [ ] and - [x] to create task-list checkboxes that render exactly like GitHub's.",
    "Copy as HTML to paste formatted content into a CMS, email or template without re-styling it by hand.",
    "End a line with two trailing spaces to force a line break inside a paragraph.",
    "Drop a .md file onto the editor to load an existing README or doc instantly.",
  ],

  security:
    "Your Markdown is parsed and rendered entirely in your browser and the resulting HTML is sanitised with DOMPurify before it is ever shown: scripts and dangerous attributes are stripped. Nothing is uploaded, stored or logged, so you can safely preview drafts containing internal names, secrets or personal notes. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my Markdown uploaded to a server?",
      answer:
        "No. All parsing and rendering happen locally in your browser using the marked parser and DOMPurify. Your text never leaves your device, so there is nothing for us to store, log or see. It is safe to preview drafts containing confidential or personal information.",
    },
    {
      question: "Does it support GitHub-Flavoured Markdown (GFM)?",
      answer:
        "Yes. The preview supports GFM, including pipe tables, task-list checkboxes, fenced code blocks with language hints, strikethrough, autolinks, blockquotes and nested lists, so what you see matches how GitHub renders your Markdown.",
    },
    {
      question: "Can I copy the rendered HTML?",
      answer:
        "Yes. Copy HTML puts the sanitised HTML on your clipboard, ready to paste into a CMS, email template or web page. You can also copy the Markdown source back out, or download either as a file.",
    },
    {
      question: "Is the HTML preview safe from XSS?",
      answer:
        "Yes. Every preview is passed through DOMPurify, which removes <script> tags, inline event handlers and dangerous URLs before the HTML is displayed. That means you can safely preview Markdown pasted from comments, forms or untrusted sources.",
    },
    {
      question: "How do I make a table in Markdown?",
      answer:
        "Write a header row with cells separated by pipes, then a separator row of dashes, then your data rows: for example a line of | Name | Role |, then | --- | --- |, then your rows. Leave a blank line before the table so the parser recognises it.",
    },
    {
      question: "Why doesn't my single line break show up?",
      answer:
        "Standard Markdown treats a single newline inside a paragraph as a space, not a break. To force a line break, end the line with two spaces. To start a new paragraph, leave a blank line. This is the same behaviour as GitHub.",
    },
    {
      question: "Can I use this as a Markdown-to-HTML converter?",
      answer:
        "Absolutely. Paste or type your Markdown, then use Copy HTML or download the HTML file. The output is clean, sanitised HTML you can drop into almost any web page, email or content system.",
    },
    {
      question: "Does it work offline and on mobile?",
      answer:
        "Yes. Because everything runs client-side, once the page has loaded it keeps working without a connection, and the split-pane layout stacks vertically on small screens so you can edit and preview on a phone or tablet.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live GFM preview with tables and task lists, formatting toolbar, sanitised HTML output, copy Markdown/HTML, drag-drop import and shareable links.",
    },
    {
      date: "2026-06-29",
      change:
        "Added keyboard shortcuts for formatting and sample loading, an in-tool shortcuts helper, and a synced-scroll toggle between the editor and preview.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "html-formatter",
    "yaml-formatter",
    "base64-encoder",
  ],
};

export default markdownPreview;
