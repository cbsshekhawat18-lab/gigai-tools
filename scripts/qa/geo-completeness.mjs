/**
 * GEO Studio completeness audit.
 *
 * Proves every tool is fully wired (config → registry → UI → answer) and that
 * every internal slug reference actually resolves. Cross-reference rot is the
 * failure mode a build can't catch: a `relatedTools` or `notFor` pointing at a
 * slug that doesn't exist compiles fine and 404s in production.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const problems = [];
const notes = [];
const bad = (m) => problems.push(m);

/* ---- every slug that exists on the site, harvested from the configs ------- */
const allSlugs = new Set();
const walk = (dir) => {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith(".ts") && e.name !== "index.ts" && e.name !== "_placeholders.ts") {
      const m = read(rel).match(/^\s*slug:\s*"([^"]+)"/m);
      if (m) allSlugs.add(m[1]);
    }
  }
};
walk("config/tools");
// Placeholder (coming-soon) tools live in one file as an array.
for (const m of read("config/tools/_placeholders.ts").matchAll(/slug:\s*"([^"]+)"/g)) allSlugs.add(m[1]);

/* ---- the GEO tools, from the category index (source of truth) ------------- */
const geoIndex = read("config/tools/geo/index.ts");
const geoFiles = [...geoIndex.matchAll(/from "\.\/([a-z0-9-]+)"/g)].map((m) => m[1]);
const arrayOrder = [...geoIndex.slice(geoIndex.indexOf("export const GEO_TOOLS")).matchAll(/^\s{2}([a-zA-Z]+),$/gm)].length;

if (geoFiles.length !== 11) bad(`expected 11 GEO tool files, index imports ${geoFiles.length}`);
if (arrayOrder !== geoFiles.length) bad(`GEO_TOOLS array lists ${arrayOrder} entries but ${geoFiles.length} are imported`);

const uiRegistry = read("components/tool/tool-ui-registry.ts");
const answers = read("config/seo/tool-answers.ts");
const rootIndex = read("config/tools/index.ts");

if (!rootIndex.includes("...GEO_TOOLS")) bad("GEO_TOOLS is not spread into the TOOLS registry");

const geoSlugs = [];
for (const file of geoFiles) {
  const cfgPath = `config/tools/geo/${file}.ts`;
  if (!fs.existsSync(path.join(ROOT, cfgPath))) { bad(`missing config ${cfgPath}`); continue; }
  const cfg = read(cfgPath);
  const slug = cfg.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
  if (!slug) { bad(`${cfgPath}: no slug`); continue; }
  geoSlugs.push(slug);
  if (slug !== file) bad(`${cfgPath}: slug "${slug}" != filename "${file}"`);

  // Config completeness — the sections the shared tool page renders.
  for (const field of ["h1", "tagline", "longDescription", "features", "benefits", "howTo", "useCases", "troubleshooting", "tips", "security", "faq", "changelog", "keywords", "seo", "relatedTools"]) {
    if (!new RegExp(`^\\s*${field}:`, "m").test(cfg)) bad(`${slug}: missing "${field}"`);
  }
  if (!/category:\s*"geo-tools"/.test(cfg)) bad(`${slug}: not in geo-tools category`);
  const faqCount = (cfg.match(/^\s+question:/gm) ?? []).length;
  if (faqCount < 6) bad(`${slug}: only ${faqCount} FAQ entries (want >= 6)`);
  const howToCount = (cfg.match(/^\s+title:\s*"/gm) ?? []).length;
  if (howToCount < 10) bad(`${slug}: thin content (${howToCount} titled blocks)`);

  // Module + UI registry wiring.
  const mod = `modules/tools/geo/${slug}-tool.tsx`;
  if (!fs.existsSync(path.join(ROOT, mod))) bad(`${slug}: missing module ${mod}`);
  else if (!read(mod).startsWith('"use client"')) bad(`${mod}: not a client component`);
  if (!uiRegistry.includes(`"${slug}": dynamic(`)) bad(`${slug}: not in tool-ui-registry`);
  if (!uiRegistry.includes(`@/modules/tools/geo/${slug}-tool`)) bad(`${slug}: registry points elsewhere`);
  if (!answers.includes(`"${slug}":`)) bad(`${slug}: no AI answer in tool-answers.ts`);

  // Every slug this config points at must exist.
  for (const m of cfg.matchAll(/relatedTools:\s*\[([^\]]*)\]/gs)) {
    for (const s of m[1].matchAll(/"([a-z0-9-]+)"/g)) {
      if (!allSlugs.has(s[1])) bad(`${slug}: relatedTools -> "${s[1]}" does not exist`);
    }
  }
  for (const m of cfg.matchAll(/toolSlug:\s*"([a-z0-9-]+)"/g)) {
    if (!allSlugs.has(m[1])) bad(`${slug}: notFor toolSlug -> "${m[1]}" does not exist`);
  }
}

/* ---- slugs referenced from the modules (FixWithTool / audit links) -------- */
for (const f of fs.readdirSync(path.join(ROOT, "modules/tools/geo"))) {
  const src = read(`modules/tools/geo/${f}`);
  for (const m of src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)) {
    if (!allSlugs.has(m[1])) bad(`modules/tools/geo/${f}: FixWithTool -> "${m[1]}" does not exist`);
  }
}
for (const m of read("lib/geo/audit.ts").matchAll(/toolSlug:\s*"([a-z0-9-]+)"/g)) {
  if (!allSlugs.has(m[1])) bad(`lib/geo/audit.ts: toolSlug -> "${m[1]}" does not exist`);
}

