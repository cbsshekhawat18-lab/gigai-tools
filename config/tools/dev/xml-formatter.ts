import type { Tool } from "@/types";

/**
 * XML Formatter, a browser-only XML beautifier, minifier and well-formedness
 * checker. It pretty-prints or compacts XML at any indent, keeps comments,
 * CDATA, the XML declaration and processing instructions byte-for-byte intact,
 * and (using the browser's native XML parser) reports the exact location of
 * a well-formedness error (mismatched tags, unclosed elements, bad entities).
 * All copy is unique to XML and written to rank for the precise queries people
 * type when an SVG, SOAP envelope, RSS feed, pom.xml or Android layout won't
 * parse.
 */
const xmlFormatter: Tool = {
  slug: "xml-formatter",
  title: "XML Formatter",
  description:
    "Beautify or minify XML in your browser with real well-formedness checking, preserved CDATA, comments, declaration and processing instructions, plus a precise error line: nothing is uploaded.",
  category: "developer-tools",
  icon: "Code",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "XML Formatter & Beautifier, Pretty-Print or Minify Online",
  tagline:
    "Paste tangled XML and get it beautified, minified and checked for well-formedness in one keystroke. Comments, CDATA, the declaration and processing instructions survive untouched, and when the markup is broken we point at the line: all client-side, nothing uploaded.",
  longDescription:
    "The GigAI XML Formatter is a desktop-grade XML editor that runs entirely in your browser. Paste, drop or type XML and it pretty-prints with 2-space, 4-space, or tab indentation, or minifies every scrap of insignificant whitespace away for the smallest transport payload. Unlike naive formatters that mangle your document, it treats comments, CDATA sections, the `<?xml ...?>` declaration, processing instructions and `<!DOCTYPE>` as verbatim blocks, they come out exactly as they went in, and it inlines simple text nodes like `<title>Hello</title>` onto a single line so the result reads the way a human would write it. Self-closing tags stay self-closing. Crucially, it doesn't just reflow: it runs your markup through the browser's native XML parser to check real well-formedness, so mismatched tags, unclosed elements, stray `<` and `&`, or a broken CDATA close are flagged with the line where the parser gave up, the difference between a two-second fix and squinting at a wall of angle brackets. It shows the byte size before and after so minify savings are visible, keeps a full undo/redo history, imports by drag-drop or paste, and exports or shares in a click. Because parsing and formatting happen locally with the browser's own XML engine, your documents (SOAP payloads, SAML assertions, config files, sitemaps, invoices) are never uploaded, logged or seen by anyone. Close the tab and it's gone.",

  ctaText: "Format XML",

  keywords: [
    "xml formatter",
    "xml beautifier",
    "format xml online",
    "xml minifier",
    "pretty print xml",
    "xml pretty print",
    "beautify xml",
    "xml validator",
    "check xml well formed",
    "xml prettifier",
    "minify xml",
    "format svg xml",
  ],

  seo: {
    title: "XML Formatter, Beautify / Minify & Validate XML Online | GigAI Tools",
    description:
      "Free online XML formatter and beautifier. Pretty-print or minify XML, preserve CDATA, comments and the declaration, and get the exact well-formedness error line, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "AlignLeft",
      title: "Beautify or minify",
      description:
        "Pretty-print with 2-space, 4-space or tab indentation and clean inlining of text-only elements, or minify to strip every byte of insignificant whitespace for the tightest payload.",
    },
    {
      icon: "ShieldCheck",
      title: "Real well-formedness check",
      description:
        "Your markup runs through the browser's native XML parser, so mismatched tags, unclosed elements, stray < or & and broken CDATA are caught. Not silently reflowed into worse XML.",
    },
    {
      icon: "MapPin",
      title: "Error line, not a shrug",
      description:
        "When the document isn't well-formed we surface the parser's message and the line it stopped on, so you jump to the problem instead of counting angle brackets.",
    },
    {
      icon: "Lock",
      title: "CDATA & comments preserved",
      description:
        "Comments, CDATA sections, the <?xml?> declaration, processing instructions and DOCTYPE are treated as verbatim blocks and emitted byte-for-byte. Never escaped, reindented or lost.",
    },
    {
      icon: "Scale",
      title: "Byte size before & after",
      description:
        "See input and output size and the exact percentage saved when you minify, so you know precisely what trimming whitespace buys a SOAP call or config bundle.",
    },
    {
      icon: "MousePointerClick",
      title: "Drop, paste, copy, share",
      description:
        "Drag an .xml, .svg or .rss file onto the editor, paste from the clipboard, then copy, download or share a link that reopens the tool with your document pre-loaded.",
    },
  ],

  benefits: [
    {
      title: "Read machine-generated XML",
      description:
        "One-line SOAP envelopes, minified SVGs and API XML become a readable tree with correct indentation, so you can actually see the structure you're debugging.",
    },
    {
      title: "Catch broken markup instantly",
      description:
        "The well-formedness check turns a vague 'my XML won't load' into a specific error and line, so you fix the unclosed tag or bad ampersand in seconds.",
    },
    {
      title: "Shrink payloads for the wire",
      description:
        "Minify config, feeds and messages and watch the byte savings, smaller SOAP bodies, sitemaps and cache entries with no change to the data.",
    },
    {
      title: "Private by design",
      description:
        "It all runs locally, so you can safely format XML containing SAML assertions, tokens, invoices or internal schemas: none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import XML",
      description:
        "Paste into the left editor, drag an .xml / .svg / .rss file onto it, or click to browse. Or load a built-in sample to try it instantly.",
    },
    {
      title: "Choose beautify or minify",
      description:
        "Pick Beautify and an indent of 2, 4 or tab to pretty-print, or Minify to collapse the document. Everything re-runs live as you change options.",
    },
    {
      title: "Fix any well-formedness error",
      description:
        "If the parser rejects the markup, read the message and line in the error banner. The usual culprits are a mismatched or unclosed tag, or an unescaped & or <.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the result, download it as an .xml file, or share a link that reopens the tool with your document pre-loaded.",
    },
  ],

  formats: {
    input: ["XML", "SVG", "RSS", "TXT"],
    output: ["XML"],
  },

  useCases: [
    {
      audience: "Backend / integration developer",
      title: "Debug a SOAP or SAML payload",
      description:
        "Paste a single-line SOAP envelope or SAML assertion from a log, beautify it to read the nesting, then confirm it's well-formed before replaying the request.",
    },
    {
      audience: "Frontend developer",
      title: "Tidy or shrink an SVG",
      description:
        "Beautify an exported SVG to hand-edit paths and attributes, or minify it to drop editor cruft and whitespace before inlining it into your bundle.",
    },
    {
      audience: "DevOps / platform engineer",
      title: "Fix a config or pom.xml that won't load",
      description:
        "When a Maven pom.xml, Android layout or app config throws on parse, use the well-formedness check to land on the unclosed tag or bad entity the parser rejects.",
    },
    {
      audience: "Content / SEO engineer",
      title: "Inspect a feed or sitemap",
      description:
        "Beautify an RSS/Atom feed or XML sitemap to verify its structure by eye, then minify it back down for the smallest response over the wire.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says my XML isn't well-formed but it renders in a browser.",
      solution:
        "Browsers render HTML leniently, but XML parsing is strict. Every tag must close, attribute values must be quoted, and & < > must be escaped as &amp; &lt; &gt; (except inside CDATA). Check the reported line for an unclosed tag or a raw ampersand.",
    },
    {
      problem: "My HTML won't format here.",
      solution:
        "This is an XML formatter, so HTML with void tags like <br> or <img> (no closing slash) or unquoted attributes fails the well-formedness check. Make it XHTML-clean, or use an HTML-specific formatter for lenient HTML.",
    },
    {
      problem: "A raw & broke the parse.",
      solution:
        "A bare & is only legal in XML as the start of an entity like &amp;. Escape literal ampersands as &amp;, or wrap the affected text in a <![CDATA[ ... ]]> block so it's taken verbatim.",
    },
    {
      problem: "My indentation looks off around mixed content.",
      solution:
        "Elements that mix text and child tags (mixed content) are whitespace-sensitive: reindenting them can change meaning, so the formatter is conservative there. If exact whitespace matters, keep such nodes in a CDATA block.",
    },
  ],

  tips: [
    "Toggle Minify then read the byte-size badge to see exactly what stripping whitespace saves on a SOAP or sitemap payload.",
    "Press Ctrl/Cmd+Enter to re-run instantly and Ctrl/Cmd+S to download the formatted XML.",
    "Wrap anything containing raw &, < or scripts in a <![CDATA[ ... ]]> block so the formatter leaves it byte-for-byte untouched.",
    "A well-formedness error at the very end usually means an unclosed tag somewhere above: check that every open element has a matching close.",
    "Minify before sending XML over the wire and beautify when you need to read it. The toggle is instant and non-destructive.",
  ],

  security:
    "Your XML is parsed and formatted entirely in your browser using its native XML engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely format documents containing SAML assertions, tokens, invoices or internal schemas. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my XML uploaded to a server?",
      answer:
        "No. All formatting, minifying and well-formedness checking happen locally in your browser using its built-in XML engine. Your document never leaves your device, so there is nothing for us to store, log or see. It is safe to format XML containing secrets, SAML assertions or personal data.",
    },
    {
      question: "What's the difference between beautify and minify?",
      answer:
        "Beautify (pretty-print) adds indentation and line breaks so the XML tree is readable: choose a 2-space, 4-space or tab indent, and simple text elements like <name>Ada</name> stay on one line. Minify strips all insignificant whitespace between tags to produce the most compact form for transport. The tool shows the byte size before and after so you can see the saving.",
    },
    {
      question: "Does the formatter keep my comments and CDATA?",
      answer:
        "Yes. Comments, CDATA sections, the <?xml ...?> declaration, processing instructions and DOCTYPE are treated as verbatim blocks and emitted byte-for-byte. They are never escaped, reindented internally or dropped, so nothing inside a CDATA or comment is altered.",
    },
    {
      question: "How do I check whether my XML is well-formed?",
      answer:
        "Just paste it in. The tool runs your markup through the browser's native XML parser as you type. If it isn't well-formed, the error banner shows the parser's message and the line where it stopped. Common causes are a mismatched or unclosed tag, an unquoted attribute, or a raw & or < that should be escaped.",
    },
    {
      question: "Why does valid-looking XML fail the check?",
      answer:
        "XML is far stricter than HTML. Every element must have a matching close tag (or be self-closing), attribute values must be quoted, tag names are case-sensitive, and the characters & < > must be escaped outside CDATA. An HTML-style <br> or <img> with no closing slash, or a literal & in text, will fail.",
    },
    {
      question: "Can it format an SVG file?",
      answer:
        "Yes. An SVG is XML, so you can beautify it to hand-edit paths and attributes, or minify it to remove editor whitespace before inlining. Drag the.svg onto the editor or paste its contents. The declaration and any comments are preserved.",
    },
    {
      question: "Does formatting change the meaning of my XML?",
      answer:
        "Beautify only adds or removes whitespace between elements, which is insignificant for most documents, and it leaves CDATA, comments and attributes exactly as they are. The one thing to watch is mixed content (an element containing both text and child tags), where whitespace can be significant. Keep such content in CDATA if exact bytes matter.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on multi-megabyte documents. Most real-world feeds, SOAP messages, configs and SVGs are well within it. For extremely large files, format in sections or trim the document first.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live beautify/minify, 2/4/tab indentation, verbatim CDATA/comment/declaration/PI handling, browser-native well-formedness checking with error line, byte-size stats, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-29",
      change:
        "Added inlining of text-only elements onto a single line and improved self-closing tag handling for cleaner, more human-readable output.",
    },
    {
      date: "2026-07-02",
      change:
        "Sharpened well-formedness error messages for unescaped ampersands, mismatched tags and broken CDATA, and surfaced the offending line in the banner.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "base64-encoder",
    "jwt-decoder",
    "uuid-generator",
  ],
};

export default xmlFormatter;
