"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import { Icon } from "@/lib/icons";
import {
  CodePane,
  Field,
  NumberStepper,
  StatBadge,
  Toggle,
  type Example,
} from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import {
  generateRobots,
  validateRobots,
  type RobotsConfig,
  type RobotsGroup,
} from "@/lib/seo-tools/robots";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One editable group in the UI. Paths and user-agents are kept as raw multi-line
 * strings (one entry per line) so typing feels natural; they are split into the
 * engine's string[] shape only when generating the file.
 */
interface GroupState {
  /** User-agent(s), one per line. Empty ⇒ treated as `*`. */
  userAgent: string;
  /** Disallow paths, one per line. */
  disallow: string;
  /** Allow paths, one per line. */
  allow: string;
  /** Whether a Crawl-delay is emitted for this group. */
  crawlDelayOn: boolean;
  /** Crawl-delay seconds (used only when `crawlDelayOn`). */
  crawlDelay: number;
}

/** Full, undo-tracked form state. */
interface RobotsState {
  groups: GroupState[];
  /** Sitemap URLs, one per line. */
  sitemaps: string;
  /** Optional Host directive. */
  host: string;
}

function emptyGroup(userAgent = "*"): GroupState {
  return { userAgent, disallow: "", allow: "", crawlDelayOn: false, crawlDelay: 10 };
}

const INITIAL: RobotsState = {
  groups: [{ ...emptyGroup("*"), disallow: "/admin/\n/cart/\n/*?" }],
  sitemaps: "https://example.com/sitemap.xml",
  host: "",
};

/* -------------------------------------------------------------------------- */
/*  Line helpers                                                              */
/* -------------------------------------------------------------------------- */

/** Split a textarea into trimmed, non-empty lines (comments kept as-is). */
function lines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Map the editable UI state onto the engine's {@link RobotsConfig}. A group's
 * user-agents are split per line (falling back to `*`), and Allow/Disallow paths
 * are passed through verbatim so wildcards (`*`) and anchors (`$`) survive.
 */
