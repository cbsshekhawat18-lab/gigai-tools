import type { Tool } from "@/types";

// ── Meta Tags ─────────────────────────────────────────────────────────────────
import metaTagGenerator from "./meta-tag-generator";
import metaTagAnalyzer from "./meta-tag-analyzer";
import metaDescriptionGenerator from "./meta-description-generator";
import metaTitlePreview from "./meta-title-preview";
import openGraphGenerator from "./open-graph-generator";
import twitterCardGenerator from "./twitter-card-generator";
import canonicalUrlGenerator from "./canonical-url-generator";
import socialShareInspector from "./social-share-inspector";

// ── Schema ────────────────────────────────────────────────────────────────────
import schemaGenerator from "./schema-generator";
import faqSchemaGenerator from "./faq-schema-generator";
import articleSchemaGenerator from "./article-schema-generator";
import productSchemaGenerator from "./product-schema-generator";
import organizationSchemaGenerator from "./organization-schema-generator";
import localBusinessSchemaGenerator from "./local-business-schema-generator";
import softwareSchemaGenerator from "./software-schema-generator";
import reviewSchemaGenerator from "./review-schema-generator";
import personSchemaGenerator from "./person-schema-generator";
import eventSchemaGenerator from "./event-schema-generator";
import breadcrumbSchemaGenerator from "./breadcrumb-schema-generator";
import videoSchemaGenerator from "./video-schema-generator";
import recipeSchemaGenerator from "./recipe-schema-generator";

// ── Sitemaps ──────────────────────────────────────────────────────────────────
import xmlSitemapGenerator from "./xml-sitemap-generator";
import htmlSitemapGenerator from "./html-sitemap-generator";
import imageSitemapGenerator from "./image-sitemap-generator";
import videoSitemapGenerator from "./video-sitemap-generator";
import newsSitemapGenerator from "./news-sitemap-generator";
import sitemapValidator from "./sitemap-validator";
import robotsTxtGenerator from "./robots-txt-generator";
import robotsTxtValidator from "./robots-txt-validator";

// ── SEO Preview ───────────────────────────────────────────────────────────────
import googleSerpPreview from "./google-serp-preview";
import openGraphPreview from "./open-graph-preview";
import twitterPreview from "./twitter-preview";
import richResultsPreview from "./rich-results-preview";

// ── URL Tools ─────────────────────────────────────────────────────────────────
import urlParser from "./url-parser";
import slugGenerator from "./slug-generator";
import utmBuilder from "./utm-builder";
import campaignUrlBuilder from "./campaign-url-builder";

// ── Validators ────────────────────────────────────────────────────────────────
import htmlValidator from "./html-validator";
import cssValidator from "./css-validator";
import jsonldValidator from "./jsonld-validator";
import schemaValidator from "./schema-validator";
import metaTagValidator from "./meta-tag-validator";

// ── Headers & Security ────────────────────────────────────────────────────────
import httpHeaderChecker from "./http-header-checker";
import securityHeaderChecker from "./security-header-checker";
import sslChecker from "./ssl-checker";
import cspGenerator from "./csp-generator";

// ── Content ───────────────────────────────────────────────────────────────────
import headingChecker from "./heading-checker";
import readingTimeCalculator from "./reading-time-calculator";
import keywordDensityChecker from "./keyword-density-checker";
import wordCounter from "./word-counter";
import characterCounter from "./character-counter";

/**
 * Website & SEO Tools registry.
 *
 * The single source of truth for the SEO suite. Add a tool by dropping a file
 * under `config/tools/seo/<slug>.ts` (each exporting a `Tool` default),
 * importing it here, and listing it below in internal-linking order. Everything
 * else (routes, metadata, JSON-LD, cards, the /seo-tools landing, search,
 * sitemap, and the generated branded illustration) is derived automatically, a
 * SEO tool lives in the `seo-tools` category and its `group` seeds
 * `lib/seo-tools/illustrations`.
 *
 * Set each tool's `group` to a sub-category label ("Meta Tags", "Schema",
 * "Sitemaps", "SEO Preview", "URL Tools", "Validators", "Headers & Security",
 * "Content") so the category landing can render the grouped "All SEO
 * categories" view.
 *
 * The full suite of 50 SEO tools, in internal-linking order. The array is
 * exported and wired into the master TOOLS registry so routes, metadata,
 * JSON-LD, cards, the /seo-tools landing, search and sitemap are all derived
 * automatically.
 */
export const SEO_TOOLS: Tool[] = [
  // Meta Tags
  metaTagGenerator,
  metaTagAnalyzer,
  metaDescriptionGenerator,
  metaTitlePreview,
  openGraphGenerator,
  twitterCardGenerator,
  canonicalUrlGenerator,
  socialShareInspector,
  // Schema
  schemaGenerator,
  faqSchemaGenerator,
  articleSchemaGenerator,
  productSchemaGenerator,
  organizationSchemaGenerator,
  localBusinessSchemaGenerator,
  softwareSchemaGenerator,
  reviewSchemaGenerator,
  personSchemaGenerator,
  eventSchemaGenerator,
  breadcrumbSchemaGenerator,
  videoSchemaGenerator,
  recipeSchemaGenerator,
  // Sitemaps
  xmlSitemapGenerator,
  htmlSitemapGenerator,
  imageSitemapGenerator,
  videoSitemapGenerator,
  newsSitemapGenerator,
  sitemapValidator,
  robotsTxtGenerator,
  robotsTxtValidator,
  // SEO Preview
  googleSerpPreview,
  openGraphPreview,
  twitterPreview,
  richResultsPreview,
  // URL Tools
  urlParser,
  slugGenerator,
  utmBuilder,
  campaignUrlBuilder,
  // Validators
  htmlValidator,
  cssValidator,
  jsonldValidator,
  schemaValidator,
  metaTagValidator,
  // Headers & Security
  httpHeaderChecker,
  securityHeaderChecker,
  sslChecker,
  cspGenerator,
  // Content
  headingChecker,
  readingTimeCalculator,
  keywordDensityChecker,
  wordCounter,
  characterCounter,
];
