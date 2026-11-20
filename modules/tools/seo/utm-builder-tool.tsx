"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  Field,
  Toggle,
  CopyButton,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { buildUtm, type UtmResult } from "@/lib/seo-tools/url";

/**
 * UTM Builder, the campaign-URL workspace.
 *
 * A single controlled form (`UtmState`) drives the assembled tracking URL and
 * its live parameter table via `lib/seo-tools/url.ts`'s `buildUtm`.
 * `<GeneratorWithPreview>` owns the toolbar, undo/redo, share links, presets
 * and shortcuts; this module owns only the shape of the data, the optional
 * normalisation of values, and how the result renders. Everything runs in the
 * browser: nothing typed here is ever uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface UtmState {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  /** Lowercase all UTM values for channel consistency. */
  lowercase: boolean;
  /** Replace runs of whitespace in values with an underscore. */
  underscore: boolean;
}

const INITIAL: UtmState = {
  url: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
  lowercase: false,
  underscore: false,
};

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<UtmState>> = [
  {
    label: "Newsletter email",
    description: "A campaign email blast (source=newsletter, medium=email)",
    icon: "Mail",
    value: {
      ...INITIAL,
      url: "https://example.com/summer-sale",
      source: "newsletter",
      medium: "email",
      campaign: "summer_sale_2026",
      content: "hero_button",
      lowercase: true,
      underscore: true,
    },
  },
  {
    label: "Facebook CPC ad",
    description: "A paid Facebook ad (source=facebook, medium=cpc)",
    icon: "Megaphone",
    value: {
      ...INITIAL,
      url: "https://example.com/pricing",
      source: "facebook",
      medium: "cpc",
      campaign: "q3_retargeting",
      term: "project management app",
      content: "carousel_v2",
      lowercase: true,
      underscore: true,
    },
  },
  {
    label: "Google organic",
    description: "A tagged link from a Google Business post",
    icon: "Search",
    value: {
      ...INITIAL,
      url: "https://example.com/",
      source: "google",
      medium: "organic",
      campaign: "gbp_profile",
      lowercase: true,
      underscore: true,
    },
  },
  {
    label: "X (Twitter) social",
    description: "An organic social post link (source=x, medium=social)",
    icon: "Twitter",
    value: {
      ...INITIAL,
      url: "https://example.com/blog/launch",
      source: "x",
      medium: "social",
      campaign: "launch_announcement",
      content: "pinned_post",
      lowercase: true,
      underscore: true,
    },
  },
];

/* ------------------------------ normalisation ----------------------------- */

/** Apply the optional lowercase / underscore normalisation to a UTM value. */
function normalise(value: string, s: UtmState): string {
  let v = value;
  if (s.underscore) v = v.trim().replace(/\s+/g, "_");
  if (s.lowercase) v = v.toLowerCase();
  return v;
}

