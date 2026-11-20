/**
 * GigAI GEO engine: RFC 9309-compliant robots.txt matching.
 *
 * The existing lib/seo-tools/robots engine parses and LINTS a robots.txt; this
 * module answers the harder question the AI crawler checker needs: "may THIS
 * product token fetch THIS path, and exactly which rule decided that?"
 *
 * Implements the Robots Exclusion Protocol the way real crawlers do:
 *   • consecutive User-agent lines share one group; groups with the same
 *     token are merged (RFC 9309 §2.2.1)
 *   • group selection: the most specific matching user-agent wins (exact
 *     token match beats a prefix match beats `*`)
 *   • path rules support `*` wildcards and the `$` end anchor
 *   • precedence: the longest matching rule wins; on a tie, Allow wins
 *   • no matching rule at all means allowed (crawling is opt-out)
 *
 * Every verdict carries the exact line that decided it, evidence, not just a
 * checkmark. Pure functions, no network, no DOM.
 */

export interface RobotsRule {
  type: "allow" | "disallow";
  /** The raw path pattern as written (may contain `*` and `$`). */
  path: string;
  /** 1-based line number in the source text. */
  line: number;
  /** The raw source line, quoted in verdicts. */
  raw: string;
}

export interface MatchGroup {
  /** Lower-cased user-agent tokens this group applies to. */
  agents: string[];
  /** The raw User-agent lines (for quoting). */
  agentLines: { value: string; line: number; raw: string }[];
  rules: RobotsRule[];
}

export interface ParsedRobotsForMatch {
  groups: MatchGroup[];
  sitemaps: string[];
  /** Non-standard `Content-Signal:` lines (Cloudflare's usage-preference scheme). */
  contentSignals: { value: string; line: number }[];
  /** True when the file carries Cloudflare's managed-robots.txt markers. */
  cloudflareManaged: boolean;
  totalLines: number;
}

/** Parse a robots.txt into match-ready groups (merging duplicate tokens per RFC 9309). */
export function parseRobotsForMatch(text: string): ParsedRobotsForMatch {
  const lines = text.split(/\r?\n/);
  const groups: MatchGroup[] = [];
  const sitemaps: string[] = [];
  const contentSignals: { value: string; line: number }[] = [];
  let cloudflareManaged = false;

  let current: MatchGroup | null = null;
  let lastWasAgent = false;

  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    // Cloudflare's injected managed section announces itself in comments.
    if (/cloudflare/i.test(rawLine) && rawLine.trim().startsWith("#")) cloudflareManaged = true;

    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) {
      // A blank line does NOT end a group's rules per RFC 9309, but it does
      // end a run of consecutive User-agent lines.
      lastWasAgent = false;
      return;
    }
    const colon = line.indexOf(":");
    if (colon === -1) {
      lastWasAgent = false;
      return;
    }
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    switch (directive) {
      case "user-agent": {
        if (!current || !lastWasAgent) {
          current = { agents: [], agentLines: [], rules: [] };
          groups.push(current);
        }
        current.agents.push((value || "*").toLowerCase());
        current.agentLines.push({ value: value || "*", line: lineNo, raw: rawLine.trim() });
        lastWasAgent = true;
        return;
      }
      case "allow":
      case "disallow": {
        lastWasAgent = false;
        if (!current) {
          // Rules before any User-agent are ignored by real crawlers.
          return;
        }
        // An empty Disallow means "allow everything", it matches nothing.
        if (value === "") return;
        current.rules.push({ type: directive, path: value, line: lineNo, raw: rawLine.trim() });
        return;
      }
      case "sitemap": {
        lastWasAgent = false;
        if (value) sitemaps.push(value);
        return;
      }
      case "content-signal": {
        lastWasAgent = false;
        contentSignals.push({ value, line: lineNo });
        return;
      }
      default:
        lastWasAgent = false;
    }
  });

  return { groups, sitemaps, contentSignals, cloudflareManaged, totalLines: lines.length };
}

/* ------------------------------ group selection --------------------------- */

export interface GroupSelection {
  group: MatchGroup | null;
  /** How the group matched: exact token, prefix of the token, or the `*` fallback. */
  via: "exact" | "prefix" | "wildcard" | "none";
  /** The agent line that matched (for quoting). */
  agentLine?: { value: string; line: number; raw: string };
}

/**
 * Select the group a crawler with `productToken` obeys. Per RFC 9309 crawlers
 * merge ALL groups whose user-agent matches their token and ignore the rest;
 * specificity: an exact case-insensitive token match beats a prefix match
 * (e.g. `User-agent: Perplexity` for PerplexityBot), which beats `*`.
 */
