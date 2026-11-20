"use client";

import * as React from "react";

import { cn, slugify } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface TocHeading {
  id: string;
  text: string;
  /** 2 = h2, 3 = h3. */
  level: 2 | 3;
}

export interface TableOfContentsProps {
  /**
   * Optional pre-parsed headings. When omitted, the component reads h2/h3 from
   * the article (`contentSelector`) and assigns missing `id`s in place, so it
   * works even though the markdown pipeline does not add heading ids.
   */
  headings?: TocHeading[];
  /** Selector for the rendered article body to scan for headings. */
  contentSelector?: string;
  className?: string;
  /** Heading shown above the list. */
  label?: string;
}

/** Read h2/h3 from the DOM, assigning stable ids where absent. */
function collectHeadings(root: ParentNode): TocHeading[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));
  const seen = new Set<string>();

  return nodes.map((node) => {
    const level = node.tagName === "H3" ? 3 : 2;
    const text = node.textContent?.trim() ?? "";

    let id = node.id;
    if (!id) {
      const base = slugify(text) || "section";
      id = base;
      let n = 2;
      while (seen.has(id)) id = `${base}-${n++}`;
      node.id = id;
    }
    seen.add(id);

    // Ensure anchored jumps clear any sticky header.
    node.classList.add("scroll-mt-24");

    return { id, text, level: level as 2 | 3 };
  });
}

export function TableOfContents({
  headings: provided,
  contentSelector = "article .prose-measure",
  className,
  label = "On this page",
}: TableOfContentsProps) {
  const [headings, setHeadings] = React.useState<TocHeading[]>(provided ?? []);
  const [activeId, setActiveId] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);

  // Build the heading list from the DOM when none was supplied.
  React.useEffect(() => {
    if (provided && provided.length > 0) {
      setHeadings(provided);
      return;
    }
    const root =
      document.querySelector(contentSelector) ??
      document.querySelector("article") ??
      document.body;
    setHeadings(collectHeadings(root));
  }, [provided, contentSelector]);

  // Scroll-spy: highlight the heading nearest the top of the viewport.
  React.useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size > 0) {
          // Topmost visible heading wins.
          const first = elements.find((el) => visible.has(el.id));
          if (first) setActiveId(first.id);
        } else {
          // Nothing intersecting. Keep the last heading scrolled past active.
          const scrollY = window.scrollY;
          let current = elements[0]?.id ?? "";
          for (const el of elements) {
            if (el.getBoundingClientRect().top + scrollY - 120 <= scrollY) current = el.id;
            else break;
          }
          setActiveId(current);
        }
      },
      { rootMargin: "-88px 0px -66% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      event.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
      setActiveId(id);
      setOpen(false);
    },
    [],
  );

  if (headings.length === 0) return null;

  const list = (
    <ul className="flex flex-col gap-1 border-l border-border">
      {headings.map((h) => {
        const isActive = h.id === activeId;
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1 text-sm leading-snug transition-colors",
                h.level === 3 ? "pl-6" : "pl-4",
                isActive
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      {/* Mobile: a collapsible disclosure. */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="inline-flex items-center gap-2">
            <Icon name="List" size={16} />
            {label}
          </span>
          <Icon
            name="ChevronDown"
            size={16}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
        {open ? <div className="mt-3 pl-1">{list}</div> : null}
      </div>

      {/* Desktop: a sticky rail. */}
      <div className="hidden lg:block">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon name="List" size={14} />
          {label}
        </p>
        {list}
      </div>
    </nav>
  );
}
