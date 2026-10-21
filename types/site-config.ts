// ============================================
// Brand Assets - Explicit logo separation
// ============================================
export interface BrandAssets {
  logoUrl?: string
  logoDarkUrl?: string
  /**
   * Where the logo came from. Precedence: uploaded > scraped > generated.
   * Once 'uploaded', nothing downstream may overwrite logoUrl.
   */
  logoSource?: 'uploaded' | 'scraped' | 'generated'
  /** Original filename of an uploaded logo, for traceability */
  logoName?: string
  brandColors: {
    primary: string
    secondary: string
    accent: string
    bg: string
    text?: string
    muted?: string
  }
}

// ============================================
// Analytics Configuration
// ============================================
export interface AnalyticsConfig {
  ga4MeasurementId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  otherTrackingIds?: Record<string, string>
}

// ============================================
// Feature Flags - Checkbox selections
// ============================================
export interface FeatureFlags {
  // Conversion & Contact
  whatsappWidget: boolean
  clickToCall: boolean
  contactForm: boolean
  googleMaps: boolean
  businessHours: boolean

  // Content Sections
  testimonials: boolean
  faq: boolean
  blog: boolean
  teamProfiles: boolean
  pricingTables: boolean
  beforeAfterSlider: boolean

  // Social & Marketing
  socialMediaLinks: boolean
  newsletterSignup: boolean
  googleAnalytics: boolean
  facebookPixel: boolean

  // Media & Visual
  videoEmbed: boolean
  animatedScroll: boolean
  imageLightbox: boolean
  darkLightToggle: boolean

  // E-Commerce
  productCatalog: boolean
  onlineBooking: boolean
}

// ============================================
// Theme Configuration
// ============================================
export type FontPairing =
  | 'Oswald-Roboto'
  | 'Inter-Plus'
  | 'Playfair-Lato'
  | 'DM-Sans-Playfair'
  | 'Sora-Inter'
  | 'Outfit-Source'
  | 'Space-Grotesk-Inter'

export type StylePreset =
  | 'sharp-industrial'
  | 'modern-clean'
  | 'soft-rounded'
  | 'editorial-luxe'
  | 'bold-contrast'
  | 'minimal-elegant'

export interface ThemeConfig {
  palette: {
    primary: string
    secondary: string
    accent: string
    bg: string
    text?: string
    muted?: string
  }
  fontPairing: FontPairing
  stylePreset: StylePreset
}

// ============================================
// SEO Configuration (Expanded)
// ============================================
export interface SeoConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  openGraph?: {
    title: string
    description: string
    image?: string
    url?: string
    type?: string
  }
  twitter?: {
    card?: string
    title: string
    description: string
    image?: string
  }
  jsonLd: {
    '@context': string
    '@type': string | string[]
    name?: string
    description?: string
    telephone?: string
    email?: string
    url?: string
    image?: string
    priceRange?: string
    address?: {
      '@type': string
      streetAddress?: string
      addressLocality: string
      addressRegion?: string
      postalCode?: string
      addressCountry: string
    }
    geo?: {
      '@type': string
      latitude: string
      longitude: string
    }
    openingHoursSpecification?: Array<{
      '@type': string
      dayOfWeek: string | string[]
      opens: string
      closes: string
    }>
    areaServed?: string | string[]
    hasOfferCatalog?: {
      '@type': string
      name?: string
      itemListElement?: Array<{
        '@type': string
        itemOffered?: {
          '@type': string
          name?: string
        }
      }>
    }
    sameAs?: string[]
  }
}

// ============================================
// GEO Content Configuration
// ============================================
export interface GeoConfig {
  serviceAreas: string[]
  suburbs?: string[]
  landmarks?: string[]
  region?: string
  coordinates?: {
    lat: number
    lng: number
  }
  serviceRadius?: number // km
}

// ============================================
// Hero Content
// ============================================
export interface HeroContent {
  headline: string
  subheadline: string
  heroImageUrl: string
  logoUrl: string
  badge: string
  whatsappNumber: string
  phone: string
  ctaText?: string
  ctaLink?: string
}

// ============================================
// Service Item with pricing
// ============================================
export interface ServiceItem {
  title: string
  description: string
  icon: string
  realImageUrl: string
  priceTag?: string
  features?: string[]
}

// ============================================
// Gallery Item
// ============================================
export interface GalleryItem {
  imageUrl: string
  caption: string
  category?: string
}

// ============================================
// Categorized Galleries
// ============================================
export interface CategorizedGalleries {
  [category: string]: GalleryItem[]
}

