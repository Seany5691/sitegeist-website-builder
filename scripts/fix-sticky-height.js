const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components/features/StickyHeader.tsx'
let t = fs.readFileSync(p, 'utf8')

// Remove the forced height / min-height lines — they stack with the header's
// own fixed height and make the bar GROW instead of shrink. The shrink should
// come from tighter padding + shadow + solid background only.
const lines = t.split('\n')
const kept = lines.filter((l) => {
  const s = l.trim()
  if (/^min-height: \$\{shrinkHeight\}px !important;$/.test(s)) return false
  if (/^height: \$\{shrinkHeight\}px !important;$/.test(s)) return false
  return true
})
t = kept.join('\n')
fs.writeFileSync(p, t, 'utf8')

const check = fs.readFileSync(p, 'utf8')
const i = check.indexOf('header.header-shrunk')
console.log('--- header-shrunk block after fix ---')
console.log(check.slice(i, i + 420))
console.log('')
console.log('forced min-height removed:', !check.includes('min-height: ${shrinkHeight}px'))
console.log('forced height removed   :', !check.includes('height: ${shrinkHeight}px'))
