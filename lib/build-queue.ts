/**
 * Sequential website build queue.
 *
 * Only ONE site builds at a time (scrape → MiMo → QA → deploy → email).
 * Jobs start ONLY when explicitly enqueued (Start Build / Phase 2 button).
 * The next job starts automatically only after the previous one FULLY succeeds.
 * On failure the queue stops — remaining jobs stay waiting so you can inspect
 * and restart manually.
 *
 * This module holds a process-local queue. On the local Website Builder that is
 * fine — if the process restarts, rows still marked `queued` can be re-queued
 * with resumeInterruptedBuilds(), but that must never auto-start `pending`
 * items (those wait for a human click).
 */

export interface BuildJob {
  trialWebsiteId: string
  businessFolder: string
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
  enqueuedAt: number
  /** Skip scrape/config — resume from Phase 2 (boilerplate + MiMo) */
  skipScrape?: boolean
}

/** Runner must THROW on failure so the queue does not treat it as success. */
type Runner = (job: BuildJob) => Promise<void>

let active = false
let currentJob: BuildJob | null = null
const waiting: BuildJob[] = []
let runner: Runner | null = null
/** Set when a job fails — blocks auto-start of the next job until cleared. */
let halted = false

export function setBuildRunner(fn: Runner) {
  runner = fn
}

export function getQueueState() {
  return {
    active,
    halted,
    current: currentJob
      ? {
          trialWebsiteId: currentJob.trialWebsiteId,
          businessName: currentJob.businessName,
          startedAt: currentJob.enqueuedAt,
        }
      : null,
    waiting: waiting.map(j => ({
      trialWebsiteId: j.trialWebsiteId,
      businessName: j.businessName,
      enqueuedAt: j.enqueuedAt,
      skipScrape: j.skipScrape === true,
    })),
  }
}

export function enqueueBuild(job: BuildJob): number {
  // De-dupe: same trial id already waiting — but upgrade to Phase 2 if requested
  const idx = waiting.findIndex(j => j.trialWebsiteId === job.trialWebsiteId)
  if (idx >= 0) {
    if (job.skipScrape && !waiting[idx].skipScrape) {
      waiting[idx] = { ...waiting[idx], ...job, skipScrape: true }
      console.log(`[BuildQueue] Upgraded waiting job ${job.businessName} to Phase 2 (no scrape)`)
    }
    // Explicit Start Build clears a previous failure halt
    halted = false
    void pump()
    return waiting.length
  }
  if (currentJob?.trialWebsiteId === job.trialWebsiteId) {
    return waiting.length
  }
  waiting.push(job)
  console.log(
    `[BuildQueue] Queued ${job.businessName} (${job.trialWebsiteId})${job.skipScrape ? ' [PHASE 2]' : ''} — position ${waiting.length}, running=${active}`
  )
  // Explicit enqueue = user intent → allow the queue to run
  halted = false
  void pump()
  return waiting.length
}

/**
 * Re-queue jobs that were already started (status `queued`) after a restart.
 * Never auto-starts `pending` items — those need a human Start Build click.
 * Does NOT pump; call startNextQueued() or enqueueBuild() to run.
 */
export async function resumeInterruptedBuilds(loadJobs: () => Promise<BuildJob[]>) {
  try {
    const jobs = await loadJobs()
    let added = 0
    for (const job of jobs) {
      const idx = waiting.findIndex(j => j.trialWebsiteId === job.trialWebsiteId)
      if (idx >= 0 || currentJob?.trialWebsiteId === job.trialWebsiteId) continue
      waiting.push(job)
      added++
    }
    if (added > 0) {
      console.log(
        `[BuildQueue] Restored ${added} interrupted build(s) to the waiting list (not auto-started — use Start Build)`
      )
    }
  } catch (err) {
    console.warn('[BuildQueue] resumeInterruptedBuilds failed:', err)
  }
}

/** Start the next waiting job if idle (e.g. after clearing a failure halt). */
export function startNextQueued(): boolean {
  halted = false
  void pump()
  return active || waiting.length > 0
}

async function pump() {
  if (active) return
  if (halted) {
    console.log('[BuildQueue] Queue halted after a failure — waiting for explicit Start Build')
    return
  }
  if (!runner) {
    console.warn('[BuildQueue] No runner registered yet — will retry on next enqueue')
    return
  }

  active = true
  try {
    while (waiting.length > 0) {
      if (halted) {
        console.log('[BuildQueue] Stopping — previous job failed. Remaining jobs stay waiting.')
        break
      }
      const job = waiting.shift()!
      currentJob = job
      const started = Date.now()
      console.log(
        `[BuildQueue] ▶ START ${job.businessName} (${job.trialWebsiteId}) — ${waiting.length} still waiting`
      )
      try {
        await runner(job)
        const secs = Math.round((Date.now() - started) / 1000)
        console.log(`[BuildQueue] ✓ DONE ${job.businessName} in ${secs}s`)
      } catch (err) {
        const secs = Math.round((Date.now() - started) / 1000)
        console.error(`[BuildQueue] ✗ FAILED ${job.businessName} after ${secs}s:`, err)
        halted = true
      }
      currentJob = null
    }
  } finally {
    active = false
  }
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(1, Math.round(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
