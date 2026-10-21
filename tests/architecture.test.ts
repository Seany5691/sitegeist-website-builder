import { describe, it, expect } from 'vitest'
import { generateMiMoPrompt, detectIndustry } from '../lib/prompt-builder'
import { generateBoilerplate } from '../lib/boilerplate-generator'
import { selectComponents } from '../lib/component-selector'
import { generateDesignSeed, getDesignSeedInstructions } from '../lib/design-seed'
import { MasterSiteConfig, IndustryArchetype } from '../types/site-config'
import fs from 'fs'
import path from 'path'

// ============================================
// Test Fixtures
// ============================================

const ARCHETYPES = [
  { id: 'bakery', name: 'Bakery', keywords: ['bakery', 'cake', 'bread'], colorPsychology: { primary: '#8B4513', secondary: '#D2691E', accent: '#F5DEB3', mood: 'warm' }, typography: { heading: 'Nunito', body: 'Open Sans', description: 'Friendly' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#FFF8F0' },
  { id: 'security', name: 'Security Services', keywords: ['security', 'guard', 'surveillance'], colorPsychology: { primary: '#1E3A5F', secondary: '#1E40AF', accent: '#DC2626', mood: 'authoritative' }, typography: { heading: 'Oswald', body: 'Inter', description: 'Bold' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'dark' as const, defaultBg: '#0F172A' },
  { id: 'medical', name: 'Medical', keywords: ['doctor', 'clinic', 'medical'], colorPsychology: { primary: '#0077B6', secondary: '#00B4D8', accent: '#48CAE4', mood: 'calming' }, typography: { heading: 'Plus Jakarta Sans', body: 'Inter', description: 'Clean' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#FFFFFF' },
  { id: 'restaurant', name: 'Restaurant', keywords: ['restaurant', 'cafe', 'food'], colorPsychology: { primary: '#B45309', secondary: '#92400E', accent: '#F59E0B', mood: 'appetizing' }, typography: { heading: 'Playfair Display', body: 'Lato', description: 'Elegant' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#FFFBF5' },
  { id: 'legal', name: 'Law Firm', keywords: ['law', 'legal', 'attorney'], colorPsychology: { primary: '#1C1917', secondary: '#78350F', accent: '#B45309', mood: 'authoritative' }, typography: { heading: 'Playfair Display', body: 'Source Sans Pro', description: 'Classic' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'dark' as const, defaultBg: '#0C0A09' },
  { id: 'photography', name: 'Photography', keywords: ['photograph', 'photo', 'studio'], colorPsychology: { primary: '#8B7355', secondary: '#C4A882', accent: '#D4A574', mood: 'warm' }, typography: { heading: 'Playfair Display', body: 'Inter', description: 'Elegant' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#FAF8F5' },
  { id: 'trades', name: 'Trades', keywords: ['plumb', 'electric', 'repair'], colorPsychology: { primary: '#E67E22', secondary: '#2C3E50', accent: '#E74C3C', mood: 'bold' }, typography: { heading: 'Oswald', body: 'Roboto', description: 'Bold' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#F8FAFC' },
  { id: 'realestate', name: 'Real Estate', keywords: ['real estate', 'property'], colorPsychology: { primary: '#1A365D', secondary: '#2B6CB0', accent: '#D97706', mood: 'professional' }, typography: { heading: 'DM Sans', body: 'Inter', description: 'Clean' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#FFFFFF' },
  { id: 'general', name: 'General Business', keywords: [], colorPsychology: { primary: '#0EA5E9', secondary: '#6366F1', accent: '#F59E0B', mood: 'modern' }, typography: { heading: 'Plus Jakarta Sans', body: 'Inter', description: 'Clean' }, layoutPatterns: [], trustSignals: [], conversionCTAs: [], imageryDirection: '', themeMode: 'light' as const, defaultBg: '#FFFFFF' },
]

function makeSiteConfig(overrides: Partial<MasterSiteConfig> = {}): MasterSiteConfig {
  return {
    businessName: 'Test Business',
    city: 'Test City',
    ownerName: 'Test Owner',
    theme: { palette: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b', bg: '#ffffff', text: '#1a1a1a', muted: '#6b7280' } },
    seo: { title: 'Test SEO Title', description: 'Test description', keywords: ['test'] },
    services: [{ title: 'Service 1', description: 'Description 1' }],
    testimonials: [{ name: 'John', text: 'Great!', rating: 5 }],
    faq: [{ question: 'Q1?', answer: 'A1' }],
    hero: { headline: 'Test Headline', subheadline: 'Test Sub', badge: 'Test Badge', ctaText: 'Get Started', ctaLink: '#contact', heroImageUrl: '' },
    contact: { phone: '0834799732', whatsapp: '0834799732', email: 'test@test.com', address: 'Test Address' },
    businessHours: [{ dayOfWeek: 'Monday', opens: '08:00', closes: '17:00' }],
    ...overrides,
  } as MasterSiteConfig
}

// ============================================
// PROMPT GENERATION TESTS
// ============================================

describe('Prompt Generation', () => {
  it('should generate prompt with all critical rules', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('FRAMER MOTION SSR SAFETY')
    expect(prompt).toContain('dynamic import')
    expect(prompt).toContain('NEVER import from next/document')
    expect(prompt).toContain('NO ERROR PAGES')
    expect(prompt).toContain('ZERO HARDCODED COPYWRITING')
    expect(prompt).toContain('useSiteData')
  })

  it('should include static import pattern in Rule 1D', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain("import Header from '@/components/Header'")
    expect(prompt).toContain("import Footer from '@/components/Footer'")
    expect(prompt).toContain("import SectionRenderer from '@/components/SectionRenderer'")
    // Must NOT tell MiMo to use ssr:false dynamic imports (blank-page cause)
    expect(prompt).not.toMatch(/GOOD:\s*const Hero = dynamic/)
  })

  it('should tell MiMo components are pre-built', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('PRE-BUILT')
    expect(prompt).toContain('DO NOT CREATE')
    expect(prompt).toContain('DO NOT modify')
  })

  it('should include site-config.json schema with all required fields', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('"hero"')
    expect(prompt).toContain('"headline"')
    expect(prompt).toContain('"subheadline"')
    expect(prompt).toContain('"badge"')
    expect(prompt).toContain('"ctaText"')
    expect(prompt).toContain('"heroImageUrl"')
    expect(prompt).toContain('"about"')
    expect(prompt).toContain('"paragraph1"')
    expect(prompt).toContain('"pageContent"')
    expect(prompt).toContain('"servicesTitle"')
    expect(prompt).toContain('"galleryTitle"')
    expect(prompt).toContain('"testimonialsTitle"')
    expect(prompt).toContain('"faqTitle"')
    expect(prompt).toContain('"contactTitle"')
    expect(prompt).toContain('"businessHours"')
  })

  it('should include stock image fallback instructions', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('STOCK IMAGE FALLBACK')
    expect(prompt).toContain('NEVER use gradient placeholders')
    expect(prompt).toContain('Unsplash')
  })

  it('should include upload path as public/uploads/', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('public/uploads/')
    expect(prompt).not.toContain('public/assets/')
  })

  it('should include image-map.json schema with thumbnail field', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('"thumbnail"')
    expect(prompt).toContain('Each category MUST include a "thumbnail" field')
  })

  it('should include Rule 10 about zero hardcoded copywriting', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('RULE 10')
    expect(prompt).toContain('ZERO HARDCODED COPYWRITING')
    expect(prompt).toContain('pageContent.galleryTitle')
    expect(prompt).toContain('pageContent.testimonialsTitle')
  })

  it('should include business hours in the schema', () => {
    const config = makeSiteConfig()
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('"dayOfWeek"')
    expect(prompt).toContain('"opens"')
    expect(prompt).toContain('"closes"')
  })

  it('should include hero content from site config', () => {
    const config = makeSiteConfig({
      hero: { headline: 'Amazing Headline', subheadline: 'Great Sub', badge: 'Badge', ctaText: 'Click Me', ctaLink: '#contact', heroImageUrl: '' }
    })
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('Amazing Headline')
    expect(prompt).toContain('Great Sub')
    expect(prompt).toContain('Badge')
    expect(prompt).toContain('Click Me')
  })

  it('should include services from site config', () => {
    const config = makeSiteConfig({
      services: [
        { title: 'Wedding Cakes', description: 'Beautiful wedding cakes' },
        { title: 'Birthday Cakes', description: 'Fun birthday cakes' },
      ]
    })
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('Wedding Cakes')
    expect(prompt).toContain('Beautiful wedding cakes')
    expect(prompt).toContain('Birthday Cakes')
  })

  it('should include testimonials from site config', () => {
    const config = makeSiteConfig({
      testimonials: [{ name: 'Sarah', text: 'Amazing cakes!', rating: 5 }]
    })
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('Sarah')
    expect(prompt).toContain('Amazing cakes!')
  })

  it('should include FAQ from site config', () => {
    const config = makeSiteConfig({
      faq: [{ question: 'How far in advance?', answer: '2-4 weeks' }]
    })
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    expect(prompt).toContain('How far in advance?')
    expect(prompt).toContain('2-4 weeks')
  })
})

// ============================================
// ARCHETYPE DETECTION TESTS
// ============================================

describe('Archetype Detection', () => {
  it('should detect bakery from business name', () => {
    const archetype = detectIndustry('Sweet Cakes Bakery', '', '', [])
    expect(archetype.id).toBe('bakery')
  })

  it('should detect security from business name', () => {
    const archetype = detectIndustry('Lekwa Security Services', '', '', [])
    expect(archetype.id).toBe('security')
  })

  it('should detect medical from business name', () => {
    const archetype = detectIndustry('Health First Medical Clinic', '', '', [])
    expect(archetype.id).toBe('medical')
  })

  it('should detect restaurant from business name', () => {
    const archetype = detectIndustry('The Italian Restaurant', '', '', [])
    expect(archetype.id).toBe('restaurant')
  })

  it('should detect legal from business name', () => {
    const archetype = detectIndustry('Smith & Associates Law Firm', '', '', [])
    expect(archetype.id).toBe('legal')
  })

  it('should detect photography from business name', () => {
    const archetype = detectIndustry('Capture Moments Photography', '', '', [])
    expect(archetype.id).toBe('photography')
  })

  it('should detect trades from business name', () => {
    const archetype = detectIndustry('Quick Fix Plumbing Services', '', '', [])
    expect(archetype.id).toBe('trades')
  })

  it('should detect real estate from business name', () => {
    const archetype = detectIndustry('Prime Real Estate Agency', '', '', [])
    expect(archetype.id).toBe('realestate')
  })

  it('should fall back to general for unknown industry', () => {
    const archetype = detectIndustry('Random Company XYZ', '', '', [])
    expect(archetype.id).toBe('general')
  })

  it('should detect from services when name is ambiguous', () => {
    const archetype = detectIndustry('Best Services', '', '', [
      { title: 'Wedding Cake Design', description: 'Custom wedding cakes' },
      { title: 'Birthday Cakes', description: 'Fun birthday cakes' },
    ])
    expect(archetype.id).toBe('bakery')
  })

  it('should detect from SEO title', () => {
    const archetype = detectIndustry('Best Services', 'Professional Security Guard Services', '', [])
    expect(archetype.id).toBe('security')
  })
})

// ============================================
// COMPONENT SELECTOR TESTS
// ============================================

describe('Component Selector', () => {
  it('should select components for bakery archetype', async () => {
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const selected = await selectComponents(archetype, 'test-seed-1')

    expect(selected.hero).toBeTruthy()
    expect(selected.services).toBeTruthy()
    expect(selected.gallery).toBeTruthy()
    expect(selected.testimonials).toBeTruthy()
    expect(selected.contact).toBeTruthy()
    expect(selected.about).toBeTruthy()
    expect(selected.faq).toBeTruthy()
    expect(selected.header).toBeTruthy()
    expect(selected.footer).toBeTruthy()
  })

  it('should select components for security archetype', async () => {
    const archetype = ARCHETYPES.find(a => a.id === 'security')!
    const selected = await selectComponents(archetype, 'test-seed-2')

    expect(selected.hero).toBeTruthy()
    expect(selected.services).toBeTruthy()
    expect(selected.gallery).toBeTruthy()
  })

  it('should select different variants for different seeds', async () => {
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!

    // Try multiple seed pairs — with compositions, some seeds may map to the same recipe
    let foundDiff = false
    const seeds = ['seed-alpha', 'seed-beta', 'seed-gamma', 'seed-delta', 'seed-epsilon', 'seed-zeta']
    for (let i = 0; i < seeds.length && !foundDiff; i++) {
      for (let j = i + 1; j < seeds.length && !foundDiff; j++) {
        const s1 = await selectComponents(archetype, seeds[i])
        const s2 = await selectComponents(archetype, seeds[j])
        const differs = s1.hero !== s2.hero || s1.services !== s2.services || s1.gallery !== s2.gallery ||
                        s1.testimonials !== s2.testimonials || s1.contact !== s2.contact || s1.about !== s2.about
        if (differs) foundDiff = true
      }
    }
    expect(foundDiff).toBe(true)
  })

  it('should select same components for same seed (deterministic)', async () => {
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const selected1 = await selectComponents(archetype, 'same-seed')
    const selected2 = await selectComponents(archetype, 'same-seed')

    expect(selected1).toEqual(selected2)
  })

  it('should select valid component names that exist in the library', async () => {
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const selected = await selectComponents(archetype, 'test-seed')

    const templatesDir = path.join(process.cwd(), 'templates', 'components')

    const heroPath = path.join(templatesDir, 'heroes', `${selected.hero}.tsx`)
    expect(fs.existsSync(heroPath)).toBe(true)

    const servicesPath = path.join(templatesDir, 'services', `${selected.services}.tsx`)
    expect(fs.existsSync(servicesPath)).toBe(true)

    const galleryPath = path.join(templatesDir, 'gallery', `${selected.gallery}.tsx`)
    expect(fs.existsSync(galleryPath)).toBe(true)
  })
})

// ============================================
// BOILERPLATE GENERATOR TESTS
// ============================================

describe('Boilerplate Generator', () => {
  it('should generate all required boilerplate files', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    expect(boilerplate['package.json']).toBeTruthy()
    expect(boilerplate['next.config.js']).toBeTruthy()
    expect(boilerplate['tsconfig.json']).toBeTruthy()
    expect(boilerplate['tailwind.config.ts']).toBeTruthy()
    expect(boilerplate['postcss.config.js']).toBeTruthy()
    expect(boilerplate['app/globals.css']).toBeTruthy()
    expect(boilerplate['app/layout.tsx']).toBeTruthy()
    expect(boilerplate['app/dashboard/page.tsx']).toBeTruthy()
    expect(boilerplate['app/sitemap.ts']).toBeTruthy()
    expect(boilerplate['app/robots.ts']).toBeTruthy()
    expect(boilerplate['components/Header.tsx']).toBeTruthy()
    expect(boilerplate['components/WhatsAppWidget.tsx']).toBeTruthy()
    expect(boilerplate['components/AnimateOnScroll.tsx']).toBeTruthy()
    expect(boilerplate['lib/use-site-data.ts']).toBeTruthy()
    expect(boilerplate['app/api/save-config/route.ts']).toBeTruthy()
    expect(boilerplate['app/api/upload/route.ts']).toBeTruthy()
    expect(boilerplate['site-config-defaults.json']).toBeTruthy()
  })

  it('should generate dashboard page with client-side redirect', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    expect(boilerplate['app/dashboard/page.tsx']).toContain("'use client'")
    expect(boilerplate['app/dashboard/page.tsx']).toContain('useRouter')
    expect(boilerplate['app/dashboard/page.tsx']).toContain('router.replace')
    expect(boilerplate['app/dashboard/page.tsx']).toContain('/dashboard/index.html')
  })

  it('should generate useSiteData hook', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    expect(boilerplate['lib/use-site-data.ts']).toContain("'use client'")
    expect(boilerplate['lib/use-site-data.ts']).toContain('useSiteData')
    expect(boilerplate['lib/use-site-data.ts']).toContain('/site-config.json')
    expect(boilerplate['lib/use-site-data.ts']).toContain('/image-map.json')
  })

  it('should generate save-config route handling both siteConfig and imageMap', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    expect(boilerplate['app/api/save-config/route.ts']).toContain('siteConfig')
    expect(boilerplate['app/api/save-config/route.ts']).toContain('imageMap')
    expect(boilerplate['app/api/save-config/route.ts']).toContain('site-config.json')
    expect(boilerplate['app/api/save-config/route.ts']).toContain('image-map.json')
  })

  it('should generate upload route saving to public/uploads/', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    expect(boilerplate['app/api/upload/route.ts']).toContain('public')
    expect(boilerplate['app/api/upload/route.ts']).toContain('uploads')
    expect(boilerplate['app/api/upload/route.ts']).toContain('/uploads/')
  })

  it('should generate AnimateOnScroll component', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    expect(boilerplate['components/AnimateOnScroll.tsx']).toContain("'use client'")
    expect(boilerplate['components/AnimateOnScroll.tsx']).toContain('AnimateOnScroll')
    expect(boilerplate['components/AnimateOnScroll.tsx']).toContain('IntersectionObserver')
  })

  it('should generate site-config-defaults.json with hero data', () => {
    const config = makeSiteConfig({
      hero: { headline: 'Test Headline', subheadline: 'Test Sub', badge: 'Badge', ctaText: 'Click', ctaLink: '#contact', heroImageUrl: '' }
    })
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    const defaults = JSON.parse(boilerplate['site-config-defaults.json'])
    expect(defaults.hero.headline).toBe('Test Headline')
    expect(defaults.hero.subheadline).toBe('Test Sub')
    expect(defaults.hero.badge).toBe('Badge')
  })

  it('should generate site-config-defaults.json with services', () => {
    const config = makeSiteConfig({
      services: [{ title: 'Cake Design', description: 'Custom cakes' }]
    })
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    const defaults = JSON.parse(boilerplate['site-config-defaults.json'])
    expect(defaults.services).toHaveLength(1)
    expect(defaults.services[0].title).toBe('Cake Design')
  })

  it('should use correct fonts for each archetype', () => {
    const bakeryConfig = makeSiteConfig()
    const bakeryArchetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const bakeryBoilerplate = generateBoilerplate(bakeryConfig, bakeryArchetype)

    expect(bakeryBoilerplate['app/layout.tsx']).toContain('Nunito')
    expect(bakeryBoilerplate['app/layout.tsx']).toContain('Open Sans')
  })

  it('should use framer-motion 10.18.0', () => {
    const config = makeSiteConfig()
    const archetype = ARCHETYPES.find(a => a.id === 'bakery')!
    const boilerplate = generateBoilerplate(config, archetype)

    const pkg = JSON.parse(boilerplate['package.json'])
    expect(pkg.dependencies['framer-motion']).toBe('10.18.0')
  })
})

// ============================================
// COMPONENT LIBRARY TESTS
// ============================================

describe('Component Library', () => {
  const templatesDir = path.join(process.cwd(), 'templates', 'components')

  it('should have all hero variants', () => {
    const heroes = fs.readdirSync(path.join(templatesDir, 'heroes'))
    expect(heroes.length).toBeGreaterThanOrEqual(10)
    expect(heroes).toContain('HeroSplit.tsx')
    expect(heroes).toContain('HeroCentered.tsx')
    expect(heroes).toContain('HeroFullscreen.tsx')
    expect(heroes).toContain('HeroMinimal.tsx')
    expect(heroes).toContain('HeroStats.tsx')
  })

  it('should have all services variants', () => {
    const services = fs.readdirSync(path.join(templatesDir, 'services'))
    expect(services.length).toBeGreaterThanOrEqual(8)
    expect(services).toContain('ServicesGrid.tsx')
    expect(services).toContain('ServicesTabs.tsx')
    expect(services).toContain('ServicesAccordion.tsx')
  })

  it('should have all gallery variants', () => {
    const gallery = fs.readdirSync(path.join(templatesDir, 'gallery'))
    expect(gallery.length).toBeGreaterThanOrEqual(7)
    expect(gallery).toContain('GalleryMasonry.tsx')
    expect(gallery).toContain('GalleryFilterable.tsx')
    expect(gallery).toContain('GalleryCarousel.tsx')
  })

  it('should have all testimonial variants', () => {
    const testimonials = fs.readdirSync(path.join(templatesDir, 'testimonials'))
    expect(testimonials.length).toBeGreaterThanOrEqual(4)
  })

  it('should have all contact variants', () => {
    const contact = fs.readdirSync(path.join(templatesDir, 'contact'))
    expect(contact.length).toBeGreaterThanOrEqual(4)
  })

  it('should have all about variants', () => {
    const about = fs.readdirSync(path.join(templatesDir, 'about'))
    expect(about.length).toBeGreaterThanOrEqual(4)
  })

  it('should have all FAQ variants', () => {
    const faq = fs.readdirSync(path.join(templatesDir, 'faq'))
    expect(faq.length).toBeGreaterThanOrEqual(3)
  })

  it('should have all header variants', () => {
    const headers = fs.readdirSync(path.join(templatesDir, 'headers'))
    expect(headers.length).toBeGreaterThanOrEqual(4)
  })

  it('should have all footer variants', () => {
    const footers = fs.readdirSync(path.join(templatesDir, 'footers'))
    expect(footers.length).toBeGreaterThanOrEqual(4)
  })

  it('every component should use useSiteData hook', () => {
    const allFiles = getAllTsxFiles(templatesDir)
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      // Skip AnimateOnScroll which doesn't need useSiteData
      if (file.includes('AnimateOnScroll')) continue
      // Headers and footers use useSiteData
      if (file.includes('Header') || file.includes('Footer')) {
        expect(content).toContain('useSiteData')
      }
    }
  })

  it('every component should have use client directive', () => {
    const allFiles = getAllTsxFiles(templatesDir)
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      expect(content).toContain("'use client'")
    }
  })

  it('no component should have hardcoded color values', () => {
    const allFiles = getAllTsxFiles(templatesDir)
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      // Components should use CSS variables, not hardcoded hex colors
      // Allow var(--color-*) patterns
      const hardcodedColors = content.match(/#[0-9a-fA-F]{6}(?!.*var)/g)
      // Only allow white (#fff, #ffffff) and black (#000, #000000) as hardcoded
      if (hardcodedColors) {
        for (const color of hardcodedColors) {
          const lower = color.toLowerCase()
          expect(['#ffffff', '#000000', '#fff', '#000', '#0a0a0a', '#25d366']).toContain(lower)
        }
      }
    }
  })
})

