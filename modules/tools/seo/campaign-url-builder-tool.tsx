"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import { buildCampaignUrl } from "@/lib/seo-tools/url";

/**
 * Campaign URL Builder, a superset of the classic UTM builder.
 *
 * A single controlled `CampaignState` drives the finished tracking URL (via
 * `lib/seo-tools/url.ts::buildCampaignUrl`), a live parameter table and a set
 * of lint checks. Channel presets pre-fill the correct source/medium, custom
 * parameters extend beyond the five UTMs, and a saved-parameters store keeps
 * the extras a team always appends one click away. `<GeneratorWithPreview>`
 * owns the toolbar, undo/redo, share links, presets and shortcuts; this module
 * owns the data shape and how it renders. Everything runs in the browser.
 */

/* --------------------------------- state ---------------------------------- */

/** One custom (non-UTM) parameter row. */
interface CustomParam {
  key: string;
  value: string;
}

interface CampaignState {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  /** Extra key/value pairs beyond the five UTMs. */
  custom: CustomParam[];
  /** Parameters the user has saved for reuse (drop-in with one click). */
  saved: CustomParam[];
}

const INITIAL: CampaignState = {
  url: "",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
  custom: [],
  saved: [],
};

/* -------------------------------- presets --------------------------------- */

/** A channel preset pre-fills the correct source/medium pair. */
interface ChannelPreset {
  id: string;
  label: string;
  icon: string;
  source: string;
  medium: string;
}

const CHANNEL_PRESETS: ReadonlyArray<ChannelPreset> = [
  { id: "google-ads", label: "Google Ads", icon: "BadgeDollarSign", source: "google", medium: "cpc" },
  { id: "google-organic", label: "Google (organic)", icon: "Search", source: "google", medium: "organic" },
  { id: "meta", label: "Meta (FB/IG)", icon: "Facebook", source: "facebook", medium: "paid_social" },
  { id: "instagram", label: "Instagram", icon: "Instagram", source: "instagram", medium: "social" },
  { id: "linkedin", label: "LinkedIn", icon: "Linkedin", source: "linkedin", medium: "social" },
  { id: "x", label: "X / Twitter", icon: "Twitter", source: "twitter", medium: "social" },
  { id: "email", label: "Email", icon: "Mail", source: "email", medium: "email" },
  { id: "newsletter", label: "Newsletter", icon: "Newspaper", source: "newsletter", medium: "email" },
  { id: "affiliate", label: "Affiliate", icon: "Handshake", source: "partner", medium: "affiliate" },
  { id: "qr", label: "QR / print", icon: "QrCode", source: "print", medium: "offline" },
];

/* --------------------------------- helpers -------------------------------- */

/** Slug-ish key sanitiser for custom parameter keys. */
function isValidParamKey(key: string): boolean {
  return /^[A-Za-z0-9_.\-]+$/.test(key);
}

/** Detect a value that will fragment reports (spaces or mixed case). */
function lintValue(label: string, value: string): CheckItem | null {
  const v = value.trim();
  if (!v) return null;
  if (/\s/.test(v)) {
    return {
      status: "warn",
      label: `${label} contains a space`,
      detail: `"${v}"`,
      fix: "Replace spaces with underscores so the value stays one token, e.g. spring_sale.",
      group: "Consistency",
    };
  }
  if (/[A-Z]/.test(v) && v !== v.toLowerCase()) {
    return {
      status: "warn",
      label: `${label} uses mixed case`,
      detail: `"${v}", analytics treats "${v}" and "${v.toLowerCase()}" as different values`,
      fix: "Use lowercase everywhere so one campaign stays one row, e.g. " + v.toLowerCase() + ".",
      group: "Consistency",
    };
  }
  return null;
}

/** Convert state's non-empty custom params into the extra map for the engine. */
function customToExtra(custom: CustomParam[]): Record<string, string> {
  const extra: Record<string, string> = {};
  for (const p of custom) {
    const k = p.key.trim();
    if (k && isValidParamKey(k)) extra[k] = p.value;
  }
  return extra;
}

/* -------------------------------- examples -------------------------------- */

