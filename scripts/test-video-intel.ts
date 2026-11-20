/**
 * Engine tests for lib/video-intel. Run: npx tsx scripts/test-video-intel.ts
 *
 * Deliberately dependency-free (no test runner in this repo) — plain assertions
 * with a pass/fail tally and a non-zero exit so it can gate a build.
 */

import { extractEntities, extractKeywords, computeAnalytics, buildGraph } from "@/lib/video-intel/analyze";
import { detectChapters } from "@/lib/video-intel/chapters";
import { exportTranscript } from "@/lib/video-intel/exports";
import { cuesToSegments, emptyTranscript, formatClock, type Segment, type Transcript } from "@/lib/video-intel/types";
import { parseSubtitles } from "@/lib/subtitles";
import { extractQuotes, extractActionItems, buildReportHtml, isUsableOcr } from "@/lib/video-intel/report";
import { hammingDistance } from "@/lib/video-intel/frames";

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

function seg(id: string, start: number, end: number, text: string, speakerId?: string): Segment {
  return { id, start, end, text, speakerId };
}

/* ── keywords ────────────────────────────────────────────────────────────── */

const kwSegments: Segment[] = [
  seg("s0", 0, 4000, "So basically the pricing model is really the thing we need to discuss"),
  seg("s1", 4000, 8000, "Right, the pricing tiers are confusing for enterprise customers"),
  seg("s2", 8000, 12000, "I think enterprise pricing should be simpler, you know"),
  seg("s3", 12000, 16000, "Yeah okay so we agree pricing is the blocker"),
  seg("s4", 16000, 20000, "Let us talk about the migration timeline instead"),
];
const keywords = extractKeywords(kwSegments, 10);
const terms = keywords.map((k) => k.term);
check("keywords rank the topic first", terms[0] === "pricing", `got ${terms.slice(0, 3).join(", ")}`);
check("keywords drop filler words", !terms.includes("basically") && !terms.includes("really") && !terms.includes("okay"));
check("keywords carry clickable timestamps", (keywords[0]?.times.length ?? 0) >= 3);
check("keywords survive an empty transcript", extractKeywords([], 5).length === 0);

/* ── entities ────────────────────────────────────────────────────────────── */

const entSegments: Segment[] = [
  seg("e0", 0, 3000, "Email me at sam.rae@example.co.uk or visit https://example.com/pricing"),
  seg("e1", 3000, 6000, "The deal was $1,250,000 and margins rose 12.5% year over year"),
  seg("e2", 6000, 9000, "Call +44 20 7946 0958 before 4:30 pm on 2026-03-14"),
  seg("e3", 9000, 12000, "We shipped 3 units. Follow #launch and @gigaitools for updates"),
];
const entities = extractEntities(entSegments);
const byType = (t: string) => entities.filter((e) => e.type === t).map((e) => e.value);
check("finds email", byType("email")[0] === "sam.rae@example.co.uk", byType("email").join());
check("finds url", byType("url")[0]?.startsWith("https://example.com") === true, byType("url").join());
check("finds money", byType("money").some((v) => v.includes("1,250,000")), byType("money").join());
check("finds percent", byType("percent").some((v) => v.includes("12.5")), byType("percent").join());
check("finds time", byType("time").some((v) => v.includes("4:30")), byType("time").join());
check("finds date", byType("date").some((v) => v.includes("2026-03-14")), byType("date").join());
check("finds hashtag + mention", byType("hashtag").includes("#launch") && byType("mention").includes("@gigaitools"));
check("rejects tiny numbers as phone numbers", !byType("phone").some((v) => v.trim() === "3"), byType("phone").join());
check("url is not double-counted as a number", !byType("number").some((v) => v.includes("example")));
check("entities carry timestamps", entities.every((e) => e.times.length > 0));

/* ── chapters ────────────────────────────────────────────────────────────── */

const chapterSegments: Segment[] = [
  seg("c0", 0, 25000, "Welcome everyone to the quarterly planning session on revenue", "sp1"),
  seg("c1", 25000, 40000, "Revenue grew across every region this quarter", "sp1"),
  // 10s pause + speaker change → boundary, and the first chapter is long enough
  seg("c2", 50000, 80000, "Now let us move to the hiring plan and headcount budget", "sp2"),
  seg("c3", 80000, 95000, "Hiring is behind plan in engineering headcount", "sp2"),
];
const chapters = detectChapters(chapterSegments);
check("splits on a long pause + speaker change", chapters.length === 2, `got ${chapters.length}`);
check("chapter covers its own span", chapters[0]?.start === 0 && chapters[0]?.end === 40000);
check("chapter records its speakers", chapters[1]?.speakerIds.includes("sp2") === true);
check("chapter gets a non-empty title", (chapters[0]?.title.length ?? 0) > 0);

