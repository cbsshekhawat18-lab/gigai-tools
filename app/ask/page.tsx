import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { buildMetadata } from "@/lib/seo";
import { AskGigaiClient } from "./ask-gigai-client";

export const metadata: Metadata = buildMetadata({
  title: "Ask GigAI - describe the outcome, get a verified tool pipeline",
  description:
    "Type what should happen to your files - 'resize to 1200 wide, convert to WebP, under 150 KB' - and Ask GigAI plans a pipeline from 50+ real tools, shows it as editable cards, runs it step by step and verifies each result actually met its target. Browser-first: most plans never upload a byte.",
  canonical: "/ask",
});

export default function AskPage() {
  return (
    <section className="py-12">
      <Container>
        <h1 className="text-2xl font-bold text-foreground">Ask GigAI</h1>
        <p className="mt-3 max-w-[75ch] text-muted-foreground">
          Describe the outcome, drop the files, and get a plan built from the
          platform&apos;s real tools - shown as cards you can edit or remove
          before anything runs. Execution is step by step with verification:
          a &quot;under 150 KB&quot; step is measured, not assumed, and a miss
          gets exactly one correction before the run stops honestly.
        </p>
        <p className="mt-2 max-w-[75ch] text-sm text-muted-foreground">
          Planning is on-device by default - a deterministic parser, no model,
          no download. Optional smarter planning (free cloud, or your own key)
          only ever sees your goal sentence and file names, types and sizes -
          never file contents. Steps marked on-device run entirely in this
          browser; steps marked server say so on the card before you press Run.
        </p>
        <div className="mt-8">
          <AskGigaiClient />
        </div>
      </Container>
    </section>
  );
}
