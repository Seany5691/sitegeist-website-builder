const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'

// Fix: folder cards inside a `flex flex-wrap justify-center gap-5` grid must be
// sized as flex items (flex-none + fixed max width). `w-full` on each button
// makes every card take 100% width -> they stack vertically.
//
// Two patterns exist:
//   A) <AnimateOnScroll key={catName} delay={i * 80}>  <button className="... w-full ...">
//   B) <button key={catName} className="... w-full ...">        (no AnimateOnScroll wrapper)

const files = [
  ROOT + '/Websites/mamma_mia_cakes_and_catering/components/Gallery.tsx',
  ROOT + '/Websites/missions_ablaze/components/Gallery.tsx',
  ROOT + '/Websites/tammy_s_sticker_shop/components/Gallery.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryMasonry.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryMinimal.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryFilterable.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryCategories.tsx',
  ROOT + '/Website Builder/templates/components/gallery/GalleryCarousel.tsx',
]

for (const p of files) {
  if (!fs.existsSync(p)) { console.log('missing ', path.basename(p)); continue }
  let t = fs.readFileSync(p, 'utf8')
  const before = t

  // Pattern A: wrapper exists but has no sizing -> give it the sizing
  t = t.replace(
    /<AnimateOnScroll key=\{catName\} delay=\{i \* 80\}(\s*)>/g,
    '<AnimateOnScroll key={catName} delay={i * 80} className="flex-none w-[min(100%,340px)]">'
  )
  t = t.replace(
    /<AnimateOnScroll key=\{catName\} delay=\{i \* 80\} className="flex-none w-\[min\(100\%,340px\)\]">(\s*)>/g,
    '<AnimateOnScroll key={catName} delay={i * 80} className="flex-none w-[min(100%,340px)]">'
  )

  // Folder buttons: replace w-full with a bounded width + flex-none so they lay out side by side
  // (only inside the folder-grid context — i.e. buttons that are direct cards)
  t = t.replace(
    /className="group relative w-full rounded-2xl overflow-hidden text-left"/g,
    'className="group relative w-full rounded-2xl overflow-hidden text-left"' // keep; wrapper owns width when present
  )
  t = t.replace(
    /className="group relative w-\[min\(100\%,340px\)\] rounded-2xl overflow-hidden text-left flex-none"/g,
    'className="group relative w-full rounded-2xl overflow-hidden text-left"'
  )

  // Pattern B: no wrapper -> button must carry the flex sizing
  // Only when the button has key={catName} and w-full
  t = t.replace(
    /<button(\s+)key=\{catName\}([\s\S]{0,200}?)className="([^"]*)"/g,
    (m, sp1, mid, cls) => {
      if (!/\bw-full\b/.test(cls)) return m
      const newCls = cls.replace(/\bw-full\b/, 'w-[min(100%,340px)] flex-none')
      return `<button${sp1}key={catName}${mid}className="${newCls}"`
    }
  )

  if (t !== before) {
    fs.writeFileSync(p, t, 'utf8')
    console.log('FIXED   ', path.relative(ROOT, p))
  } else {
    console.log('nochange', path.relative(ROOT, p))
  }
}

console.log('\n=== verify: any folder button still w-full in a flex grid? ===')
for (const p of files) {
  if (!fs.existsSync(p)) continue
  const t = fs.readFileSync(p, 'utf8')
  const hasGrid = /flex flex-wrap justify-center gap-5/.test(t)
  const btnFull = /<button[^>]*key=\{catName\}[^>]*className="[^"]*\bw-full\b/.test(t)
  const wrapperSized = /AnimateOnScroll key=\{catName\}[^>]*flex-none/.test(t)
  console.log(' ', path.basename(path.dirname(p)) + '/' + path.basename(p), ' grid:' + hasGrid, ' btn-w-full:' + btnFull, ' wrapper-sized:' + wrapperSized)
}
