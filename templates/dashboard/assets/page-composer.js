/**
 * Per-page section composer for the dashboard.
 * Lets the client choose which sections appear on each page and in what order.
 *
 * site-config.pageSections = {
 *   home: [{ id: 'hero', enabled: true }, { id: 'services', enabled: true }, ...],
 *   services: [{ id: 'hero', enabled: true }, { id: 'process', enabled: true }, ...],
 * }
 */

// Registry of all sections that can be placed on any page
const PAGE_SECTION_LIBRARY = [
  { id: 'hero', label: 'Hero', locked: true },
  { id: 'statsBar', label: 'Stats / By the Numbers' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process / How It Works' },
  { id: 'gallery', label: 'Gallery / Portfolio' },
  { id: 'beforeAfter', label: 'Before / After' },
  { id: 'latestWork', label: 'Latest Work / Case Studies' },
  { id: 'testimonials', label: 'Testimonials / Reviews' },
  { id: 'trustBadges', label: 'Trust Badges' },
  { id: 'about', label: 'About / Story' },
  { id: 'team', label: 'Team' },
  { id: 'partners', label: 'Partners / Sponsors' },
  { id: 'video', label: 'Video' },
  { id: 'serviceAreas', label: 'Service Areas' },
  { id: 'location', label: 'Location / Map' },
  { id: 'pricing', label: 'Pricing / Packages' },
  { id: 'faq', label: 'FAQ' },
  { id: 'blogStrip', label: 'Blog (latest posts)' },
  { id: 'awards', label: 'Awards / Press' },
  { id: 'instagram', label: 'Instagram / Social Feed' },
  { id: 'newsletter', label: 'Newsletter Block' },
  { id: 'cta', label: 'CTA Banner', locked: true },
  { id: 'contact', label: 'Contact', locked: true },
  { id: 'vsl', label: 'VSL (Video Sales Letter)' },
]

const PAGE_LIST = [
  { id: 'home', label: 'Homepage' },
  { id: 'services', label: 'Services Page' },
  { id: 'portfolio', label: 'Portfolio Page' },
  { id: 'about', label: 'About Page' },
  { id: 'contact', label: 'Contact Page' },
  { id: 'teamPage', label: 'Team Page' },
  { id: 'blogPage', label: 'Blog Page' },
  { id: 'faqPage', label: 'FAQ Page' },
  { id: 'reviewsPage', label: 'Reviews Page' },
  { id: 'areasPage', label: 'Areas Page' },
  { id: 'privacy', label: 'Privacy Page' },
]

let currentPageId = 'home'

/** Render the per-page section composer into the given container. */
function renderPageComposer(containerId, pageId) {
  currentPageId = pageId
  const el = document.getElementById(containerId)
  if (!el) return
  const config = window.siteConfig || {}
  const pageSecs = config.pageSections?.[pageId] || []

  // Build ordered list: configured first, then remaining library items
  const configuredIds = pageSecs.map((s) => (typeof s === 'string' ? s : s.id))
  const rows = [
    ...pageSecs.map((s) => ({
      id: typeof s === 'string' ? s : s.id,
      enabled: typeof s === 'string' ? true : s.enabled !== false,
    })),
    ...PAGE_SECTION_LIBRARY.filter((s) => !configuredIds.includes(s.id)).map((s) => ({
      id: s.id,
      enabled: false,
    })),
  ]

  el.innerHTML = `
    <div class="page-composer">
      <div class="page-composer-header">
        <h3>Sections on this page</h3>
        <p class="help-text">Drag to reorder. Toggle to show/hide. This only affects this page.</p>
      </div>
      <div class="page-composer-list" id="pageComposerList">
        ${rows
          .map((r, i) => {
            const lib = PAGE_SECTION_LIBRARY.find((s) => s.id === r.id) || { label: r.id, locked: false }
            return `
            <div class="page-composer-row${r.enabled ? ' on' : ''}" data-id="${r.id}" data-index="${i}">
              <div class="composer-drag">⠿</div>
              <label class="composer-toggle">
                <input type="checkbox" ${r.enabled ? 'checked' : ''} ${lib.locked ? 'disabled' : ''}
                  data-id="${r.id}" class="composer-check" />
                <span class="toggle-switch"></span>
              </label>
              <div class="composer-label">
                <span class="composer-name">${lib.label}</span>
                ${lib.locked ? '<span class="composer-locked">locked</span>' : ''}
              </div>
              <button type="button" class="composer-edit" data-id="${r.id}">
                <i class="fas fa-chevron-down"></i> Edit
              </button>
            </div>
            <div class="composer-editor" data-editor-for="${r.id}" style="display:none">
              <!-- Section-specific editor loads here -->
              <div class="composer-editor-body" data-section-editor="${r.id}"></div>
            </div>`
          })
          .join('')}
      </div>
    </div>
  `

  // Wire toggles
  el.querySelectorAll('.composer-check').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id
      const on = e.target.checked
      setPageSectionEnabled(pageId, id, on)
      e.target.closest('.page-composer-row').classList.toggle('on', on)
      markDirty()
    })
  })

  // Wire edit expand
  el.querySelectorAll('.composer-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id
      const editor = el.querySelector(`[data-editor-for="${id}"]`)
      if (editor) {
        const open = editor.style.display !== 'none'
        editor.style.display = open ? 'none' : 'block'
        if (!open) {
          // Load the section editor inline if available
          loadInlineSectionEditor(id, editor.querySelector('[data-section-editor]'))
        }
      }
    })
  })
}

