/**
 * GEO Studio QA: load every tool page from the static build, drive its real UI,
 * and assert the real output. Fails loudly — no "looks fine" verdicts.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd() + "/out";
const PORT = 4599;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain", ".woff2": "font/woff2", ".xml": "application/xml", ".wasm": "application/wasm" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  let file = path.join(ROOT, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (fs.existsSync(file + ".html")) file = file + ".html";
    else { res.writeHead(404); return res.end("nf"); }
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

const results = [];
const pass = (n, d = "") => results.push({ ok: true, n, d });
const fail = (n, d) => results.push({ ok: false, n, d });

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch();

async function open(slug) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/${slug}`, { waitUntil: "networkidle" });
  return { page, errors };
}

/**
 * Wait until the page's text satisfies `re`, polling rather than sleeping a
 * fixed interval. Analysis is debounced, so a fixed wait races under load; a
 * timeout here still means a genuine failure, not a slow machine.
 */
async function waitForText(page, re, timeout = 15000) {
  const deadline = Date.now() + timeout;
  let body = "";
  while (Date.now() < deadline) {
    body = await page.locator("body").innerText();
    if (re.test(body)) return body;
    await page.waitForTimeout(150);
  }
  return body;
}

/* 1. AI Crawler Access Checker — paste a robots.txt that blocks GPTBot. */
try {
  const { page, errors } = await open("ai-crawler-access-checker");
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 15000 });
  await ta.fill("User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n");
  const body = await waitForText(page, /GPTBot[\s\S]{0,120}Blocked/);
  const gptBlocked = /GPTBot[\s\S]{0,120}Blocked/.test(body);
  const quotesRule = body.includes("Disallow: /");
  const perplexOk = /PerplexityBot[\s\S]{0,140}Allowed/.test(body);
  gptBlocked ? pass("checker: GPTBot reported Blocked") : fail("checker: GPTBot verdict", body.slice(0, 300));
  quotesRule ? pass("checker: quotes the deciding rule") : fail("checker: no rule quoted", "");
  perplexOk ? pass("checker: PerplexityBot allowed via * group") : fail("checker: PerplexityBot verdict", "");
  errors.length ? fail("checker: console errors", errors.join("; ")) : pass("checker: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 2. Retrieval Chunk Preview — content with a failing chunk. */
try {
  const { page, errors } = await open("retrieval-chunk-preview");
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 15000 });
  await ta.fill(
    "## What is WebP?\n\nWebP is an image format Google released in 2010 that compresses photographs about 30% smaller than JPEG at equivalent visual quality.\n\n## Compatibility\n\nAs mentioned above, it works well, and the same conclusion applies to every other case that we tested in the lab.\n",
  );
  // Poll a RESULT-ONLY signal: the page copy itself quotes an example
  // verdict ("4 of your 11 chunks would be…"), so matching that text
  // would return before any analysis had run.
  // Poll a RESULT-ONLY signal. The page copy quotes an example verdict
  // ("4 of your 11 chunks would be…") and uses the word "standalone" in
  // its FAQ, so either would match before any analysis had run; the
  // per-card "chunk N" label only exists in rendered results.
  const body = await waitForText(page, /\bchunk 1\b/i);
  const verdict = /(\d+) of your (\d+) chunks/.test(body) || /All \d+ chunks/.test(body);
  const flagged = /fails alone/i.test(body);
  const backref = /References text that isn't in the chunk/i.test(body);
  verdict ? pass("chunks: verdict rendered") : fail("chunks: no verdict", body.slice(0, 300));
  flagged ? pass("chunks: failing chunk marked") : fail("chunks: nothing flagged", "");
  backref ? pass("chunks: back-reference flag with reason") : fail("chunks: no back-ref flag", "");
  errors.length ? fail("chunks: console errors", errors.join("; ")) : pass("chunks: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 3. Citability Scorer — must SHOW formulas, that's the product promise. */
try {
  const { page, errors } = await open("content-citability-scorer");
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 15000 });
  await ta.fill(
    "WebP compresses photographs 30% smaller than JPEG at equivalent quality. In Google's benchmark of 11,000 images the average saving was 30%. A 2 MB photo becomes about 1.4 MB with no visible difference.",
  );
  const body = await waitForText(page, /formula:/);
  const hasFormula = body.includes("formula:");
  const hasCounted = body.includes("Counted:");
  const hasSubscores = body.includes("Fact density") && body.includes("Quotability");
  hasFormula ? pass("citability: formulas displayed") : fail("citability: NO formula shown", body.slice(0, 400));
  hasCounted ? pass("citability: counted evidence displayed") : fail("citability: no counts", "");
  hasSubscores ? pass("citability: sub-scores present") : fail("citability: sub-scores missing", "");
  errors.length ? fail("citability: console errors", errors.join("; ")) : pass("citability: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 4. Answer Snippet Checker — one good section, one buried. */
try {
  const { page, errors } = await open("answer-snippet-checker");
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 15000 });
  await ta.fill(
    "## How much does compressing a PDF save?\n\nAn image-heavy PDF typically shrinks 80-95%; a 6.6 MB scan becomes about 90 KB.\n\n## Is it safe?\n\nIn today's fast-moving digital landscape it is worth stepping back and considering what safety really means before we can answer this question properly.\n",
  );
  const body = await waitForText(page, /answers first|buries the answer/);
  const answersFirst = body.includes("answers first");
  const buries = body.includes("buries the answer");
  const rewrite = body.includes("Rewrite target");
  answersFirst ? pass("snippets: good section passes") : fail("snippets: good section not detected", body.slice(0, 300));
  buries ? pass("snippets: buried answer flagged") : fail("snippets: buried answer missed", "");
  rewrite ? pass("snippets: rewrite target given") : fail("snippets: no rewrite target", "");
  errors.length ? fail("snippets: console errors", errors.join("; ")) : pass("snippets: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 5. AI Robots.txt Generator — toggles must produce real directives. */
try {
  const { page, errors } = await open("ai-robots-txt-generator");
  await page.locator("text=GPTBot").first().waitFor({ timeout: 15000 });
  const out = page.locator("textarea[readonly]").last();
  await out.waitFor({ timeout: 15000 });
  for (let i = 0; i < 60 && !(await out.inputValue()).includes("User-agent: GPTBot"); i++) await page.waitForTimeout(150);
  let code = await out.inputValue();
  let body = await page.locator("body").innerText();
  const hasGroups = code.includes("User-agent: GPTBot") && code.includes("User-agent: PerplexityBot");
  hasGroups ? pass("generator: emits per-bot groups") : fail("generator: no groups", code.slice(0, 400));
  // Flip GPTBot to Block and confirm the output changes.
  const sw = page.locator('button[role="switch"]').first();
  await sw.click();
  for (let i = 0; i < 60 && !/User-agent: GPTBot\s*\n\s*Disallow/.test(await out.inputValue()); i++) await page.waitForTimeout(150);
  code = await out.inputValue();
  body = await page.locator("body").innerText();
  const nowBlocks = /User-agent: GPTBot\s*\n\s*Disallow: \//.test(code);
  const showsCost = /less likely to know and mention your brand|Future GPT models/i.test(body);
  nowBlocks ? pass("generator: toggle produces Disallow") : fail("generator: toggle had no effect", code.slice(0, 400));
  showsCost ? pass("generator: block cost explained") : fail("generator: no cost shown", "");
  errors.length ? fail("generator: console errors", errors.join("; ")) : pass("generator: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 6. Entity Consistency — name drift across two sources. */
try {
  const { page, errors } = await open("entity-consistency-checker");
  await page.locator("#brand").waitFor({ timeout: 15000 });
  await page.fill("#brand", "GigAI");
  await page.fill("#src-0", "GigAI ships 262 free browser tools for teams that handle sensitive documents.");
  await page.fill("#src-1", "Gigai ships 250 free browser tools for teams that handle sensitive documents.");
  const body = await waitForText(page, /spelled 2 different ways/);
  const drift = /spelled 2 different ways/i.test(body);
  const numConflict = /disagree about/i.test(body);
  drift ? pass("entity: name drift detected") : fail("entity: no name drift", body.slice(0, 400));
  numConflict ? pass("entity: number conflict detected") : fail("entity: no number conflict", "");
  errors.length ? fail("entity: console errors", errors.join("; ")) : pass("entity: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 7. llms.txt Generator — sitemap XML in, grouped markdown out. */
try {
  const { page, errors } = await open("llms-txt-generator");
  const inputs = page.locator("input");
  await inputs.first().waitFor({ timeout: 15000 });
  await inputs.nth(0).fill("Acme");
  await inputs.nth(1).fill("Self-hosted analytics.");
  await page
    .locator('textarea[placeholder*="example.com"]')
    .first()
    .fill("https://acme.dev/\nhttps://acme.dev/docs/install\nhttps://acme.dev/docs/api\nhttps://acme.dev/blog/launch");
  const outLlms = page.locator("textarea[readonly]").last();
  for (let i = 0; i < 60 && !(await outLlms.inputValue()).includes("## Docs"); i++) await page.waitForTimeout(150);
  const body = await page.locator("body").innerText();
  const code = await outLlms.inputValue();
  const ok = code.includes("# Acme") && code.includes("> Self-hosted analytics.") && code.includes("## Docs");
  const honest = /Google has said its AI search|doesn't read llms\.txt|does not use llms\.txt/i.test(body);
  ok ? pass("llms: spec-shaped output with sections") : fail("llms: bad output", code.slice(0, 500));
  honest ? pass("llms: honest note present") : fail("llms: honesty note missing", "");
  errors.length ? fail("llms: console errors", errors.join("; ")) : pass("llms: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 8. AI Schema Checker — HTML with FAQPage but no Organization. */
try {
  const { page, errors } = await open("ai-schema-checker");
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 15000 });
  await ta.fill(
    `<html><head><title>T</title><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"q"}]}<\/script></head><body><main><h1>x</h1><p>y</p></main></body></html>`,
  );
  const body = await waitForText(page, /FAQPage present/);
  const faqFound = /FAQPage present/i.test(body);
  const orgMissing = /No Organization/i.test(body);
  faqFound ? pass("schema: detects present type") : fail("schema: FAQPage not detected", body.slice(0, 400));
  orgMissing ? pass("schema: flags missing Organization") : fail("schema: gap not flagged", "");
  errors.length ? fail("schema: console errors", errors.join("; ")) : pass("schema: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 9. JS Rendering Checker — raw HTML pane analysis. */
try {
  const { page, errors } = await open("js-rendering-checker");
  await page.locator("#raw-html").waitFor({ timeout: 15000 });
  await page.fill("#raw-html", `<html><head><title>App</title></head><body><div id="root"></div><script>self.__next_f=[]<\/script></body></html>`);
  const body = await waitForText(page, /words visible in the raw HTML/);
  const words = /words visible in the raw HTML/i.test(body);
  const framework = /Client-rendered SPA shell|Next\.js/i.test(body);
  words ? pass("jsrender: word count reported") : fail("jsrender: no word count", body.slice(0, 400));
  framework ? pass("jsrender: framework marker detected") : fail("jsrender: no framework detection", "");
  errors.length ? fail("jsrender: console errors", errors.join("; ")) : pass("jsrender: no console errors");
  await page.close();
} catch (e) { fail("block threw", String(e).slice(0,200)); }

/* 10. Log Analyzer + 11. GEO Audit — page loads & empty states render. */
for (const [slug, needle] of [
  ["ai-crawler-log-analyzer", "Are the bots actually reading your site?"],
  ["geo-audit", "Can AI systems find, read and cite this page?"],
]) {
  try {
    const { page, errors } = await open(slug);
    await page.waitForTimeout(1500);
    const body = await page.locator("body").innerText();
    body.includes(needle) ? pass(`${slug}: empty state renders`) : fail(`${slug}: empty state missing`, body.slice(0, 300));
    errors.length ? fail(`${slug}: console errors`, errors.join("; ")) : pass(`${slug}: no console errors`);
    await page.close();
  } catch (e) { fail(`${slug}: block threw`, String(e).slice(0, 200)); }
}

await browser.close();
server.close();

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.n}${r.d ? "\n      " + r.d.replace(/\n/g, " ").slice(0, 260) : ""}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
