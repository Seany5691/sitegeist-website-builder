const fs = require('fs')
const t = fs.readFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering/public/dashboard/assets/app.js', 'utf8')

const critical = [
  'SECTION_FIELDS', 'FEATURE_FIELDS', 'SECTION_VIEWS',
  'renderFeatureCardBody', 'renderFeatureField', 'renderFeatureList',
  'writeFeatureFieldsFromDom', 'applySectionView', 'hydrateSectionView',
  'ensureSectionView', 'ensureFeatureData', 'getFeatureData',
  'isSectionEditor', 'saveSectionData', 'harvestSectionEditors',
  'harvestPendingFormEdits', 'getWebsiteControls',
  'onFeaturesGridClick', 'onFeaturesGridChange', 'onFeaturesGridFileChange',
  'refreshFeatureViews', 'saveSingleFeature',
  'markDirty', 'setDirty', 'updateFloatingSave',
  'CONTROL_SECTIONS', 'CONTROL_PAGE_DEFAULTS', 'CONTROL_PAGES',
  'FEATURE_DEFS', 'SECTION_FEATURE_KEY',
  'loadLocationIdentity', 'applyLocationIdentityFields', 'saveLocationIdentity',
  'toMapEmbedUrl',
  'renderVslFields', 'saveVsl', 'normalizeVslData',
  'renderTrustBadgesPreview', 'renderBadgePreviewItems', 'refreshBadgePreview',
  'reorderArray', 'makeDraggable',
  'saveSiteConfig', 'switchSection',
  'loadServices', 'loadHeroContent', 'loadAboutContent', 'loadPageContent',
  'loadGalleryFolders', 'loadTestimonials', 'loadTeam', 'loadFaq', 'loadPricing',
  'loadBlogPosts', 'openServiceEditor', 'openTestimonialEditor',
  'showToast', 'showConfirm', 'showPrompt',
  'escapeHtml',
]

let found = 0
let missing = []
for (const fn of critical) {
  const exists = t.includes('function ' + fn) || t.includes(fn + ' =') || t.includes(fn + '=') || t.includes('const ' + fn) || t.includes('var ' + fn) || t.includes('let ' + fn) || t.includes(fn + ':')
  if (exists) { found++ } else { missing.push(fn) }
}

console.log('Found: ' + found + '/' + critical.length)
if (missing.length > 0) {
  console.log('MISSING:', missing.join(', '))
} else {
  console.log('ALL CRITICAL FUNCTIONS PRESENT ✓')
}

// Check SECTION_FIELDS has the restored entries
const sfEntries = ['process', 'latestWork', 'partners', 'awards', 'instagram', 'newsletter', 'statsBar', 'video', 'hours', 'beforeAfter', 'trustBadges', 'serviceAreas', 'location', 'vsl']
console.log('\nSECTION_FIELDS entries:')
for (const e of sfEntries) {
  console.log('  ' + e + ':', t.includes('"' + e + '":') ? '✓' : '✗')
}
