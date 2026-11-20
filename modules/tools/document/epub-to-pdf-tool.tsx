"use client";

/**
 * EPUB to PDF, Document Studio ebook converter.
 *
 * Built on <ConvertShell>: drop an .epub, preview the source, choose a page
 * size, then export a paginated PDF. The heavy lifting is REUSED from the shared
 * engine (`epub.epubToPdf`), epubjs opens the archive, each chapter's sanitised
 * HTML is paginated by the shared html2canvas renderer. Everything is lazy and
 * in-browser; nothing is uploaded.
 *
 * HONEST: EPUB is reflowable, so the PDF is a linearised reading copy, not a
 * byte-perfect reproduction of the publisher's typeset pages. DRM'd books can't
 * be opened. Both caveats are surfaced in the UI.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Field, SegmentedControl } from "@/components/tool/dev";
import { ConvertShell } from "@/components/tool/document";
import { epubToPdf } from "@/lib/document-tools/epub";
import { withExtension } from "@/lib/document-tools/shared";

type PageSize = "a4" | "letter";

const PAGE_SIZES: ReadonlyArray<{ value: PageSize; label: string }> = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
];

export default function EpubToPdfTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [pageSize, setPageSize] = React.useState<PageSize>("a4");

  const convert = React.useCallback(
    async (file: File, setStatus: (s: string) => void) => {
      setStatus("Opening ebook…");
      // Yield so the busy screen paints before the (heavy) render begins.
      await new Promise((r) => setTimeout(r, 0));
      setStatus("Reading chapters & rendering pages…");

      const res = await epubToPdf(file, { format: pageSize });
      if (!res.ok) {
        throw new Error(
          res.error ||
            "This EPUB couldn't be opened. If it's DRM-protected it can't be converted. Try a DRM-free file.",
        );
      }

      return {
        filename: withExtension(file.name, "pdf"),
        blob: res.result,
        mime: "application/pdf",
        note:
          "EPUB is reflowable, so this PDF is a faithful linearised reading copy, chapters in order with text and images intact, not a byte-perfect clone of the publisher's typeset layout. Pages are rendered as images, so the text isn't selectable. Use EPUB to Text if you need the plain words.",
      };
    },
    [pageSize],
  );

  return (
    <ConvertShell
      accept={["epub"]}
      convertLabel="Convert to PDF"
      dropLabel="Drop an EPUB ebook here"
      dropHint="Or click to browse,.epub files, converted in your browser"
      dropIcon="BookOpen"
      convert={convert}
      options={
        <Field
          label="Page size"
          hint="Match your printer or reading device."
        >
          <SegmentedControl
            value={pageSize}
            onChange={setPageSize}
            options={PAGE_SIZES}
            ariaLabel="Page size"
            size="sm"
          />
        </Field>
      }
      limitationNote={
        <span>
          Only DRM-free EPUBs can be converted, DRM-protected books (most store
          purchases and library loans) are encrypted and can&apos;t be opened.
          Because EPUB is reflowable, the PDF is a linearised reading copy, not a
          byte-perfect reproduction of the original typeset pages. Everything
          runs in your browser; nothing is uploaded.
        </span>
      }
    />
  );
}
