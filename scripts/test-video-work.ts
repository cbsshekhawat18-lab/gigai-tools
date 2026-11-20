/**
 * Engine tests for lib/video-work. Run: npx tsx scripts/test-video-work.ts
 *
 * Dependency-free (no test runner in this repo) — plain assertions with a
 * pass/fail tally and a non-zero exit so it can gate a build.
 *
 * Scope: the deterministic layer. Merge, change and conflict detection,
 * ordering, filtering, exports and the report markup are all pure functions and
 * are covered here. The model call is not — mocking it would only assert that
 * the mock returns the mock. What IS asserted about analysis is the part that
 * matters and that we control: that an uncertain finding stays visibly
 * uncertain through every export, and that malformed model output is clamped
 * rather than trusted.
 */

import {
  buildIntentMap,
  computeStats,
  emptyProject,
  formatClock,
  implementationOrder,
  type Finding,
  type Project,
  type VideoAsset,
} from "@/lib/video-work/types";
import { findOpposition, jaccard, mergeFindings, resolveConflict, similarity, supersededIds } from "@/lib/video-work/merge";
import { exportProject, selectFindings, toIntegrationPayload } from "@/lib/video-work/exports";
import { buildReportHtml } from "@/lib/video-work/report";
import { detectProvider, inspectFile, inspectUrl } from "@/lib/video-work/ingest";
import { initialStages, runPipeline, STAGE_BLUEPRINT, type Stage } from "@/lib/video-work/pipeline";
import { toolProcessingLevel } from "@/lib/privacy";
import videoToWork from "@/config/tools/video/video-to-work";
import { advertisedToolCount, getTotalToolCount } from "@/lib/registry";
import { SITE } from "@/config/constants";
import fs from "node:fs";
import { ANALYSIS_SCHEMA, FINDING_FIELDS, SYSTEM_PROMPT, promptClock } from "@/lib/video-work/contract";
import { decideProvider } from "@/lib/video-work/provider";
import {
  LOCAL_CONFIDENCE_FLOOR,
  LOCAL_MAX_FRAMES,
  RECOMMENDED_MODELS,
  parseJson,
  setupSteps,
} from "@/lib/video-work/ollama";
import { FREE_TIER_CONFIDENCE_FLOOR, mapAnalysisPayload } from "@/lib/video-work/analyze";

