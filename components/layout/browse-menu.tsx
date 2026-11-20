"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavCategory } from "@/lib/nav-data";
import { ROUTES } from "@/config/constants";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrowseMenuProps {
  categories: NavCategory[];
  totalTools: number;
  active?: boolean;
}

/**
 * The "Browse" mega-menu: a two-pane categories panel. The left rail lists
 * every category with its icon and live tool count; hovering/focusing a
 * category reveals its top tools in the right pane. Fully keyboard-navigable
 * (the rail buttons are focusable and update the preview on focus), and it
 * degrades gracefully; the whole panel is slim data passed from the server.
 */
export function BrowseMenu({ categories, totalTools, active }: BrowseMenuProps) {
  const [activeSlug, setActiveSlug] = useState<string>(
    categories[0]?.slug ?? "",
  );
  const activeCategory =
    categories.find((c) => c.slug === activeSlug) ?? categories[0];

  // Controlled so the menu closes on navigation. The links inside are plain
  // Next <Link>s (not Radix menu items), so Radix doesn't auto-close on click -
  // without this the panel stays open over the newly-loaded page. Closing on a
  // pathname change dismisses it as soon as the route resolves.
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Studios
        <Icon
          name="ChevronDown"
          size={15}
          className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-[58rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
      >
        <div className="grid grid-cols-[15rem_1fr]">
          {/* Left rail: categories */}
          <div className="border-r border-border bg-muted/30 p-2">
            <ul className="flex flex-col gap-0.5" role="list">
              {categories.map((category) => {
                const accent = accentStyle(category.accent);
                const isActive = category.slug === activeCategory?.slug;
                return (
                  <li key={category.slug}>
                    <Link
                      href={category.href}
                      onMouseEnter={() => setActiveSlug(category.slug)}
                      onFocus={() => setActiveSlug(category.slug)}
                      className={cn(
                        "group/cat flex items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-background shadow-sm"
                          : "hover:bg-background/60",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-md",
                          accent.soft,
                        )}
                      >
                        <Icon name={category.icon} size={15} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {category.count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right pane: the active category's top tools */}
          <div className="flex flex-col p-4">
            {activeCategory ? (
              <>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {activeCategory.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {activeCategory.description}
                    </p>
                  </div>
                  <Link
                    href={activeCategory.href}
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1 text-xs font-medium text-primary outline-none transition-colors",
                      "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    See all {activeCategory.count}
                  </Link>
                </div>

                {/* Every tool in the category - dense 3-col grid, scrolls when long. */}
                <ul className="grid max-h-[62vh] grid-cols-2 gap-x-2 gap-y-0.5 overflow-y-auto pr-1 lg:grid-cols-3">
                  {activeCategory.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={tool.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
                          "text-muted-foreground hover:bg-accent hover:text-foreground",
                          "focus-visible:bg-accent focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <Icon
                          name={tool.icon}
                          size={16}
                          className="shrink-0 opacity-70"
                        />
                        <span className="truncate">{tool.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer strip */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            {totalTools}+ free tools, no sign-up
          </span>
          <Link
            href={ROUTES.search}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary outline-none transition-colors",
              "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            Browse all tools
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
