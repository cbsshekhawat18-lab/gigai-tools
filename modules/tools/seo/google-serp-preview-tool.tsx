"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { SerpPreview } from "@/components/tool/seo";
import { serpSnippets } from "@/lib/seo-tools/preview";
import { titleDescriptionScore, buildMetaTags, extractMetaFromHtml } from "@/lib/seo-tools/meta";
import {
  CodePane,
  download,
  ExamplesMenu,
  Field,
  SegmentedControl,
  ShortcutsHelp,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";

/** The three snippet fields the user edits, the single unit of history/share. */
interface Snippet {
  title: string;
  url: string;
  description: string;
}

/** Input mode: type the fields directly, or paste page HTML to extract them. */
type Mode = "fields" | "html";

const EMPTY: Snippet = { title: "", url: "", description: "" };

const SAMPLE: Snippet = {
  title: "Best Running Shoes 2026, Tested & Ranked | TrailLab",
  url: "https://traillab.com/guides/best-running-shoes",
  description:
    "We ran 240 miles in 18 pairs to rank the best running shoes of 2026 for road, trail and race day, with fit, cushioning and value notes for every runner.",
};

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>How to Compost at Home: A Beginner's Guide | GreenNest</title>
  <meta name="description" content="Start composting at home in a weekend. Our beginner's guide covers bins, the brown-to-green ratio, what to add, what to avoid, and fixing a smelly pile.">
  <link rel="canonical" href="https://greennest.com/guides/home-composting">
  <meta property="og:title" content="How to Compost at Home">
</head>
<body></body>
</html>`;

const EXAMPLES: ReadonlyArray<Example<Snippet>> = [
  {
    label: "Well-optimized snippet",
    description: "Title and description both in the sweet spot.",
    value: SAMPLE,
    icon: "CircleCheck",
  },
  {
    label: "Title too long (truncates)",
    description: "Wide letters push it past the pixel budget.",
    value: {
      title:
        "The Ultimate Wide-Width Marketing Workshop & Masterclass Roundup Guide",
      url: "https://example.com/workshops/marketing-masterclass",
      description:
        "A short description so you can focus on watching the long title get clipped with an ellipsis in both the desktop and mobile previews.",
    },
    icon: "TriangleAlert",
  },
  {
    label: "Missing description",
    description: "See how an empty description reads.",
    value: {
      title: "Contact Us, Acme Plumbing, Austin TX",
      url: "https://acmeplumbing.com/contact",
      description: "",
    },
    icon: "CircleAlert",
  },
];

/** Serialize a snippet to a compact string for shareable links. */
function serialize(s: Snippet): string {
  return JSON.stringify(s);
}
function deserialize(raw: string): Snippet | null {
  try {
    const parsed = JSON.parse(raw) as Partial<Snippet>;
    if (parsed && typeof parsed === "object") {
      return {
        title: typeof parsed.title === "string" ? parsed.title : "",
        url: typeof parsed.url === "string" ? parsed.url : "",
        description: typeof parsed.description === "string" ? parsed.description : "",
      };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Tone → Tailwind text color for the status readouts. */
const STATUS_TONE: Record<"good" | "warn" | "bad" | "empty", string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-rose-600 dark:text-rose-400",
  empty: "text-muted-foreground",
};

const STATUS_ICON: Record<"good" | "warn" | "bad" | "empty", string> = {
  good: "CircleCheck",
  warn: "TriangleAlert",
  bad: "CircleX",
  empty: "Circle",
};

/**
 * Google SERP Preview, type a title, URL and meta description (or paste a
 * page's HTML to extract them) and see a pixel-accurate Google desktop + mobile
 * result render live, with per-field length/pixel warnings measured the way
 * Google truncates. Copy an optimized meta block, download it, share a link, or
 * step through undo/redo. Everything is client-side.
 */
export default function GoogleSerpPreviewTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const history = useHistory<Snippet>(EMPTY);
  const snippet = history.state;

  const [mode, setMode] = React.useState<Mode>("fields");
  const [html, setHtml] = React.useState("");
  const [extractNote, setExtractNote] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const share = useShareState({
    onInit: (value) => {
      const parsed = deserialize(value);
      if (parsed) history.reset(parsed);
    },
  });

  /** Patch one field, creating a coalesced undo step. */
  const setField = React.useCallback(
    (key: keyof Snippet, value: string) => {
      history.set((prev) => ({ ...prev, [key]: value }));
    },
    [history],
  );

  const loadExample = React.useCallback(
    (value: Snippet) => {
      history.set(value);
      setMode("fields");
    },
    [history],
  );

  /** Parse pasted HTML into the three fields. */
  const extractFromHtml = React.useCallback(() => {
    if (!html.trim()) {
      setExtractNote("Paste a page's HTML above first (View Source → copy).");
      return;
    }
    const meta = extractMetaFromHtml(html);
    const next: Snippet = {
      title: meta.title ?? "",
      url: meta.canonical ?? meta.og["url"] ?? snippet.url,
      description: meta.description ?? meta.og["description"] ?? "",
    };
    history.set(next);
    setMode("fields");
    const found: string[] = [];
    if (meta.title) found.push("title");
    if (meta.description) found.push("description");
    if (meta.canonical) found.push("canonical URL");
    setExtractNote(
      found.length
        ? `Extracted ${found.join(", ")} from the pasted HTML.`
        : "No <title> or meta description found in that HTML: check you pasted the full page source.",
    );
  }, [html, history, snippet.url]);

  // Pixel-aware snippets for both devices from the engine.
  const snippets = React.useMemo(
    () => serpSnippets({ title: snippet.title, url: snippet.url, desc: snippet.description }),
    [snippet.title, snippet.url, snippet.description],
  );
  const scores = React.useMemo(
    () => titleDescriptionScore(snippet.title, snippet.description),
    [snippet.title, snippet.description],
  );

  const isEmpty = !snippet.title && !snippet.url && !snippet.description;

  /** An optimized, copy-ready meta block for the current snippet. */
  const metaBlock = React.useMemo(
    () =>
      buildMetaTags({
        title: snippet.title,
        description: snippet.description,
        canonical: snippet.url || undefined,
      }),
    [snippet.title, snippet.description, snippet.url],
  );

  const copyMeta = React.useCallback(async () => {
    if (!metaBlock) return;
    try {
      await navigator.clipboard.writeText(metaBlock);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: the download button is the fallback */
    }
  }, [metaBlock]);

  const doDownload = React.useCallback(() => {
    if (!metaBlock) return;
    download("serp-meta-gigai.html", metaBlock, "text/html;charset=utf-8");
  }, [metaBlock]);

  const doShare = React.useCallback(() => {
    void share.copyShareLink(serialize(snippet));
  }, [share, snippet]);

  useShortcuts({
    "mod+c": () => void copyMeta(),
    "mod+s": doDownload,
    "mod+z": history.undo,
    "mod+shift+z": history.redo,
    "mod+shift+backspace": () => history.reset(EMPTY),
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+c", description: "Copy the meta tag block" },
    { combo: "mod+s", description: "Download the meta block" },
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+shift+backspace", description: "Reset" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      {/* ── Left: inputs ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <SegmentedControl<Mode>
            value={mode}
            onChange={setMode}
            ariaLabel="Input mode"
            options={[
              { value: "fields", label: "Type fields", icon: "TextCursorInput" },
              { value: "html", label: "Extract from HTML", icon: "ClipboardPaste" },
            ]}
          />
          <ExamplesMenu<Snippet> examples={EXAMPLES} onPick={(v) => loadExample(v)} />
        </div>

        {mode === "fields" ? (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/60 p-4">
            <Field
              label="Page title"
              htmlFor="serp-title"
              hint="Aim for ~50–60 characters. Google truncates by pixel width."
            >
              <input
                id="serp-title"
                type="text"
                value={snippet.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Best Running Shoes 2026, Tested & Ranked | TrailLab"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <LengthReadout
                score={scores.title}
                pixels={snippets.desktop.title.pixels}
                limit={snippets.desktop.title.limit}
              />
            </Field>

            <Field label="URL" htmlFor="serp-url" hint="The full page URL, e.g. https://example.com/blog/post">
              <input
                id="serp-url"
                type="url"
                inputMode="url"
                value={snippet.url}
                onChange={(e) => setField("url", e.target.value)}
                placeholder="https://example.com/guides/best-running-shoes"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>

            <Field
              label="Meta description"
              htmlFor="serp-desc"
              hint="Aim for ~150–160 characters that earn the click."
            >
              <textarea
                id="serp-desc"
                value={snippet.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
                placeholder="Summarize the page in a compelling sentence that still reads well if the last few words are cut."
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <LengthReadout
                score={scores.description}
                pixels={snippets.desktop.description.pixels}
                limit={snippets.desktop.description.limit}
              />
            </Field>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/60 p-4">
            <CodePane
              value={html}
              onChange={setHtml}
              label="Paste page HTML"
              ariaLabel="Page HTML to extract meta tags from"
              placeholder={"Paste a page's full HTML source here (View Source), then click Extract."}
              minHeight={180}
              maxHeight={320}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={extractFromHtml}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  style.soft,
                )}
              >
                <Icon name="Wand" size={14} />
                Extract tags
              </button>
              <button
                type="button"
                onClick={() => setHtml(SAMPLE_HTML)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="FileCode" size={14} />
                Load sample HTML
              </button>
            </div>
            {extractNote && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                <span>{extractNote}</span>
              </p>
            )}
            <p className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
              <span>
                We never fetch live URLs: browsers can&apos;t fetch arbitrary sites (CORS), and we
                run no server for privacy. Paste the page source and we parse it on your device.
              </span>
            </p>
          </div>
        )}

        {/* Action toolbar */}
        <Toolbar>
          <ToolbarButton
            icon={copied ? "Check" : "Copy"}
            label={copied ? "Copied!" : "Copy meta"}
            kbd="mod+c"
            variant={copied ? "active" : "primary"}
            onClick={() => void copyMeta()}
            disabled={isEmpty}
          />
          <ToolbarButton
            icon="Download"
            label="Download"
            kbd="mod+s"
            onClick={doDownload}
            disabled={isEmpty}
          />
          <ToolbarButton
            icon={share.justCopied ? "Check" : "Link"}
            label={share.justCopied ? "Link copied!" : "Share"}
            variant={share.justCopied ? "active" : "default"}
            onClick={doShare}
            disabled={isEmpty}
          />
          <ToolbarDivider />
          <ToolbarButton icon="Undo2" label="Undo" kbd="mod+z" onClick={history.undo} disabled={!history.canUndo} />
          <ToolbarButton icon="Redo2" label="Redo" kbd="mod+shift+z" onClick={history.redo} disabled={!history.canRedo} />
          <ToolbarButton
            icon="RotateCcw"
            label="Reset"
            onClick={() => history.reset(EMPTY)}
            disabled={isEmpty}
          />
          <ToolbarSpacer />
          <ShortcutsHelp shortcuts={shortcuts} />
        </Toolbar>

        {share.shareError && (
          <p className="text-xs text-rose-600 dark:text-rose-400">{share.shareError}</p>
        )}
      </div>

      {/* ── Right: live preview ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <PreviewCard label="Desktop result" icon="Monitor">
          <SerpPreview
            device="desktop"
            showToggle={false}
            title={snippet.title}
            url={snippet.url || "https://example.com"}
            description={snippet.description}
          />
        </PreviewCard>

        <PreviewCard label="Mobile result" icon="Smartphone">
          <SerpPreview
            device="mobile"
            showToggle={false}
            title={snippet.title}
            url={snippet.url || "https://example.com"}
            description={snippet.description}
          />
        </PreviewCard>

        {/* Score summary */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-3">
          <StatBadge
            value={`${scores.score}/100`}
            icon="Gauge"
            tone={scores.score >= 80 ? "success" : scores.score >= 50 ? "warning" : "danger"}
            title="Combined title + description snippet score"
          />
          <span className="text-xs text-muted-foreground">
            {scores.score >= 80
              ? "Your snippet is well-optimized for search."
              : scores.score >= 50
                ? "Close: tune the amber fields to fit Google's limits."
                : isEmpty
                  ? "Enter a title and description to score your snippet."
                  : "Your snippet risks truncation: trim the red fields."}
          </span>
        </div>
      </div>
    </div>
  );
}

/** A framed preview surface with a labelled header. */
function PreviewCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
        <Icon name={icon} size={13} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Live length + pixel readout with green/amber/red status for one field. */
function LengthReadout({
  score,
  pixels,
  limit,
}: {
  score: { length: number; status: "good" | "warn" | "bad" | "empty"; message: string };
  pixels: number;
  limit: number;
}) {
  const overBudget = pixels > limit;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className={cn("inline-flex items-center gap-1 font-medium", STATUS_TONE[score.status])}>
        <Icon name={STATUS_ICON[score.status]} size={12} />
        {score.length} chars
      </span>
      <span className={cn("tabular-nums", overBudget ? STATUS_TONE.bad : "text-muted-foreground")}>
        {pixels}px / {limit}px
      </span>
      <span className="text-muted-foreground">{score.message}</span>
    </div>
  );
}
