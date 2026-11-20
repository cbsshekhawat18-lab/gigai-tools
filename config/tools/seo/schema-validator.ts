import type { Tool } from "@/types";

/**
 * Schema Validator (Structured Data Validator), the paste-first checker for the
 * "Validators" group. Paste raw JSON-LD, a full <script type="application/ld+json">
 * block, or an entire page's HTML and the tool detects every structured-data block,
 * validates each against schema.org's required/recommended properties per @type, and
 * surfaces rich-result eligibility notes. Runs entirely on `lib/seo-tools/schema.ts`
 * (validateJsonLd) plus the browser's native DOMParser/JSON engine: nothing is
 * uploaded. Copy is unique to structured-data validation and written to rank for the
 * exact queries people type when a rich result won't show or Search Console flags an
 * "invalid structured data" error.
 */
const schemaValidator: Tool = {
  slug: "schema-validator",
  title: "Schema Validator",
  description:
    "Paste JSON-LD or a full HTML page and validate every structured-data block against schema.org, required vs recommended properties, per-@type checks and rich-result notes. 100% in your browser.",
  category: "seo-tools",
  group: "Validators",
  icon: "CircleCheck",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-21",

  h1: "Schema Validator. Check JSON-LD Structured Data for Rich Results",
  tagline:
    "Paste raw JSON-LD, a script tag, or an entire page's HTML. The validator finds every structured-data block, checks each one against schema.org's required and recommended properties, and tells you exactly what's blocking a rich result, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Schema Validator is a structured-data linter that reads what you actually shipped and grades it the way a search engine's parser would. Paste a single JSON-LD object, a `<script type=\"application/ld+json\">` block, an array of nodes, or drop in a whole page's HTML, the tool extracts every JSON-LD script it can find, parses each one, and validates it against schema.org's required and recommended properties for its @type using the same engine behind our Schema Markup Generator. For each block you get its detected @type, a pass/warn/fail breakdown, and precise, actionable messages: missing required properties are flagged as errors that disqualify a rich result, missing recommended ones as warnings that weaken eligibility, and clean blocks are confirmed as ready to publish. It walks nested nodes too, so an Offer inside a Product or a Question inside an FAQPage is checked in place. Because parsing and validation happen entirely on your device using the browser's native JSON and HTML engines, your prices, author names, event details and unpublished markup never leave your machine, there's nothing for us to store, log or see. This is a pragmatic required/recommended linter rather than a full schema.org shape engine, so it pairs perfectly with Google's Rich Results Test: fix everything here first, then confirm final Google-specific eligibility on the official checker before you publish.",

  ctaText: "Validate structured data",

  keywords: [
    "schema validator",
    "structured data validator",
    "schema markup validator",
    "schema.org validator",
    "rich results checker",
    "faq schema validator",
    "product schema validator",
    "check schema markup",
  ],

  seo: {
    title:
      "Schema Validator, Free JSON-LD Structured Data Checker | GigAI Tools",
    description:
      "Free schema markup validator: paste JSON-LD or a full HTML page and check every structured-data block against schema.org. Detects each @type, flags missing required & recommended properties for Google rich results, 100% in your browser.",
  },

  features: [
    {
      icon: "ScanSearch",
      title: "Detects every block on the page",
      description:
        "Paste one object, a script tag, an array of nodes or a whole page's HTML: the validator pulls out each <script type=\"application/ld+json\"> block and checks them all, not just the first.",
    },
    {
      icon: "ListChecks",
      title: "Required vs recommended, per @type",
      description:
        "Each block is graded against schema.org's required (error) and recommended (warning) properties for its exact @type, so you see instantly what disqualifies a rich result and what merely weakens it.",
    },
    {
      icon: "GitBranch",
      title: "Walks nested nodes",
      description:
        "An Offer inside a Product, a Question inside an FAQPage, an AggregateRating or PostalAddress. Nested typed nodes are validated in place with a dotted path to the exact property.",
    },
    {
      icon: "Bug",
      title: "Precise parse errors",
      description:
        "Invalid JSON, a missing @type or @context, or a block that isn't an object are reported with the exact reason and location. No silent \"it just doesn't work\".",
    },
    {
      icon: "Gauge",
      title: "Scored, grouped report",
      description:
        "A 0–100 score and A–F grade summarise health across all blocks, with errors, warnings and passes grouped per block so a colleague can act on it at a glance.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is parsed and validated with your browser's native JSON and HTML engines. Prices, author names, event details and unpublished data are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Find out why a rich result won't show",
      description:
        "When an FAQ accordion, star rating or breadcrumb refuses to appear, it's almost always a missing required property. The validator names the exact @type and property so you fix the real cause, not a guess.",
    },
    {
      title: "Clear Search Console 'invalid structured data' errors",
      description:
        "Paste the markup Search Console is complaining about and see, per block, which required fields are absent: then fix them and re-check before requesting validation from Google.",
    },
    {
      title: "Audit markup you didn't write",
      description:
        "Inherited a template or plugin that injects JSON-LD? Paste the rendered page and audit every block it emits, including ones you didn't know were there.",
    },
    {
      title: "Safe for private and unpublished markup",
      description:
        "Because everything runs locally, you can validate staging pages, gated content and markup containing unreleased prices or personal data without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste your structured data",
      description:
        "Drop in raw JSON-LD, a full `<script type=\"application/ld+json\">` block, or copy an entire page's HTML source, the validator handles all three and finds every block.",
    },
    {
      title: "Read the per-block report",
      description:
        "Each detected block shows its @type, a score and a grouped list of checks: red errors are missing required properties, amber warnings are missing recommended ones, green rows confirm what's correct.",
    },
    {
      title: "Fix errors first, then warnings",
      description:
        "Required-property errors block eligibility, so clear those first. Then add recommended properties where you can, Google favours complete markup with images, authors and dates.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Once this validator is clean, paste the same markup into Google's Rich Results Test to confirm Google-specific eligibility rules on top of valid JSON-LD before publishing.",
    },
  ],

  formats: {
    input: ["JSON-LD", "HTML", "Script tag"],
    output: ["Validation report"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Audit a page's structured data before launch",
      description:
        "Paste the rendered HTML of a template page and confirm every JSON-LD block (Article, Breadcrumb, Organization) is valid and complete before it goes live.",
    },
    {
      audience: "Developer",
      title: "Debug JSON-LD emitted by a CMS or plugin",
      description:
        "When a plugin's markup fails Google's test, paste it here to see exactly which @type and property is wrong instead of eyeballing a wall of minified JSON.",
    },
    {
      audience: "E-commerce manager",
      title: "Verify Product & Offer markup",
      description:
        "Check that each product's Product block has a name and that its nested Offer carries price and priceCurrency, so listings stay eligible for price and review rich results.",
    },
    {
      audience: "Content team",
      title: "Validate FAQ and Recipe markup at scale",
      description:
        "Paste FAQPage or Recipe JSON-LD from a batch of posts to confirm every Question has an accepted answer and every recipe has its required fields before publishing.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says my JSON-LD is invalid JSON.",
      solution:
        "A trailing comma, a smart/curly quote pasted from a doc, or an unescaped character usually causes this. The error names the position, fix the syntax (or run it through the JSON Formatter) and re-validate.",
    },
    {
      problem: "No blocks were detected in my pasted HTML.",
      solution:
        "The validator looks for `<script type=\"application/ld+json\">` blocks. If your markup is Microdata or RDFa it won't be found: convert to JSON-LD (Google's recommended format). Also make sure you pasted the rendered source, not a JS bundle that injects it later.",
    },
    {
      problem: "A required-property error appears on markup that 'works'.",
      solution:
        "The property really is required for that @type: e.g. an Event needs name and startDate, a VideoObject needs name, thumbnailUrl and uploadDate. A rich result may still fail to appear until it's present, so add it.",
    },
    {
      problem: "Google's test flags something this validator passed.",
      solution:
        "This is a pragmatic required/recommended linter, not a full schema.org shape validator, and Google layers its own eligibility rules on top of valid JSON-LD. Always confirm with Google's Rich Results Test before publishing.",
    },
  ],

  tips: [
    "You can paste an array of JSON-LD nodes (e.g. [{Article}, {BreadcrumbList}]). Every node is detected and validated separately.",
    "Validating a live page? View source (Ctrl+U / Cmd+Option+U), copy it all, and paste, the tool extracts each JSON-LD script for you.",
    "Errors (red) block rich results. Warnings (amber) don't, but adding recommended fields like image, author and date materially improves eligibility.",
    "Keep each schema type in its own object rather than merging unrelated types. It validates cleaner and is easier for search engines to parse.",
    "After the validator is green, always run Google's Rich Results Test. Passing here is necessary, but Google adds its own final checks.",
  ],

  security:
    "Your structured data is parsed and validated entirely in your browser using its native JSON and HTML engines: nothing is uploaded to any server. No prices, author names, event details or organization data are stored, logged or transmitted, so you can safely validate staging pages, gated content and markup containing private or unpublished information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What does a schema validator check?",
      answer:
        "It parses your structured data (JSON-LD) and checks each block against schema.org's expectations for its @type: whether it's syntactically valid JSON, whether it declares a @type and @context, and whether the required and recommended properties for that type are present. Missing required properties are errors that can disqualify a rich result. Missing recommended ones are warnings that weaken eligibility. It's a pragmatic linter, so pair it with Google's official Rich Results Test.",
    },
    {
      question: "Can I paste a whole HTML page, or only JSON-LD?",
      answer:
        "Both. Paste raw JSON-LD, a single `<script type=\"application/ld+json\">` block, an array of nodes, or an entire page's HTML source. When you paste HTML, the validator extracts every JSON-LD script it finds and validates each one separately, so you can audit a full page in one pass.",
    },
    {
      question: "Why isn't my rich result showing even though the markup looks fine?",
      answer:
        "The most common reason is a missing required property for the @type: for example a Product without a name, or an Event without a startDate. Paste your markup here and the validator names the exact block and property. If everything is green here but Google still won't show a rich result, it's usually a Google-specific eligibility rule or a quality/content decision, confirm with Google's Rich Results Test.",
    },
    {
      question: "Does this validate Microdata or RDFa?",
      answer:
        "No. It validates JSON-LD, which is the format Google explicitly recommends and the format placed in a `<script type=\"application/ld+json\">` tag. If your page uses Microdata or RDFa, convert it to JSON-LD first: our Schema Markup Generator can produce the equivalent block for you.",
    },
    {
      question: "Which schema types are supported?",
      answer:
        "The validator recognises the most SEO-relevant types: Article, BlogPosting, NewsArticle, FAQPage (and Question), Product (and Offer), Organization, LocalBusiness, Event, BreadcrumbList, VideoObject, Recipe, Person, Review, SoftwareApplication and AggregateRating, with required and recommended rules for each. Unknown types are still parsed and reported. They simply don't have per-type property rules to check against.",
    },
    {
      question: "Is my structured data sent to a server?",
      answer:
        "No. All parsing and validation happen locally in your browser using its built-in JSON and HTML engines. Your prices, author names, event details and organization data never leave your device, there's nothing for us to upload, store or log. It's safe to validate private, staging or unpublished markup.",
    },
    {
      question: "Does passing this validator guarantee a rich result?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show one based on markup validity, content quality and its own eligibility rules. What this validator guarantees is that your JSON-LD is syntactically valid and carries the required properties for its type, which is the prerequisite. Always confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "How is this different from the Schema Markup Generator?",
      answer:
        "The generator builds new JSON-LD from a form. The validator checks JSON-LD you already have. Use the generator to create markup from scratch, and the validator to audit, debug or verify markup that's already on a page: including markup written by a CMS, plugin or another team.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release. Paste JSON-LD, a script tag or full HTML. Auto-detects every structured-data block. Validates each against schema.org required/recommended properties per @type with a scored, grouped report and rich-result notes.",
    },
    {
      date: "2026-06-27",
      change:
        "Added multi-block detection from pasted HTML (extracts every application/ld+json script), nested-node validation with dotted property paths, and per-block @type badges.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the report into per-block cards with individual scores, a page-level summary, byte/block counts and a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "faq-schema-generator",
    "product-schema-generator",
    "meta-tag-analyzer",
    "json-formatter",
  ],
};

export default schemaValidator;
