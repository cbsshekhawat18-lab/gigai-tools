/**
 * Golden tests for every engine in engines.mjs - run with: npm test
 * Each test asserts on real output properties (page counts, pixel sizes,
 * magic bytes, decoded QR payloads), not just "it didn't throw".
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import jsQR from "jsqr";
import sharp from "sharp";

import { EngineError, checkInputFormat, engines } from "../engines.mjs";

async function fixturePdf(pages, label) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([300, 300]);
    page.drawText(`${label} page ${i + 1}`, { x: 40, y: 150, size: 18, font });
  }
  return { filename: `${label}.pdf`, size: 0, data: Buffer.from(await doc.save()) };
}

async function fixturePng(w = 100, h = 50) {
  const data = await sharp({
    create: { width: w, height: h, channels: 3, background: { r: 200, g: 40, b: 40 } },
  }).png().toBuffer();
  return { filename: "red.png", size: data.length, data };
}

const input = (filename, data) => ({ filename, size: data.length, data: Buffer.from(data) });

test("merge-pdf combines page counts", async () => {
  const [a, b] = [await fixturePdf(1, "A"), await fixturePdf(2, "B")];
  const [out] = await engines["merge-pdf"]([a, b]);
  assert.equal((await PDFDocument.load(out.data)).getPageCount(), 3);
});

test("merge-pdf rejects a non-PDF cleanly", async () => {
  await assert.rejects(
    engines["merge-pdf"]([input("x.pdf", "not a pdf"), await fixturePdf(1, "A")]),
    (e) => e instanceof EngineError && e.code === "invalid_input",
  );
});

test("split-pdf extracts the named pages", async () => {
  const src = await fixturePdf(5, "S");
  const [out] = await engines["split-pdf"]([src], { pages: "1-2,5" });
  assert.equal((await PDFDocument.load(out.data)).getPageCount(), 3);
});

test("split-pdf rejects out-of-range pages", async () => {
  await assert.rejects(
    engines["split-pdf"]([await fixturePdf(2, "S")], { pages: "3" }),
    (e) => e instanceof EngineError && e.code === "invalid_option",
  );
});

test("rotate-pdf sets page rotation", async () => {
  const [out] = await engines["rotate-pdf"]([await fixturePdf(2, "R")], { angle: 90 });
  const doc = await PDFDocument.load(out.data);
  assert.equal(doc.getPage(0).getRotation().angle, 90);
  assert.equal(doc.getPage(1).getRotation().angle, 90);
});

test("pdf-to-text extracts the text layer", async () => {
  const [out] = await engines["pdf-to-text"]([await fixturePdf(2, "hello-golden")]);
  const text = out.data.toString("utf8");
  assert.match(text, /hello-golden page 1/);
  assert.match(text, /hello-golden page 2/);
});

test("convert-image png -> webp", async () => {
  const [out] = await engines["convert-image"]([await fixturePng()], { format: "webp" });
  assert.equal(out.data.subarray(8, 12).toString(), "WEBP");
  assert.equal((await sharp(out.data).metadata()).format, "webp");
});

test("resize-image keeps aspect with fit inside", async () => {
  const [out] = await engines["resize-image"]([await fixturePng(100, 50)], { width: 40 });
  const meta = await sharp(out.data).metadata();
  assert.equal(meta.width, 40);
  assert.equal(meta.height, 20);
});

test("resize-image without dimensions is a clean error", async () => {
  await assert.rejects(
    engines["resize-image"]([await fixturePng()], {}),
    (e) => e instanceof EngineError && e.code === "invalid_option",
  );
});

test("compress-image hits target_kb", async () => {
  // Random noise compresses badly - a real test of the search.
  const raw = Buffer.alloc(300 * 300 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.floor(Math.random() * 256);
  const png = await sharp(raw, { raw: { width: 300, height: 300, channels: 3 } }).png().toBuffer();
  const [out] = await engines["compress-image"]([input("noise.png", png)], { target_kb: 30 });
  assert.ok(out.data.length <= 30 * 1024, `got ${out.data.length} bytes`);
  assert.ok(out.data.length > 0);
});

test("compress-image reports an impossible target honestly", async () => {
  const raw = Buffer.alloc(400 * 400 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.floor(Math.random() * 256);
  const png = await sharp(raw, { raw: { width: 400, height: 400, channels: 3 } }).png().toBuffer();
  await assert.rejects(
    engines["compress-image"]([input("noise.png", png)], { target_kb: 1 }),
    (e) => e instanceof EngineError && e.code === "target_unreachable",
  );
});

test("optimize-svg shrinks and stays an svg", async () => {
  const fat = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <!-- a comment to strip -->
    <rect x="10.000001" y="10.000001" width="50.123456" height="50.654321" fill="#ff0000"/>
  </svg>`;
  const [out] = await engines["optimize-svg"]([input("icon.svg", fat)], {});
  assert.ok(out.data.length < fat.length);
  assert.match(out.data.toString(), /^<svg/);
});

test("markdown-to-html renders headings", async () => {
  const [out] = await engines["markdown-to-html"]([input("doc.md", "# Title\n\nBody *em*.")], {});
  const html = out.data.toString();
  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<em>em<\/em>/);
  assert.match(html, /<meta charset="utf-8">/);
});

test("generate-qr png decodes back to the payload", async () => {
  const [out] = await engines["generate-qr"]([], { text: "https://gigai.tools/x", size: 256 });
  const { data, info } = await sharp(out.data).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  assert.ok(decoded, "jsQR could not read the generated code");
  assert.equal(decoded.data, "https://gigai.tools/x");
});

test("generate-qr svg output", async () => {
  const [out] = await engines["generate-qr"]([], { text: "hello", format: "svg" });
  assert.match(out.data.toString(), /<svg/);
});

test("checkInputFormat sniffs magic bytes not extensions", async () => {
  const png = await fixturePng();
  assert.doesNotThrow(() => checkInputFormat(png, ["png", "jpg"]));
  assert.throws(
    () => checkInputFormat(input("fake.png", "plain text"), ["png"]),
    (e) => e instanceof EngineError && e.code === "invalid_input",
  );
});
