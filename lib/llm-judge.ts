/**
 * LLM-as-Judge Scoring — Design Brain loop, rubric v1
 *
 * Scores every enabled page, section, feature state, and viewport.
 * Returns per-dimension FIX LISTS (executable by MiMo), not vague feedback.
 *
 * Design score is the GATE. Image authenticity (stock photos) NEVER blocks it.
 * Uniqueness is tracked separately and always climbs.
 *
 * See DESIGN-BRAIN.md for rules, stages, and the fix-log format.
 */

import { promises as fs } from 'fs'
import path from 'path'

export const JUDGE_RUBRIC_VERSION = 'v1'
export const JUDGE_STAGE = 1

export interface JudgeFix {
  /** File to edit, e.g. components/Hero.tsx */
  file: string
  /** What is wrong */
  issue: string
  /** Exact change to make */
  change: string
  /** Which dimension this moves */
  dimension: string
  impact: 'high' | 'medium' | 'low'
}

export interface JudgeBreakdown {
  visualHierarchy: number
  whitespace: number
  contrast: number
  layoutCraft: number
  states: number
  consistency: number
  responsive: number
  a11y: number
  imageQuality: number
  imageAuthenticity: number
  distinctiveness: number
  brandFit: number
  memorability: number
}

export interface JudgeCoverage {
  pagesJudged: string[]
  sectionsJudged: string[]
  featuresJudged: string[]
  viewports: string[]
  /** Anything enabled but NOT judged — must be empty for a valid run */
  missing: string[]
}

export interface JudgeResult {
  /** Design score — the gate. Excludes image authenticity. */
  score: number
  /** Full weighted score including images */
  rawScore: number
  breakdown: JudgeBreakdown
  /** Executable fixes to reach 8.5+, highest impact first */
  priorityFixes: JudgeFix[]
  /** Uniqueness ideas — never blocked by stock images */
  uniquenessSuggestions: string[]
  /** Checklist to reach the current stage target */
  targetChecklist: string[]
  feedback: string
  recommendation: 'pass' | 'review' | 'fix' | 'reroll'
  attempt: number
  lowDimensions: string[]
  coverage: JudgeCoverage
  stockImageNotes: string[]
  rubricVersion: string
  stage: number
}

export interface JudgeConfig {
  projectDir: string
  businessName: string
  archetype: string
  /** Brand personality for uniqueness scoring: warm/premium/urgent/family/technical */
  brandPersonality?: string
  maxAttempts?: number
  /** Stage target — default 8.5 */
  targetScore?: number
  hardFloor?: number
}

// ── Rubric v1 ────────────────────────────────────────────────────────────────
// Design dimensions ARE the gate. Image authenticity is informational only.

const SCORING_RUBRIC = `You are a world-class web design critic and art director.
Evaluate this website like you would review work from a top design agency.
The bar is: "this should look like it cost R100,000 to build."

Score each dimension 1-10.

=== DESIGN DIMENSIONS (these are the quality gate) ===

1. visualHierarchy — Is the eye drawn to what matters? Clear heading scale? Hero → services → CTA flow?
2. whitespace — Breathing room, vertical rhythm, balance. Premium sites are generous with space.
3. contrast — Text readable? CTAs pop? Meets WCAG AA? Premium = confident contrast.
4. layoutCraft — Grid, alignment, component consistency, card quality, spacing tokens.
5. states — Hover/focus/error/success/empty handled? Forms feel finished?
6. consistency — Same type, color, spacing, card style on EVERY page. Not just homepage.
7. responsive — Would this work at 390px, 768px, 1440px? Type overflow? Tap targets?
8. a11y — Labels on all inputs, aria on icon buttons, keyboard nav, alt text, focus visible.

=== IMAGE DIMENSIONS (NOT part of the gate) ===

9. imageQuality — Resolution, crop, cohesion, relevance. (Stock photos may be generic — score them but know they will be replaced.)
10. imageAuthenticity — 1-3 if stock/Unsplash. 8-10 if real business photos. LOW IS ACCEPTABLE.

=== UNIQUENESS DIMENSIONS (tracked separately) ===

11. distinctiveness — Custom design or obvious template? 10 = unforgettable, 1 = generic.
12. brandFit — Does it match THIS business personality? (e.g. emergency plumber ≠ luxury spa)
13. memorability — One visual moment you remember after closing the tab.

=== STOCK IMAGE RULE ===
Stock/Unsplash photos are EXPECTED at this stage. They will be replaced with client photos later.
NEVER let imageAuthenticity drag down the design gate. Report it in stockImageNotes, not as a blocker.

=== OUTPUT FORMAT (MARKDOWN — use this EXACT structure) ===

## SCORES
visualHierarchy: <1-10>
whitespace: <1-10>
contrast: <1-10>
layoutCraft: <1-10>
states: <1-10>
consistency: <1-10>
responsive: <1-10>
a11y: <1-10>
imageQuality: <1-10>
imageAuthenticity: <1-10>
distinctiveness: <1-10>
brandFit: <1-10>
memorability: <1-10>
overall: <weighted average of dims 1-8>

## FEEDBACK
3-4 sentences on what is strong and what holds this site back.

## PRIORITY FIXES
1. [high] components/Hero.tsx
ISSUE: CTA button has weak contrast against the hero overlay
CHANGE: Change button to accent orange with white 700-weight text, add shadow, ensure 4.5:1 contrast

2. [medium] app/globals.css
ISSUE: Section padding is uneven between sections
CHANGE: Set .section-padding to consistent 96px desktop / 64px mobile

(list 3-8 fixes, highest impact first)

## TARGET CHECKLIST
- All CTA buttons pass 4.5:1 contrast
- Form has persistent labels and error states
(list concrete items to reach 8.5+)

## UNIQUENESS
- Use a copper-pipe SVG motif that runs down the page connecting sections
- Add a thermal-imaging before/after slider in the hero
(specific visual ideas for THIS trade)

## STOCK IMAGE NOTES
- Replace generic technician stock with real job photos
(where stock images are and what real photos to use instead)

RULES:
- impact is one of: high, medium, low
- Be SPECIFIC. Name the exact element and exact change.
- Do NOT list stock photos as a design fix.
- No JSON. Markdown only.`

