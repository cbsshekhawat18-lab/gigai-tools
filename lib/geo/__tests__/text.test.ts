import { describe, expect, it } from "vitest";

import {
  countFacts,
  factDensity,
  containmentIssues,
  isQuotable,
  isQuestionHeading,
  judgeOpening,
  quotability,
  splitSentences,
} from "../text";

/**
 * The scoring heuristics. Every one of these is printed as a formula on the
 * tool page, so the tests double as the specification: if a heuristic changes,
 * the stated formula must change with it.
 */

describe("splitSentences", () => {
  it("splits on terminal punctuation", () => {
    expect(splitSentences("One thing. Two things! Three?")).toHaveLength(3);
  });

  it("does not split on common abbreviations", () => {
    const s = splitSentences("Use WebP, e.g. for photos. Then ship it.");
    expect(s).toHaveLength(2);
  });

  it("returns an empty array for empty input", () => {
    expect(splitSentences("   ")).toEqual([]);
  });
});

describe("fact detection", () => {
  it("counts percentages, currency, years and measured units", () => {
    const { count } = countFacts("It cut size 34% in 2024, saving $12 per 500 KB.");
    expect(count).toBeGreaterThanOrEqual(4);
  });

  it("ignores bare single digits used as list markers", () => {
    expect(countFacts("Step 1 then step 2 then step 3").count).toBe(0);
  });

  it("computes density per 100 words", () => {
    const d = factDensity("WebP is 30% smaller than JPEG at the same quality level here.");
    expect(d.words).toBe(12);
    expect(d.per100Words).toBeGreaterThan(0);
  });
});

describe("self-containment", () => {
  it("flags a pronoun opener with no antecedent", () => {
    const issues = containmentIssues("It compresses images well.");
    expect(issues.some((i) => i.kind === "pronoun-open")).toBe(true);
  });

  it("flags back-references to absent text", () => {
    const issues = containmentIssues("WebP compresses well, as mentioned above.");
    expect(issues.some((i) => i.kind === "back-reference")).toBe(true);
    expect(issues.find((i) => i.kind === "back-reference")?.evidence).toContain("as mentioned above");
  });

  it("flags continuation openers", () => {
    expect(containmentIssues("However, it fails on old browsers.").length).toBeGreaterThan(0);
  });

  it("passes a self-contained sentence", () => {
    expect(containmentIssues("WebP compresses photographs 30% smaller than JPEG.")).toEqual([]);
  });
});

describe("quotability", () => {
  it("accepts a complete standalone claim of 8-40 words", () => {
    expect(isQuotable("WebP compresses photographs roughly 30% smaller than JPEG at equivalent visual quality.")).toBe(true);
  });

  it("rejects sentences that are too short to be a claim", () => {
    expect(isQuotable("It is smaller.")).toBe(false);
  });

  it("rejects questions", () => {
    expect(isQuotable("Is WebP actually smaller than JPEG for most photographs you publish online?")).toBe(false);
  });

  it("rejects context-dependent sentences", () => {
    expect(isQuotable("It is roughly 30% smaller than the alternative format we discussed before.")).toBe(false);
  });

  it("reports a ratio over a passage", () => {
    const q = quotability(
      "WebP compresses photographs roughly 30% smaller than JPEG at equivalent quality. It is nice.",
    );
    expect(q.total).toBe(2);
    expect(q.quotable).toBe(1);
    expect(q.ratio).toBe(0.5);
  });
});

describe("question headings", () => {
  it("accepts question marks and interrogative openers", () => {
    expect(isQuestionHeading("How do I compress a PDF?")).toBe(true);
    expect(isQuestionHeading("What is WebP")).toBe(true);
  });

  it("rejects label-style headings", () => {
    expect(isQuestionHeading("Compression results")).toBe(false);
  });
});

describe("judgeOpening", () => {
  it("passes a direct answer under the limit", () => {
    const v = judgeOpening("WebP compresses photographs 30% smaller than JPEG at equivalent quality.");
    expect(v.pass).toBe(true);
    expect(v.directLength).toBe(true);
  });

  it("fails a throat-clearing opener", () => {
    const v = judgeOpening("In this article we'll explore image formats and what they mean for you.");
    expect(v.fluffOpener).toBe(true);
    expect(v.pass).toBe(false);
  });

  it("fails an opening that depends on missing context", () => {
    const v = judgeOpening("As mentioned above, it compresses well.");
    expect(v.selfContained).toBe(false);
    expect(v.pass).toBe(false);
  });

  it("fails an answer buried past the word limit", () => {
    const long = `${"word ".repeat(60)}and finally the answer arrives here at the end.`;
    expect(judgeOpening(long).directLength).toBe(false);
  });

  it("passes when the first sentence answers, even if more sentences follow", () => {
    // Regression: summing two sentences unconditionally failed pages that DID
    // answer inside the limit and then kept writing.
    const v = judgeOpening(
      "WebP compresses photographs 30% smaller than JPEG at equivalent visual quality. It also supports transparency and animation, replacing both PNG and GIF in one modern format for the web.",
    );
    expect(v.words).toBeLessThanOrEqual(40);
    expect(v.pass).toBe(true);
  });

  it("reads into a second sentence when the first is too short to be an answer", () => {
    const v = judgeOpening("Yes. Compressing a scanned PDF typically reduces it by 80 to 95 percent.");
    expect(v.words).toBeGreaterThan(1);
  });
});
