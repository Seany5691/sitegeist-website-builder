/**
 * LLM-as-Judge Scoring
 * Uses MiMo API directly to evaluate website visual quality after build.
 * Implements hard floor (< 6.5 = auto re-roll, max 2 attempts) and soft band (6.5-7.5 = review).
 * Includes detailed logging and bias detection.
 */

import { promises as fs } from 'fs'
import path from 'path'

export interface JudgeResult {
  score: number
  breakdown: {
    visualHierarchy: number
    whitespace: number
    contrast: number
    imageQuality: number
    uniqueness: number
    overall: number
  }
  feedback: string
  recommendation: 'pass' | 'review' | 'reroll'
  attempt: number
  lowDimensions: string[]  // Dimensions scoring below 6
}

// Bias tracking — stores scores by archetype for pattern detection
interface BiasTracker {
  [archetype: string]: {
    count: number
    avgScores: {
      visualHierarchy: number
      whitespace: number
      contrast: number
      imageQuality: number
      uniqueness: number
    }
    lowDimensionCounts: {
      visualHierarchy: number
      whitespace: number
      contrast: number
      imageQuality: number
      uniqueness: number
    }
  }
}

const biasTracker: BiasTracker = {}

export interface JudgeConfig {
  projectDir: string
  businessName: string
  archetype: string
  maxAttempts: number
  hardFloor: number      // Score below this = auto re-roll
  softBandLow: number    // Score in soft band = optional human review
  softBandHigh: number
}

const DEFAULT_CONFIG: Partial<JudgeConfig> = {
  maxAttempts: 2,
  hardFloor: 6.5,
  softBandLow: 6.5,
  softBandHigh: 7.5,
}

const SCORING_RUBRIC = `You are a professional web design critic. Evaluate this website on 5 dimensions, each scored 1-10:

1. VISUAL HIERARCHY (1-10)
- Is the eye drawn to the most important elements first?
- Are headings clearly distinguished from body text?
- Is there a clear visual flow from hero → services → gallery → CTA?

2. WHITESPACE & SPACING (1-10)
- Is there enough breathing room between sections?
- Does the layout feel balanced, not cramped or empty?
- Are gaps consistent and intentional?

3. CONTRAST & READABILITY (1-10)
- Is text readable against backgrounds?
- Do CTAs stand out from surrounding content?
- Is there sufficient color contrast for accessibility?

4. IMAGE QUALITY & TREATMENT (1-10)
- Are images high-resolution and relevant?
- Do they feel cohesive (similar treatment, filters, sizing)?
- Are hero images impactful and gallery images well-organized?

5. UNIQUENESS & BRAND FIT (1-10)
- Does this feel like a custom design, not a generic template?
- Does the visual style match the industry archetype?
- Would a client be impressed showing this to their customers?

RESPOND IN THIS EXACT JSON FORMAT (no other text):
{
  "visualHierarchy": <score>,
  "whitespace": <score>,
  "contrast": <score>,
  "imageQuality": <score>,
  "uniqueness": <score>,
  "overall": <weighted average>,
  "feedback": "<2-3 sentences of specific, actionable feedback>"
}`

