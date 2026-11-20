import type { Tool } from "@/types";

/**
 * Heading Checker, a paste-first structural auditor for a page's H1–H6
 * outline. It parses pasted HTML with the browser's own DOMParser, renders the
 * heading tree the way a screen reader or crawler walks it, and flags the
 * structural faults that quietly hurt accessibility and SEO: a missing H1,
 * multiple H1s, skipped levels (H2 → H4), an empty heading, or a document that
 * doesn't open on an H1. Every line of copy below is unique to heading-outline
 * auditing so the page earns its own ranking rather than overlapping the meta,
 * schema or sitemap tools.
 */
const headingChecker: Tool = {
  slug: "heading-checker",
  title: "Heading Checker",
  description:
    "Paste your HTML to see the full H1–H6 outline as a tree and catch structural problems (missing H1, multiple H1s, skipped levels and empty headings) with a plain-English fix for each. 100% in your browser.",
  category: "seo-tools",
  group: "Content",
  icon: "Heading",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-20",

  h1: "Heading Checker: Audit Your H1–H6 Structure & Outline",
  tagline:
    "Paste a page's HTML and get its heading outline drawn as a clean H1–H6 tree, with every structural issue (no H1, multiple H1s, skipped levels, empty headings) flagged and explained so you can fix the hierarchy before it costs you accessibility or rankings.",
  longDescription:
    "The GigAI Heading Checker turns the invisible heading structure of a page into something you can actually read and reason about. Paste your full page source or just a section of markup and the tool parses it locally with the browser's native DOMParser, then draws every H1 through H6 as an indented outline, exactly the tree a screen reader announces and a search crawler uses to understand your content. Alongside the outline it runs a focused structural audit: it flags a missing H1, more than one H1, a document that opens on a lower level, headings that skip a rank (an H2 jumping straight to an H4), and empty heading tags that add noise without meaning. Each finding comes with a plain-English explanation of why it matters and how to correct it, not just a red mark. A live count of how many headings sit at each level, an overall structure score, and a one-line verdict give you the shape of the page at a glance. Because everything runs in your browser on the markup you paste, it works on staging builds, login-gated pages and unpublished drafts, and nothing you paste is ever uploaded, stored or logged.",

  ctaText: "Check heading structure",

  keywords: [
    "heading checker",
    "h1 checker",
    "heading structure checker",
    "heading outline tool",
    "html heading analyzer",
    "check h1 h2 h3",
    "heading hierarchy checker",
    "seo heading checker",
    "accessibility heading checker",
    "multiple h1 checker",
    "heading tag checker",
    "document outline tool",
  ],

  seo: {
    title: "Heading Checker: Audit H1–H6 Outline & Structure | GigAI Tools",
    description:
      "Free heading checker: paste HTML to see the H1–H6 outline as a tree and catch missing or multiple H1s, skipped levels and empty headings, with a fix for each. Nothing is uploaded.",
  },

  features: [
    {
      icon: "ListTree",
      title: "Full H1–H6 outline as a tree",
      description:
        "Every heading is drawn indented by its level, so you see the exact hierarchy a screen reader announces and a crawler reads: the true shape of your page, not the visual one.",
    },
    {
      icon: "TriangleAlert",
      title: "Catches the structural faults that matter",
      description:
        "Missing H1, multiple H1s, a page that opens below H1, levels that skip a rank (H2 → H4) and empty heading tags are each detected and called out clearly.",
    },
    {
      icon: "Wrench",
      title: "A plain-English fix for every issue",
      description:
        "No cryptic red marks. Each finding explains why it hurts accessibility or SEO and exactly what to change, demote a heading, merge duplicate H1s, or fill in empty tags.",
    },
    {
      icon: "Hash",
      title: "Per-level counts & structure score",
      description:
        "Live badges show how many headings sit at each level (H1…H6) and an overall score plus one-line verdict give you the page's structural health at a glance.",
    },
    {
      icon: "Link2",
      title: "Surfaces heading anchor IDs",
      description:
        "Where a heading carries an id, it's shown alongside so you can wire up in-page anchor links and a table of contents against the real slugs.",
    },
    {
      icon: "ShieldCheck",
      title: "Private, works on any markup",
      description:
        "Parsing happens entirely in your browser, so you can audit staging builds, gated pages and unpublished drafts: nothing you paste is uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Fix accessibility before it ships",
      description:
        "A logical heading order is how screen-reader users navigate a page. Seeing skipped levels and empty headings here lets you correct the outline before assistive-tech users hit it.",
    },
    {
      title: "Give crawlers a clean content map",
      description:
        "Search engines lean on your heading hierarchy to understand what a page is about. A single clear H1 and a properly nested outline make your topic and sub-topics unmistakable.",
    },
    {
      title: "Understand a page in seconds",
      description:
        "Instead of scrolling markup hunting for headings, you get the whole outline drawn as a tree, ideal for reviewing a template, a CMS export or a page you didn't write.",
    },
    {
      title: "No account, no upload, no wait",
      description:
        "Paste and read the result instantly in the browser. It runs on confidential or pre-launch pages without any of it ever leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Copy your page's HTML",
      description:
        "View source (Ctrl+U / Cmd+Option+U) and copy the markup, or export the HTML from your CMS. A full document or just the section with your headings both work.",
    },
    {
      title: "Paste it into the checker",
      description:
        "Drop the markup into the box, or load the built-in sample to see the audit in action. Parsing starts automatically and runs entirely in your browser.",
    },
    {
      title: "Read the outline and issues",
      description:
        "Scan the indented H1–H6 tree, check the per-level counts, and review each flagged issue with its explanation and fix.",
    },
    {
      title: "Correct the hierarchy and re-check",
      description:
        "Apply the suggested fixes in your template or content, paste the updated markup back in, and confirm the outline is now clean.",
    },
  ],

  formats: {
    input: ["HTML"],
    output: ["Heading outline", "Report"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Audit a page's on-page structure",
      description:
        "Confirm a page has exactly one keyword-focused H1 and a logical H2/H3 nesting that reflects its topic, then hand a precise list of fixes to the content or dev team.",
    },
    {
      audience: "Accessibility engineer",
      title: "Verify a logical reading order",
      description:
        "Check that headings never skip a level and that none are empty, so screen-reader users get an outline they can actually navigate, a core WCAG expectation.",
    },
    {
      audience: "Frontend developer",
      title: "Sanity-check a template's headings",
      description:
        "Paste a rendered page to make sure a layout and a page component aren't both emitting an H1, and that reusable components sit at the right level in context.",
    },
    {
      audience: "Content editor",
      title: "Tidy a long article's outline",
      description:
        "See a guide or blog post as a heading tree to spot sections promoted or demoted by accident, and build a table of contents from the real hierarchy.",
    },
  ],

  troubleshooting: [
    {
      problem: "The checker says no headings were found, but my page clearly has them.",
      solution:
        "The tool audits the HTML you paste, not a rendered live page. If your headings are injected by JavaScript after load, copy the DOM from your browser's Elements panel (right-click a heading → Copy → Copy outerHTML, or copy the whole <body>) rather than the raw View-Source, which shows only the initial server markup.",
    },
    {
      problem: "It flags multiple H1s but I only wrote one.",
      solution:
        "A site header, a hero component and the page body can each emit an H1 without you noticing. Search the pasted markup for '<h1' to find every instance. Usually a shared layout is adding one on top of your content's H1. Keep a single H1 per page and demote the rest.",
    },
    {
      problem: "Why is a visually large heading not in the outline?",
      solution:
        "The checker only counts real <h1>–<h6> elements. Text styled to look like a heading with CSS (a big, bold <div> or <p>) is invisible to crawlers and screen readers alike. Convert it to a genuine heading tag at the correct level so it joins the outline.",
    },
    {
      problem: "Is a skipped heading level always wrong?",
      solution:
        "Going from H2 straight to H4 skips H3 and breaks the outline for assistive tech, so it's flagged. Jumping back up, H4 to H2 to start a new section, is normal and fine. The check only warns when you descend more than one level at once.",
    },
  ],

  tips: [
    "Use exactly one H1 per page and make it describe the page's main topic, it's the strongest on-page heading signal for both SEO and accessibility.",
    "Never pick a heading level for its size. Choose the level for its place in the hierarchy and use CSS to style it.",
    "Don't skip levels on the way down (an H2 should be followed by H3s, not H4s) so the outline stays navigable for screen-reader users.",
    "Give important headings a stable id so you can link to them and build an automatic table of contents from the outline.",
    "Keep decorative or empty <h_> tags out of your markup. An empty heading adds a meaningless stop for assistive technology.",
  ],

  security:
    "Every check runs locally in your browser using its native DOMParser. The HTML you paste is never uploaded, stored or logged. That makes it safe to audit staging builds, login-gated pages and unpublished drafts, and closing the tab erases everything you pasted.",

  faq: [
    {
      question: "What does a heading checker actually check?",
      answer:
        "It extracts every H1 through H6 element from your HTML and builds the document outline: the nested structure screen readers and search crawlers use. Then it audits that outline for the faults that matter: a missing H1, more than one H1, a page that starts below H1, heading levels that skip a rank, and empty heading tags. Each issue is explained with a fix.",
    },
    {
      question: "Should every page have exactly one H1?",
      answer:
        "As a rule of thumb, yes. A single H1 that names the page's main topic gives both search engines and assistive technology one clear anchor for what the page is about. HTML5's outline algorithm technically allows multiple H1s inside sectioning elements, but browsers never implemented it, so in practice one H1 per page remains the safe, recommended pattern, and this tool flags anything else.",
    },
    {
      question: "Why does skipping heading levels hurt?",
      answer:
        "Screen-reader users navigate by jumping between headings and rely on the levels to understand nesting: an H3 is a sub-point of the H2 above it. If you go from H2 straight to H4, that mental map breaks and the H4 appears to belong to a section that doesn't exist. It also muddies the topical hierarchy crawlers infer. Descend one level at a time. Jumping back up to start a new section is fine.",
    },
    {
      question: "Does the checker read a live URL?",
      answer:
        "No, and that's deliberate. Everything runs in your browser with no server, so it audits the HTML you paste rather than fetching a URL. That keeps it completely private and lets it work on staging, gated and unpublished pages. Copy the page source (or the live DOM from your Elements panel if headings are added by JavaScript) and paste it in.",
    },
    {
      question: "My headings are added by JavaScript: will they show up?",
      answer:
        "Only if you paste the rendered DOM rather than the raw source. View-Source and the initial HTML show the server response before scripts run, so client-rendered headings won't appear. Open your browser's DevTools, right-click the <body> in the Elements panel, choose Copy → Copy outerHTML, and paste that. It reflects the final rendered headings.",
    },
    {
      question: "Do heading tags still matter for SEO in 2026?",
      answer:
        "Yes. Headings are a lightweight but genuine signal: they help search engines parse a page's structure and the relationship between its sections, and a clear H1 reinforces the page's primary topic. They're not a magic ranking lever, but a messy or missing outline makes a page harder to understand for both crawlers and users, and a clean one is a low-effort win.",
    },
    {
      question: "Is it a problem to have an empty heading tag?",
      answer:
        "Yes. An <h_> with no text (often left behind by a page builder or an icon-only element) creates a heading with nothing to announce, so a screen reader stops on a blank entry and the outline gains a meaningless node. The checker flags empty headings so you can either add real text or remove the tag entirely.",
    },
    {
      question: "Are my inputs sent anywhere?",
      answer:
        "No. All parsing and analysis happen entirely in your browser with its native DOMParser. Nothing you paste is uploaded, stored or logged, so it's safe to check confidential, internal or pre-launch pages, close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release. Paste HTML to get the H1–H6 outline as a tree plus structural checks for missing/multiple H1s, skipped levels and empty headings, each with a fix.",
    },
    {
      date: "2026-06-26",
      change:
        "Added per-level heading counts, an overall structure score with a one-line verdict, and surfaced heading id anchors in the outline.",
    },
  ],

  relatedTools: [
    "meta-tag-analyzer",
    "html-validator",
    "google-serp-preview",
    "meta-tag-generator",
  ],
};

export default headingChecker;
