"use client";

import * as React from "react";
import { toast } from "sonner";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  SegmentedControl,
  SelectField,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SerpPreview,
  ShareReport,
  SocialCardPreview,
  UrlPrefillBar,
  useDeepLinkUrl,
  type SerpDevice,
  type SocialPlatform,
  type TwitterCardType,
} from "@/components/tool/seo";
import {
  buildMetaTags,
  buildOpenGraph,
  buildTwitterCard,
  titleDescriptionScore,
} from "@/lib/seo-tools/meta";
import { extractPageMeta, metaContent } from "@/lib/seo-tools/schema-seed";

/** Host of a URL, sans www, for share titles. */
function metaHostOf(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Meta Tag Generator, the definitive meta workspace.
 *
 * A single controlled form (`MetaState`) drives three outputs in lockstep: the
 * generated `<head>` code (via `lib/seo-tools/meta.ts`), a pixel-accurate
 * Google SERP snippet, and faithful social share cards. `<GeneratorWithPreview>`
 * owns the toolbar, undo/redo, share links, presets and shortcuts; this module
 * only owns the shape of the data and how it renders. Everything runs in the
 * browser. Nothing typed here is ever uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface MetaState {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  viewport: string;
  canonical: string;
  charset: string;
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  ogSiteName: string;
  // Twitter
  twitterCard: TwitterCardType;
  twitterSite: string;
  twitterCreator: string;
}

const INITIAL: MetaState = {
  title: "",
  description: "",
  keywords: "",
  author: "",
  robots: "",
  viewport: "width=device-width, initial-scale=1",
  canonical: "",
  charset: "UTF-8",
  ogTitle: "",
  ogDescription: "",
  ogType: "website",
  ogUrl: "",
  ogImage: "",
  ogImageAlt: "",
  ogSiteName: "",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
};

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<MetaState>> = [
  {
    label: "Blog article",
    description: "A long-form post with a large share image",
    icon: "FileText",
    value: {
      ...INITIAL,
      title: "How to Write Meta Descriptions That Get Clicks in 2026",
      description:
        "A practical, example-driven guide to writing meta descriptions that fit Google's snippet, match search intent and lift your click-through rate. No fluff.",
      keywords: "meta descriptions, seo copywriting, click-through rate, serp snippet",
      author: "Jordan Rivera",
      canonical: "https://example.com/blog/meta-descriptions-that-get-clicks",
      ogTitle: "How to Write Meta Descriptions That Get Clicks",
      ogDescription:
        "The exact framework we use to write snippet copy that fits Google and earns the click.",
      ogType: "article",
      ogUrl: "https://example.com/blog/meta-descriptions-that-get-clicks",
      ogImage: "https://example.com/images/meta-descriptions-cover.png",
      ogImageAlt: "Illustration of a search result with a highlighted description",
      ogSiteName: "Example Blog",
      twitterCard: "summary_large_image",
      twitterSite: "@example",
      twitterCreator: "@jordanrivera",
    },
  },
  {
    label: "Product page",
    description: "An e-commerce product with an OG product type",
    icon: "ShoppingBag",
    value: {
      ...INITIAL,
      title: "Aera Merino Wool Runner, Lightweight Everyday Sneaker",
      description:
        "The Aera Merino Wool Runner is a breathable, machine-washable everyday sneaker made from responsibly-sourced merino. Free shipping and 30-day returns.",
      keywords: "merino wool sneaker, everyday runner, sustainable shoes",
      canonical: "https://shop.example.com/products/aera-merino-runner",
      robots: "index, follow",
      ogTitle: "Aera Merino Wool Runner",
      ogDescription:
        "Breathable, machine-washable everyday sneakers in responsibly-sourced merino wool.",
      ogType: "product",
      ogUrl: "https://shop.example.com/products/aera-merino-runner",
      ogImage: "https://shop.example.com/images/aera-runner-1200x630.jpg",
      ogImageAlt: "Aera Merino Wool Runner sneaker in oatmeal",
      ogSiteName: "Aera",
      twitterCard: "summary_large_image",
      twitterSite: "@aera",
    },
  },
  {
    label: "SaaS landing",
    description: "A homepage / product landing page",
    icon: "Rocket",
    value: {
      ...INITIAL,
      title: "Fathom: Privacy-First Web Analytics Without Cookies",
      description:
        "Fathom is simple, fast, GDPR-compliant website analytics with no cookies and no consent banners. See what matters in one clean dashboard. Start free.",
      keywords: "web analytics, privacy analytics, cookieless analytics, gdpr",
      canonical: "https://usefathom.example.com/",
      ogTitle: "Fathom: Privacy-First Web Analytics",
      ogDescription:
        "Simple, fast, GDPR-compliant analytics with no cookies and no consent banners.",
      ogType: "website",
      ogUrl: "https://usefathom.example.com/",
      ogImage: "https://usefathom.example.com/og/home-1200x630.png",
      ogImageAlt: "The Fathom analytics dashboard",
      ogSiteName: "Fathom Analytics",
      twitterCard: "summary_large_image",
      twitterSite: "@usefathom",
    },
  },
];

/* ------------------------------ code assembly ----------------------------- */

/** Assemble the full `<head>` block from state, section by section. */
function generateCode(s: MetaState): string {
  const meta = buildMetaTags({
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    author: s.author,
    robots: s.robots,
    viewport: s.viewport,
    canonical: s.canonical,
    charset: s.charset,
  });

  const og = buildOpenGraph({
    title: s.ogTitle || s.title,
    description: s.ogDescription || s.description,
    type: s.ogType,
    url: s.ogUrl || s.canonical,
    image: s.ogImage,
    imageAlt: s.ogImageAlt,
    siteName: s.ogSiteName,
  });

  const twitter = buildTwitterCard({
    card: s.twitterCard,
    title: s.ogTitle || s.title,
    description: s.ogDescription || s.description,
    image: s.ogImage,
    imageAlt: s.ogImageAlt,
    site: s.twitterSite,
    creator: s.twitterCreator,
  });

  const sections: string[] = [];
  if (meta.trim()) sections.push(`<!-- Primary meta tags -->\n${meta}`);
  if (og.trim()) sections.push(`<!-- Open Graph / Facebook / LinkedIn -->\n${og}`);
  if (twitter.trim()) sections.push(`<!-- Twitter / X card -->\n${twitter}`);
  return sections.join("\n\n");
}

/* ------------------------------ small inputs ------------------------------ */

const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

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
  label: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        spellCheck={false}
      />
    </Field>
  );
}

