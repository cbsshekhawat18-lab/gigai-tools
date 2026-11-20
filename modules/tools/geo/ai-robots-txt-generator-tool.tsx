"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Field, Toggle, type Example } from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { AI_CRAWLERS, ROLE_LABELS, crawlersByOperator } from "@/lib/geo/crawlers";

/**
 * AI Robots.txt Generator — per-bot allow/block toggles for every AI crawler,
 * with a plain-language line on what each decision means, and three honest
 * presets. The output is a clean block to merge into an existing robots.txt
 * (or a complete file when "full file" is on). Pairs with the AI Crawler
 * Access Checker: check, then fix.
 */

type BotDecision = "allow" | "block";

interface GenState {
  bots: Record<string, BotDecision>;
  /** Emit a complete file (with a `*` group + sitemap) vs just the AI block. */
  fullFile: boolean;
  sitemap: string;
  comments: boolean;
}

const allBots = (decision: BotDecision): Record<string, BotDecision> =>
  Object.fromEntries(AI_CRAWLERS.map((c) => [c.id, decision]));

/** The recommended default: visible to AI search/user fetch, training is YOUR call (left allowed). */
const INITIAL: GenState = {
  bots: allBots("allow"),
  fullFile: false,
  sitemap: "",
  comments: true,
};

const PRESET_VISIBILITY: GenState = { ...INITIAL, bots: allBots("allow") };
const PRESET_NO_TRAINING: GenState = {
  ...INITIAL,
  bots: Object.fromEntries(
    AI_CRAWLERS.map((c) => [c.id, c.role === "training" || c.role === "control-token" ? "block" : "allow"]),
  ) as Record<string, BotDecision>,
};
const PRESET_BLOCK_ALL: GenState = {
  ...INITIAL,
  bots: Object.fromEntries(
    // Even "block everything" keeps Googlebot/Bingbot: blocking them removes
    // you from ordinary search, which is almost never the intent.
    AI_CRAWLERS.map((c) => [c.id, c.id === "googlebot" || c.id === "bingbot" ? "allow" : "block"]),
  ) as Record<string, BotDecision>,
};

const EXAMPLES: ReadonlyArray<Example<GenState>> = [
  { label: "Maximum AI visibility (allow everything)", value: PRESET_VISIBILITY },
  { label: "Visible in AI search, no model training", value: PRESET_NO_TRAINING },
  { label: "Block AI (keep normal search)", value: PRESET_BLOCK_ALL },
];

function generate(state: GenState): string {
  const out: string[] = [];
  if (state.comments) {
    out.push(
      "# AI crawler policy: generated with GigAI GEO Studio",
      "# https://gigai.tools/ai-robots-txt-generator",
      "",
    );
  }
  for (const { operator, crawlers } of crawlersByOperator()) {
    for (const c of crawlers) {
      const decision = state.bots[c.id] ?? "allow";
      if (state.comments) out.push(`# ${c.token} (${operator}): ${ROLE_LABELS[c.role].toLowerCase()}`);
      out.push(`User-agent: ${c.token}`, decision === "block" ? "Disallow: /" : "Allow: /", "");
    }
  }
  if (state.fullFile) {
    if (state.comments) out.push("# Everyone else");
    out.push("User-agent: *", "Allow: /", "");
    if (state.sitemap.trim()) out.push(`Sitemap: ${state.sitemap.trim()}`);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function BotRow({
  id,
  state,
  onChange,
}: {
  id: string;
  state: GenState;
  onChange: (s: GenState) => void;
}) {
  const crawler = AI_CRAWLERS.find((c) => c.id === id)!;
  const decision = state.bots[id] ?? "allow";
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-foreground">{crawler.token}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {ROLE_LABELS[crawler.role]}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{crawler.does}</p>
        </div>
        <Toggle
          checked={decision === "allow"}
          onChange={(allowed) =>
            onChange({ ...state, bots: { ...state.bots, [id]: allowed ? "allow" : "block" } })
          }
          label={<span className="w-10 text-xs">{decision === "allow" ? "Allow" : "Block"}</span>}
        />
      </div>
      {decision === "block" && (
        <p className="mt-2 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
          <Icon name="TriangleAlert" size={11} className="mr-1 inline align-[-1px] text-warning" />
          {crawler.blockCost}
        </p>
      )}
    </div>
  );
}

export default function AiRobotsTxtGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [value, setValue] = React.useState<GenState>(INITIAL);
  const code = React.useMemo(() => generate(value), [value]);
  const blocked = AI_CRAWLERS.filter((c) => value.bots[c.id] === "block").length;

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<GenState>
        value={value}
        onChange={setValue}
        initialValue={INITIAL}
        code={code}
        language="robots.txt"
        downloadName="robots.txt"
        examples={EXAMPLES}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as GenState;
            return parsed && typeof parsed === "object" && parsed.bots ? parsed : null;
          } catch {
            return null;
          }
        }}
        stats={
          <p className="text-xs text-muted-foreground">
            {AI_CRAWLERS.length - blocked} of {AI_CRAWLERS.length} AI tokens allowed
            {blocked > 0 ? ` · ${blocked} blocked` : ""} · robots.txt is a request, not a lock. The
            well-behaved bots listed here honor it.
          </p>
        }
        form={
          <div className="flex flex-col gap-4">
            {crawlersByOperator().map(({ operator, crawlers }) => (
              <div key={operator}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {operator}
                </p>
                <div className="flex flex-col gap-2">
                  {crawlers.map((c) => (
                    <BotRow key={c.id} id={c.id} state={value} onChange={setValue} />
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 border-t border-border pt-3">
              <Toggle
                checked={value.fullFile}
                onChange={(fullFile) => setValue({ ...value, fullFile })}
                label="Emit a complete robots.txt (adds a User-agent: * group + sitemap)"
              />
              {value.fullFile && (
                <Field label="Sitemap URL" hint="Absolute URL, e.g. https://example.com/sitemap.xml">
                  <input
                    type="url"
                    value={value.sitemap}
                    onChange={(e) => setValue({ ...value, sitemap: e.target.value })}
                    placeholder="https://example.com/sitemap.xml"
                    className="h-12 w-full rounded-md border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11"
                  />
                </Field>
              )}
              <Toggle
                checked={value.comments}
                onChange={(comments) => setValue({ ...value, comments })}
                label="Include explanatory comments"
              />
            </div>
          </div>
        }
      />
    </section>
  );
}
