import Link from "next/link";

import { ROUTES, SITE } from "@/config/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
}

/**
 * Brand wordmark with a gradient mark. Links home by default.
 * Used in the header, footer and mobile nav so the brand stays consistent.
 */
export function Logo({ className, href = ROUTES.home }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${SITE.name}, home`}
      className={cn(
        "group inline-flex min-h-11 items-center gap-2.5 rounded-md outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no next/image optimizer */}
      <img
        src="/brand/logo-mark.png"
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
        draggable={false}
      />
      {/*
        Wordmark. The "AI" carries the accent color deliberately: the brand is
        Gig + AI, and if the capitals aren't visually separated people simply
        read the whole thing as "Gigai" and the meaning is lost.
      */}
      <span className="whitespace-nowrap text-base font-semibold tracking-tight text-foreground">
        Gig<span className="text-primary">AI</span> Tools
      </span>
    </Link>
  );
}
