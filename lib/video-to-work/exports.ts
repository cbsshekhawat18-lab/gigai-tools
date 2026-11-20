/**
 * Free ticket exports (P8 Tier 1). Work doesn't happen in our browser tab, so
 * the tickets have to land where the team already works:
 *  - Markdown, grouped by type, quotes as blockquotes with timestamps
 *  - CSV with Jira-import-compatible headers
 *  - JSON (the raw ExtractionResult tickets)
 *  - a per-ticket plain-text block for pasting into any tracker
 * All free, all client-side. Pure functions; the board owns the download.
 */

import type { ExtractionResult, Ticket, TicketType } from "./types";

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const TYPE_HEADINGS: Record<TicketType, string> = {
  bug: "Bugs",
  feature: "Features",
  design: "Design changes",
  question: "Questions",
  "out-of-scope": "Out of scope",
};

/** Jira's CSV importer maps these column names without manual fiddling. */
const JIRA_ISSUE_TYPE: Record<TicketType, string> = {
  bug: "Bug",
  feature: "Story",
  design: "Task",
  question: "Task",
  "out-of-scope": "Task",
};

function speakerLabel(result: ExtractionResult, id: string): string {
  return result.speakers.find((s) => s.id === id)?.label ?? id;
}

function activeTickets(result: ExtractionResult): Ticket[] {
  return result.tickets.filter((t) => !t.dismissed);
}

/* ── Markdown ─────────────────────────────────────────────────────────────── */

export function ticketsToMarkdown(result: ExtractionResult, title = "Client feedback"): string {
  const lines: string[] = [`# ${title} — tickets`, ""];
  const tickets = activeTickets(result);
  for (const type of Object.keys(TYPE_HEADINGS) as TicketType[]) {
    const group = tickets.filter((t) => t.type === type);
    if (group.length === 0) continue;
    lines.push(`## ${TYPE_HEADINGS[type]}`, "");
    for (const t of group) {
      const stamps = t.occurrences.map((o) => clock(o.startSec)).join(" · ");
      lines.push(`### ${t.title}`, "");
      lines.push(`> ${t.occurrences[0]?.quote ?? ""}`);
      lines.push(`> — ${speakerLabel(result, t.speakerId)}, at ${stamps}`, "");
      const meta: string[] = [];
      if (t.priority) meta.push(`priority: ${t.priority} ("${t.prioritySignal ?? ""}")`);
      meta.push(`confidence: ${(t.confidence * 100).toFixed(0)}%`);
      if (t.occurrences.length > 1) meta.push(`mentioned ${t.occurrences.length} times`);
      lines.push(`_${meta.join(" · ")}_`, "");
    }
  }
  return lines.join("\n");
}

/* ── CSV (Jira-compatible) ────────────────────────────────────────────────── */

function csvField(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

export function ticketsToCsv(result: ExtractionResult): string {
  const rows = [["Summary", "Issue Type", "Priority", "Description"].join(",")];
  for (const t of activeTickets(result)) {
    const stamps = t.occurrences.map((o) => clock(o.startSec)).join(", ");
    const description =
      `Client said: "${t.occurrences[0]?.quote ?? ""}" ` +
      `(${speakerLabel(result, t.speakerId)}, at ${stamps}). ` +
      `Confidence ${(t.confidence * 100).toFixed(0)}%.` +
      (t.prioritySignal ? ` Urgency signal: "${t.prioritySignal}".` : "");
    rows.push(
      [
        csvField(t.title),
        csvField(JIRA_ISSUE_TYPE[t.type]),
        csvField(t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "Medium"),
        csvField(description),
      ].join(","),
    );
  }
  return rows.join("\r\n");
}

/* ── JSON ─────────────────────────────────────────────────────────────────── */

export function ticketsToJson(result: ExtractionResult): string {
  return JSON.stringify(
    { tickets: activeTickets(result), speakers: result.speakers, stats: result.stats },
    null,
    2,
  );
}

/* ── single ticket, for pasting anywhere ──────────────────────────────────── */

export function ticketToText(result: ExtractionResult, ticket: Ticket): string {
  const stamps = ticket.occurrences.map((o) => clock(o.startSec)).join(" · ");
  return [
    ticket.title,
    "",
    `> ${ticket.occurrences[0]?.quote ?? ""}`,
    `> — ${speakerLabel(result, ticket.speakerId)}, at ${stamps}`,
    "",
    [
      `type: ${ticket.type}`,
      ticket.priority ? `priority: ${ticket.priority}` : null,
      `confidence: ${(ticket.confidence * 100).toFixed(0)}%`,
    ]
      .filter(Boolean)
      .join(" · "),
  ].join("\n");
}
