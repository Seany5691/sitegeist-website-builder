'use client'

/**
 * ServiceDetailContent — the main content area for a service sub-page.
 * Shows paragraphs, images, and any additional content for the service.
 */

import { useSiteData } from '@/lib/use-site-data'

interface Props {
  service: {
    slug?: string
    label?: string
    headline?: string
    description?: string
    content?: string
    paragraphs?: string[]
    image?: string
    imageUrl?: string
    features?: string[]
  }
}

export default function ServiceDetailContent({ service }: Props) {
  const { config } = useSiteData()

  // Build paragraphs from content (newlines) or explicit paragraphs array
  const content = service.content || service.description || ''
  const paragraphs = service.paragraphs || (content ? content.split('\n').filter((p: string) => p.trim()) : [])
  const features = service.features || []
  const image = service.image || service.imageUrl || ''

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main image */}
        {image && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={image}
              alt={service.headline || service.label || 'Service'}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {/* Paragraphs */}
        {paragraphs.map((p: string, i: number) => (
          <p
            key={i}
            className="text-base sm:text-lg leading-relaxed mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            {p}
          </p>
        ))}

        {/* Features list */}
        {features.length > 0 && (
          <div className="mt-8 mb-8">
            <h3
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
            >
              What&apos;s Included
            </h3>
            <ul className="space-y-3">
              {features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    ✓
                  </span>
                  <span style={{ color: 'var(--color-text)' }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
