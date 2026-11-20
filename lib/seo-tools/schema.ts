/**
 * GigAI Tools, schema.org / JSON-LD engine.
 *
 * Pure, dependency-free builders that turn structured input into valid
 * schema.org JSON-LD, plus a lightweight validator that checks required and
 * recommended properties per `@type`. Every builder returns the JSON-LD object
 * *and* a pretty-printed string, so a UI can preview and copy in one step.
 *
 * All builders omit empty/undefined fields so the emitted markup stays clean.
 * Nothing here fetches the network. Input is always structured data the user
 * has already provided.
 */

/** A JSON-LD object is a plain record with a `@context` and `@type`. */
export type JsonLd = Record<string, unknown>;

/** Standard return: the object plus its pretty-printed serialization. */
export interface SchemaOutput {
  /** The JSON-LD object (already trimmed of empty fields). */
  jsonLd: JsonLd;
  /** 2-space pretty-printed JSON string. */
  pretty: string;
  /** Minified single-line JSON string. */
  minified: string;
  /** A ready-to-paste `<script type="application/ld+json">` block. */
  scriptTag: string;
}

const CONTEXT = "https://schema.org";

/** Remove `undefined`, `null`, `""`, empty arrays and empty objects, recursively. */
function clean<T>(value: T): T {
  if (Array.isArray(value)) {
    const arr = value
      .map((v) => clean(v))
      .filter((v) => v !== undefined && v !== null && v !== "");
    return arr as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const c = clean(v);
      const isEmptyArr = Array.isArray(c) && c.length === 0;
      const isEmptyObj =
        c !== null &&
        typeof c === "object" &&
        !Array.isArray(c) &&
        Object.keys(c as object).length === 0;
      if (c === undefined || c === null || c === "" || isEmptyArr || isEmptyObj) continue;
      out[k] = c;
    }
    return out as unknown as T;
  }
  return value;
}

/** Wrap a cleaned JSON-LD object into the standard {@link SchemaOutput}. */
function toOutput(obj: JsonLd): SchemaOutput {
  const jsonLd = clean(obj);
  const pretty = JSON.stringify(jsonLd, null, 2);
  const minified = JSON.stringify(jsonLd);
  const scriptTag = `<script type="application/ld+json">\n${pretty}\n</script>`;
  return { jsonLd, pretty, minified, scriptTag };
}

/** Build any schema.org type from a free-form property bag. */
export function buildGeneric(type: string, props: Record<string, unknown>): SchemaOutput {
  return toOutput({ "@context": CONTEXT, "@type": type, ...props });
}

/* --------------------------------- FAQPage -------------------------------- */

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPage(items: FaqItem[]): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  });
}

/* --------------------------- Article / BlogPosting ------------------------ */

export interface ArticleInput {
  headline: string;
  description?: string;
  image?: string | string[];
  authorName?: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
  datePublished?: string;
  dateModified?: string;
  url?: string;
  articleBody?: string;
  keywords?: string | string[];
  /** Defaults to "Article"; pass "BlogPosting" or "NewsArticle" to override. */
  type?: "Article" | "BlogPosting" | "NewsArticle";
}

export function buildArticle(input: ArticleInput): SchemaOutput {
  const author = input.authorName
    ? { "@type": "Person", name: input.authorName, url: input.authorUrl }
    : undefined;
  const publisher = input.publisherName
    ? {
        "@type": "Organization",
        name: input.publisherName,
        logo: input.publisherLogo
          ? { "@type": "ImageObject", url: input.publisherLogo }
          : undefined,
      }
    : undefined;
  return toOutput({
    "@context": CONTEXT,
    "@type": input.type ?? "Article",
    headline: input.headline,
    description: input.description,
    image: input.image,
    author,
    publisher,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    mainEntityOfPage: input.url
      ? { "@type": "WebPage", "@id": input.url }
      : undefined,
    articleBody: input.articleBody,
    keywords: input.keywords,
  });
}

/* --------------------------------- Product -------------------------------- */

export interface OfferInput {
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  url?: string;
  priceValidUntil?: string;
  itemCondition?: string;
}

export interface AggregateRatingInput {
  ratingValue: string | number;
  reviewCount?: string | number;
  ratingCount?: string | number;
  bestRating?: string | number;
  worstRating?: string | number;
}

export interface ProductInput {
  name: string;
  description?: string;
  image?: string | string[];
  brand?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  offers?: OfferInput;
  aggregateRating?: AggregateRatingInput;
  reviews?: ReviewInput[];
}

