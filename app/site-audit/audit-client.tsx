"use client";

/**
 * Site Audit UI. The audit runs server-side (it fetches a public URL, no
 * user files involved); this client submits, polls, renders, and optionally
 * enhances findings with the VISITOR'S own LLM key - stored in this
 * browser only, calls made provider-direct (all four verified CORS-open).
 */

import * as React from "react";

interface Guidance { title: string; excerpt: string; sourceName: string; sourceUrl: string }
interface Fix { language: string; code: string; note?: string }
interface Finding {
  id: string; severity: "critical" | "warning" | "info"; page: string;
  message: string; evidence?: string; fix?: Fix; guidance?: Guidance[];
  ai?: { explanation: string; provider: string };
}
interface AuditResult {
  url: string; audited_at: string; mode: string; out_of_budget: boolean;
  pages: { url: string; status: number; title: string | null }[];
  scores: { seo: number; aiVisibility: number; formula: string };
  summary: { critical: number; warning: number; info: number; fixable: number };
  findings: Finding[];
}

const BYOK_STORE = "gigai-audit-byok";
const SEV_STYLE = {
  critical: "bg-red-600/10 text-red-700",
  warning: "bg-amber-500/10 text-amber-700",
  info: "bg-muted text-muted-foreground",
};

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(text).then(() => {
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      })}
      className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground"
    >
      {done ? "Copied" : label}
    </button>
  );
}

