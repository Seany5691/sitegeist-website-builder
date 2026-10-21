const BASE = 'https://missions-ablaze.sitespire.co.za'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

;(async () => {
  const r = await fetch(BASE + '/api/site-data?t=' + Date.now(), {
    headers: { 'user-agent': UA, accept: 'application/json' },
    cache: 'no-store',
  })
  const j = await r.json()
  const cfg = j.siteConfig || {}

  console.log('=== controls.features (what the site sees) ===')
  const f = cfg.controls?.features || {}
  for (const [k, v] of Object.entries(f)) console.log('  ', k.padEnd(22), v)

  console.log('\n=== featureData (the actual content) ===')
  const fd = cfg.featureData || {}
  console.log('  featureData keys:', Object.keys(fd).join(', ') || '(NONE)')
  for (const [k, v] of Object.entries(fd)) {
    const s = JSON.stringify(v)
    console.log('  ', k.padEnd(22), s.length > 90 ? s.slice(0, 90) + '…' : s)
  }

  console.log('\n=== controls.sections (nav source) ===')
  const s = cfg.controls?.sections || {}
  const on = Object.entries(s).filter(([, v]) => v).map(([k]) => k)
  const off = Object.entries(s).filter(([, v]) => !v).map(([k]) => k)
  console.log('  ON :', on.join(', '))
  console.log('  OFF:', off.join(', '))

  console.log('\n=== is config served from blob or file? ===')
  console.log('  source:', j.source)
})()
