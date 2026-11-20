import { describe, expect, it } from "vitest";

import {
  parseRobotsForMatch,
  selectGroupFor,
  matchPath,
  verdictFor,
  cloudflareSignals,
} from "../robots-match";

/**
 * RFC 9309 conformance. Correct matching is the differentiator claimed on the
 * tool page ("most online checkers get this wrong"), so it needs proving:
 * every precedence rule below is one that naive checkers get backwards.
 */

describe("group selection", () => {
  it("prefers an exact token match over the wildcard group", () => {
    const parsed = parseRobotsForMatch(`
User-agent: *
Disallow: /

User-agent: GPTBot
Allow: /
`);
    const sel = selectGroupFor(parsed, "GPTBot");
    expect(sel.via).toBe("exact");
    expect(verdictFor(parsed, "GPTBot").status).toBe("allowed");
    // The wildcard group still governs an unnamed bot.
    expect(verdictFor(parsed, "SomeOtherBot").status).toBe("blocked");
  });

  it("is case-insensitive on user-agent tokens", () => {
    const parsed = parseRobotsForMatch("User-agent: gptbot\nDisallow: /");
    expect(verdictFor(parsed, "GPTBot").status).toBe("blocked");
  });

  it("merges multiple groups naming the same token (RFC 9309 §2.2.1)", () => {
    const parsed = parseRobotsForMatch(`
User-agent: ClaudeBot
Disallow: /private/

User-agent: ClaudeBot
Disallow: /admin/
`);
    expect(verdictFor(parsed, "ClaudeBot", "/private/x").status).toBe("blocked");
    expect(verdictFor(parsed, "ClaudeBot", "/admin/x").status).toBe("blocked");
  });

  it("shares one group across consecutive User-agent lines", () => {
    const parsed = parseRobotsForMatch(`
User-agent: GPTBot
User-agent: ClaudeBot
Disallow: /
`);
    expect(verdictFor(parsed, "GPTBot").status).toBe("blocked");
    expect(verdictFor(parsed, "ClaudeBot").status).toBe("blocked");
  });

  it("reports 'default' when no group matches at all", () => {
    const parsed = parseRobotsForMatch("User-agent: Googlebot\nDisallow: /x");
    const v = verdictFor(parsed, "PerplexityBot");
    expect(v.status).toBe("default");
    expect(v.via).toBe("none");
  });
});

describe("path matching precedence", () => {
  const rules = parseRobotsForMatch(`
User-agent: *
Disallow: /admin/
Allow: /admin/help/
`).groups[0]!.rules;

  it("lets the longest matching rule win, so Allow can carve out a subtree", () => {
    expect(matchPath(rules, "/admin/secret").allowed).toBe(false);
    expect(matchPath(rules, "/admin/help/faq").allowed).toBe(true);
  });

  it("allows paths no rule matches (crawling is opt-out)", () => {
    expect(matchPath(rules, "/blog/post").allowed).toBe(true);
    expect(matchPath(rules, "/blog/post").decidedBy).toBeUndefined();
  });

  it("gives Allow the win on an equal-specificity tie", () => {
    const tie = parseRobotsForMatch("User-agent: *\nDisallow: /x\nAllow: /x").groups[0]!.rules;
    expect(matchPath(tie, "/x").allowed).toBe(true);
  });

  it("supports * wildcards mid-path", () => {
    const wild = parseRobotsForMatch("User-agent: *\nDisallow: /*?sessionid=").groups[0]!.rules;
    expect(matchPath(wild, "/page?sessionid=1").allowed).toBe(false);
    expect(matchPath(wild, "/page?other=1").allowed).toBe(true);
  });

  it("honors the $ end anchor", () => {
    const anchored = parseRobotsForMatch("User-agent: *\nDisallow: /*.pdf$").groups[0]!.rules;
    expect(matchPath(anchored, "/files/report.pdf").allowed).toBe(false);
    expect(matchPath(anchored, "/files/report.pdf.html").allowed).toBe(true);
  });

  it("treats an empty Disallow as allowing everything", () => {
    const parsed = parseRobotsForMatch("User-agent: AdsBot-Google\nDisallow:");
    expect(verdictFor(parsed, "AdsBot-Google").status).toBe("allowed");
  });

  it("ignores rules that appear before any User-agent line", () => {
    const parsed = parseRobotsForMatch("Disallow: /\n\nUser-agent: GPTBot\nAllow: /");
    expect(verdictFor(parsed, "GPTBot").status).toBe("allowed");
  });
});

describe("verdict evidence", () => {
  it("quotes the deciding rule with its line number", () => {
    const parsed = parseRobotsForMatch("User-agent: GPTBot\nDisallow: /\n");
    const v = verdictFor(parsed, "GPTBot");
    expect(v.decidedBy?.raw).toBe("Disallow: /");
    expect(v.decidedBy?.line).toBe(2);
    expect(v.agentLine?.raw).toBe("User-agent: GPTBot");
  });

  it("ignores comments when parsing", () => {
    const parsed = parseRobotsForMatch("# User-agent: GPTBot\n# Disallow: /\nUser-agent: *\nAllow: /");
    expect(verdictFor(parsed, "GPTBot").status).toBe("allowed");
  });
});

describe("Cloudflare detection", () => {
  it("detects Cloudflare from response headers", () => {
    const parsed = parseRobotsForMatch("User-agent: *\nAllow: /");
    const cf = cloudflareSignals(parsed, { server: "cloudflare" });
    expect(cf.behindCloudflare).toBe(true);
    expect(cf.managedRobots).toBe(false);
  });

  it("detects an injected managed section and Content-Signal lines", () => {
    const parsed = parseRobotsForMatch(`
# Cloudflare managed robots.txt
Content-Signal: ai-train=no

User-agent: GPTBot
Disallow: /
`);
    const cf = cloudflareSignals(parsed, {});
    expect(cf.managedRobots).toBe(true);
    expect(cf.contentSignals[0]?.value).toBe("ai-train=no");
  });

  it("reports no Cloudflare when headers are unrelated", () => {
    const parsed = parseRobotsForMatch("User-agent: *\nAllow: /");
    expect(cloudflareSignals(parsed, { server: "nginx" }).behindCloudflare).toBe(false);
  });
});
