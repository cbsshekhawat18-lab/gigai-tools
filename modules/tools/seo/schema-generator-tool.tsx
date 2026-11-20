"use client";

import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { Field, SelectField, StatBadge, type Example } from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SchemaForm,
  ScorePanel,
  ShareReport,
  UrlPrefillBar,
  CheckList,
  gradeForScore,
  type FieldSpec,
  type SchemaValues,
  type FieldValue,
  type CheckItem,
} from "@/components/tool/seo";
import {
  buildArticle,
  buildFaqPage,
  buildProduct,
  buildOrganization,
  buildLocalBusiness,
  buildEvent,
  buildBreadcrumbList,
  buildVideoObject,
  buildRecipe,
  buildPerson,
  buildReview,
  buildSoftwareApplication,
  validateJsonLd,
  type SchemaOutput,
} from "@/lib/seo-tools/schema";
import {
  type J,
  isObj, g, pick, nameOf, urlOf, imgOf, dateOnly, isoLocal, stripEnum, listOf,
  parseIsoDuration, offersOf, ratingOf, extractJsonLdNodes, metaContent, decodeEntities,
} from "@/lib/seo-tools/schema-seed";

/* -------------------------------------------------------------------------- */
/*  Type catalogue                                                            */
/* -------------------------------------------------------------------------- */

/** Every schema type the hub can build. */
type SchemaTypeKey =
  | "Article"
  | "FAQPage"
  | "Product"
  | "Organization"
  | "LocalBusiness"
  | "Event"
  | "BreadcrumbList"
  | "VideoObject"
  | "Recipe"
  | "Person"
  | "Review"
  | "SoftwareApplication";

/** Static metadata + form spec + builder for one schema type. */
interface SchemaTypeDef {
  key: SchemaTypeKey;
  label: string;
  icon: string;
  /** One-line description shown under the picker. */
  blurb: string;
  /** Slug of the dedicated per-type generator (for the cross-link), if any. */
  dedicated?: string;
  fields: ReadonlyArray<FieldSpec>;
  /** A realistic, valid example (loaded as a preset). */
  example: SchemaValues;
  /** Map the collected form values → a SchemaOutput via the engine. */
  build: (v: SchemaValues) => SchemaOutput;
}

/* -- small value readers (keep the builders terse + type-safe) ------------- */

function str(v: FieldValue | undefined): string {
  return typeof v === "string" ? v : "";
}
function opt(v: FieldValue | undefined): string | undefined {
  const s = str(v);
  return s ? s : undefined;
}
function num(v: FieldValue | undefined): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function list(v: FieldValue | undefined): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : [];
}
function optList(v: FieldValue | undefined): string[] | undefined {
  const l = list(v).filter(Boolean);
  return l.length ? l : undefined;
}
function rows(v: FieldValue | undefined): SchemaValues[] {
  return Array.isArray(v) && v.every((x) => x && typeof x === "object" && !Array.isArray(x))
    ? (v as SchemaValues[])
    : [];
}

const CURRENCY_OPTS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
  { value: "JPY", label: "JPY" },
];

const AVAILABILITY_OPTS = [
  { value: "InStock", label: "In stock" },
  { value: "OutOfStock", label: "Out of stock" },
  { value: "PreOrder", label: "Pre-order" },
  { value: "BackOrder", label: "Back-order" },
  { value: "Discontinued", label: "Discontinued" },
];

const ARTICLE_TYPE_OPTS = [
  { value: "Article", label: "Article" },
  { value: "BlogPosting", label: "BlogPosting" },
  { value: "NewsArticle", label: "NewsArticle" },
];

/* -------------------------------------------------------------------------- */
/*  The 12 type definitions                                                   */
/* -------------------------------------------------------------------------- */

