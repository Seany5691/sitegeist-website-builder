const fs = require('fs')
const t = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/app.js', 'utf8')

// Search for SECTION_FIELDS in any form
const allOccurrences = []
for (let i = 0; i < t.length; i++) {
  const idx = t.indexOf('SECTION_FIELDS', i)
  if (idx === -1) break
  allOccurrences.push(idx)
  i = idx
}

console.log('SECTION_FIELDS occurrences:', allOccurrences.length)
for (const idx of allOccurrences.slice(0, 5)) {
  console.log('\nAt char', idx, ':', t.slice(Math.max(0, idx - 50), idx + 100).replace(/\n/g, '\\n'))
}

// Also check for the const declaration
const declIdx = t.indexOf('const SECTION_FIELDS')
const declIdx2 = t.indexOf('var SECTION_FIELDS')
const declIdx3 = t.indexOf('let SECTION_FIELDS')
console.log('\nconst SECTION_FIELDS:', declIdx)
console.log('var SECTION_FIELDS:', declIdx2)
console.log('let SECTION_FIELDS:', declIdx3)

// Check file size and line count
console.log('\nFile size:', t.length, 'chars,', t.split('\n').length, 'lines')
