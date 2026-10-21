const fs = require('fs')
const t = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/app.js', 'utf8')
const idx = t.indexOf('SECTION_FIELDS = {')
if (idx > -1) {
  const block = t.slice(idx, idx + 5000)
  const keys = [...block.matchAll(/"([a-zA-Z]+)":\s*\{/g)].map(m => m[1])
  console.log('SECTION_FIELDS keys:', keys.join(', '))
} else {
  console.log('SECTION_FIELDS = { not found')
  // Check what format it uses
  const idx2 = t.indexOf('SECTION_FIELDS')
  if (idx2 > -1) {
    console.log('First SECTION_FIELDS mention at char', idx2)
    console.log('Context:', t.slice(idx2, idx2 + 300))
  }
}