const TYPES: SchemaTypeDef[] = [
  {
    key: "Article",
    label: "Article / Blog post",
    icon: "FileText",
    blurb: "Articles, blog posts and news, author, dates, image and publisher.",
    dedicated: "article-schema-generator",
    fields: [
      { name: "type", label: "Article type", type: "select", options: ARTICLE_TYPE_OPTS },
      { name: "headline", label: "Headline", type: "text", required: true, placeholder: "How structured data wins rich results" },
      { name: "url", label: "Page URL", type: "url", placeholder: "https://example.com/blog/structured-data" },
      { name: "description", label: "Description", type: "textarea", rows: 2, placeholder: "A short summary of the article." },
      { name: "image", label: "Image URL", type: "url", placeholder: "https://example.com/hero.jpg" },
      { name: "authorName", label: "Author name", type: "text", placeholder: "Ada Lovelace" },
      { name: "authorUrl", label: "Author URL", type: "url", placeholder: "https://example.com/authors/ada" },
      { name: "publisherName", label: "Publisher name", type: "text", placeholder: "Example Media" },
      { name: "publisherLogo", label: "Publisher logo URL", type: "url", placeholder: "https://example.com/logo.png" },
      { name: "datePublished", label: "Date published", type: "date" },
      { name: "dateModified", label: "Date modified", type: "date" },
    ],
    example: {
      type: "BlogPosting",
      headline: "The Complete Guide to Schema Markup in 2026",
      url: "https://example.com/blog/schema-markup-guide",
      description: "Everything you need to add valid JSON-LD structured data and win rich results in Google Search.",
      image: "https://example.com/images/schema-guide.jpg",
      authorName: "Jordan Rivera",
      authorUrl: "https://example.com/authors/jordan-rivera",
      publisherName: "Example Media",
      publisherLogo: "https://example.com/logo.png",
      datePublished: "2026-06-01",
      dateModified: "2026-06-18",
    },
    build: (v) =>
      buildArticle({
        type: (str(v.type) || "Article") as "Article" | "BlogPosting" | "NewsArticle",
        headline: str(v.headline),
        url: opt(v.url),
        description: opt(v.description),
        image: opt(v.image),
        authorName: opt(v.authorName),
        authorUrl: opt(v.authorUrl),
        publisherName: opt(v.publisherName),
        publisherLogo: opt(v.publisherLogo),
        datePublished: opt(v.datePublished),
        dateModified: opt(v.dateModified),
      }),
  },
  {
    key: "FAQPage",
    label: "FAQ page",
    icon: "MessageCircleQuestion",
    blurb: "A list of question/answer pairs for the FAQ rich result.",
    dedicated: "faq-schema-generator",
    fields: [
      {
        name: "items",
        label: "Questions",
        type: "group",
        repeatable: true,
        addLabel: "Add question",
        fields: [
          { name: "question", label: "Question", type: "text", required: true, placeholder: "Is the tool free?" },
          { name: "answer", label: "Answer", type: "textarea", rows: 2, required: true, placeholder: "Yes. Every tool is 100% free and runs in your browser." },
        ],
      },
    ],
    example: {
      items: [
        { question: "Is the schema generator free?", answer: "Yes. Every tool is completely free and runs entirely in your browser." },
        { question: "Do I need to install anything?", answer: "No installation is required. It works in any modern browser with no account." },
        { question: "Is my data uploaded?", answer: "Never. All processing happens locally on your device, so nothing leaves your machine." },
      ],
    },
    build: (v) =>
      buildFaqPage(
        rows(v.items)
          .map((it) => ({ question: str(it.question), answer: str(it.answer) }))
          .filter((it) => it.question || it.answer),
      ),
  },
  {
    key: "Product",
    label: "Product",
    icon: "Package",
    blurb: "Products with price, availability, brand and aggregate rating.",
    dedicated: "product-schema-generator",
    fields: [
      { name: "name", label: "Product name", type: "text", required: true, placeholder: "Aurora Wireless Headphones" },
      { name: "description", label: "Description", type: "textarea", rows: 2 },
      { name: "image", label: "Image URL", type: "url", placeholder: "https://example.com/product.jpg" },
      { name: "brand", label: "Brand", type: "text", placeholder: "Aurora" },
      { name: "sku", label: "SKU", type: "text" },
      { name: "gtin", label: "GTIN", type: "text" },
      { name: "price", label: "Price", type: "text", placeholder: "129.00" },
      { name: "priceCurrency", label: "Currency", type: "select", options: CURRENCY_OPTS },
      { name: "availability", label: "Availability", type: "select", options: AVAILABILITY_OPTS },
      { name: "priceValidUntil", label: "Price valid until", type: "date" },
      { name: "ratingValue", label: "Rating value", type: "text", placeholder: "4.6" },
      { name: "reviewCount", label: "Review count", type: "text", placeholder: "215" },
    ],
    example: {
      name: "Aurora Wireless Headphones",
      description: "Over-ear ANC headphones with 40-hour battery life and studio-grade drivers.",
      image: "https://example.com/images/aurora-headphones.jpg",
      brand: "Aurora",
      sku: "AUR-HP-200",
      gtin: "0123456789012",
      price: "129.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2026-12-31",
      ratingValue: "4.6",
      reviewCount: "215",
    },
    build: (v) =>
      buildProduct({
        name: str(v.name),
        description: opt(v.description),
        image: opt(v.image),
        brand: opt(v.brand),
        sku: opt(v.sku),
        gtin: opt(v.gtin),
        offers:
          opt(v.price) || opt(v.priceCurrency) || opt(v.availability)
            ? {
                price: opt(v.price),
                priceCurrency: opt(v.priceCurrency),
                availability: opt(v.availability),
                priceValidUntil: opt(v.priceValidUntil),
              }
            : undefined,
        aggregateRating: opt(v.ratingValue)
          ? { ratingValue: str(v.ratingValue), reviewCount: opt(v.reviewCount) }
          : undefined,
      }),
  },
  {
    key: "Organization",
    label: "Organization",
    icon: "Building2",
    blurb: "A company or brand, logo, contact and social profiles (sameAs).",
    dedicated: "organization-schema-generator",
    fields: [
      { name: "name", label: "Organization name", type: "text", required: true, placeholder: "Example Inc." },
      { name: "url", label: "Website URL", type: "url", placeholder: "https://example.com" },
      { name: "logo", label: "Logo URL", type: "url", placeholder: "https://example.com/logo.png" },
      { name: "description", label: "Description", type: "textarea", rows: 2 },
      { name: "email", label: "Email", type: "email", placeholder: "hello@example.com" },
      { name: "telephone", label: "Telephone", type: "text", placeholder: "+1-555-0100" },
      { name: "foundingDate", label: "Founding date", type: "date" },
      { name: "sameAs", label: "Social / profile URLs (sameAs)", type: "list", itemLabel: "URL", itemPlaceholder: "https://twitter.com/example" },
    ],
    example: {
      name: "Example Inc.",
      url: "https://example.com",
      logo: "https://example.com/logo.png",
      description: "We build privacy-first developer and SEO tools that run entirely in your browser.",
      email: "hello@example.com",
      telephone: "+1-555-0100",
      foundingDate: "2019-04-01",
      sameAs: ["https://twitter.com/example", "https://www.linkedin.com/company/example", "https://github.com/example"],
    },
    build: (v) =>
      buildOrganization({
        name: str(v.name),
        url: opt(v.url),
        logo: opt(v.logo),
        description: opt(v.description),
        email: opt(v.email),
        telephone: opt(v.telephone),
        foundingDate: opt(v.foundingDate),
        sameAs: optList(v.sameAs),
      }),
  },
  {
    key: "LocalBusiness",
    label: "Local business",
    icon: "Store",
    blurb: "A physical business, address, hours, geo and price range.",
    dedicated: "local-business-schema-generator",
    fields: [
      { name: "name", label: "Business name", type: "text", required: true, placeholder: "The Corner Cafe" },
      { name: "type", label: "Business type", type: "text", placeholder: "Restaurant, Store, CafeOrCoffeeShop…" },
      { name: "url", label: "Website URL", type: "url" },
      { name: "image", label: "Image URL", type: "url" },
      { name: "telephone", label: "Telephone", type: "text", placeholder: "+1-555-0100" },
      { name: "priceRange", label: "Price range", type: "text", placeholder: "$$" },
      { name: "streetAddress", label: "Street address", type: "text", placeholder: "123 Main St" },
      { name: "addressLocality", label: "City", type: "text", placeholder: "Springfield" },
      { name: "addressRegion", label: "Region / state", type: "text", placeholder: "IL" },
      { name: "postalCode", label: "Postal code", type: "text", placeholder: "62704" },
      { name: "addressCountry", label: "Country", type: "text", placeholder: "US" },
      { name: "latitude", label: "Latitude", type: "text", placeholder: "39.7817" },
      { name: "longitude", label: "Longitude", type: "text", placeholder: "-89.6501" },
    ],
    example: {
      name: "The Corner Cafe",
      type: "CafeOrCoffeeShop",
      url: "https://cornercafe.example.com",
      image: "https://cornercafe.example.com/storefront.jpg",
      telephone: "+1-555-0100",
      priceRange: "$$",
      streetAddress: "123 Main St",
      addressLocality: "Springfield",
      addressRegion: "IL",
      postalCode: "62704",
      addressCountry: "US",
      latitude: "39.7817",
      longitude: "-89.6501",
    },
    build: (v) => {
      const lat = opt(v.latitude);
      const lng = opt(v.longitude);
      return buildLocalBusiness({
        name: str(v.name),
        type: opt(v.type),
        url: opt(v.url),
        image: opt(v.image),
        telephone: opt(v.telephone),
        priceRange: opt(v.priceRange),
        address: {
          streetAddress: opt(v.streetAddress),
          addressLocality: opt(v.addressLocality),
          addressRegion: opt(v.addressRegion),
          postalCode: opt(v.postalCode),
          addressCountry: opt(v.addressCountry),
        },
        geo: lat && lng ? { latitude: lat, longitude: lng } : undefined,
      });
    },
  },
  {
    key: "Event",
    label: "Event",
    icon: "CalendarDays",
    blurb: "An event: dates, venue, organizer, performer and tickets.",
    dedicated: "event-schema-generator",
    fields: [
      { name: "name", label: "Event name", type: "text", required: true, placeholder: "GigAI SEO Summit 2026" },
      { name: "description", label: "Description", type: "textarea", rows: 2 },
      { name: "startDate", label: "Start", type: "datetime", required: true },
      { name: "endDate", label: "End", type: "datetime" },
      { name: "locationName", label: "Venue name", type: "text", placeholder: "Metro Convention Center" },
      { name: "address", label: "Venue address", type: "text", placeholder: "500 Congress Ave, Austin, TX" },
      { name: "url", label: "Event URL", type: "url" },
      { name: "image", label: "Image URL", type: "url" },
      { name: "performer", label: "Performer", type: "text" },
      { name: "organizer", label: "Organizer", type: "text" },
      { name: "price", label: "Ticket price", type: "text", placeholder: "0" },
      { name: "priceCurrency", label: "Currency", type: "select", options: CURRENCY_OPTS },
    ],
    example: {
      name: "GigAI SEO Summit 2026",
      description: "A one-day summit on structured data, Core Web Vitals and modern search.",
      startDate: "2026-09-15T09:00",
      endDate: "2026-09-15T17:00",
      locationName: "Metro Convention Center",
      address: "500 Congress Ave, Austin, TX 78701",
      url: "https://example.com/events/seo-summit-2026",
      image: "https://example.com/events/summit.jpg",
      performer: "Jordan Rivera",
      organizer: "Example Inc.",
      price: "199",
      priceCurrency: "USD",
    },
    build: (v) =>
      buildEvent({
        name: str(v.name),
        description: opt(v.description),
        startDate: opt(v.startDate),
        endDate: opt(v.endDate),
        locationName: opt(v.locationName),
        address: opt(v.address),
        url: opt(v.url),
        image: opt(v.image),
        performer: opt(v.performer),
        organizer: opt(v.organizer),
        offers:
          opt(v.price) || opt(v.priceCurrency)
            ? { price: opt(v.price), priceCurrency: opt(v.priceCurrency), url: opt(v.url) }
            : undefined,
      }),
  },
  {
    key: "BreadcrumbList",
    label: "Breadcrumb",
    icon: "ChevronRight",
    blurb: "The breadcrumb trail shown under a page's title in Search.",
    dedicated: "breadcrumb-schema-generator",
    fields: [
      {
        name: "items",
        label: "Breadcrumb items",
        type: "group",
        repeatable: true,
        addLabel: "Add crumb",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, placeholder: "Blog" },
          { name: "url", label: "URL", type: "url", required: true, placeholder: "https://example.com/blog" },
        ],
      },
    ],
    example: {
      items: [
        { name: "Home", url: "https://example.com" },
        { name: "Blog", url: "https://example.com/blog" },
        { name: "Schema Markup Guide", url: "https://example.com/blog/schema-markup-guide" },
      ],
    },
    build: (v) =>
      buildBreadcrumbList(
        rows(v.items)
          .map((it) => ({ name: str(it.name), url: str(it.url) }))
          .filter((it) => it.name || it.url),
      ),
  },
  {
    key: "VideoObject",
    label: "Video",
    icon: "Video",
    blurb: "A video: thumbnail, upload date, duration and embed URL.",
    dedicated: "video-schema-generator",
    fields: [
      { name: "name", label: "Video title", type: "text", required: true, placeholder: "How to add schema markup" },
      { name: "description", label: "Description", type: "textarea", rows: 2 },
      { name: "thumbnailUrl", label: "Thumbnail URL", type: "url", required: true, placeholder: "https://example.com/thumb.jpg" },
      { name: "uploadDate", label: "Upload date", type: "date" },
      { name: "contentUrl", label: "Content URL", type: "url", placeholder: "https://example.com/video.mp4" },
      { name: "embedUrl", label: "Embed URL", type: "url", placeholder: "https://www.youtube.com/embed/abc123" },
      { name: "durationSeconds", label: "Duration (seconds)", type: "number", min: 0, step: 1 },
    ],
    example: {
      name: "How to Add Schema Markup in 5 Minutes",
      description: "A quick walkthrough of generating and pasting JSON-LD structured data.",
      thumbnailUrl: "https://example.com/videos/schema-thumb.jpg",
      uploadDate: "2026-06-10",
      contentUrl: "https://example.com/videos/schema.mp4",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      durationSeconds: 372,
    },
    build: (v) =>
      buildVideoObject({
        name: str(v.name),
        description: opt(v.description),
        thumbnailUrl: opt(v.thumbnailUrl),
        uploadDate: opt(v.uploadDate),
        contentUrl: opt(v.contentUrl),
        embedUrl: opt(v.embedUrl),
        durationSeconds: num(v.durationSeconds),
      }),
  },
  {
    key: "Recipe",
    label: "Recipe",
    icon: "ChefHat",
    blurb: "A recipe: ingredients, steps, times, yield and rating.",
    dedicated: "recipe-schema-generator",
    fields: [
      { name: "name", label: "Recipe name", type: "text", required: true, placeholder: "Classic Margherita Pizza" },
      { name: "description", label: "Description", type: "textarea", rows: 2 },
      { name: "image", label: "Image URL", type: "url" },
      { name: "authorName", label: "Author", type: "text" },
      { name: "prepTime", label: "Prep time (ISO 8601)", type: "text", placeholder: "PT20M" },
      { name: "cookTime", label: "Cook time (ISO 8601)", type: "text", placeholder: "PT15M" },
      { name: "recipeYield", label: "Yield", type: "text", placeholder: "2 pizzas" },
      { name: "recipeCuisine", label: "Cuisine", type: "text", placeholder: "Italian" },
      { name: "ingredients", label: "Ingredients", type: "list", itemLabel: "ingredient", itemPlaceholder: "200g flour" },
      { name: "instructions", label: "Steps", type: "list", itemLabel: "step", itemPlaceholder: "Preheat the oven to 250°C." },
    ],
    example: {
      name: "Classic Margherita Pizza",
      description: "A blistered Neapolitan-style pizza with San Marzano tomatoes and fresh mozzarella.",
      image: "https://example.com/recipes/margherita.jpg",
      authorName: "Sofia Bianchi",
      prepTime: "PT20M",
      cookTime: "PT15M",
      recipeYield: "2 pizzas",
      recipeCuisine: "Italian",
      ingredients: ["250g 00 flour", "160ml water", "5g salt", "3g fresh yeast", "San Marzano tomatoes", "Fresh mozzarella", "Basil"],
      instructions: ["Make the dough and rest for 8 hours.", "Stretch each ball by hand.", "Top with sauce and mozzarella.", "Bake at 250°C for 12–15 minutes."],
    },
    build: (v) =>
      buildRecipe({
        name: str(v.name),
        description: opt(v.description),
        image: opt(v.image),
        authorName: opt(v.authorName),
        prepTime: opt(v.prepTime),
        cookTime: opt(v.cookTime),
        recipeYield: opt(v.recipeYield),
        recipeCuisine: opt(v.recipeCuisine),
        ingredients: optList(v.ingredients),
        instructions: optList(v.instructions),
      }),
  },
  {
    key: "Person",
    label: "Person",
    icon: "User",
    blurb: "An individual, job title, employer and profiles (sameAs).",
    dedicated: "person-schema-generator",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, placeholder: "Ada Lovelace" },
      { name: "url", label: "URL", type: "url" },
      { name: "image", label: "Image URL", type: "url" },
      { name: "jobTitle", label: "Job title", type: "text", placeholder: "Mathematician" },
      { name: "worksFor", label: "Works for", type: "text", placeholder: "Analytical Engine Co." },
      { name: "email", label: "Email", type: "email" },
      { name: "description", label: "Bio", type: "textarea", rows: 2 },
      { name: "sameAs", label: "Profile URLs (sameAs)", type: "list", itemLabel: "URL", itemPlaceholder: "https://twitter.com/ada" },
    ],
    example: {
      name: "Ada Lovelace",
      url: "https://example.com/ada",
      image: "https://example.com/ada.jpg",
      jobTitle: "Mathematician & Writer",
      worksFor: "Analytical Engine Co.",
      email: "ada@example.com",
      description: "Pioneer of computing and the first algorithm designed for a machine.",
      sameAs: ["https://en.wikipedia.org/wiki/Ada_Lovelace"],
    },
    build: (v) =>
      buildPerson({
        name: str(v.name),
        url: opt(v.url),
        image: opt(v.image),
        jobTitle: opt(v.jobTitle),
        worksFor: opt(v.worksFor),
        email: opt(v.email),
        description: opt(v.description),
        sameAs: optList(v.sameAs),
      }),
  },
  {
    key: "Review",
    label: "Review",
    icon: "Star",
    blurb: "A single review of an item, with author and star rating.",
    dedicated: "review-schema-generator",
    fields: [
      { name: "itemName", label: "Item reviewed", type: "text", required: true, placeholder: "Aurora Wireless Headphones" },
      { name: "author", label: "Reviewer name", type: "text", placeholder: "Sam Patel" },
      { name: "reviewBody", label: "Review", type: "textarea", rows: 3 },
      { name: "ratingValue", label: "Rating", type: "text", placeholder: "5" },
      { name: "bestRating", label: "Best rating", type: "text", placeholder: "5" },
      { name: "datePublished", label: "Date", type: "date" },
    ],
    example: {
      itemName: "Aurora Wireless Headphones",
      author: "Sam Patel",
      reviewBody: "Superb noise cancellation and the battery genuinely lasts all week. Best value at this price.",
      ratingValue: "5",
      bestRating: "5",
      datePublished: "2026-05-20",
    },
    build: (v) =>
      buildReview({
        itemName: opt(v.itemName),
        author: opt(v.author),
        reviewBody: opt(v.reviewBody),
        ratingValue: opt(v.ratingValue),
        bestRating: opt(v.bestRating),
        datePublished: opt(v.datePublished),
      }),
  },
  {
    key: "SoftwareApplication",
    label: "Software app",
    icon: "AppWindow",
    blurb: "An app or SaaS: category, OS, price and rating.",
    dedicated: "software-schema-generator",
    fields: [
      { name: "name", label: "App name", type: "text", required: true, placeholder: "GigAI Tools" },
      { name: "description", label: "Description", type: "textarea", rows: 2 },
      { name: "applicationCategory", label: "Category", type: "text", placeholder: "DeveloperApplication" },
      { name: "operatingSystem", label: "Operating system", type: "text", placeholder: "Web, iOS, Android" },
      { name: "url", label: "URL", type: "url" },
      { name: "image", label: "Icon / image URL", type: "url" },
      { name: "price", label: "Price", type: "text", placeholder: "0" },
      { name: "priceCurrency", label: "Currency", type: "select", options: CURRENCY_OPTS },
      { name: "ratingValue", label: "Rating value", type: "text", placeholder: "4.8" },
      { name: "reviewCount", label: "Review count", type: "text", placeholder: "1200" },
    ],
    example: {
      name: "GigAI Tools",
      description: "A free, privacy-first toolkit of website and SEO tools that run entirely in your browser.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: "https://gigai.tools",
      image: "https://gigai.tools/icon.png",
      price: "0",
      priceCurrency: "USD",
      ratingValue: "4.8",
      reviewCount: "1200",
    },
    build: (v) =>
      buildSoftwareApplication({
        name: str(v.name),
        description: opt(v.description),
        applicationCategory: opt(v.applicationCategory),
        operatingSystem: opt(v.operatingSystem),
        url: opt(v.url),
        image: opt(v.image),
        offers:
          opt(v.price) || opt(v.priceCurrency)
            ? { price: opt(v.price), priceCurrency: opt(v.priceCurrency) }
            : undefined,
        aggregateRating: opt(v.ratingValue)
          ? { ratingValue: str(v.ratingValue), reviewCount: opt(v.reviewCount) }
          : undefined,
      }),
  },
];