export async function judgeWebsite(config: JudgeConfig): Promise<JudgeResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  const { projectDir, businessName, archetype, hardFloor, softBandLow, softBandHigh } = fullConfig

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[LLM Judge] Evaluating: ${businessName} (${archetype})`)
  console.log(`${'='.repeat(60)}`)

  // Take screenshots first
  const screenshots = await captureScreenshots(projectDir)

  if (screenshots.length === 0) {
    console.log(`[LLM Judge] No screenshots captured — skipping visual scoring`)
    return {
      score: 0,
      breakdown: { visualHierarchy: 0, whitespace: 0, contrast: 0, imageQuality: 0, uniqueness: 0, overall: 0 },
      feedback: 'Could not capture screenshots — Playwright may not be available',
      recommendation: 'pass',
      attempt: 1,
      lowDimensions: [],
    }
  }

  console.log(`[LLM Judge] Captured ${screenshots.length} screenshots: ${screenshots.map(s => path.basename(s)).join(', ')}`)

  // Build the judge prompt
  const judgePrompt = buildJudgePrompt(businessName, archetype, screenshots)

  // Call MiMo CLI for scoring
  const scoreResult = await callMiMoJudge(judgePrompt, projectDir)

  if (!scoreResult) {
    console.log(`[LLM Judge] MiMo call failed — skipping visual scoring`)
    return {
      score: 0,
      breakdown: { visualHierarchy: 0, whitespace: 0, contrast: 0, imageQuality: 0, uniqueness: 0, overall: 0 },
      feedback: 'LLM judge call failed — skipping visual scoring',
      recommendation: 'pass',
      attempt: 1,
      lowDimensions: [],
    }
  }

  // Identify low-scoring dimensions (below 6)
  const lowDimensions: string[] = []
  const dimensionNames = ['visualHierarchy', 'whitespace', 'contrast', 'imageQuality', 'uniqueness'] as const
  for (const dim of dimensionNames) {
    if (scoreResult[dim] < 6) {
      lowDimensions.push(`${dim}: ${scoreResult[dim]}/10`)
    }
  }

  // Determine recommendation
  let recommendation: 'pass' | 'review' | 'reroll' = 'pass'
  if (scoreResult.overall < hardFloor) {
    recommendation = 'reroll'
  } else if (scoreResult.overall >= softBandLow && scoreResult.overall < softBandHigh) {
    recommendation = 'review'
  }

  // Log detailed results
  console.log(`\n[LLM Judge] SCORE BREAKDOWN:`)
  console.log(`  Visual Hierarchy:  ${scoreResult.visualHierarchy}/10 ${scoreResult.visualHierarchy < 6 ? '⚠️  LOW' : ''}`)
  console.log(`  Whitespace:        ${scoreResult.whitespace}/10 ${scoreResult.whitespace < 6 ? '⚠️  LOW' : ''}`)
  console.log(`  Contrast:          ${scoreResult.contrast}/10 ${scoreResult.contrast < 6 ? '⚠️  LOW' : ''}`)
  console.log(`  Image Quality:     ${scoreResult.imageQuality}/10 ${scoreResult.imageQuality < 6 ? '⚠️  LOW' : ''}`)
  console.log(`  Uniqueness:        ${scoreResult.uniqueness}/10 ${scoreResult.uniqueness < 6 ? '⚠️  LOW' : ''}`)
  console.log(`  ─────────────────────────────`)
  console.log(`  OVERALL:           ${scoreResult.overall}/10`)
  console.log(`\n[LLM Judge] RECOMMENDATION: ${recommendation.toUpperCase()}`)
  console.log(`[LLM Judge] FEEDBACK: ${scoreResult.feedback}`)

  if (lowDimensions.length > 0) {
    console.log(`\n[LLM Judge] LOW DIMENSIONS (below 6):`)
    for (const dim of lowDimensions) {
      console.log(`  • ${dim}`)
    }
  }

  // Track bias by archetype
  trackBias(archetype, scoreResult)

  return {
    score: scoreResult.overall,
    breakdown: {
      visualHierarchy: scoreResult.visualHierarchy,
      whitespace: scoreResult.whitespace,
      contrast: scoreResult.contrast,
      imageQuality: scoreResult.imageQuality,
      uniqueness: scoreResult.uniqueness,
      overall: scoreResult.overall,
    },
    feedback: scoreResult.feedback,
    recommendation,
    attempt: 1,
    lowDimensions,
  }
}

// Track scores by archetype to detect bias
function trackBias(archetype: string, scores: any) {
  if (!biasTracker[archetype]) {
    biasTracker[archetype] = {
      count: 0,
      avgScores: { visualHierarchy: 0, whitespace: 0, contrast: 0, imageQuality: 0, uniqueness: 0 },
      lowDimensionCounts: { visualHierarchy: 0, whitespace: 0, contrast: 0, imageQuality: 0, uniqueness: 0 },
    }
  }

  const tracker = biasTracker[archetype]
  tracker.count++

  // Update running averages
  const dimensionNames = ['visualHierarchy', 'whitespace', 'contrast', 'imageQuality', 'uniqueness'] as const
  for (const dim of dimensionNames) {
    tracker.avgScores[dim] = ((tracker.avgScores[dim] * (tracker.count - 1)) + scores[dim]) / tracker.count
    if (scores[dim] < 6) {
      tracker.lowDimensionCounts[dim]++
    }
  }

  // Log bias warning if pattern detected
  if (tracker.count >= 3) {
    console.log(`\n[LLM Judge] BIAS CHECK (${archetype}, n=${tracker.count}):`)
    for (const dim of dimensionNames) {
      const avg = tracker.avgScores[dim].toFixed(1)
      const lowPct = ((tracker.lowDimensionCounts[dim] / tracker.count) * 100).toFixed(0)
      if (tracker.lowDimensionCounts[dim] / tracker.count > 0.5) {
        console.log(`  ⚠️  ${dim}: avg=${avg}, ${lowPct}% below 6 — possible rubric bias for ${archetype}`)
      }
    }
  }
}

// Export bias report for analysis
export function getBiasReport(): string {
  const lines: string[] = ['LLM Judge Bias Report', '']

  for (const [archetype, data] of Object.entries(biasTracker)) {
    lines.push(`${archetype} (n=${data.count}):`)
    const dimensionNames = ['visualHierarchy', 'whitespace', 'contrast', 'imageQuality', 'uniqueness'] as const
    for (const dim of dimensionNames) {
      const avg = data.avgScores[dim].toFixed(1)
      const lowPct = ((data.lowDimensionCounts[dim] / data.count) * 100).toFixed(0)
      lines.push(`  ${dim}: avg=${avg}, ${lowPct}% below 6`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function buildJudgePrompt(businessName: string, archetype: string, screenshots: string[]): string {
  const screenshotList = screenshots.map((s, i) => `Screenshot ${i + 1}: ${path.basename(s)}`).join('\n')

  return `Evaluate the website for "${businessName}" (${archetype} archetype).

