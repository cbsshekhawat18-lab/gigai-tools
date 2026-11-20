/**
 * Stage 1 - speaker roles. Only the client's requests become tickets, so the
 * user tags each speaker Client / Internal / Not sure once per video, with a
 * visible pre-selected guess from a request-language heuristic (talk time
 * alone is NOT a signal - internal people often talk more).
 *
 * Reality note: the platform has no automatic diarization (a deliberate
 * Video Intelligence decision - we never invent "Speaker 1/2" labels the model
 * has no basis for). Segments carry whatever speakerId the transcript has;
 * when none exists everything collapses to one "unknown" speaker whose
 * tickets are confidence-capped into Needs Review (confidence.ts).
 */

import type { Speaker, SpeakerRole, TranscriptSegment } from "./types";

export const UNTAGGED_SPEAKER_ID = "speaker-untagged";

/** Request-language markers; density of these = "likely the client". */
const REQUEST_PATTERNS: RegExp[] = [
  /\bcan you\b/i,
  /\bcould you\b/i,
  /\bwould you\b/i,
  /\bi'?d like\b/i,
  /\bi want\b/i,
  /\bi need\b/i,
  /\bit should\b/i,
  /\bwhy does\b/i,
  /\bwhy is\b/i,
  /\bthis is broken\b/i,
  /\bdoesn'?t work\b/i,
  /\bnot working\b/i,
  /\bplease (?:fix|change|add|make|remove)\b/i,
];

export function requestDensity(text: string): number {
  const words = text.split(/\s+/).length || 1;
  let hits = 0;
  for (const re of REQUEST_PATTERNS) {
    const m = text.match(new RegExp(re.source, re.flags + "g"));
    if (m) hits += m.length;
  }
  return hits / words;
}

/**
 * Build the speaker list with talk time, sample quotes and a pre-selected
 * role GUESS: highest request-language density = client, rest = internal.
 * With one (or no) speaker there is nothing to contrast against, so the
 * single speaker stays "unknown" and the tagging UI says so.
 */
export function assignSpeakerRoles(segments: TranscriptSegment[]): Speaker[] {
  const bySpeaker = new Map<string, TranscriptSegment[]>();
  for (const seg of segments) {
    const id = seg.speakerId || UNTAGGED_SPEAKER_ID;
    const list = bySpeaker.get(id) ?? [];
    list.push(seg);
    bySpeaker.set(id, list);
  }

  const speakers: Speaker[] = [];
  for (const [id, segs] of bySpeaker) {
    const talkTimeSec = segs.reduce((sum, s) => sum + Math.max(0, s.endSec - s.startSec), 0);
    const sampleQuotes = [...segs]
      .sort((a, b) => b.text.length - a.text.length)
      .slice(0, 3)
      .map((s) => s.text.trim());
    speakers.push({ id, role: "unknown", label: id, talkTimeSec, sampleQuotes });
  }

  if (speakers.length >= 2) {
    const scored = speakers.map((sp) => ({
      sp,
      density: requestDensity(
        bySpeaker
          .get(sp.id)!
          .map((s) => s.text)
          .join(" "),
      ),
    }));
    scored.sort((a, b) => b.density - a.density);
    scored[0]!.sp.role = "client";
    for (let i = 1; i < scored.length; i += 1) scored[i]!.sp.role = "internal";
  }

  return speakers;
}

/* ── persistence: don't re-ask for the same file ─────────────────────────── */

const STORE_PREFIX = "gigai.v2w.speakers.";

export interface StoredRoles {
  [speakerId: string]: { role: SpeakerRole; label: string };
}

export function loadSpeakerRoles(videoHash: string): StoredRoles | null {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + videoHash);
    return raw ? (JSON.parse(raw) as StoredRoles) : null;
  } catch {
    return null;
  }
}

export function saveSpeakerRoles(videoHash: string, speakers: Speaker[]): void {
  try {
    const data: StoredRoles = {};
    for (const sp of speakers) data[sp.id] = { role: sp.role, label: sp.label };
    localStorage.setItem(STORE_PREFIX + videoHash, JSON.stringify(data));
  } catch {
    /* storage blocked - the user just gets asked again next time */
  }
}

/** Cheap stable id for "same file": size + name + first 64KB digest. */
export async function hashVideoFile(file: File): Promise<string> {
  try {
    const head = await file.slice(0, 65536).arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", head);
    const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
    return `${hex}-${file.size}`;
  } catch {
    return `${file.name}-${file.size}`;
  }
}
