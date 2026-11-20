import type { Tool } from "@/types";

/**
 * FAQ Schema Generator: a dedicated, single-purpose builder for FAQPage
 * JSON-LD structured data. Users add repeatable question/answer pairs and the
 * tool emits valid schema.org FAQPage markup live, validates it against the
 * required and recommended properties Google needs for the FAQ rich result,
 * and hands over a copy-ready `<script type="application/ld+json">` block. Every
 * builder runs on `lib/seo-tools/schema.ts` in the browser. No question,
 * answer or business data is ever uploaded. Copy is unique to FAQ structured
 * data and written to rank for the exact queries people type when they want an
 * FAQ rich result in Google Search.
 */
const faqSchemaGenerator: Tool = {
  slug: "faq-schema-generator",
  title: "FAQ Schema Generator",
  description:
    "Turn a list of questions and answers into valid FAQPage JSON-LD structured data, with a live validity check for the Google FAQ rich result and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "HelpCircle",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "FAQ Schema Generator: FAQPage JSON-LD for Google's FAQ Rich Result",
  tagline:
    "Add your questions and answers once and get valid FAQPage structured data instantly. We validate every Q&A against schema.org's required and recommended properties, then hand you the exact <script> tag to paste, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI FAQ Schema Generator builds schema.org FAQPage structured data as JSON-LD, the format Google explicitly recommends for the FAQ rich result. Add each question with its answer in a clean, repeatable form, reorder or remove entries as you refine the page, and watch valid JSON-LD regenerate live on every keystroke. What separates it from a generic paste-a-blob builder is the built-in validity check: each Question needs a name and each accepted Answer needs text, and the tool grades your markup against those required and recommended properties so you can see at a glance whether the block is eligible for a rich result and exactly which Q&A is incomplete. Empty pairs are stripped automatically, HTML in answers is preserved so formatted responses stay intact, and the output is available both pretty-printed and minified. When you are done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, and share a link that reopens the tool with your questions pre-filled for a teammate. Because generation and validation happen entirely on your device using the browser's own JSON engine, your questions, answers and any internal support content never leave your machine. There is nothing for us to store, log or see. Note that Google now limits FAQ rich results primarily to well-known, authoritative government and health sites. The markup remains valuable for other search features, assistants and voice results, and this tool makes sure yours is correct.",

  ctaText: "Generate FAQ schema",

  keywords: [
    "faq schema generator",
    "faqpage json-ld generator",
    "faq structured data generator",
    "faq rich result markup",
    "schema.org faqpage",
    "faq json-ld",
    "google faq schema",
    "faq snippet generator",
    "structured data for faq",
    "faq markup generator",
  ],

  seo: {
    title:
      "FAQ Schema Generator, Free FAQPage JSON-LD Structured Data | GigAI Tools",
    description:
      "Free FAQ schema generator: turn questions and answers into valid FAQPage JSON-LD structured data. Live validity check for the Google FAQ rich result, copy-ready script tag, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "ListPlus",
      title: "Repeatable Q&A, reorder & remove",
      description:
        "Add as many question/answer pairs as your page needs, move them up or down, and delete any entry, the FAQPage JSON-LD rebuilds itself on every change.",
    },
    {
      icon: "ShieldCheck",
      title: "Live rich-result validity check",
      description:
        "Every Question is graded against schema.org's required properties (a name and an answer with text) so you instantly see which pairs are incomplete and whether the block qualifies.",
    },
    {
      icon: "Zap",
      title: "Live JSON-LD as you type",
      description:
        "The output pane regenerates on every keystroke with empty pairs stripped and formatting preserved, so what you copy is always in sync with the form.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block, or download the raw JSON. No hand-editing braces, no guessing the mainEntity shape.",
    },
    {
      icon: "Minimize2",
      title: "Pretty or minified output",
      description:
        "Toggle between human-readable, pretty-printed JSON-LD and a single-line minified block for production, with a live byte count for either.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Your questions, answers and any internal content are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Win FAQ features without hand-writing JSON",
      description:
        "The nested Question/Answer/acceptedAnswer shape is easy to get wrong by hand. The generator produces it cleanly so you skip the syntax errors that silently disqualify a page.",
    },
    {
      title: "Know your markup is valid before you ship",
      description:
        "The inline check flags any question missing a name or an answer as an error and points to weak entries as warnings, so you fix eligibility problems in the tool instead of in Search Console.",
    },
    {
      title: "Keep FAQ markup consistent across a site",
      description:
        "Share a pre-filled link or a downloaded snippet so every author emits the same FAQPage shape, consistent structured data search engines and assistants can trust.",
    },
    {
      title: "Safe for private or internal answers",
      description:
        "Because everything runs locally, you can draft markup with unpublished pricing, policy or support answers without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Add your questions and answers",
      description:
        "Type each question and its answer into a pair of fields. Click Add question for another, or load the example to see a fully-populated, valid FAQPage.",
    },
    {
      title: "Read the validity check",
      description:
        "Watch the required/recommended report: green means every pair is complete, warnings flag thin entries, and errors point to any question missing a name or an answer.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the `<head>` or body of the page that shows the same visible FAQ.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Paste the same markup into Google's Rich Results Test or Schema Markup Validator to confirm it parses cleanly on Google's own checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Mark up a support or pricing FAQ",
      description:
        "Generate FAQPage JSON-LD for a support-centre or pricing page and hand developers a validated snippet to drop into the CMS layout for consistent structured data.",
    },
    {
      audience: "Content writer / blogger",
      title: "Add an FAQ block to a long-form guide",
      description:
        "Turn the questions readers actually ask into structured data so a guide is eligible for FAQ-style enhancements and easier for assistants to quote.",
    },
    {
      audience: "E-commerce manager",
      title: "Answer product questions in markup",
      description:
        "Build FAQPage schema for shipping, returns and sizing questions on a product or category page to reinforce the page's structured data.",
    },
    {
      audience: "Developer",
      title: "Generate a template-ready snippet",
      description:
        "Produce the exact mainEntity array shape to wire into a component or CMS field, then reuse the download across every FAQ template on the site.",
    },
  ],

  troubleshooting: [
    {
      problem: "The validity check shows an error on one of my questions.",
      solution:
        "Every Question needs a name (the question text) and an acceptedAnswer with text. Fill in both fields for that pair and the error clears. A pair missing either is not valid FAQPage markup.",
    },
    {
      problem: "I added the schema but no FAQ rich result appears in Google.",
      solution:
        "Google now restricts the FAQ rich result mainly to authoritative government and health sites, so most pages will not show the accordion even with perfect markup. The structured data is still valid and useful for other search features, assistants and voice. This is a Google policy limit, not a markup error.",
    },
    {
      problem: "My answer contains a link or bold text. Is that allowed?",
      solution:
        "Yes. FAQ answers may contain limited HTML such as links and basic formatting, and the generator preserves it in the answer text. Keep the markup answer identical to the visible answer on the page.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test before publishing. It applies Google-specific eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Only add questions and answers that are actually visible on the page. Hidden or mismatched FAQ content can trigger a manual action.",
    "Keep each answer concise and self-contained. The markup answer should match the visible text word for word.",
    "Use one FAQPage block per page rather than repeating the same questions across many URLs.",
    "Load the example to see a valid, fully-populated FAQPage, then swap in your own questions one pair at a time.",
    "After copying, run the markup through Google's Rich Results Test. Passing this tool's check is necessary, but Google adds its own eligibility rules.",
  ],

  security:
    "Your FAQ markup is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. No questions, answers or internal content are stored, logged or transmitted, so you can safely build markup containing private or unpublished information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is FAQ schema and why would I add it?",
      answer:
        "FAQ schema is structured data that describes a list of questions and their answers using the schema.org FAQPage type, written as JSON-LD. Search engines and assistants read it to understand that a page contains a genuine FAQ, which historically powered an expandable FAQ rich result in Google and still helps other search features, voice answers and AI assistants quote your content accurately.",
    },
    {
      question: "How do I add FAQ schema to my website?",
      answer:
        "Add your questions and answers in the form, copy the generated `<script type=\"application/ld+json\">` block, and paste it into the HTML of the page that shows the same visible FAQ: either in the `<head>` or anywhere in the `<body>`. In a CMS, add it via a custom-HTML block, a theme template or a plugin field. The markup must match the FAQ that's visible on that page.",
    },
    {
      question: "Does Google still show FAQ rich results?",
      answer:
        "Since August 2023, Google limits the FAQ rich result mainly to well-known, authoritative government and health websites, so most sites no longer see the FAQ accordion in Search even with valid markup. The structured data remains worthwhile: it's valid schema.org data that other search features, assistants and voice results can use, and it costs nothing to keep it correct with this tool.",
    },
    {
      question: "What's the difference between FAQPage and Q&A schema?",
      answer:
        "FAQPage is for a page where the site author provides both the questions and their single, authoritative answers, like a support or product FAQ. QAPage is for pages where a user asks a question and the community submits multiple answers, like a forum thread. This generator builds FAQPage, which is what you want for an editorial FAQ you control.",
    },
    {
      question: "How many questions should an FAQ page have?",
      answer:
        "There's no fixed minimum, but include every question that's genuinely useful and visible on the page, typically a handful to a dozen. Don't pad the list with questions that aren't shown to users just to grow the markup. The structured data must reflect the visible FAQ, and mismatches can cause problems.",
    },
    {
      question: "Can answers contain links or HTML formatting?",
      answer:
        "Yes. schema.org allows a limited set of HTML in FAQ answers, such as links, bold and lists, and this generator preserves whatever you type in the answer field. Keep the formatting sensible and make sure the answer in the markup matches the answer a visitor actually sees on the page.",
    },
    {
      question: "Is my FAQ data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your questions and answers never leave your device, there's nothing for us to upload, store or log. It's safe to build markup containing private or unpublished content.",
    },
    {
      question: "How is this different from the full Schema Markup Generator?",
      answer:
        "This is a focused tool for one job, building and validating FAQPage JSON-LD, with a form and copy tuned entirely to questions and answers. The Schema Markup Generator is the hub covering a dozen types (Article, Product, Organization and more). Use this when you only need FAQ markup. Use the hub when you need other schema types too.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, repeatable question/answer form, live FAQPage JSON-LD, required/recommended validity check, copy-ready script tag, download, example preset, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added a pretty/minified output toggle with live byte count, reorder controls for questions, and per-entry completeness checks.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report to flag thin answers as warnings and added an honest note about Google's current FAQ rich-result eligibility limits.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "breadcrumb-schema-generator",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default faqSchemaGenerator;
