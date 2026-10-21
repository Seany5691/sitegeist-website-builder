import { MetadataRoute } from 'next'
import { ALLOWED_USER_AGENTS } from '@/lib/robots-ua-list'
import { getSiteUrl } from '@/lib/site-url'

/**
 * robots.txt — authorizes traditional search bots AND AI crawlers
 * so the business is discoverable by ChatGPT, Perplexity, Claude,
 * Google AI, Apple AI and other answer engines.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...ALLOWED_USER_AGENTS.map((userAgent) => ({ userAgent, allow: '/' as const })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
