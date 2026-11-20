import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "API recipes - working job graphs",
  description:
    "Copyable job graphs for real pipelines: batch merge, rotate and extract text, web-ready images, QR batches, markdown to HTML.",
  canonical: "/developers/docs/recipes",
});

/** Every recipe here uses only engines that exist - run them as-is. */
export default function RecipesPage() {
  return (
    <DocsShell
      title="Recipes"
      lead="Working job graphs to copy. Each one runs as-is with your key - every operation in them exists today."
      current="/developers/docs/recipes"
    >
      <div>
        <DocH2 id="batch-merge">Merge many PDFs into one</DocH2>
        <P>Import each part, merge in order, export. Order of the input list is the page order.</P>
        <Code>{`{ "tasks": {
  "p1":    { "operation": "import/url", "url": "https://example.com/cover.pdf" },
  "p2":    { "operation": "import/url", "url": "https://example.com/body.pdf" },
  "p3":    { "operation": "import/url", "url": "https://example.com/appendix.pdf" },
  "merge": { "operation": "merge-pdf", "input": ["p1", "p2", "p3"] },
  "out":   { "operation": "export/url", "input": ["merge"] }
} }`}</Code>
      </div>

      <div>
        <DocH2 id="rotate-extract">Fix a sideways scan, then extract its text</DocH2>
        <P>Tasks chain by naming inputs - rotate feeds pdf-to-text, both outputs export.</P>
        <Code>{`{ "tasks": {
  "in":  { "operation": "import/base64", "file": "<base64>", "filename": "scan.pdf" },
  "fix": { "operation": "rotate-pdf", "input": ["in"], "angle": 90 },
  "txt": { "operation": "pdf-to-text", "input": ["fix"] },
  "out": { "operation": "export/url", "input": ["fix", "txt"] }
} }`}</Code>
      </div>

      <div>
        <DocH2 id="web-image">Web-ready image: resize, then fit under 200 KB</DocH2>
        <P>
          resize-image caps the pixel size, compress-image finds the best quality
          under target_kb - and says so honestly if the target is impossible.
        </P>
        <Code>{`{ "tasks": {
  "in":    { "operation": "import/url", "url": "https://example.com/photo.jpg" },
  "size":  { "operation": "resize-image", "input": ["in"], "width": 1600 },
  "small": { "operation": "compress-image", "input": ["size"], "target_kb": 200 },
  "out":   { "operation": "export/url", "input": ["small"] }
} }`}</Code>
      </div>

      <div>
        <DocH2 id="qr-batch">A batch of QR codes in one job</DocH2>
        <P>generate-qr takes no input file, so a job can mint many at once.</P>
        <Code>{`{ "tasks": {
  "qr-a": { "operation": "generate-qr", "text": "https://example.com/table-1" },
  "qr-b": { "operation": "generate-qr", "text": "https://example.com/table-2" },
  "qr-c": { "operation": "generate-qr", "text": "https://example.com/table-3" },
  "out":  { "operation": "export/url", "input": ["qr-a", "qr-b", "qr-c"] }
} }`}</Code>
      </div>

      <div>
        <DocH2 id="release-notes">Markdown release notes to a styled HTML page</DocH2>
        <Code>{`{ "tasks": {
  "md":   { "operation": "import/url", "url": "https://raw.githubusercontent.com/you/repo/main/CHANGELOG.md" },
  "html": { "operation": "markdown-to-html", "input": ["md"], "title": "Changelog" },
  "out":  { "operation": "export/url", "input": ["html"] }
} }`}</Code>
        <P>
          Want a pipeline these engines cannot do yet (video, docx, watermarks)? The
          catalog only grows with real engines -{" "}
          <Link href="/developers/docs/tools" className="text-primary hover:underline">
            check what exists
          </Link>{" "}
          before designing around it.
        </P>
      </div>
    </DocsShell>
  );
}
