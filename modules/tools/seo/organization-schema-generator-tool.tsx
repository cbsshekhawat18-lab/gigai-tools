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
  buildGeneric,
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
function rows(v: FieldValue | undefined): SchemaValues[] {
  return Array.isArray(v) && v.every((x) => x && typeof x === "object" && !Array.isArray(x))
    ? (v as SchemaValues[])
    : [];
}

/* -------------------------------------------------------------------------- */
/*  Field catalogue                                                           */
/* -------------------------------------------------------------------------- */

const TYPE_OPTS = [
  { value: "Organization", label: "Organization (default)" },
  { value: "Corporation", label: "Corporation" },
  { value: "OnlineBusiness", label: "OnlineBusiness" },
  { value: "NGO", label: "NGO / non-profit" },
  { value: "EducationalOrganization", label: "EducationalOrganization" },
  { value: "GovernmentOrganization", label: "GovernmentOrganization" },
  { value: "NewsMediaOrganization", label: "NewsMediaOrganization" },
  { value: "LocalBusiness", label: "LocalBusiness" },
];

const CONTACT_TYPE_OPTS = [
  { value: "customer support", label: "Customer support" },
  { value: "sales", label: "Sales" },
  { value: "technical support", label: "Technical support" },
  { value: "billing support", label: "Billing support" },
  { value: "reservations", label: "Reservations" },
  { value: "press", label: "Press / media" },
  { value: "emergency", label: "Emergency" },
];

const FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "type", label: "Organization @type", type: "select", options: TYPE_OPTS, hint: "Use a subtype only if it clearly fits. Organization is the safe default." },
  { name: "name", label: "Organization name", type: "text", required: true, full: true, placeholder: "Example Inc." },
  { name: "url", label: "Website URL", type: "url", placeholder: "https://example.com" },
  { name: "logo", label: "Logo URL", type: "url", placeholder: "https://example.com/logo.png", hint: "A directly crawlable image on your official domain." },
  { name: "description", label: "Description", type: "textarea", rows: 2, full: true, placeholder: "One or two sentences describing what your organization does." },
  { name: "legalName", label: "Legal name", type: "text", placeholder: "Example Incorporated Ltd." },
  { name: "alternateName", label: "Alternate name", type: "text", placeholder: "Example" },
  { name: "email", label: "Email", type: "email", placeholder: "hello@example.com" },
  { name: "telephone", label: "Telephone", type: "text", placeholder: "+1-555-0100" },
  { name: "foundingDate", label: "Founding date", type: "date" },
  {
    name: "sameAs",
    label: "Social & profile URLs (sameAs)",
    type: "list",
    full: true,
    itemLabel: "profile URL",
    itemPlaceholder: "https://www.linkedin.com/company/example",
    hint: "Only add official profiles you control.",
  },
  {
    name: "streetAddress",
    label: "Street address",
    type: "text",
    full: true,
    placeholder: "123 Main St, Suite 400",
  },
  { name: "addressLocality", label: "City", type: "text", placeholder: "Springfield" },
  { name: "addressRegion", label: "Region / state", type: "text", placeholder: "IL" },
  { name: "postalCode", label: "Postal code", type: "text", placeholder: "62704" },
  { name: "addressCountry", label: "Country", type: "text", placeholder: "US" },
  {
    name: "contactPoints",
    label: "Contact points",
    type: "group",
    full: true,
    repeatable: true,
    addLabel: "Add contact point",
    fields: [
      { name: "contactType", label: "Contact type", type: "select", options: CONTACT_TYPE_OPTS },
      { name: "telephone", label: "Telephone", type: "text", placeholder: "+1-555-0100" },
      { name: "email", label: "Email", type: "email", placeholder: "support@example.com" },
      { name: "availableLanguage", label: "Languages", type: "text", placeholder: "English, Spanish", hint: "Comma-separated." },
      { name: "areaServed", label: "Area served", type: "text", placeholder: "US, CA, GB", hint: "Comma-separated country codes or regions." },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Example preset                                                            */
/* -------------------------------------------------------------------------- */

const EXAMPLE: SchemaValues = {
  type: "Organization",
  name: "Aurora Labs",
  url: "https://aurora.example.com",
  logo: "https://aurora.example.com/logo.png",
  description:
    "Aurora Labs builds privacy-first developer and SEO tools that run entirely in the browser.",
  legalName: "Aurora Labs, Inc.",
  alternateName: "Aurora",
  email: "hello@aurora.example.com",
  telephone: "+1-555-0100",
  foundingDate: "2019-04-01",
  sameAs: [
    "https://twitter.com/auroralabs",
    "https://www.linkedin.com/company/aurora-labs",
    "https://github.com/aurora-labs",
    "https://en.wikipedia.org/wiki/Aurora_Labs",
  ],
  streetAddress: "500 Market St, Suite 300",
  addressLocality: "San Francisco",
  addressRegion: "CA",
  postalCode: "94105",
  addressCountry: "US",
  contactPoints: [
    {
      contactType: "customer support",
      telephone: "+1-555-0100",
      email: "support@aurora.example.com",
      availableLanguage: "English, Spanish",
      areaServed: "US, CA",
    },
    {
      contactType: "sales",
      telephone: "+1-555-0111",
      email: "sales@aurora.example.com",
      availableLanguage: "English",
      areaServed: "US, CA, GB",
    },
  ],
};

/** An empty values bag seeded with each field's empty default. */
function emptyValues(): SchemaValues {
  const out: SchemaValues = {};
  for (const f of FIELDS) {
    switch (f.type) {
      case "list":
        out[f.name] = [];
        break;
      case "group":
        out[f.name] = f.repeatable ? [] : {};
        break;
      case "select":
        out[f.name] = f.options[0]?.value ?? "";
        break;
      default:
        out[f.name] = "";
    }
  }
  return out;
}

const INITIAL_VALUES = emptyValues();

/* -------------------------------------------------------------------------- */
/*  Builder, Organization JSON-LD (via buildGeneric for contactPoint) */
/* -------------------------------------------------------------------------- */

/** Split a comma-separated field into a clean string array. */
function csv(v: FieldValue | undefined): string[] {
  return str(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** One-or-many helper: collapse single-element arrays to a scalar. */
function oneOrMany(values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  return values.length === 1 ? values[0] : values;
}

function buildContactPoints(v: SchemaValues): Record<string, unknown>[] | undefined {
  const points = rows(v.contactPoints)
    .map((cp): Record<string, unknown> | null => {
      const telephone = opt(cp.telephone);
      const email = opt(cp.email);
      const contactType = opt(cp.contactType);
      // Skip fully-empty rows so a stray "Add" doesn't emit a blank node.
      if (!telephone && !email && !contactType) return null;
      return {
        "@type": "ContactPoint",
        contactType,
        telephone,
        email,
        availableLanguage: oneOrMany(csv(cp.availableLanguage)),
        areaServed: oneOrMany(csv(cp.areaServed)),
      };
    })
    .filter((x): x is Record<string, unknown> => x !== null);
  return points.length ? points : undefined;
}

function buildAddress(v: SchemaValues): Record<string, unknown> | undefined {
  const streetAddress = opt(v.streetAddress);
  const addressLocality = opt(v.addressLocality);
  const addressRegion = opt(v.addressRegion);
  const postalCode = opt(v.postalCode);
  const addressCountry = opt(v.addressCountry);
  if (!streetAddress && !addressLocality && !addressRegion && !postalCode && !addressCountry) {
    return undefined;
  }
  return {
    "@type": "PostalAddress",
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry,
  };
}

function buildOutput(v: SchemaValues): SchemaOutput {
  return buildGeneric(str(v.type) || "Organization", {
    name: str(v.name),
    url: opt(v.url),
    logo: opt(v.logo),
    description: opt(v.description),
    legalName: opt(v.legalName),
    alternateName: opt(v.alternateName),
    email: opt(v.email),
    telephone: opt(v.telephone),
    foundingDate: opt(v.foundingDate),
    address: buildAddress(v),
    contactPoint: buildContactPoints(v),
    sameAs: optList(v.sameAs),
  });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function OrganizationSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "sky");
  const [values, setValues] = React.useState<SchemaValues>(INITIAL_VALUES);
  const [minified, setMinified] = React.useState(false);

  const output = React.useMemo<SchemaOutput>(() => buildOutput(values), [values]);
  const validation = React.useMemo(() => validateJsonLd(output.jsonLd), [output.jsonLd]);

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- counts of the useful entities we emitted ------------------------------ */
  const sameAsCount = optList(values.sameAs)?.length ?? 0;
  const contactCount = buildContactPoints(values)?.length ?? 0;

  /* -- score + grouped check rows from the validator ------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "This property is required for valid Organization markup, fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it helps search engines understand your brand entity.",
        group: "Recommended",
      });
    }
    if (validation.ok && validation.warnings.length === 0 && validation.types.length > 0) {
      items.push({
        id: "all-good",
        status: "pass",
        label: "All required & recommended properties present",
        detail: `Valid ${validation.types.join(", ")} markup: ready to publish.`,
        group: "Required",
      });
    } else if (validation.ok) {
      items.push({
        id: "required-ok",
        status: "pass",
        label: "Required properties present",
        detail: `Valid ${validation.types.join(", ") || "Organization"} markup.`,
        group: "Required",
      });
    }

    // Informational nudges. Not scored, just guidance.
    if (validation.ok && sameAsCount === 0) {
      items.push({
        id: "info-sameas",
        status: "info",
        label: "No sameAs profiles added",
        detail: "Linking your official social/profile URLs strengthens brand-entity recognition.",
        group: "Recommended",
      });
    }
    if (validation.ok && contactCount === 0) {
      items.push({
        id: "info-contact",
        status: "info",
        label: "No contact points added",
        detail: "A contactPoint (e.g. customer support) tells search engines how to reach you.",
        group: "Recommended",
      });
    }

    const errPenalty = validation.errors.length * 25;
    const warnPenalty = validation.warnings.length * 8;
    const raw = 100 - errPenalty - warnPenalty;
    const s = validation.types.length === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [validation, sameAsCount, contactCount]);

  const grade = gradeForScore(score);
  const summary = validation.ok
    ? validation.warnings.length === 0
      ? "Valid. All required and recommended properties are present."
      : `Valid. ${validation.warnings.length} recommended ${validation.warnings.length === 1 ? "property" : "properties"} would strengthen it.`
    : `${validation.errors.length} required ${validation.errors.length === 1 ? "property is" : "properties are"} missing.`;

  /* -- handlers -------------------------------------------------------------- */
  const loadExample = React.useCallback(() => setValues(EXAMPLE), []);

  const examples = React.useMemo<ReadonlyArray<Example<SchemaValues>>>(
    () => [
      {
        label: "SaaS company example",
        description: "A fully-populated Organization with logo, sameAs and two contact points.",
        icon: "Building2",
        value: EXAMPLE,
      },
    ],
    [],
  );

  const serialize = React.useCallback((v: SchemaValues) => JSON.stringify(v), []);
  const deserialize = React.useCallback((raw: string): SchemaValues | null => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as SchemaValues;
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
          href="/local-business-schema-generator"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Store" size={13} />
          Have a storefront? Use LocalBusiness
          <Icon name="ArrowUpRight" size={12} />
        </Link>
      </div>

      <div className="h-px bg-border" />

      <SchemaForm
        fields={FIELDS}
        value={values}
        onChange={setValues}
        idPrefix="org-schema"
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
          warn: validation.warnings.length,
          fail: validation.errors.length,
        }}
      />
      <CheckList
        items={checks}
        grouped
        emptyLabel="Enter your organization name to validate your markup."
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
        icon="Building2"
        label="Type"
        value={str(values.type) || "Organization"}
        tone="info"
        title="Active schema.org @type"
      />
      <StatBadge
        icon="Share2"
        label="sameAs"
        value={String(sameAsCount)}
        title="Number of social/profile URLs"
      />
      <StatBadge
        icon="Headset"
        label="Contacts"
        value={String(contactCount)}
        title="Number of contact points"
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
    <GeneratorWithPreview<SchemaValues>
      value={values}
      onChange={setValues}
      initialValue={INITIAL_VALUES}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & brand-entity check"
      downloadName="organization-schema.json"
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