Screenshots captured:
${screenshotList}

${SCORING_RUBRIC}`
}

async function callMiMoJudge(prompt: string, projectDir: string): Promise<any> {
  const MIMO_API_URL = 'https://token-plan-sgp.xiaomimimo.com/v1/chat/completions'
  const MIMO_API_KEY = 'tp-s5mjmff9x4qh31pudzb4k45ipyprkgxvmgeyhidxqo28ljg3'
  const MIMO_MODEL = 'mimo-v2.5'

  try {
    console.log(`[LLM Judge] Calling MiMo API directly (model: ${MIMO_MODEL})`)

    const response = await fetch(MIMO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: 'system', content: 'You are a professional web design critic. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`[LLM Judge] MiMo API error: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    console.log(`[LLM Judge] MiMo response received (${content.length} chars)`)

    // Parse JSON from the response
    const result = parseJudgeResponse(content)
    return result
  } catch (err) {
    console.warn(`[LLM Judge] MiMo API call failed: ${err}`)
    return null
  }
}

function parseJudgeResponse(output: string): any {
  // Try to find JSON in the output
  const jsonMatch = output.match(/\{[\s\S]*"visualHierarchy"[\s\S]*\}/)
  if (!jsonMatch) {
    console.warn('[LLM Judge] Could not find JSON in MiMo output')
    return null
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    const required = ['visualHierarchy', 'whitespace', 'contrast', 'imageQuality', 'uniqueness', 'overall']
    for (const field of required) {
      if (typeof parsed[field] !== 'number') {
        console.warn(`[LLM Judge] Missing or invalid field: ${field}`)
        return null
      }
    }

    // Clamp scores to 1-10
    for (const field of required) {
      parsed[field] = Math.max(1, Math.min(10, parsed[field]))
    }

    // Ensure feedback exists
    if (!parsed.feedback) {
      parsed.feedback = 'No specific feedback provided'
    }

    return parsed
  } catch (err) {
    console.warn(`[LLM Judge] Failed to parse JSON: ${err}`)
    return null
  }
}

