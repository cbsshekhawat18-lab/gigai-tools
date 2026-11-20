import type { Tool } from "@/types";

/**
 * Product Schema Generator, a dedicated, deep generator for schema.org Product
 * structured data as JSON-LD. Unlike the general schema hub, this tool is built
 * end-to-end around the properties that make a product page eligible for
 * Google's merchant rich results: identity (brand, SKU, GTIN, MPN), a nested
 * Offer (price, currency, availability, condition, price-valid-until) and an
 * AggregateRating with review count. It renders live JSON-LD, runs a
 * required/recommended validity check against schema.org's Product + Offer +
 * AggregateRating rules, and shows exactly which properties still block a rich
 * result. Everything runs on `lib/seo-tools/schema.ts` in the browser, prices,
 * SKUs and unpublished catalogue data never leave the device. Copy is unique to
 * product markup and written to rank for the queries e-commerce and SEO teams
 * type when they want price and star-rating rich results.
 */
const productSchemaGenerator: Tool = {
  slug: "product-schema-generator",
  title: "Product Schema Generator",
  description:
    "Generate valid Product JSON-LD structured data with Offer price, availability and AggregateRating, for price and star-rating rich results in Google. Live validity check, copy-ready script tag, 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Package",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Product Schema Generator, JSON-LD for Price & Review Rich Results",
  tagline:
    "Fill one product-focused form and get valid Product JSON-LD with a nested Offer and AggregateRating, the exact structured data Google reads to show price, availability and star ratings in Search. We validate every required and recommended property, then hand you the copy-ready <script> tag, all in your browser.",
  longDescription:
    "The GigAI Product Schema Generator builds schema.org Product structured data as JSON-LD, the format Google recommends for product rich results. Where a generic schema builder gives you a thin Product object, this tool is designed around the three nodes Google actually grades: the Product itself (name, description, image, brand, and the identifiers SKU, GTIN and MPN), the nested Offer (price, currency, availability, item condition and price-valid-until date), and the AggregateRating (rating value, review count and scale). As you type, it emits clean, minifiable JSON-LD and runs a live validity check that grades each node against schema.org's required and recommended properties, so you can see at a glance whether your markup qualifies for a price snippet or star-rating rich result and precisely which fields are still missing. Availability and condition shorthands like 'InStock' and 'NewCondition' are expanded to full schema.org URLs, empty fields are stripped, and prices are normalised to strings. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block, download the raw JSON-LD, or share a link that reopens the tool with your product pre-filled. Because generation and validation happen entirely on your device using the browser's own JSON engine, your prices, SKUs, margins and unpublished catalogue data never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate product schema",

  keywords: [
    "product schema generator",
    "product json-ld generator",
    "product structured data",
    "schema.org product markup",
    "offer schema generator",
    "aggregaterating schema",
    "product rich results markup",
    "price rich snippet schema",
    "ecommerce structured data",
    "gtin sku schema markup",
    "google merchant structured data",
  ],

  seo: {
    title:
      "Product Schema Generator: Free Product JSON-LD & Offer Markup | GigAI Tools",
    description:
      "Free Product schema generator: build valid JSON-LD with Offer price, availability, condition and AggregateRating for Google price & star-rating rich results. Live validity check, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "Package",
      title: "Purpose-built for Product markup",
      description:
        "Every field maps to a real schema.org Product, Offer or AggregateRating property (name, brand, SKU, GTIN, MPN, price, currency, availability, condition and rating) so you build complete markup, not a stub.",
    },
    {
      icon: "Tag",
      title: "Nested Offer with price & availability",
      description:
        "Set price, currency, availability, item condition and price-valid-until in a dedicated Offer section. Shorthands like 'InStock' and 'NewCondition' expand to full schema.org URLs automatically.",
    },
    {
      icon: "Star",
      title: "AggregateRating for star snippets",
      description:
        "Add rating value, review count and scale to become eligible for the review star rich result, validated against schema.org's AggregateRating requirements as you type.",
    },
    {
      icon: "ShieldCheck",
      title: "Live rich-results validity check",
      description:
        "The Product, Offer and AggregateRating nodes are each graded against required and recommended properties, so missing eligibility fields surface instantly as errors or warnings.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON-LD, plus a minified toggle for production, with no hand-editing of braces.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built locally with the browser's native JSON engine. Prices, SKUs, margins and unpublished catalogue data are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Win price & review rich results",
      description:
        "Product rich results (the price, availability and star ratings under a listing) depend entirely on correct Product, Offer and AggregateRating markup. This tool produces it cleanly so a syntax slip never silently disqualifies the page.",
    },
    {
      title: "Fix eligibility before you publish",
      description:
        "The inline check flags missing required properties (like an Offer without a price) as errors and missing recommended ones (like an image) as warnings, so you resolve problems in the tool instead of in Search Console weeks later.",
    },
    {
      title: "Standardise product markup across a catalogue",
      description:
        "Share a pre-filled link or a downloaded snippet so every product template emits the same Product + Offer shape. Consistent structured data Google can trust across thousands of SKUs.",
    },
    {
      title: "Safe for private pricing data",
      description:
        "Because everything runs locally, you can build markup containing unreleased prices, wholesale costs or draft catalogue entries without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Enter the product basics",
      description:
        "Add the product name, description, image and brand. Load the example first if you want a realistic, fully-valid starting point to edit.",
    },
    {
      title: "Add identifiers & the Offer",
      description:
        "Fill in SKU, GTIN or MPN, then set the Offer's price, currency, availability, condition and price-valid-until date. The JSON-LD updates live on every keystroke.",
    },
    {
      title: "Add an AggregateRating",
      description:
        "Enter your average rating value, the number of reviews and the scale (best/worst) to make the page eligible for the star-rating rich result.",
    },
    {
      title: "Read the validity check & copy",
      description:
        "Watch the required/recommended report clear to green, then copy the `<script type=\"application/ld+json\">` block or download the JSON-LD.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Paste the same markup into Google's Rich Results Test to confirm eligibility on Google's own live checker before you ship it to production.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "E-commerce manager",
      title: "Mark up a product page for price snippets",
      description:
        "Build Product schema with a complete Offer (price, currency and availability) so listings become eligible for price and in-stock rich results in Search.",
    },
    {
      audience: "SEO specialist",
      title: "Add review stars to key listings",
      description:
        "Attach an AggregateRating with review count to high-value products so the star-rating rich result can appear and lift click-through from the SERP.",
    },
    {
      audience: "Developer / platform engineer",
      title: "Template product markup for a CMS",
      description:
        "Generate a validated Product + Offer skeleton, then wire the field values to your catalogue data so every product page emits consistent, correct JSON-LD.",
    },
    {
      audience: "Marketplace / catalogue owner",
      title: "Standardise identifiers across SKUs",
      description:
        "Produce markup that consistently carries SKU, GTIN and MPN so search engines and shopping surfaces can match your products reliably.",
    },
  ],

  troubleshooting: [
    {
      problem: "The check errors that my Offer is missing a price or currency.",
      solution:
        "Offer requires both price and priceCurrency to be valid. Enter the numeric price (e.g. 129.00) and pick a currency: the error clears and your price becomes eligible for a rich result.",
    },
    {
      problem: "My availability shows as a plain word, not a schema.org URL.",
      solution:
        "Enter a shorthand like 'InStock', 'OutOfStock' or 'PreOrder' (or a condition like 'NewCondition') and the generator expands it to the full https://schema.org/… value Google expects. You can also paste the full URL directly.",
    },
    {
      problem: "The star rating isn't showing as valid.",
      solution:
        "AggregateRating requires a ratingValue. Add the average rating and, ideally, a reviewCount: without at least one of reviewCount or ratingCount, Google generally won't render the star snippet.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for required/recommended properties, not a full schema.org validator. Google adds its own product eligibility rules (like requiring a real review to accompany aggregate ratings), so always confirm with the Rich Results Test.",
    },
  ],

  tips: [
    "Only mark up products that are actually visible on the page. Never add ratings or prices that don't appear to shoppers, or you risk a manual action.",
    "Google shows aggregate rating stars only when a genuine reviewCount or ratingCount is present, so always include the number of reviews.",
    "Add at least one stable identifier (GTIN is best, then MPN, then SKU) to help search and shopping surfaces match your product.",
    "Set priceValidUntil so Google knows when to re-crawl your price. A stale price can cause the rich result to be dropped.",
    "After copying, run the markup through Google's Rich Results Test. Passing this tool's check is necessary but Google applies extra product rules.",
  ],

  security:
    "Your product data is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. Prices, SKUs, GTINs, margins and unpublished catalogue details are never stored, logged or transmitted, so you can safely build markup containing private or pre-launch information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is Product schema and why do I need it?",
      answer:
        "Product schema is structured data that describes a product to search engines using the shared schema.org vocabulary, added as JSON-LD. Google reads it to understand a product's name, brand, price, availability and rating, and can then show a product rich result, the price, in-stock status and review stars that appear under a listing in Search. Correct markup makes a page eligible for these enhanced listings, which can improve visibility and click-through.",
    },
    {
      question: "What is the difference between Product, Offer and AggregateRating?",
      answer:
        "They are three schema.org types that work together. Product carries identity, name, description, image, brand, SKU/GTIN/MPN. Offer, nested inside the Product, carries the commercial details, price, currency, availability and condition. AggregateRating, also nested, carries the summary rating, average value and how many reviews it's based on. This tool builds all three from one form and validates each node independently.",
    },
    {
      question: "Which properties are required for a product rich result?",
      answer:
        "At minimum the Product needs a name. To be eligible for a price rich result the nested Offer needs both price and priceCurrency. For the star-rating rich result the AggregateRating needs a ratingValue plus a reviewCount or ratingCount. This tool marks each of these as required and flags them as errors until they're present, and grades recommended fields like image and description as warnings.",
    },
    {
      question: "Do I need GTIN, SKU or MPN?",
      answer:
        "They aren't strictly required for the Product rich result, but they are strongly recommended, especially for shopping surfaces and to help Google match your product to the same item elsewhere. Use a GTIN (barcode) when you have one, an MPN for manufacturer parts, and your internal SKU for catalogue matching. Add whichever identifiers you can.",
    },
    {
      question: "Does adding review stars guarantee they'll show in Google?",
      answer:
        "No tool can guarantee a rich result: Google decides whether to render stars based on markup validity, whether real reviews exist, and its own eligibility rules. Notably, Google's guidelines expect aggregate ratings to be backed by genuine reviews visible on the page. This tool guarantees valid AggregateRating markup with the required properties, which is the prerequisite. Always confirm with the Rich Results Test.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the specific product page it describes: either in the `<head>` or anywhere in the `<body>` works for Google. In a CMS or store platform, add it via a custom-HTML block, a theme template, or a plugin field. Put each product's markup on that product's own page, not site-wide.",
    },
    {
      question: "How does the availability field work?",
      answer:
        "Availability uses schema.org values like https://schema.org/InStock. You only need to enter the shorthand ('InStock', 'OutOfStock', 'PreOrder', 'BackOrder' or 'Discontinued') and the generator expands it to the full URL automatically. The same applies to item condition ('NewCondition', 'UsedCondition', 'RefurbishedCondition').",
    },
    {
      question: "Is my product data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your prices, SKUs, GTINs and any unpublished catalogue data never leave your device: there's nothing for us to upload, store or log. It's safe to build markup containing private or pre-launch pricing.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: dedicated Product JSON-LD generator with nested Offer (price, currency, availability, condition, price-valid-until), AggregateRating, brand and SKU/GTIN/MPN identifiers, live required/recommended validity check, copy-ready script tag, download, example preset, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added item-condition and availability enum expansion to full schema.org URLs, a minified-output toggle, and separate validity grouping for the Product, Offer and AggregateRating nodes.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the score to weight missing Offer/rating properties and linked directly to Google's Rich Results Test for final eligibility confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "review-schema-generator",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default productSchemaGenerator;
