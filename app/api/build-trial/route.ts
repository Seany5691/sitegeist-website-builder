import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import {
  enqueueBuild,
  getQueueState,
  formatDuration,
  type BuildJob,
} from '@/lib/build-queue'
import { initBuildQueueRunner } from '@/lib/run-trial-build'

// ── Types ─────────────────────────────────────────────────────────────────

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
  /** Resume from Phase 2 only (skip scrape) — folder already has site-config */
  phase2?: boolean
  businessFolder?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────

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

function baseUrlFromRequest(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BUILDER_BASE_URL
  if (envUrl) return envUrl.replace(/\/$/, '')
  return request.nextUrl.origin
}

// ── POST /api/build-trial  (enqueue only — queue builds one at a time) ────

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
  } = body

  if (!trialWebsiteId || !businessName || !whatsappNumber) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required fields: trialWebsiteId, businessName, whatsappNumber.',
      },
      { status: 400 }
    )
  }

  const supabase = createClient()
  const baseUrl = baseUrlFromRequest(request)

  // Register queue runner
  initBuildQueueRunner(baseUrl)

  // Load the full trial row so Start Build never drops GeistTrack fields
  // (maps_url, socials, service areas, contact_id) even if the client sent a
  // partial body.
  const { data: trialRow } = await supabase
    .from('trial_websites')
    .select('*')
    .eq('id', trialWebsiteId)
    .maybeSingle()

  const merged = {
    businessName: body.businessName || trialRow?.business_name || businessName,
    ownerName: body.ownerName || trialRow?.owner_name || '',
    city: body.city || trialRow?.city || '',
    whatsappNumber: body.whatsappNumber || trialRow?.phone_number || whatsappNumber,
    existingWebsiteUrl:
      body.existingWebsiteUrl || trialRow?.existing_website_url || undefined,
    facebookUrl: body.facebookUrl || trialRow?.facebook_url || undefined,
    instagramUrl: body.instagramUrl || trialRow?.instagram_url || undefined,
    googleMapsUrl: body.googleMapsUrl || trialRow?.maps_url || undefined,
    industry: body.industry || trialRow?.industry || undefined,
    serviceAreas:
      body.serviceAreas ||
      (Array.isArray(trialRow?.service_areas) ? trialRow.service_areas : undefined),
    contactId: body.contactId || trialRow?.contact_id || undefined,
    businessFolder:
      (body as any).businessFolder?.split(/[/\\]/).pop() ||
      (body as any).buildFolder?.split(/[/\\]/).pop() ||
      (body as any).buildSlug ||
      trialRow?.build_folder?.split(/[/\\]/).pop() ||
      trialRow?.build_slug ||
      undefined,
  }

  // Phase 2 auto-detect: existing site-config means skip scrape
  let skipScrape = body.phase2 === true
  if (!skipScrape && merged.businessFolder) {
    const path = await import('path')
    const { promises: fsp } = await import('fs')
    const websitesFolder =
      process.env.WEBSITES_FOLDER || path.join(process.cwd(), '..', 'Websites')
    const folder = merged.businessFolder
    try {
      await fsp.access(path.join(websitesFolder, folder, 'site-config.json'))
      skipScrape = true
    } catch {
      try {
        await fsp.access(path.join(websitesFolder, folder, 'public', 'site-config.json'))
        skipScrape = true
      } catch {}
    }
  }

  // Mark this job as queued
  await updateBuildStatus(trialWebsiteId, 'queued')

  if (merged.contactId) {
    await supabase.from('timeline_entries').insert({
      contact_id: merged.contactId,
      event_type: 'build_progress',
      event_title: skipScrape ? 'Phase 2 build queued' : 'Website build queued',
      event_detail: skipScrape
        ? `Phase 2 queued for ${merged.businessName} (skip scrape — existing files). Builds run one at a time.`
        : `Queued for ${merged.businessName}. Builds run one at a time — you will get an email when it is live.`,
      source_app: 'Website Builder',
    })
  }

  const job: BuildJob = {
    trialWebsiteId,
    businessFolder:
      merged.businessFolder ||
      merged.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    businessName: merged.businessName,
    ownerName: merged.ownerName,
    city: merged.city,
    whatsappNumber: merged.whatsappNumber,
    existingWebsiteUrl: merged.existingWebsiteUrl,
    facebookUrl: merged.facebookUrl,
    instagramUrl: merged.instagramUrl,
    googleMapsUrl: merged.googleMapsUrl,
    industry: merged.industry,
    serviceAreas: merged.serviceAreas,
    contactId: merged.contactId,
    enqueuedAt: Date.now(),
    skipScrape,
  }

  // Enqueue THIS job only. Explicit Start Build = user intent.
  // Do not auto-resume other pending/queued rows — those stay for manual Start Build.
  const position = enqueueBuild(job)
  const queue = getQueueState()

  console.log(
    `[BuildTrial] Queued ${merged.businessName} (${trialWebsiteId})${skipScrape ? ' [PHASE 2]' : ''} — position ${position}, active=${queue.active}`
  )

  return NextResponse.json({
    success: true,
    queued: true,
    phase2: skipScrape,
    position,
    message: queue.active
      ? `${merged.businessName} added to the build queue (position ${position}). One site builds at a time — next starts only after this one fully completes.`
      : skipScrape
        ? `${merged.businessName} Phase 2 build started (skip scrape — using existing files).`
        : `${merged.businessName} build started (queue was empty).`,
    queue,
  })
}

// ── GET /api/build-trial  (queue status) ─────────────────────────────────

export async function GET() {
  initBuildQueueRunner('http://localhost:3000')
  return NextResponse.json({
    success: true,
    queue: getQueueState(),
    formatDuration: formatDuration(0), // smoke: "0s" — timing helper is in use
  })
}