/** Provider-direct browser call with the visitor's own key. */
async function byokExplain(provider: string, key: string, prompt: string): Promise<string> {
  if (provider === "gemini") {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(key)}`,
      { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 300 } }) },
    );
    if (!r.ok) throw new Error(`Gemini answered ${r.status} - check the key.`);
    return (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  if (provider === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json", "x-api-key": key,
        "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
    });
    if (!r.ok) throw new Error(`Anthropic answered ${r.status} - check the key.`);
    return (await r.json()).content?.[0]?.text ?? "";
  }
  const url = provider === "groq"
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";
  const model = provider === "groq" ? "openai/gpt-oss-20b" : "meta-llama/llama-3.1-8b-instruct:free";
  const r = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
  });
  if (!r.ok) throw new Error(`${provider} answered ${r.status} - check the key.`);
  return (await r.json()).choices?.[0]?.message?.content ?? "";
}

function explainPrompt(f: Finding): string {
  const guidance = (f.guidance ?? []).map((g) => `- ${g.title}: ${g.excerpt} (${g.sourceName})`).join("\n");
  return `You are a precise SEO advisor. In at most 3 sentences, explain this website finding to the site owner in plain language: what it means for THIS page and the single most important next step. No headings, no lists.\n\nFinding: ${f.id} (${f.severity}) on ${f.page}\nDetail: ${f.message}\n${f.evidence ? `Evidence: ${f.evidence}` : ""}\nGuidance:\n${guidance}`;
}

function FindingCard({ f }: { f: Finding }) {
  const [aiText, setAiText] = React.useState<string | null>(f.ai?.explanation ?? null);
  const [aiBusy, setAiBusy] = React.useState(false);
  const [aiErr, setAiErr] = React.useState<string | null>(null);

  const explain = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem(BYOK_STORE) ?? "null") as { provider: string; key: string } | null;
      if (!saved?.key) {
        setAiErr("Add your API key in the AI panel above first.");
        return;
      }
      setAiBusy(true);
      setAiErr(null);
      setAiText(await byokExplain(saved.provider, saved.key, explainPrompt(f)));
    } catch (err) {
      setAiErr(err instanceof Error ? err.message : "The provider call failed.");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${SEV_STYLE[f.severity]}`}>{f.severity}</span>
        <code className="font-mono text-sm font-semibold text-foreground">{f.id}</code>
        <span className="truncate font-mono text-xs text-muted-foreground">{f.page}</span>
      </div>
      <p className="mt-2 max-w-[80ch] text-sm text-muted-foreground">{f.message}</p>
      {f.evidence ? (
        <p className="mt-1 truncate font-mono text-xs text-muted-foreground/70">{f.evidence}</p>
      ) : null}
      {aiText ? (
        <p className="mt-2 max-w-[80ch] border-l-2 border-primary/40 pl-3 text-sm text-foreground">{aiText}</p>
      ) : null}
      {aiErr ? <p className="mt-2 text-xs text-red-600">{aiErr}</p> : null}
      {f.fix ? (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fix ({f.fix.language})
            </p>
            <CopyButton text={f.fix.code} label="Copy fix" />
          </div>
          <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-3 font-mono text-xs text-foreground">
            <code>{f.fix.code}</code>
          </pre>
          {f.fix.note ? <p className="mt-1 text-xs text-muted-foreground">{f.fix.note}</p> : null}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {(f.guidance ?? []).map((g) => (
          <a key={g.sourceUrl + g.title} href={g.sourceUrl} target="_blank" rel="noopener noreferrer"
             className="text-xs text-primary hover:underline" title={g.excerpt}>
            {g.sourceName} ↗
          </a>
        ))}
        {!aiText ? (
          <button type="button" onClick={() => void explain()} disabled={aiBusy}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
            {aiBusy ? "Asking..." : "Explain with AI (your key)"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ByokPanel() {
  const [provider, setProvider] = React.useState("groq");
  const [key, setKey] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(BYOK_STORE) ?? "null");
      if (s) { setProvider(s.provider); setKey(s.key); setSaved(true); }
    } catch { /* private mode */ }
  }, []);

  return (
    <details className="mt-6 rounded border border-border bg-card p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        AI explanations with your own key {saved ? "(key saved in this browser)" : "(optional)"}
      </summary>
      <p className="mt-2 max-w-[70ch] text-xs text-muted-foreground">
        Your key stays in this browser and calls go straight from your browser to the
        provider - it never touches our server, never appears in a URL, and is never
        logged. All four providers are verified to accept browser calls.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm text-foreground">
          Provider
          <select value={provider} onChange={(e) => setProvider(e.target.value)}
            className="mt-1 block h-10 rounded border border-border bg-background px-2 text-sm">
            <option value="groq">Groq (free tier)</option>
            <option value="gemini">Google Gemini (free tier)</option>
            <option value="openrouter">OpenRouter (free models)</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </label>
        <label className="grow text-sm text-foreground">
          API key
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
            className="mt-1 block h-10 w-full max-w-sm rounded border border-border bg-background px-3 font-mono text-sm" />
        </label>
        <button type="button"
          onClick={() => { try { localStorage.setItem(BYOK_STORE, JSON.stringify({ provider, key })); setSaved(true); } catch { /* */ } }}
          className="h-10 rounded bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Save in browser
        </button>
        {saved ? (
          <button type="button"
            onClick={() => { try { localStorage.removeItem(BYOK_STORE); } catch { /* */ } setKey(""); setSaved(false); }}
            className="h-10 rounded border border-border px-4 text-sm text-muted-foreground hover:text-foreground">
            Forget key
          </button>
        ) : null}
      </div>
    </details>
  );
}

export function AuditClient() {
  const [url, setUrl] = React.useState("");
  const [state, setState] = React.useState<"idle" | "queued" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = React.useState<{ crawled?: number } | null>(null);
  const [result, setResult] = React.useState<AuditResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [auditId, setAuditId] = React.useState<string | null>(null);
  const [sevFilter, setSevFilter] = React.useState<string>("all");

  const load = React.useCallback(async (id: string) => {
    setAuditId(id);
    for (;;) {
      const d = await fetch(`/v1/audit/${id}`).then((r) => r.json());
      const status = d.status ?? "error";
      setState(status);
      if (status === "running" && d.progress) setProgress(d.progress);
      if (status === "done") { setResult(d.result); return; }
      if (status === "error" || d.detail) {
        setError(d.error ?? d.detail?.error?.message ?? "The audit failed.");
        setState("error");
        return;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }, []);

  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) void load(id);
  }, [load]);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const target = /^https?:\/\//.test(url) ? url : `https://${url}`;
    setState("queued");
    const created = await fetch("/v1/audit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: target }),
    }).then((r) => r.json());
    if (!created.id) {
      setError(created.detail?.error?.message ?? "Could not start the audit.");
      setState("error");
      return;
    }
    window.history.replaceState(null, "", `?id=${created.id}`);
    void load(created.id);
  };

  const filtered = result?.findings.filter((f) => sevFilter === "all" || f.severity === sevFilter) ?? [];

  return (
    <div>
      <form onSubmit={(e) => void run(e)} className="flex flex-wrap gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.com"
          required
          className="h-11 w-full max-w-md rounded border border-border bg-background px-3 font-mono text-sm"
        />
        <button type="submit" disabled={state === "queued" || state === "running"}
          className="h-11 rounded bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {state === "queued" || state === "running" ? "Auditing..." : "Audit site"}
        </button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        Crawls up to 25 pages of the public site, honors robots.txt, keeps nothing but
        the findings. 3 free audits a day (10 with a free API key). Reports share by
        link and expire after 30 days.
      </p>

      {state === "queued" ? <p className="mt-6 text-sm text-muted-foreground">Queued...</p> : null}
      {state === "running" ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Crawling{progress?.crawled ? ` - ${progress.crawled} pages so far` : "..."}
        </p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-border bg-card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO score</p>
              <p className="mt-1 text-4xl font-bold text-foreground">{result.scores.seo}</p>
            </div>
            <div className="rounded border border-border bg-card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI visibility</p>
              <p className="mt-1 text-4xl font-bold text-foreground">{result.scores.aiVisibility}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {result.pages.length} pages audited · {result.summary.critical} critical ·{" "}
            {result.summary.warning} warnings · {result.summary.info} notes ·{" "}
            scoring: {result.scores.formula}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {auditId ? (
              <CopyButton text={`https://gigai.tools/site-audit?id=${auditId}`} label="Copy share link" />
            ) : null}
            <CopyButton
              text={result.findings.filter((f) => f.fix).map((f) => `<!-- ${f.id} @ ${f.page} -->\n${f.fix!.code}`).join("\n\n")}
              label="Copy all fixes"
            />
            <button type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "site-audit.json";
                a.click();
                URL.revokeObjectURL(a.href);
              }}
              className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
              Download JSON
            </button>
          </div>

          <ByokPanel />

          <div className="mt-6 flex items-center gap-2">
            {["all", "critical", "warning", "info"].map((s) => (
              <button key={s} type="button" onClick={() => setSevFilter(s)}
                className={s === sevFilter
                  ? "rounded bg-muted px-3 py-1 text-sm font-semibold text-foreground"
                  : "rounded px-3 py-1 text-sm text-muted-foreground hover:text-foreground"}>
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {filtered.map((f, i) => (
              <FindingCard key={`${f.id}-${f.page}-${i}`} f={f} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
