/**
 * The bundled "See it work - no upload" demo (P9). AUTO-GENERATED alongside
 * public/samples/client-feedback-demo.m4a: the segment timings below were
 * MEASURED from the actual audio, so every timestamp chip seeks to the words
 * being said. The tickets are precomputed so the result appears instantly;
 * the banner in the UI says so plainly - the live pipeline runs on real files.
 */

import type { ExtractionResult, Speaker, TranscriptSegment } from "./types";

/**
 * The demo recording's URL, from NEXT_PUBLIC_VTW_DEMO_SAMPLE (on gigai.tools,
 * /samples/client-feedback-demo.m4a). The recording is not in the repository;
 * unset, the "See it work" button is hidden.
 */
export const DEMO_SAMPLE_URL = process.env.NEXT_PUBLIC_VTW_DEMO_SAMPLE?.trim() || "";
export const DEMO_DURATION_MS = 114060;

export const DEMO_SEGMENTS: TranscriptSegment[] = [
  { id: "d0", startSec: 0.0, endSec: 4.94, text: "Okay, we're recording. Thanks for making time to go through the new build today.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d1", startSec: 5.49, endSec: 10.77, text: "Yeah, no worries. So I went through everything over the weekend on my laptop and my phone.", speakerId: "SPEAKER_CLIENT" },
  { id: "d2", startSec: 11.32, endSec: 16.09, text: "So the thing is, when I open the site on my phone, the buy button just isn't there.", speakerId: "SPEAKER_CLIENT" },
  { id: "d3", startSec: 16.64, endSec: 18.84, text: "Right. On mobile specifically?", speakerId: "SPEAKER_INTERNAL" },
  { id: "d4", startSec: 19.39, endSec: 24.36, text: "Yeah, on my iPhone. It's like the button is below the fold or invisible or something.", speakerId: "SPEAKER_CLIENT" },
  { id: "d5", startSec: 24.91, endSec: 27.79, text: "Got it. We'll look at the viewport handling there.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d6", startSec: 28.34, endSec: 33.69, text: "And the checkout page... actually no, wait, not the checkout. The cart page.", speakerId: "SPEAKER_CLIENT" },
  { id: "d7", startSec: 34.24, endSec: 38.81, text: "The cart page takes like ten seconds to load, which is honestly way too slow.", speakerId: "SPEAKER_CLIENT" },
  { id: "d8", startSec: 39.36, endSec: 44.59, text: "The cart is doing a full refresh on every quantity change right now. We can fix that.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d9", startSec: 45.14, endSec: 48.74, text: "Also, I'd like a way to export my orders as a spreadsheet.", speakerId: "SPEAKER_CLIENT" },
  { id: "d10", startSec: 49.29, endSec: 50.83, text: "Yeah, we can do that.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d11", startSec: 51.38, endSec: 54.92, text: "It should just be a button on the orders page. Nothing fancy.", speakerId: "SPEAKER_CLIENT" },
  { id: "d12", startSec: 55.47, endSec: 58.43, text: "Oh, and can you make the logo a bit bigger in the header?", speakerId: "SPEAKER_CLIENT" },
  { id: "d13", startSec: 58.98, endSec: 60.57, text: "Sure, small tweak.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d14", startSec: 61.12, endSec: 65.94, text: "One more thing about that buy button. It's really urgent, because we launch on Friday.", speakerId: "SPEAKER_CLIENT" },
  { id: "d15", startSec: 66.49, endSec: 70.44, text: "Like I said, the buy button on mobile is just not showing up at all.", speakerId: "SPEAKER_CLIENT" },
  { id: "d16", startSec: 70.99, endSec: 73.55, text: "Understood. That one goes top of the list.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d17", startSec: 74.1, endSec: 77.95, text: "Why does the search show discontinued products? Is that intentional?", speakerId: "SPEAKER_CLIENT" },
  { id: "d18", startSec: 78.5, endSec: 81.95, text: "That's a data flag on our side. We can filter it out.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d19", startSec: 82.5, endSec: 86.45, text: "And the password reset email never arrives when I use my work address.", speakerId: "SPEAKER_CLIENT" },
  { id: "d20", startSec: 87.0, endSec: 90.84, text: "Interesting. That might be the S P F record. We'll check.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d21", startSec: 91.39, endSec: 95.62, text: "Don't worry about the footer links I mentioned last time. Those are fine now.", speakerId: "SPEAKER_CLIENT" },
  { id: "d22", startSec: 96.17, endSec: 104.14, text: "Great. So: mobile buy button, cart speed, order export, the logo, search, and reset emails.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d23", startSec: 104.69, endSec: 108.78, text: "Yeah, that's the list. The button one is the big one, obviously.", speakerId: "SPEAKER_CLIENT" },
  { id: "d24", startSec: 109.33, endSec: 111.24, text: "We'll send a summary over tomorrow.", speakerId: "SPEAKER_INTERNAL" },
  { id: "d25", startSec: 111.79, endSec: 114.06, text: "Perfect, thanks. Talk soon.", speakerId: "SPEAKER_CLIENT" },
];

