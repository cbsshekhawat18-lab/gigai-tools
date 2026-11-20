import type { BlogPost } from "@/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { BlogCard } from "@/modules/blog/blog-card";

interface BlogListProps {
  posts: BlogPost[];
  className?: string;
  columns?: 2 | 3;
  emptyMessage?: string;
}

const COLUMN_CLASS: Record<NonNullable<BlogListProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * Responsive grid of BlogCards. Falls back to an EmptyState when there are no
 * posts to show, so callers can render it unconditionally.
 */
export function BlogList({ posts, className, columns = 3, emptyMessage }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon="Newspaper"
        title="No articles yet"
        description={emptyMessage ?? "Check back soon, we're working on fresh guides and tips."}
      />
    );
  }

  return (
    <ul className={cn("grid grid-cols-1 gap-6", COLUMN_CLASS[columns], className)}>
      {posts.map((post) => (
        <li key={post.slug} className="h-full">
          <BlogCard post={post} />
        </li>
      ))}
    </ul>
  );
}
