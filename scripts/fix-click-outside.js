const fs = require('fs')
const path = require('path')

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

for (const site of SITES) {
  const name = site.split('/').pop()
  const p = path.join(site, 'public', 'dashboard', 'assets', 'content-pages.js')
  if (!fs.existsSync(p)) continue

  let js = fs.readFileSync(p, 'utf8')
  const before = js

  // Remove the old click-outside handler from renderCPSectionList (causes double-fire)
  js = js.replace(
    /\/\/ Click-outside: close editor when clicking outside the open accordion card\n  document\.addEventListener\('click', function cpOutsideClick[\s\S]*?\}\)\n\n  \/\/ Wire drag/,
    '// Wire drag'
  )

  // Add a single global mousedown handler at the bottom of the file
  if (!js.includes('cpOutsideClickHandler')) {
    js += `

// ── Click-outside to close editor (single global handler) ──────────────
var cpOutsideClickHandler = function(e) {
  if (!cpOpenEditorId) return
  // Find the open card
  var openCard = document.querySelector('.cp-card.open')
  if (!openCard) return
  if (openCard.contains(e.target)) return
  // Click was outside — close
  cpSaveEditorData(cpOpenEditorId)
  cpOpenEditorId = null
  renderCPSectionList()
}
document.addEventListener('mousedown', cpOutsideClickHandler, true)
`
  }

  if (js !== before) {
    fs.writeFileSync(p, js)
    try { new Function(js); console.log(name + ': FIXED + VALID') } catch (e) { console.log(name + ': ERROR - ' + e.message) }
  } else {
    console.log(name + ': no changes')
  }
}

// Sync to WB template
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'content-pages.js'), 'utf8')
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/content-pages.js', src)
console.log('WB: synced')
console.log('Done.')
