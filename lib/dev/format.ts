/**
 * GigAI Tools: code formatting engine.
 *
 * Prettier (standalone build) drives source formatting; sql-formatter handles
 * SQL; XML gets a small dependency-free pretty printer. Every heavy dependency
 * is dynamic-imported inside the function that needs it, so none of this weighs
 * on the shared bundle. All functions are async and return a typed result
 * (`{ ok, result }` or `{ ok:false, error }`): user syntax errors never throw.
 */

/** Languages Prettier can format in-browser here. */
export type PrettierLang =
  | "json"
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "css"
  | "scss"
  | "less"
  | "html"
  | "vue"
  | "yaml"
  | "markdown";

export type FormatResult =
  | { ok: true; result: string }
  | { ok: false; error: { message: string; line?: number; column?: number } };

/** SQL dialects supported by sql-formatter that we surface. */
export type SqlDialect =
  | "sql"
  | "mysql"
  | "postgresql"
  | "mariadb"
  | "sqlite"
  | "bigquery"
  | "snowflake"
  | "redshift"
  | "spark"
  | "tsql"
  | "plsql"
  | "db2";

export interface SqlFormatOptions {
  dialect?: SqlDialect;
  keywordCase?: "preserve" | "upper" | "lower";
  tabWidth?: number;
  useTabs?: boolean;
}

/** Map our short lang id to a Prettier parser name. */
const PARSER_BY_LANG: Record<PrettierLang, string> = {
  json: "json",
  js: "babel",
  jsx: "babel",
  ts: "typescript",
  tsx: "typescript",
  css: "css",
  scss: "scss",
  less: "less",
  html: "html",
  vue: "vue",
  yaml: "yaml",
  markdown: "markdown",
};

type PrettierPlugin = import("prettier").Plugin;

/** Normalise an imported plugin module to Prettier's Plugin shape. */
function asPlugin(mod: unknown): PrettierPlugin {
  const m = mod as { default?: unknown };
  return (m && m.default ? m.default : mod) as PrettierPlugin;
}

/** Lazily load the Prettier plugins a given parser depends on. */
async function pluginsFor(parser: string): Promise<PrettierPlugin[]> {
  switch (parser) {
    case "babel":
    case "json": {
      const [babel, estree] = await Promise.all([
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
      ]);
      return [asPlugin(babel), asPlugin(estree)];
    }
    case "typescript": {
      const [ts, estree] = await Promise.all([
        import("prettier/plugins/typescript"),
        import("prettier/plugins/estree"),
      ]);
      return [asPlugin(ts), asPlugin(estree)];
    }
    case "css":
    case "scss":
    case "less": {
      const postcss = await import("prettier/plugins/postcss");
      return [asPlugin(postcss)];
    }
    case "html":
    case "vue": {
      // Vue SFCs embed JS/TS/CSS, so pull the full plugin set.
      const [html, babel, estree, ts, postcss] = await Promise.all([
        import("prettier/plugins/html"),
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
        import("prettier/plugins/typescript"),
        import("prettier/plugins/postcss"),
      ]);
      return [asPlugin(html), asPlugin(babel), asPlugin(estree), asPlugin(ts), asPlugin(postcss)];
    }
    case "yaml": {
      const yaml = await import("prettier/plugins/yaml");
      return [asPlugin(yaml)];
    }
    case "markdown": {
      const md = await import("prettier/plugins/markdown");
      return [asPlugin(md)];
    }
    default:
      return [];
  }
}

/** Pull a line/column out of a Prettier syntax error, when present. */
function prettierErrorLoc(err: unknown): { message: string; line?: number; column?: number } {
  const message = err instanceof Error ? err.message : String(err);
  const loc = (err as { loc?: { start?: { line?: number; column?: number } } })?.loc?.start;
  if (loc && typeof loc.line === "number") {
    return { message, line: loc.line, column: loc.column };
  }
  return { message };
}

/**
 * Format source with Prettier. `indent`/`useTabs` fall back to sensible
 * defaults (2 spaces). Returns positioned errors for invalid input.
 */
