"use client";

/**
 * PDF Metadata Editor: view, edit and strip a PDF's document-information
 * dictionary, then download the updated file.
 *
 * REUSES the existing engine, never reimplements it: `readMetadata` /
 * `writeMetadata` from `@/lib/document-tools/pdfops` (thin pdf-lib wrappers,
 * lazy-loaded inside the engine). Everything runs in the browser; the PDF is
 * loaded and re-saved locally, nothing is uploaded.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { CopyButton, StatBadge, download } from "@/components/tool/dev";
import { DocumentDropzone, type DetectedFile } from "@/components/tool/document";
import {
  readMetadata,
  writeMetadata,
  toPdfInput,
  type PdfMetadata,
} from "@/lib/document-tools/pdfops";

/* ── Editable fields (the standard info-dictionary text fields) ───────────── */

type EditableKey = "title" | "author" | "subject" | "keywords" | "creator" | "producer";

interface FieldDef {
  key: EditableKey;
  label: string;
  icon: string;
  placeholder: string;
  multiline?: boolean;
  hint?: string;
}

const FIELDS: readonly FieldDef[] = [
  {
    key: "title",
    label: "Title",
    icon: "Heading",
    placeholder: "Document title",
    hint: "Shown in browser tabs, search results and libraries.",
  },
  { key: "author", label: "Author", icon: "User", placeholder: "Author name" },
  {
    key: "subject",
    label: "Subject",
    icon: "Tag",
    placeholder: "What the document is about",
  },
  {
    key: "keywords",
    label: "Keywords",
    icon: "Hash",
    placeholder: "comma, separated, keywords",
    multiline: true,
    hint: "Comma-separated terms to help the PDF be found.",
  },
  {
    key: "creator",
    label: "Creator",
    icon: "AppWindow",
    placeholder: "Application that created the document",
  },
  {
    key: "producer",
    label: "Producer",
    icon: "Cog",
    placeholder: "Software that produced the PDF",
  },
];

type EditableMeta = Record<EditableKey, string>;

const EMPTY_EDITABLE: EditableMeta = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
};

/** Pull only the editable fields out of the engine's full metadata shape. */
function toEditable(meta: PdfMetadata): EditableMeta {
  return {
    title: meta.title,
    author: meta.author,
    subject: meta.subject,
    keywords: meta.keywords,
    creator: meta.creator,
    producer: meta.producer,
  };
}

