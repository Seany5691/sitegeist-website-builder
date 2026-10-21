const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const targets = [
  ROOT + '/Websites/missions_ablaze/app/page.tsx',
  ROOT + '/Websites/mamma_mia_cakes_and_catering/app/page.tsx',
  ROOT + '/Websites/tammy_s_sticker_shop/app/page.tsx',
]

const IMPORT_OLD = "import FeatureHost from '@/components/features/FeatureHost'"
const IMPORT_NEW = IMPORT_OLD + "\nimport WhatsAppGate from '@/components/WhatsAppGate'"

const WIDGET_OLD = '      <WhatsAppWidget />'
const WIDGET_NEW = '      <WhatsAppGate>\n        <WhatsAppWidget />\n      </WhatsAppGate>'

for (const p of targets) {
  if (!fs.existsSync(p)) { console.log('missing', p); continue }
  let t = fs.readFileSync(p, 'utf8')
  let changed = false

  if (!t.includes('WhatsAppGate')) {
    if (t.includes(IMPORT_OLD)) {
      t = t.replace(IMPORT_OLD, IMPORT_NEW)
      changed = true
    } else {
      // add import after the FeatureHost import or first import
      t = t.replace(/(^import[^\n]*\n)/m, `$1import WhatsAppGate from '@/components/WhatsAppGate'\n`)
      changed = true
    }
  }

  if (t.includes(WIDGET_OLD)) {
    t = t.replace(WIDGET_OLD, WIDGET_NEW)
    changed = true
  } else if (t.includes('<WhatsAppWidget />')) {
    t = t.replace(/<WhatsAppWidget \/>/, '<WhatsAppGate><WhatsAppWidget /></WhatsAppGate>')
    changed = true
  }

  if (changed) {
    fs.writeFileSync(p, t, 'utf8')
    console.log('patched', path.basename(path.dirname(path.dirname(p))))
  } else {
    console.log('nochange', path.basename(path.dirname(path.dirname(p))))
  }
}

// Also update the generator's homepage emission
const genPath = ROOT + '/Website Builder/lib/boilerplate-generator.ts'
let g = fs.readFileSync(genPath, 'utf8')
if (!g.includes('WhatsAppGate')) {
  g = g.replace(
    "import FeatureHost from '@/components/features/FeatureHost'",
    "import FeatureHost from '@/components/features/FeatureHost'\nimport WhatsAppGate from '@/components/WhatsAppGate'"
  )
  g = g.replace(
    '      <WhatsAppWidget />',
    '      <WhatsAppGate><WhatsAppWidget /></WhatsAppGate>'
  )
  fs.writeFileSync(genPath, g, 'utf8')
  console.log('generator patched')
} else {
  console.log('generator already has WhatsAppGate')
}

// Copy WhatsAppGate into the 3 sites
for (const site of ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop']) {
  fs.copyFileSync(
    ROOT + '/Website Builder/templates/backend/components/WhatsAppGate.tsx',
    ROOT + '/Websites/' + site + '/components/WhatsAppGate.tsx'
  )
}
console.log('WhatsAppGate copied to 3 sites')
