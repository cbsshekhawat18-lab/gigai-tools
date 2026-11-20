"use client";

import * as React from "react";

import {
  computeAnalytics,
  extractEntities,
  extractKeywords,
  buildGraph,
} from "@/lib/video-intel/analyze";
import { detectChapters } from "@/lib/video-intel/chapters";
import { emptyTranscript, cuesToSegments } from "@/lib/video-intel/types";
import type {
  Bookmark,
  Segment,
  Speaker,
  Transcript,
  TranscriptSource,
} from "@/lib/video-intel/types";
import { parseSubtitles } from "@/lib/subtitles";

/**
 * Owns the whole Video Intelligence document and everything derived from it.
 *
 * Two rules keep this predictable:
 *   1. `transcript` is the single source of truth. Chapters, keywords, entities,
 *      analytics and the graph are all DERIVED with useMemo — never stored — so
 *      they can't drift out of sync with an edited segment.
 *   2. Undo/redo snapshots the document, not individual actions, so every
 *      mutation gets history for free without each one implementing it.
 */

/** Media currently loaded into the workspace. */
export interface MediaState {
  file: File;
  url: string;
  kind: "video" | "audio";
}

const HISTORY_LIMIT = 50;

export function useVideoIntel() {
  const [transcript, setTranscriptRaw] = React.useState<Transcript>(() => emptyTranscript());
  const [media, setMedia] = React.useState<MediaState | null>(null);
  const [past, setPast] = React.useState<Transcript[]>([]);
  const [future, setFuture] = React.useState<Transcript[]>([]);

  /** Commit a change and push the previous document onto the undo stack. */
  const commit = React.useCallback(
    (next: Transcript | ((current: Transcript) => Transcript)) => {
      setTranscriptRaw((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        if (resolved === current) return current;
        setPast((stack) => [...stack.slice(-(HISTORY_LIMIT - 1)), current]);
        setFuture([]);
        return resolved;
      });
    },
    [],
  );

  const undo = React.useCallback(() => {
    setPast((stack) => {
      const previous = stack[stack.length - 1];
      if (!previous) return stack;
      setTranscriptRaw((current) => {
        setFuture((f) => [current, ...f].slice(0, HISTORY_LIMIT));
        return previous;
      });
      return stack.slice(0, -1);
    });
  }, []);

  const redo = React.useCallback(() => {
    setFuture((stack) => {
      const next = stack[0];
      if (!next) return stack;
      setTranscriptRaw((current) => {
        setPast((p) => [...p, current].slice(-HISTORY_LIMIT));
        return next;
      });
      return stack.slice(1);
    });
  }, []);

  /* ── media ─────────────────────────────────────────────────────────────── */

  const loadMedia = React.useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const kind: MediaState["kind"] = file.type.startsWith("audio/") ? "audio" : "video";
    setMedia((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return { file, url, kind };
    });
    setTranscriptRaw((current) => ({ ...current, mediaName: file.name }));
  }, []);

  // Release the object URL when the workspace unmounts.
  React.useEffect(() => {
    return () => {
      setMedia((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
    };
  }, []);

  /* ── transcript ────────────────────────────────────────────────────────── */

  /** Replace the transcript wholesale (after transcription or import). */
  const setSegments = React.useCallback(
    (segments: Segment[], source: TranscriptSource, durationMs?: number) => {
      commit((current) => ({
        ...current,
        segments,
        source,
        durationMs: durationMs ?? current.durationMs,
        chapters: detectChapters(segments),
      }));
    },
    [commit],
  );

  /** Import an existing SRT/VTT/TXT the user already had. */
  const importTranscript = React.useCallback(
    (text: string, filename: string) => {
      const isSubtitle = /\.(srt|vtt)$/i.test(filename) || /-->/.test(text);
      if (isSubtitle) {
        const { cues, format } = parseSubtitles(text);
        if (cues.length === 0) throw new Error("No captions could be read from that file.");
        setSegments(cuesToSegments(cues), { kind: "imported", format });
        return;
      }

      // Plain text: one segment per non-empty line. Timings are unknown, so we
      // leave them at zero rather than fabricating a plausible-looking timeline.
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Error("That file has no readable text.");
      setSegments(
        lines.map((line, i) => ({ id: `s${i}`, start: 0, end: 0, text: line })),
        { kind: "imported", format: "txt" },
      );
    },
    [setSegments],
  );

  const updateSegment = React.useCallback(
    (id: string, patch: Partial<Segment>) => {
      commit((current) => ({
        ...current,
        segments: current.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    [commit],
  );

  /* ── speakers ──────────────────────────────────────────────────────────── */

  const addSpeaker = React.useCallback(
    (label: string) => {
      const id = `sp${Date.now().toString(36)}`;
      commit((current) => ({
        ...current,
        speakers: [
          ...current.speakers,
          { id, label, colorIndex: current.speakers.length },
        ],
      }));
      return id;
    },
    [commit],
  );

  const renameSpeaker = React.useCallback(
    (id: string, label: string) => {
      commit((current) => ({
        ...current,
        speakers: current.speakers.map((s) => (s.id === id ? { ...s, label } : s)),
      }));
    },
    [commit],
  );

  /** Fold `fromId` into `intoId`, reassigning every segment it owned. */
  const mergeSpeakers = React.useCallback(
    (fromId: string, intoId: string) => {
      if (fromId === intoId) return;
      commit((current) => ({
        ...current,
        speakers: current.speakers.filter((s) => s.id !== fromId),
        segments: current.segments.map((s) =>
          s.speakerId === fromId ? { ...s, speakerId: intoId } : s,
        ),
      }));
    },
    [commit],
  );

  /* ── bookmarks ─────────────────────────────────────────────────────────── */

  const addBookmark = React.useCallback(
    (time: number, label: string) => {
      const bookmark: Bookmark = { id: `b${Date.now().toString(36)}`, time, label };
      commit((current) => ({
        ...current,
        bookmarks: [...current.bookmarks, bookmark].sort((a, b) => a.time - b.time),
      }));
    },
    [commit],
  );

  const removeBookmark = React.useCallback(
    (id: string) => {
      commit((current) => ({
        ...current,
        bookmarks: current.bookmarks.filter((b) => b.id !== id),
      }));
    },
    [commit],
  );

  const reset = React.useCallback(() => {
    setMedia((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
    setTranscriptRaw(emptyTranscript());
    setPast([]);
    setFuture([]);
  }, []);

  /* ── derived ───────────────────────────────────────────────────────────── */

  // Recomputed only when segments actually change — the expensive passes must
  // not re-run when the user merely seeks or opens a different tab.
  const keywords = React.useMemo(
    () => extractKeywords(transcript.segments),
    [transcript.segments],
  );
  const entities = React.useMemo(
    () => extractEntities(transcript.segments),
    [transcript.segments],
  );
  const graph = React.useMemo(
    () => buildGraph(transcript.segments, keywords),
    [transcript.segments, keywords],
  );
  const analytics = React.useMemo(() => computeAnalytics(transcript), [transcript]);

  const speakerById = React.useMemo(() => {
    const map = new Map<string, Speaker>();
    for (const speaker of transcript.speakers) map.set(speaker.id, speaker);
    return map;
  }, [transcript.speakers]);

  return {
    transcript,
    media,
    keywords,
    entities,
    graph,
    analytics,
    speakerById,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    loadMedia,
    setSegments,
    importTranscript,
    updateSegment,
    addSpeaker,
    renameSpeaker,
    mergeSpeakers,
    addBookmark,
    removeBookmark,
    setDuration: (ms: number) =>
      setTranscriptRaw((current) =>
        current.durationMs === ms ? current : { ...current, durationMs: ms },
      ),
    reset,
  };
}

export type VideoIntelState = ReturnType<typeof useVideoIntel>;
