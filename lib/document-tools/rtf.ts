/**
 * GigAI Tools: dependency-free RTF parser.
 *
 * RTF is a plain-ASCII markup of `\controlWords`, `{groups}` and literal text.
 * There's no reliable in-browser library, so we hand-roll a small tokeniser that
 * covers the control words that matter for readable output:
 *   - text flow:    \par \line \tab, escaped \{ \} \\
 *   - unicode:      \uN   (with the following fallback char skipped)
 *   - hex bytes:    \'hh  (decoded via the current codepage, default cp1252)
 *   - inline style: \b \i \ul (+ their \b0/\i0/\ulnone off switches) → HTML
 *   - skip groups:  \fonttbl \colortbl \stylesheet \info \*\... (ignored)
 *
 * HONEST: this recovers text and basic bold/italic/underline + paragraphs. It is
 * NOT a full RTF renderer, tables, images, fonts, colors and exotic control
 * words are dropped. Everything is synchronous and allocation-light.
 */

import { escapeHtml } from "./shared";

/** Control-group destinations whose entire contents we discard. */
const SKIP_DESTINATIONS = new Set([
  "fonttbl",
  "colortbl",
  "stylesheet",
  "info",
  "pict",
  "object",
  "themedata",
  "colorschememapping",
  "latentstyles",
  "datastore",
  "generator",
]);

/** A minimal windows-1252 high-range map for the bytes that differ from latin-1. */
const CP1252: Record<number, string> = {
  0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„",
  0x85: "…", 0x86: "†", 0x87: "‡", 0x88: "ˆ",
  0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ",
  0x8e: "Ž", 0x91: "‘", 0x92: "’", 0x93: "“",
  0x94: "”", 0x95: "•", 0x96: "–", 0x97: "—",
  0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›",
  0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ",
};

/** Per-group formatting state (RTF groups inherit + override their parent). */
interface Style {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

/** A styled paragraph produced by the core parser. */
interface Paragraph {
  runs: { text: string; style: Style }[];
}

/** Internal: run the tokeniser once and return structured paragraphs. */
function parseRtf(rtf: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let para: Paragraph = { runs: [] };
  let buffer = "";
  let style: Style = { bold: false, italic: false, underline: false };
  const stack: Style[] = [];
  // Destination-skip depth: when >0 we ignore text until the group closes.
  let skipDepth = 0;
  let skipGroupLevel = -1;
  let depth = 0;
  // `\uc` unicode-fallback byte count (chars to skip after a \uN). Default 1.
  const ucStack: number[] = [1];
  let pendingSkipChars = 0;

  const flushRun = () => {
    if (buffer.length > 0) {
      para.runs.push({ text: buffer, style: { ...style } });
      buffer = "";
    }
  };
  const endParagraph = () => {
    flushRun();
    paragraphs.push(para);
    para = { runs: [] };
  };
  const emit = (text: string) => {
    if (skipDepth > 0) return;
    if (pendingSkipChars > 0) {
      // Consume unicode fallback bytes one char at a time.
      let i = 0;
      while (i < text.length && pendingSkipChars > 0) {
        i += 1;
        pendingSkipChars -= 1;
      }
      buffer += text.slice(i);
    } else {
      buffer += text;
    }
  };

  const len = rtf.length;
  let i = 0;
  while (i < len) {
    const ch = rtf[i]!;

    if (ch === "{") {
      stack.push({ ...style });
      ucStack.push(ucStack[ucStack.length - 1] ?? 1);
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}") {
      flushRun();
      const restored = stack.pop();
      if (restored) style = restored;
      ucStack.pop();
      if (skipDepth > 0 && depth === skipGroupLevel) {
        skipDepth = 0;
        skipGroupLevel = -1;
      }
      depth -= 1;
      i += 1;
      continue;
    }
    if (ch === "\\") {
      const next = rtf[i + 1];
      // Escaped literals: \{ \} \\
      if (next === "{" || next === "}" || next === "\\") {
        emit(next);
        i += 2;
        continue;
      }
      // Hex byte: \'hh
      if (next === "'") {
        const hex = rtf.slice(i + 2, i + 4);
        const code = parseInt(hex, 16);
        if (!Number.isNaN(code)) emit(decodeByte(code));
        i += 4;
        continue;
      }
      // Ignorable-destination marker: \*: the following control group is skipped.
      if (next === "*") {
        skipDepth += 1;
        skipGroupLevel = depth;
        i += 2;
        continue;
      }
      // Non-alphabetic control symbols (\~ \_ \- etc.): treat a few, skip rest.
      if (next && !/[a-zA-Z]/.test(next)) {
        if (next === "\n" || next === "\r") endParagraph();
        else if (next === "~") emit(" ");
        else if (next === "-") {/* optional hyphen: drop */}
        i += 2;
        continue;
      }

      // Alphabetic control word: \word[-]NNN with optional trailing space.
      let j = i + 1;
      while (j < len && /[a-zA-Z]/.test(rtf[j]!)) j += 1;
      const word = rtf.slice(i + 1, j);
      let numStr = "";
      if (rtf[j] === "-") {
        numStr = "-";
        j += 1;
      }
      while (j < len && /[0-9]/.test(rtf[j]!)) {
        numStr += rtf[j];
        j += 1;
      }
      // A single trailing space is part of the control word (delimiter).
      if (rtf[j] === " ") j += 1;
      const num = numStr === "" || numStr === "-" ? null : parseInt(numStr, 10);

      applyControlWord(word, num);
      i = j;
      continue;

      function applyControlWord(w: string, n: number | null) {
        if (skipDepth === 0 && SKIP_DESTINATIONS.has(w)) {
          skipDepth += 1;
          skipGroupLevel = depth;
          return;
        }
        switch (w) {
          case "par":
          case "pard": // paragraph reset also breaks the visual line
            if (w === "par") endParagraph();
            else {
              // pard resets formatting to defaults.
              flushRun();
              style = { bold: false, italic: false, underline: false };
            }
            return;
          case "line":
          case "sect":
          case "page":
            endParagraph();
            return;
          case "tab":
            emit("\t");
            return;
          case "uc":
            if (n != null) ucStack[ucStack.length - 1] = n;
            return;
          case "u": {
            if (n == null) return;
            const cp = n < 0 ? n + 0x10000 : n; // signed 16-bit → codepoint
            if (skipDepth === 0) buffer += String.fromCodePoint(cp);
            pendingSkipChars = ucStack[ucStack.length - 1] ?? 1;
            return;
          }
          case "b":
            flushRun();
            style.bold = n !== 0;
            return;
          case "i":
            flushRun();
            style.italic = n !== 0;
            return;
          case "ul":
            flushRun();
            style.underline = true;
            return;
          case "ulnone":
            flushRun();
            style.underline = false;
            return;
          case "plain":
            flushRun();
            style = { bold: false, italic: false, underline: false };
            return;
          default:
            // Unknown control word: ignore (its numeric arg was already consumed).
            return;
        }
      }
    }

    // Literal character. Skip raw CR/LF (RTF uses \par for real breaks).
    if (ch === "\n" || ch === "\r") {
      i += 1;
      continue;
    }
    emit(ch);
    i += 1;
  }

