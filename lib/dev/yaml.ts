/**
 * GigAI Tools, YAML ↔ JSON engine.
 *
 * Conversion via js-yaml (dynamic-imported). `yamlToJson` parses YAML and
 * re-serialises as pretty JSON; `jsonToYaml` parses JSON and dumps YAML.
 * Malformed input returns a typed, positioned error, never throws.
 */

export type YamlResult =
  | { ok: true; result: string }
  | { ok: false; error: { message: string; line?: number; column?: number } };

/** Pull a line/column out of a js-yaml `YAMLException`, when present. */
function yamlErrorLoc(err: unknown): { message: string; line?: number; column?: number } {
  const message = err instanceof Error ? err.message : String(err);
  const mark = (err as { mark?: { line?: number; column?: number } })?.mark;
  if (mark && typeof mark.line === "number") {
    // js-yaml marks are 0-based; present them 1-based.
    return {
      message,
      line: mark.line + 1,
      column: typeof mark.column === "number" ? mark.column + 1 : undefined,
    };
  }
  return { message };
}

/**
 * Convert YAML to pretty JSON. `indent` sets the JSON indentation (default 2).
 * Multi-document YAML streams are not supported; only the first document is read.
 */
export async function yamlToJson(
  src: string,
  opts: { indent?: number } = {},
): Promise<YamlResult> {
  try {
    const yaml = await import("js-yaml");
    const value = yaml.load(src);
    const indent = Math.max(0, Math.min(10, opts.indent ?? 2));
    return { ok: true, result: JSON.stringify(value ?? null, null, indent) };
  } catch (err) {
    return { ok: false, error: yamlErrorLoc(err) };
  }
}

/**
 * Convert JSON to YAML. `indent` sets the YAML block indentation (default 2).
 * Returns a positioned error for invalid JSON.
 */
export async function jsonToYaml(
  src: string,
  opts: { indent?: number } = {},
): Promise<YamlResult> {
  let value: unknown;
  try {
    value = JSON.parse(src);
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
  try {
    const yaml = await import("js-yaml");
    const result = yaml.dump(value, {
      indent: Math.max(1, Math.min(10, opts.indent ?? 2)),
      noRefs: true,
      lineWidth: -1,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: yamlErrorLoc(err) };
  }
}
