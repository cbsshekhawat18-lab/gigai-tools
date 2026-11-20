"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { formatXml } from "@/lib/dev/format";
import {
  Field,
  SegmentedControl,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** Beautify (pretty-print) or minify (collapse whitespace). */
type Mode = "beautify" | "minify";

/** Indentation choices for beautify output. */
type Indent = "2" | "4" | "tab";

/** Options driving the live transform. */
interface XmlOptions {
  mode: Mode;
  indent: Indent;
}

/** Byte length of a UTF-8 string, using the platform TextEncoder. */
const ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
function byteLength(s: string): number {
  if (ENCODER) return ENCODER.encode(s).length;
  return unescape(encodeURIComponent(s)).length;
}

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Map the indent choice onto the engine's `number | "\t"` argument. */
function indentArg(indent: Indent): number | "\t" {
  if (indent === "tab") return "\t";
  return indent === "4" ? 4 : 2;
}

/** A located, human-readable well-formedness error. */
interface XmlWellFormednessError {
  message: string;
  line?: number;
  column?: number;
}

/**
 * Check XML well-formedness with the browser's native DOMParser. Returns `null`
 * when the document is well-formed, or a cleaned-up message (with a line/column
 * when the browser reports one) when it isn't. SSR-safe: if no DOMParser is
 * available it skips the check rather than blocking formatting.
 */
function checkWellFormed(src: string): XmlWellFormednessError | null {
  if (typeof DOMParser === "undefined") return null;
  const trimmed = src.trim();
  if (!trimmed) return null;

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(src, "application/xml");
  } catch (err) {
    return { message: err instanceof Error ? err.message : String(err) };
  }

  const errNode = doc.querySelector("parsererror");
  if (!errNode) return null;

  const raw = (errNode.textContent ?? "Invalid XML").trim();

  // Firefox reports "error on line N at column M:"; Chrome/WebKit report
  // "error on line N at column M" or embed it in the message body.
  const lineMatch = /line\s+(\d+)/i.exec(raw);
  const colMatch = /column\s+(\d+)/i.exec(raw);

  // Prefer a concise first sentence over the browser's verbose dump.
  const firstLine =
    raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .find((l) => !/^-+\^?$/.test(l)) ?? raw;

  const line = lineMatch?.[1] ? Number(lineMatch[1]) : undefined;
  const column = colMatch?.[1] ? Number(colMatch[1]) : undefined;

  return {
    message: firstLine.replace(/\s+/g, " ").slice(0, 300),
    ...(line != null ? { line } : {}),
    ...(column != null ? { column } : {}),
  };
}

/**
 * Minify XML: drop the whitespace-only text nodes between tags while keeping
 * the significant whitespace inside text content, and leave verbatim blocks
 * (comments, CDATA, declaration, PIs, DOCTYPE) untouched. Dependency-free and
 * tokeniser-based so it never corrupts a CDATA `>` or a comment.
 */
function minifyXml(src: string): string {
  const out: string[] = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    if (src[i] === "<") {
      // Verbatim spans emitted exactly as-is.
      if (src.startsWith("<!--", i)) {
        const end = src.indexOf("-->", i);
        const stop = end === -1 ? n : end + 3;
        out.push(src.slice(i, stop));
        i = stop;
        continue;
      }
      if (src.startsWith("<![CDATA[", i)) {
        const end = src.indexOf("]]>", i);
        const stop = end === -1 ? n : end + 3;
        out.push(src.slice(i, stop));
        i = stop;
        continue;
      }
      if (src.startsWith("<?", i) || src.startsWith("<!", i)) {
        const end = src.indexOf(">", i);
        const stop = end === -1 ? n : end + 1;
        out.push(src.slice(i, stop));
        i = stop;
        continue;
      }
      const end = src.indexOf(">", i);
      const stop = end === -1 ? n : end + 1;
      // Collapse internal runs of whitespace inside the tag to single spaces.
      out.push(src.slice(i, stop).replace(/\s+/g, " ").replace(/\s+>/g, ">"));
      i = stop;
      continue;
    }
    const next = src.indexOf("<", i);
    const stop = next === -1 ? n : next;
    const text = src.slice(i, stop);
    // Drop whitespace-only nodes between tags; keep real text content verbatim.
    if (text.trim() !== "") out.push(text);
    i = stop;
  }

  return out.join("");
}

