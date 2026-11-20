"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { useFileDrop } from "@/lib/workspace/use-file-drop";
import { analyzeFile, formatBytes } from "@/lib/assist/analyze";
import { buildHealthReport } from "@/lib/assist/health";
import { FAMILY_ICON, FAMILY_LABEL } from "@/lib/assist/kinds";
import { toAssistAsset } from "@/lib/assist/runner";
import { addAssist, getAssists, subscribeAssists, togglePinAssist, clearAssists } from "@/lib/assist/history";
import type {
  AssistHistoryEntry,
  AssistPlan,
  AssistRunResult,
  FileAnalysis,
  HealthCheck,
  HealthReport,
} from "@/lib/assist/types";

/**
 * GigAI SMART ASSIST: the orchestration surface.
 *
 * One upload area + one plain-language box (a ChatGPT-like feel, STEP 9). It
 * ANALYSES the file on-device (STEP 1), builds a FILE HEALTH REPORT (STEP 6),
 * understands the GOAL and builds a PLAN over EXISTING tools/engines (STEPS
 * 2–4), RUNS it in the browser, and RECOMMENDS next steps (STEP 5), all with
 * local WORKFLOW HISTORY (STEP 7). No file ever leaves the browser (STEP 11);
 * no "AI" language is shown (STEP 10).
 *
 * Reuse, not rewrite: analysis/plan/runner live in `lib/assist/*`, which lean on
 * the existing intent engine (`lib/assistant`) and engines (`lib/image`,
 * `lib/pdf`). Heavy pieces (registry via the planner, WASM codecs) load only
 * when the user acts; the whole component is mounted as an
 * `ssr:false` island so nothing here touches the initial page bundle.
 */

type Phase = "idle" | "analyzing" | "ready" | "planning" | "running" | "done";

/** Example goals for the empty state (real, worldwide framing). */
const EXAMPLES = [
  "Make this under 2 MB for email",
  "Prepare this image for Instagram",
  "Convert this to a PDF",
  "Compress this PDF",
  "What should I do with this file?",
] as const;

export interface SmartAssistProps {
  /** Compact variant tightens spacing for the homepage hero. */
  variant?: "page" | "hero";
  className?: string;
}