async function captureScreenshots(projectDir: string): Promise<string[]> {
  const screenshotDir = path.join(projectDir, 'screenshots')
  await fs.mkdir(screenshotDir, { recursive: true })

  // Try to use Playwright
  let playwright: any
  try {
    playwright = await import('playwright')
  } catch {
    console.warn('[LLM Judge] Playwright not available — skipping screenshot capture')
    return []
  }

  // Find a random available port (between 49152-65535 to avoid conflicts)
  const port = 49152 + Math.floor(Math.random() * (65535 - 49152))
  console.log(`[LLM Judge] Starting built website on port ${port}...`)

  // Start the built website's dev server
  const { spawn } = await import('child_process')
  let serverProcess: any = null

  try {
    serverProcess = spawn('npx', ['next', 'start', '-p', String(port)], {
      cwd: projectDir,
      stdio: 'pipe',
      shell: true,
    })

    // Wait for the server to be ready (poll until it responds)
    const maxWait = 30000
    const startTime = Date.now()
    let ready = false

    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch(`http://localhost:${port}`)
        if (response.ok || response.status === 404) {
          ready = true
          break
        }
      } catch {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (!ready) {
      console.warn('[LLM Judge] Built website server did not start in time — skipping screenshots')
      return []
    }

    console.log(`[LLM Judge] Built website ready on port ${port}`)

    const screenshots: string[] = []
    const browser = await playwright.chromium.launch({ headless: true })

    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      })
      const page = await context.newPage()

      // Capture key pages
      const pages = [
        { path: '/', name: 'homepage' },
        { path: '/about', name: 'about' },
        { path: '/services', name: 'services' },
        { path: '/portfolio', name: 'portfolio' },
        { path: '/contact', name: 'contact' },
      ]

      for (const pageConfig of pages) {
        const url = `http://localhost:${port}${pageConfig.path}`
        const filepath = path.join(screenshotDir, `${pageConfig.name}-judge.png`)

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
          await page.waitForTimeout(500)

          // Scroll through the entire page to trigger scroll animations
          const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
          const viewportHeight = 900
          let currentScroll = 0
          while (currentScroll < scrollHeight) {
            currentScroll += viewportHeight * 0.7
            await page.evaluate((y) => window.scrollTo(0, y), currentScroll)
            await page.waitForTimeout(200)
          }
          // Scroll back to top for the screenshot
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.waitForTimeout(300)

          // Now take full-page screenshot with all animations triggered
          await page.screenshot({ path: filepath, fullPage: true })
          screenshots.push(filepath)
        } catch {
          // Page may not be available (404, etc.)
        }
      }

      await context.close()
    } finally {
      await browser.close()
    }

    return screenshots
  } finally {
    // Always shut down the dev server
    if (serverProcess) {
      serverProcess.kill()
      console.log('[LLM Judge] Built website server stopped')
    }
  }
}

// Re-roll logic: if score < hardFloor, rebuild with new design seed
export async function judgeWithReroll(
  baseConfig: JudgeConfig,
  rebuildFn: (newSeedId: string) => Promise<void>
): Promise<JudgeResult> {
  const maxAttempts = baseConfig.maxAttempts || 2
  let lastResult: JudgeResult | null = null

  console.log(`\n${'#'.repeat(60)}`)
  console.log(`[LLM Judge] Starting evaluation with re-roll (max ${maxAttempts} attempts)`)
  console.log(`[LLM Judge] Hard floor: ${baseConfig.hardFloor || 6.5} | Soft band: ${baseConfig.softBandLow || 6.5}-${baseConfig.softBandHigh || 7.5}`)
  console.log(`${'#'.repeat(60)}`)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n[LLM Judge] ── Attempt ${attempt}/${maxAttempts} ──`)

    const result = await judgeWebsite({ ...baseConfig })
    result.attempt = attempt
    lastResult = result

    if (result.recommendation !== 'reroll') {
      console.log(`\n[LLM Judge] ✓ Score ${result.score}/10 is acceptable — ${result.recommendation}`)
      return result
    }

    if (attempt < maxAttempts) {
      console.log(`\n[LLM Judge] ✗ Score ${result.score}/10 below ${baseConfig.hardFloor || 6.5} — re-rolling`)
      if (result.lowDimensions.length > 0) {
        console.log(`[LLM Judge] Focus areas for improvement: ${result.lowDimensions.join(', ')}`)
      }
      const newSeedId = `${baseConfig.businessName}-reroll-${attempt}`
      console.log(`[LLM Judge] New design seed: ${newSeedId}`)
      await rebuildFn(newSeedId)
    }
  }

  // All attempts exhausted
  console.log(`\n[LLM Judge] Max attempts reached — final score: ${lastResult?.score}/10`)
  if (lastResult?.lowDimensions.length) {
    console.log(`[LLM Judge] Persistent issues: ${lastResult.lowDimensions.join(', ')}`)
  }
  return lastResult!
}
