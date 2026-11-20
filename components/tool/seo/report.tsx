"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

/**
 * Shared result primitives for SEO analyzers/validators. A `<ScorePanel>` gives
 * an at-a-glance 0–100 score dial + letter grade + one-line verdict; a
 * `<CheckList>` renders individual pass/warn/fail rows with actionable fix
 * advice. Both are pure presentational: the engine layer (lib/seo-tools) does
 * the analysis and passes the shaped data down as props.
 */

/** Status of a single check row. */
export type CheckStatus = "pass" | "warn" | "fail" | "info";

/** A letter grade; derived from a score if not supplied. */
export type Grade = "A" | "B" | "C" | "D" | "F";

/** Visual + a11y metadata for each status. */
const STATUS_META: Record<
  CheckStatus,
  { icon: string; label: string; ring: string; text: string; bg: string; border: string }
> = {
  pass: {
    icon: "CircleCheck",
    label: "Pass",
    ring: "text-success",
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  warn: {
    icon: "TriangleAlert",
    label: "Warning",
    ring: "text-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  fail: {
    icon: "XCircle",
    label: "Fail",
    ring: "text-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
  info: {
    icon: "Info",
    label: "Info",
    ring: "text-primary",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
};

/** Map a 0–100 score to a letter grade. */
export function gradeForScore(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Tone (color family) for a score band, shared by dial + grade chip. */
function toneForScore(score: number): { stroke: string; text: string } {
  if (score >= 75) return { stroke: "stroke-success", text: "text-success" };
  if (score >= 40) return { stroke: "stroke-warning", text: "text-warning" };
  return { stroke: "stroke-destructive", text: "text-destructive" };
}

/** Props for {@link ScorePanel}. */
export interface ScorePanelProps {
  /** 0–100 overall score. */
  score: number;
  /** Letter grade; auto-derived from `score` when omitted. */
  grade?: Grade;
  /** Short verdict, e.g. "Good: a few quick wins remain". */
  summary?: React.ReactNode;
  /** Optional breakdown of pass/warn/fail counts shown as pills. */
  counts?: { pass?: number; warn?: number; fail?: number };
  /** Diameter of the score dial in px. Default 108. */
  size?: number;
  className?: string;
}

/**
 * A circular score dial (SVG, animated stroke) with a letter grade and a
 * one-line verdict. Color shifts from red → amber → green with the score.
 */
export function ScorePanel({
  score,
  grade,
  summary,
  counts,
  size = 108,
  className,
}: ScorePanelProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const letter = grade ?? gradeForScore(clamped);
  const tone = toneForScore(clamped);

  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:gap-5",
        className,
      )}
      role="group"
      aria-label={`Overall score ${clamped} out of 100, grade ${letter}`}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(tone.stroke, "transition-[stroke-dashoffset] duration-700 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold tabular-nums leading-none", tone.text)}>
            {clamped}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            / 100
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <span
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-md border text-lg font-bold",
              tone.text,
              tone.stroke.replace("stroke-", "border-") + "/40",
            )}
          >
            {letter}
          </span>
          <span className="text-sm font-semibold text-foreground">Grade {letter}</span>
        </div>
        {summary && (
          <p className="mt-1.5 text-sm text-muted-foreground">{summary}</p>
        )}
        {counts && (
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
            {counts.pass != null && (
              <CountPill status="pass" count={counts.pass} />
            )}
            {counts.warn != null && (
              <CountPill status="warn" count={counts.warn} />
            )}
            {counts.fail != null && (
              <CountPill status="fail" count={counts.fail} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Singular/plural nouns per status for the count pill. */
const COUNT_NOUN: Record<CheckStatus, [singular: string, plural: string]> = {
  pass: ["pass", "passed"],
  warn: ["warning", "warnings"],
  fail: ["fail", "failed"],
  info: ["note", "notes"],
};

/** A tiny status count pill used in the ScorePanel breakdown. */
function CountPill({ status, count }: { status: CheckStatus; count: number }) {
  const meta = STATUS_META[status];
  const [singular, plural] = COUNT_NOUN[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-medium tabular-nums",
        meta.border,
        meta.bg,
        meta.text,
      )}
    >
      <Icon name={meta.icon} size={12} />
      {count} {count === 1 ? singular : plural}
    </span>
  );
}

/** A single check row. */
export interface CheckItem {
  /** Stable id (used as React key when present). */
  id?: string;
  status: CheckStatus;
  /** Short title of what was checked, e.g. "Title length". */
  label: React.ReactNode;
  /** Detail / current value, e.g. "58 characters, within the 50–60 sweet spot". */
  detail?: React.ReactNode;
  /** Actionable remediation shown on warn/fail rows. */
  fix?: React.ReactNode;
  /** Optional grouping bucket, e.g. "Meta", "Headings". */
  group?: string;
}

/** Props for {@link CheckList}. */
export interface CheckListProps {
  items: ReadonlyArray<CheckItem>;
  /** Group rows under their `group` label. Default false. */
  grouped?: boolean;
  /** Empty-state message when there are no items. */
  emptyLabel?: React.ReactNode;
  className?: string;
}

/**
 * A list of pass/warn/fail/info checks with an icon, a description, the current
 * value, and, on failures/warnings, concrete fix advice. Optionally groups
 * rows under section headings.
 */
export function CheckList({
  items,
  grouped = false,
  emptyLabel = "No checks to show.",
  className,
}: CheckListProps) {
  if (items.length === 0) {
    return (
      <p className={cn("py-6 text-center text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </p>
    );
  }

  if (!grouped) {
    return (
      <ul className={cn("flex flex-col gap-2", className)}>
        {items.map((item, i) => (
          <CheckRow key={item.id ?? i} item={item} />
        ))}
      </ul>
    );
  }

  // Preserve first-seen order of groups.
  const groups: string[] = [];
  const byGroup = new Map<string, CheckItem[]>();
  for (const item of items) {
    const key = item.group ?? "Other";
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
      groups.push(key);
    }
    byGroup.get(key)!.push(item);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {groups.map((group) => (
        <section key={group}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {group}
          </h3>
          <ul className="flex flex-col gap-2">
            {(byGroup.get(group) ?? []).map((item, i) => (
              <CheckRow key={item.id ?? `${group}-${i}`} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** One check row. */
function CheckRow({ item }: { item: CheckItem }) {
  const meta = STATUS_META[item.status];
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm",
        meta.border,
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
          meta.bg,
          meta.text,
        )}
        role="img"
        aria-label={meta.label}
      >
        <Icon name={meta.icon} size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">{item.label}</span>
          <span className={cn("text-sm font-medium", meta.text)}>{meta.label}</span>
        </div>
        {item.detail != null && (
          <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>
        )}
        {item.fix != null && item.status !== "pass" && (
          <p className="mt-1.5 flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm text-foreground/80">
            <Icon name="Wrench" size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
            <span>{item.fix}</span>
          </p>
        )}
      </div>
    </li>
  );
}
