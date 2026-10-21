import { MasterSiteConfig, ScrapedData, GalleryItem, PageMediaGroup, FeatureFlags } from '@/types/site-config'
import { extractLogoColors, getFinalBrandPalette, ExtractedColors } from './color-extractor'

// Primary: MiMo Token Plan
const MIMO_API_URL = 'https://token-plan-sgp.xiaomimimo.com/v1/chat/completions'
const MIMO_API_KEY = 'tp-s5mjmff9x4qh31pudzb4k45ipyprkgxvmgeyhidxqo28ljg3'
const MIMO_MODEL = 'mimo-v2.5'

// Secondary: MiMo Prepaid (from env)
const MIMO_PREPAID_API_URL = process.env.MIMO_PREPAID_URL || 'https://api.xiaomimimo.com/v1/chat/completions'
const MIMO_PREPAID_API_KEY = process.env.MIMO_PREPAID_API_KEY || ''
const MIMO_PREPAID_MODEL = process.env.MIMO_PREPAID_MODEL || 'mimo-v2.5'

// Tertiary: OpenRouter Fallback
const FALLBACK_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free'

// UI/Tracking images to EXCLUDE from gallery
const UI_IMAGE_PATTERNS = [
  /default-skin/i, /pixel/i, /tracking/i, /spacer/i,
  /blank\.gif/i, /1x1\./i, /transparent\.gif/i,
  /spinner/i, /loading/i, /arrow.*\.png$/i,
  /icon.*\.png$/i, /button.*\.png$/i,
  /facebook.*icon/i, /twitter.*icon/i, /instagram.*icon/i,
  /linkedin.*icon/i, /youtube.*icon/i, /pinterest.*icon/i,
  /social.*icon/i, /share.*icon/i,
  /emoji.*svg$/i, /1f642/i, /1f600/i, /1f44d/i,
  /avatar/i, /gravatar/i,
  /woocommerce/i, /wp-content\/plugins/i,
  /google.*analytics/i, /gtm\.js/i, /fbq/i,
  /favicon/i, /apple-touch-icon/i,
]

function isUiOrTrackingImage(url: string): boolean {
  return UI_IMAGE_PATTERNS.some(pattern => pattern.test(url))
}

export interface CrmInput {
  businessName: string
  ownerName: string
  city: string
  whatsappNumber: string
  serviceAreas?: string[]
  features?: Partial<FeatureFlags>
  industry?: string
}

