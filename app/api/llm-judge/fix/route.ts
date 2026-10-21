import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fsp } from 'fs'

export const dynamic = 'force-dynamic'

/**
 * POST /api/llm-judge/fix — ONE surgical fix pass on a built site.
 *
 * Body: {
 *   businessFolder: string,
 *   priorityFixes: JudgeFix[],
 *   brandPersonality?: string,
 *   trade?: string
 * }
 *
 * Launches MiMo with ONLY those fixes. Protected files are locked and verified.
 * Writes a fix-log entry to DESIGN-BRAIN.md.
 */

const PROTECTED_PATTERNS = [
  /^public\/dashboard\//i,
  /^app\/dashboard\//i,
  /^app\/api\/save-config\//i,
  /^app\/api\/upload\//i,
  /^app\/api\/auth\//i,
  /^app\/api\/leads\//i,
  /^app\/api\/site-data\//i,
  /^app\/api\/blob-urls\//i,
  /^lib\/auth\.ts$/i,
  /^lib\/dashboard-middleware\.ts$/i,
  /^lib\/use-site-data\.ts$/i,
  /^lib\/blob-storage\.ts$/i,
  /^lib\/control-flags\.ts$/i,
  /^lib\/section-registry\.ts$/i,
  /^lib\/feature-registry\.ts$/i,
  /^components\/SectionRenderer\.tsx$/i,
  /^components\/features\/FeatureHost\.tsx$/i,
  /^middleware\.ts$/i,
]

const ALLOWED_PATTERNS = [
  /^components\//i,
  /^app\/globals\.css$/i,
  /^app\/page\.tsx$/i,
  /^app\/[a-z0-9-]+\/(page|view)\.tsx$/i,
  /^tailwind\.config\.ts$/i,
]

function isProtected(rel: string): boolean {
  return PROTECTED_PATTERNS.some((p) => p.test(rel))
}

interface FixItem {
  file: string
  issue: string
  change: string
  dimension?: string
  impact?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const businessFolder = String(body.businessFolder || '').trim()
    const fixes: FixItem[] = Array.isArray(body.priorityFixes) ? body.priorityFixes : []
    const trade = String(body.trade || body.archetype || '')
    const brandPersonality = String(body.brandPersonality || 'professional')

