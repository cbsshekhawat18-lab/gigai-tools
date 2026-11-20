import type { Tool } from "@/types";

// ── Live Developer Tools (Phase 3) ────────────────────────────────────────────
// JSON family
import jsonFormatter from "./json-formatter";
import jsonValidator from "./json-validator";
import jsonTreeViewer from "./json-tree-viewer";
import jsonDiff from "./json-diff";
import jsonToTypescript from "./json-to-typescript";
// Markup / data formatters
import xmlFormatter from "./xml-formatter";
import yamlFormatter from "./yaml-formatter";
import sqlFormatter from "./sql-formatter";
import htmlFormatter from "./html-formatter";
import cssBeautifier from "./css-beautifier";
import javascriptBeautifier from "./javascript-beautifier";
// Minifiers
import htmlMinifier from "./html-minifier";
import cssMinifier from "./css-minifier";
import javascriptMinifier from "./javascript-minifier";
// Encoders / decoders
import base64Encoder from "./base64-encoder";
import base64Decoder from "./base64-decoder";
import urlEncoder from "./url-encoder";
import urlDecoder from "./url-decoder";
// Tokens / hashes / ids
import jwtDecoder from "./jwt-decoder";
import hashGenerator from "./hash-generator";
import uuidGenerator from "./uuid-generator";
import nanoidGenerator from "./nanoid-generator";
import passwordGenerator from "./password-generator";
// Utilities
import regexTester from "./regex-tester";
import cronGenerator from "./cron-generator";
import unixTimestampConverter from "./unix-timestamp-converter";
import markdownPreview from "./markdown-preview";
import diffChecker from "./diff-checker";
import barcodeGenerator from "./barcode-generator";
import secretScanner from "./secret-scanner";
import tokenCounter from "./token-counter";
import regexGenerator from "./regex-generator";

/**
 * Live developer tools, in the internal-linking order used across the site.
 * JSON Formatter leads as the flagship; related tools sit next to each other so
 * the cross-links between them stay short and topical.
 */
export const DEV_TOOLS: Tool[] = [
  jsonFormatter,
  jsonValidator,
  jsonTreeViewer,
  jsonDiff,
  jsonToTypescript,
  xmlFormatter,
  yamlFormatter,
  sqlFormatter,
  htmlFormatter,
  cssBeautifier,
  javascriptBeautifier,
  htmlMinifier,
  cssMinifier,
  javascriptMinifier,
  base64Encoder,
  base64Decoder,
  urlEncoder,
  urlDecoder,
  jwtDecoder,
  hashGenerator,
  uuidGenerator,
  nanoidGenerator,
  passwordGenerator,
  regexTester,
  cronGenerator,
  unixTimestampConverter,
  markdownPreview,
  diffChecker,
  barcodeGenerator,
  secretScanner,
  tokenCounter,
  regexGenerator,
];
