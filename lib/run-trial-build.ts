/**
 * Full trial website pipeline: scrape → build → QA → deploy → notify.
 * Used by the sequential build queue — ONE job at a time.
 */

import { enqueueBuild, setBuildRunner, formatDuration, type BuildJob } from './build-queue'
import { parseJsonSafe } from './utils'

export interface RunTrialResult {
  success: boolean
  durationMs: number
  durationLabel: string
  error?: string
  url?: string
}

/** Register the runner (called from build-trial route on first import). */
export function initBuildQueueRunner(baseUrl: string) {
  setBuildRunner(async (job: BuildJob) => {
    const result = await executeTrialBuild(baseUrl, job)
    // Queue treats a throw as failure and stops the chain — never silent-fail.
    if (!result.success) {
      throw new Error(result.error || 'Build failed')
    }
  })
}

export async function executeTrialBuild(
  baseUrl: string,
  job: BuildJob
): Promise<RunTrialResult> {
  const startedAt = Date.now()
  const { trialWebsiteId, businessName, contactId } = job
  const businessFolder = job.businessFolder

  const finish = async (
    status: 'complete' | 'failed',
    extra: Record<string, unknown> = {}
  ): Promise<RunTrialResult> => {
    const durationMs = Date.now() - startedAt
    const durationLabel = formatDuration(durationMs)

    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      await supabase
        .from('trial_websites')
        .update({
          build_status: status,
          error_message: status === 'failed' ? (extra.error_message as string) || null : null,
          ...(status === 'complete' ? { client_status: 'ready' } : {}),
          ...('build_duration_ms' in extra ? { build_duration_ms: durationMs } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', trialWebsiteId)

      if (contactId) {
        // Never hide the lead — PreTrial (ready_to_send) until a real trial email is sent
        await supabase
          .from('contacts')
          .update({ contact_status: 'ready_to_send', has_trial_website: true })
          .eq('id', contactId)
        await supabase.from('timeline_entries').insert({
          contact_id: contactId,
          event_type: status === 'complete' ? 'build_complete' : 'build_failed',
          event_title:
            status === 'complete'
              ? `Website build finished in ${durationLabel}`
              : `Website build failed after ${durationLabel}`,
          event_detail:
            status === 'complete'
              ? `Full pipeline (scrape → generate → build → deploy) took ${durationLabel}.`
              : String((extra.error_message as string) || 'Build failed'),
          source_app: 'Website Builder',
        })
      }
    } catch (err) {
      console.warn('[RunTrialBuild] status update failed:', err)
    }

    return {
      success: status === 'complete',
      durationMs,
      durationLabel,
      error: status === 'failed' ? String((extra.error_message as string) || 'Build failed') : undefined,
      url: (extra.url as string) || undefined,
    }
  }

  try {
    console.log(`[RunTrialBuild] ▶ ${businessName} starting (${trialWebsiteId})`)

    // Always talk to the local builder for internal pipeline steps
    const internalBase =
      process.env.BUILDER_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000'
    const base = internalBase.replace(/\/$/, '')

    let buildFolder = businessFolder

    // ── Phase 1: scrape + generate config (skip for Phase 2 Build) ────────
    if (!job.skipScrape) {
      const buildSiteRes = await fetch(`${base}/api/build-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: job.businessName,
          ownerName: job.ownerName,
          city: job.city,
          whatsappNumber: job.whatsappNumber,
          existingWebsiteUrl: job.existingWebsiteUrl,
          facebookUrl: job.facebookUrl,
          instagramUrl: job.instagramUrl,
          googleMapsUrl: job.googleMapsUrl,
          industry: job.industry,
          serviceAreas: job.serviceAreas,
          buildMode: 'TRIAL',
        }),
      })

      if (!buildSiteRes.ok) {
        const errText = await buildSiteRes.text()
        return await finish('failed', {
          error_message: `build-site returned ${buildSiteRes.status}: ${errText.slice(0, 300)}`,
        })
      }

      const buildSiteResult = await buildSiteRes.json()
      if (!buildSiteResult?.success) {
        return await finish('failed', {
          error_message: buildSiteResult?.error || 'build-site failed',
        })
      }

      buildFolder =
        buildSiteResult.buildFolder?.split(/[/\\]/).pop() || businessFolder

      console.log(`[RunTrialBuild] Config ready — slug ${buildSiteResult.buildSlug}`)
    } else {
      console.log(`[RunTrialBuild] Phase 2 only — using existing folder ${buildFolder} (no scrape)`)
    }

    // ── Phase 2: boilerplate + MiMo + QA + deploy (waits until fully done) ──
    // Long-running HTTP call — 90 min timeout so a full MiMo build can finish.
    // NOTE: undici's default bodyTimeout is 5 minutes, which aborted Phase 2
    // mid-build ("fetch failed" after ~395s). Use a long-timeout dispatcher.
    // The 30-min AbortController was also too short for slow builds (~31 min).
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90 * 60 * 1000)
    let buildWebsiteRes: Response
    try {
      let dispatcher: unknown
      try {
        const { Agent } = await import('undici')
        dispatcher = new Agent({
          headersTimeout: 90 * 60 * 1000,
          bodyTimeout: 90 * 60 * 1000,
          connectTimeout: 60 * 1000,
        })
      } catch {
        dispatcher = undefined
      }
      buildWebsiteRes = await fetch(`${base}/api/build-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessFolder: buildFolder,
          trialWebsiteId,
          waitForCompletion: true,
        }),
        signal: controller.signal,
        ...(dispatcher ? { dispatcher } : {}),
      } as RequestInit)
    } catch (fetchErr) {
      clearTimeout(timeout)
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
      return await finish('failed', {
        error_message: `build-website fetch failed after scrape succeeded: ${msg}. Website folder is saved — use Phase 2 Build.`,
      })
    }
    clearTimeout(timeout)

    if (!buildWebsiteRes.ok) {
      const errText = await buildWebsiteRes.text()
      return await finish('failed', {
        error_message: `build-website returned ${buildWebsiteRes.status}: ${errText.slice(0, 300)}`,
      })
    }

    const buildWebsiteResult = await buildWebsiteRes.json()

    // Pull live URL if deploy wrote one
    let url: string | undefined
    try {
      const { promises: fsp } = await import('fs')
      const path = await import('path')
      const websitesFolder =
        process.env.WEBSITES_FOLDER || path.join(process.cwd(), '..', 'Websites')
      const deployReport = path.join(websitesFolder, buildFolder, 'deploy-report.json')
      try {
        const raw = await fsp.readFile(deployReport, 'utf-8')
        const parsed = parseJsonSafe<{ url?: string }>(raw)
        if (parsed?.url) url = parsed.url
      } catch {}
    } catch {}

    const durationMs = Date.now() - startedAt
    const durationLabel = formatDuration(durationMs)
    console.log(`[RunTrialBuild] ✓ ${businessName} complete in ${durationLabel}`)

    // finish() also records duration on the trial row + timeline
    return await finish('complete', {
      url,
      build_duration_ms: durationMs,
      error_message: null,
    })
  } catch (err) {
    return await finish('failed', {
      error_message: err instanceof Error ? err.message : String(err),
    })
  }
}

export { enqueueBuild, formatDuration }
export type { BuildJob }
