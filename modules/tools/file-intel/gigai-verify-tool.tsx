"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { ImageToolProps } from "@/components/tool/types";
import { verifyFile, verifyUrl } from "@/lib/verify/engine";
import {
  CLASSIFICATION_META,
  RELIABILITY_LABEL,
  VERIFY_DISCLAIMER,
  type Signal,
  type VerificationResult,
} from "@/lib/verify/types";
import { formatSize } from "@/lib/file-intel/types";
import { computeEla } from "@/lib/verify/image";
import { buildVerifyReportPdf } from "@/lib/verify/report";
import { track } from "@/lib/analytics";

type Phase = "idle" | "working" | "done" | "error";

/**
 * GigAI Verify, evidence, not a verdict.
 *
 * The result screen leads with the assessment and immediately shows what it was
 * built from. Every evidence card carries its alternative explanation, because
 * the failure mode this product exists to avoid is someone reading "editing
 * software detected" as "this is fake".
 *
 * Nothing here is uploaded. Every module runs on the bytes in this tab.
 */
export default function GigaiVerifyTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [status, setStatus] = React.useState("");
  const [done, setDone] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<VerificationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [deep, setDeep] = React.useState(false);
  const [text, setText] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [savingPdf, setSavingPdf] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  // Analytics carries counts and outcomes ONLY. Never file names, extracted
  // text, metadata values or any part of the evidence. The whole product
  // promise is that the file stays on the device; telemetry must not leak it
  // through the side door.
  React.useEffect(() => {
    track("verify_opened");
  }, []);

  const run = React.useCallback(
    async (file: File, deepCheck: boolean) => {
      setPhase("working");
      setError(null);
      setResult(null);
      setDone([]);
      setFile(file);
      setStatus("Identifying content…");
      track("verify_analysis_started", { deep: deepCheck });
      try {
        const res = await verifyFile(file, {
          deep: deepCheck,
          onStage: (note, completed) => {
            setStatus(note);
            if (completed) setDone(completed);
          },
        });
        setResult(res);
        setPhase("done");
        track("verify_analysis_completed", {
          kind: res.file.kind,
          classification: res.classification,
          confidence: res.confidence,
          signals: res.signals.length,
          deep: deepCheck,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "The file could not be analyzed.");
        setPhase("error");
        track("verify_analysis_failed");
      }
    },
    [],
  );

  const runUrl = React.useCallback(async (target: string) => {
    setPhase("working");
    setError(null);
    setResult(null);
    setDone([]);
    setFile(null);
    setStatus("Fetching the page…");
    track("verify_analysis_started", { source: "url" });
    try {
      const res = await verifyUrl(target, {
        onStage: (note, completed) => {
          setStatus(note);
          if (completed) setDone(completed);
        },
      });
      setResult(res);
      setPhase("done");
      track("verify_analysis_completed", { kind: "url", classification: res.classification, confidence: res.confidence, signals: res.signals.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That URL could not be fetched.");
      setPhase("error");
      track("verify_analysis_failed", { source: "url" });
    }
  }, []);

  const reset = () => {
    setPhase("idle");
    setUrl("");
    setResult(null);
    setError(null);
    setText("");
    setCopied(false);
  };

  const copySummary = async () => {
    if (!result) return;
    const meta = CLASSIFICATION_META[result.classification];
    const lines = [
      `GigAI Verify: ${result.file.name}`,
      `Assessment: ${meta.label} (confidence: ${result.confidence})`,
      "",
      result.summary,
      "",
      "Signals:",
      ...result.signals.map((s) => ` • [${s.reliability}] ${s.title}: ${s.finding}`),
      "",
      `SHA-256: ${result.file.hash}`,
      `Analysed: ${result.analysedAt}`,
      "",
      VERIFY_DISCLAIMER,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      track("verify_report_exported", { format: "summary" });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ ...result, disclaimer: VERIFY_DISCLAIMER }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.file.name.replace(/\.[^.]+$/, "")}-verify.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    track("verify_json_exported");
  };

  /** PDF report: rendered in an isolated iframe (never inherits app styles). */
  const downloadPdf = async () => {
    if (!result) return;
    setSavingPdf(true);
    try {
      const blob = await buildVerifyReportPdf(result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.file.name.replace(/\.[^.]+$/, "")}-verify-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      track("verify_pdf_exported");
    } catch {
      setError("The PDF report could not be generated. The JSON export contains the same findings.");
    } finally {
      setSavingPdf(false);
    }
  };

  /** Re-run ELA with new controls, without re-analysing the whole file. */
  const recomputeEla = React.useCallback(
    async (amplify: number, quality: number) => {
      if (!file || !result) return;
      const next = await computeEla(file, { amplify, quality });
      if (next) setResult({ ...result, ela: next });
    },
    [file, result],
  );

  // Input mode tabs (user feedback 2026-08-22: the stacked "…or …or" layout
  // buried two of the three ways in. One segmented control, one panel.)
  const [mode, setMode] = React.useState<"file" | "text" | "url">("file");

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className={cn("flex items-center gap-2 self-start rounded-lg border px-2.5 py-1.5 text-xs font-medium", style.border, style.soft)}>
        <Icon name="Lock" size={13} className={style.text} />
        Analysed locally in your browser. Nothing is uploaded
      </p>

      {/* Same product, other surface - see config/constants.ts ROUTES.verify*. */}
      <p className="-mt-2 text-sm text-muted-foreground">
        Checking something you&apos;re looking at online rather than a file?{" "}
        <Link href="/verify/extension" className="font-medium text-primary underline underline-offset-4">
          GigAI Verify for Chrome
        </Link>{" "}
        checks the page you&apos;re on without leaving it.
      </p>

      {phase === "idle" ? (
        <>
          <div
            role="tablist"
            aria-label="What do you want to check?"
            className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1"
          >
            {(
              [
                { id: "file", icon: "FileSearch", label: "Check a file" },
                { id: "text", icon: "Type", label: "Paste text" },
                { id: "url", icon: "Link", label: "Check a page" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={mode === t.id}
                onClick={() => setMode(t.id)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors",
                  mode === t.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon name={t.icon} size={15} />
                <span className="max-sm:hidden">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ").pop()}</span>
              </button>
            ))}
          </div>

          {mode === "file" ? (
            <>
              <Dropzone accent={tool.accent} onFile={(f) => void run(f, deep)} />
              <label className="flex cursor-pointer items-center gap-2 self-start text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={deep}
                  onChange={(e) => setDeep(e.target.checked)}
                  className={cn("size-4 accent-current", style.text)}
                />
                Deep check <span className="text-xs">(adds Error Level Analysis for images)</span>
              </label>
            </>
          ) : null}

          {mode === "text" ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="verify-text" className="text-sm font-medium text-foreground">
                Paste an article, essay, email or report
              </label>
              <textarea
                id="verify-text"
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="The writing itself is measured - sentence rhythm, vocabulary spread, punctuation habits."
                className={cn(
                  "w-full resize-y rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  "border-border",
                )}
              />
              <Button
                type="button"
                disabled={text.trim().length === 0}
                onClick={() =>
                  void run(new File([text], "pasted-text.txt", { type: "text/plain" }), deep)
                }
                className="self-start"
              >
                <Icon name="Search" size={16} />
                Analyse text
              </Button>
            </div>
          ) : null}

          {mode === "url" ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="verify-url" className="text-sm font-medium text-foreground">
                Public page to read
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="verify-url"
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                    "border-border",
                  )}
                />
                <Button
                  type="button"
                  disabled={!/^https?:\/\/\S+\.\S+/.test(url.trim())}
                  onClick={() => void runUrl(url.trim())}
                >
                  <Icon name="Link" size={16} />
                  Analyse page
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Reads the page&apos;s text only: images on the page aren&apos;t fetched or
                inspected. To check an image, download it and drop the file in.
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      {phase === "working" ? (
        <div className="flex flex-col gap-3 py-6">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="LoaderCircle" size={16} className="animate-spin" />
            {status}
          </span>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {done.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-emerald-600 dark:text-emerald-400" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {phase === "error" && error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="TriangleAlert" size={16} className="text-amber-600 dark:text-amber-400" />
            We couldn&apos;t safely read this file
          </span>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={reset} className="self-start">
            Try something else
          </Button>
        </div>
      ) : null}

      {phase === "done" && result ? (
        <Report
          result={result}
          accent={tool.accent}
          copied={copied}
          savingPdf={savingPdf}
          onCopy={() => void copySummary()}
          onJson={downloadJson}
          onPdf={() => void downloadPdf()}
          onEla={recomputeEla}
          onReset={reset}
        />
      ) : null}
    </div>
  );
}

/* ── Input ────────────────────────────────────────────────────────────────── */

function Dropzone({ accent, onFile }: { accent: ImageToolProps["tool"]["accent"]; onFile: (f: File) => void }) {
  const style = accentStyle(accent);
  const [over, setOver] = React.useState(false);
  const id = React.useId();

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background",
        style.ring,
        over ? cn(style.border, style.soft) : "border-border hover:bg-muted/40",
      )}
    >
      <span className={cn("flex size-14 items-center justify-center rounded-2xl", style.soft)}>
        <Icon name="Search" size={26} className={style.text} />
      </span>
      <span className="text-base font-medium text-foreground">Drop anything here</span>
      <span className="max-w-sm text-sm text-muted-foreground">
        Images, PDFs, audio, video or documents. GigAI reads the file&apos;s own metadata,
        provenance and structure. It never uploads it.
      </span>
      <input id={id} type="file" className="sr-only" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
        e.target.value = "";
      }} />
    </label>
  );
}

