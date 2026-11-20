/**
 * Automated touch-target gate (de-ai-ux spec, Rule 2): every interactive
 * element must present a hit area of at least 44x44 CSS px (visual size may be
 * smaller only when padding/overlay extends the hit box - which this measures,
 * since getBoundingClientRect includes padding).
 *
 * Run:  node scripts/qa/check-targets.mjs [baseUrl]
 * Exits 1 on any violation -> wire into the deploy checklist. Uses the
 * standalone playwright installed for the QA program.
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'https://gigai.tools'
const PAGES = process.env.TGT_PAGES
  ? process.env.TGT_PAGES.split(',')
  : ['/', '/image-compressor', '/merge-pdf', '/video-to-work',
     '/category/image-tools', '/for/kindle-ebook-cover-size', '/blog', '/search']
const MIN = 44
// Sanctioned sub-44 elements: inline text links inside prose paragraphs (WCAG
// 2.5.8's inline exception) and hidden/zero-size templates.
const INLINE_OK = new Set(['P', 'LI', 'TD', 'FIGCAPTION', 'BLOCKQUOTE', 'SPAN', 'STRONG', 'EM'])

const b = await chromium.launch()
let bad = 0
for (const path of PAGES) {
  for (const width of [1280, 360]) {
    const page = await (await b.newContext({ viewport: { width, height: 900 } })).newPage()
    await page.goto(BASE + path + '?tgt=' + Date.now(), { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2500)
    const offenders = await page.evaluate(({ MIN, INLINE_OK }) => {
      const out = []
      for (const el of document.querySelectorAll('a, button, input, select, textarea, [role=button], summary')) {
        const r = el.getBoundingClientRect()
        if (r.width <= 2 || r.height <= 2) continue // hidden or clipped (sr-only)
        if (el.className && String(el.className).includes('sr-only')) continue
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue
        if (INLINE_OK.includes(el.parentElement?.tagName ?? '') &&
            getComputedStyle(el).display === 'inline') continue
        if (r.height < MIN - 0.5 || r.width < MIN - 0.5) {
          out.push({
            tag: el.tagName.toLowerCase(),
            text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
            w: Math.round(r.width), h: Math.round(r.height),
          })
        }
      }
      return out.slice(0, 20)
    }, { MIN, INLINE_OK: [...INLINE_OK] })
    if (offenders.length) {
      bad += offenders.length
      console.log(`\nFAIL ${path} @${width}px — ${offenders.length} target(s) under ${MIN}px:`)
      for (const o of offenders) console.log(`  <${o.tag}> ${o.w}x${o.h}  "${o.text}"`)
    } else {
      console.log(`ok   ${path} @${width}px`)
    }
    await page.close()
  }
}
await b.close()
if (bad) { console.log(`\n${bad} violations - the gate FAILS.`); process.exit(1) }
console.log('\nAll targets pass the 44px gate.')