  endParagraph();
  // Drop empty trailing paragraphs.
  while (paragraphs.length > 0 && paragraphs[paragraphs.length - 1]!.runs.length === 0) {
    paragraphs.pop();
  }
  return paragraphs;
}

/** Decode a single byte using the current codepage (cp1252 superset of latin1). */
function decodeByte(code: number): string {
  if (code < 0x80) return String.fromCharCode(code);
  return CP1252[code] ?? String.fromCharCode(code);
}

/**
 * Convert RTF to plain text. Paragraphs are joined with newlines; inline styles
 * are dropped. Empty for non-RTF input.
 */
export function rtfToText(rtf: string): string {
  if (!isRtf(rtf)) return "";
  const paras = parseRtf(rtf);
  return paras
    .map((p) => p.runs.map((r) => r.text).join(""))
    .join("\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/**
 * Convert RTF to sanitised-by-construction HTML: each paragraph becomes a `<p>`,
 * and bold/italic/underline runs are wrapped in `<strong>/<em>/<u>`. All text is
 * HTML-escaped, so the output is safe to inject. Empty for non-RTF input.
 */
export function rtfToHtml(rtf: string): string {
  if (!isRtf(rtf)) return "";
  const paras = parseRtf(rtf);
  const body = paras
    .map((p) => {
      const inner = p.runs
        .map((r) => {
          let html = escapeHtml(r.text).replace(/\t/g, "&emsp;");
          if (r.style.bold) html = `<strong>${html}</strong>`;
          if (r.style.italic) html = `<em>${html}</em>`;
          if (r.style.underline) html = `<u>${html}</u>`;
          return html;
        })
        .join("");
      return `<p>${inner || "&nbsp;"}</p>`;
    })
    .join("\n");
  return body;
}

/** Quick sniff: valid RTF starts with the `{\rtf` magic. */
export function isRtf(input: string): boolean {
  return /^\s*\{\\rtf/.test(input);
}
