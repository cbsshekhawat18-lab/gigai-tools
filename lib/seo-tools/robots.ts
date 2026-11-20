/**
 * GigAI Tools: robots.txt engine.
 *
 * Generates a robots.txt from a structured group model and parses/lints a
 * pasted robots.txt back into groups, surfacing common mistakes (a bare
 * `Disallow: /` that blocks the whole site, missing sitemap, unknown
 * directives). Pure, dependency-free, no network.
 */

export interface RobotsGroup {
  /** One or more user-agents this group applies to (defaults to `*`). */
  userAgent: string | string[];
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

export interface RobotsConfig {
  groups: RobotsGroup[];
  sitemaps?: string[];
  host?: string;
}

/** Generate a robots.txt string from a structured config. */
export function generateRobots(config: RobotsConfig): string {
  const blocks: string[] = [];

  for (const group of config.groups) {
    const agents = Array.isArray(group.userAgent) ? group.userAgent : [group.userAgent];
    const lines: string[] = [];
    for (const ua of agents) lines.push(`User-agent: ${ua.trim() || "*"}`);
    for (const path of group.allow ?? []) {
      if (path.trim() !== "" || path === "") lines.push(`Allow: ${path}`);
    }
    for (const path of group.disallow ?? []) {
      lines.push(`Disallow: ${path}`);
    }
    if (group.crawlDelay !== undefined && Number.isFinite(group.crawlDelay)) {
      lines.push(`Crawl-delay: ${group.crawlDelay}`);
    }
    blocks.push(lines.join("\n"));
  }

  if (config.host?.trim()) blocks.push(`Host: ${config.host.trim()}`);

  const sitemapLines = (config.sitemaps ?? [])
    .filter((s) => s.trim())
    .map((s) => `Sitemap: ${s.trim()}`);
  if (sitemapLines.length) blocks.push(sitemapLines.join("\n"));

  return blocks.join("\n\n") + "\n";
}

/* -------------------------------- parsing --------------------------------- */

export interface ParsedRobotsGroup {
  userAgents: string[];
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsAnalysis {
  ok: boolean;
  groups: ParsedRobotsGroup[];
  sitemaps: string[];
  host?: string;
  warnings: string[];
  errors: string[];
}

const KNOWN_DIRECTIVES = new Set([
  "user-agent",
  "allow",
  "disallow",
  "crawl-delay",
  "sitemap",
  "host",
  "clean-param",
  "request-rate",
  "visit-time",
]);

/**
 * Parse and lint a robots.txt string. Groups are delimited by `User-agent`
 * lines; comments (`#`) and blanks are ignored. Warnings flag site-wide blocks,
 * a missing sitemap, and unknown directives.
 */
export function validateRobots(text: string): RobotsAnalysis {
  const warnings: string[] = [];
  const errors: string[] = [];
  const groups: ParsedRobotsGroup[] = [];
  const sitemaps: string[] = [];
  let host: string | undefined;

  const lines = text.split(/\r?\n/);
  let current: ParsedRobotsGroup | null = null;
  // A run of consecutive User-agent lines shares one group.
  let lastWasUserAgent = false;

  lines.forEach((rawLine, idx) => {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) {
      lastWasUserAgent = false;
      return;
    }
    const colon = line.indexOf(":");
    if (colon === -1) {
      warnings.push(`Line ${idx + 1}: "${rawLine.trim()}" is not a valid "directive: value" line.`);
      return;
    }
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (!KNOWN_DIRECTIVES.has(directive)) {
      warnings.push(`Line ${idx + 1}: unknown directive "${directive}".`);
    }

    switch (directive) {
      case "user-agent": {
        if (!current || !lastWasUserAgent) {
          current = { userAgents: [], allow: [], disallow: [] };
          groups.push(current);
        }
        current.userAgents.push(value || "*");
        lastWasUserAgent = true;
        return;
      }
      case "allow":
      case "disallow": {
        if (!current) {
          current = { userAgents: ["*"], allow: [], disallow: [] };
          groups.push(current);
          warnings.push(`Line ${idx + 1}: "${directive}" appears before any User-agent; assuming "*".`);
        }
        if (directive === "allow") current.allow.push(value);
        else current.disallow.push(value);
        lastWasUserAgent = false;
        return;
      }
      case "crawl-delay": {
        const n = Number(value);
        if (!Number.isFinite(n)) {
          warnings.push(`Line ${idx + 1}: Crawl-delay "${value}" is not a number.`);
        } else if (current) {
          current.crawlDelay = n;
        }
        lastWasUserAgent = false;
        return;
      }
      case "sitemap": {
        if (value) sitemaps.push(value);
        if (value && !/^https?:\/\//i.test(value))
          warnings.push(`Line ${idx + 1}: Sitemap should be an absolute URL.`);
        lastWasUserAgent = false;
        return;
      }
      case "host": {
        host = value;
        lastWasUserAgent = false;
        return;
      }
      default:
        lastWasUserAgent = false;
    }
  });

  if (groups.length === 0) errors.push("No User-agent groups found.");

  for (const g of groups) {
    const label = g.userAgents.join(", ") || "*";
    const blocksAll = g.disallow.some((d) => d.trim() === "/");
    const allowsRoot = g.allow.some((a) => a.trim() === "/");
    if (blocksAll && !allowsRoot) {
      warnings.push(`Group [${label}] blocks the entire site with "Disallow: /". Confirm that is intended.`);
    }
    if (g.disallow.length === 0 && g.allow.length === 0) {
      warnings.push(`Group [${label}] has no Allow/Disallow rules (allows everything).`);
    }
  }

  if (sitemaps.length === 0) {
    warnings.push("No Sitemap directive: add one so crawlers can discover your sitemap.");
  }

  return {
    ok: errors.length === 0,
    groups,
    sitemaps,
    host,
    warnings,
    errors,
  };
}
