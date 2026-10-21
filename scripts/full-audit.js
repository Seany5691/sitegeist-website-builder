const fs = require('fs')
const appJs = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/app.js', 'utf8')
const html = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/index.html', 'utf8')

// For each section, find: SECTION_FIELDS def OR custom HTML + JS functions
const SECTIONS = [
  'statsBar', 'process', 'latestWork', 'partners', 'video',
  'pricing', 'awards', 'instagram', 'newsletter',
  'testimonials', 'faq', 'beforeAfter', 'trustBadges',
  'serviceAreas', 'location', 'blogStrip', 'vsl'
]

for (const id of SECTIONS) {
  console.log('\n═══════════════════════════════════════════')
  console.log('SECTION:', id)
  console.log('═══════════════════════════════════════════')

  // Check SECTION_FIELDS
  const sfIdx = appJs.indexOf('"' + id + '":')
  if (sfIdx > -1 && sfIdx < appJs.indexOf('const SECTION_VIEWS')) {
    const block = appJs.slice(sfIdx, sfIdx + 800)
    const fieldCount = (block.match(/"key":/g) || []).length
    const hasList = block.includes('"type": "list"')
    console.log('  TYPE: SECTION_FIELDS (' + fieldCount + ' fields, list: ' + hasList + ')')
  } else {
    console.log('  TYPE: custom / no SECTION_FIELDS')
  }

  // Check HTML section
  const htmlIdx = html.indexOf('id="' + id + '"')
  if (htmlIdx > -1) {
    const secStart = html.lastIndexOf('<section', htmlIdx)
    const secEnd = html.indexOf('</section>', secStart)
    const block = html.slice(secStart, secEnd + 10)
    console.log('  HTML: ' + block.length + ' chars')
    // Check for key elements
    const hasList = block.includes('List') || block.includes('list')
    const hasAdd = block.includes('Add') || block.includes('add')
    const hasSave = block.includes('save') || block.includes('Save')
    console.log('  Has list container:', hasList)
    console.log('  Has Add button:', hasAdd)
    console.log('  Has Save button:', hasSave)
  } else {
    console.log('  HTML: NOT FOUND')
  }

  // Check JS functions
  const fnPatterns = [
    new RegExp('function.*' + id.replace(/[A-Z]/g, m => '.*' + m.toLowerCase()), 'i'),
    new RegExp('function.*' + id.replace(/([A-Z])/g, '$1'), 'i'),
  ]
  const fns = []
  for (const fn of ['load', 'render', 'save', 'add', 'edit', 'delete', 'open']) {
    const re = new RegExp('function ' + fn + '[A-Z]' + id.slice(0, 1).toUpperCase() + id.slice(1), 'i')
    const m = appJs.match(re)
    if (m) fns.push(m[0])
    // Also try camelCase variants
    const re2 = new RegExp('function ' + fn + '[A-Z][a-zA-Z]*', 'g')
    const allMatches = appJs.match(re2) || []
    for (const am of allMatches) {
      if (am.toLowerCase().includes(id.toLowerCase().slice(0, 4))) {
        if (!fns.includes(am)) fns.push(am)
      }
    }
  }
  console.log('  JS functions:', fns.length > 0 ? fns.join(', ') : 'NONE')
}
