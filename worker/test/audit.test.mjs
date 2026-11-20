/** Site Audit golden tests: checks, fixes, scoring, crawler helpers. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzePage, pageChecks, siteChecks } from "../audit/checks.mjs";
import { descriptionDraft, withFixes } from "../audit/fixes.mjs";
import { computeScores, WEIGHTS } from "../audit/score.mjs";
import { extractLinks } from "../audit/crawler.mjs";

const GOOD_PAGE = {
  url: "https://example.com/",
  status: 200,
  body: `<!doctype html><html lang="en"><head>
    <title>A perfectly reasonable page title</title>
    <meta name="description" content="A tidy description of sensible length for the snippet.">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="https://example.com/">
    <meta property="og:title" content="T"><meta property="og:description" content="D">
    <meta property="og:image" content="https://example.com/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"x"}</script>
  </head><body><h1>One heading</h1><h2>Sub</h2>
    <p>Published January 5, 2026. ${"Substantial paragraph text. ".repeat(30)}</p>
    <img src="/a.png" alt="described">
  </body></html>`,
};

const BAD_PAGE = {
  url: "https://example.com/bad",
  status: 200,
  body: `<html><head><script src="/app.js"></script><script src="/b.js"></script>
    <script src="/c.js"></script><script src="/d.js"></script>
    <script type="application/ld+json">{broken</script>
  </head><body><h1>One</h1><h1>Two</h1><h4>Jumped</h4><img src="/x.png"></body></html>`,
};

test("a well-built page produces no critical findings", () => {
  const findings = pageChecks(GOOD_PAGE, analyzePage(GOOD_PAGE));
  assert.deepEqual(findings.filter((f) => f.severity === "critical"), []);
  const ids = findings.map((f) => f.id);
  assert.ok(!ids.includes("missing-title"), ids.join(","));
  assert.ok(!ids.includes("no-structured-data"));
});

test("a broken page is caught precisely", () => {
  const findings = pageChecks(BAD_PAGE, analyzePage(BAD_PAGE));
  const ids = findings.map((f) => f.id);
  for (const expected of ["missing-title", "missing-description", "missing-canonical",
    "broken-jsonld", "multiple-h1", "heading-jump", "js-dependent-content", "missing-alt"]) {
    assert.ok(ids.includes(expected), `missing ${expected} in ${ids.join(",")}`);
  }
});

test("dead pages short-circuit to a single status finding", () => {
  const dead = { url: "https://example.com/gone", status: 404, body: "" };
  const findings = pageChecks(dead, analyzePage(dead));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].id, "page-status");
});

test("site checks read robots and sitemap", () => {
  const findings = siteChecks({
    robotsTxt: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n",
    robotsUrl: "https://example.com/robots.txt",
    sitemapStatus: 404,
    startUrl: "https://example.com/",
    pages: [GOOD_PAGE],
  });
  const ids = findings.map((f) => f.id);
  assert.ok(ids.includes("ai-crawlers-blocked"));
  assert.ok(ids.includes("missing-sitemap"));
  const blocked = findings.find((f) => f.id === "ai-crawlers-blocked");
  assert.deepEqual(blocked.data.blocked, ["GPTBot"]);
});

test("fixes are concrete code built from page evidence", () => {
  const findings = withFixes(pageChecks(BAD_PAGE, analyzePage(BAD_PAGE)));
  const canonical = findings.find((f) => f.id === "missing-canonical");
  assert.equal(canonical.fix.language, "html");
  assert.ok(canonical.fix.code.includes('href="https://example.com/bad"'));
  const og = findings.find((f) => f.id === "incomplete-og");
  assert.ok(og.fix.code.includes("og:title"));
});

test("description drafts cut at word boundaries near 155", () => {
  const long = "word ".repeat(60).trim();
  const draft = descriptionDraft(long, null);
  assert.ok(draft.length <= 156, String(draft.length));
  assert.ok(!draft.includes("wor.") || draft.endsWith("."));
  assert.equal(descriptionDraft("", null), null);
});

test("scores are transparent and bounded", () => {
  const perfect = computeScores([], 5);
  assert.equal(perfect.seo, 100);
  assert.equal(perfect.aiVisibility, 100);
  const findings = withFixes(pageChecks(BAD_PAGE, analyzePage(BAD_PAGE)));
  const scored = computeScores(findings, 1);
  assert.ok(scored.seo < 100 && scored.seo >= 0);
  assert.ok(scored.aiVisibility < 100 && scored.aiVisibility >= 0);
  assert.ok(scored.weights === WEIGHTS);
  // every check id used by pageChecks has a weight entry
  for (const f of findings) assert.ok(WEIGHTS[f.id], `no weight for ${f.id}`);
});

test("extractLinks keeps same-origin html pages only", () => {
  const html = `<a href="/one">a</a><a href="/two#frag">b</a>
    <a href="https://other.com/x">c</a><a href="/img.png">d</a>
    <a href="mailto:x@y.z">e</a><a href="/one?utm=1">f</a>`;
  const links = extractLinks(html, "https://example.com/");
  assert.deepEqual(links.sort(), ["https://example.com/one", "https://example.com/two"]);
});

test("guidance retrieval: declared chunks first, always filled to 3", async () => {
  const { guidanceFor } = await import("../audit/retrieve.mjs");
  const g = guidanceFor("missing-canonical");
  assert.equal(g.length, 3);
  assert.match(g[0].title, /[Cc]anonical/);
  assert.ok(g.every((x) => x.sourceUrl.startsWith("http")));
  const unknown = guidanceFor("some-future-check");
  assert.equal(unknown.length, 3); // vector-only fallback still guides
});

test("llm layer stays fully dormant without keys", async () => {
  const { polishFindings, configuredProviders, cacheKey, buildPrompt } = await import("../audit/llm.mjs");
  assert.equal(configuredProviders({}).length, 0);
  const findings = [{ id: "missing-title", severity: "critical", page: "https://x.y/", message: "m" }];
  const res = await polishFindings(/* db */ null, findings, { env: {} });
  assert.equal(res.mode, "rules-only");
  assert.equal(res.findings[0].ai, undefined);
  const k1 = cacheKey(findings[0]);
  const k2 = cacheKey({ ...findings[0], message: "different" });
  assert.equal(k1.url_hash, k2.url_hash);
  assert.notEqual(k1.content_hash, k2.content_hash);
  assert.ok(buildPrompt({ ...findings[0], guidance: [{ title: "T", excerpt: "E", sourceName: "S" }] }).includes("T: E"));
});
