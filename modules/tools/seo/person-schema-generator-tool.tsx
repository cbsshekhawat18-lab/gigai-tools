"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { Field, StatBadge, type Example } from "@/components/tool/dev";
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
import { buildPerson } from "@/lib/seo-tools/schema";

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
function list(v: FieldValue | undefined): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : [];
}
function optList(v: FieldValue | undefined): string[] | undefined {
  const l = list(v).map((s) => s.trim()).filter(Boolean);
  return l.length ? l : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Form spec, the single Person type */
/* -------------------------------------------------------------------------- */

const FIELDS: ReadonlyArray<FieldSpec> = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    required: true,
    full: true,
    placeholder: "Ada Lovelace",
    hint: "The only required property, the person's real, full name.",
  },
  {
    name: "jobTitle",
    label: "Job title",
    type: "text",
    placeholder: "Senior Data Scientist",
    hint: "Be specific: precise roles read as stronger expertise signals.",
  },
  {
    name: "worksFor",
    label: "Employer (worksFor)",
    type: "text",
    placeholder: "Analytical Engine Co.",
    hint: "Emitted as a nested Organization automatically.",
  },
  {
    name: "url",
    label: "Profile / homepage URL",
    type: "url",
    placeholder: "https://example.com/team/ada",
    hint: "A stable URL you can reuse as this person's author identity.",
  },
  {
    name: "image",
    label: "Photo URL",
    type: "url",
    placeholder: "https://example.com/people/ada.jpg",
    hint: "Absolute, publicly-reachable image of the person.",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "ada@example.com",
  },
  {
    name: "telephone",
    label: "Telephone",
    type: "text",
    placeholder: "+1-555-0100",
  },
  {
    name: "description",
    label: "Bio",
    type: "textarea",
    rows: 3,
    full: true,
    placeholder: "One or two sentences describing who they are and what they're known for.",
  },
  {
    name: "sameAs",
    label: "Profile links (sameAs)",
    type: "list",
    full: true,
    itemLabel: "profile URL",
    itemPlaceholder: "https://www.linkedin.com/in/ada",
    hint: "LinkedIn, X, GitHub, Wikipedia, ORCID, personal site… the identity signal.",
  },
];

/* -------------------------------------------------------------------------- */
/*  sameAs platform recognition                                               */
/* -------------------------------------------------------------------------- */

interface Platform {
  id: string;
  label: string;
  icon: string;
  /** True when the host matches this platform. */
  test: (host: string, url: string) => boolean;
  /** Authoritative platforms carry extra identity weight. */
  authoritative?: boolean;
}

const PLATFORMS: Platform[] = [
  { id: "linkedin", label: "LinkedIn", icon: "Linkedin", authoritative: true, test: (h) => h.includes("linkedin.com") },
  { id: "twitter", label: "X / Twitter", icon: "Twitter", test: (h) => h.includes("twitter.com") || h === "x.com" || h.endsWith(".x.com") },
  { id: "github", label: "GitHub", icon: "Github", authoritative: true, test: (h) => h.includes("github.com") },
  { id: "wikipedia", label: "Wikipedia", icon: "BookOpen", authoritative: true, test: (h) => h.includes("wikipedia.org") },
  { id: "orcid", label: "ORCID", icon: "GraduationCap", authoritative: true, test: (h) => h.includes("orcid.org") },
  { id: "facebook", label: "Facebook", icon: "Facebook", test: (h) => h.includes("facebook.com") },
  { id: "instagram", label: "Instagram", icon: "Instagram", test: (h) => h.includes("instagram.com") },
  { id: "youtube", label: "YouTube", icon: "Youtube", test: (h) => h.includes("youtube.com") || h === "youtu.be" },
  { id: "crunchbase", label: "Crunchbase", icon: "Briefcase", test: (h) => h.includes("crunchbase.com") },
  { id: "mastodon", label: "Mastodon", icon: "AtSign", test: (_, u) => /@[^/]+@/.test(u) || u.includes("mastodon") },
];

