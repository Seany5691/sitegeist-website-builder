/**
 * Screenshot Capture Script
 * Takes screenshots of built websites for visual review.
 * Uses Playwright if available, falls back to basic HTTP screenshots.
 */

import { promises as fs } from 'fs'
import path from 'path'

interface ScreenshotResult {
  success: boolean
  screenshots: string[]
  errors: string[]
}

const PAGES_TO_CAPTURE = [
  { path: '/', name: 'homepage' },
  { path: '/about', name: 'about' },
  { path: '/services', name: 'services' },
  { path: '/contact', name: 'contact' },
  { path: '/portfolio', name: 'portfolio' },
]

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 375, height: 812, name: 'mobile' },
]

export async function captureScreenshots(
  projectDir: string,
  port: number = 3000
): Promise<ScreenshotResult> {
  const result: ScreenshotResult = { success: true, screenshots: [], errors: [] }

  // Check if Playwright is available
  let playwright: any
  try {
    playwright = await import('playwright')
  } catch {
    result.errors.push('Playwright not available — skipping screenshots')
    result.success = false
    return result
  }

  const screenshotDir = path.join(projectDir, 'screenshots')
  await fs.mkdir(screenshotDir, { recursive: true })

  const browser = await playwright.chromium.launch({ headless: true })

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })
      const page = await context.newPage()

      for (const pageConfig of PAGES_TO_CAPTURE) {
        const url = `http://localhost:${port}${pageConfig.path}`
        const filename = `${pageConfig.name}-${viewport.name}.png`
        const filepath = path.join(screenshotDir, filename)

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
          await page.waitForTimeout(1000) // Wait for animations
          await page.screenshot({ path: filepath, fullPage: true })
          result.screenshots.push(filepath)
        } catch (err) {
          result.errors.push(`Failed to capture ${pageConfig.name} (${viewport.name}): ${err}`)
        }
      }

      await context.close()
    }
  } finally {
    await browser.close()
  }

  return result
}

// Generate HTML report for screenshots
export function generateScreenshotReport(screenshots: string[]): string {
  const grouped: Record<string, string[]> = {}

  for (const screenshot of screenshots) {
    const filename = path.basename(screenshot)
    const pageName = filename.replace(/-(desktop|mobile)\.png$/, '')
    if (!grouped[pageName]) grouped[pageName] = []
    grouped[pageName].push(screenshot)
  }

  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Screenshot Report</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .page { margin-bottom: 3rem; }
    .page h2 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .screenshot { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .screenshot img { width: 100%; height: auto; }
    .screenshot .label { padding: 0.5rem; background: #f9fafb; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Screenshot Report</h1>
`

  for (const [pageName, files] of Object.entries(grouped)) {
    html += `
  <div class="page">
    <h2>${pageName}</h2>
    <div class="screenshots">
`
    for (const file of files) {
      const filename = path.basename(file)
      const viewport = filename.includes('desktop') ? 'Desktop (1440px)' : 'Mobile (375px)'
      html += `
      <div class="screenshot">
        <img src="${filename}" alt="${pageName} ${viewport}" />
        <div class="label">${viewport}</div>
      </div>
`
    }
    html += `
    </div>
  </div>
`
  }

  html += `
</body>
</html>`

  return html
}
