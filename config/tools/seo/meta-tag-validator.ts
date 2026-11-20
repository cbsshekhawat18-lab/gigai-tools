import type { Tool } from "@/types";

/**
 * Meta Tag Validator: the "Validators" group's paste-first conformance checker.
 *
 * Where the Meta Tag Analyzer *audits* a page and reports its state, the
 * Validator holds pasted HTML up against an explicit rulebook of SEO
 * best-practices and returns a strict, graded pass / warn / fail verdict per
 * rule (grouped into Foundations, Length, Social and Conflicts) so the copy
 * below is written around validation, conformance and "does my <head> meet the
 * standard", not around generation or general analysis. Everything runs on
 * markup the user already has; a static export has no server to crawl a live URL.
 */
const metaTagValidator: Tool = {
  slug: "meta-tag-validator",
  title: "Meta Tag Validator",
  description:
    "Paste your page's HTML and validate its meta tags against SEO best practices: title and description length, canonical, robots, viewport, charset, Open Graph and Twitter completeness: as a graded pass/fail checklist, 100% in your browser.",
  category: "seo-tools",
  group: "Validators",
  icon: "ListChecks",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Meta Tag Validator. Check Your SEO Tags Against Best Practices",
  tagline:
    "Paste a page's HTML and get a strict, letter-graded verdict on every meta tag that matters, title and description length, canonical, robots, viewport, charset, and Open Graph / Twitter completeness, each rule marked pass, warn or fail with an exact fix.",
  longDescription:
    "The GigAI Meta Tag Validator checks a page's `<head>` against an explicit rulebook of SEO best practices and returns a graded conformance report rather than a vague 'looks fine'. Paste your full page source (or just the `<head>`), and the browser's own parser extracts every relevant tag and runs it through categorised rules: Foundations (a single `<title>`, one meta description, a canonical link, a responsive viewport, a declared charset, and a robots directive that isn't accidentally blocking the page), Length (title and description measured against the 50–60 and 150–160 character sweet spots), Social (Open Graph and Twitter Card completeness: the specific properties each network needs to render a rich card), and Conflicts (duplicate titles or descriptions, and a canonical that fights a noindex). Each rule is marked pass, warn or fail with a plain-English reason and the exact markup to fix it, and the whole page earns an A–F grade so you can tell at a glance whether it's ship-ready. Because the whole thing runs locally with the native DOMParser, nothing you paste (staging URLs, gated pages, unreleased copy) is ever uploaded, stored or logged.",

  ctaText: "Validate meta tags",

  /* Head-wide conformance intents. "open graph validator" / "twitter card
     validator" live on social-share-inspector, "meta description length
     checker" on google-serp-preview - kept off here to avoid cannibalizing. */
  keywords: [
    "meta tag validator",
    "validate meta tags",
    "seo meta tag test",
    "html head checker",
    "canonical tag checker",
    "viewport meta tag checker",
    "title tag validator",
    "robots meta checker",
    "head tag validator",
    "seo tag conformance",
    "duplicate meta tags checker",
  ],

  seo: {
    title: "Meta Tag Validator. Check SEO Tags Against Best Practices | GigAI Tools",
    description:
      "Free meta tag validator: paste your HTML and get a graded pass/fail check of title, description, canonical, robots, viewport, charset and Open Graph/Twitter tags. Nothing is uploaded.",
  },

  features: [
    {
      icon: "ListChecks",
      title: "Rulebook-driven, not vibes",
      description:
        "Every check maps to a named SEO best-practice rule with a pass, warn or fail state, so you get a defensible verdict on each tag, not a single ambiguous score.",
    },
    {
      icon: "GraduationCap",
      title: "A–F conformance grade",
      description:
        "The page earns a letter grade from the weighted results, so you can tell at a glance whether the head is ship-ready or still failing essentials.",
    },
    {
      icon: "Ruler",
      title: "Exact length validation",
      description:
        "Title and description are measured against the 50–60 and 150–160 character sweet spots, flagging copy that's too short to earn clicks or long enough to be truncated.",
    },
    {
      icon: "Share2",
      title: "Open Graph & Twitter completeness",
      description:
        "Checks for the specific og:* and twitter:* properties each network needs (og:title, og:image, twitter:card) so shared links render a rich card instead of a plain box.",
    },
    {
      icon: "GitCompareArrows",
      title: "Conflict & duplicate detection",
      description:
        "Catches two <title> tags, duplicate meta descriptions, and the classic canonical-vs-noindex contradiction that quietly keeps pages out of the index.",
    },
    {
      icon: "Wrench",
      title: "Copy-paste fix for every failure",
      description:
        "Each warn or fail row ships the exact markup to add or change. The fix is right next to the problem, so you can patch the head without leaving the page.",
    },
  ],

  benefits: [
    {
      title: "Know if a page is really ship-ready",
      description:
        "A letter grade plus per-rule pass/fail turns 'the SEO tags are probably fine' into a concrete list of what passes and what still needs fixing before you deploy.",
    },
    {
      title: "Catch the silent index killers",
      description:
        "A stray noindex, a canonical pointing at the wrong URL, or a missing viewport can quietly sink a page: the validator surfaces those exact failures instead of letting them ship.",
    },
    {
      title: "Fix it without hunting the spec",
      description:
        "Because every failing rule includes the corrected markup, you patch the head directly instead of cross-referencing documentation for the right attribute names.",
    },
    {
      title: "Private by design",
      description:
        "Validation runs entirely in your browser with the native parser, so staging URLs, gated pages and unreleased copy never leave your machine.",
    },
  ],

  howTo: [
    {
      title: "Copy your page's HTML",
      description:
        "View source on the page (Ctrl+U / Cmd+Option+U) and copy it, or grab just the <head> block. Works on live, staging, login-gated and unreleased pages alike.",
    },
    {
      title: "Paste it into the validator",
      description:
        "Drop the markup into the box. The browser parses it instantly and runs every best-practice rule locally. Nothing is uploaded.",
    },
    {
      title: "Read the graded checklist",
      description:
        "Scan the A–F grade, then work down the pass/warn/fail rules grouped into Foundations, Length, Social and Conflicts.",
    },
    {
      title: "Apply the inline fixes and re-check",
      description:
        "Copy the corrected markup shown next to each failing rule into your template, paste the updated head back in, and confirm the grade improves.",
    },
  ],

  formats: {
    input: ["HTML", "<head> markup"],
    output: ["Validation report", "Pass/fail checklist"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Pre-launch head audit",
      description:
        "Validate a page's meta tags against the checklist before it goes live, so a missing canonical or an accidental noindex never reaches production.",
    },
    {
      audience: "Frontend developer",
      title: "Verify template output",
      description:
        "Confirm the head your framework or CMS actually renders is conformant: catching the duplicate title a layout and a page component both emit.",
    },
    {
      audience: "Agency / QA",
      title: "Client site sign-off",
      description:
        "Run each key page through the validator and hand the client a clear, graded pass/fail report instead of a subjective 'the SEO is good' claim.",
    },
    {
      audience: "Content editor",
      title: "Length compliance check",
      description:
        "Paste a draft's rendered head to confirm the title and description sit inside the ideal character ranges before publishing.",
    },
  ],

  troubleshooting: [
    {
      problem: "Can I just paste a URL to validate a live page?",
      solution:
        "No. This tool runs entirely in your browser and a static site has no server to fetch a remote page from. Open the page, view its source (Ctrl+U / Cmd+Option+U), copy the HTML, and paste it here. This also lets you validate staging, internal and login-gated pages a URL-based checker can't reach.",
    },
    {
      problem: "The validator says my meta description is missing but I set one.",
      solution:
        "It reads the rendered HTML, not your source template. If the description is injected by client-side JavaScript, view source may show the pre-render markup without it, copy the head from your browser's Elements/Inspector panel (the live DOM) instead of raw view-source.",
    },
    {
      problem: "Why is a canonical flagged when the page also has noindex?",
      solution:
        "That's a real conflict: a canonical tells engines this is the authoritative URL to index, while noindex tells them not to index it. Decide which you mean: remove the noindex to let the page rank, or drop the canonical if the page genuinely shouldn't be indexed.",
    },
    {
      problem: "My Open Graph is marked incomplete though I have some og: tags.",
      solution:
        "A rich social card needs at least og:title and og:image (ideally 1200×630). Partial Open Graph still renders a plain link on some platforms, so the validator warns until both key properties are present.",
    },
  ],

  tips: [
    "Validate the live DOM, not just view-source, if any meta tags are set by JavaScript: copy the <head> from your browser's Inspector for an accurate check.",
    "Aim for a clean A grade on every indexable page. Treat warnings as polish and failures as blockers.",
    "A single canonical per page consolidates ranking signals: the validator flags duplicates and self-conflicting directives.",
    "Keep exactly one <title> and one meta description. Template layers stacking their own is the most common duplicate failure.",
    "Add og:title and og:image to every share-worthy page so the card renders rich, then re-validate to confirm the Social group passes.",
  ],

  security:
    "Every check runs locally in your browser using its native HTML parser. Nothing you paste is uploaded, stored or logged. Staging URLs, gated pages and unreleased copy stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What does the Meta Tag Validator actually check?",
      answer:
        "It validates a page's head against SEO best practices: a single unique <title> in the 50–60 character range, one meta description around 150–160 characters, a canonical link, a responsive viewport, a declared charset, a robots directive that isn't accidentally blocking the page, and Open Graph plus Twitter Card completeness. It also catches conflicts like duplicate titles or a canonical fighting a noindex. Each rule is marked pass, warn or fail with a fix, and the page gets an A–F grade.",
    },
    {
      question: "How is this different from the Meta Tag Analyzer?",
      answer:
        "The Analyzer reports the state of your tags and reconstructs a live search and social preview from them. The Validator is stricter and conformance-focused: it runs an explicit rulebook, groups results into Foundations, Length, Social and Conflicts, gives each rule a pass/warn/fail verdict, and grades the whole page A–F, so it answers 'does this head meet the standard?' rather than 'what's on this page?'.",
    },
    {
      question: "Why can't I just enter a URL?",
      answer:
        "Everything runs client-side in your browser and this is a static site with no backend to fetch a remote page. Pasting the HTML keeps your data private and, crucially, lets you validate staging, internal and login-gated pages that a server-based checker could never reach. Open the page, view source, copy, and paste.",
    },
    {
      question: "What title and description lengths does it consider valid?",
      answer:
        "Titles are ideal at roughly 50–60 characters (acceptable 30–65), and descriptions at roughly 150–160 (acceptable 70–165). Google truncates by rendered pixel width rather than a hard character count, so treat these as reliable guides: the validator warns as you approach the edges and fails when copy is far too short or long.",
    },
    {
      question: "Does it validate Open Graph and Twitter Card tags?",
      answer:
        "Yes. It checks for the properties that make a share card render richly: og:title and og:image for Open Graph (used by Facebook, LinkedIn, Slack and more), and twitter:card for X. Partial social markup is flagged as a warning with the specific tags to add, since an incomplete card often falls back to a plain link.",
    },
    {
      question: "Will it catch a duplicate title or meta description?",
      answer:
        "Yes. Two <title> tags or more than one meta description is a common failure when a site layout and a page component each emit their own. The validator detects the duplicates and tells you to keep exactly one, since search engines can pick the wrong one otherwise.",
    },
    {
      question: "What does the letter grade mean?",
      answer:
        "The grade is a weighted roll-up of every rule: passing checks count in full, warnings count partially, and failures count against you. An A means the head is essentially conformant and ship-ready, while lower grades point to missing essentials. The per-rule list always shows exactly which checks pulled the grade down.",
    },
    {
      question: "Is my HTML sent anywhere?",
      answer:
        "No. All parsing and validation happen in your browser with its native DOMParser. The markup you paste is never uploaded, stored or logged. That makes it safe to validate confidential, staging or pre-launch pages. Close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release. Paste HTML to validate meta tags against best practices, grouped into Foundations, Length, Social and Conflicts, with per-rule pass/warn/fail verdicts and an A–F grade.",
    },
    {
      date: "2026-06-26",
      change:
        "Added the canonical-vs-noindex conflict rule and inline copy-paste fixes for every failing check.",
    },
    {
      date: "2026-06-30",
      change:
        "Added an extracted-tags reference panel and refined the Open Graph / Twitter completeness rules to match how each network renders cards.",
    },
  ],

  relatedTools: [
    "meta-tag-analyzer",
    "meta-tag-generator",
    "open-graph-generator",
    "google-serp-preview",
    "json-formatter",
    "url-encoder",
  ],
};

export default metaTagValidator;
