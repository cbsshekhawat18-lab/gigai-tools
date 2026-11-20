"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { FileDropZone } from "@/components/tool/dev";
import {
  scanBatch,
  rollUpVerdict,
  ACCEPTED_TYPES,
  type FileScan,
  type LeakFinding,
  type LeakSeverity,
  type Verdict,
} from "@/lib/privacy/leak-scan";
import { downloadHtmlReport, downloadJsonReport, type ReportMeta } from "@/lib/privacy/leak-report";

/* ── Presentation tokens ───────────────────────────────────────────────────── */

const SEV: Record<LeakSeverity, { label: string; chip: string; dot: string }> = {
  critical: { label: "Critical", chip: "border-rose-500/25 bg-rose-500/10 text-rose-600", dot: "bg-rose-500" },
  high: { label: "High", chip: "border-orange-500/25 bg-orange-500/10 text-orange-600", dot: "bg-orange-500" },
  medium: { label: "Medium", chip: "border-amber-500/25 bg-amber-500/10 text-amber-600", dot: "bg-amber-500" },
  low: { label: "Low", chip: "border-sky-500/25 bg-sky-500/10 text-sky-600", dot: "bg-sky-500" },
};

const VERDICT: Record<Verdict, { label: string; blurb: string; icon: string; box: string; text: string }> = {
  blocked: {
    label: "Do not release",
    blurb: "Content that should not be readable can be recovered from these files.",
    icon: "OctagonAlert",
    box: "border-rose-500/25 bg-rose-500/5",
    text: "text-rose-600",
  },
  review: {
    label: "Review before release",
    blurb: "Nothing is directly recoverable, but these files disclose more than they need to.",
    icon: "TriangleAlert",
    box: "border-amber-500/25 bg-amber-500/5",
    text: "text-amber-600",
  },
  clear: {
    label: "No issues found",
    blurb: "These checks found nothing recoverable or identifying. Still worth a human read.",
    icon: "ShieldCheck",
    box: "border-emerald-500/25 bg-emerald-500/5",
    text: "text-emerald-600",
  },
  error: {
    label: "Incomplete",
    blurb: "At least one file could not be read, so this set has not been fully checked.",
    icon: "CircleX",
    box: "border-border bg-muted/40",
    text: "text-muted-foreground",
  },
};