// ============================================
// Contact Information
// ============================================
export interface ContactInfo {
  phone: string
  whatsapp: string
  email: string
  address: string
  city?: string
  province?: string
  postalCode?: string
}

// ============================================
// Testimonial Item
// ============================================
export interface TestimonialItem {
  name: string
  text: string
  rating?: number
  source?: string
}

// ============================================
// FAQ Item
// ============================================
export interface FaqItem {
  question: string
  answer: string
}

// ============================================
// Social Media Links
// ============================================
export interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
  pinterest?: string
}

// ============================================
// Team Member
// ============================================
export interface TeamMember {
  name: string
  role: string
  bio?: string
  imageUrl?: string
}

// ============================================
// Business Hours
// ============================================
export interface BusinessHours {
  dayOfWeek: string
  opens: string
  closes: string
}

// ============================================
// Image Manifest (Production Mode)
// ============================================
export interface ImageManifestEntry {
  remoteUrl: string
  localPath: string
  pageSource?: string
  type: 'hero' | 'logo' | 'gallery' | 'service' | 'team' | 'other'
}

// ============================================
// Master Site Configuration
// ============================================
export interface MasterSiteConfig {
  businessName: string
  city: string
  ownerName: string
  /** Industry label from GeistTrack / lead scraper (closed set) — archetype source of truth */
  industry?: string
  /** Platform tenant id (= trial_websites.id) used for form_submissions scoping */
  tenantId?: string
  /** Schema.org sub-type (Bakery, Plumber, ...) — defaults from industry */
  schemaType?: string
  /**
   * Full Control System — what is ON/OFF for sections, pages and features.
   * Missing keys fall back to registry defaults, so older sites still render.
   */
  controls?: {
    sections?: Record<string, boolean>
    pages?: Record<string, boolean>
    features?: Record<string, boolean>
  }
  /** Per-feature edit payload written by the dashboard Features tab */
  featureData?: Record<string, Record<string, unknown>>
  /** Optional content blocks used by newer sections */
  stats?: Array<{ value: string; label: string }>
  process?: Array<{ step: string; title: string; description?: string; image?: string }>
  caseStudies?: Array<{ title: string; summary?: string; result?: string; image?: string; tags?: string[] }>
  trustBadges?: { title?: string; badges?: Array<{ label: string; icon?: string; url?: string }> }
  partners?: { title?: string; items?: Array<{ name: string; logoUrl?: string; url?: string }> }
  areas?: { title?: string; items?: Array<{ name: string; url?: string }> }
  awards?: Array<{ title: string; issuer?: string; year?: string; url?: string; image?: string }>
  beforeAfter?: Array<{ before: string; after: string; caption?: string }>
  newsletter?: { headline?: string; body?: string; ctaLabel?: string }
  mapEmbedUrl?: string
  videos?: Array<{ url: string; type?: string; thumbnail?: string }>
  /** Email address that receives contact-form lead notifications */
  notifyEmail?: string
  /** Schema.org priceRange e.g. "$$", "R50-R500" */
  priceRange?: string
  /** Last content update — used for sitemap lastModified */
  updatedAt?: string
  theme: ThemeConfig
  brandAssets: BrandAssets
  analytics?: AnalyticsConfig
  features: FeatureFlags
  seo: SeoConfig
  geo?: GeoConfig
  hero: HeroContent
  services: ServiceItem[]
  gallery: GalleryItem[]
  categorizedGalleries?: CategorizedGalleries
  testimonials?: TestimonialItem[]
  faq?: FaqItem[]
  socialLinks?: SocialLinks
  team?: TeamMember[]
  businessHours?: BusinessHours[]
  blogPosts?: Array<{ title: string; excerpt: string; date?: string; images: string[]; url: string }>
  pricing?: Array<{ service: string; price: string; details?: string }>
  contact: ContactInfo
  additionalSections?: Array<{
    id: string
    type: string
    title: string
    subtitle?: string
    content?: string
    images?: string[]
    items?: Array<{ title: string; description: string; image?: string }>
  }>
  legacyUrls?: {
    discovered: string[]
    scraped: string[]
    sitemapSource?: string
  }
  pageMediaMap?: PageMediaGroup[]
  createdAt: string
  buildSlug: string
  buildMode?: 'TRIAL' | 'PRODUCTION'
  openRouterError?: string
  imageManifest?: ImageManifestEntry[]
  selectedComponents?: {
    hero?: string
    services?: string
    gallery?: string
    testimonials?: string
    contact?: string
    about?: string
    faq?: string
  }
  designSystem?: {
    seedId?: string
    archetype?: string
    artDirection?: string
    typographyPairing?: string
    headingFont?: string
    bodyFont?: string
    densityProfile?: string
    decorativeIntensity?: string
    motionIntensity?: string
    colorPalette?: { primary: string; secondary: string; accent: string; bg: string; text: string }
  }
}

