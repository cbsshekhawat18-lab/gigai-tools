/**
 * GigAI Social Share Inspector, the analysis ENGINE.
 *
 * Turns a page's HTML (pasted, uploaded, or fetched) into a full social-share
 * diagnosis: what each platform will show, why the wrong image/old preview may
 * appear, and exactly how to fix it. It REUSES the existing SEO engines rather
 * than re-implementing them:
 *  • `./meta`: extractMetaFromHtml / analyzeMetaFromHtml (tags + audit)
 *  • `./preview`, ogModel / twitterModel (share-card data models)
 *  • `./schema`: validateJsonLd (structured-data validation)
 *  • `./headers`: parseHttpHeaders / analyzeSecurityHeaders (when headers given)
 *
 * Pure + framework-agnostic (uses the browser's DOMParser, guarded). No network
 * here. Image fetching + URL fetching are separate, opt-in, async steps. This
 * is the deep DEBUGGER layer, distinct from the existing meta-tag-analyzer /
 * open-graph-preview / twitter-preview tools (which it complements, not clones).
 */

import {
  analyzeMetaFromHtml,
  extractMetaFromHtml,
  type ExtractedMeta,
  type MetaAudit,
} from "@/lib/seo-tools/meta";
import { ogModel, twitterModel, type OgPreviewModel, type TwitterPreviewModel } from "@/lib/seo-tools/preview";
import { validateJsonLd, type JsonLdValidation } from "@/lib/seo-tools/schema";
import {
  analyzeSecurityHeaders,
  parseHttpHeaders,
  type ParsedHeaders,
  type SecurityHeaderReport,
} from "@/lib/seo-tools/headers";

/* ── Platforms ─────────────────────────────────────────────────────────────*/

export type SocialPlatformId =
  | "facebook"
  | "linkedin"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "discord"
  | "slack"
  | "teams";

/** How a platform draws a share/unfurl card + how it caches previews. */
export interface PlatformSpec {
  id: SocialPlatformId;
  label: string;
  /** lucide icon name. */
  icon: string;
  /** The layout it renders: big image card, small image, or text-only. */
  style: "large" | "compact" | "chat";
  /** Ideal share-image pixels + ratio label. */
  image: { w: number; h: number; ratio: string };
  /** Soft title/description character budgets before clipping. */
  titleLimit: number;
  descLimit: number;
  /** Plain-language note on how this platform picks the image. */
  note: string;
  /** How its cache behaves + how to force a refresh (the STEP 7 explainer). */
  cache: string;
}

