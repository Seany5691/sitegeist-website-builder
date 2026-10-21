/**
 * Section Registry — the single source of truth for what a website can show.
 *
 * The site renders from this list. The dashboard reads this list. Navigation is
 * generated from this list. Nothing is hardcoded in page templates, so turning a
 * section off removes it everywhere at once and the page re-flows cleanly.
 *
 * Rules enforced here (see visibleSections):
 *  - Hero and Contact are LOCKED ON. A page always has a top and a way to
 *    reach the business.
 *  - Alternating backgrounds are assigned from the VISIBLE index at render
 *    time, so removing a section re-balances the striping instead of leaving
 *    two identical bands stacked.
 *  - Sections with `requiresContent` are hidden on the site when empty, but
 *    stay visible in the dashboard as an empty state.
 */

export type SectionKind = 'section' | 'page' | 'feature'

export interface SectionDef {
  /** Stable id used in site-config flags and DOM anchors */
  id: string
  /** Human label for the dashboard */
  label: string
  /** React component name emitted into the page */
  component: string
  kind: SectionKind
  /**
   * Background treatment. 'auto' alternates bg / tint based on visible
   * position so the page always looks balanced.
   */
  background: 'auto' | 'tint' | 'solid' | 'transparent'
  /** Sidebar anchor for the nav (omit to leave out of nav) */
  navAnchor?: string
  /** Dashboard tab this section owns (its tab hides when the section is off) */
  dashboardTab?: string
  /** site-config key whose non-empty content is required to render publicly */
  requiresContent?: 'team' | 'blogPosts' | 'testimonials' | 'faq' | 'services' | 'gallery' | 'pricing' | 'video'
  /** Shipped on by default */
  defaultOn: boolean
  /** Cannot be switched off */
  locked?: boolean
  /** Sort order within its band */
  order: number
  /** Short description shown in the Settings switchboard */
  description?: string
}

/* ────────────────────────────────────────────────────────────────────────
   HOMEPAGE SECTIONS
   ──────────────────────────────────────────────────────────────────────── */