// ============================================
// Page Media Group
// ============================================
export interface PageMediaGroup {
  pageUrl: string
  pageSlug: string
  title: string
  images: string[]
}

// ============================================
// Scraped Data Types
// ============================================
export interface ScrapedImageContext {
  src: string
  isHeaderOrHero: boolean
  alt?: string
  width?: number
  height?: number
}

export interface ScrapedImageMeta {
  url: string
  sourceUrls: string[]
  usageCount: number
  isPrimaryBrandAsset: boolean
  alt?: string
  width?: number
  height?: number
}

export interface ScrapedPageDetail {
  url: string
  title: string
  metaDescription: string
  jsonLd: any[]
  images: string[]
  markdown: string
}

export interface ScrapedData {
  title: string
  fullMarkdown: string
  imageList: string[]
  potentialLogos: string[]
  contactInfo: ContactInfo
  pagesDiscovered: string[]
  pagesScraped: number
  analytics?: {
    ga4MeasurementId?: string
    googleTagManagerId?: string
    uaTrackingId?: string
    facebookPixelId?: string
  }
  cssColors?: {
    dominantCssPrimary: string
    dominantCssSecondary: string
    dominantCssBg: string
    allColors: Array<{ hex: string; count: number }>
  }
  allDiscoveredImages?: string[]
  pagesDetails?: ScrapedPageDetail[]
  scrapedImagesMetadata?: ScrapedImageMeta[]
  
  // NEW: Structural data for better website generation
  navigation?: Array<{ label: string; url: string }>
  heroContent?: { headline: string; subheadline: string; ctaText?: string; ctaUrl?: string }
  imagesWithAlt?: Array<{ src: string; alt: string }>
  testimonials?: Array<{ name: string; text: string; rating?: number; source?: string }>
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; pinterest?: string }
  pricing?: Array<{ service: string; price: string; details?: string }>
  blogPosts?: Array<{ title: string; excerpt: string; date?: string; url: string; images: string[] }>
  portfolioCategories?: Array<{ name: string; url: string; imageUrl?: string; description?: string }>
  ga4MeasurementId?: string | null
  // Enhanced extraction
  faqs?: Array<{ question: string; answer: string }>
  videos?: Array<{ url: string; type: string; thumbnail?: string }>
  structuredData?: {
    businessHours: Array<{ dayOfWeek: string; opens: string; closes: string }>
    services: Array<{ name: string; description: string; price?: string }>
    reviews: Array<{ author: string; text: string; rating: number }>
    team: Array<{ name: string; role: string }>
    mapEmbedUrl: string | null
  }
  htmlBusinessHours?: Array<{ dayOfWeek: string; opens: string; closes: string }>
  mapEmbedUrl?: string | null
}

// ============================================
// API Request Types
// ============================================
export interface BuildSiteRequest {
  businessName: string
  ownerName?: string
  city: string
  whatsappNumber: string
  existingWebsiteUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  googleMapsUrl?: string
  industry?: string
  buildMode?: 'TRIAL' | 'PRODUCTION'
  serviceAreas?: string[]
  features?: Partial<FeatureFlags>
  businessBackground?: string
  email?: string
  phoneNumber?: string
  specificServices?: string
  tagline?: string
  specificTestimonials?: string
  specificImageUrls?: string
}

// ============================================
// API Response Types
// ============================================
export interface PaletteOption {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  bg: string
  text: string
  mood: string
}

export interface BuildSiteResponse {
  success: boolean
  buildSlug: string
  buildFolder: string
  config: MasterSiteConfig
  imagesExtracted: number
  logosExtracted: number
  pagesScraped: number
  prompt?: string
  promptPath?: string
  configPath?: string
  colorPalette?: PaletteOption
  availablePalettes?: PaletteOption[]
  buildInstructions?: {
    designSystem: string
    technicalRules: string
    contentGuide: string
    dataSchemas: string
    visualStandards: string
  }
}

// ============================================
// Industry Archetype
// ============================================
export interface IndustryArchetype {
  id: string
  name: string
  keywords: string[]
  colorPsychology: {
    primary: string
    secondary: string
    accent: string
    mood: string
  }
  typography: {
    heading: string
    body: string
    description: string
  }
  layoutPatterns: string[]
  trustSignals: string[]
  conversionCTAs: string[]
  imageryDirection: string
  themeMode: 'light' | 'dark' | 'auto' // Industry-specific theme preference
  defaultBg: string // Default background color for this industry
}
