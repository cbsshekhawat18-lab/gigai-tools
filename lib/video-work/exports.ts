/**
 * Video → Work: text exports.
 *
 * Markdown, JSON and plain text, plus the developer handoff, the document you
 * paste into a ticket tracker or hand to whoever is building the work.
 *
 * Two rules run through all of them.
 *
 * FIRST: evidence travels with the finding. Every exported item carries the
 * client's verbatim words and the timestamp they said them, so the person
 * reading the export downstream can check the interpretation against the source
 * without coming back to ask. An export that drops the evidence turns a
 * reviewable proposal into an unattributed instruction.
 *
 * SECOND: uncertainty survives export. A finding the model flagged as needing
 * confirmation says so in Markdown, in JSON, in the handoff and in the PDF. It
 * is very easy to build an export that quietly launders a 40%-confidence guess
 * into a line item that looks like a decided requirement; that is precisely
 * the failure this tool exists to prevent, so confidence and status are never
 * formatted away.
 *
 * The JSON export is the integration surface: Jira, Linear, GitHub Issues and
 * the rest are mappings from this shape, which is why it is versioned and why
 * `toIntegrationPayload` exists separately from the pretty-printed dump.
 */

import {
  TYPE_LABELS,
  computeStats,
  formatClock,
  implementationOrder,
  type Finding,
  type Project,
  type VideoAsset,
} from "./types";
import { supersededIds } from "./merge";

export type ExportFormat = "md" | "json" | "txt" | "handoff";

export interface ExportFile {
  name: string;
  mime: string;
  body: string;
}

/** Schema version for the JSON export. Bump on any breaking shape change. */
export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportOptions {
  /** Leave out findings the user rejected. On by default. */
  excludeRejected?: boolean;
  /** Export only these ids (a selection). Empty/absent means everything. */
  onlyIds?: string[];
}

/* ── Entry point ──────────────────────────────────────────────────────────── */

export function exportProject(
  format: ExportFormat,
  project: Project,
  options: ExportOptions = {},
): ExportFile {
  const findings = selectFindings(project, options);
  const slug = slugify(project.name) || "video-to-work";

  switch (format) {
    case "md":
      return { name: `${slug}.md`, mime: "text/markdown;charset=utf-8", body: toMarkdown(project, findings) };
    case "handoff":
      return {
        name: `${slug}-developer-handoff.md`,
        mime: "text/markdown;charset=utf-8",
        body: toHandoff(project, findings),
      };
    case "json":
      return {
        name: `${slug}.json`,
        mime: "application/json;charset=utf-8",
        body: JSON.stringify(toIntegrationPayload(project, findings), null, 2),
      };
    case "txt":
      return { name: `${slug}.txt`, mime: "text/plain;charset=utf-8", body: toText(project, findings) };
  }
}

export function toBlob(file: ExportFile): Blob {
  return new Blob([file.body], { type: file.mime });
}

