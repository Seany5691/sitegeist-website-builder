/**
 * Full Output Test - Generates complete prompt for manual inspection
 */

import { describe, it, expect } from 'vitest'
import { generateMiMoPrompt, detectIndustry } from '../lib/prompt-builder'
import { generateDesignSeed } from '../lib/design-seed'
import { MasterSiteConfig } from '@/types/site-config'

const LEKWA_SECURITY_CONFIG: Partial<MasterSiteConfig> = {
  businessName: 'Lekwa Security Services',
  city: 'Lephalale',
  ownerName: 'John Mashigo',
  industry: 'Security Services & Protection',
  theme: {
    palette: { primary: '#1E3A5F', secondary: '#2B6CB0', accent: '#D4AF37', bg: '#0F172A', text: '#F8FAFC', muted: '#9ca3af' },
    fontPairing: 'Oswald-Roboto',
    stylePreset: 'modern-clean',
  },
  brandAssets: {
    logoUrl: 'https://www.lekwasecurityservices.co.za/logo.jpg',
    brandColors: { primary: '#1E3A5F', secondary: '#2B6CB0', accent: '#D4AF37', bg: '#0F172A' },
  },
  features: {
    whatsappWidget: true, clickToCall: true, contactForm: true, googleMaps: false,
    businessHours: true, testimonials: true, faq: true, blog: false, teamProfiles: true,
    pricingTables: false, beforeAfterSlider: false, socialMediaLinks: true, newsletterSignup: false,
    googleAnalytics: true, facebookPixel: false, videoEmbed: false, animatedScroll: true,
    imageLightbox: true, darkLightToggle: false, productCatalog: false, onlineBooking: false,
  },
  seo: {
    title: 'Lekwa Security Services | Armed Response & Guarding in Lephalale',
    description: 'Lekwa Security Services offers 24/7 armed response, drone surveillance, static guarding & security training. Call 014 004 0336.',
    keywords: ['security services', 'armed response', 'drone security'],
    openGraph: { title: 'Lekwa Security Services', description: '24/7 security services', type: 'website' },
    twitter: { card: 'summary_large_image' as const, title: 'Lekwa Security', description: 'Security services' },
    jsonLd: { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Lekwa Security Services', telephone: '+27140040336' },
  },
  hero: {
    headline: 'Your Safety, Our Commitment',
    subheadline: '24/7 Protection • Rapid Armed Response • Advanced Security Solutions',
    heroImageUrl: 'https://www.lekwasecurityservices.co.za/hero.jpg',
    logoUrl: 'https://www.lekwasecurityservices.co.za/logo.jpg',
    badge: 'Trusted Security Partner',
    whatsappNumber: '27140040336',
    phone: '27140040336',
    ctaText: 'Get a Free Quote',
    ctaLink: '#contact',
  },
  services: [
    { title: 'Armed Response', description: 'Rapid armed response units ready 24/7', icon: 'Shield' },
    { title: 'Drone Surveillance', description: 'Advanced aerial surveillance', icon: 'Eye' },
    { title: 'Static Guarding', description: 'Professional on-site security', icon: 'Users' },
    { title: 'Security Training', description: 'PSiRA-accredited training', icon: 'GraduationCap' },
  ],
  testimonials: [
    { name: 'Johan Venter', text: 'Excellent service!', rating: 5, source: 'Google' },
    { name: 'Marie Botha', text: 'Professional team!', rating: 5, source: 'Google' },
  ],
  contact: { phone: '014 004 0336', whatsapp: '27140040336', email: 'info@lekwasecurityservices.co.za', address: '59 Springbok Rd, Lephalale' },
  socialLinks: { facebook: 'https://facebook.com/lekwa-security' },
  faq: [
    { question: 'What areas do you serve?', answer: 'We serve Lephalale and surrounding areas.' },
    { question: 'What is your response time?', answer: 'Average response time under 15 minutes.' },
    { question: 'Are you PSiRA registered?', answer: 'Yes, fully PSiRA registered.' },
  ],
}

describe('Full Output Test - Lekwa Security Services', () => {
  it('should generate complete prompt with all sections', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    console.log('\n' + '='.repeat(80))
    console.log('FULL GENERATED PROMPT:')
    console.log('='.repeat(80))
    console.log(prompt)
    console.log('='.repeat(80) + '\n')

    expect(prompt).toContain('Lekwa Security Services')
    expect(prompt).toContain('Security Services & Protection')
    expect(prompt).toContain('Lephalale')
    expect(prompt).toContain('DESIGN SEED')
    expect(prompt).toContain('CRITICAL RULES')
    expect(prompt).toContain('DASHBOARD INTEGRATION')
  })

  it('should detect security industry correctly', () => {
    const archetype = detectIndustry(
      'Lekwa Security Services', 'Armed Response', 'Security services', []
    )
    expect(archetype.id).toBe('security')
  })

  it('should generate unique design seed', () => {
    const seed1 = generateDesignSeed('Lekwa Security Services')
    const seed2 = generateDesignSeed('Tammy Holliday Photography')
    expect(seed1.id).not.toBe(seed2.id)
  })

  it('should include all required sections', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })

    const sections = [
      'CREATIVE BRIEF', 'CRITICAL RULES', 'DESIGN SYSTEM', 'DESIGN SEED',
      'MEDIA & DEPLOYMENT', 'NAVIGATION & HEADER', 'HERO SECTION',
      'CONTENT SECTIONS', 'CONTACT SECTION', 'SEO & STRUCTURED DATA',
      'HUMAN-CENTRIC COPYWRITING', 'TECHNICAL REQUIREMENTS',
      'GLOBAL VISUAL STANDARDS', 'COMPONENT STRUCTURE', 'EXECUTION',
      'DASHBOARD INTEGRATION',
    ]
    for (const s of sections) expect(prompt).toContain(s)
  })

  it('should include banned words', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })
    expect(prompt).toContain('BANNED WORDS')
    expect(prompt).toContain('delight')
    expect(prompt).toContain('elevate')
    expect(prompt).toContain('passionate about')
  })

  it('should include SEO/GEO requirements', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })
    expect(prompt).toContain('CANONICAL URLS')
    expect(prompt).toContain('TWITTER CARDS')
    expect(prompt).toContain('IMAGE ALT TEXT')
  })

  it('should include server/client guidance', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })
    expect(prompt).toContain('FRAMER MOTION SSR SAFETY')
    expect(prompt).toContain('dynamic import')
  })

  it('should include security content', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })
    expect(prompt).toContain('Armed Response')
    expect(prompt).toContain('PSiRA')
    expect(prompt).toContain('24/7')
  })

  it('should include color palette', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })
    // Check that a color palette is present (hex color format)
    expect(prompt).toMatch(/#[0-9a-fA-F]{6}/)
    expect(prompt).toContain('COLOR PALETTE')
  })

  it('should include trust signals', () => {
    const config = LEKWA_SECURITY_CONFIG as MasterSiteConfig
    const prompt = generateMiMoPrompt({ buildMode: 'TRIAL', siteConfig: config })
    expect(prompt).toContain('PSiRA registered')
  })
})
