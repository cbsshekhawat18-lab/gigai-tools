"use client";

/**
 * Ask GigAI - goal in, verified pipeline out.
 *
 * Tiers (first-run picker, stored in this browser):
 *  1 On-device: the deterministic planner. No model, no download, instant.
 *  2 Free cloud: POST /v1/agent/plan (goal + file METADATA only). Falls
 *    back to tier 1 whenever the endpoint or its free quota is not there.
 *  3 My own key: browser-direct planning with the visitor's key.
 * Every plan, whatever produced it, passes the same registry validator,
 * shows as editable cards, and only runs on Run. File bytes never leave
 * the device except when a step explicitly runs a server engine - and the
 * plan card says so before anything runs.
 */

import * as React from "react";

import type { AgentFile } from "@/lib/agent/run-tool";
import { executePlan, type ExecutionReport } from "@/lib/ask/executor";
import {
  buildPlanPrompt, heuristicPlan, parseModelPlan, validatePlan,
  type Catalogue, type FileMeta, type Plan, type PlanStep,
} from "@/lib/ask/planner";
import { useNetworkWatch } from "@/lib/use-network-watch";

const TIER_KEY = "gigai-ask-tier";
const BYOK_KEY = "gigai-ask-byok";
const SAVED_KEY = "gigai-saved-plans";

type Tier = "device" | "cloud" | "byok";

/* ------------------------------ helpers ------------------------------ */

async function metaOf(file: File): Promise<FileMeta> {
  const meta: FileMeta = { name: file.name, type: file.type || "application/octet-stream", size: file.size };
  if (/^image\//.test(file.type)) {
    try {
      const bitmap = await createImageBitmap(file);
      meta.width = bitmap.width;
      meta.height = bitmap.height;
      bitmap.close();
    } catch { /* dimensions stay unknown */ }
  }
  return meta;
}