export const HOMEPAGE_SECTIONS: SectionDef[] = [
  {
    id: 'hero', label: 'Hero', component: 'Hero', kind: 'section',
    background: 'transparent', locked: true, defaultOn: true, order: 10,
    description: 'The top banner of the site. Always present.',
  },
  {
    id: 'statsBar', label: 'Stats / By the Numbers', component: 'StatsBar', kind: 'section',
    background: 'auto', dashboardTab: 'stats', defaultOn: false, order: 20,
    description: 'Headline credibility numbers — years in business, clients served, projects.',
  },
  {
    id: 'services', label: 'Services', component: 'Services', kind: 'section',
    background: 'auto', navAnchor: 'services', dashboardTab: 'services',
    requiresContent: 'services', defaultOn: true, order: 30,
    description: 'What the business offers. Core section.',
  },
  {
    id: 'process', label: 'Process / How It Works', component: 'ProcessSteps', kind: 'section',
    background: 'auto', dashboardTab: 'process', defaultOn: false, order: 40,
    description: 'Step-by-step of how working with the business works.',
  },
  {
    id: 'gallery', label: 'Gallery / Portfolio', component: 'Gallery', kind: 'section',
    background: 'auto', navAnchor: 'portfolio', dashboardTab: 'gallery',
    requiresContent: 'gallery', defaultOn: true, order: 50,
    description: 'Visual proof — photos and project work.',
  },
  {
    id: 'beforeAfter', label: 'Before / After', component: 'BeforeAfter', kind: 'section',
    background: 'auto', dashboardTab: 'beforeAfter', defaultOn: false, order: 60,
    description: 'Side-by-side transformation slider. Powerful for renovations, dentistry, cleaning.',
  },
  {
    id: 'latestWork', label: 'Latest Work / Case Studies', component: 'LatestWork', kind: 'section',
    background: 'auto', dashboardTab: 'latestWork', defaultOn: false, order: 70,
    description: 'Featured recent projects with results.',
  },
  {
    id: 'testimonials', label: 'Testimonials / Reviews', component: 'Testimonials', kind: 'section',
    background: 'auto', navAnchor: 'testimonials', dashboardTab: 'testimonials',
    requiresContent: 'testimonials', defaultOn: true, order: 80,
    description: 'What customers say, with where each review came from.',
  },
  {
    id: 'trustBadges', label: 'Trust Badges / Certifications', component: 'TrustBadges', kind: 'section',
    background: 'auto', dashboardTab: 'trustBadges', defaultOn: false, order: 90,
    description: 'Certifications, memberships, insurance, guarantees.',
  },
  {
    id: 'about', label: 'About', component: 'About', kind: 'section',
    background: 'auto', navAnchor: 'about', dashboardTab: 'about', defaultOn: true, order: 100,
    description: 'The story behind the business.',
  },
  {
    id: 'team', label: 'Team (section)', component: 'TeamSection', kind: 'section',
    background: 'auto', navAnchor: 'team', dashboardTab: 'team',
    requiresContent: 'team', defaultOn: false, order: 110,
    description: 'People behind the business, on the homepage. Independent of the Team page.',
  },
  {
    id: 'partners', label: 'Partners / Sponsors', component: 'PartnersStrip', kind: 'section',
    background: 'auto', dashboardTab: 'partners', defaultOn: false, order: 120,
    description: 'Brands, sponsors and organisations the business works with.',
  },
  {
    id: 'video', label: 'Video', component: 'VideoEmbed', kind: 'section',
    background: 'auto', dashboardTab: 'video', requiresContent: 'video', defaultOn: false, order: 130,
    description: 'An embedded video block.',
  },
  {
    id: 'serviceAreas', label: 'Service Areas', component: 'AreasServed', kind: 'section',
    background: 'auto', dashboardTab: 'serviceAreas', defaultOn: true, order: 140,
    description: 'Towns and suburbs the business serves. Strong for local search.',
  },
  {
    id: 'location', label: 'Location / Map', component: 'LocationMap', kind: 'section',
    background: 'auto', dashboardTab: 'location', defaultOn: true, order: 150,
    description: 'Where to find the business.',
  },
  {
    // NOTE: Business hours are NOT a standalone homepage section.
    // They live inside the contact area (showBusinessHours) so they never
    // look out of place. The Hours dashboard tab edits the data + that toggle.
    id: 'pricing', label: 'Pricing / Packages', component: 'PricingTable', kind: 'section',
    background: 'auto', dashboardTab: 'pricing', requiresContent: 'pricing', defaultOn: false, order: 170,
    description: 'Published prices and packages.',
  },
  {
    id: 'faq', label: 'FAQ', component: 'Faq', kind: 'section',
    background: 'auto', navAnchor: 'faq', dashboardTab: 'faq',
    requiresContent: 'faq', defaultOn: true, order: 180,
    description: 'Frequently asked questions.',
  },
  {
    id: 'blogStrip', label: 'Blog (section — latest posts)', component: 'BlogStrip', kind: 'section',
    background: 'auto', navAnchor: 'blog', dashboardTab: 'blog',
    requiresContent: 'blogPosts', defaultOn: false, order: 190,
    description: 'Latest blog posts on the homepage. Independent of the Blog page.',
  },
  {
    id: 'awards', label: 'Awards / Press', component: 'AwardsPress', kind: 'section',
    background: 'auto', dashboardTab: 'awards', defaultOn: false, order: 200,
    description: 'Media mentions, awards and press.',
  },
  {
    id: 'instagram', label: 'Instagram / Social Feed', component: 'SocialFeed', kind: 'section',
    background: 'auto', dashboardTab: 'instagram', defaultOn: false, order: 210,
    description: 'Live social feed strip.',
  },
  {
    id: 'newsletter', label: 'Newsletter Block', component: 'NewsletterBlock', kind: 'section',
    background: 'auto', dashboardTab: 'newsletter', defaultOn: false, order: 220,
    description: 'Inline email signup block.',
  },
  {
    id: 'cta', label: 'CTA Banner', component: 'CtaBanner', kind: 'section',
    background: 'tint', locked: true, defaultOn: true, order: 230,
    description: 'Final call to action. Always present.',
  },
  {
    // Contact form + business hours. LOCKED — contact details must always be
    // reachable on the homepage. Uses the same Contact component as /contact,
    // so the hours toggle (showBusinessHours) controls the form|hours split.
    id: 'contact', label: 'Contact', component: 'Contact', kind: 'section',
    background: 'solid', locked: true, defaultOn: true, order: 240,
    description: 'Contact form and details. Always present.',
  },
  {
    id: 'vsl', label: 'VSL (Video Sales Letter)', component: 'VslPlayer', kind: 'section',
    background: 'auto', dashboardTab: 'vsl', defaultOn: false, order: 155,
    description: 'A sales video on the page. Upload a video or paste a YouTube/Vimeo link, choose a size, and set it to autoplay.',
  },
]

