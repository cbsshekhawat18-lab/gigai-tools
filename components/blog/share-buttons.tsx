"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { shareTargets } from "@/lib/share-targets";

export interface ShareButtonsProps {
  /** Absolute URL to share. */
  url: string;
  /** Post title, used as share text. */
  title: string;
  /** "rail" = sticky vertical (desktop), "inline" = horizontal row. */
  variant?: "rail" | "inline";
  className?: string;
}

/* Platform list + official branding come from the shared registry. */
const TARGETS = shareTargets(["x", "facebook", "linkedin", "whatsapp", "reddit", "email"]);

export function ShareButtons({ url, title, variant = "inline", className }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  React.useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(copyTimer.current), []);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no-op */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const handleNativeShare = React.useCallback(async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* user dismissed: no-op */
    }
  }, [title, url]);

  const isRail = variant === "rail";

  const itemClass = cn(
    "inline-flex items-center justify-center rounded-full border border-border bg-card transition-all",
    "hover:-translate-y-0.5 hover:shadow-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "size-11",
  );

  const links = TARGETS.map((t) => (
    <li key={t.key}>
      <a
        href={t.href(url, title)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share on ${t.label}`}
        title={`Share on ${t.label}`}
        className={cn(itemClass, t.brand, t.hover)}
      >
        <Icon name={t.icon} size={17} />
      </a>
    </li>
  ));

  return (
    <div
      className={cn(
        isRail ? "lg:sticky lg:top-24" : "",
        className,
      )}
    >
      {isRail ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Share
        </p>
      ) : null}

      <ul
        className={cn(
          "flex flex-wrap items-center gap-2",
          isRail && "lg:flex-col lg:flex-nowrap",
        )}
      >
        {canNativeShare ? (
          <li>
            <button
              type="button"
              onClick={handleNativeShare}
              aria-label="Share"
              title="Share"
              className={cn(itemClass, "text-muted-foreground hover:border-primary/40 hover:text-primary")}
            >
              <Icon name="Share2" size={17} />
            </button>
          </li>
        ) : null}

        {links}

        <li>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Link copied" : "Copy link"}
            title={copied ? "Copied!" : "Copy link"}
            aria-live="polite"
            className={cn(
              itemClass,
              "text-muted-foreground hover:border-primary/40 hover:text-primary",
              copied && "border-primary/50 text-primary",
            )}
          >
            <Icon name={copied ? "Check" : "Link"} size={17} />
          </button>
        </li>
      </ul>
    </div>
  );
}
