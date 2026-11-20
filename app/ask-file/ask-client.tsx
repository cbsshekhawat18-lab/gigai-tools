"use client";

/**
 * Ask Your File UI: split view (document left, conversation right), a live
 * network indicator wired to a real fetch/XHR observer, extractive answers
 * with clickable citations, and a deterministic Act menu. The page states
 * plainly that Lite mode quotes the file rather than generating prose.
 */

import * as React from "react";

import {
  actPlans, ask, deleteModel, forgetFile, ingest, type Answer, type IngestedFile,
} from "@/lib/ask-file/engine";
import { useNetworkWatch } from "@/lib/use-network-watch";

interface Turn {
  question: string;
  answers: Answer[];
}

export function AskClient() {
  const [entry, setEntry] = React.useState<IngestedFile | null>(null);
  const [sourceFile, setSourceFile] = React.useState<File | null>(null);
  const [stage, setStage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [asking, setAsking] = React.useState(false);
  const [actNote, setActNote] = React.useState<string | null>(null);
  const [net, armNet] = useNetworkWatch();
  const chunkRefs = React.useRef<Map<number, HTMLElement>>(new Map());

  const open = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setTurns([]);
    setEntry(null);
    setSourceFile(file);
    try {
      const result = await ingest(file, (s, done, total) =>
        setStage(total ? `${s} ${done}/${total}` : s));
      setEntry(result);
      setStage(null);
      armNet(); // from here on, any network request turns the badge red
    } catch (err) {
      setStage(null);
      setError(err instanceof Error ? err.message : "Could not read that file.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !question.trim()) return;
    setAsking(true);
    const answers = await ask(entry, question.trim());
    setTurns((t) => [...t, { question: question.trim(), answers }]);
    setQuestion("");
    setAsking(false);
  };

  const jump = (chunkId: number) => {
    chunkRefs.current.get(chunkId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const runAct = async (action: string) => {
    if (!entry || !sourceFile) return;
    const plan = actPlans().find((p) => p.action === action)!;
    setActNote(`Running: ${plan.description}...`);
    setError(null);
    try {
      const out = await plan.run(entry, sourceFile);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(out.blob);
      a.download = out.filename;
      a.click();
      URL.revokeObjectURL(a.href);
      setActNote(out.note);
    } catch (err) {
      setActNote(null);
      setError(err instanceof Error ? err.message : "The action failed.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".pdf,.md,.txt,.csv,.json"
          onChange={(e) => void open(e.target.files?.[0])}
          className="text-sm text-muted-foreground" />
        {entry ? (
          <>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
              net.requests === 0 ? "bg-emerald-600/10 text-emerald-700" : "bg-red-600/10 text-red-700"}`}>
              {net.requests === 0 ? "0 bytes sent since indexing" : `${net.requests} network requests detected`}
            </span>
            <button type="button"
              onClick={() => void forgetFile(entry.hash).then(() => { setEntry(null); setTurns([]); })}
              className="text-xs text-muted-foreground hover:text-foreground">
              Forget this file
            </button>
          </>
        ) : null}
        <button type="button"
          onClick={() => void deleteModel().then((gone) =>
            setStage(gone ? "Downloaded model deleted from this browser - the next question re-downloads it (23 MB)." : "No downloaded model found."))}
          className="text-xs text-muted-foreground hover:text-foreground">
          Delete downloaded model
        </button>
      </div>
      {stage ? <p className="mt-3 text-sm text-muted-foreground">{stage}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {entry ? (
        <div className="mt-6 gap-6 lg:grid lg:grid-cols-2">
          {/* Document view */}
          <div className="max-h-[70vh] overflow-y-auto rounded border border-border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {entry.name} · {entry.chunks.length} sections
            </p>
            {entry.chunks.map((c) => (
              <div key={c.id}
                ref={(el) => { if (el) chunkRefs.current.set(c.id, el); }}
                className="mb-4 border-l-2 border-transparent pl-3 target:border-primary">
                <p className="text-[11px] font-semibold text-muted-foreground">[{c.where}]</p>
                <p className="whitespace-pre-wrap text-sm text-foreground/90">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Ask + Act */}
          <div className="mt-6 lg:mt-0">
            <form onSubmit={(e) => void submit(e)} className="flex gap-2">
              <input value={question} onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about this file..."
                className="h-11 grow rounded border border-border bg-background px-3 text-sm" />
              <button type="submit" disabled={asking}
                className="h-11 rounded bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                Ask
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {actPlans().map((p) => (
                <button key={p.action} type="button" onClick={() => void runAct(p.action)}
                  className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  title={p.description}>
                  {p.description}
                </button>
              ))}
            </div>
            {actNote ? <p className="mt-2 text-xs text-muted-foreground">{actNote}</p> : null}

            <div className="mt-4 max-h-[52vh] space-y-4 overflow-y-auto">
              {turns.map((t, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-foreground">{t.question}</p>
                  {t.answers.map((a) => (
                    <blockquote key={a.chunkId}
                      className="mt-2 border-l-2 border-primary/50 pl-3 text-sm text-muted-foreground">
                      &ldquo;{a.passage}&rdquo;{" "}
                      <button type="button" onClick={() => jump(a.chunkId)}
                        className="font-mono text-xs text-primary hover:underline">
                        [{a.where}]
                      </button>
                    </blockquote>
                  ))}
                  {!t.answers.length ? (
                    <p className="mt-1 text-sm text-muted-foreground">Nothing in the file matches that.</p>
                  ) : null}
                </div>
              ))}
              {!turns.length ? (
                <p className="text-sm text-muted-foreground">
                  Answers are passages quoted from your file, ranked by on-device
                  semantic search, each with a citation you can click. Nothing is
                  generated, so nothing can be made up.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
