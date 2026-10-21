/**
 * Hybrid AI Engine
 * 
 * Architecture:
 * 1. Deterministic Data Extraction (no AI)
 * 2. AI Copywriter Pass (creative content only)
 * 3. Deterministic JSON Assembly (no AI)
 * 
 * This eliminates JSON parsing failures while keeping creative AI writing.
 */

import { MasterSiteConfig, ScrapedData, FeatureFlags, IndustryArchetype, GalleryItem } from '@/types/site-config'
import { toMapEmbedUrl } from '@/lib/utils'

// ============================================
// STEP 1: Deterministic Data Extraction
// ============================================

export interface HardFacts {
  businessName: string
  ownerName: string
  city: string
  whatsappNumber: string
  normalizedPhone: string
  email: string
  address: string
  industry: string
  serviceAreas: string[]
  
  // Extracted from scraping
  logoUrl: string
  heroImageUrl: string
  allImages: string[]
  imagesByPage: Map<string, string[]>
  imagesByCategory: Map<string, string[]>
  
  // Social proof
  googleRating?: number
  googleReviewCount?: number
  googleReviews: Array<{ author: string; text: string; rating: number; date: string }>
  
  // Business info
  businessHours: Array<{ dayOfWeek: string; opens: string; closes: string }>
  services: Array<{ title: string; description: string; price?: string; icon: string; imageUrl?: string }>
  
  // Team/Doctors
  teamMembers: Array<{ name: string; role: string; bio?: string }>
  
  // Blog posts
  blogPosts: Array<{ title: string; excerpt: string; date?: string; images: string[]; url: string }>
  
  // Unique elements
  motto: string
  history: string
  hasWhatsApp: boolean
  locations: Array<{ name: string; address: string; phone?: string }>
  
  // Pricing
  pricing: Array<{ service: string; price: string; details?: string }>
  
  // Social links (extracted from website)
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; pinterest?: string }
  
  // Brand
  primaryColor: string
  secondaryColor: string
  accentColor: string
  bgColor: string
  
  // Features
  features: FeatureFlags
  
  // URLs
  websiteUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  googleMapsUrl?: string

  // User-provided context
  businessBackground?: string
  phoneNumber?: string
  specificServices?: string
  tagline?: string
  specificTestimonials?: string
  specificImageUrls?: string[]

  // Enhanced scraped data
  faqs?: Array<{ question: string; answer: string }>
  videos?: Array<{ url: string; type: string; thumbnail?: string }>
  mapEmbedUrl?: string | null
}

// Extract FAQs from markdown as fallback
function extractFAQFromMarkdown(markdown: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []
  // Pattern: Q: question \n A: answer
  const qaPattern = /(?:Q|Question)\s*[:]\s*(.+?)\s*\n\s*(?:A|Answer)\s*[:]\s*(.+?)(?=\n\s*(?:Q|Question)|$)/gis
  let match
  while ((match = qaPattern.exec(markdown)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim()
    if (question.length > 5 && answer.length > 10) {
      faqs.push({ question, answer })
    }
  }
  return faqs.slice(0, 20)
}

export function extractHardFacts(
  crmInput: {
    businessName: string
    ownerName?: string
    city: string
    whatsappNumber: string
    existingWebsiteUrl?: string
    facebookUrl?: string
    instagramUrl?: string
    googleMapsUrl?: string
    industry?: string
    serviceAreas?: string[]
    features?: Partial<FeatureFlags>
    businessBackground?: string
    email?: string
    phoneNumber?: string
    specificServices?: string
    tagline?: string
    specificTestimonials?: string
    specificImageUrls?: string
  },
  scrapedData: ScrapedData | null,
  extractedColors: { primary: string; secondary: string; accent: string; bg: string },
  googleData?: {
    rating?: number
    reviewCount?: number
    reviews?: Array<{ author: string; text: string; rating: number; date: string }>
    hours?: Array<{ day: string; opens: string; closes: string }>
    photos?: string[]
  }
): HardFacts {
  const phone = crmInput.whatsappNumber.replace(/[^0-9]/g, '')
  const normalizedPhone = phone.startsWith('0') ? '27' + phone.slice(1) : phone

  // Extract images by page context
  const imagesByPage = new Map<string, string[]>()
  const imagesByCategory = new Map<string, string[]>()
  const allImages: string[] = []

  if (scrapedData?.pagesDetails) {
    for (const page of scrapedData.pagesDetails) {
      const pageImages = page.images.filter(img => 
        !isUiImage(img) && !isLogoImage(img)
      )
      imagesByPage.set(page.url, pageImages)
      allImages.push(...pageImages)

      // Categorize by URL path (only for actual gallery pages)
      const category = categorizeByUrl(page.url)
      if (category !== null) {
        if (!imagesByCategory.has(category)) {
          imagesByCategory.set(category, [])
        }
        imagesByCategory.get(category)!.push(...pageImages)
      }
    }
  }

  // Add social media images to a separate category
  if (scrapedData?.imageList) {
    const socialImages = scrapedData.imageList.filter(img => 
      !allImages.includes(img) && !isUiImage(img) && !isLogoImage(img)
    )
    if (socialImages.length > 0) {
      imagesByCategory.set('Social Gallery', socialImages)
      allImages.push(...socialImages)
    }
  }

  // Extract services from scraped data
  const services = extractServices(scrapedData, crmInput.industry)

  // Extract business hours - ensure consistent format
  const businessHours = (googleData?.hours || extractBusinessHours(scrapedData)).map(h => ({
    dayOfWeek: (h as any).dayOfWeek || (h as any).day || 'Monday',
    opens: h.opens,
    closes: h.closes,
  }))

  // Determine industry
  const industry = crmInput.industry || detectIndustryFromData(
    crmInput.businessName,
    scrapedData?.title,
    scrapedData?.fullMarkdown?.slice(0, 500),
    services
  )

  // Extract actual addresses from website content
  const addresses = extractAddresses(scrapedData?.fullMarkdown || '')
  const primaryAddress = addresses[0] || scrapedData?.contactInfo?.address || crmInput.city

  // Detect "no WhatsApp" from content
  const hasWhatsApp = detectWhatsAppAvailability(scrapedData?.fullMarkdown || '')

  // Extract team members/doctors
  const teamMembers = extractTeamMembers(scrapedData?.fullMarkdown || '')

  // Extract motto/tagline
  const motto = extractMotto(scrapedData?.fullMarkdown || '')

  // Extract history
  const history = extractHistory(scrapedData?.fullMarkdown || '')

  // Extract pricing from content
  const pricing = extractPricing(scrapedData?.fullMarkdown || '')

  // Extract social media links from content
  const socialLinks = extractSocialLinks(scrapedData?.fullMarkdown || '')

  // Extract blog posts from pages
  const blogPosts = extractBlogPosts(scrapedData?.pagesDetails)

  // Extract FAQs — prioritize scraper's structured extraction (JSON-LD + HTML)
  const scrapedFaqs = scrapedData?.faqs || []
  const existingFaqs = extractFAQFromMarkdown(scrapedData?.fullMarkdown || '')
  const faqs = scrapedFaqs.length > 0 ? scrapedFaqs : existingFaqs

  // Extract videos from scraper
  const videos = scrapedData?.videos || []

  // Map embed URL — CRM Maps URL is the source of truth (from Excel/GeistTrack),
  // scraped embed as fallback. Convert any Google Maps link to embeddable form.
  const mapEmbedUrl = toMapEmbedUrl({
    url: scrapedData?.mapEmbedUrl || crmInput.googleMapsUrl || null,
    address: primaryAddress,
  }) || null

  // Merge structured data team with existing extraction
  const structuredTeam = scrapedData?.structuredData?.team || []
  const mergedTeamMembers = teamMembers.length > 0
    ? teamMembers
    : (structuredTeam.length > 0 ? structuredTeam.map(t => ({ name: t.name, role: t.role, bio: '' })) : [])

  return {
    businessName: crmInput.businessName,
    ownerName: crmInput.ownerName || '',
    city: crmInput.city,
    whatsappNumber: crmInput.whatsappNumber,
    normalizedPhone,
    email: crmInput.email || scrapedData?.contactInfo?.email || '',
    address: primaryAddress,
    industry,
    serviceAreas: crmInput.serviceAreas || [],
    
    logoUrl: scrapedData?.potentialLogos?.[0] || '',
    heroImageUrl: findHeroImage(scrapedData),
    allImages: Array.from(new Set(allImages)),
    imagesByPage,
    imagesByCategory,
    
    googleRating: googleData?.rating,
    googleReviewCount: googleData?.reviewCount,
    googleReviews: googleData?.reviews || [],
    
    businessHours,
    services,
    
    teamMembers: mergedTeamMembers,
    blogPosts,
    motto,
    history,
    hasWhatsApp,
    locations: addresses.map(addr => ({ name: crmInput.city, address: addr })),
    pricing,
    socialLinks,
    
    primaryColor: extractedColors.primary,
    secondaryColor: extractedColors.secondary,
    accentColor: extractedColors.accent,
    bgColor: extractedColors.bg,
    
    features: { ...getDefaultFeatures(), ...crmInput.features },
    
    websiteUrl: crmInput.existingWebsiteUrl,
    facebookUrl: socialLinks.facebook || crmInput.facebookUrl,
    instagramUrl: socialLinks.instagram || crmInput.instagramUrl,
    googleMapsUrl: crmInput.googleMapsUrl,

    // User-provided context
    businessBackground: crmInput.businessBackground,
    phoneNumber: crmInput.phoneNumber,
    specificServices: crmInput.specificServices,
    tagline: crmInput.tagline,
    specificTestimonials: crmInput.specificTestimonials,
    specificImageUrls: crmInput.specificImageUrls ? crmInput.specificImageUrls.split('\n').map(u => u.trim()).filter(Boolean) : undefined,

    // Enhanced scraped data
    faqs,
    videos,
    mapEmbedUrl,
  }
}

// Extract social media links from content
function extractSocialMediaLinks(
  content: string,
  providedFacebook?: string,
  providedInstagram?: string
): { facebook?: string; instagram?: string; twitter?: string; pinterest?: string } {
  const links: Record<string, string> = {}
  
  // Facebook patterns
  const fbMatch = content.match(/(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)/i)
  if (fbMatch) links.facebook = `https://www.facebook.com/${fbMatch[1]}`
  
  // Instagram patterns
  const igMatch = content.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i)
  if (igMatch) links.instagram = `https://www.instagram.com/${igMatch[1]}`
  
  // Twitter patterns
  const twMatch = content.match(/twitter\.com\/([a-zA-Z0-9_]+)/i)
  if (twMatch) links.twitter = `https://www.twitter.com/${twMatch[1]}`
  
  // Pinterest patterns
  const pinMatch = content.match(/pinterest\.com\/([a-zA-Z0-9_]+)/i)
  if (pinMatch) links.pinterest = `https://www.pinterest.com/${pinMatch[1]}`
  
  // Use provided URLs as fallback
  if (!links.facebook && providedFacebook) links.facebook = providedFacebook
  if (!links.instagram && providedInstagram) links.instagram = providedInstagram
  
  return links
}

