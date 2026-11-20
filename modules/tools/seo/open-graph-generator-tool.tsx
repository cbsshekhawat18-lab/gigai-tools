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
  ShareReport,
  SocialCardPreview,
  UrlPrefillBar,
  useDeepLinkUrl,
  type SocialPlatform,
} from "@/components/tool/seo";
import { buildOpenGraph } from "@/lib/seo-tools/meta";
import { extractPageMeta, metaContent } from "@/lib/seo-tools/schema-seed";

/** Host of a URL, sans www, for share titles. */
function hostOf(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Open Graph Generator: a focused OG workspace.
 *
 * A single controlled form (`OgState`) drives two outputs in lockstep: the
 * generated `<meta property="og:*">` block (via `lib/seo-tools/meta.ts`
 * `buildOpenGraph`) and a faithful Facebook / LinkedIn share card. Unlike the
 * broader Meta Tag Generator, this tool is intentionally scoped to the Open
 * Graph protocol, so it adds og-specific coaching: an image-ratio check against
 * the 1200×630 large-card sweet spot and length hints tuned to what Facebook
 * and LinkedIn actually display. `<GeneratorWithPreview>` owns the toolbar,
 * undo/redo, share links, presets and shortcuts; this module owns only the data
 * and how it renders. Everything runs in the browser. Nothing typed here is
 * ever uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface OgState {
  title: string;
  description: string;
  url: string;
  type: string;
  siteName: string;
  locale: string;
  image: string;
  imageAlt: string;
  imageWidth: string;
  imageHeight: string;
  /** UI-only: which card layout to emulate in the preview. */
  card: "summary" | "summary_large_image";
}

const INITIAL: OgState = {
  title: "",
  description: "",
  url: "",
  type: "website",
  siteName: "",
  locale: "",
  image: "",
  imageAlt: "",
  imageWidth: "",
  imageHeight: "",
  card: "summary_large_image",
};

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<OgState>> = [
  {
    label: "Article",
    description: "A blog post with a large share image",
    icon: "FileText",
    value: {
      ...INITIAL,
      title: "The Open Graph Protocol, Explained in 5 Minutes",
      description:
        "A plain-English tour of og:title, og:description, og:image and og:url, and how they turn a bare link into a rich card on every social platform.",
      url: "https://example.com/blog/open-graph-explained",
      type: "article",
      siteName: "Example Blog",
      locale: "en_US",
      image: "https://example.com/images/open-graph-explained-1200x630.png",
      imageAlt: "Diagram of a link unfurling into a share card",
      imageWidth: "1200",
      imageHeight: "630",
      card: "summary_large_image",
    },
  },
  {
    label: "Product",
    description: "An e-commerce product page",
    icon: "ShoppingBag",
    value: {
      ...INITIAL,
      title: "Aera Merino Wool Runner, Lightweight Everyday Sneaker",
      description:
        "Breathable, machine-washable everyday sneakers in responsibly-sourced merino wool. Free shipping and 30-day returns.",
      url: "https://shop.example.com/products/aera-merino-runner",
      type: "product",
      siteName: "Aera",
      locale: "en_US",
      image: "https://shop.example.com/images/aera-runner-1200x630.jpg",
      imageAlt: "Aera Merino Wool Runner sneaker in oatmeal",
      imageWidth: "1200",
      imageHeight: "630",
      card: "summary_large_image",
    },
  },
  {
    label: "Profile",
    description: "A personal or brand profile page",
    icon: "User",
    value: {
      ...INITIAL,
      title: "Jordan Rivera, Product Designer & Writer",
      description:
        "Product designer writing about interface craft, typography and the small details that make software feel good.",
      url: "https://jordanrivera.example.com/",
      type: "profile",
      siteName: "Jordan Rivera",
      locale: "en_US",
      image: "https://jordanrivera.example.com/avatar-800x800.jpg",
      imageAlt: "Portrait of Jordan Rivera",
      imageWidth: "800",
      imageHeight: "800",
      card: "summary",
    },
  },
];

/* --------------------------- length / ratio model -------------------------- */

type Tone = "good" | "warn" | "bad" | "empty";

/** Length coaching tuned to the social window (not Google's SERP). */
function lengthStatus(value: string, max: number): { tone: Tone; message: string } {
  const len = value.trim().length;
  if (len === 0) return { tone: "empty", message: "" };
  if (len <= max) return { tone: "good", message: `${len} characters: fits the card.` };
  if (len <= max + Math.round(max * 0.4))
    return { tone: "warn", message: `${len} characters, the tail may be truncated.` };
  return { tone: "bad", message: `${len} characters. This will be cut off in the card.` };
}

/** og:image ratio check against the 1.91:1 (1200×630) large-card ideal. */
function ratioStatus(w: string, h: string): { tone: Tone; message: string } {
  const width = Number(w);
  const height = Number(h);
  if (!w.trim() || !h.trim()) return { tone: "empty", message: "" };
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    return { tone: "bad", message: "Enter positive numbers for width and height." };
  if (width < 200 || height < 200)
    return {
      tone: "bad",
      message: "Below 200×200px: Facebook and LinkedIn will skip an image this small.",
    };
  const ratio = width / height;
  const ideal = 1200 / 630; // ≈ 1.905
  const diff = Math.abs(ratio - ideal) / ideal;
  if (diff <= 0.06)
    return { tone: "good", message: `${width}×${height} (${ratio.toFixed(2)}:1), perfect large card.` };
  if (ratio >= 0.9 && ratio <= 1.1)
    return { tone: "warn", message: `${width}×${height}, near-square renders as a small thumbnail card.` };
  return {
    tone: "warn",
    message: `${width}×${height} (${ratio.toFixed(2)}:1). Aim for 1.91:1 (e.g. 1200×630) to avoid letter-boxing.`,
  };
}

/* ------------------------------ code assembly ----------------------------- */

/** Assemble the Open Graph block from state. */
function generateCode(s: OgState): string {
  const og = buildOpenGraph({
    title: s.title,
    description: s.description,
    url: s.url,
    type: s.type,
    image: s.image,
    imageAlt: s.imageAlt,
    imageWidth: s.imageWidth.trim() || undefined,
    imageHeight: s.imageHeight.trim() || undefined,
    siteName: s.siteName,
    locale: s.locale,
  });
  if (!og.trim()) return "";
  return `<!-- Open Graph / Facebook / LinkedIn -->\n${og}`;
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
  inputMode,
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
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

const toneClass = (tone: Tone) =>
  tone === "good"
    ? "text-emerald-600 dark:text-emerald-400"
    : tone === "bad"
      ? "text-rose-600 dark:text-rose-400"
      : "text-amber-600 dark:text-amber-400";

/** Inline coaching line under a field. */
function Coach({ tone, message }: { tone: Tone; message: string }) {
  if (tone === "empty" || !message) return null;
  return <p className={cn("-mt-1 text-xs", toneClass(tone))}>{message}</p>;
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

export default function OpenGraphGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<OgState>(INITIAL);
  const [platform, setPlatform] = React.useState<SocialPlatform>("facebook");
  const [pageUrl, setPageUrl] = React.useState("");
  const autoUrl = useDeepLinkUrl();

  // Fetch a URL → read its existing OG/meta tags → fill the form.
  const applyFetched = React.useCallback((html: string, finalUrl: string) => {
    const m = extractPageMeta(html);
    if (!m.ogTitle && !m.title && !m.ogImage && !m.ogDescription) {
      toast.error("No Open Graph or meta tags found on that page: fill the form manually.");
      return;
    }
    setState({
      ...INITIAL,
      title: m.ogTitle || m.title,
      description: m.ogDescription || m.description,
      url: m.ogUrl || finalUrl,
      type: m.ogType || "website",
      siteName: m.ogSiteName,
      image: m.ogImage,
      imageAlt: metaContent(html, "og:image:alt", "property"),
      imageWidth: metaContent(html, "og:image:width", "property"),
      imageHeight: metaContent(html, "og:image:height", "property"),
      locale: metaContent(html, "og:locale", "property"),
    });
    setPageUrl(finalUrl);
    toast.success(`Loaded Open Graph tags from ${hostOf(finalUrl)}, review and edit below.`);
  }, []);

  const shareLink =
    typeof window !== "undefined" && pageUrl
      ? `${window.location.origin}/${tool.slug}?url=${encodeURIComponent(pageUrl)}`
      : "";

  const set = React.useCallback(
    <K extends keyof OgState>(key: K) =>
      (value: OgState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const code = React.useMemo(() => generateCode(state), [state]);

  const titleStatus = React.useMemo(() => lengthStatus(state.title, 60), [state.title]);
  const descStatus = React.useMemo(() => lengthStatus(state.description, 110), [state.description]);
  const imageRatio = React.useMemo(
    () => ratioStatus(state.imageWidth, state.imageHeight),
    [state.imageWidth, state.imageHeight],
  );

  const tagCount = React.useMemo(() => {
    const og = code
      .split("\n")
      .filter((line) => line.trim().startsWith("<meta")).length;
    return og;
  }, [code]);

  const toneToBadge = (tone: Tone) =>
    tone === "good"
      ? ("success" as const)
      : tone === "empty"
        ? ("default" as const)
        : tone === "bad"
          ? ("danger" as const)
          : ("warning" as const);

  const previewTitle = state.title || "Your Open Graph title appears here";
  const previewDescription =
    state.description ||
    "Your og:description shows up here as the summary line beneath the headline in the share card.";
  const previewUrl = state.url || "https://example.com/page";

  const stats = (
    <>
      <StatBadge label="og: tags" value={`${tagCount}`} tone={tagCount > 0 ? "success" : "default"} />
      <StatBadge
        label="Title"
        value={`${state.title.trim().length} chars`}
        tone={toneToBadge(titleStatus.tone)}
      />
      <StatBadge
        label="Description"
        value={`${state.description.trim().length} chars`}
        tone={toneToBadge(descStatus.tone)}
      />
      <StatBadge label="og:image" value={imageRatio.tone === "empty" ? "no size" : imageRatio.tone === "good" ? "1.91:1" : "check"} tone={toneToBadge(imageRatio.tone)} />
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
      <SectionHead icon="Type">Core Open Graph</SectionHead>
      <TextField
        id="og-title"
        label={<>og:title</>}
        hint="The bold headline of the share card. Keep it under ~60 characters."
        value={state.title}
        onChange={set("title")}
        placeholder="The Open Graph Protocol, Explained in 5 Minutes"
      />
      <Coach tone={titleStatus.tone} message={titleStatus.message} />
      <TextareaField
        id="og-description"
        label={<>og:description</>}
        hint="The summary line under the headline. Facebook shows roughly the first 110 characters."
        value={state.description}
        onChange={set("description")}
        placeholder="A plain-English tour of og:title, og:description, og:image and og:url…"
      />
      <Coach tone={descStatus.tone} message={descStatus.message} />
      <TextField
        id="og-url"
        label={<>og:url</>}
        hint="The canonical, absolute URL. Networks use it to identify and cache the share."
        value={state.url}
        onChange={set("url")}
        placeholder="https://example.com/page"
        type="url"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="og:type" htmlFor="og-type">
          <SelectField<string>
            id="og-type"
            ariaLabel="Open Graph type"
            value={state.type}
            onChange={set("type")}
            className="w-full"
            options={[
              { value: "website", label: "website" },
              { value: "article", label: "article" },
              { value: "product", label: "product" },
              { value: "profile", label: "profile" },
              { value: "book", label: "book" },
              { value: "video.other", label: "video" },
              { value: "music.song", label: "music" },
            ]}
          />
        </Field>
        <TextField
          id="og-locale"
          label="og:locale (optional)"
          hint="Language_TERRITORY, e.g. en_US."
          value={state.locale}
          onChange={set("locale")}
          placeholder="en_US"
        />
      </div>
      <TextField
        id="og-site"
        label="og:site_name (optional)"
        hint="Your brand, shown as the source line above the headline."
        value={state.siteName}
        onChange={set("siteName")}
        placeholder="Example"
      />

      <SectionHead icon="Image">og:image</SectionHead>
      <TextField
        id="og-image"
        label="og:image URL"
        hint="A public https URL. Use a landscape 1200×630px image for the large card."
        value={state.image}
        onChange={set("image")}
        placeholder="https://example.com/og-image-1200x630.png"
        type="url"
      />
      <TextField
        id="og-image-alt"
        label="og:image:alt (optional)"
        hint="Describes the image for accessibility. Some platforms surface it as a caption."
        value={state.imageAlt}
        onChange={set("imageAlt")}
        placeholder="Diagram of a link unfurling into a share card"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="og-image-w"
          label="og:image:width (optional)"
          value={state.imageWidth}
          onChange={set("imageWidth")}
          placeholder="1200"
          inputMode="numeric"
        />
        <TextField
          id="og-image-h"
          label="og:image:height (optional)"
          value={state.imageHeight}
          onChange={set("imageHeight")}
          placeholder="630"
          inputMode="numeric"
        />
      </div>
      <Coach tone={imageRatio.tone} message={imageRatio.message} />

      <SectionHead icon="LayoutGrid">Preview</SectionHead>
      <Field
        label="Card layout"
        htmlFor="og-card"
        hint="How the image is shown. The large layout needs a landscape image."
      >
        <SegmentedControl<OgState["card"]>
          value={state.card}
          onChange={set("card")}
          ariaLabel="Card layout"
          options={[
            { value: "summary", label: "Small (square)" },
            { value: "summary_large_image", label: "Large image" },
          ]}
        />
      </Field>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon name="Share2" size={13} />
        How your link unfurls when shared
      </div>
      <SocialCardPreview
        title={previewTitle}
        description={previewDescription}
        image={state.image || undefined}
        url={previewUrl}
        siteName={state.siteName || undefined}
        card={state.card}
        platform={platform}
        onPlatformChange={setPlatform}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        This is a faithful mock of the Facebook and LinkedIn cards. After you deploy, re-scrape the
        URL with Facebook&apos;s Sharing Debugger or LinkedIn&apos;s Post Inspector so the network
        picks up your new tags.
      </p>
      {shareLink ? (
        <ShareReport
          url={shareLink}
          title={`Open Graph tags: ${hostOf(pageUrl)}`}
          text={`Open Graph share preview for ${hostOf(pageUrl)} (via GigAI)`}
        />
      ) : null}
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<OgState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="HTML"
        form={form}
        preview={preview}
        previewLabel="Live Facebook & LinkedIn preview"
        downloadName="open-graph.html"
        downloadMime="text/html;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        error={code.trim() ? null : "Fill in at least an og:title, og:image or og:url to generate tags."}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<OgState>;
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
