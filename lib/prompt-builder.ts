import { MasterSiteConfig, FeatureFlags, IndustryArchetype } from '@/types/site-config'
import { generateDesignSeed, getDesignSeedInstructions, DesignSeed, getArchetypeConstraintKey } from './design-seed'
import { generateCreativeBrief } from './creative-brief'
import { resolveArchetypeFromIndustry } from './industry-map'
import { 
  getIndustryTemplate, 
  getIndustryStyle, 
  getIndustryColorPalette, 
  getIndustryTypography,
  getIndustryComponents,
  getIndustryTrustSignals,
  getIndustryConversionCTAs,
  getIndustryImageryDirection,
  getIndustryAnimationGuidance,
  getIndustrySpacingGuidance,
  IndustryTemplate,
  IndustryStyle,
  ColorPalette,
  TypographyOption
} from './industry-templates'
// Phase 9 Enhancement Imports (GAP 28-55)
import { validatePromptData, generateValidationReport, applyPromptFallbacks } from './prompt-builder-validator'
import { buildServiceInstructions } from './prompt-helpers/service-enhancer'
import { buildTypographySection } from './prompt-helpers/typography-specs'
import { buildResponsiveSpecifications } from './prompt-helpers/responsive-specs'
import { buildAccessibilitySpecifications } from './prompt-helpers/accessibility-specs'
import { buildMicroInteractionSpecifications } from './prompt-helpers/micro-interactions'

export interface PromptBuilderOptions {
  buildMode: 'TRIAL' | 'PRODUCTION'
  siteConfig: MasterSiteConfig
  websitesFolder?: string
}

// ============================================
// Color Utilities
// ============================================
export function isDarkColor(hex: string): boolean {
  const cleanHex = hex.replace('#', '').trim()
  let r = 0, g = 0, b = 0

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16)
    g = parseInt(cleanHex.slice(2, 4), 16)
    b = parseInt(cleanHex.slice(4, 6), 16)
  }

  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export function getContrastColor(hex: string): string {
  return isDarkColor(hex) ? '#ffffff' : '#000000'
}

export function normalizePhoneNumber(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  if (clean.startsWith('0')) return '27' + clean.slice(1)
  return clean
}

// ============================================
// Industry-aware stock image hints
// Keeps Unsplash imagery relevant to the trade
// ============================================

function getIndustryStockImageHints(archetypeId: string): string {
  const map: Record<string, string> = {
    trades: `- Use Unsplash photos of: construction sites, tools, pipes, concrete, hard hats, industrial work, building exteriors
- Example: https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80 (construction)
- Example: https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80 (engineer/tools)`,
    medical: `- Use Unsplash photos of: clinics, medical staff, stethoscopes, clean modern healthcare interiors, caring professionals
- Example: https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80 (clinic)
- Example: https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80 (doctor)`,
    restaurant: `- Use Unsplash photos of: restaurant interiors, plated food, chefs cooking, warm dining ambiance
- Example: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80 (restaurant)
- Example: https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80 (dining)`,
    bakery: `- Use Unsplash photos of: bread, cakes, bakery interiors, ovens, flour, pastry displays
- Example: https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80 (bakery)`,
    beauty: `- Use Unsplash photos of: salon interiors, hair styling, spa treatments, beauty products, relaxing atmosphere
- Example: https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80 (salon)`,
    automotive: `- Use Unsplash photos of: cars, garages, mechanics, engines, workshops, auto repair
- Example: https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80 (mechanic)`,
    realestate: `- Use Unsplash photos of: modern homes, property exteriors, keys, real estate agents, architecture
- Example: https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80 (house)`,
    legal: `- Use Unsplash photos of: law books, courthouses, professional office, scales of justice, business meetings
- Example: https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80 (law)`,
    finance: `- Use Unsplash photos of: office buildings, financial charts, professional meetings, calculators, handshake
- Example: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=80 (finance)`,
    security: `- Use Unsplash photos of: security systems, cameras, guards, secure facilities, night security
- Example: https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1920&q=80 (security)`,
    education: `- Use Unsplash photos of: classrooms, students, books, campus, learning environments
- Example: https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80 (campus)`,
    hospitality: `- Use Unsplash photos of: hotels, lobbies, travel, hospitality staff, comfortable rooms
- Example: https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80 (hotel)`,
    retail: `- Use Unsplash photos of: retail stores, products, shopping, storefronts, merchandising
- Example: https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80 (store)`,
    photography: `- Use Unsplash photos of: cameras, photo studios, creative workspaces, portraits, editing
- Example: https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80 (camera)`,
    general: `- Use Unsplash photos of: professional business environments, modern offices, team collaboration
- Example: https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80 (office)`,
    nonprofit: `- Use Unsplash photos of: community, volunteers, helping hands, diverse people, warmth
- Example: https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80 (community)`,
  }
  return map[archetypeId] || map.general
}

// ============================================
// Industry Archetypes - Complete Coverage
// ============================================
const INDUSTRY_ARCHETYPES: IndustryArchetype[] = [
  {
    id: 'photography',
    name: 'Photography & Creative Services',
    keywords: ['photograph', 'photo', 'studio', 'portrait', 'gallery', 'artist', 'creative', 'media', 'film', 'video', 'shoot', 'cinematograph'],
    colorPsychology: { primary: '#8B7355', secondary: '#C4A882', accent: '#D4A574', mood: 'warm, intimate, timeless, natural, artistic' },
    typography: { heading: 'Playfair Display', body: 'Inter', description: 'Elegant serif headlines with clean sans-serif body' },
    layoutPatterns: ['Full-viewport hero with parallax', 'Masonry gallery grid with lightbox', 'Category filter tabs', 'Editorial-style project pages', 'Behind-the-scenes section', 'Pricing/packages'],
    trustSignals: ['Featured in publications', 'Award badges', 'Client count', 'Years of experience', 'Featured venues/events', 'Professional memberships'],
    conversionCTAs: ['Book Your Session', 'View Portfolio', 'Check Availability', 'Request a Quote', 'See Packages'],
    imageryDirection: 'Natural light, emotional storytelling, candid moments, warm tones, shallow depth of field, lifestyle shots',
    themeMode: 'light',
    defaultBg: '#FAF8F5',
  },
  {
    id: 'restaurant',
    name: 'Restaurants & Food Service',
    keywords: ['restaurant', 'cafe', 'food', 'dining', 'catering', 'bistro', 'eatery', 'takeaway', 'food truck'],
    colorPsychology: { primary: '#B45309', secondary: '#92400E', accent: '#F59E0B', mood: 'appetizing, warm, inviting, social' },
    typography: { heading: 'Playfair Display', body: 'Lato', description: 'Elegant serif for dining, clean sans for casual' },
    layoutPatterns: ['Menu showcase with categories and prices', 'Photo gallery of dishes', 'Reservation/booking system', 'Location map with directions', 'Specials/promotions banner'],
    trustSignals: ['Google/TripAdvisor reviews', 'Food safety rating', 'Chef credentials', 'Fresh ingredients', 'Years in business'],
    conversionCTAs: ['Reserve a Table', 'View Menu', 'Order Online', 'Book Catering', 'See Specials'],
    imageryDirection: 'Beautifully plated dishes, restaurant ambiance, kitchen action, happy diners, ingredient close-ups',
    themeMode: 'light',
    defaultBg: '#FFFBF5',
  },
  {
    id: 'bakery',
    name: 'Bakery & Baked Goods',
    keywords: ['bakery', 'bake', 'bread', 'cake', 'pastry', 'pastries', 'dessert', 'cupcake', 'donut', 'croissant', 'patisserie'],
    colorPsychology: { primary: '#8B4513', secondary: '#D2691E', accent: '#F5DEB3', mood: 'warm, cozy, artisanal, inviting' },
    typography: { heading: 'Nunito', body: 'Open Sans', description: 'Friendly rounded sans for approachable feel' },
    layoutPatterns: ['Product showcase with categories', 'Gallery of baked goods', 'Custom cake request form', 'Location map', 'Specials/promotions banner'],
    trustSignals: ['Fresh daily', 'Custom orders', 'Local ingredients', 'Years in business', 'Award-winning', 'Family recipes'],
    conversionCTAs: ['Order Online', 'Custom Cake Request', 'See Our Menu', 'Visit Us', 'Call Now'],
    imageryDirection: 'Freshly baked goods, warm bakery interior, close-up of pastries, happy customers, artisan process',
    themeMode: 'light',
    defaultBg: '#FFF8F0',
  },
  {
    id: 'medical',
    name: 'Medical, Health & Wellness',
    keywords: ['doctor', 'clinic', 'medical', 'dental', 'health', 'physio', 'chiropractic', 'therapy', 'wellness'],
    colorPsychology: { primary: '#0077B6', secondary: '#00B4D8', accent: '#48CAE4', mood: 'clean, trustworthy, calming, professional' },
    typography: { heading: 'Plus Jakarta Sans', body: 'Inter', description: 'Clean modern sans-serif for medical professionalism' },
    layoutPatterns: ['Service cards with icons', 'Doctor/practitioner profiles', 'Patient testimonials', 'Online booking system', 'Insurance info section'],
    trustSignals: ['HPCSA/SANC registration', 'Medical aid accepted', 'Years of practice', 'Specializations listed', 'Patient reviews'],
    conversionCTAs: ['Book an Appointment', 'Call Now', 'Request a Callback', 'Download Patient Forms'],
    imageryDirection: 'Clean clinical environments, friendly staff, modern equipment, diverse patients, calming waiting areas',
    themeMode: 'light',
    defaultBg: '#FFFFFF',
  },
  {
    id: 'trades',
    name: 'Local Trades & Technical Services',
    keywords: ['plumb', 'electric', 'hvac', 'roof', 'repair', 'construction', 'builder', 'painter', 'landscaping', 'cleaning'],
    colorPsychology: { primary: '#E67E22', secondary: '#2C3E50', accent: '#E74C3C', mood: 'bold, reliable, action-oriented' },
    typography: { heading: 'Oswald', body: 'Roboto', description: 'Bold condensed headings for industrial strength' },
    layoutPatterns: ['Before/after sliders', 'Service comparison cards', 'Quote request forms', 'Emergency call banner', 'Gallery of completed work'],
    trustSignals: ['Licensed & insured', 'Free quotes', 'Emergency service', 'Warranty offered', 'Years of experience'],
    conversionCTAs: ['Get a Free Quote', 'Call Now for Emergency', 'Book a Service', 'See Our Work'],
    imageryDirection: 'Action shots, tools of the trade, completed projects, team in branded vehicles',
    themeMode: 'light',
    defaultBg: '#F8FAFC',
  },
  {
    id: 'automotive',
    name: 'Automotive, Logistics & Transport',
    keywords: ['car', 'auto', 'mechanic', 'vehicle', 'dealer', 'fleet', 'logistics', 'transport', 'courier'],
    colorPsychology: { primary: '#1F2937', secondary: '#374151', accent: '#EF4444', mood: 'powerful, reliable, dynamic' },
    typography: { heading: 'Oswald', body: 'Roboto', description: 'Bold industrial sans for automotive strength' },
    layoutPatterns: ['Vehicle inventory grid', 'Service menu with pricing', 'Financing calculator', 'Test drive booking', 'Parts catalog'],
    trustSignals: ['AA approved', 'Warranty offered', 'Years in business', 'Customer reviews', 'After-sales service'],
    conversionCTAs: ['Browse Inventory', 'Book a Test Drive', 'Get a Quote', 'Finance Application'],
    imageryDirection: 'Vehicle photography, showroom shots, service bay, team with vehicles',
    themeMode: 'dark',
    defaultBg: '#111827',
  },
  {
    id: 'legal',
    name: 'Law Firms & Legal Advisory',
    keywords: ['law', 'legal', 'attorney', 'advocate', 'lawyer', 'barrister', 'notary', 'conveyancing'],
    colorPsychology: { primary: '#1C1917', secondary: '#78350F', accent: '#B45309', mood: 'authoritative, trustworthy, established' },
    typography: { heading: 'Playfair Display', body: 'Source Sans Pro', description: 'Classic serif for tradition and authority' },
    layoutPatterns: ['Practice areas grid', 'Attorney profiles', 'Case results', 'Client testimonials', 'FAQ section'],
    trustSignals: ['LPC registered', 'Years of practice', 'Notable case wins', 'Languages spoken'],
    conversionCTAs: ['Schedule a Consultation', 'Free Legal Assessment', 'Call Our Office', 'Submit Your Case'],
    imageryDirection: 'Professional office settings, legal libraries, scales of justice, formal headshots',
    themeMode: 'dark',
    defaultBg: '#0C0A09',
  },
  {
    id: 'finance',
    name: 'Accounting, Tax & Financial Services',
    keywords: ['accounting', 'tax', 'financial', 'bookkeeping', 'audit', 'payroll', 'invest', 'insurance'],
    colorPsychology: { primary: '#1E3A5F', secondary: '#1E40AF', accent: '#D97706', mood: 'precise, trustworthy, established' },
    typography: { heading: 'Plus Jakarta Sans', body: 'Inter', description: 'Clean modern sans for financial precision' },
    layoutPatterns: ['Service tiers with pricing', 'Calculator tools', 'Client portal login', 'Team credentials', 'Tax season banner'],
    trustSignals: ['SAICA/SAIPA registered', 'SARS eFiling agent', 'Years of experience', 'Client count'],
    conversionCTAs: ['Request a Proposal', 'Schedule Consultation', 'Get a Tax Quote', 'Client Portal'],
    imageryDirection: 'Professional office, financial charts, team meetings, modern workspace',
    themeMode: 'light',
    defaultBg: '#FFFFFF',
  },
  {
    id: 'realestate',
    name: 'Real Estate & Property',
    keywords: ['real estate', 'property', 'estate agent', 'realtor', 'listing', 'broker'],
    colorPsychology: { primary: '#1A365D', secondary: '#2B6CB0', accent: '#D97706', mood: 'professional, trustworthy, premium' },
    typography: { heading: 'DM Sans', body: 'Inter', description: 'Clean geometric sans for modern property presentation' },
    layoutPatterns: ['Property listing grid', 'Virtual tour embed', 'Agent profiles', 'Area guides', 'Mortgage calculator'],
    trustSignals: ['PPRA registered', 'Properties sold count', 'Client testimonials', 'Area expertise'],
    conversionCTAs: ['Schedule a Viewing', 'Get a Valuation', 'List Your Property', 'Search Properties'],
    imageryDirection: 'Property exteriors, staged interiors, aerial drone shots, neighborhood views',
    themeMode: 'light',
    defaultBg: '#FFFFFF',
  },
  {
    id: 'education',
    name: 'Education, Training & Community',
    keywords: ['school', 'academy', 'tutor', 'education', 'training', 'college', 'university', 'course', 'daycare'],
    colorPsychology: { primary: '#1D4ED8', secondary: '#3B82F6', accent: '#F59E0B', mood: 'inspiring, trustworthy, welcoming' },
    typography: { heading: 'Merriweather', body: 'Open Sans', description: 'Classic serif for academic authority' },
    layoutPatterns: ['Course listings', 'Instructor profiles', 'Student testimonials', 'Enrollment form', 'Campus gallery'],
    trustSignals: ['Accreditation', 'Pass rate', 'Student count', 'Alumni network', 'Qualified staff'],
    conversionCTAs: ['Enroll Now', 'View Programs', 'Download Prospectus', 'Book a Tour'],
    imageryDirection: 'Students in learning environments, campus facilities, graduation ceremonies',
    themeMode: 'light',
    defaultBg: '#FFFFFF',
  },
  {
    id: 'beauty',
    name: 'Beauty, Lifestyle & Personal Care',
    keywords: ['beauty', 'salon', 'spa', 'nail', 'hair', 'massage', 'aesthetic', 'tattoo'],
    colorPsychology: { primary: '#DB2777', secondary: '#F472B6', accent: '#A855F7', mood: 'luxurious, elegant, pampering' },
    typography: { heading: 'Cormorant Garamond', body: 'Montserrat', description: 'Elegant serif with clean sans body' },
    layoutPatterns: ['Service menu with pricing', 'Before/after gallery', 'Booking system', 'Staff profiles', 'Product showcase'],
    trustSignals: ['Licensed therapists', 'Premium products', 'Hygiene certified', 'Customer reviews'],
    conversionCTAs: ['Book Appointment', 'View Services', 'Shop Products', 'Buy Gift Voucher'],
    imageryDirection: 'Serene spa environments, close-up beauty shots, product displays, relaxing ambiance',
    themeMode: 'light',
    defaultBg: '#FFF5F7',
  },
  {
    id: 'hospitality',
    name: 'Hotels, Lodges & Accommodation',
    keywords: ['hotel', 'guesthouse', 'lodge', 'bnb', 'accommodation', 'tourism', 'travel', 'safari'],
    colorPsychology: { primary: '#1A365D', secondary: '#D69E2E', accent: '#38A169', mood: 'welcoming, adventurous, premium' },
    typography: { heading: 'Playfair Display', body: 'Lato', description: 'Classic serif for luxury hospitality' },
    layoutPatterns: ['Room gallery with pricing', 'Virtual tour', 'Booking engine', 'Activity listings', 'Guest reviews'],
    trustSignals: ['TGCSA rating', 'TripAdvisor reviews', 'AA Quality assured', 'Awards'],
    conversionCTAs: ['Book Now', 'View Rooms', 'Check Availability', 'Special Offers'],
    imageryDirection: 'Room interiors, amenities, landscapes, happy guests, local attractions',
    themeMode: 'light',
    defaultBg: '#FFFBF5',
  },
  {
    id: 'retail',
    name: 'E-Commerce, Retail & Consumer Goods',
    keywords: ['shop', 'store', 'retail', 'boutique', 'fashion', 'clothing', 'electronics', 'furniture'],
    colorPsychology: { primary: '#2563EB', secondary: '#1D4ED8', accent: '#F59E0B', mood: 'vibrant, trustworthy, modern' },
    typography: { heading: 'Outfit', body: 'Inter', description: 'Modern geometric sans for trendy retail' },
    layoutPatterns: ['Product grid with filters', 'Featured collections', 'New arrivals section', 'Sale banner', 'Size guide'],
    trustSignals: ['Free shipping', 'Easy returns', 'Secure checkout', 'Customer reviews'],
    conversionCTAs: ['Shop Now', 'Add to Cart', 'View Collection', 'Get 10% Off'],
    imageryDirection: 'Product photography, lifestyle shots, flat lays, detail close-ups',
    themeMode: 'light',
    defaultBg: '#FFFFFF',
  },
  {
    id: 'saas',
    name: 'Technology & SaaS',
    keywords: ['software', 'saas', 'tech', 'app', 'platform', 'digital', 'cloud', 'cyber'],
    colorPsychology: { primary: '#6366F1', secondary: '#4F46E5', accent: '#06B6D4', mood: 'innovative, cutting-edge, trustworthy' },
    typography: { heading: 'Sora', body: 'Inter', description: 'Geometric modern sans for tech credibility' },
    layoutPatterns: ['Hero with product demo', 'Feature comparison', 'Pricing tiers', 'Integration showcase', 'Case studies'],
    trustSignals: ['SOC2 compliance', 'Uptime SLA', 'Enterprise clients', 'Free trial'],
    conversionCTAs: ['Start Free Trial', 'Book a Demo', 'View Pricing', 'Talk to Sales'],
    imageryDirection: 'Product screenshots, dashboard views, abstract tech visuals, team collaboration',
    themeMode: 'dark',
    defaultBg: '#0F172A',
  },
  {
    id: 'security',
    name: 'Security Services & Protection',
    keywords: ['security', 'guard', 'surveillance', 'alarm', 'protection', 'patrol', 'armed', 'cctv', 'monitoring'],
    colorPsychology: { primary: '#1E3A5F', secondary: '#1E40AF', accent: '#DC2626', mood: 'authoritative, trustworthy, vigilant' },
    typography: { heading: 'Oswald', body: 'Inter', description: 'Bold condensed headings for security authority' },
    layoutPatterns: ['Service cards with icons', 'Emergency call banner', 'Coverage area map', 'Client testimonials', '24/7 availability badge'],
    trustSignals: ['PSiRA registered', 'Armed response time', 'Years of experience', 'Client count', '24/7 monitoring'],
    conversionCTAs: ['Get a Quote', 'Call Now', 'Request Assessment', 'View Services'],
    imageryDirection: 'Security personnel, surveillance equipment, patrol vehicles, protected properties',
    themeMode: 'dark',
    defaultBg: '#0F172A',
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit, Charity & Humanitarian',
    keywords: ['non-profit', 'nonprofit', 'charity', 'ngo', 'foundation', 'humanitarian', 'mission', 'missions', 'missionary', 'relief', 'donate', 'donation', 'volunteer', 'community service', 'food bank', 'food rescue', 'hunger', 'orphanage', 'shelter', 'outreach', 'ministry', 'church', 'faith-based', 'aid', 'welfare', 'feeding', 'soup kitchen', 'npo', 'pbo'],
    colorPsychology: { primary: '#1E5631', secondary: '#2D6A4F', accent: '#D4A843', mood: 'hopeful, warm, trustworthy, grounded' },
    typography: { heading: 'Merriweather', body: 'Source Sans Pro', description: 'Warm serif for trust and humanity, clean sans for readability' },
    layoutPatterns: ['Impact statistics strip', 'Story-driven hero', 'How it works steps', 'Community kitchen cards', 'Donation CTA', 'Partner logos', 'Volunteer testimonials', 'Financial transparency section'],
    trustSignals: ['NPO registration', 'PBO status', 'Years in operation', 'Meals delivered', 'Financial transparency', 'Section 18A certificate', 'Annual reports available'],
    conversionCTAs: ['Become a Monthly Partner', 'Volunteer Today', 'Donate Now', 'See Our Impact', 'Partner With Us'],
    imageryDirection: 'Real people, community kitchens, food distribution, volunteers in action, warm natural light, authentic moments, no stock photos feel',
    themeMode: 'light',
    defaultBg: '#FFFBF5',
  },
  {
    id: 'general',
    name: 'Modern Business',
    keywords: [],
    colorPsychology: { primary: '#0EA5E9', secondary: '#6366F1', accent: '#F59E0B', mood: 'modern, clean, professional' },
    typography: { heading: 'Plus Jakarta Sans', body: 'Inter', description: 'Clean modern sans-serif for universal appeal' },
    layoutPatterns: ['Hero with CTA', 'Feature cards', 'Testimonials', 'Contact form', 'Social proof'],
    trustSignals: ['Client testimonials', 'Years of experience', 'Certifications', 'Guarantee'],
    conversionCTAs: ['Get a Free Quote', 'Contact Us', 'Learn More', 'Get Started'],
    imageryDirection: 'Professional environments, team photos, product/service shots',
    themeMode: 'light',
    defaultBg: '#FFFFFF',
  },
]

