/**
 * Whether a file satisfies a simple comma-separated `accept` list
 * (".pdf,image/*,application/json" style, extension, wildcard or exact MIME).
 * Single shared matcher for uploaders, paste handlers and the recent-files
 * store; use-pdf-tool re-exports its private copy from here.
 */
export function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;

  const mime = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();

  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}
