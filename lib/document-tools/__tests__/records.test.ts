import { describe, expect, it, vi } from "vitest";

/**
 * pdfToRecords against a synthetic 2-column x 2-row voter-roll-style page:
 * ID anchor lines, labelled fields, the split-line case (value printed on the
 * line under its label), and a mid-line label ("Age : 54 Gender : M").
 * Geometry mirrors the real Jaipur electoral roll this engine was built on.
 */

interface FakeItem {
  str: string;
  transform: number[];
  height: number;
}
const it_ = (str: string, x: number, y: number): FakeItem => ({
  str,
  transform: [10, 0, 0, 10, x, y],
  height: 10,
});

// Two columns (x≈40 and x≈300), two records per column, repeated on 3 pages so
// every label clears the frequency threshold (>=4).
function pageItems(): FakeItem[] {
  const rec = (x: number, y: number, serial: string, id: string, name: string, age: string) => [
    it_(serial, x, y + 60), it_(id, x + 30, y + 60),
    it_("Name", x, y + 45), it_(":", x + 28, y + 45), it_(name, x + 34, y + 45),
    // split-line: label with the value on the NEXT line
    it_("House", x, y + 30), it_(":", x + 30, y + 30),
    it_("12/B", x + 4, y + 20),
    it_("Age", x, y + 8), it_(":", x + 20, y + 8), it_(age, x + 26, y + 8),
    it_("Gender", x + 60, y + 8), it_(":", x + 96, y + 8), it_("M", x + 102, y + 8),
  ];
  return [
    it_("STATE ELECTION ROLL", 100, 800),
    ...rec(40, 640, "1", "WUX0000001", "Asha", "34"),
    ...rec(300, 640, "2", "WUX0000002", "Ravi", "51"),
    ...rec(40, 520, "3", "WUX0000003", "Meena", "29"),
    ...rec(300, 520, "4", "WUX0000004", "Karan", "62"),
  ];
}

// Switchable fake document; the second test swaps in prose-only items.
let fakeItems: () => FakeItem[] = pageItems;
let fakePages = 3;
vi.mock("@/lib/pdf/core", () => ({
  openPdfDocument: async () => ({
    numPages: fakePages,
    getPage: async () => ({
      getTextContent: async () => ({ items: fakeItems() }),
      cleanup: () => {},
    }),
    loadingTask: { destroy: async () => {} },
  }),
}));

import { pdfToRecords } from "../records";

describe("pdfToRecords", () => {
  it("emits one row per record with serial, ID and labelled fields", async () => {
    const res = await pdfToRecords(new Blob(["x"]));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const r = res.result;
    expect(r.recordCount).toBe(12); // 4 records x 3 pages
    expect(r.headers).toEqual(["#", "ID", "Name", "House", "Age", "Gender"]);
    const first = r.rows[0];
    expect(first).toEqual(["1", "WUX0000001", "Asha", "12/B", "34", "M"]);
    // reading order: row-major across columns
    expect(r.rows.slice(0, 4).map((x) => x[0])).toEqual(["1", "2", "3", "4"]);
    // no Devanagari here, so no damage flag
    expect(r.textDamaged).toBe(false);
    expect(r.recognised).toBe(false);
  });

  it("fails cleanly on a PDF with no repeating structure", async () => {
    fakeItems = () => [it_("Just", 40, 700), it_("prose", 70, 700), it_("here", 100, 700)];
    fakePages = 1;
    const res = await pdfToRecords(new Blob(["x"]));
    expect(res.ok).toBe(false);
  });
});
