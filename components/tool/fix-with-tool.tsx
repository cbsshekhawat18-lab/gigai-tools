"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

/**
 * Cross-tool guidance. When a tool detects a fixable problem that ANOTHER GigAI
 * tool solves, don't just show the error, point the user to the fix. Drop this
 * in beside a warning to turn a dead-end into a workflow (e.g. a QR logo that's
 * too big → "Prep a better logo" → Image Resizer / Image Compressor).
 *
 * Reusable across any tool: pass a short prompt + the tools that help. Every
 * href is a real top-level tool route.
 */
export interface FixTool {
  slug: string;
  label: string;
  /** lucide icon name. */
  icon: string;
  /** Tooltip: why this helps. */
  why?: string;
}

export function FixWithTool({
  tools,
  prompt = "Fix this faster with",
  className,
}: {
  tools: FixTool[];
  prompt?: string;
  className?: string;
}) {
  if (tools.length === 0) return null;
  return (
    <div className={cn("mt-2 rounded-lg border border-primary/25 bg-primary/[0.05] p-2.5", className)}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
        <Icon name="Lightbulb" size={12} className="text-primary" /> {prompt}:
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}`}
            title={t.why}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name={t.icon} size={13} className="text-primary" />
            {t.label}
            <Icon name="ArrowUpRight" size={11} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