/* ---- category + workflow wiring ------------------------------------------ */
const cats = read("config/categories.ts");
if (!/slug:\s*"geo-tools"/.test(cats)) bad("geo-tools category is missing");
const geoCat = cats.slice(cats.indexOf('slug: "geo-tools"'), cats.indexOf('slug: "ai-tools"'));
const popular = geoCat.match(/popularSlugs:\s*\[([^\]]*)\]/);
if (!popular) bad("geo-tools category has no popularSlugs");
else {
  for (const s of popular[1].matchAll(/"([a-z0-9-]+)"/g)) {
    if (!geoSlugs.includes(s[1])) bad(`category popularSlugs -> "${s[1]}" is not a GEO tool`);
  }
}
for (const s of (geoCat.match(/relatedCategories:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([a-z0-9-]+)"/g)) {
  if (!new RegExp(`slug:\\s*"${s[1]}"`).test(cats)) bad(`category relatedCategories -> "${s[1]}" does not exist`);
}
const disc = read("lib/discovery.ts");
if (!disc.includes('slug: "get-cited-by-ai"')) bad("get-cited-by-ai workflow missing");
const wf = disc.slice(disc.indexOf('slug: "get-cited-by-ai"'), disc.indexOf('slug: "produce-a-video-clip"'));
for (const m of wf.matchAll(/toolSlug:\s*"([a-z0-9-]+)"/g)) {
  if (!allSlugs.has(m[1])) bad(`workflow step -> "${m[1]}" does not exist`);
}

/* ---- AI/LLM-first SEO surfaces ------------------------------------------- */
{
  const problems = read("config/problems.ts");
  const glossary = read("config/glossary.ts");
  const queryMap = read("config/query-map.ts");
  const siblings = read("config/tool-siblings.ts");

  // Every GEO tool must carry situational queries (the "described situation"
  // layer the GEO strategy is built on) and an AI answer.
  for (const slug of geoSlugs) {
    if (!new RegExp(`"${slug}":\\s*\\[`).test(queryMap)) bad(`${slug}: no entries in query-map.ts`);
  }

  // Problem + glossary slugs, and every slug they reference.
  const problemSlugs = new Set([...problems.matchAll(/^\s{4}slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]));
  const glossarySlugs = new Set([...glossary.matchAll(/^\s{4}slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]));
  const GEO_PROBLEMS = ["ai-cannot-see-my-website", "are-ai-crawlers-visiting-my-site", "make-content-ai-citable", "should-i-block-ai-crawlers"];
  const GEO_TERMS = ["generative-engine-optimization", "ai-crawler", "gptbot", "llms-txt", "retrieval-augmented-generation", "ai-search"];
  for (const s of GEO_PROBLEMS) if (!problemSlugs.has(s)) bad(`problem "${s}" missing from problems.ts`);
  for (const s of GEO_TERMS) if (!glossarySlugs.has(s)) bad(`glossary term "${s}" missing`);

  // Reference integrity: tools, related problems and related terms must exist.
  const checkRefs = (src, label, slugSet) => {
    for (const m of src.matchAll(/(primaryTool|relatedTools|tools|relatedProblems|relatedTerms|related):\s*(\[[^\]]*\]|"[a-z0-9-]+")/gs)) {
      const key = m[1];
      for (const s of m[2].matchAll(/"([a-z0-9-]+)"/g)) {
        const v = s[1];
        if (key === "relatedProblems" || (key === "related" && label === "problems")) {
          if (!problemSlugs.has(v)) bad(`${label}: ${key} -> "${v}" is not a problem slug`);
        } else if (key === "relatedTerms") {
          if (!glossarySlugs.has(v)) bad(`${label}: relatedTerms -> "${v}" is not a glossary slug`);
        } else if (!allSlugs.has(v)) {
          bad(`${label}: ${key} -> "${v}" is not a tool slug`);
        }
      }
    }
  };
  checkRefs(problems, "problems", problemSlugs);
  checkRefs(glossary, "glossary", glossarySlugs);

  // Sibling entries must name real tools on both sides.
  for (const m of siblings.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\[/gm)) {
    if (!allSlugs.has(m[1])) bad(`tool-siblings: key "${m[1]}" is not a tool`);
  }
  for (const m of siblings.matchAll(/\{\s*slug:\s*"([a-z0-9-]+)"/g)) {
    if (!allSlugs.has(m[1])) bad(`tool-siblings: sibling "${m[1]}" is not a tool`);
  }
  notes.push(`SEO surfaces: ${GEO_TERMS.length} glossary terms, ${GEO_PROBLEMS.length} problem pages, query-map + siblings wired`);
}

/* ---- built output -------------------------------------------------------- */
if (fs.existsSync(path.join(ROOT, "out"))) {
  const sitemap = read("out/sitemap.xml");
  for (const slug of geoSlugs) {
    if (!fs.existsSync(path.join(ROOT, `out/${slug}.html`))) bad(`out/${slug}.html not built`);
    if (!sitemap.includes(`/${slug}<`)) bad(`${slug} missing from sitemap`);
  }
  if (!fs.existsSync(path.join(ROOT, "out/category/geo-tools.html"))) bad("category page not built");
  notes.push(`built pages verified for ${geoSlugs.length} tools + category`);
} else notes.push("no out/ directory — build not verified");

/* ---- engine layer -------------------------------------------------------- */
const engines = ["crawlers", "robots-match", "text", "html", "chunks", "citability", "logs", "llms", "entity", "audit"];
for (const e of engines) {
  if (!fs.existsSync(path.join(ROOT, `lib/geo/${e}.ts`))) bad(`lib/geo/${e}.ts missing`);
}
// html.ts uses DOMParser: it must never be imported by server-rendered code.
for (const f of fs.readdirSync(path.join(ROOT, "lib/geo"))) {
  if (f.endsWith(".ts") && f !== "html.ts" && f !== "audit.ts" && f !== "chunks.ts" && f !== "citability.ts") {
    if (read(`lib/geo/${f}`).includes("DOMParser")) bad(`lib/geo/${f} uses DOMParser unexpectedly`);
  }
}

console.log(`GEO tools found: ${geoSlugs.length}\n  ${geoSlugs.join("\n  ")}`);
for (const n of notes) console.log(`note: ${n}`);
if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.log("  ✗ " + p);
  process.exit(1);
}
console.log("\nAll wiring, cross-references and build output check out.");
