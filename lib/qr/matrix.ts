/**
 * QR matrix facts the artistic renderers need.
 *
 * A QR is not a free canvas: some modules are FUNCTION patterns (the three
 * finders and their separators, the timing lines, the alignment patterns, the
 * format and version blocks) and a scanner uses them to find, orient and
 * sample the code. Those must stay pure black and white. Everything else is
 * data, and data modules are where artwork is allowed to bleed in, because
 * error correction and centre sampling give us room there.
 *
 * `qrcode-generator` hands us `isDark(row, col)` and nothing else, so the
 * function-module map is reconstructed here from the spec (ISO/IEC 18004):
 * version = (modules - 17) / 4, alignment centres from the standard table.
 */

import qrcode from "qrcode-generator";

/** Alignment-pattern centre coordinates per version (ISO/IEC 18004 annex E). */
export const ALIGNMENT: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62],
  [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82],
  [6, 30, 58, 86], [6, 34, 62, 90],
  [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170],
];

/** Build the boolean module matrix for `payload` at error correction H. */
export function buildMatrix(payload: string): boolean[][] {
  const qr = qrcode(0, "H");
  qr.addData(payload);
  qr.make();
  const n = qr.getModuleCount();
  const m: boolean[][] = [];
  for (let y = 0; y < n; y += 1) {
    const row: boolean[] = [];
    for (let x = 0; x < n; x += 1) row.push(qr.isDark(y, x));
    m.push(row);
  }
  return m;
}

/**
 * A `grid[y][x]` map of modules that must stay pure: finders, separators,
 * format and version blocks, timing lines and alignment patterns.
 */
export function functionModules(n: number): boolean[][] {
  const version = (n - 17) / 4;
  const map: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const mark = (x0: number, y0: number, w: number, h: number) => {
    for (let y = y0; y < y0 + h; y += 1) {
      for (let x = x0; x < x0 + w; x += 1) {
        if (x >= 0 && y >= 0 && x < n && y < n) map[y]![x] = true;
      }
    }
  };

  // Finder + separator + the format-information strip that hugs each finder.
  mark(0, 0, 9, 9);
  mark(n - 8, 0, 8, 9);
  mark(0, n - 8, 9, 8);
  // Timing patterns run the full width and height on line 6.
  mark(6, 0, 1, n);
  mark(0, 6, n, 1);
  // Alignment patterns, minus the three that would sit on a finder.
  const centres = ALIGNMENT[version] ?? [];
  for (const cy of centres) {
    for (const cx of centres) {
      const onFinder =
        (cx <= 8 && cy <= 8) || (cx >= n - 9 && cy <= 8) || (cx <= 8 && cy >= n - 9);
      if (!onFinder) mark(cx - 2, cy - 2, 5, 5);
    }
  }
  // Version information (version 7 and up).
  if (version >= 7) {
    mark(n - 11, 0, 3, 6);
    mark(0, n - 11, 6, 3);
  }
  return map;
}
