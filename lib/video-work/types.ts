/**
 * Video → Work: core data model.
 *
 * Built ON TOP of the Video Intelligence engine rather than beside it: a
 * transcript here is `Segment[]` from lib/video-intel, and evidence frames are
 * its `CapturedFrame`. That means Whisper transcription, scene-change frame
 * selection, duplicate rejection and SRT/VTT import all come for free and stay
 * in one place.
 *
 * Everything in this file is plain data (no DOM, no network, no model) so the
 * merge, change-detection and export logic can be unit-tested in Node.
 *
 * THE CENTRAL INVARIANT: a Finding is never separable from its evidence. Every
 * one carries the client's verbatim words, the timestamp they said them, and
 * (usually) the frame that was on screen. The AI's reading of that evidence
 * lives in a different field from the evidence itself, and carries a confidence
 * score, so a developer can always audit the interpretation rather than inherit
 * it. Requirements built on a misread sentence are the expensive failure this
 * tool exists to prevent.
 */

import type { Segment } from "@/lib/video-intel/types";
import type { CapturedFrame } from "@/lib/video-intel/frames";

/* ── Findings ─────────────────────────────────────────────────────────────── */

/** What kind of work a finding represents. Mirrors the backend enum. */
export type FindingType =
  | "BUG"
  | "FEATURE"
  | "DESIGN_CHANGE"
  | "CONTENT_CHANGE"
  | "TASK"
  | "QUESTION"
  | "DECISION"
  | "REQUIREMENT"
  | "REFERENCE";

export type Priority = "critical" | "high" | "medium" | "low";

/**
 * Review state. `new` and `needs-review` are both pre-approval, the split
 * exists so the AI can flag which items it is *itself* unsure about, which is a
 * different signal from "a human hasn't looked yet".
 */
export type FindingStatus =
  | "new"
  | "needs-review"
  | "approved"
  | "rejected"
  | "completed";

/** Confidence at or below this reads as a guess and is surfaced as such. */
export const LOW_CONFIDENCE = 60;

export const FINDING_TYPES: readonly FindingType[] = [
  "BUG",
  "FEATURE",
  "DESIGN_CHANGE",
  "CONTENT_CHANGE",
  "TASK",
  "REQUIREMENT",
  "QUESTION",
  "DECISION",
  "REFERENCE",
];

export const PRIORITIES: readonly Priority[] = ["critical", "high", "medium", "low"];

/** Human labels for the type codes, used by the UI and every export. */
export const TYPE_LABELS: Record<FindingType, string> = {
  BUG: "Bug",
  FEATURE: "Feature",
  DESIGN_CHANGE: "Design change",
  CONTENT_CHANGE: "Content change",
  TASK: "Task",
  QUESTION: "Question",
  DECISION: "Decision",
  REQUIREMENT: "Requirement",
  REFERENCE: "Reference",
};

/**
 * The trail back to the moment in the video. Every finding has one; a finding
 * without evidence is a bug in this tool, not a fact about the client.
 */
export interface Evidence {
  /** Id of the video this came from. */
  videoId: string;
  /** Milliseconds into that video. */
  timestampMs: number;
  /** Timestamp of the supporting frame, or null when none applies. */
  frameTimeMs: number | null;
  /** The client's own words, verbatim. Never paraphrased. */
  clientStatement: string;
}

export interface Finding {
  /** Ticket id, unique within the project (e.g. "BUG-004"). */
  id: string;
  type: FindingType;
  title: string;
  priority: Priority;
  /** 0–100, as reported by the model. Displayed, never hidden. */
  confidence: number;
  /** Product area, used to group work and build the intent map. */
  area: string;
  description: string;
  /** Bug only: what actually happens. */
  observed: string;
  /** Bug only: what should happen instead. */
  expected: string;
  stepsToReproduce: string[];
  /** The AI's reading of the client's words as an implementable change. */
  interpretation: string;
  acceptanceCriteria: string[];
  /** Ids of findings that must land first. */
  dependencies: string[];
  evidence: Evidence;
  status: FindingStatus;
  /** True when the AI flagged its own reading as uncertain. */
  needsConfirmation: boolean;
  /** Set when the user edits the finding, so exports can say so. */
  editedByUser?: boolean;
}

export interface ProjectSummary {
  overview: string;
  whatClientWants: string[];
  whatIsBroken: string[];
  risks: string[];
  recommendedOrder: string[];
}

/* ── Videos ───────────────────────────────────────────────────────────────── */

/** How a video entered the project. */
export type VideoSource =
  | { kind: "upload"; fileName: string; sizeBytes: number }
  | { kind: "url"; url: string; provider: ProviderId };

/**
 * Per-video processing state. `frames` and `segments` are produced locally; the
 * blob URL is runtime-only and deliberately never persisted (see storage.ts).
 */
export interface VideoAsset {
  id: string;
  /** Display label, e.g. "Homepage feedback". Defaults to the file name. */
  label: string;
  source: VideoSource;
  durationMs: number;
  /** Object URL for playback. Absent after a project is reloaded from storage. */
  objectUrl?: string;
  segments: Segment[];
  frames: CapturedFrame[];
  /** Poster image (data URL) for the video card. */
  posterDataUrl?: string;
  /** ISO timestamp when this video was added. */
  addedAt: string;
  analyzed: boolean;
  /** Why the analysis step failed, kept so the UI can explain and offer a
   *  re-run instead of a toast that vanishes (live bug 2026-08-21). */
  analysisError?: string;
}

