import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fsp } from 'fs'

export const dynamic = 'force-dynamic'

/**
 * POST /api/llm-judge — run the LLM Judge on a built site folder.
 * Body: { businessFolder: string, businessName?: string, archetype?: string }
 *
 * Same pipeline as the post-build judge: starts `next start` on a free port,
 * screenshots the pages, scores visual quality, returns the JudgeResult.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const businessFolder = String(body.businessFolder || '').trim()
    if (!businessFolder) {
      return NextResponse.json(
        { success: false, error: 'businessFolder is required' },
        { status: 400 }
      )
    }

    const websitesFolder =
      process.env.WEBSITES_FOLDER || path.join(process.cwd(), '..', 'Websites')
    const projectDir = path.join(websitesFolder, businessFolder)

    try {
      await fsp.access(projectDir)
    } catch {
      return NextResponse.json(
        { success: false, error: `Folder not found: ${businessFolder}` },
        { status: 404 }
      )
    }

    // Need a production build for `next start`
    const buildId = path.join(projectDir, '.next', 'BUILD_ID')
    let hasBuild = true
    try {
      await fsp.access(buildId)
    } catch {
      hasBuild = false
    }

    if (!hasBuild) {
      return NextResponse.json(
        {
          success: false,
          error: 'No production build found. Run Phase 2 Build first (or npm run build) so the judge can start the site.',
        },
        { status: 400 }
      )
    }

    // Business name / archetype from site-config when not provided
    let businessName = body.businessName || businessFolder
    let archetype = body.archetype || 'general'
    try {
      const raw = await fsp.readFile(path.join(projectDir, 'public', 'site-config.json'), 'utf-8')
      const cfg = JSON.parse(raw.replace(/^\uFEFF/, ''))
      if (cfg.businessName) businessName = cfg.businessName
      if (cfg.industry) {
        // Light mapping — judge only uses this for bias tracking / prompt label
        archetype = String(cfg.industry).toLowerCase().includes('plumb')
          ? 'trades'
          : String(cfg.industry).toLowerCase().includes('ready-mix') ||
              String(cfg.industry).toLowerCase().includes('concrete')
            ? 'trades'
            : archetype
      }
    } catch {}

    const { judgeWebsite } = await import('@/lib/llm-judge')
    const result = await judgeWebsite({
      projectDir,
      businessName,
      archetype,
      maxAttempts: 1,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[LLM Judge API] failed:', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'LLM Judge failed',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST { businessFolder } to run the LLM Judge on a built site.',
  })
}
