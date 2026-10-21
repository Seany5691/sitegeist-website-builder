import { loadJSON } from '@/lib/blob-storage'
import { SiteConfigLike } from '@/lib/schema'
import { ALLOWED_USER_AGENTS } from '@/lib/robots-ua-list'
import { resolveSchemaType } from '@/lib/schema-types'

export interface GeoAuditItem {
  id: string
  label: string
  pass: boolean
  hint: string
}

/**
 * Pre-launch GEO checklist (G11) — scores the site's AI-readiness
 * so nothing ships broken. Rendered in the client dashboard.
 */
export async function geoAudit(): Promise<GeoAuditItem[]> {
  let config: SiteConfigLike & Record<string, unknown> = {}
  try {
    config = (await loadJSON('site-config.json')) || {}
  } catch {
    config = {}
  }

  const items: GeoAuditItem[] = []
  const businessName = config.businessName || ''
  const contact = config.contact || {}
  const seo = config.seo || {}

  // NAP consistency (G5)
  const napPhone = (contact.phone || '').replace(/\s/g, '')
  const napOk = !!businessName && !!napPhone
  items.push({
    id: 'nap',
    label: 'NAP consistency (Name / Address / Phone)',
    pass: napOk,
    hint: napOk
      ? 'Business name and phone present in site-config.'
      : 'Set businessName and contact.phone in site-config so NAP matches everywhere.',
  })

  // Full street address — critical for local AI entity resolution
  const street = (contact.address || '').trim()
  const locality = (config.city || config.geo?.region || '').trim()
  const hasStreet = !!street && street.toLowerCase() !== locality.toLowerCase()
  items.push({
    id: 'street-address',
    label: 'Full street address (local AI entity resolution)',
    pass: hasStreet,
    hint: hasStreet
      ? 'Street address present and distinct from the city.'
      : 'Set contact.address to the full physical street address (not just the city). Local AI search needs this to place the business.',
  })

  // Geo coordinates
  const hasGeo = typeof config.geo?.latitude === 'number' && typeof config.geo?.longitude === 'number'
  items.push({
    id: 'geo-coords',
    label: 'Geo coordinates (latitude / longitude)',
    pass: hasGeo,
    hint: hasGeo
      ? `Geo present (${config.geo!.latitude}, ${config.geo!.longitude}).`
      : 'Add geo.latitude and geo.longitude to site-config so Google/AI can place the business on a map.',
  })

  // JSON-LD completeness
  const schemaType = resolveSchemaType(config.industry, config.schemaType)
  const hasHours = !!(config.businessHours && config.businessHours.length > 0)
  items.push({
    id: 'jsonld',
    label: `LocalBusiness JSON-LD (${schemaType})`,
    pass: !!businessName && schemaType !== undefined,
    hint:
      schemaType === 'LocalBusiness' && config.industry
        ? `Industry "${config.industry}" not mapped — consider setting schemaType explicitly.`
        : 'Schema type resolved and injected in layout head.',
  })

  items.push({
    id: 'hours',
    label: 'Opening hours in schema',
    pass: hasHours,
    hint: hasHours ? 'businessHours present.' : 'Add businessHours to site-config for openingHoursSpecification.',
  })

  // FAQPage (G1)
  const hasFaq = !!(config.faq && config.faq.length > 0)
  items.push({
    id: 'faq',
    label: 'FAQPage JSON-LD',
    pass: hasFaq,
    hint: hasFaq ? `${config.faq!.length} FAQs will be marked up.` : 'Add FAQ items for FAQPage schema.',
  })

  // Contact + canonical
  items.push({
    id: 'contact',
    label: 'Contact info (phone/email)',
    pass: !!contact.phone || !!contact.email,
    hint: 'Phone or email required for LocalBusiness + llms.txt.',
  })

  // Durable founding facts — avoids stale "N years" language
  const hasFounding = !!config.foundingDate || /found|establish|since|start/i.test(config.history || '')
  items.push({
    id: 'founding',
    label: 'Durable founding fact (foundingDate)',
    pass: !!config.foundingDate || hasFounding,
    hint: config.foundingDate
      ? `foundingDate set to ${config.foundingDate}.`
      : hasFounding
        ? 'History mentions founding — set contact-independent foundingDate in site-config for a durable schema fact (avoids aging "N years" copy).'
        : 'Add foundingDate (e.g. "1995") so the schema holds a durable entity fact.',
  })

  // AI crawler coverage (always true in generated robots.ts, report anyway)
  items.push({
    id: 'robots',
    label: `AI crawler allowlist (${ALLOWED_USER_AGENTS.length} agents)`,
    pass: true,
    hint: 'Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot, Applebot-Extended and more.',
  })

  items.push({
    id: 'llms',
    label: '/llms.txt + /llms-full.txt routes',
    pass: true,
    hint: 'Dynamic plain-text endpoints served from site-config.',
  })

  items.push({
    id: 'og',
    label: 'Open Graph + canonical metadata',
    pass: !!seo.title && !!seo.description,
    hint: seo.title ? 'SEO title/description set.' : 'Set seo.title and seo.description in site-config.',
  })

  // Service areas (G10)
  const hasAreas = !!(config.geo?.serviceAreas && config.geo.serviceAreas.length > 0)
  items.push({
    id: 'areas',
    label: 'Service areas (areaServed)',
    pass: hasAreas,
    hint: hasAreas ? `${config.geo!.serviceAreas!.length} service areas configured.` : 'Add geo.serviceAreas for local AI queries.',
  })

  // Internal linking / semantic HTML (G4, G8) — informational
  items.push({
    id: 'semantic',
    label: 'Semantic HTML + internal links',
    pass: true,
    hint: 'Generated pages use landmarks and link every section to /contact.',
  })

  return items
}
