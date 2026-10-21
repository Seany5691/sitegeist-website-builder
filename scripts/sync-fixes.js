const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const WB = path.join(ROOT, 'Website Builder')
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop']

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
}

console.log('=== syncing fixes to 3 sites ===\n')
for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  let n = 0

  // 1. Feature components (including the new icons.tsx)
  const featSrc = path.join(WB, 'templates', 'components', 'features')
  for (const e of fs.readdirSync(featSrc, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith('.tsx')) continue
    copyFile(path.join(featSrc, e.name), path.join(base, 'components', 'features', e.name))
    n++
  }

  // 2. control-flags (with siteNavLinks)
  copyFile(path.join(WB, 'templates', 'backend', 'lib', 'control-flags.ts'), path.join(base, 'lib', 'control-flags.ts'))
  n++

  // 3. dashboard (auto-save fix)
  copyFile(path.join(WB, 'templates', 'dashboard', 'index.html'), path.join(base, 'public', 'dashboard', 'index.html'))
  copyFile(path.join(WB, 'templates', 'dashboard', 'assets', 'app.js'), path.join(base, 'public', 'dashboard', 'assets', 'app.js'))
  copyFile(path.join(WB, 'templates', 'dashboard', 'assets', 'styles.css'), path.join(base, 'public', 'dashboard', 'assets', 'styles.css'))
  n += 3

  console.log(site + ': ' + n + ' files synced')
}

// BOM strip
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

// Verify key files
console.log('\n=== verify ===')
for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  const checks = [
    'components/features/icons.tsx',
    'components/features/WhatsAppFab.tsx',
    'components/features/AnnouncementBanner.tsx',
    'components/features/StickyHeader.tsx',
    'lib/control-flags.ts',
    'components/Header.tsx',
    'public/dashboard/assets/app.js',
  ]
  const missing = checks.filter((c) => !fs.existsSync(path.join(base, c)))
  const header = fs.readFileSync(path.join(base, 'components', 'Header.tsx'), 'utf8')
  const appjs = fs.readFileSync(path.join(base, 'public', 'dashboard', 'assets', 'app.js'), 'utf8')
  console.log(site + ': missing=' + missing.length + ' nav=' + header.includes('siteNavLinks') + ' autosave=' + appjs.includes('Feature enabled'))
}