export interface JudgeBreakdownFull extends JudgeBreakdown {
  overall: number
}

// Keep backward-compatible name
export type { JudgeResult as JudgeResultLegacy }

export async function judgeWebsite(config: JudgeConfig): Promise<JudgeResult> {
  const projectDir = config.projectDir
  const businessName = config.businessName
  const archetype = config.archetype
  const targetScore = config.targetScore ?? 8.5
  const brandPersonality = config.brandPersonality || 'professional'

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[LLM Judge] Evaluating: ${businessName} (${archetype})`)
  console.log(`[LLM Judge] Rubric ${JUDGE_RUBRIC_VERSION} | Stage ${JUDGE_STAGE} | Target ${targetScore}`)
  console.log(`[LLM Judge] Brand personality: ${brandPersonality}`)

  // ── 1. Capture screenshots (multi-viewport + interactive states) ─────────
  const capture = await captureJudgeEvidence(projectDir)
  const screenshots = capture.screenshots

  if (screenshots.length === 0) {
    console.log('[LLM Judge] No screenshots captured — skipping visual scoring')
    return emptyResult('Could not capture screenshots — Playwright may not be available', {
      pagesJudged: [],
      sectionsJudged: [],
      featuresJudged: [],
      viewports: [],
      missing: ['ALL — no screenshots'],
    })
  }

  console.log(
    `[LLM Judge] Captured ${screenshots.length} screenshots across ${capture.viewports.length} viewports`
  )

  // ── 2. Judge (send real images to vision model) ──────────────────────────
  const judgePrompt = buildJudgePrompt(businessName, archetype, brandPersonality, capture)
  const scoreResult = await callMiMoJudge(judgePrompt, screenshots)

  if (!scoreResult) {
    console.log('[LLM Judge] MiMo call failed — skipping visual scoring')
    return emptyResult('LLM judge call failed — skipping visual scoring', {
      pagesJudged: capture.pages,
      sectionsJudged: [],
      featuresJudged: capture.states,
      viewports: capture.viewports.map(String),
      missing: ['judge-call-failed'],
    })
  }

  // ── 3. Compute design score (GATE — excludes image authenticity) ────────
  const b = scoreResult
  const designDims: Array<keyof JudgeBreakdown> = [
    'visualHierarchy',
    'whitespace',
    'contrast',
    'layoutCraft',
    'states',
    'consistency',
    'responsive',
    'a11y',
  ]
  const designSum = designDims.reduce((s, d) => s + (Number(b[d]) || 0), 0)
  const designScore = Math.round((designSum / designDims.length) * 10) / 10

  // Raw includes images (informational)
  const rawDims = [...designDims, 'imageQuality', 'imageAuthenticity']
  const rawSum = rawDims.reduce((s, d) => s + (Number(b[d as keyof typeof b]) || 0), 0)
  const rawScore = Math.round((rawSum / rawDims.length) * 10) / 10

  const lowDimensions: string[] = []
  for (const d of designDims) {
    const v = Number(b[d]) || 0
    if (v < 6) lowDimensions.push(`${d}: ${v}/10`)
  }

  // Recommendation: design score is the gate. Stock images never block.
  let recommendation: JudgeResult['recommendation'] = 'pass'
  if (designScore < 6.5) recommendation = 'fix'
  else if (designScore < targetScore) recommendation = 'review'
  if (designScore < 5) recommendation = 'reroll'

  const result: JudgeResult = {
    score: designScore,
    rawScore,
    breakdown: {
      visualHierarchy: b.visualHierarchy || 0,
      whitespace: b.whitespace || 0,
      contrast: b.contrast || 0,
      layoutCraft: b.layoutCraft || 0,
      states: b.states || 0,
      consistency: b.consistency || 0,
      responsive: b.responsive || 0,
      a11y: b.a11y || 0,
      imageQuality: b.imageQuality || 0,
      imageAuthenticity: b.imageAuthenticity || 0,
      distinctiveness: b.distinctiveness || 0,
      brandFit: b.brandFit || 0,
      memorability: b.memorability || 0,
    },
    priorityFixes: normalizeFixes(b.priorityFixes),
    uniquenessSuggestions: Array.isArray(b.uniquenessSuggestions)
      ? b.uniquenessSuggestions.slice(0, 8)
      : [],
    targetChecklist: Array.isArray(b.targetChecklist) ? b.targetChecklist.slice(0, 10) : [],
    feedback: b.feedback || '',
    recommendation,
    attempt: 1,
    lowDimensions,
    coverage: normalizeCoverage(b.coverage, capture),
    stockImageNotes: Array.isArray(b.stockImageNotes) ? b.stockImageNotes : [],
    rubricVersion: JUDGE_RUBRIC_VERSION,
    stage: JUDGE_STAGE,
  }

  console.log(`\n[LLM Judge] DESIGN SCORE: ${result.score}/10 (raw ${result.rawScore})`)
  console.log('[LLM Judge] BREAKDOWN (design):')
  for (const d of designDims) {
    console.log(`  ${d}: ${result.breakdown[d]}/10`)
  }
  console.log(`[LLM Judge] RECOMMENDATION: ${recommendation.toUpperCase()}`)
  console.log(`[LLM Judge] PRIORITY FIXES: ${result.priorityFixes.length}`)
  result.priorityFixes.slice(0, 5).forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.impact}] ${f.file} — ${f.issue}`)
  })
  if (result.stockImageNotes.length > 0) {
    console.log(`[LLM Judge] STOCK IMAGE NOTES (non-blocking): ${result.stockImageNotes.length}`)
  }
  if (result.uniquenessSuggestions.length > 0) {
    console.log(`[LLM Judge] UNIQUENESS IDEAS: ${result.uniquenessSuggestions.length}`)
  }
  if (result.coverage.missing.length > 0) {
    console.log(`[LLM Judge] ⚠ COVERAGE GAPS: ${result.coverage.missing.join(', ')}`)
  }

  return result
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyResult(feedback: string, coverage: JudgeCoverage): JudgeResult {
  return {
    score: 0,
    rawScore: 0,
    breakdown: {
      visualHierarchy: 0,
      whitespace: 0,
      contrast: 0,
      layoutCraft: 0,
      states: 0,
      consistency: 0,
      responsive: 0,
      a11y: 0,
      imageQuality: 0,
      imageAuthenticity: 0,
      distinctiveness: 0,
      brandFit: 0,
      memorability: 0,
    },
    priorityFixes: [],
    uniquenessSuggestions: [],
    targetChecklist: [],
    feedback,
    recommendation: 'reroll',
    attempt: 1,
    lowDimensions: [],
    coverage,
    stockImageNotes: [],
    rubricVersion: JUDGE_RUBRIC_VERSION,
    stage: JUDGE_STAGE,
  }
}

