import type { Metadata } from "next";
import { Suspense } from "react";

import { PAGE_SEO } from "@/config/seo";
import { ROUTES } from "@/config/constants";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";

import SearchClient from "./search-client";

/**
 * Search is a single static page (fully client-side search over the registry),
 * so it exports static metadata and defers the query-driven UI to a client
 * island reading `?q=`. This keeps it compatible with the static export.
 */
export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.search?.title ?? "Search Tools",
  description:
    PAGE_SEO.search?.description ??
    "Search across every tool on GigAI Tools, instant results as you type.",
  canonical: PAGE_SEO.search?.canonical ?? ROUTES.search,
  // Thin, query-driven results page; keep it out of the index (robots also
  // disallows /search?), and it is dropped from the sitemap.
  noIndex: true,
});

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        // Mirrors SearchClient's above-the-fold layout 1:1 (same header copy,
        // breadcrumb, a search-bar-sized placeholder, ad + results spacers) so
        // hydration swaps at identical height: zero layout shift.
        <div className="min-h-[75vh] py-10 sm:py-14">
          <Container>
            <PageHeader
              title="Search Tools"
              description="Find the right tool in seconds: start typing to see instant results."
              align="center"
              breadcrumb={[
                { label: "Home", href: ROUTES.home },
                { label: "Search", href: ROUTES.search },
              ]}
            >
              <div className="mx-auto mt-6 w-full max-w-2xl">
                <div
                  aria-hidden="true"
                  className="h-14 w-full rounded-2xl border border-border bg-muted/40"
                />
              </div>
            </PageHeader>
            <div aria-hidden="true" className="mt-10 min-h-[100px]" />
            <div aria-hidden="true" className="mt-12 min-h-[60vh]" />
          </Container>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