// Extract actual addresses from website content - STRICT VALIDATION
function extractAddresses(content: string): string[] {
  const addresses: string[] = []
  
  // Street identifiers that MUST be present in a valid address
  const streetIdentifiers = [
    /street|st\b/i, /avenue|ave\b/i, /road|rd\b/i, /drive|dr\b/i,
    /boulevard|blvd/i, /lane|ln\b/i, /way\b/i, /court|ct\b/i,
    /place|pl\b/i, /circle|cir\b/i, /close|cl\b/i, /crescent/i,
  ]
  
  // Words that indicate NOT an address (historical/narrative text)
  const rejectWords = [
    /moved|distinctions|degree|studied|founded|established/i,
    /qualified|graduated|awarded|passion|grew up/i,
    /history|story|about|welcome|introduction/i,
    /afternoon|morning|evening|perfect|look out/i,
    /winter|summer|spring|autumn|sun|weather/i,
    /photo|shoot|portrait|session|camera/i,
  ]
  
  // Address patterns - more strict
  const addressPatterns = [
    // Full address with postal code and country
    /(\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*South Africa,?\s*\d{4})/gi,
    // Address with street identifier and postal code
    /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct)[^,\n]*,\s*\d{4}[^,\n]*)/gi,
    // Address after "Address:" label (only if starts with number)
    /(?:Address|Visit us|Location):\s*\n?(\d+\s+[^\n]{10,80})/gi,
  ]
  
  for (const pattern of addressPatterns) {
    const matches = content.match(pattern) || []
    for (const match of matches) {
      const cleaned = match.replace(/^(Address|Visit us|Location):\s*/i, '').trim()
      
      // VALIDATION CHECKS:
      // 1. Must be reasonable length
      if (cleaned.length < 10 || cleaned.length > 150) continue
      
      // 2. Must start with a number (street address)
      if (!/^\d/.test(cleaned)) continue
      
      // 3. Must contain a street identifier OR postal code
      const hasStreetId = streetIdentifiers.some(p => p.test(cleaned))
      const hasPostalCode = /\d{4}/.test(cleaned)
      if (!hasStreetId && !hasPostalCode) continue
      
      // 4. Must NOT contain narrative/historical words
      const hasRejectWord = rejectWords.some(p => p.test(cleaned))
      if (hasRejectWord) continue
      
      // 5. Must not already be in the list
      if (!addresses.includes(cleaned)) {
        addresses.push(cleaned)
      }
    }
  }
  
  return addresses
}

// Extract pricing from content - works for ANY industry
function extractPricing(content: string): Array<{ service: string; price: string; details?: string }> {
  const pricing: Array<{ service: string; price: string; details?: string }> = []
  
  // Price patterns: R1500, R1,500, R 1500, From R500, etc.
  const pricePatterns = [
    // "Service Name - R1500" or "Service Name: R1500"
    /([A-Za-z\s]+(?:Package|Plan|Session|Service|Basic|Famous|Ultimate|Premium)?)\s*[-:]\s*R\s?(\d[\d,]*(?:\.\d{2})?)/gi,
    // "R1500 - Service Name"
    /R\s?(\d[\d,]*(?:\.\d{2})?)\s*[-:]\s*([A-Za-z\s]+)/gi,
    // "Service Name R1500"
    /([A-Za-z\s]{5,30})\s+R\s?(\d[\d,]*(?:\.\d{2})?)/gi,
  ]
  
  for (const pattern of pricePatterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const service = (match[1] || match[2] || '').trim()
      const price = `R${match[2] || match[1]}`
      
      if (service.length > 2 && service.length < 50) {
        pricing.push({ service, price })
      }
    }
  }
  
  return pricing.slice(0, 20) // Limit to 20 pricing items
}

