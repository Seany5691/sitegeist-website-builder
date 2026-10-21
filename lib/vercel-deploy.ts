/**
 * Vercel deploy helper for generated websites.
 *
 * Uses the logged-in Vercel CLI auth (same session as `vercel whoami`) plus the
 * Vercel REST API to create a project, provision Blob storage, set env vars,
 * and deploy. After deploy, `seedBlob` uploads the initial config JSON files.
 *
 * Requires the Vercel CLI to be logged in on this machine (or VERCEL_TOKEN env).
 */

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const VERCEL_API = 'https://api.vercel.com'

export interface VercelDeployOptions {
  /** Absolute path to the generated site folder */
  projectDir: string
  /** Vercel project name (becomes https://<name>.vercel.app) */
  projectName: string
  /** Extra env vars to set on the project (production + preview) */
  envVars: Record<string, string>
  /** Skip `vercel deploy` (only provision project + blob + env) */
  skipDeploy?: boolean
  /**
   * Optional clean subdomain label for the public trial URL.
   * Result: https://<domainLabel>.<TRIAL_DOMAIN_SUFFIX>
   * Falls back to projectName when omitted.
   */
  domainLabel?: string
  /** Public suffix for trial subdomains. Default: sitespire.co.za */
  domainSuffix?: string
}

export interface VercelDeployResult {
  success: boolean
  projectId?: string
  projectName?: string
  /** Public URL written to GeistCRM (prefers custom subdomain) */
  url?: string
  /** Underlying *.vercel.app URL (always set on success) */
  vercelUrl?: string
  /** Vercel dashboard URL for the project (https://vercel.com/<team>/<project>) */
  projectUrl?: string
  /** Custom subdomain if one was attached */
  customDomain?: string
  blobToken?: string
  blobStoreId?: string
  deploymentId?: string
  error?: string
  logs: string[]
}

const DEFAULT_DOMAIN_SUFFIX =
  process.env.TRIAL_DOMAIN_SUFFIX || 'sitespire.co.za'

function log(logs: string[], msg: string) {
  console.log(`[VercelDeploy] ${msg}`)
  logs.push(msg)
}

/** Find the Vercel CLI OAuth access token (checked in the places `vercel` stores it). */
async function getVercelToken(): Promise<string | null> {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN

  // Ask the CLI to refresh the session first — the on-disk token can be
  // expired even while `vercel whoami` still works (it auto-refreshes).
  try {
    await new Promise<void>(resolve => {
      const child = spawn('vercel', ['whoami'], {
        shell: true,
        stdio: 'ignore',
        env: process.env,
      })
      const timer = setTimeout(() => {
        try { child.kill() } catch {}
        resolve()
      }, 15000)
      child.on('close', () => {
        clearTimeout(timer)
        resolve()
      })
      child.on('error', () => {
        clearTimeout(timer)
        resolve()
      })
    })
  } catch {
    // continue — still try to read auth files
  }

  const candidates = [
    path.join(process.env.APPDATA || '', 'xdg.data', 'com.vercel.cli', 'auth.json'),
    path.join(process.env.APPDATA || '', 'com.vercel.cli', 'Data', 'auth.json'),
    path.join(os.homedir(), '.vercel', 'auth.json'),
    path.join(os.homedir(), '.local', 'share', 'com.vercel.cli', 'auth.json'),
    path.join(os.homedir(), '.local', 'share', 'xdg.data', 'com.vercel.cli', 'auth.json'),
  ]

  // Prefer the token that actually works — the CLI keeps multiple copies and
  // one of them may be stale.
  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, 'utf-8')
      const parsed = JSON.parse(raw)
      if (!parsed?.token) continue
      const res = await fetch(`${VERCEL_API}/v2/user`, {
        headers: { Authorization: `Bearer ${parsed.token}` },
      })
      if (res.ok) return parsed.token
    } catch {
      // try next location
    }
  }
  return null
}

async function api<T = any>(
  token: string,
  method: string,
  pathname: string,
  body?: unknown,
  teamId?: string
): Promise<T> {
  const url = new URL(VERCEL_API + pathname)
  if (teamId) url.searchParams.set('teamId', teamId)

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || text || res.statusText
    throw new Error(`${method} ${pathname} failed (${res.status}): ${msg}`)
  }
  return data as T
}

/** Resolve the team id the CLI is currently scoped to (defaults to personal). */
async function resolveTeamId(token: string): Promise<string | null> {
  if (process.env.VERCEL_TEAM_ID) return process.env.VERCEL_TEAM_ID
  try {
    const teams = await api<{ teams: Array<{ id: string; slug: string }> }>(
      token,
      'GET',
      '/v2/teams'
    )
    if (teams?.teams?.length) {
      return teams.teams[0].id
    }
    return null
  } catch {
    return null
  }
}

