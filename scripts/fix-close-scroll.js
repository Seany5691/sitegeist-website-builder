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

  // Replace the old click-outside handler with a better one
  js = js.replace(
    /\/\/ ── Click-outside to close editor \(single global handler\) ──[\s\S]*?document\.addEventListener\('mousedown', cpOutsideClickHandler, true\)/,
    `// ── Click-outside to close editor (single global handler) ──────────────
var cpIgnoreNextOutside = false
document.addEventListener('mousedown', function cpOutsideClick(e) {
  if (!cpOpenEditorId) return
  if (cpIgnoreNextOutside) { cpIgnoreNextOutside = false; return }
  var openCard = document.querySelector('.cp-card.open')
  if (!openCard) return
  if (openCard.contains(e.target)) return
  // Defer close so any click handlers on the target complete first
  setTimeout(function() {
    if (!cpOpenEditorId) return
    cpSaveEditorData(cpOpenEditorId)
    cpOpenEditorId = null
    renderCPSectionList()
  }, 50)
}, true)

// Auto-scroll to card top when Edit is clicked
function cpScrollToCard(cardEl) {
  if (!cardEl) return
  var rect = cardEl.getBoundingClientRect()
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop
  var targetY = rect.top + scrollTop - 80 // 80px offset for header
  window.scrollTo({ top: targetY, behavior: 'smooth' })
}`
  )

  // Add auto-scroll call in the Edit button click handler
  js = js.replace(
    /\/\/ Open this one — render editor directly\n      const card = host\.querySelector\('\.cp-card\[data-id="' \+ id \+ '"\]'\)\n      if \(card\) \{\n        card\.classList\.add\('open'\)/,
    `// Open this one — render editor directly
      const card = host.querySelector('.cp-card[data-id="' + id + '"]')
      if (card) {
        card.classList.add('open')
        cpScrollToCard(card)  // Auto-scroll to card top`
  )

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
