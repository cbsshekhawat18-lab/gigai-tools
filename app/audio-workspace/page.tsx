import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { getWorkspaceBySlug } from "@/config/workspaces";
import { buildMetadata } from "@/lib/seo";
import { WorkspacePage } from "@/components/workspace/workspace-page";

/**
 * /audio-workspace: server page for the Audio Workspace.
 *
 * All SEO (metadata, JSON-LD, hero, how-it-works, FAQ, related tools) is
 * rendered server-side by <WorkspacePage>, which mounts the interactive audio
 * editor as a code-split, client-only island. Copy lives in config/workspaces.
 */

const workspace = getWorkspaceBySlug("audio");

export const metadata: Metadata = buildMetadata({
  title: workspace?.seoTitle ?? "Audio Workspace",
  description: workspace?.seoDescription ?? "",
  keywords: workspace?.keywords,
  canonical: ROUTES.workspace("audio"),
});

export default function AudioWorkspacePage() {
  if (!workspace) notFound();
  return <WorkspacePage workspace={workspace} />;
}
