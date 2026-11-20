/**
 * GigAI Tools: .docx → HTML, tuned to keep the formatting mammoth drops.
 *
 * Out of the box mammoth throws away three things people notice immediately in
 * the converted PDF: the Title style (it becomes an ordinary paragraph),
 * underline, and paragraph alignment (a centred heading comes out flush left).
 *
 * Headings and underline are recovered with a style map. Alignment needs a
 * detour: mammoth's document model *has* `paragraph.alignment` but its HTML
 * writer ignores it, and a style map can only match on style NAME. So for the
 * paragraphs that are actually aligned we rewrite the style name to a canonical
 * marker ("GigaiH1Center") and map that marker to an element with an alignment
 * class, which `html-blocks.ts` reads back. Paragraphs with default alignment
 * are left completely untouched, so mammoth's own mapping still applies to them.
 */

/** Alignment values Word writes that are worth carrying over. */
const ALIGNMENTS = ["center", "right", "both"] as const;
type DocxAlign = (typeof ALIGNMENTS)[number];

/** Canonical paragraph kinds we re-map, and the element each becomes. */
const KINDS: Record<string, string> = {
  Body: "p",
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
  Title: "h1",
  Subtitle: "p",
  Quote: "blockquote",
};

/** Word's "both" means justified; the rest map straight through. */
const CSS_ALIGN: Record<DocxAlign, string> = { center: "center", right: "right", both: "justify" };

/** Reduce a Word style name to one of the kinds above. */
export function canonicalKind(styleName: string | null | undefined): string {
  if (!styleName) return "Body";
  const name = styleName.trim();
  const heading = /^heading\s*([1-6])$/i.exec(name);
  if (heading?.[1]) return `H${heading[1]}`;
  if (/^title$/i.test(name)) return "Title";
  if (/^subtitle$/i.test(name)) return "Subtitle";
  if (/quote/i.test(name)) return "Quote";
  return "Body";
}

/** The marker style name used to smuggle alignment through mammoth. */
export function alignMarker(kind: string, align: DocxAlign): string {
  return `Gigai${kind}${align[0]?.toUpperCase()}${align.slice(1)}`;
}

/** Style map covering headings, title, underline and every alignment marker. */
export function buildStyleMap(): string[] {
  const map = [
    "p[style-name='Title'] => h1:fresh",
    "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
    "p[style-name='Quote'] => blockquote:fresh",
    "p[style-name='Intense Quote'] => blockquote:fresh",
    // Not in mammoth's defaults, so underline would otherwise be lost.
    "u => u",
    "strike => s",
    // Word's explicit page breaks; html-blocks turns this into a real new page.
    "br[type='page'] => hr.page-break",
  ];
  for (const [kind, el] of Object.entries(KINDS)) {
    for (const align of ALIGNMENTS) {
      map.push(`p[style-name='${alignMarker(kind, align)}'] => ${el}.align-${CSS_ALIGN[align]}:fresh`);
    }
  }
  return map;
}

/** Shape of the bits of mammoth's paragraph model we touch. */
interface MammothParagraph {
  alignment?: string | null;
  styleName?: string | null;
  styleId?: string | null;
}

/**
 * Rewrite aligned paragraphs to a marker style. Exported for tests: it is pure
 * and carries the one piece of logic worth pinning down.
 */
export function markAlignment<T extends MammothParagraph>(paragraph: T): T {
  const align = paragraph.alignment;
  if (!align || !(ALIGNMENTS as readonly string[]).includes(align)) return paragraph;
  const kind = canonicalKind(paragraph.styleName);
  return { ...paragraph, styleName: alignMarker(kind, align as DocxAlign), styleId: null };
}

/**
 * The slice of mammoth we use. Its bundled types describe neither `transforms`
 * nor the `transformDocument` option, although both are part of the documented
 * API and present at runtime, so we declare the shape we rely on.
 */
interface MammothModule {
  convertToHtml: (
    input: { arrayBuffer: ArrayBuffer },
    options?: { styleMap?: string[]; transformDocument?: unknown },
  ) => Promise<{ value: string }>;
  transforms: { paragraph: (fn: (p: MammothParagraph) => MammothParagraph) => unknown };
}

/** Convert a .docx ArrayBuffer to HTML, keeping headings, underline and alignment. */
export async function docxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  const mod = await import("mammoth");
  const lib = ((mod as unknown as { default?: unknown }).default ?? mod) as MammothModule;
  const { value } = await lib.convertToHtml(
    { arrayBuffer },
    {
      styleMap: buildStyleMap(),
      transformDocument: lib.transforms.paragraph(markAlignment),
    },
  );
  return value;
}
