/**
 * Our own QR encoder, byte mode at error correction H.
 *
 * We used to take a finished matrix from `qrcode-generator` and paint over it.
 * That put every interesting decision out of reach: which of the eight mask
 * patterns to use, and what to put in the padding, are choices made BEFORE the
 * modules exist, and both of them change which modules come out dark. For an
 * artistic code that is exactly the leverage you want - a mask whose dark
 * modules already agree with the picture needs far less fighting afterwards.
 *
 * So this builds the code from the spec (ISO/IEC 18004): byte-mode bitstream,
 * Reed-Solomon over GF(256), block interleaving, zigzag placement, the eight
 * masks, and BCH format/version information. Correctness is not assumed - the
 * unit tests re-encode real payloads and require our matrix to equal
 * `qrcode-generator`'s output module for module.
 *
 * Only level H is implemented, because artwork needs the 30% recovery and the
 * studio has no reason to offer less here.
 */

import { ALIGNMENT, functionModules } from "./matrix";

/**
 * Level-H blocks per version: [ecCodewordsPerBlock, [blocks, dataCodewords], …]
 * A second group appears when the version's blocks are not all the same size.
 */
const RS_H: [number, ...[number, number][]][] = [
  /* 1 */ [17, [1, 9]],
  /* 2 */ [28, [1, 16]],
  /* 3 */ [22, [2, 13]],
  /* 4 */ [16, [4, 9]],
  /* 5 */ [22, [2, 11], [2, 12]],
  /* 6 */ [28, [4, 15]],
  /* 7 */ [26, [4, 13], [1, 14]],
  /* 8 */ [26, [4, 14], [2, 15]],
  /* 9 */ [24, [4, 12], [4, 13]],
  /* 10 */ [28, [6, 15], [2, 16]],
  /* 11 */ [24, [3, 12], [8, 13]],
  /* 12 */ [28, [7, 14], [4, 15]],
  /* 13 */ [22, [12, 11], [4, 12]],
  /* 14 */ [24, [11, 12], [5, 13]],
  /* 15 */ [24, [11, 12], [7, 13]],
  /* 16 */ [30, [3, 15], [13, 16]],
  /* 17 */ [28, [2, 14], [17, 15]],
  /* 18 */ [28, [2, 14], [19, 15]],
  /* 19 */ [26, [9, 13], [16, 14]],
  /* 20 */ [28, [15, 15], [10, 16]],
  /* 21 */ [30, [19, 16], [6, 17]],
  /* 22 */ [24, [34, 13]],
  /* 23 */ [30, [16, 15], [14, 16]],
  /* 24 */ [30, [30, 16], [2, 17]],
  /* 25 */ [30, [22, 15], [13, 16]],
  /* 26 */ [30, [33, 16], [4, 17]],
  /* 27 */ [30, [12, 15], [28, 16]],
  /* 28 */ [30, [11, 15], [31, 16]],
  /* 29 */ [30, [19, 15], [26, 16]],
  /* 30 */ [30, [23, 15], [25, 16]],
  /* 31 */ [30, [23, 15], [28, 16]],
  /* 32 */ [30, [19, 15], [35, 16]],
  /* 33 */ [30, [11, 15], [46, 16]],
  /* 34 */ [30, [59, 16], [1, 17]],
  /* 35 */ [30, [22, 15], [41, 16]],
  /* 36 */ [30, [2, 15], [64, 16]],
  /* 37 */ [30, [24, 15], [46, 16]],
  /* 38 */ [30, [42, 15], [32, 16]],
  /* 39 */ [30, [10, 15], [67, 16]],
  /* 40 */ [30, [20, 15], [61, 16]],
];

/* ------------------------------- GF(256) -------------------------------- */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // the QR field's primitive polynomial
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255]!;
})();

const mul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a]! + LOG[b]!]!);

/** Generator polynomial for `degree` error-correction codewords. */
function generator(degree: number): number[] {
  let poly = [1];
  for (let d = 0; d < degree; d += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    // poly[0] is the LEADING coefficient, so multiplying by (x + α^d) shifts
    // each term up one degree and adds α^d times the same term.
    for (let i = 0; i < poly.length; i += 1) {
      next[i] = (next[i] ?? 0) ^ poly[i]!;
      next[i + 1] = (next[i + 1] ?? 0) ^ mul(poly[i]!, EXP[d]!);
    }
    poly = next;
  }
  return poly;
}

