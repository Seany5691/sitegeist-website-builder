/**
 * Phase 2-6 — Dashboard enhancements.
 * Master content list (section↔page duality), services sub-menus,
 * content independence, settings hub, and visual polish helpers.
 */

// ── Phase 2: Master content list (section / page / both / off) ──────────────

const SECTION_PAGE_MODES = [
  { id: 'hero', label: 'Hero', locked: true },
  { id: 'services', label: 'Services', hasSubmenu: true },
  { id: 'process', label: 'Process / How It Works' },
  { id: 'team', label: 'Team' },
  { id: 'faq', label: 'FAQ' },
  { id: 'gallery', label: 'Gallery / Portfolio' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'about', label: 'About / Story' },
  { id: 'statsBar', label: 'Stats / By the Numbers' },
  { id: 'blogStrip', label: 'Blog' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'areas', label: 'Service Areas' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'video', label: 'Video' },
  { id: 'latestWork', label: 'Latest Work' },
  { id: 'beforeAfter', label: 'Before / After' },
  { id: 'partners', label: 'Partners' },
  { id: 'awards', label: 'Awards / Press' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'instagram', label: 'Instagram / Social' },
  { id: 'vsl', label: 'VSL' },
]

function renderContentMasterList(containerId) {
  const el = document.getElementById(containerId)
  if (!el) return
  const config = window.siteConfig || {}

  el.innerHTML = `
    <div class="content-master">
      <div class="content-master-header">
        <h3>Content & Pages</h3>
        <p class="help-text">Each item can be a section on a page, its own page, both, or off. Services has sub-menu items.</p>
      </div>
      <div class="content-master-table">
        <div class="content-master-row head">
          <div>Item</div>
          <div>As Section</div>
          <div>As Page</div>
          <div>Menu Name</div>
          <div></div>
        </div>
        ${SECTION_PAGE_MODES.map((item) => {
          const mode = config.sectionPages?.[item.id] || {}
          const asSection = mode.asSection !== false
          const asPage = mode.asPage === true
          const menuLabel = mode.menuLabel || item.label
          return `
          <div class="content-master-row${asSection || asPage ? ' active' : ''}" data-section="${item.id}">
            <div class="cm-name">
              <strong>${item.label}</strong>
              ${item.hasSubmenu ? '<span class="cm-badge">sub-menus</span>' : ''}
              ${item.locked ? '<span class="cm-badge locked">locked</span>' : ''}
            </div>
            <div class="cm-toggle">
              <input type="checkbox" class="cm-section-check" data-id="${item.id}" ${asSection ? 'checked' : ''} ${item.locked ? 'disabled' : ''}>
            </div>
            <div class="cm-toggle">
              <input type="checkbox" class="cm-page-check" data-id="${item.id}" ${asPage ? 'checked' : ''} ${item.locked && item.id === 'hero' ? 'disabled' : ''}>
            </div>
            <div class="cm-label">
              <input type="text" class="cm-menu-label" data-id="${item.id}" value="${escapeHtml(menuLabel)}" ${!asPage ? 'disabled' : ''}>
            </div>
            <div class="cm-actions">
              ${item.hasSubmenu ? `<button type="button" class="cm-edit-sub" data-id="${item.id}">Sub-menus</button>` : ''}
              <button type="button" class="cm-edit-content" data-id="${item.id}">Edit content</button>
            </div>
          </div>`
        }).join('')}
      </div>
    </div>
  `

  // Wire toggles
  el.querySelectorAll('.cm-section-check').forEach((input) => {
    input.addEventListener('change', (e) => {
      setSectionPageMode(e.target.dataset.id, { asSection: e.target.checked })
      markDirty()
    })
  })
  el.querySelectorAll('.cm-page-check').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id
      setSectionPageMode(id, { asPage: e.target.checked })
      const labelInput = el.querySelector(`.cm-menu-label[data-id="${id}"]`)
      if (labelInput) labelInput.disabled = !e.target.checked
      e.target.closest('.content-master-row').classList.toggle('active', e.target.checked)
      markDirty()
    })
  })
  el.querySelectorAll('.cm-menu-label').forEach((input) => {
    input.addEventListener('change', (e) => {
      setSectionPageMode(e.target.dataset.id, { menuLabel: e.target.value })
      markDirty()
    })
  })
  el.querySelectorAll('.cm-edit-sub').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      openSubmenuEditor(e.currentTarget.dataset.id)
    })
  })
  el.querySelectorAll('.cm-edit-content').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // Scroll to the section editor for this item
      const id = e.currentTarget.dataset.id
      const target = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`)
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    })
  })
}

function setSectionPageMode(sectionId, mode) {
  if (!window.siteConfig) window.siteConfig = {}
  if (!window.siteConfig.sectionPages) window.siteConfig.sectionPages = {}
  const existing = window.siteConfig.sectionPages[sectionId] || {}
  window.siteConfig.sectionPages[sectionId] = { ...existing, ...mode }
}

// ── Phase 3: Services sub-menus ─────────────────────────────────────────────

function openSubmenuEditor(sectionId) {
  const modal = document.getElementById('submenuModal') || createSubmenuModal()
  modal.classList.remove('hidden')
  renderSubmenuList(sectionId)
}

function createSubmenuModal() {
  const modal = document.createElement('div')
  modal.id = 'submenuModal'
  modal.className = 'modal hidden'
  modal.innerHTML = `
    <div class="modal-overlay" onclick="document.getElementById('submenuModal').classList.add('hidden')"></div>
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h3>Sub-menu items</h3>
        <button class="modal-close" onclick="document.getElementById('submenuModal').classList.add('hidden')"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body" id="submenuBody"></div>
    </div>
  `
  document.body.appendChild(modal)
  return modal
}

function renderSubmenuList(sectionId) {
  const body = document.getElementById('submenuBody')
  if (!body) return
  const config = window.siteConfig || {}
  const items = config.subMenus?.[sectionId] || []

  body.innerHTML = `
    <p class="help-text">Each item is a sub-menu link under the main menu. Editing a sub-item does NOT change the section content elsewhere unless you link them.</p>
    <div class="submenu-behavior">
      <label><input type="radio" name="submenuBehavior" value="scroll" checked> Scroll to section on the page</label>
      <label><input type="radio" name="submenuBehavior" value="page"> Full detail page per item</label>
    </div>
    <div id="submenuList" class="submenu-list">
      ${items.map((item, i) => `
        <div class="submenu-row" data-index="${i}">
          <input type="text" class="submenu-label" value="${escapeHtml(item.label || '')}" placeholder="Label">
          <input type="text" class="submenu-slug" value="${escapeHtml(item.slug || '')}" placeholder="/services/drain-cleaning">
          <label class="submenu-linked"><input type="checkbox" ${item.linked !== false ? 'checked' : ''}> Same as section</label>
          <button type="button" class="submenu-remove" data-index="${i}">×</button>
        </div>
      `).join('')}
    </div>
    <button type="button" class="secondary-btn" onclick="addSubmenuItem('${sectionId}')">+ Add sub-menu item</button>
    <button type="button" class="primary-btn" onclick="saveSubmenuItems('${sectionId}')">Save Sub-menus</button>
  `

  body.querySelectorAll('.submenu-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const list = document.getElementById('submenuList')
      e.target.closest('.submenu-row').remove()
    })
  })
}

function addSubmenuItem(sectionId) {
  const list = document.getElementById('submenuList')
  if (!list) return
  const row = document.createElement('div')
  row.className = 'submenu-row'
  row.innerHTML = `
    <input type="text" class="submenu-label" value="" placeholder="Label">
    <input type="text" class="submenu-slug" value="" placeholder="/services/new-item">
    <label class="submenu-linked"><input type="checkbox" checked> Same as section</label>
    <button type="button" class="submenu-remove" onclick="this.closest('.submenu-row').remove()">×</button>
  `
  list.appendChild(row)
}

function saveSubmenuItems(sectionId) {
  const rows = document.querySelectorAll('#submenuList .submenu-row')
  const items = []
  rows.forEach((row) => {
    const label = row.querySelector('.submenu-label')?.value?.trim()
    const slug = row.querySelector('.submenu-slug')?.value?.trim()
    const linked = row.querySelector('.submenu-linked input')?.checked
    if (label) items.push({ label, slug, linked })
  })
  if (!window.siteConfig) window.siteConfig = {}
  if (!window.siteConfig.subMenus) window.siteConfig.subMenus = {}
  window.siteConfig.subMenus[sectionId] = items
  saveSiteConfig().then((ok) => {
    if (ok) showToast('Sub-menus saved!')
    document.getElementById('submenuModal')?.style && (document.getElementById('submenuModal').style.display = 'none')
  })
}

// ── Phase 5: Settings hub helpers ───────────────────────────────────────────
// (Page Control is the content master list above)
// Navigation editor, Features moved under Settings — handled by existing nav.


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

  el.innerHTML = `
    <div class="nav-editor">
      <p class="help-text">Edit what visitors see in the website menu. Drag to reorder.</p>
      <div class="nav-editor-list">
        ${items.map((item, i) => `
          <div class="nav-editor-row" data-key="${item.key}">
            <div class="composer-drag">⠿</div>
            <input type="text" class="nav-label-input" data-key="${item.key}"
              value="${String(item.label).replace(/"/g, '&quot;')}"
              ${item.locked ? 'disabled' : ''}>
            ${item.locked ? '<span class="composer-locked">locked</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `

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
