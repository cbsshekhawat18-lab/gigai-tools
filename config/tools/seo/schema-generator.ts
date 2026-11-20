import type { Tool } from "@/types";

/**
 * Schema Markup Generator: the flagship of the SEO suite and the hub for every
 * per-type structured-data generator. Pick a schema.org @type (Article, FAQ,
 * Product, Organization, LocalBusiness, Event, Breadcrumb, Video, Recipe,
 * Person, Review, Software) and a tailored form emits valid JSON-LD live, with
 * an inline validity check for required and recommended properties, and a
 * one-click copy of the ready-to-paste `<script type="application/ld+json">`
 * block. Every builder runs on `lib/seo-tools/schema.ts` in the browser. No
 * markup, keywords or business data is ever uploaded. Copy is unique to
 * structured data and written to rank for the exact queries people type when
 * they want rich results in Google Search.
 */
const schemaGenerator: Tool = {
  slug: "schema-generator",
  title: "Schema Markup Generator",
  description:
    "Generate valid JSON-LD structured data for Article, FAQ, Product, Organization, LocalBusiness, Event and more, with a live rich-results validity check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Braces",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Schema Markup Generator, JSON-LD Structured Data for Rich Results",
  tagline:
    "Pick a schema.org type, fill a tailored form, and get valid JSON-LD structured data instantly. We validate the required and recommended properties Google needs for rich results, then hand you the exact <script> tag to paste, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Schema Markup Generator is the single hub for building schema.org structured data as JSON-LD, the format Google explicitly recommends. Choose a type: Article, FAQPage, Product, Organization, LocalBusiness, Event, BreadcrumbList, VideoObject, Recipe, Person, Review or SoftwareApplication, and the tool renders a form tailored to exactly that type's fields, then emits clean, minifiable JSON-LD live as you type. What sets it apart from generic schema builders is the built-in validity check: every property is graded against schema.org's required and recommended sets for that type, so you can see at a glance whether your markup is eligible for a rich result and precisely which fields are still missing. Empty fields are stripped automatically, dates are handled correctly, and enum shorthands like 'InStock' are expanded to full schema.org URLs. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, and share a link that reopens the tool with your data pre-filled. Because generation and validation happen entirely on your device using the browser's own JSON engine, your product prices, event details, author names and organization data never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate schema markup",

  keywords: [
    "schema markup generator",
    "json-ld generator",
    "structured data generator",
    "schema.org generator",
    "rich results markup",
    "local business schema",
    "organization schema",
    "json-ld structured data",
  ],

  seo: {
    title:
      "Schema Markup Generator: Free JSON-LD Structured Data Tool | GigAI Tools",
    description:
      "Free JSON-LD schema markup generator for Article, FAQ, Product, Organization, LocalBusiness, Event, Breadcrumb, Video & Recipe. Live validity check for Google rich results, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "LayoutGrid",
      title: "One hub, twelve schema types",
      description:
        "Switch between Article, FAQ, Product, Organization, LocalBusiness, Event, Breadcrumb, Video, Recipe, Person, Review and Software from a single dropdown: each with a form built for exactly that type's fields.",
    },
    {
      icon: "ShieldCheck",
      title: "Live rich-results validity check",
      description:
        "Every field is graded against schema.org's required and recommended properties, so you instantly see whether your markup qualifies for a Google rich result and what is still missing.",
    },
    {
      icon: "Zap",
      title: "Live JSON-LD as you type",
      description:
        "The output pane regenerates on every keystroke with empty fields stripped, dates normalised and enum shorthands like 'InStock' expanded to full schema.org URLs.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block, or download the raw JSON. No hand-editing braces, no guessing where it goes in the page.",
    },
    {
      icon: "Link2",
      title: "Presets, undo/redo & share links",
      description:
        "Load a realistic example for any type, undo and redo every edit, and share a link that reopens the generator with your data pre-filled for a colleague.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Prices, event details, author and organization data are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Win rich results without hand-writing JSON",
      description:
        "FAQ accordions, product star ratings, breadcrumbs, event dates and recipe cards all depend on correct structured data. The generator produces it cleanly so you skip the syntax errors that silently disqualify a page.",
    },
    {
      title: "Know your markup is valid before you ship",
      description:
        "The inline check flags missing required properties as errors and missing recommended ones as warnings, so you fix eligibility problems in the tool instead of discovering them later in Search Console.",
    },
    {
      title: "Standardise schema across a whole site",
      description:
        "Share a pre-filled link or a downloaded snippet so every author emits the same Organization, LocalBusiness or Article shape. Consistent markup Google can trust.",
    },
    {
      title: "Safe for private business data",
      description:
        "Because everything runs locally, you can build markup containing unpublished prices, internal event details or personal author information without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Choose a schema type",
      description:
        "Pick the schema.org @type that matches your page, Article, FAQPage, Product, LocalBusiness, Event and so on. The form rebuilds itself for that type's fields.",
    },
    {
      title: "Fill the tailored form",
      description:
        "Enter your content. Load a preset first if you want a realistic starting point, then edit the fields, the JSON-LD updates live on every change.",
    },
    {
      title: "Read the validity check",
      description:
        "Watch the required/recommended report: green means valid, warnings point to recommended fields that improve rich-result eligibility, and errors flag anything mandatory that's still missing.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the `<head>` or body of the page it describes.",
    },
    {
      title: "Test in Google's Rich Results Test",
      description:
        "Paste the same markup into Google's Rich Results Test or Schema Markup Validator to confirm eligibility on Google's own live checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Add FAQ & breadcrumb markup site-wide",
      description:
        "Generate FAQPage and BreadcrumbList JSON-LD for template pages, then hand developers a validated snippet to drop into the CMS layout for consistent rich results.",
    },
    {
      audience: "E-commerce manager",
      title: "Mark up products for rich cards",
      description:
        "Build Product schema with offers, price, availability and aggregate rating so listings become eligible for price and review rich results in Search.",
    },
    {
      audience: "Local business owner",
      title: "Get into the local pack correctly",
      description:
        "Create LocalBusiness markup with address, opening hours and geo coordinates to strengthen the structured data behind your local search and map presence.",
    },
    {
      audience: "Content writer / blogger",
      title: "Structure articles and recipes",
      description:
        "Emit Article, BlogPosting or Recipe JSON-LD with author, dates, images and steps so posts qualify for enhanced article and recipe treatments.",
    },
  ],

  troubleshooting: [
    {
      problem: "The validity check shows an error for a required field.",
      solution:
        "That property is mandatory for the type. E.g. an Article needs a headline, an Event needs a name and startDate. Fill it in and the error clears. Errors mean the markup is not yet eligible for that rich result.",
    },
    {
      problem: "It says a recommended property is missing (a warning).",
      solution:
        "Warnings never block validity, but recommended fields (like a Product image or an Article author) materially improve rich-result eligibility. Add them where you can: Google favours complete markup.",
    },
    {
      problem: "My availability or event status looks like a plain word.",
      solution:
        "Enter shorthands like 'InStock' or 'EventScheduled' and the generator expands them to the full schema.org URL Google expects. You can also paste the full https://schema.org/… value directly.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test before publishing. It checks Google-specific eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "JSON-LD in a `<script>` tag is Google's recommended format, prefer it over Microdata or RDFa, and you don't have to touch your visible HTML.",
    "One page can carry multiple schema blocks: add separate Organization, BreadcrumbList and Article scripts rather than forcing everything into one object.",
    "Only mark up content that's actually visible on the page. Invisible or mismatched structured data can trigger a manual action.",
    "Load a preset to see a fully-populated, valid example of any type, then swap in your own values field by field.",
    "After copying, always run the markup through Google's Rich Results Test. Passing this tool's check is necessary but Google adds its own eligibility rules.",
  ],

  security:
    "Your structured data is generated and validated entirely in your browser using its native JSON engine: nothing is uploaded to any server. No prices, event details, author names or organization data are stored, logged or transmitted, so you can safely build markup containing private or unpublished information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is schema markup and why do I need it?",
      answer:
        "Schema markup is structured data, a machine-readable description of your page's content using the shared schema.org vocabulary. Search engines read it to understand what a page is about and to show rich results such as FAQ accordions, product star ratings, breadcrumbs, event dates and recipe cards. Correct markup makes a page eligible for these enhanced listings, which can improve visibility and click-through.",
    },
    {
      question: "What is JSON-LD and is it better than Microdata?",
      answer:
        "JSON-LD (JSON for Linking Data) is a block of structured data placed in a `<script type=\"application/ld+json\">` tag, separate from your visible HTML. Google explicitly recommends JSON-LD over Microdata and RDFa because it's easier to add, maintain and generate without changing your page's markup. This tool produces JSON-LD exclusively.",
    },
    {
      question: "Which schema types does this generator support?",
      answer:
        "Twelve of the most useful types for SEO: Article (with BlogPosting and NewsArticle), FAQPage, Product, Organization, LocalBusiness, Event, BreadcrumbList, VideoObject, Recipe, Person, Review and SoftwareApplication. Each has a form tailored to that type's fields, and the output is validated against its required and recommended properties.",
    },
    {
      question: "Does this guarantee I'll get a rich result in Google?",
      answer:
        "No tool can guarantee a rich result: Google decides whether and when to show one, based on markup validity, content quality and its own eligibility rules. What this tool guarantees is syntactically valid JSON-LD with the required properties present, which is the prerequisite. Always confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the page it describes, either in the `<head>` or anywhere in the `<body>` works for Google. In a CMS, add it via a custom-HTML block, a theme template, or a plugin field. Put each page's markup on that specific page, not site-wide, unless the data (like Organization) truly applies everywhere.",
    },
    {
      question: "Can I add more than one schema block to a page?",
      answer:
        "Yes, and it's common. A blog post might carry an Article block, a BreadcrumbList block and an Organization block as three separate scripts. Keep each type in its own object rather than cramming unrelated types together, it's cleaner and easier for search engines to parse.",
    },
    {
      question: "How does the validity check work?",
      answer:
        "As you fill the form, the tool checks your JSON-LD against schema.org's required and recommended properties for the selected type. Missing required properties are reported as errors (the markup isn't eligible yet). Missing recommended ones are warnings (valid, but adding them improves rich-result chances). It's a pragmatic linter, not a full schema.org shape validator, so pair it with Google's official test.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your product prices, event details, author names and organization data never leave your device, there's nothing for us to upload, store or log. It's safe to build markup containing private or unpublished information.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: schema hub with 12 types (Article, FAQ, Product, Organization, LocalBusiness, Event, Breadcrumb, Video, Recipe, Person, Review, Software), tailored forms, live JSON-LD, required/recommended validity check, copy-ready script tag, download, presets, undo/redo and share links.",
    },
    {
      date: "2026-06-25",
      change:
        "Added enum expansion (availability, item condition, event status) to full schema.org URLs, plus a minified-output toggle and per-type example presets.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report with grouped errors vs. recommended warnings and a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "faq-schema-generator",
    "breadcrumb-schema-generator",
    "product-schema-generator",
    "json-formatter",
    "url-encoder",
  ],
};

export default schemaGenerator;
