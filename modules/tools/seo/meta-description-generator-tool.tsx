"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  SelectField,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SerpPreview,
  type SerpDevice,
} from "@/components/tool/seo";
import { buildMetaTags, titleDescriptionScore } from "@/lib/seo-tools/meta";
import { serpSnippets } from "@/lib/seo-tools/preview";

/**
 * Meta Description Generator, a focused writing workspace for the single most
 * click-critical line of markup on a page. A controlled form (`DescState`)
 * drives three things in lockstep: the generated `<meta name="description">`
 * tag (via `lib/seo-tools/meta.ts`), a live character + pixel meter measured
 * the way Google truncates (via `lib/seo-tools/preview.ts`), and a
 * pixel-accurate SERP snippet. `<GeneratorWithPreview>` owns the toolbar,
 * undo/redo, share links, presets and shortcuts; this module owns the data,
 * the templates, and how everything renders. Nothing typed here is uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface DescState {
  description: string;
  title: string;
  url: string;
  keyword: string;
}

const INITIAL: DescState = {
  description: "",
  title: "",
  url: "",
  keyword: "",
};

/* ------------------------------- templates -------------------------------- */

/**
 * Intent-based first drafts. Each `{placeholder}` is a spot the user rewrites;
 * they are kept as literal braces so it is obvious what to swap. Templates seed
 * the editor only: the user personalises from there.
 */
interface DescTemplate {
  id: string;
  label: string;
  icon: string;
  text: string;
}

const TEMPLATES: readonly DescTemplate[] = [
  {
    id: "blog",
    label: "Blog post",
    icon: "FileText",
    text: "Learn {main promise} in this practical guide to {topic}. We cover {point 1}, {point 2} and {point 3} with real examples so you can {outcome} today.",
  },
  {
    id: "product",
    label: "Product page",
    icon: "ShoppingBag",
    text: "{Product name} is the {category} that {key benefit}. Enjoy {feature 1} and {feature 2}, with free shipping and 30-day returns. Shop now.",
  },
  {
    id: "category",
    label: "Category page",
    icon: "LayoutGrid",
    text: "Shop {category} at {brand}: {selection highlight} from top brands, with {benefit} and fast delivery. Compare styles, prices and reviews in one place.",
  },
  {
    id: "local",
    label: "Local business",
    icon: "MapPin",
    text: "Looking for {service} in {city}? {Business name} offers {main service} with {differentiator}. Call today for a free quote, trusted by {city} locals since {year}.",
  },
  {
    id: "home",
    label: "Homepage",
    icon: "Home",
    text: "{Brand} helps {audience} {core outcome}. {One-line value prop}. No {common pain point}. Get started free and see why {social proof} choose us.",
  },
  {
    id: "compare",
    label: "Comparison",
    icon: "GitCompare",
    text: "{Option A} vs {Option B}: we compare pricing, features and support to help you choose. See the key differences, pros and cons, and which is right for {audience}.",
  },
  {
    id: "howto",
    label: "How-to guide",
    icon: "ListChecks",
    text: "How to {task} in {N} simple steps. This step-by-step guide walks you through {what} from start to finish, so you can {outcome} without {common mistake}.",
  },
  {
    id: "service",
    label: "Service page",
    icon: "Briefcase",
    text: "Professional {service} for {audience}. We handle {scope} so you can {benefit}. Transparent pricing, proven results and a {guarantee}. Book a consultation today.",
  },
];

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<DescState>> = [
  {
    label: "Well-optimized",
    description: "Description sits right in the sweet spot.",
    icon: "CircleCheck",
    value: {
      title: "How to Write Meta Descriptions That Get Clicks | GigAI",
      url: "https://example.com/blog/meta-descriptions-that-get-clicks",
      keyword: "meta descriptions",
      description:
        "Learn to write meta descriptions that get clicks: fit Google's snippet, match search intent and front-load your keyword. A practical, example-driven guide.",
    },
  },
  {
    label: "Too long (truncates)",
    description: "Watch the meter turn red and the snippet clip.",
    icon: "TriangleAlert",
    value: {
      title: "Ultimate Guide to Everything About SEO Copywriting",
      url: "https://example.com/guides/seo-copywriting",
      keyword: "seo copywriting",
      description:
        "This is a deliberately overlong meta description written to demonstrate exactly what happens when your copy runs well past Google's pixel budget, because once you exceed the limit the search engine simply clips the sentence with an ellipsis and your carefully written call-to-action is lost forever.",
    },
  },
  {
    label: "Too short",
    description: "A thin description leaves clicks on the table.",
    icon: "CircleAlert",
    value: {
      title: "Contact Us, Acme Plumbing, Austin TX",
      url: "https://acmeplumbing.com/contact",
      keyword: "austin plumber",
      description: "Get in touch with Acme Plumbing.",
    },
  },
];