function runCommand(
  cmd: string,
  args: string[],
  cwd: string,
  logs: string[],
  timeoutMs = 20 * 60 * 1000
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    log(logs, `$ ${cmd} ${args.join(' ')}`)
    const child = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      stderr += `\n[timeout after ${timeoutMs}ms]`
    }, timeoutMs)

    child.stdout?.on('data', d => {
      const s = String(d)
      stdout += s
      process.stdout.write(`[vercel] ${s}`)
    })
    child.stderr?.on('data', d => {
      const s = String(d)
      stderr += s
      process.stderr.write(`[vercel] ${s}`)
    })
    child.on('close', code => {
      clearTimeout(timer)
      resolve({ code: code ?? 1, stdout, stderr })
    })
    child.on('error', err => {
      clearTimeout(timer)
      stderr += String(err)
      resolve({ code: 1, stdout, stderr })
    })
  })
}

/**
 * Ensure a Blob store exists for this site and is connected to the project.
 * Connection injects BLOB_READ_WRITE_TOKEN + BLOB_STORE_ID into the project.
 * Returns the plaintext read-write token so we can seed immediately.
 */
async function provisionBlob(
  token: string,
  teamId: string | null,
  projectId: string,
  projectName: string,
  logs: string[]
): Promise<{ blobToken: string; blobStoreId: string }> {
  const qs = teamId ? `?teamId=${teamId}` : ''

  // Reuse an existing store already connected to this project if present
  const existing = await api<{ envs: Array<{ id: string; key: string }> }>(
    token,
    'GET',
    `/v9/projects/${projectId}/env`,
    undefined,
    teamId || undefined
  )
  const existingTokenEnv = existing.envs?.find(e => e.key === 'BLOB_READ_WRITE_TOKEN')
  const existingStoreEnv = existing.envs?.find(e => e.key === 'BLOB_STORE_ID')

  if (existingTokenEnv) {
    const detail = await api<{ value?: string }>(
      token,
      'GET',
      `/v9/projects/${projectId}/env/${existingTokenEnv.id}`,
      undefined,
      teamId || undefined
    )
    const storeDetail = existingStoreEnv
      ? await api<{ value?: string }>(
          token,
          'GET',
          `/v9/projects/${projectId}/env/${existingStoreEnv.id}`,
          undefined,
          teamId || undefined
        )
      : null
    if (detail?.value) {
      log(logs, `Reusing existing Blob store for ${projectName}`)
      return {
        blobToken: detail.value,
        blobStoreId: storeDetail?.value || '',
      }
    }
  }

  // Create a dedicated Blob store for this site
  const storeName = `${projectName.slice(0, 40)}-blob`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  log(logs, `Creating Blob store: ${storeName}`)
  const store = await api<{ store: { id: string } }>(
    token,
    'POST',
    `/v1/storage/stores/blob${qs}`,
    { name: storeName, type: 'blob', access: 'public' },
    teamId || undefined
  )
  const storeId = store.store.id

  // Connect store → project (injects BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID)
  log(logs, `Connecting Blob store ${storeId} to project ${projectId}`)
  await api(
    token,
    'POST',
    `/v1/storage/stores/${storeId}/connections${qs}`,
    {
      projectId,
      environments: ['production', 'preview', 'development'],
    },
    teamId || undefined
  )

  // Read the injected token back so we can seed
  const envsAfter = await api<{ envs: Array<{ id: string; key: string }> }>(
    token,
    'GET',
    `/v9/projects/${projectId}/env`,
    undefined,
    teamId || undefined
  )
  const tokenEnv = envsAfter.envs?.find(e => e.key === 'BLOB_READ_WRITE_TOKEN')
  if (!tokenEnv) throw new Error('BLOB_READ_WRITE_TOKEN was not injected after Blob connection')

  const detail = await api<{ value?: string }>(
    token,
    'GET',
    `/v9/projects/${projectId}/env/${tokenEnv.id}`,
    undefined,
    teamId || undefined
  )
  if (!detail?.value) throw new Error('Could not read BLOB_READ_WRITE_TOKEN value')

  return { blobToken: detail.value, blobStoreId: storeId }
}