function toConfig(state: RobotsState): RobotsConfig {
  const groups: RobotsGroup[] = state.groups.map((g) => {
    const agents = lines(g.userAgent);
    const userAgent: string | string[] =
      agents.length === 0 ? "*" : agents.length === 1 ? (agents[0] as string) : agents;
    return {
      userAgent,
      allow: lines(g.allow),
      disallow: lines(g.disallow),
      ...(g.crawlDelayOn ? { crawlDelay: g.crawlDelay } : {}),
    };
  });

  return {
    groups,
    sitemaps: lines(state.sitemaps),
    ...(state.host.trim() ? { host: state.host.trim() } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/*  Presets & examples                                                        */
/* -------------------------------------------------------------------------- */

const PRESET_ALLOW_ALL: RobotsState = {
  groups: [emptyGroup("*")],
  sitemaps: "https://example.com/sitemap.xml",
  host: "",
};

const PRESET_BLOCK_ALL: RobotsState = {
  groups: [{ ...emptyGroup("*"), disallow: "/" }],
  sitemaps: "",
  host: "",
};

const PRESET_WORDPRESS: RobotsState = {
  groups: [
    {
      ...emptyGroup("*"),
      disallow: "/wp-admin/\n/wp-login.php\n/xmlrpc.php\n/?s=\n/search/\n/cart/\n/checkout/\n/my-account/",
      allow: "/wp-admin/admin-ajax.php",
    },
  ],
  sitemaps: "https://example.com/sitemap.xml\nhttps://example.com/wp-sitemap.xml",
  host: "",
};

const PRESET_BLOCK_AI: RobotsState = {
  groups: [
    { ...emptyGroup("GPTBot"), disallow: "/" },
    { ...emptyGroup("CCBot"), disallow: "/" },
    { ...emptyGroup("ClaudeBot"), disallow: "/" },
    { ...emptyGroup("Google-Extended"), disallow: "/" },
    { ...emptyGroup("anthropic-ai"), disallow: "/" },
    { ...emptyGroup("*") },
  ],
  sitemaps: "https://example.com/sitemap.xml",
  host: "",
};

const EXAMPLES: ReadonlyArray<Example<RobotsState>> = [
  {
    label: "Allow all",
    description: "Every crawler, every path, the safe default",
    icon: "Globe",
    value: PRESET_ALLOW_ALL,
  },
  {
    label: "Block entire site",
    description: "Disallow all crawlers (staging / maintenance)",
    icon: "Ban",
    value: PRESET_BLOCK_ALL,
  },
  {
    label: "WordPress",
    description: "Harden wp-admin, search & commerce paths",
    icon: "Wand2",
    value: PRESET_WORDPRESS,
  },
  {
    label: "Block AI crawlers",
    description: "Disallow GPTBot, CCBot, ClaudeBot & friends",
    icon: "Bot",
    value: PRESET_BLOCK_AI,
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function RobotsTxtGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<RobotsState>(INITIAL);

  /* ------------------------------ mutation ------------------------------- */

  const setGroup = React.useCallback(
    <K extends keyof GroupState>(index: number, key: K, value: GroupState[K]) => {
      setState((s) => ({
        ...s,
        groups: s.groups.map((g, i) => (i === index ? { ...g, [key]: value } : g)),
      }));
    },
    [],
  );

  const addGroup = React.useCallback(() => {
    setState((s) => ({ ...s, groups: [...s.groups, emptyGroup("*")] }));
  }, []);

  const removeGroup = React.useCallback((index: number) => {
    setState((s) => ({
      ...s,
      groups: s.groups.length > 1 ? s.groups.filter((_, i) => i !== index) : s.groups,
    }));
  }, []);

  /* ---------------------- generate + lint (derived) ---------------------- */

  const { code, checks, stats, error } = React.useMemo(() => {
    const config = toConfig(state);
    const hasAnyRule = config.groups.some(
      (g) => (g.allow?.length ?? 0) > 0 || (g.disallow?.length ?? 0) > 0,
    );
    const text = generateRobots(config);
    // Lint the *generated* file so the warnings match exactly what ships.
    const analysis = validateRobots(text);

    const items: CheckItem[] = [];

    const groupCount = config.groups.length;
    items.push({
      status: "pass",
      label: `${groupCount} user-agent group${groupCount === 1 ? "" : "s"}`,
      detail: "Each group is one User-agent block in the file.",
    });

    // Site-wide block detection is the headline safety check.
    const blocksWholeSite = config.groups.some((g) => {
      const agents = Array.isArray(g.userAgent) ? g.userAgent : [g.userAgent];
      const isStar = agents.some((a) => a.trim() === "*");
      const disallowRoot = (g.disallow ?? []).some((d) => d.trim() === "/");
      const allowRoot = (g.allow ?? []).some((a) => a.trim() === "/");
      return isStar && disallowRoot && !allowRoot;
    });
    if (blocksWholeSite) {
      items.push({
        status: "fail",
        label: "This file blocks your entire site from all crawlers",
        detail: "A `Disallow: /` under `User-agent: *` tells every bot to skip every URL.",
        fix: "Remove the `/` disallow, or scope it to specific folders. Only keep it if you deliberately want the whole site out of search (e.g. staging).",
      });
    } else {
      items.push({ status: "pass", label: "Site is not fully blocked" });
    }

    // Sitemap presence.
    if (config.sitemaps && config.sitemaps.length > 0) {
      const bad = config.sitemaps.filter((s) => !/^https?:\/\//i.test(s));
      if (bad.length) {
        items.push({
          status: "warn",
          label: `${bad.length} sitemap URL${bad.length === 1 ? " is" : "s are"} not absolute`,
          detail: bad.slice(0, 3).join(", "),
          fix: "Sitemap lines must be absolute URLs, e.g. https://example.com/sitemap.xml.",
        });
      } else {
        items.push({
          status: "pass",
          label: `${config.sitemaps.length} sitemap URL${config.sitemaps.length === 1 ? "" : "s"} referenced`,
        });
      }
    } else {
      items.push({
        status: "warn",
        label: "No Sitemap directive",
        detail: "Add your sitemap URL so crawlers discover it without guessing.",
        fix: "Add a line like https://example.com/sitemap.xml in the Sitemaps field.",
      });
    }

    // Empty groups (allow everything), advisory.
    const emptyGroups = config.groups.filter(
      (g) => (g.allow?.length ?? 0) === 0 && (g.disallow?.length ?? 0) === 0,
    ).length;
    if (emptyGroups > 0 && !blocksWholeSite) {
      items.push({
        status: "info",
        label: `${emptyGroups} group${emptyGroups === 1 ? "" : "s"} with no rules`,
        detail: "A group with no Allow/Disallow lines permits crawling of everything: that's fine for an \"allow all\" block.",
      });
    }

    // Surface any remaining engine warnings that we haven't already shown.
    const shown = new Set(items.map((i) => String(i.label)));
    for (const w of analysis.warnings) {
      if (/blocks the entire site|No Sitemap directive/i.test(w)) continue; // already covered
      if (shown.has(w)) continue;
      items.push({ status: "warn", label: w });
    }
    for (const e of analysis.errors) items.push({ status: "fail", label: e });

    /* ------------------------------ stats ------------------------------- */

    const totalDisallow = config.groups.reduce((n, g) => n + (g.disallow?.length ?? 0), 0);
    const totalAllow = config.groups.reduce((n, g) => n + (g.allow?.length ?? 0), 0);
    const bytes = new TextEncoder().encode(text).length;

    const statNodes = (
      <>
        <StatBadge label="Groups" value={groupCount} icon="Bot" tone="info" />
        <StatBadge label="Disallow" value={totalDisallow} icon="Ban" tone={totalDisallow ? "warning" : "default"} />
        <StatBadge label="Allow" value={totalAllow} icon="Check" tone={totalAllow ? "success" : "default"} />
        <StatBadge
          label="Sitemaps"
          value={config.sitemaps?.length ?? 0}
          icon="Network"
          tone={(config.sitemaps?.length ?? 0) ? "success" : "default"}
        />
        <StatBadge
          label="Size"
          value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
          icon="FileCode"
        />
      </>
    );

    // Hard, blocking error above the panes only for the catastrophic case.
    const hardError = blocksWholeSite
      ? "Heads up: this robots.txt blocks your entire site from all crawlers. Keep it only if that's intentional (e.g. a staging site)."
      : null;

    // Empty state hint if the user cleared everything.
    void hasAnyRule;

    return { code: text, checks: items, stats: statNodes, error: hardError };
  }, [state]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      {state.groups.map((group, index) => (
        <fieldset
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3"
        >
          <legend className="flex w-full items-center justify-between gap-2 px-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Icon name="Bot" size={14} />
              Group {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeGroup(index)}
              disabled={state.groups.length <= 1}
              aria-label={`Remove group ${index + 1}`}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="Trash2" size={13} />
              Remove
            </button>
          </legend>

          <Field
            label="User-agent(s)"
            htmlFor={`ua-${index}`}
            hint="One crawler per line. Use * for all bots, or names like Googlebot, GPTBot."
          >
            <CodePane
              id={`ua-${index}`}
              value={group.userAgent}
              onChange={(v) => setGroup(index, "userAgent", v)}
              label={undefined}
              placeholder={"*"}
              minHeight={44}
              maxHeight={120}
              ariaLabel={`User agents for group ${index + 1}`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Disallow"
              htmlFor={`dis-${index}`}
              hint="Paths to block, one per line (e.g. /admin/). Wildcards * and anchors $ are kept."
            >
              <CodePane
                id={`dis-${index}`}
                value={group.disallow}
                onChange={(v) => setGroup(index, "disallow", v)}
                label={undefined}
                placeholder={"/admin/\n/cart/\n/*?"}
                minHeight={96}
                maxHeight={200}
                lineNumbers
                ariaLabel={`Disallow paths for group ${index + 1}`}
              />
            </Field>

            <Field
              label="Allow"
              htmlFor={`allow-${index}`}
              hint="Exceptions carved back out of a Disallow, one per line."
            >
              <CodePane
                id={`allow-${index}`}
                value={group.allow}
                onChange={(v) => setGroup(index, "allow", v)}
                label={undefined}
                placeholder={"/admin/admin-ajax.php"}
                minHeight={96}
                maxHeight={200}
                lineNumbers
                ariaLabel={`Allow paths for group ${index + 1}`}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Toggle
              checked={group.crawlDelayOn}
              onChange={(v) => setGroup(index, "crawlDelayOn", v)}
              label="Crawl-delay"
              id={`cd-toggle-${index}`}
            />
            {group.crawlDelayOn && (
              <div className="flex items-center gap-2">
                <NumberStepper
                  value={group.crawlDelay}
                  onChange={(v) => setGroup(index, "crawlDelay", v)}
                  min={0}
                  max={3600}
                  step={1}
                  ariaLabel={`Crawl delay seconds for group ${index + 1}`}
                />
                <span className="text-xs text-muted-foreground">seconds</span>
              </div>
            )}
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name="Plus" size={15} />
        Add user-agent group
      </button>

      <div className="grid grid-cols-1 gap-3">
        <Field
          label="Sitemaps"
          htmlFor="robots-sitemaps"
          hint="Absolute sitemap URL(s), one per line. Read by every crawler regardless of the rules above."
        >
          <CodePane
            id="robots-sitemaps"
            value={state.sitemaps}
            onChange={(v) => setState((s) => ({ ...s, sitemaps: v }))}
            label={undefined}
            placeholder={"https://example.com/sitemap.xml"}
            minHeight={60}
            maxHeight={160}
            ariaLabel="Sitemap URLs, one per line"
          />
        </Field>

        <Field
          label="Host (optional)"
          htmlFor="robots-host"
          hint="Preferred domain. Supported by Yandex. Ignored by Google."
        >
          <input
            id="robots-host"
            type="text"
            value={state.host}
            onChange={(e) => setState((s) => ({ ...s, host: e.target.value }))}
            placeholder="example.com"
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      </div>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = <CheckList items={checks} />;

  return (
    <GeneratorWithPreview<RobotsState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="robots.txt"
      form={form}
      preview={preview}
      previewLabel="Lint & checks"
      downloadName="robots.txt"
      downloadMime="text/plain;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<RobotsState>;
          if (typeof parsed !== "object" || parsed === null) return null;
          const groups = Array.isArray(parsed.groups) && parsed.groups.length
            ? parsed.groups.map((g) => ({ ...emptyGroup(), ...g }))
            : INITIAL.groups;
          return {
            groups,
            sitemaps: typeof parsed.sitemaps === "string" ? parsed.sitemaps : INITIAL.sitemaps,
            host: typeof parsed.host === "string" ? parsed.host : INITIAL.host,
          };
        } catch {
          return null;
        }
      }}
      stats={stats}
    />
  );
}
