/**
 * GigAI Workspace: the SEO / META COCKPIT (client island).
 *
 * Unlike the Image and PDF workspaces, SEO work is NOT a per-file pipeline: the
 * user fills ONE form of page facts (title, description, URL, site name, image,
 * type, twitter handle, robots…) ONCE, and this screen live-generates, side by
 * side, EVERY output at the same time:
 *
 *   • <title> + primary <meta> tags        (lib/seo-tools/meta.ts)
 *   • Open Graph tags                       (lib/seo-tools/meta.ts)
 *   • Twitter Card tags                     (lib/seo-tools/meta.ts)
 *   • JSON-LD schema (WebPage/Article/Org)  (lib/seo-tools/schema.ts)
 *   • robots.txt                            (lib/seo-tools/robots.ts)
 *   • sitemap <url> snippet                 (lib/seo-tools/sitemap.ts)
 *
 * …PLUS a LIVE preview column: a pixel-aware Google SERP snippet (desktop +
 * mobile) and faithful Open Graph / Twitter social cards (lib/seo-tools/
 * preview.ts). Length counters + validation come straight from the engines
 * (titleDescriptionScore, ogModel/twitterModel warnings, validateJsonLd).
 *
 * It therefore does NOT mount the generic <WorkspaceShell> (that shell is built
 * around a single-image <img> preview + per-file steps). Instead it adapts the
 * same visual language, the same rounded-2xl bordered card, header, and panels
 * - around ONE form + a wall of generated artifacts. Every output has
 * copy-to-clipboard and download.
 *
 * REUSE, DON'T REIMPLEMENT. Every artifact is produced by an existing
 * client-side engine, dynamic-imported INSIDE the recompute effect so the
 * initial bundle stays small (the whole lib/seo-tools set is pure string
 * generation (no heavy WASM) but we still code-split it out of the island's
 * first paint). The SERP / social previews are rendered from the engine's
 * models, not re-derived by hand.
 *
 * HONEST LIMITS (surfaced in the UI, never faked):
 *   • This is GENERATION + PREVIEW from the facts you type. It does NOT crawl or
 *  fetch a live URL. There is no server (static export), so nothing you enter
 *     ever leaves your browser.
 *   • The SERP preview is a pixel-WIDTH heuristic (Google truncates by rendered
 *     width, which we approximate); treat the truncation warnings as guidance.
 *  • The social card renders the image URL you give directly from that URL -
 *     it is the real remote image, shown as a browser would, not a re-hosted copy.
 *   • JSON-LD validation is a pragmatic linter (required/recommended props per
 *     @type), not a full schema.org shape validator.
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { useFileDrop } from "@/lib/workspace/use-file-drop";
import { DropOverlay } from "@/components/workspace/drop-overlay";

/* ── Types ──────────────────────────────────────────────────────────────── */

type SchemaType = "WebPage" | "Article" | "Organization";
type TwitterCard = "summary" | "summary_large_image";
type SerpDevice = "desktop" | "mobile";
type SocialPlatform = "facebook" | "twitter";

/** The ONE set of page facts that drives every output. */
interface Facts {
  title: string;
  description: string;
  url: string;
  siteName: string;
  image: string;
  imageAlt: string;
  type: string; // og:type: website / article / product…
  twitterCard: TwitterCard;
  twitterSite: string;
  twitterCreator: string;
  robots: string;
  author: string;
  // Schema.
  schemaType: SchemaType;
  datePublished: string;
  // Sitemap.
  changefreq: string;
  priority: string;
}

const INITIAL: Facts = {
  title: "",
  description: "",
  url: "",
  siteName: "",
  image: "",
  imageAlt: "",
  type: "website",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
  robots: "",
  author: "",
  schemaType: "WebPage",
  datePublished: "",
  changefreq: "weekly",
  priority: "0.8",
};

/** A preset the user can load to see every output populated at once. */
interface Preset {
  label: string;
  icon: string;
  value: Facts;
}

