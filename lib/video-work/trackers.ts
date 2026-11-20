"use client";

/**
 * Direct-to-tracker ticket export. GitHub Issues and Linear both allow
 * browser CORS, so calls go straight from this browser with the user's own
 * token - the token lives in localStorage only and never touches our
 * server. (Jira and Trello block browser calls; they would need a proxy
 * and are deliberately not offered yet - the UI says so.)
 */

import type { Finding, Project } from "./types";

export type TrackerId = "github" | "linear";

const TOKEN_KEYS: Record<TrackerId, string> = {
  github: "gigai-vw-token-github",
  linear: "gigai-vw-token-linear",
};

export function getToken(tracker: TrackerId): string {
  try {
    return localStorage.getItem(TOKEN_KEYS[tracker]) ?? "";
  } catch {
    return "";
  }
}

export function setToken(tracker: TrackerId, token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEYS[tracker], token);
    else localStorage.removeItem(TOKEN_KEYS[tracker]);
  } catch {
    /* private mode */
  }
}

export interface TicketPreview {
  findingId: string;
  title: string;
  body: string;
  labels: string[];
}

/** Deterministic ticket body: the finding, its evidence, and enrichment. */
export function buildTicketBody(finding: Finding, project: Project): string {
  const lines: string[] = [finding.description, ""];
  if (finding.observed) lines.push(`**Observed:** ${finding.observed}`);
  if (finding.expected) lines.push(`**Expected:** ${finding.expected}`);
  if (finding.stepsToReproduce.length) {
    lines.push("", "**Steps to reproduce:**", ...finding.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`));
  }
  if (finding.acceptanceCriteria.length) {
    lines.push("", "**Acceptance criteria:**", ...finding.acceptanceCriteria.map((c) => `- [ ] ${c}`));
  }
  const at = Math.round(finding.evidence.timestampMs / 1000);
  lines.push(
    "",
    `> "${finding.evidence.clientStatement}"`,
    `> - client recording, ${Math.floor(at / 60)}:${String(at % 60).padStart(2, "0")}`,
  );
  const ref = (finding as Finding & { relatedSpecRefs?: { file: string; where: string }[] }).relatedSpecRefs;
  if (ref?.length) {
    lines.push("", `**Spec:** ${ref.map((r) => `${r.file} (${r.where})`).join(", ")}`);
  }
  lines.push("", `_Extracted by GigAI Video -> Work from ${project.name ?? "a client recording"}._`);
  return lines.join("\n");
}

export function previewTickets(findings: Finding[], project: Project): TicketPreview[] {
  return findings.map((f) => ({
    findingId: f.id,
    title: `[${f.id}] ${f.title}`,
    body: buildTicketBody(f, project),
    labels: [f.type, `priority:${f.priority}`].filter(Boolean).map(String),
  }));
}

export interface ExportResult {
  findingId: string;
  ok: boolean;
  url?: string;
  error?: string;
}

/* -------------------------------- GitHub -------------------------------- */

export async function githubCreateIssues(
  repo: string, // "owner/name"
  tickets: TicketPreview[],
  onEach?: (r: ExportResult) => void,
): Promise<ExportResult[]> {
  const token = getToken("github");
  const results: ExportResult[] = [];
  for (const t of tickets) {
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/vnd.github+json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: t.title, body: t.body, labels: t.labels }),
      });
      const d = await r.json();
      const res: ExportResult = r.ok
        ? { findingId: t.findingId, ok: true, url: d.html_url }
        : { findingId: t.findingId, ok: false, error: d.message ?? `HTTP ${r.status}` };
      results.push(res);
      onEach?.(res);
    } catch (err) {
      const res = { findingId: t.findingId, ok: false, error: err instanceof Error ? err.message : "failed" };
      results.push(res);
      onEach?.(res);
    }
  }
  return results;
}

/* -------------------------------- Linear -------------------------------- */

async function linearGql(query: string, variables: Record<string, unknown>) {
  const r = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { authorization: getToken("linear"), "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const d = await r.json();
  if (d.errors?.length) throw new Error(d.errors[0].message);
  return d.data;
}

export async function linearTeams(): Promise<{ id: string; name: string }[]> {
  const d = await linearGql(`query { teams { nodes { id name } } }`, {});
  return d.teams.nodes;
}

export async function linearCreateIssues(
  teamId: string,
  tickets: TicketPreview[],
  onEach?: (r: ExportResult) => void,
): Promise<ExportResult[]> {
  const results: ExportResult[] = [];
  for (const t of tickets) {
    try {
      const d = await linearGql(
        `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { url } } }`,
        { input: { teamId, title: t.title, description: t.body } },
      );
      const res: ExportResult = d.issueCreate.success
        ? { findingId: t.findingId, ok: true, url: d.issueCreate.issue.url }
        : { findingId: t.findingId, ok: false, error: "Linear refused the issue" };
      results.push(res);
      onEach?.(res);
    } catch (err) {
      const res = { findingId: t.findingId, ok: false, error: err instanceof Error ? err.message : "failed" };
      results.push(res);
      onEach?.(res);
    }
  }
  return results;
}

/* ---------------------------- client summary ---------------------------- */

/** Deterministic client-facing email draft - no model involved. */
export function clientEmailDraft(project: Project, findings: Finding[]): string {
  const bugs = findings.filter((f) => f.type === "BUG");
  const rest = findings.filter((f) => f.type !== "BUG");
  const open = findings.filter((f) => f.needsConfirmation);
  const line = (f: Finding) => {
    const at = Math.round(f.evidence.timestampMs / 1000);
    return `- ${f.title} (at ${Math.floor(at / 60)}:${String(at % 60).padStart(2, "0")})`;
  };
  return [
    `Subject: What we captured from your recording`,
    "",
    "Hi,",
    "",
    "Thanks for the walkthrough. Here is everything we captured, with timestamps into your recording:",
    "",
    ...(bugs.length ? ["Issues to fix:", ...bugs.map(line), ""] : []),
    ...(rest.length ? ["Changes and requests:", ...rest.map(line), ""] : []),
    ...(open.length
      ? ["Open questions - a quick confirmation on these would help:", ...open.map((f) => `- ${f.title}`), ""]
      : []),
    "We'll start on the confirmed items right away. Anything missing or misread, tell us and we'll adjust.",
    "",
    "Best,",
  ].join("\n");
}