/** Reed-Solomon remainder: the error-correction codewords for one block. */
function ecc(data: number[], degree: number): number[] {
  const gen = generator(degree);
  const out = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ out[0]!;
    out.shift();
    out.push(0);
    for (let i = 0; i < degree; i += 1) out[i] = out[i]! ^ mul(gen[i + 1]!, factor);
  }
  return out;
}

/* ------------------------------- bitstream ------------------------------- */

/** Total data codewords available at level H for a version. */
export function dataCapacity(version: number): number {
  const [, ...groups] = RS_H[version - 1]!;
  return groups.reduce((sum, [blocks, data]) => sum + blocks * data, 0);
}

/** Smallest version that fits `bytes` of byte-mode payload at level H. */
export function pickVersion(bytes: number): number {
  for (let v = 1; v <= 40; v += 1) {
    const header = 4 + (v < 10 ? 8 : 16);
    if (dataCapacity(v) * 8 >= header + bytes * 8) return v;
  }
  throw new Error("Payload is too long for a QR code.");
}

/** Modules per side the payload will need, before anything is encoded. */
export function moduleCount(payload: string): number {
  return pickVersion(new TextEncoder().encode(payload).length) * 4 + 17;
}

/** Alternating pad codewords the spec prescribes when nothing better is asked. */
export const PAD_BYTES = [0xec, 0x11];

/**
 * Byte-mode bitstream for `payload`, padded to the version's capacity.
 * `pad` supplies the padding codewords; they carry no meaning to a decoder,
 * which is what makes them free real estate for artwork.
 */
export function codewords(payload: string, version: number, pad?: number[]): number[] {
  const bytes = Array.from(new TextEncoder().encode(payload));
  const bits: number[] = [];
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i -= 1) bits.push((value >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const capacity = dataCapacity(version) * 8;
  for (let i = 0; i < 4 && bits.length < capacity; i += 1) bits.push(0); // terminator
  while (bits.length % 8 !== 0) bits.push(0);

  const out: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b += 1) byte = (byte << 1) | bits[i + b]!;
    out.push(byte);
  }
  for (let i = 0; out.length < dataCapacity(version); i += 1) {
    out.push(pad?.[i] ?? PAD_BYTES[i % 2]!);
  }
  return out;
}

/** Interleave data and error-correction codewords exactly as the spec orders. */
export function interleave(data: number[], version: number): number[] {
  const [ecLen, ...groups] = RS_H[version - 1]!;
  const blocks: { data: number[]; ec: number[] }[] = [];
  let at = 0;
  for (const [count, len] of groups) {
    for (let b = 0; b < count; b += 1) {
      const chunk = data.slice(at, at + len);
      at += len;
      blocks.push({ data: chunk, ec: ecc(chunk, ecLen) });
    }
  }
  const out: number[] = [];
  const longest = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < longest; i += 1) {
    for (const b of blocks) if (i < b.data.length) out.push(b.data[i]!);
  }
  for (let i = 0; i < ecLen; i += 1) {
    for (const b of blocks) out.push(b.ec[i]!);
  }
  return out;
}

/* -------------------------------- matrix -------------------------------- */

