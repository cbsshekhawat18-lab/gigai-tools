import type { Metadata } from "next";

import { CreatePage } from "@/components/poster/owner/create-page";
import { buildMetadata } from "@/lib/seo";

/** Owner side of supporter poster pages: account-only, never indexed. */
export const metadata: Metadata = buildMetadata({
  title: "Create your supporter poster page",
  description: "Publish a page where your supporters make their own poster with your design.",
  canonical: "/create",
  noIndex: true,
});

export default function Page() {
  return <CreatePage />;
}
