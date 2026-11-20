import { describe, it, expect } from "vitest";

import { validateVerbatim, buildTranscriptIndex } from "../verbatim";
import { mergeDuplicates, parseGrouping, mergeGroup } from "../dedupe";
import { computeConfidence } from "../confidence";
import { chunkSegments } from "../extract";
import { extractTickets } from "../run";
import { assignSpeakerRoles } from "../speakers";
import type { TranscriptSegment, ValidatedCandidate, ChatFn } from "../types";

/* ── fixture: realistic client feedback, 30 segments, two speakers ────────── */

const CLIENT = "SPEAKER_01";
const INTERNAL = "SPEAKER_00";

const LINES: Array<[string, string]> = [
  [INTERNAL, "okay we're recording, thanks for making time today"],
  [CLIENT, "yeah no worries, so I went through the new build over the weekend"],
  [CLIENT, "so the thing is when I open it on my phone the buy button just isn't there"],
  [INTERNAL, "right, on mobile specifically"],
  [CLIENT, "yeah on my iPhone, um, it's like the button is below the fold or invisible or something"],
  [INTERNAL, "got it, we can look at the viewport handling there"],
  [CLIENT, "and the checkout page, uh, actually no wait, not the checkout, the cart page"],
  [CLIENT, "the cart page takes like ten seconds to load which is honestly way too slow"],
  [INTERNAL, "the cart is doing a full refresh on every quantity change right now"],
  [CLIENT, "also I'd like a way to export my orders as a spreadsheet"],
  [INTERNAL, "yeah we can do that"],
  [CLIENT, "it should just be a button on the orders page, nothing fancy"],
  [CLIENT, "oh and the logo, can you make the logo a bit bigger in the header"],
  [INTERNAL, "sure, small tweak"],
  [CLIENT, "one more thing about that buy button, it's really urgent because we launch Friday"],
  [CLIENT, "like I said the buy button on mobile is just not showing up at all"],
  [INTERNAL, "understood, that one's top of the list"],
  [CLIENT, "why does the search show discontinued products, is that intentional"],
  [INTERNAL, "that's a data flag we can filter out"],
  [CLIENT, "this section on the homepage feels off somehow, I don't know, something about it"],
  [INTERNAL, "we'll take a look at the spacing there"],
  [CLIENT, "also we should probably talk about the trade show booth design at some point"],
  [INTERNAL, "that's more of a marketing thing but noted"],
  [CLIENT, "the password reset email never arrives when I use my work address"],
  [INTERNAL, "interesting, might be the SPF record"],
  [CLIENT, "don't worry about the footer links I mentioned last time, those are fine now"],
  [INTERNAL, "great, so mobile button, cart speed, export, logo, search, reset emails"],
  [CLIENT, "yeah that's the list, the button one is the big one obviously"],
  [INTERNAL, "we'll send a summary over tomorrow"],
  [CLIENT, "perfect, thanks, talk soon"],
];

const FIXTURE: TranscriptSegment[] = LINES.map(([speakerId, text], i) => ({
  id: `seg_${i}`,
  startSec: i * 8,
  endSec: i * 8 + 7,
  text,
  speakerId,
}));

const INDEX = buildTranscriptIndex(FIXTURE);

/* ── the spec's test table ────────────────────────────────────────────────── */

