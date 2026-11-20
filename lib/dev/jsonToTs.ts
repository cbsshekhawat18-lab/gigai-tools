/**
 * GigAI Tools, JSON → TypeScript interface generator.
 *
 * Deterministic and dependency-free. Given a sample JSON value it infers a set
 * of named interfaces:
 *   - objects            → named `interface`s (nested objects get their own
 *                          interface named after their key, PascalCased)
 *   - arrays             → `T[]`, where `T` is the merged union of element types
 *   - null / undefined   → the field becomes optional (`?`) and unioned `| null`
 *   - mixed primitives   → a primitive union (e.g. `string | number`)
 *   - empty array        → `unknown[]`
 *   - empty object       → `Record<string, unknown>`
 *
 * Objects with identical shapes are de-duplicated so repeated array elements
 * share one interface. Output is stable for a given input.
 */

import { safeParse, type JsonError } from "./json";

export type JsonToTsResult =
  | { ok: true; code: string }
  | { ok: false; error: JsonError };

/** Internal structural description of an inferred type. */
type Shape =
  | { kind: "primitive"; name: "string" | "number" | "boolean" }
  | { kind: "null" }
  | { kind: "any" }
  | { kind: "array"; element: Shape }
  | { kind: "object"; fields: Map<string, { shape: Shape; optional: boolean }> }
  | { kind: "union"; members: Shape[] };

/** True for a valid JS identifier that needs no quoting as an interface name. */
function isSafeIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/** PascalCase a key for use as an interface name; fall back to a safe default. */
function pascalCase(input: string): string {
  const parts = input
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "Item";
  const joined = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const safe = /^[A-Za-z_$]/.test(joined) ? joined : `Item${joined}`;
  return safe || "Item";
}

/** Singularise a plural array-property name for its element interface. */
function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.slice(0, -3) + "y";
  if (/(s)$/i.test(name) && !/(ss|us|is)$/i.test(name)) return name.slice(0, -1);
  return name;
}

/** Infer the structural shape of a parsed JSON value. */
function inferShape(value: unknown): Shape {
  if (value === null || value === undefined) return { kind: "null" };
  const t = typeof value;
  if (t === "string") return { kind: "primitive", name: "string" };
  if (t === "number") return { kind: "primitive", name: "number" };
  if (t === "boolean") return { kind: "primitive", name: "boolean" };
  if (Array.isArray(value)) {
    let element: Shape = { kind: "any" };
    for (const item of value) element = mergeShapes(element, inferShape(item));
    return { kind: "array", element };
  }
  if (t === "object") {
    const fields = new Map<string, { shape: Shape; optional: boolean }>();
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      fields.set(key, { shape: inferShape(v), optional: false });
    }
    return { kind: "object", fields };
  }
  return { kind: "any" };
}

/** Merge two shapes into one that describes values conforming to either. */
function mergeShapes(a: Shape, b: Shape): Shape {
  if (a.kind === "any") return b;
  if (b.kind === "any") return a;
  if (a.kind === "null") return b.kind === "null" ? a : withNull(b);
  if (b.kind === "null") return withNull(a);

  if (a.kind === "array" && b.kind === "array") {
    return { kind: "array", element: mergeShapes(a.element, b.element) };
  }
  if (a.kind === "object" && b.kind === "object") {
    const fields = new Map<string, { shape: Shape; optional: boolean }>();
    const keys = new Set([...a.fields.keys(), ...b.fields.keys()]);
    for (const key of keys) {
      const fa = a.fields.get(key);
      const fb = b.fields.get(key);
      if (fa && fb) {
        fields.set(key, {
          shape: mergeShapes(fa.shape, fb.shape),
          optional: fa.optional || fb.optional,
        });
      } else {
        const only = (fa ?? fb) as { shape: Shape; optional: boolean };
        fields.set(key, { shape: only.shape, optional: true });
      }
    }
    return { kind: "object", fields };
  }
  if (a.kind === "primitive" && b.kind === "primitive" && a.name === b.name) return a;

  // Dissimilar shapes → represent as a union node.
  return unionOf(dedupeUnion([a, b]));
}

/** Build a union node, collapsing a single member back to that member. */
function unionOf(members: Shape[]): Shape {
  if (members.length === 0) return { kind: "any" };
  if (members.length === 1) return members[0] as Shape;
  return { kind: "union", members };
}

