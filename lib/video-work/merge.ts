/**
 * Video → Work: multi-video reconciliation.
 *
 * Clients don't specify a project in one sitting. They send a Loom, then
 * another one a week later that changes half of it, then a third that
 * contradicts the second without acknowledging it. The value of holding several
 * videos in one project is entirely in noticing that, a pile of findings from
 * four videos with no cross-references is just four transcripts in a trenchcoat.
 *
 * So this module answers three questions about each new finding:
 *
 *   Is this the same thing said again?          → repeated
 *   Is this the same thing, now different?      → changed
 *   Is this the opposite of what was said?      → contradicted
 *
 * WHAT IT DELIBERATELY DOES NOT DO is pick a winner. "Newest wins" sounds
 * obvious and is wrong often enough to be dangerous: clients think out loud,
 * float an idea, then walk it back, and the walk-back is sometimes the earlier
 * video, not the later one. So a contradiction is surfaced as an open question
 * with both sides and their timestamps, and stays open until a human resolves
 * it. Nothing is silently dropped either; every finding keeps its evidence, and
 * relationships are recorded alongside rather than by deletion.
 *
 * All of it is deterministic string work, no model call, so it is fast, free,
 * unit-testable, and still runs when analysis is unavailable.
 */

import type { ChangeKind, ChangeRecord, Finding, FindingType } from "./types";

/* ── Tuning ───────────────────────────────────────────────────────────────── */

/** Token overlap at or above this means the two findings are about one subject. */
const SAME_SUBJECT = 0.45;

/** Above this, with no differing detail, the later mention adds nothing new. */
const NEAR_IDENTICAL = 0.82;

/** Words too common to carry meaning about *what* a finding concerns. */
const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","then","this","that","these","those","it","its",
  "is","are","was","were","be","been","being","to","of","in","on","at","for","with",
  "from","by","as","we","i","you","they","he","she","should","would","could","can",
  "will","need","needs","needed","want","wants","make","makes","made","please","also",
  "when","where","which","who","what","how","not","no","yes","do","does","did","get",
  "got","has","have","had","there","here","just","really","very","so","too","more",
  "about","into","over","after","before","because","client","user","page","site",
]);

/**
 * Opposing-value vocabularies. Two findings about the same subject that each
 * carry a *different* value from the SAME group are contradicting each other -
 * "make the button blue" against "make the button green" is a decision the user
 * has to make, not a second task to do.
 */
const OPPOSITION_GROUPS: ReadonlyArray<{ name: string; values: readonly string[] }> = [
  {
    name: "color",
    values: [
      "red","blue","green","yellow","orange","purple","pink","black","white","grey",
      "gray","teal","navy","gold","silver","brown","cyan","magenta","violet",
    ],
  },
  { name: "size", values: ["bigger", "larger", "smaller", "wider", "narrower", "taller", "shorter"] },
  {
    name: "position",
    values: ["top", "bottom", "left", "right", "above", "below", "header", "footer", "sidebar"],
  },
  { name: "visibility", values: ["show", "hide", "remove", "add", "delete", "keep", "restore"] },
  { name: "state", values: ["enable", "disable", "on", "off", "required", "optional"] },
  { name: "alignment", values: ["centre", "center", "centred", "centered", "justified"] },
];

/* ── Similarity ───────────────────────────────────────────────────────────── */