const TYPE_BY_KEY: Record<SchemaTypeKey, SchemaTypeDef> = Object.fromEntries(
  TYPES.map((t) => [t.key, t]),
) as Record<SchemaTypeKey, SchemaTypeDef>;

const TYPE_OPTIONS = TYPES.map((t) => ({ value: t.key, label: t.label }));

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/** Full generator state: the active type + one values bag per type. */
interface SchemaState {
  type: SchemaTypeKey;
  /** Per-type form values, so switching types doesn't lose your input. */
  values: Partial<Record<SchemaTypeKey, SchemaValues>>;
}

/** An empty values bag seeded with the type's empty field defaults. */
function emptyValuesFor(def: SchemaTypeDef): SchemaValues {
  const out: SchemaValues = {};
  for (const f of def.fields) {
    switch (f.type) {
      case "list":
        out[f.name] = [];
        break;
      case "group":
        out[f.name] = f.repeatable ? [] : {};
        break;
      case "select":
        out[f.name] = f.options[0]?.value ?? "";
        break;
      case "number":
        out[f.name] = f.min ?? 0;
        break;
      default:
        out[f.name] = "";
    }
  }
  return out;
}

const FIRST = TYPES[0]!;

const INITIAL_STATE: SchemaState = {
  type: FIRST.key,
  values: {},
};