/* ── Cross-video reconciliation ───────────────────────────────────────────── */

/**
 * How a later video changed an earlier requirement. Detected structurally by
 * lib/video-work/merge.ts, the tool reports the pair and asks; it never
 * silently picks a winner, because "the newest wins" is wrong often enough
 * (clients think out loud, then walk it back) to be dangerous.
 */
export type ChangeKind = "new" | "changed" | "repeated" | "contradicted" | "resolved";

export interface ChangeRecord {
  kind: ChangeKind;
  /** The earlier finding. */
  previousId: string;
  /** The later finding that supersedes, repeats or contradicts it. */
  currentId: string;
  /** Why these were matched. Shown so the user can dismiss a bad match. */
  reason: string;
  /** 0–1 similarity that produced the match. */
  similarity: number;
  /** Set once the user picks a side; until then the conflict stays open. */
  resolution?: "keep-previous" | "keep-current" | "keep-both";
}

/* ── Project ──────────────────────────────────────────────────────────────── */

export interface Project {
  id: string;
  name: string;
  /** Free-text context the user gives the analyser ("this is the checkout rebuild"). */
  context: string;
  videos: VideoAsset[];
  findings: Finding[];
  summary: ProjectSummary | null;
  changes: ChangeRecord[];
  createdAt: string;
  updatedAt: string;
}

/* ── Derived views ────────────────────────────────────────────────────────── */

export interface ProjectStats {
  videoCount: number;
  totalDurationMs: number;
  findingCount: number;
  byType: Record<FindingType, number>;
  byPriority: Record<Priority, number>;
  byStatus: Record<FindingStatus, number>;
  needsConfirmation: number;
  openConflicts: number;
}

/** A node in the client intent map: an area and the findings inside it. */
export interface IntentNode {
  type: FindingType;
  label: string;
  areas: { area: string; findingIds: string[] }[];
  count: number;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

export function emptyProject(name = "Untitled project"): Project {
  const now = new Date().toISOString();
  return {
    id: `p${Date.now().toString(36)}`,
    name,
    context: "",
    videos: [],
    findings: [],
    summary: null,
    changes: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** `H:MM:SS` / `M:SS`. Shared with the Video Intelligence formatter's rules. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** Zero-filled tallies, so callers never have to guard a missing key. */
function zeroed<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

const STATUSES: readonly FindingStatus[] = [
  "new",
  "needs-review",
  "approved",
  "rejected",
  "completed",
];

export function computeStats(project: Project): ProjectStats {
  const stats: ProjectStats = {
    videoCount: project.videos.length,
    totalDurationMs: project.videos.reduce((sum, v) => sum + v.durationMs, 0),
    findingCount: project.findings.length,
    byType: zeroed(FINDING_TYPES),
    byPriority: zeroed(PRIORITIES),
    byStatus: zeroed(STATUSES),
    needsConfirmation: 0,
    openConflicts: project.changes.filter(
      (c) => c.kind === "contradicted" && !c.resolution,
    ).length,
  };

  for (const finding of project.findings) {
    stats.byType[finding.type] += 1;
    stats.byPriority[finding.priority] += 1;
    stats.byStatus[finding.status] += 1;
    if (finding.needsConfirmation) stats.needsConfirmation += 1;
  }
  return stats;
}

/** Group findings by type then area: the shape the intent map renders. */
export function buildIntentMap(findings: Finding[]): IntentNode[] {
  const byType = new Map<FindingType, Map<string, string[]>>();

  for (const finding of findings) {
    const area = finding.area.trim() || "General";
    const areas = byType.get(finding.type) ?? new Map<string, string[]>();
    areas.set(area, [...(areas.get(area) ?? []), finding.id]);
    byType.set(finding.type, areas);
  }

  return FINDING_TYPES.filter((type) => byType.has(type)).map((type) => {
    const areas = byType.get(type)!;
    return {
      type,
      label: TYPE_LABELS[type],
      areas: [...areas.entries()]
        .map(([area, findingIds]) => ({ area, findingIds }))
        .sort((a, b) => b.findingIds.length - a.findingIds.length),
      count: [...areas.values()].reduce((sum, ids) => sum + ids.length, 0),
    };
  });
}

/**
 * Order findings the way a developer would work them: dependencies first, then
 * priority, then the order they came up in the video. The model also proposes
 * an order in `summary.recommendedOrder`; this is the deterministic fallback
 * and the tiebreak, so the list is stable even when analysis is unavailable.
 */
export function implementationOrder(findings: Finding[]): Finding[] {
  const rank: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const byId = new Map(findings.map((f) => [f.id, f]));
  const ordered: Finding[] = [];
  const placed = new Set<string>();

  const visit = (finding: Finding, seen: Set<string>): void => {
    if (placed.has(finding.id) || seen.has(finding.id)) return;
    seen.add(finding.id);
    for (const dependency of finding.dependencies) {
      const target = byId.get(dependency);
      if (target) visit(target, seen);
    }
    if (!placed.has(finding.id)) {
      placed.add(finding.id);
      ordered.push(finding);
    }
  };

  const sorted = [...findings].sort(
    (a, b) =>
      rank[a.priority] - rank[b.priority] ||
      a.evidence.timestampMs - b.evidence.timestampMs,
  );
  for (const finding of sorted) visit(finding, new Set());
  return ordered;
}

/* ── URL ingestion ────────────────────────────────────────────────────────── */

/** Providers we can recognise. Recognising is not the same as fetching. */
export type ProviderId = "loom" | "youtube" | "vimeo" | "direct" | "unknown";
