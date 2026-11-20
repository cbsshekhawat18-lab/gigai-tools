"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { CheckList, ScorePanel, type CheckItem } from "@/components/tool/seo";
import { compareEntitySources, type EntitySource } from "@/lib/geo/entity";

/**
 * Entity Consistency Checker — paste your description as it appears on your
 * site, GitHub, LinkedIn, Product Hunt, Crunchbase and G2, and get the
 * disagreements flagged: name-spelling drift, conflicting numbers, conflicting
 * years, profiles too thin to corroborate anything. Models build confidence in
 * an entity from cross-source agreement; contradictions read as uncertainty.
 */

const DEFAULT_SOURCES = ["Your website", "GitHub", "LinkedIn", "Product Hunt", "Crunchbase", "G2 / other"];

export default function EntityConsistencyCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  const [brand, setBrand] = React.useState("");
  const [texts, setTexts] = React.useState<string[]>(() => DEFAULT_SOURCES.map(() => ""));

  const sources: EntitySource[] = DEFAULT_SOURCES.map((label, i) => ({ label, text: texts[i] ?? "" }));
  const activeCount = sources.filter((s) => s.text.trim()).length;
  const report = React.useMemo(
    () => (brand.trim() && activeCount >= 2 ? compareEntitySources(brand.trim(), sources) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, ...texts],
  );

  const checks: CheckItem[] = [];
  let score = 100;
  if (report) {
    for (const f of report.findings) {
      checks.push({
        status: f.severity,
        label: f.message,
        detail: f.evidence.length ? (
          <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-xs text-muted-foreground">
            {f.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : undefined,
        group: "Inconsistencies",
      });
      score -= f.severity === "fail" ? 25 : 10;
    }
    if (report.findings.length === 0) {
      checks.push({
        status: "pass",
        label: "No mechanical inconsistencies found",
        detail: `Name spelling, numbers and years agree across the ${activeCount} sources checked.`,
        group: "Inconsistencies",
      });
    }
    if (report.nameVariants.length === 1) {
      checks.push({
        status: "pass",
        label: `Name is consistent: "${report.nameVariants[0]?.variant ?? brand}" everywhere it appears`,
        group: "Agreement",
      });
    }
    for (const fact of report.agreedFacts.slice(0, 8)) {
      checks.push({ status: "pass", label: fact, group: "Agreement" });
    }
    checks.push({
      status: "info",
      label: "What this checks (and honestly doesn't)",
      detail:
        "Mechanical facts only: name spellings (letter-for-letter variants), number+unit pairs, years, and profile thinness. It can't judge semantic drift ('analytics platform' vs 'BI tool'): read the sources side by side for that. Everything runs in your browser. Nothing is uploaded.",
      group: "Method",
    });
  }
  score = Math.max(0, Math.min(100, score));

  const paneClass =
    "min-h-[110px] w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section aria-label={tool.title} className="flex flex-col gap-4">
      <div>
        <label htmlFor="brand" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Brand / product name (exactly as you want it written)
        </label>
        <input
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. GigAI Tools"
          className="h-12 w-full rounded-md border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:max-w-sm"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {DEFAULT_SOURCES.map((label, i) => (
          <div key={label}>
            <label htmlFor={`src-${i}`} className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {label}
            </label>
            <textarea
              id={`src-${i}`}
              value={texts[i]}
              onChange={(e) => {
                const next = [...texts];
                next[i] = e.target.value;
                setTexts(next);
              }}
              placeholder={`Paste the description of ${brand.trim() || "your product"} as it appears on ${label.toLowerCase()}…`}
              className={paneClass}
            />
          </div>
        ))}
      </div>

      {report ? (
        <>
          <ScorePanel
            score={score}
            summary={
              report.findings.filter((f) => f.severity === "fail").length > 0
                ? "Sources contradict each other: models reading all of them see uncertainty, not authority."
                : score === 100
                  ? "Your entity data agrees across sources. This is what corroboration looks like."
                  : "Mostly consistent, with the gaps flagged below."
            }
            counts={{
              pass: checks.filter((c) => c.status === "pass").length,
              warn: checks.filter((c) => c.status === "warn").length,
              fail: checks.filter((c) => c.status === "fail").length,
            }}
          />
          <CheckList items={checks} grouped />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <Icon name="Fingerprint" size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Do your profiles agree about you?</p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Enter your brand name and paste your description from at least two sources. The checker
            diffs the mechanical facts models actually corroborate (exact name spelling, every
            number-with-unit, every year) and flags where your own profiles disagree with each other.
            Nothing is fetched or uploaded; it reads only what you paste.
          </p>
        </div>
      )}
    </section>
  );
}
