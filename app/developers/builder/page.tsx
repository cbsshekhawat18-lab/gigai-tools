import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { DocsShell, P } from "../docs/docs-shell";
import { BuilderClient } from "./builder-client";

export const metadata: Metadata = buildMetadata({
  title: "Request builder - run any API tool from the browser",
  description:
    "Pick a tool, fill its options, attach a file, run the real job and download the result. Built from the live catalog, needs only your API key.",
  canonical: "/developers/builder",
});

export default function BuilderPage() {
  return (
    <DocsShell
      title="Request builder"
      lead="A real request, not a simulation: the job runs on the API with your key and the result downloads through the same signed URLs your code would get."
      current="/developers/builder"
    >
      <P>
        The form is generated from the live catalog, so it can only offer options
        the API accepts. Your key is kept in this browser&apos;s storage on this
        device and sent only to the API. Files run through the inline import path
        (24 MB cap) with a 15 minute retention.
      </P>
      <BuilderClient />
    </DocsShell>
  );
}