// Smart industry detection
export function detectIndustry(
  businessName: string,
  seoTitle?: string,
  seoDescription?: string,
  services?: Array<{ title: string; description: string }>,
  url?: string,
  industry?: string
): IndustryArchetype {
  const findArchetype = (id: string) =>
    INDUSTRY_ARCHETYPES.find(a => a.id === id) || INDUSTRY_ARCHETYPES.find(a => a.id === 'general')!

  // ── 1. Industry-as-truth ──────────────────────────────────────────────────
  // The lead scraper only produces a closed set of labels. When the form/Excel
  // industry is present it ALWAYS wins — never keyword-guess over it.
  if (industry && industry.trim()) {
    const mappedId = resolveArchetypeFromIndustry(industry)
    if (mappedId) {
      return findArchetype(mappedId)
    }
  }

  // ── 2. Keyword detection (only when industry is blank / unknown) ──────────
  const nameLower = businessName.toLowerCase()
  const titleLower = (seoTitle || '').toLowerCase()
  const descLower = (seoDescription || '').toLowerCase()
  const servicesText = (services || []).map(s => `${s.title} ${s.description}`).join(' ').toLowerCase()
  const urlLower = (url || '').toLowerCase()
  const industryLower = (industry || '').toLowerCase()
  const allText = `${nameLower} ${titleLower} ${descLower} ${servicesText} ${urlLower} ${industryLower}`

  // Short trap-words that appear in normal business copy ("foundations",
  // "commission", "paid"). Require a word-boundary match for these.
  const TRAP_KEYWORDS = new Set(['foundation', 'aid', 'mission', 'relief', 'outreach', 'welfare', 'feeding'])
  const wordHit = (text: string, keyword: string) => {
    if (TRAP_KEYWORDS.has(keyword)) {
      const re = new RegExp(`\\b${keyword}(s)?\\b`, 'i')
      return re.test(text)
    }
    return text.includes(keyword)
  }

  const scores: Array<{ archetype: IndustryArchetype; score: number }> = []

  for (const archetype of INDUSTRY_ARCHETYPES) {
    if (archetype.id === 'general') continue
    if (archetype.id === 'nonprofit') {
      // Nonprofit needs stronger signals than a single incidental word
      const strong = ['non-profit', 'nonprofit', 'charity', 'ngo', 'npo', 'pbo', 'donate', 'donation', 'volunteer', 'food bank', 'orphanage', 'soup kitchen', 'ministry', 'church']
      const strongHits = strong.filter(k => allText.includes(k)).length
      if (strongHits >= 2) scores.push({ archetype, score: strongHits * 5 })
      continue
    }

    let score = 0
    for (const keyword of archetype.keywords) {
      const keywordLower = keyword.toLowerCase()
      if (wordHit(nameLower, keywordLower)) score += 10
      if (wordHit(titleLower, keywordLower)) score += 5
      if (wordHit(urlLower, keywordLower)) score += 3
      if (wordHit(servicesText, keywordLower)) score += 3
      if (wordHit(descLower, keywordLower)) score += 2
      if (wordHit(allText, keywordLower) && score === 0) score += 1
    }
    if (score > 0) scores.push({ archetype, score })
  }

  scores.sort((a, b) => b.score - a.score)

  if (scores.length > 0 && scores[0].score >= 3) {
    return scores[0].archetype
  }

  return INDUSTRY_ARCHETYPES.find(a => a.id === 'general')!
}

// ============================================
// Brand Voice & Narrative Arc
// ============================================

function generateBrandVoice(siteConfig: MasterSiteConfig, archetype: IndustryArchetype): string {
  const { businessName, services, testimonials, gallery, city } = siteConfig
  const serviceCount = services?.length || 0
  const testimonialCount = testimonials?.length || 0
  const hasGallery = (gallery && gallery.length > 0) || (siteConfig.pageMediaMap && siteConfig.pageMediaMap.length > 0)

  // Generate positioning statement
  const positioning = `POSITIONING STATEMENT:
"${businessName}" is the trusted ${archetype.name.toLowerCase()} partner for ${city || 'local'} clients who demand quality, reliability, and personal service.
Every section of this website must reinforce this positioning — from the hero's emotional hook to the final CTA.`

  // Generate brand voice rules based on archetype
  const voiceRules: Record<string, string> = {
    'medical': 'Warm, reassuring, professional. Use "we" and "our" to build trust. Focus on care, comfort, and expertise.',
    'legal': 'Authoritative, clear, confident. Use direct language. Focus on results, experience, and client outcomes.',
    'trades': 'Straightforward, honest, reliable. Use action words. Focus on speed, quality, and fair pricing.',
    'hospitality': 'Warm, inviting, sensory. Use descriptive language. Focus on experiences, ambiance, and personal touches.',
    'retail': 'Energetic, aspirational, accessible. Use benefit-driven language. Focus on quality, value, and style.',
    'photography': 'Artistic, personal, emotive. Use storytelling language. Focus on moments, memories, and creative vision.',
    'security': 'Authoritative, trustworthy, vigilant. Use confident language. Focus on protection, reliability, and response time.',
    'realestate': 'Aspirational, knowledgeable, approachable. Use lifestyle language. Focus on location, value, and dreams.',
    'education': 'Inspiring, supportive, credible. Use empowering language. Focus on growth, outcomes, and community.',
    'fitness': 'Energetic, motivating, inclusive. Use action language. Focus on transformation, community, and results.',
    'beauty': 'Elegant, sensory, personal. Use indulgent language. Focus on self-care, expertise, and pampering.',
    'automotive': 'Knowledgeable, trustworthy, passionate. Use technical language where appropriate. Focus on quality, reliability, and expertise.',
    'general': 'Professional, friendly, trustworthy. Use clear language. Focus on quality, service, and value.',
  }

  const voice = voiceRules[archetype.id] || voiceRules['general']

  // Generate narrative arc based on available data
  const arcSections: string[] = []
  arcSections.push('Hero → Emotional hook that captures attention')
  if (serviceCount > 0) arcSections.push('Services → Value proposition and expertise')
  if (hasGallery) arcSections.push('Gallery → Visual proof of quality')
  if (testimonialCount > 0) arcSections.push('Testimonials → Social proof from real clients')
  arcSections.push('About → Trust-building story')
  arcSections.push('Contact → Frictionless next step')

  return `
==================================================
BRAND VOICE & NARRATIVE ARC
==================================================

${positioning}

BRAND VOICE: ${voice}

THE CONVERSION NARRATIVE:
${arcSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Each section must naturally lead to the next. The visitor should feel:
"I need this" → "I trust this" → "I'm booking now"

MICRO-COPY GUIDELINES:
- Button text: Action-oriented, specific (NOT "Click Here" or "Submit")
  - Good: "Get Your Free Quote", "Book a Consultation", "View Our Work"
  - Bad: "Learn More", "Click Here", "Submit"
- Form labels: Clear, friendly
  - Good: "Your Name", "How Can We Help?"
  - Bad: "Name", "Message"
- Empty states: Helpful, not broken
  - Good: "No reviews yet — be the first to share your experience"
  - Bad: "No data available"
- Loading states: Branded, not generic
  - Good: "Preparing your experience..."
  - Bad: "Loading..."
`
}

// ============================================
// Dynamic Section Ordering
// ============================================