/** Read the current values bag for a type, falling back to empties. */
function valuesFor(state: SchemaState, def: SchemaTypeDef): SchemaValues {
  return state.values[def.key] ?? emptyValuesFor(def);
}

/* -------------------------------------------------------------------------- */
/*  URL → schema seed  (fetch a page, read its existing JSON-LD / meta)        */
/* -------------------------------------------------------------------------- */
/*
 * When the user fetches a URL we parse the page's existing structured data and
 * meta and pre-fill the matching form, turning the generator into an inspector
 * you can edit. A tiny, dependency-free reader keeps this off the critical path
 * (no heavy engine imports pulled into the schema page bundle).
 */

/* Shared JSON-LD/meta readers live in lib/seo-tools/schema-seed (imported above),
 * so the per-type generators and the OG/Twitter/meta generators reuse the same
 * parsing. Only the hub-specific type mapping stays here. */

/** schema.org @type → the hub type it maps to (incl. common subtypes). */
const TYPE_ALIASES: Record<string, SchemaTypeKey> = {
  Article: "Article", BlogPosting: "Article", NewsArticle: "Article", Report: "Article", TechArticle: "Article",
  FAQPage: "FAQPage",
  Product: "Product",
  Organization: "Organization", Corporation: "Organization", NGO: "Organization", EducationalOrganization: "Organization", GovernmentOrganization: "Organization", OnlineStore: "Organization",
  LocalBusiness: "LocalBusiness", Restaurant: "LocalBusiness", Store: "LocalBusiness", CafeOrCoffeeShop: "LocalBusiness", Hotel: "LocalBusiness", ProfessionalService: "LocalBusiness", FoodEstablishment: "LocalBusiness", MedicalBusiness: "LocalBusiness",
  Event: "Event", BusinessEvent: "Event", MusicEvent: "Event", Festival: "Event", EducationEvent: "Event",
  BreadcrumbList: "BreadcrumbList",
  VideoObject: "VideoObject",
  Recipe: "Recipe",
  Person: "Person",
  Review: "Review",
  SoftwareApplication: "SoftwareApplication", WebApplication: "SoftwareApplication", MobileApplication: "SoftwareApplication",
};