// Extract social media links from footer/header - works for ANY website
function extractSocialLinks(content: string): { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; pinterest?: string } {
  const links: Record<string, string> = {}
  
  // Facebook patterns
  const fbPatterns = [
    /(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)/i,
    /href="[^"]*facebook\.com\/([^"]+)"/i,
  ]
  for (const pattern of fbPatterns) {
    const match = content.match(pattern)
    if (match) {
      links.facebook = `https://www.facebook.com/${match[1]}`
      break
    }
  }
  
  // Instagram patterns
  const igPatterns = [
    /instagram\.com\/([a-zA-Z0-9_.]+)/i,
    /href="[^"]*instagram\.com\/([^"]+)"/i,
  ]
  for (const pattern of igPatterns) {
    const match = content.match(pattern)
    if (match) {
      links.instagram = `https://www.instagram.com/${match[1]}`
      break
    }
  }
  
  // Twitter patterns
  const twPatterns = [
    /twitter\.com\/([a-zA-Z0-9_]+)/i,
    /x\.com\/([a-zA-Z0-9_]+)/i,
  ]
  for (const pattern of twPatterns) {
    const match = content.match(pattern)
    if (match) {
      links.twitter = `https://www.twitter.com/${match[1]}`
      break
    }
  }
  
  // LinkedIn patterns
  const liPatterns = [
    /linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)/i,
  ]
  for (const pattern of liPatterns) {
    const match = content.match(pattern)
    if (match) {
      links.linkedin = `https://www.linkedin.com/in/${match[1]}`
      break
    }
  }
  
  // YouTube patterns
  const ytPatterns = [
    /youtube\.com\/(?:c\/|channel\/|@)([a-zA-Z0-9_-]+)/i,
  ]
  for (const pattern of ytPatterns) {
    const match = content.match(pattern)
    if (match) {
      links.youtube = `https://www.youtube.com/@${match[1]}`
      break
    }
  }
  
  // Pinterest patterns
  const pinPatterns = [
    /pinterest\.com\/([a-zA-Z0-9_]+)/i,
  ]
  for (const pattern of pinPatterns) {
    const match = content.match(pattern)
    if (match) {
      links.pinterest = `https://www.pinterest.com/${match[1]}`
      break
    }
  }
  
  return links
}

// Detect if WhatsApp is available
function detectWhatsAppAvailability(content: string): boolean {
  const noWhatsAppPatterns = [
    /no\s+whatsapp/i,
    /calls?\s+only/i,
    /no\s+sms/i,
    /no\s+whatsapp\s+or\s+sms/i,
    /phone\s+calls?\s+only/i,
  ]
  
  for (const pattern of noWhatsAppPatterns) {
    if (pattern.test(content)) {
      return false
    }
  }
  
  return true
}

// ============================================
// INDUSTRY-AGNOSTIC EXTRACTION FUNCTIONS
// These work for ANY website, ANY industry
// ============================================

// Extract team members from content - works for ANY business
function extractTeamMembers(content: string): Array<{ name: string; role: string; bio?: string }> {
  const members: Array<{ name: string; role: string; bio?: string }> = []
  const seenNames = new Set<string>()
  
  // PATTERN 1: "About Name" or "Meet Name" sections with bios
  const aboutPatterns = [
    /(?:About|Meet)\s+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n([\s\S]*?)(?=(?:About|Meet)\s+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)|$)/gi,
    /(?:About|Meet)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n([\s\S]*?)(?=(?:About|Meet)|$)/gi,
  ]
  
  for (const pattern of aboutPatterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1].trim()
      const bio = match[2].trim().substring(0, 300)
      if (name.length > 3 && !seenNames.has(name)) {
        seenNames.add(name)
        members.push({ name, role: '', bio })
      }
    }
  }
  
  // PATTERN 2: "Name - Role" or "Name, Role" format
  const rolePatterns = [
    /(?:^|\n)\s*(?:[-•*]\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[-–,]\s*([A-Z][a-z][^\n]{5,40})/gm,
    /(?:Founder|Owner|CEO|Director|Manager|Chef|Chef|Barber|Stylist|Therapist|Trainer|Coach)\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
  ]
  
  for (const pattern of rolePatterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1].trim()
      const role = match[2]?.trim() || ''
      if (name.length > 3 && !seenNames.has(name)) {
        seenNames.add(name)
        members.push({ name, role, bio: '' })
      }
    }
  }
  
  // PATTERN 3: Title case names that appear multiple times (likely team members)
  const namePattern = /(?:^|\n)\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\s*(?:\n|$)/gm
  const nameCounts = new Map<string, number>()
  let match
  while ((match = namePattern.exec(content)) !== null) {
    const name = match[1].trim()
    if (name.length > 4 && name.length < 30) {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1)
    }
  }
  
  // Names that appear 2+ times are likely team members
  for (const [name, count] of Array.from(nameCounts.entries())) {
    if (count >= 2 && !seenNames.has(name)) {
      seenNames.add(name)
      members.push({ name, role: '', bio: '' })
    }
  }
  
  // Clean markdown formatting from all members
  const stripMarkdown = (text: string) => text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '').trim()
  
  return members.map(m => ({
    ...m,
    name: stripMarkdown(m.name),
    role: stripMarkdown(m.role),
    bio: m.bio ? stripMarkdown(m.bio) : m.bio,
  })).filter(m => m.name.length > 2 && !m.name.match(/^\d+$/)) // Filter out short names and numbers
}

