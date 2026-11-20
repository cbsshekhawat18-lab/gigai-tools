import { describe, expect, it } from "vitest";
import catalog from "../shape-catalog.json";
import { QR_SHAPES } from "../shape";

describe("shape catalog", () => {
  it("is a large list of [emoji, name, group] triples", () => {
    const rows = catalog as unknown as [string, string, string][];
    expect(rows.length).toBeGreaterThan(1500);
    for (const row of rows.slice(0, 50)) {
      expect(row).toHaveLength(3);
      expect(typeof row[0]).toBe("string");
      expect(row[1].length).toBeGreaterThan(1);
    }
  });

  it("curated shapes stay a small vetted subset", () => {
    // Guard against the curated row silently ballooning past what the
    // two-gate review actually covered.
    expect(QR_SHAPES.length).toBeGreaterThanOrEqual(10);
    expect(QR_SHAPES.length).toBeLessThanOrEqual(40);
  });
});