function buildDynamicSectionOrder(siteConfig: MasterSiteConfig, designSeed: DesignSeed): string {
  const { services, testimonials, faq, gallery, pageMediaMap, team } = siteConfig
  const sections: string[] = []

  // Always include Hero
  sections.push('Hero')

  // Conditionally include sections based on data availability
  const hasServices = services && services.length > 0
  const hasTestimonials = testimonials && testimonials.length > 0
  const hasFaq = faq && faq.length > 0
  const hasGallery = (gallery && gallery.length > 0) || (pageMediaMap && pageMediaMap.length > 0)
  const hasTeam = team && team.length > 0

  // Use design seed section order as base, but filter out empty sections
  const seedOrder = designSeed.sectionOrder
  const sectionNames = ['Hero', 'Services', 'Gallery', 'Testimonials', 'FAQ', 'About', 'Team', 'Contact']

  for (const idx of seedOrder) {
    const name = sectionNames[idx]
    if (name === 'Hero' || name === 'Contact') continue // Already handled

    // Skip sections with no data
    if (name === 'Services' && !hasServices) continue
    if (name === 'Gallery' && !hasGallery) continue
    if (name === 'Testimonials' && !hasTestimonials) continue
    if (name === 'FAQ' && !hasFaq) continue
    if (name === 'Team' && !hasTeam) continue

    sections.push(name)
  }

  // Always include Contact at the end
  sections.push('Contact')

  return sections.join(' → ')
}