const EXAMPLES: ReadonlyArray<Example<CampaignState>> = [
  {
    label: "Paid search (Google Ads)",
    description: "cpc link with keyword term",
    icon: "BadgeDollarSign",
    value: {
      ...INITIAL,
      url: "https://example.com/pricing",
      source: "google",
      medium: "cpc",
      campaign: "spring_sale_2026",
      term: "project_management_tool",
      content: "responsive_ad_a",
      custom: [{ key: "gclid", value: "{gclid}" }],
      saved: [],
    },
  },
  {
    label: "Newsletter blast",
    description: "email with per-block content",
    icon: "Mail",
    value: {
      ...INITIAL,
      url: "https://example.com/blog/launch",
      source: "newsletter",
      medium: "email",
      campaign: "june_product_update",
      content: "header_cta",
      custom: [{ key: "mc_cid", value: "a1b2c3d4" }],
      saved: [],
    },
  },
  {
    label: "Affiliate partner link",
    description: "partner ref + saved param",
    icon: "Handshake",
    value: {
      ...INITIAL,
      url: "https://example.com/",
      source: "acme-partner",
      medium: "affiliate",
      campaign: "q3_referral",
      custom: [{ key: "ref", value: "acme-123" }],
      saved: [{ key: "ref", value: "acme-123" }],
    },
  },
];

/* --------------------------------- inputs --------------------------------- */

