"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  TYPE_LABELS,
  buildIntentMap,
  computeStats,
  formatClock,
  type ChangeRecord,
  type Finding,
  type Project,
} from "@/lib/video-work/types";

/* ── Project overview ─────────────────────────────────────────────────────── */

export function ProjectOverview({ project }: { project: Project }) {
  const stats = computeStats(project);
  const minutes = Math.round(stats.totalDurationMs / 60000);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat value={stats.videoCount} label="Videos" />
        <Stat value={`${minutes}m`} label="Analyzed" />
        <Stat value={stats.byType.BUG} label="Bugs" tone="danger" />
        <Stat value={stats.byType.FEATURE} label="Features" />
        <Stat value={stats.byType.DESIGN_CHANGE} label="Design" />
        <Stat value={stats.byType.QUESTION} label="Questions" />
      </div>

      {stats.needsConfirmation > 0 || stats.openConflicts > 0 ? (
        <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
          <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" />
          <p>
            {stats.openConflicts > 0 ? (
              <>
                <strong>
                  {stats.openConflicts} contradiction{stats.openConflicts === 1 ? "" : "s"}
                </strong>{" "}
                between videos need a decision.{" "}
              </>
            ) : null}
            {stats.needsConfirmation > 0 ? (
              <>
                <strong>
                  {stats.needsConfirmation} interpretation
                  {stats.needsConfirmation === 1 ? "" : "s"}
                </strong>{" "}
                are uncertain and should be confirmed with the client before they become work.
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {project.summary ? (
        <div className="space-y-4 rounded-xl border bg-card p-4">
          {project.summary.overview ? (
            <div>
              <PanelHeading>Executive summary</PanelHeading>
              <p className="text-sm leading-relaxed">{project.summary.overview}</p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <BulletList title="What the client wants" items={project.summary.whatClientWants} />
            <BulletList title="What is broken" items={project.summary.whatIsBroken} tone="danger" />
          </div>

          {project.summary.risks.length > 0 ? (
            <BulletList title="Risks & open questions" items={project.summary.risks} tone="warn" />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/* ── Conflicts ────────────────────────────────────────────────────────────── */

interface ConflictPanelProps {
  project: Project;
  onResolve: (index: number, choice: NonNullable<ChangeRecord["resolution"]>) => void;
  onSeek: (videoId: string, ms: number) => void;
}

/**
 * Contradictions between videos.
 *
 * The tool never picks a side. "Newest wins" is wrong often enough to be
 * dangerous, clients float an idea and walk it back, and the walk-back is
 * sometimes the earlier recording. So both statements are shown with their
 * timestamps and the user decides, which is the only party who can.
 */
export function ConflictPanel({ project, onResolve, onSeek }: ConflictPanelProps) {
  const conflicts = project.changes
    .map((change, index) => ({ change, index }))
    .filter(({ change }) => change.kind === "contradicted");

  if (conflicts.length === 0) return null;

  const find = (id: string) => project.findings.find((f) => f.id === id);

  return (
    <section className="space-y-3">
      <PanelHeading>
        Conflicting requirements ({conflicts.filter(({ change }) => !change.resolution).length}{" "}
        unresolved)
      </PanelHeading>

      {conflicts.map(({ change, index }) => {
        const previous = find(change.previousId);
        const current = find(change.currentId);
        if (!previous || !current) return null;

        return (
          <div
            key={`${change.previousId}-${change.currentId}`}
            className={cn(
              "rounded-xl border p-4",
              change.resolution ? "bg-card" : "border-amber-500/30 bg-amber-500/5",
            )}
          >
            <p className="mb-3 text-sm">{change.reason}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <ConflictSide
                finding={previous}
                project={project}
                label="Said earlier"
                chosen={change.resolution === "keep-previous"}
                onSeek={onSeek}
              />
              <ConflictSide
                finding={current}
                project={project}
                label="Said later"
                chosen={change.resolution === "keep-current"}
                onSeek={onSeek}
              />
            </div>

            {change.resolution ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Resolved - keeping {change.resolution.replace("keep-", "the ")} version.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => onResolve(index, "keep-previous")}>
                  Keep the earlier one
                </Button>
                <Button size="sm" variant="outline" onClick={() => onResolve(index, "keep-current")}>
                  Keep the later one
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onResolve(index, "keep-both")}>
                  They&rsquo;re both valid
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function ConflictSide({
  finding,
  project,
  label,
  chosen,
  onSeek,
}: {
  finding: Finding;
  project: Project;
  label: string;
  chosen: boolean;
  onSeek: (videoId: string, ms: number) => void;
}) {
  const video = project.videos.find((v) => v.id === finding.evidence.videoId);
  return (
    <div className={cn("rounded-lg border bg-background p-3", chosen && "ring-2 ring-primary/40")}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">{finding.title}</p>
      {finding.evidence.clientStatement ? (
        <blockquote className="mt-1.5 border-l-2 border-border pl-2 text-xs italic text-muted-foreground">
          &ldquo;{finding.evidence.clientStatement}&rdquo;
        </blockquote>
      ) : null}
      <button
        type="button"
        onClick={() => onSeek(finding.evidence.videoId, finding.evidence.timestampMs)}
        className="mt-1.5 font-mono text-xs text-primary hover:underline"
      >
        {video?.label ?? "video"} · {formatClock(finding.evidence.timestampMs)}
      </button>
    </div>
  );
}

/* ── Intent map ───────────────────────────────────────────────────────────── */

export function IntentMap({
  project,
  onOpenFinding,
}: {
  project: Project;
  onOpenFinding: (id: string) => void;
}) {
  const nodes = buildIntentMap(project.findings);
  if (nodes.length === 0) return null;

  return (
    <section className="space-y-3">
      <PanelHeading>Client intent map</PanelHeading>
      <div className="rounded-xl border bg-card p-4 font-mono text-sm">
        <p className="mb-1 font-semibold">{project.name}</p>
        {nodes.map((node, nodeIndex) => {
          const lastNode = nodeIndex === nodes.length - 1;
          return (
            <div key={node.type}>
              <p className="text-muted-foreground">
                {lastNode ? "└──" : "├──"} {TYPE_LABELS[node.type]}s ({node.count})
              </p>
              {node.areas.map((area, areaIndex) => {
                const lastArea = areaIndex === node.areas.length - 1;
                return (
                  <div key={area.area} className="pl-4">
                    <p className="text-muted-foreground">
                      {lastNode ? "  " : "│ "}
                      {lastArea ? "└──" : "├──"} {area.area}
                    </p>
                    <div className="flex flex-wrap gap-1 py-1 pl-8">
                      {area.findingIds.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onOpenFinding(id)}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs hover:bg-primary hover:text-primary-foreground"
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Timeline ─────────────────────────────────────────────────────────────── */

export function Timeline({
  project,
  onSeek,
}: {
  project: Project;
  onSeek: (videoId: string, ms: number) => void;
}) {
  if (project.findings.length === 0) return null;

  const byVideo = project.videos
    .map((video) => ({
      video,
      findings: project.findings
        .filter((f) => f.evidence.videoId === video.id)
        .sort((a, b) => a.evidence.timestampMs - b.evidence.timestampMs),
    }))
    .filter((group) => group.findings.length > 0);

  return (
    <section className="space-y-3">
      <PanelHeading>Timeline</PanelHeading>
      {byVideo.map(({ video, findings }) => (
        <div key={video.id} className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-medium">{video.label}</p>
          <ul className="space-y-1">
            {findings.map((finding) => (
              <li key={finding.id}>
                <button
                  type="button"
                  onClick={() => onSeek(video.id, finding.evidence.timestampMs)}
                  className="flex w-full gap-3 rounded px-1 py-1 text-left text-sm hover:bg-muted"
                >
                  <span className="shrink-0 font-mono text-xs text-primary">
                    {formatClock(finding.evidence.timestampMs)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-mono text-xs text-muted-foreground">{finding.id}</span>{" "}
                    {finding.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────────────── */

function Stat({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone?: "danger";
}) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <p
        className={cn(
          "text-xl font-semibold tabular-nums",
          tone === "danger" && Number(value) > 0 && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold">{children}</h3>;
}

function BulletList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "danger" | "warn";
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <Icon
              name={tone === "danger" ? "CircleX" : tone === "warn" ? "TriangleAlert" : "Check"}
              className={cn(
                "mt-0.5 size-3.5 shrink-0",
                tone === "danger"
                  ? "text-rose-500"
                  : tone === "warn"
                    ? "text-amber-500"
                    : "text-emerald-500",
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
