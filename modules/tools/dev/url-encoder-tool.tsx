"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { urlEncode } from "@/lib/dev/encode";
import {
  Field,
  SegmentedControl,
  Toggle,
  TransformTool,
  type Example,
  type RunResult,
} from "@/components/tool/dev";

/* -------------------------------------------------------------------------- */
/*  Types & helpers                                                            */
/* -------------------------------------------------------------------------- */

/** `component` → encodeURIComponent (values); `uri` → encodeURI (whole URLs). */
type EncodeMode = "component" | "uri";

interface EncodeOptions {
  mode: EncodeMode;
  batch: boolean;
}

/** Encode a single string in the chosen mode. */
function encodeOne(text: string, mode: EncodeMode): { ok: true; out: string } | { ok: false; error: string } {
  const res = urlEncode(text, { component: mode === "component" });
  if (!res.ok) return { ok: false, error: res.error.message };
  return { ok: true, out: res.result };
}

const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Query value",
    description: "A search term for a query string",
    value: "coffee & tea near me? 50% off!",
  },
  {
    label: "Full URL with Unicode",
    description: "An assembled address with accents & emoji",
    value: "https://example.com/search?q=café ☕&sort=price",
  },
  {
    label: "UTM batch list",
    description: "One value per line for batch mode",
    value: "summer sale 2026\nnew arrivals, women's\nfree shipping > $50",
  },
];

/* -------------------------------------------------------------------------- */
/*  Sibling decode link                                                        */
/* -------------------------------------------------------------------------- */

function DecodeLink({ accent }: { accent: ReturnType<typeof accentStyle> }) {
  return (
    <Link
      href="/url-decoder"
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        "border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        accent.ring,
      )}
    >
      <Icon name="ArrowLeftRight" size={15} className={accent.text} />
      <span>Need the reverse? Open the URL Decoder</span>
      <Icon
        name="ArrowRight"
        size={15}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reserved-character legend                                                   */
/* -------------------------------------------------------------------------- */

const RESERVED = [
  { ch: " ", code: "%20" },
  { ch: "&", code: "%26" },
  { ch: "=", code: "%3D" },
  { ch: "?", code: "%3F" },
  { ch: "/", code: "%2F" },
  { ch: "#", code: "%23" },
  { ch: "+", code: "%2B" },
] as const;

function ReservedLegend({
  mode,
  accent,
}: {
  mode: EncodeMode;
  accent: ReturnType<typeof accentStyle>;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon name="Info" size={13} className={accent.text} />
        {mode === "component"
          ? "Component mode escapes reserved characters"
          : "Full-URL mode preserves structural characters"}
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label="Reserved character reference">
        {RESERVED.map(({ ch, code }) => {
          const isSpace = ch === " ";
          const glyph = isSpace ? "␣" : ch;
          const readable = isSpace ? "space" : ch;
          // In full-URL (encodeURI) mode, structural characters are left as-is;
          // a space is always encoded to %20 in both modes.
          const preserved = mode === "uri" && !isSpace;
          return (
            <li
              key={code}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs",
                preserved
                  ? "border-dashed border-border text-muted-foreground/70"
                  : cn("border-transparent", accent.soft),
              )}
              title={
                preserved
                  ? `“${readable}” is kept as-is in full-URL mode`
                  : `“${readable}” → ${code}`
              }
            >
              <span aria-hidden>{glyph}</span>
              <Icon name="ArrowRight" size={11} className="opacity-50" />
              <span>{preserved ? ch : code}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Root tool                                                                  */
/* -------------------------------------------------------------------------- */

export default function UrlEncoderTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);
  const [mode, setMode] = React.useState<EncodeMode>("component");
  const [batch, setBatch] = React.useState(false);

  const options = React.useMemo<EncodeOptions>(() => ({ mode, batch }), [mode, batch]);

  const run = React.useCallback((input: string, o: EncodeOptions): RunResult => {
    if (!input) return { ok: true, output: "" };

    if (o.batch) {
      const lines = input.split("\n");
      const out: string[] = [];
      for (const line of lines) {
        const r = encodeOne(line, o.mode);
        if (!r.ok) return { ok: false, error: r.error };
        out.push(r.out);
      }
      const nonEmpty = lines.filter((l) => l.length > 0).length;
      return {
        ok: true,
        output: out.join("\n"),
        stats: [
          { icon: "ListOrdered", label: "Lines", value: String(lines.length), tone: "info" },
          { icon: "Hash", label: "Non-empty", value: String(nonEmpty) },
          { icon: "SplitSquareHorizontal", label: "Mode", value: o.mode === "component" ? "Component" : "Full URL" },
        ],
      };
    }

    const r = encodeOne(input, o.mode);
    if (!r.ok) return { ok: false, error: r.error };
    return {
      ok: true,
      output: r.out,
      stats: [
        { icon: "Type", label: "Input", value: `${input.length} chars` },
        { icon: "Link", label: "Encoded", value: `${r.out.length} chars`, tone: "info" },
        { icon: "SplitSquareHorizontal", label: "Mode", value: o.mode === "component" ? "Component" : "Full URL" },
      ],
    };
  }, []);

  const optionControls = (
    <div className="flex flex-wrap items-end gap-4">
      <Field label="Encoding" hint={mode === "component" ? "encodeURIComponent" : "encodeURI"}>
        <SegmentedControl<EncodeMode>
          value={mode}
          onChange={setMode}
          size="sm"
          ariaLabel="Encoding mode"
          options={[
            { value: "component", label: "Component", icon: "Braces" },
            { value: "uri", label: "Full URL", icon: "Link" },
          ]}
        />
      </Field>
      <Field label="Batch" hint="Encode each line separately">
        <Toggle checked={batch} onChange={setBatch} label="Per-line" />
      </Field>
    </div>
  );

  return (
    <section aria-label="URL encoder" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {mode === "component"
            ? "Escaping a value for a query string or path segment."
            : "Encoding a whole URL while keeping its structure intact."}
        </span>
        <DecodeLink accent={accent} />
      </div>

      <ReservedLegend mode={mode} accent={accent} />

      <TransformTool<EncodeOptions>
        run={run}
        options={options}
        optionControls={optionControls}
        initialInput=""
        inputLabel={batch ? "Text to encode (one item per line)" : "Text to encode"}
        outputLabel={
          <span className="flex items-center gap-2">
            Percent-encoded
            <span className={cn("text-[10px] uppercase tracking-wide", accent.text)}>
              {mode === "component" ? "component" : "full URL"}
              {batch ? " · batch" : ""}
            </span>
          </span>
        }
        inputPlaceholder={
          batch
            ? "Paste a list. Each line is encoded independently. Try: summer sale 2026"
            : "Type or paste text or a URL. Encoding is instant and Unicode-safe. Drop a text file to import it."
        }
        downloadName="encoded.txt"
        downloadMime="text/plain;charset=utf-8"
        examples={EXAMPLES}
        lineNumbers={batch}
      />
    </section>
  );
}
