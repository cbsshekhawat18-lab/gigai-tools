import { describe, expect, it } from "vitest";

import { analyzeAccessLog } from "../logs";
import { chunkText } from "../chunks";
import { compareEntitySources } from "../entity";
import { generateLlmsTxt, sectionsFromUrls } from "../llms";
import { crawlerForUserAgent, AI_CRAWLERS } from "../crawlers";

/* --------------------------------- logs ---------------------------------- */

const UA_GPT =
  "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0; +https://openai.com/gptbot";
const UA_HUMAN = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0";

const logLine = (ip: string, path: string, status: number, ua: string, day = "10") =>
  `${ip} - - [${day}/Oct/2024:13:55:36 +0000] "GET ${path} HTTP/1.1" ${status} 2326 "-" "${ua}"`;

describe("access log analysis", () => {
  it("identifies AI crawlers and ignores human traffic", () => {
    const log = [
      logLine("203.0.113.5", "/pricing", 200, UA_GPT),
      logLine("203.0.113.9", "/pricing", 200, UA_HUMAN),
    ].join("\n");
    const report = analyzeAccessLog(log);
    expect(report.parsedLines).toBe(2);
    expect(report.aiHits).toBe(1);
    expect(report.bots).toHaveLength(1);
    expect(report.bots[0]?.crawler.token).toBe("GPTBot");
  });

  it("never retains IP addresses anywhere in the report", () => {
    const report = analyzeAccessLog(logLine("203.0.113.5", "/x", 200, UA_GPT));
    expect(JSON.stringify(report)).not.toContain("203.0.113.5");
  });

  it("aggregates paths, statuses and dates per bot", () => {
    const log = [
      logLine("1.1.1.1", "/a", 200, UA_GPT, "10"),
      logLine("1.1.1.1", "/a", 200, UA_GPT, "11"),
      logLine("1.1.1.1", "/b", 403, UA_GPT, "12"),
    ].join("\n");
    const bot = analyzeAccessLog(log).bots[0]!;
    expect(bot.hits).toBe(3);
    expect(bot.topPaths[0]).toEqual({ path: "/a", hits: 2 });
    expect(bot.statuses["403"]).toBe(1);
    expect(Object.keys(bot.byDay)).toHaveLength(3);
  });

  it("strips query strings when grouping paths", () => {
    const report = analyzeAccessLog(logLine("1.1.1.1", "/a?utm=x", 200, UA_GPT));
    expect(report.bots[0]?.topPaths[0]?.path).toBe("/a");
  });

  it("lists crawlers that never appeared", () => {
    const report = analyzeAccessLog(logLine("1.1.1.1", "/a", 200, UA_GPT));
    expect(report.neverSeen.some((c) => c.token === "PerplexityBot")).toBe(true);
    expect(report.neverSeen.some((c) => c.token === "GPTBot")).toBe(false);
  });

  it("reports pages no AI crawler ever fetched", () => {
    const report = analyzeAccessLog(logLine("1.1.1.1", "/a", 200, UA_GPT), [
      "/a",
      "https://example.com/never-crawled",
    ]);
    expect(report.neverFetched).toEqual(["/never-crawled"]);
  });

  it("counts unparseable lines without crashing", () => {
    const report = analyzeAccessLog("garbage line\n" + logLine("1.1.1.1", "/a", 200, UA_GPT));
    expect(report.totalLines).toBe(2);
    expect(report.parsedLines).toBe(1);
  });
});

describe("crawler identification", () => {
  it("does not treat control tokens as visiting crawlers", () => {
    expect(crawlerForUserAgent("Google-Extended")).toBeUndefined();
  });

  it("has a unique token per crawler", () => {
    const tokens = AI_CRAWLERS.map((c) => c.token.toLowerCase());
    expect(new Set(tokens).size).toBe(tokens.length);
  });
});

/* -------------------------------- chunking -------------------------------- */

