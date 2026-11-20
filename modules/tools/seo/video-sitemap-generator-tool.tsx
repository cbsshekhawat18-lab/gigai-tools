"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import { CodePane, Field, StatBadge, type Example } from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import { generateVideoSitemap, type VideoEntry } from "@/lib/seo-tools/sitemap";

/* -------------------------------------------------------------------------- */
/*  Constants: Google video sitemap rules */
/* -------------------------------------------------------------------------- */

/** Google's allowed <video:duration> range, in seconds (1s to 8 hours). */
const MIN_DURATION = 1;
const MAX_DURATION = 28800;
/** Google's max <video:title> length. */
const MAX_TITLE = 100;
/** Google's max <video:description> length. */
const MAX_DESC = 2048;
/** Protocol per-file URL ceiling. */
const MAX_URLS = 50000;

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The full, undo-tracked form state. The textarea uses an indented block
 * format: a non-indented line is a video's watch-page URL (<loc>); indented
 * `key: value` lines beneath it set that video's fields. Blank lines separate
 * videos; `#` lines are comments.
 *
 * Recognised keys (case-insensitive):
 *   thumbnail | title | description | player | content | duration | published
 */
interface VideoSitemapState {
  entries: string;
}

const INITIAL: VideoSitemapState = { entries: "" };

/* -------------------------------------------------------------------------- */
/*  Parsing                                                                   */
/* -------------------------------------------------------------------------- */

interface SkippedLine {
  line: number;
  text: string;
  reason: string;
}

/** A per-video validation problem, tagged with the video's opening line. */
interface EntryIssue {
  line: number;
  loc: string;
  severity: "fail" | "warn";
  message: string;
}

interface ParseResult {
  /** Ready-to-render entries (only videos that have the required fields). */
  parsed: VideoEntry[];
  /** Videos whose required fields are missing (excluded from output). */
  incomplete: EntryIssue[];
  /** Recommended-field warnings on otherwise-valid videos. */
  warnings: EntryIssue[];
  /** Lines that could not be parsed. */
  skipped: SkippedLine[];
  /** Distinct duplicate watch-page `loc` values. */
  duplicates: string[];
  totalVideos: number;
  nonHttpsLoc: number;
}

const FIELD_KEYS = new Set([
  "thumbnail",
  "title",
  "description",
  "player",
  "content",
  "duration",
  "published",
]);

/** A line is a "field" (child) line if it is indented or starts with `-`/`*`. */
function isChildLine(raw: string): boolean {
  return /^\s+/.test(raw) || /^\s*[-*]\s+/.test(raw.replace(/^\s+/, ""));
}

/** Strip a leading list marker (`- ` / `* `) and surrounding space. */
function stripMarker(text: string): string {
  return text.replace(/^\s*[-*]\s+/, "").trim();
}

function parseAbsoluteHttpUrl(value: string): URL | null {
  let u: URL | null = null;
  try {
    u = new URL(value);
  } catch {
    return null;
  }
  return /^https?:$/.test(u.protocol) ? u : null;
}

/** ISO 8601 date or datetime, e.g. 2026-06-30 or 2026-06-30T14:20:00+00:00. */
function isIso8601(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(value)) {
    return false;
  }
  return !Number.isNaN(new Date(value).getTime());
}

/** Raw, per-video accumulator before validation. */
interface RawVideo {
  loc: string;
  line: number;
  thumbnail?: string;
  title?: string;
  description?: string;
  player?: string;
  content?: string;
  duration?: string;
  published?: string;
}

/**
 * Parse the textarea into video-sitemap entries. A top-level line opens a new
 * video (its watch-page URL); indented `key: value` lines fill its fields.
 * Validation mirrors what Google enforces so the preview matches reality.
 */
