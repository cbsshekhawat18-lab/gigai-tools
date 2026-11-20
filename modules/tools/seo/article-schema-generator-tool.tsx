"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { StatBadge, type Example } from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SchemaForm,
  SerpPreview,
  ScorePanel,
  CheckList,
  gradeForScore,
  type FieldSpec,
  type SchemaValues,
  type FieldValue,
  type CheckItem,
} from "@/components/tool/seo";
import {
  buildArticle,
  validateJsonLd,
  type SchemaOutput,
} from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  Small, type-safe value readers                                            */
/* -------------------------------------------------------------------------- */

function str(v: FieldValue | undefined): string {
  return typeof v === "string" ? v : "";
}
function opt(v: FieldValue | undefined): string | undefined {
  const s = str(v).trim();
  return s ? s : undefined;
}
function list(v: FieldValue | undefined): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : [];
}
function optList(v: FieldValue | undefined): string[] | undefined {
  const l = list(v).map((s) => s.trim()).filter(Boolean);
  return l.length ? l : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Article type catalogue                                                    */
/* -------------------------------------------------------------------------- */

type ArticleType = "Article" | "BlogPosting" | "NewsArticle";

const ARTICLE_TYPE_OPTIONS: ReadonlyArray<{ value: ArticleType; label: string }> = [
  { value: "Article", label: "Article, general editorial content" },
  { value: "BlogPosting", label: "BlogPosting: a blog post" },
  { value: "NewsArticle", label: "NewsArticle, a news story" },
];

/** Google truncates headlines around here; warn before the user crosses it. */
const HEADLINE_LIMIT = 110;

/* -------------------------------------------------------------------------- */
/*  Form spec (declarative, rendered by <SchemaForm>) */
/* -------------------------------------------------------------------------- */

const FIELDS: ReadonlyArray<FieldSpec> = [
  {
    name: "type",
    label: "Article type",
    type: "select",
    hint: "Article, BlogPosting (blog) or NewsArticle (news). All share the same fields.",
    options: ARTICLE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    full: true,
  },
  {
    name: "headline",
    label: "Headline",
    type: "text",
    required: true,
    full: true,
    maxLength: 160,
    placeholder: "The Complete Guide to Article Schema Markup in 2026",
    hint: "The one required field. Keep it under ~110 characters so Google doesn't truncate it.",
  },
  {
    name: "url",
    label: "Page URL",
    type: "url",
    full: true,
    placeholder: "https://example.com/blog/article-schema-guide",
    hint: "The canonical URL of the article this markup describes.",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 2,
    full: true,
    maxLength: 320,
    placeholder: "A short summary of the article: also used in the SERP preview.",
  },
  {
    name: "authorName",
    label: "Author name",
    type: "text",
    placeholder: "Jordan Rivera",
    hint: "Nested as a schema.org Person.",
  },
  {
    name: "authorUrl",
    label: "Author URL",
    type: "url",
    placeholder: "https://example.com/authors/jordan-rivera",
    hint: "Link to the author's bio page (optional).",
  },
  {
    name: "publisherName",
    label: "Publisher name",
    type: "text",
    placeholder: "Example Media",
    hint: "Nested as an Organization. Required for the logo to appear.",
  },
  {
    name: "publisherLogo",
    label: "Publisher logo URL",
    type: "url",
    placeholder: "https://example.com/logo.png",
    hint: "Added as an ImageObject inside the publisher.",
  },
  {
    name: "datePublished",
    label: "Date published",
    type: "date",
    hint: "Recommended by Google.",
  },
  {
    name: "dateModified",
    label: "Date modified",
    type: "date",
    hint: "Set when you update the article to signal freshness.",
  },
  {
    name: "images",
    label: "Image URLs",
    type: "list",
    full: true,
    itemLabel: "image",
    itemPlaceholder: "https://example.com/hero-16x9.jpg",
    hint: "One or more hero images. Multiple crops (16:9, 4:3, 1:1) maximise rich-result eligibility.",
  },
  {
    name: "keywords",
    label: "Article keywords",
    type: "list",
    full: true,
    itemLabel: "keyword",
    itemPlaceholder: "structured data",
    hint: "Optional topical tags for the article.",
  },
  {
    name: "articleBody",
    label: "Article body",
    type: "textarea",
    rows: 4,
    full: true,
    placeholder: "Optionally paste the full article text (or leave blank).",
    hint: "Optional. Included as articleBody when provided.",
  },
];

/* -------------------------------------------------------------------------- */
/*  State                                                                      */
/* -------------------------------------------------------------------------- */

type ArticleState = SchemaValues;

const INITIAL_STATE: ArticleState = {
  type: "BlogPosting",
  headline: "",
  url: "",
  description: "",
  authorName: "",
  authorUrl: "",
  publisherName: "",
  publisherLogo: "",
  datePublished: "",
  dateModified: "",
  images: [],
  keywords: [],
  articleBody: "",
};

const EXAMPLE: ArticleState = {
  type: "BlogPosting",
  headline: "The Complete Guide to Article Schema Markup in 2026",
  url: "https://example.com/blog/article-schema-guide",
  description:
    "How to add valid Article, BlogPosting and NewsArticle JSON-LD structured data and win article rich results in Google Search.",
  authorName: "Jordan Rivera",
  authorUrl: "https://example.com/authors/jordan-rivera",
  publisherName: "Example Media",
  publisherLogo: "https://example.com/logo.png",
  datePublished: "2026-06-01",
  dateModified: "2026-06-20",
  images: [
    "https://example.com/images/article-16x9.jpg",
    "https://example.com/images/article-4x3.jpg",
    "https://example.com/images/article-1x1.jpg",
  ],
  keywords: ["article schema", "structured data", "json-ld", "rich results"],
  articleBody: "",
};

/** Map the form values → a SchemaOutput via the engine. */
function buildFromState(v: ArticleState): SchemaOutput {
  const images = optList(v.images);
  return buildArticle({
    type: (str(v.type) || "Article") as ArticleType,
    headline: str(v.headline).trim(),
    url: opt(v.url),
    description: opt(v.description),
    image: images ? (images.length === 1 ? images[0] : images) : undefined,
    authorName: opt(v.authorName),
    authorUrl: opt(v.authorUrl),
    publisherName: opt(v.publisherName),
    publisherLogo: opt(v.publisherLogo),
    datePublished: opt(v.datePublished),
    dateModified: opt(v.dateModified),
    keywords: optList(v.keywords),
    articleBody: opt(v.articleBody),
  });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ArticleSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "sky");
  const [state, setState] = React.useState<ArticleState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);

  const output = React.useMemo<SchemaOutput>(() => buildFromState(state), [state]);
  const validation = React.useMemo(() => validateJsonLd(output.jsonLd), [output.jsonLd]);

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  const activeType = (str(state.type) || "Article") as ArticleType;
  const typeLabel =
    ARTICLE_TYPE_OPTIONS.find((o) => o.value === activeType)?.value ?? activeType;

  /* -- headline length coaching --------------------------------------------- */
  const headline = str(state.headline).trim();
  const headlineLen = headline.length;
  const headlineStatus: "empty" | "good" | "warn" =
    headlineLen === 0 ? "empty" : headlineLen > HEADLINE_LIMIT ? "warn" : "good";

  /* -- validity → checks + score -------------------------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "This property is required for a valid article rich result, fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but Google recommends it for article rich results.",
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
        label: "Required headline present",
        detail: `Valid ${validation.types.join(", ") || activeType} markup.`,
        group: "Required",
      });
    }

    // Headline length is a soft, non-schema check surfaced as its own row.
    if (headlineStatus === "warn") {
      items.push({
        id: "headline-length",
        status: "warn",
        label: "Headline may be truncated",
        detail: `Your headline is ${headlineLen} characters. Google truncates around ${HEADLINE_LIMIT}.`,
        fix: "Trim the headline so the full title reaches searchers.",
        group: "Recommended",
      });
    }

    const errPenalty = validation.errors.length * 30;
    const warnPenalty = validation.warnings.length * 7 + (headlineStatus === "warn" ? 5 : 0);
    const raw = 100 - errPenalty - warnPenalty;
    const s = validation.types.length === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [validation, activeType, headlineStatus, headlineLen]);

  const grade = gradeForScore(score);
  const softWarnCount = validation.warnings.length + (headlineStatus === "warn" ? 1 : 0);
  const summary = validation.ok
    ? softWarnCount === 0
      ? "Valid: all required and recommended properties are present."
      : `Valid; ${softWarnCount} ${softWarnCount === 1 ? "improvement" : "improvements"} would strengthen your rich-result eligibility.`
    : `${validation.errors.length} required ${validation.errors.length === 1 ? "property is" : "properties are"} missing.`;

  /* -- presets --------------------------------------------------------------- */
  const examples = React.useMemo<ReadonlyArray<Example<ArticleState>>>(
    () =>
      ARTICLE_TYPE_OPTIONS.map((o) => ({
        label: `${o.value} example`,
        description: o.label,
        icon: "Newspaper",
        value: { ...EXAMPLE, type: o.value } as ArticleState,
      })),
    [],
  );

  const serialize = React.useCallback((s: ArticleState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): ArticleState | null => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...INITIAL_STATE, ...(parsed as ArticleState) };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form ------------------------------------------------------------------ */
  const headlineCoach = (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 text-xs",
        headlineStatus === "warn"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : headlineStatus === "good"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border bg-muted/40 text-muted-foreground",
      )}
      aria-live="polite"
    >
      <span className="flex items-center gap-1.5">
        <Icon
          name={headlineStatus === "warn" ? "TriangleAlert" : headlineStatus === "good" ? "CircleCheck" : "Ruler"}
          size={13}
        />
        {headlineStatus === "empty"
          ? "Enter a headline: the one required field."
          : headlineStatus === "warn"
            ? "Headline may be truncated in Google Search."
            : "Headline length looks good for Search."}
      </span>
      <span className="font-mono tabular-nums">
        {headlineLen}/{HEADLINE_LIMIT}
      </span>
    </div>
  );

  const form = (
    <div className="flex flex-col gap-4">
      {headlineCoach}
      <SchemaForm
        fields={FIELDS}
        value={state}
        onChange={setState}
        idPrefix="article-schema"
      />
    </div>
  );

  /* -- preview: SERP snippet + validity -------------------------------------- */
  const preview = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Search preview
        </p>
        <SerpPreview
          title={headline || "Your article headline"}
          url={opt(state.url) ?? "https://example.com/blog/your-article"}
          description={
            opt(state.description) ??
            "Add a description to see how this article could appear in Google Search."
          }
          datePrefix={opt(state.datePublished)}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Rich-results validity
        </p>
        <div className="flex flex-col gap-4">
          <ScorePanel
            score={score}
            grade={grade}
            summary={summary}
            counts={{
              pass: checks.filter((c) => c.status === "pass").length,
              warn: softWarnCount,
              fail: validation.errors.length,
            }}
          />
          <CheckList
            items={checks}
            grouped
            emptyLabel="Enter a headline to validate your article markup."
          />
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
        </div>
      </div>
    </div>
  );

  const stats = (
    <>
      <StatBadge
        icon="Newspaper"
        label="Type"
        value={typeLabel}
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
    <GeneratorWithPreview<ArticleState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Preview & validity"
      downloadName={`${activeType.toLowerCase()}-schema.json`}
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
