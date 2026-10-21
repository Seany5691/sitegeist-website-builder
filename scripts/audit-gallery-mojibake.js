const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const SITES = ['mamma_mia_cakes_and_catering', 'missions_ablaze', 'tammy_s_sticker_shop']

// --- 1. Scan for mojibake in all tsx/ts/js/json under each site's components + app ---
console.log('=== mojibake scan (byte-level) ===')
for (const s of SITES) {
  for (const sub of ['components', 'app', 'lib', 'public']) {
    const dir = path.join(ROOT, 'Websites', s, sub)
    if (!fs.existsSync(dir)) continue
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const fp = path.join(d, e.name)
        if (e.isDirectory()) { if (e.name === 'node_modules' || e.name === '.next') continue; walk(fp); continue }
        if (!/\.(tsx|ts|js|json|css|html)$/.test(e.name)) continue
        const t = fs.readFileSync(fp, 'utf8')
        const bad = (t.match(/â€|ðŸ|ï¿½|\uFFFD/g) || []).length
        if (bad > 0) {
          const sample = t.match(/.{0,20}(â€|ðŸ|ï¿½|\uFFFD).{0,20}/)
          console.log(' ', s + '/' + sub + '/' + path.relative(dir, fp), 'x' + bad, '::', JSON.stringify(sample ? sample[0] : ''))
        }
      }
    }
    walk(dir)
  }
}

// --- 2. Scan folder-grid width bug: buttons with w-full inside a flex-wrap folder grid ---
console.log('\n=== folder-stacking scan ===')
for (const s of SITES) {
  const p = path.join(ROOT, 'Websites', s, 'components', 'Gallery.tsx')
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  const hasFlexWrapGrid = /flex flex-wrap justify-center gap-5/.test(t)
  const folderBtnFullW = /visibleFolders[\s\S]{0,600}?className="[^"]*\bw-full\b[^"]*"/.test(t)
  const wrapperSized = /AnimateOnScroll key=\{catName\}[^>]*flex-none/.test(t)
  console.log(' ', s, '| flex-grid:', hasFlexWrapGrid, '| folder btn w-full:', folderBtnFullW, '| wrapper sized:', wrapperSized)
}

// --- 3. Same for template components ---
console.log('\n=== template gallery components ===')
const tg = path.join(ROOT, 'Website Builder', 'templates', 'components')
for (const e of fs.readdirSync(tg, { withFileTypes: true })) {
  const list = e.isDirectory() ? fs.readdirSync(path.join(tg, e.name)).map(f => path.join(tg, e.name, f)) : [path.join(tg, e.name)]
  for (const fp of list) {
    if (!fp.endsWith('.tsx')) continue
    const t = fs.readFileSync(fp, 'utf8')
    const bad = (t.match(/â€|ðŸ|ï¿½|\uFFFD/g) || []).length
    const hasGrid = /flex flex-wrap justify-center gap-5/.test(t)
    const btnFull = /visibleFolders[\s\S]{0,600}?className="[^"]*\bw-full\b[^"]*"/.test(t)
    if (bad > 0 || (hasGrid && btnFull)) {
      console.log(' ', path.basename(path.dirname(fp)) + '/' + path.basename(fp), ' mojibake:' + bad, ' grid:' + hasGrid, ' btn-w-full:' + btnFull)
    }
  }
}
