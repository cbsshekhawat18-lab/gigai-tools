import type { Tool } from "@/types";

/**
 * Breadcrumb Schema Generator, a dedicated, single-purpose builder for
 * BreadcrumbList JSON-LD. You lay out the ordered trail from your home page
 * down to the current page (Home › Category › Sub-category › Page), reorder or
 * remove crumbs, and the tool emits valid schema.org BreadcrumbList markup with
 * correctly numbered `ListItem` positions, a live Google-style breadcrumb
 * preview, and a required-property validity check. Everything runs on
 * `lib/seo-tools/schema.ts` in the browser. No URLs, page titles or site
 * structure are ever uploaded. Copy is unique to breadcrumb structured data and
 * written to rank for the exact queries people search when they want the
 * breadcrumb trail to show in Google instead of a bare URL.
 */
const breadcrumbSchemaGenerator: Tool = {
  slug: "breadcrumb-schema-generator",
  title: "Breadcrumb Schema Generator",
  description:
    "Build valid BreadcrumbList JSON-LD from an ordered trail of pages, with a live Google-style breadcrumb preview, auto-numbered positions and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "ChevronRight",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-06-21",

  h1: "Breadcrumb Schema Generator: BreadcrumbList JSON-LD for Google",
  tagline:
    "List your pages from Home down to the current page, drag them into order, and get valid BreadcrumbList JSON-LD instantly. Positions are numbered for you, the trail previews exactly as Google shows it, and everything is generated in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Breadcrumb Schema Generator turns an ordered list of pages into valid schema.org BreadcrumbList structured data: the markup that replaces a bare URL in Google's search results with a clickable breadcrumb trail like example.com › Blog › SEO. Add each crumb in order from your site's home page down to the current page, give every one a name and its canonical URL, and reorder or delete them with the move controls until the trail matches the page's real position in your site hierarchy. As you type, the tool emits clean JSON-LD with each `ListItem` numbered in sequence (position 1, 2, 3…), strips empty crumbs, and previews the trail exactly as it appears under a Google result. A built-in validity check confirms every crumb has both a name and a URL (the two properties Google requires) and flags anything missing before you ship. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, then drop it into the `<head>` of the page it describes. Because generation and validation happen entirely on your device using the browser's own JSON engine, your URLs, page titles and internal site structure never leave your machine: there's nothing for us to store, log or see.",

  ctaText: "Generate breadcrumb schema",

  keywords: [
    "breadcrumb schema generator",
    "breadcrumblist json-ld",
    "breadcrumb structured data",
    "breadcrumb markup generator",
    "schema breadcrumb generator",
    "json-ld breadcrumb",
    "breadcrumb rich result",
    "google breadcrumb schema",
    "breadcrumblist schema.org",
    "seo breadcrumb generator",
  ],

  seo: {
    title:
      "Breadcrumb Schema Generator, Free BreadcrumbList JSON-LD Tool | GigAI Tools",
    description:
      "Free breadcrumb schema generator: build valid BreadcrumbList JSON-LD from an ordered trail of pages, with a live Google breadcrumb preview, auto-numbered positions and a copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "ListOrdered",
      title: "Ordered trail, positions handled for you",
      description:
        "Add crumbs from Home down to the current page. The generator numbers each ListItem's position in sequence, so you never hand-count 1, 2, 3 or break the order.",
    },
    {
      icon: "MoveVertical",
      title: "Reorder & remove in one click",
      description:
        "Move any crumb up or down or delete it with dedicated controls, restructure the trail to match your real site hierarchy without editing raw JSON.",
    },
    {
      icon: "Eye",
      title: "Live Google-style breadcrumb preview",
      description:
        "See the trail render exactly as it appears under a search result, example.com › Blog › SEO, so you catch an awkward label or wrong order before publishing.",
    },
    {
      icon: "ShieldCheck",
      title: "Required-property validity check",
      description:
        "Every crumb is checked for the name and URL that Google requires. Missing pieces are flagged as errors so you know the markup is eligible before you ship it.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON. No wrapping, no hand-editing braces, no guessing where the position numbers go.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Your URLs, page titles and site structure are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Replace a bare URL with a clickable trail in Search",
      description:
        "A breadcrumb rich result shows your site's hierarchy, Home › Category › Page, instead of a long URL, giving users context and often lifting click-through on deep pages.",
    },
    {
      title: "Ship correct positions every time",
      description:
        "The single most common breadcrumb mistake is mis-numbered or non-sequential positions. Because the tool assigns them from the order of your list, that class of error simply can't happen.",
    },
    {
      title: "Standardise breadcrumbs across templates",
      description:
        "Build the trail for a category or product template once, download the pattern, and hand developers a validated snippet so every page emits the same clean BreadcrumbList shape.",
    },
    {
      title: "Safe for unpublished URLs",
      description:
        "Because everything runs locally, you can build markup for staging URLs or unreleased pages without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Add your crumbs in order",
      description:
        "Start with your home page as the first crumb, then add each level down to the current page. Give every crumb a short name and its canonical URL.",
    },
    {
      title: "Reorder until the trail is right",
      description:
        "Use the up/down controls to fix the sequence and delete any crumb you don't need. The trail should read exactly like the path a visitor took to reach the page.",
    },
    {
      title: "Check the preview and validity",
      description:
        "Confirm the Google-style preview matches your intended hierarchy and that the validity check is green: every crumb needs both a name and a URL.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the `<head>` of the specific page the breadcrumb describes.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Paste the markup into Google's Rich Results Test to verify breadcrumb eligibility on Google's own checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Add breadcrumbs to a category template",
      description:
        "Build the Home › Category › Sub-category trail once, validate it, and hand developers a snippet to inject dynamically across every listing page in the CMS.",
    },
    {
      audience: "E-commerce manager",
      title: "Give product pages a clear trail",
      description:
        "Generate Home › Department › Category › Product breadcrumbs so deep product URLs show their place in the catalogue instead of a long query string in Search.",
    },
    {
      audience: "Content team / blogger",
      title: "Structure a blog's sections",
      description:
        "Create Home › Blog › Topic › Article breadcrumbs so long-form posts surface their section, improving context and internal-linking signals.",
    },
    {
      audience: "Web developer",
      title: "Prototype the JSON before wiring it up",
      description:
        "Model the exact BreadcrumbList shape and position numbering here, then translate the validated output into the dynamic markup your framework generates.",
    },
  ],

  troubleshooting: [
    {
      problem: "A crumb is flagged as missing its name or URL.",
      solution:
        "Google requires every ListItem to have both a name and an item URL. Fill in the empty field, or delete the crumb entirely if it doesn't belong in the trail. Empty crumbs are stripped from the output automatically.",
    },
    {
      problem: "The positions in my JSON aren't 1, 2, 3…",
      solution:
        "They always will be here: position is assigned from the order of your list, so reordering a crumb renumbers everything for you. If you're comparing against hand-written markup, that's usually where the mistake was.",
    },
    {
      problem: "Google's test says my breadcrumb doesn't match the page.",
      solution:
        "The final crumb should represent the current page and its URL should be that page's canonical URL. Make sure the trail's names and links mirror the real navigation path a user follows, not an arbitrary menu.",
    },
    {
      problem: "My breadcrumb rich result still isn't showing.",
      solution:
        "Valid markup makes a page eligible, but Google decides when to display a breadcrumb and it can take time to recrawl. Confirm eligibility in the Rich Results Test, ensure the trail is on the live page, and be patient after publishing.",
    },
  ],

  tips: [
    "Make the first crumb your home page and the last crumb the current page, the last item's URL should be that page's canonical URL.",
    "Keep crumb names short and human ('SEO' or 'Running Shoes', not the full page title) so the trail stays readable in Search.",
    "Mirror the real path a user follows through your navigation. A breadcrumb that doesn't match on-page navigation can be ignored by Google.",
    "One page can carry breadcrumbs alongside other schema: add the BreadcrumbList script next to your Article or Product block rather than merging them.",
    "After copying, always run the markup through Google's Rich Results Test. Passing this tool's check is necessary but Google adds its own eligibility rules.",
  ],

  security:
    "Your breadcrumb markup is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. No URLs, page names or site-structure details are stored, logged or transmitted, so you can safely build breadcrumbs for staging or unreleased pages. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is breadcrumb schema and what does it do?",
      answer:
        "Breadcrumb schema is BreadcrumbList structured data, a machine-readable description of a page's position in your site hierarchy using the schema.org vocabulary. When Google reads valid breadcrumb markup, it can replace the bare URL in the search result with a clickable trail like example.com › Blog › SEO, giving users context about where the page sits and how it relates to the rest of your site.",
    },
    {
      question: "What is BreadcrumbList JSON-LD?",
      answer:
        "BreadcrumbList is the schema.org type for a breadcrumb trail, and JSON-LD is the format Google recommends for adding it, a block of structured data in a `<script type=\"application/ld+json\">` tag, separate from your visible HTML. Each step in the trail is a numbered ListItem with a name and a URL. This tool builds that exact structure and numbers the positions for you.",
    },
    {
      question: "How do I set the position numbers?",
      answer:
        "You don't: the tool does it. Position is assigned automatically from the order of your crumb list: the first item is position 1, the second is position 2, and so on. Reorder a crumb and everything renumbers instantly. This eliminates the most common breadcrumb error, which is mis-numbered or non-sequential positions.",
    },
    {
      question: "What does each crumb need to be valid?",
      answer:
        "Google requires every crumb (ListItem) to have a name and an item URL. The name is the short label shown in the trail. The item is the URL that crumb links to. The validity check flags any crumb missing either one, and empty crumbs are dropped from the output automatically so they never break your markup.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the specific page the breadcrumb describes. The `<head>` is ideal, though anywhere in the `<body>` also works for Google. In a CMS, add it via a custom-HTML block, a theme template, or a plugin field. Each page should carry its own breadcrumb reflecting that page's path.",
    },
    {
      question: "Should the last crumb link to the current page?",
      answer:
        "Yes. Google's guidance is for the full trail, including the current page as the final crumb, to be represented, with each ListItem's item pointing to that step's URL. Use the current page's canonical URL for the last crumb so the trail accurately reflects where the visitor is.",
    },
    {
      question: "Will this guarantee a breadcrumb rich result in Google?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show a breadcrumb, based on valid markup plus its own eligibility rules and crawl schedule. What this tool guarantees is syntactically valid BreadcrumbList JSON-LD with correctly numbered positions and every required property present, which is the prerequisite. Always confirm with Google's Rich Results Test.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your URLs, page names and site structure never leave your device, there's nothing for us to upload, store or log. It's safe to build breadcrumbs for staging or unpublished pages.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, ordered breadcrumb editor building valid BreadcrumbList JSON-LD with auto-numbered positions, live Google-style trail preview, required-property validity check, copy-ready script tag, download, example and undo/redo.",
    },
    {
      date: "2026-06-27",
      change:
        "Added move-up/move-down reorder controls per crumb, empty-crumb stripping and a minified-output toggle.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "faq-schema-generator",
    "meta-tag-generator",
    "google-serp-preview",
    "json-formatter",
    "url-encoder",
  ],
};

export default breadcrumbSchemaGenerator;
