import type { Tool } from "@/types";

/**
 * Article Schema Generator, a dedicated, deep JSON-LD builder for the
 * Article / BlogPosting / NewsArticle types. Where the schema hub covers twelve
 * types shallowly, this tool goes all-in on editorial markup: headline length
 * coaching against Google's ~110-char truncation, author + publisher graphs,
 * published/modified dates, multiple hero images and article keywords, with a
 * live Google SERP-style preview and a required/recommended validity check.
 * Everything runs on `lib/seo-tools/schema.ts` in the browser. No headline,
 * author name or unpublished draft ever leaves the device. Copy is written to
 * rank for the exact "article schema generator" and "blogposting json-ld"
 * queries editors and SEOs type when they want article rich results.
 */
const articleSchemaGenerator: Tool = {
  slug: "article-schema-generator",
  title: "Article Schema Generator",
  description:
    "Generate valid Article, BlogPosting and NewsArticle JSON-LD structured data: with author, publisher, dates, images and keywords, a live SERP preview and a rich-results validity check. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Newspaper",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Article Schema Generator: Article, BlogPosting & NewsArticle JSON-LD",
  tagline:
    "Turn a blog post or news story into valid schema.org Article markup in seconds. Fill in the headline, author, publisher, dates and images once, watch the JSON-LD build live with a Google SERP preview beside it, and copy the exact <script> tag to paste, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Article Schema Generator builds the structured data that tells Google a page is a piece of editorial content (an Article, a BlogPosting or a NewsArticle) as clean, valid JSON-LD. Unlike a generic schema hub, it is tuned entirely for publishers and content SEOs: it grades your headline against Google's ~110-character truncation limit, builds the nested Person author and Organization publisher graphs correctly (including the publisher logo as an ImageObject), handles datePublished and dateModified as proper ISO dates, accepts one or many hero images for the best rich-result eligibility, and lets you attach article keywords and the article body. As you type, the output pane regenerates live with empty fields stripped, and a required/recommended validity check grades the markup against schema.org's rules for your chosen type so you can see, before you ship, whether it qualifies for an article rich result and exactly which recommended fields (image, author, datePublished, publisher) are still missing. A Google SERP-style preview shows how the underlying page could appear, and one click copies the ready-to-paste `<script type=\"application/ld+json\">` block or downloads the raw JSON. Because generation, validation and preview all happen on your device using the browser's own JSON engine, your unpublished headlines, author names and draft content never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate article schema",

  keywords: [
    "article schema generator",
    "article schema markup",
    "blogposting schema generator",
    "newsarticle schema",
    "article json-ld generator",
    "article structured data",
    "blog post schema markup",
    "news article schema generator",
    "author schema markup",
    "publisher schema",
    "article rich results",
    "schema.org article generator",
  ],

  seo: {
    title:
      "Article Schema Generator: Free Article & BlogPosting JSON-LD | GigAI Tools",
    description:
      "Free Article schema generator: build valid Article, BlogPosting & NewsArticle JSON-LD with author, publisher, dates, images and keywords. Live SERP preview, rich-results validity check, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "Newspaper",
      title: "Article, BlogPosting & NewsArticle",
      description:
        "Switch between the three editorial schema.org types from one dropdown. The @type updates instantly and the validity check adapts to that type's required and recommended properties.",
    },
    {
      icon: "Users",
      title: "Correct author & publisher graphs",
      description:
        "Enter an author name and URL and a publisher name and logo, and the tool nests them as a proper Person and an Organization with the logo as an ImageObject, the shape Google actually reads.",
    },
    {
      icon: "Ruler",
      title: "Live headline length coaching",
      description:
        "Google truncates long headlines around 110 characters. A live counter warns you before your title gets cut, so the headline that reaches searchers is the one you wrote.",
    },
    {
      icon: "Eye",
      title: "Google SERP preview beside the code",
      description:
        "A pixel-aware Google snippet preview updates as you type, so you see how the underlying article could look in search results. Not just the raw JSON-LD.",
    },
    {
      icon: "ShieldCheck",
      title: "Rich-results validity check",
      description:
        "Every field is graded against schema.org's required (headline) and recommended (image, author, datePublished, publisher) sets, so you know at a glance whether the markup is eligible.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Unpublished headlines, author names and draft content are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Qualify for article rich treatments",
      description:
        "Enhanced article listings, Top Stories and the article carousel all lean on correct Article structured data. This generator produces it cleanly so you skip the syntax errors that silently disqualify a page.",
    },
    {
      title: "Know it's valid before you publish",
      description:
        "The inline check flags a missing headline as an error and missing recommended fields as warnings, so you fix eligibility problems in the tool rather than discovering them later in Search Console.",
    },
    {
      title: "Standardise markup across every author",
      description:
        "Share a pre-filled link or a downloaded snippet so every writer emits the same Article shape, consistent publisher, logo and author markup that search engines can trust.",
    },
    {
      title: "Safe for unpublished drafts",
      description:
        "Because everything runs locally, you can build markup for embargoed news or draft posts containing internal headlines and author data without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Pick the article type",
      description:
        "Choose Article for general content, BlogPosting for a blog, or NewsArticle for news. The validity check adapts to the type you select.",
    },
    {
      title: "Fill the headline, author & publisher",
      description:
        "Enter the headline (watch the length coach), the author's name and URL, and the publisher's name and logo. Load the example first if you want a realistic starting point.",
    },
    {
      title: "Add dates, images & keywords",
      description:
        "Set datePublished and dateModified, paste one or more hero image URLs, and optionally add article keywords and the article body. The JSON-LD and SERP preview update live.",
    },
    {
      title: "Read the validity check",
      description:
        "Green means the required headline is present. Warnings point to recommended fields (image, author, datePublished, publisher) that improve rich-result eligibility.",
    },
    {
      title: "Copy the script tag & test it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON), paste it into the article's `<head>`, then confirm with Google's Rich Results Test before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "Content SEO / blogger",
      title: "Mark up every blog post",
      description:
        "Generate BlogPosting JSON-LD with author, publisher, dates and a hero image, then drop the validated snippet into your CMS template so every post ships with consistent, eligible markup.",
    },
    {
      audience: "News publisher / editor",
      title: "Structure breaking news stories",
      description:
        "Build NewsArticle markup with a tight headline, dateline and publisher so stories are correctly typed for Top Stories and news surfaces the moment they go live.",
    },
    {
      audience: "Developer / CMS engineer",
      title: "Wire a reusable article template",
      description:
        "Use a downloaded snippet as the reference shape, then bind headline, author, dates and image to template variables so the whole site emits identical, valid Article JSON-LD.",
    },
    {
      audience: "SEO consultant / agency",
      title: "Audit and fix a client's article markup",
      description:
        "Rebuild a client's article schema correctly, hand back a pre-filled share link, and use the validity check to prove which recommended fields were missing before your fix.",
    },
  ],

  troubleshooting: [
    {
      problem: "The validity check shows an error for the headline.",
      solution:
        "headline is the one required property for Article, BlogPosting and NewsArticle. Add it and the error clears: without it the markup is not eligible for an article rich result.",
    },
    {
      problem: "It warns that author, image, datePublished or publisher is missing.",
      solution:
        "Those are recommended, not required, so the markup is still valid, but Google favours complete article markup for rich treatments. Add each one you can. A hero image and a named author matter most.",
    },
    {
      problem: "My publisher logo isn't showing up in the output.",
      solution:
        "The logo is only added when you also provide a publisher name, because schema.org nests the logo inside the publisher Organization. Fill the publisher name and the logo appears as an ImageObject.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test, which adds Google-specific article eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Keep the headline under about 110 characters, Google truncates longer ones in search, and the length coach flags it live as you type.",
    "Always set dateModified when you update an article. A fresh modified date signals to Google that the content is current.",
    "Provide at least one high-resolution hero image (16:9, 4:3 and 1:1 crops are ideal): image is the recommended field with the biggest rich-result impact.",
    "The author URL should point to a real author bio page. A linkable Person adds credibility and strengthens the author graph.",
    "After copying, run the markup through Google's Rich Results Test. Passing this tool's check is necessary, but Google applies its own article eligibility rules.",
  ],

  security:
    "Your article markup is generated, validated and previewed entirely in your browser using its native JSON engine: nothing is uploaded to any server. No headlines, author names, publisher details or draft content are stored, logged or transmitted, so you can safely build markup for embargoed news or unpublished posts. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is Article schema markup?",
      answer:
        "Article schema is structured data: a machine-readable description of an editorial page using the schema.org Article vocabulary, added as JSON-LD in a `<script>` tag. It tells search engines that a page is an article and supplies the headline, author, publisher, dates and images they use to show enhanced article listings, Top Stories and article carousels.",
    },
    {
      question: "What's the difference between Article, BlogPosting and NewsArticle?",
      answer:
        "They are all Article types in schema.org's hierarchy. Article is the general type for any editorial content. BlogPosting is the specific subtype for blog posts. NewsArticle is the subtype for news and is what Google reads for news-specific surfaces like Top Stories. They share the same required and recommended fields: pick the one that most precisely describes your page.",
    },
    {
      question: "Which fields does Article schema require?",
      answer:
        "Only headline is strictly required for valid Article, BlogPosting or NewsArticle markup. However, Google strongly recommends image, author, datePublished and publisher. This tool marks those as warnings because adding them materially improves your eligibility for article rich results.",
    },
    {
      question: "How long should the headline be?",
      answer:
        "Aim for under about 110 characters. Google truncates longer headlines in search results, and an overly long headline can also be rejected for some rich treatments. The generator shows a live character count and warns you before you cross the limit, so the headline searchers see is the one you intended.",
    },
    {
      question: "Do I need both datePublished and dateModified?",
      answer:
        "datePublished is the more important of the two and one of Google's recommended fields. dateModified is optional but valuable: setting it whenever you meaningfully update an article signals freshness to Google. This tool emits both as proper ISO dates and omits either one you leave blank.",
    },
    {
      question: "How do I add the author and publisher correctly?",
      answer:
        "Enter the author's name (and optionally a URL to their bio page) and the tool nests them as a schema.org Person. Enter the publisher's name and logo URL and it nests them as an Organization with the logo as an ImageObject, the exact shape Google expects. The publisher logo only appears when a publisher name is present.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the article it describes: the `<head>` or anywhere in the `<body>` works for Google. In a CMS, add it via a custom-HTML block, a theme template or a plugin field, and bind the fields to that post's data so each article carries its own markup.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. All generation, validation and preview happen locally in your browser using its built-in JSON engine. Your headlines, author names, publisher details and draft content never leave your device. There is nothing for us to upload, store or log, so it is safe for embargoed or unpublished content.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, dedicated Article / BlogPosting / NewsArticle JSON-LD generator with author and publisher graphs, published/modified dates, multiple images, keywords, live SERP preview, required/recommended validity check, copy-ready script tag, download, example presets, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added live headline length coaching against Google's ~110-character truncation limit, plus a minified-output toggle.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report with grouped required vs. recommended checks and a per-type example for Article, BlogPosting and NewsArticle.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "faq-schema-generator",
    "breadcrumb-schema-generator",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default articleSchemaGenerator;
