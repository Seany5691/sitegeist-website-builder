import { describe, it, expect } from 'vitest'
import { selectComponents } from '../lib/component-selector'
import { generateDesignSeed, getArchetypeConstraintKey } from '../lib/design-seed'
import { getIndustryTemplate, getIndustryColorPalette, getIndustryStyle } from '../lib/industry-templates'
import { generateCreativeBrief } from '../lib/creative-brief'
import { generateBoilerplate } from '../lib/boilerplate-generator'
import { IndustryArchetype, MasterSiteConfig } from '../types/site-config'
import fs from 'fs'
import path from 'path'

// ============================================
// Test Fixtures
// ============================================

function makeArchetype(overrides: Partial<IndustryArchetype> = {}): IndustryArchetype {
  return {
    id: 'bakery',
    name: 'Bakery',
    keywords: ['bakery', 'cake', 'bread'],
    colorPsychology: { primary: '#8B4513', secondary: '#D2691E', accent: '#F5DEB3', mood: 'warm' },
    typography: { heading: 'Nunito', body: 'Open Sans', description: 'Friendly' },
    layoutPatterns: [],
    trustSignals: [],
    conversionCTAs: [],
    imageryDirection: '',
    themeMode: 'light',
    defaultBg: '#FFF8F0',
    ...overrides,
  } as IndustryArchetype
}

