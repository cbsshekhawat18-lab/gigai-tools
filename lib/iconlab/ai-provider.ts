/**
 * AI concept provider, the long tail beyond the built-in vocabulary.
 *
 * ORDER MATTERS: this provider is registered AFTER the vocabulary provider, so
 * the 98 hand-composed concepts always win. The AI is only consulted for
 * concepts the vocabulary cannot resolve, which keeps the common path free,
 * instant and offline, and keeps AI usage honest: it runs when it genuinely
 * helps, not as decoration.
 *
 * WHAT TRAVELS: the icon's concept name and optional description. Never a
 * file, never the family, never existing icons. The server composes a
 * primitive list and forgets the request.
 *
 * TRUST NOTHING FROM THE WIRE: the server already validates, and this module
 * validates again (kinds, arity, ranges, counts) because the renderer is the
 * consistency guarantee and it must only ever receive compositions that satisfy
 * its contract. The rendered result then goes through the same originality and
 * consistency screening as every vocabulary icon.
 */

import type { Composition, Primitive, PrimitiveKind } from "./primitives";
import { registerProvider, type ConceptProvider } from "./generate";

const ENDPOINT = "/api/iconlab";

/** kind → [min points, max points, must be even]. Mirrors the renderer. */
const ARITY: Record<PrimitiveKind, [number, number, boolean]> = {
  rect: [4, 4, true],
  circle: [3, 3, false],
  line: [4, 4, true],
  polyline: [4, 24, true],
  chevron: [4, 24, true],
  arc: [5, 5, false],
  triangle: [6, 6, true],
  dot: [2, 2, true],
};

const MAX_PRIMITIVES = 8;
const GRID = 24;

/** Availability, probed once per session. A static export has no env vars. */
let available: boolean | null = null;

export async function aiComposerAvailable(): Promise<boolean> {
  if (available !== null) return available;
  try {
    const res = await fetch(`${ENDPOINT}/status`, { signal: AbortSignal.timeout(4000) });
    const data = (await res.json()) as { configured?: boolean };
    available = res.ok && data.configured === true;
  } catch {
    available = false;
  }
  return available;
}

/** Validate one wire primitive into a renderer-safe one, or null. */
function sanitise(raw: unknown): Primitive | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as { kind?: unknown; points?: unknown; filled?: unknown };
  const kind = item.kind as PrimitiveKind;
  const spec = typeof kind === "string" ? ARITY[kind] : undefined;
  if (!spec || !Array.isArray(item.points)) return null;

  const [lo, hi, even] = spec;
  if (item.points.length < lo || item.points.length > hi) return null;
  if (even && item.points.length % 2 !== 0) return null;

  const points: number[] = [];
  for (const [index, value] of item.points.entries()) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    // Radii and angles have their own ranges; XY coordinates clamp to the grid.
    if ((kind === "circle" || kind === "arc") && index === 2) points.push(Math.max(0.5, Math.min(11, n)));
    else if (kind === "arc" && index >= 3) points.push(Math.max(-360, Math.min(720, n)));
    else points.push(Math.max(0, Math.min(GRID, n)));
  }

  const primitive: Primitive = { kind, points };
  if (item.filled === true && kind === "dot") primitive.filled = true;
  return primitive;
}

export const aiProvider: ConceptProvider = {
  id: "ai-composer",
  async propose(concept, description): Promise<Composition | null> {
    if (!(await aiComposerAvailable())) return null;

    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: concept.slice(0, 60), description: description.slice(0, 200) }),
        signal: AbortSignal.timeout(35_000),
      });
    } catch {
      return null; // network failure → fall through to "no composition" message
    }

    if (res.status === 429) {
      // Surface the rate limit as a real error rather than a generic "can't
      // draw that", the user should know to wait, not to rephrase.
      const data = (await res.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(data?.detail ?? "Too many composition requests, wait a minute and try again.");
    }
    if (!res.ok) return null;

    const data = (await res.json().catch(() => null)) as { primitives?: unknown[] } | null;
    if (!data?.primitives?.length) return null;

    const primitives = data.primitives
      .slice(0, MAX_PRIMITIVES)
      .map(sanitise)
      .filter((p): p is Primitive => p !== null);

    if (primitives.length === 0) return null;
    return { concept: concept.toLowerCase().trim(), primitives };
  },
};

/**
 * Idempotent registration hook for the workspace. Kept as an explicit call
 * (not a module side-effect) so importing this file in a test never fires a
 * network probe.
 */
export function enableAiComposer(): void {
  registerProvider(aiProvider);
}
