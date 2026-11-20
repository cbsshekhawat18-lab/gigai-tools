import type { Metadata } from "next";

import { getPopularTools, getTotalToolCount } from "@/lib/registry";
import { buildHomeCardLookup } from "@/lib/home/card-lookup";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/lib/schema";
import { SearchHero } from "@/modules/home/search-hero";
import { FileIntelligenceSection } from "@/modules/home/file-intelligence-section";
import { PopularTools } from "@/modules/home/popular-tools";
import { RecentlyUsedSection } from "@/modules/home/recently-used-section";
import { RecommendedForYou } from "@/components/personalization/recommended-for-you";
import { CategoriesSection } from "@/modules/home/categories-section";
import { HomeFAQ, HOME_FAQS } from "@/modules/home/home-faq";
import { Container } from "@/components/shared/container";
import { ResponsiveAd, MultiplexAd } from "@/components/ads";

export const metadata: Metadata = pageMetadata("home");

/**
 * Home (UI-upgrade spec phase 2). On a 262-tool site the user's job is FIND MY
 * TOOL, so the page is built around one truth: search is the product.
 *
 *   hero search -> popular (dense) -> categories (dense) -> the two flagship
 *   products with room -> FAQ -> footer
 *
 * Deliberately CUT from the homepage: featured collections, new releases,
 * latest articles, the newsletter block and the closing CTA - all reachable
 * from the footer, and together they added 17+ cards of identical rhythm.
 * The personalized rails (recently-used, recommendations) stay because they
 * render NOTHING for a first-time visitor and real value for a returning one.
 * Ads: two slots, down from four.
 */
export default function Home() {
  // Built once and shared by the personalized rails so React Flight serializes
  // the registry-free tool lookup a single time (see lib/home/card-lookup).
  const cardLookup = buildHomeCardLookup();
  return (
    <>
      <SearchHero
        toolCount={getTotalToolCount()}
        trending={getPopularTools(5).map((t) => ({ slug: t.slug, title: t.title }))}
      />

      <PopularTools lookup={cardLookup} />
      <RecentlyUsedSection />
      <div className="py-6 [&:not(:has(section))]:hidden">
        <Container>
          <RecommendedForYou lookup={cardLookup} />
        </Container>
      </div>

      <CategoriesSection />
      <ResponsiveAd position="HOME_AFTER_CATEGORIES" />

      <FileIntelligenceSection />

      <HomeFAQ />
      <MultiplexAd position="HOME_BEFORE_FOOTER" />

      <JsonLd data={faqJsonLd(HOME_FAQS)} />
    </>
  );
}