function setPageSectionEnabled(pageId, sectionId, enabled) {
  if (!window.siteConfig) window.siteConfig = {}
  if (!window.siteConfig.pageSections) window.siteConfig.pageSections = {}
  if (!Array.isArray(window.siteConfig.pageSections[pageId])) {
    window.siteConfig.pageSections[pageId] = []
  }
  const list = window.siteConfig.pageSections[pageId]
  const idx = list.findIndex((s) => (typeof s === 'string' ? s : s.id) === sectionId)
  if (idx >= 0) {
    if (typeof list[idx] === 'string') list[idx] = { id: list[idx], enabled }
    else list[idx].enabled = enabled
  } else {
    list.push({ id: sectionId, enabled })
  }
}

/** Reorder: move section up or down within a page. */
function movePageSection(pageId, sectionId, direction) {
  if (!window.siteConfig?.pageSections?.[pageId]) return
  const list = window.siteConfig.pageSections[pageId]
  const idx = list.findIndex((s) => (typeof s === 'string' ? s : s.id) === sectionId)
  const target = idx + direction
  if (idx < 0 || target < 0 || target >= list.length) return
  const [item] = list.splice(idx, 1)
  list.splice(target, 0, item)
  renderPageComposer('pageComposerContainer', pageId)
  markDirty()
}

function loadInlineSectionEditor(sectionId, container) {
  if (!container) return
  // If SECTION_FIELDS has an editor for this section, render it inline
  if (typeof isSectionEditor === 'function' && isSectionEditor(sectionId)) {
    container.innerHTML = `<div class="inline-editor" data-inline="${sectionId}">
      <div class="inline-editor-body" id="inline_${sectionId}"></div>
      <button type="button" class="secondary-btn" onclick="saveSectionData('${sectionId}')">
        <i class="fas fa-save"></i> Save ${sectionId}
      </button>
    </div>`
    if (typeof renderSectionFields === 'function') {
      renderSectionFields(sectionId)
      // Re-parent the rendered fields into our inline container
      const src = document.getElementById(sectionId + 'Fields') || document.querySelector(`[data-section-editor="${sectionId}"]`)
      if (src && container) {
        // renderSectionFields populates the standard container; copy HTML
        const standard = document.getElementById(sectionId + 'Fields')
        if (standard && standard.innerHTML.trim()) {
          container.innerHTML = standard.innerHTML
        }
      }
    }
  } else {
    container.innerHTML = `<p class="help-text">Edit this section's content from its main tab above.</p>`
  }
}