// ============================================
// Main Prompt Generator
// ============================================
export function generateMiMoPrompt(options: PromptBuilderOptions): string {
  const { buildMode, siteConfig: rawSiteConfig, websitesFolder = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites' } = options

  // PHASE 9 ENHANCEMENT: GAP 28 - Pre-Prompt Data Validation
  console.log('🔍 Validating site configuration...')
  const validationResult = validatePromptData(rawSiteConfig)
  console.log(generateValidationReport(validationResult))

  // Block if critical errors
  if (!validationResult.isValid) {
    const criticalErrors = validationResult.errors.filter(e => e.severity === 'critical')
    throw new Error(
      `Cannot generate prompt: ${criticalErrors.length} critical validation error(s). ` +
      `Fix these fields: ${criticalErrors.map(e => e.field).join(', ')}`
    )
  }

  // Apply smart fallbacks for missing non-critical data
  const siteConfig = applyPromptFallbacks(rawSiteConfig)
  const { businessName, seo, services, gallery, theme, legacyUrls, contact, pageMediaMap, features, geo, testimonials, faq, socialLinks, team, businessHours } = siteConfig

  // 1. Detect Industry
  const providedIndustry = (siteConfig as any).industry || ''
  let archetype: IndustryArchetype

  if (providedIndustry) {
    // Closed-map truth first, then name/keyword fallback for unknown labels
    const mappedId = resolveArchetypeFromIndustry(providedIndustry)
    archetype = mappedId
      ? (INDUSTRY_ARCHETYPES.find(a => a.id === mappedId) || INDUSTRY_ARCHETYPES.find(a => a.id === 'general')!)
      : detectIndustry(businessName, seo?.title, seo?.description, services, legacyUrls?.discovered?.[0], providedIndustry)
  } else {
    archetype = detectIndustry(
      businessName,
      seo?.title,
      seo?.description,
      services,
      legacyUrls?.discovered?.[0]
    )
  }

  // 2. Generate Design Seed (archetype-aware)
  const constraintKey = getArchetypeConstraintKey(archetype.id)
  const designSeed = generateDesignSeed(businessName, constraintKey)
  
  // 2.5. Get Industry Template
  const industryTemplate = getIndustryTemplate(archetype.id)
  const industryStyle = industryTemplate ? getIndustryStyle(industryTemplate, designSeed.id.charCodeAt(0)) : null
  const industryColorPalette = industryTemplate ? getIndustryColorPalette(industryTemplate, designSeed.id.charCodeAt(1), (designSeed.id.charCodeAt(3) % 30) - 15) : null
  // Select typography that matches the design seed's typographyPairing
  const industryTypography = industryTemplate
    ? industryTemplate.typographyOptions.find(t => {
        const pairing = designSeed.typographyPairing || ''
        if (pairing === 'editorial-serif' && t.id.includes('serif')) return true
        if (pairing === 'modern-sans' && (t.id.includes('modern') || t.id.includes('sans'))) return true
        if (pairing === 'elegant-mix' && (t.id.includes('elegant') || t.id.includes('refined') || t.id.includes('luxurious'))) return true
        if (pairing === 'friendly-rounded' && (t.id.includes('friendly') || t.id.includes('warm'))) return true
        if (pairing === 'bold-condensed' && (t.id.includes('bold') || t.id.includes('strong'))) return true
        if (pairing === 'technical-mono' && (t.id.includes('tech') || t.id.includes('mono'))) return true
        return false
      }) || getIndustryTypography(industryTemplate, designSeed.id.charCodeAt(2))
    : null
  const industryComponents = industryTemplate ? getIndustryComponents(industryTemplate) : null
  const industryTrustSignals = industryTemplate ? getIndustryTrustSignals(industryTemplate) : []
  const industryConversionCTAs = industryTemplate ? getIndustryConversionCTAs(industryTemplate) : []
  const industryImageryDirection = industryTemplate ? getIndustryImageryDirection(industryTemplate) : ''
  const industryAnimationGuidance = industryTemplate ? getIndustryAnimationGuidance(industryTemplate) : ''
  const industrySpacingGuidance = industryTemplate ? getIndustrySpacingGuidance(industryTemplate) : ''
  
  // OVERRIDE: Industry archetype rules override design seed defaults
  // Professional/Corporate archetypes force subtle card geometry
  const professionalArchetypes = ['medical', 'legal', 'finance', 'realestate', 'trades', 'corporate', 'security']
  const isProfessional = professionalArchetypes.includes(archetype.id)
  
  // Creative/Youth/Tech archetypes allow experimental geometry
  const creativeArchetypes = ['photography', 'saas', 'beauty', 'education', 'fitness']
  const isCreative = creativeArchetypes.includes(archetype.id)
  
  // Override card geometry if contradiction exists
  let effectiveDesignSeed = { ...designSeed }
  if (isProfessional && designSeed.cardGeometry === 'pill') {
    effectiveDesignSeed.cardGeometry = 'rounded' // Force subtle for professional
  }
  
  const designSeedInstructions = getDesignSeedInstructions(effectiveDesignSeed)

  // 3. Generate Creative Brief
  const creativeBrief = generateCreativeBrief({
    businessName,
    industry: archetype.name,
    city: siteConfig.city,
    ownerName: siteConfig.ownerName,
    services: services || [],
    archetype,
    siteConfig,
    designSeed: {
      artDirection: designSeed.artDirection,
      layoutStyle: designSeed.layoutStyle,
      typographyPairing: designSeed.typographyPairing,
      motionIntensity: designSeed.motionIntensity,
      colorIntensity: designSeed.colorIntensity,
      decorativeIntensity: designSeed.decorativeIntensity,
      spacingScale: designSeed.spacingScale,
    },
  })

  // 4. Build color system
  const finalBg = archetype.defaultBg || theme?.palette?.bg || '#FFFFFF'
  const isDarkMode = archetype.themeMode === 'dark'

  // 5. Build navigation
  const navigation = buildNavigationRoutes(siteConfig)

  // 6. Build feature instructions
  const featureInstructions = buildFeatureInstructions(features || getDefaultFeatures(), siteConfig)

  // 7. Build gallery instructions
  const galleryInstructions = buildGalleryInstructions(siteConfig)

  // 8. Build mode directive
  const clientFolder = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const clientPath = `${websitesFolder}\\${clientFolder}`

  const buildModeDirective = `
WORKING DIRECTORY: ${clientPath}
CRITICAL: You are ALREADY in the correct directory. Do NOT search for the project in other locations.
All files (package.json, app/, components/, public/, etc.) are in THIS directory.
Read files using relative paths (e.g., "app/page.tsx", "components/Hero.tsx").
Do NOT use ".." or search parent directories.

BUILD MODE: UNIFIED (all images downloaded locally)
- Output directory: ${clientPath}
- All images are downloaded to public/uploads/ and served locally
- Image paths in site-config.json and image-map.json use local paths (e.g., /uploads/business-name/category/img.webp)
- Stock images from Unsplash are also downloaded locally by the post-build cleanup
- Create a complete, functional Next.js project that renders immediately
- Use standard <img> tags for local images (no need for Next.js Image optimization)`

  // 8. Phone normalization
  const normalizedWhatsapp = normalizePhoneNumber(contact?.whatsapp || '0834799732')
  const normalizedPhone = normalizePhoneNumber(contact?.phone || '0834799732')

  // 9. Generate brand voice and dynamic section order
  const brandVoice = generateBrandVoice(siteConfig, archetype)
  const dynamicSectionOrder = buildDynamicSectionOrder(siteConfig, effectiveDesignSeed)

  // 10. Build the mega prompt with creative brief
  return `==================================================
WORKING DIRECTORY (READ THIS FIRST)
==================================================
WORKING DIRECTORY: ${clientPath}
CRITICAL: You are ALREADY in the correct directory. Do NOT search for the project in other locations.
All files (package.json, app/, components/, public/, etc.) are in THIS directory.
Read files using relative paths (e.g., "app/page.tsx", "components/Hero.tsx").
Do NOT use ".." or search parent directories.
Do NOT glob from parent directories. Stay in THIS directory.

${creativeBrief}

${brandVoice}

SECTION ORDER (data-aware): ${dynamicSectionOrder}
- Only include sections that have data. Skip empty sections.
- Hero is always first. Contact is always last.
- The order above is a suggestion — adjust for narrative flow.

==================================================
CRITICAL RULES (MUST FOLLOW - BUILD WILL FAIL IF IGNORED)
==================================================

WARNING: These rules are MANDATORY. Ignoring them will cause build failures and waste AI tokens.

=== RULE 0: STATS CONSISTENCY + MAPS URL + CONTRAST + GRID (CRITICAL) ===

STATS — all numbers must be identical on every page:
- Write stats ONLY to site-config.json as an array: "stats": [{"value":"15+","label":"Years Serving"}, ...]
- Use 3-4 stats consistent with the business story. NEVER invent different numbers on different pages.
- Do NOT hardcode fallbacks like "500+" or "1000+". If no stats, hide the section.
- Format values cleanly: "15+" not "15+ ", "Under 1 hour" not "374min".

MAPS URL — the map MUST render:
- Store the iframe-safe embed form in site-config.json as "mapEmbedUrl".
- If no maps URL, show address + Get Directions link instead of an empty map box.

CONTRAST (WCAG AA):
- Small text (eyebrows, labels, links) must use --safe-eyebrow (amber-700) NOT --color-accent.
- CTA buttons: white text on --color-primary-cta (deepened orange). Never bright accent on light bg for text.

HOURS:
- When opens === closes (e.g. "Emergency only"), show the value ONCE. Never "Emergency only · Emergency only".

GALLERY GRID:
- Use centered flex-wrap or balanced grid. No single orphan tile in the last row.

ABOUT / BODY COPY:
- Left-align multi-line paragraphs. Add hierarchy (subheads, pull-quotes). Never a wall of centred text.

HERO MOBILE:
- Avoid dead empty bands. Use min-h-[80vh] on mobile rather than full screen when content is short.

PAGE COMPOSITION — each page must have a distinct purpose:
- Home: hero, services, portfolio, testimonials, CTA, contact
- About: hero, story, team/owner, stats, values, CTA — NOT a copy of home
- Services: hero, all services, process optional, FAQ, CTA — NOT a copy of home
- Contact: hero, form, details, map, short FAQ — NOT a copy of home
Do NOT repeat the same section stack on every page.

=== RULE 1: FRAMER MOTION SSR SAFETY (CRITICAL — #1 BUILD KILLER) ===

framer-motion components are client components ("use client") and render fine in the App Router.

THIS IS NON-NEGOTIABLE. Follow this EXACT pattern:

RULE 1A — Use STATIC imports for all section components. Do NOT use dynamic(() => import(...), { ssr: false }).
    ssr:false causes BAILOUT_TO_CLIENT_SIDE_RENDERING and blank pages if a chunk fails to load.

In app/page.tsx use this EXACT pattern:

    'use client'

    import Header from '@/components/Header'
    import Footer from '@/components/Footer'
    import WhatsAppWidget from '@/components/WhatsAppWidget'
    import ScrollToTop from '@/components/ScrollToTop'
    import SectionRenderer from '@/components/SectionRenderer'
    import FeatureHost from '@/components/features/FeatureHost'
    import WhatsAppGate from '@/components/WhatsAppGate'

    export default function Home() {
      return (
        <>
          <FeatureHost placement="top-banner" />
          <Header />
          <FeatureHost placement="header" />
          <main>
            <SectionRenderer />
            <FeatureHost placement="inline" />
          </main>
          <Footer />
          <FeatureHost placement="footer" />
          <FeatureHost placement="floating" />
          <FeatureHost placement="modal" />
          <WhatsAppGate><WhatsAppWidget /></WhatsAppGate>
          <ScrollToTop />
        </>
      )
    }

RULE 1B — Every component that uses framer-motion MUST also have "use client" as line 1:

    'use client'
    import { motion } from 'framer-motion'
    // ... component code

RULE 1C — NEVER use dynamic(..., { ssr: false }) in page files.
    BAD:  const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
    GOOD: import Hero from '@/components/Hero'

RULE 1D — app/page.tsx MUST use the static-import pattern in Rule 1A. Boilerplate already has a correct starting file — prefer keeping it.

RULE 1E — Sub-pages (about, services, portfolio, contact) MUST also use static imports:

    import type { Metadata } from 'next'
    import Header from '@/components/Header'
    import Footer from '@/components/Footer'
    import WhatsAppWidget from '@/components/WhatsAppWidget'
    import ScrollToTop from '@/components/ScrollToTop'
    import PageHero from '@/components/PageHero'
    import PageContent from './view'

    export const metadata: Metadata = { ... }

    export default function AboutPage() {
      return (
        <>
          <Header />
          <main className="pt-20"><PageContent /></main>
          <Footer />
          <WhatsAppWidget />
          <ScrollToTop />
        </>
      )
    }

=== RULE 2: NEVER import from next/document (CRITICAL — #2 BUILD KILLER) ===

NEVER import Html, Head, Main, NextScript from 'next/document'.
These ONLY work in pages/_document.tsx which we DO NOT USE (App Router).
The layout.tsx already handles the <html> and <body> structure.

NEVER create a custom _document.tsx or _document.js.
NEVER use <Html> tag in any component — the layout.tsx provides it.

=== RULE 3: NO ERROR PAGES (MANDATORY) ===

Do NOT create any of these files:
- app/error.tsx, app/404.tsx, app/500.tsx, app/not-found.tsx
- pages/_error.tsx, pages/404.tsx, pages/500.tsx
- Any file that imports from 'next/document'

Next.js handles error pages automatically. Creating them causes build failures.

=== RULE 4: APP ROUTER ONLY ===

- All pages go in app/ directory (NOT pages/)
- Use app/page.tsx, app/about/page.tsx, etc.
- Use layout.tsx for shared layout (already created)

=== RULE 5: DASHBOARD PAGE (ALREADY CREATED — DO NOT MODIFY) ===

app/dashboard/page.tsx is ALREADY generated by the boilerplate with the correct client-side redirect.
Do NOT create or modify app/dashboard/page.tsx — it already exists and works correctly.
The dashboard HTML files are in public/dashboard/ — do NOT modify those either.

=== RULE 6: IMAGES — STOCK IMAGES FOR CLEAN BUILDS (MANDATORY) ===

When there are NO scraped images (image-map.json has 0 totalImages or empty categories),
you MUST use stock images from Unsplash. NEVER use gradient placeholders or colored boxes.

HERO IMAGE — Replace the gradient background with a real image:
    <div className="absolute inset-0 bg-cover bg-center"
         style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80)' }} />
    <div className="absolute inset-0 bg-black/50" />

GALLERY IMAGES — Use <img> tags with Unsplash URLs, NOT gradient divs:
    {items.map(item => (
      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
    ))}

FOUNDER/PORTRAIT — Use a relevant stock photo:
    <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
         alt="Founder portrait" className="w-full h-full object-cover" />

SUB-PAGE HEADERS — Use background images instead of plain gradients:
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: 'url(https://images.unsplash.com/...)' }} />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="relative max-w-4xl mx-auto px-4">...</div>
    </section>

Pick Unsplash images that match the industry archetype (bakery → cakes/food, medical → clinic, etc.)
The next.config.js already has unoptimized: true and remotePatterns: ** so external URLs work.

=== RULE 8: API ROUTES (ALREADY CREATED — DO NOT MODIFY) ===

The following API routes are ALREADY generated and tested. Do NOT create or modify them:
- app/api/site-data/route.ts — single source of truth (force-dynamic, Cache-Control: no-store)
- app/api/blob-urls/route.ts — legacy blob URL endpoint (also force-dynamic)
- app/api/save-config/route.ts — auth-protected config save to Vercel Blob
- app/api/upload/route.ts — auth-protected image upload to Vercel Blob
- app/api/contact/route.ts — contact form → Resend email delivery
- app/api/auth/[...nextauth]/route.ts — NextAuth handler
NEVER create app/api/debug/** — it leaks secrets.

=== RULE 9: COMPONENTS MUST FETCH DATA AT RUNTIME (CRITICAL — DASHBOARD WILL NOT WORK WITHOUT THIS) ===

lib/use-site-data.ts is ALREADY generated. Do NOT create or modify it.
It exports useSiteData() which fetches /api/site-data at runtime (shared in-flight request,
no-store, cache-busted). Falls back to /site-config.json + /image-map.json if the API fails.

lib/blob-storage.ts is ALSO already generated. Do NOT create or modify it.
Dashboard saves go through it (Vercel Blob in production, filesystem locally).

components/AnimateOnScroll.tsx is ALSO already generated. Do NOT create or modify it.
It exports AnimateOnScroll and useScrollAnimation.

The dashboard saves changes through /api/save-config to Blob (or public/*.json locally).
For those changes to appear on the actual website, components MUST fetch at runtime via useSiteData().
NEVER hardcode services, testimonials, gallery images, or other data in components.

Import and use the pre-built hook in components:

    'use client'
    import { useSiteData } from '@/lib/use-site-data'

    export default function Services() {
      const { config } = useSiteData()
      const services = config?.services || fallbackServices

      return (
        <section>
          {services.map(service => (
            <div key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </section>
      )
    }

For the Gallery, fetch from image-map.json:

    'use client'
    import { useSiteData } from '@/lib/use-site-data'

    export default function Gallery() {
      const { imageMap } = useSiteData()
      const categories = imageMap?.categories || {}
      // render gallery from categories data
    }

This ensures that when the dashboard saves changes to site-config.json,
the website immediately reflects those changes on next page load.

=== RULE 10: ZERO HARDCODED COPYWRITING (CRITICAL — DASHBOARD WILL BE EMPTY WITHOUT THIS) ===

EVERY piece of text on the website MUST come from site-config.json. This includes:
- Hero: headline, subheadline, badge, CTA text
- About: title, tagline, all paragraphs
- Gallery/Portfolio: section heading and description
- Services: section heading and description
- Testimonials: section heading and subtitle
- FAQ: section heading and subtitle
- Contact: page title and description
- Business hours: all days and times

NEVER write hardcoded strings like:
    BAD:  <h2>Our Work</h2>
    GOOD: <h2>{config?.pageContent?.galleryTitle || 'Our Work'}</h2>

    BAD:  <p>Browse our gallery of handcrafted creations</p>
    GOOD: <p>{config?.pageContent?.gallerySubtitle || 'Browse our gallery'}</p>

The fallback text (after ||) is only for the initial render before the config loads.
The actual text MUST come from site-config.json so the dashboard can edit it.

When you CREATE public/site-config.json, you MUST populate ALL fields:
- hero.headline, hero.subheadline, hero.badge, hero.ctaText, hero.heroImageUrl
- about.title, about.tagline, about.paragraph1, about.paragraph2, about.paragraph3
- pageContent.servicesTitle, pageContent.galleryTitle, pageContent.testimonialsTitle,
  pageContent.faqTitle, pageContent.contactTitle, pageContent.portfolioTitle,
  and ALL their descriptions/subtitles
- businessHours with all 7 days

=== SUMMARY OF NON-COMPLIANCE CONSEQUENCES ===

If you violate ANY of these rules:
- Rule 1 violation → "Cannot read properties of null (reading 'useContext')" on EVERY page
- Rule 2 violation → "<Html> should not be imported outside of pages/_document" error
- Rule 3 violation → Build crashes during static generation of error pages
- Rule 5 violation → Dashboard page fails to prerender (already handled by boilerplate)
- Rule 6 violation → Website looks broken with empty gradient placeholders
- Rule 8 violation → Dashboard saves don't persist to server
- Rule 9 violation → Dashboard changes don't appear on the actual website
- Rule 10 violation → Dashboard shows blank fields, client cannot edit any text

These errors repeat on EVERY page and the build will fail completely. Follow the patterns exactly.

==================================================
TECHNICAL IMPLEMENTATION GUIDE
==================================================

You are a Principal Frontend Engineer and Lead UI/UX Architect with 15 years of experience 
building award-winning websites. Build a CUSTOM, PRODUCTION-READY Next.js 14 (App Router) 
web application for "${businessName}" that is indistinguishable from a $10,000 custom design.

OUTPUT DIRECTORY: ${clientPath}
Create the complete project structure in this directory.

==================================================
1. DESIGN SYSTEM & BRAND IDENTITY
==================================================

ARCHETYPE: ${archetype.name}
DESIGN STYLE: ${industryStyle?.name || 'Modern'}
DESIGN MOOD: ${industryColorPalette?.mood || archetype.colorPsychology.mood}


${buildTypographySection(
  industryTypography?.heading || archetype.typography.heading,
  industryTypography?.body || archetype.typography.body
)}

COLOR PALETTE (${industryColorPalette?.name || 'Default'}):
- Primary: ${industryColorPalette?.primary || theme?.palette?.primary || '#0ea5e9'} (buttons, CTAs, active states)
- Secondary: ${industryColorPalette?.secondary || theme?.palette?.secondary || '#6366f1'} (accents, hover states)
- Accent: ${industryColorPalette?.accent || theme?.palette?.accent || '#f59e0b'} (highlights, badges)
- Background: ${industryColorPalette?.bg || finalBg} (page background)
- Text: ${industryColorPalette?.text || (isDarkMode ? '#f5f5f5' : '#1a1a1a')} (body text)
- Muted: ${isDarkMode ? '#9ca3af' : '#6b7280'} (secondary text)

CSS CUSTOM PROPERTIES:
:root {
  --color-primary: ${industryColorPalette?.primary || theme?.palette?.primary || '#0ea5e9'};
  --color-secondary: ${industryColorPalette?.secondary || theme?.palette?.secondary || '#6366f1'};
  --color-accent: ${industryColorPalette?.accent || theme?.palette?.accent || '#f59e0b'};
  --color-bg: ${industryColorPalette?.bg || finalBg};
  --color-text: ${industryColorPalette?.text || (isDarkMode ? '#f5f5f5' : '#1a1a1a')};
  --color-muted: ${isDarkMode ? '#9ca3af' : '#6b7280'};
  --font-heading: ${industryTypography?.heading || archetype.typography.heading}, serif;
  --font-body: ${industryTypography?.body || archetype.typography.body}, sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
}

${isDarkMode ? `DARK MODE DESIGN:
- Page background: ${industryColorPalette?.bg || finalBg}
- Card surfaces: bg-white/5 with border-white/10 and backdrop-blur
- Text: White/light gray for contrast
- Shadows: Subtle ambient glow instead of drop shadows
- Images: May need subtle dark overlay for text readability` : `LIGHT MODE DESIGN:
- Page background: ${industryColorPalette?.bg || finalBg}
- Card surfaces: bg-white with subtle shadows
- Text: Dark gray for readability
- Borders: Light gray borders for definition
- Shadows: Soft elevation for depth`}

==================================================
2. DESIGN SEED - UNIQUE VISUAL FINGERPRINT
==================================================
${designSeedInstructions}

CRITICAL: This design seed ensures "${businessName}" has a UNIQUE layout different from any other website. Follow the seed specifications exactly.

==================================================
3. MEDIA & DEPLOYMENT
==================================================
${buildModeDirective}

==================================================
4. NAVIGATION & HEADER
==================================================
Site Structure:
${navigation}

HEADER DESIGN (${designSeed.headerStyle} style):
- Sticky header with backdrop-blur on scroll
- Logo (from brandAssets.logoUrl) on left, navigation on right
- Desktop: full navigation links with hover underline animation
- Mobile: hamburger menu with slide-in drawer
- Include phone number and WhatsApp button

WCAG CONTRAST GUARD (MANDATORY):
When header is transparent over hero image:
- MUST include dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- MUST include backdrop-blur-md for depth
- OR use top gradient overlay: bg-gradient-to-b from-black/70 to-transparent
- All navigation text must have minimum 4.5:1 contrast ratio
- Logo must be clearly visible against any hero image
- On scroll, header transitions to solid background

==================================================
5. HERO SECTION (ACTUAL CONTENT FROM WEBSITE)
==================================================
- Full viewport height (100vh) with hero image as background
- Headline: "${siteConfig.hero?.headline || 'Premium Services in ' + siteConfig.city}"
- Subheadline: "${siteConfig.hero?.subheadline || ''}"
- Badge: "${siteConfig.hero?.badge || ''}"
- Primary CTA: "${siteConfig.hero?.ctaText || 'Get a Free Quote'}"
- Secondary CTA: WhatsApp button
- Dark gradient overlay for text readability
- Parallax scroll effect
- Animate headline with Framer Motion
- Text must be white with sufficient contrast

HERO IMAGE FALLBACK (MANDATORY):
${siteConfig.hero?.heroImageUrl ? `- Use this hero image: ${siteConfig.hero.heroImageUrl}` : `- No hero image was scraped. Use a stock image from Unsplash that matches the ${archetype.name} industry.
${getIndustryStockImageHints(archetype.id)}
- Use as background-image with a dark overlay for text readability:
  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(...)' }} />
  <div className="absolute inset-0 bg-black/50" />
- NEVER use a plain gradient as the hero background`}

WCAG CONTRAST GUARD (MANDATORY):
When header is transparent over hero image:
- MUST include dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- MUST include backdrop-blur-md for depth
- All navigation text must have minimum 4.5:1 contrast ratio
- On scroll, header transitions to solid background

==================================================
6. CONTENT SECTIONS (REAL DATA FROM WEBSITE)
==================================================

${services && services.length > 0 ? buildServiceInstructions(services, archetype) : `
SERVICES:
- Generate relevant services for ${archetype.name} industry
- Use ${archetype.conversionCTAs[0] || 'Get a Quote'} as primary CTA
`}

${galleryInstructions}

${featureInstructions}

${geo?.serviceAreas?.length ? `GEO & LOCAL SEO:
Service Areas: ${geo.serviceAreas.join(', ')}
- Create /service-areas page
- Include areaServed in JSON-LD
- Use local keywords in content
- Google Maps with service radius` : ''}

${testimonials?.length ? `TESTIMONIALS:
${testimonials.map((t, i) => `${i + 1}. "${t.text}" - ${t.name}${t.rating ? ` (${t.rating}/5)` : ''}`).join('\n')}` : ''}

${faq?.length ? `FAQ:
${faq.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join('\n')}` : ''}

${(siteConfig as any).team?.length ? `
TEAM / DOCTORS:
${(siteConfig as any).team.map((t: any) => `- ${t.name} (${t.role})${t.bio ? ': ' + t.bio : ''}`).join('\n')}` : ''}

${(siteConfig as any).motto ? `\nMOTTO / TAGLINE: "${(siteConfig as any).motto}"\nUse this as a prominent tagline on the website.` : ''}

${(siteConfig as any).history ? `\nHISTORY / ABOUT:\n${(siteConfig as any).history}` : ''}

${(siteConfig as any).specializations?.length ? `\nSPECIALIZATIONS:\n${(siteConfig as any).specializations.map((s: string) => `- ${s}`).join('\n')}` : ''}

${siteConfig.socialLinks ? `
SOCIAL MEDIA LINKS (from original website):
${siteConfig.socialLinks.facebook ? `- Facebook: ${siteConfig.socialLinks.facebook}` : ''}
${siteConfig.socialLinks.instagram ? `- Instagram: ${siteConfig.socialLinks.instagram}` : ''}
${siteConfig.socialLinks.twitter ? `- Twitter: ${siteConfig.socialLinks.twitter}` : ''}
${siteConfig.socialLinks.pinterest ? `- Pinterest: ${siteConfig.socialLinks.pinterest}` : ''}
${siteConfig.socialLinks.youtube ? `- YouTube: ${siteConfig.socialLinks.youtube}` : ''}
Include these in the footer and optionally in the header.` : ''}

${(siteConfig as any).pricing?.length ? `
PRICING TABLE (from website):
${(siteConfig as any).pricing.map((p: any) => `- ${p.service}: ${p.price}${p.details ? ' - ' + p.details : ''}`).join('\n')}
Create a dedicated pricing section with these prices displayed prominently.
ALSO create a separate pricing page at app/pricing/page.tsx with full pricing details and packages.` : ''}

${(siteConfig as any).blogPosts?.length ? `
BLOG POSTS (from website):
${(siteConfig as any).blogPosts.slice(0, 5).map((b: any) => `- ${b.title} (${b.url})`).join('\n')}
Create a blog section with these posts. Each should link to the original or a new page.
ALSO create a separate blog page at app/blog/page.tsx listing all blog posts.` : ''}

${(siteConfig as any).portfolioCategories?.length ? `
${industryComponents?.exclude?.includes('Gallery') ? 
`MEDIA/IMAGES SECTION (NOT a traditional gallery):
This industry does not use photo galleries. Instead, create a "Proof / Certifications" or "Our Work" section.
- Display images as evidence of work, certifications, or equipment
- Use a grid layout but NOT a lightbox or fancy gallery
- Focus on trust-building imagery, not artistic presentation
- Do NOT create category cards or folder-style navigation
- Simply display images in a clean grid with captions` :
`PORTFOLIO CATEGORIES (from original website navigation):
${(siteConfig as any).portfolioCategories.map((c: any) => `- ${c.name}: ${c.url}${c.imageUrl ? ' (preview: ' + c.imageUrl + ')' : ''}`).join('\n')}

CRITICAL: Use image-map.json for gallery structure. The image-map.json file contains:
- Categories with their images (in original order)
- Each category should be a separate gallery folder/card
- When user clicks a category card, show all images from that category
- Images must be displayed in the EXACT order from image-map.json
- Do NOT mix all images into one flat gallery

Read image-map.json and create a gallery with category cards. Each card shows:
- Category name
- Preview image (first image from category)
- Click to open → shows all images from that category in order
- Do NOT show all images underneath the category cards - ONLY show the cards

IMPORTANT: If there are NO gallery categories (empty categories in image-map.json), 
then show ALL images in a flat gallery without category folders.`}` : ''}

==================================================
7. CONTACT SECTION
==================================================
- Split layout: Contact form on left, info on right
- Phone: ${normalizedPhone} (click-to-call)
${(siteConfig as any).hasWhatsApp === false ? `- IMPORTANT: This business does NOT have WhatsApp. Do NOT include WhatsApp widget or buttons.
- Instead, emphasize phone calls and email contact.` : `- WhatsApp: ${normalizedWhatsapp} (click-to-chat)`}
- Email: ${contact?.email || 'info@domain.com'}
${(siteConfig as any).locations?.length > 1 ? `
MULTIPLE LOCATIONS:
${(siteConfig as any).locations.map((loc: any) => `- ${loc.name}: ${loc.address}${loc.phone ? ` (${loc.phone})` : ''}`).join('\n')}
- Display both locations with a map showing service area` : `- Address: ${contact?.address || siteConfig.city}`}
- Business hours display
- Embedded Google Maps

==================================================
8. SEO & STRUCTURED DATA
==================================================
META TAGS:
- title: "${seo?.title || businessName + ' | ' + siteConfig.city}"
- description: "${seo?.description || ''}"
- keywords: "${seo?.keywords?.join(', ') || ''}"

OPENGRAPH:
- og:title, og:description, og:type, og:image

JSON-LD (embed in layout.tsx):
${JSON.stringify(seo?.jsonLd || {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: businessName,
  telephone: normalizedPhone,
  address: { '@type': 'PostalAddress', addressLocality: siteConfig.city, addressCountry: 'ZA' },
}, null, 2)}

FAQPAGE SCHEMA (MANDATORY):
- Add FAQPage schema markup to the FAQ section
- This allows search engines and AI agents to digest questions and answers programmatically
- Example:
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text here."
      }
    }
  ]
}

LLMS.TXT — AUTO-GENERATED (DO NOT CREATE):
- /llms.txt and /llms-full.txt are served automatically by app/llms.txt/route.ts and
  app/llms-full.txt/route.ts from public/site-config.json. Do NOT write these files manually.
- Instead, keep site-config.json fields complete and accurate (businessName, services,
  businessHours, contact, geo.serviceAreas) so the generated summaries are rich.

AI-READABLE SEMANTIC HTML (MANDATORY):
- Exactly one <h1> per page; logical heading order (h1 -> h2 -> h3), never skip levels.
- Use semantic landmarks: <header>, <nav>, <main>, <footer>. Wrap page content in <main>.
- Every image MUST have a descriptive alt attribute (skip alt="" only for pure decoration).
- Keep the business Name / Address / Phone (NAP) strings IDENTICAL everywhere they appear
  (hero, contact section, footer, JSON-LD). Single source of truth is site-config.json.
- Internal linking: every page links back to / and /contact; service sections link to /contact.

EXPLICIT SERVICE BOUNDARIES (MANDATORY):
- Specify specific suburbs or travel policies
- Example: "Serving Sandton, Centurion, Midrand, Pretoria, and surrounding areas"
- Example: "Available for travel nationwide with travel fee"
- This helps AI assistants confidently recommend the business
- Include service radius descriptions for local businesses

==================================================
8.5 HUMAN-CENTRIC COPYWRITING (MANDATORY)
==================================================

BANNED WORDS AND PHRASES (strictly prohibited - will make website look generic across ALL industries):
- "delight", "delightful" (overused filler)
- "exceptional attention to detail" (generic)
- "unforgettable journey" (cliché)
- "elevate", "elevate your" (overused)
- "tailored solutions" (generic)
- "seamless experience" (generic)
- "cutting-edge" (generic)
- "state-of-the-art" (generic)
- "world-class" (unverifiable)
- "best-in-class" (unverifiable)
- "innovative", "innovation" (overused)
- "revolutionary" (overused)
- "game-changing" (overused)
- "passionate about" (overused — every business says this)
- "committed to excellence" (generic)
- "goes above and beyond" (cliché)
- "one-stop shop" (generic)
- "second to none" (unverifiable)
- "dedicated team" (generic)
- "years of experience" (meaningless without specifics)
- "customer-centric" (corporate jargon)
- "results-driven" (generic)
- "turnkey solution" (corporate jargon)
- "synergy" (corporate jargon)
- "leverage" (corporate jargon)
- "holistic approach" (overused)
- "proven track record" (unverifiable)
- "trusted partner" (generic — show trust through testimonials instead)

Instead, use specific, concrete language:
- BAD: "We're passionate about quality" → GOOD: "We bake fresh every morning at 4am"
- BAD: "Years of experience" → GOOD: "Serving Gauteng since 2012"
- BAD: "Exceptional attention to detail" → GOOD: "Every cake is hand-decorated by Lety"
- BAD: "Trusted partner" → GOOD: "Over 200 five-star Google reviews"

WRITING STYLE:
- Direct, warm, conversational human voice
- Focus on concrete facts: fresh local ingredients, clear turnaround times, deposit policies
- Include specific suburbs/towns served
- Use local references and landmarks
- Write like a local barkeeper or handyman, not a corporate brochure
- Use active voice, not passive
- Focus on benefits, not features
- Keep paragraphs short and scannable

IMAGE ALT TEXT (MANDATORY):
- Every image MUST have descriptive alt text
- Include local context: "Custom three-tier chocolate birthday cake in Gauteng"
- Never leave alt text empty or generic (e.g., alt="image1.png")
- Use keywords naturally in alt text

CURRENCY AUTO-DETECTION:
- +27 (South Africa) → R (ZAR)
- +1 (USA) → $ (USD)
- +44 (UK) → £ (GBP)
- +61 (Australia) → A$ (AUD)
- If no pricing data, use "Get a Custom Quote" instead of hardcoded prices

TELEPHONE PROTOCOL (MANDATORY):
- Convert ALL phone numbers to clean tel: links
- Format: <a href="tel:+27834799732">083 479 9732</a>
- NEVER allow "about:invalid" or unparsed JavaScript strings
- WhatsApp link format: https://wa.me/[clean_phone]?text=Hi%20[BusinessName]

CANONICAL URLS (MANDATORY):
- Every page MUST have a canonical URL
- Format: <link rel="canonical" href="https://domain.com/page" />
- Use the target production domain

TWITTER CARDS (MANDATORY):
- twitter:card (summary_large_image)
- twitter:site (handle if available)
- twitter:title (same as og:title)
- twitter:description (same as og:description)
- twitter:image (same as og:image)

INTERNAL LINKING STRATEGY:
- Cross-link between service pages and related content
- Link blog posts to relevant services
- Include breadcrumbs for navigation
- Use descriptive anchor text (not "click here")

IMAGE OPTIMIZATION (MANDATORY):
- Every image MUST use Next.js <Image /> component
- Explicit width, height, quality settings
- Lazy loading for below-fold images
- WebP format preferred
- Descriptive alt text with local context

==================================================
9. TECHNICAL REQUIREMENTS
==================================================
- Next.js 14 with App Router
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- TypeScript
- next/font for fonts
- Responsive: mobile-first
- Accessible: ARIA labels, semantic HTML
- Performance: lazy loading, image optimization
- Target: Lighthouse 90+

==================================================
10. GLOBAL VISUAL STANDARDS & ARCHITECTURAL RULES
==================================================

ADAPTIVE SURFACE CONTRAST & SECTION ELEVATION:
- Do NOT apply a single monochromatic background color across all page sections
- Alternate background tones dynamically between adjacent sections:
  * Main content blocks: Pure light backgrounds (#FFFFFF or #FAFAFA)
  * Secondary/transitional sections: Very light tint backgrounds (#F8FAFC, #F1F5F9, #F0FDF4)
- Maintain strong visual separation and section depth throughout the page flow
- Use subtle borders (border-gray-100) or shadow differences between sections

DYNAMIC CARD GEOMETRY & ARCHETYPE MAPPING:
- Creative, Youth, Entertainment, Tech: Maximum curvature (rounded-full / pill-style)
- Medical, Legal, Corporate, Professional, Trades: Balanced curvature (rounded-xl or rounded-2xl)
- Ensure text wrapping and inner padding scale with curvature so content never clips

TYPOGRAPHY & CONTRAST POLISH:
- Section Headings: Tight letter-spacing (-0.025em), font-bold, deep dark contrast (#111827)
- Body Text: Relaxed line-height (1.6-1.75), dark-neutral contrast (#374151)
- Maintain consistent vertical rhythm across heading-to-body transitions

INTERACTIVE MICRO-INTERACTIONS & ELEVATION:
- All actionable cards: Subtle hover states
- Hover effect: Gentle upward translation (translate-y-[-2px]) + soft diffuse shadow
- Provide immediate visual feedback without layout shift
- Transition: 200-300ms ease-out

==================================================
11. COMPONENT STRUCTURE (PRE-BUILT — DO NOT CREATE)
==================================================
ALL components are ALREADY created and copied into the project:
  components/Hero.tsx, Services.tsx, Gallery.tsx, Testimonials.tsx,
  Faq.tsx, Contact.tsx, About.tsx, Footer.tsx, Header.tsx, WhatsAppWidget.tsx,
  AnimateOnScroll.tsx, PageHero.tsx, VideoEmbed.tsx, ScrollToTop.tsx, Toast.tsx, _Lightbox.tsx

These components are PRE-BUILT and read all content from site-config.json via useSiteData().
They use CSS variables for colors, so they automatically adapt to your design seed.
DO NOT modify, recreate, or overwrite these component files. They work as-is.

GALLERY MODE PROP (REQUIRED):
- Homepage: <Gallery mode="home" />  (limited preview honouring siteConfig.gallerySettings)
- Portfolio page: <Gallery mode="full" />  (all images, category filters, lightbox)
Never omit the mode prop.

PAGE HERO (inner pages):
- Every sub-page starts with <PageHero page="about|services|portfolio|contact" fallbackTitle="..." fallbackSubtitle="..." fallbackImage="..." />
- Use generateMetadata via buildPageMetadata from '@/lib/page-meta'

YOUR ONLY JOBS:
1. Create app/page.tsx (with dynamic imports — see Rule 1D). Boilerplate already has a correct starting file — prefer keeping it.
2. Create sub-pages (app/about/page.tsx, app/services/page.tsx, etc.) with dynamic imports
3. Write ALL copywriting into public/site-config.json (see Section 12)
4. Assign images to public/image-map.json (see Section 12)
5. Set colors/fonts in tailwind.config.ts and globals.css
6. Create public/seo.json (llms.txt is auto-generated — do not write it manually)

ANIMATION GUIDANCE:
${industryAnimationGuidance || 'Smooth fade-ins, gentle parallax, elegant hover effects'}

SPACING GUIDANCE:
Section padding is LOCKED to .section-padding (3.25rem / 4.25rem / 5.25rem mobile/md/lg).
Section headers use mb-12 (not mb-16). Do not increase section padding.

TRUST SIGNALS:
${industryTrustSignals.map(s => `- ${s}`).join('\n') || '- Client testimonials\n- Years of experience\n- Certifications'}

CONVERSION CTAs:
${industryConversionCTAs.map(c => `- ${c}`).join('\n') || '- Contact Us\n- Get Started'}

==================================================
11. EXECUTION
==================================================
Components are PRE-BUILT. Your job is to:
1. Create app/page.tsx with dynamic imports (see Rule 1D)
2. Write ALL copywriting into public/site-config.json
3. Assign images to public/image-map.json
4. Set the design colors/fonts
5. Create SEO data files

DO NOT write component code. Components read from site-config.json automatically.

HERO IMAGE (MANDATORY — BUILD FAILS WITHOUT IT):
- site-config.json MUST have hero.heroImageUrl set to a real working image URL
  (Unsplash https://images.unsplash.com/... or /uploads/... local path)
- Components already render it as the hero background. Never leave it empty.
- Verify the URL returns HTTP 200 before saving.

STOP WHEN DONE:
- After "npm run build" succeeds and public/site-config.json + image-map.json exist, STOP.
- Do NOT run long smoke tests, playwright, or infinite dev servers.
- The builder runs QA, deploy, and notifications automatically after you exit.

==================================================
12. DASHBOARD INTEGRATION (MANDATORY)
==================================================

The dashboard is a hidden admin panel at /dashboard that lets the business owner manage their website.
The dashboard HTML/CSS/JS is ALREADY in public/dashboard/. Do NOT modify those files.
app/dashboard/page.tsx is ALREADY CREATED by the boilerplate. Do NOT recreate it.

For the dashboard to work, it needs data files served via HTTP. These files MUST be created
in the PUBLIC folder (public/) so Next.js can serve them at the root URL.

CRITICAL: These are NEW files you CREATE in public/ with the FINAL website data.
Do NOT copy the root-level scraped files. Write fresh versions with the complete, final data.

After building all components, you MUST create these files:

1. CREATE public/site-config.json with ALL website data.
   CRITICAL: EVERY piece of copywriting on the website MUST be in this file.
   NEVER hardcode headings, subheadings, or paragraph text in .tsx components.
   Components must read from site-config.json at runtime via useSiteData().

   The file MUST include ALL of these sections:

   {
     "businessName": "...",
     "city": "...",
     "ownerName": "...",
     "phone": "...",
     "email": "...",
     "address": "...",

     "hero": {
       "headline": "The main hero headline text",
       "subheadline": "The supporting text below the headline",
       "badge": "Small badge text above headline",
       "ctaText": "Button text, e.g. Get a Free Quote",
       "ctaLink": "#contact",
       "heroImageUrl": "URL to hero background image",
       "heroImageAlt": "Descriptive alt text for the hero image"
     },

     "about": {
       "title": "Page title, e.g. Our Story",
       "tagline": "Tagline, e.g. Baked with Love",
       "paragraph1": "First paragraph of about page content",
       "paragraph2": "Second paragraph",
       "paragraph3": "Third paragraph",
       "imageUrl": "URL to about section image",
       "imageAlt": "Descriptive alt text for the about image"
     },

     "pageContent": {
       "servicesTitle": "Section heading on services page, e.g. Our Services",
       "servicesDescription": "Description text under services heading",
       "servicesCtaTitle": "CTA section title on services page",
       "servicesCtaText": "CTA section description text",
       "contactTitle": "Page title on contact page, e.g. Contact Us",
       "contactDescription": "Description text on contact page",
       "portfolioTitle": "Page title on portfolio page",
       "portfolioDescription": "Description text on portfolio page",
       "testimonialsTitle": "Section heading, e.g. What Our Customers Say",
       "testimonialsSubtitle": "Small label above heading, e.g. Happy Clients",
       "faqTitle": "Section heading, e.g. Frequently Asked Questions",
       "faqSubtitle": "Small label above heading, e.g. Questions & Answers",
       "galleryTitle": "Gallery section heading, e.g. Our Work",
       "gallerySubtitle": "Gallery section description",
       "aboutTitle": "About section heading on homepage",
       "aboutSubtitle": "About section description on homepage"
     },

     "services": [{ "title": "...", "description": "...", "priceTag": "..." }],
     "testimonials": [{ "name": "...", "text": "...", "rating": 5 }],
     "faq": [{ "question": "...", "answer": "..." }],
     "blogPosts": [],
     "pricing": [],
     "socialLinks": { "facebook": "...", "instagram": "...", "twitter": "..." },
     "businessHours": [
       { "dayOfWeek": "Monday", "opens": "08:00", "closes": "17:00" },
       { "dayOfWeek": "Tuesday", "opens": "08:00", "closes": "17:00" },
       { "dayOfWeek": "Wednesday", "opens": "08:00", "closes": "17:00" },
       { "dayOfWeek": "Thursday", "opens": "08:00", "closes": "17:00" },
       { "dayOfWeek": "Friday", "opens": "08:00", "closes": "17:00" },
       { "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" },
       { "dayOfWeek": "Sunday", "opens": "Closed", "closes": "Closed" }
     ],
     "logoUrl": "..."
   }

   RULE: If you write a heading or paragraph in a .tsx component, it MUST also exist in site-config.json.
   The component reads it via: const { config } = useSiteData(); then config?.pageContent?.galleryTitle etc.

2. CREATE public/image-map.json with ALL gallery data:
   {
     "businessName": "...",
     "totalImages": 0,
     "categories": {
       "Category Name": {
         "thumbnail": "https://images.unsplash.com/...",
         "images": ["https://images.unsplash.com/...", "https://images.unsplash.com/..."]
       }
     }
   }
   Each category MUST include a "thumbnail" field (the image shown on the category card).
   The thumbnail can be the first image or a different one — it is NOT displayed inside the folder.
   If using stock images, include the Unsplash URLs here.

3. CREATE public/seo.json with SEO data:
   {
     "title": "...",
     "description": "...",
     "keywords": ["..."],
     "openGraph": { "title": "...", "description": "...", "type": "website" },
     "twitter": { "card": "summary_large_image", "title": "...", "description": "..." },
     "jsonLd": { "@context": "https://schema.org", "@type": "LocalBusiness", ... }
   }

4. llms.txt is auto-generated from site-config.json — do NOT create it manually.

5. Add FAQPage schema markup to the FAQ section:
   - This allows search engines and AI agents to digest Q&A programmatically
   - Include all FAQ questions and answers in the schema

8. Add explicit service boundaries:
   - Specify suburbs or areas served
   - Include travel policies if applicable
   - Help AI assistants recommend the business

9. API ROUTES ARE ALREADY CREATED BY BOILERPLATE (DO NOT RECREATE):
   - app/api/save-config/route.ts — handles siteConfig and imageMap saves
   - app/api/upload/route.ts — handles image uploads to public/uploads/

10. lib/use-site-data.ts AND components/AnimateOnScroll.tsx ARE ALREADY CREATED (DO NOT RECREATE):
    - useSiteData() hook fetches /site-config.json and /image-map.json at runtime
    - AnimateOnScroll provides scroll-triggered animations
    - Import them: import { useSiteData } from '@/lib/use-site-data'
    - Import them: import { AnimateOnScroll } from '@/components/AnimateOnScroll'

11. COMPONENTS MUST USE RUNTIME DATA (see Rule 9):
    - Services, Testimonials, Gallery, etc. must fetch from data files via useSiteData()
    - NEVER hardcode service names, testimonials, or gallery images in components
    - Use fallback data only for initial render before fetch completes
      - Save uploaded files to the public/uploads/ directory
      - Return the relative public path URL (e.g., /uploads/filename.jpg)
      - The dashboard can then assign it to gallery/portfolio items or hero images

The dashboard template is already in public/dashboard/ - do NOT modify it.

${buildResponsiveSpecifications()}

${buildAccessibilitySpecifications()}

${buildMicroInteractionSpecifications()}

==================================================
FINAL VERIFICATION CHECKLIST
==================================================

Before delivering, verify ALL of the following:

PHASE 9 ENHANCEMENTS CHECKLIST:
□ Data validation passed (no critical errors)
□ Services have icons, images, CTAs, features, pricing
□ Typography: Fonts load with display: 'swap'
□ Typography: Line-height 1.6 on body text
□ Typography: Responsive type scale applied (clamp or Tailwind)
□ Responsive: Mobile-first approach (stack vertically < 768px)
□ Responsive: Tablet-specific layouts (2-column grid)
□ Responsive: Touch targets minimum 44x44px
□ Responsive: No horizontal scroll on mobile
□ Responsive: Viewport meta tag with maximum-scale=5
□ Responsive: Safe area insets for notched devices
□ Responsive: Images have srcset and sizes attributes
□ Accessibility: ARIA landmarks (header, main, footer, nav)
□ Accessibility: Keyboard navigation (Tab, Enter, Escape work)
□ Accessibility: Focus visible on all interactive elements
□ Accessibility: Screen reader text for icon buttons
□ Accessibility: Color contrast meets WCAG AA (4.5:1 minimum)
□ Accessibility: Alt text descriptive (not "image" or filename)
□ Accessibility: Form errors announced with role="alert"
□ Micro-interactions: Hover effects 150-300ms with ease-out
□ Micro-interactions: Toasts positioned top-right (desktop) / bottom-center (mobile)
□ Micro-interactions: Toast auto-dismiss timing correct (3s success, 7s error)

GENERAL CHECKLIST:
□ All page files use STATIC imports (no dynamic(..., { ssr: false }))
□ No imports from 'next/document'
□ No error pages created (404.tsx, error.tsx, etc.)
□ All images have stock images OR local paths
□ All text content in site-config.json (zero hardcoded copywriting)
□ Business hours populated in site-config.json
□ page:Content schema properties populated
□ FAQPage schema markup added
□ site-config.json complete (drives auto-generated llms.txt)
□ Service boundaries specified
□ Dashboard integration tested

This must be indistinguishable from a $10,000 custom design. Execute now.`
}

// ============================================
// Helper Functions
// ============================================

function buildNavigationRoutes(siteConfig: MasterSiteConfig): string {
  const standardRoutes = new Set(['', '/', '/about', '/about-us', '/services', '/service', '/portfolio', '/gallery', '/contact', '/contact-us', '/pricing', '/products', '/team', '/testimonials', '/blog', '/faq'])
  const customSlugs: string[] = []

  const rawRoutes = [
    ...(siteConfig.legacyUrls?.discovered || []),
    ...(siteConfig.legacyUrls?.scraped || []),
    ...(siteConfig.pageMediaMap?.map(p => p.pageUrl) || []),
  ]

  for (const urlStr of rawRoutes) {
    try {
      let pathname = ''
      if (urlStr.startsWith('http')) {
        pathname = new URL(urlStr).pathname.trim()
      } else {
        pathname = urlStr.trim()
      }
      pathname = pathname.replace(/\/$/, '')
      if (pathname.startsWith('/')) pathname = pathname.slice(1)

      if (pathname && !standardRoutes.has('/' + pathname.toLowerCase())) {
        const normalizedRoute = '/' + pathname
        if (!customSlugs.includes(normalizedRoute)) customSlugs.push(normalizedRoute)
      }
    } catch {}
  }

  const extractedRoutes = siteConfig.legacyUrls?.discovered || siteConfig.legacyUrls?.scraped || []
  let routeList = extractedRoutes.length > 0
    ? extractedRoutes.slice(0, 20).map(url => `- ${url}`).join('\n')
    : '- / (Home)\n- /portfolio (Gallery)\n- /services (Services)\n- /about (About)\n- /contact (Contact)'

  if (customSlugs.length > 0) {
    routeList += `\n- Custom routes:\n` + customSlugs.map(slug => `  * ${slug}`).join('\n')
  }

  return routeList
}

function buildGalleryInstructions(siteConfig: MasterSiteConfig): string {
  const { gallery, pageMediaMap } = siteConfig
  const lines: string[] = []

  lines.push('GALLERY SECTION (CRITICAL - PRESERVE CATEGORY ORGANIZATION):')
  lines.push('- Images MUST be organized by their original categories')
  lines.push('- Create separate sections or filter tabs for EACH category')
  lines.push('- DO NOT mix all images into one flat portfolio')

  if (pageMediaMap && pageMediaMap.length > 0) {
    const categoryMap = new Map<string, { images: string[]; url: string }>()

    for (const page of pageMediaMap) {
      const urlLower = page.pageUrl.toLowerCase()
      let category = 'Portfolio'

      if (urlLower.includes('wedding')) category = 'Weddings'
      else if (urlLower.includes('famil')) category = 'Families'
      else if (urlLower.includes('newborn') || urlLower.includes('baby')) category = 'Newborn'
      else if (urlLower.includes('maternity')) category = 'Maternity'
      else if (urlLower.includes('portrait')) category = 'Portraits'
      else if (urlLower.includes('couple') || urlLower.includes('engagement')) category = 'Couples'
      else if (urlLower.includes('matric')) category = 'Matric'

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { images: [], url: page.pageUrl })
      }
      categoryMap.get(category)!.images.push(...page.images)
    }

    if (categoryMap.size > 1) {
      lines.push('\nCategory structure from source site:')
      for (const [category, data] of Array.from(categoryMap.entries())) {
        const uniqueImages = Array.from(new Set(data.images))
        if (uniqueImages.length > 0) {
          lines.push(`\n** ${category} ** (${uniqueImages.length} images)`)
          lines.push(`Source: ${data.url}`)
          lines.push(`Use these images for ${category}:`)
          uniqueImages.slice(0, 5).forEach(img => lines.push(`  - ${img}`))
          if (uniqueImages.length > 5) lines.push(`  - ... and ${uniqueImages.length - 5} more`)
        }
      }
    }
  }

  if (gallery?.length) {
    const categories = new Map<string, number>()
    for (const item of gallery) {
      const cat = item.category || 'Portfolio'
      categories.set(cat, (categories.get(cat) || 0) + 1)
    }
    if (categories.size > 1) {
      lines.push('\nGallery categories:')
      for (const [cat, count] of Array.from(categories.entries())) {
        lines.push(`  - ${cat}: ${count} images`)
      }
    }
  }

  lines.push('\n- Responsive masonry grid layout')
  lines.push('- Hover effect: scale + overlay with caption')
  lines.push('- Click to open lightbox with keyboard navigation')
  lines.push('- Category filter tabs at the top')
  lines.push('')
  lines.push('**HOMEPAGE GALLERY LIMIT:**')
  lines.push('- On the HOME PAGE (app/page.tsx), limit gallery to 12-16 images maximum')
  lines.push('- Add a "See All Photos" or "View Full Portfolio" button below the gallery')
  lines.push('- This button should link to /portfolio page where ALL images are shown')
  lines.push('- Use slice(0, 16) or similar to limit images on homepage')
  lines.push('- Full /portfolio page should show unlimited images with category filters')

  // Stock image fallback for clean builds (no scraped images)
  const hasNoImages = (!gallery || gallery.length === 0) && (!pageMediaMap || pageMediaMap.length === 0)
  if (hasNoImages) {
    lines.push('\n*** STOCK IMAGE FALLBACK (NO SCRAPED IMAGES AVAILABLE) ***')
    lines.push('Since there are no scraped images, you MUST use Unsplash stock images.')
    lines.push('NEVER use gradient placeholders, colored boxes, or SVG icons as image substitutes.')
    lines.push('')
    lines.push('Use <img> tags with these Unsplash URLs (replace with industry-appropriate images):')
    lines.push('  { id: 1, title: "...", category: "...", image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80" }')
    lines.push('  { id: 2, title: "...", category: "...", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80" }')
    lines.push('  // ... add 8-15 items with different Unsplash photo IDs')
    lines.push('')
    lines.push('For the About/Founder section, use a portrait stock photo:')
    lines.push('  <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" />')
    lines.push('')
    lines.push('For sub-page headers, use a background image with overlay:')
    lines.push('  <section className="relative py-24 overflow-hidden">')
    lines.push('    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: \'url(...)\' }} />')
    lines.push('    <div className="absolute inset-0 bg-primary/80" />')
    lines.push('    <div className="relative ...">...</div>')
    lines.push('  </section>')
  }

  return lines.join('\n')
}