// ============================================
// Default Feature Flags
// ============================================
function getDefaultFeatures(): FeatureFlags {
  return {
    whatsappWidget: true,
    clickToCall: true,
    contactForm: true,
    googleMaps: false,
    businessHours: false,
    testimonials: false,
    faq: false,
    blog: false,
    teamProfiles: false,
    pricingTables: false,
    beforeAfterSlider: false,
    socialMediaLinks: false,
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

function buildSystemPrompt(): string {
  return `You are the world's elite website configuration architect. You generate MASTER-LEVEL site configurations that produce breathtaking, high-converting websites for South African businesses.

Your output MUST be a complete, production-ready site configuration that a Principal Frontend Engineer can use to build a stunning website without any guesswork.

CRITICAL REQUIREMENTS:
1. EXTRACT REAL DATA: Pull exact pricing (Rand values like R500, R1500, R5000), real business history, specific service descriptions from the scraped content. NEVER output generic template copy.
2. IMAGE DEDUPLICATION: Every imageUrl in gallery MUST be unique. Zero duplicates allowed.
3. LOGO SEPARATION: Logo URLs go ONLY to brandAssets.logoUrl and hero.logoUrl. NEVER use logos as hero.heroImageUrl or in service cards.
4. HERO IMAGE: Must be high-resolution photography (event, workspace, product shot) - NEVER a logo.
5. GALLERY: Populate with 8-15 DISTINCT work/portfolio photography URLs with meaningful captions.

LOGO SEPARATION RULE:
- brandAssets.logoUrl = extracted logo graphic
- hero.logoUrl = same logo graphic
- hero.heroImageUrl = HIGH-RES PHOTOGRAPHY (event, product, workspace, lifestyle)
- gallery[] = work/portfolio photography only

PALETTE EXTRACTION:
- Use programmatically extracted brand colors provided in context
- These are from actual logo analysis - prioritize over guesses
- Ensure sufficient contrast for WCAG AA compliance

THEME OPTIONS (select the BEST fit for the industry):
- Font Pairings: "DM-Sans-Playfair" (elegant), "Sora-Inter" (tech modern), "Outfit-Source" (clean), "Oswald-Roboto" (bold), "Inter-Plus" (versatile), "Playfair-Lato" (luxury), "Space-Grotesk-Inter" (contemporary)
- Style Presets: "editorial-luxe" (premium), "modern-clean" (minimalist), "soft-rounded" (friendly), "sharp-industrial" (bold), "bold-contrast" (dramatic), "minimal-elegant" (sophisticated)

FEATURE FLAGS (include instructions for enabled features):
When a feature is enabled in the config, you MUST include specific implementation instructions for that feature in your response.

JSON SCHEMA REQUIRED (respond with ONLY valid JSON):
{
  "businessName": "string",
  "city": "string",
  "ownerName": "string",
  "theme": {
    "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "bg": "#hex", "text": "#hex", "muted": "#hex" },
    "fontPairing": "one of the font pairing options",
    "stylePreset": "one of the style preset options"
  },
  "brandAssets": {
    "logoUrl": "extracted logo URL",
    "brandColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "bg": "#hex" }
  },
  "seo": {
    "title": "compelling SEO title with primary keyword, under 60 chars",
    "description": "meta description under 160 chars with call to action",
    "keywords": ["keyword1", "keyword2", ...],
    "openGraph": { "title": "string", "description": "string", "type": "website" },
    "twitter": { "card": "summary_large_image", "title": "string", "description": "string" },
    "jsonLd": { complete Schema.org LocalBusiness + FAQ + Service }
  },
  "hero": {
    "headline": "punchy, benefit-driven headline",
    "subheadline": "supporting value proposition",
    "heroImageUrl": "HIGH-RES PHOTOGRAPHY - NOT a logo",
    "logoUrl": "extracted logo URL",
    "badge": "trust element",
    "whatsappNumber": "SA format",
    "phone": "SA format",
    "ctaText": "primary call to action text",
    "ctaLink": "#contact or #services"
  },
  "services": [
    { "title": "string", "description": "detailed description", "icon": "lucide icon name", "realImageUrl": "string", "priceTag": "Rand pricing", "features": ["feature1", "feature2"] }
  ],
  "gallery": [
    { "imageUrl": "UNIQUE URL", "caption": "descriptive caption", "category": "category name" }
  ],
  "testimonials": [
    { "name": "client name", "text": "testimonial text", "rating": 5, "source": "Google/Facebook" }
  ],
  "faq": [
    { "question": "common question", "answer": "detailed answer" }
  ],
  "socialLinks": { "facebook": "url", "instagram": "url", ... },
  "contact": { "phone": "string", "whatsapp": "string", "email": "string", "address": "string" },
  "features": { ...all feature flags with boolean values... }
}

For JSON-LD, include:
- @context="https://schema.org"
- @type="LocalBusiness" with full address, geo coordinates, openingHours
- FAQPage schema with the faq array items
- Service schema for each service offering
- sameAs array for social media profiles

GEO OPTIMIZATION:
- Include areaServed in JSON-LD with all service areas
- Include geo coordinates if city is known
- Use local keywords in title and description

Respond with ONLY valid JSON. No markdown code blocks. No explanation.`
}

function buildUserPrompt(crmInput: CrmInput, scrapedData: ScrapedData | null, extractedColors: ExtractedColors | null, features: FeatureFlags): string {
  let prompt = `Generate a MASTER-LEVEL site configuration for: ${crmInput.businessName} located in ${crmInput.city}. Owner: ${crmInput.ownerName}. WhatsApp: ${crmInput.whatsappNumber}.`

  // Add service areas
  if (crmInput.serviceAreas && crmInput.serviceAreas.length > 0) {
    prompt += `\n\nSERVICE AREAS: ${crmInput.serviceAreas.join(', ')}`
    prompt += `\nInclude these areas in the GEO configuration and JSON-LD areaServed.`
  }

  // Add extracted brand colors
  if (extractedColors) {
    prompt += `\n\nEXTRACTED BRAND COLORS (use these exactly):\n`
    prompt += `Primary: ${extractedColors.primaryHex}\n`
    prompt += `Secondary: ${extractedColors.secondaryHex}\n`
    prompt += `Accent: ${extractedColors.accentHex}\n`
    prompt += `Background: ${extractedColors.bgHex}\n`
  }

  // Feature flags
  prompt += `\n\nENABLED FEATURES (build ALL of these into the website):`
  const enabledFeatures = Object.entries(features).filter(([, v]) => v === true).map(([k]) => k)
  prompt += `\n${enabledFeatures.join(', ')}`
  prompt += `\nFor each enabled feature, include specific implementation instructions in the config.`

  if (scrapedData) {
    prompt += `\n\nMULTI-PAGE SCRAPED CONTENT (${scrapedData.pagesScraped} pages scraped):\n`
    prompt += `${scrapedData.fullMarkdown.slice(0, 10000)}\n`

    if (scrapedData.pagesDetails && scrapedData.pagesDetails.length > 0) {
      prompt += `\n\nSCRAPED PAGES DETAILS (Use for page-level SEO and JSON-LD):\n`
      const prioritizedPages = [...scrapedData.pagesDetails].sort((a, b) => {
        const aHome = a.url === '/' || a.url.endsWith('/') || a.url.includes('contact') || a.url.includes('about') ? 1 : 0
        const bHome = b.url === '/' || b.url.endsWith('/') || b.url.includes('contact') || b.url.includes('about') ? 1 : 0
        return bHome - aHome
      }).slice(0, 20)

      for (const page of prioritizedPages) {
        prompt += `- Page URL: ${page.url}\n`
        prompt += `  Page Title: ${page.title}\n`
        prompt += `  Meta Description: ${page.metaDescription}\n`
        const isMainPage = page.url === '/' || page.url.endsWith('/') || page.url.includes('contact') || page.url.includes('about')
        if (isMainPage && page.jsonLd && page.jsonLd.length > 0) {
          prompt += `  JSON-LD found: ${JSON.stringify(page.jsonLd).slice(0, 3000)}\n`
        }
      }
    }

    // Filter out logos from image list
    const portfolioImages = scrapedData.imageList.filter(img => {
      const lower = img.toLowerCase()
      return !lower.includes('logo') && !lower.includes('brand') && !lower.includes('icon') && !lower.includes('default-skin')
    })
    const uniquePortfolioImages = Array.from(new Set(portfolioImages))

    prompt += `\n\nEXTRACTED ASSETS:\n`
    prompt += `Total Images: ${scrapedData.imageList.length}\n`
    prompt += `Unique Portfolio Images (for gallery): ${uniquePortfolioImages.length}\n`
    prompt += `Portfolio Image URLs (use for gallery - ALL must be unique): ${uniquePortfolioImages.slice(0, 20).join(', ')}\n`
    prompt += `Potential Logos (use for logoUrl only): ${scrapedData.potentialLogos.join(', ')}\n`
    prompt += `Contact Info: ${JSON.stringify(scrapedData.contactInfo)}\n`

    // Social links from scraped data
    const socialPatterns = {
      facebook: /facebook\.com\/[^\s"'<>]+/gi,
      instagram: /instagram\.com\/[^\s"'<>]+/gi,
      twitter: /twitter\.com\/[^\s"'<>]+/gi,
      linkedin: /linkedin\.com\/[^\s"'<>]+/gi,
    }
    const foundSocial: Record<string, string[]> = {}
    for (const [platform, pattern] of Object.entries(socialPatterns)) {
      const matches = scrapedData.fullMarkdown.match(pattern)
      if (matches) {
        foundSocial[platform] = Array.from(new Set(matches)).slice(0, 2)
      }
    }
    if (Object.keys(foundSocial).length > 0) {
      prompt += `\n\nSOCIAL MEDIA LINKS FOUND: ${JSON.stringify(foundSocial)}`
      prompt += `\nInclude these in the socialLinks config.`
    }

    prompt += `\n\nCRITICAL INSTRUCTIONS:`
    prompt += `\n- Extract actual pricing/packages from the markdown (Rand values like R500, R1500, R5000)`
    prompt += `\n- Assign logo URLs ONLY to brandAssets.logoUrl and hero.logoUrl`
    prompt += `\n- hero.heroImageUrl must be photography (not logo)`
    prompt += `\n- gallery must contain 8-15 DISTINCT/UNIQUE image URLs`
    prompt += `\n- NO DUPLICATES ALLOWED in gallery`
    prompt += `\n- Use extracted contact information where available`
    prompt += `\n- Use extracted brand colors for theme.palette and brandAssets.brandColors`
    prompt += `\n- Generate compelling, keyword-rich SEO title and meta description`
    prompt += `\n- Build comprehensive JSON-LD with LocalBusiness + FAQ + Service schemas`
    prompt += `\n- Create meaningful testimonials if not found in scraped data`
    prompt += `\n- Create relevant FAQ items based on the business type`
    prompt += `\n- Include GEO configuration with all service areas`
  }

  prompt += `\n\nRespond with ONLY valid JSON matching the schema. No markdown code blocks. No explanation. Pure JSON only.`

  return prompt
}

function generateSlug(businessName: string, city: string): string {
  const base = `${businessName}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}

// Simplified system prompt for retry (more likely to produce valid JSON)
function buildSimpleSystemPrompt(): string {
  return `You are a website configuration generator. Generate a JSON configuration for a business website.

RULES:
1. Output ONLY valid JSON - no markdown, no explanation
2. Use double quotes for all strings
3. No trailing commas
4. Include all required fields

JSON SCHEMA:
{
  "businessName": "string",
  "city": "string",
  "ownerName": "string",
  "theme": {
    "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "bg": "#hex" },
    "fontPairing": "Inter-Plus",
    "stylePreset": "modern-clean"
  },
  "brandAssets": { "logoUrl": "string", "brandColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "bg": "#hex" } },
  "seo": { "title": "string", "description": "string", "jsonLd": { "@context": "https://schema.org", "@type": "LocalBusiness", "name": "string" } },
  "hero": { "headline": "string", "subheadline": "string", "heroImageUrl": "string", "logoUrl": "string", "badge": "string", "whatsappNumber": "string", "phone": "string" },
  "services": [{ "title": "string", "description": "string", "icon": "string", "realImageUrl": "string" }],
  "gallery": [{ "imageUrl": "string", "caption": "string", "category": "string" }],
  "contact": { "phone": "string", "whatsapp": "string", "email": "string", "address": "string" }
}

Respond with ONLY the JSON object.`
}

// Simplified user prompt for retry
function buildSimpleUserPrompt(crmInput: CrmInput, scrapedData: ScrapedData | null, features: FeatureFlags): string {
  let prompt = `Generate website config for: ${crmInput.businessName} in ${crmInput.city}. Owner: ${crmInput.ownerName}. WhatsApp: ${crmInput.whatsappNumber}.`

  if (scrapedData?.imageList?.length) {
    const portfolioImages = scrapedData.imageList
      .filter(img => !img.toLowerCase().includes('logo') && !img.toLowerCase().includes('brand'))
      .slice(0, 15)

    prompt += `\n\nImages found: ${portfolioImages.length}`
    prompt += `\nUse these for gallery: ${portfolioImages.join(', ')}`
  }

  if (scrapedData?.potentialLogos?.length) {
    prompt += `\nLogo: ${scrapedData.potentialLogos[0]}`
  }

  prompt += `\n\nRespond with ONLY valid JSON.`
  return prompt
}

// ============================================
// Map URL paths to categories
// ============================================
function mapUrlToCategory(url: string): string {
  const lower = url.toLowerCase()

  if (lower.includes('family') || lower.includes('families')) return 'Families'
  if (lower.includes('baby') || lower.includes('newborn') || lower.includes('infant')) return 'Newborn Photography'
  if (lower.includes('wedding') || lower.includes('couple') || lower.includes('bride')) return 'Weddings'
  if (lower.includes('maternity') || lower.includes('pregnancy')) return 'Maternity'
  if (lower.includes('portrait') || lower.includes('headshot')) return 'Portraits'
  if (lower.includes('event') || lower.includes('corporate')) return 'Events'
  if (lower.includes('product') || lower.includes('commercial')) return 'Products'
  if (lower.includes('food') || lower.includes('restaurant')) return 'Food & Beverage'
  if (lower.includes('property') || lower.includes('real-estate')) return 'Properties'
  if (lower.includes('car') || lower.includes('auto')) return 'Automotive'

  return 'Portfolio'
}

function buildCategorizedGalleries(images: string[]): Record<string, GalleryItem[]> {
  const categories: Record<string, GalleryItem[]> = {}

  for (const imageUrl of images) {
    const category = mapUrlToCategory(imageUrl)
    if (!categories[category]) categories[category] = []

    const urlParts = imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1] || 'Image'
    const caption = filename.replace(/[-_]/g, ' ').replace(/\.\w+$/, '')

    categories[category].push({ imageUrl, caption, category })
  }

  return categories
}

function deduplicateGallery(gallery: GalleryItem[]): GalleryItem[] {
  const seen = new Set<string>()
  return gallery.filter(item => {
    if (seen.has(item.imageUrl)) return false
    seen.add(item.imageUrl)
    return true
  })
}

// ============================================
// JSON Repair Functions for LLM Output
// ============================================

export function fixMalformedJson(json: string): string {
  // Remove trailing commas before } or ]
  let fixed = json.replace(/,\s*([\]}])/g, '$1')

  // Remove single-line comments
  fixed = fixed.replace(/\/\/.*$/gm, '')

  // Remove multi-line comments
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '')

  // Fix broken strings - newlines inside quoted strings
  // This handles cases like: "https:\n  "brandColors"
  // by joining lines that are in the middle of a string value
  const lines = fixed.split('\n')
  const joinedLines: string[] = []
  let inString = false
  let currentLine = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (!inString) {
      // Check if this line starts a string that doesn't end
      const quoteCount = (line.match(/"/g) || []).length
      if (quoteCount % 2 !== 0) {
        // Odd number of quotes - we're entering or exiting a string
        inString = true
        currentLine = line
      } else {
        joinedLines.push(line)
      }
    } else {
      // We're inside a string - join this line
      currentLine += ' ' + line.trim()
      const quoteCount = (currentLine.match(/"/g) || []).length
      if (quoteCount % 2 === 0) {
        // Even quotes - string is complete
        inString = false
        joinedLines.push(currentLine)
        currentLine = ''
      }
    }
  }
  
  if (currentLine) {
    joinedLines.push(currentLine)
  }
  
  fixed = joinedLines.join('\n')

  // Fix specific pattern: "value:\n    "key" -> "value", "key"
  // This handles truncated URLs followed by next property
  fixed = fixed.replace(/("(?:https?)[^"]*?)\s*\n\s*("(?:[a-zA-Z])",?\s*:)/g, '$1", $2')

  // Fix unescaped newlines in any remaining strings
  fixed = fixed.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    return match.replace(/\n/g, ' ').replace(/\r/g, '')
  })

  // Fix single quotes to double quotes (basic)
  if (!fixed.includes('"') && fixed.includes("'")) {
    fixed = fixed.replace(/'/g, '"')
  }

  return fixed
}

export function recoverJson(json: string): string | null {
  try {
    // Try to find the last complete object by looking for balanced braces
    let braceCount = 0
    let lastValidEnd = -1

    for (let i = 0; i < json.length; i++) {
      if (json[i] === '{') braceCount++
      if (json[i] === '}') {
        braceCount--
        if (braceCount === 0) {
          lastValidEnd = i
        }
      }
    }

    // If we found a balanced JSON object, try to parse it
    if (lastValidEnd > 0) {
      const candidate = json.substring(0, lastValidEnd + 1)
      const fixed = fixMalformedJson(candidate)
      JSON.parse(fixed) // Test if it parses
      return fixed
    }

    // Try to close unclosed arrays and objects
    let attempt = json
    const openBraces = (attempt.match(/{/g) || []).length
    const closeBraces = (attempt.match(/}/g) || []).length
    const openBrackets = (attempt.match(/\[/g) || []).length
    const closeBrackets = (attempt.match(/]/g) || []).length

    // Close unclosed arrays
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      attempt += ']'
    }

    // Close unclosed objects
    for (let i = 0; i < openBraces - closeBraces; i++) {
      attempt += '}'
    }

    attempt = fixMalformedJson(attempt)
    JSON.parse(attempt) // Test if it parses
    return attempt
  } catch {
    return null
  }
}

// Last resort: extract partial config from broken JSON using regex
export function extractPartialConfig(json: string, crmInput: CrmInput): Partial<MasterSiteConfig> | null {
  try {
    const extract = (pattern: RegExp): string | null => {
      const match = json.match(pattern)
      return match ? match[1] : null
    }

    const extractArray = (pattern: RegExp): string[] => {
      const match = json.match(pattern)
      if (!match) return []
      return match[1].split(',').map(s => s.trim().replace(/"/g, ''))
    }

    // Extract basic fields
    const businessName = extract(/"businessName":\s*"([^"]+)"/) || crmInput.businessName
    const city = extract(/"city":\s*"([^"]+)"/) || crmInput.city
    const ownerName = extract(/"ownerName":\s*"([^"]+)"/) || crmInput.ownerName

    // Extract theme
    const primary = extract(/"primary":\s*"(#[0-9a-fA-F]{6})"/) || '#0ea5e9'
    const secondary = extract(/"secondary":\s*"(#[0-9a-fA-F]{6})"/) || '#6366f1'
    const accent = extract(/"accent":\s*"(#[0-9a-fA-F]{6})"/) || '#f59e0b'
    const bg = extract(/"bg":\s*"(#[0-9a-fA-F]{6})"/) || '#09090b'
    const fontPairing = extract(/"fontPairing":\s*"([^"]+)"/) || 'Inter-Plus'
    const stylePreset = extract(/"stylePreset":\s*"([^"]+)"/) || 'modern-clean'

    // Extract SEO
    const seoTitle = extract(/"title":\s*"([^"]+)"/) || `${businessName} | ${city}`
    const seoDescription = extract(/"description":\s*"([^"]+)"/) || `Professional services from ${businessName} in ${city}.`

    // Extract hero
    const headline = extract(/"headline":\s*"([^"]+)"/) || `Premium Services in ${city}`
    const subheadline = extract(/"subheadline":\s*"([^"]+)"/) || `Quality solutions by ${ownerName}`

    console.log(`[AI Engine] Extracted partial config: ${businessName}, ${city}, colors: ${primary}/${secondary}/${accent}`)

    return {
      businessName,
      city,
      ownerName,
      theme: {
        palette: { primary, secondary, accent, bg },
        fontPairing: fontPairing as any,
        stylePreset: stylePreset as any,
      },
      brandAssets: {
        logoUrl: '',
        brandColors: { primary, secondary, accent, bg },
      },
      seo: {
        title: seoTitle,
        description: seoDescription,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: businessName,
          description: seoDescription,
        },
      },
      hero: {
        headline,
        subheadline,
        heroImageUrl: '',
        logoUrl: '',
        badge: 'Professional Service',
        whatsappNumber: crmInput.whatsappNumber,
        phone: crmInput.whatsappNumber,
      },
      services: [],
      gallery: [],
      contact: {
        phone: crmInput.whatsappNumber,
        whatsapp: crmInput.whatsappNumber,
        email: '',
        address: city,
      },
    } as Partial<MasterSiteConfig>
  } catch {
    return null
  }
}

// ============================================
// Main AI Engine
// ============================================
export async function generateSiteConfig(
  crmInput: CrmInput,
  scrapedData: ScrapedData | null = null,
  existingWebsiteUrl?: string
): Promise<MasterSiteConfig> {
  const features = { ...getDefaultFeatures(), ...crmInput.features }

  console.log(`[AI Engine] Synthesizing multi-page context (${scrapedData?.pagesScraped || 0} pages scraped)...`)

  // Extract colors from logo
  let extractedColors: ExtractedColors | null = null
  let finalPalette: any = null

  if (scrapedData?.potentialLogos?.[0]) {
    try {
      extractedColors = await extractLogoColors(scrapedData.potentialLogos[0], existingWebsiteUrl)
      console.log(`[AI Engine] Extracted logo colors:`, extractedColors)
    } catch (error) {
      console.warn('[AI Engine] Color extraction failed, using fallback:', error)
    }
  }

  finalPalette = getFinalBrandPalette(extractedColors, scrapedData?.cssColors || null, crmInput.businessName)
  console.log(`[AI Engine] Final merged palette:`, finalPalette)

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(crmInput, scrapedData, extractedColors, features)

  let response
  let siteConfig: MasterSiteConfig
  let aiErrorMsg: string | undefined = undefined

  try {
    // Primary: MiMo Token Plan with retry logic
    let mimoTokenSuccess = false
    let attempts = 0
    const maxAttempts = 2

    while (!mimoTokenSuccess && attempts < maxAttempts) {
      attempts++
      try {
        // Use simpler prompt on retry
        const currentSystemPrompt = attempts === 1 ? systemPrompt : buildSimpleSystemPrompt()
        const currentUserPrompt = attempts === 1 ? userPrompt : buildSimpleUserPrompt(crmInput, scrapedData, features)

        console.log(`[AI Engine] [PRIMARY] Calling MiMo Token Plan (attempt ${attempts}/${maxAttempts})...`)
        if (attempts > 1) {
          console.log(`[AI Engine] Using simplified prompt for retry...`)
        }

        response = await fetch(MIMO_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MIMO_API_KEY}`,
          },
          body: JSON.stringify({
            model: MIMO_MODEL,
            messages: [
              { role: 'system', content: currentSystemPrompt },
              { role: 'user', content: currentUserPrompt },
            ],
            temperature: attempts === 1 ? 0.7 : 0.3, // Lower temperature on retry
            max_tokens: 8000,
          }),
        })

        if (!response.ok) {
          throw new Error(`MiMo Token Plan failed with status ${response.status}`)
        }

        // Check if response contains valid JSON
        const testData = await response.json()
        const testContent = testData.choices?.[0]?.message?.content || ''

        // Quick validation - check if it looks like JSON
        if (testContent.includes('{') && testContent.includes('}')) {
          mimoTokenSuccess = true
          console.log(`[AI Engine] ✓ MiMo Token Plan succeeded`)
          // Re-wrap as response for downstream processing
          response = new Response(JSON.stringify(testData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          console.warn(`[AI Engine] MiMo Token Plan response doesn't look like JSON, retrying...`)
        }
      } catch (error) {
        console.warn(`[AI Engine] MiMo Token Plan attempt ${attempts} failed:`, error)
        if (attempts >= maxAttempts) {
          console.warn('[AI Engine] MiMo Token Plan failed after all attempts, trying prepaid fallback...')
        }
      }
    }

    // Secondary Fallback: MiMo Prepaid if Token Plan failed
    if (!mimoTokenSuccess && MIMO_PREPAID_API_KEY) {
      try {
        console.log(`[AI Engine] [SECONDARY] Calling MiMo Prepaid (${MIMO_PREPAID_MODEL})...`)
        
        response = await fetch(MIMO_PREPAID_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MIMO_PREPAID_API_KEY}`,
          },
          body: JSON.stringify({
            model: MIMO_PREPAID_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 8000,
          }),
        })

        if (!response.ok) {
          throw new Error(`MiMo Prepaid failed with status ${response.status}`)
        }

        const testData = await response.json()
        const testContent = testData.choices?.[0]?.message?.content || ''

        if (testContent.includes('{') && testContent.includes('}')) {
          console.log(`[AI Engine] ✓ MiMo Prepaid succeeded`)
          mimoTokenSuccess = true // Set to true to skip OpenRouter
          response = new Response(JSON.stringify(testData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          console.warn(`[AI Engine] MiMo Prepaid response doesn't look like JSON, trying OpenRouter...`)
        }
      } catch (error) {
        console.warn('[AI Engine] MiMo Prepaid failed:', error)
        console.warn('[AI Engine] Trying OpenRouter as last resort...')
      }
    }

    // Tertiary Fallback: OpenRouter if both MiMo APIs failed
    if (!mimoTokenSuccess) {
      const fallbackKey = process.env.OPENROUTER_API_KEY
      if (fallbackKey) {
        console.log(`[AI Engine] [TERTIARY] Calling OpenRouter (${FALLBACK_MODEL})...`)
        
        response = await fetch(FALLBACK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fallbackKey}`,
            'HTTP-Referer': 'https://sitegeist.com',
            'X-Title': 'SiteSpire Website Builder',
          },
          body: JSON.stringify({
            model: FALLBACK_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 8000,
          }),
        })

        if (response.ok) {
          console.log(`[AI Engine] ✓ OpenRouter succeeded`)
        }
      } else {
        throw new Error('All AI APIs failed and no OpenRouter key available')
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response'
      throw new Error(`AI API error: ${response?.status || 'none'} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid AI response: no content returned')
    }

    let jsonContent = data.choices[0].message.content

    // Log raw response for debugging
    console.log(`[AI Engine] Raw response length: ${jsonContent.length} chars`)
    console.log(`[AI Engine] Raw response preview:`, jsonContent.substring(0, 500))

    // Strip markdown formatting
    jsonContent = jsonContent.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
    jsonContent = jsonContent.replace(/^```\s*/i, '').replace(/```$/i, '').trim()

    // Extract JSON object
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonContent = jsonMatch[0]
    }

    // Fix common JSON issues from LLMs
    jsonContent = fixMalformedJson(jsonContent)

    try {
      siteConfig = JSON.parse(jsonContent) as MasterSiteConfig
      console.log(`[AI Engine] Successfully parsed AI response with ${siteConfig.gallery?.length || 0} gallery items`)
    } catch (parseError) {
      const errMsg = parseError instanceof Error ? parseError.message : String(parseError)
      console.warn(`[AI Engine] First JSON parse failed: ${errMsg}`)
      console.warn(`[AI Engine] Attempting to fix JSON...`)
      
      // Try more aggressive recovery
      const recovered = recoverJson(jsonContent)
      if (recovered) {
        try {
          siteConfig = JSON.parse(recovered) as MasterSiteConfig
          console.log(`[AI Engine] JSON recovery successful`)
        } catch {
          // Last resort: try to extract partial data from broken JSON
          console.warn(`[AI Engine] JSON recovery failed, attempting partial extraction...`)
          const partial = extractPartialConfig(jsonContent, crmInput)
          if (partial) {
            siteConfig = partial as MasterSiteConfig
            console.log(`[AI Engine] Partial extraction successful - using recovered fields`)
          } else {
            throw parseError
          }
        }
      } else {
        // Last resort: try to extract partial data from broken JSON
        console.warn(`[AI Engine] JSON recovery failed, attempting partial extraction...`)
        const partial = extractPartialConfig(jsonContent, crmInput)
        if (partial) {
          siteConfig = partial as MasterSiteConfig
          console.log(`[AI Engine] Partial extraction successful - using recovered fields`)
        } else {
          throw parseError
        }
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[AI Engine] AI synthesis failed. Generating fallback config. Error:`, errorMsg)
    aiErrorMsg = `AI synthesis failed: ${errorMsg}. Local fallback config was generated.`

    siteConfig = generateFallbackSiteConfig(crmInput, scrapedData, finalPalette, features)
  }

  // Add metadata
  siteConfig.createdAt = new Date().toISOString()
  siteConfig.buildSlug = generateSlug(crmInput.businessName, crmInput.city)
  siteConfig.buildMode = 'TRIAL'
  if (aiErrorMsg) siteConfig.openRouterError = aiErrorMsg

  // Store provided industry if any
  if (crmInput.industry) {
    (siteConfig as any).industry = crmInput.industry
  }

  // Ensure required fields
  siteConfig.businessName = siteConfig.businessName || crmInput.businessName
  siteConfig.city = siteConfig.city || crmInput.city
  siteConfig.ownerName = siteConfig.ownerName || crmInput.ownerName
  siteConfig.features = features

  // Detect industry archetype for theme mode
  const fullTextContext = `${crmInput.businessName} ${siteConfig.seo?.title || ''} ${siteConfig.seo?.description || ''} ${(siteConfig.services || []).map(s => s.title + ' ' + s.description).join(' ')}`
  const isPhotography = /photograph|photo|studio|wedding|portrait|gallery|artist|creative/i.test(fullTextContext.toLowerCase())
  const isDarkIndustry = /restaurant|auto|mechanic|fitness|gym|saas|tech/i.test(fullTextContext.toLowerCase())

  // Determine correct background based on industry
  let finalBg = finalPalette.bg
  if (isPhotography) {
    // Photography ALWAYS gets light, warm background
    finalBg = '#FAF8F5' // Warm cream
  } else if (finalBg === '#09090b' || finalBg === 'transparent') {
    // Use industry-specific default
    finalBg = isDarkIndustry ? '#121212' : '#FFFFFF'
  }

  // Apply extracted + CSS merged colors
  siteConfig.theme = siteConfig.theme || { palette: {}, fontPairing: 'Inter-Plus', stylePreset: 'modern-clean' }
  siteConfig.theme.palette = {
    primary: finalPalette.primary,
    secondary: finalPalette.secondary,
    accent: finalPalette.accent,
    bg: finalBg,
    text: isDarkIndustry ? '#f5f5f5' : '#1a1a1a',
    muted: isDarkIndustry ? '#9ca3af' : '#6b7280',
  }

  siteConfig.brandAssets = siteConfig.brandAssets || { brandColors: {} }
  siteConfig.brandAssets.brandColors = {
    primary: finalPalette.primary,
    secondary: finalPalette.secondary,
    accent: finalPalette.accent,
    bg: finalBg,
  }

  // Logo from scraped data — never overwrite a client-uploaded logo.
  // Precedence contract: uploaded > scraped > generated.
  if (siteConfig.brandAssets?.logoSource === 'uploaded') {
    console.log(`[AI Engine] Logo source is 'uploaded' (${siteConfig.brandAssets.logoName || 'client file'}) — discarding scraped logo candidates.`)
  } else if (scrapedData?.potentialLogos?.[0]) {
    siteConfig.brandAssets.logoUrl = scrapedData.potentialLogos[0]
    siteConfig.brandAssets.logoSource = siteConfig.brandAssets.logoSource || 'scraped'
    siteConfig.hero = siteConfig.hero || {}
    siteConfig.hero.logoUrl = scrapedData.potentialLogos[0]
  }

  // Gallery deduplication and expansion
  if (siteConfig.gallery && siteConfig.gallery.length > 0) {
    const uniqueGallery = deduplicateGallery(siteConfig.gallery)
    console.log(`[AI Engine] Gallery: ${siteConfig.gallery.length} items → ${uniqueGallery.length} unique after dedup`)
    siteConfig.gallery = uniqueGallery
  }

  // If scraped data has more images than gallery, add them
  if (scrapedData?.imageList?.length) {
    const existingUrls = new Set(siteConfig.gallery?.map(g => g.imageUrl) || [])
    const remainingImages = scrapedData.imageList.filter(img =>
      !existingUrls.has(img) &&
      !isUiOrTrackingImage(img) &&
      !img.toLowerCase().includes('logo') &&
      !img.toLowerCase().includes('brand') &&
      !img.toLowerCase().includes('icon') &&
      !img.toLowerCase().includes('default-skin')
    )

    if (remainingImages.length > 0) {
      const additionalGallery = remainingImages.map((img, i) => ({
        imageUrl: img,
        caption: `Portfolio Image ${i + 1}`,
        category: 'Portfolio',
      }))

      siteConfig.gallery = [...(siteConfig.gallery || []), ...additionalGallery]
      console.log(`[AI Engine] Gallery expanded: ${existingUrls.size} AI + ${additionalGallery.length} scraped = ${siteConfig.gallery.length} total`)
    }
  }

  // Contact WhatsApp
  if (siteConfig.contact) {
    siteConfig.contact.whatsapp = crmInput.whatsappNumber
    if (!siteConfig.hero?.whatsappNumber) {
      siteConfig.hero = siteConfig.hero || {}
      siteConfig.hero.whatsappNumber = crmInput.whatsappNumber
    }
  }

  // GEO config
  if (crmInput.serviceAreas && crmInput.serviceAreas.length > 0) {
    siteConfig.geo = {
      serviceAreas: crmInput.serviceAreas,
      region: crmInput.city,
    }
  }

  // Legacy URLs
  if (scrapedData?.pagesDiscovered?.length) {
    siteConfig.legacyUrls = {
      discovered: scrapedData.pagesDiscovered,
      scraped: scrapedData.pagesDiscovered.slice(0, scrapedData.pagesScraped),
    }
  }

  // Categorized galleries
  if (scrapedData?.allDiscoveredImages?.length) {
    siteConfig.categorizedGalleries = buildCategorizedGalleries(scrapedData.allDiscoveredImages)
  }

  // Analytics
  if (scrapedData?.analytics) {
    siteConfig.analytics = {
      ga4MeasurementId: scrapedData.analytics.ga4MeasurementId,
      googleTagManagerId: scrapedData.analytics.googleTagManagerId,
      facebookPixelId: scrapedData.analytics.facebookPixelId,
    }
  }

  // Page media map
  if (scrapedData?.pagesDetails) {
    siteConfig.pageMediaMap = scrapedData.pagesDetails.map(page => ({
      pageUrl: page.url,
      pageSlug: getPageSlug(page.url),
      title: page.title || 'Untitled Page',
      images: page.images || [],
    }))
  }

  return siteConfig
}

function getPageSlug(urlStr: string): string {
  try {
    const urlObj = new URL(urlStr)
    let slug = urlObj.pathname.trim().replace(/^\/|\/$/g, '').replace(/\//g, '-')
    if (!slug) return 'home'
    return slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  } catch {
    return 'page'
  }
}

// ============================================
// Fallback Config Generator
// ============================================
function generateFallbackSiteConfig(
  crmInput: CrmInput,
  scrapedData: ScrapedData | null,
  finalPalette: any,
  features: FeatureFlags
): MasterSiteConfig {
  const buildSlug = generateSlug(crmInput.businessName, crmInput.city)
  const logoUrl = scrapedData?.potentialLogos?.[0] || '/assets/placeholder.svg'

  const services = scrapedData?.pagesDetails
    ?.filter(p => p.url.includes('service') || p.url.includes('product'))
    .slice(0, 4)
    .map(p => ({
      title: p.title || 'Service Offering',
      description: p.metaDescription || 'Quality service tailored to client requirements.',
      icon: 'Shield',
      realImageUrl: p.images?.[0] || '',
    })) || []

  if (services.length === 0) {
    services.push(
      { title: 'Service One', description: 'Professional service tailored to your needs.', icon: 'Settings', realImageUrl: '' },
      { title: 'Service Two', description: 'Quality delivery with attention to detail.', icon: 'Hammer', realImageUrl: '' }
    )
  }

  const portfolioImages = scrapedData?.imageList.filter(img => {
    const lower = img.toLowerCase()
    return !lower.includes('logo') && !lower.includes('brand') && !lower.includes('icon') && !lower.includes('default-skin')
  }) || []
  const uniqueImages = Array.from(new Set(portfolioImages))
  const gallery = uniqueImages.slice(0, 12).map((img, i) => ({
    imageUrl: img,
    caption: `Portfolio Showcase Item ${i + 1}`,
    category: 'Work',
  }))

  return {
    businessName: crmInput.businessName,
    city: crmInput.city,
    ownerName: crmInput.ownerName,
    theme: {
      palette: finalPalette,
      fontPairing: 'Inter-Plus',
      stylePreset: 'modern-clean',
    },
    brandAssets: {
      logoUrl,
      brandColors: finalPalette,
    },
    features,
    seo: {
      title: `${crmInput.businessName} | Professional Services in ${crmInput.city}`,
      description: `Get premium services from ${crmInput.businessName} in ${crmInput.city}. Contact us today for a free quote.`,
      keywords: [crmInput.businessName, crmInput.city, 'services', 'professional'],
      openGraph: {
        title: `${crmInput.businessName} | Professional Services in ${crmInput.city}`,
        description: `Get premium services from ${crmInput.businessName} in ${crmInput.city}.`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${crmInput.businessName} | Professional Services in ${crmInput.city}`,
        description: `Get premium services from ${crmInput.businessName} in ${crmInput.city}.`,
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: crmInput.businessName,
        description: `${crmInput.businessName} in ${crmInput.city}.`,
        telephone: crmInput.whatsappNumber,
        address: {
          '@type': 'PostalAddress',
          addressLocality: crmInput.city,
          addressCountry: 'ZA',
        },
      },
    },
    geo: crmInput.serviceAreas ? {
      serviceAreas: crmInput.serviceAreas,
      region: crmInput.city,
    } : undefined,
    hero: {
      headline: `Premium Services in ${crmInput.city}`,
      subheadline: `Quality solutions delivered by ${crmInput.ownerName}.`,
      heroImageUrl: uniqueImages[0] || '/assets/placeholder.svg',
      logoUrl,
      badge: 'Professional Service',
      whatsappNumber: crmInput.whatsappNumber,
      phone: crmInput.whatsappNumber,
      ctaText: 'Get a Free Quote',
      ctaLink: '#contact',
    },
    services,
    gallery,
    testimonials: [
      { name: 'Happy Client', text: 'Excellent service and professional team. Highly recommended!', rating: 5 },
    ],
    faq: [
      { question: 'What services do you offer?', answer: 'We offer a range of professional services tailored to your needs.' },
      { question: 'How can I get a quote?', answer: 'Contact us via WhatsApp or the contact form for a free quote.' },
    ],
    contact: {
      phone: crmInput.whatsappNumber,
      whatsapp: crmInput.whatsappNumber,
      email: scrapedData?.contactInfo?.email || 'info@domain.com',
      address: scrapedData?.contactInfo?.address || crmInput.city,
    },
    createdAt: new Date().toISOString(),
    buildSlug,
    buildMode: 'TRIAL',
    pageMediaMap: [],
    legacyUrls: { discovered: [], scraped: [] },
  }
}
