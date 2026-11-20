import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT = process.cwd() + "/out"; const PORT = 4601;
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".txt":"text/plain",".woff2":"font/woff2",".xml":"application/xml"};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p.endsWith("/"))p+="index.html";let f=path.join(ROOT,p);
if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){if(fs.existsSync(f+".html"))f=f+".html";else{res.writeHead(404);return res.end("nf");}}
res.writeHead(200,{"Content-Type":MIME[path.extname(f)]??"application/octet-stream"});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(PORT,r));
const browser=await chromium.launch(); const page=await browser.newPage();
// Score OUR OWN pages with OUR OWN citability + chunk tools, via the real UI.
for (const slug of ["geo-audit","ai-crawler-access-checker","retrieval-chunk-preview"]) {
  const html = await (await fetch(`http://localhost:${PORT}/${slug}`)).text();
  await page.goto(`http://localhost:${PORT}/content-citability-scorer`,{waitUntil:"networkidle"});
  const ta=page.locator("textarea").first(); await ta.waitFor({timeout:15000});
  await ta.fill(html); await page.waitForTimeout(2500);
  const body=await page.locator("body").innerText();
  const score=body.match(/(\d+)\s*\/\s*100/);
  const subs=[...body.matchAll(/(Fact density|Source citations|Quotability|Opening answer|Question headings|Self-containment) — (\d+)\/100/g)].map(m=>`${m[1]}=${m[2]}`);
  console.log(`\n=== /${slug} ===`);
  console.log("overall:", score?score[1]:"?", "|", subs.join("  "));
}
// Chunk our own flagship page.
const html = await (await fetch(`http://localhost:${PORT}/geo-audit`)).text();
await page.goto(`http://localhost:${PORT}/retrieval-chunk-preview`,{waitUntil:"networkidle"});
const ta=page.locator("textarea").first(); await ta.waitFor({timeout:15000});
await ta.fill(html); await page.waitForTimeout(2500);
const body=await page.locator("body").innerText();
const v=body.match(/(All \d+ chunks[^.]*\.|\d+ of your \d+ chunks[^.]*\.)/);
console.log("\n=== chunk verdict for /geo-audit ===\n", v?v[1]:"(no verdict found)");
await browser.close(); server.close();