function TextareaField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "h-auto resize-y py-1.5 leading-snug")}
        spellCheck
      />
    </Field>
  );
}

/** A section heading inside the form column. */
function SectionHead({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon name={icon} size={13} />
      {children}
    </div>
  );
}

/* --------------------------------- tool ----------------------------------- */

export default function MetaTagGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<MetaState>(INITIAL);
  const [pageUrl, setPageUrl] = React.useState("");
  const autoUrl = useDeepLinkUrl();

  // Fetch a URL → read its existing meta / OG / Twitter tags → fill the form.
  const applyFetched = React.useCallback((html: string, finalUrl: string) => {
    const m = extractPageMeta(html);
    if (!m.title && !m.description && !m.ogImage && !m.ogTitle) {
      toast.error("No meta tags found on that page, fill the form manually.");
      return;
    }
    const twCard = m.twitterCard === "summary" ? "summary" : "summary_large_image";
    setState((prev) => ({
      ...prev,
      title: m.title,
      description: m.description,
      keywords: metaContent(html, "keywords", "name"),
      author: metaContent(html, "author", "name"),
      robots: metaContent(html, "robots", "name"),
      canonical: m.canonical,
      ogTitle: m.ogTitle,
      ogDescription: m.ogDescription,
      ogType: m.ogType || "website",
      ogUrl: m.ogUrl || finalUrl,
      ogImage: m.ogImage,
      ogImageAlt: metaContent(html, "og:image:alt", "property"),
      ogSiteName: m.ogSiteName,
      twitterCard: twCard,
      twitterSite: m.twitterSite,
      twitterCreator: m.twitterCreator,
    }));
    setPageUrl(finalUrl);
    toast.success(`Loaded meta tags from ${metaHostOf(finalUrl)}: review and edit below.`);
  }, []);

  const shareLink =
    typeof window !== "undefined" && pageUrl
      ? `${window.location.origin}/${tool.slug}?url=${encodeURIComponent(pageUrl)}`
      : "";
  const [device, setDevice] = React.useState<SerpDevice>("desktop");
  const [platform, setPlatform] = React.useState<SocialPlatform>("facebook");

  const set = React.useCallback(
    <K extends keyof MetaState>(key: K) =>
      (value: MetaState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const code = React.useMemo(() => generateCode(state), [state]);

  const scores = React.useMemo(
    () => titleDescriptionScore(state.title, state.description),
    [state.title, state.description],
  );

  const badgeTone = (status: "good" | "warn" | "bad" | "empty") =>
    status === "good"
      ? ("success" as const)
      : status === "empty"
        ? ("default" as const)
        : status === "bad"
          ? ("danger" as const)
          : ("warning" as const);

  const previewTitle = state.ogTitle || state.title || "Your page title appears here";
  const previewDescription =
    state.ogDescription ||
    state.description ||
    "Your meta description shows up here in search results and social cards.";
  const previewUrl = state.ogUrl || state.canonical || "https://example.com/page";

  const stats = (
    <>
      <StatBadge
        label="Title"
        value={`${scores.title.length} chars`}
        tone={badgeTone(scores.title.status)}
      />
      <StatBadge
        label="Description"
        value={`${scores.description.length} chars`}
        tone={badgeTone(scores.description.status)}
      />
      <StatBadge label="SEO score" value={`${scores.score}/100`} tone={badgeTone(
        scores.score >= 90 ? "good" : scores.score >= 60 ? "warn" : scores.score === 0 ? "empty" : "bad",
      )} />
    </>
  );

  const form = (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Icon name="Globe" size={13} className="text-primary" />
          Start from a URL. We load the page&rsquo;s existing tags
        </p>
        <UrlPrefillBar actionLabel="Fetch & fill" autoUrl={autoUrl} onHtml={applyFetched} />
      </div>
      <SectionHead icon="Search">Primary SEO tags</SectionHead>
      <TextField
        id="mt-title"
        label="Title"
        hint="Shown as the blue link in Google. Aim for 50–60 characters."
        value={state.title}
        onChange={set("title")}
        placeholder="Meta Tag Generator, SEO, Open Graph & Twitter Cards"
      />
      {scores.title.status !== "empty" && (
        <p
          className={cn(
            "-mt-1 text-xs",
            scores.title.status === "good"
              ? "text-emerald-600 dark:text-emerald-400"
              : scores.title.status === "bad"
                ? "text-rose-600 dark:text-rose-400"
                : "text-amber-600 dark:text-amber-400",
          )}
        >
          {scores.title.message}
        </p>
      )}
      <TextareaField
        id="mt-description"
        label="Meta description"
        hint="The snippet under the title. Aim for 150–160 characters."
        value={state.description}
        onChange={set("description")}
        placeholder="Generate SEO meta, Open Graph and Twitter Card tags with a live Google snippet and social-card preview…"
      />
      {scores.description.status !== "empty" && (
        <p
          className={cn(
            "-mt-1 text-xs",
            scores.description.status === "good"
              ? "text-emerald-600 dark:text-emerald-400"
              : scores.description.status === "bad"
                ? "text-rose-600 dark:text-rose-400"
                : "text-amber-600 dark:text-amber-400",
          )}
        >
          {scores.description.message}
        </p>
      )}
      <TextField
        id="mt-keywords"
        label="Keywords (optional)"
        hint="Ignored by Google for ranking. Included only if you fill it in."
        value={state.keywords}
        onChange={set("keywords")}
        placeholder="meta tag generator, open graph, twitter cards"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="mt-author"
          label="Author (optional)"
          value={state.author}
          onChange={set("author")}
          placeholder="Jane Doe"
        />
        <Field label="Robots" htmlFor="mt-robots" hint="Leave blank to default to index, follow.">
          <SelectField<string>
            id="mt-robots"
            ariaLabel="Robots directive"
            value={state.robots}
            onChange={set("robots")}
            className="w-full"
            options={[
              { value: "", label: "index, follow (default)" },
              { value: "noindex, follow", label: "noindex, follow" },
              { value: "index, nofollow", label: "index, nofollow" },
              { value: "noindex, nofollow", label: "noindex, nofollow" },
              { value: "noarchive", label: "noarchive" },
            ]}
          />
        </Field>
      </div>
      <TextField
        id="mt-canonical"
        label="Canonical URL"
        hint="The authoritative URL for this page, prevents duplicate-content issues."
        value={state.canonical}
        onChange={set("canonical")}
        placeholder="https://example.com/page"
        type="url"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="mt-viewport"
          label="Viewport"
          value={state.viewport}
          onChange={set("viewport")}
          placeholder="width=device-width, initial-scale=1"
        />
        <TextField
          id="mt-charset"
          label="Charset"
          value={state.charset}
          onChange={set("charset")}
          placeholder="UTF-8"
        />
      </div>

      <SectionHead icon="Share2">Open Graph (Facebook, LinkedIn, X)</SectionHead>
      <TextField
        id="mt-og-title"
        label="OG title"
        hint="Falls back to the SEO title if left blank."
        value={state.ogTitle}
        onChange={set("ogTitle")}
        placeholder="Same as SEO title, or a punchier social headline"
      />
      <TextareaField
        id="mt-og-description"
        label="OG description"
        hint="Falls back to the meta description if left blank."
        value={state.ogDescription}
        onChange={set("ogDescription")}
        placeholder="A short, share-friendly summary…"
        rows={2}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="OG type" htmlFor="mt-og-type">
          <SelectField<string>
            id="mt-og-type"
            ariaLabel="Open Graph type"
            value={state.ogType}
            onChange={set("ogType")}
            className="w-full"
            options={[
              { value: "website", label: "website" },
              { value: "article", label: "article" },
              { value: "product", label: "product" },
              { value: "profile", label: "profile" },
              { value: "video.other", label: "video" },
            ]}
          />
        </Field>
        <TextField
          id="mt-og-url"
          label="OG URL"
          hint="Falls back to the canonical URL if left blank."
          value={state.ogUrl}
          onChange={set("ogUrl")}
          placeholder="https://example.com/page"
          type="url"
        />
      </div>
      <TextField
        id="mt-og-image"
        label="OG image URL"
        hint="A public https URL. Use 1200×630px for the best large card."
        value={state.ogImage}
        onChange={set("ogImage")}
        placeholder="https://example.com/og-image.png"
        type="url"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="mt-og-image-alt"
          label="OG image alt"
          value={state.ogImageAlt}
          onChange={set("ogImageAlt")}
          placeholder="Description of the image"
        />
        <TextField
          id="mt-og-site"
          label="Site name"
          value={state.ogSiteName}
          onChange={set("ogSiteName")}
          placeholder="Example"
        />
      </div>

      <SectionHead icon="Twitter">Twitter / X card</SectionHead>
      <Field label="Card type" htmlFor="mt-tw-card">
        <SegmentedControl<TwitterCardType>
          value={state.twitterCard}
          onChange={set("twitterCard")}
          ariaLabel="Twitter card type"
          options={[
            { value: "summary", label: "Summary" },
            { value: "summary_large_image", label: "Large image" },
          ]}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="mt-tw-site"
          label="Site @handle"
          value={state.twitterSite}
          onChange={set("twitterSite")}
          placeholder="@example"
        />
        <TextField
          id="mt-tw-creator"
          label="Creator @handle"
          value={state.twitterCreator}
          onChange={set("twitterCreator")}
          placeholder="@author"
        />
      </div>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Search" size={13} />
          Google search result
        </div>
        <SerpPreview
          title={state.title || "Your page title appears here"}
          url={previewUrl}
          description={
            state.description ||
            "Your meta description shows up here in the search result snippet."
          }
          device={device}
          onDeviceChange={setDevice}
        />
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Share2" size={13} />
          Social share card
        </div>
        <SocialCardPreview
          title={previewTitle}
          description={previewDescription}
          image={state.ogImage || undefined}
          url={previewUrl}
          siteName={state.ogSiteName || undefined}
          card={state.twitterCard}
          platform={platform}
          onPlatformChange={setPlatform}
        />
      </div>
      {shareLink ? (
        <ShareReport
          url={shareLink}
          title={`Meta tags, ${metaHostOf(pageUrl)}`}
          text={`Meta / SEO tag report for ${metaHostOf(pageUrl)} (via GigAI)`}
        />
      ) : null}
    </div>
  );

  return (
    <section aria-label={tool.title}>
    <GeneratorWithPreview<MetaState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="HTML"
      form={form}
      preview={preview}
      previewLabel="Live search & social preview"
      downloadName="meta-tags.html"
      downloadMime="text/html;charset=utf-8"
      examples={EXAMPLES}
      stats={stats}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<MetaState>;
          if (!parsed || typeof parsed !== "object") return null;
          return { ...INITIAL, ...parsed };
        } catch {
          return null;
        }
      }}
    />
    </section>
  );
}
