import { describe, expect, it } from "vitest";

import { alignMarker, buildStyleMap, canonicalKind, markAlignment } from "../docx-html";
import { blocksText, isLatinSafe, pruneBlocks, type Block } from "../pdf-blocks";
import { pageCuts, uniformRows } from "../render-pdf";

describe("pageCuts", () => {
  it("breaks between blocks instead of through them", () => {
    // Blocks end at 100, 200, 300…; a page holds 250.
    const boundaries = [100, 200, 300, 400, 500];
    const cuts = pageCuts(boundaries, 500, 250);
    // Every interior cut must sit on a boundary, never mid-block.
    for (const cut of cuts.slice(1, -1)) expect(boundaries).toContain(cut);
  });

  it("never lets a page exceed the page height", () => {
    const cuts = pageCuts([90, 180, 270, 360], 400, 100);
    for (let i = 0; i < cuts.length - 1; i += 1) {
      expect((cuts[i + 1] ?? 0) - (cuts[i] ?? 0)).toBeLessThanOrEqual(100 + 1e-9);
    }
  });

  it("covers the whole document exactly once, in order", () => {
    const cuts = pageCuts([120, 260, 400], 600, 200);
    expect(cuts[0]).toBe(0);
    expect(cuts[cuts.length - 1]).toBe(600);
    for (let i = 1; i < cuts.length; i += 1) expect(cuts[i]).toBeGreaterThan(cuts[i - 1] ?? 0);
  });

  it("hard-cuts a single block taller than one page rather than looping", () => {
    // One 900-tall block, pages of 300: it has to be sliced somewhere.
    const cuts = pageCuts([900], 900, 300);
    expect(cuts).toEqual([0, 300, 600, 900]);
  });

  it("returns a single page when everything fits", () => {
    expect(pageCuts([50, 100], 150, 800)).toEqual([0, 150]);
  });

  it("ignores boundaries outside the document", () => {
    const cuts = pageCuts([-10, 0, 700, 1200], 600, 250);
    expect(cuts[cuts.length - 1]).toBe(600);
    expect(cuts.every((c) => c >= 0 && c <= 600)).toBe(true);
  });
});

describe("docx style recovery", () => {
  it("maps Word style names onto canonical kinds", () => {
    expect(canonicalKind("Heading 2")).toBe("H2");
    expect(canonicalKind("heading 3")).toBe("H3");
    expect(canonicalKind("Title")).toBe("Title");
    expect(canonicalKind("Intense Quote")).toBe("Quote");
    expect(canonicalKind("Normal")).toBe("Body");
    expect(canonicalKind(null)).toBe("Body");
  });

  it("leaves default-aligned paragraphs untouched so mammoth's own mapping wins", () => {
    const para = { alignment: null, styleName: "Heading 1", styleId: "Heading1" };
    expect(markAlignment(para)).toBe(para);
    const left = { alignment: "left", styleName: "Normal", styleId: "Normal" };
    expect(markAlignment(left)).toBe(left);
  });

  it("smuggles alignment through as a marker style, keeping the heading level", () => {
    expect(markAlignment({ alignment: "center", styleName: "Heading 1" }).styleName).toBe("GigaiH1Center");
    expect(markAlignment({ alignment: "both", styleName: null }).styleName).toBe("GigaiBodyBoth");
    expect(markAlignment({ alignment: "right", styleName: "Title" }).styleName).toBe("GigaiTitleRight");
  });

  it("publishes a style map entry for every marker it can produce", () => {
    const map = buildStyleMap();
    expect(map).toContain("u => u"); // underline is not in mammoth's defaults
    expect(map).toContain("p[style-name='Title'] => h1:fresh");
    for (const kind of ["Body", "H1", "Title", "Quote"]) {
      for (const align of ["center", "right", "both"] as const) {
        const marker = alignMarker(kind, align);
        expect(map.some((entry) => entry.includes(`'${marker}'`))).toBe(true);
      }
    }
  });
});

