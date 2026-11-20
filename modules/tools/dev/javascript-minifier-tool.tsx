"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { minifyJs, type MinifyJsOptions } from "@/lib/dev/minify";
import {
  Field,
  Toggle,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** Options driving the live minify pass. Mirrors `MinifyJsOptions`. */
interface JsMinifyOptions {
  mangle: boolean;
  compress: boolean;
  keepClassNames: boolean;
  keepFnNames: boolean;
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

/** A realistic, deliberately verbose script so the empty state is useful. */
const SAMPLE_SCRIPT = `// A tiny debounce utility with room to shrink.
function debounce(callbackFunction, waitInMilliseconds) {
  let scheduledTimeoutId = null;

  return function debouncedWrapper(...invocationArguments) {
    const executionContext = this;

    if (scheduledTimeoutId !== null) {
      clearTimeout(scheduledTimeoutId);
    }

    scheduledTimeoutId = setTimeout(function runNow() {
      scheduledTimeoutId = null;
      callbackFunction.apply(executionContext, invocationArguments);
    }, waitInMilliseconds);
  };
}

class SearchController {
  constructor(inputElement) {
    this.inputElement = inputElement;
    this.handleInput = debounce(this.handleInput.bind(this), 250);
  }

  handleInput(event) {
    const trimmedQuery = event.target.value.trim();
    // Dead branch the compressor will remove:
    if (false) {
      console.log("this never runs");
    }
    return trimmedQuery.length > 0 ? trimmedQuery : null;
  }
}

export { debounce, SearchController };
`;

const EXAMPLES = [
  {
    label: "Debounce + class",
    description: "Verbose source with dead code and long names",
    value: SAMPLE_SCRIPT,
  },
  {
    label: "Arrow + template",
    description: "Modern ES syntax to compress",
    value:
      "const greetEveryone = (peopleList) => peopleList.map((personName) => `Hello, ${personName}!`).join(\"\\n\");\nconsole.log(greetEveryone([\"Ada\", \"Grace\", \"Linus\"]));",
  },
  {
    label: "IIFE config",
    description: "An immediately-invoked module",
    value:
      "(function initialiseAnalytics(globalWindow) {\n  const configurationDefaults = { sampleRate: 1.0, enableDebugLogging: false };\n  globalWindow.__analyticsConfig = Object.assign({}, configurationDefaults);\n})(window);",
  },
] as const;

const EXTRA_SHORTCUTS = [
  { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * JavaScript Minifier, composes the `TransformTool` harness (dual editors,
 * toolbar, drag-drop/paste import, copy/download/share, undo/redo, error banner
 * and keyboard shortcuts) and drives it with the terser-backed `minifyJs`
 * engine. Toggles control mangling, compression and whether class/function
 * names are preserved for frameworks that read them at runtime. Byte-size stats
 * (input, output and % saved) render as badges so the win is visible at a
 * glance. Everything runs live, in the browser, with nothing uploaded.
 */
export default function JavaScriptMinifierTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [mangle, setMangle] = React.useState(true);
  const [compress, setCompress] = React.useState(true);
  const [keepClassNames, setKeepClassNames] = React.useState(false);
  const [keepFnNames, setKeepFnNames] = React.useState(false);

  const options = React.useMemo<JsMinifyOptions>(
    () => ({ mangle, compress, keepClassNames, keepFnNames }),
    [mangle, compress, keepClassNames, keepFnNames],
  );

  const run = React.useCallback(
    async (input: string, opts: JsMinifyOptions): Promise<RunResult> => {
      const engineOptions: MinifyJsOptions = {
        mangle: opts.mangle,
        compress: opts.compress,
        keepClassNames: opts.keepClassNames,
        keepFnNames: opts.keepFnNames,
      };
      const result = await minifyJs(input, engineOptions);

      if (!result.ok) {
        const { message, line, column } = result.error;
        return {
          ok: false,
          error: message,
          ...(line != null ? { errorLine: line } : {}),
          ...(column != null ? { errorCol: column } : {}),
        };
      }

      const inBytes = result.stats.before;
      const outBytes = result.stats.after;
      const delta = inBytes - outBytes;

      const stats: NonNullable<RunResult["stats"]> = [
        {
          label: "In",
          value: formatBytes(inBytes),
          icon: "FileInput",
          tone: "default",
        },
        {
          label: "Out",
          value: formatBytes(outBytes),
          icon: "FileOutput",
          tone: "info",
        },
      ];

      if (delta > 0) {
        stats.push({
          label: "Saved",
          value: `${formatBytes(delta)} · ${result.stats.savedPct}%`,
          icon: "TrendingDown",
          tone: "success",
        });
      }

      return { ok: true, output: result.result, stats };
    },
    [],
  );

  const optionControls = (
    <>
      <Field label="Mangle" hint="Shorten local names">
        <Toggle checked={mangle} onChange={setMangle} label="Rename" />
      </Field>
      <Field label="Compress" hint="Drop dead code, fold constants">
        <Toggle checked={compress} onChange={setCompress} label="Optimize" />
      </Field>
      <Field label="Keep class names" hint="For decorators / DI">
        <Toggle
          checked={keepClassNames}
          onChange={setKeepClassNames}
          label="Preserve"
        />
      </Field>
      <Field label="Keep function names" hint="For logs / stacks">
        <Toggle
          checked={keepFnNames}
          onChange={setKeepFnNames}
          label="Preserve"
        />
      </Field>
    </>
  );

  return (
    <TransformTool<JsMinifyOptions>
      run={run}
      options={options}
      inputLabel="JavaScript input"
      outputLabel="Minified"
      inputPlaceholder="Paste JavaScript here, drop a .js file, or load a sample…"
      downloadName="output.min.js"
      downloadMime="text/javascript;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
