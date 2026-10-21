const fs = require('fs')
const path = require('path')

// Check untracked files that might have lost code
const base = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/'

// 1. Check dashboard-enhancements.js
const enhPath = base + 'public/dashboard/assets/dashboard-enhancements.js'
if (fs.existsSync(enhPath)) {
  const t = fs.readFileSync(enhPath, 'utf8')
  console.log('dashboard-enhancements.js:', t.length, 'chars')
  console.log('  Has renderFeatureCardBody:', t.includes('renderFeatureCardBody'))
  console.log('  Has SECTION_FIELDS:', t.includes('SECTION_FIELDS'))
  console.log('  Has FEATURE_FIELDS:', t.includes('FEATURE_FIELDS'))
}

// 2. Check content-pages.js (should have survived)
const cpPath = base + 'public/dashboard/assets/content-pages.js'
if (fs.existsSync(cpPath)) {
  const t = fs.readFileSync(cpPath, 'utf8')
  console.log('\ncontent-pages.js:', t.length, 'chars')
  console.log('  Has renderFeatureCardBody call:', t.includes('renderFeatureCardBody'))
  console.log('  Has isSectionEditor call:', t.includes('isSectionEditor'))
  console.log('  Has applySectionView call:', t.includes('applySectionView'))
  console.log('  Has hydrateSectionView call:', t.includes('hydrateSectionView'))
}

// 3. Check index.html for inline scripts with lost functions
const htmlPath = base + 'public/dashboard/index.html'
const html = fs.readFileSync(htmlPath, 'utf8')
console.log('\nindex.html inline scripts with lost functions:')
const inlineScripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
for (const s of inlineScripts) {
  const code = s[1]
  if (code.includes('SECTION_FIELDS') || code.includes('renderFeatureCardBody') || code.includes('FEATURE_FIELDS')) {
    console.log('  Found inline script with lost code! Length:', code.length)
  }
}

// 4. Check page-composer.js
const pcPath = base + 'public/dashboard/assets/page-composer.js'
if (fs.existsSync(pcPath)) {
  const t = fs.readFileSync(pcPath, 'utf8')
  console.log('\npage-composer.js:', t.length, 'chars')
  console.log('  Has renderFeatureCardBody:', t.includes('renderFeatureCardBody'))
}

// 5. Check for any .next cached JS
const nextPath = base + '.next'
if (fs.existsSync(nextPath)) {
  console.log('\n.next directory exists')
  // Check if there's a cached version
  try {
    const files = fs.readdirSync(nextPath, { recursive: true }).filter(f => f.toString().includes('app'))
    console.log('  Files matching app:', files.length)
  } catch (e) {
    console.log('  Error reading .next:', e.message)
  }
}

// 6. Check git for any staged versions
const { execSync } = require('child_process')
try {
  const result = execSync('cd "' + base + '" && git diff --cached --stat 2>&1', { encoding: 'utf8' })
  console.log('\nGit staged changes:', result.trim() || 'none')
} catch (e) {
  console.log('\nGit staged:', 'error')
}

// 7. Check if the original commit has anything useful
try {
  const result = execSync('cd "' + base + '" && git log --oneline -5 2>&1', { encoding: 'utf8' })
  console.log('\nGit log:', result.trim())
} catch (e) {}