/* -------------------------------- helpers --------------------------------- */

const STATUS_TONE: Record<"good" | "warn" | "bad" | "empty", string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-rose-600 dark:text-rose-400",
  empty: "text-muted-foreground",
};

const STATUS_ICON: Record<"good" | "warn" | "bad" | "empty", string> = {
  good: "CircleCheck",
  warn: "TriangleAlert",
  bad: "CircleX",
  empty: "Circle",
};

function badgeTone(status: "good" | "warn" | "bad" | "empty") {
  return status === "good"
    ? ("success" as const)
    : status === "empty"
      ? ("default" as const)
      : status === "bad"
        ? ("danger" as const)
        : ("warning" as const);
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

/* --------------------------------- tool ----------------------------------- */

export default function MetaDescriptionGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<DescState>(INITIAL);
  const [device, setDevice] = React.useState<SerpDevice>("desktop");

  const set = React.useCallback(
    <K extends keyof DescState>(key: K) =>
      (value: DescState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const applyTemplate = React.useCallback((text: string) => {
    setState((prev) => ({ ...prev, description: text }));
  }, []);

  // The generated tag is the primary output (fed to the toolbar's copy/download).
  const code = React.useMemo(
    () =>
      buildMetaTags({ description: state.description }) ||
      '<!-- Start typing to generate a <meta name="description"> tag -->',
    [state.description],
  );

  const scores = React.useMemo(
    () => titleDescriptionScore(state.title, state.description),
    [state.title, state.description],
  );

  // Pixel-aware measurement for the current device (Google truncates by width).
  const snippets = React.useMemo(
    () =>
      serpSnippets({
        title: state.title,
        url: state.url,
        desc: state.description,
      }),
    [state.title, state.url, state.description],
  );
  const descSnippet = snippets[device].description;

  const descScore = scores.description;
  const overBudget = descSnippet.pixels > descSnippet.limit;
  const pct = Math.min(
    100,
    Math.round((descSnippet.pixels / descSnippet.limit) * 100),
  );

  // Target-keyword presence (case-insensitive, whole phrase).
  const keyword = state.keyword.trim();
  const keywordPresent =
    keyword.length > 0 &&
    state.description.toLowerCase().includes(keyword.toLowerCase());

  const stats = (
    <>
      <StatBadge
        label="Chars"
        value={`${descScore.length}`}
        tone={badgeTone(descScore.status)}
      />
      <StatBadge
        label="Width"
        value={`${descSnippet.pixels}px`}
        tone={overBudget ? "danger" : descScore.status === "good" ? "success" : "default"}
      />
      {keyword.length > 0 && (
        <StatBadge
          label="Keyword"
          value={keywordPresent ? "found" : "missing"}
          icon={keywordPresent ? "Check" : "X"}
          tone={keywordPresent ? "success" : "warning"}
        />
      )}
    </>
  );

  const form = (
    <div className="flex flex-col gap-3">
      {/* Templates */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Start from a template
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.text)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              title={`Insert the ${t.label} template`}
            >
              <Icon name={t.icon} size={13} className="text-muted-foreground" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description editor + meter */}
      <Field
        label="Meta description"
        htmlFor="md-description"
        hint="The sentence under your title in search results. Aim for 150–160 characters."
      >
        <textarea
          id="md-description"
          value={state.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={4}
          placeholder="Summarise the page in one compelling sentence that still reads well if the last few words are cut, and front-load your primary keyword."
          className={cn(inputClass, "resize-y leading-relaxed")}
          spellCheck
        />
      </Field>

      {/* Live pixel/character meter */}
      <div className="flex flex-col gap-1.5">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Meta description length against Google's pixel budget"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              overBudget
                ? "bg-rose-500"
                : descScore.status === "good"
                  ? "bg-emerald-500"
                  : descScore.status === "warn"
                    ? "bg-amber-500"
                    : "bg-teal-500",
            )}
            style={{ width: `${Math.max(pct, descScore.length ? 4 : 0)}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              STATUS_TONE[descScore.status],
            )}
          >
            <Icon name={STATUS_ICON[descScore.status]} size={12} />
            {descScore.length} characters
          </span>
          <span
            className={cn(
              "tabular-nums",
              overBudget ? STATUS_TONE.bad : "text-muted-foreground",
            )}
          >
            {descSnippet.pixels}px / {descSnippet.limit}px ({device})
          </span>
          <span className="text-muted-foreground">{descScore.message}</span>
        </div>
      </div>

      {/* Target keyword */}
      <Field
        label="Target keyword (optional)"
        htmlFor="md-keyword"
        hint="We check whether this phrase appears in your description. No stuffing."
      >
        <input
          id="md-keyword"
          type="text"
          value={state.keyword}
          onChange={(e) => set("keyword")(e.target.value)}
          placeholder="meta description generator"
          className={inputClass}
          spellCheck={false}
        />
      </Field>
      {keyword.length > 0 && (
        <p
          className={cn(
            "-mt-1 inline-flex items-center gap-1.5 text-xs",
            keywordPresent ? STATUS_TONE.good : STATUS_TONE.warn,
          )}
        >
          <Icon name={keywordPresent ? "CircleCheck" : "TriangleAlert"} size={12} />
          {keywordPresent
            ? `"${keyword}" appears in your description.`
            : `"${keyword}" isn't in your description yet, work it in naturally.`}
        </p>
      )}

      {/* Snippet context (title + URL) for the live preview */}
      <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon name="Search" size={13} />
        Preview context
      </div>
      <Field
        label="Page title"
        htmlFor="md-title"
        hint="Used only to render the SERP preview. Not included in the description tag."
      >
        <input
          id="md-title"
          type="text"
          value={state.title}
          onChange={(e) => set("title")(e.target.value)}
          placeholder="How to Write Meta Descriptions That Get Clicks | GigAI"
          className={inputClass}
          spellCheck={false}
        />
      </Field>
      <Field label="URL" htmlFor="md-url">
        <input
          id="md-url"
          type="url"
          inputMode="url"
          value={state.url}
          onChange={(e) => set("url")(e.target.value)}
          placeholder="https://example.com/blog/meta-descriptions"
          className={inputClass}
          spellCheck={false}
        />
      </Field>

      <Field label="Preview device" htmlFor="md-device">
        <SelectField<SerpDevice>
          id="md-device"
          ariaLabel="Preview device"
          value={device}
          onChange={setDevice}
          className="w-full"
          options={[
            { value: "desktop", label: "Desktop (≈920px budget)" },
            { value: "mobile", label: "Mobile (narrower budget)" },
          ]}
        />
      </Field>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Search" size={13} />
          Google search result
        </div>
        <SerpPreview
          title={state.title || "Your page title appears here"}
          url={state.url || "https://example.com/page"}
          description={
            state.description ||
            "Your meta description shows up right here, under the title, in the search result."
          }
          device={device}
          onDeviceChange={setDevice}
        />
      </div>

      <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          Google truncates by rendered pixel width, not character count, and may
          rewrite your description to match a query. Write a self-contained
          sentence that reads well even if the tail is clipped.
        </span>
      </div>
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<DescState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="HTML"
        form={form}
        preview={preview}
        previewLabel="Live search preview"
        downloadName="meta-description.html"
        downloadMime="text/html;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<DescState>;
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
