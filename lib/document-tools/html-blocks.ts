/**
 * GigAI Tools: HTML -> `Block[]` for the text PDF renderer.
 *
 * The document engine's front-ends (mammoth for .docx, marked for Markdown,
 * xlsx for spreadsheets, epub.js for e-books) all hand us HTML, so one parser
 * feeds them all. It reads structure and the inline styles those libraries
 * actually emit; it is not a CSS engine and does not try to be.
 *
 * Browser-only: it uses DOMParser and decodes images through `Image`.
 */

import type { Align, Block, Inline, ListItem, TableCell, TableRow } from "./pdf-blocks";
import { pruneBlocks } from "./pdf-blocks";

/** Bullets per nesting depth. Kept inside WinAnsi so the text renderer can draw them. */
const BULLETS = ["•", "o", "-"];

/**
 * Elements whose text content is not document text. Callers wrap their HTML in
 * a <style> block (see convert.ts `wrapPrintable`), and without this the whole
 * stylesheet was laid out as a paragraph at the top of the PDF.
 */
const SKIP_TAGS = new Set([
  "STYLE", "SCRIPT", "NOSCRIPT", "TEMPLATE", "HEAD", "META", "LINK", "TITLE", "BASE",
]);

const BLOCK_TAGS = new Set([
  "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "TABLE",
  "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "BLOCKQUOTE", "PRE", "HR",
  "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "FIGURE", "FIGCAPTION", "BR",
]);

