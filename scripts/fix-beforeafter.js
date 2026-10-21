const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components/gallery/BeforeAfter.tsx'
let t = fs.readFileSync(p, 'utf8')

// The dashboard writes { title, pairs: [{before, after, caption}] } into
// featureData.beforeAfter. The old code read `.items` so pairs was always
// empty and the section returned null.
const OLD = `  const pc = config?.featureData?.beforeAfter || config?.beforeAfter || {}
  const pairs = config?.featureData?.beforeAfter?.items || config?.beforeAfter || []

  if (!Array.isArray(pairs) || pairs.length === 0) return null

  const title = config?.beforeAfterTitle || pc.beforeAfterTitle || 'See the Difference'
  const subtitle = config?.beforeAfterSubtitle || pc.beforeAfterSubtitle || 'Before & After'`

const NEW = `  // Dashboard writes featureData.beforeAfter = { title, pairs: [{before, after, caption}] }
  const pc = config?.featureData?.beforeAfter || config?.beforeAfter || {}
  const pairs =
    (Array.isArray(pc.pairs) && pc.pairs.length ? pc.pairs : null) ||
    (Array.isArray(pc.items) && pc.items.length ? pc.items : null) ||
    (Array.isArray(config?.beforeAfter) ? config.beforeAfter : null) ||
    []

  if (!Array.isArray(pairs) || pairs.length === 0) return null

  const title = pc.title || config?.beforeAfterTitle || 'See the Difference'
  const subtitle = pc.subtitle || config?.beforeAfterSubtitle || 'Before & After'`

if (t.includes(OLD)) {
  t = t.split(OLD).join(NEW)
  fs.writeFileSync(p, t, 'utf8')
  console.log('BeforeAfter data source fixed')
} else {
  console.log('BeforeAfter anchor not matched — showing current head')
  console.log(t.split('\n').slice(5, 20).join('\n'))
}