function normalizeFixes(raw: any): JudgeFix[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((f) => f && (f.file || f.issue || f.change))
    .slice(0, 12)
    .map((f) => ({
      file: String(f.file || 'components/'),
      issue: String(f.issue || ''),
      change: String(f.change || ''),
      dimension: String(f.dimension || ''),
      impact: (['high', 'medium', 'low'] as const).includes(f.impact) ? f.impact : 'medium',
    }))
    .sort((a, b) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
      return (order[a.impact] ?? 1) - (order[b.impact] ?? 1)
    })
}

function normalizeCoverage(raw: any, capture: CaptureEvidence): JudgeCoverage {
  const base: JudgeCoverage = {
    pagesJudged: capture.pages,
    sectionsJudged: capture.sections,
    featuresJudged: capture.states,
    viewports: capture.viewports.map(String),
    missing: [],
  }
  if (!raw || typeof raw !== 'object') return base
  return {
    pagesJudged: Array.isArray(raw.pagesJudged) ? raw.pagesJudged : base.pagesJudged,
    sectionsJudged: Array.isArray(raw.sectionsJudged) ? raw.sectionsJudged : base.sectionsJudged,
    featuresJudged: Array.isArray(raw.featuresJudged) ? raw.featuresJudged : base.featuresJudged,
    viewports: Array.isArray(raw.viewports) ? raw.viewports.map(String) : base.viewports,
    missing: Array.isArray(raw.missing) ? raw.missing.map(String) : [],
  }
}