/** Trigger a download in the browser. */
export function downloadExport(file: ExportFile): void {
  const url = URL.createObjectURL(toBlob(file));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Which findings an export should contain.
 *
 * Rejected work and the losing side of a resolved conflict are excluded by
 * default, shipping both halves of a contradiction as tasks is exactly the
 * "developer builds the wrong thing" outcome the tool is meant to stop.
 */
export function selectFindings(project: Project, options: ExportOptions = {}): Finding[] {
  const { excludeRejected = true, onlyIds } = options;
  const superseded = supersededIds(project.changes);
  const wanted = onlyIds && onlyIds.length > 0 ? new Set(onlyIds) : null;

  return project.findings.filter((finding) => {
    if (wanted && !wanted.has(finding.id)) return false;
    if (excludeRejected && finding.status === "rejected") return false;
    if (excludeRejected && superseded.has(finding.id)) return false;
    return true;
  });
}

/* ── Markdown ─────────────────────────────────────────────────────────────── */

function toMarkdown(project: Project, findings: Finding[]): string {
  const stats = computeStats(project);
  const lines: string[] = [
    `# ${project.name}`,
    "",
    `${stats.videoCount} video${stats.videoCount === 1 ? "" : "s"} analysed · ` +
      `${Math.round(stats.totalDurationMs / 60000)} minutes · ${findings.length} findings`,
    "",
  ];

  if (project.summary?.overview) {
    lines.push("## Summary", "", project.summary.overview, "");
  }

  bulletSection(lines, "What the client wants", project.summary?.whatClientWants);
  bulletSection(lines, "What is broken", project.summary?.whatIsBroken);
  bulletSection(lines, "Risks and open questions", project.summary?.risks);

  const conflicts = project.changes.filter((c) => c.kind === "contradicted");
  if (conflicts.length > 0) {
    lines.push("## Conflicting requirements", "");
    for (const conflict of conflicts) {
      const previous = project.findings.find((f) => f.id === conflict.previousId);
      const current = project.findings.find((f) => f.id === conflict.currentId);
      lines.push(
        `- **${conflict.previousId}** “${previous?.title ?? "unknown"}” vs ` +
          `**${conflict.currentId}** “${current?.title ?? "unknown"}”`,
        `  - ${conflict.reason}`,
        `  - ${conflict.resolution ? `Resolved: ${conflict.resolution.replace("-", " ")}` : "**Unresolved, confirm with the client.**"}`,
      );
    }
    lines.push("");
  }

  // Group by type so a reader can scan to the section they own.
  const grouped = groupByType(findings);
  for (const [type, items] of grouped) {
    lines.push(`## ${TYPE_LABELS[type]}s (${items.length})`, "");
    for (const finding of items) {
      lines.push(...findingMarkdown(finding, project));
    }
  }

  lines.push("---", "", `Generated by GigAI Video → Work · ${new Date().toISOString().slice(0, 10)}`);
  return lines.join("\n");
}

function findingMarkdown(finding: Finding, project: Project): string[] {
  const video = project.videos.find((v) => v.id === finding.evidence.videoId);
  const lines: string[] = [
    `### ${finding.id}, ${finding.title}`,
    "",
    `**Priority:** ${finding.priority} · **Status:** ${statusLabel(finding)} · ` +
      `**AI confidence:** ${finding.confidence}%${finding.needsConfirmation ? " - ⚠️ needs confirmation" : ""}`,
    "",
  ];

  if (finding.area) lines.push(`**Area:** ${finding.area}`, "");
  if (finding.description) lines.push(finding.description, "");

  if (finding.observed) lines.push(`**Observed:** ${finding.observed}`, "");
  if (finding.expected) lines.push(`**Expected:** ${finding.expected}`, "");

  if (finding.stepsToReproduce.length > 0) {
    lines.push("**Steps to reproduce:**", "");
    finding.stepsToReproduce.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }

  // Evidence first-class: the quote, then where it came from.
  if (finding.evidence.clientStatement) {
    lines.push(`**Client said:**`, "", `> ${finding.evidence.clientStatement}`, "");
  }
  lines.push(
    `**Source:** ${video?.label ?? "video"} at ${formatClock(finding.evidence.timestampMs)}` +
      (finding.evidence.frameTimeMs !== null
        ? ` · screenshot at ${formatClock(finding.evidence.frameTimeMs)}`
        : " · no screenshot"),
    "",
  );

  if (finding.interpretation) {
    lines.push(
      `**AI interpretation** (${finding.confidence}% confidence, verify before building):`,
      "",
      finding.interpretation,
      "",
    );
  }

  if (finding.acceptanceCriteria.length > 0) {
    lines.push("**Acceptance criteria:**", "");
    for (const criterion of finding.acceptanceCriteria) lines.push(`- [ ] ${criterion}`);
    lines.push("");
  }

  if (finding.dependencies.length > 0) {
    lines.push(`**Depends on:** ${finding.dependencies.join(", ")}`, "");
  }

  return lines;
}

/* ── Developer handoff ────────────────────────────────────────────────────── */

/**
 * The one-click handoff: everything a developer needs, ordered the way they
 * should work it, with the unresolved questions pulled to the top where they
 * cannot be missed rather than buried under the tasks they block.
 */
function toHandoff(project: Project, findings: Finding[]): string {
  const ordered = implementationOrder(findings.filter((f) => f.status !== "rejected"));
  const unresolved = project.changes.filter((c) => c.kind === "contradicted" && !c.resolution);
  const unconfirmed = findings.filter((f) => f.needsConfirmation && f.status !== "approved");
  const questions = findings.filter((f) => f.type === "QUESTION");

  const lines: string[] = [
    `# Developer handoff, ${project.name}`,
    "",
    `Generated ${new Date().toISOString().slice(0, 10)} from ${project.videos.length} client ` +
      `recording${project.videos.length === 1 ? "" : "s"} (${Math.round(
        project.videos.reduce((sum, v) => sum + v.durationMs, 0) / 60000,
      )} minutes).`,
    "",
  ];

  if (project.summary?.overview) lines.push("## Overview", "", project.summary.overview, "");

  if (unresolved.length > 0 || unconfirmed.length > 0 || questions.length > 0) {
    lines.push("## ⚠️ Resolve before building", "");
    for (const conflict of unresolved) {
      lines.push(`- **Conflict** ${conflict.previousId} vs ${conflict.currentId}, ${conflict.reason}`);
    }
    for (const finding of unconfirmed) {
      lines.push(
        `- **Unconfirmed** ${finding.id} “${finding.title}”, ${finding.confidence}% confidence. ` +
          `Client said: “${truncate(finding.evidence.clientStatement, 160)}”`,
      );
    }
    for (const finding of questions) {
      lines.push(`- **Question** ${finding.id}: ${finding.title}`);
    }
    lines.push("");
  }

  lines.push("## Implementation order", "");
  ordered
    .filter((f) => f.type !== "QUESTION" && f.type !== "REFERENCE")
    .forEach((finding, index) => {
      lines.push(
        `${index + 1}. **${finding.id}** ${finding.title}, ${finding.priority}` +
          (finding.dependencies.length ? ` (after ${finding.dependencies.join(", ")})` : ""),
      );
    });
  lines.push("");

  lines.push("## The work", "");
  for (const finding of ordered) {
    lines.push(...findingMarkdown(finding, project));
  }

  return lines.join("\n");
}

/* ── JSON ─────────────────────────────────────────────────────────────────── */

/**
 * The machine-readable shape, and the seam future integrations map from.
 *
 * Jira, Linear, GitHub Issues, ClickUp and Trello each want a different set of
 * fields, but all of them want the same underlying facts: title, body,
 * priority, labels, acceptance criteria, a link back to the evidence. Keeping
 * that fact set stable and versioned here means an integration is a mapping
 * file, not a change to the tool.
 */
export function toIntegrationPayload(project: Project, findings: Finding[]) {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    generator: "GigAI Video → Work",
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      context: project.context,
      createdAt: project.createdAt,
    },
    videos: project.videos.map(videoPayload),
    summary: project.summary,
    conflicts: project.changes,
    findings: findings.map((finding) => ({
      id: finding.id,
      type: finding.type,
      title: finding.title,
      priority: finding.priority,
      status: finding.status,
      area: finding.area,
      description: finding.description,
      observed: finding.observed,
      expected: finding.expected,
      stepsToReproduce: finding.stepsToReproduce,
      acceptanceCriteria: finding.acceptanceCriteria,
      dependencies: finding.dependencies,
      // Kept structurally distinct in the payload, exactly as in the UI: what
      // the client said, versus what the model made of it, versus how sure it is.
      evidence: {
        videoId: finding.evidence.videoId,
        timestampMs: finding.evidence.timestampMs,
        timestamp: formatClock(finding.evidence.timestampMs),
        frameTimeMs: finding.evidence.frameTimeMs,
        clientStatement: finding.evidence.clientStatement,
      },
      aiInterpretation: finding.interpretation,
      aiConfidence: finding.confidence,
      needsConfirmation: finding.needsConfirmation,
      editedByUser: Boolean(finding.editedByUser),
    })),
  };
}

