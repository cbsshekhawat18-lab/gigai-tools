/**
 * Generation orchestrator.
 *
 * THE CORE RULE (spec §37): analyse the family ONCE, store the DNA, reuse it for
 * every icon. Nothing here re-reads the references. `family.dna` is the single
 * source of truth and is passed to the renderer unchanged on every call, which
 * is what makes icon #500 match icon #1.
 *
 * Provider abstraction: `ConceptProvider` turns a concept into a composition.
 * The built-in vocabulary provider is deterministic, free, offline and covers
 * the common cases; an AI provider can be registered for the long tail without
 * anything else in the product knowing which one ran.
 */

import type {
  ConsistencyReport,
  Icon,
  IconFamily,
  OriginalityReport,
  OriginalityThresholds,
} from "./types";
import { DEFAULT_THRESHOLDS, shortId, slugify } from "./types";
import { lookupConcept, renderComposition, varyComposition, type Composition } from "./primitives";
import { checkConsistency, checkOriginality, fingerprint } from "./analyze";

/* ── Provider abstraction ─────────────────────────────────────────────────── */

export interface ConceptProvider {
  id: string;
  /** Return a composition for this concept, or null if it can't. */
  propose(concept: string, description: string): Promise<Composition | null>;
}

/** Deterministic, offline, free. Handles the concepts most families need. */
export const vocabularyProvider: ConceptProvider = {
  id: "vocabulary",
  async propose(concept) {
    return lookupConcept(concept);
  },
};

const providers: ConceptProvider[] = [vocabularyProvider];

/** Register an additional provider (e.g. an AI one) at a lower priority. */
export function registerProvider(provider: ConceptProvider): void {
  if (!providers.some((p) => p.id === provider.id)) providers.push(provider);
}

/* ── Result types ─────────────────────────────────────────────────────────── */

export interface GenerationOutcome {
  ok: boolean;
  icon?: Icon;
  /** Why it couldn't be produced: always specific, never "failed". */
  reason?: string;
  consistency?: ConsistencyReport;
  originality?: OriginalityReport;
  attempts: number;
  providerId?: string;
}

export interface GenerateOptions {
  concept: string;
  description?: string;
  category?: string;
  tags?: string[];
  thresholds?: OriginalityThresholds;
  references?: string[];
  signal?: AbortSignal;
}

/* ── Single icon ──────────────────────────────────────────────────────────── */

/**
 * Generate one icon for a family, regenerating on a similarity collision up to
 * the configured limit.
 *
 * A high-similarity icon is NEVER silently approved. If the limit is reached
 * and the result is still too close, the outcome says so and the caller decides
 * - the product must not quietly hand over a near-duplicate.
 */
