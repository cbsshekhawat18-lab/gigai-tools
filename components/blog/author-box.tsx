import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { cn, formatDate, pluralize } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface AuthorBoxProps {
  author: string;
  /** ISO date the post was published. */
  date: string;
  readingTimeMinutes?: number;
  /** Short author bio. Falls back to a house description. */
  bio?: string;
  className?: string;
}

/** Up to two initials from a name. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Deterministic hue from a string, same name always yields the same gradient. */
function hueOf(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return hash;
}

const DEFAULT_BIO =
  "Founder of Gigai Kripa Services. Builds the 250+ privacy-first browser tools on this site and writes the guides that go with them.";

/** Trust links shown under the bio. Where and how this content is produced. */
const AUTHOR_LINKS = [
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.editorial, label: "Editorial standards" },
  { href: ROUTES.aiPolicy, label: "AI policy" },
] as const;

/**
 * Author card: a deterministic gradient/initials avatar, name, publish meta and
 * a short bio. Server-safe (no interactivity).
 */
export function AuthorBox({ author, date, readingTimeMinutes, bio, className }: AuthorBoxProps) {
  const hue = hueOf(author);
  const gradient = `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 48) % 360} 72% 42%))`;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center",
        className,
      )}
    >
      <div
        aria-hidden
        style={{ backgroundImage: gradient }}
        className="flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white shadow-inner"
      >
        {initialsOf(author)}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Written by
        </p>
        <p className="text-base font-semibold text-foreground">{author}</p>
        <p className="text-sm text-muted-foreground">{bio ?? DEFAULT_BIO}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {AUTHOR_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Calendar" size={13} />
            <time dateTime={date}>{formatDate(date)}</time>
          </span>
          {typeof readingTimeMinutes === "number" ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Clock" size={13} />
              {pluralize(readingTimeMinutes, "min")} read
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
