"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { nextStepsFor } from "@/lib/workflows";

/**
 * "Continue your workflow" chips for tool done-states. Reads the current tool
 * slug from the pathname (tools are top-level routes), looks up the curated
 * chain in lib/workflows, and renders nothing when no chain exists, so the
 * shells can mount it unconditionally.
 */
export function NextSteps({ className }: { className?: string }) {
  const pathname = usePathname();
  const slug = pathname?.split("/").filter(Boolean)[0] ?? "";
  const steps = nextStepsFor(slug);

  if (steps.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3.5 sm:flex-row sm:items-center",
        className,
      )}
    >
      <p className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon name="Route" size={13} className="text-primary" />
        Continue your workflow
      </p>
      <div className="flex flex-wrap gap-1.5 sm:ml-1">
        {steps.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            title={s.why}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name={s.icon} size={13} className="text-primary" />
            {s.label}
            <Icon
              name="ArrowRight"
              size={11}
              className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