interface CaptureEvidence {
  screenshots: string[]
  pages: string[]
  sections: string[]
  states: string[]
  viewports: number[]
}

function buildJudgePrompt(
  businessName: string,
  archetype: string,
  brandPersonality: string,
  capture: CaptureEvidence
): string {
  const fileList = capture.screenshots
    .map((s, i) => `${i + 1}. ${path.basename(s)}`)
    .join('\n')

  return `Evaluate the website for "${businessName}".
Trade/archetype: ${archetype}
Brand personality to judge fit against: ${brandPersonality}
Current target design score: 8.5/10

I am sending ${capture.screenshots.length} screenshots as images below.
Viewports: ${capture.viewports.join(', ')} (mobile 390 / tablet 768 / desktop 1440)
Pages: ${capture.pages.join(', ')}
Interactive states: ${capture.states.join(', ') || '(static pages only)'}

IMPORTANT — FEATURES ARE DISMISSED:
Popups (newsletter, cookie bar, quote slide-in, modals) have been CLOSED before these screenshots.
Do NOT penalize the design score for floating widgets (WhatsApp FAB, click-to-call, quote buttons,
cookie bar) — those are optional client features judged separately. Score the WEBSITE DESIGN:
layout, typography, spacing, color, hierarchy, consistency, forms, page structure.

Image list (order matches images sent):
${fileList}

${SCORING_RUBRIC}`
}

// ── MiMo API with VISION (real screenshots) ─────────────────────────────────

