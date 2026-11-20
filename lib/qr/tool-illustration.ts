/**
 * Bridges the Tool registry to the branded SVG illustration generators. Keeps
 * the "does this tool get a generated illustration, with what seed and from
 * which art system?" decision in ONE place so the tool page hero and the tool
 * card stay consistent, and so every other category (image/pdf/dev) is
 * provably unaffected.
 *
 * Four art systems share the same variant vocabulary ("icon" | "card" | "hero"
 * | "banner"):
 *   • QR studio  → `lib/qr/illustrations`  (qr-tools + any tool with a QR seed)
 *   • SEO toolkit → `lib/seo-tools/illustrations` (seo-tools; seeded by group)
 *   • SVG toolkit → `lib/svg-tools/illustrations` (svg-tools; seeded by group)
 *   • Document Studio → `lib/document-tools/illustrations` (document-tools;
 *     seeded by group)
 *   • Video Toolkit → `lib/video-tools/illustrations` (video-tools; seeded by
 *     group)
 *   • Audio Toolkit → `lib/audio-tools/illustrations` (audio-tools; seeded by
 *     group)
 *
 * The bridge is category-aware but intentionally tiny; new art systems slot in
 * by adding one branch here.
 */
import type { Tool, ToolCardData } from "@/types";

/** The minimal tool shape the illustration bridge reads. Both `Tool` and
 *  `ToolCardData` satisfy it, so cards and hero pages share one code path. */
type IllustratableTool = Pick<
  ToolCardData,
  "slug" | "category" | "group" | "illustration" | "accent"
>;
import {
  getQrIllustration,
  type QrIllustrationVariant,
} from "@/lib/qr/illustrations";
import { getSeoIllustration } from "@/lib/seo-tools/illustrations";
import { getSvgIllustration } from "@/lib/svg-tools/illustrations";
import { getVideoIllustration } from "@/lib/video-tools/illustrations";
import { getAudioIllustration } from "@/lib/audio-tools/illustrations";
import { getToolArt } from "@/lib/tool-art/illustrations";

/** Category whose tools opt into QR-studio illustrations by default. */
export const QR_CATEGORY_SLUG = "qr-tools";
/** Category whose tools opt into SEO-toolkit illustrations by default. */
export const SEO_CATEGORY_SLUG = "seo-tools";
/** Category whose tools opt into SVG-toolkit illustrations by default. */
export const SVG_CATEGORY_SLUG = "svg-tools";
/** Category whose tools opt into Document-Studio illustrations by default. */
export const DOCUMENT_CATEGORY_SLUG = "document-tools";
/** Category whose tools opt into Video-Toolkit illustrations by default. */
export const VIDEO_CATEGORY_SLUG = "video-tools";
/** Category whose tools opt into Audio-Toolkit illustrations by default. */
export const AUDIO_CATEGORY_SLUG = "audio-tools";

/**
 * Shared variant preset. QR and SEO illustration systems intentionally expose
 * the exact same variant keys, so a single alias covers both.
 */
export type ToolIllustrationVariant = QrIllustrationVariant;

/**
 * The illustration seed for a tool. EVERY tool now gets a seed so every card
 * carries branded artwork: a tool with `illustration` uses that; a tool in a
 * category with a bespoke art system (QR, SEO, SVG, Document, Video, Audio)
 * seeds from its `group` (so a whole sub-category shares a motif) or slug; and
 * every other category (developer, image, pdf, ai, business, …) falls back to
 * the generic "app window" art system, also seeded by slug.
 */
export function toolIllustrationSeed(tool: IllustratableTool): string {
  if (tool.illustration) return tool.illustration;
  // Seed by SLUG (not group) so EVERY tool gets a distinct illustration, a
  // group seed made e.g. all Schema generators render the identical card. The
  // group is folded in so tools in a family still share a subtle resemblance,
  // but the per-tool slug guarantees a unique glyph + node layout.
  if (tool.category === QR_CATEGORY_SLUG) return tool.slug;
  if (
    tool.category === SEO_CATEGORY_SLUG ||
    tool.category === SVG_CATEGORY_SLUG ||
    tool.category === DOCUMENT_CATEGORY_SLUG ||
    tool.category === VIDEO_CATEGORY_SLUG ||
    tool.category === AUDIO_CATEGORY_SLUG
  ) {
    return tool.group ? `${tool.group}:${tool.slug}` : tool.slug;
  }
  // Generic system: seed by slug so each tool's window layout differs.
  return tool.slug;
}

/**
 * Rendered inline-SVG string for a tool at the given variant, or `null` when the
 * tool has no illustration. `accent` follows the same override chain as the rest
 * of the page: tool accent → category accent → default.
 */
export function toolIllustrationSvg(
  tool: IllustratableTool,
  variant: ToolIllustrationVariant,
  accent: Tool["accent"] | undefined,
): string | null {
  const seed = toolIllustrationSeed(tool);
  if (tool.category === QR_CATEGORY_SLUG) {
    return getQrIllustration(seed, variant, accent ? { accent } : {});
  }
  if (tool.category === SEO_CATEGORY_SLUG) {
    return getSeoIllustration(seed, variant, accent ? { accent } : {});
  }
  if (tool.category === SVG_CATEGORY_SLUG) {
    return getSvgIllustration(seed, variant, accent ? { accent } : {});
  }
  if (tool.category === VIDEO_CATEGORY_SLUG) {
    return getVideoIllustration(seed, variant, accent ? { accent } : {});
  }
  if (tool.category === AUDIO_CATEGORY_SLUG) {
    return getAudioIllustration(seed, variant, accent ? { accent } : {});
  }
  // Document tools + image/pdf/developer/ai/business → the generic SCENE library.
  // Seeded by the SLUG (not group) so each tool is unique AND its scene +
  // format labels are derived from the exact tool (e.g. "docx-to-pdf" → a
  // DOCX → PDF convert scene). The scene library depicts the tool's job.
  return getToolArt(tool.slug, variant, {
    ...(accent ? { accent } : {}),
    category: tool.category,
  });
}
