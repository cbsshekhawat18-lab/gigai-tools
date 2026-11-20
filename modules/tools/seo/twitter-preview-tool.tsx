"use client";

import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { ShareReport, SocialCardPreview, UrlPrefillBar, useDeepLinkUrl } from "@/components/tool/seo";
import { twitterModel } from "@/lib/seo-tools/preview";
import { buildTwitterCard, extractMetaFromHtml } from "@/lib/seo-tools/meta";

/** Host of a URL, sans www: for share titles. */
function hostOf(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
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

/** The X (Twitter) card fields the user edits, one unit of history/share. */
interface Card {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  image: string;
  url: string;
  site: string;
}

/** Input mode: type the fields directly, or paste page HTML to extract them. */
type Mode = "fields" | "html";

const EMPTY: Card = {
  card: "summary_large_image",
  title: "",
  description: "",
  image: "",
  url: "",
  site: "",
};

const SAMPLE: Card = {
  card: "summary_large_image",
  title: "The 12 Best Espresso Machines of 2026, Tested",
  description:
    "We pulled 400 shots across 20 machines to find the best espresso makers for every budget, from $150 starters to prosumer dual-boilers.",
  image: "https://beanbar.coffee/images/best-espresso-2026.jpg",
  url: "https://beanbar.coffee/guides/best-espresso-machines",
  site: "@beanbar",
};

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>How to Cold Brew Coffee at Home | BeanBar</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@beanbar">
  <meta name="twitter:title" content="How to Cold Brew Coffee at Home">
  <meta name="twitter:description" content="A no-fuss cold brew recipe: ratio, grind, steep time and the two mistakes that make it bitter.">
  <meta name="twitter:image" content="https://beanbar.coffee/images/cold-brew.jpg">
  <meta property="og:url" content="https://beanbar.coffee/guides/cold-brew">
</head>
<body></body>
</html>`;

const EXAMPLES: ReadonlyArray<Example<Card>> = [
  {
    label: "Large-image card (ideal)",
    description: "summary_large_image with a full hero image.",
    value: SAMPLE,
    icon: "CircleCheck",
  },
  {
    label: "Summary card",
    description: "Compact square-thumbnail layout.",
    value: {
      card: "summary",
      title: "Contact, Northwind Studio",
      description:
        "Get in touch about design, branding and web projects. We reply within one business day.",
      image: "https://northwind.studio/img/logo-square.png",
      url: "https://northwind.studio/contact",
      site: "@northwindstudio",
    },
    icon: "Image",
  },
  {
    label: "Large card, missing image",
    description: "See how it falls back to a compact card.",
    value: {
      card: "summary_large_image",
      title: "Q3 Product Update: What's New",
      description:
        "A summary_large_image card with no twitter:image. Watch the warnings flag it and the card collapse to the compact layout.",
      image: "",
      url: "https://example.com/blog/q3-update",
      site: "",
    },
    icon: "TriangleAlert",
  },
  {
    label: "Relative image URL (broken)",
    description: "X can't crawl a relative path.",
    value: {
      card: "summary_large_image",
      title: "The Relative-URL Trap",
      description:
        "This card uses /img/hero.png instead of a full https:// URL: the number-one reason cards show no image.",
      image: "/img/hero.png",
      url: "https://example.com/blog/relative-trap",
      site: "",
    },
    icon: "CircleAlert",
  },
];

/** Serialize a card to a compact string for shareable links. */
function serialize(c: Card): string {
  return JSON.stringify(c);
}
function deserialize(raw: string): Card | null {
  try {
    const p = JSON.parse(raw) as Partial<Card>;
    if (p && typeof p === "object") {
      return {
        card: p.card === "summary" ? "summary" : "summary_large_image",
        title: typeof p.title === "string" ? p.title : "",
        description: typeof p.description === "string" ? p.description : "",
        image: typeof p.image === "string" ? p.image : "",
        url: typeof p.url === "string" ? p.url : "",
        site: typeof p.site === "string" ? p.site : "",
      };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** A single audit finding about the current card's tags. */
interface Warning {
  id: string;
  tone: "bad" | "warn";
  message: string;
  fix: string;
}

/** X truncates long titles/descriptions; these are pragmatic soft limits. */
const TITLE_LIMIT = 70;
const DESC_LIMIT = 200;

/**
 * Local audit that catches the mistakes that break X cards. We augment the
 * engine's twitterModel warnings with concrete, fixable checks (image URL
 * scheme, layout fallback, truncation) that are specific to X's crawler.
 */
function auditCard(card: Card): Warning[] {
  const out: Warning[] = [];
  const img = card.image.trim();

  if (!card.title.trim()) {
    out.push({
      id: "no-title",
      tone: "bad",
      message: "No twitter:title: X falls back to og:title or the page <title>.",
      fix: "Add a concise, front-loaded title so the card leads with your hook.",
    });
  } else if (card.title.length > TITLE_LIMIT) {
    out.push({
      id: "title-long",
      tone: "warn",
      message: `Title is ${card.title.length} chars, X clips long titles (~${TITLE_LIMIT}).`,
      fix: "Trim the title so the whole headline survives in the timeline.",
    });
  }

  if (!card.description.trim()) {
    out.push({
      id: "no-desc",
      tone: "warn",
      message: "No twitter:description: the card shows title and image only.",
      fix: "Add a one-line description that earns the click.",
    });
  } else if (card.description.length > DESC_LIMIT) {
    out.push({
      id: "desc-long",
      tone: "warn",
      message: `Description is ${card.description.length} chars: X may truncate it (~${DESC_LIMIT}).`,
      fix: "Tighten the description. The compact card shows even less.",
    });
  }

  if (card.card === "summary_large_image" && !img) {
    out.push({
      id: "large-no-image",
      tone: "bad",
      message: "summary_large_image is set but there's no twitter:image.",
      fix: "Add a public HTTPS image, or the card collapses to the compact summary layout.",
    });
  }

  if (img) {
    const isAbsolute = /^https?:\/\//i.test(img);
    if (!isAbsolute) {
      out.push({
        id: "img-relative",
        tone: "bad",
        message: "twitter:image is a relative path: X can't crawl it.",
        fix: "Use a full absolute URL, e.g. https://example.com/img/hero.jpg.",
      });
    } else if (/^http:\/\//i.test(img)) {
      out.push({
        id: "img-insecure",
        tone: "bad",
        message: "twitter:image uses http://, X requires HTTPS images.",
        fix: "Serve the image over https:// so X will fetch it.",
      });
    }
  }

  if (card.site.trim() && !card.site.trim().startsWith("@")) {
    out.push({
      id: "site-handle",
      tone: "warn",
      message: "twitter:site should be an @handle.",
      fix: "Prefix your account handle with @, e.g. @yourbrand.",
    });
  }

  return out;
}

/** Tone → styling for a warning row. */
const WARN_TONE: Record<Warning["tone"], { text: string; icon: string }> = {
  bad: { text: "text-rose-600 dark:text-rose-400", icon: "CircleX" },
  warn: { text: "text-amber-600 dark:text-amber-400", icon: "TriangleAlert" },
};

/**
 * Twitter (X) Card Preview, enter your twitter:title, description, image and
 * card type (or paste a page's HTML to extract the tags) and see a faithful X
 * card render live, alongside an audit that catches the mistakes that make
 * cards fall back to a bare link. Copy a clean meta block, download it, share a
 * link, or step through undo/redo. Everything is client-side.
 */
export default function TwitterPreviewTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const history = useHistory<Card>(EMPTY);
  const card = history.state;

  const [mode, setMode] = React.useState<Mode>("fields");
  const [html, setHtml] = React.useState("");
  const [extractNote, setExtractNote] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [pageUrl, setPageUrl] = React.useState("");
  const autoUrl = useDeepLinkUrl();

  const share = useShareState({
    onInit: (value) => {
      const parsed = deserialize(value);
      if (parsed) history.reset(parsed);
    },
  });

  const setField = React.useCallback(
    <K extends keyof Card>(key: K, value: Card[K]) => {
      history.set((prev) => ({ ...prev, [key]: value }));
    },
    [history],
  );

  const loadExample = React.useCallback(
    (value: Card) => {
      history.set(value);
      setMode("fields");
    },
    [history],
  );

  /**
   * Parse HTML into the card fields, mirroring X's og:* fallback. Shared by the
   * paste-HTML button and the URL fetcher. Returns what it found (for messaging).
   */
  const extractInto = React.useCallback(
    (sourceHtml: string, fallbackUrl: string): { ok: boolean; found: string[]; usedOg: boolean } => {
      const meta = extractMetaFromHtml(sourceHtml);
      const tw = meta.twitter;
      const og = meta.og;
      const rawCard = tw["card"];
      const image = tw["image"] ?? og["image"] ?? "";
      const next: Card = {
        card: rawCard === "summary" ? "summary" : rawCard === "summary_large_image" ? "summary_large_image" : image ? "summary_large_image" : "summary",
        title: tw["title"] ?? og["title"] ?? meta.title ?? "",
        description: tw["description"] ?? og["description"] ?? meta.description ?? "",
        image,
        url: og["url"] ?? meta.canonical ?? fallbackUrl,
        site: tw["site"] ?? "",
      };
      const found: string[] = [];
      if (next.title) found.push("title");
      if (next.description) found.push("description");
      if (next.image) found.push("image");
      if (rawCard) found.push("card type");
      const usedOg = !tw["title"] && !tw["description"] && !tw["image"] && Boolean(og["title"] || og["description"] || og["image"]);
      if (found.length) {
        history.set(next);
        setMode("fields");
      }
      return { ok: found.length > 0, found, usedOg };
    },
    [history],
  );

  /** Paste-HTML button: extract from the textarea and report what was found. */
  const extractFromHtml = React.useCallback(() => {
    if (!html.trim()) {
      setExtractNote("Paste a page's HTML above first (View Source → copy).");
      return;
    }
    const r = extractInto(html, card.url);
    setExtractNote(
      r.ok
        ? `Extracted ${r.found.join(", ")}${r.usedOg ? " (from og:* fallback tags, exactly as X does)" : ""}.`
        : "No twitter:* or og:* tags found in that HTML: check you pasted the full page source.",
    );
  }, [html, extractInto, card.url]);

  /** URL-first: fetch a page via the proxy, then extract its card tags. */
  const applyFetched = React.useCallback(
    (fetchedHtml: string, finalUrl: string) => {
      setHtml(fetchedHtml);
      const r = extractInto(fetchedHtml, finalUrl);
      if (!r.ok) {
        toast.error("No Twitter Card or Open Graph tags found on that page: paste the HTML or fill the fields.");
        return;
      }
      setPageUrl(finalUrl);
      toast.success(`Loaded card tags from ${hostOf(finalUrl)}${r.usedOg ? " (og:* fallback)" : ""}: review below.`);
    },
    [extractInto],
  );

  const shareLink =
    typeof window !== "undefined" && pageUrl
      ? `${window.location.origin}/${tool.slug}?url=${encodeURIComponent(pageUrl)}`
      : "";

  const model = React.useMemo(
    () =>
      twitterModel({
        card: card.card,
        title: card.title,
        description: card.description,
        image: card.image.trim() || undefined,
        url: card.url,
        site: card.site.trim() || undefined,
      }),
    [card],
  );

  const warnings = React.useMemo(() => auditCard(card), [card]);
  const isEmpty = !card.title && !card.description && !card.image && !card.url;

  /** A clean, copy-ready twitter:card meta block. */
  const metaBlock = React.useMemo(
    () =>
      buildTwitterCard({
        card: card.card,
        title: card.title || undefined,
        description: card.description || undefined,
        image: card.image.trim() || undefined,
        site: card.site.trim() || undefined,
      }),
    [card],
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
    download("twitter-card-gigai.html", metaBlock, "text/html;charset=utf-8");
  }, [metaBlock]);

  const doShare = React.useCallback(() => {
    void share.copyShareLink(serialize(card));
  }, [share, card]);

  useShortcuts({
    "mod+c": () => void copyMeta(),
    "mod+s": doDownload,
    "mod+z": history.undo,
    "mod+shift+z": history.redo,
    "mod+shift+backspace": () => history.reset(EMPTY),
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+c", description: "Copy the twitter:card meta block" },
    { combo: "mod+s", description: "Download the meta block" },
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+shift+backspace", description: "Reset" },
  ];

  const errorCount = warnings.filter((w) => w.tone === "bad").length;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      {/* ── Left: inputs ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Icon name="Globe" size={13} className="text-primary" />
            Start from a URL; we load the page&rsquo;s existing card tags
          </p>
          <UrlPrefillBar actionLabel="Fetch & fill" autoUrl={autoUrl} onHtml={applyFetched} />
        </div>
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
          <ExamplesMenu<Card> examples={EXAMPLES} onPick={(v) => loadExample(v)} />
        </div>

        {mode === "fields" ? (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/60 p-4">
            <Field label="Card type" htmlFor="tw-card" hint="Large image gives your link far more presence.">
              <SegmentedControl<Card["card"]>
                value={card.card}
                onChange={(v) => setField("card", v)}
                ariaLabel="Twitter card type"
                options={[
                  { value: "summary_large_image", label: "Large image", icon: "Image" },
                  { value: "summary", label: "Summary", icon: "Square" },
                ]}
              />
            </Field>

            <Field
              label="Title (twitter:title)"
              htmlFor="tw-title"
              hint="Keep it punchy, X clips long titles."
            >
              <input
                id="tw-title"
                type="text"
                value={card.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="The 12 Best Espresso Machines of 2026, Tested"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <CharCount length={card.title.length} limit={TITLE_LIMIT} />
            </Field>

            <Field
              label="Description (twitter:description)"
              htmlFor="tw-desc"
              hint="One compelling line that earns the click."
            >
              <textarea
                id="tw-desc"
                value={card.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
                placeholder="Summarize the page in a line that reads well even if the last words are cut."
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <CharCount length={card.description.length} limit={DESC_LIMIT} />
            </Field>

            <Field
              label="Image URL (twitter:image)"
              htmlFor="tw-image"
              hint="Absolute HTTPS URL. ~1200×628 for large cards."
            >
              <input
                id="tw-image"
                type="url"
                inputMode="url"
                value={card.image}
                onChange={(e) => setField("image", e.target.value)}
                placeholder="https://example.com/images/hero.jpg"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Page URL" htmlFor="tw-url" hint="Shown as the card's source domain.">
                <input
                  id="tw-url"
                  type="url"
                  inputMode="url"
                  value={card.url}
                  onChange={(e) => setField("url", e.target.value)}
                  placeholder="https://example.com/guides/best-espresso"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
              <Field label="Site handle (twitter:site)" htmlFor="tw-site" hint="Your @account (optional).">
                <input
                  id="tw-site"
                  type="text"
                  value={card.site}
                  onChange={(e) => setField("site", e.target.value)}
                  placeholder="@yourbrand"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/60 p-4">
            <CodePane
              value={html}
              onChange={setHtml}
              label="Paste page HTML"
              ariaLabel="Page HTML to extract Twitter card tags from"
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
                Pasted HTML is parsed entirely on your device. Prefer to just enter a URL? Use the bar
                at the top; we fetch the page once on our server, parse it in your browser, and store nothing.
              </span>
            </p>
          </div>
        )}

        {/* Action toolbar */}
        <Toolbar>
          <ToolbarButton
            icon={copied ? "Check" : "Copy"}
            label={copied ? "Copied!" : "Copy tags"}
            kbd="mod+c"
            variant={copied ? "active" : "primary"}
            onClick={() => void copyMeta()}
            disabled={isEmpty}
          />
          <ToolbarButton icon="Download" label="Download" kbd="mod+s" onClick={doDownload} disabled={isEmpty} />
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
          <ToolbarButton icon="RotateCcw" label="Reset" onClick={() => history.reset(EMPTY)} disabled={isEmpty} />
          <ToolbarSpacer />
          <ShortcutsHelp shortcuts={shortcuts} />
        </Toolbar>

        {share.shareError && (
          <p className="text-xs text-rose-600 dark:text-rose-400">{share.shareError}</p>
        )}
      </div>

      {/* ── Right: live preview + audit ──────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
            <Icon name="Twitter" size={13} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">X (Twitter) card preview</span>
          </div>
          <div className="p-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                <Icon name="Twitter" size={26} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Your card will appear here</p>
                <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Fill in a title, description and image on the left, or paste your page&apos;s HTML, to
                  see a live X card. Nothing is uploaded.
                </p>
              </div>
            ) : (
              <SocialCardPreview
                platform="twitter"
                showToggle={false}
                card={model.large ? "summary_large_image" : "summary"}
                title={card.title}
                description={card.description}
                image={card.image.trim() || undefined}
                url={card.url || "https://example.com"}
                siteName={card.site.trim() || undefined}
              />
            )}
          </div>
        </div>

        {/* Warnings audit */}
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatBadge
              value={warnings.length === 0 ? "No issues" : `${warnings.length} issue${warnings.length === 1 ? "" : "s"}`}
              icon={warnings.length === 0 ? "CircleCheck" : errorCount > 0 ? "CircleX" : "TriangleAlert"}
              tone={warnings.length === 0 ? "success" : errorCount > 0 ? "danger" : "warning"}
              title="Twitter card tag audit"
            />
            {card.card === "summary_large_image" && !card.image.trim() && !isEmpty && (
              <StatBadge value="Falls back to summary" icon="Square" tone="warning" />
            )}
          </div>

          {isEmpty ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Enter your card details and we&apos;ll audit the tags for the mistakes that make X cards
              show no image or collapse to a bare link.
            </p>
          ) : warnings.length === 0 ? (
            <p className="flex items-start gap-2 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
              <Icon name="CircleCheck" size={14} className="mt-0.5 shrink-0" />
              <span>Your tags look good, X should render this card with your title, description and image.</span>
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {warnings.map((w) => {
                const tone = WARN_TONE[w.tone];
                return (
                  <li key={w.id} className="flex items-start gap-2 text-xs leading-relaxed">
                    <Icon name={tone.icon} size={14} className={cn("mt-0.5 shrink-0", tone.text)} />
                    <span>
                      <span className={cn("font-medium", tone.text)}>{w.message}</span>{" "}
                      <span className="text-muted-foreground">{w.fix}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {model.warnings.length > 0 && (
            <p className="mt-3 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
              {model.warnings.join(" ")}
            </p>
          )}
        </div>

        {shareLink ? (
          <ShareReport
            url={shareLink}
            title={`X (Twitter) card, ${hostOf(pageUrl)}`}
            text={`X (Twitter) card preview for ${hostOf(pageUrl)} (via GigAI)`}
          />
        ) : null}
      </div>
    </div>
  );
}

/** A tiny character counter with amber/red status past the soft limit. */
function CharCount({ length, limit }: { length: number; limit: number }) {
  const tone =
    length === 0
      ? "text-muted-foreground"
      : length > limit
        ? "text-rose-600 dark:text-rose-400"
        : length > limit * 0.9
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground";
  return (
    <span className={cn("mt-1.5 block text-xs tabular-nums", tone)}>
      {length} / {limit} chars
    </span>
  );
}
