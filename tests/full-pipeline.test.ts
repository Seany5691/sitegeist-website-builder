/**
 * Full Pipeline Test Suite
 * Tests the entire website builder flow end-to-end
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { extractHardFacts, buildCopywriterPrompt, assembleSiteConfig } from '../lib/hybrid-engine'
import { detectIndustry, generateMiMoPrompt } from '../lib/prompt-builder'
import { generateDesignSeed, getDesignSeedInstructions } from '../lib/design-seed'
import { MasterSiteConfig, FeatureFlags, ScrapedData } from '../types/site-config'

// ============================================
// Test Data - Simulated Scraped Data
// ============================================

const createMockScrapedData = (
  overrides: Partial<ScrapedData> = {}
): ScrapedData => ({
  title: 'Test Business',
  fullMarkdown: 'Test content about photography and weddings',
  imageList: [
    'https://example.com/wedding1.jpg',
    'https://example.com/wedding2.jpg',
    'https://example.com/family1.jpg',
    'https://example.com/portrait1.jpg',
    'https://example.com/logo.png',
  ],
  potentialLogos: ['https://example.com/logo.png'],
  contactInfo: {
    phone: '0834799732',
    whatsapp: '0834799732',
    email: 'test@example.com',
    address: '123 Main St, Gauteng',
  },
  pagesDiscovered: ['https://example.com/', 'https://example.com/weddings', 'https://example.com/families'],
  pagesScraped: 3,
  analytics: {},
  pagesDetails: [
    {
      url: 'https://example.com/',
      title: 'Home',
      metaDescription: 'Welcome to our studio',
      jsonLd: [],
      images: ['https://example.com/hero.jpg', 'https://example.com/logo.png'],
      markdown: 'Welcome to our studio',
    },
    {
      url: 'https://example.com/weddings',
      title: 'Weddings',
      metaDescription: 'Wedding photography',
      jsonLd: [],
      images: ['https://example.com/wedding1.jpg', 'https://example.com/wedding2.jpg'],
      markdown: 'Wedding photography services',
    },
    {
      url: 'https://example.com/families',
      title: 'Families',
      metaDescription: 'Family photography',
      jsonLd: [],
      images: ['https://example.com/family1.jpg'],
      markdown: 'Family photography services',
    },
    {
      url: 'https://example.com/portraits',
      title: 'Portraits',
      metaDescription: 'Portrait photography',
      jsonLd: [],
      images: ['https://example.com/portrait1.jpg'],
      markdown: 'Portrait photography services',
    },
  ],
  ...overrides,
})

// ============================================
// Test Suites
// ============================================

describe('Phase 1: Hybrid Engine - Hard Facts Extraction', () => {
  it('should extract basic business info', () => {
    const facts = extractHardFacts(
      {
        businessName: 'Tammy Holliday Photography',
        ownerName: 'Tammy Holliday',
        city: 'Gauteng',
        whatsappNumber: '0834799732',
      },
      null,
      { primary: '#fbc1a1', secondary: '#f69565', accent: '#f9e594', bg: '#FAF8F5' }
    )

    expect(facts.businessName).toBe('Tammy Holliday Photography')
    expect(facts.ownerName).toBe('Tammy Holliday')
    expect(facts.city).toBe('Gauteng')
    expect(facts.normalizedPhone).toBe('27834799732')
    expect(facts.industry).toBe('Photography')
  })

  it('should categorize images by page URL', () => {
    const scrapedData = createMockScrapedData()
    const facts = extractHardFacts(
      {
        businessName: 'Test Studio',
        ownerName: 'Owner',
        city: 'City',
        whatsappNumber: '0821234567',
      },
      scrapedData,
      { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' }
    )

    // Check that images are categorized
    expect(facts.imagesByCategory.has('Weddings')).toBe(true)
    expect(facts.imagesByCategory.has('Families')).toBe(true)
    expect(facts.imagesByCategory.has('Portraits')).toBe(true)
  })

  it('should filter out logos and UI images', () => {
    const scrapedData = createMockScrapedData({
      imageList: [
        'https://example.com/photo1.jpg',
        'https://example.com/logo.png',
        'https://example.com/favicon.ico',
        'https://example.com/photo2.jpg',
      ],
    })

    const facts = extractHardFacts(
      {
        businessName: 'Test',
        ownerName: 'Owner',
        city: 'City',
        whatsappNumber: '0821234567',
      },
      scrapedData,
      { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' }
    )

    // Should exclude logo and favicon
    expect(facts.allImages).not.toContain('https://example.com/logo.png')
    expect(facts.allImages).not.toContain('https://example.com/favicon.ico')
    expect(facts.allImages).toContain('https://example.com/photo1.jpg')
  })

  it('should use provided industry over auto-detection', () => {
    const facts = extractHardFacts(
      {
        businessName: 'Some Business',
        ownerName: 'Owner',
        city: 'City',
        whatsappNumber: '0821234567',
        industry: 'Restaurant',
      },
      null,
      { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' }
    )

    expect(facts.industry).toBe('Restaurant')
  })

  it('should include Google reviews if provided', () => {
    const facts = extractHardFacts(
      {
        businessName: 'Test',
        ownerName: 'Owner',
        city: 'City',
        whatsappNumber: '0821234567',
      },
      null,
      { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' },
      {
        rating: 4.5,
        reviewCount: 127,
        reviews: [
          { author: 'John', text: 'Great service!', rating: 5, date: '2024-01-01' },
        ],
      }
    )

    expect(facts.googleRating).toBe(4.5)
    expect(facts.googleReviewCount).toBe(127)
    expect(facts.googleReviews).toHaveLength(1)
  })
})

describe('Phase 1: Hybrid Engine - Copywriter Prompt', () => {
  it('should generate comprehensive copywriter prompt', () => {
    const facts = extractHardFacts(
      {
        businessName: 'Rosemarys Restaurant',
        ownerName: 'Rosemary',
        city: 'Klerksdorp',
        whatsappNumber: '0180112453',
        industry: 'Restaurant',
      },
      null,
      { primary: '#8B0000', secondary: '#D4AF37', accent: '#F5F5DC', bg: '#FFFFFF' }
    )

    const prompt = buildCopywriterPrompt(facts)

    expect(prompt).toContain('Rosemarys Restaurant')
    expect(prompt).toContain('Klerksdorp')
    expect(prompt).toContain('Restaurant')
    expect(prompt).toContain('JSON')
  })

  it('should include Google reviews in prompt', () => {
    const facts = extractHardFacts(
      {
        businessName: 'Test',
        ownerName: 'Owner',
        city: 'City',
        whatsappNumber: '0821234567',
      },
      null,
      { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' },
      {
        rating: 4.8,
        reviews: [
          { author: 'Sarah', text: 'Amazing food!', rating: 5, date: '2024-01-01' },
        ],
      }
    )

    const prompt = buildCopywriterPrompt(facts)

    expect(prompt).toContain('4.8')
    expect(prompt).toContain('Reviews')  // Simplified prompt shows rating summary
  })
})

describe('Phase 2: Industry Detection', () => {
  it('should detect Photography from business name', () => {
    const archetype = detectIndustry('Tammy Holliday Photography')
    expect(archetype.id).toBe('photography')
    expect(archetype.themeMode).toBe('light')
  })

  it('should detect Restaurant from business name', () => {
    const archetype = detectIndustry('Rosemarys Restaurant')
    expect(archetype.id).toBe('restaurant')
  })

  it('should detect Medical from keywords', () => {
    const archetype = detectIndustry('City Health Clinic')
    expect(archetype.id).toBe('medical')
  })

  it('should detect Trades from keywords', () => {
    const archetype = detectIndustry('ABC Plumbing Services')
    expect(archetype.id).toBe('trades')
  })

  it('should detect Automotive from keywords', () => {
    const archetype = detectIndustry('City Auto Dealership')
    expect(archetype.id).toBe('automotive')
  })

  it('should detect Legal from keywords', () => {
    const archetype = detectIndustry('Smith & Associates Attorneys')
    expect(archetype.id).toBe('legal')
  })

  it('should return general for unknown', () => {
    const archetype = detectIndustry('XYZ Corp')
    expect(archetype.id).toBe('general')
  })

  it('should prioritize business name over description', () => {
    const archetype = detectIndustry(
      'Wedding Photography Studio',
      'Best Studio',
      'We offer medical services' // Wrong industry in description
    )
    expect(archetype.id).toBe('photography')
  })
})

describe('Phase 5: Design Seed System', () => {
  it('should generate consistent seeds for same business', () => {
    const seed1 = generateDesignSeed('Tammy Holliday Photography')
    const seed2 = generateDesignSeed('Tammy Holliday Photography')

    expect(seed1.id).toBe(seed2.id)
    expect(seed1.layoutStyle).toBe(seed2.layoutStyle)
    expect(seed1.gridDensity).toBe(seed2.gridDensity)
  })

  it('should generate different seeds for different businesses', () => {
    const seed1 = generateDesignSeed('Tammy Holliday Photography')
    const seed2 = generateDesignSeed('Rosemarys Restaurant')

    // At least some properties should differ
    const differs = 
      seed1.layoutStyle !== seed2.layoutStyle ||
      seed1.gridDensity !== seed2.gridDensity ||
      seed1.headerStyle !== seed2.headerStyle ||
      seed1.cardGeometry !== seed2.cardGeometry

    expect(differs).toBe(true)
  })

  it('should produce valid design seed instructions', () => {
    const seed = generateDesignSeed('Test Business')
    const instructions = getDesignSeedInstructions(seed)

    expect(instructions).toContain('DESIGN SEED')
    expect(instructions).toContain('LAYOUT STYLE')
    expect(instructions).toContain('GRID DENSITY')
    expect(instructions).toContain('HEADER STYLE')
    expect(instructions).toContain('CARD GEOMETRY')
  })

  it('should keep Hero section first in order', () => {
    const seed = generateDesignSeed('Any Business')
    expect(seed.sectionOrder[0]).toBe(0) // Hero is always first
  })
})

describe('Phase 4: Prompt Generation', () => {
  it('should generate photography-specific prompt', () => {
    const config: Partial<MasterSiteConfig> = {
      businessName: 'Tammy Holliday Photography',
      city: 'Gauteng',
      ownerName: 'Tammy Holliday',
      seo: {
        title: 'Tammy Holliday Photography | Gauteng Wedding Photographer',
        description: 'Wedding and lifestyle photography',
        jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Tammy Holliday Photography' },
      },
      services: [
        { title: 'Weddings', description: 'Wedding photography', icon: 'Heart', realImageUrl: '' },
      ],
      gallery: Array.from({ length: 20 }, (_, i) => ({
        imageUrl: `https://example.com/photo${i}.jpg`,
        caption: `Photo ${i}`,
        category: 'Weddings',
      })),
      theme: {
        palette: { primary: '#fbc1a1', secondary: '#f69565', accent: '#f9e594', bg: '#FAF8F5' },
        fontPairing: 'Playfair-Lato',
        stylePreset: 'editorial-luxe',
      },
      contact: { phone: '0834799732', whatsapp: '0834799732', email: 'test@test.com', address: 'Gauteng' },
      features: {
        whatsappWidget: true,
        imageLightbox: true,
        animatedScroll: true,
      } as FeatureFlags,
    }

    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: config as MasterSiteConfig,
    })

    // Check key elements - now uses industry template with multiple options
    expect(prompt).toContain('Photography & Creative Services')
    // Typography can be any of the photography template options
    const hasPhotographyFont = 
      prompt.includes('Playfair Display') || 
      prompt.includes('Cormorant Garamond') || 
      prompt.includes('DM Serif Display')
    expect(hasPhotographyFont).toBe(true)
    // Background can be any of the photography palette options
    const hasPhotographyBg = 
      prompt.includes('#FAF8F5') || 
      prompt.includes('#F8FAFC') || 
      prompt.includes('#FFFFFF')
    expect(hasPhotographyBg).toBe(true)
    expect(prompt).toContain('DESIGN SEED')
    expect(prompt).toContain('WHATSAPP WIDGET')
    expect(prompt).toContain('IMAGE LIGHTBOX')
    expect(prompt).toContain('ANIMATED SCROLL')
    expect(prompt).toContain('Tammy Holliday Photography')
  })

  it('should generate restaurant-specific prompt', () => {
    const config: Partial<MasterSiteConfig> = {
      businessName: 'Rosemarys Restaurant',
      city: 'Klerksdorp',
      ownerName: 'Rosemary',
      seo: {
        title: 'Rosemarys Restaurant | Italian Dining in Klerksdorp',
        description: 'Authentic Italian cuisine',
        jsonLd: { '@context': 'https://schema.org', '@type': 'Restaurant', name: 'Rosemarys Restaurant' },
      },
      services: [],
      gallery: [],
      theme: {
        palette: { primary: '#8B0000', secondary: '#D4AF37', accent: '#F5F5DC', bg: '#FFFBF5' },
        fontPairing: 'Playfair-Lato',
        stylePreset: 'editorial-luxe',
      },
      contact: { phone: '0180112453', whatsapp: '0180112453', email: 'info@rosemarys.co.za', address: 'Klerksdorp' },
      features: {} as FeatureFlags,
    }

    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: config as MasterSiteConfig,
    })

    expect(prompt).toContain('Restaurants & Food Service')
    expect(prompt).toContain('Rosemarys Restaurant')
  })

  it('should include production mode instructions when specified', () => {
    const config: Partial<MasterSiteConfig> = {
      businessName: 'Test Business',
      city: 'City',
      ownerName: 'Owner',
      seo: { title: 'Test', description: 'Test', jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness' } },
      services: [],
      gallery: [],
      theme: { palette: { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' }, fontPairing: 'Inter-Plus', stylePreset: 'modern-clean' },
      contact: { phone: '0821234567', whatsapp: '0821234567', email: 'test@test.com', address: 'City' },
      features: {} as FeatureFlags,
    }

    const prompt = generateMiMoPrompt({
      buildMode: 'PRODUCTION',
      siteConfig: config as MasterSiteConfig,
    })

    expect(prompt).toContain('UNIFIED')
    expect(prompt).toContain('public/uploads/')
  })

  it('should include gallery category instructions', () => {
    const config: Partial<MasterSiteConfig> = {
      businessName: 'Test Studio',
      city: 'City',
      ownerName: 'Owner',
      seo: { title: 'Test', description: 'Test', jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness' } },
      services: [],
      gallery: [
        { imageUrl: 'https://example.com/wedding1.jpg', caption: 'Wedding 1', category: 'Weddings' },
        { imageUrl: 'https://example.com/family1.jpg', caption: 'Family 1', category: 'Families' },
      ],
      pageMediaMap: [
        { pageUrl: '/weddings', pageSlug: 'weddings', title: 'Weddings', images: ['https://example.com/wedding1.jpg'] },
        { pageUrl: '/families', pageSlug: 'families', title: 'Families', images: ['https://example.com/family1.jpg'] },
      ],
      theme: { palette: { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' }, fontPairing: 'Inter-Plus', stylePreset: 'modern-clean' },
      contact: { phone: '0821234567', whatsapp: '0821234567', email: 'test@test.com', address: 'City' },
      features: {} as FeatureFlags,
    }

    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: config as MasterSiteConfig,
    })

    expect(prompt).toContain('PRESERVE CATEGORY ORGANIZATION')
    expect(prompt).toContain('Weddings')
    expect(prompt).toContain('Families')
  })
})

describe('Full Pipeline Integration', () => {
  it('should complete full pipeline without errors', () => {
    const scrapedData = createMockScrapedData()
    
    // Step 1: Extract hard facts
    const facts = extractHardFacts(
      {
        businessName: 'Tammy Holliday Photography',
        ownerName: 'Tammy Holliday',
        city: 'Gauteng',
        whatsappNumber: '0834799732',
        industry: 'Photography',
      },
      scrapedData,
      { primary: '#fbc1a1', secondary: '#f69565', accent: '#f9e594', bg: '#FAF8F5' }
    )

    expect(facts.businessName).toBe('Tammy Holliday Photography')
    expect(facts.industry).toBe('Photography')
    expect(facts.imagesByCategory.size).toBeGreaterThan(0)

    // Step 2: Build copywriter prompt
    const copyPrompt = buildCopywriterPrompt(facts)
    expect(copyPrompt).toContain('Tammy Holliday Photography')
    expect(copyPrompt).toContain('Photography')

    // Step 3: Generate design seed
    const seed = generateDesignSeed(facts.businessName)
    expect(seed.id).toBeTruthy()
    expect(seed.layoutStyle).toBeTruthy()

    // Step 4: Detect industry
    const archetype = detectIndustry(facts.businessName)
    expect(archetype.id).toBe('photography')

    // Step 5: Generate prompt
    const mockCopy = {
      heroHeadline: 'Capturing Life\'s Beautiful Moments',
      heroSubheadline: 'Wedding and lifestyle photography in Gauteng',
      heroBadge: 'Award-Winning Photographer',
      heroCta: 'Book Your Session',
      aboutTitle: 'About Tammy',
      aboutDescription: 'Tammy Holliday is a renowned photographer...',
      servicesTitle: 'Our Services',
      serviceDescriptions: facts.services.map(s => ({ title: s.title, description: s.description })),
      testimonialsTitle: 'What Clients Say',
      testimonials: [{ name: 'Happy Client', text: 'Amazing work!', rating: 5, source: 'Google' }],
      faqTitle: 'FAQ',
      faq: [{ question: 'How to book?', answer: 'Contact us via WhatsApp' }],
      contactTitle: 'Contact Us',
      contactDescription: 'Get in touch for bookings',
      seoTitle: 'Tammy Holliday Photography | Gauteng',
      seoDescription: 'Wedding and lifestyle photography in Gauteng',
      seoKeywords: ['photography', 'wedding', 'gauteng'],
      galleryTitle: 'Our Work',
      galleryCategories: [{ name: 'Weddings', description: 'Wedding photography' }],
      trustBadges: ['Award-Winning', 'Years of Experience'],
      whyChooseUs: [{ title: 'Experience', description: 'Years of professional experience' }],
    }

    const siteConfig = assembleSiteConfig(facts, mockCopy, archetype)
    expect(siteConfig.businessName).toBe('Tammy Holliday Photography')
    expect(siteConfig.gallery.length).toBeGreaterThan(0)

    // Step 6: Generate final prompt
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig,
    })

    expect(prompt).toContain('Photography & Creative Services')
    expect(prompt).toContain('DESIGN SEED')
    expect(prompt).toContain('Capturing Life\'s Beautiful Moments')
  })
})
