import Link from "next/link";

import type { BlogPost } from "@/types";
import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface PostNavProps {
  /** The chronologically newer post, or null if this is the newest. */
  prev?: BlogPost | null;
  /** The chronologically older post, or null if this is the oldest. */
  next?: BlogPost | null;
  className?: string;
}

interface NavCardProps {
  post: BlogPost;
  direction: "prev" | "next";
}

function NavCard({ post, direction }: NavCardProps) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={ROUTES.blogPost(post.slug)}
      rel={isPrev ? "prev" : "next"}
      className={cn(
        "group flex flex-1 flex-col gap-1.5 rounded-2xl border border-border bg-card p-5 transition-all",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        !isPrev && "sm:items-end sm:text-right",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
          !isPrev && "sm:flex-row-reverse",
        )}
      >
        <Icon
          name={isPrev ? "ArrowLeft" : "ArrowRight"}
          size={14}
          className={cn(
            "transition-transform",
            isPrev ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5",
          )}
        />
        {isPrev ? "Previous" : "Next"}
      </span>
      <span className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
        {post.title}
      </span>
    </Link>
  );
}

/**
 * Previous / next article cards for the foot of a post. Renders nothing when
 * neighbours are absent; a lone neighbour aligns to its natural side.
 */
export function PostNav({ prev, next, className }: PostNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="More articles"
      className={cn("flex flex-col gap-4 sm:flex-row", className)}
    >
      {prev ? <NavCard post={prev} direction="prev" /> : <div className="hidden flex-1 sm:block" />}
      {next ? <NavCard post={next} direction="next" /> : <div className="hidden flex-1 sm:block" />}
    </nav>
  );
}
