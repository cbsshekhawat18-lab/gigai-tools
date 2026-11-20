import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { Container } from "@/components/shared/container";
import { Icon } from "@/lib/icons";
import { HeroSearchForm } from "./search-hero-form";

/**
 * The homepage hero (UI-upgrade spec phase 2): on a 262-tool site the user's
 * job is FIND MY TOOL, so search IS the hero - one oversized input, the good
 * question as its label, and one-tap trending chips beneath. No gradients, no
 * illustration; the input is the composition.
 *
 * Server component; only the form itself hydrates (desktop autofocus).
 */
export interface TrendingChip {
  slug: string;
  title: string;
}

export function SearchHero({
  toolCount,
  trending,
}: {
  toolCount: number;
  /** Traffic-derived (registry `popular` = real nginx top-20), not hardcoded. */
  trending: TrendingChip[];
}) {
  return (
    <section className="border-b border-border py-16 md:py-28">
      <Container size="narrow">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-[3.4rem]">
            What do you want to accomplish today?
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            {toolCount} free tools for documents, images, video, audio, code and
            SEO. Everything runs in your browser and nothing is uploaded.
          </p>

          <HeroSearchForm className="mt-8 w-full max-w-2xl" />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2.5">
            <span className="text-sm text-muted-foreground">Trending:</span>
            {trending.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.title}
              </Link>
            ))}
          </div>

          <Link
            href={ROUTES.assist}
            className="mt-8 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Sparkles" size={15} />
            Not sure which tool? Drop a file on Smart Assist and it plans the steps
          </Link>
        </div>
      </Container>
    </section>
  );
}
