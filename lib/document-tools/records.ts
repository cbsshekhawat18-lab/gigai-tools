/**
 * Repeating-records PDF extractor: one spreadsheet row per record.
 *
 * The table heuristic in `excel.ts` reconstructs PDFs that LOOK like tables.
 * This engine handles the other common shape: a page of repeated boxes -
 * voter rolls, directories, ration/beneficiary lists, catalogues - where each
 * box holds the same labelled fields ("Name :", "Age :") and the user wants
 * one row per PERSON, not one row per printed line.
 *
 * How it works (all positional, all on-device):
 *  1. Find the document's repeating labels: colon-terminated token runs that
 *     recur across pages. The most frequent label marks one occurrence per
 *     record (its x-positions also reveal the column grid).
 *  2. Split each page into columns at midpoints between label x-clusters,
 *     re-cluster lines per column, and band lines into records: an ID line
 *     (serial + document ID like WUX0502401) tops each record when present,
 *     with a proportional fallback when not.
 *  3. Parse each record's lines into label -> value fields, including the
 *     split-line case where a label's value is printed on the following line.
 *
 * HONESTY NOTES, learned from a real Jaipur Nagar Nigam electoral roll:
 *  - Many Indian government PDFs embed fonts whose Unicode maps are lossy:
 *    Indic vowel signs (matras) come out wrong or missing for EVERY
 *    extractor that reads the text layer (the glyphs are fine, the map isn't).
 *    We DETECT that (consonant-to-matra ratio) and surface it, and we never
 *    "repair" names by guessing - the mapping is many-to-one, so a repair
 *    would fabricate. Numbers, ages, IDs and Latin text are unaffected.
 *  - This is a heuristic. The editable grid downstream is the correction UI.
 */

import { openPdfDocument } from "@/lib/pdf/core";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { type Result, fail, message, ok } from "./shared";

export interface RecordExtraction {
  headers: string[];
  rows: string[][];
  recordCount: number;
  pageCount: number;
  /** Field labels as they appear in the PDF (post-recognizer). */
  labels: string[];
  /** True when the PDF's font encoding is destroying Devanagari vowel signs. */
  textDamaged: boolean;
  /** True when the electoral-roll label set was recognised and normalised. */
  recognised: boolean;
}

interface Tok {
  str: string;
  x: number;
  y: number;
  h: number;
}

interface Line {
  y: number;
  toks: Tok[];
}

/** Document IDs: EPIC-style (WUX0502401, BLS3228905) or slashed (RJ/06/044/153292). */
const ID_RE = /^(?:[A-Z]{2,5}[0-9]{6,12}|[A-Z]{1,4}(?:\/[A-Z0-9]{2,}){2,})$/;
const SERIAL_RE = /^[0-9]{1,4}$/;

/** Normalise a label for lexicon matching: spaces vary with glyph x-gaps. */
const norm = (s: string) => s.replace(/[\s:]+/g, "");

/**
 * Known electoral-roll labels -> canonical headers. Keys are the DAMAGED forms
 * these PDFs actually emit (deterministic per encoding) plus the correct forms
 * for rolls with intact fonts. The three relation labels merge into one
 * column pair so husband/father/mother variants don't produce sparse columns.
 */
const ROLL_LABELS: Record<string, { header: string; relation?: string }> = {
  "नरम": { header: "नाम (Name)" },
  "नाम": { header: "नाम (Name)" },
  "नपतरकरनरम": { header: "संबंधी का नाम (Relation Name)", relation: "पिता (Father)" },
  "पिताकानाम": { header: "संबंधी का नाम (Relation Name)", relation: "पिता (Father)" },
  "पनतकरनरम": { header: "संबंधी का नाम (Relation Name)", relation: "पति (Husband)" },
  "पतिकानाम": { header: "संबंधी का नाम (Relation Name)", relation: "पति (Husband)" },
  "मरतरकरनरम": { header: "संबंधी का नाम (Relation Name)", relation: "माता (Mother)" },
  "माताकानाम": { header: "संबंधी का नाम (Relation Name)", relation: "माता (Mother)" },
  "मकरनसनखजर": { header: "मकान संख्या (House No.)" },
  "मकरनससखजर": { header: "मकान संख्या (House No.)" },
  "मकानसंख्या": { header: "मकान संख्या (House No.)" },
  "आजच": { header: "आयु (Age)" },
  "आजप": { header: "आयु (Age)" },
  "आयु": { header: "आयु (Age)" },
  "ललग": { header: "लिंग (Gender)" },
  "लिंग": { header: "लिंग (Gender)" },
};
const RELATION_HEADER = "संबंध (Relation)";

