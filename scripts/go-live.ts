/**
 * Go-Live: attach a purchased domain to a built site's Vercel project.
 *
 * Usage (from Website Builder/):
 *   npx tsx scripts/go-live.ts <businessFolder> <domain> [--primary]
 *
 * Example:
 *   npx tsx scripts/go-live.ts missions_ablaze missionsablaze.co.za --primary
 *
 * What it does:
 *   1. Adds the domain to the site's Vercel project and triggers verification
 *   2. Writes the domain to trial_websites.registered_domain in Supabase
 *   3. Prints the DNS records the client's registrar must add
 *
 * Because site URLs are resolved at request time from the Host header
 * (lib/site-url.ts), NO rebuild is required — canonical / sitemap / llms.txt
 * flip to the new domain on the next request.
 *
 * --primary also sets the domain as the Vercel project's primary so the old
 * trial URL 301-redirects to it (preserves SEO + AI-crawler ranking).
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const VERCEL_API = 'https://api.vercel.com'
const WEBSITES_FOLDER =
  process.env.WEBSITES_FOLDER || 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

function getVercelToken(): string | null {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN
  try {
    const authPath = path.join(process.env.USERPROFILE || '', '.local', 'share', 'com.vercel.cli', 'auth.json')
    if (fs.existsSync(authPath)) {
      const parsed = JSON.parse(fs.readFileSync(authPath, 'utf-8'))
      if (parsed.token) return parsed.token
    }
  } catch {}
  // Windows default location
  try {
    const winPath = path.join(process.env.USERPROFILE || '', '.vercel', 'auth.json')
    if (fs.existsSync(winPath)) {
      const parsed = JSON.parse(fs.readFileSync(winPath, 'utf-8'))
      if (parsed.token) return parsed.token
    }
  } catch {}
  return null
}

async function vercel(pathname: string, init?: RequestInit) {
  const token = getVercelToken()
  if (!token) throw new Error('No Vercel credentials. Run `vercel login` or set VERCEL_TOKEN.')
  const res = await fetch(`${VERCEL_API}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const text = await res.text()
  let json: any = {}
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { ok: res.ok, status: res.status, json }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--primary')
  const setPrimary = process.argv.includes('--primary')
  const [businessFolder, domain] = args

  if (!businessFolder || !domain) {
    console.error('Usage: npx tsx scripts/go-live.ts <businessFolder> <domain> [--primary]')
    console.error(' e.g.: npx tsx scripts/go-live.ts missions_ablaze missionsablaze.co.za --primary')
    process.exit(1)
  }

  const sitePath = path.join(WEBSITES_FOLDER, businessFolder)
  const projectFile = path.join(sitePath, '.vercel', 'project.json')
  const configFile = path.join(sitePath, 'site-config.json')

  if (!fs.existsSync(projectFile)) {
    console.error(`Not a deployed site: ${projectFile} missing. Deploy it first.`)
    process.exit(1)
  }
  const { projectId, projectName } = JSON.parse(fs.readFileSync(projectFile, 'utf-8'))
  console.log(`Project : ${projectName} (${projectId})`)
  console.log(`Domain  : ${domain}`)
  console.log('')

  // 1. Attach the domain
  console.log('[1/3] Attaching domain to Vercel…')
  let attach = await vercel(`/v9/projects/${projectId}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  })
  if (!attach.ok && attach.json?.error?.code === 'domain_already_exists') {
    console.log('      already attached.')
    attach = { ok: true, status: 200, json: { name: domain } }
  } else if (!attach.ok) {
    // maybe it exists on the team — try the project-scoped endpoint
    console.log(`      attach returned ${attach.status}: ${JSON.stringify(attach.json).slice(0, 200)}`)
    const alt = await vercel(`/v9/projects/${projectId}/domains/${domain}`)
    if (alt.ok) {
      console.log('      found on project already.')
      attach = alt
    } else {
      console.error('      FAILED to attach domain.')
      process.exit(1)
    }
  } else {
    console.log(`      attached: ${attach.json?.name || domain}`)
  }

  // 2. Trigger verification
  console.log('[2/3] Verifying…')
  const verify = await vercel(`/v9/projects/${projectId}/domains/${domain}/verify`, { method: 'POST' })
  if (verify.ok) {
    console.log(`      verification status: ${verify.json?.verification?.[0]?.reason || verify.json?.status || 'sent'}`)
  } else {
    console.log(`      verify returned ${verify.status} (may need DNS first)`)
  }

  // Optional: set as primary so old trial URL 301s here
  if (setPrimary) {
    console.log('      setting as primary domain…')
    const prim = await vercel(`/v9/projects/${projectId}/domains/${domain}`, {
      method: 'PATCH',
      body: JSON.stringify({ primary: true }),
    })
    console.log(prim.ok ? '      primary set — old URLs will 301 here.' : `      primary set failed: ${prim.status}`)
  }

  // 3. Record in Supabase
  console.log('[3/3] Recording in trial_websites.registered_domain…')
  const supabase = getSupabase()
  let cfg: any = {}
  if (fs.existsSync(configFile)) {
    try {
      cfg = JSON.parse(fs.readFileSync(configFile, 'utf-8').replace(/^\uFEFF/, ''))
    } catch {}
  }

  const update: Record<string, unknown> = {
    registered_domain: domain,
    domain: domain,
    updated_at: new Date().toISOString(),
  }

  let { data, error } = await supabase
    .from('trial_websites')
    .update(update)
    .eq('vercel_project_id', projectId)
    .select('id, business_name, registered_domain')

  if (error || !data || data.length === 0) {
    // fall back to business_name match
    const r2 = await supabase
      .from('trial_websites')
      .update(update)
      .ilike('business_name', `%${cfg.businessName || businessFolder}%`)
      .select('id, business_name, registered_domain')
    data = r2.data
    error = r2.error
  }

  if (error) {
    console.error('      Supabase update failed:', error.message)
  } else if (!data || data.length === 0) {
    console.warn('      no trial_websites row matched — set registered_domain manually.')
  } else {
    for (const row of data) {
      console.log(`      updated ${row.business_name} -> ${row.registered_domain}`)
    }
  }

  console.log('')
  console.log('─── DNS the client must add at their registrar ───')
  console.log(`   A      @        76.76.21.21`)
  console.log(`   CNAME  www      cname.vercel-dns.com`)
  console.log('')
  console.log('Next steps:')
  console.log('  1. Client adds the two records above at their registrar.')
  console.log('  2. Once verified in Vercel, the site serves on https://' + domain)
  console.log('  3. Canonical / sitemap / llms.txt flip automatically (no rebuild needed).')
  if (!setPrimary) {
    console.log('  4. Re-run with --primary to 301 the old trial URL here (preserves SEO).')
  }
}

main().catch((err) => {
  console.error('go-live failed:', err)
  process.exit(1)
})