/** The eight mask patterns, by index, as the spec defines them. */
export const MASKS: ((row: number, col: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/** BCH(15,5) format information for level H and a mask, spec-masked. */
function formatBits(mask: number): number {
  const data = (0b10 << 3) | mask; // 10 = level H
  let rem = data << 10;
  for (let i = 14; i >= 10; i -= 1) if ((rem >> i) & 1) rem ^= 0x537 << (i - 10);
  return ((data << 10) | rem) ^ 0x5412;
}

/** BCH(18,6) version information, for versions 7 and up. */
function versionBits(version: number): number {
  let rem = version << 12;
  for (let i = 17; i >= 12; i -= 1) if ((rem >> i) & 1) rem ^= 0x1f25 << (i - 12);
  return (version << 12) | rem;
}

/** Draw the fixed patterns every code shares. */
function skeleton(n: number): (boolean | null)[][] {
  const m: (boolean | null)[][] = Array.from({ length: n }, () =>
    new Array<boolean | null>(n).fill(null),
  );
  const set = (x: number, y: number, v: boolean) => {
    if (x >= 0 && y >= 0 && x < n && y < n) m[y]![x] = v;
  };
  const finder = (x0: number, y0: number) => {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const on =
          dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 &&
          (dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
            (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        set(x0 + dx, y0 + dy, on);
      }
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);

  for (let i = 8; i < n - 8; i += 1) {
    const on = i % 2 === 0;
    set(i, 6, on);
    set(6, i, on);
  }

  const version = (n - 17) / 4;
  const centres = ALIGNMENT[version] ?? [];
  for (const cy of centres) {
    for (const cx of centres) {
      const onFinder =
        (cx <= 8 && cy <= 8) || (cx >= n - 9 && cy <= 8) || (cx <= 8 && cy >= n - 9);
      if (onFinder) continue;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }
  set(8, n - 8, true); // the dark module
  return m;
}

/**
 * Write the format bits into both of their copies: a vertical strip down
 * column 8 and a horizontal strip along row 8, split around the finders
 * exactly as the spec lays them out.
 */
function writeFormat(m: (boolean | null)[][], n: number, mask: number) {
  const bits = formatBits(mask);
  for (let i = 0; i < 15; i += 1) {
    const on = ((bits >> i) & 1) === 1;
    if (i < 6) m[i]![8] = on;
    else if (i < 8) m[i + 1]![8] = on;
    else m[n - 15 + i]![8] = on;
    if (i < 8) m[8]![n - 1 - i] = on;
    else if (i === 8) m[8]![7] = on;
    else m[8]![14 - i] = on;
  }
}

/** Write the version bits, for versions 7 and up. */
function writeVersion(m: (boolean | null)[][], n: number, version: number) {
  if (version < 7) return;
  const bits = versionBits(version);
  for (let i = 0; i < 18; i += 1) {
    const on = ((bits >> i) & 1) === 1;
    const a = Math.floor(i / 3);
    const b = (i % 3) + n - 11;
    m[b]![a] = on;
    m[a]![b] = on;
  }
}

/** A finished code plus the choices that produced it. */
export interface EncodedQr {
  matrix: boolean[][];
  version: number;
  mask: number;
  /** Modules that carry data - the only ones a mask or padding can move. */
  data: boolean[][];
}

/** Encode  into a matrix using a specific mask and padding. */
export function encode(payload: string, mask: number, pad?: number[]): EncodedQr {
  const bytes = new TextEncoder().encode(payload).length;
  const version = pickVersion(bytes);
  const n = version * 4 + 17;
  const stream = interleave(codewords(payload, version, pad), version);
  const m = skeleton(n);
  writeFormat(m, n, mask);
  writeVersion(m, n, version);

  // Zigzag placement: two-module-wide columns walked right to left, each one
  // in the opposite vertical direction to the last, skipping the timing line
  // in column 6 and every module the patterns above already own.
  const maskFn = MASKS[mask]!;
  let bit = 0;
  let row = n - 1;
  let step = -1;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (;;) {
      for (let dx = 0; dx < 2; dx += 1) {
        const x = col - dx;
        if (m[row]![x] !== null) continue;
        const byte = stream[bit >> 3] ?? 0;
        const on = ((byte >> (7 - (bit & 7))) & 1) === 1;
        m[row]![x] = maskFn(row, x) ? !on : on;
        bit += 1;
      }
      row += step;
      if (row < 0 || row >= n) {
        row -= step;
        step = -step;
        break;
      }
    }
  }

  const fn = functionModules(n);
  const matrix = m.map((row) => row.map((v) => v === true));
  const data = matrix.map((row, y) => row.map((_, x) => !fn[y]![x]));
  return { matrix, version, mask, data };
}

/* --------------------------- artwork-aware choice ------------------------ */

/** How much a code's dark modules agree with a target picture, 0..1. */
export function agreement(
  qr: EncodedQr,
  tone: (x: number, y: number) => number,
): number {
  const n = qr.matrix.length;
  let score = 0;
  let weight = 0;
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (!qr.data[y]![x]) continue; // function patterns are not ours to move
      const want = tone(x, y); // 1 = the picture is dark here
      const w = Math.abs(want - 0.5) * 2; // ignore mid-tones, they cost nothing
      weight += w;
      if (qr.matrix[y]![x] === want >= 0.5) score += w;
    }
  }
  return weight > 0 ? score / weight : 0;
}

/**
 * Encode `payload` with the mask whose module layout best matches the picture.
 *
 * The eight masks are not a detail of the spec we have to accept - they are
 * eight different codes for the same message, and a scanner reads all of them
 * identically. Picking the one that already agrees with the artwork means
 * fewer modules fighting the picture before a single pixel is drawn.
 */
export function encodeForTone(
  payload: string,
  tone: (x: number, y: number) => number,
): EncodedQr & { agreement: number } {
  let best: (EncodedQr & { agreement: number }) | null = null;
  for (let mask = 0; mask < 8; mask += 1) {
    const qr = encode(payload, mask);
    const score = agreement(qr, tone);
    if (!best || score > best.agreement) best = { ...qr, agreement: score };
  }
  return best!;
}
