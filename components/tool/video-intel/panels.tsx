"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatClock } from "@/lib/video-intel/types";
import type {
  Analytics,
  Bookmark,
  Chapter,
  EntityHit,
  EntityType,
  GraphEdge,
  Keyword,
  Speaker,
} from "@/lib/video-intel/types";
import { speakerColor } from "./transcript-view";

/* ── shared shells ───────────────────────────────────────────────────────── */

export function PanelSection({
  title,
  icon,
  hint,
  children,
}: {
  title: string;
  icon: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon name={icon} size={15} className="text-muted-foreground" />
        {title}
      </h3>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-xs text-muted-foreground">{children}</p>;
}

/** Timestamp pill, the one clickable-time control, reused everywhere. */
export function TimePill({ ms, onSeek }: { ms: number; onSeek: (ms: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSeek(ms)}
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Jump to ${formatClock(ms)}`}
    >
      {formatClock(ms)}
    </button>
  );
}

/* ── chapters ────────────────────────────────────────────────────────────── */

export function ChaptersPanel({
  chapters,
  currentMs,
  onSeek,
}: {
  chapters: Chapter[];
  currentMs: number;
  onSeek: (ms: number) => void;
}) {
  return (
    <PanelSection
      title={`Sections (${chapters.length})`}
      icon="List"
      hint="Detected from long pauses and speaker changes: structural, not a model reading the content."
    >
      {chapters.length === 0 ? (
        <Empty>Sections appear once there&apos;s a transcript.</Empty>
      ) : (
        <ul className="flex flex-col gap-1">
          {chapters.map((chapter) => {
            const active = currentMs >= chapter.start && currentMs < chapter.end;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => onSeek(chapter.start)}
                  className={cn(
                    "w-full rounded-lg border p-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-foreground">
                      {chapter.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatClock(chapter.start)}
                    </span>
                  </span>
                  {chapter.keywords.length > 0 ? (
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {chapter.keywords.slice(0, 4).join(" · ")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PanelSection>
  );
}

/* ── speakers ────────────────────────────────────────────────────────────── */

export function SpeakersPanel({
  speakers,
  analytics,
  onAdd,
  onRename,
  onMerge,
}: {
  speakers: Speaker[];
  analytics: Analytics;
  onAdd: (label: string) => void;
  onRename: (id: string, label: string) => void;
  onMerge: (fromId: string, intoId: string) => void;
}) {
  const statsById = new Map(analytics.speakers.map((s) => [s.speakerId, s]));

  return (
    <PanelSection
      title={`Speakers (${speakers.length})`}
      icon="Users"
      hint="Whisper doesn't identify who is talking, so speakers are yours to name and assign. We don't invent labels the model has no basis for."
    >
      <ul className="flex flex-col gap-2">
        {speakers.map((speaker) => {
          const stats = statsById.get(speaker.id);
          return (
            <li key={speaker.id} className="rounded-lg border border-border bg-card p-2">
              <div className="flex items-center gap-2">
                <span className={cn("size-2.5 shrink-0 rounded-full bg-current", speakerColor(speaker.colorIndex))} />
                <label className="sr-only" htmlFor={`spk-${speaker.id}`}>
                  Speaker name
                </label>
                <input
                  id={`spk-${speaker.id}`}
                  defaultValue={speaker.label}
                  onBlur={(event) => onRename(speaker.id, event.target.value.trim() || speaker.label)}
                  className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-medium text-foreground outline-none hover:border-border focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {stats ? (
                <p className="mt-1 pl-4 text-[11px] tabular-nums text-muted-foreground">
                  {formatClock(stats.speakingMs)} · {Math.round(stats.share * 100)}% ·{" "}
                  {stats.words.toLocaleString()} words · {stats.wordsPerMinute} wpm
                </p>
              ) : (
                <p className="mt-1 pl-4 text-[11px] text-muted-foreground">No lines assigned yet.</p>
              )}
              {speakers.length > 1 ? (
                <div className="mt-1.5 pl-4">
                  <label className="sr-only" htmlFor={`merge-${speaker.id}`}>
                    Merge this speaker into another
                  </label>
                  <select
                    id={`merge-${speaker.id}`}
                    value=""
                    onChange={(event) => {
                      if (event.target.value) onMerge(speaker.id, event.target.value);
                    }}
                    className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Merge into…</option>
                    {speakers
                      .filter((s) => s.id !== speaker.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => onAdd(`Speaker ${speakers.length + 1}`)}
        className="mt-1 inline-flex items-center gap-1.5 self-start rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name="Plus" size={13} />
        Add speaker
      </button>
    </PanelSection>
  );
}

/* ── keywords ────────────────────────────────────────────────────────────── */

export function KeywordsPanel({
  keywords,
  onSeek,
}: {
  keywords: Keyword[];
  onSeek: (ms: number) => void;
}) {
  const max = keywords[0]?.score ?? 1;
  return (
    <PanelSection
      title="Keywords"
      icon="Tags"
      hint="Ranked by TF-IDF: terms concentrated in part of the recording outrank ones sprinkled evenly throughout."
    >
      {keywords.length === 0 ? (
        <Empty>Keywords appear once there&apos;s a transcript.</Empty>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {keywords.slice(0, 30).map((keyword) => {
            const weight = 0.75 + (keyword.score / max) * 0.5;
            return (
              <li key={keyword.term}>
                <button
                  type="button"
                  onClick={() => keyword.times[0] !== undefined && onSeek(keyword.times[0])}
                  title={`${keyword.count} mentions, jump to the first`}
                  style={{ fontSize: `${weight}rem` }}
                  className="rounded-full border border-border bg-card px-2 py-0.5 leading-tight text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {keyword.term}
                  <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
                    {keyword.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PanelSection>
  );
}

/* ── entities ────────────────────────────────────────────────────────────── */

const ENTITY_LABEL: Record<EntityType, string> = {
  email: "Emails",
  url: "Links",
  phone: "Phone numbers",
  date: "Dates",
  time: "Times",
  money: "Amounts",
  percent: "Percentages",
  number: "Figures",
  hashtag: "Hashtags",
  mention: "Mentions",
  acronym: "Acronyms",
};

export function EntitiesPanel({
  entities,
  onSeek,
}: {
  entities: EntityHit[];
  onSeek: (ms: number) => void;
}) {
  const grouped = React.useMemo(() => {
    const map = new Map<EntityType, EntityHit[]>();
    for (const hit of entities) {
      const list = map.get(hit.type);
      if (list) list.push(hit);
      else map.set(hit.type, [hit]);
    }
    return [...map.entries()];
  }, [entities]);

  return (
    <PanelSection
      title="Detected details"
      icon="ScanSearch"
      hint="Found by exact pattern: emails, links, amounts, dates. People and company names are absent on purpose: that needs a language model we don't run here, and guessing would be wrong more often than right."
    >
      {grouped.length === 0 ? (
        <Empty>Nothing detected yet.</Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map(([type, hits]) => (
            <div key={type}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {ENTITY_LABEL[type]}
              </p>
              <ul className="flex flex-col gap-1">
                {hits.slice(0, 8).map((hit) => (
                  <li key={`${hit.type}:${hit.value}`} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground" title={hit.value}>
                      {hit.value}
                    </span>
                    {hit.times[0] !== undefined ? <TimePill ms={hit.times[0]} onSeek={onSeek} /> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </PanelSection>
  );
}

/* ── relationship graph ──────────────────────────────────────────────────── */

export function GraphPanel({ edges }: { edges: GraphEdge[] }) {
  return (
    <PanelSection
      title="Term relationships"
      icon="Network"
      hint="Terms that get discussed together, weighted by how often they share a line. Co-occurrence, not semantic understanding."
    >
      {edges.length === 0 ? (
        <Empty>Needs a longer transcript before relationships emerge.</Empty>
      ) : (
        <ul className="flex flex-col gap-1">
          {edges.slice(0, 14).map((edge) => (
            <li
              key={`${edge.source}-${edge.target}`}
              className="flex items-center gap-2 text-xs text-foreground"
            >
              <span className="truncate">{edge.source}</span>
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="truncate">{edge.target}</span>
              <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">
                ×{edge.weight}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}

/* ── analytics ───────────────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
  return (
    <PanelSection
      title="Analytics"
      icon="ChartColumn"
      hint="Every figure here is measured from the transcript and media: nothing is estimated by a model."
    >
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Duration" value={formatClock(analytics.durationMs)} />
        <Stat label="Words" value={analytics.words.toLocaleString()} />
        <Stat label="Characters" value={analytics.characters.toLocaleString()} />
        <Stat label="Reading time" value={`${analytics.readingMinutes} min`} />
        <Stat label="Speaking pace" value={`${analytics.wordsPerMinute} wpm`} />
        <Stat label="Silence" value={`${Math.round(analytics.silenceRatio * 100)}%`} />
      </div>

      {analytics.speakers.length > 1 ? (
        <div className="mt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Share of talk time
          </p>
          <div className="flex h-2.5 overflow-hidden rounded-full border border-border">
            {analytics.speakers.map((stats, i) => (
              <span
                key={stats.speakerId}
                className={cn("bg-current", speakerColor(i))}
                style={{ width: `${stats.share * 100}%` }}
                title={`${Math.round(stats.share * 100)}%`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {analytics.meanConfidence !== null ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Mean model confidence {Math.round(analytics.meanConfidence * 100)}%
        </p>
      ) : null}
    </PanelSection>
  );
}

/* ── bookmarks ───────────────────────────────────────────────────────────── */

export function BookmarksPanel({
  bookmarks,
  onSeek,
  onRemove,
}: {
  bookmarks: Bookmark[];
  onSeek: (ms: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <PanelSection title={`Bookmarks (${bookmarks.length})`} icon="Bookmark" hint="Press B while the player has focus.">
      {bookmarks.length === 0 ? (
        <Empty>No bookmarks yet.</Empty>
      ) : (
        <ul className="flex flex-col gap-1">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="flex items-center gap-2">
              <TimePill ms={bookmark.time} onSeek={onSeek} />
              <span className="min-w-0 flex-1 truncate text-xs text-foreground">{bookmark.label}</span>
              <button
                type="button"
                onClick={() => onRemove(bookmark.id)}
                aria-label={`Remove bookmark at ${formatClock(bookmark.time)}`}
                className="rounded p-1 text-muted-foreground outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="Trash2" size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}
