"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { inferRegex, type Method } from "@/lib/dev/regexFromExamples";
import {
  CopyButton,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSpacer,
} from "@/components/tool/dev";

const SAMPLE_POS = "ORD-2024-001\nORD-2024-947\nORD-2023-118";

const METHOD_LABEL: Record<Method, { label: string; icon: string; tone: string }> = {
  known: { label: "Matched a known format", icon: "BadgeCheck", tone: "text-emerald-600" },
  structural: { label: "Inferred from the structure", icon: "Boxes", tone: "text-sky-600" },
  fallback: { label: "Broad pattern: refine by hand", icon: "TriangleAlert", tone: "text-amber-600" },
};

function toLines(text: string): string[] {
  return text.split("\n").map((l) => l.replace(/\r$/, "")).filter((l) => l.length > 0);
}

/**
 * Regex-from-examples; paste strings that should match (and optionally some
 * that shouldn't) and it infers a regular expression: a known format, a
 * structural pattern, or a broad fallback. Always validates against the
 * examples so the result is honest. Runs entirely in the browser.
 */
export default function RegexGeneratorTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [positives, setPositives] = React.useState("");
  const [negatives, setNegatives] = React.useState("");
  const [anchor, setAnchor] = React.useState(true);
  const [ignoreCase, setIgnoreCase] = React.useState(false);

  const posLines = React.useMemo(() => toLines(positives), [positives]);
  const negLines = React.useMemo(() => toLines(negatives), [negatives]);

  const result = React.useMemo(
    () => inferRegex(posLines, negLines, { anchor, ignoreCase }),
    [posLines, negLines, anchor, ignoreCase],
  );

  const regexDisplay = result ? `/${result.pattern}/${result.flags}` : "";

  return (
    <section aria-label="Regex from examples" className="flex flex-col gap-4">
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton icon="FlaskConical" label="Load sample" onClick={() => setPositives(SAMPLE_POS)} />
          <ToolbarButton
            icon="Trash2"
            label="Clear"
            onClick={() => {
              setPositives("");
              setNegatives("");
            }}
            disabled={!positives && !negatives}
          />
        </ToolbarGroup>
        <ToolbarSpacer />
        <div className="flex items-center gap-3">
          <Toggle checked={anchor} onChange={setAnchor} label="Anchor (^…$)" />
          <Toggle checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" />
        </div>
      </Toolbar>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="rx-pos" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Should match <span className="normal-case text-muted-foreground/70">(one per line)</span>
          </label>
          <textarea
            id="rx-pos"
            value={positives}
            onChange={(e) => setPositives(e.target.value)}
            spellCheck={false}
            placeholder={"ORD-2024-001\nORD-2024-947\nORD-2023-118"}
            className={cn(
              "min-h-[180px] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              accent.ring,
            )}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="rx-neg" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Should <span className="text-rose-500">not</span> match{" "}
            <span className="normal-case text-muted-foreground/70">(optional)</span>
          </label>
          <textarea
            id="rx-neg"
            value={negatives}
            onChange={(e) => setNegatives(e.target.value)}
            spellCheck={false}
            placeholder={"INVOICE-2024-1\nord-2024-001\nORD-24-1"}
            className={cn(
              "min-h-[180px] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              accent.ring,
            )}
          />
        </div>
      </div>

      {/* Result */}
      {result ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your regular expression
              </span>
              <ToolbarSpacer />
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", METHOD_LABEL[result.method].tone)}>
                <Icon name={METHOD_LABEL[result.method].icon} size={14} />
                {METHOD_LABEL[result.method].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg bg-muted px-3 py-2.5 font-mono text-sm text-foreground">
                {regexDisplay}
              </code>
              <CopyButton getValue={() => result.pattern} label="Copy" />
            </div>

            {/* Validation */}
            <div className="flex flex-wrap gap-2">
              <StatBadge
                icon={result.matchesAll ? "CircleCheck" : "CircleX"}
                label="Positives"
                value={result.matchesAll ? "all match" : `${result.failedPositives.length} fail`}
                tone={result.matchesAll ? "success" : "danger"}
              />
              {negLines.length > 0 ? (
                <StatBadge
                  icon={result.rejectsNegatives ? "CircleCheck" : "CircleX"}
                  label="Negatives"
                  value={result.rejectsNegatives ? "all rejected" : `${result.matchedNegatives.length} match`}
                  tone={result.rejectsNegatives ? "success" : "danger"}
                />
              ) : null}
            </div>

            {!result.rejectsNegatives ? (
              <p className="text-xs text-amber-600">
                Some &ldquo;should not match&rdquo; strings still match; add more contrasting examples, or tighten the
                pattern by hand.
              </p>
            ) : null}
          </div>

          {/* Explanation */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="BookOpen" size={16} className={accent.text} />
              What it matches
            </div>
            <ul className="mt-2 space-y-1.5">
              {result.explanation.map((line, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <Icon name="Dot" size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Add a few strings you want to match (one per line) and a regex appears here instantly.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        <Icon name="Info" size={12} className="mr-1 inline align-[-1px]" />
        This infers a pattern from your examples, great for structured strings (codes, dates, IDs) and common formats.
        Complex or highly varied inputs get a broad pattern you can refine. Everything runs in your browser; the result
        is always validated against your examples.
      </p>
    </section>
  );
}