let pass = 0;
let fail = 0;
function check(name: string, condition: boolean, detail = ""): void {
  if (condition) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/* ── Fixtures ─────────────────────────────────────────────────────────────── */

function finding(overrides: Partial<Finding> & { id: string }): Finding {
  return {
    type: "BUG",
    title: "Untitled",
    priority: "medium",
    confidence: 80,
    area: "",
    description: "",
    observed: "",
    expected: "",
    stepsToReproduce: [],
    interpretation: "",
    acceptanceCriteria: [],
    dependencies: [],
    evidence: {
      videoId: "v1",
      timestampMs: 0,
      frameTimeMs: null,
      clientStatement: "",
    },
    status: "new",
    needsConfirmation: false,
    ...overrides,
  };
}

function video(id: string, label: string): VideoAsset {
  return {
    id,
    label,
    source: { kind: "upload", fileName: `${label}.mp4`, sizeBytes: 1000 },
    durationMs: 600_000,
    segments: [],
    frames: [],
    addedAt: "2026-08-09T00:00:00.000Z",
    analyzed: true,
  };
}

function projectWith(findings: Finding[], videos: VideoAsset[] = [video("v1", "Video 1")]): Project {
  return { ...emptyProject("Test project"), findings, videos };
}

/* ── formatClock ──────────────────────────────────────────────────────────── */

console.log("\nformatClock");
check("formats under an hour without hours", formatClock(271_000) === "4:31", formatClock(271_000));
check("formats over an hour", formatClock(3_871_000) === "1:04:31", formatClock(3_871_000));
check("clamps negatives to zero", formatClock(-5000) === "0:00");

/* ── Similarity ───────────────────────────────────────────────────────────── */

console.log("\nsimilarity");
check("jaccard of identical sets is 1", jaccard(new Set(["a", "b"]), new Set(["a", "b"])) === 1);
check("jaccard of disjoint sets is 0", jaccard(new Set(["a"]), new Set(["b"])) === 0);
check("jaccard of an empty set is 0", jaccard(new Set(), new Set(["a"])) === 0);

const checkoutA = finding({
  id: "BUG-001",
  title: "Checkout button does not respond",
  description: "Clicking checkout does nothing",
  area: "Checkout",
});
const checkoutB = finding({
  id: "BUG-002",
  title: "Checkout button unresponsive on click",
  description: "The checkout button does nothing when clicked",
  area: "Checkout",
});
const unrelated = finding({
  id: "BUG-003",
  title: "Newsletter signup shows a duplicate email error",
  description: "Signup form rejects valid addresses",
  area: "Newsletter",
});

check("similar findings score high", similarity(checkoutA, checkoutB) > 0.45, String(similarity(checkoutA, checkoutB)));
check("unrelated findings score low", similarity(checkoutA, unrelated) < 0.3, String(similarity(checkoutA, unrelated)));

/* ── Opposition detection ─────────────────────────────────────────────────── */

console.log("\nfindOpposition");

const blueButton = finding({
  id: "DESIGN-001",
  type: "DESIGN_CHANGE",
  title: "Make the CTA button blue",
  area: "Homepage",
  interpretation: "Set the primary CTA background to blue",
});
const greenButton = finding({
  id: "DESIGN-002",
  type: "DESIGN_CHANGE",
  title: "Make the CTA button green",
  area: "Homepage",
  interpretation: "Set the primary CTA background to green",
});

const colourClash = findOpposition(blueButton, greenButton);
check("detects a colour contradiction", colourClash?.group === "colour", JSON.stringify(colourClash));
check("names both sides of the contradiction", colourClash?.previous === "blue" && colourClash?.current === "green");

// "change it from blue to green" mentions both — a plan, not a contradiction.
const transition = finding({
  id: "DESIGN-003",
  type: "DESIGN_CHANGE",
  title: "Change the CTA from blue to green",
  area: "Homepage",
});
check(
  "a single sentence naming both colours is not a conflict",
  findOpposition(transition, greenButton) === null,
);
check("no opposition between unrelated findings", findOpposition(checkoutA, unrelated) === null);

const showIt = finding({ id: "D-1", type: "DESIGN_CHANGE", title: "Show the sidebar on mobile", area: "Mobile" });
const hideIt = finding({ id: "D-2", type: "DESIGN_CHANGE", title: "Hide the sidebar on mobile", area: "Mobile" });
check("detects a visibility contradiction", findOpposition(showIt, hideIt)?.group === "visibility");

/* ── Merge ────────────────────────────────────────────────────────────────── */

console.log("\nmergeFindings");

const existing = [finding({ id: "BUG-001", title: "Checkout button does not respond", area: "Checkout" })];

// The model numbers from 001 for every video; a naive merge would collide.
const incoming = [
  finding({ id: "BUG-001", title: "Login form rejects valid passwords", area: "Login" }),
  finding({ id: "BUG-002", title: "Cart total is wrong", area: "Cart", dependencies: ["BUG-001"] }),
];

const merged = mergeFindings(existing, incoming);
check("renumbers colliding ids", merged.assignedIds[0] === "BUG-002", merged.assignedIds.join(","));
check("keeps every finding", merged.findings.length === 3);
check("ids are unique after merge", new Set(merged.findings.map((f) => f.id)).size === 3);
check(
  "repoints dependencies onto the renumbered ids",
  merged.findings.find((f) => f.id === "BUG-003")?.dependencies[0] === "BUG-002",
  JSON.stringify(merged.findings.find((f) => f.id === "BUG-003")?.dependencies),
);

const repeatMerge = mergeFindings(
  [finding({ id: "BUG-001", title: "Checkout button does not respond", description: "Clicking checkout does nothing", area: "Checkout" })],
  [finding({ id: "BUG-001", title: "Checkout button does not respond", description: "Clicking checkout does nothing", area: "Checkout" })],
);
check("flags a near-identical restatement as repeated", repeatMerge.changes[0]?.kind === "repeated", repeatMerge.changes[0]?.kind);

const conflictMerge = mergeFindings([blueButton], [greenButton]);
check("flags an opposing value as contradicted", conflictMerge.changes[0]?.kind === "contradicted", conflictMerge.changes[0]?.kind);
check("explains the contradiction in words", (conflictMerge.changes[0]?.reason ?? "").includes("colour"));

const noMatch = mergeFindings([checkoutA], [unrelated]);
check("unrelated findings produce no change record", noMatch.changes.length === 0);

const changedMerge = mergeFindings(
  [finding({ id: "REQ-001", type: "REQUIREMENT", title: "Header button opens the Pricing page", area: "Header" })],
  [finding({ id: "REQ-001", type: "REQUIREMENT", title: "Header button opens the Pricing page for logged-out users only", area: "Header" })],
);
check("flags a refined requirement as changed", changedMerge.changes[0]?.kind === "changed", changedMerge.changes[0]?.kind);

/* ── Conflict resolution ──────────────────────────────────────────────────── */

console.log("\nresolveConflict");

const resolvedKeepCurrent = resolveConflict(
  conflictMerge.findings,
  conflictMerge.changes,
  0,
  "keep-current",
);
check(
  "keeping the later version rejects the earlier finding",
  resolvedKeepCurrent.findings.find((f) => f.id === conflictMerge.changes[0]!.previousId)?.status === "rejected",
);
check("records the resolution", resolvedKeepCurrent.changes[0]?.resolution === "keep-current");
check(
  "superseded ids include the rejected side",
  supersededIds(resolvedKeepCurrent.changes).has(conflictMerge.changes[0]!.previousId),
);
check(
  "keep-both supersedes nothing",
  supersededIds(resolveConflict(conflictMerge.findings, conflictMerge.changes, 0, "keep-both").changes).size === 0,
);

/* ── Ordering ─────────────────────────────────────────────────────────────── */

console.log("\nimplementationOrder");

const ordered = implementationOrder([
  finding({ id: "A", priority: "low", dependencies: ["B"] }),
  finding({ id: "B", priority: "low" }),
  finding({ id: "C", priority: "critical" }),
]);
check("dependencies come before their dependants", ordered.findIndex((f) => f.id === "B") < ordered.findIndex((f) => f.id === "A"));
check("critical work sorts first when unblocked", ordered[0]?.id === "C", ordered.map((f) => f.id).join(","));
check("every finding is placed exactly once", ordered.length === 3 && new Set(ordered.map((f) => f.id)).size === 3);

// A cycle must not hang or drop items — the model can emit one.
const cyclic = implementationOrder([
  finding({ id: "X", dependencies: ["Y"] }),
  finding({ id: "Y", dependencies: ["X"] }),
]);
check("survives a circular dependency", cyclic.length === 2, String(cyclic.length));

const missingDep = implementationOrder([finding({ id: "Z", dependencies: ["GHOST-999"] })]);
check("ignores a dependency that doesn't exist", missingDep.length === 1);

/* ── Stats and intent map ─────────────────────────────────────────────────── */

console.log("\ncomputeStats / buildIntentMap");

const statsProject = projectWith([
  finding({ id: "BUG-001", type: "BUG", priority: "critical", area: "Checkout" }),
  finding({ id: "BUG-002", type: "BUG", priority: "low", area: "Checkout", needsConfirmation: true }),
  finding({ id: "FEATURE-001", type: "FEATURE", area: "Reports", status: "approved" }),
]);
const stats = computeStats(statsProject);
check("counts by type", stats.byType.BUG === 2 && stats.byType.FEATURE === 1);
check("counts by priority", stats.byPriority.critical === 1 && stats.byPriority.low === 1);
check("counts by status", stats.byStatus.approved === 1 && stats.byStatus.new === 2);
check("counts items needing confirmation", stats.needsConfirmation === 1);
check("zero-fills untouched buckets", stats.byType.QUESTION === 0 && stats.byPriority.high === 0);

const map = buildIntentMap(statsProject.findings);
check("groups the intent map by type", map.length === 2, String(map.length));
check("groups areas inside a type", map[0]?.areas[0]?.area === "Checkout" && map[0]?.areas[0]?.findingIds.length === 2);
check("labels an empty area as General", buildIntentMap([finding({ id: "T-1" })])[0]?.areas[0]?.area === "General");

/* ── Export selection ─────────────────────────────────────────────────────── */

console.log("\nselectFindings");

const exportProjectFixture: Project = {
  ...projectWith([
    finding({ id: "BUG-001", title: "Kept" }),
    finding({ id: "BUG-002", title: "Rejected by user", status: "rejected" }),
    finding({ id: "BUG-003", title: "Lost a conflict" }),
  ]),
  changes: [
    {
      kind: "contradicted",
      previousId: "BUG-003",
      currentId: "BUG-001",
      reason: "test",
      similarity: 0.9,
      resolution: "keep-current",
    },
  ],
};

const selected = selectFindings(exportProjectFixture);
check("excludes rejected findings by default", !selected.some((f) => f.id === "BUG-002"));
check("excludes the losing side of a resolved conflict", !selected.some((f) => f.id === "BUG-003"));
check("keeps everything else", selected.some((f) => f.id === "BUG-001") && selected.length === 1);
check(
  "can include rejected findings on request",
  selectFindings(exportProjectFixture, { excludeRejected: false }).length === 3,
);
check(
  "honours an explicit id selection",
  selectFindings(exportProjectFixture, { onlyIds: ["BUG-001"] }).map((f) => f.id).join() === "BUG-001",
);

/* ── Exports carry evidence and uncertainty ───────────────────────────────── */

console.log("\nexports");

const uncertain = finding({
  id: "DESIGN-001",
  type: "DESIGN_CHANGE",
  title: "Move the CTA below the content block",
  confidence: 42,
  needsConfirmation: true,
  area: "Homepage",
  interpretation: "Reduce the CTA's dimensions and place it below the content block",
  acceptanceCriteria: ["The CTA renders below the content block at 1440px"],
  evidence: {
    videoId: "v1",
    timestampMs: 271_000,
    frameTimeMs: null,
    clientStatement: "this button looks weird, make it smaller and move it down",
  },
});
const evidenceProject = projectWith([uncertain]);

const markdown = exportProject("md", evidenceProject).body;
check("markdown quotes the client verbatim", markdown.includes("this button looks weird"));
check("markdown carries the timestamp", markdown.includes("4:31"));
check("markdown states the confidence", markdown.includes("42%"));
check("markdown flags an uncertain reading", markdown.toLowerCase().includes("needs confirmation"));
check("markdown separates the AI interpretation", markdown.includes("AI interpretation"));
check("markdown lists acceptance criteria as checkboxes", markdown.includes("- [ ] The CTA renders below"));

const handoff = exportProject("handoff", evidenceProject).body;
check("handoff surfaces unconfirmed items up front", handoff.includes("Resolve before building"));
check("handoff includes an implementation order", handoff.includes("Implementation order"));

const text = exportProject("txt", evidenceProject).body;
check("plain text marks uncertainty too", text.includes("NEEDS CONFIRMATION"));

const payload = toIntegrationPayload(evidenceProject, evidenceProject.findings);
check("json is versioned", payload.schemaVersion === 1);
check("json keeps the client statement separate", Boolean(payload.findings[0]?.evidence.clientStatement.includes("looks weird")));
check("json keeps the interpretation separate", Boolean(payload.findings[0]?.aiInterpretation.includes("Reduce the CTA")));
check("json carries the confidence", payload.findings[0]?.aiConfidence === 42);
check("json carries the confirmation flag", payload.findings[0]?.needsConfirmation === true);
check("json formats the timestamp for humans", payload.findings[0]?.evidence.timestamp === "4:31");

const jsonBody = exportProject("json", evidenceProject).body;
check("json export parses", (() => { try { JSON.parse(jsonBody); return true; } catch { return false; } })());

check("export filenames are slugged", exportProject("md", evidenceProject).name === "test-project.md", exportProject("md", evidenceProject).name);

/* ── Report markup ────────────────────────────────────────────────────────── */

console.log("\nbuildReportHtml");

const html = buildReportHtml(evidenceProject);
check("report includes the finding", html.includes("Move the CTA below the content block"));
check("report warns about uncertain readings", html.includes("Needs confirmation"));
check("report quotes the client", html.includes("this button looks weird"));
check("report avoids oklch colours", !html.includes("oklch"));

const injection = projectWith([
  finding({
    id: "BUG-001",
    title: `<script>alert("xss")</script>`,
    evidence: { videoId: "v1", timestampMs: 0, frameTimeMs: null, clientStatement: `" onerror="alert(1)` },
  }),
]);
const escaped = buildReportHtml(injection);
check("report escapes angle brackets from model output", !escaped.includes("<script>alert"));
check("report escapes quotes from model output", !escaped.includes(`" onerror="alert(1)`));

/* ── URL ingestion ────────────────────────────────────────────────────────── */

console.log("\ninspectUrl / detectProvider");

check("recognises Loom", detectProvider(new URL("https://www.loom.com/share/abc123")) === "loom");
check("recognises YouTube", detectProvider(new URL("https://youtu.be/abc123")) === "youtube");
check("recognises youtube.com/watch", detectProvider(new URL("https://www.youtube.com/watch?v=abc")) === "youtube");
check("recognises Vimeo", detectProvider(new URL("https://vimeo.com/123456")) === "vimeo");
check("recognises a direct media link", detectProvider(new URL("https://cdn.example.com/a/clip.mp4")) === "direct");
check("recognises a direct link with a query string", detectProvider(new URL("https://cdn.example.com/clip.mp4?token=1")) === "direct");
check("treats an unknown host as unknown", detectProvider(new URL("https://example.com/page")) === "unknown");
check("does not mistake a lookalike host for Loom", detectProvider(new URL("https://notloom.com/share/x")) === "unknown");

check("accepts a bare host with no scheme", inspectUrl("loom.com/share/abc").valid);
check("rejects an empty paste", !inspectUrl("   ").valid);
check("rejects a non-http scheme", !inspectUrl("ftp://example.com/a.mp4").valid);
check("rejects javascript: as a scheme", !inspectUrl("javascript:alert(1)").valid);
check("reports the provider label", inspectUrl("https://www.loom.com/share/x").provider.label === "Loom");
// The server's parser requires a scheme, so the bare host a user types must be
// normalised before it is sent — otherwise a valid paste 400s server-side.
check(
  "normalises a bare host to an absolute https URL",
  inspectUrl("loom.com/share/abc").normalized === "https://loom.com/share/abc",
  inspectUrl("loom.com/share/abc").normalized,
);
check(
  "leaves an already-absolute URL intact",
  inspectUrl("https://vimeo.com/123").normalized === "https://vimeo.com/123",
);
check("gives no normalised form for a rejected link", inspectUrl("ftp://x/a.mp4").normalized === "");

/* ── File validation ──────────────────────────────────────────────────────── */

console.log("\ninspectFile");

const mediaFile = { name: "feedback.mp4", type: "video/mp4", size: 5_000_000 } as File;
check("accepts a normal video", inspectFile(mediaFile).ok);
check("accepts audio-only recordings", inspectFile({ name: "call.m4a", type: "audio/mp4", size: 1000 } as File).ok);
check("accepts by extension when the mime type is missing", inspectFile({ name: "clip.mkv", type: "", size: 1000 } as File).ok);
check("rejects a non-media file", !inspectFile({ name: "notes.pdf", type: "application/pdf", size: 1000 } as File).ok);
check("rejects an empty file", !inspectFile({ name: "empty.mp4", type: "video/mp4", size: 0 } as File).ok);
check(
  "warns about a very large file without blocking it",
  (() => {
    const big = inspectFile({ name: "long.mp4", type: "video/mp4", size: 900 * 1024 * 1024 } as File);
    return big.ok && Boolean(big.warning);
  })(),
);

/* ── Pipeline shape ───────────────────────────────────────────────────────── */

console.log("\npipeline");

/** Capture the first stage snapshot the UI would render for a given provider. */
async function stagesFor(provider: "local" | "server" | "none") {
  let first: Stage[] = [];
  await runPipeline({
    video: { ...video("v1", "x"), durationMs: 0 },  // duration 0 fails fast at stage 1
    objectUrl: "blob:none",
    model: "Xenova/whisper-base",
    runOcr: false,
    provider,
    onStage: (s) => { if (first.length === 0) first = s; },
  }).catch(() => { /* expected: it aborts at "Read the recording" */ });
  return first;
}

const stages = initialStages();
check("every blueprint stage is present", stages.length === STAGE_BLUEPRINT.length);
check("stages start pending", stages.every((s) => s.state === "pending" && s.progress === 0));
check("each stage declares where it runs", stages.every((s) => s.where === "device" || s.where === "server"));
check(
  "only the analysis step can run on the server",
  stages.filter((s) => s.where === "server").map((s) => s.id).join() === "analyze",
);

/**
 * Found by a real browser run: the blueprint's "server" placeholder was shown
 * for the whole transcription on a LOCAL-ONLY setup, telling the user their
 * client's recording was going to a server it would never reach. The label must
 * be correct from the first render, not corrected when the stage activates.
 */
async function checkStageProvenance(): Promise<void> {
  const localStages = await stagesFor("local");
  check(
    "a local run never claims the server, even before it starts",
    localStages.every((s) => s.where === "device"),
    localStages.filter((s) => s.where === "server").map((s) => s.id).join(),
  );

  const serverStages = await stagesFor("server");
  check(
    "a server run does say so up front",
    serverStages.find((s) => s.id === "analyze")?.where === "server",
  );

  const noneStages = await stagesFor("none");
  check("with no provider it claims neither location", noneStages.every((s) => s.where === "device"));
  check(
    "with no provider it says the model isn't set up",
    (noneStages.find((s) => s.id === "analyze")?.detail ?? "").includes("No analysis model is set up"),
  );
}

/* ── Analysis contract ────────────────────────────────────────────────────── */

console.log("\ncontract");

const findingSchema = ANALYSIS_SCHEMA.properties.findings.items;
check(
  "schema requires exactly the documented finding fields",
  JSON.stringify([...findingSchema.required].sort()) === JSON.stringify([...FINDING_FIELDS].sort()),
);
check(
  "every required field has a property definition",
  findingSchema.required.every((f) => f in findingSchema.properties),
);
check("finding object is closed", findingSchema.additionalProperties === false);
check("root object is closed", ANALYSIS_SCHEMA.additionalProperties === false);
// Structured-output implementations reject these; bounds live in descriptions.
check(
  "no unsupported constraint keywords",
  !/"(minimum|maximum|minLength|maxLength|multipleOf|pattern)"/.test(JSON.stringify(ANALYSIS_SCHEMA)),
);
check("prompt keeps the uncertainty rule", SYSTEM_PROMPT.includes("THE RULE THAT MATTERS MOST"));
check(
  "prompt tells the model to score low when guessing",
  SYSTEM_PROMPT.includes("below 50 when you are genuinely guessing"),
);
check("promptClock pads to HH:MM:SS", promptClock(271_000) === "00:04:31", promptClock(271_000));

/* ── Provider selection ───────────────────────────────────────────────────── */

console.log("\ndecideProvider");

check("auto prefers the local model", decideProvider("auto", true, true) === "local");
check("auto falls back to the server", decideProvider("auto", false, true) === "server");
check("auto reports none when neither is available", decideProvider("auto", false, false) === "none");
// The important one: an explicit local choice must NEVER silently ship the
// client's transcript to a server the user opted out of.
check(
  "an explicit local choice never falls back to the server",
  decideProvider("local", false, true) === "none",
);
check("an explicit server choice never falls back to local", decideProvider("server", true, false) === "none");
check("explicit choices are honoured when available", decideProvider("local", true, true) === "local");

/* ── Local provider ───────────────────────────────────────────────────────── */

console.log("\nollama");

check("recommends a vision model by default", RECOMMENDED_MODELS[0]?.name === "qwen2.5vl:7b");
check("local confidence bar is stricter than the server's", LOCAL_CONFIDENCE_FLOOR > 50);
check("local frame budget is smaller than the server's", LOCAL_MAX_FRAMES < 18);

const goodJson = '{"findings":[],"summary":{"overview":"x"}}';
check("parses clean JSON", parseJson(goodJson) !== null);
check(
  "parses JSON wrapped in a fenced block",
  parseJson("Here you go:\n```json\n" + goodJson + "\n```") !== null,
);
check("parses JSON embedded in prose", parseJson("Sure! " + goodJson + " Hope that helps.") !== null);
check("rejects prose with no JSON", parseJson("I could not analyse that video.") === null);
check("rejects JSON without a findings array", parseJson('{"summary":{}}') === null);
check("rejects malformed JSON", parseJson('{"findings":[},]') === null);

const setup = setupSteps("https://gigai.tools");
check("setup names the origin so CORS actually works", setup.some((s) => s.command.includes("OLLAMA_ORIGINS=https://gigai.tools")));
check("setup includes a model pull", setup.some((s) => s.command.includes("ollama pull")));

/* ── Provider-agnostic mapping ────────────────────────────────────────────── */

console.log("\nmapAnalysisPayload");

const rawVideo = video("v1", "Video 1");
const rawPayload = {
  findings: [
    {
      id: "BUG-001",
      type: "BUG",
      title: "Checkout fails",
      priority: "high",
      confidence: 65,
      area: "Checkout",
      description: "d",
      observed: "o",
      expected: "e",
      steps_to_reproduce: ["one"],
      client_statement: "nothing happens",
      interpretation: "i",
      timestamp_ms: 1000,
      frame_time_ms: -1,
      acceptance_criteria: ["c"],
      dependencies: [],
      needs_confirmation: false,
    },
  ],
};

const serverMapped = mapAnalysisPayload(rawPayload, rawVideo);
const localMapped = mapAnalysisPayload(rawPayload, rawVideo, {
  confidenceFloor: LOCAL_CONFIDENCE_FLOOR,
});
check("65% is settled on the server floor", serverMapped.findings[0]?.needsConfirmation === false);
check(
  "the same 65% needs confirmation on a local model",
  localMapped.findings[0]?.needsConfirmation === true,
);
check("the model's own score is never altered", localMapped.findings[0]?.confidence === 65);

// A real Groq run returned 100/90/100/100 — including 90% + needs_confirmation
// false for the textbook ambiguous request. Its own flag can't be trusted, so
// the free tier requires near-certainty before anything counts as settled.
const freeTier = mapAnalysisPayload(rawPayload, rawVideo, {
  confidenceFloor: FREE_TIER_CONFIDENCE_FLOOR,
});
check("free tier flags a 65% finding", freeTier.findings[0]?.needsConfirmation === true);
const overconfident = mapAnalysisPayload(
  { findings: [{ ...rawPayload.findings[0]!, confidence: 90, needs_confirmation: false }] },
  rawVideo,
  { confidenceFloor: FREE_TIER_CONFIDENCE_FLOOR },
);
check(
  "free tier flags even a 90% finding the model called settled",
  overconfident.findings[0]?.needsConfirmation === true,
);
check("the bar is stricter than the local one", FREE_TIER_CONFIDENCE_FLOOR > LOCAL_CONFIDENCE_FLOOR);

/* ── Derived summary ──────────────────────────────────────────────────────── */

console.log("\nfillSummary");

// Groq returned every summary field blank on a real run; the Overview tab would
// have been empty despite four solid findings.
const blankSummary = mapAnalysisPayload(
  {
    findings: [
      { ...rawPayload.findings[0]!, id: "BUG-001", type: "BUG", title: "Checkout fails" },
      { ...rawPayload.findings[0]!, id: "FEATURE-001", type: "FEATURE", title: "Add Apple Pay", confidence: 30 },
    ],
    summary: { overview: "", what_client_wants: [], what_is_broken: [], risks: [], recommended_order: [] },
  },
  rawVideo,
);
check("derives an overview when the model omits one", blankSummary.summary.overview.length > 0);
check("says the summary was compiled, not authored", blankSummary.summary.overview.includes("compiled from the findings"));
check("lists bugs under what is broken", blankSummary.summary.whatIsBroken.includes("Checkout fails"));
check("lists requests under what the client wants", blankSummary.summary.whatClientWants.includes("Add Apple Pay"));
check("surfaces low-confidence items as risks", blankSummary.summary.risks.some((r) => r.includes("FEATURE-001")));
check("derives an implementation order", blankSummary.summary.recommendedOrder.length === 2);
// A model-authored summary must never be overwritten.
const authored = mapAnalysisPayload(
  { ...rawPayload, summary: { overview: "Real overview from the model.", what_client_wants: ["x"], what_is_broken: [], risks: [], recommended_order: [] } },
  rawVideo,
);
check("never overwrites a summary the model did provide", authored.summary.overview === "Real overview from the model.");
check("keeps model-provided lists intact", authored.summary.whatClientWants.join() === "x");

// A small local model sends wrong types often enough that trusting them crashes.
const sloppy = mapAnalysisPayload(
  {
    findings: [
      {
        id: 42,
        type: null,
        title: undefined,
        priority: "URGENT",
        confidence: "not a number",
        area: null,
        description: 7,
        observed: null,
        expected: null,
        steps_to_reproduce: "one, two",
        client_statement: null,
        interpretation: null,
        timestamp_ms: "abc",
        frame_time_ms: null,
        acceptance_criteria: null,
        dependencies: null,
        needs_confirmation: "yes",
      },
    ],
  } as never,
  rawVideo,
);
const s0 = sloppy.findings[0];
check("survives wrong types without throwing", s0 !== undefined);
check("coerces a numeric id to a string", typeof s0?.id === "string");
check("falls back to a valid type", s0?.type === "TASK");
check("falls back to a valid priority", s0?.priority === "medium");
check("clamps an unparseable confidence to 0", s0?.confidence === 0);
check("turns a non-array into an empty list", Array.isArray(s0?.stepsToReproduce) && s0.stepsToReproduce.length === 0);
check("nulls become empty strings", s0?.evidence.clientStatement === "");
check("an unparseable timestamp becomes 0", s0?.evidence.timestampMs === 0);
check("a 0-confidence finding is flagged for confirmation", s0?.needsConfirmation === true);
// Behaviour deliberately changed when fillSummary landed: a missing summary is
// now DERIVED from the findings rather than left blank, so the Overview tab is
// never empty when there is real work behind it. The 0-confidence finding above
// is flagged for confirmation, so it must appear as a risk.
check("a missing summary is derived, not left blank", sloppy.summary.overview.length > 0);
check("the derived risks name the unconfirmed finding", sloppy.summary.risks.length === 1);
check(
  "derived lists stay empty when there is nothing to derive",
  mapAnalysisPayload({ findings: [] }, rawVideo).summary.overview === "",
);

/* ── The page's privacy promise must match how the tool actually runs ─────── */
/*
 * This exists because the claim DID drift once. The page was written when the
 * hosted analysis tier was switched off, so it carried the green "100% browser
 * processing — never uploaded" badge. Turning the server tier on made that
 * false for every visitor without Ollama, and nothing failed. These assertions
 * are the thing that fails next time.
 */
check(
  "the tool is classified hybrid, not fully-browser",
  toolProcessingLevel(videoToWork) === "hybrid",
);
{
  const prose = [
    videoToWork.longDescription,
    videoToWork.security ?? "",
    ...(videoToWork.features ?? []).map((f) => `${f.title} ${f.description}`),
    ...(videoToWork.benefits ?? []).map((b) => `${b.title} ${b.description}`),
    ...(videoToWork.faq ?? []).map((f) => `${f.question} ${f.answer}`),
  ].join(" ").toLowerCase();

  // Absolutes that are simply untrue on the server path. Each is phrased the
  // way the old copy phrased it, so a rewrite that reintroduces one is caught.
  for (const claim of [
    "nothing leaves your computer",
    "nothing about it leaves your machine",
    "never reaches a server",
    "never reach any server",
  ]) {
    check(`the copy no longer claims "${claim}"`, !prose.includes(claim));
  }

  check(
    "the copy states that the transcript and screenshots can be sent",
    prose.includes("transcript") && prose.includes("discarded"),
  );
  check(
    "the copy still promises the recording itself is never uploaded",
    prose.includes("never uploaded"),
  );
}

/* ── The advertised tool count must agree with the registry ───────────────── */
/*
 * This exists because the site simultaneously claimed 240+, 248, 249, 250+ and
 * 260 in five different files. A number in marketing copy has no way to notice
 * it has gone stale, so the test notices for it.
 */
{
  const advertised = advertisedToolCount();
  check(`advertised count "${advertised}" is derived from ${getTotalToolCount()} live tools`,
    /^\d+\+$/.test(advertised));

  // Every file that quotes a tool count must quote the current one.
  const QUOTING_FILES = [
    "config/constants.ts",
    "config/seo.ts",
    "app/about/page.tsx",
    "components/search/search-bar.tsx",
  ];
  const stale: string[] = [];
  for (const file of QUOTING_FILES) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/(\d{3})\+ (?:free )?(?:GigAI )?tools/g)) {
      if (`${m[1]}+` !== advertised) stale.push(`${file}: says ${m[1]}+, should be ${advertised}`);
    }
  }
  check(`no file quotes a stale tool count${stale.length ? ` — ${stale.join("; ")}` : ""}`, stale.length === 0);
  check("the site description quotes the current count", SITE.description.includes(advertised));
}

/* ── Tally ────────────────────────────────────────────────────────────────── */


void checkStageProvenance().then(() => {
  console.log(`\n${pass} passed, ${fail} failed\n`);
  if (fail > 0) process.exit(1);
});
