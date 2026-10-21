const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites'
const TB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard'
const SITES = ['mamma_mia_cakes_and_catering', 'missions_ablaze', 'tammy_s_sticker_shop']

const NEW_VERSION = '5.0'

// 1. Bump the cache-buster in every index.html (template + 3 sites)
//    so browsers fetch the corrected CSS/JS instead of the cached copies.
const htmlPaths = [path.join(TB, 'index.html')].concat(
  SITES.map((s) => path.join(ROOT, s, 'public', 'dashboard', 'index.html'))
)

for (const p of htmlPaths) {
  if (!fs.existsSync(p)) { console.log('SKIP html (missing)', p); continue }
  let t = fs.readFileSync(p, 'utf8')
  const before = t
  t = t.replace(/(styles\.css|config\.js|app\.js|tutorial\.js)\?v=[0-9.]+/g, `$1?v=${NEW_VERSION}`)
  if (t !== before) {
    fs.writeFileSync(p, t, 'utf8')
    console.log('BUMPED  ', p.split('/').slice(-4).join('/'), '-> ?v=' + NEW_VERSION)
  } else {
    console.log('NOCHANGE', p.split('/').slice(-4).join('/'))
  }
}

// 2. Clean the leftover U+FFFD replacement char from styles.css (template + sites)
const cssPaths = [path.join(TB, 'assets', 'styles.css')].concat(
  SITES.map((s) => path.join(ROOT, s, 'public', 'dashboard', 'assets', 'styles.css'))
)

for (const p of cssPaths) {
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  const bad = (t.match(/\uFFFD/g) || []).length + (t.match(/ï¿½/g) || []).length
  if (bad === 0) { console.log('CLEAN   ', p.split('/').slice(-3).join('/')); continue }
  const fixed = t.split('\uFFFD').join('-').split('ï¿½').join('-')
  fs.writeFileSync(p, fixed, 'utf8')
  const opens = (fixed.match(/\{/g) || []).length
  const closes = (fixed.match(/\}/g) || []).length
  console.log('CLEARED ', p.split('/').slice(-3).join('/'), ' removed', bad, ' replacement chars | braces', opens, '/', closes)
}

// 3. Same for app.js / config.js just in case
const jsPaths = []
for (const s of SITES) {
  for (const f of ['app.js', 'config.js']) {
    jsPaths.push(path.join(ROOT, s, 'public', 'dashboard', 'assets', f))
  }
}
jsPaths.push(path.join(TB, 'assets', 'app.js'))
jsPaths.push(path.join(TB, 'assets', 'config.js'))
for (const p of jsPaths) {
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  const bad = (t.match(/\uFFFD/g) || []).length
  if (bad > 0) {
    fs.writeFileSync(p, t.split('\uFFFD').join('-'), 'utf8')
    console.log('CLEARED ', p.split('/').slice(-3).join('/'), ' removed', bad, ' in js')
  }
}

console.log('\n=== verify cache-busters are bumped ===')
for (const p of htmlPaths) {
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  const hits = t.match(/(styles\.css|config\.js|app\.js)\?v=[0-9.]+/g) || []
  console.log(' ', p.split('/').slice(-4).join('/'), '->', hits.join(', '))
}
