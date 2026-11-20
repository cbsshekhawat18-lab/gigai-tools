import type { Tool } from "@/types";

/**
 * Rich Results Preview: the paste-first structured-data auditor.
 *
 * Paste JSON-LD (or a whole page's HTML) and it detects every schema.org
 * `@type`, validates each against its required and recommended properties, and
 * reports which Google rich-result features the markup is eligible for, FAQ
 * accordions, product price/rating snippets, breadcrumbs, event dates, recipe
 * cards, video thumbnails and more. Parsing and validation run entirely in the
 * browser via `lib/seo-tools/schema.ts` (native JSON + DOMParser), so nothing
 * is uploaded. Copy is unique to *previewing and validating existing*
 * structured data (not generating it) and honest that this is a client-side
 * eligibility check, not Google's live Rich Results Test.
 */
const richResultsPreview: Tool = {
  slug: "rich-results-preview",
  title: "Rich Results Preview",
  description:
    "Paste JSON-LD or a page's HTML to detect schema types, validate required properties, and see which Google rich results your structured data is eligible for, 100% in your browser.",
  category: "seo-tools",
  group: "SEO Preview",
  icon: "Sparkles",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Rich Results Preview, Validate JSON-LD & Check Rich-Result Eligibility",
  tagline:
    "Paste your structured data (or the whole page) and get an instant, honest read on it: every schema.org type detected, every required and recommended property checked, and a clear verdict on which Google rich results the markup is eligible for. Runs entirely in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Rich Results Preview reads the structured data you paste, a raw JSON-LD object, an array of blocks, or an entire page's HTML with the `<script type=\"application/ld+json\">` tags still in it, and turns it into a prioritised eligibility report. It first parses the input safely (with precise, line-aware errors when the JSON is malformed), then walks every node to detect each schema.org `@type` present, including nested types like the Offer inside a Product or the Question nodes inside an FAQPage. Each detected type is graded against schema.org's required and recommended properties: missing required fields are hard errors that disqualify the markup from a rich result, while missing recommended fields are warnings that quietly cost you eligibility or a richer display. On top of the raw validation, the tool maps what it found to the concrete Google rich-result features the page could earn: an FAQ accordion, product price and star ratings, a breadcrumb trail, event dates, a recipe card, a video thumbnail, sitelinks and more, so you understand the SEO payoff, not just the syntax. A 0–100 score and letter grade summarise the whole payload at a glance, and because it parses markup you paste using the browser's own JSON engine with zero network calls, it happily audits staging pages, competitor markup you copied, or a template you haven't shipped yet. To be clear about scope: this is a fast, pragmatic client-side linter and eligibility guide, not Google's live Rich Results Test: always confirm final eligibility on Google's own checker before you rely on it.",

  ctaText: "Preview rich results",

  keywords: [
    "rich results preview",
    "rich results test",
    "schema markup checker",
    "rich snippet preview",
    "structured data testing tool",
    "google rich results",
    "faq rich result checker",
    "product schema checker",
  ],

  seo: {
    title:
      "Rich Results Preview: Free JSON-LD & Structured Data Validator | GigAI Tools",
    description:
      "Paste JSON-LD or page HTML to validate structured data, detect schema types, check required properties and preview Google rich-result eligibility (FAQ, Product, Breadcrumb, Event, Recipe, Video). Free, 100% in your browser.",
  },

  features: [
    {
      icon: "ScanSearch",
      title: "Detects every schema type",
      description:
        "Paste one object, an array, or full HTML: the analyzer finds every schema.org @type present, including nested nodes like the Offer inside a Product or the Questions inside an FAQPage.",
    },
    {
      icon: "ShieldCheck",
      title: "Required vs. recommended check",
      description:
        "Each type is graded against schema.org's required and recommended properties. Missing required fields are errors that block a rich result. Missing recommended ones are warnings that cost eligibility.",
    },
    {
      icon: "Sparkles",
      title: "Rich-result eligibility mapping",
      description:
        "See the concrete Google features your markup could earn, FAQ accordion, price and star ratings, breadcrumbs, event dates, recipe cards, video thumbnails. Not just a raw pass/fail.",
    },
    {
      icon: "Bug",
      title: "Precise JSON error reporting",
      description:
        "Malformed JSON-LD returns a clear, specific parse error instead of a silent blank, so you can fix a stray comma or unquoted key in seconds.",
    },
    {
      icon: "Code2",
      title: "Works on HTML or raw JSON-LD",
      description:
        "Drop in a whole page's source and it pulls out every application/ld+json script for you, or paste a bare JSON object. Both are validated the same way.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Parsing and validation use the browser's native JSON engine and DOMParser on your device. Your markup (including private prices or unpublished pages) is never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Catch disqualifying errors before Google does",
      description:
        "A single missing required property silently drops a page from a rich result. This tool surfaces those errors the moment you paste, so you fix them in the editor instead of discovering the loss weeks later in Search Console.",
    },
    {
      title: "Understand the SEO payoff, not just the syntax",
      description:
        "Instead of a bare 'valid' stamp, you see which rich-result features the markup unlocks (an FAQ accordion, star ratings, breadcrumbs) so you can prioritise the schema that actually moves click-through.",
    },
    {
      title: "Audit anything, including private pages",
      description:
        "Because it works on markup you paste with no network calls, you can validate staging environments, login-gated pages, competitor markup you copied, or a template you haven't shipped, none of which a live URL tester can reach.",
    },
    {
      title: "Safe for confidential structured data",
      description:
        "Everything runs locally, so structured data containing unpublished prices, internal event details or personal author information is checked without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Grab your structured data",
      description:
        "Copy the `<script type=\"application/ld+json\">` block from your page's source, or the raw JSON-LD from your CMS or generator. You can also copy the entire page HTML: the tool will find the scripts inside it.",
    },
    {
      title: "Paste it in",
      description:
        "Paste (or drop a .json/.html file) into the analyzer. It parses safely and, if the JSON is malformed, tells you exactly what's wrong so you can fix it.",
    },
    {
      title: "Read the eligibility report",
      description:
        "See every detected type, its required/recommended check, and the Google rich-result features it qualifies for. Errors block a rich result. Warnings are improvements worth making.",
    },
    {
      title: "Fix, re-paste, and confirm",
      description:
        "Address the flagged errors, paste the updated markup back in to re-check, then confirm final eligibility with Google's official Rich Results Test before publishing.",
    },
  ],

  formats: {
    input: ["JSON-LD", "HTML"],
    output: ["Report"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Validate structured data across templates",
      description:
        "Paste the JSON-LD your CMS emits for each page template to confirm required properties are present and no type has silently broken after a theme update.",
    },
    {
      audience: "Developer",
      title: "Debug a rich result that isn't showing",
      description:
        "When a page's FAQ or product snippet vanishes from Search, paste the live markup to see instantly whether a missing required property or malformed JSON is the cause.",
    },
    {
      audience: "E-commerce manager",
      title: "Check product markup before a launch",
      description:
        "Validate Product schema (price, currency, availability and aggregate rating) on a staging page so price and review rich results are eligible the day it goes live.",
    },
    {
      audience: "Content / competitive analyst",
      title: "Inspect a competitor's structured data",
      description:
        "Copy a rival page's ld+json scripts and paste them here to see exactly which rich-result features they've marked up for. No live URL access needed.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says the JSON is invalid but the page works fine.",
      solution:
        "You probably pasted a fragment with a trailing comma, an unquoted key, or the surrounding `<script>` tag without its content. Paste the full JSON object (or the whole HTML page and let the tool extract the script), and read the parse error. It points at the exact problem.",
    },
    {
      problem: "A required-property error appears for a field I did set.",
      solution:
        "The property is likely on the wrong node: e.g. `price`/`priceCurrency` belong on the Offer, not directly on the Product, and `startDate` on the Event, not its location. Move it to the node the error path names and the error clears.",
    },
    {
      problem: "My markup passes here but Google's test flags it.",
      solution:
        "This is a pragmatic required/recommended linter, not a full schema.org shape validator, and Google adds its own content-quality and eligibility rules on top of valid JSON-LD. Always confirm on Google's Rich Results Test before relying on a rich result.",
    },
    {
      problem: "Nothing is detected even though I pasted HTML.",
      solution:
        "The page has no `<script type=\"application/ld+json\">` blocks, or its structured data is in Microdata/RDFa rather than JSON-LD. This tool checks JSON-LD. Convert Microdata to JSON-LD (Google's recommended format) and paste that.",
    },
  ],

  tips: [
    "Paste the whole page HTML when in doubt, the tool extracts every ld+json script, so you don't have to hunt for them one at a time.",
    "Fix required-property errors first: they're the only issues that outright disqualify a page from a rich result. Warnings are polish.",
    "Multiple schema blocks on one page are normal and fine: an Article, a BreadcrumbList and an Organization can all coexist, and each is checked independently.",
    "Only mark up content that's actually visible on the page. Valid markup for hidden or mismatched content can trigger a manual action even if it passes here.",
    "After fixing everything, run the same markup through Google's Rich Results Test. Passing this check is necessary, but Google has the final say on eligibility.",
  ],

  security:
    "Every byte you paste is parsed and validated locally in your browser using its native JSON engine and DOMParser: nothing is uploaded to any server. Your structured data, including private prices, unpublished event details or personal author information, is never stored, logged or transmitted. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What does the Rich Results Preview actually check?",
      answer:
        "It parses the JSON-LD you paste, detects every schema.org @type inside it (including nested types), and validates each against schema.org's required and recommended properties. It then maps what it found to the Google rich-result features the markup is eligible for, FAQ accordions, product price and ratings, breadcrumbs, event dates, recipe cards, video thumbnails and more. Missing required properties are reported as errors. Missing recommended ones as warnings.",
    },
    {
      question: "Is this the same as Google's Rich Results Test?",
      answer:
        "No, and we're deliberately honest about that. Google's Rich Results Test fetches a live URL from Google's servers and applies Google's full, private set of content and eligibility rules. This tool is a fast client-side linter that checks required and recommended properties on markup you paste. It can't fetch a URL and doesn't know Google's proprietary rules. Use it to catch the vast majority of problems instantly, then confirm final eligibility on Google's official test.",
    },
    {
      question: "Can I paste a whole HTML page, or just the JSON-LD?",
      answer:
        "Both. If you paste full HTML, the tool automatically extracts every `<script type=\"application/ld+json\">` block and validates them. If you paste a bare JSON-LD object or an array of them, it validates that directly. Either way the checks are identical.",
    },
    {
      question: "Which schema types are supported?",
      answer:
        "The validator has required/recommended rules for the types that most commonly earn rich results: Article, BlogPosting, NewsArticle, FAQPage (and Question), Product (and Offer), Organization, LocalBusiness, Event, BreadcrumbList, VideoObject, Recipe, Person, Review, SoftwareApplication and AggregateRating. Other schema.org types are still detected and shown. They just aren't graded against a required-property ruleset.",
    },
    {
      question: "Why does it say my JSON-LD is invalid?",
      answer:
        "JSON-LD must be strictly valid JSON. The most common causes are a trailing comma, single quotes instead of double quotes, an unquoted property name, or pasting the `<script>` wrapper without its inner content. The tool returns the exact parse error so you can pinpoint and fix it, or paste the entire HTML page and let the tool pull the script out cleanly.",
    },
    {
      question: "Will valid markup here guarantee a rich result in Google?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show one based on markup validity, content quality and its own eligibility rules. What passing this check guarantees is that your JSON-LD is syntactically valid and has the required properties present, which is the prerequisite. Always confirm with Google's Rich Results Test and monitor Search Console.",
    },
    {
      question: "Does the tool send my structured data anywhere?",
      answer:
        "No. All parsing and validation happen locally in your browser using its built-in JSON engine and DOMParser. Your markup never leaves your device. There is nothing for us to upload, store or log. It's safe to validate structured data containing private or unpublished information.",
    },
    {
      question: "Can I validate a competitor's structured data?",
      answer:
        "Yes. View their page's source, copy the `<script type=\"application/ld+json\">` blocks (or the whole HTML), and paste them here. You'll see exactly which schema types they've implemented and which rich-result features they're eligible for, useful competitive intelligence, all checked locally on your device.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release. Paste JSON-LD or full HTML, automatic type detection, required/recommended validation, rich-result eligibility mapping, 0–100 score and grade, precise JSON parse errors, sample and file drop.",
    },
    {
      date: "2026-06-27",
      change:
        "Added automatic extraction of every application/ld+json script from pasted HTML, plus per-type eligibility descriptions for FAQ, Product, Breadcrumb, Event, Recipe and Video results.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined the report with grouped errors, recommended warnings and detected-types summary, and a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "meta-tag-analyzer",
    "google-serp-preview",
    "faq-schema-generator",
    "json-formatter",
  ],
};

export default richResultsPreview;