// Extract motto/tagline - works for ANY business
function extractMotto(content: string): string {
  // Look for common motto/tagline patterns
  const mottoPatterns = [
    // Quoted text that looks like a motto
    /(?:motto|tagline|slogan|mission)[^:]*:\s*['"]([^'"]+)['"]/i,
    /['"]([^'"]{10,60})['"](?:\s*(?:motto|tagline|slogan))/i,
    // "Word is Word" style
    /['"](\w+\s+is\s+\w+)['"]/i,
    // "Your X, Our Y" style
    /['"]((?:Your|Our)\s+\w+\s*,?\s*(?:Your|Our)\s+\w+)['"]/i,
    // Tagline in header/footer patterns
    /(?:tagline|slogan|mission)\s*[:\-]\s*([^\n]{10,60})/i,
  ]
  
  for (const pattern of mottoPatterns) {
    const match = content.match(pattern)
    if (match) return match[1].trim()
  }
  
  return ''
}

// Extract history/about - works for ANY business
function extractHistory(content: string): string {
  const historyPatterns = [
    // Established/founded patterns
    /(?:established|founded|started|began)\s+(?:in\s+)?(\d{4})[^.]*\./i,
    /(?:was\s+)?(?:established|founded|started)\s+in\s+(\d{4})\s+(?:by\s+)?([^.]+\.)?/i,
    /(?:we\s+)?(?:have\s+)?(?:been\s+)?(?:established|serving|operating)\s+(?:since|for)\s+(\d{4})/i,
    // "X years of experience"
    /(\d+)\s*(?:\+)?\s*years?\s+(?:of\s+)?(?:experience|service|business)/i,
    // History section content
    /(?:history|our story|about us|who we are)\s*[:\-]\s*([^.]+\.[^.]+\.)?/i,
  ]
  
  for (const pattern of historyPatterns) {
    const match = content.match(pattern)
    if (match) return match[0].trim()
  }
  
  return ''
}

// Extract blog posts from pages - works for ANY industry
function extractBlogPosts(pagesDetails?: Array<{ url: string; title: string; markdown: string; images: string[] }>): Array<{ title: string; excerpt: string; date?: string; images: string[]; url: string }> {
  if (!pagesDetails) return []
  
  const blogPosts: Array<{ title: string; excerpt: string; date?: string; images: string[]; url: string }> = []
  
  // Look for blog/news/story pages
  const blogPatterns = /blog|news|stories|articles|posts|updates/i
  
  for (const page of pagesDetails) {
    if (blogPatterns.test(page.url) || blogPatterns.test(page.title)) {
      // Filter out 404 pages, error pages, and very short content
      const titleLower = (page.title || '').toLowerCase()
      if (titleLower.includes('404') || titleLower.includes('not found') || titleLower.includes('page not found')) continue
      if ((page.markdown || '').length < 50) continue // Too short to be a real blog post

      // Extract date from URL or content
      const dateMatch = page.url.match(/(\d{4})[/-](\d{2})[/-](\d{2})/) ||
        page.markdown?.match(/(?:published|posted|date):\s*(\w+\s+\d+,?\s+\d{4})/i)
      const date = dateMatch ? dateMatch[0] : undefined
      
      // Extract excerpt from first paragraph
      const excerptMatch = page.markdown?.match(/(?:^|\n)\s*([^\n]{50,200})/)
      const excerpt = excerptMatch ? excerptMatch[1].trim() : page.title
      
      // Filter out non-content images
      const contentImages = (page.images || []).filter(img => 
        !/logo|icon|favicon|banner|background|bg/i.test(img)
      )
      
      blogPosts.push({
        title: page.title,
        excerpt,
        date,
        images: contentImages.slice(0, 5), // Max 5 images per post
        url: page.url,
      })
    }
  }
  
  return blogPosts
}

// ============================================
// STEP 2: AI Copywriter Pass (READS CONFIG.JSON AS SOURCE OF TRUTH)
// ============================================

export interface CreativeCopy {
  // Hero section
  heroHeadline: string
  heroSubheadline: string
  heroBadge: string
  heroCta: string
  
  // About
  aboutTitle: string
  aboutDescription: string
  
  // Services
  servicesTitle: string
  serviceDescriptions: Array<{ title: string; description: string; priceTag?: string }>
  
  // Team/Doctors
  teamTitle: string
  teamMembers: Array<{ name: string; role: string; bio?: string }>
  
  // Testimonials
  testimonialsTitle: string
  testimonials: Array<{ name: string; text: string; rating: number; source: string }>
  
  // FAQ
  faqTitle: string
  faq: Array<{ question: string; answer: string }>
  
  // Contact
  contactTitle: string
  contactDescription: string
  locations: Array<{ name: string; address: string; phone?: string }>
  
  // SEO
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  
  // Gallery
  galleryTitle: string
  galleryCategories: Array<{ name: string; description: string }>
  
  // Trust signals
  trustBadges: string[]
  whyChooseUs: Array<{ title: string; description: string }>
  
  // Unique elements
  motto?: string
  history?: string
  specializations?: string[]
  hasWhatsApp?: boolean
  additionalSections?: Array<{
    id: string
    type: string
    title: string
    subtitle?: string
    content?: string
    images?: string[]
    items?: Array<{ title: string; description: string; image?: string }>
  }>
}

// Get industry-specific touch section instructions for the copywriter
function getTouchSectionInstructions(industry: string): string {
  const ind = (industry || '').toLowerCase()

  if (ind.includes('nonprofit') || ind.includes('charity') || ind.includes('mission') || ind.includes('church') || ind.includes('ngo') || ind.includes('humanitarian')) {
    return `NONPROFIT TOUCHES (choose 2-3):
- "Our Partners & Sponsors" — List organizations, churches, businesses that support this mission. Include their names and how they help.
- "Community Impact" — Specific numbers: meals served, families helped, years operating. Make it tangible.
- "How Your Donation Helps" — Break down what a donation actually pays for (e.g., "R500 feeds a family for a week").
- "Volunteer Stories" — Short quotes or stories from volunteers about their experience.`
  }

  if (ind.includes('bakery') || ind.includes('cake') || ind.includes('pastry')) {
    return `BAKERY TOUCHES (choose 2-3):
- "How Our Cakes Are Made" — Describe the process from ingredients to finished product. Mention specific techniques.
- "Our Ingredients" — Highlight quality ingredients (local butter, free-range eggs, real vanilla). Be specific about sources.
- "Custom Order Process" — Step-by-step guide for ordering a custom cake (consultation, design, baking, delivery).
- "Seasonal Specials" — Mention seasonal items or limited-time offerings.`
  }

  if (ind.includes('restaurant') || ind.includes('cafe') || ind.includes('food')) {
    return `RESTAURANT TOUCHES (choose 2-3):
- "Our Chef's Story" — Background on the chef, their training, cooking philosophy.
- "Today's Specials" — Rotating daily specials or seasonal menu items.
- "Our Ingredients" — Where ingredients are sourced (local farms, organic, etc.).
- "The Experience" — What dining here feels like — ambiance, service, atmosphere.`
  }

  if (ind.includes('medical') || ind.includes('dental') || ind.includes('health') || ind.includes('clinic')) {
    return `MEDICAL TOUCHES (choose 2-3):
- "Our Technology" — Equipment, diagnostic tools, treatment technology used.
- "Patient Journey" — What a first visit looks like step by step.
- "Insurance & Payment" — What insurance is accepted, payment options available.
- "Emergency Protocol" — What to do in an emergency, after-hours availability.`
  }

  if (ind.includes('plumb') || ind.includes('electric') || ind.includes('construction') || ind.includes('roof') || ind.includes('hvac') || ind.includes('trade')) {
    return `TRADES TOUCHES (choose 2-3):
- "Our Equipment" — Tools, vehicles, technology used. Show professionalism.
- "How We Work" — Step-by-step process from initial call to job completion.
- "Service Areas" — Specific neighborhoods, suburbs, regions covered.
- "Emergency Response" — Response time, what qualifies as emergency, after-hours availability.`
  }

  if (ind.includes('legal') || ind.includes('law') || ind.includes('attorney')) {
    return `LEGAL TOUCHES (choose 2-3):
- "Our Practice Areas" — Detailed description of each area of law practiced.
- "Case Results" — Notable outcomes (without revealing client details).
- "Legal Resources" — Helpful information for potential clients.
- "Our Process" — What to expect from initial consultation to resolution.`
  }

  if (ind.includes('photo') || ind.includes('studio') || ind.includes('creative')) {
    return `PHOTOGRAPHY TOUCHES (choose 2-3):
- "Our Gear" — Camera equipment, lenses, lighting used. Shows professionalism.
- "Session Process" — What to expect during a photo session, timeline, deliverables.
- "Location Guide" — Best locations for photos in the area, with descriptions.
- "Print Options" — What prints, albums, or digital packages are available.`
  }

  // Default for any industry
  return `INDUSTRY TOUCHES (choose 2-3):
- "Our Process" — Step-by-step guide of how this business works with clients.
- "Why Choose Us" — Specific differentiators that set this business apart.
- "Our Commitment" — What this business promises to every client.
- "Behind the Scenes" — A look at how this business operates day-to-day.`
}

export function buildCopywriterPrompt(
  facts: HardFacts,
  designContext?: {
    archetypeName?: string
    archetypeMood?: string
    artDirection?: string
    layoutStyle?: string
    typographyPairing?: string
    colorPaletteName?: string
    colorMood?: string
    sectionOrder?: string
    imageryDirection?: string
    trustSignals?: string[]
    conversionCTAs?: string[]
  }
): string {
  const categoryList = Array.from(facts.imagesByCategory.entries())
    .map(([cat, imgs]) => `${cat}: ${imgs.length}`)
    .join(', ')

  const designBlock = designContext ? `
DESIGN DIRECTION:
- Industry Archetype: ${designContext.archetypeName || 'General'}
- Visual Mood: ${designContext.archetypeMood || 'professional'}
- Art Direction: ${designContext.artDirection || 'editorial'}
- Layout Style: ${designContext.layoutStyle || 'modern'}
- Typography: ${designContext.typographyPairing || 'modern-sans'}
- Color Palette: ${designContext.colorPaletteName || 'Default'} — ${designContext.colorMood || 'professional'}
- Section Order: ${designContext.sectionOrder || 'Hero → Services → Gallery → Testimonials → About → Contact'}
- Imagery Direction: ${designContext.imageryDirection || 'Professional, industry-appropriate'}
${designContext.trustSignals?.length ? `- Trust Signals to Highlight: ${designContext.trustSignals.join(', ')}` : ''}
${designContext.conversionCTAs?.length ? `- Preferred CTAs: ${designContext.conversionCTAs.join(', ')}` : ''}

Write copy that MATCHES this visual direction. If the mood is "authoritative and bold", write confident, direct copy. If the mood is "warm and inviting", write friendly, approachable copy. The copy must feel like it belongs to this specific website design.
` : ''

  return `Generate website copy for ${facts.businessName} (${facts.industry}) in ${facts.city}.
${designBlock}
DATA:
${facts.ownerName ? `- Owner: ${facts.ownerName}` : ''}
- Phone: ${facts.whatsappNumber}
${facts.phoneNumber ? `- Phone (landline): ${facts.phoneNumber}` : ''}
- Email: ${facts.email}
- Address: ${facts.address}
- Services: ${facts.services.map(s => `${s.title}${s.description ? ': ' + s.description : ''}`).join('\n  ') || 'None found'}
- Images: ${categoryList}
${facts.googleRating ? `- Reviews: ${facts.googleRating}/5 (${facts.googleReviewCount} reviews)` : ''}
${facts.motto ? `- Motto/Tagline: ${facts.motto}` : ''}
${facts.tagline ? `- Client Tagline: ${facts.tagline}` : ''}
${facts.history ? `- History: ${facts.history}` : ''}
${facts.businessBackground ? `\nADDITIONAL CONTEXT FROM THE BUSINESS OWNER:\n${facts.businessBackground}\n` : ''}
${facts.specificServices ? `\nSERVICES TO HIGHLIGHT (client-requested):\n${facts.specificServices}\n` : ''}
${facts.specificTestimonials ? `\nTESTIMONIALS TO INCLUDE (client-provided):\n${facts.specificTestimonials}\n` : ''}

BANNED WORDS — NEVER use these (they make every website look generic):
"delight", "delightful", "exceptional attention to detail", "unforgettable journey",
"elevate", "tailored solutions", "seamless experience", "cutting-edge", "state-of-the-art",
"world-class", "best-in-class", "innovative", "revolutionary", "game-changing",
"passionate about", "committed to excellence", "goes above and beyond", "one-stop shop",
"second to none", "dedicated team", "years of experience", "customer-centric",
"results-driven", "turnkey solution", "synergy", "leverage", "holistic approach",
"proven track record", "trusted partner"

INSTEAD: Use specific, concrete language. Reference real facts — locations, numbers, names, processes.
- BAD: "We're passionate about quality" → GOOD: "We bake fresh every morning at 4am"
- BAD: "Years of experience" → GOOD: "Serving ${facts.city} since 2012"
- BAD: "Exceptional attention to detail" → GOOD: "Every project is inspected by the owner"
- BAD: "Trusted partner" → GOOD: "Over 200 five-star Google reviews"

${facts.industry?.toLowerCase().includes('nonprofit') || facts.industry?.toLowerCase().includes('charity') || facts.industry?.toLowerCase().includes('mission') || facts.industry?.toLowerCase().includes('humanitarian') ? `NONPROFIT-SPECIFIC INSTRUCTIONS:
- The PRIMARY call-to-action MUST be donation-focused: "Become a Monthly Partner", "Donate Now", or "Support Our Mission"
- Do NOT use generic CTAs like "Contact Us" or "Get Started"
- Every section should naturally lead toward the donation/partnership CTA
- Include specific impact numbers: meals delivered, families fed, years in operation
- The tone should be dignified, not desperate — this is an invitation, not a plea` : ''}

WRITING STYLE:
- Direct, warm, conversational human voice
- Focus on concrete facts: locations served, turnaround times, specific processes
- Include local references to ${facts.city} and surrounding areas
- Active voice, not passive
- Short, scannable paragraphs
- Benefits over features

UNIQUENESS REQUIREMENT:
Write copy that is SPECIFIC to this business. Every sentence must contain at least one detail that could only apply to this business — a real name, a real location, a real number, a real process. Generic copy like "We provide quality services" will be rejected. The copy must feel like it was written by someone who visited this business in person.

ADDITIONAL SECTIONS (Touch Sections):
Write content for 2-3 industry-specific "touch" sections that make this website feel custom-built. These are unique content blocks that give the website personality. Choose from the following based on the industry:

${getTouchSectionInstructions(facts.industry)}

For each touch section, provide:

## TOUCH: [Section Title]
[2-3 sentences of specific, detailed content for this section]

Return STRUCTURED MARKDOWN with these exact section headings:

## HEADLINE
[compelling headline — max 8 words, matches the visual mood]

## SUBHEADLINE
[supporting text — 1-2 sentences, specific to this business]

## BADGE
[trust badge — short phrase, e.g. "Serving ${facts.city} Since 2012"]

## CTA
[call to action text — action-oriented, specific, e.g. "Get Your Free Quote"]

## ABOUT TITLE
[about section title]

## ABOUT
[2 paragraphs about the business — use real facts, local references, specific details]

## SERVICES TITLE
[services section title]

## SERVICES
1. Service Name: Description (1-2 sentences, benefit-focused, specific)
2. Service Name: Description

## TEAM TITLE
[team section title]

## TEAM
1. Name - Role

## TESTIMONIALS TITLE
[testimonials section title]

## TESTIMONIALS
1. "Quote text" - Name (5/5)

## FAQ TITLE
[FAQ section title]

## FAQ
Q: Question?
A: Answer.

## CONTACT TITLE
[contact section title]

## CONTACT
[contact description]

## SEO TITLE
[SEO title max 60 chars — include business name + city + service]

## SEO DESCRIPTION
[meta description max 160 chars — include key services, city, phone number]

## SEO KEYWORDS
keyword1, keyword2, keyword3

## TRUST BADGES
- Badge 1
- Badge 2

## WHY CHOOSE US
- Reason: Description

## MOTTO
[tagline if any]

## HISTORY
[brief history if found]

## SPECIALIZATIONS
- Spec 1
- Spec 2

Use actual business data. Write copy that matches the design direction. Markdown only, no JSON.`
}

// ============================================
// STEP 3: Deterministic JSON Assembly
// ============================================

export function assembleSiteConfig(
  facts: HardFacts,
  copy: CreativeCopy,
  archetype: IndustryArchetype
): MasterSiteConfig {
  const buildSlug = generateBuildSlug(facts.businessName, facts.city)

  // Build gallery from image categories - deduplicate across categories
  const gallery = buildGallery(facts.imagesByCategory)

  // Build page media map
  const pageMediaMap = buildPageMediaMap(facts.imagesByPage)

  // Build categorized galleries - deduplicate across categories
  const categorizedGalleries: Record<string, GalleryItem[]> = {}
  const usedImages = new Set<string>()
  
  for (const [category, images] of Array.from(facts.imagesByCategory.entries())) {
    const uniqueImages: GalleryItem[] = []
    for (const img of images) {
      if (!usedImages.has(img)) {
        usedImages.add(img)
        uniqueImages.push({
          imageUrl: img,
          caption: `${category} ${uniqueImages.length + 1}`,
          category,
        })
      }
    }
    if (uniqueImages.length > 0) {
      categorizedGalleries[category] = uniqueImages
    }
  }

  // Build the site config object
  const siteConfig = {
    businessName: facts.businessName,
    city: facts.city,
    ownerName: facts.ownerName,
    
    theme: {
      palette: {
        primary: facts.primaryColor,
        secondary: facts.secondaryColor,
        accent: facts.accentColor,
        bg: archetype.defaultBg || facts.bgColor,
        text: archetype.themeMode === 'dark' ? '#f5f5f5' : '#1a1a1a',
        muted: archetype.themeMode === 'dark' ? '#9ca3af' : '#6b7280',
      },
      fontPairing: getFontPairing(archetype),
      stylePreset: getStylePreset(archetype),
    },
    
    brandAssets: {
      logoUrl: facts.logoUrl,
      brandColors: {
        primary: facts.primaryColor,
        secondary: facts.secondaryColor,
        accent: facts.accentColor,
        bg: archetype.defaultBg || facts.bgColor,
      },
    },
    
    features: facts.features,
    
    seo: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      keywords: copy.seoKeywords,
      openGraph: {
        title: copy.seoTitle,
        description: copy.seoDescription,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: copy.seoTitle,
        description: copy.seoDescription,
      },
      jsonLd: buildJsonLd(facts, copy),
    },
    
    geo: facts.serviceAreas.length > 0 ? {
      serviceAreas: facts.serviceAreas,
      region: facts.city,
    } : undefined,
    
    hero: {
      headline: copy.heroHeadline,
      subheadline: copy.heroSubheadline,
      heroImageUrl: facts.heroImageUrl || facts.allImages[0] || '',
      logoUrl: facts.logoUrl,
      badge: copy.heroBadge,
      whatsappNumber: facts.normalizedPhone,
      phone: facts.normalizedPhone,
      ctaText: archetype.conversionCTAs?.[0] || copy.heroCta,
      ctaLink: '#contact',
    },
    
    services: copy.serviceDescriptions.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: facts.services[i]?.icon || 'Star',
      imageUrl: facts.services[i]?.imageUrl || '',
      realImageUrl: facts.services[i]?.icon || '',
      // Only include priceTag if it's a real price (not R0 or empty)
      priceTag: (s.priceTag && s.priceTag !== 'R0' && s.priceTag !== 'R') ? s.priceTag : undefined,
    })),
    
    gallery,
    categorizedGalleries,
    
    testimonials: copy.testimonials,
    
    faq: copy.faq,
    
    // Include blog posts from extraction
    blogPosts: facts.blogPosts || [],
    
    // Include pricing from extraction
    pricing: facts.pricing || [],

    // Include additional touch sections from copywriter
    additionalSections: copy.additionalSections || [],
    
    socialLinks: {
      facebook: facts.facebookUrl,
      instagram: facts.instagramUrl,
    },
    
    // Use AI-generated team first, fall back to extracted team
    // Strip markdown formatting from names and roles
    team: (copy.teamMembers?.length > 0 
      ? copy.teamMembers.map(t => ({ name: t.name, role: t.role, bio: t.bio || '' }))
      : facts.teamMembers.map(t => ({ name: t.name, role: t.role, bio: t.bio || '' }))
    ).map(t => ({
      name: t.name.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '').trim(),
      role: t.role.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '').trim(),
      bio: t.bio?.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '').trim() || '',
    })).filter(t => t.name.length > 2),
    
    businessHours: facts.businessHours,
    
    // Enhanced data from scraper
    videos: facts.videos?.length ? facts.videos : undefined,
    mapEmbedUrl: facts.mapEmbedUrl || undefined,
    
    contact: {
      phone: facts.normalizedPhone,
      whatsapp: facts.hasWhatsApp === false ? '' : facts.normalizedPhone,
      email: facts.email,
      address: facts.address,
    },
    
    legacyUrls: {
      discovered: [],
      scraped: [],
    },
    
    pageMediaMap,
    
    createdAt: new Date().toISOString(),
    buildSlug,
    buildMode: 'TRIAL',
    
    // Store industry and extra data for prompt generation
    industry: facts.industry,
    motto: copy.motto || facts.motto || '',
    history: copy.history || facts.history || '',
    specializations: copy.specializations || [],
    locations: copy.locations?.length > 0 ? copy.locations : facts.locations,
    hasWhatsApp: facts.hasWhatsApp !== false,
  } as MasterSiteConfig & { 
    industry: string
    motto: string
    history: string
    specializations: string[]
    locations: Array<{ name: string; address: string; phone?: string }>
    hasWhatsApp: boolean
  }

  // ============================================
  // POST-PROCESSING: Feature Flag Synchronization
  // ============================================
  
  // Auto-bind team images from scraped media
  if (siteConfig.team && siteConfig.team.length > 0) {
    const allImages = facts.allImages || []
    const aboutImages = facts.imagesByCategory?.get('About') || []
    
    for (let i = 0; i < siteConfig.team.length; i++) {
      const member = siteConfig.team[i]
      if (!member.imageUrl) {
        // Try to find matching image by name pattern
        const nameLower = member.name.toLowerCase().replace(/dr\.?\s*/i, '')
        const nameParts = nameLower.split(/\s+/).filter(p => p.length > 2)
        
        const matchingImage = allImages.find(img => {
          const imgLower = img.toLowerCase()
          return nameParts.some(part => imgLower.includes(part)) ||
            /dr[-_]|doctor[-_]|team[-_]|profile[-_]|staff[-_]|bio[-_]|practitioner/i.test(imgLower)
        })
        
        if (matchingImage) {
          siteConfig.team[i] = { ...member, imageUrl: matchingImage }
        } else if (aboutImages[i]) {
          // Fallback: assign About images sequentially
          siteConfig.team[i] = { ...member, imageUrl: aboutImages[i] }
        }
      }
    }
  }

  // Synchronize feature flags with actual data
  siteConfig.features = {
    ...siteConfig.features,
    whatsappWidget: facts.hasWhatsApp !== false && !!siteConfig.contact?.whatsapp,
    teamProfiles: !!(siteConfig.team && siteConfig.team.length > 0),
    testimonials: !!(siteConfig.testimonials && siteConfig.testimonials.length > 0),
    faq: !!(siteConfig.faq && siteConfig.faq.length > 0),
    socialMediaLinks: !!(siteConfig.socialLinks?.facebook || siteConfig.socialLinks?.instagram),
    businessHours: !!(siteConfig.businessHours && siteConfig.businessHours.length > 0),
  }

  return siteConfig
}

