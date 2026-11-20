"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { shareTargets } from "@/lib/share-targets";

/**
 * Reusable "Share this report" bar for report/analysis tools. Gives a copyable
 * deep-link (the recipient opens it and sees the same report), one-tap share to
 * WhatsApp / Email / X / LinkedIn / Facebook / Telegram, the native share sheet
 * on mobile, and an optional Download. Built so any data→report tool can drop it
 * in after results are ready.
 */
export interface ShareReportProps {
  /** The shareable link: opening it reproduces this report. */
  url: string;
  /** Share title / email subject. */
  title: string;
  /** Short share text (falls back to `title`). */
  text?: string;
  /** Optional download of the full report (e.g. HTML/PDF). */
  onDownload?: () => void;
  downloadLabel?: string;
  className?: string;
}

/* Platform list + official branding come from the shared registry. */
const TARGETS = shareTargets(["whatsapp", "email", "x", "linkedin", "facebook", "telegram"]);

export function ShareReport({
  url,
  title,
  text,
  onDownload,
  downloadLabel = "Download report",
  className,
}: ShareReportProps) {
  const [copied, setCopied] = React.useState(false);
  const shareText = text ?? title;

  const copy = () => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  const canNative = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const nativeShare = () => {
    if (navigator.share) void navigator.share({ title, text: shareText, url }).catch(() => {});
  };

  const chip =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section className={cn("rounded-2xl border border-primary/25 bg-primary/[0.04] p-4 sm:p-5", className)}>
      <div className="flex items-start gap-2.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name="Share2" size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Share this report</h3>
          <p className="text-sm text-muted-foreground">Send it to a client or teammate. They open the link and see the same report.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
          <Icon name="Link" size={14} className="shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{url}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name={copied ? "Check" : "Copy"} size={15} /> {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TARGETS.map((t) => (
          <a
            key={t.key}
            href={t.href(url, title, shareText)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(chip, t.hover)}
          >
            <Icon name={t.icon} size={15} className={t.brand} /> {t.label}
          </a>
        ))}
        {canNative ? (
          <button type="button" onClick={nativeShare} className={cn(chip, "hover:border-primary/40 hover:bg-accent")}>
            <Icon name="Share2" size={15} /> More…
          </button>
        ) : null}
        {onDownload ? (
          <button type="button" onClick={onDownload} className={cn(chip, "border-primary/40 bg-primary/5 hover:bg-primary/10")}>
            <Icon name="Download" size={15} /> {downloadLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