function classifyLink(raw: string): { valid: boolean; platform?: Platform; host: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: false, host: "" };
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return { valid: false, host: u.host };
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const platform = PLATFORMS.find((p) => p.test(host, trimmed));
    return { valid: true, platform, host };
  } catch {
    return { valid: false, host: "" };
  }
}

/* -------------------------------------------------------------------------- */
/*  Presets                                                                   */
/* -------------------------------------------------------------------------- */

const PRESETS: { label: string; description: string; icon: string; value: SchemaValues }[] = [
  {
    label: "Article author",
    description: "A staff writer with an author page and social profiles.",
    icon: "PenLine",
    value: {
      name: "Jordan Rivera",
      jobTitle: "Senior SEO Writer",
      worksFor: "Example Media",
      url: "https://example.com/authors/jordan-rivera",
      image: "https://example.com/people/jordan-rivera.jpg",
      email: "",
      telephone: "",
      description:
        "Jordan writes about technical SEO and structured data, and has covered search for over a decade.",
      sameAs: [
        "https://www.linkedin.com/in/jordan-rivera",
        "https://twitter.com/jordanrivera",
        "https://muckrack.com/jordan-rivera",
      ],
    },
  },
  {
    label: "Startup founder",
    description: "A company founder for an About / leadership page.",
    icon: "Rocket",
    value: {
      name: "Priya Nair",
      jobTitle: "Founder & CEO",
      worksFor: "Northbeam Labs",
      url: "https://northbeam.example.com/team/priya-nair",
      image: "https://northbeam.example.com/people/priya.jpg",
      email: "priya@northbeam.example.com",
      telephone: "",
      description:
        "Priya founded Northbeam Labs to build privacy-first analytics for small teams.",
      sameAs: [
        "https://www.linkedin.com/in/priya-nair",
        "https://twitter.com/priyanair",
        "https://www.crunchbase.com/person/priya-nair",
      ],
    },
  },
  {
    label: "Freelancer / consultant",
    description: "A personal site describing an independent professional.",
    icon: "Laptop",
    value: {
      name: "Sam Okafor",
      jobTitle: "Independent UX Consultant",
      worksFor: "",
      url: "https://samokafor.example.com",
      image: "https://samokafor.example.com/me.jpg",
      email: "hello@samokafor.example.com",
      telephone: "+1-555-0142",
      description:
        "Sam helps early-stage teams ship accessible, research-led product interfaces.",
      sameAs: [
        "https://www.linkedin.com/in/samokafor",
        "https://github.com/samokafor",
        "https://dribbble.com/samokafor",
      ],
    },
  },
  {
    label: "Speaker / expert",
    description: "A conference speaker and subject-matter expert.",
    icon: "Mic",
    value: {
      name: "Dr. Lena Fischer",
      jobTitle: "Research Cardiologist",
      worksFor: "Metro Heart Institute",
      url: "https://example.org/experts/lena-fischer",
      image: "https://example.org/people/lena-fischer.jpg",
      email: "",
      telephone: "",
      description:
        "Dr. Fischer researches preventive cardiology and speaks internationally on heart health.",
      sameAs: [
        "https://en.wikipedia.org/wiki/Lena_Fischer",
        "https://orcid.org/0000-0002-1825-0097",
        "https://www.linkedin.com/in/lena-fischer",
      ],
    },
  },
];

