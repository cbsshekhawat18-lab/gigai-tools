/**
 * GigAI Tools: text diff engine.
 *
 * Character-, word-, or line-level diffs via the `diff` library (dynamic-
 * imported). Returns a flat list of parts tagged added/removed/equal plus a
 * count of added/removed units, ready for side-by-side or inline rendering.
 */

export type DiffMode = "chars" | "words" | "lines";

export interface DiffPart {
  type: "added" | "removed" | "equal";
  value: string;
}

export interface DiffResult {
  parts: DiffPart[];
  stats: {
    /** Number of added units (chars/words/lines, per `mode`). */
    added: number;
    /** Number of removed units. */
    removed: number;
  };
}

/** Count units within a chunk according to the diff mode. */
function countUnits(value: string, mode: DiffMode): number {
  if (mode === "lines") {
    // A trailing newline shouldn't inflate the count.
    const trimmed = value.endsWith("\n") ? value.slice(0, -1) : value;
    return trimmed.length === 0 ? 0 : trimmed.split("\n").length;
  }
  if (mode === "words") {
    const words = value.match(/\S+/g);
    return words ? words.length : 0;
  }
  return value.length;
}

/**
 * Compute a diff between `a` and `b` at the requested granularity. Async because
 * the `diff` library is dynamic-imported.
 */
export async function computeDiff(
  a: string,
  b: string,
  opts: { mode?: DiffMode } = {},
): Promise<DiffResult> {
  const mode = opts.mode ?? "lines";
  const diff = await import("diff");

  const changes =
    mode === "chars"
      ? diff.diffChars(a, b)
      : mode === "words"
        ? diff.diffWords(a, b)
        : diff.diffLines(a, b);

  const parts: DiffPart[] = [];
  let added = 0;
  let removed = 0;

  for (const change of changes) {
    const type: DiffPart["type"] = change.added ? "added" : change.removed ? "removed" : "equal";
    if (type === "added") added += countUnits(change.value, mode);
    else if (type === "removed") removed += countUnits(change.value, mode);
    parts.push({ type, value: change.value });
  }

  return { parts, stats: { added, removed } };
}
