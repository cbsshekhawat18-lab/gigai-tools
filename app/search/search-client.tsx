"use client";

import { useSearchParams } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";

/** Client island: reads the `q` query param and renders live search results. */
export default function SearchClient() {
  const query = (useSearchParams().get("q") ?? "").trim();

  return (
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
            <SearchBar
              key={query}
              variant="hero"
              autoFocus={query.length === 0}
              openOnFocus={false}
              defaultValue={query}
              placeholder="Search for a tool, e.g. compress pdf…"
            />
          </div>
        </PageHeader>

        {/* Deliberately NO ads here: a search screen can be empty (no query /
            no results), and AdSense forbids ads on screens without publisher
            content; robots.txt also blocks the AdSense crawler from /search?. */}
        <div className="mt-12 min-h-[60vh]">
          <SearchResults query={query} />
        </div>
      </Container>
    </div>
  );
}