export const PLATFORMS: PlatformSpec[] = [
  {
    id: "facebook", label: "Facebook", icon: "Facebook", style: "large",
    image: { w: 1200, h: 630, ratio: "1.91:1" }, titleLimit: 88, descLimit: 200,
    note: "Uses og:title, og:description and og:image. Falls back to the page <title> and the first sizeable image if og tags are missing.",
    cache: "Facebook caches previews aggressively. After changing tags, re-scrape the URL in the Facebook Sharing Debugger (Scrape Again): otherwise the old image can persist for days.",
  },
  {
    id: "linkedin", label: "LinkedIn", icon: "Linkedin", style: "large",
    image: { w: 1200, h: 627, ratio: "1.91:1" }, titleLimit: 120, descLimit: 160,
    note: "Uses og:title, og:description and og:image (og:image is required for a large card).",
    cache: "LinkedIn caches a URL's preview for ~7 days. Use the LinkedIn Post Inspector to force a re-fetch, or share a URL with a fresh query parameter.",
  },
  {
    id: "twitter", label: "X (Twitter)", icon: "Twitter", style: "large",
    image: { w: 1200, h: 628, ratio: "1.91:1" }, titleLimit: 70, descLimit: 200,
    note: "Uses twitter:card / twitter:title / twitter:image, falling back to Open Graph. summary_large_image needs a wide image. Summary uses a small square.",
    cache: "X re-fetches tags on new shares but can hold a cached card. Adding a version query parameter (?v=2) to the URL forces a fresh unfurl.",
  },
  {
    id: "whatsapp", label: "WhatsApp", icon: "MessageCircle", style: "compact",
    image: { w: 1200, h: 630, ratio: "1.91:1" }, titleLimit: 65, descLimit: 120,
    note: "Shows a small thumbnail from og:image with the title and host. It prefers a lightweight image, very large images may not render.",
    cache: "WhatsApp caches by exact URL and rarely refreshes. If the preview is stale, share the URL with a new query parameter to bust the cache.",
  },
  {
    id: "telegram", label: "Telegram", icon: "Send", style: "chat",
    image: { w: 1200, h: 630, ratio: "1.91:1" }, titleLimit: 80, descLimit: 200,
    note: "Uses og:title, og:description and og:image for the link preview under the message.",
    cache: "Telegram caches page previews. Message @WebpageBot with the URL to force it to re-read your updated tags.",
  },
  {
    id: "discord", label: "Discord", icon: "MessageSquare", style: "chat",
    image: { w: 1200, h: 630, ratio: "1.91:1" }, titleLimit: 80, descLimit: 200,
    note: "Renders an embed from Open Graph (and theme-color for the accent bar). Needs og:title + og:image for a rich embed.",
    cache: "Discord caches embeds per URL for a while. A URL with a new query parameter unfurls fresh.",
  },
  {
    id: "slack", label: "Slack", icon: "Slack", style: "compact",
    image: { w: 1200, h: 630, ratio: "1.91:1" }, titleLimit: 80, descLimit: 200,
    note: "Unfurls using Open Graph / oEmbed: og:title, og:description, og:image.",
    cache: "Slack caches unfurls (roughly 30 minutes to hours). Re-post after the cache expires, or add a query parameter to force a new unfurl.",
  },
  {
    id: "teams", label: "Microsoft Teams", icon: "Users", style: "compact",
    image: { w: 1200, h: 630, ratio: "1.91:1" }, titleLimit: 80, descLimit: 200,
    note: "Uses Open Graph tags for the link card. Requires publicly reachable og:image.",
    cache: "Teams caches link previews heavily and can be the slowest to refresh. A versioned URL (new query parameter) is the reliable way to update it.",
  },
];

/* ── Result shapes ─────────────────────────────────────────────────────────*/

export type Severity = "error" | "warn" | "info";
export type Priority = "high" | "medium" | "low";

/** One resolved platform preview + its own warnings. */
export interface PlatformPreview {
  spec: PlatformSpec;
  title: string;
  description: string;
  image?: string;
  domain: string;
  siteName?: string;
  /** True when the platform will render its big-image layout. */
  hasImage: boolean;
  /** Title/description clipped to this platform's budget (as it will show). */
  clippedTitle: string;
  clippedDescription: string;
  warnings: string[];
}

/** A parsed + validated JSON-LD block found in the page. */
export interface StructuredDataItem {
  types: string[];
  validation: JsonLdValidation;
  /** Pretty-printed JSON (or the raw text if it wouldn't parse). */
  raw: string;
  parseError?: string;
}

/** A rich diagnostic: the "why + how to fix" that makes this a debugger. */
export interface Diagnostic {
  id: string;
  severity: Severity;
  category: "metadata" | "image" | "social" | "cache" | "seo" | "structured-data";
  /** The problem, in plain words. */
  title: string;
  /** Why it happens. */
  cause: string;
  /** What it breaks / the user-visible impact. */
  impact: string;
  /** The concrete fix. */
  fix: string;
  priority: Priority;
  difficulty: "easy" | "medium";
}

export interface InspectorScores {
  social: number;
  seo: number;
  image: number;
  metadata: number;
  overall: number;
}

/** The full inspection result the UI renders. */
export interface SocialInspection {
  extracted: ExtractedMeta;
  metaAudit: MetaAudit;
  og: OgPreviewModel;
  twitter: TwitterPreviewModel;
  /** The resolved values every platform starts from (after fallbacks). */
  resolved: { title: string; description: string; image?: string; url: string; siteName?: string; imageIsHttps?: boolean };
  platforms: PlatformPreview[];
  structuredData: StructuredDataItem[];
  diagnostics: Diagnostic[];
  scores: InspectorScores;
  /** Parsed HTTP headers + security report. Only when headers were supplied. */
  headers?: { parsed: ParsedHeaders; security: SecurityHeaderReport };
}

