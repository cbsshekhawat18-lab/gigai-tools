"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/config/constants";
import { useCopilotExtension } from "@/hooks/use-copilot-extension";

/**
 * Reverse-bridge CTA for the GigAI Copilot browser extension. Two honest
 * states: installed → a quiet "you already have it" chip with a usage tip;
 * not installed → a compact invitation to /extension. Rendered only where the
 * extension genuinely saves a step (SEO tool pages), never as a site-wide ad.
 */
export function CopilotCta({ className }: { className?: string }) {
  const { installed, version } = useCopilotExtension();

  if (installed) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200",
          className,
        )}
      >
        <Icon name="CircleCheck" size={18} className="shrink-0" />
        <p>
          <span className="font-semibold">GigAI Copilot installed{version && version !== "unknown" ? ` · v${version}` : ""}.</span>{" "}
          Click its toolbar icon on any page to audit it: fixes open this site pre-filled.
        </p>
      </div>
    );
  }

  return (
    <Link
      href={ROUTES.extension}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/70",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 text-white">
        <Icon name="Sparkles" size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Do this from any page, get GigAI Copilot</span>
        <span className="block text-xs text-muted-foreground">
          Our free browser extension audits the page you&apos;re on and opens tools like this one with the data already filled in. 100% private, runs on your device.
        </span>
      </span>
      <Icon name="ArrowRight" size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
