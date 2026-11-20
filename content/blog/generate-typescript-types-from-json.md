---
title: "How to Generate TypeScript Types from JSON (API Responses Made Type-Safe)"
description: "Turn any API JSON response into accurate TypeScript interfaces. How inference works, handling nulls and arrays, and a fast in-browser JSON-to-TypeScript converter."
date: "2026-07-25"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["typescript", "json", "api", "type-safety", "developer-workflow"]
featured: false
---

You're wiring up a new API endpoint. It returns a chunky JSON object, and now you need TypeScript interfaces so your editor autocompletes fields, catches typos, and flags when the backend shape changes. Hand-typing those interfaces from a 200-line response is tedious and error-prone. There's a better way: generate them automatically. This guide explains how JSON-to-TypeScript conversion works, how it handles the tricky cases (nulls, mixed arrays, nested objects), and how to fold it into your workflow. Try it live with our [JSON to TypeScript](/json-to-typescript) converter, and keep the [JSON formatter](/json-formatter) handy for tidying messy responses first.

## Why generate types instead of writing them

TypeScript's whole value is knowing the *shape* of your data at compile time. When an API response is typed, your editor autocompletes `user.profile.avatarUrl`, refuses to let you read a field that doesn't exist, and surfaces breakage the moment the backend renames something. Written by hand, though, those interfaces are pure drudgery, and every manual transcription is a chance to mistype a field name or get a type wrong, which quietly defeats the point.

Generating types from a real response flips that around:

- **Accuracy.** The types mirror the actual data, not your memory of the docs.
- **Speed.** A 50-field object becomes a full set of interfaces in seconds.
- **Refactor safety.** Regenerate when the API changes and TypeScript instantly shows you every call site that no longer fits.

## How inference works

A JSON-to-TypeScript tool walks the structure and maps each JSON value to its TypeScript equivalent:

| JSON value | Inferred TypeScript type |
|---|---|
| `"hello"` | `string` |
| `42`, `3.14` | `number` |
| `true` / `false` | `boolean` |
| `null` | `null` |
| `[ ... ]` | an array type, `T[]` |
| `{ ... }` | a nested `interface` |

Nested objects become their own named interfaces, so a response with a `user` object containing an `address` object produces three tidy interfaces that reference each other. Given this input:

```json
{
  "id": 42,
  "name": "Ada",
  "active": true,
  "roles": ["admin", "editor"]
}
```

You get:

```ts
interface Root {
  id: number;
  name: string;
  active: boolean;
  roles: string[];
}
```

Paste that same object into the [JSON to TypeScript](/json-to-typescript) converter and you'll see it happen instantly. No build step, and because it runs in your browser, your API data never leaves your machine.

## The tricky cases (and how to handle them)

Real API responses aren't clean, so it helps to know where inference gets ambiguous.

### Nulls and optional fields
If a field is `null` in your sample, the tool can only infer `null`. It has no way to know the field is *sometimes* a string. Similarly, a single sample can't reveal that a field is *optional* (present in some responses, absent in others). After generating, review these and widen them by hand: change `avatar: null` to `avatar: string | null`, and mark genuinely optional fields with `?`:

```ts
interface User {
  id: number;
  avatar: string | null;
  nickname?: string;
}
```

### Arrays of mixed or empty content
An empty array `[]` gives the tool nothing to infer, so you'll often get `never[]` or `any[]`, annotate it yourself. For arrays of objects, feed a sample that includes a **fully populated** element so every field is visible. An array where the first item is missing optional keys will produce an incomplete interface.

### Numbers that are really enums or IDs
JSON can't distinguish an arbitrary number from a fixed set of status codes, or a numeric ID from a quantity. The generated `number` is correct but loose. You may want to tighten a status field into a union like `1 | 2 | 3` or a string-literal enum once you know the allowed values.

The pattern across all of these: **generate first, then refine.** The tool does the tedious 90%. You apply the domain knowledge it can't infer from a single sample.

## Fitting it into your workflow

### The quick, everyday path
Grab a real response: from your browser's network tab, `curl`, or your API client, and if it's minified or messy, clean it up with the [JSON formatter](/json-formatter) first so it's readable and you can spot the structure. Paste it into the [JSON to TypeScript](/json-to-typescript) converter, copy the interfaces into a `types.ts` file, and tighten the nulls and optionals. This takes about a minute and covers the vast majority of cases.

### When JSON isn't your only format
Types aren't unique to JSON, many teams describe data in XML or YAML too. If you're weighing formats for an API or config, our comparisons of [JSON vs. XML](/compare/json-vs-xml) and [YAML vs. JSON](/compare/yaml-vs-json) lay out the trade-offs, and [how to format JSON](/how-to/how-to-format-json) covers making raw responses readable in the first place. If your data starts life as tabular records, [how to convert CSV to JSON](/how-to/how-to-convert-csv-to-json) is the step before you ever reach for types.

## A few habits that keep types honest

- **Type from a representative sample.** Use a real, fully populated response, not a stripped-down example, so optional and nested fields actually appear.
- **Regenerate when the API changes** rather than patching interfaces by hand, it's faster and it forces TypeScript to re-check every call site.
- **Name your interfaces meaningfully.** `Root` and `User` beat auto-generated placeholders. A minute of renaming pays off every time you read the code.
- **Consider runtime validation for untrusted data.** Generated types are compile-time only. If the data comes from outside your control, pair them with a runtime validator (like Zod) so a surprise response doesn't slip through as `any`.

## How the generator decides what a field is

Paste JSON into the [JSON to TypeScript tool](/json-to-typescript) and it walks the value tree, inferring a type per field and merging shapes across array items, so ten objects with an optional field come out as one interface with a `?` rather than ten conflicting ones. The honest limit is baked into the method: it can only describe what your sample contains. A field that is null in every sample types as null. Feed the generator your richest example, then review rather than trust.

## Wrapping up

Generating TypeScript from JSON turns a boring, bug-prone transcription task into a one-minute step, and it keeps your types anchored to what the API *actually* returns. Generate first, refine the nulls, optionals, and enums by hand, and regenerate whenever the shape shifts. Start with a real response in the [JSON to TypeScript](/json-to-typescript) converter and the [JSON formatter](/json-formatter). While you're tightening up your developer workflow, the same small-tool payoff applies to [minifying JavaScript](/blog/why-and-how-to-minify-javascript) for speed and [understanding Unix timestamps](/blog/understanding-unix-timestamps) for the date fields that live in nearly every API response.