// ============================================
// ARCHETYPE MAPPING TESTS
// ============================================

describe('Archetype Mapping', () => {
  it('should have mapping for all 9 archetypes', async () => {
    const mappingPath = path.join(process.cwd(), 'templates', 'archetype-map.json')
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))

    expect(mapping['heavy-industrial']).toBeTruthy()
    expect(mapping['logistics-freight']).toBeTruthy()
    expect(mapping['trades-field-services']).toBeTruthy()
    expect(mapping['medical-healthcare']).toBeTruthy()
    expect(mapping['professional-corporate']).toBeTruthy()
    expect(mapping['architecture-construction']).toBeTruthy()
    expect(mapping['hospitality-food']).toBeTruthy()
    expect(mapping['retail-commerce']).toBeTruthy()
    expect(mapping['agricultural-industrial']).toBeTruthy()
  })

  it('every archetype should have all component categories', async () => {
    const mappingPath = path.join(process.cwd(), 'templates', 'archetype-map.json')
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))

    for (const [archetypeId, archMapping] of Object.entries(mapping) as [string, any][]) {
      // Skip metadata keys (start with _)
      if (archetypeId.startsWith('_')) continue
      expect(archMapping.preferredHeroes || archMapping.heroes).toBeTruthy()
      expect((archMapping.preferredHeroes || archMapping.heroes).length).toBeGreaterThanOrEqual(3)
      expect(archMapping.preferredServices || archMapping.services).toBeTruthy()
      expect((archMapping.preferredServices || archMapping.services).length).toBeGreaterThanOrEqual(3)
      expect(archMapping.preferredGallery || archMapping.gallery).toBeTruthy()
      expect((archMapping.preferredGallery || archMapping.gallery).length).toBeGreaterThanOrEqual(3)
      expect(archMapping.preferredTestimonials || archMapping.testimonials).toBeTruthy()
      expect((archMapping.preferredTestimonials || archMapping.testimonials).length).toBeGreaterThanOrEqual(2)
      expect(archMapping.preferredContact || archMapping.contact).toBeTruthy()
      expect((archMapping.preferredContact || archMapping.contact).length).toBeGreaterThanOrEqual(2)
      expect(archMapping.preferredAbout || archMapping.about).toBeTruthy()
      expect((archMapping.preferredAbout || archMapping.about).length).toBeGreaterThanOrEqual(2)
      expect(archMapping.preferredFaq || archMapping.faq).toBeTruthy()
      expect((archMapping.preferredFaq || archMapping.faq).length).toBeGreaterThanOrEqual(2)
      expect(archMapping.preferredHeaders || archMapping.headers).toBeTruthy()
      expect((archMapping.preferredHeaders || archMapping.headers).length).toBeGreaterThanOrEqual(2)
      expect(archMapping.preferredFooters || archMapping.footers).toBeTruthy()
      expect((archMapping.preferredFooters || archMapping.footers).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every mapped component should exist in the library', async () => {
    const mappingPath = path.join(process.cwd(), 'templates', 'archetype-map.json')
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))
    const templatesDir = path.join(process.cwd(), 'templates', 'components')

    const dirMap: Record<string, string> = {
      heroes: 'heroes', services: 'services', gallery: 'gallery',
      testimonials: 'testimonials', contact: 'contact', about: 'about',
      faq: 'faq', headers: 'headers', footers: 'footers',
    }

    for (const [archetypeId, archMapping] of Object.entries(mapping) as [string, any][]) {
      for (const [category, variants] of Object.entries(archMapping) as [string, any][]) {
        // Skip compositions — they're objects, not string arrays
        if (category === 'compositions') continue
        if (!Array.isArray(variants)) continue
        const dir = dirMap[category]
        if (!dir) continue
        for (const variant of variants) {
          const filePath = path.join(templatesDir, dir, `${variant}.tsx`)
          expect(fs.existsSync(filePath)).toBe(true)
        }
      }
    }
  })
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllTsxFiles(fullPath))
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  return files
}

