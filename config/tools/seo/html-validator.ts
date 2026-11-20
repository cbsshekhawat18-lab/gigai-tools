import type { Tool } from "@/types";

/**
 * HTML Validator, the paste-first markup checker for the "Validators" group.
 *
 * Every line of copy below is written specifically for HTML well-formedness and
 * on-page SEO checking (structure, title/meta, lang, image alt, heading order),
 * so the page ranks on its own intent rather than competing with the meta
 * analyzer, sitemap validator or schema tools. It is deliberately honest about
 * scope: this is a fast, in-browser structural + SEO linter. Not a byte-for-byte
 * re-implementation of the W3C Nu HTML Checker.
 */
const htmlValidator: Tool = {
  slug: "html-validator",
  title: "HTML Validator",
  description:
    "Paste HTML and instantly check well-formedness plus on-page SEO (title, meta description, lang, image alt text and heading order) with a live outline. 100% in your browser.",
  category: "seo-tools",
  group: "Validators",
  icon: "CodeXml",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "HTML Validator, Well-Formedness & On-Page SEO Checker",
  tagline:
    "Paste your markup and get an instant, plain-English report: unclosed-tag warnings, the SEO essentials every page needs, image alt coverage and a proper heading outline, parsed live in your browser, nothing uploaded.",
  longDescription:
    "The GigAI HTML Validator is a fast, honest markup linter built for people shipping real pages. Paste a full document or just a fragment and it parses the HTML with the browser's own engine to surface the problems that actually matter: structure that a strict XML re-parse flags as not well-formed (a reliable smell test for unclosed or mis-nested tags), the on-page SEO essentials, a single non-empty `<title>`, a meta description, a `lang` attribute on `<html>`: image `alt` coverage for accessibility, empty or `#` links, and a full h1–h6 heading outline that flags a missing H1, multiple H1s, skipped levels and empty headings. Findings are grouped, scored and paired with a concrete fix for every warning, plus a rendered outline so you can see your document's structure at a glance. It is deliberately lightweight and says so: browsers auto-correct HTML, so this catches structural and SEO defects rather than every last spec nuance, and for a byte-exact conformance verdict you'd still run the W3C Nu Checker. Because everything runs locally with native DOMParser, you can validate staging pages, login-gated views, unreleased templates and confidential markup: nothing is ever fetched, uploaded, logged or seen by anyone.",

  ctaText: "Validate my HTML",

  keywords: [
    "html validator",
    "validate html",
    "html checker",
    "html well-formedness",
    "check html online",
    "html syntax checker",
    "on-page seo checker",
    "image alt checker",
    "html lint",
    "free html validator",
    "html markup validator",
  ],

  seo: {
    title: "HTML Validator, Well-Formedness & On-Page SEO Checker | GigAI Tools",
    description:
      "Free HTML validator: paste markup to check well-formedness plus SEO essentials (title, meta description, lang, image alt and heading order) with a live outline. Nothing is uploaded.",
  },

  features: [
    {
      icon: "CodeXml",
      title: "Well-formedness check",
      description:
        "A strict XML re-parse of full documents surfaces unclosed, mis-nested or stray tags that HTML's forgiving parser would silently patch over, the fastest way to catch structural mistakes.",
    },
    {
      icon: "Search",
      title: "On-page SEO essentials",
      description:
        "Verifies the head basics every ranking page needs: a single, non-empty <title>, a meta description, and a lang attribute on <html>, each with a one-line fix when it's missing.",
    },
    {
      icon: "ListTree",
      title: "Live heading outline",
      description:
        "Extracts your h1–h6 structure and renders it as an indented outline, flagging a missing or duplicate H1, skipped levels (h2 → h4) and empty headings that hurt SEO and screen readers.",
    },
    {
      icon: "Image",
      title: "Accessibility checks",
      description:
        "Counts <img> elements with no alt attribute and links with an empty or \"#\" href, so you catch the accessibility and crawlability gaps that automated audits penalise.",
    },
    {
      icon: "ClipboardCheck",
      title: "Grouped, scored report",
      description:
        "Findings are organized into Structure, SEO, Accessibility and Outline groups with a headline score, so you know at a glance whether the markup is ship-ready or needs work.",
    },
    {
      icon: "ShieldCheck",
      title: "Private, in-browser parsing",
      description:
        "Everything runs on the pasted markup with native DOMParser (no upload, no fetch, no logging) so staging, login-gated and unreleased pages are safe to check.",
    },
  ],

  benefits: [
    {
      title: "Catch broken structure before it ships",
      description:
        "Unclosed and mis-nested tags rarely error visibly. They quietly break layout and confuse crawlers. The well-formedness pass flags them the moment you paste, not in production.",
    },
    {
      title: "Fix on-page SEO in one glance",
      description:
        "A missing title, absent meta description or no lang attribute all cost you in search. This bundles those essentials with the accessibility basics into one scored, actionable checklist.",
    },
    {
      title: "Ship an accessible heading hierarchy",
      description:
        "The rendered outline makes a skipped level or a page with three H1s obvious, so both screen-reader users and search engines get the clean document structure they expect.",
    },
    {
      title: "Validate anything, privately",
      description:
        "Because parsing is local, you can check confidential, gated or pre-launch markup that a URL-based validator could never reach, and nothing leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste your HTML",
      description:
        "Drop in a full page (View Source → copy) or just a fragment. Load the sample if you want to see the report shape first, or drag in an .html file.",
    },
    {
      title: "Read the grouped report",
      description:
        "Scan the score and the Structure, SEO, Accessibility and Outline groups. Passing checks are collapsed to green. Every warning carries a concrete fix.",
    },
    {
      title: "Follow the outline",
      description:
        "Use the rendered heading tree to confirm a single H1 and no skipped levels, then repair anything the outline flags.",
    },
    {
      title: "Fix, re-paste, re-check",
      description:
        "Apply the fixes in your editor, paste the updated markup back in, and confirm the warnings clear, all without a round trip to a server.",
    },
  ],

  formats: {
    input: ["HTML", "HTML fragment"],
    output: ["Validation report", "Heading outline"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Sanity-check a template before merge",
      description:
        "Paste a component's rendered output to catch an unclosed tag or a missing lang attribute before it lands in the codebase and breaks a whole layout.",
    },
    {
      audience: "SEO specialist",
      title: "Audit a page's on-page basics",
      description:
        "Confirm the title, meta description and heading hierarchy are correct on a staging URL you can't feed to a public validator, and hand devs a precise fix list.",
    },
    {
      audience: "Accessibility reviewer",
      title: "Find missing alt text and bad heading order",
      description:
        "Get an instant count of images without alt attributes and a heading outline that exposes skipped levels: the two structural issues that trip up screen readers.",
    },
    {
      audience: "Content editor / CMS user",
      title: "Validate rich-text output",
      description:
        "Paste the HTML a WYSIWYG editor produced to check it isn't emitting stray tags, empty headings or link placeholders before the article goes live.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says my HTML is \"not well-formed\" but the page renders fine.",
      solution:
        "That check is a strict XML re-parse, which is deliberately stricter than HTML5: void elements like <br> or <img> written without a self-closing slash, or a raw & in an attribute, will trip it even though browsers render them. Treat it as a hint to look for unclosed or mis-nested tags. It's a warning, not a hard error.",
    },
    {
      problem: "My heading outline flags a skipped level I didn't expect.",
      solution:
        "A skip means a heading jumps more than one level (e.g. an H2 followed directly by an H4). Insert the intermediate level or promote the deeper heading so the hierarchy steps down one level at a time, screen readers and search engines both rely on that order.",
    },
    {
      problem: "Can it validate a live URL for me?",
      solution:
        "No. This is a static, in-browser tool with no server to crawl from, which is exactly why it's paste-first. Open the page, copy its source (Ctrl+U / Cmd+Option+U), and paste it here. The upside: staging, gated and unpublished pages that a URL validator can't reach all work.",
    },
    {
      problem: "Why doesn't it catch every error the W3C validator reports?",
      solution:
        "It's intentionally a lightweight structural + SEO linter, not a full conformance checker. It focuses on the high-value problems, well-formedness, the SEO essentials, alt coverage and heading order. For a byte-exact spec verdict, run the markup through the W3C Nu HTML Checker as well.",
    },
  ],

  tips: [
    "Paste the full document (with <html>) rather than a fragment to enable the strict well-formedness pass, fragments skip it by design.",
    "Aim for exactly one H1 per page and never skip heading levels. The outline makes both easy to verify at a glance.",
    "Give every meaningful <img> an alt attribute (use alt=\"\" for purely decorative images) to satisfy both accessibility and the check here.",
    "Always set a lang attribute on <html>, it's a small tag with outsized accessibility and international-SEO impact.",
    "Re-paste after each fix. The report is instant, so tight edit-and-recheck loops are the fastest way to a clean bill.",
  ],

  security:
    "Every check runs locally in your browser with its native DOMParser. The pasted markup is never fetched, uploaded, stored or logged. Draft templates, staging pages and confidential HTML stay entirely on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What does this HTML validator actually check?",
      answer:
        "It runs three passes on the markup you paste: a well-formedness check (a strict XML re-parse that flags unclosed or mis-nested tags in full documents), an on-page SEO check (a single non-empty <title>, a meta description, a lang attribute, and empty/# links), and a heading-structure check that builds an h1–h6 outline and flags a missing or duplicate H1, skipped levels and empty headings. It also counts images missing an alt attribute.",
    },
    {
      question: "Is this the same as the official W3C validator?",
      answer:
        "No, and it doesn't pretend to be. The W3C Nu HTML Checker is a full conformance validator. This is a fast, in-browser structural and SEO linter that catches the highest-value problems instantly and privately. Use this for quick, confidential checks and edit-recheck loops, and run the W3C checker when you need a byte-exact spec verdict.",
    },
    {
      question: "Can it validate a URL instead of pasted code?",
      answer:
        "No. This is a static, client-side tool with no backend to fetch a page from, so it's honestly paste-first. Open the page in your browser, view its source (Ctrl+U on Windows/Linux, Cmd+Option+U on macOS), copy it, and paste it here. The benefit is that staging, login-gated and unpublished pages a URL validator can't reach all work perfectly.",
    },
    {
      question: "Why is my valid HTML5 flagged as not well-formed?",
      answer:
        "The well-formedness check re-parses full documents as XML, which is stricter than HTML5. Void elements written without a trailing slash (<br>, <img>, <meta>), unescaped ampersands, or attributes without quotes are valid HTML5 but not valid XML, so they can trip that specific warning. It's advisory, a nudge to check for genuinely unclosed or mis-nested tags, not a failing grade.",
    },
    {
      question: "How many H1 tags should a page have?",
      answer:
        "Exactly one. The H1 is your page's main heading and both search engines and screen readers treat it as the top of the document outline. This tool flags a page with no H1 or with multiple H1s, and it also catches skipped levels (like an H2 jumping straight to an H4) so your hierarchy steps down cleanly.",
    },
    {
      question: "Does it check images for alt text?",
      answer:
        "Yes. It counts every <img> element that has no alt attribute at all and reports the total, since missing alt text is both an accessibility failure and a lost SEO signal. Note that an intentionally empty alt (alt=\"\") on a decorative image is correct and is not counted as missing: the check only flags images with no alt attribute present.",
    },
    {
      question: "Is my pasted HTML sent anywhere?",
      answer:
        "No. All parsing and validation happen entirely in your browser using its native DOMParser. Nothing you paste is uploaded, stored or logged, so it's safe to validate confidential templates, internal tools and pre-launch pages: close the tab and every trace is gone.",
    },
    {
      question: "Can I validate just a fragment of HTML?",
      answer:
        "Yes. Paste any snippet and the SEO, accessibility and heading checks all run on it. The strict well-formedness pass is skipped for fragments (it only applies to full documents that include an <html> tag) because a standalone snippet legitimately has no single root element.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, well-formedness re-parse, on-page SEO checks (title, meta description, lang, empty links), image alt coverage and a rendered h1–h6 heading outline, all grouped and scored.",
    },
    {
      date: "2026-06-24",
      change:
        "Added per-warning fix guidance, an at-a-glance summary strip (score, tag/heading counts, alt coverage) and drag-and-drop .html file support.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the well-formedness heuristic to skip fragments cleanly and sharpened the heading-outline rendering for deeply nested structures.",
    },
  ],

  relatedTools: [
    "meta-tag-analyzer",
    "sitemap-validator",
    "robots-txt-validator",
    "meta-tag-generator",
    "json-formatter",
    "url-encoder",
  ],
};

export default htmlValidator;
