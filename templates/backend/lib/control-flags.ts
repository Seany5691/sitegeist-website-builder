/**
 * Control flags — resolve what is ON/OFF for this site.
 *
 * Flags live in site-config.json under `controls` and are written by the
 * dashboard Settings switchboard. Missing flags fall back to the registry
 * defaults, so a site that predates this system still renders correctly.
 */

import {
  HOMEPAGE_SECTIONS,
  PAGES,
  type ControlFlags,
  defaultFlags,
  visibleSections,
  withBackgrounds,
  navLinks,
} from './section-registry'
import { defaultFeatureFlags, FEATURES } from './feature-registry'

export interface SiteControls extends ControlFlags {
  /** merged feature flags */
  features: Record<string, boolean>
}

/**
 * Read the controls block from site-config. Falls back to registry defaults
 * for anything missing, so older sites never break.
 */
export function resolveControls(config: any): SiteControls {
  const base = defaultFlags()
  const raw = config?.controls || {}

  for (const s of HOMEPAGE_SECTIONS) {
    if (typeof raw.sections?.[s.id] === 'boolean') base.sections[s.id] = raw.sections[s.id]
  }
  for (const p of PAGES) {
    if (typeof raw.pages?.[p.id] === 'boolean') base.pages[p.id] = raw.pages[p.id]
  }
  base.features = { ...defaultFeatureFlags() }
  for (const f of FEATURES) {
    if (typeof raw.features?.[f.id] === 'boolean') base.features[f.id] = raw.features[f.id]
  }
  // Cookie bar auto-on when analytics is on
  if (config?.features?.googleAnalytics && raw.features?.cookieBar === undefined) {
    base.features.cookieBar = true
  }
  return base as SiteControls
}

/** The sections that should render on the homepage, with backgrounds assigned. */
export function renderableSections(config: any, imageMap?: any) {
  const controls = resolveControls(config)
  const galleryFromMap = imageMap?.categories
    ? Object.values(imageMap.categories).reduce((s: number, c: any) => s + ((c as any).images?.length || 0), 0)
    : 0
  const content = {
    team: config?.team,
    blogPosts: config?.blogPosts,
    testimonials: config?.testimonials,
    faq: config?.faq,
    services: config?.services,
    gallery: (config?.gallery?.length || galleryFromMap) ? (config?.gallery?.length ? config.gallery : [{ placeholder: true }]) : [],
    pricing: config?.pricing,
    video: config?.videos || config?.video,
  }
  const order = Array.isArray(config?.controls?.sectionOrder) ? config.controls.sectionOrder : undefined
  return withBackgrounds(visibleSections(controls.sections, content, order))
}

/** Nav links for what is actually visible. */
export function renderableNavLinks(config: any) {
  const controls = resolveControls(config)
  const content = {
    team: config?.team,
    blogPosts: config?.blogPosts,
    testimonials: config?.testimonials,
    faq: config?.faq,
    services: config?.services,
    gallery: config?.gallery,
    pricing: config?.pricing,
    video: config?.videos || config?.video,
  }
  return navLinks(visibleSections(controls.sections, content))
}

/** Is this page switched on? */
export function isPageEnabled(config: any, pageId: string): boolean {
  const controls = resolveControls(config)
  return controls.pages[pageId] !== false
}

/** Is this feature switched on? */
export function isFeatureEnabled(config: any, featureId: string): boolean {
  const controls = resolveControls(config)
  return controls.features[featureId] !== false
}

/**
 * The site's nav links — generated from what is actually switched on.
 *
 * Combines the always-on page links (Home, Services, Portfolio, About, Contact)
 * with the optional pages (Team, Blog, Reviews, FAQ, Areas), so turning a page
 * on in Settings makes its menu item appear and turning it off removes it.
 */
export interface NavLink {
  href: string
  label: string
}

/**
 * Homepage sections that can be added to the menu as in-page anchor links.
 *
 * `id` is the section-registry id (also the `controls.sections` key). `anchor`
 * is the `id` attribute the section component renders. `labelKey` is the key
 * read from `siteConfig.navigation` so the label is renameable in Menu Labels.
 *
 * An anchor only appears when BOTH the section itself is switched on AND the
 * site has opted it into the menu via `navigation.showInMenu[id]`.
 */
export const SECTION_NAV_ANCHORS: {
  id: string
  anchor: string
  labelKey: string
  defaultLabel: string
}[] = [
  { id: 'process', anchor: 'process', labelKey: 'navProcess', defaultLabel: 'Process' },
  { id: 'latestWork', anchor: 'latest-work', labelKey: 'navLatestWork', defaultLabel: 'Latest Work' },
  { id: 'partners', anchor: 'partners', labelKey: 'navPartners', defaultLabel: 'Partners' },
  { id: 'awards', anchor: 'awards', labelKey: 'navAwards', defaultLabel: 'Awards' },
  { id: 'instagram', anchor: 'social', labelKey: 'navSocial', defaultLabel: 'Social' },
  { id: 'newsletter', anchor: 'newsletter', labelKey: 'navNewsletter', defaultLabel: 'Newsletter' },
  { id: 'statsBar', anchor: 'stats', labelKey: 'navStats', defaultLabel: 'Stats' },
  { id: 'video', anchor: 'videos', labelKey: 'navVideo', defaultLabel: 'Video' },
]

export function siteNavLinks(config: any): NavLink[] {
  const controls = resolveControls(config)
  const pages = controls.pages
  const nav = config?.navigation || {}
  const showInMenu = nav.showInMenu || {}

  const links: NavLink[] = []

  // Home is always first
  links.push({ href: '/', label: nav.home || 'Home' })

  // Core pages — always shown
  if (pages.services !== false) links.push({ href: '/services', label: nav.services || 'Services' })
  if (pages.portfolio !== false) links.push({ href: '/portfolio', label: nav.portfolio || 'Portfolio' })

  // Optional pages — only when switched on
  if (pages.teamPage === true) links.push({ href: '/team', label: nav.team || 'Team' })
  if (pages.blogPage === true) links.push({ href: '/blog', label: nav.blog || 'Blog' })
  if (pages.reviewsPage === true) links.push({ href: '/reviews', label: nav.reviews || 'Reviews' })
  if (pages.faqPage === true) links.push({ href: '/faq', label: nav.faq || 'FAQ' })
  if (pages.areasPage === true) links.push({ href: '/areas', label: nav.areas || 'Areas' })

  // Homepage section anchors — only when the section is ON *and* opted into the menu.
  // Links to `/#anchor` so they work from every page on the site.
  for (const s of SECTION_NAV_ANCHORS) {
    if (showInMenu[s.id] !== true) continue
    if (controls.sections[s.id] !== true) continue
    links.push({ href: '/#' + s.anchor, label: nav[s.labelKey] || s.defaultLabel })
  }

  if (pages.about !== false) links.push({ href: '/about', label: nav.about || 'About' })
  if (pages.contact !== false) links.push({ href: '/contact', label: nav.contact || 'Contact' })

  return links
}
