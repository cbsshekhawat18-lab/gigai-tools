"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  MODELS,
  countAll,
  tokensForModel,
  costUSD,
  formatUSD,
  type TokenCounts,
} from "@/lib/dev/tokens";
import { optimizePrompt, type PromptOptimization } from "@/lib/dev/prompt-optimize";
import {
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSpacer,
} from "@/components/tool/dev";

const SAMPLE = `You are a helpful assistant. Summarise the following article in three concise bullet points, keeping the tone neutral and factual. Focus on the key findings and any numbers that matter, and avoid marketing language.`;

const ZERO: TokenCounts = { o200k: 0, cl100k: 0, estimate: 0 };

const PROVIDER_TINT: Record<string, string> = {
  OpenAI: "text-emerald-600",
  Anthropic: "text-orange-600",
  Google: "text-sky-600",
};

/**
 * LLM Token Counter + cost estimator. Paste a prompt and see the exact token
 * count (OpenAI, via the real BPE tokenizer) or an estimate (Claude/Gemini)
 * for every model at once, with the input cost: plus an optional reply-length
 * field for a full per-call estimate. All in the browser; nothing uploaded.
 */
export default function TokenCounterTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [text, setText] = React.useState("");
  const [replyTokens, setReplyTokens] = React.useState(0);
  const [counts, setCounts] = React.useState<TokenCounts>(ZERO);
  const [opt, setOpt] = React.useState<PromptOptimization | null>(null);
  const [optCounts, setOptCounts] = React.useState<TokenCounts>(ZERO);

  // Count the optimized prompt's tokens when it changes (for the savings figure).
  React.useEffect(() => {
    if (!opt) {
      setOptCounts(ZERO);
      return;
    }
    let cancelled = false;
    void countAll(opt.optimized).then((c) => {
      if (!cancelled) setOptCounts(c);
    });
    return () => {
      cancelled = true;
    };
  }, [opt]);

  const runOptimize = React.useCallback(() => setOpt(optimizePrompt(text)), [text]);
  const useOptimized = React.useCallback(() => {
    if (opt) {
      setText(opt.optimized);
      setOpt(null);
    }
  }, [opt]);

  // Recompute token counts (async: OpenAI encoders lazy-load) on a short debounce.
  React.useEffect(() => {
    if (!text) {
      setCounts(ZERO);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(() => {
      void countAll(text).then((c) => {
        if (!cancelled) setCounts(c);
      });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [text]);

  const chars = text.length;
  const words = React.useMemo(() => (text.trim().match(/\S+/g) ?? []).length, [text]);
  const hasText = text.trim().length > 0;

  return (
    <section aria-label="LLM token counter and cost estimator" className="flex flex-col gap-4">
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton icon="FlaskConical" label="Load sample" onClick={() => setText(SAMPLE)} />
          <ToolbarButton icon="Sparkles" label="Optimize prompt" onClick={runOptimize} disabled={!text.trim()} />
          <ToolbarButton icon="Trash2" label="Clear" onClick={() => { setText(""); setOpt(null); }} disabled={!text} />
        </ToolbarGroup>
        <ToolbarSpacer />
        {hasText ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatBadge icon="Type" label="Characters" value={chars.toLocaleString()} />
            <StatBadge icon="WholeWord" label="Words" value={words.toLocaleString()} />
            <StatBadge icon="Hash" label="GPT-4o tokens" value={counts.o200k.toLocaleString()} tone="info" />
          </div>
        ) : null}
      </Toolbar>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="token-input" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your prompt or text
        </label>
        <textarea
          id="token-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder="Paste a prompt, a system message, a document… token counts update live for every model, in your browser."
          className={cn(
            "min-h-[180px] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed outline-none",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            accent.ring,
          )}
        />
      </div>

      {/* Optimized prompt (deterministic trim - same instructions, fewer tokens) */}
      {opt ? (
        <OptimizePanel
          opt={opt}
          origTokens={counts.o200k}
          optTokens={optCounts.o200k}
          onUse={useOptimized}
          onDismiss={() => setOpt(null)}
        />
      ) : null}

      {/* Optional reply length for a full per-call cost */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
        <label htmlFor="reply-tokens" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="CornerDownRight" size={15} className={accent.text} />
          Expected reply length
        </label>
        <div className="relative">
          <input
            id="reply-tokens"
            type="number"
            min={0}
            step={100}
            value={replyTokens || ""}
            onChange={(e) => setReplyTokens(Math.max(0, Number(e.target.value) || 0))}
            placeholder="0"
            className={cn(
              "h-9 w-32 rounded-lg border border-border bg-background pl-3 pr-16 text-sm tabular-nums outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              accent.ring,
            )}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            tokens
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Optional: add the model&rsquo;s expected output length to see the full per-call cost.
        </span>
      </div>

      {/* Model comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">Model</th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">Input tokens</th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">Input cost</th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                {replyTokens > 0 ? "Total / call" : "Output $/1M"}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">Context</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => {
              const tokens = tokensForModel(m, counts);
              const inCost = costUSD(tokens, m.priceIn);
              const total = inCost + costUSD(replyTokens, m.priceOut);
              const ctxPct = m.context > 0 ? (tokens / m.context) * 100 : 0;
              const isEstimate = m.encoding === "estimate";
              return (
                <tr key={m.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{m.label}</span>
                    <span className={cn("ml-2 text-xs", PROVIDER_TINT[m.provider])}>{m.provider}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {isEstimate && <span className="text-muted-foreground" title="Estimate, Claude/Gemini tokenizers aren't public">≈ </span>}
                    {tokens.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{formatUSD(inCost)}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {replyTokens > 0 ? formatUSD(total) : `$${m.priceOut}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums text-muted-foreground">
                      {ctxPct < 0.1 && tokens > 0 ? "<0.1" : ctxPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        <Icon name="Info" size={12} className="mr-1 inline align-[-1px]" />
        OpenAI counts are exact (real BPE tokenizer). <span className="font-medium">≈</span> marks Claude &amp; Gemini,
        whose tokenizers aren&rsquo;t public. Those are estimates. Prices are approximate (USD per 1M tokens) and change
        often, so confirm the current rate with the provider. Everything runs in your browser: nothing is uploaded.
      </p>
    </section>
  );
}

/* ── Optimized-prompt panel ───────────────────────────────────────────────── */

function OptimizePanel({
  opt,
  origTokens,
  optTokens,
  onUse,
  onDismiss,
}: {
  opt: PromptOptimization;
  origTokens: number;
  optTokens: number;
  onUse: () => void;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const tokensSaved = Math.max(0, origTokens - optTokens);
  const pct = origTokens > 0 ? Math.round((tokensSaved / origTokens) * 100) : 0;
  const charsSaved = Math.max(0, opt.originalChars - opt.optimizedChars);
  const gpt4o = MODELS.find((m) => m.id === "gpt-4o");
  const per1k = gpt4o ? costUSD(tokensSaved, gpt4o.priceIn) * 1000 : 0;
  const noChange = tokensSaved === 0 && charsSaved === 0;

  const copy = () => {
    void navigator.clipboard.writeText(opt.optimized).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="Sparkles" size={16} className="text-primary" />
          Optimized prompt
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss" title="Dismiss"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon name="X" size={15} />
        </button>
      </div>

      {noChange ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Your prompt is already tight, there&rsquo;s no obvious filler or wordiness to trim.
        </p>
      ) : (
        <>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              GPT-4o tokens:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {origTokens.toLocaleString()} → {optTokens.toLocaleString()}
              </span>
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
              −{tokensSaved.toLocaleString()} tokens ({pct}%)
            </span>
            {per1k > 0 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                ≈ {formatUSD(per1k)} saved / 1,000 calls
              </span>
            ) : null}
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              −{charsSaved.toLocaleString()} chars
            </span>
          </div>

          <textarea
            readOnly
            value={opt.optimized}
            className="mt-3 h-32 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed outline-none"
          />

          {opt.changes.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
              {opt.changes.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Icon name="Check" size={12} className="mt-0.5 shrink-0 text-primary" />
                  {c}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onUse}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Icon name="Check" size={15} /> Use this prompt
            </button>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Icon name={copied ? "Check" : "Copy"} size={15} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <Icon name="Info" size={11} className="mr-1 inline align-[-1px]" />
            A rule-based trim (no AI, nothing sent anywhere). It removes filler and wordiness, not your actual
            instructions. Give it a quick read to confirm the meaning before you use it.
          </p>
        </>
      )}
    </div>
  );
}
