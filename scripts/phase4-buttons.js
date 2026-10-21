const fs = require('fs')
const path = require('path')

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/missions_ablaze',
]

for (const site of SITES) {
  const name = site.split('/').pop()
  const p = path.join(site, 'public', 'dashboard', 'assets', 'content-pages.js')
  if (!fs.existsSync(p)) continue

  let cp = fs.readFileSync(p, 'utf8')
  const before = cp

  // Phase 4.1: Move "Add Testimonial" button below heading card, above list
  // The CP_HTML_TESTIMONIALS has the button in section-header-actions
  // Find and relocate it
  cp = cp.replace(
    /(CP_HTML_TESTIMONIALS = `[\s\S]*?)<button[^>]*onclick="openTestimonialEditor\(\)"[^>]*>[\s\S]*?<\/button>/,
    '$1__ADD_TESTIMONIAL_BTN_PLACEHOLDER__'
  )
  // Now insert the button after the heading card (after the feature-save-row or content-page-card close)
  cp = cp.replace(
    /(CP_HTML_TESTIMONIALS = `[\s\S]*?Save heading[\s\S]*?<\/button>\s*<\/div>)/,
    '$1\n  <button type="button" class="primary-btn" onclick="openTestimonialEditor()" style="width:100%;margin:12px 0"><i class="fas fa-plus"></i> Add Testimonial</button>'
  )
  // Remove placeholder
  cp = cp.replace('__ADD_TESTIMONIAL_BTN_PLACEHOLDER__', '')

  // Phase 4.2: Move "Add FAQ" button above FAQ list, below heading card
  cp = cp.replace(
    /(CP_HTML_FAQ = `[\s\S]*?)<button[^>]*onclick="openFaqEditor\(\)"[^>]*>[\s\S]*?<\/button>/,
    '$1__ADD_FAQ_BTN_PLACEHOLDER__'
  )
  cp = cp.replace(
    /(CP_HTML_FAQ = `[\s\S]*?Save heading[\s\S]*?<\/button>\s*<\/div>)/,
    '$1\n  <button type="button" class="primary-btn" onclick="openFaqEditor()" style="width:100%;margin:12px 0"><i class="fas fa-plus"></i> Add FAQ</button>'
  )
  cp = cp.replace('__ADD_FAQ_BTN_PLACEHOLDER__', '')

  if (cp !== before) {
    fs.writeFileSync(p, cp)
    try { new Function(cp); console.log(name + ': buttons moved + VALID') } catch (e) { console.log(name + ': ERROR - ' + e.message) }
  } else {
    console.log(name + ': no changes matched')
  }
}

// Sync WB
const src = fs.readFileSync(path.join(SITES[0], 'public', 'dashboard', 'assets', 'content-pages.js'), 'utf8')
fs.writeFileSync('C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/dashboard/assets/content-pages.js', src)
console.log('WB: synced')
console.log('Phase 4 Done.')