// Short exchanges must NOT each become a chapter.
const chatty: Segment[] = Array.from({ length: 8 }, (_, i) =>
  seg(`q${i}`, i * 4000, i * 4000 + 3000, `Quick point number ${i} about scheduling`, i % 2 ? "a" : "b"),
);
check("does not shred rapid back-and-forth into micro-chapters", detectChapters(chatty).length <= 2, `got ${detectChapters(chatty).length}`);
check("chapters survive an empty transcript", detectChapters([]).length === 0);

/* ── analytics ───────────────────────────────────────────────────────────── */

const doc: Transcript = {
  ...emptyTranscript("Quarterly Planning.mp4"),
  segments: chapterSegments,
  speakers: [
    { id: "sp1", label: "Alex", colorIndex: 0 },
    { id: "sp2", label: "Sam", colorIndex: 1 },
  ],
  chapters,
  durationMs: 100000,
};
const analytics = computeAnalytics(doc);
check("counts words", analytics.words === 34, `got ${analytics.words}`); // 9+7+11+7, hand-counted
check("speech ratio is a fraction", analytics.speechRatio > 0 && analytics.speechRatio <= 1);
check("silence + speech = 1", Math.abs(analytics.speechRatio + analytics.silenceRatio - 1) < 1e-9);
check("per-speaker shares sum to 1", Math.abs(analytics.speakers.reduce((n, s) => n + s.share, 0) - 1) < 1e-9);
check("confidence is null when the source had none", analytics.meanConfidence === null);
check("analytics survive an empty transcript", computeAnalytics(emptyTranscript()).words === 0);

/* ── graph ───────────────────────────────────────────────────────────────── */

const edges = buildGraph(kwSegments, keywords);
check("graph edges are undirected pairs of distinct terms", edges.every((e) => e.source !== e.target));

/* ── exports ─────────────────────────────────────────────────────────────── */

const srt = exportTranscript("srt", { transcript: doc });
const reparsed = parseSubtitles(srt.body);
check("SRT round-trips through the shared subtitle parser", reparsed.cues.length === doc.segments.length, `got ${reparsed.cues.length}`);
check("SRT preserves timings exactly", reparsed.cues[0]?.start === 0 && reparsed.cues[1]?.end === 40000);
check("VTT starts with the WEBVTT header", exportTranscript("vtt", { transcript: doc }).body.startsWith("WEBVTT"));

const csv = exportTranscript("csv", { transcript: doc }).body;
check("CSV has a header + one row per segment", csv.split("\r\n").length === doc.segments.length + 1);

const csvEscape = exportTranscript("csv", {
  transcript: { ...doc, segments: [seg("x", 0, 1000, 'He said "hello, world" loudly')] },
}).body;
check("CSV escapes quotes and commas", csvEscape.includes('""hello, world""'), csvEscape.split("\r\n")[1] ?? "");

const xml = exportTranscript("xml", {
  transcript: { ...doc, segments: [seg("x", 0, 1000, "5 < 6 & 7 > 2")] },
}).body;
check("XML escapes metacharacters", xml.includes("5 &lt; 6 &amp; 7 &gt; 2") && !xml.includes("5 < 6"));

const json = JSON.parse(exportTranscript("json", { transcript: doc, analytics }).body);
check("JSON carries segments + analytics", json.segments.length === 4 && json.analytics.words === 34);

const md = exportTranscript("md", { transcript: doc, analytics, keywords }).body;
check("Markdown includes a chapters section", md.includes("## Chapters"));

const html = exportTranscript("html", { transcript: doc, analytics }).body;
check("HTML is a complete document", html.startsWith("<!doctype html>") && html.includes("</html>"));

check("export filename is slugified from the media name", exportTranscript("txt", { transcript: doc }).name === "quarterly-planning.txt", exportTranscript("txt", { transcript: doc }).name);

/* ── helpers ─────────────────────────────────────────────────────────────── */