async function callMiMoJudge(prompt: string, screenshots: string[]): Promise<any> {
  const MIMO_API_URL = 'https://token-plan-sgp.xiaomimimo.com/v1/chat/completions'
  const MIMO_API_KEY = 'tp-s5mjmff9x4qh31pudzb4k45ipyprkgxvmgeyhidxqo28ljg3'
  // Judge with the strongest model available — visual critique needs top quality
  const MIMO_MODEL = 'mimo-v2.6-pro'
  const MIMO_MODEL_FALLBACK = 'mimo-v2.5'

  const MIMO_PREPAID_API_URL =
    process.env.MIMO_PREPAID_URL || 'https://api.xiaomimimo.com/v1/chat/completions'
  const MIMO_PREPAID_API_KEY = process.env.MIMO_PREPAID_API_KEY || ''
  const MIMO_PREPAID_MODEL = process.env.MIMO_PREPAID_MODEL || 'mimo-v2.5'

  // Build vision message content: text + images
  const content: any[] = [{ type: 'text', text: prompt }]
  // Cap images to keep request size sane
  const imagePaths = screenshots.slice(0, 8)
  for (const p of imagePaths) {
    try {
      const buf = await fs.readFile(p)
      const b64 = buf.toString('base64')
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${b64}` },
      })
    } catch {}
  }

  console.log(`[LLM Judge] Sending ${imagePaths.length} images + prompt to judge model`)

  const tryCall = async (label: string, url: string, key: string, model: string) => {
    console.log(`[LLM Judge] [${label}] Calling ${model}`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a world-class web design critic and art director. You evaluate real website screenshots. Respond in the MARKDOWN format requested. Do NOT use JSON.',
          },
          { role: 'user', content },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`${label} ${response.status}: ${errorText.slice(0, 200)}`)
    }
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    const reasoning = data.choices?.[0]?.message?.reasoning_content
    const contentOut = Array.isArray(text)
      ? text.map((p: any) => p.text || '').join('')
      : text || (reasoning || '')
    // Risk-filter / refusal responses have no JSON — signal caller to fall back
    if (/high risk|rejected|refused|cannot assist/i.test(contentOut) && !contentOut.includes('{')) {
      console.warn(`[LLM Judge] ${label} refused the request: ${contentOut.slice(0, 120)}`)
      return null
    }
    console.log(`[LLM Judge] ✓ ${label} responded (${contentOut.length} chars)`)
    // Save raw output so we can diagnose parse failures
    try {
      const debugDir = path.join(process.cwd(), 'logs')
      await fs.mkdir(debugDir, { recursive: true })
      await fs.writeFile(
        path.join(debugDir, 'judge-raw-output.txt'),
        contentOut.slice(0, 12000),
        'utf-8'
      )
    } catch {}
    return parseJudgeResponse(contentOut)
  }

  // Primary: MiMo 2.6 Pro (best vision judge)
  try {
    const r = await tryCall('MiMo 2.6 Pro', MIMO_API_URL, MIMO_API_KEY, MIMO_MODEL)
    if (r) return r
  } catch (err) {
    console.warn(`[LLM Judge] MiMo 2.6 Pro failed: ${err}`)
  }

  // Secondary: MiMo 2.5 (same endpoint, fallback model)
  try {
    const r = await tryCall('MiMo 2.5', MIMO_API_URL, MIMO_API_KEY, MIMO_MODEL_FALLBACK)
    if (r) return r
  } catch (err) {
    console.warn(`[LLM Judge] MiMo 2.5 failed: ${err}`)
  }

  // Secondary
  if (MIMO_PREPAID_API_KEY) {
    try {
      const r = await tryCall('MiMo Prepaid', MIMO_PREPAID_API_URL, MIMO_PREPAID_API_KEY, MIMO_PREPAID_MODEL)
      if (r) return r
    } catch (err) {
      console.warn(`[LLM Judge] MiMo Prepaid failed: ${err}`)
    }
  }

  return null
}

﻿/** Parse judge output — MARKDOWN format (see SCORING_RUBRIC). */
function parseJudgeResponse(output: string): any {
  try {
    const text = output.trim()
    const result: any = {}

    const scoresSection = text.match(/##\s*SCORES([\s\S]*?)(?=##\s|$)/i)
    if (scoresSection) {
      const s = scoresSection[1]
      const keys = [
        'visualHierarchy', 'whitespace', 'contrast', 'layoutCraft', 'states',
        'consistency', 'responsive', 'a11y', 'imageQuality', 'imageAuthenticity',
        'distinctiveness', 'brandFit', 'memorability', 'overall',
      ]
      for (const key of keys) {
        const m = s.match(new RegExp(key + '\\s*[:=]\\s*([0-9]+(?:\\.[0-9]+)?)', 'i'))
        if (m) result[key] = Number(m[1])
      }
    }

    const fbSection = text.match(/##\s*FEEDBACK([\s\S]*?)(?=##\s|$)/i)
    if (fbSection) result.feedback = fbSection[1].trim()

    const fixes: any[] = []
    const fixesSection = text.match(/##\s*PRIORITY\s*FIXES([\s\S]*?)(?=##\s|$)/i)
    if (fixesSection) {
      const lines = fixesSection[1].split('\n')
      let current: any = null
      for (const line of lines) {
        const heading = line.match(/^\s*\d+\.\s*\[(high|medium|low)\]\s*(.+?)\s*$/i)
        if (heading) {
          if (current && (current.file || current.issue || current.change)) {
            if (!current.impact) current.impact = 'medium'
            fixes.push(current)
          }
          current = { impact: heading[1].toLowerCase(), file: heading[2].trim(), issue: '', change: '', dimension: '' }
          continue
        }
        const issue = line.match(/^\s*ISSUE:\s*(.+)$/i)
        if (issue && current) { current.issue = issue[1].trim(); continue }
        const change = line.match(/^\s*CHANGE:\s*(.+)$/i)
        if (change && current) { current.change = change[1].trim(); continue }
        const dim = line.match(/^\s*(?:DIMENSION|AREA):\s*(.+)$/i)
        if (dim && current) { current.dimension = dim[1].trim(); continue }
      }
      if (current && (current.file || current.issue || current.change)) {
        if (!current.impact) current.impact = 'medium'
        fixes.push(current)
      }
    }
    result.priorityFixes = fixes

    result.targetChecklist = extractMdList(text, 'TARGET\\s*CHECKLIST')
    result.uniquenessSuggestions = extractMdList(text, 'UNIQUENESS')
    result.stockImageNotes = extractMdList(text, 'STOCK\\s*IMAGE\\s*NOTES')

    const hasScores = result.visualHierarchy != null || result.whitespace != null
    if (!hasScores && fixes.length === 0) {
      console.warn('[LLM Judge] Markdown parse found nothing:', text.slice(0, 200))
      return null
    }
    console.log('[LLM Judge] Markdown parsed: scores=' + hasScores + ', fixes=' + fixes.length + ', uniqueness=' + (result.uniquenessSuggestions || []).length)
    return result
  } catch (err) {
    console.warn('[LLM Judge] Failed to parse markdown: ' + err)
    return null
  }
}

function extractMdList(text: string, headingPattern: string): string[] {
  const section = text.match(new RegExp('##\\s*' + headingPattern + '([\\s\\S]*?)(?=##\\s|$)', 'i'))
  if (!section) return []
  return section[1].split('\n').map((l) => l.replace(/^[\s]*[-*•]\s+/, '').trim()).filter((l) => l.length > 0 && !l.startsWith('##'))
}

function repairJson(raw: string): string {
  let s = raw
  // Escape raw newlines / tabs inside strings
  s = s.replace(/[\u0000-\u001f]/g, (c) => (c === '\n' ? '\\n' : c === '\r' ? '\\r' : c === '\t' ? '\\t' : ' '))
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([\]}])/g, '$1')
  // Fix unescaped internal double quotes in strings: ,"key":"val" with " inside
  // Heuristic: escape " that appears between : " and ", "
  s = s.replace(/:\s*"([^"]*)"([^"]*)"([^"]*)"(\s*[,}])/g, (_m, a, b, c, d) => `:"${a}\\"${b}\\"${c}"${d}`)
  return s
}

// ── Evidence capture: pages + viewports + interactive states ─────────────────

async function captureJudgeEvidence(projectDir: string): Promise<CaptureEvidence> {
  const screenshotDir = path.join(projectDir, 'screenshots', 'judge')
  await fs.rm(screenshotDir, { recursive: true, force: true }).catch(() => {})
  await fs.mkdir(screenshotDir, { recursive: true })

  let playwright: any
  try {
    playwright = await import('playwright')
  } catch {
    console.warn('[LLM Judge] Playwright not available — skipping screenshot capture')
    return { screenshots: [], pages: [], sections: [], states: [], viewports: [] }
  }

  const { spawn } = await import('child_process')
  const port = 49152 + Math.floor(Math.random() * (65535 - 49152))
  console.log(`[LLM Judge] Starting built website on port ${port}...`)

  let serverProcess: any = null
  const screenshots: string[] = []
  const pages: string[] = []
  const sections: string[] = []
  const states: string[] = []

  try {
    serverProcess = spawn('npx', ['next', 'start', '-p', String(port)], {
      cwd: projectDir,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' },
    })

    const maxWait = 180000
    const startTime = Date.now()
    let ready = false
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch(`http://localhost:${port}`)
        if (response.ok || response.status === 404) {
          ready = true
          break
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500))
    }

    if (!ready) {
      console.warn('[LLM Judge] Built website server did not start in time — skipping screenshots')
      return { screenshots: [], pages: [], sections: [], states: [], viewports: [] }
    }

    console.log('[LLM Judge] Built website ready')

    const browser = await playwright.chromium.launch({ headless: true })
    const viewports = [
      { width: 390, height: 844, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' },
    ]

    // Pages to judge (home + common subpages). 404 = not enabled, skip.
    const pageList = [
      { path: '/', name: 'home' },
      { path: '/about', name: 'about' },
      { path: '/services', name: 'services' },
      { path: '/portfolio', name: 'portfolio' },
      { path: '/contact', name: 'contact' },
    ]

    try {
      for (const vp of viewports) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        })
        // Clear localStorage so previous site's dashboard state never bleeds in
        await context.addInitScript(() => {
          try {
            window.localStorage.clear()
            window.sessionStorage.clear()
          } catch {}
        })
        const page = await context.newPage()

        for (const p of pageList) {
          try {
            const resp = await page.goto(`http://localhost:${port}${p.path}`, {
              waitUntil: 'load',
              timeout: 30000,
            })
            if (resp && resp.status() === 404) continue

            // Close popups / overlays FIRST — features must not pollute design score
            await dismissOverlays(page)

            // IMPORTANT: lazy images + scroll animations only appear after
            // scrolling. Scroll the FULL page first, then return to top,
            // then screenshot — otherwise the judge sees blank space.
            await scrollPageFully(page, vp.height)
            await dismissOverlays(page)
            await page.waitForTimeout(800)

            const filepath = path.join(screenshotDir, `${p.name}-${vp.name}.png`)
            await page.screenshot({ path: filepath, fullPage: true })
            screenshots.push(filepath)
            if (!pages.includes(p.name)) pages.push(p.name)

            // Section markers from DOM
            const sectionIds = await page.evaluate(() =>
              Array.from(document.querySelectorAll('section[id], main section')).map(
                (el) => el.id || 'section'
              )
            )
            for (const s of sectionIds.slice(0, 12)) {
              if (s && !sections.includes(s)) sections.push(s)
            }

            // Interactive states — home page only
            if (p.name === 'home' && (vp.name === 'desktop' || vp.name === 'mobile')) {
              await captureStates(page, screenshotDir, p.name, vp.name, screenshots, states)
            }
          } catch (err) {
            console.warn(`[LLM Judge] page ${p.path} @ ${vp.name} failed: ${err}`)
          }
        }

        await context.close()
      }
    } finally {
      await browser.close()
    }
  } catch (err) {
    console.warn('[LLM Judge] capture error:', err)
  } finally {
    if (serverProcess) {
      try {
        serverProcess.kill('SIGTERM')
        console.log('[LLM Judge] Built website server stopped')
      } catch {}
    }
  }

  return {
    screenshots: await compressScreenshots(screenshots),
    pages,
    sections,
    states,
    viewports: [390, 768, 1440],
  }
}

