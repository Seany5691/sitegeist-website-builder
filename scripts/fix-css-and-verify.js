const fs = require('fs')

// ---- 1. Fix the mangled CSS block in styles.css ----
const cssPaths = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/styles.css',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/styles.css',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze/public/dashboard/assets/styles.css',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop/public/dashboard/assets/styles.css',
]

const BROKEN = [
  '  font-family: inherit;',
  '}',
  '  cursor: pointer;',
  '  white-space: nowrap;',
  '}',
].join('\n')

const FIXED = [
  '  font-family: inherit;',
  '  cursor: pointer;',
  '  white-space: nowrap;',
  '}',
].join('\n')

for (const p of cssPaths) {
  if (!fs.existsSync(p)) { console.log('SKIP (missing)', p); continue }
  const raw = fs.readFileSync(p, 'utf8')
  const hadCRLF = raw.includes('\r\n')
  const norm = raw.replace(/\r\n/g, '\n')
  if (norm.includes(BROKEN)) {
    const out = norm.replace(BROKEN, FIXED)
    // restore original line endings
    const final = hadCRLF ? out.replace(/\n/g, '\r\n') : out
    fs.writeFileSync(p, final, 'utf8')
    // verify brace balance
    const opens = (out.match(/\{/g) || []).length
    const closes = (out.match(/\}/g) || []).length
    console.log('FIXED css', p.split('/').slice(-2).join('/'), ' braces', opens, '/', closes, opens === closes ? 'BALANCED' : 'STILL OFF')
  } else {
    const opens = (norm.match(/\{/g) || []).length
    const closes = (norm.match(/\}/g) || []).length
    console.log('SKIP css', p.split('/').slice(-2).join('/'), ' braces', opens, '/', closes, opens === closes ? 'BALANCED' : 'STILL OFF')
  }
}

// ---- 2. Verify site-config mojibake is gone ----
console.log('\n=== site-config mojibake check ===')
for (const s of ['mamma_mia_cakes_and_catering', 'missions_ablaze', 'tammy_s_sticker_shop']) {
  for (const f of ['public/site-config.json', 'site-config.json']) {
    const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/' + s + '/' + f
    if (!fs.existsSync(p)) continue
    const t = fs.readFileSync(p, 'utf8')
    const a = (t.match(/â/g) || []).length
    console.log(' ', s + '/' + f, ' mojibake:', a, a === 0 ? 'CLEAN' : 'NEEDS FIX')
  }
}