/* ── Helpers ───────────────────────────────────────────────────────────────*/

function hasDomParser(): boolean {
  return typeof DOMParser !== "undefined";
}

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function domainOf(url: string): string {
  if (!url) return "";
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Fallback chain the platforms use to resolve their share values. */
function resolveShareValues(m: ExtractedMeta) {
  const title = m.og["title"] || m.twitter["title"] || m.title || "";
  const description = m.og["description"] || m.twitter["description"] || m.description || "";
  const image = m.og["image"] || m.twitter["image"] || m.og["image:secure_url"] || undefined;
  const url = m.og["url"] || m.canonical || "";
  const siteName = m.og["site_name"] || undefined;
  let imageIsHttps: boolean | undefined;
  if (image) imageIsHttps = /^https:\/\//i.test(image);
  return { title, description, image, url, siteName, imageIsHttps };
}

/** Extract + validate every JSON-LD block in the HTML. */
export function extractJsonLd(html: string): StructuredDataItem[] {
  if (!hasDomParser()) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  const out: StructuredDataItem[] = [];
  scripts.forEach((s) => {
    const text = s.textContent?.trim() ?? "";
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] && Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
      for (const node of nodes) {
        const validation = validateJsonLd(node);
        out.push({ types: validation.types, validation, raw: JSON.stringify(node, null, 2) });
      }
    } catch (e) {
      out.push({ types: [], validation: { ok: false, types: [], errors: [{ message: "Invalid JSON" }], warnings: [] }, raw: text, parseError: e instanceof Error ? e.message : "Invalid JSON" });
    }
  });
  return out;
}

/** Build the per-platform previews from resolved share values. */
function buildPlatformPreviews(m: ExtractedMeta): PlatformPreview[] {
  const r = resolveShareValues(m);
  const twCard = (m.twitter["card"] as string) || (r.image ? "summary_large_image" : "summary");
  return PLATFORMS.map((spec) => {
    const warnings: string[] = [];
    if (!r.image) warnings.push("No image, renders as a small text-only link.");
    if (spec.id === "twitter" && twCard === "summary" && r.image) warnings.push("twitter:card is 'summary': set 'summary_large_image' for the big card.");
    if (r.title.length > spec.titleLimit) warnings.push(`Title over ~${spec.titleLimit} chars will be clipped here.`);
    if (r.imageIsHttps === false) warnings.push("Image URL is not HTTPS: many platforms won't load it.");
    return {
      spec,
      title: r.title,
      description: r.description,
      image: r.image,
      domain: domainOf(r.url),
      siteName: r.siteName,
      hasImage: Boolean(r.image),
      clippedTitle: clip(r.title, spec.titleLimit),
      clippedDescription: clip(r.description, spec.descLimit),
      warnings,
    };
  });
}

/* ── Diagnostics (the debugger core) ───────────────────────────────────────*/

