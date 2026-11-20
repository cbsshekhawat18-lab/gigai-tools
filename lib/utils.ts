import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

import type { Tool, ToolCardData, WorkspaceToolData } from "@/types";
import { SITE } from "@/config/constants";

/** Merge Tailwind classes with correct conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Project a full registry `Tool` down to the card-only fields.
 *
 * The canonical guard for the server→client boundary: client components
 * (ToolCard, grids, rails, islands) must receive THIS shape, never a full
 * `Tool`, a full config structurally satisfies `ToolCardData`, so TypeScript
 * won't complain, but React Flight then serialises its SEO copy, FAQs and
 * how-tos into the page's RSC payload. Across 1,200 exported pages that was
 * hundreds of megabytes of build output. Pure and dependency-free on purpose,
 * so importing it never drags the registry into a client bundle.
 */
export function toToolCardData(tool: Tool | ToolCardData): ToolCardData {
  return {
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    category: tool.category,
    icon: tool.icon,
    ...(tool.group ? { group: tool.group } : {}),
    ...(tool.accent ? { accent: tool.accent } : {}),
    ...(tool.status ? { status: tool.status } : {}),
    ...(tool.isNew ? { isNew: tool.isNew } : {}),
    ...(tool.popular ? { popular: tool.popular } : {}),
    ...(tool.illustration ? { illustration: tool.illustration } : {}),
  };
}

/** Card fields + the two extras workspace modules read. Same boundary rule as
 * {@link toToolCardData}, the server tool page passes THIS to `<ToolMount>`. */
export function toWorkspaceToolData(tool: Tool): WorkspaceToolData {
  return {
    ...toToolCardData(tool),
    ...(tool.ctaText ? { ctaText: tool.ctaText } : {}),
    ...(tool.relatedTools ? { relatedTools: tool.relatedTools } : {}),
  };
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Absolute URL for the site (canonicals, OG, JSON-LD). */
export function absoluteUrl(path = ""): string {
  const clean = path.startsWith("/") || path === "" ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

/** Human date, e.g. "Jan 12, 2026". */
export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

/** Truncate to a max length on a word boundary. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).trimEnd()}…`;
}

/** Pluralize a noun by count: pluralize(3, "tool") => "3 tools". */
export function pluralize(count: number, noun: string, suffix = "s"): string {
  return `${count} ${noun}${count === 1 ? "" : suffix}`;
}
