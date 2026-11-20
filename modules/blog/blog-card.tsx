import Link from "next/link";

import type { BlogPost } from "@/types";
import { ROUTES } from "@/config/constants";
import { cn, formatDate, pluralize } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { getBlogCover } from "@/lib/blog-covers";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

/**
 * A single blog post card: optional cover, category badge, title, excerpt and a
 * meta row (date · reading time). The whole card is a link to the post.
 */
export function BlogCard({ post, className }: BlogCardProps) {
  return (
    <article className={cn("group h-full", className)}>
      <Link
        href={ROUTES.blogPost(post.slug)}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all",
          "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover ?? getBlogCover(post)}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.category && (
            <Badge variant="secondary" className="absolute left-3 top-3 backdrop-blur">
              {post.category}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {post.description}
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readingTimeMinutes ? (
              <>
                <span aria-hidden className="text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="Clock" size={13} />
                  {pluralize(post.readingTimeMinutes, "min")} read
                </span>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
