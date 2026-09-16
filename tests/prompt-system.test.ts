/**
 * Website Builder - Prompt System Tests
 * Tests industry detection, prompt generation, JSON parsing, and color extraction
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { MasterSiteConfig, FeatureFlags } from '../types/site-config'

// ============================================
// Test Data
// ============================================

const PHOTOGRAPHY_CONFIG: Partial<MasterSiteConfig> = {
  businessName: 'Tammy Holliday Photography',
  city: 'Gauteng',
  ownerName: 'Tammy Holliday',
  seo: {
    title: 'Tammy Holliday Photography | Gauteng Wedding & Lifestyle Photographer',
    description: 'Authentic, fun wedding and lifestyle photography in Gauteng. Book your session with Tammy Holliday for timeless memories.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Tammy Holliday Photography' }
  },
  services: [
    { title: 'Weddings', description: 'Natural, story-driven wedding photography', icon: 'camera', realImageUrl: '' },
    { title: 'Families', description: 'Relaxed family sessions', icon: 'users', realImageUrl: '' },
    { title: 'Newborn Photography', description: 'Soft, intimate newborn photography', icon: 'baby', realImageUrl: '' },
  ],
  gallery: Array.from({ length: 20 }, (_, i) => ({
    imageUrl: `https://example.com/photo-${i + 1}.jpg`,
    caption: `Photo ${i + 1}`,
    category: 'Portfolio'
  })),
  theme: {
    palette: { primary: '#fbc1a1', secondary: '#f69565', accent: '#f9e594', bg: '#FAF8F5' },
    fontPairing: 'Playfair-Lato' as const,
    stylePreset: 'editorial-luxe' as const
  },
  contact: { phone: '0834799732', whatsapp: '0834799732', email: 'test@test.com', address: 'Gauteng' },
  features: {
    whatsappWidget: true,
    clickToCall: true,
    contactForm: true,
    imageLightbox: true,
    animatedScroll: true,
    socialMediaLinks: true,
    businessHours: true,
    testimonials: true,
    faq: true,
  } as FeatureFlags
}

const MEDICAL_CONFIG: Partial<MasterSiteConfig> = {
  businessName: 'Pretoria Medical Centre',
  city: 'Pretoria',
  ownerName: 'Dr. Smith',
  seo: {
    title: 'Pretoria Medical Centre | Family Doctor & Clinic',
    description: 'Professional medical services in Pretoria. General practice, dental, and physiotherapy.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'MedicalBusiness', name: 'Pretoria Medical Centre' }
  },
  services: [
    { title: 'General Practice', description: 'Family doctor services', icon: 'stethoscope', realImageUrl: '' },
    { title: 'Dental Care', description: 'Complete dental services', icon: 'tooth', realImageUrl: '' },
  ],
  gallery: [],
  theme: {
    palette: { primary: '#0077B6', secondary: '#00B4D8', accent: '#48CAE4', bg: '#FFFFFF' },
    fontPairing: 'Inter-Plus' as const,
    stylePreset: 'modern-clean' as const
  },
  contact: { phone: '0121234567', whatsapp: '0121234567', email: 'info@medical.co.za', address: 'Pretoria' },
  features: {
    contactForm: true,
    googleMaps: true,
    businessHours: true,
    onlineBooking: true,
    faq: true,
  } as FeatureFlags
}

const TRADES_CONFIG: Partial<MasterSiteConfig> = {
  businessName: 'Pretoria Plumbing & HVAC',
  city: 'Pretoria',
  ownerName: 'Johan',
  seo: {
    title: 'Pretoria Plumbing & HVAC | Emergency Plumber',
    description: 'Professional plumbing and HVAC services in Pretoria. 24/7 emergency service.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Pretoria Plumbing' }
  },
  services: [
    { title: 'Plumbing', description: 'Emergency plumbing repairs', icon: 'wrench', realImageUrl: '' },
    { title: 'HVAC', description: 'Air conditioning installation', icon: 'fan', realImageUrl: '' },
  ],
  gallery: [],
  theme: {
    palette: { primary: '#E67E22', secondary: '#2C3E50', accent: '#E74C3C', bg: '#F8FAFC' },
    fontPairing: 'Oswald-Roboto' as const,
    stylePreset: 'sharp-industrial' as const
  },
  contact: { phone: '0821234567', whatsapp: '0821234567', email: 'info@plumbing.co.za', address: 'Pretoria' },
  features: {
    clickToCall: true,
    contactForm: true,
    beforeAfterSlider: true,
    googleMaps: true,
  } as FeatureFlags
}

// ============================================
// Test Suites
// ============================================

describe('Industry Detection', () => {
  it('should detect Photography industry correctly', async () => {
    const { detectIndustry } = await import('../lib/prompt-builder')
    const archetype = detectIndustry(
      PHOTOGRAPHY_CONFIG.businessName!,
      PHOTOGRAPHY_CONFIG.seo?.title,
      PHOTOGRAPHY_CONFIG.seo?.description,
      PHOTOGRAPHY_CONFIG.services
    )
    expect(archetype.id).toBe('photography')
    expect(archetype.themeMode).toBe('light')
    expect(archetype.defaultBg).toBe('#FAF8F5')
  })

  it('should detect Medical industry correctly', async () => {
    const { detectIndustry } = await import('../lib/prompt-builder')
    const archetype = detectIndustry(
      MEDICAL_CONFIG.businessName!,
      MEDICAL_CONFIG.seo?.title,
      MEDICAL_CONFIG.seo?.description,
      MEDICAL_CONFIG.services
    )
    expect(archetype.id).toBe('medical')
    expect(archetype.themeMode).toBe('light')
  })

  it('should detect Trades industry correctly', async () => {
    const { detectIndustry } = await import('../lib/prompt-builder')
    const archetype = detectIndustry(
      TRADES_CONFIG.businessName!,
      TRADES_CONFIG.seo?.title,
      TRADES_CONFIG.seo?.description,
      TRADES_CONFIG.services
    )
    expect(archetype.id).toBe('trades')
    expect(archetype.themeMode).toBe('light')
  })

  it('should prioritize business name over other fields', async () => {
    const { detectIndustry } = await import('../lib/prompt-builder')
    // Even if description mentions "medical", business name should win
    const archetype = detectIndustry(
      'Johannesburg Photography Studio',
      'Best Studio in Town',
      'We offer medical-grade photo printing',
      [{ title: 'Photo Sessions', description: 'Professional photography', icon: 'camera', realImageUrl: '' }]
    )
    expect(archetype.id).toBe('photography')
  })

  it('should return default for unknown industry', async () => {
    const { detectIndustry } = await import('../lib/prompt-builder')
    const archetype = detectIndustry(
      'ABC Corp',
      'Business Solutions',
      'We provide solutions',
      []
    )
    expect(archetype.id).toBe('general')
  })
})

describe('Prompt Generation', () => {
  it('should generate photography-specific prompt', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

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
    // Mood can be any of the photography palette moods
    const hasPhotographyMood = 
      prompt.includes('warm, intimate, timeless') || 
      prompt.includes('cool, modern, clean') || 
      prompt.includes('neutral, elegant, sophisticated')
    expect(hasPhotographyMood).toBe(true)
  })

  it('should generate medical-specific prompt', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: MEDICAL_CONFIG as MasterSiteConfig
    })

    expect(prompt).toContain('Medical')
    expect(prompt).toContain('DESIGN SEED')
  })

  it('should include feature instructions for enabled features', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

    expect(prompt).toContain('WHATSAPP WIDGET')
    expect(prompt).toContain('CLICK-TO-CALL')
    expect(prompt).toContain('CONTACT FORM')
    expect(prompt).toContain('IMAGE LIGHTBOX')
    expect(prompt).toContain('TESTIMONIALS')
    expect(prompt).toContain('FAQ SECTION')
  })

  it('should NOT include instructions for disabled features', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

    // These features are disabled in PHOTOGRAPHY_CONFIG
    expect(prompt).not.toContain('ONLINE BOOKING')
    expect(prompt).not.toContain('PRODUCT CATALOG')
    expect(prompt).not.toContain('DARK/LIGHT MODE TOGGLE')
  })

  it('should include gallery category info', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

    expect(prompt).toContain('PRESERVE CATEGORY ORGANIZATION')
  })

  it('should use correct theme mode for photography (light)', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

    expect(prompt).toContain('LIGHT MODE')
    expect(prompt).not.toContain('DARK MODE')
  })
})

describe('JSON Parsing & Recovery', () => {
  it('should fix trailing commas', async () => {
    const { fixMalformedJson } = await import('../lib/ai-engine')
    const input = '{"name": "test", "items": ["a", "b",]}'
    const result = fixMalformedJson(input)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should fix newlines in strings', async () => {
    const { fixMalformedJson } = await import('../lib/ai-engine')
    const input = '{"url": "https://example.com/\n    next-line"}'
    const result = fixMalformedJson(input)
    expect(result).not.toContain('\n')
  })

  it('should recover truncated JSON', async () => {
    const { recoverJson } = await import('../lib/ai-engine')
    const input = '{"name": "test", "items": ["a", "b"'
    const result = recoverJson(input)
    expect(result).not.toBeNull()
    if (result) {
      expect(() => JSON.parse(result)).not.toThrow()
    }
  })

  it('should extract partial config from broken JSON', async () => {
    const { extractPartialConfig } = await import('../lib/ai-engine')
    const brokenJson = `{
      "businessName": "Test Business",
      "city": "Pretoria",
      "theme": {
        "palette": {
          "primary": "#ff0000",
          "secondary": "#00ff00",
          "accent": "#0000ff"
        }
      }
    // broken...`

    const result = extractPartialConfig(brokenJson, {
      businessName: 'Test Business',
      ownerName: 'Owner',
      city: 'Pretoria',
      whatsappNumber: '0821234567'
    })

    expect(result).not.toBeNull()
    if (result) {
      expect(result.businessName).toBe('Test Business')
      expect(result.city).toBe('Pretoria')
      expect(result.theme?.palette?.primary).toBe('#ff0000')
    }
  })
})

describe('Color Extraction', () => {
  it('should detect dark colors correctly', async () => {
    const { isDarkColor } = await import('../lib/prompt-builder')
    expect(isDarkColor('#000000')).toBe(true)
    expect(isDarkColor('#121212')).toBe(true)
    expect(isDarkColor('#FFFFFF')).toBe(false)
    expect(isDarkColor('#FAF8F5')).toBe(false)
  })

  it('should get correct contrast color', async () => {
    const { getContrastColor } = await import('../lib/prompt-builder')
    expect(getContrastColor('#000000')).toBe('#ffffff')
    expect(getContrastColor('#FFFFFF')).toBe('#000000')
  })

  it('should normalize phone numbers correctly', async () => {
    const { normalizePhoneNumber } = await import('../lib/prompt-builder')
    expect(normalizePhoneNumber('0834799732')).toBe('27834799732')
    expect(normalizePhoneNumber('27834799732')).toBe('27834799732')
    expect(normalizePhoneNumber('+27 83 479 9732')).toBe('27834799732')
  })
})

describe('Feature Flag Handling', () => {
  it('should include all enabled features in prompt', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const config = {
      ...PHOTOGRAPHY_CONFIG,
      features: {
        whatsappWidget: true,
        clickToCall: true,
        contactForm: true,
        googleMaps: true,
        businessHours: true,
        testimonials: true,
        faq: true,
        blog: false,
        teamProfiles: false,
        pricingTables: false,
        beforeAfterSlider: false,
        socialMediaLinks: true,
        newsletterSignup: false,
        googleAnalytics: false,
        facebookPixel: false,
        videoEmbed: false,
        animatedScroll: true,
        imageLightbox: true,
        darkLightToggle: false,
        productCatalog: false,
        onlineBooking: false,
      } as FeatureFlags
    }

    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: config as MasterSiteConfig
    })

    // Should include
    expect(prompt).toContain('WHATSAPP WIDGET')
    expect(prompt).toContain('GOOGLE MAPS')
    expect(prompt).toContain('BUSINESS HOURS')

    // Should NOT include
    expect(prompt).not.toContain('ONLINE BOOKING')
  })
})

describe('Build Mode Handling', () => {
  it('should generate trial mode instructions', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'TRIAL',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

    expect(prompt).toContain('UNIFIED')
    expect(prompt).toContain('downloaded to public/uploads/')
  })

  it('should generate production mode instructions', async () => {
    const { generateMiMoPrompt } = await import('../lib/prompt-builder')
    const prompt = generateMiMoPrompt({
      buildMode: 'PRODUCTION',
      siteConfig: PHOTOGRAPHY_CONFIG as MasterSiteConfig
    })

    expect(prompt).toContain('UNIFIED')
    expect(prompt).toContain('local paths')
    expect(prompt).toContain('public/uploads/')
  })
})
