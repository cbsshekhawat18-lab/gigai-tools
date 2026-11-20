import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { buildMetadata } from "@/lib/seo";
import { buildHomeCardLookup } from "@/lib/home/card-lookup";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceDashboard } from "@/components/workspace-dashboard/workspace-dashboard";

/**
 * My Workspace: the personal, local-first dashboard (pinned tools, favorites,
 * recently-used, most-used, stats). Every bit of data lives in the visitor's
 * own browser, so this page is intentionally PRIVATE: `noIndex`, dropped from
 * the sitemap, and disallowed in robots.txt. The server only renders the shell
 * + a registry-free tool lookup; the {@link WorkspaceDashboard} island fills it
 * in from localStorage after mount.
 */
export const metadata: Metadata = buildMetadata({
  title: "My Workspace",
  description:
    "Your personal GigAI Tools dashboard: pinned tools, favorites, recent history and stats, all stored privately on your device.",
  canonical: ROUTES.myWorkspace,
  noIndex: true,
});

export default function WorkspacePage() {
  const lookup = buildHomeCardLookup();
  return (
    <div className="min-h-[75vh] py-10 sm:py-14">
      <Container>
        <PageHeader
          title="My Workspace"
          description="Your pinned tools, favorites and history, private to this device."
        />
        <div className="mt-10">
          <WorkspaceDashboard lookup={lookup} />
        </div>
      </Container>
    </div>
  );
}
