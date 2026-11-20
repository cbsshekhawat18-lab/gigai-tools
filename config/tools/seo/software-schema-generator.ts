import type { Tool } from "@/types";

/**
 * SoftwareApplication Schema Generator, a dedicated, single-type structured-data
 * builder for apps, SaaS products, mobile apps, browser extensions and games.
 * It emits valid `SoftwareApplication` JSON-LD (with the `offers` and
 * `aggregateRating` nested nodes Google needs for the app rich result / star
 * snippet), validates required and recommended properties live, and hands over a
 * copy-ready `<script type="application/ld+json">` block. Everything runs on
 * `lib/seo-tools/schema.ts` in the browser, nothing about the product, its
 * pricing or its ratings is ever uploaded. Copy is unique to app/SaaS structured
 * data and written to rank for the exact queries product marketers and SEOs type
 * when they want their software to show ratings and pricing in Search.
 */
const softwareSchemaGenerator: Tool = {
  slug: "software-schema-generator",
  title: "SoftwareApplication Schema Generator",
  description:
    "Generate valid SoftwareApplication JSON-LD for apps, SaaS and games (category, operating system, price and star rating) with a live rich-results validity check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "AppWindow",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-22",

  h1: "SoftwareApplication Schema Generator: JSON-LD for Apps, SaaS & Games",
  tagline:
    "Describe your app once (name, category, supported operating systems, price and rating) and get valid SoftwareApplication JSON-LD instantly. We validate the properties Google reads for the app rich result and star snippet, then hand you the exact <script> tag to paste. All in your browser, nothing uploaded.",
  longDescription:
    "The GigAI SoftwareApplication Schema Generator builds the structured data that lets Google understand your software and, where eligible, show its price and star rating directly in search results. Aimed squarely at SaaS pages, mobile-app landing pages, desktop apps, browser extensions and web games, it produces clean schema.org `SoftwareApplication` JSON-LD, the format Google explicitly recommends, with the two nested nodes that actually unlock rich features: an `Offer` (price and currency, including a `price` of 0 for free products) and an `aggregateRating` (rating value plus review or rating count). As you fill the form the tool grades your markup against schema.org's required and recommended sets for `SoftwareApplication`, so you can see at a glance whether it's valid and precisely which fields: like `applicationCategory` or `operatingSystem`: would strengthen it. Free-app pricing is handled correctly (a `price` of 0 still emits a full `Offer`), empty fields are stripped, and the output regenerates live on every keystroke. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, load a realistic preset to learn the shape, and share a link that reopens the tool with your data pre-filled for a teammate. Because generation and validation happen entirely on your device using the browser's own JSON engine, your product name, pricing and internal rating numbers never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate app schema",

  keywords: [
    "software schema generator",
    "softwareapplication schema",
    "softwareapplication json-ld",
    "app schema markup",
    "saas schema generator",
    "software structured data",
    "app rich result schema",
    "software star rating schema",
    "mobile app schema generator",
    "aggregate rating schema for software",
    "app pricing structured data",
    "web application schema",
  ],

  seo: {
    title:
      "SoftwareApplication Schema Generator: Free App & SaaS JSON-LD | GigAI Tools",
    description:
      "Free SoftwareApplication schema generator for apps, SaaS and games. Build valid JSON-LD with category, OS, price and star rating, a live rich-results check and a copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "AppWindow",
      title: "Purpose-built for SoftwareApplication",
      description:
        "One focused form for the app rich result (name, category, operating systems, price and rating) instead of hunting through a generic schema builder for the fields that matter.",
    },
    {
      icon: "BadgeDollarSign",
      title: "Offer & rating nodes done right",
      description:
        "The generator nests a valid Offer (price + currency, including 0 for free apps) and an aggregateRating (value + review/rating count): the two pieces Google reads for pricing and star snippets.",
    },
    {
      icon: "ShieldCheck",
      title: "Live rich-results validity check",
      description:
        "Every field is graded against schema.org's required and recommended properties for SoftwareApplication, so you instantly see whether the markup is valid and what's still missing.",
    },
    {
      icon: "Zap",
      title: "Live JSON-LD as you type",
      description:
        "The output pane regenerates on every keystroke with empty fields stripped and availability shorthands like 'InStock' expanded to full schema.org URLs.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block, or download the raw JSON, with a pretty/minified toggle so you can ship whichever your CMS prefers.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Your product name, pricing and rating numbers are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Show price and stars in Search",
      description:
        "A valid SoftwareApplication block with Offer and aggregateRating is what makes your app eligible for pricing and star-rating enhancements, the details that make a listing stand out and win the click.",
    },
    {
      title: "Know it's valid before you ship",
      description:
        "The inline check flags a missing name as an error and missing recommended fields like applicationCategory or operatingSystem as warnings, so you fix eligibility issues here instead of in Search Console later.",
    },
    {
      title: "Standardise markup across app pages",
      description:
        "Share a pre-filled link or a downloaded snippet so every product and app-store landing page emits the same consistent SoftwareApplication shape Google can trust.",
    },
    {
      title: "Safe for unpublished pricing",
      description:
        "Because everything runs locally, you can draft markup with in-flight prices or internal rating numbers without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Name your app and describe it",
      description:
        "Enter the software's name (the only required field) and a short description. Load the preset first if you want a realistic, fully-valid starting point to edit.",
    },
    {
      title: "Set category, OS, price and rating",
      description:
        "Pick an applicationCategory (e.g. DeveloperApplication, BusinessApplication, GameApplication), list the operating systems, and add price/currency and a rating value with its review count.",
    },
    {
      title: "Read the validity check",
      description:
        "Watch the required/recommended report: green means valid, warnings point to recommended fields that improve eligibility, and an error flags a missing name.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the `<head>` or body of the page that describes the app.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Paste the same markup into Google's Rich Results Test or the Schema Markup Validator to confirm eligibility on Google's own checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "SaaS marketer",
      title: "Add pricing & rating to a product page",
      description:
        "Mark up your homepage or pricing page as a SoftwareApplication with an Offer and aggregateRating so Google can surface your price and star rating in search.",
    },
    {
      audience: "Mobile app developer",
      title: "Structure an app landing page",
      description:
        "Emit SoftwareApplication (or MobileApplication) JSON-LD with operatingSystem set to iOS/Android and your app-store rating, giving Search the details it needs for an app-style listing.",
    },
    {
      audience: "SEO specialist",
      title: "Standardise markup across a software catalog",
      description:
        "Generate a validated template block and hand developers a consistent SoftwareApplication shape to drop into every product page in the CMS.",
    },
    {
      audience: "Indie game / tool maker",
      title: "Mark up a free web app or game",
      description:
        "Build a valid SoftwareApplication with a price of 0 so even a free tool or browser game gets clean, correct structured data and a proper Offer node.",
    },
  ],

  troubleshooting: [
    {
      problem: "My free app's price disappears from the markup.",
      solution:
        "Enter 0 in the Price field (not an empty box). This tool keeps a price of 0 and emits a full Offer node. Google needs an Offer with price 0 to understand that an app is free.",
    },
    {
      problem: "The rating (stars) node isn't appearing.",
      solution:
        "aggregateRating only renders when you supply a Rating value. Add the rating value and, ideally, a review or rating count. A rating with no count is often ignored by Google.",
    },
    {
      problem: "Google's test says applicationCategory is recommended.",
      solution:
        "It's a warning, not a blocker, but set applicationCategory to a schema.org value like DeveloperApplication, BusinessApplication or GameApplication. Complete markup is more likely to earn an enhancement.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This is a pragmatic linter for required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test, which layers its own eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "For a free product, set the price to 0. That still emits a valid Offer, which is exactly how Google recognises free software.",
    "Use a real schema.org applicationCategory such as DeveloperApplication, BusinessApplication, DesignApplication or GameApplication rather than a made-up label.",
    "operatingSystem accepts a comma-separated list (e.g. 'Web, iOS, Android') so one block can cover every platform your app runs on.",
    "Only include an aggregateRating you can back up with real, visible reviews. Fabricated ratings can trigger a manual action.",
    "After copying, run the markup through Google's Rich Results Test. Passing this tool's check is necessary but Google adds its own eligibility rules.",
  ],

  security:
    "Your app's structured data is generated and validated entirely in your browser using its native JSON engine: nothing is uploaded to any server. No product names, prices or rating numbers are stored, logged or transmitted, so you can safely build markup containing unpublished pricing or internal figures. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is SoftwareApplication schema and why do I need it?",
      answer:
        "SoftwareApplication is the schema.org type that describes a piece of software: a web app, SaaS product, mobile app, desktop program, browser extension or game. Adding it as JSON-LD helps Google understand that the page is about an application and, where eligible, show enhancements like its price and star rating directly in search results, which can lift visibility and click-through.",
    },
    {
      question: "How do I mark up a free app so Google knows it's free?",
      answer:
        "Include an Offer with a price of 0 and a currency. Counter-intuitively, 'free' isn't the absence of a price, Google reads a price of 0 to mean the software is free. This tool keeps a 0 and emits the full Offer node for you, so free apps get correct markup.",
    },
    {
      question: "What applicationCategory should I use?",
      answer:
        "Use a schema.org application category that fits your product. Common ones are DeveloperApplication, BusinessApplication, DesignApplication, SecurityApplication, GameApplication, EducationalApplication and UtilitiesApplication. It's a recommended (not required) property, but setting it makes your markup more complete and more likely to earn an enhancement.",
    },
    {
      question: "How do I get star ratings to show for my app?",
      answer:
        "Add an aggregateRating with a ratingValue (e.g. 4.7) and a reviewCount or ratingCount. Google generally needs both the value and a count, and the ratings must reflect genuine reviews that are visible on the page. Fabricated or hidden ratings can lead to a manual action, so only mark up ratings you can substantiate.",
    },
    {
      question: "SoftwareApplication, WebApplication or MobileApplication, which type?",
      answer:
        "SoftwareApplication is the safe, general choice and works for almost every case. WebApplication and MobileApplication are more specific subtypes. Use them only if you want to signal the exact platform and your data fits. This tool generates SoftwareApplication, which Google accepts for web, mobile and desktop software alike. Set operatingSystem to convey the platform.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the page that describes the app, the `<head>` or anywhere in the `<body>` both work for Google. In a CMS, add it via a custom-HTML block, a theme template or an SEO plugin. Put it on the specific product or app page, not site-wide.",
    },
    {
      question: "Does this guarantee my app will show a rich result?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show one based on markup validity, content quality and its own eligibility rules. What this tool guarantees is syntactically valid SoftwareApplication JSON-LD with the required property present, which is the prerequisite. Always confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your product name, pricing and rating numbers never leave your device, there's nothing for us to upload, store or log. It's safe to build markup containing unpublished prices or internal figures.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, dedicated SoftwareApplication generator with a tailored form (category, OS, price, rating), live JSON-LD, required/recommended validity check, copy-ready script tag, download, preset and share links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added correct free-app handling (a price of 0 now emits a full Offer node), availability enum expansion and a pretty/minified output toggle.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report with grouped required vs. recommended checks and a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "product-schema-generator",
    "organization-schema-generator",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default softwareSchemaGenerator;