    if (!businessFolder) {
      return NextResponse.json({ success: false, error: 'businessFolder is required' }, { status: 400 })
    }
    if (fixes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'priorityFixes is empty — run LLM Judge first' },
        { status: 400 }
      )
    }

    const websitesFolder =
      process.env.WEBSITES_FOLDER || path.join(process.cwd(), '..', 'Websites')
    const projectDir = path.join(websitesFolder, businessFolder)

    try {
      await fsp.access(projectDir)
    } catch {
      return NextResponse.json({ success: false, error: `Folder not found: ${businessFolder}` }, { status: 404 })
    }

    const safeFixes: FixItem[] = []
    const skipped: string[] = []
    for (const f of fixes) {
      const file = String(f.file || '').replace(/\\/g, '/')
      if (isProtected(file)) {
        skipped.push(`${file} (protected)`)
        continue
      }
      const allowed = ALLOWED_PATTERNS.some((p) => p.test(file))
      if (!allowed) {
        skipped.push(`${file} (not allowed)`)
        continue
      }
      safeFixes.push({ ...f, file })
    }

    if (safeFixes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'All fixes were blocked by protected-file rules',
        skipped,
      })
    }

    const snapshot = await snapshotProtected(projectDir)

    const fixList = safeFixes
      .map(
        (f, i) =>
          `${i + 1}. FILE: ${f.file}
   ISSUE: ${f.issue}
   CHANGE: ${f.change}
   DIMENSION: ${f.dimension || 'design'} | IMPACT: ${f.impact || 'medium'}`
      )
      .join('\n\n')

    const prompt = `You are a world-class web designer and front-end engineer.
You are making SURGICAL improvements to a client website. Do NOT rebuild. Do NOT redesign from scratch.

BUSINESS: ${businessFolder}
TRADE: ${trade}
BRAND PERSONALITY: ${brandPersonality}

CURRENT DESIGN SCORE TARGET: 8.5 / 10

APPLY EXACTLY THESE FIXES (highest impact first):

${fixList}

=== HARD RULES (violation = failure) ===
1. ONLY edit the files listed above. Touch nothing else.
2. NEVER modify these protected files:
   - public/dashboard/**, app/dashboard/**
   - app/api/save-config, upload, auth, leads, site-data, blob-urls
   - lib/auth.ts, dashboard-middleware.ts, use-site-data.ts, blob-storage.ts
   - lib/control-flags.ts, section-registry.ts, feature-registry.ts
   - components/SectionRenderer.tsx, components/features/FeatureHost.tsx
   - site-config.json SCHEMA (content values only if a fix requires it)
   - next.config.js security headers, middleware.ts
3. Keep all "use client" directives intact.
4. Keep imports of useSiteData, AnimateOnScroll, SectionRenderer, FeatureHost working.
5. Do not change component file names or export names.
6. Do not introduce new dependencies.
7. Use existing CSS tokens: --color-primary, --color-secondary, --color-accent, --color-bg, --color-text, --color-muted, --font-heading, --font-body.
8. Prefer editing styles/classes over rewriting structure.
9. Site MUST still compile: valid TSX, no broken imports.

=== QUALITY BAR ===
- This should look like a R100,000 website. Premium, intentional, confident.
- Generous whitespace. Strong CTA contrast. Clear type hierarchy.
- Consistent spacing rhythm. Smooth hover/focus states.

=== OUTPUT ===
List each file you changed and a one-line summary. No code in the output.`

    console.log(`[FixPass] Launching MiMo for ${businessFolder} — ${safeFixes.length} fixes`)
    if (skipped.length > 0) {
      console.log(`[FixPass] Skipped: ${skipped.join(', ')}`)
    }

    const { spawn } = await import('child_process')
    const bcrypt = await import('bcryptjs')
    const crypto = await import('crypto')
    const bizFirst = businessFolder.split(/[_\s&\-,]+/)[0].trim() || 'admin'
    const bizHash = bcrypt.hashSync(`${bizFirst}@${new Date().getFullYear()}!`, 10)

    const result = await new Promise<{ code: number; output: string }>((resolve) => {
      const mimo = spawn('mimo', ['run', '--dangerously-skip-permissions'], {
        cwd: projectDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          DASHBOARD_USERNAME: bizFirst,
          DASHBOARD_PASSWORD_HASH: bizHash,
          DASHBOARD_PASSWORD_HASH_BASE64: Buffer.from(bizHash, 'utf-8').toString('base64'),
          NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'),
        },
      })
      let out = ''
      mimo.stdout.on('data', (d: Buffer) => {
        out += String(d)
      })
      mimo.stderr.on('data', (d: Buffer) => {
        out += String(d)
      })
      mimo.stdin.write(prompt)
      mimo.stdin.end()
      const killTimer = setTimeout(() => {
        try {
          mimo.kill('SIGTERM')
        } catch {}
      }, 45 * 60 * 1000)
      mimo.on('close', (code: number | null) => {
        clearTimeout(killTimer)
        resolve({ code: code ?? 1, output: out.slice(-4000) })
      })
    })

    console.log(`[FixPass] MiMo exited with code ${result.code}`)

    const violations = await verifyProtected(projectDir, snapshot)
    if (violations.length > 0) {
      console.warn(`[FixPass] PROTECTED VIOLATIONS — reverting: ${violations.join(', ')}`)
      await revertProtected(projectDir, snapshot, violations)
    }

    try {
      const brainPath = path.join(process.cwd(), 'DESIGN-BRAIN.md')
      let brain = await fsp.readFile(brainPath, 'utf-8')
      const entry = [
        `### ${new Date().toISOString().slice(0, 10)} — ${businessFolder} — Fix pass`,
        `- **Trade:** ${trade || '—'}`,
        `- **Brand personality:** ${brandPersonality}`,
        `- **Rubric:** v1 | **Target:** 8.5`,
        `- **Fixes requested:**`,
        ...safeFixes.map(
          (f, i) => `  ${i + 1}. ${f.file} — ${f.issue} → ${f.change} | ${f.dimension || ''} | ${f.impact || ''}`
        ),
        skipped.length > 0 ? `- **Skipped (protected/disallowed):** ${skipped.join(', ')}` : '',
        `- **MiMo exit:** ${result.code}`,
        violations.length > 0
          ? `- **Protected violations reverted:** ${violations.join(', ')}`
          : `- **Protected files:** intact ✓`,
        `- **Next:** run LLM Judge to score the changes`,
        '',
      ]
        .filter(Boolean)
        .join('\n')

      if (brain.includes('### Log')) {
        brain = brain.replace('### Log', `### Log\n${entry}`)
      } else {
        brain += `\n\n${entry}`
      }
      await fsp.writeFile(brainPath, brain, 'utf-8')
      console.log('[FixPass] Fix log written to DESIGN-BRAIN.md')
    } catch (e) {
      console.warn('[FixPass] Could not write DESIGN-BRAIN.md:', e)
    }

    return NextResponse.json({
      success: result.code === 0,
      fixesApplied: safeFixes.length,
      skipped,
      protectedViolations: violations,
      mimoExit: result.code,
      outputTail: result.output.slice(-800),
      message: `Fix pass complete (${safeFixes.length} fixes). Run LLM Judge to see the new score.`,
    })
  } catch (err) {
    console.error('[FixPass] failed:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Fix pass failed' },
      { status: 500 }
    )
  }
}

type Snapshot = Record<string, string>

async function snapshotProtected(projectDir: string): Promise<Snapshot> {
  const snap: Snapshot = {}
  const targets = [
    'lib/auth.ts',
    'lib/dashboard-middleware.ts',
    'lib/use-site-data.ts',
    'lib/blob-storage.ts',
    'lib/control-flags.ts',
    'lib/section-registry.ts',
    'lib/feature-registry.ts',
    'components/SectionRenderer.tsx',
    'components/features/FeatureHost.tsx',
    'middleware.ts',
    'public/dashboard/index.html',
    'public/dashboard/assets/app.js',
    'public/dashboard/assets/styles.css',
    'app/api/site-data/route.ts',
    'app/api/save-config/route.ts',
    'app/api/leads/route.ts',
  ]
  for (const rel of targets) {
    try {
      snap[rel] = await fsp.readFile(path.join(projectDir, rel), 'utf-8')
    } catch {}
  }
  return snap
}

async function verifyProtected(projectDir: string, snap: Snapshot): Promise<string[]> {
  const changed: string[] = []
  for (const [rel, content] of Object.entries(snap)) {
    try {
      const now = await fsp.readFile(path.join(projectDir, rel), 'utf-8')
      if (now !== content) changed.push(rel)
    } catch {
      changed.push(rel + ' (deleted)')
    }
  }
  return changed
}

async function revertProtected(projectDir: string, snap: Snapshot, rels: string[]) {
  for (const rel of rels) {
    const clean = rel.replace(/ \(deleted\)$/, '')
    const content = snap[clean]
    if (content != null) {
      await fsp.writeFile(path.join(projectDir, clean), content, 'utf-8')
    }
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST { businessFolder, priorityFixes, trade? } to run one surgical fix pass.',
  })
}