/* ────────────────────────────────────────────────────────────────────────
   PAGES
   ──────────────────────────────────────────────────────────────────────── */

export interface PageDef {
  id: string
  label: string
  /** Next.js route slug. '' = home */
  slug: string
  /** Section flag that drives homepage rendering (for section+page pairs) */
  sectionId?: string
  /** dashboard tab owning this page's content */
  dashboardTab?: string
  defaultOn: boolean
  locked?: boolean
  description?: string
}

export const PAGES: PageDef[] = [
  { id: 'home', label: 'Home', slug: '', defaultOn: true, locked: true, description: 'The homepage. Always present.' },
  { id: 'services', label: 'Services', slug: 'services', dashboardTab: 'services', defaultOn: true, description: 'Full services page.' },
  { id: 'portfolio', label: 'Portfolio / Gallery', slug: 'portfolio', dashboardTab: 'gallery', defaultOn: true, description: 'Full gallery page.' },
  { id: 'about', label: 'About', slug: 'about', dashboardTab: 'about', defaultOn: true, description: 'About page.' },
  { id: 'contact', label: 'Contact', slug: 'contact', defaultOn: true, locked: true, description: 'Contact page. Always present.' },
  { id: 'privacy', label: 'Privacy / Terms', slug: 'privacy', defaultOn: true, description: 'Auto-generated policy page.' },
  { id: 'teamPage', label: 'Team (page)', slug: 'team', sectionId: 'team', dashboardTab: 'team', defaultOn: false, description: 'Standalone team page. Independent of the Team section.' },
  { id: 'blogPage', label: 'Blog (page)', slug: 'blog', sectionId: 'blogStrip', dashboardTab: 'blog', defaultOn: false, description: 'Standalone blog page. Independent of the Blog section.' },
  { id: 'faqPage', label: 'FAQ (page)', slug: 'faq', sectionId: 'faq', dashboardTab: 'faq', defaultOn: false, description: 'Standalone FAQ page.' },
  { id: 'reviewsPage', label: 'Reviews (page)', slug: 'reviews', sectionId: 'testimonials', dashboardTab: 'testimonials', defaultOn: false, description: 'Standalone reviews page.' },
  { id: 'areasPage', label: 'Areas We Serve', slug: 'areas', sectionId: 'serviceAreas', dashboardTab: 'serviceAreas', defaultOn: false, description: 'Location / service-area page.' },
  { id: 'serviceDetailPages', label: 'Service Detail Pages', slug: 'services/[slug]', sectionId: 'services', dashboardTab: 'services', defaultOn: false, description: 'One page per service — strong for search.' },
]

/* ────────────────────────────────────────────────────────────────────────
   FLAG MODEL
   ──────────────────────────────────────────────────────────────────────── */

export interface ControlFlags {
  sections: Record<string, boolean>
  pages: Record<string, boolean>
  features: Record<string, boolean>
}

/** Build the default flag set from the registries. */
export function defaultFlags(): ControlFlags {
  const sections: Record<string, boolean> = {}
  for (const s of HOMEPAGE_SECTIONS) sections[s.id] = s.defaultOn
  const pages: Record<string, boolean> = {}
  for (const p of PAGES) pages[p.id] = p.defaultOn
  return { sections, pages, features: {} }
}

/**
 * Resolve the sections that should actually render.
 * - locked sections always render
 * - requiresContent sections are dropped when the matching content is empty
 * - ORDER comes from `controls.sectionOrder` (an array of ids set by the
 *   dashboard drag/arrows). Unknown ids are ignored and any section not listed
 *   falls back to its registry `order`, so a client can never break the page by
 *   leaving a section out of the list.
 */