/** Build the result (or an error) from the current state. */
function computeResult(s: UtmState):
  | { ok: true; result: UtmResult }
  | { ok: false; message: string } {
  const res = buildUtm({
    url: s.url,
    source: normalise(s.source, s),
    medium: normalise(s.medium, s),
    campaign: normalise(s.campaign, s),
    term: s.term ? normalise(s.term, s) : undefined,
    content: s.content ? normalise(s.content, s) : undefined,
  });
  if (res.ok) return { ok: true, result: res.result };
  return { ok: false, message: res.error.message };
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
  required,
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <Field
      label={
        <>
          {label}
          {required && <span className="ml-1 text-rose-500" aria-hidden>*</span>}
        </>
      }
      htmlFor={id}
      hint={hint}
    >
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        spellCheck={false}
        autoComplete="off"
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

export default function UtmBuilderTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<UtmState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof UtmState>(key: K) =>
      (value: UtmState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const outcome = React.useMemo(() => computeResult(state), [state]);

  // The `code` pane shows the finished tracking URL (empty until valid).
  const code = outcome.ok ? outcome.result.url : "";
  const error = outcome.ok ? null : state.url || state.source || state.medium || state.campaign ? outcome.message : null;

  const paramCount = outcome.ok ? outcome.result.params.length : 0;
  const urlLength = outcome.ok ? outcome.result.url.length : 0;

  const stats = (
    <>
      <StatBadge
        label="Parameters"
        value={String(paramCount)}
        tone={paramCount >= 3 ? "success" : "default"}
      />
      <StatBadge label="URL length" value={`${urlLength} chars`} tone="default" />
      <StatBadge
        label="Status"
        value={outcome.ok ? "Valid" : "Incomplete"}
        tone={outcome.ok ? "success" : "warning"}
      />
    </>
  );

  const form = (
    <div className="flex flex-col gap-3">
      <SectionHead icon="Link2">Destination</SectionHead>
      <TextField
        id="utm-url"
        label="Website URL"
        hint="The full landing-page URL to track, including https://. Existing query parameters are preserved."
        value={state.url}
        onChange={set("url")}
        placeholder="https://example.com/landing-page"
        type="url"
        required
      />

      <SectionHead icon="Tag">Required UTM parameters</SectionHead>
      <TextField
        id="utm-source"
        label="Campaign source"
        hint="utm_source: where the traffic comes from, e.g. newsletter, google, facebook."
        value={state.source}
        onChange={set("source")}
        placeholder="newsletter"
        required
      />
      <TextField
        id="utm-medium"
        label="Campaign medium"
        hint="utm_medium: the channel type, e.g. email, cpc, social, organic, referral."
        value={state.medium}
        onChange={set("medium")}
        placeholder="email"
        required
      />
      <TextField
        id="utm-campaign"
        label="Campaign name"
        hint="utm_campaign, the campaign identifier, e.g. summer_sale_2026."
        value={state.campaign}
        onChange={set("campaign")}
        placeholder="summer_sale_2026"
        required
      />

      <SectionHead icon="SlidersHorizontal">Optional parameters</SectionHead>
      <TextField
        id="utm-term"
        label="Campaign term"
        hint="utm_term, usually the paid-search keyword you're bidding on."
        value={state.term}
        onChange={set("term")}
        placeholder="project management app"
      />
      <TextField
        id="utm-content"
        label="Campaign content"
        hint="utm_content, distinguishes two otherwise-identical links (A/B, two buttons)."
        value={state.content}
        onChange={set("content")}
        placeholder="hero_button"
      />

      <SectionHead icon="Wand2">Consistency</SectionHead>
      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
        <Toggle
          checked={state.lowercase}
          onChange={set("lowercase")}
          label="Lowercase all values"
        />
        <Toggle
          checked={state.underscore}
          onChange={set("underscore")}
          label="Replace spaces with underscores"
        />
        <p className="text-xs text-muted-foreground">
          UTM values are case-sensitive, keeping one house style stops a channel
          from fragmenting across your reports.
        </p>
      </div>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Table" size={13} />
          Parameter breakdown
        </div>
        {outcome.ok && outcome.result.params.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Parameter</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="w-10 px-2 py-2" aria-label="Copy value" />
                </tr>
              </thead>
              <tbody>
                {outcome.result.params.map((p) => (
                  <tr key={p.key} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">
                      {p.key}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-foreground">
                      <span className="break-all">{p.value}</span>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <CopyButton value={p.value} labelMode="icon" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-10 text-center">
            <Icon name="Tag" size={22} className="text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No parameters yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Add a destination URL plus a source, medium and campaign and the
              tagged link and its parameter table will build here, live, in your
              browser.
            </p>
          </div>
        )}
      </div>

      {outcome.ok && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon name="Link2" size={13} />
            Tracking URL
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <a
              href={outcome.result.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="min-w-0 flex-1 break-all font-mono text-xs text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-400"
            >
              {outcome.result.url}
            </a>
            <CopyButton value={outcome.result.url} label="Copy" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<UtmState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="URL"
        form={form}
        preview={preview}
        previewLabel="Live URL & parameters"
        downloadName="campaign-url.txt"
        downloadMime="text/plain;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        error={error}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<UtmState>;
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
