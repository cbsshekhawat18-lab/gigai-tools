"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  LOW_CONFIDENCE,
  TYPE_LABELS,
  formatClock,
  type Finding,
  type FindingStatus,
  type Priority,
  type VideoAsset,
} from "@/lib/video-work/types";

const PRIORITY_STYLE: Record<Priority, string> = {
  critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/25",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/25",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/25",
  low: "bg-muted text-muted-foreground ring-border",
};

const STATUS_STYLE: Record<FindingStatus, string> = {
  new: "bg-muted text-muted-foreground",
  "needs-review": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 line-through",
  completed: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const STATUS_LABEL: Record<FindingStatus, string> = {
  new: "New",
  "needs-review": "Needs review",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

export interface FindingCardProps {
  finding: Finding;
  video?: VideoAsset;
  selected: boolean;
  expanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onSeek: (videoId: string, ms: number) => void;
  onUpdate: (id: string, patch: Partial<Finding>) => void;
  onStatus: (id: string, status: FindingStatus) => void;
}

/**
 * One finding, rendered as a ticket a developer could work from directly.
 *
 * The layout enforces the product's central rule visually, not just in data:
 * the client's verbatim words sit in their own quoted block, and the AI's
 * reading sits in a separate, visibly-labelled panel with its confidence
 * attached. They are never merged into one paragraph of prose, because a reader
 * skimming a merged paragraph cannot tell which half came from the client and
 * which half a model inferred, and that is precisely the confusion that gets
 * the wrong thing built.
 *
 * Editing is inline and marks the finding as user-edited, so every export can
 * distinguish a human-confirmed requirement from a machine-proposed one.
 */
export function FindingCard({
  finding,
  video,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
  onSeek,
  onUpdate,
  onStatus,
}: FindingCardProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(finding);

  React.useEffect(() => setDraft(finding), [finding]);

  const frame =
    finding.evidence.frameTimeMs !== null
      ? video?.frames.find((f) => f.timeMs === finding.evidence.frameTimeMs)
      : undefined;

  const uncertain = finding.needsConfirmation || finding.confidence < LOW_CONFIDENCE;

  const commit = () => {
    onUpdate(finding.id, {
      title: draft.title.trim() || finding.title,
      description: draft.description,
      interpretation: draft.interpretation,
      acceptanceCriteria: draft.acceptanceCriteria.map((c) => c.trim()).filter(Boolean),
      priority: draft.priority,
      editedByUser: true,
      // A human has now written this down. It is no longer an open question.
      needsConfirmation: false,
    });
    setEditing(false);
  };

  return (
    <article
      className={cn(
        "rounded-xl border bg-card transition-colors",
        selected && "ring-2 ring-primary/40",
        finding.status === "rejected" && "opacity-60",
      )}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(finding.id)}
          aria-label={`Select ${finding.id}`}
          className="mt-1 size-4 shrink-0 accent-primary"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
            <span className="font-mono text-muted-foreground">{finding.id}</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 uppercase tracking-wide ring-1 ring-inset",
                PRIORITY_STYLE[finding.priority],
              )}
            >
              {finding.priority}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
              {TYPE_LABELS[finding.type]}
            </span>
            {finding.area ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                {finding.area}
              </span>
            ) : null}
            <span className={cn("rounded px-1.5 py-0.5", STATUS_STYLE[finding.status])}>
              {STATUS_LABEL[finding.status]}
            </span>
            {finding.editedByUser ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">edited</span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onToggleExpand(finding.id)}
            className="mt-1.5 block w-full text-left"
          >
            <h3 className="text-balance font-semibold leading-snug">{finding.title}</h3>
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => onSeek(finding.evidence.videoId, finding.evidence.timestampMs)}
              className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
            >
              <Icon name="Play" className="size-3" />
              {formatClock(finding.evidence.timestampMs)}
            </button>
            {video ? <span className="truncate">{video.label}</span> : null}
            <ConfidenceMeter value={finding.confidence} />
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onToggleExpand(finding.id)}
          aria-label={expanded ? "Collapse" : "Expand"}
          aria-expanded={expanded}
        >
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} className="size-4" />
        </Button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {expanded ? (
        <div className="space-y-4 border-t px-4 pb-4 pt-4">
          {uncertain && finding.status !== "approved" ? (
            <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              <Icon name="TriangleAlert" className="mt-px size-4 shrink-0" />
              <p>
                <strong>Needs confirmation.</strong> The client&rsquo;s intent was ambiguous here, so
                this reading is a proposal at {finding.confidence}% confidence - not a settled
                requirement. Check it with them before it becomes work.
              </p>
            </div>
          ) : null}

          {editing ? (
            <EditForm draft={draft} setDraft={setDraft} onCancel={() => setEditing(false)} onSave={commit} />
          ) : (
            <>
              {finding.description ? (
                <p className="text-sm leading-relaxed">{finding.description}</p>
              ) : null}

              {finding.observed || finding.expected ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {finding.observed ? (
                    <Field label="Observed" tone="danger">
                      {finding.observed}
                    </Field>
                  ) : null}
                  {finding.expected ? <Field label="Expected">{finding.expected}</Field> : null}
                </div>
              ) : null}

              {finding.stepsToReproduce.length > 0 ? (
                <div>
                  <FieldLabel>Steps to reproduce</FieldLabel>
                  <ol className="ml-4 list-decimal space-y-1 text-sm">
                    {finding.stepsToReproduce.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {/* Evidence - the client's own words, kept visually distinct. */}
              {finding.evidence.clientStatement ? (
                <div>
                  <FieldLabel>Client said</FieldLabel>
                  <blockquote className="border-l-2 border-primary/50 pl-3 text-sm italic">
                    &ldquo;{finding.evidence.clientStatement}&rdquo;
                  </blockquote>
                </div>
              ) : null}

              {/* Interpretation - deliberately a separate, labelled panel. */}
              {finding.interpretation ? (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <FieldLabel>AI interpretation</FieldLabel>
                    <span className="text-[11px] text-muted-foreground">
                      {finding.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{finding.interpretation}</p>
                </div>
              ) : null}

              {frame ? (
                <figure>
                  <button
                    type="button"
                    onClick={() => onSeek(finding.evidence.videoId, frame.timeMs)}
                    className="block w-full overflow-hidden rounded-lg border transition-opacity hover:opacity-90"
                  >
                    {/* Frames are local data URLs; next/image can't optimize these. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={frame.dataUrl}
                      alt={`Screen at ${formatClock(frame.timeMs)}`}
                      className="w-full"
                    />
                  </button>
                  <figcaption className="mt-1.5 text-xs text-muted-foreground">
                    {formatClock(frame.timeMs)} -{" "}
                    {frame.ocrText?.trim()
                      ? `on screen: ${frame.ocrText.trim().replace(/\s+/g, " ").slice(0, 120)}`
                      : "selected because the screen changed significantly here"}
                  </figcaption>
                </figure>
              ) : null}

              {finding.acceptanceCriteria.length > 0 ? (
                <div>
                  <FieldLabel>Acceptance criteria</FieldLabel>
                  <ul className="space-y-1.5">
                    {finding.acceptanceCriteria.map((criterion, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Icon name="Check" className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {finding.dependencies.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Depends on <span className="font-mono">{finding.dependencies.join(", ")}</span>
                </p>
              ) : null}
            </>
          )}

          {/* ── Actions ─────────────────────────────────────────────────── */}
          {!editing ? (
            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button
                size="sm"
                variant={finding.status === "approved" ? "default" : "outline"}
                onClick={() => onStatus(finding.id, "approved")}
              >
                <Icon name="Check" className="size-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Icon name="Pencil" className="size-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant={finding.status === "rejected" ? "destructive" : "outline"}
                onClick={() => onStatus(finding.id, "rejected")}
              >
                <Icon name="X" className="size-3.5" /> Reject
              </Button>
              {finding.status === "approved" ? (
                <Button size="sm" variant="ghost" onClick={() => onStatus(finding.id, "completed")}>
                  <Icon name="CircleCheck" className="size-3.5" /> Mark done
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function EditForm({
  draft,
  setDraft,
  onCancel,
  onSave,
}: {
  draft: Finding;
  setDraft: React.Dispatch<React.SetStateAction<Finding>>;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <FieldLabel>Title</FieldLabel>
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <Textarea
          rows={3}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Interpretation</FieldLabel>
        <Textarea
          rows={2}
          value={draft.interpretation}
          onChange={(e) => setDraft({ ...draft, interpretation: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Acceptance criteria (one per line)</FieldLabel>
        <Textarea
          rows={4}
          value={draft.acceptanceCriteria.join("\n")}
          onChange={(e) => setDraft({ ...draft, acceptanceCriteria: e.target.value.split("\n") })}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}>
          Save changes
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/** Confidence as a bar, because a bare percentage is easy to skim past. */
function ConfidenceMeter({ value }: { value: number }) {
  const low = value < LOW_CONFIDENCE;
  return (
    <span className="inline-flex items-center gap-1.5" title={`AI confidence: ${value}%`}>
      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full", low ? "bg-amber-500" : "bg-emerald-500")}
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </span>
      <span className={cn("tabular-nums", low && "text-amber-600 dark:text-amber-400")}>
        {value}%
      </span>
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function Field({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "danger";
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className={cn("text-sm", tone === "danger" && "text-rose-600 dark:text-rose-400")}>
        {children}
      </p>
    </div>
  );
}