function matchType(t: unknown): SchemaTypeKey | null {
  for (const x of Array.isArray(t) ? t : [t]) {
    if (typeof x === "string" && TYPE_ALIASES[x]) return TYPE_ALIASES[x];
  }
  return null;
}

/** When several types are present, prefer the page's primary content type. */
const TYPE_PRIORITY: SchemaTypeKey[] = [
  "Product", "Recipe", "Event", "Article", "FAQPage", "VideoObject",
  "SoftwareApplication", "Review", "Person", "LocalBusiness", "Organization", "BreadcrumbList",
];

/** Reverse of the builders: a schema.org node → this hub's form values. */
function mapNodeToValues(key: SchemaTypeKey, node: J): SchemaValues {
  const base = emptyValuesFor(TYPE_BY_KEY[key]);
  switch (key) {
    case "Article": {
      const t = g(node["@type"]);
      return { ...base,
        type: (["Article", "BlogPosting", "NewsArticle"].includes(t) ? t : "Article"),
        headline: pick(node, "headline", "name"),
        url: urlOf(node.url) || g(node["@id"]),
        description: pick(node, "description"),
        image: imgOf(node.image),
        authorName: nameOf(node.author),
        authorUrl: urlOf(node.author),
        publisherName: nameOf(node.publisher),
        publisherLogo: isObj(node.publisher) ? imgOf(node.publisher.logo) : "",
        datePublished: dateOnly(node.datePublished),
        dateModified: dateOnly(node.dateModified),
      };
    }
    case "FAQPage": {
      const items = (Array.isArray(node.mainEntity) ? node.mainEntity : [])
        .map((q) => (isObj(q) ? { question: pick(q, "name", "question"), answer: isObj(q.acceptedAnswer) ? g(q.acceptedAnswer.text) : g(q.acceptedAnswer) } : { question: "", answer: "" }))
        .filter((x) => x.question || x.answer);
      return { ...base, items };
    }
    case "Product": {
      const off = offersOf(node); const rt = ratingOf(node);
      return { ...base,
        name: pick(node, "name"),
        description: pick(node, "description"),
        image: imgOf(node.image),
        brand: nameOf(node.brand),
        sku: pick(node, "sku"),
        gtin: pick(node, "gtin", "gtin13", "gtin12", "gtin8"),
        price: off ? g(off.price) : "",
        priceCurrency: off ? g(off.priceCurrency) : "",
        availability: off ? stripEnum(off.availability) : "",
        priceValidUntil: off ? dateOnly(off.priceValidUntil) : "",
        ratingValue: rt ? g(rt.ratingValue) : "",
        reviewCount: rt ? g(rt.reviewCount) || g(rt.ratingCount) : "",
      };
    }
    case "Organization":
      return { ...base,
        name: pick(node, "name"),
        url: urlOf(node.url) || g(node["@id"]),
        logo: imgOf(node.logo),
        description: pick(node, "description"),
        email: pick(node, "email").replace(/^mailto:/i, ""),
        telephone: pick(node, "telephone"),
        foundingDate: dateOnly(node.foundingDate),
        sameAs: listOf(node.sameAs),
      };
    case "LocalBusiness": {
      const addr: J = isObj(node.address) ? node.address : {};
      const geo: J = isObj(node.geo) ? node.geo : {};
      const t = g(node["@type"]);
      return { ...base,
        name: pick(node, "name"),
        type: t && t !== "LocalBusiness" ? t : "",
        url: urlOf(node.url) || g(node["@id"]),
        image: imgOf(node.image),
        telephone: pick(node, "telephone"),
        priceRange: pick(node, "priceRange"),
        streetAddress: g(addr.streetAddress),
        addressLocality: g(addr.addressLocality),
        addressRegion: g(addr.addressRegion),
        postalCode: g(addr.postalCode),
        addressCountry: nameOf(addr.addressCountry),
        latitude: g(geo.latitude),
        longitude: g(geo.longitude),
      };
    }
    case "Event": {
      const loc: J = isObj(node.location) ? node.location : {};
      const addr = loc.address;
      const address = typeof addr === "string" ? addr : isObj(addr) ? [g(addr.streetAddress), g(addr.addressLocality), g(addr.addressRegion), g(addr.postalCode)].filter(Boolean).join(", ") : "";
      const off = offersOf(node);
      return { ...base,
        name: pick(node, "name"),
        description: pick(node, "description"),
        startDate: isoLocal(node.startDate),
        endDate: isoLocal(node.endDate),
        locationName: g(loc.name),
        address,
        url: urlOf(node.url),
        image: imgOf(node.image),
        performer: nameOf(node.performer),
        organizer: nameOf(node.organizer),
        price: off ? g(off.price) : "",
        priceCurrency: off ? g(off.priceCurrency) : "",
      };
    }
    case "BreadcrumbList": {
      const els = Array.isArray(node.itemListElement) ? node.itemListElement : [];
      const items = els
        .map((el) => {
          if (!isObj(el)) return { name: "", url: "" };
          const item = el.item;
          return { name: pick(el, "name") || (isObj(item) ? g(item.name) : ""), url: typeof item === "string" ? item : isObj(item) ? g(item["@id"]) || g(item.url) : g(el.url) };
        })
        .filter((x) => x.name || x.url);
      return { ...base, items };
    }
    case "VideoObject":
      return { ...base,
        name: pick(node, "name"),
        description: pick(node, "description"),
        thumbnailUrl: imgOf(node.thumbnailUrl),
        uploadDate: dateOnly(node.uploadDate),
        contentUrl: urlOf(node.contentUrl),
        embedUrl: urlOf(node.embedUrl),
        durationSeconds: parseIsoDuration(node.duration),
      };
    case "Recipe": {
      const instr = node.recipeInstructions;
      const instructions = Array.isArray(instr)
        ? instr.map((x) => (typeof x === "string" ? x : isObj(x) ? g(x.text) || g(x.name) : "")).filter(Boolean)
        : listOf(instr);
      return { ...base,
        name: pick(node, "name"),
        description: pick(node, "description"),
        image: imgOf(node.image),
        authorName: nameOf(node.author),
        prepTime: pick(node, "prepTime"),
        cookTime: pick(node, "cookTime"),
        recipeYield: pick(node, "recipeYield"),
        recipeCuisine: pick(node, "recipeCuisine"),
        ingredients: listOf(node.recipeIngredient),
        instructions,
      };
    }
    case "Person":
      return { ...base,
        name: pick(node, "name"),
        url: urlOf(node.url) || g(node["@id"]),
        image: imgOf(node.image),
        jobTitle: pick(node, "jobTitle"),
        worksFor: nameOf(node.worksFor),
        email: pick(node, "email").replace(/^mailto:/i, ""),
        description: pick(node, "description"),
        sameAs: listOf(node.sameAs),
      };
    case "Review": {
      const item = node.itemReviewed; const rr = node.reviewRating;
      return { ...base,
        itemName: isObj(item) ? g(item.name) : g(item),
        author: nameOf(node.author),
        reviewBody: pick(node, "reviewBody", "description"),
        ratingValue: isObj(rr) ? g(rr.ratingValue) : "",
        bestRating: isObj(rr) ? g(rr.bestRating) : "",
        datePublished: dateOnly(node.datePublished),
      };
    }
    case "SoftwareApplication": {
      const off = offersOf(node); const rt = ratingOf(node);
      return { ...base,
        name: pick(node, "name"),
        description: pick(node, "description"),
        applicationCategory: pick(node, "applicationCategory"),
        operatingSystem: pick(node, "operatingSystem"),
        url: urlOf(node.url) || g(node["@id"]),
        image: imgOf(node.image),
        price: off ? g(off.price) : "",
        priceCurrency: off ? g(off.priceCurrency) : "",
        ratingValue: rt ? g(rt.ratingValue) : "",
        reviewCount: rt ? g(rt.reviewCount) || g(rt.ratingCount) : "",
      };
    }
    default:
      return base;
  }
}

