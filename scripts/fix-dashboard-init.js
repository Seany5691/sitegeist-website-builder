const fs = require('fs')

const WB = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder'

// Ensure dashboard-enhancements.js has renderContentMasterList + navigation editor
const enhPath = WB + '/templates/dashboard/assets/dashboard-enhancements.js'
let enh = fs.readFileSync(enhPath, 'utf8')

// Add navigation editor if missing
if (!enh.includes('renderNavigationEditor')) {
  enh += `

// ── Phase 5: Navigation editor ──────────────────────────────────────────────

function renderNavigationEditor(containerId) {
  const el = document.getElementById(containerId)
  if (!el) return
  const config = window.siteConfig || {}
  const nav = config.navigation || {}

  const items = [
    { key: 'home', label: nav.home || 'Home', locked: true },
    { key: 'services', label: nav.services || 'Services' },
    { key: 'portfolio', label: nav.portfolio || 'Portfolio' },
    { key: 'about', label: nav.about || 'About' },
    { key: 'contact', label: nav.contact || 'Contact' },
    { key: 'team', label: nav.team || 'Team' },
    { key: 'blog', label: nav.blog || 'Blog' },
    { key: 'reviews', label: nav.reviews || 'Reviews' },
    { key: 'faq', label: nav.faq || 'FAQ' },
    { key: 'areas', label: nav.areas || 'Areas' },
    { key: 'process', label: nav.navProcess || 'How We Work' },
    { key: 'latestWork', label: nav.navLatestWork || 'Latest Work' },
    { key: 'partners', label: nav.navPartners || 'Partners' },
    { key: 'awards', label: nav.navAwards || 'Awards' },
    { key: 'instagram', label: nav.navInstagram || 'Instagram' },
    { key: 'newsletter', label: nav.navNewsletter || 'Newsletter' },
    { key: 'statsBar', label: nav.navStats || 'Stats' },
    { key: 'video', label: nav.navVideo || 'Video' },
  ]

  el.innerHTML = \`
    <div class="nav-editor">
      <p class="help-text">Edit what visitors see in the website menu. Drag to reorder.</p>
      <div class="nav-editor-list">
        \${items.map((item, i) => \`
          <div class="nav-editor-row" data-key="\${item.key}">
            <div class="composer-drag">⠿</div>
            <input type="text" class="nav-label-input" data-key="\${item.key}"
              value="\${String(item.label).replace(/"/g, '&quot;')}"
              \${item.locked ? 'disabled' : ''}>
            \${item.locked ? '<span class="composer-locked">locked</span>' : ''}
          </div>
        \`).join('')}
      </div>
    </div>
  \`

  el.querySelectorAll('.nav-label-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const key = e.target.dataset.key
      const val = e.target.value.trim()
      if (!window.siteConfig.navigation) window.siteConfig.navigation = {}
      // Map internal keys to siteConfig.navigation keys
      const keyMap = {
        home: 'home', services: 'services', portfolio: 'portfolio',
        about: 'about', contact: 'contact', team: 'team', blog: 'blog',
        reviews: 'reviews', faq: 'faq', areas: 'areas',
        process: 'navProcess', latestWork: 'navLatestWork',
        partners: 'navPartners', awards: 'navAwards',
        instagram: 'navInstagram', newsletter: 'navNewsletter',
        statsBar: 'navStats', video: 'navVideo',
      }
      const cfgKey = keyMap[key] || key
      window.siteConfig.navigation[cfgKey] = val
      markDirty()
    })
  })
}

function initNavigationEditor() {
  if (typeof renderNavigationEditor !== 'function') return
  renderNavigationEditor('navigationEditorContainer')
}
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initNavigationEditor, 800)
})
`
  fs.writeFileSync(enhPath, enh, 'utf8')
  console.log('navigation editor added')
} else {
  console.log('navigation editor already present')
}

// Ensure initContentMaster and initPageComposer fire AFTER siteConfig loads
const appPath = WB + '/templates/dashboard/assets/app.js'
let app = fs.readFileSync(appPath, 'utf8')

// Replace fragile DOMContentLoaded+setTimeout with a call after siteConfig is ready
if (app.includes('setTimeout(initContentMaster, 600)')) {
  app = app.replace(
    /document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*setTimeout\(initContentMaster, 600\)\s*\}\)/,
    `// Init after site data loads — hooked into ensureSiteDataLoaded completion
if (typeof window.__initDashboardExtras !== 'function') {
  window.__initDashboardExtras = function() {
    try { initContentMaster() } catch(e) { console.warn('contentMaster', e) }
    try { initPageComposer() } catch(e) { console.warn('pageComposer', e) }
    try { initNavigationEditor() } catch(e) { console.warn('navigation', e) }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Poll until siteConfig is ready, then init
  const iv = setInterval(() => {
    if (typeof siteConfig !== 'undefined' && siteConfig && Object.keys(siteConfig).length > 0) {
      clearInterval(iv)
      window.__initDashboardExtras()
    }
  }, 200)
  // Fallback: init after 3s regardless
  setTimeout(() => { clearInterval(iv); window.__initDashboardExtras() }, 3000)
})`
  )
  fs.writeFileSync(appPath, app, 'utf8')
  console.log('init timing fixed')
} else {
  console.log('init timing already ok')
}

// Sync to all sites
for (const s of ['mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop', 'rvs_plumbing_potchefstroom_klerksdorp']) {
  const dest = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/' + s + '/public/dashboard/assets'
  fs.copyFileSync(enhPath, dest + '/dashboard-enhancements.js')
  fs.copyFileSync(appPath, dest + '/app.js')
  console.log('synced', s)
}