/**
 * Full-page PNGs can be 5–10MB each (34MB total) — vision API rejects that.
 * Resize to max 900px wide, JPEG q=72, and keep only the 8 most informative shots.
 */
async function compressScreenshots(paths: string[]): Promise<string[]> {
  try {
    const sharp = (await import('sharp')).default
    const outDir = path.join(path.dirname(paths[0] || '.'), 'compressed')
    await fs.mkdir(outDir, { recursive: true })

    // Prioritize: home desktop/mobile, then other pages desktop, then states
    const rank = (p: string) => {
      const n = path.basename(p).toLowerCase()
      if (n.startsWith('home-desktop')) return 0
      if (n.startsWith('home-mobile') && !n.includes('popup') && !n.includes('menu') && !n.includes('form')) return 1
      if (n.startsWith('services-desktop')) return 2
      if (n.startsWith('contact-desktop')) return 3
      if (n.startsWith('about-desktop')) return 4
      if (n.startsWith('portfolio-desktop')) return 5
      if (n.includes('contact-form-errors')) return 6
      if (n.includes('quote-popup')) return 7
      return 8
    }
    const prioritized = [...paths].sort((a, b) => rank(a) - rank(b)).slice(0, 8)

    const compressed: string[] = []
    for (const p of prioritized) {
      try {
        const out = path.join(outDir, path.basename(p).replace(/\.png$/, '.jpg'))
        await sharp(p)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 70, mozjpeg: true })
          .toFile(out)
        compressed.push(out)
      } catch {
        compressed.push(p)
      }
    }
    const total = await Promise.all(compressed.map(async (f) => (await fs.stat(f)).size))
    console.log(
      `[LLM Judge] Compressed ${compressed.length} screenshots (${Math.round(
        total.reduce((a, b) => a + b, 0) / 1024
      )}KB total)`
    )
    return compressed
  } catch (err) {
    console.warn('[LLM Judge] compress failed, using originals:', err)
    return paths.slice(0, 8)
  }
}

