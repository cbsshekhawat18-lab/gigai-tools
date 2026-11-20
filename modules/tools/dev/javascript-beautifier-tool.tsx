"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import {
  Field,
  SegmentedControl,
  Toggle,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/**
 * Language the beautifier targets. "auto" infers one of the concrete parsers
 * below from the source; the rest force a specific Prettier parser.
 */
type Lang = "auto" | "js" | "ts" | "jsx" | "tsx";

/** Indentation choices, mapped onto Prettier's tabWidth/useTabs. */
type Indent = "2" | "4" | "8" | "tab";

/** Quote style, mapped onto Prettier's singleQuote boolean. */
type Quotes = "single" | "double";

/** Trailing-comma style: the literal values Prettier expects. */
type Trailing = "none" | "es5" | "all";

/** Options driving the live transform. */
interface JsOptions {
  lang: Lang;
  indent: Indent;
  semicolons: boolean;
  quotes: Quotes;
  printWidth: number;
  trailing: Trailing;
}

/** The concrete Prettier parser for a resolved (non-auto) language. */
type Parser = "babel" | "typescript";

/**
 * Lightweight heuristic to pick a parser + JSX flag when the language is
 * "auto". It only needs to be good enough to choose the right Prettier parser;
 * Prettier itself does the real parsing. TypeScript cues win over plain JS, and
 * any JSX-looking tag or a .tsx/.jsx intent enables the JSX-capable parser.
 */