/** Format an ISO date for read-only display, gracefully handling bad values. */
function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function DocumentMetadataEditorTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [original, setOriginal] = React.useState<PdfMetadata | null>(null);
  const [form, setForm] = React.useState<EditableMeta>(EMPTY_EDITABLE);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadFile = React.useCallback(async (detected: DetectedFile) => {
    setSelected(detected);
    setError(null);
    setOriginal(null);
    setForm(EMPTY_EDITABLE);
    setLoading(true);
    try {
      const res = await readMetadata(toPdfInput(detected.file));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOriginal(res.result);
      setForm(toEditable(res.result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this PDF's metadata.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearFile = React.useCallback(() => {
    setSelected(null);
    setOriginal(null);
    setForm(EMPTY_EDITABLE);
    setError(null);
  }, []);

  const setField = React.useCallback((key: EditableKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const stripAll = React.useCallback(() => {
    setForm(EMPTY_EDITABLE);
    setError(null);
  }, []);

  const resetToOriginal = React.useCallback(() => {
    if (original) setForm(toEditable(original));
    setError(null);
  }, [original]);

  // Which fields differ from the file's original values.
  const changedKeys = React.useMemo<EditableKey[]>(() => {
    if (!original) return [];
    const base = toEditable(original);
    return FIELDS.map((f) => f.key).filter((k) => form[k] !== base[k]);
  }, [original, form]);

  const changed = changedKeys.length > 0;
  const isStripped = FIELDS.every((f) => form[f.key].trim() === "");

  // Current metadata as JSON (for copy / audit trail).
  const metaJson = React.useMemo(() => {
    if (!original) return "";
    return JSON.stringify(
      {
        ...form,
        creationDate: original.creationDate ?? null,
        modificationDate: original.modificationDate ?? null,
        pageCount: original.pageCount,
      },
      null,
      2,
    );
  }, [form, original]);

  const handleDownload = React.useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await writeMetadata(toPdfInput(selected.file), {
        title: form.title,
        author: form.author,
        subject: form.subject,
        keywords: form.keywords,
        creator: form.creator,
        producer: form.producer,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      download(res.result.name, res.result.blob, "application/pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the updated PDF.");
    } finally {
      setSaving(false);
    }
  }, [selected, form]);

  const showForm = Boolean(selected && original);

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone / selected-file chip */}
      <DocumentDropzone
        accept={["pdf"]}
        selected={selected}
        onClear={clearFile}
        onFile={(d) => void loadFile(d)}
        icon="FileText"
        label="Drop a PDF, click to browse, or paste"
        hint="Its title, author, keywords and other properties load instantly. Nothing is uploaded"
      />

      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="LoaderCircle" size={16} className="animate-spin" />
          Reading document properties…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {showForm && original && (
        <>
          {/* Read-only facts */}
          <div className="flex flex-wrap items-center gap-2">
            <StatBadge label="Pages" value={original.pageCount} icon="Files" />
            <StatBadge
              label="Created"
              value={formatDate(original.creationDate)}
              icon="CalendarPlus"
            />
            <StatBadge
              label="Modified"
              value={formatDate(original.modificationDate)}
              icon="CalendarClock"
            />
            {changed && (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Icon name="PencilLine" size={13} />
                {changedKeys.length} field{changedKeys.length === 1 ? "" : "s"} changed
              </span>
            )}
          </div>

          {/* Editable form */}
          <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const isChanged = changedKeys.includes(field.key);
              const inputId = `meta-${field.key}`;
              return (
                <div
                  key={field.key}
                  className={field.multiline ? "flex flex-col gap-1.5 sm:col-span-2" : "flex flex-col gap-1.5"}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={inputId}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                    >
                      <Icon name={field.icon} size={13} />
                      {field.label}
                      {isChanged && (
                        <span
                          className="size-1.5 rounded-full bg-amber-500"
                          aria-label="Edited"
                          title="Edited"
                        />
                      )}
                    </label>
                    {form[field.key] !== "" && (
                      <button
                        type="button"
                        onClick={() => setField(field.key, "")}
                        className="rounded p-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Clear ${field.label}`}
                        title={`Clear ${field.label}`}
                      >
                        <Icon name="X" size={13} />
                      </button>
                    )}
                  </div>

                  {field.multiline ? (
                    <textarea
                      id={inputId}
                      value={form[field.key]}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    <input
                      id={inputId}
                      type="text"
                      value={form[field.key]}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  )}

                  {field.hint && (
                    <p className="text-[11px] leading-snug text-muted-foreground/80">{field.hint}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={stripAll} disabled={isStripped}>
              <Icon name="Eraser" size={15} />
              Strip all
            </Button>
            <Button variant="ghost" size="sm" onClick={resetToOriginal} disabled={!changed}>
              <Icon name="RotateCcw" size={15} />
              Reset
            </Button>
            <CopyButton getValue={() => metaJson} label="Copy JSON" disabled={!metaJson} />

            <div className="ml-auto">
              <Button size="lg" onClick={() => void handleDownload()} disabled={saving}>
                {saving ? (
                  <Icon name="LoaderCircle" size={18} className="animate-spin" />
                ) : (
                  <Icon name="FileDown" size={18} />
                )}
                {saving ? "Saving…" : "Download updated PDF"}
              </Button>
            </div>
          </div>

          {/* Honesty note */}
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            <span>
              This edits the standard document-information fields shown above; custom XMP or private
              application metadata isn&apos;t surfaced. <span className="font-medium">Strip all</span>{" "}
              clears those standard fields for privacy: a metadata scrub, not a forensic guarantee
              that no trace survives. Saving records a fresh modification date. Everything runs in
              your browser; nothing is uploaded.
            </span>
          </p>
        </>
      )}

      {!selected && !loading && (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
          <span>
            Drop a PDF to view and edit its title, author, subject, keywords, creator, producer and
            dates, or strip them all for privacy. The file never leaves your device.
          </span>
        </p>
      )}
    </div>
  );
}
