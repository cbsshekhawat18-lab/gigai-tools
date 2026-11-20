import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodePanel } from "@/components/devdocs/code-panel";
import { buildMetadata } from "@/lib/seo";
import {
  ENGINE_TO_SITE_TOOL, getEngine, getEngines, type OptionSpec,
} from "@/lib/devdocs/engines";
import { LANGS, LANG_LABELS, runResponse, runSample } from "@/lib/devdocs/samples";
import { Code, DocH2, DocsShell, P } from "../../docs/docs-shell";

/**
 * One docs page per engine, generated from the manifest. Adding an engine
 * to engines.json creates this page, its nav entry, its search entries and
 * its code samples with no manual step.
 */

export function generateStaticParams() {
  return getEngines().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const engine = getEngine((await params).slug);
  if (!engine) return {};
  return buildMetadata({
    title: `${engine.name} API - ${engine.slug}`,
    description: `${engine.description} Free API, 1,000 tasks a month.`,
    canonical: `/developers/tools/${engine.slug}`,
  });
}

function optionLine(name: string, spec: OptionSpec, required: string[]): string {
  const parts = [spec.type ?? "value"];
  if (spec.enum) parts.push(`one of ${spec.enum.join(", ")}`);
  if (spec.minimum !== undefined || spec.maximum !== undefined)
    parts.push(`${spec.minimum ?? ""}..${spec.maximum ?? ""}`);
  if (required.includes(name)) parts.push("required");
  return parts.join(", ");
}

export default async function EngineDocsPage({ params }: { params: Promise<{ slug: string }> }) {
  const engine = getEngine((await params).slug);
  if (!engine) notFound();
  const options = Object.entries(engine.options_schema.properties ?? {});
  const required = engine.options_schema.required ?? [];
  const siteTool = ENGINE_TO_SITE_TOOL[engine.slug];
  const request: Record<string, string> = {};
  for (const lang of LANGS) request[lang] = runSample(engine, lang);
  const related = getEngines()
    .filter((e) => e.category === engine.category && e.slug !== engine.slug)
    .slice(0, 4);

  return (
    <DocsShell
      title={`${engine.name} API`}
      lead={engine.description}
      current={`/developers/tools/${engine.slug}`}
      panel={
        <CodePanel
          samples={{
            langs: LANGS.map((id) => ({ id, label: LANG_LABELS[id] })),
            request,
            response: runResponse(engine),
            responseLabel: "Finished job",
          }}
        />
      }
    >
      <div>
        <p className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded bg-blue-600/10 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">POST</span>
          <code className="font-mono text-[13px] text-foreground">https://api.gigai.tools/v1/jobs</code>
          <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">Async</span>
        </p>
        <P>
          Runs as the <code className="font-mono">{engine.slug}</code> operation inside a
          job. Needs a key with the jobs:write scope.{" "}
          {siteTool ? (
            <Link href={`/${siteTool}`} className="text-primary hover:underline">
              Try it in the browser
            </Link>
          ) : null}
        </P>
      </div>

      <div>
        <DocH2 id="options">Options</DocH2>
        {options.length ? (
          <ul className="mt-3 max-w-[70ch] space-y-1.5 text-sm text-muted-foreground">
            {options.map(([name, spec]) => (
              <li key={name}>
                <code className="font-mono text-foreground">{name}</code>
                {" - "}
                {optionLine(name, spec, required)}
              </li>
            ))}
          </ul>
        ) : (
          <P>No options - the input file is everything.</P>
        )}
      </div>

      <div>
        <DocH2 id="limits">Limits</DocH2>
        <ul className="mt-3 max-w-[70ch] list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {engine.no_input ? (
            <li>No input file - the payload comes from the options.</li>
          ) : (
            <>
              <li>Input: {engine.input_formats.join(", ")} ({engine.multi_input ? "several files" : "one file"}, checked by content, never by extension).</li>
              <li>Max input size: {Math.round(engine.max_input_bytes / 1048576)} MB.</li>
            </>
          )}
          <li>Output: {engine.output_formats.join(", ")}.</li>
          <li>Time budget: {engine.timeout_s} seconds, then the task fails with the timeout code.</li>
          <li>Engine: {engine.engine}.</li>
        </ul>
      </div>

      <div>
        <DocH2 id="in-a-job">Inside a bigger job</DocH2>
        <P>
          Chain it: any task can consume this one&apos;s output by naming it in
          input. The{" "}
          <Link href="/developers/docs/recipes" className="text-primary hover:underline">
            recipes
          </Link>{" "}
          show working pipelines.
        </P>
        <Code label="as one task in a graph">{`"step": { "operation": "${engine.slug}"${engine.no_input ? "" : `, "input": ["previous-task"]`}${required.length ? `, ${required.map((r) => `"${r}": ...`).join(", ")}` : ""} }`}</Code>
      </div>

      <div>
        <DocH2 id="errors">Errors this tool returns</DocH2>
        <P>
          <Link href="/developers/errors#invalid_input" className="text-primary hover:underline">invalid_input</Link>
          {", "}
          <Link href="/developers/errors#invalid_option" className="text-primary hover:underline">invalid_option</Link>
          {", "}
          <Link href="/developers/errors#file_too_large" className="text-primary hover:underline">file_too_large</Link>
          {", "}
          <Link href="/developers/errors#timeout" className="text-primary hover:underline">timeout</Link>
          {engine.slug === "merge-pdf" ? (
            <>
              {", "}
              <Link href="/developers/errors#needs_two_inputs" className="text-primary hover:underline">needs_two_inputs</Link>
            </>
          ) : null}
          {engine.slug === "compress-image" ? (
            <>
              {", "}
              <Link href="/developers/errors#target_unreachable" className="text-primary hover:underline">target_unreachable</Link>
            </>
          ) : null}
          . The full list with fixes is on the{" "}
          <Link href="/developers/errors" className="text-primary hover:underline">errors page</Link>.
        </P>
      </div>

      {related.length ? (
        <div>
          <DocH2 id="related">Related tools</DocH2>
          <p className="mt-2 text-sm">
            {related.map((r, i) => (
              <span key={r.slug}>
                {i > 0 ? " · " : ""}
                <Link href={`/developers/tools/${r.slug}`} className="text-primary hover:underline">
                  {r.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      ) : null}
    </DocsShell>
  );
}
