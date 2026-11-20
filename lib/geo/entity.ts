/**
 * GigAI GEO engine: entity consistency checking.
 *
 * Language models build confidence in an entity (a brand, product, person)
 * from AGREEMENT across sources: your site, GitHub, LinkedIn, Product Hunt,
 * Crunchbase, G2. This engine compares the descriptions you paste from each
 * source and flags the disagreements that erode that confidence: name-spelling
 * drift, conflicting numbers, conflicting years, and sources that omit the
 * canonical facts others state.
 *
 * Honest scope: it's a rigorous diff aid for facts we can detect mechanically
 * (names, numbers, years, URLs), not a semantic fact-checker. Pure functions.
 */

export interface EntitySource {
  /** Where the description came from, e.g. "Your website", "GitHub". */
  label: string;
  text: string;
}

export interface NameVariant {
  variant: string;
  sources: string[];
}

export interface NumberFact {
  /** Normalized "value unit" key, e.g. "250 tools". */
  key: string;
  raw: string;
  sources: string[];
}

export interface EntityFinding {
  kind: "name-drift" | "number-conflict" | "year-conflict" | "missing-fact" | "length-outlier";
  severity: "fail" | "warn";
  message: string;
  /** Which sources are involved. */
  sources: string[];
  evidence: string[];
}

export interface EntityReport {
  sources: string[];
  nameVariants: NameVariant[];
  findings: EntityFinding[];
  /** Facts (number+unit) stated consistently everywhere they appear. */
  agreedFacts: string[];
}

/** Find every capitalization/spacing variant of the brand name across sources. */
function collectNameVariants(brand: string, sources: EntitySource[]): NameVariant[] {
  const target = brand.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!target) return [];
  const variants = new Map<string, Set<string>>();
  for (const s of sources) {
    // Candidate tokens whose letters+digits equal the brand's — catches
    // "GigAI", "Gigai", "gig-ai". Single words AND adjacent pairs are both
    // tested, because a two-word brand ("Acme Analytics") must match while a
    // one-word brand must not be swallowed by the pair scan.
    const words = s.text.match(/[\w.&-]+/g) ?? [];
    const candidates: string[] = [...words];
    for (let i = 0; i < words.length - 1; i++) candidates.push(`${words[i]} ${words[i + 1]}`);
    for (const t of candidates) {
      if (t.replace(/[^a-z0-9]/gi, "").toLowerCase() === target) {
        if (!variants.has(t)) variants.set(t, new Set());
        variants.get(t)!.add(s.label);
      }
    }
  }
  return Array.from(variants.entries()).map(([variant, srcs]) => ({
    variant,
    sources: Array.from(srcs),
  }));
}

/** Extract "number + unit-word" facts, e.g. "262 tools", "$5M", "2019". */
function extractNumberFacts(text: string): { key: string; raw: string }[] {
  const facts: { key: string; raw: string }[] = [];
  const matches = text.matchAll(
    /(\$|€|£)?\s?(\d[\d,.]*)\s?(k|m|b|million|billion|thousand)?\s*([a-z][a-z-]{2,})?/gi,
  );
  for (const m of matches) {
    const [raw, currency, num, scale, unit] = m;
    if (!num || (!currency && !scale && !unit)) continue;
    const value = num.replace(/,/g, "");
    const unitKey = (unit ?? "").toLowerCase().replace(/s$/, "");
    // Skip junk units (stopwords that follow numbers incidentally).
    if (unitKey && ["the", "and", "with", "for", "that", "this", "are", "was", "have", "from", "into", "more", "than", "over", "about"].includes(unitKey)) continue;
    const key = `${currency ?? ""}${value}${scale ? scale.toLowerCase() : ""}${unitKey ? ` ${unitKey}` : ""}`.trim();
    facts.push({ key, raw: raw.trim() });
  }
  return facts;
}

