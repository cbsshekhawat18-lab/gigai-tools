"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  Field,
  SelectField,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SchemaForm,
  ScorePanel,
  CheckList,
  gradeForScore,
  type FieldSpec,
  type SchemaValues,
  type FieldValue,
  type CheckItem,
} from "@/components/tool/seo";
import { buildReview, validateJsonLd } from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  Value readers (terse + type-safe)                                         */
/* -------------------------------------------------------------------------- */

function str(v: FieldValue | undefined): string {
  return typeof v === "string" ? v : "";
}
function opt(v: FieldValue | undefined): string | undefined {
  const s = str(v).trim();
  return s ? s : undefined;
}
/** Parse a numeric field, tolerating "4,5" and stray spaces. */
function numOf(v: FieldValue | undefined): number | undefined {
  const s = str(v).trim().replace(",", ".");
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/* -------------------------------------------------------------------------- */
/*  itemReviewed types eligible for the Google review snippet                 */
/* -------------------------------------------------------------------------- */

/**
 * The schema.org types Google supports for review snippets. Reviewing anything
 * outside this set (or a vague category / whole site) will not earn stars, so
 * we constrain the picker to eligible types with a plain-language label.
 */
const ITEM_TYPE_OPTIONS = [
  { value: "Product", label: "Product" },
  { value: "LocalBusiness", label: "Local business" },
  { value: "Book", label: "Book" },
  { value: "Course", label: "Course" },
  { value: "CreativeWorkSeason", label: "TV / series season" },
  { value: "Episode", label: "Episode" },
  { value: "Event", label: "Event" },
  { value: "Game", label: "Game" },
  { value: "HowTo", label: "How-to" },
  { value: "Movie", label: "Movie" },
  { value: "MusicPlaylist", label: "Music playlist" },
  { value: "MusicRecording", label: "Music recording" },
  { value: "Organization", label: "Organization" },
  { value: "Recipe", label: "Recipe" },
  { value: "SoftwareApplication", label: "Software application" },
] as const;

const ITEM_TYPE_VALUES = new Set<string>(ITEM_TYPE_OPTIONS.map((o) => o.value));
const DEFAULT_ITEM_TYPE = "Product";

/* -------------------------------------------------------------------------- */
/*  Form spec                                                                 */
/* -------------------------------------------------------------------------- */

const FIELDS: ReadonlyArray<FieldSpec> = [
  {
    name: "itemName",
    label: "Item reviewed",
    type: "text",
    required: true,
    placeholder: "Aurora Wireless Headphones",
    hint: "The specific thing this review is about.",
    full: true,
  },
  {
    name: "author",
    label: "Reviewer name",
    type: "text",
    placeholder: "Sam Patel",
    hint: "The person (or third party) who wrote the review.",
  },
  {
    name: "datePublished",
    label: "Date published",
    type: "date",
  },
  {
    name: "reviewBody",
    label: "Review",
    type: "textarea",
    rows: 4,
    placeholder:
      "Superb noise cancellation and the battery genuinely lasts all week. Best value at this price.",
    full: true,
  },
  {
    name: "ratingValue",
    label: "Rating",
    type: "text",
    required: true,
    placeholder: "5",
    hint: "The score given, e.g. 4.5.",
  },
  {
    name: "bestRating",
    label: "Best rating",
    type: "text",
    placeholder: "5",
    hint: "Top of the scale (default 5).",
  },
  {
    name: "worstRating",
    label: "Worst rating",
    type: "text",
    placeholder: "1",
    hint: "Bottom of the scale (default 1).",
  },
];

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

interface ReviewState {
  /** schema.org @type applied to itemReviewed (constrained to eligible types). */
  itemType: string;
  values: SchemaValues;
}

const INITIAL_VALUES: SchemaValues = {
  itemName: "",
  author: "",
  datePublished: "",
  reviewBody: "",
  ratingValue: "",
  bestRating: "",
  worstRating: "",
};

const INITIAL_STATE: ReviewState = {
  itemType: DEFAULT_ITEM_TYPE,
  values: INITIAL_VALUES,
};

const EXAMPLE_STATE: ReviewState = {
  itemType: "Product",
  values: {
    itemName: "Aurora Wireless Headphones",
    author: "Sam Patel",
    datePublished: "2026-05-20",
    reviewBody:
      "Superb noise cancellation and the battery genuinely lasts all week. The fit is comfortable for long sessions and the app is refreshingly simple. Easily the best value at this price.",
    ratingValue: "4.5",
    bestRating: "5",
    worstRating: "1",
  },
};

const EXAMPLES: ReadonlyArray<Example<ReviewState>> = [
  {
    label: "Product review",
    description: "A customer review of a product, with a 4.5/5 star rating.",
    icon: "Package",
    value: EXAMPLE_STATE,
  },
  {
    label: "Book review",
    description: "An editorial review of a book on a 1–5 scale.",
    icon: "BookOpen",
    value: {
      itemType: "Book",
      values: {
        itemName: "The Pragmatic Programmer",
        author: "Jordan Rivera",
        datePublished: "2026-04-11",
        reviewBody:
          "A timeless, practical guide. The advice on automation and orthogonality still holds up, and the tips are worth revisiting yearly.",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
      },
    },
  },
  {
    label: "Movie review (1–10)",
    description: "A film review on a 1–10 scale, note bestRating 10.",
    icon: "Film",
    value: {
      itemType: "Movie",
      values: {
        itemName: "Echoes of Tomorrow",
        author: "Priya Nair",
        datePublished: "2026-06-02",
        reviewBody:
          "Gorgeously shot and tightly paced, with a score that lingers. It stumbles in the third act but the lead performance carries it.",
        ratingValue: "8",
        bestRating: "10",
        worstRating: "1",
      },
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Star preview                                                              */
/* -------------------------------------------------------------------------- */

interface Stars {
  best: number;
  worst: number;
  value: number;
  /** value scaled to a 0–5 scale for rendering. */
  outOfFive: number;
}

function starsFrom(value: number | undefined, best: number, worst: number): Stars | null {
  if (value === undefined) return null;
  const lo = Math.min(worst, best);
  const hi = Math.max(worst, best);
  const span = hi - lo;
  const clamped = Math.min(hi, Math.max(lo, value));
  const outOfFive = span > 0 ? ((clamped - lo) / span) * 5 : 0;
  return { best: hi, worst: lo, value, outOfFive };
}

function StarRow({ stars, className }: { stars: Stars; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, stars.outOfFive - i));
        return (
          <span key={i} className="relative inline-block h-5 w-5">
            <Icon
              name="Star"
              size={20}
              className="absolute inset-0 text-muted-foreground/30"
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Icon
                name="Star"
                size={20}
                className="text-amber-400 [&_*]:fill-amber-400"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ReviewSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "amber");
  const [state, setState] = React.useState<ReviewState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);

  const { itemType, values } = state;

  /* -- parsed rating scale --------------------------------------------------- */
  const ratingValue = numOf(values.ratingValue);
  const bestRating = numOf(values.bestRating);
  const worstRating = numOf(values.worstRating);
  const effBest = bestRating ?? 5;
  const effWorst = worstRating ?? 1;

  /* -- build JSON-LD via the engine, then apply the chosen itemReviewed type - */
  const output = React.useMemo(() => {
    const base = buildReview({
      itemName: opt(values.itemName),
      author: opt(values.author),
      reviewBody: opt(values.reviewBody),
      ratingValue: ratingValue !== undefined ? String(ratingValue) : undefined,
      bestRating: bestRating,
      worstRating: worstRating,
      datePublished: opt(values.datePublished),
    });

    // buildReview types itemReviewed as a generic "Thing"; retype it to the
    // eligible schema.org type the user picked (engine output stays canonical).
    const jsonLd = base.jsonLd as Record<string, unknown>;
    const item = jsonLd.itemReviewed;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      (item as Record<string, unknown>)["@type"] = itemType;
    }

    const pretty = JSON.stringify(jsonLd, null, 2);
    const minifiedStr = JSON.stringify(jsonLd);
    const scriptTag = `<script type="application/ld+json">\n${pretty}\n</script>`;
    return { jsonLd, pretty, minified: minifiedStr, scriptTag };
  }, [values, itemType, ratingValue, bestRating, worstRating]);

  const validation = React.useMemo(
    () => validateJsonLd(output.jsonLd),
    [output.jsonLd],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- rating range guard (beyond the engine's required-property check) ------ */
  const ratingOutOfRange =
    ratingValue !== undefined &&
    (ratingValue < Math.min(effWorst, effBest) ||
      ratingValue > Math.max(effWorst, effBest));
  const scaleInverted = bestRating !== undefined && worstRating !== undefined && effBest <= effWorst;

  /* -- checks + score -------------------------------------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];

    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "This property is required for a valid review snippet: fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it makes the review more trustworthy to Google.",
        group: "Recommended",
      });
    }

    // Extra, review-specific guards not covered by the generic validator.
    if (scaleInverted) {
      items.push({
        id: "scale-inverted",
        status: "fail",
        label: "Rating scale is inverted",
        detail: "Best rating must be greater than worst rating.",
        fix: "Set best rating above worst rating (e.g. best 5, worst 1).",
        group: "Rating scale",
      });
    } else if (ratingOutOfRange) {
      items.push({
        id: "rating-range",
        status: "fail",
        label: "Rating is outside its scale",
        detail: `${ratingValue} is not between ${Math.min(effWorst, effBest)} and ${Math.max(effWorst, effBest)}.`,
        fix: "Adjust the rating, or set bestRating/worstRating to match your scale.",
        group: "Rating scale",
      });
    } else if (ratingValue !== undefined) {
      items.push({
        id: "rating-ok",
        status: "pass",
        label: "Rating is within scale",
        detail: `${ratingValue} of ${Math.max(effWorst, effBest)}: valid.`,
        group: "Rating scale",
      });
    }

    if (!opt(values.itemName)) {
      items.push({
        id: "item-missing",
        status: "warn",
        label: "No item to review",
        detail: "itemReviewed has no name. Google needs a specific, eligible item.",
        fix: "Name the exact thing the review is about (a product, book, movie…).",
        group: "Recommended",
      });
    }

    const valid = validation.ok && !scaleInverted && !ratingOutOfRange;
    if (valid && validation.warnings.length === 0 && opt(values.itemName)) {
      items.push({
        id: "all-good",
        status: "pass",
        label: "All required & recommended properties present",
        detail: "Valid Review markup: ready to test in Google's Rich Results Test.",
        group: "Required",
      });
    }

    const errCount = validation.errors.length + (scaleInverted ? 1 : 0) + (ratingOutOfRange ? 1 : 0);
    const errPenalty = errCount * 30;
    const warnPenalty = (validation.warnings.length + (opt(values.itemName) ? 0 : 1)) * 8;
    const hasType = validation.types.length > 0;
    const raw = 100 - errPenalty - warnPenalty;
    const s = hasType ? Math.max(0, Math.min(100, raw)) : 0;
    return { checks: items, score: s };
  }, [validation, scaleInverted, ratingOutOfRange, ratingValue, effBest, effWorst, values.itemName]);

  const overallValid = validation.ok && !scaleInverted && !ratingOutOfRange;
  const grade = gradeForScore(score);
  const summary = overallValid
    ? validation.warnings.length === 0 && opt(values.itemName)
      ? "Valid. All required and recommended properties are present."
      : "Valid. A few recommended fields would strengthen the review."
    : `${checks.filter((c) => c.status === "fail").length} issue${checks.filter((c) => c.status === "fail").length === 1 ? "" : "s"} to fix before this is eligible.`;

  /* -- preview stars --------------------------------------------------------- */
  const stars = starsFrom(ratingValue, effBest, effWorst);

  /* -- handlers -------------------------------------------------------------- */
  const setValues = React.useCallback((next: SchemaValues) => {
    setState((s) => ({ ...s, values: next }));
  }, []);

  const setItemType = React.useCallback((next: string) => {
    setState((s) => ({ ...s, itemType: next }));
  }, []);

  const loadExample = React.useCallback(() => {
    setState(EXAMPLE_STATE);
  }, []);

  const serialize = React.useCallback((s: ReviewState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): ReviewState | null => {
    try {
      const parsed = JSON.parse(raw) as ReviewState;
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.itemType === "string" &&
        parsed.values &&
        typeof parsed.values === "object"
      ) {
        return {
          itemType: ITEM_TYPE_VALUES.has(parsed.itemType) ? parsed.itemType : DEFAULT_ITEM_TYPE,
          values: { ...INITIAL_VALUES, ...parsed.values },
        };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form ------------------------------------------------------------------ */
  const form = (
    <div className="flex flex-col gap-4">
      <Field
        label="Reviewed item type"
        htmlFor="review-item-type"
        hint="Only these schema.org types are eligible for Google's review snippet."
      >
        <SelectField<string>
          id="review-item-type"
          className="w-full"
          ariaLabel="Reviewed item type"
          value={itemType}
          onChange={setItemType}
          options={ITEM_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={loadExample}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            style.soft,
          )}
        >
          <Icon name="Sparkles" size={13} />
          Fill with example
        </button>
        <Link
          href="/schema-generator"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Braces" size={13} />
          Need AggregateRating? Open the schema hub
          <Icon name="ArrowUpRight" size={12} />
        </Link>
      </div>

      <div className="h-px bg-border" />

      <SchemaForm
        fields={FIELDS}
        value={values}
        onChange={setValues}
        idPrefix="review-schema"
      />

      <p
        role="note"
        className="flex items-start gap-2 rounded-md border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
      >
        <Icon name="ShieldAlert" size={14} className="mt-0.5 shrink-0 text-amber-500" />
        <span>
          <span className="font-medium text-foreground">Policy:</span> Google forbids{" "}
          <span className="font-medium text-foreground">self-serving reviews</span> - don&rsquo;t add a
          review of your own business, product or service to your own page. Mark up a single,
          genuine review of a specific eligible item that is visible on the page.
        </span>
      </p>
    </div>
  );

  /* -- preview --------------------------------------------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Star preview
          </span>
          {stars ? (
            <span className="text-xs text-muted-foreground">
              {stars.value} of {Math.max(effWorst, effBest)}
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-3">
          {stars ? (
            <StarRow stars={stars} />
          ) : (
            <span className="text-sm text-muted-foreground">Enter a rating to preview stars.</span>
          )}
        </div>
        {opt(values.itemName) ? (
          <p className="mt-3 text-sm text-foreground">
            <span className="text-muted-foreground">Review of </span>
            <span className="font-medium">{str(values.itemName)}</span>
            <span className="text-muted-foreground"> ({itemType})</span>
            {opt(values.author) ? (
              <span className="text-muted-foreground"> by {str(values.author)}</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: checks.filter((c) => c.status === "warn").length,
          fail: checks.filter((c) => c.status === "fail").length,
        }}
      />
      <CheckList
        items={checks}
        grouped
        emptyLabel="Start filling the form to validate your review markup."
      />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a pragmatic required/recommended check. Confirm final review-snippet eligibility
          with{" "}
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
  );

  const stats = (
    <>
      <StatBadge
        icon="Star"
        label="Type"
        value="Review"
        tone="info"
        title="Active schema.org @type"
      />
      <StatBadge
        icon="Package"
        label="Item"
        value={itemType}
        title="itemReviewed @type"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={overallValid ? "CircleCheck" : "XCircle"}
        label="Status"
        value={overallValid ? "Valid" : `${checks.filter((c) => c.status === "fail").length} error${checks.filter((c) => c.status === "fail").length === 1 ? "" : "s"}`}
        tone={overallValid ? "success" : "danger"}
        title="Review-markup validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<ReviewState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Star preview & validity check"
      downloadName="review-schema.json"
      downloadMime="application/ld+json;charset=utf-8"
      examples={EXAMPLES}
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