check("formatClock under an hour", formatClock(95000) === "1:35", formatClock(95000));
check("formatClock over an hour", formatClock(3725000) === "1:02:05", formatClock(3725000));
check("formatClock clamps negatives", formatClock(-5) === "0:00");
check("cuesToSegments assigns stable ids", cuesToSegments([{ start: 0, end: 1, text: "a" }])[0]?.id === "s0");


/* ── report engine ───────────────────────────────────────────────────────── */

check("hamming distance: identical hashes", hammingDistance("11110000", "11110000") === 0);
check("hamming distance: counts differing bits", hammingDistance("11110000", "11110011") === 2);

const reportDoc: Transcript = {
  ...emptyTranscript("Team Sync.mp4"),
  durationMs: 120000,
  speakers: [{ id: "sp1", label: "Priya", colorIndex: 0 }],
  segments: [
    seg("r0", 0, 9000, "The pricing model is the single biggest blocker for enterprise pricing adoption right now", "sp1"),
    seg("r1", 9000, 15000, "I'll send the revised pricing deck by Friday", "sp1"),
    seg("r2", 15000, 20000, "yeah ok sure", "sp1"),
    seg("r3", 20000, 28000, "We need to rewrite the enterprise pricing tiers before the board meeting", "sp1"),
  ],
};
const reportKeywords = extractKeywords(reportDoc.segments, 10);

const quotes = extractQuotes(reportDoc, reportKeywords);
check("quotes skip lines that are too short", !quotes.some((q) => q.text === "yeah ok sure"));
check("quotes carry a timestamp and speaker", quotes.length > 0 && quotes[0]!.speaker === "Priya");

const actions = extractActionItems(reportDoc);
const cues = actions.map((a) => a.cue);
check("detects a commitment (\"I'll …\")", cues.includes("commitment"), cues.join());
check("detects an obligation (\"we need to …\")", cues.includes("obligation"), cues.join());
check("does not flag small talk as an action", !actions.some((a) => a.text === "yeah ok sure"));

const reportHtml = buildReportHtml({
  transcript: reportDoc,
  analytics: computeAnalytics(reportDoc),
  keywords: reportKeywords,
  entities: [],
  frames: [],
});
check("report is a complete HTML document", reportHtml.startsWith("<!doctype html>") && reportHtml.includes("</html>"));
check("report states how it was made (no fake AI claim)", reportHtml.includes("not written or interpreted by an AI"));
check("report escapes HTML in transcript text", buildReportHtml({
  transcript: { ...reportDoc, segments: [seg("x", 0, 1000, "<script>alert(1)</script>")] },
  analytics: computeAnalytics(reportDoc), keywords: [], entities: [], frames: [],
}).includes("&lt;script&gt;"));
check("report omits the summary section when the user wrote none", !reportHtml.includes("<h2>Summary</h2>"));


/* ── OCR quality gate (the garbage that reached a real report) ───────────── */

const REAL_GARBAGE = "wld LLL SE Tr Tr \u2014 A~: NW0@D Ta Beri 8m ia re in Wo Gk Ba Gem re Cow L] = = [] EES CELE LEE] Renal";
check("rejects real-world OCR garbage even at high confidence", !isUsableOcr(REAL_GARBAGE, 85), "garbage passed the gate");
check("rejects anything below the confidence floor", !isUsableOcr("Hiring Preferences and Address details", 40));
check("rejects text that is too short", !isUsableOcr("Save", 95));
check("rejects too few word-like tokens", !isUsableOcr("A1 B2 C3 D4 E5 F6", 95));
check("accepts genuine UI text", isUsableOcr("Address Hiring Preferences Save Cancel Manage addresses", 82), "real text was rejected");
check("accepts a real slide sentence", isUsableOcr("Revenue grew across every region this quarter", 78));

/* Empty transcript must not render a bare heading. */
const visualOnly = buildReportHtml({
  transcript: emptyTranscript("clip.mp4"),
  analytics: computeAnalytics(emptyTranscript()),
  keywords: [], entities: [], frames: [],
});
check("visual-only report explains the missing transcript", visualOnly.includes("this is a visual report"));
check("visual-only report does not claim a Whisper transcript", !visualOnly.includes("came from Whisper"));
check("visual-only report hides zero-value stat tiles", !visualOnly.includes("<span>Words</span>"));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