function toTokens(items: TextItem[]): Tok[] {
  const out: Tok[] = [];
  for (const item of items) {
    if (!("str" in item) || !item.str || !item.str.trim()) continue;
    const t = item.transform;
    out.push({
      str: item.str.trim(),
      x: t[4] ?? 0,
      y: t[5] ?? 0,
      h: Math.hypot(t[2] ?? 0, t[3] ?? 0) || item.height || 8,
    });
  }
  return out;
}

/** Cluster tokens into baseline lines (used globally and per column). */
function toLines(tokens: Tok[]): Line[] {
  const sorted = [...tokens].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: Line[] = [];
  for (const tok of sorted) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(line.y - tok.y) <= 0.6 * Math.max(tok.h, 8)) {
      line.toks.push(tok);
    } else {
      lines.push({ y: tok.y, toks: [tok] });
    }
  }
  for (const l of lines) l.toks.sort((a, b) => a.x - b.x);
  return lines;
}

/**
 * Walk a line's tokens and split it at colons into (label, value) segments.
 * On each colon we look for the longest token-suffix of the buffer that is in
 * the lexicon; preceding tokens flush into the PREVIOUS field's value (this is
 * what parses "Age : 54 Gender : M" printed as one visual line).
 */
function parseLine(
  toks: Tok[],
  lexicon: Set<string> | null,
  fields: { label: string; labelX: number; value: string[] }[],
  extras: Tok[],
) {
  let buf: Tok[] = [];
  const flushToOpen = (ts: Tok[]) => {
    const open = fields[fields.length - 1];
    if (open) open.value.push(...ts.map((t) => t.str));
    else extras.push(...ts);
  };
  for (const tok of toks) {
    const endsColon = tok.str === ":" || tok.str.endsWith(":");
    if (!endsColon) {
      buf.push(tok);
      continue;
    }
    const core = tok.str === ":" ? [] : [{ ...tok, str: tok.str.slice(0, -1) }];
    // Longest suffix of buf+core that the lexicon knows (lexicon null = learning
    // pass, accept any non-empty suffix of up to 4 tokens).
    const cand = [...buf, ...core];
    let match = -1;
    for (let take = Math.min(4, cand.length); take >= 1; take -= 1) {
      const first = cand[cand.length - take]?.str ?? "";
      // A label never STARTS with a number or stray punctuation - those are
      // the previous field's value bleeding into the candidate ("Age : 54
      // Gender :" must yield label "Gender", value-flush "54").
      if (/^[0-9.,/()\-]+$/.test(first) || /^[A-Za-z]$/.test(first)) continue;
      const key = norm(cand.slice(cand.length - take).map((t) => t.str).join(""));
      if (!key) continue;
      if (lexicon === null || lexicon.has(key)) {
        match = cand.length - take;
        break;
      }
    }
    if (match >= 0) {
      flushToOpen(cand.slice(0, match));
      const labelToks = cand.slice(match);
      fields.push({
        label: labelToks.map((t) => t.str).join(" "),
        labelX: labelToks[0]?.x ?? tok.x,
        value: [],
      });
    } else {
      flushToOpen([...cand, ...(tok.str === ":" ? [tok] : [])]);
    }
    buf = [];
  }
  if (buf.length > 0) flushToOpen(buf);
}

