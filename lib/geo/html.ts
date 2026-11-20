/**
 * GigAI GEO engine: HTML document analysis.
 *
 * Parses RAW page HTML (what an AI crawler that doesn't execute JavaScript
 * receives) with DOMParser and extracts everything the GEO tools score:
 * boilerplate-stripped text, the heading tree with per-section text, outbound
 * links, JSON-LD types, and the JS-framework signals that reveal content
 * which only exists after hydration.
 *
 * DOMParser is browser-only, so this module is used from client tool modules
 * (which are ssr:false) — never from server components.
 */

export interface HeadingSection {
  level: number;
  text: string;
  /** Plain text of the content between this heading and the next (any level). */
  sectionText: string;
  /** First paragraph (or paragraph-like block) of the section. */
  firstParagraph: string;
}

export interface OutboundLink {
  href: string;
  host: string;
  text: string;
  rel: string;
}

export interface FrameworkSignal {
  /** Human name, e.g. "Next.js (App Router)". */
  name: string;
  /** The marker found, quoted as evidence. */
  marker: string;
  /** True when the marker implies content is delivered as a JS payload. */
  clientRendered: boolean;
}

export interface GeoDocument {
  title: string;
  metaDescription: string;
  lang: string;
  metaRobots: string;
  /** Words of visible text in the RAW HTML after stripping boilerplate. */
  visibleWords: number;
  /** The boilerplate-stripped main text. */
  mainText: string;
  /** Words inside nav/header/footer/aside (boilerplate). */
  boilerplateWords: number;
  headings: HeadingSection[];
  outboundLinks: OutboundLink[];
  internalLinkCount: number;
  /** `@type` values found in JSON-LD blocks. */
  jsonLdTypes: string[];
  /** Raw parsed JSON-LD objects (for the schema checker). */
  jsonLd: unknown[];
  /** ld+json script blocks that failed to parse as JSON. */
  invalidJsonLdBlocks: number;
  frameworks: FrameworkSignal[];
  /** Estimated words locked inside serialized JS data islands (__NEXT_DATA__ etc.). */
  dataIslandWords: number;
  /** Bytes of script tags vs total document bytes. */
  scriptBytes: number;
  totalBytes: number;
  /** Text inside <noscript> (what the site itself says no-JS visitors get). */
  noscriptText: string;
}

const BOILERPLATE_SELECTOR = "script,style,noscript,template,svg,iframe";
const CHROME_SELECTOR = "nav,header,footer,aside,[role='navigation'],[role='banner'],[role='contentinfo']";

function words(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}

