import type { Tool } from "@/types";

/**
 * Review Schema Generator, a focused, single-purpose generator for schema.org
 * `Review` JSON-LD: the reviewed item, the author, a star rating and the review
 * body, emitted as a copy-ready `<script type="application/ld+json">` block.
 * Unlike the schema hub, this tool is tuned end-to-end for review markup: it
 * bakes in Google's review-snippet policies (a review must be about a specific,
 * eligible item; no self-serving reviews of your own business on your own site;
 * the star widget only appears for allowed types), validates the required
 * `reviewRating` live, and previews the rating as stars. Everything runs on
 * `lib/seo-tools/schema.ts` in the browser. No reviewer names, ratings or
 * business data ever leave the device. Copy is written specifically to rank for
 * review-schema and star-rating rich-result queries.
 */
const reviewSchemaGenerator: Tool = {
  slug: "review-schema-generator",
  title: "Review Schema Generator",
  description:
    "Generate valid Review JSON-LD structured data (reviewed item, author, star rating and review body) with a live star preview, a required-property check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Star",
  accent: "amber",
  status: "live",
  createdAt: "2026-06-20",

  h1: "Review Schema Generator, JSON-LD Review Markup for Star Rating Rich Results",
  tagline:
    "Describe the item, the reviewer and the star rating once and get clean schema.org Review JSON-LD, previewed as stars and validated against the properties Google needs, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Review Schema Generator builds schema.org `Review` structured data as JSON-LD, the format Google recommends for the star-rating snippet that can appear beside a result in Search. You describe what was reviewed (the `itemReviewed`), who wrote it (the `author`), the star rating on your scale, and the review text, and the tool emits a clean, minifiable JSON-LD block live as you type, with empty fields stripped and the rating normalised into a proper `Rating` node with `bestRating`/`worstRating` bounds. What makes this more than a form is that it is opinionated about the rules that actually decide whether a review snippet shows: a review must be about one specific, eligible thing (a Product, LocalBusiness, Book, Course, Recipe, Movie and so on. Not a vague category or your entire website), Google forbids self-serving reviews of your own business or its services on your own pages, and the numeric rating must sit within its stated scale. The generator surfaces those policies inline, validates that a `reviewRating` is present before it calls the markup valid, and previews the rating as filled stars so you can sanity-check it at a glance. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the JSON, and share a link that reopens the tool pre-filled. Because generation and validation happen entirely on your device using the browser's own JSON engine, reviewer names, ratings and item details are never uploaded, stored or logged.",

  ctaText: "Generate review schema",

  keywords: [
    "review schema generator",
    "review json-ld generator",
    "star rating schema",
    "review structured data",
    "schema.org review markup",
    "review snippet markup",
    "itemreviewed schema",
    "rating schema generator",
    "aggregate rating schema",
    "product review schema",
    "json-ld review",
    "rich results review markup",
  ],

  seo: {
    title:
      "Review Schema Generator: Free JSON-LD Review & Star Rating Markup | GigAI Tools",
    description:
      "Free Review schema generator: build valid schema.org Review JSON-LD with itemReviewed, author, star rating and review body. Live star preview, required-property check, Google review-snippet policy notes, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "Star",
      title: "Review, item & rating in one form",
      description:
        "Set the reviewed item, its schema.org type, the author, the star rating and the review text: the JSON-LD regenerates on every keystroke as a proper Review with a nested Rating node.",
    },
    {
      icon: "ShieldCheck",
      title: "Live required-property check",
      description:
        "The tool validates against schema.org's rules for Review (a reviewRating is required, author and reviewBody are recommended) so you know the markup is eligible before you ship it.",
    },
    {
      icon: "Sparkles",
      title: "Star-rating preview",
      description:
        "See your rating rendered as filled stars against its scale (for example 4.5 of 5) so a mistyped value or a wrong bestRating is obvious at a glance.",
    },
    {
      icon: "Info",
      title: "Google review-policy guidance built in",
      description:
        "Inline notes cover the rules that actually gate the snippet: review a specific eligible item, no self-serving reviews of your own business, and keep the rating inside its stated range.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block, or download the raw JSON. No hand-editing braces and no guessing the nesting for itemReviewed and reviewRating.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Reviewer names, ratings and item details are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Win the star-rating snippet, correctly",
      description:
        "A visible star widget in Search depends on valid Review or AggregateRating markup on an eligible item. The generator produces it cleanly so you skip the nesting mistakes that silently disqualify the snippet.",
    },
    {
      title: "Stay on the right side of Google's policy",
      description:
        "The tool spells out the review-snippet rules (one specific eligible item, no self-serving reviews of your own entity) so you don't earn a manual action for markup Google considers spammy.",
    },
    {
      title: "Verify the rating before you publish",
      description:
        "A required-property check plus a live star preview mean you catch a missing rating or an out-of-range value in the tool, not later in Search Console.",
    },
    {
      title: "Safe for unpublished review data",
      description:
        "Because everything runs locally, you can build markup with draft ratings, real reviewer names or internal item data without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Describe the reviewed item",
      description:
        "Enter the item's name and pick its schema.org type, Product, LocalBusiness, Book, Course, Recipe, Movie and so on. Reviewing a specific, eligible thing is what makes the snippet possible.",
    },
    {
      title: "Add the reviewer and the review",
      description:
        "Fill in the author name and paste the review body. Both are recommended for a trustworthy review snippet, though only the rating is strictly required.",
    },
    {
      title: "Set the star rating and its scale",
      description:
        "Enter the rating value and, if you're not on a 1–5 scale, adjust bestRating and worstRating. The live preview renders it as stars so you can confirm it reads correctly.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the HTML of the page that shows the review.",
    },
    {
      title: "Test in Google's Rich Results Test",
      description:
        "Run the same markup through Google's Rich Results Test to confirm review-snippet eligibility on Google's own checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "E-commerce manager",
      title: "Mark up an on-page product review",
      description:
        "Attach a Review with a star rating to a product page so an individual customer review is eligible for the star-rating enhancement in Search.",
    },
    {
      audience: "SEO specialist",
      title: "Structure editorial reviews",
      description:
        "Generate Review markup for hands-on reviews of books, courses, movies or software, with the correct itemReviewed type and a rating on the right scale.",
    },
    {
      audience: "Local business / agency",
      title: "Publish reviews the compliant way",
      description:
        "Use the built-in policy notes to add third-party customer reviews to an eligible page without tripping Google's ban on self-serving reviews of your own business.",
    },
    {
      audience: "Developer",
      title: "Prototype review JSON-LD fast",
      description:
        "Fill the form, copy the exact script tag and drop it into a template. No memorising the Review → itemReviewed → reviewRating nesting by hand.",
    },
  ],

  troubleshooting: [
    {
      problem: "The check says a required property (reviewRating) is missing.",
      solution:
        "A Review needs a rating to be eligible for the star snippet. Enter a rating value: the generator wraps it in a Rating node with your bestRating/worstRating bounds and the error clears.",
    },
    {
      problem: "My star preview shows fewer stars than I expected.",
      solution:
        "The stars are drawn against your bestRating. If you rated 9 on a 1–10 scale, set bestRating to 10 so the preview (and Google) interpret the value correctly instead of assuming a 1–5 scale.",
    },
    {
      problem: "Google won't show my review stars even though the markup is valid.",
      solution:
        "Valid markup is necessary but not sufficient. Confirm the itemReviewed is an eligible type, that the review isn't a self-serving review of your own business, and that the reviewed content is actually visible on the page: then re-test in the Rich Results Test.",
    },
    {
      problem: "Should I use Review or AggregateRating?",
      solution:
        "Use Review for a single person's review with one rating. If you're summarising many ratings (an average across N reviews), that's AggregateRating, build it on the item itself with the Schema Markup Generator or a Product schema instead.",
    },
  ],

  tips: [
    "Only mark up reviews that are genuinely visible on the page: invisible or fabricated review markup can trigger a manual action.",
    "Never add a review of your own business, product or service to your own site as a Review, Google explicitly forbids self-serving reviews for the snippet.",
    "Always set bestRating (and worstRating if it isn't 1) so a rating like 8/10 isn't misread as 8 out of 5.",
    "Attach the review to a specific eligible item (Product, Book, Course, Recipe, Movie, LocalBusiness…), not to a homepage or a broad category.",
    "After copying, run the markup through Google's Rich Results Test. Passing this tool's check is necessary but Google adds its own eligibility rules.",
  ],

  security:
    "Your review markup is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. Reviewer names, ratings, review text and item details are never stored, logged or transmitted, so you can safely build markup containing draft or private review data. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is Review schema and why do I need it?",
      answer:
        "Review schema is structured data that describes a review of a specific item using the schema.org Review type. Search engines read it to understand who reviewed what and how they rated it, which can make the page eligible for the star-rating rich result: a star widget shown beside your listing in Search. Correct Review markup is the prerequisite for that enhancement.",
    },
    {
      question: "What's the difference between Review and AggregateRating?",
      answer:
        "A Review represents one person's review, with a single reviewRating. An AggregateRating summarises many ratings into an average (with a reviewCount or ratingCount). If you want to show an average of N reviews, use AggregateRating on the item itself. If you want to mark up one individual review, use Review, which is what this generator builds.",
    },
    {
      question: "What is itemReviewed and why does the type matter?",
      answer:
        "itemReviewed is the thing the review is about. Google only shows review snippets for reviews of specific, eligible types: such as Product, LocalBusiness, Book, Course, Recipe, Movie, Software and a handful of others. Reviewing a vague category or your whole website won't qualify, so the generator lets you pick the exact schema.org type for the reviewed item.",
    },
    {
      question: "Can I add a review of my own business to my site?",
      answer:
        "No, Google's review-snippet policy explicitly forbids self-serving reviews, meaning a review of your own business, product or service placed on your own page for the snippet. You can display third-party or genuine customer reviews of eligible items, but you cannot rate yourself. The tool flags this inline so you don't build ineligible markup.",
    },
    {
      question: "How do I handle a rating scale that isn't 1–5?",
      answer:
        "Set bestRating (and worstRating if it isn't 1) to your scale's bounds. For an 8/10 rating, enter 8 as the value with bestRating 10 and worstRating 1. The generator writes those into the Rating node so Google interprets the number correctly, and the star preview scales to match.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the page that displays the review, either in the head or the body works for Google. In a CMS, add it via a custom-HTML block, a theme template or a plugin field. Keep the markup on the same page as the visible review it describes.",
    },
    {
      question: "Does valid markup guarantee I'll get star ratings in Search?",
      answer:
        "No tool can guarantee a rich result, Google decides whether to show one based on markup validity, content quality, item eligibility and its policies. What this tool guarantees is syntactically valid Review JSON-LD with a rating present, which is the prerequisite. Always confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "Is my review data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Reviewer names, ratings, review text and item details never leave your device, there's nothing for us to upload, store or log, so it's safe to build markup with private or unpublished review data.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: Review JSON-LD generator with itemReviewed (type + name), author, review body and a normalised Rating node, live star preview, required-property check, copy-ready script tag, download, presets, undo/redo and share links.",
    },
    {
      date: "2026-06-26",
      change:
        "Added bestRating/worstRating scale controls with a rating-range guard, inline Google review-snippet policy notes, and a minified-output toggle.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "product-schema-generator",
    "faq-schema-generator",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default reviewSchemaGenerator;
