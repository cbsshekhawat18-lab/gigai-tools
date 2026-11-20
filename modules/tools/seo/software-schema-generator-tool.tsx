"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { StatBadge, type Example } from "@/components/tool/dev";
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
import {
  buildSoftwareApplication,
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

/* -------------------------------------------------------------------------- */
/*  Option catalogues (schema.org enums a marketer actually reaches for)       */
/* -------------------------------------------------------------------------- */

const CATEGORY_OPTS = [
  { value: "", label: "- Select category -" },
  { value: "BusinessApplication", label: "BusinessApplication" },
  { value: "DeveloperApplication", label: "DeveloperApplication" },
  { value: "DesignApplication", label: "DesignApplication" },
  { value: "ProductivityApplication", label: "ProductivityApplication" },
  { value: "CommunicationApplication", label: "CommunicationApplication" },
  { value: "SecurityApplication", label: "SecurityApplication" },
  { value: "FinanceApplication", label: "FinanceApplication" },
  { value: "EducationalApplication", label: "EducationalApplication" },
  { value: "UtilitiesApplication", label: "UtilitiesApplication" },
  { value: "MultimediaApplication", label: "MultimediaApplication" },
  { value: "GameApplication", label: "GameApplication" },
  { value: "HealthApplication", label: "HealthApplication" },
  { value: "TravelApplication", label: "TravelApplication" },
];

const CURRENCY_OPTS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
  { value: "JPY", label: "JPY" },
];

const AVAILABILITY_OPTS = [
  { value: "", label: "- Not set -" },
  { value: "InStock", label: "In stock / available" },
  { value: "OnlineOnly", label: "Online only" },
  { value: "PreOrder", label: "Pre-order" },
  { value: "OutOfStock", label: "Out of stock" },
];

/* -------------------------------------------------------------------------- */
/*  Form spec: a single tailored SoftwareApplication form */
/* -------------------------------------------------------------------------- */

const FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "name", label: "App name", type: "text", required: true, placeholder: "GigAI Tools", full: true },
  { name: "description", label: "Description", type: "textarea", rows: 2, placeholder: "One-line pitch of what the software does.", full: true },
  { name: "applicationCategory", label: "Application category", type: "select", options: CATEGORY_OPTS, hint: "schema.org enum: recommended for eligibility." },
  { name: "operatingSystem", label: "Operating system(s)", type: "text", placeholder: "Web, iOS, Android", hint: "Comma-separated list is fine." },
  { name: "url", label: "App / landing URL", type: "url", placeholder: "https://example.com/app" },
  { name: "image", label: "Icon / screenshot URL", type: "url", placeholder: "https://example.com/icon.png" },
  { name: "softwareVersion", label: "Version", type: "text", placeholder: "3.2.1" },
  { name: "price", label: "Price", type: "text", placeholder: "0 for free", hint: "Enter 0 to mark the app as free." },
  { name: "priceCurrency", label: "Currency", type: "select", options: CURRENCY_OPTS },
  { name: "availability", label: "Availability", type: "select", options: AVAILABILITY_OPTS },
  { name: "ratingValue", label: "Rating value", type: "text", placeholder: "4.8" },
  { name: "reviewCount", label: "Review / rating count", type: "text", placeholder: "1200" },
];

/** Seed an empty values bag matching FIELDS (so controlled inputs never go undefined). */
function emptyValues(): SchemaValues {
  const out: SchemaValues = {};
  for (const f of FIELDS) {
    out[f.name] = f.type === "select" ? f.options[0]?.value ?? "" : "";
  }
  return out;
}

const EXAMPLE: SchemaValues = {
  name: "GigAI Tools",
  description:
    "A free, privacy-first toolkit of website and SEO tools that run entirely in your browser.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://gigai.tools",
  image: "https://gigai.tools/icon.png",
  softwareVersion: "3.0.0",
  price: "0",
  priceCurrency: "USD",
  availability: "InStock",
  ratingValue: "4.8",
  reviewCount: "1200",
};

const PAID_EXAMPLE: SchemaValues = {
  name: "Aurora Design Studio",
  description:
    "A collaborative vector design app for teams, with real-time editing and version history.",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web, macOS, Windows",
  url: "https://aurora.example.com",
  image: "https://aurora.example.com/app-icon.png",
  softwareVersion: "12.4.0",
  price: "15.00",
  priceCurrency: "USD",
  availability: "InStock",
  ratingValue: "4.6",
  reviewCount: "3820",
};

const INITIAL: SchemaValues = emptyValues();

/* -------------------------------------------------------------------------- */
/*  Build: values → SoftwareApplication JSON-LD                               */
/* -------------------------------------------------------------------------- */

/**
 * A price of "0" is meaningful (it marks the app as free), so we treat the
 * offer as present whenever price OR currency OR availability is supplied and
 * pass the raw string through: including "0".
 */
