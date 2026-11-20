import type { IconName } from "@/types";
import { ROUTES } from "@/config/constants";
import { getAllTools, isLiveTool } from "@/lib/registry";
import { inferFileTypes } from "@/lib/discovery";

/**
 * lib/search-index-data: builds the SLIM, intent-aware search index.
 *
 * Each entry carries only what search needs (slug, title, description,
 * category, keywords, fileTypes, icon, href). NOT the full tool config. This
 * is the payload that `lib/search` fuzzy-matches over.
 *
 * SERVER-SAFE (imports the registry). Client islands must not import this
 * directly; instead they lazy-load `lib/search`, which builds this index once
 * on first use, preserving the existing search-bar lazy-load contract and
 * keeping ~249 tool configs out of the client First Load.
 */

/** One slim, searchable record. Deliberately small & serialisable. */
export interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  /** Inferred/declared file types (e.g. ["png","jpg"]). */
  fileTypes: string[];
  icon: IconName;
  href: string;
}

/**
 * Audience/intent synonyms → the search tokens they should also match. Lets a
 * search for "instagram" surface resize/crop/thumbnail tools even when those
 * tools never mention Instagram, and "compress" fan out across every category.
 */
export const INTENT_SYNONYMS: Record<string, string[]> = {
  instagram: ["resize", "crop", "square", "story", "thumbnail", "qr", "post", "reel"],
  facebook: ["resize", "crop", "open graph", "share", "qr", "cover"],
  twitter: ["card", "resize", "crop", "preview", "share"],
  x: ["card", "resize", "crop", "preview"],
  linkedin: ["resize", "crop", "banner", "qr", "profile"],
  youtube: ["thumbnail", "resize", "qr", "video", "gif"],
  tiktok: ["video", "resize", "crop", "gif", "trim"],
  whatsapp: ["qr", "share", "compress", "gif"],
  shrink: ["compress", "reduce", "smaller", "optimize"],
  smaller: ["compress", "reduce", "shrink", "optimize"],
  reduce: ["compress", "shrink", "optimize"],
  optimize: ["compress", "minify", "shrink"],
  minify: ["minifier", "compress", "optimize"],
  combine: ["merge", "join", "concat"],
  join: ["merge", "combine", "joiner"],
  merge: ["combine", "join", "merger"],
  split: ["separate", "extract", "splitter", "divide"],
  convert: ["converter", "change", "transform", "to"],
  cut: ["trim", "trimmer", "cutter", "clip", "split"],
  trim: ["cut", "trimmer", "clip"],
  logo: ["svg", "vector", "qr", "brand", "trace"],
  transparent: ["png", "alpha"],
  password: ["protect", "lock", "encrypt", "secure"],
  secure: ["password", "protect", "encrypt"],
  scan: ["scanner", "reader", "decoder", "qr"],
};

/**
 * Build the slim search index over every LIVE tool. Called once (and
 * memoised) by `lib/search`. Pure & deterministic.
 */
export function buildSearchIndex(): SearchIndexEntry[] {
  return getAllTools().filter(isLiveTool).map((tool) => ({
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    category: tool.category,
    keywords: tool.keywords ?? [],
    fileTypes: inferFileTypes(tool),
    icon: tool.icon,
    href: ROUTES.tool(tool.slug),
  }));
}
