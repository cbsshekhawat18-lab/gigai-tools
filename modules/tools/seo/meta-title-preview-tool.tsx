"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { SerpPreview } from "@/components/tool/seo";
import { serpSnippets } from "@/lib/seo-tools/preview";
import { escapeHtmlAttr } from "@/lib/seo-tools/meta";
import {
  download,
  ExamplesMenu,
  Field,
  SelectField,
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

/** How the brand joins the title. `none` omits the brand entirely. */
type Separator = "pipe" | "hyphen" | "endash" | "emdash" | "colon" | "none";

/** The single unit of history / share: the title, brand, separator and URL. */
interface TitleState {
  title: string;
  brand: string;
  separator: Separator;
  url: string;
}

const EMPTY: TitleState = {
  title: "",
  brand: "",
  separator: "pipe",
  url: "",
};

const SEPARATOR_LABELS: Record<Separator, string> = {
  pipe: "Pipe  |",
  hyphen: "Hyphen  -",
  endash: "En dash  –",
  emdash: "Em dash -",
  colon: "Colon  :",
  none: "No brand",
};

/** The literal glue string for each separator (padded with spaces). */
const SEPARATOR_GLUE: Record<Separator, string> = {
  pipe: " | ",
  hyphen: " - ",
  endash: " – ",
  emdash: " - ",
  colon: ": ",
  none: "",
};

const SEPARATOR_OPTIONS: ReadonlyArray<{ value: Separator; label: string }> = (
  Object.keys(SEPARATOR_LABELS) as Separator[]
).map((value) => ({ value, label: SEPARATOR_LABELS[value] }));

const SAMPLE: TitleState = {
  title: "Best Running Shoes 2026, Tested & Ranked",
  brand: "TrailLab",
  separator: "pipe",
  url: "https://traillab.com/guides/best-running-shoes",
};

const EXAMPLES: ReadonlyArray<Example<TitleState>> = [
  {
    label: "Well-optimized title",
    description: "Keyword first, short brand, fits the budget.",
    value: SAMPLE,
    icon: "CircleCheck",
  },
  {
    label: "Title too long (truncates)",
    description: "Wide letters push it past the pixel budget.",
    value: {
      title: "The Ultimate Wide-Width Marketing Workshop & Masterclass Roundup",
      brand: "GrowthMasters Worldwide",
      separator: "pipe",
      url: "https://example.com/workshops/marketing-masterclass",
    },
    icon: "TriangleAlert",
  },
  {
    label: "Brand before keyword",
    description: "Front-load check flags the keyword sitting last.",
    value: {
      title: "Acme Plumbing",
      brand: "Emergency Drain Repair Austin TX",
      separator: "hyphen",
      url: "https://acmeplumbing.com/services/drains",
    },
    icon: "MoveLeft",
  },
];

/** Assemble the final "Title | Brand" string exactly as Google would show it. */
function assembleTitle(state: TitleState): string {
  const title = state.title.trim();
  const brand = state.brand.trim();
  if (state.separator === "none" || !brand) return title;
  if (!title) return brand;
  return `${title}${SEPARATOR_GLUE[state.separator]}${brand}`;
}

function serialize(s: TitleState): string {
  return JSON.stringify(s);
}

const SEPARATORS: ReadonlySet<Separator> = new Set<Separator>([
  "pipe",
  "hyphen",
  "endash",
  "emdash",
  "colon",
  "none",
]);

function deserialize(raw: string): TitleState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<TitleState>;
    if (parsed && typeof parsed === "object") {
      const sep =
        typeof parsed.separator === "string" && SEPARATORS.has(parsed.separator as Separator)
          ? (parsed.separator as Separator)
          : "pipe";
      return {
        title: typeof parsed.title === "string" ? parsed.title : "",
        brand: typeof parsed.brand === "string" ? parsed.brand : "",
        separator: sep,
        url: typeof parsed.url === "string" ? parsed.url : "",
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

type Status = "good" | "warn" | "bad" | "empty";

/** Derive a length status for the assembled title from chars + truncation. */
function titleStatus(chars: number, truncated: boolean): { status: Status; message: string } {
  if (chars === 0) return { status: "empty", message: "Type a title to preview it." };
  if (truncated) return { status: "bad", message: "Google would truncate this title." };
  if (chars < 30) return { status: "warn", message: "A little short. You have room to say more." };
  if (chars > 60) return { status: "warn", message: "Near the limit, watch the pixel width." };
  return { status: "good", message: "Title length is ideal." };
}

/**
 * Meta Title Preview, type a page title and brand, pick how they join, and see
 * a pixel-accurate Google desktop + mobile title render live, with character
 * and pixel warnings measured the way Google truncates. Copy the final title or
 * a ready-to-paste <title> tag, download it, share a link, or step through
 * undo/redo. Everything is client-side.
 */
export default function MetaTitlePreviewTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const history = useHistory<TitleState>(EMPTY);
  const state = history.state;

  const [copied, setCopied] = React.useState<"title" | "tag" | null>(null);

  const share = useShareState({
    onInit: (value) => {
      const parsed = deserialize(value);
      if (parsed) history.reset(parsed);
    },
  });

  const setField = React.useCallback(
    <K extends keyof TitleState>(key: K, value: TitleState[K]) => {
      history.set((prev) => ({ ...prev, [key]: value }));
    },
    [history],
  );

  const loadExample = React.useCallback(
    (value: TitleState) => {
      history.set(value);
    },
    [history],
  );

  const finalTitle = React.useMemo(() => assembleTitle(state), [state]);

  const previewUrl = state.url.trim() || "https://example.com";
  const sampleDesc =
    "This preview focuses on your title tag. The sample description shows how the full result reads.";

  const snippets = React.useMemo(
    () => serpSnippets({ title: finalTitle, url: previewUrl, desc: sampleDesc }),
    [finalTitle, previewUrl],
  );

  const chars = finalTitle.length;
  const truncatedAnywhere =
    snippets.desktop.title.truncated || snippets.mobile.title.truncated;
  const { status, message } = titleStatus(chars, truncatedAnywhere);

  // Front-load check: is the primary keyword sitting behind the brand?
  const frontLoadWarning = React.useMemo(() => {
    const title = state.title.trim();
    const brand = state.brand.trim();
    if (state.separator === "none" || !brand || !title) return null;
    // If the title is short and the brand is long, the "real" keyword is in the suffix.
    if (brand.length > title.length && brand.split(/\s+/).length >= 2) {
      return "Your brand field looks longer than the title: put your primary keyword in the title so it leads the result.";
    }
    return null;
  }, [state.title, state.brand, state.separator]);

  const isEmpty = !state.title && !state.brand && !state.url;

  /** A paste-ready, HTML-escaped <title> tag. */
  const titleTag = React.useMemo(
    () => (finalTitle ? `<title>${escapeHtmlAttr(finalTitle)}</title>` : ""),
    [finalTitle],
  );

  const flashCopied = React.useCallback((which: "title" | "tag") => {
    setCopied(which);
    window.setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyTitle = React.useCallback(async () => {
    if (!finalTitle) return;
    try {
      await navigator.clipboard.writeText(finalTitle);
      flashCopied("title");
    } catch {
      /* clipboard unavailable: Download is the fallback */
    }
  }, [finalTitle, flashCopied]);

  const copyTag = React.useCallback(async () => {
    if (!titleTag) return;
    try {
      await navigator.clipboard.writeText(titleTag);
      flashCopied("tag");
    } catch {
      /* clipboard unavailable */
    }
  }, [titleTag, flashCopied]);

  const doDownload = React.useCallback(() => {
    if (!titleTag) return;
    download("title-tag-gigai.html", titleTag, "text/html;charset=utf-8");
  }, [titleTag]);

  const doShare = React.useCallback(() => {
    void share.copyShareLink(serialize(state));
  }, [share, state]);

  useShortcuts({
    "mod+c": () => void copyTitle(),
    "mod+s": doDownload,
    "mod+z": history.undo,
    "mod+shift+z": history.redo,
    "mod+shift+backspace": () => history.reset(EMPTY),
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+c", description: "Copy the final title" },
    { combo: "mod+s", description: "Download the <title> tag" },
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+shift+backspace", description: "Reset" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      {/* ── Left: inputs ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Title &amp; brand</span>
          <ExamplesMenu<TitleState> examples={EXAMPLES} onPick={(v) => loadExample(v)} />
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/60 p-4">
          <Field
            label="Page title"
            htmlFor="mt-title"
            hint="The core headline for this page. Front-load your primary keyword."
          >
            <input
              id="mt-title"
              type="text"
              value={state.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Best Running Shoes 2026, Tested & Ranked"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <Field label="Brand" htmlFor="mt-brand" hint="Appended after the title. Keep it short.">
              <input
                id="mt-brand"
                type="text"
                value={state.brand}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="TrailLab"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Field label="Separator" htmlFor="mt-sep" hint="How the brand joins.">
              <SelectField<Separator>
                id="mt-sep"
                ariaLabel="Brand separator"
                value={state.separator}
                onChange={(v) => setField("separator", v)}
                options={SEPARATOR_OPTIONS}
                className="w-full sm:w-40"
              />
            </Field>
          </div>

          <Field
            label="URL"
            htmlFor="mt-url"
            hint="Optional, renders the breadcrumb in the preview."
          >
            <input
              id="mt-url"
              type="url"
              inputMode="url"
              value={state.url}
              onChange={(e) => setField("url", e.target.value)}
              placeholder="https://example.com/guides/best-running-shoes"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          {/* Assembled title + readouts */}
          <div className="flex flex-col gap-2 rounded-md border border-border bg-background/60 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Icon name="Type" size={13} className={style.text} />
              Final title
            </div>
            <p className="break-words text-sm font-medium text-foreground">
              {finalTitle || <span className="text-muted-foreground">Your assembled title appears here…</span>}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className={cn("inline-flex items-center gap-1 font-medium", STATUS_TONE[status])}>
                <Icon name={STATUS_ICON[status]} size={12} />
                {chars} chars
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  snippets.desktop.title.truncated ? STATUS_TONE.bad : "text-muted-foreground",
                )}
                title="Desktop pixel width vs. Google's budget"
              >
                {snippets.desktop.title.pixels}px / {snippets.desktop.title.limit}px desktop
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  snippets.mobile.title.truncated ? STATUS_TONE.bad : "text-muted-foreground",
                )}
                title="Mobile pixel width vs. Google's budget"
              >
                {snippets.mobile.title.pixels}px / {snippets.mobile.title.limit}px mobile
              </span>
            </div>
            <p className={cn("text-xs", STATUS_TONE[status])}>{message}</p>
            {frontLoadWarning && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                <Icon name="MoveLeft" size={13} className="mt-0.5 shrink-0" />
                <span>{frontLoadWarning}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action toolbar */}
        <Toolbar>
          <ToolbarButton
            icon={copied === "title" ? "Check" : "Copy"}
            label={copied === "title" ? "Copied!" : "Copy title"}
            kbd="mod+c"
            variant={copied === "title" ? "active" : "primary"}
            onClick={() => void copyTitle()}
            disabled={!finalTitle}
          />
          <ToolbarButton
            icon={copied === "tag" ? "Check" : "Code"}
            label={copied === "tag" ? "Copied!" : "Copy <title>"}
            variant={copied === "tag" ? "active" : "default"}
            onClick={() => void copyTag()}
            disabled={!finalTitle}
          />
          <ToolbarButton
            icon="Download"
            label="Download"
            kbd="mod+s"
            onClick={doDownload}
            disabled={!finalTitle}
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

        <p className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
          <span>
            Everything is measured and previewed on your device with the browser&apos;s own canvas. No
            title, brand or URL is ever uploaded, logged or seen.
          </span>
        </p>
      </div>

      {/* ── Right: live preview ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <PreviewCard label="Desktop result" icon="Monitor">
          <SerpPreview
            device="desktop"
            showToggle={false}
            title={finalTitle}
            url={previewUrl}
            description={sampleDesc}
          />
        </PreviewCard>

        <PreviewCard label="Mobile result" icon="Smartphone">
          <SerpPreview
            device="mobile"
            showToggle={false}
            title={finalTitle}
            url={previewUrl}
            description={sampleDesc}
          />
        </PreviewCard>

        {/* Status summary */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-3">
          <StatBadge
            value={truncatedAnywhere ? "Truncates" : chars === 0 ? "Empty" : "Fits"}
            icon="Ruler"
            tone={
              chars === 0
                ? "default"
                : truncatedAnywhere
                  ? "danger"
                  : status === "warn"
                    ? "warning"
                    : "success"
            }
            title="Whether your title fits Google's desktop and mobile budgets"
          />
          <span className="text-xs text-muted-foreground">
            {chars === 0
              ? "Type a title to see how it renders in Google."
              : truncatedAnywhere
                ? "Trim the title, shorten the brand, or front-load your keyword."
                : status === "warn"
                  ? "It fits, but you're near the limit. Keep an eye on the pixel width."
                  : "Your title fits cleanly on both desktop and mobile."}
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
