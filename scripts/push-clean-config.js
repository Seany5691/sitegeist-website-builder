const fs = require('fs')
const path = require('path')

// Push CLEAN local site-config.json to each site's Blob (Node handles UTF-8 safely).
const SITES = [
  { dir: 'mamma_mia_cakes_and_catering', base: 'https://mammamiacakesandcatering.vercel.app', user: 'admin', pass: 'Mamma2024!' },
  { dir: 'missions_ablaze', base: 'https://missions-ablaze.sitespire.co.za', user: 'Missions', pass: 'Missions2026!' },
  { dir: 'tammy_s_sticker_shop', base: 'https://tammy-s-sticker-shop.sitespire.co.za', user: "Tammy's", pass: "Tammy's2026!" },
]
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites'

function cookieJar() {
  const jar = new Map()
  return {
    set(res) {
      const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : []
      for (const c of raw) {
        const [pair] = c.split(';')
        const i = pair.indexOf('=')
        if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim())
      }
    },
    header() {
      return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
    },
  }
}

async function fixSite(s) {
  console.log('\n=== ' + s.dir + ' ===')
  const localPath = path.join(ROOT, s.dir, 'public', 'site-config.json')
  if (!fs.existsSync(localPath)) { console.log(' no local config'); return }
  const raw = fs.readFileSync(localPath, 'utf8')
  const moj = (raw.match(/â/g) || []).length
  console.log(' local mojibake:', moj)
  const cfg = JSON.parse(raw)

  const jar = cookieJar()
  const r1 = await fetch(s.base + '/api/auth/csrf', { headers: { accept: 'application/json' } })
  jar.set(r1)
  const { csrfToken } = await r1.json()

  const body = new URLSearchParams({ csrfToken, username: s.user, password: s.pass, json: 'true' })
  const r2 = await fetch(s.base + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: jar.header() },
    body, redirect: 'manual',
  })
  jar.set(r2)
  if (r2.status !== 200) { console.log(' login failed', r2.status); return }

  const payload = JSON.stringify({ siteConfig: cfg })
  const r3 = await fetch(s.base + '/api/save-config', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: jar.header(), origin: s.base },
    body: payload,
  })
  const txt = await r3.text()
  console.log(' save:', r3.status, txt.slice(0, 90))

  const r4 = await fetch(s.base + '/api/site-data', { headers: { cookie: jar.header(), accept: 'application/json' } })
  const live = await r4.text()
  console.log(' LIVE mojibake:', (live.match(/â/g) || []).length)
}

;(async () => {
  for (const s of SITES) {
    try { await fixSite(s) } catch (e) { console.log(' ERR', s.dir, e.message) }
  }
})()
