import { NextResponse } from 'next/server'
import { loadJSON } from '@/lib/blob-storage'
import { SiteConfigLike } from '@/lib/schema'

export const dynamic = 'force-dynamic'

/**
 * /llms-full.txt — expanded narrative business summary for AI models
 * that want depth beyond /llms.txt.
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
    config.seo?.description || config.motto || `${businessName}${config.city ? ` in ${config.city}` : ''}.`

  const services = config.services || []
  const faq = config.faq || []
  const team = config.team || []
  const testimonials = config.testimonials || []
  const contact = config.contact || {}
  const serviceAreas = config.geo?.serviceAreas || []
  const specializations = (config as { specializations?: string[] }).specializations || []

  const parts: string[] = [
    `# ${businessName}`,
    ``,
    `> ${description}`,
    ``,
    `## About`,
    config.history ||
      `${businessName} is a local business serving ${config.city || 'its community'}${config.motto ? `. Motto: ${config.motto}` : '.'}`,
    ``,
  ]

  if (specializations.length > 0) {
    parts.push(`## Specializations`, ...specializations.map((s) => `- ${s}`), ``)
  }

  parts.push(`## Services`, ``)
  if (services.length > 0) {
    for (const s of services) {
      parts.push(`### ${s.title}`, s.description || '', ``)
    }
  } else {
    parts.push(`Contact us for our full range of services.`, ``)
  }

  if (team.length > 0) {
    parts.push(`## Team`, ``)
    for (const t of team) {
      parts.push(`- **${t.name}**${t.role ? ` — ${t.role}` : ''}${t.bio ? `\n  ${t.bio}` : ''}`)
    }
    parts.push(``)
  }

  if (testimonials.length > 0) {
    parts.push(`## What clients say`, ``)
    for (const t of testimonials.slice(0, 5)) {
      parts.push(`> ${t.text}`, `> — ${t.name || 'Client'}${t.rating ? ` (${t.rating}/5)` : ''}`, ``)
    }
  }

  if (faq.length > 0) {
    parts.push(`## Frequently asked questions`, ``)
    for (const q of faq) {
      parts.push(`### ${q.question}`, q.answer, ``)
    }
  }

  parts.push(
    `## Location`,
    config.city || config.geo?.region || 'South Africa',
    serviceAreas.length > 0 ? `\nService areas: ${serviceAreas.join(', ')}` : '',
    contact.address ? `\nAddress: ${contact.address}` : '',
    ``,
    `## Contact`,
    contact.phone ? `Phone: ${contact.phone}` : '',
    contact.email ? `Email: ${contact.email}` : '',
    contact.whatsapp ? `WhatsApp: ${contact.whatsapp}` : '',
    ``,
    `## Summary`,
    `- [Short summary](/llms.txt)`,
    `- [Sitemap](/sitemap.xml)`,
    ``
  )

  return new NextResponse(parts.filter((l) => l !== null).join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