/** Flag a shape as nullable without losing its structure. */
function withNull(shape: Shape): Shape {
  return unionOf(dedupeUnion([shape, { kind: "null" }]));
}

/** Flatten and de-duplicate union member shapes. */
function dedupeUnion(shapes: Shape[]): Shape[] {
  const out: Shape[] = [];
  for (const s of shapes) {
    const members = s.kind === "union" ? s.members : [s];
    for (const m of members) {
      if (!out.some((e) => shapeKey(e) === shapeKey(m))) out.push(m);
    }
  }
  return out;
}

/** A stable string key for structural equality/de-duplication. */
function shapeKey(shape: Shape): string {
  switch (shape.kind) {
    case "union":
      return "(" + shape.members.map(shapeKey).sort().join("|") + ")";
    case "primitive":
      return shape.name;
    case "null":
      return "null";
    case "any":
      return "unknown";
    case "array":
      return `Array<${shapeKey(shape.element)}>`;
    case "object":
      return (
        "{" +
        [...shape.fields.entries()]
          .map(([k, f]) => `${k}${f.optional ? "?" : ""}:${shapeKey(f.shape)}`)
          .sort()
          .join(";") +
        "}"
      );
  }
}

/** Collects interface declarations while rendering nested object shapes. */
class Emitter {
  private readonly declarations: string[] = [];
  private readonly byKey = new Map<string, string>();
  private readonly usedNames = new Set<string>();

  /** Render a shape to a type expression, emitting interfaces for objects. */
  render(shape: Shape, hintName: string): string {
    switch (shape.kind) {
      case "union": {
        const rendered = shape.members.map((m) => this.render(m, hintName));
        return dedupeStrings(rendered).join(" | ");
      }
      case "primitive":
        return shape.name;
      case "null":
        return "null";
      case "any":
        return "unknown";
      case "array": {
        if (shape.element.kind === "any") return "unknown[]";
        const inner = this.render(shape.element, singularize(hintName));
        return /[|&]/.test(inner) ? `(${inner})[]` : `${inner}[]`;
      }
      case "object":
        return this.emitInterface(shape, hintName);
    }
  }

  /** Emit (or reuse) a named interface for an object shape. */
  private emitInterface(shape: Extract<Shape, { kind: "object" }>, hintName: string): string {
    if (shape.fields.size === 0) return "Record<string, unknown>";
    const key = shapeKey(shape);
    const existing = this.byKey.get(key);
    if (existing) return existing;

    const name = this.uniqueName(pascalCase(hintName));
    // Reserve the name/key before recursing so mutually-referenced shapes reuse it.
    this.byKey.set(key, name);
    this.usedNames.add(name);

    const lines: string[] = [`export interface ${name} {`];
    for (const [rawKey, field] of shape.fields) {
      const propType = this.render(field.shape, rawKey);
      const propName = isSafeIdentifier(rawKey) ? rawKey : JSON.stringify(rawKey);
      lines.push(`  ${propName}${field.optional ? "?" : ""}: ${propType};`);
    }
    lines.push("}");
    this.declarations.push(lines.join("\n"));
    return name;
  }

  private uniqueName(base: string): string {
    if (!this.usedNames.has(base)) return base;
    let i = 2;
    while (this.usedNames.has(`${base}${i}`)) i += 1;
    return `${base}${i}`;
  }

  /** All emitted interfaces, root last so it reads top-down when reversed. */
  output(): string[] {
    return this.declarations;
  }
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/**
 * Convert a JSON string to TypeScript interface declarations.
 * The root type is named `rootName` (PascalCased). Returns generated code or a
 * positioned parse error.
 */
export function jsonToTypeScript(src: string, rootName = "Root"): JsonToTsResult {
  const parsed = safeParse(src);
  if (!parsed.ok) return parsed;

  const shape = inferShape(parsed.value);
  const emitter = new Emitter();

  if (shape.kind === "object" && shape.fields.size > 0) {
    emitter.render(shape, rootName);
    // Root emitted last; reverse so the root interface appears first.
    const decls = emitter.output().slice().reverse();
    return { ok: true, code: decls.join("\n\n") + "\n" };
  }

  // Root is not a plain object: emit a type alias plus any nested interfaces.
  const rendered = emitter.render(shape, rootName);
  const nested = emitter.output().slice().reverse();
  const alias = `export type ${pascalCase(rootName)} = ${rendered};`;
  const code = [...nested, alias].filter(Boolean).join("\n\n") + "\n";
  return { ok: true, code };
}
