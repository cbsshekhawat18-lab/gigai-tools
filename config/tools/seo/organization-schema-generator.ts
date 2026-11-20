import type { Tool } from "@/types";

/**
 * Organization Schema Generator, a dedicated, single-purpose builder for
 * schema.org Organization JSON-LD. Where the Schema hub covers twelve types
 * shallowly, this tool goes deep on one: name, URL, logo, description, legal
 * name and alternate name, multiple `sameAs` social/profile links, a full
 * postal address, and one or more typed `contactPoint` entries (customer
 * support, sales, technical support…) with phone, email, languages and areas
 * served. It emits clean, validated JSON-LD live and hands you a copy-ready
 * `<script type="application/ld+json">` block. All generation runs on
 * `lib/seo-tools/schema.ts` in the browser. No company data is ever uploaded.
 * Copy is written for the exact queries people search when they want their
 * brand's Knowledge Panel, logo and sitelinks to appear in Google.
 */
const organizationSchemaGenerator: Tool = {
  slug: "organization-schema-generator",
  title: "Organization Schema Generator",
  description:
    "Build valid Organization JSON-LD structured data (name, logo, URL, sameAs social profiles and typed contact points) with a live validity check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Building2",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  h1: "Organization Schema Generator, JSON-LD for Your Brand's Knowledge Panel",
  tagline:
    "Enter your company's name, logo, website, social profiles and contact points once and get clean, validated Organization JSON-LD. It's the structured data Google reads to build your Knowledge Panel and show your logo in Search, generated entirely in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Organization Schema Generator produces schema.org Organization markup as JSON-LD, the exact structured data that tells Google, Bing and other search engines who your company is. A single well-formed Organization block links your brand to its official website, logo, legal name, alternate names and social profiles (via the `sameAs` property), and can declare one or more typed contact points such as customer support, sales or technical support with their own phone numbers, emails, spoken languages and areas served. This is the markup behind a brand's Knowledge Panel, the logo that appears beside your result, and clearer brand entity understanding across Search. Unlike a generic all-types builder, this tool is tuned specifically for Organization: it validates against schema.org's required and recommended properties for the type, strips empty fields automatically, formats phone numbers and URLs correctly, and lets you add unlimited social links and contact points without hand-editing a single brace. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` tag or download the raw JSON, and share a link that reopens the tool pre-filled for a teammate. Because everything is generated and validated locally using your browser's own JSON engine, your organization's internal contact details, unpublished legal names and private data never leave your device. There is nothing for us to store, log or transmit.",

  ctaText: "Generate organization schema",

  keywords: [
    "organization schema generator",
    "organization json-ld generator",
    "schema.org organization markup",
    "contactpoint schema generator",
    "company structured data",
    "brand schema markup",
    "knowledge panel schema",
    "logo schema json-ld",
    "corporation schema generator",
    "organization structured data",
  ],

  seo: {
    title:
      "Organization Schema Generator, Free JSON-LD Markup Tool | GigAI Tools",
    description:
      "Free Organization schema generator: build valid schema.org Organization JSON-LD with logo, sameAs social profiles, address and contact points. Live validity check, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "Building2",
      title: "Purpose-built for Organization",
      description:
        "A form tuned to exactly the fields Google reads for a brand, name, legal name, alternate name, URL, logo, description, founding date, address and contact points. Not a watered-down all-types builder.",
    },
    {
      icon: "Share2",
      title: "Unlimited sameAs profiles",
      description:
        "Add every official profile (X, LinkedIn, Facebook, Instagram, YouTube, Wikipedia, Crunchbase) to the sameAs array. This is how search engines confirm which social accounts genuinely belong to your brand.",
    },
    {
      icon: "Headset",
      title: "Typed contact points",
      description:
        "Declare one or more contactPoint entries (customer support, sales, technical support) each with its own phone, email, contact type, languages spoken and area served.",
    },
    {
      icon: "ShieldCheck",
      title: "Live validity check",
      description:
        "Every field is graded against schema.org's required and recommended properties for Organization, so you instantly see whether your markup is complete and what would strengthen it.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block, choose pretty or minified output, or download the raw JSON. No hand-editing braces, no guessing.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with your browser's native JSON engine. Contact details, legal names and internal data are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Help Google build your Knowledge Panel",
      description:
        "A clean Organization block with logo, sameAs and contact points gives search engines the structured signals they use to construct and enrich your brand's Knowledge Panel and show your logo beside results.",
    },
    {
      title: "Get your logo into Search results",
      description:
        "Google's logo guidelines rely on Organization markup pointing to a crawlable logo URL. This tool emits exactly that shape so your brand mark can appear alongside your listings.",
    },
    {
      title: "Ship consistent brand markup across the site",
      description:
        "Share a pre-filled link or a downloaded snippet so every template renders the same Organization object: one canonical description of your brand that search engines can trust.",
    },
    {
      title: "Safe for private contact data",
      description:
        "Because everything runs locally, you can build markup containing internal support numbers or unpublished legal names without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Enter your brand basics",
      description:
        "Add your organization's name, website URL, logo URL and a short description. Load the example first if you want a fully-populated starting point.",
    },
    {
      title: "Add your social profiles (sameAs)",
      description:
        "Paste the URLs of every official profile, X, LinkedIn, Facebook, Wikipedia and so on. Each becomes an entry in the sameAs array that confirms the account belongs to you.",
    },
    {
      title: "Declare your contact points",
      description:
        "Add one or more contactPoint entries. Pick a contact type like customer support or sales, then fill in the phone, email, languages and area served.",
    },
    {
      title: "Read the validity check & copy",
      description:
        "Watch the required/recommended report turn green, then copy the `<script type=\"application/ld+json\">` block or download the JSON.",
    },
    {
      title: "Paste it and test in Google",
      description:
        "Add the script to your homepage's HTML, then confirm it with Google's Rich Results Test or Schema Markup Validator before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Establish a clear brand entity",
      description:
        "Publish one authoritative Organization block on the homepage with logo, sameAs and description so search engines resolve your brand to a single, consistent entity.",
    },
    {
      audience: "Brand / marketing manager",
      title: "Claim the logo & social profiles",
      description:
        "Use sameAs to link every official account and a crawlable logo URL, giving Google the signals it needs to show your logo and connect your verified profiles.",
    },
    {
      audience: "Web developer",
      title: "Add reusable site-wide markup",
      description:
        "Generate a validated Organization snippet once and drop it into the base template so every page carries the same brand structured data.",
    },
    {
      audience: "Local / multi-location business",
      title: "Expose the right way to get in touch",
      description:
        "Declare separate customer-support, sales and technical contactPoint entries with their own languages and areas served so search engines surface the correct contact.",
    },
  ],

  troubleshooting: [
    {
      problem: "The validity check shows an error on the name field.",
      solution:
        "name is the only strictly required property for Organization, fill it in and the error clears. Everything else is recommended and improves how well search engines understand your brand.",
    },
    {
      problem: "My logo isn't appearing in Search.",
      solution:
        "Point logo at a directly crawlable image URL (not a page), ensure it's on your official domain, meets Google's logo size guidelines, and place the Organization block on your homepage. Then re-test in the Rich Results Test.",
    },
    {
      problem: "How many sameAs links or contact points should I add?",
      solution:
        "Add every profile you genuinely own to sameAs: there's no hard cap, but only include accounts you control. For contact points, add one per genuine channel (support, sales, technical) rather than duplicating the same number.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test, which layers its own eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Put your Organization markup on the homepage, that's the page Google most strongly associates with your brand entity.",
    "Use the exact same logo URL, name and sameAs links across every page so search engines never see a conflicting brand definition.",
    "Only list sameAs profiles you actually control. Linking accounts you don't own weakens rather than strengthens the entity signal.",
    "Use the correct @type where it applies. Corporation, NGO, EducationalOrganization and LocalBusiness are all Organization subtypes with the same base fields.",
    "For contact points, set contactType to a recognised value like 'customer support', 'sales' or 'technical support', and add availableLanguage for multilingual support.",
  ],

  security:
    "Your organization data is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. Contact numbers, emails, legal names, addresses and social links are never stored, logged or transmitted, so you can safely build markup containing private or internal information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is Organization schema and why does it matter?",
      answer:
        "Organization schema is structured data (JSON-LD) that describes your company using the schema.org vocabulary, its name, website, logo, social profiles and contact points. Search engines read it to understand your brand as a distinct entity, which underpins features like the Knowledge Panel, your logo appearing beside results, and clearer brand recognition across Search.",
    },
    {
      question: "Does Organization markup guarantee a Knowledge Panel?",
      answer:
        "No. Google decides when to show a Knowledge Panel based on many signals, brand prominence, authoritative references, consistency across the web and more. Valid Organization markup is one important, controllable input: it gives Google a clean, machine-readable definition of your brand. It helps, but it can't force a panel to appear.",
    },
    {
      question: "What is the sameAs property used for?",
      answer:
        "sameAs is an array of URLs to other authoritative pages about the same entity, your official X, LinkedIn, Facebook, Instagram, YouTube, Wikipedia or Crunchbase pages. It tells search engines 'these accounts are the same organization as this website,' which helps them confirm and connect your verified profiles. Only include accounts you genuinely control.",
    },
    {
      question: "What is a contactPoint and do I need one?",
      answer:
        "A contactPoint describes an official way to reach your organization, a phone number or email tied to a contactType such as 'customer support', 'sales' or 'technical support', optionally with the languages spoken and areas served. It's recommended, not required. Add one per genuine channel. You can declare several, each for a different purpose.",
    },
    {
      question: "Which @type should I choose, Organization or a subtype?",
      answer:
        "Organization is the safe default and works for almost every company. If a more specific subtype fits (Corporation, NGO, EducationalOrganization, GovernmentOrganization or LocalBusiness) you can use it. They inherit the same base fields. Use LocalBusiness (with address and hours) if you're a physical storefront. Use Organization for a brand or online company.",
    },
    {
      question: "Where should I place the generated script tag?",
      answer:
        "Put the `<script type=\"application/ld+json\">` block in the HTML of your homepage: that's the page most strongly tied to your brand. In `<head>` or `<body>` both work for Google. In a CMS, add it via a custom-HTML block, a theme template or an SEO plugin. Keep the same Organization object consistent across the site.",
    },
    {
      question: "How do I get my logo to show in Google Search?",
      answer:
        "Add a logo property to your Organization markup pointing to a directly crawlable image URL on your official domain, follow Google's logo image guidelines (a clear, appropriately sized image), and place the block on your homepage. Then verify it in the Rich Results Test. Google chooses whether and where to display it.",
    },
    {
      question: "Is my company data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your contact numbers, emails, legal names, address and social links never leave your device, there's nothing for us to upload, store or log. It's safe to build markup containing private or internal information.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, Organization JSON-LD generator with name, legal/alternate name, URL, logo, description, founding date, address, unlimited sameAs profiles and repeatable typed contact points, plus live validity check, copy-ready script tag, download, example preset, undo/redo and share links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added @type subtype selection (Corporation, NGO, EducationalOrganization, GovernmentOrganization, LocalBusiness) and a pretty/minified output toggle.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report with grouped required-vs-recommended checks and a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "local-business-schema-generator",
    "meta-tag-generator",
    "json-formatter",
    "url-encoder",
  ],
};

export default organizationSchemaGenerator;