function buildFeatureInstructions(features: FeatureFlags, siteConfig?: MasterSiteConfig): string {
  const instructions: string[] = []

  const hasWhatsApp = (siteConfig as any)?.hasWhatsApp !== false

  if (features.whatsappWidget && hasWhatsApp) {
    instructions.push(`WHATSAPP WIDGET:
- Fixed-position floating button (bottom-right, z-50)
- Green (#25D366) circular button with WhatsApp icon
- Pulse animation on hover
- Opens https://wa.me/[number] in new tab
- Tooltip "Chat with us" on hover`)
  } else if (features.whatsappWidget && !hasWhatsApp) {
    instructions.push(`WHATSAPP WIDGET: DISABLED
- This business does not use WhatsApp
- Do NOT include any WhatsApp buttons or widgets
- Emphasize phone calls and email instead`)
  }

  if (features.clickToCall) {
    instructions.push(`CLICK-TO-CALL:
- All phone numbers wrapped in <a href="tel:...">
- Phone icon beside numbers
- Sticky mobile call bar at bottom`)
  }

  if (features.contactForm) {
    instructions.push(`CONTACT FORM:
- Fields: Name, Email, Phone, Service Interest, Message
- Client-side validation
- Success state: "Thank you! We'll respond within 24 hours"
- Honeypot field for spam prevention
- Glass morphism card styling`)
  }

  if (features.googleMaps) {
    instructions.push(`GOOGLE MAPS:
- Embed Google Maps iframe
- Click-to-open in Google Maps
- Custom pin marker
- "Get Directions" link`)
  }

  if (features.businessHours) {
    instructions.push(`BUSINESS HOURS:
- Display operating hours in contact section
- Show current status: "Open Now" (green) or "Closed" (red)
- Responsive layout`)
  }

  if (features.testimonials) {
    instructions.push(`TESTIMONIALS:
- Carousel/slider with client testimonials
- Show: name, quote, rating (stars), source badge
- Auto-play with pause on hover
- "Read more reviews on Google" CTA`)
  }

  if (features.faq) {
    instructions.push(`FAQ SECTION:
- Accordion with smooth expand/collapse
- One item open at a time
- FAQPage schema in JSON-LD
- Plus/minus toggle icons`)
  }

  if (features.socialMediaLinks) {
    instructions.push(`SOCIAL MEDIA:
- Icons in header (optional) and footer (required)
- Open in new tab with rel="noopener noreferrer"
- Hover effect: brand color fill animation`)
  }

  if (features.animatedScroll) {
    instructions.push(`ANIMATED SCROLL:
- Framer Motion for section entrance animations
- Fade-up on scroll for content blocks
- Staggered animation for grid items
- Respect prefers-reduced-motion`)
  }

  if (features.imageLightbox) {
    instructions.push(`IMAGE LIGHTBOX:
- Click-to-expand gallery images
- Keyboard navigation (arrow keys, escape)
- Swipe support on mobile
- Image caption and counter`)
  }

  if (features.onlineBooking) {
    instructions.push(`ONLINE BOOKING:
- Booking form with date picker, time slots
- Service selection dropdown
- Confirmation modal
- Email notification structure`)
  }

  if (features.pricingTables) {
    instructions.push(`PRICING TABLES:
- Tiered pricing cards (3 tiers)
- Highlight "Most Popular" tier
- Feature comparison checklist
- CTA button per tier`)
  }

  if (features.beforeAfterSlider) {
    instructions.push(`BEFORE/AFTER SLIDER:
- Interactive comparison slider
- Draggable handle
- "Before" and "After" labels
- At least 3 examples`)
  }

  return instructions.join('\n\n')
}

