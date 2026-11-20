import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { getWorkspaceBySlug } from "@/config/workspaces";
import { buildMetadata } from "@/lib/seo";
import { WorkspacePage } from "@/components/workspace/workspace-page";

/**
 * /developer-workspace, server page for the Developer Workspace.
 *
 * All SEO (metadata, JSON-LD, hero, how-it-works, FAQ, related tools) is
 * rendered server-side by <WorkspacePage>, which mounts the interactive
 * developer scratchpad as a code-split, client-only island. Copy lives in
 * config/workspaces.
 */

const workspace = getWorkspaceBySlug("developer");

export const metadata: Metadata = buildMetadata({
  title: workspace?.seoTitle ?? "Developer Workspace",
  description: workspace?.seoDescription ?? "",
  keywords: workspace?.keywords,
  canonical: ROUTES.workspace("developer"),
});

export default function DeveloperWorkspacePage() {
  if (!workspace) notFound();
  return <WorkspacePage workspace={workspace} />;
}
