import Link from "next/link";

/**
 * One-line cross-link to Ask GigAI, shown on the pages it grew out of
 * (Smart Assist, GigAI Fit). Static, server-safe.
 */
export function AskBanner({ context }: { context: string }) {
  return (
    <p className="rounded border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      New: <Link href="/ask" className="font-semibold text-primary hover:underline">Ask GigAI</Link>
      {" "}goes further than {context} - it plans a multi-step pipeline from a sentence,
      lets you edit the steps, then verifies each result actually met its target.
    </p>
  );
}