function videoPayload(video: VideoAsset) {
  return {
    id: video.id,
    label: video.label,
    durationMs: video.durationMs,
    duration: formatClock(video.durationMs),
    source: video.source,
    addedAt: video.addedAt,
    segmentCount: video.segments.length,
    frameCount: video.frames.length,
  };
}

/* ── Plain text ───────────────────────────────────────────────────────────── */

function toText(project: Project, findings: Finding[]): string {
  const lines: string[] = [project.name.toUpperCase(), "=".repeat(project.name.length), ""];

  if (project.summary?.overview) lines.push(project.summary.overview, "");

  for (const finding of implementationOrder(findings)) {
    lines.push(
      `${finding.id} [${finding.priority.toUpperCase()}] ${finding.title}`,
      `  Type: ${TYPE_LABELS[finding.type]}${finding.area ? ` · Area: ${finding.area}` : ""}`,
      `  Source: ${formatClock(finding.evidence.timestampMs)}` +
        `  Confidence: ${finding.confidence}%${finding.needsConfirmation ? " (NEEDS CONFIRMATION)" : ""}`,
    );
    if (finding.description) lines.push(`  ${finding.description}`);
    if (finding.evidence.clientStatement) {
      lines.push(`  Client said: "${finding.evidence.clientStatement}"`);
    }
    for (const criterion of finding.acceptanceCriteria) lines.push(`    - ${criterion}`);
    lines.push("");
  }

  return lines.join("\n");
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function groupByType(findings: Finding[]): Map<Finding["type"], Finding[]> {
  const grouped = new Map<Finding["type"], Finding[]>();
  for (const finding of findings) {
    grouped.set(finding.type, [...(grouped.get(finding.type) ?? []), finding]);
  }
  return grouped;
}

function bulletSection(lines: string[], heading: string, items: string[] | undefined): void {
  if (!items || items.length === 0) return;
  lines.push(`## ${heading}`, "");
  for (const item of items) lines.push(`- ${item}`);
  lines.push("");
}

function statusLabel(finding: Finding): string {
  const labels: Record<Finding["status"], string> = {
    new: "New",
    "needs-review": "Needs review",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
  };
  return labels[finding.status];
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
