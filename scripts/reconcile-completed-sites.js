/**
 * One-off: mark known-built trial websites as complete.
 * Usage: node scripts/reconcile-completed-sites.js
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or anon key) in env,
 * or the Website Builder .env.local values.
 */
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')

// Load .env.local if present
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL / key in env')
  process.exit(1)
}

const supabase = createClient(url, key)

const TARGETS = [
  { name: 'Mamma & Mia Cakes And Catering', folder: 'mamma_mia_cakes_and_catering' },
  { name: "Tammy's Sticker Shop", folder: 'tammy_s_sticker_shop' },
]

async function main() {
  for (const t of TARGETS) {
    const { data: rows, error } = await supabase
      .from('trial_websites')
      .select('id, business_name, build_status, build_folder, trial_url, contact_id')
      .ilike('business_name', `%${t.name.replace(/'/g, '')}%`)

    if (error) {
      console.error('Query failed:', error.message)
      continue
    }
    if (!rows || rows.length === 0) {
      console.log(`No row for ${t.name}`)
      continue
    }

    for (const row of rows) {
      const { error: upErr } = await supabase
        .from('trial_websites')
        .update({
          build_status: 'complete',
          error_message: null,
          client_status: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)

      console.log(
        `${row.business_name} (${row.id}): ${row.build_status} → ${upErr ? 'FAILED ' + upErr.message : 'complete'}`
      )
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
