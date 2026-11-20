import { readFileSync } from "node:fs";

import { BROWSER_TOOLS } from "@/lib/agent/registry";
import { ENGINES_MANIFEST } from "@/lib/engines-manifest";

/**
 * /agent-catalog.json - the internal agent catalogue, one document holding
 * both halves of the toolset: the browser registry (declared in code) and
 * the server engines (read at BUILD TIME from backend/app/v1/engines.json, the
 * same manifest the API validates against). Static, so the catalogue a
 * client downloads always matches the code it ships with; the live server
 * list at /v1/tools remains the runtime authority for server execution.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const enginesPath = ENGINES_MANIFEST;
  const engines = JSON.parse(readFileSync(enginesPath, "utf8")) as Record<
    string,
    {
      name: string;
      category: string;
      description: string;
      input_formats: string[];
      output_formats: string[];
      multi_input?: boolean;
      no_input?: boolean;
      max_input_bytes: number;
      options_schema: Record<string, unknown>;
    }
  >;

  const server = Object.entries(engines).map(([id, spec]) => ({
    id,
    name: spec.name,
    category: spec.category,
    description: spec.description,
    runsIn: "server" as const,
    inputs: spec.options_schema,
    outputs: { kind: "files", description: `Files: ${spec.output_formats.join(", ")}` },
    constraints: {
      maxBytes: spec.max_input_bytes,
      formats: spec.input_formats,
      files: spec.no_input ? "none" : spec.multi_input ? "many" : "one",
    },
    costHint: "medium" as const,
  }));

  return new Response(
    JSON.stringify({ version: 1, browser: BROWSER_TOOLS, server }, null, 2),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}
