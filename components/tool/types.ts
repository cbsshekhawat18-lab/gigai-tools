import type { WorkspaceToolData } from "@/types";

/**
 * Props passed to every interactive image-tool UI component
 * (modules/tools/image/<slug>-tool.tsx). The full registry entry is provided so
 * the workspace can read the tool's accent, slug and copy without re-fetching.
 */
export interface ImageToolProps {
  tool: WorkspaceToolData;
}