describe("script detection", () => {
  it("accepts text the standard PDF fonts can draw", () => {
    expect(isLatinSafe("Quarterly report - 4.2% up, “final” • café naïve")).toBe(true);
  });

  it("rejects scripts those fonts cannot encode", () => {
    expect(isLatinSafe("हिन्दी पाठ")).toBe(false);
    expect(isLatinSafe("日本語")).toBe(false);
    expect(isLatinSafe("Привет")).toBe(false);
    expect(isLatinSafe("العربية")).toBe(false);
  });

  it("reads every run in a block list", () => {
    const blocks: Block[] = [
      { type: "para", runs: [{ text: "Hello " }, { text: "मित्र" }] },
      { type: "table", rows: [{ cells: [{ runs: [{ text: "cell" }] }] }] },
    ];
    expect(blocksText(blocks)).toBe("Hello मित्रcell");
    expect(isLatinSafe(blocksText(blocks))).toBe(false);
  });
});

describe("pruneBlocks", () => {
  it("drops blank paragraphs but keeps preformatted whitespace", () => {
    const blocks: Block[] = [
      { type: "para", runs: [{ text: "   " }] },
      { type: "para", runs: [{ text: "real" }] },
      { type: "para", runs: [{ text: "  " }], pre: true },
    ];
    const out = pruneBlocks(blocks);
    expect(out).toHaveLength(2);
    expect((out[0] as { runs: { text: string }[] }).runs[0]?.text).toBe("real");
  });

  it("drops empty runs and empty lists", () => {
    const blocks: Block[] = [
      { type: "list", items: [{ runs: [{ text: "" }], level: 0, marker: "•" }] },
      { type: "list", items: [{ runs: [{ text: "kept" }], level: 0, marker: "•" }] },
    ];
    expect(pruneBlocks(blocks)).toHaveLength(1);
  });
});

/** Build a fake canvas whose rows are either uniform or streaked with ink. */
function fakeCanvas(rows: ("blank" | "ink")[], width = 32): HTMLCanvasElement {
  const height = rows.length;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  rows.forEach((kind, y) => {
    if (kind !== "ink") return;
    // One dark pixel is enough to disqualify a row as a cut point.
    const i = (y * width + 16) * 4;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
  });
  return {
    width,
    height,
    getContext: () => ({
      getImageData: (_x: number, top: number, w: number, h: number) => ({
        width: w,
        height: h,
        data: data.slice(top * w * 4, (top + h) * w * 4),
      }),
    }),
  } as unknown as HTMLCanvasElement;
}

describe("uniformRows", () => {
  it("reports the gaps between lines and not the lines themselves", () => {
    // Two "lines" of ink at rows 2-4 and 8-10, blank everywhere else.
    const rows: ("blank" | "ink")[] = Array.from({ length: 12 }, (_, y) =>
      (y >= 2 && y <= 4) || (y >= 8 && y <= 10) ? "ink" : "blank",
    );
    const found = uniformRows(fakeCanvas(rows), 1, 4);
    expect(found).toEqual([0, 1, 5, 6, 7, 11]);
    for (const y of found) expect(rows[y]).toBe("blank");
  });

  it("works across band boundaries", () => {
    // 600 rows forces more than one band at the default band height.
    const rows: ("blank" | "ink")[] = Array.from({ length: 600 }, (_, y) => (y % 20 < 14 ? "ink" : "blank"));
    const found = uniformRows(fakeCanvas(rows), 1, 512);
    expect(found.length).toBe(600 - Math.floor(600 / 20) * 14);
    for (const y of found) expect(rows[y]).toBe("blank");
  });

  it("returns nothing when every row has ink, so callers fall back to hard cuts", () => {
    expect(uniformRows(fakeCanvas(["ink", "ink", "ink"]), 1, 4)).toEqual([]);
  });
});
