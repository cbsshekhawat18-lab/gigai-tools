"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { formatSql, type SqlDialect } from "@/lib/dev/format";
import {
  Field,
  SegmentedControl,
  SelectField,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** Beautify (multi-line, indented) or Minify (single compact line). */
type Mode = "beautify" | "minify";

/** How reserved keywords should be cased. */
type KeywordCase = "upper" | "lower" | "preserve";

/** Indentation choices for beautified output. */
type Indent = "2" | "4" | "tab";

/** Options driving the live transform. */
interface SqlOptions {
  dialect: SqlDialect;
  mode: Mode;
  keywordCase: KeywordCase;
  indent: Indent;
}

/** Dialects we surface, labelled the way developers name their engine. */
const DIALECTS: ReadonlyArray<{ value: SqlDialect; label: string }> = [
  { value: "sql", label: "Standard SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "tsql", label: "SQL Server (T-SQL)" },
  { value: "bigquery", label: "BigQuery" },
  { value: "snowflake", label: "Snowflake" },
];

/** Byte length of a UTF-8 string via the platform TextEncoder. */
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
 * Collapse formatter output to a single compact line without touching content
 * inside quoted string literals (single, double or backtick). The formatter has
 * already normalised tokens, so we only need to squeeze the whitespace it added
 * back together, safe across dialects.
 */
function collapseToOneLine(formatted: string): string {
  let out = "";
  let quote: string | null = null;
  let pendingSpace = false;

  for (let i = 0; i < formatted.length; i += 1) {
    const ch = formatted[i] ?? "";

    if (quote) {
      out += ch;
      // Handle doubled-quote escapes ('' or "") inside a literal.
      if (ch === quote) {
        if (formatted[i + 1] === quote) {
          out += quote;
          i += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
 if (pendingSpace) {
 out += " ";
 pendingSpace = false;
 }
 quote = ch;
 out += ch;
 continue;
 }

 if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
 if (out.length > 0) pendingSpace = true;
 continue;
 }

 if (pendingSpace) {
 // Don't put a space before punctuation that reads tighter without one.
 if (ch !== "," && ch !== ")" && ch !== ";") out += " ";
 pendingSpace = false;
 }
 out += ch;
 }

 return out.trim();
}

/** Curated sample queries so the empty state is one click from useful. */
const EXAMPLES = [
 {
 label: "Join + filter",
 description: "A one-line query to beautify",
 value:
 "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true and o.created_at >= '2026-01-01' group by u.id, u.name having count(o.id) > 3 order by orders desc limit 20;",
 },
 {
 label: "CTE + window",
 description: "A CTE with a window function",
 value:
 "with ranked as (select customer_id, amount, row_number() over (partition by customer_id order by amount desc) as rn from payments) select customer_id, amount from ranked where rn = 1;",
 },
 {
 label: "Insert",
 description: "A multi-row insert to tidy",
 value:
 "insert into products (sku, name, price, in_stock) values ('A-100', 'Widget', 19.99, true), ('B-250', 'Gadget', 4.5, false), ('C-300', 'Gizmo', 42.0, true);",
 },
 {
 label: "Update + case",
 description: "An UPDATE with a CASE expression",
 value:
 "update accounts set tier = case when balance >= 10000 then 'gold' when balance >= 1000 then 'silver' else 'bronze' end, updated_at = now() where region in ('EU', 'US');",
 },
] as const;

const EXTRA_SHORTCUTS = [
 { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * SQL Formatter, composes the `TransformTool` harness (dual editors, toolbar,
 * drag-drop/paste import, copy/download/share, undo/redo, error banner,
 * keyboard shortcuts) and drives it with the pure `lib/dev/format` engine.
 *
 * `run` formats for the selected dialect with the chosen keyword case and
 * indentation. In Minify mode it formats first (so tokens are normalised
 * per-dialect) and then collapses to a single line, leaving string literals
 * untouched. Character/line counts render as badges so the effect of a change
 * is visible at a glance. Everything runs live, in the browser, nothing
 * uploaded.
 */
export default function SqlFormatterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [dialect, setDialect] = React.useState<SqlDialect>("postgresql");
  const [mode, setMode] = React.useState<Mode>("beautify");
  const [keywordCase, setKeywordCase] = React.useState<KeywordCase>("upper");
  const [indent, setIndent] = React.useState<Indent>("2");

  const options = React.useMemo<SqlOptions>(
    () => ({ dialect, mode, keywordCase, indent }),
    [dialect, mode, keywordCase, indent],
  );

  const run = React.useCallback(
    async (input: string, opts: SqlOptions): Promise<RunResult> => {
      const source = input;
      const useTabs = opts.indent === "tab";
      const tabWidth = opts.indent === "4" ? 4 : 2;

      const result = await formatSql(source, {
        dialect: opts.dialect,
        keywordCase: opts.keywordCase,
        tabWidth,
        useTabs,
      });

      if (!result.ok) {
        return { ok: false, error: result.error.message };
      }

      const output =
        opts.mode === "minify"
          ? collapseToOneLine(result.result)
          : result.result;

      const inBytes = byteLength(source);
      const outBytes = byteLength(output);
      const lines = output ? output.split("\n").length : 0;
      const dialectLabel =
        DIALECTS.find((d) => d.value === opts.dialect)?.label ?? opts.dialect;

      const stats: NonNullable<RunResult["stats"]> = [
        { label: "In", value: formatBytes(inBytes), icon: "FileInput", tone: "default" },
        { label: "Out", value: formatBytes(outBytes), icon: "FileOutput", tone: "info" },
        { label: "Lines", value: lines, icon: "AlignLeft", tone: "default" },
        { label: "Dialect", value: dialectLabel, icon: "Database", tone: "success" },
      ];

      if (opts.mode === "minify") {
        const delta = inBytes - outBytes;
        if (delta > 0) {
          const savedPct = inBytes > 0 ? Math.round((delta / inBytes) * 100) : 0;
          stats.push({
            label: "Saved",
            value: `${formatBytes(delta)} · ${savedPct}%`,
            icon: "TrendingDown",
            tone: "success",
          });
        }
      }

      return { ok: true, output, stats };
    },
    [],
  );

  const indentDisabled = mode === "minify";

  const optionControls = (
    <>
      <Field label="Dialect" hint="Match your database engine">
        <SelectField<SqlDialect>
          value={dialect}
          onChange={setDialect}
          ariaLabel="SQL dialect"
          options={DIALECTS}
        />
      </Field>
      <Field label="Mode">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          ariaLabel="SQL transform mode"
          size="sm"
          options={[
            { value: "beautify", label: "Beautify", icon: "AlignLeft" },
            { value: "minify", label: "Minify", icon: "Minimize2" },
          ]}
        />
      </Field>
      <Field label="Keyword case">
        <SegmentedControl<KeywordCase>
          value={keywordCase}
          onChange={setKeywordCase}
          ariaLabel="Keyword case"
          size="sm"
          options={[
            { value: "upper", label: "UPPER" },
            { value: "lower", label: "lower" },
            { value: "preserve", label: "Aa" },
          ]}
        />
      </Field>
      <Field label="Indent" hint="Used when beautifying">
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
    <TransformTool<SqlOptions>
      run={run}
      options={options}
      inputLabel="SQL input"
      outputLabel={mode === "minify" ? "Minified" : "Formatted"}
      inputPlaceholder="Paste SQL here, drop a.sql file, or load a sample, e.g. select * from users where id = 1;"
      downloadName={mode === "minify" ? "query.min.sql" : "query.sql"}
      downloadMime="application/sql;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