/* ── Report ───────────────────────────────────────────────────────────────── */

function Report({
  result,
  accent,
  copied,
  savingPdf,
  onCopy,
  onJson,
  onPdf,
  onEla,
  onReset,
}: {
  result: VerificationResult;
  accent: ImageToolProps["tool"]["accent"];
  copied: boolean;
  savingPdf: boolean;
  onCopy: () => void;
  onJson: () => void;
  onPdf: () => void;
  onEla: (amplify: number, quality: number) => Promise<void>;
  onReset: () => void;
}) {
  const style = accentStyle(accent);
  const meta = CLASSIFICATION_META[result.classification];
  const failed = result.modulesRun.filter((m) => !m.ok);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Assessment first, never a metadata dump ─────────────────────── */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-5">
        <span className={cn("flex items-center gap-2 text-xl font-semibold", meta.text)}>
          <span className={cn("size-3 rounded-full", meta.dot)} aria-hidden="true" />
          {meta.label}
        </span>
        <span className="text-sm text-muted-foreground">
          Confidence: <strong className="font-medium text-foreground capitalize">{result.confidence}</strong>
        </span>
        <p className="mt-1 text-sm text-foreground">{result.summary}</p>
      </div>

      {/* ── Counts ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Pill>{result.signals.length} signals analyzed</Pill>
        <Pill>{result.supporting.length} supporting</Pill>
        <Pill>{result.neutral.length} neutral</Pill>
        {result.conflicting.length ? <Pill>{result.conflicting.length} conflicting</Pill> : null}
      </div>

      {failed.length ? (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
          <Icon name="Info" size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong className="font-medium text-foreground">Limited coverage.</strong>{" "}
            {failed.map((m) => m.reason ?? m.module).join(" ")}
          </span>
        </p>
      ) : null}

      {/* ── Evidence ────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Why GigAI thinks this</h3>
        {result.signals.map((s) => (
          <EvidenceCard key={s.id} signal={s} accent={accent} />
        ))}
      </section>

      {/* ── ELA ─────────────────────────────────────────────────────────── */}
      {result.ela ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">Error Level Analysis</h3>
          <ElaControls onChange={onEla} accent={accent} />
          <div className="grid gap-3 sm:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.ela.originalUrl} alt="Original" className="w-full rounded-lg border border-border" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.ela.elaUrl} alt="Error Level Analysis" className="w-full rounded-lg border border-border bg-black" />
          </div>
          <p className="text-sm text-muted-foreground">
            ELA highlights regions with different compression characteristics. Those
            differences come from editing, recompression, screenshots, exports and other
            entirely normal workflows. <strong className="font-medium text-foreground">ELA on its own is not evidence of manipulation.</strong>
          </p>
        </section>
      ) : null}

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      {result.timeline.length ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">What the file records</h3>
          <ol className="flex flex-col gap-2 border-l border-border pl-4">
            {result.timeline.map((t, i) => (
              <li key={i} className="relative text-sm">
                <span className={cn("absolute -left-[21px] top-1.5 size-2 rounded-full", style.solid)} aria-hidden="true" />
                <span className="font-medium text-foreground">{t.label}</span>
                {t.when ? <span className="text-muted-foreground"> - {t.when}</span> : null}
                {t.detail ? <div className="text-muted-foreground">{t.detail}</div> : null}
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">
            Built only from timestamps and software names the file actually contains. Nothing is inferred.
          </p>
        </section>
      ) : null}

      {/* ── Found ───────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">What we found</h3>
        <ul className="flex flex-col gap-1.5 text-sm">
          {result.found.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <Icon
                name={f.ok === true ? "Check" : f.ok === false ? "TriangleAlert" : "Minus"}
                size={15}
                className={cn(
                  "mt-0.5 shrink-0",
                  f.ok === true && "text-emerald-600 dark:text-emerald-400",
                  f.ok === false && "text-amber-600 dark:text-amber-400",
                  f.ok === null && "text-muted-foreground",
                )}
              />
              <span className="text-muted-foreground">{f.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Limitations ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4">
        <h3 className="text-sm font-semibold text-foreground">What we cannot know</h3>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {result.limitations.map((l) => (
            <li key={l} className="flex items-start gap-2">
              <Icon name="Minus" size={14} className="mt-0.5 shrink-0" />
              {l}
            </li>
          ))}
        </ul>
      </section>

      {/* ── File identity ───────────────────────────────────────────────── */}
      <details className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
        <summary className="cursor-pointer font-medium text-foreground">File identity &amp; technical details</summary>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <Fact label="Name" value={result.file.name} />
          <Fact label="Type" value={`${result.file.label} (${result.file.mime})`} />
          <Fact label="Size" value={formatSize(result.file.size)} />
          {result.file.width ? <Fact label="Dimensions" value={`${result.file.width} × ${result.file.height}`} /> : null}
          {result.file.pages ? <Fact label="Pages" value={String(result.file.pages)} /> : null}
          {result.file.duration ? <Fact label="Duration" value={`${Math.round(result.file.duration)}s`} /> : null}
          <Fact label="Analysed" value={new Date(result.analysedAt).toLocaleString()} />
        </dl>
        <div className="mt-2 flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">SHA-256</dt>
          <dd className="break-all font-mono text-xs text-foreground">{result.file.hash}</dd>
        </div>
      </details>

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <p className="rounded-xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
        <strong className="font-medium text-foreground">Important:</strong> {VERIFY_DISCLAIMER}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onCopy}>
          <Icon name={copied ? "Check" : "Copy"} size={16} />
          {copied ? "Copied" : "Copy summary"}
        </Button>
        <Button type="button" variant="outline" onClick={onPdf} disabled={savingPdf}>
          <Icon name={savingPdf ? "LoaderCircle" : "FileText"} size={16} className={savingPdf ? "animate-spin" : undefined} />
          {savingPdf ? "Building report…" : "PDF report"}
        </Button>
        <Button type="button" variant="outline" onClick={onJson}>
          <Icon name="Download" size={16} />
          Download JSON
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Verify something else
        </Button>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}

