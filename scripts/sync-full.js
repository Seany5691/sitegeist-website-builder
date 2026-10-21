const fs = require('fs')
const path = require('path')

const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder'
const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

const CONTENT_JS = fs.readFileSync(path.join(WB, 'templates/dashboard/assets/content-pages.js'), 'utf8')
const CONTENT_CSS = fs.readFileSync(path.join(WB, 'templates/dashboard/assets/content-pages.css'), 'utf8')

for (const site of SITES) {
  const name = site.split('/').pop()
  const assetsDir = path.join(site, 'public', 'dashboard', 'assets')
  fs.writeFileSync(path.join(assetsDir, 'content-pages.js'), CONTENT_JS)
  fs.writeFileSync(path.join(assetsDir, 'content-pages.css'), CONTENT_CSS)
  console.log(name, ': copied JS + CSS')
}

// Verify key functions exist
for (const site of SITES) {
  const name = site.split('/').pop()
  const js = fs.readFileSync(path.join(site, 'public', 'dashboard', 'assets', 'content-pages.js'), 'utf8')
  const checks = [
    'function cpMoveEditorIn',
    'function cpMoveEditorOut',
    'function cpSaveAndClose',
    'function renderNavList',
    'function renderSubmenuNameFields',
    'function navAddSubmenuItem',
    'cpGetSectionMode',
    'cpSetSectionMode',
    'lockedFirst',
    'servicesSubmenu',
  ]
  const missing = checks.filter((c) => !js.includes(c))
  console.log(name, missing.length === 0 ? ': ALL OK' : ': MISSING ' + missing.join(', '))
}