/** The words that describe what a finding is *about*. */
export function subjectTokens(finding: Finding): Set<string> {
  const text = [finding.title, finding.description, finding.interpretation, finding.area].join(" ");
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

/** Jaccard overlap of two token sets, 0–1. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/**
 * How likely two findings concern the same thing.
 *
 * Token overlap does the work; matching area and type nudge it up, because two
 * findings in the same area of the product are far more likely to be about one
 * element than two that merely share vocabulary.
 */
export function similarity(a: Finding, b: Finding): number {
  const base = jaccard(subjectTokens(a), subjectTokens(b));
  let score = base;
  if (a.area && b.area && a.area.toLowerCase() === b.area.toLowerCase()) score += 0.12;
  if (a.type === b.type) score += 0.06;
  return Math.min(1, score);
}

/**
 * Find an opposition: the same subject given two different values from one
 * vocabulary. Returns the group name and both values so the UI can say exactly
 * what the disagreement is, rather than "these look similar".
 */
export function findOpposition(
  a: Finding,
  b: Finding,
): { group: string; previous: string; current: string } | null {
  const textA = findingText(a);
  const textB = findingText(b);

  for (const group of OPPOSITION_GROUPS) {
    const inA = group.values.filter((value) => hasWord(textA, value));
    const inB = group.values.filter((value) => hasWord(textB, value));
    if (inA.length === 0 || inB.length === 0) continue;

    // Only a conflict if neither side mentions the other's value, a sentence
    // saying "change it from blue to green" contains both and is not a conflict.
    const overlap = inA.some((value) => inB.includes(value));
    if (overlap) continue;

    return { group: group.name, previous: inA[0]!, current: inB[0]! };
  }
  return null;
}

function findingText(finding: Finding): string {
  return [
    finding.title,
    finding.description,
    finding.interpretation,
    finding.expected,
    finding.evidence.clientStatement,
  ]
    .join(" ")
    .toLowerCase();
}

function hasWord(haystack: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(haystack);
}

/* ── Merge ────────────────────────────────────────────────────────────────── */

export interface MergeResult {
  findings: Finding[];
  changes: ChangeRecord[];
  /** Ids assigned to the incoming findings, in input order. */
  assignedIds: string[];
}

const ID_PREFIX: Record<FindingType, string> = {
  BUG: "BUG",
  FEATURE: "FEATURE",
  DESIGN_CHANGE: "DESIGN",
  CONTENT_CHANGE: "CONTENT",
  TASK: "TASK",
  QUESTION: "QUESTION",
  DECISION: "DECISION",
  REQUIREMENT: "REQ",
  REFERENCE: "REF",
};

/**
 * Fold a video's findings into the project.
 *
 * Incoming findings are re-numbered first: the model numbers from BUG-001 for
 * every video it sees, so a second video would otherwise collide with the
 * first and silently overwrite it in any id-keyed lookup. Dependencies are
 * rewritten to match.
 */
export function mergeFindings(existing: Finding[], incoming: Finding[]): MergeResult {
  const taken = new Set(existing.map((f) => f.id));
  const remap = new Map<string, string>();

  const renumbered = incoming.map((finding) => {
    const id = nextId(ID_PREFIX[finding.type], taken);
    taken.add(id);
    remap.set(finding.id, id);
    return { ...finding, id };
  });

  // Dependencies referenced the pre-merge ids; repoint them, and drop any that
  // pointed at a finding this video didn't actually produce.
  const resolved = renumbered.map((finding) => ({
    ...finding,
    dependencies: finding.dependencies
      .map((dependency) => remap.get(dependency) ?? dependency)
      .filter((dependency) => taken.has(dependency)),
  }));

  const changes: ChangeRecord[] = [];

  for (const finding of resolved) {
    const match = bestMatch(existing, finding);
    if (!match) continue;

    const opposition = findOpposition(match.finding, finding);
    const kind: ChangeKind = opposition
      ? "contradicted"
      : match.score >= NEAR_IDENTICAL
        ? "repeated"
        : "changed";

    changes.push({
      kind,
      previousId: match.finding.id,
      currentId: finding.id,
      similarity: Number(match.score.toFixed(3)),
      reason: describe(kind, match.finding, finding, opposition),
    });
  }

  return {
    findings: [...existing, ...resolved],
    changes,
    assignedIds: resolved.map((f) => f.id),
  };
}

function bestMatch(
  existing: Finding[],
  candidate: Finding,
): { finding: Finding; score: number } | null {
  let best: { finding: Finding; score: number } | null = null;
  for (const finding of existing) {
    // A question and the requirement it produced aren't the same item.
    if (finding.type !== candidate.type && !comparableTypes(finding.type, candidate.type)) continue;
    const score = similarity(finding, candidate);
    if (score >= SAME_SUBJECT && (!best || score > best.score)) {
      best = { finding, score };
    }
  }
  return best;
}

/** Types that can legitimately describe the same underlying subject. */
function comparableTypes(a: FindingType, b: FindingType): boolean {
  const design = new Set<FindingType>(["DESIGN_CHANGE", "CONTENT_CHANGE"]);
  const work = new Set<FindingType>(["FEATURE", "REQUIREMENT", "TASK"]);
  return (design.has(a) && design.has(b)) || (work.has(a) && work.has(b));
}

function describe(
  kind: ChangeKind,
  previous: Finding,
  current: Finding,
  opposition: { group: string; previous: string; current: string } | null,
): string {
  if (kind === "contradicted" && opposition) {
    return `Earlier the ${opposition.group} was “${opposition.previous}”, now it's “${opposition.current}”. Both refer to ${previous.area || "the same area"}, confirm which one stands.`;
  }
  if (kind === "repeated") {
    return `The client raised this again in a later video without adding anything new.`;
  }
  return `This revisits “${previous.title}” with different detail. Review both before building.`;
}

/** Next free ticket id for a prefix, e.g. BUG-004. */
function nextId(prefix: string, taken: Set<string>): string {
  let n = 1;
  for (;;) {
    const id = `${prefix}-${String(n).padStart(3, "0")}`;
    if (!taken.has(id)) return id;
    n += 1;
  }
}

/* ── Views over the change log ────────────────────────────────────────────── */

/** Conflicts the user still has to settle. */
export function openConflicts(changes: ChangeRecord[]): ChangeRecord[] {
  return changes.filter((change) => change.kind === "contradicted" && !change.resolution);
}

/**
 * Apply a user's decision about a conflict.
 *
 * Resolution is recorded on the change and reflected in finding status -
 * rejecting the side they didn't pick, so the handoff never ships both halves
 * of a contradiction as work to do.
 */
export function resolveConflict(
  findings: Finding[],
  changes: ChangeRecord[],
  changeIndex: number,
  choice: NonNullable<ChangeRecord["resolution"]>,
): { findings: Finding[]; changes: ChangeRecord[] } {
  const change = changes[changeIndex];
  if (!change) return { findings, changes };

  const rejectedId =
    choice === "keep-current"
      ? change.previousId
      : choice === "keep-previous"
        ? change.currentId
        : null;

  return {
    findings: findings.map((finding) =>
      finding.id === rejectedId ? { ...finding, status: "rejected" as const } : finding,
    ),
    changes: changes.map((entry, index) =>
      index === changeIndex ? { ...entry, resolution: choice } : entry,
    ),
  };
}

/** Ids the user has explicitly rejected via a conflict resolution. */
export function supersededIds(changes: ChangeRecord[]): Set<string> {
  const superseded = new Set<string>();
  for (const change of changes) {
    if (change.resolution === "keep-current") superseded.add(change.previousId);
    if (change.resolution === "keep-previous") superseded.add(change.currentId);
  }
  return superseded;
}