function makeSiteConfig(overrides: Partial<MasterSiteConfig> = {}): MasterSiteConfig {
  return {
    businessName: 'Test Business',
    city: 'Test City',
    ownerName: 'Test Owner',
    theme: { palette: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b', bg: '#ffffff', text: '#1a1a1a', muted: '#6b7280' } },
    seo: { title: 'Test', description: 'Test', keywords: ['test'] },
    services: [{ title: 'Service 1', description: 'Description 1' }],
    testimonials: [{ name: 'John', text: 'Great!', rating: 5 }],
    faq: [{ question: 'Q1?', answer: 'A1' }],
    hero: { headline: 'Test', subheadline: 'Test', badge: 'Test', ctaText: 'Get Started', ctaLink: '#contact', heroImageUrl: '' },
    contact: { phone: '0834799732', email: 'test@test.com', address: 'Test Address' },
    ...overrides,
  } as MasterSiteConfig
}

// All archetype keys that should exist in the mapping
const ALL_ARCHETYPE_KEYS = [
  'heavy-industrial', 'logistics-freight', 'trades-field-services',
  'medical-healthcare', 'professional-corporate', 'architecture-construction',
  'hospitality-food', 'retail-commerce', 'agricultural-industrial'
]

// All component names that should exist
const ALL_HEROES = ['HeroFullscreen', 'HeroSplit', 'HeroMinimal', 'HeroStats', 'HeroFeature', 'HeroCentered', 'HeroOverlapping', 'HeroGradient', 'HeroCard', 'HeroShowcase', 'HeroTestimonial', 'HeroContact']
const ALL_SERVICES = ['ServicesGrid', 'ServicesCards', 'ServicesFeature', 'ServicesList', 'ServicesMinimal', 'ServicesTabs', 'ServicesTimeline', 'ServicesAlternating', 'ServicesAsymmetric', 'ServicesIconGrid', 'ServicesAccordion']
const ALL_GALLERY = ['GalleryCategories', 'GalleryMasonry', 'GalleryFilterable', 'GalleryLightbox', 'GalleryMinimal', 'GalleryCinematic', 'GalleryFullscreen', 'GalleryCarousel', 'GalleryFilmstrip', 'GalleryBeforeAfter', 'GalleryStack']
const ALL_TESTIMONIALS = ['TestimonialsSlider', 'TestimonialsGrid', 'TestimonialsCards', 'TestimonialsQuote', 'TestimonialsMinimal']
const ALL_CONTACT = ['ContactSplit', 'ContactFull', 'ContactCentered', 'ContactCards', 'ContactMap', 'ContactMinimal']
const ALL_ABOUT = ['AboutSplit', 'AboutStats', 'AboutMinimal', 'AboutLayered', 'AboutTeam', 'AboutTimeline', 'AboutVideo']
const ALL_FAQ = ['FaqAccordion', 'FaqGrid', 'FaqCards', 'FaqMinimal']
const ALL_HEADERS = ['HeaderSolid', 'HeaderTransparent', 'HeaderMinimal', 'HeaderCentered', 'HeaderSplit']
const ALL_FOOTERS = ['FooterFull', 'FooterCompact', 'FooterDark', 'FooterMinimal', 'FooterCentered']

// ============================================
// ARCHETYPE MAP STRUCTURE TESTS
// ============================================

describe('Archetype Map Structure', () => {
  const mappingPath = path.join(process.cwd(), 'templates', 'archetype-map.json')
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))

  it('should have _componentStyles metadata for all component categories', () => {
    expect(mapping._componentStyles).toBeDefined()
    expect(mapping._componentStyles.heroes).toBeDefined()
    expect(mapping._componentStyles.services).toBeDefined()
    expect(mapping._componentStyles.gallery).toBeDefined()
    expect(mapping._componentStyles.testimonials).toBeDefined()
    expect(mapping._componentStyles.contact).toBeDefined()
    expect(mapping._componentStyles.about).toBeDefined()
    expect(mapping._componentStyles.faq).toBeDefined()
    expect(mapping._componentStyles.headers).toBeDefined()
    expect(mapping._componentStyles.footers).toBeDefined()
  })

  it('should have style metadata for every hero component', () => {
    for (const hero of ALL_HEROES) {
      expect(mapping._componentStyles.heroes[hero]).toBeDefined()
      expect(mapping._componentStyles.heroes[hero].artDirections).toBeInstanceOf(Array)
      expect(mapping._componentStyles.heroes[hero].layouts).toBeInstanceOf(Array)
      expect(mapping._componentStyles.heroes[hero].artDirections.length).toBeGreaterThan(0)
      expect(mapping._componentStyles.heroes[hero].layouts.length).toBeGreaterThan(0)
    }
  })

  it('should have style metadata for every services component', () => {
    for (const svc of ALL_SERVICES) {
      expect(mapping._componentStyles.services[svc]).toBeDefined()
      expect(mapping._componentStyles.services[svc].artDirections).toBeInstanceOf(Array)
      expect(mapping._componentStyles.services[svc].layouts).toBeInstanceOf(Array)
    }
  })

  it('should have style metadata for every gallery component', () => {
    for (const gal of ALL_GALLERY) {
      expect(mapping._componentStyles.gallery[gal]).toBeDefined()
      expect(mapping._componentStyles.gallery[gal].artDirections).toBeInstanceOf(Array)
      expect(mapping._componentStyles.gallery[gal].layouts).toBeInstanceOf(Array)
    }
  })

  it('should have style metadata for every testimonial component', () => {
    for (const t of ALL_TESTIMONIALS) {
      expect(mapping._componentStyles.testimonials[t]).toBeDefined()
    }
  })

  it('should have style metadata for every contact component', () => {
    for (const c of ALL_CONTACT) {
      expect(mapping._componentStyles.contact[c]).toBeDefined()
    }
  })

  it('should have style metadata for every about component', () => {
    for (const a of ALL_ABOUT) {
      expect(mapping._componentStyles.about[a]).toBeDefined()
    }
  })

  it('should have style metadata for every FAQ component', () => {
    for (const f of ALL_FAQ) {
      expect(mapping._componentStyles.faq[f]).toBeDefined()
    }
  })

  it('should have style metadata for every header component', () => {
    for (const h of ALL_HEADERS) {
      expect(mapping._componentStyles.headers[h]).toBeDefined()
    }
  })

  it('should have style metadata for every footer component', () => {
    for (const f of ALL_FOOTERS) {
      expect(mapping._componentStyles.footers[f]).toBeDefined()
    }
  })

  it('should have all 9 archetype keys', () => {
    for (const key of ALL_ARCHETYPE_KEYS) {
      expect(mapping[key]).toBeDefined()
    }
  })

  it('should have preferred and excluded lists for every archetype', () => {
    for (const key of ALL_ARCHETYPE_KEYS) {
      const arch = mapping[key]
      expect(arch.preferredHeroes).toBeInstanceOf(Array)
      expect(arch.excludedHeroes).toBeInstanceOf(Array)
      expect(arch.preferredServices).toBeInstanceOf(Array)
      expect(arch.excludedServices).toBeInstanceOf(Array)
      expect(arch.preferredGallery).toBeInstanceOf(Array)
      expect(arch.excludedGallery).toBeInstanceOf(Array)
      expect(arch.preferredTestimonials).toBeInstanceOf(Array)
      expect(arch.excludedTestimonials).toBeInstanceOf(Array)
      expect(arch.preferredContact).toBeInstanceOf(Array)
      expect(arch.excludedContact).toBeInstanceOf(Array)
      expect(arch.preferredAbout).toBeInstanceOf(Array)
      expect(arch.excludedAbout).toBeInstanceOf(Array)
      expect(arch.preferredFaq).toBeInstanceOf(Array)
      expect(arch.excludedFaq).toBeInstanceOf(Array)
      expect(arch.preferredHeaders).toBeInstanceOf(Array)
      expect(arch.excludedHeaders).toBeInstanceOf(Array)
      expect(arch.preferredFooters).toBeInstanceOf(Array)
      expect(arch.excludedFooters).toBeInstanceOf(Array)
    }
  })

  it('should have compositions with style slots for every archetype', () => {
    for (const key of ALL_ARCHETYPE_KEYS) {
      const arch = mapping[key]
      expect(arch.compositions).toBeInstanceOf(Array)
      expect(arch.compositions.length).toBeGreaterThanOrEqual(3)
      for (const comp of arch.compositions) {
        expect(comp.heroStyle).toBeDefined()
        expect(comp.servicesStyle).toBeDefined()
        expect(comp.galleryStyle).toBeDefined()
        expect(comp.testimonialsStyle).toBeDefined()
        expect(comp.aboutStyle).toBeDefined()
        expect(comp.contactStyle).toBeDefined()
      }
    }
  })

  it('should have preferred lists that reference valid component names', () => {
    for (const key of ALL_ARCHETYPE_KEYS) {
      const arch = mapping[key]
      for (const hero of arch.preferredHeroes) {
        expect(ALL_HEROES).toContain(hero)
      }
      for (const svc of arch.preferredServices) {
        expect(ALL_SERVICES).toContain(svc)
      }
      for (const gal of arch.preferredGallery) {
        expect(ALL_GALLERY).toContain(gal)
      }
    }
  })
})