function rgbToHex(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex?.[1]) {
    const h = hex[1];
    return h.length === 3 ? `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : `#${h}`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (rgb?.[1]) {
    const [r, g, b] = rgb[1].split(",").map((n) => Math.max(0, Math.min(255, parseInt(n.trim(), 10) || 0)));
    const to = (n: number | undefined) => (n ?? 0).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`;
  }
  return undefined;
}

function alignOf(el: Element): Align | undefined {
  // `align-center` and friends come from the .docx front-end, which smuggles
  // Word's paragraph alignment through mammoth as a class (see docx-html.ts).
  for (const a of ["center", "right", "justify", "left"] as const) {
    if (el.classList?.contains(`align-${a}`)) return a;
  }
  const style = (el as HTMLElement).style?.textAlign || el.getAttribute("align") || "";
  const v = style.toLowerCase();
  if (v === "center" || v === "right" || v === "justify") return v;
  if (v === "left" || v === "start") return "left";
  if (v === "end") return "right";
  return undefined;
}

/** True when an element asks for a page break before/after it. */
function pageBreak(el: Element): "before" | "after" | null {
  const s = el.getAttribute("style") ?? "";
  if (/page-break-before\s*:\s*always|break-before\s*:\s*page/i.test(s)) return "before";
  if (/page-break-after\s*:\s*always|break-after\s*:\s*page/i.test(s)) return "after";
  if (el.classList?.contains("page-break")) return "after";
  return null;
}

/** Character properties inherited down the tree while collecting inline runs. */
interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  mono?: boolean;
  color?: string;
  size?: number;
  href?: string;
}

function styleFor(el: Element, inherited: RunStyle): RunStyle {
  const tag = el.tagName;
  const next: RunStyle = { ...inherited };
  if (tag === "STRONG" || tag === "B") next.bold = true;
  if (tag === "EM" || tag === "I" || tag === "CITE" || tag === "VAR") next.italic = true;
  if (tag === "U" || tag === "INS") next.underline = true;
  if (tag === "S" || tag === "DEL" || tag === "STRIKE") next.strike = true;
  if (tag === "CODE" || tag === "KBD" || tag === "SAMP" || tag === "PRE") next.mono = true;
  if (tag === "A") {
    const href = el.getAttribute("href");
    if (href && /^(https?:|mailto:)/i.test(href)) next.href = href;
  }

  const style = (el as HTMLElement).style;
  if (style) {
    const weight = style.fontWeight;
    if (weight === "bold" || weight === "bolder" || Number(weight) >= 600) next.bold = true;
    if (weight === "normal" || Number(weight) === 400) next.bold = inherited.bold;
    if (style.fontStyle === "italic" || style.fontStyle === "oblique") next.italic = true;
    const deco = `${style.textDecoration} ${style.textDecorationLine}`;
    if (/underline/.test(deco)) next.underline = true;
    if (/line-through/.test(deco)) next.strike = true;
    const color = rgbToHex(style.color ?? "");
    // Near-black is the default ink; carrying it as an override is noise.
    if (color && color !== "#000000" && color !== "#111111") next.color = color;
    const fs = /^([\d.]+)(pt|px)$/i.exec(style.fontSize ?? "");
    if (fs?.[1]) {
      const n = parseFloat(fs[1]);
      next.size = fs[2]?.toLowerCase() === "px" ? n * 0.75 : n;
    }
  }
  return next;
}

/** Flatten an element's descendants into styled runs. */
function collectRuns(node: Node, inherited: RunStyle, out: Inline[], pre: boolean): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      const raw = child.nodeValue ?? "";
      const text = pre ? raw : raw.replace(/\s+/g, " ");
      if (text) out.push({ ...inherited, text });
      continue;
    }
    if (child.nodeType !== 1) continue;
    const el = child as Element;
    if (SKIP_TAGS.has(el.tagName)) continue;
    if (el.tagName === "BR") {
      out.push({ ...inherited, text: pre ? "\n" : " " });
      continue;
    }
    if (el.tagName === "IMG") continue; // images are their own block
    collectRuns(el, styleFor(el, inherited), out, pre || el.tagName === "PRE");
  }
}

/** Natural pixel size of an image, needed to keep its aspect ratio in the PDF. */
async function imageBlock(el: Element): Promise<Block | null> {
  const src = el.getAttribute("src");
  if (!src || !src.startsWith("data:")) return null;
  const format = /^data:image\/(png|jpe?g)/i.exec(src)?.[1];
  if (!format) return null;
  const size = await new Promise<{ w: number; h: number } | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
  if (!size || !size.w || !size.h) return null;
  const attrW = parseFloat(el.getAttribute("width") ?? "") || 0;
  const attrH = parseFloat(el.getAttribute("height") ?? "") || 0;
  return {
    type: "image",
    data: src,
    format: format.toLowerCase() === "png" ? "PNG" : "JPEG",
    width: attrW || size.w,
    height: attrH || (attrW ? (size.h / size.w) * attrW : size.h),
  };
}

function cellOf(el: Element): TableCell {
  const runs: Inline[] = [];
  collectRuns(el, el.tagName === "TH" ? { bold: true } : {}, runs, false);
  const span = parseInt(el.getAttribute("colspan") ?? "1", 10);
  return { runs, align: alignOf(el), span: Number.isFinite(span) && span > 1 ? span : undefined };
}

function tableOf(el: Element): Block {
  const rows: TableRow[] = [];
  for (const tr of Array.from(el.querySelectorAll("tr"))) {
    const cells = Array.from(tr.children)
      .filter((c) => c.tagName === "TD" || c.tagName === "TH")
      .map(cellOf);
    if (!cells.length) continue;
    const inHead = tr.parentElement?.tagName === "THEAD";
    const allTh = Array.from(tr.children).every((c) => c.tagName === "TH");
    rows.push({ cells, header: inHead || allTh });
  }
  return { type: "table", rows };
}

/** Walk a list, emitting items with resolved markers (bullets or numbers). */
function listItems(el: Element, level: number, out: Block[]): void {
  const ordered = el.tagName === "OL";
  const start = parseInt(el.getAttribute("start") ?? "1", 10);
  let index = Number.isFinite(start) ? start : 1;
  const items: ListItem[] = [];

  for (const li of Array.from(el.children)) {
    if (li.tagName !== "LI") continue;
    const runs: Inline[] = [];
    // Collect this item's own text, stopping at any nested list.
    for (const child of Array.from(li.childNodes)) {
      const tag = (child as Element).tagName;
      if (tag === "UL" || tag === "OL") continue;
      if (child.nodeType === 3) {
        const text = (child.nodeValue ?? "").replace(/\s+/g, " ");
        if (text) runs.push({ text });
      } else if (child.nodeType === 1) {
        collectRuns(child as Element, styleFor(child as Element, {}), runs, false);
      }
    }
    items.push({
      runs,
      level,
      marker: ordered ? `${index}.` : (BULLETS[Math.min(level, BULLETS.length - 1)] ?? "-"),
    });
    index += 1;

    // Nested lists follow their parent item, one level deeper.
    const nested = Array.from(li.children).filter((c) => c.tagName === "UL" || c.tagName === "OL");
    if (nested.length) {
      if (items.length) out.push({ type: "list", items: items.splice(0, items.length) });
      for (const n of nested) listItems(n, level + 1, out);
    }
  }
  if (items.length) out.push({ type: "list", items });
}

async function walk(node: Element, out: Block[], depth: number): Promise<void> {
  for (const child of Array.from(node.children)) {
    const tag = child.tagName;
    if (SKIP_TAGS.has(tag)) continue;
    const brk = pageBreak(child);
    if (brk === "before") out.push({ type: "pagebreak" });

    if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4" || tag === "H5" || tag === "H6") {
      const runs: Inline[] = [];
      collectRuns(child, styleFor(child, {}), runs, false);
      out.push({ type: "para", runs, heading: Number(tag[1]), align: alignOf(child) });
    } else if (tag === "UL" || tag === "OL") {
      listItems(child, 0, out);
    } else if (tag === "TABLE") {
      out.push(tableOf(child));
    } else if (tag === "HR") {
      // `hr.page-break` is how a Word page break reaches us: pageBreak() above
      // already emitted the break, so drawing a rule too would be wrong.
      if (!child.classList?.contains("page-break")) out.push({ type: "rule" });
    } else if (tag === "PRE") {
      const runs: Inline[] = [];
      collectRuns(child, { mono: true }, runs, true);
      out.push({ type: "para", runs, pre: true });
    } else if (tag === "BLOCKQUOTE") {
      const runs: Inline[] = [];
      collectRuns(child, styleFor(child, {}), runs, false);
      out.push({ type: "para", runs, quote: true, align: alignOf(child) });
    } else if (tag === "IMG") {
      const img = await imageBlock(child);
      if (img) out.push(img);
    } else if (tag === "P" || tag === "FIGCAPTION") {
      // A paragraph that only wraps an image should become the image block.
      const imgs = Array.from(child.querySelectorAll("img"));
      const runs: Inline[] = [];
      collectRuns(child, styleFor(child, {}), runs, false);
      if (runs.some((r) => r.text.trim())) {
        out.push({ type: "para", runs, align: alignOf(child) });
      }
      for (const img of imgs) {
        const block = await imageBlock(img);
        if (block) out.push(block);
      }
    } else if (BLOCK_TAGS.has(tag) || depth < 6) {
      // Containers (div/section/body wrappers) are transparent: recurse. Guard
      // the depth so a pathological document cannot recurse without end.
      const hasBlockChild = Array.from(child.children).some((c) => BLOCK_TAGS.has(c.tagName));
      if (hasBlockChild) {
        await walk(child, out, depth + 1);
      } else {
        const runs: Inline[] = [];
        collectRuns(child, styleFor(child, {}), runs, false);
        if (runs.some((r) => r.text.trim())) out.push({ type: "para", runs, align: alignOf(child) });
        for (const img of Array.from(child.querySelectorAll("img"))) {
          const block = await imageBlock(img);
          if (block) out.push(block);
        }
      }
    }

    if (brk === "after") out.push({ type: "pagebreak" });
  }
}

/** Parse an HTML fragment (body content) into blocks for the PDF renderer. */
export async function htmlToBlocks(html: string): Promise<Block[]> {
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, "text/html");
  const out: Block[] = [];
  await walk(doc.body, out, 0);
  return pruneBlocks(out);
}
