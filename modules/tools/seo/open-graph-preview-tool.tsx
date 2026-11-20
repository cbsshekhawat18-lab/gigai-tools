"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  SegmentedControl,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SocialCardPreview,
  type SocialPlatform,
} from "@/components/tool/seo";
import { buildOpenGraph, extractMetaFromHtml } from "@/lib/seo-tools/meta";
import { ogModel } from "@/lib/seo-tools/preview";
import { fetchPage, urlFetchEnabled } from "@/lib/seo-tools/fetch-url";

/**
 * Open Graph Preview, inspect & validate an existing page's social share card.
 *
 * Two ways in, one shared model. In **Paste** mode the user pastes a page's
 * HTML and `extractMetaFromHtml` (native DOMParser, in-browser) pulls the og:*
 * and twitter:* tags into the same `OgState` a **Fields**-mode user types by
 * hand. From that single state we render a faithful Facebook / LinkedIn share
 * card (`<SocialCardPreview>`), a live missing-tag audit (`ogModel` warnings +
 * our own og:url / image-ratio checks), and a clean copy-ready Open Graph block
 * (`buildOpenGraph`). `<GeneratorWithPreview>` owns the toolbar, undo/redo,
 * share links, presets and shortcuts; this module owns only the data, the audit
 * and how it all renders. Nothing is uploaded, and we never fetch live URLs.
 */

/* --------------------------------- state ---------------------------------- */

type InputMode = "url" | "paste" | "fields";

interface OgState {
  /** Which entry mode is active. Part of state so Reset/Share restore it. */
  mode: InputMode;
  /** Raw pasted HTML (Paste mode). */
  html: string;
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  imageWidth: string;
  imageHeight: string;
  /** UI-only: which card layout to emulate. */
  card: "summary" | "summary_large_image";
}

const INITIAL: OgState = {
  mode: "paste",
  html: "",
  title: "",
  description: "",
  url: "",
  image: "",
  siteName: "",
  imageWidth: "",
  imageHeight: "",
  card: "summary_large_image",
};

/* ------------------------- HTML → fields extraction ------------------------ */

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <title>Fathom, Privacy-First Web Analytics Without Cookies</title>
  <meta name="description" content="Simple, fast, GDPR-compliant website analytics with no cookies and no consent banners.">

  <!-- Open Graph -->
  <meta property="og:title" content="Fathom, Privacy-First Web Analytics">
  <meta property="og:description" content="Simple, fast, GDPR-compliant analytics with no cookies and no consent banners. See what matters in one clean dashboard.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://usefathom.example.com/">
  <meta property="og:image" content="https://usefathom.example.com/og/home-1200x630.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Fathom Analytics">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@usefathom">
