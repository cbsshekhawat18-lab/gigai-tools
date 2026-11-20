import { readFileSync } from "node:fs";

import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs-shell";
import { ENGINES_MANIFEST } from "@/lib/engines-manifest";

export const metadata: Metadata = buildMetadata({
  title: "API tool catalog - every runnable engine",
  description:
    "The GigAI API tool reference, generated from the same manifest the server validates against. Every option, format and limit for every engine.",
  canonical: "/developers/docs/tools",
});

/**
 * Generated at build time from backend/app/v1/engines.json - the manifest the
 * gateway validates against and the worker dispatches from. One source, so
 * this page cannot describe an option the API would reject or list a tool
 * the worker cannot run.
 */

type OptionSpec = {
  type?: string;
  enum?: (string | number)[];
  minimum?: number;
  maximum?: number;
};

type Engine = {
  name: string;
  category: string;
  description: string;
  input_formats: string[];
  output_formats: string[];
  multi_input?: boolean;
  no_input?: boolean;
  max_input_bytes: number;
  options_schema: { properties?: Record<string, OptionSpec>; required?: string[] };
};

function loadEngines(): [string, Engine][] {
  const file = ENGINES_MANIFEST;
  return Object.entries(JSON.parse(readFileSync(file, "utf8")) as Record<string, Engine>);
}

function optionLine(name: string, spec: OptionSpec, required: string[]): string {
  const parts = [spec.type ?? "value"];
  if (spec.enum) parts.push(`one of ${spec.enum.join(", ")}`);
  if (spec.minimum !== undefined || spec.maximum !== undefined)
    parts.push(`${spec.minimum ?? ""}..${spec.maximum ?? ""}`);
  if (required.includes(name)) parts.push("required");
  return parts.join(", ");
}

function mb(bytes: number): string {
  return `${Math.round(bytes / 1048576)} MB`;
}

export default function DocsTools() {
  const engines = loadEngines();
  return (
    <DocsShell
      title="Tool catalog"
      lead="Generated from the same manifest the server validates against, so this page and the API cannot disagree. GET /v1/tools returns it as JSON."
      current="/developers/docs/tools"
    >
      {engines.map(([slug, engine]) => {
        const options = Object.entries(engine.options_schema.properties ?? {});
        const required = engine.options_schema.required ?? [];
        return (
          <div key={slug} className="border-b border-border pb-8 last:border-b-0">
            <DocH2 id={slug}>
              {engine.name}{" "}
              <code className="ml-2 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs font-normal text-muted-foreground">
                {slug}
              </code>
            </DocH2>
            <P>{engine.description}</P>
            <p className="mt-2 text-xs text-muted-foreground">
              {engine.no_input
                ? "No input file."
                : `In: ${engine.input_formats.join(", ")} (up to ${mb(engine.max_input_bytes)}${engine.multi_input ? ", several files" : ", one file"}).`}{" "}
              Out: {engine.output_formats.join(", ")}.
            </p>
            {options.length > 0 ? (
              <ul className="mt-3 max-w-[70ch] space-y-1 text-sm text-muted-foreground">
                {options.map(([name, spec]) => (
                  <li key={name}>
                    <code className="font-mono text-foreground">{name}</code>
                    {" - "}
                    {optionLine(name, spec, required)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No options.</p>
            )}
            <Code label="task">{`"work": { "operation": "${slug}"${engine.no_input ? "" : `, "input": [${engine.multi_input ? '"in1", "in2"' : '"in1"'}]`}${options
              .filter(([name]) => required.includes(name))
              .map(([name, spec]) => `, "${name}": ${spec.type === "string" ? '"..."' : spec.enum ? String(spec.enum[0]) : "1"}`)
              .join("")} }`}</Code>
          </div>
        );
      })}
    </DocsShell>
  );
}
