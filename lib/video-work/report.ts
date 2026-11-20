/**
 * Video → Work, PDF report.
 *
 * The document you send a client or file with a project. It is the export that
 * gets read by people who will never open the workspace, which shapes two
 * decisions:
 *
 *   1. Screenshots are embedded at full width next to the finding they
 *      evidence, with their timestamp and why they were selected. A report that
 *      says "the checkout button doesn't respond" is an assertion; one that
 *      shows the screen at 04:31 with the client's sentence beside it is
 *      evidence someone can act on without rewatching anything.
 *
 *   2. Confidence and review status are printed, not formatted away. A PDF is
 *      the format most likely to be forwarded and treated as settled, so an
 *  unconfirmed interpretation is marked on the page itself, otherwise the
 *      export quietly upgrades a guess into a specification.
 *
 * Rendering goes through `reportHtmlToPdfBlob`, which draws inside an isolated
 * iframe to avoid the html2canvas/oklch crash. Styles here are therefore plain
 * hex and never Tailwind tokens.
 */

import { reportHtmlToPdfBlob } from "@/lib/seo-tools/report-pdf";

import {
  TYPE_LABELS,
  computeStats,
  formatClock,
  implementationOrder,
  type Finding,
  type Project,
} from "./types";
import { selectFindings, type ExportOptions } from "./exports";

/* ── Palette (hex only: see the oklch note above) ────────────────────────── */

const INK = "#111827";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";
const ACCENT = "#4f46e5";
const WARN = "#b45309";
const WARN_BG = "#fffbeb";
const DANGER = "#b91c1c";

const PRIORITY_COLOR: Record<Finding["priority"], string> = {
  critical: "#b91c1c",
  high: "#c2410c",
  medium: "#a16207",
  low: "#4b5563",
};

/* ── Entry point ──────────────────────────────────────────────────────────── */

export async function buildReportPdf(
  project: Project,
  options: ExportOptions = {},
): Promise<Blob> {
  return reportHtmlToPdfBlob(buildReportHtml(project, options));
}

