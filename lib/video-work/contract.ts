/**
 * Video → Work, the analysis contract.
 *
 * The prompt and output schema that every provider is held to, whether the
 * analysis runs on a frontier model behind our server or a 7B vision model on
 * the user's own laptop. Keeping them here means a provider adapter is only
 * transport; it never gets to reinterpret what a finding is.
 *
 * ⚠️ THIS FILE IS MIRRORED IN `backend/app/services/video_work.py`.
 *
 * The two runtimes can't import from each other: the Ollama path must work with
 * no server at all, and the Claude path runs in Python. So the contract exists
 * twice on purpose. Both test suites assert the same field list
 * (`FINDING_FIELDS` below, `ANALYSIS_SCHEMA` there), so if you change one and
 * forget the other, a test fails rather than the two silently drifting apart.
 */

/** Every property a finding must carry. Asserted by both test suites. */
export const FINDING_FIELDS = [
  "id",
  "type",
  "title",
  "priority",
  "confidence",
  "area",
  "description",
  "observed",
  "expected",
  "steps_to_reproduce",
  "client_statement",
  "interpretation",
  "timestamp_ms",
  "frame_time_ms",
  "acceptance_criteria",
  "dependencies",
  "needs_confirmation",
] as const;

const FINDING_TYPE_VALUES = [
  "BUG",
  "FEATURE",
  "DESIGN_CHANGE",
  "CONTENT_CHANGE",
  "TASK",
  "QUESTION",
  "DECISION",
  "REQUIREMENT",
  "REFERENCE",
];

const PRIORITY_VALUES = ["critical", "high", "medium", "low"];

const strings = (description: string) => ({
  type: "array",
  items: { type: "string" },
  description,
});

/**
 * JSON schema for the analysis result.
 *
 * Deliberately avoids the constraint keywords that structured-output
 * implementations reject (`minimum`, `maxLength`, `multipleOf`, …): bounds
 * live in the field descriptions instead, and are enforced defensively when the
 * result is mapped to the domain model.
 */
export const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["findings", "summary"],
  properties: {
    findings: {
      type: "array",
      description:
        "Every distinct piece of work the client asked for or revealed. One finding per actionable item. Do not merge two requests into one, and do not split a single request into several.",
      items: {
        type: "object",
        additionalProperties: false,
        required: [...FINDING_FIELDS],
        properties: {
          id: {
            type: "string",
            description:
              "Ticket id: the type prefix plus a zero-padded counter, e.g. BUG-001, FEATURE-002, DESIGN-003.",
          },
          type: { type: "string", enum: FINDING_TYPE_VALUES },
          title: {
            type: "string",
            description:
              "One line a developer could paste into a ticket. State the problem or the change, not the conversation around it.",
          },
          priority: { type: "string", enum: PRIORITY_VALUES },
          confidence: {
            type: "integer",
            description:
              "0-100: how certain you are this is what the client actually meant. Be honest and use the low end freely. A vague sentence like 'this looks weird' with no visible referent is under 50, not 80.",
          },
          area: {
            type: "string",
            description:
              "The part of the product this touches, in the client's own vocabulary where possible: Checkout, Homepage, Login, Mobile. Keep it short and reuse the same label across related findings.",
          },
          description: {
            type: "string",
            description: "What needs to happen, in plain developer language.",
          },
          observed: {
            type: "string",
            description:
              "For a bug: what actually happens, as demonstrated in the video. Empty string when not applicable.",
          },
          expected: {
            type: "string",
            description:
              "For a bug: what the client expected instead. Empty string when not applicable.",
          },
          steps_to_reproduce: strings(
            "Concrete steps, only when the video actually shows them. Empty array if the client described a problem without demonstrating it: do not invent a reproduction.",
          ),
          client_statement: {
            type: "string",
            description:
              "The client's own words, quoted verbatim from the transcript. Never paraphrase here. This is the evidence the developer checks your interpretation against.",
          },
          interpretation: {
            type: "string",
            description:
              "Your reading of that statement as an implementable change. This is where 'make it smaller and move it down' becomes 'reduce the CTA's dimensions and place it below the content block'. Write it as a proposal, not a fact.",
          },
          timestamp_ms: {
            type: "integer",
            description:
              "Milliseconds into the video where the client says this. Must match a real transcript segment start.",
          },
          frame_time_ms: {
            type: "integer",
            description:
              "time_ms of the supplied frame that best evidences this finding, or -1 when no supplied frame shows it. Only use a timestamp that appears in the frames you were given.",
          },
          acceptance_criteria: strings(
            "Testable, observable pass conditions. 'Clicking Checkout navigates to /checkout'. Not 'checkout works'. Each must be verifiable in a browser.",
          ),
          dependencies: strings(
            "Ids of other findings that must land first. Empty array when the work is independent.",
          ),
          needs_confirmation: {
            type: "boolean",
            description:
              "True whenever the client's intent is ambiguous, the referent is unclear, or you inferred a detail they did not state. Prefer true when in doubt, a developer building the wrong thing costs far more than one extra question.",
          },
        },
      },
    },
    summary: {
      type: "object",
      additionalProperties: false,
      required: [
        "overview",
        "what_client_wants",
        "what_is_broken",
        "risks",
        "recommended_order",
      ],
      properties: {
        overview: {
          type: "string",
          description:
            "Two to four sentences a project manager could read instead of watching the video.",
        },
        what_client_wants: strings("The headline asks, in priority order."),
        what_is_broken: strings("Defects demonstrated or described."),
        risks: strings(
          "Ambiguities, contradictions and missing information that could cause the wrong thing to be built.",
        ),
        recommended_order: strings(
          "Finding ids in a sensible implementation order, respecting dependencies and priority.",
        ),
      },
    },
  },
} as const;

