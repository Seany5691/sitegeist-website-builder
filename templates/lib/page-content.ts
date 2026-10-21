/**
 * Per-page Hero data model + dashboard editor support.
 *
 * Each page gets its own hero stored in siteConfig.pageHeroes[pageId]:
 *   { headline, subheadline, badge, ctaText, ctaLink, heroImageUrl }
 *
 * Falls back to siteConfig.hero (homepage hero) when not set.
 * Hero heading defaults to the page's menu label.
 */

// ── Dashboard: content-pages.js changes ─────────────────────────────────────
// The Hero card in Content & Pages should NOT show "Same as Homepage / Own content" dropdown.
// Hero is always independent per-page.
// When Edit is clicked for Hero, the editor should load/save pageHeroes[pageId].

// This file is the DATA LAYER — it provides helpers used by both
// the dashboard and the website renderer.

/**
 * Get the hero config for a specific page.
 * @param {object} config - siteConfig object
 * @param {string} pageId - e.g. 'home', 'teamPage', 'services'
 * @returns {object} hero config with headline, subheadline, etc.
 */
export function getPageHero(config: any, pageId: string) {
  const pageHeroes = config?.pageHeroes || {}
  const pageHero = pageHeroes[pageId]
  const baseHero = config?.hero || {}
  
  if (pageHero) {
    return {
      headline: pageHero.headline ?? baseHero.headline ?? '',
      subheadline: pageHero.subheadline ?? baseHero.subheadline ?? '',
      badge: pageHero.badge ?? baseHero.badge ?? '',
      ctaText: pageHero.ctaText ?? baseHero.ctaText ?? '',
      ctaLink: pageHero.ctaLink ?? baseHero.ctaLink ?? '#contact',
      heroImageUrl: pageHero.heroImageUrl ?? baseHero.heroImageUrl ?? '',
    }
  }
  
  // For home, return the base hero directly
  if (pageId === 'home') {
    return { ...baseHero }
  }
  
  // For other pages without explicit hero: use base hero image but default heading to page name
  return {
    headline: baseHero.headline ?? '',
    subheadline: '',
    badge: '',
    ctaText: baseHero.ctaText ?? '',
    ctaLink: baseHero.ctaLink ?? '#contact',
    heroImageUrl: baseHero.heroImageUrl ?? '',
  }
}

/**
 * Set the hero config for a specific page.
 */
export function setPageHero(config: any, pageId: string, heroData: any) {
  if (!config) return
  if (!config.pageHeroes) config.pageHeroes = {}
  config.pageHeroes[pageId] = {
    headline: heroData.headline ?? '',
    subheadline: heroData.subheadline ?? '',
    badge: heroData.badge ?? '',
    ctaText: heroData.ctaText ?? '',
    ctaLink: heroData.ctaLink ?? '#contact',
    heroImageUrl: heroData.heroImageUrl ?? '',
  }
}

/**
 * Get per-page section content override.
 * Returns the independent content if mode === 'independent', otherwise null (use shared).
 */
export function getPageSectionContent(config: any, pageId: string, sectionId: string) {
  const overrides = config?.pageContentOverrides?.[pageId]
  if (!overrides) return null
  return overrides[sectionId] ?? null
}

/**
 * Set per-page section content override.
 */
export function setPageSectionContent(config: any, pageId: string, sectionId: string, content: any) {
  if (!config) return
  if (!config.pageContentOverrides) config.pageContentOverrides = {}
  if (!config.pageContentOverrides[pageId]) config.pageContentOverrides[pageId] = {}
  config.pageContentOverrides[pageId][sectionId] = content
}

/**
 * Check if a section is in "independent" mode for a given page.
 */
export function isSectionIndependent(config: any, pageId: string, sectionId: string) {
  const pageSecs = config?.pageSections?.[pageId]
  if (!Array.isArray(pageSecs)) return false
  const entry = pageSecs.find((s: any) => {
    const id = typeof s === 'string' ? s : s?.id
    return id === sectionId
  })
  return entry && typeof entry === 'object' && entry.mode === 'independent'
}

/**
 * Service sub-pages data model.
 */
export function getServiceSubpages(config: any) {
  return config?.serviceSubpages || { enabled: false, mode: 'existing', items: [] }
}

export function setServiceSubpages(config: any, data: any) {
  if (!config) return
  config.serviceSubpages = {
    enabled: data.enabled !== false,
    mode: data.mode || 'existing',
    items: Array.isArray(data.items) ? data.items : [],
  }
}