/**
 * Pass 1: learn the recurring labels of the whole document. Lines here are
 * GLOBAL (columns merged), so the token run before a colon is often
 * "<neighbour column's trailing value> <real label>".
 *
 * Two counts per key, because they answer different questions:
 *  - full: the key stood as the COMPLETE candidate (numbers stripped from the
 *    lead). Real labels do this constantly (every line/column start); glued
 *    fragments like "कर नरम" (the tail of "पिता कर नरम") essentially never do.
 *    The lexicon is built from this.
 *  - suffix: the key appeared as ANY trailing part of a candidate. This
 *    measures true frequency for the prune comparisons, immune to whatever
 *    contamination precedes the label.
 */
function learnLexicon(pages: Tok[][]): { full: Map<string, number>; suffix: Map<string, number> } {
  const full = new Map<string, number>();
  const suffix = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  const junkLead = (t: string) => /^[0-9.,/()\-]+$/.test(t) || /^[A-Za-z]$/.test(t);
  for (const toks of pages) {
    for (const line of toLines(toks)) {
      let buf: Tok[] = [];
      for (const tok of line.toks) {
        const endsColon = tok.str === ":" || tok.str.endsWith(":");
        if (!endsColon) {
          buf.push(tok);
          continue;
        }
        const cand = tok.str === ":" ? buf : [...buf, { ...tok, str: tok.str.slice(0, -1) }];
        let longest = "";
        for (let take = 1; take <= Math.min(4, cand.length); take += 1) {
          const first = cand[cand.length - take]?.str ?? "";
          if (junkLead(first)) break;
          const key = norm(cand.slice(cand.length - take).map((t) => t.str).join(""));
          if (key.length > 0 && key.length <= 40 && !SERIAL_RE.test(key)) {
            bump(suffix, key);
            longest = key;
          }
        }
        if (longest) bump(full, longest);
        buf = [];
      }
    }
  }
  return { full, suffix };
}

/** Split label x-positions into column clusters (gap threshold in pt). */
function clusterColumns(xs: number[]): number[] {
  const sorted = [...xs].sort((a, b) => a - b);
  const cols: number[][] = [];
  for (const x of sorted) {
    const col = cols[cols.length - 1];
    const last = col?.[col.length - 1];
    if (col && last !== undefined && x - last < 60) col.push(x);
    else cols.push([x]);
  }
  return cols.map((c) => c.reduce((s, v) => s + v, 0) / c.length);
}

/** One page of positioned tokens - from pdf.js locally, or from the server
 *  repair endpoint (which emits the same shape after OCR-merging). */
export interface TokenPage {
  tokens: Tok[];
}
export type { Tok as RecordToken };

export async function pdfToRecords(
  file: Blob,
  opts: { password?: string } = {},
): Promise<Result<RecordExtraction>> {
  try {
    const doc = await openPdfDocument(file, opts.password);
    try {
      const pages: Tok[][] = [];
      for (let p = 1; p <= doc.numPages; p += 1) {
        const page = await doc.getPage(p);
        try {
          pages.push(toTokens((await page.getTextContent()).items as TextItem[]));
        } finally {
          page.cleanup();
        }
      }
      return pagesToRecords(pages);
    } finally {
      await doc.destroy();
    }
  } catch (err) {
    return fail(message(err));
  }
}