async function setEnvVars(
  token: string,
  teamId: string | null,
  projectId: string,
  envVars: Record<string, string>,
  logs: string[]
) {
  const existing = await api<{ envs: Array<{ id: string; key: string }> }>(
    token,
    'GET',
    `/v9/projects/${projectId}/env`,
    undefined,
    teamId || undefined
  )
  const byKey = new Map(existing.envs?.map(e => [e.key, e.id]) || [])

  for (const [key, value] of Object.entries(envVars)) {
    if (!value) continue
    const id = byKey.get(key)
    try {
      if (id) {
        await api(
          token,
          'PATCH',
          `/v9/projects/${projectId}/env/${id}`,
          { value, type: 'encrypted' },
          teamId || undefined
        )
        log(logs, `Updated env: ${key}`)
      } else {
        await api(
          token,
          'POST',
          `/v9/projects/${projectId}/env`,
          {
            key,
            value,
            type: 'encrypted',
            target: ['production', 'preview'],
          },
          teamId || undefined
        )
        log(logs, `Set env: ${key}`)
      }
    } catch (err) {
      log(logs, `WARN could not set ${key}: ${(err as Error).message}`)
    }
  }
}

/**
 * Attach `<label>.<suffix>` to a Vercel project so the site is reachable at
 * the professional trial URL (e.g. mamma-mia.sitespire.co.za).
 * Uses the wildcard DNS already configured at Cloudflare.
 */
async function attachCustomDomain(
  token: string,
  teamId: string | null,
  projectId: string,
  domainLabel: string,
  domainSuffix: string,
  logs: string[]
): Promise<string | null> {
  // Clean label: "Mamma & Mia" → "mamma-mia"
  let label = domainLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  if (!label) return null

  const candidates = [label, `${label}-2`, `${label}-${Date.now().toString(36).slice(-4)}`]

  for (const candidate of candidates) {
    const domain = `${candidate}.${domainSuffix}`
    try {
      // Already attached?
      try {
        const existing = await api<{ name: string }>(
          token,
          'GET',
          `/v9/projects/${projectId}/domains/${domain}`,
          undefined,
          teamId || undefined
        )
        if (existing?.name) {
          log(logs, `Domain already attached: ${domain}`)
          return domain
        }
      } catch {
        // not attached yet — add it
      }

      await api(
        token,
        'POST',
        `/v9/projects/${projectId}/domains`,
        {
          name: domain,
          // wildcard DNS is already in place; don't force git-linked deploys
          gitBranch: null,
        },
        teamId || undefined
      )
      log(logs, `Attached custom domain: ${domain}`)

      // Wait briefly for Vercel to issue the cert / mark it verified
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 2000))
        try {
          const check = await api<{
            verification?: Array<{ domain: string; reason?: string }>
          }>(
            token,
            'GET',
            `/v9/projects/${projectId}/domains/${domain}`,
            undefined,
            teamId || undefined
          )
          const verified =
            !check?.verification || check.verification.length === 0
          if (verified) {
            log(logs, `Domain verified: ${domain}`)
            return domain
          }
        } catch {
          // keep polling
        }
      }
      // Attached even if verification is still pending — DNS is wildcard
      return domain
    } catch (err) {
      const msg = (err as Error).message || ''
      // Domain already claimed by another project → try next candidate
      if (/already|taken|in use|not_available|conflict/i.test(msg)) {
        log(logs, `Domain ${domain} unavailable, trying next…`)
        continue
      }
      log(logs, `WARN domain attach failed for ${domain}: ${msg}`)
      return null
    }
  }
  return null
}

/** Upload seed config files into the site's Blob store. */
export async function seedBlob(
  projectDir: string,
  blobToken: string,
  logs: string[] = []
): Promise<boolean> {
  try {
    const { put } = await import('@vercel/blob')
    const publicDir = path.join(projectDir, 'public')
    const files = [
      'site-config.json',
      'image-map.json',
      'seo.json',
      'site-config-defaults.json',
    ]
    let ok = 0
    for (const filename of files) {
      const filePath = path.join(publicDir, filename)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        await put(filename, content, {
          access: 'public',
          contentType: 'application/json',
          token: blobToken,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
        })
        log(logs, `Seeded blob: ${filename}`)
        ok++
      } catch (err) {
        log(logs, `WARN seed skip ${filename}: ${(err as Error).message}`)
      }
    }
    return ok > 0
  } catch (err) {
    log(logs, `WARN blob seed failed: ${(err as Error).message}`)
    return false
  }
}

/**
 * Provision + deploy a generated site to Vercel.
 * Returns the production URL (https://<projectName>.vercel.app).
 */