const PRESETS: ReadonlyArray<Preset> = [
  {
    label: "Blog article",
    icon: "FileText",
    value: {
      ...INITIAL,
      title: "How to Write Meta Descriptions That Get Clicks in 2026",
      description:
        "A practical, example-driven guide to writing meta descriptions that fit Google's snippet, match search intent and lift your click-through rate. No fluff.",
      url: "https://example.com/blog/meta-descriptions-that-get-clicks",
      siteName: "Example Blog",
      image: "https://example.com/images/meta-descriptions-cover.png",
      imageAlt: "A search result with a highlighted description",
      type: "article",
      twitterSite: "@example",
      twitterCreator: "@jordanrivera",
      author: "Jordan Rivera",
      schemaType: "Article",
      datePublished: "2026-06-01",
      changefreq: "monthly",
      priority: "0.7",
    },
  },
  {
    label: "SaaS landing",
    icon: "Rocket",
    value: {
      ...INITIAL,
      title: "Fathom: Privacy-First Web Analytics Without Cookies",
      description:
        "Fathom is simple, fast, GDPR-compliant website analytics with no cookies and no consent banners. See what matters in one clean dashboard. Start free.",
      url: "https://usefathom.example.com/",
      siteName: "Fathom Analytics",
      image: "https://usefathom.example.com/og/home-1200x630.png",
      imageAlt: "The Fathom analytics dashboard",
      type: "website",
      twitterSite: "@usefathom",
      schemaType: "Organization",
      changefreq: "weekly",
      priority: "1.0",
    },
  },
  {
    label: "Product page",
    icon: "ShoppingBag",
    value: {
      ...INITIAL,
      title: "Aera Merino Wool Runner, Lightweight Everyday Sneaker",
      description:
        "The Aera Merino Wool Runner is a breathable, machine-washable everyday sneaker made from responsibly-sourced merino. Free shipping and 30-day returns.",
      url: "https://shop.example.com/products/aera-merino-runner",
      siteName: "Aera",
      image: "https://shop.example.com/images/aera-runner-1200x630.jpg",
      imageAlt: "Aera Merino Wool Runner sneaker in oatmeal",
      type: "product",
      twitterSite: "@aera",
      robots: "index, follow",
      schemaType: "WebPage",
      changefreq: "daily",
      priority: "0.9",
    },
  },
];

/* ── Engine-typed derived outputs (mirrors of the seo-tools return shapes) ── */

/** From meta.ts `titleDescriptionScore`. */
interface FieldScore {
  length: number;
  score: number;
  status: "good" | "warn" | "bad" | "empty";
  message: string;
}
interface Scores {
  title: FieldScore;
  description: FieldScore;
  score: number;
}

/** From preview.ts `serpSnippet`. */
interface TruncationResult {
  display: string;
  truncated: boolean;
  pixels: number;
  limit: number;
}
interface SerpSnippet {
  device: SerpDevice;
  title: TruncationResult;
  description: TruncationResult;
  displayUrl: string;
}

/** From preview.ts `ogModel` / `twitterModel`. */
interface OgModel {
  title: string;
  description: string;
  image?: string;
  domain: string;
  siteName?: string;
  hasImage: boolean;
  warnings: string[];
}
interface TwitterModel {
  card: TwitterCard;
  title: string;
  description: string;
  image?: string;
  domain: string;
  site?: string;
  large: boolean;
  warnings: string[];
}

/** From schema.ts `validateJsonLd`. */
interface SchemaValidation {
  ok: boolean;
  types: string[];
  errors: { path?: string; message: string }[];
  warnings: { path?: string; message: string }[];
}

