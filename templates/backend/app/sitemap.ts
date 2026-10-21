import { MetadataRoute } from 'next'
import { loadJSON } from '@/lib/blob-storage'
import { getSiteUrl } from '@/lib/site-url'

/**
 * Dynamic XML sitemap for every deployment.
 * Base URL is resolved from the request Host so domain swaps need no rebuild.
 * lastModified comes from site-config when available.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  let lastMod = new Date()
  try {
    const config = await loadJSON('site-config.json')
    if (config?.updatedAt) {
      const parsed = new Date(config.updatedAt)
      if (!isNaN(parsed.getTime())) lastMod = parsed
    }
  } catch {
    // fall back to now
  }

  return [
    {
      url: baseUrl,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
