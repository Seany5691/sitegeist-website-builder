/**
 * Structured Markdown Parser
 * 
 * Parses markdown with specific section headings into structured data.
 * This is more reliable than JSON for LLM output.
 */

export interface ParsedCopy {
  heroHeadline: string
  heroSubheadline: string
  heroBadge: string
  heroCta: string
  aboutTitle: string
  aboutDescription: string
  servicesTitle: string
  serviceDescriptions: Array<{ title: string; description: string; priceTag?: string }>
  teamTitle: string
  teamMembers: Array<{ name: string; role: string; bio?: string }>
  testimonialsTitle: string
  testimonials: Array<{ name: string; text: string; rating: number; source: string }>
  faqTitle: string
  faq: Array<{ question: string; answer: string }>
  contactTitle: string
  contactDescription: string
  locations: Array<{ name: string; address: string; phone?: string }>
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  galleryTitle: string
  galleryCategories: Array<{ name: string; description: string }>
  trustBadges: string[]
  whyChooseUs: Array<{ title: string; description: string }>
  motto: string
  history: string
  specializations: string[]
  additionalSections?: Array<{
    id: string
    type: string
    title: string
    content: string
  }>
}

/**
 * Parse structured markdown into ParsedCopy
 */
export function parseStructuredMarkdown(markdown: string): ParsedCopy {
  const result: ParsedCopy = {
    heroHeadline: '',
    heroSubheadline: '',
    heroBadge: '',
    heroCta: '',
    aboutTitle: '',
    aboutDescription: '',
    servicesTitle: '',
    serviceDescriptions: [],
    teamTitle: '',
    teamMembers: [],
    testimonialsTitle: '',
    testimonials: [],
    faqTitle: '',
    faq: [],
    contactTitle: '',
    contactDescription: '',
    locations: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    galleryTitle: '',
    galleryCategories: [],
    trustBadges: [],
    whyChooseUs: [],
    motto: '',
    history: '',
    specializations: [],
  }

  // Extract sections by heading
  const sections = extractSections(markdown)

  // Parse each section
  result.heroHeadline = sections['HEADLINE'] || sections['HERO HEADLINE'] || ''
  result.heroSubheadline = sections['SUBHEADLINE'] || sections['HERO SUBHEADLINE'] || ''
  result.heroBadge = sections['BADGE'] || sections['HERO BADGE'] || ''
  result.heroCta = sections['CTA'] || sections['HERO CTA'] || 'Contact Us'

  result.aboutTitle = sections['ABOUT TITLE'] || 'About Us'
  result.aboutDescription = sections['ABOUT'] || sections['ABOUT DESCRIPTION'] || ''

  result.servicesTitle = sections['SERVICES TITLE'] || 'Our Services'
  result.serviceDescriptions = parseServices(sections['SERVICES'] || '')

  result.teamTitle = sections['TEAM TITLE'] || 'Our Team'
  result.teamMembers = parseTeamMembers(sections['TEAM'] || sections['TEAM MEMBERS'] || '')

  result.testimonialsTitle = sections['TESTIMONIALS TITLE'] || 'What Our Clients Say'
  result.testimonials = parseTestimonials(sections['TESTIMONIALS'] || '')

  result.faqTitle = sections['FAQ TITLE'] || 'Frequently Asked Questions'
  result.faq = parseFaq(sections['FAQ'] || '')

  result.contactTitle = sections['CONTACT TITLE'] || 'Get In Touch'
  result.contactDescription = sections['CONTACT'] || sections['CONTACT DESCRIPTION'] || ''

  result.seoTitle = sections['SEO TITLE'] || ''
  result.seoDescription = sections['SEO DESCRIPTION'] || ''
  result.seoKeywords = parseKeywords(sections['SEO KEYWORDS'] || sections['KEYWORDS'] || '')

  result.galleryTitle = sections['GALLERY TITLE'] || 'Our Work'
  result.galleryCategories = parseGalleryCategories(sections['GALLERY'] || sections['GALLERY CATEGORIES'] || '')

  result.trustBadges = parseList(sections['TRUST BADGES'] || sections['BADGES'] || '')
  result.whyChooseUs = parseWhyChooseUs(sections['WHY CHOOSE US'] || sections['WHY US'] || '')

  result.motto = sections['MOTTO'] || sections['TAGLINE'] || ''
  result.history = sections['HISTORY'] || sections['ABOUT HISTORY'] || ''
  result.specializations = parseList(sections['SPECIALIZATIONS'] || sections['SPECIALITIES'] || '')

  // Extract TOUCH sections (industry-specific content blocks)
  result.additionalSections = []
  for (const [key, value] of Object.entries(sections)) {
    if (key.startsWith('TOUCH:') || key.startsWith('TOUCH ')) {
      const title = key.replace(/^TOUCH:?\s*/i, '').trim()
      if (title && value.trim()) {
        result.additionalSections.push({
          id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          type: 'content',
          title: title,
          content: value.trim(),
        })
      }
    }
  }

  return result
}

/**
 * Extract sections from markdown by ## headings
 */
function extractSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentSection = ''
  let currentContent: string[] = []

  for (const line of lines) {
    // Check for section heading (## HEADLINE or ## SERVICES)
    const headingMatch = line.match(/^##\s+(.+)$/)
    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = headingMatch[1].trim().toUpperCase()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim()
  }

  return sections
}

