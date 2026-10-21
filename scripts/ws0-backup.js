/**
 * WS0 — Restore point before the Full Control System build.
 *
 * Copies the Website Builder source tree + the 3 target sites' source/config
 * into GeistBackups, writes a MANIFEST with verification counts, and prints
 * restore instructions. Excludes node_modules / .next / .vercel / temp.
 */
const fs = require('fs')
const path = require('path')

const ECOSYSTEM = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const BACKUPS = path.join(ECOSYSTEM, 'GeistBackups')
const BUILDER = path.join(ECOSYSTEM, 'Website Builder')
const WEBSITES = path.join(ECOSYSTEM, 'Websites')
const TARGET_SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop']

const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.vercel', 'temp', '.git', '.mimocode'])
const EXCLUDE_EXT = new Set(['.tsbuildinfo'])

function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}${p(d.getMinutes())}`
}

function walk(src, dst, stats) {
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      walk(path.join(src, entry.name), path.join(dst, entry.name), stats)
    } else {
      if (EXCLUDE_EXT.has(path.extname(entry.name))) continue
      const s = path.join(src, entry.name)
      const d = path.join(dst, entry.name)
      fs.copyFileSync(s, d)
      stats.files++
      stats.bytes += fs.statSync(s).size
    }
  }
}

function countTree(dir, stats) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      countTree(path.join(dir, entry.name), stats)
    } else {
      if (EXCLUDE_EXT.has(path.extname(entry.name))) continue
      stats.files++
      stats.bytes += fs.statSync(path.join(dir, entry.name)).size
    }
  }
}

function mb(n) { return (n / 1024 / 1024).toFixed(2) + ' MB' }

const stamp = timestamp()
const wbBackup = path.join(BACKUPS, `Website Builder - backup ${stamp}`)
const sitesBackup = path.join(BACKUPS, `Websites-3sites - backup ${stamp}`)
fs.mkdirSync(BACKUPS, { recursive: true })

console.log('=== WS0 BACKUP — restore point before Full Control System build ===')
console.log('destination:', BACKUPS)
console.log('')

// --- 1. Website Builder ---
console.log('[1/3] Copying Website Builder source tree...')
const wbSrc = { files: 0, bytes: 0 }
countTree(BUILDER, wbSrc)
const wbDst = { files: 0, bytes: 0 }
walk(BUILDER, wbBackup, wbDst)
console.log(`      source: ${wbSrc.files} files, ${mb(wbSrc.bytes)}`)
console.log(`      backup: ${wbDst.files} files, ${mb(wbDst.bytes)}`)
console.log(`      match:  ${wbSrc.files === wbDst.files && wbSrc.bytes === wbDst.bytes ? 'YES' : 'CHECK MANUALLY'}`)

// --- 2. Three sites (source + dashboard + config only) ---
console.log('[2/3] Copying 3 site source/config trees...')
const siteReport = []
for (const s of TARGET_SITES) {
  const siteSrc = path.join(WEBSITES, s)
  const siteDst = path.join(sitesBackup, s)
  const parts = ['app', 'components', 'lib', 'public/dashboard', 'public/site-config.json', 'public/image-map.json', 'package.json', 'site-config.json', '.env.production', '.env.local']
  const st = { files: 0, bytes: 0 }
  for (const part of parts) {
    const s2 = path.join(siteSrc, part)
    if (!fs.existsSync(s2)) continue
    const d2 = path.join(siteDst, part)
    const stat = fs.statSync(s2)
    if (stat.isDirectory()) {
      walk(s2, d2, st)
    } else {
      fs.mkdirSync(path.dirname(d2), { recursive: true })
      fs.copyFileSync(s2, d2)
      st.files++
      st.bytes += stat.size
    }
  }
  siteReport.push({ site: s, files: st.files, bytes: st.bytes })
  console.log(`      ${s}: ${st.files} files, ${mb(st.bytes)}`)
}

// --- 3. Manifest + verification ---
console.log('[3/3] Writing MANIFEST...')
const checks = [
  'lib/boilerplate-generator.ts',
  'templates/dashboard/index.html',
  'templates/dashboard/assets/app.js',
  'templates/backend/lib/leads.ts',
  'templates/backend/lib/schema.ts',
  'types/site-config.ts',
  'lib/prompt-builder.ts',
  'app/api/build-website/route.ts',
]
const checkResults = checks.map((c) => ({
  file: c,
  exists: fs.existsSync(path.join(wbBackup, c)),
}))

const manifest = [
  `MANIFEST — Website Builder restore point`,
  `=========================================`,
  ``,
  `Created       : ${new Date().toISOString()}`,
  `Local time    : ${stamp}`,
  `Purpose       : Restore point BEFORE the "Full Control System" build`,
  `                (section registry, switchboard, Features tab, Team/Blog,`,
  `                testimonial source fix).`,
  ``,
  `BACKUP 1 — Website Builder`,
  `  Path        : ${wbBackup}`,
  `  Files       : ${wbDst.files}`,
  `  Size        : ${mb(wbDst.bytes)}`,
  `  Excluded    : node_modules, .next, .vercel, temp, .git, *.tsbuildinfo`,
  ``,
  `BACKUP 2 — 3 target sites (source + dashboard + config)`,
  `  Path        : ${sitesBackup}`,
  ...siteReport.map((r) => `  ${r.site.padEnd(32)} ${String(r.files).padStart(6)} files  ${mb(r.bytes)}`),
  ``,
  `VERIFICATION`,
  ...checkResults.map((c) => `  ${c.exists ? 'OK  ' : 'MISS'} ${c.file}`),
  ``,
  `RESTORE INSTRUCTIONS`,
  `  1. Stop any running dev server.`,
  `  2. Copy the contents of "Website Builder - backup ${stamp}" over`,
  `     "Website Builder/" (replace all).`,
  `  3. Copy each site folder under "Websites-3sites - backup ${stamp}"`,
  `     back into "Websites/<site>/" for the source + config paths listed above.`,
  `  4. Reinstall node_modules if needed: npm install`,
  `  5. Redeploy the 3 sites + GeistCRM.`,
  ``,
  `This folder is a full restore point. Keep it.`,
].join('\n')

const manifestPath = path.join(BACKUPS, `MANIFEST ${stamp}.txt`)
fs.writeFileSync(manifestPath, manifest, 'utf8')
fs.writeFileSync(path.join(wbBackup, 'MANIFEST.txt'), manifest, 'utf8')
fs.writeFileSync(path.join(sitesBackup, 'MANIFEST.txt'), manifest, 'utf8')

console.log('')
console.log('=== BACKUP COMPLETE ===')
console.log('  ', wbBackup)
console.log('  ', sitesBackup)
console.log('  ', manifestPath)
console.log('')
const allOk = checkResults.every((c) => c.exists)
console.log('Verification:', allOk ? 'ALL KEY FILES PRESENT' : '*** SOME KEY FILES MISSING — DO NOT PROCEED ***')
