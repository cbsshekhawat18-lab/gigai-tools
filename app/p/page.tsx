import type { Metadata } from "next";

import { PosterPage } from "@/components/poster/poster-page";
import { buildMetadata } from "@/lib/seo";

/**
 * Static shell for every supporter poster page. nginx sends /p/{slug} to the
 * API, which returns THIS file with the page's own title/OG tags injected
 * (backend/app/v1/poster.py::inject_meta); the component then loads the page
 * data client-side. The bare /p shell itself is never indexed.
 */
export const metadata: Metadata = buildMetadata({
  title: "Supporter poster",
  description: "Make and share your supporter poster.",
  canonical: "/p",
  noIndex: true,
});

export default function Page() {
  return <PosterPage />;
}
