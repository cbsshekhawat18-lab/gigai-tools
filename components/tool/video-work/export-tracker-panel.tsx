"use client";

/**
 * Ticket export to GitHub Issues and Linear (browser-direct, CORS-open),
 * plus the deterministic client email draft, plus on-device enrichment
 * against the context files. Tokens live in localStorage with a Forget
 * button; a dry-run preview always comes before creation.
 */

import * as React from "react";

import type { Enrichment } from "@/lib/video-work/enrich";
import { enrichAll } from "@/lib/video-work/enrich";
import type { Finding, Project } from "@/lib/video-work/types";
import {
  clientEmailDraft, getToken, githubCreateIssues, linearCreateIssues,
  linearTeams, previewTickets, setToken, type ExportResult, type TrackerId,
} from "@/lib/video-work/trackers";

export function ExportTrackerPanel({ project, findings }: { project: Project; findings: Finding[] }) {
  const [tracker, setTracker] = React.useState<TrackerId>("github");
  const [token, setTokenState] = React.useState("");
  const [repo, setRepo] = React.useState("");
  const [teams, setTeams] = React.useState<{ id: string; name: string }[]>([]);
  const [teamId, setTeamId] = React.useState("");
  const [preview, setPreview] = React.useState(false);
  const [results, setResults] = React.useState<ExportResult[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enrichment, setEnrichment] = React.useState<Record<string, Enrichment>>({});
  const [enriching, setEnriching] = React.useState<string | null>(null);
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => setTokenState(getToken(tracker)), [tracker]);

  const enriched = findings.map((f) => {
    const e = enrichment[f.id];
    return e ? Object.assign({}, f, e) : f;
  });
  const exportable = enriched.filter((f) => !(enrichment[f.id]?.duplicateOf));
  const tickets = previewTickets(exportable, project);

  const runEnrich = async () => {
    setEnriching("Matching against your documents...");
    try {
      setEnrichment(await enrichAll(findings, (done, total) => setEnriching(`Matching ${done}/${total}...`)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrichment failed.");
    }
    setEnriching(null);
  };

  const connect = async () => {
    setError(null);
    setToken(tracker, token);
    if (tracker === "linear") {
      try {
        const t = await linearTeams();
        setTeams(t);
        setTeamId(t[0]?.id ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Linear rejected the token.");
      }
    }
  };

  const create = async () => {
    setBusy(true);
    setResults([]);
    setError(null);
    try {
      const each = (r: ExportResult) => setResults((prev) => [...prev, r]);
      if (tracker === "github") await githubCreateIssues(repo.trim(), tickets, each);
      else await linearCreateIssues(teamId, tickets, each);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    }
    setBusy(false);
  };

  const dupCount = Object.values(enrichment).filter((e) => e.duplicateOf).length;

  return (
    <div className="rounded border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Send tickets to your tracker</h3>
      <p className="mt-1 max-w-[70ch] text-xs text-muted-foreground">
        GitHub Issues and Linear, called straight from this browser with your token -
        it stays in this browser and never touches our server. Jira and Trello block
        browser calls and are not offered yet.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <button type="button" onClick={() => void runEnrich()} disabled={!!enriching}
          className="rounded border border-border px-3 py-1.5 text-sm text-foreground hover:border-foreground/40 disabled:opacity-50">
          {enriching ?? "Match against project docs"}
        </button>
        {dupCount ? (
          <span className="text-xs text-amber-700">
            {dupCount} likely duplicate{dupCount > 1 ? "s" : ""} of existing tickets - excluded from export
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm text-foreground">
          Tracker
          <select value={tracker} onChange={(e) => setTracker(e.target.value as TrackerId)}
            className="mt-1 block h-10 rounded border border-border bg-background px-2 text-sm">
            <option value="github">GitHub Issues</option>
            <option value="linear">Linear</option>
          </select>
        </label>
        <label className="grow text-sm text-foreground">
          {tracker === "github" ? "Personal access token (repo scope)" : "Linear API key"}
          <input type="password" value={token} onChange={(e) => setTokenState(e.target.value)}
            className="mt-1 block h-10 w-full max-w-xs rounded border border-border bg-background px-3 font-mono text-sm" />
        </label>
        {tracker === "github" ? (
          <label className="text-sm text-foreground">
            Repository
            <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="owner/name"
              className="mt-1 block h-10 w-44 rounded border border-border bg-background px-3 font-mono text-sm" />
          </label>
        ) : teams.length ? (
          <label className="text-sm text-foreground">
            Team
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)}
              className="mt-1 block h-10 rounded border border-border bg-background px-2 text-sm">
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <button type="button" onClick={() => void connect()}
          className="h-10 rounded border border-border px-3 text-sm text-foreground hover:border-foreground/40">
          {tracker === "linear" ? "Connect" : "Save token"}
        </button>
        {getToken(tracker) ? (
          <button type="button" onClick={() => { setToken(tracker, null); setTokenState(""); setTeams([]); }}
            className="h-10 px-2 text-xs text-muted-foreground hover:text-foreground">
            Forget token
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPreview((v) => !v)}
          className="rounded border border-border px-3 py-1.5 text-sm text-foreground hover:border-foreground/40">
          {preview ? "Hide preview" : `Preview ${tickets.length} tickets (dry run)`}
        </button>
        <button type="button" onClick={() => void create()}
          disabled={busy || !tickets.length || !getToken(tracker) || (tracker === "github" ? !/^[^/\s]+\/[^/\s]+$/.test(repo.trim()) : !teamId)}
          className="rounded bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Creating..." : `Create ${tickets.length} tickets`}
        </button>
        <button type="button" onClick={() => setEmailOpen((v) => !v)}
          className="rounded border border-border px-3 py-1.5 text-sm text-foreground hover:border-foreground/40">
          Client email draft
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      {preview ? (
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded border border-border p-3">
          {tickets.map((t) => (
            <details key={t.findingId}>
              <summary className="cursor-pointer text-sm text-foreground">{t.title}</summary>
              <pre className="mt-1 whitespace-pre-wrap rounded bg-muted/40 p-2 font-mono text-xs text-muted-foreground">{t.body}</pre>
            </details>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <ul className="mt-3 space-y-1 text-xs">
          {results.map((r) => (
            <li key={r.findingId}>
              {r.ok ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {r.findingId} created ↗
                </a>
              ) : (
                <span className="text-red-600">{r.findingId} failed: {r.error}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {emailOpen ? (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email draft</p>
            <span className="flex gap-2">
              <button type="button"
                onClick={() => void navigator.clipboard.writeText(clientEmailDraft(project, enriched)).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })}
                className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
                {copied ? "Copied" : "Copy"}
              </button>
              <a className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                href={`mailto:?subject=${encodeURIComponent("What we captured from your recording")}&body=${encodeURIComponent(clientEmailDraft(project, enriched).split("\n").slice(2).join("\n"))}`}>
                Open in mail
              </a>
            </span>
          </div>
          <pre className="mt-1 max-h-72 overflow-y-auto whitespace-pre-wrap rounded bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
            {clientEmailDraft(project, enriched)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
