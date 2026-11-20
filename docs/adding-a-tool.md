---
description: Add a new tool to GigAI Tools - the registry entry, the interface, the engine and its tests - and check it with the typecheck, tests and build.
---

# Adding a tool

A tool is four pieces: its registry entry, its interface, its engine, and tests for the engine. The page, metadata, structured data, sitemap entry and search entry come from the registry.

## 1. The registry entry

Create `config/tools/<category>/<slug>.ts`. Copy a tool from the same category as a starting point; `config/tools/dev/url-decoder.ts` is a complete example.

```ts
import type { Tool } from "@/types";

const myTool: Tool = {
  slug: "my-tool",
  title: "My Tool",
  description: "One or two sentences for search results and the tool card.",
  category: "developer-tools",
  icon: "Wrench",
  accent: "cyan",
  status: "live",
  createdAt: "2026-11-20",
  // h1, tagline, longDescription, features, howTo, formats, faq, relatedTools ...
};

export default myTool;
```

Write the copy for this tool only: what it does, the steps, its limits and its FAQ. The `Tool` type in `types/index.ts` documents every field.

Then register it: import it in the category's `index.ts` (for example `config/tools/dev/index.ts`) or, for categories without one, in `config/tools/index.ts`.

## 2. The interface

Create `modules/tools/<category>/<slug>-tool.tsx`, a client component that takes the file or text, calls the engine and shows the result. Use the shared pieces in `components/tool/` (uploaders, the workspace shell, export buttons) so it behaves like the other tools.

Register it in `components/tool/tool-ui-registry.ts`:

```ts
"my-tool": dynamic(() => import("@/modules/tools/dev/my-tool-tool"), { ssr: false, loading: loadingUpload }),
```

## 3. The engine

Put the processing code in `lib/<domain>/`, with no React in it, so it can be tested without a browser. Prefer code that runs in the browser. If the tool truly needs a server, add the endpoint to the [backend](guides/backend.md), say so on the tool page before the user sends anything, and delete what the server receives.

## 4. Tests

Add `lib/<domain>/__tests__/<name>.test.ts` with Vitest. Test real inputs, including one that should fail.

## 5. Check it

```sh
node scripts/gen-icons.mjs   # only if you used a lucide icon no other tool uses
npm run typecheck
npm test
npm run docs:tools           # adds the tool to docs/tools/
npm run build
```

Open `http://localhost:3000/my-tool` with `npm run dev` and try it with a real file. Then open a pull request; see [Contributing](contributing.md).
