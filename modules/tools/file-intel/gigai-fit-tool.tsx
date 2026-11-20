"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { AskBanner } from "@/components/shared/ask-banner";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { ImageToolProps } from "@/components/tool/types";
import { detectFile } from "@/lib/file-intel/detect";
import { adapterFor, releaseImageFor } from "@/lib/file-intel/adapters";
import { fitToTarget, isCancelled, impossibleTargetMessage } from "@/lib/file-intel/target-size";
import { evaluateQuality, PRESETS } from "@/lib/file-intel/quality";
import { buildFitReportPdf } from "@/lib/file-intel/report";
import {
  formatSize,
  parseSize,
  reductionPercent,
  type FitAdapter,
  type FitResult,
  type FitUnavailable,
  type QualityVerdict,
  type SourceInfo,
} from "@/lib/file-intel/types";

type Phase = "idle" | "inspecting" | "ready" | "working" | "done" | "blocked" | "error";
type Unit = "KB" | "MB" | "GB";

/**
 * GigAI Fit, tell it the size you need, it works out how to get there.
 *
 * This component owns NO compression. It picks the adapter for the detected
 * file kind and hands it to the Target Size Engine; every byte of the actual
 * work happens in the studio engines that already existed.
 *
 * Three things it refuses to do, all of them deliberate:
 *  • Show a progress bar it can't justify, the status line names the real
 *     attempt and the real parameter being tried.
 *  • Report success it didn't achieve, an unreachable target produces a
 *     "best achievable" screen, not a green tick over a mangled file.
 *  • Touch the original: every result is a new Blob; the input File is never
 *     mutated, and the download always carries a new name.
 */