/** Normalize an availability shorthand ("InStock") to a schema.org URL. */
function normalizeAvailability(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http")) return value;
  const bare = value.replace(/^https?:\/\/schema\.org\//, "");
  return `https://schema.org/${bare}`;
}

function offerNode(offer?: OfferInput): JsonLd | undefined {
  if (!offer) return undefined;
  return {
    "@type": "Offer",
    price: offer.price !== undefined ? String(offer.price) : undefined,
    priceCurrency: offer.priceCurrency,
    availability: normalizeAvailability(offer.availability),
    url: offer.url,
    priceValidUntil: offer.priceValidUntil,
    itemCondition: offer.itemCondition
      ? normalizeAvailability(offer.itemCondition)
      : undefined,
  };
}

function aggregateRatingNode(r?: AggregateRatingInput): JsonLd | undefined {
  if (!r) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: String(r.ratingValue),
    reviewCount: r.reviewCount !== undefined ? String(r.reviewCount) : undefined,
    ratingCount: r.ratingCount !== undefined ? String(r.ratingCount) : undefined,
    bestRating: r.bestRating !== undefined ? String(r.bestRating) : undefined,
    worstRating: r.worstRating !== undefined ? String(r.worstRating) : undefined,
  };
}

export function buildProduct(input: ProductInput): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: input.image,
    brand: input.brand ? { "@type": "Brand", name: input.brand } : undefined,
    sku: input.sku,
    gtin: input.gtin,
    mpn: input.mpn,
    offers: offerNode(input.offers),
    aggregateRating: aggregateRatingNode(input.aggregateRating),
    review: input.reviews?.map((r) => reviewNode(r)),
  });
}

/* ------------------------------- Organization ----------------------------- */

export interface OrganizationInput {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  telephone?: string;
  sameAs?: string[];
  address?: PostalAddressInput;
  foundingDate?: string;
}

export interface PostalAddressInput {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

function addressNode(a?: PostalAddressInput): JsonLd | undefined {
  if (!a) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: a.streetAddress,
    addressLocality: a.addressLocality,
    addressRegion: a.addressRegion,
    postalCode: a.postalCode,
    addressCountry: a.addressCountry,
  };
}

export function buildOrganization(input: OrganizationInput): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "Organization",
    name: input.name,
    url: input.url,
    logo: input.logo,
    description: input.description,
    email: input.email,
    telephone: input.telephone,
    sameAs: input.sameAs,
    address: addressNode(input.address),
    foundingDate: input.foundingDate,
  });
}

/* ------------------------------- LocalBusiness ---------------------------- */

export interface GeoInput {
  latitude: string | number;
  longitude: string | number;
}

export interface OpeningHoursInput {
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface LocalBusinessInput {
  name: string;
  /** e.g. "Restaurant", "Store"; defaults to "LocalBusiness". */
  type?: string;
  url?: string;
  image?: string | string[];
  description?: string;
  telephone?: string;
  priceRange?: string;
  address?: PostalAddressInput;
  geo?: GeoInput;
  openingHours?: OpeningHoursInput[];
  sameAs?: string[];
  aggregateRating?: AggregateRatingInput;
}

export function buildLocalBusiness(input: LocalBusinessInput): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": input.type ?? "LocalBusiness",
    name: input.name,
    url: input.url,
    image: input.image,
    description: input.description,
    telephone: input.telephone,
    priceRange: input.priceRange,
    address: addressNode(input.address),
    geo: input.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: String(input.geo.latitude),
          longitude: String(input.geo.longitude),
        }
      : undefined,
    openingHoursSpecification: input.openingHours?.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: input.sameAs,
    aggregateRating: aggregateRatingNode(input.aggregateRating),
  });
}

/* ---------------------------- SoftwareApplication ------------------------- */

export interface SoftwareApplicationInput {
  name: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  url?: string;
  image?: string;
  offers?: OfferInput;
  aggregateRating?: AggregateRatingInput;
  softwareVersion?: string;
}

export function buildSoftwareApplication(input: SoftwareApplicationInput): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "SoftwareApplication",
    name: input.name,
    description: input.description,
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem,
    url: input.url,
    image: input.image,
    offers: offerNode(input.offers),
    aggregateRating: aggregateRatingNode(input.aggregateRating),
    softwareVersion: input.softwareVersion,
  });
}

/* --------------------------------- Review --------------------------------- */

export interface ReviewInput {
  itemName?: string;
  author?: string;
  reviewBody?: string;
  ratingValue?: string | number;
  bestRating?: string | number;
  worstRating?: string | number;
  datePublished?: string;
}

function reviewNode(input: ReviewInput): JsonLd {
  return {
    "@type": "Review",
    itemReviewed: input.itemName
      ? { "@type": "Thing", name: input.itemName }
      : undefined,
    author: input.author ? { "@type": "Person", name: input.author } : undefined,
    reviewBody: input.reviewBody,
    datePublished: input.datePublished,
    reviewRating:
      input.ratingValue !== undefined
        ? {
            "@type": "Rating",
            ratingValue: String(input.ratingValue),
            bestRating:
              input.bestRating !== undefined ? String(input.bestRating) : undefined,
            worstRating:
              input.worstRating !== undefined ? String(input.worstRating) : undefined,
          }
        : undefined,
  };
}

