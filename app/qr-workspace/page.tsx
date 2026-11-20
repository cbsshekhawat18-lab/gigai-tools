import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { getWorkspaceBySlug } from "@/config/workspaces";
import { buildMetadata } from "@/lib/seo";
import { WorkspacePage } from "@/components/workspace/workspace-page";

/**
 * /qr-workspace: server page for the QR & Barcode Workspace.
 *
 * All SEO (metadata, JSON-LD, hero, how-it-works, FAQ, related tools) is
 * rendered server-side by <WorkspacePage>, which mounts the interactive QR
 * studio as a code-split, client-only island. Copy lives in config/workspaces.
 */

const workspace = getWorkspaceBySlug("qr");

export const metadata: Metadata = buildMetadata({
  title: workspace?.seoTitle ?? "QR & Barcode Workspace",
  description: workspace?.seoDescription ?? "",
  keywords: workspace?.keywords,
  canonical: ROUTES.workspace("qr"),
});

export default function QrWorkspacePage() {
  if (!workspace) notFound();
  return <WorkspacePage workspace={workspace} />;
}
