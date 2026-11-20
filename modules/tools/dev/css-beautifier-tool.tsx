"use client";

import * as React from "react";

import type { Tool, WorkspaceToolData } from "@/types";
import { formatCode } from "@/lib/dev/format";
import {
  Field,
  SegmentedControl,
  TransformTool,
  type Example,
  type RunResult,
} from "@/components/tool/dev";

/* -------------------------------------------------------------------------- */
/*  Types & options                                                            */
/* -------------------------------------------------------------------------- */

/** Stylesheet flavour. "auto" is resolved from the source before formatting. */
type Syntax = "auto" | "css" | "scss" | "less";

/** Concrete Prettier parsers this tool drives. */
type Lang = "css" | "scss" | "less";

/** Indentation choices for the formatted output. */
type Indent = "2" | "4" | "tab";

interface CssOptions {
  syntax: Syntax;
  indent: Indent;
  printWidth: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Best-effort syntax detection for the "auto" mode. SCSS-only tells (nesting,
 * $variables, @mixin/@include, #{} interpolation, // line comments) beat
 * LESS-only tells (@variables, .mixin() calls, & references with LESS ops).
 * When nothing distinctive appears we fall back to plain CSS, which Prettier
 * formats fine for the common subset.
 */
function detectSyntax(src: string): Lang {
  const s = src;
  // SCSS signals.
  const scss =
    /(^|\s)\$[\w-]+\s*:/.test(s) || // $var:
    /@(mixin|include|if|else|each|for|while|function|use|forward)\b/.test(s) ||
    /#\{[^}]*\}/.test(s) || // #{ interpolation }
    /%[\w-]+\s*\{/.test(s); // %placeholder {
  if (scss) return "scss";

  // LESS signals: @var: declarations and .mixin(); calls.
  const less =
    /@[\w-]+\s*:/.test(s) || // @var: (LESS variable)
    /\.[\w-]+\s*\([^)]*\)\s*;/.test(s); // .mixin();
  if (less) return "less";

  // Nested rule bodies (a `{` inside another block) without CSS at-rule context
  // strongly imply a preprocessor; prefer SCSS as the safe superset.
  if (/\{[^{}]*\{/.test(s.replace(/@(media|supports|keyframes|font-face|page)[^{]*\{/gi, "")))
    return "scss";

  return "css";
}

/** Resolve the user's syntax choice to a concrete Prettier parser. */
function resolveLang(syntax: Syntax, src: string): Lang {
  return syntax === "auto" ? detectSyntax(src) : syntax;
}

/** Map the indent choice to Prettier's tabWidth / useTabs pair. */
function indentArg(indent: Indent): { tabWidth: number; useTabs: boolean } {
  if (indent === "tab") return { tabWidth: 2, useTabs: true };
  return { tabWidth: indent === "4" ? 4 : 2, useTabs: false };
}

const LANG_LABEL: Record<Lang, string> = {
  css: "CSS",
  scss: "SCSS",
  less: "LESS",
};

const DOWNLOAD_MIME: Record<Lang, string> = {
  css: "text/css;charset=utf-8",
  scss: "text/x-scss;charset=utf-8",
  less: "text/x-less;charset=utf-8",
};

/* -------------------------------------------------------------------------- */
/*  Samples                                                                     */
/* -------------------------------------------------------------------------- */

const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Minified CSS",
    description: "Unminify a compact stylesheet",
    icon: "FileCode",
    value:
      ".card{display:flex;gap:.5rem;padding:16px 24px;border:1px solid #e2e8f0;border-radius:12px}.card__title{font-size:1.125rem;font-weight:600;color:#0f172a}.card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}@media(max-width:640px){.card{padding:12px}}",
  },
  {
    label: "Nested SCSS",
    description: "Variables, nesting & a mixin",
    icon: "ListTree",
    value:
      "$brand: #06b6d4; $space: 8px;\n@mixin flex($g:$space){display:flex;gap:$g;}\n.nav{ @include flex(16px). A{color:$brand; &:hover{color:darken($brand,10%);} &.active{font-weight:700;}} @media (max-width:600px){flex-direction:column;} }",
  },
  {
    label: "LESS variables",
    description: "@variables and a mixin call",
    icon: "Braces",
    value:
      "@primary: #6366f1; @radius: 10px;\n.rounded(@r: @radius){border-radius:@r;}\n.btn{ .rounded(). Background:@primary. Color:#fff. Padding:10px 18px; &:hover{background:lighten(@primary,8%);} }",
  },
  {
    label: "Broken CSS",
    description: "Missing a closing brace. Try fixing it",
    icon: "TriangleAlert",
    value: ".hero {\n  display: grid;\n  place-items: center;\n\n.footer { color: #64748b; }",
  },
];

const EXTRA_SHORTCUTS = [{ combo: "esc", description: "Dismiss the error banner" }];

/* -------------------------------------------------------------------------- */
/*  Tool                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * CSS Beautifier, composes the `TransformTool` harness (dual editors, toolbar,
 * drag-drop/paste import, copy/download/share, undo/redo, error banner with
 * jump-to-line, keyboard shortcuts) with the async Prettier-backed
 * `formatCode` engine.
 *
 * The single async `run` resolves the effective syntax (auto-detected or
 * pinned), formats with the chosen indent and print width, and on failure hands
 * Prettier's precise line/column to the harness so the error banner can offer a
 * one-click jump to the offending character. A stat strip reports the detected
 * flavour and the applied settings. Everything runs live, in the browser, with
 * nothing uploaded.
 */
export default function CssBeautifierTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [syntax, setSyntax] = React.useState<Syntax>("auto");
  const [indent, setIndent] = React.useState<Indent>("2");
  const [printWidth, setPrintWidth] = React.useState<number>(80);

  const options = React.useMemo<CssOptions>(
    () => ({ syntax, indent, printWidth }),
    [syntax, indent, printWidth],
  );

  const run = React.useCallback(
    async (input: string, opts: CssOptions): Promise<RunResult> => {
      const lang = resolveLang(opts.syntax, input);
      const { tabWidth, useTabs } = indentArg(opts.indent);

      const res = await formatCode(input, lang, {
        tabWidth,
        useTabs,
        printWidth: opts.printWidth,
      });

      if (!res.ok) {
        const { message, line, column } = res.error;
        return {
          ok: false,
          error: message,
          ...(line != null ? { errorLine: line } : {}),
          ...(column != null ? { errorCol: column } : {}),
        };
      }

      const stats: NonNullable<RunResult["stats"]> = [
        {
          label: "Syntax",
          value:
            opts.syntax === "auto"
              ? `Auto · ${LANG_LABEL[lang]}`
              : LANG_LABEL[lang],
          icon: "ScanLine",
          tone: "info",
        },
        {
          label: "Indent",
          value: opts.indent === "tab" ? "Tab" : `${opts.indent} sp`,
          icon: "IndentIncrease",
          tone: "default",
        },
        {
          label: "Width",
          value: String(opts.printWidth),
          icon: "MoveHorizontal",
          tone: "default",
        },
        {
          label: "Formatted",
          value: LANG_LABEL[lang],
          icon: "CircleCheck",
          tone: "success",
        },
      ];

      return { ok: true, output: res.result, stats };
    },
    [],
  );

  // For the live download name/mime, mirror the effective language. When on
  // auto we default to .css; the stat strip shows what was actually detected.
  const effectiveLang: Lang = syntax === "auto" ? "css" : syntax;

  const optionControls = (
    <>
      <Field label="Syntax" hint="Auto detects CSS, SCSS or LESS">
        <SegmentedControl<Syntax>
          value={syntax}
          onChange={setSyntax}
          ariaLabel="Stylesheet syntax"
          size="sm"
          options={[
            { value: "auto", label: "Auto", icon: "ScanLine" },
            { value: "css", label: "CSS" },
            { value: "scss", label: "SCSS" },
            { value: "less", label: "LESS" },
          ]}
        />
      </Field>
      <Field label="Indent">
        <SegmentedControl<Indent>
          value={indent}
          onChange={setIndent}
          ariaLabel="Indentation size"
          size="sm"
          options={[
            { value: "2", label: "2" },
            { value: "4", label: "4" },
            { value: "tab", label: "Tab" },
          ]}
        />
      </Field>
      <Field label="Print width" hint="Wrap target for long lines">
        <SegmentedControl<string>
          value={String(printWidth)}
          onChange={(v) => setPrintWidth(Number(v))}
          ariaLabel="Print width"
          size="sm"
          options={[
            { value: "60", label: "60" },
            { value: "80", label: "80" },
            { value: "100", label: "100" },
            { value: "120", label: "120" },
          ]}
        />
      </Field>
    </>
  );

  return (
    <TransformTool<CssOptions>
      run={run}
      options={options}
      inputLabel="CSS / SCSS / LESS input"
      outputLabel="Beautified"
      inputPlaceholder="Paste CSS, SCSS or LESS here, drop a.css/.scss/.less file, or load a sample, e.g..btn{color:red;padding:8px}"
      downloadName={`beautified.${effectiveLang}`}
      downloadMime={DOWNLOAD_MIME[effectiveLang]}
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