function parseEntries(input: string): ParseResult {
  const raws: RawVideo[] = [];
  const skipped: SkippedLine[] = [];
  const duplicates: string[] = [];
  const seenLoc = new Set<string>();
  let nonHttpsLoc = 0;

  let current: RawVideo | null = null;

  const lines = input.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (isChildLine(raw) && current) {
      // ---- field line under the current video ----
      const body = stripMarker(trimmed);
      const sep = body.indexOf(":");
      if (sep === -1) {
        skipped.push({
          line: lineNo,
          text: trimmed,
          reason: "Field line must be 'key: value' (e.g. title: My video)",
        });
        return;
      }
      const key = body.slice(0, sep).trim().toLowerCase();
      const value = body.slice(sep + 1).trim();
      if (!FIELD_KEYS.has(key)) {
        skipped.push({
          line: lineNo,
          text: trimmed,
          reason: `Unknown field '${key}'. Use thumbnail, title, description, player, content, duration or published.`,
        });
        return;
      }
      if (value) current[key as keyof RawVideo] = value as never;
      return;
    }

    // ---- top-level line: a new video's watch page ----
    const pageUrl = parseAbsoluteHttpUrl(trimmed);
    if (!pageUrl) {
      skipped.push({
        line: lineNo,
        text: trimmed,
        reason: "Watch-page line is not an absolute http(s) URL",
      });
      current = null;
      return;
    }
    if (pageUrl.protocol !== "https:") nonHttpsLoc += 1;
    if (seenLoc.has(trimmed)) {
      if (!duplicates.includes(trimmed)) duplicates.push(trimmed);
    } else {
      seenLoc.add(trimmed);
    }
    current = { loc: trimmed, line: lineNo };
    raws.push(current);
  });

  // -------- validate each raw video into a VideoEntry (or an issue) --------
  const parsed: VideoEntry[] = [];
  const incomplete: EntryIssue[] = [];
  const warnings: EntryIssue[] = [];

  for (const r of raws) {
    const missing: string[] = [];
    if (!r.thumbnail) missing.push("thumbnail");
    if (!r.title) missing.push("title");
    if (!r.description) missing.push("description");
    if (!r.player && !r.content) missing.push("player or content URL");

    // Validate URLs that were supplied.
    const badUrls: string[] = [];
    if (r.thumbnail && !parseAbsoluteHttpUrl(r.thumbnail)) badUrls.push("thumbnail");
    if (r.player && !parseAbsoluteHttpUrl(r.player)) badUrls.push("player");
    if (r.content && !parseAbsoluteHttpUrl(r.content)) badUrls.push("content");

    if (missing.length || badUrls.length) {
      const parts: string[] = [];
      if (missing.length) parts.push(`missing ${missing.join(", ")}`);
      if (badUrls.length) parts.push(`${badUrls.join(", ")} is not a valid URL`);
      incomplete.push({
        line: r.line,
        loc: r.loc,
        severity: "fail",
        message: parts.join("; "),
      });
      continue;
    }

    // Duration: must be a whole number in [1, 28800] if provided.
    let durationSeconds: number | undefined;
    if (r.duration !== undefined) {
      const n = Number(r.duration);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        incomplete.push({
          line: r.line,
          loc: r.loc,
          severity: "fail",
          message: `duration '${r.duration}' must be a whole number of seconds`,
        });
        continue;
      }
      if (n < MIN_DURATION || n > MAX_DURATION) {
        incomplete.push({
          line: r.line,
          loc: r.loc,
          severity: "fail",
          message: `duration ${n}s is outside Google's ${MIN_DURATION}–${MAX_DURATION}s range`,
        });
        continue;
      }
      durationSeconds = n;
    }

    // Publication date: warn (don't drop) if malformed.
    let publicationDate: string | undefined;
    if (r.published !== undefined) {
      if (isIso8601(r.published)) {
        publicationDate = r.published;
      } else {
        warnings.push({
          line: r.line,
          loc: r.loc,
          severity: "warn",
          message: `published '${r.published}' is not ISO 8601 (YYYY-MM-DD), omitted`,
        });
      }
    }

    // Length warnings (still emitted, Google truncates rather than rejects).
    if (r.title && r.title.length > MAX_TITLE) {
      warnings.push({
        line: r.line,
        loc: r.loc,
        severity: "warn",
        message: `title is ${r.title.length} chars (max ${MAX_TITLE})`,
      });
    }
    if (r.description && r.description.length > MAX_DESC) {
      warnings.push({
        line: r.line,
        loc: r.loc,
        severity: "warn",
        message: `description is ${r.description.length} chars (max ${MAX_DESC})`,
      });
    }

    const entry: VideoEntry = {
      loc: r.loc,
      video: {
        thumbnailLoc: r.thumbnail as string,
        title: r.title as string,
        description: r.description as string,
        ...(r.player ? { playerLoc: r.player } : {}),
        ...(r.content ? { contentLoc: r.content } : {}),
        ...(durationSeconds !== undefined ? { duration: durationSeconds } : {}),
        ...(publicationDate ? { publicationDate } : {}),
      },
    };
    parsed.push(entry);
  }

  return {
    parsed,
    incomplete,
    warnings,
    skipped,
    duplicates,
    totalVideos: raws.length,
    nonHttpsLoc,
  };
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLES: ReadonlyArray<Example<VideoSitemapState>> = [
  {
    label: "Self-hosted MP4",
    description: "A watch page with a direct .mp4 content URL",
    icon: "Film",
    value: {
      entries: [
        "https://example.com/watch/how-to-tie-a-tie",
        "  thumbnail: https://example.com/thumbs/tie.jpg",
        "  title: How to tie a tie in 60 seconds",
        "  description: A quick, beginner-friendly walkthrough of the four-in-hand knot.",
        "  player: https://example.com/watch/how-to-tie-a-tie",
        "  content: https://cdn.example.com/video/tie.mp4",
        "  duration: 62",
        "  published: 2026-06-28",
      ].join("\n"),
    },
  },
  {
    label: "Embedded player",
    description: "A tutorial that uses an embeddable player_loc",
    icon: "MonitorPlay",
    value: {
      entries: [
        "https://example.com/courses/css-grid/lesson-1",
        "  thumbnail: https://example.com/thumbs/css-grid-1.jpg",
        " title: CSS Grid, Lesson 1: The grid container",
        "  description: Set up your first grid, learn rows and columns, and see the browser dev-tools overlay.",
        "  player: https://player.example.com/embed/css-grid-1",
        "  duration: 745",
        "  published: 2026-06-15T09:00:00+00:00",
      ].join("\n"),
    },
  },
  {
    label: "Video library",
    description: "Three episodes in one sitemap",
    icon: "Clapperboard",
    value: {
      entries: [
        "https://tv.example.com/episodes/e01-pilot",
        "  thumbnail: https://tv.example.com/thumbs/e01.jpg",
        " title: Episode 1: Pilot",
        "  description: Where it all begins. Meet the crew and the mission.",
        "  player: https://tv.example.com/episodes/e01-pilot",
        "  duration: 2640",
        "  published: 2026-05-30",
        "",
        "https://tv.example.com/episodes/e02-drift",
        "  thumbnail: https://tv.example.com/thumbs/e02.jpg",
        " title: Episode 2, Drift",
        "  description: A course correction goes wrong and the stakes rise.",
        "  player: https://tv.example.com/episodes/e02-drift",
        "  duration: 2712",
        "  published: 2026-06-06",
        "",
        "https://tv.example.com/episodes/e03-signal",
        "  thumbnail: https://tv.example.com/thumbs/e03.jpg",
        " title: Episode 3, Signal",
        "  description: A mysterious transmission changes everything.",
        "  player: https://tv.example.com/episodes/e03-signal",
        "  duration: 2698",
        "  published: 2026-06-13",
      ].join("\n"),
    },
  },
];