// ============================================
// Helper Functions
// ============================================

function isUiImage(url: string): boolean {
  const patterns = [
    /default-skin/i, /pixel/i, /tracking/i, /spacer/i,
    /blank\.gif/i, /1x1\./i, /transparent\.gif/i,
    /spinner/i, /loading/i, /icon.*\.png$/i,
    /button.*\.png$/i, /avatar/i, /gravatar/i,
    /favicon/i, /apple-touch-icon/i,
    /marker-shadow/i, /yoga-404/i, /cta-bg/i, /subheader/i,
    /cartodb-basemaps/i, /openstreetmap/i, /googleapis.*maps/i,
    /tile/i, /basemap/i,
  ]
  return patterns.some(p => p.test(url))
}

function isLogoImage(url: string): boolean {
  return /logo|brand|header-logo|nav-logo|site-logo/i.test(url)
}

function categorizeByUrl(url: string): string | null {
  const lower = url.toLowerCase()
  
  // ONLY categorize actual gallery/portfolio pages
  // These are pages that SHOULD be gallery categories
  if (lower.includes('wedding') || lower.includes('bride') || lower.includes('groom')) return 'Weddings'
  if (lower.includes('famil')) return 'Families'
  if (lower.includes('newborn') || lower.includes('baby') || lower.includes('new-baby')) return 'Newborn'
  if (lower.includes('maternity') || lower.includes('pregnancy') || lower.includes('bump')) return 'Maternity'
  if (lower.includes('portrait') || lower.includes('headshot')) return 'Portraits'
  if (lower.includes('couple') || lower.includes('engagement') || lower.includes('e-session')) return 'Couples'
  if (lower.includes('matric') || lower.includes('graduation') || lower.includes('dance')) return 'Matric'
  if (lower.includes('studio')) return 'Studio'
  if (lower.includes('cake-smash') || lower.includes('cakesmash') || lower.includes('milk-bath')) return 'Cake Smash'
  if (lower.includes('birthday') || lower.includes('birthdayphotoshoot')) return 'Birthday'
  
  // Business-specific gallery categories
  if (lower.includes('event') || lower.includes('corporate')) return 'Events'
  if (lower.includes('product') || lower.includes('commercial')) return 'Products'
  if (lower.includes('menu')) return 'Menu'
  if (lower.includes('food') || lower.includes('dish') || lower.includes('cuisine')) return 'Food'
  
  // These are NOT gallery categories - they are regular pages
  // Return null to indicate this is not a gallery page
  if (lower.includes('about') || lower.includes('get-to-know')) return null
  if (lower.includes('contact') || lower.includes('reach')) return null
  if (lower.includes('blog') || lower.includes('stories') || lower.includes('news')) return null
  if (lower.includes('service') || lower.includes('offering')) return null
  if (lower.includes('pricing') || lower.includes('package') || lower.includes('rate')) return null
  if (lower.includes('testimonial') || lower.includes('review')) return null
  if (lower.includes('faq') || lower.includes('question')) return null
  if (lower.includes('team') || lower.includes('staff') || lower.includes('member')) return null
  
  // For portfolio/gallery pages, return 'Portfolio'
  if (lower.includes('gallery') || lower.includes('portfolio') || lower.includes('my-portfolio')) return 'Portfolio'
  
  // Default: not a gallery page
  return null
}