function buildDiagnostics(m: ExtractedMeta, sd: StructuredDataItem[]): Diagnostic[] {
  const r = resolveShareValues(m);
  const d: Diagnostic[] = [];
  const add = (x: Diagnostic) => d.push(x);

  if (!m.og["image"] && !m.twitter["image"]) {
    add({
      id: "no-og-image", severity: "error", category: "image", priority: "high", difficulty: "easy",
      title: "No social share image (og:image) found",
      cause: "The page has no og:image or twitter:image meta tag, so platforms have nothing to show.",
      impact: "Links shared to Facebook, LinkedIn, X, WhatsApp, Slack and others render as a plain, image-less box: far lower click-through.",
      fix: "Add <meta property=\"og:image\" content=\"https://…/share.jpg\"> pointing at a public 1200×630 image, and mirror it with twitter:image.",
    });
  }
  if (!m.twitter["card"]) {
    add({
      id: "no-twitter-card", severity: "warn", category: "social", priority: "medium", difficulty: "easy",
      title: "Missing twitter:card type",
      cause: "Without a twitter:card tag, X decides the layout itself and may fall back to a small card.",
      impact: "Your X (Twitter) shares may not use the large-image layout even when an image exists.",
      fix: "Add <meta name=\"twitter:card\" content=\"summary_large_image\"> (plus twitter:title, twitter:description, twitter:image).",
    });
  }
  if (r.imageIsHttps === false) {
    add({
      id: "image-http", severity: "error", category: "image", priority: "high", difficulty: "easy",
      title: "Share image is served over HTTP, not HTTPS",
      cause: "The og:image URL starts with http://. Social platforms require secure image URLs.",
      impact: "The image is silently dropped and the share renders without a picture.",
      fix: "Serve the image over HTTPS and update og:image (and og:image:secure_url) to the https:// URL.",
    });
  }
  if (r.image && /^\//.test(r.image)) {
    add({
      id: "image-relative", severity: "error", category: "image", priority: "high", difficulty: "easy",
      title: "og:image uses a relative path",
      cause: "The og:image value is a relative URL (starts with /). Crawlers can't resolve it reliably.",
      impact: "Most platforms fail to load a relative image, so the share has no picture.",
      fix: "Use an absolute, fully-qualified URL: https://yourdomain.com/path/share.jpg.",
    });
  }
  if (!m.og["title"]) {
    add({
      id: "no-og-title", severity: "warn", category: "social", priority: "medium", difficulty: "easy",
      title: "Missing og:title",
      cause: "No og:title tag, platforms fall back to the page <title>, which may be truncated or brand-heavy.",
      impact: "Less control over the headline shown on shared cards.",
      fix: "Add <meta property=\"og:title\" content=\"A punchy, specific headline\">.",
    });
  }
  if (!m.og["description"]) {
    add({
      id: "no-og-desc", severity: "info", category: "social", priority: "low", difficulty: "easy",
      title: "Missing og:description",
      cause: "No og:description, cards fall back to the meta description, or show nothing.",
      impact: "Weaker context under the headline on social cards.",
      fix: "Add <meta property=\"og:description\" content=\"1–2 sentence summary\">.",
    });
  }
  if (!m.og["url"] && !m.canonical) {
    add({
      id: "no-canonical", severity: "warn", category: "seo", priority: "medium", difficulty: "easy",
      title: "No canonical or og:url",
      cause: "Neither a canonical link nor og:url is set, so the share URL and ranking signals can fragment across query-string variants.",
      impact: "Duplicate previews for ?utm_ variants and diluted SEO signals.",
      fix: "Add <link rel=\"canonical\" href=\"…\"> and <meta property=\"og:url\" content=\"…\"> with the clean URL.",
    });
  }
  const robots = (m.robots ?? "").toLowerCase();
  if (robots.includes("noindex")) {
    add({
      id: "noindex", severity: "warn", category: "seo", priority: "high", difficulty: "easy",
      title: "Page is set to noindex",
      cause: "A robots meta tag contains noindex.",
      impact: "Search engines won't index this page. Correct for staging/admin pages, a serious problem if it should rank.",
      fix: "If this page should appear in search, remove noindex from the robots meta (check template defaults and CMS toggles).",
    });
  }
  if (m.title && m.title.length > 60) {
    add({
      id: "title-long", severity: "info", category: "seo", priority: "low", difficulty: "easy",
      title: "Title tag is long", cause: `The <title> is ${m.title.length} characters.`,
      impact: "Google may truncate it in results (sweet spot ≈ 50–60 chars).",
      fix: "Tighten the title to roughly 50–60 characters, front-loading the primary keyword.",
    });
  }
  if (sd.length === 0) {
    add({
      id: "no-schema", severity: "info", category: "structured-data", priority: "low", difficulty: "medium",
      title: "No structured data (JSON-LD) found",
      cause: "The page has no <script type=\"application/ld+json\"> block.",
      impact: "Misses eligibility for rich results (breadcrumbs, article/FAQ/product rich snippets).",
      fix: "Add JSON-LD for the page type (Article, Product, FAQPage, Organization…). GigAI's Schema Generator can build it.",
    });
  } else {
    for (const item of sd) {
      if (!item.validation.ok) {
        add({
          id: `schema-${item.types.join("-") || "invalid"}`, severity: "warn", category: "structured-data", priority: "medium", difficulty: "medium",
          title: `Structured data issue${item.types.length ? ` in ${item.types.join(", ")}` : ""}`,
          cause: item.parseError ? "The JSON-LD block isn't valid JSON." : item.validation.errors.map((e) => e.message).join("; ") || "Missing required properties.",
          impact: "Invalid schema is ignored by search engines, so the rich result won't show.",
          fix: item.parseError ? "Fix the JSON syntax (validate it in GigAI's JSON-LD Validator)." : "Add the missing required properties flagged for this type.",
        });
      }
    }
  }
  // Always include a cache education card, the signature insight of this tool.
  add({
    id: "cache-awareness", severity: "info", category: "cache", priority: "medium", difficulty: "easy",
    title: "Updated your tags but social still shows the OLD preview?",
    cause: "Every platform caches the preview it first scraped for a URL (Facebook & Teams the longest). Changing og:image doesn't refresh their copy.",
    impact: "Your fresh image/title won't appear on already-shared links until each platform re-scrapes.",
    fix: "Force a re-scrape per platform (Facebook Sharing Debugger, LinkedIn Post Inspector, Telegram @WebpageBot) or share a versioned URL (add ?v=2) so it's treated as new.",
  });

  const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const sev: Record<Severity, number> = { error: 0, warn: 1, info: 2 };
  return d.sort((a, b) => rank[a.priority] - rank[b.priority] || sev[a.severity] - sev[b.severity]);
}

