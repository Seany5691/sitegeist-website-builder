const fs = require('fs')
const path = require('path')

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

for (const site of SITES) {
  const name = site.split('/').pop()
  console.log('=== ' + name + ' ===')

  const p = path.join(site, 'public', 'dashboard', 'assets', 'app.js')
  if (!fs.existsSync(p)) continue
  let app = fs.readFileSync(p, 'utf8')
  const before = app

  // 1. Gallery settings harvest
  if (!app.includes('gallery settings harvest')) {
    app = app.replace(
      /\/\/ Feature fields \(WhatsApp popup/,
      `// Gallery display settings
  try {
    var gm = document.getElementById('galleryHomeMode')
    var gf = document.getElementById('galleryHomeFilter')
    var gp = document.getElementById('galleryPictureLimit')
    var gf2 = document.getElementById('galleryFolderLimit')
    if (gm) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homeMode = gm.value }
    if (gf) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homeFilter = gf.value }
    if (gp) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homePictureLimit = gp.value }
    if (gf2) { if (!siteConfig.gallerySettings) siteConfig.gallerySettings = {}; siteConfig.gallerySettings.homeFolderLimit = gf2.value }
  } catch (e) { console.warn('gallery settings harvest', e) }

  // Feature fields (WhatsApp popup`
    )
    console.log('  ✓ gallery harvest')
  }

  // 2. getWebsiteControls navPages sync
  if (!app.includes('Sync navPages')) {
    app = app.replace(
      /function getWebsiteControls\(\) \{\n(\s*)if \(!siteConfig\) siteConfig = \{\};/,
      `function getWebsiteControls() {\n  if (!siteConfig) siteConfig = {};\n  // Sync navPages to controls.pages\n  if (siteConfig.navPages && typeof siteConfig.navPages === 'object') {\n    if (!siteConfig.controls) siteConfig.controls = {};\n    if (!siteConfig.controls.pages) siteConfig.controls.pages = {};\n    Object.keys(siteConfig.navPages).forEach(function(k) {\n      if (k === '_order') return;\n      if (typeof siteConfig.navPages[k] === 'boolean') {\n        siteConfig.controls.pages[k] = siteConfig.navPages[k];\n      }\n    });\n  }`
    )
    console.log('  ✓ navPages sync')
  }

  // 3. cpHarvestSubpageFields call
  if (!app.includes('cpHarvestSubpageFields')) {
    app = app.replace(
      /\/\/ Feature fields \(WhatsApp popup/,
      `// Service sub-page content
  try {
    if (typeof cpHarvestSubpageFields === 'function') cpHarvestSubpageFields()
  } catch (e) { console.warn('harvest subpage', e) }

  // Feature fields (WhatsApp popup`
    )
    console.log('  ✓ subpage harvest')
  }

  if (app !== before) {
    fs.writeFileSync(p, app)
    try { new Function(app); console.log('  ✓ VALID') } catch (e) { console.log('  ✗ ERROR - ' + e.message) }
  }
}

// Sync WB
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js', src)
console.log('WB: synced')
console.log('Done.')
