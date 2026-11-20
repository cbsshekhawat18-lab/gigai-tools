import { type Engine, exampleValue } from "./engines";

/**
 * Code samples for the docs code panel, generated from the engine manifest
 * so they can never drift from what the API accepts. curl, Python and Node
 * ride the tested SDK surface; PHP and Go are plain-HTTP equivalents.
 */

export const LANGS = ["curl", "python", "node", "php", "go"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  curl: "curl", python: "Python", node: "Node", php: "PHP", go: "Go",
};

const BASE = "https://api.gigai.tools/v1";

function optPairs(engine: Engine): [string, string | number | boolean][] {
  const req = engine.options_schema.required ?? [];
  return Object.entries(engine.options_schema.properties ?? {})
    .filter(([name]) => req.includes(name))
    .map(([name, spec]) => [name, exampleValue(name, spec)]);
}

function jsonVal(v: string | number | boolean): string {
  return typeof v === "string" ? `"${v}"` : String(v);
}

/** The tasks object for a one-call use of this engine, as pretty JSON. */
export function taskGraphJson(engine: Engine, indent = "  "): string {
  const opts = optPairs(engine).map(([k, v]) => `, "${k}": ${jsonVal(v)}`).join("");
  const lines: string[] = [];
  if (!engine.no_input) {
    lines.push(`"in": { "operation": "import/url", "url": "https://example.com/input.${engine.input_formats[0]}" }`);
    if (engine.multi_input) {
      lines.push(`"in2": { "operation": "import/url", "url": "https://example.com/second.${engine.input_formats[0]}" }`);
    }
  }
  const input = engine.no_input ? "" : engine.multi_input ? `, "input": ["in", "in2"]` : `, "input": ["in"]`;
  lines.push(`"work": { "operation": "${engine.slug}"${input}${opts} }`);
  lines.push(`"out": { "operation": "export/url", "input": ["work"] }`);
  return lines.map((l) => indent + l).join(",\n");
}

function pyOpts(engine: Engine): string {
  const pairs = optPairs(engine);
  if (!pairs.length) return "";
  return `,\n    options={${pairs.map(([k, v]) => `"${k}": ${jsonVal(v)}`).join(", ")}}`;
}

function jsOpts(engine: Engine): string {
  const pairs = optPairs(engine);
  if (!pairs.length) return "";
  return `,\n  options: { ${pairs.map(([k, v]) => `${k}: ${jsonVal(v)}`).join(", ")} }`;
}

/** One-call sample: run this engine start to finish. */
export function runSample(engine: Engine, lang: Lang): string {
  const ext = engine.output_formats[0];
  const inFile = engine.no_input ? null : `input.${engine.input_formats[0]}`;
  switch (lang) {
    case "curl":
      return `curl -X POST ${BASE}/jobs \\
  -H "Authorization: Bearer $GIGAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "tasks": {
${taskGraphJson(engine, "    ")}
  } }'

# then poll until finished and follow the export URL:
curl ${BASE}/jobs/JOB_ID/wait -H "Authorization: Bearer $GIGAI_API_KEY"`;
    case "python":
      return `from gigai_tools import Client

client = Client()  # reads GIGAI_API_KEY
client.run("${engine.slug}"${inFile ? `,\n    files=[${engine.multi_input ? `"a.${engine.input_formats[0]}", "b.${engine.input_formats[0]}"` : `"${inFile}"`}]` : ""}${pyOpts(engine)},
    output="result.${ext}")`;
    case "node":
      return `import { Client } from "gigai-tools";

const client = new Client(); // reads GIGAI_API_KEY
await client.run("${engine.slug}", {${inFile ? `\n  files: [${engine.multi_input ? `"a.${engine.input_formats[0]}", "b.${engine.input_formats[0]}"` : `"${inFile}"`}],` : ""}${jsOpts(engine)}
  output: "result.${ext}",
});`;
    case "php":
      return `$payload = json_encode(["tasks" => json_decode('{
${taskGraphJson(engine, "  ")}
}', true)]);

$ch = curl_init("${BASE}/jobs");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("GIGAI_API_KEY"),
    "Content-Type: application/json",
  ],
]);
$job = json_decode(curl_exec($ch), true);
// poll ${BASE}/jobs/{$job["id"]}/wait until status is finished`;
    case "go":
      return `payload := ` + "`" + `{"tasks": {
${taskGraphJson(engine, "  ")}
}}` + "`" + `

req, _ := http.NewRequest("POST", "${BASE}/jobs", strings.NewReader(payload))
req.Header.Set("Authorization", "Bearer "+os.Getenv("GIGAI_API_KEY"))
req.Header.Set("Content-Type", "application/json")
resp, err := http.DefaultClient.Do(req)
// decode the job id, then poll ${BASE}/jobs/{id}/wait until finished`;
  }
}

/** Realistic response body for a finished one-call job of this engine. */
export function runResponse(engine: Engine): string {
  const ext = engine.output_formats[0];
  return `{
  "id": "job_27b562f72d84a9a52324ced8",
  "status": "finished",
  "retention_s": 3600,
  "tasks": [
    { "name": "work", "operation": "${engine.slug}",
      "status": "finished", "duration_ms": 47 },
    { "name": "out", "operation": "export/url", "status": "finished",
      "result": { "files": [
        { "id": "file_63930500160eadd44dee99f1",
          "filename": "result.${ext}", "size": 10420,
          "url": "${BASE}/files/file_639.../download?e=...&s=..." }
      ]}}
  ]
}`;
}

/** Generic sample for a non-tool endpoint. */
export function endpointSample(lang: Lang, method: string, path: string, body?: string): string {
  switch (lang) {
    case "curl":
      return `curl${method === "GET" ? "" : ` -X ${method}`} ${BASE}${path} \\
  -H "Authorization: Bearer $GIGAI_API_KEY"${body ? ` \\
  -H "Content-Type: application/json" \\
  -d '${body}'` : ""}`;
    case "python":
      return `import json, os, urllib.request

req = urllib.request.Request(
    "${BASE}${path}",${body ? `\n    data=json.dumps(${body}).encode(),` : ""}
    method="${method}",
    headers={"Authorization": "Bearer " + os.environ["GIGAI_API_KEY"]${body ? `,\n             "Content-Type": "application/json"` : ""}},
)
print(urllib.request.urlopen(req).read().decode())`;
    case "node":
      return `const resp = await fetch("${BASE}${path}", {
  method: "${method}",
  headers: { authorization: \`Bearer \${process.env.GIGAI_API_KEY}\`${body ? `,\n             "content-type": "application/json"` : ""} },${body ? `\n  body: JSON.stringify(${body}),` : ""}
});
console.log(await resp.json());`;
    case "php":
      return `$ch = curl_init("${BASE}${path}");
curl_setopt_array($ch, [
  CURLOPT_CUSTOMREQUEST => "${method}",${body ? `\n  CURLOPT_POSTFIELDS => '${body}',` : ""}
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ["Authorization: Bearer " . getenv("GIGAI_API_KEY")${body ? `, "Content-Type: application/json"` : ""}],
]);
echo curl_exec($ch);`;
    case "go":
      return `req, _ := http.NewRequest("${method}", "${BASE}${path}", ${body ? `strings.NewReader(\`${body}\`)` : "nil"})
req.Header.Set("Authorization", "Bearer "+os.Getenv("GIGAI_API_KEY"))${body ? `\nreq.Header.Set("Content-Type", "application/json")` : ""}
resp, err := http.DefaultClient.Do(req)`;
  }
}
