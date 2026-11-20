import Link from "next/link";

import type { BlogPost } from "@/types";
import { ROUTES } from "@/config/constants";
import { cn, formatDate, pluralize } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { getBlogCover } from "@/lib/blog-covers";
import { Badge } from "@/components/ui/badge";

interface FeaturedPostProps {
  post: BlogPost;
  /** Small uppercase kicker above the title. Defaults to "Latest article". */
  eyebrow?: string;
  className?: string;
}

/**
 * The oversized hero card for the newest article on the blog index: a wide
 * cover, category badge, title, excerpt and meta row. The whole card links to
 * the post. Server-safe, pure links, no client state.
 */
export function FeaturedPost({ post, eyebrow = "Latest article", className }: FeaturedPostProps) {
  return (
    <article className={cn("group", className)}>
      <Link
        href={ROUTES.blogPost(post.slug)}
        className={cn(
          "grid overflow-hidden rounded-3xl border border-border bg-card transition-all lg:grid-cols-2",
          "hover:border-primary/30 hover:shadow-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted lg:aspect-auto lg:h-full lg:min-h-[22rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover ?? getBlogCover(post)}
            alt=""
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Icon name="Sparkles" size={13} />
              {eyebrow}
            </span>
            {post.category ? (
              <Badge variant="secondary" className="capitalize">
                {post.category}
              </Badge>
            ) : null}
          </div>

          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
            {post.title}
          </h2>

          <p className="line-clamp-3 text-pretty text-muted-foreground">{post.description}</p>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="User" size={14} />
              {post.author}
            </span>
            <span aria-hidden className="text-border">•</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readingTimeMinutes ? (
              <>
                <span aria-hidden className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Clock" size={14} />
                  {pluralize(post.readingTimeMinutes, "min")} read
                </span>
              </>
            ) : null}
          </div>

          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Read article
            <Icon
              name="ArrowRight"
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