export async function deployToVercel(
  options: VercelDeployOptions
): Promise<VercelDeployResult> {
  const logs: string[] = []
  const { projectDir, projectName, envVars } = options

  try {
    const token = await getVercelToken()
    if (!token) {
      return {
        success: false,
        error:
          'No Vercel credentials found. Run `vercel login` on this machine or set VERCEL_TOKEN.',
        logs,
      }
    }

    const teamId = await resolveTeamId(token)
    log(logs, `Using team: ${teamId || '(personal)'}`)

    // Sanitize project name (Vercel allows [a-z0-9-])
    const safeName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)

    // Ensure project exists
    let projectId = ''
    try {
      const proj = await api<{ id: string }>(
        token,
        'GET',
        `/v9/projects/${safeName}`,
        undefined,
        teamId || undefined
      )
      projectId = proj.id
      log(logs, `Project exists: ${safeName} (${projectId})`)
    } catch {
      const created = await api<{ id: string }>(
        token,
        'POST',
        `/v9/projects${teamId ? `?teamId=${teamId}` : ''}`,
        { name: safeName, framework: 'nextjs' }
      )
      projectId = created.id
      log(logs, `Created project: ${safeName} (${projectId})`)
    }

    // Write .vercel/project.json so `vercel deploy --cwd` links correctly
    const vercelDir = path.join(projectDir, '.vercel')
    await fs.mkdir(vercelDir, { recursive: true })
    await fs.writeFile(
      path.join(vercelDir, 'project.json'),
      JSON.stringify(
        {
          projectId,
          orgId: teamId || undefined,
          projectName: safeName,
        },
        null,
        2
      ),
      'utf-8'
    )

    // Blob store + env
    const { blobToken, blobStoreId } = await provisionBlob(
      token,
      teamId,
      projectId,
      safeName,
      logs
    )

    // Professional trial URL: https://<label>.sitespire.co.za (wildcard DNS)
    const domainSuffix = options.domainSuffix || DEFAULT_DOMAIN_SUFFIX
    const domainLabel = options.domainLabel || safeName
    const productionUrl = `https://${safeName}.vercel.app`

    // Attach custom domain early so NEXTAUTH_URL matches the public origin
    const customDomain = await attachCustomDomain(
      token,
      teamId,
      projectId,
      domainLabel,
      domainSuffix,
      logs
    )
    const publicUrl = customDomain
      ? `https://${customDomain}`
      : productionUrl

    const mergedEnv: Record<string, string> = {
      ...envVars,
      BLOB_READ_WRITE_TOKEN: blobToken,
      BLOB_STORE_ID: blobStoreId,
    }
    // NEXTAUTH_URL must match the live origin or dashboard cookies break
    mergedEnv.NEXTAUTH_URL = publicUrl

    await setEnvVars(token, teamId, projectId, mergedEnv, logs)

    if (options.skipDeploy) {
      return {
        success: true,
        projectId,
        projectName: safeName,
        url: publicUrl,
        vercelUrl: productionUrl,
        customDomain: customDomain || undefined,
        blobToken,
        blobStoreId,
        logs,
      }
    }

    // Deploy with the CLI (uses the same login the user already has)
    // .vercel/project.json (written above) tells the CLI which team/project to use
    log(logs, `Deploying ${safeName} to production...`)
    // Do NOT pass --cwd: paths with spaces ("Coding Projects") break the
    // Vercel CLI's chdir. runCommand already sets the process working directory.
    const deployArgs = ['deploy', '--prod', '--yes']
    const deploy = await runCommand('vercel', deployArgs, projectDir, logs, 25 * 60 * 1000)

    if (deploy.code !== 0) {
      return {
        success: false,
        projectId,
        projectName: safeName,
        error: `vercel deploy failed (exit ${deploy.code}): ${deploy.stderr.slice(-500)}`,
        logs,
      }
    }

    // Prefer the aliased production URL; fall back to CLI output
    let vercelUrl = productionUrl
    const urlMatch = deploy.stdout.match(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi)
    if (urlMatch?.length) {
      // last URL in output is usually the production alias
      vercelUrl = urlMatch[urlMatch.length - 1]
    }

    // Re-assert custom domain after deploy (cert issuance sometimes needs the
    // deployment to exist first)
    let finalDomain = customDomain
    if (!finalDomain) {
      finalDomain = await attachCustomDomain(
        token,
        teamId,
        projectId,
        domainLabel,
        domainSuffix,
        logs
      )
    }

    // Seed blob content so the live site has data immediately
    await seedBlob(projectDir, blobToken, logs)

    const url = finalDomain ? `https://${finalDomain}` : vercelUrl
    log(logs, `Live at ${url}`)
    return {
      success: true,
      projectId,
      projectName: safeName,
      projectUrl: `https://vercel.com/${process.env.VERCEL_TEAM_SLUG || 'seany5691s-projects'}/${safeName}`,
      url,
      vercelUrl,
      customDomain: finalDomain || undefined,
      blobToken,
      blobStoreId,
      logs,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    log(logs, `ERROR ${message}`)
    return { success: false, error: message, logs }
  }
}
