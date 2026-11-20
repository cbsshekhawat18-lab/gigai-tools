import { describe, expect, it } from "vitest";
import qrcode from "qrcode-generator";

import { encode, codewords, dataCapacity, pickVersion, encodeForTone, agreement } from "../encoder";

/**
 * The oracle: qrcode-generator has produced every code this studio has ever
 * shipped. Our encoder is only allowed to replace it if, for the same payload,
 * one of our eight masks reproduces its matrix module for module.
 */
function libraryMatrix(payload: string): boolean[][] {
  const qr = qrcode(0, "H");
  qr.addData(payload);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => qr.isDark(y, x)),
  );
}

const PAYLOADS = [
  "https://gigai.tools",
  "https://gigai.tools/qr-code-generator?utm_source=card",
  "https://gigai.tools/qr-code-generator?utm_source=print&utm_medium=flyer&utm_campaign=spring-2026",
  "hello",
];

describe("our QR encoder", () => {
  it.each(PAYLOADS)("reproduces the library's matrix for %s", (payload) => {
    const want = libraryMatrix(payload);
    const matches = [0, 1, 2, 3, 4, 5, 6, 7].filter((mask) => {
      const got = encode(payload, mask).matrix;
      return (
        got.length === want.length &&
        got.every((row, y) => row.every((v, x) => v === want[y]![x]))
      );
    });
    expect(matches).toHaveLength(1);
  });

  it("picks the smallest version that fits and fills it exactly", () => {
    // 19 bytes needs 4 + 8 + 152 bits, past version 2-H's 128.
    const version = pickVersion(19);
    expect(version).toBe(3);
    expect(codewords("https://gigai.tools", version)).toHaveLength(dataCapacity(version));
  });

  it("pads with the spec's alternating bytes unless told otherwise", () => {
    const plain = codewords("hi", 1);
    expect(plain.slice(4)).toEqual([0xec, 0x11, 0xec, 0x11, 0xec]);
    const custom = codewords("hi", 1, [1, 2, 3, 4, 5, 6]);
    expect(custom.slice(4)).toEqual([1, 2, 3, 4, 5]);
  });

  it("encodes non-ASCII as UTF-8, which is where we part with the library", () => {
    // qrcode-generator's default byte encoder truncates each char to one byte
    // (Latin-1). Scanners assume UTF-8, so ours does too: "é" must come out as
    // 0xC3 0xA9, not 0xE9. This is a deliberate difference, not a mismatch.
    const bytes = codewords("é", 1);
    expect(bytes.slice(0, 4)).toEqual([0x40, 0x2c, 0x3a, 0x90]);
  });

  it("picks the mask that best matches a target picture", () => {
    // A left-dark / right-light target: the chosen mask must beat the worst.
    const tone = (x: number) => (x < 20 ? 1 : 0);
    const chosen = encodeForTone("https://gigai.tools", tone);
    const scores = [0, 1, 2, 3, 4, 5, 6, 7].map((m) => agreement(encode("https://gigai.tools", m), tone));
    expect(chosen.agreement).toBe(Math.max(...scores));
    expect(chosen.agreement).toBeGreaterThan(Math.min(...scores));
  });

  it("changes the code when the mask changes, but never its size", () => {
    const a = encode("https://gigai.tools", 0);
    const b = encode("https://gigai.tools", 5);
    expect(a.matrix.length).toBe(b.matrix.length);
    expect(a.matrix).not.toEqual(b.matrix);
  });
});
