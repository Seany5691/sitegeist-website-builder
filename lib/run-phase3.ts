/**
 * Phase 3 — post-build only: QA → LLM Judge → Vercel deploy → Blob seed → notify.
 * Used when the site is already generated (npm build passed) but the pipeline
 * never finished (e.g. MiMo hung on a smoke test).
 */

import path from 'path'
import { promises as fsp } from 'fs'

export interface Phase3Options {
  /** Folder name under Websites/ e.g. missions_ablaze */
  businessFolder: string
  businessName: string
  trialWebsiteId?: string
  contactId?: string
  archetype?: string
}

export interface Phase3Result {
  success: boolean
  url?: string
  vercelUrl?: string
  llmJudgeScore?: number | null
  durationLabel?: string
  error?: string
  logs: string[]
}

function log(logs: string[], msg: string) {
  console.log(`[Phase3] ${msg}`)
  logs.push(msg)
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(1, Math.round(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export async function runPhase3(options: Phase3Options): Promise<Phase3Result> {
  const logs: string[] = []
  const started = Date.now()
  const websitesFolder =
    process.env.WEBSITES_FOLDER || path.join(process.cwd(), '..', 'Websites')
  const clientPath = path.join(websitesFolder, options.businessFolder)
  const { businessName, trialWebsiteId, contactId } = options

  try {
    await fsp.access(clientPath)
  } catch {
    return {
      success: false,
      error: `Folder not found: ${clientPath}`,
      logs,
    }
  }

  // Credentials — same scheme as the rest of the pipeline
  const bcrypt = await import('bcryptjs')
  const crypto = await import('crypto')
  const firstWord = businessName.split(/[\s&\-,]+/)[0].trim() || 'admin'
  const username = firstWord
  const password = `${firstWord}@${new Date().getFullYear()}!`
  const passwordHash = bcrypt.hashSync(password, 10)
  const passwordHashBase64 = Buffer.from(passwordHash, 'utf-8').toString('base64')
  const nextAuthSecret = crypto.randomBytes(32).toString('hex')

  const projectName = (options.businessFolder || 'site')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  let llmJudgeResult: any = null

  // ── 1. Post-build cleanup + rule-based QA ────────────────────────────────
  try {
    log(logs, 'Running post-build cleanup + QA...')
    const { runPostBuildCleanup } = await import('@/lib/post-build-cleanup')
    const cleanup = await runPostBuildCleanup(clientPath)
    if (cleanup.qaScore) {
      log(logs, `QA score: ${cleanup.qaScore.overall}/10`)
    }
    if (cleanup.errors.length > 0) {
      log(logs, `Cleanup warnings: ${cleanup.errors.slice(0, 5).join(', ')}`)
    }
  } catch (err) {
    log(logs, `Cleanup failed (non-blocking): ${err}`)
  }

  // ── 2. LLM Judge ────────────────────────────────────────────────────────
  try {
    log(logs, 'Running LLM Judge...')
    const { judgeWebsite } = await import('@/lib/llm-judge')
    llmJudgeResult = await judgeWebsite({
      projectDir: clientPath,
      businessName,
      archetype: options.archetype || 'general',
      maxAttempts: 1,
    })
    log(logs, `LLM Judge: ${llmJudgeResult.score}/10 — ${llmJudgeResult.recommendation}`)
  } catch (err) {
    log(logs, `LLM Judge failed (non-blocking): ${err}`)
  }

  // ── 3. Vercel deploy + Blob seed ────────────────────────────────────────
  log(logs, 'Deploying to Vercel...')
  const { deployToVercel } = await import('@/lib/vercel-deploy')
  const deployResult = await deployToVercel({
    projectDir: clientPath,
    projectName,
    domainLabel: businessName,
    envVars: {
      DASHBOARD_USERNAME: username,
      DASHBOARD_PASSWORD_HASH_BASE64: passwordHashBase64,
      NEXTAUTH_SECRET: nextAuthSecret,
      NEXTAUTH_URL: `https://${projectName}.vercel.app`,
      RESEND_API_KEY: process.env.RESEND_API_KEY || '',
      EMAIL_FROM:
        process.env.EMAIL_FROM || `Website Enquiries <no-reply@sitespire.co.za>`,
      CONTACT_FORM_FALLBACK_TO: process.env.CONTACT_FORM_FALLBACK_TO || '',
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
      TENANT_ID: trialWebsiteId || options.businessFolder || '',
    },
  })

  const durationLabel = formatDuration(Date.now() - started)

  if (!deployResult.success || !deployResult.url) {
    log(logs, `Deploy failed: ${deployResult.error}`)
    // Keep lead visible on PreTrial
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      if (trialWebsiteId) {
        await supabase
          .from('trial_websites')
          .update({
            build_status: 'failed',
            error_message: `Phase 3 deploy failed: ${deployResult.error}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', trialWebsiteId)
      }
      if (contactId) {
        await supabase
          .from('contacts')
          .update({ contact_status: 'ready_to_send', has_trial_website: true })
          .eq('id', contactId)
        await supabase.from('timeline_entries').insert({
          contact_id: contactId,
          event_type: 'deploy_failed',
          event_title: 'Phase 3 deploy failed',
          event_detail: deployResult.error || 'Unknown deploy error',
          source_app: 'Website Builder',
        })
      }
    } catch {}
    return {
      success: false,
      error: deployResult.error || 'Deploy failed',
      durationLabel,
      logs: [...logs, ...deployResult.logs],
    }
  }

  // ── 4. Update CRM + write deploy report ─────────────────────────────────
  try {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    if (trialWebsiteId) {
      await supabase
        .from('trial_websites')
        .update({
          build_status: 'complete',
          trial_url: deployResult.url,
          vercel_project_id: deployResult.projectId || null,
          vercel_project_url: deployResult.projectUrl || null,
          client_status: 'ready',
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trialWebsiteId)
    }
    if (contactId) {
      await supabase
        .from('contacts')
        .update({
          contact_status: 'ready_to_send',
          has_trial_website: true,
          vercel_project_id: deployResult.projectId || null,
          vercel_project_url: deployResult.projectUrl || null,
        })
        .eq('id', contactId)
      await supabase.from('timeline_entries').insert({
        contact_id: contactId,
        event_type: 'trial_live',
        event_title: 'Trial website is live (Phase 3)',
        event_detail: `Live URL: ${deployResult.url}\nDashboard: ${deployResult.url}/dashboard\nLogin: ${username} / ${password}\nLLM Judge: ${llmJudgeResult?.score ?? 'n/a'}/10\nPhase 3 took ${durationLabel}`,
        source_app: 'Website Builder',
      })
    }
    await fsp.writeFile(
      path.join(clientPath, 'deploy-report.json'),
      JSON.stringify(
        {
          url: deployResult.url,
          vercelUrl: deployResult.vercelUrl,
          customDomain: deployResult.customDomain,
          projectId: deployResult.projectId,
          projectName: deployResult.projectName,
          dashboardLogin: { username, password },
          llmJudgeScore: llmJudgeResult?.score ?? null,
          phase: 3,
          durationLabel,
          deployedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf-8'
    )
  } catch (err) {
    log(logs, `CRM/report update warning: ${err}`)
  }

  // ── 5. Notify Sean ──────────────────────────────────────────────────────
  try {
    const { sendBuildReadyEmail } = await import('@/lib/build-notify-email')
    await sendBuildReadyEmail({
      businessName,
      websiteUrl: deployResult.url,
      vercelUrl: deployResult.vercelUrl,
      dashboardUrl: `${deployResult.url}/dashboard`,
      username,
      password,
      contactId,
      trialWebsiteId,
      llmJudgeScore: llmJudgeResult?.score ?? null,
      llmJudgeRecommendation: llmJudgeResult?.recommendation,
      buildDuration: durationLabel,
    })
    log(logs, 'Build-ready email sent')
  } catch (err) {
    log(logs, `Email warning: ${err}`)
  }

  log(logs, `Live at ${deployResult.url} (${durationLabel})`)
  return {
    success: true,
    url: deployResult.url,
    vercelUrl: deployResult.vercelUrl,
    llmJudgeScore: llmJudgeResult?.score ?? null,
    durationLabel,
    logs: [...logs, ...deployResult.logs],
  }
}
