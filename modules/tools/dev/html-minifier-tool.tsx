"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { minifyHtml } from "@/lib/dev/minify";
import {
  Field,
  Toggle,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** Options driving the live HTML minification. */
interface HtmlMinifyOptions {
  stripComments: boolean;
}

/** UTF-8 byte length of a string, matching on-the-wire size. */
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

/**
 * Re-insert the comments that the engine strips. `minifyHtml` always removes
 * ordinary comments (keeping IE conditionals), so when the user turns comment
 * stripping OFF we minify a copy in which every non-conditional comment has been
 * parked behind a placeholder, then restore it verbatim afterwards. This keeps
 * the engine as the single source of whitespace behaviour while still honouring
 * the toggle: placeholders are chosen to survive whitespace collapse intact.
 */
const COMMENT_TOKEN = "GKSHTMLCOMMENT";

async function minifyPreservingComments(
  src: string,
): Promise<
  | { ok: true; result: string; before: number; after: number }
  | { ok: false; error: string }
> {
  const comments: string[] = [];
  // Park ordinary comments only; leave IE conditionals for the engine to keep.
  const parked = src.replace(/<!--[\s\S]*?-->/g, (match) => {
    if (/^<!--\[if/i.test(match)) return match;
    const token = `${COMMENT_TOKEN}${comments.length}_`;
    comments.push(match);
    return token;
  });

  const res = await minifyHtml(parked);
  if (!res.ok) return { ok: false, error: res.error.message };

  const restored = res.result.replace(
    new RegExp(`${COMMENT_TOKEN}(\\d+)_`, "g"),
    (_m, i: string) => comments[Number(i)] ?? "",
  );

  return {
    ok: true,
    result: restored,
    before: byteLength(src),
    after: byteLength(restored),
  };
}

/** A realistic, indented, comment-laden sample so the empty state is useful. */
const SAMPLE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- primary meta -->
    <meta charset="utf-8" />
    <title>GigAI   Tools</title>
    <style>
      .btn { color: #f97316; padding: 8px 16px; }
    </style>
  </head>
  <body>
    <!--[if IE]><p>Please upgrade your browser.</p><![endif]-->
    <main class="wrapper">
      <h1>   Hello,    world   </h1>
      <p>
        This paragraph has     lots   of   whitespace
        that a minifier can    safely    collapse.
      </p>
      <pre>
  keep      this
      spacing   intact
      </pre>
      <script>
        // this stays verbatim
        const x = { a: 1,    b: 2 };
        console.log(x);
      </script>
    </main>
  </body>
</html>`;

const EXAMPLES = [
  {
    label: "Sample page",
    description: "Indented HTML with comments, <pre>, <style> and <script>",
    value: SAMPLE,
  },
  {
    label: "Fragment",
    description: "A comment-heavy component fragment",
    value:
      '<!-- card -->\n<div class="card">\n    <span class="badge">New</span>\n    <h3>   Title   </h3>\n    <p>   Body copy with   extra   spaces.   </p>\n</div>\n<!-- /card -->',
  },
] as const;

const EXTRA_SHORTCUTS = [
  { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * HTML Minifier, composes the `TransformTool` harness (dual editors, toolbar,
 * drag-drop/paste import, copy/download/share, undo/redo, error banner and
 * keyboard shortcuts) with the pure `lib/dev/minify` HTML collapser.
 *
 * The engine collapses inter-tag and in-text whitespace, strips ordinary
 * comments (keeping IE conditionals) and trims the document, all while lifting
 * out <pre>/<textarea>/<script>/<style> and restoring them verbatim. A single
 * toggle controls whether comments are removed: when off, ordinary comments are
 * parked behind placeholders and restored after minification. Byte-size stats
 * (input, output, % saved) render as badges so the win is visible at a glance.
 * Everything runs live, in the browser, with nothing uploaded.
 */
export default function HtmlMinifierTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [stripComments, setStripComments] = React.useState(true);

  const options = React.useMemo<HtmlMinifyOptions>(
    () => ({ stripComments }),
    [stripComments],
  );

  const run = React.useCallback(
    async (input: string, opts: HtmlMinifyOptions): Promise<RunResult> => {
      if (input.trim() === "") return { ok: true, output: "" };

      let output: string;
      let before: number;
      let after: number;

      if (opts.stripComments) {
        const res = await minifyHtml(input);
        if (!res.ok) return { ok: false, error: res.error.message };
        output = res.result;
        before = res.stats.before;
        after = res.stats.after;
      } else {
        const res = await minifyPreservingComments(input);
        if (!res.ok) return { ok: false, error: res.error };
        output = res.result;
        before = res.before;
        after = res.after;
      }

      const delta = before - after;
      const savedPct = before > 0 ? Math.round((delta / before) * 100) : 0;

      const stats: NonNullable<RunResult["stats"]> = [
        { label: "In", value: formatBytes(before), icon: "FileInput", tone: "default" },
        { label: "Out", value: formatBytes(after), icon: "FileOutput", tone: "info" },
      ];

      if (delta > 0) {
        stats.push({
          label: "Saved",
          value: `${formatBytes(delta)} · ${savedPct}%`,
          icon: "TrendingDown",
          tone: "success",
        });
      } else {
        stats.push({
          label: "Saved",
          value: "0%",
          icon: "Minus",
          tone: "default",
        });
      }

      return { ok: true, output, stats };
    },
    [],
  );

  const optionControls = (
    <Field label="Comments" hint="IE conditional comments are always kept">
      <Toggle
        checked={stripComments}
        onChange={setStripComments}
        label="Strip comments"
      />
    </Field>
  );

  return (
    <TransformTool<HtmlMinifyOptions>
      run={run}
      options={options}
      inputLabel="HTML input"
      outputLabel="Minified HTML"
      inputPlaceholder="Paste HTML here, drop an .html file, or load the sample…"
      downloadName="output.min.html"
      downloadMime="text/html;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