/**
 * Close popups / cookie bars / modals before screenshotting.
 * Features are judged separately — they must not pollute the design score.
 */
async function dismissOverlays(page: any) {
  try {
    // Click common close / accept buttons
    const closeSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Accept All")',
      'button:has-text("Got it")',
      'button:has-text("Close")',
      'button:has-text("No thanks")',
      'button:has-text("Maybe later")',
      'button:has-text("×")',
      'button:has-text("X")',
      '[aria-label="Close"]',
      '[aria-label="close"]',
      '[data-close]',
      '.cookie-bar button',
      '.newsletter-popup button[aria-label="Close"]',
      '.modal-close',
      '.modal-overlay',
    ]
    for (const sel of closeSelectors) {
      try {
        const el = page.locator(sel).first()
        if (await el.count()) {
          await el.click({ timeout: 800 })
          await page.waitForTimeout(150)
        }
      } catch {}
    }
    // Press Escape to close any remaining modal
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    // Hide anything still floating that blocks content (newsletter, cookie, quote slide-in)
    await page.evaluate(() => {
      const hide = (sel: string) => {
        document.querySelectorAll(sel).forEach((el) => {
          ;(el as HTMLElement).style.display = 'none'
        })
      }
      hide('[class*="newsletter-popup"]')
      hide('[class*="cookie-bar"]')
      hide('[class*="cookieBar"]')
      hide('[class*="modal"][class*="open"]')
      hide('[class*="modal"][class*="show"]')
      hide('[role="dialog"]')
    })
  } catch {}
}

/**
 * Scroll the entire page so lazy images + scroll-triggered animations load,
 * then return to top. Without this the judge screenshots blank placeholders
 * and falsely scores whitespace as "dead space".
 */
async function scrollPageFully(page: any, viewportHeight: number) {
  const step = Math.max(300, Math.floor(viewportHeight * 0.7))
  // Read page height without async evaluate helpers (avoids __name bug)
  let prevHeight = 0
  for (let i = 0; i < 40; i++) {
    const h = await page.evaluate(() => document.body.scrollHeight)
    if (h > prevHeight) prevHeight = h
    const y = i * step
    if (y > prevHeight + viewportHeight) break
    await page.mouse.wheel(0, step)
    await page.waitForTimeout(220)
  }
  // Extra settle at bottom for last lazy images
  await page.waitForTimeout(600)
  // Back to top
  await page.mouse.wheel(0, -prevHeight - viewportHeight * 2)
  await page.waitForTimeout(500)
  // Nudge to absolute top
  await page.keyboard.press('Home')
  await page.waitForTimeout(400)
}

