/**
 * Text analysis, statistics only, and honest about what they're worth.
 *
 * There is no reliable client-side way to tell AI-written text from human
 * text. Published detectors are unreliable enough that some universities have
 * withdrawn them, they misfire badly on non-native English, and paraphrasing
 * defeats them. So this module deliberately does NOT return an "AI" direction
 * from statistics alone.
 *
 * What it does instead is measure real, checkable properties: sentence-length
 * variation (burstiness), lexical diversity, phrase repetition: present them
 * as observations, and let the user weigh them. Uniform sentence length is a
 * genuine characteristic of a lot of generated prose; it is also a genuine
 * characteristic of technical writing, translated text and anything edited to a
 * house style. Saying so is the whole point.
 */

import type { Signal, TextStats } from "./types";

const SENTENCE_SPLIT = /(?<=[.!?])[\s\n]+(?=[A-Z"'(\[])/g;

export function computeTextStats(text: string): TextStats {
  const clean = text.replace(/\s+/g, " ").trim();
  const words = clean ? clean.split(/\s+/) : [];
  const sentences = clean ? clean.split(SENTENCE_SPLIT).filter((s) => s.trim().length > 0) : [];

  const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
  const mean = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const variance = lengths.length
    ? lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length
    : 0;

  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z0-9''-]/g, "")).filter(Boolean);
  const unique = new Set(lower);

  // Most repeated 3-gram: a real tell for templated or padded writing.
  const grams = new Map<string, number>();
  for (let i = 0; i + 2 < lower.length; i++) {
    const g = `${lower[i]} ${lower[i + 1]} ${lower[i + 2]}`;
    grams.set(g, (grams.get(g) ?? 0) + 1);
  }
  let topPhrase: TextStats["topPhrase"];
  for (const [phrase, count] of grams) {
    if (count > (topPhrase?.count ?? 2)) topPhrase = { phrase, count };
  }

  return {
    words: words.length,
    sentences: sentences.length,
    burstiness: Math.sqrt(variance),
    meanSentenceLength: mean,
    lexicalDiversity: lower.length ? unique.size / lower.length : 0,
    topPhrase,
  };
}

/**
 * Turn text statistics into signals.
 *
 * Note every direction below is "neutral". That is deliberate and is the
 * honest position: none of these measurements can distinguish authorship on
 * their own, so none of them are allowed to push the classifier towards a
 * verdict. They inform the reader; they do not decide.
 */
export function textSignals(stats: TextStats): Signal[] {
  const signals: Signal[] = [];

  if (stats.words < 120) {
    signals.push({
      id: "text-too-short",
      category: "content",
      title: "Too little text to analyse meaningfully",
      finding: `Only ${stats.words} words. Statistical writing measures need a few hundred words before they mean anything.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      alternative: "Short text simply cannot be assessed this way, by anyone, with any tool.",
      module: "text",
    });
    return signals;
  }

  signals.push({
    id: "text-burstiness",
    category: "content",
    title: "Sentence-length variation",
    finding:
      stats.burstiness < 4
        ? `Sentence lengths are unusually uniform (variation ${stats.burstiness.toFixed(1)} words around a ${stats.meanSentenceLength.toFixed(0)}-word average).`
        : `Sentence lengths vary normally (variation ${stats.burstiness.toFixed(1)} words around a ${stats.meanSentenceLength.toFixed(0)}-word average).`,
    direction: "neutral",
    reliability: "weak",
    weight: 0,
    evidence: {
      burstiness: Number(stats.burstiness.toFixed(2)),
      meanSentenceLength: Number(stats.meanSentenceLength.toFixed(1)),
      sentences: stats.sentences,
    },
    alternative:
      "Low variation is common in generated prose, and equally common in technical documentation, translated text, legal writing and anything edited to a style guide. It is not a reliable indicator of authorship.",
    module: "text",
  });

  signals.push({
    id: "text-diversity",
    category: "content",
    title: "Vocabulary range",
    finding: `${(stats.lexicalDiversity * 100).toFixed(0)}% of words are distinct across ${stats.words} words.`,
    direction: "neutral",
    reliability: "weak",
    weight: 0,
    evidence: { lexicalDiversity: Number(stats.lexicalDiversity.toFixed(3)), words: stats.words },
    alternative:
      "Vocabulary range tracks subject matter and length far more strongly than authorship. A long technical piece will always look repetitive next to a short personal one.",
    module: "text",
  });

  if (stats.topPhrase && stats.topPhrase.count >= 4) {
    signals.push({
      id: "text-repetition",
      category: "content",
      title: "Repeated phrasing",
      finding: `The phrase "${stats.topPhrase.phrase}" appears ${stats.topPhrase.count} times.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      evidence: { phrase: stats.topPhrase.phrase, count: stats.topPhrase.count },
      alternative:
        "Repetition is normal in structured documents, reports with recurring headings, and any writing about one narrow subject.",
      module: "text",
    });
  }

  return signals;
}

/**
 * The limitation text shown whenever text was analysed. Kept beside the module
 * so the caveat can never drift away from the measurement it qualifies.
 */
export const TEXT_LIMITATIONS = [
  "Writing statistics cannot establish authorship. GigAI Verify does not classify text as AI-written on the basis of style, and no honest tool can.",
  "Published AI text detectors are unreliable. They misfire on non-native English, on technical writing, and on anything paraphrased or translated.",
  "Editing AI output, or running human text through a rewriter, changes these measurements entirely.",
];