const SAMPLE_HINT = [
  "https://example.com/watch/my-video",
  "  thumbnail: https://example.com/thumbs/my-video.jpg",
  "  title: My video title (max 100 chars)",
  "  description: A short description of the video (max 2048 chars).",
  "  player: https://example.com/watch/my-video",
  "  content: https://cdn.example.com/video/my-video.mp4",
  "  duration: 225",
  "  published: 2026-06-30",
].join("\n");

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function VideoSitemapGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<VideoSitemapState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof VideoSitemapState>(key: K, value: VideoSitemapState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const { code, checks, stats, error } = React.useMemo(() => {
    const p = parseEntries(state.entries);
    const xml = p.parsed.length ? generateVideoSitemap(p.parsed) : "";

    const validCount = p.parsed.length;
    const httpsLoc = p.totalVideos - p.nonHttpsLoc;
    const checkItems: CheckItem[] = [];

    const nothingYet =
      p.totalVideos === 0 && p.skipped.length === 0;

    if (nothingYet) {
      checkItems.push({
        status: "info",
        label: "No videos yet",
        detail:
          "Add a watch-page URL on its own line, then set its fields on indented 'key: value' lines beneath it.",
      });
    } else if (validCount === 0) {
      checkItems.push({
        status: "fail",
        label: "No video has all its required fields",
        detail:
          "Every video needs a thumbnail, title, description, and at least one of player or content URL.",
        fix: "Fill the flagged fields beneath each watch-page URL.",
      });
    } else {
      checkItems.push({
        status: "pass",
        label: `${validCount} video${validCount === 1 ? "" : "s"} in the sitemap`,
        detail: "Each becomes one <url> with a nested <video:video> block.",
      });
    }

    // Per-video hard failures (excluded from output).
    if (p.incomplete.length) {
      const preview = p.incomplete
        .slice(0, 4)
        .map((e) => `line ${e.line}: ${e.message}`)
        .join("; ");
      checkItems.push({
        status: "fail",
        label: `${p.incomplete.length} video${p.incomplete.length === 1 ? "" : "s"} excluded`,
        detail: preview + (p.incomplete.length > 4 ? "; …" : ""),
        fix: "Google requires thumbnail, title, description and a player/content URL per video. Duration must be 1–28,800s.",
      });
    }

    // Unparseable lines.
    if (p.skipped.length) {
      const preview = p.skipped
        .slice(0, 4)
        .map((l) => `line ${l.line}: ${l.reason}`)
        .join("; ");
      checkItems.push({
        status: "fail",
        label: `${p.skipped.length} line${p.skipped.length === 1 ? "" : "s"} skipped`,
        detail: preview + (p.skipped.length > 4 ? "; …" : ""),
        fix: "Top-level lines are absolute watch-page URLs. Indented lines are 'key: value' fields. Use '#' to comment a line out.",
      });
    }

    // Recommended-field / length warnings.
    if (p.warnings.length) {
      const preview = p.warnings
        .slice(0, 4)
        .map((w) => `line ${w.line}: ${w.message}`)
        .join("; ");
      checkItems.push({
        status: "warn",
        label: `${p.warnings.length} warning${p.warnings.length === 1 ? "" : "s"}`,
        detail: preview + (p.warnings.length > 4 ? "; …" : ""),
        fix: "These entries still export, but tidy titles (≤100), descriptions (≤2048) and ISO 8601 dates index better.",
      });
    }

    if (p.duplicates.length) {
      checkItems.push({
        status: "warn",
        label: `${p.duplicates.length} duplicate watch-page URL${p.duplicates.length === 1 ? "" : "s"}`,
        detail:
          p.duplicates.slice(0, 3).join(", ") + (p.duplicates.length > 3 ? ", …" : ""),
        fix: "List each watch page once. Duplicate <loc> entries waste crawl budget.",
      });
    }

    if (p.totalVideos > 0 && p.nonHttpsLoc > 0) {
      checkItems.push({
        status: "warn",
        label: `${p.nonHttpsLoc} watch page${p.nonHttpsLoc === 1 ? " is" : "s are"} not HTTPS`,
        detail: `${httpsLoc}/${p.totalVideos} watch-page URLs use https://.`,
        fix: "Serve and list the https:// version of each watch page. Search engines prefer secure URLs.",
      });
    } else if (validCount > 0) {
      checkItems.push({ status: "pass", label: "All watch pages use HTTPS" });
    }

    if (p.totalVideos > MAX_URLS) {
      checkItems.push({
        status: "fail",
        label: `Over the ${MAX_URLS.toLocaleString()}-URL limit (${p.totalVideos.toLocaleString()})`,
        detail: "A single sitemap may contain at most 50,000 URLs (and 50 MB uncompressed).",
        fix: "Split the videos into multiple sitemap files and reference them from a <sitemapindex>, then submit the index.",
      });
    } else if (p.totalVideos > 45000) {
      checkItems.push({
        status: "warn",
        label: `Approaching the ${MAX_URLS.toLocaleString()}-URL limit (${p.totalVideos.toLocaleString()})`,
        detail: "Plan to split into multiple sitemaps with a sitemap index soon.",
      });
    }

    const hardError =
      p.totalVideos > MAX_URLS
        ? `This sitemap exceeds the ${MAX_URLS.toLocaleString()}-URL protocol limit. Split it and use a sitemap index.`
        : null;

    const bytes = xml ? new TextEncoder().encode(xml).length : 0;

    const statNodes = (
      <>
        <StatBadge
          label="Videos"
          value={validCount}
          icon="Film"
          tone={validCount ? "info" : "default"}
        />
        <StatBadge
          label="HTTPS"
          value={p.totalVideos ? `${httpsLoc}/${p.totalVideos}` : "0/0"}
          icon="ShieldCheck"
          tone={
            p.totalVideos === 0 ? "default" : p.nonHttpsLoc ? "warning" : "success"
          }
        />
        {p.incomplete.length > 0 && (
          <StatBadge
            label="Excluded"
            value={p.incomplete.length}
            icon="TriangleAlert"
            tone="danger"
          />
        )}
        {p.warnings.length > 0 && (
          <StatBadge label="Warnings" value={p.warnings.length} icon="TriangleAlert" tone="warning" />
        )}
        {p.duplicates.length > 0 && (
          <StatBadge label="Duplicates" value={p.duplicates.length} icon="Copy" tone="warning" />
        )}
        <StatBadge
          label="Size"
          value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
          icon="FileCode"
        />
      </>
    );

    return { code: xml, checks: checkItems, stats: statNodes, error: hardError };
  }, [state]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <Field
        label="Videos and their details"
        htmlFor="video-sitemap-entries"
        hint="One watch-page URL per top-level line. Indent each field beneath it as 'key: value': keys: thumbnail, title, description, player, content, duration (seconds), published (YYYY-MM-DD). Separate videos with a blank line; # comments a line out."
      >
        <CodePane
          id="video-sitemap-entries"
          value={state.entries}
          onChange={(v) => set("entries", v)}
          onDropText={(text) =>
            set("entries", state.entries ? `${state.entries}\n${text}` : text)
          }
          label={undefined}
          placeholder={SAMPLE_HINT}
          minHeight={280}
          maxHeight={480}
          lineNumbers
          ariaLabel="Videos and their details"
        />
      </Field>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = <CheckList items={checks} />;

  return (
    <GeneratorWithPreview<VideoSitemapState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="XML"
      form={form}
      preview={preview}
      previewLabel="Validation"
      downloadName="video-sitemap.xml"
      downloadMime="application/xml;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<VideoSitemapState>;
          if (typeof parsed !== "object" || parsed === null) return null;
          return { ...INITIAL, ...parsed };
        } catch {
          return null;
        }
      }}
      stats={stats}
    />
  );
}