/* ── Scores ────────────────────────────────────────────────────────────────*/

function computeScores(m: ExtractedMeta, sd: StructuredDataItem[], metaAudit: MetaAudit): InspectorScores {
  const r = resolveShareValues(m);
  // Social: presence + quality of OG/Twitter essentials.
  let social = 100;
  if (!m.og["title"]) social -= 18;
  if (!m.og["description"]) social -= 10;
  if (!m.og["image"] && !m.twitter["image"]) social -= 34;
  if (!m.twitter["card"]) social -= 14;
  if (!m.og["url"] && !m.canonical) social -= 8;
  if (r.imageIsHttps === false) social -= 16;

  // Image: HTTPS + absolute + present (runtime dimension checks add later in UI).
  let image = 100;
  if (!r.image) image = 30;
  else {
    if (r.imageIsHttps === false) image -= 40;
    if (/^\//.test(r.image)) image -= 40;
  }

  // Metadata: reuse the existing meta audit score.
  const metadata = metaAudit.score;

  // SEO: title/desc/canonical/robots/viewport + structured data presence.
  let seo = 100;
  const t = m.title?.length ?? 0;
  if (t === 0) seo -= 20; else if (t < 30 || t > 65) seo -= 8;
  const dsc = m.description?.length ?? 0;
  if (dsc === 0) seo -= 16; else if (dsc < 80 || dsc > 170) seo -= 6;
  if (!m.canonical) seo -= 8;
  if ((m.robots ?? "").toLowerCase().includes("noindex")) seo -= 20;
  if (!m.viewport) seo -= 6;
  if (sd.length === 0) seo -= 10; else if (sd.some((s) => !s.validation.ok)) seo -= 6;

  const clampScore = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const s = { social: clampScore(social), seo: clampScore(seo), image: clampScore(image), metadata: clampScore(metadata) };
  const overall = Math.round((s.social * 0.35 + s.seo * 0.25 + s.image * 0.2 + s.metadata * 0.2));
  return { ...s, overall: clampScore(overall) };
}

/* ── Public: inspectHtml ───────────────────────────────────────────────────*/

/** Analyse a page's HTML into a full social-share inspection. Pure, on-device. */
export function inspectHtml(html: string, opts?: { headers?: string }): SocialInspection {
  const extracted = extractMetaFromHtml(html);
  const metaAudit = analyzeMetaFromHtml(html);
  const structuredData = extractJsonLd(html);
  const r = resolveShareValues(extracted);

  const og = ogModel({
    title: extracted.og["title"] || extracted.title,
    description: extracted.og["description"] || extracted.description,
    image: extracted.og["image"],
    url: r.url,
    siteName: extracted.og["site_name"],
    type: extracted.og["type"],
  });
  const twitter = twitterModel({
    card: (extracted.twitter["card"] as "summary" | "summary_large_image" | undefined),
    title: extracted.twitter["title"] || extracted.og["title"] || extracted.title,
    description: extracted.twitter["description"] || extracted.og["description"] || extracted.description,
    image: extracted.twitter["image"] || extracted.og["image"],
    url: r.url,
    site: extracted.twitter["site"],
  });

  const platforms = buildPlatformPreviews(extracted);
  const diagnostics = buildDiagnostics(extracted, structuredData);
  const scores = computeScores(extracted, structuredData, metaAudit);

  const result: SocialInspection = {
    extracted, metaAudit, og, twitter, resolved: r, platforms, structuredData, diagnostics, scores,
  };

  if (opts?.headers && opts.headers.trim()) {
    const parsed = parseHttpHeaders(opts.headers);
    const security = analyzeSecurityHeaders(parsed.map);
    result.headers = { parsed, security };
  }
  return result;
}

/* ── Image inspection (opt-in, async, network) ─────────────────────────────*/

export interface ImageCheck {
  url: string;
  status: "good" | "warn" | "bad";
  exists: boolean;
  https: boolean;
  width?: number;
  height?: number;
  ratio?: string;
  bytes?: number;
  contentType?: string;
  /** Whether we could measure dimensions (cross-origin dims work; bytes may not). */
  measured: boolean;
  messages: string[];
}

/** Load an image URL and measure it in-browser (dimensions work cross-origin). */
export async function inspectImageUrl(url: string): Promise<ImageCheck> {
  const https = /^https:\/\//i.test(url);
  const check: ImageCheck = { url, status: "good", exists: false, https, measured: false, messages: [] };
  if (typeof Image === "undefined") return check;

  // Dimensions via <img> (works even when the host blocks CORS reads).
  await new Promise<void>((resolve) => {
    const img = new Image();
    const done = () => resolve();
    const timer = setTimeout(done, 8000);
    img.onload = () => {
      clearTimeout(timer);
      check.exists = true;
      check.measured = true;
      check.width = img.naturalWidth;
      check.height = img.naturalHeight;
      if (img.naturalWidth && img.naturalHeight) {
        check.ratio = ratioLabel(img.naturalWidth, img.naturalHeight);
      }
      done();
    };
    img.onerror = () => { clearTimeout(timer); done(); };
    img.src = url;
  });

  // Best-effort byte size + content-type (may be CORS-blocked).
  try {
    const res = await fetch(url, { method: "GET", mode: "cors" });
    const type = res.headers.get("content-type");
    if (type) check.contentType = type;
    const blob = await res.blob();
    check.bytes = blob.size;
    if (!check.exists) check.exists = res.ok;
  } catch {
    check.messages.push("Couldn't read the file size (the image host blocks cross-origin reads). Dimensions are still accurate.");
  }

  // Verdict.
  if (!check.exists) { check.status = "bad"; check.messages.unshift("The image URL didn't load: check it's public and correct."); return check; }
  if (!https) { check.status = "bad"; check.messages.unshift("Not served over HTTPS. Platforms will drop it."); }
  if (check.width && check.height) {
    if (check.width < 200 || check.height < 200) { check.status = "bad"; check.messages.push(`${check.width}×${check.height} is below the 200×200 minimum, platforms may ignore it.`); }
    else if (check.width < 600) { if (check.status === "good") check.status = "warn"; check.messages.push(`${check.width}×${check.height} is small: aim for 1200×630 for a crisp large card.`); }
    else { check.messages.push(`${check.width}×${check.height} (${check.ratio}), good for a large card.`); }
  }
  if (check.bytes && check.bytes > 5 * 1024 * 1024) { if (check.status === "good") check.status = "warn"; check.messages.push("Over 5 MB: some platforms (and WhatsApp) may skip a heavy image. Compress it."); }
  return check;
}

function ratioLabel(w: number, h: number): string {
  const g = gcd(w, h);
  const rw = w / g, rh = h / g;
  if (rw > 40 || rh > 40) return `${(w / h).toFixed(2)}:1`;
  return `${rw}:${rh}`;
}
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

/* ── Report export ─────────────────────────────────────────────────────────*/

/** Machine-readable JSON report (no page content stored. This is client-only). */
export function inspectionToJson(url: string, i: SocialInspection): string {
  return JSON.stringify(
    {
      url,
      generatedAt: new Date().toISOString(),
      scores: i.scores,
      resolved: i.resolved,
      openGraph: i.extracted.og,
      twitter: i.extracted.twitter,
      meta: {
        title: i.extracted.title, description: i.extracted.description, canonical: i.extracted.canonical,
        robots: i.extracted.robots, viewport: i.extracted.viewport, charset: i.extracted.charset, language: i.extracted.language,
      },
      structuredData: i.structuredData.map((s) => ({ types: s.types, valid: s.validation.ok })),
      diagnostics: i.diagnostics,
    },
    null, 2,
  );
}

/** Flat CSV of the diagnostics (the most spreadsheet-friendly view). */
export function inspectionToCsv(i: SocialInspection): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = [["priority", "severity", "category", "problem", "cause", "impact", "fix"].join(",")];
  for (const d of i.diagnostics) {
    rows.push([d.priority, d.severity, d.category, d.title, d.cause, d.impact, d.fix].map(esc).join(","));
  }
  return rows.join("\n");
}

