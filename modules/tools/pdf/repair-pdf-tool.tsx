"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { repairPdf, type RepairReport } from "@/lib/pdf/edit";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/**
 * Repair PDF, rebuild a damaged file's structure.
 *
 * The whole value of this tool is the REPORT, not the download. A repair that
 * silently returns 3 pages when the original had 40 looks like a success and is
 * a disaster, so the recovered page count is shown prominently and the copy
 * says plainly that truncated content cannot be recovered by any rebuild.
 */
export default function RepairPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);
  const reportRef = React.useRef<RepairReport | null>(null);
  const [report, setReport] = React.useState<RepairReport | null>(null);

  const state = usePdfTool({
    slug: tool.slug,
    // Deliberately NOT "application/pdf": a damaged file often has a broken or
    // missing MIME type, and rejecting it at the door would turn away exactly
    // the files this tool exists for.
    accept: ".pdf",
    multiple: false,
    zipName: "repaired-gigai",
    process: async (files: PdfInput[], onProgress): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) throw new Error("Add the damaged PDF you want to rebuild.");

      onProgress({ value: null, label: "Reading what's left of the file structure…" });
      const { file, report: r } = await repairPdf(input);
      reportRef.current = r;
      return [file];
    },
  });

  React.useEffect(() => {
    if (state.phase === "done") setReport(reportRef.current);
    else if (state.phase === "idle" || state.phase === "ready") {
      setReport(null);
      reportRef.current = null;
    }
  }, [state.phase]);

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept=".pdf"
      multiple={false}
      dropIcon="Wrench"
      dropHint="Select the PDF that won't open, it's rebuilt in your browser"
      processLabel="Repair PDF"
      resultHint="The file structure is rebuilt on your device. Nothing is uploaded."
      // The report belongs to the RESULT, not the ready state. Children are
      // unmounted once processing finishes.
      resultExtra={report ? <ReportCard report={report} accent={tool.accent} /> : null}
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        accent={tool.accent}
        label="Damaged file"
      />

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <Icon name="Info" size={16} className={style.text} />
          What a rebuild can and can&apos;t fix
        </span>
        <p className="text-muted-foreground">
          This rebuilds the cross-reference table and object offsets, the part
          that&apos;s actually broken in almost every &ldquo;this PDF won&apos;t
          open&rdquo; file, usually after an interrupted download or a bad
          export. It cannot bring back content that isn&apos;t in the bytes: if
          pages were cut off, they stay gone. Check the recovered page count
          against what you expect before trusting the result.
        </p>
      </div>

    </PdfWorkspace>
  );
}

function ReportCard({
  report,
  accent,
}: {
  report: RepairReport;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border p-4 text-sm", style.border, style.soft)}>
      <span className="inline-flex items-center gap-2 font-medium text-foreground">
        <Icon name="ClipboardCheck" size={16} className={style.text} />
        Rebuild report
      </span>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Pages recovered" value={String(report.pages)} />
        <Stat label="Original size" value={formatBytes(report.before)} />
        <Stat label="Rebuilt size" value={formatBytes(report.after)} />
      </dl>
      <p className="text-muted-foreground">
        {report.neededLenientParse
          ? "The original refused a normal read and had to be parsed leniently. It was genuinely damaged. Open the rebuilt file and check every page is present before relying on it."
          : "The original parsed cleanly, so the structure wasn't the problem. The file has still been rewritten fresh, which fixes stale offsets some viewers trip over."}
      </p>
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