export function SmartAssist({ variant = "page", className }: SmartAssistProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<AssistPlan | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<{ fraction: number; status: string } | null>(null);
  const [result, setResult] = useState<AssistRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = phase === "analyzing" || phase === "planning" || phase === "running";

  /* ── Reset ────────────────────────────────────────────────────────────── */
  const reset = useCallback(() => {
    setFile(null);
    setAnalysis(null);
    setHealth(null);
    setGoal("");
    setPlan(null);
    setPhase("idle");
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  /* ── Ingest a file → analyse + health report ──────────────────────────── */
  const ingest = useCallback(async (f: File) => {
    setFile(f);
    setAnalysis(null);
    setHealth(null);
    setPlan(null);
    setResult(null);
    setError(null);
    setPhase("analyzing");
    track("assist_upload", { ext: f.name.split(".").pop()?.toLowerCase() ?? "", size: f.size });
    try {
      const a = await analyzeFile(f);
      setAnalysis(a);
      setHealth(buildHealthReport(a));
      setPhase("ready");
    } catch {
      setError("Sorry. I couldn't read that file. Try another one.");
      setPhase("idle");
    }
  }, []);

  const onFiles = useCallback(
    (files: File[]) => {
      const f = files[0];
      if (f) void ingest(f);
    },
    [ingest],
  );

  // Whole-page drop guard so a stray drop never navigates the tab to the file.
  const { isDragging } = useFileDrop(onFiles, { disabled: busy });

  // Paste-from-clipboard (image or file).
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (busy) return;
      const items = e.clipboardData?.files;
      if (items && items.length > 0) {
        e.preventDefault();
        onFiles(Array.from(items));
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles, busy]);

  /* ── Build a plan for the current goal, then run it if we can ─────────── */
  const submit = useCallback(
    async (goalText: string) => {
      if (!file || !analysis) return;
      setError(null);
      setPhase("planning");
      track("assist_plan", { goal: goalText.slice(0, 80), family: analysis.family });
      try {
        const { buildPlan } = await import("@/lib/assist/plan");
        const built = buildPlan(analysis, goalText);
        setPlan(built);
        if (built.canRunInline && built.steps.length > 0) {
          await execute(built);
        } else {
          setPhase("ready");
        }
      } catch {
        setError("I couldn't work out a plan for that. Try rephrasing, or open a tool below.");
        setPhase("ready");
      }
    },
    // execute is stable via useCallback below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [file, analysis],
  );

  const execute = useCallback(
    async (built: AssistPlan) => {
      if (!file || !analysis?.assetKind) return;
      setPhase("running");
      setProgress({ fraction: 0, status: "Starting…" });
      setResult(null);
      track("assist_run", { steps: built.steps.map((s) => s.operationId), family: analysis.family });
      try {
        const { runPlan } = await import("@/lib/assist/runner");
        const asset = toAssistAsset(file, analysis.assetKind);
        const res = await runPlan(asset, built.steps, (fraction, status) =>
          setProgress({ fraction, status: status ?? "Working…" }),
        );
        setResult(res);
        setPhase("done");
        addAssist({
          goal: built.goal || "Optimize file",
          fileName: file.name,
          family: analysis.family,
          summary: built.steps.map((s) => s.label).join(" → "),
        });
        track("assist_complete", {
          family: analysis.family,
          saved: Math.max(0, res.originalSize - res.finalSize),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "That didn't work. You can open the full tool below.");
        setPhase("ready");
      }
    },
    [file, analysis],
  );

  const onGoalSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!file) {
        fileInputRef.current?.click();
        return;
      }
      void submit(goal);
    },
    [file, goal, submit],
  );

  const download = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("assist_download", { name: result.name.split(".").pop() ?? "" });
  }, [result]);

  const compact = variant === "hero";

  return (
    <div className={cn("mx-auto w-full max-w-2xl text-left", className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />

      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
          compact ? "p-3 sm:p-4" : "p-4 sm:p-5",
        )}
      >
        {/* Full-cover drop overlay */}
        {isDragging ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop your file to begin
            </p>
          </div>
        ) : null}

        {!file ? (
          <UploadZone
            compact={compact}
            onBrowse={() => fileInputRef.current?.click()}
            inputId={inputId}
            goal={goal}
            setGoal={setGoal}
            onSubmit={onGoalSubmit}
          />
        ) : (
          <ActiveView
            file={file}
            analysis={analysis}
            health={health}
            goal={goal}
            setGoal={setGoal}
            plan={plan}
            phase={phase}
            progress={progress}
            result={result}
            error={error}
            inputId={inputId}
            onSubmit={onGoalSubmit}
            onDownload={download}
            onReset={reset}
            onOpenTool={(slug) => track("assist_open_tool", { slug })}
          />
        )}
      </div>

      {/* Footer: privacy + example goals when idle */}
      {!file ? (
        <div className="mt-3 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setGoal(ex)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ex}
              </button>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="ShieldCheck" size={13} className="text-primary" />
            Everything runs in your browser and your files are never uploaded.
          </p>
        </div>
      ) : null}

      {/* Recent workflows */}
      {!compact ? <HistoryRail onPick={(g) => setGoal(g)} /> : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Upload zone (idle)
 * ════════════════════════════════════════════════════════════════════════ */

function UploadZone({
  compact,
  onBrowse,
  inputId,
  goal,
  setGoal,
  onSubmit,
}: {
  compact: boolean;
  onBrowse: () => void;
  inputId: string;
  goal: string;
  setGoal: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onBrowse}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/50 text-center transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "px-4 py-6" : "px-6 py-10",
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
          <Icon name="Upload" size={20} />
        </span>
        <span className="text-sm font-semibold text-foreground">
          Drop a file, paste, or <span className="text-primary">browse</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Images, PDFs, docs, audio, video, data; up to whatever your device can handle
        </span>
      </button>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
        <Icon name="Sparkles" size={16} className="shrink-0 text-primary" />
        <label htmlFor={inputId} className="sr-only">
          Tell GigAI your goal
        </label>
        <input
          id={inputId}
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Tell me your goal: e.g. “make this under 2 MB”"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="ArrowUp" size={15} />
          <span className="hidden sm:inline">Start</span>
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Active view (a file is loaded)
 * ════════════════════════════════════════════════════════════════════════ */

function ActiveView({
  file,
  analysis,
  health,
  goal,
  setGoal,
  plan,
  phase,
  progress,
  result,
  error,
  inputId,
  onSubmit,
  onDownload,
  onReset,
  onOpenTool,
}: {
  file: File;
  analysis: FileAnalysis | null;
  health: HealthReport | null;
  goal: string;
  setGoal: (v: string) => void;
  plan: AssistPlan | null;
  phase: Phase;
  progress: { fraction: number; status: string } | null;
  result: AssistRunResult | null;
  error: string | null;
  inputId: string;
  onSubmit: (e?: React.FormEvent) => void;
  onDownload: () => void;
  onReset: () => void;
  onOpenTool: (slug: string) => void;
}) {
  const busy = phase === "analyzing" || phase === "planning" || phase === "running";
  const familyIcon = analysis ? FAMILY_ICON[analysis.family] : "File";

  return (
    <div className="flex flex-col gap-4">
      {/* File header */}
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={familyIcon} size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {analysis ? <AnalysisChips a={analysis} /> : "Reading your file…"}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="Start over"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      {phase === "analyzing" ? <SkeletonRows /> : null}

      {/* Health report */}
      {health && analysis ? <HealthReportCard report={health} /> : null}

      {/* Goal input (hidden while running) */}
      {analysis && phase !== "running" ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <Icon name="Sparkles" size={16} className="shrink-0 text-primary" />
          <label htmlFor={inputId} className="sr-only">
            What do you want to do?
          </label>
          <input
            id={inputId}
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to do? (or leave blank and press Go)"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {phase === "planning" ? <Icon name="LoaderCircle" size={15} className="animate-spin" /> : <Icon name="ArrowRight" size={15} />}
            Go
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {/* Plan summary while running / planned */}
      {plan && (phase === "running" || (phase === "ready" && !plan.canRunInline)) ? (
        <PlanCard plan={plan} phase={phase} progress={progress} onOpenTool={onOpenTool} />
      ) : null}

      {/* Result */}
      {phase === "done" && result ? (
        <ResultCard result={result} plan={plan} onDownload={onDownload} onReset={onReset} />
      ) : null}

      {/* Recommendations (next steps) */}
      {plan && (phase === "done" || (phase === "ready" && !plan.canRunInline)) && plan.recommendations.length > 0 ? (
        <Recommendations plan={plan} onOpenTool={onOpenTool} />
      ) : null}
    </div>
  );
}

/* ── Analysis chips (inline summary under the filename) ───────────────────── */

function AnalysisChips({ a }: { a: FileAnalysis }) {
  const parts: string[] = [FAMILY_LABEL[a.family], a.sizeLabel];
  if (a.width && a.height) parts.push(`${a.width}×${a.height}`);
  if (a.pageCount) parts.push(`${a.pageCount} pp`);
  if (a.durationSec) parts.push(`${Math.round(a.durationSec)}s`);
  if (a.lineCount && (a.family === "data" || a.family === "code" || a.family === "text")) parts.push(`${a.lineCount} lines`);
  return <span>{parts.join(" · ")}</span>;
}

/* ══════════════════════════════════════════════════════════════════════════
 * Health report
 * ════════════════════════════════════════════════════════════════════════ */

const STATUS_STYLES: Record<HealthCheck["status"], { text: string; dot: string }> = {
  good: { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  warn: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  info: { text: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
};

function HealthReportCard({ report }: { report: HealthReport }) {
  const [open, setOpen] = useState(false);
  const ringColor =
    report.score >= 90 ? "text-emerald-500" : report.score >= 75 ? "text-sky-500" : report.score >= 55 ? "text-amber-500" : "text-rose-500";
  const circumference = 2 * Math.PI * 16;
  const dash = (report.score / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left focus-visible:outline-none"
      >
        <span className="relative flex size-11 shrink-0 items-center justify-center">
          <svg viewBox="0 0 40 40" className="size-11 -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-muted" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className={cn("transition-all", ringColor)}
              stroke="currentColor"
            />
          </svg>
          <span className="absolute text-[11px] font-bold tabular-nums text-foreground">{report.score}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">File health · {report.grade}</span>
          </span>
          <span className="block text-xs text-muted-foreground">{report.summary}</span>
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          {report.checks.map((c) => {
            const s = STATUS_STYLES[c.status];
            return (
              <li key={c.id} className="flex items-start gap-2.5 text-xs">
                <Icon name={c.icon} size={14} className={cn("mt-0.5 shrink-0", s.text)} />
                <span className="min-w-0">
                  <span className="font-medium text-foreground">{c.label}: </span>
                  <span className="text-muted-foreground">{c.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Plan + progress
 * ════════════════════════════════════════════════════════════════════════ */

function PlanCard({
  plan,
  phase,
  progress,
  onOpenTool,
}: {
  plan: AssistPlan;
  phase: Phase;
  progress: { fraction: number; status: string } | null;
  onOpenTool: (slug: string) => void;
}) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3.5">
      <p className="flex items-start gap-2 text-sm text-foreground">
        <Icon name="Route" size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>{plan.summary}</span>
      </p>

      {plan.steps.length > 0 ? (
        <ol className="mt-2.5 flex flex-col gap-1">
          {plan.steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary tabular-nums">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-foreground">{s.label}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {/* Progress while running */}
      {phase === "running" ? (
        <div className="mt-3" aria-live="polite">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${Math.round((progress?.fraction ?? 0) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="LoaderCircle" size={12} className="animate-spin" />
            {progress?.status ?? "Working…"}
          </p>
        </div>
      ) : null}

      {/* Hand-off to the real tool when we can't run inline */}
      {phase === "ready" && !plan.canRunInline && plan.primaryTool ? (
        <div className="mt-3">
          {plan.blockedReason ? (
            <p className="mb-2 text-xs text-muted-foreground">{plan.blockedReason}</p>
          ) : null}
          <Link
            href={plan.primaryTool.href}
            onClick={() => onOpenTool(plan.primaryTool!.slug)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open {plan.primaryTool.title}
            <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Result
 * ════════════════════════════════════════════════════════════════════════ */

function ResultCard({
  result,
  plan,
  onDownload,
  onReset,
}: {
  result: AssistRunResult;
  plan: AssistPlan | null;
  onDownload: () => void;
  onReset: () => void;
}) {
  const saved = result.originalSize - result.finalSize;
  const pct = result.originalSize > 0 ? Math.round((saved / result.originalSize) * 100) : 0;
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon name="CircleCheck" size={16} className="text-emerald-500" />
        Done: your file is ready
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="font-mono">{formatBytes(result.originalSize)}</span>
        <Icon name="ArrowRight" size={12} />
        <span className="font-mono font-semibold text-foreground">{formatBytes(result.finalSize)}</span>
        {saved > 0 ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
            {pct}% smaller
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Download" size={15} />
          Download
        </button>
        {plan?.primaryTool ? (
          <Link
            href={plan.primaryTool.href}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            title="Fine-tune in the full tool"
          >
            <Icon name="SlidersHorizontal" size={15} />
            <span className="hidden sm:inline">Fine-tune</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Icon name="RotateCcw" size={15} />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </div>
  );
}

/* ── Recommendations (next steps) ─────────────────────────────────────────── */

function Recommendations({ plan, onOpenTool }: { plan: AssistPlan; onOpenTool: (slug: string) => void }) {
  return (
    <section aria-label="Next steps" className="flex flex-col gap-1.5">
      <p className="flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon name="Lightbulb" size={12} /> You might also want to
      </p>
      <div className="flex flex-col gap-0.5">
        {plan.recommendations.map((rec) => (
          <Link
            key={rec.href}
            href={rec.href}
            onClick={() => onOpenTool(rec.href)}
            className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon name={rec.icon} size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">{rec.title}</span>
              {rec.description ? (
                <span className="block truncate text-[11px] text-muted-foreground">{rec.description}</span>
              ) : null}
            </span>
            <Icon name="ArrowUpRight" size={13} className="shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * History rail (STEP 7)
 * ════════════════════════════════════════════════════════════════════════ */

const EMPTY: AssistHistoryEntry[] = [];

function HistoryRail({ onPick }: { onPick: (goal: string) => void }) {
  const entries = useSyncExternalStore(subscribeAssists, getAssists, () => EMPTY);
  if (entries.length === 0) return null;
  return (
    <section aria-label="Recent workflows" className="mt-5">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon name="History" size={12} /> Recent workflows
        </p>
        <button
          type="button"
          onClick={clearAssists}
          className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {entries.slice(0, 6).map((e) => (
          <li
            key={e.id}
            className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-1.5 hover:border-border hover:bg-accent"
          >
            <Icon name={FAMILY_ICON[e.family]} size={14} className="shrink-0 text-muted-foreground" />
            <button
              type="button"
              onClick={() => onPick(e.goal)}
              className="min-w-0 flex-1 text-left"
              title="Reuse this goal"
            >
              <span className="block truncate text-[13px] text-foreground">{e.goal}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{e.fileName} · {e.summary}</span>
            </button>
            <button
              type="button"
              onClick={() => togglePinAssist(e.id)}
              aria-label={e.pinned ? "Unpin" : "Pin"}
              className={cn("shrink-0 rounded p-1 transition-colors hover:text-foreground", e.pinned ? "text-primary" : "text-muted-foreground")}
            >
              <Icon name={e.pinned ? "Pin" : "PinOff"} size={13} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
