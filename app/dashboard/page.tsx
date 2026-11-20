import type { Metadata } from "next";

import { DashboardPage } from "@/components/poster/owner/dashboard-page";
import { buildMetadata } from "@/lib/seo";

/** Owner dashboard for supporter poster pages: account-only, never indexed. */
export const metadata: Metadata = buildMetadata({
  title: "My poster pages",
  description: "Manage your supporter poster pages: stats, designs, sharing and settings.",
  canonical: "/dashboard",
  noIndex: true,
});

export default function Page() {
  return <DashboardPage />;
}
