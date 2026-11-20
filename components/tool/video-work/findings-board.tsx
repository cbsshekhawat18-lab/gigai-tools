"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FINDING_TYPES,
  PRIORITIES,
  TYPE_LABELS,
  type Finding,
  type FindingStatus,
  type FindingType,
  type Priority,
  type Project,
} from "@/lib/video-work/types";

import { FindingCard } from "./finding-card";

export interface BoardFilters {
  type: FindingType | "all";
  priority: Priority | "all";
  status: FindingStatus | "all";
  query: string;
  /** Show only items the AI flagged as uncertain. */
  uncertainOnly: boolean;
}

export const DEFAULT_FILTERS: BoardFilters = {
  type: "all",
  priority: "all",
  status: "all",
  query: "",
  uncertainOnly: false,
};

interface FindingsBoardProps {
  project: Project;
  filters: BoardFilters;
  onFilters: (filters: BoardFilters) => void;
  onSeek: (videoId: string, ms: number) => void;
  onUpdate: (id: string, patch: Partial<Finding>) => void;
  onStatus: (ids: string[], status: FindingStatus) => void;
  /** Set by the workspace when a marker or timeline row is clicked. */
  focusId?: string | null;
}

/**
 * The findings dashboard: filter, search, review, approve.
 *
 * Search runs across the transcript evidence as well as the findings
 * themselves, because the question a user actually has is usually "where did
 * they mention the invoice thing?", and the answer may live in the client's
 * phrasing rather than in the title the model wrote.
 *
 * Bulk approve exists because a good analysis produces a lot of obviously-fine
 * items alongside a few that need thought; making someone click through forty
 * correct findings to reach the four questionable ones trains them to approve
 * without reading, which defeats the review step entirely.
 */
export function FindingsBoard({
  project,
  filters,
  onFilters,
  onSeek,
  onUpdate,
  onStatus,
  focusId,
}: FindingsBoardProps) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  // Opening a finding from a marker or the timeline should reveal it, not just
  // scroll somewhere near it.
  React.useEffect(() => {
    if (!focusId) return;
    setExpanded((prev) => new Set(prev).add(focusId));
    document
      .getElementById(`finding-${focusId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId]);

  const visible = React.useMemo(
    () => project.findings.filter((finding) => matches(finding, filters)),
    [project.findings, filters],
  );

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const selectedIds = [...selected].filter((id) => visible.some((f) => f.id === id));
  const allVisibleSelected = visible.length > 0 && selectedIds.length === visible.length;

  return (
    <div className="space-y-4">
      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Icon
              name="Search"
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={filters.query}
              onChange={(e) => onFilters({ ...filters, query: e.target.value })}
              placeholder="Search findings, criteria and what the client said…"
              className="pl-8"
            />
          </div>
          <Button
            size="sm"
            variant={filters.uncertainOnly ? "default" : "outline"}
            onClick={() => onFilters({ ...filters, uncertainOnly: !filters.uncertainOnly })}
          >
            <Icon name="TriangleAlert" className="size-3.5" />
            Needs confirmation
          </Button>
          {isFiltered(filters) ? (
            <Button size="sm" variant="ghost" onClick={() => onFilters(DEFAULT_FILTERS)}>
              Clear
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filters.type === "all"}
            onClick={() => onFilters({ ...filters, type: "all" })}
          >
            All types ({project.findings.length})
          </Chip>
          {FINDING_TYPES.map((type) => {
            const count = project.findings.filter((f) => f.type === type).length;
            if (count === 0) return null;
            return (
              <Chip
                key={type}
                active={filters.type === type}
                onClick={() => onFilters({ ...filters, type })}
              >
                {TYPE_LABELS[type]} ({count})
              </Chip>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Select
            label="Priority"
            value={filters.priority}
            options={["all", ...PRIORITIES]}
            onChange={(value) => onFilters({ ...filters, priority: value as Priority | "all" })}
          />
          <Select
            label="Status"
            value={filters.status}
            options={["all", "new", "needs-review", "approved", "rejected", "completed"]}
            onChange={(value) => onFilters({ ...filters, status: value as FindingStatus | "all" })}
          />
        </div>
      </div>

      {/* ── Bulk actions ─────────────────────────────────────────────────── */}
      {visible.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={() =>
                setSelected(allVisibleSelected ? new Set() : new Set(visible.map((f) => f.id)))
              }
              className="size-4 accent-primary"
            />
            <span className="text-muted-foreground">
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select all shown"}
            </span>
          </label>

          {selectedIds.length > 0 ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onStatus(selectedIds, "approved");
                  setSelected(new Set());
                }}
              >
                <Icon name="Check" className="size-3.5" /> Approve selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onStatus(selectedIds, "rejected");
                  setSelected(new Set());
                }}
              >
                <Icon name="X" className="size-3.5" /> Reject selected
              </Button>
            </>
          ) : null}

          <span className="ml-auto text-xs text-muted-foreground">
            Showing {visible.length} of {project.findings.length}
          </span>
        </div>
      ) : null}

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {project.findings.length === 0
            ? "No findings to show."
            : "Nothing matches those filters."}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((finding) => (
            <div key={finding.id} id={`finding-${finding.id}`}>
              <FindingCard
                finding={finding}
                video={project.videos.find((v) => v.id === finding.evidence.videoId)}
                selected={selected.has(finding.id)}
                expanded={expanded.has(finding.id)}
                onToggleSelect={(id) => setSelected((prev) => toggle(prev, id))}
                onToggleExpand={(id) => setExpanded((prev) => toggle(prev, id))}
                onSeek={onSeek}
                onUpdate={onUpdate}
                onStatus={(id, status) => onStatus([id], status)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Filtering ────────────────────────────────────────────────────────────── */

function matches(finding: Finding, filters: BoardFilters): boolean {
  if (filters.type !== "all" && finding.type !== filters.type) return false;
  if (filters.priority !== "all" && finding.priority !== filters.priority) return false;
  if (filters.status !== "all" && finding.status !== filters.status) return false;
  if (filters.uncertainOnly && !finding.needsConfirmation) return false;

  const query = filters.query.trim().toLowerCase();
  if (!query) return true;

  // Include the client's own words: users search for the phrasing they
  // remember hearing, not the title the model wrote.
  return [
    finding.id,
    finding.title,
    finding.description,
    finding.interpretation,
    finding.area,
    finding.evidence.clientStatement,
    ...finding.acceptanceCriteria,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function isFiltered(filters: BoardFilters): boolean {
  return (
    filters.type !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    filters.uncertainOnly ||
    filters.query.trim() !== ""
  );
}

/* ── Controls ─────────────────────────────────────────────────────────────── */

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs text-foreground"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "Any" : option.replace("-", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
