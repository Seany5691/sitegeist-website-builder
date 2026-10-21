'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

function getYouTubeEmbedUrl(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
  }
  return null
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return `https://player.vimeo.com/video/${match[1]}`
  return null
}

export default function VideoEmbed() {
  const { config } = useSiteData()
  const videos = config?.videos || []

  if (videos.length === 0) return null

  return (
    <section id="videos" className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider section-subtitle" style={{ color: 'var(--safe-eyebrow)' }}>
            Watch
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            Videos
          </h2>
        </AnimateOnScroll>

        <div className="space-y-8">
          {videos.map((video, i) => {
            const embedUrl = getYouTubeEmbedUrl(video.url) || getVimeoEmbedUrl(video.url)
            if (!embedUrl) return null

            return (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={`Video ${i + 1}`}
                  />
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