export function selectGroupFor(parsed: ParsedRobotsForMatch, productToken: string): GroupSelection {
  const token = productToken.toLowerCase();

  const pick = (test: (agent: string) => boolean, via: GroupSelection["via"]): GroupSelection | null => {
    const matching = parsed.groups.filter((g) => g.agents.some(test));
    if (matching.length === 0) return null;
    // RFC 9309: multiple groups for the same token are combined into one.
    const merged: MatchGroup = { agents: [], agentLines: [], rules: [] };
    let agentLine: GroupSelection["agentLine"];
    for (const g of matching) {
      merged.agents.push(...g.agents);
      merged.agentLines.push(...g.agentLines);
      merged.rules.push(...g.rules);
      if (!agentLine) agentLine = g.agentLines.find((a) => test(a.value.toLowerCase()));
    }
    return { group: merged, via, agentLine };
  };

  return (
    pick((a) => a === token, "exact") ??
    // A named group like "perplexity" applying to "perplexitybot" (and the
    // reverse, "googlebot-news" style sub-tokens matching a "googlebot" group).
    pick((a) => a !== "*" && (token.startsWith(a) || a.startsWith(token)), "prefix") ??
    pick((a) => a === "*", "wildcard") ?? { group: null, via: "none" }
  );
}

/* -------------------------------- path match ------------------------------ */

/** Compile a robots path pattern (`*` wildcard, `$` end anchor) to a RegExp. */
function compilePattern(pattern: string): RegExp {
  let p = pattern;
  let anchored = false;
  if (p.endsWith("$")) {
    anchored = true;
    p = p.slice(0, -1);
  }
  const escaped = p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`);
}

/** Effective specificity of a rule = pattern length (RFC 9309's octet count heuristic). */
function ruleSpecificity(rule: RobotsRule): number {
  return rule.path.length;
}

export interface PathVerdict {
  allowed: boolean;
  /** The rule that decided it; undefined = no rule matched (default allow). */
  decidedBy?: RobotsRule;
}

/**
 * Apply a group's rules to a path. Longest (most specific) matching rule wins;
 * Allow wins a specificity tie; no match at all means allowed.
 */
export function matchPath(rules: RobotsRule[], path: string): PathVerdict {
  const target = path.startsWith("/") ? path : `/${path || ""}`;
  let best: RobotsRule | undefined;
  let bestScore = -1;
  for (const rule of rules) {
    if (!compilePattern(rule.path).test(target)) continue;
    const score = ruleSpecificity(rule);
    if (
      score > bestScore ||
      // Tie: Allow beats Disallow.
      (score === bestScore && rule.type === "allow" && best?.type === "disallow")
    ) {
      best = rule;
      bestScore = score;
    }
  }
  if (!best) return { allowed: true };
  return { allowed: best.type === "allow", decidedBy: best };
}

/* ------------------------------ full verdicts ----------------------------- */

export interface CrawlerVerdict {
  /** The product token this verdict is for. */
  token: string;
  /**
   * allowed  — a matching rule (or empty group) permits the path
   * blocked  — a matching rule denies the path
   * default  — no group names this bot and no `*` group restricts it
   */
  status: "allowed" | "blocked" | "default";
  /** Which group applied and how it matched. */
  via: GroupSelection["via"];
  /** The exact rule line that decided the verdict, when one did. */
  decidedBy?: RobotsRule;
  /** The User-agent line of the group that applied. */
  agentLine?: { value: string; line: number; raw: string };
}

/** Verdict for one product token fetching `path` (default `/`). */
export function verdictFor(parsed: ParsedRobotsForMatch, productToken: string, path = "/"): CrawlerVerdict {
  const sel = selectGroupFor(parsed, productToken);
  if (!sel.group) {
    return { token: productToken, status: "default", via: "none" };
  }
  const res = matchPath(sel.group.rules, path);
  return {
    token: productToken,
    status: res.decidedBy ? (res.allowed ? "allowed" : "blocked") : sel.via === "wildcard" ? "default" : "allowed",
    via: sel.via,
    decidedBy: res.decidedBy,
    agentLine: sel.agentLine,
  };
}

/* --------------------------- Cloudflare detection ------------------------- */

export interface CloudflareSignals {
  /** The site is served through Cloudflare (from response headers). */
  behindCloudflare: boolean;
  /** The robots.txt itself carries Cloudflare managed markers or Content-Signal lines. */
  managedRobots: boolean;
  contentSignals: { value: string; line: number }[];
}

/**
 * Detect Cloudflare from a fetched response's headers + the parsed file.
 * This matters because Cloudflare can block AI crawlers at the firewall AND
 * inject a managed robots.txt section, regardless of what the site owner wrote.
 */
export function cloudflareSignals(
  parsed: ParsedRobotsForMatch,
  headers?: Record<string, string>,
): CloudflareSignals {
  const h = headers ?? {};
  const behindCloudflare =
    /cloudflare/i.test(h["server"] ?? "") || "cf-cache-status" in h || "cf-ray" in h;
  return {
    behindCloudflare,
    managedRobots: parsed.cloudflareManaged || parsed.contentSignals.length > 0,
    contentSignals: parsed.contentSignals,
  };
}
