import type { Metadata } from 'next'
import { loadJSON } from '@/lib/blob-storage'
import { getSiteUrl, siteUrl } from '@/lib/site-url'

export type PageKey = 'home' | 'services' | 'portfolio' | 'about' | 'contact'

/**
 * Build page metadata from site content so clients can change
 * titles/descriptions from the dashboard SEO + Page Content sections.
 * Includes canonical URLs, Open Graph and Twitter cards (item 13).
 */
export async function buildPageMetadata(
  page: PageKey,
  fallbackTitle: string,
  path?: string
): Promise<Metadata> {
  const base = getSiteUrl()

  try {
    const config = await loadJSON('site-config.json') || {}
    const businessName = config.businessName || 'Website'
    const seo = config.seo || {}
    const pc = config.pageContent || {}

    const titleMap: Record<PageKey, string> = {
      home: seo.title || `${businessName}`,
      services: pc.servicesTitle ? `${pc.servicesTitle} | ${businessName}` : fallbackTitle,
      portfolio: pc.portfolioTitle ? `${pc.portfolioTitle} | ${businessName}` : fallbackTitle,
      about: `${config.pageHeroes?.about?.title || 'About'} | ${businessName}`,
      contact: pc.contactTitle ? `${pc.contactTitle} | ${businessName}` : fallbackTitle,
    }

    const descriptionMap: Record<PageKey, string> = {
      home: seo.description || '',
      services: pc.servicesDescription || seo.description || '',
      portfolio: pc.portfolioDescription || seo.description || '',
      about: config.pageHeroes?.about?.subtitle || seo.description || '',
      contact: pc.contactDescription || seo.description || '',
    }

    const title = titleMap[page] || fallbackTitle
    const description = descriptionMap[page] || undefined
    const canonical = siteUrl(path ?? (page === 'home' ? '/' : `/${page}`))

    return {
      metadataBase: new URL(base),
      title,
      description,
      keywords: Array.isArray(seo.keywords) ? seo.keywords : undefined,
      alternates: {
        canonical,
      },
      openGraph: {
        title: seo.openGraph?.title || title,
        description: seo.openGraph?.description || description || '',
        url: canonical,
        siteName: businessName,
        type: (seo.openGraph?.type as 'website') || 'website',
        images: [{ url: siteUrl('/opengraph-image'), width: 1200, height: 630, alt: businessName }],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.twitter?.title || seo.openGraph?.title || title,
        description: seo.twitter?.description || seo.openGraph?.description || description || '',
        images: [siteUrl('/opengraph-image')],
      },
      robots: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    }
  } catch {
    return {
      metadataBase: new URL(getSiteUrl()),
      title: fallbackTitle,
      alternates: { canonical: siteUrl(path ?? '/') },
    }
  }
}

/** Root-layout metadata generator shared by every generated site. */
export async function buildRootMetadata(): Promise<Metadata> {
  return buildPageMetadata('home', 'Website', '/')
}
