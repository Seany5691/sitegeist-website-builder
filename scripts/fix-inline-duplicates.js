const fs = require('fs')
const path = require('path')
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder'

console.log('=== 1. Section components read featureData (same source as Features tab) ===')
const sectionFixes = [
  {
    file: ROOT + '/templates/components/areas/AreasServed.tsx',
    keys: ['config?.featureData?.areasServedStrip', 'config?.areas'],
    note: 'areasServedStrip'
  },
  {
    file: ROOT + '/templates/components/gallery/BeforeAfter.tsx',
    keys: ['config?.featureData?.beforeAfter', 'config?.beforeAfter'],
    note: 'beforeAfter'
  },
]
for (const s of sectionFixes) {
  if (!fs.existsSync(s.file)) { console.log('  missing', s.file); continue }
  let t = fs.readFileSync(s.file, 'utf8')
  const before = t
  // Replace a plain `config?.X || {}` style accessor with the featureData-first chain
  t = t.replace(
    /const\s+(\w+)\s*=\s*config\?\.\w+\s*\|\|\s*\{\}/,
    `const $1 = ${s.keys[0]} || ${s.keys[1]} || {}`
  )
  t = t.replace(
    /const\s+(\w+)\s*=\s*config\?\.\w+\s*\|\|\s*\[\]/,
    `const $1 = ${s.keys[0]}?.items || ${s.keys[1]} || []`
  )
  if (t !== before) {
    fs.writeFileSync(s.file, t, 'utf8')
    console.log('  patched', path.basename(path.dirname(s.file)) + '/' + path.basename(s.file))
  } else {
    // show what it reads now
    const m = t.match(/config\?\.\w+(\?\.\w+)?/)
    console.log('  nochange', path.basename(s.file), 'reads', m ? m[0] : '?')
  }
}

console.log('')
console.log('=== 2. Remove duplicate INLINE features from FeatureHost ===')
{
  const p = ROOT + '/templates/components/features/FeatureHost.tsx'
  let t = fs.readFileSync(p, 'utf8')
  const before = t
  // These three are ORDERABLE SECTIONS rendered by SectionRenderer — the
  // FeatureHost 'inline' copies rendered at a fixed spot and broke reordering.
  t = t.replace(/\{ id: 'trustBadges', placement: 'inline', Component: TrustBadges \},\n/, '')
  t = t.replace(/\{ id: 'areasServedStrip', placement: 'inline', Component: AreasServed \},\n/, '')
  t = t.replace(/\{ id: 'beforeAfter', placement: 'inline', Component: BeforeAfter \},\n/, '')
  if (t !== before) {
    fs.writeFileSync(p, t, 'utf8')
    console.log('  FeatureHost inline duplicates removed')
  } else {
    console.log('  FeatureHost: no inline dupes matched — checking')
    const lines = t.split('\n').filter(l => l.includes("placement: 'inline'"))
    lines.forEach(l => console.log('   ', l.trim()))
  }
}

console.log('')
console.log('=== 3. verify ===')
const fh = fs.readFileSync(ROOT + '/templates/components/features/FeatureHost.tsx', 'utf8')
console.log('  inline placements left:', (fh.match(/placement: 'inline'/g) || []).length, '(should be 1 = photoLightbox)')
console.log('  photoLightbox kept   :', fh.includes('photoLightbox'))