describe("validateVerbatim", () => {
  it("accepts an exact transcript span", () => {
    const r = validateVerbatim(
      "the buy button just isn't there",
      INDEX,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.matchQuality).toBe("exact");
      expect(r.quote).toBe("the buy button just isn't there");
      expect(r.segmentIds).toContain("seg_2");
    }
  });

  it("accepts a grammar-fixed quote and returns the RAW text", () => {
    // Model "cleaned up": dropped the filler and fixed casing/punctuation.
    const r = validateVerbatim(
      "The cart page takes, like, ten seconds to load - which is honestly way too slow!",
      INDEX,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(["normalized", "snapped"]).toContain(r.matchQuality);
      // Raw transcript text, not the model's version.
      expect(r.quote).toBe(
        "the cart page takes like ten seconds to load which is honestly way too slow",
      );
    }
  });

  it("accepts an expanded contraction as normalized", () => {
    const r = validateVerbatim(
      "the buy button just is not there",
      INDEX,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.matchQuality).toBe("normalized");
      expect(r.quote).toContain("isn't");
    }
  });

  it("rejects two non-contiguous sentences stitched together", () => {
    const r = validateVerbatim(
      "the buy button just isn't there and the password reset email never arrives",
      INDEX,
    );
    expect(r).toEqual({ ok: false, reason: "no-verbatim-match" });
  });

  it("rejects a plausible quote that was never said", () => {
    const r = validateVerbatim(
      "the checkout flow crashes whenever I apply a discount code to my order",
      INDEX,
    );
    expect(r).toEqual({ ok: false, reason: "no-verbatim-match" });
  });

  it("rejects a 3-word quote as too-short", () => {
    expect(validateVerbatim("buy button gone", INDEX)).toEqual({
      ok: false,
      reason: "too-short",
    });
  });

  it("rejects empty and whitespace-only quotes", () => {
    expect(validateVerbatim("   ", INDEX)).toEqual({ ok: false, reason: "empty-quote" });
  });

  it("maps a quote spanning two segments to both, times spanning both", () => {
    const r = validateVerbatim(
      "actually no wait, not the checkout, the cart page the cart page takes like ten seconds",
      INDEX,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.segmentIds).toEqual(["seg_6", "seg_7"]);
      expect(r.startSec).toBe(FIXTURE[6]!.startSec);
      expect(r.endSec).toBe(FIXTURE[7]!.endSec);
    }
  });

  it("survives a 90-minute transcript with 200 candidates in under 2 seconds", () => {
    const big: TranscriptSegment[] = [];
    const vocab =
      "the page loads slowly and the button does not respond when I tap it on my phone please have a look".split(
        " ",
      );
    for (let i = 0; i < 1000; i += 1) {
      const words: string[] = [];
      for (let w = 0; w < 14; w += 1) words.push(vocab[(i * 7 + w * 3) % vocab.length]!);
      big.push({
        id: `b${i}`,
        startSec: i * 5.4,
        endSec: i * 5.4 + 5,
        text: words.join(" "),
        speakerId: i % 3 === 0 ? INTERNAL : CLIENT,
      });
    }
    const bigIndex = buildTranscriptIndex(big);
    const started = performance.now();
    for (let c = 0; c < 200; c += 1) {
      const seg = big[(c * 5) % big.length]!;
      const claimed = c % 2 === 0 ? seg.text : seg.text.replace("does not", "doesn't") + "!";
      const r = validateVerbatim(claimed, bigIndex);
      expect(r.ok).toBe(true);
    }
    expect(performance.now() - started).toBeLessThan(2000);
  });
});

/* ── speaker attribution is enforced in code, not trusted to the prompt ───── */

describe("extractTickets speaker enforcement", () => {
  const speakers = assignSpeakerRoles(FIXTURE);

  it("heuristic pre-selects the request-dense speaker as client", () => {
    expect(speakers.find((s) => s.id === CLIENT)?.role).toBe("client");
    expect(speakers.find((s) => s.id === INTERNAL)?.role).toBe("internal");
  });

  it("drops a candidate whose matched span belongs to an internal speaker", async () => {
    const chat: ChatFn = async (system) => {
      if (system.includes("Group items")) return "[]";
      return JSON.stringify([
        {
          title: "Filter discontinued products from search",
          quote: "why does the search show discontinued products, is that intentional",
          segmentIds: ["seg_17"],
          type: "bug",
          priority: null,
          prioritySignal: null,
          confidence: 0.9,
        },
        {
          // The model mis-attributes an INTERNAL line as a client request.
          title: "Do a full refresh on quantity change",
          quote: "the cart is doing a full refresh on every quantity change right now",
          segmentIds: ["seg_8"],
          type: "bug",
          priority: null,
          prioritySignal: null,
          confidence: 0.9,
        },
      ]);
    };
    const result = await extractTickets(FIXTURE, speakers, { chat });
    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0]!.title).toBe("Filter discontinued products from search");
    expect(result.droppedCandidates).toContainEqual({
      title: "Do a full refresh on quantity change",
      claimedQuote: "the cart is doing a full refresh on every quantity change right now",
      reason: "internal-speaker",
    });
    expect(result.stats.droppedForSpeaker).toBe(1);
  });

  it("merges a repeated complaint into one ticket with multiple occurrences", async () => {
    const chat: ChatFn = async (system) => {
      if (system.includes("Group items")) return '[["c1","c2"]]';
      // Return the same complaint twice only for the window containing seg_2;
      // chunking makes one window here, so one reply carries both mentions.
      return JSON.stringify([
        {
          title: "Fix invisible buy button on mobile",
          quote: "the buy button just isn't there",
          segmentIds: ["seg_2"],
          type: "bug",
          priority: "high",
          prioritySignal: "it's really urgent because we launch Friday",
          confidence: 0.95,
        },
        {
          title: "Buy button missing on mobile",
          quote: "the buy button on mobile is just not showing up at all",
          segmentIds: ["seg_15"],
          type: "bug",
          priority: null,
          prioritySignal: null,
          confidence: 0.9,
        },
      ]);
    };
    const result = await extractTickets(FIXTURE, assignSpeakerRoles(FIXTURE), { chat });
    expect(result.tickets).toHaveLength(1);
    const t = result.tickets[0]!;
    expect(t.occurrences).toHaveLength(2);
    expect(t.occurrences[0]!.startSec).toBeLessThan(t.occurrences[1]!.startSec);
    expect(t.priority).toBe("high");
    expect(t.prioritySignal).toContain("urgent");
    expect(result.stats.mergedByDedupe).toBe(1);
  });
});

