/** Page address rules - keep in lock-step with SLUG_RE/RESERVED in v1_poster.py. */

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

export const RESERVED_SLUGS = new Set([
  "api", "v1", "admin", "create", "dashboard", "developers", "p", "www", "tools",
  "static", "_next", "og", "assets", "login", "signup", "me", "new", "edit",
]);

/** Best-effort slug from a display name: ASCII letters/digits only, hyphenated. */
export function suggestSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function slugProblem(slug: string): string | null {
  if (!SLUG_RE.test(slug)) return "Use 3-40 lowercase letters, digits or hyphens.";
  if (RESERVED_SLUGS.has(slug)) return "That address is reserved.";
  return null;
}