describe("chunk judging", () => {
  it("flags a chunk that opens with a pronoun and has no heading", () => {
    const report = chunkText(
      "It also supports transparency, which is why so many designers reach for the format when they need it.",
    );
    expect(report.chunks[0]?.standalone).toBe(false);
    expect(report.chunks[0]?.flags.some((f) => f.kind === "pronoun-open")).toBe(true);
  });

  it("lets a heading rescue a pronoun opener", () => {
    const report = chunkText(
      "## WebP transparency\n\nIt supports an alpha channel, which is why designers reach for the format when they need transparent backgrounds in production.",
    );
    expect(report.chunks[0]?.flags.some((f) => f.kind === "pronoun-open")).toBe(false);
  });

  it("flags back-references regardless of heading", () => {
    const report = chunkText(
      "## Compression results\n\nAs mentioned above, it compresses well, and the benchmark numbers there confirm the pattern across every sample tested.",
    );
    expect(report.chunks[0]?.flags.some((f) => f.kind === "back-reference")).toBe(true);
  });

  it("flags chunks too thin to answer anything", () => {
    const report = chunkText("## Short\n\nYes.");
    expect(report.chunks[0]?.flags.some((f) => f.kind === "too-thin")).toBe(true);
  });

  it("passes a self-contained section", () => {
    const report = chunkText(
      "## What is WebP?\n\nWebP is an image format Google released in 2010 that compresses photographs about 30% smaller than JPEG at equivalent visual quality, with support for transparency and animation.",
    );
    expect(report.chunks[0]?.standalone).toBe(true);
    expect(report.verdict).toContain("All 1 chunks");
  });

  it("splits long sections into windows, and later windows lose the heading", () => {
    const long = "WebP compresses photographs efficiently in production pipelines. ".repeat(40);
    const report = chunkText(`## Long section\n\n${long}`);
    expect(report.total).toBeGreaterThan(1);
    expect(report.chunks[0]?.heading).toBe("Long section");
    expect(report.chunks[1]?.heading).toBe("");
    expect(report.chunks[1]?.windowed).toBe(true);
  });

  it("counts failing chunks in the verdict", () => {
    const report = chunkText(
      "## Good section\n\nWebP is an image format released by Google in 2010 that compresses photographs roughly 30% smaller than JPEG.\n\n## Bad section\n\nIt does that too, as mentioned above, and the results carry over to every other case we tested here.",
    );
    expect(report.failing).toBeGreaterThan(0);
    expect(report.verdict).toContain(`${report.failing} of your ${report.total}`);
  });
});

/* --------------------------------- entity --------------------------------- */

describe("entity consistency", () => {
  it("detects name-spelling drift across sources", () => {
    const report = compareEntitySources("GigAI", [
      { label: "Website", text: "GigAI builds free browser tools." },
      { label: "GitHub", text: "Gigai builds free browser tools." },
    ]);
    expect(report.nameVariants).toHaveLength(2);
    expect(report.findings.some((f) => f.kind === "name-drift")).toBe(true);
  });

  it("detects conflicting numbers sharing a unit", () => {
    const report = compareEntitySources("Acme", [
      { label: "Website", text: "Acme ships 262 tools to teams worldwide every single day of the year." },
      { label: "GitHub", text: "Acme ships 250 tools to teams worldwide every single day of the year." },
    ]);
    expect(report.findings.some((f) => f.kind === "number-conflict")).toBe(true);
  });

  it("does not flag agreeing numbers, and lists them as agreed facts", () => {
    const report = compareEntitySources("Acme", [
      { label: "Website", text: "Acme ships 262 tools to teams worldwide every single day of the year." },
      { label: "GitHub", text: "Acme ships 262 tools to teams worldwide every single day of the year." },
    ]);
    expect(report.findings.some((f) => f.kind === "number-conflict")).toBe(false);
    expect(report.agreedFacts.length).toBeGreaterThan(0);
  });

  it("flags profiles too thin to corroborate", () => {
    const report = compareEntitySources("Acme", [
      { label: "Website", text: "Acme builds free browser-based tools for teams that handle sensitive files daily." },
      { label: "G2", text: "Acme tools." },
    ]);
    expect(report.findings.some((f) => f.kind === "length-outlier")).toBe(true);
  });
});

/* --------------------------------- llms.txt ------------------------------- */

describe("llms.txt generation", () => {
  it("groups URLs by first path segment", () => {
    const sections = sectionsFromUrls([
      "https://x.com/",
      "https://x.com/docs/install",
      "https://x.com/docs/api",
      "https://x.com/blog/launch",
    ]);
    const docs = sections.find((s) => s.title === "Docs");
    expect(docs?.links).toHaveLength(2);
    expect(sections.find((s) => s.title === "Main pages")).toBeDefined();
  });

  it("renders spec-shaped Markdown", () => {
    const out = generateLlmsTxt({
      siteName: "Acme",
      summary: "Self-hosted analytics.",
      sections: [{ title: "Docs", links: [{ title: "Install", url: "https://x.com/docs/install" }] }],
    });
    expect(out).toContain("# Acme");
    expect(out).toContain("> Self-hosted analytics.");
    expect(out).toContain("## Docs");
    expect(out).toContain("- [Install](https://x.com/docs/install)");
  });

  it("caps links per section", () => {
    const urls = Array.from({ length: 40 }, (_, i) => `https://x.com/docs/page-${i}`);
    expect(sectionsFromUrls(urls, 25)[0]?.links).toHaveLength(25);
  });
});