const DIRECTION_DOT: Record<Signal["direction"], string> = {
  ai: "bg-sky-500",
  human: "bg-emerald-500",
  edited: "bg-amber-500",
  neutral: "bg-muted-foreground/50",
};

function EvidenceCard({ signal, accent }: { signal: Signal; accent: ImageToolProps["tool"]["accent"] }) {
  const style = accentStyle(accent);
  return (
    <details className="rounded-xl border border-border bg-muted/20 p-3">
      <summary className="flex cursor-pointer items-start gap-2 text-sm">
        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DIRECTION_DOT[signal.direction])} aria-hidden="true" />
        <span className="flex min-w-0 flex-col">
          <span className="font-medium text-foreground">{signal.title}</span>
          <span className="text-muted-foreground">{signal.finding}</span>
        </span>
      </summary>

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", style.soft, style.text)}>
            {RELIABILITY_LABEL[signal.reliability]}
          </span>
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {signal.module}
          </span>
        </div>

        {signal.evidence ? (
          <dl className="grid gap-1 sm:grid-cols-2">
            {Object.entries(signal.evidence).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-xs text-muted-foreground">{k}:</dt>
                <dd className="break-words text-xs text-foreground">{String(v)}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {signal.alternative ? (
          <p className="text-muted-foreground">
            <strong className="font-medium text-foreground">Alternative explanation:</strong>{" "}
            {signal.alternative}
          </p>
        ) : null}
      </div>
    </details>
  );
}


/**
 * ELA controls. Amplification and re-encode quality are the two settings that
 * actually change what you see; brightness and contrast are folded into
 * amplification rather than offered separately, because three sliders that all
 * brighten the same image is a worse experience than one that does it properly.
 */
function ElaControls({
  onChange,
  accent,
}: {
  onChange: (amplify: number, quality: number) => Promise<void>;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  const [amplify, setAmplify] = React.useState(18);
  const [quality, setQuality] = React.useState(90);
  const [busy, setBusy] = React.useState(false);

  const apply = async (a: number, q: number) => {
    setBusy(true);
    try {
      await onChange(a, q / 100);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center justify-between">
            <span className="font-medium text-foreground">Amplification</span>
            <span className="tabular-nums text-muted-foreground">{amplify}×</span>
          </span>
          <input
            type="range"
            min={4}
            max={40}
            step={1}
            value={amplify}
            onChange={(e) => setAmplify(Number(e.target.value))}
            onPointerUp={() => void apply(amplify, quality)}
            onKeyUp={() => void apply(amplify, quality)}
            className={cn("w-full accent-current", style.text)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center justify-between">
            <span className="font-medium text-foreground">Re-encode quality</span>
            <span className="tabular-nums text-muted-foreground">{quality}%</span>
          </span>
          <input
            type="range"
            min={50}
            max={98}
            step={1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            onPointerUp={() => void apply(amplify, quality)}
            onKeyUp={() => void apply(amplify, quality)}
            className={cn("w-full accent-current", style.text)}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        {busy ? "Recomputing…" : "Higher amplification exaggerates small differences. Lower re-encode quality makes more of the image light up: neither setting makes a result more or less true."}
      </p>
    </div>
  );
}