function extractServices(scrapedData: ScrapedData | null, industry?: string): Array<{ title: string; description: string; price?: string; icon: string; imageUrl?: string }> {
  const services: Array<{ title: string; description: string; price?: string; icon: string; imageUrl?: string }> = []
  
  // Words that are NOT service names
  const excludeWords = [
    'our services', 'services', 'home', 'about', 'contact', 'menu', 'footer', 'header',
    'copyright', 'privacy', 'terms', 'policy', 'sitemap', 'search', 'login', 'register',
    'potchefstroom', 'klerksdorp', 'johannesburg', 'pretoria', 'durban', 'cape town',
    'read more', 'view more', 'see more', 'click here', 'learn more',
  ]
  
  // Try to extract from scraped data - look for service-like content
  if (scrapedData?.pagesDetails) {
    // Look for service pages
    const servicePages = scrapedData.pagesDetails.filter(p => 
      p.url.toLowerCase().includes('service') || 
      p.url.toLowerCase().includes('product') ||
      p.url.toLowerCase().includes('menu')
    )
    
    // Parse service names and descriptions from page content
    for (const page of servicePages) {
      const content = page.markdown || ''
      
      // Look for service patterns: ### Service Name followed by description
      const servicePattern = /#{2,3}\s+([A-Z][^\n]{3,50})\s*\n([\s\S]*?)(?=#{2,3}\s+[A-Z]|$)/g
      let match
      while ((match = servicePattern.exec(content)) !== null) {
        const title = match[1].trim()
        const description = match[2].trim().substring(0, 300) // First 300 chars
        
        // Filter out navigation/UI text and non-service entries
        const titleLower = title.toLowerCase()
        if (title.length > 3 && title.length < 60 && 
            !excludeWords.some(word => titleLower.includes(word)) &&
            !title.includes('Menu') && !title.includes('Footer') &&
            !title.includes('Header') && !title.includes('Copyright') &&
            !title.includes('Get In Touch') && !title.includes('Address')) {
          
          // Clean up description
          const cleanDesc = description
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          
          services.push({
            title,
            description: cleanDesc || `Professional ${title.toLowerCase()} services.`,
            icon: 'Star',
          })
        }
      }
      
      // Also look for H3 headings with service-like names
      const h3Pattern = /###\s+([A-Z][^\n]{3,50})/g
      while ((match = h3Pattern.exec(content)) !== null) {
        const title = match[1].trim()
        const titleLower = title.toLowerCase()
        if (title.length > 3 && title.length < 60 && 
            !excludeWords.some(word => titleLower.includes(word)) &&
            !services.some(s => s.title === title)) {
          services.push({
            title,
            description: `Professional ${title.toLowerCase()} services.`,
            icon: 'Star',
          })
        }
      }
    }
    
    // Also parse from the full markdown for service-like content
    const fullContent = scrapedData.fullMarkdown || ''
    
    // Look for specific service patterns (e.g., "Chiropractic Care", "Dry Needling")
    const servicePatterns = [
      /(?:we offer|our services include|services:)\s*([^.]+)/gi,
      /(?:including|such as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    ]
    
    for (const pattern of servicePatterns) {
      const matches = fullContent.match(pattern) || []
      for (const match of matches) {
        const parts = match.replace(/^(?:we offer|our services include|services:)\s*/i, '').split(/[,;&]/)
        for (const part of parts) {
          const title = part.trim().replace(/^and\s+/i, '')
          if (title.length > 3 && title.length < 50 && 
              !services.some(s => s.title.toLowerCase() === title.toLowerCase())) {
            services.push({
              title,
              description: `Professional ${title.toLowerCase()} services.`,
              icon: 'Star',
            })
          }
        }
      }
    }
  }
  
  // If no services found, use industry defaults
  if (services.length === 0) {
    return getIndustryServices(industry || 'general')
  }

  // Try to assign images from services page to service items
  if (scrapedData?.pagesDetails) {
    const servicePage = scrapedData.pagesDetails.find(p =>
      p.url.toLowerCase().includes('service') || p.url.toLowerCase().includes('what-we-do')
    )
    if (servicePage?.images) {
      const pageImages = servicePage.images.filter((img: string) => {
        const imgLower = img.toLowerCase()
        return !imgLower.includes('logo') && !imgLower.includes('icon') && !imgLower.includes('favicon') && !imgLower.includes('sprite')
      })
      for (let i = 0; i < services.length && i < pageImages.length; i++) {
        if (!services[i].imageUrl) {
          services[i].imageUrl = pageImages[i]
        }
      }
    }
  }

  return services.slice(0, 10) // Limit to 10 services
}

function getIndustryServices(industry: string): Array<{ title: string; description: string; icon: string }> {
  const services: Record<string, Array<{ title: string; description: string; icon: string }>> = {
    photography: [
      { title: 'Weddings', description: 'Capturing your special day with timeless elegance', icon: 'Heart' },
      { title: 'Portraits', description: 'Professional portrait sessions for individuals and couples', icon: 'User' },
      { title: 'Families', description: 'Beautiful family moments preserved forever', icon: 'Users' },
      { title: 'Events', description: 'Coverage for corporate events and celebrations', icon: 'Calendar' },
    ],
    restaurant: [
      { title: 'Dine In', description: 'Enjoy our warm atmosphere and exceptional cuisine', icon: 'Utensils' },
      { title: 'Takeaway', description: 'Order ahead and pick up at your convenience', icon: 'Package' },
      { title: 'Catering', description: 'Let us cater your next special event', icon: 'ChefHat' },
      { title: 'Functions', description: 'Private dining and event spaces available', icon: 'PartyPopper' },
    ],
    medical: [
      { title: 'General Practice', description: 'Comprehensive healthcare for the whole family', icon: 'Stethoscope' },
      { title: 'Consultations', description: 'Professional medical consultations and advice', icon: 'MessageCircle' },
      { title: 'Health Screenings', description: 'Preventive health checks and wellness assessments', icon: 'Activity' },
      { title: 'Emergency Care', description: 'Urgent medical attention when you need it most', icon: 'AlertTriangle' },
    ],
    trades: [
      { title: 'Repairs', description: 'Fast, reliable repair services for your home or business', icon: 'Wrench' },
      { title: 'Installations', description: 'Professional installations done right the first time', icon: 'Settings' },
      { title: 'Maintenance', description: 'Regular maintenance to keep things running smoothly', icon: 'Shield' },
      { title: 'Emergency', description: '24/7 emergency services when you need us most', icon: 'AlertCircle' },
    ],
    legal: [
      { title: 'Consultation', description: 'Professional legal advice for your situation', icon: 'MessageCircle' },
      { title: 'Representation', description: 'Expert representation in legal matters', icon: 'Shield' },
      { title: 'Documentation', description: 'Legal document preparation and review', icon: 'FileText' },
      { title: 'Mediation', description: 'Alternative dispute resolution services', icon: 'Users' },
    ],
    fitness: [
      { title: 'Personal Training', description: 'One-on-one training tailored to your goals', icon: 'Dumbbell' },
      { title: 'Group Classes', description: 'Energizing group fitness sessions', icon: 'Users' },
      { title: 'Nutrition', description: 'Personalized nutrition plans and guidance', icon: 'Apple' },
      { title: 'Wellness', description: 'Holistic wellness programs', icon: 'Heart' },
    ],
    beauty: [
      { title: 'Hair Styling', description: 'Expert cuts, color, and styling', icon: 'Scissors' },
      { title: 'Skin Care', description: 'Facials and skin treatments', icon: 'Sparkles' },
      { title: 'Nails', description: 'Manicures, pedicures, and nail art', icon: 'Hand' },
      { title: 'Massage', description: 'Relaxing therapeutic massage', icon: 'Heart' },
    ],
    retail: [
      { title: 'Products', description: 'Quality products for your needs', icon: 'ShoppingBag' },
      { title: 'Services', description: 'Expert service and support', icon: 'MessageCircle' },
      { title: 'Delivery', description: 'Fast and reliable delivery options', icon: 'Truck' },
      { title: 'Returns', description: 'Easy returns and exchanges', icon: 'RotateCcw' },
    ],
    education: [
      { title: 'Courses', description: 'Structured learning programs', icon: 'BookOpen' },
      { title: 'Tutoring', description: 'Personalized one-on-one instruction', icon: 'User' },
      { title: 'Workshops', description: 'Hands-on learning experiences', icon: 'Tool' },
      { title: 'Certification', description: 'Professional certification programs', icon: 'Award' },
    ],
    general: [
      { title: 'Services', description: 'Professional services tailored to your needs', icon: 'Star' },
      { title: 'Consultation', description: 'Expert advice and guidance', icon: 'MessageCircle' },
      { title: 'Support', description: 'Dedicated customer support', icon: 'HelpCircle' },
      { title: 'Solutions', description: 'Custom solutions for your requirements', icon: 'Lightbulb' },
    ],
  }
  
  return services[industry] || services.general
}

function extractBusinessHours(scrapedData: ScrapedData | null): Array<{ dayOfWeek: string; opens: string; closes: string }> {
  // Priority 1: Structured data from JSON-LD
  if (scrapedData?.structuredData?.businessHours?.length) {
    return scrapedData.structuredData.businessHours
  }
  // Priority 2: Business hours extracted from HTML
  if (scrapedData?.htmlBusinessHours?.length) {
    return scrapedData.htmlBusinessHours
  }
  // Priority 3: Default hours
  return [
    { dayOfWeek: 'Monday', opens: '08:00', closes: '17:00' },
    { dayOfWeek: 'Tuesday', opens: '08:00', closes: '17:00' },
    { dayOfWeek: 'Wednesday', opens: '08:00', closes: '17:00' },
    { dayOfWeek: 'Thursday', opens: '08:00', closes: '17:00' },
    { dayOfWeek: 'Friday', opens: '08:00', closes: '17:00' },
    { dayOfWeek: 'Saturday', opens: '09:00', closes: '14:00' },
    { dayOfWeek: 'Sunday', opens: 'Closed', closes: 'Closed' },
  ]
}

function findHeroImage(scrapedData: ScrapedData | null): string {
  if (!scrapedData?.imageList?.length) return ''
  
  // Look for hero-like images
  const heroPatterns = [/hero/i, /banner/i, /cover/i, /main/i, /header/i]
  const heroImage = scrapedData.imageList.find(img => 
    heroPatterns.some(p => p.test(img)) && !isLogoImage(img)
  )
  
  if (heroImage) return heroImage
  
  // Look for large images (likely hero/banner images)
  // Skip small images (logos, icons) and find the first large image
  const largeImage = scrapedData.imageList.find(img => {
    if (isLogoImage(img) || isUiImage(img)) return false
    // Check if image URL suggests it's a large image
    const lower = img.toLowerCase()
    // Skip thumbnails and small images
    if (lower.includes('thumb') || lower.includes('small') || lower.includes('icon')) return false
    // Look for images that are likely large (no size constraints in URL)
    return true
  })
  
  if (largeImage) return largeImage
  
  // Fall back to first non-logo image
  return scrapedData.imageList.find(img => !isLogoImage(img) && !isUiImage(img)) || ''
}

function buildGallery(imagesByCategory: Map<string, string[]>): GalleryItem[] {
  const gallery: GalleryItem[] = []
  
  for (const [category, images] of Array.from(imagesByCategory.entries())) {
    for (const img of images) {
      gallery.push({
        imageUrl: img,
        caption: `${category} - ${gallery.length + 1}`,
        category,
      })
    }
  }
  
  return gallery
}

function buildPageMediaMap(imagesByPage: Map<string, string[]>): Array<{ pageUrl: string; pageSlug: string; title: string; images: string[] }> {
  const map: Array<{ pageUrl: string; pageSlug: string; title: string; images: string[] }> = []
  
  for (const [pageUrl, images] of Array.from(imagesByPage.entries())) {
    const slug = pageUrl.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home'
    map.push({
      pageUrl,
      pageSlug: slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      images,
    })
  }
  
  return map
}

function buildJsonLd(facts: HardFacts, copy: CreativeCopy): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: facts.businessName,
    description: copy.seoDescription,
    telephone: facts.normalizedPhone,
    email: facts.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: facts.address,
      addressLocality: facts.city,
      addressCountry: 'ZA',
    },
    ...(facts.googleRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: facts.googleRating,
        reviewCount: facts.googleReviewCount || 0,
      },
    }),
  }
}