function textOf(el: Element | null): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Extract human-readable strings from a serialized JSON blob (data islands). */
function proseWordsInJson(raw: string): number {
  let count = 0;
  // Strings of 4+ words look like content rather than keys/urls/classnames.
  const strings = raw.match(/"(?:[^"\\]|\\.){30,}"/g) ?? [];
  for (const s of strings) {
    const decoded = s.slice(1, -1).replace(/\\n/g, " ").replace(/\\"/g, '"');
    if (/^https?:\/\//.test(decoded) || decoded.split(/\s+/).length < 4) continue;
    count += words(decoded);
  }
  return count;
}

/** Detect JS frameworks + client-rendering markers from the raw HTML string + DOM. */
function detectFrameworks(html: string, doc: Document): FrameworkSignal[] {
  const found: FrameworkSignal[] = [];
  const add = (name: string, marker: string, clientRendered: boolean) => {
    if (!found.some((f) => f.name === name)) found.push({ name, marker, clientRendered });
  };

  if (html.includes("__NEXT_DATA__")) add("Next.js (Pages Router)", "__NEXT_DATA__ script", true);
  if (html.includes("self.__next_f")) add("Next.js (App Router)", "self.__next_f flight data", true);
  if (html.includes("__NUXT__") || html.includes("nuxt-data")) add("Nuxt", "__NUXT__ payload", true);
  if (doc.querySelector("[ng-version]")) {
    add("Angular", `ng-version="${doc.querySelector("[ng-version]")!.getAttribute("ng-version")}"`, true);
  }
  if (html.includes("__SVELTEKIT")) add("SvelteKit", "__SVELTEKIT payload", true);
  if (html.includes("__remixContext")) add("Remix", "__remixContext payload", true);
  if (doc.querySelector("astro-island")) add("Astro (islands)", "<astro-island>", false);
  if (html.includes("data-reactroot") || html.includes("data-react-helmet")) add("React (SSR)", "data-reactroot", false);
  if (html.includes("wp-content/") || html.includes("wp-json")) add("WordPress", "wp-content asset paths", false);

  // The classic empty-shell SPA markers: a root mount node with no real content.
  for (const id of ["root", "app", "__next", "___gatsby"]) {
    const el = doc.getElementById(id);
    if (el && words(textOf(el)) < 20) {
      add("Client-rendered SPA shell", `<div id="${id}"> contains ${words(textOf(el))} words in raw HTML`, true);
      break;
    }
  }
  return found;
}

/** Parse and analyze a raw HTML document. */
export function analyzeHtml(html: string, baseUrl?: string): GeoDocument {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const totalBytes = html.length;

  // Script weight + data islands, measured BEFORE stripping.
  let scriptBytes = 0;
  let dataIslandWords = 0;
  doc.querySelectorAll("script").forEach((s) => {
    const content = s.textContent ?? "";
    scriptBytes += content.length;
    if (content.length > 500 && /^[{[]/.test(content.trimStart())) {
      dataIslandWords += proseWordsInJson(content);
    }
  });

  // JSON-LD, collected before stripping scripts.
  const jsonLd: unknown[] = [];
  const jsonLdTypes: string[] = [];
  let invalidJsonLdBlocks = 0;
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      const parsed = JSON.parse(s.textContent ?? "");
      const items = Array.isArray(parsed) ? parsed : parsed["@graph"] && Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
      for (const item of items) {
        jsonLd.push(item);
        const t = (item as Record<string, unknown>)["@type"];
        if (typeof t === "string") jsonLdTypes.push(t);
        else if (Array.isArray(t)) for (const tt of t) if (typeof tt === "string") jsonLdTypes.push(tt);
      }
    } catch {
      invalidJsonLdBlocks++;
    }
  });

  const noscriptText = Array.from(doc.querySelectorAll("noscript"))
    .map((n) => textOf(n))
    .join(" ")
    .slice(0, 500);

  const frameworks = detectFrameworks(html, doc);

  // Now strip non-content, then measure chrome vs main.
  doc.querySelectorAll(BOILERPLATE_SELECTOR).forEach((el) => el.remove());
  let boilerplateWords = 0;
  doc.querySelectorAll(CHROME_SELECTOR).forEach((el) => {
    boilerplateWords += words(textOf(el));
    el.remove();
  });

  const main = doc.querySelector("main, article, [role='main']") ?? doc.body;
  const mainText = textOf(main);

  // Outbound links from the content area.
  let pageHost = "";
  try {
    if (baseUrl) pageHost = new URL(baseUrl).hostname.replace(/^www\./, "");
  } catch {
    /* relative-only analysis */
  }
  const outboundLinks: OutboundLink[] = [];
  let internalLinkCount = 0;
  main.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    if (!/^https?:\/\//i.test(href)) {
      internalLinkCount++;
      return;
    }
    try {
      const host = new URL(href).hostname.replace(/^www\./, "");
      if (pageHost && (host === pageHost || host.endsWith(`.${pageHost}`))) {
        internalLinkCount++;
        return;
      }
      outboundLinks.push({ href, host, text: textOf(a).slice(0, 80), rel: a.getAttribute("rel") ?? "" });
    } catch {
      /* malformed href */
    }
  });

  // Heading tree with per-section text.
  const headings: HeadingSection[] = [];
  const headingEls = Array.from(main.querySelectorAll("h1,h2,h3,h4"));
  headingEls.forEach((h, i) => {
    const level = Number(h.tagName.slice(1));
    const parts: string[] = [];
    let firstParagraph = "";
    let node: Element | null = h.nextElementSibling;
    while (node && !(i + 1 < headingEls.length && node === headingEls[i + 1]) && !/^H[1-4]$/.test(node.tagName)) {
      const t = textOf(node);
      if (t) {
        parts.push(t);
        if (!firstParagraph && (node.tagName === "P" || t.length > 40)) firstParagraph = t;
      }
      node = node.nextElementSibling;
    }
    headings.push({ level, text: textOf(h), sectionText: parts.join(" "), firstParagraph });
  });

  return {
    title: textOf(doc.querySelector("title")) || doc.title || "",
    metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "",
    lang: doc.documentElement.getAttribute("lang") ?? "",
    metaRobots: doc.querySelector('meta[name="robots"]')?.getAttribute("content")?.trim() ?? "",
    visibleWords: words(mainText),
    mainText,
    boilerplateWords,
    headings,
    outboundLinks,
    internalLinkCount,
    jsonLdTypes,
    jsonLd,
    invalidJsonLdBlocks,
    frameworks,
    dataIslandWords,
    scriptBytes,
    totalBytes,
    noscriptText,
  };
}

/** True when the input looks like an HTML document rather than plain prose. */
export function looksLikeHtml(input: string): boolean {
  const head = input.slice(0, 2000).toLowerCase();
  return /<!doctype html|<html|<head|<body|<article|<div|<p[ >]|<h[1-6][ >]/.test(head);
}
