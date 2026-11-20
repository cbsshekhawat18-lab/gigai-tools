import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { getRelatedWeb, type RelatedWeb, type RelatedWebInput, type RelatedLink } from "@/lib/seo/related-web";

/**
 * <RelatedWeb>: the SERVER-rendered "related web" of internal links every page
 * shares. It renders the slim bundle from `getRelatedWeb` as compact, grouped
 * link chips/cards: "Related tools", "From the blog", "Explore categories",
 * "Compare formats", "Try a workflow", "By file type", "For your use case" and
 * "Common tasks". Lightweight HTML only (NO client JS) so it costs nothing on
 * CWV while weaving the whole site together for topical authority.
 *
 * Pass either a pre-built `bundle` (when the page already computed it) or an
 * `input` (the component computes it at build time). Renders nothing when the
 * bundle has no cross-links beyond the always-present Learn/Home shortcuts.
 */
export interface RelatedWebProps {
  /** A pre-computed bundle. Mutually exclusive with `input`. */
  bundle?: RelatedWeb;
  /** An entity descriptor; the component computes the bundle (server-only). */
  input?: RelatedWebInput;
  /** Section title (defaults to "Keep exploring"). */
  title?: string;
  className?: string;
}

/** One labelled group of link chips; renders nothing when empty. */
function LinkGroup({
  heading,
  icon,
  links,
}: {
  heading: string;
  icon: string;
  links: RelatedLink[];
}) {
  if (links.length === 0) return null;
  return (
    // `min-w-0` is REQUIRED: this is a CSS-grid child, and grid items default to
    // `min-width: auto`, which lets a long chip grow the column past the mobile
    // viewport (defeating the chips' `truncate`). min-w-0 lets it shrink.
    <div className="flex min-w-0 flex-col gap-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon name={icon} size={14} className="text-primary" />
        {heading}
      </h3>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {links.map((link) => (
          <li key={link.href} className="min-w-0 max-sm:w-full">
            <Chip link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A single accent-aware link chip. */
function Chip({ link }: { link: RelatedLink }) {
  const style = accentStyle(link.accent);
  return (
    <Link
      href={link.href}
      className={cn(
        // Full-width (truncating) on mobile so a long label can never overflow
        // the viewport inside a flex-wrap row; a bounded pill on sm+.
        "group flex w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-card min-h-11 px-3",
        "sm:inline-flex sm:w-auto sm:max-w-[20rem]",
        "text-sm font-medium text-card-foreground shadow-sm transition-colors",
        "hover:border-transparent hover:bg-muted/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {link.icon ? (
        <span
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
            link.accent ? style.soft : "bg-muted text-muted-foreground",
          )}
        >
          <Icon name={link.icon} size={12} />
        </span>
      ) : null}
      <span className="truncate">{link.label}</span>
    </Link>
  );
}

export function RelatedWeb({ bundle, input, title = "Keep exploring", className }: RelatedWebProps) {
  const web = bundle ?? (input ? getRelatedWeb(input) : undefined);
  if (!web) return null;

  // Assemble the ordered, always-present "shortcuts" row (workflow, use-case,
  // learn, home) so a page never renders an empty component.
  const shortcuts: RelatedLink[] = [
    ...(web.workflow ? [web.workflow] : []),
    ...(web.useCaseHub ? [web.useCaseHub] : []),
    web.learnHref,
    web.home,
  ];

  const hasContent =
    web.tools.length > 0 ||
    web.blogs.length > 0 ||
    web.categories.length > 0 ||
    web.comparisons.length > 0 ||
    web.fileHubs.length > 0 ||
    web.taskHubs.length > 0 ||
    web.problems.length > 0 ||
    web.glossary.length > 0 ||
    web.contexts.length > 0;

  if (!hasContent) return null;

  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-transparent p-6 sm:p-8",
        className,
      )}
    >
      <div className="mb-6 flex items-center gap-2">
        <Icon name="Compass" size={18} className="text-primary" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LinkGroup heading="Related tools" icon="Wrench" links={web.tools} />
        <LinkGroup heading="Problems we solve" icon="Lightbulb" links={web.problems} />
        <LinkGroup heading="Image sizes for" icon="Scaling" links={web.contexts} />
        <LinkGroup heading="Definitions" icon="BookOpen" links={web.glossary} />
        <LinkGroup heading="From the blog" icon="Newspaper" links={web.blogs} />
        <LinkGroup heading="Explore categories" icon="LayoutGrid" links={web.categories} />
        <LinkGroup heading="Compare formats" icon="GitCompareArrows" links={web.comparisons} />
        <LinkGroup heading="By file type" icon="FileType2" links={web.fileHubs} />
        <LinkGroup heading="Common tasks" icon="ListChecks" links={web.taskHubs} />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Next steps
        </h3>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {shortcuts.map((link) => (
            <li key={link.href} className="min-w-0 max-sm:w-full">
              <Chip link={link} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