function build(v: SchemaValues): SchemaOutput {
  const price = str(v.price).trim();
  const hasPrice = price !== "";
  const currency = opt(v.priceCurrency);
  const availability = opt(v.availability);
  const hasOffer = hasPrice || Boolean(currency) || Boolean(availability);

  const ratingValue = opt(v.ratingValue);

  return buildSoftwareApplication({
    name: str(v.name),
    description: opt(v.description),
    applicationCategory: opt(v.applicationCategory),
    operatingSystem: opt(v.operatingSystem),
    url: opt(v.url),
    image: opt(v.image),
    softwareVersion: opt(v.softwareVersion),
    offers: hasOffer
      ? {
          price: hasPrice ? price : undefined,
          priceCurrency: currency,
          availability,
          url: opt(v.url),
        }
      : undefined,
    aggregateRating: ratingValue
      ? { ratingValue, reviewCount: opt(v.reviewCount) }
      : undefined,
  });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function SoftwareSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "cyan");
  const [values, setValues] = React.useState<SchemaValues>(INITIAL);
  const [minified, setMinified] = React.useState(false);

  const output = React.useMemo<SchemaOutput>(() => build(values), [values]);
  const validation = React.useMemo(
    () => validateJsonLd(output.jsonLd),
    [output.jsonLd],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- soft, app-specific advisories on top of the engine validator ---------- */
  const advisories = React.useMemo(() => {
    const notes: CheckItem[] = [];
    const offers = (output.jsonLd as { offers?: { price?: string } }).offers;
    const rating = (output.jsonLd as { aggregateRating?: { reviewCount?: unknown; ratingCount?: unknown } })
      .aggregateRating;

    if (offers?.price === "0") {
      notes.push({
        id: "free-ok",
        status: "info",
        label: "Marked as free (price 0)",
        detail: "An Offer with price 0 is exactly how Google recognises free software.",
        group: "Rich result",
      });
    }
    if (rating && rating.reviewCount === undefined && rating.ratingCount === undefined) {
      notes.push({
        id: "rating-count",
        status: "warn",
        label: "Rating has no review count",
        detail: "Add a review or rating count: Google usually ignores a rating value with no count.",
        fix: "Fill in “Review / rating count” above.",
        group: "Rich result",
      });
    }
    if (!offers) {
      notes.push({
        id: "no-offer",
        status: "info",
        label: "No price set",
        detail: "Add a price (use 0 for free) to become eligible for a pricing enhancement.",
        group: "Rich result",
      });
    }
    return notes;
  }, [output.jsonLd]);

  /* -- score + checks from the validator + advisories ------------------------ */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "This property is required for valid markup, fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it improves your rich-result eligibility.",
        group: "Recommended",
      });
    }
    if (validation.ok) {
      items.push({
        id: "required-ok",
        status: "pass",
        label: "Required properties present",
        detail: `Valid ${validation.types.join(", ") || "SoftwareApplication"} markup.`,
        group: "Required",
      });
    }
    items.push(...advisories);

    const errPenalty = validation.errors.length * 40;
    const warnPenalty = validation.warnings.length * 8;
    const advWarnPenalty = advisories.filter((a) => a.status === "warn").length * 6;
    const raw = 100 - errPenalty - warnPenalty - advWarnPenalty;
    const s = validation.types.length === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [validation, advisories]);

  const grade = gradeForScore(score);
  const summary = validation.ok
    ? validation.warnings.length === 0
      ? "Valid SoftwareApplication markup, required and recommended properties present."
      : `Valid; ${validation.warnings.length} recommended ${validation.warnings.length === 1 ? "property" : "properties"} would strengthen it.`
    : "An app name is required before the markup is valid.";

  /* -- handlers -------------------------------------------------------------- */
  const loadExample = React.useCallback(() => setValues(EXAMPLE), []);

  const examples = React.useMemo<ReadonlyArray<Example<SchemaValues>>>(
    () => [
      { label: "Free web app", description: "SaaS toolkit priced at 0 with a star rating.", icon: "Gift", value: EXAMPLE },
      { label: "Paid app", description: "Cross-platform design app with a price and rating.", icon: "BadgeDollarSign", value: PAID_EXAMPLE },
    ],
    [],
  );

  const serialize = React.useCallback((v: SchemaValues) => JSON.stringify(v), []);
  const deserialize = React.useCallback((raw: string): SchemaValues | null => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...emptyValues(), ...(parsed as SchemaValues) };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form ------------------------------------------------------------------ */
  const form = (
    <div className="flex flex-col gap-4">
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
          <Icon name="LayoutGrid" size={13} />
          Need another type? Open the schema hub
          <Icon name="ArrowUpRight" size={12} />
        </Link>
      </div>

      <div className="h-px bg-border" />

      <SchemaForm
        fields={FIELDS}
        value={values}
        onChange={setValues}
        idPrefix="software-schema"
      />
    </div>
  );

  /* -- preview --------------------------------------------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: validation.warnings.length + advisories.filter((a) => a.status === "warn").length,
          fail: validation.errors.length,
        }}
      />
      <CheckList
        items={checks}
        grouped
        emptyLabel="Enter an app name to start validating your markup."
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
  );

  const stats = (
    <>
      <StatBadge
        icon="AppWindow"
        label="Type"
        value="SoftwareApplication"
        tone="info"
        title="schema.org @type"
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
        value={validation.ok ? "Valid" : "Missing name"}
        tone={validation.ok ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<SchemaValues>
      value={values}
      onChange={setValues}
      initialValue={INITIAL}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & rich-results check"
      downloadName="software-application-schema.json"
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
