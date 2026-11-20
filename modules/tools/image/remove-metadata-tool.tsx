"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  auditFile,
  auditImage,
  auditPdf,
  stripFile,
  fileKind,
  isStrippableImage,
  type MetaFinding,
  type FileKind,
  type Severity,
} from "@/lib/privacy/audit";
import { FileDropZone } from "@/components/tool/dev";

const SEV: Record<Severity, { label: string; chip: string; dot: string }> = {
  high: { label: "High", chip: "bg-rose-500/10 text-rose-600 border-rose-500/20", dot: "bg-rose-500" },
  medium: { label: "Medium", chip: "bg-amber-500/10 text-amber-600 border-amber-500/20", dot: "bg-amber-500" },
  low: { label: "Low", chip: "bg-sky-500/10 text-sky-600 border-sky-500/20", dot: "bg-sky-500" },
};

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}
function ext(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1) : "";
}
function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  const u = ["KB", "MB", "GB"];
  let v = b / 1024, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${u[i]}`;
}

/**
 * Privacy auditor / metadata remover: reads EXIF/GPS from a photo or the info
 * dictionary of a PDF, flags what it exposes, and produces a cleaned copy with
 * the metadata stripped. All on-device. The whole point is that these files
 * shouldn't be uploaded to a random web tool.
 */
export default function RemoveMetadataTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [file, setFile] = React.useState<File | null>(null);
  const [kind, setKind] = React.useState<FileKind>("other");
  const [findings, setFindings] = React.useState<MetaFinding[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cleanedFindings, setCleanedFindings] = React.useState<MetaFinding[] | null>(null);

  const onFiles = React.useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    const k = fileKind(f);
    setFile(f);
    setKind(k);
    setError(null);
    setCleanedFindings(null);
    setFindings([]);
    if (k === "other") {
      setError("Unsupported file. Please choose a JPG, PNG, WebP, GIF or PDF.");
      return;
    }
    setBusy(true);
    auditFile(f)
      .then((r) => setFindings(r.findings))
      .catch(() => setError("Couldn't read this file's metadata."))
      .finally(() => setBusy(false));
  }, []);

  const canStrip = file != null && kind !== "other" && (kind === "pdf" || isStrippableImage(file));
  const isHeic = file != null && kind === "image" && !isStrippableImage(file);

  const cleanAndDownload = React.useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await stripFile(file);
      // Download.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const outExt = kind === "pdf" ? "pdf" : /png/i.test(file.type) || /\.png$/i.test(file.name) ? "png" : "jpg";
      a.href = url;
      a.download = `${baseName(file.name)}-cleaned.${outExt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      // Re-audit the cleaned copy to prove it worked.
      const cleanedFile = new File([blob], a.download, { type: blob.type });
      const after = kind === "pdf" ? await auditPdf(cleanedFile) : await auditImage(cleanedFile);
      setCleanedFindings(after);
    } catch {
      setError("Couldn't clean this file. If it's a HEIC photo, convert it to JPG first.");
    } finally {
      setBusy(false);
    }
  }, [file, kind]);

  const reset = () => {
    setFile(null);
    setKind("other");
    setFindings([]);
    setError(null);
    setCleanedFindings(null);
  };

  return (
    <section aria-label="Metadata / privacy auditor" className="flex flex-col gap-4">
      {!file ? (
        <FileDropZone
          onFiles={onFiles}
          multiple={false}
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.pdf"
          icon="ShieldQuestion"
          label="Drop a photo or PDF to check what it reveals"
          hint="JPG, PNG, WebP, GIF or PDF: read and cleaned in your browser. Nothing is uploaded."
          className="min-h-[240px]"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* File header */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 p-3">
            <span className={cn("grid size-9 place-items-center rounded-md", accent.soft)}>
              <Icon name={kind === "pdf" ? "FileText" : "FileImage"} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={file.name}>{file.name}</p>
              <p className="text-xs text-muted-foreground">{kind.toUpperCase()} · {formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Icon name="RefreshCw" size={15} className="mr-1 inline align-[-2px]" /> New file
            </button>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-600">
              <Icon name="CircleX" size={18} className="shrink-0" /> {error}
            </div>
          ) : null}

          {busy ? (
            <div className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground">
              <Icon name="LoaderCircle" size={16} className="animate-spin" /> Reading metadata…
            </div>
          ) : null}

          {/* Findings */}
          {!busy && !error ? (
            findings.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
                <Icon name="ShieldCheck" size={20} className="shrink-0" />
                <span>No exposing metadata found in this file. It looks clean to share.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon name="ShieldAlert" size={18} className="text-rose-500" />
                  This file reveals {findings.length} thing{findings.length === 1 ? "" : "s"} about you
                </div>
                <ul className="flex flex-col gap-2">
                  {findings.map((f) => {
                    const sev = SEV[f.severity];
                    return (
                      <li key={f.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card p-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold", sev.chip)}>
                          <span className={cn("size-1.5 rounded-full", sev.dot)} />
                          {sev.label}
                        </span>
                        <span className="font-medium text-foreground">{f.label}</span>
                        <span className="w-full font-mono text-xs text-muted-foreground sm:w-auto sm:flex-1">{f.value}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          ) : null}

          {/* Clean action */}
          {!busy && findings.length > 0 && canStrip ? (
            <button
              type="button"
              onClick={cleanAndDownload}
              className={cn(
                "inline-flex items-center justify-center gap-2 self-start rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90",
              )}
            >
              <Icon name="ShieldCheck" size={16} /> Download cleaned {kind === "pdf" ? "PDF" : "image"}
            </button>
          ) : null}

          {isHeic ? (
            <p className="text-xs text-muted-foreground">
              This looks like a HEIC photo, which can&rsquo;t be cleaned directly.{" "}
              <Link href="/heic-to-jpg" className={cn("font-medium underline", accent.text)}>
                Convert it to JPG first
              </Link>
              , then clean the JPG.
            </p>
          ) : null}

          {cleanedFindings != null ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
              <Icon name="CheckCheck" size={20} className="shrink-0" />
              <span>
                Cleaned copy downloaded - a re-scan found{" "}
                {cleanedFindings.length === 0 ? "no remaining metadata" : `${cleanedFindings.length} remaining item(s)`}.
              </span>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <Icon name="Lock" size={12} className="mr-1 inline align-[-1px]" />
        Your file is read and cleaned entirely in your browser. Never uploaded, which is exactly why a privacy tool
        should be local. Cleaning an image re-encodes it (high-quality JPEG, or lossless PNG) so every trace of metadata
        is removed; PDF cleaning clears the document&rsquo;s author, title and producer fields.
      </p>
    </section>
  );
}