const KIND_ICON: Record<string, string> = {
  pdf: "FileText",
  docx: "FileType",
  xlsx: "Sheet",
  pptx: "Presentation",
  image: "FileImage",
  other: "File",
};

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  const u = ["KB", "MB", "GB"];
  let v = b / 1024;
  let i = 0;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${u[i]}`;
}

/* ── Evidence: masked until asked for ──────────────────────────────────────── */

/**
 * Recovered text is the proof, and it is also exactly the content the user was
 * trying not to disclose. Showing it unprompted would leak it to whoever is
 * looking over their shoulder or watching a screen share, so it stays blurred
 * until they ask.
 */
function Evidence({ text }: { text: string }) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name={shown ? "EyeOff" : "Eye"} size={13} />
        {shown ? "Hide recovered content" : "Show what was recovered"}
      </button>
      <pre
        className={cn(
          "mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/50 p-2.5 font-mono text-[11px] leading-relaxed transition-all",
          !shown && "pointer-events-none select-none blur-[5px]",
        )}
        aria-hidden={!shown}
      >
        {text}
      </pre>
    </div>
  );
}

function FindingRow({ finding }: { finding: LeakFinding }) {
  const sev = SEV[finding.severity];
  return (
    <li className="border-t border-border/70 py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold", sev.chip)}>
          <span className={cn("size-1.5 rounded-full", sev.dot)} />
          {sev.label}
        </span>
        <span className="text-sm font-semibold text-foreground">{finding.title}</span>
        {finding.count > 1 ? (
          <span className="text-xs text-muted-foreground">×{finding.count}</span>
        ) : null}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{finding.detail}</p>
      {finding.where ? (
        <p className="mt-1 text-xs text-muted-foreground/80">{finding.where}</p>
      ) : null}
      {finding.evidence ? <Evidence text={finding.evidence} /> : null}
    </li>
  );
}

function FileCard({ scan }: { scan: FileScan }) {
  const v = VERDICT[scan.verdict];
  const [open, setOpen] = React.useState(scan.verdict === "blocked");
  const hasDetail = scan.findings.length > 0 || !!scan.error;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => hasDetail && setOpen((o) => !o)}
        disabled={!hasDetail}
        className={cn(
          "flex w-full items-center gap-3 p-3 text-left transition-colors",
          hasDetail && "hover:bg-muted/50",
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
          <Icon name={KIND_ICON[scan.kind] ?? "File"} size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium" title={scan.name}>
            {scan.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {scan.kind.toUpperCase()} · {formatBytes(scan.size)}
            {scan.inspected != null && scan.total != null
              ? ` · ${scan.inspected === scan.total ? `${scan.total} pages` : `${scan.inspected} of ${scan.total} pages`}`
              : ""}
          </span>
        </span>
        <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold", v.text)}>
          <Icon name={v.icon} size={15} />
          <span className="hidden sm:inline">{v.label}</span>
        </span>
        {hasDetail ? (
          <Icon name="ChevronDown" size={16} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        ) : null}
      </button>

      {open && hasDetail ? (
        <div className="border-t border-border px-3 pb-3 pt-1">
          {scan.error ? (
            <p className="py-3 text-sm text-rose-600">{scan.error}</p>
          ) : (
            <ul className="flex flex-col">
              {scan.findings.map((f) => (
                <FindingRow key={f.check} finding={f} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ── Tool ──────────────────────────────────────────────────────────────────── */

const PAGE_LIMITS = [20, 40, 100, 300];

/**
 * Document release pre-flight. Takes a whole outgoing set, attacks each file the
 * way a recipient could, and produces a report you can keep on file.
 */
export default function RedactionCheckerTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [scans, setScans] = React.useState<FileScan[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState({ done: 0, total: 0, label: "" });
  const [reference, setReference] = React.useState("");
  const [maxPages, setMaxPages] = React.useState(40);

  const run = React.useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setBusy(true);
      setScans(null);
      setProgress({ done: 0, total: files.length, label: files[0]?.name ?? "" });
      try {
        const results = await scanBatch(files, {
          maxPages,
          onProgress: (done, total, label) => setProgress({ done, total, label }),
        });
        setScans(results);
      } finally {
        setBusy(false);
      }
    },
    [maxPages],
  );

  const reset = () => {
    setScans(null);
    setProgress({ done: 0, total: 0, label: "" });
  };

  const verdict = scans ? rollUpVerdict(scans) : null;
  const counts = React.useMemo(() => {
    if (!scans) return null;
    const all = scans.flatMap((s) => s.findings);
    return {
      files: scans.length,
      findings: all.length,
      critical: all.filter((f) => f.severity === "critical").length,
    };
  }, [scans]);

  const reportMeta = React.useCallback(
    (): ReportMeta => ({ reference: reference.trim() || undefined, generatedAt: new Date(), maxPages }),
    [reference, maxPages],
  );

  return (
    <section aria-label="Document release check" className="flex flex-col gap-4">
      {!scans && !busy ? (
        <>
          <FileDropZone
            onFiles={run}
            multiple
            accept={ACCEPTED_TYPES}
            icon="ScanSearch"
            label="Drop the files you are about to send"
            hint="PDF, Word, Excel, PowerPoint or images, the whole outgoing set at once. Read on your device. Never uploaded."
            maxSizeMb={200}
            className="min-h-[240px]"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <label className="inline-flex items-center gap-2">
              <span>Pages to check per file</span>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-foreground"
              >
                {PAGE_LIMITS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-muted-foreground/80">
              Higher limits are slower: every page is rendered and compared.
            </span>
          </div>
        </>
      ) : null}

      {busy ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon name="LoaderCircle" size={16} className="animate-spin" />
            Checking {progress.done + 1} of {progress.total}
            {progress.label ? <span className="truncate text-muted-foreground">· {progress.label}</span> : null}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-[width] duration-300", accent.solid)}
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Each page is rendered and compared against its text layer. Long documents take a moment.
          </p>
        </div>
      ) : null}

      {scans && verdict && counts ? (
        <div className="flex flex-col gap-4">
          {/* Verdict */}
          <div className={cn("flex flex-wrap items-start gap-3 rounded-xl border p-4", VERDICT[verdict].box)}>
            <Icon name={VERDICT[verdict].icon} size={22} className={cn("mt-0.5 shrink-0", VERDICT[verdict].text)} />
            <div className="min-w-0 flex-1">
              <p className={cn("text-base font-bold", VERDICT[verdict].text)}>{VERDICT[verdict].label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{VERDICT[verdict].blurb}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {counts.files} file{counts.files === 1 ? "" : "s"} checked · {counts.findings} finding
                {counts.findings === 1 ? "" : "s"}
                {counts.critical > 0 ? (
                  <span className="font-semibold text-rose-600"> · {counts.critical} critical</span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Icon name="RefreshCw" size={14} className="mr-1 inline align-[-2px]" /> New check
            </button>
          </div>

          {/* Files */}
          <div className="flex flex-col gap-2">
            {scans.map((s, i) => (
              <FileCard key={`${s.name}-${i}`} scan={s} />
            ))}
          </div>

          {/* Report export */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="FileCheck" size={16} /> Keep a record
            </div>
            <p className="text-xs text-muted-foreground">
              Export what was checked, when, and what was found, the thing you attach to a production log or hand to
              whoever signs off. The report reproduces recovered content as evidence, so store it as carefully as the
              documents themselves.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Reference (matter no., release name…)"
                className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => downloadHtmlReport(scans, reportMeta())}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Icon name="Download" size={15} /> Report (HTML)
              </button>
              <button
                type="button"
                onClick={() => downloadJsonReport(scans, reportMeta())}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Icon name="Braces" size={15} /> JSON
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-muted-foreground">
        <Icon name="Lock" size={12} className="mr-1 inline align-[-1px]" />
        Every file is read, rendered and compared entirely in your browser: a document you are worried about leaking is
        the last one you should upload to a scanner. Findings are honest about their limits: a clean result means these
        checks found nothing, not that a file is guaranteed safe to release, and a scanned page with no text layer has
        nothing to recover either way.
      </p>
    </section>
  );
}
