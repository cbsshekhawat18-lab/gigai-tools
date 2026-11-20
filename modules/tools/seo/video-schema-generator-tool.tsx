"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  Field,
  NumberStepper,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  ScorePanel,
  CheckList,
  gradeForScore,
  type CheckItem,
} from "@/components/tool/seo";
import {
  buildVideoObject,
  secondsToIso8601Duration,
  validateJsonLd,
  type SchemaOutput,
} from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The tool's form state. Duration is kept as separate minutes/seconds so the
 * user never has to think about ISO-8601; we convert on the way out.
 */
interface VideoState {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  embedUrl: string;
  minutes: number;
  seconds: number;
}

const INITIAL_STATE: VideoState = {
  name: "",
  description: "",
  thumbnailUrl: "",
  uploadDate: "",
  contentUrl: "",
  embedUrl: "",
  minutes: 0,
  seconds: 0,
};

const EXAMPLE_STATE: VideoState = {
  name: "How to Add Video Schema in 5 Minutes",
  description:
    "A quick, practical walkthrough of generating VideoObject JSON-LD and pasting it into your page to become eligible for Google video results.",
  thumbnailUrl: "https://example.com/videos/video-schema-thumb.jpg",
  uploadDate: "2026-06-14",
  contentUrl: "https://example.com/videos/video-schema.mp4",
  embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  minutes: 6,
  seconds: 12,
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Total runtime, in whole seconds (0 → treated as "no duration"). */
function totalSeconds(s: VideoState): number {
  const m = Number.isFinite(s.minutes) ? Math.max(0, Math.floor(s.minutes)) : 0;
  const sec = Number.isFinite(s.seconds) ? Math.max(0, Math.floor(s.seconds)) : 0;
  return m * 60 + sec;
}

/** Build the VideoObject JSON-LD for the current state. */
function buildOutput(s: VideoState): SchemaOutput {
  const secs = totalSeconds(s);
  return buildVideoObject({
    name: s.name.trim(),
    description: s.description.trim() || undefined,
    thumbnailUrl: s.thumbnailUrl.trim() || undefined,
    uploadDate: s.uploadDate.trim() || undefined,
    contentUrl: s.contentUrl.trim() || undefined,
    embedUrl: s.embedUrl.trim() || undefined,
    durationSeconds: secs > 0 ? secs : undefined,
  });
}

/**
 * Extract a YouTube video id from the common link shapes:
 *   youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>.
 * Returns null if nothing recognisable is found.
 */
function youtubeIdFrom(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  // Bare 11-char id.
  if (/^[a-zA-Z0-9_-]{11}$/.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const valid = (id: string | null): string | null =>
    id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;

  if (host === "youtu.be") {
    return valid(url.pathname.slice(1).split("/")[0] ?? null);
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v) return valid(v);
    const parts = url.pathname.split("/").filter(Boolean);
    // /embed/<id>, /shorts/<id>, /v/<id>, /live/<id>
    if (parts.length >= 2 && ["embed", "shorts", "v", "live"].includes(parts[0] ?? "")) {
      return valid(parts[1] ?? null);
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function VideoSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "rose");
  const [state, setState] = React.useState<VideoState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);
  const [ytLink, setYtLink] = React.useState("");
  const [ytError, setYtError] = React.useState<string | null>(null);

  const set = React.useCallback(
    <K extends keyof VideoState>(key: K, value: VideoState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const output = React.useMemo<SchemaOutput>(() => buildOutput(state), [state]);
  const validation = React.useMemo(() => validateJsonLd(output.jsonLd), [output.jsonLd]);

  const secs = totalSeconds(state);
  const isoDuration = secs > 0 ? secondsToIso8601Duration(secs) : "";

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- YouTube helper -------------------------------------------------------- */
  const applyYoutube = React.useCallback(() => {
    const id = youtubeIdFrom(ytLink);
    if (!id) {
      setYtError("Couldn't find a YouTube video ID in that link. Paste a watch, share, embed or shorts URL.");
      return;
    }
    setYtError(null);
    setState((s) => ({
      ...s,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: s.thumbnailUrl.trim()
        ? s.thumbnailUrl
        : `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    }));
  }, [ytLink]);

  /* -- validity → score + check rows ---------------------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "Required for a video rich result, fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it improves video-result eligibility.",
        group: "Recommended",
      });
    }
    if (validation.ok && validation.warnings.length === 0 && validation.types.length > 0) {
      items.push({
        id: "all-good",
        status: "pass",
        label: "All required & recommended properties present",
        detail: "Valid VideoObject markup, ready to publish.",
        group: "Required",
      });
    } else if (validation.ok) {
      items.push({
        id: "required-ok",
        status: "pass",
        label: "All required properties present",
        detail: "Valid VideoObject markup.",
        group: "Required",
      });
    }

    const errPenalty = validation.errors.length * 22;
    const warnPenalty = validation.warnings.length * 6;
    const raw = 100 - errPenalty - warnPenalty;
    const s = validation.types.length === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [validation]);

  const grade = gradeForScore(score);
  const summary = validation.ok
    ? validation.warnings.length === 0
      ? "Valid: all required and recommended properties are present."
      : `Valid: ${validation.warnings.length} recommended ${validation.warnings.length === 1 ? "property" : "properties"} would strengthen it.`
    : `${validation.errors.length} required ${validation.errors.length === 1 ? "property is" : "properties are"} missing.`;

  /* -- presets --------------------------------------------------------------- */
  const examples = React.useMemo<ReadonlyArray<Example<VideoState>>>(
    () => [
      {
        label: "Tutorial video example",
        description: "A fully-populated, valid VideoObject to learn from.",
        icon: "Video",
        value: EXAMPLE_STATE,
      },
    ],
    [],
  );

  const serialize = React.useCallback((s: VideoState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): VideoState | null => {
    try {
      const parsed = JSON.parse(raw) as Partial<VideoState>;
      if (parsed && typeof parsed === "object") {
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- text field helper ----------------------------------------------------- */
  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

  /* -- form ------------------------------------------------------------------ */
  const form = (
    <div className="flex flex-col gap-4">
      {/* YouTube quick-fill */}
      <div className={cn("rounded-lg border border-border p-3", style.soft)}>
        <label
          htmlFor="yt-link"
          className="flex items-center gap-1.5 text-xs font-medium text-foreground"
        >
          <Icon name="Youtube" size={14} className={style.text} />
          Quick-fill from a YouTube link
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="yt-link"
            value={ytLink}
            onChange={(e) => {
              setYtLink(e.target.value);
              if (ytError) setYtError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyYoutube();
              }
            }}
            placeholder="https://youtu.be/dQw4w9WgXcQ"
            className={cn(inputCls, "bg-background/70")}
            spellCheck={false}
          />
          <button
            type="button"
            onClick={applyYoutube}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Wand2" size={14} />
            Fill URLs
          </button>
        </div>
        {ytError ? (
          <p className="mt-1.5 flex items-start gap-1 text-xs text-destructive">
            <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
            {ytError}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Fills the embed URL, and a thumbnail if you haven&rsquo;t set one. Add the title, upload date and duration below.
          </p>
        )}
      </div>

      <div className="h-px bg-border" />

      <Field label="Video title" htmlFor="v-name" hint="The video's name: required.">
        <input
          id="v-name"
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="How to add video schema"
          className={inputCls}
        />
      </Field>

      <Field label="Description" htmlFor="v-desc" hint="A short summary: recommended.">
        <textarea
          id="v-desc"
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="A quick walkthrough of generating VideoObject JSON-LD."
          className={cn(inputCls, "resize-y")}
        />
      </Field>

      <Field label="Thumbnail URL" htmlFor="v-thumb" hint="A direct image URL Google can fetch: required.">
        <input
          id="v-thumb"
          type="url"
          value={state.thumbnailUrl}
          onChange={(e) => set("thumbnailUrl", e.target.value)}
          placeholder="https://example.com/thumb.jpg"
          className={inputCls}
          spellCheck={false}
        />
      </Field>

      <Field label="Upload date" htmlFor="v-date" hint="When the video was first published: required.">
        <input
          id="v-date"
          type="date"
          value={state.uploadDate}
          onChange={(e) => set("uploadDate", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="Duration"
        hint="Enter minutes and seconds. We emit the ISO-8601 value Google needs."
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <NumberStepper
              value={state.minutes}
              onChange={(n) => set("minutes", n)}
              min={0}
              max={999}
              ariaLabel="Minutes"
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <NumberStepper
              value={state.seconds}
              onChange={(n) => set("seconds", n)}
              min={0}
              max={59}
              ariaLabel="Seconds"
            />
            <span className="text-xs text-muted-foreground">sec</span>
          </div>
          {isoDuration && (
            <code
              className={cn(
                "rounded px-1.5 py-1 font-mono text-xs",
                style.soft,
              )}
              title="ISO-8601 duration written into the markup"
            >
              {isoDuration}
            </code>
          )}
        </div>
      </Field>

      <Field
        label="Content URL"
        htmlFor="v-content"
        hint="A direct link to the raw media file (e.g. an.mp4), recommended."
      >
        <input
          id="v-content"
          type="url"
          value={state.contentUrl}
          onChange={(e) => set("contentUrl", e.target.value)}
          placeholder="https://example.com/video.mp4"
          className={inputCls}
          spellCheck={false}
        />
      </Field>

      <Field
        label="Embed URL"
        htmlFor="v-embed"
        hint="A link to a player page that embeds the video (e.g. a YouTube embed)."
      >
        <input
          id="v-embed"
          type="url"
          value={state.embedUrl}
          onChange={(e) => set("embedUrl", e.target.value)}
          placeholder="https://www.youtube.com/embed/abc123"
          className={inputCls}
          spellCheck={false}
        />
      </Field>
    </div>
  );

  /* -- preview: thumbnail card + validity check ------------------------------ */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: validation.warnings.length,
          fail: validation.errors.length,
        }}
      />

      {/* A lightweight "how Google might frame it" video result card. */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-video w-full bg-muted">
          {state.thumbnailUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.thumbnailUrl.trim()}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Icon name="Image" size={28} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="grid size-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <Icon name="Play" size={20} />
            </span>
          </div>
          {isoDuration && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[11px] text-white">
              {secs >= 3600
                ? `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`
                : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`}
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-medium text-foreground">
            {state.name.trim() || "Your video title"}
          </p>
          {state.description.trim() && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {state.description.trim()}
            </p>
          )}
        </div>
      </div>

      <CheckList
        items={checks}
        grouped
        emptyLabel="Add a title, thumbnail and upload date to validate your video markup."
      />

      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Thumbnail previews render from the image URL only; nothing is uploaded. This is a
          pragmatic required/recommended check; confirm final eligibility with{" "}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-medium underline underline-offset-2", style.text)}
          >
            Google&rsquo;s Rich Results Test
          </a>{" "}
          before publishing.
        </span>
      </p>
    </div>
  );

  const stats = (
    <>
      <StatBadge
        icon="Video"
        label="Type"
        value="VideoObject"
        tone="info"
        title="Active schema.org @type"
      />
      <StatBadge
        icon="Timer"
        label="Duration"
        value={isoDuration || "-"}
        title="ISO-8601 duration written into the markup"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={validation.ok ? "CircleCheck" : "XCircle"}
        label="Status"
        value={validation.ok ? "Valid" : `${validation.errors.length} error${validation.errors.length === 1 ? "" : "s"}`}
        tone={validation.ok ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<VideoState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Video result & validity check"
      downloadName="videoobject-schema.json"
      downloadMime="application/ld+json;charset=utf-8"
      examples={examples}
      serialize={serialize}
      deserialize={deserialize}
      stats={stats}
      toolbarExtras={
        <button
          type="button"
          onClick={() => setMinified((m) => !m)}
          aria-pressed={minified}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            minified ? style.soft : "text-muted-foreground hover:text-foreground",
          )}
          title="Toggle minified output"
        >
          <Icon name={minified ? "Minimize2" : "Maximize2"} size={13} />
          {minified ? "Minified" : "Pretty"}
        </button>
      }
    />
  );
}
