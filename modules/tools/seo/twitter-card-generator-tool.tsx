"use client";

import * as React from "react";
import { toast } from "sonner";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  SegmentedControl,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  ShareReport,
  SocialCardPreview,
  UrlPrefillBar,
  useDeepLinkUrl,
  type TwitterCardType,
} from "@/components/tool/seo";
import { buildTwitterCard, titleDescriptionScore } from "@/lib/seo-tools/meta";
import { extractPageMeta, metaContent } from "@/lib/seo-tools/schema-seed";

/** Host of a URL, sans www: for share titles. */
function hostOf(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Twitter Card Generator, a focused X (Twitter) card workspace.
 *
 * A single controlled form (`CardState`) drives two outputs in lockstep: the
 * generated `twitter:*` markup (via `lib/seo-tools/meta.ts`) and a faithful live
 * X card preview locked to the Twitter platform. `<GeneratorWithPreview>` owns
 * the toolbar, undo/redo, share links, templates and shortcuts; this module
 * only owns the shape of the data and how it renders. Everything runs in the
 * browser. Nothing typed here is ever uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface CardState {
  card: TwitterCardType;
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  site: string;
  creator: string;
}

const INITIAL: CardState = {
  card: "summary_large_image",
  title: "",
  description: "",
  url: "",
  image: "",
  imageAlt: "",
  site: "",
  creator: "",
};

/* -------------------------------- templates ------------------------------- */

const EXAMPLES: ReadonlyArray<Example<CardState>> = [
  {
    label: "Article",
    description: "A blog post with a wide hero image",
    icon: "FileText",
    value: {
      card: "summary_large_image",
      title: "How Twitter Cards Actually Render on X in 2026",
      description:
        "A field guide to twitter:card layouts, image sizes and the fallbacks X uses. With real before/after examples you can copy.",
      url: "https://example.com/blog/twitter-cards-on-x",
      image: "https://example.com/images/twitter-cards-cover-1200x628.png",
      imageAlt: "An X post unfurling into a large-image card",
      site: "@example",
      creator: "@jordanrivera",
    },
  },
  {
    label: "Product",
    description: "A product page with a compact card",
    icon: "ShoppingBag",
    value: {
      card: "summary",
      title: "Aera Merino Wool Runner, Lightweight Everyday Sneaker",
      description:
        "Breathable, machine-washable everyday sneakers in responsibly-sourced merino wool. Free shipping and 30-day returns.",
      url: "https://shop.example.com/products/aera-merino-runner",
      image: "https://shop.example.com/images/aera-runner-square.jpg",
      imageAlt: "Aera Merino Wool Runner sneaker in oatmeal",
      site: "@aera",
      creator: "",
    },
  },
  {
    label: "Profile",
    description: "A personal / portfolio page",
    icon: "User",
    value: {
      card: "summary_large_image",
      title: "Jordan Rivera: Product Designer & Writer",
      description:
        "I design calm software and write about the craft. Case studies, essays and the occasional side project live here.",
      url: "https://jordanrivera.example.com/",
      image: "https://jordanrivera.example.com/og/profile-1200x628.png",
      imageAlt: "Portrait of Jordan Rivera beside their logo",
      site: "@jordanrivera",
      creator: "@jordanrivera",
    },
  },
];

/* ------------------------------ code assembly ----------------------------- */

/** Assemble the `twitter:*` block from state. */
function generateCode(s: CardState): string {
  const twitter = buildTwitterCard({
    card: s.card,
    title: s.title,
    description: s.description,
    image: s.image,
    imageAlt: s.imageAlt,
    site: s.site,
    creator: s.creator,
  });
  if (!twitter.trim()) return "";
  return `<!-- Twitter / X card -->\n${twitter}`;
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
  rows = 2,
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

export default function TwitterCardGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<CardState>(INITIAL);
  const [pageUrl, setPageUrl] = React.useState("");
  const autoUrl = useDeepLinkUrl();

  // Fetch a URL → read its Twitter/OG tags (X falls back to OG) → fill the form.
  const applyFetched = React.useCallback((html: string, finalUrl: string) => {
    const m = extractPageMeta(html);
    if (!m.twitterTitle && !m.title && !m.twitterImage && !m.ogImage) {
      toast.error("No Twitter Card or Open Graph tags found on that page, fill the form manually.");
      return;
    }
    const cardTag = m.twitterCard === "summary" ? "summary" : "summary_large_image";
    setState({
      ...INITIAL,
      card: cardTag,
      title: m.twitterTitle || m.title,
      description: m.twitterDescription || m.description,
      url: m.ogUrl || finalUrl,
      image: m.twitterImage || m.ogImage,
      imageAlt: metaContent(html, "twitter:image:alt", "name") || metaContent(html, "og:image:alt", "property"),
      site: m.twitterSite,
      creator: m.twitterCreator,
    });
    setPageUrl(finalUrl);
    toast.success(`Loaded Twitter Card tags from ${hostOf(finalUrl)}, review and edit below.`);
  }, []);

  const shareLink =
    typeof window !== "undefined" && pageUrl
      ? `${window.location.origin}/${tool.slug}?url=${encodeURIComponent(pageUrl)}`
      : "";

  const set = React.useCallback(
    <K extends keyof CardState>(key: K) =>
      (value: CardState[K]) =>
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

  const previewTitle = state.title || "Your card title appears here";
  const previewDescription =
    state.description ||
    "Your card description shows up here when the link unfurls on X.";
  const previewUrl = state.url || "https://example.com/page";

  const stats = (
    <>
      <StatBadge
        label="Card"
        value={state.card === "summary_large_image" ? "Large image" : "Summary"}
        tone="default"
      />
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
      <SectionHead icon="LayoutTemplate">Card layout</SectionHead>
      <Field
        label="Card type"
        htmlFor="tw-card"
        hint="Large image shows a full-width hero. Summary shows a compact square thumbnail."
      >
        <SegmentedControl<TwitterCardType>
          value={state.card}
          onChange={set("card")}
          ariaLabel="Twitter card type"
          options={[
            { value: "summary", label: "Summary" },
            { value: "summary_large_image", label: "Large image" },
          ]}
        />
      </Field>

      <SectionHead icon="Type">Card content</SectionHead>
      <TextField
        id="tw-title"
        label="Title"
        hint="The bold headline on the card. Keep it short: X clips the tail."
        value={state.title}
        onChange={set("title")}
        placeholder="How Twitter Cards Render on X in 2026"
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
        id="tw-description"
        label="Description"
        hint="A sentence or two under the title. X truncates long copy in the card."
        value={state.description}
        onChange={set("description")}
        placeholder="A field guide to twitter:card layouts, image sizes and X's fallbacks…"
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
        id="tw-url"
        label="Page URL"
        hint="Shown as the card's source label. Used only for the preview host."
        value={state.url}
        onChange={set("url")}
        placeholder="https://example.com/page"
        type="url"
      />

      <SectionHead icon="Image">Card image</SectionHead>
      <TextField
        id="tw-image"
        label="Image URL"
        hint="A public https URL. Use 1200×628px for large image, or a square for summary."
        value={state.image}
        onChange={set("image")}
        placeholder="https://example.com/twitter-card-1200x628.png"
        type="url"
      />
      <TextField
        id="tw-image-alt"
        label="Image alt (recommended)"
        hint="Describes the image for screen readers on X."
        value={state.imageAlt}
        onChange={set("imageAlt")}
        placeholder="Description of the card image"
      />

      <SectionHead icon="AtSign">Attribution (optional)</SectionHead>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="tw-site"
          label="Site @handle"
          hint="The publishing account."
          value={state.site}
          onChange={set("site")}
          placeholder="@example"
        />
        <TextField
          id="tw-creator"
          label="Creator @handle"
          hint="The author's account."
          value={state.creator}
          onChange={set("creator")}
          placeholder="@author"
        />
      </div>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon name="Twitter" size={13} />
        X (Twitter) card
      </div>
      <SocialCardPreview
        title={previewTitle}
        description={previewDescription}
        image={state.image || undefined}
        url={previewUrl}
        card={state.card}
        platform="twitter"
        showToggle={false}
      />
      <p className="text-xs text-muted-foreground">
        X falls back to your Open Graph tags for any field left blank. Pair these
        with a complete <code className="rounded bg-muted px-1 py-0.5">og:*</code>{" "}
        block for the best result.
      </p>
      {shareLink ? (
        <ShareReport
          url={shareLink}
          title={`Twitter Card tags, ${hostOf(pageUrl)}`}
          text={`X (Twitter) card preview for ${hostOf(pageUrl)} (via GigAI)`}
        />
      ) : null}
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<CardState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="HTML"
        form={form}
        preview={preview}
        previewLabel="Live X card preview"
        downloadName="twitter-card.html"
        downloadMime="text/html;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<CardState>;
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