export async function generateIcon(
  family: IconFamily,
  existing: Icon[],
  opts: GenerateOptions,
): Promise<GenerationOutcome> {
  const thresholds = opts.thresholds ?? DEFAULT_THRESHOLDS;
  const references = opts.references ?? [];
  const concept = opts.concept.trim();
  if (!concept) return { ok: false, reason: "Give the icon a name first.", attempts: 0 };

  let base: Composition | null = null;
  let providerId = "";
  for (const provider of providers) {
    try {
      base = await provider.propose(concept, opts.description ?? "");
    } catch (err) {
      // A provider that THROWS (e.g. the AI composer hitting its rate limit)
      // is reporting a condition the user must see. Not a miss to skip past.
      return {
        ok: false,
        attempts: 0,
        reason: err instanceof Error ? err.message : "The composer had a problem.",
      };
    }
    if (base) {
      providerId = provider.id;
      break;
    }
  }

  if (!base) {
    return {
      ok: false,
      attempts: 0,
      reason: `No composition is available for "${concept}". The built-in vocabulary doesn't include it, and the AI composer couldn't produce one either (it may be offline). Try a nearer everyday word, or draw the icon and import the SVG into this family.`,
    };
  }

  let attempts = 0;
  let lastOriginality: OriginalityReport | undefined;
  let lastConsistency: ConsistencyReport | undefined;
  let lastSvg = "";

  while (attempts <= thresholds.maxRegenerations) {
    if (opts.signal?.aborted) return { ok: false, reason: "Cancelled.", attempts };

    const comp = attempts === 0 ? base : varyComposition(base, attempts * 7 + concept.length);
    // The DNA is passed through untouched. This is the consistency guarantee.
    const svg = renderComposition(comp, family.dna, concept);
    lastSvg = svg;
    attempts++;

    const originality = checkOriginality(svg, existing, references, thresholds);
    const consistency = checkConsistency(svg, family.dna);
    lastOriginality = originality;
    lastConsistency = consistency;

    if (originality.verdict !== "regenerate") {
      const now = new Date().toISOString();
      const icon: Icon = {
        id: shortId("ICO"),
        familyId: family.id,
        name: concept,
        slug: slugify(concept),
        description: opts.description ?? "",
        category: opts.category ?? "General",
        // "ai-composed" is a real, searchable label: the arrangement came from
        // the AI composer rather than the built-in vocabulary. The DRAWING is
        // still the deterministic renderer either way.
        tags: providerId === "ai-composer" ? [...(opts.tags ?? []), "ai-composed"] : (opts.tags ?? []),
        svg,
        dnaSnapshot: family.dna,
        fingerprint: fingerprint(svg),
        originalityScore: originality.score,
        consistencyScore: consistency.overall,
        version: family.version,
        status: "draft",
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      return { ok: true, icon, consistency, originality, attempts, providerId };
    }
  }

  return {
    ok: false,
    attempts,
    consistency: lastConsistency,
    originality: lastOriginality,
    providerId,
    reason: `"${concept}" kept coming out too close to ${
      lastOriginality?.nearest?.name ?? "an existing icon"
    } after ${attempts} attempts. That usually means the family already contains this concept. Check before adding it again.`,
    ...(lastSvg ? {} : {}),
  };
}

/* ── Bulk ─────────────────────────────────────────────────────────────────── */

export interface BulkProgress {
  done: number;
  total: number;
  current: string;
  succeeded: number;
  failed: number;
}

/**
 * Generate many icons, one at a time, accumulating them into the family as it
 * goes so each new icon is checked against the ones just made.
 *
 * A failure never aborts the batch (spec §25): the outcome list records what
 * worked and what didn't, and the caller keeps everything that succeeded.
 */
export async function generateBulk(
  family: IconFamily,
  existing: Icon[],
  concepts: { name: string; description?: string; category?: string }[],
  opts: { thresholds?: OriginalityThresholds; references?: string[]; signal?: AbortSignal } = {},
  onProgress?: (p: BulkProgress) => void,
): Promise<GenerationOutcome[]> {
  const results: GenerationOutcome[] = [];
  const pool = [...existing];
  let succeeded = 0;
  let failed = 0;

  for (const [i, c] of concepts.entries()) {
    if (opts.signal?.aborted) break;

    onProgress?.({ done: i, total: concepts.length, current: c.name, succeeded, failed });

    const outcome = await generateIcon(family, pool, {
      concept: c.name,
      description: c.description,
      category: c.category,
      thresholds: opts.thresholds,
      references: opts.references,
      signal: opts.signal,
    });

    results.push(outcome);
    if (outcome.ok && outcome.icon) {
      pool.push(outcome.icon);
      succeeded++;
    } else {
      failed++;
    }

    // Yield to the event loop so the page stays responsive across a long batch.
    if (i % 5 === 4) await new Promise((r) => setTimeout(r, 0));
  }

  onProgress?.({ done: concepts.length, total: concepts.length, current: "", succeeded, failed });
  return results;
}

/** Suggested concepts by category, for the bulk screen's starting point. */
export const CATEGORY_PRESETS: Record<string, string[]> = {
  Navigation: [
    "home", "menu", "search", "settings", "filter", "close", "plus", "check",
    "grid", "list", "columns", "sidebar", "maximize", "arrow-right", "arrow-left",
    "arrow-up", "arrow-down", "refresh", "external",
  ],
  Communication: [
    "mail", "message", "bell", "link", "users", "phone", "send", "megaphone",
    "video", "mic", "thumbs-up",
  ],
  Files: [
    "file", "folder", "download", "upload", "trash", "image", "copy", "save",
    "archive", "bookmark", "film",
  ],
  Business: [
    "chart", "card", "clock", "calendar", "star", "globe", "briefcase", "cart",
    "tag", "wallet", "receipt", "trending-up", "trending-down", "target",
    "award", "gift", "pie-chart", "activity", "building", "flag",
  ],
  Security: [
    "lock", "shield", "key", "user", "eye", "eye-off", "fingerprint", "info",
    "warning", "ban", "verified",
  ],
  Developer: [
    "code", "database", "cloud", "terminal", "git", "cpu", "bug", "package",
    "branch", "wifi", "power",
  ],
  Media: ["play", "volume", "headphones", "layers", "sun", "moon", "zap", "edit", "map", "pin"],
  AI: ["sparkles", "robot", "database", "code", "user-plus", "arrow-repeat"],
};
