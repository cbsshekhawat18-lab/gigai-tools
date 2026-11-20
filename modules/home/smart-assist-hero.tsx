import Link from "next/link";

import { ROUTES, TRENDING_SEARCHES } from "@/config/constants";
import { Icon } from "@/lib/icons";
import { Container } from "@/components/shared/container";
import { SearchBar } from "@/components/search/search-bar";
import { SmartAssistMount } from "@/components/assist/smart-assist-mount";

/**
 * Home hero, SEARCH-FIRST.
 *
 * The proven, always-reliable path (search + browse the full tool library) leads. GigAI
 * Smart Assist follows as a clearly-labelled secondary "Beta" option for people
 * who'd rather describe a goal than pick a tool. Server-rendered shell; the
 * assistant is a lazy `ssr:false` island so the hero paints instantly and the
 * tool registry never enters the initial bundle.
 */
export function SmartAssistHero({
  toolCount,
  categoryCount,
}: {
  toolCount: number;
  categoryCount: number;
}) {
  const stats = [
    { icon: "Wrench", value: `${toolCount}+`, label: "productivity tools" },
    { icon: "LayoutGrid", value: `${categoryCount}`, label: "studios" },
    { icon: "ShieldCheck", value: "100%", label: "private" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Subtle grid + radial glow background */}

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="animate-rise-solid text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
            style={{ animationDelay: "0.13s" }}
          >
            What do you want to{" "}
            <span className="text-primary">
              accomplish today?
            </span>
          </h1>

          <p
            className="animate-rise mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.21s" }}
          >
            {/* Kept literally true: two tools (PDF↔Word) do use a server, so this
                says "almost every" rather than claiming nothing is ever uploaded.
                Each tool page shows its own processing badge. */}
            Work with documents, images, video, audio, code and SEO: fast, free and
            no sign-up. Almost every tool runs entirely in your browser; the few that
            need a server say so, and delete your file straight after.
          </p>

          {/*
            The brand promise, kept honest: GigAI uses AI where AI genuinely
            helps and plain local processing everywhere else. Stated as a
            principle rather than a badge, because slapping "AI" on a binary
            search is exactly what this line exists to avoid.
          */}
          <p
            className="animate-rise mx-auto mt-3 text-sm font-medium text-muted-foreground"
            style={{ animationDelay: "0.25s" }}
          >
            AI-powered when useful. Local when possible.
          </p>

          {/* PRIMARY: search the library */}
          <div className="animate-rise mt-9 flex justify-center" style={{ animationDelay: "0.29s" }}>
            <SearchBar variant="hero" className="mx-auto" />
          </div>

          <div
            className="animate-rise mt-5 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "0.37s" }}
          >
            <span className="text-xs font-medium text-muted-foreground">Trending:</span>
            {TRENDING_SEARCHES.slice(0, 5).map((q) => (
              <Link
                key={q}
                href={`${ROUTES.search}?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {q}
              </Link>
            ))}
          </div>

          <ul
            className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            style={{ animationDelay: "0.45s" }}
          >
            {stats.map((stat) => (
              <li key={stat.label} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name={stat.icon} size={16} className="text-primary" />
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SECONDARY: GigAI Smart Assist (Beta) - for people who'd rather describe a goal */}
        <div className="animate-rise mx-auto mt-14 max-w-2xl" style={{ animationDelay: "0.5s" }}>
          <div className="mb-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
              <Icon name="Sparkles" size={13} />
              New · Beta
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Not sure which tool? Let GigAI figure it out.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Upload a file and say your goal in plain words, GigAI Smart Assist analyses it,
              picks the right tools, and runs them right in your browser.
            </p>
          </div>
          <SmartAssistMount variant="hero" />
        </div>
      </Container>
    </section>
  );
}
