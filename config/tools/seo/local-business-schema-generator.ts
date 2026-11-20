import type { Tool } from "@/types";

/**
 * LocalBusiness Schema Generator: a dedicated, deep generator for the
 * schema.org LocalBusiness type and its most common subtypes (Restaurant,
 * Store, CafeOrCoffeeShop, Dentist, Attorney, and so on). It turns a store's
 * NAP data (name, address, phone) plus geo coordinates, a full weekly
 * opening-hours table, price range and social profiles into valid JSON-LD that
 * Google reads for local search, Maps and Business Profile enrichment. Every
 * property is graded against the LocalBusiness required/recommended set live,
 * and the ready-to-paste `<script type="application/ld+json">` block is one
 * click away. Everything runs on `lib/seo-tools/schema.ts` inside the browser -
 * no address, phone number or coordinate ever leaves the device. Copy is
 * written specifically for the "local business schema" / "LocalBusiness JSON-LD"
 * search intent and shares nothing with the general Schema Markup Generator.
 */
const localBusinessSchemaGenerator: Tool = {
  slug: "local-business-schema-generator",
  title: "LocalBusiness Schema Generator",
  description:
    "Build valid LocalBusiness JSON-LD structured data (address, geo coordinates, a full opening-hours table, price range and social profiles) with a live validity check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Store",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  h1: "LocalBusiness Schema Generator, JSON-LD Structured Data for Local SEO",
  tagline:
    "Enter your business name, address, phone, opening hours and geo coordinates once and get valid schema.org LocalBusiness JSON-LD instantly. Pick the exact subtype (Restaurant, Store, CafeOrCoffeeShop and more) see a live validity check, then copy the script tag to paste. All in your browser, nothing uploaded.",
  longDescription:
    "The GigAI LocalBusiness Schema Generator builds schema.org LocalBusiness structured data as JSON-LD: the format Google recommends for helping search engines understand a physical business's name, location, contact details and hours. Unlike a generic schema tool, this one is built end-to-end around local SEO: choose the precise @type for your business (LocalBusiness, Restaurant, Store, CafeOrCoffeeShop, BarOrPub, Bakery, Hotel, Dentist, MedicalClinic, Attorney, HairSalon, HealthClub, AutoRepair, ProfessionalService and more), fill a structured PostalAddress, drop in exact latitude/longitude for GeoCoordinates, and set a full seven-day opening-hours table that emits proper OpeningHoursSpecification nodes: including closed days and split shifts. Add a price range, star rating, and your Google Business Profile, Facebook and other social URLs via sameAs. As you type, the output pane regenerates clean, minifiable JSON-LD with empty fields stripped, and a live validity panel grades your markup against LocalBusiness's required and recommended properties so you know it's eligible before you publish. When you're done, copy the exact `<script type=\"application/ld+json\">` block or download the raw JSON, and share a link that reopens the tool pre-filled for a franchise or a colleague. Because generation and validation run entirely on your device using the browser's own JSON engine, your address, phone number, coordinates and internal hours never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate LocalBusiness schema",

  keywords: [
    "local business schema generator",
    "localbusiness json-ld",
    "local business structured data",
    "schema.org localbusiness",
    "opening hours schema",
    "geo coordinates schema",
    "restaurant schema generator",
    "store schema markup",
    "local seo schema",
    "google business profile schema",
    "postaladdress json-ld",
    "openinghoursspecification generator",
    "nap structured data",
  ],

  seo: {
    title:
      "LocalBusiness Schema Generator, Free LocalBusiness JSON-LD Tool | GigAI Tools",
    description:
      "Free LocalBusiness schema generator: build valid JSON-LD with address, geo coordinates, a full opening-hours table, price range and sameAs profiles. Supports Restaurant, Store, Cafe and more, with a live validity check, 100% in your browser.",
  },

  features: [
    {
      icon: "Store",
      title: "Every LocalBusiness subtype",
      description:
        "Pick the exact schema.org @type: LocalBusiness, Restaurant, Store, CafeOrCoffeeShop, Bakery, Hotel, Dentist, Attorney, HairSalon, AutoRepair and more, so search engines classify your business precisely.",
    },
    {
      icon: "Clock",
      title: "Full weekly opening-hours table",
      description:
        "Set hours for all seven days at once, mark days closed, and add split shifts. The tool emits correct OpeningHoursSpecification nodes with 24-hour opens/closes times.",
    },
    {
      icon: "MapPin",
      title: "Structured address & exact geo",
      description:
        "Fill a proper PostalAddress (street, city, region, postal code, country) and drop in latitude/longitude for GeoCoordinates so your pin is unambiguous on the map.",
    },
    {
      icon: "ShieldCheck",
      title: "Live local-SEO validity check",
      description:
        "Every field is graded against LocalBusiness's required and recommended properties, so you instantly see whether your markup is complete and what still strengthens it.",
    },
    {
      icon: "Link2",
      title: "sameAs profiles, price range & rating",
      description:
        "Link your Google Business Profile, Facebook, Instagram and site via sameAs, and add a $$$ price range and aggregate rating for richer local results.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Your address, phone number, coordinates and hours are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Help Google understand your storefront",
      description:
        "LocalBusiness JSON-LD gives search engines an unambiguous, machine-readable statement of your name, address, phone and hours, the foundation Google leans on for local search, Maps and knowledge-panel details.",
    },
    {
      title: "Ship consistent NAP across every location",
      description:
        "Share a pre-filled link or download a snippet so each branch emits the same name/address/phone shape and the same subtype: consistent structured data is exactly what local search rewards.",
    },
    {
      title: "Get the hard parts right the first time",
      description:
        "Opening-hours specifications and geo coordinates are where hand-written markup breaks. The tool formats them correctly, flags what's missing, and keeps the JSON valid so you don't debug braces in Search Console.",
    },
    {
      title: "Safe for private location data",
      description:
        "Because everything runs locally, you can build markup for an unlaunched location (with its real address, phone and coordinates) without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Choose your business type",
      description:
        "Select the schema.org @type that best matches your business, Restaurant, Store, CafeOrCoffeeShop, Dentist and so on. Use plain LocalBusiness if none fits exactly.",
    },
    {
      title: "Enter name, address and phone",
      description:
        "Fill your business name and the full postal address, then add a telephone number in international format. Load the example first if you want a realistic starting point.",
    },
    {
      title: "Set opening hours and geo",
      description:
        "Toggle each day open or closed and set its opens/closes times, then paste your exact latitude and longitude for a precise map pin.",
    },
    {
      title: "Read the validity check & copy",
      description:
        "Watch the validity panel: green means complete, warnings point to recommended fields. Then copy the `<script type=\"application/ld+json\">` block or download the JSON.",
    },
    {
      title: "Paste and test in Google",
      description:
        "Paste the markup into your homepage or contact page's HTML, then confirm it with Google's Rich Results Test and Schema Markup Validator before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "Local business owner",
      title: "Mark up a single storefront",
      description:
        "Add complete LocalBusiness markup (address, phone, hours, price range and geo) to your homepage so search engines and Maps have accurate, structured details about your shop.",
    },
    {
      audience: "Multi-location / franchise SEO",
      title: "Standardise markup across branches",
      description:
        "Generate one validated template, then reuse a shared link per location to emit consistent NAP and subtype markup for every branch page.",
    },
    {
      audience: "Restaurant / hospitality operator",
      title: "Publish accurate hours and cuisine",
      description:
        "Use the Restaurant or CafeOrCoffeeShop subtype with a full seven-day opening-hours table so diners and search engines see correct, machine-readable hours.",
    },
    {
      audience: "Local SEO agency",
      title: "Hand clients ready-to-paste snippets",
      description:
        "Build validated LocalBusiness JSON-LD for each client, download the script tag, and drop it into their CMS without touching visible page content.",
    },
  ],

  troubleshooting: [
    {
      problem: "The validity check warns that address or telephone is missing.",
      solution:
        "Those are recommended for LocalBusiness and heavily used for local search. Fill the postal address fields and a phone number in international format (e.g. +1-555-0100) and the warnings clear.",
    },
    {
      problem: "My opening hours don't appear in the output.",
      solution:
        "Only days you mark open with both an opens and a closes time produce an OpeningHoursSpecification node. Set 24-hour times like 09:00 and 17:00. Closed days are intentionally omitted.",
    },
    {
      problem: "My map pin is in the wrong place.",
      solution:
        "GeoCoordinates need exact decimal latitude and longitude (e.g. 39.7817 and -89.6501), not a street address. Both must be present, and remember west/south values are negative.",
    },
    {
      problem: "Google's test flags an issue this tool didn't.",
      solution:
        "This is a pragmatic required/recommended check, not a full schema.org shape validator. Always confirm with Google's Rich Results Test, which applies Google-specific eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Put your LocalBusiness markup on the page that best represents the location (usually the homepage or a dedicated contact/location page) not on every page of the site.",
    "Use the most specific subtype that fits (Restaurant, Dentist, HairSalon) rather than plain LocalBusiness. A precise @type helps search engines classify you correctly.",
    "Keep your NAP identical to your Google Business Profile and other citations, mismatched name, address or phone weakens local trust signals.",
    "Add your Google Business Profile and social URLs via sameAs so search engines can connect your structured data to your verified profiles.",
    "Set opening hours in 24-hour time and cover every open day, including split shifts, so hours render accurately.",
  ],

  security:
    "Your LocalBusiness structured data is generated and validated entirely in your browser using its native JSON engine: nothing is uploaded to any server. Your business name, street address, phone number, geo coordinates and opening hours are never stored, logged or transmitted, so you can safely build markup for private or unlaunched locations. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is LocalBusiness schema and why do I need it?",
      answer:
        "LocalBusiness schema is structured data (a machine-readable description of a physical business using the schema.org vocabulary) placed on your page as JSON-LD. It states your name, address, phone, hours, price range and location so search engines can understand and confidently present your business in local search results, Maps and knowledge panels. Complete, consistent markup strengthens the signals behind your local visibility.",
    },
    {
      question: "Does LocalBusiness schema improve my local rankings?",
      answer:
        "Schema doesn't directly rank you, but it helps search engines understand and trust your business's core details, which supports better local presentation and eligibility for enhanced features. Local ranking depends on many factors (your Google Business Profile, reviews, citations and relevance) and accurate LocalBusiness markup is a foundational, low-risk part of that picture.",
    },
    {
      question: "Which LocalBusiness subtype should I choose?",
      answer:
        "Pick the most specific schema.org subtype that describes your business, Restaurant, Store, CafeOrCoffeeShop, Bakery, Hotel, Dentist, Attorney, HairSalon, AutoRepair and so on. A precise @type helps search engines classify you correctly. If none fits well, use the generic LocalBusiness type, which every subtype inherits from.",
    },
    {
      question: "How do I add opening hours correctly?",
      answer:
        "Mark each day open or closed and set its opens and closes times in 24-hour format (for example 09:00 and 17:00). The tool emits a proper OpeningHoursSpecification for every open day, and you can add split shifts (e.g. a lunch and dinner service) by giving a day more than one time range. Closed days are simply left out.",
    },
    {
      question: "Do I need latitude and longitude?",
      answer:
        "Geo coordinates are recommended, not required. Adding exact decimal latitude and longitude produces a GeoCoordinates node that gives your location an unambiguous map pin, which is especially useful when a street address alone is easy to misplace. You can find your coordinates by right-clicking your location in Google Maps.",
    },
    {
      question: "Where should I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the page that best represents the location, typically the homepage or a contact/location page, either in the `<head>` or the `<body>`. In a CMS, add it via a custom-HTML block, theme template or SEO plugin. Put the markup on that specific page rather than site-wide.",
    },
    {
      question: "What is sameAs and should I fill it in?",
      answer:
        "sameAs is a list of URLs to your business's other authoritative profiles, your Google Business Profile, Facebook, Instagram, LinkedIn or Yelp page. Adding them helps search engines connect your structured data to your verified profiles, reinforcing that they all describe the same business. It's optional but recommended for local SEO.",
    },
    {
      question: "Is my address and phone number sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your business name, address, phone number, coordinates and hours never leave your device, there's nothing for us to upload, store or log. It's safe to build markup for a location that hasn't launched yet.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, dedicated LocalBusiness JSON-LD generator with subtype picker, structured PostalAddress, GeoCoordinates, a seven-day opening-hours table, price range, aggregate rating and sameAs, plus live validity check, copy-ready script tag, download, presets, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added split-shift support to the opening-hours table, a minified-output toggle and realistic per-subtype examples (Restaurant, Store, Cafe, Dentist).",
    },
    {
      date: "2026-07-01",
      change:
        "Refined the validity report to grade required vs. recommended local-SEO properties and linked directly to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "organization-schema-generator",
    "meta-tag-generator",
    "breadcrumb-schema-generator",
    "json-formatter",
  ],
};

export default localBusinessSchemaGenerator;
