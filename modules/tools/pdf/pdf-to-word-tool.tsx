"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { convertOnServer } from "@/lib/api";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/** Which engine produced the.docx: surfaced to the user after conversion. */
type Engine = "server" | "fallback";

/**
 * Extract every page's text with pdf.js and build a clean, editable .docx with
 * the `docx` library: entirely in the browser. This is the fallback path used
 * when the LibreOffice conversion server is unreachable. Layout and tables are
 * NOT reconstructed here; the output is honest text-only paragraphs.
 */
async function convertInBrowser(file: File): Promise<Blob> {
  const [{ openPdfDocument }, docx] = await Promise.all([
    import("@/lib/pdf/core"),
    import("docx"),
  ]);
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

  const doc = await openPdfDocument(file);
  try {
    const paragraphs: InstanceType<typeof Paragraph>[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      page.cleanup();

      // Reassemble lines: pdf.js flags line breaks with `hasEOL` on text items.
      const lines: string[] = [];
      let line = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        line += item.str;
        if (item.hasEOL) {
          lines.push(line);
          line = "";
        }
      }
      if (line.trim().length > 0) lines.push(line);

      if (pageNumber > 1) {
        paragraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: `Page ${pageNumber}` })],
          }),
        );
      }

      for (const raw of lines) {
        const text = raw.replace(/\s+/g, " ").trim();
        if (text.length === 0) continue;
        paragraphs.push(new Paragraph({ children: [new TextRun({ text })] }));
      }
    }

    if (paragraphs.length === 0) {
      throw new Error(
        "No selectable text was found in this PDF. If it's a scan, run it through the OCR PDF tool first, then convert.",
      );
    }

    const wordDoc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(wordDoc);
    return blob;
  } finally {
    await doc.loadingTask.destroy();
  }
}

/**
 * PDF to Word, server-backed conversion with a private in-browser fallback.
 *
 * A single PDF is queued through `usePdfTool` (accept application/pdf, single
 * file). On process, it first tries a high-fidelity LibreOffice conversion via
 * `convertOnServer(file, "pdf-to-word")`; on ANY error it falls back to
 * extracting text with pdf.js and building a .docx with the `docx` library, and
 * records which engine ran so the UI can tell the user plainly.
 */
export default function PdfToWordTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);
  // Records which engine produced the current result; read after processing.
  const engineRef = React.useRef<Engine | null>(null);
  const [engine, setEngine] = React.useState<Engine | null>(null);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "pdf-to-word-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const first = files[0];
      if (!first) {
        throw new Error("Add a PDF to convert. Drop in a file and try again.");
      }

      const base = first.name.replace(/\.pdf$/i, "");
      let blob: Blob;
      let name: string;

      try {
        // High-fidelity path: LibreOffice on the ephemeral server.
        blob = await convertOnServer(first.file, "pdf-to-word");
        engineRef.current = "server";
        name = `${base}.docx`;
      } catch {
        // Any server failure → private in-browser text extraction. The
        // "-text-only" suffix makes the fallback unmistakable in the result
        // list and on the downloaded file itself, since the workspace's "done"
        // view shows the filename but not our controls.
        blob = await convertInBrowser(first.file);
        engineRef.current = "fallback";
        name = `${base}-text-only.docx`;
      }

      setEngine(engineRef.current);
      return [{ name, blob, size: blob.size }];
    },
  });

  // Reset the engine badge whenever the queue changes or we leave "done".
  React.useEffect(() => {
    if (state.phase !== "done") setEngine(null);
  }, [state.phase]);

  const queued = state.files[0] ?? null;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="FileType2"
      dropHint="Select one PDF to convert into an editable Word document"
      processLabel="Convert to Word"
      resultHint="Text extracted in your browser. Your PDF is never uploaded."
    >
      {queued ? (
        <PdfFileList
          files={state.files}
          onRemove={state.removeFile}
          accent={tool.accent}
          label="PDF to convert"
        />
      ) : null}

      {/* How the conversion works - set honest expectations up front. */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <Icon name="FileType2" size={16} className={style.text} />
          Editable .docx output
        </span>
        <p className="text-muted-foreground">
          The text is extracted and the .docx assembled right here in your
          browser, so the PDF is never uploaded. You get real editable
          paragraphs, but not the page layout: tables come across as text
          rather than Word tables, and columns are read in a single order. A
          scanned PDF has no text to extract, so run OCR PDF over it first.
        </p>
        {queued ? (
          <span className="inline-flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <Icon name="FileText" size={13} className={style.text} />
            {queued.name} · {formatBytes(queued.size)}
          </span>
        ) : null}
      </div>

      {/* After a run, state clearly which path produced the document. */}
      {engine ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm",
            engine === "server"
              ? cn("border-transparent", style.soft)
              : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
          )}
        >
          <Icon
            name={engine === "server" ? "ShieldCheck" : "Zap"}
            size={15}
            className="mt-0.5 shrink-0"
          />
          <span>
            {engine === "server" ? (
              <>
                <strong className="font-medium">High-fidelity conversion.</strong>{" "}
                Your Word file was built by the LibreOffice engine, preserving
                layout and tables. It was processed and deleted on the server  -
                nothing was kept.
              </>
            ) : (
              <>
                <strong className="font-medium">Converted in your browser.</strong>{" "}
                Your PDF was never uploaded; the text was extracted and the
                .docx built on your own device. Paragraphs are fully editable;
                tables arrive as text rather than Word tables and columns are
                read in a single order. If the file came out empty, the PDF is a
                scan. Run OCR PDF over it first, then convert.
              </>
            )}
          </span>
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