export default function GigaiFitTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [info, setInfo] = React.useState<SourceInfo | null>(null);
  const [adapter, setAdapter] = React.useState<FitAdapter | null>(null);
  const [blocked, setBlocked] = React.useState<FitUnavailable | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [amount, setAmount] = React.useState("2");
  const [unit, setUnit] = React.useState<Unit>("MB");
  const [preset, setPreset] = React.useState<string | null>(null);

  const [status, setStatus] = React.useState("");
  const [progress, setProgress] = React.useState<number | null>(null);
  const [result, setResult] = React.useState<FitResult | null>(null);
  const [verdict, setVerdict] = React.useState<QualityVerdict | null>(null);
  const [savingPdf, setSavingPdf] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);
  const outUrlRef = React.useRef<string | null>(null);

  const targetBytes = parseSize(amount, unit);

  /* ── Cleanup: never leak an object URL or a decoded bitmap ─────────────── */
  const releaseOutput = React.useCallback(() => {
    if (outUrlRef.current) {
      URL.revokeObjectURL(outUrlRef.current);
      outUrlRef.current = null;
    }
  }, []);

  React.useEffect(() => releaseOutput, [releaseOutput]);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    releaseOutput();
    if (file) void releaseImageFor(file);
    if (info?.previewUrl) URL.revokeObjectURL(info.previewUrl);
    setPhase("idle");
    setFile(null);
    setInfo(null);
    setAdapter(null);
    setBlocked(null);
    setError(null);
    setResult(null);
    setVerdict(null);
    setStatus("");
    setProgress(null);
  }, [file, info, releaseOutput]);

  /* ── Step 1: inspect ───────────────────────────────────────────────────── */
  const accept = React.useCallback(async (next: File) => {
    reset();
    setFile(next);
    setPhase("inspecting");
    setStatus("Inspecting file…");

    try {
      const detected = await detectFile(next);
      const found = adapterFor(detected.kind);

      if (!found) {
        setBlocked({
          ok: false,
          reason: `GigAI Fit doesn't know how to compress a ${detected.label.toLowerCase()}.`,
          suggestion: "It works with images, PDFs, video and audio. If this is one of those with an unusual extension, try renaming it correctly and adding it again.",
        });
        setPhase("blocked");
        return;
      }

      const probe = await found.probe(next);
      if (!probe.ok) {
        setBlocked(probe);
        setPhase("blocked");
        return;
      }

      setAdapter(found);
      setInfo(probe.info);
      setPhase("ready");
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The file couldn't be inspected.");
      setPhase("error");
    }
  }, [reset]);

  /* ── Step 3: run the search ────────────────────────────────────────────── */
  const run = React.useCallback(async () => {
    if (!file || !adapter || !info || !targetBytes) return;

    releaseOutput();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("working");
    setError(null);
    setStatus("Finding the best compression strategy…");
    setProgress(null);

    try {
      const res = await fitToTarget(file, adapter, info, {
        targetBytes,
        signal: controller.signal,
        onStage: (note, fraction) => {
          setStatus(note);
          setProgress(typeof fraction === "number" ? fraction : null);
        },
      });
      setResult(res);
      setVerdict(evaluateQuality(res));
      setPhase("done");
    } catch (err) {
      if (isCancelled(err)) {
        setPhase("ready");
        setStatus("");
        return;
      }
      setError(err instanceof Error ? err.message : "Compression failed.");
      setPhase("error");
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  }, [file, adapter, info, targetBytes, releaseOutput]);

  const download = React.useCallback(() => {
    if (!result) return;
    releaseOutput();
    const url = URL.createObjectURL(result.blob);
    outUrlRef.current = url;
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [result, releaseOutput]);

  /** PDF report; isolated-iframe renderer, so it can't inherit app oklch. */
  const downloadReport = React.useCallback(async () => {
    if (!result || !verdict) return;
    setSavingPdf(true);
    try {
      const blob = await buildFitReportPdf(result, verdict);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // result.name already carries a "-fit" suffix; strip it so the report
      // is "photo-fit-report.pdf" rather than "photo-fit-fit-report.pdf".
      const base = result.name.replace(/\.[^.]+$/, "").replace(/-fit$/, "");
      a.download = `${base}-fit-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("The PDF report couldn't be generated. Your compressed file is unaffected. Download it above.");
    } finally {
      setSavingPdf(false);
    }
  }, [result, verdict]);

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <PrivacyBadge accent={tool.accent} />
      <AskBanner context="a single fit check" />

      {phase === "idle" ? <Dropzone onFile={accept} accent={tool.accent} /> : null}

      {phase === "inspecting" ? (
        <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Icon name="LoaderCircle" size={16} className="animate-spin" />
          Inspecting file…
        </p>
      ) : null}

      {file && info && phase !== "idle" && phase !== "inspecting" ? (
        <FileCard file={file} info={info} onRemove={reset} accent={tool.accent} />
      ) : null}

      {phase === "blocked" && blocked ? (
        <Explain
          icon="CircleAlert"
          title="This file can't be resized here"
          body={blocked.reason}
          suggestion={blocked.suggestion}
          onReset={reset}
        />
      ) : null}

      {phase === "error" && error ? (
        <Explain icon="TriangleAlert" title="That didn't work" body={error} onReset={reset} />
      ) : null}

      {(phase === "ready" || phase === "working") && adapter ? (
        <>
          <TargetPicker
            amount={amount}
            unit={unit}
            preset={preset}
            disabled={phase === "working"}
            accent={tool.accent}
            onAmount={(v) => {
              setAmount(v);
              setPreset(null);
            }}
            onUnit={(u) => {
              setUnit(u);
              setPreset(null);
            }}
            onPreset={(p) => {
              setPreset(p.id);
              const mb = p.bytes / (1024 * 1024);
              setAmount(mb >= 1 ? String(Math.round(mb)) : String(Math.round(p.bytes / 1024)));
              setUnit(mb >= 1 ? "MB" : "KB");
            }}
          />

          <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <Icon name="Sparkles" size={15} className={cn("mt-0.5 shrink-0", style.text)} />
            <span>
              <strong className="font-medium text-foreground">Strategy:</strong> {adapter.strategy}
              {adapter.speed === "slow" ? " Each attempt takes a while, so the search is deliberately short." : ""}
            </span>
          </p>

          {phase === "working" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Icon name="LoaderCircle" size={15} className="animate-spin" />
                  {status}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={() => abortRef.current?.abort()}>
                  Cancel
                </Button>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-300", style.solid)}
                  style={{ width: progress === null ? "35%" : `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <Button type="button" onClick={() => void run()} disabled={!targetBytes} className="self-start">
              <Icon name="Zap" size={16} />
              {targetBytes ? `Make it fit ${formatSize(targetBytes)}` : "Enter a target size"}
            </Button>
          )}
        </>
      ) : null}

      {phase === "done" && result && verdict ? (
        <ResultPanel
          result={result}
          verdict={verdict}
          accent={tool.accent}
          onDownload={download}
          onReport={() => void downloadReport()}
          savingPdf={savingPdf}
          onReset={reset}
          onRetryHarder={() => {
            setPhase("ready");
            setResult(null);
            setVerdict(null);
          }}
        />
      ) : null}
    </div>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────────── */

function PrivacyBadge({ accent }: { accent: ImageToolProps["tool"]["accent"] }) {
  const style = accentStyle(accent);
  return (
    <p className={cn("flex items-center gap-2 self-start rounded-lg border px-2.5 py-1.5 text-xs font-medium", style.border, style.soft)}>
      <Icon name="Lock" size={13} className={style.text} />
      Processed locally in your browser. Your file is never uploaded
    </p>
  );
}

function Dropzone({ onFile, accent }: { onFile: (f: File) => void; accent: ImageToolProps["tool"]["accent"] }) {
  const style = accentStyle(accent);
  const [over, setOver] = React.useState(false);
  const inputId = React.useId();

  return (
    <label
      htmlFor={inputId}
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
        "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
        "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background",
        style.ring,
        over ? cn(style.border, style.soft) : "border-border hover:bg-muted/40",
      )}
    >
      <span className={cn("flex size-14 items-center justify-center rounded-2xl", style.soft)}>
        <Icon name="Zap" size={26} className={style.text} />
      </span>
      <span className="text-base font-medium text-foreground">Drop a file to get started</span>
      <span className="max-w-sm text-sm text-muted-foreground">
        Images, PDFs, video and audio. Tell GigAI the size you need and it picks the best way to get there.
      </span>
      <input
        id={inputId}
        type="file"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function FileCard({
  file,
  info,
  onRemove,
  accent,
}: {
  file: File;
  info: SourceInfo;
  onRemove: () => void;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  const bits = [
    info.width && info.height ? `${info.width} × ${info.height}` : null,
    info.pages ? `${info.pages} page${info.pages === 1 ? "" : "s"}` : null,
    info.duration ? `${Math.round(info.duration)}s` : null,
    info.bitrate ? `${Math.round(info.bitrate)} kbps` : null,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      {info.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={info.previewUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-lg", style.soft)}>
          <Icon name="FileText" size={20} className={style.text} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
        <span className="text-sm text-muted-foreground">
          {info.label} · {formatSize(info.bytes)}
          {bits.length ? ` · ${bits.join(" · ")}` : ""}
        </span>
      </span>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

function TargetPicker({
  amount,
  unit,
  preset,
  disabled,
  accent,
  onAmount,
  onUnit,
  onPreset,
}: {
  amount: string;
  unit: Unit;
  preset: string | null;
  disabled: boolean;
  accent: ImageToolProps["tool"]["accent"];
  onAmount: (v: string) => void;
  onUnit: (u: Unit) => void;
  onPreset: (p: (typeof PRESETS)[number]) => void;
}) {
  const style = accentStyle(accent);
  const id = React.useId();

  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">What size do you need?</legend>

      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          aria-label="Maximum size"
          className={cn(
            "w-32 rounded-xl border bg-card px-3.5 py-2.5 text-base font-medium text-foreground outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            style.ring,
            "border-border",
          )}
        />
        <div className="flex rounded-xl border border-border p-0.5" role="radiogroup" aria-label="Unit">
          {(["KB", "MB", "GB"] as const).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={unit === u}
              onClick={() => onUnit(u)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                unit === u ? cn(style.solid, "text-white") : "text-muted-foreground hover:text-foreground",
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.hint}
            onClick={() => onPreset(p)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              preset === p.id ? cn(style.border, style.soft, "font-medium text-foreground") : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            {p.label}
            <span className="ml-1.5 text-xs opacity-70">{formatSize(p.bytes)}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Explain({
  icon,
  title,
  body,
  suggestion,
  onReset,
}: {
  icon: string;
  title: string;
  body: string;
  suggestion?: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon name={icon} size={16} className="text-amber-600 dark:text-amber-400" />
        {title}
      </span>
      <p className="text-sm text-muted-foreground">{body}</p>
      {suggestion ? <p className="text-sm text-muted-foreground">{suggestion}</p> : null}
      <Button type="button" variant="outline" size="sm" onClick={onReset} className="self-start">
        Try another file
      </Button>
    </div>
  );
}

const BAND_STYLE = {
  excellent: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", emoji: "🟢" },
  noticeable: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", emoji: "🟡" },
  heavy: { dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", emoji: "🔴" },
} as const;

function ResultPanel({
  result,
  verdict,
  accent,
  onDownload,
  onReport,
  savingPdf,
  onReset,
  onRetryHarder,
}: {
  result: FitResult;
  verdict: QualityVerdict;
  accent: ImageToolProps["tool"]["accent"];
  onDownload: () => void;
  onReport: () => void;
  savingPdf: boolean;
  onReset: () => void;
  onRetryHarder: () => void;
}) {
  const style = accentStyle(accent);
  const band = BAND_STYLE[verdict.band];
  const saved = reductionPercent(result.source.bytes, result.size);
  const missed = result.outcome === "best-effort";

  return (
    <div className="flex flex-col gap-4">
      {missed ? (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="CircleAlert" size={16} className="text-amber-600 dark:text-amber-400" />
            Best achievable result
          </span>
          <p className="text-sm text-muted-foreground">{impossibleTargetMessage(result)}</p>
        </div>
      ) : null}

      {/* Before / after */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Column label="Before" size={formatSize(result.source.bytes)} meta={dimsOf(result.source.width, result.source.height)} muted />
        <Column
          label="After"
          size={formatSize(result.size)}
          meta={dimsOf(result.facts.width, result.facts.height)}
          badge={saved > 0 ? `${saved.toFixed(1)}% smaller` : undefined}
          accent={accent}
        />
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-3">
        <Stat label="Target" value={`≤ ${formatSize(result.targetBytes)}`} />
        <Stat label="Result" value={formatSize(result.size)} />
        <div className="flex flex-col">
          <dt className="text-xs text-muted-foreground">Quality</dt>
          <dd className={cn("flex items-center gap-1.5 text-base font-semibold", band.text)}>
            <span className={cn("size-2 rounded-full", band.dot)} aria-hidden="true" />
            {verdict.label}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">{verdict.detail}</p>

      {result.changed.length ? (
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {result.changed.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <Icon name="ArrowRight" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
              {c}
            </li>
          ))}
        </ul>
      ) : null}

      {result.attempts.length > 1 ? (
        <details className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-foreground">
            How it got there - {result.attempts.length} attempts
          </summary>
          <ul className="mt-2 flex flex-col gap-1 text-muted-foreground tabular-nums">
            {result.attempts.map((a, i) => (
              <li key={i}>
                Attempt {i + 1}: setting {Math.round(a.knob * 100)}% → {formatSize(a.size)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onDownload}>
          <Icon name="Download" size={16} />
          Download {missed ? "best quality" : "result"}
        </Button>
        {missed ? (
          <Button type="button" variant="outline" onClick={onRetryHarder}>
            Choose a different target
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onReport} disabled={savingPdf}>
          <Icon
            name={savingPdf ? "LoaderCircle" : "FileText"}
            size={16}
            className={savingPdf ? "animate-spin" : undefined}
          />
          {savingPdf ? "Building report…" : "PDF report"}
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Another file
        </Button>
      </div>
    </div>
  );
}

function dimsOf(w?: number, h?: number): string | undefined {
  return w && h ? `${w} × ${h}` : undefined;
}

function Column({
  label,
  size,
  meta,
  badge,
  muted,
  accent,
}: {
  label: string;
  size: string;
  meta?: string;
  badge?: string;
  muted?: boolean;
  accent?: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  return (
    <div className={cn("flex flex-col gap-1 rounded-xl border p-4", muted ? "border-border bg-muted/20" : cn(style.border, style.soft))}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums text-foreground">{size}</span>
      {meta ? <span className="text-sm text-muted-foreground tabular-nums">{meta}</span> : null}
      {badge ? <span className={cn("mt-1 self-start rounded-md px-2 py-0.5 text-xs font-medium", style.solid, "text-white")}>{badge}</span> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
