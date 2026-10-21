import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client for generated sites.
 * Uses the anon key — tenant scoping is enforced in code via env TENANT_ID.
 * Never expose service-role keys to client bundles.
 */
let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_*) in the environment.'
    )
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

/** Tenant id for this site deployment (= trial_websites.id). */
export function getTenantId(): string {
  const id = process.env.TENANT_ID
  if (!id) {
    throw new Error('TENANT_ID is not set. This site is not linked to a platform tenant.')
  }
  return id
}


// ── Privileged client ───────────────────────────────────────────────────────
// The anon key is server-side only (it never reaches the browser bundle), but
// the table-level RLS policies are permissive by design. Where a route must
// read leads, we prefer the service-role client so access is granted by the
// server and the row filter is the ONLY gate — and we still apply
// .eq('tenant_id', …) on every query as defence in depth.
//
// Falls back to the anon client when SUPABASE_SERVICE_ROLE_KEY is not set, so
// behaviour is unchanged until that env var is added. Nothing breaks either way.

let adminClient: SupabaseClient | null = null
let adminWarned = false

export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL in the environment.')
  }

  if (serviceKey) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    return adminClient
  }

  // Graceful degradation: behave exactly as before, but say so loudly once.
  if (!adminWarned) {
    adminWarned = true
    console.warn(
      '[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set — falling back to the anon client. ' +
        'Add the service-role key to Vercel and run migration 020 to enforce tenant isolation at the database.'
    )
  }
  if (!anonKey) {
    throw new Error('Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set.')
  }
  adminClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return adminClient
}

/** True when reads are protected at the database as well as in code. */
export function isDbIsolationEnabled(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
