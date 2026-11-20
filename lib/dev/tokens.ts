/**
 * LLM token counter + cost estimator engine.
 *
 * EXACT for OpenAI models. We run the real BPE tokenizer (gpt-tokenizer:
 * o200k_base for GPT-4o/4.1/o-series, cl100k_base for GPT-3.5/legacy-4), loaded
 * on demand so it never touches the initial bundle.
 *
 * ESTIMATE for Anthropic (Claude) and Google (Gemini): their tokenizers aren't
 * publicly available as browser libraries, so we use a character/word heuristic
 * and label those rows clearly as approximate. Everything runs in the browser.
 *
 * PRICING is approximate and changes often, the UI tells users to confirm the
 * current rate with the provider. Prices are USD per 1,000,000 tokens.
 */

export type Encoding = "o200k" | "cl100k" | "estimate";

export interface ModelInfo {
  id: string;
  label: string;
  provider: "OpenAI" | "Anthropic" | "Google";
  encoding: Encoding;
  /** USD per 1M input tokens (approximate). */
  priceIn: number;
  /** USD per 1M output tokens (approximate). */
  priceOut: number;
  /** Context window in tokens, for the "% of context" readout. */
  context: number;
}

/** Approximate pricing (USD / 1M tokens), July 2026. VERIFY with the provider. */
export const MODELS: ModelInfo[] = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", encoding: "o200k", priceIn: 2.5, priceOut: 10, context: 128_000 },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "OpenAI", encoding: "o200k", priceIn: 0.15, priceOut: 0.6, context: 128_000 },
  { id: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI", encoding: "o200k", priceIn: 2.0, priceOut: 8.0, context: 1_000_000 },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", provider: "OpenAI", encoding: "o200k", priceIn: 0.4, priceOut: 1.6, context: 1_000_000 },
  { id: "o4-mini", label: "o4-mini", provider: "OpenAI", encoding: "o200k", priceIn: 1.1, priceOut: 4.4, context: 200_000 },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI", encoding: "cl100k", priceIn: 0.5, priceOut: 1.5, context: 16_000 },
  { id: "claude-opus", label: "Claude Opus 4", provider: "Anthropic", encoding: "estimate", priceIn: 15, priceOut: 75, context: 200_000 },
  { id: "claude-sonnet", label: "Claude Sonnet 4.5", provider: "Anthropic", encoding: "estimate", priceIn: 3, priceOut: 15, context: 200_000 },
  { id: "claude-haiku", label: "Claude Haiku", provider: "Anthropic", encoding: "estimate", priceIn: 0.8, priceOut: 4, context: 200_000 },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google", encoding: "estimate", priceIn: 1.25, priceOut: 10, context: 1_000_000 },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", encoding: "estimate", priceIn: 0.3, priceOut: 2.5, context: 1_000_000 },
];

export interface TokenCounts {
  /** Exact o200k_base count (GPT-4o/4.1/o-series). */
  o200k: number;
  /** Exact cl100k_base count (GPT-3.5 / legacy GPT-4). */
  cl100k: number;
  /** Heuristic estimate for Claude / Gemini. */
  estimate: number;
}

/**
 * Character/word heuristic for tokenizers we can't run exactly. English text is
 * roughly 4 characters per token; we floor at the word count so short, spacey
 * text isn't under-counted.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const words = (text.trim().match(/\S+/g) ?? []).length;
  return Math.max(words, Math.round(text.length / 4));
}

/** Count tokens for one encoding. OpenAI encoders are lazy-imported. */
export async function countTokens(text: string, encoding: Encoding): Promise<number> {
  if (!text) return 0;
  if (encoding === "estimate") return estimateTokens(text);
  if (encoding === "o200k") {
    const { encode } = await import("gpt-tokenizer/encoding/o200k_base");
    return encode(text).length;
  }
  const { encode } = await import("gpt-tokenizer/encoding/cl100k_base");
  return encode(text).length;
}

/** Compute all three counts once (the encoders load in parallel, on demand). */
export async function countAll(text: string): Promise<TokenCounts> {
  if (!text) return { o200k: 0, cl100k: 0, estimate: 0 };
  const [o, c] = await Promise.all([
    countTokens(text, "o200k"),
    countTokens(text, "cl100k"),
  ]);
  return { o200k: o, cl100k: c, estimate: estimateTokens(text) };
}

/** Pick the right count for a model from a pre-computed TokenCounts bundle. */
export function tokensForModel(model: ModelInfo, counts: TokenCounts): number {
  return model.encoding === "o200k"
    ? counts.o200k
    : model.encoding === "cl100k"
      ? counts.cl100k
      : counts.estimate;
}

/** USD cost for a token count at a per-1M price. */
export function costUSD(tokens: number, pricePerM: number): number {
  return (tokens / 1_000_000) * pricePerM;
}

/** Format a small USD amount with enough precision to be meaningful. */
export function formatUSD(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return `$${amount.toFixed(5)}`;
  if (amount < 1) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}