/**
 * Strip markdown formatting from text
 * Removes **, *, `, _, etc.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Bold **text**
    .replace(/\*(.+?)\*/g, '$1')       // Italic *text*
    .replace(/`(.+?)`/g, '$1')         // Code `text`
    .replace(/_(.+?)_/g, '$1')         // Italic _text_
    .replace(/~~(.+?)~~/g, '$1')       // Strikethrough ~~text~~
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links [text](url)
    .trim()
}

/**
 * Parse services from markdown list
 * Format: 1. Service Name: Description
 * Or: - Service Name: Description
 */
function parseServices(text: string): Array<{ title: string; description: string; priceTag?: string }> {
  const services: Array<{ title: string; description: string; priceTag?: string }> = []
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    // Match: 1. Title: Description or - Title: Description
    const match = line.match(/^(?:\d+\.\s*|-)\s*(.+?)(?:\s*\[(.+?)\])?\s*$/)
    if (match) {
      const fullTitle = stripMarkdown(match[1].trim())
      const priceTag = match[2]?.trim()

      // Split by colon if present
      const colonIndex = fullTitle.indexOf(':')
      if (colonIndex > 0) {
        const title = fullTitle.substring(0, colonIndex).trim()
        const description = stripMarkdown(fullTitle.substring(colonIndex + 1).trim())
        services.push({ title, description, priceTag })
      } else {
        services.push({ title: fullTitle, description: '', priceTag })
      }
    }
  }

  return services
}

/**
 * Parse team members from markdown
 * Format: 1. Name - Role or - Name (Role)
 */
function parseTeamMembers(text: string): Array<{ name: string; role: string; bio?: string }> {
  const members: Array<{ name: string; role: string; bio?: string }> = []
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    // Match: 1. Name - Role or - Name (Role)
    const match = line.match(/^(?:\d+\.\s*|-)\s*(.+?)(?:\s*[-–]\s*|\s*\()(.+?)(?:\))?\s*$/)
    if (match) {
      members.push({
        name: match[1].trim(),
        role: match[2].trim(),
      })
    }
  }

  return members
}

/**
 * Parse testimonials from markdown
 * Format: 1. "Quote text" - Name (5/5)
 */
function parseTestimonials(text: string): Array<{ name: string; text: string; rating: number; source: string }> {
  const testimonials: Array<{ name: string; text: string; rating: number; source: string }> = []
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    // Match: 1. "Quote" - Name (5/5) or - "Quote" - Name (5/5)
    const match = line.match(/^(?:\d+\.\s*|-)\s*[""](.+?)[""]\s*[-–]\s*(.+?)(?:\s*\((\d+)(?:\/\d+)?\))?\s*$/)
    if (match) {
      testimonials.push({
        text: match[1].trim(),
        name: match[2].trim(),
        rating: match[3] ? parseInt(match[3]) : 5,
        source: 'Google',
      })
    }
  }

  return testimonials
}

/**
 * Parse FAQ from markdown
 * Format: Q: Question\nA: Answer
 */
function parseFaq(text: string): Array<{ question: string; answer: string }> {
  const faq: Array<{ question: string; answer: string }> = []
  const lines = text.split('\n')
  let currentQuestion = ''
  let currentAnswer = ''

  for (const line of lines) {
    const qMatch = line.match(/^(?:Q:|Question:?)\s*(.+)$/i)
    const aMatch = line.match(/^(?:A:|Answer:?)\s*(.+)$/i)

    if (qMatch) {
      if (currentQuestion && currentAnswer) {
        faq.push({ question: currentQuestion, answer: currentAnswer.trim() })
      }
      currentQuestion = qMatch[1].trim()
      currentAnswer = ''
    } else if (aMatch) {
      currentAnswer = aMatch[1].trim()
    } else if (currentQuestion && line.trim()) {
      currentAnswer += ' ' + line.trim()
    }
  }

  // Save last FAQ
  if (currentQuestion && currentAnswer) {
    faq.push({ question: currentQuestion, answer: currentAnswer.trim() })
  }

  return faq
}

/**
 * Parse keywords from comma-separated text
 */
function parseKeywords(text: string): string[] {
  return text.split(',').map(k => k.trim()).filter(k => k.length > 0)
}

/**
 * Parse simple list items
 * Format: - Item or 1. Item
 */
function parseList(text: string): string[] {
  const items: string[] = []
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(?:\d+\.\s*|-)\s*(.+)$/)
    if (match) {
      items.push(match[1].trim())
    }
  }

  return items
}

/**
 * Parse gallery categories
 * Format: - Category: Description
 */
function parseGalleryCategories(text: string): Array<{ name: string; description: string }> {
  const categories: Array<{ name: string; description: string }> = []
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(?:\d+\.\s*|-)\s*(.+?)(?::\s*(.+))?$/)
    if (match) {
      categories.push({
        name: match[1].trim(),
        description: match[2]?.trim() || '',
      })
    }
  }

  return categories
}

/**
 * Parse "Why Choose Us" section
 * Format: - Title: Description
 */
function parseWhyChooseUs(text: string): Array<{ title: string; description: string }> {
  const items: Array<{ title: string; description: string }> = []
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(?:\d+\.\s*|-)\s*(.+?)(?::\s*(.+))?$/)
    if (match) {
      items.push({
        title: match[1].trim(),
        description: match[2]?.trim() || '',
      })
    }
  }

  return items
}
