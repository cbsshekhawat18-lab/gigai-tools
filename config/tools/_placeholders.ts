import type { Tool } from "@/types";

/**
 * Coming-soon tools from other categories. They render as non-interactive cards
 * (ToolCard treats status !== "live" as "Soon"). Promote one to its own file
 * under config/tools/<category>/ when it's built as a full micro-site.
 */
export const COMING_SOON_TOOLS: Tool[] = [
  // ── AI ──
  { slug: "ai-writer", title: "AI Writer", description: "Draft posts, emails and copy with an AI assistant.", category: "ai-tools", icon: "PenLine", status: "coming-soon", createdAt: "2026-06-22" },
  // ── Business ──
  { slug: "invoice-generator", title: "Invoice Generator", description: "Create clean, professional invoices as PDF.", category: "business-tools", icon: "ReceiptText", status: "coming-soon", createdAt: "2026-06-08" },
  // ── Video ──
  { slug: "audio-extractor", title: "Audio Extractor", description: "Pull the audio track from any video as MP3.", category: "video-tools", icon: "AudioLines", status: "coming-soon", createdAt: "2026-06-30" },
];
