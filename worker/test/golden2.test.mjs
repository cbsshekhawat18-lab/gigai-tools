/** Golden tests for the second engine batch. Run with: npm test */

import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import sharp from "sharp";

import { EngineError, engines } from "../engines.mjs";

async function fixturePdf(pages, label = "fx") {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    doc.addPage([300, 300]).drawText(`${label} ${i + 1}`, { x: 40, y: 150, size: 18, font });
  }
  return { filename: `${label}.pdf`, size: 0, data: Buffer.from(await doc.save()) };
}

async function fixturePng(w = 80, h = 40) {
  const data = await sharp({
    create: { width: w, height: h, channels: 3, background: { r: 30, g: 90, b: 200 } },
  }).png().toBuffer();
  return { filename: "blue.png", size: data.length, data };
}

const input = (filename, s) => ({ filename, size: s.length, data: Buffer.from(s) });
const dims = async (buf) => {
  const m = await sharp(buf).metadata();
  return `${m.width}x${m.height}`;
};

test("delete-pdf-pages removes the named pages", async () => {
  const [out] = await engines["delete-pdf-pages"]([await fixturePdf(5)], { pages: "2,4" });
  assert.equal((await PDFDocument.load(out.data)).getPageCount(), 3);
});

test("delete-pdf-pages refuses to empty the document", async () => {
  await assert.rejects(
    engines["delete-pdf-pages"]([await fixturePdf(2)], { pages: "1-2" }),
    (e) => e instanceof EngineError && e.code === "invalid_option",
  );
});

test("add-page-numbers keeps page count and grows content", async () => {
  const src = await fixturePdf(3);
  const [out] = await engines["add-page-numbers"]([src], { position: "bottom-right", start: 10 });
  assert.equal((await PDFDocument.load(out.data)).getPageCount(), 3);
  assert.ok(out.data.length > src.data.length);
});

test("watermark-pdf stamps every page", async () => {
  const [out] = await engines["watermark-pdf"]([await fixturePdf(2)], { text: "DRAFT" });
  assert.equal((await PDFDocument.load(out.data)).getPageCount(), 2);
});

test("pdf-metadata sets and strips", async () => {
  const [out] = await engines["pdf-metadata"]([await fixturePdf(1)], { title: "Golden", author: "GigAI" });
  const doc = await PDFDocument.load(out.data, { updateMetadata: false });
  assert.equal(doc.getTitle(), "Golden");
  const [stripped] = await engines["pdf-metadata"]([{ ...out, filename: "x.pdf" }], { strip: true });
  const doc2 = await PDFDocument.load(stripped.data, { updateMetadata: false });
  assert.ok(!doc2.getTitle());
});

test("image-to-pdf makes one page per image", async () => {
  const [out] = await engines["image-to-pdf"]([await fixturePng(), await fixturePng(50, 50)], {});
  assert.equal((await PDFDocument.load(out.data)).getPageCount(), 2);
});

test("pdf-to-jpg renders pages to real images", async () => {
  const outs = await engines["pdf-to-jpg"]([await fixturePdf(3)], { pages: "1,3", scale: 1 });
  assert.equal(outs.length, 2);
  assert.equal(outs[0].filename, "page-1.jpg");
  const meta = await sharp(outs[0].data).metadata();
  assert.equal(meta.format, "jpeg");
  assert.equal(meta.width, 300);
});

test("crop-image cuts the exact box", async () => {
  const [out] = await engines["crop-image"]([await fixturePng(80, 40)], { left: 10, top: 5, width: 20, height: 30 });
  assert.equal(await dims(out.data), "20x30");
});

test("crop-image rejects an out-of-bounds box", async () => {
  await assert.rejects(
    engines["crop-image"]([await fixturePng(80, 40)], { width: 200, height: 10 }),
    (e) => e instanceof EngineError && e.code === "invalid_option",
  );
});

test("rotate-image 90 swaps dimensions", async () => {
  const [out] = await engines["rotate-image"]([await fixturePng(80, 40)], { angle: 90 });
  assert.equal(await dims(out.data), "40x80");
});

test("flip-image keeps dimensions", async () => {
  const [out] = await engines["flip-image"]([await fixturePng(80, 40)], { direction: "vertical" });
  assert.equal(await dims(out.data), "80x40");
});

test("grayscale-image desaturates", async () => {
  const [out] = await engines["grayscale-image"]([await fixturePng()]);
  const { dominant } = await sharp(out.data).stats();
  assert.ok(Math.abs(dominant.r - dominant.b) < 8, `still colorful: ${JSON.stringify(dominant)}`);
});

test("blur-image produces a valid image", async () => {
  const [out] = await engines["blur-image"]([await fixturePng()], { sigma: 3 });
  assert.equal(await dims(out.data), "80x40");
});

test("strip-image-metadata drops EXIF", async () => {
  const withExif = await sharp((await fixturePng()).data)
    .withMetadata({ exif: { IFD0: { Copyright: "secret holder" } } })
    .jpeg().toBuffer();
  assert.ok((await sharp(withExif).metadata()).exif, "fixture should carry exif");
  const [out] = await engines["strip-image-metadata"]([input("photo.jpg", withExif)]);
  assert.ok(!(await sharp(out.data).metadata()).exif, "exif survived");
});