function getDefaultFeatures(): FeatureFlags {
  return {
    whatsappWidget: true,
    clickToCall: true,
    contactForm: true,
    googleMaps: false,
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
  }
}

// ============================================
// File-Based Build Instructions
// ============================================

export interface BuildInstructions {
  shortPrompt: string
  technicalRules: string
  designSystem: string
  contentGuide: string
  dataSchemas: string
  visualStandards: string
}

export function generateBuildInstructions(options: PromptBuilderOptions): BuildInstructions {
  const { buildMode, siteConfig, websitesFolder = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites' } = options
  const { businessName, seo, services, gallery, theme, legacyUrls, contact, pageMediaMap, features, geo, testimonials, faq, socialLinks, team, businessHours } = siteConfig

  // 1. Detect Industry
  const providedIndustry = (siteConfig as any).industry || ''
  let archetype: IndustryArchetype

  if (providedIndustry) {
    // Closed-map truth first, then name/keyword fallback for unknown labels
    const mappedId = resolveArchetypeFromIndustry(providedIndustry)
    archetype = mappedId
      ? (INDUSTRY_ARCHETYPES.find(a => a.id === mappedId) || INDUSTRY_ARCHETYPES.find(a => a.id === 'general')!)
      : detectIndustry(businessName, seo?.title, seo?.description, services, legacyUrls?.discovered?.[0], providedIndustry)
  } else {
    archetype = detectIndustry(
      businessName,
      seo?.title,
      seo?.description,
      services,
      legacyUrls?.discovered?.[0]
    )
  }

  // 2. Generate Design Seed
  const constraintKey = getArchetypeConstraintKey(archetype.id)
  const designSeed = generateDesignSeed(businessName || 'business', constraintKey)

  // 3. Get Industry Template
  const industryTemplate = getIndustryTemplate(archetype.id)
  const industryStyle = industryTemplate ? getIndustryStyle(industryTemplate, designSeed.id.charCodeAt(0)) : null
  const industryColorPalette = industryTemplate ? getIndustryColorPalette(industryTemplate, designSeed.id.charCodeAt(1), (designSeed.id.charCodeAt(3) % 30) - 15) : null
  const industryTypography = industryTemplate ? getIndustryTypography(industryTemplate, designSeed.id.charCodeAt(2)) : null
  const industryTrustSignals = industryTemplate ? getIndustryTrustSignals(industryTemplate) : []
  const industryConversionCTAs = industryTemplate ? getIndustryConversionCTAs(industryTemplate) : []
  const industryImageryDirection = industryTemplate ? getIndustryImageryDirection(industryTemplate) : ''
  const industryAnimationGuidance = industryTemplate ? getIndustryAnimationGuidance(industryTemplate) : ''
  const industrySpacingGuidance = industryTemplate ? getIndustrySpacingGuidance(industryTemplate) : ''

  // 4. Design seed overrides
  const professionalArchetypes = ['medical', 'legal', 'finance', 'realestate', 'trades', 'corporate', 'security']
  let effectiveDesignSeed = { ...designSeed }
  if (professionalArchetypes.includes(archetype.id) && designSeed.cardGeometry === 'pill') {
    effectiveDesignSeed.cardGeometry = 'rounded'
  }
  const designSeedInstructions = getDesignSeedInstructions(effectiveDesignSeed)

  // 5. Build paths
  const clientFolder = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const clientPath = `${websitesFolder}\\${clientFolder}`
  const isDarkMode = archetype.themeMode === 'dark'
  const finalBg = archetype.defaultBg || theme?.palette?.bg || '#FFFFFF'

  // 6. Generate creative brief
  const creativeBrief = generateCreativeBrief({
    businessName,
    industry: archetype.name,
    city: siteConfig.city,
    ownerName: siteConfig.ownerName,
    services: services || [],
    archetype,
    siteConfig,
    designSeed: {
      artDirection: designSeed.artDirection,
      layoutStyle: designSeed.layoutStyle,
      typographyPairing: designSeed.typographyPairing,
      motionIntensity: designSeed.motionIntensity,
      colorIntensity: designSeed.colorIntensity,
      decorativeIntensity: designSeed.decorativeIntensity,
      spacingScale: designSeed.spacingScale,
    },
  })

  const brandVoice = generateBrandVoice(siteConfig, archetype)
  const dynamicSectionOrder = buildDynamicSectionOrder(siteConfig, effectiveDesignSeed)
  const navigation = buildNavigationRoutes(siteConfig)
  const galleryInstructions = buildGalleryInstructions(siteConfig)
  const featureInstructions = buildFeatureInstructions(features || getDefaultFeatures(), siteConfig)

  // 7. Phone normalization
  const normalizedWhatsapp = normalizePhoneNumber(contact?.whatsapp || '0834799732')
  const normalizedPhone = normalizePhoneNumber(contact?.phone || '0834799732')

  // ============================================
  // FILE 1: Short Prompt (main prompt sent to agent)
  // ============================================
  const shortPrompt = `==================================================
WORKING DIRECTORY
==================================================
WORKING DIRECTORY: ${clientPath}
You are ALREADY in the correct directory. Do NOT search for other locations.
All files are in THIS directory. Read files using relative paths.

==================================================
YOUR TASK
==================================================
Build a production-ready Next.js 14 website for "${businessName}".

Read these files in .build-instructions/ as you work:
- technical-rules.md — MANDATORY rules that prevent build failures
- design-system.md — Colors, typography, spacing for this specific business
- content-guide.md — Writing style, banned words, SEO rules
- data-schemas.md — Exact JSON structure for site-config.json, image-map.json, seo.json
- visual-standards.md — Card geometry, contrast, micro-interactions

${creativeBrief}

${brandVoice}

SECTION ORDER: ${dynamicSectionOrder}
- Only include sections with data. Skip empty sections.
- Hero is always first. Contact is always last.

==================================================
DESIGN SEED SUMMARY
==================================================
Art Direction: ${designSeed.artDirection}
Layout Style: ${designSeed.layoutStyle}
Typography: ${designSeed.typographyPairing} (Heading: ${industryTypography?.heading || archetype.typography.heading}, Body: ${industryTypography?.body || archetype.typography.body})
Motion: ${designSeed.motionIntensity}
Colors: ${industryColorPalette?.name || 'Default'} — Primary: ${industryColorPalette?.primary || theme?.palette?.primary || '#0ea5e9'}, Secondary: ${industryColorPalette?.secondary || theme?.palette?.secondary || '#6366f1'}, Accent: ${industryColorPalette?.accent || theme?.palette?.accent || '#f59e0b'}
Background: ${industryColorPalette?.bg || finalBg} (${isDarkMode ? 'dark mode' : 'light mode'})
Spacing: ${designSeed.spacingScale}

==================================================
BUSINESS DATA
==================================================
SERVICES:
${services?.map((s, i) => `${i + 1}. ${s.title}: ${s.description}${s.priceTag ? ` [${s.priceTag}]` : ''}`).join('\n') || '- Generate relevant services for ' + archetype.name}

${testimonials?.length ? `TESTIMONIALS:\n${testimonials.map((t, i) => `${i + 1}. "${t.text}" - ${t.name}${t.rating ? ` (${t.rating}/5)` : ''}`).join('\n')}` : ''}

${faq?.length ? `FAQ:\n${faq.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join('\n')}` : ''}

CONTACT: Phone=${normalizedPhone}, WhatsApp=${normalizedWhatsapp}, Email=${contact?.email || ''}, Address=${contact?.address || siteConfig.city}

${galleryInstructions}

${siteConfig.socialLinks ? `SOCIAL: ${Object.entries(siteConfig.socialLinks).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}

==================================================
CRITICAL IMAGE INSTRUCTIONS
==================================================
${siteConfig.hero?.heroImageUrl?.startsWith('/uploads/') ? `
IMAGES ARE ALREADY DOWNLOADED LOCALLY in /uploads/. Use the LOCAL paths from site-config.json and image-map.json.
- Hero image: Use site-config.json hero.heroImageUrl (already a local path like /uploads/.../hero.webp)
- Gallery images: Use image-map.json categories (already local paths like /uploads/.../img-001.webp)
- Service images: Use site-config.json services[].imageUrl (already local paths)
- Logo: Use site-config.json brandAssets.logoUrl (already a local path)
- DO NOT use external URLs. DO NOT use Unsplash. The images are already downloaded.
- The Gallery component reads from image-map.json automatically via useSiteData().
` : `
NO SCRAPED IMAGES AVAILABLE. Use Unsplash stock images that match the ${archetype.name} industry.
- Hero: Use a high-quality Unsplash image as background
- Gallery: Use 8-15 Unsplash images organized by category
- Services: Use relevant Unsplash images for each service
- NEVER use gradient placeholders or colored boxes.
`}

==================================================
YOUR TASKS (in order)
==================================================
1. Read .build-instructions/technical-rules.md BEFORE writing any code
2. Create app/page.tsx with dynamic imports (see technical-rules.md Rule 1D)
3. Create sub-pages (app/about/page.tsx, app/services/page.tsx, etc.)
4. Read .build-instructions/data-schemas.md BEFORE creating data files
5. Write ALL copywriting into public/site-config.json
6. Assign images to public/image-map.json
7. Read .build-instructions/content-guide.md BEFORE writing copy
8. Create public/seo.json (llms.txt is auto-generated — do not write it manually)
9. Set colors/fonts in tailwind.config.ts and globals.css

Components are PRE-BUILT. DO NOT modify, recreate, or overwrite component files.
They read from site-config.json via useSiteData() at runtime.

Execute now. This must be indistinguishable from a $10,000 custom design.`

  // ============================================
  // FILE 2: Technical Rules
  // ============================================
  const technicalRules = `# Technical Rules — MANDATORY

These rules prevent build failures. Read this file BEFORE writing any code.

## Rule 1: Framer Motion SSR Safety (CRITICAL)

framer-motion components are client components ("use client"). Use STATIC imports.

### Rule 1A — Static imports for all section components (NO dynamic/ssr:false):

\`\`\`tsx
'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import ScrollToTop from '@/components/ScrollToTop'
import SectionRenderer from '@/components/SectionRenderer'
import FeatureHost from '@/components/features/FeatureHost'
import WhatsAppGate from '@/components/WhatsAppGate'
\`\`\`

### Rule 1B — "use client" on every animated component

### Rule 1C — NEVER use dynamic(..., { ssr: false }) in page files

### Rule 1D — app/page.tsx MUST use this pattern (Section Registry composition):

The homepage does NOT hardcode sections. \`SectionRenderer\` reads the Section
Registry at runtime and renders whatever the client has switched on in the
dashboard. \`FeatureHost\` mounts the premium feature widgets into placement slots.

\`\`\`tsx
'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import ScrollToTop from '@/components/ScrollToTop'
import SectionRenderer from '@/components/SectionRenderer'
import FeatureHost from '@/components/features/FeatureHost'
import WhatsAppGate from '@/components/WhatsAppGate'

export default function Home() {
  return (
    <>
      <FeatureHost placement="top-banner" />
      <Header />
      <FeatureHost placement="header" />
      <main>
        <SectionRenderer />
        <FeatureHost placement="inline" />
      </main>
      <Footer />
      <FeatureHost placement="footer" />
      <FeatureHost placement="floating" />
      <FeatureHost placement="modal" />
      <WhatsAppGate><WhatsAppWidget /></WhatsAppGate>
      <ScrollToTop />
    </>
  )
}
\`\`\`

CRITICAL — every \`FeatureHost\` placement slot must stay mounted. The slots are
\`top-banner\`, \`header\`, \`inline\`, \`footer\`, \`floating\`, \`modal\`. If you drop
one, every feature assigned to that slot silently renders nothing.

NEVER list sections individually in app/page.tsx. NEVER reorder them there —
the client reorders from the dashboard via \`controls.sectionOrder\`.

## Rule 2: NEVER import from next/document

NEVER import Html, Head, Main, NextScript from 'next/document'.
The layout.tsx already handles <html> and <body>.

## Rule 3: NO ERROR PAGES

Do NOT create: app/error.tsx, app/404.tsx, app/500.tsx, app/not-found.tsx

## Rule 4: APP ROUTER ONLY

All pages go in app/ directory (NOT pages/).

## Rule 5: Dashboard page is ALREADY created — DO NOT modify

## Rule 6: Stock Images for Clean Builds

When no scraped images exist, use Unsplash stock images. NEVER use gradient placeholders.

## Rule 8: API Routes are ALREADY created — DO NOT modify

These routes already exist and are managed by the platform:
- app/api/contact/route.ts (Resend lead delivery + Supabase logging)
- app/api/leads/route.ts (dashboard lead list / mark-read)
- app/api/leads/[id]/redeliver/route.ts (redeliver to inbox)
- app/api/leads/test/route.ts (send test lead)
- app/api/geo-audit/route.ts (pre-launch GEO checklist)
- app/api/save-config, app/api/upload, app/api/site-data, app/api/auth/*
DO NOT modify, recreate, or overwrite these files.

## Rule 8B: Platform SEO / GEO files are ALREADY created — DO NOT modify

These files are auto-generated and serve AI/search crawlers:
- app/robots.ts (search + AI crawler allowlist)
- app/sitemap.ts (dynamic XML sitemap)
- app/llms.txt/route.ts and app/llms-full.txt/route.ts (AI-readable business summary)
- app/opengraph-image.tsx (branded social preview)
- app/rss.xml/route.ts (RSS feed)
- app/layout.tsx JSON-LD scripts (LocalBusiness / FAQPage / Service / speakable)
DO NOT modify, recreate, or overwrite these files. To change what they contain,
edit public/site-config.json only.

## Rule 8C: Platform library files are ALREADY created — DO NOT modify

- lib/leads.ts, lib/supabase-server.ts, lib/email-html.ts (lead pipeline)
- lib/schema.ts, lib/schema-types.ts (JSON-LD builders)
- lib/robots-ua-list.ts, lib/geo-audit.ts, lib/page-meta.ts
- lib/site-url.ts, lib/view-tracker.ts, lib/logo-engine.ts
DO NOT modify, recreate, or overwrite these files.

## Rule 8D: Full Control System is ALREADY created — DO NOT modify

The site's section list is driven at RUNTIME by the Section Registry. The client
switches sections on/off from the dashboard. Nothing is hardcoded in page.tsx.

DO NOT modify or recreate:
- lib/section-registry.ts, lib/feature-registry.ts, lib/control-flags.ts
- components/SectionRenderer.tsx, components/PageHero.tsx
- components/WhatsAppGate.tsx, components/VideoEmbed.tsx
- components/features/FeatureHost.tsx and every components/features/*.tsx
- components/TeamSection.tsx, TeamPage.tsx, BlogStrip.tsx, BlogPage.tsx
- components/ReviewsPage.tsx, AreasPage.tsx, PrivacyContent.tsx
- components/StatsBar.tsx, ProcessSteps.tsx, BeforeAfter.tsx, LatestWork.tsx
- components/TrustBadges.tsx, PartnersStrip.tsx, AreasServed.tsx
- components/LocationMap.tsx, BusinessHours.tsx, AwardsPress.tsx
- components/SocialFeed.tsx, NewsletterBlock.tsx
- components/PricingTable.tsx, CtaBanner.tsx, VslPlayer.tsx

CRITICAL RULES:
1. app/page.tsx renders <SectionRenderer /> + <FeatureHost placement="..." /> —
   do NOT hardcode section lists. See Rule 1D for the exact file.
2. app/team, app/blog, app/reviews, app/faq, app/areas, app/privacy already
   exist. Do NOT recreate them.
3. site-config.json "controls" drives what is visible (controls.sections,
   controls.pages, controls.features, controls.sectionOrder). Do NOT edit it to
   force sections on — the client controls that from the dashboard.
4. If a section is switched off, the site re-flows automatically. Never leave
   placeholder markup for a hidden section.
5. You write ONLY the design-variant components: Hero, Services, Gallery,
   Testimonials, Faq, About, Contact, Header, Footer. Pick the variant that
   matches this business's archetype and write it to the canonical flat path
   (e.g. components/Hero.tsx). Everything else in the control system is
   platform-owned and already shipped.

## Rule 9: Components MUST fetch data at runtime

Components use useSiteData() to fetch from site-config.json and image-map.json.
NEVER hardcode services, testimonials, or gallery images in components.

## Rule 10: Zero Hardcoded Copywriting

EVERY piece of text MUST come from site-config.json.
Components read it via: const { config } = useSiteData()

## Pre-Built Components (DO NOT modify)

These are already in the project:
- components/Hero.tsx, Services.tsx, Gallery.tsx, Testimonials.tsx
- Faq.tsx, Contact.tsx, About.tsx, Footer.tsx, Header.tsx
- WhatsAppWidget.tsx, AnimateOnScroll.tsx, ScrollToTop.tsx
- CtaBanner.tsx, PricingTable.tsx

They read from site-config.json via useSiteData() at runtime.
DO NOT modify, recreate, or overwrite these files.`

  // ============================================
  // FILE 3: Design System
  // Use site-config colors as primary (these include user-selected palettes and logo-extracted colors)
  // Fall back to industry palette only when site-config colors are defaults
  const siteColors = theme?.palette
  const isDefaultColors = !siteColors || (siteColors.primary === '#0ea5e9' && siteColors.secondary === '#6366f1')
  const primaryColor = !isDefaultColors ? siteColors.primary : (industryColorPalette?.primary || '#0ea5e9')
  const secondaryColor = !isDefaultColors ? siteColors.secondary : (industryColorPalette?.secondary || '#6366f1')
  const accentColor = !isDefaultColors ? siteColors.accent : (industryColorPalette?.accent || '#f59e0b')
  const bgColor = !isDefaultColors ? (siteColors.bg || finalBg) : (industryColorPalette?.bg || finalBg)
  const textColor = !isDefaultColors ? (siteColors.text || (isDarkMode ? '#f5f5f5' : '#1a1a1a')) : (industryColorPalette?.text || (isDarkMode ? '#f5f5f5' : '#1a1a1a'))
  const colorPaletteName = !isDefaultColors ? 'Selected' : (industryColorPalette?.name || 'Default')

  // ============================================
  // FILE 3: Design System
  // ============================================
  const designSystem = `# Design System — ${businessName}

## Design Seed: ${designSeed.id}

${designSeedInstructions}

## Color Palette (${colorPaletteName})

| Token | Value | Usage |
|-------|-------|-------|
| Primary | ${primaryColor} | Buttons, CTAs, active states |
| Secondary | ${secondaryColor} | Accents, hover states |
| Accent | ${accentColor} | Highlights, badges |
| Background | ${bgColor} | Page background |
| Text | ${textColor} | Body text |
| Muted | ${isDarkMode ? '#9ca3af' : '#6b7280'} | Secondary text |

## CSS Custom Properties

\`\`\`css
:root {
  --color-primary: ${primaryColor};
  --color-secondary: ${secondaryColor};
  --color-accent: ${accentColor};
  --color-bg: ${bgColor};
  --color-text: ${textColor};
  --color-muted: ${isDarkMode ? '#9ca3af' : '#6b7280'};
  --font-heading: ${industryTypography?.heading || archetype.typography.heading}, serif;
  --font-body: ${industryTypography?.body || archetype.typography.body}, sans-serif;
}
\`\`\`

## Typography

- Heading: ${industryTypography?.heading || archetype.typography.heading} — ${industryTypography?.description || archetype.typography.description}
- Body: ${industryTypography?.body || archetype.typography.body}
- Weight: ${industryTypography?.weight || 'bold'}
- Spacing: ${industryTypography?.spacing || 'normal'}

## Mode: ${isDarkMode ? 'Dark' : 'Light'}

${isDarkMode ? `- Page background: ${industryColorPalette?.bg || finalBg}
- Card surfaces: bg-white/5 with border-white/10 and backdrop-blur
- Text: White/light gray for contrast
- Shadows: Subtle ambient glow instead of drop shadows` : `- Page background: ${industryColorPalette?.bg || finalBg}
- Card surfaces: bg-white with subtle shadows
- Text: Dark gray for readability
- Borders: Light gray borders for definition`}

## Navigation

${navigation}

## Header Style: ${designSeed.headerStyle}

- Sticky header with backdrop-blur on scroll
- Logo on left, navigation on right
- Mobile: hamburger menu with slide-down animation
- Include phone number and WhatsApp button

## Hero Section

- Headline: "${siteConfig.hero?.headline || 'Premium Services in ' + siteConfig.city}"
- Subheadline: "${siteConfig.hero?.subheadline || ''}"
- Badge: "${siteConfig.hero?.badge || ''}"
- CTA: "${siteConfig.hero?.ctaText || 'Get a Free Quote'}"
${siteConfig.hero?.heroImageUrl ? `- Hero image: ${siteConfig.hero.heroImageUrl}` : '- Use stock image from Unsplash matching the industry'}

## Animation & Spacing

- Animation: ${industryAnimationGuidance || 'Smooth fade-ins, gentle parallax'}
- Spacing: ${industrySpacingGuidance || 'Comfortable sections (80-112px padding)'}

## Trust Signals

${industryTrustSignals.map(s => `- ${s}`).join('\n') || '- Client testimonials\n- Years of experience'}

## Conversion CTAs

${industryConversionCTAs.map(c => `- ${c}`).join('\n') || '- Contact Us\n- Get Started'}

## Imagery Direction

${industryImageryDirection || 'Professional, industry-appropriate imagery'}`

  // ============================================
  // FILE 4: Content Guide
  // ============================================
  const contentGuide = `# Content & Copywriting Guide

## Writing Style

- Direct, warm, conversational human voice
- Focus on concrete facts, not vague claims
- Include specific suburbs/towns served
- Use local references and landmarks
- Active voice, not passive
- Benefits over features
- Short, scannable paragraphs

## Banned Words & Phrases

These make every website look generic. NEVER use them:

- "delight", "delightful"
- "exceptional attention to detail"
- "unforgettable journey"
- "elevate", "elevate your"
- "tailored solutions"
- "seamless experience"
- "cutting-edge", "state-of-the-art"
- "world-class", "best-in-class"
- "innovative", "revolutionary", "game-changing"
- "passionate about"
- "committed to excellence"
- "goes above and beyond"
- "one-stop shop", "second to none"
- "dedicated team", "years of experience"
- "customer-centric", "results-driven"
- "turnkey solution", "synergy", "leverage"
- "holistic approach", "proven track record"
- "trusted partner" (show trust through testimonials instead)

## Instead, Use Specific Language

- BAD: "We're passionate about quality" → GOOD: "We bake fresh every morning at 4am"
- BAD: "Years of experience" → GOOD: "Serving Gauteng since 2012"
- BAD: "Exceptional attention to detail" → GOOD: "Every cake is hand-decorated by Lety"
- BAD: "Trusted partner" → GOOD: "Over 200 five-star Google reviews"

## Image Alt Text

- Every image MUST have descriptive alt text
- Include local context: "Custom three-tier chocolate birthday cake in Gauteng"
- Never leave alt text empty or generic

## Currency

- +27 (South Africa) → R (ZAR)
- +1 (USA) → $ (USD)
- +44 (UK) → £ (GBP)
- +61 (Australia) → A$ (AUD)

## Telephone Protocol

- Format: <a href="tel:+27834799732">083 479 9732</a>
- WhatsApp: https://wa.me/[clean_phone]?text=Hi%20[BusinessName]

## SEO Requirements

- Every page MUST have a canonical URL
- Twitter cards: summary_large_image
- OpenGraph: og:title, og:description, og:type, og:image
- Internal linking between service pages
- Descriptive anchor text (not "click here")

## Image Optimization

- Lazy loading for below-fold images
- Descriptive alt text with local context
- WebP format preferred

---

${services && services.length > 0 ? buildServiceInstructions(services, archetype) : `
## SERVICES

Generate relevant services for ${archetype.name} industry.
Use "${archetype.conversionCTAs[0] || 'Get a Quote'}" as primary CTA.
`}`

  // ============================================
  // FILE 5: Data Schemas
  // ============================================
  const dataSchemas = `# Data Schemas — Exact JSON Structure

## public/site-config.json

EVERY piece of copywriting on the website MUST be in this file.
Components read it via useSiteData() at runtime.

\`\`\`json
{
  "businessName": "${businessName}",
  "city": "${siteConfig.city}",
  "ownerName": "${siteConfig.ownerName}",
  "phone": "${normalizedPhone}",
  "email": "${contact?.email || ''}",
  "address": "${contact?.address || ''}",

  "hero": {
    "headline": "${siteConfig.hero?.headline || ''}",
    "subheadline": "${siteConfig.hero?.subheadline || ''}",
    "badge": "${siteConfig.hero?.badge || ''}",
    "ctaText": "${siteConfig.hero?.ctaText || 'Get a Free Quote'}",
    "ctaLink": "#contact",
    "heroImageUrl": "${siteConfig.hero?.heroImageUrl || ''}",
    "heroImageAlt": "Descriptive alt text"
  },

  "about": {
    "title": "Our Story",
    "tagline": "",
    "paragraph1": "First paragraph",
    "paragraph2": "Second paragraph",
    "paragraph3": "Third paragraph",
    "imageUrl": "",
    "imageAlt": "Descriptive alt text"
  },

  "pageContent": {
    "servicesTitle": "Our Services",
    "servicesDescription": "",
    "servicesCtaTitle": "",
    "servicesCtaText": "",
    "contactTitle": "Contact Us",
    "contactDescription": "",
    "portfolioTitle": "Our Work",
    "portfolioDescription": "",
    "testimonialsTitle": "What Our Customers Say",
    "testimonialsSubtitle": "Happy Clients",
    "faqTitle": "Frequently Asked Questions",
    "faqSubtitle": "Questions & Answers",
    "galleryTitle": "Our Work",
    "gallerySubtitle": "",
    "aboutTitle": "About Us",
    "aboutSubtitle": "",
    "ctaTitle": "",
    "ctaText": "",
    "pricingTitle": "Our Pricing",
    "pricingSubtitle": ""
  },

  "services": [
    { "title": "Service Name", "description": "Service description", "priceTag": "", "icon": "Star" }
  ],
  "testimonials": [
    { "name": "Client Name", "text": "Testimonial text", "rating": 5, "source": "Google", "photoUrl": "" }
  ],
  "faq": [
    { "question": "Question?", "answer": "Answer." }
  ],
  "pricing": [
    { "service": "Service Name", "price": "R0", "details": "" }
  ],
  "team": [
    { "name": "Name", "role": "Role", "bio": "", "imageUrl": "" }
  ],
  "businessHours": [
    { "dayOfWeek": "Monday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Tuesday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Wednesday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Thursday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Friday", "opens": "08:00", "closes": "17:00" },
    { "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" },
    { "dayOfWeek": "Sunday", "opens": "Closed", "closes": "Closed" }
  ],
  "socialLinks": {
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "linkedin": ""
  },
  "logoUrl": ""
}
\`\`\`

## public/image-map.json

\`\`\`json
{
  "businessName": "${businessName}",
  "totalImages": 0,
  "categories": {
    "Category Name": {
      "thumbnail": "https://images.unsplash.com/...",
      "images": [
        "https://images.unsplash.com/...",
        "https://images.unsplash.com/..."
      ]
    }
  }
}
\`\`\`

Each category MUST include a "thumbnail" field.

## public/seo.json

\`\`\`json
{
  "title": "${seo?.title || businessName + ' | ' + siteConfig.city}",
  "description": "${seo?.description || ''}",
  "keywords": ${JSON.stringify(seo?.keywords || [])},
  "openGraph": {
    "title": "${seo?.openGraph?.title || businessName}",
    "description": "${seo?.openGraph?.description || ''}",
    "type": "website"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "${seo?.twitter?.title || businessName}",
    "description": "${seo?.twitter?.description || ''}"
  },
  "jsonLd": ${JSON.stringify(seo?.jsonLd || { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: businessName, telephone: normalizedPhone }, null, 2)}
}
\`\`\`

## public/llms.txt — AUTO-GENERATED (do not create this file)

Served dynamically from site-config.json at /llms.txt and /llms-full.txt.
Ensure these site-config fields are complete so the generated summaries are rich:
- businessName, seo.description, city, history
- services[] (title + description)
- businessHours[]
- contact.phone / contact.email / contact.address
- geo.serviceAreas[]

## FAQPage Schema (add to FAQ section)

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text."
      }
    }
  ]
}
\`\`\``

  // ============================================
  // FILE 6: Visual Standards (PHASE 9 ENHANCED)
  // ============================================
  const visualStandards = `# Visual Standards

## Adaptive Surface Contrast

Do NOT use a single background color across all sections.
Alternate background tones between adjacent sections:
- Main content: Pure backgrounds (#FFFFFF or #FAFAFA)
- Secondary sections: Light tint (#F8FAFC, #F1F5F9, #F0FDF4)
- Use subtle borders or shadow differences between sections

## Card Geometry

- Creative/Youth/Tech: Maximum curvature (rounded-full / pill)
- Medical/Legal/Corporate: Balanced curvature (rounded-xl or rounded-2xl)
- Ensure text wrapping scales with curvature

## Typography Contrast

- Section Headings: letter-spacing -0.025em, font-bold, deep contrast (#111827)
- Body Text: line-height 1.6-1.75, dark-neutral (#374151)
- Consistent vertical rhythm

## Micro-Interactions

- All actionable cards: Subtle hover states
- Hover: translate-y-[-2px] + soft shadow
- Transition: 200-300ms ease-out
- No layout shift

## WCAG Contrast Guards

When header is transparent over hero:
- Dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- backdrop-blur-md for depth
- All nav text: minimum 4.5:1 contrast ratio
- On scroll: transition to solid background

## Image Treatment

- Hero images: Dark gradient overlay for text readability
- Gallery images: Subtle hover scale (1.05x) with overlay
- Service images: Consistent aspect ratios
- All images: Descriptive alt text

---

${buildTypographySection(
  industryTypography?.heading || archetype.typography.heading,
  industryTypography?.body || archetype.typography.body
)}

---

${buildResponsiveSpecifications()}

---

${buildAccessibilitySpecifications()}

---

${buildMicroInteractionSpecifications()}
`

  return {
    shortPrompt,
    technicalRules,
    designSystem,
    contentGuide,
    dataSchemas,
    visualStandards,
  }
}