export function buildReview(input: ReviewInput): SchemaOutput {
  return toOutput({ "@context": CONTEXT, ...reviewNode(input) });
}

/* --------------------------------- Person --------------------------------- */

export interface PersonInput {
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: string;
  email?: string;
  telephone?: string;
  sameAs?: string[];
  description?: string;
}

export function buildPerson(input: PersonInput): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "Person",
    name: input.name,
    url: input.url,
    image: input.image,
    jobTitle: input.jobTitle,
    worksFor: input.worksFor
      ? { "@type": "Organization", name: input.worksFor }
      : undefined,
    email: input.email,
    telephone: input.telephone,
    sameAs: input.sameAs,
    description: input.description,
  });
}

/* ---------------------------------- Event --------------------------------- */

export interface EventInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  address?: PostalAddressInput | string;
  url?: string;
  image?: string | string[];
  performer?: string;
  organizer?: string;
  offers?: OfferInput;
  eventStatus?: string;
  eventAttendanceMode?: string;
}

export function buildEvent(input: EventInput): SchemaOutput {
  const location =
    typeof input.address === "string"
      ? { "@type": "Place", name: input.locationName, address: input.address }
      : input.locationName || input.address
        ? {
            "@type": "Place",
            name: input.locationName,
            address: addressNode(input.address),
          }
        : undefined;
  return toOutput({
    "@context": CONTEXT,
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    eventStatus: input.eventStatus
      ? normalizeAvailability(input.eventStatus)
      : undefined,
    eventAttendanceMode: input.eventAttendanceMode
      ? normalizeAvailability(input.eventAttendanceMode)
      : undefined,
    location,
    url: input.url,
    image: input.image,
    performer: input.performer
      ? { "@type": "PerformingGroup", name: input.performer }
      : undefined,
    organizer: input.organizer
      ? { "@type": "Organization", name: input.organizer }
      : undefined,
    offers: offerNode(input.offers),
  });
}

/* ------------------------------ BreadcrumbList ---------------------------- */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbList(items: BreadcrumbItem[]): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  });
}

/* ------------------------------- VideoObject ------------------------------ */

export interface VideoObjectInput {
  name: string;
  description?: string;
  thumbnailUrl?: string | string[];
  uploadDate?: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
  durationSeconds?: number;
}

/** Convert seconds into an ISO-8601 duration (`PT1H2M3S`). */
export function secondsToIso8601Duration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  let out = "PT";
  if (h) out += `${h}H`;
  if (m) out += `${m}M`;
  if (sec || out === "PT") out += `${sec}S`;
  return out;
}

export function buildVideoObject(input: VideoObjectInput): SchemaOutput {
  const duration =
    input.duration ??
    (input.durationSeconds !== undefined
      ? secondsToIso8601Duration(input.durationSeconds)
      : undefined);
  return toOutput({
    "@context": CONTEXT,
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: input.uploadDate,
    contentUrl: input.contentUrl,
    embedUrl: input.embedUrl,
    duration,
  });
}

/* --------------------------------- Recipe --------------------------------- */

export interface RecipeInput {
  name: string;
  description?: string;
  image?: string | string[];
  authorName?: string;
  datePublished?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  ingredients?: string[];
  instructions?: string[];
  keywords?: string;
  nutritionCalories?: string;
  aggregateRating?: AggregateRatingInput;
}

export function buildRecipe(input: RecipeInput): SchemaOutput {
  return toOutput({
    "@context": CONTEXT,
    "@type": "Recipe",
    name: input.name,
    description: input.description,
    image: input.image,
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : undefined,
    datePublished: input.datePublished,
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    totalTime: input.totalTime,
    recipeYield: input.recipeYield,
    recipeCategory: input.recipeCategory,
    recipeCuisine: input.recipeCuisine,
    recipeIngredient: input.ingredients,
    recipeInstructions: input.instructions?.map((step) => ({
      "@type": "HowToStep",
      text: step,
    })),
    keywords: input.keywords,
    nutrition: input.nutritionCalories
      ? { "@type": "NutritionInformation", calories: input.nutritionCalories }
      : undefined,
    aggregateRating: aggregateRatingNode(input.aggregateRating),
  });
}

/* -------------------------------- Validation ------------------------------ */

export interface ValidationIssue {
  /** Dotted path of the offending property, when known. */
  path?: string;
  message: string;
}