/** Curated sample documents so the empty state is one click from useful. */
const EXAMPLES = [
  {
    label: "Minified feed",
    description: "A one-line RSS blob to beautify",
    value:
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>GigAI Blog</title><link>https://gigai.example/blog</link><item><title>Hello XML</title><guid>a1</guid></item></channel></rss>',
  },
  {
    label: "Config with CDATA",
    description: "Comments and CDATA are preserved",
    value:
      '<config>\n<!-- database credentials -->\n<db host="localhost" port="5432"/>\n<query><![CDATA[SELECT * FROM users WHERE id < 10 & active = 1]]></query>\n</config>',
  },
  {
    label: "SOAP envelope",
    description: "Namespaced, nested, beautify to read it",
    value:
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><m:GetPrice xmlns:m="https://gigai.example/prices"><m:Item>Widget</m:Item></m:GetPrice></soap:Body></soap:Envelope>',
  },
  {
    label: "Broken XML",
    description: "A mismatched tag. Try the well-formedness check",
    value: '<note>\n  <to>Ada</to>\n  <from>Grace</from>\n  <body>Hi there</note>',
  },
] as const;

const EXTRA_SHORTCUTS = [
  { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * XML Formatter, a desktop-grade XML editor that composes the `TransformTool`
 * harness (dual editors, toolbar, drag-drop/paste import, copy/download/share,
 * undo/redo, error banner, keyboard shortcuts) with the pure `lib/dev/format`
 * XML engine.
 *
 * The `run` first validates well-formedness with the browser's native XML
 * parser so genuinely broken markup surfaces a located error instead of being
 * silently reflowed. When the document is well-formed it either pretty-prints
 * via `formatXml` (comments/CDATA/declaration/PIs kept verbatim, text-only
 * elements inlined) or minifies via a dependency-free tokeniser that collapses
 * only insignificant whitespace. Byte-size before/after stats render as badges
 * so minify savings are visible at a glance. Everything runs live, in the
 * browser, with nothing uploaded.
 */
export default function XmlFormatterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [mode, setMode] = React.useState<Mode>("beautify");
  const [indent, setIndent] = React.useState<Indent>("2");

  const options = React.useMemo<XmlOptions>(
    () => ({ mode, indent }),
    [mode, indent],
  );

  const run = React.useCallback(
    async (input: string, opts: XmlOptions): Promise<RunResult> => {
      const source = input;

      // 1. Well-formedness first: a broken document should surface a located
      // error rather than best-effort reflowed (possibly worse) markup.
      const wf = checkWellFormed(source);
      if (wf) {
        return {
          ok: false,
          error: wf.message,
          ...(wf.line != null ? { errorLine: wf.line } : {}),
          ...(wf.column != null ? { errorCol: wf.column } : {}),
        };
      }

      // 2. Transform.
      let output: string;
      if (opts.mode === "minify") {
        output = minifyXml(source);
      } else {
        const r = await formatXml(source, { indent: indentArg(opts.indent) });
        if (!r.ok) {
          return {
            ok: false,
            error: r.error.message,
            ...(r.error.line != null ? { errorLine: r.error.line } : {}),
            ...(r.error.column != null ? { errorCol: r.error.column } : {}),
          };
        }
        output = r.result;
      }

      const inBytes = byteLength(source);
      const outBytes = byteLength(output);
      const delta = inBytes - outBytes;
      const savedPct = inBytes > 0 ? Math.round((delta / inBytes) * 100) : 0;

      const stats: NonNullable<RunResult["stats"]> = [
        { label: "In", value: formatBytes(inBytes), icon: "FileInput", tone: "default" },
        { label: "Out", value: formatBytes(outBytes), icon: "FileOutput", tone: "info" },
        { label: "Well-formed", value: "XML", icon: "CircleCheck", tone: "success" },
      ];

      if (opts.mode === "minify" && delta > 0) {
        stats.push({
          label: "Saved",
          value: `${formatBytes(delta)} · ${savedPct}%`,
          icon: "TrendingDown",
          tone: "success",
        });
      }

      return { ok: true, output, stats };
    },
    [],
  );

  const indentDisabled = mode === "minify";

  const optionControls = (
    <>
      <Field label="Mode">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          ariaLabel="XML transform mode"
          size="sm"
          options={[
            { value: "beautify", label: "Beautify", icon: "AlignLeft" },
            { value: "minify", label: "Minify", icon: "Minimize2" },
          ]}
        />
      </Field>
      <Field label="Indent" hint="Used for Beautify">
        <SegmentedControl<Indent>
          value={indent}
          onChange={setIndent}
          ariaLabel="Indentation size"
          size="sm"
          className={indentDisabled ? "opacity-40" : undefined}
          options={[
            { value: "2", label: "2" },
            { value: "4", label: "4" },
            { value: "tab", label: "Tab" },
          ]}
        />
      </Field>
    </>
  );

  return (
    <TransformTool<XmlOptions>
      run={run}
      options={options}
      inputLabel="XML input"
      outputLabel={mode === "minify" ? "Minified" : "Beautified"}
      inputPlaceholder='Paste XML here, drop an.xml /.svg /.rss file, or load a sample: e.g. <note><to>Ada</to></note>'
      downloadName={mode === "minify" ? "output.min.xml" : "output.xml"}
      downloadMime="application/xml;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
