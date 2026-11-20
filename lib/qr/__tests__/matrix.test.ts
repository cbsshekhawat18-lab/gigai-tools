import { describe, expect, it } from "vitest";

import { buildMatrix, functionModules } from "../matrix";

/**
 * The halftone renderer is only allowed to draw over DATA modules, so a wrong
 * function-pattern map would quietly paint over a finder or a timing line and
 * break codes in ways a single happy-path render would not reveal.
 */
describe("QR matrix", () => {
  it("builds a square matrix whose size is a valid QR version", () => {
    const m = buildMatrix("https://gigai.tools");
    expect(m.length).toBeGreaterThan(20);
    expect(m.every((row) => row.length === m.length)).toBe(true);
    expect((m.length - 17) % 4).toBe(0);
  });

  it("marks the three finders, their separators and the timing lines", () => {
    const m = buildMatrix("https://gigai.tools");
    const n = m.length;
    const fn = functionModules(n);
    for (const [x, y] of [
      [0, 0], [6, 6], [8, 8],           // top-left finder + format corner
      [n - 1, 0], [n - 8, 0],           // top-right finder
      [0, n - 1], [0, n - 8],           // bottom-left finder
      [6, 20], [20, 6],                 // timing lines
    ]) {
      expect(fn[y!]![x!], `expected function module at ${x},${y}`).toBe(true);
    }
  });

  it("leaves the data region free for artwork", () => {
    const n = buildMatrix("https://gigai.tools").length;
    const fn = functionModules(n);
    const free = fn.flat().filter((v) => !v).length;
    // Function patterns are a small minority of any version; the rest is data.
    expect(free / (n * n)).toBeGreaterThan(0.6);
    expect(fn[10]![10]).toBe(false);
  });

  it("places alignment patterns for versions that have them", () => {
    // A long payload forces a higher version, which adds alignment patterns.
    const m = buildMatrix("https://gigai.tools/qr-code-generator?utm_source=print&utm_medium=flyer&utm_campaign=spring");
    const n = m.length;
    const version = (n - 17) / 4;
    expect(version).toBeGreaterThanOrEqual(2);
    const fn = functionModules(n);
    // Version >= 2 always carries one at (n-7, n-7) in module coordinates.
    expect(fn[n - 7]![n - 7]).toBe(true);
  });
});
