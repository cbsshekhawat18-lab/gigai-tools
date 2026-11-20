"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavData } from "@/lib/nav-data";
import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { isChromeless } from "@/lib/chromeless";
import { Container } from "@/components/shared/container";
import { AuthButtons } from "@/components/layout/auth-buttons";
import { Logo } from "@/components/layout/logo";
import { CommandSearch } from "@/components/layout/command-search";
import { BrowseMenu } from "@/components/layout/browse-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

interface HeaderProps {
  navData: NavData;
}

/** Secondary header links (beyond the Browse mega-menu). */
const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "My Workspace", href: ROUTES.myWorkspace },
  { label: "Workspaces", href: ROUTES.workspaces },
  { label: "Solutions", href: ROUTES.solve },
  { label: "API", href: "/developers" },
  { label: "Blog", href: ROUTES.blog },
];

/**
 * Global site header, sticky, premium, and self-contained.
 *
 * On scroll it gains a hairline border and a stronger blur so it reads as a
 * distinct layer over content. It carries the logo, a "Browse" categories
 * mega-menu (driven by SLIM `navData` from the server layout), a prominent
 * ⌘K command-search trigger, quick links, the theme toggle, and a polished
 * mobile drawer below `lg`.
 *
 * CWV: this is a client component and therefore never imports the registry -
 * all tool/category data arrives pre-computed via the `navData` prop.
 */
export function Header({ navData }: HeaderProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(4);

  // White-label routes (supporter poster pages) carry no site chrome.
  if (isChromeless(pathname)) return null;

  const browseActive = pathname.startsWith("/category/");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65"
          : "border-b border-transparent bg-background/60 backdrop-blur-sm supports-[backdrop-filter]:bg-background/40",
      )}
    >
      <Container size="wide" className="relative flex h-16 items-center gap-3">
        <Logo />

        {/* Centered in the free space between the logo and the controls. It
            stays in flow at every width: absolute centering on the midline let
            the nav slide under the search box and the sign-in buttons. */}
        <nav
          className="mx-auto hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          <BrowseMenu
            categories={navData.categories}
            totalTools={navData.totalTools}
            active={browseActive}
          />
          {QUICK_LINKS.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              label={item.label}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* ml-auto pushes controls right while the nav is hidden; from lg the
            nav's own mx-auto does that, so ml-0 here. */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
          {/* Kept narrow at lg/xl on purpose: the nav is centred on the header
              midline, so an over-wide search box eats the right-hand gap and
              makes the centred nav read as shoved right (it was 320px, leaving
              ~16px beside the nav vs ~206px on the logo side). Widens again at
              2xl where there is room. Clicking it opens the full command
              palette, so the resting width is presentation only. */}
          <div className="hidden w-full max-w-sm md:block lg:w-56 2xl:w-72">
            <CommandSearch />
          </div>

          {/* Mobile: compact search icon (opens same palette) */}
          <div className="md:hidden">
            <CommandSearch />
          </div>
          <AuthButtons />
          <MobileNav navData={navData} />
        </div>
      </Container>
    </header>
  );
}

/** Reactive scroll flag. True once the page is scrolled past `threshold`px. */
function useScrolled(threshold = 4): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function isActive(href: string, pathname: string): boolean {
  if (href === ROUTES.home) return pathname === ROUTES.home;
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = isActive(href, pathname);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
