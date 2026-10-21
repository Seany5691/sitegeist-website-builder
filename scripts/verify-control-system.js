const SITES = [
  ['missions_ablaze', 'https://missions-ablaze.sitespire.co.za'],
  ['mamma_mia', 'https://mammamiacakesandcatering.vercel.app'],
  ['tammy_s', 'https://tammy-s-sticker-shop.sitespire.co.za'],
]

;(async () => {
  for (const [name, base] of SITES) {
    console.log('=== ' + name + ' ===')

    // 1. new pages
    const pages = []
    for (const p of ['/team', '/blog', '/reviews', '/faq', '/areas', '/privacy']) {
      try {
        const r = await fetch(base + p, { redirect: 'manual' })
        pages.push(p + '=' + r.status)
      } catch (e) { pages.push(p + '=ERR') }
    }
    console.log('  pages    :', pages.join('  '))

    // 2. dashboard
    const h = await (await fetch(base + '/dashboard/index.html', { cache: 'no-store' })).text()
    console.log('  features tab    :', h.includes('data-section="features"'))
    console.log('  website control :', h.includes('websiteSectionsList'))
    console.log('  testimonial src :', h.includes('testimonialSource'))
    console.log('  cache-buster    :', (h.match(/styles\.css\?v=[0-9.]+/) || ['none'])[0])

    // 3. dashboard JS
    const j = await (await fetch(base + '/dashboard/assets/app.js?v=5.0', { cache: 'no-store' })).text()
    console.log('  CONTROL_SECTIONS:', j.includes('CONTROL_SECTIONS'))
    console.log('  FEATURE_DEFS    :', j.includes('FEATURE_DEFS'))
    console.log('  tab auto-hide   :', j.includes('controls.sections'))
    console.log('  testimonial fix :', j.includes("source: 'Dashboard'") ? 'STILL HARDCODED' : 'fixed')

    // 4. controls in live config
    const sd = await (await fetch(base + '/api/site-data?t=' + Date.now(), { cache: 'no-store' })).text()
    let controls = 'missing'
    try {
      const cfg = JSON.parse(sd).siteConfig
      if (cfg && cfg.controls) {
        const on = Object.entries(cfg.controls.sections || {}).filter(([, v]) => v).map(([k]) => k)
        controls = on.length + ' sections ON (' + on.slice(0, 6).join(',') + '…)'
      }
    } catch (e) { controls = 'parse err' }
    console.log('  controls in cfg :', controls)
    console.log('')
  }
})()
