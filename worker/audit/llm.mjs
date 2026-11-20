/**
 * Free-tier LLM polish layer - strictly optional enhancement on top of the
 * rules-only audit. The $0 contract, enforced in code:
 *  - providers are FREE tiers only, keyed by their own env vars; no key,
 *    no calls, and the audit ships identical structure in rules-only mode
 *  - per-provider daily request caps tracked in Postgres (llm_quota) with
 *    a hard stop; exhausting every provider degrades to rules-only
 *  - outputs cached in Postgres (llm_cache) by (url_hash, finding_id,
 *    content_hash) so an unchanged page never re-calls any model
 *  - prompts carry finding metadata, evidence snippets and guidance
 *    excerpts - never full page HTML
 */

import { createHash } from "node:crypto";

const sha = (s) => createHash("sha256").update(s).digest("hex");

/** Free-tier providers in preference order. Caps are deliberately under
 * each tier's published daily allowance. */
const PROVIDERS = [
  {
    id: "groq",
    envKey: "GIGAI_AUDIT_GROQ_KEY",
    dailyCap: 500,
    call: async (key, prompt) => {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          // Reasoning model: keep thinking short, leave room for the answer.
          max_tokens: 900,
          reasoning_effort: "low",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (r.status === 429) throw Object.assign(new Error("quota"), { quota: true });
      if (!r.ok) throw new Error(`groq ${r.status}`);
      return (await r.json()).choices?.[0]?.message?.content ?? null;
    },
  },
  {
    id: "gemini",
    envKey: "GIGAI_AUDIT_GEMINI_KEY",
    dailyCap: 200,
    call: async (key, prompt) => {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 300 },
          }),
        },
      );
      if (r.status === 429) throw Object.assign(new Error("quota"), { quota: true });
      if (!r.ok) throw new Error(`gemini ${r.status}`);
      return (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    },
  },
  {
    id: "openrouter",
    envKey: "GIGAI_AUDIT_OPENROUTER_KEY",
    dailyCap: 150,
    call: async (key, prompt) => {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (r.status === 429) throw Object.assign(new Error("quota"), { quota: true });
      if (!r.ok) throw new Error(`openrouter ${r.status}`);
      return (await r.json()).choices?.[0]?.message?.content ?? null;
    },
  },
];

export function configuredProviders(env = process.env) {
  return PROVIDERS.filter((p) => env[p.envKey]);
}

export function buildPrompt(finding) {
  const guidance = (finding.guidance ?? [])
    .map((g) => `- ${g.title}: ${g.excerpt} (${g.sourceName})`)
    .join("\n");
  return `You are a precise SEO advisor. In at most 3 sentences, explain this website finding to the site owner in plain language: what it means for THIS page and the single most important next step. No headings, no lists, no fluff.

Finding: ${finding.id} (${finding.severity}) on ${finding.page}
Detail: ${finding.message}
${finding.evidence ? `Evidence: ${finding.evidence}` : ""}
Guidance:
${guidance}`;
}

export function cacheKey(finding) {
  return {
    url_hash: sha(finding.page),
    finding_id: finding.id,
    content_hash: sha(`${finding.message}|${finding.evidence ?? ""}`),
  };
}

/** Reserve one request from a provider's daily budget. True if allowed. */
async function reserveQuota(db, provider) {
  const { rows: [row] } = await db.query(
    `INSERT INTO llm_quota (provider, day, requests) VALUES ($1, current_date, 1)
     ON CONFLICT (provider, day) DO UPDATE SET requests = llm_quota.requests + 1
     RETURNING requests`,
    [provider.id],
  );
  return row.requests <= provider.dailyCap;
}

/**
 * Polish up to `cap` findings with plain-language explanations.
 * Mutates nothing; returns { findings, mode, provider? }.
 */
export async function polishFindings(db, findings, { cap = 10, env = process.env } = {}) {
  const providers = configuredProviders(env);
  if (!providers.length) return { findings, mode: "rules-only" };

  const targets = findings
    .filter((f) => f.severity !== "info")
    .slice(0, cap);

  let anyModel = false;
  const out = [...findings];
  for (const finding of targets) {
    const key = cacheKey(finding);
    const { rows: [hit] } = await db.query(
      `SELECT output FROM llm_cache WHERE url_hash = $1 AND finding_id = $2 AND content_hash = $3`,
      [key.url_hash, key.finding_id, key.content_hash],
    );
    if (hit) {
      out[out.indexOf(finding)] = { ...finding, ai: hit.output };
      anyModel = true;
      continue;
    }

    let text = null;
    let used = null;
    for (const provider of providers) {
      if (!(await reserveQuota(db, provider))) continue;
      try {
        text = await provider.call(env[provider.envKey], buildPrompt(finding));
        used = provider.id;
        break;
      } catch (err) {
        if (!err.quota) console.error(`llm ${provider.id}:`, err.message);
      }
    }
    if (!text) continue; // every provider exhausted or failing -> rules-only for the rest
    const ai = { explanation: text.trim().slice(0, 800), provider: used };
    await db.query(
      `INSERT INTO llm_cache (url_hash, finding_id, content_hash, output)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [key.url_hash, key.finding_id, key.content_hash, JSON.stringify(ai)],
    );
    out[out.indexOf(finding)] = { ...finding, ai };
    anyModel = true;
  }
  return { findings: out, mode: anyModel ? "rules+ai" : "rules-only" };
}
