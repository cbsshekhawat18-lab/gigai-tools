"use client";

/**
 * Project-context panel: the user adds spec docs and previous-ticket
 * exports; everything parses, chunks and embeds in this browser and stays
 * in IndexedDB. Findings can then be matched against it (enrich.ts).
 */

import * as React from "react";

import { allChunks, clearContext, ingestFile } from "@/lib/video-work/context";

export function ContextPanel({ onChanged }: { onChanged?: () => void }) {
  const [files, setFiles] = React.useState<{ file: string; kind: string; chunks: number }[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [kind, setKind] = React.useState<"spec" | "tickets">("spec");

  const refresh = React.useCallback(async () => {
    const chunks = await allChunks();
    const byFile = new Map<string, { file: string; kind: string; chunks: number }>();
    for (const c of chunks) {
      const row = byFile.get(c.file) ?? { file: c.file, kind: c.kind, chunks: 0 };
      row.chunks++;
      byFile.set(c.file, row);
    }
    setFiles([...byFile.values()]);
  }, []);
  React.useEffect(() => void refresh(), [refresh]);

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    setError(null);
    for (const file of Array.from(list)) {
      setBusy(`Reading ${file.name}...`);
      try {
        await ingestFile(file, kind, (done, total) => setBusy(`${file.name}: embedding ${done}/${total}`));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read that file.");
      }
    }
    setBusy(null);
    await refresh();
    onChanged?.();
  };

  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Project context (optional)</h3>
        <span className="text-[11px] text-muted-foreground">
          Processed on this device - files and embeddings never leave your browser
        </span>
      </div>
      <p className="mt-1 max-w-[70ch] text-xs text-muted-foreground">
        Add the project spec, docs, or a previous ticket export (PDF, MD, TXT, CSV,
        JSON - up to 10 files). Generated tickets then reuse the client&apos;s own
        component names, cite the spec section, and flag duplicates of existing
        tickets. First use downloads a 23 MB language model, cached after.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-sm text-foreground">
          These files are
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "spec" | "tickets")}
            className="ml-2 h-9 rounded border border-border bg-background px-2 text-sm"
          >
            <option value="spec">specs / docs</option>
            <option value="tickets">previous tickets</option>
          </select>
        </label>
        <input type="file" multiple accept=".pdf,.md,.txt,.csv,.json" onChange={(e) => void add(e.target.files)}
          className="text-sm text-muted-foreground" />
        {files.length ? (
          <button type="button"
            onClick={() => void clearContext().then(refresh).then(() => onChanged?.())}
            className="text-xs text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        ) : null}
      </div>
      {busy ? <p className="mt-2 text-xs text-muted-foreground">{busy}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {files.length ? (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {files.map((f) => (
            <li key={f.file}>
              <span className="font-mono text-foreground">{f.file}</span> · {f.kind} · {f.chunks} chunks
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