test("svg-to-png rasterizes at the asked width", async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50" fill="red"/></svg>`;
  const [out] = await engines["svg-to-png"]([input("box.svg", svg)], { width: 200 });
  assert.equal(await dims(out.data), "200x100");
});

test("json-to-yaml and back", async () => {
  const [y] = await engines["json-to-yaml"]([input("d.json", '{"name":"gigai","tags":["a","b"]}')], {});
  assert.match(y.data.toString(), /name: gigai/);
  const [j] = await engines["yaml-to-json"]([input("d.yaml", y.data.toString())], {});
  assert.deepEqual(JSON.parse(j.data.toString()), { name: "gigai", tags: ["a", "b"] });
});

test("csv-to-json types numbers", async () => {
  const [out] = await engines["csv-to-json"]([input("t.csv", "name,count\nalpha,3\nbeta,5")], {});
  assert.deepEqual(JSON.parse(out.data.toString()), [
    { name: "alpha", count: 3 }, { name: "beta", count: 5 },
  ]);
});

test("json-to-csv flattens and delimits", async () => {
  const [out] = await engines["json-to-csv"](
    [input("t.json", '[{"a":1,"b":{"x":2}},{"a":3,"b":null}]')], { delimiter: ";" });
  const text = out.data.toString();
  assert.match(text, /^a;b/);
  assert.match(text, /"{""x"":2}"/);
});

test("format-json minifies at indent 0", async () => {
  const [out] = await engines["format-json"]([input("d.json", '{ "a" : 1 }')], { indent: 0 });
  assert.equal(out.data.toString(), '{"a":1}');
});

test("format-json reports the parse error honestly", async () => {
  await assert.rejects(
    engines["format-json"]([input("bad.json", "{nope")], {}),
    (e) => e instanceof EngineError && e.code === "invalid_input",
  );
});

test("minify-css shrinks", async () => {
  const css = "body {  color: #ff0000;  margin: 0px; }\n/* comment */";
  const [out] = await engines["minify-css"]([input("s.css", css)], {});
  assert.ok(out.data.length < css.length);
  assert.match(out.data.toString(), /color:red/);
});

test("minify-js shrinks and stays valid", async () => {
  const js = "function add (a, b) {\n  // sum\n  return a + b;\n}\nconsole.log(add(1, 2));";
  const [out] = await engines["minify-js"]([input("s.js", js)], {});
  assert.ok(out.data.length < js.length);
  assert.match(out.data.toString(), /function/);
});

test("minify-html collapses whitespace", async () => {
  const html = "<html>\n  <body>\n    <p>  hello  </p>\n  </body>\n</html>";
  const [out] = await engines["minify-html"]([input("p.html", html)], {});
  assert.ok(out.data.length < html.length);
});

test("html-to-markdown converts headings and emphasis", async () => {
  const [out] = await engines["html-to-markdown"](
    [input("p.html", "<h1>Title</h1><p>Some <em>emphasis</em>.</p>")], {});
  const md = out.data.toString();
  assert.match(md, /# Title/);
  assert.match(md, /_emphasis_|\*emphasis\*/);
});

test("convert-subtitles srt -> vtt -> srt round trip", async () => {
  const srt = "1\n00:00:01,000 --> 00:00:03,500\nHello there\n\n2\n00:00:04,000 --> 00:00:06,000\nSecond line\n";
  const [vtt] = await engines["convert-subtitles"]([input("s.srt", srt)], { format: "vtt" });
  const vttText = vtt.data.toString();
  assert.match(vttText, /^WEBVTT/);
  assert.match(vttText, /00:00:01\.000 --> 00:00:03\.500/);
  const [back] = await engines["convert-subtitles"]([input("s.vtt", vttText)], { format: "srt" });
  assert.match(back.data.toString(), /00:00:01,000 --> 00:00:03,500/);
  assert.match(back.data.toString(), /Second line/);
});

test("detect-pii finds and masks, never echoes raw values", async () => {
  const text = "Customer PAN: ABCPE1234F, phone +91 98765 43210, note: nothing else.";
  const [out] = await engines["detect-pii"]([input("customers.txt", text)], {});
  const report = JSON.parse(out.data.toString());
  assert.ok(report.summary.total >= 2, `found ${report.summary.total}`);
  const types = report.findings.map((f) => f.type);
  assert.ok(types.includes("pan"), types.join(","));
  assert.ok(!out.data.toString().includes("ABCPE1234F"), "raw PAN leaked into report");
  const pan = report.findings.find((f) => f.type === "pan");
  assert.ok(pan.masked.length > 0 && pan.masked !== "ABCPE1234F");
});

test("detect-pii rejects unknown types cleanly", async () => {
  await assert.rejects(
    engines["detect-pii"]([input("t.txt", "x")], { types: "pan,not-a-type" }),
    (e) => e instanceof EngineError && e.code === "invalid_option",
  );
});

test("redact-pii masks in place", async () => {
  const text = "PAN: ABCPE1234F stays private.";
  const [out] = await engines["redact-pii"]([input("note.txt", text)], {});
  const red = out.data.toString();
  assert.ok(!red.includes("ABCPE1234F"), "raw PAN survived redaction");
  assert.match(red, /stays private/);
});