export async function formatCode(
  src: string,
  lang: PrettierLang,
  opts: { tabWidth?: number; useTabs?: boolean; printWidth?: number } = {},
): Promise<FormatResult> {
  const parser = PARSER_BY_LANG[lang];
  try {
    const prettier = await import("prettier/standalone");
    const plugins = await pluginsFor(parser);
    const result = await prettier.format(src, {
      parser,
      plugins,
      tabWidth: opts.tabWidth ?? 2,
      useTabs: opts.useTabs ?? false,
      printWidth: opts.printWidth ?? 80,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: prettierErrorLoc(err) };
  }
}

/** Format SQL with sql-formatter. */
export async function formatSql(
  src: string,
  opts: SqlFormatOptions = {},
): Promise<FormatResult> {
  try {
    const { format } = await import("sql-formatter");
    const result = format(src, {
      language: opts.dialect ?? "sql",
      keywordCase: opts.keywordCase ?? "upper",
      tabWidth: opts.tabWidth ?? 2,
      useTabs: opts.useTabs ?? false,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

// ─── XML pretty printer (dependency-free) ────────────────────────────────────

type XmlToken =
  | { type: "open"; raw: string; name: string; selfClosing: boolean }
  | { type: "close"; raw: string; name: string }
  | { type: "text"; raw: string }
  | { type: "verbatim"; raw: string }; // comments, CDATA, PI, doctype

/**
 * Tokenise XML into tags, text, and verbatim blocks (comments / CDATA / PIs /
 * doctype) that must be emitted untouched.
 */
function tokenizeXml(src: string): XmlToken[] {
  const tokens: XmlToken[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    if (src[i] === "<") {
      // Verbatim spans: comments, CDATA, processing instructions, doctype.
      if (src.startsWith("<!--", i)) {
        const end = src.indexOf("-->", i);
        const stop = end === -1 ? n : end + 3;
        tokens.push({ type: "verbatim", raw: src.slice(i, stop) });
        i = stop;
        continue;
      }
      if (src.startsWith("<![CDATA[", i)) {
        const end = src.indexOf("]]>", i);
        const stop = end === -1 ? n : end + 3;
        tokens.push({ type: "verbatim", raw: src.slice(i, stop) });
        i = stop;
        continue;
      }
      if (src.startsWith("<?", i) || src.startsWith("<!", i)) {
        const end = src.indexOf(">", i);
        const stop = end === -1 ? n : end + 1;
        tokens.push({ type: "verbatim", raw: src.slice(i, stop) });
        i = stop;
        continue;
      }
      const end = src.indexOf(">", i);
      const stop = end === -1 ? n : end + 1;
      const raw = src.slice(i, stop);
      const isClose = raw.startsWith("</");
      const selfClosing = /\/\s*>$/.test(raw);
      const nameMatch = /^<\/?\s*([^\s/>]+)/.exec(raw);
      const name = nameMatch && nameMatch[1] ? nameMatch[1] : "";
      if (isClose) tokens.push({ type: "close", raw, name });
      else tokens.push({ type: "open", raw, name, selfClosing });
      i = stop;
      continue;
    }
    const next = src.indexOf("<", i);
    const stop = next === -1 ? n : next;
    tokens.push({ type: "text", raw: src.slice(i, stop) });
    i = stop;
  }
  return tokens;
}

/**
 * Pretty-print XML with the given indent unit (default 2 spaces). Dependency-
 * free: it keeps comments/CDATA/PIs verbatim, honours self-closing tags, and
 * inlines elements whose only child is a single text node (e.g. `<a>b</a>`).
 * Not a validator: malformed nesting is emitted best-effort without throwing.
 */
export async function formatXml(
  src: string,
  opts: { indent?: number | string } = {},
): Promise<FormatResult> {
  try {
    const unit =
      typeof opts.indent === "string"
        ? opts.indent
        : " ".repeat(Math.max(0, Math.min(10, opts.indent ?? 2)));
    const tokens = tokenizeXml(src).filter(
      (t) => !(t.type === "text" && t.raw.trim() === ""),
    );

    const out: string[] = [];
    let depth = 0;
    const pad = (d: number) => unit.repeat(Math.max(0, d));

    for (let idx = 0; idx < tokens.length; idx += 1) {
      const tok = tokens[idx];
      if (!tok) continue;
      if (tok.type === "text") {
        out.push(pad(depth) + tok.raw.trim());
        continue;
      }
      if (tok.type === "verbatim") {
        out.push(pad(depth) + tok.raw.trim());
        continue;
      }
      if (tok.type === "close") {
        depth = Math.max(0, depth - 1);
        out.push(pad(depth) + tok.raw.trim());
        continue;
      }
      // open
      const next = tokens[idx + 1];
      const after = tokens[idx + 2];
      // Inline `<tag>text</tag>` on one line.
      if (
        !tok.selfClosing &&
        next &&
        next.type === "text" &&
        after &&
        after.type === "close" &&
        after.name === tok.name
      ) {
        out.push(pad(depth) + tok.raw.trim() + next.raw.trim() + after.raw.trim());
        idx += 2;
        continue;
      }
      out.push(pad(depth) + tok.raw.trim());
      if (!tok.selfClosing) depth += 1;
    }

    return { ok: true, result: out.join("\n") };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}
