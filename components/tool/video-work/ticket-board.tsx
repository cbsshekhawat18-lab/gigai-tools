"use client";

/**
 * Verbatim ticket board (spec §9). The quote IS the card: a developer reads
 * the client's words first, our title second. Needs-review renders ABOVE
 * confirmed - uncertainty is surfaced, never buried. Every timestamp chip
 * seeks the already-loaded local video; nothing reloads, nothing hits the
 * network. Dismiss collapses, never deletes. `?debug=1` shows the pipeline's
 * dropped candidates and stats.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import type {
  ExtractionResult,
  Speaker,
  SpeakerRole,
  Ticket,
} from "@/lib/video-to-work/types";
import { NEEDS_REVIEW_BELOW } from "@/lib/video-to-work/confidence";
import {
  ticketsToCsv,
  ticketsToJson,
  ticketsToMarkdown,
  ticketToText,
} from "@/lib/video-to-work/exports";

/* ── speaker tagging (stage 1, interactive) ───────────────────────────────── */

const ROLE_LABELS: Record<SpeakerRole, string> = {
  client: "Client",
  internal: "Internal",
  unknown: "Not sure",
};

export function SpeakerTagging({
  speakers,
  onChange,
  onConfirm,
  busy,
}: {
  speakers: Speaker[];
  onChange: (next: Speaker[]) => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const single = speakers.length <= 1;
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Who is who in this recording?</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Only the client&apos;s requests become tickets - an account manager saying
          &ldquo;yeah, we can do that&rdquo; is confirmation, not work.{" "}
          {single
            ? "This transcript has no speaker labels, so everything is treated as one unlabelled voice and every ticket lands in Needs Review for you to confirm."
            : "The pre-selected roles are a guess from request-language density. Correct them if they're wrong."}
        </p>
      </div>
      {speakers.map((sp) => (
        <div key={sp.id} className="rounded-lg border border-border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">
              {sp.label}
              <span className="ml-2 font-normal tabular-nums text-muted-foreground">
                {Math.round(sp.talkTimeSec / 60)} min talking
              </span>
            </span>
            <div className="flex gap-1.5">
              {(Object.keys(ROLE_LABELS) as SpeakerRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  aria-pressed={sp.role === role}
                  onClick={() =>
                    onChange(speakers.map((s) => (s.id === sp.id ? { ...s, role } : s)))
                  }
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    sp.role === role
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
          {sp.sampleQuotes.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {sp.sampleQuotes.map((q, i) => (
                <li key={i} className="truncate text-xs italic text-muted-foreground">
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      <Button onClick={onConfirm} disabled={busy} className="self-start">
        <Icon name={busy ? "LoaderCircle" : "Sparkles"} size={15} className={busy ? "animate-spin" : ""} />
        {busy ? "Extracting…" : "Extract verbatim tickets"}
      </Button>
    </div>
  );
}

/* ── one ticket card ──────────────────────────────────────────────────────── */

function formatClock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const TYPE_STYLES: Record<Ticket["type"], string> = {
  bug: "bg-red-500/10 text-red-600 dark:text-red-400",
  feature: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  design: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  question: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "out-of-scope": "bg-muted text-muted-foreground",
};

function TicketCard({
  ticket,
  speakerLabel,
  onSeek,
  onDismiss,
  copyText,
}: {
  ticket: Ticket;
  speakerLabel: string;
  onSeek: (sec: number) => void;
  onDismiss: (id: string, dismissed: boolean) => void;
  copyText: string;
}) {
  const first = ticket.occurrences[0];
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    void navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            TYPE_STYLES[ticket.type],
          )}
        >
          {ticket.type}
        </span>
        {ticket.priority ? (
          <span
            className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
            title={ticket.prioritySignal ? `Client's words: "${ticket.prioritySignal}"` : undefined}
          >
            {ticket.priority}
          </span>
        ) : null}
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
          confidence {(ticket.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <h4 className="mt-2 text-sm font-semibold text-foreground">{ticket.title}</h4>

      {/* The verbatim quote is the primary content - never a paraphrase. */}
      <blockquote className="mt-2 border-l-2 border-primary/50 pl-3 text-sm leading-relaxed text-foreground">
        &ldquo;{first?.quote}&rdquo;
        <footer className="mt-1 text-xs not-italic text-muted-foreground">— {speakerLabel}</footer>
      </blockquote>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {ticket.occurrences.map((occ, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSeek(Math.max(0, occ.startSec - 1.5))}
            title={`Hear the client say it at ${formatClock(occ.startSec)}`}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium tabular-nums text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="Play" size={11} />
            {formatClock(occ.startSec)}
          </button>
        ))}
        {ticket.occurrences.length > 1 ? (
          <span className="text-[11px] text-muted-foreground">
            mentioned {ticket.occurrences.length} times
          </span>
        ) : null}
        <button
          type="button"
          onClick={onCopy}
          className="ml-auto inline-flex min-h-11 items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <Icon name="Copy" size={12} />
          {copied ? "Copied" : "Copy ticket"}
        </button>
        <button
          type="button"
          onClick={() => onDismiss(ticket.id, !ticket.dismissed)}
          className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {ticket.dismissed ? "Restore" : "Dismiss"}
        </button>
      </div>
    </article>
  );
}

/* ── the board ────────────────────────────────────────────────────────────── */

export function TicketBoard({
  result,
  onSeek,
  onDismiss,
  debug,
}: {
  result: ExtractionResult;
  onSeek: (sec: number) => void;
  onDismiss: (id: string, dismissed: boolean) => void;
  debug: boolean;
}) {
  const speakerLabel = React.useCallback(
    (id: string) => result.speakers.find((s) => s.id === id)?.label ?? id,
    [result.speakers],
  );
  const active = result.tickets.filter((t) => !t.dismissed);
  const review = active.filter((t) => t.needsReview);
  const confirmed = active.filter((t) => !t.needsReview);
  const dismissed = result.tickets.filter((t) => t.dismissed);

  const downloadExportFile = (name: string, text: string, type: string) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {active.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Export all:</span>
          <button
            type="button"
            onClick={() =>
              downloadExportFile("tickets.md", ticketsToMarkdown(result), "text/markdown")
            }
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Icon name="FileText" size={13} /> Markdown
          </button>
          <button
            type="button"
            onClick={() =>
              downloadExportFile("tickets-jira.csv", ticketsToCsv(result), "text/csv")
            }
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Icon name="Table" size={13} /> CSV for Jira
          </button>
          <button
            type="button"
            onClick={() =>
              downloadExportFile("tickets.json", ticketsToJson(result), "application/json")
            }
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Icon name="Braces" size={13} /> JSON
          </button>
        </div>
      ) : null}
      {review.length > 0 ? (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon name="TriangleAlert" size={15} className="text-amber-500" />
            Needs your review ({review.length})
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            These scored under {Math.round(NEEDS_REVIEW_BELOW * 100)}% confidence - the quote
            matched loosely, the speaker is untagged, or the model itself was unsure. Play the
            timestamp and keep or dismiss each one.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {review.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                speakerLabel={speakerLabel(t.speakerId)}
                onSeek={onSeek}
                onDismiss={onDismiss}
                copyText={ticketToText(result, t)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="CircleCheck" size={15} className="text-emerald-500" />
          Confirmed ({confirmed.length})
        </h3>
        {confirmed.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Nothing above the review threshold yet.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {confirmed.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                speakerLabel={speakerLabel(t.speakerId)}
                onSeek={onSeek}
                onDismiss={onDismiss}
                copyText={ticketToText(result, t)}
              />
            ))}
          </div>
        )}
      </section>

      {dismissed.length > 0 ? (
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
            Dismissed ({dismissed.length})
          </summary>
          <div className="mt-3 flex flex-col gap-3 opacity-70">
            {dismissed.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                speakerLabel={speakerLabel(t.speakerId)}
                onSeek={onSeek}
                onDismiss={onDismiss}
                copyText={ticketToText(result, t)}
              />
            ))}
          </div>
        </details>
      ) : null}

      {debug ? (
        <section className="rounded-lg border border-dashed border-border p-3 text-xs">
          <h3 className="font-semibold text-foreground">Debug</h3>
          <pre className="mt-2 overflow-x-auto text-muted-foreground">
            {JSON.stringify(result.stats, null, 2)}
          </pre>
          {result.droppedCandidates.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {result.droppedCandidates.map((d, i) => (
                <li key={i} className="text-muted-foreground">
                  <span className="font-medium text-foreground">[{d.reason}]</span> {d.title}
                  {" — "}
                  <span className="italic">&ldquo;{d.claimedQuote.slice(0, 120)}&rdquo;</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted-foreground">Nothing was dropped.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
