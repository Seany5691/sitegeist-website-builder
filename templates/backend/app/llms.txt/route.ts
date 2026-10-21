import { NextResponse } from 'next/server'
import { loadJSON } from '@/lib/blob-storage'
import { SiteConfigLike } from '@/lib/schema'

export const dynamic = 'force-dynamic'

function formatHours(hours?: SiteConfigLike['businessHours']): string {
  if (!hours || hours.length === 0) return 'Contact for hours'
  return hours
    .map((h) => `${h.dayOfWeek}: ${h.opens.toLowerCase() === 'closed' ? 'Closed' : `${h.opens} – ${h.closes}`}`)
    .join('\n')
}

/**
 * /llms.txt — plain-text business summary for AI ingestion.
 * Spec: https://llmstxt.org — fast for models to parse.
 */
export async function GET() {
  let config: SiteConfigLike & Record<string, unknown> = {}
  try {
    config = (await loadJSON('site-config.json')) || {}
  } catch {
    config = {}
  }

  const businessName = config.businessName || 'Business'
  const description =
    config.seo?.description ||
    config.motto ||
    `${businessName}${config.city ? ` in ${config.city}` : ''}.`
  const services = config.services || []
  const contact = config.contact || {}
  const serviceAreas = config.geo?.serviceAreas || []

  const lines = [
    `# ${businessName}`,
    ``,
    `## About`,
    description,
    config.history ? `\n${config.history}` : null,
    ``,
    `## Services`,
    services.length > 0
      ? services.map((s) => `- **${s.title}**${s.description ? `: ${s.description}` : ''}`).join('\n')
      : '- Contact us for our full range of services',
    ``,
    `## Location`,
    config.city || config.geo?.region || 'South Africa',
    serviceAreas.length > 0 ? `\nService areas: ${serviceAreas.join(', ')}` : null,
    contact.address ? `\nAddress: ${contact.address}` : null,
    ``,
    `## Hours`,
    formatHours(config.businessHours),
    ``,
    `## Contact`,
    contact.phone ? `Phone: ${contact.phone}` : null,
    contact.email ? `Email: ${contact.email}` : null,
    contact.whatsapp ? `WhatsApp: ${contact.whatsapp}` : null,
    ``,
    `## More`,
    `- [Full business summary](/llms-full.txt)`,
    `- [Website sitemap](/sitemap.xml)`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return new NextResponse(lines + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
