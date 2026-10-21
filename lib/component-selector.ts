/**
 * Component Selector — Intelligent Selection Engine
 * 
 * Selects component variants using a scoring algorithm that considers:
 * 1. Design seed art direction (highest weight)
 * 2. Design seed layout style (medium weight)
 * 3. Archetype preferences (low weight)
 * 4. Hash-based variation (tiebreaker)
 * 
 * Every archetype has access to ALL components. The archetype's
 * preferred/excluded lists influence but don't restrict selection.
 * 
 * PREMIUM ENFORCER: Certain non-premium components are hard-blocked
 * to ensure every website achieves 200/100 custom agency feel.
 */

import { IndustryArchetype } from '@/types/site-config'
import path from 'path'
import { promises as fs } from 'fs'

// PREMIUM ENFORCEMENT: These components are NEVER allowed
const BLOCKED_COMPONENTS = {
  heroes: ['HeroGradient', 'HeroMinimal'],
  services: ['ServicesMinimal', 'ServicesList', 'ServicesAccordion'],
  testimonials: ['TestimonialsMinimal', 'TestimonialsGrid'],
  gallery: ['GalleryMinimal'],
  contact: ['ContactMinimal', 'ContactCentered'],
  about: ['AboutMinimal']
}

const PREMIUM_TIER_1 = {
  heroes: ['HeroFullscreen', 'HeroSplit', 'HeroOverlapping', 'HeroShowcase', 'HeroFeature'],
  services: ['ServicesCards', 'ServicesGrid', 'ServicesIconGrid', 'ServicesFeature'],
  gallery: ['GalleryMasonry', 'GalleryCategories', 'GalleryCinematic', 'GalleryFullscreen'],
  testimonials: ['TestimonialsFeatured', 'TestimonialsQuote', 'TestimonialsSlider'],
  about: ['AboutVideo', 'AboutLayered', 'AboutSplit', 'AboutStats'],
  contact: ['ContactSplit', 'ContactMap', 'ContactCards']
}

interface ComponentStyle {
  artDirections: string[]
  layouts: string[]
}

interface ComponentStyles {
  heroes: Record<string, ComponentStyle>
  services: Record<string, ComponentStyle>
  gallery: Record<string, ComponentStyle>
  testimonials: Record<string, ComponentStyle>
  contact: Record<string, ComponentStyle>
  about: Record<string, ComponentStyle>
  faq: Record<string, ComponentStyle>
  headers: Record<string, ComponentStyle>
  footers: Record<string, ComponentStyle>
}

interface StyleSlotComposition {
  heroStyle: string
  servicesStyle: string
  galleryStyle: string
  testimonialsStyle: string
  aboutStyle: string
  contactStyle: string
  cta?: string
  pricing?: string
}

interface ArchetypeConfig {
  preferredHeroes: string[]
  excludedHeroes: string[]
  preferredServices: string[]
  excludedServices: string[]
  preferredGallery: string[]
  excludedGallery: string[]
  preferredTestimonials: string[]
  excludedTestimonials: string[]
  preferredContact: string[]
  excludedContact: string[]
  preferredAbout: string[]
  excludedAbout: string[]
  preferredFaq: string[]
  excludedFaq: string[]
  preferredHeaders: string[]
  excludedHeaders: string[]
  preferredFooters: string[]
  excludedFooters: string[]
  compositions?: StyleSlotComposition[]
}

interface ArchetypeMap {
  _componentStyles: ComponentStyles
  [key: string]: any
}

interface SelectedComponents {
  hero: string
  services: string
  gallery: string
  testimonials: string
  contact: string
  about: string
  faq: string
  header: string
  footer: string
  cta: string
  pricing: string
}

interface DesignSeedParams {
  id: string
  artDirection: string
  layoutStyle: string
}

