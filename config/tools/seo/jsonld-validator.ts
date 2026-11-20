import type { Tool } from "@/types";

/**
 * JSON-LD Validator: the paste-first structured-data checker for the
 * "Validators" group. Paste a `<script type="application/ld+json">` block or a
 * raw JSON-LD object and it parses the JSON, walks every node, detects each
 * `@type`, and grades the required and recommended properties Google needs for
 * rich results, then hands back a pretty-printed, re-formatted copy of the
 * markup. Everything runs on `lib/seo-tools/schema.ts`'s `validateJsonLd` in the
 * browser via the native JSON engine: no markup, prices or business data are
 * ever uploaded. Every line of copy below is written for *validating existing*
 * structured data (not generating new markup) so the page ranks on its own
 * search intent, distinct from the Schema Markup Generator.
 */
const jsonldValidator: Tool = {
  slug: "jsonld-validator",
  title: "JSON-LD Validator",
  description:
    "Paste your JSON-LD structured data to validate it, parse errors, missing @context/@type, and the required & recommended properties each schema.org type needs for rich results, plus a re-formatted copy. 100% in your browser.",
  category: "seo-tools",
  group: "Validators",
  icon: "Braces",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  h1: "JSON-LD Validator. Check Structured Data for Rich Results",
  tagline:
    "Paste a JSON-LD script tag or object and get an instant, honest audit: is the JSON valid, is there a @type and @context, and does every node carry the required and recommended properties Google needs for rich results? Scored, prioritised and re-formatted, entirely in your browser.",
  longDescription:
    "The GigAI JSON-LD Validator takes the structured data you already have, a `<script type=\"application/ld+json\">` block copied from a live page, a snippet from your CMS, or a raw object from a build step, and turns it into a clear, prioritised report card. It first parses the JSON with the browser's own engine and, if that fails, points to the exact syntax problem (a trailing comma, an unescaped quote, a stray `<script>` wrapper) so you can fix it in seconds. Once the JSON is valid it walks the whole tree, including nested nodes and `@graph` arrays, detects every `@type` it finds, and checks each against schema.org's required and recommended property sets: a missing required property (an Article with no headline, a Product with no name, an Event with no startDate) is reported as an error that disqualifies the rich result, while a missing recommended one (a Product without an image, an Organization without a logo) is a warning that weakens eligibility without breaking validity. It also flags the two mistakes that silently kill markup, a missing `@type` and a missing `@context`, and confirms when a node is fully valid. Every finding comes back as pass, warning or fail with a plain-English fix, rolled up into a 0–100 score and letter grade so you know at a glance whether the markup is ship-ready. Because it accepts a full script tag, an array of objects, or a bare object, and strips the wrapper for you, you can paste straight from View Source. And since it re-serialises your data into clean, indented JSON, it doubles as a JSON-LD formatter. Everything runs locally on the markup you paste (staging pages, competitor snippets you copied, or unpublished data) and none of it ever leaves your machine.",

  ctaText: "Validate JSON-LD",

  keywords: [
    "json-ld validator",
    "jsonld validator",
    "json-ld checker",
    "validate json-ld",
    "rich results structured data check",
    "json-ld linter",
    "schema validator online",
    "json-ld formatter",
  ],

  seo: {
    title:
      "JSON-LD Validator: Free Structured Data & Schema Checker | GigAI Tools",
    description:
      "Free JSON-LD validator: paste a script tag or object to check JSON syntax, @type/@context, and the required & recommended schema.org properties for rich results. Scored, re-formatted, 100% in your browser.",
  },

  features: [
    {
      icon: "BadgeCheck",
      title: "Per-type required & recommended checks",
      description:
        "Every node's @type is validated against schema.org's required (error) and recommended (warning) property sets for Article, FAQPage, Product, Organization, LocalBusiness, Event, Breadcrumb, Video, Recipe, Person, Review and Software.",
    },
    {
      icon: "Bug",
      title: "Precise JSON parse errors",
      description:
        "Invalid JSON surfaces the exact message from the browser's parser (trailing commas, unescaped quotes, single quotes) so you fix the real problem instead of guessing.",
    },
    {
      icon: "Braces",
      title: "Accepts script tags & @graph",
      description:
        "Paste a full <script type=\"application/ld+json\"> block, a bare object, or an array / @graph of nodes. The wrapper is stripped and every node is walked, including nested ones.",
    },
    {
      icon: "Sparkles",
      title: "Re-formats as clean JSON",
      description:
        "Once valid, your markup is re-serialised into tidy, 2-space-indented JSON you can copy or download, so the validator doubles as a JSON-LD beautifier.",
    },
    {
      icon: "Gauge",
      title: "0–100 score & letter grade",
      description:
        "Errors and warnings roll up into a single score and grade with pass/warn/fail counts, so you know at a glance whether the structured data is ready to ship.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Parsing and validation use the browser's native JSON engine on your device. Prices, author names and business data in your markup are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Catch the errors that silently disqualify rich results",
      description:
        "A missing headline, a Product with no name, a missing @type: small omissions cost you the FAQ accordion, star rating or breadcrumb. The validator flags them before they cost you the enhancement.",
    },
    {
      title: "Fix broken JSON without hunting through braces",
      description:
        "Structured data often breaks on a trailing comma or an unescaped quote pasted from a CMS. The exact parser message points you straight to the character that broke it.",
    },
    {
      title: "Audit any markup, even before it's live",
      description:
        "Because it works on what you paste, you can validate a competitor's snippet from View Source, a staging page behind auth, or a build-step template you haven't deployed yet.",
    },
    {
      title: "Safe for private and unpublished data",
      description:
        "Everything runs locally, so JSON-LD containing unpublished prices, internal event details or personal author information can be checked without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Copy your JSON-LD",
      description:
        "Grab the `<script type=\"application/ld+json\">` block from your page's source (View Source or DevTools), or copy the raw object from your CMS or build output.",
    },
    {
      title: "Paste it into the validator",
      description:
        "Paste the script tag or object into the input: the wrapper is stripped automatically. Load the built-in sample first if you want to see a validated example.",
    },
    {
      title: "Read the scored report",
      description:
        "Review the checks: green passes, warnings for missing recommended properties, and red errors for invalid JSON or missing required properties. Each has a plain-English fix.",
    },
    {
      title: "Fix, copy the clean JSON & re-check",
      description:
        "Correct the flagged issues, copy or download the re-formatted JSON, and paste it back to confirm the score climbs to a clean pass.",
    },
    {
      title: "Confirm with Google's Rich Results Test",
      description:
        "This is a pragmatic required/recommended linter: run the same markup through Google's Rich Results Test to confirm Google-specific eligibility before publishing.",
    },
  ],

  formats: {
    input: ["JSON-LD", "JSON", "HTML"],
    output: ["Report", "JSON"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Audit structured data during a site review",
      description:
        "Paste the JSON-LD from each template page to confirm the @type is right and no required property is missing before you sign off on a rich-results rollout.",
    },
    {
      audience: "Developer",
      title: "Lint markup emitted by a build step",
      description:
        "Drop the JSON your framework or CMS generates into the validator to catch bad JSON, a missing @context, or a dropped required field before it ships to production.",
    },
    {
      audience: "E-commerce manager",
      title: "Verify Product & Offer markup",
      description:
        "Check that Product nodes carry a name, image and a valid Offer with price and currency so listings stay eligible for price and review rich results.",
    },
    {
      audience: "Content team",
      title: "Validate FAQ & Article schema on posts",
      description:
        "Confirm FAQPage question/answer pairs and Article headline, author and dates are present so posts qualify for FAQ and enhanced-article treatments.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says \"Invalid JSON\" but my markup looks fine.",
      solution:
        "The most common causes are a trailing comma after the last property, curly “smart quotes” pasted from a document instead of straight quotes, single quotes instead of double quotes, or a stray character before the opening brace. The error message names the position: fix that character and re-check.",
    },
    {
      problem: "A required property is flagged even though I set it.",
      solution:
        "Check spelling and case: schema.org property names are case-sensitive (`startDate`, not `startdate`). An empty string, null, or empty array also counts as missing. Give the property a real value.",
    },
    {
      problem: "My nested type shows a warning I didn't expect.",
      solution:
        "The validator walks nested nodes too, so an Offer inside a Product or an AggregateRating is checked on its own required/recommended set. Add the flagged property to that inner node, not just the outer one.",
    },
    {
      problem: "This passes but Google's test still reports an issue.",
      solution:
        "This is a required/recommended linter, not a full schema.org shape validator, and Google layers its own eligibility rules on top of valid JSON-LD. Always confirm with Google's Rich Results Test before publishing.",
    },
  ],

  tips: [
    "Paste the whole `<script type=\"application/ld+json\">` tag straight from View Source. The wrapper is stripped for you, so there's no need to trim it by hand.",
    "One page can carry several blocks: validate each Organization, BreadcrumbList and Article node separately, or paste them as an array / @graph and the validator checks each.",
    "Only mark up content that's actually visible on the page, valid markup that describes hidden content can still trigger a manual action in Search Console.",
    "Use the re-formatted output as a formatter: paste minified JSON-LD and copy back the clean, indented version for your codebase.",
    "A clean pass here is necessary but not sufficient: always finish with Google's Rich Results Test, which adds Google-specific eligibility checks.",
  ],

  security:
    "Your JSON-LD is parsed and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. No prices, author names, event details or organization data in your markup are stored, logged or transmitted, so you can safely validate structured data containing private or unpublished information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What does a JSON-LD validator actually check?",
      answer:
        "Two things. First, that the input is syntactically valid JSON (no trailing commas, unescaped quotes or stray characters) because invalid JSON is ignored entirely by search engines. Second, that the structured data is meaningful: that each node has a `@type` and `@context`, and that every node carries the properties schema.org marks as required (for validity) and recommended (for stronger rich-result eligibility) for its type. This tool reports all of that with a score and plain-English fixes.",
    },
    {
      question: "What's the difference between JSON-LD, schema, and structured data?",
      answer:
        "“Structured data” is the general idea of describing a page's content in a machine-readable way. “Schema” usually means the schema.org vocabulary, the shared set of types like Article, Product and FAQPage. “JSON-LD” is the format Google recommends for expressing schema.org data: a JSON object placed in a `<script type=\"application/ld+json\">` tag, separate from your visible HTML. This validator checks schema.org data written in the JSON-LD format.",
    },
    {
      question: "Can I paste a full <script type=\"application/ld+json\"> tag?",
      answer:
        "Yes. Paste the entire script tag copied from View Source or DevTools and the validator strips the wrapper automatically, then validates the JSON inside. You can also paste a bare object, or an array / `@graph` of multiple nodes. Each node is detected and checked on its own.",
    },
    {
      question: "Which schema.org types are supported?",
      answer:
        "The required/recommended rules cover the most useful types for SEO: Article, BlogPosting, NewsArticle, FAQPage (and its Question nodes), Product, Offer, Organization, LocalBusiness, SoftwareApplication, Review, Person, Event, BreadcrumbList, VideoObject, Recipe and AggregateRating. Any other valid type still passes the JSON and @type/@context checks. It just isn't graded against a specific property set.",
    },
    {
      question: "Does passing this guarantee I'll get a rich result?",
      answer:
        "No tool can guarantee a rich result, Google decides based on markup validity, content quality and its own eligibility rules, and it may show a rich result only sometimes. What a clean pass here confirms is that your JSON is valid and the required properties are present, which is the prerequisite. Always finish with Google's Rich Results Test for the final word.",
    },
    {
      question: "Why is my JSON-LD invalid?",
      answer:
        "Almost always a JSON syntax problem: a trailing comma after the last property, curly “smart quotes” instead of straight double quotes, single quotes instead of double, an unescaped quote or backslash inside a string, or a character before the opening brace. The validator shows the parser's exact error message and position so you can jump straight to it.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. All parsing and validation happen locally in your browser using its built-in JSON engine. The markup you paste (including any prices, author names or business details) never leaves your device, and there is nothing for us to upload, store or log. It's safe to validate private or unpublished structured data.",
    },
    {
      question: "Can I use this to format or beautify JSON-LD?",
      answer:
        "Yes. Once your input parses, the validator re-serialises it into clean, 2-space-indented JSON that you can copy or download. Paste minified or messy JSON-LD and you get a tidy, readable version back, so it works as a JSON-LD formatter as well as a validator.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release. Paste a script tag or object to validate JSON syntax, @context/@type, and per-type required/recommended properties, with a 0–100 score, grouped checks, plain-English fixes and a re-formatted JSON copy.",
    },
    {
      date: "2026-06-27",
      change:
        "Added automatic stripping of the <script type=\"application/ld+json\"> wrapper, support for arrays and @graph of multiple nodes, and per-node type detection with a summary strip.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined error messages for common JSON mistakes (trailing commas, smart quotes), added copy/download of the re-formatted output, and a link to Google's Rich Results Test for final confirmation.",
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

export default jsonldValidator;