/** Same pipeline over pre-extracted token pages (the server repair path). */
export function tokenPagesToRecords(tokenPages: TokenPage[]): Result<RecordExtraction> {
  try {
    return pagesToRecords(tokenPages.map((p) => p.tokens));
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Split tokens carrying an interior colon ("नाम: संजय" from tokenizers that
 * break on whitespace only) so the label/value walker sees the same shape
 * regardless of extractor: the colon stays attached to its label part, and x
 * positions are apportioned by character count - only ordering and rough label
 * x matter downstream.
 */
function splitColonTokens(tokens: Tok[]): Tok[] {
  const out: Tok[] = [];
  for (const t of tokens) {
    const i = t.str.indexOf(":");
    if (i < 0 || i === t.str.length - 1 || t.str === ":") {
      out.push(t);
      continue;
    }
    const perChar = (t.h * 0.55) || 4;
    let cursor = t.x;
    for (const part of t.str.split(/(?<=:)/)) {
      if (part.trim()) out.push({ str: part.trim(), x: cursor, y: t.y, h: t.h });
      cursor += part.length * perChar;
    }
  }
  return out;
}

function pagesToRecords(rawPages: Tok[][]): Result<RecordExtraction> {
  {
    const pages = rawPages.map(splitColonTokens);

      // Indic damage probe. Every Indic block shares its layout (ISCII
      // heritage): consonants at base+0x15..0x39, dependent vowel signs at
      // base+0x3E..0x4D. Healthy prose in any of them runs ~40% vowel signs
      // per consonant; a lossy font map yields almost none. One damaged
      // script is enough to offer the OCR repair.
      const INDIC_BASES = [0x0900, 0x0980, 0x0a00, 0x0a80, 0x0b00, 0x0b80, 0x0c00, 0x0c80, 0x0d00];
      const cons = new Array(INDIC_BASES.length).fill(0);
      const vowels = new Array(INDIC_BASES.length).fill(0);
      for (const toks of pages) {
        for (const t of toks) {
          for (const ch of t.str) {
            const c = ch.codePointAt(0) ?? 0;
            const bi = INDIC_BASES.findIndex((b) => c >= b && c <= b + 0x7f);
            if (bi < 0) continue;
            const off = c - (INDIC_BASES[bi] ?? 0);
            if (off >= 0x15 && off <= 0x39) cons[bi] += 1;
            else if (off >= 0x3e && off <= 0x4d) vowels[bi] += 1;
          }
        }
      }
      const textDamaged = INDIC_BASES.some(
        (_, i) => (cons[i] ?? 0) > 200 && (vowels[i] ?? 0) / (cons[i] ?? 1) < 0.05,
      );

      // Lexicon: keys that stood as a complete candidate at least 4 times,
      // pruned strongest-first: a key containing an established, at least
      // twice-as-frequent label (as suffix OR prefix) is that label plus glued
      // value text. Recogniser keys are domain truth and never pruned - this
      // is what keeps "पिता कर नरम" alive next to the far more frequent "नरम".
      const { full, suffix } = learnLexicon(pages);
      const candidates = [...full]
        .filter(([, n]) => n >= 4)
        .map(([k]) => k)
        .sort((a, b) => (suffix.get(b) ?? 0) - (suffix.get(a) ?? 0));
      const lexicon = new Set<string>();
      for (const k of candidates) {
        const kn = suffix.get(k) ?? 0;
        const swallowed =
          !ROLL_LABELS[k] &&
          [...lexicon].some(
            (est) => (k.endsWith(est) || k.startsWith(est)) && (suffix.get(est) ?? 0) >= 2 * kn,
          );
        if (!swallowed) lexicon.add(k);
      }
      // Every per-record label ties on frequency (one occurrence each), so raw
      // argmax picks arbitrarily - and a BOTTOM label (age, gender) as anchor
      // splits every record across two bands. Among near-max labels, take the
      // one that appears TOPMOST on the first page: that's the record's lead
      // field, the right anchor for top-down banding.
      let max = 0;
      for (const k of lexicon) max = Math.max(max, suffix.get(k) ?? 0);
      if (max < 6) return fail("No repeating record structure found.");
      const nearMax = [...lexicon].filter((k) => (suffix.get(k) ?? 0) >= 0.9 * max);
      let primary: string | null = null;
      let primaryY = -Infinity;
      for (const line of toLines(pages[0] ?? [])) {
        const fs: { label: string; labelX: number; value: string[] }[] = [];
        parseLine(line.toks, lexicon, fs, []);
        for (const f of fs) {
          const key = norm(f.label);
          if (nearMax.includes(key) && line.y > primaryY) {
            primaryY = line.y;
            primary = key;
          }
        }
      }
      primary ??= nearMax[0] ?? null;
      if (!primary) return fail("No repeating record structure found.");
      // Per page: columns from primary-label x positions, then per-column
      // banding into records.
      interface Rec {
        fields: { label: string; labelX: number; value: string[] }[];
        extras: Tok[];
        pageIdx: number;
        top: number;
        colX: number;
      }
      const records: Rec[] = [];
      for (let pi = 0; pi < pages.length; pi += 1) {
        const toks = pages[pi] ?? [];
        const primXs: number[] = [];
        for (const line of toLines(toks)) {
          const fs: { label: string; labelX: number; value: string[] }[] = [];
          parseLine(line.toks, lexicon, fs, []);
          for (const f of fs) if (norm(f.label) === primary) primXs.push(f.labelX);
        }
        if (primXs.length === 0) continue;
        const centres = clusterColumns(primXs);
        const bounds = centres.map((c, i) =>
          i + 1 < centres.length ? (c + (centres[i + 1] ?? c)) / 2 : Infinity,
        );

        for (let ci = 0; ci < centres.length; ci += 1) {
          const lo = ci === 0 ? -Infinity : (bounds[ci - 1] ?? -Infinity);
          const hi = bounds[ci] ?? Infinity;
          const colToks = toks.filter((t) => t.x >= lo && t.x < hi);
          const colLines = toLines(colToks);

          // Anchor ys: primary label per record; ID lines refine band tops.
          const anchorYs: number[] = [];
          for (const line of colLines) {
            const fs: { label: string; labelX: number; value: string[] }[] = [];
            parseLine(line.toks, lexicon, fs, []);
            if (fs.some((f) => norm(f.label) === primary)) anchorYs.push(line.y);
          }
          if (anchorYs.length === 0) continue;
          anchorYs.sort((a, b) => b - a);
          const gaps = anchorYs.slice(1).map((y, i) => (anchorYs[i] ?? y) - y);
          const medGap =
            gaps.length > 0
              ? [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)] ?? 40
              : 40;

          const idLineYs = colLines
            .filter((l) => l.toks.some((t) => ID_RE.test(t.str)))
            .map((l) => l.y);

          // Band [top, bottom) per record. When the column has ~one ID line
          // per record, the ID lines ARE the record tops - band on them
          // directly, immune to which label anchored the count. Otherwise:
          // the ID just above the label when present, else label + 0.25×gap.
          const idStrong =
            idLineYs.length >= 3 &&
            Math.abs(idLineYs.length - anchorYs.length) <= Math.ceil(anchorYs.length * 0.2);
          const bands = idStrong
            ? [...idLineYs]
                .sort((a, b) => b - a)
                .map((y) => ({ label: y, top: y + 1 }))
            : anchorYs.map((y) => {
                const idAbove = idLineYs
                  .filter((iy) => iy > y && iy - y <= 0.6 * medGap)
                  .sort((a, b) => a - b)[0];
                return { label: y, top: (idAbove ?? y + 0.25 * medGap) + 1 };
              });
          for (const [bi, band] of bands.entries()) {
            const bottom = bands[bi + 1]?.top ?? band.label - 0.75 * medGap;
            const rec: Rec = {
              fields: [],
              extras: [],
              pageIdx: pi,
              top: band.top,
              colX: centres[ci] ?? 0,
            };
            const recLines = colLines.filter((l) => l.y <= band.top && l.y > bottom);
            for (const line of recLines) {
              // Parse each line in isolation: letting a line append into the
              // previous line's still-open field silently swallows any line
              // whose label lost its colon (an OCR-repaired token can), gluing
              // one person's field into another's value.
              const lineFields: { label: string; labelX: number; value: string[] }[] = [];
              const lineExtras: Tok[] = [];
              parseLine(line.toks, lexicon, lineFields, lineExtras);
              const gotLabels = lineFields.length > 0;
              rec.fields.push(...lineFields);
              if (!gotLabels && lineExtras.length > 0) {
                // Unlabelled line: values printed BELOW their labels. Assign
                // each token to the nearest empty field above it by x.
                const empties = rec.fields.filter((f) => f.value.length === 0);
                if (empties.length > 0) {
                  for (const t of lineExtras) {
                    let best = empties[0];
                    for (const f of empties) {
                      if (
                        best &&
                        Math.abs(f.labelX - t.x) < Math.abs(best.labelX - t.x)
                      )
                        best = f;
                    }
                    best?.value.push(t.str);
                  }
                  continue;
                }
              }
              rec.extras.push(...lineExtras);
            }
            if (rec.fields.length > 0) records.push(rec);
          }
        }
      }
      if (records.length < 6) return fail("No repeating record structure found.");

      // Reading order: page, then band top (desc = down the page), then column.
      records.sort(
        (a, b) => a.pageIdx - b.pageIdx || b.top - a.top || a.colX - b.colX,
      );

      // Recognise the electoral-roll label set when enough of it is present.
      const allKeys = new Set(records.flatMap((r) => r.fields.map((f) => norm(f.label))));
      const known = [...allKeys].filter((k) => ROLL_LABELS[k]).length;
      const recognised = known >= 3;

      // Header union in first-seen order; serial + ID always lead.
      const labelOrder: string[] = [];
      const headerOf = (rawKey: string, raw: string) =>
        recognised && ROLL_LABELS[rawKey] ? (ROLL_LABELS[rawKey]?.header ?? raw) : raw;
      for (const r of records) {
        for (const f of r.fields) {
          const h = headerOf(norm(f.label), f.label);
          if (!labelOrder.includes(h)) labelOrder.push(h);
        }
      }
      // Deletion stamps: rolls mark removed electors with a single letter by
      // the serial. The roll's own legend: E = death, S = shifted, R = repeated
      // entry. Only meaningful when the roll label set was recognised.
      const STATUS_HEADER = "\u0938\u094d\u0925\u093f\u0924\u093f (Status)";
      const DELETION: Record<string, string> = {
        S: "Deleted - shifted",
        E: "Deleted - death",
        R: "Deleted - repeated entry",
      };
      const hasDeletions =
        recognised &&
        records.some((r) => r.extras.some((t) => DELETION[t.str] !== undefined));

      const hasRelation = recognised && records.some((r) =>
        r.fields.some((f) => ROLL_LABELS[norm(f.label)]?.relation),
      );
      const headers = [
        "#",
        "ID",
        ...(hasRelation
          ? labelOrder.flatMap((h) =>
              h === "संबंधी का नाम (Relation Name)" ? [RELATION_HEADER, h] : [h],
            )
          : labelOrder),
        ...(hasDeletions ? [STATUS_HEADER] : []),
      ];

      const rows = records.map((r) => {
        const row = new Array<string>(headers.length).fill("");
        let serial = "";
        let id = "";
        let status = "";
        for (const t of r.extras) {
          if (!id && ID_RE.test(t.str)) id = t.str;
          else if (!serial && SERIAL_RE.test(t.str)) serial = t.str;
          else if (!status && DELETION[t.str]) status = DELETION[t.str] ?? "";
        }
        row[0] = serial;
        row[1] = id;
        if (hasDeletions) {
          const si = headers.indexOf(STATUS_HEADER);
          if (si >= 0) row[si] = status;
        }
        for (const f of r.fields) {
          const key = norm(f.label);
          const h = headerOf(key, f.label);
          const idx = headers.indexOf(h);
          if (idx >= 0 && !row[idx]) row[idx] = f.value.join(" ").trim();
          const rel = recognised ? ROLL_LABELS[key]?.relation : undefined;
          if (rel) {
            const ri = headers.indexOf(RELATION_HEADER);
            if (ri >= 0) row[ri] = rel;
          }
        }
        return row;
      });

      return ok({
        headers,
        rows,
        recordCount: rows.length,
        pageCount: pages.length,
        labels: labelOrder,
        textDamaged,
        recognised,
      });
  }
}
