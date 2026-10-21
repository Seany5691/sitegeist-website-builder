import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { deployToVercel, seedBlob } from '@/lib/vercel-deploy'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const WEBSITES_FOLDER =
  process.env.WEBSITES_FOLDER ||
  path.join(process.cwd(), '..', 'Websites')

/**
 * Manual re-deploy / deploy-only endpoint.
 *
 * POST { businessFolder, trialWebsiteId?, envVars?, skipSeed? }
 *
 * Used when a site is already built but not yet live (or needs a redeploy).
 * The normal build pipeline calls deployToVercel automatically after LLM Judge;
 * this route is for retries and ops.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const businessFolder = String(body.businessFolder || '').trim()
    const trialWebsiteId = body.trialWebsiteId ? String(body.trialWebsiteId) : null

    if (!businessFolder) {
      return NextResponse.json(
        { success: false, error: 'businessFolder is required' },
        { status: 400 }
      )
    }

    const clientPath = path.join(WEBSITES_FOLDER, businessFolder)
    try {
      await fs.access(clientPath)
    } catch {
      return NextResponse.json(
        { success: false, error: `Website folder not found: ${businessFolder}` },
        { status: 404 }
      )
    }

    // Load site config for buildSlug / business name
    let siteConfig: any = {}
    try {
      const rawCfg = await fs.readFile(path.join(clientPath, 'site-config.json'), 'utf-8')
      siteConfig = JSON.parse(rawCfg.replace(/^\uFEFF/, ''))
    } catch {}

    const bcrypt = await import('bcryptjs')
    const crypto = await import('crypto')
    const businessName = siteConfig.businessName || businessFolder
    const firstWord = businessName.split(/[\s&\-,]+/)[0].trim() || 'admin'
    const username = firstWord
    const password = `${firstWord}@${new Date().getFullYear()}!`
    const passwordHash = bcrypt.hashSync(password, 10)
    const passwordHashBase64 = Buffer.from(passwordHash, 'utf-8').toString('base64')
    const nextAuthSecret = crypto.randomBytes(32).toString('hex')

    const projectName = (siteConfig.buildSlug || businessFolder || 'site')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)

    // Tenant id for lead tracking (form_submissions.tenant_id = trial_websites.id)
    const tenantId = trialWebsiteId || siteConfig.tenantId || ''

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
        NEXT_PUBLIC_SITE_URL: `https://${projectName}.vercel.app`,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        TENANT_ID: tenantId,
        ...(body.envVars && typeof body.envVars === 'object' ? body.envVars : {}),
      },
    })

    if (deployResult.success && deployResult.url && trialWebsiteId) {
      const supabase = createClient()
      await supabase
        .from('trial_websites')
        .update({
          build_status: 'complete',
          trial_url: deployResult.url,
          vercel_project_id: deployResult.projectId || null,
          vercel_project_url: deployResult.projectUrl || null,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trialWebsiteId)

      // Timeline entry for GeistCRM
      try {
        const { data: trialRow } = await supabase
          .from('trial_websites')
          .select('contact_id, owner_name')
          .eq('id', trialWebsiteId)
          .maybeSingle()
        if (trialRow?.contact_id) {
          await supabase
            .from('contacts')
            .update({
              vercel_project_id: deployResult.projectId || null,
              vercel_project_url: deployResult.projectUrl || null,
            })
            .eq('id', trialRow.contact_id)
          await supabase.from('timeline_entries').insert({
            contact_id: trialRow.contact_id,
            event_type: 'trial_live',
            event_title: 'Trial website is live',
            event_detail: `Live URL: ${deployResult.url}\nDashboard: ${deployResult.url}/dashboard\nLogin: ${username} / ${password}`,
            source_app: 'Website Builder',
          })
        }

        // Internal notification to Sean
        const { sendBuildReadyEmail } = await import('@/lib/build-notify-email')
        await sendBuildReadyEmail({
          businessName,
          ownerName: trialRow?.owner_name || '',
          websiteUrl: deployResult.url,
          vercelUrl: deployResult.vercelUrl,
          dashboardUrl: `${deployResult.url}/dashboard`,
          username,
          password,
          contactId: trialRow?.contact_id || undefined,
          trialWebsiteId,
        })
      } catch {}
    } else if (deployResult.success && deployResult.url) {
      // No trial record — still notify (manual deploy)
      try {
        const { sendBuildReadyEmail } = await import('@/lib/build-notify-email')
        await sendBuildReadyEmail({
          businessName,
          websiteUrl: deployResult.url,
          vercelUrl: deployResult.vercelUrl,
          dashboardUrl: `${deployResult.url}/dashboard`,
          username,
          password,
        })
      } catch {}
    }

    return NextResponse.json({
      success: deployResult.success,
      url: deployResult.url,
      projectId: deployResult.projectId,
      projectName: deployResult.projectName,
      error: deployResult.error,
      dashboardLogin: deployResult.success ? { username, password } : undefined,
      logs: deployResult.logs.slice(-40),
    })
  } catch (error) {
    console.error('[DeploySite] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