/** The whole live-generated bundle, recomputed whenever the facts change. */
interface Generated {
  metaTags: string;
  openGraph: string;
  twitterTags: string;
  schema: string;
  robotsTxt: string;
  sitemapSnippet: string;
  scores: Scores;
  serp: Record<SerpDevice, SerpSnippet>;
  og: OgModel;
  twitter: TwitterModel;
  schemaValidation: SchemaValidation;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Download a text artifact as a file (revoking the object URL after). */
function downloadText(text: string, name: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read an uploaded HTML file's text (used to prefill facts from a page). */
function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsText(file);
  });
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function SeoWorkspace() {
  const [facts, setFacts] = React.useState<Facts>(INITIAL);
  const [gen, setGen] = React.useState<Generated | null>(null);
  const [device, setDevice] = React.useState<SerpDevice>("desktop");
  const [platform, setPlatform] = React.useState<SocialPlatform>("facebook");
  const [note, setNote] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const set = React.useCallback(
    <K extends keyof Facts>(key: K) =>
      (value: Facts[K]) =>
        setFacts((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // Live-regenerate every output whenever the facts change. The engines are
  // dynamic-imported here so lib/seo-tools stays out of the island's first paint.
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [meta, schema, robots, sitemap, preview] = await Promise.all([
        import("@/lib/seo-tools/meta"),
        import("@/lib/seo-tools/schema"),
        import("@/lib/seo-tools/robots"),
        import("@/lib/seo-tools/sitemap"),
        import("@/lib/seo-tools/preview"),
      ]);
      if (cancelled) return;

      const url = facts.url.trim();

      // ── Primary <meta> + <title>.
      const metaTags = meta.buildMetaTags({
        title: facts.title,
        description: facts.description,
        robots: facts.robots,
        canonical: url || undefined,
        author: facts.author,
        viewport: "width=device-width, initial-scale=1",
        charset: "UTF-8",
      });

      // ── Open Graph.
      const openGraph = meta.buildOpenGraph({
        title: facts.title,
        description: facts.description,
        type: facts.type,
        url: url || undefined,
        image: facts.image,
        imageAlt: facts.imageAlt,
        siteName: facts.siteName,
      });

      // ── Twitter Card.
      const twitterTags = meta.buildTwitterCard({
        card: facts.twitterCard,
        title: facts.title,
        description: facts.description,
        image: facts.image,
        imageAlt: facts.imageAlt,
        site: facts.twitterSite,
        creator: facts.twitterCreator,
      });

      // ── JSON-LD schema (type-driven).
      let schemaOut: string;
      if (facts.schemaType === "Article") {
        schemaOut = schema.buildArticle({
          headline: facts.title || "Untitled",
          description: facts.description,
          image: facts.image || undefined,
          authorName: facts.author || undefined,
          publisherName: facts.siteName || undefined,
          publisherLogo: facts.image || undefined,
          datePublished: facts.datePublished || undefined,
          url: url || undefined,
          type: "Article",
        }).scriptTag;
      } else if (facts.schemaType === "Organization") {
        schemaOut = schema.buildOrganization({
          name: facts.siteName || facts.title || "Untitled",
          url: url || undefined,
          logo: facts.image || undefined,
          description: facts.description || undefined,
        }).scriptTag;
      } else {
        schemaOut = schema.buildGeneric("WebPage", {
          name: facts.title || undefined,
          description: facts.description || undefined,
          url: url || undefined,
          image: facts.image || undefined,
          inLanguage: "en",
        }).scriptTag;
      }

      // ── robots.txt.
      const robotsTxt = robots.generateRobots({
        groups: [
          {
            userAgent: "*",
            ...(/noindex/i.test(facts.robots)
              ? { disallow: ["/"] }
              : { allow: ["/"] }),
          },
        ],
        ...(url
          ? { sitemaps: [`${url.replace(/\/+$/, "")}/sitemap.xml`] }
          : {}),
      });

      // ── Sitemap <url> snippet (a single entry the user can paste into a set).
      const sitemapSnippet = url
        ? sitemap.generateXmlSitemap([
            {
              loc: url,
              lastmod: facts.datePublished || new Date().toISOString().slice(0, 10),
              changefreq: facts.changefreq as never,
              priority: facts.priority,
            },
          ])
        : sitemap.generateXmlSitemap([]);

      // ── Counters / validation / preview models (all engine-derived).
      const scores = meta.titleDescriptionScore(facts.title, facts.description);
      const serp = preview.serpSnippets({
        title: facts.title,
        url: url || "https://example.com/page",
        desc: facts.description,
      });
      const og = preview.ogModel({
        title: facts.title,
        description: facts.description,
        image: facts.image || undefined,
        url: url || undefined,
        siteName: facts.siteName || undefined,
        type: facts.type,
      });
      const twitter = preview.twitterModel({
        card: facts.twitterCard,
        title: facts.title,
        description: facts.description,
        image: facts.image || undefined,
        url: url || undefined,
        site: facts.twitterSite || undefined,
      });
      const schemaValidation = schema.validateJsonLd(
        // Validate the JSON-LD object (strip the <script> wrapper).
        schemaOut.replace(/^<script[^>]*>\s*|\s*<\/script>$/g, ""),
      );

      setGen({
        metaTags,
        openGraph,
        twitterTags,
        schema: schemaOut,
        robotsTxt,
        sitemapSnippet,
        scores,
        serp,
        og,
        twitter,
        schemaValidation,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [facts]);

  const loadPreset = React.useCallback((p: Preset) => {
    setFacts(p.value);
    setNote(`Loaded the “${p.label}” preset.`);
  }, []);

  const reset = React.useCallback(() => {
    setFacts(INITIAL);
    setNote(null);
  }, []);

  /** Prefill facts by reading an HTML file the user drops / picks (local only). */
  const importFromHtml = React.useCallback(async (files: File[] | FileList) => {
    const file = Array.from(files).find(
      (f) => /\.html?$/i.test(f.name) || f.type === "text/html",
    );
    if (!file) {
      setNote("Drop an .html file to read its existing meta tags.");
      return;
    }
    try {
      const html = await readFileText(file);
      const { extractMetaFromHtml } = await import("@/lib/seo-tools/meta");
      const ex = extractMetaFromHtml(html);
      setFacts((prev) => ({
        ...prev,
        title: ex.title ?? prev.title,
        description: ex.description ?? prev.description,
        url: ex.canonical ?? ex.og["url"] ?? prev.url,
        siteName: ex.og["site_name"] ?? prev.siteName,
        image: ex.og["image"] ?? prev.image,
        imageAlt: ex.og["image:alt"] ?? prev.imageAlt,
        type: ex.og["type"] ?? prev.type,
        robots: ex.robots ?? prev.robots,
        author: ex.author ?? prev.author,
        twitterSite: ex.twitter["site"] ?? prev.twitterSite,
        twitterCreator: ex.twitter["creator"] ?? prev.twitterCreator,
        twitterCard:
          ex.twitter["card"] === "summary" ? "summary" : prev.twitterCard,
      }));
      setNote(`Imported meta from “${file.name}”. Everything below regenerated.`);
    } catch {
      setNote("Couldn't read that file.");
    }
  }, []);

  // Whole-page drop: dropping an HTML file prefills the form from its tags.
  const { isDragging } = useFileDrop((files) => void importFromHtml(files));

  const hasInput = facts.title.trim() !== "" || facts.description.trim() !== "";

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="relative flex h-[min(82vh,940px)] min-h-[600px] w-full flex-col overflow-hidden max-md:h-auto max-md:min-h-0 max-md:overflow-visible rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <DropOverlay show={isDragging} label="Drop an .html file to import its meta tags" />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name="Search" size={16} />
          </span>
          <h2 className="truncate text-sm font-semibold">SEO Workspace</h2>
          {gen ? (
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">
              · SEO score {gen.scores.score}/100
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              className="max-md:hidden"
              onClick={() => loadPreset(p)}
              title={`Load the ${p.label} preset`}
            >
              <Icon name={p.icon} size={15} />
              {p.label}
            </Button>
          ))}
          <div className="mx-1 h-5 w-px bg-border max-md:hidden" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import from an HTML file"
            title="Import facts from an .html file"
          >
            <Icon name="FileUp" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            aria-label="Reset"
            title="Clear the form"
          >
            <Icon name="RotateCcw" size={16} />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="text/html,.html,.htm"
            hidden
            onChange={(e) => {
              if (e.target.files) void importFromHtml(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      {/* ── Body: form | outputs | preview ──────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,340px)_1fr_minmax(300px,380px)] overflow-hidden max-lg:grid-cols-1 max-lg:overflow-y-auto">
        {/* LEFT: the ONE form of facts */}
        <FactsForm facts={facts} set={set} />

        {/* CENTER: every generated artifact */}
        <main className="flex min-h-0 flex-col overflow-y-auto bg-muted/20 p-4 max-lg:overflow-visible">
          {gen ? (
            <div className="flex flex-col gap-4">
              <OutputCard
                icon="Code"
                title="Meta tags"
                subtitle="<title> + primary <meta> for the page <head>"
                code={gen.metaTags}
                lang="html"
                downloadName="meta-tags.html"
                mime="text/html;charset=utf-8"
                empty="Add a title or description to generate meta tags."
              />
              <OutputCard
                icon="Share2"
                title="Open Graph"
                subtitle="Facebook, LinkedIn & the base for X"
                code={gen.openGraph}
                lang="html"
                downloadName="open-graph.html"
                mime="text/html;charset=utf-8"
                warnings={gen.og.warnings}
                empty="Add a title, description or image to generate Open Graph tags."
              />
              <OutputCard
                icon="Twitter"
                title="Twitter / X Card"
                subtitle={`twitter:card = ${gen.twitter.card}`}
                code={gen.twitterTags}
                lang="html"
                downloadName="twitter-card.html"
                mime="text/html;charset=utf-8"
                warnings={gen.twitter.warnings}
                empty="Add a title or description to generate Twitter Card tags."
              />
              <OutputCard
                icon="Braces"
                title={`JSON-LD schema · ${facts.schemaType}`}
                subtitle="Structured data for rich results"
                code={gen.schema}
                lang="json"
                downloadName="schema.jsonld"
                mime="application/ld+json"
                validation={gen.schemaValidation}
              />
              <OutputCard
                icon="Bot"
                title="robots.txt"
                subtitle="Crawler directives + sitemap reference"
                code={gen.robotsTxt}
                lang="text"
                downloadName="robots.txt"
                mime="text/plain;charset=utf-8"
              />
              <OutputCard
                icon="Map"
                title="Sitemap URL snippet"
                subtitle="A single <url> entry to paste into your sitemap.xml"
                code={gen.sitemapSnippet}
                lang="xml"
                downloadName="sitemap-snippet.xml"
                mime="application/xml"
                empty="Add a URL to generate a sitemap entry."
              />

              <HonestyNote />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
              <Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" />
              Loading generators…
            </div>
          )}
        </main>

        {/* RIGHT: live SERP + social previews */}
        <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-l border-border p-4 max-lg:overflow-visible max-lg:border-l-0 max-lg:border-t">
          {gen ? (
            <>
              <ScorePanel scores={gen.scores} />
              <SerpPreview
                snippet={gen.serp[device]}
                device={device}
                onDevice={setDevice}
                empty={!hasInput}
              />
              <SocialPreview
                platform={platform}
                onPlatform={setPlatform}
                og={gen.og}
                twitter={gen.twitter}
              />
            </>
          ) : null}
        </aside>
      </div>

      {/* ── Bottom status bar ────────────────────────────────────── */}
      <footer className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs">
        {note ? (
          <span className="flex items-center gap-2 text-foreground">
            <Icon name="Info" size={14} />
            {note}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Fill the facts once. Every output regenerates live. Nothing is
            uploaded; this generates &amp; previews, it does not crawl a live URL.
          </span>
        )}
      </footer>
    </div>
  );
}

/* ── Left column: the single form of facts ─────────────────────────────── */

const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

function FactsForm({
  facts,
  set,
}: {
  facts: Facts;
  set: <K extends keyof Facts>(key: K) => (value: Facts[K]) => void;
}) {
  return (
    <form
      className="flex min-h-0 flex-col gap-3 overflow-y-auto border-r border-border p-4 max-lg:overflow-visible max-lg:border-r-0 max-lg:border-b"
      onSubmit={(e) => e.preventDefault()}
    >
      <SectionHead icon="Search">Page facts</SectionHead>

      <TextField
        id="seo-title"
        label="Title"
        hint="The blue link in Google. Aim for 50–60 characters."
        value={facts.title}
        onChange={set("title")}
        placeholder="Meta Tag Generator, SEO, Open Graph & Twitter Cards"
      />
      <TextareaField
        id="seo-desc"
        label="Description"
        hint="The snippet under the title. Aim for 150–160 characters."
        value={facts.description}
        onChange={set("description")}
        placeholder="Generate SEO meta, Open Graph, Twitter Card, JSON-LD, robots.txt and a sitemap entry, with a live Google + social preview…"
      />
      <TextField
        id="seo-url"
        label="Page URL"
        hint="Used as canonical, og:url, sitemap loc and the schema URL."
        value={facts.url}
        onChange={set("url")}
        placeholder="https://example.com/page"
        type="url"
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="seo-site"
          label="Site name"
          value={facts.siteName}
          onChange={set("siteName")}
          placeholder="Example"
        />
        <TextField
          id="seo-author"
          label="Author"
          value={facts.author}
          onChange={set("author")}
          placeholder="Jane Doe"
        />
      </div>
      <TextField
        id="seo-image"
        label="Share image URL"
        hint="A public https URL. 1200×630px makes the best large card."
        value={facts.image}
        onChange={set("image")}
        placeholder="https://example.com/og-image.png"
        type="url"
      />
      <TextField
        id="seo-image-alt"
        label="Image alt"
        value={facts.imageAlt}
        onChange={set("imageAlt")}
        placeholder="Description of the share image"
      />

      <SectionHead icon="Share2">Social &amp; type</SectionHead>
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          id="seo-type"
          label="og:type"
          value={facts.type}
          onChange={set("type")}
          options={[
            { value: "website", label: "website" },
            { value: "article", label: "article" },
            { value: "product", label: "product" },
            { value: "profile", label: "profile" },
            { value: "video.other", label: "video" },
          ]}
        />
        <SelectField<TwitterCard>
          id="seo-tw-card"
          label="Twitter card"
          value={facts.twitterCard}
          onChange={set("twitterCard")}
          options={[
            { value: "summary_large_image", label: "Large image" },
            { value: "summary", label: "Summary" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="seo-tw-site"
          label="Twitter @site"
          value={facts.twitterSite}
          onChange={set("twitterSite")}
          placeholder="@example"
        />
        <TextField
          id="seo-tw-creator"
          label="Twitter @creator"
          value={facts.twitterCreator}
          onChange={set("twitterCreator")}
          placeholder="@author"
        />
      </div>
      <SelectField
        id="seo-robots"
        label="Robots"
        hint="Leave default to index, follow."
        value={facts.robots}
        onChange={set("robots")}
        options={[
          { value: "", label: "index, follow (default)" },
          { value: "noindex, follow", label: "noindex, follow" },
          { value: "index, nofollow", label: "index, nofollow" },
          { value: "noindex, nofollow", label: "noindex, nofollow" },
          { value: "noarchive", label: "noarchive" },
        ]}
      />

      <SectionHead icon="Braces">Schema &amp; sitemap</SectionHead>
      <SelectField<SchemaType>
        id="seo-schema"
        label="JSON-LD @type"
        value={facts.schemaType}
        onChange={set("schemaType")}
        options={[
          { value: "WebPage", label: "WebPage" },
          { value: "Article", label: "Article" },
          { value: "Organization", label: "Organization" },
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="seo-date"
          label="Date published"
          hint="Article schema + sitemap lastmod."
          value={facts.datePublished}
          onChange={set("datePublished")}
          placeholder="2026-06-01"
          type="date"
        />
        <SelectField
          id="seo-freq"
          label="Change freq"
          value={facts.changefreq}
          onChange={set("changefreq")}
          options={[
            { value: "always", label: "always" },
            { value: "hourly", label: "hourly" },
            { value: "daily", label: "daily" },
            { value: "weekly", label: "weekly" },
            { value: "monthly", label: "monthly" },
            { value: "yearly", label: "yearly" },
            { value: "never", label: "never" },
          ]}
        />
      </div>
      <TextField
        id="seo-priority"
        label="Sitemap priority"
        hint="0.0–1.0"
        value={facts.priority}
        onChange={set("priority")}
        placeholder="0.8"
      />
    </form>
  );
}

/* ── Center: one collapsible output card (code + copy + download) ───────── */

function OutputCard({
  icon,
  title,
  subtitle,
  code,
  lang,
  downloadName,
  mime,
  warnings,
  validation,
  empty,
}: {
  icon: string;
  title: string;
  subtitle: string;
  code: string;
  lang: string;
  downloadName: string;
  mime: string;
  warnings?: string[];
  validation?: SchemaValidation;
  empty?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const isEmpty = code.trim() === "";

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked: silently ignore */
    }
  }, [code]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name={icon} size={14} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={isEmpty}
            onClick={copy}
            aria-label={`Copy ${title}`}
            title="Copy to clipboard"
          >
            <Icon name={copied ? "Check" : "Copy"} size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={isEmpty}
            onClick={() => downloadText(code, downloadName, mime)}
            aria-label={`Download ${title}`}
            title="Download"
          >
            <Icon name="Download" size={14} />
          </Button>
        </div>
      </header>

      {isEmpty ? (
        <p className="px-3 py-6 text-center text-xs text-muted-foreground">
          {empty ?? "Nothing to generate yet."}
        </p>
      ) : (
        <pre className="max-h-56 overflow-auto bg-muted/40 px-3 py-2.5 text-[11.5px] leading-relaxed">
          <code className={`language-${lang}`}>{code}</code>
        </pre>
      )}

      {validation && !isEmpty ? <ValidationStrip v={validation} /> : null}
      {warnings && warnings.length > 0 ? (
        <ul className="space-y-1 border-t border-border px-3 py-2">
          {warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
              <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Schema validation summary (errors/warnings from validateJsonLd). */
function ValidationStrip({ v }: { v: SchemaValidation }) {
  if (v.ok && v.warnings.length === 0) {
    return (
      <div className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-[11px] text-emerald-600 dark:text-emerald-400">
        <Icon name="CircleCheck" size={12} />
        Valid JSON-LD, required properties present.
      </div>
    );
  }
  return (
    <ul className="space-y-1 border-t border-border px-3 py-2">
      {v.errors.map((e, i) => (
        <li key={`e${i}`} className="flex items-start gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
          <Icon name="CircleX" size={12} className="mt-0.5 shrink-0" />
          <span>{e.path ? `${e.path}: ${e.message}` : e.message}</span>
        </li>
      ))}
      {v.warnings.map((w, i) => (
        <li key={`w${i}`} className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
          <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
          <span>{w.path ? `${w.path}: ${w.message}` : w.message}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Right: score panel + SERP + social previews ────────────────────────── */

const TONE: Record<FieldScore["status"], string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-rose-600 dark:text-rose-400",
  empty: "text-muted-foreground",
};

function ScorePanel({ scores }: { scores: Scores }) {
  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon name="Gauge" size={13} />
          Length &amp; score
        </h3>
        <span className="text-sm font-semibold">{scores.score}/100</span>
      </div>
      <div className="space-y-1.5 text-[11px]">
        <ScoreRow label="Title" f={scores.title} ideal="50–60" />
        <ScoreRow label="Description" f={scores.description} ideal="150–160" />
      </div>
    </section>
  );
}

function ScoreRow({ label, f, ideal }: { label: string; f: FieldScore; ideal: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5">
        <span className="font-medium text-foreground">{label}</span>
        <span className={TONE[f.status]}>{f.length} chars</span>
      </span>
      <span className="text-muted-foreground">ideal {ideal}</span>
    </div>
  );
}

function SerpPreview({
  snippet,
  device,
  onDevice,
  empty,
}: {
  snippet: SerpSnippet;
  device: SerpDevice;
  onDevice: (d: SerpDevice) => void;
  empty: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon name="Search" size={13} />
          Google preview
        </h3>
        <div className="flex overflow-hidden rounded-md border border-border">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDevice(d)}
              className={cn(
                "px-2 py-0.5 text-[11px] capitalize transition-colors",
                device === d ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "rounded-lg border border-border bg-white p-3 dark:bg-zinc-900",
          device === "mobile" ? "max-w-[340px]" : "",
        )}
      >
        <div className="truncate text-[12px] text-[#4d5156] dark:text-zinc-400">
          {snippet.displayUrl || "example.com"}
        </div>
        <div className="mt-0.5 text-[16px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
          {snippet.title.display || (empty ? "Your page title appears here" : "")}
        </div>
        <div className="mt-1 text-[12.5px] leading-snug text-[#4d5156] dark:text-zinc-300">
          {snippet.description.display ||
            (empty ? "Your meta description shows up here in the search-result snippet." : "")}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground">
        <span className={snippet.title.truncated ? "text-amber-600 dark:text-amber-400" : ""}>
          Title {snippet.title.pixels}/{snippet.title.limit}px
          {snippet.title.truncated ? " · truncated" : ""}
        </span>
        <span className={snippet.description.truncated ? "text-amber-600 dark:text-amber-400" : ""}>
          Desc {snippet.description.pixels}/{snippet.description.limit}px
          {snippet.description.truncated ? " · truncated" : ""}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
        Google truncates by rendered pixel width; this is an approximation.
      </p>
    </section>
  );
}

function SocialPreview({
  platform,
  onPlatform,
  og,
  twitter,
}: {
  platform: SocialPlatform;
  onPlatform: (p: SocialPlatform) => void;
  og: OgModel;
  twitter: TwitterModel;
}) {
  const large = platform === "facebook" ? true : twitter.large;
  const image = platform === "facebook" ? og.image : twitter.image;
  const title = (platform === "facebook" ? og.title : twitter.title) || "Your title";
  const description = platform === "facebook" ? og.description : twitter.description;
  const domain = platform === "facebook" ? og.domain : twitter.domain.toUpperCase();
  const warnings = platform === "facebook" ? og.warnings : twitter.warnings;

  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon name="Share2" size={13} />
          Social card
        </h3>
        <div className="flex overflow-hidden rounded-md border border-border">
          {(
            [
              { id: "facebook", label: "OG" },
              { id: "twitter", label: "X" },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPlatform(p.id)}
              className={cn(
                "px-2 py-0.5 text-[11px] transition-colors",
                platform === p.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-zinc-900">
        {large ? (
          image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="aspect-[1200/630] w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex aspect-[1200/630] w-full items-center justify-center bg-muted text-muted-foreground">
              <Icon name="Image" size={28} />
            </div>
          )
        ) : null}
        <div className="flex items-center gap-3 p-2.5">
          {!large ? (
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-muted text-muted-foreground">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                <Icon name="Image" size={18} />
              )}
            </div>
          ) : null}
          <div className="min-w-0">
            {domain ? (
              <div className="truncate text-[10.5px] uppercase text-muted-foreground">
                {domain}
              </div>
            ) : null}
            <div className="truncate text-[13px] font-semibold text-foreground">{title}</div>
            {description ? (
              <div className="line-clamp-2 text-[11.5px] text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {warnings.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-amber-600 dark:text-amber-400">
              <Icon name="TriangleAlert" size={11} className="mt-0.5 shrink-0" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/* ── Shared small inputs ────────────────────────────────────────────────── */

function SectionHead({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon name={icon} size={13} />
      {children}
    </div>
  );
}

function FieldWrap({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[10.5px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <FieldWrap id={id} label={label} hint={hint}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        spellCheck={type === "text"}
      />
    </FieldWrap>
  );
}

function TextareaField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <FieldWrap id={id} label={label} hint={hint}>
      <textarea
        id={id}
        value={value}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "h-auto resize-y py-1.5 leading-snug")}
        spellCheck
      />
    </FieldWrap>
  );
}

function SelectField<T extends string = string>({
  id,
  label,
  hint,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  hint?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <FieldWrap id={id} label={label} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(inputClass, "cursor-pointer")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

/* ── Honesty note ───────────────────────────────────────────────────────── */

function HonestyNote() {
  return (
    <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
      Everything here is generated from the facts you type and stays in your
      browser - nothing is uploaded. This cockpit does <strong>not</strong> crawl
      or fetch a live URL; it generates the tags and previews them. The Google
      preview approximates truncation by pixel width, the social card renders the
      exact image URL you provide, and the JSON-LD check is a pragmatic
      required/recommended linter, not a full schema.org validator.
    </p>
  );
}
