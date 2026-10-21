import { NextRequest, NextResponse } from 'next/server'
import { runPhase3 } from '@/lib/run-phase3'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/build-phase3
 * { businessFolder, businessName?, trialWebsiteId?, contactId?, archetype? }
 *
 * Runs QA → LLM Judge → Vercel deploy → Blob seed → notify email
 * without scraping or regenerating the site.
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

    let businessName = String(body.businessName || '').trim()
    let contactId = body.contactId ? String(body.contactId) : undefined
    const trialWebsiteId = body.trialWebsiteId ? String(body.trialWebsiteId) : undefined

    // Fill gaps from Supabase
    if (trialWebsiteId) {
      try {
        const supabase = createClient()
        const { data: row } = await supabase
          .from('trial_websites')
          .select('business_name, contact_id, owner_name')
          .eq('id', trialWebsiteId)
          .maybeSingle()
        if (row) {
          businessName = businessName || row.business_name || businessFolder
          contactId = contactId || row.contact_id || undefined
        }
      } catch {}
    }
    if (!businessName) businessName = businessFolder

    const result = await runPhase3({
      businessFolder,
      businessName,
      trialWebsiteId,
      contactId,
      archetype: body.archetype,
    })

    return NextResponse.json({
      success: result.success,
      url: result.url,
      vercelUrl: result.vercelUrl,
      llmJudgeScore: result.llmJudgeScore,
      durationLabel: result.durationLabel,
      error: result.error,
      logs: result.logs.slice(-40),
    })
  } catch (error) {
    console.error('[Phase3] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
