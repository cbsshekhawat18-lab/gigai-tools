/**
 * Tiny, registry-free tool metadata derivations shared by the assistant's
 * intent engine (client, lazy) and the tool page's "at a glance" facts strip
 * (server, build time). Deterministic and honest, an estimate, never a
 * promise of speed.
 */
import type { Tool } from "@/types";

export type ToolDifficulty = "Easy" | "Medium";

/** Heavier, multi-step categories get a "Medium" difficulty hint. */
const MEDIUM_DIFFICULTY_CATEGORIES = new Set(["video-tools", "audio-tools"]);

/** Per-category rough time estimate. */
const CATEGORY_EST_TIME: Record<string, string> = {
  "image-tools": "~10s",
  "pdf-tools": "~15s",
  "qr-tools": "~5s",
  "seo-tools": "~30s",
  "svg-tools": "~10s",
  "dev-tools": "~5s",
  "document-tools": "~15s",
  "video-tools": "~1–2m",
  "audio-tools": "~30s",
};

export function toolDifficulty(tool: Pick<Tool, "category">): ToolDifficulty {
  return MEDIUM_DIFFICULTY_CATEGORIES.has(tool.category) ? "Medium" : "Easy";
}

export function toolEstTime(tool: Pick<Tool, "category">): string {
  return CATEGORY_EST_TIME[tool.category] ?? "~15s";
}