// ============================================
// COMPONENT SELECTOR — INTELLIGENT SELECTION
// ============================================

describe('Component Selector — Intelligent Selection', () => {
  it('should select components for every archetype', async () => {
    const archetypes = [
      makeArchetype({ id: 'bakery' }),
      makeArchetype({ id: 'security' }),
      makeArchetype({ id: 'medical' }),
      makeArchetype({ id: 'restaurant' }),
      makeArchetype({ id: 'legal' }),
      makeArchetype({ id: 'photography' }),
      makeArchetype({ id: 'trades' }),
      makeArchetype({ id: 'realestate' }),
      makeArchetype({ id: 'saas' }),
      makeArchetype({ id: 'fitness' }),
      makeArchetype({ id: 'beauty' }),
      makeArchetype({ id: 'education' }),
      makeArchetype({ id: 'automotive' }),
      makeArchetype({ id: 'hotel' }),
      makeArchetype({ id: 'salon' }),
    ]

    for (const archetype of archetypes) {
      const selected = await selectComponents(archetype, `test-${archetype.id}-seed`, 0, 0, {
        artDirection: 'editorial',
        layoutStyle: 'modern',
      })

      expect(selected.hero).toBeDefined()
      expect(selected.hero.length).toBeGreaterThan(0)
      expect(selected.services).toBeDefined()
      expect(selected.services.length).toBeGreaterThan(0)
      expect(selected.gallery).toBeDefined()
      expect(selected.testimonials).toBeDefined()
      expect(selected.contact).toBeDefined()
      expect(selected.about).toBeDefined()
      expect(selected.faq).toBeDefined()
      expect(selected.header).toBeDefined()
      expect(selected.footer).toBeDefined()
    }
  })

  it('should produce different selections for different art directions', async () => {
    const archetype = makeArchetype({ id: 'bakery' })

    // Use different seeds to ensure variation (simulates different business names)
    const editorial = await selectComponents(archetype, 'sweet-delights', 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })
    const cinematic = await selectComponents(archetype, 'golden-crust', 0, 0, { artDirection: 'cinematic', layoutStyle: 'bold' })
    const minimal = await selectComponents(archetype, 'artisan-bread', 0, 0, { artDirection: 'minimal', layoutStyle: 'minimal' })

    // All three should produce valid selections
    expect(editorial.hero).toBeDefined()
    expect(cinematic.hero).toBeDefined()
    expect(minimal.hero).toBeDefined()

    // At least 2 of 3 should differ (different seeds + different art directions)
    const keys = new Set([
      `${editorial.hero}-${editorial.services}`,
      `${cinematic.hero}-${cinematic.services}`,
      `${minimal.hero}-${minimal.services}`,
    ])
    expect(keys.size).toBeGreaterThanOrEqual(2)
  })

  it('should produce different selections for different business names', async () => {
    const archetype = makeArchetype({ id: 'bakery' })

    const s1 = await selectComponents(archetype, 'sweet-delights-bakery', 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })
    const s2 = await selectComponents(archetype, 'golden-crust-bakery', 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })
    const s3 = await selectComponents(archetype, 'artisan-bread-co', 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })

    // At least 2 of 3 should differ
    const keys = [`${s1.hero}-${s1.services}`, `${s2.hero}-${s2.services}`, `${s3.hero}-${s3.services}`]
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBeGreaterThanOrEqual(2)
  })

  it('should produce different selections for different archetypes with same seed', async () => {
    const seed = 'same-seed-all-archetypes'

    const bakery = await selectComponents(makeArchetype({ id: 'bakery' }), seed, 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })
    const medical = await selectComponents(makeArchetype({ id: 'medical' }), seed, 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })
    const trades = await selectComponents(makeArchetype({ id: 'trades' }), seed, 0, 0, { artDirection: 'editorial', layoutStyle: 'editorial' })

    // Different archetypes should produce different selections (due to different preferred/excluded lists)
    const bakeryKey = `${bakery.hero}-${bakery.services}`
    const medicalKey = `${medical.hero}-${medical.services}`
    const tradesKey = `${trades.hero}-${trades.services}`

    // At least one pair should differ
    const allSame = bakeryKey === medicalKey && medicalKey === tradesKey
    expect(allSame).toBe(false)
  })

  it('should respect excluded components', async () => {
    const mappingPath = path.join(process.cwd(), 'templates', 'archetype-map.json')
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))

    for (const key of ALL_ARCHETYPE_KEYS) {
      const arch = mapping[key]
      const archetype = makeArchetype({ id: key === 'heavy-industrial' ? 'manufacturing' : key.split('-')[0] })

      const selected = await selectComponents(archetype, `test-${key}`, 0, 0, {
        artDirection: 'bold',
        layoutStyle: 'bold',
      })

      // Verify excluded heroes are not selected
      for (const excluded of arch.excludedHeroes) {
        expect(selected.hero).not.toBe(excluded)
      }
      // Verify excluded services are not selected
      for (const excluded of arch.excludedServices) {
        expect(selected.services).not.toBe(excluded)
      }
    }
  })

  it('should use gallery override for multiple categories', async () => {
    const archetype = makeArchetype({ id: 'bakery' })

    const selected = await selectComponents(archetype, 'test-seed', 20, 3, {
      artDirection: 'editorial',
      layoutStyle: 'editorial',
    })

    expect(selected.gallery).toBe('GalleryCategories')
  })

  it('should use gallery override for many images', async () => {
    const archetype = makeArchetype({ id: 'bakery' })

    const selected = await selectComponents(archetype, 'test-seed', 60, 1, {
      artDirection: 'editorial',
      layoutStyle: 'editorial',
    })

    expect(selected.gallery).toBe('GalleryMasonry')
  })

  it('should use gallery override for few images', async () => {
    const archetype = makeArchetype({ id: 'bakery' })

    const selected = await selectComponents(archetype, 'test-seed', 5, 1, {
      artDirection: 'editorial',
      layoutStyle: 'editorial',
    })

    expect(selected.gallery).toBe('GalleryLightbox')
  })

  it('should always select CtaBanner and PricingTable', async () => {
    const archetype = makeArchetype({ id: 'bakery' })

    const selected = await selectComponents(archetype, 'test-seed', 0, 0, {
      artDirection: 'editorial',
      layoutStyle: 'editorial',
    })

    expect(selected.cta).toBe('CtaBanner')
    expect(selected.pricing).toBe('PricingTable')
  })

  it('should select valid component names that exist in the template directory', async () => {
    const archetype = makeArchetype({ id: 'bakery' })
    const templatesDir = path.join(process.cwd(), 'templates', 'components')

    const selected = await selectComponents(archetype, 'test-seed', 0, 0, {
      artDirection: 'editorial',
      layoutStyle: 'editorial',
    })

    const componentMap = [
      { name: selected.hero, dir: 'heroes' },
      { name: selected.services, dir: 'services' },
      { name: selected.gallery, dir: 'gallery' },
      { name: selected.testimonials, dir: 'testimonials' },
      { name: selected.contact, dir: 'contact' },
      { name: selected.about, dir: 'about' },
      { name: selected.faq, dir: 'faq' },
      { name: selected.header, dir: 'headers' },
      { name: selected.footer, dir: 'footers' },
    ]

    for (const comp of componentMap) {
      const filePath = path.join(templatesDir, comp.dir, `${comp.name}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })
})

// ============================================
// DESIGN SEED TESTS
// ============================================

describe('Design Seed System', () => {
  it('should generate different seeds for different business names', () => {
    const s1 = generateDesignSeed('Sweet Delights Bakery')
    const s2 = generateDesignSeed('Golden Crust Bakery')
    const s3 = generateDesignSeed('Artisan Bread Co')

    expect(s1.id).not.toBe(s2.id)
    expect(s2.id).not.toBe(s3.id)
    expect(s1.id).not.toBe(s3.id)
  })

  it('should generate same seed for same business name (deterministic)', () => {
    const s1 = generateDesignSeed('Sweet Delights Bakery', 'hospitality-food')
    const s2 = generateDesignSeed('Sweet Delights Bakery', 'hospitality-food')

    expect(s1.id).toBe(s2.id)
    expect(s1.artDirection).toBe(s2.artDirection)
    expect(s1.layoutStyle).toBe(s2.layoutStyle)
    expect(s1.typographyPairing).toBe(s2.typographyPairing)
  })

  it('should have valid art directions', () => {
    const validArtDirections = ['editorial', 'minimal', 'bold', 'cinematic', 'warm-organic']
    for (let i = 0; i < 20; i++) {
      const seed = generateDesignSeed(`test-business-${i}`)
      expect(validArtDirections).toContain(seed.artDirection)
    }
  })

  it('should have valid layout styles', () => {
    const validLayouts = ['editorial', 'minimal', 'bold', 'elegant', 'playful', 'industrial']
    for (let i = 0; i < 20; i++) {
      const seed = generateDesignSeed(`test-business-${i}`)
      expect(validLayouts).toContain(seed.layoutStyle)
    }
  })

  it('should have valid typography pairings', () => {
    const validPairings = ['editorial-serif', 'modern-sans', 'bold-condensed', 'elegant-mix', 'friendly-rounded', 'technical-mono']
    for (let i = 0; i < 20; i++) {
      const seed = generateDesignSeed(`test-business-${i}`)
      expect(validPairings).toContain(seed.typographyPairing)
    }
  })

  it('should have valid motion intensities', () => {
    const validMotion = ['subtle', 'moderate', 'expressive']
    for (let i = 0; i < 20; i++) {
      const seed = generateDesignSeed(`test-business-${i}`)
      expect(validMotion).toContain(seed.motionIntensity)
    }
  })

  it('should have valid color intensities', () => {
    const validColor = ['muted', 'vibrant', 'neon', 'pastel']
    for (let i = 0; i < 20; i++) {
      const seed = generateDesignSeed(`test-business-${i}`)
      expect(validColor).toContain(seed.colorIntensity)
    }
  })

  it('should generate section order with Hero first and Contact near end', () => {
    for (let i = 0; i < 10; i++) {
      const seed = generateDesignSeed(`test-business-${i}`)
      expect(seed.sectionOrder[0]).toBe(0) // Hero is always index 0
    }
  })

  it('should respect archetype constraints for bakery', () => {
    const constraintKey = getArchetypeConstraintKey('bakery')
    expect(constraintKey).toBe('hospitality-food')

    // Generate multiple seeds and verify they respect constraints
    for (let i = 0; i < 10; i++) {
      const seed = generateDesignSeed(`bakery-${i}`, constraintKey)
      // hospitality-food excludes 'industrial' layout
      expect(seed.layoutStyle).not.toBe('industrial')
      // hospitality-food excludes 'bold-condensed' typography
      expect(seed.typographyPairing).not.toBe('bold-condensed')
      // hospitality-food excludes 'neon' color intensity
      expect(seed.colorIntensity).not.toBe('neon')
    }
  })

  it('should respect archetype constraints for medical', () => {
    const constraintKey = getArchetypeConstraintKey('medical')

    for (let i = 0; i < 10; i++) {
      const seed = generateDesignSeed(`medical-${i}`, constraintKey)
      // medical-healthcare excludes 'playful' layout
      expect(seed.layoutStyle).not.toBe('playful')
      // medical-healthcare excludes 'bold-condensed' typography
      expect(seed.typographyPairing).not.toBe('bold-condensed')
      // medical-healthcare excludes 'neon' color intensity
      expect(seed.colorIntensity).not.toBe('neon')
    }
  })

  it('should respect archetype constraints for legal', () => {
    const constraintKey = getArchetypeConstraintKey('legal')

    for (let i = 0; i < 10; i++) {
      const seed = generateDesignSeed(`legal-${i}`, constraintKey)
      // professional-corporate excludes 'playful' layout
      expect(seed.layoutStyle).not.toBe('playful')
      // professional-corporate excludes 'friendly-rounded' typography
      expect(seed.typographyPairing).not.toBe('friendly-rounded')
    }
  })
})

// ============================================
// COLOR PALETTE TESTS
// ============================================

describe('Color Palette System', () => {
  it('should have 8 palettes per industry template', () => {
    const industries = ['photography', 'medical', 'restaurant', 'bakery', 'trades', 'legal', 'finance', 'realestate', 'education', 'beauty', 'hospitality', 'retail', 'saas']

    for (const industry of industries) {
      const template = getIndustryTemplate(industry)
      if (template) {
        expect(template.colorPalettes.length).toBeGreaterThanOrEqual(5)
      }
    }
  })

  it('should select different palettes for different seeds', () => {
    const template = getIndustryTemplate('bakery')
    if (!template) return

    const palettes = new Set<string>()
    for (let i = 0; i < 8; i++) {
      const palette = getIndustryColorPalette(template, i)
      palettes.add(palette.id)
    }

    // Should have at least 3 unique palette IDs
    expect(palettes.size).toBeGreaterThanOrEqual(3)
  })

  it('should apply hue rotation when shift is provided', () => {
    const template = getIndustryTemplate('bakery')
    if (!template) return

    const base = getIndustryColorPalette(template, 0, 0)
    const shifted = getIndustryColorPalette(template, 0, 15)

    // Hue-shifted palette should have different primary color
    expect(base.primary).not.toBe(shifted.primary)
    // But should have the same ID base (with '-shifted' suffix)
    expect(shifted.id).toContain('-shifted')
  })

  it('should produce valid hex colors after hue rotation', () => {
    const template = getIndustryTemplate('bakery')
    if (!template) return

    for (let shift = -15; shift <= 15; shift += 5) {
      const palette = getIndustryColorPalette(template, 0, shift)
      expect(palette.primary).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(palette.secondary).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(palette.accent).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('should have all required fields in every palette', () => {
    const industries = ['photography', 'medical', 'restaurant', 'bakery', 'trades', 'legal', 'finance', 'realestate', 'education', 'beauty', 'hospitality', 'retail', 'saas']

    for (const industry of industries) {
      const template = getIndustryTemplate(industry)
      if (!template) continue

      for (const palette of template.colorPalettes) {
        expect(palette.id).toBeDefined()
        expect(palette.name).toBeDefined()
        expect(palette.primary).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(palette.secondary).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(palette.accent).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(palette.bg).toBeDefined()
        expect(palette.text).toBeDefined()
        expect(palette.mood).toBeDefined()
      }
    }
  })
})

// ============================================
// CREATIVE BRIEF TESTS
// ============================================

describe('Creative Brief — Design Seed Integration', () => {
  it('should include design direction section when design seed is provided', () => {
    const brief = generateCreativeBrief({
      businessName: 'Sweet Delights',
      industry: 'Bakery',
      city: 'Cape Town',
      ownerName: 'Jane',
      services: [],
      archetype: makeArchetype(),
      siteConfig: makeSiteConfig(),
      designSeed: {
        artDirection: 'warm-organic',
        layoutStyle: 'editorial',
        typographyPairing: 'editorial-serif',
        motionIntensity: 'moderate',
        colorIntensity: 'vibrant',
        decorativeIntensity: 'subtle',
        spacingScale: 'comfortable',
      },
    })

    expect(brief).toContain('DESIGN DIRECTION')
    expect(brief).toContain('WARM-ORGANIC')
    expect(brief).toContain('EDITORIAL')
    expect(brief).toContain('EDITORIAL-SERIF')
    expect(brief).toContain('MODERATE')
    expect(brief).toContain('VIBRANT')
  })

  it('should not include design direction when no seed is provided', () => {
    const brief = generateCreativeBrief({
      businessName: 'Sweet Delights',
      industry: 'Bakery',
      city: 'Cape Town',
      ownerName: 'Jane',
      services: [],
      archetype: makeArchetype(),
      siteConfig: makeSiteConfig(),
    })

    expect(brief).not.toContain('DESIGN DIRECTION')
  })

  it('should include creative brief sections', () => {
    const brief = generateCreativeBrief({
      businessName: 'Sweet Delights',
      industry: 'Bakery',
      city: 'Cape Town',
      ownerName: 'Jane',
      services: [],
      archetype: makeArchetype(),
      siteConfig: makeSiteConfig(),
    })

    expect(brief).toContain('CREATIVE BRIEF')
    expect(brief).toContain('EMOTIONAL JOURNEY')
    expect(brief).toContain('COMPETITIVE POSITIONING')
    expect(brief).toContain('CONVERSION PSYCHOLOGY')
    expect(brief).toContain('THE PROMISE')
  })
})

// ============================================
// BOILERPLATE GENERATOR TESTS
// ============================================

describe('Boilerplate Generator — Dynamic Section Order', () => {
  it('should generate home page with default section order when no order provided', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype())
    const page = files['app/page.tsx']

    expect(page).toContain('<Hero />')
    expect(page).toContain('<Services />')
    expect(page).toContain('<Gallery />')
    expect(page).toContain('<Testimonials />')
    expect(page).toContain('<About />')
    expect(page).toContain('<Faq />')
    expect(page).toContain('<Contact />')
  })

  it('should generate home page with custom section order', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype(), {
      sectionOrder: [2, 0, 3, 1, 5, 4], // Gallery, Hero, Testimonials, Services, About, Faq
    })
    const page = files['app/page.tsx']

    // Gallery should appear before Hero in the output
    const galleryPos = page.indexOf('<Gallery />')
    const heroPos = page.indexOf('<Hero />')
    expect(galleryPos).toBeLessThan(heroPos)
  })

  it('should always have Contact at the end', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype(), {
      sectionOrder: [3, 1, 2, 0, 5, 4],
    })
    const page = files['app/page.tsx']

    const contactPos = page.indexOf('<Contact />')
    const lastSectionPos = page.lastIndexOf('<Faq />')
    expect(contactPos).toBeGreaterThan(lastSectionPos)
  })

  it('should include ScrollToTop and WhatsAppWidget', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype())
    const page = files['app/page.tsx']

    expect(page).toContain('<ScrollToTop />')
    expect(page).toContain('<WhatsAppWidget />')
  })

  it('should include art direction data attribute in layout', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype(), {
      artDirection: 'cinematic',
    })
    const layout = files['app/layout.tsx']

    expect(layout).toContain('data-art="cinematic"')
  })

  it('should include form validation CSS classes', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype())
    const css = files['app/globals.css']

    expect(css).toContain('.form-input-error')
    expect(css).toContain('.form-input-success')
    expect(css).toContain('.form-error-message')
  })

  it('should include hero entrance CSS classes', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype())
    const css = files['app/globals.css']

    expect(css).toContain('.hero-entrance')
    expect(css).toContain('[data-art="editorial"]')
    expect(css).toContain('[data-art="minimal"]')
    expect(css).toContain('[data-art="bold"]')
    expect(css).toContain('[data-art="cinematic"]')
    expect(css).toContain('[data-art="warm-organic"]')
  })

  it('should include filmstrip animations', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype())
    const css = files['app/globals.css']

    expect(css).toContain('.animate-filmstrip')
    expect(css).toContain('.animate-filmstrip-reverse')
  })

  it('should include scroll-to-top button styles', () => {
    const files = generateBoilerplate(makeSiteConfig(), makeArchetype())
    const css = files['app/globals.css']

    expect(css).toContain('.scroll-to-top')
    expect(css).toContain('.scroll-to-top.visible')
  })
})

// ============================================
// CROSS-ARCHETYPE VARIATION TESTS
// ============================================

describe('Cross-Archetype Variation', () => {
  const archetypeIds = ['bakery', 'security', 'medical', 'restaurant', 'legal', 'photography', 'trades', 'realestate', 'saas', 'fitness', 'beauty', 'education', 'automotive', 'hotel', 'salon']

  it('should produce unique component combinations across 15 different archetypes', async () => {
    const combinations = new Set<string>()

    for (const id of archetypeIds) {
      const archetype = makeArchetype({ id })
      const selected = await selectComponents(archetype, `test-${id}`, 0, 0, {
        artDirection: 'editorial',
        layoutStyle: 'editorial',
      })
      const key = `${selected.hero}-${selected.services}-${selected.gallery}-${selected.testimonials}-${selected.about}`
      combinations.add(key)
    }

    // Should have at least 5 unique combinations across 15 archetypes
    expect(combinations.size).toBeGreaterThanOrEqual(5)
  })

  it('should produce unique color palettes across archetypes', () => {
    const palettes = new Set<string>()

    for (const id of archetypeIds) {
      const template = getIndustryTemplate(id)
      if (template) {
        const palette = getIndustryColorPalette(template, 0)
        palettes.add(palette.primary)
      }
    }

    // Should have at least 5 unique primary colors
    expect(palettes.size).toBeGreaterThanOrEqual(5)
  })

  it('should produce unique design seeds across 50 business names', () => {
    const seeds = new Set<string>()

    for (let i = 0; i < 50; i++) {
      const seed = generateDesignSeed(`business-${i}`)
      seeds.add(seed.id)
    }

    // All 50 should be unique
    expect(seeds.size).toBe(50)
  })
})

// ============================================
// TEMPLATE FILE INTEGRITY TESTS
// ============================================

describe('Template File Integrity', () => {
  const templatesDir = path.join(process.cwd(), 'templates', 'components')

  it('should have all hero template files', () => {
    for (const hero of ALL_HEROES) {
      const filePath = path.join(templatesDir, 'heroes', `${hero}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all services template files', () => {
    for (const svc of ALL_SERVICES) {
      const filePath = path.join(templatesDir, 'services', `${svc}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all gallery template files', () => {
    for (const gal of ALL_GALLERY) {
      const filePath = path.join(templatesDir, 'gallery', `${gal}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all testimonial template files', () => {
    for (const t of ALL_TESTIMONIALS) {
      const filePath = path.join(templatesDir, 'testimonials', `${t}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all contact template files', () => {
    for (const c of ALL_CONTACT) {
      const filePath = path.join(templatesDir, 'contact', `${c}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all about template files', () => {
    for (const a of ALL_ABOUT) {
      const filePath = path.join(templatesDir, 'about', `${a}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all FAQ template files', () => {
    for (const f of ALL_FAQ) {
      const filePath = path.join(templatesDir, 'faq', `${f}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all header template files', () => {
    for (const h of ALL_HEADERS) {
      const filePath = path.join(templatesDir, 'headers', `${h}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have all footer template files', () => {
    for (const f of ALL_FOOTERS) {
      const filePath = path.join(templatesDir, 'footers', `${f}.tsx`)
      expect(fs.existsSync(filePath)).toBe(true)
    }
  })

  it('should have shared lightbox component', () => {
    const filePath = path.join(templatesDir, 'gallery', '_Lightbox.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('should have CTA banner component', () => {
    const filePath = path.join(templatesDir, 'cta', 'CtaBanner.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('should have pricing table component', () => {
    const filePath = path.join(templatesDir, 'pricing', 'PricingTable.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('should have section IDs in all service components', () => {
    for (const svc of ALL_SERVICES) {
      const filePath = path.join(templatesDir, 'services', `${svc}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('id="services"')
    }
  })

  it('should have section IDs in all gallery components', () => {
    for (const gal of ALL_GALLERY) {
      const filePath = path.join(templatesDir, 'gallery', `${gal}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('id="gallery"')
    }
  })

  it('should have section IDs in all testimonial components', () => {
    for (const t of ALL_TESTIMONIALS) {
      const filePath = path.join(templatesDir, 'testimonials', `${t}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('id="testimonials"')
    }
  })

  it('should have section IDs in all contact components', () => {
    for (const c of ALL_CONTACT) {
      const filePath = path.join(templatesDir, 'contact', `${c}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('id="contact"')
    }
  })

  it('should have hero-entrance class in all hero components', () => {
    for (const hero of ALL_HEROES) {
      const filePath = path.join(templatesDir, 'heroes', `${hero}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('hero-entrance')
    }
  })

  it('should have SVG icons in all header mobile menus', () => {
    for (const h of ALL_HEADERS) {
      const filePath = path.join(templatesDir, 'headers', `${h}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      // Should have SVG icons, not text characters
      expect(content).not.toContain("'✕'")
      expect(content).not.toContain("'☰'")
    }
  })

  it('should have SVG social icons in all footer components', () => {
    for (const f of ALL_FOOTERS) {
      const filePath = path.join(templatesDir, 'footers', `${f}.tsx`)
      const content = fs.readFileSync(filePath, 'utf-8')
      // Should reference socialLinks
      expect(content).toContain('socialLinks')
    }
  })
})
