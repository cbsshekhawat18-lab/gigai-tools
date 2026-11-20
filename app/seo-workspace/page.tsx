import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { getWorkspaceBySlug } from "@/config/workspaces";
import { buildMetadata } from "@/lib/seo";
import { WorkspacePage } from "@/components/workspace/workspace-page";

/**
 * /seo-workspace, server page for the SEO Workspace.
 *
 * All SEO (metadata, JSON-LD, hero, how-it-works, FAQ, related tools) is
 * rendered server-side by <WorkspacePage>, which mounts the interactive SEO
 * markup studio as a code-split, client-only island. Copy lives in
 * config/workspaces.
 */

const workspace = getWorkspaceBySlug("seo");

export const metadata: Metadata = buildMetadata({
  title: workspace?.seoTitle ?? "SEO Workspace",
  description: workspace?.seoDescription ?? "",
  keywords: workspace?.keywords,
  canonical: ROUTES.workspace("seo"),
});

export default function SeoWorkspacePage() {
  if (!workspace) notFound();
  return <WorkspacePage workspace={workspace} />;
}
