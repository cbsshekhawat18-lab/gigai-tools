import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { buildMetadata } from "@/lib/seo";
import { AskClient } from "./ask-client";

export const metadata: Metadata = buildMetadata({
  title: "Ask Your File - on-device document Q&A with citations",
  description:
    "Drop a PDF, CSV or text file and ask questions - answers are quoted from your own file with clickable citations, found by on-device semantic search. Zero upload, works offline after a one-time 23 MB model download.",
  canonical: "/ask-file",
});

export default function AskFilePage() {
  return (
    <section className="py-12">
      <Container>
        <h1 className="text-2xl font-bold text-foreground">Ask Your File</h1>
        <p className="mt-3 max-w-[75ch] text-muted-foreground">
          Drop a document, ask questions, get the exact passages that answer them -
          with citations that jump to the spot. Everything runs on this device: the
          file never uploads, and after the one-time 23 MB model download the page
          works offline. A live indicator shows real network activity, so the
          zero-upload claim is checkable, not just promised.
        </p>
        <p className="mt-2 max-w-[75ch] text-sm text-muted-foreground">
          This is the extractive tier: answers are quotes from your file, ranked by
          on-device semantic search - nothing is generated, so nothing can be
          invented. A generative tier with an on-device language model is being
          evaluated per device class and will say so here when it is real. The Act
          buttons run deterministic extractions and Indian-PII redaction with a
          verification re-scan.
        </p>
        <div className="mt-8">
          <AskClient />
        </div>
      </Container>
    </section>
  );
}
