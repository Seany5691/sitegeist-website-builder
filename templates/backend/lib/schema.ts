import { resolveSchemaType } from './schema-types'

export interface SiteConfigLike {
  businessName?: string
  ownerName?: string
  industry?: string
  schemaType?: string
  city?: string
  motto?: string
  history?: string
  foundingDate?: string
  priceRange?: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    jsonLd?: Record<string, unknown>
  }
  brandAssets?: {
    logoUrl?: string
  }
  contact?: {
    phone?: string
    whatsapp?: string
    email?: string
    address?: string
    postalCode?: string
  }
  geo?: {
    serviceAreas?: string[]
    region?: string
    latitude?: number
    longitude?: number
  }
  businessHours?: Array<{
    dayOfWeek: string
    opens: string
    closes: string
  }>
  services?: Array<{ title: string; description?: string }>
  faq?: Array<{ question: string; answer: string }>
  testimonials?: Array<{ text: string; name?: string; rating?: number }>
  socialLinks?: Record<string, string>
  team?: Array<{ name: string; role?: string; bio?: string }>
  contactForm?: { to?: string }
}

const DAY_MAP: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

/**
 * Normalize a phone number to E.164 so AI/voice systems can dial it.
 * South African local formats (0XX XXX XXXX, 27XXXXXXXXX, +27...) are
 * converted to +27XXXXXXXXX. Other numbers get a leading + if digits only.
 */
function normalizePhone(phone?: string): string {
  if (!phone) return ''
  const trimmed = String(phone).trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return ''

  // Already E.164-looking
  if (hasPlus) return `+${digits}`

  // South Africa: 0XXXXXXXXX -> +27XXXXXXXXX
  if (/^0\d{9}$/.test(digits)) return `+27${digits.slice(1)}`
  // 27XXXXXXXXX (already country code, missing +)
  if (/^27\d{9}$/.test(digits)) return `+${digits}`

  // Unknown region — return digits with + if it looks international
  return digits.length > 10 ? `+${digits}` : digits
}

/** Pull a plausible founding year out of free-text history copy. */
function inferFoundingYear(history?: string): string | undefined {
  if (!history) return undefined
  const match = history.match(/\b(19|20)\d{2}\b/)
  return match ? match[0] : undefined
}

function buildOpeningHours(hours?: SiteConfigLike['businessHours']) {
  if (!hours || hours.length === 0) return undefined

  return hours
    .filter((h) => h && h.opens && h.closes && h.opens.toLowerCase() !== 'closed')
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_MAP[h.dayOfWeek.toLowerCase()] || h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    }))
}

/**
 * Full LocalBusiness (or industry sub-type) JSON-LD graph.
 * Geo coordinates are included only when site-config.geo supplies them — never faked.
 */
export function localBusinessSchema(config: SiteConfigLike, baseUrl: string): Record<string, unknown> {
  const businessName = config.businessName || 'Business'
  const description =
    config.seo?.description || config.motto || `${businessName} — local business in ${config.city || 'South Africa'}.`
  const schemaType = resolveSchemaType(config.industry, config.schemaType)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: businessName,
    description,
    url: baseUrl,
    telephone: normalizePhone(config.contact?.phone),
  }

  if (config.contact?.email) schema.email = config.contact.email

  // Logo / image — improves entity disambiguation in AI + knowledge panels
  const logoUrl = config.brandAssets?.logoUrl
  if (logoUrl) {
    schema.logo = logoUrl
    schema.image = logoUrl
  }

  const city = config.city || ''
  const region = config.geo?.region || city
  const locality = city || region
  const streetAddress = config.contact?.address || ''
  // Only emit streetAddress when it adds information beyond the city name
  const distinctStreet = streetAddress && streetAddress.toLowerCase() !== locality.toLowerCase()
  if (streetAddress || locality) {
    const address: Record<string, unknown> = {
      '@type': 'PostalAddress',
      addressLocality: city || locality,
      addressRegion: region,
      addressCountry: 'ZA',
    }
    if (distinctStreet) address.streetAddress = streetAddress
    if (config.contact?.postalCode) address.postalCode = config.contact.postalCode
    schema.address = address
  }

  // Geo coordinates — only when explicitly provided
  if (typeof config.geo?.latitude === 'number' && typeof config.geo?.longitude === 'number') {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: config.geo.latitude,
      longitude: config.geo.longitude,
    }
  }

  // Founder / foundingDate — durable entity facts (avoid aging anniversary prose)
  const founderName = config.team?.[0]?.name || config.ownerName
  if (founderName) {
    schema.founder = {
      '@type': 'Person',
      name: founderName,
      ...(config.team?.[0]?.role ? { jobTitle: config.team[0].role } : {}),
    }
  }
  const foundingDate = config.foundingDate || inferFoundingYear(config.history)
  if (foundingDate) schema.foundingDate = foundingDate

  if (config.priceRange) schema.priceRange = config.priceRange

  const hours = buildOpeningHours(config.businessHours)
  if (hours && hours.length > 0) schema.openingHoursSpecification = hours

  if (config.geo?.serviceAreas && config.geo.serviceAreas.length > 0) {
    schema.areaServed = config.geo.serviceAreas.map((area) => ({
      '@type': 'City',
      name: area,
    }))
  } else if (locality) {
    // Fall back to the city so the top-level entity always declares service area
    schema.areaServed = { '@type': 'City', name: locality }
  }

  const sameAs = Object.values(config.socialLinks || {}).filter((u) => u && u.startsWith('http'))
  if (sameAs.length > 0) schema.sameAs = sameAs

  if (config.services && config.services.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `${businessName} Services`,
      itemListElement: config.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.description,
        },
      })),
    }
  }

  const ratings = (config.testimonials || [])
    .map((t) => (typeof t.rating === 'number' ? t.rating : null))
    .filter((r): r is number => r !== null && r >= 1 && r <= 5)

  if (ratings.length > 0) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: ratings.length,
    }
  }

  if (config.history) schema.foundingDescription = config.history

  return schema
}

export function faqPageSchema(config: SiteConfigLike): Record<string, unknown> | null {
  if (!config.faq || config.faq.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function serviceSchemas(config: SiteConfigLike, baseUrl: string): Record<string, unknown>[] {
  if (!config.services || config.services.length === 0) return []
  return config.services.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.description,
    provider: {
      '@type': 'LocalBusiness',
      name: config.businessName,
      url: baseUrl,
    },
    areaServed: config.geo?.serviceAreas?.map((a) => ({ '@type': 'City', name: a })) || {
      '@type': 'City',
      name: config.city || '',
    },
  }))
}

/** Speakable schema so voice assistants can read the business summary aloud. */
export function speakableSchema(config: SiteConfigLike): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-headline', '.business-description'],
    },
    name: config.seo?.title || config.businessName,
    description: config.seo?.description,
  }
}

/** All JSON-LD blocks for the page head. */
export function buildJsonLdGraph(config: SiteConfigLike, baseUrl: string): Array<Record<string, unknown>> {
  const blocks: Array<Record<string, unknown>> = [
    localBusinessSchema(config, baseUrl),
    speakableSchema(config),
  ]
  const faq = faqPageSchema(config)
  if (faq) blocks.push(faq)
  blocks.push(...serviceSchemas(config, baseUrl))
  return blocks
}
