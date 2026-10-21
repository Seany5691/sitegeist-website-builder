const fs = require('fs')
const path = require('path')

// Fix the folder-stacking bug: sizing classes must live on the AnimateOnScroll
// wrapper (the actual flex child), not on the inner <button>.

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const targets = [
  ROOT + '/Website Builder/templates/components/Gallery.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryMasonry.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryMinimal.tsx',
  ROOT + '/Websites/missions_ablaze/components/Gallery.tsx',
  ROOT + '/Websites/mamma_mia_cakes_and_catering/components/Gallery.tsx',
  ROOT + '/Websites/tammy_s_sticker_shop/components/Gallery.tsx',
]

for (const p of targets) {
  if (!fs.existsSync(p)) { console.log('missing ', path.basename(path.dirname(p)) + '/' + path.basename(p)); continue }
  let t = fs.readFileSync(p, 'utf8')
  const before = t

  // 1. Add sizing to the AnimateOnScroll wrapper around folder cards
  t = t.replace(
    /<AnimateOnScroll key=\{catName\} delay=\{i \* 80\}>/g,
    '<AnimateOnScroll key={catName} delay={i * 80} className="flex-none w-[min(100%,340px)]">'
  )

  // 2. Inner button: full width of its wrapper, no longer owns the flex sizing
  t = t.replace(
    /className="group relative w-\[min\(100\%,340px\)\] rounded-2xl overflow-hidden text-left flex-none"/g,
    'className="group relative w-full rounded-2xl overflow-hidden text-left"'
  )

  if (t !== before) {
    fs.writeFileSync(p, t, 'utf8')
    console.log('FIXED   ', path.basename(path.dirname(p)) + '/' + path.basename(p))
  } else {
    console.log('nochange', path.basename(path.dirname(p)) + '/' + path.basename(p))
  }
}

console.log('\n=== verify the wrapper now carries sizing ===')
for (const p of targets) {
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  const ok = t.includes('<AnimateOnScroll key={catName} delay={i * 80} className="flex-none w-[min(100%,340px)]">')
  console.log(' ', ok ? 'OK ' : 'MISS', path.basename(path.dirname(p)) + '/' + path.basename(p))
}