// Map archetype IDs to mapping keys
const ARCHETYPE_TO_KEY: Record<string, string> = {
  'manufacturing': 'heavy-industrial',
  'metal-fabrication': 'heavy-industrial',
  'chemical': 'heavy-industrial',
  'packaging': 'heavy-industrial',
  'automation': 'heavy-industrial',
  'mining': 'heavy-industrial',
  'agricultural-equipment': 'heavy-industrial',
  'logistics': 'logistics-freight',
  'freight': 'logistics-freight',
  'warehousing': 'logistics-freight',
  'courier': 'logistics-freight',
  'shipping': 'logistics-freight',
  'auto-repair': 'trades-field-services',
  'plumbing': 'trades-field-services',
  'electrical': 'trades-field-services',
  'landscaping': 'trades-field-services',
  'security': 'trades-field-services',
  'cleaning': 'trades-field-services',
  'hvac': 'trades-field-services',
  'scaffolding': 'trades-field-services',
  'medical': 'medical-healthcare',
  'dental': 'medical-healthcare',
  'pharmacy': 'medical-healthcare',
  'veterinary': 'medical-healthcare',
  'chiropractic': 'medical-healthcare',
  'fitness': 'medical-healthcare',
  'optometry': 'medical-healthcare',
  'legal': 'professional-corporate',
  'finance': 'professional-corporate',
  'accounting': 'professional-corporate',
  'insurance': 'professional-corporate',
  'engineering': 'professional-corporate',
  'calibration': 'professional-corporate',
  'funeral': 'professional-corporate',
  'property-management': 'professional-corporate',
  'realestate': 'architecture-construction',
  'construction': 'architecture-construction',
  'architecture': 'architecture-construction',
  'interior-design': 'architecture-construction',
  'civil-engineering': 'architecture-construction',
  'earthmoving': 'architecture-construction',
  'solar': 'architecture-construction',
  'concrete': 'architecture-construction',
  'restaurant': 'hospitality-food',
  'bakery': 'hospitality-food',
  'catering': 'hospitality-food',
  'hotel': 'hospitality-food',
  'travel': 'hospitality-food',
  'food-processing': 'hospitality-food',
  'retail': 'retail-commerce',
  'salon': 'retail-commerce',
  'fashion': 'retail-commerce',
  'electronics': 'retail-commerce',
  'car-dealer': 'retail-commerce',
  'printing': 'retail-commerce',
  'advertising': 'retail-commerce',
  'education': 'retail-commerce',
  'wholesale': 'retail-commerce',
  'farm': 'agricultural-industrial',
  'fertilizer': 'agricultural-industrial',
  'abattoir': 'agricultural-industrial',
  'animal-feed': 'agricultural-industrial',
  'general': 'professional-corporate',
  'nonprofit': 'nonprofit-humanitarian',
  'charity': 'nonprofit-humanitarian',
  'ngo': 'nonprofit-humanitarian',
  'foundation': 'nonprofit-humanitarian',
  'humanitarian': 'nonprofit-humanitarian',
  'mission': 'nonprofit-humanitarian',
  'missions': 'nonprofit-humanitarian',
  'relief': 'nonprofit-humanitarian',
  'food-bank': 'nonprofit-humanitarian',
  'food-rescue': 'nonprofit-humanitarian',
  'hunger': 'nonprofit-humanitarian',
  'orphanage': 'nonprofit-humanitarian',
  'shelter': 'nonprofit-humanitarian',
  'outreach': 'nonprofit-humanitarian',
  'ministry': 'nonprofit-humanitarian',
  'church': 'nonprofit-humanitarian',
  'faith-based': 'nonprofit-humanitarian',
  'aid': 'nonprofit-humanitarian',
  'welfare': 'nonprofit-humanitarian',
  'community-service': 'nonprofit-humanitarian',
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Score a component based on how well it matches the design seed and archetype preferences.
 * Higher score = better match.
 */
function scoreComponent(
  componentName: string,
  style: ComponentStyle | undefined,
  artDirection: string,
  layoutStyle: string,
  isPreferred: boolean,
  hash: number
): number {
  let score = 0

  // Art direction match (weight: 3)
  if (style && style.artDirections.includes(artDirection)) {
    score += 30
    // Bonus if it's the first (primary) art direction
    if (style.artDirections[0] === artDirection) {
      score += 5
    }
  }

  // Layout style match (weight: 2)
  if (style && style.layouts.includes(layoutStyle)) {
    score += 20
    if (style.layouts[0] === layoutStyle) {
      score += 3
    }
  }

  // Archetype preference (weight: 1)
  if (isPreferred) {
    score += 10
  }

  // Hash-based variation (tiebreaker — ensures determinism but adds variety)
  score += (hashString(componentName + hash.toString()) % 10)

  return score
}

/**
 * Select the best component from a pool using the scoring algorithm.
 * PREMIUM ENFORCER: Hard-blocks non-premium components before selection.
 */
function selectBest(
  pool: string[],
  styles: Record<string, ComponentStyle>,
  excluded: string[],
  preferred: string[],
  artDirection: string,
  layoutStyle: string,
  hash: number,
  shift: number = 0
): string {
  // PREMIUM ENFORCER: Determine section type and filter out blocked components FIRST
  const sectionType = pool[0]?.includes('Hero') ? 'heroes' : 
                      pool[0]?.includes('Services') ? 'services' :
                      pool[0]?.includes('Gallery') ? 'gallery' :
                      pool[0]?.includes('Testimonials') ? 'testimonials' :
                      pool[0]?.includes('Contact') ? 'contact' :
                      pool[0]?.includes('About') ? 'about' : 'other'
  
  const blocked = (BLOCKED_COMPONENTS as any)[sectionType] || []
  pool = pool.filter(c => !blocked.includes(c))
  
  // PREMIUM ENFORCER: If pool is empty after blocking, use Tier 1 premium components
  if (pool.length === 0 && (PREMIUM_TIER_1 as any)[sectionType]) {
    console.warn(`[Premium Enforcer] All components blocked for ${sectionType}, using Tier 1 defaults`)
    pool = (PREMIUM_TIER_1 as any)[sectionType]
  }
  
  // Remove excluded components
  const candidates = pool.filter(c => !excluded.includes(c))
  if (candidates.length === 0) return pool[0]

  // Score each candidate
  const scored = candidates.map(name => ({
    name,
    score: scoreComponent(
      name,
      styles[name],
      artDirection,
      layoutStyle,
      preferred.includes(name),
      hash + shift
    )
  }))

  // Sort by score descending, then by name for determinism
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  return scored[0].name
}

/**
 * Resolve a style slot (e.g., "split-or-overlapping") to an actual component.
 * Maps style slot names to pools of components that share that visual approach.
 */
function resolveStyleSlot(
  slot: string,
  category: string,
  styles: Record<string, ComponentStyle>,
  excluded: string[],
  preferred: string[],
  artDirection: string,
  layoutStyle: string,
  hash: number,
  shift: number
): string {
  // Style slot → component pool mapping
  const slotPools: Record<string, Record<string, string[]>> = {
    heroes: {
      'stats': ['HeroStats'],
      'feature': ['HeroFeature'],
      'split': ['HeroSplit'],
      'minimal': ['HeroMinimal'],
      'centered': ['HeroCentered'],
      'overlapping': ['HeroOverlapping'],
      'fullscreen': ['HeroFullscreen'],
      'gradient': ['HeroGradient'],
      'card': ['HeroCard'],
      'showcase': ['HeroShowcase'],
      'testimonial': ['HeroTestimonial'],
      'contact': ['HeroContact'],
      'split-or-overlapping': ['HeroSplit', 'HeroOverlapping'],
      'stats-or-feature': ['HeroStats', 'HeroFeature'],
      'centered-or-fullscreen': ['HeroCentered', 'HeroFullscreen'],
    },
    services: {
      'grid': ['ServicesGrid'],
      'cards': ['ServicesCards'],
      'feature': ['ServicesFeature'],
      'list': ['ServicesList'],
      'minimal': ['ServicesMinimal'],
      'tabs': ['ServicesTabs'],
      'timeline': ['ServicesTimeline'],
      'alternating': ['ServicesAlternating'],
      'asymmetric': ['ServicesAsymmetric'],
      'icongrid': ['ServicesIconGrid'],
      'accordion': ['ServicesAccordion'],
      'cards-or-grid': ['ServicesCards', 'ServicesGrid'],
      'list-or-minimal': ['ServicesList', 'ServicesMinimal'],
    },
    gallery: {
      'categories': ['GalleryCategories'],
      'masonry': ['GalleryMasonry'],
      'filterable': ['GalleryFilterable'],
      'lightbox': ['GalleryLightbox'],
      'minimal': ['GalleryMinimal'],
      'cinematic': ['GalleryCinematic'],
      'fullscreen': ['GalleryFullscreen'],
      'carousel': ['GalleryCarousel'],
      'filmstrip': ['GalleryFilmstrip'],
      'beforeafter': ['GalleryBeforeAfter'],
      'stack': ['GalleryStack'],
      'masonry-or-filterable': ['GalleryMasonry', 'GalleryFilterable'],
      'cinematic-or-fullscreen': ['GalleryCinematic', 'GalleryFullscreen'],
    },
    testimonials: {
      'slider': ['TestimonialsSlider'],
      'grid': ['TestimonialsGrid'],
      'cards': ['TestimonialsCards'],
      'quote': ['TestimonialsQuote'],
      'minimal': ['TestimonialsMinimal'],
      'slider-or-quote': ['TestimonialsSlider', 'TestimonialsQuote'],
    },
    contact: {
      'split': ['ContactSplit'],
      'full': ['ContactFull'],
      'centered': ['ContactCentered'],
      'cards': ['ContactCards'],
      'map': ['ContactMap'],
      'minimal': ['ContactMinimal'],
      'split-or-full': ['ContactSplit', 'ContactFull'],
    },
    about: {
      'split': ['AboutSplit'],
      'stats': ['AboutStats'],
      'minimal': ['AboutMinimal'],
      'layered': ['AboutLayered'],
      'team': ['AboutTeam'],
      'timeline': ['AboutTimeline'],
      'video': ['AboutVideo'],
      'split-or-layered': ['AboutSplit', 'AboutLayered'],
    },
  }

  const categoryPools = slotPools[category] || {}
  const pool = categoryPools[slot]

  if (pool && pool.length > 0) {
    return selectBest(pool, styles, excluded, preferred, artDirection, layoutStyle, hash, shift)
  }

  // If slot not found, fall back to full pool selection
  const allComponents = Object.keys(styles)
  return selectBest(allComponents, styles, excluded, preferred, artDirection, layoutStyle, hash, shift)
}

export async function selectComponents(
  archetype: IndustryArchetype,
  designSeedId: string,
  imageCount: number = 0,
  categoryCount: number = 0,
  designSeed?: { artDirection?: string; layoutStyle?: string },
  teamSize: number = 0
): Promise<SelectedComponents> {
  const mappingPath = path.join(process.cwd(), 'templates', 'archetype-map.json')
  const mappingRaw = await fs.readFile(mappingPath, 'utf-8')
  const mapping: ArchetypeMap = JSON.parse(mappingRaw.replace(/^\uFEFF/, ''))

  const componentStyles = mapping._componentStyles

  // Map archetype ID to mapping key
  const mappingKey = ARCHETYPE_TO_KEY[archetype.id] || 'professional-corporate'
  const archConfig: ArchetypeConfig = mapping[mappingKey] || mapping['professional-corporate']

  // Use design seed for art direction and layout style
  const artDirection = designSeed?.artDirection || 'editorial'
  const layoutStyle = designSeed?.layoutStyle || 'modern'
  const hash = hashString(designSeedId)

  // Smart gallery layout selection based on image count and categories
  let galleryOverride: string | null = null
  if (categoryCount > 1) {
    galleryOverride = 'GalleryCategories'
  } else if (imageCount >= 5) {  // PREMIUM ENFORCER: Lowered from > 50 to >= 5 for premium masonry
    galleryOverride = 'GalleryMasonry'
    console.log(`[Premium Enforcer] Forcing GalleryMasonry (${imageCount} images >= 5 threshold)`)
  } else if (imageCount > 0 && imageCount < 5) {
    galleryOverride = 'GalleryLightbox'
  }

  // If archetype has composition recipes with style slots, use them
  if (archConfig.compositions && archConfig.compositions.length > 0) {
    const compositionIndex = hash % archConfig.compositions.length
    const composition = archConfig.compositions[compositionIndex]

    const hero = resolveStyleSlot(
      composition.heroStyle, 'heroes', componentStyles.heroes,
      archConfig.excludedHeroes, archConfig.preferredHeroes,
      artDirection, layoutStyle, hash, 0
    )
    const services = resolveStyleSlot(
      composition.servicesStyle, 'services', componentStyles.services,
      archConfig.excludedServices, archConfig.preferredServices,
      artDirection, layoutStyle, hash, 4
    )
    const gallery = galleryOverride || resolveStyleSlot(
      composition.galleryStyle, 'gallery', componentStyles.gallery,
      archConfig.excludedGallery, archConfig.preferredGallery,
      artDirection, layoutStyle, hash, 8
    )
    const testimonials = resolveStyleSlot(
      composition.testimonialsStyle, 'testimonials', componentStyles.testimonials,
      archConfig.excludedTestimonials, archConfig.preferredTestimonials,
      artDirection, layoutStyle, hash, 12
    )
    const contact = resolveStyleSlot(
      composition.contactStyle, 'contact', componentStyles.contact,
      archConfig.excludedContact, archConfig.preferredContact,
      artDirection, layoutStyle, hash, 16
    )
    // Exclude AboutTeam when team has 1 or fewer members (it looks empty with a single card)
    const aboutExcluded = teamSize <= 1
      ? [...archConfig.excludedAbout, 'AboutTeam']
      : archConfig.excludedAbout

    const about = selectBest(
      Object.keys(componentStyles.about), componentStyles.about,
      aboutExcluded, archConfig.preferredAbout,
      artDirection, layoutStyle, hash, 20
    )
    const faq = selectBest(
      Object.keys(componentStyles.faq), componentStyles.faq,
      archConfig.excludedFaq, archConfig.preferredFaq,
      artDirection, layoutStyle, hash, 24
    )
    const header = selectBest(
      Object.keys(componentStyles.headers), componentStyles.headers,
      archConfig.excludedHeaders, archConfig.preferredHeaders,
      artDirection, layoutStyle, hash, 28
    )
    const footer = selectBest(
      Object.keys(componentStyles.footers), componentStyles.footers,
      archConfig.excludedFooters, archConfig.preferredFooters,
      artDirection, layoutStyle, hash, 32
    )

    return {
      hero,
      services,
      gallery,
      testimonials,
      contact,
      about,
      faq,
      header,
      footer,
      cta: 'CtaBanner',
      pricing: 'PricingTable',
    }
  }

  // Exclude AboutTeam when team has 1 or fewer members
  const aboutExcluded = teamSize <= 1
    ? [...archConfig.excludedAbout, 'AboutTeam']
    : archConfig.excludedAbout

  // Fallback: select from full pool using scoring algorithm
  return {
    hero: selectBest(Object.keys(componentStyles.heroes), componentStyles.heroes, archConfig.excludedHeroes, archConfig.preferredHeroes, artDirection, layoutStyle, hash, 0),
    services: selectBest(Object.keys(componentStyles.services), componentStyles.services, archConfig.excludedServices, archConfig.preferredServices, artDirection, layoutStyle, hash, 4),
    gallery: galleryOverride || selectBest(Object.keys(componentStyles.gallery), componentStyles.gallery, archConfig.excludedGallery, archConfig.preferredGallery, artDirection, layoutStyle, hash, 8),
    testimonials: selectBest(Object.keys(componentStyles.testimonials), componentStyles.testimonials, archConfig.excludedTestimonials, archConfig.preferredTestimonials, artDirection, layoutStyle, hash, 12),
    contact: selectBest(Object.keys(componentStyles.contact), componentStyles.contact, archConfig.excludedContact, archConfig.preferredContact, artDirection, layoutStyle, hash, 16),
    about: selectBest(Object.keys(componentStyles.about), componentStyles.about, aboutExcluded, archConfig.preferredAbout, artDirection, layoutStyle, hash, 20),
    faq: selectBest(Object.keys(componentStyles.faq), componentStyles.faq, archConfig.excludedFaq, archConfig.preferredFaq, artDirection, layoutStyle, hash, 24),
    header: selectBest(Object.keys(componentStyles.headers), componentStyles.headers, archConfig.excludedHeaders, archConfig.preferredHeaders, artDirection, layoutStyle, hash, 28),
    footer: selectBest(Object.keys(componentStyles.footers), componentStyles.footers, archConfig.excludedFooters, archConfig.preferredFooters, artDirection, layoutStyle, hash, 32),
    cta: 'CtaBanner',
    pricing: 'PricingTable',
  }
}

export async function copySelectedComponents(
  selected: SelectedComponents,
  targetDir: string
): Promise<string[]> {
  const templatesDir = path.join(process.cwd(), 'templates', 'components')
  const copiedFiles: string[] = []

  const componentMap: Record<string, { dir: string; file: string; target: string }> = {
    hero: { dir: 'heroes', file: `${selected.hero}.tsx`, target: 'components/Hero.tsx' },
    services: { dir: 'services', file: `${selected.services}.tsx`, target: 'components/Services.tsx' },
    gallery: { dir: 'gallery', file: `${selected.gallery}.tsx`, target: 'components/Gallery.tsx' },
    testimonials: { dir: 'testimonials', file: `${selected.testimonials}.tsx`, target: 'components/Testimonials.tsx' },
    contact: { dir: 'contact', file: `${selected.contact}.tsx`, target: 'components/Contact.tsx' },
    about: { dir: 'about', file: `${selected.about}.tsx`, target: 'components/About.tsx' },
    faq: { dir: 'faq', file: `${selected.faq}.tsx`, target: 'components/Faq.tsx' },
    header: { dir: 'headers', file: `${selected.header}.tsx`, target: 'components/Header.tsx' },
    footer: { dir: 'footers', file: `${selected.footer}.tsx`, target: 'components/Footer.tsx' },
    ...(selected.cta ? { cta: { dir: 'cta', file: `${selected.cta}.tsx`, target: 'components/CtaBanner.tsx' } } : {}),
    ...(selected.pricing ? { pricing: { dir: 'pricing', file: `${selected.pricing}.tsx`, target: 'components/PricingTable.tsx' } } : {}),
  }

  for (const [key, info] of Object.entries(componentMap)) {
    const srcPath = path.join(templatesDir, info.dir, info.file)
    const destPath = path.join(targetDir, info.target)

    try {
      await fs.access(srcPath)
      const content = await fs.readFile(srcPath, 'utf-8')
      const destDir = path.dirname(destPath)
      await fs.mkdir(destDir, { recursive: true })
      await fs.writeFile(destPath, content, 'utf-8')
      copiedFiles.push(info.target)
    } catch (error) {
      console.warn(`[Component Selector] Could not copy ${info.file}: ${error}`)
    }
  }

  return copiedFiles
}