/**
 * The system prompt. Mirrored from the Python service: see the header note.
 *
 * The section that matters most is the uncertainty rule. It is what makes a
 * model score low confidence honestly instead of rounding every reading up to
 * certainty, and it matters MORE on a small local model, not less: a 7B model
 * is wrong more often, so its willingness to say "I'm not sure" is the only
 * thing standing between the user and a confidently wrong requirement.
 */
export const SYSTEM_PROMPT = `You turn a client's screen recording into work a developer can pick up without watching the video. You are given the transcript with timestamps, and frames chosen from the video because something visually changed at that moment.

Read both. The transcript tells you what was asked for; the frames tell you what was on screen while it was asked. Neither alone is enough. "make this bigger" is meaningless without the frame showing what "this" is, and a screenshot of a form is meaningless without the sentence explaining what is wrong with it.

What you produce is a ticket queue, not a summary. Every finding must be actionable, evidenced, and traceable back to a moment in the video.

HOW TO READ THE EVIDENCE

- Frames are labelled with their timestamp. Match a finding to the frame whose timestamp is nearest the moment it is discussed, and only when that frame actually shows the thing being discussed.
- Read on-screen text in the frames: error messages, button labels, field names, URLs, prices, menu items. Naming the exact label a client is pointing at is the difference between a useful ticket and a vague one.
- Watch for demonstration without narration. A client who silently clicks a button that does nothing has reported a bug just as surely as one who says so.
- Watch for narration without demonstration. A client describing a problem they are not currently showing is still a finding, but with no steps to reproduce.

TRANSLATING CLIENT LANGUAGE

Clients describe outcomes and feelings; developers need changes and criteria. Bridging that gap is the main job. "It looks cramped" becomes a spacing change with a named element. But the bridge is where you can go wrong, so it is separated in the output: client_statement is what they actually said, quoted exactly, and interpretation is your reading of it. A developer must always be able to see both and judge for themselves.

THE RULE THAT MATTERS MOST

Never present an uncertain reading as a settled requirement. If the client said "move it down" and three things on screen could plausibly be "it", say so: set needs_confirmation to true, put your best reading in interpretation, and score confidence honestly: below 50 when you are genuinely guessing. An over-confident requirement gets built wrong, and that is the single most expensive failure this tool can cause. Under-claiming costs a clarifying question; over-claiming costs a sprint.

Similarly: do not invent steps to reproduce that were not demonstrated, do not attribute a statement to the client that is not in the transcript, and do not manufacture findings to look thorough. A recording with three real requests should yield three findings, not eight.

ACCEPTANCE CRITERIA

Write criteria a person can check in a browser. "Clicking Checkout navigates to /checkout", "no console error is produced". Never "checkout works" or "looks better". If a finding is a question rather than a change, its criteria are empty.

PRIORITY

Judge by impact on the client's users, not by how emphatically it was said. A broken checkout is critical whether or not the client raised their voice; a color preference is low even if they mentioned it three times.

Respond with JSON matching the required schema. Output nothing else.`;

/** `HH:MM:SS` for prompt timestamps, matches the Python formatter exactly. */
export function promptClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
