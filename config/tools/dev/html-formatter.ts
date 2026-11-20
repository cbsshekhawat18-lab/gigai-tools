import type { Tool } from "@/types";

/**
 * HTML Formatter, a Prettier-powered HTML beautifier and minifier that runs
 * 100% in the browser. It reindents full documents and stray fragments alike,
 * lets you dial in indent width and print width, and flips to a one-click
 * minify mode for shipping. Every field below is written uniquely for HTML
 * formatting search intent, messy markup, broken tags, template snippets,
 * email HTML, so the page reads like a standalone product and ranks on its
 * own terms rather than echoing the JSON or CSS tools.
 */
const htmlFormatter: Tool = {
  slug: "html-formatter",
  title: "HTML Formatter",
  description:
    "Beautify or minify HTML in your browser: reindent messy markup, wrap long lines, fix nesting readability, and collapse to production-ready output. Works on full pages and fragments. Nothing is uploaded.",
  category: "developer-tools",
  icon: "CodeXml",
  accent: "orange",
  status: "live",
  createdAt: "2026-06-24",

  h1: "HTML Formatter & Beautifier: Format, Indent, Minify Online",
  tagline:
    "Paste tangled HTML and get clean, consistently indented markup instantly, or flip to minify for the smallest shippable output. Full documents or loose fragments, tuned indent and print width, all client-side and never uploaded.",
  longDescription:
    "The GigAI HTML Formatter is a desktop-grade markup beautifier that formats HTML entirely in your browser using the Prettier engine. Paste, drop or type any markup, a whole page with a doctype, a chunk of a template, an Angular/Vue/Handlebars snippet, or the mangled single-line HTML your CMS or email builder spat out, and it reflows the tags with clean, consistent indentation as you type. Set the indent to 2 spaces, 4 spaces or tabs, and pull the print width from a tight 60 up to a roomy 120 columns to control exactly where long attribute lists and text wrap. When you're ready to ship, one click switches to Minify mode, stripping insignificant whitespace and line breaks so your HTML weighs as little as possible in the response, and a byte-size badge shows precisely what you saved. Unlike a paste-and-pray online box, we surface the precise line and column when the markup is too broken to parse and let you jump straight to it, keep a full undo/redo history, format from the keyboard with real shortcuts, and let you copy, download an.html file, or share a link that reopens your input. Everything happens locally, your unreleased landing page, internal dashboard markup or customer email template is never uploaded, logged or seen by anyone.",

  ctaText: "Format HTML",

  keywords: [
    "html formatter",
    "html beautifier",
    "format html online",
    "html indent",
    "beautify html",
    "prettify html",
    "clean up html",
    "html pretty print",
    "unminify html",
    "html tidy",
    "format html fragment",
  ],

  seo: {
    title:
      "HTML Formatter & Beautifier: Format / Minify HTML Online | GigAI Tools",
    description:
      "Free online HTML formatter and beautifier. Reindent messy HTML, set indent and print width, minify to production output, and jump to parse errors: 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "AlignLeft",
      title: "Clean, consistent indentation",
      description:
        "Prettier reflows nested tags with 2-space, 4-space or tab indentation, aligning attributes and closing tags so a wall of markup becomes instantly scannable.",
    },
    {
      icon: "Ruler",
      title: "Tunable print width",
      description:
        "Slide the wrap column from 60 to 120 to decide when long attribute lists and text content break onto new lines, tight for narrow diffs, wide for fewer wraps.",
    },
    {
      icon: "Minimize2",
      title: "One-click minify",
      description:
        "Flip to Minify mode to strip insignificant whitespace and line breaks into the most compact valid HTML, with a byte-size badge showing exactly what you shaved off.",
    },
    {
      icon: "FileCode2",
      title: "Documents and fragments",
      description:
        "Format a complete page with its doctype and head, or a loose snippet ripped out of a component or email, the parser handles partial markup without choking.",
    },
    {
      icon: "MapPin",
      title: "Pinpoint parse errors",
      description:
        "When markup is too malformed to format, we show the exact line and column, explain what the parser expected, and let you jump straight to the offending character.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Formatting runs locally on your device. No page, template or email HTML is ever uploaded, stored or logged. Close the tab and every trace is gone.",
    },
  ],

  benefits: [
    {
      title: "Turn minified HTML back into readable code",
      description:
        "Paste the single-line markup from a view-source or a build output and get properly indented HTML you can actually read, debug and edit.",
    },
    {
      title: "Consistent formatting for clean diffs",
      description:
        "Running every template through the same indent and print-width settings keeps Git diffs focused on real changes instead of whitespace noise.",
    },
    {
      title: "Ship lighter markup",
      description:
        "Minify mode trims insignificant whitespace so pages, email HTML and cached fragments transfer smaller, with the exact saving shown before you copy.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs entirely in your browser, you can safely format unreleased pages, internal dashboards or customer emails, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import HTML",
      description:
        "Paste into the left editor, drag an .html file onto it, or click to browse. Or load the built-in sample to try it instantly.",
    },
    {
      title: "Choose Beautify or Minify",
      description:
        "Pick Beautify to reindent for readability, or Minify to collapse to the smallest valid output. Everything re-runs live as you switch.",
    },
    {
      title: "Tune indent and print width",
      description:
        "Set 2-space, 4-space or tab indentation and drag the print width to control where long lines wrap. The output updates as you type.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the formatted markup, download it as an .html file, or share a link that reopens the tool with your input pre-loaded.",
    },
  ],

  formats: {
    input: ["HTML", "HTM", "TXT"],
    output: ["HTML"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Unminify a production page",
      description:
        "Grab the single-line HTML from view-source or a bundle, reindent it, and finally read the DOM structure you're trying to debug or replicate.",
    },
    {
      audience: "Email developer",
      title: "Tidy table-based email HTML",
      description:
        "Beautify the deeply nested, inline-styled markup email builders produce so you can find the row or cell that's breaking a client, then minify before sending.",
    },
    {
      audience: "CMS / marketing editor",
      title: "Clean up pasted rich-text markup",
      description:
        "Format the messy HTML a WYSIWYG or Word paste leaves behind into readable, consistent tags before dropping it into a page or newsletter.",
    },
    {
      audience: "Backend / template developer",
      title: "Format a server-rendered fragment",
      description:
        "Reindent a partial pulled from a Django, Rails or Handlebars template so the structure is obvious during review, without needing the full page context.",
    },
  ],

  troubleshooting: [
    {
      problem: "My template tags ({{ }}, {% %}, <?php ?>) got reformatted oddly.",
      solution:
        "The formatter parses HTML, not the templating layer wrapped around it. Simple interpolations usually survive, but complex control blocks can confuse the parser. Format the rendered HTML output, or keep template-specific formatting to your editor's language plugin.",
    },
    {
      problem: "It reports a parse error but the HTML looks fine.",
      solution:
        "Click into the reported line and column: the usual causes are an unclosed tag, a stray '<' that isn't escaped as &lt;, or mismatched quotes in an attribute. Fragments with an unbalanced opening or closing tag can also trip it.",
    },
    {
      problem: "Whitespace inside <pre> or <textarea> changed.",
      solution:
        "It shouldn't, the formatter preserves whitespace-sensitive elements like <pre>, <textarea> and <script>. If content still shifts, wrap the sensitive block in one of those elements so its exact whitespace is respected.",
    },
    {
      problem: "Minify didn't make it as small as I expected.",
      solution:
        "This mode strips insignificant HTML whitespace safely. It does not remove comments, mangle inline CSS/JS, or drop optional tags, because that risks changing rendering. For aggressive build-time minification, pair this with a dedicated CSS/JS minifier in your pipeline.",
    },
  ],

  tips: [
    "Pull the print width down to 60–80 for tighter, more reviewable diffs, or up to 120 to keep long attribute lists on one line.",
    "Press Ctrl/Cmd+Enter to re-run instantly and Ctrl/Cmd+S to download the formatted .html output.",
    "Beautify first to understand a chunk of markup, then switch to Minify and check the byte-size badge before shipping.",
    "Match your project's editor settings (tabs vs 2 vs 4 spaces) here so pasted snippets drop in without reformatting churn.",
    "Wrap whitespace-critical content in <pre> so the formatter leaves its exact spacing untouched.",
  ],

  security:
    "Your HTML is parsed and formatted entirely in your browser using the Prettier engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely format unreleased pages, internal dashboard markup, or customer email templates. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my HTML uploaded to a server?",
      answer:
        "No. All parsing, beautifying and minifying happen locally in your browser using the Prettier engine. Your markup never leaves your device, so there is nothing for us to store, log or see. It is safe to format unreleased pages, internal tools or customer email HTML.",
    },
    {
      question: "Can it format just a fragment of HTML, not a whole page?",
      answer:
        "Yes. You can paste a loose snippet (a single element, a component's markup, or a template partial) without a doctype, <html> or <head> wrapper. The parser handles partial markup and reindents it just like a full document.",
    },
    {
      question: "What's the difference between Beautify and Minify?",
      answer:
        "Beautify reindents your HTML with line breaks and consistent spacing so it's readable and easy to diff. Choose 2-space, 4-space or tab indent and a print width. Minify strips insignificant whitespace and line breaks to produce the smallest valid output for shipping, and the tool shows the byte size before and after so you can see the saving.",
    },
    {
      question: "How do I unminify or 'unpack' minified HTML?",
      answer:
        "Paste the single-line, minified markup into the input and keep the mode on Beautify. The formatter reintroduces indentation and line breaks so you get readable, properly nested HTML back, ideal for reading a production page from view-source or a build artifact.",
    },
    {
      question: "Does formatting change how my page renders?",
      answer:
        "Beautify only adds or removes whitespace between tags where it is insignificant, and it preserves whitespace-sensitive elements like <pre>, <textarea> and <script>, so rendering stays the same. Minify likewise removes only safe whitespace. It does not rewrite your tags, attributes or content.",
    },
    {
      question: "Will it work with Vue, Angular, Handlebars or JSX-like syntax?",
      answer:
        "It formats standard HTML and tolerates simple interpolations, but it is not a template-language formatter. Complex control blocks in Handlebars, Angular or Blade may not reindent cleanly. For those, format the rendered HTML, or use your editor's dedicated language plugin.",
    },
    {
      question: "Can I control the indentation and line length?",
      answer:
        "Yes. Choose between 2-space, 4-space and tab indentation, and set the print width anywhere from 60 to 120 columns. The print width decides where long attribute lists and text content wrap onto new lines, and every change re-runs the output live.",
    },
    {
      question: "Is there a limit on how much HTML I can format?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on very large inputs. Most real pages, email templates and fragments are comfortably within it. For extremely large files, format them in sections.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live HTML beautify with 2/4/tab indentation and adjustable print width, one-click minify with byte-size stats, precise line + column parse errors, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added keyboard shortcuts (run, download, clear, undo/redo) with an in-tool shortcuts helper and a curated HTML sample.",
    },
    {
      date: "2026-07-02",
      change:
        "Improved handling of whitespace-sensitive elements and clearer error messages for unclosed tags in fragments.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "base64-encoder",
    "jwt-decoder",
    "uuid-generator",
  ],
};

export default htmlFormatter;
