"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { fetchPage, urlFetchEnabled } from "@/lib/seo-tools/fetch-url";

/**
 * Reusable "URL-first" input bar for SEO tools. The user pastes a page URL, we
 * fetch it once through the edge proxy (stateless, fetches, returns, stores
 * nothing) and hand the HTML + headers back so the tool can auto-fill / analyse.
 *
 * This is the single, consistent front door for every URL-driven SEO tool: same
 * privacy promise, same graceful fallback (a one-click "grab HTML" bookmarklet)
 * when a page blocks automated requests or no proxy is configured. Drop it at the
 * top of a tool and react to `onHtml`.
 */
/**
 * Read a `?url=` deep-link once on mount. Pair with {@link UrlPrefillBar}'s
 * `autoUrl` so opening `/tool?url=…` auto-fetches and reproduces a shared result.
 */
export function useDeepLinkUrl(): string | undefined {
  const [url, setUrl] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("url");
    if (p && /^https?:\/\//i.test(p)) setUrl(p);
  }, []);
  return url;
}

export interface UrlPrefillBarProps {
  /** Called with the fetched page once available. */
  onHtml: (html: string, finalUrl: string, headers: Record<string, string>) => void;
  /** Button label. */
  actionLabel?: string;
  placeholder?: string;
  /** One-line helper shown under the bar (overrides the default privacy note). */
  hint?: React.ReactNode;
  /** Auto-fetch this URL once on mount (deep-link support, e.g. ?url=…). */
  autoUrl?: string;
  className?: string;
}

export function UrlPrefillBar({
  onHtml,
  actionLabel = "Fetch",
  placeholder = "https://example.com/page",
  hint,
  autoUrl,
  className,
}: UrlPrefillBarProps) {
  const [url, setUrl] = React.useState(autoUrl ?? "");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const enabled = urlFetchEnabled();

  const run = React.useCallback(
    async (target?: string) => {
      const clean = (target ?? url).trim();
      setNotice(null);
      if (!clean) {
        setNotice("Enter a page URL to fetch.");
        return;
      }
      if (!enabled) {
        setNotice(
          "Live URL fetch needs our server (browsers block cross-origin reads). Use the “Grab HTML” bookmarklet, or fill the form below manually.",
        );
        return;
      }
      setBusy(true);
      try {
        const page = await fetchPage(clean);
        onHtml(page.html, page.finalUrl, page.headers);
      } catch (e) {
        setNotice(
          `${e instanceof Error ? e.message : "Couldn't fetch that URL."} You can grab the page's HTML with the bookmarklet below, or fill the form manually.`,
        );
      } finally {
        setBusy(false);
      }
    },
    [url, enabled, onHtml],
  );

  // Deep-link: auto-run once when an initial URL is supplied.
  const ran = React.useRef(false);
  React.useEffect(() => {
    if (autoUrl && enabled && !ran.current) {
      ran.current = true;
      void run(autoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUrl, enabled]);

  const copyBookmarklet = () => {
    const code =
      "javascript:(function(){navigator.clipboard.writeText(document.documentElement.outerHTML);alert('HTML copied. Paste it into the GigAI tool.');})()";
    void navigator.clipboard.writeText(code);
    setNotice("Bookmarklet copied. Make a new bookmark, paste it as the URL, then click it on any page to copy that page's HTML.");
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
          <Icon name="Link" size={15} className="shrink-0 text-muted-foreground" />
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void run()}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Icon name="LoaderCircle" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
          {busy ? "Fetching…" : actionLabel}
        </button>
      </div>

      {notice ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p>{notice}</p>
            <button type="button" onClick={copyBookmarklet} className="rounded border border-border bg-background px-2 py-1 font-medium text-foreground hover:bg-accent">
              Copy “Grab HTML” bookmarklet
            </button>
          </div>
        </div>
      ) : hint ? (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">{hint}</p>
      ) : enabled ? (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <Icon name="ShieldCheck" size={13} className="mt-0.5 shrink-0 text-primary" />
          We fetch the page once on our server to read its public HTML, use it in your browser, and store nothing.
        </p>
      ) : null}
    </div>
  );
}
