"use client";

import type { ComponentType } from "react";
import { createElement } from "react";
import dynamic from "next/dynamic";

import { LoadingState } from "@/components/shared/loading-state";

/**
 * Client mount registry for the GigAI Workspaces.
 *
 * Each workspace island (`modules/workspace/<id>.tsx`) is a heavy, browser-only
 * editor: it lazy-imports the image WASM codecs / pdf-lib / pdfjs engines at run
 * time, so there is nothing to server-render. We therefore code-split each one
 * via `next/dynamic({ ssr:false })`, which is only permitted inside a Client
 * Component, hence this whole module is `"use client"` and exposes a tiny
 * `<WorkspaceMount id=…/>` that the (server) workspace pages render directly,
 * exactly mirroring `components/tool/tool-ui-registry.ts`.
 *
 * Keeping the dynamic imports here (not in the server page) guarantees the
 * engines never touch the SSR/initial bundle; the server page stays a fast,
 * SEO-rich shell and the interactive workspace streams in as its own chunk.
 */

const loading = () =>
  createElement(LoadingState, { rows: 6, label: "Loading workspace…" });

/** The set of workspaces that have a live interactive island. */
export type WorkspaceId =
  | "image"
  | "pdf"
  | "svg"
  | "audio"
  | "video"
  | "document"
  | "developer"
  | "qr"
  | "seo";

const WORKSPACE_UI: Record<WorkspaceId, ComponentType> = {
  image: dynamic(() => import("@/modules/workspace/image-workspace"), {
    ssr: false,
    loading,
  }),
  pdf: dynamic(() => import("@/modules/workspace/pdf-workspace"), {
    ssr: false,
    loading,
  }),
  svg: dynamic(() => import("@/modules/workspace/svg-workspace"), {
    ssr: false,
    loading,
  }),
  audio: dynamic(() => import("@/modules/workspace/audio-workspace"), {
    ssr: false,
    loading,
  }),
  video: dynamic(() => import("@/modules/workspace/video-workspace"), {
    ssr: false,
    loading,
  }),
  document: dynamic(() => import("@/modules/workspace/document-workspace"), {
    ssr: false,
    loading,
  }),
  developer: dynamic(() => import("@/modules/workspace/developer-workspace"), {
    ssr: false,
    loading,
  }),
  qr: dynamic(() => import("@/modules/workspace/qr-workspace"), {
    ssr: false,
    loading,
  }),
  seo: dynamic(() => import("@/modules/workspace/seo-workspace"), {
    ssr: false,
    loading,
  }),
};

/** Render the interactive workspace island for `id`, client-side only. */
export function WorkspaceMount({ id }: { id: WorkspaceId }) {
  const Island = WORKSPACE_UI[id];
  return <Island />;
}
