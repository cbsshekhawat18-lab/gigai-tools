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
  buildProduct,
  validateJsonLd,
  type ProductInput,
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
/*  Option sets                                                               */
/* -------------------------------------------------------------------------- */

const CURRENCY_OPTS = [
  { value: "USD", label: "USD: US Dollar" },
  { value: "EUR", label: "EUR: Euro" },
  { value: "GBP", label: "GBP, British Pound" },
  { value: "INR", label: "INR, Indian Rupee" },
  { value: "CAD", label: "CAD, Canadian Dollar" },
  { value: "AUD", label: "AUD: Australian Dollar" },
  { value: "JPY", label: "JPY: Japanese Yen" },
] as const;

const AVAILABILITY_OPTS = [
  { value: "", label: "- not set -" },
  { value: "InStock", label: "In stock" },
  { value: "OutOfStock", label: "Out of stock" },
  { value: "PreOrder", label: "Pre-order" },
  { value: "BackOrder", label: "Back-order" },
  { value: "LimitedAvailability", label: "Limited availability" },
  { value: "Discontinued", label: "Discontinued" },
] as const;

const CONDITION_OPTS = [
  { value: "", label: "- not set -" },
  { value: "NewCondition", label: "New" },
  { value: "UsedCondition", label: "Used" },
  { value: "RefurbishedCondition", label: "Refurbished" },
  { value: "DamagedCondition", label: "Damaged" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Form spec, grouped: Product / Offer / Rating */
/* -------------------------------------------------------------------------- */

const FIELDS: ReadonlyArray<FieldSpec> = [
  {
    name: "name",
    label: "Product name",
    type: "text",
    required: true,
    full: true,
    placeholder: "Aurora Wireless Headphones",
    hint: "The exact product title shoppers see.",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 2,
    full: true,
    placeholder: "Over-ear ANC headphones with 40-hour battery life and studio-grade drivers.",
  },
  {
    name: "image",
    label: "Image URL",
    type: "url",
    full: true,
    placeholder: "https://example.com/products/aurora-headphones.jpg",
    hint: "Recommended, a direct, absolute URL to the product image.",
  },
  { name: "brand", label: "Brand", type: "text", placeholder: "Aurora" },
  {
    name: "identifiers",
    label: "Identifiers",
    type: "group",
    fields: [
      { name: "sku", label: "SKU", type: "text", placeholder: "AUR-HP-200" },
      { name: "gtin", label: "GTIN", type: "text", placeholder: "0123456789012", hint: "Barcode / UPC / EAN." },
      { name: "mpn", label: "MPN", type: "text", placeholder: "HP200" },
    ],
  },
  {
    name: "offer",
    label: "Offer (price & availability)",
    type: "group",
    fields: [
      { name: "price", label: "Price", type: "text", required: true, placeholder: "129.00", hint: "Number only, no currency symbol." },
      { name: "priceCurrency", label: "Currency", type: "select", required: true, options: [...CURRENCY_OPTS] },
      { name: "availability", label: "Availability", type: "select", options: [...AVAILABILITY_OPTS] },
      { name: "itemCondition", label: "Condition", type: "select", options: [...CONDITION_OPTS] },
      { name: "priceValidUntil", label: "Price valid until", type: "date" },
      { name: "url", label: "Offer / buy URL", type: "url", placeholder: "https://example.com/products/aurora-headphones" },
    ],
  },
  {
    name: "rating",
    label: "Aggregate rating",
    type: "group",
    fields: [
      { name: "ratingValue", label: "Rating value", type: "text", placeholder: "4.6", hint: "Average score, e.g. 4.6." },
      { name: "reviewCount", label: "Review count", type: "text", placeholder: "215", hint: "Number of reviews behind the score." },
      { name: "bestRating", label: "Best rating", type: "text", placeholder: "5" },
      { name: "worstRating", label: "Worst rating", type: "text", placeholder: "1" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

const EMPTY: SchemaValues = {
  name: "",
  description: "",
  image: "",
  brand: "",
  identifiers: { sku: "", gtin: "", mpn: "" },
  offer: {
    price: "",
    priceCurrency: "USD",
    availability: "",
    itemCondition: "",
    priceValidUntil: "",
    url: "",
  },
  rating: { ratingValue: "", reviewCount: "", bestRating: "", worstRating: "" },
};

const EXAMPLE: SchemaValues = {
  name: "Aurora Wireless Headphones",
  description:
    "Over-ear ANC headphones with 40-hour battery life, studio-grade drivers and a featherweight titanium frame.",
  image: "https://example.com/products/aurora-headphones.jpg",
  brand: "Aurora",
  identifiers: { sku: "AUR-HP-200", gtin: "0123456789012", mpn: "HP200" },
  offer: {
    price: "129.00",
    priceCurrency: "USD",
    availability: "InStock",
    itemCondition: "NewCondition",
    priceValidUntil: "2026-12-31",
    url: "https://example.com/products/aurora-headphones",
  },
  rating: { ratingValue: "4.6", reviewCount: "215", bestRating: "5", worstRating: "1" },
};

/** Read a nested group bag safely. */
function group(v: SchemaValues, key: string): SchemaValues {
  const g = v[key];
  return g && typeof g === "object" && !Array.isArray(g) ? (g as SchemaValues) : {};
}

/** Map the form values → a ProductInput for the engine. */
function toProductInput(v: SchemaValues): ProductInput {
  const id = group(v, "identifiers");
  const of = group(v, "offer");
  const rt = group(v, "rating");

  const hasOffer = Boolean(
    opt(of.price) || opt(of.priceCurrency) || opt(of.availability) || opt(of.itemCondition),
  );
  const hasRating = Boolean(opt(rt.ratingValue));

  return {
    name: str(v.name),
    description: opt(v.description),
    image: opt(v.image),
    brand: opt(v.brand),
    sku: opt(id.sku),
    gtin: opt(id.gtin),
    mpn: opt(id.mpn),
    offers: hasOffer
      ? {
          price: opt(of.price),
          priceCurrency: opt(of.priceCurrency),
          availability: opt(of.availability),
          itemCondition: opt(of.itemCondition),
          priceValidUntil: opt(of.priceValidUntil),
          url: opt(of.url),
        }
      : undefined,
    aggregateRating: hasRating
      ? {
          ratingValue: str(rt.ratingValue),
          reviewCount: opt(rt.reviewCount),
          bestRating: opt(rt.bestRating),
          worstRating: opt(rt.worstRating),
        }
      : undefined,
  };
}

/** Route a validation path to a friendly node group for the report. */
function nodeGroup(path?: string): string {
  if (!path) return "Product";
  if (path.includes("offers")) return "Offer (price)";
  if (path.includes("aggregateRating")) return "Rating (stars)";
  return "Product";
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ProductSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "amber");
  const [values, setValues] = React.useState<SchemaValues>(EMPTY);
  const [minified, setMinified] = React.useState(false);

  const input = React.useMemo(() => toProductInput(values), [values]);
  const output = React.useMemo<SchemaOutput>(() => buildProduct(input), [input]);
  const validation = React.useMemo(() => validateJsonLd(output.jsonLd), [output.jsonLd]);

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- checks + score from the validator ----------------------------------- */
  const { checks, score, rich } = React.useMemo(() => {
    const items: CheckItem[] = [];

    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "Required for a valid rich result: fill it in on the left.",
        group: nodeGroup(e.path),
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it strengthens your rich-result eligibility.",
        group: nodeGroup(w.path),
      });
    }

    // Rich-result eligibility flags (derived from the built JSON-LD).
    const hasName = Boolean(input.name.trim());
    const offer = input.offers;
    const priceEligible = Boolean(offer && opt(offer.price as FieldValue) && offer.priceCurrency);
    const ar = input.aggregateRating;
    const starEligible = Boolean(
      ar && String(ar.ratingValue).trim() && (ar.reviewCount || ar.ratingCount),
    );

    items.push({
      id: "elig-price",
      status: priceEligible ? "pass" : "info",
      label: "Price rich result",
      detail: priceEligible
        ? "Offer has a price and currency: eligible for a price snippet."
        : "Add an Offer price and currency to become eligible for a price snippet.",
      group: "Rich-result eligibility",
    });
    items.push({
      id: "elig-stars",
      status: starEligible ? "pass" : "info",
      label: "Star-rating rich result",
      detail: starEligible
        ? "AggregateRating has a value and review count, eligible for review stars."
        : "Add a rating value and review count to become eligible for review stars.",
      group: "Rich-result eligibility",
    });

    // Score: required errors weigh most; recommended warnings shave a little.
    const errPenalty = validation.errors.length * 20;
    const warnPenalty = validation.warnings.length * 6;
    const raw = 100 - errPenalty - warnPenalty;
    const s = !hasName ? 0 : Math.max(0, Math.min(100, raw));

    return {
      checks: items,
      score: s,
      rich: { price: priceEligible, stars: starEligible },
    };
  }, [validation, input]);

  const grade = gradeForScore(score);
  const summary = !input.name.trim()
    ? "Enter a product name to start building valid Product markup."
    : validation.ok
      ? validation.warnings.length === 0
        ? "Valid: all required and recommended properties are present."
        : `Valid; ${validation.warnings.length} recommended ${validation.warnings.length === 1 ? "property" : "properties"} would strengthen it.`
      : `${validation.errors.length} required ${validation.errors.length === 1 ? "property is" : "properties are"} missing.`;

  /* -- handlers ------------------------------------------------------------- */
  const loadExample = React.useCallback(() => setValues(EXAMPLE), []);

  const examples = React.useMemo<ReadonlyArray<Example<SchemaValues>>>(
    () => [
      {
        label: "Wireless headphones",
        description: "A fully-valid product with offer, rating, brand and identifiers.",
        icon: "Package",
        value: EXAMPLE,
      },
      {
        label: "Simple in-stock item",
        description: "Minimum viable product markup, name, price and availability.",
        icon: "Tag",
        value: {
          ...EMPTY,
          name: "Cotton Crew T-Shirt",
          description: "Heavyweight 100% organic cotton crew-neck tee.",
          image: "https://example.com/products/crew-tee.jpg",
          brand: "Everyday",
          offer: {
            ...group(EMPTY, "offer"),
            price: "24.00",
            priceCurrency: "USD",
            availability: "InStock",
            itemCondition: "NewCondition",
          },
        } as SchemaValues,
      },
    ],
    [],
  );

  const serialize = React.useCallback((v: SchemaValues) => JSON.stringify(v), []);
  const deserialize = React.useCallback((raw: string): SchemaValues | null => {
    try {
      const parsed = JSON.parse(raw) as SchemaValues;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form ----------------------------------------------------------------- */
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
          <Icon name="Braces" size={13} />
          Need another type? Open the schema hub
          <Icon name="ArrowUpRight" size={12} />
        </Link>
      </div>

      <div className="h-px bg-border" />

      <SchemaForm
        fields={FIELDS}
        value={values}
        onChange={setValues}
        idPrefix="product-schema"
      />
    </div>
  );

  /* -- preview -------------------------------------------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: validation.warnings.length,
          fail: validation.errors.length,
        }}
      />

      <div className="flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            rich.price
              ? cn(style.soft, "border-transparent")
              : "border-border text-muted-foreground",
          )}
        >
          <Icon name={rich.price ? "CircleCheck" : "Circle"} size={13} />
          Price snippet
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            rich.stars
              ? cn(style.soft, "border-transparent")
              : "border-border text-muted-foreground",
          )}
        >
          <Icon name={rich.stars ? "CircleCheck" : "Circle"} size={13} />
          Review stars
        </span>
      </div>

      <CheckList
        items={checks}
        grouped
        emptyLabel="Start filling the form to validate your product markup."
      />

      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Pragmatic required/recommended check for Product, Offer &amp; AggregateRating. Confirm
          final eligibility with{" "}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-medium underline underline-offset-2", style.text)}
          >
            Google&rsquo;s Rich Results Test
          </a>{" "}
          - Google requires aggregate ratings to reflect real, visible reviews.
        </span>
      </p>
    </div>
  );

  const stats = (
    <>
      <StatBadge icon="Package" label="Type" value="Product" tone="info" title="schema.org @type" />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={validation.ok ? "CircleCheck" : "XCircle"}
        label="Status"
        value={
          validation.ok
            ? "Valid"
            : `${validation.errors.length} error${validation.errors.length === 1 ? "" : "s"}`
        }
        tone={validation.ok ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<SchemaValues>
      value={values}
      onChange={setValues}
      initialValue={EMPTY}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & rich-results check"
      downloadName="product-schema.json"
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