/** Exposed separately so the engine tests can assert on the markup. */
export function buildReportHtml(project: Project, options: ExportOptions = {}): string {
  const findings = selectFindings(project, options);
  const stats = computeStats(project);
  const ordered = implementationOrder(findings);
  const conflicts = project.changes.filter((c) => c.kind === "contradicted");
  const unconfirmed = findings.filter((f) => f.needsConfirmation && f.status !== "approved");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(project.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; font: 13px/1.6 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: #ffffff; }
  h1 { font-size: 30px; line-height: 1.2; margin: 0 0 8px; letter-spacing: -0.02em; }
  h2 { font-size: 19px; margin: 34px 0 12px; padding-bottom: 7px; border-bottom: 2px solid ${LINE}; letter-spacing: -0.01em; }
  h3 { font-size: 15px; margin: 0 0 6px; }
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 12px; padding-left: 20px; }
  li { margin: 0 0 5px; }
  .kicker { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${ACCENT}; font-weight: 700; margin: 0 0 10px; }
  .lede { color: ${MUTED}; font-size: 14px; margin: 0 0 26px; }
  .rule { height: 3px; background: ${ACCENT}; width: 56px; margin: 0 0 26px; }

  .grid { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 26px; }
  .stat { flex: 1 1 118px; border: 1px solid ${LINE}; border-radius: 8px; padding: 12px 14px; }
  .stat .n { font-size: 22px; font-weight: 700; line-height: 1.1; }
  .stat .l { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; margin-top: 3px; }

  .card { border: 1px solid ${LINE}; border-radius: 9px; padding: 15px 17px; margin: 0 0 15px; page-break-inside: avoid; }
  .card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; }
  .id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: ${MUTED}; }
  .badges { margin: 0 0 10px; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; margin-right: 5px; border: 1px solid ${LINE}; color: ${MUTED}; }
  .badge.p { color: #ffffff; border: 0; }

  .quote { border-left: 3px solid ${ACCENT}; padding: 6px 0 6px 12px; margin: 0 0 10px; color: ${INK}; font-style: italic; }
  .src { font-size: 11px; color: ${MUTED}; margin: 0 0 10px; }

  .interp { background: #f9fafb; border: 1px solid ${LINE}; border-radius: 7px; padding: 10px 12px; margin: 0 0 10px; }
  .interp .h { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; font-weight: 700; margin-bottom: 4px; }

  .warn { background: ${WARN_BG}; border: 1px solid #fcd34d; color: ${WARN}; border-radius: 7px; padding: 10px 12px; margin: 0 0 12px; font-size: 12px; }
  .danger { border-color: #fca5a5; background: #fef2f2; color: ${DANGER}; }

  .ac { margin: 0; padding-left: 18px; }
  .ac li { margin-bottom: 4px; }

  figure { margin: 0 0 10px; }
  figure img { width: 100%; border: 1px solid ${LINE}; border-radius: 6px; display: block; }
  figcaption { font-size: 10px; color: ${MUTED}; margin-top: 4px; }

  .timeline-row { display: flex; gap: 10px; align-items: baseline; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
  .timeline-row .t { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: ${ACCENT}; min-width: 62px; }

  .foot { margin-top: 36px; padding-top: 12px; border-top: 1px solid ${LINE}; font-size: 10px; color: ${MUTED}; }
</style></head><body>

<p class="kicker">GigAI · Video → Work</p>
<h1>${esc(project.name)}</h1>
<div class="rule"></div>
<p class="lede">
  ${stats.videoCount} client recording${stats.videoCount === 1 ? "" : "s"} ·
  ${Math.round(stats.totalDurationMs / 60000)} minutes analysed ·
  ${findings.length} finding${findings.length === 1 ? "" : "s"} ·
  ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
</p>

<div class="grid">
  ${stat(stats.byType.BUG, "Bugs")}
  ${stat(stats.byType.FEATURE, "Features")}
  ${stat(stats.byType.DESIGN_CHANGE, "Design")}
  ${stat(stats.byType.CONTENT_CHANGE, "Content")}
  ${stat(stats.byType.QUESTION, "Questions")}
</div>

${
  unconfirmed.length > 0 || conflicts.some((c) => !c.resolution)
    ? `<div class="warn"><strong>Read before building.</strong> This report contains
        ${unconfirmed.length} interpretation${unconfirmed.length === 1 ? "" : "s"} the analysis
        flagged as uncertain${
          conflicts.filter((c) => !c.resolution).length
            ? ` and ${conflicts.filter((c) => !c.resolution).length} unresolved contradiction${
                conflicts.filter((c) => !c.resolution).length === 1 ? "" : "s"
              }`
            : ""
        }. Each is marked in place. Confirm those with the client before they become work.</div>`
    : ""
}

${section("Executive summary", project.summary?.overview ? `<p>${esc(project.summary.overview)}</p>` : "")}
${bullets("What the client wants", project.summary?.whatClientWants)}
${bullets("What is broken", project.summary?.whatIsBroken)}
${bullets("Risks", project.summary?.risks)}

${conflictSection(project, conflicts)}

${
  ordered.length > 0
    ? `<h2>Recommended implementation order</h2><ol>${ordered
        .filter((f) => f.type !== "QUESTION" && f.type !== "REFERENCE")
        .map(
          (f) =>
            `<li><strong>${esc(f.id)}</strong> ${esc(f.title)}, ${esc(f.priority)}${
 f.dependencies.length ? ` <em>(after ${esc(f.dependencies.join(", "))})</em>` : ""
            }</li>`,
        )
        .join("")}</ol>`
    : ""
}

<h2>Findings</h2>
${ordered.map((finding) => findingCard(finding, project)).join("")}

${timelineSection(project, findings)}

<p class="foot">
  Generated by GigAI Video → Work. Findings are produced by AI analysis of the transcript and
  selected frames; the client's own words and the timestamp are printed with each item so every
  interpretation can be checked against the source. Confidence scores are the model's own.
</p>

</body></html>`;
}

/* ── Sections ─────────────────────────────────────────────────────────────── */

function findingCard(finding: Finding, project: Project): string {
  const video = project.videos.find((v) => v.id === finding.evidence.videoId);
  const frame =
    finding.evidence.frameTimeMs !== null
      ? video?.frames.find((f) => f.timeMs === finding.evidence.frameTimeMs)
      : undefined;

  return `<div class="card">
  <div class="card-head">
    <h3>${esc(finding.title)}</h3>
    <span class="id">${esc(finding.id)}</span>
  </div>

  <div class="badges">
    <span class="badge p" style="background:${PRIORITY_COLOR[finding.priority]}">${esc(finding.priority)}</span>
    <span class="badge">${esc(TYPE_LABELS[finding.type])}</span>
    ${finding.area ? `<span class="badge">${esc(finding.area)}</span>` : ""}
    <span class="badge">${finding.confidence}% confidence</span>
    ${finding.editedByUser ? `<span class="badge">edited by user</span>` : ""}
  </div>

  ${
    finding.needsConfirmation && finding.status !== "approved"
      ? `<div class="warn">Needs confirmation - the client's intent was ambiguous here. Check this
          reading with them before building it.</div>`
      : ""
  }

  ${finding.description ? `<p>${esc(finding.description)}</p>` : ""}
  ${finding.observed ? `<p><strong>Observed:</strong> ${esc(finding.observed)}</p>` : ""}
  ${finding.expected ? `<p><strong>Expected:</strong> ${esc(finding.expected)}</p>` : ""}

  ${
    finding.stepsToReproduce.length > 0
      ? `<p><strong>Steps to reproduce</strong></p><ol>${finding.stepsToReproduce
          .map((step) => `<li>${esc(step)}</li>`)
          .join("")}</ol>`
      : ""
  }

  ${finding.evidence.clientStatement ? `<div class="quote">“${esc(finding.evidence.clientStatement)}”</div>` : ""}
  <p class="src">${esc(video?.label ?? "Video")} · ${formatClock(finding.evidence.timestampMs)}${
    frame ? ` · screenshot at ${formatClock(frame.timeMs)}` : " · no screenshot available"
  }</p>

  ${
    frame
      ? `<figure><img src="${frame.dataUrl}" alt="Screen at ${formatClock(frame.timeMs)}">
          <figcaption>${formatClock(frame.timeMs)} - ${esc(
            frame.ocrText?.trim()
              ? `on screen: ${truncate(frame.ocrText.trim().replace(/\s+/g, " "), 120)}`
              : "selected because the screen changed significantly here",
          )}</figcaption></figure>`
      : ""
  }

  ${
    finding.interpretation
      ? `<div class="interp"><div class="h">AI interpretation, verify before building</div>
          ${esc(finding.interpretation)}</div>`
      : ""
  }

  ${
    finding.acceptanceCriteria.length > 0
      ? `<p><strong>Acceptance criteria</strong></p><ul class="ac">${finding.acceptanceCriteria
          .map((criterion) => `<li>${esc(criterion)}</li>`)
          .join("")}</ul>`
      : ""
  }

  ${
    finding.dependencies.length > 0
      ? `<p class="src">Depends on ${esc(finding.dependencies.join(", "))}</p>`
      : ""
  }
</div>`;
}

function conflictSection(project: Project, conflicts: Project["changes"]): string {
  if (conflicts.length === 0) return "";
  const rows = conflicts
    .map((conflict) => {
      const previous = project.findings.find((f) => f.id === conflict.previousId);
      const current = project.findings.find((f) => f.id === conflict.currentId);
      return `<div class="warn ${conflict.resolution ? "" : "danger"}">
        <strong>${esc(conflict.previousId)}</strong> “${esc(previous?.title ?? "unknown")}”
        vs <strong>${esc(conflict.currentId)}</strong> “${esc(current?.title ?? "unknown")}”<br>
        ${esc(conflict.reason)}<br>
        ${
          conflict.resolution
            ? `<em>Resolved: ${esc(conflict.resolution.replace("-", " "))}</em>`
            : `<strong>Unresolved, confirm with the client which one stands.</strong>`
        }
      </div>`;
    })
    .join("");
  return `<h2>Conflicting requirements</h2>${rows}`;
}

function timelineSection(project: Project, findings: Finding[]): string {
  if (findings.length === 0) return "";
  const rows = [...findings]
    .sort((a, b) => a.evidence.timestampMs - b.evidence.timestampMs)
    .map((finding) => {
      const video = project.videos.find((v) => v.id === finding.evidence.videoId);
      return `<div class="timeline-row">
        <span class="t">${formatClock(finding.evidence.timestampMs)}</span>
        <span><strong>${esc(finding.id)}</strong> ${esc(finding.title)}
        <span style="color:${MUTED}"> · ${esc(video?.label ?? "video")}</span></span>
      </div>`;
    })
    .join("");
  return `<h2>Timeline</h2>${rows}`;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function section(heading: string, body: string): string {
  return body ? `<h2>${esc(heading)}</h2>${body}` : "";
}

function bullets(heading: string, items: string[] | undefined): string {
  if (!items || items.length === 0) return "";
  return `<h2>${esc(heading)}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function stat(value: number, label: string): string {
  return `<div class="stat"><div class="n">${value}</div><div class="l">${esc(label)}</div></div>`;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Escape for HTML text and attribute contexts. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