// ============================================
// TAMMY HOLLIDAY PHOTOGRAPHY — SPECIFIC TEST
// ============================================

describe('Tammy Holliday Photography — Full Pipeline Test', () => {
  const tammyConfig: MasterSiteConfig = {
    businessName: 'Tammy Holliday Photography',
    city: 'Johannesburg',
    ownerName: 'Tammy Holliday',
    theme: { palette: { primary: '#8B7355', secondary: '#C4A882', accent: '#D4A574', bg: '#FAF8F5', text: '#1a1a1a', muted: '#6b7280' } },
    seo: {
      title: 'Tammy Holliday Photography | Wedding & Portrait Photographer in Johannesburg',
      description: 'Professional wedding, family, and portrait photography by Tammy Holliday. Capturing your most precious moments in Johannesburg and surrounds.',
      keywords: ['wedding photographer Johannesburg', 'portrait photography', 'family photographer', 'Tammy Holliday'],
    },
    services: [
      { title: 'Wedding Photography', description: 'Full-day coverage capturing every moment of your special day' },
      { title: 'Family Portraits', description: 'Beautiful family portraits in studio or on location' },
      { title: 'Newborn Photography', description: 'Gentle, safe newborn sessions in my cozy studio' },
      { title: 'Maternity Sessions', description: 'Celebrating the beauty of motherhood with stunning maternity photos' },
    ],
    testimonials: [
      { name: 'Sarah & James', text: 'Tammy captured our wedding day perfectly! Every photo tells a story.', rating: 5 },
      { name: 'Lisa M.', text: 'Our family portraits are absolutely stunning. Tammy made us feel so comfortable.', rating: 5 },
    ],
    faq: [
      { question: 'How far in advance should I book?', answer: 'I recommend booking 3-6 months in advance for weddings, 2-4 weeks for portrait sessions.' },
      { question: 'Do you travel for shoots?', answer: 'Yes! I travel throughout Gauteng and beyond. Travel fees may apply for locations outside Johannesburg.' },
    ],
    hero: {
      headline: 'Capturing Your Most Precious Moments',
      subheadline: 'Professional wedding, family, and portrait photography in Johannesburg',
      badge: 'Award-Winning Photographer',
      ctaText: 'View My Portfolio',
      ctaLink: '/portfolio',
      heroImageUrl: '',
    },
    contact: { phone: '0834799732', whatsapp: '0834799732', email: 'tammy@tammyholliday.co.za', address: 'Johannesburg' },
    businessHours: [{ dayOfWeek: 'Monday', opens: '09:00', closes: '17:00' }],
  } as MasterSiteConfig

  it('should detect photography archetype', () => {
    const archetype = detectIndustry(
      tammyConfig.businessName,
      tammyConfig.seo?.title,
      tammyConfig.seo?.description,
      tammyConfig.services
    )
    expect(archetype.id).toBe('photography')
    expect(archetype.name).toContain('Photography')
    expect(archetype.themeMode).toBe('light')
  })

  it('should generate prompt with photography-specific content', () => {
    const archetype = detectIndustry(
      tammyConfig.businessName,
      tammyConfig.seo?.title,
      tammyConfig.seo?.description,
      tammyConfig.services
    )
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: tammyConfig })

    // Should contain business-specific content
    expect(prompt).toContain('Tammy Holliday Photography')
    expect(prompt).toContain('Capturing Your Most Precious Moments')
    expect(prompt).toContain('Wedding Photography')
    expect(prompt).toContain('Family Portraits')
    expect(prompt).toContain('Newborn Photography')
    expect(prompt).toContain('Maternity Sessions')
    expect(prompt).toContain('Sarah & James')
    expect(prompt).toContain('tammy@tammyholliday.co.za')

    // Should contain photography archetype styling
    expect(prompt).toContain('Photography')
    expect(prompt).toContain('Cormorant Garamond') // photography heading font
  })

  it('should select photography-appropriate components', async () => {
    const archetype = detectIndustry(
      tammyConfig.businessName,
      tammyConfig.seo?.title,
      tammyConfig.seo?.description,
      tammyConfig.services
    )
    const selected = await selectComponents(archetype, 'tammy-holliday-seed')

    // All components should be selected
    expect(selected.hero).toBeTruthy()
    expect(selected.services).toBeTruthy()
    expect(selected.gallery).toBeTruthy()
    expect(selected.testimonials).toBeTruthy()
    expect(selected.contact).toBeTruthy()
    expect(selected.about).toBeTruthy()
    expect(selected.faq).toBeTruthy()
    expect(selected.header).toBeTruthy()
    expect(selected.footer).toBeTruthy()

    // Selected components should exist in the library
    const templatesDir = path.join(process.cwd(), 'templates', 'components')
    expect(fs.existsSync(path.join(templatesDir, 'heroes', `${selected.hero}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'services', `${selected.services}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'gallery', `${selected.gallery}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'testimonials', `${selected.testimonials}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'contact', `${selected.contact}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'about', `${selected.about}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'faq', `${selected.faq}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'headers', `${selected.header}.tsx`))).toBe(true)
    expect(fs.existsSync(path.join(templatesDir, 'footers', `${selected.footer}.tsx`))).toBe(true)
  })

  it('should generate boilerplate with photography fonts', () => {
    const archetype = detectIndustry(
      tammyConfig.businessName,
      tammyConfig.seo?.title,
      tammyConfig.seo?.description,
      tammyConfig.services
    )
    const boilerplate = generateBoilerplate(tammyConfig, archetype)

    // Photography archetype uses Playfair Display (CSS font variable)
    expect(boilerplate['app/layout.tsx']).toContain('Playfair Display')
    expect(boilerplate['app/layout.tsx']).toContain('Inter')

    // Should have correct business name
    expect(boilerplate['app/layout.tsx']).toContain('Tammy Holliday Photography')
  })

  it('should generate prompt with zero hardcoded copywriting rule', () => {
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: tammyConfig })

    // Must tell MiMo to write copywriting to site-config.json
    expect(prompt).toContain('ZERO HARDCODED COPYWRITING')
    expect(prompt).toContain('pageContent.galleryTitle')
    expect(prompt).toContain('pageContent.testimonialsTitle')
    expect(prompt).toContain('pageContent.faqTitle')

    // Must include the full site-config schema
    expect(prompt).toContain('"hero"')
    expect(prompt).toContain('"about"')
    expect(prompt).toContain('"pageContent"')
    expect(prompt).toContain('"businessHours"')
  })

  it('should generate prompt with stock image fallback for photography', () => {
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: tammyConfig })

    // Photography needs real images, not gradients
    expect(prompt).toContain('STOCK IMAGE FALLBACK')
    expect(prompt).toContain('NEVER use gradient placeholders')
    expect(prompt).toContain('Unsplash')
  })

  it('should include all services in the prompt', () => {
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: tammyConfig })

    expect(prompt).toContain('Wedding Photography')
    expect(prompt).toContain('Full-day coverage')
    expect(prompt).toContain('Family Portraits')
    expect(prompt).toContain('Newborn Photography')
    expect(prompt).toContain('Maternity Sessions')
  })

  it('should include testimonials in the prompt', () => {
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: tammyConfig })

    expect(prompt).toContain('Sarah & James')
    expect(prompt).toContain('captured our wedding day perfectly')
    expect(prompt).toContain('Lisa M.')
  })

  it('should include FAQ in the prompt', () => {
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: tammyConfig })

    expect(prompt).toContain('How far in advance should I book')
    expect(prompt).toContain('3-6 months in advance')
    expect(prompt).toContain('Do you travel for shoots')
  })
})

// ============================================
// DYNAMIC ALL-ARCHETYPES TEST
// ============================================

describe('Dynamic Archetype Validation — All 9 Archetypes', () => {
  const testBusinesses = [
    {
      name: 'Sweet Cakes Bakery',
      industry: 'bakery',
      expectedArchetype: 'bakery',
      expectedFont: 'Nunito',
      expectedTheme: 'light',
      services: [{ title: 'Wedding Cakes', description: 'Custom wedding cakes' }],
    },
    {
      name: 'Lekwa Security Services',
      industry: 'security',
      expectedArchetype: 'security',
      expectedFont: 'Oswald',
      expectedTheme: 'dark',
      services: [{ title: 'Armed Response', description: '24/7 armed response' }],
    },
    {
      name: 'Health First Medical Clinic',
      industry: 'medical',
      expectedArchetype: 'medical',
      expectedFont: 'Plus Jakarta Sans',
      expectedTheme: 'light',
      services: [{ title: 'General Practice', description: 'Family healthcare' }],
    },
    {
      name: 'The Italian Restaurant',
      industry: 'restaurant',
      expectedArchetype: 'restaurant',
      expectedFont: 'Playfair Display',
      expectedTheme: 'light',
      services: [{ title: 'Fine Dining', description: 'Authentic Italian cuisine' }],
    },
    {
      name: 'Smith & Associates Law Firm',
      industry: 'legal',
      expectedArchetype: 'legal',
      expectedFont: 'Playfair Display',
      expectedTheme: 'dark',
      services: [{ title: 'Corporate Law', description: 'Business legal services' }],
    },
    {
      name: 'Capture Moments Photography',
      industry: 'photography',
      expectedArchetype: 'photography',
      expectedFont: 'Playfair Display',
      expectedTheme: 'light',
      services: [{ title: 'Wedding Photography', description: 'Full-day coverage' }],
    },
    {
      name: 'Quick Fix Plumbing Services',
      industry: 'trades',
      expectedArchetype: 'trades',
      expectedFont: 'Oswald',
      expectedTheme: 'light',
      services: [{ title: 'Emergency Plumbing', description: '24/7 emergency service' }],
    },
    {
      name: 'Prime Real Estate Agency',
      industry: 'realestate',
      expectedArchetype: 'realestate',
      expectedFont: 'DM Sans',
      expectedTheme: 'light',
      services: [{ title: 'Property Sales', description: 'Residential and commercial' }],
    },
    {
      name: 'Bright Future Academy',
      industry: 'education',
      expectedArchetype: 'education',
      expectedFont: 'Merriweather',
      expectedTheme: 'light',
      services: [{ title: 'Tutoring', description: 'Math and science tutoring' }],
    },
  ]

  for (const business of testBusinesses) {
    describe(`${business.name} (${business.expectedArchetype})`, () => {
      const config: MasterSiteConfig = {
        businessName: business.name,
        city: 'Test City',
        ownerName: 'Test Owner',
        theme: { palette: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b', bg: '#ffffff', text: '#1a1a1a', muted: '#6b7280' } },
        seo: { title: `${business.name} | Test`, description: 'Test', keywords: ['test'] },
        services: business.services,
        testimonials: [{ name: 'Test', text: 'Great!', rating: 5 }],
        faq: [{ question: 'Q1?', answer: 'A1' }],
        hero: { headline: 'Test', subheadline: 'Test', badge: 'Test', ctaText: 'Get Started', ctaLink: '#contact', heroImageUrl: '' },
        contact: { phone: '0834799732', whatsapp: '0834799732', email: 'test@test.com', address: 'Test' },
        businessHours: [{ dayOfWeek: 'Monday', opens: '08:00', closes: '17:00' }],
      } as MasterSiteConfig

      it('should detect correct archetype', () => {
        const archetype = detectIndustry(config.businessName, config.seo?.title, config.seo?.description, config.services)
        expect(archetype.id).toBe(business.expectedArchetype)
      })

      it('should use correct heading font', () => {
        const archetype = detectIndustry(config.businessName, config.seo?.title, config.seo?.description, config.services)
        const boilerplate = generateBoilerplate(config, archetype)
        expect(boilerplate['app/layout.tsx']).toContain(business.expectedFont)
      })

      it('should select valid components from the library', async () => {
        const archetype = detectIndustry(config.businessName, config.seo?.title, config.seo?.description, config.services)
        const selected = await selectComponents(archetype, `test-${business.industry}-seed`)

        const templatesDir = path.join(process.cwd(), 'templates', 'components')
        const categories = [
          { dir: 'heroes', name: selected.hero },
          { dir: 'services', name: selected.services },
          { dir: 'gallery', name: selected.gallery },
          { dir: 'testimonials', name: selected.testimonials },
          { dir: 'contact', name: selected.contact },
          { dir: 'about', name: selected.about },
          { dir: 'faq', name: selected.faq },
          { dir: 'headers', name: selected.header },
          { dir: 'footers', name: selected.footer },
        ]

        for (const cat of categories) {
          const filePath = path.join(templatesDir, cat.dir, `${cat.name}.tsx`)
          expect(fs.existsSync(filePath)).toBe(true)
        }
      })

      it('should generate complete prompt with all rules', () => {
        const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

        expect(prompt).toContain('FRAMER MOTION SSR SAFETY')
        expect(prompt).toContain('dynamic import')
        expect(prompt).toContain('ZERO HARDCODED COPYWRITING')
        expect(prompt).toContain('pageContent.galleryTitle')
        expect(prompt).toContain('"hero"')
        expect(prompt).toContain('"about"')
        expect(prompt).toContain('"pageContent"')
        expect(prompt).toContain('"businessHours"')
        expect(prompt).toContain('PRE-BUILT')
        expect(prompt).toContain('DO NOT CREATE')
      })

      it('should produce different component selections for different seeds', async () => {
        const archetype = detectIndustry(config.businessName, config.seo?.title, config.seo?.description, config.services)

        // Try multiple seed pairs — with compositions, some seeds may map to the same recipe
        let foundDiff = false
        const seeds = ['a', 'b', 'c', 'd', 'e', 'f'].map(s => `seed-${s}-${business.industry}`)
        for (let i = 0; i < seeds.length && !foundDiff; i++) {
          for (let j = i + 1; j < seeds.length && !foundDiff; j++) {
            const s1 = await selectComponents(archetype, seeds[i])
            const s2 = await selectComponents(archetype, seeds[j])
            const differs = s1.hero !== s2.hero || s1.services !== s2.services || s1.gallery !== s2.gallery ||
                            s1.testimonials !== s2.testimonials || s1.contact !== s2.contact || s1.about !== s2.about
            if (differs) foundDiff = true
          }
        }
        expect(foundDiff).toBe(true)
      })

      it('should produce same selection for same seed (deterministic)', async () => {
        const archetype = detectIndustry(config.businessName, config.seo?.title, config.seo?.description, config.services)
        const selected1 = await selectComponents(archetype, `same-seed-${business.industry}`)
        const selected2 = await selectComponents(archetype, `same-seed-${business.industry}`)
        expect(selected1).toEqual(selected2)
      })
    })
  }
})

// ============================================
// Phase 2B: Archetype-Aware Design Seed Tests
// ============================================
describe('Archetype-Aware Design Seed', () => {
  it('should generate consistent seeds with same archetype', () => {
    const seed1 = generateDesignSeed('Mamma & Mia Cakes', 'hospitality-food')
    const seed2 = generateDesignSeed('Mamma & Mia Cakes', 'hospitality-food')
    expect(seed1.id).toBe(seed2.id)
    expect(seed1.layoutStyle).toBe(seed2.layoutStyle)
    expect(seed1.typographyPairing).toBe(seed2.typographyPairing)
  })

  it('should exclude industrial layout for hospitality-food', () => {
    // Test multiple business names to ensure industrial is excluded
    const names = ['Sweet Treats Bakery', 'Golden Crust', 'Mamma Mia Cakes', 'The Cake Shop', 'Fresh Bakes']
    for (const name of names) {
      const seed = generateDesignSeed(name, 'hospitality-food')
      expect(seed.layoutStyle).not.toBe('industrial')
    }
  })

  it('should exclude bold-condensed typography for hospitality-food', () => {
    const names = ['Sweet Treats Bakery', 'Golden Crust', 'Mamma Mia Cakes', 'The Cake Shop', 'Fresh Bakes']
    for (const name of names) {
      const seed = generateDesignSeed(name, 'hospitality-food')
      expect(seed.typographyPairing).not.toBe('bold-condensed')
      expect(seed.typographyPairing).not.toBe('technical-mono')
    }
  })

  it('should exclude minimal decorative for hospitality-food', () => {
    const names = ['Sweet Treats Bakery', 'Golden Crust', 'Mamma Mia Cakes']
    for (const name of names) {
      const seed = generateDesignSeed(name, 'hospitality-food')
      expect(seed.decorativeIntensity).not.toBe('minimal')
    }
  })

  it('should prefer warm-organic or editorial art direction for hospitality-food', () => {
    const names = ['Sweet Treats Bakery', 'Golden Crust', 'Mamma Mia Cakes', 'The Cake Shop', 'Fresh Bakes', 'Artisan Bread Co']
    for (const name of names) {
      const seed = generateDesignSeed(name, 'hospitality-food')
      expect(['warm-organic', 'editorial', 'cinematic']).toContain(seed.artDirection)
    }
  })

  it('should exclude playful layout for medical-healthcare', () => {
    const names = ['City Medical Centre', 'Health First Clinic', 'CareWell Practice', 'Sunrise Health']
    for (const name of names) {
      const seed = generateDesignSeed(name, 'medical-healthcare')
      expect(seed.layoutStyle).not.toBe('playful')
      expect(seed.layoutStyle).not.toBe('industrial')
    }
  })

  it('should exclude playful layout for trades-field-services', () => {
    const names = ['Quick Fix Plumbing', 'Ace Electricians', 'ProBuild Services', 'Top Notch Repairs']
    for (const name of names) {
      const seed = generateDesignSeed(name, 'trades-field-services')
      expect(seed.layoutStyle).not.toBe('playful')
      expect(seed.layoutStyle).not.toBe('elegant')
    }
  })

  it('should still produce different seeds for different businesses with same archetype', () => {
    const seed1 = generateDesignSeed('Sweet Treats Bakery', 'hospitality-food')
    const seed2 = generateDesignSeed('Golden Crust Bakery', 'hospitality-food')
    // At least some properties should differ
    const differs = 
      seed1.gridDensity !== seed2.gridDensity ||
      seed1.headerStyle !== seed2.headerStyle ||
      seed1.cardGeometry !== seed2.cardGeometry ||
      seed1.spacingScale !== seed2.spacingScale
    expect(differs).toBe(true)
  })

  it('should produce different seeds for same business with different archetypes', () => {
    const seed1 = generateDesignSeed('Test Business', 'hospitality-food')
    const seed2 = generateDesignSeed('Test Business', 'trades-field-services')
    // The constrained dimensions should differ
    const differs = 
      seed1.layoutStyle !== seed2.layoutStyle ||
      seed1.typographyPairing !== seed2.typographyPairing ||
      seed1.artDirection !== seed2.artDirection
    expect(differs).toBe(true)
  })

  it('should still work without archetype (backward compatible)', () => {
    const seed = generateDesignSeed('Any Business')
    expect(seed.layoutStyle).toBeDefined()
    expect(seed.typographyPairing).toBeDefined()
    expect(seed.artDirection).toBeDefined()
    expect(seed.sectionOrder[0]).toBe(0) // Hero always first
  })

  it('should produce valid instructions with archetype constraints', () => {
    const seed = generateDesignSeed('Mamma & Mia Cakes', 'hospitality-food')
    const instructions = getDesignSeedInstructions(seed)
    expect(instructions).toContain('DESIGN SEED')
    expect(instructions).toContain('LAYOUT STYLE')
    expect(instructions).toContain('TYPOGRAPHY PAIRING')
    expect(instructions).toContain('ART DIRECTION')
    // Should NOT contain industrial
    expect(instructions).not.toContain('INDUSTRIAL')
  })

  // ============================================
  // All 9 Archetypes — Comprehensive Constraint Verification
  // ============================================
  const ARCHETYPE_TEST_NAMES: Record<string, string[]> = {
    'hospitality-food': ['Sweet Treats Bakery', 'Golden Crust', 'Mamma Mia Cakes', 'The Italian Restaurant', 'Fresh Bakes'],
    'medical-healthcare': ['City Medical Centre', 'Health First Clinic', 'CareWell Practice', 'Sunrise Health', 'Wellness Hub'],
    'professional-corporate': ['Smith & Associates', 'Pinnacle Group', 'Apex Consulting', 'Sterling Partners', 'Vanguard Legal'],
    'trades-field-services': ['Quick Fix Plumbing', 'Ace Electricians', 'ProBuild Services', 'Top Notch Repairs', 'Reliable Roofing'],
    'retail-commerce': ['Urban Threads', 'Tech Haven', 'Bloom Boutique', 'Peak Outdoors', 'Nova Electronics'],
    'architecture-construction': ['Skyline Builders', 'Apex Construction', 'Prestige Homes', 'Ironworks Design', 'Summit Structures'],
    'logistics-freight': ['Swift Haulage', 'TransRoute Logistics', 'Cargo Express', 'FleetLine Movers', 'GlobalFreight SA'],
    'heavy-industrial': ['SteelForge Industries', 'PowerPlant Solutions', 'MegaPress Manufacturing', 'TitanWorks', 'Ironclad Makers'],
    'agricultural-industrial': ['GreenField Supplies', 'Harvest Hub', 'FarmTech Solutions', 'AgriPro SA', 'CropCare Distributors'],
  }

  const ARCHETYPE_CONSTRAINTS: Record<string, { excludedLayouts: string[]; excludedTypography: string[]; excludedArtDirection: string[]; excludedColorIntensity: string[]; excludedDecorative: string[]; excludedMotion: string[] }> = {
    'hospitality-food': { excludedLayouts: ['industrial'], excludedTypography: ['bold-condensed', 'technical-mono'], excludedArtDirection: ['minimal', 'bold'], excludedColorIntensity: ['neon', 'muted'], excludedDecorative: ['minimal'], excludedMotion: ['expressive'] },
    'medical-healthcare': { excludedLayouts: ['playful', 'industrial'], excludedTypography: ['bold-condensed', 'friendly-rounded'], excludedArtDirection: ['bold', 'warm-organic'], excludedColorIntensity: ['neon', 'vibrant'], excludedDecorative: ['expressive'], excludedMotion: ['expressive'] },
    'professional-corporate': { excludedLayouts: ['playful', 'industrial'], excludedTypography: ['friendly-rounded', 'technical-mono'], excludedArtDirection: ['warm-organic', 'bold'], excludedColorIntensity: ['neon', 'pastel'], excludedDecorative: ['expressive'], excludedMotion: ['expressive'] },
    'trades-field-services': { excludedLayouts: ['playful', 'elegant'], excludedTypography: ['editorial-serif', 'elegant-mix'], excludedArtDirection: ['editorial', 'warm-organic'], excludedColorIntensity: ['pastel', 'neon'], excludedDecorative: ['expressive'], excludedMotion: ['subtle'] },
    'retail-commerce': { excludedLayouts: ['industrial'], excludedTypography: ['technical-mono'], excludedArtDirection: ['minimal'], excludedColorIntensity: ['muted'], excludedDecorative: ['minimal'], excludedMotion: ['subtle'] },
    'architecture-construction': { excludedLayouts: ['playful'], excludedTypography: ['friendly-rounded'], excludedArtDirection: ['warm-organic'], excludedColorIntensity: ['neon', 'pastel'], excludedDecorative: ['expressive'], excludedMotion: ['expressive'] },
    'logistics-freight': { excludedLayouts: ['playful', 'elegant'], excludedTypography: ['editorial-serif', 'friendly-rounded'], excludedArtDirection: ['warm-organic'], excludedColorIntensity: ['pastel', 'neon'], excludedDecorative: ['expressive'], excludedMotion: ['expressive'] },
    'heavy-industrial': { excludedLayouts: ['playful', 'elegant'], excludedTypography: ['editorial-serif', 'friendly-rounded'], excludedArtDirection: ['warm-organic'], excludedColorIntensity: ['pastel', 'neon'], excludedDecorative: ['expressive'], excludedMotion: ['expressive'] },
    'agricultural-industrial': { excludedLayouts: ['playful'], excludedTypography: ['technical-mono'], excludedArtDirection: ['cinematic'], excludedColorIntensity: ['neon'], excludedDecorative: ['expressive'], excludedMotion: ['expressive'] },
  }

  for (const [archetypeId, businessNames] of Object.entries(ARCHETYPE_TEST_NAMES)) {
    const constraints = ARCHETYPE_CONSTRAINTS[archetypeId]

    it(`[${archetypeId}] should exclude constrained layouts`, () => {
      for (const name of businessNames) {
        const seed = generateDesignSeed(name, archetypeId)
        expect(constraints.excludedLayouts).not.toContain(seed.layoutStyle)
      }
    })

    it(`[${archetypeId}] should exclude constrained typography`, () => {
      for (const name of businessNames) {
        const seed = generateDesignSeed(name, archetypeId)
        expect(constraints.excludedTypography).not.toContain(seed.typographyPairing)
      }
    })

    it(`[${archetypeId}] should exclude constrained art direction`, () => {
      for (const name of businessNames) {
        const seed = generateDesignSeed(name, archetypeId)
        expect(constraints.excludedArtDirection).not.toContain(seed.artDirection)
      }
    })

    it(`[${archetypeId}] should exclude constrained color intensity`, () => {
      for (const name of businessNames) {
        const seed = generateDesignSeed(name, archetypeId)
        expect(constraints.excludedColorIntensity).not.toContain(seed.colorIntensity)
      }
    })

    it(`[${archetypeId}] should exclude constrained decorative intensity`, () => {
      for (const name of businessNames) {
        const seed = generateDesignSeed(name, archetypeId)
        expect(constraints.excludedDecorative).not.toContain(seed.decorativeIntensity)
      }
    })

    it(`[${archetypeId}] should exclude constrained motion intensity`, () => {
      for (const name of businessNames) {
        const seed = generateDesignSeed(name, archetypeId)
        expect(constraints.excludedMotion).not.toContain(seed.motionIntensity)
      }
    })
  }
})
