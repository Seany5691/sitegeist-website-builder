import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────

interface BuildTrialBody {
  trialWebsiteId: string
  businessName: string
  ownerName: string
  city: string
  whatsappNumber: string
  existingWebsiteUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  googleMapsUrl?: string
  industry?: string
  serviceAreas?: string[]
  contactId?: string
}

// ── Helper: Update build status in Supabase ────────────────────────────────

async function updateBuildStatus(
  trialWebsiteId: string,
  buildStatus: string,
  extraFields: Record<string, unknown> = {}
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('trial_websites')
    .update({ build_status: buildStatus, ...extraFields })
    .eq('id', trialWebsiteId)

  if (error) {
    console.error(`[BuildTrial] Failed to update build_status to ${buildStatus}:`, error.message)
  }
}

// ── Helper: Write timeline entry ───────────────────────────────────────────

async function writeTimelineEntry(
  contactId: string,
  eventType: string,
  eventTitle: string,
  eventDetail?: string
) {
  const supabase = createClient()
  const { error } = await supabase.from('timeline_entries').insert({
    contact_id: contactId,
    event_type: eventType,
    event_title: eventTitle,
    event_detail: eventDetail || null,
    source_app: 'Website Builder',
  })

  if (error) {
    console.error(`[BuildTrial] Failed to write timeline entry:`, error.message)
  }
}

// ── POST /api/build-trial ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: BuildTrialBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const {
    trialWebsiteId,
    businessName,
    ownerName,
    city,
    whatsappNumber,
    existingWebsiteUrl,
    facebookUrl,
    instagramUrl,
    googleMapsUrl,
    industry,
    serviceAreas,
    contactId,
  } = body

  if (!trialWebsiteId || !businessName || !ownerName || !whatsappNumber) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: trialWebsiteId, businessName, ownerName, whatsappNumber.' },
      { status: 400 }
    )
  }

  // Build the base URL for internal API calls
  const host = request.headers.get('host') || 'localhost:3001'
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const baseUrl = `${protocol}://${host}`

  console.log(`[BuildTrial] Starting full build pipeline for: ${businessName} (trial: ${trialWebsiteId})`)

  // ── Step 1: Mark as scraping ─────────────────────────────────────────────

  await updateBuildStatus(trialWebsiteId, 'scraping')
  if (contactId) {
    await writeTimelineEntry(contactId, 'build_started', 'Website build started', `Scraping data for ${businessName}...`)
  }

  // ── Step 2: Call /api/build-site (scrape + generate config) ──────────────

  let buildSiteResult: Record<string, unknown> | null = null
  let buildSiteError: string | null = null

  try {
    console.log('[BuildTrial] Phase 1: Scraping and generating config...')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 600000) // 10 minute timeout for scraping
    
    const buildSiteRes = await fetch(`${baseUrl}/api/build-site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        businessName,
        ownerName,
        city,
        whatsappNumber,
        existingWebsiteUrl: existingWebsiteUrl || undefined,
        facebookUrl: facebookUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        googleMapsUrl: googleMapsUrl || undefined,
        industry: industry || undefined,
        buildMode: 'TRIAL',
        serviceAreas: serviceAreas || undefined,
      }),
    })
    
    clearTimeout(timeout)

    if (!buildSiteRes.ok) {
      const errText = await buildSiteRes.text()
      buildSiteError = `build-site returned ${buildSiteRes.status}: ${errText}`
    } else {
      buildSiteResult = await buildSiteRes.json()
      if (buildSiteResult && !buildSiteResult.success) {
        buildSiteError = (buildSiteResult.error as string) || 'build-site failed'
      }
    }
  } catch (err) {
    buildSiteError = `Failed to reach build-site: ${err instanceof Error ? err.message : 'Unknown error'}`
  }

  if (buildSiteError) {
    console.error(`[BuildTrial] Phase 1 failed: ${buildSiteError}`)
    await updateBuildStatus(trialWebsiteId, 'failed', { error_message: buildSiteError })
    if (contactId) {
      await writeTimelineEntry(contactId, 'build_failed', 'Website build failed', buildSiteError)
    }
    return NextResponse.json({ success: false, error: buildSiteError }, { status: 500 })
  }

  const buildSlug = buildSiteResult?.buildSlug as string
  const buildFolder = buildSiteResult?.buildFolder as string
  const config = buildSiteResult?.config

  console.log(`[BuildTrial] Phase 1 complete. Slug: ${buildSlug}`)

  // Update DB with config results
  const supabase = createClient()
  await supabase
    .from('trial_websites')
    .update({
      build_status: 'generating',
      build_slug: buildSlug,
      build_folder: buildFolder,
      site_config: config || null,
    })
    .eq('id', trialWebsiteId)

  // ── Step 3: Call /api/build-website (boilerplate + MiMo CLI) ─────────────

  await updateBuildStatus(trialWebsiteId, 'building')

  // Extract business folder name from build path
  const businessFolder = buildFolder ? buildFolder.split(/[/\\]/).pop() : buildSlug

  try {
    console.log(`[BuildTrial] Phase 2: Building website for folder: ${businessFolder}`)
    const buildWebsiteController = new AbortController()
    const buildWebsiteTimeout = setTimeout(() => buildWebsiteController.abort(), 120000) // 2 minute timeout
    
    const buildWebsiteRes = await fetch(`${baseUrl}/api/build-website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: buildWebsiteController.signal,
      body: JSON.stringify({
        businessFolder,
        trialWebsiteId,
      }),
    })
    
    clearTimeout(buildWebsiteTimeout)

    if (!buildWebsiteRes.ok) {
      const errText = await buildWebsiteRes.text()
      const errorMsg = `build-website returned ${buildWebsiteRes.status}: ${errText}`
      await updateBuildStatus(trialWebsiteId, 'failed', { error_message: errorMsg })
      if (contactId) {
        await writeTimelineEntry(contactId, 'build_failed', 'Website build failed', errorMsg)
      }
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
    }
  } catch (err) {
    const errorMsg = `Failed to reach build-website: ${err instanceof Error ? err.message : 'Unknown error'}`
    await updateBuildStatus(trialWebsiteId, 'failed', { error_message: errorMsg })
    if (contactId) {
      await writeTimelineEntry(contactId, 'build_failed', 'Website build failed', errorMsg)
    }
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }

  // ── Step 4: Return success (build continues in background) ───────────────

  console.log(`[BuildTrial] Build pipeline launched. MiMo Code CLI is building in background.`)

  if (contactId) {
    await writeTimelineEntry(
      contactId,
      'build_progress',
      'Website generation in progress',
      `Config generated. MiMo Code CLI is now building the website for ${businessName}.`
    )
  }

  return NextResponse.json({
    success: true,
    message: `Build pipeline launched for ${businessName}. Website is being generated in the background.`,
    trialWebsiteId,
    buildSlug,
    buildFolder,
  })
}
