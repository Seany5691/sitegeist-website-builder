const fs = require('fs')

// Check current state
const t = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/app.js', 'utf8')
console.log('=== CURRENT (git-restored) app.js ===')
console.log('Size:', t.length, 'chars,', t.split('\n').length, 'lines')

// Check what functions exist
const criticalFns = [
  'saveSiteConfig', 'harvestPendingFormEdits', 'getWebsiteControls',
  'renderFeatureCardBody', 'renderFeatureField', 'renderFeatureList',
  'writeFeatureFieldsFromDom', 'applySectionView', 'hydrateSectionView',
  'isSectionEditor', 'ensureSectionView', 'saveSectionData',
  'loadServices', 'loadHeroContent', 'loadAboutContent', 'loadPageContent',
  'loadGalleryFolders', 'loadTestimonials', 'loadTeam', 'loadFaq', 'loadPricing',
  'loadBlogPosts', 'openServiceEditor', 'openTestimonialEditor',
  'switchSection', 'markDirty', 'showToast',
  'onFeaturesGridClick', 'onFeaturesGridChange',
  'loadLocationIdentity', 'saveLocationIdentity',
  'renderVslFields', 'saveVsl', 'normalizeVslData',
  'renderTrustBadgesPreview',
]
console.log('\n=== Functions present ===')
for (const fn of criticalFns) {
  const exists = t.includes('function ' + fn) || t.includes(fn + ' =') || t.includes(fn + '=')
  console.log('  ' + fn + ':', exists ? '✓' : '✗ MISSING')
}

// Check for SECTION_FIELDS and FEATURE_FIELDS
console.log('\n=== Key data structures ===')
console.log('SECTION_FIELDS:', t.includes('SECTION_FIELDS') ? '✓' : '✗ MISSING')
console.log('FEATURE_FIELDS:', t.includes('FEATURE_FIELDS') ? '✓' : '✗ MISSING')
console.log('SECTION_VIEWS:', t.includes('SECTION_VIEWS') ? '✓' : '✗ MISSING')
console.log('CONTROL_SECTIONS:', t.includes('CONTROL_SECTIONS') ? '✓' : '✗ MISSING')
console.log('FEATURE_DEFS:', t.includes('FEATURE_DEFS') ? '✓' : '✗ MISSING')
