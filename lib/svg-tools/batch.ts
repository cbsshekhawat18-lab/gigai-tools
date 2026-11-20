/**
 * GigAI Tools, batch SVG optimization.
 *
 * Optimizes many SVGs off the main thread (via `optimizeAsync`, which uses the
 * Web Worker), reporting progress and honouring cancellation. Ships helpers to
 * bundle the results as a ZIP (reusing `lib/pdf/zip.ts`'s fflate zipper) and to
 * export a per-file CSV / JSON report. Everything is client-side.
 */

import { optimizeAsync } from "./optimize-runner";
import type { EngineOptions } from "./svgo-engine";
import { utf8Bytes } from "./core";
import { zipBlobs } from "@/lib/pdf/zip";
import { namedBlob, type NamedBlob } from "@/lib/pdf/types";

export interface BatchInput {
  name: string;
  svg: string;
}

export interface BatchResultItem {
  name: string;
  ok: boolean;
  before: number;
  after: number;
  savedBytes: number;
  savedPct: number;
  data: string;
  error?: string;
}

export interface BatchProgress {
  done: number;
  total: number;
  current: string;
}

export interface OptimizeBatchOptions {
  onProgress?: (p: BatchProgress) => void;
  /** Return true to stop after the current file. */
  shouldCancel?: () => boolean;
}

/**
 * Optimize a list of SVGs one at a time (each off the main thread). Returns one
 * result per input, in order. Stops early if `shouldCancel` becomes true, the
 * returned array then covers only the files processed so far.
 */
export async function optimizeBatch(
  inputs: BatchInput[],
  opts: EngineOptions,
  { onProgress, shouldCancel }: OptimizeBatchOptions = {},
): Promise<BatchResultItem[]> {
  const results: BatchResultItem[] = [];
  const total = inputs.length;
  for (let i = 0; i < total; i++) {
    if (shouldCancel?.()) break;
    const item = inputs[i];
    if (!item) continue;
    onProgress?.({ done: i, total, current: item.name });
    const before = utf8Bytes(item.svg);
    try {
      const res = await optimizeAsync(item.svg, opts);
      const data = res.ok ? res.data : item.svg;
      const after = utf8Bytes(data);
      results.push({
        name: item.name,
        ok: res.ok,
        before,
        after,
        savedBytes: before - after,
        savedPct: before === 0 ? 0 : Math.round(((before - after) / before) * 1000) / 10,
        data,
        error: res.ok ? undefined : res.error,
      });
    } catch (err) {
      results.push({
        name: item.name,
        ok: false,
        before,
        after: before,
        savedBytes: 0,
        savedPct: 0,
        data: item.svg,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    onProgress?.({ done: i + 1, total, current: item.name });
  }
  return results;
}

/** Ensure a filename ends in `.svg`. */
function svgName(name: string): string {
  return /\.svg$/i.test(name) ? name : `${name.replace(/\.[^.]+$/, "")}.svg`;
}

/** Build a ZIP NamedBlob of the optimized SVGs. */
export async function zipBatch(results: BatchResultItem[], zipName = "optimized-svgs.zip"): Promise<NamedBlob> {
  const files = results.map((r) => namedBlob(svgName(r.name), new Blob([r.data], { type: "image/svg+xml" })));
  return zipBlobs(files, zipName);
}

/** CSV report: file, before, after, saved, percent. */
export function batchCsv(results: BatchResultItem[]): string {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const rows = [
    "file,before_bytes,after_bytes,saved_bytes,saved_percent,status",
    ...results.map((r) => [esc(r.name), r.before, r.after, r.savedBytes, r.savedPct, r.ok ? "ok" : "error"].join(",")),
  ];
  return rows.join("\n");
}

/** JSON report with a summary + per-file detail. */
export function batchJson(results: BatchResultItem[]): string {
  const totalBefore = results.reduce((s, r) => s + r.before, 0);
  const totalAfter = results.reduce((s, r) => s + r.after, 0);
  return JSON.stringify(
    {
      summary: {
        files: results.length,
        totalBefore,
        totalAfter,
        savedBytes: totalBefore - totalAfter,
        savedPercent: totalBefore === 0 ? 0 : Math.round(((totalBefore - totalAfter) / totalBefore) * 1000) / 10,
      },
      files: results.map((r) => ({ name: r.name, before: r.before, after: r.after, savedPercent: r.savedPct, ok: r.ok, error: r.error })),
    },
    null,
    2,
  );
}