/**
 * Self-contained, branded report HTML that matches the GigAI look. This is the
 * source for the downloadable PDF (rendered via html2canvas), so it is
 * deliberately LIGHT-ONLY and uses table-based layout + solid colors: the
 * things html2canvas rasterises reliably (no dark-mode media query, no SVG rings
 * or CSS transforms that the rasteriser drops).
 */
export function inspectionToHtmlReport(url: string, i: SocialInspection): string {
  const host = domainOf(url) || "page";
  const date = new Date().toLocaleString();
  const s = i.scores;
  const col = (n: number) => (n >= 85 ? "#10b981" : n >= 60 ? "#f59e0b" : "#ef4444");

  // One score tile, a bordered box with a big colored number and a fill bar.
  const tile = (label: string, v: number, big = false): string =>
    `<td style="padding:0 5px;vertical-align:top;text-align:center">
      <div style="border:1px solid #e6e8ef;border-radius:14px;padding:${big ? "16px 10px" : "14px 8px"};background:${big ? "#faf5ff" : "#ffffff"}">
        <div style="font-size:${big ? 34 : 26}px;font-weight:800;color:${col(v)};line-height:1">${v}</div>
        <div style="margin-top:7px;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:#64748b;font-weight:700">${label}</div>
        <div style="margin-top:9px;height:6px;border-radius:99px;background:#eef1f6;overflow:hidden">
          <div style="height:6px;width:${Math.max(0, Math.min(100, v))}%;background:${col(v)}"></div>
        </div>
      </div>
    </td>`;

  const sev: Record<string, { c: string; bg: string; label: string }> = {
    error: { c: "#ef4444", bg: "#fef2f2", label: "Error" },
    warn: { c: "#f59e0b", bg: "#fffbeb", label: "Warning" },
    info: { c: "#6366f1", bg: "#eef2ff", label: "Info" },
  };
  const prioC: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#94a3b8" };

  const cell = (label: string, value: string, accent?: boolean): string =>
    `<td style="width:33.3%;vertical-align:top;padding:0 12px 0 0">
      <div style="font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:${accent ? "#8b5cf6" : "#94a3b8"};margin-bottom:3px">${label}</div>
      <div style="font-size:13px;color:#334155;line-height:1.5">${escapeHtml(value) || "&mdash;"}</div>
    </td>`;

  const diag = (d: Diagnostic): string => {
    const m = sev[d.severity] ?? sev.info!;
    return `<div style="border:1px solid #e6e8ef;border-left:4px solid ${m.c};border-radius:12px;padding:14px 16px;margin-bottom:10px;background:#ffffff">
      <div style="margin-bottom:10px">
        <span style="font-weight:700;font-size:14px;color:#0f172a">${escapeHtml(d.title)}</span>
        <span style="display:inline-block;margin-left:8px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:${prioC[d.priority]};border:1px solid ${prioC[d.priority]};border-radius:99px;padding:2px 8px">${d.priority}</span>
        <span style="display:inline-block;margin-left:5px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:${m.c};background:${m.bg};border-radius:99px;padding:2px 8px">${m.label}</span>
      </div>
      <table style="width:100%;border-collapse:collapse"><tr>${cell("Why", d.cause)}${cell("Impact", d.impact)}${cell("Fix", d.fix, true)}</tr></table>
    </div>`;
  };

  const tagRows = (obj: Record<string, string>, prefix: string): string =>
    Object.entries(obj)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 8px;border-bottom:1px solid #eef1f6;color:#64748b;font-family:monospace;font-size:11px;vertical-align:top;white-space:nowrap">${prefix}${escapeHtml(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #eef1f6;color:#334155;font-size:12px;vertical-align:top;word-break:break-word">${escapeHtml(v)}</td></tr>`,
      )
      .join("") || `<tr><td colspan="2" style="padding:8px;color:#94a3b8;font-size:12px">None found</td></tr>`;

  const found = i.resolved;
  const foundRows = [
    ["Title", found.title],
    ["Description", found.description],
    ["Share image", found.image],
    ["Canonical", i.extracted.canonical],
  ] as const;

  const card = (inner: string): string =>
    `<div style="border:1px solid #e6e8ef;border-radius:18px;padding:22px;margin:16px 0;background:#ffffff">${inner}</div>`;
  const h2 = (t: string): string =>
    `<div style="font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#64748b;margin:0 0 16px">${t}</div>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Social Share Report, ${escapeHtml(host)}</title></head>
<body style="margin:0;background:#ffffff;color:#0f172a;font-family:Arial,Helvetica,'Segoe UI',sans-serif;font-size:14px;line-height:1.6">
 <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#ffffff;padding:34px 44px">
 <div style="font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;opacity:.85">GigAI Tools &middot; Social Share Inspector</div>
 <div style="margin:8px 0 6px;font-size:28px;font-weight:800;letter-spacing:-.5px">Social share report</div>
 <div style="opacity:.92;font-size:13px;word-break:break-all">${escapeHtml(url || "(pasted HTML)")} &middot; ${escapeHtml(date)}</div>
 </div>
 <div style="padding:8px 44px 48px">
 ${card(
 `${h2(`Scores`)}<table style="width:100%;border-collapse:separate;table-layout:fixed"><tr>${tile("Overall", s.overall, true)}${tile("Social", s.social)}${tile("SEO", s.seo)}${tile("Image", s.image)}${tile("Metadata", s.metadata)}</tr></table>`,
    )}
    ${card(
      `${h2(`What we found`)}<table style="width:100%;border-collapse:collapse">${foundRows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;vertical-align:top;white-space:nowrap;width:110px">${k}</td><td style="padding:6px 0;color:#334155;font-size:13px;vertical-align:top;word-break:break-word">${escapeHtml(v ?? "") || "&mdash;"}</td></tr>`,
        )
        .join("")}</table>`,
    )}
    ${card(`${h2(`Diagnostics · ${i.diagnostics.length}`)}${i.diagnostics.map(diag).join("") || '<div style="color:#64748b;font-size:13px">No issues found. This page shares cleanly.</div>'}`)}
    ${card(
      `${h2(`Extracted tags`)}<table style="width:100%;border-collapse:collapse"><tr>
        <td style="width:50%;vertical-align:top;padding-right:12px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748b;margin-bottom:6px">Open Graph</div><table style="width:100%;border-collapse:collapse">${tagRows(i.extracted.og, "og:")}</table></td>
        <td style="width:50%;vertical-align:top;padding-left:12px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748b;margin-bottom:6px">Twitter Card</div><table style="width:100%;border-collapse:collapse">${tagRows(i.extracted.twitter, "twitter:")}</table></td>
      </tr></table>`,
    )}
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:22px">Generated locally by GigAI Social Share Inspector. Nothing was uploaded.</div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
