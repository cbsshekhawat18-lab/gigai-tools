/**
 * Verb continuity for tool flows (de-ai-ux Rule 6): the same action keeps the
 * same word - button "Compress image" → working "Compressing image…" → result
 * "Compressed image". Never "Done", "Success" or a mid-flow verb swap.
 *
 * Derives the -ing and past forms from an action label's FIRST word so the
 * shared shells can stay consistent for every tool without 262 hand edits.
 * English morphology is irregular, so the rules carry an exceptions map for
 * every verb the registry actually uses; anything unknown falls back to the
 * label unchanged (honest, never mangled).
 */

const IRREGULAR: Record<string, [ing: string, past: string]> = {
  split: ["Splitting", "Split"],
  cut: ["Cutting", "Cut"],
  crop: ["Cropping", "Cropped"],
  strip: ["Stripping", "Stripped"],
  pad: ["Padding", "Padded"],
  flip: ["Flipping", "Flipped"],
  trim: ["Trimming", "Trimmed"],
  drop: ["Dropping", "Dropped"],
  fit: ["Fitting", "Fitted"],
  set: ["Setting", "Set"],
  redact: ["Redacting", "Redacted"],
};

function inflect(verb: string): [ing: string, past: string] | null {
  const v = verb.toLowerCase();
  if (IRREGULAR[v]) return IRREGULAR[v];
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  if (/[^aeiou]e$/.test(v)) {
    // resize → resizing / resized; rotate → rotating / rotated
    return [cap(v.slice(0, -1)) + "ing", cap(v) + "d"];
  }
  if (/(ss|rt|rn|ct|nd|st|ck|sh|ch|x|w|y|er|en|el|it|ost)$/.test(v) || /[aeiou]{2}[a-z]$/.test(v)) {
    // compress, convert, extract, boost, redraw, apply-ish endings: plain +ing/+ed
    return [cap(v) + "ing", cap(v) + "ed"];
  }
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(v)) {
    // single-vowel + final consonant: double it (crop handled above, but e.g. "plan")
    return [cap(v) + v.slice(-1) + "ing", cap(v) + v.slice(-1) + "ed"];
  }
  return [cap(v) + "ing", cap(v) + "ed"];
}

/**
 * "Compress image" → { working: "Compressing image…", done: "Compressed image" }.
 * Unknown/odd labels return the label itself for both, so nothing ever reads
 * as broken English.
 */
export function verbForms(actionLabel: string): { working: string; done: string } {
  const trimmed = actionLabel.trim();
  const [first, ...rest] = trimmed.split(/\s+/);
  if (!first || !/^[A-Za-z]+$/.test(first)) {
    return { working: `${trimmed}…`, done: trimmed };
  }
  const forms = inflect(first);
  if (!forms) return { working: `${trimmed}…`, done: trimmed };
  const tail = rest.length ? ` ${rest.join(" ")}` : "";
  return { working: `${forms[0]}${tail}…`, done: `${forms[1]}${tail}` };
}