export const DEMO_SPEAKERS: Speaker[] = [
  {
    id: "SPEAKER_CLIENT",
    role: "client",
    label: "Client",
    talkTimeSec: 62.2,
    sampleQuotes: [
      "So the thing is, when I open the site on my phone, the buy button just isn't there.",
      "The cart page takes like ten seconds to load, which is honestly way too slow.",
      "I'd like a way to export my orders as a spreadsheet.",
    ],
  },
  {
    id: "SPEAKER_INTERNAL",
    role: "internal",
    label: "Account manager",
    talkTimeSec: 38.1,
    sampleQuotes: [
      "Got it. We'll look at the viewport handling there.",
      "Yeah, we can do that.",
      "Understood. That one goes top of the list.",
    ],
  },
];

export const DEMO_RESULT: ExtractionResult = {
  tickets: [
  {
    id: "demo-1",
    title: "Fix invisible buy button on mobile",
    type: "bug" as const,
    occurrences: [
      { startSec: 11.32, endSec: 16.09, quote: "when I open the site on my phone, the buy button just isn't there", segmentIds: ["d2"], matchQuality: "exact" as const },
      { startSec: 66.49, endSec: 70.44, quote: "the buy button on mobile is just not showing up at all", segmentIds: ["d15"], matchQuality: "exact" as const },
    ],
    speakerId: "SPEAKER_CLIENT",
    priority: "high" as const,
    prioritySignal: "It's really urgent, because we launch on Friday.",
    confidence: 1,
    modelConfidence: 0.95,
    needsReview: false,
    dismissed: false,
  },
  {
    id: "demo-2",
    title: "Speed up the cart page",
    type: "bug" as const,
    occurrences: [{ startSec: 34.24, endSec: 38.81, quote: "The cart page takes like ten seconds to load, which is honestly way too slow.", segmentIds: ["d7"], matchQuality: "exact" as const }],
    speakerId: "SPEAKER_CLIENT",
    priority: null,
    prioritySignal: null,
    confidence: 0.9,
    modelConfidence: 0.9,
    needsReview: false,
    dismissed: false,
  },
  {
    id: "demo-3",
    title: "Add spreadsheet export for orders",
    type: "feature" as const,
    occurrences: [
      { startSec: 45.14, endSec: 48.74, quote: "I'd like a way to export my orders as a spreadsheet.", segmentIds: ["d9"], matchQuality: "exact" as const },
      { startSec: 51.38, endSec: 54.92, quote: "It should just be a button on the orders page. Nothing fancy.", segmentIds: ["d11"], matchQuality: "exact" as const },
    ],
    speakerId: "SPEAKER_CLIENT",
    priority: null,
    prioritySignal: null,
    confidence: 1,
    modelConfidence: 0.92,
    needsReview: false,
    dismissed: false,
  },
  {
    id: "demo-4",
    title: "Make the header logo bigger",
    type: "design" as const,
    occurrences: [{ startSec: 55.47, endSec: 58.43, quote: "can you make the logo a bit bigger in the header?", segmentIds: ["d12"], matchQuality: "exact" as const }],
    speakerId: "SPEAKER_CLIENT",
    priority: null,
    prioritySignal: null,
    confidence: 0.88,
    modelConfidence: 0.88,
    needsReview: false,
    dismissed: false,
  },
  {
    id: "demo-5",
    title: "Clarify discontinued products in search",
    type: "question" as const,
    occurrences: [{ startSec: 74.1, endSec: 77.95, quote: "Why does the search show discontinued products? Is that intentional?", segmentIds: ["d17"], matchQuality: "exact" as const }],
    speakerId: "SPEAKER_CLIENT",
    priority: null,
    prioritySignal: null,
    confidence: 0.65,
    modelConfidence: 0.65,
    needsReview: true,
    dismissed: false,
  },
  {
    id: "demo-6",
    title: "Fix password reset for work email addresses",
    type: "bug" as const,
    occurrences: [{ startSec: 82.5, endSec: 86.45, quote: "the password reset email never arrives when I use my work address", segmentIds: ["d19"], matchQuality: "exact" as const }],
    speakerId: "SPEAKER_CLIENT",
    priority: null,
    prioritySignal: null,
    confidence: 0.9,
    modelConfidence: 0.9,
    needsReview: false,
    dismissed: false,
  },
],
  speakers: DEMO_SPEAKERS,
  droppedCandidates: [
    {
      title: "Do a full refresh on quantity change",
      claimedQuote: "The cart is doing a full refresh on every quantity change right now.",
      reason: "internal-speaker",
    },
    {
      title: "Redesign the homepage hero",
      claimedQuote: "the homepage hero really needs a fresh look and better imagery",
      reason: "no-verbatim-match",
    },
  ],
  stats: {
    candidatesExtracted: 9,
    droppedForVerbatim: 1,
    droppedForSpeaker: 1,
    mergedByDedupe: 1,
    finalCount: 6,
  },
};