const EMPTY: SchemaValues = {
  name: "",
  jobTitle: "",
  worksFor: "",
  url: "",
  image: "",
  email: "",
  telephone: "",
  description: "",
  sameAs: [],
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PersonSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "violet");
  const [values, setValues] = React.useState<SchemaValues>(EMPTY);
  const [minified, setMinified] = React.useState(false);

  /* -- build the JSON-LD ----------------------------------------------------- */
  const output = React.useMemo(
    () =>
      buildPerson({
        name: str(values.name).trim(),
        jobTitle: opt(values.jobTitle),
        worksFor: opt(values.worksFor),
        url: opt(values.url),
        image: opt(values.image),
        email: opt(values.email),
        telephone: opt(values.telephone),
        description: opt(values.description),
        sameAs: optList(values.sameAs),
      }),
    [values],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- sameAs link analysis -------------------------------------------------- */
  const linkAudit = React.useMemo(() => {
    const raw = list(values.sameAs).map((s) => s.trim()).filter(Boolean);
    const classified = raw.map(classifyLink);
    const invalid = classified.filter((c) => !c.valid).length;
    const authoritative = classified.filter((c) => c.platform?.authoritative).length;
    const known = classified.filter((c) => c.platform);
    return { total: raw.length, invalid, authoritative, classified, known };
  }, [values.sameAs]);

  /* -- checks + score -------------------------------------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    const hasName = Boolean(str(values.name).trim());

    // Required
    if (!hasName) {
      items.push({
        id: "req-name",
        status: "fail",
        label: <code className="font-mono text-xs">name</code>,
        detail: "A Person must have a name: it's the one required property.",
        fix: "Enter the person's full name above.",
        group: "Required",
      });
    } else {
      items.push({
        id: "req-name-ok",
        status: "pass",
        label: "Name present",
        detail: "The required name property is set.",
        group: "Required",
      });
    }

    // Recommended identity signals
    const recommended: { key: string; label: string; ok: boolean; why: string }[] = [
      { key: "jobTitle", label: "Job title", ok: Boolean(opt(values.jobTitle)), why: "A specific role reinforces expertise." },
      { key: "image", label: "Photo", ok: Boolean(opt(values.image)), why: "A real photo strengthens the entity." },
      { key: "url", label: "Profile / homepage URL", ok: Boolean(opt(values.url)), why: "A stable URL lets you reuse this person as an author identity." },
      { key: "worksFor", label: "Employer (worksFor)", ok: Boolean(opt(values.worksFor)), why: "Ties the person to an organization." },
      { key: "description", label: "Bio", ok: Boolean(opt(values.description)), why: "Context helps disambiguate the person." },
    ];
    for (const r of recommended) {
      items.push({
        id: `rec-${r.key}`,
        status: r.ok ? "pass" : "warn",
        label: r.label,
        detail: r.ok ? "Set." : r.why,
        fix: r.ok ? undefined : "Recommended: adding it strengthens the entity.",
        group: "Recommended",
      });
    }

    // sameAs / E-E-A-T coverage
    if (linkAudit.total === 0) {
      items.push({
        id: "sameas-none",
        status: "warn",
        label: "sameAs profile links",
        detail: "No profile links yet.",
        fix: "Add authoritative profiles (LinkedIn, X, Wikipedia, GitHub, ORCID). This is the core identity signal.",
        group: "Identity (sameAs)",
      });
    } else {
      if (linkAudit.invalid > 0) {
        items.push({
          id: "sameas-invalid",
          status: "fail",
          label: `${linkAudit.invalid} invalid sameAs ${linkAudit.invalid === 1 ? "link" : "links"}`,
          detail: "Some entries aren't valid http(s) URLs and will be ignored by crawlers.",
          fix: "Use full absolute URLs starting with https://.",
          group: "Identity (sameAs)",
        });
      }
      const validCount = linkAudit.total - linkAudit.invalid;
      items.push({
        id: "sameas-count",
        status: validCount >= 2 ? "pass" : "warn",
        label: `${validCount} valid profile ${validCount === 1 ? "link" : "links"}`,
        detail:
          validCount >= 2
            ? "Good coverage, multiple profiles corroborate the identity."
            : "One profile is a start. Two or more corroborating links are stronger.",
        fix: validCount >= 2 ? undefined : "Add another authoritative profile.",
        group: "Identity (sameAs)",
      });
      items.push({
        id: "sameas-auth",
        status: linkAudit.authoritative >= 1 ? "pass" : "warn",
        label:
          linkAudit.authoritative >= 1
            ? `${linkAudit.authoritative} authoritative ${linkAudit.authoritative === 1 ? "source" : "sources"}`
            : "No high-authority source yet",
        detail:
          linkAudit.authoritative >= 1
            ? "Includes a high-weight identity source (LinkedIn, Wikipedia, GitHub or ORCID)."
            : "Wikipedia, LinkedIn, GitHub or ORCID carry more identity weight than generic links.",
        fix: linkAudit.authoritative >= 1 ? undefined : "Add a high-authority profile if one exists.",
        group: "Identity (sameAs)",
      });
    }

    // Score
    const recOk = recommended.filter((r) => r.ok).length;
    const validSameAs = linkAudit.total - linkAudit.invalid;
    let s = 0;
    if (hasName) {
      s = 40; // required baseline
      s += Math.round((recOk / recommended.length) * 30); // up to 30 for recommended
      if (validSameAs >= 1) s += 10;
      if (validSameAs >= 2) s += 10;
      if (linkAudit.authoritative >= 1) s += 10;
      if (linkAudit.invalid > 0) s -= 10;
    }
    s = Math.max(0, Math.min(100, s));

    return { checks: items, score: s };
  }, [values, linkAudit]);

  const grade = gradeForScore(score);

  const hasName = Boolean(str(values.name).trim());
  const summary = !hasName
    ? "Add a name to produce valid Person markup."
    : linkAudit.total === 0
      ? "Valid. Add sameAs profile links to strengthen the identity signal."
      : linkAudit.invalid > 0
        ? `Valid, but ${linkAudit.invalid} sameAs ${linkAudit.invalid === 1 ? "link is" : "links are"} not a usable URL.`
        : "Valid Person markup with corroborating identity links.";

  /* -- handlers -------------------------------------------------------------- */
  const loadPreset = React.useCallback((preset: SchemaValues) => {
    setValues({ ...EMPTY, ...preset });
  }, []);

  const examples = React.useMemo<ReadonlyArray<Example<SchemaValues>>>(
    () =>
      PRESETS.map((p) => ({
        label: p.label,
        description: p.description,
        icon: p.icon,
        value: { ...EMPTY, ...p.value },
      })),
    [],
  );

  const serialize = React.useCallback((v: SchemaValues) => JSON.stringify(v), []);
  const deserialize = React.useCallback((raw: string): SchemaValues | null => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...EMPTY, ...(parsed as SchemaValues) };
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
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => loadPreset(p.value)}
            title={p.description}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              style.soft,
            )}
          >
            <Icon name={p.icon} size={13} />
            {p.label}
          </button>
        ))}
        <Link
          href="/schema-generator"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="LayoutGrid" size={13} />
          All 12 schema types
          <Icon name="ArrowUpRight" size={12} />
        </Link>
      </div>

      <div className="h-px bg-border" />

      <SchemaForm fields={FIELDS} value={values} onChange={setValues} idPrefix="person" />

      {linkAudit.known.length > 0 && (
        <Field label="Recognised profiles" htmlFor="person-recognised">
          <div id="person-recognised" className="flex flex-wrap gap-1.5">
            {linkAudit.classified.map((c, i) =>
              c.platform ? (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    c.platform.authoritative ? style.soft : "bg-muted text-muted-foreground",
                  )}
                  title={c.platform.authoritative ? "High-authority identity source" : "Recognised profile"}
                >
                  <Icon name={c.platform.icon} size={11} />
                  {c.platform.label}
                  {c.platform.authoritative && <Icon name="BadgeCheck" size={11} />}
                </span>
              ) : null,
            )}
          </div>
        </Field>
      )}
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
          warn: checks.filter((c) => c.status === "warn").length,
          fail: checks.filter((c) => c.status === "fail").length,
        }}
      />
      <CheckList
        items={checks}
        grouped
        emptyLabel="Enter a name to validate your Person markup."
      />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Person markup is an identity / E-E-A-T signal rather than a standalone rich snippet. Confirm it parses in{" "}
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
      <StatBadge icon="User" label="Type" value="Person" tone="info" title="schema.org @type" />
      <StatBadge
        icon="Link2"
        label="sameAs"
        value={`${linkAudit.total - linkAudit.invalid}`}
        title="Valid profile links"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={hasName ? "CircleCheck" : "XCircle"}
        label="Status"
        value={hasName ? "Valid" : "Needs name"}
        tone={hasName ? "success" : "danger"}
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
      previewLabel="Validity & identity check"
      downloadName="person-schema.json"
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
