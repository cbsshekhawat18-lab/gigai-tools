"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavCategory, NavData, NavTool } from "@/lib/nav-data";
import { ROUTES } from "@/config/constants";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Quick links shown above the category accordion. */
const QUICK_LINKS: { label: string; href: string; icon: string }[] = [
  { label: "All tools", href: ROUTES.search, icon: "LayoutGrid" },
  { label: "Workspaces", href: ROUTES.workspaces, icon: "Layers" },
  { label: "Solutions", href: ROUTES.solve, icon: "Lightbulb" },
  { label: "New", href: "/#recent", icon: "Sparkles" },
  { label: "Blog", href: ROUTES.blog, icon: "Newspaper" },
];

interface MobileNavProps {
  navData: NavData;
}

/**
 * Mobile navigation drawer (below `lg`). Driven entirely by the SLIM `navData`
 * passed from the server layout; it never imports the registry. Renders quick
 * links, an accordion of all categories (icon + live count, expanding to reveal
 * their top tools), and a theme control, so it mirrors the desktop Browse
 * mega-menu experience on small screens.
 */
export function MobileNav({ navData }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Icon name="Menu" size={20} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full max-w-sm flex-col gap-0 p-0"
        aria-label="Main menu"
      >
        <SheetHeader className="flex-row items-center justify-between gap-4 border-b border-border p-5">
          <Logo href={ROUTES.home} />
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse categories and site links.
          </SheetDescription>
        </SheetHeader>

        <nav
          className="flex-1 overflow-y-auto p-3"
          aria-label="Mobile navigation"
        >
          {/* Quick links */}
          <ul className="grid grid-cols-2 gap-1.5">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm font-medium outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 mb-2 px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
          </div>

          <ul className="flex flex-col gap-1">
            {navData.categories.map((category, index) => (
              <MobileCategory
                key={category.slug}
                category={category}
                pathname={pathname}
                onNavigate={close}
                defaultOpen={index === 0}
              />
            ))}
          </ul>

          <Separator className="my-4" />

          <ul className="flex flex-col gap-1">
            {[
              { label: "About", href: ROUTES.about, icon: "Info" },
              { label: "Contact", href: ROUTES.contact, icon: "Mail" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium outline-none transition-colors",
                    "text-foreground hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    className="text-muted-foreground"
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function isActive(href: string, pathname: string): boolean {
  if (href === ROUTES.home) return pathname === ROUTES.home;
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileCategory({
  category,
  pathname,
  onNavigate,
  defaultOpen,
}: {
  category: NavCategory;
  pathname: string;
  onNavigate: () => void;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(Boolean(defaultOpen));
  const accent = accentStyle(category.accent);
  const active = isActive(category.href, pathname);

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg pr-1 transition-colors",
          active && "bg-accent/60",
        )}
      >
        <Link
          href={category.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors",
            "text-foreground hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring",
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
          <span className="min-w-0 flex-1 truncate">{category.name}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {category.count}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${category.name}`}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors",
            "hover:bg-background hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Icon
            name="ChevronDown"
            size={16}
            className={cn(
              "transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {expanded ? (
        <ul className="mt-0.5 mb-1 flex flex-col gap-0.5 pl-6">
          {category.tools.map((tool: NavTool) => (
            <li key={tool.slug}>
              <Link
                href={tool.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                  "text-muted-foreground hover:bg-accent hover:text-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Icon
                  name={tool.icon}
                  size={15}
                  className="shrink-0 opacity-70"
                />
                <span className="truncate">{tool.title}</span>
              </Link>
            </li>
          ))}
          {category.count > category.tools.length ? (
            <li>
              <Link
                href={category.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
                  "text-primary hover:bg-accent",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                See all {category.count} tools
                <Icon name="ArrowRight" size={14} className="shrink-0" />
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}
