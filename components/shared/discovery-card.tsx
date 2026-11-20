"use client";

import Link from "next/link";

import type { AccentKey, IconName } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";

/** A tiny, registry-free descriptor for a preview icon on a discovery card. */
export interface DiscoveryPreviewIcon {
  slug: string;
  icon: IconName;
  accent?: AccentKey;
}

export interface DiscoveryCardProps {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  accent?: AccentKey;
  /** e.g. "12 tools", the count footer. */
  meta?: string;
  /** Up to a handful of member-tool icons shown as a stacked preview. */
  previewIcons?: DiscoveryPreviewIcon[];
  /** Small kicker above the title (e.g. audience). */
  eyebrow?: string;
  className?: string;
}

/**
 * The canonical tile for a *group* of tools, a collection, an audience
 * use-case, or any curated cluster. Fully registry-free: a server parent
 * derives the slim props from `lib/discovery` and passes them in.
 */
export function DiscoveryCard({
  href,
  title,
  description,
  icon,
  accent,
  meta,
  previewIcons,
  eyebrow,
  className,
}: DiscoveryCardProps) {
  const style = accentStyle(accent);

  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        "block h-full rounded-2xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-[0.08]",
            style.gradient,
          )}
        />

        <div className="relative flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex size-12 items-center justify-center rounded-xl ring-1 ring-inset ring-border/50 transition-transform duration-300 group-hover:scale-105",
              style.soft,
            )}
          >
            <Icon name={icon} size={24} />
          </span>

          {previewIcons && previewIcons.length > 0 ? (
            <ul className="flex items-center gap-1.5" aria-hidden="true">
              {previewIcons.slice(0, 4).map((p) => {
                const ps = accentStyle(p.accent);
                return (
                  <li
                    key={p.slug}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full ring-1 ring-inset ring-border/60",
                      p.accent ? ps.soft : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon name={p.icon} size={14} />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col gap-1.5">
          {eyebrow ? (
            <span className={cn("text-xs font-semibold uppercase tracking-wider", style.text)}>
              {eyebrow}
            </span>
          ) : null}
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="relative flex items-center justify-between gap-3">
          {meta ? (
            <span className={cn("text-xs font-medium", style.text)}>{meta}</span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Explore
            <Icon
              name="ArrowRight"
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
