const fs = require('fs')
const path = require('path')
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const WB = path.join(ROOT, 'Website Builder')

// What the generator + auto-ship pipeline puts into EVERY new site
const EMITTED_BY_GENERATOR = [
  'app/page.tsx', 'app/layout.tsx', 'app/sitemap.ts', 'app/robots.ts', 'app/icon.svg',
  'app/about/page.tsx', 'app/services/page.tsx', 'app/contact/page.tsx', 'app/portfolio/page.tsx',
  'app/team/page.tsx', 'app/blog/page.tsx', 'app/reviews/page.tsx', 'app/faq/page.tsx',
  'app/areas/page.tsx', 'app/privacy/page.tsx',
]

const AUTO_SHIPPED_BACKEND = [
  'lib/section-registry.ts', 'lib/feature-registry.ts', 'lib/control-flags.ts',
  'lib/leads.ts', 'lib/supabase-server.ts', 'lib/email-html.ts',
  'lib/schema.ts', 'lib/schema-types.ts', 'lib/site-url.ts', 'lib/view-tracker.ts',
  'lib/logo-engine.ts', 'lib/geo-audit.ts', 'lib/page-meta.ts', 'lib/robots-ua-list.ts',
  'components/SectionRenderer.tsx', 'components/WhatsAppGate.tsx', 'components/PageHero.tsx',
  'middleware.ts',
  'app/api/contact/route.ts', 'app/api/leads/route.ts', 'app/api/leads/test/route.ts',
  'app/api/leads/[id]/redeliver/route.ts', 'app/api/geo-audit/route.ts', 'app/api/stats/route.ts',
  'app/llms.txt/route.ts', 'app/llms-full.txt/route.ts', 'app/rss.xml/route.ts',
  'app/opengraph-image.tsx',
]

// Section + feature components copied by build-website's controlSystemFolders step
const COMPONENT_FOLDERS = ['team','blog','stats','process','trust','partners','areas','location','hours','awards','social','newsletter','reviews','vsl','privacy','features']
const COMPONENT_FILES = {
  gallery: ['BeforeAfter.tsx', 'LatestWork.tsx'],
}

console.log('=== INHERITANCE AUDIT: will the next site get everything? ===\n')

// 1. Generator emits
const gen = fs.readFileSync(path.join(WB, 'lib', 'boilerplate-generator.ts'), 'utf8')
console.log('1. boilerplate-generator emits:')
for (const f of EMITTED_BY_GENERATOR) {
  // the generator maps these keys
  const key = f.replace(/\\/g, '/')
  const present = gen.includes(`'${key}'`) || gen.includes(key)
  console.log('   ' + (present ? 'OK  ' : 'MISS') + ' ' + f)
}

// 2. backend auto-ship
console.log('\n2. templates/backend (auto-shipped by copyBackendDir):')
let miss = 0
for (const f of AUTO_SHIPPED_BACKEND) {
  const p = path.join(WB, 'templates', 'backend', f)
  const ok = fs.existsSync(p)
  if (!ok) miss++
  console.log('   ' + (ok ? 'OK  ' : 'MISS') + ' ' + f)
}
console.log('   missing:', miss)

// 3. component folders
console.log('\n3. templates/components (shipped by controlSystemFolders):')
const shipped = fs.readFileSync(path.join(WB, 'app', 'api', 'build-website', 'route.ts'), 'utf8')
for (const folder of COMPONENT_FOLDERS) {
  const inList = shipped.includes(`'${folder}'`)
  const exists = fs.existsSync(path.join(WB, 'templates', 'components', folder))
  const count = exists ? fs.readdirSync(path.join(WB, 'templates', 'components', folder)).filter(f => f.endsWith('.tsx')).length : 0
  console.log('   ' + (inList ? 'OK  ' : 'MISS') + ' ' + folder.padEnd(12) + ' in ship-list=' + inList + ' files=' + count)
}
console.log('   gallery (limited):', COMPONENT_FILES.gallery.join(', '))

// 4. dashboard
console.log('\n4. templates/dashboard (copied to public/dashboard):')
for (const f of ['index.html', 'assets/app.js', 'assets/styles.css']) {
  console.log('   ' + (fs.existsSync(path.join(WB, 'templates', 'dashboard', f)) ? 'OK  ' : 'MISS') + ' ' + f)
}

// 5. build instructions
console.log('\n5. build instructions (MiMo):')
const pb = fs.readFileSync(path.join(WB, 'lib', 'prompt-builder.ts'), 'utf8')
for (const rule of ['Rule 8D', 'Full Control System', 'section-registry', 'SectionRenderer', 'llms.txt is auto-generated']) {
  console.log('   ' + (pb.includes(rule) ? 'OK  ' : 'MISS') + ' ' + rule)
}

// 6. env + deploy
console.log('\n6. env + deploy wiring:')
const env = fs.readFileSync(path.join(WB, 'lib', 'boilerplate-generator.ts'), 'utf8')
for (const v of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TENANT_ID', 'NEXT_PUBLIC_SITE_URL']) {
  console.log('   ' + (env.includes(v) ? 'OK  ' : 'MISS') + ' ' + v + ' (env template)')
}
const dep = fs.readFileSync(path.join(WB, 'app', 'api', 'deploy-site', 'route.ts'), 'utf8')
for (const v of ['TENANT_ID', 'SUPABASE_URL', 'NEXT_PUBLIC_SITE_URL', 'RESEND_API_KEY']) {
  console.log('   ' + (dep.includes(v) ? 'OK  ' : 'MISS') + ' ' + v + ' (deploy-site)')
}
