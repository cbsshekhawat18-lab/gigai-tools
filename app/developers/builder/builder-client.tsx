"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Request builder: pick a tool, fill its options, attach files, run the
 * real job against /v1 (same origin) and follow it live. The form is built
 * from the live catalog's option schemas - it cannot offer an option the
 * API would reject. The key stays in localStorage on this device.
 */

type Tool = {
  slug: string;
  name: string;
  description: string;
  input_formats: string[];
  multi_input: boolean;
  no_input: boolean;
  options_schema: {
    properties?: Record<string, { type?: string; enum?: (string | number)[]; minimum?: number; maximum?: number }>;
    required?: string[];
  };
};

const KEY_STORE = "gigai-builder-key";
const INLINE_MAX = 24 * 1024 * 1024;

async function toBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function BuilderClient() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [slug, setSlug] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [options, setOptions] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [job, setJob] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY_STORE);
      if (saved) setApiKey(saved);
    } catch { /* private mode */ }
    fetch("/v1/tools")
      .then((r) => r.json())
      .then((d) => {
        setTools(d.tools);
        const fromHash = window.location.hash.slice(1);
        setSlug(d.tools.some((t: Tool) => t.slug === fromHash) ? fromHash : d.tools[0]?.slug ?? "");
      })
      .catch(() => setMessage("Could not load the tool catalog."));
  }, []);

  const tool = useMemo(() => tools.find((t) => t.slug === slug), [tools, slug]);

  const run = async () => {
    if (!tool || !apiKey.startsWith("gk_")) {
      setMessage("Paste an API key (gk_live_... or gk_test_...) from the dashboard.");
      return;
    }
    try {
      localStorage.setItem(KEY_STORE, apiKey);
    } catch { /* private mode */ }
    setState("running");
    setMessage("");
    setJob(null);
    try {
      const tasks: Record<string, Record<string, unknown>> = {};
      const names: string[] = [];
      if (!tool.no_input) {
        if (!files.length) throw new Error(`Attach ${tool.multi_input ? "at least one file" : "a file"} first.`);
        for (let i = 0; i < files.length; i++) {
          const f = files[i]!;
          if (f.size > INLINE_MAX) throw new Error(`'${f.name}' is over the 24 MB inline limit.`);
          tasks[`in${i}`] = {
            operation: "import/base64",
            file: await toBase64(f),
            filename: f.name,
          };
          names.push(`in${i}`);
        }
      }
      const opts: Record<string, unknown> = {};
      for (const [name, spec] of Object.entries(tool.options_schema.properties ?? {})) {
        const raw = options[name];
        if (raw === undefined || raw === "") continue;
        opts[name] = spec.type === "integer" ? Number(raw) : spec.type === "boolean" ? raw === "true" : raw;
      }
      tasks.work = { operation: tool.slug, ...(names.length ? { input: names } : {}), ...opts };
      tasks.out = { operation: "export/url", input: ["work"] };

      const created = await fetch("/v1/jobs", {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ tag: "request-builder", retention_s: 900, tasks }),
      }).then((r) => r.json());
      const createdId = (created as { id?: string }).id;
      if (!createdId) {
        const err = (created.detail ?? created).error ?? {};
        throw new Error(`${err.code ?? "error"}: ${err.message ?? "The request failed."}`);
      }
      let current = created;
      while (!["finished", "error", "cancelled"].includes(current.status)) {
        current = await fetch(`/v1/jobs/${createdId}/wait`, {
          headers: { authorization: `Bearer ${apiKey}` },
        }).then((r) => r.json());
      }
      setJob(current);
      setState(current.status === "finished" ? "done" : "error");
      if (current.status !== "finished") {
        const failed = (current.tasks as { error?: { code: string; message: string } }[]).find((t) => t.error);
        setMessage(failed?.error ? `${failed.error.code}: ${failed.error.message}` : "The job did not finish.");
      }
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something failed.");
    }
  };

  const exportTask = job
    ? (job.tasks as { operation: string; result?: { files: { id: string; filename: string; size: number; url: string }[] } }[])
        .find((t) => t.operation === "export/url")
    : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-foreground">Tool</span>
          <select
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setOptions({});
              setFiles([]);
              setJob(null);
              setState("idle");
            }}
            className="mt-1 w-full rounded border border-border bg-background p-2 text-sm text-foreground"
          >
            {tools.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-foreground">API key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gk_live_... (stays on this device)"
            className="mt-1 w-full rounded border border-border bg-background p-2 font-mono text-sm text-foreground"
          />
        </label>
      </div>

      {tool ? (
        <>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
          {!tool.no_input ? (
            <label className="block text-sm">
              <span className="font-semibold text-foreground">
                {tool.multi_input ? "Files" : "File"} ({tool.input_formats.join(", ")}, up to 24 MB inline)
              </span>
              <input
                type="file"
                multiple={tool.multi_input}
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="mt-1 block w-full text-sm text-muted-foreground"
              />
            </label>
          ) : null}
          {Object.entries(tool.options_schema.properties ?? {}).length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(tool.options_schema.properties ?? {}).map(([name, spec]) => (
                <label key={name} className="block text-sm">
                  <span className="font-mono text-foreground">
                    {name}
                    {(tool.options_schema.required ?? []).includes(name) ? " *" : ""}
                  </span>
                  {spec.enum ? (
                    <select
                      value={options[name] ?? ""}
                      onChange={(e) => setOptions({ ...options, [name]: e.target.value })}
                      className="mt-1 w-full rounded border border-border bg-background p-2 text-sm text-foreground"
                    >
                      <option value="">(default)</option>
                      {spec.enum.map((v) => (
                        <option key={String(v)} value={String(v)}>{String(v)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={options[name] ?? ""}
                      onChange={(e) => setOptions({ ...options, [name]: e.target.value })}
                      placeholder={spec.type === "integer" ? `${spec.minimum ?? 0}..${spec.maximum ?? ""}` : spec.type}
                      className="mt-1 w-full rounded border border-border bg-background p-2 text-sm text-foreground"
                    />
                  )}
                </label>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={run}
            disabled={state === "running"}
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {state === "running" ? "Running..." : "Run it"}
          </button>
        </>
      ) : null}

      {message ? <p className="text-sm text-red-600">{message}</p> : null}

      {state === "done" && exportTask?.result ? (
        <div className="rounded border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Finished</p>
          <ul className="mt-2 space-y-1 text-sm">
            {exportTask.result.files.map((f) => (
              <li key={f.id}>
                <a href={f.url} className="text-primary hover:underline" rel="noopener">
                  {f.filename}
                </a>
                <span className="text-muted-foreground"> - {f.size} bytes, link lives 15 minutes</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {job ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Raw job JSON</summary>
          <pre className="mt-2 overflow-x-auto rounded border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
            {JSON.stringify(job, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