function detect(src: string): { parser: Parser; jsx: boolean } {
  const hasJsx =
    /<[A-Za-z][\w.]*(\s|\/|>)/.test(src) || /<>[\s\S]*<\/>/.test(src);

  // Strong TypeScript-only signals (annotations, interfaces, enums, generics
  // in declarations, `as`/`satisfies`, access modifiers, non-null `!`).
  const tsSignals =
    /(^|\s)(interface|enum|namespace|declare)\s/.test(src) ||
    /\)\s*:\s*[A-Za-z{[(]/.test(src) || // return type annotation
    /:\s*(string|number|boolean|any|unknown|never|void|[A-Z]\w*)\b/.test(src) ||
    /\bas\s+[A-Za-z{[(]/.test(src) ||
    /\bsatisfies\b/.test(src) ||
    /\b(public|private|protected|readonly)\s+\w/.test(src) ||
    /<[A-Za-z][\w, ]*>\s*\(/.test(src); // generic call/def

  const parser: Parser = tsSignals ? "typescript" : "babel";
  return { parser, jsx: hasJsx };
}

/** Resolve options + source into the concrete parser Prettier should use. */
function resolveParser(lang: Lang, src: string): Parser {
  switch (lang) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "babel";
    case "auto":
    default:
      return detect(src).parser;
  }
}

/** A short, human label for the resolved parser, for the stat badge. */
function parserLabel(lang: Lang, src: string): string {
  if (lang === "auto") {
    const { parser, jsx } = detect(src);
    if (parser === "typescript") return jsx ? "TSX" : "TypeScript";
    return jsx ? "JSX" : "JavaScript";
  }
  return { js: "JavaScript", ts: "TypeScript", jsx: "JSX", tsx: "TSX" }[lang];
}

/** Map the indent choice onto Prettier's tabWidth + useTabs. */
function indentArgs(indent: Indent): { tabWidth: number; useTabs: boolean } {
  if (indent === "tab") return { tabWidth: 2, useTabs: true };
  return { tabWidth: indent === "8" ? 8 : indent === "4" ? 4 : 2, useTabs: false };
}

/** Pull a line/column out of a Prettier syntax error, when present. */
function prettierErrorLoc(err: unknown): {
  message: string;
  line?: number;
  column?: number;
} {
  const message = err instanceof Error ? err.message : String(err);
  const loc = (
    err as { loc?: { start?: { line?: number; column?: number } } }
  )?.loc?.start;
  if (loc && typeof loc.line === "number") {
    const out: { message: string; line: number; column?: number } = {
      message,
      line: loc.line,
    };
    if (typeof loc.column === "number") out.column = loc.column;
    return out;
  }
  return { message };
}

type PrettierPlugin = import("prettier").Plugin;

/** Normalise an imported plugin module to Prettier's Plugin shape. */
function asPlugin(mod: unknown): PrettierPlugin {
  const m = mod as { default?: unknown };
  return (m && m.default ? m.default : mod) as PrettierPlugin;
}

/** Lazily load the plugins the chosen parser needs (mirrors the engine). */
async function pluginsFor(parser: Parser): Promise<PrettierPlugin[]> {
  if (parser === "typescript") {
    const [ts, estree] = await Promise.all([
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
    ]);
    return [asPlugin(ts), asPlugin(estree)];
  }
  const [babel, estree] = await Promise.all([
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
  ]);
  return [asPlugin(babel), asPlugin(estree)];
}

/**
 * Format JS/TS/JSX/TSX with Prettier, honouring the full style option set the
 * shared `formatCode` helper doesn't expose (semicolons, quotes, trailing
 * commas). Prettier is dynamic-imported here so it never weighs on the shared
 * bundle, and syntax errors are returned (never thrown).
 */
async function beautify(
  src: string,
  opts: JsOptions,
): Promise<
  | { ok: true; result: string }
  | { ok: false; error: { message: string; line?: number; column?: number } }
> {
  const parser = resolveParser(opts.lang, src);
  const { tabWidth, useTabs } = indentArgs(opts.indent);
  try {
    const prettier = await import("prettier/standalone");
    const plugins = await pluginsFor(parser);
    const result = await prettier.format(src, {
      parser,
      plugins,
      tabWidth,
      useTabs,
      printWidth: opts.printWidth,
      semi: opts.semicolons,
      singleQuote: opts.quotes === "single",
      trailingComma: opts.trailing,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: prettierErrorLoc(err) };
  }
}

/** Curated samples so the empty state is one click from useful. */
const EXAMPLES = [
  {
    label: "Minified one-liner",
    description: "Restore readability",
    value:
      'const sum=(a,b)=>a+b;function greet(name){return name?`Hi ${name}`:"Hi";}export default{sum,greet};',
  },
  {
    label: "React component (JSX)",
    description: "Auto-detected as JSX",
    value:
      'function Card({title,items}){return <div className="card"><h2>{title}</h2><ul>{items.map((i)=><li key={i.id}>{i.label}</li>)}</ul></div>}',
  },
  {
    label: "TypeScript",
    description: "Types & interfaces",
    value:
      'interface User{id:number;name:string;roles:string[]}const format=(u:User):string=>`${u.name} (#${u.id})`;const admins=(us:User[])=>us.filter(u=>u.roles.includes("admin"))',
  },
  {
    label: "Broken JS",
    description: "Missing a closing brace",
    value: 'function broken() {\n  const x = 1;\n  return x\n',
  },
] as const;

const EXTRA_SHORTCUTS = [
  { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * JavaScript Beautifier: composes the `TransformTool` harness (dual editors,
 * toolbar, drag-drop/paste import, copy/download/share, undo/redo, error banner
 * with jump-to-line, keyboard shortcuts) and drives it with a Prettier run that
 * exposes the real style knobs: semicolons, quotes, indentation, print width
 * and trailing commas, with auto language detection for JS/TS/JSX/TSX.
 *
 * On failure Prettier's precise line/column is handed to the harness so the
 * error banner can offer a one-click jump to the offending character. Prettier
 * is dynamic-imported inside the transform, so nothing heavy touches the shared
 * bundle, and every keystroke re-formats live entirely in the browser.
 */
export default function JavaScriptBeautifierTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [lang, setLang] = React.useState<Lang>("auto");
  const [indent, setIndent] = React.useState<Indent>("2");
  const [semicolons, setSemicolons] = React.useState(true);
  const [quotes, setQuotes] = React.useState<Quotes>("double");
  const [printWidth, setPrintWidth] = React.useState(80);
  const [trailing, setTrailing] = React.useState<Trailing>("all");

  const options = React.useMemo<JsOptions>(
    () => ({ lang, indent, semicolons, quotes, printWidth, trailing }),
    [lang, indent, semicolons, quotes, printWidth, trailing],
  );

  const run = React.useCallback(
    async (input: string, opts: JsOptions): Promise<RunResult> => {
      const result = await beautify(input, opts);

      if (!result.ok) {
        const { message, line, column } = result.error;
        return {
          ok: false,
          error: message,
          ...(line != null ? { errorLine: line } : {}),
          ...(column != null ? { errorCol: column } : {}),
        };
      }

      const lineCount = result.result === "" ? 0 : result.result.split("\n").length;

      const stats: NonNullable<RunResult["stats"]> = [
        {
          label: "Lang",
          value: parserLabel(opts.lang, input),
          icon: "Code",
          tone: "info",
        },
        { label: "Lines", value: lineCount, icon: "AlignLeft", tone: "default" },
        { label: "Formatted", value: "OK", icon: "CircleCheck", tone: "success" },
      ];

      return { ok: true, output: result.result, stats };
    },
    [],
  );

  const optionControls = (
    <>
      <Field label="Language" hint="Auto detects JS / TS / JSX / TSX">
        <SegmentedControl<Lang>
          value={lang}
          onChange={setLang}
          ariaLabel="Language / parser"
          size="sm"
          options={[
            { value: "auto", label: "Auto", icon: "WandSparkles" },
            { value: "js", label: "JS" },
            { value: "ts", label: "TS" },
            { value: "jsx", label: "JSX" },
            { value: "tsx", label: "TSX" },
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
            { value: "8", label: "8" },
            { value: "tab", label: "Tab" },
          ]}
        />
      </Field>

      <Field label="Quotes">
        <SegmentedControl<Quotes>
          value={quotes}
          onChange={setQuotes}
          ariaLabel="Quote style"
          size="sm"
          options={[
            { value: "double", label: "Double" },
            { value: "single", label: "Single" },
          ]}
        />
      </Field>

      <Field label="Trailing commas">
        <SegmentedControl<Trailing>
          value={trailing}
          onChange={setTrailing}
          ariaLabel="Trailing comma style"
          size="sm"
          options={[
            { value: "none", label: "None" },
            { value: "es5", label: "ES5" },
            { value: "all", label: "All" },
          ]}
        />
      </Field>

      <Field label="Print width" hint="Where long lines wrap">
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

      <Field label="Semicolons">
        <Toggle
          checked={semicolons}
          onChange={setSemicolons}
          label={semicolons ? "On" : "Off"}
        />
      </Field>
    </>
  );

  return (
    <TransformTool<JsOptions>
      run={run}
      options={options}
      inputLabel="Code input"
      outputLabel="Beautified"
      inputPlaceholder="Paste JS, TS, JSX or TSX here, drop a file, or load a sample, e.g. const x=(a,b)=>a+b"
      downloadName="beautified.js"
      downloadMime="text/javascript;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