const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Field
      label={
        required ? (
          <span>
            {label} <span className="text-rose-500">*</span>
          </span>
        ) : (
          label
        )
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

function SectionHead({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon name={icon} size={13} />
      {children}
    </div>
  );
}

/* ---------------------------------- tool ---------------------------------- */

export default function CampaignUrlBuilderTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<CampaignState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof CampaignState>(key: K) =>
      (value: CampaignState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  /* ------------------------------ derived ------------------------------- */

  const { code, checks, stats, error, paramRows } = React.useMemo(() => {
    const extra = customToExtra(state.custom);
    const result = buildCampaignUrl({
      url: state.url,
      source: state.source,
      medium: state.medium,
      campaign: state.campaign,
      term: state.term,
      content: state.content,
      extra,
    });

    const items: CheckItem[] = [];

    // Lint every filled value for consistency problems, regardless of validity.
    const lintTargets: Array<[string, string]> = [
      ["utm_source", state.source],
      ["utm_medium", state.medium],
      ["utm_campaign", state.campaign],
      ["utm_term", state.term],
      ["utm_content", state.content],
    ];
    for (const [label, value] of lintTargets) {
      const issue = lintValue(label, value);
      if (issue) items.push(issue);
    }

    // Flag malformed custom keys.
    for (const p of state.custom) {
      const k = p.key.trim();
      if (k && !isValidParamKey(k)) {
        items.push({
          status: "fail",
          label: `Invalid custom key "${k}"`,
          detail: "Parameter keys may only contain letters, numbers, ., - and _.",
          fix: "Rename the key using only URL-safe characters, e.g. partner_id.",
          group: "Parameters",
        });
      }
    }

    if (!result.ok) {
      // Distinguish the empty starting state from a real error.
      const empty = !state.url.trim() && !state.source && !state.medium && !state.campaign;
      if (empty) {
        items.unshift({
          status: "info",
          label: "Enter a URL, source, medium and campaign",
          detail: "utm_source, utm_medium and utm_campaign are required to build a tracking link.",
          group: "Status",
        });
      } else {
        items.unshift({
          status: "fail",
          label: result.error.message,
          group: "Status",
        });
      }
      return {
        code: "",
        checks: items,
        error: empty ? null : result.error.message,
        paramRows: [] as { key: string; value: string }[],
        stats: (
          <StatBadge label="Parameters" value={0} icon="Table" tone="default" />
        ),
      };
    }

    // Success: build the confirmation checks.
    items.unshift({
      status: "pass",
      label: "Valid tracking URL built",
      detail: `${result.result.params.length} parameter${result.result.params.length === 1 ? "" : "s"} appended.`,
      group: "Status",
    });

    // Note preserved pre-existing query params (those not in our param set).
    try {
      const original = new URL(state.url.trim());
      const ourKeys = new Set(result.result.params.map((p) => p.key));
      const preserved: string[] = [];
      original.searchParams.forEach((_v, k) => {
        if (!ourKeys.has(k)) preserved.push(k);
      });
      if (preserved.length) {
        items.push({
          status: "info",
          label: `${preserved.length} existing parameter${preserved.length === 1 ? "" : "s"} preserved`,
          detail: preserved.slice(0, 5).join(", ") + (preserved.length > 5 ? ", …" : ""),
          group: "Parameters",
        });
      }
      if (original.protocol !== "https:") {
        items.push({
          status: "warn",
          label: "Destination is not HTTPS",
          detail: `${original.protocol}//, most channels expect a secure canonical URL.`,
          fix: "Point the link at the https:// version of the page.",
          group: "Status",
        });
      }
    } catch {
      /* buildCampaignUrl already validated the URL; ignore. */
    }

    const finalUrl = result.result.url;
    const bytes = new TextEncoder().encode(finalUrl).length;

    const statNodes = (
      <>
        <StatBadge
          label="Parameters"
          value={result.result.params.length}
          icon="Table"
          tone={result.result.params.length ? "info" : "default"}
        />
        <StatBadge label="Custom" value={Object.keys(extra).length} icon="Bookmark" />
        <StatBadge
          label="Length"
          value={`${finalUrl.length} chars`}
          icon="Ruler"
          tone={finalUrl.length > 2000 ? "warning" : "default"}
        />
        <StatBadge
          label="Size"
          value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
          icon="FileCode"
        />
      </>
    );

    return {
      code: finalUrl,
      checks: items,
      error: null,
      paramRows: result.result.params,
      stats: statNodes,
    };
  }, [state]);

  /* ------------------------------ actions ------------------------------- */

  const applyPreset = React.useCallback((preset: ChannelPreset) => {
    setState((prev) => ({ ...prev, source: preset.source, medium: preset.medium }));
  }, []);

  const addCustom = React.useCallback(() => {
    setState((prev) => ({ ...prev, custom: [...prev.custom, { key: "", value: "" }] }));
  }, []);

  const updateCustom = React.useCallback((idx: number, patch: Partial<CustomParam>) => {
    setState((prev) => ({
      ...prev,
      custom: prev.custom.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));
  }, []);

  const removeCustom = React.useCallback((idx: number) => {
    setState((prev) => ({ ...prev, custom: prev.custom.filter((_, i) => i !== idx) }));
  }, []);

  const saveCustom = React.useCallback((param: CustomParam) => {
    const k = param.key.trim();
    if (!k) return;
    setState((prev) => {
      if (prev.saved.some((s) => s.key === k && s.value === param.value)) return prev;
      return { ...prev, saved: [...prev.saved, { key: k, value: param.value }] };
    });
  }, []);

  const dropSaved = React.useCallback((param: CustomParam) => {
    setState((prev) => {
      if (prev.custom.some((c) => c.key.trim() === param.key)) return prev;
      return { ...prev, custom: [...prev.custom, { ...param }] };
    });
  }, []);

  const forgetSaved = React.useCallback((idx: number) => {
    setState((prev) => ({ ...prev, saved: prev.saved.filter((_, i) => i !== idx) }));
  }, []);

  /* -------------------------------- form -------------------------------- */

  const activePresetId = React.useMemo(
    () =>
      CHANNEL_PRESETS.find((p) => p.source === state.source && p.medium === state.medium)?.id ??
      null,
    [state.source, state.medium],
  );

  const form = (
    <div className="flex flex-col gap-3">
      <SectionHead icon="Link">Destination</SectionHead>
      <TextField
        id="cub-url"
        label="Destination URL"
        required
        hint="The full landing-page URL. Existing query parameters are preserved."
        value={state.url}
        onChange={set("url")}
        placeholder="https://example.com/pricing"
        type="url"
      />

      <SectionHead icon="LayoutGrid">Channel preset</SectionHead>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Channel presets">
        {CHANNEL_PRESETS.map((p) => {
          const active = activePresetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              <Icon name={p.icon} size={13} />
              {p.label}
            </button>
          );
        })}
      </div>

      <SectionHead icon="Megaphone">UTM parameters</SectionHead>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="cub-source"
          label="Source"
          required
          hint="utm_source, the specific referrer, e.g. google, newsletter."
          value={state.source}
          onChange={set("source")}
          placeholder="google"
        />
        <TextField
          id="cub-medium"
          label="Medium"
          required
          hint="utm_medium, the channel, e.g. cpc, email, social."
          value={state.medium}
          onChange={set("medium")}
          placeholder="cpc"
        />
      </div>
      <TextField
        id="cub-campaign"
        label="Campaign"
        required
        hint="utm_campaign, the initiative name. Keep it lowercase with underscores."
        value={state.campaign}
        onChange={set("campaign")}
        placeholder="spring_sale_2026"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="cub-term"
          label="Term (optional)"
          hint="utm_term, paid-search keyword."
          value={state.term}
          onChange={set("term")}
          placeholder="project_management_tool"
        />
        <TextField
          id="cub-content"
          label="Content (optional)"
          hint="utm_content, distinguishes two links in one campaign."
          value={state.content}
          onChange={set("content")}
          placeholder="header_cta"
        />
      </div>

      <SectionHead icon="Table">Custom parameters</SectionHead>
      <p className="-mt-1 text-xs text-muted-foreground">
        Anything beyond UTM, gclid passthroughs, ad IDs, affiliate refs or your own keys.
      </p>
      <div className="flex flex-col gap-2">
        {state.custom.map((p, idx) => {
          const badKey = p.key.trim() !== "" && !isValidParamKey(p.key.trim());
          return (
            <div key={idx} className="flex items-center gap-2">
              <input
                aria-label={`Custom parameter ${idx + 1} key`}
                value={p.key}
                onChange={(e) => updateCustom(idx, { key: e.target.value })}
                placeholder="key"
                className={cn(inputClass, "flex-1", badKey && "border-rose-500 focus-visible:ring-rose-500")}
                spellCheck={false}
                autoComplete="off"
              />
              <input
                aria-label={`Custom parameter ${idx + 1} value`}
                value={p.value}
                onChange={(e) => updateCustom(idx, { value: e.target.value })}
                placeholder="value"
                className={cn(inputClass, "flex-1")}
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => saveCustom(p)}
                disabled={!p.key.trim()}
                title="Save this parameter for reuse"
                aria-label={`Save custom parameter ${idx + 1}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                <Icon name="Bookmark" size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeCustom(idx)}
                title="Remove this parameter"
                aria-label={`Remove custom parameter ${idx + 1}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addCustom}
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon name="Plus" size={14} />
          Add parameter
        </button>
      </div>

      {state.saved.length > 0 && (
        <>
          <SectionHead icon="Bookmark">Saved parameters</SectionHead>
          <div className="flex flex-wrap gap-1.5">
            {state.saved.map((p, idx) => (
              <span
                key={`${p.key}=${p.value}-${idx}`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 py-1 pl-2.5 pr-1 text-xs"
              >
                <button
                  type="button"
                  onClick={() => dropSaved(p)}
                  title="Add to custom parameters"
                  className="font-medium text-foreground hover:underline"
                >
                  {p.key}
                  {p.value ? `=${p.value}` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => forgetSaved(idx)}
                  aria-label={`Forget saved parameter ${p.key}`}
                  className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-background"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );

  /* ------------------------------- preview ------------------------------ */

  const preview = (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Table" size={13} />
          Parameter table
        </div>
        {paramRows.length ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-1.5 font-medium">Key</th>
                  <th className="px-3 py-1.5 font-medium">Value (encoded)</th>
                </tr>
              </thead>
              <tbody>
                {paramRows.map((row, i) => (
                  <tr key={`${row.key}-${i}`} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs text-foreground">
                      {row.key}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                      <span className="break-all">{encodeURIComponent(row.value)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Fill in a URL, source, medium and campaign to see the parameters.
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="ListChecks" size={13} />
          Checks
        </div>
        <CheckList items={checks} />
      </div>
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<CampaignState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="URL"
        form={form}
        preview={preview}
        previewLabel="Parameters & checks"
        downloadName="campaign-url.txt"
        downloadMime="text/plain;charset=utf-8"
        error={error}
        examples={EXAMPLES}
        stats={stats}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<CampaignState>;
            if (!parsed || typeof parsed !== "object") return null;
            return {
              ...INITIAL,
              ...parsed,
              custom: Array.isArray(parsed.custom) ? parsed.custom : [],
              saved: Array.isArray(parsed.saved) ? parsed.saved : [],
            };
          } catch {
            return null;
          }
        }}
      />
    </section>
  );
}
