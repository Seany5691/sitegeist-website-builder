/**
 * Per-page section resolution.
 *
 * site-config.pageSections maps each page to an ordered list of section ids.
 * When absent, falls back to the global controls.sections on/off + registry order.
 *
 * Page ids match the PAGES registry: home, services, portfolio, about, contact,
 * teamPage, blogPage, faqPage, reviewsPage, areasPage, privacy, serviceDetailPages.
 */

export type PageId =
  | 'home'
  | 'services'
  | 'portfolio'
  | 'about'
  | 'contact'
  | 'teamPage'
  | 'blogPage'
  | 'faqPage'
  | 'reviewsPage'
  | 'areasPage'
  | 'privacy'
  | 'serviceDetailPages'

export interface PageSectionEntry {
  id: string
  enabled: boolean
}

/**
 * Get the ordered list of section ids for a page.
 * Returns [] when the page has explicitly zero sections.
 */
export function getPageSectionIds(config: any, pageId: PageId): string[] {
  const map = config?.pageSections
  if (map && Array.isArray(map[pageId])) {
    return map[pageId]
      .filter((s: any) => s && s.enabled !== false)
      .map((s: any) => String(s.id || s))
      .filter(Boolean)
  }
  // Fallback: global — use the section registry order filtered by controls
  return [] // caller falls back to renderableSections
}

/** Set the section list for a page (called by dashboard). */
export function setPageSections(
  config: any,
  pageId: PageId,
  sections: Array<{ id: string; enabled: boolean }>
): any {
  if (!config.pageSections) config.pageSections = {}
  config.pageSections[pageId] = sections.map((s) => ({
    id: s.id,
    enabled: s.enabled !== false,
  }))
  return config
}

/** Is this section enabled on this specific page? */
export function isSectionOnPage(config: any, pageId: PageId, sectionId: string): boolean {
  const ids = getPageSectionIds(config, pageId)
  if (ids.length > 0) return ids.includes(sectionId)
  // Fallback to global toggle
  return config?.controls?.sections?.[sectionId] !== false
}