</head>
<body></body>
</html>`;

/**
 * Merge the tags parsed from HTML into an OgState, preferring og:* over the
 * plain <title>/description, exactly as Facebook and LinkedIn do.
 */
function stateFromHtml(html: string, prev: OgState): OgState {
  const meta = extractMetaFromHtml(html);
  const og = meta.og;
  const tw = meta.twitter;
  const card = tw["card"] === "summary" ? "summary" : "summary_large_image";
  return {
    ...prev,
    mode: "paste",
    html,
    title: og["title"] ?? meta.title ?? "",
    description: og["description"] ?? meta.description ?? "",
    url: og["url"] ?? meta.canonical ?? "",
    image: og["image"] ?? "",
    siteName: og["site_name"] ?? "",
    imageWidth: og["image:width"] ?? "",
    imageHeight: og["image:height"] ?? "",
    card,
  };
}

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<OgState>> = [
  {
    label: "Paste HTML",
    description: "A complete page head to parse",
    icon: "ClipboardPaste",
    value: stateFromHtml(SAMPLE_HTML, INITIAL),
  },
  {
    label: "Article (fields)",
    description: "A blog post with a large image",
    icon: "FileText",
    value: {
      ...INITIAL,
      mode: "fields",
      title: "The Open Graph Protocol, Explained in 5 Minutes",
      description:
        "A plain-English tour of og:title, og:description, og:image and og:url, and how they turn a bare link into a rich card on every social platform.",
      url: "https://example.com/blog/open-graph-explained",
      image: "https://example.com/images/open-graph-explained-1200x630.png",
      siteName: "Example Blog",
      imageWidth: "1200",
      imageHeight: "630",
      card: "summary_large_image",
    },
  },
  {
    label: "Broken share",
    description: "Missing image, see the audit fire",
    icon: "TriangleAlert",
    value: {
      ...INITIAL,
      mode: "fields",
      title: "Our Big Announcement",
      description: "",
      url: "/blog/announcement",
      image: "",
      siteName: "Example",
      card: "summary_large_image",
    },
  },
];

/* ----------------------------- audit modelling ---------------------------- */

type Tone = "good" | "warn" | "bad";

interface AuditItem {
  tone: Tone;
  label: string;
  detail: string;
}

/** True when a URL is an absolute http(s) URL a network can cache by. */
function isAbsoluteUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** og:image ratio/size check against the 1.91:1 (1200×630) large-card ideal. */
function imageDimAudit(image: string, w: string, h: string): AuditItem | null {
  if (!image.trim()) return null;
  if (!w.trim() || !h.trim())
    return {
      tone: "warn",
      label: "og:image dimensions",
      detail:
        "No og:image:width/height set. They're optional, but declaring 1200×630 helps networks render the large card immediately.",
    };
  const width = Number(w);
  const height = Number(h);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    return { tone: "bad", label: "og:image dimensions", detail: "Width and height must be positive numbers." };
  if (width < 200 || height < 200)
    return {
      tone: "bad",
      label: "og:image too small",
      detail: `${width}×${height}px is below the 200×200 minimum. Facebook and LinkedIn will skip an image this small.`,
    };
  const ratio = width / height;
  const ideal = 1200 / 630; // ≈ 1.905
  if (Math.abs(ratio - ideal) / ideal <= 0.06)
    return {
      tone: "good",
      label: "og:image ratio",
      detail: `${width}×${height} (${ratio.toFixed(2)}:1): perfect for the large card.`,
    };
  if (ratio >= 0.9 && ratio <= 1.1)
    return {
      tone: "warn",
      label: "og:image ratio",
      detail: `${width}×${height} is near-square. It renders as a small thumbnail, not the large card.`,
    };
  return {
    tone: "warn",
    label: "og:image ratio",
    detail: `${width}×${height} (${ratio.toFixed(2)}:1): aim for 1.91:1 (e.g. 1200×630) to avoid letter-boxing.`,
  };
}

/** Build the full audit for the current state. */
function buildAudit(s: OgState): AuditItem[] {
  const items: AuditItem[] = [];

  // Core warnings from the shared engine model (missing title/image/desc + clip).
  const model = ogModel({
    title: s.title,
    description: s.description,
    image: s.image,
    url: s.url,
    siteName: s.siteName,
  });
  for (const w of model.warnings) {
    const bad = /missing og:image|missing og:title/i.test(w);
    items.push({
      tone: bad ? "bad" : "warn",
      label: /image/i.test(w) ? "og:image" : /title/i.test(w) ? "og:title" : /description/i.test(w) ? "og:description" : "Open Graph",
      detail: w,
    });
  }

  // og:url presence + absoluteness (networks key their cache on it).
  if (!s.url.trim()) {
    items.push({
      tone: "warn",
      label: "og:url",
      detail: "No og:url set. Add the page's absolute canonical URL, networks use it to identify and cache the share.",
    });
  } else if (!isAbsoluteUrl(s.url.trim())) {
    items.push({
      tone: "bad",
      label: "og:url",
      detail: "og:url must be an absolute URL (https://…). A relative path can't be resolved or cached by social networks.",
    });
  }

  // og:site_name is a nice-to-have.
  if (!s.siteName.trim()) {
    items.push({
      tone: "warn",
      label: "og:site_name",
      detail: "No og:site_name. Optional, but it shows your brand as the source line above the headline on some networks.",
    });
  }

  // Image size / ratio.
  const dim = imageDimAudit(s.image, s.imageWidth, s.imageHeight);
  if (dim) items.push(dim);

  // Everything present and healthy.
  const hasFail = items.some((i) => i.tone !== "good");
  if (!hasFail) {
    items.unshift({
      tone: "good",
      label: "Open Graph",
      detail: "All the essential Open Graph tags are present and well-formed. This link will unfurl as a rich card.",
    });
  }

  return items;
}

/* ------------------------------ code assembly ----------------------------- */

/** Assemble a clean, copy-ready Open Graph block from state. */
function generateCode(s: OgState): string {
  const og = buildOpenGraph({
    title: s.title,
    description: s.description,
    url: s.url,
    image: s.image,
    imageWidth: s.imageWidth.trim() || undefined,
    imageHeight: s.imageHeight.trim() || undefined,
    siteName: s.siteName,
  });
  if (!og.trim()) return "";
  return `<!-- Open Graph / Facebook / LinkedIn -->\n${og}`;
}

/* ------------------------------ small inputs ------------------------------ */

const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        spellCheck={false}
      />
    </Field>
  );
}

function SectionHead({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon name={icon} size={13} />
      {children}
    </div>
  );
}

const toneIcon: Record<Tone, string> = { good: "CircleCheck", warn: "TriangleAlert", bad: "XCircle" };
const toneColor: Record<Tone, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-rose-600 dark:text-rose-400",
};

/** The live audit panel: one row per issue, color-coded by severity. */
function AuditPanel({ items }: { items: AuditItem[] }) {
  return (
    <ul className="flex flex-col gap-1.5" aria-label="Open Graph audit">
      {items.map((it, i) => (
        <li
          key={`${it.label}-${i}`}
          className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 px-2.5 py-2"
        >
          <Icon name={toneIcon[it.tone]} size={15} className={cn("mt-0.5 shrink-0", toneColor[it.tone])} />
          <span className="min-w-0 text-xs leading-relaxed">
            <span className="font-medium text-foreground">{it.label}</span>
            <span className="text-muted-foreground"> - {it.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- tool ----------------------------------- */

export default function OpenGraphPreviewTool({ tool }: { tool: WorkspaceToolData }) {
  const canFetch = urlFetchEnabled();
  const [state, setState] = React.useState<OgState>(() => ({
    ...INITIAL,
    mode: canFetch ? "url" : "paste",
  }));
  const [platform, setPlatform] = React.useState<SocialPlatform>("facebook");

  // URL mode: fetch the page and auto-fill every og:/twitter: field we find.
  const [fetchUrl, setFetchUrl] = React.useState("");
  const [fetching, setFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const set = React.useCallback(
    <K extends keyof OgState>(key: K) =>
      (value: OgState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // Paste mode: re-parse the HTML into the shared field state on every edit.
  const onHtmlChange = React.useCallback((html: string) => {
    setState((prev) => stateFromHtml(html, prev));
  }, []);

  // URL mode: fetch → parse → show the filled Fields so the user tweaks only
  // what's missing (the "auto-fetch, ask only for the gaps" flow).
  const fetchFromUrl = React.useCallback(async () => {
    if (!fetchUrl.trim() || fetching) return;
    setFetching(true);
    setFetchError(null);
    try {
      const page = await fetchPage(fetchUrl);
      setState((prev) => ({ ...stateFromHtml(page.html, prev), mode: "fields" }));
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Couldn't fetch that URL.");
    } finally {
      setFetching(false);
    }
  }, [fetchUrl, fetching]);

  const code = React.useMemo(() => generateCode(state), [state]);
  const audit = React.useMemo(() => buildAudit(state), [state]);

  const counts = React.useMemo(() => {
    let good = 0;
    let warn = 0;
    let bad = 0;
    for (const it of audit) {
      if (it.tone === "good") good += 1;
      else if (it.tone === "warn") warn += 1;
      else bad += 1;
    }
    return { good, warn, bad };
  }, [audit]);

  const previewTitle = state.title || "Your Open Graph title appears here";
  const previewDescription =
    state.description ||
    "Your og:description shows up here as the summary line beneath the headline in the share card.";
  const previewUrl = state.url || "https://example.com/page";

  const stats = (
    <>
      <StatBadge label="Mode" value={state.mode === "url" ? "From URL" : state.mode === "paste" ? "Paste HTML" : "Fields"} tone="default" />
      <StatBadge label="Passing" value={`${counts.good}`} tone={counts.good > 0 ? "success" : "default"} />
      <StatBadge label="Warnings" value={`${counts.warn}`} tone={counts.warn > 0 ? "warning" : "default"} />
      <StatBadge label="Errors" value={`${counts.bad}`} tone={counts.bad > 0 ? "danger" : "default"} />
    </>
  );

  const form = (
    <div className="flex flex-col gap-3">
      <Field
        label="Where are your tags from?"
        htmlFor="og-mode"
        hint="Fetch a live URL, paste a page's HTML, or type the fields to plan a new page."
      >
        <SegmentedControl<InputMode>
          value={state.mode}
          onChange={set("mode")}
          ariaLabel="Input mode"
          options={[
            ...(canFetch ? [{ value: "url" as const, label: "From URL" }] : []),
            { value: "paste" as const, label: "Paste HTML" },
            { value: "fields" as const, label: "Fields" },
          ]}
        />
      </Field>

      {state.mode === "url" ? (
        <div className="flex flex-col gap-2">
          <Field
            label="Page URL"
            htmlFor="og-url-fetch"
            hint="We fetch the page on our edge, read its og:/twitter: tags, and store nothing."
          >
            <div className="flex gap-2">
              <input
                id="og-url-fetch"
                type="url"
                inputMode="url"
                value={fetchUrl}
                onChange={(e) => setFetchUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void fetchFromUrl();
                  }
                }}
                placeholder="https://example.com/page"
                autoComplete="off"
                spellCheck={false}
                className={cn(inputClass, "flex-1")}
              />
              <button
                type="button"
                onClick={() => void fetchFromUrl()}
                disabled={fetching || !fetchUrl.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                <Icon name={fetching ? "LoaderCircle" : "Search"} size={15} className={fetching ? "animate-spin" : ""} />
                Fetch &amp; check
              </button>
            </div>
          </Field>
          {fetchError ? (
            <p className="flex items-start gap-1.5 text-xs text-destructive">
              <Icon name="TriangleAlert" size={13} className="mt-0.5 shrink-0" />
              {fetchError} - or switch to Paste HTML.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter your page&apos;s URL and we&apos;ll pull in its share tags automatically, then show exactly what&apos;s
              missing to fix. No HTML to hunt down.
            </p>
          )}
        </div>
      ) : state.mode === "paste" ? (
        <>
          <Field
            label="Page HTML"
            htmlFor="og-html"
            hint="View source (Ctrl+U / Cmd+Option+U), copy and paste. We parse og:* and twitter:* tags locally. No fetch, nothing uploaded."
          >
            <textarea
              id="og-html"
              value={state.html}
              rows={10}
              placeholder={"<head>\n  <meta property=\"og:title\" content=\"…\">\n  <meta property=\"og:image\" content=\"https://…\">\n</head>"}
              onChange={(e) => onHtmlChange(e.target.value)}
              className={cn(inputClass, "h-auto resize-y py-1.5 font-mono text-xs leading-snug")}
              spellCheck={false}
            />
          </Field>
          <button
            type="button"
            onClick={() => onHtmlChange(SAMPLE_HTML)}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Icon name="FileCode" size={13} />
            Load sample HTML
          </button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            We deliberately never fetch live URLs. Browsers can&apos;t fetch arbitrary sites (CORS), and we run no
            server, so your pages stay private. Parsed values populate the preview and audit below; switch to Fields to
            tweak them.
          </p>
        </>
      ) : (
        <>
          <SectionHead icon="Type">Core Open Graph</SectionHead>
          <TextField
            id="og-title"
            label={<>og:title</>}
            hint="The bold headline of the share card. Keep it under ~88 characters."
            value={state.title}
            onChange={set("title")}
            placeholder="The Open Graph Protocol, Explained in 5 Minutes"
          />
          <Field label="og:description" htmlFor="og-desc" hint="The summary line under the headline (~200 chars shown).">
            <textarea
              id="og-desc"
              value={state.description}
              rows={3}
              placeholder="A plain-English tour of og:title, og:description, og:image and og:url…"
              onChange={(e) => set("description")(e.target.value)}
              className={cn(inputClass, "h-auto resize-y py-1.5 leading-snug")}
              spellCheck
            />
          </Field>
          <TextField
            id="og-url"
            label={<>og:url</>}
            hint="The canonical, absolute URL. Networks use it to identify and cache the share."
            value={state.url}
            onChange={set("url")}
            placeholder="https://example.com/page"
            type="url"
          />
          <TextField
            id="og-site"
            label="og:site_name (optional)"
            hint="Your brand, shown as the source line above the headline."
            value={state.siteName}
            onChange={set("siteName")}
            placeholder="Example"
          />

          <SectionHead icon="Image">og:image</SectionHead>
          <TextField
            id="og-image"
            label="og:image URL"
            hint="A public https URL. Use a landscape 1200×630px image for the large card."
            value={state.image}
            onChange={set("image")}
            placeholder="https://example.com/og-image-1200x630.png"
            type="url"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              id="og-image-w"
              label="og:image:width (optional)"
              value={state.imageWidth}
              onChange={set("imageWidth")}
              placeholder="1200"
              inputMode="numeric"
            />
            <TextField
              id="og-image-h"
              label="og:image:height (optional)"
              value={state.imageHeight}
              onChange={set("imageHeight")}
              placeholder="630"
              inputMode="numeric"
            />
          </div>
        </>
      )}

      <SectionHead icon="ListChecks">Audit</SectionHead>
      <AuditPanel items={audit} />
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon name="Share2" size={13} />
        How your link unfurls when shared
      </div>
      <SocialCardPreview
        title={previewTitle}
        description={previewDescription}
        image={state.image || undefined}
        url={previewUrl}
        siteName={state.siteName || undefined}
        card={state.card}
        platform={platform}
        onPlatformChange={setPlatform}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        A faithful mock of the Facebook and LinkedIn feed cards. After you deploy your fixed tags, re-scrape the URL with
        Facebook&apos;s Sharing Debugger or LinkedIn&apos;s Post Inspector so each network refreshes its cached card.
      </p>
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<OgState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="HTML"
        form={form}
        preview={preview}
        previewLabel="Live Facebook & LinkedIn preview"
        downloadName="open-graph.html"
        downloadMime="text/html;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        error={
          code.trim()
            ? null
            : state.mode === "paste"
              ? "Paste a page's HTML (or load the sample) to preview and audit its Open Graph tags."
              : "Fill in at least an og:title, og:image or og:url to preview the share card."
        }
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<OgState>;
            if (!parsed || typeof parsed !== "object") return null;
            return { ...INITIAL, ...parsed };
          } catch {
            return null;
          }
        }}
      />
    </section>
  );
}
