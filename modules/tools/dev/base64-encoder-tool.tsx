"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { base64Encode, fileToBase64 } from "@/lib/dev/encode";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  FileDropZone,
  SegmentedControl,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSpacer,
  TransformTool,
  useFileDrop,
  type Example,
  type RunResult,
} from "@/components/tool/dev";

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

type InputMode = "text" | "file";

interface EncodeOptions {
  urlSafe: boolean;
}

/** Byte length of a UTF-8 string, used to show the encoded-vs-source delta. */
function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Human-readable byte size. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/**
 * Convert a standard (padded) Base64 string into URL-safe Base64: swap +/ for
 * -_ and drop trailing padding. Applied to the raw portion of a file's data
 * URL so the File tab honours the same URL-safe toggle as the Text tab.
 */
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const TEXT_EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Greeting with emoji",
    description: "Unicode round-trips cleanly",
    value: "Hello, world! 👋🌍 Grüße, café, 日本語",
  },
  {
    label: "JSON payload",
    description: "Encode a request body",
    value: '{"user":"ada","roles":["admin","editor"],"active":true}',
  },
  {
    label: "Basic-auth credentials",
    description: "user:pass for an Authorization header",
    value: "aladdin:opensesame",
  },
];

/* -------------------------------------------------------------------------- */
/*  Sibling decode link                                                        */
/* -------------------------------------------------------------------------- */

function DecodeLink({ accent }: { accent: ReturnType<typeof accentStyle> }) {
  return (
    <Link
      href="/base64-decoder"
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        "border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        accent.ring,
      )}
    >
      <Icon name="ArrowLeftRight" size={15} className={accent.text} />
      <span>Need the reverse? Open the Base64 Decoder</span>
      <Icon
        name="ArrowRight"
        size={15}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  File encode panel                                                          */
/* -------------------------------------------------------------------------- */

interface EncodedFile {
  name: string;
  mime: string;
  size: number;
  /** Full `data:<mime>;base64,<data>` URL (always standard Base64). */
  dataUrl: string;
  /** Raw Base64 after the comma. */
  raw: string;
}

/**
 * Split a data URL into its MIME type and raw Base64 payload. FileReader always
 * returns padded, standard-alphabet Base64, so this is a safe split on the
 * first comma.
 */
function splitDataUrl(dataUrl: string): { mime: string; raw: string } {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return { mime: "application/octet-stream", raw: dataUrl };
  const header = dataUrl.slice(0, comma);
  const raw = dataUrl.slice(comma + 1);
  const match = /^data:([^;]*)/.exec(header);
  return { mime: match?.[1] || "application/octet-stream", raw };
}

