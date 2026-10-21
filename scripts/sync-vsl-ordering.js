const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const WB = path.join(ROOT, 'Website Builder')
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop']

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
}
function copyDir(src, dst, filter) {
  if (!fs.existsSync(src)) return 0
  let n = 0
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) { n += copyDir(s, d, filter); continue }
    if (filter && !filter(e.name, s)) continue
    copyFile(s, d)
    n++
  }
  return n
}

console.log('=== SYNC: VSL + ordering + bug fixes -> 3 sites ===\n')

for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  let n = 0

  // 1. Feature components (icons, trust badges, sticky header, announcement, FABs)
  n += copyDir(path.join(WB, 'templates', 'components', 'features'), path.join(base, 'components', 'features'), (f) => f.endsWith('.tsx'))

  // 2. VSL component (new)
  n += copyDir(path.join(WB, 'templates', 'components', 'vsl'), path.join(base, 'components'), (f) => f.endsWith('.tsx'))

  // 3. Registry + flags + renderer
  for (const f of ['section-registry.ts', 'feature-registry.ts', 'control-flags.ts']) {
    copyFile(path.join(WB, 'templates', 'backend', 'lib', f), path.join(base, 'lib', f))
    n++
  }
  copyFile(path.join(WB, 'templates', 'backend', 'components', 'SectionRenderer.tsx'), path.join(base, 'components', 'SectionRenderer.tsx'))
  n++

  // 4. Dashboard
  copyFile(path.join(WB, 'templates', 'dashboard', 'index.html'), path.join(base, 'public', 'dashboard', 'index.html'))
  copyFile(path.join(WB, 'templates', 'dashboard', 'assets', 'app.js'), path.join(base, 'public', 'dashboard', 'assets', 'app.js'))
  copyFile(path.join(WB, 'templates', 'dashboard', 'assets', 'styles.css'), path.join(base, 'public', 'dashboard', 'assets', 'styles.css'))
  n += 3

  console.log(site + ': ' + n + ' files synced')
}

// 5. Bump dashboard cache-buster to v7.0 (dashboard changed again)
console.log('\n--- bump cache-buster -> v7.0 ---')
const htmls = [path.join(WB, 'templates', 'dashboard', 'index.html')]
  .concat(SITES.map((s) => path.join(ROOT, 'Websites', s, 'public', 'dashboard', 'index.html')))
for (const p of htmls) {
  let t = fs.readFileSync(p, 'utf8')
  t = t.replace(/(styles\.css|config\.js|app\.js|tutorial\.js)\?v=[0-9.]+/g, '$1?v=7.0')
  fs.writeFileSync(p, t, 'utf8')
  console.log('  bumped ' + p.split('/').slice(-3).join('/'))
}

// 6. BOM strip
let stripped = 0
for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (['node_modules', '.next', '.vercel'].includes(e.name)) continue
        walk(path.join(d, e.name))
      } else if (/\.(ts|tsx|js|json|html|css)$/.test(e.name)) {
        const f = path.join(d, e.name)
        const b = fs.readFileSync(f)
        if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
          fs.writeFileSync(f, b.slice(3))
          stripped++
        }
      }
    }
  }
  walk(base)
}
console.log('\n' + stripped + ' BOMs stripped')

// 7. Verify
console.log('\n=== VERIFY ===')
for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  const checks = {
    VslPlayer: 'components/VslPlayer.tsx',
    icons: 'components/features/icons.tsx',
    SectionRenderer: 'components/SectionRenderer.tsx',
    sectionRegistry: 'lib/section-registry.ts',
    controlFlags: 'lib/control-flags.ts',
  }
  const missing = Object.entries(checks).filter(([, c]) => !fs.existsSync(path.join(base, c))).map(([k]) => k)
  const html = fs.readFileSync(path.join(base, 'public', 'dashboard', 'index.html'), 'utf8')
  const appjs = fs.readFileSync(path.join(base, 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
  const registry = fs.readFileSync(path.join(base, 'lib', 'section-registry.ts'), 'utf8')
  console.log(site + ':')
  console.log('   missing:', missing.length ? missing.join(',') : 'none')
  console.log('   vsl tab       :', html.includes('data-section="vsl"'))
  console.log('   reorder arrows:', appjs.includes('moveSectionOrder'))
  console.log('   sectionOrder  :', appjs.includes('sectionOrder'))
  console.log('   vsl in registry:', registry.includes("id: 'vsl'"))
  console.log('   cache-buster  :', (html.match(/styles\.css\?v=[0-9.]+/) || ['none'])[0])
}
