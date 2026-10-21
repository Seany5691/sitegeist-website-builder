const fs = require('fs')

const SITES = [
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/mamma_mia_cakes_and_catering',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/tammy_s_sticker_shop',
  'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/rvs_plumbing_potchefstroom_klerksdorp',
]

const NEW_SECTIONS = `
        <!-- ============== CONTENT & PAGES (Phase 2) ============== -->
        <section id="contentMaster" class="section">
          <div class="section-header">
            <h2>Content & Pages</h2>
            <div class="section-header-actions">
              <button class="primary-btn" onclick="saveSiteConfig()">
                <i class="fas fa-save"></i><span>Save All</span>
              </button>
            </div>
          </div>
          <p class="help-text">Each item can be a section on a page, its own page with a menu button, both, or off. Services supports sub-menus.</p>
          <div id="contentMasterContainer"></div>
        </section>

        <!-- ============== PAGE SECTIONS (Phase 1) ============== -->
        <section id="pageComposer" class="section">
          <div class="section-header">
            <h2>Page Sections</h2>
            <div class="section-header-actions">
              <button class="primary-btn" onclick="saveSiteConfig()">
                <i class="fas fa-save"></i><span>Save All</span>
              </button>
            </div>
          </div>
          <p class="help-text">Choose which sections appear on each page and drag to reorder. This only affects that page.</p>
          <div class="editor-field">
            <label for="composerPageSelect">Editing page</label>
            <select id="composerPageSelect" onchange="renderPageComposer('pageComposerContainer', this.value)">
              <option value="home">Homepage</option>
              <option value="services">Services Page</option>
              <option value="portfolio">Portfolio Page</option>
              <option value="about">About Page</option>
              <option value="contact">Contact Page</option>
            </select>
          </div>
          <div id="pageComposerContainer"></div>
        </section>

        <!-- ============== NAVIGATION EDITOR (Phase 5) ============== -->
        <section id="navigation" class="section">
          <div class="section-header">
            <h2>Navigation & Menu</h2>
            <div class="section-header-actions">
              <button class="primary-btn" onclick="saveNavigation()">
                <i class="fas fa-save"></i><span>Save Menu</span>
              </button>
            </div>
          </div>
          <p class="help-text">Edit menu labels, drag to reorder, and manage sub-menu items. What visitors see in the site nav.</p>
          <div id="navigationEditorContainer"></div>
        </section>
`

for (const site of SITES) {
  const name = site.split('/').pop()
  const htmlPath = site + '/public/dashboard/index.html'
  let t = fs.readFileSync(htmlPath, 'utf8')
  let changed = false

  // 1. Add missing section containers if absent
  if (!t.includes('id="contentMaster"')) {
    // Insert before the first section
    t = t.replace(
      '<section id="overview" class="section active">',
      NEW_SECTIONS + '\n        <section id="overview" class="section active">'
    )
    changed = true
    console.log(name, ': sections added')
  } else {
    console.log(name, ': sections already present')
  }

  // 2. Restructure sidebar nav to the full design
  // Replace the old Website Content nav group with the new structure
  const oldNavStart = t.indexOf('data-nav-group="hero content about services')
  if (oldNavStart > 0) {
    // Find the nav group div start
    const navGroupStart = t.lastIndexOf('<div class="nav-group"', oldNavStart)
    // Find the end of this nav group (next nav-group or closing)
    const nextGroup = t.indexOf('data-nav-group="hours seo', oldNavStart)
    const navGroupEnd = nextGroup > 0 ? t.lastIndexOf('<div class="nav-group"', nextGroup) : t.length

    const newNav = `<div class="nav-group" data-nav-group="contentMaster pageComposer hero content about services gallery pricing testimonials team blog faq navigation">Website content</div>
          <a href="#" class="nav-item" data-section="contentMaster">
            <i class="fas fa-layer-group"></i> Content & Pages
          </a>
          <a href="#" class="nav-item" data-section="pageComposer">
            <i class="fas fa-th-large"></i> Page Sections
          </a>
          <a href="#" class="nav-item" data-section="hero">
            <i class="fas fa-image"></i> Hero Section
          </a>
          <a href="#" class="nav-item" data-section="content">
            <i class="fas fa-heading"></i> Page Headings
          </a>
          <a href="#" class="nav-item" data-section="about">
            <i class="fas fa-info-circle"></i> About Page
          </a>
          <a href="#" class="nav-item" data-section="services">
            <i class="fas fa-concierge-bell"></i> Services
          </a>
          <a href="#" class="nav-item" data-section="gallery">
            <i class="fas fa-images"></i> Gallery
          </a>
          <a href="#" class="nav-item" data-section="testimonials">
            <i class="fas fa-star"></i> Testimonials
          </a>
          <a href="#" class="nav-item" data-section="faq">
            <i class="fas fa-question-circle"></i> FAQ
          </a>
          <a href="#" class="nav-item" data-section="navigation">
            <i class="fas fa-bars"></i> Navigation
          </a>

        <div class="nav-group" data-nav-group="statsBar process latestWork partners awards instagram newsletter video vsl">Homepage sections</div>`

    t = t.slice(0, navGroupStart) + newNav + '\n        ' + t.slice(navGroupEnd)
    changed = true
    console.log(name, ': nav restructured')
  }

  if (changed) {
    fs.writeFileSync(htmlPath, t, 'utf8')
    console.log(name, ': saved')
  }
}