/* ── dedupe grouping validation ───────────────────────────────────────────── */

function candidate(id: string, over: Partial<ValidatedCandidate> = {}): ValidatedCandidate {
  return {
    id,
    title: `Ticket ${id}`,
    type: "bug",
    quote: "the buy button just is not there on my phone",
    startSec: 10,
    endSec: 17,
    segmentIds: ["seg_2"],
    matchQuality: "exact",
    speakerId: CLIENT,
    priority: null,
    prioritySignal: null,
    modelConfidence: 0.8,
    ...over,
  };
}

describe("mergeDuplicates grouping validation", () => {
  it("rejects a grouping that misses an ID", () => {
    expect(parseGrouping('[["c1"]]', ["c1", "c2"])).toBeNull();
  });

  it("rejects a grouping that duplicates an ID", () => {
    expect(parseGrouping('[["c1","c2"],["c2"]]', ["c1", "c2"])).toBeNull();
  });

  it("rejects a grouping that invents an ID", () => {
    expect(parseGrouping('[["c1"],["c9"]]', ["c1", "c2"])).toBeNull();
  });

  it("falls back to no merging on a malformed grouping - no tickets lost", async () => {
    const chat: ChatFn = async () => '[["c1"],["c1"],["c3"]]';
    const { merged, fellBack, mergedByDedupe } = await mergeDuplicates(
      [candidate("c1"), candidate("c2", { startSec: 120 }), candidate("c3", { startSec: 240 })],
      chat,
    );
    expect(fellBack).toBe(true);
    expect(merged).toHaveLength(3);
    expect(mergedByDedupe).toBe(0);
  });

  it("drops >80% time-overlapped occurrences (window duplicates) when merging", () => {
    const draft = mergeGroup([
      candidate("c1", { startSec: 10, endSec: 20 }),
      candidate("c2", { startSec: 11, endSec: 20 }),
      candidate("c3", { startSec: 300, endSec: 310 }),
    ]);
    expect(draft.occurrences).toHaveLength(2);
  });
});

/* ── confidence structure ─────────────────────────────────────────────────── */

describe("computeConfidence", () => {
  it("caps unknown speakers into needs-review", () => {
    const { confidence, needsReview } = computeConfidence({
      modelConfidence: 1,
      matchQuality: "exact",
      speakerRole: "unknown",
      occurrenceCount: 1,
      shortestQuoteWords: 12,
    });
    expect(confidence).toBeCloseTo(0.6);
    expect(needsReview).toBe(true);
  });

  it("boosts repeated, exact, client-attributed requests", () => {
    const { confidence, needsReview } = computeConfidence({
      modelConfidence: 0.9,
      matchQuality: "exact",
      speakerRole: "client",
      occurrenceCount: 2,
      shortestQuoteWords: 12,
    });
    expect(confidence).toBeGreaterThan(0.9);
    expect(needsReview).toBe(false);
  });
});

/* ── chunking invariants ──────────────────────────────────────────────────── */

describe("chunkSegments", () => {
  it("never splits a segment and overlaps windows by ~30s", () => {
    const segs: TranscriptSegment[] = [];
    for (let i = 0; i < 200; i += 1) {
      segs.push({
        id: `s${i}`,
        startSec: i * 10,
        endSec: i * 10 + 9,
        text: `line ${i}`,
        speakerId: CLIENT,
      });
    }
    const windows = chunkSegments(segs);
    expect(windows.length).toBeGreaterThan(1);
    const seen = new Set<string>();
    for (const w of windows) for (const s of w) seen.add(s.id);
    expect(seen.size).toBe(segs.length);
    for (let i = 1; i < windows.length; i += 1) {
      const prevEnd = windows[i - 1]!.at(-1)!.startSec;
      const nextStart = windows[i]![0]!.startSec;
      expect(nextStart).toBeLessThanOrEqual(prevEnd);
    }
  });
});
