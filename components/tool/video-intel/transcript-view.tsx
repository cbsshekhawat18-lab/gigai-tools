"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatClock } from "@/lib/video-intel/types";
import type { Segment, Speaker } from "@/lib/video-intel/types";

/** Accent classes cycled per speaker so each voice reads distinctly. */
const SPEAKER_COLORS = [
  "text-sky-600 dark:text-sky-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-teal-600 dark:text-teal-400",
  "text-amber-600 dark:text-amber-400",
  "text-rose-600 dark:text-rose-400",
  "text-teal-600 dark:text-teal-400",
] as const;

export function speakerColor(index: number): string {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]!;
}

interface TranscriptViewProps {
  segments: Segment[];
  speakerById: Map<string, Speaker>;
  speakers: Speaker[];
  /** Current playhead in ms, drives the active-line highlight. */
  currentMs: number;
  query: string;
  onSeek: (ms: number) => void;
  onEdit: (id: string, text: string) => void;
  onAssignSpeaker: (id: string, speakerId: string) => void;
  className?: string;
}

/**
 * The transcript pane: click a line to seek, double-click to edit in place.
 *
 * WINDOWED ON PURPOSE. A three-hour recording is tens of thousands of segments,
 * and mounting them all makes both the initial paint and every keystroke crawl.
 * We render only the slice around the scroll position plus a generous overscan,
 * and hold the scrollbar honest with spacer rows above and below: the same
 * trick a virtual-list library uses, without the dependency.
 */
export function TranscriptView({
  segments,
  speakerById,
  speakers,
  currentMs,
  query,
  onSeek,
  onEdit,
  onAssignSpeaker,
  className,
}: TranscriptViewProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(600);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  /** Estimated row height; only needs to be close, not exact. */
  const ROW = 76;
  const OVERSCAN = 8;

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return segments;
    return segments.filter((segment) => segment.text.toLowerCase().includes(needle));
  }, [segments, query]);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    observer.observe(el);
    setViewportHeight(el.clientHeight);
    return () => observer.disconnect();
  }, []);

  const first = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ROW) + OVERSCAN * 2;
  const last = Math.min(filtered.length, first + visibleCount);
  const slice = filtered.slice(first, last);

  const activeId = React.useMemo(() => {
    // Last segment that has started. A linear scan is fine at this size and
    // avoids keeping a parallel index in sync with edits.
    let id: string | null = null;
    for (const segment of segments) {
      if (segment.start <= currentMs) id = segment.id;
      else break;
    }
    return id;
  }, [segments, currentMs]);

  if (segments.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center p-8 text-center", className)}>
        <p className="max-w-sm text-sm text-muted-foreground">
          No transcript yet. Transcribe the audio, or import an existing SRT, VTT or text file.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      className={cn("h-full overflow-y-auto", className)}
      role="list"
      aria-label="Transcript"
    >
      {query && filtered.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">
          Nothing matches “{query}”.
        </p>
      ) : null}

      {/* Spacer keeps the scrollbar proportional to the full list. */}
      <div style={{ height: first * ROW }} aria-hidden />

      {slice.map((segment) => {
        const speaker = segment.speakerId ? speakerById.get(segment.speakerId) : undefined;
        const active = segment.id === activeId;
        return (
          <div
            key={segment.id}
            role="listitem"
            className={cn(
              "group/seg grid grid-cols-[4.5rem_1fr] gap-x-3 border-l-2 px-3 py-2 transition-colors",
              active
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-accent/50",
            )}
          >
            <button
              type="button"
              onClick={() => onSeek(segment.start)}
              className="self-start rounded px-1 py-0.5 text-left font-mono text-xs tabular-nums text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Jump to ${formatClock(segment.start)}`}
            >
              {formatClock(segment.start)}
            </button>

            <div className="min-w-0">
              {speaker ? (
                <span
                  className={cn("mb-0.5 block text-xs font-semibold", speakerColor(speaker.colorIndex))}
                >
                  {speaker.label}
                </span>
              ) : null}

              {editingId === segment.id ? (
                <textarea
                  autoFocus
                  defaultValue={segment.text}
                  onBlur={(event) => {
                    onEdit(segment.id, event.target.value);
                    setEditingId(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setEditingId(null);
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      onEdit(segment.id, event.currentTarget.value);
                      setEditingId(null);
                    }
                  }}
                  rows={Math.max(2, Math.ceil(segment.text.length / 70))}
                  className="w-full resize-y rounded-lg border border-border bg-background p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Edit transcript line"
                />
              ) : (
                <p
                  className="cursor-text text-sm leading-relaxed text-foreground"
                  onDoubleClick={() => setEditingId(segment.id)}
                  title="Double-click to edit"
                >
                  <Highlight text={segment.text} query={query} />
                </p>
              )}

              <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/seg:opacity-100">
                <label className="sr-only" htmlFor={`sp-${segment.id}`}>
                  Speaker for this line
                </label>
                <select
                  id={`sp-${segment.id}`}
                  value={segment.speakerId ?? ""}
                  onChange={(event) => onAssignSpeaker(segment.id, event.target.value)}
                  className="rounded border border-border bg-card px-1.5 py-0.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No speaker</option>
                  {speakers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setEditingId(segment.id)}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="Pencil" size={12} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ height: Math.max(0, (filtered.length - last) * ROW) }} aria-hidden />
    </div>
  );
}

/** Wrap query matches in <mark> without using dangerouslySetInnerHTML. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  const lower = text.toLowerCase();
  const target = needle.toLowerCase();
  let index = 0;
  let key = 0;

  for (;;) {
    const found = lower.indexOf(target, index);
    if (found === -1) break;
    if (found > index) parts.push(text.slice(index, found));
    parts.push(
      <mark key={key++} className="rounded bg-amber-200 px-0.5 text-foreground dark:bg-amber-500/40">
        {text.slice(found, found + needle.length)}
      </mark>,
    );
    index = found + needle.length;
  }
  parts.push(text.slice(index));
  return <>{parts}</>;
}
