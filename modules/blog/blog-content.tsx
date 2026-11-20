import { cn } from "@/lib/utils";

interface BlogContentProps {
  html: string;
  className?: string;
}

/**
 * Renders markdown-derived HTML with a hand-rolled prose style.
 *
 * There is no Tailwind typography plugin in this project, so we style the child
 * elements produced by `dangerouslySetInnerHTML` via descendant selectors
 * (`[&_h2]:…`). The HTML comes from our own trusted markdown pipeline
 * (lib/blog → remark), so injecting it is safe. `.prose-measure` caps the line
 * length for comfortable reading.
 */
export function BlogContent({ html, className }: BlogContentProps) {
  return (
    <div
      className={cn(
        "prose-measure max-w-none text-[15px] leading-7 text-foreground/90",
        // Headings
        "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-foreground",
        // Body copy
        "[&_p]:my-5",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:no-underline",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        // Lists
        "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-muted-foreground",
        "[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:marker:text-muted-foreground",
        "[&_li]:my-1.5 [&_li]:pl-1",
        // Quotes
        "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        // Inline + block code
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground",
        "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/60 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-6",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground",
        // Media + rules + tables
        "[&_img]:my-6 [&_img]:rounded-2xl [&_img]:border [&_img]:border-border",
        "[&_hr]:my-10 [&_hr]:border-border",
        "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
        className,
      )}
      // Trusted HTML from our own remark markdown pipeline (lib/blog).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
