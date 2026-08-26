/**
 * Export public/resume/resume.html → public/pdfs/updated-resume.pdf
 *
 * Requires Playwright Chromium available, e.g.:
 *   npm install playwright@1.49.1
 *   node scripts/export-resume-pdf.cjs
 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
const http = require('http')

;(async () => {
  const root = path.resolve(__dirname, '..')
  const html = fs.readFileSync(
    path.join(root, 'public/resume/resume.html'),
    'utf8'
  )
  const outPath = path.join(root, 'public/pdfs/updated-resume.pdf')

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready
  })
  await page.waitForTimeout(800)

  await page.pdf({
    path: outPath,
    width: '210mm',
    height: '297mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  })

  await browser.close()
  server.close()
  console.log(`Wrote ${outPath} (${fs.statSync(outPath).size} bytes)`)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