async function byokPlan(goal: string, metas: FileMeta[], catalogue: Catalogue): Promise<unknown | null> {
  const saved = JSON.parse(localStorage.getItem(BYOK_KEY) ?? "null") as { provider: string; key: string } | null;
  if (!saved?.key) throw new Error("Add your API key first (tier settings).");
  const prompt = buildPlanPrompt(goal, metas, catalogue);
  const call = async (): Promise<string> => {
    if (saved.provider === "gemini") {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(saved.key)}`,
        { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 500 } }) });
      if (!r.ok) throw new Error(`Gemini answered ${r.status}.`);
      return (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
    if (saved.provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": saved.key,
          "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
      });
      if (!r.ok) throw new Error(`Anthropic answered ${r.status}.`);
      return (await r.json()).content?.[0]?.text ?? "";
    }
    const url = saved.provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
    const model = saved.provider === "groq" ? "openai/gpt-oss-20b" : "meta-llama/llama-3.1-8b-instruct:free";
    const r = await fetch(url, {
      method: "POST", headers: { authorization: `Bearer ${saved.key}`, "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
    });
    if (!r.ok) throw new Error(`${saved.provider} answered ${r.status}.`);
    return (await r.json()).choices?.[0]?.message?.content ?? "";
  };
  return parseModelPlan(await call());
}

/* ------------------------------ component ------------------------------ */

export function AskGigaiClient() {
  const [catalogue, setCatalogue] = React.useState<Catalogue | null>(null);
  const [tier, setTier] = React.useState<Tier | null>(null);
  const [goal, setGoal] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [planNote, setPlanNote] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<"idle" | "planning" | "confirm" | "running" | "done">("idle");
  const [progress, setProgress] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<ExecutionReport | null>(null);
  const [apiKey, setApiKey] = React.useState("");
  const [saved, setSaved] = React.useState<{ name: string; goal: string; plan: Plan }[]>([]);
  const [byokProvider, setByokProvider] = React.useState("groq");
  const [byokKey, setByokKey] = React.useState("");
  const [net, armNet] = useNetworkWatch();
  const [edited, setEdited] = React.useState(false);
  const [learnNote, setLearnNote] = React.useState<string | null>(null);
  const [showLearn, setShowLearn] = React.useState(false);

  React.useEffect(() => {
    void fetch("/agent-catalog.json").then((r) => r.json()).then(setCatalogue);
    try {
      setTier((localStorage.getItem(TIER_KEY) as Tier) ?? null);
      setSaved(JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"));
      const b = JSON.parse(localStorage.getItem(BYOK_KEY) ?? "null");
      if (b) { setByokProvider(b.provider); setByokKey(b.key); }
    } catch { /* private mode */ }
  }, []);

  const chooseTier = (t: Tier) => {
    setTier(t);
    try { localStorage.setItem(TIER_KEY, t); } catch { /* */ }
  };

  const makePlan = async () => {
    if (!catalogue || !goal.trim()) return;
    setPhase("planning");
    setError(null);
    setPlanNote(null);
    setReport(null);
    setEdited(false);
    setLearnNote(null);
    setShowLearn(false);
    const metas = await Promise.all(files.map(metaOf));
    const fallback = () => {
      const h = heuristicPlan(goal, metas, catalogue);
      return h.steps.length ? h : null;
    };

    let result: Plan | null = null;
    try {
      if (tier === "device") {
        result = fallback();
      } else {
        let raw: unknown | null = null;
        if (tier === "cloud") {
          const r = await fetch("/v1/agent/plan", {
            method: "POST",
            headers: { "content-type": "application/json", ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) },
            body: JSON.stringify({ goal, files: metas }),
          });
          const d = await r.json().catch(() => null);
          if (r.ok && d?.plan) raw = d.plan;
          else setPlanNote(d?.detail?.error?.message ?? "Free planning is unavailable right now - used the on-device planner instead.");
        } else {
          raw = await byokPlan(goal, metas, catalogue);
        }
        if (raw) {
          let v = validatePlan(raw, catalogue);
          if (!v.ok && tier === "byok") {
            // one retry for models that missed the schema
            const retry = await byokPlan(`${goal}\n\nYour previous plan was invalid: ${v.error}. Answer again with valid JSON only.`, metas, catalogue);
            if (retry) v = validatePlan(retry, catalogue);
          }
          if (v.ok) result = v.plan;
          else setPlanNote(`The model's plan was invalid (${v.error}) - used the on-device planner instead.`);
        }
        result ??= fallback();
      }
    } catch (err) {
      setPlanNote(`${err instanceof Error ? err.message : "Planning failed"} - used the on-device planner instead.`);
      result = fallback();
    }

    if (!result) {
      setError("Nothing in the toolset maps to that goal. Try naming the operation - resize, convert, compress, merge, OCR, redact...");
      setPhase("idle");
      return;
    }
    setPlan(result);
    setPhase("confirm");
  };

  const run = async () => {
    if (!plan) return;
    setPhase("running");
    setError(null);
    if (plan.steps.every((s) => s.toolId.startsWith("browser."))) armNet();
    const agentFiles: AgentFile[] = files.map((f) => ({ name: f.name, blob: f }));
    const result = await executePlan(plan, agentFiles, {
      apiKey: apiKey || undefined,
      onStep: (i, p) => setProgress(`Step ${i + 1}/${plan.steps.length}: ${plan.steps[i]!.toolId} (${p})`),
    });
    setReport(result);
    setProgress(null);
    setPhase("done");
    if (!result.ok && !error) {
      const failed = result.outcomes[result.outcomes.length - 1];
      setError(failed?.correction?.verification.reason ?? failed?.verification.reason ?? "The plan could not complete.");
    }
  };

  const downloadZip = async () => {
    if (!report?.outputs.length) return;
    const { zipSync } = await import("fflate");
    const entries: Record<string, Uint8Array> = {};
    for (const f of report.outputs) entries[f.name] = new Uint8Array(await f.blob.arrayBuffer());
    const zipped = zipSync(entries);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([zipped as BlobPart], { type: "application/zip" }));
    a.download = "ask-gigai-results.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /** The exact record /v1/agent/learn stores - goal, plan, outcomes. No file data. */
  const learnRecord = () => ({
    opt_in: true,
    goal,
    plan: { steps: plan?.steps ?? [] },
    outcomes: (report?.outcomes ?? []).map((o) => ({
      toolId: o.step.toolId, ok: o.verification.ok, corrected: Boolean(o.correction),
    })),
    edited,
  });

  const sendLearn = async () => {
    setLearnNote("sending");
    try {
      const r = await fetch("/v1/agent/learn", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(learnRecord()),
      });
      const d = await r.json().catch(() => null);
      setLearnNote(r.ok ? `Stored as ${d?.id}. Thank you.` : d?.detail?.error?.message ?? `Sharing failed (${r.status}).`);
    } catch {
      setLearnNote("Sharing failed - network error.");
    }
  };

  const savePlan = () => {
    if (!plan) return;
    const name = goal.slice(0, 60);
    const next = [...saved.filter((s) => s.name !== name), { name, goal, plan }].slice(-20);
    setSaved(next);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* */ }
  };

  const serverSteps = plan?.steps.filter((s) => !s.toolId.startsWith("browser.")) ?? [];

  /* ---------- tier picker (first run) ---------- */
  if (tier === null) {
    return (
      <div className="mx-auto max-w-lg rounded border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">How should plans be made?</h2>
        <div className="mt-4 space-y-3">
          {([
            ["device", "On this device", "A deterministic planner - no AI model, nothing to download, instant, and nothing about your request leaves the browser. The default, and the fallback for every other choice."],
            ["cloud", "Free cloud model", "Sends your goal sentence and file names/sizes (never contents) to our server, which asks a free-tier model for a smarter plan. Works when free quota is available; otherwise falls back to on-device."],
            ["byok", "My own API key", "Your browser calls your own model provider directly (Groq, Gemini, OpenRouter or Anthropic). The key stays in this browser."],
          ] as [Tier, string, string][]).map(([id, label, text]) => (
            <button key={id} type="button" onClick={() => chooseTier(id)}
              className="block w-full rounded border border-border p-3 text-left hover:border-primary">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Changeable any time. An on-device language model tier is being evaluated per
          device class and will appear here only when it is real.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* goal + files */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Planning: <strong className="text-foreground">{{ device: "on this device", cloud: "free cloud", byok: "your key" }[tier]}</strong></span>
        <button type="button" onClick={() => setTier(null)} className="underline hover:text-foreground">change</button>
      </div>
      {tier === "byok" ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <select value={byokProvider} onChange={(e) => setByokProvider(e.target.value)}
            className="h-9 rounded border border-border bg-background px-2 text-sm">
            <option value="groq">Groq</option><option value="gemini">Gemini</option>
            <option value="openrouter">OpenRouter</option><option value="anthropic">Anthropic</option>
          </select>
          <input type="password" value={byokKey} onChange={(e) => setByokKey(e.target.value)} placeholder="API key"
            className="h-9 w-64 rounded border border-border bg-background px-3 font-mono text-sm" />
          <button type="button"
            onClick={() => { try { localStorage.setItem(BYOK_KEY, JSON.stringify({ provider: byokProvider, key: byokKey })); } catch { /* */ } }}
            className="h-9 rounded border border-border px-3 text-sm">Save in browser</button>
          <button type="button"
            onClick={() => { try { localStorage.removeItem(BYOK_KEY); } catch { /* */ } setByokKey(""); }}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground">Forget key</button>
        </div>
      ) : null}

      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2}
        placeholder='What should happen? e.g. "resize to 1200 wide, convert to webp, keep it under 150kb"'
        className="mt-3 w-full rounded border border-border bg-background p-3 text-sm" />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-sm text-muted-foreground" />
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
          placeholder="API key (only for server-engine steps)"
          className="h-9 w-64 rounded border border-border bg-background px-3 font-mono text-xs" />
        <button type="button" onClick={() => void makePlan()} disabled={phase === "planning" || !goal.trim()}
          className="h-10 rounded bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {phase === "planning" ? "Planning..." : "Plan it"}
        </button>
      </div>
      {planNote ? <p className="mt-2 text-xs text-amber-700">{planNote}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {/* plan cards */}
      {plan && (phase === "confirm" || phase === "running" || phase === "done") ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            The plan ({plan.source === "heuristic" ? "built on this device" : "model-proposed, registry-validated"})
          </p>
          <div className="mt-2 space-y-2">
            {plan.steps.map((step, i) => (
              <PlanCard key={i} index={i} step={step} catalogue={catalogue!}
                onChange={(next) => {
                  const steps = [...plan.steps];
                  steps[i] = next;
                  const v = validatePlan({ steps }, catalogue!);
                  if (v.ok) { setPlan({ ...v.plan, source: plan.source }); setEdited(true); setError(null); }
                  else setError(v.error);
                }}
                onRemove={() => {
                  const steps = plan.steps.filter((_, j) => j !== i);
                  if (steps.length) { setPlan({ ...plan, steps }); setEdited(true); }
                }} />
            ))}
          </div>
          {serverSteps.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {serverSteps.length} step{serverSteps.length > 1 ? "s" : ""} run on our server
              ({serverSteps.map((s) => s.toolId).join(", ")}) - those files upload for
              processing and delete on schedule. Needs the API key field.
              The rest never leaves this device.
            </p>
          ) : (
            <p className="mt-2 text-xs text-emerald-700">
              Every step runs in this browser - zero file bytes leave the device.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => void run()} disabled={phase === "running"}
              className="rounded bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {phase === "running" ? progress ?? "Running..." : "Run"}
            </button>
            <button type="button" onClick={savePlan}
              className="rounded border border-border px-4 py-2 text-sm text-foreground hover:border-foreground/40">
              Save plan
            </button>
          </div>
        </div>
      ) : null}

      {/* results */}
      {report && phase === "done" ? (
        <div className="mt-6 rounded border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">
            {report.ok ? "Done" : "Stopped"} in {(report.totalMs / 1000).toFixed(1)}s
          </p>
          {net.armed ? (
            <p className={`mt-1 text-xs ${net.requests === 0 ? "text-emerald-700" : "text-amber-700"}`}>
              {net.requests === 0
                ? "Verified by a live network observer: 0 requests left this page while the plan ran."
                : `${net.requests} page request${net.requests > 1 ? "s" : ""} observed while running, to: ${net.hosts.join(", ")}. None were made by the tools - judge the hosts yourself (analytics pings show up here too).`}
            </p>
          ) : null}
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {report.outcomes.map((o, i) => (
              <li key={i}>
                {o.step.toolId} - {o.verification.ok ? `ok (${o.result.metrics.durationMs} ms)` : o.verification.reason}
                {o.correction ? ` -> corrected with ${o.correction.step.toolId}: ${o.correction.verification.ok ? "ok" : o.correction.verification.reason}` : ""}
              </li>
            ))}
          </ul>
          {report.outputs.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {report.outputs.map((f) => (
                <button key={f.name} type="button"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(f.blob);
                    a.download = f.name;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                  className="rounded border border-border px-2.5 py-1 text-xs text-primary hover:border-primary">
                  ↓ {f.name}
                </button>
              ))}
              {report.outputs.length > 1 ? (
                <button type="button" onClick={() => void downloadZip()}
                  className="rounded border border-border px-2.5 py-1 text-xs text-foreground">
                  ↓ all as zip
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Opt-in learning data: off by default, explicit send, exact JSON shown. */}
          {plan ? (
            <div className="mt-4 border-t border-border pt-3">
              {!showLearn ? (
                <button type="button" onClick={() => setShowLearn(true)}
                  className="text-xs text-muted-foreground underline hover:text-foreground">
                  Help improve planning (optional - see exactly what would be shared)
                </button>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Sharing is off by default. If you press Share, this exact JSON is stored
                    against your account - your goal, the plan and step outcomes. Never file
                    names, contents or results. Requires an API key.
                  </p>
                  <pre className="mt-2 max-h-40 overflow-auto rounded border border-border bg-muted/30 p-2 font-mono text-[11px] text-muted-foreground">
                    {JSON.stringify(learnRecord(), null, 1)}
                  </pre>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" disabled={!apiKey || learnNote === "sending"}
                      onClick={() => void sendLearn()}
                      className="rounded border border-border px-3 py-1 text-xs font-semibold text-foreground disabled:opacity-50">
                      Share this record
                    </button>
                    {!apiKey ? <span className="text-xs text-muted-foreground">Add your API key above to enable.</span> : null}
                    {learnNote && learnNote !== "sending" ? <span className="text-xs text-muted-foreground">{learnNote}</span> : null}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* saved plans */}
      {saved.length ? (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved plans (this browser)</p>
          <ul className="mt-2 space-y-1">
            {saved.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <button type="button" className="text-primary hover:underline"
                  onClick={() => { setGoal(s.goal); setPlan(s.plan); setPhase("confirm"); }}>
                  {s.name}
                </button>
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const next = saved.filter((x) => x.name !== s.name);
                    setSaved(next);
                    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* */ }
                  }}>
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function PlanCard({ index, step, catalogue, onChange, onRemove }: {
  index: number;
  step: PlanStep;
  catalogue: Catalogue;
  onChange: (next: PlanStep) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(JSON.stringify(step.input));
  const name = catalogue.browser.find((t) => t.id === step.toolId)?.name
    ?? catalogue.server.find((t) => t.id === step.toolId)?.name ?? step.toolId;
  const isServer = !step.toolId.startsWith("browser.");
  return (
    <div className="rounded border border-border bg-card p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded bg-muted px-1.5 text-xs font-semibold text-muted-foreground">{index + 1}</span>
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <code className="font-mono text-xs text-muted-foreground">{step.toolId}</code>
        {isServer ? <span className="rounded bg-amber-500/10 px-1.5 text-[10px] font-semibold text-amber-700">server</span> : <span className="rounded bg-emerald-600/10 px-1.5 text-[10px] font-semibold text-emerald-700">on-device</span>}
        <span className="ml-auto flex gap-2">
          <button type="button" onClick={() => setEditing((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
          <button type="button" onClick={onRemove} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{step.why}</p>
      {editing ? (
        <div className="mt-2 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            className="grow rounded border border-border bg-background px-2 py-1 font-mono text-xs" />
          <button type="button"
            onClick={() => {
              try { onChange({ ...step, input: JSON.parse(draft) }); setEditing(false); } catch { /* invalid json ignored */ }
            }}
            className="rounded border border-border px-2 text-xs">Apply</button>
        </div>
      ) : Object.keys(step.input).length ? (
        <code className="mt-1 block font-mono text-xs text-muted-foreground">{JSON.stringify(step.input)}</code>
      ) : null}
    </div>
  );
}
