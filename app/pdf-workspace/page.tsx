import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { getWorkspaceBySlug } from "@/config/workspaces";
import { buildMetadata } from "@/lib/seo";
import { WorkspacePage } from "@/components/workspace/workspace-page";

/**
 * /pdf-workspace, server page for the PDF Workspace.
 *
 * Mirrors the image workspace: server-rendered SEO shell + a client-only,
 * code-split mount of the interactive PDF editor. Copy lives in
 * config/workspaces.
 */

const workspace = getWorkspaceBySlug("pdf");

export const metadata: Metadata = buildMetadata({
  title: workspace?.seoTitle ?? "PDF Workspace",
  description: workspace?.seoDescription ?? "",
  keywords: workspace?.keywords,
  canonical: ROUTES.workspace("pdf"),
});

export default function PdfWorkspacePage() {
  if (!workspace) notFound();
  return <WorkspacePage workspace={workspace} />;
}
