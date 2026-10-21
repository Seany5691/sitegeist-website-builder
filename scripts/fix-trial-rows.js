const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const UPDATES = [
  {
    id: '2046500d-ee3e-4ce7-9913-4a91e160b69e',
    patch: {
      build_status: 'complete',
      error_message: null,
      client_status: 'ready',
      build_folder: 'tammy_s_sticker_shop',
      trial_url: 'https://tammy-s-sticker-shop.sitespire.co.za',
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '8382ebd0-6759-45b8-aaba-bb08dfa28706',
    patch: {
      build_folder: 'mamma_mia_cakes_and_catering',
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '7734174d-6ba0-4cab-af1d-cf67b255e4ca',
    patch: {
      // Partial build exists — ready for manual Phase 2 / Start Build
      build_status: 'pending',
      error_message: null,
      build_folder: 'jj_sand_ready_mix',
      updated_at: new Date().toISOString(),
    },
  },
]

async function main() {
  for (const u of UPDATES) {
    const { error } = await s.from('trial_websites').update(u.patch).eq('id', u.id)
    console.log(u.id, error ? 'FAILED: ' + error.message : 'updated')
  }
  const { data } = await s
    .from('trial_websites')
    .select('id, business_name, build_status, build_folder, trial_url')
    .order('created_at', { ascending: false })
  console.log(JSON.stringify(data, null, 2))
}

main()
