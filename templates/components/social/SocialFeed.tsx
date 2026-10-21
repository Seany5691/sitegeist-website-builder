'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/** Column count for a photo wall of n tiles — avoids a lone tile on the last row. */
function tileColCount(n: number): number {
  if (n <= 4) return Math.max(1, n)
  if (n === 5) return 3
  if (n === 6) return 3
  const candidates = [3, 4, 6]
  for (const c of candidates) if (n % c === 0) return c
  for (const c of candidates) if (n % c !== 1) return c
  return 3
}

/** Count-aware tile width (AnimateOnScroll wrapper is the flex item). */
function tileItemClass(n: number): string {
  const c = tileColCount(n)
  if (n <= 1) return 'w-full max-w-[280px]'
  if (c === 2) return 'w-[calc(50%_-_0.5rem)] max-w-[320px]'
  if (c === 3) return 'w-[calc(33.333%_-_0.667rem)]'
  if (c === 4) return 'w-[calc(25%_-_0.75rem)]'
  return 'w-[calc(16.666%_-_0.834rem)]'
}


const SOCIAL_ICON: Record<string, string> = {
  facebook: 'fa-facebook-f',
  instagram: 'fa-instagram',
  twitter: 'fa-twitter',
  x: 'fa-x-twitter',
  linkedin: 'fa-linkedin-in',
  youtube: 'fa-youtube',
  tiktok: 'fa-tiktok',
  pinterest: 'fa-pinterest-p',
}

function normalizeLinks(socialLinks: any): { platform: string; url: string }[] {
  if (!socialLinks) return []
  if (Array.isArray(socialLinks)) {
    return socialLinks
      .map((l: any) => ({ platform: String(l.platform || l.name || '').toLowerCase(), url: l.url || l.href || '' }))
      .filter(l => l.platform && l.url)
  }
  if (typeof socialLinks === 'object') {
    return Object.entries(socialLinks)
      .map(([platform, url]) => ({ platform: platform.toLowerCase(), url: String(url || '') }))
      .filter(l => l.url)
  }
  return []
}

export default function SocialFeed() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const instagramFeed = config?.instagramFeed
  const images = Array.isArray(instagramFeed) ? instagramFeed.filter(Boolean) : []
  const links = normalizeLinks(config?.socialLinks)

  if (images.length === 0 && links.length === 0) return null

  const title = config?.socialTitle || pc.socialTitle || (images.length > 0 ? 'Follow Along' : 'Connect With Us')
  const subtitle = config?.socialSubtitle || pc.socialSubtitle || 'Social'

  return (
    <section id="social" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        {images.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-center gap-4">
              {images.map((url: string, i: number) => (
                <AnimateOnScroll key={i} delay={i * 60} className={tileItemClass(images.length)}>
                  <a href={links.find(l => l.platform === 'instagram')?.url || undefined}
                    target="_blank" rel="noopener noreferrer"
                    className="block rounded-2xl overflow-hidden aspect-square hover-zoom">
                    <img src={url} alt="" loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  </a>
                </AnimateOnScroll>
              ))}
            </div>
            {links.length > 0 && (
              <AnimateOnScroll delay={150} className="flex flex-wrap justify-center gap-4 mt-10">
                {links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 hover-lift"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                      color: 'var(--color-primary)',
                    }}>
                    <i className={`fab ${SOCIAL_ICON[link.platform] || 'fa-link'}`} aria-hidden="true"></i>
                  </a>
                ))}
              </AnimateOnScroll>
            )}
          </>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {links.map((link, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  aria-label={link.platform}
                  className="group w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover-lift"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                    color: 'var(--color-primary)',
                  }}>
                  <i className={`fab ${SOCIAL_ICON[link.platform] || 'fa-link'} text-2xl transition-transform duration-300 group-hover:scale-110`} aria-hidden="true"></i>
                </a>
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
