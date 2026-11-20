/**
 * Deterministic PROMPT OPTIMIZER, trims a prompt so it costs fewer tokens while
 * keeping the same instructions. No LLM, no network: it's transparent find/replace
 * of wordy phrases + politeness filler + redundant whitespace, so the user can
 * see exactly what changed and always reviews before using it. Conservative by
 * design. It removes fluff, never the actual task.
 */

export interface PromptOptimization {
  original: string;
  optimized: string;
  /** Plain-English notes on what was trimmed. */
  changes: string[];
  originalChars: number;
  optimizedChars: number;
}

/** Wordy phrase → concise equivalent (meaning preserved). */
const PHRASES: [RegExp, string][] = [
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat (?:this|the) (?:present )?(?:point|moment)(?: in time)?\b/gi, "now"],
  [/\bin the event that\b/gi, "if"],
  [/\bfor the purpose of\b/gi, "to"],
  [/\bwith (?:regard|respect) to\b/gi, "about"],
  [/\bin spite of the fact that\b/gi, "although"],
  [/\bthe (?:vast )?majority of\b/gi, "most"],
  [/\ba (?:large|great|good) (?:number|deal) of\b/gi, "many"],
  [/\bin a timely manner\b/gi, "promptly"],
  [/\btake into (?:consideration|account)\b/gi, "consider"],
  [/\bmake use of\b/gi, "use"],
  [/\bin the near future\b/gi, "soon"],
  [/\bon a regular basis\b/gi, "regularly"],
  [/\bprior to\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bin conjunction with\b/gi, "with"],
  [/\bhas the ability to\b/gi, "can"],
  [/\bis able to\b/gi, "can"],
];

/** Politeness / meta filler that doesn't change the instruction. */
const FILLER: RegExp[] = [
  /\bit is important to note that\b/gi,
  /\bplease (?:note|be aware) that\b/gi,
  /\bas a matter of fact,?\b/gi,
  /\bneedless to say,?\b/gi,
  /\b(?:please|kindly)\b/gi,
  /\bi (?:would like|want|need) you to\b/gi,
  /\bcould you (?:please )?/gi,
  /\bcan you (?:please )?/gi,
  /\bmake sure (?:that )?(?:you )?/gi,
  /\bbe sure to\b/gi,
  /\bas an ai(?: language)? model,?\b/gi,
  /\bi was wondering if you could\b/gi,
];

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

/** Optimize a prompt. Pure + synchronous. */
export function optimizePrompt(text: string): PromptOptimization {
  const original = text;
  let out = text;
  const changes: string[] = [];

  // 1) Wordy phrases → concise.
  let phrases = 0;
  for (const [re, rep] of PHRASES) {
    phrases += countMatches(out, re);
    out = out.replace(re, rep);
  }
  if (phrases > 0) changes.push(`Shortened ${phrases} wordy phrase${phrases > 1 ? "s" : ""} (e.g. “in order to” → “to”).`);

  // 2) Politeness / meta filler.
  let filler = 0;
  for (const re of FILLER) {
    filler += countMatches(out, re);
    out = out.replace(re, "");
  }
  if (filler > 0) changes.push(`Removed ${filler} politeness/filler phrase${filler > 1 ? "s" : ""} (“please”, “I want you to”, …).`);

  // 3) Whitespace + leftover-punctuation cleanup.
  const beforeWs = out.length;
  out = out
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/([.,;:!?])\1+/g, "$1")
    .replace(/ {2,}/g, " ")
    .replace(/^[ \t]+/gm, (m) => m) // keep intentional indentation
    .trim();
  if (out.length < beforeWs) changes.push("Collapsed extra spaces and blank lines.");

  // 4) Drop consecutive duplicate lines.
  const lines = out.split("\n");
  const deduped = lines.filter((l, i) => l.trim() === "" || l !== lines[i - 1]);
  const removed = lines.length - deduped.length;
  if (removed > 0) changes.push(`Removed ${removed} repeated line${removed > 1 ? "s" : ""}.`);
  out = deduped.join("\n");

  // Capitalise the first letter if a filler removal exposed a lowercase start.
  out = out.replace(/^([a-z])/, (_, c) => c.toUpperCase());

  return {
    original,
    optimized: out,
    changes,
    originalChars: original.length,
    optimizedChars: out.length,
  };
}
