import Link from "next/link";

import type { ToolCardData } from "@/types";
import { ROUTES } from "@/config/constants";
import { Icon } from "@/lib/icons";
import { getPopularTools } from "@/lib/registry";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { PersonalizedToolGrid } from "@/components/personalization/personalized-tool-grid";
import { Button } from "@/components/ui/button";

/**
 * Popular tools; personalized. The editorial `popular` set is the server-side
 * baseline (and what a first-time visitor sees); once the visitor has a usage
 * history, their most-used tools float to the front, padded with the editorial
 * set. Ordering happens locally in the browser (see {@link PersonalizedToolGrid}).
 *
 * `lookup` is the shared registry-free card lookup built once in the homepage.
 */
export function PopularTools({ lookup }: { lookup: Record<string, ToolCardData> }) {
  const fallback = getPopularTools(8).map((t) => t.slug);
  if (fallback.length === 0) return null;

  return (
    <section className="py-10 md:py-12">
      <Container>
        <SectionHeading
          title="Popular tools"
          description="The tools people reach for every day. Start here."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={ROUTES.search}>
                View all
                <Icon name="ArrowRight" size={16} />
              </Link>
            </Button>
          }
        />
        <div className="mt-10">
          <PersonalizedToolGrid
            lookup={lookup}
            fallback={fallback}
            source="popular"
            limit={8}
            columns={4}
          />
        </div>
      </Container>
    </section>
  );
}