function getFontPairing(archetype: IndustryArchetype): 'Oswald-Roboto' | 'Inter-Plus' | 'Playfair-Lato' | 'DM-Sans-Playfair' | 'Sora-Inter' | 'Outfit-Source' | 'Space-Grotesk-Inter' {
  const mapping: Record<string, any> = {
    'Playfair Display': 'Playfair-Lato',
    'Plus Jakarta Sans': 'Inter-Plus',
    'Oswald': 'Oswald-Roboto',
    'Sora': 'Sora-Inter',
    'DM Sans': 'DM-Sans-Playfair',
    'Outfit': 'Outfit-Source',
    'Space Grotesk': 'Space-Grotesk-Inter',
  }
  return mapping[archetype.typography.heading] || 'Inter-Plus'
}

function getStylePreset(archetype: IndustryArchetype): 'sharp-industrial' | 'modern-clean' | 'soft-rounded' | 'editorial-luxe' | 'bold-contrast' | 'minimal-elegant' {
  const mapping: Record<string, any> = {
    'Photography & Creative Services': 'editorial-luxe',
    'Medical, Health & Wellness': 'modern-clean',
    'Local Trades & Technical Services': 'sharp-industrial',
    'Restaurants & Food Service': 'soft-rounded',
    'Professional Services & Corporate': 'modern-clean',
    'Real Estate & Property': 'minimal-elegant',
    'E-Commerce, Retail & Consumer Goods': 'modern-clean',
    'Automotive, Logistics & Transport': 'bold-contrast',
    'Education, Training & Community': 'soft-rounded',
    'Technology & SaaS': 'bold-contrast',
  }
  return mapping[archetype.name] || 'modern-clean'
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

function detectIndustryFromData(
  businessName: string,
  title?: string,
  description?: string,
  services?: Array<{ title: string }>
): string {
  const text = `${businessName} ${title || ''} ${description || ''} ${(services || []).map(s => s.title).join(' ')}`.toLowerCase()
  
  if (/security|guard|surveillance|alarm|protection|patrol|armed|cctv|monitoring/.test(text)) return 'Security'
  if (/photograph|photo|studio|wedding|portrait|gallery/.test(text)) return 'Photography'
  if (/bakery|bake|bread|cake|pastry|pastries|dessert|cupcake|donut|croissant|patisserie/.test(text)) return 'Bakery'
  if (/restaurant|cafe|food|dining|catering|bistro|eatery|takeaway/.test(text)) return 'Restaurant'
  if (/doctor|clinic|medical|dental|health|chiropract|physio|therapy|wellness/.test(text)) return 'Medical'
  if (/plumb|electric|hvac|roof|repair|construction|builder|engineer|fabricat|weld|machin|mechanic/.test(text)) return 'Trades'
  if (/law|legal|attorney|advocate|lawyer/.test(text)) return 'Legal'
  if (/accounting|tax|financial|bookkeeping|audit/.test(text)) return 'Finance'
  if (/gym|fitness|training|yoga|pilates/.test(text)) return 'Fitness'
  if (/beauty|salon|spa|nail|hair|massage/.test(text)) return 'Beauty'
  if (/hotel|guesthouse|lodge|accommodation|bnb/.test(text)) return 'Hospitality'
  if (/school|academy|education|tutor|college/.test(text)) return 'Education'
  if (/software|saas|tech|app|platform/.test(text)) return 'Technology'
  if (/real estate|property|estate agent/.test(text)) return 'Real Estate'
  if (/shop|store|retail|boutique|fashion/.test(text)) return 'Retail'
  if (/auto|car|vehicle|dealer/.test(text)) return 'Automotive'
  
  return 'General Business'
}

function generateBuildSlug(businessName: string, city: string): string {
  const base = `${businessName}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}
