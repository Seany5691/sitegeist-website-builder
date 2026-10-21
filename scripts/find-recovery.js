const fs = require('fs')

const copies = [
  { name: 'Mamma', path: 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/app.js' },
  { name: 'Tammy', path: 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop/public/dashboard/assets/app.js' },
  { name: 'Missions', path: 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze/public/dashboard/assets/app.js' },
  { name: 'WB template', path: 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/app.js' },
]

for (const c of copies) {
  if (!fs.existsSync(c.path)) { console.log(c.name + ': NOT FOUND'); continue }
  const t = fs.readFileSync(c.path, 'utf8')
  const lines = t.split('\n').length
  const hasSF = t.includes('SECTION_FIELDS')
  const hasFF = t.includes('FEATURE_FIELDS')
  const hasHarvest = t.includes('harvestPendingFormEdits')
  const hasFeatureRender = t.includes('renderFeatureCardBody')
  console.log(c.name + ': ' + t.length + ' chars, ' + lines + ' lines | SF:' + (hasSF ? '✓' : '✗') + ' FF:' + (hasFF ? '✓' : '✗') + ' harvest:' + (hasHarvest ? '✓' : '✗') + ' render:' + (hasFeatureRender ? '✓' : '✗'))
}

// Also check if there are any .bak or backup files
const dirs = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop/public/dashboard/assets/',
]
console.log('\n=== Backup files ===')
for (const d of dirs) {
  const files = fs.readdirSync(d).filter(f => f.includes('bak') || f.includes('backup') || f.includes('.old') || f.includes('copy'))
  if (files.length > 0) console.log(d.split('/').slice(-3).join('/') + ':', files.join(', '))
}

// Check git stash or reflog
console.log('\n=== Git check ===')
const { execSync } = require('child_process')
try {
  const stash = execSync('cd "C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering" && git stash list 2>&1', { encoding: 'utf8' })
  console.log('Stash:', stash.trim() || 'none')
} catch (e) {
  console.log('Git stash error:', e.message.slice(0, 100))
}

try {
  const reflog = execSync('cd "C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering" && git reflog -5 2>&1', { encoding: 'utf8' })
  console.log('Reflog:', reflog.trim().slice(0, 300))
} catch (e) {
  console.log('Git reflog error:', e.message.slice(0, 100))
}