/** Fetch result → { type, values }. Prefers existing JSON-LD, else page meta. */
function seedFromHtml(html: string, pageUrl: string): { type: SchemaTypeKey; values: SchemaValues } | null {
  const matches = extractJsonLdNodes(html)
    .map((node) => ({ key: matchType(node["@type"]), node }))
    .filter((m): m is { key: SchemaTypeKey; node: J } => m.key !== null)
    .sort((a, b) => TYPE_PRIORITY.indexOf(a.key) - TYPE_PRIORITY.indexOf(b.key));
  if (matches[0]) return { type: matches[0].key, values: mapNodeToValues(matches[0].key, matches[0].node) };

  // No usable JSON-LD: seed an Article from the page's meta/OG tags.
  const titleTag = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const headline = metaContent(html, "og:title", "property") || (titleTag ? decodeEntities(titleTag[1]!.trim()) : "");
  const description = metaContent(html, "og:description", "property") || metaContent(html, "description", "name");
  const image = metaContent(html, "og:image", "property");
  const canonical = /<link[^>]*\brel=["']canonical["'][^>]*>/i.exec(html)?.[0];
  const url = (canonical && /\bhref=["']([^"']*)["']/i.exec(canonical)?.[1]) || pageUrl;
  if (headline || description || image) {
    return { type: "Article", values: { ...emptyValuesFor(TYPE_BY_KEY.Article), type: "Article", headline, description, image, url } };
  }
  return null;
}

function hostOf(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function SchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "indigo");
  const [state, setState] = React.useState<SchemaState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);
  // URL-first: the page we last read schema from (drives the shareable link).
  const [pageUrl, setPageUrl] = React.useState("");
  const [autoUrl, setAutoUrl] = React.useState<string | undefined>(undefined);

  const def = TYPE_BY_KEY[state.type];
  const values = valuesFor(state, def);

  /** Fetch a URL → detect its schema/meta → fill the matching form. */
  const applyFetched = React.useCallback((html: string, finalUrl: string) => {
    const seed = seedFromHtml(html, finalUrl);
    if (!seed) {
      toast.error("No structured data or usable metadata found on that page, fill the form manually below.");
      return;
    }
    setState({ type: seed.type, values: { [seed.type]: seed.values } });
    setPageUrl(finalUrl);
    toast.success(`Loaded ${TYPE_BY_KEY[seed.type].label} data from ${hostOf(finalUrl)}: review and edit below.`);
  }, []);

  // Deep-link: /schema-generator?url=… auto-fetches and pre-fills on open.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const param = new URLSearchParams(window.location.search).get("url");
    if (param && /^https?:\/\//i.test(param)) setAutoUrl(param);
  }, []);

  const shareLink =
    typeof window !== "undefined" && pageUrl
      ? `${window.location.origin}/schema-generator?url=${encodeURIComponent(pageUrl)}`
      : "";

  /** Build the JSON-LD + validation for the current type/values. */
  const output = React.useMemo<SchemaOutput>(() => def.build(values), [def, values]);
  const validation = React.useMemo(
    () => validateJsonLd(output.jsonLd),
    [output.jsonLd],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- score + check rows from the validator --------------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "This property is required for a valid rich result, fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it improves your rich-result eligibility.",
        group: "Recommended",
      });
    }
    if (validation.ok && validation.warnings.length === 0 && validation.types.length > 0) {
      items.push({
        id: "all-good",
        status: "pass",
        label: "All required & recommended properties present",
        detail: `Valid ${validation.types.join(", ")} markup, ready to publish.`,
        group: "Required",
      });
    } else if (validation.ok) {
      items.push({
        id: "required-ok",
        status: "pass",
        label: "All required properties present",
        detail: `Valid ${validation.types.join(", ") || def.key} markup.`,
        group: "Required",
      });
    }

    // Score: required errors weigh most; recommended warnings shave a little.
    const errPenalty = validation.errors.length * 22;
    const warnPenalty = validation.warnings.length * 6;
    const raw = 100 - errPenalty - warnPenalty;
    const s = validation.types.length === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [validation, def.key]);

  const grade = gradeForScore(score);
  const summary = validation.ok
    ? validation.warnings.length === 0
      ? "Valid. All required and recommended properties are present."
      : `Valid; ${validation.warnings.length} recommended ${validation.warnings.length === 1 ? "property" : "properties"} would strengthen it.`
    : `${validation.errors.length} required ${validation.errors.length === 1 ? "property is" : "properties are"} missing.`;

  /* -- handlers -------------------------------------------------------------- */
  const setValues = React.useCallback(
    (next: SchemaValues) => {
      setState((s) => ({ ...s, values: { ...s.values, [s.type]: next } }));
    },
    [],
  );

  const setType = React.useCallback((next: SchemaTypeKey) => {
    setState((s) => ({ ...s, type: next }));
  }, []);

  const loadExample = React.useCallback(() => {
    setState((s) => ({
      ...s,
      values: { ...s.values, [s.type]: TYPE_BY_KEY[s.type].example },
    }));
  }, []);

  /* -- presets for GeneratorWithPreview (whole-state) ------------------------ */
  const examples = React.useMemo<ReadonlyArray<Example<SchemaState>>>(
    () =>
      TYPES.map((t) => ({
        label: `${t.label} example`,
        description: t.blurb,
        icon: t.icon,
        value: { type: t.key, values: { [t.key]: t.example } } as SchemaState,
      })),
    [],
  );

  const serialize = React.useCallback((s: SchemaState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): SchemaState | null => {
    try {
      const parsed = JSON.parse(raw) as SchemaState;
      if (parsed && typeof parsed === "object" && parsed.type in TYPE_BY_KEY) return parsed;
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form: type picker + tailored fields ----------------------------------- */
  const form = (
    <div className="flex flex-col gap-4">
      {/* URL-first: read a live page's existing schema and fill the form. */}
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Icon name="Globe" size={13} className={style.text} />
          Start from a URL. We detect the page&rsquo;s existing schema &amp; fill the form
        </p>
        <UrlPrefillBar
          actionLabel="Fetch & fill"
          placeholder="https://example.com/blog/post"
          autoUrl={autoUrl}
          onHtml={(html, finalUrl) => applyFetched(html, finalUrl)}
        />
      </div>

      <div className="h-px bg-border" />

      <Field
        label="Schema type"
        htmlFor="schema-type"
        hint={def.blurb}
      >
        <SelectField<SchemaTypeKey>
          id="schema-type"
          className="w-full"
          ariaLabel="Schema type"
          value={state.type}
          onChange={setType}
          options={TYPE_OPTIONS}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={loadExample}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            style.soft,
          )}
        >
          <Icon name="Sparkles" size={13} />
          Fill with example
        </button>
        {def.dedicated && (
          <a
            href={`/${def.dedicated}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name={def.icon} size={13} />
            Open the dedicated {def.label} generator
            <Icon name="ArrowUpRight" size={12} />
          </a>
        )}
      </div>

      <div className="h-px bg-border" />

      <SchemaForm
        // Remount on type change so field defaults seed correctly.
        key={state.type}
        fields={def.fields}
        value={values}
        onChange={setValues}
        idPrefix={`schema-${state.type}`}
      />
    </div>
  );

  /* -- preview: score dial + grouped validity checks ------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: validation.warnings.length,
          fail: validation.errors.length,
        }}
      />
      <CheckList items={checks} grouped emptyLabel="Start filling the form to validate your markup." />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a pragmatic required/recommended check. Confirm final eligibility with{" "}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-medium underline underline-offset-2", style.text)}
          >
            Google&rsquo;s Rich Results Test
          </a>{" "}
          before publishing.
        </span>
      </p>
      {shareLink ? (
        <ShareReport
          url={shareLink}
          title={`${def.label} schema: ${hostOf(pageUrl)}`}
          text={`${def.label} structured-data report for ${hostOf(pageUrl)} (via GigAI)`}
        />
      ) : null}
    </div>
  );

  const stats = (
    <>
      <StatBadge
        icon={def.icon}
        label="Type"
        value={def.key}
        tone="info"
        title="Active schema.org @type"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={validation.ok ? "CircleCheck" : "XCircle"}
        label="Status"
        value={validation.ok ? "Valid" : `${validation.errors.length} error${validation.errors.length === 1 ? "" : "s"}`}
        tone={validation.ok ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<SchemaState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & rich-results check"
      downloadName={`${def.key.toLowerCase()}-schema.json`}
      downloadMime="application/ld+json;charset=utf-8"
      examples={examples}
      serialize={serialize}
      deserialize={deserialize}
      stats={stats}
      toolbarExtras={
        <button
          type="button"
          onClick={() => setMinified((m) => !m)}
          aria-pressed={minified}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            minified ? style.soft : "text-muted-foreground hover:text-foreground",
          )}
          title="Toggle minified output"
        >
          <Icon name={minified ? "Minimize2" : "Maximize2"} size={13} />
          {minified ? "Minified" : "Pretty"}
        </button>
      }
    />
  );
}