/** Capture open states of interactive features when present */
async function captureStates(
  page: any,
  screenshotDir: string,
  pageName: string,
  vpName: string,
  screenshots: string[],
  states: string[]
) {
  const stateShots: Array<{ name: string; action: () => Promise<boolean> }> = [
    {
      name: 'quote-popup',
      action: async () => {
        const btn = page.locator('button, a').filter({ hasText: /quote/i }).first()
        if (await btn.count()) {
          await btn.click({ timeout: 2000 }).catch(() => {})
          await page.waitForTimeout(800)
          return true
        }
        return false
      },
    },
    {
      name: 'mobile-menu',
      action: async () => {
        if (vpName !== 'mobile') return false
        const burger = page.locator('button[aria-label*="menu" i], button:has(svg)').first()
        if (await burger.count()) {
          await burger.click({ timeout: 2000 }).catch(() => {})
          await page.waitForTimeout(500)
          return true
        }
        return false
      },
    },
    {
      name: 'contact-form-errors',
      action: async () => {
        const submit = page.locator('form button[type="submit"]').first()
        if (await submit.count()) {
          await submit.click({ timeout: 2000 }).catch(() => {})
          await page.waitForTimeout(500)
          return true
        }
        return false
      },
    },
  ]

  for (const s of stateShots) {
    try {
      const ok: boolean = await s.action()
      if (ok) {
        const filepath = path.join(screenshotDir, `${pageName}-${vpName}-${s.name}.png`)
        await page.screenshot({ path: filepath, fullPage: false }).catch(() => {})
        screenshots.push(filepath)
        states.push(s.name)
        // Dismiss / reload for next state
        await page.goto(page.url().split('?')[0], { waitUntil: 'domcontentloaded' }).catch(() => {})
        await page.waitForTimeout(400)
      }
    } catch {}
  }
}

// ── Backward-compatible helpers used by run-phase3 / build-website ───────────

export async function judgeWithReroll(
  baseConfig: JudgeConfig,
  rerollFn?: (seedId: string) => string
): Promise<JudgeResult> {
  const maxAttempts = baseConfig.maxAttempts || 1
  const target = baseConfig.targetScore ?? 8.5
  let lastResult: JudgeResult | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n[LLM Judge] ── Attempt ${attempt}/${maxAttempts} ──`)
    const result = await judgeWebsite({ ...baseConfig })
    lastResult = result

    if (result.score >= target) {
      console.log(`\n[LLM Judge] ✓ Score ${result.score} >= ${target} — PASS`)
      return result
    }

    console.log(`\n[LLM Judge] ✗ Score ${result.score} < ${target} — ${result.recommendation}`)
    if (attempt < maxAttempts && rerollFn) {
      const seedId = `fix-${Date.now()}`
      console.log(`[LLM Judge] Focus: ${result.lowDimensions.join(', ')}`)
      console.log(`[LLM Judge] New design seed: ${rerollFn(seedId)}`)
    }
  }

  return lastResult!
}

/** Build a human-readable fix log entry for DESIGN-BRAIN.md */
export function formatFixLogEntry(params: {
  site: string
  trade: string
  archetype: string
  templates: string[]
  scoreBefore: number
  scoreAfter: number
  fixes: JudgeFix[]
  uniquenessNotes: string[]
  passNumber: number
}): string {
  const lines = [
    `### ${new Date().toISOString().slice(0, 10)} — ${params.site} — Pass ${params.passNumber}`,
    `- **Trade:** ${params.trade}`,
    `- **Archetype:** ${params.archetype}`,
    `- **Templates touched:** ${params.templates.join(', ') || '(none)'}`,
    `- **Score before → after:** ${params.scoreBefore} → ${params.scoreAfter} (design score)`,
    `- **Rubric:** ${JUDGE_RUBRIC_VERSION}`,
    `- **Fixes applied:**`,
  ]
  params.fixes.forEach((f, i) => {
    lines.push(
      `  ${i + 1}. ${f.file} — ${f.issue} → ${f.change} | ${f.dimension} | impact: ${f.impact}`
    )
  })
  if (params.uniquenessNotes.length > 0) {
    lines.push(`- **Uniqueness notes:**`)
    params.uniquenessNotes.forEach((n) => lines.push(`  - ${n}`))
  }
  lines.push(`- **Regressions checked:** dashboard / forms / leads`)
  lines.push(`- **Template upgrade needed:** review ${params.templates.join(', ') || 'n/a'}`)
  lines.push('')
  return lines.join('\n')
}
