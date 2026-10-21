import path from 'path'
import { promises as fsp } from 'fs'
import { spawn } from 'child_process'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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

const FIXES = [
  {
    file: 'components/SectionRenderer.tsx',
    issue:
      'Every page contains 1-3 full-viewport-height blank cream blocks with only a faint circular watermark. Reads as broken lazy-loading and destroys whitespace rhythm.',
    change:
      'SectionRenderer is PROTECTED. Instead, fix this in the section components themselves and in app/globals.css: audit each section for min-h-screen / min-h-[80vh] / py-32 on empty containers. In components like Gallery, Blog, Team, Stats: return null when there is no content. Reduce decorative watermark overlays that cover full viewport height. Target max 120px padding between section heading and content.',
    dimension: 'whitespace',
    impact: 'high',
  },
  {
    file: 'components/Footer.tsx',
    issue:
      'Footer wordmark is pink/red on orange background — about 2:1 contrast, fails WCAG AA badly.',
    change:
      'Set footer wordmark to #FFFFFF at font-weight 700 on the orange background. Body copy to #fff or a very light color meeting 4.5:1. All footer links and text must meet 4.5:1 contrast.',
    dimension: 'contrast',
    impact: 'high',
  },
  {
    file: 'components/About.tsx',
    issue:
      'Stat tile shows "374min" unformatted. "Qualified Plumbers" text clipped by floating WhatsApp button.',
    change:
      'Format stat value and unit separately: large bold number + smaller muted unit (e.g. 374 + "min" below/next). Or show "Under 1 hour". Add pb-16 to the stats row so floating buttons never overlap card text.',
    dimension: 'layoutCraft',
    impact: 'high',
  },
  {
    file: 'components/Contact.tsx',
    issue:
      'Placeholder-only labels vanish on typing. No visible error styling. No success confirmation.',
    change:
      'Add persistent visible labels above each input with htmlFor/id. On invalid submit set aria-invalid and show inline red role="alert" message. Red border on invalid inputs. After success replace form with branded success panel.',
    dimension: 'states',
    impact: 'high',
  },
]

async function snapshotProtected(projectDir: string) {
  const snap: Record<string, string> = {}
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

async function main() {
  const projectDir =
    'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/rvs_plumbing_potchefstroom_klerksdorp'
  const businessFolder = 'rvs_plumbing_potchefstroom_klerksdorp'

  const snapshot = await snapshotProtected(projectDir)

  const fixList = FIXES.map(
    (f, i) =>
      `${i + 1}. FILE: ${f.file}
   ISSUE: ${f.issue}
   CHANGE: ${f.change}
   DIMENSION: ${f.dimension} | IMPACT: ${f.impact}`
  ).join('\n\n')

  const prompt = `You are a world-class web designer and front-end engineer.
Surgical improvements to a client website. Do NOT rebuild.

BUSINESS: RVS Plumbing Potchefstroom / Klerksdorp
TRADE: Plumbing Companies
BRAND PERSONALITY: professional
TARGET DESIGN SCORE: 8.5 / 10

APPLY EXACTLY THESE FIXES:

${fixList}

=== HARD RULES ===
1. ONLY edit the files listed above. Note: SectionRenderer.tsx is PROTECTED — fix empty-section issues in the section components themselves (Gallery, Blog, Team, etc.) and in app/globals.css instead.
2. NEVER modify: public/dashboard/**, app/dashboard/**, app/api/save-config|upload|auth|leads|site-data|blob-urls, lib/auth.ts, dashboard-middleware.ts, use-site-data.ts, blob-storage.ts, control-flags.ts, section-registry.ts, feature-registry.ts, components/SectionRenderer.tsx, components/features/FeatureHost.tsx, middleware.ts.
3. Keep all "use client" directives.
4. Keep imports of useSiteData, AnimateOnScroll working.
5. Do not rename files or exports. No new dependencies.
6. Use CSS tokens: --color-primary, --color-secondary, --color-accent, --color-bg, --color-text, --color-muted, --font-heading, --font-body.
7. Site MUST still compile.

=== QUALITY BAR ===
R100,000 website. Premium, intentional, confident. Generous but correct whitespace (not empty voids). Strong CTA contrast. Clear type hierarchy.

=== OUTPUT ===
List each file changed and a one-line summary.`

  console.log('[FixPass] Launching MiMo...')
  const bizFirst = 'RVS'
  const bizHash = bcrypt.hashSync(`RVS@${new Date().getFullYear()}!`, 10)

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
      resolve({ code: code ?? 1, output: out.slice(-3000) })
    })
  })

  console.log('[FixPass] MiMo exit', result.code)
  console.log('TAIL:\n', result.output.slice(-1200))

  // Verify protected
  const violations: string[] = []
  for (const [rel, content] of Object.entries(snapshot)) {
    try {
      const now = await fsp.readFile(path.join(projectDir, rel), 'utf-8')
      if (now !== content) violations.push(rel)
    } catch {
      violations.push(rel + ' (deleted)')
    }
  }
  if (violations.length > 0) {
    console.warn('[FixPass] PROTECTED VIOLATIONS:', violations)
  } else {
    console.log('[FixPass] Protected files intact ✓')
  }
}

main().catch((e) => {
  console.error('FAIL', e)
  process.exit(1)
})
