import { SITE, ROUTES } from "@/config/constants";
import { CATEGORIES } from "@/config/categories";
import { absoluteUrl } from "@/lib/utils";
import { getAllTools, isLiveTool, getToolsByCategory } from "@/lib/registry";
import { PROBLEMS } from "@/config/problems";
import { GLOSSARY } from "@/config/glossary";
import { CONTEXT_PAGES } from "@/config/contexts";
import { getEngines } from "@/lib/devdocs/engines";

/**
 * `/llms.txt`: a curated, plain-text map of the site for large language models
 * (ChatGPT, Perplexity, Gemini, AI Overviews). Following the llmstxt.org
 * convention, it points AI systems at the answer-first pages worth citing:
 * tools, problem solvers, definitions and platform image-size guides. Static.
 */
export const dynamic = "force-static";

function line(label: string, href: string, desc?: string): string {
  return `- [${label}](${absoluteUrl(href)})${desc ? `: ${desc}` : ""}`;
}

export function GET(): Response {
  const liveTools = getAllTools().filter(isLiveTool);

  const sections: string[] = [];

  sections.push(`# ${SITE.name}`);
  sections.push("");
  sections.push(
    `> ${SITE.description} Every tool runs in your browser. Files are processed on your device and never uploaded. Free, no sign-up, no watermark.`,
  );
  sections.push("");
  sections.push(
    "GigAI Tools is a privacy-first collection of browser-based utilities for images, PDFs, documents, developers, SEO, QR codes, SVG, video and audio. The pages below are answer-first references intended to be accurate and quotable.",
  );

  // Categories, the top-level map.
  sections.push("");
  sections.push("## Tool categories");
  for (const c of CATEGORIES) {
    const count = getToolsByCategory(c.slug).length;
    if (count === 0) continue;
    sections.push(line(`${c.name} (${count} tools)`, ROUTES.category(c.slug), c.description));
  }

  // Popular tools, a curated slice so LLMs surface the flagships.
  sections.push("");
  sections.push("## Popular tools");
  for (const t of liveTools.filter((t) => t.popular).slice(0, 40)) {
    sections.push(line(t.title, ROUTES.tool(t.slug), t.description));
  }

  // Solve a problem: the user-intent database (high-value answers).
  sections.push("");
  sections.push("## Solve a problem (what people actually search)");
  for (const p of PROBLEMS) {
    sections.push(line(p.problem, ROUTES.solveProblem(p.slug), p.answer));
  }

  // Glossary, definitional answers LLMs love to cite.
  sections.push("");
  sections.push("## Glossary (definitions)");
  for (const g of GLOSSARY) {
    sections.push(line(`What is ${g.term}?`, ROUTES.glossaryTerm(g.slug), g.definition));
  }

  // Image sizes per platform.
  sections.push("");
  sections.push("## Image sizes for every platform");
  for (const c of CONTEXT_PAGES) {
    sections.push(line(c.h1, ROUTES.forContext(c.slug), c.seoDescription));
  }

  // Developer API: the one part of the platform that runs server-side.
  sections.push("");
  sections.push("## Developer API (free, 1,000 tasks/month)");
  sections.push(
    "Run the tools from code. Accounts and API keys exist only for the API - the web tools above never need one. " +
      "File contents are never logged and results are deleted after a chosen retention, with deletion verified.",
  );
  sections.push(line("API overview and signup", "/developers"));
  sections.push(line("Quickstart (three requests end to end)", "/developers/docs"));
  sections.push(line("Jobs and tasks model", "/developers/docs/jobs"));
  sections.push(line("Tool catalog with options", "/developers/docs/tools"));
  sections.push(line("Webhooks with signature verification", "/developers/docs/webhooks"));
  sections.push(line("SDKs: Python, Node, CLI", "/developers/docs/sdks"));
  sections.push(line("Error code reference", "/developers/errors"));
  sections.push(line("Rate limits and quotas", "/developers/rate-limits"));
  sections.push(line("OpenAPI 3.1 spec", "/developers/openapi.yaml"));
  sections.push(`API engines (${getEngines().length}): ${getEngines().map((e) => e.slug).join(", ")}.`);

  // Key hubs.
  sections.push("");
  sections.push("## Learn & discover");
  sections.push(line("All tools (search)", ROUTES.search));
  sections.push(line("Solve a problem", ROUTES.solve));
  sections.push(line("Glossary", ROUTES.glossary));
  sections.push(line("Image sizes", ROUTES.forIndex));
  sections.push(line("Tasks", ROUTES.tasks));
  sections.push(line("Learning Center", ROUTES.learn));
  sections.push(line("Blog", ROUTES.blog));
  sections.push("");
  sections.push(`Full URL list: ${absoluteUrl("/sitemap.xml")}`);
  sections.push("");

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