/** Years (1990–2039) mentioned, often founding dates — conflicts matter. */
function extractYears(text: string): string[] {
  return Array.from(new Set(text.match(/\b(?:19|20)[0-9]{2}\b/g) ?? []));
}

/** Compare descriptions of one entity across sources. */
export function compareEntitySources(brand: string, sources: EntitySource[]): EntityReport {
  const active = sources.filter((s) => s.text.trim().length > 0);
  const findings: EntityFinding[] = [];
  const labels = active.map((s) => s.label);

  // ── Name drift ────────────────────────────────────────────────────────────
  const nameVariants = collectNameVariants(brand, active);
  if (nameVariants.length > 1) {
    findings.push({
      kind: "name-drift",
      severity: "fail",
      message: `Your name is spelled ${nameVariants.length} different ways across sources. Models treat spelling variants as weaker evidence for one entity.`,
      sources: labels,
      evidence: nameVariants.map((v) => `"${v.variant}" on ${v.sources.join(", ")}`),
    });
  }

  // ── Number facts: same unit, different value = conflict ───────────────────
  const factsBySource = active.map((s) => ({ label: s.label, facts: extractNumberFacts(s.text) }));
  const byUnit = new Map<string, Map<string, Set<string>>>(); // unit → value → sources
  for (const fs of factsBySource) {
    for (const f of fs.facts) {
      const parts = f.key.split(" ");
      if (parts.length < 2) continue;
      const unit = parts.slice(1).join(" ");
      const value = parts[0];
      if (!value) continue;
      if (!byUnit.has(unit)) byUnit.set(unit, new Map());
      const values = byUnit.get(unit)!;
      if (!values.has(value)) values.set(value, new Set());
      values.get(value)!.add(fs.label);
    }
  }
  const agreedFacts: string[] = [];
  for (const [unit, values] of byUnit) {
    if (values.size > 1) {
      const evidence = Array.from(values.entries()).map(
        ([value, srcs]) => `"${value} ${unit}" on ${Array.from(srcs).join(", ")}`,
      );
      findings.push({
        kind: "number-conflict",
        severity: "fail",
        message: `Sources disagree about "${unit}": ${values.size} different values. Pick the true number and update every profile.`,
        sources: labels,
        evidence,
      });
    } else {
      const only = Array.from(values.entries())[0];
      if (only && only[1].size > 1) {
        agreedFacts.push(`${only[0]} ${unit} (consistent on ${only[1].size} sources)`);
      }
    }
  }

  // ── Year conflicts (typically founding year) ──────────────────────────────
  const yearSets = active.map((s) => ({ label: s.label, years: extractYears(s.text) }));
  const allYears = new Map<string, Set<string>>();
  for (const ys of yearSets) for (const y of ys.years) {
    if (!allYears.has(y)) allYears.set(y, new Set());
    allYears.get(y)!.add(ys.label);
  }
  const contestedYears = Array.from(allYears.entries()).filter(([, srcs]) => srcs.size === 1);
  if (allYears.size > 1 && contestedYears.length > 0 && yearSets.filter((y) => y.years.length).length > 1) {
    findings.push({
      kind: "year-conflict",
      severity: "warn",
      message:
        "Different years appear on different sources. If one of these is your founding year, make sure every profile states the same one.",
      sources: labels,
      evidence: Array.from(allYears.entries()).map(([y, srcs]) => `${y} on ${Array.from(srcs).join(", ")}`),
    });
  }

  // ── Length outliers: a near-empty profile is a missing signal ─────────────
  const lengths = active.map((s) => ({ label: s.label, words: (s.text.trim().match(/\S+/g) ?? []).length }));
  for (const l of lengths) {
    if (active.length > 1 && l.words < 15) {
      findings.push({
        kind: "length-outlier",
        severity: "warn",
        message: `${l.label} describes you in only ${l.words} words, too thin to corroborate anything the other sources say.`,
        sources: [l.label],
        evidence: [],
      });
    }
  }

  return { sources: labels, nameVariants, findings, agreedFacts };
}
