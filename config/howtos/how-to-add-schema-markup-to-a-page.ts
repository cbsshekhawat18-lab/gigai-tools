import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-add-schema-markup-to-a-page",
  title: "How to Add Schema Markup to a Page (Step by Step)",
  description:
    "Add structured data to any web page so Google can show rich results, stars, FAQs, breadcrumbs and more. A practical guide using JSON-LD, no coding framework required.",
  accent: "amber",
  icon: "Code",
  toolSlug: "schema-generator",
  seo: {
    title: "How to Add Schema Markup to a Web Page (JSON-LD, Free)",
    description:
      "Learn how to add structured data (schema markup) to a page with JSON-LD, generate it, paste it into your <head>, and validate it for rich results. Step-by-step and free.",
    keywords: [
      "how to add schema markup",
      "add structured data",
      "json-ld schema",
      "schema markup tutorial",
      "rich results",
      "structured data seo",
    ],
    canonical: "/how-to/how-to-add-schema-markup-to-a-page",
  },
  intro: [
    "Schema markup is structured data that describes what a page is about in a format search engines understand, a recipe, a product, an FAQ, a local business. Add it correctly and Google can enhance your listing with rich results like star ratings, expandable FAQs and breadcrumb trails, which stand out and often earn more clicks.",
    "The recommended format is JSON-LD: a self-contained block of JSON you drop into the page's HTML, separate from your visible content. It's the easiest to add and maintain because it doesn't touch your markup. This guide shows how to generate valid JSON-LD, place it, and confirm Google can read it.",
  ],
  steps: [
    {
      title: "Pick the schema type that matches your page",
      body: "Choose the type that describes the page's primary content, Article, Product, FAQ, LocalBusiness, Recipe, Event and so on. Each type expects specific fields, so match it to what the page actually is.",
    },
    {
      title: "Generate the JSON-LD",
      body: "Open the schema generator, select your type, and fill in the fields: title, author, price, address, questions and answers, whatever the type requires. The tool builds correctly structured JSON-LD as you type.",
    },
    {
      title: "Copy the generated markup",
      body: "Copy the finished <script type=\"application/ld+json\"> block. It's a complete, self-contained snippet. You don't need to edit it further.",
    },
    {
      title: "Paste it into your page's HTML",
      body: "Drop the script block into the page, ideally in the <head>, though anywhere in the HTML works. Add it to the specific page it describes, not sitewide, so each page's markup matches its content.",
    },
    {
      title: "Make sure the markup matches what users see",
      body: "Structured data must reflect visible page content. If you mark up a 4.8-star rating or a $29 price, that same rating and price should appear on the page. Mismatches can trigger a manual penalty.",
    },
    {
      title: "Validate with Google's Rich Results Test",
      body: "Run the live URL (or the raw code) through Google's Rich Results Test. It confirms the type is eligible for rich results and flags missing required or recommended fields.",
    },
    {
      title: "Monitor in Search Console",
      body: "After Google recrawls the page, check the Enhancements reports in Search Console to see valid items, warnings and any errors, and to track which rich results you're eligible for.",
    },
  ],
  tips: [
    "Prefer JSON-LD over Microdata or RDFa, Google explicitly recommends it, and it keeps structured data separate from your visible HTML.",
    "Only mark up content that's actually on the page. Adding schema for reviews or prices that aren't visible is against Google's guidelines.",
    "Fill in recommended fields, not just required ones. Richer, more complete markup is more likely to earn an enhanced listing.",
    "Schema markup makes a page eligible for rich results but doesn't guarantee them. Google decides per query whether to show them.",
  ],
  faq: [
    {
      question: "What is schema markup?",
      answer:
        "Schema markup is structured data added to a page's HTML that tells search engines what the content means. That this text is a review, this number is a price, this block is an FAQ. It uses the shared vocabulary from schema.org.",
    },
    {
      question: "Does schema markup improve my rankings?",
      answer:
        "It's not a direct ranking factor, but it makes pages eligible for rich results that are more prominent and clickable. Higher click-through can indirectly help performance, and the structured data helps search engines understand your content.",
    },
    {
      question: "Where should I put the JSON-LD on the page?",
      answer:
        "The <head> is the cleanest place, but Google will read a JSON-LD script block anywhere in the HTML. Add it to each individual page that the markup describes rather than injecting one block across the whole site.",
    },
    {
      question: "How do I know if my schema is working?",
      answer:
        "Run the page through Google's Rich Results Test to confirm it's valid and eligible, then watch the Enhancements reports in Search Console over the following days to see it recognised on the live site.",
    },
    {
      question: "Do I need to add schema to every page?",
      answer:
        "No: add it where it helps. Product, article, FAQ, recipe and local-business pages benefit most because they map to specific rich-result types. Generic pages with no matching type usually don't need markup.",
    },
  ],
  relatedToolSlugs: [
    "faq-schema-generator",
    "article-schema-generator",
    "breadcrumb-schema-generator",
    "jsonld-validator",
  ],
  relatedHowToSlugs: [],
};

export default howto;