function FileEncodePanel({
  urlSafe,
  accent,
}: {
  urlSafe: boolean;
  accent: ReturnType<typeof accentStyle>;
}) {
  const [file, setFile] = React.useState<EncodedFile | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const encodeFile = React.useCallback((files: File[]) => {
    const picked = files[0];
    if (!picked) return;
    setBusy(true);
    setError(null);
    fileToBase64(picked)
      .then((dataUrl) => {
        const { mime, raw } = splitDataUrl(dataUrl);
        setFile({
          name: picked.name || "file",
          mime: mime || picked.type || "application/octet-stream",
          size: picked.size,
          dataUrl,
          raw,
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Couldn't read that file.");
        setFile(null);
      })
      .finally(() => setBusy(false));
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles: encodeFile });

  // Apply the URL-safe toggle to the raw payload for display/copy/download.
  const rawOut = file ? (urlSafe ? toUrlSafe(file.raw) : file.raw) : "";
  // Data URLs are only valid with standard Base64, so they stay unmodified.
  const dataUrlOut = file?.dataUrl ?? "";

  const growthPct =
    file && file.size > 0
      ? Math.round((utf8ByteLength(rawOut) / file.size - 1) * 100)
      : 0;

  return (
    <div className="relative flex flex-col gap-3" {...dropProps}>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {!file ? (
        <FileDropZone
          onFiles={encodeFile}
          multiple={false}
          icon="FileUp"
          label={busy ? "Reading file…" : "Drop a file to encode it to Base64"}
          hint="Images, PDFs, fonts, or any binary, or click to browse. Nothing is uploaded."
          className="min-h-[260px]"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* File summary + swap-file control */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <span
              className={cn("grid size-9 place-items-center rounded-md", accent.soft)}
            >
              <Icon name="File" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {file.mime} · {formatBytes(file.size)}
              </p>
            </div>
            <FileDropZone
              onFiles={encodeFile}
              multiple={false}
              icon="RefreshCw"
              label="Replace file"
              className="min-h-0 border-none bg-transparent px-3 py-1.5 text-sm hover:bg-muted"
            />
          </div>

          {/* Raw Base64 */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Raw Base64 {urlSafe && <span className={accent.text}>· URL-safe</span>}
              </span>
              <ToolbarSpacer />
              <CopyButton getValue={() => rawOut} disabled={!rawOut} label="Copy Base64" />
              <DownloadButton
                filename={`${file.name}.b64.txt`}
                getValue={() => rawOut}
                mime="text/plain;charset=utf-8"
                disabled={!rawOut}
                label="Download"
              />
            </div>
            <CodePane
              value={rawOut}
              readOnly
              lineNumbers={false}
              wrap
              ariaLabel="Raw Base64 output"
              minHeight={120}
              maxHeight={260}
            />
          </div>

          {/* Data URL */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Data URL{" "}
                <span className="normal-case text-muted-foreground/70">
                  (paste into CSS / &lt;img&gt; / JSON)
                </span>
              </span>
              <ToolbarSpacer />
              <CopyButton
                getValue={() => dataUrlOut}
                disabled={!dataUrlOut}
                label="Copy data URL"
              />
            </div>
            <CodePane
              value={dataUrlOut}
              readOnly
              lineNumbers={false}
              wrap
              ariaLabel="Data URL output"
              minHeight={90}
              maxHeight={200}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatBadge icon="HardDrive" label="Source" value={formatBytes(file.size)} />
            <StatBadge
              icon="Binary"
              label="Base64"
              value={formatBytes(utf8ByteLength(rawOut))}
              tone="info"
            />
            <StatBadge icon="TrendingUp" label="Overhead" value={`+${growthPct}%`} />
          </div>
        </div>
      )}

      {isDragging && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl border-2 border-dashed backdrop-blur-[2px]",
            accent.border,
          )}
        >
          <div className="flex flex-col items-center gap-2 rounded-lg bg-background/80 px-6 py-4">
            <Icon name="FileUp" size={28} className={accent.text} />
            <span className="text-sm font-medium">Drop to encode this file</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Root tool                                                                  */
/* -------------------------------------------------------------------------- */

export default function Base64EncoderTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [mode, setMode] = React.useState<InputMode>("text");
  const [urlSafe, setUrlSafe] = React.useState(false);

  // Live text → Base64. Memoised on the option so TransformTool re-runs on toggle.
  const options = React.useMemo<EncodeOptions>(() => ({ urlSafe }), [urlSafe]);

  const runEncode = React.useCallback(
    (input: string, opts: EncodeOptions): RunResult => {
      const res = base64Encode(input, { urlSafe: opts.urlSafe });
      if (!res.ok) return { ok: false, error: res.error.message };
      const sourceBytes = utf8ByteLength(input);
      const outBytes = utf8ByteLength(res.result);
      const growth =
        sourceBytes > 0 ? Math.round((outBytes / sourceBytes - 1) * 100) : 0;
      return {
        ok: true,
        output: res.result,
        stats: [
          { icon: "Type", label: "Source", value: formatBytes(sourceBytes) },
          {
            icon: "Binary",
            label: "Base64",
            value: formatBytes(outBytes),
            tone: "info",
          },
          { icon: "TrendingUp", label: "Overhead", value: `+${growth}%` },
        ],
      };
    },
    [],
  );

  const urlSafeToggle = (
    <Toggle
      checked={urlSafe}
      onChange={setUrlSafe}
      label="URL-safe"
    />
  );

  return (
    <section aria-label="Base64 encoder" className="flex flex-col gap-4">
      {/* Mode + option header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl<InputMode>
          value={mode}
          onChange={setMode}
          ariaLabel="Choose what to encode"
          options={[
            { value: "text", label: "Text", icon: "Type" },
            { value: "file", label: "File", icon: "File" },
          ]}
        />
        <div className="flex items-center gap-3">
          {mode === "file" && urlSafeToggle}
          <DecodeLink accent={accent} />
        </div>
      </div>

      {mode === "text" ? (
        <TransformTool<EncodeOptions>
          run={runEncode}
          options={options}
          optionControls={urlSafeToggle}
          initialInput=""
          inputLabel="Text to encode"
          outputLabel={
            <span className="flex items-center gap-2">
              Base64
              {urlSafe && (
                <span className={cn("text-[10px] uppercase tracking-wide", accent.text)}>
                  URL-safe
                </span>
              )}
            </span>
          }
          inputPlaceholder="Type or paste text. Encoding is instant and Unicode-safe. Drop a text file to import it, or switch to the File tab for binaries."
          downloadName="encoded.txt"
          downloadMime="text/plain;charset=utf-8"
          examples={TEXT_EXAMPLES}
          lineNumbers={false}
        />
      ) : (
        <>
          <Toolbar>
            <ToolbarGroup>
              <ToolbarButton
                icon="Type"
                label="Encode text instead"
                labelMode="responsive"
                onClick={() => setMode("text")}
              />
            </ToolbarGroup>
            <ToolbarSpacer />
          </Toolbar>
          <FileEncodePanel urlSafe={urlSafe} accent={accent} />
        </>
      )}
    </section>
  );
}