export interface JsonLdValidation {
  ok: boolean;
  /** The `@type`(s) detected at the root. */
  types: string[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

/** Required + recommended properties per supported `@type`. */
const TYPE_RULES: Record<string, { required: string[]; recommended: string[] }> = {
  FAQPage: { required: ["mainEntity"], recommended: [] },
  Question: { required: ["name", "acceptedAnswer"], recommended: [] },
  Article: {
    required: ["headline"],
    recommended: ["image", "author", "datePublished", "publisher"],
  },
  BlogPosting: {
    required: ["headline"],
    recommended: ["image", "author", "datePublished", "publisher"],
  },
  NewsArticle: {
    required: ["headline"],
    recommended: ["image", "author", "datePublished", "publisher"],
  },
  Product: {
    required: ["name"],
    recommended: ["image", "offers", "description", "aggregateRating"],
  },
  Offer: { required: ["price", "priceCurrency"], recommended: ["availability", "url"] },
  Organization: { required: ["name"], recommended: ["url", "logo", "sameAs"] },
  LocalBusiness: {
    required: ["name"],
    recommended: ["address", "telephone", "openingHoursSpecification", "image"],
  },
  SoftwareApplication: {
    required: ["name"],
    recommended: ["applicationCategory", "operatingSystem", "offers"],
  },
  Review: { required: ["reviewRating"], recommended: ["author", "reviewBody"] },
  Person: { required: ["name"], recommended: ["url", "jobTitle", "sameAs"] },
  Event: {
    required: ["name", "startDate"],
    recommended: ["location", "endDate", "offers", "image"],
  },
  BreadcrumbList: { required: ["itemListElement"], recommended: [] },
  VideoObject: {
    required: ["name", "thumbnailUrl", "uploadDate"],
    recommended: ["description", "contentUrl", "duration"],
  },
  Recipe: {
    required: ["name"],
    recommended: ["image", "recipeIngredient", "recipeInstructions", "author"],
  },
  AggregateRating: {
    required: ["ratingValue"],
    recommended: ["reviewCount", "ratingCount"],
  },
};

function typeList(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

/** Recursively validate a node and any nested typed sub-nodes. */
function validateNode(
  node: unknown,
  path: string,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  seenTypes: Set<string>,
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((child, i) => validateNode(child, `${path}[${i}]`, errors, warnings, seenTypes));
    return;
  }
  const obj = node as Record<string, unknown>;
  const types = typeList(obj["@type"]);
  for (const t of types) {
    seenTypes.add(t);
    const rule = TYPE_RULES[t];
    if (!rule) continue;
    for (const req of rule.required) {
      const v = obj[req];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
        errors.push({
          path: path ? `${path}.${req}` : req,
          message: `${t} is missing required property "${req}".`,
        });
      }
    }
    for (const rec of rule.recommended) {
      const v = obj[rec];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
        warnings.push({
          path: path ? `${path}.${rec}` : rec,
          message: `${t} is missing recommended property "${rec}" (improves rich-result eligibility).`,
        });
      }
    }
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === "@context" || k === "@type" || k === "@id") continue;
    validateNode(v, path ? `${path}.${k}` : k, errors, warnings, seenTypes);
  }
}

/**
 * Validate a JSON-LD object or JSON string against schema.org expectations.
 * Reports parse errors, missing `@context`/`@type`, and per-type required
 * (error) / recommended (warning) properties. This is a pragmatic linter, not
 * a full schema.org shape-validation engine. It is honest about that scope.
 */
export function validateJsonLd(input: unknown): JsonLdValidation {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  let obj: unknown = input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return { ok: false, types: [], errors: [{ message: "Input is empty." }], warnings };
    }
    try {
      obj = JSON.parse(trimmed);
    } catch (err) {
      return {
        ok: false,
        types: [],
        errors: [{ message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}` }],
        warnings,
      };
    }
  }

  if (!obj || typeof obj !== "object") {
    return { ok: false, types: [], errors: [{ message: "JSON-LD must be an object." }], warnings };
  }

  const roots = Array.isArray(obj) ? obj : [obj];
  const seenTypes = new Set<string>();
  for (const root of roots) {
    if (!root || typeof root !== "object" || Array.isArray(root)) {
      errors.push({ message: "Each JSON-LD node must be an object." });
      continue;
    }
    const r = root as Record<string, unknown>;
    if (!r["@context"]) {
      warnings.push({ path: "@context", message: 'Missing "@context" (usually "https://schema.org").' });
    }
    if (!r["@type"]) {
      errors.push({ path: "@type", message: 'Missing "@type".' });
    }
    validateNode(root, "", errors, warnings, seenTypes);
  }

  return { ok: errors.length === 0, types: [...seenTypes], errors, warnings };
}
