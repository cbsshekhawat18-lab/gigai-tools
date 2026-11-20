import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "SDKs - Python, Node and the gigai CLI",
  description:
    "Official Python and Node clients for the GigAI Tools API, plus the gigai command line. Zero dependencies, one-call convenience, typed errors.",
  canonical: "/developers/docs/sdks",
});

export default function DocsSdks() {
  return (
    <DocsShell
      title="SDKs"
      lead="Both clients have zero dependencies and wrap the whole import, run, export, download loop in one call. Source is public on GitHub."
      current="/developers/docs/sdks"
    >
      <div>
        <DocH2 id="install">Install</DocH2>
        <Code label="python">{`pip install gigai-tools`}</Code>
        <Code label="node">{`npm install gigai-tools`}</Code>
        <P>
          Set your key once as GIGAI_API_KEY. Both clients read it, or take it as a
          constructor argument.
        </P>
      </div>

      <div>
        <DocH2 id="python">Python</DocH2>
        <Code>{`from gigai_tools import Client, GigaiError

client = Client()  # reads GIGAI_API_KEY

# One call: import, run, export, download
client.run("merge-pdf", files=["a.pdf", "b.pdf"], output="merged.pdf")
client.run("compress-image", files=["photo.jpg"],
           options={"target_kb": 200}, output="small.jpg")
client.run("generate-qr", options={"text": "https://example.com"},
           output="qr.png")

# Files can be URLs - the server fetches them
client.run("pdf-to-text", files=["https://example.com/report.pdf"],
           output="report.txt")

try:
    client.run("split-pdf", files=["doc.pdf"], options={"pages": "99"})
except GigaiError as e:
    print(e.code, e.message, e.param)  # invalid_option ...`}</Code>
        <P>
          The lower-level surface mirrors the HTTP API: create_job, wait, cancel,
          jobs, file, delete_file, download, webhooks. Python 3.9+, stdlib only.
        </P>
      </div>

      <div>
        <DocH2 id="node">Node</DocH2>
        <Code>{`import { Client, GigaiError } from "gigai-tools";

const client = new Client(); // reads GIGAI_API_KEY

await client.run("merge-pdf", { files: ["a.pdf", "b.pdf"], output: "merged.pdf" });
await client.run("generate-qr", { options: { text: "https://example.com" }, output: "qr.png" });

const job = await client.createJob({
  in:  { operation: "import/url", url: "https://example.com/report.pdf" },
  txt: { operation: "pdf-to-text", input: ["in"] },
  out: { operation: "export/url", input: ["txt"] },
});
const done = await client.wait(job.id);`}</Code>
        <P>Node 18+, no dependencies, ESM.</P>
      </div>

      <div>
        <DocH2 id="cli">The gigai CLI</DocH2>
        <P>The Node package installs a gigai command:</P>
        <Code>{`export GIGAI_API_KEY=gk_live_...

gigai tools
gigai run merge-pdf a.pdf b.pdf -o merged.pdf
gigai run compress-image photo.jpg --target_kb 200 -o small.jpg
gigai run generate-qr --text "https://example.com" -o qr.png
gigai jobs
gigai cancel job_abc123`}</Code>
      </div>

      <div>
        <DocH2 id="base">Pointing at a different host</DocH2>
        <P>
          Both clients honor GIGAI_API_BASE, and they rewrite signed result URLs onto
          that base. A tunnel, a staging box, or the api hostname before DNS settles
          all work without code changes.
        </P>
      </div>
    </DocsShell>
  );
}
