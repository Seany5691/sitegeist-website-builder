const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const WB = path.join(ROOT, 'Website Builder')
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop']

console.log('=== FIX 1: render <FeatureHost placement="inline"> in homepage ===')
{
  const homeFiles = SITES.map((s) => path.join(ROOT, 'Websites', s, 'app', 'page.tsx'))
  homeFiles.push(path.join(WB, 'lib', 'boilerplate-generator.ts'))
  for (const p of homeFiles) {
    if (!fs.existsSync(p)) { console.log('  missing', p); continue }
    let t = fs.readFileSync(p, 'utf8')
    if (t.includes('placement="inline"')) { console.log('  already ok', path.basename(p)); continue }
    // insert inline host right after <SectionRenderer />
    if (t.includes('<SectionRenderer />')) {
      t = t.split('<SectionRenderer />').join('<SectionRenderer />\n        <FeatureHost placement="inline" />')
      fs.writeFileSync(p, t, 'utf8')
      console.log('  inline host added:', p.split('/').slice(-3).join('/'))
    } else {
      console.log('  SectionRenderer not found in', p.split('/').slice(-3).join('/'))
    }
  }
}

console.log('')
console.log('=== FIX 2: gallery gating must consider imageMap ===')
{
  const p = path.join(WB, 'templates', 'backend', 'lib', 'control-flags.ts')
  let t = fs.readFileSync(p, 'utf8')
  // make renderableSections accept imageMap and treat gallery as present if either source has images
  t = t.replace(
    'export function renderableSections(config: any) {\n  const controls = resolveControls(config)',
    'export function renderableSections(config: any, imageMap?: any) {\n  const controls = resolveControls(config)'
  )
  t = t.replace(
    '  const content = {\n    team: config?.team,\n    blogPosts: config?.blogPosts,\n    testimonials: config?.testimonials,\n    faq: config?.faq,\n    services: config?.services,\n    gallery: config?.gallery,\n    pricing: config?.pricing,\n    video: config?.videos || config?.video,\n  }\n  return withBackgrounds(visibleSections(controls.sections, content))',
    `  const galleryFromMap = imageMap?.categories
    ? Object.values(imageMap.categories).reduce((s: number, c: any) => s + ((c as any).images?.length || 0), 0)
    : 0
  const content = {
    team: config?.team,
    blogPosts: config?.blogPosts,
    testimonials: config?.testimonials,
    faq: config?.faq,
    services: config?.services,
    gallery: (config?.gallery?.length || galleryFromMap) ? (config?.gallery?.length ? config.gallery : [{ placeholder: true }]) : [],
    pricing: config?.pricing,
    video: config?.videos || config?.video,
  }
  return withBackgrounds(visibleSections(controls.sections, content))`
  )
  fs.writeFileSync(p, t, 'utf8')
  console.log('  control-flags gallery gating updated')
}

console.log('')
console.log('=== FIX 3: StickyCallBar visible on desktop ===')
{
  const p = path.join(WB, 'templates', 'components', 'features', 'StickyCallBar.tsx')
  if (fs.existsSync(p)) {
    let t = fs.readFileSync(p, 'utf8')
    const before = t
    // remove the md:hidden / mobile-only constraint
    t = t.replace(/md:hidden\s*/g, '')
    t = t.replace(/hidden\s+md:flex/g, 'flex')
    if (t !== before) { fs.writeFileSync(p, t, 'utf8'); console.log('  md:hidden removed') }
    else console.log('  no md:hidden found — check manually')
  }
}

console.log('')
console.log('=== FIX 4: bump cache-buster to v6.0 ===')
{
  const htmls = [path.join(WB, 'templates', 'dashboard', 'index.html')]
    .concat(SITES.map((s) => path.join(ROOT, 'Websites', s, 'public', 'dashboard', 'index.html')))
  for (const p of htmls) {
    if (!fs.existsSync(p)) continue
    let t = fs.readFileSync(p, 'utf8')
    t = t.replace(/(styles\.css|config\.js|app\.js|tutorial\.js)\?v=[0-9.]+/g, '$1?v=6.0')
    fs.writeFileSync(p, t, 'utf8')
    console.log('  bumped', p.split('/').slice(-3).join('/'))
  }
}

console.log('')
console.log('=== FIX 5: copy WhatsAppGate + updated lib into sites ===')
{
  for (const site of SITES) {
    const base = path.join(ROOT, 'Websites', site)
    fs.copyFileSync(path.join(WB, 'templates', 'backend', 'lib', 'control-flags.ts'), path.join(base, 'lib', 'control-flags.ts'))
    fs.copyFileSync(path.join(WB, 'templates', 'backend', 'components', 'WhatsAppGate.tsx'), path.join(base, 'components', 'WhatsAppGate.tsx'))
  }
  console.log('  synced control-flags.ts + WhatsAppGate.tsx')
}

console.log('\n=== done ===')
