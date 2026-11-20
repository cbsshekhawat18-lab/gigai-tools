"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Field, type Example } from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { generateLlmsTxt, sectionsFromUrls } from "@/lib/geo/llms";
import { parseSitemapXml } from "@/lib/seo-tools/sitemap-import";

/**
 * llms.txt Generator — builds a spec-shaped llms.txt from your site name,
 * summary and a URL list (paste your sitemap.xml directly; it's parsed).
 *
 * The page copy is deliberately honest: Google has said its AI search doesn't
 * use llms.txt, so nobody should ship one expecting a rankings lever. It's a
 * cheap, harmless index that some agents and smaller engines do read — that's
 * the truthful pitch, and the tool builds a good one in seconds.
 */

interface LlmsState {
  siteName: string;
  summary: string;
  details: string;
  /** URL list OR raw sitemap.xml — auto-detected. */
  urls: string;
}

const INITIAL: LlmsState = {
  siteName: "",
  summary: "",
  details: "",
  urls: "",
};

const EXAMPLE: LlmsState = {
  siteName: "Acme Analytics",
  summary: "Self-hosted product analytics with SQL access and no per-seat pricing.",
  details:
    "Acme Analytics is an open-core analytics platform. The docs below cover installation, the query API and data governance. Pricing and legal pages are listed under Optional.",
  urls: [
    "https://acme.dev/",
    "https://acme.dev/docs/install",
    "https://acme.dev/docs/query-api",
    "https://acme.dev/docs/governance",
    "https://acme.dev/blog/why-sql-access-matters",
    "https://acme.dev/blog/self-hosting-guide",
    "https://acme.dev/pricing",
  ].join("\n"),
};

function extractUrls(raw: string): string[] {
  const text = raw.trim();
  if (!text) return [];
  if (/<urlset|<sitemapindex|<loc>/i.test(text)) {
    const parsed = parseSitemapXml(text);
    if ("entries" in parsed) return parsed.entries.map((e) => e.url);
    return [];
  }
  return text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
}

function generate(state: LlmsState): string {
  const urls = extractUrls(state.urls);
  return generateLlmsTxt({
    siteName: state.siteName || "Your site",
    summary: state.summary,
    details: state.details,
    sections: sectionsFromUrls(urls),
  });
}

const inputClass =
  "h-12 w-full rounded-md border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11";

export default function LlmsTxtGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [value, setValue] = React.useState<LlmsState>(INITIAL);
  const code = React.useMemo(() => generate(value), [value]);
  const urlCount = React.useMemo(() => extractUrls(value.urls).length, [value.urls]);

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<LlmsState>
        value={value}
        onChange={setValue}
        initialValue={INITIAL}
        code={code}
        language="Markdown"
        downloadName="llms.txt"
        examples={[{ label: "Example: docs-heavy product site", value: EXAMPLE }] as ReadonlyArray<Example<LlmsState>>}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const p = JSON.parse(raw) as LlmsState;
            return p && typeof p === "object" ? { ...INITIAL, ...p } : null;
          } catch {
            return null;
          }
        }}
        stats={
          <p className="text-xs text-muted-foreground">
            {urlCount} URLs, grouped by first path segment · Honest note: Google has said its AI search
            doesn&apos;t read llms.txt. Ship it as a cheap extra index for agents that do, not as a ranking
            tactic.
          </p>
        }
        form={
          <div className="flex flex-col gap-4">
            <Field label="Site name" hint="Becomes the H1 of the file.">
              <input
                value={value.siteName}
                onChange={(e) => setValue({ ...value, siteName: e.target.value })}
                placeholder="Acme Analytics"
                className={inputClass}
              />
            </Field>
            <Field label="One-sentence summary" hint="Rendered as the blockquote: the one line an agent reads first.">
              <input
                value={value.summary}
                onChange={(e) => setValue({ ...value, summary: e.target.value })}
                placeholder="Self-hosted product analytics with SQL access."
                className={inputClass}
              />
            </Field>
            <Field label="Details (optional)" hint="A short paragraph of context after the summary.">
              <textarea
                value={value.details}
                onChange={(e) => setValue({ ...value, details: e.target.value })}
                placeholder="What the site covers, who it's for, what the linked sections contain…"
                className="min-h-[70px] w-full resize-y rounded-md border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Field
              label="Your URLs"
              hint="One per line, or paste your entire sitemap.xml and it's parsed automatically. URLs are grouped into sections by first path segment, capped at 25 per section."
            >
              <textarea
                value={value.urls}
                onChange={(e) => setValue({ ...value, urls: e.target.value })}
                placeholder={"https://example.com/\nhttps://example.com/docs/setup\n…or paste sitemap.xml"}
                className="min-h-[160px] w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                spellCheck={false}
              />
            </Field>
          </div>
        }
      />
    </section>
  );
}