export function visibleSections(
  flags: Record<string, boolean>,
  content: Record<string, unknown> = {},
  sectionOrder?: string[]
): SectionDef[] {
  const visible = HOMEPAGE_SECTIONS.filter((s) => {
    if (s.locked) return true
    const on = flags[s.id] !== false // default ON unless explicitly false
    if (!on) return false
    if (s.requiresContent) {
      const v = content[s.requiresContent]
      const empty =
        v === undefined ||
        v === null ||
        (Array.isArray(v) && v.length === 0) ||
        v === ''
      if (empty) return false
    }
    return true
  })

  // Honour a client-defined order when present
  if (Array.isArray(sectionOrder) && sectionOrder.length > 0) {
    const rank = new Map<string, number>()
    sectionOrder.forEach((id, i) => {
      if (!rank.has(id)) rank.set(id, i)
    })
    return visible.slice().sort((a, b) => {
      // Hero always first, CTA always last — regardless of client order
      if (a.locked && a.id === 'hero') return -1
      if (b.locked && b.id === 'hero') return 1
      if (a.locked && a.id === 'cta') return 1
      if (b.locked && b.id === 'cta') return -1
      const ra = rank.has(a.id) ? (rank.get(a.id) as number) : 1000 + a.order
      const rb = rank.has(b.id) ? (rank.get(b.id) as number) : 1000 + b.order
      if (ra !== rb) return ra - rb
      return a.order - b.order
    })
  }

  return visible.sort((a, b) => a.order - b.order)
}

/**
 * Default section order (ids, in render order) — used to seed the dashboard's
 * reorder UI and to normalise `controls.sectionOrder`.
 */
export function defaultSectionOrder(): string[] {
  return HOMEPAGE_SECTIONS.slice().sort((a, b) => a.order - b.order).map((s) => s.id)
}

/**
 * Normalise a client-supplied order: keep only known ids, no duplicates,
 * append anything missing in registry order. Hero first / CTA last enforced.
 */
export function normalizeSectionOrder(input: unknown): string[] {
  const known = new Set(HOMEPAGE_SECTIONS.map((s) => s.id))
  const seen = new Set<string>()
  const out: string[] = []

  if (Array.isArray(input)) {
    for (const id of input) {
      if (typeof id !== 'string') continue
      if (!known.has(id)) continue
      if (seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
  }
  for (const id of defaultSectionOrder()) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  // Pin hero first, cta last
  const rest = out.filter((id) => id !== 'hero' && id !== 'cta')
  return ['hero', ...rest, 'cta']
}

/**
 * Assign a background treatment to each visible section so the striping
 * re-balances when sections are turned off.
 */
export function withBackgrounds(
  visible: SectionDef[]
): Array<SectionDef & { backgroundClass: string }> {
  let autoIndex = 0
  return visible.map((s) => {
    let backgroundClass: string
    if (s.background === 'auto') {
      backgroundClass = autoIndex % 2 === 0 ? 'section-bg-a' : 'section-bg-b'
      autoIndex++
    } else if (s.background === 'tint') {
      backgroundClass = 'section-bg-b'
    } else if (s.background === 'solid') {
      backgroundClass = 'section-bg-solid'
    } else {
      backgroundClass = 'section-bg-transparent'
    }
    return { ...s, backgroundClass }
  })
}

/** Nav links generated from what is actually visible. */
export function navLinks(visible: SectionDef[]): Array<{ id: string; label: string; anchor: string }> {
  return visible
    .filter((s) => s.navAnchor)
    .map((s) => ({ id: s.id, label: s.label.replace(/ \(.*\)$/, ''), anchor: s.navAnchor as string }))
}

/** Section-by-id lookup. */
export function sectionById(id: string): SectionDef | undefined {
  return HOMEPAGE_SECTIONS.find((s) => s.id === id)
}

/** Page-by-id lookup. */
export function pageById(id: string): PageDef | undefined {
  return PAGES.find((p) => p.id === id)
}

/** Dashboard tabs that should be visible given the flags. */
export function visibleDashboardTabs(flags: Record<string, boolean>): string[] {
  const always = ['overview', 'leads', 'seo', 'settings', 'design-system', 'features']
  const fromSections = HOMEPAGE_SECTIONS.filter((s) => s.dashboardTab && (s.locked || flags[s.id] !== false))
    .map((s) => s.dashboardTab as string)
  return Array.from(new Set([...always, ...fromSections]))
}
