/**
 * Phase 2 — Section ↔ Page duality.
 *
 * Any content type (team, process, faq, gallery, etc.) can be:
 *  - a SECTION on one or more pages
 *  - a PAGE with its own menu button
 *  - BOTH (with independent content)
 *  - OFF
 *
 * site-config.sectionPages = {
 *   team:   { asSection: true, asPage: true,  menuLabel: 'Our Team', slug: '/team' },
 *   process:{ asSection: true, asPage: false, menuLabel: 'How We Work', slug: '/process' },
 *   faq:    { asSection: true, asPage: false, menuLabel: 'FAQ', slug: '/faq' },
 *   ...
 * }
 *
 * site-config.pageOverrides[pageId][sectionId] = { ...content }  // independent copy
 */

export interface SectionPageMode {
  asSection: boolean
  asPage: boolean
  menuLabel?: string
  slug?: string
  /** When true, the page uses the same content as the section (linked) */
  linkedContent?: boolean
}

export function getSectionPageMode(config: any, sectionId: string): SectionPageMode {
  const m = config?.sectionPages?.[sectionId]
  return {
    asSection: m?.asSection !== false,
    asPage: m?.asPage === true,
    menuLabel: m?.menuLabel || sectionId,
    slug: m?.slug || `/${sectionId}`,
    linkedContent: m?.linkedContent !== false, // default: linked
  }
}

export function setSectionPageMode(config: any, sectionId: string, mode: Partial<SectionPageMode>) {
  if (!config.sectionPages) config.sectionPages = {}
  config.sectionPages[sectionId] = {
    ...getSectionPageMode(config, sectionId),
    ...mode,
  }
  return config
}

/** Get content for a section on a page — independent copy if it exists. */
export function getSectionContentForPage(config: any, sectionId: string, pageId: string, fallback: any) {
  const mode = getSectionPageMode(config, sectionId)
  if (mode.linkedContent) return fallback
  const override = config?.pageOverrides?.[pageId]?.[sectionId]
  return override || fallback
}

/** Save independent content for a section on a page. */
export function setSectionContentForPage(config: any, sectionId: string, pageId: string, content: any) {
  if (!config.pageOverrides) config.pageOverrides = {}
  if (!config.pageOverrides[pageId]) config.pageOverrides[pageId] = {}
  config.pageOverrides[pageId][sectionId] = content
  return config
}
