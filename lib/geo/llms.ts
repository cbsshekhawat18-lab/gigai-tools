/**
 * GigAI GEO engine: llms.txt generation.
 *
 * Builds a spec-shaped llms.txt (https://llmstxt.org): an H1 with the site
 * name, a blockquote summary, then H2 sections of `- [title](url): note`
 * links. Input can be a parsed sitemap / URL list, which we auto-group by
 * first path segment so a 300-URL sitemap becomes a readable file.
 *
 * The tool's COPY is honest that llms.txt is optional (Google said in 2026 it
 * isn't used by its AI search); the generator itself just does the job well.
 */

export interface LlmsLink {
  title: string;
  url: string;
  note?: string;
}

export interface LlmsSection {
  title: string;
  links: LlmsLink[];
}

export interface LlmsConfig {
  siteName: string;
  /** One-sentence summary rendered as the blockquote. */
  summary: string;
  /** Optional free paragraph after the summary. */
  details?: string;
  sections: LlmsSection[];
  /** Optional secondary section whose links AI agents may skip. */
  optional?: LlmsLink[];
}

/** Render the llms.txt markdown. */
export function generateLlmsTxt(config: LlmsConfig): string {
  const out: string[] = [];
  out.push(`# ${config.siteName.trim() || "Site"}`);
  if (config.summary.trim()) out.push("", `> ${config.summary.trim()}`);
  if (config.details?.trim()) out.push("", config.details.trim());
  for (const section of config.sections) {
    const links = section.links.filter((l) => l.url.trim());
    if (!links.length) continue;
    out.push("", `## ${section.title.trim() || "Pages"}`, "");
    for (const l of links) {
      const title = l.title.trim() || l.url.replace(/^https?:\/\/[^/]+/, "") || l.url;
      out.push(`- [${title}](${l.url.trim()})${l.note?.trim() ? `: ${l.note.trim()}` : ""}`);
    }
  }
  const optional = (config.optional ?? []).filter((l) => l.url.trim());
  if (optional.length) {
    out.push("", "## Optional", "");
    for (const l of optional) {
      out.push(`- [${l.title.trim() || l.url}](${l.url.trim()})${l.note?.trim() ? `: ${l.note.trim()}` : ""}`);
    }
  }
  return out.join("\n") + "\n";
}

/** Title-case a slug segment: "how-to-guides" → "How to guides". */
function humanize(segment: string): string {
  const s = segment.replace(/[-_]+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Group a flat URL list into llms.txt sections by first path segment,
 * root-level pages land in "Main pages". Caps links per section so a huge
 * sitemap still yields a file an LLM would actually read.
 */
export function sectionsFromUrls(urls: string[], maxPerSection = 25): LlmsSection[] {
  const groups = new Map<string, LlmsLink[]>();
  for (const raw of urls) {
    const url = raw.trim();
    if (!url) continue;
    let path = url;
    try {
      path = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).pathname;
    } catch {
      continue;
    }
    const segments = path.split("/").filter(Boolean);
    const key = segments.length > 1 ? humanize(segments[0] ?? "") : "Main pages";
    const title = humanize(segments[segments.length - 1] ?? "") || "Home";
    if (!groups.has(key)) groups.set(key, []);
    const list = groups.get(key)!;
    if (list.length < maxPerSection) list.push({ title, url });
  }
  return Array.from(groups.entries())
    .sort((a, b) => (a[0] === "Main pages" ? -1 : b[0] === "Main pages" ? 1 : b[1].length - a[1].length))
    .map(([title, links]) => ({ title, links }));
}
